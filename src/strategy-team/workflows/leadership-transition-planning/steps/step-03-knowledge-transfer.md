---
name: step-03-knowledge-transfer
description: Document critical knowledge and transfer mechanisms

outputFile: '{output_folder}/planning/leadership-transition-{role}.md'
nextStepFile: './step-04-stakeholder-management.md'
previousStepFile: './step-02-successor-assessment.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 3: Knowledge Transfer Planning

## STEP GOAL

Identify and document critical knowledge held by the departing leader, design transfer mechanisms, and ensure institutional knowledge is preserved.

### Role Reinforcement

- You are a Senior Leadership Transition Advisor with Burke (Conservative) providing institutional perspective
- Focus on preserving valuable institutional knowledge
- Capture both explicit and tacit knowledge
- Ensure nothing critical is lost in transition

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules

- Focus on knowledge capture and transfer
- FORBIDDEN to assume knowledge will transfer naturally
- Identify both documented and undocumented knowledge
- Plan for relationship knowledge, not just operational

---

## Sequence of Instructions

### 1. Knowledge Inventory

**Invoke Burke (Conservative) perspective:**

"Let me bring in Burke's institutional perspective to ensure we preserve critical knowledge..."

**Identify knowledge categories:**

| Category | Examples | Current State | Risk if Lost |
|----------|----------|---------------|--------------|
| Strategic | Vision, plans, context | | High/Med/Low |
| Operational | Processes, systems, workarounds | | |
| Relational | Key contacts, relationship history | | |
| Political | Power dynamics, sensitivities | | |
| Historical | Decisions, context, lessons | | |
| Technical | Domain expertise, best practices | | |
| Cultural | Norms, values, unwritten rules | | |

### 2. Critical Relationship Mapping

**Map key relationships:**

"What relationships must be transferred?"

**Internal relationships:**

| Stakeholder | Relationship Quality | History/Context | Transfer Priority |
|-------------|---------------------|-----------------|-------------------|
| Board members | | | |
| Executive peers | | | |
| Direct reports | | | |
| Key influencers | | | |

**External relationships:**

| Stakeholder | Relationship Quality | History/Context | Transfer Priority |
|-------------|---------------------|-----------------|-------------------|
| Key customers | | | |
| Strategic partners | | | |
| Investors/analysts | | | |
| Regulators | | | |
| Industry peers | | | |

### 3. Tacit Knowledge Capture

**Identify undocumented expertise:**

"What knowledge exists only in the departing leader's head?"

**Tacit knowledge areas:**

- Decision-making frameworks
- Judgment calls and heuristics
- Lessons from past failures
- What NOT to do
- Political sensitivities
- Hidden landmines
- Informal power structures
- Organizational memory

**Capture methods:**

- [ ] Structured interviews
- [ ] Shadowing sessions
- [ ] War stories documentation
- [ ] Decision journals
- [ ] Stakeholder briefings
- [ ] Video recordings
- [ ] Written guides

### 4. Documentation Requirements

**Plan documentation:**

"What needs to be documented?"

| Document | Owner | Deadline | Status |
|----------|-------|----------|--------|
| Strategic plan context | | | |
| Key relationship guide | | | |
| Operational runbook | | | |
| Pending issues/decisions | | | |
| Lessons learned | | | |
| Risk/opportunity register | | | |
| Contact database | | | |

### 5. Transfer Mechanisms

**Design transfer approach:**

"How will knowledge be transferred?"

**Structured mechanisms:**

- Overlapping period duration: [X weeks/months]
- Joint meetings with stakeholders
- Shadowing and reverse shadowing
- Regular handover sessions
- Documentation reviews
- Stakeholder introductions

**Transfer schedule:**

| Week | Focus Area | Activities | Deliverables |
|------|------------|------------|--------------|
| 1-2 | | | |
| 3-4 | | | |
| 5-6 | | | |
| 7-8 | | | |

### 6. Risk Mitigation

**Address knowledge transfer risks:**

"What if knowledge transfer is incomplete?"

**Risks:**

- Compressed timeline
- Departing leader unavailability
- Tacit knowledge hard to articulate
- Successor capacity to absorb

**Mitigations:**

- Extended advisory period
- On-call arrangements
- Multiple knowledge recipients
- Documented backup plans

### 7. Update Output File

**Append to the Knowledge Transfer section:**

```markdown
## 3. Knowledge Transfer Planning

### Knowledge Inventory
[Table from section 1]

### Critical Relationships
**Internal:**
[Table from section 2]

**External:**
[Table from section 2]

### Tacit Knowledge Capture
[List and methods from section 3]

### Documentation Plan
[Table from section 4]

### Transfer Mechanisms
**Overlap Period:** [duration]
**Transfer Schedule:**
[Table from section 5]

### Risk Mitigations
[Plans from section 6]

### Burke's Institutional View
"[Perspective on preserving institutional knowledge]"
```

Update frontmatter: Add `step-03-knowledge-transfer` to stepsCompleted

### 8. Present Summary

**Present to user:**
"Here's the knowledge transfer plan summary:

**Critical Knowledge Areas:**

- [top 3 highest risk]

**Key Relationships to Transfer:** [count]

**Documentation Needed:** [count] documents

**Overlap Period:** [duration]

**Transfer Approach:**
[Brief summary]

**Burke's View:**
[Brief institutional perspective]"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Plan [C] Continue to Stakeholder Management"

#### Menu Handling Logic

- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-04-stakeholder-management.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- Knowledge inventory complete
- Relationships mapped
- Tacit knowledge identified
- Documentation plan created
- Transfer mechanisms designed
- Output file updated

### SYSTEM FAILURE

- Assuming knowledge transfers automatically
- Skipping relationship mapping
- Not addressing tacit knowledge
- Not updating output file
