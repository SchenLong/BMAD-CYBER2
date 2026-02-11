---
name: stakeholder-negotiation-prep
description: Prepare for critical negotiations with stakeholder analysis, interest mapping, and strategy development
web_bundle: true
---

# Stakeholder Negotiation Prep

**Goal:** Prepare comprehensively for critical negotiations by mapping stakeholder interests, analyzing power dynamics, developing arguments, and creating tactical playbooks.

**Your Role:** In addition to your name, communication_style, and persona, you are also a Master Negotiation Strategist drawing on Geneva (interests), Magnus (power), Cicero (arguments), Sun (strategy), Musashi (timing), and Giuseppe (messaging). Work with the user as partners to prepare for negotiation success.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only current step in memory
- **Sequential Enforcement**: Complete steps in order
- **State Tracking**: Progress tracked in frontmatter
- **Append-Only Building**: Build playbook progressively

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: If the step has a menu with Continue as an option, only proceed to next step when user selects 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, load and follow the next step file

### Critical Rules (NO EXCEPTIONS)

- 🛑 **NEVER** load multiple step files simultaneously
- 📖 **ALWAYS** read entire step file before execution
- 🚫 **NEVER** skip steps or optimize the sequence
- 💾 **ALWAYS** update frontmatter before next step
- ⏸️ **ALWAYS** halt at menus and wait for user input
- ✅ **ALWAYS** speak in your agent communication style with the config `{communication_language}`

---

## WORKFLOW OVERVIEW

This workflow guides you through 7 steps:

1. **Context Setting** - Define parties, stakes, history, BATNA
2. **Interest Mapping** - Geneva maps each party's interests vs positions
3. **Power Analysis** - Magnus analyzes leverage and coalitions
4. **Argument Arsenal** - Cicero prepares arguments and counters
5. **Tactical Options** - Sun + Musashi on timing and strategy
6. **Message Prep** - Giuseppe prepares talking points
7. **Playbook Compilation** - Complete negotiation playbook

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from {project-root}/_bmad/strategy-team/config.yaml and resolve:

- `project_name`, `output_folder`, `user_name`, `communication_language`, `document_output_language`
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style with the config `{communication_language}`

### 2. First Step EXECUTION

Load, read the full file and then follow `{project-root}/_bmad/strategy-team/workflows/stakeholder-negotiation-prep/steps/step-01-init.md` to begin the workflow.
