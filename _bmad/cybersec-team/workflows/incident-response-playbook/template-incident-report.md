---
# Incident Response Report Template
# This template is used by Guided Execution Mode to generate incident response reports

# Metadata
incidentId: "{incident_id}"
incidentType: "{incident_type}"
severity: "{severity}"
status: "{status}"
reportedDate: "{reported_date}"
detectedDate: "{detected_date}"
containedDate: "{contained_date}"
resolvedDate: "{resolved_date}"
reportAuthor: "{author_name}"
incidentCommander: "{commander_name}"
---

# Incident Response Report

**Incident ID:** {incident_id}
**Report Date:** {report_date}
**Report Author:** {author_name}
**Incident Commander:** {incident_commander}
**Status:** {status}

---

## 1. Incident Summary

### 1.1 Classification and Severity

| Field | Value |
|-------|-------|
| **Incident ID** | {incident_id} |
| **Incident Type** | {incident_type} |
| **Severity** | {severity} |
| **Status** | {status} |
| **MITRE ATT&CK Tactics** | {mitre_tactics} |
| **MITRE ATT&CK Techniques** | {mitre_techniques} |

### 1.2 Timeline Overview

| Milestone | Date/Time |
|-----------|-----------|
| **Incident Occurred** | {incident_occurred_time} |
| **First Detected** | {detection_time} |
| **Response Started** | {response_start_time} |
| **Contained** | {containment_time} |
| **Eradicated** | {eradication_time} |
| **Recovered** | {recovery_time} |
| **Incident Closed** | {closure_time} |

### 1.3 Affected Assets

**Systems:**
{affected_systems}

**Users:**
{affected_users}

**Data:**
{affected_data}

**Services:**
{affected_services}

### 1.4 Executive Summary

{executive_summary}

**Key Findings:**
{key_findings}

**Business Impact:**
{business_impact}

**Financial Impact:**
{financial_impact}

---

## 2. Timeline of Events

### 2.1 Chronological Log

| Timestamp | Event | Source | Actor | Details |
|-----------|-------|--------|-------|---------|
| {timestamp_1} | {event_1} | {source_1} | {actor_1} | {details_1} |
| {timestamp_2} | {event_2} | {source_2} | {actor_2} | {details_2} |
| {timestamp_n} | {event_n} | {source_n} | {actor_n} | {details_n} |

### 2.2 Detection Phase

**How Detected:**
{detection_method}

**Detection Timeline:**
{detection_timeline}

**Initial Indicators:**
{initial_indicators}

### 2.3 Containment Phase

**Containment Start:** {containment_start}

**Containment Actions:**
{containment_actions}

**Containment Complete:** {containment_complete}

### 2.4 Eradication Phase

**Eradication Start:** {eradication_start}

**Eradication Actions:**
{eradication_actions}

**Eradication Complete:** {eradication_complete}

### 2.5 Recovery Phase

**Recovery Start:** {recovery_start}

**Recovery Actions:**
{recovery_actions}

**Recovery Complete:** {recovery_complete}

---

## 3. Actions Taken

### 3.1 Response Actions Log

| Timestamp | Action | Performed By | Result | Notes |
|-----------|--------|--------------|--------|-------|
| {action_timestamp_1} | {action_1} | {performer_1} | {result_1} | {notes_1} |
| {action_timestamp_2} | {action_2} | {performer_2} | {result_2} | {notes_2} |
| {action_timestamp_n} | {action_n} | {performer_n} | {result_n} | {notes_n} |

### 3.2 Key Decisions Made

**Decision 1:**
- **Decision:** {decision_1}
- **Rationale:** {rationale_1}
- **Decided By:** {decider_1}
- **Timestamp:** {decision_timestamp_1}
- **Alternatives Considered:** {alternatives_1}

**Decision 2:**
- **Decision:** {decision_2}
- **Rationale:** {rationale_2}
- **Decided By:** {decider_2}
- **Timestamp:** {decision_timestamp_2}
- **Alternatives Considered:** {alternatives_2}

### 3.3 Escalations

| Timestamp | Escalated To | Reason | Response |
|-----------|--------------|--------|----------|
| {escalation_timestamp_1} | {escalated_to_1} | {reason_1} | {response_1} |
| {escalation_timestamp_n} | {escalated_to_n} | {reason_n} | {response_n} |

### 3.4 External Support

**Support Requested:**
{external_support_requested}

**Vendors/Consultants Engaged:**
{vendors_engaged}

**Law Enforcement Contact:**
{law_enforcement_contact}

---

## 4. Evidence Collected

### 4.1 Digital Evidence

**Evidence Item 1:**
- **Type:** {evidence_type_1}
- **Source:** {evidence_source_1}
- **Collected By:** {collector_1}
- **Timestamp:** {collection_timestamp_1}
- **Hash:** {hash_1}
- **Storage Location:** {storage_1}

**Evidence Item 2:**
- **Type:** {evidence_type_2}
- **Source:** {evidence_source_2}
- **Collected By:** {collector_2}
- **Timestamp:** {collection_timestamp_2}
- **Hash:** {hash_2}
- **Storage Location:** {storage_2}

### 4.2 Logs Preserved

**Log Sources:**
{log_sources}

**Time Range:**
{log_time_range}

**Storage Location:**
{log_storage}

**Retention Period:**
{log_retention}

### 4.3 Screenshots and Forensic Images

**Forensic Images:**
{forensic_images}

**Screenshots:**
{screenshots}

**Memory Dumps:**
{memory_dumps}

### 4.4 Indicators of Compromise (IOCs)

**IP Addresses:**
{malicious_ips}

**Domains:**
{malicious_domains}

**File Hashes:**
{malicious_hashes}

**Email Addresses:**
{malicious_emails}

**Other IOCs:**
{other_iocs}

### 4.5 Chain of Custody

| Evidence Item | Collected By | Date/Time | Transferred To | Date/Time | Purpose | Current Location |
|---------------|--------------|-----------|----------------|-----------|---------|------------------|
| {item_1} | {collector_1} | {time_1} | {recipient_1} | {transfer_time_1} | {purpose_1} | {location_1} |
| {item_n} | {collector_n} | {time_n} | {recipient_n} | {transfer_time_n} | {purpose_n} | {location_n} |

---

## 5. Technical Analysis

### 5.1 Root Cause Analysis

**Primary Cause:**
{primary_cause}

**Contributing Factors:**
{contributing_factors}

**Root Cause Determination Method:**
{root_cause_method}

### 5.2 Attack Vectors and Techniques

**Initial Access:**
- **Vector:** {initial_access_vector}
- **MITRE Technique:** {initial_access_technique}

**Execution:**
- **Methods:** {execution_methods}
- **MITRE Technique:** {execution_technique}

**Persistence:**
- **Mechanisms:** {persistence_mechanisms}
- **MITRE Technique:** {persistence_technique}

**Privilege Escalation:**
- **Methods:** {privilege_escalation}
- **MITRE Technique:** {privilege_escalation_technique}

**Defense Evasion:**
- **Tactics:** {defense_evasion}
- **MITRE Technique:** {defense_evasion_technique}

**Credential Access:**
- **Methods:** {credential_access}
- **MITRE Technique:** {credential_access_technique}

**Discovery:**
- **Activities:** {discovery}
- **MITRE Technique:** {discovery_technique}

**Lateral Movement:**
- **Methods:** {lateral_movement}
- **MITRE Technique:** {lateral_movement_technique}

**Collection:**
- **Data Targeted:** {collection}
- **MITRE Technique:** {collection_technique}

**Exfiltration:**
- **Methods:** {exfiltration}
- **MITRE Technique:** {exfiltration_technique}

**Impact:**
- **Effects:** {impact}
- **MITRE Technique:** {impact_technique}

### 5.3 Scope of Compromise

**Systems Compromised:**
{systems_compromised}

**Data Accessed:**
{data_accessed}

**Data Exfiltrated:**
{data_exfiltrated}

**Duration of Compromise:**
{compromise_duration}

**Threat Actor Activity Timeline:**
{threat_actor_timeline}

### 5.4 Vulnerabilities Exploited

**Vulnerability 1:**
- **CVE:** {cve_1}
- **Description:** {vulnerability_description_1}
- **Exploited System:** {exploited_system_1}
- **Patch Status:** {patch_status_1}

**Vulnerability 2:**
- **CVE:** {cve_2}
- **Description:** {vulnerability_description_2}
- **Exploited System:** {exploited_system_2}
- **Patch Status:** {patch_status_2}

---

## 6. Recovery Status

### 6.1 Systems Restored

| System | Status | Restored Date | Validated By | Notes |
|--------|--------|---------------|--------------|-------|
| {system_1} | {status_1} | {restore_date_1} | {validator_1} | {notes_1} |
| {system_n} | {status_n} | {restore_date_n} | {validator_n} | {notes_n} |

### 6.2 Services Resumed

| Service | Downtime | Resumed Date | Validation | Impact |
|---------|----------|--------------|------------|--------|
| {service_1} | {downtime_1} | {resume_date_1} | {validation_1} | {impact_1} |
| {service_n} | {downtime_n} | {resume_date_n} | {validation_n} | {impact_n} |

### 6.3 Validation Results

**Functional Testing:**
{functional_test_results}

**Security Validation:**
{security_validation_results}

**Performance Testing:**
{performance_test_results}

**User Acceptance:**
{user_acceptance_results}

### 6.4 Ongoing Monitoring

**Enhanced Monitoring Period:** {enhanced_monitoring_period}

**What's Being Monitored:**
{ongoing_monitoring_items}

**Alert Configuration:**
{alert_configuration}

**Monitoring End Date:** {monitoring_end_date}

---

## 7. Post-Incident Analysis

### 7.1 Lessons Learned

**What Worked Well:**
{what_worked_well}

**What Could Be Improved:**
{what_could_improve}

**Unexpected Challenges:**
{unexpected_challenges}

**Response Time Analysis:**
{response_time_analysis}

### 7.2 Detection Effectiveness

**Detection Method Evaluation:**
{detection_evaluation}

**Detection Gaps Identified:**
{detection_gaps}

**Alert Tuning Needed:**
{alert_tuning}

### 7.3 Response Effectiveness

**Containment Effectiveness:**
{containment_effectiveness}

**Communication Effectiveness:**
{communication_effectiveness}

**Tool Effectiveness:**
{tool_effectiveness}

**Team Performance:**
{team_performance}

### 7.4 Recommendations for Prevention

**Technical Recommendations:**
{technical_recommendations}

**Process Recommendations:**
{process_recommendations}

**Training Recommendations:**
{training_recommendations}

**Tool/Capability Recommendations:**
{tool_recommendations}

### 7.5 Follow-up Actions

| Action | Owner | Due Date | Status | Priority |
|--------|-------|----------|--------|----------|
| {action_1} | {owner_1} | {due_date_1} | {status_1} | {priority_1} |
| {action_n} | {owner_n} | {due_date_n} | {status_n} | {priority_n} |

---

## 8. Compliance and Notifications

### 8.1 Regulatory Notifications

**Notifications Required:**
{notifications_required}

**Notification Timeline:**
{notification_timeline}

**Notifications Sent:**
| Regulator | Sent Date | Method | Confirmation |
|-----------|-----------|--------|--------------|
| {regulator_1} | {sent_date_1} | {method_1} | {confirmation_1} |
| {regulator_n} | {sent_date_n} | {method_n} | {confirmation_n} |

### 8.2 Customer/Partner Notifications

**Notification Criteria Met:** {notification_criteria}

**Notifications Sent:**
{customer_notifications}

**Customer Communication:**
{customer_communication}

### 8.3 Internal Reporting

**Reports Submitted To:**
- Management: {management_report_date}
- Legal: {legal_report_date}
- Compliance: {compliance_report_date}
- Board: {board_report_date}

### 8.4 Insurance Claims

**Cyber Insurance Notification:** {insurance_notification}

**Claim Filed:** {claim_filed}

**Claim Status:** {claim_status}

---

## 9. Financial Impact

### 9.1 Direct Costs

**Incident Response:** {ir_costs}

**System Recovery:** {recovery_costs}

**External Support:** {external_support_costs}

**Forensics:** {forensics_costs}

**Legal:** {legal_costs}

**Total Direct Costs:** {total_direct_costs}

### 9.2 Indirect Costs

**Downtime:** {downtime_costs}

**Lost Revenue:** {lost_revenue}

**Productivity Impact:** {productivity_impact}

**Reputation Impact:** {reputation_impact}

**Total Indirect Costs:** {total_indirect_costs}

### 9.3 Total Financial Impact

**Total Estimated Cost:** {total_cost}

---

## Document Control

**Report Status:** {report_status}

**Distribution:**
{distribution_list}

**Confidentiality:** {confidentiality_level}

**Retention Period:** {retention_period}

**Storage Location:** {storage_location}

**Report Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| {version} | {date} | {author} | {changes} |

---

**Report Approval:**

- **Incident Commander:** {commander_name} - {commander_signature} - {date}
- **Security Manager:** {manager_name} - {manager_signature} - {date}
- **Legal Review:** {legal_name} - {legal_signature} - {date}

---

*This report contains sensitive incident response information and should be handled according to organizational data classification policies.*
