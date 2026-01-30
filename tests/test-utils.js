/**
 * Test utilities for BMAD test suite
 * Provides helpers to resolve source paths from test directories
 */

import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Resolves the source file path from a test file path
 *
 * Maps test files in tests/utility/tools/* to source files in src/utility/tools/*
 *
 * @param {string} testDir - The test directory (__dirname from test file)
 * @param {string} filename - The source filename to resolve
 * @returns {string} The resolved source file path
 */
export function getSourcePath(testDir, filename) {
  // Extract the relative path from tests/utility/tools/
  const testsUtilityTools = path.join('tests', 'utility', 'tools');
  const srcUtilityTools = path.join('src', 'utility', 'tools');

  // Replace tests/utility/tools with src/utility/tools
  const sourcePath = testDir.replace(testsUtilityTools, srcUtilityTools);

  return path.join(sourcePath, filename);
}

/**
 * Gets the project root directory
 * @returns {string} The project root path
 */
export function getProjectRoot() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.dirname(__dirname); // Go up from tests/ to project root
}
