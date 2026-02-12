#!/usr/bin/env node
/**
 * BMAD Supply Chain Verifier CLI
 * ===============================
 * Entry point for the supply chain verifier.
 *
 * This file is executed directly by Claude Code hooks.
 * It imports the compiled TypeScript module.
 */

import('../dist/src/permissions/supply-chain.js')
  .then((module) => {
    module.main();
  })
  .catch((err) => {
    console.error('Failed to load supply-chain verifier:', err);
    process.exit(2); // Block on error
  });
