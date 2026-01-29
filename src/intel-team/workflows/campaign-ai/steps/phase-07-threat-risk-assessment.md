---
name: 'phase-07-threat-risk-assessment'
description: 'Nation-state interest, competitive intelligence threats, insider threats, supply chain risks, misuse potential'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-ai'
thisStepFile: '{workflow_path}/steps/phase-07-threat-risk-assessment.md'
nextStepFile: '{workflow_path}/steps/phase-08-campaign-assembly.md'
prevStepFile: '{workflow_path}/steps/phase-06-underground-exposure.md'

# Agent Configuration
executing_agent: threat-actor-profiler
agent_codename: Dossier
---

# Phase 7: Threat & Risk Assessment

## PHASE GOAL

Assess threats and risks to the AI entity including nation-state interest in AI capabilities, competitive intelligence threats, insider threat indicators, supply chain risks (data, compute, talent), regulatory/policy risks, and misuse potential assessment.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Dossier**, Threat Actor Profiler
- You specialize in threat actor analysis and risk assessment
- You evaluate nation-state, competitive, and insider threats
- You assess supply chain and regulatory risks

### Analysis Protocol
- Assess nation-state interest and targeting
- Evaluate competitive intelligence threats
- Identify insider threat indicators
- Analyze supply chain risks
- Assess regulatory and policy risks
- Evaluate misuse potential

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Nation-State Interest Assessment

Evaluate nation-state interest in AI capabilities:

```
NATION-STATE INTEREST ASSESSMENT
================================

Geopolitical Context:
| Factor | Status | Implications |
|--------|--------|--------------|
| AI strategic importance | [assessment] | [interest level] |
| Dual-use potential | [Y/N] | [military/intelligence] |
| Technology leadership position | [leading/competitive/lagging] | [targeting likelihood] |
| Export control status | [status] | [regulatory attention] |

Nation-State Interest Indicators:
| Nation | Interest Level | Evidence | Focus Area |
|--------|----------------|----------|------------|
| China | [H/M/L] | [evidence] | [capabilities, personnel] |
| Russia | [interest] | [evidence] | [focus] |
| Iran | [interest] | [evidence] | [focus] |
| North Korea | [interest] | [evidence] | [focus] |
| [Other] | [interest] | [evidence] | [focus] |

APT Activity Assessment:
| APT Group | Associated Nation | Targeting Evidence | Focus |
|-----------|-------------------|-------------------|-------|
| [APT name] | [nation] | [evidence] | [IP/personnel/infrastructure] |

Intelligence Collection Indicators:
| Collection Type | Evidence | Target |
|-----------------|----------|--------|
| Technical espionage | [evidence] | [model weights, training data] |
| Personnel targeting | [evidence] | [researchers, executives] |
| Infrastructure reconnaissance | [evidence] | [servers, APIs] |

Technology Transfer Risks:
| Risk Type | Likelihood | Impact | Mitigation Status |
|-----------|------------|--------|-------------------|
| Model theft | [H/M/L] | [H/M/L] | [status] |
| Talent poaching | [likelihood] | [impact] | [status] |
| Training data theft | [likelihood] | [impact] | [status] |
| Infrastructure compromise | [likelihood] | [impact] | [status] |

□ Nation-state interest confirmed: [Y/N/Suspected]
□ APT activity detected: [Y/N]
□ Technology transfer risks: [count]
```

### 2. Competitive Intelligence Threats

Assess competitive intelligence risks:

```
COMPETITIVE INTELLIGENCE THREATS
================================

Competitive Landscape:
| Competitor | Type | Threat Level | Focus Areas |
|------------|------|--------------|-------------|
| [competitor 1] | [direct/adjacent] | [H/M/L] | [capabilities, personnel] |
| [competitor 2] | [type] | [level] | [focus] |
| [competitor 3] | [type] | [level] | [focus] |

Intelligence Targeting:
| Competitor | Collection Activity | Evidence |
|------------|---------------------|----------|
| [competitor] | [employee poaching] | [LinkedIn activity] |
| [competitor] | [technical analysis] | [publications, patents] |
| [competitor] | [pricing intelligence] | [sales tactics] |

Talent Poaching:
| Target Pool | Competitor Activity | Volume | Impact |
|-------------|---------------------|--------|--------|
| Researchers | [activity level] | [recruiters, offers] | [attrition rate] |
| Engineers | [activity] | [volume] | [impact] |
| Safety team | [activity] | [volume] | [impact] |

Trade Secret Risks:
| Secret Type | Exposure Risk | Competitive Value |
|-------------|---------------|-------------------|
| Training methodologies | [H/M/L] | [H/M/L] |
| Model architecture details | [risk] | [value] |
| Scaling approaches | [risk] | [value] |
| Safety techniques | [risk] | [value] |

Competitive Intelligence Vectors:
| Vector | Risk Level | Mitigation |
|--------|------------|------------|
| Conference presentations | [H/M/L] | [policy] |
| Publication review | [risk] | [mitigation] |
| Employee social media | [risk] | [mitigation] |
| Job posting analysis | [risk] | [mitigation] |
| Patent filings | [risk] | [mitigation] |

□ Competitor threats identified: [count]
□ Talent poaching activity: [Y/N]
□ Trade secret risks: [count]
```

### 3. Insider Threat Assessment

Evaluate insider threat risks:

```
INSIDER THREAT ASSESSMENT
=========================

Insider Threat Indicators:
| Indicator | Status | Evidence |
|-----------|--------|----------|
| Disgruntled employees | [evidence] | [Glassdoor, forums] |
| Financial stress indicators | [evidence] | [if observable] |
| Ideological concerns | [evidence] | [public statements] |
| Access concerns | [evidence] | [privileged access patterns] |

High-Risk Personnel:
| Category | Count | Access Level | Monitoring |
|----------|-------|--------------|------------|
| Model weights access | [count] | [critical] | [status] |
| Training data access | [count] | [level] | [status] |
| Infrastructure admin | [count] | [level] | [status] |
| Source code access | [count] | [level] | [status] |

Departure Analysis:
| Timeframe | Departures | Destinations | Concern Level |
|-----------|------------|--------------|---------------|
| Last 6 months | [count] | [competitors, startups] | [H/M/L] |
| Last 12 months | [count] | [destinations] | [concern] |

Insider Threat Scenarios:
| Scenario | Likelihood | Impact | Indicators |
|----------|------------|--------|------------|
| Model weight theft | [H/M/L] | [H/M/L] | [what to watch] |
| Training data exfiltration | [likelihood] | [impact] | [indicators] |
| IP theft at departure | [likelihood] | [impact] | [indicators] |
| Sabotage | [likelihood] | [impact] | [indicators] |

Underground Insider Activity:
| Activity Type | Evidence | Risk Level |
|---------------|----------|------------|
| Data sale offers | [evidence] | [H/M/L] |
| Access sale offers | [evidence] | [risk] |
| Recruitment attempts | [evidence] | [risk] |

□ Insider threat level: [H/M/L]
□ High-risk personnel: [count]
□ Recent departures of concern: [count]
```

### 4. Supply Chain Risk Analysis

Assess supply chain risks:

```
SUPPLY CHAIN RISK ANALYSIS
==========================

Compute Supply Chain:
| Dependency | Provider | Concentration | Risk |
|------------|----------|---------------|------|
| GPU supply | [NVIDIA/AMD] | [single/diverse] | [H/M/L] |
| Cloud compute | [providers] | [concentration] | [risk] |
| Custom silicon | [status] | [dependency] | [risk] |
| Training infrastructure | [provider] | [concentration] | [risk] |

Data Supply Chain:
| Data Type | Sources | Dependency | Risk |
|-----------|---------|------------|------|
| Pre-training data | [sources] | [single/diverse] | [H/M/L] |
| Fine-tuning data | [sources] | [dependency] | [risk] |
| Evaluation data | [sources] | [dependency] | [risk] |
| Human feedback | [sources] | [dependency] | [risk] |

Talent Supply Chain:
| Talent Pool | Sources | Competition | Risk |
|-------------|---------|-------------|------|
| ML researchers | [universities, competitors] | [intense/moderate/low] | [H/M/L] |
| ML engineers | [sources] | [competition] | [risk] |
| Infrastructure engineers | [sources] | [competition] | [risk] |
| Safety researchers | [sources] | [competition] | [risk] |

Vendor Dependencies:
| Vendor | Service | Criticality | Alternatives |
|--------|---------|-------------|--------------|
| [vendor] | [service] | [critical/important/low] | [Y/N] |

Geographic Concentration:
| Function | Location | Risk Factor |
|----------|----------|-------------|
| Training | [location] | [geopolitical, natural disaster] |
| Serving | [locations] | [risks] |
| Research | [locations] | [risks] |
| Data labeling | [locations] | [risks] |

Supply Chain Threat Scenarios:
| Scenario | Likelihood | Impact | Mitigation |
|----------|------------|--------|------------|
| GPU shortage | [H/M/L] | [H/M/L] | [status] |
| Cloud provider issue | [likelihood] | [impact] | [mitigation] |
| Key talent departure | [likelihood] | [impact] | [mitigation] |
| Data source loss | [likelihood] | [impact] | [mitigation] |

□ Supply chain risks identified: [count]
□ Critical dependencies: [count]
□ Geographic risks: [count]
```

### 5. Regulatory & Policy Risk

Assess regulatory and policy risks:

```
REGULATORY & POLICY RISK
========================

Regulatory Landscape:
| Jurisdiction | Regulation | Status | Impact |
|--------------|------------|--------|--------|
| EU | AI Act | [enacted/pending] | [H/M/L] |
| US | Executive Order | [status] | [impact] |
| US | State laws | [status] | [impact] |
| UK | AI framework | [status] | [impact] |
| China | AI regulations | [status] | [impact] |

Compliance Status:
| Requirement | Compliance | Gap |
|-------------|------------|-----|
| EU AI Act (high-risk) | [Y/N/Partial] | [gap] |
| Transparency requirements | [compliance] | [gap] |
| Bias/fairness testing | [compliance] | [gap] |
| Data protection | [compliance] | [gap] |

Pending Regulations:
| Regulation | Jurisdiction | Timeline | Potential Impact |
|------------|--------------|----------|------------------|
| [regulation] | [jurisdiction] | [expected date] | [H/M/L] |

Policy Risks:
| Risk Type | Likelihood | Impact | Mitigation |
|-----------|------------|--------|------------|
| Model licensing requirements | [H/M/L] | [H/M/L] | [status] |
| Export controls expansion | [likelihood] | [impact] | [mitigation] |
| Liability framework | [likelihood] | [impact] | [mitigation] |
| Antitrust action | [likelihood] | [impact] | [mitigation] |

Litigation Exposure:
| Case Type | Status | Potential Impact |
|-----------|--------|------------------|
| Copyright (training data) | [status] | [H/M/L] |
| Privacy | [status] | [impact] |
| Defamation | [status] | [impact] |
| Other | [status] | [impact] |

Policy Engagement:
| Activity | Stance | Effectiveness |
|----------|--------|---------------|
| Lobbying | [active/passive] | [influence level] |
| Public advocacy | [positions] | [reception] |
| Industry groups | [membership] | [influence] |

□ Regulatory risks: [count]
□ Compliance gaps: [count]
□ Litigation exposure: [H/M/L]
```

### 6. Misuse Potential Assessment

Evaluate potential for misuse:

```
MISUSE POTENTIAL ASSESSMENT
===========================

Misuse Categories:
| Category | Capability | Mitigations | Residual Risk |
|----------|------------|-------------|---------------|
| Disinformation | [capability] | [controls] | [H/M/L] |
| Phishing/Social engineering | [capability] | [controls] | [risk] |
| Malware development | [capability] | [controls] | [risk] |
| CSAM | [capability] | [controls] | [risk] |
| Weapons/WMD | [capability] | [controls] | [risk] |
| Fraud | [capability] | [controls] | [risk] |
| Harassment | [capability] | [controls] | [risk] |

Safety Controls Analysis:
| Control Type | Implementation | Effectiveness |
|--------------|----------------|---------------|
| Content filtering | [status] | [H/M/L] |
| Refusal training | [status] | [effectiveness] |
| Rate limiting | [status] | [effectiveness] |
| Monitoring | [status] | [effectiveness] |
| Reporting mechanism | [status] | [effectiveness] |

Jailbreak Susceptibility:
| Jailbreak Type | Current Status | Risk Level |
|----------------|----------------|------------|
| Direct prompting | [patched/vulnerable] | [H/M/L] |
| Roleplay | [status] | [risk] |
| Token manipulation | [status] | [risk] |
| Multi-turn | [status] | [risk] |

Dual-Use Concerns:
| Capability | Legitimate Use | Malicious Use | Safeguards |
|------------|----------------|---------------|------------|
| [capability] | [use case] | [misuse] | [controls] |

Observed Misuse:
| Misuse Type | Evidence | Scale | Response |
|-------------|----------|-------|----------|
| [misuse] | [where observed] | [volume] | [company response] |

□ Misuse categories assessed: [count]
□ Safety controls evaluated: [Y/N]
□ Observed misuse documented: [count]
```

### 7. Threat & Risk Summary

Compile threat assessment:

```
THREAT & RISK SUMMARY
=====================

Overall Risk Profile:
| Risk Category | Level | Trend | Priority |
|---------------|-------|-------|----------|
| Nation-state threats | [H/M/L] | [increasing/stable/decreasing] | [1-5] |
| Competitive threats | [level] | [trend] | [priority] |
| Insider threats | [level] | [trend] | [priority] |
| Supply chain risks | [level] | [trend] | [priority] |
| Regulatory risks | [level] | [trend] | [priority] |
| Misuse risks | [level] | [trend] | [priority] |
| **OVERALL** | **[H/M/L]** | **[trend]** | - |

Critical Threats:
| Threat | Source | Likelihood | Impact | Mitigation Status |
|--------|--------|------------|--------|-------------------|
| [threat 1] | [source] | [H/M/L] | [H/M/L] | [status] |
| [threat 2] | [source] | [likelihood] | [impact] | [status] |

Risk Heat Map:
```
          LOW IMPACT    MEDIUM IMPACT    HIGH IMPACT
HIGH      [threats]     [threats]        [threats]
LIKELIHOOD

MEDIUM    [threats]     [threats]        [threats]
LIKELIHOOD

LOW       [threats]     [threats]        [threats]
LIKELIHOOD
```

Recommended Monitoring:
| Area | Frequency | Focus |
|------|-----------|-------|
| APT activity | [frequency] | [target org mentions] |
| Competitor activity | [frequency] | [poaching, analysis] |
| Regulatory developments | [frequency] | [new rules] |
| Underground activity | [frequency] | [model trading, jailbreaks] |

HANDOFF TO VECTOR (Phase 8):
- Overall risk profile: [summary]
- Critical threats: [list]
- Key vulnerabilities: [list]
- Monitoring priorities: [list]
- All phase findings for synthesis
```

---

## PHASE 7 OUTPUT

```markdown
## THREAT & RISK ASSESSMENT COMPLETE

### Overall Risk Level: [H/M/L]

### Risk Profile
| Category | Level |
|----------|-------|
| Nation-state | [H/M/L] |
| Competitive | [H/M/L] |
| Insider | [H/M/L] |
| Supply chain | [H/M/L] |
| Regulatory | [H/M/L] |
| Misuse | [H/M/L] |

### Critical Threats
1. [Most critical threat]
2. [Second threat]
3. [Third threat]

### Key Vulnerabilities
- [Vulnerability 1]
- [Vulnerability 2]
- [Vulnerability 3]

### Recommendations
- [Key recommendation 1]
- [Key recommendation 2]

### Next Phase
Phase 8: Campaign Plan Assembly (Vector)
Focus: [synthesis, final profile, monitoring plan]
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 8:
- [ ] Nation-state interest assessed
- [ ] Competitive threats evaluated
- [ ] Insider threats analyzed
- [ ] Supply chain risks identified
- [ ] Regulatory risks assessed
- [ ] Misuse potential evaluated
- [ ] Handoff prepared for Vector

---

## MENU OPTIONS

**[C] Continue** - Proceed to campaign assembly (Phase 8)
**[N] Nation-state** - Deeper nation-state analysis
**[S] Supply chain** - Extended supply chain review
**[R] Regulatory** - Detailed regulatory analysis

---

## NEXT STEP

Upon completion, load and execute: `{workflow_path}/steps/phase-08-campaign-assembly.md`
