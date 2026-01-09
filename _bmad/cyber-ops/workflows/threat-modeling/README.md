# STRIDE Threat Modeling Workflow

## Overview

An iterative-linear workflow for systematic threat modeling using the STRIDE methodology. Guides security teams through identifying threats, assessing risks, and developing mitigations for applications, systems, and architectures.

## Workflow Structure

```
threat-modeling/
├── workflow.md
├── README.md
└── steps/
    ├── step-01-init.md
    ├── step-01b-continue.md
    ├── step-02-scope-definition.md
    ├── step-03-decomposition.md
    ├── step-04-threat-identification.md
    ├── step-05-stride-analysis.md
    ├── step-06-risk-assessment.md
    ├── step-07-mitigation-planning.md
    ├── step-08-documentation.md
    └── step-09-review-iteration.md
```

## STRIDE Categories

| Category | Threat Type | Security Property |
|----------|-------------|-------------------|
| **S**poofing | Identity impersonation | Authentication |
| **T**ampering | Data modification | Integrity |
| **R**epudiation | Action denial | Non-repudiation |
| **I**nformation Disclosure | Data exposure | Confidentiality |
| **D**enial of Service | Availability attacks | Availability |
| **E**levation of Privilege | Unauthorized access | Authorization |

## Coverage

- **Scope Definition**: System boundaries, trust boundaries, data flows
- **Decomposition**: Component analysis, DFD creation
- **Threat Identification**: Per-element STRIDE analysis
- **Risk Assessment**: DREAD scoring, prioritization
- **Mitigation Planning**: Security controls, countermeasures
- **Documentation**: Threat model artifacts, tracking

## Frameworks

- Microsoft STRIDE
- NIST SP 800-30 (Risk Assessment)
- OWASP Threat Modeling

## Use Cases

- New application security reviews
- Architecture design validation
- Pre-release security assessments
- Compliance documentation
- Security debt prioritization

## Related Agents

- **Bastion** (Security Architect): Primary agent for this workflow
- **Cipher** (Threat Analyst): For threat intelligence context
- **Weaver** (Web App Security): For application-specific threats
- **Gateway** (API Security): For API threat analysis

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01 | Initial workflow |
