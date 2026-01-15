#!/usr/bin/env node
/**
 * BMAD Token Generation Utility
 *
 * Generates encrypted tokens for BMAD authentication.
 * Run this to create a new authentication token.
 *
 * Usage:
 *   node _bmad/core/security/generate-token.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

  /**
   * Generate encryption key from password or create new random key
   */
  static generateKey(password) {
    if (password) {
      // Derive key from password using PBKDF2
      return crypto.pbkdf2Sync(password, 'bmad-auth-salt-v1', 100000, 32, 'sha256');
    }
    // Generate random key
    return crypto.randomBytes(32);
  }

  /**
   * Encrypt and encode token
   */
  encrypt(claims) {
    const plaintext = JSON.stringify(claims);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Combine: iv + authTag + encrypted
    const combined = Buffer.concat([iv, authTag, encrypted]);

    return 'bmad.v1.' + combined.toString('base64url');
  }

  /**
   * Decrypt and validate token
   */
  decrypt(token) {
    try {
      if (!token.startsWith('bmad.v1.')) {
        return null;
      }

      const encoded = token.slice('bmad.v1.'.length);
      const combined = Buffer.from(encoded, 'base64url');

      const iv = combined.subarray(0, 16);
      const authTag = combined.subarray(16, 32);
      const encrypted = combined.subarray(32);

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      const claims = JSON.parse(decrypted.toString('utf8'));

      // Validate expiration
      if (new Date(claims.exp) < new Date()) {
        return null;
      }

      return claims;
    } catch {
      return null;
    }
  }

  /**
   * Generate a new token with the given claims
   */
  generateToken(name, email, roles, modules, expiresInHours = 168) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

    const claims = {
      sub: crypto.randomUUID(),
      name,
      email,
      roles,
      modules,
      iat: now.toISOString(),
      exp: expiresAt.toISOString(),
      jti: crypto.randomUUID()
    };

    const token = this.encrypt(claims);

    return { token, claims, expiresAt };
  }
}

// ============================================================================
// Interactive Token Generation
// ============================================================================

async function interactiveGeneration() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => {
    return new Promise(resolve => rl.question(prompt, resolve));
  };

  console.log('\n' + '='.repeat(70));
  console.log('              BMAD Authentication Token Generator');
  console.log('='.repeat(70) + '\n');

  // Gather user information
  const name = await question('Enter your name: ');
  if (!name.trim()) {
    console.error('\nError: Name is required.');
    rl.close();
    process.exit(1);
  }

  const email = await question('Enter your email (optional, press Enter to skip): ');

  console.log('\nAvailable roles:');
  console.log('  1. admin            - Full system access');
  console.log('  2. security_lead    - Security team lead');
  console.log('  3. security_analyst - Security analyst');
  console.log('  4. intel_analyst    - Intelligence analyst');
  console.log('  5. developer        - Software developer');
  console.log('  6. product_manager  - Product manager');
  console.log('  7. viewer           - Read-only access');
  console.log('  8. guest            - Limited guest access');

  const roleInput = await question('\nEnter role numbers (comma-separated, e.g., 1,5): ');

  const roleMap = {
    '1': 'admin',
    '2': 'security_lead',
    '3': 'security_analyst',
    '4': 'intel_analyst',
    '5': 'developer',
    '6': 'product_manager',
    '7': 'viewer',
    '8': 'guest'
  };

  const roles = roleInput.split(',')
    .map(s => s.trim())
    .filter(s => roleMap[s])
    .map(s => roleMap[s]);

  if (roles.length === 0) {
    roles.push('viewer');
    console.log('\nNo valid roles selected, defaulting to: viewer');
  }

  // Determine modules based on roles
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

  const expiresHours = await question('\nToken validity in hours (default 168 = 7 days): ');
  const hours = parseInt(expiresHours) || 168;

  rl.close();

  // Determine project root
  const projectRoot = process.cwd();
  const keyPath = path.join(projectRoot, '.bmad-key');
  const tokenPath = path.join(projectRoot, '.bmad-token');

  // Generate or load key
  let key;

  if (fs.existsSync(keyPath)) {
    key = fs.readFileSync(keyPath);
    console.log('\n[OK] Using existing encryption key');
  } else {
    key = TokenGenerator.generateKey();
    fs.writeFileSync(keyPath, key);
    fs.chmodSync(keyPath, 0o600);
    console.log('\n[OK] Generated new encryption key: .bmad-key');
  }

  // Generate token
  const generator = new TokenGenerator(key);
  const result = generator.generateToken(
    name.trim(),
    email.trim() || undefined,
    roles,
    modules,
    hours
  );

  // Save token
  fs.writeFileSync(tokenPath, result.token);
  fs.chmodSync(tokenPath, 0o600);

  console.log('\n' + '='.repeat(70));
  console.log('                   Token Generated Successfully');
  console.log('='.repeat(70));
  console.log(`\n  Name:    ${result.claims.name}`);
  console.log(`  Email:   ${result.claims.email || '(not set)'}`);
  console.log(`  User ID: ${result.claims.sub}`);
  console.log(`  Roles:   ${result.claims.roles.join(', ')}`);
  console.log(`  Modules: ${result.claims.modules.join(', ')}`);
  console.log(`  Expires: ${result.expiresAt.toISOString()}`);
  console.log(`\n  Token saved to: ${tokenPath}`);
  console.log('\n  You can now use BMAD with authenticated access.\n');
}

// ============================================================================
// CLI Entry Point
// ============================================================================

if (require.main === module) {
  interactiveGeneration().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { TokenGenerator };
