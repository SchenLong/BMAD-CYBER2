---
name: 'e-08a-edit-simple'
description: 'Apply edits to Simple agent'

nextStepFile: './e-09a-validate-metadata.md'
editPlan: '{bmb_creations_output_folder}/edit-plan-{agent-name}.md'
agentFile: '{original-agent-path}'
agentBackup: '{original-agent-path}.backup'

# Template and Architecture
simpleTemplate: ../templates/simple-agent.template.md
simpleArch: ../data/simple-agent-architecture.md
agentCompilation: ../data/agent-compilation.md
agentMetadata: ../data/agent-metadata.md
personaProperties: ../data/persona-properties.md
principlesCrafting: ../data/principles-crafting.md
agentMenuPatterns: ../data/agent-menu-patterns.md
criticalActions: ../data/critical-actions.md
---

# Edit Step 8a: Edit Simple Agent

## STEP GOAL

Apply all planned edits to the Simple agent YAML file using templates and architecture references for validation.

## MANDATORY EXECUTION RULES

- 🛑 ALWAYS create backup before modifying agent file
- 📖 CRITICAL: Read template and architecture files first
- 🔄 CRITICAL: Load editPlan and agentFile
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules

- 🎯 Load all reference files before applying edits
- 📊 Apply edits exactly as specified in editPlan
- 💾 Validate YAML after each edit
- ➡️ Auto-advance to post-edit validation when complete

## EXECUTION PROTOCOLS

- 🎯 Load template, architecture, and data files
- 📊 Read editPlan to get all planned changes
- 💾 Create backup
- 📝 Apply edits: type conversion, metadata, persona, commands, critical_actions
- ✅ Validate YAML syntax
- ➡️ Auto-advance to next validation step

## Sequence of Instructions

### 1. Load Reference Documents

Read all files before editing:

- `{simpleTemplate}` - YAML structure reference
- `{simpleArch}` - Simple agent architecture
- `{agentCompilation}` - Assembly guidelines
- `{agentMetadata}`, `{personaProperties}`, `{principlesCrafting}`
- `{agentMenuPatterns}`, `{criticalActions}`

### 2. Load Edit Plan and Agent

Read `{editPlan}` to get all planned edits.
Read `{agentFile}` to get current agent YAML.

### 3. Create Backup

ALWAYS backup before editing:
`cp {agentFile} {agentBackup}`

Confirm: "Backup created at: `{agentBackup}`"

### 4. Apply Edits in Sequence

For each planned edit:

**Type Conversion:**

- Update `type:` field if converting
- Add/remove type-specific fields

**Metadata Edits:**

- Apply each field change from metadataEdits

**Persona Edits:**

- Replace persona section with new four-field persona
- Validate field purity (role ≠ identity ≠ communication_style)

**Command Edits:**

- Additions: append to commands array
- Modifications: update specific commands
- Removals: remove from commands array

**Critical Actions Edits:**

- Additions: append to critical_actions array
- Modifications: update specific actions
- Removals: remove from array

### 5. Validate YAML After Each Edit

Confirm YAML syntax is valid after each modification.

### 6. Document Applied Edits

Append to `{editPlan}`:

```yaml
editsApplied:
  - {edit-description}
  - {edit-description}
backup: {agentBackup}
timestamp: {YYYY-MM-DD HH:MM}
```

### 7. Auto-Advance

When all edits applied successfully, load and follow `{nextStepFile}` immediately.

## SUCCESS METRICS

✅ Backup created
✅ All reference files loaded
✅ All edits applied correctly
✅ YAML remains valid
✅ Edit plan tracking updated

## FAILURE MODES

❌ Backup failed
❌ YAML became invalid
❌ Edits not applied as specified

---

**Auto-advancing to post-edit validation...
