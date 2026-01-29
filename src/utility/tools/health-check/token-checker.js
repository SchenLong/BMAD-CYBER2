/**
 * BMAD Token Validity Checker - INST-020
 * Epic 4 - Post-Install Health Check
 *
 * Validates BMAD authentication tokens for proper structure,
 * encryption integrity, and expiration status.
 *
 * @module health-check/token-checker
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Constants
// ============================================================================

export const TOKEN_PATH = '.bmad-token';
export const KEY_PATH = '.bmad-key';
export const TOKEN_PREFIX = 'bmad.v1.';
export const EXPIRATION_WARNING_THRESHOLD_MS = 24 * 60 * 60 * 1000;
export const REQUIRED_TOKEN_FIELDS = ['sub', 'roles', 'modules', 'exp'];
export const TOKEN_STATUS = {
  VALID: 'valid',
  EXPIRED: 'expired',
  INVALID: 'invalid',
  MISSING: 'missing'
};

// ============================================================================
// File Operations
// ============================================================================

export function checkTokenFilesExist(basePath = process.cwd()) {
  const tokenPath = path.join(basePath, TOKEN_PATH);
  const keyPath = path.join(basePath, KEY_PATH);
  return {
    tokenExists: fs.existsSync(tokenPath),
    keyExists: fs.existsSync(keyPath),
    tokenPath,
    keyPath
  };
}

export function readKeyFile(keyPath) {
  try {
    const key = fs.readFileSync(keyPath);
    if (key.length !== 32) return null;
    return key;
  } catch { return null; }
}

export function readTokenFile(tokenPath) {
  try {
    const token = fs.readFileSync(tokenPath, 'utf8').trim();
    return token || null;
  } catch { return null; }
}

// ============================================================================
// Decryption
// ============================================================================

export function decryptToken(token, key) {
  try {
    if (!token || !token.startsWith(TOKEN_PREFIX)) {
      return { success: false, claims: null, error: 'Invalid token format: missing or incorrect prefix' };
    }
    if (!key || key.length !== 32) {
      return { success: false, claims: null, error: 'Invalid encryption key: must be 32 bytes' };
    }
    const encoded = token.slice(TOKEN_PREFIX.length);
    const combined = Buffer.from(encoded, 'base64url');
    if (combined.length < 33) {
      return { success: false, claims: null, error: 'Invalid token: payload too short' };
    }
    const iv = combined.subarray(0, 16);
    const authTag = combined.subarray(16, 32);
    const encrypted = combined.subarray(32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const claims = JSON.parse(decrypted.toString('utf8'));
    return { success: true, claims, error: null };
  } catch (err) {
    if (err.message && err.message.includes('auth tag')) {
      return { success: false, claims: null, error: 'Decryption failed: authentication tag mismatch (wrong key or corrupted token)' };
    }
    return { success: false, claims: null, error: 'Decryption failed: ' + (err.message || 'unknown error') };
  }
}

// ============================================================================
// Validation
// ============================================================================

export function validateTokenStructure(claims) {
  if (!claims || typeof claims !== 'object') {
    return { valid: false, missingFields: REQUIRED_TOKEN_FIELDS };
  }
  const missingFields = REQUIRED_TOKEN_FIELDS.filter(field => {
    const value = claims[field];
    return value === undefined || value === null;
  });
  return { valid: missingFields.length === 0, missingFields };
}

export function checkExpiration(claims, now = new Date()) {
  if (!claims || !claims.exp) {
    return { expired: true, expiresAt: null, expiresIn: null, expiresInMs: null, warningThresholdReached: false };
  }
  let expiresAt;
  try {
    expiresAt = new Date(claims.exp);
    if (isNaN(expiresAt.getTime())) {
      return { expired: true, expiresAt: null, expiresIn: null, expiresInMs: null, warningThresholdReached: false };
    }
  } catch { return { expired: true, expiresAt: null, expiresIn: null, expiresInMs: null, warningThresholdReached: false }; }
  const expiresInMs = expiresAt.getTime() - now.getTime();
  const expired = expiresInMs <= 0;
  const warningThresholdReached = !expired && expiresInMs <= EXPIRATION_WARNING_THRESHOLD_MS;
  return {
    expired,
    expiresAt,
    expiresIn: expired ? null : formatDuration(expiresInMs),
    expiresInMs: expired ? null : expiresInMs,
    warningThresholdReached
  };
}

export function formatDuration(ms) {
  if (ms <= 0) return '0 seconds';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const parts = [];
  if (days > 0) parts.push(days + ' day' + (days !== 1 ? 's' : ''));
  const remainingHours = hours % 24;
  if (remainingHours > 0) parts.push(remainingHours + ' hour' + (remainingHours !== 1 ? 's' : ''));
  const remainingMinutes = minutes % 60;
  if (days === 0 && remainingMinutes > 0) parts.push(remainingMinutes + ' minute' + (remainingMinutes !== 1 ? 's' : ''));
  const remainingSeconds = seconds % 60;
  if (hours === 0 && remainingSeconds > 0) parts.push(remainingSeconds + ' second' + (remainingSeconds !== 1 ? 's' : ''));
  return parts.length > 0 ? parts.join(' ') : '0 seconds';
}

export function extractRole(claims) {
  if (!claims) return null;
  if (claims.role && typeof claims.role === 'string') return claims.role;
  if (claims.roles && Array.isArray(claims.roles) && claims.roles.length > 0) return claims.roles[0];
  return null;
}

export function extractUserId(claims) {
  if (!claims) return null;
  return claims.sub || claims.userId || null;
}

// ============================================================================
// Main Check Function
// ============================================================================

export function checkToken(options = {}) {
  const { basePath = process.cwd(), now = new Date() } = options;
  const warnings = [];
  const fileCheck = checkTokenFilesExist(basePath);
  if (!fileCheck.tokenExists && !fileCheck.keyExists) {
    return { status: TOKEN_STATUS.MISSING, role: null, userId: null, expiresIn: null, expiresAt: null, warnings: [], error: 'Both token and key files are missing' };
  }
  if (!fileCheck.tokenExists) {
    return { status: TOKEN_STATUS.MISSING, role: null, userId: null, expiresIn: null, expiresAt: null, warnings: [], error: 'Token file missing: ' + TOKEN_PATH };
  }
  if (!fileCheck.keyExists) {
    return { status: TOKEN_STATUS.MISSING, role: null, userId: null, expiresIn: null, expiresAt: null, warnings: [], error: 'Key file missing: ' + KEY_PATH };
  }
  const key = readKeyFile(fileCheck.keyPath);
  if (!key) {
    return { status: TOKEN_STATUS.INVALID, role: null, userId: null, expiresIn: null, expiresAt: null, warnings: [], error: 'Invalid encryption key: must be exactly 32 bytes' };
  }
  const token = readTokenFile(fileCheck.tokenPath);
  if (!token) {
    return { status: TOKEN_STATUS.INVALID, role: null, userId: null, expiresIn: null, expiresAt: null, warnings: [], error: 'Token file is empty or unreadable' };
  }
  const decryptResult = decryptToken(token, key);
  if (!decryptResult.success) {
    return { status: TOKEN_STATUS.INVALID, role: null, userId: null, expiresIn: null, expiresAt: null, warnings: [], error: decryptResult.error };
  }
  const claims = decryptResult.claims;
  const structureCheck = validateTokenStructure(claims);
  if (!structureCheck.valid) {
    return { status: TOKEN_STATUS.INVALID, role: extractRole(claims), userId: extractUserId(claims), expiresIn: null, expiresAt: null, warnings: [], error: 'Token missing required fields: ' + structureCheck.missingFields.join(', ') };
  }
  const expirationCheck = checkExpiration(claims, now);
  if (expirationCheck.expired) {
    return { status: TOKEN_STATUS.EXPIRED, role: extractRole(claims), userId: extractUserId(claims), expiresIn: null, expiresAt: expirationCheck.expiresAt, warnings: ['Token has expired'], error: null };
  }
  if (expirationCheck.warningThresholdReached) {
    warnings.push('Token expires within 24 hours (' + expirationCheck.expiresIn + ')');
  }
  return { status: TOKEN_STATUS.VALID, role: extractRole(claims), userId: extractUserId(claims), expiresIn: expirationCheck.expiresIn, expiresAt: expirationCheck.expiresAt, warnings, error: null };
}

export default checkToken;
