---
name: step-07-gaps
description: Identify missing provisions and gaps
workflow_path: '{project-root}/_bmad/legal-team/workflows/contract-review'
nextStepFile: '{workflow_path}/steps/step-08-recommendations.md'
---

# Step 7: Gap Analysis

## STEP GOAL

Identify missing provisions that should be present given the contract type and context.

## EXECUTION SEQUENCE

### 1. Standard Provisions Check

For this contract type, verify presence of:
- Confidentiality provisions
- IP ownership/licensing
- Force majeure
- Assignment restrictions
- Amendment procedures
- Severability
- Entire agreement
- Notices provisions
- Waiver provisions

### 2. Risk-Based Gaps

Based on the transaction, assess if missing:
- Specific performance remedies
- Audit rights
- Most favored customer
- Non-compete/Non-solicit
- Data protection provisions
- Compliance certifications
- Escrow provisions
- Change management

### 3. Industry-Specific Gaps

Based on industry/sector, check for:
- Regulatory compliance provisions
- Industry standard terms
- Required disclosures
- Sector-specific protections

### 4. Update Output

```markdown
## 7. Gap Analysis

### Missing Standard Provisions
| Provision | Impact | Recommendation |
|-----------|--------|----------------|
[Table of missing provisions]

### Missing Risk-Mitigating Provisions
[List with recommendations]

### Industry-Specific Gaps
[List based on sector]

### Gap Priority Assessment
- **Critical:** [must add]
- **Important:** [should add]
- **Nice to Have:** [optional]
```

Update: `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`

### 5. Present Menu

**[C]** Continue | **[Q]** Questions
