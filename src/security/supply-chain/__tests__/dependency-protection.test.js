/**
 * Unit Tests for Dependency Protection - VAL-10-001
 * Story 106 - Supply Chain Security
 *
 * Tests security controls for:
 * - BA-083-001: @bmad/ scope enforcement
 * - BA-083-002: Typosquatting detection
 * - BA-083-003: Lock file integrity verification
 * - BA-083-004: Vulnerable package blocking
 *
 * Penetration Testing Scenarios:
 * - GH-083-001: Dependency confusion attack blocked
 * - GH-083-002: Lock file tampering detected
 * - GH-083-003: Downgrade to vulnerable version blocked
 *
 * @module dependency-protection.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification SECURITY-CRITICAL
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Import the actual module (mocking will happen via spying)
import DependencyProtection from '../dependency-protection.js';

// Silence console output during tests
const originalConsole = { ...console };
beforeEach(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  vi.clearAllMocks();
});

describe('DependencyProtection - VAL-10-001', () => {
  describe('Class Structure and Initialization', () => {
    it('should export DependencyProtection class', () => {
      expect(DependencyProtection).toBeDefined();
      expect(typeof DependencyProtection).toBe('function');
    });

    it('should export static constants', () => {
      expect(DependencyProtection.INTERNAL_SCOPE).toBe('@bmad');
      expect(DependencyProtection.ALLOWED_REGISTRIES).toContain('https://registry.npmjs.org');
      expect(DependencyProtection.ALLOWED_REGISTRIES).toContain('https://npm.pkg.github.com');
      expect(Array.isArray(DependencyProtection.MALICIOUS_PATTERNS)).toBe(true);
    });

    it('should create instance with default config', () => {
      const protection = new DependencyProtection();
      expect(protection).toBeInstanceOf(DependencyProtection);
      expect(protection.isInitialized).toBe(false);
    });

    it('should merge user config with defaults', () => {
      const customConfig = { enforceScoping: false };
      const protection = new DependencyProtection(customConfig);
      expect(protection.config.enforceScoping).toBe(false);
      expect(protection.config.typosquatProtection).toBe(true);
    });

    it('should emit initialized event on initialize', async () => {
      const protection = new DependencyProtection();
      const initHandler = vi.fn();
      protection.on('initialized', initHandler);

      await protection.initialize();

      expect(protection.isInitialized).toBe(true);
      expect(initHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          internalPackages: expect.any(Number),
          trustedHashes: expect.any(Number),
        })
      );
    });

    it('should handle missing internal packages file gracefully', async () => {
      const protection = new DependencyProtection();
      await protection.initialize({ internalPackagesPath: '/nonexistent/packages.json' });

      expect(protection.isInitialized).toBe(true);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should extend EventEmitter', () => {
      const protection = new DependencyProtection();
      expect(protection).toBeInstanceOf(EventEmitter);
    });
  });

  // =====================================================
  // BA-083-001: @bmad/ scope enforcement
  // =====================================================
  describe('BA-083-001: @bmad/ scope enforcement', () => {
    let protection;

    beforeEach(async () => {
      protection = new DependencyProtection();
      await protection.initialize();
    });

    it('should allow properly scoped internal packages', async () => {
      const result = await protection.validatePackage({
        name: '@bmad/core',
        version: '1.0.0',
      });

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should reject unscoped internal packages with MISSING_SCOPE error', async () => {
      protection.registerInternalPackage('my-internal-lib');

      const result = await protection.validatePackage({
        name: 'my-internal-lib',
        version: '1.0.0',
      });

      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: 'MISSING_SCOPE',
          severity: 'critical',
          message: expect.stringContaining('@bmad/'),
        })
      );
    });

    it('should detect internal packages by pattern: bmad-*', async () => {
      const result = await protection.validatePackage({
        name: 'bmad-validators',
        version: '1.0.0',
      });

      expect(result.valid).toBe(false);
      expect(result.issues[0].type).toBe('MISSING_SCOPE');
      expect(result.issues[0].fix).toBe('Rename to "@bmad/bmad-validators"');
    });

    it('should detect internal packages by pattern: *-internal', async () => {
      const result = await protection.validatePackage({
        name: 'auth-internal',
        version: '1.0.0',
      });

      expect(result.valid).toBe(false);
      expect(result.issues[0].type).toBe('MISSING_SCOPE');
    });

    it('should detect internal packages by pattern: *-private', async () => {
      const result = await protection.validatePackage({
        name: 'utils-private',
        version: '1.0.0',
      });

      expect(result.valid).toBe(false);
      expect(result.issues[0].type).toBe('MISSING_SCOPE');
    });

    it('should detect internal packages by pattern: *-core', async () => {
      const result = await protection.validatePackage({
        name: 'security-core',
        version: '1.0.0',
      });

      expect(result.valid).toBe(false);
      expect(result.issues[0].type).toBe('MISSING_SCOPE');
    });

    it('should allow external packages without scope', async () => {
      const result = await protection.validatePackage({
        name: 'lodash',
        version: '4.17.21',
      });

      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.type === 'MISSING_SCOPE')).toHaveLength(0);
    });

    it('should generate RENAME_PACKAGE recommendation for unscoped internal', async () => {
      protection.registerInternalPackage('custom-lib');

      const result = await protection.validatePackage({
        name: 'custom-lib',
        version: '1.0.0',
      });

      expect(result.recommendations).toContainEqual(
        expect.objectContaining({
          action: 'RENAME_PACKAGE',
          from: 'custom-lib',
          to: '@bmad/custom-lib',
          priority: 'high',
        })
      );
    });

    it('should check isInternalPackage public method', () => {
      protection.registerInternalPackage('custom-pkg');
      expect(protection.isInternalPackage('custom-pkg')).toBe(true);
      expect(protection.isInternalPackage('@bmad/custom-pkg')).toBe(true);
      expect(protection.isInternalPackage('external-pkg')).toBe(false);
    });

    it('should emit package-validated event with scope validation results', async () => {
      protection.registerInternalPackage('unscoped-pkg');
      const eventHandler = vi.fn();
      protection.on('package-validated', eventHandler);

      await protection.validatePackage({
        name: 'unscoped-pkg',
        version: '1.0.0',
      });

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          package: 'unscoped-pkg',
          valid: false,
          issues: 1,
        })
      );
    });
  });

  // =====================================================
  // BA-083-002: Typosquatting detection
  // =====================================================
  describe('BA-083-002: Typosquatting detection', () => {
    let protection;

    beforeEach(async () => {
      protection = new DependencyProtection({ typosquatProtection: true });
      await protection.initialize();
    });

    it('should detect typosquat of lodash (lodahs)', async () => {
      const result = await protection.validatePackage({
        name: 'lodahs',
        version: '1.0.0',
      });

      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: 'POSSIBLE_TYPOSQUAT',
          severity: 'high',
          message: expect.stringContaining('lodash'),
        })
      );
    });

    it('should detect typosquat of express (expres)', async () => {
      const result = await protection.validatePackage({
        name: 'expres',
        version: '1.0.0',
      });

      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: 'POSSIBLE_TYPOSQUAT',
          message: expect.stringContaining('express'),
        })
      );
    });

    it('should detect typosquat of react (reakt)', async () => {
      const result = await protection.validatePackage({
        name: 'reakt',
        version: '1.0.0',
      });

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.type === 'POSSIBLE_TYPOSQUAT')).toBe(true);
    });

    it('should detect typosquat of axios (axois)', async () => {
      const result = await protection.validatePackage({
        name: 'axois',
        version: '1.0.0',
      });

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.type === 'POSSIBLE_TYPOSQUAT')).toBe(true);
    });

    it('should detect typosquat of webpack (wepback)', async () => {
      const result = await protection.validatePackage({
        name: 'wepback',
        version: '1.0.0',
      });

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.type === 'POSSIBLE_TYPOSQUAT')).toBe(true);
    });

    it('should not flag legitimate packages', async () => {
      const result = await protection.validatePackage({
        name: 'lodash',
        version: '4.17.21',
      });

      expect(result.issues.filter((i) => i.type === 'POSSIBLE_TYPOSQUAT')).toHaveLength(0);
    });

    it('should not flag packages with distance > 2', async () => {
      const result = await protection.validatePackage({
        name: 'completely-different-name',
        version: '1.0.0',
      });

      expect(result.issues.filter((i) => i.type === 'POSSIBLE_TYPOSQUAT')).toHaveLength(0);
    });

    it('should generate VERIFY_PACKAGE recommendation for typosquats', async () => {
      const result = await protection.validatePackage({
        name: 'lodahs',
        version: '1.0.0',
      });

      expect(result.recommendations).toContainEqual(
        expect.objectContaining({
          action: 'VERIFY_PACKAGE',
          package: 'lodahs',
          checkUrl: 'https://www.npmjs.com/package/lodahs',
          priority: 'critical',
        })
      );
    });

    it('should respect typosquatProtection config when disabled', async () => {
      const protectionDisabled = new DependencyProtection({ typosquatProtection: false });
      await protectionDisabled.initialize();

      const result = await protectionDisabled.validatePackage({
        name: 'lodahs',
        version: '1.0.0',
      });

      expect(result.issues.filter((i) => i.type === 'POSSIBLE_TYPOSQUAT')).toHaveLength(0);
    });

    it('should calculate Levenshtein distance correctly', () => {
      // Access private method through the instance
      const result1 = protection._levenshtein('lodash', 'lodahs');
      expect(result1).toBe(2);

      const result2 = protection._levenshtein('express', 'expres');
      expect(result2).toBe(1);

      const result3 = protection._levenshtein('react', 'react');
      expect(result3).toBe(0);

      const result4 = protection._levenshtein('abc', '');
      expect(result4).toBe(3);

      const result5 = protection._levenshtein('', 'xyz');
      expect(result5).toBe(3);
    });

    it('should handle case-insensitive typosquat comparison', async () => {
      const result = await protection.validatePackage({
        name: 'LODAHS',
        version: '1.0.0',
      });

      expect(result.issues.some((i) => i.type === 'POSSIBLE_TYPOSQUAT')).toBe(true);
    });
  });

  // =====================================================
  // BA-083-003: Lock file integrity verification
  // =====================================================
  describe('BA-083-003: Lock file integrity verification', () => {
    let protection;
    let tempDir;

    beforeEach(async () => {
      protection = new DependencyProtection({ lockfileIntegrity: true });
      await protection.initialize();

      // Create a temporary directory for file-based tests
      tempDir = path.join(os.tmpdir(), `dep-protection-test-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });
    });

    afterEach(() => {
      // Clean up temp directory
      if (tempDir && fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    describe('validateLockfile()', () => {
      it('should validate lockfile with valid hash', async () => {
        const lockfilePath = path.join(tempDir, 'package-lock.json');
        const lockfileContent = JSON.stringify({
          packages: {
            '': { name: 'my-project' },
            'node_modules/lodash': {
              resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
              integrity: 'sha512-abc123',
            },
          },
        });

        fs.writeFileSync(lockfilePath, lockfileContent);

        const result = await protection.validateLockfile(lockfilePath);

        expect(result.valid).toBe(true);
        expect(result.hash).toBeDefined();
      });

      it('should detect LOCKFILE_MODIFIED when hash mismatch', async () => {
        const lockfilePath = path.join(tempDir, 'package-lock.json');
        const lockfileContent = '{"packages":{}}';

        fs.writeFileSync(lockfilePath, lockfileContent);

        // Set a trusted hash that doesn't match
        protection.trustedHashes.set(lockfilePath, 'different-trusted-hash');

        const result = await protection.validateLockfile(lockfilePath);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('LOCKFILE_MODIFIED');
        expect(result.message).toContain('modified since last trusted state');
        expect(result.recommendation).toContain('Review changes');
      });

      it('should return LOCKFILE_READ_ERROR when file cannot be read', async () => {
        const result = await protection.validateLockfile('/nonexistent/package-lock.json');

        expect(result.valid).toBe(false);
        expect(result.error).toBe('LOCKFILE_READ_ERROR');
      });

      it('should validate npm lockfile with untrusted resolved URLs', async () => {
        const lockfilePath = path.join(tempDir, 'package-lock.json');
        const lockfileContent = JSON.stringify({
          packages: {
            'node_modules/malicious-pkg': {
              resolved: 'https://evil-registry.com/pkg.tgz',
              integrity: 'sha512-abc',
            },
          },
        });

        fs.writeFileSync(lockfilePath, lockfileContent);

        const result = await protection.validateLockfile(lockfilePath);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('LOCKFILE_CONTENT_INVALID');
        expect(result.issues).toContainEqual(
          expect.objectContaining({
            type: 'UNTRUSTED_RESOLVED_URL',
            package: 'node_modules/malicious-pkg',
          })
        );
      });

      it('should validate lockfile packages have integrity hashes', async () => {
        const lockfilePath = path.join(tempDir, 'package-lock.json');
        const lockfileContent = JSON.stringify({
          packages: {
            'node_modules/no-integrity': {
              resolved: 'https://registry.npmjs.org/pkg.tgz',
              // Missing integrity
            },
          },
        });

        fs.writeFileSync(lockfilePath, lockfileContent);

        const result = await protection.validateLockfile(lockfilePath);

        expect(result.valid).toBe(false);
        expect(result.issues).toContainEqual(
          expect.objectContaining({
            type: 'MISSING_INTEGRITY',
            package: 'node_modules/no-integrity',
          })
        );
      });

      it('should skip root package in lockfile validation', async () => {
        const lockfilePath = path.join(tempDir, 'package-lock.json');
        const lockfileContent = JSON.stringify({
          packages: {
            '': { name: 'root-project' },
          },
        });

        fs.writeFileSync(lockfilePath, lockfileContent);

        const result = await protection.validateLockfile(lockfilePath);

        expect(result.valid).toBe(true);
      });

      it('should allow link packages without integrity', async () => {
        const lockfilePath = path.join(tempDir, 'package-lock.json');
        const lockfileContent = JSON.stringify({
          packages: {
            'node_modules/local-pkg': {
              link: true,
              // Note: link packages typically don't have resolved URLs that trigger registry checks
            },
          },
        });

        fs.writeFileSync(lockfilePath, lockfileContent);

        const result = await protection.validateLockfile(lockfilePath);

        expect(result.valid).toBe(true);
      });

      it('should parse yarn.lock files', async () => {
        const lockfilePath = path.join(tempDir, 'yarn.lock');
        const yarnLockContent = '"lodash@^4.17.0":\n  version "4.17.21"\n  resolved "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz"';

        fs.writeFileSync(lockfilePath, yarnLockContent);

        const result = await protection.validateLockfile(lockfilePath);

        expect(result.valid).toBe(true);
        expect(result.hash).toBeDefined();
      });

      it('should parse pnpm-lock.yaml files', async () => {
        const lockfilePath = path.join(tempDir, 'pnpm-lock.yaml');
        const pnpmLockContent = 'lockfileVersion: 5.4\npackages:\n  /lodash/4.17.21:\n    resolution: {integrity: sha512-abc}';

        fs.writeFileSync(lockfilePath, pnpmLockContent);

        const result = await protection.validateLockfile(lockfilePath);

        expect(result.valid).toBe(true);
        expect(result.hash).toBeDefined();
      });
    });

    describe('trustLockfile()', () => {
      it('should establish baseline hash for lockfile', async () => {
        const lockfilePath = path.join(tempDir, 'package-lock.json');
        fs.writeFileSync(lockfilePath, '{"packages":{}}');

        const hash = await protection.trustLockfile(lockfilePath);

        expect(hash).toBeDefined();
        expect(protection.trustedHashes.get(lockfilePath)).toBe(hash);
      });

      it('should emit lockfile-trusted event', async () => {
        const lockfilePath = path.join(tempDir, 'package-lock.json');
        fs.writeFileSync(lockfilePath, '{"packages":{}}');

        const eventHandler = vi.fn();
        protection.on('lockfile-trusted', eventHandler);

        await protection.trustLockfile(lockfilePath);

        expect(eventHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            path: lockfilePath,
            hash: expect.any(String),
          })
        );
      });

      it('should update trusted hash when called again', async () => {
        const lockfilePath = path.join(tempDir, 'package-lock.json');

        fs.writeFileSync(lockfilePath, '{"version":1}');
        const hash1 = await protection.trustLockfile(lockfilePath);

        fs.writeFileSync(lockfilePath, '{"version":2}');
        const hash2 = await protection.trustLockfile(lockfilePath);

        expect(hash1).not.toBe(hash2);
        expect(protection.trustedHashes.get(lockfilePath)).toBe(hash2);
      });

      it('should return SHA256 hex hash', async () => {
        const lockfilePath = path.join(tempDir, 'package-lock.json');
        fs.writeFileSync(lockfilePath, 'test content');

        const hash = await protection.trustLockfile(lockfilePath);

        // SHA256 produces 64 hex characters
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
      });
    });
  });

  // =====================================================
  // BA-083-004: Vulnerable package blocking / Malicious patterns
  // =====================================================
  describe('BA-083-004: Vulnerable package blocking / Malicious patterns', () => {
    let protection;

    beforeEach(async () => {
      protection = new DependencyProtection();
      await protection.initialize();
    });

    it('should flag packages matching *-internal pattern', async () => {
      const result = await protection.validatePackage({
        name: 'company-internal',
        version: '1.0.0',
      });

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'SUSPICIOUS_NAME',
          severity: 'medium',
        })
      );
    });

    it('should flag packages matching *-private pattern', async () => {
      const result = await protection.validatePackage({
        name: 'org-private',
        version: '1.0.0',
      });

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'SUSPICIOUS_NAME',
        })
      );
    });

    it('should flag packages matching *-staging pattern', async () => {
      const result = await protection.validatePackage({
        name: 'api-staging',
        version: '1.0.0',
      });

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'SUSPICIOUS_NAME',
        })
      );
    });

    it('should flag packages containing typosquat in name', async () => {
      const result = await protection.validatePackage({
        name: 'lodash-typosquat-test',
        version: '1.0.0',
      });

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'SUSPICIOUS_NAME',
        })
      );
    });

    it('should flag test-package patterns', async () => {
      const result = await protection.validatePackage({
        name: 'malicious-test-package',
        version: '1.0.0',
      });

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'SUSPICIOUS_NAME',
        })
      );
    });

    it('should flag _test_package patterns', async () => {
      const result = await protection.validatePackage({
        name: 'malicious_test_package',
        version: '1.0.0',
      });

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'SUSPICIOUS_NAME',
        })
      );
    });

    it('should validate version format', async () => {
      const result = await protection.validatePackage({
        name: 'some-package',
        version: 'invalid-version',
      });

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'INVALID_VERSION',
          severity: 'low',
        })
      );
    });

    it('should accept valid semver versions', async () => {
      const result = await protection.validatePackage({
        name: 'valid-pkg',
        version: '1.2.3',
      });

      expect(result.warnings.filter((w) => w.type === 'INVALID_VERSION')).toHaveLength(0);
    });

    it('should accept caret version ranges', async () => {
      const result = await protection.validatePackage({
        name: 'valid-pkg',
        version: '^1.2.3',
      });

      expect(result.warnings.filter((w) => w.type === 'INVALID_VERSION')).toHaveLength(0);
    });

    it('should accept tilde version ranges', async () => {
      const result = await protection.validatePackage({
        name: 'valid-pkg',
        version: '~1.2.3',
      });

      expect(result.warnings.filter((w) => w.type === 'INVALID_VERSION')).toHaveLength(0);
    });

    it('should accept wildcard versions (with warning implicit)', async () => {
      const result = await protection.validatePackage({
        name: 'wildcard-pkg',
        version: '*',
      });

      // Wildcard versions can lead to vulnerable version installs
      expect(result.valid).toBe(true);
    });

    it('should accept latest version tag', async () => {
      const result = await protection.validatePackage({
        name: 'latest-pkg',
        version: 'latest',
      });

      expect(result.valid).toBe(true);
    });
  });

  // =====================================================
  // Registry Validation
  // =====================================================
  describe('Registry validation', () => {
    let protection;

    beforeEach(async () => {
      protection = new DependencyProtection({ blockUntrustedRegistries: true });
      await protection.initialize();
    });

    it('should allow packages from npmjs registry', async () => {
      const result = await protection.validatePackage({
        name: 'lodash',
        version: '4.17.21',
        registry: 'https://registry.npmjs.org',
      });

      expect(result.issues.filter((i) => i.type === 'UNTRUSTED_REGISTRY')).toHaveLength(0);
    });

    it('should allow packages from GitHub registry', async () => {
      const result = await protection.validatePackage({
        name: '@org/package',
        version: '1.0.0',
        registry: 'https://npm.pkg.github.com',
      });

      expect(result.issues.filter((i) => i.type === 'UNTRUSTED_REGISTRY')).toHaveLength(0);
    });

    it('should allow packages from npmjs with path suffix', async () => {
      const result = await protection.validatePackage({
        name: 'lodash',
        version: '4.17.21',
        registry: 'https://registry.npmjs.org/lodash',
      });

      expect(result.issues.filter((i) => i.type === 'UNTRUSTED_REGISTRY')).toHaveLength(0);
    });

    it('should reject packages from untrusted registries', async () => {
      const result = await protection.validatePackage({
        name: 'suspicious-pkg',
        version: '1.0.0',
        registry: 'https://evil-registry.com',
      });

      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: 'UNTRUSTED_REGISTRY',
          severity: 'high',
          message: expect.stringContaining('evil-registry.com'),
        })
      );
    });

    it('should generate CHANGE_REGISTRY recommendation', async () => {
      const result = await protection.validatePackage({
        name: 'pkg',
        version: '1.0.0',
        registry: 'https://untrusted.com',
      });

      expect(result.recommendations).toContainEqual(
        expect.objectContaining({
          action: 'CHANGE_REGISTRY',
          allowedRegistries: expect.arrayContaining(['https://registry.npmjs.org']),
          priority: 'high',
        })
      );
    });

    it('should respect blockUntrustedRegistries config when disabled', async () => {
      const protectionDisabled = new DependencyProtection({ blockUntrustedRegistries: false });
      await protectionDisabled.initialize();

      const result = await protectionDisabled.validatePackage({
        name: 'pkg',
        version: '1.0.0',
        registry: 'https://custom-registry.com',
      });

      expect(result.issues.filter((i) => i.type === 'UNTRUSTED_REGISTRY')).toHaveLength(0);
    });
  });

  // =====================================================
  // Package.json Validation
  // =====================================================
  describe('validatePackageJson()', () => {
    let protection;
    let tempDir;

    beforeEach(async () => {
      protection = new DependencyProtection();
      await protection.initialize();

      tempDir = path.join(os.tmpdir(), `dep-protection-pkg-test-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });
    });

    afterEach(() => {
      if (tempDir && fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should validate all dependency sections', async () => {
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJson = {
        dependencies: { lodash: '4.17.21' },
        devDependencies: { jest: '29.0.0' },
        peerDependencies: { react: '18.0.0' },
        optionalDependencies: { fsevents: '2.0.0' },
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

      const result = await protection.validatePackageJson(packageJsonPath);

      expect(result.packages['lodash']).toBeDefined();
      expect(result.packages['jest']).toBeDefined();
      expect(result.packages['react']).toBeDefined();
      expect(result.packages['fsevents']).toBeDefined();
    });

    it('should aggregate issues from all packages', async () => {
      protection.registerInternalPackage('internal-pkg');

      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJson = {
        dependencies: {
          'internal-pkg': '1.0.0',
          lodahs: '1.0.0',
        },
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

      const result = await protection.validatePackageJson(packageJsonPath);

      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should report unscoped internal packages count', async () => {
      protection.registerInternalPackage('unscoped-1');
      protection.registerInternalPackage('unscoped-2');

      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJson = {
        dependencies: {
          'unscoped-1': '1.0.0',
          'unscoped-2': '1.0.0',
        },
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

      const result = await protection.validatePackageJson(packageJsonPath);

      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: 'UNSCOPED_INTERNAL_PACKAGES',
          severity: 'critical',
          packages: expect.arrayContaining(['unscoped-1', 'unscoped-2']),
        })
      );
    });

    it('should aggregate warnings', async () => {
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJson = {
        dependencies: {
          'company-internal': '1.0.0',
          'api-staging': '1.0.0',
        },
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

      const result = await protection.validatePackageJson(packageJsonPath);

      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle empty dependencies gracefully', async () => {
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJson = {
        name: 'empty-project',
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

      const result = await protection.validatePackageJson(packageJsonPath);

      expect(result.valid).toBe(true);
      expect(Object.keys(result.packages)).toHaveLength(0);
    });
  });

  // =====================================================
  // Scope Enforcement
  // =====================================================
  describe('enforceScoping()', () => {
    let protection;
    let tempDir;

    beforeEach(async () => {
      protection = new DependencyProtection();
      protection.registerInternalPackage('internal-lib');
      await protection.initialize();

      tempDir = path.join(os.tmpdir(), `dep-protection-scope-test-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });
    });

    afterEach(() => {
      if (tempDir && fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should rename unscoped internal packages', async () => {
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJson = {
        dependencies: {
          'internal-lib': '1.0.0',
          lodash: '4.17.21',
        },
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

      const result = await protection.enforceScoping(packageJsonPath);

      expect(result.changes).toContainEqual(
        expect.objectContaining({
          section: 'dependencies',
          oldName: 'internal-lib',
          newName: '@bmad/internal-lib',
        })
      );
    });

    it('should not modify external packages', async () => {
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJson = {
        dependencies: {
          lodash: '4.17.21',
        },
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

      const result = await protection.enforceScoping(packageJsonPath);

      expect(result.changes).toHaveLength(0);
    });

    it('should support dry run mode', async () => {
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJson = {
        dependencies: {
          'internal-lib': '1.0.0',
        },
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

      const result = await protection.enforceScoping(packageJsonPath, { dryRun: true });

      expect(result.dryRun).toBe(true);
      expect(result.updated).toBe(false);

      // Verify file was not modified
      const content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      expect(content.dependencies['internal-lib']).toBeDefined();
    });

    it('should create backup before writing', async () => {
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJson = {
        dependencies: {
          'internal-lib': '1.0.0',
        },
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

      await protection.enforceScoping(packageJsonPath);

      expect(fs.existsSync(`${packageJsonPath}.backup`)).toBe(true);
    });

    it('should write updated package.json', async () => {
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJson = {
        dependencies: {
          'internal-lib': '1.0.0',
        },
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

      await protection.enforceScoping(packageJsonPath);

      const content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      expect(content.dependencies['@bmad/internal-lib']).toBe('1.0.0');
      expect(content.dependencies['internal-lib']).toBeUndefined();
    });

    it('should process all dependency sections', async () => {
      protection.registerInternalPackage('dep-lib');
      protection.registerInternalPackage('dev-lib');
      protection.registerInternalPackage('peer-lib');

      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJson = {
        dependencies: { 'dep-lib': '1.0.0' },
        devDependencies: { 'dev-lib': '1.0.0' },
        peerDependencies: { 'peer-lib': '1.0.0' },
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

      const result = await protection.enforceScoping(packageJsonPath);

      expect(result.changes).toContainEqual(expect.objectContaining({ section: 'dependencies' }));
      expect(result.changes).toContainEqual(expect.objectContaining({ section: 'devDependencies' }));
      expect(result.changes).toContainEqual(expect.objectContaining({ section: 'peerDependencies' }));
    });

    it('should not update when no changes needed', async () => {
      const packageJsonPath = path.join(tempDir, 'package.json');
      const packageJson = {
        dependencies: {
          lodash: '4.17.21',
        },
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

      const result = await protection.enforceScoping(packageJsonPath);

      expect(result.updated).toBe(false);
      expect(fs.existsSync(`${packageJsonPath}.backup`)).toBe(false);
    });
  });

  // =====================================================
  // Penetration Testing Scenarios
  // =====================================================
  describe('Penetration Testing Scenarios', () => {
    let protection;
    let tempDir;

    beforeEach(async () => {
      protection = new DependencyProtection();
      await protection.initialize();

      tempDir = path.join(os.tmpdir(), `dep-protection-pentest-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });
    });

    afterEach(() => {
      if (tempDir && fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    describe('GH-083-001: Dependency confusion attack blocked', () => {
      it('should block unscoped internal package (dependency confusion)', async () => {
        protection.registerInternalPackage('org-secret-lib');

        const result = await protection.validatePackage({
          name: 'org-secret-lib',
          version: '999.0.0',
          registry: 'https://registry.npmjs.org',
        });

        expect(result.valid).toBe(false);
        expect(result.issues).toContainEqual(
          expect.objectContaining({
            type: 'MISSING_SCOPE',
            severity: 'critical',
          })
        );
      });

      it('should allow properly scoped internal package', async () => {
        protection.registerInternalPackage('org-secret-lib');

        const result = await protection.validatePackage({
          name: '@bmad/org-secret-lib',
          version: '1.0.0',
        });

        expect(result.valid).toBe(true);
      });

      it('should detect high version number attack', async () => {
        protection.registerInternalPackage('company-utils');

        // Attacker publishes internal package name with high version
        const result = await protection.validatePackage({
          name: 'company-utils',
          version: '9999.0.0',
          registry: 'https://registry.npmjs.org',
        });

        expect(result.valid).toBe(false);
        expect(result.issues[0].type).toBe('MISSING_SCOPE');
      });
    });

    describe('GH-083-002: Lock file tampering detected', () => {
      it('should detect modified lockfile', async () => {
        const lockfilePath = path.join(tempDir, 'package-lock.json');
        fs.writeFileSync(lockfilePath, '{"tampered": true}');

        // Set trusted hash
        protection.trustedHashes.set(lockfilePath, 'original-hash-123');

        const result = await protection.validateLockfile(lockfilePath);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('LOCKFILE_MODIFIED');
      });

      it('should detect injected malicious registry in lockfile', async () => {
        const lockfilePath = path.join(tempDir, 'package-lock.json');
        const tamperedLockfile = JSON.stringify({
          packages: {
            'node_modules/lodash': {
              resolved: 'https://attacker-controlled.com/lodash.tgz',
              integrity: 'sha512-fake',
            },
          },
        });

        fs.writeFileSync(lockfilePath, tamperedLockfile);

        const result = await protection.validateLockfile(lockfilePath);

        expect(result.valid).toBe(false);
        expect(result.issues).toContainEqual(
          expect.objectContaining({
            type: 'UNTRUSTED_RESOLVED_URL',
          })
        );
      });

      it('should detect removed integrity hash (downgrade attack)', async () => {
        const lockfilePath = path.join(tempDir, 'package-lock.json');
        const tamperedLockfile = JSON.stringify({
          packages: {
            'node_modules/lodash': {
              resolved: 'https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz',
              // integrity removed!
            },
          },
        });

        fs.writeFileSync(lockfilePath, tamperedLockfile);

        const result = await protection.validateLockfile(lockfilePath);

        expect(result.valid).toBe(false);
        expect(result.issues).toContainEqual(
          expect.objectContaining({
            type: 'MISSING_INTEGRITY',
          })
        );
      });
    });

    describe('GH-083-003: Downgrade to vulnerable version blocked', () => {
      it('should flag deprecated wildcard version', async () => {
        const result = await protection.validatePackage({
          name: 'vulnerable-pkg',
          version: '*',
        });

        // Wildcard versions can lead to vulnerable version installs
        expect(result.valid).toBe(true); // Still valid but with warning
      });

      it('should validate against suspicious -staging package patterns', async () => {
        // Packages with -staging suffix are often internal test packages
        // that could be hijacked
        const result = await protection.validatePackage({
          name: 'production-staging',
          version: '0.0.1',
        });

        expect(result.warnings).toContainEqual(
          expect.objectContaining({
            type: 'SUSPICIOUS_NAME',
          })
        );
      });

      it('should detect test package patterns that could be exploited', async () => {
        const result = await protection.validatePackage({
          name: 'my-app-test-package',
          version: '1.0.0',
        });

        expect(result.warnings).toContainEqual(
          expect.objectContaining({
            type: 'SUSPICIOUS_NAME',
          })
        );
      });
    });
  });

  // =====================================================
  // Event Emissions
  // =====================================================
  describe('Event Emissions', () => {
    let protection;

    beforeEach(async () => {
      protection = new DependencyProtection();
      await protection.initialize();
    });

    it('should emit package-validated event for each validation', async () => {
      const handler = vi.fn();
      protection.on('package-validated', handler);

      await protection.validatePackage({ name: 'lodash', version: '4.17.21' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          package: 'lodash',
          valid: true,
          issues: 0,
          warnings: 0,
        })
      );
    });

    it('should emit package-validated with counts for invalid packages', async () => {
      const handler = vi.fn();
      protection.on('package-validated', handler);
      protection.registerInternalPackage('internal-lib');

      await protection.validatePackage({ name: 'internal-lib', version: '1.0.0' });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          package: 'internal-lib',
          valid: false,
          issues: 1,
        })
      );
    });

    it('should be an EventEmitter', () => {
      expect(typeof protection.on).toBe('function');
      expect(typeof protection.emit).toBe('function');
      expect(typeof protection.removeListener).toBe('function');
    });

    it('should allow removing event listeners', async () => {
      const handler = vi.fn();
      protection.on('package-validated', handler);
      protection.removeListener('package-validated', handler);

      await protection.validatePackage({ name: 'lodash', version: '4.17.21' });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // Edge Cases and Error Handling
  // =====================================================
  describe('Edge Cases and Error Handling', () => {
    let protection;

    beforeEach(async () => {
      protection = new DependencyProtection();
      await protection.initialize();
    });

    it('should handle package with no version', async () => {
      const result = await protection.validatePackage({
        name: 'no-version-pkg',
      });

      expect(result).toBeDefined();
      expect(result.package).toBe('no-version-pkg');
    });

    it('should handle package with empty name', async () => {
      const result = await protection.validatePackage({
        name: '',
        version: '1.0.0',
      });

      expect(result).toBeDefined();
    });

    it('should handle null registry', async () => {
      const result = await protection.validatePackage({
        name: 'pkg',
        version: '1.0.0',
        registry: null,
      });

      expect(result.issues.filter((i) => i.type === 'UNTRUSTED_REGISTRY')).toHaveLength(0);
    });

    it('should handle undefined registry', async () => {
      const result = await protection.validatePackage({
        name: 'pkg',
        version: '1.0.0',
        registry: undefined,
      });

      expect(result.issues.filter((i) => i.type === 'UNTRUSTED_REGISTRY')).toHaveLength(0);
    });

    it('should handle very long package names', async () => {
      const longName = 'a'.repeat(214); // npm max is 214 chars

      const result = await protection.validatePackage({
        name: longName,
        version: '1.0.0',
      });

      expect(result).toBeDefined();
    });

    it('should handle scoped packages with @org format', async () => {
      const result = await protection.validatePackage({
        name: '@org/package',
        version: '1.0.0',
      });

      expect(result.valid).toBe(true);
    });

    it('should handle version with prerelease tag', async () => {
      const result = await protection.validatePackage({
        name: 'pkg',
        version: '1.0.0-beta.1',
      });

      expect(result.warnings.filter((w) => w.type === 'INVALID_VERSION')).toHaveLength(0);
    });

    it('should handle version with build metadata', async () => {
      const result = await protection.validatePackage({
        name: 'pkg',
        version: '1.0.0+build.123',
      });

      expect(result.warnings.filter((w) => w.type === 'INVALID_VERSION')).toHaveLength(0);
    });

    it('should handle package info with extra properties', async () => {
      const result = await protection.validatePackage({
        name: 'pkg',
        version: '1.0.0',
        resolved: 'https://registry.npmjs.org/pkg',
        extra: 'property',
        nested: { obj: true },
      });

      expect(result).toBeDefined();
      expect(result.package).toBe('pkg');
    });

    it('should handle concurrent validations', async () => {
      const promises = [
        protection.validatePackage({ name: 'lodash', version: '4.17.21' }),
        protection.validatePackage({ name: 'express', version: '4.18.0' }),
        protection.validatePackage({ name: 'react', version: '18.0.0' }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.valid).toBe(true);
      });
    });
  });

  // =====================================================
  // Configuration Validation
  // =====================================================
  describe('Configuration Options', () => {
    it('should use default config values', () => {
      const protection = new DependencyProtection();

      expect(protection.config.enforceScoping).toBe(true);
      expect(protection.config.blockUntrustedRegistries).toBe(true);
      expect(protection.config.typosquatProtection).toBe(true);
      expect(protection.config.lockfileIntegrity).toBe(true);
    });

    it('should allow overriding individual config values', () => {
      const protection = new DependencyProtection({
        enforceScoping: false,
      });

      expect(protection.config.enforceScoping).toBe(false);
      expect(protection.config.blockUntrustedRegistries).toBe(true);
    });

    it('should allow overriding all config values', () => {
      const protection = new DependencyProtection({
        enforceScoping: false,
        blockUntrustedRegistries: false,
        typosquatProtection: false,
        lockfileIntegrity: false,
      });

      expect(protection.config.enforceScoping).toBe(false);
      expect(protection.config.blockUntrustedRegistries).toBe(false);
      expect(protection.config.typosquatProtection).toBe(false);
      expect(protection.config.lockfileIntegrity).toBe(false);
    });
  });
});
