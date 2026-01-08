# Security Architecture Review Workflow

**Status:** ✅ Complete and ready for use
**Created:** 2026-01-08
**Module:** cyber-ops (Cybersecurity Operations)
**Lead Agent:** Bastion (Security Architect)

---

## Overview

Comprehensive security architecture review workflow using STRIDE threat modeling, security control assessment, and zero-trust validation to identify vulnerabilities and provide actionable recommendations.

## Purpose

Security architects need a structured, repeatable process to analyze system architectures, identify vulnerabilities through threat modeling, assess existing security controls, and provide actionable recommendations aligned with security best practices and zero-trust principles.

## Primary Users

- Security Architects (Bastion persona) - Lead role
- Security Consultants conducting architecture reviews
- Development teams seeking security validation
- Cloud architects implementing secure cloud designs

## Workflow Structure

**Total Steps:** 7 (6 required + 1 optional)

### Step 1: Initialization & Context Gathering
- **Goal:** Gather architecture context and initialize review document
- **Type:** Initialization with continuation support
- **Duration:** 15-30 minutes
- **Outputs:** Architecture overview, 7-section report structure

### Step 2: STRIDE Threat Modeling
- **Goal:** Systematically identify security threats across all 6 STRIDE categories
- **Type:** Interactive, prescriptive guidance
- **Duration:** 45-90 minutes
- **Outputs:** Complete threat model with attack scenarios
- **Menu:** [A] Advanced Elicitation [B] Brainstorming [P] Party Mode [C] Continue

### Step 3: Security Control Assessment
- **Goal:** Evaluate existing security controls against identified threats
- **Type:** Collaborative analysis
- **Duration:** 60-90 minutes
- **Outputs:** Control inventory, effectiveness ratings, gap analysis
- **Menu:** [A] Advanced Elicitation [P] Party Mode [C] Continue

### Step 4: Attack Surface Analysis (OPTIONAL)
- **Goal:** Optional Ghost agent collaboration for offensive perspective
- **Type:** Branching - user chooses whether to invoke
- **Duration:** 15-30 minutes (if conducted)
- **Outputs:** Attack scenarios, exploit chains, lateral movement paths
- **Menu:** [C] Continue (Ghost collaboration offered at start of step)

### Step 5: Zero-Trust Validation
- **Goal:** Verify architecture alignment with zero-trust principles
- **Type:** Structured validation
- **Duration:** 30-45 minutes
- **Outputs:** Zero-trust maturity assessment, principle-by-principle gaps
- **Menu:** [C] Continue

### Step 6: Recommendations & Remediation
- **Goal:** Prioritize findings and develop actionable recommendations
- **Type:** Collaborative synthesis
- **Duration:** 60-90 minutes
- **Outputs:** Risk matrix, specific recommendations, phased roadmap
- **Menu:** [A] Advanced Elicitation [P] Party Mode [C] Continue

### Step 7: Final Report Generation
- **Goal:** Generate executive summary and finalize report
- **Type:** Document generation
- **Duration:** 15-30 minutes
- **Outputs:** Complete stakeholder-ready report
- **Menu:** None (workflow complete)

**Total Estimated Duration:** 4-6 hours (varies by architecture complexity)

## Main Outcome

Comprehensive **Security Architecture Review Report** containing:
- Executive summary (for leadership/stakeholders)
- Architecture overview
- STRIDE threat model with attack scenarios
- Security control assessment and gaps
- Zero-trust maturity evaluation
- Risk-prioritized findings (Critical/High/Medium/Low)
- Specific, actionable recommendations
- Phased implementation roadmap

**Output Location:** `{output_folder}/planning/architecture/security-review-{project-name}.md`

## Key Features

### Continuation Support
- **Multi-session capability:** Workflow can be paused and resumed
- **State tracking:** Progress tracked via `stepsCompleted` array in frontmatter
- **Automatic resumption:** Step-01b-continue.md handles workflow continuation

### Collaboration Tools
- **Party Mode:** Collaborate with Ghost (penetration tester) for offensive perspective
- **Advanced Elicitation:** Enhance threat model and recommendations quality
- **Brainstorming:** Generate creative attack scenarios
- **Sentinel Integration:** Optional compliance validation (via Party Mode)

### Quality Assurance
- **Validation checkpoints:** All 6 STRIDE categories must be covered
- **Minimum thresholds:** 3 threats per major architecture component
- **Specific recommendations:** No generic advice allowed
- **Framework alignment:** NIST CSF, CIS Controls, OWASP ASVS references

## Prerequisites

### Required
- Basic understanding of the architecture being reviewed
- Access to architecture documentation
- Ability to describe data flows and trust boundaries

### Optional (Enhance Quality)
- Architecture diagrams (C4, UML, custom)
- Existing threat models
- Previous security assessments
- Compliance requirements context

### Supported File Formats
- PNG, PDF (architecture diagrams)
- Markdown (documentation)
- PlantUML (diagrams)

## Tools & Integrations

### Core BMAD Tools
- ✅ **Party-Mode** - Multi-agent collaboration (Ghost, Sentinel)
- ✅ **Advanced Elicitation** - Threat model and recommendation enhancement
- ✅ **Brainstorming** - Creative attack scenario generation

### LLM Features
- ✅ **Web-Browsing** - CVE lookups, security advisories, current standards
- ✅ **File I/O** - Diagram reading, report generation
- ✅ **Sidecar File** - Session continuity for complex reviews

### External Integrations
None required - all functionality built-in

## Success Criteria

### Completeness
- ✅ All 6 STRIDE threat categories analyzed
- ✅ Minimum 3 threats per major architecture component
- ✅ All threats have corresponding control assessment
- ✅ All findings include specific, actionable recommendations
- ✅ Risk prioritization applied to all findings
- ✅ Implementation roadmap with phasing guidance

### Quality
- Recommendations are specific (e.g., "Implement TLS 1.3 with mutual TLS" not "use encryption")
- Threat scenarios are realistic and tied to actual architecture
- Control assessments reference industry standards (NIST, CIS, OWASP)
- Report is actionable by development/operations teams

### Stakeholder Readiness
- Executive summary clear for non-technical audiences
- Technical depth appropriate for security/dev teams
- Shareable with executives, boards, auditors
- Compliance references where applicable

## Usage Examples

### Example 1: Cloud Application Review
```
Architecture: AWS-based microservices application
Components: API Gateway, Lambda functions, RDS database, S3 storage
Duration: ~4 hours
Critical Findings: 3 (missing encryption at rest, overly permissive IAM roles, no MFA)
Recommendations: 12 specific mitigations with AWS implementation guidance
```

### Example 2: On-Premises Enterprise System
```
Architecture: Traditional 3-tier architecture (web, app, database)
Components: Load balancer, IIS web servers, .NET application, SQL Server
Duration: ~5 hours
Critical Findings: 5 (flat network, weak authentication, missing logging)
Recommendations: 15 specific mitigations focused on network segmentation and zero-trust
```

### Example 3: Hybrid Cloud Architecture
```
Architecture: Hybrid on-prem + Azure deployment
Components: On-prem AD, Azure AD Connect, Azure App Service, Cosmos DB
Duration: ~6 hours (Ghost collaboration included)
Critical Findings: 4 (trust boundary issues, credential management, lateral movement paths)
Recommendations: 18 mitigations with phased cloud migration security roadmap
```

## Implementation Notes

### First-Time Use
1. Ensure cyber-ops module is installed
2. Have architecture documentation ready
3. Allocate 4-6 hours for complete review
4. Consider multi-session approach for complex architectures

### Best Practices
- **Be thorough in Step 2 (STRIDE):** Quality of threat model drives entire assessment
- **Use Ghost collaboration (Step 4)** for internet-facing or high-value systems
- **Leverage Advanced Elicitation** after threat modeling to catch missed threats
- **Involve Sentinel via Party Mode** if compliance requirements exist
- **Take breaks:** Use continuation support for complex reviews

### Common Pitfalls to Avoid
- ❌ Generic threat descriptions (be specific to your architecture)
- ❌ Skipping STRIDE categories (all 6 must be covered)
- ❌ Vague recommendations ("improve security" is not actionable)
- ❌ Not considering implementation constraints (unrealistic recommendations)

## Installation

This workflow is part of the **cyber-ops** module. To install:

```bash
# Run module installer (when available)
/bmad:install:cyber-ops

# Or manually copy workflow files to:
# {project-root}/_bmad/cyber-ops/workflows/security-architecture-review/
```

## Invocation

After installation:

```
/bmad:cyber-ops:workflows:security-architecture-review
```

Or via Bastion agent menu item (after module installation completes).

## Workflow Files

```
security-architecture-review/
├── workflow.md                    # Main workflow configuration
├── steps/
│   ├── step-01-init.md           # Initialization with continuation detection
│   ├── step-01b-continue.md      # Continuation logic for resuming
│   ├── step-02-threat-modeling.md
│   ├── step-03-control-assessment.md
│   ├── step-04-attack-surface.md
│   ├── step-05-zero-trust.md
│   ├── step-06-recommendations.md
│   └── step-07-report-generation.md
├── templates/
│   └── report-template.md         # 7-section report structure
└── README.md                      # This file
```

## Related Workflows

- **Incident Response Playbook** - Post-breach response procedures
- **Threat Assessment** - Threat intelligence analysis
- **Penetration Test Planning** - Offensive security testing preparation
- **Compliance Audit Preparation** - Regulatory compliance validation

## References

- **STRIDE Methodology:** Microsoft Threat Modeling
- **Zero-Trust:** NIST SP 800-207 - Zero Trust Architecture
- **Control Frameworks:** NIST CSF, CIS Controls v8, OWASP ASVS
- **Risk Prioritization:** NIST SP 800-30 - Risk Assessment

## Support

For workflow issues or questions:
- Review workflow-plan-security-architecture-review.md for design decisions
- Consult Bastion agent for security architecture guidance
- See cyber-ops module documentation

---

**Created by:** workflow-builder (create-workflow)
**Version:** 1.0.0
**Last Updated:** 2026-01-08
