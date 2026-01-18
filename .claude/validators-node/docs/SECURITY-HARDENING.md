# BMAD Validators Security Hardening Guide

This document provides security configuration guidance for BMAD validators in production and development environments.

## Environment Variables

### Core Security Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `BMAD_VERIFY_MODE` | `warn` | Supply chain verification mode |
| `BMAD_TOKEN_REQUIRED` | `true` | Require valid session token |
| `BMAD_TELEMETRY_ENABLED` | `true` | Enable security telemetry |

### BMAD_VERIFY_MODE Settings

| Mode | Behavior | Use Case |
|------|----------|----------|
| `strict` | Block on verification failure | **PRODUCTION** |
| `warn` | Log warning but allow | Development |
| `disabled` | No verification | **NEVER USE IN PRODUCTION** |

```bash
# Production (RECOMMENDED)
export BMAD_VERIFY_MODE=strict

# Development only
export BMAD_VERIFY_MODE=warn
```

### BMAD_TOKEN_REQUIRED Settings

| Value | Behavior | Use Case |
|-------|----------|----------|
| `true` | Require valid token | **PRODUCTION** |
| `false` | Skip validation (audit entry created) | Development only |

## Production Configuration

```bash
# === SECURITY: STRICT MODE ===
export BMAD_VERIFY_MODE=strict
export BMAD_TOKEN_REQUIRED=true

# === RESOURCE LIMITS ===
export BMAD_MAX_MEMORY_MB=4096
export BMAD_MAX_CPU_PERCENT=80
export BMAD_MAX_CHILD_PROCS=10
export BMAD_PROC_TIMEOUT=300
export BMAD_MAX_FILE_SIZE_MB=50

# === TELEMETRY ===
export BMAD_TELEMETRY_ENABLED=true
export BMAD_TELEMETRY_ROTATE_MB=50
```

## State File Security

### Files to Exclude from Version Control

Add to `.gitignore`:

```gitignore
# BMAD Security State Files
.claude/logs/*.json
.claude/logs/.chain_state.json
.claude/logs/.anomaly_baseline.json
.claude/.*_state.json
.claude/.session_*
.claude/validators-node/state/
.claude/*.lock

# Token files
.bmad-token
.bmad-key
```

### File Permissions

```bash
chmod 600 .bmad-token
chmod 600 .bmad-key
chmod 600 .claude/.session_claims.json
```

## Rate Limiting

Default limits per minute:

| Operation | Limit |
|-----------|-------|
| global | 150 |
| bash | 60 |
| write | 100 |
| read | 400 |
| task | 40 |
| webfetch | 30 |

## Security Checklist

### Pre-Deployment

- [ ] `BMAD_VERIFY_MODE=strict`
- [ ] `BMAD_TOKEN_REQUIRED=true`
- [ ] Token file permissions are 600
- [ ] State files in `.gitignore`
- [ ] Telemetry enabled

### Ongoing

- [ ] Monitor telemetry for anomalies
- [ ] Review blocked operations
- [ ] Rotate tokens periodically

---

*Version 1.0.0 - 2026-01-17*
