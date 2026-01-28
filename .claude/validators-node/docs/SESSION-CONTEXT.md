# Session Context & Subagent Permission Inheritance

## Overview

The Session Context system solves a critical problem with Claude Code's subagent architecture: **permissions granted to the parent agent don't automatically apply to subagents**.

### The Problem

When you run parallel agents or spawn subagents via the `Task` tool:

1. **Environment variables are process-local** - `BMAD_ALLOW_DANGEROUS=true` set in the parent doesn't propagate to child processes
2. **Single-use overrides get consumed** - The first agent to check an override consumes it, leaving other agents blocked
3. **Race conditions on shared state** - Parallel agents racing on `.override_state.json` cause unpredictable behavior

### The Solution

The Session Context system provides:

- **Session-scoped permissions** - Permissions granted once apply to all agents in the session
- **Automatic inheritance** - Subagents automatically inherit parent session permissions
- **No consumption** - Session permissions persist for the session duration (not single-use)
- **Configurable rate limits** - Multiplier for parallel execution workloads

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                     Session Context                          │
│  .claude/.session_context.json                               │
├─────────────────────────────────────────────────────────────┤
│  session_id: "bmad-abc123-xyz789"                           │
│  created_at: timestamp                                       │
│  expires_at: timestamp (1 hour default)                      │
│  permissions: {                                              │
│    "DANGEROUS": {                                            │
│      granted: true,                                          │
│      expiresAt: timestamp (5 min default),                   │
│      grantedBy: "parent-agent",                             │
│      consumable: false  (session-wide)                       │
│    }                                                         │
│  }                                                           │
│  subagent_ids: ["agent1", "agent2", ...]                    │
└─────────────────────────────────────────────────────────────┘
```

### Flow

1. **SessionStart** hook initializes session context
2. **Parent agent** sets `BMAD_ALLOW_DANGEROUS=true`
3. **Override Manager** detects env var and grants permission to session context
4. **Subagent** spawned via Task tool
5. **Subagent validator** checks session context, finds inherited permission
6. **Operation allowed** without needing to re-set env var

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BMAD_SESSION_PERMISSIONS` | `true` | Enable session-scoped permissions |
| `BMAD_SESSION_ID` | auto-generated | Session identifier (set automatically) |
| `BMAD_RATE_LIMIT_MULTIPLIER` | `10` | Multiplier for rate limits (default 10x for parallel workloads) |

### Disabling Session Permissions

If you prefer the old single-use override behavior:

```bash
export BMAD_SESSION_PERMISSIONS=false
```

### Adjusting Rate Limits

The default rate limit multiplier is 10x to support parallel workloads. You can adjust it:

```bash
export BMAD_RATE_LIMIT_MULTIPLIER=20  # Increase to 20x for very heavy parallel workloads
export BMAD_RATE_LIMIT_MULTIPLIER=1   # Reduce to 1x for conservative limits
```

## Permission Types

Permissions are stored with these attributes:

| Attribute | Description |
|-----------|-------------|
| `granted` | Whether permission is active |
| `grantedAt` | Unix timestamp when granted |
| `expiresAt` | Unix timestamp when it expires |
| `grantedBy` | Process/agent that granted it |
| `consumable` | If `false`, session-wide (default). If `true`, single-use. |
| `consumed` | Has it been consumed (only for consumable) |

### Session-Wide vs Single-Use

- **Session-wide (default)**: Permission lasts for 5 minutes, any agent in session can use it
- **Single-use**: Permission consumed after first use (legacy behavior)

## API Reference

### SessionContext Class

```typescript
import { SessionContext } from '.claude/validators-node/src/common/session-context.js';

// Initialize session (called by SessionStart hook)
const sessionId = SessionContext.initSession();

// Grant permission to current session
SessionContext.grantPermission('DANGEROUS', {
  consumable: false,      // Session-wide (default)
  timeoutSeconds: 300,    // 5 minutes
  reason: 'User authorized dangerous operations',
});

// Check permission (returns inherited permissions too)
const result = SessionContext.checkPermission('DANGEROUS', {
  consume: false,         // Don't consume even if consumable
  validatorName: 'bash-safety',
});
// result.allowed: boolean
// result.inherited: boolean (true if from session context)
// result.reason: string

// Get current session status
const status = SessionContext.getStatus();

// End session (clears all permissions)
SessionContext.endSession();
```

### Convenience Functions

```typescript
import {
  checkSessionPermission,
  consumeSessionPermission,
  initSession,
  getSessionId,
} from '.claude/validators-node/src/common/index.js';

// Check permission (session-scoped)
const result = checkSessionPermission('DANGEROUS', 'my-validator');

// Check and consume (single-use)
const result = consumeSessionPermission('SECRETS', 'secret-validator');

// Get session ID
const sessionId = getSessionId();
```

## Migration Guide

### For Validator Authors

Before (checking env var directly):

```typescript
const envVar = `BMAD_ALLOW_${type}`;
if (process.env[envVar] === 'true') {
  // Allow operation
}
```

After (using session context):

```typescript
import { checkSessionPermission } from '../common/session-context.js';

const result = checkSessionPermission(type, 'my-validator');
if (result.allowed) {
  // Allow operation - works for parent AND subagents
}
```

### For Users

No changes needed! The system is backward compatible:

- Setting `BMAD_ALLOW_*=true` still works
- Permissions are now automatically shared with subagents
- Old single-use behavior available via `BMAD_SESSION_PERMISSIONS=false`

## Troubleshooting

### Subagent still blocked

1. Check if session context exists: `cat .claude/.session_context.json`
2. Verify session hasn't expired
3. Verify permission hasn't expired (5 min default)
4. Check `BMAD_SESSION_PERMISSIONS` isn't set to `false`

### Rate limit hit with parallel agents

```bash
# Increase rate limit multiplier (default is 10x)
export BMAD_RATE_LIMIT_MULTIPLIER=20

# Check current rate limit status
cat .claude/.rate_limit_state.json
```

### Permission expired too quickly

Grant with longer timeout:

```typescript
SessionContext.grantPermission('DANGEROUS', {
  timeoutSeconds: 900,  // 15 minutes
});
```

Or set env var again to refresh it.

## Security Considerations

1. **Session timeout**: Sessions expire after 1 hour of inactivity
2. **Permission timeout**: Individual permissions expire after 5 minutes
3. **Audit logging**: All permission grants/checks logged to `.claude/logs/security.log`
4. **Lock files**: Atomic operations prevent race conditions
5. **No persistence**: Session context deleted on session end

## Files

| Path | Purpose |
|------|---------|
| `.claude/.session_context.json` | Session state (auto-managed) |
| `.claude/.session_context.lock` | Lock file for atomic operations |
| `.claude/validators-node/src/common/session-context.ts` | Session context module |
| `.claude/validators-node/bin/session-init.js` | SessionStart hook |
