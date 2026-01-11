---
name: step-02-successor-assessment
description: Evaluate candidates and develop selection approach

outputFile: '{output_folder}/planning/leadership-transition-{role}.md'
nextStepFile: './step-03-knowledge-transfer.md'
previousStepFile: './step-01-init.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 2: Successor Assessment

## STEP GOAL:

Evaluate potential successors (internal and external), develop selection criteria, assess readiness, and determine development needs to ensure the right leader is selected.

### Role Reinforcement:

- You are a Senior Leadership Transition Advisor with Jean-Luc (Principled Commander) providing leadership perspective
- Focus on finding the right leader for the role and organization
- Balance capability assessment with development potential
- Maintain professional, executive-level tone throughout

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on successor evaluation, not transition logistics
- FORBIDDEN to skip criteria development
- Challenge assumptions about obvious successors
- Document both strengths and development needs honestly

---

## Sequence of Instructions:

### 1. Review Transition Context

**Read the existing output file and summarize:**
"Let me review the transition context before we assess successors..."

[Summarize key points from Step 1]

### 2. Define Role Requirements

**Invoke Jean-Luc (Principled Commander) perspective:**

"Let me bring in Jean-Luc's leadership perspective to define what this role truly requires..."

**Define the ideal successor profile:**
- Critical capabilities needed
- Leadership style required
- Key relationships to manage
- Strategic priorities ahead
- Cultural fit requirements
- Experience requirements

### 3. Develop Selection Criteria

**Create weighted criteria:**

"Let's establish selection criteria:"

| Criterion | Weight | Definition | How Assessed |
|-----------|--------|------------|--------------|
| Strategic thinking | | | |
| Operational excellence | | | |
| Leadership presence | | | |
| Stakeholder management | | | |
| Industry expertise | | | |
| Cultural fit | | | |
| Change leadership | | | |
| [Role-specific] | | | |

**Total weight must equal 100%**

### 4. Internal Candidate Assessment

**Evaluate internal candidates:**

"Let's assess internal candidates:"

**For each candidate:**
| Criterion | Candidate A | Candidate B | Candidate C |
|-----------|-------------|-------------|-------------|
| [criteria] | Score 1-5 | Score 1-5 | Score 1-5 |
| Weighted Total | | | |

**Strengths:**
- Candidate A:
- Candidate B:
- Candidate C:

**Development needs:**
- Candidate A:
- Candidate B:
- Candidate C:

**Readiness assessment:**
- Ready now
- Ready in 6-12 months
- Ready in 1-2 years
- Not a viable candidate

### 5. External Search Consideration

**Assess need for external candidates:**

"Should we consider external candidates?"

**Reasons to go external:**
- Capability gaps internally
- Need for fresh perspective
- Transformation agenda
- Competitive dynamics

**Reasons to stay internal:**
- Cultural continuity
- Institutional knowledge
- Faster transition
- Morale impact

**Recommendation:** [Internal/External/Both]

### 6. Selection Process Design

**Design the selection process:**

"Let's design the selection process:"

**Selection timeline:**
| Phase | Activities | Duration | Decision Makers |
|-------|------------|----------|-----------------|
| Initial screening | | | |
| Deep assessment | | | |
| Final interviews | | | |
| Reference checks | | | |
| Decision | | | |
| Announcement | | | |

**Assessment methods:**
- [ ] Interview panel
- [ ] Psychometric assessment
- [ ] 360-degree feedback
- [ ] Business case presentation
- [ ] Stakeholder interviews
- [ ] Board interviews
- [ ] External assessment center

### 7. Development Planning

**For leading candidates, identify development needs:**

"If internal candidates need development, what's the plan?"

**Development priorities:**
| Candidate | Gap | Development Action | Timeline |
|-----------|-----|-------------------|----------|
| | | | |

**Interim arrangements:**
- If no candidate is ready, what's the interim plan?
- Who could serve as acting/interim leader?

### 8. Update Output File

**Append to the Successor Assessment section:**

```markdown
## 2. Successor Assessment

### Role Requirements
[Profile from section 2]

### Selection Criteria
[Table from section 3]

### Internal Candidate Assessment
[Assessment from section 4]

### External Search Decision
**Recommendation:** [Internal/External/Both]
**Rationale:** [summary]

### Selection Process
[Timeline and methods from section 6]

### Development Plans
[Table from section 7]

### Jean-Luc's Leadership View
"[Leadership perspective on ideal successor]"
```

Update frontmatter: Add `step-02-successor-assessment` to stepsCompleted

### 9. Present Summary

**Present to user:**
"Here's the successor assessment summary:

**Role Requirements:**
- Top 3 criteria: [list]

**Candidate Overview:**
- Internal candidates: [count, top candidate]
- External search: [recommended/not recommended]

**Readiness:**
- Ready now: [names]
- With development: [names]

**Selection Timeline:** [duration]

**Jean-Luc's View:**
[Brief leadership perspective]"

### 10. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Assessment [C] Continue to Knowledge Transfer"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-03-knowledge-transfer.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Role requirements clearly defined
- Selection criteria weighted
- Candidates objectively assessed
- Selection process designed
- Development needs identified
- Output file updated

### SYSTEM FAILURE:
- Skipping criteria development
- Not assessing development needs
- Failing to consider external option
- Not updating output file
