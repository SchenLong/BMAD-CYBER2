# BMAD Security Telemetry Schema

**Version:** 2.0.0
**Date:** 2026-01-16
**Format:** JSONL (JSON Lines)
**Status:** Phase 4.2 Complete

---

## Overview

This document defines the telemetry data schema for BMAD security validators. All telemetry is written to the `telemetry/` directory in JSONL format for external consumption and analysis.

---

## 1. Security Events (`security_events.jsonl`)

Core security event telemetry from all validators.

### Schema

```json
{
  "timestamp": "2026-01-16T12:34:56.789Z",
  "session_id": "abc123",
  "validator": "rate_limiter",
  "action": "BLOCKED",
  "severity": "WARNING",
  "target": "/bin/rm -rf /",
  "reason": "Rate limit exceeded",
  "latency_ms": 2.3,
  "metadata": {}
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | string (ISO8601) | Yes | Event timestamp with timezone |
| `session_id` | string | Yes | Claude session identifier (`CLAUDE_SESSION_ID` env var) |
| `validator` | string | Yes | Validator name (see Validator Names below) |
| `action` | enum | Yes | `ALLOWED`, `BLOCKED`, `WARNING`, `OVERRIDE_USED`, `ERROR` |
| `severity` | enum | Yes | `INFO`, `WARNING`, `BLOCKED`, `CRITICAL` |
| `target` | string | Yes | Command, file path, or operation being validated (truncated to 500 chars) |
| `reason` | string | Yes | Human-readable explanation |
| `latency_ms` | float | No | Validation processing time in milliseconds |
| `metadata` | object | No | Validator-specific additional data |

### Validator Names

| Name | OWASP Category | Description |
|------|----------------|-------------|
| `rate_limiter` | LLM04 | Request rate limiting |
| `plugin_permissions` | LLM07 | Plugin capability enforcement |
| `supply_chain_verifier` | LLM05 | Integrity verification |
| `context_manager` | LLM04 | Context window management |
| `recursion_guard` | LLM04 | Recursion depth limiting |
| `resource_limits` | LLM04 | Memory/process limits |
| `confidence_tracker` | LLM09 | Response confidence analysis |
| `bash_safety` | LLM07 | Dangerous command blocking |
| `secret_guard` | LLM06 | Secret exposure prevention |
| `outside_repo_guard` | LLM07 | Repository boundary enforcement |
| `jailbreak_guard` | LLM01 | Prompt injection detection |

---

## 2. Rate Limit Metrics (`rate_limit_metrics.jsonl`)

Periodic snapshots of rate limiter state.

### Schema

```json
{
  "timestamp": "2026-01-16T12:34:56.789Z",
  "session_id": "abc123",
  "operation_type": "bash",
  "requests_count": 15,
  "limit": 30,
  "window_seconds": 60,
  "window_remaining_s": 45,
  "utilization_pct": 50.0,
  "backoff_active": false,
  "backoff_remaining_s": 0,
  "backoff_multiplier": 1
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | string (ISO8601) | Yes | Snapshot timestamp |
| `session_id` | string | Yes | Session identifier |
| `operation_type` | string | Yes | `global`, `bash`, `write`, `edit`, `read`, `task` |
| `requests_count` | int | Yes | Requests in current window |
| `limit` | int | Yes | Configured limit for operation type |
| `window_seconds` | int | Yes | Window duration in seconds |
| `window_remaining_s` | int | Yes | Seconds until window resets |
| `utilization_pct` | float | Yes | `(requests_count / limit) * 100` |
| `backoff_active` | bool | Yes | Whether exponential backoff is in effect |
| `backoff_remaining_s` | int | No | Seconds until backoff expires |
| `backoff_multiplier` | int | No | Current backoff multiplier (1, 2, 4, 8, ...) |

---

## 3. Permission Audit (`permission_audit.jsonl`)

Plugin permission check results.

### Schema

```json
{
  "timestamp": "2026-01-16T12:34:56.789Z",
  "session_id": "abc123",
  "plugin_name": "intel-team",
  "capability": "filesystem.write",
  "requested_resource": "_bmad/intel-team/output/report.md",
  "manifest_version": "1.0.0",
  "rbac_role": "operator",
  "decision": "GRANTED",
  "reason": "Path matches allowed pattern",
  "matched_pattern": "_bmad/intel-team/output/**"
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | string (ISO8601) | Yes | Check timestamp |
| `session_id` | string | Yes | Session identifier |
| `plugin_name` | string | Yes | Plugin being checked (e.g., `intel-team`, `bmm`) |
| `capability` | string | Yes | Capability being requested (see Capabilities below) |
| `requested_resource` | string | Yes | Path, command, or URL being accessed |
| `manifest_version` | string | No | Version from plugin manifest |
| `rbac_role` | string | No | User's RBAC role if applicable |
| `decision` | enum | Yes | `GRANTED`, `DENIED` |
| `reason` | string | Yes | Explanation for decision |
| `matched_pattern` | string | No | Glob pattern that matched (if granted) |

### Capabilities

| Capability | Description |
|------------|-------------|
| `filesystem.read` | Read file/directory |
| `filesystem.write` | Write/create file |
| `shell` | Execute shell command |
| `shell.dangerous` | Execute dangerous command |
| `network` | Network access |
| `sensitive_data` | Access sensitive data |

---

## 4. Resource Usage (`resource_usage.jsonl`)

Context window, memory, and recursion metrics.

### Schema

```json
{
  "timestamp": "2026-01-16T12:34:56.789Z",
  "session_id": "abc123",
  "context_tokens_used": 45000,
  "context_tokens_max": 200000,
  "context_pct": 22.5,
  "context_status": "ok",
  "memory_mb": 256.5,
  "memory_limit_mb": 1024,
  "memory_pct": 25.0,
  "recursion_depth": 3,
  "recursion_limit": 20,
  "symlink_follows": 1,
  "symlink_limit": 10,
  "child_processes": 2,
  "child_process_limit": 10
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | string (ISO8601) | Yes | Snapshot timestamp |
| `session_id` | string | Yes | Session identifier |
| `context_tokens_used` | int | Yes | Estimated tokens consumed |
| `context_tokens_max` | int | Yes | Maximum context window |
| `context_pct` | float | Yes | Context utilization percentage |
| `context_status` | enum | Yes | `ok`, `warning`, `critical`, `blocked` |
| `memory_mb` | float | No | Current memory usage in MB |
| `memory_limit_mb` | float | No | Configured memory limit |
| `memory_pct` | float | No | Memory utilization percentage |
| `recursion_depth` | int | No | Current call stack depth |
| `recursion_limit` | int | No | Configured recursion limit |
| `symlink_follows` | int | No | Symlinks traversed in current operation |
| `symlink_limit` | int | No | Maximum symlink follows |
| `child_processes` | int | No | Active child processes |
| `child_process_limit` | int | No | Maximum child processes |

### Context Status Values

| Status | Condition | Action |
|--------|-----------|--------|
| `ok` | < 75% capacity | Normal operation |
| `warning` | 75-90% capacity | User warned |
| `critical` | 90-95% capacity | User strongly warned |
| `blocked` | >= 95% capacity | Operations blocked |

---

## 5. Supply Chain Verification (`supply_chain_verification.jsonl`)

File and skill integrity verification results.

### Schema

```json
{
  "timestamp": "2026-01-16T12:34:56.789Z",
  "session_id": "abc123",
  "verification_type": "skill",
  "skill_name": "bmad:bmm:workflows:create-prd",
  "file_path": "_bmad/bmm/workflows/create-prd.md",
  "expected_hash": "abc123def456...",
  "actual_hash": "abc123def456...",
  "hash_match": true,
  "verification_result": "VALID",
  "verification_mode": "strict",
  "gpg_signature_checked": true,
  "gpg_signature_valid": true,
  "gpg_key_id": "ABC123",
  "cached": false,
  "latency_ms": 12.5
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | string (ISO8601) | Yes | Verification timestamp |
| `session_id` | string | Yes | Session identifier |
| `verification_type` | enum | Yes | `file`, `skill`, `plugin`, `manifest` |
| `skill_name` | string | No | Full skill identifier if applicable |
| `file_path` | string | Yes | Path to file being verified |
| `expected_hash` | string | No | SHA256 hash from manifest |
| `actual_hash` | string | No | Computed SHA256 hash |
| `hash_match` | bool | Yes | Whether hashes match |
| `verification_result` | enum | Yes | `VALID`, `MISMATCH`, `MISSING`, `UNTRACKED`, `ERROR` |
| `verification_mode` | enum | Yes | `strict`, `warn`, `disabled` |
| `gpg_signature_checked` | bool | No | Whether GPG signature was checked |
| `gpg_signature_valid` | bool | No | GPG signature validity |
| `gpg_key_id` | string | No | GPG key ID used for verification |
| `cached` | bool | No | Whether result was from cache |
| `latency_ms` | float | No | Verification time in milliseconds |

### Verification Results

| Result | Description |
|--------|-------------|
| `VALID` | File hash matches manifest |
| `MISMATCH` | File hash differs from manifest |
| `MISSING` | File not found |
| `UNTRACKED` | File not in manifest (behavior depends on mode) |
| `ERROR` | Verification failed due to error |

---

## 6. Confidence Analysis (`confidence_analysis.jsonl`)

Response confidence tracking (optional, informational).

### Schema

```json
{
  "timestamp": "2026-01-16T12:34:56.789Z",
  "session_id": "abc123",
  "response_length": 1500,
  "uncertainty_markers": {
    "high": 0,
    "medium": 2,
    "low": 1
  },
  "confidence_score": 0.72,
  "confidence_level": "MEDIUM",
  "hedging_phrases": ["might be", "possibly"],
  "code_warnings": {
    "todo": 1,
    "fixme": 0,
    "hack": 0,
    "not_implemented": 0
  },
  "attributions": {
    "documentation": 1,
    "source_code": 2,
    "error_reference": 0
  },
  "notes": ["Contains hedging language"]
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | string (ISO8601) | Yes | Analysis timestamp |
| `session_id` | string | Yes | Session identifier |
| `response_length` | int | Yes | Characters in analyzed response |
| `uncertainty_markers` | object | Yes | Count by severity (`high`, `medium`, `low`) |
| `confidence_score` | float | Yes | Score from 0.0 to 1.0 |
| `confidence_level` | enum | Yes | `HIGH`, `MEDIUM`, `LOW`, `VERY_LOW` |
| `hedging_phrases` | array | No | Detected hedging phrases |
| `code_warnings` | object | No | Count of code warning comments |
| `attributions` | object | No | Source attribution counts |
| `notes` | array | No | Human-readable notes about confidence |

### Confidence Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| `HIGH` | >= 0.8 | High confidence, no significant uncertainty |
| `MEDIUM` | 0.6 - 0.8 | Moderate confidence, some hedging |
| `LOW` | 0.4 - 0.6 | Low confidence, multiple uncertainties |
| `VERY_LOW` | < 0.4 | Very low confidence, significant uncertainty |

---

## 7. Anomaly Signals (`anomaly_signals.jsonl`)

Anomaly detection signals from the statistical anomaly detector.

### Schema

```json
{
  "timestamp": "2026-01-16T12:34:56.789Z",
  "session_id": "abc123",
  "anomaly_type": "volume_spike",
  "metric_name": "operation_count.bash",
  "baseline_value": 10.0,
  "observed_value": 89.0,
  "deviation_std": 4.8,
  "anomaly_score": 0.95,
  "alert_triggered": true,
  "alert_severity": "CRITICAL",
  "context": {
    "description": "Operation bash count 89 is 4.8 std devs from mean 10.0"
  }
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | string (ISO8601) | Yes | Detection timestamp |
| `session_id` | string | Yes | Session identifier |
| `anomaly_type` | enum | Yes | `volume_spike`, `volume_drop`, `unusual_operation`, `blocked_ratio`, `time_anomaly` |
| `metric_name` | string | Yes | Metric being analyzed (e.g., `operation_count.bash`, `hourly_volume.hour_14`) |
| `baseline_value` | float | Yes | Expected baseline value (rolling mean) |
| `observed_value` | float | Yes | Actual observed value |
| `deviation_std` | float | Yes | Standard deviations from baseline |
| `anomaly_score` | float | Yes | Score from 0.0 to 1.0 (sigmoid function) |
| `alert_triggered` | bool | Yes | Whether score exceeded threshold (>0.5) |
| `alert_severity` | enum | Yes | `INFO`, `WARNING`, `CRITICAL` |
| `context` | object | No | Additional context (description, etc.) |

### Anomaly Types

| Type | Description | Trigger |
|------|-------------|---------|
| `volume_spike` | Unusually high operation count | >3 std dev above mean |
| `volume_drop` | Unusually low operation count | >3 std dev below mean |
| `unusual_operation` | New or rarely seen operation type | <3 samples in baseline |
| `blocked_ratio` | Abnormally high block rate | >3 std dev above mean |
| `time_anomaly` | Activity at unusual hours | >3 std dev for hour of day |

### Severity Calculation

| Anomaly Score | Severity |
|---------------|----------|
| < 0.6 | INFO |
| 0.6 - 0.8 | WARNING |
| > 0.8 | CRITICAL |

---

## Telemetry Collection Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BMAD_TELEMETRY_ENABLED` | `true` | Enable/disable telemetry collection |
| `BMAD_TELEMETRY_DIR` | `docs/TestingLogs/security/AuditLogs/telemetry` | Telemetry output directory |
| `BMAD_TELEMETRY_ROTATE_MB` | `50` | Rotate files at this size (MB) |
| `BMAD_TELEMETRY_RETENTION_DAYS` | `30` | Days to retain telemetry files |

### File Rotation

Files are rotated when they exceed `BMAD_TELEMETRY_ROTATE_MB`. Rotated files are named with timestamp suffix:
- `security_events.jsonl` -> `security_events.2026-01-16T12-00-00.jsonl`

---

## Data Processing Examples

### Count Events by Validator (Last 24h)

```bash
cat telemetry/security_events.jsonl | \
  jq -s '[.[] | select(.timestamp > (now - 86400 | todate))] |
         group_by(.validator) |
         map({validator: .[0].validator, count: length,
              blocked: [.[] | select(.action == "BLOCKED")] | length})'
```

### Calculate Block Rate

```bash
cat telemetry/security_events.jsonl | \
  jq -s '{total: length,
          blocked: [.[] | select(.action == "BLOCKED")] | length,
          block_rate: ([.[] | select(.action == "BLOCKED")] | length) / length * 100}'
```

### Export Rate Limit Utilization to CSV

```bash
cat telemetry/rate_limit_metrics.jsonl | \
  jq -r '[.timestamp, .operation_type, .utilization_pct, .backoff_active] | @csv'
```

### Find High-Risk Permission Denials

```bash
cat telemetry/permission_audit.jsonl | \
  jq 'select(.decision == "DENIED" and .capability | contains("dangerous"))'
```

### Average Verification Latency

```bash
cat telemetry/supply_chain_verification.jsonl | \
  jq -s 'map(.latency_ms) | add / length'
```

---

## Integration Examples

### Prometheus/Grafana

```yaml
# prometheus.yml scrape config
- job_name: 'bmad_telemetry'
  static_configs:
    - targets: ['localhost:9090']
  metrics_path: /metrics
  # Use json_exporter to convert JSONL
```

### Splunk

```bash
# Forward telemetry to Splunk
tail -F telemetry/security_events.jsonl | \
  /opt/splunk/bin/splunk add oneshot -sourcetype bmad_security
```

### Elasticsearch

```bash
# Bulk index telemetry
cat telemetry/security_events.jsonl | \
  jq -c '{index: {_index: "bmad-security"}}, .' | \
  curl -X POST "localhost:9200/_bulk" -H "Content-Type: application/x-ndjson" --data-binary @-
```

---

**Schema Version:** 2.0.0
**Last Updated:** 2026-01-16
**Anomaly Detection Added:** 2026-01-16
