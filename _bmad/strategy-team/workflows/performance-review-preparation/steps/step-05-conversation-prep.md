---
name: step-05-conversation-prep
description: Prepare for the review conversation

outputFile: '{output_folder}/planning/performance-review-{employee}.md'
nextStepFile: './step-06-review-document.md'
previousStepFile: './step-04-development-planning.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 5: Conversation Preparation

## STEP GOAL:

Prepare thoroughly for the performance review conversation, including difficult feedback delivery, anticipating reactions, and planning the conversation flow.

### Role Reinforcement:

- You are a Senior Executive Coach with Geneva (Stakeholder Mediator) providing conversation expertise
- Focus on productive, developmental conversations
- Prepare for difficult moments
- Plan to maintain relationship while delivering honest feedback

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on conversation effectiveness
- FORBIDDEN to skip difficult feedback preparation
- Anticipate reactions and prepare responses
- Plan to balance honesty with empathy

---

## Sequence of Instructions:

### 1. Conversation Structure

**Invoke Geneva (Stakeholder Mediator) perspective:**

"Let me bring in Geneva's conversation expertise to prepare the discussion..."

**Plan conversation flow:**

| Phase | Duration | Focus | Key Points |
|-------|----------|-------|------------|
| Opening | 5 min | Set tone, agenda | |
| Self-assessment discussion | 10 min | Hear their view | |
| Performance feedback | 15 min | Share assessment | |
| Development discussion | 10 min | Future focus | |
| Goals/next steps | 10 min | Commitments | |
| Close | 5 min | Questions, appreciation | |

### 2. Opening the Conversation

**Plan the opening:**

"How will you open the conversation?"

**Opening elements:**
- Tone setting (appreciative, developmental)
- Agenda preview
- Two-way dialogue invitation
- Time management

**Opening script:**
"[Draft opening remarks]"

### 3. Difficult Feedback Delivery

**Invoke Cicero (Debate Coach) perspective for delivery:**

"Let's prepare for delivering difficult feedback..."

**For each difficult message:**

| Message | Evidence | How to Frame | Anticipate Response |
|---------|----------|--------------|---------------------|
| [development area] | | | |
| [performance concern] | | | |

**SBI framework for difficult feedback:**
- **S**ituation: When/where did this happen?
- **B**ehavior: What specifically did they do?
- **I**mpact: What was the effect?

**Example scripts:**
[Draft difficult feedback delivery]

### 4. Anticipate Reactions

**Prepare for potential reactions:**

"How might the employee react? Let's prepare:"

| Reaction | Signs | Response Strategy |
|----------|-------|-------------------|
| Defensiveness | | |
| Denial | | |
| Emotion (tears, anger) | | |
| Blame others | | |
| Silence/withdrawal | | |
| Disagreement | | |
| Acceptance | | |

**Key response principles:**
- Listen fully before responding
- Acknowledge feelings
- Return to specific evidence
- Focus on future, not past
- Maintain respect throughout

### 5. Questions to Ask

**Prepare exploratory questions:**

"What questions will help make this a dialogue?"

**Understanding questions:**
- How do you feel about your performance this period?
- What are you most proud of?
- Where do you think you could improve?
- What support do you need?
- What obstacles have you faced?

**Development questions:**
- Where do you want to grow?
- What would help you be more successful?
- What feedback do you have for me?

### 6. Handling Disagreement

**Prepare for disagreement:**

"If they strongly disagree with the assessment, how will you handle it?"

**Disagreement protocol:**
1. Listen fully to their perspective
2. Acknowledge their view
3. Share specific evidence again
4. Look for common ground
5. Agree on facts, even if differ on interpretation
6. Document differing views if needed

**Non-negotiables:**
- What feedback must be delivered regardless of reaction?
- What ratings are firm?

### 7. Logistics Planning

**Plan logistics:**

| Element | Plan |
|---------|------|
| Location | Private, comfortable |
| Time | [when] |
| Duration | [how long] |
| Materials | Review doc, notes |
| Follow-up scheduled? | |
| Documentation approach | |

### 8. Update Output File

**Append to the Conversation Preparation section:**

```markdown
## 5. Conversation Preparation

### Conversation Structure
[Table from section 1]

### Opening
[Script from section 2]

### Difficult Feedback Delivery
[SBI examples from section 3]

### Anticipated Reactions
[Table from section 4]

### Key Questions
[List from section 5]

### Disagreement Protocol
[Summary from section 6]

### Logistics
[Table from section 7]

### Geneva's Conversation View
"[Perspective on effective delivery]"
```

Update frontmatter: Add `step-05-conversation-prep` to stepsCompleted

### 9. Present Summary

**Present to user:**
"Here's the conversation preparation summary:

**Conversation Flow:**
- Total time: [X minutes]
- Key phases: [list]

**Difficult Feedback to Deliver:**
1. [feedback + approach]
2. [feedback + approach]

**Most Likely Reaction:** [reaction]
- Response strategy: [approach]

**Key Questions to Ask:**
1. [question]
2. [question]

**Logistics:**
- When: [time]
- Where: [location]

**Geneva's View:**
[Brief conversation perspective]"

### 10. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Prep [C] Continue to Review Document"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-06-review-document.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Conversation structure planned
- Opening prepared
- Difficult feedback delivery prepared
- Reactions anticipated
- Questions prepared
- Disagreement protocol ready
- Logistics planned
- Output file updated

### SYSTEM FAILURE:
- No difficult feedback preparation
- Ignoring potential reactions
- No questions planned
- Not updating output file
