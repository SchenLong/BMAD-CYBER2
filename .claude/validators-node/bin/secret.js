#!/usr/bin/env node
/**
 * BMAD Secret Guard Validator CLI
 * =================================
 * Entry point for the secret guard validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/guards/secret.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load secret validator:', err);
    process.exit(2); // Block on error
  });
