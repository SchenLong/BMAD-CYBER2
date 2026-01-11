# Create Project - Instructions

<critical>The workflow execution engine is governed by: {project-root}/_bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: create-project/workflow.yaml</critical>
<critical>Communicate in {communication_language} with {user_name}</critical>

<workflow>

<step n="1" goal="Gather project basics">
<output>Let's set up your new project, {user_name}!</output>

<ask>What's the **name** of this project?</ask>
<action>Store as project_name</action>
<action>Generate project_id as lowercase slug (spaces to hyphens, no special chars)</action>

<ask>Give me a **brief description** (1-2 sentences) of what this project is about:</ask>
<action>Store as project_description</action>

<template-output>project_name</template-output>
<template-output>project_id</template-output>
<template-output>project_description</template-output>
</step>

<step n="2" goal="Determine project path">
<action>Check if current working directory seems appropriate for this project</action>

<ask>Where should this project live?

1. **Current directory** - Use {project-root} (recommended if you're already in the project folder)
2. **Specify path** - Enter a different absolute path

Choice [1/2]:</ask>

<check if="choice == 1">
  <action>Set project_path = {project-root}</action>
</check>

<check if="choice == 2">
  <ask>Enter the absolute path to the project root:</ask>
  <action>Validate path exists or offer to create it</action>
  <action>Store as project_path</action>
</check>

<template-output>project_path</template-output>
</step>

<step n="3" goal="Determine project type">
<ask>Is this a **greenfield** (new) or **brownfield** (existing codebase) project?

1. **Greenfield** - Starting fresh, no existing code
2. **Brownfield** - Existing codebase to enhance or modify

Choice [1/2]:</ask>

<action>Set project_type based on choice (greenfield/brownfield)</action>
<template-output>project_type</template-output>
</step>

<step n="4" goal="Select modules">
<output>Which BMAD modules will this project use? Select all that apply:

**Development Modules:**
1. **BMM** - Software development (PRD, architecture, epics, stories)
2. **BMGD** - Game development (GDD, game architecture, playtesting)

**Specialist Teams:**
3. **Cybersec Team** - Security assessments, threat modeling, compliance
4. **Intel Team** - OSINT, threat intelligence, investigations
5. **Strategy Team** - Executive advisory, strategic planning
6. **Legal Team** - Legal consultation (Party Mode support)

</output>

<ask>Enter module numbers separated by commas (e.g., "1,3,5" or "1" for just BMM):</ask>

<action>Parse selection and build modules_used array:
- 1 → bmm
- 2 → bmgd
- 3 → cybersec-team
- 4 → intel-team
- 5 → strategy-team
- 6 → legal-team
</action>

<check if="no modules selected">
  <output>At least one module must be selected. BMM is recommended for most software projects.</output>
  <action>Loop back to selection</action>
</check>

<template-output>modules_used</template-output>
</step>

<step n="5" goal="Configure folder structure">
<output>Default folder structure:

```
{project_path}/
├── _bmad-output/
│   ├── planning-artifacts/    # PRD, architecture, epics
│   └── implementation-artifacts/    # Stories, sprint status
├── docs/                      # Project documentation
└── src/                       # Source code (if applicable)
```
</output>

<ask>Use default folder structure? (y/n)</ask>

<check if="y">
  <action>Set folder_structure to defaults:
    - planning: "_bmad-output/planning-artifacts"
    - implementation: "_bmad-output/implementation-artifacts"
    - docs: "docs"
  </action>
</check>

<check if="n">
  <ask>Enter planning artifacts folder (relative to project root):</ask>
  <action>Store as folder_structure.planning</action>
  <ask>Enter implementation artifacts folder (relative to project root):</ask>
  <action>Store as folder_structure.implementation</action>
  <ask>Enter documentation folder (relative to project root):</ask>
  <action>Store as folder_structure.docs</action>
</check>

<template-output>folder_structure</template-output>
</step>

<step n="6" goal="Create folders and registry">
<action>Create folder structure if it doesn't exist:
- {project_path}/{folder_structure.planning}
- {project_path}/{folder_structure.implementation}
- {project_path}/{folder_structure.docs}
</action>

<action>Load or create {output_folder}/project-registry.yaml</action>

<action>Build new project entry:
```yaml
- id: "{project_id}"
  name: "{project_name}"
  description: "{project_description}"
  path: "{project_path}"
  type: "{project_type}"
  modules_used: {modules_used}
  status: "new"
  current_phase: "discovery"
  created: "{date}"
  last_accessed: "{date}"
  folder_structure:
    planning: "{folder_structure.planning}"
    implementation: "{folder_structure.implementation}"
    docs: "{folder_structure.docs}"
  workflow_status_files: {}
  notes: ""
```
</action>

<action>Add project to registry's projects array</action>
<action>Set registry's active_project to project_id</action>
<action>Update registry's last_updated to current date</action>
<action>Save registry to {output_folder}/project-registry.yaml</action>

<output>Project **{project_name}** created successfully!

**Project ID:** {project_id}
**Location:** {project_path}
**Type:** {project_type}
**Modules:** {modules_used}

**Folders created:**
- {folder_structure.planning}
- {folder_structure.implementation}
- {folder_structure.docs}
</output>
</step>

<step n="7" goal="Offer next steps">
<output>**What's Next?**</output>

<check if="bmm in modules_used">
  <output>For software development (BMM), I recommend:
  - **Initialize BMM workflow** - Run the BMM workflow-init to set up your planning path
  - **PM Agent (John)** - Start with PRD creation to define requirements
  </output>
</check>

<check if="bmgd in modules_used">
  <output>For game development (BMGD), I recommend:
  - **Initialize BMGD workflow** - Run the BMGD workflow-init to set up your game planning
  - **Game Designer (Samus)** - Start with Game Brief or GDD creation
  </output>
</check>

<check if="cybersec-team in modules_used">
  <output>For security work (Cybersec Team), available workflows include:
  - **Security Architecture Review** - Assess system security
  - **Threat Modeling** - STRIDE analysis
  - **Compliance Audit** - Regulatory compliance check
  </output>
</check>

<ask>Would you like me to:

1. **Run module workflow-init** - Initialize the primary module's workflow tracking
2. **Show What's Next** - Let me analyze and recommend the best first step
3. **Return to menu** - Go back to Abdul's main menu

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <check if="bmm in modules_used">
    <output>Invoking BMM workflow-init...</output>
    <action>Execute {project-root}/_bmad/bmm/workflows/workflow-status/init/workflow.yaml</action>
  </check>
  <check if="bmgd in modules_used AND bmm not in modules_used">
    <output>Invoking BMGD workflow-init...</output>
    <action>Execute {project-root}/_bmad/bmgd/workflows/workflow-status/init/workflow.yaml</action>
  </check>
</check>

<check if="choice == 2">
  <output>Analyzing project state...</output>
  <action>Execute {project-root}/_bmad/core/workflows/project-manager/whats-next/workflow.yaml</action>
</check>

<check if="choice == 3">
  <output>Returning to Abdul's menu. Use [WN] for What's Next recommendations anytime!</output>
  <action>Return to agent menu</action>
</check>
</step>

</workflow>
