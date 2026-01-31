#!/usr/bin/env node
/**
 * BMAD Authorization Check Utility
 *
 * Tests authorization permissions for agents, workflows, and modules.
 * Reads user context from .bmad-token and validates against rbac-config.yaml.
 *
 * Usage:
 *   node check-authorization.js                    # Show current user permissions
 *   node check-authorization.js agent <path>      # Check agent access
 *   node check-authorization.js workflow <name>   # Check workflow access
 *   node check-authorization.js module <name>     # Check module access
 *   node check-authorization.js role <name>       # Show role details
 *   node check-authorization.js --help            # Show help
 *
 * Part of Phase 2 Security Implementation.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { AuthorizationManager } = require('./authorization.js');

// ============================================================================
// Token Decoding (from session-manager)
// ============================================================================

function findProjectRoot() {
  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.bmad-token')) ||
        fs.existsSync(path.join(dir, '_bmad'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function decryptToken(encryptedToken, key) {
  try {
    const parts = encryptedToken.split('.');
    if (parts.length !== 3 || parts[0] !== 'bmad' || parts[1] !== 'v1') {
      return null;
    }

    // Token format: bmad.v1.<base64url(iv + authTag + ciphertext)>
    const combined = Buffer.from(parts[2], 'base64url');

    // Extract components: iv (16 bytes) + authTag (16 bytes) + ciphertext
    const iv = combined.slice(0, 16);
    const authTag = combined.slice(16, 32);
    const ciphertext = combined.slice(32);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, null, 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    return null;
  }
}

function getCurrentUser() {
  const projectRoot = findProjectRoot();
  const keyPath = path.join(projectRoot, '.bmad-key');
  const tokenPath = path.join(projectRoot, '.bmad-token');

  if (!fs.existsSync(keyPath)) {
    return null;
  }

  if (!fs.existsSync(tokenPath)) {
    return null;
  }

  try {
    const key = fs.readFileSync(keyPath);
    const token = fs.readFileSync(tokenPath, 'utf-8').trim();
    const claims = decryptToken(token, key);

    if (!claims) {
      return null;
    }

    // Check expiration
    if (new Date(claims.exp) < new Date()) {
      return null;
    }

    return {
      userId: claims.sub,
      userName: claims.name,
      roles: claims.roles || [],
      modules: claims.modules || [],
      credentialVerified: claims.credential_verified || false
    };
  } catch (error) {
    return null;
  }
}

// ============================================================================
// Display Functions
// ============================================================================

function showHelp() {
  console.log(`
======================================================================
              BMAD Authorization Check Utility
======================================================================

Usage:
  node check-authorization.js                    Show current user permissions
  node check-authorization.js agent <path>      Check agent access
  node check-authorization.js workflow <name>   Check workflow access
  node check-authorization.js module <name>     Check module access
  node check-authorization.js role <name>       Show role details
  node check-authorization.js roles             List all roles
  node check-authorization.js --help            Show this help

Examples:
  node check-authorization.js agent intel-team/osint-lead
  node check-authorization.js workflow operation-mosaic
  node check-authorization.js module cybersec-team
  node check-authorization.js role security_analyst

======================================================================
`);
}

function showUserPermissions(user, manager) {
  const permissions = manager.getEffectivePermissions(user.roles);

  console.log('');
  console.log('======================================================================');
  console.log('              Current User Authorization');
  console.log('======================================================================');
  console.log('');
  console.log('  User Information');
  console.log('  ----------------');
  console.log(`  User ID:             ${user.userId}`);
  console.log(`  Name:                ${user.userName}`);
  console.log(`  Roles:               ${user.roles.join(', ')}`);
  console.log(`  Credential Verified: ${user.credentialVerified ? 'Yes' : 'No'}`);
  console.log('');
  console.log('  Effective Permissions');
  console.log('  ---------------------');
  console.log(`  Actions:  ${permissions.actions.join(', ')}`);
  console.log('');

  console.log('  Modules:');
  for (const mod of permissions.modules) {
    console.log(`    - ${mod}`);
  }
  console.log('');

  console.log('  Agents (patterns):');
  for (const agent of permissions.agents.slice(0, 15)) {
    console.log(`    - ${agent}`);
  }
  if (permissions.agents.length > 15) {
    console.log(`    ... and ${permissions.agents.length - 15} more`);
  }
  console.log('');

  console.log('  Workflows (patterns):');
  for (const wf of permissions.workflows.slice(0, 15)) {
    console.log(`    - ${wf}`);
  }
  if (permissions.workflows.length > 15) {
    console.log(`    ... and ${permissions.workflows.length - 15} more`);
  }

  console.log('');
  console.log('======================================================================');
  console.log('');
}

function showRoleDetails(roleName, manager) {
  const role = manager.getRoleDetails(roleName);

  if (!role) {
    console.log(`\nError: Role '${roleName}' not found.\n`);
    console.log('Available roles:');
    for (const name of manager.getAllRoles()) {
      console.log(`  - ${name}`);
    }
    console.log('');
    return;
  }

  const resolved = manager.getEffectivePermissions([roleName]);

  console.log('');
  console.log('======================================================================');
  console.log(`              Role: ${roleName}`);
  console.log('======================================================================');
  console.log('');
  console.log(`  Description: ${role.description}`);
  if (role.inherits?.length) {
    console.log(`  Inherits:    ${role.inherits.join(', ')}`);
  }
  if (role.requires?.credential_verification) {
    console.log(`  Requires:    Credential Verification`);
  }
  if (role.special?.privileged) {
    console.log(`  Special:     Privileged Content`);
  }
  console.log('');
  console.log('  Direct Permissions');
  console.log('  ------------------');
  console.log(`  Actions:  ${role.permissions.actions?.join(', ') || 'none'}`);
  console.log(`  Modules:  ${role.permissions.modules?.join(', ') || 'none'}`);
  console.log('');

  if (role.inherits?.length) {
    console.log('  Effective Permissions (with inheritance)');
    console.log('  ----------------------------------------');
    console.log(`  Actions:  ${resolved.actions.join(', ')}`);
    console.log(`  Modules:  ${resolved.modules.join(', ')}`);
    console.log('');
  }

  console.log('  Agent Patterns:');
  for (const agent of role.permissions.agents || []) {
    console.log(`    - ${agent}`);
  }
  console.log('');

  console.log('  Workflow Patterns:');
  for (const wf of role.permissions.workflows || []) {
    console.log(`    - ${wf}`);
  }

  console.log('');
  console.log('======================================================================');
  console.log('');
}

function showAllRoles(manager) {
  console.log('');
  console.log('======================================================================');
  console.log('              BMAD RBAC - Available Roles');
  console.log('======================================================================');
  console.log('');

  for (const roleName of manager.getAllRoles()) {
    const role = manager.getRoleDetails(roleName);
    if (role) {
      const inherits = role.inherits?.length ? ` (inherits: ${role.inherits.join(', ')})` : '';
      console.log(`  ${roleName}`);
      console.log(`    ${role.description}${inherits}`);
      console.log('');
    }
  }

  console.log('======================================================================');
  console.log('');
}

function checkAccess(type, name, user, manager) {
  let result;
  let resourceType;

  switch (type) {
    case 'agent':
      result = manager.canAccessAgent(user, name);
      resourceType = 'Agent';
      break;
    case 'workflow':
      result = manager.canExecuteWorkflow(user, name);
      resourceType = 'Workflow';
      break;
    case 'module':
      result = manager.canAccessModule(user, name);
      resourceType = 'Module';
      break;
    default:
      console.log(`Unknown type: ${type}`);
      return;
  }

  console.log('');
  console.log('======================================================================');
  console.log('              Authorization Check Result');
  console.log('======================================================================');
  console.log('');
  console.log(`  User:     ${user.userName} (${user.roles.join(', ')})`);
  console.log(`  Resource: ${resourceType} - ${name}`);
  console.log('');

  if (result.allowed) {
    console.log('  Result:   ALLOWED');
    if (result.requires_approval) {
      console.log('  Note:     Requires approval before execution');
    }
    if (result.audit_level) {
      console.log(`  Audit:    ${result.audit_level}`);
    }
  } else {
    console.log('  Result:   DENIED');
  }

  if (result.reason) {
    console.log('');
    console.log('  Reason:');
    console.log(`    ${result.reason}`);
  }

  if (result.warning) {
    console.log('');
    console.log('  Warning:');
    const lines = result.warning.split('\n').filter(l => l.trim());
    for (const line of lines) {
      console.log(`    ${line.trim()}`);
    }
  }

  console.log('');
  console.log('======================================================================');
  console.log('');
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  // Help
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  // Load authorization manager
  const configPath = path.join(__dirname, 'rbac-config.yaml');
  if (!fs.existsSync(configPath)) {
    console.log('\nError: RBAC configuration not found at:', configPath);
    console.log('Run this from a project with _bmad/core/security/rbac-config.yaml\n');
    process.exit(1);
  }

  const manager = new AuthorizationManager(configPath);

  // List all roles
  if (args[0] === 'roles') {
    showAllRoles(manager);
    return;
  }

  // Show role details
  if (args[0] === 'role' && args[1]) {
    showRoleDetails(args[1], manager);
    return;
  }

  // Get current user
  const user = getCurrentUser();
  if (!user) {
    console.log('\n======================================================================');
    console.log('                     No Active Session');
    console.log('======================================================================');
    console.log('');
    console.log('  Could not find a valid authentication token.');
    console.log('');
    console.log('  To generate a token:');
    console.log('    node _bmad/core/security/quick-token.cjs "YourName" "admin"');
    console.log('');
    console.log('  Or run interactively:');
    console.log('    node _bmad/core/security/generate-token.js');
    console.log('');
    console.log('======================================================================');
    console.log('');

    // Can still show role info without a user
    if (args[0] === 'role' && args[1]) {
      showRoleDetails(args[1], manager);
    } else if (args[0] === 'roles') {
      showAllRoles(manager);
    }
    return;
  }

  // Check specific access
  if (args[0] === 'agent' && args[1]) {
    checkAccess('agent', args[1], user, manager);
    return;
  }

  if (args[0] === 'workflow' && args[1]) {
    checkAccess('workflow', args[1], user, manager);
    return;
  }

  if (args[0] === 'module' && args[1]) {
    checkAccess('module', args[1], user, manager);
    return;
  }

  // Default: show current user permissions
  showUserPermissions(user, manager);
}

main();
