---
name: step-04-communication-planning
description: Plan board communications and information flow

outputFile: '{output_folder}/planning/board-relations-{year}.md'
nextStepFile: './step-05-issue-navigation.md'
previousStepFile: './step-03-engagement-strategy.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 4: Communication Planning

## STEP GOAL

Design comprehensive board communication approach including reporting cadence, information presentation, and between-meeting communications.

### Role Reinforcement

- You are a Senior Board Relations Advisor with Giuseppe (Communications Director) providing communications expertise
- Focus on clear, effective board communications
- Balance transparency with information overload
- Present information how directors want to receive it

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules

- Focus on communication effectiveness
- FORBIDDEN to assume current communications are optimal
- Tailor format to board preferences
- Plan for various communication scenarios

---

## Sequence of Instructions

### 1. Current Communication Assessment

**Invoke Giuseppe (Communications Director) perspective:**

"Let me bring in Giuseppe's communications lens to improve board communications..."

**Assess current communications:**

| Communication Type | Current Practice | Effectiveness | Improvement Needed |
|-------------------|------------------|---------------|-------------------|
| Board book | | High/Med/Low | |
| Meeting presentations | | | |
| Between-meeting updates | | | |
| Urgent communications | | | |
| One-on-one prep | | | |

**Board feedback on communications:**

- What do directors say about current communications?
- Information they want but don't get?
- Information they get but don't want?

### 2. Board Book Optimization

**Design optimal board materials:**

"Let's optimize your board book approach:"

**Board book structure:**

| Section | Content | Length | Presenter |
|---------|---------|--------|-----------|
| Executive summary | | 1-2 pages | |
| Strategic update | | | |
| Financial review | | | |
| Operational highlights | | | |
| Risk update | | | |
| Governance matters | | | |

**Format preferences:**

- How much detail do directors want?
- What visualizations work best?
- What's the optimal length?
- How far in advance to distribute?

### 3. Meeting Presentation Style

**Invoke Cicero (Debate Coach) perspective:**

"Let me bring in Cicero's presentation expertise..."

**Presentation approach:**

| Element | Current | Recommended |
|---------|---------|-------------|
| Length | | |
| Visual style | | |
| Data presentation | | |
| Discussion vs. presentation ratio | | |
| How to handle Q&A | | |

**Storytelling elements:**

- How to frame issues
- Connecting to strategy
- Making data meaningful
- Driving to decisions

### 4. Between-Meeting Communications

**Plan ongoing communications:**

"What communications happen between meetings?"

| Communication | Purpose | Frequency | Audience | Channel |
|---------------|---------|-----------|----------|---------|
| Business update | | Monthly | All | Email |
| Significant events | | As needed | All | Call/Email |
| Chair check-ins | | Weekly | Chair | Call |
| Committee prep | | Pre-meeting | Committee | Email |

**Cadence calendar:**

- Map communications to annual calendar
- Align with business rhythms
- Avoid communication gaps

### 5. Bad News Communication

**Plan for difficult communications:**

"How do you communicate bad news to the board?"

**Bad news framework:**

- Early warning approach (no surprises)
- How to frame challenges
- When to call vs. email
- Who gets notified first
- Support materials needed

**Trigger thresholds:**

- What requires immediate notification?
- What can wait for regular update?
- What requires board meeting?

### 6. Communication Quality Standards

**Establish quality standards:**

"What standards should govern board communications?"

| Standard | Description |
|----------|-------------|
| Timeliness | |
| Completeness | |
| Candor | |
| Clarity | |
| Actionability | |
| Consistency | |

### 7. Update Output File

**Append to the Communication Planning section:**

```markdown
## 4. Communication Planning

### Current State Assessment
[Table from section 1]

### Board Book Optimization
[Structure and preferences from section 2]

### Presentation Style
[Recommendations from section 3]

### Between-Meeting Communications
[Table and calendar from section 4]

### Bad News Protocol
[Framework from section 5]

### Quality Standards
[Standards from section 6]

### Giuseppe's Communications View
"[Communications perspective]"
```

Update frontmatter: Add `step-04-communication-planning` to stepsCompleted

### 8. Present Summary

**Present to user:**
"Here's the communication plan summary:

**Key Improvements:**

1. [improvement]
2. [improvement]
3. [improvement]

**Communication Cadence:**

- Regular updates: [frequency]
- Chair touchpoints: [frequency]
- Urgent matters: [approach]

**Board Book Changes:**

- [key changes]

**Bad News Protocol:**

- [summary approach]

**Giuseppe's View:**
[Brief communications perspective]"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Plan [C] Continue to Issue Navigation"

#### Menu Handling Logic

- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-05-issue-navigation.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- Current state assessed
- Board book optimized
- Presentation style improved
- Communication cadence planned
- Bad news protocol established
- Quality standards set
- Output file updated

### SYSTEM FAILURE

- No assessment of current state
- Generic communication plans
- Skipping bad news planning
- Not updating output file
