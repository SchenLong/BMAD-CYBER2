---
name: step-04-governing
description: Determine applicable governing law
workflow_path: '{project-root}/_bmad-output/bmb-creations/legal-team/workflows/cross-border-matter'
nextStepFile: '{workflow_path}/steps/step-05-forum.md'
---

# Step 4: Governing Law Selection

## STEP GOAL

Determine the applicable governing law and recommend optimal choice of law strategy.

## EXECUTION SEQUENCE

### 1. Existing Choice of Law

Analyze current situation:

**Contractual Choice:**
- Express choice of law clause?
- Validity of the choice
- Scope of the choice (entire agreement vs. specific issues)
- Exclusions/Carve-outs

**If No Express Choice:**
- Implied choice indicators
- Default rules application
- Characteristic performance analysis

### 2. Party Autonomy Limits

Assess freedom to choose:

**Valid Choice Requirements:**
| Jurisdiction | Requirements | Limits |
|--------------|--------------|--------|
| USA | Reasonable relationship or bona fide intent | UCC 1-301 limits |
| EU (Rome I) | Free choice for most contracts | Consumer/Employee protections |
| Spain | Follows Rome I | Mandatory rules apply |

**Mandatory Rule Limitations:**
- Consumer contracts (consumer's habitual residence)
- Employment contracts (place of work)
- Insurance contracts (policyholder location)
- Real property (lex situs)

### 3. Strategic Choice of Law

If drafting/negotiating, recommend optimal choice:

**Evaluation Matrix:**
| Jurisdiction Law | Substantive Favorability | Enforceability | Predictability | Recommendation |
|------------------|-------------------------|----------------|----------------|----------------|
| [Law 1] | [1-5] | [1-5] | [1-5] | [Score] |
| [Law 2] | [1-5] | [1-5] | [1-5] | [Score] |

**Key Considerations:**
- Substantive rules favorability
- Sophistication and predictability of law
- Availability of legal expertise
- Language considerations
- Cost of legal services

### 4. Dépeçage (Split Choice of Law)

Consider splitting governing law:

**Candidates for Different Laws:**
| Issue | Recommended Law | Rationale |
|-------|-----------------|-----------|
| Contract formation | [Law] | [Why] |
| Performance obligations | [Law] | [Why] |
| Limitation of liability | [Law] | [Why] |
| IP-related provisions | [Law] | [Why] |

### 5. Choice of Law Clause Drafting

If applicable, draft clause:

```
GOVERNING LAW. This Agreement shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of laws principles [that would require application of the laws of another jurisdiction].

[Optional additions for EU:]
The parties agree that the United Nations Convention on Contracts for the International Sale of Goods (CISG) [shall/shall not] apply to this Agreement.
```

### 6. Update Output

```markdown
## 4. Governing Law Determination

### Current Governing Law
**Express Choice:** [Yes/No]
**Chosen Law:** [If yes]
**Validity Assessment:** [Valid/Potentially invalid/Needs review]

### If No Choice - Default Analysis
**Characteristic Performance:** [Party and habitual residence]
**Closest Connection:** [Jurisdiction]
**Likely Governing Law:** [Result]

### Recommended Governing Law
**Recommendation:** [Jurisdiction] law
**Rationale:**
1. [Reason 1]
2. [Reason 2]
3. [Reason 3]

**Mandatory Rule Considerations:**
- [Rule 1 that cannot be contracted out]
- [Rule 2 that cannot be contracted out]

### Dépeçage Consideration
[Whether splitting law is advisable and for which issues]

### Recommended Clause Language
[Proposed choice of law clause if drafting]
```

Update frontmatter: `governingLaw: "[jurisdiction]"`
Update: `stepsCompleted: [1, 2, 3, 4]`

### 7. Menu

**[C]** Continue to forum selection | **[L]** More law analysis | **[Q]** Questions
