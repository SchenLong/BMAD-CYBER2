---
name: step-05-issue-navigation
description: Prepare for difficult conversations and contentious issues

outputFile: '{output_folder}/planning/board-relations-{year}.md'
nextStepFile: './step-06-action-plan.md'
previousStepFile: './step-04-communication-planning.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 5: Issue Navigation

## STEP GOAL

Prepare for difficult board conversations, contentious issues, and challenging dynamics to maintain productive relationships even under stress.

### Role Reinforcement

- You are a Senior Board Relations Advisor with Magnus (Political Strategist) providing political navigation expertise
- Focus on preparing for difficult situations
- Anticipate conflicts and plan responses
- Maintain relationships through disagreements

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules

- Focus on realistic scenario planning
- FORBIDDEN to assume all interactions will be smooth
- Prepare for worst-case scenarios
- Plan to preserve relationships even when disagreeing

---

## Sequence of Instructions

### 1. Contentious Issues Inventory

**Invoke Magnus (Political Strategist) perspective:**

"Let me bring in Magnus's political lens to prepare for contentious issues..."

**Identify current/upcoming contentious issues:**

| Issue | Why Contentious | Key Stakeholders | Your Position | Board Likely Position |
|-------|-----------------|------------------|---------------|----------------------|
| | | | | |

**For each contentious issue:**

- What's at stake?
- Who cares most?
- Where's the disagreement?
- What's the political landscape?

### 2. Difficult Director Strategies

**Plan for challenging director interactions:**

"Which directors are most challenging to work with, and why?"

**Director: [Name]**

| Challenge | Root Cause | Strategy |
|-----------|------------|----------|
| | | |

**Common difficult behaviors and responses:**

- Excessive questioning: [approach]
- Public criticism: [approach]
- Micromanagement: [approach]
- Hidden agendas: [approach]
- Alliance building against you: [approach]

### 3. Conflict Scenarios

**Plan for potential conflicts:**

"What conflicts might arise with the board?"

| Scenario | Likelihood | Impact | Prevention | Response Plan |
|----------|------------|--------|------------|---------------|
| Performance disagreement | | | | |
| Strategic direction conflict | | | | |
| Compensation dispute | | | | |
| Risk tolerance mismatch | | | | |
| Individual director conflict | | | | |
| Vote of no confidence | | | | |

### 4. Managing Board Disagreement

**Plan approach to board disagreement:**

"How do you handle situations where you disagree with the board?"

**Disagreement framework:**

1. Understand their position fully
2. Articulate your position clearly
3. Find common ground
4. Know when to push vs. accept
5. Disagree and commit when necessary

**Key principles:**

- Maintain respect always
- Separate people from positions
- Focus on interests, not positions
- Know your non-negotiables
- Preserve relationships for future issues

### 5. Building Support for Difficult Decisions

**Plan coalition building:**

"When you need board support for a difficult decision, how do you build it?"

**Coalition strategy:**

| Phase | Activities |
|-------|------------|
| Groundwork | Individual conversations, understand concerns |
| Alignment | Address concerns, modify as needed |
| Socialization | Build consensus before formal discussion |
| Decision | Present with confidence, handle objections |
| Follow-through | Report on outcomes, build trust |

**Sequencing:**

- Who to talk to first?
- Who can influence others?
- When to go formal?

### 6. Crisis Relationship Management

**Plan for crisis situations:**

"How do you maintain board relationships during a crisis?"

**Crisis board management:**

- Communication frequency increase
- Transparency requirements
- Decision-making protocols
- Unity demonstration
- Media/stakeholder coordination

### 7. Update Output File

**Append to the Issue Navigation section:**

```markdown
## 5. Issue Navigation

### Contentious Issues Inventory
[Table from section 1]

### Difficult Director Strategies
[Analysis from section 2]

### Conflict Scenarios
[Table from section 3]

### Disagreement Framework
[Framework from section 4]

### Coalition Building Strategy
[Strategy from section 5]

### Crisis Management Approach
[Summary from section 6]

### Magnus's Political View
"[Political navigation perspective]"
```

Update frontmatter: Add `step-05-issue-navigation` to stepsCompleted

### 8. Present Summary

**Present to user:**
"Here's the issue navigation summary:

**Current Contentious Issues:**

1. [issue]
2. [issue]

**Challenging Directors:**

- [name]: [strategy summary]

**Key Conflict Scenarios Planned:**
[count] scenarios with response plans

**Disagreement Approach:**
[key principle]

**Coalition Building:**
[summary approach]

**Magnus's View:**
[Brief political perspective]"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Plans [C] Continue to Action Plan"

#### Menu Handling Logic

- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-06-action-plan.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- Contentious issues identified
- Difficult director strategies planned
- Conflict scenarios prepared
- Disagreement framework established
- Coalition strategy developed
- Output file updated

### SYSTEM FAILURE

- Assuming smooth sailing
- No conflict preparation
- Skipping difficult director planning
- Not updating output file
