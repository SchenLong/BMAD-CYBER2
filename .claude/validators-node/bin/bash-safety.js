#!/usr/bin/env node
/**
 * BMAD Bash Safety Validator CLI
 * ================================
 * Entry point for the bash safety validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/guards/bash-safety.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load bash-safety validator:', err);
    process.exit(2); // Block on error
  });
