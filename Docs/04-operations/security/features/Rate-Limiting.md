# Rate Limiting Security Feature

**OWASP Reference:** LLM04 - Model Denial of Service
**Implementation:** `.claude/validators-node/bin/rate-limiter.js`
**Status:** Implemented (Phase 1 - 2026-01-16)

---

## Overview

The Rate Limiter prevents resource exhaustion attacks by implementing sliding window rate limiting with per-operation type limits, exponential backoff on violations, and whitelist bypass for critical operations.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Tool Invocation                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Rate Limiter                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Whitelist  │  │   Sliding   │  │   Exponential       │  │
│  │   Check     │──▶│   Window    │──▶│   Backoff          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
    ┌────────────┐        ┌────────────┐
    │  ALLOWED   │        │  BLOCKED   │
    └────────────┘        └────────────┘
```

## Configuration

### Rate Limits by Operation Type

| Operation | Limit | Window | Description |
|-----------|-------|--------|-------------|
| `global` | 150 | 60s | Total requests across all types |
| `bash` | 60 | 60s | Shell command execution |
| `write` | 100 | 60s | File write operations |
| `edit` | 100 | 60s | File edit operations |
| `read` | 400 | 60s | File read operations |
| `glob` | 200 | 60s | File pattern matching |
| `grep` | 200 | 60s | Content search |
| `task` | 40 | 60s | Agent task spawning |
| `webfetch` | 30 | 60s | Web content fetching |
| `websearch` | 20 | 60s | Web search queries |

### Exponential Backoff

When a rate limit is exceeded:

1. First violation: 1 second backoff
2. Second violation: 2 seconds
3. Third violation: 4 seconds
4. Continues doubling up to **60 seconds maximum**

### Whitelist Configuration

Operations matching these patterns bypass rate limiting:

```javascript
const WHITELIST_OPERATIONS = {
    'read': [
        '.claude/settings.json',
        '.claude/validators-node/',
        'CLAUDE.md',
    ],
    'bash': [
        'git status',
        'git log',
        'git diff',
    ],
};
```

## Usage

### As a Hook Validator

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          "node .claude/validators-node/bin/rate-limiter.js validate"
        ]
      }
    ]
  }
}
```

### Programmatic Usage

```javascript
const { checkRateLimit, recordOperation, getRateStatus } = require('./rate-limiter');

// Check if operation is allowed
const { allowed, message } = checkRateLimit('bash', 'npm install');
if (!allowed) {
    console.log(`Rate limited: ${message}`);
}

// Record an operation (after it's allowed)
recordOperation('bash', 'npm install');

// Get current status
const status = getRateStatus();
console.log(`Bash usage: ${status.bash.current}/${status.bash.limit}`);
```

### CLI Commands

```bash
# Check current status
node .claude/validators-node/bin/rate-limiter.js status

# Reset all limits
node .claude/validators-node/bin/rate-limiter.js reset

# Reset specific operation
node .claude/validators-node/bin/rate-limiter.js reset bash
```

## State Persistence

Rate limit state is persisted to `.claude/.rate_limit_state.json`:

```json
{
  "requests": {
    "bash": [
      {"timestamp": 1705363200.123, "target": "npm install"}
    ]
  },
  "violations": {
    "bash": 2
  },
  "backoff_until": {
    "bash": 1705363204.0
  },
  "last_cleanup": 1705363200.0
}
```

## Audit Logging

All rate limit events are logged to `.claude/logs/security.log`:

```json
{
  "timestamp": "2026-01-16T01:00:00.000000",
  "session_id": "abc123",
  "validator": "rate_limiter",
  "severity": "BLOCKED",
  "action": "RATE_LIMIT_EXCEEDED",
  "details": {
    "operation": "bash",
    "violations": 3,
    "backoff_seconds": 8
  }
}
```

## Error Messages

When rate limited, users see:

```
============================================================
BMAD GUARDRAIL: RATE LIMIT EXCEEDED
============================================================

Rate limit exceeded for bash (60/60 per minute). Retry in 15s.

Operation: bash
Current usage: 60/60 (100.0%)
Backoff active: 8s remaining

============================================================
```

## Performance

- Average check time: **< 1ms**
- Average record time: **< 2ms**
- State file size: Typically < 10KB
- Automatic cleanup of old entries every 10 seconds

## Testing

Run tests:

```bash
node tests/test_rate_limiter.js
```

Test coverage includes:
- Sliding window algorithm (4 tests)
- Per-operation limits (2 tests)
- Exponential backoff (3 tests)
- Whitelist bypass (2 tests)
- State persistence (3 tests)
- Performance benchmarks (2 tests)

## Security Considerations

1. **File Locking**: Uses `proper-lockfile` for atomic state updates to prevent race conditions
2. **Fail Open**: If lock acquisition fails, operations are allowed to maintain availability
3. **Truncation**: Long targets are truncated to prevent state file bloat
4. **Timeout**: Lock acquisition has a 5-second timeout

## Related Documents

- [OWASP AI Security Checklist](/_bmad/core/security/OWASP-AI-SECURITY-CHECKLIST.md)
- [OWASP Remediation Plan](/_bmad/core/security/OWASP-REMEDIATION-PLAN.md)
- [Hooks & Validators Guide](../../../06-reference/features/HOOKS-VALIDATORS-GUIDE.md)
