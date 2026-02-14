---
installed_path: '{project-root}/_bmad/bmb/workflows/create-module'
nextStepFile: '{installed_path}/steps/step-10-roadmap.md'
modulePlanFile: '{bmb_creations_output_folder}/{module_name}/module-plan-{module_name}.md'
moduleReadmeFile: '{bmb_creations_output_folder}/{module_name}/README.md'
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 9: Create Module Documentation

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Module Architect and Technical Writer
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring expertise in documentation best practices, user brings their module knowledge
- ✅ Maintain collaborative, clear tone

### Step-Specific Rules:

- 🎯 Focus on creating comprehensive README documentation
- 🚫 FORBIDDEN to create docs in other locations
- 💬 Generate content based on module plan
- 🚫 FORBIDDEN to skip standard sections

## EXECUTION PROTOCOLS:

- 🎯 Use all gathered module information
- 💾 Update the placeholder README.md file
- 📖 Add "step-09-documentation" to stepsCompleted array` before loading next step
- 🚫 FORBIDDEN to load next step until user selects 'C'

## CONTEXT BOUNDARIES:

- All module information from previous steps
- Module structure and components already created
- Focus on README.md, not other documentation
- Generate content dynamically from plan

## STEP GOAL:

To create comprehensive README.md documentation for the module that helps users understand, install, and use the module.

## DOCUMENTATION CREATION PROCESS:

### 1. Initialize Documentation

"Let's create the README.md for your {module_display_name} module.

Good documentation is crucial for module adoption. Your README will be the first thing users see when discovering your module."

### 2. Generate README Content

Load module-plan.md to gather all module information
Update {moduleReadmeFile} with comprehensive content:

````markdown
# {module_display_name}

{module_purpose}

## Overview

This module provides:
[Generate list based on module components and features]

## Installation

Install the module using BMAD:

```bash
bmad install {module_name}
```
````

## Components

### Agents ({agent_count})

[List created agents with brief descriptions]

### Workflows ({workflow_count})

[List planned workflows with purposes]

### Tasks ({task_count})

[List tasks if any]

## Quick Start

1. **Load the primary agent:**

   ```
   agent {primary_agent_name}
   ```

2. **View available commands:**

   ```
   *help
   ```

3. **Load and follow the main workflow:**

   ```
   workflow {primary_workflow_name}
   ```

## Module Structure

```
{module_name}/
├── agents/                    # Agent definitions
│   ├── [agent-1].md
│   └── [agent-2].md
├── workflows/                 # Workflow folders
│   ├── [workflow-1]/
│   │   ├── workflow-plan.md
│   │   └── README.md
│   └── [workflow-2]/
│       └── ...
├── tasks/                     # Task files
├── templates/                 # Shared templates
├── data/                      # Module data
├── _module-installer/         # Installation optional js file with custom install routine
├── module.yaml                # yaml config and install questions
└── README.md                  # This file
```

## Configuration

The module can be configured in `_bmad/{module_name}/config.yaml`

**Key Settings:**

[List configuration fields from installer]

[Example:]

- **output_path**: Where outputs are saved
- **detail_level**: Controls output verbosity
- **feature_x**: Enable/disable specific features

## Examples

### Example 1: [Primary Use Case]

[Step-by-step example of using the module for its main purpose]

1. Start the agent
2. Provide input
3. Review output

### Example 2: [Secondary Use Case]

[Additional example if applicable]

## Development Status

This module is currently:

- [x] Structure created
- [x] Installer configured
- [ ] Agents implemented
- [ ] Workflows implemented
- [ ] Full testing complete

**Note:** Some workflows are planned but not yet implemented. See individual workflow folders for status.

## Contributing

To extend this module:

1. Add new agents using `create-agent` workflow
2. Add new workflows using `create-workflow` workflow
3. Update the installer configuration if needed
4. Test thoroughly

## Requirements

- BMAD Method version 6.0.0 or higher
- [Any specific dependencies]

## Author

Created by {user_name} on [creation date]

## License

[Add license information if applicable]

---

## Module Details

**Module Code:** {module_name}
**Category:** {module_category}
**Type:** {module_type}
**Version:** 1.0.0

**Last Updated:** [current date]

````

### 3. Review Documentation

"**Documentation Review:**

I've generated a comprehensive README that includes:

✅ **Overview** - Clear purpose and value proposition
✅ **Installation** - Simple install command
✅ **Components** - List of agents and workflows
✅ **Quick Start** - Getting started guide
✅ **Structure** - Module layout
✅ **Configuration** - Settings explanation
✅ **Examples** - Usage examples
✅ **Development Status** - Current implementation state

Does this documentation clearly explain your module? Is there anything you'd like to add or modify?"

### 4. Handle Documentation Updates

Update based on user feedback
"Common additions:
- API documentation
- Troubleshooting section
- FAQ
- Screenshots or diagrams
- Video tutorials
- Changelog"

### 5. Document Documentation Creation

Update module-plan.md with documentation section:

```markdown
## Documentation

### README.md Created
- Location: {bmb_creations_output_folder}/{module_name}/README.md
- Sections: [list of sections included]
- Status: Complete

### Content Highlights
- Clear installation instructions
- Component overview
- Quick start guide
- Configuration details
- Usage examples
- Development status

### Updates Made
- [List any customizations or additions]
````

### 6. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask} to improve documentation clarity
- IF P: Execute {partyModeWorkflow} to get input on user experience
- IF C: Save documentation info to module-plan.md, add step-09-documentation to the end of the stepsCompleted array in frontmatter, then load nextStepFile
- IF Any other comments or queries: help user respond then redisplay menu

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond then end with display again of the menu options

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- README.md fully populated with all sections
- Content accurately reflects module structure
- Installation instructions clear and correct
- Examples provide helpful guidance
- Development status honestly represented

### ❌ SYSTEM FAILURE:

- Leaving placeholder content in README
- Not updating with actual module details
- Missing critical sections (installation, usage)
- Misrepresenting implementation status

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and documentation info is saved to module-plan.md with stepsCompleted updated to [1, 2, 3, 4, 5, 6, 7, 8, 9], will you then load, read entire file, then follow `{nextStepFile}` to begin roadmap generation.
