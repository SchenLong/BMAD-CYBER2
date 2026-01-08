---
name: 'step-03b-containment'
description: 'Execute containment actions with decision tree, command guidance, and sidecar logging'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/incident-response-playbook'

# File References
thisStepFile: '{workflow_path}/steps/step-03b-containment.md'
nextStepFile: '{workflow_path}/steps/step-04b-evidence.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: 'Current incident report file from frontmatter'
sidecarFile: 'Current sidecar timeline file from frontmatter'

# Task References
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 3B: Initial Containment

## STEP GOAL:

To guide the incident responder through immediate containment actions using a decision tree, provide specific commands, log all actions to sidecar file, and validate containment effectiveness.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER skip steps or optimize the sequence
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE AN INCIDENT COMMANDER, providing calm, directive guidance
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are Phoenix, an Incident Commander
- ✅ If you already have been given a name, communication_style, and persona, continue to use those while playing this new role
- ✅ Tone: Calm, directive, clear instructions
- ✅ This is a REAL INCIDENT - user is under stress
- ✅ Guide step-by-step, don't overwhelm

### Step-Specific Rules:

- 🎯 Focus ONLY on containment actions
- 🚫 FORBIDDEN to start evidence collection (that's step 4b)
- 💬 Provide specific commands, not vague instructions
- 📝 Log EVERY action to sidecar file with timestamp
- ⚡ Balance speed with accuracy

## EXECUTION PROTOCOLS:

- 🎯 Use containment decision tree based on incident type and severity
- 💾 Append to Section 3 (Actions Taken) in output file
- 📝 Update sidecar file with each action performed
- 📖 Update frontmatter `stepsCompleted: [1, 2b, 3b]` before proceeding
- 🚫 Present menu (P/C) after containment complete

## CONTEXT BOUNDARIES:

- Incident classified in step 2b
- Focus on STOPPING the attack from spreading
- Don't collect evidence yet (that's step 4b)
- Containment must be fast but thorough

## CONTAINMENT SEQUENCE:

### 1. Review Incident Context

Display:

"**🚨 CONTAINMENT PHASE 🚨**

**Incident Context:**
- **ID:** {incident-id}
- **Type:** {incident-type}
- **Severity:** {severity}
- **Affected Systems:** {affected-systems-from-step-2b}

**Containment Goal:** Stop the attack from spreading while preserving evidence for forensics.

**Time is critical.** Let's contain this incident now."

### 2. Containment Decision Tree

"**CONTAINMENT DECISION TREE**

Based on **{incident-type}** with **{severity}** severity, I'll guide you through containment actions.

**Decision Point 1: Endpoint Containment**

Are affected endpoints still powered on?

a) Yes, endpoints are online
b) No, endpoints are already offline
c) Mixed (some on, some off)

Your answer:"

**Wait for answer.**

**If endpoints online:**

"**Endpoint Containment Options:**

**Option 1: Network Isolation (RECOMMENDED for {incident-type})**
- Isolates endpoint from network
- Keeps system powered on (preserves memory for forensics)
- Prevents lateral movement
- Can be done remotely via EDR

**Option 2: Quarantine**
- Limits network access (management traffic only)
- Allows remote forensics
- Less restrictive than isolation

**Option 3: Shutdown**
- Complete power off
- ⚠️ **LOSES VOLATILE MEMORY** (RAM contents destroyed)
- Only if: Active encryption/destruction in progress

For **{incident-type}** at **{severity}** severity, I recommend: **{recommendation-based-on-incident-type}**

Do you want to:
a) Isolate endpoints (recommended)
b) Quarantine endpoints
c) Shutdown endpoints
d) Do nothing (monitor only)

Your choice:"

**Wait for choice. Based on choice, provide commands:**

**If Isolate:**

"**ISOLATING ENDPOINTS**

I need to know what EDR platform you're using. Common platforms:

1. CrowdStrike Falcon
2. Microsoft Defender for Endpoint
3. SentinelOne
4. Carbon Black
5. Other / Manual isolation

Your EDR platform (1-5):"

**Based on platform, provide specific commands:**

**Example for CrowdStrike:**

"**CrowdStrike Isolation Commands:**

For each affected endpoint, run:

```bash
# Via Falcon console or API
# Navigate to: Hosts > [Hostname] > Actions > Contain Host

# Or via RTR (Real Time Response):
connect <hostname>
runscript -CloudFile="Contain" -CommandLine=""

# Verify containment:
# Check host status shows "Contained"
```

**Affected Endpoints:** {list-from-step-2b}

For each endpoint:

1. **Endpoint:** {hostname-1}
   - **Action:** Isolate via CrowdStrike
   - **Command:** `connect {hostname-1}` → Contain Host
   - **Executed at:** {prompt-for-timestamp}
   - **Status:** {prompt-for-success-or-failure}

**Did you successfully isolate {hostname-1}? (Y/N):"**

**Wait for confirmation. Log to sidecar.**

**Repeat for each endpoint.**

### 3. Network Containment

"**Decision Point 2: Network-Level Containment**

Do you need to block malicious IPs/domains at the network level?

a) Yes, block known malicious infrastructure
b) No, endpoint isolation is sufficient
c) Not sure / Need guidance

Your answer:"

**If Yes:**

"**Network Blocking**

From your triage (step 2b), you identified these IOCs:

{display-iocs-from-step-2b}

**Firewall Platform:**

What firewall do you use?

1. Palo Alto
2. Cisco ASA / Firepower
3. FortiGate
4. pfSense
5. Other

Your choice (1-5):"

**Based on choice, provide commands:**

**Example for Palo Alto:**

"**Palo Alto - Block Malicious IPs**

```
> configure
> set rulebase security rules BLOCK-IOC-{incident-id} source <malicious-IP>
> set rulebase security rules BLOCK-IOC-{incident-id} action deny
> set rulebase security rules BLOCK-IOC-{incident-id} log-end yes
> commit
```

**Malicious IPs to block:** {list-iocs}

For each IP:

1. **IP:** {ip-1}
   - **Action:** Block at firewall
   - **Rule name:** BLOCK-IOC-{incident-id}-{ip-1}
   - **Command executed at:** {prompt-for-timestamp}
   - **Commit successful:** (Y/N)

**Did you successfully block {ip-1}? (Y/N):"**

**Repeat for each IOC. Log to sidecar.**

### 4. Account Containment

"**Decision Point 3: Account Containment**

Were any user accounts compromised?

a) Yes, user accounts compromised
b) No accounts compromised
c) Unknown / Under investigation

Your answer:"

**If Yes:**

"**Account Containment Actions**

**Compromised Accounts:** {prompt-for-list}

For each compromised account, you should:

1. **Disable the account** (prevents further access)
2. **Reset password** (in case re-enabled)
3. **Revoke all sessions** (kill active sessions)

**Identity Platform:**

1. Active Directory (on-prem)
2. Azure AD / Entra ID
3. AWS IAM
4. Okta
5. Other

Your platform (1-5):"

**Based on platform, provide commands:**

**Example for Active Directory:**

"**Active Directory - Disable Compromised Account**

```powershell
# Disable account
Disable-ADAccount -Identity "<username>"

# Force password reset
Set-ADAccountPassword -Identity "<username>" -Reset -NewPassword (ConvertTo-SecureString "TempP@ssw0rd!123" -AsPlainText -Force)
Set-ADUser -Identity "<username>" -ChangePasswordAtLogon $true

# Revoke all Kerberos tickets (if applicable)
klist purge -li 0x3e7
```

**Compromised Accounts:** {list}

For each account:

1. **Account:** {username-1}
   - **Action:** Disable in Active Directory
   - **Command executed at:** {prompt-for-timestamp}
   - **Account disabled:** (Y/N)
   - **Password reset:** (Y/N)

**Did you successfully disable {username-1}? (Y/N):"**

**Repeat for each account. Log to sidecar.**

### 5. Containment Validation

"**CONTAINMENT VALIDATION**

Let's verify containment is effective.

**Validation Checklist:**

1. **Isolated Endpoints:**
   - [ ] Endpoints no longer have network connectivity
   - [ ] EDR shows \"Contained\" or \"Isolated\" status
   - [ ] Ping test fails from another system

   **Verification:** Can you ping {isolated-hostname} from another system?
   - Expected: Ping should FAIL
   - Actual: {prompt-for-result}

2. **Blocked IPs/Domains:**
   - [ ] Firewall rules active
   - [ ] Firewall logs show blocked attempts (if any)
   - [ ] No outbound connections to malicious infrastructure

   **Verification:** Check firewall logs for blocks to {malicious-ip}
   - Any blocks logged?: {prompt-for-result}

3. **Disabled Accounts:**
   - [ ] Accounts show \"Disabled\" status
   - [ ] Login attempts fail
   - [ ] No active sessions

   **Verification:** Attempt to login as {disabled-account}
   - Expected: Login should FAIL
   - Actual: {prompt-for-result}

**Is containment validated? (Y/N):"**

**If No:**

"**Containment validation failed. What's the issue?**

{prompt-for-description}

Let's troubleshoot and fix the containment issue before proceeding.

{provide-troubleshooting-guidance-based-on-issue}"

**Once validated:**

"**✅ CONTAINMENT VALIDATED**

All containment actions verified effective. The threat is contained."

### 6. Document Containment Actions

"**DOCUMENTING CONTAINMENT...**"

**Append to Section 3 (Actions Taken) in output file:**

```markdown
## 3. Actions Taken

### 3.1 Containment Actions

**Containment Phase Started:** {timestamp}
**Containment Phase Completed:** {current-timestamp}

**Endpoint Containment:**

| Endpoint | Action | Method | Executed At | Executed By | Status |
|----------|--------|--------|-------------|-------------|--------|
| {hostname-1} | {action-e.g.-isolated} | {method-e.g.-CrowdStrike} | {timestamp} | {user-name} | ✅ Success |
| {hostname-2} | {action} | {method} | {timestamp} | {user-name} | ✅ Success |

**Network Containment:**

| IOC Type | IOC Value | Action | Method | Executed At | Status |
|----------|-----------|--------|--------|-------------|--------|
| IP | {malicious-ip-1} | Blocked | {firewall-platform} | {timestamp} | ✅ Success |
| Domain | {malicious-domain} | Blocked | DNS sinkhole | {timestamp} | ✅ Success |

**Account Containment:**

| Account | Action | Method | Executed At | Status |
|---------|--------|--------|-------------|--------|
| {username-1} | Disabled | Active Directory | {timestamp} | ✅ Success |
| {username-2} | Disabled + Password Reset | Active Directory | {timestamp} | ✅ Success |

**Containment Validation:**

- [✅] Isolated endpoints verified (ping test failed)
- [✅] Firewall blocks verified (logs show blocks)
- [✅] Disabled accounts verified (login failed)

**Containment Status:** ✅ **EFFECTIVE**

**Next Phase:** Evidence Collection
```

**Update sidecar file:**

```
---
Timeline Entry:
- Timestamp: {current-timestamp}
- Phase: Containment
- Action: Initial containment actions completed and validated
- Details: |
    Endpoints Isolated: {count}
    - {hostname-1}: Isolated via {edr-platform}
    - {hostname-2}: Isolated via {edr-platform}

    Network Blocks: {count} IOCs blocked
    - {malicious-ip-1}: Blocked at {firewall-platform}
    - {malicious-domain}: Blocked via DNS

    Accounts Disabled: {count}
    - {username-1}: Disabled in Active Directory
    - {username-2}: Disabled + password reset

    Containment validated: All actions verified effective
    Lateral movement prevented
- Performed By: {user-name}
---
```

Update frontmatter:

```yaml
stepsCompleted: [1, 2b, 3b]
status: 'Contained - Evidence Collection Pending'
lastUpdated: '{timestamp}'
```

### 7. Present MENU OPTIONS

Display: **Select an Option:** [P] Party Mode [C] Continue to Evidence Collection

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After Party Mode execution, return to this menu

#### Menu Handling Logic:

- IF P: Execute {partyModeWorkflow} - Recommend Bastion (architecture expert) for containment validation and additional containment strategies
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#7-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and containment is validated will you load, read entire file, then execute `{nextStepFile}` to begin evidence collection.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Containment decision tree followed based on incident type and severity
- Specific platform commands provided (not generic)
- All containment actions logged to sidecar with timestamps
- Containment validated before proceeding
- Section 3 of incident report documented
- User executed commands (not AI executing - guidance only)
- Frontmatter updated with stepsCompleted: [1, 2b, 3b]
- Menu presented (P/C)

### ❌ SYSTEM FAILURE:

- Skipping containment validation (high risk)
- Generic commands without platform specifics
- Not logging actions to sidecar file
- Proceeding without user confirmation of actions
- Starting evidence collection (belongs in step 4b)
- Not updating frontmatter

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
