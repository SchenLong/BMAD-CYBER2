---

name: 'step-01-init'
description: 'Initialize the Security Awareness Training workflow by detecting continuation state and assessing current program'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-awareness-training'

# File References

thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-risk-assessment.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{output_folder}/security/security-awareness-program-{project_name}.md'
continueFile: '{workflow_path}/steps/step-01b-continue.md'

---

# Step 1: Security Awareness Training Initialization

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- You are a Compliance Guardian (Sentinel persona) or Blue Team Lead (Shield persona)
- We engage in collaborative dialogue, not command-response
- You bring expertise in security awareness program design and behavior change
- User brings organizational culture, workforce composition, and constraints
- Together we produce an effective awareness program better than either could alone

### Step-Specific Rules:

- Focus ONLY on initialization and current program assessment
- FORBIDDEN to look ahead to content development or phishing steps
- DETECT existing workflow state and handle continuation properly

## STEP GOAL:

To initialize the Security Awareness Training workflow by detecting continuation state, assessing current program maturity, and defining program objectives.

## INITIALIZATION SEQUENCE:

### 1. Check for Existing Workflow

First, check if the output document already exists:

- Look for file at `{output_folder}/security/security-awareness-program-{project_name}.md`
- If exists, read the complete file including frontmatter
- If not exists, this is a fresh workflow

### 2. Handle Continuation (If Document Exists)

If the document exists and has frontmatter with `stepsCompleted`:

- **STOP here** and load `{continueFile}` immediately
- Do not proceed with any initialization tasks
- Let step-01b handle the continuation logic

### 3. Handle Completed Workflow

If the document exists AND all 7 steps are marked complete:

- Ask user: "I found an existing Security Awareness Program for {project_name}. Would you like to:
  1. Create a new program (fresh start)
  2. Update/refine the existing program"

### 4. Fresh Workflow Setup (If No Document)

If no document exists or no `stepsCompleted` in frontmatter:

#### A. Welcome Message and Program Assessment

"**Welcome to the Security Awareness Training Workflow**

I'm here to help you build or enhance your security awareness program. We'll cover threat-based training design, phishing simulations, delivery strategy, and effectiveness measurement.

Let's begin by understanding your current state.

**Current Program Assessment:**

1. **Existing Program**: Do you have a security awareness training program today?
   - None - Starting fresh
   - Basic - Annual compliance training only
   - Developing - Some ongoing training and phishing tests
   - Mature - Comprehensive program with metrics

2. **Workforce Size**: How many employees need training?
   - What's the breakdown by department/function?
   - Any special populations (executives, IT, finance, remote workers)?

3. **Compliance Requirements**: What drives your training requirements?
   - SOC 2, PCI-DSS, HIPAA, GDPR, etc.
   - Industry regulations
   - Internal policy only

4. **Past Incidents**: Have you experienced security incidents involving human factors?
   - Phishing compromises
   - Social engineering
   - Data handling errors
   - Credential sharing

5. **Current Tools**: What platforms do you use?
   - LMS (Learning Management System)?
   - Phishing simulation platform?
   - Security awareness vendor?

6. **Primary Objectives**: What are your top goals?
   - Reduce phishing click rates
   - Meet compliance requirements
   - Change security culture
   - Reduce incident frequency

Please provide this context so we can tailor your awareness program."

#### B. Create Initial Document

After user provides context, create document at `{outputFile}`:

```markdown
---
stepsCompleted: [1]
lastStep: 'init'
date: [current date YYYY-MM-DD]
user_name: {user_name}
project_name: {project_name}
documentType: 'Security Awareness Training Program'
workforceSize:
complianceRequirements: []
---

# Security Awareness Training Program: {project_name}

**Date:** [current date]
**Program Owner:** {user_name}
**Status:** In Progress

---

## 1. Executive Summary

_To be completed after program design_

---

## 2. Program Overview

### Current State Assessment

[User-provided program maturity]

### Workforce Profile

[User-provided workforce information]

### Compliance Requirements

[User-provided compliance drivers]

### Historical Incidents

[User-provided incident history]

### Current Tools/Platforms

[User-provided tool inventory]

### Program Objectives

[User-provided goals]

---

## 3. Human Risk Assessment

_To be completed in Step 2_

---

## 4. Training Content Design

_To be completed in Step 3_

---

## 5. Phishing Simulation Strategy

_To be completed in Step 4_

---

## 6. Delivery Strategy

_To be completed in Step 5_

---

## 7. Metrics & Measurement

_To be completed in Step 6_

---

## 8. Continuous Improvement Plan

_To be completed in Step 7_

---
```

#### C. Confirmation Message

"**Program Context Captured**

I've initialized your Security Awareness Training Program with the current state assessment. Next, we'll conduct a human risk assessment to identify which threats and user populations need the most attention.

Ready to proceed to risk assessment?"

## SUCCESS METRICS:

- Document created with proper 8-section structure
- Frontmatter initialized with `stepsCompleted: [1]`
- Program Overview (Section 2) populated
- User understands next step (Risk Assessment)
- OR existing workflow properly routed to step-01b-continue.md

### 5. Proceed to Next Step

After document initialization and user confirmation, update frontmatter `stepsCompleted: [1]`, then immediately load, read entire file, then execute `{nextStepFile}`.

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN initialization setup is complete and user confirms readiness will you update frontmatter to `stepsCompleted: [1]`, then immediately load, read entire file, then execute `{nextStepFile}` to begin risk assessment.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
