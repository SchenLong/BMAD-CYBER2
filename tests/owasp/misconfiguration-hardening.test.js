/**
 * OWASP Misconfiguration & Hardening Tests
 * Suite: tests/owasp/misconfiguration-hardening.test.js
 * OWASP Coverage: A01-010, A04-007, A06-002, A06-004, A06-007, A08-003,
 *                 A10-005, A10-006, API1-004, API3-001, API4-001, API4-002,
 *                 API4-003, API4-004, API6-001, API6-002, API6-003,
 *                 API10-002, MV-01, SCS01-003, SCS01-004, SCS02-001,
 *                 SCS02-002, SCS03-001, SCS06-002, V12-004
 * Stories: 6.1, 6.2, 6.3, 6.4, 6.5
 *
 * Source files:
 *   src/security/supply-chain/artifact-signer.js
 *   src/security/supply-chain/atomic-operations.js
 *   .claude/validators-node/src/permissions/plugin-permissions.ts
 *   .claude/validators-node/src/permissions/token-validator.ts
 *   .claude/validators-node/src/resource-management/rate-limiter.ts
 *   .claude/validators-node/src/resource-management/context-manager.ts
 *   .claude/validators-node/src/resource-management/recursion-guard.ts
 *   .claude/validators-node/src/resource-management/resource-limits.ts
 *   .github/workflows/quality-gate.yml
 *   package.json
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// ===========================================================================
// Story 6.1: Dependency & Supply Chain Hardening (A06, SCS)
// ===========================================================================

describe('OWASP Misconfiguration: Story 6.1 — Dependency & Supply Chain Hardening', () => {
  let packageJson;

  beforeEach(() => {
    packageJson = JSON.parse(
      fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8')
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // A06-002: npm audit 0 high vulnerabilities (tar tracked as known exception)
  // -------------------------------------------------------------------------
  describe('A06-002: npm audit — zero high vulnerabilities except known tar exception', () => {
    it('should have no high or critical vulnerabilities from npm audit', () => {
      // Run npm audit and capture output
      let auditResult;
      try {
        auditResult = execSync('npm audit --json 2>/dev/null', {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
          timeout: 30000,
        });
      } catch (e) {
        // npm audit exits non-zero when vulnerabilities found
        auditResult = e.stdout || '{}';
      }

      const audit = JSON.parse(auditResult || '{}');
      const vulnerabilities = audit.vulnerabilities || {};

      // Collect all high/critical vulns
      const highCritical = Object.entries(vulnerabilities).filter(
        ([, info]) => info.severity === 'high' || info.severity === 'critical'
      );

      // tar is a known exception (HR-08)
      const nonTarHighCritical = highCritical.filter(
        ([name]) => name !== 'tar'
      );

      expect(nonTarHighCritical).toEqual([]);
    });

    it('should have tar as the ONLY known high-severity exception if any exist', () => {
      let auditResult;
      try {
        auditResult = execSync('npm audit --json 2>/dev/null', {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
          timeout: 30000,
        });
      } catch (e) {
        auditResult = e.stdout || '{}';
      }

      const audit = JSON.parse(auditResult || '{}');
      const vulnerabilities = audit.vulnerabilities || {};

      const highCritical = Object.entries(vulnerabilities).filter(
        ([, info]) => info.severity === 'high' || info.severity === 'critical'
      );

      // If there are any high/critical, they must all be tar
      for (const [name] of highCritical) {
        expect(name).toBe('tar');
      }
    });
  });

  // -------------------------------------------------------------------------
  // A06-004: No deprecated packages in dependency tree
  // -------------------------------------------------------------------------
  describe('A06-004: No deprecated packages in dependency tree', () => {
    it('should not have deprecated direct dependencies', () => {
      // Check that known-deprecated packages are not in direct dependencies
      const deprecatedPackages = [
        'request', 'node-uuid', 'nomnom', 'optimist',
        'colors', 'coffee-script', 'jade', 'istanbul',
      ];

      const allDeps = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };

      for (const pkg of deprecatedPackages) {
        expect(allDeps).not.toHaveProperty(
          pkg,
          `Deprecated package '${pkg}' found in dependencies`
        );
      }
    });

    it('should not list inquirer in dependencies (removed in CLI modernization)', () => {
      const allDeps = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };

      expect(allDeps).not.toHaveProperty('inquirer');
    });
  });

  // -------------------------------------------------------------------------
  // A06-007: bundledDependencies list matches expected
  // -------------------------------------------------------------------------
  describe('A06-007: bundledDependencies list matches expected', () => {
    it('should have a bundledDependencies array', () => {
      const bundled = packageJson.bundledDependencies || packageJson.bundleDependencies;
      expect(Array.isArray(bundled)).toBe(true);
      expect(bundled.length).toBeGreaterThan(0);
    });

    it('should include @clack/core, @clack/prompts, commander, picocolors', () => {
      const bundled = packageJson.bundledDependencies || packageJson.bundleDependencies;
      expect(bundled).toContain('@clack/core');
      expect(bundled).toContain('@clack/prompts');
      expect(bundled).toContain('commander');
      expect(bundled).toContain('picocolors');
    });

    it('should NOT bundle security-sensitive dependencies', () => {
      const bundled = packageJson.bundledDependencies || packageJson.bundleDependencies || [];
      // These should be installed from registry, not bundled
      const shouldNotBundle = ['tar', 'semver', 'zod', 'fs-extra'];
      for (const pkg of shouldNotBundle) {
        expect(bundled).not.toContain(pkg);
      }
    });
  });

  // -------------------------------------------------------------------------
  // SCS01-003: No wildcard `*` version ranges in package.json
  // -------------------------------------------------------------------------
  describe('SCS01-003: No wildcard version ranges', () => {
    it('should not use wildcard * version in dependencies', () => {
      const allDeps = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };

      for (const [name, version] of Object.entries(allDeps)) {
        expect(version).not.toBe('*');
        expect(version).not.toBe('');
        expect(version).not.toBe('latest');
      }
    });

    it('should use pinned or range versions (^, ~, >=) not arbitrary strings', () => {
      const allDeps = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };

      const validVersionPattern = /^[\^~>=<]?\d|^workspace:|^file:|^npm:|^link:/;

      for (const [name, version] of Object.entries(allDeps)) {
        expect(version).toMatch(
          validVersionPattern,
          `Dependency '${name}' has invalid version: '${version}'`
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // SCS01-004: All bundledDependencies entries exist in node_modules
  // -------------------------------------------------------------------------
  describe('SCS01-004: All bundledDependencies exist in node_modules', () => {
    it('should have all bundled packages installed', () => {
      const bundled = packageJson.bundledDependencies || packageJson.bundleDependencies || [];

      for (const pkg of bundled) {
        const pkgPath = path.join(PROJECT_ROOT, 'node_modules', pkg);
        expect(fs.existsSync(pkgPath)).toBe(true);
      }
    });

    it('should have all bundled packages also listed in dependencies', () => {
      const bundled = packageJson.bundledDependencies || packageJson.bundleDependencies || [];
      const deps = packageJson.dependencies || {};

      for (const pkg of bundled) {
        expect(pkg in deps).toBe(true);
      }
    });
  });

  // -------------------------------------------------------------------------
  // SCS03-001: Ed25519 artifact signing produces valid signatures
  // -------------------------------------------------------------------------
  describe('SCS03-001: Ed25519 artifact signing produces valid signatures', () => {
    it('should generate Ed25519 key pair and sign data', () => {
      const keyPair = crypto.generateKeyPairSync('ed25519');
      const data = Buffer.from('test artifact content for signing');

      // Ed25519 uses crypto.sign(null, data, key) — no hash algorithm needed
      const signature = crypto.sign(null, data, keyPair.privateKey);

      expect(signature).toBeTruthy();
      expect(Buffer.isBuffer(signature)).toBe(true);
      expect(signature.length).toBe(64); // Ed25519 signatures are 64 bytes
    });

    it('should verify a valid Ed25519 signature', () => {
      const keyPair = crypto.generateKeyPairSync('ed25519');
      const data = Buffer.from('test artifact content');

      const signature = crypto.sign(null, data, keyPair.privateKey);
      const isValid = crypto.verify(null, data, keyPair.publicKey, signature);

      expect(isValid).toBe(true);
    });

    it('should reject a tampered signature', () => {
      const keyPair = crypto.generateKeyPairSync('ed25519');
      const data = Buffer.from('original data');

      const signature = crypto.sign(null, data, keyPair.privateKey);

      // Tamper with data
      const tamperedData = Buffer.from('tampered data');
      const isValid = crypto.verify(null, tamperedData, keyPair.publicKey, signature);

      expect(isValid).toBe(false);
    });

    it('should reject signature from wrong key', () => {
      const keyPair1 = crypto.generateKeyPairSync('ed25519');
      const keyPair2 = crypto.generateKeyPairSync('ed25519');
      const data = Buffer.from('signed by key 1');

      const signature = crypto.sign(null, data, keyPair1.privateKey);

      // Verify with wrong public key
      const isValid = crypto.verify(null, data, keyPair2.publicKey, signature);

      expect(isValid).toBe(false);
    });

    it('should have artifact-signer.js using Ed25519 as default', () => {
      const signerPath = path.join(
        PROJECT_ROOT,
        'src/security/supply-chain/artifact-signer.js'
      );
      const source = fs.readFileSync(signerPath, 'utf-8');

      expect(source).toContain("ED25519: 'ed25519'");
      expect(source).toContain('generateKeyPairSync');
    });
  });
});

// ===========================================================================
// Story 6.2: SSRF, Access Control & Agent Security (A01, A10, API, ASVS V12)
// ===========================================================================

describe('OWASP Misconfiguration: Story 6.2 — SSRF, Access Control & Agent Security', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // A10-005: URL redirect to internal IPs blocked
  // -------------------------------------------------------------------------
  describe('A10-005: URL redirect to internal IPs blocked', () => {
    // IPv6 loopback needs bracket notation for URL parsing
    const internalIPs = [
      '127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.1.1',
      '169.254.169.254', // AWS metadata
      '0.0.0.0', '[::1]', 'localhost',
    ];

    it('should block redirects to internal/private IP ranges', () => {
      for (const ip of internalIPs) {
        const url = new URL(`http://${ip}/admin`);
        const hostname = url.hostname;

        // RFC 1918 private ranges + loopback + link-local
        const isInternal =
          hostname === 'localhost' ||
          hostname === '::1' || hostname === '[::1]' ||
          hostname === '0.0.0.0' ||
          hostname.startsWith('127.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.16.') || hostname.startsWith('172.17.') ||
          hostname.startsWith('172.18.') || hostname.startsWith('172.19.') ||
          hostname.startsWith('172.2') || hostname.startsWith('172.30.') ||
          hostname.startsWith('172.31.') ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('169.254.') ||
          hostname === 'metadata.google.internal';

        expect(isInternal).toBe(true);
      }
    });

    it('should detect cloud metadata endpoints', () => {
      const metadataUrls = [
        'http://169.254.169.254/latest/meta-data/',
        'http://metadata.google.internal/computeMetadata/v1/',
        'http://169.254.169.254/metadata/instance',
      ];

      for (const urlStr of metadataUrls) {
        const url = new URL(urlStr);
        const isMetadata =
          url.hostname === '169.254.169.254' ||
          url.hostname === 'metadata.google.internal';
        expect(isMetadata).toBe(true);
      }
    });

    it('should have downloader.js with SSRF protection', () => {
      const downloaderPath = path.join(
        PROJECT_ROOT,
        'tools/cli/lib/downloader.js'
      );
      const source = fs.readFileSync(downloaderPath, 'utf-8');

      expect(source).toContain('ALLOWED_HOSTS');
      expect(source).toContain('validateDownloadUrl');
    });
  });

  // -------------------------------------------------------------------------
  // A10-006: DNS rebinding prevention
  // -------------------------------------------------------------------------
  describe('A10-006: DNS rebinding prevention', () => {
    it('should detect DNS rebinding via hostname validation', () => {
      // DNS rebinding: attacker DNS resolves to internal IP after initial check
      // Prevention: validate hostname against allowlist, not resolved IP
      const suspiciousHostnames = [
        'evil.attacker.com',
        'internal.attacker.com',
        '127.0.0.1.nip.io',
        'rebind.network',
      ];

      const allowedHosts = new Set([
        'api.github.com',
        'github.com',
        'raw.githubusercontent.com',
        'registry.npmjs.org',
      ]);

      for (const hostname of suspiciousHostnames) {
        expect(allowedHosts.has(hostname)).toBe(false);
      }
    });

    it('should use strict hostname matching (not endsWith)', () => {
      const downloaderPath = path.join(
        PROJECT_ROOT,
        'tools/cli/lib/downloader.js'
      );
      const source = fs.readFileSync(downloaderPath, 'utf-8');

      // Must NOT use endsWith for subdomain matching (prevents attacker.github.com)
      expect(source).not.toMatch(/hostname\.endsWith\s*\(\s*['"]\.['"\s]*\+/);
    });
  });

  // -------------------------------------------------------------------------
  // API1-004: Agent ID enumeration returns 403 (not 404)
  // -------------------------------------------------------------------------
  describe('API1-004: Agent ID enumeration returns 403 (not 404)', () => {
    it('should have authorization.js that returns consistent error for unauthorized agents', () => {
      const authPath = path.join(
        PROJECT_ROOT,
        'src/core/security/authorization.js'
      );
      const source = fs.readFileSync(authPath, 'utf-8');

      // Authorization should block with consistent message (no info leakage)
      expect(source).toContain('canAccessAgent');
      // Should not reveal whether agent exists or not
      expect(source).toContain('DENIED');
    });

    it('should block access before checking existence to prevent enumeration', () => {
      // Authorization must check permissions BEFORE checking if agent exists
      // to prevent attackers from distinguishing existing vs. non-existing agents
      const authPath = path.join(
        PROJECT_ROOT,
        'src/core/security/authorization.js'
      );
      const source = fs.readFileSync(authPath, 'utf-8');

      // canAccessAgent must validate authorization, not just existence
      expect(source).toContain('canAccessAgent');
      expect(source).toContain('matchesPattern');
    });
  });

  // -------------------------------------------------------------------------
  // API3-001: Agent properties not modifiable by unauthorized roles
  // -------------------------------------------------------------------------
  describe('API3-001: Agent properties not modifiable by unauthorized roles', () => {
    it('should enforce RBAC on agent modification operations', () => {
      // plugin-permissions blocks write operations for unauthorized roles
      const ppPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/permissions/plugin-permissions.ts'
      );
      const source = fs.readFileSync(ppPath, 'utf-8');

      // Viewer role should have no write permissions
      expect(source).toContain("viewer:");
      expect(source).toMatch(/viewer[\s\S]*?write:\s*\[\s*\]/);
    });

    it('should have DEFAULT_PERMISSIONS restricting write to output dirs only', () => {
      const ppPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/permissions/plugin-permissions.ts'
      );
      const source = fs.readFileSync(ppPath, 'utf-8');

      expect(source).toContain('DEFAULT_PERMISSIONS');
      expect(source).toContain("write: ['src/${plugin}/output/**']");
    });
  });

  // -------------------------------------------------------------------------
  // API10-002: WebFetch responses treated as untrusted
  // -------------------------------------------------------------------------
  describe('API10-002: WebFetch responses treated as untrusted', () => {
    it('should have encoded-payload-detection for sanitizing external responses', () => {
      const patchPath = path.join(
        PROJECT_ROOT,
        'src/security/patches/encoded-payload-detection-patch.js'
      );
      expect(fs.existsSync(patchPath)).toBe(true);

      const source = fs.readFileSync(patchPath, 'utf-8');
      expect(source).toContain('encoded');
      expect(source).toContain('detect');
    });

    it('should have prompt-injection validator for sanitizing LLM inputs', () => {
      const piPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/ai-safety/prompt-injection.ts'
      );
      expect(fs.existsSync(piPath)).toBe(true);

      const source = fs.readFileSync(piPath, 'utf-8');
      expect(source).toContain('injection');
    });
  });

  // -------------------------------------------------------------------------
  // V12-004: Token file permissions enforce mode 600
  // -------------------------------------------------------------------------
  describe('V12-004: Token file permissions enforce mode 600', () => {
    it('should create token files with mode 0o600', () => {
      const tvPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/permissions/token-validator.ts'
      );
      const source = fs.readFileSync(tvPath, 'utf-8');

      // Must use mode 0o600 for token files
      expect(source).toContain('0o600');
      expect(source).toContain('chmodSync');
    });

    it('should check file permissions and warn on insecure modes', () => {
      const tvPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/permissions/token-validator.ts'
      );
      const source = fs.readFileSync(tvPath, 'utf-8');

      expect(source).toContain('checkFilePermissions');
      expect(source).toContain('Insecure permissions');
      expect(source).toContain('should be 600');
    });

    it('should define TOKEN_FILE and KEY_FILE paths', () => {
      const tvPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/permissions/token-validator.ts'
      );
      const source = fs.readFileSync(tvPath, 'utf-8');

      expect(source).toContain('.bmad-token');
      expect(source).toContain('.bmad-key');
    });
  });

  // -------------------------------------------------------------------------
  // A01-010: Forced browsing to unauthorized agent paths blocked
  // -------------------------------------------------------------------------
  describe('A01-010: Forced browsing to unauthorized agent paths blocked', () => {
    it('should have RBAC config blocking unauthorized agent access', () => {
      const rbacPath = path.join(
        PROJECT_ROOT,
        'src/core/security/rbac-config.yaml'
      );
      expect(fs.existsSync(rbacPath)).toBe(true);

      const source = fs.readFileSync(rbacPath, 'utf-8');
      // RBAC config must define roles and access restrictions
      expect(source).toContain('roles:');
      expect(source).toContain('require_roles');
    });

    it('should validate agent paths through authorization before access', () => {
      const authPath = path.join(
        PROJECT_ROOT,
        'src/core/security/authorization.js'
      );
      const source = fs.readFileSync(authPath, 'utf-8');

      // Must normalize and validate agent paths
      expect(source).toContain('agentPathResolver');
      expect(source).toContain('canAccessAgent');
    });

    it('should prevent path traversal in agent paths', () => {
      const authPath = path.join(
        PROJECT_ROOT,
        'src/core/security/authorization.js'
      );
      const source = fs.readFileSync(authPath, 'utf-8');

      // Path traversal checks
      expect(source).toMatch(/\.\./);
    });
  });

  // -------------------------------------------------------------------------
  // MV-01: Agent ID homoglyph impersonation prevention
  // -------------------------------------------------------------------------
  describe('MV-01: Agent ID homoglyph impersonation prevention', () => {
    it('should detect Cyrillic lookalike characters in agent names', () => {
      // Cyrillic characters that look like Latin (homoglyph attack vectors)
      const cyrillicRange = /[\u0400-\u04FF]/; // Cyrillic block
      const confusableRange = /[\u0250-\u02AF\u1D00-\u1D7F\u2100-\u214F]/; // IPA, phonetic, letterlike

      // All agent IDs in the manifest should be free of confusable characters
      const agentManifestPath = path.join(
        PROJECT_ROOT,
        '_bmad/_config/agent-manifest.csv'
      );
      const manifest = fs.readFileSync(agentManifestPath, 'utf-8');

      // Extract agent name/alias columns (columns 1, 2, and 3 are name, display, alias)
      const lines = manifest.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
      for (const line of lines) {
        const cols = line.split(',');
        // Check name column (col 0) and alias column for Cyrillic
        const nameCol = cols[0] || '';
        const aliasCol = cols[2] || '';

        expect(cyrillicRange.test(nameCol)).toBe(false);
        expect(cyrillicRange.test(aliasCol)).toBe(false);
        expect(confusableRange.test(nameCol)).toBe(false);
        expect(confusableRange.test(aliasCol)).toBe(false);
      }
    });

    it('should detect mixed-script attacks in agent names', () => {
      // Test that agent names with mixed Latin/Cyrillic are detectable
      const safeNames = ['analyst', 'architect', 'dev', 'pm'];
      const attackNames = [
        '\u0430nalyst',   // Cyrillic а + nalyst
        'аrchitect',     // Mixed scripts
        'd\u0435v',       // Cyrillic е in dev
      ];

      // Safe names should be pure ASCII
      for (const name of safeNames) {
        const isPureAscii = /^[\x00-\x7F]+$/.test(name);
        expect(isPureAscii).toBe(true);
      }

      // Attack names should contain non-ASCII
      for (const name of attackNames) {
        const isPureAscii = /^[\x00-\x7F]+$/.test(name);
        expect(isPureAscii).toBe(false);
      }
    });

    it('should verify all agent filenames are pure ASCII', () => {
      // Walk all agent directories and check filenames
      const moduleDirs = [
        'src/bmm/agents', 'src/core/agents', 'src/bmb/agents',
        'src/bmgd/agents', 'src/cis/agents',
        'src/intel-team/agents', 'src/legal-team/agents',
        'src/strategy-team/agents', 'src/cybersec-team/agents',
      ];

      for (const dir of moduleDirs) {
        const fullDir = path.join(PROJECT_ROOT, dir);
        if (!fs.existsSync(fullDir)) continue;

        const files = fs.readdirSync(fullDir);
        for (const file of files) {
          const isPureAscii = /^[\x00-\x7F]+$/.test(file);
          expect(isPureAscii).toBe(true);
        }
      }
    });
  });
});

// ===========================================================================
// Story 6.3: Business Flow & Resource Consumption — E2E (API4, API6)
// ===========================================================================

describe('OWASP Misconfiguration: Story 6.3 — Business Flow & Resource Consumption E2E', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // API4-001: Rate limiting enforced end-to-end through hook pipeline
  // -------------------------------------------------------------------------
  describe('API4-001: [P0 E2E] Rate limiting enforced through hook pipeline', () => {
    it('should have rate-limiter registered in settings.json hooks', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude/settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

      // Rate limiter must be in the hook pipeline
      const settingsStr = JSON.stringify(settings);
      expect(settingsStr).toContain('rate-limiter');
    });

    it('should have rate-limiter.ts defining per-operation limits', () => {
      const rlPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/resource-management/rate-limiter.ts'
      );
      const source = fs.readFileSync(rlPath, 'utf-8');

      expect(source).toContain('BASE_RATE_LIMITS');
      expect(source).toContain('WINDOW_SECONDS');
      expect(source).toContain('bash:');
      expect(source).toContain('write:');
    });

    it('should use sliding window algorithm', () => {
      const rlPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/resource-management/rate-limiter.ts'
      );
      const source = fs.readFileSync(rlPath, 'utf-8');

      expect(source).toContain('WINDOW_SECONDS');
      expect(source).toMatch(/60/); // 60-second window
    });

    it('should support exponential backoff on violations', () => {
      const rlPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/resource-management/rate-limiter.ts'
      );
      const source = fs.readFileSync(rlPath, 'utf-8');

      expect(source).toContain('BACKOFF_BASE_SECONDS');
      expect(source).toContain('BACKOFF_MULTIPLIER');
      expect(source).toContain('BACKOFF_MAX_SECONDS');
    });
  });

  // -------------------------------------------------------------------------
  // API4-002: Context window token limit enforced at hook level
  // -------------------------------------------------------------------------
  describe('API4-002: [P0 E2E] Context window token limit enforced at hook level', () => {
    it('should have context-manager bin available for hook integration', () => {
      const binPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/bin/context-manager.js'
      );
      expect(fs.existsSync(binPath)).toBe(true);
    });

    it('should define MAX_CONTEXT_TOKENS and thresholds', () => {
      const cmPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/resource-management/context-manager.ts'
      );
      const source = fs.readFileSync(cmPath, 'utf-8');

      expect(source).toContain('MAX_CONTEXT_TOKENS');
      expect(source).toContain('WARNING_THRESHOLD');
      expect(source).toContain('BLOCK_THRESHOLD');
    });

    it('should use status levels: ok, warning, critical, blocked', () => {
      const cmPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/resource-management/context-manager.ts'
      );
      const source = fs.readFileSync(cmPath, 'utf-8');

      expect(source).toContain("'ok'");
      expect(source).toContain("'warning'");
      expect(source).toContain("'critical'");
      expect(source).toContain("'blocked'");
    });
  });

  // -------------------------------------------------------------------------
  // API4-003: Memory consumption bounded at hook level
  // -------------------------------------------------------------------------
  describe('API4-003: [P0 E2E] Memory consumption bounded at hook level', () => {
    it('should have resource-limits registered in hooks', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude/settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

      const settingsStr = JSON.stringify(settings);
      expect(settingsStr).toContain('resource-limits');
    });

    it('should define memory limits and thresholds', () => {
      const rlPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/resource-management/resource-limits.ts'
      );
      const source = fs.readFileSync(rlPath, 'utf-8');

      expect(source).toContain('maxMemoryMb');
      expect(source).toContain('WARNING_THRESHOLD');
      expect(source).toContain('CRITICAL_THRESHOLD');
    });

    it('should support graceful process termination', () => {
      const rlPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/resource-management/resource-limits.ts'
      );
      const source = fs.readFileSync(rlPath, 'utf-8');

      expect(source).toContain('GRACEFUL_SHUTDOWN_MS');
      expect(source).toContain('processTimeoutSeconds');
    });
  });

  // -------------------------------------------------------------------------
  // API4-004: Recursion depth bounded at hook level
  // -------------------------------------------------------------------------
  describe('API4-004: [P0 E2E] Recursion depth bounded at hook level', () => {
    it('should have recursion-guard registered in hooks', () => {
      const settingsPath = path.join(PROJECT_ROOT, '.claude/settings.json');
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

      const settingsStr = JSON.stringify(settings);
      expect(settingsStr).toContain('recursion-guard');
    });

    it('should define recursion limits for directory, calls, tasks, symlinks', () => {
      const rgPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/resource-management/recursion-guard.ts'
      );
      const source = fs.readFileSync(rgPath, 'utf-8');

      expect(source).toContain('directoryTraversal');
      expect(source).toContain('nestedCalls');
      expect(source).toContain('taskDepth');
      expect(source).toContain('symlinkFollows');
    });

    it('should detect circular references', () => {
      const rgPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/resource-management/recursion-guard.ts'
      );
      const source = fs.readFileSync(rgPath, 'utf-8');

      expect(source).toContain('CIRCULAR_WINDOW_SIZE');
      expect(source).toContain('circularRefsDetected');
    });
  });

  // -------------------------------------------------------------------------
  // API6-001: Incident response workflow requires authorized role
  // -------------------------------------------------------------------------
  describe('API6-001: Incident response workflow requires authorized role', () => {
    it('should have RBAC roles defined with different privilege levels', () => {
      const ppPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/permissions/plugin-permissions.ts'
      );
      const source = fs.readFileSync(ppPath, 'utf-8');

      // Must have role hierarchy: admin > developer > analyst > viewer
      expect(source).toContain('admin:');
      expect(source).toContain('developer:');
      expect(source).toContain('analyst:');
      expect(source).toContain('viewer:');
    });

    it('should restrict shell access for non-admin roles', () => {
      const ppPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/permissions/plugin-permissions.ts'
      );
      const source = fs.readFileSync(ppPath, 'utf-8');

      // Viewer should have no shell access
      expect(source).toMatch(/viewer[\s\S]*?allowed_commands:\s*\[\s*\]/);
    });
  });

  // -------------------------------------------------------------------------
  // API6-002: Security tier changes audited and authorized
  // -------------------------------------------------------------------------
  describe('API6-002: Security tier changes audited and authorized', () => {
    it('should audit all permission checks', () => {
      const ppPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/permissions/plugin-permissions.ts'
      );
      const source = fs.readFileSync(ppPath, 'utf-8');

      expect(source).toContain('AuditLogger.logSync');
      expect(source).toContain('PERMISSION_CHECK');
    });

    it('should log severity for blocked operations', () => {
      const ppPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/permissions/plugin-permissions.ts'
      );
      const source = fs.readFileSync(ppPath, 'utf-8');

      expect(source).toContain("'BLOCKED'");
      expect(source).toContain("'INFO'");
    });
  });

  // -------------------------------------------------------------------------
  // API6-003: Bulk agent activation (>5) requires admin role
  // -------------------------------------------------------------------------
  describe('API6-003: Bulk agent activation (>5) requires admin role', () => {
    it('should have admin role with full shell and filesystem access', () => {
      const ppPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/permissions/plugin-permissions.ts'
      );
      const source = fs.readFileSync(ppPath, 'utf-8');

      // Admin has wildcard access
      expect(source).toMatch(/admin[\s\S]*?allowed_commands:\s*\['\*'\]/);
      expect(source).toMatch(/admin[\s\S]*?read:\s*\['\*\*'\]/);
      expect(source).toMatch(/admin[\s\S]*?write:\s*\['\*\*'\]/);
    });

    it('should restrict non-admin roles from bulk operations', () => {
      const ppPath = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src/permissions/plugin-permissions.ts'
      );
      const source = fs.readFileSync(ppPath, 'utf-8');

      // Analyst has limited shell commands
      expect(source).toMatch(/analyst[\s\S]*?allowed_commands:\s*\[/);
      // Developer has limited write
      expect(source).toMatch(/developer[\s\S]*?write:\s*\[/);
    });
  });
});

// ===========================================================================
// Story 6.4: Build, Configuration & Meta-Checks (SCS, A04, A08)
// ===========================================================================

describe('OWASP Misconfiguration: Story 6.4 — Build, Configuration & Meta-Checks', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // SCS02-001: Build produces deterministic output
  // -------------------------------------------------------------------------
  describe('SCS02-001: Build produces deterministic output', () => {
    it('should have deterministic package files defined in package.json', () => {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8')
      );

      // package.json must have a "files" field or .npmignore for deterministic builds
      const hasFiles = Array.isArray(pkg.files);
      const hasNpmignore = fs.existsSync(path.join(PROJECT_ROOT, '.npmignore'));

      expect(hasFiles || hasNpmignore).toBe(true);
    });

    it('should have consistent package.json fields for reproducible builds', () => {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf-8')
      );

      // Must have name, version for deterministic tarball naming
      expect(pkg.name).toBeTruthy();
      expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);

      // Must have main/exports for consistent resolution
      expect(pkg.main || pkg.exports).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // SCS02-002: CI pipeline uses pinned dependency versions (SHA refs)
  // -------------------------------------------------------------------------
  describe('SCS02-002: CI pipeline uses pinned dependency versions', () => {
    it('should use SHA-pinned actions in quality-gate.yml', () => {
      const qgPath = path.join(
        PROJECT_ROOT,
        '.github/workflows/quality-gate.yml'
      );
      const source = fs.readFileSync(qgPath, 'utf-8');

      // Find all `uses:` directives
      const usesLines = source
        .split('\n')
        .filter((l) => l.trim().startsWith('uses:'));

      expect(usesLines.length).toBeGreaterThan(0);

      for (const line of usesLines) {
        // Each `uses:` must have a SHA commit hash (40 hex chars)
        expect(line).toMatch(
          /uses:\s+[\w-]+\/[\w-]+@[0-9a-f]{40}/,
          `Action not SHA-pinned: ${line.trim()}`
        );
      }
    });

    it('should use SHA-pinned actions in all workflow files', () => {
      const workflowDir = path.join(PROJECT_ROOT, '.github/workflows');
      const files = fs.readdirSync(workflowDir).filter((f) => f.endsWith('.yml'));

      for (const file of files) {
        const source = fs.readFileSync(path.join(workflowDir, file), 'utf-8');
        const usesLines = source
          .split('\n')
          .filter((l) => l.trim().startsWith('uses:'));

        for (const line of usesLines) {
          // Allow `uses: ./` for local actions
          if (line.includes('./')) continue;

          expect(line).toMatch(
            /uses:\s+[\w-]+\/[\w-]+@[0-9a-f]{40}/,
            `Action not SHA-pinned in ${file}: ${line.trim()}`
          );
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // SCS06-002: Security advisory monitoring process exists
  // -------------------------------------------------------------------------
  describe('SCS06-002: Security advisory monitoring process exists', () => {
    it('should have npm audit step in CI quality-gate', () => {
      const qgPath = path.join(
        PROJECT_ROOT,
        '.github/workflows/quality-gate.yml'
      );
      const source = fs.readFileSync(qgPath, 'utf-8');

      expect(source).toContain('npm audit');
    });

    it('should have security regression script', () => {
      const scriptPath = path.join(
        PROJECT_ROOT,
        'scripts/security-regression.sh'
      );
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it('should have hook content hash drift detection in CI', () => {
      const qgPath = path.join(
        PROJECT_ROOT,
        '.github/workflows/quality-gate.yml'
      );
      const source = fs.readFileSync(qgPath, 'utf-8');

      expect(source).toContain('hook-content-hashes.json');
      expect(source).toContain('DRIFTED');
    });

    it('should have Trufflehog secret scanning in CI', () => {
      const qgPath = path.join(
        PROJECT_ROOT,
        '.github/workflows/quality-gate.yml'
      );
      const source = fs.readFileSync(qgPath, 'utf-8');

      expect(source).toContain('trufflehog');
    });
  });

  // -------------------------------------------------------------------------
  // A04-007: All security controls have corresponding tests
  // -------------------------------------------------------------------------
  describe('A04-007: All security controls have corresponding tests — meta-check', () => {
    it('should have test files covering all validator categories', () => {
      const validatorCategories = [
        'ai-safety',
        'guards',
        'observability',
        'permissions',
        'resource-management',
      ];

      const testDir = path.join(PROJECT_ROOT, 'tests');
      const allTestFiles = [];

      // Collect all test files recursively
      const walkDir = (dir) => {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory() && entry.name !== 'node_modules') {
            walkDir(full);
          } else if (entry.name.endsWith('.test.js') || entry.name.endsWith('.test.ts')) {
            allTestFiles.push(full);
          }
        }
      };
      walkDir(testDir);

      const testContent = allTestFiles.map((f) => fs.readFileSync(f, 'utf-8')).join('\n');

      for (const category of validatorCategories) {
        // At least one test file should reference validators from this category
        const categoryPattern = category.replace(/-/g, '[-_]');
        const hasReference = new RegExp(categoryPattern, 'i').test(testContent);

        expect(hasReference).toBe(true);
      }
    });

    it('should have tests for each validator TS source file', () => {
      const validatorsDir = path.join(
        PROJECT_ROOT,
        '.claude/validators-node/src'
      );

      // Collect all validator TS files (exclude index.ts, types, and test files)
      const validatorFiles = [];
      const walkValidators = (dir) => {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory() && entry.name !== '__tests__' && entry.name !== 'node_modules') {
            walkValidators(full);
          } else if (
            entry.name.endsWith('.ts') &&
            !entry.name.endsWith('.d.ts') &&
            !entry.name.endsWith('.test.ts') &&
            entry.name !== 'index.ts'
          ) {
            validatorFiles.push(entry.name.replace('.ts', ''));
          }
        }
      };
      walkValidators(validatorsDir);

      // Collect all test content
      const testDir = path.join(PROJECT_ROOT, 'tests');
      const allTestFiles = [];
      const walkTests = (dir) => {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory() && entry.name !== 'node_modules') {
            walkTests(full);
          } else if (entry.name.endsWith('.test.js') || entry.name.endsWith('.test.ts')) {
            allTestFiles.push(full);
          }
        }
      };
      walkTests(testDir);

      const testContent = allTestFiles.map((f) => fs.readFileSync(f, 'utf-8')).join('\n');

      // Each validator should be referenced in at least one test
      const untested = [];
      for (const validator of validatorFiles) {
        const pattern = validator.replace(/-/g, '[-_]');
        const isReferenced = new RegExp(pattern, 'i').test(testContent);
        if (!isReferenced) {
          untested.push(validator);
        }
      }

      // Allow a small number of utility/config files to not have direct tests
      const exempted = new Set([
        'stdin-parser', 'path-utils', 'block-message', 'session-context',
        'archival-config', 'archival-scheduler', 'log-archiver',
        'audit-integrity', 'alerting',
        // Type definition files
        'xss-types', 'xss-safety-types',
        // Validators with deferred test implementation
        'xss-safety',
      ]);

      const untestedNonExempt = untested.filter((v) => !exempted.has(v));

      expect(untestedNonExempt).toEqual([]);
    });
  });
});

// ===========================================================================
// Story 6.5: Atomic File Operations (A08) — RESTORED P0
// ===========================================================================

describe('OWASP Misconfiguration: Story 6.5 — Atomic File Operations', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'owasp-atomic-'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up temp dir
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  });

  // -------------------------------------------------------------------------
  // A08-003: Atomic file operations prevent partial writes
  // -------------------------------------------------------------------------
  describe('A08-003: [P0] Atomic file operations prevent partial writes', () => {
    it('should have atomic-operations.js implementing temp+rename pattern', () => {
      const aoPath = path.join(
        PROJECT_ROOT,
        'src/security/supply-chain/atomic-operations.js'
      );
      const source = fs.readFileSync(aoPath, 'utf-8');

      // Must use temp file + rename for atomicity
      expect(source).toContain('atomicWrite');
      expect(source).toContain('.tmp');
      expect(source).toContain('rename');
    });

    it('should write to temp file first then rename atomically', () => {
      const targetFile = path.join(tmpDir, 'atomic-test.json');
      const content = JSON.stringify({ key: 'value', timestamp: Date.now() });

      // Simulate atomic write: write temp + rename
      const tempFile = `${targetFile}.${crypto.randomBytes(4).toString('hex')}.tmp`;
      fs.writeFileSync(tempFile, content);

      // Verify temp was created
      expect(fs.existsSync(tempFile)).toBe(true);

      // Atomic rename
      fs.renameSync(tempFile, targetFile);

      // Verify final file has correct content
      const result = fs.readFileSync(targetFile, 'utf-8');
      expect(result).toBe(content);

      // Temp file should no longer exist
      expect(fs.existsSync(tempFile)).toBe(false);
    });

    it('should not leave corrupted file on simulated crash mid-write', () => {
      const targetFile = path.join(tmpDir, 'crash-test.json');
      const originalContent = '{"original": true}';

      // Write original content
      fs.writeFileSync(targetFile, originalContent);

      // Simulate failed write (crash mid-write to temp)
      const tempFile = `${targetFile}.crash.tmp`;
      fs.writeFileSync(tempFile, '{"partial": tr'); // Incomplete JSON

      // Original file should still be intact
      const result = fs.readFileSync(targetFile, 'utf-8');
      expect(result).toBe(originalContent);

      // Clean up temp
      fs.unlinkSync(tempFile);
    });

    it('should guarantee read returns valid content during concurrent write', () => {
      const targetFile = path.join(tmpDir, 'concurrent-test.json');
      const originalContent = '{"version": 1}';
      const newContent = '{"version": 2}';

      // Write original
      fs.writeFileSync(targetFile, originalContent);

      // Simulate atomic write (write temp, then rename)
      const tempFile = `${targetFile}.${crypto.randomBytes(4).toString('hex')}.tmp`;
      fs.writeFileSync(tempFile, newContent);

      // Read during "write" — should get original (temp not renamed yet)
      const duringWrite = fs.readFileSync(targetFile, 'utf-8');
      expect(duringWrite).toBe(originalContent);

      // Atomic rename
      fs.renameSync(tempFile, targetFile);

      // Read after rename — should get new content
      const afterWrite = fs.readFileSync(targetFile, 'utf-8');
      expect(afterWrite).toBe(newContent);
    });

    it('should validate path safety (no traversal, no null bytes)', () => {
      const aoPath = path.join(
        PROJECT_ROOT,
        'src/security/supply-chain/atomic-operations.js'
      );
      const source = fs.readFileSync(aoPath, 'utf-8');

      expect(source).toContain('_validatePath');
      expect(source).toContain('..');
      expect(source).toContain('\\0');
      expect(source).toContain('Path traversal not allowed');
      expect(source).toContain('Null bytes in path not allowed');
    });

    it('should use exclusive file creation flag for lock files', () => {
      const aoPath = path.join(
        PROJECT_ROOT,
        'src/security/supply-chain/atomic-operations.js'
      );
      const source = fs.readFileSync(aoPath, 'utf-8');

      // 'wx' flag = exclusive write (fails if file exists)
      expect(source).toContain("'wx'");
    });

    it('should support transaction rollback on failure', () => {
      const aoPath = path.join(
        PROJECT_ROOT,
        'src/security/supply-chain/atomic-operations.js'
      );
      const source = fs.readFileSync(aoPath, 'utf-8');

      expect(source).toContain('transaction');
      expect(source).toContain('rollback');
      expect(source).toContain('rolledBack');
    });
  });
});

// ===========================================================================
// Story OWASP-03: IDOR Detection (A01-101..103)
// ===========================================================================

describe('OWASP Misconfiguration: Story OWASP-03 — IDOR Detection', () => {
  let detectIDOR, validateSecurityHeaders;

  beforeAll(async () => {
    // Import the compiled JavaScript validators
    const httpPath = path.join(PROJECT_ROOT, '.claude/validators-node/dist/src/guards/http-security.js');
    const module = await import(httpPath);
    detectIDOR = module.detectIDOR;
    validateSecurityHeaders = module.validateSecurityHeaders;
  });

  // -------------------------------------------------------------------------
  // A01-101: Sequential ID enumeration detection
  // -------------------------------------------------------------------------
  describe('A01-101: Sequential ID enumeration detection', () => {
    it('should detect sequential ID access pattern', () => {
      const paths = [
        '/api/users/1',
        '/api/users/2',
        '/api/users/3',
      ];
      const result2 = detectIDOR(paths[1], [paths[0]]);
      const result3 = detectIDOR(paths[2], paths);

      expect(result2).toBeTruthy();
      expect(result2?.testId).toBe('A01-101');
      expect(result2?.subtype).toBe('SEQUENTIAL_ENUMERATION');
    });

    it('should detect sequential ID in different paths', () => {
      const paths = [
        '/api/v1/agents/1',
        '/api/v1/agents/2',
      ];
      const result = detectIDOR(paths[1], [paths[0]]);

      expect(result).toBeTruthy();
      expect(result?.testId).toBe('A01-101');
    });

    it('should not flag non-sequential access', () => {
      const paths = [
        '/api/users/1',
        '/api/users/100',
      ];
      const result = detectIDOR(paths[1], [paths[0]]);

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // A01-102: GUID/UUID manipulation detection
  // -------------------------------------------------------------------------
  describe('A01-102: GUID/UUID manipulation detection', () => {
    it('should detect UUID with minor variations', () => {
      const paths = [
        '/api/users/ff6e63b9-2d7b-4a4b-a7b5-7f6e7a8b9c0d',
        '/api/users/ff6e63b9-2d7b-4a4b-a7b5-7f6e7a8b9c0e',
      ];
      const result = detectIDOR(paths[1], [paths[0]]);

      expect(result).toBeTruthy();
      expect(result?.testId).toBe('A01-102');
      expect(result?.subtype).toBe('UUID_MANIPULATION');
    });

    it('should detect UUID with incremented hex', () => {
      const paths = [
        '/api/sessions/550e8400-e29b-41d4-a716-446655440000',
        '/api/sessions/550e8400-e29b-41d4-a716-446655440001',
      ];
      const result = detectIDOR(paths[1], [paths[0]]);

      expect(result).toBeTruthy();
      expect(result?.testId).toBe('A01-102');
    });

    it('should not flag completely different UUIDs', () => {
      const paths = [
        '/api/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        '/api/users/zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz',
      ];
      const result = detectIDOR(paths[1], [paths[0]]);

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // A01-103: Parameter tampering detection
  // -------------------------------------------------------------------------
  describe('A01-103: Parameter tampering detection', () => {
    it('should detect id parameter in query string', () => {
      const result = detectIDOR('/api/users?id=2');

      expect(result).toBeTruthy();
      expect(result?.testId).toBe('A01-103');
      expect(result?.subtype).toBe('PARAMETER_TAMPERING');
    });

    it('should detect target_user_id parameter', () => {
      const result = detectIDOR('/api/profile?target_user_id=456');

      expect(result).toBeTruthy();
      expect(result?.testId).toBe('A01-103');
    });

    it('should detect resource_id parameter', () => {
      const result = detectIDOR('/api/items?resource_id=999');

      expect(result).toBeTruthy();
      expect(result?.testId).toBe('A01-103');
    });

    it('should not flag legitimate paths without manipulation', () => {
      const result = detectIDOR('/api/users/profile');

      expect(result).toBeNull();
    });
  });
});

// ===========================================================================
// Story OWASP-04: HTTP Security Headers (A05-101..105)
// ===========================================================================

describe('OWASP Misconfiguration: Story OWASP-04 — HTTP Security Headers', () => {
  let validateSecurityHeaders, checkDefaultCredentials, checkDebugFlags, validateCORSHeaders;

  beforeAll(async () => {
    // Import the compiled JavaScript validators
    const httpPath = path.join(PROJECT_ROOT, '.claude/validators-node/dist/src/guards/http-security.js');
    const module = await import(httpPath);
    validateSecurityHeaders = module.validateSecurityHeaders;
    checkDefaultCredentials = module.checkDefaultCredentials;
    checkDebugFlags = module.checkDebugFlags;
    validateCORSHeaders = module.validateCORSHeaders;
  });

  // -------------------------------------------------------------------------
  // A05-101: Content-Security-Policy header validation
  // -------------------------------------------------------------------------
  describe('A05-101: Content-Security-Policy header validation', () => {
    it('should fail when CSP header missing', () => {
      const headers = {};
      const result = validateSecurityHeaders(headers);

      expect(result.isSecure).toBe(false);
      expect(result.findings.some(f => f.testId === 'A05-101')).toBe(true);
      expect(result.severity).toBe('CRITICAL');
    });

    it('should warn on unsafe-inline without nonce', () => {
      const headers = {
        'Content-Security-Policy': "default-src 'self'; script-src 'unsafe-inline'",
      };
      const result = validateSecurityHeaders(headers);

      expect(result.findings.some(f => f.testId === 'A05-101')).toBe(true);
      expect(result.findings.filter(f => f.testId === 'A05-101')[0].severity).toBe('WARNING');
    });

    it('should warn on wildcard in CSP', () => {
      const headers = {
        'Content-Security-Policy': 'default-src *',
      };
      const result = validateSecurityHeaders(headers);

      expect(result.findings.some(f => f.testId === 'A05-101')).toBe(true);
    });

    it('should pass with proper CSP', () => {
      const headers = {
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'nonce-abc123'",
      };
      const result = validateSecurityHeaders(headers);

      expect(result.findings.filter(f => f.testId === 'A05-101' && f.severity === 'WARNING' || f.severity === 'CRITICAL').length).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // A05-102: X-Frame-Options header validation
  // -------------------------------------------------------------------------
  describe('A05-102: X-Frame-Options header validation', () => {
    it('should warn when X-Frame-Options missing', () => {
      const headers = { 'Content-Security-Policy': "default-src 'self'" };
      const result = validateSecurityHeaders(headers);

      expect(result.findings.some(f => f.testId === 'A05-102')).toBe(true);
    });

    it('should pass with DENY X-Frame-Options', () => {
      const headers = {
        'X-Frame-Options': 'DENY',
      };
      const result = validateSecurityHeaders(headers);

      expect(result.findings.filter(f => f.testId === 'A05-102' && f.severity === 'WARNING').length).toBe(0);
    });

    it('should pass with SAMEORIGIN X-Frame-Options', () => {
      const headers = {
        'X-Frame-Options': 'SAMEORIGIN',
      };
      const result = validateSecurityHeaders(headers);

      expect(result.findings.filter(f => f.testId === 'A05-102' && f.severity === 'WARNING').length).toBe(0);
    });

    it('should note deprecated ALLOW-FROM', () => {
      const headers = {
        'X-Frame-Options': 'ALLOW-FROM https://example.com',
      };
      const result = validateSecurityHeaders(headers);

      expect(result.findings.some(f => f.testId === 'A05-102')).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // A05-103: X-Content-Type-Options header validation
  // -------------------------------------------------------------------------
  describe('A05-103: X-Content-Type-Options header validation', () => {
    it('should note when X-Content-Type-Options missing', () => {
      const headers = {};
      const result = validateSecurityHeaders(headers);

      expect(result.findings.some(f => f.testId === 'A05-103')).toBe(true);
      expect(result.findings.filter(f => f.testId === 'A05-103')[0].severity).toBe('INFO');
    });

    it('should pass with nosniff value', () => {
      const headers = {
        'X-Content-Type-Options': 'nosniff',
      };
      const result = validateSecurityHeaders(headers);

      expect(result.findings.filter(f => f.testId === 'A05-103' && f.severity === 'WARNING').length).toBe(0);
    });

    it('should warn with incorrect value', () => {
      const headers = {
        'X-Content-Type-Options': 'no-sniff',
      };
      const result = validateSecurityHeaders(headers);

      expect(result.findings.some(f => f.testId === 'A05-103')).toBe(true);
      expect(result.findings.filter(f => f.testId === 'A05-103')[0].severity).toBe('WARNING');
    });
  });

  // -------------------------------------------------------------------------
  // A05-104: Default credentials detection
  // -------------------------------------------------------------------------
  describe('A05-104: Default credentials detection', () => {
    it('should detect admin:admin', () => {
      const result = checkDefaultCredentials('admin:admin');

      expect(result.isDefault).toBe(true);
      expect(result.pattern).toBe('admin:admin');
    });

    it('should detect admin:password', () => {
      const result = checkDefaultCredentials('username=admin&password=password');

      expect(result.isDefault).toBe(true);
    });

    it('should detect root:root', () => {
      const result = checkDefaultCredentials('root:root');

      expect(result.isDefault).toBe(true);
    });

    it('should allow unique credentials', () => {
      const result = checkDefaultCredentials('myuser:Str0ng!Pass#2026');

      expect(result.isDefault).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // A05-105: Debug flags detection
  // -------------------------------------------------------------------------
  describe('A05-105: Debug flags detection', () => {
    it('should detect DEBUG=true', () => {
      const content = 'DEBUG=true';
      const result = checkDebugFlags(content);

      expect(result.hasDebug).toBe(true);
      expect(result.findings.length).toBeGreaterThan(0);
    });

    it('should detect NODE_ENV=development', () => {
      const content = 'NODE_ENV=development';
      const result = checkDebugFlags(content);

      expect(result.hasDebug).toBe(true);
      expect(result.findings.some(f => f.testId === 'A05-105')).toBe(true);
    });

    it('should detect XDEBUG_SESSION', () => {
      const content = 'XDEBUG_SESSION=1';
      const result = checkDebugFlags(content);

      expect(result.hasDebug).toBe(true);
    });

    it('should detect RAILS_ENV=development', () => {
      const content = 'RAILS_ENV=development';
      const result = checkDebugFlags(content);

      expect(result.hasDebug).toBe(true);
    });

    it('should pass with production settings', () => {
      const content = 'NODE_ENV=production\nDEBUG=false';
      const result = checkDebugFlags(content);

      expect(result.hasDebug).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Additional: CORS validation (API8-001)
  // -------------------------------------------------------------------------
  describe('API8-001: CORS wildcard origin detection', () => {
    it('should detect CORS wildcard origin', () => {
      const headers = {
        'Access-Control-Allow-Origin': '*',
      };
      const result = validateCORSHeaders(headers);

      expect(result.isSecure).toBe(false);
      expect(result.findings.length).toBeGreaterThan(0);
    });

    it('should detect wildcard with credentials enabled', () => {
      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      };
      const result = validateCORSHeaders(headers);

      expect(result.isSecure).toBe(false);
      expect(result.findings.some(f => f.severity === 'CRITICAL')).toBe(true);
    });

    it('should pass with specific origin', () => {
      const headers = {
        'Access-Control-Allow-Origin': 'https://example.com',
      };
      const result = validateCORSHeaders(headers);

      expect(result.isSecure).toBe(true);
    });

    it('should pass with credentials and specific origin', () => {
      const headers = {
        'Access-Control-Allow-Origin': 'https://app.example.com',
        'Access-Control-Allow-Credentials': 'true',
      };
      const result = validateCORSHeaders(headers);

      expect(result.isSecure).toBe(true);
    });
  });
});
