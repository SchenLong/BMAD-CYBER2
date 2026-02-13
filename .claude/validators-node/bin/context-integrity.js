#!/usr/bin/env node
/**
 * BMAD Context Integrity Scanner CLI (TPI-04)
 * PreToolUse hook on Read — scans context files for injection payloads.
 */

import('../dist/src/ai-safety/context-integrity.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    // Fail-closed: block on import error (P1-6)
    console.error('Failed to load context-integrity:', err);
    process.exit(2);
  });
