---
installed_path: '{project-root}/_bmad/bmb/workflows/create-module'
nextStepFile: '{installed_path}/steps/step-05-config.md'
modulePlanFile: '{bmb_creations_output_folder}/{module_name}/module-plan-{module_name}.md'
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 4: Create Module Structure

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Module Architect and Systems Organizer
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring expertise in BMAD structure patterns, user brings their component requirements
- ✅ Maintain collaborative, organized tone

### Step-Specific Rules:

- 🎯 Focus ONLY on creating directory structure and determining complexity
- 🚫 FORBIDDEN to create actual component files in this step
- 💬 Explain structure decisions clearly
- 🚫 FORBIDDEN to proceed without confirming structure

## EXECUTION PROTOCOLS:

- 🎯 Use component count to determine module type
- 💾 Create all required directories
- 📖 Add "step-04-structure" to stepsCompleted array` before loading next step
- 🚫 FORBIDDEN to load next step until user selects 'C'

## CONTEXT BOUNDARIES:

- Component plan from step 3 is available
- Standard BMAD module structure to follow
- Focus on structure creation, not content
- Module folder already exists from step 1

## STEP GOAL:

To determine the module's complexity type and create the complete directory structure for the module.

## MODULE STRUCTURE CREATION PROCESS:

### 1. Determine Module Complexity

"Based on your component plan, let's determine your module's complexity level:"

**Count Components:**

- Agents: [count from plan]
- Workflows: [count from plan]
- Tasks: [count from plan]

**Complexity Assessment:**

"**Simple Module Criteria:**

- 1-2 agents, all Simple type
- 1-3 workflows
- No complex integrations

**Standard Module Criteria:**

- 2-4 agents with mixed types
- 3-8 workflows
- Some shared resources

**Complex Module Criteria:**

- 4+ agents or multiple Module-type agents
- 8+ workflows
- Complex interdependencies
- External integrations"

"**Your module has:**

- [agent_count] agents
- [workflow_count] workflows
- [task_count] tasks

**This makes it a: [Simple/Standard/Complex] Module**"

### 2. Present Module Structure

"**Standard BMAD Module Structure:**

For a [module type] module, we'll create this structure:"

```
{module_code}/
├── agents/                    # Agent definitions (.md)
│   ├── [agent-name].md
│   └── ...
├── workflows/                 # Workflow folders
│   ├── [workflow-name]/
│   │   ├── workflow-plan.md   # Descriptive plan
│   │   └── README.md          # Workflow documentation
│   └── ...
├── tasks/                     # Task files (if any)
│   └── [task-name].md
├── templates/                 # Shared templates
│   └── [template-files]
├── data/                      # Module data files
│   └── [data-files]
├── module.yaml                # Required
├── _module-installer/         # Installation configuration
│   ├── installer.js           # Optional
│   └── assets/                # Optional install assets
└── README.md                  # Module documentation
```

### 3. Create Directory Structure

Create all directories in {bmb_creations_output_folder}/{module_name}/:

1. **agents/** - For agent definition files
2. **workflows/** - For workflow folders
3. **tasks/** - For task files (if tasks planned)
4. **templates/** - For shared templates
5. **data/** - For module data
6. **_module-installer/** - For installation configuration

### 4. Create Placeholder README

Create initial README.md with basic structure:

````markdown
# {module_display_name}

{module_purpose}

## Installation

```bash
bmad install {module_code}
```
````

## Components

_Module documentation will be completed in Step 9_

## Quick Start

_Getting started guide will be added in Step 9_

---

_This module is currently under construction_

````

### 5. Document Structure Creation

Update module-plan.md with structure section:

```markdown
## Module Structure

**Module Type:** [Simple/Standard/Complex]
**Location:** {bmb_creations_output_folder}/{module_name}

**Directory Structure Created:**
- ✅ agents/
- ✅ workflows/
- ✅ tasks/
- ✅ templates/
- ✅ data/
- ✅ _module-installer/
- ✅ README.md (placeholder)

**Rationale for Type:**
[Explain why it's Simple/Standard/Complex based on component counts]
````

### 6. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask} to explore alternative structure approaches
- IF P: Execute {partyModeWorkflow} to get creative input on organization
- IF C: Save structure info to module-plan.md, add step-04-structure to the end of the stepsCompleted array in frontmatter, then load nextStepFile
- IF Any other comments or queries: help user respond then redisplay menu

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond then end with display again of the menu options

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Module complexity correctly determined
- All required directories created
- Structure follows BMAD standards
- Placeholder README created
- Structure documented in plan

### ❌ SYSTEM FAILURE:

- Not creating all required directories
- Incorrectly categorizing module complexity
- Not following BMAD structure patterns
- Creating component files prematurely

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and structure is saved to module-plan.md with stepsCompleted updated to [1, 2, 3, 4], will you then load, read entire file, then follow `{nextStepFile}` to begin configuration planning.
