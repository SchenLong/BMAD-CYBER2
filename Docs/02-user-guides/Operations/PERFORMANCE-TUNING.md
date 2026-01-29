# BMAD-CYBER2 Performance Tuning Guide

> **Version:** 1.1
> **Last Updated:** 2026-01-18
> **Audience:** System Administrators, DevOps Engineers

---

## Overview

This guide provides performance optimization strategies for BMAD-CYBER2 deployments. It covers LLM provider optimization, resource management, caching strategies, and monitoring best practices.

---

## Table of Contents

1. [Performance Baseline](#performance-baseline)
2. [Context Efficiency (CONCURA)](#context-efficiency-concura)
3. [LLM Provider Optimization](#llm-provider-optimization)
4. [Token Management Optimization](#token-management-optimization)
5. [Workflow Caching](#workflow-caching)
6. [Validator Performance](#validator-performance)
7. [Resource Limits](#resource-limits)
8. [Audit Logging Optimization](#audit-logging-optimization)
9. [Network Optimization](#network-optimization)
10. [Monitoring & Alerting](#monitoring--alerting)
11. [Troubleshooting Performance Issues](#troubleshooting-performance-issues)

---

## Performance Baseline

### Expected Performance Metrics

| Operation | Target | Maximum |
|-----------|--------|---------|
| Agent activation | < 2s | 5s |
| Menu display | < 500ms | 1s |
| Workflow start | < 3s | 10s |
| Validator check | < 50ms | 200ms |
| Token validation | < 100ms | 500ms |
| Audit log write | < 10ms | 50ms |

### Measuring Baseline

```bash
# Run performance benchmark
./tests/run-benchmarks.sh

# Check specific operation timing
time claude -e "/bmad:core:agents:abdul"

# Profile workflow execution
./scripts/profile-workflow.sh incident-response
```

---

## Context Efficiency (CONCURA)

BMAD-CYBER2 includes a tiered context loading system that dramatically reduces token consumption while preserving agent quality. This system achieves an average **8.75x token reduction**.

### Token Reduction Results

| Scenario | Before | After | Reduction |
|----------|--------|-------|-----------|
| Simple agent activation | 27,609 tokens | 4,602 tokens | **6.0x** |
| Agent + workflow | 39,017 tokens | 6,845 tokens | **5.7x** |
| Cross-module operation | 45,619 tokens | 5,431 tokens | **8.4x** |
| Party Mode (3 agents) | 41,758 tokens | 2,804 tokens | **14.9x** |
| Discovery only (Tier 0) | 27,609 tokens | 949 tokens | **29.1x** |

### Three-Tier Architecture

The system loads context progressively based on user intent:

| Tier | Max Tokens | Use Case | Token Savings |
|------|------------|----------|---------------|
| **Tier 0** | ~500 | Agent/workflow discovery | 98% reduction |
| **Tier 1** | ~2,000 | Simple interactions (85% of queries) | 93% reduction |
| **Tier 2** | ~10,000 | Complex analysis, workflow execution | 64% reduction |

### Enabling Context Efficiency

Context efficiency is configured in `_bmad/_config/context-loading-rules.yaml`:

```yaml
# Enable tiered context loading
context_efficiency:
  enabled: true
  default_tier: 1          # Start at Tier 1 for most queries
  auto_escalation: true    # Automatically escalate when needed

tiers:
  tier_0:
    max_tokens: 500
    sources:
      - micro-agent-manifest.csv
      - micro-workflow-manifest.csv

  tier_1:
    max_tokens: 2000
    sources:
      - _compact/agents/{module}/{agent}.compact.md

  tier_2:
    max_tokens: 10000
    sources:
      - agents/{agent}.md
      - workflows/{workflow}/workflow.yaml

caching:
  tier_0_ttl: 3600      # 1 hour
  tier_1_ttl: 1800      # 30 minutes
  tier_2_ttl: 300       # 5 minutes
```

### Compact Agent Files

79 agents have compressed personas (~200 tokens each) in `_bmad/_compact/agents/`:

```
_bmad/_compact/agents/
├── core/           # 2 agents (abdul, bmad-master)
├── cybersec-team/  # 15 agents
├── intel-team/     # 11 agents
├── legal-team/     # 13 agents
├── strategy-team/  # 14 agents
├── bmm/            # 9 agents
├── bmgd/           # 6 agents
├── bmb/            # 3 agents
└── cis/            # 6 agents
```

### Micro-Manifest Files

For Tier 0 discovery, use the compressed manifests:

| File | Original Size | Compressed | Reduction |
|------|---------------|------------|-----------|
| `agent-manifest.csv` | 64,248 chars | 12,687 chars | **80.3%** |
| `workflow-manifest.csv` | 29,615 chars | 25,698 chars | **13.2%** |

### Quality Preservation

Despite 8.75x token reduction, quality metrics remain high:

| Metric | Score |
|--------|-------|
| Persona distinctiveness | 88% identification rate |
| Response accuracy | 9.2/10 |
| Cross-module routing success | 85% |
| Overall quality score | **8.6/10** |

### Performance Monitoring for Context

```bash
# Check current tier usage
./scripts/context-tier-stats.sh

# Example output:
# Tier     Invocations    Avg Tokens    Escalations
# Tier 0   1,234          487           823 (67%)
# Tier 1   2,891          1,847         412 (14%)
# Tier 2   412            8,234         0 (0%)
```

---

## LLM Provider Optimization

### Provider Selection Strategy

BMAD-CYBER2 supports multiple LLM providers with different cost/performance profiles:

| Provider | Latency | Cost | Best For |
|----------|---------|------|----------|
| Claude 3 Opus | Higher | Higher | Complex analysis, security |
| Claude 3 Sonnet | Medium | Medium | General workflows |
| Claude 3 Haiku | Lower | Lower | Simple tasks, high volume |
| OpenAI GPT-4 | Medium | Higher | Alternative for diversity |
| Local (Ollama) | Lowest | Free | Development, sensitive data |

### Domain-Based Routing

Configure provider routing based on module requirements:

```yaml
# _bmad/_config/llm-config.yaml
routing:
  # High-stakes security operations
  cybersec-team:
    default: claude-3-opus
    workflows:
      incident-response: claude-3-opus
      threat-modeling: claude-3-opus
      vulnerability-scan: claude-3-sonnet

  # Intelligence requires accuracy
  intel-team:
    default: claude-3-opus
    workflows:
      flash-assessment: claude-3-sonnet  # Speed for rapid triage
      operation-mosaic: claude-3-opus    # Full capability

  # Development can use faster models
  bmm:
    default: claude-3-sonnet
    workflows:
      create-story: claude-3-haiku       # Volume task
      sprint-planning: claude-3-sonnet

  # Default fallback
  default: claude-3-haiku
```

### Cost Optimization

**Strategy 1: Tiered Model Selection**
```yaml
# Use cheaper models for routine tasks
cost_optimization:
  enabled: true
  rules:
    - pattern: "help|menu|exit"
      provider: claude-3-haiku
    - pattern: "list|show|display"
      provider: claude-3-haiku
    - pattern: "analyze|investigate|assess"
      provider: claude-3-opus
```

**Strategy 2: Caching Responses**
```yaml
# Cache common queries
caching:
  enabled: true
  ttl_seconds: 3600
  cacheable_patterns:
    - "menu display"
    - "agent greeting"
    - "workflow list"
```

**Strategy 3: Local Model for Development**
```yaml
# Use local models in development
development:
  provider: ollama
  model: llama3:70b
  fallback: claude-3-haiku
```

### Monitoring Provider Performance

```bash
# Check provider latency
./scripts/check-provider-latency.sh

# Example output:
# Provider         Avg Latency    P99 Latency    Success Rate
# claude-3-opus    2.3s           5.1s           99.8%
# claude-3-sonnet  1.1s           2.8s           99.9%
# claude-3-haiku   0.4s           1.2s           99.9%
# ollama-local     0.2s           0.8s           99.5%
```

---

## Token Management Optimization

### Token Caching

Tokens are cached to avoid repeated validation overhead:

```yaml
# _bmad/core/security/auth-config.yaml
authentication:
  token_based:
    enabled: true
    caching:
      enabled: true
      ttl_minutes: 60          # Cache valid tokens for 1 hour
      max_entries: 1000        # Maximum cached tokens
      eviction_policy: lru     # Least recently used eviction
```

### Session Optimization

```yaml
session:
  timeout_minutes: 480         # 8-hour sessions
  refresh_on_activity: true    # Extend on user activity
  max_lifetime_hours: 24       # Hard limit
  lazy_validation: true        # Validate on first tool use
```

### Reducing Token Overhead

**Batch Token Validation:**
```python
# Validate multiple operations in single check
from bmad_security import TokenValidator

validator = TokenValidator()
operations = ["read:cybersec-team", "execute:incident-response"]
result = validator.validate_batch(token, operations)
```

**Token Pre-warming:**
```bash
# Pre-warm token cache on session start
./scripts/prewarm-token-cache.sh
```

---

## Workflow Caching

### Configuration Caching

Workflow configurations are cached after first load:

```yaml
# _bmad/core/config.yaml
performance:
  workflow_caching:
    enabled: true
    config_ttl_seconds: 3600   # Cache config for 1 hour
    template_ttl_seconds: 3600  # Cache templates for 1 hour
    instructions_ttl_seconds: 86400  # Cache instructions for 24 hours
```

### Variable Resolution Caching

```yaml
# Cache resolved variables
variable_resolution:
  cache_enabled: true
  cache_ttl_seconds: 300       # 5-minute TTL
  precompute_on_load: true     # Resolve variables at workflow load
```

### Invalidation Strategy

```yaml
# Automatic cache invalidation
cache_invalidation:
  on_config_change: true       # Clear when config.yaml changes
  on_manifest_update: true     # Clear when manifests update
  max_age_seconds: 86400       # Force refresh daily
```

### Manual Cache Control

```bash
# Clear all caches
./scripts/clear-cache.sh --all

# Clear specific cache
./scripts/clear-cache.sh --workflow-config
./scripts/clear-cache.sh --token-cache
./scripts/clear-cache.sh --template-cache

# View cache stats
./scripts/cache-stats.sh
```

---

## Validator Performance

### Validator Execution Order

Validators run in configured order. Optimize by placing fast validators first:

```json
// .claude/settings.json
{
  "hooks": {
    "pre-tool-use": [
      // Fast validators first (< 10ms)
      {"path": ".claude/validators-node/bin/rate-limiter.js", "tools": ["*"]},
      {"path": ".claude/validators-node/bin/recursion-guard.js", "tools": ["Skill"]},

      // Medium validators (10-50ms)
      {"path": ".claude/validators-node/bin/token-validator.js", "tools": ["*"]},
      {"path": ".claude/validators-node/bin/outside-repo.js", "tools": ["Read", "Glob"]},

      // Slower validators last (> 50ms)
      {"path": ".claude/validators-node/bin/jailbreak.js", "tools": ["*"]},
      {"path": ".claude/validators-node/bin/bash-safety.js", "tools": ["Bash"]}
    ]
  }
}
```

### Validator Timeouts

Configure appropriate timeouts to prevent blocking:

```json
{
  "hooks": {
    "pre-tool-use": [
      {
        "path": ".claude/validators-node/bin/bash-safety.js",
        "tools": ["Bash"],
        "blocking": true,
        "timeout": 5000  // 5 second timeout
      }
    ]
  }
}
```

### Selective Validator Execution

Apply validators only where needed:

```json
{
  "hooks": {
    "pre-tool-use": [
      // Only for Bash commands
      {"path": ".claude/validators-node/bin/bash-safety.js", "tools": ["Bash"]},

      // Only for file operations
      {"path": ".claude/validators-node/bin/secret.js", "tools": ["Write", "Edit"]},

      // Only for network operations
      {"path": ".claude/validators-node/bin/plugin-permissions.js", "tools": ["WebFetch"]}
    ]
  }
}
```

### Validator Caching

Some validators can cache results:

```python
# Example: Rate limiter with caching
class RateLimiter:
    def __init__(self):
        self.cache = {}
        self.cache_ttl = 60  # 60-second TTL

    def check(self, user_id, operation):
        cache_key = f"{user_id}:{operation}"
        if cache_key in self.cache:
            cached = self.cache[cache_key]
            if time.time() - cached['timestamp'] < self.cache_ttl:
                return cached['result']

        # Perform check
        result = self._do_check(user_id, operation)
        self.cache[cache_key] = {'result': result, 'timestamp': time.time()}
        return result
```

---

## Resource Limits

### Memory Limits

```yaml
# _bmad/core/config.yaml
resource_limits:
  memory:
    max_heap_mb: 2048          # Maximum heap size
    max_stack_mb: 256          # Maximum stack size
    gc_threshold_mb: 1024      # Trigger GC at this threshold
```

### CPU Limits

```yaml
resource_limits:
  cpu:
    max_threads: 4             # Maximum concurrent threads
    timeout_seconds: 300       # Hard timeout for operations
    priority: normal           # Process priority
```

### File System Limits

```yaml
resource_limits:
  filesystem:
    max_file_size_mb: 100      # Maximum file size
    max_open_files: 100        # Maximum open file handles
    output_quota_gb: 10        # Maximum output folder size
```

### Network Limits

```yaml
resource_limits:
  network:
    max_connections: 10        # Maximum concurrent connections
    timeout_seconds: 30        # Connection timeout
    max_request_size_mb: 10    # Maximum request size
```

### Monitoring Resource Usage

```bash
# Check current resource usage
./scripts/resource-usage.sh

# Example output:
# Resource        Current    Limit      Usage
# Memory          1.2 GB     2.0 GB     60%
# CPU             45%        100%       45%
# Open Files      23         100        23%
# Network Conn    3          10         30%
```

---

## Audit Logging Optimization

### Async Logging

Configure async logging to prevent blocking:

```yaml
# _bmad/core/config.yaml
security:
  audit:
    async_enabled: true        # Non-blocking writes
    buffer_size: 1000          # Buffer entries before flush
    flush_interval_ms: 5000    # Flush every 5 seconds
    batch_writes: true         # Batch multiple entries
```

### Log Rotation

```yaml
security:
  audit:
    rotation:
      enabled: true
      max_file_size_mb: 100    # Rotate at 100MB
      max_files: 10            # Keep 10 rotated files
      compress: true           # Gzip old logs
```

### Selective Logging

Log only essential events in high-performance scenarios:

```yaml
security:
  audit:
    events:
      workflow_start: true
      workflow_complete: true
      yolo_invoked: true
      yolo_blocked: true
      security_violation: true
      agent_activation: false   # Disable for performance
      file_operation: false     # Disable for performance
```

### Log Level Configuration

```yaml
security:
  audit:
    level: warn                # Only warnings and above
    levels_by_module:
      security: info           # Security always verbose
      workflow: warn           # Workflows warn only
      agent: error             # Agents errors only
```

---

## Network Optimization

### Connection Pooling

```yaml
# _bmad/_config/llm-config.yaml
network:
  connection_pool:
    enabled: true
    min_connections: 2
    max_connections: 10
    idle_timeout_seconds: 300
    reuse_connections: true
```

### Request Optimization

```yaml
network:
  requests:
    compress_requests: true    # Gzip request bodies
    compress_responses: true   # Accept gzipped responses
    keep_alive: true           # Use HTTP keep-alive
    timeout_connect_ms: 5000   # Connection timeout
    timeout_read_ms: 30000     # Read timeout
```

### Retry Strategy

```yaml
network:
  retry:
    enabled: true
    max_retries: 3
    initial_delay_ms: 1000
    max_delay_ms: 10000
    exponential_backoff: true
    retry_on: [500, 502, 503, 504]
```

---

## Monitoring & Alerting

### Key Metrics to Monitor

| Metric | Warning | Critical |
|--------|---------|----------|
| Agent activation time | > 3s | > 5s |
| Workflow execution time | > 30s | > 60s |
| Validator latency | > 100ms | > 200ms |
| Token validation time | > 200ms | > 500ms |
| Memory usage | > 70% | > 90% |
| Error rate | > 1% | > 5% |

### Monitoring Configuration

```yaml
# monitoring/config.yaml
monitoring:
  enabled: true
  interval_seconds: 60

  metrics:
    - name: agent_activation_time
      type: histogram
      buckets: [0.5, 1, 2, 3, 5, 10]

    - name: workflow_execution_time
      type: histogram
      buckets: [1, 5, 10, 30, 60, 120]

    - name: validator_latency
      type: histogram
      buckets: [0.01, 0.05, 0.1, 0.2, 0.5]

    - name: error_count
      type: counter
      labels: [module, operation, error_type]
```

### Alerting Rules

```yaml
alerting:
  rules:
    - name: slow_agent_activation
      condition: agent_activation_time_p99 > 5s
      severity: warning
      message: "Agent activation exceeds 5 seconds"

    - name: high_error_rate
      condition: error_rate_5m > 0.05
      severity: critical
      message: "Error rate exceeds 5%"

    - name: memory_pressure
      condition: memory_usage > 0.9
      severity: critical
      message: "Memory usage exceeds 90%"
```

### Dashboard Queries

```sql
-- Agent activation latency by module
SELECT
  module,
  avg(duration_ms) as avg_latency,
  percentile_cont(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99_latency
FROM agent_activations
WHERE timestamp > now() - interval '1 hour'
GROUP BY module;

-- Workflow execution by status
SELECT
  workflow,
  status,
  count(*) as executions
FROM workflow_executions
WHERE timestamp > now() - interval '24 hours'
GROUP BY workflow, status;

-- Validator performance
SELECT
  validator,
  avg(duration_ms) as avg_latency,
  sum(case when blocked then 1 else 0 end) as blocks
FROM validator_checks
WHERE timestamp > now() - interval '1 hour'
GROUP BY validator;
```

---

## Troubleshooting Performance Issues

### Common Issues and Solutions

#### Issue: Slow Agent Activation

**Symptoms:**
- Agent takes > 5s to activate
- Greeting delayed

**Diagnosis:**
```bash
# Profile agent activation
./scripts/profile-agent.sh cybersec-team/bastion

# Check config loading time
time cat _bmad/core/config.yaml | wc -l
```

**Solutions:**
1. Enable config caching
2. Reduce config file size
3. Pre-load common configs

#### Issue: Slow Workflow Execution

**Symptoms:**
- Workflows timeout
- Long pauses between steps

**Diagnosis:**
```bash
# Profile workflow
./scripts/profile-workflow.sh incident-response --verbose

# Check LLM latency
./scripts/check-provider-latency.sh
```

**Solutions:**
1. Use faster LLM for routine steps
2. Cache template files
3. Parallelize independent steps

#### Issue: Validator Bottleneck

**Symptoms:**
- Operations queue up
- High latency on tool use

**Diagnosis:**
```bash
# Check validator timing
./scripts/validator-timing.sh

# Example output showing bottleneck:
# Validator              Avg    P99    Calls
# bash-safety.js         45ms   150ms  1000
# jailbreak.js           120ms  500ms  1000  <-- Bottleneck
```

**Solutions:**
1. Increase validator timeout
2. Move slow validators to async
3. Optimize validator logic

#### Issue: Memory Pressure

**Symptoms:**
- OOM errors
- Slow garbage collection

**Diagnosis:**
```bash
# Check memory usage
./scripts/memory-profile.sh

# View heap dump
./scripts/heap-dump.sh --analyze
```

**Solutions:**
1. Increase heap size limit
2. Enable aggressive GC
3. Clear caches more frequently

### Performance Debugging Commands

```bash
# Full performance report
./scripts/performance-report.sh

# Real-time monitoring
./scripts/monitor.sh --live

# Identify bottlenecks
./scripts/bottleneck-analyzer.sh

# Generate flame graph
./scripts/flame-graph.sh --duration 60

# Export metrics for analysis
./scripts/export-metrics.sh --format json --output metrics.json
```

---

## Quick Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `_bmad/core/config.yaml` | Core performance settings |
| `_bmad/_config/llm-config.yaml` | LLM provider routing |
| `.claude/settings.json` | Validator configuration |
| `_bmad/core/security/auth-config.yaml` | Token caching |

### Key Commands

```bash
# Check overall performance
./scripts/performance-check.sh

# Clear all caches
./scripts/clear-cache.sh --all

# Monitor in real-time
./scripts/monitor.sh --live

# Generate report
./scripts/performance-report.sh --output report.html
```

### Performance Checklist

- [ ] LLM provider routing configured by module
- [ ] Token caching enabled
- [ ] Workflow caching enabled
- [ ] Validators ordered by speed
- [ ] Resource limits configured
- [ ] Async audit logging enabled
- [ ] Connection pooling enabled
- [ ] Monitoring dashboards configured
- [ ] Alerting rules active

---

## Related Documentation

- [ARCHITECTURE-DEEP-DIVE.md](../../Developer/ARCHITECTURE-DEEP-DIVE.md) - System architecture
- [OPERATIONAL-RUNBOOKS.md](OPERATIONAL-RUNBOOKS.md) - Operational procedures
- [LLM-PROVIDER-SYSTEM.md](../LLM-PROVIDER-SYSTEM.md) - Provider configuration
- [CONFIGURATION-GUIDE.md](../CONFIGURATION-GUIDE.md) - General configuration
