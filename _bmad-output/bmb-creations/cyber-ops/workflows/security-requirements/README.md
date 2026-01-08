# Security Requirements Definition

## Purpose

Collaborative multi-agent workflow to define comprehensive security requirements for new projects, incorporating both technical architecture needs (Bastion) and compliance constraints (Sentinel). Results in actionable security requirements with acceptance criteria.

## Trigger

**Lead Agents:** Bastion (security-architect) + Sentinel (compliance-guardian)
**Invocation:** Via Party Mode - `/bmad:core:workflows:party-mode`
**Participants:** security-architect, compliance-guardian

## Key Steps

1. **Project Context Gathering**
   - Understand project objectives and scope
   - Identify stakeholders and business requirements
   - Document data types and sensitivity levels
   - Assess technical architecture plans

2. **Compliance Framework Identification** (Sentinel-led)
   - Determine applicable regulations (GDPR, HIPAA, PCI-DSS, etc.)
   - Identify industry standards (NIST, ISO 27001, SOC2)
   - Document mandatory compliance requirements
   - Define audit and reporting needs

3. **Technical Security Requirements** (Bastion-led)
   - Define authentication and authorization requirements
   - Specify encryption requirements (data at rest, in transit)
   - Document network security requirements
   - Define logging and monitoring requirements
   - Specify secure development practices

4. **Collaborative Requirements Synthesis**
   - Merge compliance and technical requirements
   - Resolve conflicts and overlaps
   - Prioritize requirements (must-have, should-have, nice-to-have)
   - Define implementation feasibility

5. **Acceptance Criteria Definition**
   - Create testable acceptance criteria for each requirement
   - Define validation methods and evidence
   - Establish security testing requirements
   - Document compliance verification procedures

6. **Requirements Documentation**
   - Generate security requirements document
   - Create requirements traceability matrix
   - Define implementation guidance
   - Establish review and update cadence

## Expected Output

**Primary Artifact:** Security Requirements Document

**Format:** Markdown document saved to `{output_folder}/planning/security-requirements/`

**Contents:**
- Project Overview & Context
- Regulatory & Compliance Requirements
- Technical Security Requirements
  - Authentication & Authorization
  - Encryption & Data Protection
  - Network Security
  - Logging & Monitoring
  - Secure Development
- Requirement Prioritization Matrix
- Acceptance Criteria (per requirement)
- Implementation Guidance
- Validation & Testing Plan

**Supporting Artifacts:**
- Requirements traceability matrix
- Compliance mapping (requirement → regulation/standard)

## Collaboration Pattern

**Multi-Agent (Party Mode):**
- Bastion (security-architect) - Technical security requirements
- Sentinel (compliance-guardian) - Regulatory and compliance requirements

**Workflow Coordination:** Agents collaborate conversationally to develop comprehensive, balanced requirements.

## Use Cases

1. **New Project Kickoff** - Define security requirements before development
2. **Procurement Security Requirements** - Specify vendor/product security needs
3. **Architecture Design Gate** - Validate requirements before architecture approval
4. **RFP Security Criteria** - Define security requirements for vendor selection
5. **Secure Development Planning** - Establish security requirements for SDLC

## Implementation Notes

This Party Mode workflow coordinates two specialized agents. Implementation should:

- Facilitate conversational collaboration between agents
- Support requirement prioritization discussions
- Generate structured requirement documents
- Provide compliance-to-requirement mapping
- Enable iterative refinement

## Integration with Agents

**No direct agent menu item** - Invoked via Party Mode:

```bash
/bmad:core:workflows:party-mode
# Select: security-architect, compliance-guardian
# Purpose: Security Requirements Definition
```

Or as workflow reference for direct execution.
