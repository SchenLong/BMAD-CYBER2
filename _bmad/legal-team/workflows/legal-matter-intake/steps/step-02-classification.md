---
name: step-02-classification
description: Classify the matter type to determine appropriate handling
workflow_path: '{project-root}/_bmad/legal-team/workflows/legal-matter-intake'
nextStepFile: '{workflow_path}/steps/step-03-jurisdiction.md'
---

# Step 2: Matter Type Classification

## STEP GOAL

Determine the specific type of legal matter to ensure proper routing and handling.

## EXECUTION RULES

- Use conversation to clarify matter type
- A matter may involve multiple types - identify all applicable
- Do not provide legal advice yet - focus on classification
- ALWAYS communicate in `{communication_language}`

## MATTER TYPE CATEGORIES

### Contract/Agreement
- Contract review or negotiation
- Contract drafting
- Contract dispute
- Terms interpretation

### Corporate/Business
- Entity formation (LLC, Corp, S.L., etc.)
- Governance issues
- Shareholder/partnership matters
- M&A considerations
- Compliance requirements

### Dispute/Litigation
- Contract disputes
- Business/commercial disputes
- Property disputes
- Debt collection
- Professional liability

### Property/Real Estate
- Purchase/sale
- Lease agreements
- Property rights
- Title issues

### Employment/Labor
- Employment contracts
- Workplace issues
- Termination matters
- Regulatory compliance

### Tax
- Tax planning
- Cross-border tax
- Entity structuring for tax
- Compliance issues

### Other
- Regulatory compliance
- Intellectual property
- Data privacy
- Cross-border general

## EXECUTION SEQUENCE

### 1. Classification Discussion

"Now let me understand the specific nature of your matter. Based on what you've shared, this appears to involve [initial assessment]. Let me ask a few clarifying questions..."

Ask targeted questions based on initial context to narrow down:
- Primary matter type
- Secondary/related matter types
- Specific sub-category

### 2. Confirm Classification

Present the classification and confirm with user:
- Primary type: [identified]
- Related types: [if any]
- Initial routing indication: [which specialist likely needed]

### 3. Update Matter Brief

Append to output file:

```markdown
## 2. Matter Classification

**Primary Type:** [classification]
**Related Types:** [if any]
**Category Details:** [specifics]
**Initial Routing Indication:** [specialist area]
```

Update frontmatter: `stepsCompleted: [1, 2]`

### 4. Present Menu

**Select an Option:**
- **[C]** Continue to jurisdiction analysis
- **[R]** Revise classification
- **[Q]** Questions about classification

#### Menu Handling:
- IF C: Update frontmatter, load and execute `{nextStepFile}`
- IF R: Discuss and reclassify, then redisplay menu
- IF Q: Answer questions, then redisplay menu
