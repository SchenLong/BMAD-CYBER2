---
name: 'step-07-iac-review'
description: 'Infrastructure as Code security review'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/infrastructure-security-testing'
thisStepFile: '{workflow_path}/steps/step-07-iac-review.md'
nextStepFile: '{workflow_path}/steps/step-08-findings-remediation.md'
outputFile: '{output_folder}/security/infrastructure-security-testing-{project_name}.md'
---

# Step 7: Infrastructure as Code Review

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide IaC security review

## IAC SECURITY REVIEW SEQUENCE:

### 1. IaC Inventory

"Let's inventory your Infrastructure as Code.

**IaC Tools:**
- Terraform?
- CloudFormation / CDK?
- Pulumi?
- Ansible / Chef / Puppet?
- Kubernetes manifests / Helm?

**Scope:**
- Cloud infrastructure
- Container orchestration
- Configuration management
- Policy as Code

What IaC tools and repositories are in scope?"

### 2. Static Analysis

"Let's run static analysis on IaC code.

**Scanning Tools:**
- Checkov
- tfsec / trivy config
- Terrascan
- KICS
- Snyk IaC

**What to Scan:**
- Terraform files
- CloudFormation templates
- Kubernetes manifests
- Dockerfile configurations
- Ansible playbooks

**Commands:**
```bash
# Checkov scan
checkov -d .

# tfsec scan
tfsec .

# Trivy config scan
trivy config .

# KICS scan
kics scan -p .
```

What static analysis results do you have?"

### 3. Terraform Security

"Reviewing Terraform security (if applicable).

**State Security:**
- Remote state with encryption?
- State access controls?
- State locking enabled?
- No secrets in state?

**Provider Configuration:**
- Provider versions pinned?
- Secure authentication?
- No hardcoded credentials?

**Module Security:**
- Trusted module sources?
- Module versions pinned?
- No untrusted public modules?

**Best Practices:**
- Least privilege IAM?
- Encryption enabled?
- Logging configured?
- Network security?

What Terraform configurations can we review?"

### 4. CloudFormation/CDK Security

"Reviewing CloudFormation/CDK security (if applicable).

**Template Security:**
- Parameters secured (NoEcho)?
- IAM policies least privilege?
- Encryption resources?
- Security group rules?

**Stack Security:**
- Stack policies?
- Termination protection?
- Change sets reviewed?
- Drift detection?

**CDK Specific:**
- cdk-nag compliance?
- Asset security?
- Synth validation?

What CloudFormation configurations are available?"

### 5. Kubernetes Manifest Security

"Reviewing Kubernetes manifest security.

**Manifest Analysis:**
- Pod security contexts?
- Resource limits?
- Network policies?
- Service account usage?

**Helm Security:**
- Chart sources trusted?
- Values files reviewed?
- No secrets in values?
- Template security?

**Tools:**
```bash
# Kubesec scan
kubesec scan deployment.yaml

# Kube-score
kube-score score deployment.yaml

# Polaris
polaris audit --audit-path .
```

What Kubernetes/Helm configurations can we review?"

### 6. Policy as Code

"Reviewing policy enforcement.

**Policy Tools:**
- OPA/Rego policies?
- Sentinel policies?
- AWS Config Rules?
- Azure Policy?
- GCP Organization Policy?

**Enforcement:**
- Pre-commit hooks?
- CI pipeline gates?
- Admission controllers?
- Continuous compliance?

What policy enforcement is in place?"

### 7. Configuration Drift

"Assessing configuration drift.

**Drift Detection:**
- Terraform plan drift?
- CloudFormation drift detection?
- Kubernetes drift?
- Configuration management drift?

**Remediation:**
- Automated remediation?
- Alerting on drift?
- Regular reconciliation?

How do you detect and handle drift?"

### 8. Document IaC Review

Append to {outputFile} Section 7:

```markdown
## 7. Infrastructure as Code Review

### 7.1 IaC Inventory
| Tool | Repository | Scope | Last Updated |
|------|------------|-------|--------------|
| | | | |

### 7.2 Static Analysis Results
| Tool | Files Scanned | Critical | High | Medium | Low |
|------|---------------|----------|------|--------|-----|
| Checkov | | | | | |
| tfsec | | | | | |
| KICS | | | | | |

### 7.3 Terraform Security
| Control | Status | Finding |
|---------|--------|---------|
| Remote state encrypted | | |
| State access control | | |
| Provider pinning | | |
| Module security | | |

### 7.4 Cloud Template Security
| Control | Status | Finding |
|---------|--------|---------|
| IAM least privilege | | |
| Encryption enabled | | |
| Network security | | |
| Logging configured | | |

### 7.5 Kubernetes/Helm Security
| Control | Status | Finding |
|---------|--------|---------|
| Pod security | | |
| Resource limits | | |
| Network policies | | |
| RBAC | | |

### 7.6 Policy Enforcement
| Policy Type | Tool | Enforcement Point | Status |
|-------------|------|-------------------|--------|
| | | | |

### 7.7 Configuration Drift
| Resource Type | Drift Detected | Remediated |
|---------------|----------------|------------|
| | | |

### 7.8 IaC Findings
| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| IAC-001 | | | |
```

### 9. Confirmation

"**IaC Security Review Complete**

**Summary:**
- IaC repositories reviewed: [count]
- Critical misconfigurations: [count]
- Policy violations: [count]
- Drift detected: [count]

Ready to proceed to findings summary and remediation?"

## MENU

Display: [C] Continue to Findings & Remediation [R] Review/Add Findings [E] Investigate Specific Finding

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`, then execute {nextStepFile}.
