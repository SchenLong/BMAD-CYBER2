#!/usr/bin/env node

/**
 * migrate-directory-structure.js
 *
 * Migrates the dual `_bmad/` + `src/` directory layout into a unified `src/` structure.
 * Supports phased migration (A-E), dry-run, rollback, and detailed logging.
 *
 * Phases:
 *   A - bmm, bmb, bmgd, cis (pure moves, no conflicts, ~652 files)
 *   B - strategy-team (medium risk, ~200 files, most complete src/)
 *   C - cybersec-team, intel-team, legal-team (medium risk, ~446 files)
 *   D - core non-security (~75 files, help, routing, tasks, workflows)
 *   E - core/security (~23 files, CRITICAL -- atomic with hash regeneration)
 *
 * Internal steps per phase (1-7):
 *   1 - Copy/move files to new locations
 *   2 - Update import paths in moved files
 *   3 - Update references in non-moved files
 *   4 - Update RBAC rules
 *   5 - Update settings.json hooks
 *   6 - Validate (cross-file reference check)
 *   7 - Remove originals (only after validation passes)
 *
 * Usage:
 *   node tools/migrate-directory-structure.js --dry-run           # Show what would happen
 *   node tools/migrate-directory-structure.js --phase A           # Run Phase A only
 *   node tools/migrate-directory-structure.js --phase A,B         # Run Phases A and B
 *   node tools/migrate-directory-structure.js --rollback          # Undo last migration
 *   node tools/migrate-directory-structure.js                     # Run all phases
 *
 * @module tools/migrate-directory-structure
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');
const MIGRATION_LOG_PATH = resolve(__dirname, 'migration-log.json');

/**
 * Phase definitions: which modules to migrate in each phase.
 * Order matters: A -> B -> C -> D -> E.
 */
export const PHASE_DEFINITIONS = {
  A: {
    label: 'Phase A: Pure-move modules (bmm, bmb, bmgd, cis)',
    modules: ['bmm', 'bmb', 'bmgd', 'cis'],
    strategy: 'move', // No existing src/ content -- pure git mv
    risk: 'low',
  },
  B: {
    label: 'Phase B: strategy-team (merge reference)',
    modules: ['strategy-team'],
    strategy: 'merge', // Content exists in both _bmad/ and src/
    risk: 'medium',
  },
  C: {
    label: 'Phase C: cybersec-team, intel-team, legal-team',
    modules: ['cybersec-team', 'intel-team', 'legal-team'],
    strategy: 'merge',
    risk: 'medium',
  },
  D: {
    label: 'Phase D: core non-security',
    modules: ['core'],
    strategy: 'core-partial', // Exclude security subdirectory
    risk: 'medium-high',
    excludeDirs: ['security'],
  },
  E: {
    label: 'Phase E: core/security (CRITICAL)',
    modules: ['core'],
    strategy: 'core-security', // Only the security subdirectory -- atomic
    risk: 'critical',
    onlyDirs: ['security'],
  },
};

/** Valid phase keys, in execution order */
export const PHASE_ORDER = ['A', 'B', 'C', 'D', 'E'];

/**
 * Directories under `_bmad/` that must NOT be moved.
 * These are infrastructure / install-config / upstream reference.
 */
export const EXCLUDED_BMAD_DIRS = [
  '_config',
  '_compact',
  '_memory',
  'framework',
];

/**
 * `src/` directories that are infrastructure and must NOT be touched.
 */
export const SRC_INFRASTRUCTURE_DIRS = [
  'config',
  'package-management',
  'security',
  'utility',
  'automation',
];

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

/** In-memory log accumulator */
let migrationLog = {
  version: '1.0.0',
  startedAt: null,
  completedAt: null,
  dryRun: false,
  phases: [],
  actions: [],
  errors: [],
  summary: {},
};

/**
 * Log an action to both console and the in-memory log.
 * @param {'info'|'warn'|'error'|'action'|'skip'} level
 * @param {string} message
 * @param {object} [meta]
 */
export function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '  INFO',
    warn: '  WARN',
    error: ' ERROR',
    action: '    OK',
    skip: '  SKIP',
  }[level] || '  ????';

  console.log(`${prefix}: ${message}`);

  migrationLog.actions.push({ timestamp, level, message, ...meta });

  if (level === 'error') {
    migrationLog.errors.push({ timestamp, message, ...meta });
  }
}

/**
 * Persist the migration log to disk.
 */
export function saveMigrationLog() {
  migrationLog.completedAt = new Date().toISOString();
  writeFileSync(MIGRATION_LOG_PATH, `${JSON.stringify(migrationLog, null, 2)  }\n`, 'utf-8');
  console.log(`\nMigration log saved to: ${MIGRATION_LOG_PATH}`);
}

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

/**
 * Parse command-line arguments into a structured options object.
 * @param {string[]} argv - process.argv
 * @returns {{ dryRun: boolean, rollback: boolean, phases: string[] }}
 */
export function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    dryRun: false,
    rollback: false,
    phases: [...PHASE_ORDER], // Default: run all phases
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--rollback') {
      options.rollback = true;
    } else if (arg === '--phase') {
      const next = args[i + 1];
      if (!next) {
        throw new Error('--phase requires a value (e.g. --phase A or --phase A,B,C)');
      }
      options.phases = parsePhaseArg(next);
      i++; // consume next arg
    } else if (arg.startsWith('--phase=')) {
      const value = arg.slice('--phase='.length);
      options.phases = parsePhaseArg(value);
    } else if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}. Use --help for usage.`);
    }
  }

  return options;
}

/**
 * Parse a comma-separated phase string into validated phase keys.
 * @param {string} value - e.g. "A", "A,B", "A,B,C"
 * @returns {string[]} Validated, ordered phase keys
 */
export function parsePhaseArg(value) {
  const raw = value.split(',').map(s => s.trim().toUpperCase());
  const invalid = raw.filter(p => !PHASE_ORDER.includes(p));
  if (invalid.length > 0) {
    throw new Error(`Invalid phase(s): ${invalid.join(', ')}. Valid phases: ${PHASE_ORDER.join(', ')}`);
  }
  // Return in canonical order
  return PHASE_ORDER.filter(p => raw.includes(p));
}

/**
 * Print CLI usage information.
 */
function printUsage() {
  console.log(`
Usage: node tools/migrate-directory-structure.js [options]

Options:
  --dry-run        Show what would happen without making changes
  --phase <phases> Run specific phase(s), comma-separated (A,B,C,D,E)
  --rollback       Undo the last migration using git
  --help, -h       Show this help message

Phases:
  A  bmm, bmb, bmgd, cis (pure moves, low risk)
  B  strategy-team (merge, medium risk)
  C  cybersec-team, intel-team, legal-team (merge, medium risk)
  D  core non-security (partial, medium-high risk)
  E  core/security (atomic, CRITICAL risk)

Examples:
  node tools/migrate-directory-structure.js --dry-run
  node tools/migrate-directory-structure.js --phase A
  node tools/migrate-directory-structure.js --phase A,B
  node tools/migrate-directory-structure.js --rollback
  node tools/migrate-directory-structure.js
`);
}

// ---------------------------------------------------------------------------
// File system helpers
// ---------------------------------------------------------------------------

/**
 * Recursively list all files under a directory.
 * @param {string} dir - Absolute path to directory
 * @returns {string[]} Array of absolute file paths
 */
export function listFilesRecursive(dir) {
  const results = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFilesRecursive(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Compute SHA-256 hash of a file's content.
 * @param {string} filePath - Absolute path
 * @returns {string} Hex digest
 */
export function hashFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return createHash('sha256').update(content, 'utf-8').digest('hex');
}

/**
 * Execute a shell command, logging it and optionally skipping in dry-run mode.
 * @param {string} cmd - Shell command
 * @param {boolean} dryRun - If true, log but don't execute
 * @returns {string|null} stdout if executed, null if dry-run
 */
export function exec(cmd, dryRun = false) {
  if (dryRun) {
    log('info', `[DRY-RUN] Would execute: ${cmd}`);
    return null;
  }
  try {
    const result = execSync(cmd, { cwd: PROJECT_ROOT, encoding: 'utf-8', stdio: 'pipe' });
    return result;
  } catch (err) {
    const stderr = err.stderr || err.message;
    throw new Error(`Command failed: ${cmd}\n${stderr}`);
  }
}

/**
 * Ensure a directory exists, creating it recursively if needed.
 * @param {string} dirPath - Absolute path
 * @param {boolean} dryRun
 */
export function ensureDir(dirPath, dryRun = false) {
  if (existsSync(dirPath)) return;
  if (dryRun) {
    log('info', `[DRY-RUN] Would create directory: ${relative(PROJECT_ROOT, dirPath)}`);
    return;
  }
  mkdirSync(dirPath, { recursive: true });
  log('action', `Created directory: ${relative(PROJECT_ROOT, dirPath)}`);
}

// ---------------------------------------------------------------------------
// File mapping generation
// ---------------------------------------------------------------------------

/**
 * @typedef {object} FileMapping
 * @property {string} source - Absolute source path (_bmad/...)
 * @property {string} destination - Absolute destination path (src/...)
 * @property {'move'|'merge-move'|'merge-identical'|'merge-overwrite'} action
 * @property {string} relSource - Relative source path from project root
 * @property {string} relDest - Relative destination path from project root
 */

/**
 * Generate file mappings for a PURE MOVE module (no existing src/ content).
 * Every file in `_bmad/{module}/` maps to `src/{module}/`.
 *
 * @param {string} moduleName - Module code (e.g. 'bmm')
 * @returns {FileMapping[]}
 */
export function generateMoveMapping(moduleName) {
  const srcDir = resolve(PROJECT_ROOT, '_bmad', moduleName);
  if (!existsSync(srcDir)) {
    log('warn', `Source directory does not exist: _bmad/${moduleName}`);
    return [];
  }

  const files = listFilesRecursive(srcDir);
  return files.map(absPath => {
    const relFromModule = relative(srcDir, absPath);
    const dest = resolve(PROJECT_ROOT, 'src', moduleName, relFromModule);
    return {
      source: absPath,
      destination: dest,
      action: 'move',
      relSource: relative(PROJECT_ROOT, absPath),
      relDest: relative(PROJECT_ROOT, dest),
    };
  });
}

/**
 * Generate file mappings for a MERGE module (content in both locations).
 * - Files only in `_bmad/`: move to src/
 * - Files in both, identical: remove _bmad/ copy
 * - Files in both, different: _bmad/ is authoritative, overwrite src/
 *
 * @param {string} moduleName - Module code (e.g. 'strategy-team')
 * @returns {FileMapping[]}
 */
export function generateMergeMapping(moduleName) {
  const bmadDir = resolve(PROJECT_ROOT, '_bmad', moduleName);
  const srcDir = resolve(PROJECT_ROOT, 'src', moduleName);

  if (!existsSync(bmadDir)) {
    log('warn', `Source directory does not exist: _bmad/${moduleName}`);
    return [];
  }

  const bmadFiles = listFilesRecursive(bmadDir);
  const mappings = [];

  for (const absPath of bmadFiles) {
    const relFromModule = relative(bmadDir, absPath);
    const destPath = resolve(srcDir, relFromModule);
    const relSource = relative(PROJECT_ROOT, absPath);
    const relDest = relative(PROJECT_ROOT, destPath);

    if (!existsSync(destPath)) {
      // File only in _bmad/ -- move
      mappings.push({
        source: absPath,
        destination: destPath,
        action: 'merge-move',
        relSource,
        relDest,
      });
    } else {
      // File exists in both locations -- compare content
      const srcHash = hashFile(absPath);
      const destHash = hashFile(destPath);

      if (srcHash === destHash) {
        // Identical content -- remove _bmad/ copy (src/ stays)
        mappings.push({
          source: absPath,
          destination: destPath,
          action: 'merge-identical',
          relSource,
          relDest,
        });
      } else {
        // Different content -- _bmad/ is authoritative
        mappings.push({
          source: absPath,
          destination: destPath,
          action: 'merge-overwrite',
          relSource,
          relDest,
        });
      }
    }
  }

  return mappings;
}

/**
 * Generate file mappings for core module with directory filtering.
 * Used by Phases D (exclude security) and E (only security).
 *
 * @param {object} options
 * @param {string[]} [options.excludeDirs] - Subdirectories to exclude
 * @param {string[]} [options.onlyDirs] - If set, only include these subdirectories
 * @returns {FileMapping[]}
 */
export function generateCoreMapping(options = {}) {
  const { excludeDirs = [], onlyDirs = null } = options;
  const bmadCoreDir = resolve(PROJECT_ROOT, '_bmad', 'core');
  const srcCoreDir = resolve(PROJECT_ROOT, 'src', 'core');

  if (!existsSync(bmadCoreDir)) {
    log('warn', 'Source directory does not exist: _bmad/core');
    return [];
  }

  const allFiles = listFilesRecursive(bmadCoreDir);
  const mappings = [];

  for (const absPath of allFiles) {
    const relFromCore = relative(bmadCoreDir, absPath);
    // Get top-level subdirectory name
    const topDir = relFromCore.split('/')[0];

    // Apply directory filtering
    if (onlyDirs && !onlyDirs.includes(topDir)) continue;
    if (excludeDirs.includes(topDir)) continue;

    // Root-level files (module.yaml, README, etc.) go with Phase D (excludeDirs)
    // because they are NOT in any subdirectory
    if (!relFromCore.includes('/') && onlyDirs) continue; // Root files excluded from Phase E
    if (!relFromCore.includes('/') && excludeDirs.length > 0) {
      // Root files included in Phase D -- treat as part of non-security core
    }

    const destPath = resolve(srcCoreDir, relFromCore);
    const relSource = relative(PROJECT_ROOT, absPath);
    const relDest = relative(PROJECT_ROOT, destPath);

    if (!existsSync(destPath)) {
      mappings.push({
        source: absPath,
        destination: destPath,
        action: 'merge-move',
        relSource,
        relDest,
      });
    } else {
      const srcHash = hashFile(absPath);
      const destHash = hashFile(destPath);

      if (srcHash === destHash) {
        mappings.push({
          source: absPath,
          destination: destPath,
          action: 'merge-identical',
          relSource,
          relDest,
        });
      } else {
        mappings.push({
          source: absPath,
          destination: destPath,
          action: 'merge-overwrite',
          relSource,
          relDest,
        });
      }
    }
  }

  return mappings;
}

/**
 * Generate all file mappings for a given phase.
 * @param {string} phaseKey - Phase key (A-E)
 * @returns {FileMapping[]}
 */
export function generatePhaseMapping(phaseKey) {
  const phase = PHASE_DEFINITIONS[phaseKey];
  if (!phase) {
    throw new Error(`Unknown phase: ${phaseKey}`);
  }

  const allMappings = [];

  switch (phase.strategy) {
    case 'move':
      for (const mod of phase.modules) {
        allMappings.push(...generateMoveMapping(mod));
      }
      break;

    case 'merge':
      for (const mod of phase.modules) {
        allMappings.push(...generateMergeMapping(mod));
      }
      break;

    case 'core-partial':
      allMappings.push(...generateCoreMapping({ excludeDirs: phase.excludeDirs }));
      break;

    case 'core-security':
      allMappings.push(...generateCoreMapping({ onlyDirs: phase.onlyDirs }));
      break;

    default:
      throw new Error(`Unknown migration strategy: ${phase.strategy}`);
  }

  return allMappings;
}

// ---------------------------------------------------------------------------
// Conflict detection
// ---------------------------------------------------------------------------

/**
 * @typedef {object} ConflictReport
 * @property {number} totalFiles - Total files in mapping
 * @property {number} moves - Files that will be moved (no conflict)
 * @property {number} identical - Files identical in both locations
 * @property {number} overwrites - Files where _bmad/ overwrites src/
 * @property {FileMapping[]} overwriteDetails - Details of overwrite conflicts
 */

/**
 * Analyze a set of file mappings for conflicts.
 * @param {FileMapping[]} mappings
 * @returns {ConflictReport}
 */
export function detectConflicts(mappings) {
  const report = {
    totalFiles: mappings.length,
    moves: 0,
    identical: 0,
    overwrites: 0,
    overwriteDetails: [],
  };

  for (const mapping of mappings) {
    switch (mapping.action) {
      case 'move':
      case 'merge-move':
        report.moves++;
        break;
      case 'merge-identical':
        report.identical++;
        break;
      case 'merge-overwrite':
        report.overwrites++;
        report.overwriteDetails.push(mapping);
        break;
    }
  }

  return report;
}

// ---------------------------------------------------------------------------
// Phase execution: Step 1 - Move/copy files
// ---------------------------------------------------------------------------

/**
 * Execute Step 1: Move files using `git mv` for history preservation.
 * @param {FileMapping[]} mappings
 * @param {boolean} dryRun
 * @returns {{ moved: number, removed: number, overwritten: number, errors: number }}
 */
export function executeStep1(mappings, dryRun = false) {
  const stats = { moved: 0, removed: 0, overwritten: 0, errors: 0 };

  for (const mapping of mappings) {
    try {
      switch (mapping.action) {
        case 'move':
        case 'merge-move': {
          // Ensure destination directory exists
          ensureDir(dirname(mapping.destination), dryRun);
          // Use git mv to preserve history
          const cmd = `git mv "${mapping.relSource}" "${mapping.relDest}"`;
          exec(cmd, dryRun);
          log('action', `Moved: ${mapping.relSource} -> ${mapping.relDest}`);
          stats.moved++;
          break;
        }

        case 'merge-identical': {
          // Files are identical -- remove the _bmad/ copy, keep src/ copy
          const cmd = `git rm -f "${mapping.relSource}"`;
          exec(cmd, dryRun);
          log('action', `Removed identical: ${mapping.relSource} (kept ${mapping.relDest})`);
          stats.removed++;
          break;
        }

        case 'merge-overwrite': {
          // _bmad/ is authoritative -- overwrite src/ version
          // Strategy: remove src/ copy, then git mv _bmad/ copy
          const rmCmd = `git rm -f "${mapping.relDest}"`;
          exec(rmCmd, dryRun);
          const mvCmd = `git mv "${mapping.relSource}" "${mapping.relDest}"`;
          exec(mvCmd, dryRun);
          log('action', `Overwrote: ${mapping.relSource} -> ${mapping.relDest} (src/ was different)`);
          stats.overwritten++;
          break;
        }

        default:
          log('warn', `Unknown action: ${mapping.action} for ${mapping.relSource}`);
      }
    } catch (err) {
      log('error', `Step 1 failed for ${mapping.relSource}: ${err.message}`);
      stats.errors++;
    }
  }

  return stats;
}

// ---------------------------------------------------------------------------
// Phase execution: Step 2 - Update import paths in moved files
// ---------------------------------------------------------------------------

/**
 * Scan moved files for `_bmad/` self-references and update them.
 * Only updates source-path references, NOT install-target references.
 *
 * @param {FileMapping[]} mappings - Only entries where action is move/merge-move/merge-overwrite
 * @param {string} phaseKey - Current phase
 * @param {boolean} dryRun
 * @returns {{ filesScanned: number, filesUpdated: number, refsUpdated: number }}
 */
export function executeStep2(mappings, phaseKey, dryRun = false) {
  const stats = { filesScanned: 0, filesUpdated: 0, refsUpdated: 0 };
  const phase = PHASE_DEFINITIONS[phaseKey];

  // Only process files that were actually moved to new locations
  const movedFiles = mappings.filter(m =>
    m.action === 'move' || m.action === 'merge-move' || m.action === 'merge-overwrite'
  );

  for (const mapping of movedFiles) {
    const filePath = mapping.destination;
    if (!existsSync(filePath) && !dryRun) continue;
    if (dryRun && !existsSync(filePath) && !existsSync(mapping.source)) continue;

    const ext = extname(filePath).toLowerCase();
    // Only update text-based files that might contain path references
    if (!['.js', '.ts', '.yaml', '.yml', '.json', '.md', '.xml', '.csv'].includes(ext)) {
      continue;
    }

    stats.filesScanned++;

    // In dry-run, read from source since file hasn't moved yet
    const readPath = dryRun ? mapping.source : filePath;
    if (!existsSync(readPath)) continue;

    let content;
    try {
      content = readFileSync(readPath, 'utf-8');
    } catch {
      continue;
    }

    // Build replacement map for this phase's modules
    let updatedContent = content;
    let refCount = 0;

    for (const mod of phase.modules) {
      // Pattern: _bmad/{module}/ -> src/{module}/
      // Only replace source-path references, not install-target references
      // We match path strings that look like source references
      const sourcePattern = new RegExp(`_bmad/${escapeRegExp(mod)}/`, 'g');
      const replacement = `src/${mod}/`;

      const before = updatedContent;
      updatedContent = updatedContent.replace(sourcePattern, replacement);
      if (updatedContent !== before) {
        const matches = before.match(sourcePattern);
        refCount += matches ? matches.length : 0;
      }
    }

    if (refCount > 0) {
      if (!dryRun) {
        writeFileSync(filePath, updatedContent, 'utf-8');
      }
      log('action', `Updated ${refCount} ref(s) in: ${mapping.relDest}`);
      stats.filesUpdated++;
      stats.refsUpdated += refCount;
    }
  }

  return stats;
}

// ---------------------------------------------------------------------------
// Phase execution: Step 3 - Update references in non-moved files
// ---------------------------------------------------------------------------

/**
 * Reference update targets: files outside the migration that reference `_bmad/{module}/`.
 */
const REFERENCE_UPDATE_TARGETS = {
  tools: [
    'tools/schema/agent.js',
    'tools/schema/workflow.js',
    'tools/schema/module.js',
    'tools/validate-agent-schema.js',
    'tools/validate-workflow-schema.js',
    'tools/validate-module-schema.js',
    'tools/migrate-agent-ids.js',
    'tools/cli/commands/status.js',
    'tools/cli/lib/cli-utils.js',
  ],
  buildConfig: [
    'vitest.config.ts',
    'eslint.config.mjs',
  ],
  cicd: [
    '.github/workflows/bmad-extraction-qa.yml',
    '.github/workflows/quality-gate.yml',
  ],
  scripts: [
    'scripts/security-regression.sh',
    'scripts/capture-hook-baseline.js',
    'scripts/check-bundle-size.js',
  ],
  compressors: [
    '.claude/scripts/manifest-compressor.ts',
    '.claude/scripts/manifest-compressor.js',
    '.claude/scripts/agent-compressor.ts',
    '.claude/scripts/agent-compressor.js',
  ],
  validators: [
    '.claude/validators-node/bin/plugin-permissions.ts',
    '.claude/validators-node/bin/plugin-permissions.js',
    '.claude/validators-node/bin/token-validator.ts',
    '.claude/validators-node/bin/token-validator.js',
    '.claude/validators-node/bin/supply-chain.ts',
    '.claude/validators-node/bin/supply-chain.js',
  ],
  hooks: [
    '.claude/hooks/session-security-init.js',
    '.claude/hooks/session-security-init.ts',
    '.claude/hooks/llm-provider-manager.sh',
  ],
};

/**
 * Update `_bmad/{module}/` references in non-moved files.
 *
 * @param {string[]} modules - Module names being migrated in this phase
 * @param {boolean} dryRun
 * @returns {{ filesScanned: number, filesUpdated: number, refsUpdated: number }}
 */
export function executeStep3(modules, dryRun = false) {
  const stats = { filesScanned: 0, filesUpdated: 0, refsUpdated: 0 };

  // Collect all target files
  const allTargets = [
    ...REFERENCE_UPDATE_TARGETS.tools,
    ...REFERENCE_UPDATE_TARGETS.buildConfig,
    ...REFERENCE_UPDATE_TARGETS.cicd,
    ...REFERENCE_UPDATE_TARGETS.scripts,
    ...REFERENCE_UPDATE_TARGETS.compressors,
    ...REFERENCE_UPDATE_TARGETS.validators,
    ...REFERENCE_UPDATE_TARGETS.hooks,
  ];

  for (const relPath of allTargets) {
    const absPath = resolve(PROJECT_ROOT, relPath);
    if (!existsSync(absPath)) continue;

    stats.filesScanned++;

    let content;
    try {
      content = readFileSync(absPath, 'utf-8');
    } catch {
      continue;
    }

    let updatedContent = content;
    let refCount = 0;

    for (const mod of modules) {
      const sourcePattern = new RegExp(`_bmad/${escapeRegExp(mod)}/`, 'g');
      const replacement = `src/${mod}/`;

      const before = updatedContent;
      updatedContent = updatedContent.replace(sourcePattern, replacement);
      if (updatedContent !== before) {
        const matches = before.match(sourcePattern);
        refCount += matches ? matches.length : 0;
      }
    }

    if (refCount > 0) {
      if (!dryRun) {
        writeFileSync(absPath, updatedContent, 'utf-8');
      }
      log('action', `Step 3: Updated ${refCount} ref(s) in: ${relPath}`);
      stats.filesUpdated++;
      stats.refsUpdated += refCount;
    }
  }

  // Also update test files that reference these modules
  const testsDir = resolve(PROJECT_ROOT, 'tests');
  if (existsSync(testsDir)) {
    const testFiles = listFilesRecursive(testsDir)
      .filter(f => f.endsWith('.test.js') || f.endsWith('.test.ts'));

    for (const testFile of testFiles) {
      stats.filesScanned++;

      let content;
      try {
        content = readFileSync(testFile, 'utf-8');
      } catch {
        continue;
      }

      let updatedContent = content;
      let refCount = 0;

      for (const mod of modules) {
        const sourcePattern = new RegExp(`_bmad/${escapeRegExp(mod)}/`, 'g');
        const replacement = `src/${mod}/`;

        const before = updatedContent;
        updatedContent = updatedContent.replace(sourcePattern, replacement);
        if (updatedContent !== before) {
          const matches = before.match(sourcePattern);
          refCount += matches ? matches.length : 0;
        }
      }

      if (refCount > 0) {
        const relPath = relative(PROJECT_ROOT, testFile);
        if (!dryRun) {
          writeFileSync(testFile, updatedContent, 'utf-8');
        }
        log('action', `Step 3: Updated ${refCount} test ref(s) in: ${relPath}`);
        stats.filesUpdated++;
        stats.refsUpdated += refCount;
      }
    }
  }

  return stats;
}

// ---------------------------------------------------------------------------
// Phase execution: Step 4 - Update RBAC rules
// ---------------------------------------------------------------------------

/**
 * Update RBAC configuration: rbac-config.yaml patterns + agent-manifest.csv id column.
 * Only applies when core/security files are relevant (Phase E), or when
 * module patterns in RBAC reference the moved modules (all phases).
 *
 * @param {string[]} modules - Module names being migrated
 * @param {boolean} dryRun
 * @returns {{ rbacUpdated: boolean, manifestUpdated: boolean, refsUpdated: number }}
 */
export function executeStep4(modules, dryRun = false) {
  const stats = { rbacUpdated: false, manifestUpdated: false, refsUpdated: 0 };

  // --- Update rbac-config.yaml ---
  const rbacPath = resolve(PROJECT_ROOT, 'src/core/security/rbac-config.yaml');
  // After Phase E, it would be at src/core/security/rbac-config.yaml
  const rbacPathAlt = resolve(PROJECT_ROOT, 'src/core/security/rbac-config.yaml');
  const actualRbacPath = existsSync(rbacPath) ? rbacPath : existsSync(rbacPathAlt) ? rbacPathAlt : null;

  if (actualRbacPath) {
    let content = readFileSync(actualRbacPath, 'utf-8');
    let refCount = 0;

    for (const mod of modules) {
      const pattern = new RegExp(`_bmad/${escapeRegExp(mod)}/`, 'g');
      const replacement = `src/${mod}/`;

      const before = content;
      content = content.replace(pattern, replacement);
      if (content !== before) {
        const matches = before.match(pattern);
        refCount += matches ? matches.length : 0;
      }
    }

    if (refCount > 0) {
      if (!dryRun) {
        writeFileSync(actualRbacPath, content, 'utf-8');
      }
      const relPath = relative(PROJECT_ROOT, actualRbacPath);
      log('action', `Step 4: Updated ${refCount} RBAC pattern(s) in: ${relPath}`);
      stats.rbacUpdated = true;
      stats.refsUpdated += refCount;
    }
  }

  // --- Update agent-manifest.csv id column ---
  const manifestPath = resolve(PROJECT_ROOT, '_bmad/_config/agent-manifest.csv');
  if (existsSync(manifestPath)) {
    let content = readFileSync(manifestPath, 'utf-8');
    let refCount = 0;

    for (const mod of modules) {
      // The id column values look like: _bmad/{module}/agents/{name}
      const pattern = new RegExp(`_bmad/${escapeRegExp(mod)}/agents/`, 'g');
      const replacement = `src/${mod}/agents/`;

      const before = content;
      content = content.replace(pattern, replacement);
      if (content !== before) {
        const matches = before.match(pattern);
        refCount += matches ? matches.length : 0;
      }
    }

    if (refCount > 0) {
      if (!dryRun) {
        writeFileSync(manifestPath, content, 'utf-8');
      }
      log('action', `Step 4: Updated ${refCount} manifest id(s) in: _bmad/_config/agent-manifest.csv`);
      stats.manifestUpdated = true;
      stats.refsUpdated += refCount;
    }
  }

  // --- Update agent XML id attributes in moved files ---
  // Agent .md files that were moved may have <agent id="_bmad/..."> tags
  // These will be handled by the caller after all phases complete
  // (since the id must match the RBAC pattern format)

  // --- Update authorization.js/ts path normalization ---
  const authFiles = [
    resolve(PROJECT_ROOT, 'src/core/security/authorization.js'),
    resolve(PROJECT_ROOT, 'src/core/security/authorization.ts'),
    resolve(PROJECT_ROOT, 'src/core/security/authorization.js'),
    resolve(PROJECT_ROOT, 'src/core/security/authorization.ts'),
  ];

  for (const authPath of authFiles) {
    if (!existsSync(authPath)) continue;

    let content = readFileSync(authPath, 'utf-8');
    let refCount = 0;

    for (const mod of modules) {
      const pattern = new RegExp(`_bmad/${escapeRegExp(mod)}/`, 'g');
      const replacement = `src/${mod}/`;

      const before = content;
      content = content.replace(pattern, replacement);
      if (content !== before) {
        const matches = before.match(pattern);
        refCount += matches ? matches.length : 0;
      }
    }

    if (refCount > 0) {
      if (!dryRun) {
        writeFileSync(authPath, content, 'utf-8');
      }
      const relPath = relative(PROJECT_ROOT, authPath);
      log('action', `Step 4: Updated ${refCount} auth ref(s) in: ${relPath}`);
      stats.refsUpdated += refCount;
    }
  }

  return stats;
}

// ---------------------------------------------------------------------------
// Phase execution: Step 5 - Update settings.json hooks
// ---------------------------------------------------------------------------

/**
 * Update `.claude/settings.json` hook command paths.
 * CRITICAL: This is the single most important path in the project.
 *
 * @param {string[]} modules - Module names being migrated
 * @param {boolean} dryRun
 * @returns {{ updated: boolean, refsUpdated: number }}
 */
export function executeStep5(modules, dryRun = false) {
  const stats = { updated: false, refsUpdated: 0 };

  const settingsPath = resolve(PROJECT_ROOT, '.claude/settings.json');
  if (!existsSync(settingsPath)) {
    log('warn', 'Step 5: .claude/settings.json not found');
    return stats;
  }

  let content = readFileSync(settingsPath, 'utf-8');
  let refCount = 0;

  for (const mod of modules) {
    const pattern = new RegExp(`_bmad/${escapeRegExp(mod)}/`, 'g');
    const replacement = `src/${mod}/`;

    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) {
      const matches = before.match(pattern);
      refCount += matches ? matches.length : 0;
    }
  }

  if (refCount > 0) {
    if (!dryRun) {
      writeFileSync(settingsPath, content, 'utf-8');
    }
    log('action', `Step 5: Updated ${refCount} settings.json hook path(s)`);
    stats.updated = true;
    stats.refsUpdated = refCount;
  }

  // Regenerate hash baselines after path changes
  if (refCount > 0 && !dryRun) {
    try {
      exec('node scripts/capture-hook-baseline.js');
      log('action', 'Step 5: Regenerated hook hash baselines');
    } catch (err) {
      log('error', `Step 5: Failed to regenerate baselines: ${err.message}`);
    }
  } else if (refCount > 0 && dryRun) {
    log('info', '[DRY-RUN] Would regenerate hook hash baselines');
  }

  return stats;
}

// ---------------------------------------------------------------------------
// Phase execution: Step 6 - Validate
// ---------------------------------------------------------------------------

/**
 * Run validation checks after migration.
 * - Check no broken _bmad/ references remain for migrated modules
 * - Verify settings.json hook paths point to existing files
 * - Run npm run test:schemas (agent/workflow/module validation)
 *
 * @param {string[]} modules - Module names that were migrated
 * @param {boolean} dryRun
 * @returns {{ passed: boolean, checks: Array<{name: string, passed: boolean, detail: string}> }}
 */
export function executeStep6(modules, dryRun = false) {
  const checks = [];

  // --- Check 1: Verify destination files exist ---
  if (!dryRun) {
    let allExist = true;
    for (const mod of modules) {
      const destDir = resolve(PROJECT_ROOT, 'src', mod);
      if (!existsSync(destDir)) {
        checks.push({ name: `src/${mod}/ exists`, passed: false, detail: 'Directory not found' });
        allExist = false;
      } else {
        const files = listFilesRecursive(destDir);
        checks.push({ name: `src/${mod}/ exists`, passed: true, detail: `${files.length} files` });
      }
    }
  } else {
    checks.push({ name: 'Destination existence check', passed: true, detail: '[DRY-RUN] Skipped' });
  }

  // --- Check 2: Verify settings.json hook paths resolve ---
  const settingsPath = resolve(PROJECT_ROOT, '.claude/settings.json');
  if (existsSync(settingsPath) && !dryRun) {
    try {
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      const hooks = settings.hooks || {};
      let brokenPaths = 0;
      let checkedPaths = 0;

      for (const [, handlers] of Object.entries(hooks)) {
        const handlerList = Array.isArray(handlers) ? handlers : [handlers];
        for (const handler of handlerList) {
          for (const hook of (handler.hooks || [])) {
            if (hook.type === 'command' && hook.command) {
              // Extract file paths from hook commands
              const cmd = hook.command.replace(/"\$CLAUDE_PROJECT_DIR"/g, PROJECT_ROOT);
              const parts = cmd.split(/\s+/);
              for (const part of parts) {
                const cleaned = part.replace(/^["']|["']$/g, '');
                if (cleaned.startsWith(PROJECT_ROOT) && !existsSync(cleaned)) {
                  log('warn', `Step 6: Broken hook path: ${relative(PROJECT_ROOT, cleaned)}`);
                  brokenPaths++;
                }
                if (cleaned.startsWith(PROJECT_ROOT)) {
                  checkedPaths++;
                }
              }
            }
          }
        }
      }

      checks.push({
        name: 'Settings.json hook paths',
        passed: brokenPaths === 0,
        detail: `${checkedPaths} checked, ${brokenPaths} broken`,
      });
    } catch (err) {
      checks.push({ name: 'Settings.json hook paths', passed: false, detail: err.message });
    }
  } else {
    checks.push({ name: 'Settings.json hook paths', passed: true, detail: dryRun ? '[DRY-RUN] Skipped' : 'No settings.json' });
  }

  // --- Check 3: Run schema validation ---
  if (!dryRun) {
    try {
      exec('npm run test:schemas');
      checks.push({ name: 'Schema validation (agents + workflows + modules)', passed: true, detail: 'All passed' });
    } catch (err) {
      checks.push({ name: 'Schema validation (agents + workflows + modules)', passed: false, detail: err.message.slice(0, 200) });
    }
  } else {
    checks.push({ name: 'Schema validation', passed: true, detail: '[DRY-RUN] Skipped' });
  }

  // --- Check 4: No stale _bmad/ source references for migrated modules ---
  if (!dryRun) {
    let staleRefs = 0;
    const checkFiles = [
      ...REFERENCE_UPDATE_TARGETS.tools,
      ...REFERENCE_UPDATE_TARGETS.buildConfig,
      ...REFERENCE_UPDATE_TARGETS.scripts,
    ];

    for (const relPath of checkFiles) {
      const absPath = resolve(PROJECT_ROOT, relPath);
      if (!existsSync(absPath)) continue;

      const content = readFileSync(absPath, 'utf-8');
      for (const mod of modules) {
        const pattern = new RegExp(`_bmad/${escapeRegExp(mod)}/`, 'g');
        const matches = content.match(pattern);
        if (matches) {
          log('warn', `Step 6: Stale _bmad/${mod}/ ref in ${relPath} (${matches.length} occurrence(s))`);
          staleRefs += matches.length;
        }
      }
    }

    checks.push({
      name: 'No stale _bmad/ source references',
      passed: staleRefs === 0,
      detail: staleRefs === 0 ? 'Clean' : `${staleRefs} stale reference(s) found`,
    });
  } else {
    checks.push({ name: 'Stale reference check', passed: true, detail: '[DRY-RUN] Skipped' });
  }

  const passed = checks.every(c => c.passed);

  log('info', `\n--- Step 6 Validation: ${passed ? 'PASSED' : 'FAILED'} ---`);
  for (const check of checks) {
    log(check.passed ? 'action' : 'error', `  ${check.passed ? 'PASS' : 'FAIL'}: ${check.name} — ${check.detail}`);
  }

  return { passed, checks };
}

// ---------------------------------------------------------------------------
// Phase execution: Step 7 - Remove originals
// ---------------------------------------------------------------------------

/**
 * Remove empty `_bmad/{module}/` directories after all files have been moved.
 * Only runs if Step 6 validation passed.
 *
 * @param {string[]} modules - Module names that were migrated
 * @param {boolean} dryRun
 * @returns {{ dirsRemoved: number }}
 */
export function executeStep7(modules, dryRun = false) {
  const stats = { dirsRemoved: 0 };

  for (const mod of modules) {
    const bmadModDir = resolve(PROJECT_ROOT, '_bmad', mod);
    if (!existsSync(bmadModDir)) continue;

    // Check if directory is truly empty
    const remaining = listFilesRecursive(bmadModDir);
    if (remaining.length === 0) {
      if (!dryRun) {
        rmSync(bmadModDir, { recursive: true });
      }
      log('action', `Step 7: Removed empty directory: _bmad/${mod}/`);
      stats.dirsRemoved++;
    } else {
      log('warn', `Step 7: _bmad/${mod}/ still has ${remaining.length} file(s) -- not removing`);
      // For core module in Phase D, security dir should remain for Phase E
      if (mod === 'core') {
        log('info', `  (This is expected if core/security hasn't been migrated yet)`);
      }
    }
  }

  return stats;
}

// ---------------------------------------------------------------------------
// Rollback
// ---------------------------------------------------------------------------

/**
 * Rollback the last migration by resetting git to the previous commit.
 * Uses `git reset --hard HEAD~1` since migration creates a commit.
 * WARNING: This is destructive. Only use when the last commit was a migration.
 *
 * @param {boolean} dryRun
 */
export function executeRollback(dryRun = false) {
  console.log('\n--- ROLLBACK ---\n');

  // Check that the last commit was a migration
  const lastCommitMsg = execSync('git log --format=%s -1', { cwd: PROJECT_ROOT, encoding: 'utf-8' }).trim();

  if (!lastCommitMsg.includes('migrate') && !lastCommitMsg.includes('migration') && !lastCommitMsg.includes('directory structure')) {
    log('error', `Last commit doesn't look like a migration: "${lastCommitMsg}"`);
    log('error', 'Refusing to rollback. Use git commands manually if needed.');
    return;
  }

  if (dryRun) {
    log('info', `[DRY-RUN] Would reset to commit before: "${lastCommitMsg}"`);
    return;
  }

  try {
    // Create a backup tag first
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    exec(`git tag rollback-backup-${timestamp}`);
    log('action', `Created backup tag: rollback-backup-${timestamp}`);

    // Reset to previous commit
    exec('git reset --hard HEAD~1');
    log('action', 'Rolled back to previous commit');

    console.log('\nRollback complete. Use `git tag -d rollback-backup-...` to remove the backup tag.');
  } catch (err) {
    log('error', `Rollback failed: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Phase orchestrator
// ---------------------------------------------------------------------------

/**
 * Run a complete phase (all 7 steps).
 *
 * @param {string} phaseKey - Phase key (A-E)
 * @param {boolean} dryRun
 * @returns {{ phaseKey: string, success: boolean, stats: object }}
 */
export function runPhase(phaseKey, dryRun = false) {
  const phase = PHASE_DEFINITIONS[phaseKey];
  if (!phase) {
    throw new Error(`Unknown phase: ${phaseKey}`);
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${phase.label} [Risk: ${phase.risk}]`);
  console.log(`${'='.repeat(70)}\n`);

  const phaseResult = {
    phaseKey,
    success: false,
    stats: {},
  };

  // --- Generate mappings ---
  log('info', 'Generating file mappings...');
  const mappings = generatePhaseMapping(phaseKey);
  log('info', `Found ${mappings.length} files to process`);

  if (mappings.length === 0) {
    log('warn', 'No files to migrate in this phase');
    phaseResult.success = true;
    return phaseResult;
  }

  // --- Conflict detection ---
  const conflicts = detectConflicts(mappings);
  log('info', `Conflicts: ${conflicts.moves} moves, ${conflicts.identical} identical, ${conflicts.overwrites} overwrites`);

  if (conflicts.overwrites > 0) {
    log('warn', `${conflicts.overwrites} file(s) will be overwritten (_bmad/ version is authoritative):`);
    for (const detail of conflicts.overwriteDetails) {
      log('warn', `  ${detail.relSource} -> ${detail.relDest}`);
    }
  }

  phaseResult.stats.conflicts = conflicts;

  // --- Step 1: Move files ---
  console.log('\n--- Step 1: Move/copy files ---');
  const step1Stats = executeStep1(mappings, dryRun);
  phaseResult.stats.step1 = step1Stats;

  if (step1Stats.errors > 0 && !dryRun) {
    log('error', `Step 1 had ${step1Stats.errors} error(s). Stopping phase.`);
    return phaseResult;
  }

  // --- Step 2: Update import paths in moved files ---
  console.log('\n--- Step 2: Update import paths in moved files ---');
  const step2Stats = executeStep2(mappings, phaseKey, dryRun);
  phaseResult.stats.step2 = step2Stats;

  // --- Step 3: Update references in non-moved files ---
  console.log('\n--- Step 3: Update references in external files ---');
  const step3Stats = executeStep3(phase.modules, dryRun);
  phaseResult.stats.step3 = step3Stats;

  // --- Step 4: Update RBAC rules ---
  console.log('\n--- Step 4: Update RBAC rules ---');
  const step4Stats = executeStep4(phase.modules, dryRun);
  phaseResult.stats.step4 = step4Stats;

  // --- Step 5: Update settings.json hooks ---
  console.log('\n--- Step 5: Update settings.json hooks ---');
  const step5Stats = executeStep5(phase.modules, dryRun);
  phaseResult.stats.step5 = step5Stats;

  // --- Step 6: Validate ---
  console.log('\n--- Step 6: Validation ---');
  const step6Result = executeStep6(phase.modules, dryRun);
  phaseResult.stats.step6 = step6Result;

  if (!step6Result.passed && !dryRun) {
    log('error', 'Step 6 validation FAILED. Step 7 (cleanup) will NOT run.');
    log('error', 'Fix issues above, then re-run this phase.');
    return phaseResult;
  }

  // --- Step 7: Remove originals ---
  console.log('\n--- Step 7: Remove empty _bmad/ directories ---');
  const step7Stats = executeStep7(phase.modules, dryRun);
  phaseResult.stats.step7 = step7Stats;

  phaseResult.success = true;

  // --- Phase summary ---
  console.log(`\n--- Phase ${phaseKey} Summary ---`);
  console.log(`  Files moved:       ${step1Stats.moved}`);
  console.log(`  Files removed:     ${step1Stats.removed} (identical duplicates)`);
  console.log(`  Files overwritten: ${step1Stats.overwritten}`);
  console.log(`  Refs updated:      ${step2Stats.refsUpdated + step3Stats.refsUpdated + step4Stats.refsUpdated + step5Stats.refsUpdated}`);
  console.log(`  Dirs cleaned up:   ${step7Stats.dirsRemoved}`);
  console.log(`  Errors:            ${step1Stats.errors}`);
  console.log(`  Result:            ${phaseResult.success ? 'SUCCESS' : 'FAILED'}`);

  return phaseResult;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Escape special regex characters in a string.
 * @param {string} str
 * @returns {string}
 */
export function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Main entry point. Parses CLI args and orchestrates migration.
 * @param {string[]} [argv] - Override for process.argv (for testing)
 */
export async function main(argv) {
  const args = argv || process.argv;

  let options;
  try {
    options = parseArgs(args);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  migrationLog = {
    version: '1.0.0',
    startedAt: new Date().toISOString(),
    completedAt: null,
    dryRun: options.dryRun,
    phases: options.phases,
    actions: [],
    errors: [],
    summary: {},
  };

  console.log('==========================================================');
  console.log('  BMAD Directory Structure Migration');
  console.log('==========================================================');
  console.log(`  Mode:    ${options.dryRun ? 'DRY-RUN (no changes)' : 'LIVE'}`);
  console.log(`  Phases:  ${options.phases.join(', ')}`);
  console.log(`  Root:    ${PROJECT_ROOT}`);
  console.log('==========================================================\n');

  // --- Rollback mode ---
  if (options.rollback) {
    executeRollback(options.dryRun);
    saveMigrationLog();
    return;
  }

  // --- Pre-flight checks ---
  log('info', 'Running pre-flight checks...');

  // Check git status is clean (except for this script itself)
  if (!options.dryRun) {
    try {
      const status = execSync('git status --porcelain', { cwd: PROJECT_ROOT, encoding: 'utf-8' });
      const nonScriptChanges = status
        .split('\n')
        .filter(line => line.trim())
        .filter(line => !line.includes('migrate-directory-structure.js'))
        .filter(line => !line.includes('migration-log.json'))
        .filter(line => !line.includes('directory-migration.test.js'));

      if (nonScriptChanges.length > 0) {
        log('warn', `Working tree has ${nonScriptChanges.length} uncommitted change(s).`);
        log('warn', 'Consider committing or stashing before migration.');
        // Don't block -- user may have intentional changes
      }
    } catch {
      log('warn', 'Could not check git status');
    }
  }

  // Check _bmad/ directory exists
  if (!existsSync(resolve(PROJECT_ROOT, '_bmad'))) {
    log('error', '_bmad/ directory not found. Nothing to migrate.');
    process.exit(1);
  }

  // --- Execute phases ---
  const phaseResults = [];

  for (const phaseKey of options.phases) {
    const result = runPhase(phaseKey, options.dryRun);
    phaseResults.push(result);

    if (!result.success && !options.dryRun) {
      log('error', `Phase ${phaseKey} FAILED. Stopping migration.`);
      log('error', 'Fix the issues above, then re-run with --phase to continue.');
      break;
    }
  }

  // --- Final summary ---
  console.log('\n==========================================================');
  console.log('  Migration Summary');
  console.log('==========================================================');

  let totalMoved = 0;
  let totalRemoved = 0;
  let totalOverwritten = 0;
  let totalRefs = 0;
  let totalErrors = 0;

  for (const result of phaseResults) {
    const s = result.stats.step1 || {};
    const s2 = result.stats.step2 || {};
    const s3 = result.stats.step3 || {};
    const s4 = result.stats.step4 || {};
    const s5 = result.stats.step5 || {};

    totalMoved += s.moved || 0;
    totalRemoved += s.removed || 0;
    totalOverwritten += s.overwritten || 0;
    totalRefs += (s2.refsUpdated || 0) + (s3.refsUpdated || 0) + (s4.refsUpdated || 0) + (s5.refsUpdated || 0);
    totalErrors += s.errors || 0;

    console.log(`  Phase ${result.phaseKey}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  }

  console.log('----------------------------------------------------------');
  console.log(`  Total files moved:       ${totalMoved}`);
  console.log(`  Total duplicates removed: ${totalRemoved}`);
  console.log(`  Total files overwritten: ${totalOverwritten}`);
  console.log(`  Total refs updated:      ${totalRefs}`);
  console.log(`  Total errors:            ${totalErrors}`);
  console.log('==========================================================\n');

  migrationLog.summary = {
    totalMoved,
    totalRemoved,
    totalOverwritten,
    totalRefs,
    totalErrors,
    phaseResults: phaseResults.map(r => ({ phase: r.phaseKey, success: r.success })),
  };

  saveMigrationLog();

  if (totalErrors > 0) {
    process.exit(1);
  }
}

// --- Run if executed directly ---
const isDirectRun = process.argv[1] && resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  main().catch(err => {
    console.error(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}
