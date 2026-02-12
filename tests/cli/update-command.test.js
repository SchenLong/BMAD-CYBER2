/**
 * CLI Update Command Tests (P6-27)
 *
 * Validates tools/cli/commands/update.js structure, exports, version
 * comparison logic, PRESERVE_FILES protection, and error handling.
 * Does NOT actually run update (would modify filesystem + hit network).
 */

import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const CLI_PATH = resolve(import.meta.dirname, '../../tools/cli/bmad-cli.js');
const UPDATE_PATH = resolve(import.meta.dirname, '../../tools/cli/commands/update.js');
const NODE_BIN = process.execPath;

describe('CLI Update Command', () => {

  // --------------------------------------------------------------------------
  // 1. Module Structure and Exports
  // --------------------------------------------------------------------------
  describe('Module Structure', () => {
    it('should have update.js command file', () => {
      expect(existsSync(UPDATE_PATH)).toBe(true);
    });

    it('should be importable as ESM', async () => {
      const mod = await import(UPDATE_PATH);
      expect(mod.updateCommand).toBeDefined();
      expect(typeof mod.updateCommand).toBe('function');
    });

    it('should use ESM imports (not CJS require)', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toMatch(/^import\s/m);
      expect(content).not.toMatch(/\brequire\(/);
    });

    it('should use prompts abstraction (not inquirer)', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).not.toMatch(/from\s+['"]inquirer['"]/);
    });

    it('should use picocolors (not chalk)', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).not.toMatch(/from\s+['"]chalk['"]/);
    });

    it('should use createSpinner (not ora)', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).not.toMatch(/from\s+['"]ora['"]/);
      expect(content).toContain('createSpinner');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Help Output
  // --------------------------------------------------------------------------
  describe('Help Output', () => {
    it('should display update command help', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN, [CLI_PATH, 'update', '--help'], { timeout: 15000 }
      );
      expect(stdout.toLowerCase()).toContain('update');
    });

    it('should have --check option', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN, [CLI_PATH, 'update', '--help'], { timeout: 15000 }
      );
      expect(stdout).toContain('--check');
    });

    it('should have --force option', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN, [CLI_PATH, 'update', '--help'], { timeout: 15000 }
      );
      expect(stdout).toContain('--force');
    });

    it('should have --version option', async () => {
      const { stdout } = await execFileAsync(
        NODE_BIN, [CLI_PATH, 'update', '--help'], { timeout: 15000 }
      );
      expect(stdout).toContain('--version');
    });
  });

  // --------------------------------------------------------------------------
  // 3. PRESERVE_FILES Logic
  // --------------------------------------------------------------------------
  describe('PRESERVE_FILES', () => {
    it('should define a PRESERVE_FILES list', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('PRESERVE_FILES');
    });

    it('should preserve .claude/settings.json (critical security config)', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('.claude/settings.json');
    });

    it('should preserve .claude/settings.local.json', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('.claude/settings.local.json');
    });

    it('should preserve .env file', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toMatch(/PRESERVE_FILES[\s\S]*?'\.env'/);
    });

    it('should preserve .env.local file', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('.env.local');
    });

    it('should preserve core config.yaml', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('config.yaml');
    });

    it('should have backup and restore functions', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toMatch(/backupConfigurations/);
      expect(content).toMatch(/restoreConfigurations/);
    });

    it('should create backup before extraction and restore after', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      const backupIdx = content.indexOf('backupConfigurations(');
      const extractIdx = content.indexOf('extractFramework(');
      const restoreIdx = content.indexOf('restoreConfigurations(');
      expect(backupIdx).toBeGreaterThan(0);
      expect(extractIdx).toBeGreaterThan(0);
      expect(restoreIdx).toBeGreaterThan(0);
      expect(backupIdx).toBeLessThan(extractIdx);
      expect(extractIdx).toBeLessThan(restoreIdx);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Version Comparison Logic
  // --------------------------------------------------------------------------
  describe('Version Comparison', () => {
    it('should have isNewerVersion function', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('function isNewerVersion');
    });

    it('should have isDowngrade function for security', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('function isDowngrade');
    });

    it('should have isValidVersionFormat function', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('function isValidVersionFormat');
    });

    it('should strip v prefix before comparing', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      const newerFn = content.slice(content.indexOf('function isNewerVersion'));
      expect(newerFn).toContain(".replace('v', '')");
    });

    it('should treat unknown current version as needing update', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain("current === 'unknown'");
    });
  });

  // --------------------------------------------------------------------------
  // 5. Downgrade Protection
  // --------------------------------------------------------------------------
  describe('Downgrade Protection', () => {
    it('should warn on downgrade attempt', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toMatch(/downgrade/i);
      expect(content).toMatch(/SECURITY WARNING/i);
    });

    it('should require confirmation for downgrade unless --force', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('options.force');
    });

    it('should check isDowngrade before isNewerVersion in the flow', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      const fnStart = content.indexOf('export async function updateCommand') !== -1
        ? content.indexOf('export async function updateCommand')
        : content.indexOf('async function updateCommand');
      const fnBody = content.slice(fnStart);
      const downgradeIdx = fnBody.indexOf('isDowngrade(');
      const newerIdx = fnBody.indexOf('isNewerVersion(');
      expect(downgradeIdx).toBeGreaterThan(0);
      expect(newerIdx).toBeGreaterThan(0);
      expect(downgradeIdx).toBeLessThan(newerIdx);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Rollback on Failure
  // --------------------------------------------------------------------------
  describe('Rollback on Failure', () => {
    it('should have rollback logic in catch block', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('restoreConfigurations(backupDir');
    });

    it('should handle restore failure with nested try-catch', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      const catchBlock = content.slice(content.indexOf('} catch (error)'));
      expect(catchBlock).toContain('catch (restoreError)');
    });

    it('should inform user of backup location if restore fails', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('Backup files are at');
    });
  });

  // --------------------------------------------------------------------------
  // 7. Error Handling
  // --------------------------------------------------------------------------
  describe('Error Handling', () => {
    it('should detect when BMAD is not installed', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('BMAD-CYBER not detected');
    });

    it('should reject invalid version format', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('Invalid version format');
    });

    it('should handle GitHub API rate limits', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('rate limit');
    });

    it('should handle release not found', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('not found');
    });

    it('should exit with code 1 on failure', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('process.exit(1)');
    });
  });

  // --------------------------------------------------------------------------
  // 8. Dependencies
  // --------------------------------------------------------------------------
  describe('Dependencies', () => {
    it('should import from local lib modules', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('../lib/downloader.js');
      expect(content).toContain('../lib/extractor.js');
      expect(content).toContain('../lib/logger.js');
      expect(content).toContain('../lib/config.js');
    });

    it('should use confirm from prompts', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toMatch(/import.*confirm.*from.*prompts/s);
    });

    it('should use picocolors for terminal output', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('picocolors');
    });
  });

  // --------------------------------------------------------------------------
  // 9. --check Flag
  // --------------------------------------------------------------------------
  describe('--check Flag', () => {
    it('should support --check option', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('options.check');
    });

    it('should return early when --check is used', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      const checkBlock = content.slice(content.indexOf('options.check'));
      const returnIdx = checkBlock.indexOf('return;');
      expect(returnIdx).toBeGreaterThan(0);
      expect(returnIdx).toBeLessThan(300);
    });

    it('should show latest version message when up to date', () => {
      const content = readFileSync(UPDATE_PATH, 'utf-8');
      expect(content).toContain('latest version');
    });
  });
});
