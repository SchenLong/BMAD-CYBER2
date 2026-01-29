---
name: step-05b-compliance-validation
description: Cross-module compliance validation for contracts - brings in Security compliance and Policy alignment perspectives

outputFile: '{output_folder}/legal/contract-review-{contract_name}.md'
nextStepFile: './step-06-jurisdiction.md'
previousStepFile: './step-05-risk.md'

# Cross-module integration
partyModePresetsFile: '{project-root}/_bmad/core/workflows/party-mode/presets/cross-module-groups.yaml'
recommendedPreset: 'contract-review-party'
---

# Step 5b: Compliance Validation (Cross-Module)

## STEP GOAL:

After analyzing risk allocation provisions, validate the contract against security compliance requirements (Sentinel) and organizational policy alignment (Augustus) to ensure the contract supports rather than undermines compliance posture.

### When to Invoke:

This step should be offered after Step 5 (Risk Allocation) when ANY of:
- Contract involves data processing or sharing
- Contract with technology vendor or service provider
- Contract requires security representations or warranties
- Organization has active compliance frameworks (SOC2, ISO27001, GDPR, HIPAA, PCI-DSS)
- Contract could affect audit scope or compliance posture

---

## EXECUTION PROTOCOLS:

### 1. Introduction to Compliance Validation

**Covenant introduction:**

"Before we proceed to jurisdiction-specific review, I'm recommending we validate this contract against compliance requirements.

Contracts with vendors, data processors, or technology providers often have compliance implications that legal review alone may miss:

- **Security compliance requirements** (SOC2, ISO27001, etc.)
- **Regulatory data handling requirements** (GDPR, HIPAA, PCI-DSS)
- **Organizational policy alignment**

Let me bring in our compliance experts."

### 2. Activate Cross-Module Team

**Load the contract-review-party preset:**

"Activating compliance validation team:

**Sentinel** (Compliance Guardian, cybersec-team)
- Will assess security compliance requirements
- Identifies missing security clauses and compliance gaps
- Validates against organizational security standards

**Augustus** (Policy Analyst, strategy-team)
- Will assess organizational policy alignment
- Identifies policy conflicts or gaps
- Ensures contract supports governance objectives

Together with my legal analysis, we'll ensure this contract is compliance-ready."

### 3. Security Compliance Validation (Sentinel)

**Sentinel's assessment:**

"**Sentinel here.** Reviewing from security compliance perspective:

**Applicable Compliance Frameworks:**
Based on the contract type and parties, these frameworks apply:
- [ ] SOC 2 Type II
- [ ] ISO 27001
- [ ] GDPR (data processing)
- [ ] HIPAA (if PHI involved)
- [ ] PCI-DSS (if payment data)
- [ ] [Other: ____________]

**Security Clause Assessment:**

| Requirement | Present | Adequate | Gap/Issue |
|-------------|---------|----------|-----------|
| Data encryption (transit) | [Y/N] | [Y/N] | [gap] |
| Data encryption (rest) | [Y/N] | [Y/N] | [gap] |
| Access controls | [Y/N] | [Y/N] | [gap] |
| Audit rights | [Y/N] | [Y/N] | [gap] |
| Incident notification | [Y/N] | [Y/N] | [gap] |
| Subprocessor controls | [Y/N] | [Y/N] | [gap] |
| Data retention/deletion | [Y/N] | [Y/N] | [gap] |
| Security certifications | [Y/N] | [Y/N] | [gap] |
| Vulnerability management | [Y/N] | [Y/N] | [gap] |
| Business continuity | [Y/N] | [Y/N] | [gap] |

**Vendor Security Assessment:**
If this is a vendor contract:
- Do they have SOC 2 report? [Y/N/Unknown]
- Do they have ISO 27001? [Y/N/Unknown]
- Security questionnaire completed? [Y/N]
- Penetration test results available? [Y/N]

**Compliance Red Flags:**
1. [Any critical compliance gaps]
2. [Any clauses that could affect our compliance posture]
3. [Any missing required provisions]

**Required Additions for Compliance:**
1. [Specific clause to add]
2. [Specific modification needed]
3. [Specific exhibit/schedule required]

**Compliance Recommendation:** [Acceptable/Needs Modification/High Risk]"

### 4. Policy Alignment Validation (Augustus)

**Augustus's assessment:**

"**Augustus here.** Reviewing from organizational policy perspective:

**Applicable Policies:**
This contract should align with:
- [ ] Vendor Management Policy
- [ ] Data Classification Policy
- [ ] Information Security Policy
- [ ] Acceptable Use Policy
- [ ] Privacy Policy
- [ ] [Other: ____________]

**Policy Alignment Assessment:**

| Policy Area | Contract Alignment | Gap/Conflict |
|-------------|-------------------|--------------|
| Vendor due diligence | [Aligned/Gap/Conflict] | [detail] |
| Data handling standards | [Aligned/Gap/Conflict] | [detail] |
| Security requirements | [Aligned/Gap/Conflict] | [detail] |
| Subcontractor approval | [Aligned/Gap/Conflict] | [detail] |
| Exit/transition | [Aligned/Gap/Conflict] | [detail] |
| Monitoring/oversight | [Aligned/Gap/Conflict] | [detail] |

**Governance Considerations:**
- Does this contract require governance approval? [Y/N]
- Approval level required: [Department/Executive/Board]
- Ongoing oversight requirements: [describe]

**Policy Red Flags:**
1. [Any policy violations]
2. [Any governance gaps]
3. [Any approval requirements not addressed]

**Policy Recommendation:** [Aligned/Needs Adjustment/Policy Conflict]"

### 5. Synthesize Compliance Validation

**Covenant synthesis:**

"Let me synthesize the compliance validation with my legal analysis:

**Compliance Summary:**

| Domain | Status | Priority Issues |
|--------|--------|-----------------|
| Security Compliance | [✓/⚠/✗] | [summary] |
| Policy Alignment | [✓/⚠/✗] | [summary] |
| Legal Requirements | [✓/⚠/✗] | [summary] |

**Combined Gap Analysis:**

| Gap | Source | Priority | Recommended Action |
|-----|--------|----------|-------------------|
| [gap 1] | [Security/Policy/Legal] | [H/M/L] | [action] |
| [gap 2] | [Security/Policy/Legal] | [H/M/L] | [action] |
| [gap 3] | [Security/Policy/Legal] | [H/M/L] | [action] |

**Contract Readiness Assessment:**
- [ ] Ready to proceed (minor issues only)
- [ ] Modifications required before execution
- [ ] Significant issues - recommend renegotiation
- [ ] High risk - recommend do not proceed

**Required Contract Additions:**
Based on compliance validation, these must be added:
1. [Required addition 1]
2. [Required addition 2]
3. [Required addition 3]"

### 6. Generate Compliance Checklist

**Create actionable checklist:**

"**Pre-Execution Compliance Checklist:**

**Security Requirements:**
- [ ] [Requirement 1] - [status]
- [ ] [Requirement 2] - [status]
- [ ] [Requirement 3] - [status]

**Policy Requirements:**
- [ ] [Requirement 1] - [status]
- [ ] [Requirement 2] - [status]

**Documentation Required:**
- [ ] [Document 1] - [status]
- [ ] [Document 2] - [status]

**Approvals Required:**
- [ ] [Approval 1] - [status]
- [ ] [Approval 2] - [status]"

### 7. User Decision Point

**Present options:**

"{user_name}, the compliance validation has identified [X] items requiring attention:

**Critical (Must Address):** [count]
**Important (Should Address):** [count]
**Advisory (Consider):** [count]

**Select:**
[D] Discuss specific gaps with compliance team
[P] Party Mode - Full discussion with all validators
[G] Generate compliance addendum language
[C] Continue to Jurisdiction Review (with gaps noted)"

### 8. Update Output File

**Append to {outputFile}:**

```markdown
## Cross-Module Compliance Validation

### Security Compliance Assessment (Sentinel)
**Applicable Frameworks:** [list]

**Compliance Gaps:**
| Requirement | Status | Action Required |
|-------------|--------|-----------------|
[gaps table]

**Security Recommendation:** [assessment]

### Policy Alignment Assessment (Augustus)
**Applicable Policies:** [list]

**Policy Alignment:**
| Policy Area | Status | Action Required |
|-------------|--------|-----------------|
[alignment table]

**Policy Recommendation:** [assessment]

### Combined Compliance Summary
**Contract Readiness:** [assessment]

**Required Actions Before Execution:**
1. [action]
2. [action]

**Pre-Execution Checklist:**
[checklist]
```

Update frontmatter: add `step-05b-compliance-validation` to stepsCompleted

### 9. Proceed to Jurisdiction Review

When user selects [C], load and execute {nextStepFile} (step-06-jurisdiction.md) with compliance validation incorporated.

---

## SUCCESS METRICS:

- Both Security and Policy perspectives provided assessment
- All applicable compliance frameworks identified
- Gaps clearly documented with priority
- Actionable checklist generated
- Contract readiness assessment provided
- User understands compliance implications

## FAILURE INDICATORS:

- Missing obvious compliance requirements
- Not identifying applicable frameworks
- Proceeding without addressing critical gaps
- Not generating actionable remediation steps
