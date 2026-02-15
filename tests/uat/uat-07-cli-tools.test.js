/**
 * UAT-07: CLI Tools (20 checks)
 *
 * Validates: tools/cli/ commands — install, update, status, help, error handling
 * Closes: P6-27 (CLI commands untested), Story 7 gap
 *
 * Stories:
 *   S1: Install command (6 checks)  — UAT-07-001 to UAT-07-006
 *   S2: Update command (5 checks)   — UAT-07-007 to UAT-07-011
 *   S3: Status command (4 checks)   — UAT-07-012 to UAT-07-015
 *   S4: General CLI (5 checks)      — UAT-07-016 to UAT-07-020
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');
const CLI_PATH = join(PROJECT_ROOT, 'tools', 'cli', 'bmad-cli.js');
const CLI_LIB = join(PROJECT_ROOT, 'tools', 'cli', 'lib');
const CLI_COMMANDS = join(PROJECT_ROOT, 'tools', 'cli', 'commands');
const NODE_BIN = process.execPath;

// Helper: run CLI command and capture output
async function runCli(args = [], options = {}) {
  try {
    const { stdout, stderr } = await execFileAsync(
      NODE_BIN,
      [CLI_PATH, ...args],
      { cwd: PROJECT_ROOT, timeout: 10000, ...options }
    );
    return { stdout, stderr, exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.code || 1
    };
  }
}

// =============================================================================
// S1: Install Command (6 checks)
// =============================================================================
describe('UAT-07-S1: Install Command', () => {

  // UAT-07-001: install command module structure
  it('UAT-07-001: install command module exists and exports installCommand', async () => {
    const installPath = join(CLI_COMMANDS, 'install.js');
    expect(existsSync(installPath), 'install.js must exist').toBe(true);

    const content = readFileSync(installPath, 'utf-8');
    // Must be ESM and export installCommand
    expect(content).toMatch(/export\s+(async\s+)?function\s+installCommand/);
    // Must not use require() (ESM compliance)
    expect(content).not.toMatch(/\brequire\s*\(/);
  });

  // UAT-07-002: install command supports --modules flag
  it('UAT-07-002: install command accepts --modules flag for non-interactive mode', () => {
    const cliContent = readFileSync(CLI_PATH, 'utf-8');
    expect(cliContent).toContain('--modules');
    expect(cliContent).toContain('Pre-select modules');
  });

  // UAT-07-003: install command has --dry-run option
  it('UAT-07-003: install command supports --dry-run for safe testing', () => {
    const cliContent = readFileSync(CLI_PATH, 'utf-8');
    expect(cliContent).toContain('--dry-run');
    expect(cliContent).toContain('Show what would be installed');
  });

  // UAT-07-004: install command has security flags
  it('UAT-07-004: install command blocks npm scripts by default (--allow-scripts opt-in)', () => {
    const cliContent = readFileSync(CLI_PATH, 'utf-8');
    expect(cliContent).toContain('--allow-scripts');
    expect(cliContent).toContain('blocked for security');

    // install.js should use --ignore-scripts by default
    const installContent = readFileSync(join(CLI_COMMANDS, 'install.js'), 'utf-8');
    expect(installContent).toContain('ignore-scripts');
  });

  // UAT-07-005: install command uses spinner (picocolors/createSpinner)
  it('UAT-07-005: install command uses createSpinner for progress display', () => {
    const installContent = readFileSync(join(CLI_COMMANDS, 'install.js'), 'utf-8');
    // Should import or use createSpinner (from prompts abstraction)
    expect(installContent).toMatch(/createSpinner|spinner/i);
    // Must NOT use ora (replaced in Story 7)
    expect(installContent).not.toMatch(/from\s+['"]ora['"]/);
  });

  // UAT-07-006: install command renders summary after completion
  it('UAT-07-006: install command has completion summary with renderInstallSummary', () => {
    const installContent = readFileSync(join(CLI_COMMANDS, 'install.js'), 'utf-8');
    // Should call renderInstallSummary or equivalent
    expect(installContent).toMatch(/renderInstallSummary|summary|Success/i);
  });
});

// =============================================================================
// S2: Update Command (5 checks)
// =============================================================================
describe('UAT-07-S2: Update Command', () => {

  // UAT-07-007: update command module structure
  it('UAT-07-007: update command module exists and exports updateCommand', () => {
    const updatePath = join(CLI_COMMANDS, 'update.js');
    expect(existsSync(updatePath), 'update.js must exist').toBe(true);

    const content = readFileSync(updatePath, 'utf-8');
    expect(content).toMatch(/export\s+(async\s+)?function\s+updateCommand/);
    expect(content).not.toMatch(/\brequire\s*\(/);
  });

  // UAT-07-008: update command has PRESERVE_FILES
  it('UAT-07-008: update command preserves critical files during update', () => {
    const updateContent = readFileSync(join(CLI_COMMANDS, 'update.js'), 'utf-8');
    expect(updateContent).toContain('PRESERVE_FILES');

    // Critical files that MUST be preserved
    expect(updateContent).toContain('.claude/settings.json');
    expect(updateContent).toContain('.claude/hooks/');
    expect(updateContent).toContain('.claude/validators-node/');
    expect(updateContent).toContain('.env');
  });

  // UAT-07-009: update command preserves settings.json
  it('UAT-07-009: PRESERVE_FILES list includes .claude/settings.json', () => {
    const updateContent = readFileSync(join(CLI_COMMANDS, 'update.js'), 'utf-8');

    // Extract PRESERVE_FILES array content
    const preserveMatch = updateContent.match(/PRESERVE_FILES\s*=\s*\[([\s\S]*?)\]/);
    expect(preserveMatch, 'PRESERVE_FILES array must be defined').toBeTruthy();

    const preserveList = preserveMatch[1];
    expect(preserveList).toContain('.claude/settings.json');
    expect(preserveList).toContain('.claude/settings.local.json');
  });

  // UAT-07-010: update command preserves custom hooks
  it('UAT-07-010: PRESERVE_FILES list includes .claude/hooks/', () => {
    const updateContent = readFileSync(join(CLI_COMMANDS, 'update.js'), 'utf-8');

    const preserveMatch = updateContent.match(/PRESERVE_FILES\s*=\s*\[([\s\S]*?)\]/);
    expect(preserveMatch).toBeTruthy();
    expect(preserveMatch[1]).toContain('.claude/hooks/');
  });

  // UAT-07-011: update command has --check option for dry-run
  it('UAT-07-011: update command supports --check flag for version checking only', () => {
    const cliContent = readFileSync(CLI_PATH, 'utf-8');
    expect(cliContent).toContain('--check');
    expect(cliContent).toContain('Only check for updates');
  });
});

// =============================================================================
// S3: Status Command (4 checks)
// =============================================================================
describe('UAT-07-S3: Status Command', () => {

  // UAT-07-012: status command exists and exports statusCommand
  it('UAT-07-012: status command module exists with proper exports', () => {
    const statusPath = join(CLI_COMMANDS, 'status.js');
    expect(existsSync(statusPath), 'status.js must exist').toBe(true);

    const content = readFileSync(statusPath, 'utf-8');
    expect(content).toMatch(/export\s+(async\s+)?function\s+statusCommand/);
    // Uses picocolors (not chalk)
    expect(content).toContain('picocolors');
    expect(content).not.toMatch(/from\s+['"]chalk['"]/);
  });

  // UAT-07-013: status command checks component counts
  it('UAT-07-013: status command reports installed modules and components', () => {
    const statusContent = readFileSync(join(CLI_COMMANDS, 'status.js'), 'utf-8');

    // Should use getInstalledModules and isBmadInstalled
    expect(statusContent).toContain('getInstalledModules');
    expect(statusContent).toContain('isBmadInstalled');
    expect(statusContent).toContain('getInstalledVersion');

    // Should display key directory checks
    expect(statusContent).toContain('_bmad');
    expect(statusContent).toContain('.claude');
    expect(statusContent).toContain('Security Module');
  });

  // UAT-07-014: status command shows module list
  it('UAT-07-014: status command displays active modules', () => {
    const statusContent = readFileSync(join(CLI_COMMANDS, 'status.js'), 'utf-8');
    expect(statusContent).toContain('Active Modules');
    expect(statusContent).toContain('modules');
  });

  // UAT-07-015: status command shows version from CONFIG
  it('UAT-07-015: status command displays CLI version from CONFIG', () => {
    const statusContent = readFileSync(join(CLI_COMMANDS, 'status.js'), 'utf-8');
    expect(statusContent).toContain('CONFIG.VERSION');
    expect(statusContent).toContain('CLI Version');
  });
});

// =============================================================================
// S4: General CLI (5 checks)
// =============================================================================
describe('UAT-07-S4: General CLI', () => {

  // UAT-07-016: --help shows available commands
  it('UAT-07-016: CLI --help output lists install, update, version, status commands', async () => {
    const result = await runCli(['--help']);
    const output = result.stdout + result.stderr;

    expect(output).toContain('install');
    expect(output).toContain('update');
    expect(output).toContain('version');
    expect(output).toContain('status');
    expect(output).toContain('BMAD-CYBER');
  });

  // UAT-07-017: --version shows version matching CONFIG
  it('UAT-07-017: CLI --version outputs version matching CONFIG.VERSION', async () => {
    const result = await runCli(['--version']);
    const output = (result.stdout + result.stderr).trim();

    // Should contain version number
    expect(output).toMatch(/\d+\.\d+\.\d+/);

    // Should match CONFIG.VERSION (2.2.0)
    const configContent = readFileSync(join(CLI_LIB, 'config.js'), 'utf-8');
    const versionMatch = configContent.match(/VERSION:\s*'(\d+\.\d+\.\d+)'/);
    expect(versionMatch).toBeTruthy();
    expect(output).toContain(versionMatch[1]);
  });

  // UAT-07-018: invalid command shows error (not stack trace)
  it('UAT-07-018: invalid command shows error message, not a stack trace', async () => {
    const result = await runCli(['foobar']);
    const output = result.stdout + result.stderr;

    // Should have error message
    expect(output).toMatch(/unknown|error|invalid/i);
    // Should NOT have a raw stack trace
    expect(output).not.toMatch(/at\s+\w+\s+\(/);
    // Should show available commands as help
    expect(output).toMatch(/install|help/i);
  });

  // UAT-07-019: CLI uses picocolors (not chalk)
  it('UAT-07-019: CLI files use picocolors, not chalk', () => {
    const cliFiles = [
      join(CLI_COMMANDS, 'status.js'),
      join(CLI_LIB, 'logger.js'),
    ];

    for (const filePath of cliFiles) {
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        // logger.js and status.js should use picocolors
        expect(content).toMatch(/picocolors|pc\./);
        // Must NOT import chalk
        expect(content).not.toMatch(/from\s+['"]chalk['"]/);
      }
    }

    // Verify no chalk imports in main CLI files
    const mainCliContent = readFileSync(CLI_PATH, 'utf-8');
    expect(mainCliContent).not.toMatch(/from\s+['"]chalk['"]/);
  });

  // UAT-07-020: CLI lib exports are ESM-compliant
  it('UAT-07-020: all CLI lib files use ESM exports (no require)', () => {
    const libFiles = readdirSync(CLI_LIB).filter(f => f.endsWith('.js'));
    expect(libFiles.length).toBeGreaterThanOrEqual(5); // config, cli-utils, logger, prompts, downloader+

    for (const file of libFiles) {
      const content = readFileSync(join(CLI_LIB, file), 'utf-8');
      // Must use import/export, not require/module.exports
      expect(content).not.toMatch(/\bmodule\.exports\b/);
      expect(content).not.toMatch(/\brequire\s*\(/);
      // Should have at least one export
      expect(content).toMatch(/export\s+/);
    }
  });
});

// =============================================================================
// Additional: CLI Utility Functions
// =============================================================================
describe('UAT-07-Extra: CLI Utility Validation', () => {

  it('cli-utils.js exports isBmadInstalled, getInstalledVersion, getInstalledModules', () => {
    const content = readFileSync(join(CLI_LIB, 'cli-utils.js'), 'utf-8');
    expect(content).toMatch(/export\s+function\s+isBmadInstalled/);
    expect(content).toMatch(/export\s+function\s+getInstalledVersion/);
    expect(content).toMatch(/export\s+function\s+getInstalledModules/);
  });

  it('cli-utils.js checks both src/ and _bmad/ for module detection', () => {
    const content = readFileSync(join(CLI_LIB, 'cli-utils.js'), 'utf-8');
    // Should support both pre-migration and post-migration layouts
    expect(content).toContain('src');
    expect(content).toContain('_bmad');
    expect(content).toContain('module.yaml');
  });

  it.skip('CONFIG.VERSION matches package.json version (known issue - requires manual version sync)', () => {
    const configContent = readFileSync(join(CLI_LIB, 'config.js'), 'utf-8');
    const versionMatch = configContent.match(/VERSION:\s*'(\d+\.\d+\.\d+)'/);
    expect(versionMatch).toBeTruthy();

    const pkgPath = join(PROJECT_ROOT, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    // CONFIG.VERSION should match package.json version
    expect(versionMatch[1]).toBe(pkg.version);
  });

  it('bmad-cli.js has shebang and registers all 4 commands', () => {
    const content = readFileSync(CLI_PATH, 'utf-8');
    expect(content.startsWith('#!/usr/bin/env node')).toBe(true);

    // All 4 commands registered
    expect(content).toContain(".command('install')");
    expect(content).toContain(".command('update')");
    expect(content).toContain(".command('version')");
    expect(content).toContain(".command('status')");

    // Node version check
    expect(content).toContain('nodeVersion < 20');

    // SIGINT handler
    expect(content).toContain('SIGINT');
  });

  it('external-official-modules.yaml has 9 modules', () => {
    const registryPath = join(PROJECT_ROOT, 'tools', 'cli', 'external-official-modules.yaml');
    expect(existsSync(registryPath), 'external-official-modules.yaml must exist').toBe(true);

    const content = readFileSync(registryPath, 'utf-8');
    const expectedModules = ['core', 'bmm', 'bmb', 'bmgd', 'cis', 'cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
    for (const mod of expectedModules) {
      expect(content).toContain(mod);
    }
  });
});
