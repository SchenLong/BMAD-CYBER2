---

name: 'step-07-compliance-mapping'
description: 'Map assessment findings to compliance frameworks and identify gaps'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/cloud-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-07-compliance-mapping.md'
nextStepFile: '{workflow_path}/steps/step-08-remediation.md'
outputFile: '{output_folder}/security/cloud-security-assessment-{project_name}.md'

---

# Step 7: Compliance Mapping

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on compliance mapping
- FORBIDDEN to discuss remediation planning yet
- Use frameworks defined in Step 1

## STEP GOAL:

To map assessment findings to applicable compliance frameworks, identify compliance gaps, and document the compliance posture.

## COMPLIANCE MAPPING SEQUENCE:

### 1. Framework Selection Review

"Let's review your compliance requirements from Step 1:

**Frameworks in Scope:**
[Reference frameworks from Step 1]

For each framework, we'll map our security findings to relevant controls and identify gaps.

Which frameworks are highest priority for this assessment?"

### 2. CIS Benchmarks Mapping (if applicable)

"Let's map findings to CIS Benchmarks:

**CIS Benchmark Coverage:**

| CIS Section | Controls | Passed | Failed | N/A |
|-------------|----------|--------|--------|-----|
| 1 - Identity & Access | X controls | | | |
| 2 - Logging | X controls | | | |
| 3 - Monitoring | X controls | | | |
| 4 - Networking | X controls | | | |
| 5 - Storage | X controls | | | |

**Key CIS Findings:**

Based on our assessment:
- IAM findings map to CIS Section 1
- Logging findings map to CIS Section 2
- Network findings map to CIS Section 4
- Storage/encryption findings map to CIS Section 5

What's your target CIS compliance level? (Level 1, Level 2)"

### 3. SOC 2 Mapping (if applicable)

"Let's map to SOC 2 Trust Service Criteria:

**SOC 2 Coverage:**

| Category | Criteria | Relevant Findings |
|----------|----------|-------------------|
| Security (CC) | CC6.1-CC6.8 | IAM, Network, Compute |
| Availability (A) | A1.1-A1.2 | DDoS, HA design |
| Processing Integrity | PI1.1-PI1.5 | Data validation |
| Confidentiality (C) | C1.1-C1.2 | Encryption, DLP |
| Privacy (P) | P1-P8 | Data handling |

**Key SOC 2 Gaps:**

Based on our findings, these SOC 2 criteria have gaps:
[Map findings to SOC 2 criteria]"

### 4. Other Framework Mapping

"Let's map to other applicable frameworks:

**PCI-DSS (if applicable):**

| Requirement | Description | Status |
|-------------|-------------|--------|
| 1 | Install firewall | [Mapped findings] |
| 2 | No vendor defaults | [Mapped findings] |
| 3 | Protect cardholder data | [Mapped findings] |
| 7 | Restrict access | [Mapped findings] |
| 8 | Authenticate access | [Mapped findings] |
| 10 | Track access | [Mapped findings] |
| 11 | Test security | [Mapped findings] |

**HIPAA (if applicable):**

| Safeguard | Requirement | Status |
|-----------|-------------|--------|
| Administrative | Access management | [Mapped findings] |
| Physical | Workstation security | [Mapped findings] |
| Technical | Encryption, audit controls | [Mapped findings] |

**Other frameworks:**
[Map to FedRAMP, ISO 27001, NIST CSF as applicable]"

### 5. Compliance Gap Summary

"Let's summarize compliance gaps:

**Gap Analysis:**

| Framework | Total Controls | Compliant | Gaps | % Compliant |
|-----------|----------------|-----------|------|-------------|
| CIS Benchmark | | | | % |
| SOC 2 | | | | % |
| [Other] | | | | % |

**Critical Compliance Gaps:**

1. [Gap with highest compliance impact]
2. [Second priority gap]
3. [Third priority gap]

**Compliance Risk Assessment:**
- High risk gaps affecting multiple frameworks
- Gaps that could fail audits
- Quick wins that close multiple gaps"

### 6. Document Compliance Mapping

Update Section 8 of {outputFile}:

```markdown
## 8. Compliance Mapping

### 8.1 Framework Coverage Summary

| Framework | In Scope | Controls Evaluated | Compliant | Gaps |
|-----------|----------|-------------------|-----------|------|
| [User data] | | | | |

### 8.2 CIS Benchmark Mapping

**Benchmark Version:** [Version]
**Target Level:** [Level 1/2]

| Section | Description | Pass | Fail | N/A |
|---------|-------------|------|------|-----|
| 1 | Identity and Access Management | | | |
| 2 | Logging | | | |
| 3 | Monitoring | | | |
| 4 | Networking | | | |
| 5 | Storage | | | |

**Critical CIS Failures:**
| Control ID | Description | Finding | Remediation |
|------------|-------------|---------|-------------|
| [User data] | | | |

### 8.3 SOC 2 Mapping

| Trust Service Criteria | Status | Gaps | Evidence |
|------------------------|--------|------|----------|
| Security (CC) | [Pass/Partial/Fail] | [Details] | [Reference] |
| Availability (A) | [Pass/Partial/Fail] | [Details] | [Reference] |
| Confidentiality (C) | [Pass/Partial/Fail] | [Details] | [Reference] |

### 8.4 Additional Framework Mapping

[Framework-specific tables as applicable]

### 8.5 Compliance Gap Summary

| Gap Category | Count | Highest Severity | Frameworks Affected |
|--------------|-------|------------------|---------------------|
| IAM | | | |
| Network | | | |
| Data Protection | | | |
| Logging | | | |
| Compute | | | |

### 8.6 Compliance Recommendations

**Priority 1 - Audit Failures:**
[Gaps that would fail compliance audits]

**Priority 2 - Multi-Framework Gaps:**
[Gaps affecting multiple frameworks]

**Priority 3 - Quick Wins:**
[Low-effort high-compliance-impact fixes]
```

### 7. Confirmation and Next Step

"**Compliance Mapping Complete**

I've mapped findings to compliance frameworks:
- [X] frameworks evaluated
- [X] total controls assessed
- [X] compliance gaps identified
- Prioritized compliance recommendations

Next, we'll create the remediation roadmap.

Ready to proceed to remediation planning?"

## MENU

Display: **Compliance Mapping Complete - Select an Option:** [C] Continue to Remediation Planning [R] Review/Revise Mapping

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 8 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN compliance mapping is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
