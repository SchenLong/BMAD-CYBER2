---
name: step-08-compliance
description: Map ongoing compliance requirements
workflow_path: '{project-root}/_bmad-output/bmb-creations/legal-team/workflows/tax-planning'
nextStepFile: '{workflow_path}/steps/step-09-risk.md'
---

# Step 8: Compliance Mapping

## STEP GOAL

Document all tax compliance obligations and establish compliance calendar.

## EXECUTION SEQUENCE

### 1. Federal/National Compliance

Map primary tax obligations:

**USA Federal:**
| Form | Description | Due Date | Frequency |
|------|-------------|----------|-----------|
| Form 1040 | Individual return | April 15 | Annual |
| Form 1120 | C-Corp return | 15th of 4th month | Annual |
| Form 1120-S | S-Corp return | March 15 | Annual |
| Form 1065 | Partnership return | March 15 | Annual |
| Form 941 | Employment taxes | End of month after quarter | Quarterly |
| Form 720 | Excise taxes | End of month after quarter | Quarterly |

**Spain (Agencia Tributaria):**
| Modelo | Description | Due Date | Frequency |
|--------|-------------|----------|-----------|
| Modelo 200 | Corporate tax return | July 25 | Annual |
| Modelo 202 | Corporate tax installments | Apr 20, Oct 20, Dec 20 | 3x Year |
| Modelo 303 | VAT return | Monthly 20th or quarterly | Monthly/Quarterly |
| Modelo 390 | Annual VAT summary | January 30 | Annual |
| Modelo 347 | Third party transactions | February 28 | Annual |
| Modelo 190 | Withholding summary | January 31 | Annual |

**Estonia:**
| Obligation | Description | Due Date | Frequency |
|------------|-------------|----------|-----------|
| Annual Report | Financial statements | 6 months after year-end | Annual |
| TSD | Employment taxes | 10th of month | Monthly |
| VAT Return | VAT filing | 20th of month | Monthly |
| KMD | Intra-community VAT | 20th of month | Monthly |

### 2. International Reporting

Map cross-border obligations:

**USA International Forms:**
| Form | Description | Triggers | Penalty |
|------|-------------|----------|---------|
| Form 5471 | CFC reporting | >10% US shareholder | $10,000+ per form |
| Form 8865 | Foreign partnership | US partner in foreign partnership | $10,000+ |
| Form 8938 | FATCA reporting | Foreign financial assets | $10,000+ |
| FBAR (FinCEN 114) | Foreign bank accounts | $10,000 aggregate | Civil and criminal |
| Form 8858 | Foreign disregarded entity | Owner of foreign DE | $10,000 |

**Spain International:**
| Modelo | Description | Triggers |
|--------|-------------|----------|
| Modelo 720 | Foreign asset disclosure | €50,000 threshold per category |
| Modelo 232 | Related party transactions | Thresholds vary |

### 3. State/Regional Compliance

Map local obligations:

**State Income Tax:**
- Filing requirements per state with nexus
- Withholding for remote employees
- Apportionment calculations

**Local Taxes:**
- Property taxes
- Business license taxes
- Local sales taxes

**Autonomous Community (Spain):**
- Regional variations
- IRPF rates by region
- Regional incentives

### 4. Compliance Calendar

Create master calendar:

```markdown
### Annual Compliance Calendar

**January**
- [ ] [Date]: [Obligation]

**February**
- [ ] [Date]: [Obligation]

**March**
- [ ] [Date]: [Obligation]

[... for all 12 months]
```

### 5. Update Output

```markdown
## 8. Compliance Map

### Filing Obligations Summary
**Total Annual Filings:** [Count]
**Estimated Compliance Cost:** [Amount]

### By Jurisdiction

#### [Jurisdiction 1]
| Filing | Due Date | Preparer | Status |
|--------|----------|----------|--------|
| [Filing] | [Date] | [Who] | [Status] |
...

#### [Jurisdiction 2]
[Same format]

### International Reporting
| Form | Applicable | Due Date | Current Status |
|------|------------|----------|----------------|
| [Form] | [Yes/No] | [Date] | [Compliant/Needs attention] |
...

### Compliance Calendar Summary
**Q1 Filings:** [Count]
**Q2 Filings:** [Count]
**Q3 Filings:** [Count]
**Q4 Filings:** [Count]

### Compliance Recommendations
1. [Recommendation 1]
2. [Recommendation 2]
```

Update: `stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]`

### 6. Menu

**[C]** Continue to risk assessment | **[D]** Detail specific obligations | **[Q]** Questions
