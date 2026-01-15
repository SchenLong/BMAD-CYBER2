---
name: step-06-documents
description: Gather and assess relevant documents and evidence
workflow_path: '{project-root}/_bmad/legal-team/workflows/legal-matter-intake'
nextStepFile: '{workflow_path}/steps/step-07-routing.md'
---

# Step 6: Document & Evidence Review

## STEP GOAL

Identify relevant documents and evidence, assess what's available, and note what may be needed.

## EXECUTION RULES

- Catalog available documents
- Identify missing critical documents
- Note evidence preservation needs
- Do not provide substantive analysis yet
- ALWAYS communicate in `{communication_language}`

## DOCUMENT CATEGORIES

### Contracts & Agreements
- Main contract(s)
- Amendments, addenda
- Side letters
- Related agreements

### Correspondence
- Email communications
- Letters
- Meeting notes
- Negotiation records

### Corporate Documents
- Formation documents
- Bylaws, operating agreements
- Board resolutions
- Shareholder records

### Financial Documents
- Invoices, payment records
- Financial statements
- Tax returns
- Valuations

### Evidence
- Photographs, videos
- Expert reports
- Witness statements
- Physical evidence

### Legal Documents
- Prior legal opinions
- Court filings
- Regulatory correspondence
- Existing legal work

## EXECUTION SEQUENCE

### 1. Document Inventory

"Let's understand what documents and evidence you have available."

Ask about:
- Main documents (contracts, agreements)
- Supporting correspondence
- Financial records
- Any prior legal work
- Evidence relevant to disputes

### 2. Document Assessment

For key documents:
- Is it available and accessible?
- Is it complete?
- Are there any concerns about authenticity?
- Is there a governing law clause?

### 3. Evidence Preservation

If dispute-related:
- Advise on document preservation
- Note litigation hold considerations
- Identify evidence at risk

### 4. Missing Documents

Identify documents that:
- Are critical but missing
- Should be obtained
- May need to be requested from counterparty

### 5. Update Matter Brief

Append to output file:

```markdown
## 6. Documents & Evidence

### Documents Available
- [Document 1]: [description, status]
- [Document 2]: [description, status]

### Documents Needed
- [Document]: [why needed, how to obtain]

### Key Document Notes
[Any important observations about documents]

### Evidence Preservation
[Any preservation needs or litigation hold considerations]
```

Update frontmatter: `stepsCompleted: [1, 2, 3, 4, 5, 6]`

### 6. Present Menu

**Select an Option:**
- **[C]** Continue to routing recommendation
- **[U]** Upload/discuss specific documents
- **[Q]** Questions about documents

#### Menu Handling:
- IF C: Update frontmatter, load and execute `{nextStepFile}`
- IF U: Review specific documents, then redisplay menu
- IF Q: Answer questions, then redisplay menu
