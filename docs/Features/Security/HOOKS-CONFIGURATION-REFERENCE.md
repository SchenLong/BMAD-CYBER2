# Claude Code Hooks Configuration Reference

**Last Updated:** 2026-01-16
**Configuration File:** `.claude/settings.json`

---

## Overview

This document provides a complete reference for the security hooks configured in the BMAD framework. All hooks are configured in `.claude/settings.json` and execute automatically before their associated tool operations.

## Hook Types

| Hook Point | When It Runs | Use Case |
|------------|--------------|----------|
| `SessionStart` | At session initialization | Authentication, security setup |
| `UserPromptSubmit` | Before processing user input | Input validation, jailbreak detection |
| `PreToolUse` | Before any tool executes | Permission checks, safety validation |

---

## Current Configuration

### SessionStart Hooks

These run once when a Claude Code session starts.

| Validator | Purpose |
|-----------|---------|
| `token_validator.py` | Validates authentication token |
| `session-security-init.py` | Initializes security state |
| `session-start-tts.sh` | Text-to-speech notification (optional) |

### UserPromptSubmit Hooks

These run on every user message before Claude processes it.

| Validator | Purpose | Blocks If |
|-----------|---------|-----------|
| `prompt_injection_guard.py` | Detects embedded instructions | Injection patterns found |
| `jailbreak_guard.py` | Detects jailbreak attempts | Jailbreak patterns matched |

### PreToolUse Hooks by Tool

#### Skill Tool

| Validator | Purpose | Blocks If |
|-----------|---------|-----------|
| `authorization.js` | RBAC permission check | User lacks role for skill |
| `supply_chain_verifier.py` | SHA256/GPG integrity check | Skill file tampered |
| `rate_limiter.py` | DoS protection | Rate limit exceeded |

#### Task Tool (Agent Spawning)

| Validator | Purpose | Blocks If |
|-----------|---------|-----------|
| `rate_limiter.py` | DoS protection | Rate limit exceeded |
| `recursion_guard.py` | Prevents infinite loops | Depth/recursion limit hit |

#### Bash Tool

| Validator | Purpose | Blocks If |
|-----------|---------|-----------|
| `bash_safety.py` | Dangerous command detection | rm -rf, sudo, etc. |
| `production_guard.py` | Production targeting | Prod environment detected |
| `outside_repo_guard.py` | Repository boundary | Path outside repo |
| `plugin_permissions.py` | Capability check | Plugin lacks shell permission |
| `rate_limiter.py` | DoS protection | Rate limit exceeded |
| `resource_limits.py` | Memory/CPU limits | Resources exceeded |

#### Write Tool

| Validator | Purpose | Blocks If |
|-----------|---------|-----------|
| `secret_guard.py` | Credential detection | API keys, tokens found |
| `env_protection.py` | Sensitive file protection | Writing to .env files |
| `outside_repo_guard.py` | Repository boundary | Path outside repo |
| `pii_guard.py` | PII detection | SSN, credit cards found |
| `prompt_injection_guard.py` | Content validation | Injection in content |
| `plugin_permissions.py` | Capability check | Plugin lacks write permission |
| `rate_limiter.py` | DoS protection | Rate limit exceeded |

#### Edit Tool

| Validator | Purpose | Blocks If |
|-----------|---------|-----------|
| `secret_guard.py` | Credential detection | API keys, tokens found |
| `env_protection.py` | Sensitive file protection | Editing .env files |
| `outside_repo_guard.py` | Repository boundary | Path outside repo |
| `pii_guard.py` | PII detection | SSN, credit cards found |
| `prompt_injection_guard.py` | Content validation | Injection in content |
| `plugin_permissions.py` | Capability check | Plugin lacks write permission |
| `rate_limiter.py` | DoS protection | Rate limit exceeded |

#### Read Tool

| Validator | Purpose | Blocks If |
|-----------|---------|-----------|
| `outside_repo_guard.py` | Repository boundary | Path outside repo |
| `prompt_injection_guard.py` | Content scanning | Malicious content detected |
| `plugin_permissions.py` | Capability check | Plugin lacks read permission |
| `rate_limiter.py` | DoS protection | Rate limit exceeded |
| `recursion_guard.py` | Depth limits | Too many recursive reads |

#### Glob Tool

| Validator | Purpose | Blocks If |
|-----------|---------|-----------|
| `outside_repo_guard.py` | Repository boundary | Pattern outside repo |
| `rate_limiter.py` | DoS protection | Rate limit exceeded |
| `recursion_guard.py` | Depth limits | Deep directory traversal |

#### Grep Tool

| Validator | Purpose | Blocks If |
|-----------|---------|-----------|
| `outside_repo_guard.py` | Repository boundary | Search path outside repo |
| `rate_limiter.py` | DoS protection | Rate limit exceeded |

#### WebFetch Tool

| Validator | Purpose | Blocks If |
|-----------|---------|-----------|
| `plugin_permissions.py` | Capability check | Plugin lacks network permission |
| `rate_limiter.py` | DoS protection | Rate limit exceeded |

#### WebSearch Tool

| Validator | Purpose | Blocks If |
|-----------|---------|-----------|
| `plugin_permissions.py` | Capability check | Plugin lacks network permission |
| `rate_limiter.py` | DoS protection | Rate limit exceeded |

---

## Validator Details

### Rate Limits (rate_limiter.py)

| Operation | Limit/Minute |
|-----------|--------------|
| Global (all ops) | 150 |
| Bash | 60 |
| Write | 100 |
| Edit | 100 |
| Read | 400 |
| Task | 40 |
| Glob | 200 |
| Grep | 200 |
| Skill | 30 |
| WebFetch | 30 |
| WebSearch | 20 |

### Resource Limits (resource_limits.py)

| Resource | Limit | Configurable |
|----------|-------|--------------|
| Memory | 4096 MB (4GB) | `BMAD_MAX_MEMORY_MB` |
| CPU | 80% | `BMAD_MAX_CPU_PERCENT` |
| Child processes | 10 | `BMAD_MAX_CHILD_PROCS` |
| File size | 50 MB | `BMAD_MAX_FILE_SIZE_MB` |
| Open files | 100 | `BMAD_MAX_OPEN_FILES` |
| Timeout | 300 seconds | `BMAD_PROCESS_TIMEOUT` |

### Recursion Limits (recursion_guard.py)

| Limit Type | Max Depth |
|------------|-----------|
| Directory traversal | 10 levels |
| Nested calls | 20 levels |
| Symlink follows | 5 levels |

---

## Exit Codes

All validators use these exit codes:

| Code | Meaning | Result |
|------|---------|--------|
| 0 | Allow | Operation proceeds |
| 1 | Error | Operation proceeds (fail-open) |
| 2 | Block | Operation blocked |

---

## Override Mechanisms

### Environment Variable Overrides

| Variable | Effect |
|----------|--------|
| `BMAD_ALLOW_SECRETS=true` | Single-use secret bypass (5 min expiry) |
| `BMAD_ALLOW_PII=true` | Single-use PII bypass (5 min expiry) |
| `BMAD_VERIFY_MODE=disabled` | Disable supply chain verification |
| `BMAD_RATE_LIMIT_DISABLED=true` | Disable rate limiting (not recommended) |

### Per-Operation Whitelists

Some validators have built-in whitelists:

- **rate_limiter.py**: Critical config files exempt
- **outside_repo_guard.py**: System paths allowed for reads
- **pii_guard.py**: Test files exempt

---

## Adding New Hooks

To add a new validator hook:

1. Create validator in `.claude/validators/`
2. Add to appropriate matcher in `.claude/settings.json`
3. Follow exit code convention (0=allow, 2=block)
4. Log to security audit log via `security_common.py`

Example:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "python3 \"$CLAUDE_PROJECT_DIR\"/.claude/validators/my_validator.py"
    }
  ]
}
```

---

## Troubleshooting

### Hook Not Running

1. Check settings.json syntax (valid JSON)
2. Verify matcher name matches tool exactly
3. Check validator file exists and is executable

### False Positives

1. Check validator's whitelist/exemptions
2. Use single-use override if legitimate
3. Adjust patterns in validator (with caution)

### Performance Issues

1. Rate limiter may be too aggressive - check limits
2. Multiple validators on same tool add latency
3. Consider caching for expensive checks

---

## Related Documentation

- [HooksGuardrails.md](HooksGuardrails.md) - Detailed guardrail architecture
- [AgenticSecurity.md](AgenticSecurity.md) - AI security concepts
- [Rate-Limiting.md](Rate-Limiting.md) - Rate limiter details
- [Plugin-Permissions.md](Plugin-Permissions.md) - Permission system

---

*BMAD Framework Security Documentation - 2026-01-16*
