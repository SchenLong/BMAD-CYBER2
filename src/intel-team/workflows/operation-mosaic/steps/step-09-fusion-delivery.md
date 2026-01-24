---
name: 'step-09-fusion-delivery'
description: 'Multi-INT correlation, confidence assessment, gap identification, final package'
estimated_duration: '30 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/operation-mosaic'
thisStepFile: '{workflow_path}/steps/step-09-fusion-delivery.md'
nextStepFile: null
prevStepFile: '{workflow_path}/steps/step-08-operational-assessment.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 9: Fusion & Delivery (Phase 5)

## STEP GOAL

Fuse all intelligence products from Phases 1-4 into a comprehensive target package. Correlate multi-INT findings, assess overall confidence, identify collection gaps, and deliver the final intelligence product.

## EXECUTION TIME: ~30 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, OSINT Lead and Intelligence Operations Director
- You synthesize all INT products into cohesive intelligence
- You resolve conflicts between sources
- You assess overall confidence and identify gaps
- You produce the final deliverable target package

### Fusion Protocol
- Review all step outputs systematically
- Correlate findings across INT disciplines
- Resolve any conflicting information
- Weight evidence and assess confidence
- Identify remaining intelligence gaps
- Compile comprehensive final report
- Quality control all deliverables

---

## FUSION EXECUTION SEQUENCE

### 1. Multi-INT Correlation

Correlate findings across all disciplines:

```
MULTI-INT CORRELATION
=====================

Cross-Discipline Correlation Points:
| Finding | Supporting INTs | Conflict? | Confidence |
|---------|-----------------|-----------|------------|
| [finding 1] | [TECHINT+SOCMINT+etc] | [Y/N] | [H/M/L] |
| [finding 2] | [supporting disciplines] | [conflict?] | [confidence] |
| [finding 3] | [disciplines] | [Y/N] | [H/M/L] |

Identity Correlation:
| Identifier | Sources Confirming | Confidence |
|------------|-------------------|------------|
| [name] | [Steps 2,3,5] | [H/M/L] |
| [email] | [Steps 2,3,4] | [H/M/L] |
| [username] | [Steps 3,4] | [H/M/L] |
| [location] | [Steps 3,5,6] | [H/M/L] |

Infrastructure Correlation:
| Asset | INT Sources | Verified |
|-------|-------------|----------|
| [domain] | [Step 2, Step 4] | [Y/N] |
| [IP] | [Step 2, Step 7] | [Y/N] |

Network Correlation:
| Connection | Source 1 | Source 2 | Strength |
|------------|----------|----------|----------|
| [connection] | [from Step 3] | [from Step 5] | [strong/weak] |

Timeline Correlation:
| Event | Date | Sources | Verified |
|-------|------|---------|----------|
| [event] | [date] | [multiple steps] | [Y/N] |

□ Multi-INT correlation complete: [Y/N]
□ Conflicts identified: [count]
□ High-confidence findings: [count]
```

### 2. Conflict Resolution

Resolve conflicting information:

```
CONFLICT RESOLUTION
===================

Identified Conflicts:
| Conflict | Source A | Source B | Resolution |
|----------|----------|----------|------------|
| [topic] | [Step X says...] | [Step Y says...] | [resolved how] |

Resolution Methods Applied:
| Conflict | Method | Outcome |
|----------|--------|---------|
| [conflict] | [source reliability/recency/corroboration] | [resolution] |

Source Reliability Weighting:
| Source Type | Reliability | Weight |
|-------------|-------------|--------|
| Official records | High | 1.0 |
| Platform data | Medium-High | 0.8 |
| Breach data | Medium | 0.6 |
| Forum posts | Low-Medium | 0.4 |
| Single source claims | Low | 0.2 |

Unresolved Conflicts:
| Conflict | Impact | Recommendation |
|----------|--------|----------------|
| [conflict] | [assessment impact] | [additional collection?] |

□ All conflicts addressed: [Y/N]
□ Unresolved conflicts: [count]
□ Impact on assessment: [significant/minor/none]
```

### 3. Confidence Assessment

Assess overall confidence levels:

```
CONFIDENCE ASSESSMENT
=====================

PIR Satisfaction Assessment:
| PIR | Status | Confidence | Evidence Strength |
|-----|--------|------------|-------------------|
| PIR-1 | [Satisfied/Partial/Unsatisfied] | [H/M/L] | [strong/moderate/weak] |
| PIR-2 | [status] | [H/M/L] | [strength] |
| PIR-3 | [status] | [H/M/L] | [strength] |
| PIR-4 | [status] | [H/M/L] | [strength] |

Overall Assessment Confidence:
| Aspect | Confidence | Basis |
|--------|------------|-------|
| Identity verification | [H/M/L] | [evidence summary] |
| Infrastructure mapping | [H/M/L] | [evidence summary] |
| Network/connections | [H/M/L] | [evidence summary] |
| Threat assessment | [H/M/L] | [evidence summary] |
| Location verification | [H/M/L] | [evidence summary] |
| **OVERALL** | **[H/M/L]** | **[summary]** |

Evidence Quality Summary:
| Quality Level | Findings Count | Percentage |
|---------------|----------------|------------|
| High confidence | [count] | [%] |
| Medium confidence | [count] | [%] |
| Low confidence | [count] | [%] |
| Unverified | [count] | [%] |

Confidence Limiting Factors:
| Factor | Impact | Can Be Improved? |
|--------|--------|------------------|
| [factor] | [how it limits confidence] | [Y/N - how] |

□ Confidence assessment complete: [Y/N]
□ PIRs satisfied: [count/total]
□ Overall confidence: [H/M/L]
```

### 4. Gap Identification

Identify collection gaps:

```
GAP IDENTIFICATION
==================

Collection Gaps by Category:
| Category | Gap | Impact | Priority |
|----------|-----|--------|----------|
| Digital footprint | [what's missing] | [H/M/L] | [P1/P2/P3] |
| Social presence | [gap] | [impact] | [priority] |
| Dark web | [gap] | [impact] | [priority] |
| Corporate intel | [gap] | [impact] | [priority] |
| Geospatial | [gap] | [impact] | [priority] |
| Threat intel | [gap] | [impact] | [priority] |

Unsatisfied PIRs:
| PIR | Gap | Collection Needed |
|-----|-----|-------------------|
| [PIR-X] | [what's missing] | [recommended collection] |

Access Limitations:
| Data Source | Limitation | Impact |
|-------------|------------|--------|
| [source] | [why couldn't access] | [what we're missing] |

Recommended Follow-Up Collection:
| Gap | Collection Method | Resource | Priority |
|-----|-------------------|----------|----------|
| [gap] | [how to fill] | [what's needed] | [H/M/L] |

Future Intelligence Requirements:
| Requirement | Rationale | Timeline |
|-------------|-----------|----------|
| [what to monitor] | [why important] | [ongoing/one-time] |

□ Gaps identified: [count]
□ Critical gaps: [count]
□ Follow-up recommendations: [count]
```

### 5. Final Package Assembly

Compile the comprehensive report:

```markdown
═══════════════════════════════════════════════════════════════════════════════

                    OPERATION MOSAIC: TARGET PACKAGE

═══════════════════════════════════════════════════════════════════════════════

CLASSIFICATION: [As appropriate]
CASE ID: [From Step 1]
DATE: [Current date]
PREPARED BY: Intel Team

═══════════════════════════════════════════════════════════════════════════════

                           EXECUTIVE SUMMARY

═══════════════════════════════════════════════════════════════════════════════

Target: [Primary identifier]
Target Type: [Person/Organization/Infrastructure]
Assessment Date: [Date]
Overall Confidence: [HIGH/MEDIUM/LOW]

Key Findings:
1. [Most critical finding]
2. [Second critical finding]
3. [Third critical finding]

Threat Assessment: [Summary statement]

Recommended Actions: [Summary of key recommendations]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 1: TARGET IDENTIFICATION

═══════════════════════════════════════════════════════════════════════════════

1.1 Primary Identifiers
| Identifier Type | Value | Confidence |
|-----------------|-------|------------|
| [type] | [value] | [H/M/L] |

1.2 Associated Identifiers
[List all confirmed associated identifiers]

1.3 Identity Verification
[Summary of identity verification findings]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 2: DIGITAL FOOTPRINT

═══════════════════════════════════════════════════════════════════════════════

2.1 Domain Portfolio
[Summary of domains and infrastructure]

2.2 Technology Stack
[Technology summary]

2.3 Security Posture
[External security assessment]

Score: [X/100]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 3: SOCIAL PRESENCE

═══════════════════════════════════════════════════════════════════════════════

3.1 Platform Presence
| Platform | Handle | Followers | Status |
|----------|--------|-----------|--------|

3.2 Key Connections
[Network summary]

3.3 Content Analysis
[Behavioral/content summary]

Score: [X/100]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 4: DARK WEB EXPOSURE

═══════════════════════════════════════════════════════════════════════════════

4.1 Breach Exposure
[Summary of breaches]

4.2 Underground Presence
[Forum/marketplace summary]

4.3 Threat Indicators
[Any indicators of targeting or compromise]

Score: [X/100]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 5: CORPORATE INTELLIGENCE

═══════════════════════════════════════════════════════════════════════════════

5.1 Entity Verification
[Corporate entity summary]

5.2 Corporate Structure
[Ownership/structure summary]

5.3 Key Personnel
[Officers/directors summary]

5.4 Financial Status
[Financial summary]

Score: [X/100]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 6: GEOSPATIAL INTELLIGENCE

═══════════════════════════════════════════════════════════════════════════════

6.1 Primary Locations
[Verified locations]

6.2 Infrastructure Locations
[Facility locations]

6.3 Movement Patterns
[Travel/movement summary]

Score: [X/100]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 7: THREAT ASSESSMENT

═══════════════════════════════════════════════════════════════════════════════

7.1 Attribution Assessment
[Actor identification/attribution]

7.2 MITRE ATT&CK Mapping
[TTP summary]

7.3 Campaign Correlation
[Related campaigns]

7.4 Risk Assessment
| Risk Dimension | Level | Notes |
|----------------|-------|-------|

Score: [X/100]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 8: OPERATIONAL OPTIONS

═══════════════════════════════════════════════════════════════════════════════

8.1 HUMINT Approaches
[Summary of approach options]

8.2 SIGINT Opportunities
[Collection opportunities]

8.3 Physical Options
[Operational possibilities]

8.4 Recommended Course of Action
[Primary recommendations]

═══════════════════════════════════════════════════════════════════════════════

                    SECTION 9: CONCLUSIONS

═══════════════════════════════════════════════════════════════════════════════

9.1 PIR Satisfaction
| PIR | Status | Confidence |
|-----|--------|------------|

9.2 Key Judgments
1. [Key judgment 1]
2. [Key judgment 2]
3. [Key judgment 3]

9.3 Confidence Assessment
[Overall confidence statement with caveats]

9.4 Collection Gaps
[Summary of gaps and recommended follow-up]

═══════════════════════════════════════════════════════════════════════════════

                         APPENDICES

═══════════════════════════════════════════════════════════════════════════════

Appendix A: Network Diagram
Appendix B: Timeline of Activity
Appendix C: Evidence Screenshots
Appendix D: IOC List
Appendix E: MITRE ATT&CK Navigator Export
Appendix F: Source Documentation

═══════════════════════════════════════════════════════════════════════════════

                      CLASSIFICATION FOOTER

═══════════════════════════════════════════════════════════════════════════════

Report Prepared By: Intel Team
Operation: Mosaic
Steps Completed: 9/9
Agents Engaged: Vector, Resolver, Probe, Echo, Shadow, Proxy, Atlas, Dossier,
                Viper, Sigil, Specter (All 11)

═══════════════════════════════════════════════════════════════════════════════
```

### 6. Quality Control

Final quality review:

```
QUALITY CONTROL CHECKLIST
=========================

Report Completeness:
□ [ ] All sections populated
□ [ ] All PIRs addressed
□ [ ] Confidence levels assigned throughout
□ [ ] Sources documented
□ [ ] Gaps identified

Accuracy Verification:
□ [ ] Key findings double-checked
□ [ ] Dates and numbers verified
□ [ ] Names and identifiers confirmed
□ [ ] No conflicting statements

Formatting & Presentation:
□ [ ] Consistent formatting
□ [ ] Clear structure
□ [ ] Executive summary captures key points
□ [ ] Appendices complete

Operational Security:
□ [ ] Sources protected
□ [ ] Methods not exposed
□ [ ] Appropriate classification
□ [ ] Distribution controls noted

Deliverables Checklist:
□ [ ] Target Package Report
□ [ ] Network Diagram
□ [ ] Timeline
□ [ ] IOC List (if applicable)
□ [ ] Evidence Package
```

---

## WORKFLOW COMPLETION

```markdown
═══════════════════════════════════════════════════════════════

              OPERATION MOSAIC: WORKFLOW COMPLETE

═══════════════════════════════════════════════════════════════

Case ID: [case ID]
Target: [target identifier]
Completion Date: [date]

PHASE SUMMARY
-------------
| Phase | Steps | Status | Time |
|-------|-------|--------|------|
| Phase 1: Planning | Step 1 | Complete | [time] |
| Phase 2: Collection | Steps 2-6 | Complete | [time] |
| Phase 3: Analysis | Step 7 | Complete | [time] |
| Phase 4: Operations | Step 8 | Complete | [time] |
| Phase 5: Fusion | Step 9 | Complete | [time] |
| **TOTAL** | 9 Steps | **Complete** | [total] |

AGENT PARTICIPATION
-------------------
| Agent | Codename | Steps | Contribution |
|-------|----------|-------|--------------|
| osint-lead | Vector | 1, 9 | Planning, Fusion |
| domain-intel-specialist | Resolver | 2 | Infrastructure |
| technical-researcher | Probe | 2 | Technology |
| social-media-analyst | Echo | 3 | SOCMINT |
| dark-web-analyst | Shadow | 4 | DARKINT |
| corporate-intel-specialist | Proxy | 5 | CORPINT |
| geospatial-analyst | Atlas | 6 | GEOINT |
| threat-actor-profiler | Dossier | 7 | Threat Intel |
| humint-specialist | Viper | 8 | HUMINT |
| sigint-specialist | Sigil | 8 | SIGINT |
| field-operative | Specter | 8 | Physical Ops |

DELIVERABLES
------------
□ [X] Target Package Report
□ [X] Executive Summary
□ [X] Network Diagram (Appendix A)
□ [X] Timeline (Appendix B)
□ [X] Evidence Package (Appendix C)
□ [X] IOC List (Appendix D)
□ [X] ATT&CK Mapping (Appendix E)
□ [X] Source Documentation (Appendix F)

PIR SATISFACTION
----------------
| PIR | Status | Confidence |
|-----|--------|------------|
| PIR-1 | [status] | [H/M/L] |
| PIR-2 | [status] | [H/M/L] |
| PIR-3 | [status] | [H/M/L] |

OVERALL ASSESSMENT
------------------
Confidence: [HIGH/MEDIUM/LOW]
Gaps: [count identified]
Follow-up Required: [Y/N]

═══════════════════════════════════════════════════════════════

                   OPERATION MOSAIC COMPLETE

═══════════════════════════════════════════════════════════════
```

---

## COMPLETION CRITERIA

Workflow complete when:
- [ ] All Phase 1-4 outputs reviewed
- [ ] Multi-INT correlation complete
- [ ] Conflicts resolved
- [ ] Confidence assessed
- [ ] Gaps identified
- [ ] Final report assembled
- [ ] Quality control passed
- [ ] Deliverables compiled

---

## MENU OPTIONS

**[E] Export** - Export full package
**[S] Summary** - Generate executive summary only
**[G] Gaps** - Detailed gap analysis
**[F] Follow-up** - Plan follow-up collection

---

## WORKFLOW COMPLETE

Operation Mosaic comprehensive target package delivered.

Recommended follow-on based on gaps:
- [Specific workflow recommendations based on identified gaps]
