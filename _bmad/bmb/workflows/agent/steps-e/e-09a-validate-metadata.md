---
name: 'e-09a-validate-metadata'
description: 'Validate metadata (after edit) - no menu, auto-advance'

nextStepFile: './e-09b-validate-persona.md'
editPlan: '{bmb_creations_output_folder}/edit-plan-{agent-name}.md'
agentMetadata: ../data/agent-metadata.md
---

# Edit Step 9a: Validate Metadata (After Edit)

## STEP GOAL:

Validate the agent's metadata properties after edits. Record findings to editPlan and auto-advance.

## MANDATORY EXECUTION RULES:

- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: Read editPlan and agentMetadata first
- 🚫 NO MENU in this step - record findings and auto-advance
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- 🎯 Validate metadata against agentMetadata.md rules
- 📊 Record findings to editPlan frontmatter (validationAfter section)
- 🚫 FORBIDDEN to present menu - auto-advance when complete

## EXECUTION PROTOCOLS:

- 🎯 Load agentMetadata.md reference
- 📊 Validate all metadata fields
- 💾 Record findings to editPlan
- ➡️ Auto-advance to next validation step when complete

## Sequence of Instructions:

### 1. Load References

Read `{agentMetadata}` and `{editPlan}`.

### 2. Validate Metadata

Perform checks on id, name, title, icon, module, hasSidecar.

### 3. Record Findings

Append to editPlan frontmatter:

```yaml
validationAfter:
  metadata:
    status: [pass|fail|warning]
    findings:
      - {check}: [pass|fail]
```

### 4. Auto-Advance

Load and follow `{nextStepFile}` immediately.

## SUCCESS METRICS

✅ All metadata checks performed and recorded
✅ Findings saved to editPlan
✅ Auto-advanced to next step

---

**Auto-advancing to persona validation...**
