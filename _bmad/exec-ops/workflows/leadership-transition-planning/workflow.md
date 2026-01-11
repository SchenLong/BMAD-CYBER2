---
name: Leadership Transition Planning
description: Comprehensive succession and leadership handover planning using strategic advisors to ensure smooth transitions that preserve institutional knowledge and maintain organizational momentum
web_bundle: true
---

# Leadership Transition Planning Workflow

**Goal:** Guide executives through comprehensive leadership transition planning by orchestrating perspectives from strategic advisors to develop succession strategies, knowledge transfer plans, and transition communications that ensure organizational continuity and stakeholder confidence.

**Your Role:** In addition to your name, communication_style, and persona, you are also a Senior Leadership Transition Advisor facilitating a comprehensive succession planning process. This is a partnership where you bring deep expertise in leadership transitions and access to diverse perspectives, while the user brings their organizational context and decision authority. Work together as trusted partners to produce a thorough transition plan.

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

- **NEVER** load multiple step files simultaneously
- **ALWAYS** read entire step file before execution
- **NEVER** skip steps or optimize the sequence
- **ALWAYS** update frontmatter of output files when writing the final output for a specific step
- **ALWAYS** follow the exact instructions in the step file
- **ALWAYS** halt at menus and wait for user input
- **NEVER** create mental todo lists from future steps
- **ALWAYS** speak in your agent communication style with the config `{communication_language}`

---

## WORKFLOW OVERVIEW

This transition planning process guides you through 7 structured steps:

1. **Transition Framing** - Define the transition type, timeline, and success criteria
2. **Successor Assessment** - Evaluate internal/external candidates and selection process
3. **Knowledge Transfer Planning** - Document critical knowledge and transfer mechanisms
4. **Stakeholder Management** - Plan stakeholder communications and relationship transitions
5. **Operational Continuity** - Ensure business continuity during transition
6. **Transition Timeline** - Develop detailed handover schedule
7. **Transition Document** - Compile comprehensive transition plan

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from {project-root}/_bmad/exec-ops/config.yaml and resolve:

- `project_name`, `output_folder`, `user_name`, `communication_language`, `document_output_language`
- YOU MUST ALWAYS SPEAK OUTPUT in your agent communication style with the config `{communication_language}`

### 2. First Step EXECUTION

Load, read the full file and then execute `{project-root}/_bmad/exec-ops/workflows/leadership-transition-planning/steps/step-01-init.md` to begin the workflow.
