---
name: 'v-02a-validate-metadata'
description: 'Validate metadata and append to report'

nextStepFile: './v-02b-validate-persona.md'
validationReport: '{bmb_creations_output_folder}/validation-report-{agent-name}.md'
agentMetadata: ../data/agent-metadata.md
---

# Validate Step 2a: Validate Metadata

## STEP GOAL:

Validate the agent's metadata properties against BMAD standards. Append findings to validation report and auto-advance.

## MANDATORY EXECUTION RULES:

- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: Read validationReport and agentMetadata first
- 🚫 NO MENU - append findings and auto-advance
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- 🎯 Validate metadata against agentMetadata.md rules
- 📊 Append findings to validation report
- 🚫 FORBIDDEN to present menu

## EXECUTION PROTOCOLS:

- 🎯 Load agentMetadata.md reference
- 📊 Validate all metadata fields
- 💾 Append findings to validation report
- ➡️ Auto-advance to next validation step

## Sequence of Instructions:

### 1. Load References

Read `{agentMetadata}` and `{validationReport}`.

### 2. Validate Metadata

Perform checks on: id, name, title, icon, module, hasSidecar.

### 3. Append Findings to Report

Append to `{validationReport}`:

```markdown
### Metadata Validation

**Status:** {✅ PASS / ⚠️ WARNING / ❌ FAIL}

**Checks:**
- [ ] id: kebab-case, no spaces
- [ ] name: clear display name
- [ ] title: concise function description
- [ ] icon: appropriate emoji/symbol
- [ ] module: correct format `{project}:{type}:{name}`
- [ ] hasSidecar: matches actual usage

**Findings:**
{Detailed findings}
```

### 4. Auto-Advance

Load and follow `{nextStepFile}` immediately.

---

**Validating persona...**
