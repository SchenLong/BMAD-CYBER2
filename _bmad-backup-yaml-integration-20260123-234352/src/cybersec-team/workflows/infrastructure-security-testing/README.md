# Infrastructure Security Testing Workflow

## Overview

A comprehensive 8-step workflow for infrastructure security assessment covering server hardening, container security, Kubernetes, CI/CD pipelines, secrets management, and Infrastructure as Code security following CIS benchmarks and industry best practices.

## Workflow Structure

```
infrastructure-security-testing/
├── workflow.md
├── README.md
├── steps/
│   ├── step-01-init.md
│   ├── step-01b-continue.md
│   ├── step-02-server-hardening.md
│   ├── step-03-container-security.md
│   ├── step-04-kubernetes.md
│   ├── step-05-cicd-security.md
│   ├── step-06-secrets-management.md
│   ├── step-07-iac-review.md
│   └── step-08-findings-remediation.md
└── templates/
    └── infrastructure-security-template.md
```

## Coverage

- **Server Hardening**: CIS benchmarks for Linux/Windows, user access, network config
- **Container Security**: Image scanning, Dockerfile review, runtime security
- **Kubernetes**: RBAC, pod security, network policies, kube-bench
- **CI/CD Security**: Pipeline security, runner configuration, supply chain
- **Secrets Management**: Vault review, secrets scanning, lifecycle management
- **Infrastructure as Code**: Terraform, CloudFormation, Kubernetes manifest security

## Tools Supported

- Checkov, tfsec, KICS, Terrascan
- Trivy, Grype, Docker Scout
- Kube-bench, Kubesec, Polaris
- Trufflehog, GitLeaks, detect-secrets
- Docker Bench for Security
- Custom scripts and auditing

## Related Agents

- **Nimbus** (Cloud Security): For cloud-specific assessments
- **Shield** (Blue Team): For defensive recommendations
- **Spectre** (Pentest): For exploitation testing
- **Gateway** (API Security): For API infrastructure

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01 | Initial workflow |
