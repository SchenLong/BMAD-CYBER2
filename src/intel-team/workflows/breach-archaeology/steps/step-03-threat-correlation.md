---
name: 'step-03-threat-correlation'
description: 'Correlate breaches to threat actors, assess exploitation likelihood'
estimated_duration: '10-15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/breach-archaeology'
thisStepFile: '{workflow_path}/steps/step-03-threat-correlation.md'
nextStepFile: '{workflow_path}/steps/step-04-risk-assessment.md'
prevStepFile: '{workflow_path}/steps/step-02-exposure-scan.md'

# Agent Configuration
executing_agent: threat-actor-profiler
agent_codename: Dossier
---

# Step 3: Threat Correlation

## STEP GOAL

Correlate identified breaches to known threat actors, assess data trafficking patterns, and determine exploitation likelihood for the exposed data.

## EXECUTION TIME: ~10-15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Dossier**, Threat Actor Profiler
- You correlate breaches to threat actors
- You assess who has the data and what they'll do with it
- You determine exploitation likelihood

### Step-Specific Rules
- Link breaches to known threat actors where possible
- Assess data trading patterns
- Consider target profile for exploitation likelihood
- Document uncertainty clearly

---

## THREAT CORRELATION SEQUENCE

### 1. Breach Attribution Analysis

For each significant breach identified, assess attribution:

```
BREACH ATTRIBUTION TABLE
========================

| Breach | Known Attribution | Confidence | Actor Type |
|--------|-------------------|------------|------------|
| [Name] | [Actor/Group] | [High/Med/Low] | [Ransomware/APT/Hacktivism/Criminal] |
| [Name] | Unknown | - | [Type if known] |
| [Name] | [Actor] | [Confidence] | [Type] |

Attribution Criteria:
□ Public attribution by researchers
□ Actor claimed responsibility
□ TTP matches known actor
□ Infrastructure correlation
□ Timing correlation with known campaigns
```

### 2. Threat Actor Profiles

Create profiles for attributed actors:

```markdown
### THREAT ACTOR: [Name/Handle]

**Type:** [Ransomware Gang / APT / Hacktivists / Criminal Group / Individual]
**Origin:** [Country/Region if known]
**Active Since:** [Date]
**Current Status:** [Active / Disbanded / Rebranded]

**Associated Breaches in This Assessment:**
- [Breach 1] - [Date]
- [Breach 2] - [Date]

**Known Behaviors:**
- [Behavior 1 - e.g., sells data vs holds for extortion]
- [Behavior 2 - e.g., targets specific industries]
- [Behavior 3 - e.g., typical monetization approach]

**Data Handling Patterns:**
- Initial: [Extortion / Immediate sale / Private use]
- Secondary: [Public dump / Ongoing sales / Archive]
- Timeline: [Typical time from breach to public release]

**Current Threat Level:** [HIGH / MEDIUM / LOW]
```

### 3. Data Trafficking Assessment

Analyze how the exposed data is being trafficked:

```
DATA TRAFFICKING ANALYSIS
=========================

Immediate Post-Breach (0-30 days):
□ Private sale to targeted buyers
□ Extortion attempts
□ Limited distribution
□ Unknown/No evidence

Short-term (1-6 months):
□ Sale on dark web markets
□ Shared in closed communities
□ Added to combo lists
□ Unknown/No evidence

Long-term (6+ months):
□ Wide public distribution
□ Recycled in new breaches
□ Added to aggregate databases
□ Still actively traded
□ Dormant/archived

Current Distribution Status:
[Assessment of where data currently resides]
```

### 4. Targeting Assessment

Determine if the target is specifically interesting to threat actors:

```
TARGETING ASSESSMENT
====================

Target Profile:
- Industry: [sector]
- Organization size: [size]
- Geographic location: [region]
- Role/Position: [if individual]
- Public profile: [high/medium/low]

Targeting Risk Factors:

HIGH RISK (increases exploitation likelihood):
□ Executive/leadership position
□ Financial sector employment
□ Government/defense affiliation
□ High net worth indicators
□ Access to sensitive systems
□ Public/political profile

MEDIUM RISK:
□ Technology sector employment
□ Healthcare sector
□ Legal/professional services
□ Known cryptocurrency holdings
□ Active social media presence

LOW RISK:
□ General consumer
□ No specific targeting indicators
□ Low-value data exposure

Overall Targeting Risk: [HIGH / MEDIUM / LOW]
```

### 5. Exploitation Likelihood Matrix

Assess likelihood that exposed data will be exploited:

```
EXPLOITATION LIKELIHOOD MATRIX
==============================

| Data Type | Already Exploited? | Future Exploitation | Likelihood |
|-----------|-------------------|---------------------|------------|
| Credentials (current) | [Evidence] | Account takeover | CRITICAL |
| Credentials (old) | [Evidence] | Password reuse attacks | HIGH |
| PII (SSN, DOB) | [Evidence] | Identity theft/fraud | HIGH |
| Financial data | [Evidence] | Direct financial fraud | CRITICAL |
| Corporate data | [Evidence] | Competitive/espionage | MEDIUM |
| Contact info only | [Evidence] | Phishing/spam | LOW |

Exploitation Evidence:
□ Known unauthorized access attempts
□ Fraud reports linked to breach
□ Credentials in active use by actors
□ Data actively being sold
□ No exploitation evidence found
```

### 6. Threat Timeline

Create timeline correlating breaches with threat activity:

```
THREAT TIMELINE
===============

[Date 1] - Breach A occurs
    └── Actor: [name]
    └── Data: [types]
    └── Status: [current status]

[Date 2] - Data from Breach A appears on [marketplace]
    └── Price: [if known]
    └── Buyer interest: [if known]

[Date 3] - Breach B occurs
    └── Actor: [name]
    └── Data: [types]
    └── Status: [current status]

[Date 4] - Combo list containing target data released
    └── Source: [origin]
    └── Distribution: [scope]

[Current] - Assessment date
    └── Active threats: [list]
    └── Data status: [summary]
```

---

## THREAT CORRELATION OUTPUT

```markdown
## THREAT CORRELATION SUMMARY

### Attribution Summary
- **Breaches with known attribution:** [X] of [Y]
- **Attributed threat actors:** [count]
- **Highest-risk actor:** [name] - [reason]

### Threat Actor Involvement
| Actor | Breaches | Actor Type | Current Status | Risk |
|-------|----------|------------|----------------|------|
| [Name] | [count] | [type] | [status] | [level] |

### Data Trafficking Status
- **Current distribution:** [Limited / Moderate / Wide]
- **Active trading:** [Yes / No / Unknown]
- **Exploitation evidence:** [Description]

### Exploitation Assessment
| Risk Level | Data Types | Recommended Priority |
|------------|------------|---------------------|
| CRITICAL | [types] | Immediate action |
| HIGH | [types] | Short-term action |
| MEDIUM | [types] | Monitor |
| LOW | [types] | Awareness only |

### Key Threat Insights
1. [Insight about actor/threat]
2. [Insight about data status]
3. [Insight about targeting]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 4:
- [ ] All significant breaches attributed (or noted as unknown)
- [ ] Threat actor profiles created
- [ ] Data trafficking assessed
- [ ] Targeting risk evaluated
- [ ] Exploitation likelihood determined
- [ ] Threat timeline constructed

---

## MENU OPTIONS

**[C] Continue** - Proceed to risk assessment (Step 4)
**[D] Deep Dive** - More research on specific actor
**[T] Timeline** - Expand threat timeline detail
**[R] Review** - Review correlation findings

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-04-risk-assessment.md`
