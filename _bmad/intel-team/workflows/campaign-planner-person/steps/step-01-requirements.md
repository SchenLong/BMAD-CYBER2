---
name: 'step-01-requirements'
description: 'Define PIRs, scope boundaries, and collection priorities'
estimated_duration: '15-20 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-planner-person'
thisStepFile: '{workflow_path}/steps/step-01-requirements.md'
nextStepFile: '{workflow_path}/steps/step-02-pivot-mapping.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
---

# Step 1: Intelligence Requirements Definition

## STEP GOAL

Establish a formal collection management framework before beginning investigation. Define what intelligence is needed, why it's needed, and what constraints apply to collection activities.

## EXECUTION TIME: ~15-20 minutes

## MANDATORY EXECUTION RULES

### Agent Role
- You are **Vector**, OSINT Lead
- You define the intelligence requirements and scope
- You create the collection management plan
- You ensure legal and ethical boundaries are established

### Step-Specific Rules
- Never skip the scope definition
- Document legal authority for investigation
- Establish clear boundaries before collection begins
- Prioritize requirements by operational need

---

## REQUIREMENTS DEFINITION SEQUENCE

### 1. Target Identification & Validation

Gather and validate all known selectors for the subject:

```
TARGET IDENTIFICATION
=====================

Subject Basic Information:
- Full Legal Name: [name]
- Known Aliases/Handles: [list]
- Date of Birth: [if known]
- Location (General): [city, region, country]
- Nationality: [if known]

Initial Selectors:
□ Email addresses: [list all known]
□ Phone numbers: [list all known]
□ Social media handles: [list all known]
□ Physical address: [if known]
□ Employer/Organization: [if known]
□ Professional licenses: [if applicable]
□ Vehicle/Property records: [if applicable]

Selector Validation:
| Selector | Confidence | Source |
|----------|------------|--------|
| [selector] | [High/Med/Low] | [how obtained] |
```

### 2. Priority Intelligence Requirements (PIRs)

Define what intelligence is actually needed:

```
PRIORITY INTELLIGENCE REQUIREMENTS
==================================

Investigation Purpose:
[Clearly state why this investigation is being conducted]

□ Background check for employment
□ Due diligence for business deal
□ Security/threat assessment
□ Fraud investigation
□ Missing person/locate
□ Legal/litigation support
□ Competitive intelligence
□ Personal safety concern
□ Other: [specify]

PIR 1 (Highest Priority):
Question: [What must we answer?]
Indicators: [What would answer this?]
Collection Focus: [Where to look]

PIR 2:
Question: [What must we answer?]
Indicators: [What would answer this?]
Collection Focus: [Where to look]

PIR 3:
Question: [What must we answer?]
Indicators: [What would answer this?]
Collection Focus: [Where to look]

PIR 4:
Question: [What must we answer?]
Indicators: [What would answer this?]
Collection Focus: [Where to look]

Standing Information Requirements (SIRs):
- General background and history
- Current location and activities
- Network/associations
- Online presence and behavior
- Risk indicators (if applicable)
```

### 3. Scope Boundaries

Establish what is in-scope and out-of-scope:

```
SCOPE DEFINITION
================

Geographic Scope:
□ Domestic only
□ International - specific regions: [list]
□ No geographic restrictions

Temporal Scope:
□ Current status only (last 12 months)
□ Extended history (last 5 years)
□ Full lifecycle (available history)
□ Specific period: [dates]

Collection Methods Authorized:
□ Passive OSINT (public records, social media scraping)
□ Active OSINT (account registration, direct queries)
□ Technical collection (infrastructure analysis, breach data)
□ HUMINT (social engineering, direct contact)
□ Physical surveillance (NOT typically authorized)

Explicitly OUT OF SCOPE:
- [ ] [Activity or area not to be pursued]
- [ ] [Activity or area not to be pursued]
- [ ] [Activity or area not to be pursued]

Legal Authority:
□ Internal investigation authority
□ Client authorization for background check
□ Legal process (subpoena, warrant)
□ Law enforcement investigation
□ Journalistic investigation
□ Personal/private investigation
□ Other: [specify]

Documentation Required:
[Reference to authorization document if applicable]
```

### 4. Operational Security Considerations

Define OPSEC requirements:

```
OPERATIONAL SECURITY PLAN
=========================

Sensitivity Level:
□ Routine - Standard collection practices
□ Sensitive - Subject should not become aware of investigation
□ Highly Sensitive - Operational security critical

OPSEC Measures Required:
□ Use anonymous/research accounts (not personal)
□ VPN/anonymization for web research
□ No direct contact with subject
□ No contact with subject's known associates
□ Avoid pattern-detectable access
□ Use time delays between platform queries
□ Document all collection for legal defensibility

Counter-Detection Considerations:
- Target technical sophistication: [High/Medium/Low]
- Likelihood of monitoring their own presence: [assessment]
- Known connections to security professionals: [if any]

Investigator Profile:
- Accounts to use: [list or "create fresh"]
- VPN requirement: [Yes/No]
- Location masking: [Yes/No]
```

### 5. Collection Management Plan

Create structured collection roadmap:

```
COLLECTION MANAGEMENT PLAN
==========================

Phase 1: Passive Collection (No target interaction)
| INT Type | Agent | Target Data | Sources to Check |
|----------|-------|-------------|------------------|
| OSINT | Vector | Background | Public records, news |
| SOCMINT | Echo | Social footprint | All major platforms |
| TECHINT | Probe | Digital infrastructure | Domain, email analysis |
| GEOINT | Atlas | Location patterns | Geotagged content |
| FININT | - | Financial indicators | Public filings, records |

Phase 2: Active Collection (If authorized)
| INT Type | Agent | Target Data | Methods |
|----------|-------|-------------|---------|
| HUMINT | Viper | Direct intelligence | [methods if authorized] |
| Active OSINT | Echo | Account interactions | [methods if authorized] |

Phase 3: Deep Dive (Based on initial findings)
[To be determined based on Phase 1/2 results]

Collection Priorities:
1. [First priority - most critical PIR]
2. [Second priority]
3. [Third priority]
4. [Fourth priority]

Coordination Notes:
- Lead agent: Vector
- Parallel collection: Echo + Probe (Step 4)
- Sequential: Echo findings inform Viper approach
```

### 6. Output Requirements

Define what the final product should include:

```
OUTPUT REQUIREMENTS
===================

Required Deliverables:
□ Subject Profile (biographical, professional, social)
□ Network Map (key relationships and associations)
□ Timeline (significant events and activities)
□ Risk Assessment (if applicable to investigation purpose)
□ Intelligence Gaps (what we couldn't determine)
□ Source Log (all sources checked with findings)

Format Requirements:
□ Markdown report
□ Visual network diagram (if significant network)
□ Timeline visualization (if significant history)
□ Executive summary (1-page overview)

Classification:
□ Internal use only
□ Shareable with client
□ Legal/evidentiary standard required
□ Other: [specify]
```

---

## REQUIREMENTS OUTPUT

```markdown
## COLLECTION MANAGEMENT SUMMARY

### Target
**Name:** [Subject name]
**Known Selectors:** [count] identifiers validated
**Initial Confidence:** [High/Medium/Low]

### Investigation Scope
**Purpose:** [one-line description]
**Authority:** [legal basis]
**Sensitivity:** [level]

### Priority Intelligence Requirements
1. **PIR-1:** [question]
2. **PIR-2:** [question]
3. **PIR-3:** [question]
4. **PIR-4:** [question]

### Collection Authorization
- Passive OSINT: [Yes/No]
- Active OSINT: [Yes/No]
- HUMINT: [Yes/No]
- Technical: [Yes/No]

### Boundaries
- Geographic: [scope]
- Temporal: [scope]
- Excluded: [key exclusions]

### OPSEC Posture
[Brief description of operational security requirements]

### Ready for Collection
All requirements defined and authorized. Proceed to identity pivot mapping.
```

---

## COMPLETION CRITERIA

Before proceeding to Step 2:
- [ ] All known selectors documented and validated
- [ ] PIRs clearly defined (4+ requirements)
- [ ] Scope boundaries established
- [ ] Legal authority documented
- [ ] OPSEC requirements defined
- [ ] Collection plan created

---

## MENU OPTIONS

**[C] Continue** - Proceed to identity pivot mapping (Step 2)
**[P] PIRs** - Refine priority intelligence requirements
**[S] Scope** - Adjust scope boundaries
**[O] OPSEC** - Review operational security plan

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-02-pivot-mapping.md`
