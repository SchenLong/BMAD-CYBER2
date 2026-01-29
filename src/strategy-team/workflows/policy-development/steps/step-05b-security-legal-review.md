---
name: step-05b-security-legal-review
description: Cross-module security and legal review for policy enforceability and compliance alignment

outputFile: '{output_folder}/policies/policy-{name}.md'
nextStepFile: './step-06-draft-policy.md'
previousStepFile: './step-05-reform-perspective.md'

# Cross-module integration
partyModePresetsFile: '{project-root}/_bmad/core/workflows/party-mode/presets/cross-module-groups.yaml'
recommendedPreset: 'policy-validation-board'
---

# Step 5b: Cross-Module Security & Legal Policy Review

## STEP GOAL:

Before drafting the final policy, validate through cross-module expertise to ensure the policy is enforceable, compliant with regulations, and doesn't create security vulnerabilities or legal exposure. This step brings in dedicated Security, Legal, and Compliance perspectives.

### When to Invoke:

This step should be offered after Step 5 (Reform Perspective) when ANY of:
- Policy affects data handling, privacy, or information security
- Policy creates compliance or regulatory obligations
- Policy involves access controls, authentication, or authorization
- Policy has employment law implications
- Policy creates contractual obligations or liabilities
- Policy will require legal enforcement or disciplinary measures
- Policy affects multiple jurisdictions

---

## EXECUTION PROTOCOLS:

### 1. Introduction to Cross-Module Review

**Facilitator introduction:**

"{user_name}, before we draft the final policy, I recommend cross-module validation.

We've gathered strategic perspectives from Augustus, Sophia, Burke, and Maximilien. But policies live in the real world where they must be:
- **Enforceable** - Can we actually implement and monitor this?
- **Legal** - Does it comply with regulations and avoid liability?
- **Secure** - Does it strengthen or weaken our security posture?
- **Compliant** - Does it align with our compliance frameworks?

Let me bring in cross-module expertise to review our draft direction."

### 2. Offer Review

**Present the option:**

"Do you want cross-module security and legal review of this policy?

This is particularly important for policies involving:
- Data or information handling
- Employee conduct with legal implications
- Technology or system access
- Third-party relationships
- Regulatory compliance areas

**Select:**
[R] Review - run cross-module validation
[S] Skip - proceed to draft policy"

**IF S: Skip to Continue**
**IF R: Continue with review**

### 3. Activate Cross-Module Team

**Load the policy-validation-board:**

"Activating cross-module policy validation team:

**Bastion** (Security Architect, cybersec-team)
- Will assess security implications
- Review access control requirements
- Identify security enforcement needs

**Sentinel** (Compliance Guardian, cybersec-team)
- Will map to compliance frameworks
- Assess audit implications
- Identify compliance gaps or overlaps

**Covenant** (Contract Specialist, legal-team)
- Will review for legal enforceability
- Assess employment law implications
- Identify liability exposure

**Sophia** (Ethics Advisor, strategy-team)
- Already provided ethics input - will synthesize with legal/compliance"

### 4. Security Review (Bastion)

**Bastion's security assessment:**

"**Bastion here.** Let me review the security implications of this policy...

**Security Impact Assessment:**

| Policy Element | Security Impact | Risk | Recommendation |
|----------------|-----------------|------|----------------|
| [Requirement 1] | [strengthens/weakens/neutral] | [L/M/H] | [adjust/maintain] |
| [Requirement 2] | [strengthens/weakens/neutral] | [L/M/H] | [adjust/maintain] |
| [Requirement 3] | [strengthens/weakens/neutral] | [L/M/H] | [adjust/maintain] |

**Access Control Requirements:**
- Does this policy create new access requirements? [Y/N]
- Can access be technically enforced? [Y/N]
- What systems need to change? [list]

**Data Protection Implications:**
- Does this affect data handling? [Y/N]
- Classification requirements: [if applicable]
- Encryption/protection needs: [if applicable]

**Monitoring & Enforcement:**
- Can violations be detected? [Y/N]
- What monitoring is needed? [list]
- Is logging adequate? [Y/N]

**Security-Related Policy Language Needed:**
1. [Specific security clause to add]
2. [Specific security clause to add]

**Security Architecture Impacts:**
- Systems requiring modification: [list]
- Implementation complexity: [L/M/H]
- Security budget implications: [$estimate if material]"

### 5. Compliance Review (Sentinel)

**Sentinel's compliance assessment:**

"**Sentinel here.** Let me map this policy to our control framework...

**Compliance Framework Alignment:**

| Framework | Relevant Controls | Alignment | Gaps |
|-----------|------------------|-----------|------|
| SOC 2 | [control IDs] | [Full/Partial/None] | [gap details] |
| ISO 27001 | [control IDs] | [Full/Partial/None] | [gap details] |
| GDPR | [articles] | [Full/Partial/None] | [gap details] |
| [Industry-specific] | [requirements] | [Full/Partial/None] | [gap details] |

**Regulatory Compliance Check:**
- Employment regulations: [compliant/needs review]
- Data protection laws: [compliant/needs review]
- Industry regulations: [compliant/needs review]

**Audit Implications:**
- Evidence this policy creates: [list]
- Documentation requirements: [list]
- Audit trail needs: [list]

**Compliance Overlaps/Conflicts:**
- Existing policies this affects: [list]
- Potential conflicts: [identify]
- Integration recommendations: [suggestions]

**Required Compliance Language:**
1. [Compliance clause to add]
2. [Compliance clause to add]

**Compliance Calendar Impact:**
- New compliance activities created: [list]
- Review frequency recommendation: [annual/etc.]"

### 6. Legal Review (Covenant)

**Covenant's legal assessment:**

"**Covenant here.** Let me assess legal enforceability...

**Enforceability Assessment:**

| Policy Element | Enforceable? | Legal Risk | Required Changes |
|----------------|--------------|------------|------------------|
| [Requirement 1] | [Yes/Partial/No] | [L/M/H] | [changes needed] |
| [Requirement 2] | [Yes/Partial/No] | [L/M/H] | [changes needed] |
| [Requirement 3] | [Yes/Partial/No] | [L/M/H] | [changes needed] |

**Employment Law Implications:**
- Employee rights affected: [list]
- Reasonable accommodation needs: [Y/N]
- Disciplinary framework adequate: [Y/N]
- Union/works council consultation needed: [Y/N - jurisdictions]

**Liability Exposure:**
- Potential liability areas: [list]
- Indemnification needs: [list]
- Insurance implications: [if any]

**Contractual Implications:**
- Third-party contract impacts: [list]
- Vendor agreement needs: [list]
- Customer agreement impacts: [list]

**Legal Language Requirements:**
1. [Required legal disclaimer]
2. [Required definition for legal clarity]
3. [Required procedural protection]

**Jurisdictional Considerations:**
- Multi-jurisdiction compliance: [assessment]
- Country-specific variations needed: [Y/N - where]

**Legal Approval Path:**
- Legal review required before adoption: [Y/N]
- Employment counsel review needed: [Y/N]
- External counsel needed: [Y/N - why]"

### 7. Ethics-Legal Synthesis (Sophia)

**Sophia synthesizes with prior ethics input:**

"**Sophia here.** Let me integrate the legal and compliance input with our earlier ethics analysis...

**Ethics-Legal Alignment:**

| Ethical Concern | Legal/Compliance Response | Adequately Addressed? |
|-----------------|--------------------------|----------------------|
| [Concern from Step 3] | [How legal review addresses] | [Y/N/Partial] |
| [Concern from Step 3] | [How compliance addresses] | [Y/N/Partial] |

**Tensions Identified:**
- Are there tensions between legal requirements and ethical ideals? [assessment]
- Are there compliance requirements that feel ethically problematic? [assessment]

**Recommendations for Balance:**
1. [How to balance legal with ethical]
2. [How to balance compliance with fairness]

**Procedural Justice Confirmation:**
Does the policy now include adequate:
- [ ] Notice before enforcement
- [ ] Opportunity to be heard
- [ ] Fair appeal process
- [ ] Proportionate consequences
- [ ] Equal application"

### 8. Synthesize Cross-Module Input

**Facilitator synthesis:**

"Let me synthesize the cross-module policy validation:

**Cross-Module Validation Summary:**

| Domain | Status | Critical Issues | Actions Required |
|--------|--------|-----------------|------------------|
| Security | [Pass/Conditional/Fail] | [count] | [summary] |
| Compliance | [Pass/Conditional/Fail] | [count] | [summary] |
| Legal | [Pass/Conditional/Fail] | [count] | [summary] |
| Ethics-Legal Alignment | [Strong/Adequate/Weak] | [count] | [summary] |

**Required Policy Additions:**

**From Security (Bastion):**
1. [Required clause]
2. [Required clause]

**From Compliance (Sentinel):**
1. [Required clause]
2. [Required clause]

**From Legal (Covenant):**
1. [Required clause]
2. [Required clause]

**Policy Implementation Requirements:**
- Systems changes needed: [list]
- Training required: [list]
- Monitoring to implement: [list]

**Approval Path Confirmed:**
- [ ] Security sign-off: [owner]
- [ ] Compliance sign-off: [owner]
- [ ] Legal sign-off: [owner]
- [ ] HR sign-off (if employment): [owner]

**Overall Policy Readiness:** [Ready to Draft/Needs Work/Major Revision Needed]"

### 9. Update Output File

**Append to {outputFile}:**

```markdown
## 5b. Cross-Module Security & Legal Review

### Security Review (Bastion)
**Impact Assessment:**
[Security impact table]

**Key Security Requirements:**
1. [requirement]
2. [requirement]

**Systems Changes Needed:** [list]

### Compliance Review (Sentinel)
**Framework Alignment:**
[Compliance framework table]

**Compliance Requirements:**
1. [requirement]
2. [requirement]

**Audit Implications:** [summary]

### Legal Review (Covenant)
**Enforceability Assessment:**
[Legal assessment table]

**Required Legal Language:**
1. [clause]
2. [clause]

**Employment Law Considerations:** [summary]

### Ethics-Legal Synthesis (Sophia)
**Alignment Status:** [assessment]
**Procedural Justice:** [checklist status]

### Cross-Module Summary
| Domain | Status | Actions |
|--------|--------|---------|
[summary table]

**Policy Readiness:** [status]
```

Update frontmatter: add `step-05b-security-legal-review` to stepsCompleted

### 10. Menu Options

**Present options:**

"{user_name}, cross-module policy validation is complete.

**Select:**
[D] Discuss specific findings with experts
[P] Party Mode - Full policy validation board discussion
[I] Incorporate all required changes into policy direction
[C] Continue to Draft Policy (with cross-module inputs)"

### 11. Continue to Draft Policy

When user selects [C], load and execute {nextStepFile} (step-06-draft-policy.md) with all cross-module requirements incorporated into the drafting process.

---

## SUCCESS METRICS:

- Security implications fully assessed
- Compliance frameworks mapped
- Legal enforceability verified
- Employment law implications addressed
- Required policy language documented
- Implementation requirements identified
- Approval path confirmed
- Ethics-legal alignment validated

## FAILURE INDICATORS:

- Skipping security review for data/access policies
- Not mapping to compliance frameworks
- Creating unenforceable policy language
- Missing employment law considerations
- Not documenting required legal clauses
- Proceeding without addressing critical legal risks
