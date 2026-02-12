#!/usr/bin/env node
/**
 * BMAD Token Validator CLI
 * =========================
 * Entry point for the token validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/permissions/token-validator.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load token-validator:', err);
    process.exit(2); // Block on error
  });
