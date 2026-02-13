#!/usr/bin/env node
/**
 * BMAD Settings Guard Validator CLI (TPI-PRE-4)
 * ==============================================
 * Entry point for the settings.json write protection guard.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/guards/settings-guard.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load settings-guard validator:', err);
    process.exit(2); // Block on error — fail-closed
  });
