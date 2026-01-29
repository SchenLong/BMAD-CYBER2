---
name: step-06-action-plan
description: Compile actionable board relations plan

outputFile: '{output_folder}/planning/board-relations-{year}.md'
previousStepFile: './step-05-issue-navigation.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 6: Relationship Action Plan

## STEP GOAL:

Compile all planning into a concrete, actionable board relations plan with specific actions, timelines, and success metrics.

### Role Reinforcement:

- You are a Senior Board Relations Advisor completing the planning process
- Synthesize all planning into actionable items
- Ensure plan is practical and executable
- Establish clear success metrics

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on actionable, time-bound commitments
- FORBIDDEN to leave actions vague
- Assign owners and deadlines
- Create tracking mechanisms

---

## Sequence of Instructions:

### 1. Review All Sections

**Review completed sections:**

"Let me review all sections of the board relations plan..."

**Completeness check:**
- [ ] Board assessment
- [ ] Director profiles
- [ ] Engagement strategy
- [ ] Communication planning
- [ ] Issue navigation

**Identify key priorities from each section.**

### 2. Prioritized Action Items

**Compile action items:**

"Let's compile the key actions into a prioritized plan:"

**Immediate Actions (Next 30 Days)**
| Action | Owner | Deadline | Success Metric |
|--------|-------|----------|----------------|
| | | | |

**Short-Term Actions (30-90 Days)**
| Action | Owner | Deadline | Success Metric |
|--------|-------|----------|----------------|
| | | | |

**Ongoing Actions (Quarterly/Annual)**
| Action | Frequency | Owner | Success Metric |
|--------|-----------|-------|----------------|
| | | | |

### 3. Relationship Goals

**Set relationship improvement targets:**

"What specific relationship improvements are you targeting?"

| Director | Current State | Target State | By When | Key Actions |
|----------|---------------|--------------|---------|-------------|
| | 1-5 | 1-5 | | |

**Overall relationship goals:**
- Board confidence score target: [X/5]
- Number of strong relationships: [X of Y]
- Specific relationship improvements: [list]

### 4. Communication Calendar

**Create annual communication calendar:**

"Let's map communications to the calendar:"

| Month | Board Meeting | Key Communications | Special Events |
|-------|---------------|-------------------|----------------|
| Jan | | | |
| Feb | | | |
| Mar | | | |
| [etc] | | | |

### 5. Engagement Tracking

**Design tracking mechanism:**

"How will you track board engagement?"

**Tracking elements:**
- One-on-one completion tracking
- Communication feedback collection
- Relationship pulse checks
- Issue resolution tracking
- Action item completion

**Review cadence:**
- Weekly: [what to track]
- Monthly: [what to review]
- Quarterly: [what to assess]

### 6. Success Metrics

**Define success metrics:**

"How will you measure success of this board relations effort?"

| Metric | Current Baseline | Target | Measurement Method |
|--------|------------------|--------|-------------------|
| Overall board confidence | | | Annual survey |
| Chair relationship quality | | | Self-assessment |
| Communication satisfaction | | | Feedback |
| Issue resolution effectiveness | | | Tracking |
| One-on-one completion rate | | | Calendar review |

### 7. Finalize Output File

**Complete the board relations document:**

```markdown
## 6. Board Relations Action Plan

### Priority Actions

**Immediate (30 Days)**
[Table from section 2]

**Short-Term (90 Days)**
[Table from section 2]

**Ongoing**
[Table from section 2]

### Relationship Goals
[Table from section 3]

### Communication Calendar
[Calendar from section 4]

### Tracking Approach
[Summary from section 5]

### Success Metrics
[Table from section 6]

---

## Appendix

### Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {date} | Board Relations Workflow | Complete plan |

### Review Schedule
- Monthly: Action completion review
- Quarterly: Relationship assessment
- Annual: Full plan refresh

### Methodology
This board relations plan was developed using the Board Relations Management workflow, incorporating perspectives from political strategy, communications, relationship building, and governance advisors through structured analysis.
```

Update frontmatter:
- Add `step-06-action-plan` to stepsCompleted
- Change `status: complete`

### 8. Present Final Summary

**Present to user:**
"Here is the complete Board Relations Plan:

---

## BOARD RELATIONS PLAN - {YEAR}

**Board Overview:**
- Directors: [count]
- Key focus relationships: [count]

**Priority Actions (Next 30 Days):**
1. [action]
2. [action]
3. [action]

**Relationship Goals:**
- Target relationship improvements: [count]
- Overall confidence target: [X/5]

**Communication Rhythm:**
- [summary of cadence]

**Success Metrics:**
[list key metrics]

---

Your complete board relations plan has been saved to:
`{outputFile}`

This plan is ready for implementation."

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Plan [E] Export/Share [X] Exit Workflow"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF E: Provide export options (PDF, share link, etc.)
- IF X: Save and exit gracefully with summary

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- All sections reviewed
- Actions prioritized with owners
- Relationship goals set
- Calendar created
- Tracking mechanism defined
- Success metrics established
- Document marked complete
- Output file finalized

### SYSTEM FAILURE:
- Vague action items
- No owners or deadlines
- Missing success metrics
- Incomplete documentation
- Not marking status complete

**Master Rule:** The final action plan MUST be specific, actionable, and trackable. Vague plans are SYSTEM FAILURE.
