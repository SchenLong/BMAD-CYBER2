---

name: 'step-01b-continue'
description: 'Handle continuation of existing blockchain security assessment'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/blockchain-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/security/blockchain-security-assessment-{project_name}.md'

---

# Step 1b: Continue Existing Assessment

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- This step ONLY executes if {outputFile} exists
- Parse frontmatter to determine progress
- Offer appropriate continuation options

## CONTINUATION SEQUENCE:

### 1. Parse Existing Document

Read {outputFile} and extract:
- `stepsCompleted` array from frontmatter
- `project_name`, `platform`, `project_type`
- `status` field
- Last updated date

### 2. Display Progress Summary

"**Existing Blockchain Security Assessment Found**

**Project:** {project_name}
**Platform:** {platform}
**Type:** {project_type}
**Status:** {status}
**Last Updated:** {last_updated}

**Steps Completed:** {stepsCompleted}

| Step | Description | Status |
|------|-------------|--------|
| 1 | Assessment Initialization | ✅/⬜ |
| 2 | Smart Contract Security Review | ✅/⬜ |
| 3 | Access Control Analysis | ✅/⬜ |
| 4 | Economic Security Assessment | ✅/⬜ |
| 5 | DeFi-Specific Vulnerabilities | ✅/⬜ |
| 6 | Infrastructure & Frontend | ✅/⬜ |
| 7 | Findings Summary | ✅/⬜ |
| 8 | Remediation Roadmap | ✅/⬜ |

Would you like to continue from where you left off?"

### 3. Continuation Options

## MENU

Display: **Select How to Continue:**
[C] Continue from last completed step
[J] Jump to specific step
[V] View current document sections
[R] Restart assessment (new document)

#### Menu Handling Logic:

- IF C: Determine next step from stepsCompleted, load and execute that step file
- IF J: Display step list with numbers, accept step selection, load and execute selected step
- IF V: Display section headers and summaries from current document
- IF R: Confirm restart, archive existing file with timestamp, return to step-01-init.md

### 4. Step Jump Handler

If user selects Jump (J):

"**Select Step to Jump To:**

1. Assessment Initialization
2. Smart Contract Security Review
3. Access Control Analysis
4. Economic Security Assessment
5. DeFi-Specific Vulnerabilities
6. Infrastructure & Frontend Security
7. Findings Summary
8. Remediation Roadmap

Enter step number:"

Then load corresponding step file:
- 1 → step-01-init.md
- 2 → step-02-smart-contract-review.md
- 3 → step-03-access-control.md
- 4 → step-04-economic-security.md
- 5 → step-05-defi-vulnerabilities.md
- 6 → step-06-infrastructure.md
- 7 → step-07-findings-summary.md
- 8 → step-08-remediation.md

---

## CRITICAL CONTINUATION NOTE

Always preserve existing work when continuing. Never overwrite completed sections unless explicitly requested by user.

**Master Rule:** Maintain document integrity and user progress at all times.
