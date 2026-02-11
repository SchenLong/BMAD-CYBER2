#!/usr/bin/env node
/**
 * BMAD Audit Integrity CLI
 * =========================
 * Entry point for the audit integrity validator.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/observability/audit-integrity.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load audit-integrity validator:', err);
    process.exit(0); // Don't block on error (observability only)
  });
