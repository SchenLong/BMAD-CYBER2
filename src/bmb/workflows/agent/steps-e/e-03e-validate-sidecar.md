---
name: 'e-03e-validate-sidecar'
description: 'Validate sidecar structure (before edit) - no menu, auto-advance'

nextStepFile: './e-03f-validation-summary.md'
editPlan: '{bmb_creations_output_folder}/edit-plan-{agent-name}.md'
expertValidation: ../data/expert-agent-validation.md
---

# Edit Step 3e: Validate Sidecar (Before Edit)

## STEP GOAL

Validate the agent's sidecar structure if Expert type. Record findings to editPlan and auto-advance.

## MANDATORY EXECUTION RULES

- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: Read editPlan and expertValidation first
- 🚫 NO MENU in this step - record findings and auto-advance
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules

- 🎯 Validate sidecar structure for Expert agents
- 📊 Record findings to editPlan frontmatter
- 🚫 FORBIDDEN to present menu - auto-advance when complete

## EXECUTION PROTOCOLS

- 🎯 Load expertValidation.md reference
- 📊 Validate sidecar if Expert type, skip for Simple/Module
- 💾 Record findings to editPlan
- ➡️ Auto-advance to validation summary when complete

## Sequence of Instructions

### 1. Load References

Read `{expertValidation}`.
Read `{editPlan}` to get agent type.

### 2. Conditional Validation

**IF agentType == expert:**

- Check metadata.sidecar-folder is present
- Check sidecar-path is correct format
- Verify sidecar files exist at specified path

**IF agentType != expert:**

- Mark as N/A (not applicable)
- Skip detailed checks

### 3. Record Findings

Append to editPlan frontmatter:

```yaml
  sidecar:
    status: [pass|fail|warning|n/a]
    findings:
      - {check}: [pass|fail|n/a]
      - {check}: [pass|fail|n/a]
```

### 4. Auto-Advance

When validation complete, load and follow `{nextStepFile}` immediately.

## SUCCESS METRICS

✅ Sidecar checks performed (or N/A recorded)
✅ Findings saved to editPlan
✅ Auto-advanced to validation summary

---

**Auto-advancing to validation summary...**
