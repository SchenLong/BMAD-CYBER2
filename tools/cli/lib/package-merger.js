import { existsSync, promises as fs } from 'fs';
import { join } from 'path';
import { confirm, isCancel, log } from './prompts.js';
import pc from 'picocolors';
import { logger } from './logger.js';

// Security: Keys that could enable prototype pollution attacks
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// Security: Pattern to detect shell metacharacters in scripts (for script injection prevention)
const SHELL_METACHAR_PATTERN = /[`$|;&<>(){}[\]\n\r\\]/;

// Security: Pattern to detect path traversal in package names
const PATH_TRAVERSAL_PATTERN = /\.\.|^\/|^\\/;

// Security: Pattern to detect typosquatting (common package name variations)
const TYPOSQUATTING_PATTERNS = [
  /^(@.*\/)?lodash[^a-z]/, // lodash-es is fine, lodash. is suspicious
  /^(@.*\/)?react[^a-z-](?!native|dom|router)/i, // react with unusual suffix
  /^(@.*\/)?express[^a-z-]/i, // express with unusual suffix
];

// Security: Maximum recursion depth for sanitizeObject (FINDING-07)
const MAX_SANITIZE_DEPTH = 20;

/**
 * Sanitizes an object by removing dangerous prototype pollution keys
 * @param {Object} obj - Object to sanitize
 * @param {number} [depth=0] - Current recursion depth (internal)
 * @returns {Object} Sanitized object without dangerous keys
 */
function sanitizeObject(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  // Security: Prevent stack overflow from deeply nested malicious input (FINDING-07)
  if (depth >= MAX_SANITIZE_DEPTH) {
    logger.warn(`Recursion depth limit (${MAX_SANITIZE_DEPTH}) reached in sanitizeObject — returning empty object`);
    return {};
  }

  const sanitized = {};
  // Use Object.getOwnPropertyNames to catch ALL own properties including __proto__
  // JSON.parse can create objects with __proto__ as an own property
  for (const key of Object.getOwnPropertyNames(obj)) {
    // Skip dangerous keys that could enable prototype pollution
    if (DANGEROUS_KEYS.has(key)) {
      logger.warn(`Blocked dangerous key "${key}" in package.json (prototype pollution prevention)`);
      continue;
    }
    // Recursively sanitize nested objects to catch deeply nested dangerous keys
    const value = obj[key];
    sanitized[key] = (value && typeof value === 'object' && !Array.isArray(value))
      ? sanitizeObject(value, depth + 1)
      : value;
  }
  return sanitized;
}

/**
 * Validates a package name for path traversal attacks
 * @param {string} name - Package name to validate
 * @returns {{ valid: boolean, error?: string }}
 */
function validatePackageName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Package name must be a non-empty string' };
  }

  // Check for path traversal patterns
  if (PATH_TRAVERSAL_PATTERN.test(name)) {
    return {
      valid: false,
      error: `Package name "${name}" contains path traversal characters`
    };
  }

  // Check for absolute paths (Windows style)
  if (/^[a-zA-Z]:/.test(name)) {
    return {
      valid: false,
      error: `Package name "${name}" appears to be an absolute Windows path`
    };
  }

  // Check for null bytes (could be used for injection)
  if (name.includes('\0')) {
    return {
      valid: false,
      error: `Package name "${name}" contains null bytes`
    };
  }

  return { valid: true };
}

/**
 * Validates dependency names for potential typosquatting
 * @param {Object} dependencies - Dependencies object
 * @returns {string[]} Array of suspicious package names
 */
function detectSuspiciousDependencies(dependencies) {
  if (!dependencies || typeof dependencies !== 'object') {
    return [];
  }

  const suspicious = [];
  for (const name of Object.keys(dependencies)) {
    // Skip dangerous keys
    if (DANGEROUS_KEYS.has(name)) {
      continue;
    }

    // Check for typosquatting patterns
    for (const pattern of TYPOSQUATTING_PATTERNS) {
      if (pattern.test(name)) {
        suspicious.push(name);
        break;
      }
    }
  }
  return suspicious;
}

/**
 * Validates scripts for potential shell injection
 * @param {Object} scripts - Scripts object from package.json
 * @returns {string[]} Array of script names with suspicious content
 */
function detectSuspiciousScripts(scripts) {
  if (!scripts || typeof scripts !== 'object') {
    return [];
  }

  const suspicious = [];
  for (const [name, command] of Object.entries(scripts)) {
    // Skip dangerous keys
    if (DANGEROUS_KEYS.has(name)) {
      continue;
    }

    // Check for shell metacharacters that could enable injection
    if (typeof command === 'string' && SHELL_METACHAR_PATTERN.test(command)) {
      // Allow common safe patterns
      const safePatterns = [
        /^node\s+[\w./-]+\.js$/,  // Simple node commands
        /^npm\s+(run|test|start|build)/,  // npm commands
        /^tsc(\s|$)/,  // TypeScript compiler
        /^vitest(\s|$)/,  // Vitest
        /^jest(\s|$)/,  // Jest
        /^eslint(\s|$)/,  // ESLint
        // FINDING-09: Removed blanket /&&/ pattern — command chaining must be
        // validated per-segment, not auto-approved. Only approve chains where
        // each segment starts with a known safe command.
        /^(?:npm\s+\w+|node\s+[\w./-]+|tsc|vitest|jest|eslint)(?:\s+&&\s+(?:npm\s+\w+|node\s+[\w./-]+|tsc|vitest|jest|eslint))+$/,
      ];

      // If it contains metacharacters but doesn't match safe patterns, flag it
      const isSafe = safePatterns.some(p => p.test(command));
      if (!isSafe && /[`$|;&<>(){}[\]]/.test(command)) {
        suspicious.push(name);
      }
    }
  }
  return suspicious;
}

/**
 * Detects path traversal attempts in dependency names
 * @param {Object} dependencies - Dependencies object
 * @returns {string[]} Array of package names with path traversal
 */
function detectPathTraversalInDependencies(dependencies) {
  if (!dependencies || typeof dependencies !== 'object') {
    return [];
  }

  const malicious = [];
  for (const name of Object.keys(dependencies)) {
    // Skip dangerous keys
    if (DANGEROUS_KEYS.has(name)) {
      continue;
    }

    const validation = validatePackageName(name);
    if (!validation.valid) {
      malicious.push(name);
    }
  }
  return malicious;
}

// BMAD scripts to add (with bmad: prefix)
const BMAD_SCRIPTS = {
  'bmad:modules': 'node src/utility/tools/module-selector/index.js',
  'bmad:security': 'node src/utility/tools/security-config/index.js',
  'bmad:llm': 'node src/utility/tools/llm-setup/index.js',
  'bmad:health': 'node src/utility/tools/health-check/index.js',
  'bmad:setup': 'node src/utility/tools/setup-wizard/index.js'
};

// BMAD dependencies to add
const BMAD_DEPENDENCIES = {
  'chalk': '^5.3.0',
  'inquirer': '^9.2.0',
  'zod': '^3.22.0',
  'commander': '^12.0.0',
  'ora': '^8.0.0'
};

const BMAD_DEV_DEPENDENCIES = {
  'typescript': '^5.3.0',
  '@types/node': '^20.0.0',
  'vitest': '^1.0.0'
};

/**
 * Merges BMAD framework dependencies and scripts into existing package.json
 * @description Creates a new package.json if none exists, or merges BMAD-specific
 * scripts (prefixed with 'bmad:'), dependencies, and devDependencies into an existing one.
 * Creates a backup before modifying existing files.
 * @param {string} targetDir - Target directory containing or to contain package.json
 * @param {Object} [options={}] - Merge options
 * @param {boolean} [options.yes=false] - Skip confirmation prompts and apply changes automatically
 * @param {boolean} [options.dryRun=false] - Preview changes without writing to disk
 * @returns {Promise<Object>} Merge result object
 * @returns {boolean} [returns.success] - True if merge completed successfully
 * @returns {boolean} [returns.cancelled] - True if user cancelled the operation
 * @returns {boolean} [returns.created] - True if a new package.json was created
 * @returns {boolean} [returns.noChanges] - True if no changes were needed
 * @returns {boolean} [returns.dryRun] - True if this was a dry run
 * @returns {Object} [returns.diff] - Object containing added and modified entries
 * @returns {string} [returns.backupPath] - Path to backup file (if existing file was modified)
 * @throws {Error} If file operations fail
 * @example
 * // Interactive merge
 * const result = await mergePackageJson('./my-project');
 *
 * @example
 * // Non-interactive merge
 * const result = await mergePackageJson('./my-project', { yes: true });
 *
 * @example
 * // Preview changes
 * const result = await mergePackageJson('./my-project', { dryRun: true });
 */
export async function mergePackageJson(targetDir, options = {}) {
  const { yes = false, dryRun = false } = options;

  const targetPath = join(targetDir, 'package.json');
  const hasExisting = existsSync(targetPath);

  if (!hasExisting) {
    // No existing package.json - create new one
    logger.info('No existing package.json found. Creating new one...');

    const newPackage = createNewPackageJson(targetDir);

    if (dryRun) {
      logger.info('\nWould create package.json:');
      console.log(JSON.stringify(newPackage, null, 2));
      return { dryRun: true, created: true };
    }

    await fs.writeFile(targetPath, `${JSON.stringify(newPackage, null, 2)  }\n`);
    logger.success('Created package.json');

    return { success: true, created: true };
  }

  // Merge with existing package.json
  logger.info('Merging with existing package.json...');

  const existing = JSON.parse(await fs.readFile(targetPath, 'utf-8'));

  // Security: Check for suspicious patterns in existing package.json
  const suspiciousDeps = detectSuspiciousDependencies(existing.dependencies);
  const suspiciousDevDeps = detectSuspiciousDependencies(existing.devDependencies);
  const suspiciousScripts = detectSuspiciousScripts(existing.scripts);

  // Security: Check for path traversal in package names
  const pathTraversalDeps = detectPathTraversalInDependencies(existing.dependencies);
  const pathTraversalDevDeps = detectPathTraversalInDependencies(existing.devDependencies);

  if (pathTraversalDeps.length > 0) {
    logger.error(`SECURITY: Path traversal detected in dependencies: ${pathTraversalDeps.join(', ')}`);
    throw new Error(`Security: Refusing to process package.json with path traversal in dependency names: ${pathTraversalDeps.join(', ')}`);
  }

  if (pathTraversalDevDeps.length > 0) {
    logger.error(`SECURITY: Path traversal detected in devDependencies: ${pathTraversalDevDeps.join(', ')}`);
    throw new Error(`Security: Refusing to process package.json with path traversal in devDependency names: ${pathTraversalDevDeps.join(', ')}`);
  }

  if (suspiciousDeps.length > 0) {
    logger.warn(`Potentially suspicious dependencies detected: ${suspiciousDeps.join(', ')}`);
    logger.warn('Please verify these packages are legitimate before proceeding.');
  }

  if (suspiciousDevDeps.length > 0) {
    logger.warn(`Potentially suspicious devDependencies detected: ${suspiciousDevDeps.join(', ')}`);
  }

  if (suspiciousScripts.length > 0) {
    logger.warn(`Scripts with potentially dangerous shell commands: ${suspiciousScripts.join(', ')}`);
  }

  const merged = mergePackages(existing);

  // Calculate diff
  const diff = calculateDiff(existing, merged);

  if (Object.keys(diff.added).length === 0 &&
      Object.keys(diff.modified).length === 0) {
    logger.info('No changes needed to package.json');
    return { success: true, noChanges: true };
  }

  // Show diff
  if (!yes) {
    showDiff(diff);

    const proceed = await confirm({
      message: 'Apply these changes?',
      initialValue: true
    });

    // Handle cancellation (Ctrl+C)
    if (isCancel(proceed) || !proceed) {
      return { cancelled: true };
    }
  }

  if (dryRun) {
    logger.info('\nDry run - no changes made');
    return { dryRun: true, diff };
  }

  // Create backup
  const backupPath = `${targetPath}.backup.${Date.now()}`;
  await fs.copyFile(targetPath, backupPath);
  logger.info(`Backup created: ${backupPath}`);

  // Write merged package.json
  await fs.writeFile(targetPath, `${JSON.stringify(merged, null, 2)  }\n`);
  logger.success('Package.json updated');

  return { success: true, diff, backupPath };
}

function createNewPackageJson(targetDir) {
  const dirName = targetDir.split('/').pop() || 'my-project';

  return {
    name: dirName,
    version: '1.0.0',
    type: 'module',
    scripts: {
      ...BMAD_SCRIPTS,
      'start': 'node index.js',
      'build': 'tsc',
      'test': 'vitest'
    },
    dependencies: {
      ...BMAD_DEPENDENCIES
    },
    devDependencies: {
      ...BMAD_DEV_DEPENDENCIES
    },
    engines: {
      node: '>=20.0.0'
    }
  };
}

function mergePackages(existing) {
  // Security: Sanitize the existing package.json to remove prototype pollution vectors
  const sanitizedExisting = sanitizeObject(existing);

  const merged = { ...sanitizedExisting };

  // Security: Sanitize dependencies before merging
  const sanitizedDeps = sanitizeObject(existing.dependencies);
  const sanitizedDevDeps = sanitizeObject(existing.devDependencies);
  const sanitizedScripts = sanitizeObject(existing.scripts);

  // Merge dependencies (don't override existing)
  merged.dependencies = {
    ...BMAD_DEPENDENCIES,
    ...sanitizedDeps
  };

  // Merge devDependencies (don't override existing)
  merged.devDependencies = {
    ...BMAD_DEV_DEPENDENCIES,
    ...sanitizedDevDeps
  };

  // Merge scripts (add bmad: prefixed scripts)
  merged.scripts = {
    ...sanitizedScripts,
    ...BMAD_SCRIPTS
  };

  // Update engines if needed
  if (!merged.engines) {
    merged.engines = {};
  }
  if (!merged.engines.node || !meetsMinVersion(merged.engines.node, '20.0.0')) {
    merged.engines.node = '>=20.0.0';
  }

  // Ensure type is module if not set
  if (!merged.type) {
    merged.type = 'module';
  }

  return merged;
}

function meetsMinVersion(versionSpec, minVersion) {
  // Simple check - extract version number
  const match = versionSpec.match(/(\d+)/);
  if (!match) return false;
  const majorVersion = parseInt(match[1], 10);
  const minMajor = parseInt(minVersion.split('.')[0], 10);
  return majorVersion >= minMajor;
}

function calculateDiff(original, merged) {
  const diff = {
    added: {},
    modified: {},
    unchanged: {}
  };

  // Compare scripts
  for (const [key, value] of Object.entries(merged.scripts || {})) {
    if (!original.scripts?.[key]) {
      diff.added[`scripts.${key}`] = value;
    } else if (original.scripts[key] !== value) {
      diff.modified[`scripts.${key}`] = { from: original.scripts[key], to: value };
    }
  }

  // Compare dependencies
  for (const [key, value] of Object.entries(merged.dependencies || {})) {
    if (!original.dependencies?.[key]) {
      diff.added[`dependencies.${key}`] = value;
    }
  }

  // Compare devDependencies
  for (const [key, value] of Object.entries(merged.devDependencies || {})) {
    if (!original.devDependencies?.[key]) {
      diff.added[`devDependencies.${key}`] = value;
    }
  }

  // Check engines
  if (merged.engines?.node !== original.engines?.node) {
    diff.modified['engines.node'] = {
      from: original.engines?.node || 'not set',
      to: merged.engines.node
    };
  }

  return diff;
}

function showDiff(diff) {
  console.log('\n');
  logger.info('Changes to package.json:');
  console.log('');

  if (Object.keys(diff.added).length > 0) {
    console.log(pc.green('+ Added:'));
    for (const [key, value] of Object.entries(diff.added)) {
      console.log(pc.green(`  + ${key}: ${JSON.stringify(value)}`));
    }
  }

  if (Object.keys(diff.modified).length > 0) {
    console.log(pc.yellow('~ Modified:'));
    for (const [key, change] of Object.entries(diff.modified)) {
      console.log(pc.yellow(`  ~ ${key}:`));
      console.log(pc.red(`    - ${change.from}`));
      console.log(pc.green(`    + ${change.to}`));
    }
  }

  console.log('');
}
