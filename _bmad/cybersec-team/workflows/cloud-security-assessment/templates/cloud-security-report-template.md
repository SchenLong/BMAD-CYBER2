---
name: 'cloud-security-report-template'
description: 'Template for comprehensive cloud security assessment reports'
version: '1.0'
---

# Cloud Security Assessment Report

## Document Information

| Field | Value |
|-------|-------|
| **Project Name** | {project_name} |
| **Assessment Date** | {assessment_date} |
| **Assessor** | {user_name}, Claude (Nimbus) |
| **Cloud Provider(s)** | [AWS / Azure / GCP / Multi-cloud] |
| **Report Version** | 1.0 |

---

## 1. Executive Summary

### Assessment Overview

This Cloud Security Assessment was conducted for {project_name} to evaluate the security posture of cloud infrastructure across [cloud provider(s)].

**Assessment Scope:**

- [ ] cloud accounts/subscriptions
- [ ] services evaluated
- [ ] compliance frameworks mapped

**Assessment Period:** [Start Date] - [End Date]

### Key Findings

**Findings Distribution:**

| Severity | Count |
|----------|-------|
| Critical | [X] |
| High | [X] |
| Medium | [X] |
| Low | [X] |
| **Total** | [X] |

**Top 5 Critical Findings:**

1. [Finding 1]
2. [Finding 2]
3. [Finding 3]
4. [Finding 4]
5. [Finding 5]

### Risk Assessment

**Overall Risk Score:** [Score] / 100
**Risk Rating:** [Low/Moderate/High/Critical]

**Risk by Domain:**

| Domain | Risk Score | Rating |
|--------|------------|--------|
| IAM | | |
| Network | | |
| Data Protection | | |
| Logging | | |
| Compute | | |

### Compliance Posture

| Framework | Compliance % | Status |
|-----------|--------------|--------|
| [Framework 1] | % | [Pass/Partial/Fail] |
| [Framework 2] | % | [Pass/Partial/Fail] |

### Recommendations Summary

**Immediate Actions (Week 1):**

1. [Action 1]
2. [Action 2]
3. [Action 3]

**Short-term (Month 1):**

1. [Action 1]
2. [Action 2]
3. [Action 3]

**Strategic Improvements:**

1. [Improvement 1]
2. [Improvement 2]

---

## 2. Assessment Overview

### Scope Definition

**Cloud Environment:**

| Provider | Account/Subscription | Region(s) | Environment |
|----------|---------------------|-----------|-------------|
| [Provider] | [ID] | [Regions] | [Prod/Dev/Stage] |

**Services in Scope:**

| Category | Services |
|----------|----------|
| Compute | [EC2, VMs, GCE, Lambda, Functions, Cloud Run] |
| Storage | [S3, Blob, GCS, EFS, etc.] |
| Database | [RDS, SQL, Spanner, DynamoDB, etc.] |
| Networking | [VPC, VNet, Subnets, etc.] |
| Identity | [IAM, Azure AD, etc.] |
| Containers | [EKS, AKS, GKE, ECS, etc.] |

**Exclusions:**

- [List any out-of-scope items]

### Methodology

**Assessment Approach:**

- Configuration review against CIS Benchmarks
- Architecture analysis for security design
- Compliance mapping to [frameworks]
- Manual expert review

**Tools Used:**

- [Cloud-native security tools]
- [Third-party CSPM tools]
- Manual review

---

## 3. IAM Security Assessment

### 3.1 Root/Admin Account Security

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Root account MFA | [Pass/Fail] | [Details] | [H/M/L] |
| Root account usage | [Pass/Fail] | [Details] | [H/M/L] |
| Admin account inventory | [Pass/Fail] | [Details] | [H/M/L] |
| Break-glass procedures | [Pass/Fail] | [Details] | [H/M/L] |

### 3.2 User Access Management

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| MFA enforcement | [Pass/Fail] | [Details] | [H/M/L] |
| Password policy | [Pass/Fail] | [Details] | [H/M/L] |
| Inactive user cleanup | [Pass/Fail] | [Details] | [H/M/L] |
| Access key rotation | [Pass/Fail] | [Details] | [H/M/L] |

### 3.3 Role & Policy Management

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Least privilege | [Pass/Fail] | [Details] | [H/M/L] |
| Role boundaries | [Pass/Fail] | [Details] | [H/M/L] |
| Policy review process | [Pass/Fail] | [Details] | [H/M/L] |
| Cross-account access | [Pass/Fail] | [Details] | [H/M/L] |

### 3.4 Service Account Security

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Service account inventory | [Pass/Fail] | [Details] | [H/M/L] |
| Key management | [Pass/Fail] | [Details] | [H/M/L] |
| Permission scope | [Pass/Fail] | [Details] | [H/M/L] |

### 3.5 IAM Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top IAM Recommendations:**

1. [Highest priority]
2. [Second priority]
3. [Third priority]

---

## 4. Network Security Assessment

### 4.1 VPC/VNet Architecture

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Network segmentation | [Pass/Fail] | [Details] | [H/M/L] |
| Subnet design | [Pass/Fail] | [Details] | [H/M/L] |
| Private connectivity | [Pass/Fail] | [Details] | [H/M/L] |
| Transit architecture | [Pass/Fail] | [Details] | [H/M/L] |

### 4.2 Security Groups / NSGs

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Default deny | [Pass/Fail] | [Details] | [H/M/L] |
| Overly permissive rules | [Pass/Fail] | [Details] | [H/M/L] |
| 0.0.0.0/0 access | [Pass/Fail] | [Details] | [H/M/L] |
| Unused rules | [Pass/Fail] | [Details] | [H/M/L] |

### 4.3 Perimeter Security

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| WAF configuration | [Pass/Fail] | [Details] | [H/M/L] |
| DDoS protection | [Pass/Fail] | [Details] | [H/M/L] |
| Edge security | [Pass/Fail] | [Details] | [H/M/L] |
| CDN security | [Pass/Fail] | [Details] | [H/M/L] |

### 4.4 Connectivity Security

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| VPN configuration | [Pass/Fail] | [Details] | [H/M/L] |
| Direct Connect/ExpressRoute | [Pass/Fail] | [Details] | [H/M/L] |
| DNS security | [Pass/Fail] | [Details] | [H/M/L] |
| Private endpoints | [Pass/Fail] | [Details] | [H/M/L] |

### 4.5 Network Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top Network Recommendations:**

1. [Highest priority]
2. [Second priority]
3. [Third priority]

---

## 5. Data Protection Assessment

### 5.1 Encryption at Rest

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Default encryption | [Pass/Fail] | [Details] | [H/M/L] |
| CMK usage | [Pass/Fail] | [Details] | [H/M/L] |
| Key rotation | [Pass/Fail] | [Details] | [H/M/L] |
| Encryption coverage | [Details] | [Finding] | [H/M/L] |

### 5.2 Encryption in Transit

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| TLS enforcement | [Pass/Fail] | [Details] | [H/M/L] |
| Certificate management | [Pass/Fail] | [Details] | [H/M/L] |
| Minimum TLS version | [Pass/Fail] | [Details] | [H/M/L] |

### 5.3 Key Management

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| KMS configuration | [Pass/Fail] | [Details] | [H/M/L] |
| Key policies | [Pass/Fail] | [Details] | [H/M/L] |
| HSM usage | [Pass/Fail] | [Details] | [H/M/L] |
| Key access audit | [Pass/Fail] | [Details] | [H/M/L] |

### 5.4 Storage Security

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Public access blocks | [Pass/Fail] | [Details] | [H/M/L] |
| Bucket policies | [Pass/Fail] | [Details] | [H/M/L] |
| Versioning | [Pass/Fail] | [Details] | [H/M/L] |
| Lifecycle policies | [Pass/Fail] | [Details] | [H/M/L] |
| Data classification | [Pass/Fail] | [Details] | [H/M/L] |

### 5.5 Secrets Management

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Secrets Manager/Vault | [Pass/Fail] | [Details] | [H/M/L] |
| Secret rotation | [Pass/Fail] | [Details] | [H/M/L] |
| Access controls | [Pass/Fail] | [Details] | [H/M/L] |
| No hardcoded secrets | [Pass/Fail] | [Details] | [H/M/L] |

### 5.6 Data Protection Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top Data Protection Recommendations:**

1. [Highest priority]
2. [Second priority]
3. [Third priority]

---

## 6. Logging & Monitoring Assessment

### 6.1 Cloud Audit Logging

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Multi-region enabled | [Pass/Fail] | [Details] | [H/M/L] |
| Management events | [Pass/Fail] | [Details] | [H/M/L] |
| Data events | [Pass/Fail] | [Details] | [H/M/L] |
| Log integrity | [Pass/Fail] | [Details] | [H/M/L] |
| Secure storage | [Pass/Fail] | [Details] | [H/M/L] |
| Retention | [Details] | [Finding] | [H/M/L] |

### 6.2 Service-Level Logging

| Service | Log Type | Enabled | Retention | SIEM Integrated |
|---------|----------|---------|-----------|-----------------|
| [Service] | [Type] | [Yes/No] | [Days] | [Yes/No] |

**Logging Gaps:**
[Services without logging]

### 6.3 SIEM Integration

**SIEM Platform:** [Platform name]
**Cloud Log Sources Integrated:** [Count/list]

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Log ingestion | [Pass/Fail] | [Details] | [H/M/L] |
| Real-time processing | [Pass/Fail] | [Details] | [H/M/L] |
| Cross-cloud correlation | [Pass/Fail] | [Details] | [H/M/L] |

**Cloud-Native Security Tools:**

| Tool | Status | Findings Integration |
|------|--------|---------------------|
| [Tool] | [Enabled/Disabled] | [Yes/No] |

### 6.4 Security Alerting

| Alert Category | Rules Defined | Destination | Response Procedure |
|----------------|---------------|-------------|-------------------|
| [Category] | [Count] | [Destination] | [Yes/No] |

**Missing Alert Categories:**
[Critical alerts not configured]

### 6.5 Log Protection

| Control | Status | Finding | Risk |
|---------|--------|---------|------|
| Encryption | [Pass/Fail] | [Details] | [H/M/L] |
| Access control | [Pass/Fail] | [Details] | [H/M/L] |
| Immutability | [Pass/Fail] | [Details] | [H/M/L] |
| Cross-account storage | [Pass/Fail] | [Details] | [H/M/L] |

### 6.6 Logging Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top Logging Recommendations:**

1. [Highest priority]
2. [Second priority]
3. [Third priority]

---

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
| [Type] | [Tool] | [%] | [Active/Inactive] |

### 7.6 Compute Security Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top Compute Recommendations:**

1. [Highest priority]
2. [Second priority]
3. [Third priority]

---

## 8. Compliance Mapping

### 8.1 Framework Coverage Summary

| Framework | In Scope | Controls Evaluated | Compliant | Gaps |
|-----------|----------|-------------------|-----------|------|
| [Framework] | [Yes/No] | [Count] | [Count] | [Count] |

### 8.2 CIS Benchmark Mapping

**Benchmark Version:** [Version]
**Target Level:** [Level 1/2]

| Section | Description | Pass | Fail | N/A |
|---------|-------------|------|------|-----|
| 1 | Identity and Access Management | | | |
| 2 | Logging | | | |
| 3 | Monitoring | | | |
| 4 | Networking | | | |
| 5 | Storage | | | |

**Critical CIS Failures:**

| Control ID | Description | Finding | Remediation |
|------------|-------------|---------|-------------|
| [ID] | [Description] | [Finding] | [Fix] |

### 8.3 SOC 2 Mapping

| Trust Service Criteria | Status | Gaps | Evidence |
|------------------------|--------|------|----------|
| Security (CC) | [Pass/Partial/Fail] | [Details] | [Reference] |
| Availability (A) | [Pass/Partial/Fail] | [Details] | [Reference] |
| Confidentiality (C) | [Pass/Partial/Fail] | [Details] | [Reference] |

### 8.4 Additional Framework Mapping

[Framework-specific tables as applicable]

### 8.5 Compliance Gap Summary

| Gap Category | Count | Highest Severity | Frameworks Affected |
|--------------|-------|------------------|---------------------|
| IAM | | | |
| Network | | | |
| Data Protection | | | |
| Logging | | | |
| Compute | | | |

### 8.6 Compliance Recommendations

**Priority 1 - Audit Failures:**
[Gaps that would fail compliance audits]

**Priority 2 - Multi-Framework Gaps:**
[Gaps affecting multiple frameworks]

**Priority 3 - Quick Wins:**
[Low-effort high-compliance-impact fixes]

---

## 9. Remediation Roadmap

### 9.1 Findings Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| IAM | | | | | |
| Network | | | | | |
| Data Protection | | | | | |
| Logging | | | | | |
| Compute | | | | | |
| **Total** | | | | | |

### 9.2 Priority 1 - Critical (Week 1-2)

| ID | Finding | Remediation | IaC Available | Owner | Due |
|----|---------|-------------|---------------|-------|-----|
| [ID] | [Finding] | [Steps] | [Yes/No] | [Team] | [Date] |

### 9.3 Priority 2 - High (Month 1)

| ID | Finding | Remediation | IaC Available | Owner | Due |
|----|---------|-------------|---------------|-------|-----|
| [ID] | [Finding] | [Steps] | [Yes/No] | [Team] | [Date] |

### 9.4 Priority 3 - Medium (Months 2-3)

| ID | Finding | Remediation | Owner | Due |
|----|---------|-------------|-------|-----|
| [ID] | [Finding] | [Steps] | [Team] | [Date] |

### 9.5 Priority 4 - Low (Months 4+)

| ID | Finding | Remediation | Owner | Due |
|----|---------|-------------|-------|-----|
| [ID] | [Finding] | [Steps] | [Team] | [Date] |

### 9.6 Quick Wins

| Finding | Action | Effort | Impact |
|---------|--------|--------|--------|
| [Finding] | [Action] | [Low/Med] | [High] |

### 9.7 IaC Remediation Examples

**Example 1: [Finding]**

```hcl
# Terraform example
[Code snippet]
```

**Example 2: [Finding]**

```yaml
# CloudFormation example
[Code snippet]
```

### 9.8 Roadmap Timeline

| Phase | Timeline | Focus | Findings Count |
|-------|----------|-------|----------------|
| Phase 1 | Week 1-2 | Critical fixes | |
| Phase 2 | Month 1 | High priority | |
| Phase 3 | Months 2-3 | Medium priority | |
| Phase 4 | Months 4+ | Low priority | |

### 9.9 Resource Requirements

| Phase | Estimated Effort | Teams Involved |
|-------|------------------|----------------|
| [Phase] | [Person-days] | [Teams] |

### 9.10 Success Metrics

| Milestone | Metric | Target Date |
|-----------|--------|-------------|
| P1 complete | 0 critical findings | |
| P2 complete | 0 high findings | |
| Compliance ready | [Framework] compliant | |

---

## 10. Appendices

### Appendix A: Assessment Methodology

**Assessment Approach:**

- Configuration review against CIS Benchmarks
- Architecture analysis for security design
- Compliance mapping to [frameworks]

**Tools Used:**

- [Cloud-native security tools]
- [Third-party CSPM tools]
- Manual review

**Limitations:**

- [Any scope limitations]
- [Access limitations]
- [Time constraints]

### Appendix B: Detailed Findings

[Reference to detailed finding sections in Sections 3-7]

### Appendix C: References

**Benchmarks and Frameworks:**

- CIS Benchmark [Provider] v[X]
- SOC 2 Type II
- [Other frameworks]

**Cloud Provider Documentation:**

- [Provider] Security Best Practices
- [Provider] Well-Architected Framework

### Appendix D: Glossary

| Term | Definition |
|------|------------|
| IAM | Identity and Access Management |
| VPC | Virtual Private Cloud |
| CMK | Customer Managed Key |
| CSPM | Cloud Security Posture Management |
| NSG | Network Security Group |
| WAF | Web Application Firewall |
| KMS | Key Management Service |
| SIEM | Security Information and Event Management |
| EDR | Endpoint Detection and Response |
| RBAC | Role-Based Access Control |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {assessment_date} | {user_name} | Initial assessment |
