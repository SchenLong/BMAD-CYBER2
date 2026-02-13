#!/usr/bin/env node
/**
 * BMAD Output Validator CLI (TPI-00)
 * ====================================
 * Entry point for the PostToolUse output validation hook.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/ai-safety/output-validator.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    // Fail-closed: block on import error (P1-6)
    console.error('Failed to load output-validator:', err);
    process.exit(2);
  });
