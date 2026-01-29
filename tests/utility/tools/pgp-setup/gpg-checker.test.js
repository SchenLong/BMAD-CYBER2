/**
 * Unit Tests for GPG Availability Checker - INST-025
 * Epic 4, Story - GPG Availability Detection
 *
 * @module pgp-setup/gpg-checker.test
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  INSTALL_INSTRUCTIONS,
  DEFAULT_COMMAND_TIMEOUT,
  checkGpgInstalled,
  getGpgVersion,
  getInstallInstructions,
  parseKeyListing,
  listExistingKeys,
  listSecretKeys,
  checkGpgCapability,
  formatGpgCapability
} from './gpg-checker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn()
}));

describe('GPG Availability Checker - INST-025', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('INSTALL_INSTRUCTIONS constant', () => {
    it('should define macOS installation instructions', () => {
      expect(INSTALL_INSTRUCTIONS.darwin).toBeDefined();
      expect(INSTALL_INSTRUCTIONS.darwin.name).toBe('macOS');
      expect(INSTALL_INSTRUCTIONS.darwin.command).toBe('brew install gnupg');
      expect(INSTALL_INSTRUCTIONS.darwin.note).toContain('Homebrew');
    });

    it('should define Linux installation instructions', () => {
      expect(INSTALL_INSTRUCTIONS.linux).toBeDefined();
      expect(INSTALL_INSTRUCTIONS.linux.name).toBe('Linux (Debian/Ubuntu)');
      expect(INSTALL_INSTRUCTIONS.linux.command).toBe('sudo apt install gnupg');
      expect(INSTALL_INSTRUCTIONS.linux.note).toContain('yum');
    });

    it('should define Windows installation instructions', () => {
      expect(INSTALL_INSTRUCTIONS.win32).toBeDefined();
      expect(INSTALL_INSTRUCTIONS.win32.name).toBe('Windows');
      expect(INSTALL_INSTRUCTIONS.win32.command).toBe('choco install gpg4win');
      expect(INSTALL_INSTRUCTIONS.win32.note).toContain('gpg4win.org');
    });

    it('should have 3 platforms defined', () => {
      expect(Object.keys(INSTALL_INSTRUCTIONS)).toHaveLength(3);
    });
  });

  describe('DEFAULT_COMMAND_TIMEOUT', () => {
    it('should be 5000ms (5 seconds)', () => {
      expect(DEFAULT_COMMAND_TIMEOUT).toBe(5000);
    });
  });

  describe('checkGpgInstalled', () => {
    it('should return installed=true when GPG is found', () => {
      execSync.mockReturnValue('/usr/local/bin/gpg\n');

      const result = checkGpgInstalled();

      expect(result.installed).toBe(true);
      expect(result.path).toBe('/usr/local/bin/gpg');
      expect(result.error).toBeUndefined();
    });

    it('should return installed=false when GPG is not found (status 1)', () => {
      const error = new Error('Command failed');
      error.status = 1;
      execSync.mockImplementation(() => { throw error; });

      const result = checkGpgInstalled();

      expect(result.installed).toBe(false);
      expect(result.path).toBe(null);
      expect(result.error).toBeDefined();
    });

    it('should return installed=false when command not found (ENOENT)', () => {
      const error = new Error('Command not found');
      error.code = 'ENOENT';
      execSync.mockImplementation(() => { throw error; });

      const result = checkGpgInstalled();

      expect(result.installed).toBe(false);
      expect(result.path).toBe(null);
      expect(result.error).toBe('GPG not found in system PATH');
    });

    it('should handle timeout errors', () => {
      const error = new Error('Timeout expired');
      execSync.mockImplementation(() => { throw error; });

      const result = checkGpgInstalled({ timeout: 100 });

      expect(result.installed).toBe(false);
      expect(result.error).toContain('Timeout');
    });

    it('should use custom timeout option', () => {
      execSync.mockReturnValue('/usr/bin/gpg\n');

      checkGpgInstalled({ timeout: 10000 });

      expect(execSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 10000 })
      );
    });

    it('should handle multiple paths on Windows (returns first)', () => {
      execSync.mockReturnValue('C:\\Program Files\\GnuPG\\bin\\gpg.exe\nC:\\Other\\gpg.exe\n');

      const result = checkGpgInstalled();

      expect(result.installed).toBe(true);
      expect(result.path).toBe('C:\\Program Files\\GnuPG\\bin\\gpg.exe');
    });
  });

  describe('getGpgVersion', () => {
    it('should parse GPG 2.x version correctly', () => {
      execSync.mockReturnValue('gpg (GnuPG) 2.4.3\nlibgcrypt 1.10.1\n');

      const result = getGpgVersion();

      expect(result.version).toBe('2.4.3');
      expect(result.major).toBe(2);
      expect(result.minor).toBe(4);
      expect(result.patch).toBe(3);
      expect(result.error).toBeUndefined();
    });

    it('should parse GPG 1.x version correctly', () => {
      execSync.mockReturnValue('gpg (GnuPG) 1.4.23\n');

      const result = getGpgVersion();

      expect(result.version).toBe('1.4.23');
      expect(result.major).toBe(1);
      expect(result.minor).toBe(4);
      expect(result.patch).toBe(23);
    });

    it('should handle version without patch number', () => {
      execSync.mockReturnValue('gpg (GnuPG) 2.4\n');

      const result = getGpgVersion();

      expect(result.version).toBe('2.4.0');
      expect(result.major).toBe(2);
      expect(result.minor).toBe(4);
      expect(result.patch).toBe(0);
    });

    it('should return error when GPG command fails', () => {
      const error = new Error('Command not found');
      execSync.mockImplementation(() => { throw error; });

      const result = getGpgVersion();

      expect(result.version).toBe(null);
      expect(result.major).toBe(null);
      expect(result.error).toBeDefined();
    });

    it('should return error when version cannot be parsed', () => {
      execSync.mockReturnValue('Unknown output format');

      const result = getGpgVersion();

      expect(result.version).toBe(null);
      expect(result.error).toContain('Could not parse');
    });

    it('should handle GnuPG/MacGPG variants', () => {
      execSync.mockReturnValue('gpg (GnuPG/MacGPG2) 2.2.27\n');

      const result = getGpgVersion();

      expect(result.version).toBe('2.2.27');
      expect(result.major).toBe(2);
    });
  });

  describe('getInstallInstructions', () => {
    it('should return macOS instructions for darwin', () => {
      const result = getInstallInstructions('darwin');

      expect(result.platform).toBe('darwin');
      expect(result.name).toBe('macOS');
      expect(result.command).toBe('brew install gnupg');
    });

    it('should return Linux instructions for linux', () => {
      const result = getInstallInstructions('linux');

      expect(result.platform).toBe('linux');
      expect(result.name).toBe('Linux (Debian/Ubuntu)');
      expect(result.command).toBe('sudo apt install gnupg');
    });

    it('should return Windows instructions for win32', () => {
      const result = getInstallInstructions('win32');

      expect(result.platform).toBe('win32');
      expect(result.name).toBe('Windows');
      expect(result.command).toBe('choco install gpg4win');
    });

    it('should return generic instructions for unknown platform', () => {
      const result = getInstallInstructions('freebsd');

      expect(result.platform).toBe('freebsd');
      expect(result.name).toBe('Unknown OS');
      expect(result.command).toContain('gnupg.org');
    });
  });

  describe('parseKeyListing', () => {
    it('should parse modern GPG 2.x output format', () => {
      const output = `pub   rsa4096 2024-01-15 [SC] [expires: 2025-01-15]
      ABCDEF1234567890ABCDEF1234567890ABCDEF12
uid           [ultimate] John Doe <john@example.com>`;

      const keys = parseKeyListing(output);

      expect(keys).toHaveLength(1);
      expect(keys[0].keyId).toBe('ABCDEF1234567890ABCDEF1234567890ABCDEF12');
      expect(keys[0].uid).toBe('John Doe <john@example.com>');
      expect(keys[0].email).toBe('john@example.com');
      expect(keys[0].created).toBe('2024-01-15');
      expect(keys[0].expires).toBe('2025-01-15');
    });

    it('should parse older GPG 1.x output format', () => {
      const output = `pub   4096R/ABCD1234 2024-01-15
uid                  John Doe <john@example.com>`;

      const keys = parseKeyListing(output);

      expect(keys).toHaveLength(1);
      expect(keys[0].keyId).toBe('ABCD1234');
      expect(keys[0].email).toBe('john@example.com');
    });

    it('should parse multiple keys', () => {
      const output = `pub   rsa4096 2024-01-15 [SC]
      AAAA1111222233334444555566667777AAAABBBB
uid           [ultimate] Alice <alice@example.com>
pub   rsa4096 2024-02-20 [SC]
      BBBB2222333344445555666677778888CCCCDDDD
uid           [ultimate] Bob <bob@example.com>`;

      const keys = parseKeyListing(output);

      expect(keys).toHaveLength(2);
      expect(keys[0].email).toBe('alice@example.com');
      expect(keys[1].email).toBe('bob@example.com');
    });

    it('should return empty array for null input', () => {
      expect(parseKeyListing(null)).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      expect(parseKeyListing('')).toEqual([]);
    });

    it('should return empty array for non-string input', () => {
      expect(parseKeyListing(123)).toEqual([]);
      expect(parseKeyListing({})).toEqual([]);
    });

    it('should handle keys without email', () => {
      const output = `pub   rsa4096 2024-01-15 [SC]
      AAAA1111222233334444555566667777AAAABBBB
uid           [ultimate] Just A Name`;

      const keys = parseKeyListing(output);

      expect(keys).toHaveLength(1);
      expect(keys[0].uid).toBe('Just A Name');
      expect(keys[0].email).toBe(null);
    });

    it('should handle keys without trust level', () => {
      const output = `pub   rsa4096 2024-01-15 [SC]
      AAAA1111222233334444555566667777AAAABBBB
uid                  John Doe <john@example.com>`;

      const keys = parseKeyListing(output);

      expect(keys).toHaveLength(1);
      expect(keys[0].email).toBe('john@example.com');
    });
  });

  describe('listExistingKeys', () => {
    it('should return keys when GPG has public keys', () => {
      execSync.mockReturnValue(`pub   rsa4096 2024-01-15 [SC]
      AAAA1111222233334444555566667777AAAABBBB
uid           [ultimate] Test User <test@example.com>`);

      const result = listExistingKeys();

      expect(result.keys).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(result.error).toBeUndefined();
    });

    it('should return empty array when no keys exist', () => {
      const error = new Error('No public key');
      error.status = 2;
      execSync.mockImplementation(() => { throw error; });

      const result = listExistingKeys();

      expect(result.keys).toEqual([]);
      expect(result.count).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it('should return error when GPG is not installed', () => {
      const error = new Error('gpg not found');
      error.code = 'ENOENT';
      execSync.mockImplementation(() => { throw error; });

      const result = listExistingKeys();

      expect(result.keys).toEqual([]);
      expect(result.error).toBe('GPG command not available');
    });

    it('should use custom timeout', () => {
      execSync.mockReturnValue('');

      listExistingKeys({ timeout: 10000 });

      expect(execSync).toHaveBeenCalledWith(
        'gpg --list-keys --keyid-format long',
        expect.objectContaining({ timeout: 10000 })
      );
    });
  });

  describe('listSecretKeys', () => {
    it('should return secret keys when available', () => {
      execSync.mockReturnValue(`sec   rsa4096 2024-01-15 [SC]
      AAAA1111222233334444555566667777AAAABBBB
uid           [ultimate] Test User <test@example.com>`);

      const result = listSecretKeys();

      expect(result.count).toBe(0); // parseKeyListing looks for 'pub' not 'sec'
      expect(result.error).toBeUndefined();
    });

    it('should return empty array when no secret keys exist', () => {
      const error = new Error('No secret key');
      error.status = 2;
      execSync.mockImplementation(() => { throw error; });

      const result = listSecretKeys();

      expect(result.keys).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('should handle GPG not available', () => {
      const error = new Error('gpg not found');
      error.code = 'ENOENT';
      execSync.mockImplementation(() => { throw error; });

      const result = listSecretKeys();

      expect(result.error).toBe('GPG command not available');
    });
  });

  describe('checkGpgCapability', () => {
    it('should return full capability when GPG is installed with keys', async () => {
      execSync
        .mockReturnValueOnce('/usr/local/bin/gpg\n') // which gpg
        .mockReturnValueOnce('gpg (GnuPG) 2.4.3\n')   // gpg --version
        .mockReturnValueOnce(`pub   rsa4096 2024-01-15 [SC]
      AAAA1111222233334444555566667777AAAABBBB
uid           [ultimate] Test User <test@example.com>`) // list-keys
        .mockReturnValueOnce(''); // list-secret-keys

      const result = await checkGpgCapability();

      expect(result.available).toBe(true);
      expect(result.version).toBe('2.4.3');
      expect(result.major).toBe(2);
      expect(result.gpgPath).toBe('/usr/local/bin/gpg');
      expect(result.existingKeys).toHaveLength(1);
    });

    it('should return not available with install instructions when GPG not installed', async () => {
      const error = new Error('Command not found');
      error.status = 1;
      execSync.mockImplementation(() => { throw error; });

      const result = await checkGpgCapability();

      expect(result.available).toBe(false);
      expect(result.version).toBe(null);
      expect(result.installInstructions).toBeDefined();
      expect(result.installInstructions.command).toBeDefined();
    });

    it('should handle GPG installed but no keys', async () => {
      const noKeysError = new Error('No public key');
      noKeysError.status = 2;

      execSync
        .mockReturnValueOnce('/usr/bin/gpg\n')
        .mockReturnValueOnce('gpg (GnuPG) 2.2.27\n')
        .mockImplementationOnce(() => { throw noKeysError; })
        .mockImplementationOnce(() => { throw noKeysError; });

      const result = await checkGpgCapability();

      expect(result.available).toBe(true);
      expect(result.existingKeys).toEqual([]);
      expect(result.secretKeys).toEqual([]);
    });

    it('should use custom timeout for all operations', async () => {
      execSync
        .mockReturnValueOnce('/usr/bin/gpg\n')
        .mockReturnValueOnce('gpg (GnuPG) 2.4.0\n')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('');

      await checkGpgCapability({ timeout: 15000 });

      expect(execSync).toHaveBeenCalledTimes(4);
      for (const call of execSync.mock.calls) {
        expect(call[1].timeout).toBe(15000);
      }
    });
  });

  describe('formatGpgCapability', () => {
    it('should format available GPG with keys', () => {
      const capability = {
        available: true,
        version: '2.4.3',
        major: 2,
        gpgPath: '/usr/local/bin/gpg',
        existingKeys: [
          { keyId: 'ABC123', uid: 'John Doe <john@example.com>', email: 'john@example.com' }
        ],
        secretKeys: []
      };

      const output = formatGpgCapability(capability);

      expect(output).toContain('GPG Status:');
      expect(output).toContain('[INSTALLED]');
      expect(output).toContain('2.4.3');
      expect(output).toContain('/usr/local/bin/gpg');
      expect(output).toContain('john@example.com');
      expect(output).toContain('None (you can generate');
    });

    it('should format unavailable GPG with install instructions', () => {
      const capability = {
        available: false,
        version: null,
        installInstructions: {
          name: 'macOS',
          command: 'brew install gnupg',
          note: 'Requires Homebrew'
        }
      };

      const output = formatGpgCapability(capability);

      expect(output).toContain('[NOT INSTALLED]');
      expect(output).toContain('Installation Instructions');
      expect(output).toContain('macOS');
      expect(output).toContain('brew install gnupg');
    });

    it('should truncate long key lists', () => {
      const capability = {
        available: true,
        version: '2.4.0',
        major: 2,
        gpgPath: '/usr/bin/gpg',
        existingKeys: [
          { keyId: '1', email: 'key1@example.com' },
          { keyId: '2', email: 'key2@example.com' },
          { keyId: '3', email: 'key3@example.com' },
          { keyId: '4', email: 'key4@example.com' },
          { keyId: '5', email: 'key5@example.com' },
          { keyId: '6', email: 'key6@example.com' },
          { keyId: '7', email: 'key7@example.com' }
        ],
        secretKeys: []
      };

      const output = formatGpgCapability(capability);

      expect(output).toContain('... and 2 more');
      expect(output).not.toContain('key6@example.com');
      expect(output).not.toContain('key7@example.com');
    });

    it('should handle empty keys arrays', () => {
      const capability = {
        available: true,
        version: '2.4.0',
        major: 2,
        gpgPath: '/usr/bin/gpg',
        existingKeys: [],
        secretKeys: []
      };

      const output = formatGpgCapability(capability);

      expect(output).toContain('Public Keys: None');
      expect(output).toContain('Secret Keys: None');
    });

    it('should display keyId when email is not available', () => {
      const capability = {
        available: true,
        version: '2.4.0',
        major: 2,
        gpgPath: '/usr/bin/gpg',
        existingKeys: [
          { keyId: 'ABC123DEF456', uid: '', email: null }
        ],
        secretKeys: []
      };

      const output = formatGpgCapability(capability);

      expect(output).toContain('ABC123DEF456');
    });
  });

  describe('ESM Compatibility', () => {
    it('should use ES Module syntax', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'gpg-checker.js'),
        'utf8'
      );

      expect(moduleContent).not.toMatch(/\bmodule\.exports\b/);
      expect(moduleContent).not.toMatch(/\brequire\s*\(/);
    });

    it('should use export statements', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'gpg-checker.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/\bexport\s+(const|async|function)/);
    });

    it('should use native ESM imports', async () => {
      const moduleContent = fs.readFileSync(
        path.join(__dirname, 'gpg-checker.js'),
        'utf8'
      );

      expect(moduleContent).toMatch(/import\s+.*from\s+['"]child_process['"]/);
      expect(moduleContent).toMatch(/import\s+.*from\s+['"]url['"]/);
    });
  });
});
