#!/usr/bin/env node
/**
 * BMAD Token Validation Test
 *
 * Validates the current token and displays status.
 *
 * Usage:
 *   node _bmad/core/security/validate-token.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Token Generator Class (for decryption)
// ============================================================================

class TokenGenerator {
  constructor(key) {
    this.key = key;
  }

  decrypt(token) {
    try {
      if (!token.startsWith('bmad.v1.')) {
        return { valid: false, error: 'Invalid token format (missing bmad.v1. prefix)' };
      }

      const encoded = token.slice('bmad.v1.'.length);
      const combined = Buffer.from(encoded, 'base64url');

      if (combined.length < 33) {
        return { valid: false, error: 'Token too short (corrupted)' };
      }

      const iv = combined.subarray(0, 16);
      const authTag = combined.subarray(16, 32);
      const encrypted = combined.subarray(32);

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      const claims = JSON.parse(decrypted.toString('utf8'));
      return { valid: true, claims };
    } catch (err) {
      return { valid: false, error: `Decryption failed: ${err.message}` };
    }
  }
}

// ============================================================================
// Validation Tests
// ============================================================================

function runValidation() {
  const projectRoot = process.cwd();
  const keyPath = path.join(projectRoot, '.bmad-key');
  const tokenPath = path.join(projectRoot, '.bmad-token');

  console.log('\n' + '='.repeat(70));
  console.log('              BMAD Token Validation Test');
  console.log('='.repeat(70) + '\n');

  const results = [];

  // Test 1: Key file exists
  const keyExists = fs.existsSync(keyPath);
  results.push({
    test: 'Encryption key exists (.bmad-key)',
    passed: keyExists,
    detail: keyExists ? `Found at ${keyPath}` : 'File not found'
  });

  if (!keyExists) {
    printResults(results);
    return;
  }

  // Test 2: Key file permissions
  const keyStats = fs.statSync(keyPath);
  const keyMode = (keyStats.mode & 0o777).toString(8);
  const keyPermsOk = keyMode === '600';
  results.push({
    test: 'Key file permissions (should be 600)',
    passed: keyPermsOk,
    detail: `Current: ${keyMode}${keyPermsOk ? '' : ' (WARNING: too permissive)'}`
  });

  // Test 3: Key size
  const key = fs.readFileSync(keyPath);
  const keySizeOk = key.length === 32;
  results.push({
    test: 'Key size (should be 32 bytes)',
    passed: keySizeOk,
    detail: `Current: ${key.length} bytes`
  });

  // Test 4: Token file exists
  const tokenExists = fs.existsSync(tokenPath);
  results.push({
    test: 'Token file exists (.bmad-token)',
    passed: tokenExists,
    detail: tokenExists ? `Found at ${tokenPath}` : 'File not found'
  });

  if (!tokenExists) {
    printResults(results);
    return;
  }

  // Test 5: Token file permissions
  const tokenStats = fs.statSync(tokenPath);
  const tokenMode = (tokenStats.mode & 0o777).toString(8);
  const tokenPermsOk = tokenMode === '600';
  results.push({
    test: 'Token file permissions (should be 600)',
    passed: tokenPermsOk,
    detail: `Current: ${tokenMode}${tokenPermsOk ? '' : ' (WARNING: too permissive)'}`
  });

  // Test 6: Token format
  const token = fs.readFileSync(tokenPath, 'utf-8').trim();
  const formatOk = token.startsWith('bmad.v1.');
  results.push({
    test: 'Token format (bmad.v1.* prefix)',
    passed: formatOk,
    detail: formatOk ? 'Valid format' : `Invalid: starts with "${token.substring(0, 20)}..."`
  });

  // Test 7: Token decryption
  const generator = new TokenGenerator(key);
  const decryptResult = generator.decrypt(token);
  results.push({
    test: 'Token decryption',
    passed: decryptResult.valid,
    detail: decryptResult.valid ? 'Successfully decrypted' : decryptResult.error
  });

  if (!decryptResult.valid) {
    printResults(results);
    return;
  }

  const claims = decryptResult.claims;

  // Test 8: Required claims present
  const requiredClaims = ['sub', 'name', 'roles', 'modules', 'iat', 'exp', 'jti'];
  const missingClaims = requiredClaims.filter(c => !claims[c]);
  const claimsOk = missingClaims.length === 0;
  results.push({
    test: 'Required claims present',
    passed: claimsOk,
    detail: claimsOk ? 'All claims present' : `Missing: ${missingClaims.join(', ')}`
  });

  // Test 9: Token not expired
  const now = new Date();
  const expDate = new Date(claims.exp);
  const notExpired = expDate > now;
  const hoursRemaining = ((expDate - now) / (1000 * 60 * 60)).toFixed(1);
  results.push({
    test: 'Token not expired',
    passed: notExpired,
    detail: notExpired
      ? `Expires in ${hoursRemaining} hours (${expDate.toISOString()})`
      : `Expired ${Math.abs(hoursRemaining)} hours ago`
  });

  // Test 10: Token not issued in future
  const iatDate = new Date(claims.iat);
  const iatValid = iatDate <= now;
  results.push({
    test: 'Token issued date valid',
    passed: iatValid,
    detail: iatValid ? `Issued: ${iatDate.toISOString()}` : 'Token issued in the future (clock skew?)'
  });

  // Test 11: Roles valid
  const validRoles = ['admin', 'security_lead', 'security_analyst', 'intel_analyst',
                      'developer', 'product_manager', 'viewer', 'guest'];
  const invalidRoles = claims.roles.filter(r => !validRoles.includes(r));
  const rolesValid = invalidRoles.length === 0;
  results.push({
    test: 'Roles are valid',
    passed: rolesValid,
    detail: rolesValid ? `Roles: ${claims.roles.join(', ')}` : `Invalid roles: ${invalidRoles.join(', ')}`
  });

  // Test 12: UUID format for sub and jti
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const subValid = uuidRegex.test(claims.sub);
  const jtiValid = uuidRegex.test(claims.jti);
  results.push({
    test: 'UUID format valid (sub, jti)',
    passed: subValid && jtiValid,
    detail: `sub: ${subValid ? 'valid' : 'invalid'}, jti: ${jtiValid ? 'valid' : 'invalid'}`
  });

  // Print results
  printResults(results);

  // Print token details
  console.log('\n' + '-'.repeat(70));
  console.log('  Token Details');
  console.log('-'.repeat(70));
  console.log(`  User ID:    ${claims.sub}`);
  console.log(`  Name:       ${claims.name}`);
  console.log(`  Email:      ${claims.email || '(not set)'}`);
  console.log(`  Roles:      ${claims.roles.join(', ')}`);
  console.log(`  Modules:    ${claims.modules.join(', ')}`);
  console.log(`  Issued:     ${claims.iat}`);
  console.log(`  Expires:    ${claims.exp}`);
  console.log(`  Token ID:   ${claims.jti}`);
  console.log('');
}

function printResults(results) {
  console.log('  Test Results');
  console.log('-'.repeat(70));

  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const status = r.passed ? '[PASS]' : '[FAIL]';
    const color = r.passed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`  ${color}${status}${reset} ${r.test}`);
    console.log(`         ${r.detail}`);

    if (r.passed) passed++;
    else failed++;
  }

  console.log('\n' + '-'.repeat(70));
  console.log(`  Summary: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('\n  \x1b[32m✓ All validation tests passed!\x1b[0m');
  } else {
    console.log('\n  \x1b[31m✗ Some tests failed. See details above.\x1b[0m');
  }
}

// Run validation
runValidation();
