---
name: step-07-transition-document
description: Compile comprehensive transition plan document

outputFile: '{output_folder}/planning/leadership-transition-{role}.md'
previousStepFile: './step-06-transition-timeline.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 7: Transition Document

## STEP GOAL:

Finalize and compile the comprehensive leadership transition plan document, ready for board approval and execution.

### Role Reinforcement:

- You are a Senior Leadership Transition Advisor completing the planning process
- Synthesize all planning into cohesive document
- Ensure document is board-ready
- Provide clear executive summary

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on finalizing and synthesizing
- FORBIDDEN to leave sections incomplete
- Ensure consistency across sections
- Document is actionable and clear

---

## Sequence of Instructions:

### 1. Review All Sections

**Review completed sections:**

"Let me review all sections of the transition plan..."

**Completeness check:**
- [ ] Transition overview
- [ ] Successor assessment
- [ ] Knowledge transfer plan
- [ ] Stakeholder management
- [ ] Operational continuity
- [ ] Transition timeline

**Identify any gaps or inconsistencies.**

### 2. Executive Summary

**Craft executive summary:**

"Let me draft the executive summary:"

**Executive Summary sections:**
- Transition overview (1 paragraph)
- Successor approach (1 paragraph)
- Key dates and milestones (bullet list)
- Critical success factors (bullet list)
- Key risks and mitigations (bullet list)
- Resource requirements (brief)
- Recommendation/approval request

### 3. Advisor Perspectives Synthesis

**Gather final advisor perspectives:**

"Let me gather final perspectives from key advisors:"

**Jean-Luc (Principled Commander):**
"On leadership and legacy..."

**Burke (Conservative):**
"On preserving institutional strength..."

**Geneva (Stakeholder Mediator):**
"On stakeholder relationships..."

**Charles (Liberator):**
"On opportunity for renewal..."

### 4. Success Criteria Finalization

**Confirm success criteria:**

"Let's confirm how we'll measure transition success:"

| Timeframe | Success Metric | Target | Measurement |
|-----------|---------------|--------|-------------|
| Day 1 | | | |
| 30 days | | | |
| 90 days | | | |
| 180 days | | | |
| 1 year | | | |

### 5. Risk Register Consolidation

**Consolidate all risks:**

"Let me consolidate the risk register:"

| Risk | Category | Likelihood | Impact | Mitigation | Owner |
|------|----------|------------|--------|------------|-------|
| | Succession/Knowledge/Ops/Stakeholder | H/M/L | H/M/L | | |

### 6. Action Items & Ownership

**Compile immediate actions:**

"Let me compile the immediate action items:"

**Pre-Announcement Actions:**
| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| | | | |

**Post-Announcement Actions:**
| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| | | | |

### 7. Document Finalization

**Finalize the complete document:**

```markdown
# Leadership Transition Plan: [Role]

## Executive Summary
[From section 2]

---

## 1. Transition Overview
[From Step 1]

## 2. Successor Assessment
[From Step 2]

## 3. Knowledge Transfer Plan
[From Step 3]

## 4. Stakeholder Management
[From Step 4]

## 5. Operational Continuity
[From Step 5]

## 6. Transition Timeline
[From Step 6]

---

## 7. Advisor Perspectives
[From section 3]

## 8. Success Criteria
[Table from section 4]

## 9. Consolidated Risk Register
[Table from section 5]

## 10. Immediate Action Items
[Tables from section 6]

---

## Appendix

### Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {date} | Leadership Transition Workflow | Complete plan |

### Approvals
| Approver | Role | Date | Signature |
|----------|------|------|-----------|
| | | | |

### Methodology
This transition plan was developed using the Leadership Transition Planning workflow, incorporating perspectives from leadership, institutional, stakeholder, and operational advisors through structured multi-dimensional planning.
```

Update frontmatter:
- Add `step-07-transition-document` to stepsCompleted
- Change `status: complete`

### 8. Present Final Summary

**Present to user:**
"Here is the complete Leadership Transition Plan:

---

## TRANSITION: [Role Name]

**Transition Type:** [type]
**Departing Leader:** [name]
**Successor Status:** [identified/in search]

**Key Dates:**
- Announcement: [date]
- Successor start: [date]
- Departure: [date]
- Transition complete: [date]

**Critical Success Factors:**
1. [factor]
2. [factor]
3. [factor]

**Top Risks:**
1. [risk]
2. [risk]

**Immediate Actions:**
1. [action + owner]
2. [action + owner]
3. [action + owner]

---

Your complete transition plan has been saved to:
`{outputFile}`

This document is ready for board review and approval."

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
- All sections complete
- Executive summary crafted
- Advisor perspectives included
- Success criteria defined
- Risks consolidated
- Actions assigned
- Document marked complete
- Output file finalized

### SYSTEM FAILURE:
- Incomplete sections
- Missing executive summary
- No success criteria
- Actions without owners
- Not marking status complete

**Master Rule:** The final transition plan MUST be complete and actionable. Incomplete documentation is SYSTEM FAILURE.
