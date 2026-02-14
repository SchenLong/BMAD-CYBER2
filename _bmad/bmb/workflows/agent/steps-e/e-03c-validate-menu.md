---
name: 'e-03c-validate-menu'
description: 'Validate menu structure (before edit) - no menu, auto-advance'

nextStepFile: './e-03d-validate-structure.md'
editPlan: '{bmb_creations_output_folder}/edit-plan-{agent-name}.md'
agentMenuPatterns: ../data/agent-menu-patterns.md
---

# Edit Step 3c: Validate Menu (Before Edit)

## STEP GOAL:

Validate the agent's command menu structure against BMAD standards. Record findings to editPlan and auto-advance.

## MANDATORY EXECUTION RULES:

- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: Read editPlan and agentMenuPatterns first
- 🚫 NO MENU in this step - record findings and auto-advance
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- 🎯 Validate command/menu structure
- 📊 Record findings to editPlan frontmatter
- 🚫 FORBIDDEN to present menu - auto-advance when complete

## EXECUTION PROTOCOLS:

- 🎯 Load agentMenuPatterns.md reference
- 📊 Validate commands and menu
- 💾 Record findings to editPlan
- ➡️ Auto-advance to next validation step when complete

## Sequence of Instructions:

### 1. Load References

Read `{agentMenuPatterns}`.
Read `{editPlan}` to get agent file path and commands.

### 2. Validate Menu

Perform checks on:
- **A/P/C convention**: each menu has Advanced Elicitation, Party Mode, Continue
- **Command names**: clear, descriptive
- **Command descriptions**: specific, actionable
- **Menu handling logic**: properly specified

### 3. Record Findings

Append to editPlan frontmatter:

```yaml
  menu:
    status: [pass|fail|warning]
    findings:
      - {check}: [pass|fail]
      - {check}: [pass|fail]
```

### 4. Auto-Advance

When validation complete, load and follow `{nextStepFile}` immediately.

## SUCCESS METRICS

✅ All menu checks performed and recorded
✅ Findings saved to editPlan
✅ Auto-advanced to next step

---

**Auto-advancing to structure validation...**
