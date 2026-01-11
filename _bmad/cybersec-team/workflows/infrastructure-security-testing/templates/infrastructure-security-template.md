---
name: 'infrastructure-security-template'
description: 'Infrastructure security assessment report template'
version: '1.0'
---

# Infrastructure Security Assessment Report

## Executive Summary

**Client:** {client_name}
**Environment:** {environment}
**Assessment Date:** {date}
**Assessor:** {assessor}

### Overall Risk Rating: [Critical/High/Medium/Low]

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Server Hardening | | | | |
| Container Security | | | | |
| Kubernetes | | | | |
| CI/CD Pipeline | | | | |
| Secrets Management | | | | |
| Infrastructure as Code | | | | |
| **Total** | | | | |

### Key Findings

1. **[Title]** - [Severity] - [Brief description]
2. **[Title]** - [Severity] - [Brief description]
3. **[Title]** - [Severity] - [Brief description]

---

## Scope

### Infrastructure Components

| Component | Type | Version | Notes |
|-----------|------|---------|-------|
| | | | |

### Assessment Areas

- [ ] Server Hardening
- [ ] Container Security
- [ ] Kubernetes Security
- [ ] CI/CD Pipeline Security
- [ ] Secrets Management
- [ ] Infrastructure as Code

### Access Level

[Description of access provided]

---

## Methodology

Assessment performed according to:
- CIS Benchmarks
- NIST Cybersecurity Framework
- OWASP Guidelines
- Cloud Provider Best Practices

### Tools Used

- Checkov / tfsec
- Trivy / Grype
- Kube-bench / Kubesec
- Docker Bench for Security
- Custom scripts

---

## Findings

### Critical

#### [INFRA-001]: [Title]

**Severity:** Critical
**Category:** [Server/Container/K8s/CICD/Secrets/IaC]
**Affected Resources:** [List]
**Status:** Open

**Description:**
[Detailed description]

**Evidence:**
```
[Commands/output/screenshots]
```

**Impact:**
[Business and technical impact]

**Remediation:**
[Fix recommendation with code example]

**References:**
- [CIS Benchmark X.X.X]
- [Relevant documentation]

---

### High

#### [INFRA-002]: [Title]

[Same format]

---

### Medium

#### [INFRA-003]: [Title]

[Same format]

---

### Low

#### [INFRA-004]: [Title]

[Same format]

---

## Compliance Mapping

### CIS Benchmarks

| Benchmark | Control | Status | Finding |
|-----------|---------|--------|---------|
| | | | |

### SOC 2 (if applicable)

| Control | Status | Notes |
|---------|--------|-------|
| | | |

---

## Remediation Roadmap

### Immediate (0-48 hours)

- [ ] [Critical action with owner]

### Short-term (1-2 weeks)

- [ ] [High priority action with owner]

### Medium-term (1 month)

- [ ] [Medium priority action with owner]

### Long-term

- [ ] [Strategic improvements]

---

## Appendix

### A. Tool Output

[Detailed scanner output]

### B. Configuration Samples

[Secure configuration examples]

### C. Reference Architecture

[Secure architecture recommendations]

---

## Disclaimer

This report represents a point-in-time security assessment. New vulnerabilities may emerge after testing concludes. Regular security testing is recommended.

---

**Report Prepared By:** {assessor}
**Date:** {date}
**Methodology:** CIS Benchmarks, NIST, OWASP
