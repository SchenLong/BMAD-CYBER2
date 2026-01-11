---
name: step-02-jurisdiction
description: Guide jurisdiction selection based on business needs
workflow_path: '{project-root}/_bmad-output/bmb-creations/legal-team/workflows/corporate-formation'
nextStepFile: '{workflow_path}/steps/step-03-entity-type.md'
---

# Step 2: Jurisdiction Selection

## STEP GOAL

Guide the client through selecting the optimal jurisdiction for their corporate formation.

## EXECUTION SEQUENCE

### 1. Present Jurisdiction Overview

Display supported jurisdictions with key characteristics:

**USA Options:**
| State | Best For | Key Features |
|-------|----------|--------------|
| Delaware | Most corporations | Business-friendly courts, flexible law |
| Wyoming | LLCs, privacy | No state tax, strong asset protection |
| Nevada | Asset protection | No state corporate tax, privacy |
| [Client's State] | Local operations | Simplicity if operating there |

**EU Options:**
| Country | Best For | Key Features |
|---------|----------|--------------|
| Estonia | Digital business, e-residency | 0% on retained earnings, fully digital |
| Spain | EU market access, local ops | SL flexibility, EU credibility |
| [Other EU] | General guidance available | Recommend local counsel |

### 2. Jurisdiction Analysis

Based on consultation data, analyze fit:

**USA Factors:**
- Presence of US customers/operations
- US investor requirements
- Banking needs
- State tax implications

**EU Factors:**
- EU market access needs
- VAT considerations
- Substance requirements
- Local presence requirements

**Cross-Border Factors:**
- Holding structure benefits
- Treaty access
- Repatriation considerations

### 3. Recommendation

Provide structured recommendation:

```markdown
### Jurisdiction Recommendation

**Primary Recommendation:** [Jurisdiction]
**Rationale:**
1. [Reason 1]
2. [Reason 2]
3. [Reason 3]

**Alternative Option:** [Jurisdiction]
**Why Consider:**
[Brief explanation]

**Multi-Jurisdiction Note:**
[If applicable - e.g., "Consider Estonia holding with US operating subsidiary"]
```

### 4. Jurisdiction Confirmation

Confirm selection with user.

Update frontmatter: `selectedJurisdiction: "[jurisdiction]"`

### 5. Update Output

```markdown
## 2. Jurisdiction Selection

### Analysis
[Summary of jurisdiction analysis]

### Selected Jurisdiction
**Jurisdiction:** [Selected]
**Rationale:** [Key reasons]

### Alternative Considered
[If applicable]
```

Update: `stepsCompleted: [1, 2]`

### 6. Menu

**[C]** Continue to entity type | **[R]** Reconsider jurisdiction | **[Q]** Questions
