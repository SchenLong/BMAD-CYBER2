# Secure Software Development - Team Orchestration Instructions

<critical>The workflow execution engine is governed by: {project-root}/src/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: secure-software/workflow.yaml</critical>
<critical>Communicate in {communication_language} with {user_name}</critical>

<workflow>

<step n="1" goal="Initialize secure software orchestration">
<output>
# Secure Software Development Orchestration

Welcome, {user_name}! This orchestration template guides you through building software with integrated security practices.

**Module Sequence:**

```
BMM (PRD) → Cybersec (Threat Model) → Legal (Compliance) →
BMM (Architecture) → Cybersec (Security Review) → BMM (Stories) →
[Implementation with Security Gates]
```

**Teams Involved:**

- **BMM**: Product planning and development
- **Cybersec-Team**: Threat modeling and security review
- **Legal-Team**: Compliance requirements

---
</output>

<ask>Do you have an existing project to continue, or starting fresh?

1. **Continue existing** - Resume from current state
2. **Start fresh** - Begin new secure software project

Choice [1/2]:</ask>

<check if="choice == 1">
  <action>Load project registry</action>
  <action>Scan for existing artifacts (prd.md, architecture.md, etc.)</action>
  <action>Determine current phase</action>
  <action>Goto appropriate phase step</action>
</check>

<check if="choice == 2">
  <action>Goto step 2</action>
</check>
</step>

<step n="2" goal="Phase 1 - Product Requirements">
<output>
## Phase 1: Product Requirements (BMM)

**Objective:** Create comprehensive PRD with security considerations

**Lead Agent:** John (PM)
**Supporting:** Mary (Analyst)

**Security Focus Areas:**

- Authentication and authorization requirements
- Data sensitivity classification
- Regulatory context (GDPR, HIPAA, PCI-DSS, etc.)
- Integration security requirements

---
</output>

<ask>How would you like to proceed?

1. **Create PRD now** - Load and followBMM create-prd workflow
2. **Use existing PRD** - Point to existing prd.md
3. **Skip** - I'll create it later

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <output>Invoking PRD creation workflow...

**Tip:** When defining features, explicitly note:

- What data is collected/stored
- Who can access what
- What compliance frameworks apply

Starting BMM PRD workflow...</output>

  <action>Load and follow{bmm_workflows.prd}</action>
  <action>Wait for PRD completion</action>
  <action>Store prd_path</action>
</check>

<check if="choice == 2">
  <ask>Enter path to existing PRD:</ask>
  <action>Store prd_path</action>
  <action>Validate PRD exists</action>
</check>

<check if="choice == 3">
  <output>PRD skipped. Note: Threat modeling will be less effective without PRD context.</output>
  <action>Set prd_path = null</action>
</check>

<action>Goto step 3</action>
</step>

<step n="3" goal="Phase 2 - Threat Modeling">
<output>
## Phase 2: Threat Modeling (Cybersec-Team)

**Objective:** Identify threats, attack vectors, and required mitigations

**Lead Agent:** Cipher (Threat Analyst)
**Supporting:** Bastion (Security Architect)

**Methodology:** STRIDE threat modeling

- **S**poofing - Identity threats
- **T**ampering - Data integrity threats
- **R**epudiation - Audit trail threats
- **I**nformation Disclosure - Confidentiality threats
- **D**enial of Service - Availability threats
- **E**levation of Privilege - Authorization threats

---

**Handoff Artifact:** PRD requirements → Threat analysis scope
</output>

<check if="prd_path exists">
  <output>Using PRD at {prd_path} as input for threat modeling.</output>
</check>

<ask>Ready to begin threat modeling?

1. **Start threat model** - Load and followSTRIDE workflow
2. **Use existing threat model** - Point to existing file
3. **Skip** - Proceed without formal threat model (NOT RECOMMENDED)

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <output>Invoking STRIDE threat modeling workflow...

**Context for Cipher:**

- PRD Location: {prd_path}
- Focus on: Authentication, data flows, integrations
- Output format: threat-model.yaml + threat-model.md

Starting Cybersec threat modeling...</output>

  <action>Load and follow{cybersec_workflows.threat_model} with prd_path context</action>
  <action>Wait for completion</action>
  <action>Store threat_model_path</action>
</check>

<check if="choice == 2">
  <ask>Enter path to existing threat model:</ask>
  <action>Store threat_model_path</action>
</check>

<check if="choice == 3">
  <output>
**WARNING:** Skipping threat modeling is not recommended.

Security issues discovered later are 6-10x more expensive to fix.

Proceeding without threat model...</output>
  <action>Set threat_model_path = null</action>
</check>

<action>Goto step 4</action>
</step>

<step n="4" goal="Phase 3 - Compliance Requirements">
<output>
## Phase 3: Compliance Requirements (Legal-Team)

**Objective:** Identify regulatory obligations and compliance controls

**Lead Agent:** Counsel
**Supporting:** Europa (if GDPR), Sentinel (security controls)

**Based on threat model, checking for:**

- Data protection requirements (GDPR, CCPA, HIPAA)
- Industry standards (PCI-DSS, SOC 2, ISO 27001)
- Contractual obligations
- Geographic requirements

---

**Handoff Artifact:** Threat model → Compliance scope definition
</output>

<check if="threat_model_path exists">
  <action>Parse threat model for data types and sensitivity</action>
  <output>Threat model indicates the following data categories:
{{#each data_categories}}
- {category}: {sensitivity_level}
{{/each}}
</output>
</check>

<ask>Which compliance frameworks apply?

1. **GDPR** - EU personal data
2. **HIPAA** - US healthcare data
3. **PCI-DSS** - Payment card data
4. **SOC 2** - Service organization controls
5. **Multiple** - Select multiple frameworks
6. **None/Unknown** - Skip compliance analysis

Choice [1-6]:</ask>

<check if="choice == 5">
  <ask>Enter frameworks (comma-separated): GDPR, HIPAA, PCI-DSS, SOC2, ISO27001</ask>
  <action>Parse selected frameworks</action>
</check>

<check if="choice != 6">
  <output>Invoking compliance requirements analysis...

**Context for Legal Team:**

- Frameworks: {selected_frameworks}
- Data types from threat model
- Output: compliance-requirements.yaml

Starting Legal-Team compliance workflow...</output>

  <action>Load and follow{legal_workflows.compliance_audit} with frameworks and threat_model context</action>
  <action>Wait for completion</action>
  <action>Store compliance_requirements_path</action>
</check>

<check if="choice == 6">
  <output>Compliance analysis skipped.</output>
  <action>Set compliance_requirements_path = null</action>
</check>

<action>Goto step 5</action>
</step>

<step n="5" goal="Phase Gate 1 - Pre-Architecture Check">
<output>
## PHASE GATE: Pre-Architecture

Checking readiness for architecture phase...

| Requirement | Status |
|-------------|--------|
| PRD/Product Brief | {prd_status} |
| Threat Model | {threat_model_status} |
| Compliance Requirements | {compliance_status} |

</output>

<action>Evaluate gate requirements:

- prd_path exists → PASS
- threat_model_path exists → PASS (or WARN if skipped)
- compliance_requirements_path exists → PASS (or WARN if skipped)
</action>

<check if="any FAIL">
  <output>**GATE BLOCKED:** The following items must be completed:
{{#each failed_items}}
- {item}: {reason}
{{/each}}

Return to complete missing items.</output>
  <action>Route to appropriate step</action>
</check>

<check if="any WARN">
  <output>**GATE PASSED WITH WARNINGS:**
{{#each warned_items}}
- {item}: {reason}
{{/each}}

Proceeding with caution. Security gaps may exist.</output>
</check>

<check if="all PASS">
  <output>**GATE PASSED:** All pre-architecture requirements met.

Proceeding to architecture phase...</output>
</check>

<action>Goto step 6</action>
</step>

<step n="6" goal="Phase 4 - Architecture with Security Integration">
<output>
## Phase 4: Architecture Design (BMM + Cybersec)

**Objective:** Design system architecture with security integrated

**Lead Agent:** Winston (Architect)
**Security Review:** Bastion (Security Architect)

**Inputs to Architecture:**

- PRD: {prd_path}
- Threat Model: {threat_model_path}
- Compliance Requirements: {compliance_requirements_path}

**Security Integration Points:**

- Authentication/authorization architecture
- Data encryption at rest and in transit
- Network segmentation
- Logging and monitoring
- Secrets management

---
</output>

<ask>Ready to begin architecture design?

1. **Create architecture** - Load and followBMM create-architecture with security context
2. **Use existing architecture** - Point to existing file and get security review
3. **Skip** - Proceed to stories (NOT RECOMMENDED)

Choice [1/2/3]:</ask>

<check if="choice == 1 or choice == 2">
  <check if="choice == 1">
    <output>Invoking architecture workflow with security context...

**Context for Winston:**

- Threat model mitigations to incorporate: {mitigation_count}
- Compliance controls to address: {control_count}
- Security patterns to consider: Defense in depth, Zero trust

Starting BMM architecture workflow...</output>

    <action>Load and follow{bmm_workflows.architecture} with security context</action>
    <action>Wait for completion</action>
    <action>Store architecture_path</action>
  </check>

  <check if="choice == 2">
    <ask>Enter path to existing architecture:</ask>
    <action>Store architecture_path</action>
  </check>

  <output>
## Security Architecture Review

Now invoking security architecture review...

**Reviewer:** Bastion (Security Architect)
**Scope:** Validate security design decisions

Starting Cybersec security review...</output>

  <action>Load and follow{cybersec_workflows.security_review} with architecture_path</action>
  <action>Wait for completion</action>
  <action>Store security_review_path</action>

  <output>
**Security Review Complete**

Findings summary:

- Critical: {critical_count}
- High: {high_count}
- Medium: {medium_count}
- Low: {low_count}

{{#if critical_count > 0}}
**BLOCKING:** Critical security issues must be addressed before proceeding.
{{/if}}
</output>
</check>

<action>Goto step 7</action>
</step>

<step n="7" goal="Phase Gate 2 - Pre-Implementation Check">
<output>
## PHASE GATE: Pre-Implementation

Checking readiness for implementation phase...

| Requirement | Status |
|-------------|--------|
| Architecture Document | {architecture_status} |
| Security Review | {security_review_status} |
| Critical Findings Resolved | {critical_findings_status} |
| Signoff: Security Architect | {security_signoff_status} |

</output>

<action>Evaluate gate requirements:

- architecture_path exists → PASS
- security_review_path exists → PASS
- critical_findings == 0 → PASS (else FAIL)
- security_signoff collected → PASS
</action>

<check if="FAIL on critical_findings">
  <output>**GATE BLOCKED:** {critical_count} critical security findings must be resolved.

{{#each critical_findings}}

- [{id}] {title}: {description}
{{/each}}

Address these issues in the architecture before proceeding.</output>

  <ask>Would you like to:

1. **Update architecture** - Revise to address findings
2. **Accept risk** - Document risk acceptance and proceed
3. **Cancel** - Stop orchestration

Choice [1/2/3]:</ask>

  <check if="choice == 2">
    <ask>Document risk acceptance rationale:</ask>
    <action>Store risk_acceptance</action>
    <output>Risk acceptance documented. Proceeding with known security gaps.</output>
  </check>
</check>

<check if="PASS">
  <output>**GATE PASSED:** Implementation can begin.

Proceeding to epics and stories creation...</output>
</check>

<action>Goto step 8</action>
</step>

<step n="8" goal="Phase 5 - Epics and Stories with Security Criteria">
<output>
## Phase 5: Epics and Stories (BMM)

**Objective:** Break down requirements into implementable stories

**Lead Agent:** John (PM)
**Security Input:** Security findings → Acceptance criteria

**Security Story Integration:**

- Each story with security implications gets security acceptance criteria
- Critical mitigations become dedicated security stories
- Security testing requirements embedded in stories

---
</output>

<ask>Ready to create epics and stories?

1. **Create epics/stories** - Load and followBMM workflow with security context
2. **Use existing** - Point to existing epics file
3. **Skip** - End orchestration here

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <output>Invoking epics and stories workflow...

**Security Context for PM:**

- Threat mitigations to translate to stories
- Security review findings to address
- Compliance controls to implement

Starting BMM epics workflow...</output>

  <action>Load and follow{bmm_workflows.epics} with security context from all phases</action>
  <action>Wait for completion</action>
  <action>Store epics_path</action>
</check>

<action>Goto step 9</action>
</step>

<step n="9" goal="Complete orchestration">
<output>
# Secure Software Orchestration Complete

## Summary

| Phase | Status | Artifact |
|-------|--------|----------|
| PRD | {prd_status} | {prd_path} |
| Threat Model | {threat_model_status} | {threat_model_path} |
| Compliance | {compliance_status} | {compliance_requirements_path} |
| Architecture | {architecture_status} | {architecture_path} |
| Security Review | {security_review_status} | {security_review_path} |
| Epics/Stories | {epics_status} | {epics_path} |

## Security Integration Achieved

- Threat mitigations integrated: {mitigation_count}
- Compliance controls addressed: {control_count}
- Security acceptance criteria added: {security_criteria_count}
- Risk acceptances documented: {risk_acceptance_count}

## Next Steps

1. **Begin Implementation** - Use `/bmad:bmm:workflows:sprint-planning`
2. **Security Gates During Implementation:**
   - Code review includes security checks
   - Penetration testing before release
   - Compliance audit before go-live

3. **Pre-Release Gate Requirements:**
   - All security stories complete
   - Penetration test passed
   - Security architect signoff

---

**Return to Abdul:** Use [PS] Project Status to track progress.
</output>

<action>Save orchestration summary to {output_folder}/orchestration-secure-software-{date}.md</action>
</step>

</workflow>
