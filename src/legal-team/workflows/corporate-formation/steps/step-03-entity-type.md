---
name: step-03-entity-type
description: Recommend appropriate entity structure
workflow_path: '{project-root}/_bmad/legal-team/workflows/corporate-formation'
nextStepFile: '{workflow_path}/steps/step-04-agent-assignment.md'
---

# Step 3: Entity Type Selection

## STEP GOAL

Recommend and select the appropriate legal entity type for the chosen jurisdiction.

## EXECUTION SEQUENCE

### 1. Entity Options for Selected Jurisdiction

Based on selectedJurisdiction, present relevant options:

**IF USA:**
| Entity | Liability | Taxation | Best For |
|--------|-----------|----------|----------|
| LLC | Limited | Pass-through or elect | Flexibility, simplicity |
| C-Corp | Limited | Corporate + dividends | VC funding, going public |
| S-Corp | Limited | Pass-through | Tax savings on SE tax |
| LP | Limited (LP), Unlimited (GP) | Pass-through | Investment vehicles |

**IF Spain:**
| Entity | Min Capital | Shares | Best For |
|--------|-------------|--------|----------|
| SL (Sociedad Limitada) | €3,000 | Participaciones | SMEs, most businesses |
| SA (Sociedad Anónima) | €60,000 | Acciones | Large companies, capital markets |
| SLNE | €3,000-€120,000 | Participaciones | Quick formation, limited scope |

**IF Estonia:**
| Entity | Min Capital | Features | Best For |
|--------|-------------|----------|----------|
| OÜ | €2,500 | Flexible, 0% retained | Most businesses |
| AS | €25,000 | Public offering capable | Larger ventures |

### 2. Entity Analysis

Analyze based on client needs:

**Key Factors:**
- Number of owners → ownership flexibility needs
- Funding plans → investor requirements
- Liability concerns → protection level
- Tax situation → optimal structure
- Exit plans → transferability needs

### 3. Entity Recommendation

```markdown
### Entity Type Recommendation

**Recommended Entity:** [Type]

**Why This Entity:**
1. [Liability protection aspect]
2. [Tax treatment benefit]
3. [Operational flexibility]
4. [Growth/exit alignment]

**Considerations:**
- [Any drawbacks to be aware of]
- [Future flexibility options]

**NOT Recommended:** [Alternative]
**Why Not:** [Brief reason]
```

### 4. Entity Confirmation

Confirm selection with user.

Update frontmatter: `entityType: "[entity]"`

### 5. Update Output

```markdown
## 3. Entity Type Selection

### Options Analyzed
[Summary of entity comparison]

### Selected Entity
**Entity Type:** [Selected]
**Key Benefits:**
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

### Formation Implications
[What this choice means for formation process]
```

Update: `stepsCompleted: [1, 2, 3]`

### 6. Menu

**[C]** Continue to specialist assignment | **[R]** Reconsider entity type | **[Q]** Questions
