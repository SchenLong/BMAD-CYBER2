---

name: 'step-03-access-control'
description: 'Access control, privilege analysis, and centralization risk assessment'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/blockchain-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-03-access-control.md'
nextStepFile: '{workflow_path}/steps/step-04-economic-security.md'
outputFile: '{output_folder}/security/blockchain-security-assessment-{project_name}.md'

---

# Step 3: Access Control Analysis

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on access control and privilege analysis
- FORBIDDEN to discuss economic attacks yet
- Assess centralization risks thoroughly

## STEP GOAL:

To analyze access control mechanisms, privileged roles, and centralization risks in the protocol.

## ACCESS CONTROL SEQUENCE:

### 1. Role Inventory

"Let's identify all privileged roles:

**Role Identification:**

| Role | Address(es) | Privileges | Multisig? |
|------|-------------|------------|-----------|
| Owner | ? | Full admin | ? |
| Admin | ? | Partial admin | ? |
| Operator | ? | Operations | ? |
| Minter | ? | Token minting | ? |
| Pauser | ? | Emergency pause | ? |
| Upgrader | ? | Contract upgrades | ? |

**Questions:**
- What roles exist in the protocol?
- Are role addresses EOAs or multisigs?
- Is there a timelocked governance?

What privileged roles exist in your protocol?"

### 2. Owner Privileges

"Let's analyze owner/admin capabilities:

**Owner Can:**

| Action | Function | Risk Level |
|--------|----------|------------|
| Transfer ownership | transferOwnership() | High |
| Upgrade contracts | upgradeTo() | Critical |
| Pause protocol | pause() | High |
| Change parameters | setX() | Medium-High |
| Withdraw funds | withdraw() | Critical |
| Add/remove roles | grantRole() | High |

**Critical Questions:**
- Can owner drain user funds?
- Can owner pause withdrawals indefinitely?
- Can owner upgrade to malicious code?
- Is there a timelock on critical actions?

What can the owner/admin accounts do?"

### 3. Multisig Assessment

"Let's evaluate multisig security:

**Multisig Configuration:**

| Multisig | Type | Signers | Threshold | Purpose |
|----------|------|---------|-----------|---------|
| [Address] | [Gnosis/Custom] | [Count] | [M-of-N] | [Role] |

**Best Practices Check:**

| Control | Best Practice | Status |
|---------|---------------|--------|
| Threshold | ≥3-of-5 for critical | ? |
| Signer diversity | No single entity control | ? |
| Key management | Hardware wallets | ? |
| Recovery procedure | Documented | ? |

Are critical roles protected by multisigs?"

### 4. Timelock Analysis

"Let's review timelock mechanisms:

**Timelock Configuration:**

| Action | Delay | Cancellable | Governance |
|--------|-------|-------------|------------|
| Upgrades | ? hours | ? | ? |
| Parameter changes | ? hours | ? | ? |
| Role changes | ? hours | ? | ? |

**Recommended Delays:**
- Minor parameters: 24-48 hours
- Major changes: 48-72 hours
- Upgrades: 72+ hours

Is there a timelock on privileged actions?"

### 5. Centralization Risks

"Let's assess centralization risks:

**Centralization Vectors:**

| Risk | Description | Severity |
|------|-------------|----------|
| Single owner | One EOA controls all | Critical |
| Upgrade risk | Instant malicious upgrade | Critical |
| Oracle centralization | Single price feed | High |
| Admin key compromise | Single point of failure | High |
| No timelock | Instant parameter changes | High |

**Rug Pull Vectors:**

| Vector | Possible? | Mitigation |
|--------|-----------|------------|
| Drain funds | ? | ? |
| Infinite mint | ? | ? |
| Pause & trap | ? | ? |
| Upgrade to malicious | ? | ? |

What are the main centralization concerns?"

### 6. Access Control Patterns

"Let's review access control implementation:

**Implementation Pattern:**

| Pattern | Usage | Issues |
|---------|-------|--------|
| Ownable | [Yes/No] | Single owner risk |
| AccessControl | [Yes/No] | Role-based |
| AccessControlEnumerable | [Yes/No] | With enumeration |
| Custom | [Yes/No] | [Details] |

**Security Checks:**
- [ ] Role separation (no God mode)
- [ ] Principle of least privilege
- [ ] Role renunciation possible
- [ ] Emergency procedures defined

What access control pattern is used?"

### 7. Document Access Control

Update Section 3 of {outputFile}:

```markdown
## 3. Access Control Analysis

### 3.1 Role Inventory

| Role | Address | Type | Privileges | Timelock |
|------|---------|------|------------|----------|
| [User data] | | | | |

### 3.2 Owner/Admin Privileges

| Privilege | Function | Risk | Mitigation |
|-----------|----------|------|------------|
| [User data] | | | |

**Can Owner Drain Funds:** [Yes/No/Partially]
**Can Owner Pause Indefinitely:** [Yes/No]
**Can Owner Upgrade Maliciously:** [Yes/No/Timelocked]

### 3.3 Multisig Configuration

| Role | Multisig Address | Type | Threshold | Signers |
|------|------------------|------|-----------|---------|
| [User data] | | | | |

**Multisig Security Assessment:**
[Pass/Fail with details]

### 3.4 Timelock Analysis

| Action Category | Delay | Adequate |
|-----------------|-------|----------|
| [User data] | | |

**Timelock Recommendations:**
[Specific recommendations]

### 3.5 Centralization Risk Assessment

| Risk Factor | Current State | Severity | Recommendation |
|-------------|---------------|----------|----------------|
| [User data] | | | |

**Overall Centralization Rating:** [Low/Medium/High/Critical]

### 3.6 Rug Pull Vector Analysis

| Vector | Exploitable | Effort Required | Mitigation |
|--------|-------------|-----------------|------------|
| [User data] | | | |

### 3.7 Access Control Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top Access Control Recommendations:**
1. [Highest priority]
2. [Second priority]
3. [Third priority]
```

### 8. Confirmation and Next Step

"**Access Control Analysis Complete**

I've analyzed:
- All privileged roles and capabilities
- Multisig configurations
- Timelock mechanisms
- Centralization risks
- Potential rug pull vectors

Next, we'll assess economic security and tokenomics.

Ready to proceed to economic security assessment?"

## MENU

Display: **Access Control Analysis Complete - Select an Option:** [C] Continue to Economic Security [R] Review/Revise Analysis

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 3 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN access control is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
