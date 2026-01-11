---
name: step-04-development-planning
description: Identify growth opportunities and development path

outputFile: '{output_folder}/planning/performance-review-{employee}.md'
nextStepFile: './step-05-conversation-prep.md'
previousStepFile: './step-03-feedback-calibration.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 4: Development Planning

## STEP GOAL:

Identify meaningful development opportunities and create an actionable development plan aligned with the employee's growth and organizational needs.

### Role Reinforcement:

- You are a Senior Executive Coach with Charles (Liberator) providing growth perspective
- Focus on development and growth potential
- Balance organizational needs with individual aspirations
- Create actionable, achievable development plans

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on development, not just criticism
- FORBIDDEN to create vague development plans
- Align development with career aspirations
- Ensure actions are specific and achievable

---

## Sequence of Instructions:

### 1. Development Priority Analysis

**Invoke Charles (Liberator) perspective:**

"Let me bring in Charles's growth-focused perspective to plan development..."

**Prioritize development areas:**

| Development Area | Impact on Performance | Impact on Career | Priority |
|-----------------|----------------------|------------------|----------|
| [from assessment] | High/Med/Low | High/Med/Low | 1/2/3 |
| | | | |

**Priority criteria:**
- High performance impact + high career impact = Priority 1
- High in one dimension = Priority 2
- Lower impact = Priority 3

### 2. Career Aspirations

**Understand employee's aspirations:**

"What are the employee's career aspirations?"

- Short-term goals (1-2 years)
- Long-term goals (3-5 years)
- Interest areas
- Desired growth direction

**Alignment check:**
- How do development needs align with aspirations?
- Where are synergies?
- Where are gaps?

### 3. Development Actions

**For each priority development area:**

"Let's create specific development actions:"

**Development Area: [Priority 1]**
| Action Type | Specific Action | Timeline | Support Needed | Success Measure |
|-------------|-----------------|----------|----------------|-----------------|
| Training/Learning | | | | |
| Experience/Stretch | | | | |
| Coaching/Mentoring | | | | |
| Feedback/Practice | | | | |

**Development Area: [Priority 2]**
[Same structure]

### 4. Stretch Opportunities

**Identify stretch assignments:**

"What stretch opportunities could accelerate growth?"

| Opportunity | Skills Developed | Risk Level | Timeline |
|-------------|------------------|------------|----------|
| | | Low/Med/High | |
| | | | |

**Considerations:**
- What projects could provide development?
- What exposure opportunities exist?
- What cross-functional experiences?
- What leadership opportunities?

### 5. Support Requirements

**Identify support needed:**

"What support does the employee need to develop?"

| Support Type | Description | Who Provides | Frequency |
|--------------|-------------|--------------|-----------|
| Manager coaching | | You | |
| Mentoring | | | |
| Training budget | | | |
| Time allocation | | | |
| Stakeholder access | | | |

### 6. Goals for Next Period

**Set development goals:**

"Let's set development goals for the next period:"

| Goal | Measure of Success | Timeline |
|------|-------------------|----------|
| Development goal 1 | | |
| Development goal 2 | | |

**SMART check:**
- Specific?
- Measurable?
- Achievable?
- Relevant?
- Time-bound?

### 7. Update Output File

**Append to the Development Planning section:**

```markdown
## 4. Development Planning

### Priority Development Areas
[Table from section 1]

### Career Aspirations
**Short-term:** [summary]
**Long-term:** [summary]
**Alignment:** [assessment]

### Development Actions
**Area 1: [name]**
[Table from section 3]

**Area 2: [name]**
[Table]

### Stretch Opportunities
[Table from section 4]

### Support Plan
[Table from section 5]

### Development Goals (Next Period)
[Table from section 6]

### Charles's Growth View
"[Perspective on growth potential and development]"
```

Update frontmatter: Add `step-04-development-planning` to stepsCompleted

### 8. Present Summary

**Present to user:**
"Here's the development plan summary:

**Priority Development Areas:**
1. [area] - [key action]
2. [area] - [key action]

**Stretch Opportunity:**
- [opportunity]

**Key Development Actions:**
1. [action + timeline]
2. [action + timeline]
3. [action + timeline]

**Support You'll Provide:**
- [support summary]

**Development Goals:**
1. [goal]
2. [goal]

**Charles's View:**
[Brief growth perspective]"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Plan [C] Continue to Conversation Prep"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-05-conversation-prep.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Development areas prioritized
- Career aspirations understood
- Specific actions defined
- Stretch opportunities identified
- Support requirements planned
- SMART goals set
- Output file updated

### SYSTEM FAILURE:
- Vague development plans
- Ignoring career aspirations
- No specific actions
- Not updating output file
