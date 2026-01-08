# Security Architecture Review

## Purpose

Conducts comprehensive security analysis of system architecture designs, identifying vulnerabilities, recommending mitigations, and validating alignment with security best practices and zero-trust principles. Led by Bastion (Security Architect) with optional collaboration from Ghost (Penetration Tester) for attack surface analysis.

## Trigger

**Agent:** Bastion (security-architect)
**Menu Code:** SR (Security Review)
**Full Command:** `/bmad:cyber-ops:agents:security-architect` then select SR

## Key Steps

1. **Intake & Context Gathering**
   - Load architecture documents, diagrams, threat models
   - Understand system boundaries, data flows, trust zones
   - Identify critical assets and data classification

2. **Threat Modeling**
   - Apply STRIDE methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
   - Identify threat actors and attack vectors
   - Map threats to architecture components

3. **Control Assessment**
   - Evaluate existing security controls against threats
   - Assess authentication and authorization mechanisms
   - Review encryption, network segmentation, IAM design
   - Check cloud security posture (AWS/Azure/GCP)

4. **Collaborative Attack Surface Analysis** (Optional)
   - Invoke Ghost agent for penetration tester perspective
   - Identify exploitable weaknesses from attacker viewpoint
   - Validate defense effectiveness

5. **Zero-Trust Validation**
   - Verify "never trust, always verify" principles
   - Check least-privilege access controls
   - Validate micro-segmentation and identity-based access

6. **Recommendations & Remediation**
   - Prioritize findings by risk (Critical/High/Medium/Low)
   - Provide specific, actionable mitigations
   - Suggest architecture improvements

7. **Report Generation**
   - Generate comprehensive security assessment report
   - Include threat model diagrams
   - Document recommendations with implementation guidance

## Expected Output

**Primary Artifact:** Security Architecture Review Report

**Format:** Markdown document saved to `{output_folder}/planning/architecture/`

**Contents:**
- Executive Summary
- Architecture Overview
- Threat Model (STRIDE analysis with diagrams)
- Security Control Assessment
- Risk Matrix (findings prioritized by severity)
- Detailed Recommendations
- Implementation Roadmap

**Optional Artifacts:**
- Updated architecture diagrams with security annotations
- Threat modeling diagrams (data flow + trust boundaries)

## Collaboration Pattern

**Primary Agent:** Bastion (security-architect)

**Optional Collaboration:**
- Ghost (penetration-tester) - For attack surface perspective
- Sentinel (compliance-guardian) - For compliance control validation

**Invocation Method:** Agent can invoke collaborators via Party Mode or direct agent calls during workflow execution.

## Use Cases

1. **New System Design Review** - Validate security before implementation
2. **Cloud Migration Assessment** - Ensure cloud architecture follows security best practices
3. **Zero-Trust Implementation Planning** - Design zero-trust architecture transformation
4. **Pre-Deployment Security Gate** - Final security review before production deployment
5. **Post-Incident Architecture Remediation** - Address vulnerabilities discovered during incidents

## Implementation Notes

This workflow will be implemented using the `/bmad:bmb:workflows:create-workflow` command. The workflow should:

- Use conversational prompts to gather architecture details
- Support file upload/reference for architecture diagrams
- Provide interactive threat modeling guidance
- Generate structured markdown reports
- Save artifacts to configured output folders
- Support mid-workflow agent collaboration

## Integration with Agents

**Agent Menu Update Required:**

In `agents/security-architect.md`, update the SR menu item:
```xml
<item cmd="SR or fuzzy match on security-review" exec="{project-root}/_bmad/cyber-ops/workflows/security-architecture-review/workflow.md">[SR] Conduct comprehensive architecture security review</item>
```

Replace `exec="todo"` with the workflow path once workflow is implemented.
