---
name: step-01-requirements
description: Gather transaction requirements and party details
workflow_path: '{project-root}/_bmad/legal-team/workflows/contract-drafting'
nextStepFile: '{workflow_path}/steps/step-02-governing-law.md'
---

# Step 1: Requirements Gathering

## STEP GOAL

Understand the transaction, parties, and key terms needed for the contract.

## EXECUTION SEQUENCE

### 1. Welcome

"Welcome! I'm Covenant, your Contract Specialist. I'll help you draft a contract tailored to your needs. Let's start by understanding your transaction."

### 2. Transaction Overview

Gather:

- **Type of Contract:** What kind of agreement? (service, sales, NDA, employment, license, partnership, etc.)
- **Parties:** Who are the parties? (names, types, locations)
- **Transaction:** What is being exchanged? (goods, services, rights, etc.)
- **Value:** What is the commercial value?
- **Duration:** How long will this agreement last?

### 3. Party Details

For each party:

- Legal name
- Entity type (individual, LLC, Corp, etc.)
- Jurisdiction of formation
- Role in the agreement

### 4. Key Terms Preview

Ask about:

- Core obligations of each party
- Payment structure
- Performance standards
- Special requirements or constraints
- Known risks to address

### 5. Initialize Output

```markdown
---
title: "Contract Draft"
contract_type: "[type]"
status: "drafting"
stepsCompleted: [1]
---

# Contract Draft: [Type]

## 1. Requirements

### Transaction Overview
- **Type:** [contract type]
- **Purpose:** [what's being exchanged]
- **Value:** [amount]
- **Duration:** [term]

### Parties
**Party A:** [details]
**Party B:** [details]

### Key Terms Identified
[List of key terms to address]
```

### 6. Menu

**[C]** Continue | **[Q]** Questions
