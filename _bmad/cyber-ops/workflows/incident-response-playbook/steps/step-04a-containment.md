---
name: 'step-04a-containment'
description: 'Design short-term and long-term containment strategies with decision criteria and tool-specific commands'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/incident-response-playbook'

# File References
thisStepFile: '{workflow_path}/steps/step-04a-containment.md'
nextStepFile: '{workflow_path}/steps/step-05a-eradication.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: 'Current playbook file from frontmatter'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
brainstormingWorkflow: '{project-root}/_bmad/core/workflows/brainstorming/workflow.md'
---

# Step 4A: Containment Procedures

## STEP GOAL:

To design comprehensive short-term and long-term containment strategies with clear decision criteria and tool-specific commands for containing {incident-type} incidents while minimizing business disruption.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are Phoenix, an IR Planning Consultant
- ✅ If you already have been given a name, communication_style, and persona, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring NIST framework expertise and best practices
- ✅ User brings organizational knowledge and requirements
- ✅ Maintain collaborative, consultative tone

### Step-Specific Rules:

- 🎯 Focus ONLY on containment strategies and immediate response actions
- 🚫 FORBIDDEN to start defining eradication procedures (that's step 5a)
- 💬 Guide through conversational exploration of containment options
- 🎨 Brainstorming ENCOURAGED for innovative containment strategies
- 👥 Party Mode (Bastion) AVAILABLE for architecture-aware containment guidance

## EXECUTION PROTOCOLS:

- 🎯 Leverage organizational context from Section 1 and detection procedures from Section 2
- 💾 Append to Section 3 (Containment Procedures) in output file
- 📖 Update frontmatter `stepsCompleted: [1, 2a, 3a, 4a]` before loading next step
- 🚫 FORBIDDEN to load next step until user selects 'C'

## CONTEXT BOUNDARIES:

- Detection procedures defined in step 3a
- Focus on HOW to contain the incident
- Don't define HOW to eradicate yet (that's step 5a)
- Containment must balance security with business continuity

## CONTAINMENT PROCEDURE SEQUENCE:

### 1. Review Context

Display:

"**Containment Procedures for {incident-type}**

Let's define how your organization will contain **{incident-type}** incidents.

**From Section 1 (Organizational Context):**
- SIEM: {siem-platform}
- EDR: {edr-platform}
- Firewall: {firewall-platform-if-documented}
- Network Segmentation: {network-architecture-summary}

**From Section 2 (Detection):**
- Key IOCs: {summary-of-iocs}
- Affected Systems Profile: {typical-affected-systems}

**NIST Containment Approach:**
NIST defines two containment stages:
1. **Short-term containment:** Immediate actions to limit damage (isolate systems, block IPs, revoke access)
2. **Long-term containment:** Sustained measures while preparing for eradication (patching unaffected systems, monitoring, maintaining business operations)

Let's design both strategies for your environment."

### 2. Define Short-Term Containment Actions

Engage in conversation:

"**Short-Term Containment (Immediate Actions)**

When a {incident-type} incident is confirmed, what immediate actions should be taken to stop the bleeding?

**Endpoint Containment Options:**

For affected endpoints, what's your preferred approach?

1. **Network Isolation** (recommended for most {incident-type} incidents)
   - Disconnect from network (keep powered on for forensics)
   - Your EDR ({edr-platform}): Can it isolate endpoints remotely?
   - Manual method: Disable network adapter, disconnect cable

2. **Quarantine** (isolation but allow limited management traffic)
   - Useful if remote forensics needed
   - EDR quarantine capabilities?

3. **Shutdown** (last resort, loses volatile memory)
   - Only if: {when-is-shutdown-appropriate-for-incident-type}

What's your organization's default approach for {incident-type}? What factors would change that decision?

**Network Containment Options:**

How will you prevent lateral movement?

1. **Firewall Rules**
   - Block malicious IPs/domains (from Section 2 IOCs)
   - Your firewall: {firewall-platform}
   - Who has authority to create emergency rules?
   - What's the approval process during an incident?

2. **Network Segmentation**
   - Can you isolate affected network segments?
   - What VLAN architecture exists?
   - Who can implement emergency segmentation?

3. **DNS Sinkhole**
   - Block malicious domains at DNS level
   - Do you have DNS sinkhole capability?
   - What domains from Section 2 IOCs should be sinkholed?

**Account Containment Options:**

For compromised or suspicious accounts:

1. **Disable Accounts**
   - Active Directory: Disable user accounts
   - Cloud platforms (Office 365, AWS, Azure): Revoke sessions
   - Service accounts: Can they be safely disabled?

2. **Password Reset**
   - Force password reset for affected users
   - Reset service account credentials
   - Rotate API keys/tokens

3. **Revoke Sessions**
   - Kill active sessions
   - Revoke authentication tokens
   - MFA: Require re-authentication

For {incident-type}, which accounts are typically compromised? What's your containment priority?"

Work through each containment category and document:
- Specific actions
- Who has authority to execute
- Approval required? (Yes/No, and from whom)
- Expected time to execute
- Business impact of action
- Fallback if primary method unavailable

### 3. Document Tool-Specific Commands

"**Containment Commands for Your Environment**

Let's document the exact commands for your tools so responders can act quickly.

**EDR ({edr-platform}) Commands:**

What commands will your team use?

Examples for common EDR platforms:

- **CrowdStrike:**
  ```
  # Isolate host
  $ falcon-cli contain <hostname>

  # Verify isolation
  $ falcon-cli list-contained-hosts

  # Release from containment
  $ falcon-cli lift <hostname>
  ```

- **SentinelOne:**
  ```
  # Network quarantine
  API: POST /web/api/v2.1/agents/actions/disconnect

  # Kill process
  API: POST /web/api/v2.1/agents/actions/kill-process
  ```

- **Microsoft Defender:**
  ```powershell
  # Isolate device
  Invoke-MDATPDeviceAction -DeviceId <id> -Action Isolate

  # Restrict app execution
  Set-MDATPDeviceGroup -GroupId <id> -Policy Restricted
  ```

What are the actual commands for {edr-platform} in your environment?

**SIEM ({siem-platform}) Actions:**

How do you use SIEM for containment?

- Create correlation rule to block repeat offenders?
- Trigger automated response workflows?
- Alert enrichment for rapid decision-making?

**Firewall ({firewall-platform}) Commands:**

What firewall commands will you use?

Examples:

- **Palo Alto:**
  ```
  # Block IP address
  > configure
  > set rulebase security rules BLOCK-IOC source <malicious-IP>
  > commit

  # Block domain
  > set profiles custom-url-category BLOCKED-DOMAINS url-list <malicious-domain>
  ```

- **Cisco ASA:**
  ```
  # Block IP
  access-list OUTSIDE-IN deny ip host <malicious-IP> any
  access-group OUTSIDE-IN in interface outside
  ```

- **FortiGate:**
  ```
  # Block IP address
  config firewall address
    edit "BlockedIP"
    set type iprange
    set start-ip <malicious-IP>
    set end-ip <malicious-IP>
  end
  ```

**Active Directory / Identity Platform:**

Commands to contain account compromise:

```powershell
# Disable AD account
Disable-ADAccount -Identity <username>

# Force password reset
Set-ADAccountPassword -Identity <username> -Reset

# Revoke all sessions (Azure AD)
Revoke-AzureADUserAllRefreshToken -ObjectId <user-object-id>

# Disable service account
Set-ADUser -Identity <service-account> -Enabled $false
```

**Cloud Platform Commands (if applicable):**

- **AWS:**
  ```bash
  # Revoke IAM user sessions
  aws iam delete-access-key --access-key-id <key-id> --user-name <user>

  # Isolate EC2 instance (attach restrictive security group)
  aws ec2 modify-instance-attribute --instance-id <id> --groups <quarantine-sg>

  # Block IP at VPC level
  aws ec2 create-network-acl-entry --network-acl-id <id> --ingress --rule-number 100 --protocol -1 --rule-action deny --cidr-block <malicious-IP>/32
  ```

- **Azure:**
  ```powershell
  # Isolate VM (remove from network security group)
  Remove-AzNetworkInterfaceIpConfig -NetworkInterface <nic> -Name <config>

  # Revoke user sessions
  Revoke-AzureADUserAllRefreshToken -ObjectId <object-id>
  ```

Let's document the exact commands for your environment."

### 4. Define Long-Term Containment Strategy

"**Long-Term Containment**

After short-term containment limits immediate damage, how will you maintain containment while preparing for eradication?

**System Patching (Unaffected Systems):**
- Patch all unaffected systems to prevent spread
- Vulnerability that enabled {incident-type}: {vulnerability-if-known}
- Patch priority: Critical systems first
- Patch testing: Can you skip testing during incident?
- Patching timeline: {timeline}

**Enhanced Monitoring:**
- What additional monitoring will you implement?
- SIEM rule adjustments
- EDR policy changes
- Network traffic analysis
- Log collection enhancements

**Threat Hunting:**
- Hunt for additional compromised systems
- Use IOCs from Section 2
- Frequency: {how-often}
- Scope: {what-to-hunt}

**Maintaining Business Operations:**
- What workarounds are needed?
- Can users work with systems isolated?
- Alternative systems available?
- Communication to users about limitations

**Temporary Hardening:**
- MFA enforcement (if not already)
- Application whitelisting
- Elevated logging
- Restrictive firewall rules
- VPN-only access

For {incident-type}, what long-term containment measures make sense for your organization?"

### 5. Create Containment Decision Matrix

"**Containment Decision Matrix**

Not all incidents require the same containment approach. Let's create a decision matrix based on severity and scope.

For {incident-type} incidents:

**If Severity = Critical:**
- Affected systems: {action-e.g.-immediate-isolation}
- Network: {action-e.g.-segment-VLAN}
- Accounts: {action-e.g.-disable-immediately}
- Approval required: {yes/no-and-from-whom}
- Business impact: {accept-for-critical-incidents}

**If Severity = High:**
- Affected systems: {action}
- Network: {action}
- Accounts: {action}
- Approval required: {level}
- Business impact consideration: {factors}

**If Severity = Medium:**
- Affected systems: {action}
- Network: {action}
- Accounts: {action}
- Approval required: {level}

**If Severity = Low:**
- Affected systems: {action}
- Network: {action}
- Accounts: {action}

**Special Considerations for {incident-type}:**
- If ransomware encryption in progress → {immediate-action}
- If data exfiltration detected → {immediate-action}
- If critical system affected → {immediate-action}
- If during business hours vs. off-hours → {different-approach?}

Let's work through this matrix together."

### 6. Document Rollback Procedures

"**Rollback and Recovery from Containment**

Containment actions can break things. How will you roll back if needed?

**If endpoint isolation causes critical business disruption:**
- Decision maker: {who-can-authorize-rollback}
- Rollback procedure: {steps-to-release-isolation}
- Compensating controls: {what-controls-if-you-must-release}

**If firewall rules block legitimate traffic:**
- Monitoring for false positives: {how}
- Rule refinement process: {process}
- Emergency rule removal: {who-and-how}

**If account disabling affects critical service:**
- Identify critical service accounts upfront: {list}
- Alternative authentication: {options}
- Temporary access procedure: {process}

**Communication for Rollback:**
- Who must be notified?
- Documentation requirements
- Lessons learned capture

Have you experienced containment actions causing business disruption in the past? What did you learn?"

### 7. Brainstorming & Expert Consultation (Optional)

"**Containment Strategy Enhancement**

Would you like to explore innovative containment strategies or consult with experts?

**Option 1: Brainstorming**
- Creative containment approaches
- Minimizing business impact
- Deception techniques (honeypots, decoys)
- Automated containment workflows

**Option 2: Party Mode - Bastion (Architecture Expert)**
- Architecture-aware containment strategies
- Network segmentation recommendations
- Cloud-specific containment tactics
- Zero trust approach to containment

Which option interests you, or shall we proceed with what we have?"

### 8. Document Containment Procedures

Append to Section 3 (Containment Procedures) in output file:

```markdown
## 3. Containment Procedures

### 3.1 Short-Term Containment (Immediate Actions)

**Goal:** Limit damage and prevent spread within {timeframe-based-on-severity}

**Endpoint Containment:**

| Scenario | Action | Tool/Method | Authorized By | Approval Required | Execution Time | Business Impact |
|----------|--------|-------------|---------------|-------------------|----------------|-----------------|
| Single endpoint affected | {action} | {edr-platform} | SOC Analyst | No | < 5 min | Minimal |
| Multiple endpoints (< 10) | {action} | {edr-platform} | IR Team Lead | SOC Manager | < 15 min | Low |
| Multiple endpoints (> 10) | {action} | {edr-platform} + {other} | IR Team Lead | CISO | < 30 min | Medium |
| Critical server affected | {action} | {method} | IR Team Lead | CISO + IT Director | < 10 min | High - planned downtime |

**EDR ({edr-platform}) Commands:**
```
{isolation-command}
{verification-command}
{release-command}
```

**Network Containment:**

| Scenario | Action | Tool/Method | Authorized By | Approval Required | Execution Time |
|----------|--------|-------------|---------------|-------------------|----------------|
| Block malicious IP/domain | {action} | {firewall-platform} | Network Security | SOC Manager | < 10 min |
| Isolate network segment | {action} | {network-device} | Network Engineering | CISO | < 30 min |
| DNS sinkhole | {action} | {dns-platform} | Network Security | No | < 5 min |

**Firewall ({firewall-platform}) Commands:**
```
{block-ip-command}
{block-domain-command}
{segment-vlan-command}
```

**Account Containment:**

| Scenario | Action | Tool/Method | Authorized By | Approval Required | Execution Time |
|----------|--------|-------------|---------------|-------------------|----------------|
| Compromised user account | {action} | Active Directory | IR Analyst | No | < 5 min |
| Compromised admin account | {action} | AD + Cloud IAM | IR Team Lead | CISO | < 10 min |
| Compromised service account | {action} | AD + App config | IR Team Lead | App Owner + CISO | < 15 min |

**Account Containment Commands:**
```powershell
{disable-account-command}
{reset-password-command}
{revoke-sessions-command}
{rotate-service-account-credentials-command}
```

**Cloud Platform Containment (if applicable):**
```
{cloud-isolation-commands}
```

### 3.2 Long-Term Containment (Sustained Measures)

**Goal:** Maintain containment while preparing for eradication; prevent reinfection

**System Hardening (Unaffected Systems):**
- [ ] Patch vulnerability: {vulnerability-CVE-or-description}
- [ ] Priority systems: {critical-systems-list}
- [ ] Patching timeline: {timeline-e.g.-within-24-hours}
- [ ] Testing: {skip-testing-or-abbreviated-testing-during-incident}
- [ ] Responsible: {patch-management-team}

**Enhanced Monitoring:**
- [ ] SIEM rule adjustments: {new-rules-or-threshold-changes}
- [ ] EDR policy changes: {policy-changes}
- [ ] Network traffic analysis: {focus-areas}
- [ ] Log collection: {additional-log-sources}
- [ ] Monitoring duration: {how-long-e.g.-30-days-post-eradication}

**Threat Hunting:**
- [ ] Hunt for additional compromised systems using Section 2 IOCs
- [ ] Frequency: {frequency-e.g.-every-4-hours}
- [ ] Scope: {what-systems-to-hunt}
- [ ] Responsible: {threat-hunting-team-or-SOC}
- [ ] Documentation: {where-to-document-findings}

**Business Operations Workarounds:**
- {workaround-1-for-isolated-systems}
- {workaround-2-for-disabled-accounts}
- {workaround-3-for-network-segmentation}
- Communication: {how-users-are-informed}

**Temporary Security Enhancements:**
- [ ] MFA enforcement: {scope}
- [ ] Application whitelisting: {affected-systems}
- [ ] Elevated logging: {systems-and-duration}
- [ ] Restrictive firewall rules: {rules}
- [ ] VPN-only access: {for-which-resources}

### 3.3 Containment Decision Matrix

**Decision criteria based on severity and scope:**

| Severity | Scope | Endpoint Action | Network Action | Account Action | Approval | Timeline |
|----------|-------|-----------------|----------------|----------------|----------|----------|
| Critical | Any | {action} | {action} | {action} | {approver} | Immediate |
| High | Single | {action} | {action} | {action} | {approver} | < 15 min |
| High | Multiple | {action} | {action} | {action} | {approver} | < 30 min |
| Medium | Single | {action} | {action} | {action} | {approver} | < 1 hour |
| Medium | Multiple | {action} | {action} | {action} | {approver} | < 2 hours |
| Low | Any | {action} | {action} | {action} | {approver} | < 4 hours |

**Special Containment Scenarios for {incident-type}:**

- **If ransomware encryption actively spreading:**
  - Immediate action: {action-e.g.-isolate-all-potentially-affected-systems}
  - Network action: {action-e.g.-segment-entire-VLAN}
  - Approver: CISO (can be post-action notification during active attack)

- **If data exfiltration detected in progress:**
  - Immediate action: {action}
  - Network action: {action}
  - Approver: {approver}

- **If critical production system affected:**
  - Balance containment vs. business continuity
  - Decision maker: CISO + CIO + Business Owner
  - Fallback: {alternative-containment-if-cannot-isolate}

- **Business hours vs. off-hours:**
  - Business hours: {considerations-e.g.-coordinate-with-users}
  - Off-hours: {considerations-e.g.-act-faster-notify-later}

### 3.4 Rollback and Recovery from Containment

**If containment actions cause unacceptable business disruption:**

**Endpoint Isolation Rollback:**
- Decision maker: {role}
- Rollback procedure:
  1. {step-1}
  2. {step-2}
  3. {step-3}
- Compensating controls: {controls-if-must-release-isolation}

**Firewall Rule Rollback:**
- False positive monitoring: {monitoring-method}
- Rule refinement: {process}
- Emergency removal: {who-and-how}

**Account Re-enablement:**
- Critical service accounts: {pre-identified-list}
- Temporary access: {procedure}
- Documentation: {requirements}

**Communication:**
- Notify: {stakeholders}
- Document: {what-to-document}
- Lessons learned: {capture-process}

### 3.5 Containment Validation

**How to verify containment is effective:**

- [ ] Affected systems no longer communicating with IOCs (Section 2.1)
- [ ] No new systems showing indicators of compromise
- [ ] No lateral movement detected
- [ ] Threat hunting (Section 3.2) shows no additional compromises
- [ ] SIEM alerts for {incident-type} have decreased
- [ ] EDR telemetry shows containment holding

**Containment Success Criteria:**
- No new infections for {timeframe-e.g.-72-hours}
- All known-affected systems isolated or remediated
- Network traffic to malicious infrastructure blocked
- Compromised accounts disabled or credentials rotated
- IR Team Lead sign-off: {signature-and-timestamp}

**If Containment Fails:**
- Escalate to: {escalation-path}
- Re-assess containment strategy
- Consider: {more-aggressive-containment-options}
```

Update frontmatter:
```yaml
stepsCompleted: [1, 2a, 3a, 4a]
lastUpdated: '{timestamp}'
```

### 9. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [B] Brainstorming [C] Continue

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then redisplay the menu

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask} with focus on "quality and completeness of containment procedures and decision matrix"
- IF P: Execute {partyModeWorkflow} - Recommend Bastion (architecture expert) for containment strategies
- IF B: Execute {brainstormingWorkflow} with focus on "innovative containment strategies that minimize business impact"
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#9-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and Section 3 is complete will you load, read entire file, then execute `{nextStepFile}` to begin defining eradication procedures.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Short-term and long-term containment strategies documented
- Tool-specific commands provided for {edr-platform}, {firewall-platform}, and other tools
- Containment decision matrix complete with severity/scope considerations
- Rollback procedures documented
- Containment validation criteria defined
- Section 3 of playbook complete with all subsections
- Frontmatter updated with stepsCompleted: [1, 2a, 3a, 4a]
- Menu presented and user input handled correctly

### ❌ SYSTEM FAILURE:

- Generic containment procedures not tailored to organization's tools
- Missing decision matrix or approval workflows
- No rollback procedures (critical for business continuity)
- Skipping tool-specific commands
- Defining eradication procedures (belongs in step 5a)
- Proceeding without 'C' selection
- Not updating frontmatter

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
