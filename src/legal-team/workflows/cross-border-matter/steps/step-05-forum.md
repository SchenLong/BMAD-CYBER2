---
name: step-05-forum
description: Select dispute resolution forum strategy
workflow_path: '{project-root}/_bmad/legal-team/workflows/cross-border-matter'
nextStepFile: '{workflow_path}/steps/step-06-regulatory.md'
---

# Step 5: Forum Strategy

## STEP GOAL

Determine the optimal forum for dispute resolution and enforcement strategy.

## EXECUTION SEQUENCE

### 1. Forum Options Analysis

Map available forums:

**Court Litigation:**

| Forum | Jurisdiction Basis | Advantages | Disadvantages |
|-------|-------------------|------------|---------------|
| [Court] | [Domicile/Contract/Subject] | [Pros] | [Cons] |

**Arbitration:**

| Seat | Institution | Advantages | Disadvantages |
|------|-------------|------------|---------------|
| [City] | [ICC/LCIA/AAA/SIAC] | [Pros] | [Cons] |

### 2. Forum Selection Agreement Analysis

Evaluate existing clauses:

**Contractual Forum Selection:**

- Exclusive or non-exclusive?
- Which courts?
- Validity requirements met?

**Arbitration Agreement:**

- Valid arbitration clause?
- Seat specified?
- Institutional or ad hoc?
- Number of arbitrators?
- Language and rules?

### 3. Enforcement Considerations

Critical for cross-border:

**Judgment Enforcement:**

| Enforcement Country | Treaty Basis | Recognition Process |
|---------------------|--------------|---------------------|
| USA | Limited treaties | State-by-state comity |
| EU Member States | Brussels I Recast | Automatic recognition |
| Spain | Brussels I / Bilateral | Treaty-dependent |

**Arbitral Award Enforcement:**

| Country | NY Convention | Notes |
|---------|---------------|-------|
| USA | Yes | FAA applies |
| Spain | Yes | Limited grounds to refuse |
| Estonia | Yes | Pro-enforcement |

**Recommendation Impact:**

- Where are assets located?
- Where will enforcement be needed?
- Which forum's decisions are most portable?

### 4. Strategic Forum Selection

If drafting/negotiating:

**Litigation Forum Recommendation:**

```
JURISDICTION. The parties submit to the exclusive jurisdiction of the courts of [City/Country] for the resolution of any disputes arising out of or in connection with this Agreement.
```

**Arbitration Clause Recommendation:**

```
ARBITRATION. Any dispute arising out of or in connection with this Agreement shall be finally settled under the Rules of [Institution] by [one/three] arbitrator(s) appointed in accordance with said Rules. The seat of arbitration shall be [City]. The language of arbitration shall be [Language]. The governing law of this Agreement shall be [Law].
```

### 5. Parallel Proceedings Strategy

Address multi-forum risks:

**Anti-Suit Injunctions:**

- Availability in relevant jurisdictions
- Enforcement mechanisms

**Lis Pendens:**

- First-in-time rules
- EU lis pendens (Brussels I)
- Strategic filing considerations

**Related Actions:**

- Consolidation options
- Stay mechanisms

### 6. Update Output

```markdown
## 5. Forum Strategy

### Current Forum Provisions
**Type:** [Litigation/Arbitration/None]
**Specified Forum:** [Location]
**Exclusive:** [Yes/No]
**Validity Assessment:** [Valid/Issues identified]

### Forum Options Comparison
| Forum | Type | Enforcement | Cost | Speed | Expertise |
|-------|------|-------------|------|-------|-----------|
| [Option 1] | [Court/Arb] | [1-5] | [1-5] | [1-5] | [1-5] |
...

### Enforcement Analysis
**Asset Locations:** [Countries]
**Enforcement Treaties:** [Available treaties]
**Recommended Enforcement Path:** [Strategy]

### Forum Recommendation
**Recommended Forum:** [Forum]
**Type:** [Litigation/Arbitration]
**Seat/Location:** [Place]

**Rationale:**
1. [Reason 1]
2. [Reason 2]
3. [Reason 3]

### Recommended Clause
[Full clause language]

### Parallel Proceedings Risk
**Risk Level:** [High/Medium/Low]
**Mitigation:** [Strategies]
```

Update frontmatter: `forumSelection: "[forum]"`
Update: `stepsCompleted: [1, 2, 3, 4, 5]`

### 7. Menu

**[C]** Continue to regulatory compliance | **[F]** More forum analysis | **[Q]** Questions
