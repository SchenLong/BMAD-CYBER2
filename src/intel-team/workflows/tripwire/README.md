# Tripwire

**Continuous monitoring and alerting configuration**

## Overview

| Attribute | Value |
|-----------|-------|
| **Classification** | Monitoring |
| **Duration** | ~45 minutes |
| **Steps** | 5 |
| **Primary Agent** | Vector (OSINT Lead) |
| **Supporting Agents** | Resolver, Proxy, Echo, Shadow |

## Purpose

Configure comprehensive monitoring for target changes with alerting thresholds and notification rules:

- Monitoring strategy definition
- Infrastructure monitoring
- Corporate registry monitoring
- Social media monitoring
- Dark web monitoring

## Steps

1. **Monitoring Strategy** (Vector) - Objectives, priorities, thresholds, notification workflow
2. **Infrastructure Monitoring** (Resolver) - Domain changes, DNS, certificates, subdomains
3. **Corporate Monitoring** (Proxy) - Officer changes, status updates, M&A activity
4. **Social Monitoring** (Echo) - Post alerts, mentions, sentiment, new accounts
5. **Dark Web Monitoring** (Shadow) - Breach alerts, forum mentions, credential dumps

## Outputs

- Monitoring configuration
- Alert rules
- Escalation procedures
- Dashboard setup

## Usage

```
/intel-team:osint-lead
> Tripwire
```

See [workflow.md](workflow.md) for detailed step instructions.
