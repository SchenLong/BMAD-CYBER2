---
name: 'step-05-cicd-security'
description: 'CI/CD pipeline security assessment'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/infrastructure-security-testing'
thisStepFile: '{workflow_path}/steps/step-05-cicd-security.md'
nextStepFile: '{workflow_path}/steps/step-06-secrets-management.md'
outputFile: '{output_folder}/security/infrastructure-security-testing-{project_name}.md'
---

# Step 5: CI/CD Pipeline Security

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide CI/CD security assessment

## CI/CD SECURITY SEQUENCE:

### 1. CI/CD Environment Overview

"Let's understand your CI/CD environment.

**CI/CD Tools:**
- Jenkins / GitLab CI / GitHub Actions / CircleCI?
- ArgoCD / Flux for GitOps?
- Artifact repositories (Nexus, Artifactory)?
- Container registries?

**Pipeline Scope:**
- Build pipelines
- Test pipelines
- Deployment pipelines
- Release automation

What CI/CD tools are in scope?"

### 2. Access Control Review

"Reviewing CI/CD access controls.

**Authentication:**
- SSO/LDAP integration?
- MFA enforced?
- Service accounts managed?
- API token security?

**Authorization:**
- Role separation (dev/ops/admin)?
- Project/pipeline permissions?
- Secret access control?
- Audit logging?

**Key Questions:**
- Who can modify pipelines?
- Who can access production secrets?
- Who can deploy to production?

What access controls are configured?"

### 3. Pipeline Configuration Security

"Reviewing pipeline security configuration.

**Pipeline Security:**
- Pipeline-as-code reviewed?
- No secrets in pipeline files?
- Branch protection rules?
- Required approvals?

**Build Security:**
- Pinned dependencies?
- Trusted base images?
- Build isolation?
- Reproducible builds?

**Deployment Security:**
- Environment separation?
- Deployment gates?
- Rollback capability?
- Immutable deployments?

What pipeline configurations can we review?"

### 4. Secrets in CI/CD

"Reviewing secrets management in pipelines.

**Secret Storage:**
- Native secret management?
- External vault integration?
- Environment variables vs files?
- Secret masking in logs?

**Secret Exposure Risks:**
- Secrets in pipeline definitions?
- Secrets in build logs?
- Secrets in artifacts?
- Secrets in environment dumps?

**Best Practices:**
- Short-lived credentials?
- Least privilege service accounts?
- Secret rotation?

How are secrets managed in your pipelines?"

### 5. Artifact Security

"Reviewing build artifact security.

**Artifact Management:**
- Artifact signing?
- Vulnerability scanning?
- SBOM generation?
- Provenance tracking?

**Container Images:**
- Image scanning integrated?
- Signed images?
- Trusted registries?
- Tag immutability?

**Supply Chain:**
- Dependency pinning?
- Lock files committed?
- Dependency confusion prevention?
- Third-party action review?

What artifact security measures are in place?"

### 6. Runner/Agent Security

"Reviewing CI/CD runner/agent security.

**Runner Configuration:**
- Self-hosted or cloud-hosted?
- Runner isolation?
- Privileged runners?
- Runner registration security?

**Environment Security:**
- Clean build environments?
- No persistent data?
- Network isolation?
- Access to production networks?

**Commands (GitHub Actions example):**
```yaml
# Check for self-hosted runners
# Review runner group permissions
# Verify runner labels
```

What runner/agent configuration is in use?"

### 7. Supply Chain Security

"Assessing software supply chain security.

**SLSA Levels:**
- Source integrity (signed commits)?
- Build integrity (isolated builds)?
- Provenance (build attestation)?
- Common requirements (version control)?

**Dependency Security:**
- Dependabot/Renovate enabled?
- Vulnerability alerts configured?
- Private package feeds secured?
- Typosquatting protection?

**Third-Party Actions/Plugins:**
- Pinned by SHA?
- Trusted publishers?
- Regular updates?
- Minimal permissions?

What supply chain controls are implemented?"

### 8. Document CI/CD Security

Append to {outputFile} Section 5:

```markdown
## 5. CI/CD Pipeline Security

### 5.1 CI/CD Environment
| Tool | Version | Purpose | Security Features |
|------|---------|---------|-------------------|
| | | | |

### 5.2 Access Control
| Control | Status | Finding |
|---------|--------|---------|
| MFA enforced | | |
| Role separation | | |
| Audit logging | | |
| Token security | | |

### 5.3 Pipeline Security
| Pipeline | Branch Protection | Approvals | Secrets Handling |
|----------|-------------------|-----------|------------------|
| | | | |

### 5.4 Secrets Management
| Control | Status | Finding |
|---------|--------|---------|
| Vault integration | | |
| Secret masking | | |
| No secrets in logs | | |
| Short-lived credentials | | |

### 5.5 Artifact Security
| Control | Status | Finding |
|---------|--------|---------|
| Image scanning | | |
| Artifact signing | | |
| SBOM generation | | |
| Provenance | | |

### 5.6 Runner Security
| Runner Type | Isolation | Privileges | Network Access |
|-------------|-----------|------------|----------------|
| | | | |

### 5.7 Supply Chain
| Control | Status | Finding |
|---------|--------|---------|
| Dependency scanning | | |
| SLSA level | | |
| Action/plugin pinning | | |

### 5.8 CI/CD Findings
| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| CICD-001 | | | |
```

### 9. Confirmation

"**CI/CD Security Assessment Complete**

**Summary:**
- Pipelines reviewed: [count]
- Access control issues: [count]
- Secret exposure risks: [count]
- Supply chain gaps: [count]

Ready to proceed to secrets management deep dive?"

## MENU

Display: [C] Continue to Secrets Management [R] Review/Add Findings [S] Skip to IaC

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5]`, then execute {nextStepFile}.
