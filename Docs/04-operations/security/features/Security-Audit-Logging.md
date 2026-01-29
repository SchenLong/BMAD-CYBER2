# Audit Logging System

**Feature ID:** SEC-002
**Implementation Date:** 2026-01-15
**Status:** IMPLEMENTED
**Category:** Security Control

---

## Overview

The Audit Logging System provides a tamper-evident audit trail for all significant events within the BMAD framework. It enables security visibility, forensic capability, and compliance tracking through comprehensive event logging with cryptographic hash chaining.

---

## Problem Statement

### Before Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│  NO AUDIT TRAIL                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Workflow executes → No record of what happened                 │
│  Agent activates → No record of which agent                     │
│  Files modified → No record of changes                          │
│  Security event → No record of incident                         │
│                                                                  │
│  Risk: No visibility into system activity                       │
│        No forensic capability for incidents                     │
│        No compliance evidence                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### After Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│  TAMPER-EVIDENT AUDIT LOGGING                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Workflow executes → Logged with user, time, workflow           │
│  Agent activates → Logged with agent name, context              │
│  Files modified → Logged with file path, operation              │
│  Security event → Logged with severity, details                 │
│                                                                  │
│  Features:                                                       │
│  • SHA-256 hash chain for tamper evidence                       │
│  • JSON format for machine parsing                              │
│  • Configurable event types                                     │
│  • 90-day retention                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration

### Location

`_bmad/core/config.yaml` - Security section

### Configuration Options

```yaml
security:
  audit:
    # Master switch - if false, no audit logs are written
    enabled: true

    # Log file location (relative to project root)
    log_file: "{project-root}/_bmad-output/.audit/audit.log"

    # Hash chain for tamper evidence
    hash_chain_enabled: true

    # Events to log
    events:
      # Workflow events
      workflow_start: true
      workflow_complete: true
      workflow_error: true

      # YOLO events (always logged regardless of this setting)
      yolo_invoked: true
      yolo_blocked: true

      # Agent events
      agent_activation: true
      agent_tool_use: true

      # File events
      file_read: false          # High volume, disable by default
      file_write: true
      file_delete: true

      # Security events (always logged)
      security_warning: true
      security_violation: true

    # Log retention
    retention_days: 90

    # Log format
    format: json              # json or text

    # Include in logs
    include:
      timestamp: true
      user: true
      workflow: true
      agent: true
      event_type: true
      details: true
      hash: true              # Previous log hash for chain verification
```

### Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enabled` | boolean | `true` | Master switch for audit logging |
| `log_file` | string | `{project-root}/_bmad-output/.audit/audit.log` | Path to audit log file |
| `hash_chain_enabled` | boolean | `true` | Enable SHA-256 hash chaining |
| `events.*` | boolean | varies | Toggle specific event types |
| `retention_days` | integer | `90` | Days to retain audit logs |
| `format` | string | `json` | Log format (json or text) |
| `include.*` | boolean | varies | Fields to include in log entries |

---

## Event Types

### Workflow Events

| Event | Description | Always Logged |
|-------|-------------|---------------|
| `workflow.start` | Workflow execution begins | No |
| `workflow.complete` | Workflow finishes successfully | No |
| `workflow.error` | Workflow encounters an error | No |

### YOLO Events (Always Logged)

| Event | Description | Always Logged |
|-------|-------------|---------------|
| `workflow.yolo_invoked` | YOLO mode activated | **Yes** |
| `workflow.yolo_blocked` | YOLO mode blocked | **Yes** |

### Agent Events

| Event | Description | Always Logged |
|-------|-------------|---------------|
| `agent.activation` | Agent is activated | No |
| `agent.tool_use` | Agent uses a tool | No |

### File Events

| Event | Description | Always Logged |
|-------|-------------|---------------|
| `file.read` | File is read (high volume) | No |
| `file.write` | File is created/modified | No |
| `file.delete` | File is deleted | No |

### Security Events (Always Logged)

| Event | Description | Always Logged |
|-------|-------------|---------------|
| `security.warning` | Security warning raised | **Yes** |
| `security.violation` | Security violation detected | **Yes** |

---

## Log Format

### JSON Structure

```json
{
  "timestamp": "2026-01-15T12:00:00.000Z",
  "event_type": "workflow.start",
  "severity": "INFO",
  "user": "J",
  "workflow": "create-story",
  "agent": "product-owner",
  "details": {
    "workflow_path": "_bmad/bmm/workflows/create-story/workflow.yaml",
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  "hash": "sha256:abc123def456...",
  "prev_hash": "sha256:789xyz012..."
}
```

### Log Entry Fields

| Field | Description |
|-------|-------------|
| `timestamp` | ISO-8601 timestamp of the event |
| `event_type` | Type of event (see Event Types) |
| `severity` | Log level: DEBUG, INFO, WARNING, ERROR, CRITICAL |
| `user` | User who triggered the event |
| `workflow` | Workflow being executed (if applicable) |
| `agent` | Agent involved (if applicable) |
| `details` | Event-specific additional information |
| `hash` | SHA-256 hash of this entry |
| `prev_hash` | SHA-256 hash of previous entry (for chain verification) |

---

## Hash Chain (Tamper Evidence)

### How It Works

1. Each log entry includes a SHA-256 hash of the previous entry
2. The first entry in a session uses `"GENESIS"` as `prev_hash`
3. The hash covers: `timestamp + event_type + user + workflow + details`
4. Any modification to historical entries breaks the chain

### Chain Verification

```bash
# Future feature: Verify hash chain integrity
bmad audit-verify

# Expected output:
# ✓ Verified 1,234 log entries
# ✓ Hash chain intact from 2026-01-01 to 2026-01-15
# ✓ No tampering detected
```

### Tamper Detection

If logs are modified:
```
✗ Hash chain broken at entry #567
✗ Expected prev_hash: sha256:abc123...
✗ Actual prev_hash: sha256:def456...
✗ TAMPERING DETECTED - Entries 567+ may be compromised
```

---

## Log Location

### Default Path

```
{project-root}/_bmad-output/.audit/audit.log
```

### Directory Structure

```
_bmad-output/
└── .audit/
    ├── audit.log           # Current audit log
    ├── audit.log.1         # Rotated log (future)
    └── audit.log.2         # Older rotated log (future)
```

---

## Viewing Audit Logs

### View Recent Logs

```bash
tail -50 _bmad-output/.audit/audit.log
```

### Search for Specific Events

```bash
# Find all YOLO events
grep "yolo" _bmad-output/.audit/audit.log

# Find all security warnings
grep "security.warning" _bmad-output/.audit/audit.log

# Find events by user
grep '"user": "J"' _bmad-output/.audit/audit.log
```

### Parse JSON Logs

```bash
# Pretty print last 10 entries
tail -10 _bmad-output/.audit/audit.log | jq .

# Extract specific fields
cat _bmad-output/.audit/audit.log | jq '{time: .timestamp, event: .event_type, user: .user}'
```

---

## Implementation Details

### Files Modified

| File | Changes |
|------|---------|
| `_bmad/core/config.yaml` | Added `security.audit` configuration section |
| `_bmad/core/tasks/workflow.xml` | Added `audit-logging` security directive |
| `_bmad-output/.audit/` | Created audit log directory |

### Security Directive Location

The audit logging is implemented as a security directive in `workflow.xml`:

```xml
<security-directive id="audit-logging" mandatory="true" order="2">
  <!-- Audit logging initialization and event handling -->
</security-directive>
```

### Initialization Flow

1. Load `security.audit` configuration
2. Ensure audit directory exists
3. Load previous log hash (if exists)
4. Initialize session with UUID
5. Log `workflow.start` event

### Completion Flow

1. Log `workflow.complete` event
2. Include duration and output files
3. Update hash chain

---

## User Experience Impact

| User Type | Impact |
|-----------|--------|
| All users | **Zero friction** - Logging is invisible |
| Administrators | Gain visibility into system activity |
| Security teams | Have forensic capability for incidents |

---

## Performance Considerations

- **File reads** are disabled by default (high volume)
- Logs are appended (no blocking reads)
- Hash computation is minimal overhead
- JSON format is compact and efficient

---

## Compliance Benefits

| Requirement | How Audit Logging Helps |
|-------------|-------------------------|
| SOC 2 | Provides audit trail for access and changes |
| GDPR | Records data processing activities |
| ISO 27001 | Enables security monitoring and incident response |
| HIPAA | Documents access to sensitive data |

---

## Future Enhancements

| Enhancement | Description | Status |
|-------------|-------------|--------|
| Log rotation | Automatic rotation based on size/age | Planned |
| Remote logging | Send logs to external SIEM | Planned |
| `audit-verify` command | CLI tool to verify hash chain | Planned |
| Real-time alerting | Alert on security events | Planned |
| Log encryption | Encrypt audit logs at rest | Planned |

---

## Example Log Entries

### Workflow Start

```json
{
  "timestamp": "2026-01-15T10:00:00.000Z",
  "event_type": "workflow.start",
  "severity": "INFO",
  "user": "J",
  "workflow": "create-story",
  "details": {
    "workflow_path": "_bmad/bmm/workflows/create-story/workflow.yaml",
    "session_id": "abc123"
  },
  "prev_hash": "GENESIS"
}
```

### YOLO Blocked

```json
{
  "timestamp": "2026-01-15T10:05:00.000Z",
  "event_type": "workflow.yolo_blocked",
  "severity": "WARNING",
  "user": "J",
  "workflow": "create-story",
  "details": {
    "reason": "YOLO mode is disabled in configuration",
    "config_value": "security.yolo_mode.enabled = false"
  },
  "prev_hash": "sha256:abc123..."
}
```

### Workflow Complete

```json
{
  "timestamp": "2026-01-15T10:30:00.000Z",
  "event_type": "workflow.complete",
  "severity": "INFO",
  "user": "J",
  "workflow": "create-story",
  "details": {
    "session_id": "abc123",
    "duration_seconds": 1800,
    "status": "success",
    "output_files": ["_bmad-output/stories/story-42.md"]
  },
  "prev_hash": "sha256:def456..."
}
```

---

## Related Documentation

- [Security Roadmap](/_bmad-output/BMAD-Security-Review/Security-Roadmap.md)
- [YOLO Mode Restrictions](Security-YOLO-Mode-Restrictions.md)
- [BMAD Security Audit Report](/_bmad-output/BMAD-Security-Review/BMAD-Security-Audit-Report.md)

---

*Feature implemented by: Bastion (Security Architect)*
*Documentation updated: 2026-01-15*
