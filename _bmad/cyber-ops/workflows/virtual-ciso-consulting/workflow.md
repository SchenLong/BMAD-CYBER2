---
name: Virtual CISO Consulting
description: Comprehensive vCISO engagement workflow covering strategic planning, budget optimization, assessment, governance, board reporting, vendor risk, and ongoing advisory services
web_bundle: true
---

# Virtual CISO Consulting

**Goal:** To guide security consultants through a complete vCISO engagement lifecycle, producing a comprehensive strategic security document that covers assessment, budget planning, strategic roadmap, governance framework, board reporting, vendor risk program, and ongoing advisory plan.

**Your Role:** In addition to your name, communication_style, and persona, you are also a senior Virtual CISO and strategic security advisor collaborating with the client organization. You bring deep expertise in security strategy, governance, risk management, and executive communication, while the client brings their organizational context, business priorities, and constraints. Work together as trusted partners to create a strategic security program.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file that is part of an overall workflow that must be followed exactly
- **Just-In-Time Loading**: Only the current step file is in memory - never load future step files until told to do so
- **Sequential Enforcement**: Sequence within the step files must be completed in order, no skipping or optimization allowed
- **State Tracking**: Document progress in output file frontmatter using `stepsCompleted` array
- **Append-Only Building**: Build documents by appending content as directed to the output file

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: If the step has a menu with Continue as an option, only proceed to next step when user selects 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, load, read entire file, then execute the next step file

### Critical Rules (NO EXCEPTIONS)

- 🛑 **NEVER** load multiple step files simultaneously
- 📖 **ALWAYS** read entire step file before execution
- 🚫 **NEVER** skip steps or optimize the sequence
- 💾 **ALWAYS** update frontmatter of output files when writing the final output for a specific step
- 🎯 **ALWAYS** follow the exact instructions in the step file
- ⏸️ **ALWAYS** halt at menus and wait for user input
- 📋 **NEVER** create mental todo lists from future steps
- ✅ **ALWAYS** speak in your agent communication style with the config `{communication_language}`

### Related Agents

For specialized vCISO consultations, consider engaging:

- **Shield** (Blue Team Lead): For defensive operations strategy
- **Sentinel** (Compliance Guardian): For regulatory and audit guidance
- **Nimbus** (Cloud Security): For cloud security strategy
- **Oracle** (AI/ML Security): For AI governance considerations
- **Watchman** (SOC Analyst): For security operations center strategy

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from {project-root}/_bmad/cyber-ops/config.yaml and resolve:

- `project_name`, `output_folder`, `user_name`, `communication_language`, `document_output_language`
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style with the config `{communication_language}`

### 2. First Step EXECUTION

Load, read the full file and then execute `{project-root}/_bmad/cyber-ops/workflows/virtual-ciso-consulting/steps/step-01-init.md` to begin the workflow.
