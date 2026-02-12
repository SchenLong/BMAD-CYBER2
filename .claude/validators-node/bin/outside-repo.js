#!/usr/bin/env node
/**
 * BMAD Outside Repo Guard Validator CLI
 * ======================================
 * Entry point for the outside repository guard validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/guards/outside-repo.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load outside-repo validator:', err);
    process.exit(2); // Block on error
  });
