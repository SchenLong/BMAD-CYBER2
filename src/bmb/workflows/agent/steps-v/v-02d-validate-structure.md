---
name: 'v-02d-validate-structure'
description: 'Validate YAML structure and append to report'

nextStepFile: './v-02e-validate-sidecar.md'
validationReport: '{bmb_creations_output_folder}/validation-report-{agent-name}.md'
agentCompilation: ../data/agent-compilation.md
---

# Validate Step 2d: Validate Structure

## STEP GOAL

Validate the agent's YAML structure and completeness. Append findings to validation report and auto-advance.

## MANDATORY EXECUTION RULES

- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: Read validationReport and agentCompilation first
- 🚫 NO MENU - append findings and auto-advance
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules

- 🎯 Validate YAML structure and required fields
- 📊 Append findings to validation report
- 🚫 FORBIDDEN to present menu

## EXECUTION PROTOCOLS

- 🎯 Load agentCompilation.md reference
- 📊 Validate YAML structure
- 💾 Append findings to validation report
- ➡️ Auto-advance to next validation step

## Sequence of Instructions

### 1. Load References

Read `{agentCompilation}` and `{validationReport}`.

### 2. Validate Structure

Perform checks on: YAML syntax, required fields, field types, indentation.

### 3. Append Findings to Report

Append to `{validationReport}`:

```markdown
### Structure Validation

**Status:** {✅ PASS / ⚠️ WARNING / ❌ FAIL}

**Checks:**
- [ ] Valid YAML syntax
- [ ] Required fields present (name, description, type, persona)
- [ ] Field types correct (arrays, strings)
- [ ] Consistent 2-space indentation

**Findings:**
{Detailed findings}
```

### 4. Auto-Advance

Load and follow `{nextStepFile}` immediately.

---

**Validating sidecar structure...**
