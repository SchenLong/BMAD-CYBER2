---
name: 'e-09b-validate-persona'
description: 'Validate persona (after edit) - no menu, auto-advance'

nextStepFile: './e-09c-validate-menu.md'
editPlan: '{bmb_creations_output_folder}/edit-plan-{agent-name}.md'
personaProperties: ../data/persona-properties.md
principlesCrafting: ../data/principles-crafting.md
---

# Edit Step 9b: Validate Persona (After Edit)

## STEP GOAL

Validate the agent's persona after edits. Record findings to editPlan and auto-advance.

## MANDATORY EXECUTION RULES

- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: Read editPlan and persona references first
- 🚫 NO MENU in this step - record findings and auto-advance
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules

- 🎯 Validate persona four-field system
- 📊 Record findings to editPlan frontmatter (validationAfter section)
- 🚫 FORBIDDEN to present menu - auto-advance when complete

## EXECUTION PROTOCOLS

- 🎯 Load personaProperties.md and principlesCrafting.md
- 📊 Validate persona fields
- 💾 Record findings to editPlan
- ➡️ Auto-advance to next validation step when complete

## Sequence of Instructions

### 1. Load References

Read `{personaProperties}`, `{principlesCrafting}`, and `{editPlan}`.

### 2. Validate Persona

Perform checks on role, identity, communication_style, principles.

### 3. Record Findings

Append to editPlan frontmatter:

```yaml
  persona:
    status: [pass|fail|warning]
    findings:
      - {check}: [pass|fail]
```

### 4. Auto-Advance

Load and follow `{nextStepFile}` immediately.

## SUCCESS METRICS

✅ All persona checks performed and recorded
✅ Findings saved to editPlan
✅ Auto-advanced to next step

---

**Auto-advancing to menu validation...**
