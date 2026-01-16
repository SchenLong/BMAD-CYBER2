# Security Telemetry Data

**Purpose:** Centralized collection point for security validator telemetry data for external analysis and validation.

**Location:** `docs/TestingLogs/security/AuditLogs/telemetry/`

---

## Data Format

All telemetry is stored as JSONL (JSON Lines) format - one JSON object per line for easy parsing and streaming.

## Telemetry Files

| File | Description | Rotation |
|------|-------------|----------|
| `security_events.jsonl` | All security validator events | Daily |
| `rate_limit_metrics.jsonl` | Rate limiter statistics | Hourly |
| `permission_audit.jsonl` | Plugin permission checks | Per-session |
| `resource_usage.jsonl` | Context/memory/recursion metrics | Hourly |
| `supply_chain_verification.jsonl` | Integrity verification results | Per-verification |
| `anomaly_signals.jsonl` | Detected anomalies (Phase 4.3) | Real-time |

---

## Data Collection Schema

See `TELEMETRY-SCHEMA.md` for complete field definitions.

---

## Export Commands

```bash
# Export last 24h of security events
cat telemetry/security_events.jsonl | jq 'select(.timestamp > (now - 86400))'

# Count events by validator
cat telemetry/security_events.jsonl | jq -s 'group_by(.validator) | map({validator: .[0].validator, count: length})'

# Export to CSV for external analysis
cat telemetry/security_events.jsonl | jq -r '[.timestamp, .validator, .action, .severity] | @csv'
```

---

## Integration

Telemetry is written by validators and can be consumed by:
- External SIEM systems
- Grafana/Prometheus
- Custom analysis scripts
- Compliance reporting tools

**Note:** This is raw telemetry data, not a dashboard. Analysis should be performed externally.
