---
name: step-06-review-document
description: Compile comprehensive review materials

outputFile: '{output_folder}/planning/performance-review-{employee}.md'
previousStepFile: './step-05-conversation-prep.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 6: Review Documentation

## STEP GOAL:

Compile all preparation into comprehensive, professional review documentation ready for the conversation and HR records.

### Role Reinforcement:

- You are a Senior Executive Coach finalizing the review preparation
- Synthesize all planning into cohesive documentation
- Ensure document is professional and defensible
- Create both conversation guide and formal record

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on clear, professional documentation
- FORBIDDEN to leave sections incomplete
- Ensure consistency across all sections
- Document must serve both conversation and record

---

## Sequence of Instructions:

### 1. Review All Sections

**Review completed sections:**

"Let me review all sections of the performance review preparation..."

**Completeness check:**
- [ ] Review setup
- [ ] Performance assessment
- [ ] Feedback calibration
- [ ] Development planning
- [ ] Conversation preparation

**Identify any gaps or inconsistencies.**

### 2. Formal Review Document

**Create formal review summary:**

"Let's create the formal review document:"

```markdown
## PERFORMANCE REVIEW: {Employee Name}

**Review Period:** [dates]
**Review Type:** [type]
**Manager:** {user_name}
**Date:** {current_date}

### Overall Rating: [X/5]

### Summary
[2-3 sentence overall assessment]

### Results Assessment
**Rating:** [X/5]

| Goal | Result | Rating |
|------|--------|--------|
| | Met/Exceeded/Below | /5 |

### Behavior Assessment
**Rating:** [X/5]

**Strengths:**
1. [strength]
2. [strength]
3. [strength]

**Development Areas:**
1. [area]
2. [area]

### Development Plan

| Development Area | Actions | Timeline |
|-----------------|---------|----------|
| | | |

### Goals for Next Period
1. [goal]
2. [goal]
3. [goal]

### Manager Comments
[Additional comments]

### Employee Comments
[To be completed after discussion]

---
**Signatures:**

Manager: _________________ Date: _______

Employee: _________________ Date: _______
```

### 3. Conversation Guide

**Create personal conversation guide:**

"Let's create your conversation guide:"

**Conversation Guide (for your use only)**

**Opening (5 min):**
- [talking points]

**Key Messages:**
1. [message]
2. [message]
3. [message]

**Difficult Feedback:**
- [feedback + SBI + anticipated response]

**Questions to Ask:**
1. [question]
2. [question]

**Development Discussion:**
- Focus areas: [list]
- Support to offer: [list]

**Closing:**
- [what to end with]

### 4. Key Talking Points

**Distill key talking points:**

"What are the essential points to communicate?"

**Must say:**
1. [point]
2. [point]
3. [point]

**Should say:**
1. [point]
2. [point]

**Avoid saying:**
1. [thing to avoid]
2. [thing to avoid]

### 5. Post-Conversation Actions

**Plan follow-up:**

"What needs to happen after the conversation?"

| Action | Timeline | Owner |
|--------|----------|-------|
| Share written review | Within 24 hours | You |
| Get employee comments | Within 1 week | Employee |
| Submit to HR | Per HR timeline | You |
| Begin development actions | Within 2 weeks | Both |
| Schedule follow-up check-in | Within 30 days | You |

### 6. Advisor Synthesis

**Gather final advisor perspectives:**

**Jean-Luc (Principled Commander):**
"On leading with integrity in this review..."

**Sophia (Ethics Advisor):**
"On ensuring fairness..."

**Geneva (Stakeholder Mediator):**
"On maintaining the relationship..."

**Charles (Liberator):**
"On unlocking potential..."

### 7. Finalize Output File

**Complete the review document:**

```markdown
## 6. Review Documentation

### Formal Review Document
[Document from section 2]

### Conversation Guide
[Guide from section 3]

### Key Talking Points
[Points from section 4]

### Post-Conversation Actions
[Table from section 5]

### Advisor Synthesis
[Perspectives from section 6]

---

## Appendix

### Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {date} | Performance Review Workflow | Complete preparation |

### Inputs Used
[List of inputs that informed this review]

### Methodology
This performance review was prepared using the Performance Review Preparation workflow, incorporating perspectives from evidence-based assessment, ethics and fairness, conversation design, and development planning advisors through structured multi-dimensional analysis.
```

Update frontmatter:
- Add `step-06-review-document` to stepsCompleted
- Change `status: complete`

### 8. Present Final Summary

**Present to user:**
"Here is the complete Performance Review Preparation:

---

## REVIEW: {Employee Name}

**Overall Rating:** [X/5]

**Key Strengths:**
1. [strength]
2. [strength]

**Development Focus:**
1. [area]
2. [area]

**Key Messages for Conversation:**
1. [message]
2. [message]
3. [message]

**Conversation Logistics:**
- Duration: [X minutes]
- Key phases: [summary]

**Post-Conversation:**
1. [action]
2. [action]

---

Your complete review preparation has been saved to:
`{outputFile}`

You're ready for the review conversation!"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Document [E] Export/Share [X] Exit Workflow"

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
- Formal document created
- Conversation guide ready
- Key talking points distilled
- Post-conversation actions planned
- Advisor synthesis included
- Document marked complete
- Output file finalized

### SYSTEM FAILURE:
- Incomplete formal document
- No conversation guide
- Missing key talking points
- No follow-up plan
- Not marking status complete

**Master Rule:** The final review preparation MUST be comprehensive and actionable. Incomplete preparation is SYSTEM FAILURE.
