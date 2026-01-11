---
# Incident Response Playbook Template
# This template is used by Playbook Creation Mode to generate incident response playbooks

# Metadata
playbookType: "{incident_type}"
created: "{creation_date}"
version: "1.0"
organization: "{organization_name}"
lastUpdated: "{last_updated}"
reviewCycle: "{review_frequency}"
owner: "{playbook_owner}"
approvedBy: "{approver_name}"
---

# Incident Response Playbook: {incident_type}

**Document Version:** {version}
**Organization:** {organization_name}
**Created:** {creation_date}
**Last Updated:** {last_updated}
**Owner:** {playbook_owner}
**Approved By:** {approver_name}
**Review Cycle:** {review_frequency}

---

## 1. Incident Overview

### 1.1 Incident Type and Definition

**Incident Type:** {incident_type}

**Definition:**
{incident_definition}

**Common Characteristics:**
{incident_characteristics}

### 1.2 Scope and Assumptions

**Scope:**
{playbook_scope}

**Assumptions:**
{playbook_assumptions}

**Out of Scope:**
{out_of_scope}

### 1.3 Severity Classification Criteria

| Severity | Criteria | Response Time | Escalation |
|----------|----------|---------------|------------|
| **Critical** | {critical_criteria} | {critical_response_time} | {critical_escalation} |
| **High** | {high_criteria} | {high_response_time} | {high_escalation} |
| **Medium** | {medium_criteria} | {medium_response_time} | {medium_escalation} |
| **Low** | {low_criteria} | {low_response_time} | {low_escalation} |

---

## 2. Detection & Analysis Procedures

### 2.1 Indicators of Compromise (IOCs)

**Primary Indicators:**
{primary_iocs}

**Secondary Indicators:**
{secondary_iocs}

**MITRE ATT&CK Techniques:**
{mitre_techniques}

### 2.2 Alert Sources and Monitoring

**Alert Sources:**
{alert_sources}

**Monitoring Tools:**
{monitoring_tools}

**Alert Triggers:**
{alert_triggers}

### 2.3 Triage Procedures

**Initial Assessment Steps:**
{triage_steps}

**Information to Gather:**
{info_to_gather}

**Triage Decision Tree:**
{triage_decision_tree}

### 2.4 Initial Assessment Checklist

- [ ] {assessment_item_1}
- [ ] {assessment_item_2}
- [ ] {assessment_item_3}
- [ ] {assessment_item_n}

---

## 3. Containment Procedures

### 3.1 Short-term Containment (Immediate Actions)

**Objective:** {short_term_objective}

**Timeline:** {short_term_timeline}

**Steps:**
{short_term_steps}

**Validation:**
{short_term_validation}

### 3.2 Long-term Containment (Sustained Isolation)

**Objective:** {long_term_objective}

**Timeline:** {long_term_timeline}

**Steps:**
{long_term_steps}

**Validation:**
{long_term_validation}

### 3.3 Decision Criteria for Containment Strategies

**When to isolate vs monitor:**
{isolation_criteria}

**When to segment network:**
{segmentation_criteria}

**When to shut down systems:**
{shutdown_criteria}

### 3.4 Specific Commands and Procedures

**Network Isolation:**
```bash
{network_isolation_commands}
```

**System Quarantine:**
```bash
{quarantine_commands}
```

**Access Revocation:**
```bash
{access_revocation_commands}
```

**Tool-Specific Actions:**
{tool_specific_containment}

---

## 4. Eradication Steps

### 4.1 Root Cause Identification

**Investigation Approach:**
{root_cause_approach}

**Tools to Use:**
{eradication_tools}

**Evidence to Collect:**
{evidence_to_collect}

### 4.2 Threat Actor Removal Procedures

**Persistence Mechanisms to Check:**
{persistence_checks}

**Removal Steps:**
{threat_removal_steps}

**Backdoor Elimination:**
{backdoor_elimination}

### 4.3 Vulnerability Remediation

**Vulnerabilities to Patch:**
{vulnerabilities_to_patch}

**Configuration Hardening:**
{hardening_steps}

**System Updates:**
{system_updates}

### 4.4 Validation of Eradication

**Validation Tests:**
{eradication_validation}

**Clean System Criteria:**
{clean_criteria}

**Sign-off Requirements:**
{eradication_signoff}

---

## 5. Recovery Procedures

### 5.1 System Restoration Steps

**Restoration Order:**
{restoration_order}

**Restoration Procedures:**
{restoration_procedures}

**Backup Verification:**
{backup_verification}

### 5.2 Service Restoration Priority

| Priority | Service | Dependencies | Validation |
|----------|---------|--------------|------------|
| P1 | {p1_service} | {p1_dependencies} | {p1_validation} |
| P2 | {p2_service} | {p2_dependencies} | {p2_validation} |
| P3 | {p3_service} | {p3_dependencies} | {p3_validation} |

### 5.3 Validation and Testing

**Functional Testing:**
{functional_tests}

**Security Validation:**
{security_validation}

**User Acceptance:**
{user_acceptance}

### 5.4 Enhanced Monitoring During Recovery

**Monitoring Duration:** {enhanced_monitoring_duration}

**What to Monitor:**
{enhanced_monitoring_items}

**Alert Thresholds:**
{enhanced_alert_thresholds}

---

## 6. Post-Incident Activities

### 6.1 Lessons Learned Session Guide

**Timing:** {lessons_learned_timing}

**Attendees:** {lessons_learned_attendees}

**Agenda:**
{lessons_learned_agenda}

**Key Questions:**
{lessons_learned_questions}

### 6.2 Documentation Requirements

**Documents to Complete:**
{documentation_requirements}

**Retention Period:**
{retention_period}

**Storage Location:**
{storage_location}

### 6.3 Process Improvement Actions

**Identified Improvements:**
{improvement_actions}

**Owners and Timeline:**
{improvement_timeline}

### 6.4 Knowledge Base Updates

**What to Document:**
{kb_updates}

**Where to Document:**
{kb_location}

---

## 7. Communication Plan

### 7.1 Internal Stakeholder Notification

**IT Team:**
- **When:** {it_notification_timing}
- **How:** {it_notification_method}
- **Contact:** {it_contacts}

**Management:**
- **When:** {management_notification_timing}
- **How:** {management_notification_method}
- **Contact:** {management_contacts}

**Legal:**
- **When:** {legal_notification_timing}
- **How:** {legal_notification_method}
- **Contact:** {legal_contacts}

**HR:**
- **When:** {hr_notification_timing}
- **How:** {hr_notification_method}
- **Contact:** {hr_contacts}

### 7.2 External Stakeholder Notification

**Customers:**
- **Criteria:** {customer_notification_criteria}
- **Timeline:** {customer_notification_timeline}
- **Method:** {customer_notification_method}

**Partners:**
- **Criteria:** {partner_notification_criteria}
- **Timeline:** {partner_notification_timeline}
- **Method:** {partner_notification_method}

**Regulators:**
- **Requirements:** {regulatory_requirements}
- **Timeline:** {regulatory_timeline} (e.g., GDPR 72 hours)
- **Method:** {regulatory_method}

### 7.3 Communication Templates

**Initial Notification Template:**
{initial_notification_template}

**Status Update Template:**
{status_update_template}

**Resolution Notification Template:**
{resolution_template}

### 7.4 Timeline Requirements

**Regulatory Deadlines:**
- GDPR: 72 hours from discovery
- PCI-DSS: {pci_timeline}
- HIPAA: {hipaa_timeline}
- Other: {other_timelines}

---

## 8. Appendices

### 8.1 Tool-Specific Commands

**SIEM Queries:**
```
{siem_queries}
```

**EDR Actions:**
```
{edr_commands}
```

**Forensics Procedures:**
```
{forensics_procedures}
```

**Network Analysis:**
```
{network_analysis_commands}
```

### 8.2 Contact Lists and Escalation Paths

**24/7 Security Team:**
{security_contacts}

**Management Escalation:**
{management_escalation}

**External Support:**
{external_support}

**Law Enforcement:**
{law_enforcement_contacts}

### 8.3 Checklists and Forms

**Initial Response Checklist:**
{initial_response_checklist}

**Evidence Collection Form:**
{evidence_collection_form}

**Sign-off Forms:**
{signoff_forms}

### 8.4 Compliance References

**Applicable Regulations:**
{compliance_regulations}

**Notification Requirements:**
{notification_requirements}

**Evidence Retention:**
{evidence_retention}

**Audit Trail Requirements:**
{audit_requirements}

---

## Document Control

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| {version} | {date} | {author} | {changes} |

**Review Schedule:**
- Next review: {next_review_date}
- Review frequency: {review_frequency}

**Approval:**
- Approved by: {approver_name}
- Date: {approval_date}
- Signature: {signature}

---

*This playbook should be reviewed and updated regularly, especially after incidents or changes to infrastructure, tools, or regulatory requirements.*
