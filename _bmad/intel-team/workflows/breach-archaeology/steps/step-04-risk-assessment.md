---
name: 'step-04-risk-assessment'
description: 'Generate actionable risk assessment and remediation recommendations'
estimated_duration: '10-15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/breach-archaeology'
thisStepFile: '{workflow_path}/steps/step-04-risk-assessment.md'
prevStepFile: '{workflow_path}/steps/step-03-threat-correlation.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 4: Risk Assessment & Recommendations

## STEP GOAL

Synthesize all findings into a comprehensive risk assessment with prioritized remediation actions, actionable intelligence summary, and ongoing monitoring recommendations.

## EXECUTION TIME: ~10-15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, OSINT Lead
- You synthesize findings from all previous steps
- You produce the final actionable intelligence report
- You prioritize recommendations by urgency and impact

### Step-Specific Rules
- Review ALL findings from Steps 1-3
- Calculate composite risk scores
- Prioritize actions by criticality
- Provide specific, actionable recommendations
- Include monitoring requirements

---

## RISK ASSESSMENT SEQUENCE

### 1. Composite Risk Calculation

Combine findings into overall risk profile:

```
COMPOSITE RISK MATRIX
=====================

Exposure Factors (from Step 2):
□ Breach count: [X] breaches
□ Data types exposed: [list]
□ Time since earliest exposure: [duration]
□ Active credential risk: [Yes/No]
□ PII exposure level: [Critical/High/Medium/Low]
□ Financial data exposure: [Yes/No]

Threat Factors (from Step 3):
□ Known threat actor involvement: [Yes/No]
□ Data actively being traded: [Yes/No]
□ Targeting risk level: [High/Medium/Low]
□ Exploitation evidence: [Yes/No]

Scoring:
| Factor | Weight | Score (1-10) | Weighted |
|--------|--------|--------------|----------|
| Breach recency | 0.20 | [score] | [weighted] |
| Data sensitivity | 0.25 | [score] | [weighted] |
| Credential exposure | 0.20 | [score] | [weighted] |
| Threat actor activity | 0.15 | [score] | [weighted] |
| Active exploitation | 0.20 | [score] | [weighted] |

COMPOSITE RISK SCORE: [X.X] / 10.0

Risk Level: [CRITICAL / HIGH / MEDIUM / LOW]
```

### 2. Risk Classification

Assign final classification:

```
RISK CLASSIFICATION
===================

┌─────────────────────────────────────────────────────┐
│                                                     │
│  OVERALL RISK LEVEL: [CRITICAL / HIGH / MEDIUM / LOW]
│                                                     │
│  Composite Score: [X.X] / 10.0                      │
│                                                     │
│  Classification Criteria:                           │
│  □ CRITICAL (8.0-10.0): Active exploitation or     │
│    imminent threat, immediate action required       │
│  □ HIGH (6.0-7.9): Significant exposure with       │
│    known threat actor interest                      │
│  □ MEDIUM (4.0-5.9): Notable exposure requiring    │
│    remediation within 30 days                       │
│  □ LOW (1.0-3.9): Limited exposure, routine        │
│    security hygiene recommended                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3. Prioritized Remediation Actions

Generate actionable recommendations:

```markdown
## IMMEDIATE ACTIONS (Within 24 Hours)

### CRITICAL - Do These Now
| Priority | Action | Rationale | Affected Systems |
|----------|--------|-----------|------------------|
| 1 | [Action] | [Why] | [Systems] |
| 2 | [Action] | [Why] | [Systems] |
| 3 | [Action] | [Why] | [Systems] |

### Credential Actions
- [ ] Reset passwords for: [list of services with known credential exposure]
- [ ] Enable MFA on: [critical services not yet protected]
- [ ] Revoke sessions on: [services with active compromise indicators]
- [ ] Change security questions on: [services using exposed data as recovery]

### Financial Protection
- [ ] Freeze credit reports with: Equifax, Experian, TransUnion
- [ ] Set fraud alerts with financial institutions: [list]
- [ ] Review recent transactions on: [exposed financial accounts]
- [ ] Consider identity theft protection service

## SHORT-TERM ACTIONS (Within 7 Days)

### Account Security
- [ ] Audit all accounts using exposed email: [email]
- [ ] Update passwords using exposed username patterns
- [ ] Review and revoke unnecessary OAuth connections
- [ ] Enable login notifications on critical accounts

### Data Minimization
- [ ] Request data deletion from: [services no longer needed]
- [ ] Opt out of data brokers: [identified brokers with target data]
- [ ] Review and limit social media exposure

## MEDIUM-TERM ACTIONS (Within 30 Days)

### Identity Protection
- [ ] Consider credit monitoring service
- [ ] Review and update insurance coverage
- [ ] Implement password manager if not already using
- [ ] Create secure email alias strategy

### Ongoing Vigilance
- [ ] Set up breach monitoring alerts
- [ ] Establish regular password rotation schedule
- [ ] Create incident response plan for future breaches
```

### 4. Intelligence Summary

Consolidate key findings:

```markdown
## INTELLIGENCE SUMMARY

### Key Findings

1. **Breach Exposure Overview**
   - Total breaches identified: [X]
   - Earliest breach: [name] ([date])
   - Most recent breach: [name] ([date])
   - Most severe breach: [name] - [reason]

2. **Data at Risk**
   - Critical: [list critical data types]
   - High: [list high-risk data types]
   - Moderate: [list moderate data types]

3. **Threat Landscape**
   - Active threat actors: [list or "None identified"]
   - Data trafficking status: [current status]
   - Exploitation indicators: [findings]

4. **Target Profile Assessment**
   - Targeting risk: [HIGH/MEDIUM/LOW]
   - Key risk factors: [list factors]
   - Protective factors: [list if any]

### Critical Intelligence Gaps

- [ ] [Information we couldn't determine]
- [ ] [Sources that couldn't be checked]
- [ ] [Timeframes not covered]

### Confidence Assessment

| Finding | Confidence | Basis |
|---------|------------|-------|
| Breach list complete | [High/Medium/Low] | [sources checked] |
| Actor attribution | [High/Medium/Low] | [evidence quality] |
| Risk assessment | [High/Medium/Low] | [data completeness] |
```

### 5. Monitoring Recommendations

Define ongoing vigilance requirements:

```
MONITORING RECOMMENDATIONS
==========================

Continuous Monitoring:
□ Breach notification services (HIBP, Firefox Monitor)
□ Credit monitoring (if financial exposure)
□ Dark web monitoring for [specific identifiers]
□ Social media mention alerts

Periodic Checks (Monthly):
□ Review account login history
□ Check for new breach appearances
□ Audit connected applications
□ Review financial statements

Trigger Events (Act Immediately If):
□ Unexpected password reset emails
□ Login notifications from unknown locations
□ New credit inquiries not initiated by target
□ Contact from unknown parties referencing personal data
□ Social engineering attempts using exposed data

Recommended Services:
| Service Type | Purpose | Priority |
|--------------|---------|----------|
| [Type] | [Purpose] | [Priority] |
```

### 6. Generate Final Report

Compile comprehensive report:

```markdown
# BREACH ARCHAEOLOGY ASSESSMENT REPORT

**Report ID:** BA-[DATE]-[RANDOM]
**Generated:** [Timestamp]
**Classification:** [CONFIDENTIAL / INTERNAL / PUBLIC]

---

## EXECUTIVE SUMMARY

[2-3 sentence overview of findings and risk level]

**Overall Risk Level:** [CRITICAL / HIGH / MEDIUM / LOW]
**Immediate Action Required:** [Yes / No]

---

## TARGET PROFILE

- **Primary Identifiers:** [list]
- **Assessment Scope:** [description]
- **Time Period Analyzed:** [range]

---

## BREACH INVENTORY

[Summary table from Step 2]

---

## THREAT CORRELATION

[Summary from Step 3]

---

## RISK ASSESSMENT

[Composite scoring and classification]

---

## RECOMMENDED ACTIONS

### Immediate (24 Hours)
[Numbered list]

### Short-Term (7 Days)
[Numbered list]

### Medium-Term (30 Days)
[Numbered list]

---

## MONITORING PLAN

[Key monitoring recommendations]

---

## APPENDICES

### A. Full Breach Details
[Detailed breach inventory]

### B. Threat Actor Profiles
[Detailed actor information if applicable]

### C. Data Sources Consulted
[List of sources checked]

---

**Report Prepared By:** Vector (OSINT Lead)
**Agents Consulted:** Shadow, Dossier, Probe, Resolver
**Report Version:** 1.0
```

---

## COMPLETION CRITERIA

Before finalizing report:
- [ ] Composite risk score calculated
- [ ] Risk classification assigned
- [ ] Immediate actions identified
- [ ] Short and medium-term actions listed
- [ ] Intelligence summary complete
- [ ] Monitoring recommendations provided
- [ ] Final report generated

---

## MENU OPTIONS

**[R] Report** - Generate final report document
**[E] Expand** - Add more detail to specific section
**[M] Monitor** - Set up ongoing monitoring plan
**[N] New Assessment** - Start new Breach Archaeology workflow

---

## WORKFLOW COMPLETE

This concludes the Breach Archaeology workflow. The final report should be saved and provided to the target or stakeholder.

**Handoff Options:**
- Return to Intel Team menu for new workflow
- Export report in preferred format
- Proceed to related workflow (Spider Web for network mapping, Campaign Planner for deeper investigation)
