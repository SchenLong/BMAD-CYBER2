---
name: 'phase-06-underground-exposure'
description: 'Credential exposures, data breaches, underground AI model trading, jailbreak markets, leaks'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-ai'
thisStepFile: '{workflow_path}/steps/phase-06-underground-exposure.md'
nextStepFile: '{workflow_path}/steps/phase-07-threat-risk-assessment.md'
prevStepFile: '{workflow_path}/steps/phase-05-personnel-organization.md'

# Agent Configuration
executing_agent: dark-web-analyst
agent_codename: Shadow
---

# Phase 6: Underground & Exposure Analysis

## PHASE GOAL

Assess the AI entity's exposure in underground channels including credential breaches, internal document leaks, underground AI model trading, jailbreak/prompt injection markets, and leaked model weights or checkpoints.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Shadow**, Dark Web Analyst
- You specialize in DARKINT and underground source exploitation
- You assess exposure in breach databases and dark web markets
- You track AI-specific underground activity

### Analysis Protocol
- Search for credential exposures
- Assess data breach impact
- Monitor underground AI model trading
- Track jailbreak/prompt injection markets
- Identify leaked internal documents and model weights

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Credential Exposure Assessment

Search for exposed credentials:

```
CREDENTIAL EXPOSURE ASSESSMENT
==============================

Domain Breach Search:
| Domain | Breaches Found | Records | Severity |
|--------|----------------|---------|----------|
| [domain.ai] | [breach list] | [count] | [H/M/L] |
| [company.com] | [breaches] | [count] | [severity] |

Breach Details:
| Breach | Date | Data Types | Org Records | Status |
|--------|------|------------|-------------|--------|
| [breach name] | [date] | [email/pwd/etc] | [count] | [stale/current] |

High-Risk Credential Exposure:
| Name | Role | Email | Breaches | Password Exposed | Current? |
|------|------|-------|----------|------------------|----------|
| [executive] | [role] | [email] | [count] | [Y/N] | [Y/N] |
| [researcher] | [role] | [email] | [count] | [Y/N] | [Y/N] |

Email Format Discovery:
| Domain | Email Format | Confidence |
|--------|--------------|------------|
| [domain] | [first.last@domain] | [H/M/L] |

Credential Patterns:
| Pattern Type | Occurrences | Risk |
|--------------|-------------|------|
| Company name in password | [count] | [guessability] |
| Common patterns | [count] | [predictability] |
| Reused across breaches | [count] | [credential stuffing] |

Third-Party Breach Exposure:
| Third Party | Breach | Org Data Exposed |
|-------------|--------|------------------|
| [vendor/partner] | [breach] | [what exposed] |

□ Total emails exposed: [count]
□ Passwords exposed: [count]
□ Executive exposure: [count]
□ Active risk level: [H/M/L]
```

### 2. Internal Document Leaks

Search for leaked internal documents:

```
INTERNAL DOCUMENT LEAKS
=======================

Document Leak Search:
| Source | Documents Found | Type | Date | Sensitivity |
|--------|-----------------|------|------|-------------|
| [paste sites] | [count] | [type] | [date] | [H/M/L] |
| [file sharing] | [count] | [type] | [date] | [sensitivity] |
| [underground forums] | [count] | [type] | [date] | [sensitivity] |

Leaked Document Analysis:
| Document Type | Content | Source | Intelligence Value |
|---------------|---------|--------|-------------------|
| Internal emails | [summary] | [where found] | [H/M/L] |
| Technical docs | [summary] | [source] | [value] |
| Strategy docs | [summary] | [source] | [value] |
| Financial docs | [summary] | [source] | [value] |
| Research papers (internal) | [summary] | [source] | [value] |

Code Leaks:
| Repository/Code | Content | Source | Date |
|-----------------|---------|--------|------|
| [description] | [what revealed] | [source] | [date] |

Internal Communication Leaks:
| Platform | Content Type | Date | Sensitivity |
|----------|--------------|------|-------------|
| [Slack/email/etc] | [topic] | [date] | [H/M/L] |

Leak Impact Assessment:
| Leak Category | Impact | Remediation Status |
|---------------|--------|-------------------|
| Credentials | [impact] | [addressed?] |
| Technical | [impact] | [status] |
| Business | [impact] | [status] |
| Strategic | [impact] | [status] |

□ Document leaks found: [count]
□ Code leaks: [count]
□ High-sensitivity leaks: [count]
```

### 3. Underground AI Model Trading

Monitor underground AI model markets:

```
UNDERGROUND AI MODEL TRADING
============================

Model Weight/Checkpoint Leaks:
| Model | Version | Source | Date | Availability |
|-------|---------|--------|------|--------------|
| [model name] | [version] | [forum/market] | [date] | [torrent/direct/etc] |

Leaked Model Analysis:
| Model | Complete? | Usable | Training Data Included |
|-------|-----------|--------|------------------------|
| [model] | [full/partial] | [Y/N] | [Y/N] |

Underground Fine-tuned Models:
| Base Model | Fine-tune Purpose | Source | Price |
|------------|-------------------|--------|-------|
| [model] | [uncensored/specific task] | [market] | [$] |

API Key/Access Trading:
| Service | Type | Price | Availability |
|---------|------|-------|--------------|
| [API] | [stolen keys/accounts] | [$X/month] | [forum] |

Model Piracy Indicators:
| Indicator | Evidence | Risk Level |
|-----------|----------|------------|
| Torrent trackers | [activity] | [H/M/L] |
| Direct downloads | [availability] | [risk] |
| Unauthorized hosting | [instances] | [risk] |

Underground Ecosystem:
| Actor Type | Activity | Scale |
|------------|----------|-------|
| Model pirates | [redistribution] | [volume] |
| Fine-tuners | [uncensored variants] | [volume] |
| API resellers | [access trading] | [volume] |

□ Model leaks found: [count]
□ Underground fine-tunes: [count]
□ API key trading: [Y/N]
```

### 4. Jailbreak & Prompt Injection Markets

Track jailbreak and prompt injection activity:

```
JAILBREAK & PROMPT INJECTION MARKETS
====================================

Jailbreak Marketplaces:
| Platform | Activity Level | Pricing | Focus |
|----------|----------------|---------|-------|
| [forum/market] | [active/moderate/low] | [free/paid] | [target models] |

Jailbreak Techniques for Target:
| Technique | Effectiveness | Patched | Source |
|-----------|---------------|---------|--------|
| [DAN variant] | [H/M/L] | [Y/N] | [forum] |
| [roleplay attack] | [effectiveness] | [status] | [source] |
| [token manipulation] | [effectiveness] | [status] | [source] |
| [multi-turn] | [effectiveness] | [status] | [source] |

System Prompt Extraction:
| Target | Extracted Content | Date | Method |
|--------|-------------------|------|--------|
| [product] | [partial/full] | [date] | [technique] |

Prompt Injection Services:
| Service | Offering | Price | Target |
|---------|----------|-------|--------|
| [service] | [injection development] | [$X] | [models] |

Bypass Discussions:
| Forum | Thread Count | Recent Activity | Topics |
|-------|--------------|-----------------|--------|
| [forum] | [count] | [activity level] | [focus areas] |

Safety Filter Bypass Trading:
| Bypass Type | Availability | Effectiveness | Price |
|-------------|--------------|---------------|-------|
| [category] | [forum/market] | [working/patched] | [$X] |

□ Active jailbreaks: [count]
□ System prompts extracted: [count]
□ Bypass services: [count]
```

### 5. Threat Actor Interest

Assess threat actor interest in the AI entity:

```
THREAT ACTOR INTEREST
=====================

Forum Mentions:
| Forum | Mention Type | Date | Threat Level |
|-------|--------------|------|--------------|
| [forum] | [targeting/discussion/offering] | [date] | [H/M/L] |

Mention Categories:
| Category | Count | Examples |
|----------|-------|----------|
| Attack planning | [count] | [context] |
| Vulnerability discussion | [count] | [context] |
| Data for sale | [count] | [context] |
| Access for sale | [count] | [context] |
| Malicious use discussion | [count] | [context] |

Access for Sale:
| Marketplace | Access Type | Price | Date |
|-------------|-------------|-------|------|
| [market] | [API/employee/infrastructure] | [$X] | [date] |

Initial Access Broker Activity:
| Broker | Listing | Target Verification |
|--------|---------|---------------------|
| [handle] | [access type] | [confirmed/alleged] |

Nation-State Interest Indicators:
| Indicator | Evidence | Assessment |
|-----------|----------|------------|
| APT targeting | [evidence] | [confirmed/suspected/none] |
| State media coverage | [coverage] | [positive/negative/neutral] |
| Policy attention | [mentions] | [regulatory/competitive] |

Malicious Use Cases:
| Use Case | Availability | Target Model |
|----------|--------------|--------------|
| Phishing generation | [tools available] | [model] |
| Malware development | [tools available] | [model] |
| Disinformation | [tools available] | [model] |
| CSAM | [tools available] | [model] |

□ Forum mentions: [count]
□ Access for sale: [Y/N]
□ Nation-state interest: [Y/N/Suspected]
```

### 6. Employee Underground Exposure

Assess employee-specific underground exposure:

```
EMPLOYEE UNDERGROUND EXPOSURE
=============================

Employee Credential Search:
| Employee | Role | Breaches | Exposed Data |
|----------|------|----------|--------------|
| [name] | [role] | [count] | [email/password/etc] |

High-Value Target Exposure:
| Target | Exposure Type | Risk Level | Urgency |
|--------|---------------|------------|---------|
| CEO | [exposure details] | [H/M/L] | [immediate/monitor] |
| CTO | [exposure] | [risk] | [urgency] |
| Key researcher | [exposure] | [risk] | [urgency] |

Personal Account Exposure:
| Employee | Personal Email | Breaches | Corporate Risk |
|----------|----------------|----------|----------------|
| [name] | [email] | [count] | [password reuse risk] |

Insider Threat Indicators:
| Indicator | Evidence | Risk Level |
|-----------|----------|------------|
| Disgruntled employee posts | [forums/Glassdoor] | [H/M/L] |
| Insider recruitment | [forum posts] | [risk] |
| Data theft offers | [marketplaces] | [risk] |

Former Employee Exposure:
| Former Employee | Current Status | Exposure Risk |
|-----------------|----------------|---------------|
| [name] | [still has access?] | [risk] |

□ Employee credentials exposed: [count]
□ High-value targets: [count]
□ Insider threat indicators: [Y/N]
```

### 7. Underground Exposure Summary

Compile underground findings:

```
UNDERGROUND EXPOSURE SUMMARY
============================

Exposure Overview:
| Category | Risk Level | Key Findings |
|----------|------------|--------------|
| Credential exposure | [H/M/L] | [summary] |
| Internal document leaks | [H/M/L] | [summary] |
| Model/weight leaks | [H/M/L] | [summary] |
| Jailbreak activity | [H/M/L] | [summary] |
| Threat actor interest | [H/M/L] | [summary] |
| Employee exposure | [H/M/L] | [summary] |
| **OVERALL** | **[H/M/L]** | **[summary]** |

Critical Exposures:
| Exposure | Severity | Immediate Action Required |
|----------|----------|---------------------------|
| [exposure 1] | [H] | [action] |
| [exposure 2] | [severity] | [action] |

Underground Activity Timeline:
| Date | Event | Category | Impact |
|------|-------|----------|--------|
| [date] | [event] | [category] | [impact] |

Threat Assessment:
| Threat Type | Likelihood | Impact | Overall Risk |
|-------------|------------|--------|--------------|
| Credential stuffing | [H/M/L] | [H/M/L] | [H/M/L] |
| Model theft | [likelihood] | [impact] | [risk] |
| Insider threat | [likelihood] | [impact] | [risk] |
| Targeted attack | [likelihood] | [impact] | [risk] |

Monitoring Recommendations:
| Area | Frequency | Focus |
|------|-----------|-------|
| Breach databases | [frequency] | [domains, personnel] |
| Underground forums | [frequency] | [mentions, offerings] |
| Model leak sites | [frequency] | [new leaks] |
| Jailbreak forums | [frequency] | [new techniques] |

HANDOFF TO DOSSIER (Phase 7):
- Threat actor indicators: [list]
- Nation-state interest signals: [list]
- Insider threat indicators: [list]
- Supply chain concerns: [from underground activity]
- Regulatory risk indicators: [from leaks, underground]
```

---

## PHASE 6 OUTPUT

```markdown
## UNDERGROUND EXPOSURE ANALYSIS COMPLETE

### Exposure Summary
| Category | Risk Level |
|----------|------------|
| Credentials | [H/M/L] |
| Document leaks | [H/M/L] |
| Model leaks | [H/M/L] |
| Jailbreaks | [H/M/L] |
| Threat actors | [H/M/L] |
| **OVERALL** | **[H/M/L]** |

### Critical Findings
1. [Most critical underground finding]
2. [Second finding]
3. [Third finding]

### Immediate Threats
- [Threat requiring immediate action]

### Credential Exposure
- Total exposed: [count]
- Executives: [count]
- Current employees: [count]

### Model/Code Leaks
- Model weights leaked: [Y/N]
- Internal code leaked: [Y/N]
- Documents leaked: [count]

### Next Phase
Phase 7: Threat & Risk Assessment (Dossier)
Focus: [nation-state interest, competitive threats, supply chain]
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 7:
- [ ] Credential exposure assessed
- [ ] Document leaks searched
- [ ] Model trading monitored
- [ ] Jailbreak markets reviewed
- [ ] Threat actor interest evaluated
- [ ] Handoff prepared for Dossier

---

## MENU OPTIONS

**[C] Continue** - Proceed to threat assessment (Phase 7)
**[B] Breaches** - Deeper breach analysis
**[J] Jailbreaks** - Extended jailbreak research
**[L] Leaks** - Additional leak investigation

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/phase-07-threat-risk-assessment.md`
