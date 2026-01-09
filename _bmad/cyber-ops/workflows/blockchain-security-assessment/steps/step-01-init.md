---

name: 'step-01-init'
description: 'Initialize blockchain security assessment and define scope'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/blockchain-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-smart-contract-review.md'
continueStepFile: '{workflow_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/security/blockchain-security-assessment-{project_name}.md'

---

# Step 1: Blockchain Security Assessment Initialization

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Check for existing assessments before starting fresh
- Gather comprehensive scope information
- Define blockchain platforms and contract addresses

## CONTINUATION CHECK

Before proceeding, check if {outputFile} exists:

- IF EXISTS: Load, read entire file, and then execute {continueStepFile}
- IF NOT EXISTS: Continue with fresh assessment initialization below

## INITIALIZATION SEQUENCE:

### 1. Assessment Welcome

"Welcome to the Blockchain Security Assessment workflow. I'm Ledger, your blockchain security specialist.

This comprehensive assessment covers:
- Smart contract security analysis
- DeFi protocol vulnerability assessment
- Access control and privilege analysis
- Economic and tokenomics security
- Cross-chain bridge security (if applicable)
- Frontend/dApp security
- Infrastructure and node security

Let's begin by understanding your project scope."

### 2. Blockchain Platform Selection

"What blockchain platform(s) is your project deployed on?

**Primary Platforms:**
- [ ] Ethereum (EVM-compatible)
- [ ] Polygon
- [ ] Arbitrum
- [ ] Optimism
- [ ] Base
- [ ] BSC (BNB Chain)
- [ ] Avalanche
- [ ] Solana
- [ ] Other L1/L2: _____

**Cross-chain:**
- [ ] Multi-chain deployment
- [ ] Bridge protocol involved

Which platform(s) should we focus on?"

### 3. Project Type Classification

"What type of Web3 project are we assessing?

**DeFi Protocols:**
- [ ] DEX (Decentralized Exchange)
- [ ] Lending/Borrowing Protocol
- [ ] Yield Aggregator
- [ ] Liquid Staking
- [ ] Derivatives/Perpetuals
- [ ] Stablecoin Protocol

**NFT/Gaming:**
- [ ] NFT Marketplace
- [ ] NFT Collection (ERC-721/ERC-1155)
- [ ] GameFi/Play-to-Earn
- [ ] Metaverse

**Infrastructure:**
- [ ] Bridge Protocol
- [ ] Oracle Network
- [ ] DAO/Governance
- [ ] Identity/Credentials
- [ ] Other: _____

Please describe your project type and core functionality."

### 4. Smart Contract Information

"Let's identify the contracts in scope:

**Contract Details Needed:**
1. Contract addresses (mainnet/testnet)
2. Source code repository (GitHub, etc.)
3. Compiler version and optimization settings
4. Verified on block explorer? (Etherscan, etc.)
5. Upgradeable? (Proxy pattern used?)
6. Previous audits? (Share reports if available)

Please provide contract information for the assessment."

### 5. Security Concerns

"Are there specific security concerns you'd like us to focus on?

**Common Areas:**
- [ ] Reentrancy vulnerabilities
- [ ] Access control issues
- [ ] Oracle manipulation
- [ ] Flash loan attacks
- [ ] Price manipulation
- [ ] Centralization risks
- [ ] Upgrade mechanism security
- [ ] Economic exploits
- [ ] Front-running/MEV
- [ ] Cross-chain bridge security

Any specific concerns or past incidents?"

### 6. Document Assessment Scope

Create {outputFile} with initial structure:

```markdown
---
project_name: {project_name}
assessment_type: blockchain-security
stepsCompleted: [1]
created_date: {current_date}
last_updated: {current_date}
assessor: {user_name}
platform: [User specified platforms]
project_type: [User specified type]
status: in_progress
---

# Blockchain Security Assessment: {project_name}

## 1. Assessment Overview

### 1.1 Project Information

**Project Name:** {project_name}
**Assessment Date:** {current_date}
**Assessor:** {user_name}, Claude (Ledger)

### 1.2 Blockchain Platform(s)

[User specified platforms]

### 1.3 Project Type

[User specified type and description]

### 1.4 Contracts in Scope

| Contract Name | Address | Network | Verified | Upgradeable |
|--------------|---------|---------|----------|-------------|
| [User data] | | | | |

### 1.5 Source Code Repository

[User provided repository links]

### 1.6 Previous Audits

| Auditor | Date | Findings | Status |
|---------|------|----------|--------|
| [User data] | | | |

### 1.7 Specific Security Concerns

[User identified concerns]

---

## 2. Smart Contract Security Review

[To be completed in Step 2]

## 3. Access Control Analysis

[To be completed in Step 3]

## 4. Economic Security Assessment

[To be completed in Step 4]

## 5. DeFi-Specific Vulnerabilities

[To be completed in Step 5]

## 6. Infrastructure & Frontend Security

[To be completed in Step 6]

## 7. Findings Summary

[To be completed in Step 7]

## 8. Remediation Roadmap

[To be completed in Step 8]

## 9. Appendices

[To be completed in final step]
```

### 7. Confirmation and Next Step

"**Assessment Scope Defined**

I've documented your blockchain security assessment scope:
- Platform(s): [Summary]
- Project type: [Summary]
- Contracts in scope: [Count]
- Specific concerns noted

Next, we'll perform deep smart contract security review.

Ready to proceed to smart contract analysis?"

## MENU

Display: **Initialization Complete - Select an Option:** [C] Continue to Smart Contract Review [R] Review/Revise Scope

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 1 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN scope is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
