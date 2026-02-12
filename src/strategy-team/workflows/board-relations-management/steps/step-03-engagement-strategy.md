---
name: step-03-engagement-strategy
description: Develop tailored engagement approaches

outputFile: '{output_folder}/planning/board-relations-{year}.md'
nextStepFile: './step-04-communication-planning.md'
previousStepFile: './step-02-director-profiles.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 3: Engagement Strategy

## STEP GOAL

Develop tailored engagement strategies for different board contexts including meetings, one-on-ones, and informal interactions.

### Role Reinforcement

- You are a Senior Board Relations Advisor with Geneva (Stakeholder Mediator) providing relationship expertise
- Focus on practical, actionable engagement approaches
- Tailor strategies to individual directors
- Build genuine relationships, not just transactions

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules

- Focus on practical engagement tactics
- FORBIDDEN to use one-size-fits-all approaches
- Tailor to director preferences
- Plan for formal and informal contexts

---

## Sequence of Instructions

### 1. Board Meeting Engagement

**Invoke Geneva (Stakeholder Mediator) perspective:**

"Let me bring in Geneva's relationship expertise to design engagement strategies..."

**Plan board meeting approach:**

"How do you currently approach board meetings?"

**Meeting strategy elements:**

| Element | Current Practice | Improved Approach |
|---------|------------------|-------------------|
| Pre-meeting prep with Chair | | |
| Agenda influence | | |
| Presentation style | | |
| Discussion facilitation | | |
| Handling challenges | | |
| Post-meeting follow-up | | |

### 2. Individual Director Engagement

**Tailor approach by director:**

"Let's design engagement approaches for priority directors:"

**Director: [Name]**

| Engagement Type | Approach | Frequency | Topics |
|-----------------|----------|-----------|--------|
| One-on-ones | | Monthly/Quarterly | |
| Informal touchpoints | | | |
| Information sharing | | | |
| Recognition/appreciation | | | |

**Communication preferences:**

- Prefers: [detail/summary, data/narrative, written/verbal]
- Best timing: [when they're most receptive]
- What to avoid: [approaches that don't work]

### 3. Chair Relationship Strategy

**Focus on Chair relationship:**

"The Chair relationship is critical. Let's plan specifically:"

| Aspect | Current State | Strategy |
|--------|---------------|----------|
| Communication frequency | | |
| Pre-meeting coordination | | |
| Difficult issue handling | | |
| Strategic alignment | | |
| Trust building | | |

**Chair expectations:**

- What does the Chair expect from you?
- What does the Chair need that they're not getting?
- How can you make the Chair more successful?

### 4. Committee Engagement

**Plan committee-specific engagement:**

| Committee | Chair | Key Focus | Engagement Approach |
|-----------|-------|-----------|---------------------|
| Audit | | | |
| Compensation | | | |
| Nominating/Governance | | | |
| [Other] | | | |

**Committee meeting strategies:**

- How to prepare for committee meetings
- Supporting materials approach
- Executive session interactions

### 5. Informal Engagement Opportunities

**Plan informal relationship building:**

"What opportunities exist for informal engagement?"

| Opportunity | Directors | Approach |
|-------------|-----------|----------|
| Dinners | | |
| Travel/site visits | | |
| Industry events | | |
| Social occasions | | |
| Between-meeting calls | | |

**Relationship-building activities:**

- What interests do directors have?
- What experiences can you share?
- How can you demonstrate genuine interest in them?

### 6. New Director Onboarding

**Plan new director engagement:**

"How do you engage with new directors?"

**New director strategy:**

- First 90 days touchpoints
- Orientation support
- Relationship building approach
- Early wins to establish trust

### 7. Update Output File

**Append to the Engagement Strategy section:**

```markdown
## 3. Engagement Strategy

### Board Meeting Approach
[Table from section 1]

### Individual Director Strategies
[Approaches for priority directors from section 2]

### Chair Relationship Strategy
[Table from section 3]

### Committee Engagement
[Table from section 4]

### Informal Engagement
[Table from section 5]

### New Director Onboarding
[Summary from section 6]

### Geneva's Relationship View
"[Perspective on relationship building]"
```

Update frontmatter: Add `step-03-engagement-strategy` to stepsCompleted

### 8. Present Summary

**Present to user:**
"Here's the engagement strategy summary:

**Board Meeting Approach:**

- Key changes: [summary]

**Priority Director Strategies:**

- [Director 1]: [approach summary]
- [Director 2]: [approach summary]

**Chair Relationship Focus:**

- Key action: [summary]

**Informal Engagement Planned:**

- [count] opportunities identified

**Geneva's View:**
[Brief relationship perspective]"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Strategy [C] Continue to Communication Planning"

#### Menu Handling Logic

- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-04-communication-planning.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- Meeting strategy developed
- Individual approaches tailored
- Chair relationship planned
- Committee engagement planned
- Informal opportunities identified
- Output file updated

### SYSTEM FAILURE

- Generic engagement plans
- Skipping Chair relationship
- Not tailoring to individuals
- Not updating output file
