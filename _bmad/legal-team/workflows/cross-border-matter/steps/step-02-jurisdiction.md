---
name: step-02-jurisdiction
description: Map all relevant jurisdictions
workflow_path: '{project-root}/_bmad/legal-team/workflows/cross-border-matter'
nextStepFile: '{workflow_path}/steps/step-03-conflict.md'
---

# Step 2: Jurisdiction Mapping

## STEP GOAL

Systematically identify and map all jurisdictions relevant to the matter.

## EXECUTION SEQUENCE

### 1. Party-Based Jurisdictions

Map jurisdictions based on parties:

**Place of Incorporation/Residence:**
| Party | Incorporation | Residence | Principal Place of Business |
|-------|--------------|-----------|---------------------------|
| [Party] | [Country] | [Country] | [Country] |

**Nationality Considerations:**
- Beneficial ownership nationality
- Control and management location
- Tax residence

### 2. Transaction-Based Jurisdictions

Map jurisdictions based on activities:

**Place of Performance:**
- Where will obligations be performed?
- Location of services delivery
- Location of goods delivery
- Place of payment

**Place of Contracting:**
- Where was/will contract be signed?
- Where were negotiations conducted?
- Location of offer and acceptance

**Asset Locations:**
- Real property
- Intellectual property (registration countries)
- Bank accounts
- Physical assets

### 3. Event-Based Jurisdictions

For disputes:

**Place of Harm:**
- Where did breach occur?
- Where was damage suffered?
- Where did wrongful act take place?

**Forum Selection:**
- Contractual forum selection
- Arbitration agreement location
- Potential filing venues

### 4. Regulatory Jurisdictions

Map regulatory touchpoints:

**Regulatory Requirements:**
| Jurisdiction | Regulator | Requirement | Applicability |
|--------------|-----------|-------------|---------------|
| [Country] | [Authority] | [Requirement] | [Why applies] |

**Key Regulations:**
- Data protection (GDPR, CCPA, others)
- Consumer protection
- Employment law
- Industry-specific regulations
- Anti-corruption laws

### 5. Jurisdiction Priority Matrix

Rank jurisdictions:

| Jurisdiction | Relevance | Priority | Expertise Available |
|--------------|-----------|----------|---------------------|
| [Country] | [Why relevant] | [1-5] | [Agent/External] |

### 6. Update Output

```markdown
## 2. Jurisdiction Mapping

### Primary Jurisdictions
| Rank | Jurisdiction | Connection Type | Significance |
|------|--------------|-----------------|--------------|
| 1 | [Country] | [Party/Transaction/Regulatory] | [High/Medium] |
...

### Party Nexus
[Summary of party-jurisdiction connections]

### Transaction Nexus
[Summary of where transaction touches]

### Regulatory Overlay
| Jurisdiction | Key Regulations | Impact |
|--------------|-----------------|--------|
| [Country] | [Regulations] | [Description] |
...

### Forum Options
**Potential Courts:**
- [Jurisdiction 1]: [Court/basis]
- [Jurisdiction 2]: [Court/basis]

**Arbitration:**
- [Seat options and considerations]

### Jurisdiction Map
```
[Visual or textual representation of jurisdictional connections]
```
```

Update frontmatter: `jurisdictions: "[list]"`
Update: `stepsCompleted: [1, 2]`

### 7. Menu

**[C]** Continue to conflict analysis | **[J]** Add jurisdictions | **[Q]** Questions
