---
name: step-03-jurisdiction
description: Analyze tax implications by jurisdiction
workflow_path: '{project-root}/_bmad/legal-team/workflows/tax-planning'
nextStepFile: '{workflow_path}/steps/step-04-entity.md'
---

# Step 3: Jurisdiction Analysis

## STEP GOAL

Analyze tax treatment across relevant jurisdictions.

## EXECUTION SEQUENCE

### 1. USA Tax Analysis (if applicable)

**Federal Taxation:**
- Corporate rate: 21% flat
- Individual rates: 10% - 37%
- Capital gains: 0%, 15%, 20% + 3.8% NIIT
- Pass-through: QBI deduction up to 20%

**State Tax Considerations:**
| State | Corporate | Individual | Key Features |
|-------|-----------|------------|--------------|
| California | 8.84% | Up to 13.3% | Worldwide combined reporting |
| Texas | No income tax | No income tax | Franchise tax instead |
| Delaware | 8.7% | Up to 6.6% | Favorable holding laws |
| Wyoming | None | None | Privacy, no franchise |
| Florida | 5.5% | None | No individual income tax |
| Nevada | None | None | No income taxes |
| New York | 6.5% | Up to 10.9% | Complex nexus rules |

**Key US Planning Considerations:**
- State nexus and apportionment
- SALT deduction cap ($10,000)
- Interest limitation (163(j))
- International provisions (GILTI, FDII)

### 2. Spain Tax Analysis (if applicable)

**Corporate Taxation (Impuesto sobre Sociedades):**
- Standard rate: 25%
- New entities: 15% (first 2 years)
- Small companies: Various incentives
- Patent Box: Effective 10% on qualifying IP

**Individual Taxation (IRPF):**
- Progressive rates: 19% - 47%
- Savings income: 19% - 28%
- Beckham Law: Flat 24% for qualifying expats

**Special Regimes:**
- ETVE (Holding company): Participation exemption
- Madeira Alternative: Portugal Free Trade Zone
- Regional incentives: Canary Islands, Basque Country

### 3. Estonia Tax Analysis (if applicable)

**Corporate Taxation:**
- 0% on retained/reinvested earnings
- 20% on distributions
- 14% on regular dividends (from 3rd year)

**Individual Taxation:**
- Flat 20% income tax
- No wealth tax
- No inheritance tax

**E-Residency Benefits:**
- Fully digital administration
- EU company, non-resident ownership
- No double taxation if owner non-resident
- Ideal for digital businesses

### 4. Tax Treaty Analysis

Identify relevant treaties:

| Treaty Pair | Dividends | Interest | Royalties | Capital Gains |
|-------------|-----------|----------|-----------|---------------|
| USA-Spain | 15%/10% | 10% | 0%/5%/10% | Residence |
| USA-Estonia | 15%/5% | 10% | 0%/5%/10% | Residence |
| Spain-Estonia | 0%/15% | 0%/10% | 0%/5% | Residence |

### 5. Update Output

```markdown
## 3. Jurisdiction Tax Analysis

### Primary Jurisdiction: [Name]
**Corporate Rate:** [%]
**Individual Rate:** [Range]
**Key Features:**
- [Feature 1]
- [Feature 2]

**Applicable Incentives:**
- [Incentive 1]
- [Incentive 2]

### Secondary Jurisdictions
[Repeat analysis for each relevant jurisdiction]

### Treaty Network
**Applicable Treaties:** [List]
**Key Benefits:**
- [Treaty benefit 1]
- [Treaty benefit 2]

### Jurisdiction Comparison
| Factor | [Jurisdiction 1] | [Jurisdiction 2] | [Jurisdiction 3] |
|--------|------------------|------------------|------------------|
| Corp Rate | [%] | [%] | [%] |
| Individual | [Range] | [Range] | [Range] |
| Dividends | [Treatment] | [Treatment] | [Treatment] |
| Compliance | [Level] | [Level] | [Level] |

### Preliminary Observations
[Initial jurisdiction-based planning opportunities]
```

Update: `stepsCompleted: [1, 2, 3]`

### 6. Menu

**[C]** Continue to entity structure | **[J]** More jurisdiction analysis | **[Q]** Questions
