#!/usr/bin/env node
/**
 * BMAD PII Guard Validator CLI
 * ==============================
 * Entry point for the PII (Personally Identifiable Information) guard validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/guards/pii/index.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load pii validator:', err);
    process.exit(2); // Block on error
  });
