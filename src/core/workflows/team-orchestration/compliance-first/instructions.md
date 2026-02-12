# Compliance-First Software Development - Team Orchestration Instructions

<critical>The workflow execution engine is governed by: {project-root}/src/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: compliance-first/workflow.yaml</critical>
<critical>Communicate in {communication_language} with {user_name}</critical>

<workflow>

<step n="1" goal="Initialize compliance-first development">
<output>
# Compliance-First Software Development

This orchestration ensures regulatory compliance is built into architecture from the start.

**Best For:**

- Healthcare (HIPAA)
- Financial Services (PCI-DSS, SOX)
- EU Operations (GDPR)
- Enterprise SaaS (SOC 2)

**Teams Involved:**

- **Legal-Team**: Compliance requirements definition
- **BMM**: Architecture and development
- **Cybersec-Team**: Security controls mapping

**Process Flow:**

```
Compliance Requirements → Architecture (with compliance) →
Controls Mapping → Implementation → Audit Prep → Penetration Test
```

---
</output>

<ask>Which compliance frameworks apply?

1. **GDPR** - EU personal data protection
2. **HIPAA** - US healthcare data
3. **PCI-DSS** - Payment card data
4. **SOC 2** - Service organization controls
5. **ISO 27001** - Information security management
6. **Multiple frameworks** - Select several

Choice [1-6]:</ask>

<check if="choice == 6">
  <ask>Select all that apply (comma-separated): GDPR, HIPAA, PCI-DSS, SOC2, ISO27001</ask>
</check>

<action>Store as selected_frameworks</action>
</step>

<step n="2" goal="Phase 1 - Compliance Requirements Definition">
<output>
## Phase 1: Compliance Requirements (Legal-Team)

**Lead Agent:** Counsel
**Specialists:**
{{#if gdpr_selected}}

- Europa (GDPR expert)
{{/if}}
{{#if hipaa_selected}}
- Sentinel (Healthcare compliance)
{{/if}}

**Objective:** Define all compliance requirements before architecture

**For each framework, we'll identify:**

- Applicable controls
- Data handling requirements
- Documentation needs
- Audit evidence requirements

---

**Selected Frameworks:** {selected_frameworks}

---
</output>

<ask>Do you have existing compliance documentation?

1. **Start fresh** - Define requirements from scratch
2. **Import existing** - I have compliance requirements ready
3. **Compliance team session** - Party mode with compliance experts

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <output>Invoking compliance requirements workflow...

**Lead:** Counsel
**Frameworks:** {selected_frameworks}

Starting compliance requirements definition...</output>

  <action>Load and follow{legal_workflows.compliance_requirements} with frameworks</action>
  <action>Store compliance_requirements_path</action>
</check>

<check if="choice == 2">
  <ask>Path to compliance requirements:</ask>
  <action>Store compliance_requirements_path</action>
</check>

<check if="choice == 3">
  <output>Assembling Compliance Audit Team...

**Preset:** compliance-audit-team
**Agents:**

- Europa (GDPR)
- Sentinel (Security Controls)
- Murat (Testing/Evidence)

Starting party mode session...</output>

  <action>Load and followparty-mode with preset=compliance-audit-team</action>
  <action>Capture compliance requirements from session</action>
</check>

<action>Goto step 3</action>
</step>

<step n="3" goal="Phase 2 - Compliance-Driven Architecture">
<output>
## Phase 2: Compliance-Driven Architecture (BMM)

**Lead Agent:** Winston (Architect)
**Security Input:** Bastion (Security Architect)

**Architecture must address:**

{{#each compliance_controls}}
**{framework}:**
{{#each controls}}

- {control_id}: {control_description}
{{/each}}
{{/each}}

**Key Compliance Architecture Patterns:**

- Data residency requirements
- Encryption at rest and in transit
- Access control and audit logging
- Data retention and deletion
- Consent management (for GDPR)
- Data isolation/segmentation

---
</output>

<ask>Ready to create compliance-aware architecture?

1. **Create architecture** - Load and follow BMM with compliance context
2. **Use existing** - Validate existing architecture against controls
3. **Expert review** - Party mode with architect + compliance experts

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <output>Invoking BMM architecture with compliance requirements...

**Lead:** Winston (Architect)
**Compliance Context:** {compliance_requirements_path}

Winston will be prompted to address each compliance control.

Starting architecture design...</output>

  <action>Load and follow{bmm_workflows.architecture} with compliance context</action>
  <action>Store architecture_path</action>
</check>

<check if="choice == 2">
  <ask>Path to existing architecture:</ask>
  <action>Store architecture_path</action>
  <output>Will validate architecture against compliance controls...</output>
</check>

<action>Goto step 4</action>
</step>

<step n="4" goal="Phase 3 - Security Controls Mapping">
<output>
## Phase 3: Security Controls Mapping (Cybersec-Team)

**Lead Agent:** Sentinel (Compliance Guardian)
**Supporting:** Bastion (Security Architect)

**Objective:** Map compliance controls to technical implementations

**For each control, we'll define:**

- Technical implementation
- Evidence collection method
- Testing approach
- Monitoring requirements

---

**Architecture:** {architecture_path}
**Compliance Requirements:** {compliance_requirements_path}

---
</output>

<ask>Proceed with controls mapping?

1. **Full mapping** - All controls mapped to architecture
2. **Critical controls only** - Focus on mandatory/high-priority
3. **Gap analysis** - Identify what's missing

Choice [1/2/3]:</ask>

<check if="choice == 1 or choice == 2">
  <output>Invoking security controls mapping...

**Lead:** Sentinel (Compliance Guardian)
**Scope:** {mapping_scope}

Starting controls mapping...</output>

  <action>Load and follow{cybersec_workflows.controls_mapping} with architecture and requirements</action>
  <action>Store control_mapping_path</action>
</check>

<action>Goto step 5</action>
</step>

<step n="5" goal="Phase 4 - Compliance Stories Generation">
<output>
## Phase 4: Compliance Stories (BMM)

**Objective:** Convert compliance controls to implementable stories

**Story Categories:**

1. **Security Infrastructure** - Encryption, key management, logging
2. **Access Control** - Authentication, authorization, RBAC
3. **Data Management** - Retention, deletion, portability
4. **Audit Trail** - Logging, monitoring, alerting
5. **Testing/Evidence** - Automated compliance testing

---

**Controls to Convert:** {control_count}

---
</output>

<ask>Generate compliance stories?

1. **Yes, generate all** - Convert all controls to stories
2. **Review first** - Show me the control mapping before stories
3. **Manual** - I'll create stories manually

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <output>Generating compliance implementation stories...

Each story will include:

- Compliance requirement reference
- Acceptance criteria for compliance
- Evidence collection requirements

Creating compliance stories...</output>

  <action>Generate compliance stories from control mapping</action>
  <action>Store compliance_stories_path</action>
</check>

<action>Goto step 6</action>
</step>

<step n="6" goal="Phase 5 - Audit Readiness Planning">
<output>
## Phase 5: Audit Readiness (Legal + Cybersec)

**Objective:** Prepare for compliance audit

**Audit Preparation Checklist:**

**Documentation:**

- [ ] Policies and procedures documented
- [ ] Architecture diagrams updated
- [ ] Data flow diagrams complete
- [ ] Control implementation documented

**Evidence:**

- [ ] Automated evidence collection configured
- [ ] Access logs retained appropriately
- [ ] Change management records available
- [ ] Incident response evidence

**Testing:**

- [ ] Control testing completed
- [ ] Vulnerability scans performed
- [ ] Penetration testing scheduled

---
</output>

<ask>Audit preparation scope?

1. **Full prep** - Complete audit readiness review
2. **Gap analysis** - Identify audit gaps only
3. **Evidence plan** - Focus on evidence collection setup
4. **Skip** - Handle audit prep later

Choice [1/2/3/4]:</ask>

<check if="choice == 1 or choice == 2">
  <output>Generating audit readiness assessment...

**Teams:** Legal + Cybersec

Creating audit readiness report...</output>

  <action>Generate audit readiness report</action>
  <action>Store audit_readiness_path</action>
</check>

<action>Goto step 7</action>
</step>

<step n="7" goal="Complete compliance-first orchestration">
<output>
# Compliance-First Orchestration Complete

## Summary

| Attribute | Value |
|-----------|-------|
| Frameworks | {selected_frameworks} |
| Total Controls | {control_count} |
| Controls Mapped | {mapped_count} |
| Compliance Stories | {story_count} |
| Audit Readiness | {audit_readiness_status} |

## Artifacts Generated

| Artifact | Location |
|----------|----------|
| Compliance Requirements | {compliance_requirements_path} |
| Architecture | {architecture_path} |
| Control Mapping | {control_mapping_path} |
| Compliance Stories | {compliance_stories_path} |
| Audit Readiness | {audit_readiness_path} |

## Compliance Gate Requirements

Before go-live, ensure:

- [ ] All compliance stories implemented
- [ ] Penetration testing completed
- [ ] Evidence collection operational
- [ ] Audit readiness confirmed

## Next Steps

1. **Implementation** - Use `/bmad:bmm:workflows:sprint-planning`
2. **Pre-Release** - Run `/bmad:cybersec-team:workflows:penetration-test`
3. **Final Audit** - Engage compliance auditors

---

**Return to Abdul:** Use [PS] Project Status to track compliance progress.
</output>

<action>Save orchestration summary to {output_folder}/compliance-first-{date}.md</action>
</step>

</workflow>
