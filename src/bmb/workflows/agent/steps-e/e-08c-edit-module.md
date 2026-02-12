---
name: 'e-08c-edit-module'
description: 'Apply edits to Module agent'

nextStepFile: './e-09a-validate-metadata.md'
editPlan: '{bmb_creations_output_folder}/edit-plan-{agent-name}.md'
agentFile: '{original-agent-path}'
agentBackup: '{original-agent-path}.backup'

# Template and Architecture (use expert as baseline for Module)
expertTemplate: ../templates/expert-agent-template/expert-agent.template.md
expertArch: ../data/expert-agent-architecture.md
moduleArch: ../data/module-agent-validation.md
agentCompilation: ../data/agent-compilation.md
agentMetadata: ../data/agent-metadata.md
personaProperties: ../data/persona-properties.md
principlesCrafting: ../data/principles-crafting.md
agentMenuPatterns: ../data/agent-menu-patterns.md
criticalActions: ../data/critical-actions.md
---

# Edit Step 8c: Edit Module Agent

## STEP GOAL

Apply all planned edits to the Module agent YAML file and manage workflow integration and sidecar structure.

## MANDATORY EXECUTION RULES

- 🛑 ALWAYS create backup before modifying agent file
- 📖 CRITICAL: Read template and architecture files first
- 🔄 CRITICAL: Load editPlan and agentFile
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules

- 🎯 Load all reference files before applying edits
- 📊 Manage workflow integration paths for Module agents
- 💾 Validate YAML and workflow paths after edits
- ➡️ Auto-advance to post-edit validation when complete

## EXECUTION PROTOCOLS

- 🎯 Load template, architecture, and data files
- 📊 Read editPlan to get all planned changes
- 💾 Create backup
- 📝 Apply edits including workflow paths
- ✅ Validate YAML and workflow paths
- ➡️ Auto-advance to next validation step

## Sequence of Instructions

### 1. Load Reference Documents

Read all files before editing:

- `{expertTemplate}` - Module uses expert as baseline
- `{expertArch}`, `{moduleArch}` - Architecture references
- `{agentCompilation}`, `{agentMetadata}`, `{personaProperties}`, `{principlesCrafting}`
- `{agentMenuPatterns}`, `{criticalActions}`

### 2. Load Edit Plan and Agent

Read `{editPlan}` to get all planned edits.
Read `{agentFile}` to get current agent YAML.

### 3. Create Backup

ALWAYS backup before editing:
`cp {agentFile} {agentBackup}`

### 4. Apply Edits in Sequence

**Type Conversion to Module:**

- Update `type: module`
- Add workflow integration paths

**Workflow Path Management:**

- Add: `skills: - workflow: {path}`
- Remove: delete workflow entries
- Modify: update workflow paths

**Sidecar for Multi-Workflow Modules:**

- If 3+ workflows: consider sidecar creation
- Add sidecar configuration if needed

**Metadata, Persona, Commands, Critical Actions:**

- Same as Expert agent edit

### 5. Validate Workflow Paths

After editing, confirm all workflow paths are valid:
`{project-root}/_bmad/{module-id}/workflows/{workflow-name}/workflow.md`

### 6. Document Applied Edits

Append to `{editPlan}` with workflow changes noted.

### 7. Auto-Advance

When all edits applied successfully, load and follow `{nextStepFile}` immediately.

## SUCCESS METRICS

✅ Backup created
✅ All reference files loaded
✅ All edits applied correctly
✅ YAML remains valid
✅ Workflow paths validated
✅ Sidecar structure correct (if applicable)

## FAILURE MODES

❌ Backup failed
❌ YAML became invalid
❌ Workflow paths broken
❌ Edits not applied as specified

---

**Auto-advancing to post-edit validation...
