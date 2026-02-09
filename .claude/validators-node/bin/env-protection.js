#!/usr/bin/env node
/**
 * BMAD Environment Protection Validator CLI
 * ==========================================
 * Entry point for the environment protection validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/guards/env-protection.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load env-protection validator:', err);
    process.exit(2); // Block on error
  });
