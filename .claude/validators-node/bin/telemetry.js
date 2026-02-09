#!/usr/bin/env node
/**
 * BMAD Telemetry CLI
 * ===================
 * Entry point for the telemetry collector.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/observability/telemetry.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load telemetry validator:', err);
    process.exit(0); // Don't block on error (telemetry only)
  });
