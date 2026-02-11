#!/usr/bin/env node
/**
 * BMAD Production Guard Validator CLI
 * =====================================
 * Entry point for the production guard validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/guards/production.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load production validator:', err);
    process.exit(2); // Block on error
  });
