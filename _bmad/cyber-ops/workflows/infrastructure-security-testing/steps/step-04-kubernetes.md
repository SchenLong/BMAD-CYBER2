---
name: 'step-04-kubernetes'
description: 'Kubernetes cluster security assessment'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/infrastructure-security-testing'
thisStepFile: '{workflow_path}/steps/step-04-kubernetes.md'
nextStepFile: '{workflow_path}/steps/step-05-cicd-security.md'
outputFile: '{output_folder}/security/infrastructure-security-testing-{project_name}.md'
---

# Step 4: Kubernetes Security Assessment

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide Kubernetes security assessment

## SCOPE CHECK

"Is Kubernetes in scope for this assessment?

If NO: Select [S] to skip to CI/CD security.
If YES: Continue with Kubernetes security testing below."

## KUBERNETES SECURITY SEQUENCE:

### 1. Cluster Overview

"Let's understand your Kubernetes environment.

**Cluster Information:**
- Kubernetes version?
- Distribution (EKS, GKE, AKS, OpenShift, vanilla)?
- Number of clusters?
- Node count and types?

**Access Level:**
- kubectl access configured?
- RBAC permissions level?
- Namespace restrictions?

**Commands:**
```bash
# Cluster info
kubectl cluster-info
kubectl version --short

# Node info
kubectl get nodes -o wide

# Namespace inventory
kubectl get namespaces
```

What is your Kubernetes setup?"

### 2. RBAC Configuration

"Let's review Role-Based Access Control.

**RBAC Analysis:**
- ClusterRoles and Roles defined?
- Least privilege enforced?
- Service accounts properly scoped?
- No default service account abuse?

**High-Risk Permissions:**
- cluster-admin bindings
- secrets access
- pod exec/attach
- pod create/delete

**Commands:**
```bash
# List ClusterRoleBindings
kubectl get clusterrolebindings

# Check for cluster-admin
kubectl get clusterrolebindings -o json | \
  jq '.items[] | select(.roleRef.name=="cluster-admin")'

# List service accounts
kubectl get serviceaccounts --all-namespaces
```

What RBAC configuration have you reviewed?"

### 3. Pod Security

"Testing pod security configurations.

**Pod Security Standards:**
- Privileged pods?
- Host namespace access?
- Privilege escalation allowed?
- Root containers?
- Capabilities added?

**Security Contexts:**
- runAsNonRoot enforced?
- readOnlyRootFilesystem?
- allowPrivilegeEscalation: false?
- seccompProfile set?

**Commands:**
```bash
# Find privileged pods
kubectl get pods --all-namespaces -o json | \
  jq '.items[] | select(.spec.containers[].securityContext.privileged==true)'

# Find root containers
kubectl get pods --all-namespaces -o json | \
  jq '.items[] | select(.spec.containers[].securityContext.runAsNonRoot!=true)'

# Check for hostPID/hostNetwork
kubectl get pods --all-namespaces -o json | \
  jq '.items[] | select(.spec.hostPID==true or .spec.hostNetwork==true)'
```

What pod security issues have you found?"

### 4. Network Policies

"Reviewing Kubernetes network security.

**Network Policies:**
- Default deny policies?
- Ingress/egress controls?
- Namespace isolation?
- CNI supports policies?

**Service Exposure:**
- Services with external IPs?
- LoadBalancer services?
- NodePort services?
- Ingress controllers?

**Commands:**
```bash
# List network policies
kubectl get networkpolicies --all-namespaces

# Find external services
kubectl get services --all-namespaces -o wide | \
  grep -E '(LoadBalancer|NodePort)'

# List ingresses
kubectl get ingress --all-namespaces
```

What network policies are in place?"

### 5. Secrets Management

"Reviewing Kubernetes secrets handling.

**Secrets Security:**
- Encryption at rest enabled?
- Secrets mounted as files or env vars?
- External secrets operator used?
- Secrets rotation?

**Commands:**
```bash
# List secrets
kubectl get secrets --all-namespaces

# Check secret usage in pods
kubectl get pods --all-namespaces -o json | \
  jq '.items[].spec.containers[].env[]? | select(.valueFrom.secretKeyRef)'

# Check etcd encryption config (requires access)
```

What secrets management practices are in use?"

### 6. API Server Security

"Reviewing Kubernetes API server configuration.

**API Server Controls:**
- Authentication methods?
- Anonymous auth disabled?
- ABAC vs RBAC?
- Audit logging enabled?
- Admission controllers?

**etcd Security:**
- TLS client certs?
- Encryption at rest?
- Access restricted?

**Commands:**
```bash
# Check API server flags (if accessible)
kubectl get pods -n kube-system kube-apiserver-* -o yaml

# Check admission controllers
kubectl api-versions
```

What API server configuration have you reviewed?"

### 7. Kube-bench Assessment

"Let's run kube-bench for CIS benchmarks.

**Kube-bench Checks:**
- Control plane security
- etcd configuration
- Control plane configuration
- Worker node security
- Kubernetes policies

**Command:**
```bash
# Run kube-bench
kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml

# Get results
kubectl logs job/kube-bench
```

What kube-bench results do you have?"

### 8. Document Kubernetes Security

Append to {outputFile} Section 4:

```markdown
## 4. Kubernetes Security Assessment

### 4.1 Cluster Overview
| Cluster | Version | Distribution | Nodes |
|---------|---------|--------------|-------|
| | | | |

### 4.2 RBAC Analysis
| Finding | Resource | Risk | Recommendation |
|---------|----------|------|----------------|
| cluster-admin bindings | | | |
| Overly permissive roles | | | |
| Default SA abuse | | | |

### 4.3 Pod Security
| Issue | Namespace | Pods Affected | Risk |
|-------|-----------|---------------|------|
| Privileged pods | | | |
| Root containers | | | |
| Host access | | | |

### 4.4 Network Policies
| Namespace | Default Deny | Ingress Policy | Egress Policy |
|-----------|--------------|----------------|---------------|
| | | | |

### 4.5 Secrets Management
| Control | Status | Finding |
|---------|--------|---------|
| Encryption at rest | | |
| External secrets | | |
| Secret rotation | | |

### 4.6 API Server Security
| Control | Status | Finding |
|---------|--------|---------|
| Authentication | | |
| Audit logging | | |
| Admission controllers | | |

### 4.7 Kube-bench Results
| Section | Score | Key Findings |
|---------|-------|--------------|
| Control Plane | | |
| etcd | | |
| Workers | | |
| Policies | | |

### 4.8 Kubernetes Findings
| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| K8S-001 | | | |
```

### 9. Confirmation

"**Kubernetes Security Assessment Complete**

**Summary:**
- Clusters assessed: [count]
- RBAC issues: [count]
- Pod security issues: [count]
- Kube-bench score: [X/Y]

Ready to proceed to CI/CD security?"

## MENU

Display: [C] Continue to CI/CD Security [R] Review/Add Findings [S] Skip to Secrets

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3, 4]`, then execute {nextStepFile}.
