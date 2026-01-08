---
name: 'step-02-control-inventory'
description: 'Document existing security controls and map to framework requirements'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/compliance-audit-prep'

# File References
thisStepFile: '{workflow_path}/steps/step-02-control-inventory.md'
nextStepFile: '{workflow_path}/steps/step-03-gap-assessment.md'
outputFile: '{output_folder}/compliance/audit-prep-{framework}-{project_name}.md'

# Task References
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
brainstormingTask: '{project-root}/_bmad/core/tasks/brainstorming.xml'
---

# Step 2: Control Inventory

## STEP GOAL:

To document all existing security controls and map them to the target compliance framework requirements.

## MANDATORY EXECUTION RULES:

- 🛑 NEVER generate controls without user input
- 📖 Read complete step before acting
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ Speak in {communication_language}

## CONTROL INVENTORY PROCESS:

### 1. Initialize Control Inventory

Load {outputFile} to review framework and scope.

Display:

"**Control Inventory**

**Framework:** {primaryFramework}

We'll now document your existing security controls and map them to framework requirements.

**Control Categories (by framework):**

{framework-specific-control-categories}

Let's systematically inventory your controls."

### 2. Framework-Specific Control Mapping

#### For SOC 2 Type II:

**Trust Services Criteria:**
- CC (Common Criteria): Governance, risk, monitoring
- A (Availability): System availability and performance
- C (Confidentiality): Confidential information protection
- P (Privacy): Personal information handling
- PI (Processing Integrity): Complete, valid, accurate processing

#### For NIST 800-53:

**Control Families:**
- AC (Access Control)
- AU (Audit and Accountability)
- AT (Awareness and Training)
- CM (Configuration Management)
- CP (Contingency Planning)
- IA (Identification and Authentication)
- IR (Incident Response)
- MA (Maintenance)
- MP (Media Protection)
- PS (Personnel Security)
- PE (Physical and Environmental Protection)
- PL (Planning)
- RA (Risk Assessment)
- CA (Assessment and Authorization)
- SC (System and Communications Protection)
- SI (System and Information Integrity)

#### For PCI-DSS:

**Requirements:**
1. Install and maintain firewall configuration
2. Do not use vendor-supplied defaults
3. Protect stored cardholder data
4. Encrypt transmission of cardholder data
5. Protect systems against malware
6. Develop and maintain secure systems
7. Restrict access by business need-to-know
8. Identify and authenticate access
9. Restrict physical access to cardholder data
10. Track and monitor network access
11. Regularly test security systems
12. Maintain information security policy

#### For HIPAA:

**Safeguards:**
- Administrative Safeguards (Security Management, Workforce Security, etc.)
- Physical Safeguards (Facility Access, Workstation Security, etc.)
- Technical Safeguards (Access Control, Audit Controls, Integrity, Transmission Security)

#### For GDPR:

**Principles:**
- Lawfulness, fairness, transparency
- Purpose limitation
- Data minimization
- Accuracy
- Storage limitation
- Integrity and confidentiality
- Accountability

#### For NIS2 (EU):

**Security Measures:**
- Risk management
- Incident handling
- Business continuity
- Supply chain security
- Network security
- Access control
- Asset management
- Cryptography
- Human resources security
- Multi-factor authentication

#### For CRA (Cyber Resilience Act):

**Essential Requirements:**
- Secure by design and default
- Vulnerability handling
- Security updates
- Cybersecurity risk assessments
- Software bill of materials (SBOM)
- CE marking compliance

### 3. Collect Existing Controls

For each relevant control category:

"**{Control Category Name}**

**Framework Requirement:**
{describe-what-framework-requires}

**Current Implementation:**

Do you have controls in place for this requirement?

If YES:
- Control name/identifier
- Description of how it's implemented
- Who owns this control (team/person)
- Evidence available (policies, logs, configs, etc.)
- Control effectiveness (Effective/Partially Effective/Ineffective)

If NO:
- Mark as 'Not Implemented'

Describe your current controls for {category}:"

Collect for each category:
- Control ID
- Control description
- Owner
- Evidence sources
- Effectiveness rating

### 4. Technical Controls Deep Dive

"**Technical Control Validation**

For technical controls (firewalls, encryption, access management, etc.), would you like to collaborate with Bastion (Security Architect) for detailed technical control review?

[Y] Yes - Invoke Bastion for architecture control validation
[N] No - Continue with self-assessment

Select (Y/N):"

IF YES:
Execute Party Mode with Bastion agent for technical control validation.

### 5. Document Control Inventory

Compile complete control inventory:

**Control Matrix Format:**

| Control ID | Framework Req | Control Description | Owner | Evidence | Effectiveness | Status |
|------------|---------------|---------------------|-------|----------|---------------|---------|
| {id} | {req} | {desc} | {owner} | {evidence} | {rating} | {implemented/partial/missing} |

### 6. Append Section 2 to Document

Update {outputFile}:

```markdown

---

## 2. Control Inventory

### 2.1 Control Mapping Matrix

{control-matrix-table}

### 2.2 Control Summary by Category

**{Framework} Coverage:**

{for-each-category}:
- **{Category Name}:** {implemented-count}/{total-count} controls ({percentage}%)
  - Effective: {effective-count}
  - Partially Effective: {partial-count}
  - Not Implemented: {missing-count}

**Overall Control Coverage:** {total-implemented}/{total-required} ({percentage}%)

### 2.3 Evidence Sources

{list-all-evidence-sources-by-control}

### 2.4 Control Ownership

{list-controls-by-owner}

---
```

### 7. Update Frontmatter

```yaml
stepsCompleted: [1, 2]
lastStep: 'control-inventory'
totalControls: {count}
implementedControls: {count}
coveragePercentage: {percentage}
```

### 8. Present MENU OPTIONS

Display: **Select an Option:** [B] Brainstorming [P] Party Mode [C] Continue to Gap Assessment

#### Menu Handling:

- IF B: Execute {brainstormingTask} - "Help identify additional controls we may have missed"
- IF P: Execute {partyModeWorkflow} - "Review control inventory for completeness"
- IF C: Update frontmatter, load {nextStepFile}

---

## 🚨 SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- All relevant control categories inventoried
- Controls mapped to framework requirements
- Ownership assigned
- Evidence sources documented
- Effectiveness ratings provided
- Section 2 appended to document

### ❌ FAILURE:
- Skipping control categories
- Not collecting evidence sources
- Missing effectiveness ratings
- Not mapping to framework requirements

**Master Rule:** Complete all controls inventory before proceeding.
