#!/usr/bin/env node

/**
 * Hook Execution Receipt Verifier
 * ================================
 * Reads the HMAC-signed execution receipt from session-security-init
 * and verifies its integrity and recency.
 *
 * Usage:
 *   node scripts/verify-hook-execution.js [--max-age-minutes=N]
 *
 * Exit codes:
 *   0 = Receipt valid and recent
 *   1 = Receipt missing, invalid HMAC, or too old
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_MAX_AGE_MINUTES = 60;

function findProjectRoot() {
  let dir = path.resolve(__dirname, '..');
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function parseArgs() {
  const args = process.argv.slice(2);
  let maxAgeMinutes = DEFAULT_MAX_AGE_MINUTES;

  for (const arg of args) {
    const match = arg.match(/^--max-age-minutes=(\d+)$/);
    if (match) {
      maxAgeMinutes = parseInt(match[1], 10);
    }
  }

  return { maxAgeMinutes };
}

export function verifyReceipt(receiptPath, signingKey, maxAgeMinutes = DEFAULT_MAX_AGE_MINUTES) {
  if (!fs.existsSync(receiptPath)) {
    return { valid: false, error: 'Receipt file not found' };
  }

  let receipt;
  try {
    receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf-8'));
  } catch {
    return { valid: false, error: 'Receipt file is not valid JSON' };
  }

  // Check required fields
  const requiredFields = ['hookName', 'sessionId', 'executedAt', 'status', 'validatorCount', 'issuesFound', 'hmac'];
  for (const field of requiredFields) {
    if (receipt[field] === undefined) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Verify HMAC
  const { hmac, ...receiptData } = receipt;
  const dataToSign = JSON.stringify(receiptData);
  const expectedHmac = crypto.createHmac('sha256', signingKey).update(dataToSign).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expectedHmac, 'hex'))) {
    return { valid: false, error: 'HMAC verification failed — receipt may be tampered' };
  }

  // Check recency
  const executedAt = new Date(receipt.executedAt);
  const now = new Date();
  const ageMinutes = (now.getTime() - executedAt.getTime()) / (1000 * 60);

  if (ageMinutes > maxAgeMinutes) {
    return {
      valid: false,
      error: `Receipt is ${ageMinutes.toFixed(1)} minutes old (max: ${maxAgeMinutes})`,
      receipt
    };
  }

  return {
    valid: true,
    receipt,
    ageMinutes: ageMinutes.toFixed(1)
  };
}

// CLI entry point
if (process.argv[1] && process.argv[1].includes('verify-hook-execution')) {
  const { maxAgeMinutes } = parseArgs();
  const projectRoot = findProjectRoot();
  const receiptPath = path.join(projectRoot, '.claude', 'logs', 'hook-execution-receipt.json');
  const signingKey = process.env.AUDIT_PRIVATE_KEY || 'bmad-default-hook-key';

  const result = verifyReceipt(receiptPath, signingKey, maxAgeMinutes);

  if (result.valid) {
    console.log(`PASS: Hook execution receipt valid (age: ${result.ageMinutes} min)`);
    console.log(`  Hook: ${result.receipt.hookName}`);
    console.log(`  Status: ${result.receipt.status}`);
    console.log(`  Session: ${result.receipt.sessionId}`);
    console.log(`  Validators: ${result.receipt.validatorCount}`);
    process.exit(0);
  } else {
    console.error(`FAIL: ${result.error}`);
    process.exit(1);
  }
}
