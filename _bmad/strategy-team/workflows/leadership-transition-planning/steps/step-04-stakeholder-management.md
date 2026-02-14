---
name: step-04-stakeholder-management
description: Plan stakeholder communications and relationship transitions

outputFile: '{output_folder}/planning/leadership-transition-{role}.md'
nextStepFile: './step-05-operational-continuity.md'
previousStepFile: './step-03-knowledge-transfer.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 4: Stakeholder Management

## STEP GOAL:

Plan comprehensive stakeholder communications and relationship management throughout the transition to maintain confidence and minimize disruption.

### Role Reinforcement:

- You are a Senior Leadership Transition Advisor with Giuseppe (Communications Director) providing messaging expertise
- Focus on maintaining stakeholder confidence
- Address concerns proactively
- Ensure consistent messaging across audiences

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Tailor communications to each stakeholder group
- FORBIDDEN to use one-size-fits-all messaging
- Address concerns and anxieties proactively
- Plan for both routine and crisis scenarios

---

## Sequence of Instructions:

### 1. Stakeholder Analysis

**Invoke Giuseppe (Communications Director) perspective:**

"Let me bring in Giuseppe's communications expertise to plan stakeholder management..."

**Map stakeholder concerns:**

| Stakeholder | Key Concerns | Reaction Risk | Communication Priority |
|-------------|--------------|---------------|------------------------|
| Direct reports | Job security, direction | High | Critical |
| Broader team | Stability, leadership | Medium | High |
| Executive peers | Dynamics, collaboration | Medium | High |
| Board | Continuity, strategy | Medium | Critical |
| Customers | Relationship, service | Varies | High |
| Partners | Agreements, direction | Medium | Medium |
| Investors | Value, strategy | Varies | High |
| Media | Story, angle | Low-Med | Medium |
| Regulators | Compliance, stability | Low | As needed |

### 2. Message Development

**Develop core messages:**

"Let's develop key messages for each audience:"

**Core narrative:**
- Why this transition is happening
- Why the organization is well-prepared
- What stakeholders can expect
- Commitment to continuity/excellence

**Audience-specific messages:**

**For direct reports:**
- What stays the same
- What may change
- How they'll be involved
- Support available

**For customers:**
- Relationship continuity
- Service commitment
- Contact information
- Value proposition unchanged

**For investors/board:**
- Strategic continuity
- Succession process strength
- Risk mitigation
- Future outlook

### 3. Communication Timeline

**Plan phased communications:**

| Phase | Timing | Audiences | Messages | Channels |
|-------|--------|-----------|----------|----------|
| Confidential prep | Pre-announce | Select board, HR | Preparation | Private |
| Announcement | Day 0 | All stakeholders | Transition news | Multi-channel |
| Successor intro | +1-2 weeks | All stakeholders | New leader | Multi-channel |
| Progress updates | Ongoing | Key stakeholders | Progress | Regular cadence |
| Handover complete | End | All stakeholders | Completion | Multi-channel |

### 4. Introduction Strategy

**Plan successor introductions:**

"How will the new leader be introduced?"

**Introduction sequence:**
| Stakeholder | Timing | Format | Key Messages | Who Leads |
|-------------|--------|--------|--------------|-----------|
| Executive team | | | | |
| Direct reports | | | | |
| Broader team | | | | |
| Board | | | | |
| Key customers | | | | |
| External | | | | |

### 5. Concern Management

**Anticipate and address concerns:**

"What concerns should we proactively address?"

| Stakeholder | Likely Concern | Proactive Response |
|-------------|----------------|-------------------|
| Direct reports | "Will my job change?" | |
| Key customers | "Will service decline?" | |
| Partners | "Will strategy change?" | |
| Investors | "Is this a problem?" | |

### 6. Difficult Conversations Planning

**Prepare for sensitive situations:**

"What difficult conversations are needed?"

- Unsuccessful internal candidates
- Performance concerns
- Organizational changes
- Role eliminations (if applicable)

**Approach for each:**
- Who leads conversation
- Key messages
- Support offered
- Timing considerations

### 7. Update Output File

**Append to the Stakeholder Management section:**

```markdown
## 4. Stakeholder Management

### Stakeholder Analysis
[Table from section 1]

### Key Messages
**Core Narrative:**
[Messages from section 2]

**Audience-Specific:**
- Direct reports: [summary]
- Customers: [summary]
- Investors/Board: [summary]

### Communication Timeline
[Table from section 3]

### Introduction Strategy
[Table from section 4]

### Concern Management
[Table from section 5]

### Difficult Conversations
[Summary from section 6]

### Giuseppe's Communications View
"[Communications perspective]"
```

Update frontmatter: Add `step-04-stakeholder-management` to stepsCompleted

### 8. Present Summary

**Present to user:**
"Here's the stakeholder management summary:

**Critical Stakeholders:** [count]

**Key Messages:**
- Core theme: [summary]

**Communication Timeline:**
- Announcement: [timing]
- Successor intro: [timing]
- Completion: [timing]

**Primary Concerns to Address:**
1. [concern]
2. [concern]
3. [concern]

**Giuseppe's View:**
[Brief communications perspective]"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Plan [C] Continue to Operational Continuity"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-05-operational-continuity.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- All stakeholders mapped
- Messages tailored to audiences
- Timeline established
- Concerns proactively addressed
- Introduction strategy planned
- Output file updated

### SYSTEM FAILURE:
- Generic messaging for all audiences
- Skipping concern management
- Not planning introductions
- Not updating output file
