---
name: 'e-09d-validate-structure'
description: 'Validate YAML structure (after edit) - no menu, auto-advance'

nextStepFile: './e-09e-validate-sidecar.md'
editPlan: '{bmb_creations_output_folder}/edit-plan-{agent-name}.md'
agentCompilation: ../data/agent-compilation.md
---

# Edit Step 9d: Validate Structure (After Edit)

## STEP GOAL

Validate the agent's YAML structure after edits. Record findings to editPlan and auto-advance.

## MANDATORY EXECUTION RULES

- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: Read editPlan and agentCompilation first
- 🚫 NO MENU in this step - record findings and auto-advance
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules

- 🎯 Validate YAML structure and required fields
- 📊 Record findings to editPlan frontmatter (validationAfter section)
- 🚫 FORBIDDEN to present menu - auto-advance when complete

## EXECUTION PROTOCOLS

- 🎯 Load agentCompilation.md reference
- 📊 Validate YAML structure
- 💾 Record findings to editPlan
- ➡️ Auto-advance to next validation step when complete

## Sequence of Instructions

### 1. Load References

Read `{agentCompilation}` and `{editPlan}`.

### 2. Validate Structure

Perform checks on YAML syntax, required fields, field types, indentation.

### 3. Record Findings

Append to editPlan frontmatter:

```yaml
  structure:
    status: [pass|fail|warning]
    findings:
      - {check}: [pass|fail]
```

### 4. Auto-Advance

Load and follow `{nextStepFile}` immediately.

## SUCCESS METRICS

✅ All structure checks performed and recorded
✅ Findings saved to editPlan
✅ Auto-advanced to next step

---

**Auto-advancing to sidecar validation...**
