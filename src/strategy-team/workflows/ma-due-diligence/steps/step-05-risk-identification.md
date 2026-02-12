---
name: step-05-risk-identification
description: Comprehensive risk assessment across all dimensions

outputFile: '{output_folder}/decisions/ma-due-diligence-{target}.md'
nextStepFile: './step-06-integration-planning.md'
previousStepFile: './step-04-operational-diligence.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 5: Risk Identification

## STEP GOAL

Conduct comprehensive risk identification across all dimensions - deal risks, integration risks, market risks, and legal/regulatory risks - to ensure informed decision-making.

### Role Reinforcement

- You are a Senior M&A Advisor with Burke (Conservative) providing risk-focused perspective
- Focus on identifying all material risks
- Challenge optimism bias
- Document both likelihood and impact

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules

- Be thorough - err on side of identifying too many risks
- FORBIDDEN to downplay or dismiss risks
- Quantify likelihood and impact where possible
- Identify mitigation strategies for each risk

---

## Sequence of Instructions

### 1. Deal Risk Assessment

**Invoke Burke (Conservative) perspective:**

"Let me bring in Burke's risk-focused perspective to systematically identify deal risks..."

**Transaction risks:**

- Valuation risk (overpaying)
- Due diligence gaps
- Financing risk
- Closing risk
- Regulatory/antitrust risk
- Competing bidder risk

**For each risk, assess:**

- Likelihood (Low/Medium/High)
- Impact (Low/Medium/High)
- Mitigation approach

### 2. Integration Risk Assessment

**Integration execution risks:**

"Let's identify integration-specific risks:"

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Integration delays | | | |
| Culture clash | | | |
| Key talent loss | | | |
| Customer defection | | | |
| Systems integration failure | | | |
| Synergy shortfall | | | |
| Distraction from core business | | | |
| Communication failure | | | |

### 3. Strategic & Market Risks

**External risks:**

"Let's assess strategic and market risks:"

- Market disruption risk
- Competitive response risk
- Technology obsolescence
- Customer concentration risk
- Supplier dependency risk
- Economic/cycle risk
- Regulatory change risk
- Geopolitical risk (if applicable)

### 4. Legal & Regulatory Risks

**Legal due diligence risks:**

"Let's identify legal and regulatory risks:"

- Pending litigation
- Regulatory compliance issues
- Environmental liabilities
- Intellectual property risks
- Contract risks (change of control clauses)
- Employment law issues
- Tax risks
- Data privacy/GDPR risks

### 5. Financial Risks

**Financial exposure risks:**

"Let's summarize financial risks:"

- Working capital risk
- Hidden liabilities
- Off-balance sheet items
- Revenue recognition issues
- Quality of earnings concerns
- Debt covenant issues
- Pension/benefit obligations
- Currency exposure

### 6. Risk Prioritization Matrix

**Consolidate and prioritize:**

"Let's prioritize all identified risks:"

**Critical Risks (High likelihood x High impact):**

1. [Risk + mitigation]
2. [Risk + mitigation]
3. [Risk + mitigation]

**Major Risks (High likelihood x Medium impact OR Medium x High):**

1. [Risk + mitigation]
2. [Risk + mitigation]

**Moderate Risks (Medium x Medium):**

1. [Risk + mitigation]
2. [Risk + mitigation]

**Watch List (Low likelihood but High impact):**

1. [Risk + trigger to watch]
2. [Risk + trigger to watch]

### 7. Deal Breaker Assessment

**Identify potential deal breakers:**

"Are there any risks that could be deal breakers?"

- What would make you walk away?
- What conditions must be resolved before closing?
- What representations/warranties are essential?
- What indemnities are required?

### 8. Update Output File

**Append to the Risk Assessment section:**

```markdown
## 5. Risk Assessment

### Deal Risks
[Table from section 1]

### Integration Risks
[Table from section 2]

### Strategic & Market Risks
[List from section 3]

### Legal & Regulatory Risks
[List from section 4]

### Financial Risks
[List from section 5]

### Risk Priority Matrix
**Critical Risks:**
[List with mitigations]

**Major Risks:**
[List with mitigations]

**Moderate Risks:**
[List]

**Watch List:**
[List]

### Deal Breaker Assessment
[Findings from section 7]

### Burke's Risk View
"[Conservative perspective summary]"
```

Update frontmatter: Add `step-05-risk-identification` to stepsCompleted

### 9. Present Summary

**Present to user:**
"Here's the risk assessment summary:

**Critical Risks:** [count]
[List top 3]

**Major Risks:** [count]
[List top 3]

**Potential Deal Breakers:**
[List any identified]

**Overall Risk Profile:** [Low/Moderate/High/Very High]

**Burke's View:**
[Risk-focused summary]

**Key Mitigation Actions Required:**

1. [action]
2. [action]
3. [action]"

### 10. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Analysis [C] Continue to Integration Planning"

#### Menu Handling Logic

- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-06-integration-planning.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- All risk categories assessed
- Risks prioritized by likelihood and impact
- Mitigation strategies identified
- Deal breakers explicitly addressed
- Output file updated

### SYSTEM FAILURE

- Missing major risk categories
- Not quantifying likelihood/impact
- Skipping deal breaker assessment
- Not updating output file
