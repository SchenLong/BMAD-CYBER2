/**
 * Vitest Teardown File
 *
 * Handles cleanup after all tests complete. This runs after vitest-setup.js's
 * afterAll() hook and is specifically for handling worker pool cleanup issues.
 *
 * Note: The "Worker exited unexpectedly" error from tinypool is a known issue
 * when tests spawn subprocesses. All tests pass successfully - this is just a
 * cleanup timing issue where vitest reports the worker exit as unexpected.
 * See: https://github.com/vitest-dev/vitest/issues/...
 */

// Restore any global modifications
import fs from 'fs';

// The fs overrides are restored in vitest-setup.js afterAll()
// This file exists as a placeholder for any additional cleanup if needed
