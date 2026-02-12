---
name: step-01-situation
description: Analyze current tax position and structure
workflow_path: '{project-root}/_bmad/legal-team/workflows/tax-planning'
nextStepFile: '{workflow_path}/steps/step-02-goals.md'
---

# Step 1: Situation Analysis

## STEP GOAL

Understand the client's current tax position, existing structures, and baseline situation.

## EXECUTION SEQUENCE

### 1. Welcome & Scope Setting

Present welcome message:

"Welcome to the Tax Planning Workflow. I'm Tribute, the tax specialist.

**Important:** This workflow provides tax planning guidance and concepts. It is NOT:

- Tax return preparation
- Audit representation
- A substitute for professional tax advice

Tax law is jurisdiction-specific and constantly evolving. All strategies should be validated with qualified tax professionals.

Let's understand your current situation."

### 2. Client Profile

Gather taxpayer information:

**Taxpayer Type:**

- Individual / Sole proprietor
- Partnership / Multi-member LLC
- Corporation (C-Corp, S-Corp)
- Trust / Estate
- Mixed structures

**Tax Residency:**

- Country of tax residence
- Secondary residencies
- Time spent in each jurisdiction
- Visa/Immigration status (if relevant)

**Filing History:**

- Currently compliant?
- Any outstanding issues?
- Prior planning implemented?

### 3. Current Structure Mapping

Document existing structure:

**Entities Owned:**

| Entity | Type | Jurisdiction | Ownership % | Purpose |
|--------|------|--------------|-------------|---------|
| [Name] | [Type] | [Location] | [%] | [Business purpose] |

**Intercompany Relationships:**

- Parent-subsidiary relationships
- Service arrangements
- IP ownership
- Financing arrangements

### 4. Income & Asset Overview

Gather financial picture:

**Income Sources:**

| Source | Type | Amount (Annual) | Jurisdiction |
|--------|------|-----------------|--------------|
| [Source] | [Active/Passive] | [Range] | [Location] |

**Key Assets:**

| Asset | Type | Value | Location | Tax Basis |
|-------|------|-------|----------|-----------|
| [Asset] | [Category] | [Value] | [Location] | [Basis] |

### 5. Update Output

```markdown
## 1. Current Tax Situation

### Taxpayer Profile
**Type:** [Entity/Individual]
**Tax Residence:** [Primary jurisdiction]
**Filing Status:** [Current status]

### Existing Structure
[Structure diagram or description]

### Entities
| Entity | Type | Jurisdiction | Purpose |
|--------|------|--------------|---------|
| [Entity details] |
...

### Income Profile
**Total Annual Income:** [Range]
**Income Mix:**
- Active/Earned: [%]
- Passive/Investment: [%]
- Business: [%]

### Asset Base
**Total Assets:** [Range]
**Key Holdings:** [Summary]

### Current Tax Burden
**Effective Tax Rate:** [If known]
**Primary Tax Jurisdictions:** [List]
```

Update frontmatter: `taxJurisdictions: "[jurisdictions]"`
Update: `stepsCompleted: [1]`

### 6. Menu

**[C]** Continue to goals definition | **[M]** Modify information | **[Q]** Questions
