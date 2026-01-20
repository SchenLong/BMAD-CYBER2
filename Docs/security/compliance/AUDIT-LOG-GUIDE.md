# Audit Log Guide

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Audience:** Security Officers, SOC Analysts, System Administrators

---

## Overview

BMAD-CYBER2 implements tamper-evident audit logging with SHA-256 hash chains. This guide covers log interpretation, monitoring setup, and alerting configuration.

**Key Features:**
- **JSON Format** - Structured logs for easy parsing
- **Hash Chain** - Tamper-evident integrity verification
- **90-Day Retention** - Configurable retention policy
- **Mandatory Events** - Critical security events cannot be disabled

---

## Log Architecture

### Log Locations

| Log File | Purpose | Format |
|----------|---------|--------|
| `_bmad-output/.audit/audit.log` | Primary audit trail | JSON (hash-chained) |
| `.claude/logs/security.log` | Security events | Text |
| `.claude/logs/validation.log` | Validator output | Text |

### Log Entry Structure

```json
{
  "timestamp": "2026-01-15T12:00:00.000Z",
  "event_type": "workflow.start",
  "severity": "INFO",
  "user": "Alice",
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

### Hash Chain Mechanism

```
Entry 1: prev_hash = "GENESIS"
         hash = SHA256(timestamp + event_type + user + workflow + details)

Entry 2: prev_hash = Entry 1's hash
         hash = SHA256(timestamp + event_type + user + workflow + details)

Entry N: prev_hash = Entry N-1's hash
         hash = SHA256(...)
```

**Tampering Detection:** Any modification breaks the chain at that point.

---

## Event Types

### Workflow Events

| Event | Severity | Description |
|-------|----------|-------------|
| `workflow.start` | INFO | Workflow execution begins |
| `workflow.complete` | INFO | Workflow completes successfully |
| `workflow.error` | ERROR | Workflow encounters error |

### YOLO Mode Events (Mandatory - Cannot Disable)

| Event | Severity | Description |
|-------|----------|-------------|
| `workflow.yolo_invoked` | WARN | YOLO mode activated |
| `workflow.yolo_blocked` | WARN | YOLO mode blocked by policy |

### Agent Events

| Event | Severity | Description |
|-------|----------|-------------|
| `agent.activation` | INFO | Agent activated |
| `agent.tool_use` | DEBUG | Agent uses a tool |

### File Events

| Event | Severity | Description |
|-------|----------|-------------|
| `file.read` | DEBUG | File read (disabled by default) |
| `file.write` | INFO | File created or modified |
| `file.delete` | WARN | File deleted |

### Security Events (Mandatory - Cannot Disable)

| Event | Severity | Description |
|-------|----------|-------------|
| `security.warning` | WARN | Security warning raised |
| `security.violation` | CRITICAL | Security violation detected |
| `auth.failure` | WARN | Authentication failure |
| `auth.success` | INFO | Successful authentication |
| `access.denied` | WARN | Access denied by RBAC |

---

## Log Configuration

### Configuration File

```
_bmad/core/config.yaml
```

### Configuration Section

```yaml
security:
  audit:
    enabled: true
    log_file: "{project-root}/_bmad-output/.audit/audit.log"
    hash_chain_enabled: true

    events:
      # Workflow events
      workflow_start: true
      workflow_complete: true
      workflow_error: true

      # YOLO events (always true, cannot disable)
      yolo_invoked: true
      yolo_blocked: true

      # Agent events
      agent_activation: true
      agent_tool_use: true

      # File events
      file_read: false          # High volume, disabled by default
      file_write: true
      file_delete: true

      # Security events (always true, cannot disable)
      security_warning: true
      security_violation: true

    retention_days: 90
    format: json

    include:
      timestamp: true
      user: true
      workflow: true
      agent: true
      event_type: true
      details: true
      hash: true
```

### Enabling/Disabling Events

```yaml
# To enable high-volume file reads:
events:
  file_read: true

# Security events cannot be disabled - they are always logged
```

---

## Viewing Logs

### Basic Log Viewing

```bash
# View last 50 entries
tail -50 _bmad-output/.audit/audit.log

# View with pretty printing
tail -50 _bmad-output/.audit/audit.log | jq .

# Follow log in real-time
tail -f _bmad-output/.audit/audit.log | jq .
```

### Filtering by Event Type

```bash
# View only workflow events
grep '"event_type": "workflow' _bmad-output/.audit/audit.log | jq .

# View only security events
grep '"event_type": "security' _bmad-output/.audit/audit.log | jq .

# View only YOLO events
grep 'yolo' _bmad-output/.audit/audit.log | jq .

# View only errors
grep '"severity": "ERROR"' _bmad-output/.audit/audit.log | jq .
```

### Filtering by User

```bash
# View events for specific user
grep '"user": "Alice"' _bmad-output/.audit/audit.log | jq .

# Count events by user
jq -r '.user' _bmad-output/.audit/audit.log | sort | uniq -c | sort -rn
```

### Filtering by Time Range

```bash
# View today's events
grep "$(date +%Y-%m-%d)" _bmad-output/.audit/audit.log | jq .

# View events from specific hour
grep "2026-01-15T14:" _bmad-output/.audit/audit.log | jq .

# View events in time range (using jq)
jq 'select(.timestamp >= "2026-01-15T10:00:00" and .timestamp <= "2026-01-15T12:00:00")' \
  _bmad-output/.audit/audit.log
```

### Extracting Specific Fields

```bash
# Extract timestamp, event type, and user
jq '{time: .timestamp, event: .event_type, user: .user}' _bmad-output/.audit/audit.log

# Extract workflow execution summary
jq 'select(.event_type == "workflow.complete") | {workflow: .workflow, user: .user, time: .timestamp}' \
  _bmad-output/.audit/audit.log

# Count events by type
jq -r '.event_type' _bmad-output/.audit/audit.log | sort | uniq -c | sort -rn
```

---

## Log Analysis

### Security Event Summary

```bash
# Generate security event summary
echo "=== Security Event Summary ==="
echo ""
echo "Security Violations:"
grep '"event_type": "security.violation"' _bmad-output/.audit/audit.log | wc -l

echo ""
echo "Security Warnings:"
grep '"event_type": "security.warning"' _bmad-output/.audit/audit.log | wc -l

echo ""
echo "Authentication Failures:"
grep '"event_type": "auth.failure"' _bmad-output/.audit/audit.log | wc -l

echo ""
echo "Access Denied Events:"
grep '"event_type": "access.denied"' _bmad-output/.audit/audit.log | wc -l
```

### YOLO Mode Audit

```bash
# List all YOLO invocations
echo "=== YOLO Mode Invocations ==="
grep 'yolo_invoked' _bmad-output/.audit/audit.log | jq '{time: .timestamp, user: .user, workflow: .workflow}'

# Check for blocked YOLO attempts
echo ""
echo "=== Blocked YOLO Attempts ==="
grep 'yolo_blocked' _bmad-output/.audit/audit.log | jq '{time: .timestamp, user: .user, workflow: .workflow, reason: .details.reason}'
```

### User Activity Report

```bash
# Generate user activity report
for user in $(jq -r '.user' _bmad-output/.audit/audit.log | sort -u); do
  echo "=== $user ==="
  echo "Total Events: $(grep "\"user\": \"$user\"" _bmad-output/.audit/audit.log | wc -l)"
  echo "Workflows Run: $(grep "\"user\": \"$user\"" _bmad-output/.audit/audit.log | grep 'workflow.start' | wc -l)"
  echo "Security Events: $(grep "\"user\": \"$user\"" _bmad-output/.audit/audit.log | grep 'security' | wc -l)"
  echo ""
done
```

---

## Hash Chain Verification

### Manual Verification

```bash
# Verify hash chain integrity
python3 << 'EOF'
import json
import hashlib

def verify_chain(log_file):
    prev_hash = "GENESIS"
    line_num = 0

    with open(log_file) as f:
        for line in f:
            line_num += 1
            entry = json.loads(line)

            if entry.get('prev_hash') != prev_hash:
                print(f"Chain broken at line {line_num}")
                return False

            # Compute expected hash
            data = f"{entry['timestamp']}{entry['event_type']}{entry.get('user','')}{entry.get('workflow','')}{json.dumps(entry.get('details',{}))}"
            expected = 'sha256:' + hashlib.sha256(data.encode()).hexdigest()

            if entry.get('hash') != expected:
                print(f"Hash mismatch at line {line_num}")
                return False

            prev_hash = entry['hash']

    print(f"Chain verified: {line_num} entries OK")
    return True

verify_chain('_bmad-output/.audit/audit.log')
EOF
```

### Automated Verification Script

Save as `verify-audit-chain.sh`:

```bash
#!/bin/bash
# verify-audit-chain.sh - Verify audit log integrity

LOG_FILE="_bmad-output/.audit/audit.log"

if [ ! -f "$LOG_FILE" ]; then
    echo "ERROR: Audit log not found: $LOG_FILE"
    exit 1
fi

RESULT=$(python3 -c "
import json
import hashlib

prev_hash = 'GENESIS'
errors = []

with open('$LOG_FILE') as f:
    for i, line in enumerate(f, 1):
        try:
            entry = json.loads(line)
            if entry.get('prev_hash') != prev_hash:
                errors.append(f'Line {i}: Chain break (expected {prev_hash[:20]}...)')
            prev_hash = entry.get('hash', '')
        except json.JSONDecodeError:
            errors.append(f'Line {i}: Invalid JSON')

if errors:
    print('FAILED')
    for e in errors[:5]:
        print(e)
else:
    print('PASSED')
")

echo "Audit Chain Verification: $RESULT"
```

---

## Monitoring & Alerting

### Real-Time Monitoring

```bash
# Monitor security events in real-time
tail -f _bmad-output/.audit/audit.log | \
  grep --line-buffered 'security\|violation\|warning' | \
  jq .
```

### Alert on Critical Events

Save as `audit-monitor.sh`:

```bash
#!/bin/bash
# audit-monitor.sh - Monitor for critical security events

LOG_FILE="_bmad-output/.audit/audit.log"
ALERT_FILE="/tmp/bmad-alerts.log"

tail -f "$LOG_FILE" | while read line; do
    # Check for security violations
    if echo "$line" | grep -q '"event_type": "security.violation"'; then
        echo "$(date): CRITICAL - Security Violation Detected" >> "$ALERT_FILE"
        echo "$line" | jq . >> "$ALERT_FILE"

        # Send alert (customize for your alerting system)
        # curl -X POST https://your-alerting-system/webhook -d "$line"
    fi

    # Check for YOLO mode
    if echo "$line" | grep -q 'yolo_invoked'; then
        echo "$(date): WARNING - YOLO Mode Invoked" >> "$ALERT_FILE"
        echo "$line" | jq . >> "$ALERT_FILE"
    fi

    # Check for auth failures
    if echo "$line" | grep -q '"event_type": "auth.failure"'; then
        echo "$(date): WARNING - Authentication Failure" >> "$ALERT_FILE"
        echo "$line" | jq . >> "$ALERT_FILE"
    fi
done
```

### Systemd Service for Monitoring

Save as `/etc/systemd/system/bmad-audit-monitor.service`:

```ini
[Unit]
Description=BMAD Audit Log Monitor
After=network.target

[Service]
Type=simple
ExecStart=/path/to/audit-monitor.sh
Restart=always
User=bmad

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable bmad-audit-monitor
sudo systemctl start bmad-audit-monitor
```

---

## Log Retention

### Current Retention Policy

- **Default:** 90 days
- **Location:** `_bmad-output/.audit/`
- **Format:** Single file (audit.log)

### Log Rotation (Manual)

```bash
# Rotate logs manually
DATE=$(date +%Y%m%d)
mv _bmad-output/.audit/audit.log _bmad-output/.audit/audit-$DATE.log
gzip _bmad-output/.audit/audit-$DATE.log

# Remove logs older than 90 days
find _bmad-output/.audit/ -name "audit-*.log.gz" -mtime +90 -delete
```

### Automated Rotation with Logrotate

Save as `/etc/logrotate.d/bmad-audit`:

```
/path/to/project/_bmad-output/.audit/audit.log {
    daily
    rotate 90
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

---

## SIEM Integration

### Export to Splunk

```bash
# Forward to Splunk HEC
tail -f _bmad-output/.audit/audit.log | while read line; do
    curl -k https://splunk-server:8088/services/collector \
        -H "Authorization: Splunk YOUR-HEC-TOKEN" \
        -d "{\"event\": $line}"
done
```

### Export to ELK Stack

```bash
# Forward to Elasticsearch
tail -f _bmad-output/.audit/audit.log | while read line; do
    curl -X POST "http://elasticsearch:9200/bmad-audit/_doc" \
        -H "Content-Type: application/json" \
        -d "$line"
done
```

### Export to CloudWatch

```bash
# Forward to AWS CloudWatch Logs
aws logs put-log-events \
    --log-group-name "bmad-audit" \
    --log-stream-name "$(hostname)" \
    --log-events "$(jq -c '{timestamp: (.timestamp | sub("Z$"; "") | strptime("%Y-%m-%dT%H:%M:%S") | mktime * 1000), message: tostring}' _bmad-output/.audit/audit.log)"
```

---

## Troubleshooting

### Log File Not Found

```bash
# Create directory if missing
mkdir -p _bmad-output/.audit

# Verify permissions
chmod 750 _bmad-output/.audit
```

### Hash Chain Broken

If the hash chain is broken, the log may have been tampered with:

1. **Preserve the log file** for forensic analysis
2. **Note the line number** where the break occurred
3. **Review surrounding entries** for tampering evidence
4. **Report to security team** for investigation

### Log Too Large

```bash
# Check log size
du -h _bmad-output/.audit/audit.log

# Rotate immediately if needed
mv _bmad-output/.audit/audit.log _bmad-output/.audit/audit-$(date +%Y%m%d%H%M%S).log
gzip _bmad-output/.audit/audit-*.log
```

---

## Quick Reference

### Common Commands

| Command | Purpose |
|---------|---------|
| `tail -f _bmad-output/.audit/audit.log \| jq .` | Real-time log viewing |
| `grep 'security' audit.log \| jq .` | Security events |
| `grep 'yolo' audit.log \| jq .` | YOLO mode events |
| `jq -r '.event_type' audit.log \| sort \| uniq -c` | Event counts |
| `jq -r '.user' audit.log \| sort \| uniq -c` | User activity |

### Event Severity Levels

| Level | Description | Action |
|-------|-------------|--------|
| DEBUG | Detailed info | No action needed |
| INFO | Normal operation | Log for audit |
| WARN | Potential issue | Review promptly |
| ERROR | Operation failed | Investigate |
| CRITICAL | Security violation | Immediate action |

### Log Locations

| File | Content |
|------|---------|
| `_bmad-output/.audit/audit.log` | Hash-chained audit trail |
| `.claude/logs/security.log` | Security events |
| `.claude/logs/validation.log` | Validator output |

---

## Related Documentation

- [RBAC Operations Guide](RBAC-OPERATIONS-GUIDE.md) - Role and permission management
- [Token Management Guide](TOKEN-MANAGEMENT-GUIDE.md) - Authentication token procedures
- [Security Maintenance Checklist](SECURITY-MAINTENANCE-CHECKLIST.md) - Regular maintenance procedures
- [Incident Response Runbook](../Operations/INCIDENT-RESPONSE-RUNBOOK.md) - Security incident handling
