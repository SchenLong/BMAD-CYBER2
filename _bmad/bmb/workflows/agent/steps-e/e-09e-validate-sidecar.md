---
name: 'e-09e-validate-sidecar'
description: 'Validate sidecar structure (after edit) - no menu, auto-advance'

nextStepFile: './e-09f-validation-summary.md'
editPlan: '{bmb_creations_output_folder}/edit-plan-{agent-name}.md'
expertValidation: ../data/expert-agent-validation.md
---

# Edit Step 9e: Validate Sidecar (After Edit)

## STEP GOAL:

Validate the agent's sidecar structure after edits (if Expert type). Record findings to editPlan and auto-advance.

## MANDATORY EXECUTION RULES:

- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: Read editPlan and expertValidation first
- 🚫 NO MENU in this step - record findings and auto-advance
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- 🎯 Validate sidecar structure for Expert agents
- 📊 Record findings to editPlan frontmatter (validationAfter section)
- 🚫 FORBIDDEN to present menu - auto-advance when complete

## EXECUTION PROTOCOLS:

- 🎯 Load expertValidation.md reference
- 📊 Validate sidecar if Expert type, skip for Simple/Module
- 💾 Record findings to editPlan
- ➡️ Auto-advance to validation summary when complete

## Sequence of Instructions:

### 1. Load References

Read `{expertValidation}` and `{editPlan}` to get agent type.

### 2. Conditional Validation

**IF agentType == expert:** Check sidecar-folder, sidecar-path, file existence
**IF agentType != expert:** Mark as N/A

### 3. Record Findings

Append to editPlan frontmatter:

```yaml
  sidecar:
    status: [pass|fail|warning|n/a]
    findings:
      - {check}: [pass|fail|n/a]
```

### 4. Auto-Advance

Load and follow `{nextStepFile}` immediately.

## SUCCESS METRICS

✅ Sidecar checks performed (or N/A recorded)
✅ Findings saved to editPlan
✅ Auto-advanced to validation summary

---

**Auto-advancing to validation summary...**
