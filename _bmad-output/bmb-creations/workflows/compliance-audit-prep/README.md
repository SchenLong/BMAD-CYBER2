# Compliance Audit Preparation Workflow

**Status:** ✅ Complete and ready for deployment
**Created:** 2026-01-08
**Module:** cyber-ops (Cybersecurity Operations)
**Lead Agent:** Sentinel (Compliance Guardian)

---

## Overview

Comprehensive compliance audit preparation workflow supporting 20+ frameworks including NIST, SOC2, PCI-DSS, HIPAA, GDPR, and new EU regulations (NIS2, CRA, CSA, DORA, AI Act).

## Purpose

Organizations need systematic, repeatable processes to prepare for compliance audits. This workflow guides teams through gap assessments, control mapping, evidence collection, and remediation planning to ensure audit readiness.

## Supported Frameworks (20+)

### Global Standards
- NIST 800-53 - Federal information security controls
- ISO 27001 - Information security management
- CIS Controls v8 - Center for Internet Security critical controls

### US Regulations
- SOC 2 Type II - Service organization controls
- PCI-DSS - Payment card industry data security
- HIPAA - Healthcare information privacy and security
- FedRAMP - Federal cloud security
- CMMC - Cybersecurity Maturity Model Certification

### EU Regulations
- GDPR - General Data Protection Regulation
- NIS2 Directive - Network and Information Security
- CRA - Cyber Resilience Act (product security)
- CSA - Cyber Security Act (EU cybersecurity certification)
- DORA - Digital Operational Resilience Act (financial)
- AI Act - EU Artificial Intelligence Act

### Industry-Specific
- TISAX - Automotive industry security
- SWIFT CSP - Financial messaging security
- NERC CIP - Energy sector critical infrastructure

### Cloud & SaaS
- CSA STAR - Cloud Security Alliance
- ISO 27017 - Cloud services security
- ISO 27018 - Cloud privacy

## Workflow Structure

**Total Steps:** 7 + continuation

### Step 1: Initialization & Framework Selection
- Select target framework(s)
- Define audit scope (systems, data, organization)
- Set audit timeline
- **Output:** Audit Overview (Section 1)

### Step 2: Control Inventory
- Document existing security controls
- Map controls to framework requirements
- Assign control ownership
- Identify evidence sources
- **Output:** Control Mapping Matrix (Section 2)

### Step 3: Gap Assessment
- Identify missing/insufficient controls
- Assess gap severity (risk, audit impact)
- Prioritize gaps (P0-P4)
- **Output:** Gap Analysis (Section 3)

### Step 4: Evidence Planning
- Plan evidence collection for each control
- Create evidence matrix
- Identify evidence gaps
- Define collection procedures
- **Output:** Evidence Collection Plan (Section 4)

### Step 5: Remediation Planning
- Create phased remediation roadmap
- Assign ownership and timelines
- Estimate effort
- Identify risks
- **Output:** Remediation Roadmap (Section 5)

### Step 6: Artifact Generation
- Generate control mapping matrices
- Create audit readiness checklist
- Produce executive summary
- Compile evidence package index
- Document gap exceptions
- **Output:** Audit Artifacts (Section 6)

### Step 7: Final Review
- Completeness check
- Quality assessment
- Calculate readiness score
- Final recommendations
- **Output:** Final Summary (Section 7)

**Total Duration:** 6-12 hours (varies by framework complexity and organizational size)

## Main Outcome

**Comprehensive Audit Preparation Package** containing:
1. Audit Overview (framework, scope, timeline)
2. Control Inventory (control mapping matrix)
3. Gap Assessment (prioritized gaps)
4. Evidence Collection Plan (evidence matrix)
5. Remediation Roadmap (phased action plan)
6. Audit Artifacts (readiness checklist, executive summary)
7. Final Summary (readiness assessment, recommendations)

**Output Location:** `{output_folder}/compliance/audit-prep-{framework}-{project_name}.md`

## Key Features

### Multi-Framework Support
- 20+ frameworks supported
- Framework-specific control mapping
- Can prepare for multiple frameworks simultaneously
- Cross-framework gap analysis

### Comprehensive Gap Analysis
- Risk-based prioritization (P0-P4)
- Audit impact assessment
- Remediation complexity estimation
- Critical gap identification

### Evidence Management
- Evidence matrix by control
- Evidence collection procedures
- Evidence gap identification
- Audit folder structure

### Stakeholder Documentation
- Executive summary for leadership
- Control matrices for auditors
- Readiness checklists for teams
- Gap exception reports for management

### Collaboration Tools
- Party Mode with Bastion (technical control validation)
- Advanced Elicitation (quality assurance)
- Brainstorming (control identification)
- Multi-session continuation support

## Prerequisites

### Required
- Target compliance framework identified
- Audit date scheduled or planned
- Access to systems and documentation
- Understanding of organizational controls

### Optional (Enhance Quality)
- Previous audit reports
- Existing control documentation
- Policy and procedure documents
- Risk assessments

## Tools & Integrations

### Core BMAD Tools
- ✅ **Party-Mode** - Bastion collaboration for technical controls
- ✅ **Advanced Elicitation** - Final quality review
- ✅ **Brainstorming** - Control discovery

### LLM Features
- ✅ **Web-Browsing** - Framework requirements research, best practices
- ✅ **File I/O** - Artifact generation, evidence indexing
- ✅ **Sidecar File** - Session continuity for long preparation cycles

## Success Criteria

### Completeness
- ✅ All framework requirements inventoried
- ✅ All controls mapped to requirements
- ✅ All gaps identified and prioritized
- ✅ Evidence plan complete
- ✅ Remediation roadmap actionable
- ✅ All artifacts generated

### Quality
- Control coverage ≥ 90% or justified exceptions
- P0/P1 gaps remediated or accepted by management
- Evidence available for all implemented controls
- Readiness score ≥ 70/100

### Stakeholder Readiness
- Executive summary clear for leadership
- Audit artifacts ready for auditor
- Teams briefed and prepared
- Evidence organized and accessible

## Usage Examples

### Example 1: SOC 2 Type II Initial Certification
```
Framework: SOC 2 Type II
Organization: SaaS startup
Duration: ~8 hours
Controls: 64 Trust Services Criteria
Gaps Identified: 18 (12 critical, 6 medium)
Readiness Score: 68/100 → 92/100 after remediation
Outcome: Successful certification
```

### Example 2: GDPR Compliance Readiness
```
Framework: GDPR
Organization: EU-based e-commerce
Duration: ~6 hours
Principles: 7 GDPR principles + 83 controls
Gaps Identified: 23 (8 critical, 15 medium)
Readiness Score: 75/100 → 95/100 after remediation
Outcome: GDPR compliant, ready for audit
```

### Example 3: Multi-Framework (SOC 2 + HIPAA)
```
Frameworks: SOC 2 Type II + HIPAA
Organization: Healthcare SaaS
Duration: ~12 hours
Controls: 64 SOC 2 + 45 HIPAA safeguards
Shared Controls: 32 (efficiency gain)
Gaps Identified: 27 total (15 SOC 2, 12 HIPAA)
Readiness Score: 71/100 → 90/100 after remediation
Outcome: Dual certification achieved
```

### Example 4: NIS2 Directive (EU Critical Infrastructure)
```
Framework: NIS2 Directive
Organization: EU energy provider
Duration: ~10 hours
Requirements: Risk management, incident handling, supply chain, network security
Gaps Identified: 31 (14 critical, 17 medium)
Readiness Score: 62/100 → 87/100 after remediation
Outcome: NIS2 compliant, regulatory approval
```

## Installation

This workflow is part of the **cyber-ops** module.

```bash
# Workflow will be available at:
# {project-root}/_bmad/cyber-ops/workflows/compliance-audit-prep/
```

## Invocation

```
/bmad:cyber-ops:workflows:compliance-audit-prep
```

Or via Sentinel agent menu (after module installation).

## Workflow Files

```
compliance-audit-prep/
├── workflow.md                          # Main workflow configuration
├── README.md                            # This file
├── FRAMEWORKS-SUPPORTED.md              # Complete framework list
├── steps/
│   ├── step-01-init.md                 # Framework selection & scope
│   ├── step-01b-continue.md            # Continuation handler
│   ├── step-02-control-inventory.md    # Control mapping
│   ├── step-03-gap-assessment.md       # Gap analysis & prioritization
│   ├── step-04-evidence-planning.md    # Evidence collection plan
│   ├── step-05-remediation-planning.md # Remediation roadmap
│   ├── step-06-artifact-generation.md  # Audit artifacts
│   └── step-07-final-review.md         # Final review & completion
```

## Related Workflows

- **Security Architecture Review** - Technical control validation
- **Incident Response Playbook** - IR plan testing (required for many frameworks)
- **Threat Modeling** - Risk assessment for compliance

## Best Practices

### Preparation Timeline
- **8+ weeks before audit:** Start preparation workflow
- **6 weeks:** Complete gap assessment
- **4 weeks:** Critical gaps (P0/P1) remediated
- **2 weeks:** Evidence collection complete
- **1 week:** Internal dry-run audit
- **Audit day:** Fully prepared

### Team Involvement
- **Executive Sponsor:** Approve exceptions, resource allocation
- **Compliance Lead:** Drive workflow execution
- **Control Owners:** Provide control details and evidence
- **IT/Security Teams:** Technical control validation
- **Legal/Privacy:** GDPR, HIPAA, regulatory guidance

### Common Pitfalls to Avoid
- ❌ Starting preparation too close to audit date
- ❌ Not engaging control owners early
- ❌ Missing evidence collection for implemented controls
- ❌ No management approval for gap exceptions
- ❌ Inadequate remediation timeline

## Framework-Specific Notes

### SOC 2
- Focus on Trust Services Criteria (CC, A, C, P, PI)
- Requires 3-12 months of evidence (Type II)
- Auditor testing period critical

### PCI-DSS
- Strict technical requirements (firewalls, encryption)
- Quarterly vulnerability scans required
- Annual penetration testing

### HIPAA
- Focus on ePHI protection
- Risk analysis mandatory
- Business Associate Agreements (BAAs) required

### GDPR
- Data processing inventory critical
- Privacy by design requirements
- Data Protection Impact Assessments (DPIAs)

### NIS2 (EU)
- Risk management mandatory
- Incident reporting within 24 hours
- Supply chain security requirements
- Applies to critical infrastructure (energy, transport, health, etc.)

### CRA (Cyber Resilience Act)
- Applies to products with digital elements
- Secure by design and default
- Vulnerability handling process
- CE marking required

### DORA (Financial Sector)
- ICT risk management framework
- Third-party risk management
- Incident reporting obligations
- Digital operational resilience testing

## Support

### Documentation Resources
- Workflow planning document: `workflow-plan-compliance-audit-prep.md`
- Framework support list: `FRAMEWORKS-SUPPORTED.md`
- This README

### Getting Help
1. Review framework-specific sections in step files
2. Use Party Mode to collaborate with Bastion for technical controls
3. Use Advanced Elicitation for final quality assurance
4. Consult framework documentation and standards

## References

- **NIST 800-53:** https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final
- **SOC 2:** AICPA Trust Services Criteria
- **PCI-DSS:** https://www.pcisecuritystandards.org/
- **HIPAA:** https://www.hhs.gov/hipaa/
- **GDPR:** https://gdpr.eu/
- **NIS2:** https://digital-strategy.ec.europa.eu/en/policies/nis2-directive
- **CRA:** https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act
- **DORA:** https://www.digital-operational-resilience-act.com/

---

**Created by:** workflow-builder (create-workflow)
**Version:** 1.0.0
**Last Updated:** 2026-01-08
**Status:** Production Ready ✅
