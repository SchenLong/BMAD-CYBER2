---
name: step-05-parties
description: Analyze parties involved and their roles/relationships
workflow_path: '{project-root}/_bmad-output/bmb-creations/legal-team/workflows/legal-matter-intake'
nextStepFile: '{workflow_path}/steps/step-06-documents.md'
---

# Step 5: Party Analysis

## STEP GOAL

Understand all parties involved in the matter, their roles, relationships, and legal standing.

## EXECUTION RULES

- Identify ALL relevant parties
- Understand relationships between parties
- Determine user's role and position
- Consider capacity and authority issues
- ALWAYS communicate in `{communication_language}`

## PARTY CATEGORIES

### Client/User
- Individual or entity?
- Role in the matter (buyer, seller, plaintiff, defendant, etc.)
- Authority to act
- Capacity concerns

### Counterparty
- Individual or entity?
- Their role
- Relationship to client
- Known concerns about them

### Third Parties
- Other involved parties
- Guarantors, sureties
- Agents, representatives
- Regulators, authorities

### Representatives
- Existing legal counsel
- Other advisors
- Decision makers

## EXECUTION SEQUENCE

### 1. Party Discovery

"Let's map out everyone involved in this matter."

For each party, gather:
- Name/identity
- Type (individual, corporation, government, etc.)
- Role in the matter
- Location/jurisdiction
- Relationship to other parties

### 2. Client Position Analysis

Understand the user's position:
- What is your role? (buyer, seller, claimant, defendant, etc.)
- What is your relationship with the counterparty?
- Have you dealt with them before?
- Any power imbalance or leverage concerns?

### 3. Capacity and Authority

Verify:
- Does the user have authority to proceed?
- Any capacity concerns (minors, mental capacity, corporate authority)?
- Who are the decision makers?

### 4. Update Matter Brief

Append to output file:

```markdown
## 5. Party Analysis

### Client/User
- **Name:** [name]
- **Type:** [individual/entity type]
- **Role:** [role in matter]
- **Location:** [jurisdiction]
- **Authority:** [confirmed/pending]

### Counterparty
- **Name:** [name]
- **Type:** [individual/entity type]
- **Role:** [role in matter]
- **Location:** [jurisdiction]
- **Relationship:** [to client]

### Other Parties
[List any additional parties]

### Key Relationships
[Describe relationships and dynamics]
```

Update frontmatter: `stepsCompleted: [1, 2, 3, 4, 5]`

### 5. Present Menu

**Select an Option:**
- **[C]** Continue to document review
- **[A]** Add more parties
- **[Q]** Questions about parties

#### Menu Handling:
- IF C: Update frontmatter, load and execute `{nextStepFile}`
- IF A: Add additional parties, then redisplay menu
- IF Q: Answer questions, then redisplay menu
