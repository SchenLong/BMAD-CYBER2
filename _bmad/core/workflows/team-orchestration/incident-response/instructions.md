# Incident Response Coordination - Team Orchestration Instructions

<critical>The workflow execution engine is governed by: {project-root}/_bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: incident-response/workflow.yaml</critical>
<critical>Communicate in {communication_language} with {user_name}</critical>
<critical>TIME-SENSITIVE: Track all deadlines carefully. GDPR requires 72-hour notification.</critical>

<workflow>

<step n="1" goal="Initialize incident response coordination">
<output>
# INCIDENT RESPONSE COORDINATION

**ACTIVE INCIDENT MODE**

This orchestration coordinates multiple teams during a security incident:

**Teams Activated:**
- **Cybersec-Team**: Detection, containment, eradication
- **Intel-Team**: Attribution, threat actor profiling
- **Legal-Team**: Regulatory compliance, notification requirements
- **Strategy-Team**: Communications, stakeholder management

**Parallel Workstreams:**
```
Detection → Containment ─┬─→ Attribution ──→ Eradication → Lessons Learned
                         │
                         └─→ Legal Review ──→ Communications
```

---
</output>

<ask>**INCIDENT CLASSIFICATION**

What type of incident are you responding to?

1. **Data Breach** - Unauthorized access to sensitive data
2. **Ransomware** - Encryption/extortion attack
3. **System Compromise** - Unauthorized system access
4. **Insider Threat** - Malicious insider activity
5. **DDoS/Availability** - Service disruption
6. **Other** - Describe the incident

Choice [1-6]:</ask>
<action>Store as incident_type</action>

<ask>**INCIDENT SEVERITY**

1. **Critical** - Active exfiltration, widespread impact, regulatory exposure
2. **High** - Significant compromise, limited containment
3. **Medium** - Contained incident, investigation needed
4. **Low** - Minor incident, monitoring required

Severity [1-4]:</ask>
<action>Store as incident_severity</action>

<action>Set incident_start_time = now()</action>
<action>Calculate notification_deadlines based on incident_type and data_types</action>
</step>

<step n="2" goal="Phase 1 - Detection and Initial Response">
<output>
## Phase 1: Detection & Initial Response (Cybersec-Team)

**Incident Commander:** Phoenix
**Objective:** Establish facts, contain immediate threat

**Immediate Actions:**
1. Preserve evidence (logs, memory dumps, network captures)
2. Identify affected systems and data
3. Implement initial containment
4. Document timeline of events

---

**Time Elapsed:** {time_since_detection}
{{#if gdpr_applicable}}
**GDPR Deadline:** {72 - hours_elapsed} hours remaining
{{/if}}

---
</output>

<ask>Do you have initial incident details, or should we load and follow the incident playbook?

1. **Load incident playbook** - Start formal incident response
2. **Provide summary** - I have initial facts ready
3. **War Room mode** - Assemble team for live discussion

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <output>Invoking Cybersec incident response playbook...

**Lead:** Phoenix (Incident Commander)

Starting incident detection and analysis phase...</output>

  <action>Load and follow{cybersec_workflows.incident_playbook}</action>
  <action>Wait for initial findings</action>
  <action>Store incident_summary_path</action>
  <action>Store iocs_path</action>
</check>

<check if="choice == 2">
  <ask>Provide incident summary:

- What happened?
- When was it detected?
- What systems/data affected?
- Current containment status?

Summary:</ask>
  <action>Store incident_summary</action>
  <action>Create incident-summary.md with provided details</action>
</check>

<check if="choice == 3">
  <output>Assembling Incident War Room...

**Preset:** incident-war-room
**Agents:**
- Phoenix (Incident Commander) - Cybersec
- Vector (Intel Lead) - Intel
- Giuseppe (Communications) - Strategy
- Counsel - Legal

Starting Party Mode with incident context...</output>

  <action>Load and followparty-mode with preset=incident-war-room and context=incident_summary</action>
  <action>After war room, capture key decisions and action items</action>
</check>

<action>Goto step 3</action>
</step>

<step n="3" goal="Phase 2 - Attribution (Parallel Track A)">
<output>
## Phase 2A: Attribution (Intel-Team)

**Lead:** Vector (OSINT Lead)
**Supporting:** Dossier (Threat Actor Profiler), Cipher (Threat Analyst)

**Objective:** Identify threat actor, understand capabilities and intent

**Inputs:**
- IOCs from incident response: {iocs_path}
- Incident timeline and TTPs

**Questions to Answer:**
- Who is behind this attack?
- Is this a known threat actor/campaign?
- What are their typical objectives?
- Are other organizations targeted?

---
</output>

<check if="iocs_path exists">
  <output>IOCs available for attribution analysis:
- File: {iocs_path}
- Count: {ioc_count} indicators

Initiating attribution workflow...</output>
</check>

<ask>Should we proceed with attribution analysis?

1. **Yes, start attribution** - Load and follow intel-team attribution workflow
2. **Skip attribution** - Not needed for this incident
3. **Later** - Continue with other tracks, return to attribution

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <output>Invoking Intel-Team attribution workflow...

**Lead:** Vector (OSINT Lead)
**Context:** IOCs from {iocs_path}

Starting threat actor attribution...</output>

  <action>Load and follow{intel_workflows.attribution} with iocs context</action>
  <action>Set attribution_status = "in_progress"</action>
  <action>Note: This runs in parallel with legal track</action>
</check>

<check if="choice == 2">
  <action>Set attribution_status = "skipped"</action>
</check>

<check if="choice == 3">
  <action>Set attribution_status = "pending"</action>
</check>

<action>Goto step 4</action>
</step>

<step n="4" goal="Phase 2 - Legal Compliance (Parallel Track B)">
<output>
## Phase 2B: Legal & Compliance (Legal-Team)

**Lead:** Counsel
**Supporting:** Europa (if EU data), Sentinel (security controls)

**Objective:** Determine notification obligations and timelines

**Critical Questions:**
- What data was potentially accessed/exfiltrated?
- Which jurisdictions are affected?
- What notification deadlines apply?
- What regulatory bodies must be informed?

---

**Current Timeline Status:**
- Incident detected: {incident_start_time}
- Hours elapsed: {hours_elapsed}
{{#each applicable_deadlines}}
- {framework}: {deadline_remaining} remaining
{{/each}}

---
</output>

<ask>What types of data were potentially affected?

1. **Personal data (EU residents)** - GDPR applies
2. **Protected health information** - HIPAA applies
3. **Payment card data** - PCI-DSS applies
4. **California residents** - CCPA applies
5. **Multiple types** - Select all that apply
6. **Unknown** - Still investigating

Choice [1-6]:</ask>

<check if="choice != 6">
  <action>Calculate notification deadlines based on data types</action>

  <output>**Notification Requirements:**

{{#each notification_requirements}}
| Framework | Deadline | Authority | Status |
|-----------|----------|-----------|--------|
| {framework} | {deadline} | {authority} | Pending |
{{/each}}

Invoking Legal-Team compliance workflow...</output>

  <action>Load and follow{legal_workflows.matter_intake} with incident context</action>
  <action>Wait for notification requirements document</action>
  <action>Store notification_requirements_path</action>
</check>

<check if="choice == 6">
  <output>**ACTION REQUIRED:** Data classification is critical for compliance.

Forensic analysis should prioritize identifying affected data types.

Continuing with preliminary legal consultation...</output>

  <action>Flag for forensic priority</action>
</check>

<action>Goto step 5</action>
</step>

<step n="5" goal="Phase 3 - Communications Planning">
<output>
## Phase 3: Communications Planning (Strategy-Team)

**Lead:** Giuseppe (Communications Director)
**Objective:** Develop stakeholder communication strategy

**Stakeholder Groups:**
1. **Internal** - Executives, employees, IT teams
2. **Customers** - Affected users/customers
3. **Regulators** - Required notification authorities
4. **Partners** - Business partners, vendors
5. **Public/Media** - If public disclosure required

**Inputs:**
- Incident summary: {incident_summary_path}
- Notification requirements: {notification_requirements_path}
- Attribution (if available): {attribution_status}

---

**Key Messaging Constraints:**
- Legal has approved messaging? {legal_approval_status}
- What can we say about attackers? {attribution_disclosure}
- Timeline for public statement? {public_timeline}

---
</output>

<ask>What is the current public exposure?

1. **Not public** - Incident not known externally
2. **Limited exposure** - Some stakeholders aware
3. **Public knowledge** - Media/social media aware
4. **Active media** - Journalists actively investigating

Exposure level [1-4]:</ask>
<action>Store as public_exposure</action>

<ask>Ready to develop communications plan?

1. **Yes, start planning** - Load and follow crisis communications workflow
2. **War Room discussion** - Discuss messaging with full team first
3. **Hold** - Wait for more information

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <output>Invoking Strategy-Team crisis communications workflow...

**Lead:** Giuseppe (Communications Director)
**Context:**
- Incident type: {incident_type}
- Public exposure: {public_exposure}
- Notification requirements: {notification_requirements}

Starting communications planning...</output>

  <action>Load and follow{strategy_workflows.crisis_response} with incident context</action>
  <action>Store communications_plan_path</action>
</check>

<check if="choice == 2">
  <output>Assembling communications war room...

**Participants:**
- Giuseppe (Communications)
- Counsel (Legal review)
- Phoenix (Technical accuracy)

Starting focused discussion on messaging...</output>

  <action>Load and followparty-mode with limited agents for messaging discussion</action>
</check>

<action>Goto step 6</action>
</step>

<step n="6" goal="Sync point - Coordinate parallel tracks">
<output>
## COORDINATION CHECKPOINT

**Parallel Track Status:**

| Track | Status | Key Outputs |
|-------|--------|-------------|
| Attribution (Intel) | {attribution_status} | {attribution_outputs} |
| Legal/Compliance | {legal_status} | {legal_outputs} |
| Communications | {comms_status} | {comms_outputs} |
| Containment (Cybersec) | {containment_status} | {containment_outputs} |

---

**Timeline:**
- Incident age: {hours_elapsed} hours
{{#each critical_deadlines}}
- **{framework}:** {time_remaining} remaining
{{/each}}

---

**Conflicts/Dependencies:**
{{#if timeline_conflict}}
- **CONFLICT:** Legal notification deadline conflicts with investigation timeline
  - Legal requires notification in {notification_deadline}
  - Forensics needs {forensics_estimate} more time
  - **Resolution needed**
{{/if}}

{{#if attribution_informs_comms}}
- Attribution results will inform communications messaging
- Current attribution status: {attribution_status}
{{/if}}

---
</output>

<check if="timeline_conflict">
  <ask>How should we resolve the timeline conflict?

1. **Notify with partial info** - Meet deadline, update later
2. **Request extension** - If framework allows
3. **Escalate to executive** - Decision above our level
4. **Accept risk** - Document and proceed

Resolution [1-4]:</ask>
  <action>Document resolution decision</action>
</check>

<ask>Ready to proceed to eradication?

1. **Yes, begin eradication** - Threat contained, proceed to remove
2. **Not yet** - More investigation needed
3. **Review attribution** - Check attribution findings first

Choice [1/2/3]:</ask>

<action>Route based on choice</action>
</step>

<step n="7" goal="Phase 4 - Eradication and Recovery">
<output>
## Phase 4: Eradication & Recovery (Cybersec-Team)

**Lead:** Phoenix (Incident Commander)
**Objective:** Remove threat, restore systems, validate security

**Eradication Checklist:**
- [ ] All compromised credentials rotated
- [ ] Malware/backdoors removed from all systems
- [ ] Vulnerabilities exploited in attack patched
- [ ] Persistence mechanisms eliminated
- [ ] Network indicators blocked

**Recovery Checklist:**
- [ ] Systems restored from clean backups
- [ ] Security monitoring enhanced
- [ ] Access controls reviewed and hardened
- [ ] Business operations validated

---

**Attribution Intelligence Applied:**
{{#if attribution_complete}}
Based on threat actor profile ({threat_actor}):
- Known persistence techniques to check: {persistence_ttps}
- Common backdoor indicators: {backdoor_indicators}
- Related infrastructure to block: {infrastructure_to_block}
{{/if}}

---
</output>

<ask>Eradication approach?

1. **Guided eradication** - Step-by-step with verification
2. **Rapid response** - Execute pre-planned playbook
3. **External support** - Engage incident response firm

Choice [1/2/3]:</ask>

<action>Execute eradication based on choice</action>
<action>Track eradication progress</action>
<action>Goto step 8 when complete</action>
</step>

<step n="8" goal="Phase 5 - Lessons Learned">
<output>
## Phase 5: Lessons Learned

**Participants:** All teams involved

**Review Areas:**
1. **Detection** - How was the incident discovered? Could we detect earlier?
2. **Response** - What worked? What didn't?
3. **Coordination** - Were handoffs smooth? Communication gaps?
4. **Technical** - What security improvements are needed?
5. **Process** - What procedures need updating?

---
</output>

<ask>Would you like to conduct a lessons learned session?

1. **Full session** - Assemble all teams for comprehensive review
2. **Quick debrief** - Document key findings only
3. **Schedule later** - Set reminder for post-incident review

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <output>Assembling lessons learned session...

All incident teams will participate in structured review.

Starting comprehensive debrief...</output>

  <action>Load and followparty-mode with all incident teams</action>
  <action>Capture lessons learned document</action>
</check>

<action>Goto step 9</action>
</step>

<step n="9" goal="Complete incident orchestration">
<output>
# INCIDENT RESPONSE COMPLETE

## Incident Summary

| Attribute | Value |
|-----------|-------|
| Type | {incident_type} |
| Severity | {incident_severity} |
| Duration | {incident_duration} |
| Detection to Containment | {time_to_contain} |
| Teams Involved | Cybersec, Intel, Legal, Strategy |

## Artifacts Generated

| Artifact | Location |
|----------|----------|
| Incident Summary | {incident_summary_path} |
| IOCs | {iocs_path} |
| Attribution Report | {attribution_report_path} |
| Notification Requirements | {notification_requirements_path} |
| Communications Plan | {communications_plan_path} |
| Eradication Log | {eradication_log_path} |
| Lessons Learned | {lessons_learned_path} |

## Compliance Status

{{#each notification_status}}
| {framework} | {status} | {action_date} |
{{/each}}

## Follow-Up Actions

{{#each follow_up_actions}}
- [ ] {action} - Owner: {owner} - Due: {due_date}
{{/each}}

---

**Return to Abdul:** Use [PS] Project Status to track follow-up items.
</output>

<action>Save incident orchestration summary to {output_folder}/incident-{incident_id}-summary.md</action>
</step>

</workflow>
