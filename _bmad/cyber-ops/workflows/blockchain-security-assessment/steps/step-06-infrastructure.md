---

name: 'step-06-infrastructure'
description: 'Infrastructure, node, frontend, and dApp security assessment'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/blockchain-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-06-infrastructure.md'
nextStepFile: '{workflow_path}/steps/step-07-findings-summary.md'
outputFile: '{output_folder}/security/blockchain-security-assessment-{project_name}.md'

---

# Step 6: Infrastructure & Frontend Security

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on infrastructure and frontend security
- FORBIDDEN to discuss remediation yet
- Cover both on-chain and off-chain components

## STEP GOAL:

To assess infrastructure security including RPC endpoints, node security, frontend/dApp security, and operational security.

## INFRASTRUCTURE SECURITY SEQUENCE:

### 1. RPC & Node Security

"Let's assess RPC endpoint security:

**RPC Configuration:**

| Endpoint Type | Provider | Security |
|---------------|----------|----------|
| Public RPC | [Provider] | ? |
| Private RPC | [Provider] | ? |
| Archive node | [Provider] | ? |

**RPC Security Checks:**

| Check | Status | Risk |
|-------|--------|------|
| Rate limiting | ? | ? |
| Authentication | ? | ? |
| HTTPS enforced | ? | ? |
| Fallback endpoints | ? | ? |

What RPC infrastructure does the dApp use?"

### 2. Frontend Security

"Let's review dApp frontend security:

**Frontend Checks:**

| Check | Status | Risk |
|-------|--------|------|
| CSP headers | ? | ? |
| Subresource integrity | ? | ? |
| Dependency auditing | ? | ? |
| Build verification | ? | ? |

**Web3 Integration:**

| Check | Status | Risk |
|-------|--------|------|
| Transaction preview | ? | ? |
| Address validation | ? | ? |
| EIP-712 signing | ? | ? |
| Phishing protection | ? | ? |

How is the frontend deployed and secured?"

### 3. Private Key Management

"Let's assess key management practices:

**Deployment Keys:**

| Key Type | Storage | Access Control |
|----------|---------|----------------|
| Deployer | ? | ? |
| Admin/Owner | ? | ? |
| Operational | ? | ? |

**Key Security Checks:**

| Check | Best Practice | Status |
|-------|---------------|--------|
| Hardware wallets | Required for critical | ? |
| Key rotation | Periodic rotation | ? |
| Key backup | Secure backup procedure | ? |
| Access logging | Audit trail | ? |

How are private keys stored and managed?"

### 4. API & Backend Security

"Let's review off-chain components:

**Backend Services:**

| Service | Purpose | Security |
|---------|---------|----------|
| [Service] | [Purpose] | ? |

**API Security Checks:**

| Check | Status | Risk |
|-------|--------|------|
| Authentication | ? | ? |
| Rate limiting | ? | ? |
| Input validation | ? | ? |
| Logging | ? | ? |

Does the protocol have off-chain APIs or services?"

### 5. IPFS & Decentralized Storage

"Let's assess decentralized storage:

**Storage Configuration:**

| Storage Type | Usage | Pinning |
|--------------|-------|---------|
| IPFS | ? | ? |
| Arweave | ? | ? |
| Filecoin | ? | ? |

**Storage Security:**

| Check | Status | Risk |
|-------|--------|------|
| Content verification | ? | ? |
| Gateway security | ? | ? |
| Redundancy | ? | ? |

Is decentralized storage used? How is it secured?"

### 6. Operational Security

"Let's review operational security:

**OpSec Practices:**

| Practice | Status | Details |
|----------|--------|---------|
| Incident response plan | ? | ? |
| Bug bounty program | ? | ? |
| Security monitoring | ? | ? |
| Disclosure policy | ? | ? |

**Monitoring:**

| Monitoring Type | Tool/Service | Coverage |
|-----------------|--------------|----------|
| On-chain | [Tool] | ? |
| Off-chain | [Tool] | ? |
| Alerts | [Service] | ? |

What operational security measures are in place?"

### 7. Document Infrastructure Security

Update Section 6 of {outputFile}:

```markdown
## 6. Infrastructure & Frontend Security

### 6.1 RPC & Node Security

| Endpoint | Provider | Authentication | Failover |
|----------|----------|----------------|----------|
| [User data] | | | |

**RPC Security Findings:**
[Specific findings]

### 6.2 Frontend Security

| Security Control | Status | Finding |
|------------------|--------|---------|
| [User data] | | |

**Frontend Recommendations:**
[Specific recommendations]

### 6.3 Private Key Management

| Key Type | Storage Method | Access Control | Risk Level |
|----------|----------------|----------------|------------|
| [User data] | | | |

**Key Management Findings:**
[Specific findings]

### 6.4 API & Backend Security

| Service | Security Status | Finding |
|---------|-----------------|---------|
| [User data] | | |

### 6.5 Decentralized Storage

| Storage | Usage | Security | Redundancy |
|---------|-------|----------|------------|
| [User data] | | | |

### 6.6 Operational Security

| Practice | Status | Maturity |
|----------|--------|----------|
| Incident Response | [Yes/No] | [Level] |
| Bug Bounty | [Yes/No] | [Platform] |
| Monitoring | [Yes/No] | [Coverage] |
| Disclosure Policy | [Yes/No] | [Type] |

### 6.7 Infrastructure Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top Infrastructure Recommendations:**
1. [Highest priority]
2. [Second priority]
3. [Third priority]
```

### 8. Confirmation and Next Step

"**Infrastructure & Frontend Security Complete**

I've assessed:
- RPC and node security
- Frontend/dApp security
- Private key management
- API and backend security
- Decentralized storage
- Operational security practices

Next, we'll compile all findings into a summary.

Ready to proceed to findings summary?"

## MENU

Display: **Infrastructure Assessment Complete - Select an Option:** [C] Continue to Findings Summary [R] Review/Revise Assessment

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 6 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN infrastructure assessment is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
