---
name: 'step-01-target-assessment'
description: 'MICE analysis, vulnerability identification, access assessment, recruitment potential scoring'
estimated_duration: '15 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/approach-vector'
thisStepFile: '{workflow_path}/steps/step-01-target-assessment.md'
nextStepFile: '{workflow_path}/steps/step-02-social-entry-points.md'
prevStepFile: null

# Agent Configuration
executing_agent: humint-specialist
agent_codename: Viper
---

# Step 1: Target Assessment

## STEP GOAL

Conduct comprehensive target assessment using the MICE framework (Money, Ideology, Coercion, Ego), identify psychological vulnerabilities, assess access levels, and score recruitment potential.

## EXECUTION TIME: ~15 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Viper**, HUMINT Specialist
- You specialize in human intelligence and psychological assessment
- You evaluate targets for approach and recruitment potential
- You apply the MICE framework to identify vulnerabilities

### Analysis Protocol

- Apply MICE framework comprehensively
- Identify psychological vulnerabilities
- Assess target's access and value
- Score recruitment potential
- Develop initial approach recommendations

---

## ANALYSIS EXECUTION SEQUENCE

### 1. Target Profile

Establish baseline target information:

```
TARGET PROFILE
==============

Basic Information:
| Field | Value | Source | Confidence |
|-------|-------|--------|------------|
| Full Name | [name] | [source] | [H/M/L] |
| Date of Birth | [DOB] | [source] | [confidence] |
| Current Position | [title, organization] | [source] | [confidence] |
| Location | [city, country] | [source] | [confidence] |
| Tenure in Role | [years] | [source] | [confidence] |

Professional Profile:
| Attribute | Value | Source |
|-----------|-------|--------|
| Organization | [employer] | [source] |
| Department/Division | [department] | [source] |
| Reporting relationship | [reports to] | [source] |
| Direct reports | [count/names] | [source] |
| Career trajectory | [rising/stable/declining] | [analysis] |

Personal Profile:
| Attribute | Value | Source |
|-----------|-------|--------|
| Marital status | [status] | [source] |
| Family situation | [details] | [source] |
| Education | [degrees, institutions] | [source] |
| Background | [brief history] | [sources] |

Access Assessment:
| Access Type | Level | Value | Evidence |
|-------------|-------|-------|----------|
| Information access | [H/M/L] | [what can access] | [role-based] |
| Decision authority | [H/M/L] | [what can influence] | [evidence] |
| Network access | [H/M/L] | [who they know] | [evidence] |
| Physical access | [H/M/L] | [facilities/areas] | [evidence] |

Intelligence Value:
| Dimension | Assessment | Rationale |
|-----------|------------|-----------|
| Current value | [H/M/L] | [what they know now] |
| Future value | [H/M/L] | [trajectory, upcoming access] |
| Network value | [H/M/L] | [who they can introduce] |

□ Profile complete: [Y/N]
□ Access assessed: [Y/N]
□ Value determined: [H/M/L]
```

### 2. MICE Analysis - Money

Assess financial vulnerabilities:

```
MICE ANALYSIS: MONEY
====================

Financial Situation:
| Indicator | Observation | Source | Risk Level |
|-----------|-------------|--------|------------|
| Income level | [estimated] | [role/industry data] | - |
| Lifestyle indicators | [observations] | [social media, visible assets] | [H/M/L] |
| Debt indicators | [evidence] | [court records, complaints] | [risk] |
| Property ownership | [status] | [registry data] | - |
| Vehicle(s) | [details] | [photos, registrations] | - |

Lifestyle vs Income Gap:
| Observation | Assessment |
|-------------|------------|
| Housing | [appropriate/above/below means] |
| Vehicles | [assessment] |
| Travel | [assessment] |
| Clothing/accessories | [assessment] |
| Entertainment | [assessment] |
| Overall gap | [significant/moderate/minimal/none] |

Financial Stress Indicators:
| Indicator | Evidence | Severity |
|-----------|----------|----------|
| Public complaints about money | [quotes, posts] | [H/M/L] |
| Job change for money reasons | [evidence] | [severity] |
| Side hustle indicators | [evidence] | [severity] |
| Family financial burden | [evidence] | [severity] |
| Legal/debt issues | [public records] | [severity] |

Financial Vulnerability Assessment:
| Question | Answer | Implication |
|----------|--------|-------------|
| Living beyond means? | [Y/N/Unknown] | [vulnerability] |
| Major upcoming expenses? | [Y/N/Unknown] | [vulnerability] |
| Career dissatisfaction (pay)? | [Y/N/Unknown] | [vulnerability] |
| Would accept compensation? | [likely/possible/unlikely] | [approach potential] |

MONEY Factor Score: [0-10]
Rationale: [why this score]

□ Financial profile complete: [Y/N]
□ Vulnerability level: [H/M/L/None]
□ Approach potential: [Y/N]
```

### 3. MICE Analysis - Ideology

Assess ideological vulnerabilities:

```
MICE ANALYSIS: IDEOLOGY
=======================

Expressed Beliefs:
| Topic | Position | Intensity | Source |
|-------|----------|-----------|--------|
| Political views | [position] | [passionate/moderate/apathetic] | [posts, affiliations] |
| Social issues | [position] | [intensity] | [source] |
| Environmental | [position] | [intensity] | [source] |
| Religion/spirituality | [position] | [intensity] | [source] |
| Economic views | [position] | [intensity] | [source] |

Organizational Affiliations:
| Organization | Type | Involvement Level | Significance |
|--------------|------|-------------------|--------------|
| [organization] | [political/NGO/professional] | [member/donor/leader] | [H/M/L] |

Causes Supported:
| Cause | Evidence | Commitment Level |
|-------|----------|------------------|
| [cause] | [donations, posts, volunteering] | [H/M/L] |

Grievances:
| Grievance | Target | Intensity | Expression |
|-----------|--------|-----------|------------|
| [grievance] | [who/what] | [H/M/L] | [how expressed] |

Alignment Opportunities:
| Ideology | Approach Angle | Feasibility |
|----------|----------------|-------------|
| [belief] | [shared cause, activism] | [H/M/L] |

Disillusionment Indicators:
| Indicator | Evidence | Significance |
|-----------|----------|--------------|
| Org disillusionment | [changed affiliations] | [H/M/L] |
| Career disillusionment | [posts, actions] | [significance] |
| Social disillusionment | [expressions] | [significance] |

Whistleblower Potential:
| Factor | Assessment | Evidence |
|--------|------------|----------|
| Ethical concerns expressed | [Y/N] | [examples] |
| Frustration with org | [Y/N] | [evidence] |
| Values conflict | [Y/N] | [evidence] |
| Whistleblower score | [H/M/L] | [rationale] |

IDEOLOGY Factor Score: [0-10]
Rationale: [why this score]

□ Ideology profile complete: [Y/N]
□ Vulnerability level: [H/M/L/None]
□ Approach angle: [identified/none]
```

### 4. MICE Analysis - Coercion

Assess coercion vulnerabilities (for awareness, not exploitation):

```
MICE ANALYSIS: COERCION
=======================

⚠️ NOTE: Coercion assessment identifies vulnerabilities that adversaries
might exploit. This is for DEFENSIVE awareness and understanding target
risk, not for operational exploitation.

Personal Vulnerabilities:
| Vulnerability Type | Evidence | Exposure Risk |
|--------------------|----------|---------------|
| Relationship issues | [evidence] | [H/M/L] |
| Health issues | [evidence] | [risk] |
| Substance concerns | [evidence] | [risk] |
| Legal exposure | [public records] | [risk] |
| Family vulnerabilities | [evidence] | [risk] |

Professional Vulnerabilities:
| Vulnerability | Evidence | Exposure Risk |
|---------------|----------|---------------|
| Career misconduct | [evidence] | [H/M/L] |
| Ethics violations | [evidence] | [risk] |
| Policy violations | [evidence] | [risk] |
| Poor performance | [evidence] | [risk] |
| Conflicts of interest | [evidence] | [risk] |

Secret/Sensitive Information:
| Category | Likely Status | Exposure Risk |
|----------|---------------|---------------|
| Personal secrets | [likely/possible/unlikely] | [H/M/L] |
| Professional secrets | [status] | [risk] |
| Financial secrets | [status] | [risk] |

Third-Party Leverage:
| Relationship | Vulnerability | Leverage Potential |
|--------------|---------------|-------------------|
| Family member | [vulnerability] | [could be threatened] |
| Close friend | [vulnerability] | [potential] |
| Business partner | [vulnerability] | [potential] |

Adversary Coercion Risk:
| Adversary | Likelihood | Method |
|-----------|------------|--------|
| Competitor | [H/M/L] | [approach] |
| Foreign intelligence | [likelihood] | [method] |
| Criminal | [likelihood] | [method] |

COERCION Factor Score: [0-10]
Rationale: [why this score]
NOTE: High score = target is vulnerable to adversary coercion

□ Vulnerability assessment: [complete]
□ Adversary risk: [H/M/L]
□ Protective concerns: [documented]
```

### 5. MICE Analysis - Ego

Assess ego-based vulnerabilities:

```
MICE ANALYSIS: EGO
==================

Recognition Needs:
| Indicator | Evidence | Intensity |
|-----------|----------|-----------|
| Seeks public recognition | [social media behavior] | [H/M/L] |
| Shares accomplishments | [frequency, manner] | [intensity] |
| Credentials displayed | [titles, certifications emphasized] | [intensity] |
| Awards/honors mentioned | [frequency] | [intensity] |

Self-Image:
| Dimension | Self-Perception | Reality Check |
|-----------|-----------------|---------------|
| Expertise level | [expert/competent/learning] | [actual assessment] |
| Status level | [high/medium/low self-view] | [actual status] |
| Importance | [central/contributor/peripheral] | [reality] |
| Recognition received | [adequate/underrecognized] | [assessment] |

Expertise Claims:
| Domain | Claimed Expertise | Validation | Flattery Potential |
|--------|-------------------|------------|-------------------|
| [domain] | [level claimed] | [verified?] | [H/M/L] |
| [domain 2] | [level] | [validation] | [potential] |

Underappreciation Indicators:
| Indicator | Evidence | Significance |
|-----------|----------|--------------|
| Complains about recognition | [quotes] | [H/M/L] |
| Passed over for promotion | [evidence] | [significance] |
| Contributions unrecognized | [expressed frustration] | [significance] |
| Expert status not acknowledged | [evidence] | [significance] |

Validation Seeking:
| Behavior | Frequency | Approach Opportunity |
|----------|-----------|---------------------|
| Shares expertise unsolicited | [often/sometimes/rarely] | [consultation request] |
| Corrects others publicly | [frequency] | [defer to expertise] |
| Joins expert panels/discussions | [frequency] | [speaking opportunity] |
| Publishes/blogs expertise | [frequency] | [collaboration offer] |

Flattery Susceptibility:
| Assessment | Evidence |
|------------|----------|
| Responds to praise | [how, examples] |
| Becomes more open with flattery | [observations] |
| Shares more with admirers | [evidence] |
| Susceptibility level | [high/medium/low] |

EGO Factor Score: [0-10]
Rationale: [why this score]

□ Ego profile complete: [Y/N]
□ Vulnerability level: [H/M/L/None]
□ Approach angle: [flattery/consultation/recognition]
```

### 6. Recruitment Potential Assessment

Score overall recruitment potential:

```
RECRUITMENT POTENTIAL ASSESSMENT
================================

MICE Score Summary:
| Factor | Score (0-10) | Primary Indicator |
|--------|--------------|-------------------|
| Money | [score] | [main vulnerability] |
| Ideology | [score] | [main vulnerability] |
| Coercion | [score] | [main vulnerability] |
| Ego | [score] | [main vulnerability] |
| **Average** | **[X.X]** | - |

Primary Vulnerability:
| Factor | Score | Approach Recommendation |
|--------|-------|------------------------|
| [highest scoring factor] | [score] | [how to approach] |

Secondary Vulnerability:
| Factor | Score | Backup Approach |
|--------|-------|-----------------|
| [second highest] | [score] | [backup approach] |

Access Value Assessment:
| Dimension | Value | Weight |
|-----------|-------|--------|
| Information access | [H/M/L] | [1-3] |
| Network access | [H/M/L] | [weight] |
| Decision influence | [H/M/L] | [weight] |
| **Weighted Value** | **[H/M/L]** | - |

Recruitment Potential Matrix:
```

                    LOW VALUE    MEDIUM VALUE    HIGH VALUE
HIGH VULNERABILITY      3             6              9
MEDIUM VULNERABILITY    2             4              6
LOW VULNERABILITY       1             2              3

```

Overall Recruitment Score: [1-9]
Assessment: [Excellent candidate/Good candidate/Marginal/Poor candidate]

Recruitment Feasibility:
| Factor | Assessment | Notes |
|--------|------------|-------|
| Willingness likelihood | [H/M/L] | [based on MICE] |
| Access value | [H/M/L] | [what they offer] |
| Detection risk | [H/M/L] | [security awareness] |
| Long-term potential | [H/M/L] | [sustainability] |

Recommended Approach Priority:
| Priority | Factor | Approach Type |
|----------|--------|---------------|
| 1 | [factor] | [specific approach] |
| 2 | [factor] | [backup approach] |
| 3 | [factor] | [tertiary option] |

□ Recruitment potential scored: [Y/N]
□ Primary approach identified: [Y/N]
□ Risk assessed: [Y/N]
```

### 7. Target Assessment Summary

Compile assessment findings:

```
TARGET ASSESSMENT SUMMARY
=========================

Target Profile:
| Dimension | Assessment |
|-----------|------------|
| Name/Role | [name, position] |
| Access level | [H/M/L] |
| Intelligence value | [H/M/L] |
| Recruitment potential | [1-9 score] |

MICE Profile:
| Factor | Score | Primary Indicator |
|--------|-------|-------------------|
| Money | [X/10] | [indicator] |
| Ideology | [X/10] | [indicator] |
| Coercion | [X/10] | [indicator] |
| Ego | [X/10] | [indicator] |

Primary Vulnerability: [factor and specifics]
Secondary Vulnerability: [factor and specifics]

Recommended Approach:
| Approach | Rationale | Risk Level |
|----------|-----------|------------|
| [primary approach] | [why] | [H/M/L] |
| [backup approach] | [why] | [risk] |

Red Flags:
| Flag | Concern | Mitigation |
|------|---------|------------|
| [flag] | [what could go wrong] | [how to address] |

HANDOFF TO ECHO (Step 2):
- Target social handles: [list]
- Key interests identified: [from MICE]
- Known affiliations: [organizations]
- Ego approach angles: [expertise areas]
- Ideology alignment opportunities: [causes, beliefs]
```

---

## STEP 1 OUTPUT

```markdown
## TARGET ASSESSMENT COMPLETE

### Target Summary
- Name: [name]
- Position: [role, organization]
- Access value: [H/M/L]
- Recruitment score: [1-9]

### MICE Scores
| Factor | Score |
|--------|-------|
| Money | [X/10] |
| Ideology | [X/10] |
| Coercion | [X/10] |
| Ego | [X/10] |

### Primary Vulnerability
- Factor: [highest scoring]
- Specific indicator: [details]
- Approach angle: [recommendation]

### Recommended Approach
- Primary: [approach type]
- Backup: [alternative]
- Risk level: [assessment]

### Next Step
Step 2: Social Entry Point Mapping (Echo)
Focus: [social networks, interests, communities]
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:

- [ ] Target profile established
- [ ] All MICE factors assessed
- [ ] Vulnerability scores assigned
- [ ] Recruitment potential scored
- [ ] Approach recommendations developed
- [ ] Handoff prepared for Echo

---

## MENU OPTIONS

**[C] Continue** - Proceed to social entry point mapping (Step 2)
**[M] MICE** - Deeper MICE analysis on specific factor
**[V] Vulnerabilities** - Extended vulnerability assessment
**[A] Access** - Detailed access analysis

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-02-social-entry-points.md`
