---

name: 'step-06-compute-security'
description: 'Assess VM hardening, container security, and serverless security'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/cloud-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-06-compute-security.md'
nextStepFile: '{workflow_path}/steps/step-07-compliance-mapping.md'
outputFile: '{output_folder}/security/cloud-security-assessment-{project_name}.md'

---

# Step 6: Compute Security Assessment

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on compute security assessment
- FORBIDDEN to discuss compliance mapping yet
- Cover VMs, containers, and serverless

## STEP GOAL:

To assess compute security including VM/instance hardening, container and Kubernetes security, serverless function security, and workload protection.

## COMPUTE SECURITY SEQUENCE:

### 1. Virtual Machine / Instance Security

"Let's assess VM/instance security:

**Instance Hardening:**

| Control | Description | Status |
|---------|-------------|--------|
| Hardened AMI/Image | CIS-hardened base images | ? |
| IMDSv2 (AWS) | Instance metadata protection | ? |
| Public IP | Minimize public exposure | ? |
| SSM/Serial Console | Secure management access | ? |
| OS patching | Automated patching process | ? |
| EDR/AV | Endpoint protection deployed | ? |

**Instance Configuration:**

| Check | Best Practice | Status |
|-------|---------------|--------|
| Default credentials | No default passwords | ? |
| SSH keys | Key-based only, no passwords | ? |
| Root/Admin | Disabled direct login | ? |
| Unnecessary services | Disabled/removed | ? |
| Local firewall | Host-based firewall enabled | ? |

How are your VMs/instances secured?"

### 2. Container Security

"Let's assess container security:

**Image Security:**

| Control | Description | Status |
|---------|-------------|--------|
| Base images | Minimal, trusted sources | ? |
| Image scanning | Pre-deployment vulnerability scan | ? |
| Registry security | Private registry, signed images | ? |
| No root | Containers run as non-root | ? |
| Read-only filesystem | Immutable where possible | ? |

**Container Runtime:**

| Control | Description | Status |
|---------|-------------|--------|
| Runtime security | Falco, Sysdig, etc. | ? |
| Resource limits | CPU/memory limits set | ? |
| Privilege controls | No privileged containers | ? |
| Network policies | Container network isolation | ? |
| Secrets management | Not in images/env vars | ? |

Are containers part of your environment? If so, how are they secured?"

### 3. Kubernetes Security

"Let's assess Kubernetes security (if applicable):

**Cluster Security:**

| Control | Description | Status |
|---------|-------------|--------|
| API server access | Private, authorized only | ? |
| RBAC | Role-based access control | ? |
| Pod Security Standards | Restricted/baseline enforced | ? |
| Network policies | Inter-pod traffic control | ? |
| Secrets encryption | Encrypted at rest | ? |
| Admission control | OPA, Kyverno, etc. | ? |

**Managed Kubernetes:**

| Provider | Service | Key Controls |
|----------|---------|--------------|
| AWS | EKS | Private endpoint, IRSA |
| Azure | AKS | AAD integration, Azure Policy |
| GCP | GKE | Workload Identity, Binary Auth |

Do you use Kubernetes? If so, describe your security controls."

### 4. Serverless Security

"Let's assess serverless security:

**Function Security:**

| Control | Description | Status |
|---------|-------------|--------|
| Function permissions | Least privilege IAM role | ? |
| VPC integration | Functions in VPC if needed | ? |
| Environment variables | No secrets in plain text | ? |
| Timeout settings | Appropriate limits | ? |
| Dependency security | Vulnerable packages | ? |
| Layers/extensions | Security monitoring | ? |

**API Gateway Security (if applicable):**

| Control | Description | Status |
|---------|-------------|--------|
| Authentication | IAM, JWT, API key | ? |
| Authorization | Request validation | ? |
| Rate limiting | Throttling configured | ? |
| WAF integration | Request filtering | ? |

Do you use serverless functions? How are they secured?"

### 5. Workload Protection

"Let's review workload protection:

**Protection Services:**

| Provider | Services | Enabled |
|----------|----------|---------|
| AWS | Inspector, GuardDuty | ? |
| Azure | Defender for Servers, Defender for Containers | ? |
| GCP | Security Command Center, Container Threat Detection | ? |

**Protection Controls:**

| Control | Status | Coverage |
|---------|--------|----------|
| Vulnerability scanning | ? | [%] |
| Runtime protection | ? | [%] |
| File integrity monitoring | ? | [%] |
| Malware detection | ? | [%] |

What workload protection is deployed?"

### 6. Document Compute Assessment

Update Section 7 of {outputFile}:

```markdown
## 7. Compute Security Assessment

### 7.1 Virtual Machine / Instance Security

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Hardened images | [Pass/Fail] | [Details] | [H/M/L] |
| Metadata protection | [Pass/Fail] | [Details] | [H/M/L] |
| Public exposure | [Pass/Fail] | [Details] | [H/M/L] |
| OS patching | [Pass/Fail] | [Details] | [H/M/L] |
| Endpoint protection | [Pass/Fail] | [Details] | [H/M/L] |
| Secure access | [Pass/Fail] | [Details] | [H/M/L] |

### 7.2 Container Security

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Image scanning | [Pass/Fail] | [Details] | [H/M/L] |
| Private registry | [Pass/Fail] | [Details] | [H/M/L] |
| Non-root execution | [Pass/Fail] | [Details] | [H/M/L] |
| Runtime security | [Pass/Fail] | [Details] | [H/M/L] |
| Secrets management | [Pass/Fail] | [Details] | [H/M/L] |

### 7.3 Kubernetes Security

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| API server security | [Pass/Fail] | [Details] | [H/M/L] |
| RBAC | [Pass/Fail] | [Details] | [H/M/L] |
| Pod Security Standards | [Pass/Fail] | [Details] | [H/M/L] |
| Network policies | [Pass/Fail] | [Details] | [H/M/L] |
| Secrets encryption | [Pass/Fail] | [Details] | [H/M/L] |
| Admission control | [Pass/Fail] | [Details] | [H/M/L] |

### 7.4 Serverless Security

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Function IAM | [Pass/Fail] | [Details] | [H/M/L] |
| Secrets handling | [Pass/Fail] | [Details] | [H/M/L] |
| Dependency security | [Pass/Fail] | [Details] | [H/M/L] |
| API Gateway security | [Pass/Fail] | [Details] | [H/M/L] |

### 7.5 Workload Protection

| Protection Type | Tool/Service | Coverage | Status |
|-----------------|--------------|----------|--------|
| [User data] | | | |

### 7.6 Compute Security Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top Compute Recommendations:**
1. [Highest priority]
2. [Second priority]
3. [Third priority]
```

### 7. Confirmation and Next Step

"**Compute Security Assessment Complete**

I've documented:
- VM/instance hardening status
- Container security controls
- Kubernetes security (if applicable)
- Serverless function security
- Workload protection coverage

Next, we'll map findings to compliance frameworks.

Ready to proceed to compliance mapping?"

## MENU

Display: **Compute Assessment Complete - Select an Option:** [C] Continue to Compliance Mapping [R] Review/Revise Assessment

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 7 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN compute assessment is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
