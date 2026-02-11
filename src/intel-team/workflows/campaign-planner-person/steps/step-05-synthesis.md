---
name: 'step-05-synthesis'
description: 'Create comprehensive intelligence dossier'
estimated_duration: '20-30 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-planner-person'
thisStepFile: '{workflow_path}/steps/step-05-synthesis.md'
prevStepFile: '{workflow_path}/steps/step-04-collection.md'

# Agent Configuration
executing_agent: threat-actor-profiler
agent_codename: Dossier
---

# Step 5: Profile Synthesis & Dossier Creation

## STEP GOAL

Synthesize all collected intelligence into a comprehensive, actionable dossier on the subject. Create a complete profile that answers all PIRs, documents key findings, maps relationships, and provides analytical assessments.

## EXECUTION TIME: ~20-30 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Dossier**, Threat Actor Profiler
- You synthesize intelligence into comprehensive profiles
- You assess behavioral patterns and predict tendencies
- You create the final intelligence product

### Step-Specific Rules

- Include all verified findings with confidence levels
- Clearly separate fact from assessment
- Document intelligence gaps
- Provide analytical judgments with reasoning

---

## PROFILE SYNTHESIS SEQUENCE

### 1. Subject Profile Compilation

Create comprehensive biographical profile:

```
SUBJECT PROFILE
===============

IDENTIFICATION
--------------
Full Name: [verified name]
Aliases/Handles: [list all known]
Date of Birth: [if known] | Age: [estimated if not known]
Nationality: [if known]
Current Location: [city, country] | Confidence: [level]

CONTACT SELECTORS
-----------------
| Type | Selector | Status | Confidence |
|------|----------|--------|------------|
| Email (Primary) | [email] | [Active/Inactive] | [level] |
| Email (Secondary) | [email] | [status] | [level] |
| Phone | [number] | [status] | [level] |
| Social Handle | @[handle] | [platform] | [level] |

BIOGRAPHICAL SUMMARY
--------------------
[2-3 paragraph narrative summary of the subject based on collected intelligence]

EMPLOYMENT HISTORY
------------------
| Period | Organization | Role | Source | Confidence |
|--------|--------------|------|--------|------------|
| [dates] | [company] | [title] | [source] | [level] |
| [dates] | [company] | [title] | [source] | [level] |

EDUCATION
---------
| Period | Institution | Degree/Program | Source | Confidence |
|--------|-------------|----------------|--------|------------|
| [dates] | [school] | [degree] | [source] | [level] |

PROFESSIONAL CREDENTIALS
------------------------
□ Licenses: [list]
□ Certifications: [list]
□ Memberships: [list]
□ Publications: [list]
```

### 2. Digital Footprint Summary

Consolidate online presence:

```
DIGITAL FOOTPRINT SUMMARY
=========================

SOCIAL MEDIA PRESENCE
---------------------
| Platform | Handle | Followers | Activity | Intel Value |
|----------|--------|-----------|----------|-------------|
| LinkedIn | [url] | [count] | [High/Med/Low] | [value] |
| Twitter/X | [url] | [count] | [activity] | [value] |
| Instagram | [url] | [count] | [activity] | [value] |
| Facebook | [url] | [count] | [activity] | [value] |
| [Other] | [url] | [count] | [activity] | [value] |

TECHNICAL PRESENCE
------------------
□ Personal website/blog: [url]
□ GitHub/GitLab: [url]
□ Technical forums: [list]
□ Domain ownership: [list]

CONTENT THEMES
--------------
Primary topics: [list]
Tone/Voice: [description]
Posting frequency: [assessment]
Engagement level: [assessment]

BREACH EXPOSURE SUMMARY
-----------------------
| Breach | Date | Data Types Exposed | Current Risk |
|--------|------|-------------------|--------------|
| [breach] | [date] | [types] | [risk level] |

Total breaches: [count]
Credential exposure: [Yes/No - details]
PII exposure: [Yes/No - details]
```

### 3. Network & Relationship Map

Document key relationships:

```
NETWORK ANALYSIS
================

KEY RELATIONSHIPS
-----------------

INNER CIRCLE (High Trust/Influence):
| Name | Relationship | Evidence | Intel Value |
|------|--------------|----------|-------------|
| [name] | [Family/Partner/Close Friend] | [source] | [value] |
| [name] | [relationship] | [source] | [value] |

PROFESSIONAL NETWORK:
| Name | Relationship | Organization | Evidence |
|------|--------------|--------------|----------|
| [name] | [Colleague/Boss/Report] | [org] | [source] |
| [name] | [relationship] | [org] | [source] |

SOCIAL NETWORK:
| Name/Group | Connection Type | Platform | Notes |
|------------|-----------------|----------|-------|
| [name] | [Friend/Acquaintance] | [platform] | [notes] |
| [group] | [Member] | [platform] | [notes] |

NETWORK VISUALIZATION DATA:
[For export to visualization tool]

Nodes:
- Subject (central)
- [Node 2] - [relationship type]
- [Node 3] - [relationship type]
- [Node 4] - [relationship type]

Edges:
- Subject ↔ [Node 2]: [strength, type]
- Subject ↔ [Node 3]: [strength, type]
- [Node 2] ↔ [Node 4]: [if connected]

NETWORK ASSESSMENT:
- Network size: [estimated connections]
- Network diversity: [assessment]
- Influence level: [assessment]
- Key gatekeepers: [people who control access]
```

### 4. Behavioral Analysis

Assess patterns and tendencies:

```
BEHAVIORAL ANALYSIS
===================

COMMUNICATION PATTERNS
----------------------
Preferred channels: [list in order of preference]
Response patterns: [typical response time, style]
Active hours: [when most active online]
Language/Tone: [formal, casual, technical, etc]

PSYCHOLOGICAL PROFILE
---------------------
(From Step 3 HUMINT Prep, refined with collection data)

Personality Assessment:
- Extraversion: [assessment with evidence]
- Openness: [assessment with evidence]
- Conscientiousness: [assessment with evidence]
- Agreeableness: [assessment with evidence]
- Emotional stability: [assessment with evidence]

Motivations:
- Primary drivers: [what motivates them]
- Professional goals: [evidence-based assessment]
- Personal values: [observable values]

BEHAVIORAL INDICATORS
---------------------
□ Risk tolerance: [High/Medium/Low] - Evidence: [examples]
□ Decision-making style: [description] - Evidence: [examples]
□ Stress responses: [if observable] - Evidence: [examples]
□ Conflict style: [if observable] - Evidence: [examples]

PREDICTABILITY ASSESSMENT
-------------------------
Based on observed patterns, subject is likely to:
- [Predicted behavior 1] - Confidence: [level]
- [Predicted behavior 2] - Confidence: [level]
- [Predicted behavior 3] - Confidence: [level]
```

### 5. Location Intelligence Summary

Consolidate geographic information:

```
LOCATION INTELLIGENCE
=====================

CURRENT LOCATION
----------------
Primary residence: [address/area] | Confidence: [level]
Work location: [address/area] | Confidence: [level]
Evidence: [sources supporting location determination]

LOCATION HISTORY
----------------
| Period | Location | Evidence | Purpose |
|--------|----------|----------|---------|
| [dates] | [location] | [source] | [residence/work/travel] |
| [dates] | [location] | [source] | [purpose] |

PATTERN ANALYSIS
----------------
Regular locations: [list frequent locations]
Travel patterns: [observed travel behavior]
Schedule indicators: [routine patterns if observable]

GEOGRAPHIC CONTEXT
------------------
[Assessment of location significance - neighborhood type, proximity to relevant places, etc]
```

### 6. PIR Response Summary

Directly answer each PIR:

```
PIR RESPONSE SUMMARY
====================

PIR-1: [Original Question]
--------------------------
ANSWER: [Direct answer to the PIR]
CONFIDENCE: [High/Medium/Low]
KEY EVIDENCE:
- [Evidence point 1]
- [Evidence point 2]
- [Evidence point 3]
GAPS: [What we couldn't determine]

PIR-2: [Original Question]
--------------------------
ANSWER: [Direct answer to the PIR]
CONFIDENCE: [High/Medium/Low]
KEY EVIDENCE:
- [Evidence point 1]
- [Evidence point 2]
GAPS: [What we couldn't determine]

PIR-3: [Original Question]
--------------------------
ANSWER: [Direct answer to the PIR]
CONFIDENCE: [High/Medium/Low]
KEY EVIDENCE:
- [Evidence point 1]
- [Evidence point 2]
GAPS: [What we couldn't determine]

PIR-4: [Original Question]
--------------------------
ANSWER: [Direct answer to the PIR]
CONFIDENCE: [High/Medium/Low]
KEY EVIDENCE:
- [Evidence point 1]
- [Evidence point 2]
GAPS: [What we couldn't determine]
```

### 7. Intelligence Gaps & Recommendations

Document unknowns and next steps:

```
INTELLIGENCE GAPS
=================

CRITICAL GAPS (affect core PIRs):
| Gap | Impact | Potential Collection Method |
|-----|--------|----------------------------|
| [what we don't know] | [which PIR affected] | [how to fill] |

MODERATE GAPS (would enhance profile):
| Gap | Impact | Potential Collection Method |
|-----|--------|----------------------------|
| [what we don't know] | [area affected] | [how to fill] |

COLLECTION BARRIERS ENCOUNTERED
-------------------------------
- [Barrier 1]: [description and impact]
- [Barrier 2]: [description and impact]

RECOMMENDATIONS FOR FURTHER COLLECTION
--------------------------------------
If additional collection authorized:
1. [Specific collection recommendation]
2. [Specific collection recommendation]
3. [Specific collection recommendation]
```

### 8. Generate Final Dossier

Compile complete intelligence product:

```markdown
# INTELLIGENCE DOSSIER

## CLASSIFICATION: [CONFIDENTIAL / INTERNAL / CLIENT-SHAREABLE]

**Dossier ID:** CP-PERSON-[DATE]-[RANDOM]
**Subject:** [Subject Name]
**Generated:** [Timestamp]
**Campaign Lead:** Vector (OSINT Lead)
**Profile Author:** Dossier (Threat Actor Profiler)

---

## EXECUTIVE SUMMARY

[3-5 sentence overview of key findings and overall assessment]

**Overall Confidence:** [High/Medium/Low]
**PIR Satisfaction:** [X]% of requirements met
**Key Finding:** [Single most important discovery]

---

## SUBJECT IDENTIFICATION

[Identification section from above]

---

## PROFILE SUMMARY

### Background
[Narrative summary - 2-3 paragraphs covering education, career, current status]

### Digital Presence
[Summary of online footprint - platforms, activity level, content themes]

### Network
[Summary of key relationships and network position]

### Behavioral Assessment
[Summary of personality, communication style, patterns]

---

## DETAILED FINDINGS

### Employment & Professional
[Detailed employment history and professional assessment]

### Digital Footprint
[Detailed platform presence and content analysis]

### Network Analysis
[Detailed relationship mapping]

### Location Intelligence
[Detailed geographic assessment]

### Technical Profile
[Infrastructure, domains, breach exposure]

### Behavioral Profile
[Psychological assessment, patterns, predictions]

---

## PIR RESPONSES

[Full PIR response section]

---

## INTELLIGENCE ASSESSMENT

### Key Judgments
1. [Analytical judgment with confidence level and reasoning]
2. [Analytical judgment with confidence level and reasoning]
3. [Analytical judgment with confidence level and reasoning]

### Risk Assessment (if applicable)
[Assessment of any risks posed by or to the subject]

### Reliability Assessment
| Source Type | Quality | Quantity | Weight |
|-------------|---------|----------|--------|
| Social Media | [assessment] | [count] | [weight] |
| Public Records | [assessment] | [count] | [weight] |
| Technical | [assessment] | [count] | [weight] |
| HUMINT | [assessment] | [count] | [weight] |

---

## INTELLIGENCE GAPS

[Gaps section from above]

---

## COLLECTION LOG

### Sources Consulted
| Source Type | Sources Checked | Findings | Agent |
|-------------|-----------------|----------|-------|
| Social Media | [list] | [count] | Echo |
| Technical | [list] | [count] | Probe |
| Geographic | [list] | [count] | Atlas |
| Dark Web | [list] | [count] | Shadow |
| HUMINT | [list] | [count] | Viper |

### Timeline
| Date | Activity | Agent | Findings |
|------|----------|-------|----------|
| [date] | [activity] | [agent] | [summary] |

---

## APPENDICES

### A. Full Social Media Analysis
[Detailed platform-by-platform findings]

### B. Network Diagram
[Visual or structured network representation]

### C. Timeline
[Chronological event timeline]

### D. Raw Collection Notes
[Detailed collection log if needed]

---

**Dossier Prepared By:** Dossier (Threat Actor Profiler)
**Collection Coordinated By:** Vector (OSINT Lead)
**Contributing Agents:** Echo, Probe, Atlas, Shadow, Viper
**Version:** 1.0
**Distribution:** [As per classification]
```

---

## COMPLETION CRITERIA

Before finalizing dossier:

- [ ] Subject profile complete
- [ ] Digital footprint documented
- [ ] Network mapped
- [ ] Behavioral analysis complete
- [ ] All PIRs addressed
- [ ] Intelligence gaps documented
- [ ] Confidence assessments assigned
- [ ] Final dossier generated

---

## MENU OPTIONS

**[R] Report** - Export final dossier
**[E] Expand** - Add detail to specific section
**[G] Gaps** - Plan additional collection
**[N] New Campaign** - Start new investigation

---

## WORKFLOW COMPLETE

This concludes the Campaign Planner: Person workflow. The intelligence dossier should be reviewed, approved, and distributed according to classification guidelines.

**Handoff Options:**

- Return to Intel Team menu for new workflow
- Export dossier in preferred format
- Brief stakeholders on findings
- Initiate follow-on investigation (Spider Web for network expansion, Breach Archaeology for exposure detail)
