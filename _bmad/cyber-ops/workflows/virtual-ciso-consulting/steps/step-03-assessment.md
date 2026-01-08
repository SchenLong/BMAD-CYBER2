---
name: 'step-03-assessment'
description: 'Assess security maturity, identify gaps, and prioritize risks'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/virtual-ciso-consulting'
thisStepFile: '{workflow_path}/steps/step-03-assessment.md'
nextStepFile: '{workflow_path}/steps/step-04-strategy.md'
outputFile: '{output_folder}/vciso/{client_name}/vciso-engagement-{client_name}.md'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 3: Current State Assessment

## STEP GOAL:

To conduct a comprehensive security maturity assessment, identify gaps against best practices, and create a prioritized risk register.

## ASSESSMENT PROCESS:

### 1. Security Domains Assessment

Assess maturity across 10 security domains using 0-5 scale:
- 0 = Non-existent
- 1 = Initial/Ad-hoc
- 2 = Developing
- 3 = Defined
- 4 = Managed
- 5 = Optimized

**Domains:**
1. Governance & Risk Management
2. Asset Management & Data Classification
3. Identity & Access Management
4. Network & Infrastructure Security
5. Application Security
6. Endpoint Security
7. Incident Response & Recovery
8. Compliance & Audit
9. Security Awareness & Training
10. Vendor/Third-Party Risk

For each domain, collect:
- Current maturity score (0-5)
- Evidence/justification
- Key gaps identified
- Priority for improvement

### 2. Gap Analysis Matrix

Create gap analysis:

| Domain | Current | Target | Gap | Priority | Risk Level |
|--------|---------|--------|-----|----------|------------|
| Governance | X | Y | Z | P0/P1/P2/P3 | Critical/High/Medium/Low |

Priority:
- P0 = Critical (must address immediately)
- P1 = High (address within 90 days)
- P2 = Medium (address within 6 months)
- P3 = Low (address within 12 months)

### 3. Risk Register

For each identified risk:
- Risk description
- Likelihood (Low/Medium/High)
- Impact (Low/Medium/High)
- Risk score (Likelihood × Impact)
- Current controls
- Recommended mitigation
- Priority

### 4. Control Effectiveness Assessment

Review existing security controls:
- List current controls
- Assess effectiveness (Effective/Partially Effective/Ineffective)
- Identify control gaps
- Recommend improvements

### 5. Append Section 3

Update {outputFile} with comprehensive assessment results including:
- Maturity scores by domain
- Gap analysis matrix
- Prioritized risk register (sorted by risk score)
- Control effectiveness assessment
- Key findings and recommendations summary

### 6. Update Frontmatter

```yaml
stepsCompleted: [1, 2, 3]
lastStep: 'assessment'
```

### 7. Present MENU

Display: **[P] Party Mode [C] Continue to Strategic Planning**

- IF P: "Collaborate on maturity scoring validation" → Execute {partyModeWorkflow}
- IF C: Load {nextStepFile}

---

## ✅ SUCCESS:

- All 10 domains assessed with maturity scores
- Gap analysis complete with priorities
- Risk register created and prioritized
- Control effectiveness evaluated
- Section 3 appended
