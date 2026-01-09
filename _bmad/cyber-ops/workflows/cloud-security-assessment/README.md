# Cloud Security Assessment Workflow

## Overview

A comprehensive 9-step workflow for conducting cloud security assessments across AWS, Azure, and GCP environments. This workflow facilitates systematic evaluation of IAM, network security, data protection, logging, compute security, and compliance posture.

## Workflow Structure

```
cloud-security-assessment/
├── workflow.md                 # Main workflow definition
├── README.md                   # This file
├── steps/
│   ├── step-01-init.md            # Initialization & scope definition
│   ├── step-01b-continue.md       # Continuation handler
│   ├── step-02-iam-assessment.md  # IAM security review
│   ├── step-03-network-security.md # Network & perimeter assessment
│   ├── step-04-data-protection.md  # Encryption & secrets review
│   ├── step-05-logging-monitoring.md # Audit & alerting assessment
│   ├── step-06-compute-security.md # VM, container, serverless review
│   ├── step-07-compliance-mapping.md # Framework mapping
│   ├── step-08-remediation.md      # Remediation roadmap
│   └── step-09-report-generation.md # Final report generation
└── templates/
    ├── cloud-security-report-template.md  # Full assessment report
    └── iam-review-template.md             # Detailed IAM worksheet
```

## Prerequisites

- Access to cloud environment(s) for assessment
- Read-only credentials or security auditor role
- List of compliance frameworks in scope
- Previous assessment reports (if available)
- Architecture documentation (optional)

## Steps Overview

### Step 1: Initialization

- Define assessment scope (accounts, regions, services)
- Select cloud provider(s): AWS, Azure, GCP, or multi-cloud
- Identify compliance frameworks in scope
- Set up output document structure

### Step 2: IAM Assessment

- Root/admin account security review
- User access management (MFA, password policy)
- Role and policy analysis (least privilege)
- Service account security
- Cross-account access review

### Step 3: Network Security

- VPC/VNet architecture review
- Security groups and NACLs
- Perimeter security (WAF, DDoS)
- Connectivity security (VPN, private links)
- DNS and CDN security

### Step 4: Data Protection

- Encryption at rest (default, CMK)
- Encryption in transit (TLS enforcement)
- Key management (KMS, HSM)
- Storage security (public access blocks)
- Secrets management

### Step 5: Logging & Monitoring

- Cloud audit logging (CloudTrail, Activity Log)
- Service-level logging coverage
- SIEM integration status
- Security alerting rules
- Log protection and retention

### Step 6: Compute Security

- VM/instance hardening
- Container security (images, runtime)
- Kubernetes security (if applicable)
- Serverless function security
- Workload protection tools

### Step 7: Compliance Mapping

- CIS Benchmark mapping
- SOC 2 Trust Service Criteria
- PCI-DSS, HIPAA (if applicable)
- Other framework mapping
- Gap analysis and prioritization

### Step 8: Remediation Planning

- Finding consolidation by severity
- Risk-based prioritization
- Remediation roadmap creation
- IaC remediation examples
- Quick wins identification

### Step 9: Report Generation

- Executive summary generation
- Risk scoring by domain
- Appendices completion
- Report validation checklist
- Final deliverable creation

## Usage

### Starting a New Assessment

```bash
# Invoke the workflow via agent menu or directly
/cloud-security-assessment
```

Or invoke through the Nimbus (Cloud Security Specialist) agent:

```bash
# Start Nimbus agent
bmad:cyber-ops:agents:cloud-security-specialist

# Select menu option for Cloud Security Assessment
```

### Continuing a Paused Assessment

The workflow automatically detects existing progress:

1. If output file exists with partial content, step-01b-continue.md activates
2. Displays current progress and completed sections
3. Offers to resume from last step or jump to specific section

### Output

The workflow produces a comprehensive assessment report at:

```
{output_folder}/security/cloud-security-assessment-{project_name}.md
```

## Provider-Specific Coverage

### AWS

- CloudTrail, Config, GuardDuty, Security Hub
- IAM Access Analyzer, Organizations SCPs
- VPC Flow Logs, Network Firewall
- KMS, Secrets Manager
- EKS, ECS, Lambda security

### Azure

- Activity Log, Microsoft Defender for Cloud
- Azure AD, PIM, Conditional Access
- Network Security Groups, Azure Firewall
- Key Vault, Managed Identities
- AKS, Container Instances, Functions

### GCP

- Cloud Audit Logs, Security Command Center
- IAM, Organization Policies
- VPC Service Controls, Cloud Armor
- Cloud KMS, Secret Manager
- GKE, Cloud Run, Cloud Functions

## Compliance Frameworks Supported

- **CIS Benchmarks**: AWS, Azure, GCP (Level 1 & 2)
- **SOC 2**: Trust Service Criteria mapping
- **PCI-DSS**: Relevant cloud controls
- **HIPAA**: Technical safeguards
- **NIST CSF**: Core functions mapping
- **ISO 27001**: Annex A controls
- **FedRAMP**: Control families

## Integration with Other Workflows

| Workflow | Integration Point |
|----------|-------------------|
| Security Architecture Review | Architecture findings inform cloud assessment |
| Incident Response Playbook | Cloud monitoring gaps inform IR planning |
| Compliance Audit Prep | Assessment feeds audit readiness |
| Threat Modeling | Cloud attack vectors input |

## Best Practices

1. **Scope Carefully**: Start with production environments, expand to dev/staging
2. **Document Evidence**: Capture screenshots and CLI outputs for findings
3. **Involve Stakeholders**: Include cloud team in remediation planning
4. **Prioritize by Risk**: Focus on critical findings first
5. **Provide IaC**: Include infrastructure-as-code for remediation
6. **Track Progress**: Use the remediation tracker template
7. **Schedule Reassessment**: Plan follow-up in 3-6 months

## Templates Included

### cloud-security-report-template.md

Full assessment report structure including:

- Executive summary
- Detailed findings by domain
- Compliance mapping tables
- Remediation roadmap
- Appendices (methodology, glossary)

### iam-review-template.md

Detailed IAM review worksheet including:

- Account inventory tables
- Access control metrics
- Policy analysis checklists
- CIS benchmark mapping (IAM section)
- IaC remediation examples

## Related Agents

- **Nimbus** (Cloud Security Specialist): Primary agent for this workflow
- **Shield** (Blue Team Lead): Detection and monitoring focus
- **Watchman** (SOC Analyst): Log analysis and alerting
- **Spectre** (Penetration Tester): Attack surface validation

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01 | Initial workflow creation |
