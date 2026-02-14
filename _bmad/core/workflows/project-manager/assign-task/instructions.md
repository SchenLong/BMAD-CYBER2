# Assign Task - Instructions

<critical>The workflow execution engine is governed by: {project-root}/_bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: assign-task/workflow.yaml</critical>
<critical>Communicate in {communication_language} with {user_name}</critical>

<workflow>

<step n="1" goal="Understand the task">
<output>Task Assignment, {user_name}!

I'll help you delegate this task to the right agent with proper context.</output>

<ask>Describe the task you need done:

(Be specific - what's the goal, what's the context, any constraints?)</ask>
<action>Store as task_description</action>

<ask>How would you categorize this task?

1. **Planning** - Requirements, design, architecture decisions
2. **Implementation** - Building, coding, creating
3. **Review** - Assessing, auditing, testing
4. **Research** - Investigating, analyzing, gathering information
5. **Communication** - Stakeholder updates, documentation, presentations
6. **Other** - I'll describe it

Choice [1-6]:</ask>
<action>Store as task_category</action>
</step>

<step n="2" goal="Identify best-fit agent">
<action>Load {expertise_map}</action>
<action>Load {agent_manifest}</action>
<action>Load {workflow_manifest}</action>

<action>Analyze task_description for keyword matches:
- Extract key topics and domains
- Match against expertise_areas triggers
- Identify primary and secondary matches
</action>

<action>Cross-reference with task_category:
- Planning → pm, architect, analyst, game-designer
- Implementation → dev, game-dev, quick-flow-solo-dev
- Review → tea, penetration-tester, compliance-guardian
- Research → analyst, osint-lead, threat-analyst
- Communication → tech-writer, communications-director
</action>

<action>Build agent_recommendations ranked by:
1. Keyword match score
2. Category alignment
3. Module availability in project
</action>

<action>For top 3 agents, identify:
- Relevant workflows they can execute
- Expected deliverables
- Typical approach
</action>
</step>

<step n="3" goal="Present recommendation">
<output>Based on your task, I recommend:

---

**Best Match: {agent_display}** ({agent_name})
- **Module:** {module}
- **Why:** {match_reason}
- **Relevant Workflow:** {suggested_workflow}
- **Expected Output:** {expected_deliverable}

---

**Alternative Options:**
{{#each alternatives}}
{n}. **{display}** ({name}) - {brief_reason}
{{/each}}

---
</output>

<ask>How would you like to proceed?

1. **Accept recommendation** - Delegate to {agent_display}
2. **Choose alternative** - Select from alternatives
3. **Browse all agents** - See full agent list
4. **Modify task** - Refine the task description
5. **Cancel** - Return to menu

Choice [1-5]:</ask>
</step>

<step n="4" goal="Prepare delegation">
<check if="choice == 1 OR choice == 2">
  <action if="choice == 2">
    <ask>Which alternative? (Enter number):</ask>
    <action>Update selected_agent to chosen alternative</action>
  </action>

  <output>Preparing to delegate to **{selected_agent_display}**...</output>

  <action>Build task context package:
  - task_description (from user)
  - project_context (active project info)
  - relevant_artifacts (any related files)
  - expected_outcome (based on workflow)
  </action>
</check>

<check if="choice == 3">
  <action>Display all agents from manifest grouped by module</action>
  <ask>Select an agent (enter name):</ask>
  <action>Set selected_agent and continue</action>
</check>

<check if="choice == 4">
  <action>Return to step 1</action>
</check>

<check if="choice == 5">
  <output>Task assignment cancelled. Returning to menu.</output>
  <action>Return to agent menu</action>
</check>
</step>

<step n="5" goal="Confirm and provide invocation">
<output>
=== TASK ASSIGNMENT ===

**Task:** {task_description}
**Assigned To:** {selected_agent_display} ({selected_agent_name})
**Module:** {module}
**Workflow:** {suggested_workflow}

**Context to provide:**
- Project: {project_name}
- Phase: {current_phase}
{{#if relevant_artifacts}}
- Related files: {relevant_artifacts}
{{/if}}

---

**How to load:**

**Option A - Agent Direct:**
```
/bmad:{module}:agents:{agent_name}
```
Then describe your task to the agent.

**Option B - Workflow Direct:**
```
/bmad:{module}:workflows:{workflow_id}
```

---
</output>

<ask>Would you like me to:

1. **Load now** - Start the agent/workflow immediately
2. **Copy command** - Just provide the command for later
3. **Add notes** - Add context notes before loading
4. **Done** - Return to Abdul's menu

Choice [1/2/3/4]:</ask>

<check if="choice == 1">
  <output>Invoking {selected_agent_display}...

**Context for {selected_agent_display}:**
{user_name} has assigned you a task via Abdul (Project Manager):

**Task:** {task_description}
**Project:** {project_name}
**Expected Outcome:** {expected_deliverable}

Please proceed with this task.
</output>
  <action>Execute agent via exec handler</action>
</check>

<check if="choice == 2">
  <output>Command ready:

```
/bmad:{module}:agents:{agent_name}
```

Or for the specific workflow:
```
/bmad:{module}:workflows:{workflow_id}
```

Copy and use when ready!</output>
</check>

<check if="choice == 3">
  <ask>Add any notes or additional context for the agent:</ask>
  <action>Append to task context</action>
  <action>Return to choice prompt</action>
</check>

<check if="choice == 4">
  <output>Task delegation prepared! Returning to Abdul's menu.

Use [PS] Project Status to track progress.</output>
  <action>Return to agent menu</action>
</check>
</step>

</workflow>
