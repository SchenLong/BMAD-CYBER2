#!/usr/bin/env node
/**
 * BMAD Resource Limits Validator CLI
 * ====================================
 * Entry point for the resource limits validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/resource-management/resource-limits.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load resource-limits validator:', err);
    process.exit(2); // Block on error
  });
