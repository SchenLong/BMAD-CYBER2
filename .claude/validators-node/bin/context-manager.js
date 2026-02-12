#!/usr/bin/env node
/**
 * BMAD Context Manager Validator CLI
 * ====================================
 * Entry point for the context manager validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/resource-management/context-manager.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load context-manager validator:', err);
    process.exit(2); // Block on error
  });
