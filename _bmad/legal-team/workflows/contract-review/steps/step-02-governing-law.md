---
name: step-02-governing-law
description: Identify governing law and jurisdiction provisions
workflow_path: '{project-root}/_bmad/legal-team/workflows/contract-review'
nextStepFile: '{workflow_path}/steps/step-03-structure.md'
---

# Step 2: Governing Law & Jurisdiction

## STEP GOAL

Identify the governing law, jurisdiction, and dispute resolution provisions.

## EXECUTION SEQUENCE

### 1. Locate Provisions

Search contract for:
- Governing law clause
- Jurisdiction/venue clause
- Dispute resolution clause (arbitration, mediation, litigation)
- Choice of forum provisions

### 2. Analyze Provisions

For each provision found:
- Quote the exact language
- Assess enforceability
- Note any concerns
- Identify which jurisdiction specialist to consult

### 3. Determine Applicable Law

Based on:
- Express choice of law
- Implied choice (if no express)
- Mandatory rules that override choice
- Party locations

### 4. Update Output

```markdown
## 2. Governing Law & Jurisdiction

**Governing Law:** [law identified]
**Clause Text:** "[exact quote]"
**Jurisdiction/Venue:** [forum identified]
**Dispute Resolution:** [mechanism]
**Enforceability Assessment:** [assessment]
**Specialist Required:** [Liberty/Europa/Castile based on law]
```

Update: `stepsCompleted: [1, 2]`

### 5. Present Menu

**[C]** Continue | **[D]** Discuss governing law | **[Q]** Questions

- IF C: Load `{nextStepFile}`
