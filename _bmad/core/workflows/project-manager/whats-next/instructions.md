# What's Next - Intelligent Routing Instructions

<critical>The workflow execution engine is governed by: {project-root}/_bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: whats-next/workflow.yaml</critical>
<critical>Communicate in {communication_language} with {user_name}</critical>

<workflow>

<step n="1" goal="Load project context">
<action>Load {output_folder}/project-registry.yaml</action>

<check if="registry not found or empty">
  <output>No projects registered yet, {user_name}!

Use **[NP] Create New Project** to get started.</output>
  <action>Return to agent menu</action>
</check>

<action>Get active_project from registry</action>

<check if="no active_project">
  <output>No active project selected. Use **[OP] Open Project** to select one.</output>
  <action>Return to agent menu</action>
</check>

<action>Load active project details:
- project_name
- project_path
- modules_used
- current_phase
- folder_structure
</action>

<output>Analyzing **{project_name}**...</output>
</step>

<step n="2" goal="Scan for artifacts and status files">
<action>For each module in modules_used, scan for:

**BMM Module:**
- {planning_artifacts}/bmm-workflow-status.yaml
- {planning_artifacts}/prd.md or product-brief.md
- {planning_artifacts}/architecture.md
- {planning_artifacts}/epic*.md or epics/
- {implementation_artifacts}/sprint-status.yaml
- {implementation_artifacts}/stories/

**BMGD Module:**
- {planning_artifacts}/bmgd-workflow-status.yaml
- {planning_artifacts}/game-brief.md
- {planning_artifacts}/gdd.md
- {planning_artifacts}/game-architecture.md

**Cybersec Team:**
- Any security assessment outputs
- Threat models
- Compliance reports

**Other modules:**
- Check for module-specific outputs
</action>

<action>Build artifact_inventory with found files and their modification dates</action>
</step>

<step n="3" goal="Determine project phase">
<action>Analyze artifacts to determine actual phase:

**Discovery Phase** indicators:
- No PRD/brief/GDD
- Only brainstorm or research outputs
- workflow-status shows discovery phase

**Planning Phase** indicators:
- Has PRD or Game Brief
- No architecture yet
- workflow-status shows planning phase

**Solutioning Phase** indicators:
- Has PRD and Architecture
- No epics/stories yet OR epics in progress
- workflow-status shows solutioning phase

**Implementation Phase** indicators:
- Has epics and stories
- sprint-status.yaml exists
- Stories in progress

**Review Phase** indicators:
- All stories complete
- Epic retrospectives done
</action>

<action>Compare detected_phase with registry's current_phase</action>

<check if="detected_phase != current_phase">
  <action>Update registry with detected_phase</action>
</check>
</step>

<step n="4" goal="Identify next action based on phase">
<action>Based on detected_phase and modules_used, determine recommended next action:

**Discovery Phase:**
- If BMM: "Start PRD creation with PM agent (John)"
- If BMGD: "Start Game Brief with Game Designer (Samus)"
- Suggest: Research or Brainstorming workflows

**Planning Phase:**
- If has brief but no PRD: "Create PRD with PM agent (John)"
- If has PRD but no architecture: "Create Architecture with Architect (Winston)"
- If has PRD but no UX: "Create UX Design with UX Designer (Sally)"

**Solutioning Phase:**
- If has PRD + Architecture but no epics: "Create Epics & Stories with PM agent (John)"
- If has epics but not approved: "Implementation Readiness Review with PM agent (John)"

**Implementation Phase:**
- If no sprint-status: "Run Sprint Planning with Scrum Master (Bob)"
- If sprint-status exists:
  - Find first story not 'done'
  - If story not 'ready-for-dev': "Create Story with Scrum Master (Bob)"
  - If story 'ready-for-dev' or 'in-progress': "Implement Story with Developer (Amelia)"
  - If story in 'review': "Code Review needed"
- If epic complete: "Run Retrospective with Scrum Master (Bob)"

**Cross-Module Considerations:**
- If BMM + cybersec-team: Suggest security review at architecture phase
- If any + legal-team: Suggest compliance check before implementation
- If any + strategy-team: Suggest stakeholder review at key milestones
</action>

<action>Build recommendation object:
- next_action: description of what to do
- agent: recommended agent (name and display name)
- workflow: specific workflow if applicable
- reason: why this is the priority
- alternatives: other reasonable options
</action>
</step>

<step n="5" goal="Present recommendations">
<output>
=== WHAT'S NEXT: {project_name} ===

**Current Phase:** {detected_phase}
**Modules Active:** {modules_used}

---

**Recommended Action:**
{next_action}

**Agent:** {agent_display_name} ({agent_name})
**Workflow:** {workflow_name}

**Why:** {reason}

---

**Alternative Options:**
{alternatives}
</output>

<check if="cross_module_suggestions exist">
  <output>**Cross-Module Opportunity:**
{cross_module_suggestion}
</output>
</check>

<ask>Would you like to:

1. **Proceed** - I'll provide the command to invoke the recommended workflow
2. **Choose alternative** - Select from the alternatives listed
3. **Return to menu** - Go back to Abdul's menu

Choice [1/2/3]:</ask>
</step>

<step n="6" goal="Provide invocation guidance">
<check if="choice == 1">
  <output>To proceed with {next_action}:

**Option A - Direct Invocation:**
```
/bmad:{module}:agents:{agent_name}
```
Then select: {workflow_menu_item}

**Option B - Skill Invocation:**
```
/bmad:{module}:workflows:{workflow_id}
```

**Abdul can help:** I'm available to follow up on progress. Use [PS] Project Status to check in anytime.
</output>
</check>

<check if="choice == 2">
  <ask>Which alternative would you like? (Enter number):</ask>
  <action>Provide invocation guidance for selected alternative</action>
</check>

<check if="choice == 3">
  <output>Returning to menu. I'm here when you need direction!</output>
  <action>Return to agent menu</action>
</check>
</step>

</workflow>
