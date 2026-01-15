---
name: step-04-entity
description: Review optimal entity structure options
workflow_path: '{project-root}/_bmad/legal-team/workflows/tax-planning'
nextStepFile: '{workflow_path}/steps/step-05-income.md'
---

# Step 4: Entity Structure Review

## STEP GOAL

Evaluate current entity structure and identify optimization opportunities.

## EXECUTION SEQUENCE

### 1. Current Structure Assessment

Analyze existing setup:

**Strengths:**
- What's working well?
- Tax-efficient elements?
- Operational efficiency?

**Weaknesses:**
- Excess tax leakage?
- Unnecessary complexity?
- Compliance burden?
- Missing opportunities?

### 2. Entity Selection Analysis

Compare entity options for primary operations:

**USA Options:**
| Entity | Tax Treatment | Best For | Considerations |
|--------|---------------|----------|----------------|
| C-Corp | Entity-level 21% | VC funding, IPO | Double tax on dividends |
| S-Corp | Pass-through | Owner salary optimization | Strict requirements |
| LLC (default) | Pass-through | Flexibility | SE tax on profits |
| LLC (C-Corp elect) | Entity-level | Best of both | Election formalities |

**Spain Options:**
| Entity | Rate | Best For | Considerations |
|--------|------|----------|----------------|
| SL | 25% (15% new) | Most businesses | Simple, flexible |
| SA | 25% | Larger companies | Higher capital requirement |
| Branch | N/A | Foreign parent | Tax on Spanish profits |
| ETVE | Participation exemption | Holdings | Substance requirements |

**Estonia Options:**
| Entity | Rate | Best For | Considerations |
|--------|------|----------|----------------|
| OÜ | 0%/20% | Reinvesting businesses | CFC rules for owners |
| AS | 0%/20% | Larger operations | Higher capital |

### 3. Structure Optimization Scenarios

Develop alternative structures:

**Scenario A: [Simple Structure]**
```
[Owner]
    |
[Operating Entity - Single Jurisdiction]
```
- Pros: Simplicity, low compliance
- Cons: May miss optimization opportunities
- Estimated tax impact: [Assessment]

**Scenario B: [Holding Structure]**
```
[Owner]
    |
[Holding Co - Tax-efficient jurisdiction]
    |
[Operating Entity - Primary market]
```
- Pros: Dividend efficiency, flexibility
- Cons: Complexity, substance needs
- Estimated tax impact: [Assessment]

**Scenario C: [Multi-Entity Structure]**
```
[Owner]
    |
[HoldCo]
   /    \
[OpCo1]  [OpCo2]
```
- Pros: Risk isolation, optimization
- Cons: Compliance cost, management
- Estimated tax impact: [Assessment]

### 4. Restructuring Considerations

If changes recommended:

**Tax-Free Options:**
- Reorganization provisions
- Contribution transactions
- Conversion elections

**Taxable Events:**
- Liquidation consequences
- Gain recognition
- Withholding requirements

**Practical Steps:**
- Implementation timeline
- Regulatory approvals
- Cost estimates

### 5. Update Output

```markdown
## 4. Entity Structure Analysis

### Current Structure Assessment
**Efficiency Rating:** [1-10]
**Key Issues:**
1. [Issue 1]
2. [Issue 2]

### Structure Options

#### Recommended: [Scenario X]
**Structure:** [Description]
**Estimated Tax Savings:** [Amount/Percentage]
**Implementation Complexity:** [Low/Medium/High]

**Rationale:**
1. [Reason 1]
2. [Reason 2]

#### Alternative: [Scenario Y]
**Structure:** [Description]
**Trade-offs:** [Description]

### Restructuring Path (if needed)
**Steps Required:**
1. [Step 1]
2. [Step 2]

**Tax Costs of Restructuring:** [Estimate]
**Timeline:** [Duration]
```

Update frontmatter: `entityStructure: "[recommended structure]"`
Update: `stepsCompleted: [1, 2, 3, 4]`

### 6. Menu

**[C]** Continue to income optimization | **[S]** Explore different structure | **[Q]** Questions
