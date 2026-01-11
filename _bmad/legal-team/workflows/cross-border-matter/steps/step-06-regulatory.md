---
name: step-06-regulatory
description: Map cross-border regulatory requirements
workflow_path: '{project-root}/_bmad-output/bmb-creations/legal-team/workflows/cross-border-matter'
nextStepFile: '{workflow_path}/steps/step-07-coordination.md'
---

# Step 6: Regulatory Compliance

## STEP GOAL

Map regulatory requirements across all relevant jurisdictions and identify compliance obligations.

## EXECUTION SEQUENCE

### 1. Data Protection Compliance

Multi-jurisdictional data requirements:

**GDPR (EU/EEA):**
- Lawful basis for processing
- Data subject rights
- Cross-border transfers
- DPO requirements
- Breach notification (72 hours)

**USA:**
- CCPA/CPRA (California)
- State-specific laws
- Sector regulations (HIPAA, GLBA, FERPA)
- FTC enforcement

**Cross-Border Transfer Mechanisms:**
| From | To | Mechanism Required |
|------|----|--------------------|
| EU | USA | SCCs, Data Privacy Framework |
| EU | Spain | N/A (intra-EU) |
| EU | Non-adequate | SCCs + supplementary measures |

### 2. Consumer Protection

If B2C elements:

**EU Consumer Rights:**
- Cooling-off periods
- Mandatory information requirements
- Unfair terms directive
- Consumer ADR directive

**USA Consumer Protection:**
- FTC Act
- State UDAP statutes
- Specific industry regulations

**Jurisdictional Application:**
- Where consumer is located
- Directed activity test
- Mandatory consumer law

### 3. Employment Law

If employees involved:

**Employment Jurisdiction:**
| Issue | Governing Law | Mandatory Rules |
|-------|---------------|-----------------|
| Contract terms | [Law] | [Cannot contract out] |
| Termination | [Law] | [Local requirements] |
| Benefits | [Law] | [Statutory minimums] |

**Cross-Border Workers:**
- Posted workers directive (EU)
- Tax and social security
- Immigration requirements (not covered)

### 4. Anti-Corruption & Sanctions

Compliance obligations:

**Anti-Corruption:**
| Law | Jurisdiction | Extraterritorial Reach |
|-----|--------------|----------------------|
| FCPA | USA | US nexus |
| UK Bribery Act | UK | Connected to UK |
| Spanish Criminal Code | Spain | Spanish entities |

**Sanctions Screening:**
- OFAC (US)
- EU sanctions
- UN sanctions
- Third-party screening requirements

### 5. Industry-Specific Regulations

Map sector requirements:

**Financial Services:**
- Banking licenses by jurisdiction
- Investment services (MiFID II, US securities)
- AML/KYC requirements

**Technology:**
- AI regulation (EU AI Act)
- Content moderation
- Platform liability

**Other Sectors:**
- Healthcare
- Energy
- Telecommunications

### 6. Update Output

```markdown
## 6. Regulatory Compliance Map

### Data Protection
| Jurisdiction | Regime | Key Requirements | Status |
|--------------|--------|------------------|--------|
| EU | GDPR | [Requirements] | [Compliant/Gap] |
| USA | CCPA + Others | [Requirements] | [Compliant/Gap] |
...

**Cross-Border Transfers:**
- [Transfer mechanism requirements]

### Consumer Protection
**Applicable Regimes:**
- [Regime 1]: [Key requirements]
- [Regime 2]: [Key requirements]

### Employment
**Applicable Laws:** [By jurisdiction]
**Key Mandatory Rules:**
- [Rule 1]
- [Rule 2]

### Anti-Corruption & Sanctions
**Applicable Laws:** [List]
**Screening Requirements:** [Description]
**Compliance Status:** [Assessment]

### Industry-Specific
[Industry regulations applicable]

### Compliance Gap Analysis
| Area | Requirement | Current Status | Action Needed |
|------|-------------|----------------|---------------|
| [Area] | [Requirement] | [Gap/Compliant] | [Action] |
...

### Priority Compliance Actions
1. [Action 1]
2. [Action 2]
3. [Action 3]
```

Update: `stepsCompleted: [1, 2, 3, 4, 5, 6]`

### 7. Menu

**[C]** Continue to agent coordination | **[R]** Regulatory deep-dive | **[Q]** Questions
