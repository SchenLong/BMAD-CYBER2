#!/usr/bin/env node
/**
 * BMAD Session Initialization Hook
 * =================================
 * Called at SessionStart to initialize the session context.
 *
 * This hook:
 * 1. Creates or retrieves the current session ID
 * 2. Sets up the session context for permission inheritance
 * 3. Propagates BMAD_SESSION_ID environment variable
 *
 * Usage in settings.json:
 * {
 *   "hooks": {
 *     "SessionStart": [{
 *       "hooks": [{
 *         "type": "command",
 *         "command": "node \"$CLAUDE_PROJECT_DIR\"/.claude/validators-node/bin/session-init.js"
 *       }]
 *     }]
 *   }
 * }
 */

import { SessionContext } from '../dist/src/common/session-context.js';
import { AuditLogger } from '../dist/src/common/audit-logger.js';

async function main() {
  try {
    // Initialize or retrieve session
    const sessionId = SessionContext.initSession();

    // Log session initialization
    AuditLogger.logSync('session_init', 'SESSION_STARTED', {
      sessionId,
      pid: process.pid,
      user: process.env['USER'] || 'unknown',
      projectDir: process.env['CLAUDE_PROJECT_DIR'] || process.cwd(),
    }, 'INFO');

    // Output session ID (can be captured by parent process if needed)
    console.log(`BMAD Session initialized: ${sessionId}`);

    // Exit with success
    process.exit(0);
  } catch (error) {
    console.error(`Session initialization error: ${error}`);
    // Don't block on error - session permissions are optional enhancement
    process.exit(0);
  }
}

main();
