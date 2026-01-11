---
name: step-03-jurisdiction
description: Identify applicable jurisdictions for the matter
workflow_path: '{project-root}/_bmad-output/bmb-creations/legal-team/workflows/legal-matter-intake'
nextStepFile: '{workflow_path}/steps/step-04-urgency.md'
jurisdictionChecklist: '{project-root}/_bmad-output/bmb-creations/legal-team/workflows/_shared/templates/jurisdiction-checklist.md'
---

# Step 3: Jurisdiction Analysis

## STEP GOAL

Determine which jurisdiction(s) apply to this matter and identify any cross-border implications.

## EXECUTION RULES

- Use the jurisdiction checklist as a guide
- Identify ALL applicable jurisdictions, not just primary
- Flag cross-border complexity early
- Consider where enforcement may be needed
- ALWAYS communicate in `{communication_language}`

## JURISDICTION FACTORS

### Party Location
- Where is the user located/incorporated?
- Where is the counterparty located/incorporated?
- Multiple parties in different jurisdictions?

### Activity/Transaction Location
- Where does the activity occur?
- Where are services performed?
- Where are goods delivered?
- Where is property located?

### Existing Agreements
- Does an existing contract specify governing law?
- Is there a forum selection clause?
- Are choice of law provisions enforceable?

### Entity Considerations
- Incorporation jurisdiction
- Principal place of business
- Permanent establishment concerns

## EXECUTION SEQUENCE

### 1. Jurisdiction Discovery

"Let's determine which legal systems apply to your matter. I need to understand where the relevant parties, activities, and assets are located."

Walk through jurisdiction factors:
- Party locations
- Transaction/activity location
- Existing contractual provisions
- Enforcement considerations

### 2. Cross-Border Assessment

If multiple jurisdictions identified:
- Note the primary jurisdiction
- Identify secondary jurisdictions
- Flag conflicts of law issues
- Consider treaty implications

### 3. Specialist Routing Preview

Based on jurisdictions:
- **US matters** → Liberty (US Counsel)
- **EU general** → Europa (EU Counsel)
- **Spain specific** → Castile (Spain Counsel)
- **Cross-border** → Europa for coordination
- **Tax implications** → Tribute

### 4. Update Matter Brief

Append to output file:

```markdown
## 3. Jurisdiction Analysis

**Primary Jurisdiction:** [jurisdiction]
**Secondary Jurisdictions:** [if any]
**Cross-Border Complexity:** [Yes/No - details]
**Governing Law (if known):** [from existing agreements]
**Enforcement Considerations:** [where judgment may need enforcement]
**Specialist Indication:** [based on jurisdiction]
```

Update frontmatter: `stepsCompleted: [1, 2, 3]`

### 5. Present Menu

**Select an Option:**
- **[C]** Continue to urgency assessment
- **[D]** Discuss jurisdiction details further
- **[Q]** Questions about jurisdictions

#### Menu Handling:
- IF C: Update frontmatter, load and execute `{nextStepFile}`
- IF D: Explore jurisdiction issues, then redisplay menu
- IF Q: Answer questions, then redisplay menu
