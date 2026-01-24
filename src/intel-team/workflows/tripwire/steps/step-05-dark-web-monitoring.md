---
name: 'step-05-dark-web-monitoring'
description: 'New breach alerts, forum mention tracking, marketplace listings, credential dump detection'
estimated_duration: '10 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/tripwire'
thisStepFile: '{workflow_path}/steps/step-05-dark-web-monitoring.md'
nextStepFile: null
prevStepFile: '{workflow_path}/steps/step-04-social-monitoring.md'

# Agent Configuration
executing_agent: dark-web-analyst
agent_codename: Shadow
---

# Step 5: Dark Web Monitoring

## STEP GOAL

Configure comprehensive dark web monitoring including new breach alerts, forum mention tracking, marketplace listings, and credential dump detection to provide early warning of threats and exposures.

## EXECUTION TIME: ~10 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Shadow**, Dark Web Analyst
- You specialize in DARKINT and threat intelligence
- You monitor underground forums, marketplaces, and paste sites
- You detect credential exposures and emerging threats

### Monitoring Protocol
- Define dark web monitoring scope
- Configure breach notification alerts
- Establish forum and marketplace monitoring
- Set up credential leak detection
- Document threat alerting rules

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Dark Web Monitoring Scope

Define monitoring scope:

```
DARK WEB MONITORING SCOPE
=========================

Entity Identifiers to Monitor:
| Identifier Type | Value | Priority | Context |
|-----------------|-------|----------|---------|
| Company name | [name] | P2 HIGH | Direct mentions |
| Domain | [domain.com] | P1 CRITICAL | Credential leaks |
| Email domains | @[domain.com] | P1 CRITICAL | Email exposure |
| Brand names | [brands] | P2 HIGH | Fraud, abuse |
| Executive names | [names] | P2 HIGH | Targeted threats |
| Product names | [products] | P3 MEDIUM | Fraud, counterfeit |
| IP ranges | [CIDR blocks] | P2 HIGH | Infrastructure targeting |

Credential Domains:
| Domain | User Count (est) | Priority | Sensitivity |
|--------|------------------|----------|-------------|
| @[company.com] | [count] | P1 CRITICAL | Primary |
| @[subsidiary.com] | [count] | P1 CRITICAL | Primary |
| @[legacy-domain.com] | [count] | P2 HIGH | Historical |

Data Types to Monitor:
| Data Type | Sources | Priority | Alert Trigger |
|-----------|---------|----------|---------------|
| Credentials | Breach dumps, paste sites | P1 CRITICAL | Any detection |
| PII | Forums, marketplaces | P1 CRITICAL | Any detection |
| Financial data | Forums, marketplaces | P1 CRITICAL | Any detection |
| Source code | Paste sites, repos | P2 HIGH | Any detection |
| Internal docs | Forums, paste sites | P2 HIGH | Any detection |
| Network diagrams | Forums, marketplaces | P2 HIGH | Any detection |
| Access for sale | Forums, marketplaces | P1 CRITICAL | Any detection |

Monitoring Venues:
| Venue Type | Examples | Coverage | Access |
|------------|----------|----------|--------|
| Breach databases | HIBP, DeHashed, LeakBase | Automated | API/Service |
| Paste sites | Pastebin, Ghostbin | Automated | Crawler |
| Hacker forums | [specific forums] | Semi-automated | Access required |
| Marketplaces | [specific markets] | Semi-automated | Access required |
| Telegram channels | [threat channels] | Manual/automated | Requires access |
| IRC channels | [relevant channels] | Manual | Connection required |

□ Identifiers defined: [count]
□ Data types: [count categories]
□ Venues: [count sources]
□ Access: [required capabilities noted]
```

### 2. Breach Notification Configuration

Configure breach alerting:

```
BREACH NOTIFICATION CONFIGURATION
=================================

Breach Monitoring Services:
| Service | Coverage | Latency | Cost | Integrated |
|---------|----------|---------|------|------------|
| Have I Been Pwned | Historical + new | Real-time | $$ | [Y/N] |
| SpyCloud | Enterprise focus | Near real-time | $$$ | [Y/N] |
| DeHashed | Comprehensive | Real-time search | $$ | [Y/N] |
| Intel471 | Threat intelligence | Curated | $$$ | [Y/N] |
| Recorded Future | Multi-source | Real-time | $$$ | [Y/N] |

Breach Alert Rules:
| Condition | Priority | Notification | Response Time |
|-----------|----------|--------------|---------------|
| New breach containing [domain] | P1 CRITICAL | Immediate | < 15 min |
| Credentials for C-suite | P1 CRITICAL | Immediate | < 15 min |
| > 100 credentials exposed | P1 CRITICAL | Immediate | < 30 min |
| > 10 credentials exposed | P2 HIGH | < 1 hour | < 2 hours |
| 1-10 credentials exposed | P2 HIGH | < 4 hours | < 8 hours |
| Historical breach detection | P3 MEDIUM | Daily digest | < 24 hours |

Breach Data Categories:
| Category | Severity | Immediate Action |
|----------|----------|------------------|
| Passwords (plaintext) | CRITICAL | Force reset, incident |
| Passwords (hashed) | HIGH | Assess hash type, reset |
| Email only | MEDIUM | Monitor for phishing |
| Email + password | CRITICAL | Force reset, incident |
| Personal data (SSN, DOB) | CRITICAL | Legal, incident |
| Financial data | CRITICAL | Legal, incident |
| Access credentials | CRITICAL | Immediate revocation |

Breach Response Workflow:
| Phase | Action | Owner | Timeframe |
|-------|--------|-------|-----------|
| Detection | Alert generated | System | Automatic |
| Triage | Validate, assess scope | Analyst | 15 min |
| Escalation | Notify security team | Analyst | 30 min |
| Response | Password resets, monitoring | Security | 2 hours |
| Communication | Notify affected users | Security | 24 hours |
| Remediation | Root cause, prevention | Security | Ongoing |

□ Services integrated: [count]
□ Alert rules: [count]
□ Response workflow: [documented]
```

### 3. Forum Monitoring

Configure forum and community monitoring:

```
FORUM MONITORING
================

Forum Categories:
| Category | Forums | Access Level | Priority |
|----------|--------|--------------|----------|
| General hacking | HackForums, RaidForums(successor) | Registered | P2 HIGH |
| Data trading | Breached, Exposed | Registered | P1 CRITICAL |
| Russian | XSS, Exploit.in | Specialized | P2 HIGH |
| Chinese | [forums] | Specialized | P2 HIGH |
| Carding | [forums] | Specialized | P2 HIGH |
| Industry-specific | [relevant forums] | Varies | P3 MEDIUM |

Forum Search Keywords:
| Keyword | Context | Priority | Expected Hits |
|---------|---------|----------|---------------|
| [company name] | Direct mention | P2 HIGH | Low |
| [domain.com] | Data/access | P1 CRITICAL | Low |
| [executive name] | Targeting | P2 HIGH | Low |
| [industry] + [location] | Industry targeting | P3 MEDIUM | Medium |
| "[company] access" | Initial access broker | P1 CRITICAL | Very low |
| "[company] database" | Data sale | P1 CRITICAL | Very low |

Forum Mention Alert Rules:
| Mention Type | Priority | Verification | Action |
|--------------|----------|--------------|--------|
| Direct company mention | P2 HIGH | Context analysis | Assess intent |
| Access/credentials offered | P1 CRITICAL | Validate claim | Incident response |
| Data for sale | P1 CRITICAL | Sample analysis | Incident response |
| Vulnerability disclosed | P1 CRITICAL | Verify if real | Patch assessment |
| Threat/targeting | P1 CRITICAL | Threat assessment | Security alert |
| General discussion | P4 LOW | Document | Monitor |

Forum Monitoring Frequency:
| Forum Type | Check Frequency | Method |
|------------|-----------------|--------|
| Major data forums | Continuous | Automated |
| General hacking | Every 6 hours | Semi-automated |
| Specialized | Daily | Manual |
| New/emerging | Weekly | Discovery scan |

Threat Actor Tracking:
| Actor Type | Indicators | Alert On |
|------------|------------|----------|
| Known threat group | IOCs, TTPs | Activity related to sector |
| Initial access broker | Known handles | Listings in target geography |
| Ransomware affiliate | Known handles | Target industry mentions |
| Data seller | Pattern matching | Domain/company matches |

□ Forums identified: [count]
□ Keywords configured: [count]
□ Alert rules: [set]
□ Threat actors: [tracking enabled]
```

### 4. Marketplace Monitoring

Configure dark web marketplace monitoring:

```
MARKETPLACE MONITORING
======================

Marketplace Categories:
| Category | Markets | Priority | Products of Concern |
|----------|---------|----------|---------------------|
| Data markets | [markets] | P1 CRITICAL | Credentials, PII |
| Access markets | [markets] | P1 CRITICAL | RDP, VPN, shells |
| Fraud markets | [markets] | P2 HIGH | Cards, accounts |
| Counterfeit | [markets] | P3 MEDIUM | Branded goods |
| Services | [markets] | P2 HIGH | Hacking services |

Listing Alert Rules:
| Listing Type | Keywords | Priority | Action |
|--------------|----------|----------|--------|
| Company database | [company], [domain] | P1 CRITICAL | Immediate investigation |
| Access for sale | [company], [domain], [IP range] | P1 CRITICAL | Incident response |
| Credentials | [domain] emails | P1 CRITICAL | Password reset |
| Source code | [company], [product] | P2 HIGH | IP investigation |
| Internal docs | [company], [product] | P2 HIGH | Leak assessment |
| Counterfeit products | [brand names] | P3 MEDIUM | Brand protection |

Product Monitoring Patterns:
| Pattern | Detection Method | Alert |
|---------|------------------|-------|
| "[company]" + (database OR dump OR leak) | Keyword search | P1 |
| "[domain]" + (access OR credentials) | Keyword search | P1 |
| VPN/RDP + [company geography] | Pattern match | P2 |
| Ransomware + [industry] | Pattern match | P2 |

Pricing Intelligence:
| Product Type | Typical Price | Premium If | Significance |
|--------------|---------------|------------|--------------|
| Database | $100-10,000+ | Fresh, exclusive | Scale of breach |
| RDP access | $5-50 | Admin, high value | Targeted attack |
| VPN access | $50-500 | Corporate, full | Targeted attack |
| Initial access | $1,000-50,000+ | Large enterprise | Imminent ransomware |
| Source code | $500-10,000+ | Product value | IP theft |

Marketplace Monitoring Tools:
| Tool | Coverage | Automation | Cost |
|------|----------|------------|------|
| DarkOwl | Comprehensive | High | $$$ |
| Flashpoint | Curated intel | High | $$$ |
| Recorded Future | Multi-source | High | $$$ |
| Manual monitoring | Selective | Low | Time |

□ Marketplaces identified: [count]
□ Listing patterns: [configured]
□ Alert rules: [set]
□ Tools integrated: [count]
```

### 5. Credential Dump Detection

Configure credential leak detection:

```
CREDENTIAL DUMP DETECTION
=========================

Credential Monitoring Scope:
| Domain | Priority | Estimated Users | Monitoring |
|--------|----------|-----------------|------------|
| @[company.com] | P1 CRITICAL | [count] | Continuous |
| @[subsidiary.com] | P1 CRITICAL | [count] | Continuous |
| @[partner.com] | P2 HIGH | N/A | Alert on match |

Paste Site Monitoring:
| Site | Check Frequency | Method | Coverage |
|------|-----------------|--------|----------|
| Pastebin | Continuous | API | Public pastes |
| Ghostbin | Hourly | Crawler | Public pastes |
| JustPaste.it | Hourly | Crawler | Public pastes |
| PrivateBin instances | Daily | Search engines | Indexed pastes |
| Github Gists | Hourly | API | Public gists |

Credential Alert Tiers:
| Tier | Condition | Priority | Response |
|------|-----------|----------|----------|
| Tier 1 | Single credential found | P2 HIGH | Individual reset, monitor |
| Tier 2 | 2-10 credentials | P2 HIGH | Team reset, investigation |
| Tier 3 | 11-100 credentials | P1 CRITICAL | Department reset, incident |
| Tier 4 | 100+ credentials | P1 CRITICAL | Full incident response |

Credential Context Analysis:
| Context | Significance | Additional Action |
|---------|--------------|-------------------|
| Standalone dump | Isolated exposure | Standard reset |
| Part of larger breach | Widespread exposure | Enhanced monitoring |
| Combo list | Credential stuffing | Block attempts |
| Targeted leak | Deliberate attack | Threat investigation |
| Infostealer log | Malware infection | Endpoint investigation |

Infostealer Log Detection:
| Indicator | Significance | Priority |
|-----------|--------------|----------|
| Corporate URL in log | Employee infected | P1 CRITICAL |
| SSO/IAM URLs | Identity system exposed | P1 CRITICAL |
| VPN/RDP URLs | Remote access exposed | P1 CRITICAL |
| Cloud service URLs | Cloud accounts exposed | P1 CRITICAL |

Response Automation:
| Detection | Automated Action | Manual Follow-up |
|-----------|------------------|------------------|
| Single credential | Alert, flag account | Forced reset |
| Bulk credentials | Alert, quarantine report | Mass reset planning |
| Infostealer detection | Alert, endpoint scan trigger | Investigation |
| Access sale | Alert, access audit | Emergency response |

□ Domains configured: [count]
□ Paste sites: [monitoring active]
□ Alert tiers: [defined]
□ Response automation: [configured]
```

### 6. Dark Web Monitoring Summary

Compile final monitoring configuration:

```
DARK WEB MONITORING SUMMARY
===========================

Monitoring Coverage:
| Category | Sources | Automation | Alert Rules |
|----------|---------|------------|-------------|
| Breach databases | [count] | High | [count] |
| Forums | [count] | Medium | [count] |
| Marketplaces | [count] | Medium | [count] |
| Paste sites | [count] | High | [count] |
| Credential leaks | [count services] | High | [count tiers] |

Identifier Coverage:
| Type | Count | Priority | Sources |
|------|-------|----------|---------|
| Domains | [count] | P1 | All |
| Email domains | [count] | P1 | All |
| Company names | [count] | P2 | All |
| Personnel names | [count] | P2 | Forums, markets |
| Brand names | [count] | P3 | Markets |

Alert Priority Distribution:
| Priority | Alert Types | Response Time |
|----------|-------------|---------------|
| P1 CRITICAL | Credential leaks, access sales, breaches | Immediate |
| P2 HIGH | Forum mentions, targeted threats | < 1 hour |
| P3 MEDIUM | Brand abuse, counterfeit | < 24 hours |
| P4 LOW | General industry chatter | Weekly digest |

Monitoring Stack:
| Layer | Tools/Services | Status |
|-------|---------------|--------|
| Breach detection | [tools] | [active/pending] |
| Forum monitoring | [tools] | [active/pending] |
| Marketplace | [tools] | [active/pending] |
| Paste sites | [tools] | [active/pending] |
| Integration | [SIEM/ticketing] | [active/pending] |

MONITORING CONFIGURATION COMPLETE
==================================

Total Configuration:
| Domain | Monitoring Status | Alert Rules | Priority |
|--------|------------------|-------------|----------|
| Infrastructure | Active | [count] | Technical |
| Corporate | Active | [count] | Business |
| Social | Active | [count] | Reputation |
| Dark Web | Active | [count] | Threat |

Notification Summary:
| Channel | P1 | P2 | P3 | P4 | P5 |
|---------|----|----|----|----|-----|
| Phone | ✓ | | | | |
| SMS | ✓ | ✓ | | | |
| Slack | ✓ | ✓ | ✓ | | |
| Email | ✓ | ✓ | ✓ | ✓ | ✓ |

Escalation Chain:
| Level | Contact | Trigger |
|-------|---------|---------|
| L1 | On-call analyst | Any P1-P3 |
| L2 | Intel Lead | P1, unacked P2 |
| L3 | Security Director | Confirmed incident |
| L4 | Executive | Active threat |
```

---

## WORKFLOW OUTPUT

```markdown
## TRIPWIRE MONITORING CONFIGURATION COMPLETE

### Monitoring Domains

**Infrastructure Monitoring** (Step 2 - Resolver)
- Primary domains: [count]
- Subdomains: [count] discovered, continuous discovery active
- DNS changes: Monitored at [frequency]
- Certificates: CT log monitoring active

**Corporate Registry Monitoring** (Step 3 - Proxy)
- Entities: [count] across [count] jurisdictions
- Officer changes: Alert configured
- Filings: [types] monitored
- M&A activity: Tracked

**Social Monitoring** (Step 4 - Echo)
- Accounts: [count] across [count] platforms
- Keywords: [count] monitored
- Sentiment: Baseline established, alerts configured
- New accounts: Detection patterns active

**Dark Web Monitoring** (Step 5 - Shadow)
- Breach databases: [count] services integrated
- Forums: [count] monitored
- Marketplaces: [count] tracked
- Credentials: Continuous monitoring for [count] domains

### Alert Configuration

| Priority | Count | Response Time | Channels |
|----------|-------|---------------|----------|
| P1 CRITICAL | [count] | Immediate | Phone, SMS, Slack |
| P2 HIGH | [count] | < 1 hour | SMS, Slack, Email |
| P3 MEDIUM | [count] | < 24 hours | Slack, Email |
| P4 LOW | [count] | Daily digest | Email |
| P5 INFO | [count] | Weekly digest | Email |

### Escalation

- L1: On-call analyst (initial response)
- L2: Intel Lead (escalation)
- L3: Security Director (incidents)
- L4: Executive (active threats)

### Recommended Actions

1. **Test Alerts**: Run test notifications through all channels
2. **Validate Coverage**: Confirm all identifiers are monitored
3. **Document Procedures**: Distribute response playbooks
4. **Schedule Reviews**: Monthly configuration audit
5. **Train Responders**: Brief on-call rotation

### Output Artifacts

- Monitoring Configuration Document
- Alert Rules Matrix
- Escalation Procedures
- Dashboard Setup Guide (if applicable)
```

---

## COMPLETION CRITERIA

Workflow complete when:
- [ ] Monitoring strategy defined
- [ ] Infrastructure monitoring active
- [ ] Corporate registry monitoring active
- [ ] Social monitoring active
- [ ] Dark web monitoring active
- [ ] All alert rules configured
- [ ] Escalation procedures documented
- [ ] Test alerts verified

---

## MENU OPTIONS

**[E] Export** - Export full monitoring configuration
**[T] Test** - Run test alerts through channels
**[D] Dashboard** - Configure monitoring dashboard
**[R] Review** - Schedule configuration review

---

## WORKFLOW COMPLETE

Tripwire monitoring configuration complete.

Recommended follow-on:
- Test all notification channels
- Brief on-call team on procedures
- Integrate with incident response workflow
- Schedule quarterly configuration review
- Consider **The Synthesis** for alert correlation

