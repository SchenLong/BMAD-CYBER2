---
name: step-07-stakeholder-comms
description: Plan communications strategy for all stakeholder groups

outputFile: '{output_folder}/decisions/ma-due-diligence-{target}.md'
nextStepFile: './step-08-deal-recommendation.md'
previousStepFile: './step-06-integration-planning.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 7: Stakeholder & Communication Strategy

## STEP GOAL:

Develop comprehensive communications strategy for all stakeholder groups throughout the deal lifecycle - announcement, close, and integration phases.

### Role Reinforcement:

- You are a Senior M&A Advisor with Giuseppe (Communications Director) providing messaging expertise
- Focus on clear, consistent messaging across all audiences
- Address concerns proactively
- Plan for difficult questions and scenarios

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Tailor messaging to each stakeholder group
- FORBIDDEN to use generic communications
- Address employee concerns prominently
- Plan for both positive and negative scenarios

---

## Sequence of Instructions:

### 1. Stakeholder Mapping

**Map all stakeholders:**

"Let's map all stakeholders and their concerns:"

| Stakeholder | Key Concerns | Priority | Communication Approach |
|-------------|--------------|----------|------------------------|
| Target employees | Job security, culture | Critical | |
| Acquirer employees | Integration impact | High | |
| Customers | Service continuity | Critical | |
| Suppliers | Contract continuity | Medium | |
| Investors/Board | Value creation | High | |
| Regulators | Compliance | High | |
| Media | Story angle | Medium | |
| Community | Impact | Low-Med | |

### 2. Key Messages Development

**Invoke Giuseppe (Communications Director) perspective:**

"Let me bring in Giuseppe's communications expertise to develop key messages..."

**Core narrative:**
- Why this deal makes sense
- What it means for stakeholders
- Vision for the combined entity
- Commitment to key stakeholders

**Audience-specific messages:**

**For employees:**
- Job security message
- Career opportunity message
- Culture message
- Timeline clarity

**For customers:**
- Service continuity
- Value enhancement
- Relationship commitment
- Support contacts

**For investors:**
- Strategic rationale
- Value creation thesis
- Synergy commitments
- Timeline and milestones

### 3. Communication Timeline

**Plan phased communications:**

"Let's plan the communication timeline:"

| Phase | Timing | Key Communications |
|-------|--------|-------------------|
| Pre-announcement | Before leak/announce | Board prep, select notifications |
| Announcement | Day 0 | Press release, all-hands, customer letters |
| Sign-to-close | Interim period | Regular updates, FAQs, Q&A |
| Close | Day 1 | Celebration, next steps, detailed plans |
| Integration | Ongoing | Progress updates, milestone comms |

### 4. Channel Strategy

**Design channel mix:**

"Let's plan communication channels:"

| Audience | Primary Channel | Secondary | Frequency |
|----------|----------------|-----------|-----------|
| Executive team | In-person | Email | As needed |
| Managers | Town hall | Cascade briefings | Weekly |
| All employees | All-hands | Email/Intranet | Bi-weekly |
| Key customers | Personal call | Letter | As milestones |
| All customers | Email | Website | At announce/close |
| Investors | Earnings call | SEC filings | Per regulations |
| Media | Press release | Interviews | At milestones |

### 5. FAQ Development

**Prepare for difficult questions:**

"Let's prepare FAQ responses:"

**Employee FAQs:**
- Will there be layoffs?
- What happens to my role?
- How will compensation/benefits change?
- Who will I report to?
- What about our culture?

**Customer FAQs:**
- Will pricing change?
- Will my contacts change?
- Will service be disrupted?
- What are the benefits to me?

**Investor FAQs:**
- What are the synergies?
- What's the integration timeline?
- What are the risks?
- What's the accretion impact?

### 6. Scenario Planning

**Prepare for contingencies:**

"Let's prepare for challenging scenarios:"

| Scenario | Response Strategy | Spokesperson |
|----------|-------------------|--------------|
| Negative media coverage | [approach] | |
| Employee protest/concerns | [approach] | |
| Customer defection threat | [approach] | |
| Regulatory challenge | [approach] | |
| Integration problem | [approach] | |
| Key talent departure | [approach] | |

### 7. Spokesperson Preparation

**Identify and prepare spokespeople:**

"Let's prepare spokespeople:"

- Primary spokesperson: [who]
- Secondary spokespeople: [who]
- Subject matter experts: [who for what topics]

**Key talking points:**
1. [point]
2. [point]
3. [point]

**Messages to avoid:**
- [what not to say]

### 8. Update Output File

**Append to the Communications Strategy section:**

```markdown
## 7. Stakeholder & Communication Strategy

### Stakeholder Map
[Table from section 1]

### Core Narrative
[Messages from section 2]

### Audience-Specific Messages
**Employees:** [summary]
**Customers:** [summary]
**Investors:** [summary]

### Communication Timeline
[Table from section 3]

### Channel Strategy
[Table from section 4]

### Key FAQs
[Summary from section 5]

### Scenario Response Plans
[Table from section 6]

### Spokesperson Plan
[Details from section 7]

### Giuseppe's Communications View
"[Communications perspective]"
```

Update frontmatter: Add `step-07-stakeholder-comms` to stepsCompleted

### 9. Present Summary

**Present to user:**
"Here's the communications strategy summary:

**Core Narrative:**
[1-2 sentence summary]

**Critical Stakeholder Actions:**
1. [stakeholder + action]
2. [stakeholder + action]
3. [stakeholder + action]

**Communication Timeline:**
- Announcement: [date/timing]
- Close communications: [date/timing]
- Integration cadence: [frequency]

**Key Risk Scenarios Prepared:**
[List top 3]

**Giuseppe's View:**
[Brief communications perspective]"

### 10. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Analysis [C] Continue to Deal Recommendation"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-08-deal-recommendation.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- All stakeholders mapped
- Key messages developed for each audience
- Timeline and channels planned
- FAQs prepared
- Contingency scenarios addressed
- Output file updated

### SYSTEM FAILURE:
- Generic one-size-fits-all messaging
- Skipping employee communications
- Not preparing for difficult questions
- Not updating output file
