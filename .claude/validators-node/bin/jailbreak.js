#!/usr/bin/env node
/**
 * BMAD Jailbreak Guard CLI
 * =========================
 * Entry point for the jailbreak guard.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/ai-safety/jailbreak.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load jailbreak validator:', err);
    process.exit(2); // Block on error
  });
