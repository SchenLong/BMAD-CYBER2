# Phase Gate Orchestrator - Instructions

<critical>The workflow execution engine is governed by: {project-root}/_bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: phase-gate/workflow.yaml</critical>
<critical>Communicate in {communication_language} with {user_name}</critical>

<workflow>

<step n="1" goal="Initialize phase gate check">
<action>Load {gate_definitions}</action>
<action>Load {project_registry}</action>
<action>Get active project</action>

<check if="no active project">
  <output>No active project found. Use **[OP] Open Project** to select a project first.</output>
  <action>Exit workflow</action>
</check>

<output>
# Phase Gate Validation

**Project:** {project_name}
**Current Phase:** {current_phase}
**Modules:** {modules_used}

This workflow validates requirements for phase transitions.

---

**Available Phase Transitions:**

1. **Discovery → Planning** (Pre-Planning Gate)
2. **Planning → Solutioning** (Pre-Architecture Gate)
3. **Solutioning → Implementation** (Pre-Implementation Gate)
4. **Implementation → Release** (Pre-Release Gate)

---
</output>

<ask>Which phase transition to validate?

1. **Pre-Planning** - Discovery → Planning
2. **Pre-Architecture** - Planning → Solutioning
3. **Pre-Implementation** - Solutioning → Implementation
4. **Pre-Release** - Implementation → Release
5. **Auto-detect** - Based on current phase

Choice [1-5]:</ask>
<action>Store as gate_selection</action>

<check if="gate_selection == 5">
  <action>Determine next gate based on current_phase:
    discovery → pre-planning
    planning → pre-architecture
    solutioning → pre-implementation
    implementation → pre-release
  </action>
</check>
</step>

<step n="2" goal="Select appropriate gate definition">
<action>Based on gate_selection and modules_used, select gate definition:
  - If modules includes cybersec-team: use *-secure variant
  - If modules includes legal-team: use *-compliance variant
  - Otherwise: use standard gate
</action>

<output>
## Gate: {selected_gate.name}

**Transition:** {selected_gate.from_phase} → {selected_gate.to_phase}
**Description:** {selected_gate.description}

---

**Requirements to Check:**

**Artifacts:**
{{#each selected_gate.required_artifacts}}
- {pattern}: {description} {{#if required}}(REQUIRED){{else}}(Recommended){{/if}}
{{/each}}

**Signoffs:**
{{#each selected_gate.required_signoffs}}
- {role}: {description}
{{/each}}

**Blocking Conditions:**
{{#each selected_gate.blocking_conditions}}
- {description}
{{/each}}

---
</output>
</step>

<step n="3" goal="Validate required artifacts">
<output>
## Validating Artifacts...
</output>

<action>For each required_artifact:
  - Search for matching files in project path
  - Check file exists and is not empty
  - Record status as PASS, FAIL, or WARN
</action>

<output>
**Artifact Check Results:**

| Artifact | Status | Location |
|----------|--------|----------|
{{#each artifact_results}}
| {pattern} | {status_emoji} {status} | {location} |
{{/each}}

---
</output>

<check if="any artifact FAIL">
  <output>
**MISSING REQUIRED ARTIFACTS:**

{{#each failed_artifacts}}
- **{pattern}**: {description}
  - Create with: {suggested_workflow}
{{/each}}
</output>
</check>
</step>

<step n="4" goal="Check blocking conditions">
<output>
## Checking Blocking Conditions...
</output>

<action>For each blocking_condition:
  - Parse condition
  - Evaluate against project state
  - Record as PASS or BLOCK
</action>

<output>
**Blocking Condition Results:**

| Condition | Status | Details |
|-----------|--------|---------|
{{#each condition_results}}
| {description} | {status_emoji} {status} | {details} |
{{/each}}

---
</output>

<check if="any condition BLOCK">
  <output>
**BLOCKING CONDITIONS NOT MET:**

{{#each blocking_conditions}}
- **{description}**
  - Current: {current_value}
  - Required: {required_value}
  - Resolution: {resolution_guidance}
{{/each}}
</output>
</check>
</step>

<step n="5" goal="Check signoff status">
<output>
## Checking Required Signoffs...
</output>

<action>For each required_signoff:
  - Check if signoff record exists in project
  - Record as COLLECTED, PENDING, or NOT_REQUIRED
</action>

<output>
**Signoff Status:**

| Role | Status | Date |
|------|--------|------|
{{#each signoff_results}}
| {role} ({agent_name}) | {status_emoji} {status} | {date} |
{{/each}}

---
</output>

<check if="any signoff PENDING">
  <output>
**PENDING SIGNOFFS:**

{{#each pending_signoffs}}
- **{role}** ({agent_name}): {description}
  - Invoke: /bmad:{module}:agents:{agent_id}
{{/each}}
</output>
</check>
</step>

<step n="6" goal="Generate gate decision">
<action>Aggregate all results:
  - artifacts_passed
  - conditions_passed
  - signoffs_collected
  - Calculate gate_status
</action>

<check if="all PASS">
  <output>
# GATE PASSED

**{selected_gate.name}** requirements are fully met.

**Summary:**
- Artifacts: {artifacts_passed}/{artifacts_total}
- Conditions: {conditions_passed}/{conditions_total}
- Signoffs: {signoffs_collected}/{signoffs_total}

**Ready to transition:** {selected_gate.from_phase} → {selected_gate.to_phase}

---

**Recommended next steps:**
{{#each selected_gate.recommendations}}
- {recommendation}
{{/each}}

---
</output>

  <ask>Update project phase to {selected_gate.to_phase}?

1. **Yes** - Update project registry
2. **No** - Keep current phase

Choice [1/2]:</ask>

  <check if="choice == 1">
    <action>Update project registry with new phase</action>
    <output>Project phase updated to: {selected_gate.to_phase}</output>
  </check>
</check>

<check if="any FAIL or BLOCK">
  <output>
# GATE NOT PASSED

**{selected_gate.name}** has unmet requirements.

**Summary:**
- Artifacts: {artifacts_passed}/{artifacts_total} {{#if artifacts_failed}}(GAPS){{/if}}
- Conditions: {conditions_passed}/{conditions_total} {{#if conditions_blocked}}(BLOCKED){{/if}}
- Signoffs: {signoffs_collected}/{signoffs_total} {{#if signoffs_pending}}(PENDING){{/if}}

---

**Actions Required:**

{{#if artifacts_failed}}
**Missing Artifacts:**
{{#each failed_artifacts}}
1. Create {pattern} using {suggested_workflow}
{{/each}}
{{/if}}

{{#if conditions_blocked}}
**Blocking Conditions:**
{{#each blocking_conditions}}
1. Resolve: {description}
   - Current: {current_value}, Required: {required_value}
{{/each}}
{{/if}}

{{#if signoffs_pending}}
**Pending Signoffs:**
{{#each pending_signoffs}}
1. Obtain signoff from {role} ({agent_name})
{{/each}}
{{/if}}

---
</output>

  <ask>How would you like to proceed?

1. **Address gaps** - Get guidance on resolving issues
2. **Request waiver** - Document exception and proceed (requires justification)
3. **Re-check later** - Exit and return when ready

Choice [1/2/3]:</ask>

  <check if="choice == 1">
    <output>
**Guidance for Resolving Gaps:**

{{#each gaps}}
**{gap_type}: {description}**
- Suggested action: {action}
- Workflow to invoke: {workflow}
- Estimated effort: {effort}

{{/each}}
</output>
  </check>

  <check if="choice == 2">
    <ask>Document waiver justification:

- Why is the exception needed?
- What risks are being accepted?
- Who approves this waiver?

Justification:</ask>

    <action>Store waiver_justification</action>
    <action>Log waiver with timestamp</action>

    <output>
**GATE WAIVED**

Waiver recorded. Proceeding with known gaps:

{{#each gaps}}
- {description} - WAIVED
{{/each}}

**Waiver Justification:** {waiver_justification}
**Waived by:** {user_name}
**Date:** {date}

**WARNING:** This waiver is logged and should be reviewed in retrospective.
</output>

    <ask>Update project phase despite gaps?

1. **Yes** - Proceed with waiver
2. **No** - Cancel

Choice [1/2]:</ask>
  </check>
</check>
</step>

<step n="7" goal="Log gate check result">
<action>Save gate check result to {output_folder}/gate-checks/{gate_id}-{date}.yaml:
  - gate_id
  - project_id
  - timestamp
  - status (PASSED/FAILED/WAIVED)
  - artifact_results
  - condition_results
  - signoff_results
  - waiver (if applicable)
</action>

<output>
Gate check logged. Use [PS] Project Status to view history.
</output>
</step>

</workflow>
