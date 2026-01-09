---
name: 'step-06-secrets-management'
description: 'Secrets management assessment'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/infrastructure-security-testing'
thisStepFile: '{workflow_path}/steps/step-06-secrets-management.md'
nextStepFile: '{workflow_path}/steps/step-07-iac-review.md'
outputFile: '{output_folder}/security/infrastructure-security-testing-{project_name}.md'
---

# Step 6: Secrets Management Assessment

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide secrets management assessment

## SECRETS MANAGEMENT SEQUENCE:

### 1. Secrets Inventory

"Let's inventory secrets in your environment.

**Types of Secrets:**
- API keys and tokens
- Database credentials
- Certificates and private keys
- SSH keys
- Encryption keys
- Service account credentials
- OAuth client secrets

**Secret Locations:**
- Vault/secrets manager
- Environment variables
- Configuration files
- Kubernetes secrets
- CI/CD variables
- Cloud provider secrets

What secrets are in your environment?"

### 2. Secrets Management Solution

"Let's review your secrets management approach.

**Secrets Managers:**
- HashiCorp Vault?
- AWS Secrets Manager?
- Azure Key Vault?
- Google Secret Manager?
- CyberArk?
- 1Password/Doppler?

**Configuration:**
- High availability?
- Audit logging?
- Access policies?
- Secret versioning?

What secrets management solution do you use?"

### 3. Secret Access Control

"Reviewing secret access policies.

**Access Control:**
- Least privilege enforced?
- Role-based access?
- Just-in-time access?
- Approval workflows?

**Authentication:**
- Machine identity (SPIFFE/SPIRE)?
- Cloud IAM integration?
- Certificate-based auth?
- AppRole or similar?

**Audit:**
- All access logged?
- Anomaly detection?
- Access reviews?

What access controls are configured?"

### 4. Secret Lifecycle

"Reviewing secret lifecycle management.

**Creation:**
- Strong secret generation?
- Secure initial distribution?
- No plaintext transmission?

**Rotation:**
- Automated rotation?
- Rotation frequency?
- Zero-downtime rotation?
- Rotation verification?

**Revocation:**
- Immediate revocation capability?
- Revocation propagation?
- Incident response procedures?

What lifecycle management is in place?"

### 5. Secrets Scanning

"Let's scan for exposed secrets.

**Scanning Tools:**
- Trufflehog
- GitLeaks
- detect-secrets
- Talisman

**Scan Locations:**
- Git repositories (history)
- Configuration files
- Container images
- Build artifacts
- Log files

**Commands:**
```bash
# Trufflehog git scan
trufflehog git file://. --since-commit HEAD~100

# GitLeaks scan
gitleaks detect -v

# detect-secrets scan
detect-secrets scan
```

What secrets scanning have you performed?"

### 6. Secrets in Application Code

"Checking for hardcoded secrets.

**Code Review:**
- No secrets in source code?
- Environment-based configuration?
- Proper secret injection?
- No secrets in logs?

**Configuration:**
- Separate config from code?
- External configuration?
- Config encryption?

**Common Patterns:**
```python
# BAD: Hardcoded secret
api_key = "sk_live_abc123..."

# GOOD: Environment variable
api_key = os.environ.get("API_KEY")

# GOOD: Vault lookup
api_key = vault.read("secret/api-key")
```

Any hardcoded secrets found in code?"

### 7. Cloud Secrets Assessment

"Reviewing cloud-native secrets handling.

**AWS:**
- Secrets Manager usage?
- Parameter Store (SecureString)?
- KMS key management?
- IAM policies for secrets?

**Azure:**
- Key Vault usage?
- Managed identities?
- Certificate management?

**GCP:**
- Secret Manager usage?
- Workload identity?
- KMS integration?

What cloud secrets services are in use?"

### 8. Document Secrets Management

Append to {outputFile} Section 6:

```markdown
## 6. Secrets Management Assessment

### 6.1 Secrets Inventory
| Secret Type | Count | Location | Rotation |
|-------------|-------|----------|----------|
| API Keys | | | |
| Database Creds | | | |
| Certificates | | | |
| SSH Keys | | | |

### 6.2 Secrets Manager
| Tool | Configuration | High Availability | Audit |
|------|---------------|-------------------|-------|
| | | | |

### 6.3 Access Control
| Control | Status | Finding |
|---------|--------|---------|
| Least privilege | | |
| Role-based access | | |
| Audit logging | | |
| MFA for admin | | |

### 6.4 Lifecycle Management
| Phase | Status | Finding |
|-------|--------|---------|
| Generation | | |
| Distribution | | |
| Rotation | | |
| Revocation | | |

### 6.5 Secrets Scanning Results
| Tool | Scope | Secrets Found | Status |
|------|-------|---------------|--------|
| | | | |

### 6.6 Exposed Secrets
| Location | Secret Type | Risk | Remediated |
|----------|-------------|------|------------|
| | | | |

### 6.7 Secrets Management Findings
| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| SEC-001 | | | |
```

### 9. Confirmation

"**Secrets Management Assessment Complete**

**Summary:**
- Secret types inventoried: [count]
- Exposed secrets found: [count]
- Rotation gaps: [count]
- Access control issues: [count]

Ready to proceed to Infrastructure as Code review?"

## MENU

Display: [C] Continue to IaC Review [R] Review/Add Findings [E] Investigate Exposed Secret

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6]`, then execute {nextStepFile}.
