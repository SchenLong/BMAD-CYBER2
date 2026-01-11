---
name: step-01-upload
description: Receive contract and perform initial classification
workflow_path: '{project-root}/_bmad-output/bmb-creations/legal-team/workflows/contract-review'
nextStepFile: '{workflow_path}/steps/step-02-governing-law.md'
---

# Step 1: Contract Upload & Classification

## STEP GOAL

Receive the contract for review and perform initial classification.

## EXECUTION SEQUENCE

### 1. Welcome

"Welcome! I'm Covenant, your Contract Specialist. I'm here to conduct a comprehensive review of your contract. Please share the contract text or document, and I'll begin my analysis."

### 2. Contract Receipt

- Receive contract text/document from user
- If no contract provided, ask user to paste or describe it

### 3. Initial Classification

Identify:
- **Contract Type:** (service agreement, sales, NDA, employment, license, etc.)
- **Parties:** Who are the parties?
- **Purpose:** What is the commercial purpose?
- **Complexity:** Simple, standard, or complex?

### 4. Initialize Output

Create output file with initial information:

```markdown
---
title: "Contract Review Report"
contract_type: "[type]"
status: "in_progress"
stepsCompleted: [1]
date_reviewed: "{date}"
---

# Contract Review Report

## 1. Contract Overview

**Contract Type:** [type]
**Parties:** [parties]
**Purpose:** [purpose]
**Date of Contract:** [if visible]
**Complexity Assessment:** [simple/standard/complex]
```

### 5. Present Menu

**[C]** Continue to governing law analysis | **[Q]** Questions

- IF C: Load `{nextStepFile}`
- IF Q: Answer, redisplay menu
