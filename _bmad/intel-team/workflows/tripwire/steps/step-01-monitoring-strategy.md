---
name: 'step-01-monitoring-strategy'
description: 'Define monitoring objectives, priority levels, alert thresholds, and notification workflow'
estimated_duration: '10 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/tripwire'
thisStepFile: '{workflow_path}/steps/step-01-monitoring-strategy.md'
nextStepFile: '{workflow_path}/steps/step-02-infrastructure-monitoring.md'
prevStepFile: null

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 1: Monitoring Strategy

## STEP GOAL

Establish the overall monitoring strategy including objectives, priority levels, alert thresholds, notification workflows, and escalation procedures.

## EXECUTION TIME: ~10 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, OSINT Lead and Intelligence Operations Director
- You design comprehensive monitoring strategies
- You calibrate alert thresholds to balance sensitivity and noise
- You establish clear escalation paths for different alert types

### Strategy Protocol
- Define clear monitoring objectives
- Establish priority classification
- Set appropriate thresholds
- Design notification workflows
- Document escalation procedures

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Monitoring Objectives

Define monitoring objectives:

```
MONITORING OBJECTIVES
=====================

Target Information:
| Field | Value |
|-------|-------|
| Primary target | [organization/individual] |
| Target identifiers | [domains, names, handles] |
| Monitoring period | [start date - end date/ongoing] |
| Intelligence requirement | [what we need to detect] |

Monitoring Purpose:
| Purpose | Priority | Rationale |
|---------|----------|-----------|
| Threat detection | [H/M/L] | [why monitoring for threats] |
| Change tracking | [priority] | [why tracking changes] |
| Competitive intelligence | [priority] | [why CI matters] |
| Compliance monitoring | [priority] | [regulatory reasons] |
| Due diligence | [priority] | [business reasons] |

Key Questions to Answer:
| Question | Priority | Monitoring Approach |
|----------|----------|---------------------|
| [What are they doing?] | [H/M/L] | [how we'll detect] |
| [Who are they interacting with?] | [priority] | [approach] |
| [Are there security concerns?] | [priority] | [approach] |
| [What's changing?] | [priority] | [approach] |

Monitoring Scope:
| Domain | In Scope | Out of Scope | Justification |
|--------|----------|--------------|---------------|
| Technical infrastructure | [Y/N] | [Y/N] | [why] |
| Corporate structure | [Y/N] | [Y/N] | [why] |
| Social media | [Y/N] | [Y/N] | [why] |
| Dark web | [Y/N] | [Y/N] | [why] |
| Physical | [Y/N] | [Y/N] | [why] |

□ Objectives defined: [count]
□ Scope established: [Y/N]
□ Key questions documented: [count]
```

### 2. Priority Classification

Establish priority levels:

```
PRIORITY CLASSIFICATION
=======================

Alert Priority Levels:
| Level | Name | Response Time | Examples |
|-------|------|---------------|----------|
| P1 | CRITICAL | Immediate | Credential leak, active breach, threat detected |
| P2 | HIGH | < 1 hour | New breach, significant infrastructure change |
| P3 | MEDIUM | < 24 hours | Registry changes, new filings, DNS updates |
| P4 | LOW | < 48 hours | Social mentions, routine updates |
| P5 | INFO | Weekly digest | General activity, trend data |

Priority Assignment Criteria:
| Factor | P1 | P2 | P3 | P4 | P5 |
|--------|----|----|----|----|-----|
| Security impact | Direct threat | High risk | Moderate risk | Low risk | Info only |
| Time sensitivity | Immediate | Hours | Days | Week | Ongoing |
| Business impact | Critical | Major | Moderate | Minor | None |
| Reputation risk | Public | Limited | Internal | Low | None |
| Legal/compliance | Urgent | Important | Required | Recommended | Optional |

Change Type Priority Matrix:
| Change Type | Default Priority | Escalation Trigger |
|-------------|------------------|-------------------|
| Credential leak | P1 CRITICAL | Always immediate |
| Data breach mention | P2 HIGH | Volume, specificity |
| Dark web listing | P2 HIGH | Type, recency |
| Infrastructure change | P3 MEDIUM | Unexpected, suspicious |
| DNS modification | P3 MEDIUM | Redirection, new TLD |
| Certificate change | P3 MEDIUM | Unexpected timing |
| New domain | P3 MEDIUM | Typosquat, similar name |
| Corporate filing | P3 MEDIUM | Major change, M&A |
| Officer change | P3 MEDIUM | Key personnel |
| Social post | P4 LOW | Sensitive topic |
| Mention | P4 LOW | Negative sentiment |
| Routine activity | P5 INFO | Pattern deviation |

Priority Escalation Rules:
| From | To | Condition |
|------|-----|-----------|
| P4 | P3 | Pattern of concerning activity |
| P3 | P2 | Multiple related indicators |
| P2 | P1 | Confirmed threat or compromise |
| Any | P1 | Explicit threat, active attack |

□ Priority levels: [defined]
□ Assignment criteria: [documented]
□ Escalation rules: [established]
```

### 3. Alert Thresholds

Configure alert thresholds:

```
ALERT THRESHOLDS
================

Volume Thresholds:
| Indicator Type | Low | Medium | High | Critical |
|----------------|-----|--------|------|----------|
| Social mentions/day | < 10 | 10-50 | 50-200 | > 200 |
| DNS changes/week | 0-1 | 2-5 | 5-10 | > 10 |
| Dark web mentions/month | 0 | 1-2 | 3-5 | > 5 |
| Failed login attempts | < 5 | 5-20 | 20-100 | > 100 |
| New domains detected | 0-1 | 2-3 | 4-10 | > 10 |

Sentiment Thresholds:
| Metric | Normal | Watch | Alert | Critical |
|--------|--------|-------|-------|----------|
| Sentiment score | > 0.6 | 0.3-0.6 | 0.1-0.3 | < 0.1 |
| Negative ratio | < 10% | 10-25% | 25-50% | > 50% |
| Trend change | Stable | -10% | -25% | -50% |

Time-Based Thresholds:
| Event Type | Normal | Watch | Alert | Critical |
|------------|--------|-------|-------|----------|
| Certificate expiry | > 90 days | 30-90 days | 7-30 days | < 7 days |
| Domain expiry | > 90 days | 30-90 days | 14-30 days | < 14 days |
| Last activity | < 7 days | 7-30 days | 30-90 days | > 90 days |

Deviation Thresholds:
| Baseline | Normal | Watch | Alert | Critical |
|----------|--------|-------|-------|----------|
| Activity pattern | ±10% | ±25% | ±50% | ±100% |
| Post frequency | ±20% | ±50% | ±100% | Stopped |
| Geographic shift | Same region | Same country | Different country | New location |

Compound Alert Conditions:
| Condition | Components | Resulting Priority |
|-----------|------------|-------------------|
| Coordinated activity | Multi-platform + unusual timing | Escalate +1 |
| Infrastructure pivot | DNS + cert + new domain | P2 HIGH |
| Reputation attack | Negative sentiment + high volume | P2 HIGH |
| Credential exposure | Breach + dark web | P1 CRITICAL |

□ Volume thresholds: [configured]
□ Sentiment thresholds: [set]
□ Time thresholds: [defined]
□ Compound conditions: [established]
```

### 4. Notification Workflow

Design notification workflow:

```
NOTIFICATION WORKFLOW
=====================

Notification Channels:
| Channel | Use Case | Latency | Reliability |
|---------|----------|---------|-------------|
| Email | Standard alerts | Minutes | High |
| SMS | Critical alerts | Seconds | High |
| Slack/Teams | Team notifications | Real-time | High |
| Webhook | System integration | Real-time | Medium |
| Phone | Emergency escalation | Immediate | Medium |

Channel Assignment by Priority:
| Priority | Primary Channel | Secondary | Escalation |
|----------|-----------------|-----------|------------|
| P1 CRITICAL | Phone + SMS | Slack + Email | Chain call |
| P2 HIGH | SMS + Slack | Email | Manager call |
| P3 MEDIUM | Slack | Email | None |
| P4 LOW | Email | Slack | None |
| P5 INFO | Digest email | None | None |

Recipient Matrix:
| Role | P1 | P2 | P3 | P4 | P5 |
|------|----|----|----|----|-----|
| Intel Lead | ✓ | ✓ | ✓ | ✓ | ✓ |
| Security Team | ✓ | ✓ | ✓ | | |
| Analyst On-Call | ✓ | ✓ | | | |
| Management | ✓ | | | | |
| Operations | | ✓ | ✓ | | |
| Stakeholders | | | | | ✓ (digest) |

Notification Content Template:
| Field | P1-P2 | P3-P4 | P5 |
|-------|-------|-------|-----|
| Subject line | PRIORITY: [level] - [summary] | Alert: [summary] | Digest: [period] |
| Executive summary | 2-3 sentences | 1-2 sentences | Aggregate stats |
| Details | Full context | Key points | Summary table |
| Source | Full attribution | Source + link | Count only |
| Recommended action | Required action | Suggested action | Review options |
| Escalation path | Named contacts | Team contact | N/A |
| Deadline | Specific time | Timeframe | N/A |

Notification Timing:
| Priority | Immediate | Batched | Digest |
|----------|-----------|---------|--------|
| P1 | ✓ (always) | Never | Never |
| P2 | ✓ | Never | Never |
| P3 | Business hours | After hours | Never |
| P4 | Never | Every 4 hours | Daily optional |
| P5 | Never | Never | Weekly |

Quiet Hours:
| Period | P1 | P2 | P3 | P4-P5 |
|--------|----|----|----|----|
| Business hours | Immediate | Immediate | Immediate | Batched |
| After hours | Immediate | Immediate | Next day | Next day |
| Weekends | Immediate | Immediate | Monday | Monday |
| Holidays | Immediate | On-call only | After holiday | After holiday |

□ Channels defined: [count]
□ Recipients assigned: [Y/N]
□ Templates created: [Y/N]
□ Timing configured: [Y/N]
```

### 5. Escalation Procedures

Document escalation procedures:

```
ESCALATION PROCEDURES
=====================

Escalation Chain:
| Level | Time Trigger | Condition Trigger | Contact |
|-------|--------------|-------------------|---------|
| L1 | Initial | New alert | On-call analyst |
| L2 | 30 min unacknowledged | P2 pattern | Intel Lead |
| L3 | 1 hour unacknowledged | P1 confirmed | Security Director |
| L4 | 2 hours unresolved | Active threat | Executive |

Escalation Actions:
| Trigger | Action | Owner | Timeframe |
|---------|--------|-------|-----------|
| P1 alert generated | Immediate notification + acknowledgment | On-call | 5 min |
| P1 unacknowledged 15 min | Phone call + backup notification | System | Immediate |
| P2 pattern detected | Escalate to Intel Lead | Analyst | 30 min |
| Confirmed threat | Initiate incident response | Intel Lead | Immediate |
| Multiple related alerts | Correlate and assess | Analyst | 1 hour |

Escalation Decision Matrix:
| Current State | New Information | Action |
|---------------|-----------------|--------|
| Single P3 alert | Related P3 detected | Correlate, assess for upgrade |
| Multiple P3 alerts | Pattern confirmed | Upgrade to P2, escalate |
| P2 alert | Threat confirmed | Upgrade to P1, full escalation |
| P1 alert | Ongoing activity | Sustain response, hourly updates |
| P1 alert | Activity stopped | Continue monitoring, stand down |

On-Call Rotation:
| Role | Primary | Backup | Contact Method |
|------|---------|--------|----------------|
| Analyst | [name] | [name] | [phone/slack] |
| Intel Lead | [name] | [name] | [phone] |
| Security | [name] | [name] | [phone] |
| Executive | [name] | [name] | [phone] |

Response Time SLAs:
| Priority | Acknowledge | Assess | Initial Response | Resolution |
|----------|-------------|--------|------------------|------------|
| P1 | 5 min | 15 min | 30 min | Ongoing until resolved |
| P2 | 15 min | 1 hour | 2 hours | 24 hours |
| P3 | 1 hour | 4 hours | 8 hours | 48 hours |
| P4 | 4 hours | 24 hours | 48 hours | Weekly |
| P5 | N/A | Weekly | Weekly digest | N/A |

Escalation Documentation:
| Element | Required For | Format |
|---------|--------------|--------|
| Initial alert | All | Automated log |
| Acknowledgment | P1-P3 | Timestamp + analyst |
| Assessment notes | P1-P2 | Structured form |
| Actions taken | P1-P2 | Timeline log |
| Resolution | P1-P3 | Summary + lessons |
| After-action report | P1 | Full report |

□ Escalation chain: [defined]
□ Decision matrix: [documented]
□ On-call rotation: [assigned]
□ SLAs: [established]
```

### 6. Monitoring Strategy Summary

Compile strategy summary:

```
MONITORING STRATEGY SUMMARY
===========================

Monitoring Scope:
| Domain | Status | Priority |
|--------|--------|----------|
| Technical infrastructure | [In scope] | [priority] |
| Corporate registry | [In scope] | [priority] |
| Social media | [In scope] | [priority] |
| Dark web | [In scope] | [priority] |

Priority Distribution:
| Level | Count | Alert Types |
|-------|-------|-------------|
| P1 CRITICAL | [count] | [types] |
| P2 HIGH | [count] | [types] |
| P3 MEDIUM | [count] | [types] |
| P4 LOW | [count] | [types] |
| P5 INFO | [count] | [types] |

Notification Summary:
| Channel | Priority Levels | Recipients |
|---------|-----------------|------------|
| Phone | P1 | [count] |
| SMS | P1-P2 | [count] |
| Slack | P1-P3 | [count] |
| Email | All | [count] |

Escalation Summary:
| Level | Contact | Response Time |
|-------|---------|---------------|
| L1 | On-call analyst | 5 min |
| L2 | Intel Lead | 30 min |
| L3 | Security Director | 1 hour |
| L4 | Executive | 2 hours |

HANDOFF TO RESOLVER (Step 2):
- Monitoring objectives: [for infrastructure focus]
- Target domains: [list for DNS monitoring]
- Alert thresholds: [infrastructure-specific]
- Notification workflow: [channel integration]
- Priority matrix: [for alert assignment]
```

---

## STEP 1 OUTPUT

```markdown
## MONITORING STRATEGY COMPLETE

### Monitoring Scope
- Target: [name/organization]
- Period: [dates]
- Domains: [infrastructure/corporate/social/dark web]

### Priority Levels
- P1 CRITICAL: [description, response time]
- P2 HIGH: [description, response time]
- P3 MEDIUM: [description, response time]
- P4 LOW: [description, response time]
- P5 INFO: [description]

### Alert Thresholds
- Volume-based: [configured]
- Sentiment-based: [configured]
- Time-based: [configured]

### Notification Workflow
- Channels: [list]
- Recipients: [count by priority]
- Templates: [ready]

### Escalation
- Chain: [L1-L4 defined]
- SLAs: [documented]
- On-call: [assigned]

### Next Step
Step 2: Infrastructure Monitoring (Resolver)
Focus: [domain changes, DNS, certificates, subdomains]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:
- [ ] Monitoring objectives defined
- [ ] Priority levels established
- [ ] Alert thresholds configured
- [ ] Notification workflow designed
- [ ] Escalation procedures documented
- [ ] Handoff prepared for Resolver

---

## MENU OPTIONS

**[C] Continue** - Proceed to infrastructure monitoring (Step 2)
**[O] Objectives** - Refine monitoring objectives
**[T] Thresholds** - Adjust alert thresholds
**[N] Notifications** - Configure notification workflow

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-02-infrastructure-monitoring.md`

