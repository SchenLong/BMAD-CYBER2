---
name: 'e-03a-validate-metadata'
description: 'Validate metadata (before edit) - no menu, auto-advance'

nextStepFile: './e-03b-validate-persona.md'
editPlan: '{bmb_creations_output_folder}/edit-plan-{agent-name}.md'
agentMetadata: ../data/agent-metadata.md
---

# Edit Step 3a: Validate Metadata (Before Edit)

## STEP GOAL

Validate the agent's metadata properties against BMAD standards. Record findings to editPlan and auto-advance to next validation step.

## MANDATORY EXECUTION RULES

- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: Read editPlan and agentMetadata first
- 🚫 NO MENU in this step - record findings and auto-advance
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules

- 🎯 Validate metadata against agentMetadata.md rules
- 📊 Record findings to editPlan frontmatter
- 🚫 FORBIDDEN to present menu - auto-advance when complete

## EXECUTION PROTOCOLS

- 🎯 Load agentMetadata.md reference
- 📊 Validate all metadata fields
- 💾 Record findings to editPlan
- ➡️ Auto-advance to next validation step when complete

## Sequence of Instructions

### 1. Load References

Read `{agentMetadata}` to understand validation rules.
Read `{editPlan}` to get agent file path and metadata.

### 2. Validate Metadata

Perform checks on:

- **id**: kebab-case, no spaces
- **name**: display name, clear branding
- **title**: concise function description
- **icon**: appropriate emoji or symbol
- **module**: correct format `{project}:{type}:{name}`
- **hasSidecar**: boolean, matches actual sidecar usage

### 3. Record Findings

Append to editPlan frontmatter:

```yaml
validationBefore:
  metadata:
    status: [pass|fail|warning]
    findings:
      - {check}: [pass|fail]
      - {check}: [pass|fail]
```

### 4. Auto-Advance

When validation complete, load and follow `{nextStepFile}` immediately.

## SUCCESS METRICS

✅ All metadata checks performed and recorded
✅ Findings saved to editPlan
✅ Auto-advanced to next step

---

**Auto-advancing to persona validation...**
