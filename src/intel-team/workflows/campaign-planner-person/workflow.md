---
workflow_id: campaign-planner-person
name: campaign-planner-person
description: 'Systematic OSINT campaign planning for investigating an individual'
version: '1.0.0'

# Path Definitions
workflow_path: '{project-root}/src/intel-team/workflows/campaign-planner-person'
steps_path: '{workflow_path}/steps'

# Agent Configuration
primary_agent: osint-lead
primary_codename: Vector

# Step Files
steps:
  - name: 'Intelligence Requirements'
    file: '{steps_path}/step-01-requirements.md'
    agent: osint-lead
    codename: Vector
    description: 'Define PIRs, scope boundaries, and collection priorities'

  - name: 'Identity Pivot Mapping'
    file: '{steps_path}/step-02-pivot-mapping.md'
    agent: social-media-analyst
    codename: Echo
    description: 'Map social footprint and identify pivot points'

  - name: 'HUMINT Preparation'
    file: '{steps_path}/step-03-humint-prep.md'
    agent: humint-specialist
    codename: Viper
    description: 'Develop social engineering approaches and elicitation strategies'

  - name: 'Collection Execution'
    file: '{steps_path}/step-04-collection.md'
    agent: osint-lead
    codename: Vector
    description: 'Execute coordinated multi-INT collection'

  - name: 'Profile Synthesis'
    file: '{steps_path}/step-05-synthesis.md'
    agent: threat-actor-profiler
    codename: Dossier
    description: 'Create comprehensive intelligence dossier'

# Output Configuration
output_folder: '{output_folder}/intel-reports/campaign-person'
output_format: 'markdown'
web_bundle: false
---

# Campaign Planner: Person

**Goal:** Provide systematic, professional-grade OSINT campaign planning for investigating an individual person, ensuring comprehensive coverage across all intelligence disciplines while maintaining operational security and legal compliance.

**Your Role:** In addition to your name, communication_style, and persona, you are also an OSINT Campaign Planner collaborating with the intelligence operator. This is a partnership, not a client-vendor relationship. You bring expertise in person-focused intelligence collection and individual research, while the user brings investigation objectives and subject context. Work together as equals.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only the current step file is in memory
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Progress tracked in output file frontmatter
- **Append-Only Building**: Build campaign plan progressively

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: If the step has a menu with Continue as an option, only proceed to next step when user selects 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, load and follow the next step file

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

Provide a systematic, professional-grade approach to planning and executing an OSINT investigation focused on an individual person. This workflow ensures comprehensive coverage across all intelligence disciplines while maintaining operational security and legal compliance.

## WHEN TO USE

- Background investigation on individual
- Pre-meeting intelligence preparation
- Fraud investigation (subject identification)
- Missing person research
- Threat assessment on specific individual
- Due diligence on business partner/investor
- Security vetting support

## AGENTS INVOLVED

| Agent | Codename | Role in Workflow |
|-------|----------|------------------|
| osint-lead | Vector | Campaign planning, coordination, final synthesis |
| social-media-analyst | Echo | Social footprint mapping, account correlation |
| humint-specialist | Viper | Social engineering strategy, elicitation planning |
| threat-actor-profiler | Dossier | Behavioral analysis, profile creation |
| technical-researcher | Probe | Technical pivots (email, domains, infrastructure) |
| geospatial-analyst | Atlas | Location intelligence, pattern analysis |
| corporate-intel-specialist | Proxy | Business affiliations, directorships, corporate roles |

## WORKFLOW STRUCTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CAMPAIGN PLANNER: PERSON                             │
│                    Systematic Individual Investigation                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: INTELLIGENCE REQUIREMENTS                          ~15-20 min  │
│ Agent: Vector (osint-lead)                                              │
├─────────────────────────────────────────────────────────────────────────┤
│ • Define Priority Intelligence Requirements (PIRs)                      │
│ • Establish scope boundaries and constraints                            │
│ • Identify starting selectors (name, email, handles)                    │
│ • Set collection priorities and legal constraints                       │
│ • Create collection management plan                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: IDENTITY PIVOT MAPPING                             ~20-30 min  │
│ Agent: Echo (social-media-analyst)                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ • Map social media presence across platforms                            │
│ • Identify username patterns and variations                             │
│ • Discover linked accounts and pivot points                             │
│ • Analyze network connections (friends, followers, mentions)            │
│ • Timeline key activities and relationships                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: HUMINT PREPARATION                                 ~15-20 min  │
│ Agent: Viper (humint-specialist)                                        │
├─────────────────────────────────────────────────────────────────────────┤
│ • Analyze target psychology and communication style                     │
│ • Identify interests, vulnerabilities, and rapport hooks                │
│ • Develop pretext scenarios (if active engagement authorized)           │
│ • Create elicitation question frameworks                                │
│ • Design social engineering approaches                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 4: COLLECTION EXECUTION                               ~30-45 min  │
│ Agent: Vector (osint-lead) coordinating all agents                      │
├─────────────────────────────────────────────────────────────────────────┤
│ • Execute multi-INT collection plan                                     │
│ • Vector: Overall coordination and gap analysis                         │
│ • Echo: Social media deep dive                                          │
│ • Probe: Technical investigation (domains, emails, infrastructure)      │
│ • Atlas: Location intelligence and pattern mapping                      │
│ • Shadow: Dark web and breach exposure (if applicable)                  │
│ • Proxy: Corporate affiliations, business roles, directorships          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 5: PROFILE SYNTHESIS                                  ~20-30 min  │
│ Agent: Dossier (threat-actor-profiler)                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ • Synthesize all collected intelligence                                 │
│ • Create comprehensive subject profile                                  │
│ • Assess behavioral patterns and predictability                         │
│ • Identify intelligence gaps and unknowns                               │
│ • Generate final intelligence dossier                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   INTELLIGENCE DOSSIER        │
                    │   • Subject Profile           │
                    │   • Network Map               │
                    │   • Timeline                  │
                    │   • Risk Assessment           │
                    │   • Collection Log            │
                    └───────────────────────────────┘
```

## ESTIMATED DURATION

| Step | Duration | Cumulative |
|------|----------|------------|
| Step 1: Requirements | 15-20 min | 15-20 min |
| Step 2: Pivot Mapping | 20-30 min | 35-50 min |
| Step 3: HUMINT Prep | 15-20 min | 50-70 min |
| Step 4: Collection | 30-45 min | 80-115 min |
| Step 5: Synthesis | 20-30 min | 100-145 min |

**Total: 1.5 - 2.5 hours** (depending on scope and target complexity)

## KEY DELIVERABLES

1. **Collection Management Plan** - Structured intelligence requirements
2. **Pivot Map** - Visual map of identity pivots and connections
3. **HUMINT Playbook** - Social engineering strategies (if authorized)
4. **Collection Log** - Sources checked and findings
5. **Intelligence Dossier** - Comprehensive subject profile

## LEGAL & ETHICAL NOTES

- This workflow assumes legal authority to investigate the target
- Active HUMINT engagement (Step 3) requires explicit authorization
- Document all collection activities for legal defensibility
- Respect platform ToS and applicable privacy laws
- Maintain proper attribution of intelligence sources

## INITIATION

To begin this workflow, load and follow:
`{workflow_path}/steps/step-01-requirements.md`

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/src/intel-team/config.yaml` and resolve:

- `user_name`, `communication_language`, `output_folder`, `classification_level`
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style with the config `{communication_language}`

### 2. First Step EXECUTION

Load, read the full file and then follow `{workflow_path}/steps/step-01-requirements.md` to begin the workflow.

---

**Workflow Version:** 1.0.0
**Created:** 2026-01-10
**Module:** intel-team
