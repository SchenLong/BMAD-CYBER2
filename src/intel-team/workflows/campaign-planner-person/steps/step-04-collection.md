---
name: 'step-04-collection'
description: 'Execute coordinated multi-INT collection'
estimated_duration: '30-45 minutes'

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/campaign-planner-person'
thisStepFile: '{workflow_path}/steps/step-04-collection.md'
nextStepFile: '{workflow_path}/steps/step-05-synthesis.md'
prevStepFile: '{workflow_path}/steps/step-03-humint-prep.md'

# Agent Configuration
executing_agent: osint-lead
agent_codename: Vector
coordinating_agents:
  - social-media-analyst (Echo)
  - technical-researcher (Probe)
  - geospatial-analyst (Atlas)
  - dark-web-analyst (Shadow)
  - corporate-intel-specialist (Proxy)
  - humint-specialist (Viper)
---

# Step 4: Collection Execution

## STEP GOAL

Execute the coordinated multi-INT collection plan developed in previous steps. Vector coordinates parallel collection efforts from specialist agents, manages information flow, and ensures comprehensive coverage of all PIRs.

## EXECUTION TIME: ~30-45 minutes

## MANDATORY EXECUTION RULES

### Agent Role

- You are **Vector**, OSINT Lead
- You coordinate collection across all agents
- You track progress against PIRs
- You identify gaps and redirect collection efforts

### Coordination Protocol

- Dispatch parallel collection tasks to specialists
- Aggregate and deduplicate findings
- Track PIR satisfaction in real-time
- Escalate high-value discoveries
- Document all sources

---

## COLLECTION EXECUTION SEQUENCE

### 1. Collection Kickoff

Initialize coordinated collection:

```
COLLECTION KICKOFF
==================

PIR Tracking Matrix:
| PIR | Question | Assigned Agent | Status | Findings |
|-----|----------|----------------|--------|----------|
| PIR-1 | [question] | [agent(s)] | Not Started | - |
| PIR-2 | [question] | [agent(s)] | Not Started | - |
| PIR-3 | [question] | [agent(s)] | Not Started | - |
| PIR-4 | [question] | [agent(s)] | Not Started | - |

Collection Tasking:
| Agent | Codename | Collection Focus | Priority |
|-------|----------|------------------|----------|
| social-media-analyst | Echo | Deep social analysis | HIGH |
| technical-researcher | Probe | Infrastructure/technical | HIGH |
| geospatial-analyst | Atlas | Location intelligence | MEDIUM |
| dark-web-analyst | Shadow | Breach/dark web exposure | MEDIUM |
| corporate-intel-specialist | Proxy | Corporate affiliations | MEDIUM |
| humint-specialist | Viper | [If authorized] | [As applicable] |

Parallel Execution:
→ Echo, Probe, Atlas, Shadow, Proxy begin concurrent collection
→ Vector monitors and coordinates
→ Findings aggregated in real-time
```

### 2. SOCMINT Deep Collection (Echo)

```
ECHO: SOCIAL MEDIA DEEP COLLECTION
==================================

Deep Platform Analysis:

LINKEDIN INTELLIGENCE:
□ Full employment history extracted
□ Education history extracted
□ Skills/endorsements analyzed
□ Recommendations reviewed
□ Activity feed analyzed (posts, comments, reactions)
□ Groups/associations identified
□ Connection overlap with known entities
Findings: [summary]

TWITTER/X INTELLIGENCE:
□ Full tweet history analyzed (or sample if voluminous)
□ Retweet patterns mapped
□ Reply networks identified
□ Following/follower analysis
□ List memberships checked
□ Sentiment analysis performed
Findings: [summary]

INSTAGRAM INTELLIGENCE:
□ Post content analyzed
□ Location tags extracted
□ Tagged users mapped
□ Story highlights reviewed (if accessible)
□ Following/follower analysis
□ Comment patterns analyzed
Findings: [summary]

FACEBOOK INTELLIGENCE:
□ Profile information extracted
□ Photo albums analyzed (locations, people, events)
□ Check-ins mapped
□ Group memberships identified
□ Event attendance extracted
□ Marketplace activity checked
Findings: [summary]

OTHER PLATFORMS:
[Repeat for each relevant platform identified in Step 2]

SOCMINT COLLECTION LOG:
| Platform | Data Collected | Intelligence Value | PIR Supported |
|----------|----------------|-------------------|---------------|
| [platform] | [data type] | [High/Med/Low] | [PIR #] |
```

### 3. TECHINT Collection (Probe)

```
PROBE: TECHNICAL INTELLIGENCE COLLECTION
========================================

EMAIL INFRASTRUCTURE:
□ MX records analyzed
□ SPF/DKIM/DMARC checked
□ Email header analysis (if samples available)
□ Domain age and registration
Findings: [summary]

DOMAIN INTELLIGENCE:
□ Domains associated with subject
□ WHOIS history analyzed
□ DNS records mapped
□ Hosting infrastructure identified
□ SSL certificate analysis
□ Subdomain enumeration
Findings: [summary]

TECHNICAL FOOTPRINT:
□ Code repositories (GitHub, GitLab, Bitbucket)
□ Technical forum participation
□ Conference presentations
□ Patents/publications
□ Technical blog posts
Findings: [summary]

INFRASTRUCTURE MAPPING:
□ IP addresses associated
□ VPN/proxy usage indicators
□ Device fingerprints (if observable)
□ Cloud service usage
Findings: [summary]

BREACH EXPOSURE (coordinate with Shadow):
□ Credential exposure check
□ Data types exposed
□ Breach timeline
Findings: [summary]

TECHINT COLLECTION LOG:
| Source | Data Collected | Intelligence Value | PIR Supported |
|--------|----------------|-------------------|---------------|
| [source] | [data type] | [High/Med/Low] | [PIR #] |
```

### 4. GEOINT Collection (Atlas)

```
ATLAS: GEOSPATIAL INTELLIGENCE COLLECTION
=========================================

LOCATION HISTORY RECONSTRUCTION:
□ Geotagged social media posts mapped
□ Photo EXIF data analyzed (if available)
□ Check-in history compiled
□ Review site locations extracted
□ Event attendance locations mapped
Findings: [summary]

PATTERN ANALYSIS:
□ Home location estimated: [location + confidence]
□ Work location estimated: [location + confidence]
□ Regular haunts identified: [list]
□ Travel patterns mapped: [patterns]
□ Time-zone analysis: [findings]
Findings: [summary]

LOCATION-BASED INTELLIGENCE:
□ Property records checked (if domestic)
□ Business registrations at addresses
□ Associated addresses identified
□ Neighborhood context assessed
Findings: [summary]

GEOINT COLLECTION LOG:
| Source | Location Data | Confidence | PIR Supported |
|--------|---------------|------------|---------------|
| [source] | [location/pattern] | [High/Med/Low] | [PIR #] |
```

### 5. CORPINT Collection (Proxy)

```
PROXY: CORPORATE INTELLIGENCE COLLECTION
========================================

BUSINESS ASSOCIATIONS:
□ Current corporate roles identified
  - Active directorships
  - Officer positions
  - Board memberships
  - Registered agent roles
□ Company affiliations mapped
□ Business ownership stakes
Findings: [summary]

PROFESSIONAL REGISTRATIONS:
□ Professional licenses checked
  - Industry certifications
  - State licenses
  - Professional body memberships
□ Business registrations
□ Trade association memberships
Findings: [summary]

CORPORATE NETWORK:
□ Companies associated with subject
□ Previous employers (corporate records)
□ Joint ventures/partnerships
□ Subsidiary relationships
Findings: [summary]

FINANCIAL FOOTPRINT:
□ Bankruptcy records checked
□ Liens/judgments searched
□ UCC filings (if applicable)
□ Regulatory actions
Findings: [summary]

CORPORATE HISTORY:
□ Historical roles/positions
□ Company formations
□ Business closures
□ Name changes
Findings: [summary]

CORPINT COLLECTION LOG:
| Source | Data Collected | Intelligence Value | PIR Supported |
|--------|----------------|-------------------|---------------|
| [registry] | [data type] | [High/Med/Low] | [PIR #] |
```

### 6. Dark Web/Breach Collection (Shadow)

```
SHADOW: DARK WEB & BREACH COLLECTION
====================================

BREACH DATABASE SEARCH:
□ Email addresses checked
□ Usernames checked
□ Phone numbers checked
□ Full breach inventory compiled
Findings: [summary - breach names and data types only]

DARK WEB PRESENCE:
□ Username searches on forums
□ Marketplace activity check
□ Paste site searches
□ Leaked database mentions
Findings: [summary]

CRIMINAL NEXUS ASSESSMENT:
□ Association with known threat actors
□ Presence in criminal communities
□ Victim or perpetrator indicators
Findings: [summary]

SHADOW COLLECTION LOG:
| Source | Data Found | Sensitivity | PIR Supported |
|--------|------------|-------------|---------------|
| [source] | [data type] | [High/Med/Low] | [PIR #] |
```

### 7. HUMINT Execution (Viper - If Authorized)

```
VIPER: HUMINT COLLECTION
========================

⚠️ SECTION ONLY APPLICABLE IF HUMINT AUTHORIZED IN STEP 1

ENGAGEMENT LOG:
| Date/Time | Channel | Approach Used | Response | Intelligence Gained |
|-----------|---------|---------------|----------|---------------------|
| [datetime] | [channel] | [pretext/approach] | [result] | [findings] |

ELICITATION RESULTS:
| Target Information | Elicitation Technique | Result | Confidence |
|-------------------|----------------------|--------|------------|
| [info sought] | [technique used] | [obtained/failed] | [level] |

CONVERSATION INTELLIGENCE:
[Summary of key intelligence obtained through direct engagement]

HUMINT ASSESSMENT:
- Engagement success: [High/Medium/Low/Failed]
- Subject awareness of investigation: [None/Suspected/Aware]
- Follow-up recommended: [Yes/No]
- Risk assessment: [assessment]

HUMINT COLLECTION LOG:
| Engagement | Intelligence Value | PIR Supported |
|------------|-------------------|---------------|
| [engagement] | [High/Med/Low] | [PIR #] |
```

### 8. PIR Satisfaction Assessment

Track progress against intelligence requirements:

```
PIR SATISFACTION MATRIX
=======================

| PIR | Question | Status | Confidence | Key Sources |
|-----|----------|--------|------------|-------------|
| PIR-1 | [question] | [Satisfied/Partial/Unsatisfied] | [High/Med/Low] | [sources] |
| PIR-2 | [question] | [Satisfied/Partial/Unsatisfied] | [High/Med/Low] | [sources] |
| PIR-3 | [question] | [Satisfied/Partial/Unsatisfied] | [High/Med/Low] | [sources] |
| PIR-4 | [question] | [Satisfied/Partial/Unsatisfied] | [High/Med/Low] | [sources] |

GAP ANALYSIS:
Unsatisfied Requirements:
- [PIR X]: [why not satisfied, what's needed]
- [PIR Y]: [why not satisfied, what's needed]

Additional Collection Needed:
□ [Specific collection task]
□ [Specific collection task]
□ [Specific collection task]

Collection Barriers Encountered:
- [Barrier 1]: [private accounts, deleted content, etc]
- [Barrier 2]: [description]
```

### 9. Collection Deconfliction

Aggregate and deduplicate findings:

```
COLLECTION DECONFLICTION
========================

Duplicate/Overlapping Findings:
| Finding | Reported By | Consolidated Entry |
|---------|-------------|-------------------|
| [finding] | [Echo + Probe] | [single authoritative entry] |

Conflicting Information:
| Topic | Source A | Source B | Resolution |
|-------|----------|----------|------------|
| [topic] | [finding] | [conflicting finding] | [which is correct and why] |

Corroborated Findings (High Confidence):
| Finding | Corroborating Sources | Confidence |
|---------|----------------------|------------|
| [finding] | [multiple sources] | HIGH |
```

---

## COLLECTION EXECUTION OUTPUT

```markdown
## COLLECTION SUMMARY

### Collection Statistics
| Agent | Sources Checked | Findings | High-Value Items |
|-------|-----------------|----------|------------------|
| Echo (SOCMINT) | [count] | [count] | [count] |
| Probe (TECHINT) | [count] | [count] | [count] |
| Atlas (GEOINT) | [count] | [count] | [count] |
| Shadow (Dark Web) | [count] | [count] | [count] |
| Proxy (CORPINT) | [count] | [count] | [count] |
| Viper (HUMINT) | [count] | [count] | [count] |
| **TOTAL** | **[count]** | **[count]** | **[count]** |

### PIR Satisfaction Summary
| PIR | Status | Confidence |
|-----|--------|------------|
| PIR-1 | [status] | [level] |
| PIR-2 | [status] | [level] |
| PIR-3 | [status] | [level] |
| PIR-4 | [status] | [level] |

**Overall PIR Satisfaction:** [X]% of requirements met

### Key Findings Preview
1. [Most significant finding]
2. [Second most significant]
3. [Third most significant]
4. [Fourth most significant]
5. [Fifth most significant]

### Intelligence Gaps
- [Gap 1 - what couldn't be determined]
- [Gap 2 - what couldn't be determined]

### Source Quality Assessment
- High-confidence sources: [count]
- Medium-confidence sources: [count]
- Low-confidence sources: [count]

### Ready for Synthesis
All collection complete. Proceed to profile synthesis and dossier creation.
```

---

## COMPLETION CRITERIA

Before proceeding to Step 5:

- [ ] SOCMINT collection complete (Echo)
- [ ] TECHINT collection complete (Probe)
- [ ] GEOINT collection complete (Atlas)
- [ ] Dark web/breach collection complete (Shadow)
- [ ] CORPINT collection complete (Proxy)
- [ ] (If authorized) HUMINT collection complete (Viper)
- [ ] PIR satisfaction assessed
- [ ] Findings deduplicated
- [ ] Conflicts resolved
- [ ] Collection log documented

---

## MENU OPTIONS

**[C] Continue** - Proceed to profile synthesis (Step 5)
**[G] Gap Fill** - Additional targeted collection
**[V] Verify** - Cross-check specific findings
**[E] Expand** - Deep dive on specific area

---

## NEXT STEP

Upon completion, load and follow: `{workflow_path}/steps/step-05-synthesis.md`
