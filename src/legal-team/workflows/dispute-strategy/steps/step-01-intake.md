---
name: step-01-intake
description: Initial dispute intake and understanding
workflow_path: '{project-root}/_bmad/legal-team/workflows/dispute-strategy'
nextStepFile: '{workflow_path}/steps/step-02-facts.md'
---

# Step 1: Dispute Intake

## STEP GOAL

Understand the dispute, identify parties, and establish the conflict parameters.

## EXECUTION SEQUENCE

### 1. Welcome & Scope Confirmation

Present welcome message:

"Welcome to the Dispute Strategy Workflow. I'm Advocate, specialized in dispute resolution and litigation strategy.

**Important:** This workflow covers civil disputes only. It does NOT provide guidance on:

- Criminal matters
- Criminal defense
- Any prosecution-related issues

If your matter involves potential criminal liability, please consult a criminal defense attorney.

Let's understand your dispute situation."

### 2. Basic Dispute Information

Gather core details:

**Your Position:**

- Are you the potential claimant or defendant?
- Individual or business entity?
- Any co-parties on your side?

**Opposing Party:**

- Individual or business entity?
- Known legal representation?
- Multiple opposing parties?

**Nature of Dispute:**

- Brief description of the conflict
- What is at stake? (money, property, rights, reputation)
- Current status (threats, demand letters, filed suit?)

### 3. Jurisdiction Identification

Determine applicable jurisdiction:

**Where did the dispute arise?**

- Location of contract signing
- Location of incident/breach
- Location of parties

**Any jurisdiction clauses?**

- Forum selection in contracts
- Arbitration agreements
- Choice of law provisions

### 4. Urgency Assessment

Evaluate time pressures:

- Any pending deadlines?
- Statute of limitations concerns?
- Preliminary injunction needs?
- Imminent actions by opposing party?

### 5. Update Output

```markdown
## 1. Dispute Intake Summary

### Parties
**Client Position:** [Claimant/Defendant]
**Client Type:** [Individual/Business]
**Opposing Party:** [Description]
**Opposing Counsel:** [If known]

### Dispute Overview
**Nature:** [Brief description]
**At Stake:** [What's being disputed]
**Current Status:** [Pre-litigation/Litigation]

### Jurisdiction
**Primary Jurisdiction:** [Location]
**Governing Law:** [If known]
**Forum:** [Court/Arbitration]

### Urgency
**Time Pressures:** [Any deadlines]
**SOL Concerns:** [Status]
```

Update frontmatter:

- `disputeType: "[type]"`
- `jurisdiction: "[jurisdiction]"`
- `stepsCompleted: [1]`

### 6. Menu

**[C]** Continue to facts & timeline | **[Q]** Questions | **[M]** Modify information
