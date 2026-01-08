---
name: 'step-01-init'
description: 'Initialize compliance audit preparation workflow with framework selection and scope definition'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/compliance-audit-prep'

# File References
thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-control-inventory.md'
continueFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/compliance/audit-prep-{framework}-{project_name}.md'
---

# Step 1: Initialization & Framework Selection

## STEP GOAL:

To initialize the compliance audit preparation workflow, select target compliance framework(s), define audit scope, and create the initial audit preparation document.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Compliance and Governance Expert (Sentinel persona)
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring compliance framework expertise, user brings organizational context
- ✅ Maintain professional, systematic, compliance-focused tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on framework selection and scope definition
- 🚫 FORBIDDEN to perform gap assessment in this step
- 💬 Handle initialization professionally and systematically
- 🚪 DETECT existing workflow state and handle continuation

## INITIALIZATION SEQUENCE:

### 1. Check for Existing Workflow

First, check if an audit preparation document already exists:

- Look for files matching `{output_folder}/compliance/audit-prep-*-{project_name}.md`
- If exists, read complete file including frontmatter
- If not exists, this is fresh workflow

### 2. Handle Continuation

If document exists with `stepsCompleted`:

**Check stepsCompleted array:**

- If `stepsCompleted` exists and not empty → **STOP and load `{continueFile}`**
- Do not proceed with initialization
- Let step-01b handle continuation

### 3. Handle Completed Workflow

If document exists AND `workflowComplete: true`:

Ask: "I found a completed audit preparation from {date}. Would you like to:
1. Create new audit preparation
2. Update/modify existing audit preparation"

- If option 1: Create new document with timestamp
- If option 2: Load `{continueFile}`

### 4. Fresh Workflow Setup

If no document or no stepsCompleted:

#### A. Welcome and Framework Selection

Display:

"**Welcome to Compliance Audit Preparation**

I'll guide you through preparing for compliance audits using industry-standard frameworks.

**Supported Frameworks:**

**Global Standards:**
- **NIST 800-53** - Federal information security controls
- **ISO 27001** - Information security management
- **CIS Controls v8** - Center for Internet Security critical controls

**US Regulations:**
- **SOC 2 Type II** - Service organization controls (Trust Services Criteria)
- **PCI-DSS** - Payment card industry data security standard
- **HIPAA** - Healthcare information privacy and security
- **FedRAMP** - Federal cloud security
- **CMMC** - Cybersecurity Maturity Model Certification (defense contractors)

**EU Regulations:**
- **GDPR** - General Data Protection Regulation
- **NIS2 Directive** - Network and Information Security (critical infrastructure)
- **CRA** - Cyber Resilience Act (product security)
- **CSA** - Cyber Security Act (EU cybersecurity certification)
- **DORA** - Digital Operational Resilience Act (financial sector)
- **AI Act** - EU Artificial Intelligence Act (AI system compliance)

**Industry-Specific:**
- **TISAX** - Trusted Information Security Assessment Exchange (automotive)
- **SWIFT CSP** - Customer Security Programme (financial messaging)
- **NERC CIP** - Critical Infrastructure Protection (energy sector)

**Cloud & SaaS:**
- **CSA STAR** - Cloud Security Alliance Security Trust Assurance
- **ISO 27017** - Cloud services information security
- **ISO 27018** - Cloud privacy

Let's start by selecting your audit framework."

"**Which compliance framework(s) are you preparing for?**

You can select one or multiple frameworks (common for organizations to maintain multiple certifications).

Examples:
- Single: 'SOC 2 Type II'
- Multiple: 'SOC 2 Type II, HIPAA'
- Multiple: 'NIST 800-53, FedRAMP'

Select framework(s):"

Collect: **Framework(s)**

#### B. Audit Context

"**Audit Context**

**1. Audit Type**

Is this:
- Initial certification audit (first time achieving certification)
- Recertification audit (maintaining existing certification)
- Surveillance audit (periodic compliance check)
- Pre-audit readiness assessment

Select audit type:"

Collect: **Audit Type**

"**2. Audit Timeline**

When is the audit scheduled?

- Audit start date (MM/DD/YYYY)
- Expected audit duration (days)
- Preparation time available (weeks until audit)

Provide timeline information:"

Collect: **Audit Timeline**

"**3. Auditor Information** (if known)

- Audit firm/organization
- Lead auditor name (if known)
- Auditor requirements or focus areas (if known)

Provide auditor details (or 'Unknown'):"

Collect: **Auditor Info**

#### C. Scope Definition

"**Audit Scope Definition**

**Systems in Scope:**

Which systems, applications, or services are included in the audit scope?

Examples:
- 'Production web application, API, database infrastructure'
- 'All AWS cloud infrastructure'
- 'Customer data processing systems'

List all systems in scope:"

Collect: **Systems in Scope**

"**Data in Scope:**

What types of data are covered by this compliance requirement?

Examples:
- 'Customer PII, payment card data'
- 'Protected health information (PHI)'
- 'EU resident personal data'

Describe data in scope:"

Collect: **Data in Scope**

"**Organizational Scope:**

What organizational units, teams, or locations are in scope?

Examples:
- 'Engineering, Security, IT Operations'
- 'Headquarters and 2 regional offices'
- 'All remote employees accessing customer data'

Define organizational scope:"

Collect: **Organizational Scope**

"**Exclusions:**

Are there any explicit exclusions from the audit scope?

Examples:
- 'Development/test environments'
- 'Legacy system being decommissioned'
- 'Third-party managed services'

List exclusions (or 'None'):"

Collect: **Exclusions**

#### D. Create Initial Audit Preparation Document

Determine primary framework for filename (if multiple selected).

Create `{outputFile}` (using primary framework):

```markdown
---
stepsCompleted: [1]
lastStep: 'init'
frameworks: ['{framework-list}']
primaryFramework: '{primary-framework}'
auditType: '{audit-type}'
auditDate: '{audit-date}'
preparationWeeks: {weeks}
systemsInScope: ['{system-list}']
dataInScope: '{data-types}'
organizationalScope: '{org-scope}'
exclusions: '{exclusions}'
workflowComplete: false
date: '{current-date}'
user_name: '{user_name}'
---

# Compliance Audit Preparation: {primary-framework}

**Organization:** {project_name}
**Date:** {current-date}
**Prepared by:** {user_name}
**Audit Date:** {audit-date}
**Audit Type:** {audit-type}

---

## 1. Audit Overview

### 1.1 Framework(s)

{list-all-selected-frameworks}

### 1.2 Audit Context

**Audit Type:** {audit-type}
**Auditor:** {auditor-info}
**Timeline:** {audit-timeline}

### 1.3 Scope Definition

**Systems in Scope:**
{systems-list}

**Data in Scope:**
{data-description}

**Organizational Scope:**
{org-scope-description}

**Exclusions:**
{exclusions-list}

---
```

#### E. Confirm and Proceed

Display:

"**Audit Preparation Initialized**

Framework: {frameworks}
Audit Type: {audit-type}
Audit Date: {audit-date}
Systems in Scope: {count} systems

Proceeding to control inventory..."

### 5. Route to Next Step

Immediately load, read entire file, then execute `{nextStepFile}` to begin control inventory.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Document created with audit overview (Section 1)
- Framework(s) selected
- Audit context captured
- Scope clearly defined
- Frontmatter initialized with stepsCompleted: [1]
- Ready for control inventory (step 2)
- OR existing workflow routed to step-01b-continue

### ❌ SYSTEM FAILURE:

- Proceeding without framework selection
- Not checking for existing documents
- Creating duplicate documents
- Skipping scope definition
- Not routing to continuation when appropriate

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN initialization is complete and document created (OR continuation routed) will you immediately load, read entire file, then execute `{nextStepFile}` to begin control inventory.
