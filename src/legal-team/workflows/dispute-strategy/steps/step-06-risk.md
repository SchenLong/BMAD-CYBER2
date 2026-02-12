---
name: step-06-risk
description: Comprehensive risk assessment
workflow_path: '{project-root}/_bmad/legal-team/workflows/dispute-strategy'
nextStepFile: '{workflow_path}/steps/step-07-options.md'
---

# Step 6: Risk Assessment

## STEP GOAL

Conduct comprehensive risk assessment including litigation costs, outcomes, and exposure.

## EXECUTION SEQUENCE

### 1. Outcome Probability Assessment

Evaluate likely outcomes:

**If Proceeding to Trial:**

| Outcome | Probability | Basis |
|---------|-------------|-------|
| Complete win | [%] | [Factors] |
| Partial win | [%] | [Factors] |
| Mixed result | [%] | [Factors] |
| Partial loss | [%] | [Factors] |
| Complete loss | [%] | [Factors] |

### 2. Financial Exposure Analysis

Calculate potential exposure:

**If Claimant:**

- Best case recovery: $[Amount]
- Likely recovery: $[Amount]
- Worst case (lose + costs): $[Amount]

**If Defendant:**

- Best case (complete defense): $[Defense costs only]
- Likely exposure: $[Amount]
- Worst case exposure: $[Amount + fees + interest]

**Costs to Litigate:**

| Phase | Estimated Cost |
|-------|----------------|
| Pre-litigation | $[Amount] |
| Pleadings | $[Amount] |
| Discovery | $[Amount] |
| Motions | $[Amount] |
| Trial preparation | $[Amount] |
| Trial | $[Amount] |
| Appeal (if needed) | $[Amount] |
| **Total Range** | **$[Low] - $[High]** |

### 3. Non-Financial Risks

Assess non-monetary considerations:

**Business Impact:**

- Distraction from operations
- Customer/Supplier relationships
- Competitive implications
- Regulatory attention

**Reputational Risk:**

- Publicity exposure
- Industry standing
- Personal reputation
- Social media impact

**Relationship Consequences:**

- Key relationships at stake
- Future business opportunities
- Industry network effects

### 4. Risk-Adjusted Value Analysis

Calculate risk-adjusted outcomes:

**Expected Value Calculation:**

```
EV = (P(Win) × Recovery) - (P(Lose) × Loss) - (Certain Costs)
```

**Break-Even Analysis:**

- Settlement equivalent value
- Point where litigation costs exceed benefit
- Time value considerations

### 5. Update Output

```markdown
## 6. Risk Assessment

### Outcome Probabilities
| Outcome | Probability | Financial Impact |
|---------|-------------|------------------|
| [Outcome] | [%] | $[Amount] |
...

### Financial Exposure Summary
**Best Case:** $[Amount]
**Most Likely:** $[Amount]
**Worst Case:** $[Amount]

### Litigation Cost Estimate
**Total Estimated Range:** $[Low] - $[High]
**Timeline:** [Estimated duration]

### Non-Financial Risks
**Business Impact:** [High/Medium/Low]
**Reputational Risk:** [High/Medium/Low]
**Relationship Risk:** [High/Medium/Low]

### Risk-Adjusted Analysis
**Expected Value:** $[Calculated]
**Settlement Equivalent:** $[Range]
**Risk Assessment:** [Overall characterization]

### Key Risk Factors
1. [Risk factor 1]
2. [Risk factor 2]
3. [Risk factor 3]
```

Update frontmatter: `riskAssessment: "[summary]"`
Update: `stepsCompleted: [1, 2, 3, 4, 5, 6]`

### 6. Menu

**[C]** Continue to resolution options | **[R]** Revise risk factors | **[Q]** Questions
