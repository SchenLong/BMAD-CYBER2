---
name: 'step-03-synthesis'
description: 'Rapid synthesis of all findings into Flash Assessment Report'
estimated_duration: '3 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/flash-assessment'
thisStepFile: '{workflow_path}/steps/step-03-synthesis.md'
prevStepFile: '{workflow_path}/steps/step-02-parallel-collection.md'
outputFile: '{output_path}/flash-assessment-{timestamp}.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 3: Rapid Synthesis

## STEP GOAL

Aggregate all parallel collection findings, calculate risk score, identify critical findings, and produce the final Flash Assessment Report.

## EXECUTION TIME: ~3 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, Intelligence Operations Director
- You synthesize findings from Probe, Echo, Shadow, and Proxy
- You assign risk scores based on evidence
- You recommend appropriate deep-dive workflows

### Step-Specific Rules
- Focus on CRITICAL findings first
- Do not over-analyze - this is rapid triage
- Be decisive with risk scoring
- Provide actionable recommendations

---

## SYNTHESIS SEQUENCE

### 1. Aggregate Findings

Collect outputs from all four agents:

```
┌─────────────────────────────────────────┐
│         FINDINGS AGGREGATION            │
├─────────────────────────────────────────┤
│ TECHNICAL (Probe):                      │
│ - Infrastructure details                │
│ - Technology stack                      │
│ - Exposure indicators                   │
│                                         │
│ SOCIAL (Echo):                          │
│ - Accounts discovered                   │
│ - Network summary                       │
│ - Activity patterns                     │
│                                         │
│ DARK WEB (Shadow):                      │
│ - Breach exposure                       │
│ - Underground mentions                  │
│ - Credential status                     │
│                                         │
│ CORPORATE (Proxy):                     │
│ - Entity verification                   │
│ - Registration status                   │
│ - Officers/Directors                    │
│ - Corporate structure                   │
└─────────────────────────────────────────┘
```

### 2. Calculate Risk Score

Apply risk scoring matrix:

#### Critical Indicators (Automatic HIGH)
- [ ] Active credential exposure (password in recent breach)
- [ ] Ongoing targeting by threat actors
- [ ] Sensitive data (PII, financial) exposed
- [ ] Critical infrastructure vulnerabilities
- [ ] Entity does not exist / dissolved / sanctioned

#### High Risk Indicators
- [ ] Multiple breach exposures
- [ ] Password exposed (even if old)
- [ ] Exposed admin interfaces
- [ ] Underground forum mentions
- [ ] No corporate registry record found
- [ ] Recently incorporated with mismatched claims

#### Medium Risk Indicators
- [ ] Email-only breach exposure
- [ ] Outdated software detected
- [ ] Inconsistent online persona
- [ ] Moderate digital footprint exposure
- [ ] Registered agent only (no physical address)
- [ ] Jurisdiction mismatch (operations vs registration)

#### Low Risk Indicators
- [ ] Minimal breach exposure
- [ ] Clean dark web scan
- [ ] Standard digital presence
- [ ] No immediate concerns
- [ ] Verified corporate registration in good standing

### Risk Score Assignment

| Score | Criteria |
|-------|----------|
| **HIGH** | Any critical indicator OR 3+ high indicators |
| **MEDIUM** | 1-2 high indicators OR 3+ medium indicators |
| **LOW** | No high indicators, minimal medium indicators |

### 3. Identify Critical Findings

Extract top 3-5 most important findings:

```
CRITICAL FINDINGS CHECKLIST:
□ Immediate security threat?
□ Active compromise indicators?
□ Significant data exposure?
□ Reputation risk?
□ Operational security gaps?
```

### 4. Recommend Deep-Dive Workflows

Based on findings, recommend appropriate follow-up:

| Finding Type | Recommended Workflow |
|--------------|---------------------|
| Significant breach exposure | Breach Archaeology (#6) |
| Complex network discovered | Spider Web (#3) |
| Threat actor indicators | Attribution Chain (#2) |
| Suspicious accounts | Doppelganger Hunt (#5) |
| Historical gaps | Digital Necromancy (#4) |
| Full investigation needed | Operation Mosaic (#1) |
| Person deep-dive needed | Campaign Planner: Person (#12) |

---

## OUTPUT: FLASH ASSESSMENT REPORT

Generate the final report using this template:

```markdown
# FLASH ASSESSMENT

**Target:** [identifier]
**Generated:** [timestamp]
**Turnaround:** 15 minutes
**Analyst:** Vector (Intel Team)

---

## RISK SCORE: [HIGH/MEDIUM/LOW]

[One sentence risk summary]

---

## CRITICAL FINDINGS

1. **[Finding Title]**
   - [Details]
   - Impact: [description]

2. **[Finding Title]**
   - [Details]
   - Impact: [description]

3. **[Finding Title]**
   - [Details]
   - Impact: [description]

---

## QUICK HITS

### Technical (Probe)
- [Key finding 1]
- [Key finding 2]
- [Key finding 3]

### Social (Echo)
- [Key finding 1]
- [Key finding 2]
- [Key finding 3]

### Dark Web (Shadow)
- [Key finding 1]
- [Key finding 2]
- [Key finding 3]

### Corporate (Proxy)
- [Key finding 1]
- [Key finding 2]
- [Key finding 3]

---

## EXPOSURE SUMMARY

| Category | Status | Details |
|----------|--------|---------|
| Breach Exposure | [Yes/No] | [X breaches, most recent: date] |
| Credential Risk | [High/Med/Low] | [Password exposed: yes/no] |
| Social Footprint | [Large/Med/Small] | [X platforms, Y connections] |
| Technical Exposure | [High/Med/Low] | [Key vulnerabilities] |
| Corporate Status | [Verified/Unverified/Concerning] | [Registration status, jurisdiction] |

---

## RECOMMENDED DEEP-DIVES

Based on this assessment, recommend the following follow-up investigations:

- [ ] **[Workflow Name]** - [Reason]
- [ ] **[Workflow Name]** - [Reason]
- [ ] **[Workflow Name]** - [Reason]

---

## COLLECTION GAPS

The following areas could not be fully assessed in the 15-minute window:

- [Gap 1]
- [Gap 2]

---

## ANALYST NOTES

[Any additional context or observations]

---

*Generated by Intel Team Flash Assessment Workflow v1.0*
*Classification: [as appropriate]*
```

---

## COMPLETION CRITERIA

Flash Assessment complete when:
- [ ] All findings aggregated
- [ ] Risk score assigned with justification
- [ ] Critical findings identified (3-5)
- [ ] Quick hits summarized per category
- [ ] Deep-dive recommendations provided
- [ ] Report generated and saved

---

## WORKFLOW COMPLETE

**Flash Assessment workflow finished.**

### Next Actions

1. **Save report** to `{output_path}/flash-assessment-[target]-[timestamp].md`
2. **Brief requester** on critical findings
3. **Queue deep-dives** if warranted
4. **Update case file** if part of larger investigation

### Menu Options

**[S] Save & Exit** - Save report and complete workflow
**[D] Deep-Dive** - Immediately launch recommended workflow
**[R] Revise** - Modify assessment before finalizing
**[PM] Party Mode** - Convene full Intel Team for discussion

---

*Flash Assessment Workflow v1.0 - Intel Team Module*
