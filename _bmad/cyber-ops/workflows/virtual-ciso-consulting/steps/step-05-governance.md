---
name: 'step-05-governance'
description: 'Design governance framework with policies, committees, and decision structures'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/virtual-ciso-consulting'
thisStepFile: '{workflow_path}/steps/step-05-governance.md'
nextStepFile: '{workflow_path}/steps/step-06-reporting.md'
outputFile: '{output_folder}/vciso/{client_name}/vciso-engagement-{client_name}.md'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
brainstormingTask: '{project-root}/_bmad/core/tasks/brainstorming.xml'
---

# Step 5: Governance Framework Design

## STEP GOAL:

To design a comprehensive security governance framework including policies, committees, decision processes, and roles/responsibilities that fit the organization's culture and structure.

## GOVERNANCE DESIGN PROCESS:

### 1. Policy Framework

Design security policy hierarchy:

**Policy Tier 1 (Strategic):**
- Information Security Policy (master policy)
- Acceptable Use Policy
- Data Classification Policy
- Incident Response Policy

**Policy Tier 2 (Operational):**
- Access Control Standards
- Encryption Standards
- Patch Management Procedures
- Change Management Procedures
- Vendor Security Procedures

**Policy Tier 3 (Technical):**
- Configuration baselines
- Technical guidelines
- Runbooks and playbooks

For each policy:
- Policy name
- Owner
- Review frequency
- Current status (exists/needs update/needs creation)
- Priority for development

### 2. Security Committee Structure

Design governance committees:

**Security Steering Committee:**
- Purpose: Strategic oversight and risk acceptance
- Membership: Executive leadership + vCISO
- Meeting frequency: Quarterly
- Charter and responsibilities

**Security Operations Committee:**
- Purpose: Operational security decisions
- Membership: Technical leads + security team
- Meeting frequency: Monthly
- Charter and responsibilities

**Incident Response Team:**
- Purpose: Security incident handling
- Membership: Cross-functional response team
- Meeting trigger: Incident occurrence
- Charter and responsibilities

### 3. Decision Frameworks

Define decision-making processes:

**Risk Acceptance Process:**
- Who can accept what level of risk?
- Escalation criteria
- Documentation requirements

**Exception Process:**
- How are policy exceptions requested?
- Who approves exceptions?
- Exception tracking and review

**Change Management:**
- Security review in change process
- Emergency change procedures
- Security sign-off requirements

### 4. Roles & Responsibilities (RACI)

Define security roles:
- vCISO
- Security team members
- IT leadership
- Business unit leaders
- All employees

For each role, define:
- Security responsibilities
- Authority levels
- Escalation paths

Create RACI matrix for key security activities.

### 5. Compliance & Audit Framework

Design compliance management:
- Compliance calendar (all audits/assessments)
- Control testing schedule
- Evidence collection process
- Compliance reporting

### 6. Append Section 5

Update {outputFile} with:
- Complete policy catalog with priorities
- Committee charters and membership
- Decision frameworks and escalation paths
- Comprehensive RACI matrix
- Compliance management framework
- Policy development roadmap

### 7. Update Frontmatter

```yaml
stepsCompleted: [1, 2, 3, 4, 5]
lastStep: 'governance'
totalPolicies: {count}
```

### 8. Present MENU

Display: **[P] Party Mode [B] Brainstorming [C] Continue to Executive Reporting**

- IF P: "Collaborate on governance framework design" → {partyModeWorkflow}
- IF B: "Brainstorm innovative governance models" → {brainstormingTask}
- IF C: Load {nextStepFile}

---

## ✅ SUCCESS:

- Policy framework designed with priorities
- Committee structure defined with charters
- Decision frameworks established
- RACI matrix complete
- Compliance framework integrated
- Section 5 appended
