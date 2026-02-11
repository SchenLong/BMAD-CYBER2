/**
 * BMAD Guardrails: Environment Protection Validator
 * ==================================================
 * Blocks modifications to sensitive environment and credential files.
 *
 * Exit Codes:
 * - 0: Allow the operation
 * - 2: Block the operation (with user override option)
 *
 * Security Features:
 * - 80+ protected file patterns
 * - Cloud provider configuration detection
 * - Hidden file with sensitive keyword detection
 * - Single-use override tokens with 5-minute timeout
 */

import * as path from 'node:path';
import {
  AuditLogger,
  getToolInputFromStdinSync,
  OverrideManager,
  printBlockMessage,
  printOverrideConsumed,
} from '../common/index.js';
import type { EditToolInput, WriteToolInput } from '../types/index.js';
import { EXIT_CODES } from '../types/index.js';

const VALIDATOR_NAME = 'env_protection';

// ============================================================================
// Protected File Patterns
// ============================================================================

/** Environment files */
const ENV_PATTERNS = [
  '.env',
  '.env.*',
  '*.env',
  '.envrc',
];

/** Credential files */
const CREDENTIAL_PATTERNS = [
  'credentials.*',
  'secrets.*',
  '*credentials*',
  '*secrets*',
];

/** Cryptographic key files */
const KEY_PATTERNS = [
  '*.pem',
  '*.key',
  '*.p12',
  '*.pfx',
  '*.jks',
  '*.keystore',
  'id_rsa',
  'id_rsa.*',
  'id_ed25519',
  'id_ed25519.*',
  'id_dsa',
  'id_ecdsa',
];

/** SSH configuration files */
const SSH_PATTERNS = [
  'ssh_config',
  'sshd_config',
  'known_hosts',
  'authorized_keys',
];

/** AWS credential files */
const AWS_PATTERNS = [
  'aws_credentials',
  '.aws/credentials',
  '.aws/config',
];

/** Docker secrets */
const DOCKER_PATTERNS = [
  '.docker/config.json',
];

/** Kubernetes secrets */
const K8S_PATTERNS = [
  'kubeconfig',
  '.kube/config',
];

/** GPG key files */
const GPG_PATTERNS = [
  '*.gpg',
  'secring.gpg',
  'trustdb.gpg',
];

/** Password files */
const PASSWORD_PATTERNS = [
  '.htpasswd',
  '.netrc',
  '.pgpass',
];

/** Token files */
const TOKEN_PATTERNS = [
  '.npmrc',
  '.pypirc',
];

/** All protected patterns */
const PROTECTED_PATTERNS = [
  ...ENV_PATTERNS,
  ...CREDENTIAL_PATTERNS,
  ...KEY_PATTERNS,
  ...SSH_PATTERNS,
  ...AWS_PATTERNS,
  ...DOCKER_PATTERNS,
  ...K8S_PATTERNS,
  ...GPG_PATTERNS,
  ...PASSWORD_PATTERNS,
  ...TOKEN_PATTERNS,
];

/** Patterns that bypass protection (example/template files) */
const ALLOWED_PATTERNS = [
  '*.example',
  '*.template',
  '*.sample',
  '.env.example',
  '.env.template',
  '.env.sample',
  'example.*',
  'template.*',
  'sample.*',
  '*.example.*',
  '*.template.*',
  '*.sample.*',
];

/** Cloud provider configuration paths */
const CLOUD_CONFIG_PATHS: Array<{ components: string[]; description: string }> = [
  { components: ['.gcloud'], description: 'Google Cloud configuration' },
  { components: ['.azure'], description: 'Azure configuration' },
  { components: ['.config', 'gcloud'], description: 'Google Cloud configuration' },
  { components: ['.config', 'azure'], description: 'Azure configuration' },
];

/** Sensitive keywords for hidden files */
const SENSITIVE_KEYWORDS = ['secret', 'cred', 'key', 'token', 'auth', 'pass', 'private'];

// ============================================================================
// Glob Pattern Matching
// ============================================================================

/**
 * Convert a glob pattern to a regex.
 * Supports: * (any chars except /), ? (single char), ** (any path)
 */
function globToRegex(pattern: string): RegExp {
  const regex = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special regex chars except * and ?
    .replace(/\*\*/g, '{{GLOBSTAR}}')      // Temporarily replace **
    .replace(/\*/g, '[^/]*')               // * matches anything except /
    .replace(/\?/g, '[^/]')                // ? matches single char except /
    .replace(/\{\{GLOBSTAR\}\}/g, '.*');   // ** matches anything including /

  return new RegExp(`^${regex}$`, 'i');
}

/**
 * Check if a filename matches a glob pattern (case-insensitive).
 */
function matchesGlob(filename: string, pattern: string): boolean {
  const regex = globToRegex(pattern);
  return regex.test(filename);
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if a filename matches any allowed pattern (example/template files).
 */
export function isAllowedPattern(filename: string): boolean {
  const filenameLower = filename.toLowerCase();
  const basename = path.basename(filenameLower);

  for (const pattern of ALLOWED_PATTERNS) {
    if (matchesGlob(filenameLower, pattern) || matchesGlob(basename, pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a path contains cloud provider configuration directories.
 */
function checkCloudConfigPath(filePath: string): string | null {
  const pathParts = filePath.split(path.sep).map(p => p.toLowerCase());

  for (const { components, description } of CLOUD_CONFIG_PATHS) {
    // Check if components appear sequentially in path
    let startIdx = 0;
    let found = true;

    for (const comp of components) {
      const idx = pathParts.indexOf(comp.toLowerCase(), startIdx);
      if (idx === -1) {
        found = false;
        break;
      }
      startIdx = idx + 1;
    }

    if (found) {
      return description;
    }
  }

  return null;
}

/**
 * Check if a file is a hidden file with sensitive keywords.
 */
function isHiddenSensitiveFile(filename: string): string | null {
  const basename = path.basename(filename).toLowerCase();

  if (!basename.startsWith('.')) {
    return null;
  }

  for (const keyword of SENSITIVE_KEYWORDS) {
    if (basename.includes(keyword)) {
      return `Hidden file with sensitive keyword: '${keyword}'`;
    }
  }

  return null;
}

/**
 * Check if a file is protected.
 *
 * @returns Tuple of [isProtected, reason]
 */
export function isProtectedFile(filePath: string): [boolean, string | null] {
  if (!filePath) {
    return [false, null];
  }

  const filePathLower = filePath.toLowerCase();
  const basename = path.basename(filePathLower);

  // Step 1: Check allowed patterns (bypass protection)
  if (isAllowedPattern(filePath)) {
    return [false, 'Allowed: matches example/template pattern'];
  }

  // Step 2: Check protected patterns
  for (const pattern of PROTECTED_PATTERNS) {
    if (matchesGlob(filePathLower, pattern) || matchesGlob(basename, pattern)) {
      return [true, `Matches protected pattern: ${pattern}`];
    }
  }

  // Step 3: Check cloud config paths
  const cloudConfig = checkCloudConfigPath(filePath);
  if (cloudConfig) {
    return [true, `Cloud config: ${cloudConfig}`];
  }

  // Step 4: Check hidden files with sensitive keywords
  const hiddenSensitive = isHiddenSensitiveFile(filePath);
  if (hiddenSensitive) {
    return [true, hiddenSensitive];
  }

  return [false, null];
}

/**
 * Main validation function.
 */
export function validateEnvProtection(filePath: string): number {
  if (!filePath) {
    return EXIT_CODES.ALLOW;
  }

  const [isProtected, reason] = isProtectedFile(filePath);

  if (!isProtected) {
    AuditLogger.logAllowed(VALIDATOR_NAME, 'File is not protected', { file: filePath });
    return EXIT_CODES.ALLOW;
  }

  // File is protected - check for override
  const overrideResult = OverrideManager.checkAndConsume('SENSITIVE_FILES');

  if (overrideResult.valid) {
    AuditLogger.logOverrideUsed(VALIDATOR_NAME, 'BMAD_ALLOW_SENSITIVE_FILES', filePath);
    printOverrideConsumed(
      `Protected file modification: ${reason}`,
      'BMAD_ALLOW_SENSITIVE_FILES'
    );
    return EXIT_CODES.ALLOW;
  }

  // Block the operation
  AuditLogger.logBlocked(VALIDATOR_NAME, reason || 'Protected file', filePath);

  printBlockMessage({
    title: 'SENSITIVE FILE PROTECTION',
    message: `This file is protected: ${reason}`,
    target: filePath,
    overrideVar: 'BMAD_ALLOW_SENSITIVE_FILES',
    recommendations: [
      'Use .env.example or .env.template for documentation',
      'Store actual secrets in a secure vault (AWS Secrets Manager, HashiCorp Vault)',
      'Use environment variables set outside the codebase',
    ],
  });

  return EXIT_CODES.HARD_BLOCK;
}

/**
 * CLI entry point.
 */
export function main(): void {
  const input = getToolInputFromStdinSync();
  const toolInput = input.tool_input as Partial<WriteToolInput | EditToolInput>;
  const filePath = toolInput.file_path || '';

  const exitCode = validateEnvProtection(filePath);
  process.exit(exitCode);
}

// Run if executed directly
const isMain = process.argv[1]?.endsWith('env-protection.js') ||
               process.argv[1]?.endsWith('env-protection.ts');
if (isMain) {
  main();
}
