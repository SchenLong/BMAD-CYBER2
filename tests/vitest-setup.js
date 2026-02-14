/**
 * Vitest Setup File
 * Provides global utilities and path remapping for test files
 *
 * Tests in tests/utility/tools/* import from './*.js' but the actual
 * implementations are in src/utility/tools/*.js. This setup file provides
 * utilities to help tests find the correct source files.
 */

import path from 'path';
import fs from 'fs';
import { beforeEach, afterEach } from 'vitest';

// Store original fs functions
const originalExistsSync = fs.existsSync;
const originalReadFileSync = fs.readFileSync;

/**
 * Maps a test directory path to its corresponding source directory
 * tests/utility/tools/* -> src/utility/tools/*
 */
function mapTestPathToSource(filePath) {
  if (typeof filePath !== 'string') return filePath;

  // Check if this is a path in tests/utility/tools that needs mapping
  if (filePath.includes('/tests/utility/tools/') && filePath.endsWith('.js') && !filePath.endsWith('.test.js')) {
    const mappedPath = filePath.replace('/tests/utility/tools/', '/src/utility/tools/');
    return mappedPath;
  }

  return filePath;
}

/**
 * Override fs.existsSync to check source path if test path doesn't exist
 */
fs.existsSync = function(filePath) {
  // Try original path first
  if (originalExistsSync.call(fs, filePath)) {
    return true;
  }

  // Try mapped source path
  const mappedPath = mapTestPathToSource(filePath);
  if (mappedPath !== filePath) {
    return originalExistsSync.call(fs, mappedPath);
  }

  return false;
};

/**
 * Override fs.readFileSync to try source path if test path fails
 */
fs.readFileSync = function(filePath, options) {
  // Try original path first
  try {
    return originalReadFileSync.call(fs, filePath, options);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Try mapped source path
      const mappedPath = mapTestPathToSource(filePath);
      if (mappedPath !== filePath) {
        return originalReadFileSync.call(fs, mappedPath, options);
      }
    }
    throw err;
  }
};

// Helper to resolve source paths from test directories (for explicit use)
globalThis.getSourcePath = function(testDir, filename) {
  const testsUtilityTools = path.join('tests', 'utility', 'tools');
  const srcUtilityTools = path.join('src', 'utility', 'tools');

  // Replace tests/utility/tools with src/utility/tools in the path
  const sourcePath = testDir.replace(testsUtilityTools, srcUtilityTools);

  return path.join(sourcePath, filename);
};

// Store original TTY state before any tests modify it
const originalStdinIsTTY = process.stdin.isTTY;
const originalStdoutIsTTY = process.stdout.isTTY;
const originalStderrIsTTY = process.stderr.isTTY;

// Reset global state before each test to prevent cross-test pollution
beforeEach(() => {
  // Reset TTY state to original values
  process.stdin.isTTY = originalStdinIsTTY;
  process.stdout.isTTY = originalStdoutIsTTY;
  process.stderr.isTTY = originalStderrIsTTY;
});

// Ensure cleanup after each test
afterEach(() => {
  // Reset TTY state to original values
  process.stdin.isTTY = originalStdinIsTTY;
  process.stdout.isTTY = originalStdoutIsTTY;
  process.stderr.isTTY = originalStderrIsTTY;
});

// Helper to read source file content from a test directory
globalThis.readSourceFile = function(testDir, filename) {
  const sourcePath = globalThis.getSourcePath(testDir, filename);

  if (fs.existsSync(sourcePath)) {
    return fs.readFileSync(sourcePath, 'utf8');
  }

  throw new Error(`Source file not found: ${sourcePath}`);
};
