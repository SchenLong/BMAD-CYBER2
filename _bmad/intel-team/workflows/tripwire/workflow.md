---
name: 'tripwire'
description: 'Alerting & Monitoring Configuration - Configure comprehensive monitoring for target changes with alerting thresholds and notification rules'
version: '1.0.0'
classification: 'MONITORING'

# Workflow Path Configuration
workflow_path: '{project-root}/_bmad/intel-team/workflows/tripwire'
stepsFolder: '{workflow_path}/steps'

# Agent Sequence
agents:
  - osint-lead           # Vector - monitoring strategy
  - domain-intel-specialist  # Resolver - infrastructure monitoring
  - corporate-intel-specialist  # Proxy - corporate registry monitoring
  - social-media-analyst  # Echo - social monitoring
  - dark-web-analyst      # Shadow - dark web monitoring

# Execution Configuration
execution_mode: 'sequential'
estimated_duration: '45 minutes'
output_folder: '{project-root}/_intel-products/monitoring-configs'

# Step Definitions
steps:
  - name: 'step-01-monitoring-strategy'
    file: '{stepsFolder}/step-01-monitoring-strategy.md'
    agent: 'osint-lead'
    description: 'Define objectives, priorities, thresholds, notification workflow'

  - name: 'step-02-infrastructure-monitoring'
    file: '{stepsFolder}/step-02-infrastructure-monitoring.md'
    agent: 'domain-intel-specialist'
    description: 'Domain changes, DNS modifications, certificates, subdomains'

  - name: 'step-03-corporate-monitoring'
    file: '{stepsFolder}/step-03-corporate-monitoring.md'
    agent: 'corporate-intel-specialist'
    description: 'Officer changes, corporate status, filings, M&A activity'

  - name: 'step-04-social-monitoring'
    file: '{stepsFolder}/step-04-social-monitoring.md'
    agent: 'social-media-analyst'
    description: 'Post alerts, mention tracking, sentiment changes, new accounts'

  - name: 'step-05-dark-web-monitoring'
    file: '{stepsFolder}/step-05-dark-web-monitoring.md'
    agent: 'dark-web-analyst'
    description: 'Breach alerts, forum mentions, marketplace listings, credential dumps'
---

# Tripwire: Alerting & Monitoring Configuration

## Purpose

Configure comprehensive monitoring for target changes with alerting thresholds and notification rules to enable proactive intelligence collection through continuous observation.

## When to Use

- After completing initial reconnaissance (Blueprint workflow)
- For ongoing target monitoring
- When proactive intelligence collection is required
- Prior to anticipated target activity
- As part of continuous due diligence

## Workflow Overview

```
INPUT: Monitoring Targets + Alert Requirements
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ VECTOR (osint-lead)                                     │
│ Step 1: Monitoring Strategy                             │
│ - Define monitoring objectives                          │
│ - Set priority levels                                   │
│ - Establish alert thresholds                            │
│ - Design notification workflow                          │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ RESOLVER (domain-intel-specialist)                      │
│ Step 2: Infrastructure Monitoring                       │
│ - Domain change alerts                                  │
│ - DNS modification detection                            │
│ - Certificate changes                                   │
│ - New subdomain discovery                               │
│ *Future MCP: Real-time DNS monitoring*                  │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ PROXY (corporate-intel-specialist)                      │
│ Step 3: Corporate Registry Monitoring                   │
│ - Officer/director changes                              │
│ - Corporate status updates                              │
│ - New subsidiary filings                                │
│ - Beneficial ownership changes                          │
│ - M&A activity alerts                                   │
│ - Regulatory filing notifications                       │
│ *Future MCP: Corporate registry webhooks*               │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ ECHO (social-media-analyst)                             │
│ Step 4: Social Monitoring                               │
│ - New post alerts                                       │
│ - Mention tracking                                      │
│ - Sentiment changes                                     │
│ - New account detection                                 │
│ *Future MCP: Social media webhooks*                     │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ SHADOW (dark-web-analyst)                               │
│ Step 5: Dark Web Monitoring                             │
│ - New breach alerts                                     │
│ - Forum mention tracking                                │
│ - Marketplace listings                                  │
│ - Credential dump detection                             │
│ *Future MCP: Dark web monitoring feeds*                 │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
OUTPUT: Monitoring Configuration Package
```

## Alert Priority Matrix

| Change Type | Priority | Response Time |
|-------------|----------|---------------|
| Credential leak | CRITICAL | Immediate |
| New breach | HIGH | < 1 hour |
| Infrastructure change | MEDIUM | < 24 hours |
| Corporate registry change | MEDIUM | < 24 hours |
| Social mention | LOW | < 48 hours |

## Output Artifacts

- **Monitoring Configuration** - What to watch and how
- **Alert Rules** - When to notify and escalate
- **Escalation Procedures** - Who to contact and when
- **Dashboard Setup** - Visualization and reporting

## Intelligence Categories Monitored

| Category | Indicators | Alert Triggers |
|----------|------------|----------------|
| Technical | DNS, domains, certs, IPs | Changes, new entries |
| Corporate | Officers, filings, structure | Changes, new filings |
| Social | Posts, mentions, sentiment | Activity, trend shifts |
| Dark Web | Breaches, forums, markets | Mentions, listings |
| Operational | Behavior, patterns, timing | Anomalies, deviations |

## Prerequisites

- Target identification complete
- Collection requirements defined
- Alert recipients designated
- Escalation chain established
- Monitoring resources available

## Success Criteria

- [ ] All target indicators catalogued
- [ ] Alert thresholds calibrated
- [ ] Notification workflow established
- [ ] Escalation procedures documented
- [ ] Dashboard configured
- [ ] Test alerts verified

## Related Workflows

- **Blueprint** - Initial reconnaissance (provides monitoring targets)
- **The Synthesis** - Fusion of collected intelligence
- **Pattern of Life** - Behavioral baseline for anomaly detection
- **Flash Assessment** - Rapid response to alerts

## Initiation

To begin this workflow, load and execute:
`{workflow_path}/steps/step-01-monitoring-strategy.md`

