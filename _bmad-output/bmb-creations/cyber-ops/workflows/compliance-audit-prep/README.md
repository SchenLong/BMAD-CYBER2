# Compliance Audit Preparation

## Purpose

Prepares organizations for compliance audits across major frameworks (NIST, SOC2, PCI-DSS, HIPAA, GDPR) by conducting gap assessments, mapping controls, and generating audit artifacts. Led by Sentinel (Compliance Guardian) with optional Bastion collaboration for architecture control validation.

## Trigger

**Agent:** Sentinel (compliance-guardian)
**Menu Code:** CA (Compliance Audit)
**Full Command:** `/bmad:cyber-ops:agents:compliance-guardian` then select CA

## Key Steps

1. **Framework Selection & Scope**
   - Identify compliance frameworks (NIST 800-53, SOC2 Type II, PCI-DSS, HIPAA, GDPR, etc.)
   - Define audit scope (systems, processes, data)
   - Understand audit timeline and requirements

2. **Control Inventory**
   - Document existing security controls
   - Map controls to framework requirements
   - Identify control ownership and evidence sources

3. **Gap Assessment**
   - Compare current state vs. framework requirements
   - Identify missing or insufficient controls
   - Assess control effectiveness and maturity
   - Prioritize gaps by risk and compliance impact

4. **Evidence Collection Planning**
   - Identify required audit evidence per control
   - Document evidence collection procedures
   - Establish evidence retention and organization
   - Create evidence matrix

5. **Architecture Control Validation** (Optional)
   - Invoke Bastion agent for technical control review
   - Validate architecture compliance (network seg, encryption, IAM)
   - Document technical control evidence

6. **Remediation Planning**
   - Develop prioritized remediation roadmap
   - Assign ownership and timelines
   - Estimate effort and resources
   - Track remediation progress

7. **Audit Artifact Generation**
   - Create gap assessment report
   - Generate control mapping matrix
   - Compile evidence packages
   - Prepare audit readiness documentation

## Expected Output

**Primary Artifact:** Compliance Audit Preparation Package

**Format:** Markdown documents saved to `{output_folder}/operations/audits/`

**Contents:**
- Gap Assessment Report
- Control Mapping Matrix (framework → implemented controls)
- Evidence Collection Plan
- Remediation Roadmap
- Audit Readiness Checklist
- Control Testing Results

**Supporting Artifacts:**
- Evidence matrix (control → evidence location)
- Policy and procedure documents
- Technical architecture diagrams
- Access control documentation

## Collaboration Pattern

**Primary Agent:** Sentinel (compliance-guardian)

**Optional Collaboration:**
- Bastion (security-architect) - For architecture control validation
- Phoenix (incident-commander) - For incident response plan review (SOC2 CC7.3)

## Use Cases

1. **Annual Compliance Audits** - SOC2, ISO 27001, PCI-DSS annual assessments
2. **Certification Preparation** - Initial certification for new frameworks
3. **Framework Adoption** - Implement new compliance requirements
4. **Pre-Audit Readiness** - 30-60 day preparation before auditor engagement
5. **Continuous Compliance Monitoring** - Quarterly self-assessments

## Implementation Notes

Workflow should support multiple frameworks and provide framework-specific guidance. Implementation requires:

- Framework control libraries (NIST, SOC2, PCI, HIPAA, GDPR mappings)
- Gap assessment templates
- Evidence collection checklists
- Control testing guidance
- Remediation tracking

## Integration with Agents

**Agent Menu Update Required:**

In `agents/compliance-guardian.md`, update the CA menu item:
```xml
<item cmd="CA or fuzzy match on compliance-audit" exec="{project-root}/_bmad/cyber-ops/workflows/compliance-audit-prep/workflow.md">[CA] Prepare for compliance audit</item>
```
