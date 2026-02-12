---
name: 'step-08-operational-assessment'
description: 'HUMINT approach vectors, SIGINT opportunities, physical surveillance options'
estimated_duration: '30 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/operation-mosaic'
thisStepFile: '{workflow_path}/steps/step-08-operational-assessment.md'
nextStepFile: '{workflow_path}/steps/step-09-fusion-delivery.md'
prevStepFile: '{workflow_path}/steps/step-07-threat-correlation.md'

# Agent Configuration
executing_agent: humint-specialist
agent_codename: Viper
supporting_agents: [sigint-specialist, field-operative]
supporting_codenames: [Sigil, Specter]
---

# Step 8: Operational Assessment (Phase 4)

## STEP GOAL

Assess operational options for further engagement including HUMINT approach vectors, SIGINT collection opportunities, and physical surveillance/operations possibilities. This step provides actionable operational intelligence for decision-makers.

## EXECUTION TIME: ~30 minutes

## MANDATORY EXECUTION RULES

### Agent Roles

- **Primary: Viper** (HUMINT Specialist) - Human approach assessment
- **Supporting: Sigil** (SIGINT Specialist) - Electronic collection opportunities
- **Supporting: Specter** (Field Operative) - Physical operations assessment

### Assessment Protocol

- Identify HUMINT approach vectors based on psychological profile
- Assess SIGINT collection opportunities from technical footprint
- Evaluate physical operational possibilities
- Risk-assess each operational option
- Provide recommendations prioritized by feasibility and risk

### IMPORTANT DISCLAIMER

This assessment identifies theoretical operational options for awareness and planning purposes. Actual operations require separate authorization, legal review, and ethical consideration. This is intelligence assessment, not operational authorization.

---

## ASSESSMENT EXECUTION SEQUENCE

### 1. HUMINT Approach Assessment (Viper)

Assess human intelligence approach options:

```
HUMINT APPROACH ASSESSMENT
==========================

Psychological Profile Summary (from all steps):
| Attribute | Assessment | Evidence |
|-----------|------------|----------|
| Primary motivations | [motivations] | [from content/behavior] |
| Interests/hobbies | [interests] | [from social] |
| Communication style | [style] | [from content analysis] |
| Social preferences | [preferences] | [from network/activity] |
| Professional focus | [focus] | [from career/content] |
| Vulnerabilities (MICE) | [assessed] | [from analysis] |

MICE Framework Analysis:
| Factor | Assessment | Approach Viability |
|--------|------------|-------------------|
| Money | [financial status/motivations] | [H/M/L] |
| Ideology | [beliefs/values identified] | [H/M/L] |
| Coercion | [vulnerabilities/leverage] | [N/A - ethical note] |
| Ego | [status/recognition seeking] | [H/M/L] |

Social Engineering Vectors:
| Vector | Description | Feasibility | Risk |
|--------|-------------|-------------|------|
| Professional approach | [industry event/networking] | [H/M/L] | [H/M/L] |
| Interest-based approach | [hobby/interest connection] | [H/M/L] | [H/M/L] |
| Social platform approach | [platform-specific] | [H/M/L] | [H/M/L] |
| Third-party introduction | [mutual connection] | [H/M/L] | [H/M/L] |

Key Contacts for Access:
| Contact | Relationship | Access Potential | Approach |
|---------|--------------|------------------|----------|
| [person] | [relationship type] | [access to target] | [how to engage] |

Pretext Development:
| Pretext Scenario | Credibility | Sustainability | Risk |
|------------------|-------------|----------------|------|
| [scenario 1] | [H/M/L] | [H/M/L] | [H/M/L] |
| [scenario 2] | [H/M/L] | [H/M/L] | [H/M/L] |

Rapport Building Opportunities:
| Opportunity | Basis | Engagement Point |
|-------------|-------|------------------|
| [opportunity] | [shared interest/connection] | [where/how] |

□ HUMINT approach options identified: [count]
□ Recommended approach: [primary recommendation]
□ Risk level: [H/M/L]
```

### 2. SIGINT Collection Assessment (Sigil)

Assess electronic/signals collection opportunities:

```
SIGINT COLLECTION ASSESSMENT
============================

Communications Footprint (from Steps 2-3):
| Channel | Platform | Activity Level | Collection Potential |
|---------|----------|----------------|---------------------|
| Email | [providers] | [high/med/low] | [assessment] |
| Social media | [platforms] | [activity] | [assessment] |
| Messaging | [apps if known] | [usage] | [assessment] |
| Voice | [indicators] | [usage] | [assessment] |

Technical Collection Opportunities:
| Target | Method | Feasibility | Legal Status |
|--------|--------|-------------|--------------|
| Public social media | OSINT monitoring | High | Legal |
| Website changes | Automated monitoring | High | Legal |
| Public posts | Content analysis | High | Legal |
| Network traffic | [requires access] | [assessment] | [legal note] |

Monitoring Opportunities:
| Data Source | What Can Be Monitored | Update Frequency |
|-------------|----------------------|------------------|
| Social accounts | [posts, connections] | [real-time/periodic] |
| Websites | [content changes] | [configurable] |
| Public records | [filings, updates] | [as published] |
| News/mentions | [media coverage] | [continuous] |

Communication Pattern Analysis:
| Pattern | Observation | Collection Value |
|---------|-------------|------------------|
| Active hours | [timezone/times] | [when to monitor] |
| Platform preference | [primary platforms] | [focus areas] |
| Response patterns | [engagement style] | [timing] |

RF/Electronic Considerations:
| Consideration | Assessment | Notes |
|---------------|------------|-------|
| Wireless networks | [known networks] | [at identified locations] |
| Mobile devices | [device indicators] | [from metadata] |
| IoT presence | [smart devices] | [if identified] |

□ SIGINT opportunities identified: [count]
□ Recommended collection focus: [areas]
□ Legal collection options: [list]
```

### 3. Physical Operations Assessment (Specter)

Assess physical/field operation options:

```
PHYSICAL OPERATIONS ASSESSMENT
==============================

Location Intelligence (from Step 6):
| Location | Type | Access | Surveillance Potential |
|----------|------|--------|----------------------|
| [address 1] | [home/work] | [public/private] | [H/M/L] |
| [address 2] | [type] | [access level] | [potential] |

Physical Security Assessment:
| Location | Security Features | Vulnerability |
|----------|-------------------|---------------|
| [location] | [guards/cameras/access control] | [assessment] |

Surveillance Opportunities:
| Type | Location | Feasibility | Risk | Legal |
|------|----------|-------------|------|-------|
| Static observation | [location] | [H/M/L] | [H/M/L] | [status] |
| Mobile surveillance | [routes] | [H/M/L] | [H/M/L] | [status] |
| Technical surveillance | [target] | [H/M/L] | [H/M/L] | [status] |

Pattern of Life Indicators:
| Pattern | Time | Location | Notes |
|---------|------|----------|-------|
| Commute | [times] | [route if known] | [observations] |
| Regular activities | [schedule] | [locations] | [patterns] |

Physical Approach Opportunities:
| Opportunity | Location | Timing | Cover |
|-------------|----------|--------|-------|
| [opportunity] | [where] | [when] | [pretext] |

Venue Analysis:
| Venue Type | Known Locations | Access Level |
|------------|-----------------|--------------|
| Workplace | [address] | [public/restricted] |
| Residence | [address] | [private] |
| Regular venues | [locations] | [public] |
| Events | [upcoming events] | [registration required?] |

Risk Assessment:
| Risk Factor | Level | Mitigation |
|-------------|-------|------------|
| Detection risk | [H/M/L] | [approach] |
| Legal risk | [H/M/L] | [boundaries] |
| Counter-surveillance | [H/M/L] | [indicators] |

□ Physical assessment complete: [Y/N]
□ Viable options identified: [count]
□ Recommended approach: [summary]
```

### 4. Integrated Operational Options

Combine assessments into options:

```
INTEGRATED OPERATIONAL OPTIONS
==============================

Option 1: [Option Name]
| Aspect | Details |
|--------|---------|
| Type | [HUMINT/SIGINT/Physical/Combined] |
| Objective | [what this achieves] |
| Approach | [how executed] |
| Resources | [what's needed] |
| Timeline | [estimated duration] |
| Feasibility | [H/M/L] |
| Risk | [H/M/L] |
| Legal status | [assessment] |

Option 2: [Option Name]
| Aspect | Details |
|--------|---------|
| Type | [type] |
| Objective | [objective] |
| Approach | [approach] |
| Resources | [resources] |
| Timeline | [timeline] |
| Feasibility | [H/M/L] |
| Risk | [H/M/L] |
| Legal status | [assessment] |

Option 3: [Option Name]
| Aspect | Details |
|--------|---------|
| Type | [type] |
| Objective | [objective] |
| Approach | [approach] |
| Resources | [resources] |
| Timeline | [timeline] |
| Feasibility | [H/M/L] |
| Risk | [H/M/L] |
| Legal status | [assessment] |

Option Comparison Matrix:
| Option | Feasibility | Risk | Resource Cost | Time | Intel Value |
|--------|-------------|------|---------------|------|-------------|
| Option 1 | [H/M/L] | [H/M/L] | [H/M/L] | [H/M/L] | [H/M/L] |
| Option 2 | [H/M/L] | [H/M/L] | [H/M/L] | [H/M/L] | [H/M/L] |
| Option 3 | [H/M/L] | [H/M/L] | [H/M/L] | [H/M/L] | [H/M/L] |

Recommended Option: [Option X]
Rationale: [Why this option is recommended]
```

### 5. Risk Assessment

Assess operational risks:

```
OPERATIONAL RISK ASSESSMENT
===========================

Risk Categories:
| Category | Risk Level | Key Concerns |
|----------|------------|--------------|
| Detection/Exposure | [H/M/L] | [specific concerns] |
| Legal/Regulatory | [H/M/L] | [jurisdictional issues] |
| Counterintelligence | [H/M/L] | [target awareness] |
| Reputational | [H/M/L] | [if discovered] |
| Physical Safety | [H/M/L] | [personnel risk] |
| Operational Security | [H/M/L] | [opsec concerns] |

Target Awareness Assessment:
| Indicator | Present | Implication |
|-----------|---------|-------------|
| Security-conscious online | [Y/N] | [operational impact] |
| Counter-surveillance indicators | [Y/N] | [impact] |
| Previous targeting awareness | [Y/N] | [impact] |
| Professional security role | [Y/N] | [heightened awareness] |

Risk Mitigation Recommendations:
| Risk | Mitigation Measure | Residual Risk |
|------|-------------------|---------------|
| [risk] | [mitigation] | [after mitigation] |

Go/No-Go Considerations:
| Factor | Assessment | Weight |
|--------|------------|--------|
| Intelligence value | [H/M/L] | Critical |
| Risk level | [H/M/L] | Critical |
| Resource availability | [Y/N] | Important |
| Legal clearance | [Required/Optional] | Critical |
| Time sensitivity | [H/M/L] | Important |
```

### 6. Operational Assessment Summary

Compile operational findings:

```
OPERATIONAL ASSESSMENT SUMMARY
==============================

Assessment Overview:
| Discipline | Options Identified | Recommended | Risk Level |
|------------|-------------------|-------------|------------|
| HUMINT | [count] | [primary option] | [H/M/L] |
| SIGINT | [count] | [primary option] | [H/M/L] |
| Physical | [count] | [primary option] | [H/M/L] |

Primary Recommendation:
□ Recommended approach: [description]
□ Rationale: [why this approach]
□ Expected outcome: [what we learn]
□ Risk level: [H/M/L]
□ Prerequisites: [what's needed first]

Alternative Recommendations:
1. [Alternative 1 with brief rationale]
2. [Alternative 2 with brief rationale]

Key Success Factors:
1. [Critical success factor 1]
2. [Critical success factor 2]
3. [Critical success factor 3]

Operational Constraints:
| Constraint | Impact | Workaround |
|------------|--------|------------|
| [constraint] | [impact on ops] | [if possible] |

Authorization Requirements:
| Activity | Authorization Level | Legal Review |
|----------|---------------------|--------------|
| [activity] | [who approves] | [required/not] |

Handoff to Vector (Step 9):
- Operational options documented
- Risk assessment complete
- Recommendations prioritized
- Authorization requirements identified
```

---

## STEP 8 OUTPUT

```markdown
## OPERATIONAL ASSESSMENT SUMMARY

### HUMINT Options
- Primary approach: [approach]
- Feasibility: [H/M/L]
- Risk: [H/M/L]
- Key vector: [best approach point]

### SIGINT Options
- Collection focus: [areas]
- Legal options: [list]
- Monitoring opportunities: [platforms]

### Physical Options
- Viable approaches: [list]
- Risk level: [H/M/L]
- Key locations: [list]

### Recommended Course of Action
1. [Primary recommendation]
2. [Secondary recommendation]
3. [Tertiary recommendation]

### Risk Assessment
| Dimension | Level |
|-----------|-------|
| Detection | [H/M/L] |
| Legal | [H/M/L] |
| Operational | [H/M/L] |

### Authorization Required
- [List what needs approval]
```

---

## COMPLETION CRITERIA

Before proceeding to Phase 5:

- [ ] HUMINT approach assessed
- [ ] SIGINT opportunities identified
- [ ] Physical options evaluated
- [ ] Integrated options developed
- [ ] Risk assessment complete
- [ ] Recommendations prioritized
- [ ] Authorization requirements documented

---

## PHASE 4 COMPLETE

Operational assessment is complete. Proceed to Phase 5 for final fusion and delivery.

---

## MENU OPTIONS

**[C] Continue** - Proceed to fusion & delivery (Step 9 - Phase 5)
**[H] HUMINT** - Detailed HUMINT planning
**[S] SIGINT** - Extended SIGINT analysis
**[P] Physical** - Detailed physical assessment

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-09-fusion-delivery.md`
