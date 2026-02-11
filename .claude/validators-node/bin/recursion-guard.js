#!/usr/bin/env node
/**
 * BMAD Recursion Guard Validator CLI
 * ====================================
 * Entry point for the recursion guard validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/resource-management/recursion-guard.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load recursion-guard validator:', err);
    process.exit(2); // Block on error
  });
