# Conflict Resolution - Team Orchestration Instructions

<critical>The workflow execution engine is governed by: {project-root}/src/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: conflict-resolution/workflow.yaml</critical>
<critical>Communicate in {communication_language} with {user_name}</critical>

<workflow>

<step n="1" goal="Identify and classify conflict">
<output>
# Conflict Resolution

This workflow helps resolve conflicts between teams or modules during orchestration.

**Conflict Types:**

1. **Timeline** - Competing deadlines
2. **Priority** - Competing priorities
3. **Resource** - Shared resource contention
4. **Technical** - Technical disagreement
5. **Compliance** - Compliance vs business tension

---
</output>

<ask>What type of conflict needs resolution?

1. **Timeline conflict** - Competing deadlines or schedules
2. **Priority conflict** - Competing team priorities
3. **Resource conflict** - Same resource needed by multiple teams
4. **Technical conflict** - Disagreement on approach
5. **Compliance conflict** - Compliance vs business needs

Choice [1-5]:</ask>
<action>Store as conflict_type</action>

<ask>Describe the conflict:

- What are the competing interests?
- Which teams/modules are involved?
- What is the impact if unresolved?

Description:</ask>
<action>Store as conflict_description</action>
</step>

<step n="2" goal="Gather perspectives">
<output>
## Gathering Perspectives

Understanding all sides of the conflict is essential for resolution.

**Conflict Type:** {conflict_type}
**Description:** {conflict_description}

---
</output>

<ask>Which teams/modules are in conflict?

(Enter comma-separated list: bmm, cybersec-team, legal-team, strategy-team, intel-team, etc.)

Teams:</ask>
<action>Store as involved_teams</action>

<ask>Would you like to gather perspectives via:

1. **Party Mode** - Live discussion with representatives
2. **Written input** - I'll provide each team's position
3. **Skip** - I have sufficient context

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <output>Starting Party Mode with conflict parties...

**Participants:** Representatives from {involved_teams}
**Topic:** Resolution of {conflict_type} conflict

Each party will present their perspective.

Starting discussion...</output>

  <action>Load and follow{party_mode_workflow} with relevant agents from involved_teams</action>
  <action>Capture perspectives from discussion</action>
</check>

<check if="choice == 2">
  <action>For each team in involved_teams:</action>
  <ask>{team} perspective:

- What is your position?
- What constraints do you face?
- What is non-negotiable vs flexible?

{team} position:</ask>
  <action>Store perspective for team</action>
</check>

<action>Goto step 3</action>
</step>

<step n="3" goal="Analyze conflict and generate options">
<output>
## Conflict Analysis

**Summary of Positions:**

{{#each perspectives}}
**{team}:**

- Position: {position}
- Constraints: {constraints}
- Non-negotiable: {non_negotiable}
- Flexible: {flexible}
{{/each}}

---

**Conflict Analysis:**

{{#if timeline_conflict}}
**Timeline Tension:**

- {team_a} deadline: {deadline_a}
- {team_b} deadline: {deadline_b}
- Gap: {gap}
{{/if}}

{{#if priority_conflict}}
**Priority Tension:**

- {team_a} wants: {priority_a}
- {team_b} wants: {priority_b}
- Zero-sum: {is_zero_sum}
{{/if}}

---
</output>

<action>Generate resolution options based on conflict type:

Timeline: Sequential vs parallel execution, deadline negotiation, partial delivery
Priority: Phased approach, resource reallocation, scope adjustment
Resource: Time-slicing, delegation, parallel instances
Technical: Proof of concept, expert consultation, hybrid approach
Compliance: Risk acceptance, compensating controls, phased implementation
</action>

<output>
## Resolution Options

{{#each options}}
**Option {n}: {name}**

- Description: {description}
- Pros: {pros}
- Cons: {cons}
- Recommended by: {recommended_by}
- Risk level: {risk_level}

{{/each}}

---
</output>
</step>

<step n="4" goal="Facilitate resolution decision">
<ask>How would you like to proceed with resolution?

1. **Select option** - Choose from generated options
2. **Escalate** - Send to higher authority for decision
3. **Mediated discussion** - Party mode to negotiate
4. **Custom solution** - Propose alternative

Choice [1/2/3/4]:</ask>

<check if="choice == 1">
  <ask>Which option? (Enter number):</ask>
  <action>Store selected_option</action>
</check>

<check if="choice == 2">
  <output>Escalating conflict for resolution...

**Escalation Path:**
{{#if timeline_conflict}}

- To: Strategy Team (timeline/business decisions)
{{/if}}
{{#if compliance_conflict}}
- To: Legal Team (compliance decisions)
{{/if}}
{{#if technical_conflict}}
- To: Architecture review (technical decisions)
{{/if}}

**Escalation Package:**

- Conflict summary
- Positions from all parties
- Options considered
- Recommendation if any

Preparing escalation...</output>

  <action>Create escalation package</action>
</check>

<check if="choice == 3">
  <output>Starting mediated discussion...

**Objective:** Reach consensus on resolution
**Mediator:** Abdul (Project Manager)
**Parties:** {involved_teams}

Ground rules:

1. Each party states needs, not positions
2. Focus on interests, not demands
3. Seek win-win solutions

Starting mediation...</output>

  <action>Load and followparty-mode for mediation</action>
</check>

<check if="choice == 4">
  <ask>Describe the custom solution:</ask>
  <action>Store custom_solution</action>
</check>
</step>

<step n="5" goal="Document resolution and commitments">
<output>
## Resolution Documentation

**Conflict:** {conflict_description}
**Type:** {conflict_type}
**Involved Teams:** {involved_teams}

**Resolution:** {selected_resolution}

**Commitments:**
{{#each commitments}}

- {team}: {commitment}
{{/each}}

**Trade-offs Accepted:**
{{#each tradeoffs}}

- {tradeoff}
{{/each}}

**Risks Acknowledged:**
{{#each risks}}

- {risk}
{{/each}}

---
</output>

<ask>Confirm resolution details are accurate?

1. **Confirm** - Record resolution
2. **Modify** - Adjust details
3. **Cancel** - Do not record

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <action>Save resolution to {output_folder}/conflict-resolutions/{date}-{conflict_type}.md</action>
  <output>
Resolution documented.

**Follow-up Actions:**
{{#each action_items}}

- [ ] {action} - Owner: {owner} - Due: {due}
{{/each}}

Use [PS] Project Status to track follow-up.
</output>
</check>
</step>

<step n="6" goal="Update project context">
<action>Update project registry with resolution:
  - Add to resolution_history
  - Update affected artifacts if needed
  - Notify affected workflows
</action>

<output>
# Resolution Complete

**Summary:**

- Conflict: {conflict_type}
- Resolution: {resolution_summary}
- Documented: {resolution_path}

Returning to orchestration workflow...
</output>
</step>

</workflow>
