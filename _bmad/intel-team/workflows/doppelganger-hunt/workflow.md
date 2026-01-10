---
workflow_id: doppelganger-hunt
name: 'Doppelganger Hunt'
description: 'Identify fake accounts, sock puppets, bots, and impersonators through multi-factor authenticity analysis'
version: '1.0.0'
module: intel-team

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/doppelganger-hunt'
steps_path: '{workflow_path}/steps'
output_path: '{output_folder}/intel-reports/doppelganger-hunt'

# Workflow Configuration
primary_agent: social-media-analyst
primary_codename: Echo
classification: 'AUTHENTICITY ANALYSIS'
estimated_duration: '30-60 minutes'

# Step Files
steps:
  - name: 'Behavioral Analysis'
    file: '{steps_path}/step-01-behavioral.md'
    agent: social-media-analyst
    codename: Echo
    description: 'Posting patterns, linguistic fingerprinting, engagement authenticity, network analysis'

  - name: 'Technical Fingerprinting'
    file: '{steps_path}/step-02-technical.md'
    agent: technical-researcher
    codename: Probe
    description: 'Profile image analysis, metadata examination, cross-platform correlation, bot indicators'

  - name: 'Location Consistency'
    file: '{steps_path}/step-03-location.md'
    agent: geospatial-analyst
    codename: Atlas
    description: 'Claimed location verification, timezone analysis, cultural consistency'

  - name: 'Psychological Assessment'
    file: '{steps_path}/step-04-psychological.md'
    agent: humint-specialist
    codename: Viper
    description: 'Persona consistency, motivation assessment, deception indicators, true identity hypothesis'

# Output Configuration
output_format: 'markdown'
---

# Doppelganger Hunt

## PURPOSE

Identify and analyze fake accounts, sock puppets, coordinated inauthentic behavior, bots, and impersonators through systematic multi-factor authenticity analysis. This workflow determines whether an online persona is genuine or fabricated and, if fake, attempts to identify the true operator.

## WHEN TO USE

- Executive impersonation detection
- Brand protection and account verification
- Influence operation investigation
- Sock puppet and bot detection
- Catfishing/romance scam investigation
- Coordinated inauthentic behavior analysis
- Competitor intelligence validation
- Source verification for intelligence reporting

## TARGET TYPES

| Type | Description | Common Indicators |
|------|-------------|-------------------|
| Impersonator | Pretends to be specific person | Stolen photos, copied bio |
| Sock Puppet | Fake persona for manipulation | Multiple accounts, coordinated |
| Bot | Automated account | Unnatural patterns, API usage |
| Catfish | Fake romantic persona | Stolen photos, inconsistent story |
| Astroturf | Fake grassroots campaign | Coordinated messaging |
| Troll | Provocateur account | Inflammatory, no real identity |

## AGENTS INVOLVED

| Agent | Codename | Role in Workflow |
|-------|----------|------------------|
| social-media-analyst | Echo | Behavioral analysis, posting patterns, network mapping |
| technical-researcher | Probe | Image analysis, metadata, bot detection |
| geospatial-analyst | Atlas | Location verification, timezone analysis |
| humint-specialist | Viper | Psychological profiling, motivation assessment |

## WORKFLOW STRUCTURE

```
INPUT: Account(s) to Verify OR Impersonation Report
                    |
                    v
+-------------------------------------------------------------+
| STEP 1: BEHAVIORAL ANALYSIS                      ~15 min    |
| Agent: Echo (social-media-analyst)                          |
|-------------------------------------------------------------|
| - Posting pattern analysis                                   |
| - Linguistic fingerprinting                                  |
| - Engagement authenticity                                    |
| - Network analysis (followers/following)                     |
| - Content originality check                                  |
| - Account age vs activity correlation                        |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 2: TECHNICAL FINGERPRINTING                 ~15 min    |
| Agent: Probe (technical-researcher)                         |
|-------------------------------------------------------------|
| - Profile image reverse search                               |
| - Metadata analysis                                          |
| - Cross-platform correlation                                 |
| - Bot behavior indicators                                    |
| - API pattern analysis                                       |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 3: LOCATION CONSISTENCY                     ~10 min    |
| Agent: Atlas (geospatial-analyst)                           |
|-------------------------------------------------------------|
| - Claimed location verification                              |
| - Timezone analysis from posting times                       |
| - Photo location correlation                                 |
| - Language/cultural consistency                              |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 4: PSYCHOLOGICAL ASSESSMENT                 ~15 min    |
| Agent: Viper (humint-specialist)                            |
|-------------------------------------------------------------|
| - Persona consistency analysis                               |
| - Motivation assessment                                      |
| - Deception indicators                                       |
| - True identity hypothesis                                   |
+-------------------------------------------------------------+
                    |
                    v
OUTPUT: Authenticity Assessment Report
```

## AUTHENTICITY INDICATOR FRAMEWORK

| Category | Authentic Signals | Fake Signals |
|----------|-------------------|--------------|
| Posting | Irregular, varied times | Scheduled, uniform |
| Network | Organic growth, real interactions | Purchased followers, bot networks |
| Content | Original, personal details | Copied, generic |
| Images | Unique, consistent over time | Stock photos, AI-generated |
| Timeline | Years of history, evolution | Recent creation, sudden activity |
| Language | Consistent style, native markers | Variable patterns, translation artifacts |
| Location | Consistent indicators | Contradictory claims |
| Engagement | Real conversations | One-way, no real discussion |

## KEY DELIVERABLES

1. **Authenticity Score** (0-100) - With detailed breakdown by category
2. **Red Flag Report** - Specific indicators of inauthenticity
3. **True Identity Hypothesis** - If fake, who might be behind it
4. **Evidence Package** - Screenshots, analysis, supporting documentation
5. **Confidence Assessment** - How certain are we of the conclusion

## INPUT REQUIREMENTS

- **Required**: At least one of:
  - Social media account URL(s)
  - Username/handle(s)
  - Impersonation complaint/report
  - Known authentic account for comparison

- **Optional**:
  - Claimed identity details
  - Related accounts to analyze
  - Historical context
  - Comparison baseline

## LEGAL & ETHICAL NOTES

- This workflow uses only publicly available information
- Document all evidence for potential legal action
- Consider privacy implications
- False positives possible - recommend confirmation before action
- Respect platform Terms of Service

## INITIATION

To begin this workflow, load and execute:
`{workflow_path}/steps/step-01-behavioral.md`

---

**Workflow Version:** 1.0.0
**Created:** 2026-01-10
**Module:** intel-team
