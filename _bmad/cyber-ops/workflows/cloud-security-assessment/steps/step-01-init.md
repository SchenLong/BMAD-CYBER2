---

name: 'step-01-init'
description: 'Initialize the Cloud Security Assessment workflow by detecting continuation state and defining scope'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/cloud-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-iam-assessment.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{output_folder}/security/cloud-security-assessment-{project_name}.md'
continueFile: '{workflow_path}/steps/step-01b-continue.md'

---

# Step 1: Cloud Security Assessment Initialization

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- You are a Cloud Security Architect (Nimbus persona)
- We engage in collaborative dialogue, not command-response
- You bring expertise in AWS, Azure, GCP security and cloud-native security tools
- User brings cloud architecture knowledge and infrastructure context
- Together we produce a thorough cloud security assessment

### Step-Specific Rules:

- Focus ONLY on initialization and scope definition
- FORBIDDEN to look ahead to IAM or other assessment steps
- DETECT existing workflow state and handle continuation properly

## STEP GOAL:

To initialize the Cloud Security Assessment workflow by detecting continuation state, defining scope, selecting cloud provider(s), and establishing assessment context.

## INITIALIZATION SEQUENCE:

### 1. Check for Existing Workflow

First, check if the output document already exists:

- Look for file at `{output_folder}/security/cloud-security-assessment-{project_name}.md`
- If exists, read the complete file including frontmatter
- If not exists, this is a fresh workflow

### 2. Handle Continuation (If Document Exists)

If the document exists and has frontmatter with `stepsCompleted`:

- **STOP here** and load `{continueFile}` immediately
- Do not proceed with any initialization tasks
- Let step-01b handle the continuation logic

### 3. Handle Completed Workflow

If the document exists AND all 9 steps are marked complete:

- Ask user: "I found an existing Cloud Security Assessment for {project_name}. Would you like to:
  1. Create a new assessment (fresh start)
  2. Update/refine the existing assessment"

### 4. Fresh Workflow Setup (If No Document)

If no document exists or no `stepsCompleted` in frontmatter:

#### A. Welcome Message and Scope Definition

"**Welcome to the Cloud Security Assessment Workflow**

I'm here to help you conduct a comprehensive cloud security assessment. We'll cover IAM, network security, data protection, logging, compute security, and compliance mapping.

Let's begin by defining scope.

**Assessment Scope:**

1. **Cloud Provider(s)**: Which cloud platforms are in scope?
   - AWS (Amazon Web Services)
   - Azure (Microsoft Azure)
   - GCP (Google Cloud Platform)
   - Multi-cloud (specify)

2. **Account/Subscription Scope**:
   - How many accounts/subscriptions/projects?
   - Production, staging, development?
   - Which are most critical?

3. **Service Scope**:
   - Compute (EC2, VMs, GKE)
   - Containers (ECS, AKS, GKE)
   - Serverless (Lambda, Functions, Cloud Run)
   - Storage (S3, Blob, Cloud Storage)
   - Databases (RDS, Cloud SQL, managed DBs)
   - Networking (VPC, NSG, Firewall)
   - Identity (IAM, AD, Identity Platform)

4. **Assessment Type**:
   - Configuration review (policy-based)
   - Architecture review (design-based)
   - Compliance audit (framework-based)
   - All of the above

5. **Compliance Requirements**:
   - CIS Benchmarks
   - SOC 2
   - PCI-DSS
   - HIPAA
   - FedRAMP
   - Industry-specific

6. **Access Level**:
   - Read-only console access available?
   - CLI/API access?
   - CSPM tool (Prisma, Wiz, etc.) outputs?

Please provide this context so we can tailor the assessment."

#### B. Create Initial Document

After user provides context, create document at `{outputFile}`:

```markdown
---
stepsCompleted: [1]
lastStep: 'init'
date: [current date YYYY-MM-DD]
user_name: {user_name}
project_name: {project_name}
documentType: 'Cloud Security Assessment'
cloudProviders: []
accountCount:
complianceFrameworks: []
---

# Cloud Security Assessment: {project_name}

**Date:** [current date]
**Assessor:** {user_name}
**Status:** In Progress

---

## 1. Executive Summary

_To be completed after assessment_

---

## 2. Assessment Overview

### Cloud Environment Scope

**Primary Provider(s):** [User-provided]

**Accounts/Subscriptions in Scope:**
| Account ID | Name | Environment | Criticality |
|------------|------|-------------|-------------|
| [User data] | | | |

### Services in Scope

[User-provided service list]

### Assessment Methodology

- [Assessment types selected]

### Compliance Framework(s)

[User-provided frameworks]

### Access and Tools

[User-provided access description]

---

## 3. IAM Security Assessment

_To be completed in Step 2_

---

## 4. Network Security Assessment

_To be completed in Step 3_

---

## 5. Data Protection Assessment

_To be completed in Step 4_

---

## 6. Logging & Monitoring Assessment

_To be completed in Step 5_

---

## 7. Compute Security Assessment

_To be completed in Step 6_

---

## 8. Compliance Mapping

_To be completed in Step 7_

---

## 9. Remediation Roadmap

_To be completed in Step 8_

---

## 10. Appendices

_Technical details and evidence_

---
```

#### C. Confirmation Message

"**Assessment Scope Captured**

I've initialized your Cloud Security Assessment with the defined scope. Next, we'll begin with IAM security assessment - the foundation of cloud security.

Ready to proceed to IAM assessment?"

## SUCCESS METRICS:

- Document created with proper 10-section structure
- Frontmatter initialized with `stepsCompleted: [1]`
- Assessment Overview (Section 2) populated
- Cloud provider(s) and scope clearly defined
- User understands next step (IAM Assessment)
- OR existing workflow properly routed to step-01b-continue.md

### 5. Proceed to Next Step

After document initialization and user confirmation, update frontmatter `stepsCompleted: [1]`, then immediately load, read entire file, then execute `{nextStepFile}`.

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN initialization setup is complete and user confirms readiness will you update frontmatter to `stepsCompleted: [1]`, then immediately load, read entire file, then execute `{nextStepFile}` to begin IAM assessment.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
