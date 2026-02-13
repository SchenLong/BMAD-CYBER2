#!/usr/bin/env node
/**
 * BMAD Media Validator CLI (TPI-18, TPI-19, TPI-20, TPI-21)
 * PreToolUse hook on Read — scans media files for injection payloads.
 */

import('../dist/src/ai-safety/media-validator.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    // Fail-closed: block on import error (P1-6)
    console.error('Failed to load media-validator:', err);
    process.exit(2);
  });
