#!/usr/bin/env node
/**
 * BMAD Rate Limiter Validator CLI
 * =================================
 * Entry point for the rate limiter validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/resource-management/rate-limiter.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load rate-limiter validator:', err);
    process.exit(2); // Block on error
  });
