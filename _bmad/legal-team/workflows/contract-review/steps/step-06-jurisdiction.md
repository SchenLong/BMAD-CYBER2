---
name: step-06-jurisdiction
description: Check jurisdiction-specific compliance
workflow_path: '{project-root}/_bmad-output/bmb-creations/legal-team/workflows/contract-review'
nextStepFile: '{workflow_path}/steps/step-07-gaps.md'
---

# Step 6: Jurisdiction-Specific Compliance

## STEP GOAL

Review contract for compliance with applicable jurisdiction's mandatory rules.

## EXECUTION SEQUENCE

### 1. Identify Applicable Rules

Based on governing law, identify:
- Mandatory provisions that cannot be waived
- Consumer protection rules (if B2C)
- Industry-specific regulations
- Local law requirements

### 2. US-Specific (if applicable)

Check for:
- UCC compliance (if goods)
- State-specific requirements
- Federal regulatory compliance
- Arbitration enforceability (FAA)

### 3. EU-Specific (if applicable)

Check for:
- Consumer Rights Directive compliance
- Unfair Contract Terms Directive
- GDPR implications
- E-commerce regulations

### 4. Spain-Specific (if applicable)

Check for:
- Código Civil requirements
- Ley de Condiciones Generales
- Notarial requirements
- Consumer protection (B2C)

### 5. Update Output

```markdown
## 6. Jurisdiction-Specific Compliance

**Governing Law:** [law]
**Specialist Consulted:** [agent]

### Mandatory Rules
[List applicable mandatory provisions]

### Compliance Assessment
| Requirement | Status | Notes |
|-------------|--------|-------|
[Table of compliance items]

### Concerns Identified
[List jurisdiction-specific concerns]

### Required Modifications
[List changes needed for compliance]
```

Update: `stepsCompleted: [1, 2, 3, 4, 5, 6]`

### 6. Present Menu

**[C]** Continue | **[S]** Consult specialist | **[Q]** Questions
