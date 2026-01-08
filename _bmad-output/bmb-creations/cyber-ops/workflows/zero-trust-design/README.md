# Zero Trust Architecture Design

## Purpose

Collaborative multi-agent workflow to design comprehensive zero-trust security architectures. Bastion (architect) designs the architecture while Ghost (penetration tester) validates defensibility from an attacker perspective, resulting in a robust, attack-resistant design.

## Trigger

**Lead Agents:** Bastion (security-architect) + Ghost (penetration-tester)
**Invocation:** Via Party Mode - `/bmad:core:workflows:party-mode`
**Participants:** security-architect, penetration-tester

## Key Steps

1. **Current Architecture Assessment** (Bastion-led)
   - Document existing architecture and trust model
   - Identify current security boundaries
   - Map data flows and access patterns
   - Assess existing authentication and authorization

2. **Zero Trust Principles Application** (Bastion-led)
   - Apply "never trust, always verify" principle
   - Design identity-based access controls
   - Plan micro-segmentation strategy
   - Define continuous verification approach
   - Establish least-privilege access model

3. **Attack Surface Analysis** (Ghost-led)
   - Identify potential attack vectors in proposed design
   - Assess credential theft and lateral movement risks
   - Evaluate defense bypass opportunities
   - Challenge trust assumptions

4. **Collaborative Design Iteration** (Both agents)
   - Bastion proposes architectural controls
   - Ghost challenges and identifies weaknesses
   - Iterate on design to address vulnerabilities
   - Balance security with operational feasibility

5. **Identity & Access Management Design**
   - Multi-factor authentication strategy
   - Conditional access policies
   - Privileged access management
   - Service account and API authentication

6. **Network Segmentation Strategy**
   - Micro-segmentation design
   - Software-defined perimeter approach
   - Zero-trust network access (ZTNA)
   - East-west traffic controls

7. **Continuous Verification & Monitoring**
   - Real-time risk assessment
   - Behavioral analytics
   - Anomaly detection strategy
   - Security orchestration and automation

8. **Implementation Roadmap**
   - Phase implementation plan
   - Quick wins and strategic initiatives
   - Resource and budget estimates
   - Success metrics and KPIs

9. **Validation Plan** (Ghost-led)
   - Define testing strategy to validate controls
   - Plan red team exercises
   - Establish continuous validation approach
   - Document expected defense effectiveness

## Expected Output

**Primary Artifact:** Zero Trust Architecture Design Document

**Format:** Markdown document saved to `{output_folder}/planning/architecture/zero-trust/`

**Contents:**
- Executive Summary
- Current State Assessment
- Zero Trust Principles Applied
- Target Architecture Design
  - Identity & Access Management
  - Network Segmentation
  - Data Protection
  - Visibility & Analytics
- Attack Surface Analysis
- Defense Validation Results
- Implementation Roadmap (phased)
- Validation & Testing Plan
- Success Metrics

**Supporting Artifacts:**
- Architecture diagrams (current state, target state)
- Network segmentation maps
- IAM policy matrices
- Implementation project plan

## Collaboration Pattern

**Multi-Agent (Party Mode):**
- Bastion (security-architect) - Zero-trust architecture design
- Ghost (penetration-tester) - Attack surface analysis and validation

**Workflow Coordination:** Iterative design-challenge-refine cycle produces battle-tested architecture.

## Use Cases

1. **Enterprise Architecture Transformation** - Migrate from perimeter to zero-trust model
2. **Cloud Security Modernization** - Design cloud-native zero-trust architecture
3. **Merger & Acquisition Integration** - Design zero-trust for merged organizations
4. **Remote Workforce Security** - Implement zero-trust for distributed teams
5. **Compliance-Driven Architecture** - Design zero-trust to meet regulatory requirements

## Implementation Notes

This Party Mode workflow creates defensible architectures through red-blue collaboration. Implementation should:

- Facilitate iterative design-challenge cycles
- Support architecture diagram generation
- Provide zero-trust principle guidance
- Enable attack scenario modeling
- Generate phased implementation plans

## Integration with Agents

**No direct agent menu item** - Invoked via Party Mode:

```bash
/bmad:core:workflows:party-mode
# Select: security-architect, penetration-tester
# Purpose: Zero Trust Architecture Design
```

Or invoked as collaborative design session from either agent.
