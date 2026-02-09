---
name: 'e-08b-edit-expert'
description: 'Apply edits to Expert agent'

nextStepFile: './e-09a-validate-metadata.md'
editPlan: '{bmb_creations_output_folder}/edit-plan-{agent-name}.md'
agentFile: '{original-agent-path}'
agentBackup: '{original-agent-path}.backup'

# Template and Architecture
expertTemplate: ../templates/expert-agent-template/expert-agent.template.md
expertArch: ../data/expert-agent-architecture.md
agentCompilation: ../data/agent-compilation.md
agentMetadata: ../data/agent-metadata.md
personaProperties: ../data/persona-properties.md
principlesCrafting: ../data/principles-crafting.md
agentMenuPatterns: ../data/agent-menu-patterns.md
criticalActions: ../data/critical-actions.md
expertValidation: ../data/expert-agent-validation.md
---

# Edit Step 8b: Edit Expert Agent

## STEP GOAL:

Apply all planned edits to the Expert agent YAML file and manage sidecar structure changes.

## MANDATORY EXECUTION RULES:

- 🛑 ALWAYS create backup before modifying agent file
- 📖 CRITICAL: Read template and architecture files first
- 🔄 CRITICAL: Load editPlan and agentFile
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- 🎯 Load all reference files before applying edits
- 📊 Manage sidecar structure for Expert agents
- 💾 Validate YAML and sidecar paths after edits
- ➡️ Auto-advance to post-edit validation when complete

## EXECUTION PROTOCOLS:

- 🎯 Load template, architecture, and data files
- 📊 Read editPlan to get all planned changes
- 💾 Create backup
- 📝 Apply edits including sidecar management
- ✅ Validate YAML and sidecar paths
- ➡️ Auto-advance to next validation step

## Sequence of Instructions:

### 1. Load Reference Documents

Read all files before editing:
- `{expertTemplate}` - Expert YAML structure
- `{expertArch}` - Expert agent architecture
- `{agentCompilation}`, `{agentMetadata}`, `{personaProperties}`, `{principlesCrafting}`
- `{agentMenuPatterns}`, `{criticalActions}`, `{expertValidation}`

### 2. Load Edit Plan and Agent

Read `{editPlan}` to get all planned edits.
Read `{agentFile}` to get current agent YAML.

### 3. Create Backup

ALWAYS backup before editing:
`cp {agentFile} {agentBackup}`

### 4. Apply Edits in Sequence

**Type Conversion to Expert:**
- Update `type: expert`
- Add `metadata.sidecar-folder` if not present
- Create sidecar directory: `mkdir -p {project-root}/_bmad/_memory/{sidecar-folder}/`

**Sidecar Management:**
- If changing sidecar-folder: update all critical_actions references
- If removing sidecar (Expert → Simple): remove sidecar fields and folder
- Create/update sidecar files as needed

**Metadata, Persona, Commands, Critical Actions:**
- Same as Simple agent edit

### 5. Validate Sidecar Paths

After editing, confirm all critical_actions reference correct sidecar paths:
`{project-root}/_bmad/_memory/{sidecar-folder}/{file}.md`

### 6. Document Applied Edits

Append to `{editPlan}` with sidecar changes noted.

### 7. Auto-Advance

When all edits applied successfully, load and follow `{nextStepFile}` immediately.

## SUCCESS METRICS

✅ Backup created
✅ All reference files loaded
✅ All edits applied correctly
✅ YAML remains valid
✅ Sidecar structure correct
✅ Sidecar paths validated

## FAILURE MODES

❌ Backup failed
❌ YAML became invalid
❌ Sidecar paths broken
❌ Edits not applied as specified

---

**Auto-advancing to post-edit validation...
