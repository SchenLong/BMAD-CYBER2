/**
 * SA-08: Backup Restore Script Validation
 * ========================================
 * Verifies that the backup restore test script exists and is executable.
 */

import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.join(process.cwd(), 'scripts/test-backup-restore.sh');

describe('Backup Restore Script (SB-03)', () => {
  it('should exist at the expected path', () => {
    expect(fs.existsSync(SCRIPT_PATH)).toBe(true);
  });

  it('should be executable', () => {
    const stats = fs.statSync(SCRIPT_PATH);
    // Check owner execute bit
    const isExecutable = (stats.mode & 0o100) !== 0;
    expect(isExecutable).toBe(true);
  });

  it('should contain required test steps', () => {
    const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');

    expect(content).toContain('git tag');
    expect(content).toContain('git reset');
    expect(content).toContain('PASS');
    expect(content).toContain('FAIL');
  });

  it('should have proper shebang', () => {
    const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
    expect(content.startsWith('#!/bin/bash')).toBe(true);
  });

  it('should use strict mode', () => {
    const content = fs.readFileSync(SCRIPT_PATH, 'utf-8');
    expect(content).toContain('set -euo pipefail');
  });
});
