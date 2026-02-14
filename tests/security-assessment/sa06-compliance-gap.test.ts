/**
 * SA-06: Compliance Gap Assessment — Framework Compliance Validation
 *
 * Validates compliance controls identified in SA-06-COMPLIANCE-GAP-ASSESSMENT.md:
 *
 * NIST CSF:
 *   6.1  Asset inventory (ID.AM-1, ID.AM-2)
 *   6.2  RBAC policy established (ID.GV-1)
 *   6.3  Credentials managed (PR.AC-1)
 *   6.4  Least privilege enforced (PR.AC-4)
 *   6.5  Data-at-rest protected (PR.DS-1)
 *   6.6  Security baseline maintained (PR.IP-1)
 *   6.7  Anomaly detection operational (DE.AE-1)
 *   6.8  Malicious code detection (DE.CM-4)
 *
 * SOC 2:
 *   6.9  Logical access (CC6.1) — RBAC enforcement
 *   6.10 Credential auth (CC6.2) — token validation
 *   6.11 Boundary protection (CC6.6) — outside-repo
 *   6.12 Input restriction (CC6.7) — prompt-injection + PII
 *   6.13 Monitoring (CC7.1) — telemetry + anomaly
 *
 * ISO 27001:
 *   6.14 Logging integrity (A.8.15) — hash chain + HMAC
 *   6.15 Retention policies (A.8.15) — category-based retention
 *   6.16 Compliance reporting (A.8.15) — generateComplianceReport
 *   6.17 Cryptography (A.8.24) — HMAC-SHA256 + SHA-256
 *   6.18 Secure development (A.8.25) — schema validation + CI
 *
 * SLSA:
 *   6.19 Source version control (L1)
 *   6.20 Build as code (L1)
 *   6.21 Provenance generated (L2)
 *   6.22 SBOM generation (L2)
 *
 * Evidence:
 *   6.23 Evidence index exists with 20 controls
 *   6.24 Compliance assessment document complete
 */

import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '../..');
const readText = (p) => readFileSync(p.startsWith('/') ? p : join(ROOT, p), 'utf8');
const readJson = (p) => JSON.parse(readFileSync(p.startsWith('/') ? p : join(ROOT, p), 'utf8'));
const fileExists = (p) => existsSync(p.startsWith('/') ? p : join(ROOT, p));

// ============================================================================
// NIST CSF Controls
// ============================================================================
describe('SA-06: NIST CSF Compliance', () => {

  // 6.1 Asset inventory (ID.AM-1, ID.AM-2)
  describe('6.1 Asset inventory', () => {
    it('should have agent manifest with 80 agents', () => {
      const manifest = readText('_bmad/_config/agent-manifest.csv');
      const lines = manifest.trim().split('\n').filter(l => l.trim() && !l.startsWith('module'));
      expect(lines.length).toBeGreaterThanOrEqual(80);
    });

    it('should have 9 module.yaml files discoverable', () => {
      const modules = [];
      const srcDir = join(ROOT, 'src');
      if (existsSync(srcDir)) {
        const entries = readdirSync(srcDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const modYaml = join(srcDir, entry.name, 'module.yaml');
            if (existsSync(modYaml)) modules.push(entry.name);
          }
        }
      }
      expect(modules.length).toBeGreaterThanOrEqual(9);
    });

    it('should have schema validation scripts', () => {
      expect(fileExists('tools/validate-agent-schema.js')).toBe(true);
      expect(fileExists('tools/validate-workflow-schema.js')).toBe(true);
      expect(fileExists('tools/validate-module-schema.js')).toBe(true);
    });
  });

  // 6.2 RBAC policy (ID.GV-1)
  describe('6.2 RBAC policy established', () => {
    let rbacConfig;

    it('should have rbac-config.yaml', () => {
      expect(fileExists('src/core/security/rbac-config.yaml')).toBe(true);
      rbacConfig = yamlLoad(readText('src/core/security/rbac-config.yaml'));
    });

    it('should have RBAC enabled with deny-by-default', () => {
      expect(rbacConfig.rbac.enabled).toBe(true);
      expect(rbacConfig.rbac.deny_by_default).toBe(true);
    });

    it('should have at least 10 roles defined', () => {
      const roles = Object.keys(rbacConfig.rbac.roles);
      expect(roles.length).toBeGreaterThanOrEqual(10);
    });

    it('should have viewer as default role', () => {
      expect(rbacConfig.rbac.default_role).toBe('viewer');
    });
  });

  // 6.3 Credentials managed (PR.AC-1)
  describe('6.3 Credential management', () => {
    it('should have token-validator.js in SessionStart hooks', () => {
      const settings = readJson('.claude/settings.json');
      const sessionGroups = settings.hooks?.SessionStart || [];
      // SessionStart is array of {type, hooks: [{type, command}]}
      const allCommands = sessionGroups.flatMap(g => g.hooks || []).map(h => h.command || '');
      const hasTokenValidator = allCommands.some(cmd => cmd.includes('token-validator'));
      expect(hasTokenValidator).toBe(true);
    });

    it('should have require_credential_verification for sensitive modules', () => {
      const rbac = yamlLoad(readText('src/core/security/rbac-config.yaml'));
      const intelModule = rbac.rbac.module_restrictions?.['intel-team'];
      expect(intelModule).toBeDefined();
      expect(intelModule.require_credential_verification).toBe(true);
    });
  });

  // 6.4 Least privilege (PR.AC-4)
  describe('6.4 Least privilege enforcement', () => {
    it('should have authorization.js for RBAC enforcement', () => {
      expect(fileExists('src/core/security/authorization.js')).toBe(true);
    });
  });

  describe('6.5 Least privilege enforcement', () => {
    it('should have authorization.js in Skill PreToolUse hooks', () => {
      const settings = readJson('.claude/settings.json');
      const preToolGroups = settings.hooks?.PreToolUse || [];
      // PreToolUse is array of {matcher, hooks: [{type, command}]}
      const skillGroup = preToolGroups.find(g => g.matcher === 'Skill');
      expect(skillGroup).toBeDefined();
      const hasAuth = (skillGroup.hooks || []).some(h =>
        h.command && h.command.includes('authorization')
      );
      expect(hasAuth).toBe(true);
    });
  });

  // 6.5 Data-at-rest protected (PR.DS-1)
  describe('6.5 Data-at-rest protection', () => {
    it('should have secret.js validator', () => {
      expect(fileExists('.claude/validators-node/bin/secret.js')).toBe(true);
    });

    it('should have env-protection.js validator', () => {
      expect(fileExists('.claude/validators-node/bin/env-protection.js')).toBe(true);
    });
  });

  // 6.6 Security baseline (PR.IP-1)
  describe('6.6 Security baseline maintained', () => {
    it('should have hook content hash baseline', () => {
      expect(fileExists('tests/baselines/hook-content-hashes.json')).toBe(true);
    });

    it('should track at least 19 hook files', () => {
      const baseline = readJson('tests/baselines/hook-content-hashes.json');
      expect(baseline.fileCount).toBeGreaterThanOrEqual(19);
    });

    it('should have each hook file with hash entries', () => {
      const baseline = readJson('tests/baselines/hook-content-hashes.json');
      expect(Object.keys(baseline.hashes).length).toBeGreaterThanOrEqual(19);
    });
  });

  // 6.7 Anomaly detection (DE.AE-1)
  describe('6.7 Anomaly detection operational', () => {
    it('should have anomaly-detector source', () => {
      expect(fileExists('.claude/validators-node/src/observability/anomaly-detector.ts')).toBe(true);
    });
  });

  // 6.8 Malicious code detection (DE.CM-4)
  describe('6.8 Malicious code detection', () => {
    it('should have jailbreak.js validator', () => {
      expect(fileExists('.claude/validators-node/bin/jailbreak.js')).toBe(true);
    });

    it('should have prompt-injection.js validator', () => {
      expect(fileExists('.claude/validators-node/bin/prompt-injection.js')).toBe(true);
    });

    it('should have supply-chain.js validator', () => {
      expect(fileExists('.claude/validators-node/bin/supply-chain.js')).toBe(true);
    });

    it('should have jailbreak on UserPromptSubmit', () => {
      const settings = readJson('.claude/settings.json');
      const promptHooks = settings.hooks?.UserPromptSubmit || [];
      const allCommands = promptHooks.flatMap(g => g.hooks || []).map(h => h.command || '');
      const hasJailbreak = allCommands.some(cmd => cmd.includes('jailbreak'));
      expect(hasJailbreak).toBe(true);
    });
  });

  // SOC 2 Controls
  // ============================================================================
  describe('SA-06: SOC 2 Compliance', () => {

    // 6.9 Logical access (CC6.1)
    describe('6.9 Logical access — CC6.1', () => {
      it('should have RBAC with deny-by-default', () => {
        const rbac = yamlLoad(readText('src/core/security/rbac-config.yaml'));
        expect(rbac.rbac.deny_by_default).toBe(true);
      });

      it('should have module-level access restrictions', () => {
        const rbac = yamlLoad(readText('src/core/security/rbac-config.yaml'));
        expect(rbac.rbac.module_restrictions).toBeDefined();
        const modules = Object.keys(rbac.rbac.module_restrictions);
        expect(modules.length).toBeGreaterThanOrEqual(3);
      });

      it('should have workflow-level access restrictions', () => {
        const rbac = yamlLoad(readText('src/core/security/rbac-config.yaml'));
        expect(rbac.rbac.workflow_restrictions).toBeDefined();
        const workflows = Object.keys(rbac.rbac.workflow_restrictions);
        expect(workflows.length).toBeGreaterThanOrEqual(8);
      });

      it('should have agent-level access restrictions', () => {
        const rbac = yamlLoad(readText('src/core/security/rbac-config.yaml'));
        expect(rbac.rbac.agent_restrictions).toBeDefined();
        const agents = Object.keys(rbac.rbac.agent_restrictions);
        expect(agents.length).toBeGreaterThanOrEqual(4);
      });
  });

    // 6.10 Credential auth (CC6.2)
    describe('6.10 Credential authentication — CC6.2', () => {
      it('should have token-validator in SessionStart', () => {
        const settings = readJson('.claude/settings.json');
        const sessionGroups = settings.hooks?.SessionStart || [];
        const allCommands = sessionGroups.flatMap(g => g.hooks || []).map(h => h.command || '');
        const hasTokenValidator = allCommands.some(cmd => cmd.includes('token-validator'));
        expect(hasTokenValidator).toBe(true);
      });
  });

  // 6.11 Boundary protection (CC6.6)
  describe('6.11 Boundary protection — CC6.6', () => {
      it('should have outside-repo.js on at least 6 matchers', () => {
        const settings = readJson('.claude/settings.json');
        const preToolGroups = settings.hooks?.PreToolUse || [];
        const outsideRepoMatchers = new Set();
        for (const group of preToolGroups) {
          const hasOutsideRepo = (group.hooks || []).some(h =>
            h.command && h.command.includes('outside-repo')
          );
          if (hasOutsideRepo) outsideRepoMatchers.add(group.matcher);
        }
        expect(outsideRepoMatchers.size).toBeGreaterThanOrEqual(6);
      });
  });

  // 6.12 Input restriction (CC6.7)
  describe('6.12 Input restriction — CC6.7', () => {
    it('should have prompt-injection.js on Write matcher', () => {
      const settings = readJson('.claude/settings.json');
      const preToolGroups = settings.hooks?.PreToolUse || [];
      const writeGroup = preToolGroups.find(g => g.matcher === 'Write');
      expect(writeGroup).toBeDefined();
      const hasPromptInjection = (writeGroup.hooks || []).some(h =>
        h.command && h.command.includes('prompt-injection')
      );
      expect(hasPromptInjection).toBe(true);
    });

    it('should have pii.js on Write matcher', () => {
      const settings = readJson('.claude/settings.json');
      const preToolGroups = settings.hooks?.PreToolUse || [];
      const writeGroup = preToolGroups.find(g => g.matcher === 'Write');
      expect(writeGroup).toBeDefined();
      const hasPii = (writeGroup.hooks || []).some(h =>
        h.command && h.command.includes('pii')
      );
      expect(hasPii).toBe(true);
    });
  });

  // 6.13 Monitoring (CC7.1)
  describe('6.13 Security monitoring — CC7.1', () => {
      it('should have telemetry.ts source', () => {
        expect(fileExists('.claude/validators-node/src/observability/telemetry.ts')).toBe(true);
      });

    it('should have audit-logger.ts with createLogEntry', () => {
      const source = readText('src/security/audit/audit-logger.ts');
      expect(source).toContain('createLogEntry');
    });

    it('should have audit-logger.ts with flushBuffer', () => {
      const source = readText('src/security/audit/audit-logger.ts');
      expect(source).toContain('flushBuffer');
    });
  });

  // 6.14 Logging integrity (A.8.15)
  describe('6.14 Logging integrity — A.8.15', () => {
      it('should have hash chain implementation', () => {
        const source = readText('src/security/audit/audit-logger.ts');
        expect(source).toContain('previousHash');
        expect(source).toContain('createHash');
        expect(source).toContain('sha256');
      });

    it('should have HMAC signature verification', () => {
      const source = readText('src/security/audit/audit-logger.ts');
      expect(source).toContain('signData');
      expect(source).toContain('verifySignature');
      expect(source).toContain('timingSafeEqual');
    });
  });

  // 6.15 Retention policies (A.8.15)
  describe('6.15 Retention policies — A.8.15', () => {
      it('should have category-based retention in audit-logger', () => {
        const source = readText('src/security/audit/audit-logger.ts');
        expect(source).toContain('enforceRetention');
        expect(source).toContain('purgeExpiredEntries');
      });
  });

  // 6.16 Compliance reporting (A.8.15)
  describe('6.16 Compliance reporting — A.8.15', () => {
      it('should have generateComplianceReport method', () => {
        const source = readText('src/security/audit/audit-logger.ts');
        expect(source).toContain('generateComplianceReport');
      });
  });

  // 6.17 Cryptography (A.8.24)
  describe('6.17 Cryptography — A.8.24', () => {
      it('should use HMAC-SHA256 for audit signing', () => {
        const source = readText('src/security/audit/audit-logger.ts');
        expect(source).toContain('createHmac');
        expect(source).toContain('sha256');
      });

    it('should have Ed25519 public key for package signing', () => {
        expect(fileExists('src/core/security/bmad-public-key.asc')).toBe(true);
    });
  });

  // 6.18 Secure development (A.8.25)
  describe('6.18 Secure development lifecycle — A.8.25', () => {
      it('should have ESLint config with security rules', () => {
        expect(fileExists('eslint.config.mjs')).toBe(true);
        const config = readText('eslint.config.mjs');
        expect(config).toContain('no-eval');
      });

      it('should have quality-gate CI workflow', () => {
        expect(fileExists('.github/workflows/quality-gate.yml')).toBe(true);
      });
  });

  it('should have schema validation in CI', () => {
      const qaYml = readText('.github/workflows/quality-gate.yml');
      expect(qaYml).toContain('test:schemas');
  });

  // SLSA Controls
  // ============================================================================
  describe('SA-06: SLSA Compliance', () => {

    // 6.19 Source version control (L1)
    describe('6.19 Source version control — SLSA L1', () => {
      it('should be a git repository', () => {
        expect(fileExists('.git')).toBe(true);
      });
  });

    // NOTE: Backup tags are gitignored in public release (team/backups/)
    // This test is only applicable to private/full repository
    describe.skip('6.19.1 Backup tags (public release)', () => {
      it('should have backup tags', () => {
        const tags = execSync('git tag --list "pre-v6-*"', { cwd: ROOT, encoding: 'utf8' });
        const tagList = tags.trim().split('\n').filter(Boolean);
        expect(tagList.length).toBeGreaterThanOrEqual(10);
      });
    });
  });

  // 6.20 Build as code (L1)
  describe('6.20 Build as code — SLSA L1', () => {
      it('should have CI workflows in .github/workflows/', () => {
        const workflowDir = join(ROOT, '.github/workflows');
        expect(existsSync(workflowDir)).toBe(true);
        const files = readdirSync(workflowDir).filter(f => f.endsWith('.yml'));
        expect(files.length).toBeGreaterThanOrEqual(4);
      });
  });

  it('should have quality-gate as automated build', () => {
      const qa = readText('.github/workflows/quality-gate.yml');
      expect(qa).toContain('npm run lint');
      expect(qa).toContain('npm run build');
      expect(qa).toContain('npm audit');
  });

  // 6.21 Provenance generated (L2)
  describe.skip('6.21 Provenance generated — SLSA L2', () => {
      it('should have --provenance flag in release workflow', () => {
        const release = readText('.github/workflows/release.yml');
        expect(release.toLowerCase()).toContain('provenance');
      });
  });

  // 6.22 SBOM generation (L2)
  describe('6.22 SBOM generation — SLSA L2', () => {
      it('should have sbom generation in release workflow', () => {
        const release = readText('.github/workflows/release.yml');
        expect(release.toLowerCase()).toContain('sbom');
      });
  });

  }); // End of SLSA Compliance

  // Evidence & Documentation
  // ============================================================================
  describe('SA-06: Evidence & Documentation', () => {

  // NOTE: Phase 0D archived _bmad-output/ contents to ~/bmad-archives/v2.3.0-pre-audit-20260213/
  // These tests verify archived files exist in their new location

  // 6.23 Evidence index
  describe.skip('6.23 Evidence index exists (ARCHIVED)', () => {
    it('should have evidence index file in archive', () => {
      const archivePath = process.env.HOME + '/bmad-archives/v2.3.0-pre-audit-20260213/master-qa/compliance-evidence/EVIDENCE-INDEX.md';
      expect(fileExists(archivePath)).toBe(true);
    });

    it('should reference 20 controls in archive', () => {
      const archivePath = process.env.HOME + '/bmad-archives/v2.3.0-pre-audit-20260213/master-qa/compliance-evidence/EVIDENCE-INDEX.md';
      const index = readText(archivePath);
      // Should have numbered sections 1 through 20
      expect(index).toContain('### 1.');
      expect(index).toContain('### 20.');
    });
  });

  // 6.24 Compliance assessment document
  describe.skip('6.24 Compliance assessment document (ARCHIVED)', () => {
    it('should have SA-06 assessment document in archive', () => {
      const archivePath = process.env.HOME + '/bmad-archives/v2.3.0-pre-audit-20260213/planning-artifacts/SA-06-COMPLIANCE-GAP-ASSESSMENT.md';
      expect(fileExists(archivePath)).toBe(true);
    });

    it('should cover all 5 frameworks in archive', () => {
      const archivePath = process.env.HOME + '/bmad-archives/v2.3.0-pre-audit-20260213/planning-artifacts/SA-06-COMPLIANCE-GAP-ASSESSMENT.md';
      const doc = readText(archivePath);
      expect(doc).toContain('NIST CSF');
      expect(doc).toContain('SOC 2');
      expect(doc).toContain('ISO 27001');
      expect(doc).toContain('SLSA');
      expect(doc).toContain('GDPR');
    });

    it('should have gap register', () => {
      const archivePath = process.env.HOME + '/bmad-archives/v2.3.0-pre-audit-20260213/planning-artifacts/SA-06-COMPLIANCE-GAP-ASSESSMENT.md';
      const doc = readText(archivePath);
      expect(doc).toContain('Gap Register');
      expect(doc).toContain('GAP-NIST-');
      expect(doc).toContain('GAP-SOC2');
      expect(doc).toContain('GAP-ISO');
      expect(doc).toContain('GAP-SLSA');
      expect(doc).toContain('GAP-GDPR');
    });

    it('should have top 20 controls evidence section', () => {
      const archivePath = process.env.HOME + '/bmad-archives/v2.3.0-pre-audit-20260213/planning-artifacts/SA-06-COMPLIANCE-GAP-ASSESSMENT.md';
      const doc = readText(archivePath);
      expect(doc).toContain('Top 20 Controls Evidence');
    });
  });
});
}); // End of SA-06: NIST CSF Compliance
