/**
 * BMAD Quick Token Generator
 *
 * Non-interactive token generation for quick setup.
 * SECURITY: Requires explicit role specification - no admin default.
 *
 * Usage:
 *   node _bmad/core/security/quick-token.js <name> <roles> [hours]
 *
 * Examples:
 *   node quick-token.js "Alice" "developer" 168
 *   node quick-token.js "Bob" "security_analyst" 720
 *   node quick-token.js "Charlie" "admin" 24 --confirm-admin
 *
 * SECURITY NOTES:
 * - Admin role requires --confirm-admin flag
 * - Default role is 'viewer' (least privilege)
 * - Token files are created with 0600 permissions
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Security Constants
// ============================================================================

const VALID_ROLES = [
  'admin', 'security_lead', 'security_analyst', 'intel_analyst',
  'legal_analyst', 'developer', 'product_manager', 'viewer', 'guest'
];

const PRIVILEGED_ROLES = ['admin', 'security_lead'];
const DEFAULT_ROLE = 'viewer';
const MAX_TOKEN_HOURS = 720; // 30 days maximum

// ============================================================================
// Token Generator Class
// ============================================================================

class TokenGenerator {
  constructor(key) {
    if (key.length !== 32) {
      throw new Error('Key must be 32 bytes for AES-256');
    }
    this.key = key;
  }

  static generateKey() {
    return crypto.randomBytes(32);
  }

  encrypt(claims) {
    const plaintext = JSON.stringify(claims);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    const combined = Buffer.concat([iv, authTag, encrypted]);
    return `bmad.v1.${  combined.toString('base64url')}`;
  }

  generateToken(name, roles, modules, expiresInHours = 168) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

    const claims = {
      sub: crypto.randomUUID(),
      name,
      roles,
      modules,
      iat: now.toISOString(),
      exp: expiresAt.toISOString(),
      jti: crypto.randomUUID()
    };

    return { token: this.encrypt(claims), claims, expiresAt };
  }
}

// ============================================================================
// Argument Validation
// ============================================================================

function showUsage() {
  console.log(`
BMAD Quick Token Generator
==========================

Usage:
  node quick-token.js <name> <roles> [hours] [--confirm-admin]

Arguments:
  name   - User display name (required)
  roles  - Comma-separated roles (required)
           Valid: ${VALID_ROLES.join(', ')}
  hours  - Token validity in hours (default: 168, max: ${MAX_TOKEN_HOURS})

Flags:
  --confirm-admin  Required when generating admin/security_lead tokens

Examples:
  node quick-token.js "Alice" "developer" 168
  node quick-token.js "Bob" "viewer"
  node quick-token.js "Admin" "admin" 24 --confirm-admin

Security:
  - No default admin role (PRIV-001 fix)
  - Privileged roles require explicit confirmation
  - Token files created with 0600 permissions
`);
  process.exit(1);
}

function validateArguments(args) {
  const errors = [];
  const hasConfirmAdmin = args.includes('--confirm-admin');
  const filteredArgs = args.filter(a => !a.startsWith('--'));

  const name = filteredArgs[0];
  const rolesArg = filteredArgs[1];
  const hoursArg = filteredArgs[2];

  // Name is required
  if (!name || name.trim() === '') {
    errors.push('Name is required');
  }

  // Roles are required (no admin default)
  if (!rolesArg || rolesArg.trim() === '') {
    errors.push('Roles are required (security: no default admin role)');
  }

  const roles = rolesArg ? rolesArg.split(',').map(r => r.trim().toLowerCase()) : [];

  // Validate role names
  for (const role of roles) {
    if (!VALID_ROLES.includes(role)) {
      errors.push(`Invalid role: '${role}'. Valid roles: ${VALID_ROLES.join(', ')}`);
    }
  }

  // Check privileged roles require confirmation
  const hasPrivilegedRole = roles.some(r => PRIVILEGED_ROLES.includes(r));
  if (hasPrivilegedRole && !hasConfirmAdmin) {
    errors.push(`Privileged roles (${PRIVILEGED_ROLES.join(', ')}) require --confirm-admin flag`);
  }

  // Validate hours
  const hours = hoursArg ? parseInt(hoursArg) : 168;
  if (isNaN(hours) || hours <= 0) {
    errors.push('Hours must be a positive number');
  } else if (hours > MAX_TOKEN_HOURS) {
    errors.push(`Hours cannot exceed ${MAX_TOKEN_HOURS} (30 days)`);
  }

  return { name, roles, hours, errors, hasConfirmAdmin };
}

// ============================================================================
// Main
// ============================================================================

function main() {
  // Parse arguments
  const args = process.argv.slice(2);

  // Show usage if no arguments or help flag
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
  }

  // Validate arguments
  const validation = validateArguments(args);

  if (validation.errors.length > 0) {
    console.error('\n[ERROR] Validation failed:');
    validation.errors.forEach(e => console.error(`  - ${e}`));
    console.error('\nRun with --help for usage information.\n');
    process.exit(1);
  }

  const { name, roles, hours, hasConfirmAdmin } = validation;

  // Warn about privileged role generation
  if (hasConfirmAdmin) {
    console.warn(`\n[WARNING] Generating token with privileged role(s): ${  roles.filter(r => PRIVILEGED_ROLES.includes(r)).join(', ')}`);
    console.warn('         Ensure this is authorized and logged appropriately.\n');
  }

  // Module mapping
  const moduleMap = {
    'admin': ['*'],
    'security_lead': ['cybersec-team', 'intel-team', 'core'],
    'security_analyst': ['cybersec-team', 'core'],
    'intel_analyst': ['intel-team', 'core'],
    'developer': ['bmm', 'bmgd', 'bmb', 'cis', 'core'],
    'product_manager': ['bmm', 'cis', 'core'],
    'viewer': ['core'],
    'guest': ['core']
  };

  const modules = [...new Set(roles.flatMap(r => moduleMap[r] || ['core']))];

  // Paths
  const projectRoot = process.cwd();
  const keyPath = path.join(projectRoot, '.bmad-key');
  const tokenPath = path.join(projectRoot, '.bmad-token');

  // Generate or load key
  let key;
  if (fs.existsSync(keyPath)) {
    key = fs.readFileSync(keyPath);
    console.log('[OK] Using existing encryption key');
  } else {
    key = TokenGenerator.generateKey();
    fs.writeFileSync(keyPath, key);
    fs.chmodSync(keyPath, 0o600);
    console.log('[OK] Generated new encryption key: .bmad-key');
  }

  // Generate token
  const generator = new TokenGenerator(key);
  const result = generator.generateToken(name, roles, modules, hours);

  // Save token
  fs.writeFileSync(tokenPath, result.token);
  fs.chmodSync(tokenPath, 0o600);

  console.log(`\n${  '='.repeat(60)}`);
  console.log('            Token Generated Successfully');
  console.log('='.repeat(60));
  console.log(`  Name:    ${result.claims.name}`);
  console.log(`  User ID: ${result.claims.sub}`);
  console.log(`  Roles:   ${result.claims.roles.join(', ')}`);
  console.log(`  Modules: ${result.claims.modules.join(', ')}`);
  console.log(`  Expires: ${result.expiresAt.toISOString()}`);
  console.log(`\n  Token saved to: ${tokenPath}\n`);
}

main();
