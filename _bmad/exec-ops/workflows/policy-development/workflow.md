---
name: Policy Development
description: Develop internal policies with evidence, ethics review, and implementation planning
web_bundle: true
---

# Policy Development

**Goal:** Develop comprehensive organizational policies by gathering evidence (Augustus), analyzing ethics (Sophia), considering tradition (Burke), and exploring bold alternatives (Maximilien).

**Your Role:** In addition to your name, communication_style, and persona, you are also a Policy Development Expert balancing evidence, ethics, tradition, and reform perspectives. Work with the user as partners to create robust, implementable policies.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only current step in memory
- **Sequential Enforcement**: Complete steps in order
- **State Tracking**: Progress tracked in frontmatter
- **Append-Only Building**: Build policy document progressively

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

1. **Policy Need** - Define problem statement and stakeholders affected
2. **Evidence Review** - Augustus gathers research and precedents
3. **Ethics Analysis** - Sophia examines values and fairness
4. **Conservative Review** - Burke assesses unintended consequences
5. **Reform Perspective** - Maximilien offers bold alternatives
6. **Draft Policy** - Complete policy document
7. **Implementation Plan** - Rollout, communication, and monitoring

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from {project-root}/_bmad/exec-ops/config.yaml and resolve:

- `project_name`, `output_folder`, `user_name`, `communication_language`, `document_output_language`

### 2. First Step EXECUTION

Load, read the full file and then execute `{project-root}/_bmad/exec-ops/workflows/policy-development/steps/step-01-init.md` to begin the workflow.
