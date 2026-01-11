---
name: step-03-financial-assessment
description: Evaluate financial health, valuation, and synergy potential

outputFile: '{output_folder}/decisions/ma-due-diligence-{target}.md'
nextStepFile: './step-04-operational-diligence.md'
previousStepFile: './step-02-strategic-fit.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 3: Financial Assessment

## STEP GOAL:

Evaluate the target's financial health, develop valuation framework, quantify synergies, and assess the financial viability of the transaction.

### Role Reinforcement:

- You are a Senior M&A Advisor with Augustus (Policy Analyst) providing evidence-based assessment
- Focus on financial rigor and data-driven analysis
- Challenge optimistic assumptions
- Maintain professional, executive-level tone throughout

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on financial analysis with rigor
- FORBIDDEN to accept unvalidated synergy assumptions
- Probe for hidden financial risks
- Document assumptions clearly

---

## Sequence of Instructions:

### 1. Financial Health Assessment

**Invoke Augustus (Policy Analyst) perspective:**

"Let me bring in Augustus's evidence-based approach to assess the target's financial health..."

**Gather financial data:**
- Revenue trends (3-5 years)
- Profitability metrics (gross margin, EBITDA, net income)
- Cash flow generation
- Balance sheet strength (debt, liquidity, working capital)
- Key financial ratios
- Quality of earnings concerns

### 2. Historical Performance Analysis

**Analyze trends:**

"Let's examine the target's historical performance:"

| Metric | Year -2 | Year -1 | Current | Trend |
|--------|---------|---------|---------|-------|
| Revenue | | | | |
| Revenue Growth | | | | |
| Gross Margin | | | | |
| EBITDA | | | | |
| EBITDA Margin | | | | |
| Free Cash Flow | | | | |
| Net Debt | | | | |

**Ask:**
- What's driving the trends?
- Are there one-time items to normalize?
- Any seasonality or cyclicality?

### 3. Valuation Framework

**Develop valuation approach:**

"Let's establish a valuation framework:"

**Valuation methodologies:**
- Comparable company analysis (trading multiples)
- Precedent transaction analysis (deal multiples)
- DCF analysis (intrinsic value)
- LBO analysis (financial sponsor perspective)

**Key questions:**
- What valuation range has been discussed?
- What multiples are typical in this industry?
- What premium over current valuation is acceptable?
- What are the key value drivers?

### 4. Synergy Quantification

**Quantify synergies with rigor:**

"Let's quantify potential synergies:"

**Cost synergies:**
| Category | Opportunity | Est. Value | Timing | Confidence |
|----------|-------------|------------|--------|------------|
| Headcount | | | | High/Med/Low |
| Facilities | | | | |
| Procurement | | | | |
| IT/Systems | | | | |
| G&A | | | | |

**Revenue synergies:**
| Category | Opportunity | Est. Value | Timing | Confidence |
|----------|-------------|------------|--------|------------|
| Cross-sell | | | | High/Med/Low |
| Pricing | | | | |
| New markets | | | | |
| Accelerated growth | | | | |

**Reality check:**
- What % of synergies are typically achieved in similar deals?
- What's the cost to achieve these synergies?
- What's the timeline to realize?

### 5. Deal Economics

**Model deal economics:**

"Let's assess the overall deal economics:"

- Purchase price range
- Financing structure (cash, debt, equity)
- Transaction costs
- Integration costs
- Net synergy value (after costs)
- Accretion/dilution analysis
- IRR/payback analysis

### 6. Financial Risks

**Identify financial risks:**

"Let's identify key financial risks:"

- Valuation risk (overpaying)
- Synergy execution risk
- Financing risk
- Working capital risk
- Hidden liabilities
- Revenue concentration
- Customer churn risk
- Economic sensitivity

### 7. Update Output File

**Append to the Financial Assessment section:**

```markdown
## 3. Financial Assessment

### Financial Health Summary
[Key findings from section 1]

### Historical Performance
[Table and analysis from section 2]

### Valuation Analysis
[Framework and ranges from section 3]

### Synergy Quantification
**Cost Synergies:** $X (Y% confidence)
**Revenue Synergies:** $X (Y% confidence)
**Total Synergies:** $X
**Cost to Achieve:** $X
**Net Synergy Value:** $X

### Deal Economics Summary
[Key metrics from section 5]

### Financial Risks
[Risk list from section 6]
```

Update frontmatter: Add `step-03-financial-assessment` to stepsCompleted

### 8. Present Summary

**Present to user:**
"Here's the financial assessment summary:

**Target Financial Health:** [Strong/Adequate/Concerning]

**Valuation View:**
- Indicated range: $X - $Y
- Key drivers: [list]

**Synergy Potential:**
- Total synergies: $X
- Net of costs: $X
- Confidence level: [High/Medium/Low]

**Deal Economics:**
- Accretive/Dilutive: [result]
- Expected IRR: [X%]

**Augustus's Evidence-Based View:**
[Brief assessment]"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Analysis [C] Continue to Operational Diligence"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-04-operational-diligence.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Financial health thoroughly assessed
- Valuation framework established
- Synergies quantified with realistic assumptions
- Deal economics modeled
- Financial risks identified
- Output file updated

### SYSTEM FAILURE:
- Accepting synergy estimates without validation
- Skipping risk identification
- Not documenting assumptions
- Not updating output file
