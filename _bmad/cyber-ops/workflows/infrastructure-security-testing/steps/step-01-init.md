---
name: 'step-01-init'
description: 'Initialize infrastructure security testing'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/infrastructure-security-testing'
thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-server-hardening.md'
continueStepFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/security/infrastructure-security-testing-{project_name}.md'
---

# Step 1: Infrastructure Security Testing Initialization

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style

## CONTINUATION CHECK

IF {outputFile} exists: Load and execute {continueStepFile}
IF NOT: Continue with fresh initialization below

## INITIALIZATION SEQUENCE:

### 1. Assessment Welcome

"Welcome to the Infrastructure Security Testing workflow. I'm Bastion, your infrastructure security specialist.

This comprehensive assessment covers:
- Server hardening (Linux/Windows)
- Container security (Docker)
- Kubernetes security
- CI/CD pipeline security
- Secrets management
- Infrastructure as Code review
- Cloud infrastructure hardening

Let's define your assessment scope."

### 2. Infrastructure Information

"Please provide infrastructure details:

**Infrastructure Components:**
- Operating systems (Linux distros, Windows versions)
- Container platforms (Docker, Podman, containerd)
- Orchestration (Kubernetes, ECS, Nomad)
- CI/CD tools (Jenkins, GitLab CI, GitHub Actions)
- IaC tools (Terraform, Ansible, CloudFormation)

**Environment:**
- Production / Staging / Development
- On-premises / Cloud / Hybrid
- Cloud provider(s) if applicable

**Access:**
- SSH/RDP access to systems?
- kubectl access?
- CI/CD admin access?
- IaC repository access?

What infrastructure is in scope?"

### 3. Assessment Focus

"What should we focus on?

**Testing Areas:**
- [ ] Server hardening (CIS benchmarks)
- [ ] Container image security
- [ ] Container runtime security
- [ ] Kubernetes cluster security
- [ ] CI/CD pipeline security
- [ ] Secrets management
- [ ] Infrastructure as Code
- [ ] Supply chain security

**Compliance Requirements:**
- CIS Benchmarks?
- SOC 2?
- PCI DSS?
- NIST?

What's in scope?"

### 4. Access Verification

"Let's verify access levels:

**System Access:**
- Root/Administrator access available?
- Service account credentials?
- API tokens/keys?

**Repository Access:**
- Source code access?
- IaC repository access?
- CI/CD configuration access?

**Cloud Access:**
- Cloud console access?
- CLI tools configured?
- IAM permissions level?

Please confirm your access levels."

### 5. Document Assessment Scope

Create {outputFile}:

```markdown
---
project_name: {project_name}
assessment_type: infrastructure-security-testing
stepsCompleted: [1]
created_date: {current_date}
status: in_progress
---

# Infrastructure Security Testing: {project_name}

## 1. Assessment Overview

### 1.1 Infrastructure Scope
[Infrastructure components]

### 1.2 Testing Focus
[Selected testing areas]

### 1.3 Access Levels
[Verified access]

### 1.4 Compliance Requirements
[Applicable standards]

---

## 2. Server Hardening
[Step 2]

## 3. Container Security
[Step 3]

## 4. Kubernetes Security
[Step 4]

## 5. CI/CD Security
[Step 5]

## 6. Secrets Management
[Step 6]

## 7. IaC Review
[Step 7]

## 8. Findings & Remediation
[Step 8]
```

### 6. Confirmation

"**Scope Defined**

Ready to proceed to server hardening assessment?"

## MENU

Display: [C] Continue to Server Hardening [R] Review/Revise Scope

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1]`, then execute {nextStepFile}.
