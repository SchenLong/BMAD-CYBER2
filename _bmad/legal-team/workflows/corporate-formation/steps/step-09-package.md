---
name: step-09-package
description: Generate complete formation documentation package
workflow_path: '{project-root}/_bmad-output/bmb-creations/legal-team/workflows/corporate-formation'
nextStepFile: '{workflow_path}/steps/step-10-post-formation.md'
---

# Step 9: Formation Package

## STEP GOAL

Generate the complete formation documentation package with all required documents.

## EXECUTION SEQUENCE

### 1. Document Generation

Based on entity type and jurisdiction, generate:

**USA LLC:**
- Certificate of Formation (template)
- Operating Agreement (comprehensive)
- Initial Member Resolutions
- EIN Application Guide
- Banking Resolution
- BOI Report Instructions

**USA Corporation:**
- Certificate of Incorporation (template)
- Bylaws
- Organizational Consent/Resolutions
- Stock Certificate Template
- Stock Ledger Template
- EIN Application Guide

**Spain SL:**
- Estatutos Sociales (borrador)
- Acta de Constitución (guía)
- Certificación Denominación (instrucciones)
- Poderes y Representación
- Checklist Notarial

**Estonia OÜ:**
- Articles of Association
- Founder Resolution
- Board Member Consent
- Registration Application Guide
- e-Residency Procedure Guide

### 2. Package Assembly

Create structured package:

```markdown
# Corporate Formation Package
## [Entity Name] - [Entity Type]
### [Jurisdiction]

---

## Table of Contents
1. Formation Summary
2. [Document 1]
3. [Document 2]
...
N. Next Steps & Instructions

---

## 1. Formation Summary
[Compile all decisions and structures from previous steps]

## 2. [Formation Document]
[Full document with fillable fields marked]

...
```

### 3. Instructions Document

Create execution instructions:

```markdown
## Formation Execution Instructions

### Step-by-Step Process

**Phase 1: Document Preparation**
1. [Specific action]
2. [Specific action]

**Phase 2: Filing**
1. [Filing instructions]
2. [Expected timeline]

**Phase 3: Post-Filing**
1. [Follow-up actions]
2. [Confirmation steps]

### Contact Information
[Relevant authorities, registries, notaries]

### Estimated Costs Summary
[Itemized cost breakdown]

### Timeline
[Expected duration for each phase]
```

### 4. Update Output

```markdown
## 9. Formation Package Generated

### Package Contents
- [ ] Formation Summary
- [ ] [Document 1]
- [ ] [Document 2]
- [ ] Execution Instructions
- [ ] Cost Summary
- [ ] Compliance Calendar

### Document Status
All draft documents require:
- Legal review by qualified counsel
- Completion of variable fields
- Proper execution procedures

### Package Location
[Output file path]
```

Update: `stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]`

### 5. Menu

**[C]** Continue to post-formation guidance | **[D]** Download package | **[R]** Request changes
