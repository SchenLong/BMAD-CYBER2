---
name: step-06-transition-timeline
description: Develop detailed handover schedule

outputFile: '{output_folder}/planning/leadership-transition-{role}.md'
nextStepFile: './step-07-transition-document.md'
previousStepFile: './step-05-operational-continuity.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 6: Transition Timeline

## STEP GOAL:

Develop a detailed transition timeline with specific milestones, activities, and ownership to ensure orderly handover.

### Role Reinforcement:

- You are a Senior Leadership Transition Advisor integrating all previous planning
- Focus on executable timeline
- Ensure accountability and tracking
- Balance thoroughness with timeline constraints

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on actionable, time-bound plans
- FORBIDDEN to leave activities unassigned
- Ensure checkpoints for course correction
- Account for realistic time requirements

---

## Sequence of Instructions:

### 1. Timeline Parameters

**Establish timeline boundaries:**

"Let's confirm the timeline parameters:"

- Transition start date: [when planning begins]
- Announcement date: [when publicly communicated]
- Successor start date: [when new leader begins]
- Departure date: [when departing leader leaves]
- Overlap period: [duration of joint service]
- Transition completion: [when handover is complete]

### 2. Phase Definition

**Define transition phases:**

"Let's structure the transition into phases:"

| Phase | Duration | Key Focus | Entry Criteria | Exit Criteria |
|-------|----------|-----------|----------------|---------------|
| 1. Planning | | Prep & selection | Decision to transition | Plan approved |
| 2. Announcement | | Communication | Plan ready | All notified |
| 3. Onboarding | | New leader start | Successor selected | Initial orientation |
| 4. Overlap | | Knowledge transfer | New leader started | Key handoffs complete |
| 5. Completion | | Full transfer | Departing leader exit | Transition closed |

### 3. Detailed Activity Schedule

**Build week-by-week plan:**

"Let's detail the activities by week:"

**Phase 1: Planning (Weeks 1-X)**
| Week | Activities | Owner | Deliverables |
|------|------------|-------|--------------|
| 1 | | | |
| 2 | | | |

**Phase 2: Announcement (Week X)**
| Day | Activities | Owner | Deliverables |
|-----|------------|-------|--------------|
| Day 1 | | | |
| Day 2-3 | | | |

**Phase 3: Onboarding (Weeks X-Y)**
| Week | Activities | Owner | Deliverables |
|------|------------|-------|--------------|
| | | | |

**Phase 4: Overlap (Weeks Y-Z)**
| Week | Activities | Owner | Deliverables |
|------|------------|-------|--------------|
| | | | |

**Phase 5: Completion**
| Week | Activities | Owner | Deliverables |
|------|------------|-------|--------------|
| | | | |

### 4. Critical Milestones

**Identify key milestones:**

"What are the critical milestones we must track?"

| Milestone | Target Date | Owner | Success Criteria |
|-----------|-------------|-------|------------------|
| Successor identified | | | Candidate accepted |
| Announcement complete | | | All stakeholders notified |
| Successor started | | | Day 1 complete |
| Key intros complete | | | All critical stakeholders met |
| Primary handoffs complete | | | Critical knowledge transferred |
| Departing leader exit | | | Clean departure |
| Transition closed | | | No open items |

### 5. Key Meetings & Events

**Schedule critical meetings:**

"Let's schedule key transition meetings and events:"

| Meeting/Event | Participants | Date | Purpose |
|---------------|--------------|------|---------|
| Board transition update | | | |
| Leadership team intro | | | |
| All-hands announcement | | | |
| Key customer calls | | | |
| Farewell event | | | |
| Handover review | | | |

### 6. Tracking & Governance

**Establish tracking mechanism:**

"How will we track transition progress?"

**Transition governance:**
- Transition lead: [name]
- Steering group: [names]
- Status cadence: [frequency]
- Escalation path: [process]

**Progress tracking:**
- Status report format
- RAG (Red/Amber/Green) criteria
- Review checkpoints

### 7. Update Output File

**Append to the Transition Timeline section:**

```markdown
## 6. Transition Timeline

### Timeline Overview
| Milestone | Date |
|-----------|------|
| Transition start | |
| Announcement | |
| Successor start | |
| Departure | |
| Overlap period | |
| Transition complete | |

### Phase Plan
[Tables from section 2 & 3]

### Critical Milestones
[Table from section 4]

### Key Meetings & Events
[Table from section 5]

### Governance
**Transition Lead:** [name]
**Status Cadence:** [frequency]
**Escalation:** [path]
```

Update frontmatter: Add `step-06-transition-timeline` to stepsCompleted

### 8. Present Summary

**Present to user:**
"Here's the transition timeline summary:

**Key Dates:**
- Announcement: [date]
- Successor start: [date]
- Departure: [date]
- Transition complete: [date]

**Overlap Period:** [duration]

**Critical Milestones:** [count]

**Next 30 Days Key Activities:**
1. [activity]
2. [activity]
3. [activity]

**Governance:**
- Transition lead: [name]
- Status frequency: [cadence]"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Timeline [C] Continue to Transition Document"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-07-transition-document.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Timeline parameters defined
- Phases structured
- Activities detailed
- Milestones identified
- Governance established
- Output file updated

### SYSTEM FAILURE:
- Vague timeline without dates
- Missing activity ownership
- No tracking mechanism
- Not updating output file
