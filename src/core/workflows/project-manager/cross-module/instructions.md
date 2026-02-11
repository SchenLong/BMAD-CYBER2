# Cross-Module Consultation - Instructions

<critical>The workflow execution engine is governed by: {project-root}/src/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: cross-module/workflow.yaml</critical>
<critical>Communicate in {communication_language} with {user_name}</critical>

<workflow>

<step n="1" goal="Understand the consultation need">
<output>Cross-Module Consultation, {user_name}!

I can help you identify expertise from other BMAD modules that could benefit your current work.</output>

<ask>What topic or challenge are you working on? Describe the situation:</ask>
<action>Store as user_query</action>
</step>

<step n="2" goal="Load expertise map and analyze">
<action>Load {expertise_map}</action>
<action>Load {agent_manifest}</action>

<action>Analyze user_query for keyword matches across expertise_areas:

- Extract keywords from query
- Match against triggers in each expertise area
- Score relevance based on keyword density and context
- Identify top 1-3 matching expertise areas
</action>

<action>Build matched_areas array with:

- area_name
- primary_module
- secondary_module (if any)
- match_score
- relevant_triggers_found
</action>

<check if="no matches found">
  <output>I couldn't identify a specific expertise match. Let me show you what's available:</output>
  <action>List all expertise areas with brief descriptions</action>
  <ask>Which area seems most relevant to your need?</ask>
  <action>Set matched_areas based on selection</action>
</check>
</step>

<step n="3" goal="Present recommendations">
<action>For each matched_area, look up:
- suggested_agents with full details from agent_manifest
- suggested_workflows
</action>

<output>Based on your query, I recommend expertise from:

---
{{#each matched_areas}}
**{area_name}** (Match: {match_score}%)

**Primary Module:** {primary_module}
{{#if secondary_module}}**Secondary Module:** {secondary_module}{{/if}}

**Recommended Agents:**
{{#each suggested_agents}}

- **{display}** ({name}) - {use_case}
{{/each}}

**Relevant Workflows:**
{{#each suggested_workflows}}

- {workflow-name}
{{/each}}

---
{{/each}}
</output>
</step>

<step n="4" goal="Check for cross-module opportunities">
<action>Load project registry and get active project</action>
<action>Check project's modules_used against recommended modules</action>

<check if="recommended module not in modules_used">
  <output>**Note:** {recommended_module} is not currently in your project's module list.

You can still consult these agents via Party Mode, or add the module to your project for full workflow access.</output>
</check>

<action>Check cross_module_triggers for scenario matches based on:

- Current project phase
- Recent artifacts
- Keywords in query
</action>

<check if="cross_module_trigger matched">
  <output>**Cross-Module Opportunity Detected:**

{trigger_scenario}

**Recommendation:** {suggested_action}
**Reason:** {reason}
**Modules to involve:** {recommend_modules}
</output>
</check>
</step>

<step n="5" goal="Offer next steps">
<ask>How would you like to proceed?

1. **Load Agent** - Get the command to start working with a recommended agent
2. **Start Party Mode** - Bring multiple agents together for a collaborative discussion
3. **Add Module** - Add a recommended module to your active project
4. **More Details** - Learn more about a specific agent or workflow
5. **Return to Menu** - Go back to Abdul's menu

Choice [1/2/3/4/5]:</ask>
</step>

<step n="6" goal="Execute choice">
<check if="choice == 1">
  <ask>Which agent would you like to load? (Enter agent name or number from list):</ask>
  <action>Look up agent in manifest</action>
  <output>To load **{agent_display}**:

**Skill command:** `/bmad:{module}:agents:{agent_name}`

**What to expect:** {agent_role}

**Communication style:** {agent_communication_style}

Would you like me to load this agent now? (y/n)</output>
  <check if="y">
    <action>Execute agent invocation via exec handler</action>
  </check>
</check>

<check if="choice == 2">
  <output>Starting Party Mode with recommended agents...</output>
  <action>Build agent list from matched_areas.suggested_agents</action>
  <action>Execute party-mode workflow with pre-selected agents</action>
</check>

<check if="choice == 3">
  <ask>Which module would you like to add? (Enter module name):</ask>
  <action>Update project registry to add module to modules_used</action>
  <action>Save registry</action>
  <output>Added **{module}** to your project's modules!

You now have access to all {module} workflows.</output>
</check>

<check if="choice == 4">
  <ask>What would you like to know more about? (Enter agent name or workflow name):</ask>
  <action>Look up in manifest and display full details</action>
  <ask>Proceed with another option? [1-5]:</ask>
</check>

<check if="choice == 5">
  <output>Returning to Abdul's menu. Use [CM] anytime you need cross-module expertise!</output>
  <action>Return to agent menu</action>
</check>
</step>

</workflow>
