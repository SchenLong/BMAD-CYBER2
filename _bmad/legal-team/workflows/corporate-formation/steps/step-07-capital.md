---
name: step-07-capital
description: Define shareholding and capital structure
workflow_path: '{project-root}/_bmad-output/bmb-creations/legal-team/workflows/corporate-formation'
nextStepFile: '{workflow_path}/steps/step-08-compliance.md'
---

# Step 7: Capital & Ownership Structure

## STEP GOAL

Define the capital structure, ownership percentages, and share/membership classes.

## EXECUTION SEQUENCE

### 1. Capital Requirements

**Minimum Capital by Entity:**

| Jurisdiction | Entity | Minimum | Notes |
|--------------|--------|---------|-------|
| USA (any) | LLC | $0 | No minimum required |
| USA (any) | Corporation | $0 | Nominal shares typical |
| Spain | SL | €3,000 | Must be fully subscribed |
| Spain | SA | €60,000 | 25% at formation |
| Estonia | OÜ | €2,500 | Can be deferred |
| Estonia | AS | €25,000 | Required at formation |

### 2. Ownership Structure Design

Gather ownership details:

**For Each Owner:**
- Name and legal status (individual/entity)
- Ownership percentage
- Capital contribution amount
- Contribution type (cash, property, services)
- Voting vs. economic rights
- Vesting or restrictions (if any)

### 3. Share/Membership Class Analysis

**Single Class Structure:**
- Simplest approach
- Equal rights per share/unit
- Suitable for most SMEs

**Multi-Class Structure:**
Consider if:
- Different investment amounts with different rights
- Founder vs. investor shares
- Voting control concentration needed
- Dividend preferences required

**Example Multi-Class:**
- Class A: Full voting, standard dividends
- Class B: Limited/no voting, same dividends
- Preferred: Liquidation preference, dividend priority

### 4. Capital Contribution Timeline

Plan contribution schedule:
- Initial capital at formation
- Additional contributions (if planned)
- Capital call provisions
- Consequences of non-contribution

### 5. Update Output

```markdown
## 7. Capital & Ownership Structure

### Authorized Capital
**Total Authorized:** [Amount/Shares]
**Initial Subscribed:** [Amount/Shares]
**Par Value:** [If applicable]

### Ownership Allocation
| Owner | Percentage | Shares/Units | Contribution | Class |
|-------|------------|--------------|--------------|-------|
| [Name] | [%] | [Number] | [Amount] | [Class] |
...

### Capital Contributions
**Initial Contribution:** [Total amount]
**Contribution Schedule:**
- At formation: [Amount]
- [Future date]: [Amount] (if applicable)

### Share/Membership Classes
**Class Structure:** [Single/Multi]
[Description of classes if multi-class]

### Special Rights or Restrictions
[Any vesting, transfer restrictions, preemptive rights, etc.]
```

Update: `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`

### 6. Menu

**[C]** Continue to compliance | **[R]** Revise structure | **[Q]** Questions
