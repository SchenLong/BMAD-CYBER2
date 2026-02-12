#!/usr/bin/env node
/**
 * BMAD Plugin Permissions Validator CLI
 * ======================================
 * Entry point for the plugin permissions validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/permissions/plugin-permissions.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load plugin-permissions validator:', err);
    process.exit(2); // Block on error
  });
