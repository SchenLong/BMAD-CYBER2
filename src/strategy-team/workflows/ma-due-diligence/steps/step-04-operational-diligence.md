---
name: step-04-operational-diligence
description: Analyze operations, technology, talent, and culture

outputFile: '{output_folder}/decisions/ma-due-diligence-{target}.md'
nextStepFile: './step-05-risk-identification.md'
previousStepFile: './step-03-financial-assessment.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 4: Operational Due Diligence

## STEP GOAL:

Conduct thorough operational due diligence covering operations, technology, talent, and culture to assess integration complexity and identify operational value creation opportunities.

### Role Reinforcement:

- You are a Senior M&A Advisor with Lee (Technocrat) providing operational expertise
- Focus on operational realities and integration feasibility
- Challenge rosy operational assumptions
- Identify both opportunities and landmines

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on operational substance, not just financials
- FORBIDDEN to skip culture assessment
- Probe for operational dependencies and risks
- Document integration complexity honestly

---

## Sequence of Instructions:

### 1. Operations Assessment

**Invoke Lee (Technocrat) perspective:**

"Let me bring in Lee's operational lens to assess the target's operations..."

**Evaluate operational dimensions:**

| Dimension | Target State | Gap vs. Acquirer | Integration Complexity |
|-----------|--------------|------------------|------------------------|
| Manufacturing/Delivery | | | Low/Med/High |
| Supply chain | | | |
| Quality systems | | | |
| Facilities | | | |
| Processes/SOPs | | | |
| Regulatory compliance | | | |

### 2. Technology Assessment

**Evaluate technology stack:**

"Let's assess the technology landscape:"

**Core technology:**
- What technology/IP is driving value?
- How differentiated is it?
- What's the technical debt situation?
- Is the technology scalable?

**IT infrastructure:**
- What systems are in use (ERP, CRM, etc.)?
- How compatible with acquirer systems?
- What's the cybersecurity posture?
- Data management and privacy compliance?

**Integration considerations:**
- System integration complexity
- Data migration requirements
- Technology redundancies
- Investment needs

### 3. Talent Assessment

**Evaluate human capital:**

"Let's assess the talent situation:"

**Key personnel:**
- Who are the critical employees?
- What retention risks exist?
- Are there key person dependencies?
- What's the leadership quality?

**Workforce analysis:**
- Total headcount by function
- Compensation comparison
- Talent gaps or surpluses
- Union or employment issues

**Retention strategy:**
- Who must be retained?
- What retention mechanisms needed?
- Expected voluntary attrition?

### 4. Culture Assessment

**Invoke Geneva (Stakeholder Mediator) perspective:**

"Let me bring in Geneva's perspective on culture and people..."

**Evaluate cultural fit:**

| Dimension | Target Culture | Acquirer Culture | Compatibility |
|-----------|---------------|------------------|---------------|
| Decision-making style | | | High/Med/Low |
| Risk tolerance | | | |
| Communication style | | | |
| Work pace/intensity | | | |
| Values emphasis | | | |
| Management approach | | | |

**Culture integration considerations:**
- Degree of integration needed
- Culture clash risks
- Change management requirements
- Communication needs

### 5. Customer & Revenue Quality

**Assess customer base:**

"Let's examine customer and revenue quality:"

- Customer concentration (top 10 % of revenue)
- Customer churn history
- Contract terms and renewals
- Customer satisfaction metrics
- At-risk relationships

**Revenue quality:**
- Recurring vs. one-time revenue
- Revenue recognition practices
- Pipeline health
- Cross-sell opportunities

### 6. Integration Complexity Assessment

**Summarize integration complexity:**

"Let's assess overall integration complexity:"

| Area | Complexity | Key Challenges | Investment Needed |
|------|------------|----------------|-------------------|
| Operations | Low/Med/High | | |
| Technology | | | |
| People | | | |
| Culture | | | |
| Customers | | | |

**Overall integration complexity:** [Low/Medium/High/Very High]

### 7. Update Output File

**Append to the Operational Diligence section:**

```markdown
## 4. Operational Due Diligence

### Operations Assessment
[Table and findings from section 1]

### Technology Assessment
[Findings from section 2]

### Talent Assessment
**Critical Employees:** [list]
**Retention Risk:** [assessment]
**Workforce Considerations:** [summary]

### Culture Assessment
[Table and analysis from section 4]

### Customer & Revenue Quality
[Findings from section 5]

### Integration Complexity
**Overall Complexity:** [rating]
[Table from section 6]

### Lee's Operational View
[Key observations]

### Geneva's Culture View
[Key observations]
```

Update frontmatter: Add `step-04-operational-diligence` to stepsCompleted

### 8. Present Summary

**Present to user:**
"Here's the operational diligence summary:

**Overall Operational Health:** [Strong/Adequate/Concerning]

**Technology Position:**
- Strengths: [list]
- Concerns: [list]

**Talent Situation:**
- Critical retention: [count] people
- Risk level: [assessment]

**Culture Fit:** [Strong/Moderate/Challenging]

**Integration Complexity:** [rating]

**Key Operational Risks:**
- [top 3 risks]

**Lee's View:** [brief]
**Geneva's View:** [brief]"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Analysis [C] Continue to Risk Identification"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-05-risk-identification.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Operations thoroughly assessed
- Technology evaluated
- Talent and retention analyzed
- Culture fit assessed
- Integration complexity quantified
- Output file updated

### SYSTEM FAILURE:
- Skipping culture assessment
- Not identifying key people
- Ignoring integration complexity
- Not updating output file
