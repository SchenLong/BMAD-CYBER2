#!/usr/bin/env node
/**
 * BMAD Quick Token Generator
 *
 * Non-interactive token generation for quick setup.
 *
 * Usage:
 *   node _bmad/core/security/quick-token.js [name] [roles] [hours]
 *
 * Examples:
 *   node quick-token.js "J" "admin" 168
 *   node quick-token.js "Alice" "developer,security_analyst" 720
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

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
    return 'bmad.v1.' + combined.toString('base64url');
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
// Main
// ============================================================================

function main() {
  // Parse arguments
  const args = process.argv.slice(2);
  const name = args[0] || 'Admin';
  const rolesArg = args[1] || 'admin';
  const hours = parseInt(args[2]) || 168;

  const roles = rolesArg.split(',').map(r => r.trim());

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

  console.log('\n' + '='.repeat(60));
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
