---
name: step-05-operational-continuity
description: Ensure business continuity during transition

outputFile: '{output_folder}/planning/leadership-transition-{role}.md'
nextStepFile: './step-06-transition-timeline.md'
previousStepFile: './step-04-stakeholder-management.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 5: Operational Continuity

## STEP GOAL:

Ensure business operations continue smoothly during the leadership transition, identify risks to continuity, and establish contingency plans.

### Role Reinforcement:

- You are a Senior Leadership Transition Advisor with Lee (Technocrat) providing operational expertise
- Focus on maintaining operational stability
- Identify and mitigate disruption risks
- Ensure critical processes continue

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on operational stability during transition
- FORBIDDEN to assume operations will continue automatically
- Identify critical decision points
- Plan for interim governance

---

## Sequence of Instructions:

### 1. Critical Operations Inventory

**Invoke Lee (Technocrat) perspective:**

"Let me bring in Lee's operational lens to ensure continuity..."

**Identify critical operations under this role:**

| Operation | Frequency | Current Owner | Backup | Risk if Disrupted |
|-----------|-----------|---------------|--------|-------------------|
| | Daily/Weekly/etc | | | High/Med/Low |
| | | | | |
| | | | | |

### 2. Decision Authority Mapping

**Map critical decisions:**

"What decisions require this role's authority?"

| Decision Type | Examples | Current Authority | Interim Authority | Escalation Path |
|---------------|----------|-------------------|-------------------|-----------------|
| Strategic | Major investments, direction | | | |
| Financial | Budget, approvals >$X | | | |
| People | Hiring, performance | | | |
| Customer | Escalations, deals | | | |
| Operational | Process changes | | | |

### 3. Pending Matters

**Identify pending items:**

"What's currently in progress that needs attention?"

| Item | Status | Deadline | Risk | Disposition |
|------|--------|----------|------|-------------|
| | | | | Complete before / Transition / Defer |
| | | | | |

**Categories:**
- Complete before departure
- Transition to successor
- Transition to interim
- Defer until new leader in place
- Delegate to team

### 4. Interim Governance

**Design interim arrangements:**

"How will the function be governed during transition?"

**Interim leadership options:**
- Acting appointment
- Distributed responsibilities
- Enhanced oversight
- External interim

**Recommended approach:** [option]

**Interim decision rights:**
| Decision Type | Interim Authority | Limitations |
|---------------|-------------------|-------------|
| | | |

**Reporting changes:**
- Who reports to whom during transition
- Temporary reporting lines
- Oversight mechanisms

### 5. Risk Assessment

**Identify operational risks:**

"What could go wrong operationally during transition?"

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Key decisions delayed | | | |
| Team uncertainty | | | |
| Customer concerns | | | |
| Project delays | | | |
| Quality issues | | | |
| Competitor action | | | |

### 6. Contingency Planning

**Plan for contingencies:**

"What if transition doesn't go as planned?"

**Scenarios:**
- Successor rejects offer / fails
- Departing leader leaves early
- Extended vacancy
- Team departures
- Performance issues

**For each scenario, define:**
- Trigger/warning signs
- Response plan
- Decision maker
- Resources needed

### 7. Update Output File

**Append to the Operational Continuity section:**

```markdown
## 5. Operational Continuity

### Critical Operations
[Table from section 1]

### Decision Authority
[Table from section 2]

### Pending Matters
[Table from section 3]

### Interim Governance
**Approach:** [selected option]
**Interim Decision Rights:**
[Table from section 4]
**Reporting Changes:**
[Details]

### Operational Risks
[Table from section 5]

### Contingency Plans
[Plans from section 6]

### Lee's Operational View
"[Operational perspective on continuity]"
```

Update frontmatter: Add `step-05-operational-continuity` to stepsCompleted

### 8. Present Summary

**Present to user:**
"Here's the operational continuity summary:

**Critical Operations:** [count] requiring attention

**Pending Matters:**
- Complete before departure: [count]
- Transition to successor: [count]
- Defer: [count]

**Interim Governance:** [approach]

**Top Operational Risks:**
1. [risk]
2. [risk]
3. [risk]

**Lee's View:**
[Brief operational perspective]"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Plan [C] Continue to Transition Timeline"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-06-transition-timeline.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Critical operations identified
- Decision authority mapped
- Pending matters dispositioned
- Interim governance planned
- Risks assessed
- Contingencies planned
- Output file updated

### SYSTEM FAILURE:
- Missing critical operations
- No interim governance plan
- Skipping risk assessment
- Not updating output file
