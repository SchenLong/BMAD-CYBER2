---
name: step-04-urgency
description: Assess urgency level and timeline considerations
workflow_path: '{project-root}/_bmad/legal-team/workflows/legal-matter-intake'
nextStepFile: '{workflow_path}/steps/step-05-parties.md'
---

# Step 4: Urgency Assessment

## STEP GOAL

Evaluate the urgency of the matter and identify any critical deadlines or time-sensitive considerations.

## EXECUTION RULES

- Identify ALL potential deadlines
- Consider statutory limitations
- Flag court/regulatory deadlines
- Assess business urgency vs legal urgency
- ALWAYS communicate in `{communication_language}`

## URGENCY FACTORS

### Immediate (Days)
- Court filing deadlines
- Response deadlines
- Regulatory submissions
- Contract execution deadlines
- Statute of limitations expiring

### Near-term (Weeks)
- Negotiation timelines
- Transaction closing dates
- Registration deadlines
- Compliance deadlines

### Planning (Months+)
- Strategic planning
- Entity structuring
- Tax planning
- General advisory

## EXECUTION SEQUENCE

### 1. Timeline Discovery

"Let's understand the timing of your matter. Are there any deadlines I should know about?"

Explore:
- Known deadlines (contractual, court, regulatory)
- Statute of limitations concerns
- Business timeline pressures
- Counterparty expectations

### 2. Urgency Classification

Classify the matter:

**IMMEDIATE** - Action needed within days
- Court/regulatory deadlines
- Expiring limitations periods
- Emergency situations

**NEAR-TERM** - Action needed within weeks
- Active negotiations
- Upcoming transactions
- Compliance deadlines

**PLANNING** - No immediate deadline
- Strategic matters
- General advisory
- Preventive planning

### 3. Deadline Mapping

Create a timeline of relevant dates:
- Statutory deadlines
- Contractual deadlines
- Court/regulatory deadlines
- Business milestones

### 4. Update Matter Brief

Append to output file:

```markdown
## 4. Urgency Assessment

**Urgency Level:** [IMMEDIATE / NEAR-TERM / PLANNING]
**Key Deadlines:**
- [Date]: [Deadline description]
- [Date]: [Deadline description]

**Statute of Limitations:** [Status/Concerns]
**Business Timeline:** [User's timeline expectations]
**Priority Factors:** [What makes this urgent]
```

Update frontmatter: `stepsCompleted: [1, 2, 3, 4]`

### 5. Present Menu

**Select an Option:**
- **[C]** Continue to party analysis
- **[D]** Discuss timeline further
- **[Q]** Questions about deadlines

#### Menu Handling:
- IF C: Update frontmatter, load and execute `{nextStepFile}`
- IF D: Explore timing issues, then redisplay menu
- IF Q: Answer questions, then redisplay menu
