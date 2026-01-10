---
name: 'step-06-risk-synthesis'
description: 'Prioritize vulnerabilities, develop remediation roadmap, quick wins identification, long-term recommendations'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/counter-intel-audit'
thisStepFile: '{workflow_path}/steps/step-06-risk-synthesis.md'
nextStepFile: null
prevStepFile: '{workflow_path}/steps/step-05-underground-exposure.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 6: Risk Synthesis & Remediation

## STEP GOAL

Synthesize all findings from Steps 1-5, prioritize vulnerabilities, develop a remediation roadmap, identify quick wins, and produce the final Counter-Intelligence Assessment Report.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, OSINT Lead and Intelligence Operations Director
- You synthesize multi-source findings into actionable intelligence
- You prioritize risks and develop remediation strategies
- You produce executive-ready assessment reports

### Analysis Protocol
- Integrate all findings from Steps 1-5
- Prioritize vulnerabilities by risk and impact
- Develop phased remediation roadmap
- Identify quick wins for immediate action
- Compile final assessment report

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Findings Integration

Consolidate all step findings:

```
FINDINGS INTEGRATION
====================

Step 1 - Physical Security (Specter):
| Risk Level | Key Vulnerabilities | Quick Wins |
|------------|---------------------|------------|
| [H/M/L] | [summary] | [actions] |

Step 2 - Electronic Security (Sigil):
| Risk Level | Key Vulnerabilities | Quick Wins |
|------------|---------------------|------------|
| [H/M/L] | [summary] | [actions] |

Step 3 - Digital Footprint (Echo):
| Risk Level | Key Vulnerabilities | Quick Wins |
|------------|---------------------|------------|
| [H/M/L] | [summary] | [actions] |

Step 4 - Corporate Exposure (Proxy):
| Risk Level | Key Vulnerabilities | Quick Wins |
|------------|---------------------|------------|
| [H/M/L] | [summary] | [actions] |

Step 5 - Underground Exposure (Shadow):
| Risk Level | Key Vulnerabilities | Quick Wins |
|------------|---------------------|------------|
| [H/M/L] | [summary] | [actions] |

Overall Risk Matrix:
| Category | Risk | Impact | Urgency |
|----------|------|--------|---------|
| Physical | [H/M/L] | [H/M/L] | [H/M/L] |
| Electronic | [H/M/L] | [H/M/L] | [H/M/L] |
| Digital | [H/M/L] | [H/M/L] | [H/M/L] |
| Corporate | [H/M/L] | [H/M/L] | [H/M/L] |
| Underground | [H/M/L] | [H/M/L] | [H/M/L] |

□ All findings integrated: [Y/N]
□ Total vulnerabilities: [count]
□ Critical vulnerabilities: [count]
```

### 2. Vulnerability Prioritization

Prioritize all vulnerabilities:

```
VULNERABILITY PRIORITIZATION
============================

Prioritization Criteria:
| Factor | Weight | Description |
|--------|--------|-------------|
| Exploitability | 30% | How easily can this be exploited |
| Impact | 30% | Damage if exploited |
| Current threat | 20% | Is this being actively targeted |
| Remediation effort | 20% | Difficulty to fix |

Master Vulnerability List (Prioritized):
| Rank | Vulnerability | Category | Risk | Impact | Priority |
|------|---------------|----------|------|--------|----------|
| 1 | [vulnerability] | [category] | [H] | [H] | Critical |
| 2 | [vulnerability] | [category] | [H] | [H] | Critical |
| 3 | [vulnerability] | [category] | [H] | [M] | High |
| 4 | [vulnerability] | [category] | [M] | [H] | High |
| 5 | [vulnerability] | [category] | [M] | [M] | Medium |
| ... | ... | ... | ... | ... | ... |

Critical Vulnerabilities (Immediate Action):
| Vulnerability | Category | Threat | Required Action | Owner |
|---------------|----------|--------|-----------------|-------|
| [vuln 1] | [cat] | [current threat?] | [action] | [suggested] |
| [vuln 2] | [cat] | [threat] | [action] | [owner] |

High-Priority Vulnerabilities (30 days):
| Vulnerability | Category | Action Required |
|---------------|----------|-----------------|
| [vuln] | [cat] | [action] |

Medium-Priority Vulnerabilities (90 days):
| Vulnerability | Category | Action Required |
|---------------|----------|-----------------|
| [vuln] | [cat] | [action] |

Low-Priority/Monitoring:
| Vulnerability | Category | Monitoring Required |
|---------------|----------|---------------------|
| [vuln] | [cat] | [what to watch] |

□ All vulnerabilities prioritized: [Y/N]
□ Critical: [count]
□ High: [count]
□ Medium: [count]
□ Low: [count]
```

### 3. Quick Wins Compilation

Identify immediate-impact actions:

```
QUICK WINS COMPILATION
======================

Quick Win Criteria:
- Low effort to implement
- High security impact
- No significant business disruption
- Can be done in <1 week

Quick Wins List:
| Action | Category | Impact | Effort | Timeframe |
|--------|----------|--------|--------|-----------|
| [action 1] | [physical/electronic/etc] | [H/M/L] | [L] | [days] |
| [action 2] | [category] | [impact] | [L] | [time] |
| [action 3] | [category] | [impact] | [L] | [time] |
| [action 4] | [category] | [impact] | [L] | [time] |
| [action 5] | [category] | [impact] | [L] | [time] |

Quick Wins by Category:

PHYSICAL:
1. [action and expected outcome]
2. [action and expected outcome]

ELECTRONIC:
1. [action and expected outcome]
2. [action and expected outcome]

DIGITAL:
1. [action and expected outcome]
2. [action and expected outcome]

CORPORATE:
1. [action and expected outcome]
2. [action and expected outcome]

UNDERGROUND RESPONSE:
1. [action and expected outcome]
2. [action and expected outcome]

□ Quick wins identified: [count]
□ Total effort: [person-days]
□ Expected risk reduction: [%]
```

### 4. Remediation Roadmap

Develop phased remediation plan:

```
REMEDIATION ROADMAP
===================

Phase 1: Immediate (0-30 days)
------------------------------
| Action | Owner | Resources | Deadline | Success Metric |
|--------|-------|-----------|----------|----------------|
| [action] | [team] | [budget/people] | [date] | [how to measure] |

Phase 2: Short-Term (30-90 days)
--------------------------------
| Action | Owner | Resources | Deadline | Success Metric |
|--------|-------|-----------|----------|----------------|
| [action] | [team] | [resources] | [date] | [metric] |

Phase 3: Medium-Term (90-180 days)
----------------------------------
| Action | Owner | Resources | Deadline | Success Metric |
|--------|-------|-----------|----------|----------------|
| [action] | [team] | [resources] | [date] | [metric] |

Phase 4: Long-Term (180+ days)
------------------------------
| Action | Owner | Resources | Deadline | Success Metric |
|--------|-------|-----------|----------|----------------|
| [action] | [team] | [resources] | [date] | [metric] |

Dependencies:
| Action | Depends On | Blocking |
|--------|------------|----------|
| [action] | [prerequisite] | [what it blocks] |

Resource Requirements:
| Resource | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|----------|---------|---------|---------|---------|
| Budget | [est.] | [est.] | [est.] | [est.] |
| Personnel | [FTE] | [FTE] | [FTE] | [FTE] |
| External | [vendor/consultant] | | | |

Risk Reduction Timeline:
| Phase End | Vulnerabilities Addressed | Risk Reduction |
|-----------|---------------------------|----------------|
| 30 days | [count] | [%] |
| 90 days | [count] | [%] |
| 180 days | [count] | [%] |
| Complete | [count] | [%] |
```

### 5. Ongoing Monitoring Recommendations

Define continuous monitoring needs:

```
ONGOING MONITORING RECOMMENDATIONS
==================================

Monitoring Categories:
| Category | What to Monitor | Tool/Method | Frequency |
|----------|-----------------|-------------|-----------|
| Credentials | New breach exposure | HIBP/monitoring service | Daily |
| Dark web | Threat actor interest | Dark web monitoring | Weekly |
| Social | Employee oversharing | Social monitoring | Weekly |
| Infrastructure | External exposure | Shodan/Censys alerts | Daily |
| Corporate | Registry changes | Filing alerts | Monthly |
| Brand | Impersonation | Domain monitoring | Daily |

Alert Thresholds:
| Alert Type | Trigger | Response |
|------------|---------|----------|
| Credential leak | Any executive | Immediate password reset |
| Access for sale | Organization mentioned | Incident response |
| Phishing site | Lookalike domain | Takedown |
| Data listing | Company data | Assessment and response |

Key Performance Indicators:
| KPI | Current Baseline | Target | Timeline |
|-----|------------------|--------|----------|
| Credential exposure | [count] | [target] | [date] |
| Social engineering surface | [metric] | [target] | [date] |
| External attack surface | [metric] | [target] | [date] |
| Time to detect | [baseline] | [target] | [date] |

Review Cadence:
| Review Type | Frequency | Owner |
|-------------|-----------|-------|
| Full CI audit | Annual | Security |
| Credential review | Quarterly | IT |
| Social media audit | Quarterly | Marketing/HR |
| Infrastructure scan | Monthly | IT Security |
```

### 6. Final Assessment Report

Compile comprehensive findings:

```markdown
═══════════════════════════════════════════════════════════════════════════════

                    COUNTER-INTELLIGENCE ASSESSMENT REPORT

═══════════════════════════════════════════════════════════════════════════════

CLASSIFICATION: [As appropriate]
DATE: [Current date]
PREPARED BY: Intel Team
ORGANIZATION: [Organization name]

═══════════════════════════════════════════════════════════════════════════════

                           EXECUTIVE SUMMARY

═══════════════════════════════════════════════════════════════════════════════

Organization: [Name]
Assessment Date: [Date]
Overall Risk Level: [HIGH/MEDIUM/LOW]

Key Findings:
1. [Most critical finding]
2. [Second critical finding]
3. [Third critical finding]

Immediate Actions Required:
1. [Most urgent action]
2. [Second urgent action]
3. [Third urgent action]

═══════════════════════════════════════════════════════════════════════════════

                    RISK HEAT MAP

═══════════════════════════════════════════════════════════════════════════════

| Category | Risk Level | Vulnerabilities | Priority |
|----------|------------|-----------------|----------|
| Physical Security | [H/M/L] | [count] | [1-5] |
| Electronic Security | [H/M/L] | [count] | [1-5] |
| Digital Footprint | [H/M/L] | [count] | [1-5] |
| Corporate Exposure | [H/M/L] | [count] | [1-5] |
| Underground Exposure | [H/M/L] | [count] | [1-5] |
| **OVERALL** | **[H/M/L]** | **[total]** | - |

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 1: PHYSICAL SECURITY

═══════════════════════════════════════════════════════════════════════════════

Risk Level: [H/M/L]

Key Findings:
- [Finding 1]
- [Finding 2]

Vulnerabilities:
| Vulnerability | Risk | Remediation |
|---------------|------|-------------|

Quick Wins:
- [Action 1]
- [Action 2]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 2: ELECTRONIC SECURITY

═══════════════════════════════════════════════════════════════════════════════

Risk Level: [H/M/L]

Key Findings:
- [Finding 1]
- [Finding 2]

Vulnerabilities:
| Vulnerability | Risk | Remediation |
|---------------|------|-------------|

Quick Wins:
- [Action 1]
- [Action 2]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 3: DIGITAL FOOTPRINT

═══════════════════════════════════════════════════════════════════════════════

Risk Level: [H/M/L]

Key Findings:
- [Finding 1]
- [Finding 2]

Vulnerabilities:
| Vulnerability | Risk | Remediation |
|---------------|------|-------------|

Quick Wins:
- [Action 1]
- [Action 2]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 4: CORPORATE EXPOSURE

═══════════════════════════════════════════════════════════════════════════════

Risk Level: [H/M/L]

Key Findings:
- [Finding 1]
- [Finding 2]

Vulnerabilities:
| Vulnerability | Risk | Remediation |
|---------------|------|-------------|

Quick Wins:
- [Action 1]
- [Action 2]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 5: UNDERGROUND EXPOSURE

═══════════════════════════════════════════════════════════════════════════════

Risk Level: [H/M/L]

Key Findings:
- [Finding 1]
- [Finding 2]

Vulnerabilities:
| Vulnerability | Risk | Remediation |
|---------------|------|-------------|

Quick Wins:
- [Action 1]
- [Action 2]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 6: REMEDIATION ROADMAP

═══════════════════════════════════════════════════════════════════════════════

Phase 1 (Immediate - 30 days):
[Priority actions list]

Phase 2 (Short-term - 90 days):
[Actions list]

Phase 3 (Medium-term - 180 days):
[Actions list]

Phase 4 (Long-term - 180+ days):
[Actions list]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 7: MONITORING PLAN

═══════════════════════════════════════════════════════════════════════════════

Ongoing monitoring recommendations and KPIs

═══════════════════════════════════════════════════════════════════════════════

                         APPENDICES

═══════════════════════════════════════════════════════════════════════════════

Appendix A: Full Vulnerability Inventory
Appendix B: Detailed Remediation Actions
Appendix C: Monitoring Tool Recommendations
Appendix D: Source Documentation
Appendix E: Methodology

═══════════════════════════════════════════════════════════════════════════════

Report Prepared By: Intel Team
Workflow: Counter-Intelligence Audit
Steps Completed: 6/6
Agents Engaged: Specter, Sigil, Echo, Proxy, Shadow, Vector

═══════════════════════════════════════════════════════════════════════════════
```

---

## STEP 6 OUTPUT

```markdown
## COUNTER-INTELLIGENCE ASSESSMENT COMPLETE

### Overall Assessment
- Organization: [name]
- Overall Risk: [HIGH/MEDIUM/LOW]
- Total Vulnerabilities: [count]
- Critical Vulnerabilities: [count]

### Risk Summary
| Category | Risk Level |
|----------|------------|
| Physical | [H/M/L] |
| Electronic | [H/M/L] |
| Digital | [H/M/L] |
| Corporate | [H/M/L] |
| Underground | [H/M/L] |

### Top 3 Critical Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Immediate Actions Required
1. [Action 1]
2. [Action 2]
3. [Action 3]

### Quick Wins
- Total identified: [count]
- Estimated effort: [person-days]
- Expected risk reduction: [%]

### Remediation Timeline
| Phase | Duration | Actions | Risk Reduction |
|-------|----------|---------|----------------|
| Phase 1 | 30 days | [count] | [%] |
| Phase 2 | 90 days | [count] | [%] |
| Phase 3 | 180 days | [count] | [%] |
| Phase 4 | 180+ days | [count] | [%] |

### Next Steps
1. Review findings with security leadership
2. Approve remediation budget
3. Begin Phase 1 quick wins
4. Establish monitoring program
```

---

## COMPLETION CRITERIA

Workflow complete when:
- [ ] All Step 1-5 findings integrated
- [ ] Vulnerabilities prioritized
- [ ] Quick wins identified
- [ ] Remediation roadmap developed
- [ ] Monitoring plan created
- [ ] Final report compiled

---

## MENU OPTIONS

**[E] Export** - Export full CI assessment report
**[Q] Quick** - Export quick wins only
**[R] Roadmap** - Export remediation roadmap
**[M] Monitor** - Export monitoring plan

---

## WORKFLOW COMPLETE

Counter-Intelligence Audit workflow complete.

Recommended follow-on:
- Schedule quarterly CI review
- Implement monitoring program
- Consider **Tripwire** workflow for ongoing alerting
- Consider **Operation Mosaic** if specific threats identified
