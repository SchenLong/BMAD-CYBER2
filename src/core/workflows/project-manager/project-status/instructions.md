# Project Status Dashboard - Instructions

<critical>The workflow execution engine is governed by: {project-root}/src/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: project-status/workflow.yaml</critical>
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

<action>Load active project details into variables</action>
</step>

<step n="2" goal="Gather status from all sources">
<action>Initialize status_data object</action>

<action>For BMM module (if in modules_used):

- Load bmm-workflow-status.yaml if exists
  - Count completed vs pending workflows
  - Identify current workflow
- Load sprint-status.yaml if exists
  - Count epics by status
  - Count stories by status
  - Identify in-progress items
- Scan for key artifacts:
  - prd.md / product-brief.md
  - architecture.md
  - epic*.md
  - story files
</action>

<action>For BMGD module (if in modules_used):

- Load bmgd-workflow-status.yaml if exists
- Scan for game artifacts:
  - game-brief.md
  - gdd.md
  - game-architecture.md
</action>

<action>For Cybersec module (if in modules_used):

- Scan for security outputs:
  - Security assessment reports
  - Threat models
  - Compliance reports
</action>

<action>For each module, calculate:

- completion_percentage
- items_in_progress
- items_blocked (if detectable)
- last_activity_date
</action>

</step>

<step n="3" goal="Analyze health and risks">
<action>Analyze status_data for health indicators:

**Green indicators:**

- Regular progress (activity within 3 days)
- Items moving through pipeline
- No long-stale in-progress items

**Yellow indicators:**

- No activity in 3-7 days
- Items stuck in same status for extended period
- Missing recommended artifacts for phase

**Red indicators:**

- No activity in 7+ days
- Critical artifacts missing for current phase
- All items blocked
</action>

<action>Identify potential risks:

- Stale work items
- Missing cross-module reviews
- Phase transitions without prerequisites
</action>

<action>Generate health_score (0-100) and health_status (healthy/attention/at-risk)</action>
</step>

<step n="4" goal="Generate cross-module recommendations">
<action>Load {expertise_map}</action>

<action>Based on current phase and modules, check for:

- Missing security reviews (if cybersec-team available)
- Missing compliance checks (if legal-team available)
- Upcoming strategic decisions (if strategy-team available)
</action>

<action>Build cross_module_recommendations array</action>
</step>

<step n="5" goal="Display dashboard">
<output>
╔══════════════════════════════════════════════════════════════════╗
║                    PROJECT STATUS DASHBOARD                       ║
╠══════════════════════════════════════════════════════════════════╣
║  Project: {project_name}                                          ║
║  Phase: {current_phase}          Health: {health_status_emoji} {health_status}║
╚══════════════════════════════════════════════════════════════════╝

**Project Info:**

- **ID:** {project_id}
- **Path:** {project_path}
- **Type:** {project_type}
- **Modules:** {modules_used}
- **Created:** {created}
- **Last Activity:** {last_activity}

---

{{#if bmm_status}}
**BMM (Software Development):**

```
Planning Progress:  [{progress_bar}] {planning_percentage}%
  - Workflows: {completed_workflows}/{total_workflows}
  {{#each key_artifacts}}
  - {artifact}: {status_emoji}
  {{/each}}

Implementation Progress: [{impl_progress_bar}] {impl_percentage}%
  {{#if sprint_status}}
  - Epics: {completed_epics}/{total_epics}
  - Stories: {completed_stories}/{total_stories}
  - In Progress: {in_progress_stories}
  {{else}}
  - Sprint tracking not yet initialized
  {{/if}}
```

{{/if}}

{{#if bmgd_status}}
**BMGD (Game Development):**

```
Game Design Progress: [{progress_bar}] {percentage}%
  {{#each key_artifacts}}
  - {artifact}: {status_emoji}
  {{/each}}
```

{{/if}}

{{#if cybersec_status}}
**Cybersec Team:**

```
Security Activities:
  {{#each security_outputs}}
  - {output_name}: {date}
  {{/each}}
```

{{/if}}

---

{{#if risks}}
**Attention Needed:**
{{#each risks}}

- {risk_emoji} {risk_description}
{{/each}}
{{/if}}

{{#if cross_module_recommendations}}
**Cross-Module Opportunities:**
{{#each cross_module_recommendations}}

- {module}: {recommendation}
{{/each}}
{{/if}}

---

**Quick Actions:**

- [WN] What's Next - Get recommended next action
- [AT] Assign Task - Delegate work to an agent
- [CM] Cross-Module - Get expertise from other teams
</output>

</step>

<step n="6" goal="Offer actions">
<ask>Would you like to:

1. **Deep Dive** - See detailed status for a specific module
2. **What's Next** - Get recommended next action
3. **Address Risk** - Get guidance on a specific risk item
4. **Return to Menu** - Go back to Abdul's menu

Choice [1/2/3/4]:</ask>

<check if="choice == 1">
  <ask>Which module? ({modules_used}):</ask>
  <action>Display detailed status for selected module</action>
  <action>Loop back to choice</action>
</check>

<check if="choice == 2">
  <action>Execute whats-next workflow</action>
</check>

<check if="choice == 3">
  <ask>Which risk item? (Enter number):</ask>
  <action>Provide specific guidance for selected risk</action>
  <action>Suggest remediation steps</action>
</check>

<check if="choice == 4">
  <output>Returning to Abdul's menu!</output>
  <action>Return to agent menu</action>
</check>
</step>

</workflow>
