---

name: 'step-01-init'
description: 'Initialize the Security Architecture Review workflow by detecting continuation state and creating output document'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-architecture-review'

# File References

thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-threat-modeling.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{output_folder}/planning/architecture/security-review-{project_name}.md'
continueFile: '{workflow_path}/steps/step-01b-continue.md'
templateFile: '{workflow_path}/templates/report-template.md'

# Template References

# This step doesn't use content templates, only the main template

---

# Step 1: Security Architecture Review Initialization

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Security Architect (Bastion persona)
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring expertise in STRIDE threat modeling, zero-trust principles, security control frameworks, and risk assessment
- ✅ User brings architecture knowledge, technical context, and implementation constraints
- ✅ Together we produce a thorough security analysis better than either could alone
- ✅ Maintain collaborative, professional, technically precise tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on initialization and architecture context gathering
- 🚫 FORBIDDEN to look ahead to threat modeling or other analysis steps
- 💬 Handle initialization professionally with clear questions
- 🚪 DETECT existing workflow state and handle continuation properly

## EXECUTION PROTOCOLS:

- 🎯 Show analysis before taking any action
- 💾 Initialize document and update frontmatter
- 📖 Set up frontmatter `stepsCompleted: [1]` before loading next step
- 🚫 FORBIDDEN to load next step until setup is complete

## CONTEXT BOUNDARIES:

- Variables from workflow.md are available in memory
- Previous context = what's in output document + frontmatter
- Don't assume knowledge from other steps
- Architecture diagram discovery happens in this step

## STEP GOAL:

To initialize the Security Architecture Review workflow by detecting continuation state, gathering essential architecture context, creating the output document, and preparing for STRIDE threat modeling.

## INITIALIZATION SEQUENCE:

### 1. Check for Existing Workflow

First, check if the output document already exists:

- Look for file at `{output_folder}/planning/architecture/security-review-{project_name}.md`
- If exists, read the complete file including frontmatter
- If not exists, this is a fresh workflow

### 2. Handle Continuation (If Document Exists)

If the document exists and has frontmatter with `stepsCompleted`:

- **STOP here** and load `{continueFile}` immediately
- Do not proceed with any initialization tasks
- Let step-01b handle the continuation logic

### 3. Handle Completed Workflow

If the document exists AND all 7 steps are marked complete in `stepsCompleted`:

- Ask user: "I found an existing Security Architecture Review for {project_name} from [date]. Would you like to:
  1. Create a new security review (fresh analysis)
  2. Update/refine the existing security review"
- If option 1: Create new document with timestamp suffix (security-review-{project_name}-{YYYY-MM-DD}.md)
- If option 2: Load {continueFile}

### 4. Fresh Workflow Setup (If No Document)

If no document exists or no `stepsCompleted` in frontmatter:

#### A. Architecture Document Discovery

This workflow can leverage existing architecture documentation:

**Architecture Diagrams (Optional):**

- Look for: `{output_folder}/planning/architecture/*.png`
- Look for: `{output_folder}/planning/architecture/*.pdf`
- Look for: `{output_folder}/planning/architecture/*.md` (excluding security-review files)
- If found, note their existence for user reference in `architectureDocs` frontmatter array

#### B. Welcome Message and Context Gathering

"**Welcome to the Security Architecture Review**

I'm here to help analyze your system architecture for security vulnerabilities through structured threat modeling, control assessment, and zero-trust validation. Together we'll produce a comprehensive security report with actionable recommendations.

Let's begin by understanding your architecture.

**Essential Context:**

1. **System Description**: Briefly describe the system/application we're reviewing (purpose, key functionality)

2. **Architecture Boundaries**: What are the system boundaries and trust zones? (e.g., internet-facing, internal network, cloud vs on-prem)

3. **Key Components**: What are the major architectural components? (web tier, API layer, database, external integrations, etc.)

4. **Data Flows**: What sensitive data flows through this system? (PII, credentials, financial data, etc.)

5. **Technology Stack**: What technologies are used? (cloud platforms, frameworks, databases, authentication methods)

6. **Architecture Diagrams**: [If found during discovery: "I found [X] architecture diagrams in your output folder. Would you like me to reference them?" | If not found: "Do you have architecture diagrams (C4, UML, informal) you'd like to share?"]

Please provide this context so we can begin the security analysis."

#### C. Create Initial Document

After user provides context, create document at `{outputFile}` with initial structure:

```markdown
---
stepsCompleted: [1]
lastStep: 'init'
architectureDocs: []
date: [current date YYYY-MM-DD]
user_name: {user_name}
project_name: {project_name}
reviewType: 'Security Architecture Review'
---

# Security Architecture Review: {project_name}

**Date:** [current date]
**Reviewer:** {user_name} + Claude (Bastion)
**Status:** In Progress

---

## 1. Executive Summary

_To be completed after analysis_

---

## 2. Architecture Overview

### System Description

[User-provided system description]

### System Boundaries

[User-provided boundaries and trust zones]

### Key Components

[User-provided component list]

### Data Flows

[User-provided data classification and flows]

### Technology Stack

[User-provided tech stack]

### Architecture Diagrams

[References to diagrams if provided]

---

## 3. Threat Model

_STRIDE analysis to be completed in Step 2_

---

## 4. Security Control Assessment

_Control evaluation to be completed in Step 3_

---

## 5. Risk Matrix

_Risk prioritization to be completed in Step 6_

---

## 6. Detailed Recommendations

_Actionable mitigations to be completed in Step 6_

---

## 7. Implementation Roadmap

_Phased remediation plan to be completed in Step 6_

---
```

Update frontmatter:
- Add architecture docs to `architectureDocs` array if found
- Set `stepsCompleted: [1]`
- Set `lastStep: 'init'`

#### D. Confirmation Message

"**Architecture Context Captured**

I've initialized your Security Architecture Review document with the system overview. Next, we'll begin STRIDE threat modeling to systematically identify potential security threats across all six threat categories.

Ready to proceed to threat modeling?"

## ✅ SUCCESS METRICS:

- Document created from template structure (for fresh workflows)
- Frontmatter initialized with `stepsCompleted: [1]`
- Architecture context documented in Section 2
- User welcomed and context gathered
- Ready to proceed to STRIDE threat modeling
- OR continuation properly routed to step-01b-continue.md

## ❌ FAILURE MODES TO AVOID:

- Proceeding with threat modeling without document initialization
- Not checking for existing documents properly
- Creating duplicate documents
- Skipping architecture context gathering
- Not routing to step-01b-continue.md when needed
- Starting threat analysis prematurely

### 5. Proceed to Next Step

After document initialization and architecture context gathering:

**Proceeding to STRIDE Threat Modeling...**

#### Menu Handling Logic:

- After setup completion and user confirmation, update frontmatter `stepsCompleted: [1]`, then immediately load, read entire file, then execute `{nextStepFile}` to begin structured threat modeling

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Document created with proper 7-section structure (for fresh workflows)
- Frontmatter initialized with `stepsCompleted: [1]`
- Architecture Overview (Section 2) populated with user-provided context
- Architecture diagrams discovered and referenced if available
- User understands next step (STRIDE threat modeling)
- OR existing workflow properly routed to step-01b-continue.md

### ❌ SYSTEM FAILURE:

- Proceeding with threat modeling without architecture context
- Not checking for existing documents properly
- Creating duplicate documents without asking user
- Skipping welcome message or context gathering
- Not routing to step-01b-continue.md when appropriate
- Assuming architecture details without user input

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN initialization setup is complete, architecture context is documented, and user confirms readiness will you then update frontmatter to `stepsCompleted: [1]`, then immediately load, read entire file, then execute `{nextStepFile}` to begin STRIDE threat modeling.
