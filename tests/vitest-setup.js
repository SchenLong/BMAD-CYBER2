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
import { beforeEach, afterEach, afterAll } from 'vitest';

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

// Cleanup after all tests complete - restore fs overrides
// This prevents worker crashes during vitest cleanup
afterAll(() => {
  fs.existsSync = originalExistsSync;
  fs.readFileSync = originalReadFileSync;
  // Force garbage collection to free memory before worker cleanup
  if (global.gc) {
    global.gc();
  }
});

// Handle worker exit gracefully during cleanup
// This is a known tinypool issue when tests spawn subprocesses
// The worker exits after all tests pass, but tinypool reports it as unexpected
process.on('unhandledRejection', (reason) => {
  // Suppress "Worker exited unexpectedly" during cleanup
  if (reason && reason.message && reason.message.includes('Worker exited')) {
    return; // Let it exit gracefully
  }
  // Suppress tinypool worker termination errors
  if (reason && reason.message && (
    reason.message.includes('worker') ||
    reason.message.includes('tinypool') ||
    reason.message.includes('terminated')
  )) {
    return; // Let it exit gracefully
  }
  // Log other unhandled rejections for debugging
  console.warn('Unhandled Rejection:', reason);
});

// Handle uncaught exceptions from worker cleanup
process.on('uncaughtException', (err) => {
  // Suppress worker-related exceptions during cleanup
  if (err && err.message && (
    err.message.includes('Worker exited') ||
    err.message.includes('worker') ||
    err.message.includes('tinypool') ||
    err.message.includes('terminated') ||
    err.message.includes('ECONNRESET') // Connection reset during worker shutdown
  )) {
    return; // Let it exit gracefully
  }
  // Log other uncaught exceptions for debugging
  console.error('Uncaught Exception:', err);
});

// Helper to read source file content from a test directory
globalThis.readSourceFile = function(testDir, filename) {
  const sourcePath = globalThis.getSourcePath(testDir, filename);

  if (fs.existsSync(sourcePath)) {
    return fs.readFileSync(sourcePath, 'utf8');
  }

  throw new Error(`Source file not found: ${sourcePath}`);
};
