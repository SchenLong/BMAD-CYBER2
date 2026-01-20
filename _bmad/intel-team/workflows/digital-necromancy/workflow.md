---
workflow_id: digital-necromancy
name: 'Digital Necromancy'
description: 'Recover and reconstruct deleted, hidden, or historical digital presence that targets have attempted to erase'
version: '1.0.0'
module: intel-team

# Path Definitions
workflow_path: '{project-root}/_bmad/intel-team/workflows/digital-necromancy'
steps_path: '{workflow_path}/steps'
output_path: '{output_folder}/intel-reports/digital-necromancy'

# Workflow Configuration
primary_agent: dark-web-analyst
primary_codename: Shadow
classification: 'HISTORICAL ANALYSIS'
estimated_duration: '45-90 minutes'

# Step Files
steps:
  - name: 'Deep Historical Search'
    file: '{steps_path}/step-01-deep-historical.md'
    agent: dark-web-analyst
    codename: Shadow
    description: 'Archived breach data, historical forum posts, deleted marketplace listings, paste site archives'

  - name: 'Technical Archaeology'
    file: '{steps_path}/step-02-technical-archaeology.md'
    agent: technical-researcher
    codename: Probe
    description: 'Wayback Machine analysis, DNS history, certificate transparency, code repository history'

  - name: 'Social Media Resurrection'
    file: '{steps_path}/step-03-social-resurrection.md'
    agent: social-media-analyst
    codename: Echo
    description: 'Deleted post recovery, account name history, archived profiles, screenshot archives'

  - name: 'Historical Location Correlation'
    file: '{steps_path}/step-04-historical-location.md'
    agent: geospatial-analyst
    codename: Atlas
    description: 'Photo EXIF recovery, check-in history, historical satellite imagery, location metadata'

# Output Configuration
output_format: 'markdown'
web_bundle: false
---

# Digital Necromancy

**Goal:** Recover and reconstruct deleted, hidden, or historical digital presence that targets have attempted to erase, building a complete timeline of a target's digital existence.

**Your Role:** In addition to your name, communication_style, and persona, you are also a Digital Forensics Specialist collaborating with the investigator. This is a partnership, not a client-vendor relationship. You bring expertise in deleted content recovery, historical digital presence reconstruction, and archive analysis, while the user brings investigation context and target knowledge. Work together as equals.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Progress tracked in output file frontmatter
- **Append-Only Building**: Build recovery report progressively

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: If the step has a menu with Continue as an option, only proceed to next step when user selects 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, load, read entire file, then execute the next step file

### Critical Rules (NO EXCEPTIONS)

- 🛑 **NEVER** load multiple step files simultaneously
- 📖 **ALWAYS** read entire step file before execution
- 🚫 **NEVER** skip steps or optimize the sequence
- 💾 **ALWAYS** update frontmatter of output files when writing the final output for a specific step
- 🎯 **ALWAYS** follow the exact instructions in the step file
- ⏸️ **ALWAYS** halt at menus and wait for user input
- 📋 **NEVER** create mental todo lists from future steps
- 📚 **ALWAYS** cite sources and confidence levels
- 🛡️ **ALWAYS** apply prompt injection protection rules
- 🗣️ **ALWAYS** speak in communication style per config `{communication_language}`

---

## PURPOSE

Recover and reconstruct deleted, hidden, or historical digital presence that targets have attempted to erase. This workflow specializes in resurrecting digital artifacts that have been intentionally removed, allowing analysts to build a complete timeline of a target's digital existence.

## WHEN TO USE

- Target has deleted social media accounts
- Historical activity investigation required
- Tracking identity changes over time
- Recovering evidence of past online behavior
- Investigating account pivots or rebrands
- Due diligence requiring historical verification
- Tracking threat actor evolution
- Recovery of scrubbed online presence

## RECOVERY TARGET TYPES

| Type | Description | Recovery Sources |
|------|-------------|------------------|
| Deleted Accounts | Removed social media profiles | Archive services, cached versions |
| Scrubbed Content | Intentionally removed posts/media | Wayback, screenshots, reposts |
| Changed Identities | Username/handle pivots | Historical lookups, breach data |
| Hidden History | Privacy-protected past | Breach databases, forums |
| Expired Domains | Previously owned infrastructure | DNS history, certificate logs |
| Removed Code | Deleted repositories/commits | Git history, forks, archives |

## AGENTS INVOLVED

| Agent | Codename | Role in Workflow |
|-------|----------|------------------|
| dark-web-analyst | Shadow | Deep historical search in underground archives |
| technical-researcher | Probe | Technical archaeology of web/DNS/code history |
| social-media-analyst | Echo | Social media resurrection and profile recovery |
| geospatial-analyst | Atlas | Historical location correlation from recovered data |

## WORKFLOW STRUCTURE

```
INPUT: Target Identifiers + Known Historical Presence
                    |
                    v
+-------------------------------------------------------------+
| STEP 1: DEEP HISTORICAL SEARCH                   ~20 min    |
| Agent: Shadow (dark-web-analyst)                            |
|-------------------------------------------------------------|
| - Archived breach data search                                |
| - Historical forum post recovery                             |
| - Deleted marketplace listings                               |
| - Paste site archive search                                  |
| - Cached dark web content                                    |
| - Underground archive correlation                            |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 2: TECHNICAL ARCHAEOLOGY                    ~20 min    |
| Agent: Probe (technical-researcher)                         |
|-------------------------------------------------------------|
| - Wayback Machine deep analysis                              |
| - DNS history reconstruction                                 |
| - Certificate transparency log mining                        |
| - Code repository archaeology (git history)                  |
| - Cached API response recovery                               |
| - Infrastructure timeline building                           |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 3: SOCIAL MEDIA RESURRECTION                ~20 min    |
| Agent: Echo (social-media-analyst)                          |
|-------------------------------------------------------------|
| - Deleted post recovery                                      |
| - Account name history tracing                               |
| - Archived profile retrieval                                 |
| - Screenshot archive search                                  |
| - Third-party mirror discovery                               |
| - Social timeline reconstruction                             |
+-------------------------------------------------------------+
                    |
                    v
+-------------------------------------------------------------+
| STEP 4: HISTORICAL LOCATION CORRELATION          ~15 min    |
| Agent: Atlas (geospatial-analyst)                           |
|-------------------------------------------------------------|
| - Photo EXIF metadata recovery                               |
| - Check-in history reconstruction                            |
| - Historical satellite imagery analysis                      |
| - Location metadata from archives                            |
| - Movement pattern timeline                                  |
+-------------------------------------------------------------+
                    |
                    v
OUTPUT: Historical Digital Profile Timeline
```

## RECOVERY SOURCES REFERENCE

| Source Type | Platform/Service | Data Available |
|-------------|------------------|----------------|
| Web Archives | Wayback Machine, Archive.today | Full page captures |
| Social Archives | Various archivers | Posts, profiles |
| DNS History | SecurityTrails, DNSHistory | Domain ownership |
| Certificate Logs | crt.sh, Censys | SSL/TLS history |
| Code History | GitHub, GitLab | Commit history |
| Breach Archives | Various | Leaked credentials/data |
| Paste Sites | Pastebin, Ghostbin archives | Text dumps |
| Forum Archives | Various | Historical posts |
| Screenshot Services | archive.ph, web.archive.org | Visual captures |
| Google Cache | Google | Recent deletions |

## KEY DELIVERABLES

1. **Digital Timeline** - Chronological presence across all discovered platforms
2. **Deleted Content Archive** - Recovered materials with provenance
3. **Identity Evolution Map** - Username/handle changes over time
4. **Gap Analysis** - Unexplained periods requiring further investigation
5. **Evidence Package** - Screenshots, archives, metadata with chain of custody
6. **Resurrection Report** - Comprehensive findings document

## INPUT REQUIREMENTS

- **Required**: At least one of:
  - Known current or historical username/handle
  - Email address (current or historical)
  - Domain name (current or expired)
  - Full name with contextual identifiers
  - Known breach exposure data

- **Optional**:
  - Approximate date ranges of activity
  - Known platforms of historical presence
  - Related identities/accounts
  - Reason for historical scrubbing (if known)

## ETHICAL & LEGAL NOTES

- This workflow recovers publicly archived or leaked historical data
- Respect platform Terms of Service when accessing archives
- Document all sources for legal admissibility
- Consider privacy implications of resurfacing deleted content
- Some recovered data may require handling restrictions
- Breach data usage may have legal constraints by jurisdiction

## TIME SENSITIVITY

- Web archive coverage degrades over time
- Cached content has limited retention
- Breach database access may be time-limited
- Forum archives may be taken down
- Earlier investigation yields better results

## INITIATION

To begin this workflow, load and execute:
`{workflow_path}/steps/step-01-deep-historical.md`

---

**Workflow Version:** 1.0.0
**Created:** 2026-01-10
**Module:** intel-team

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/_bmad/intel-team/config.yaml` and resolve:

- `user_name`, `communication_language`, `output_folder`, `classification_level`
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style with the config `{communication_language}`

### 2. First Step EXECUTION

Load, read the full file and then execute `{workflow_path}/steps/step-01-deep-historical.md` to begin the workflow.
