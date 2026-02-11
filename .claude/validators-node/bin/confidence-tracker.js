#!/usr/bin/env node
/**
 * BMAD Confidence Tracker CLI
 * ============================
 * Entry point for the confidence tracker validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/observability/confidence-tracker.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load confidence-tracker validator:', err);
    process.exit(0); // Don't block on error (informational only)
  });
