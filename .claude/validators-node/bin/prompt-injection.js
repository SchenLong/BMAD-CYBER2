#!/usr/bin/env node
/**
 * BMAD Prompt Injection Guard CLI
 * ================================
 * Entry point for the prompt injection guard.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/ai-safety/prompt-injection.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load prompt-injection validator:', err);
    process.exit(2); // Block on error
  });
