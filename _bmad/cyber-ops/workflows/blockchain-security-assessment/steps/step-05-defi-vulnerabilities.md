---

name: 'step-05-defi-vulnerabilities'
description: 'DeFi-specific vulnerability assessment including flash loans, composability, and protocol-specific risks'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/blockchain-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-05-defi-vulnerabilities.md'
nextStepFile: '{workflow_path}/steps/step-06-infrastructure.md'
outputFile: '{output_folder}/security/blockchain-security-assessment-{project_name}.md'

---

# Step 5: DeFi-Specific Vulnerabilities

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on DeFi-specific vulnerabilities
- FORBIDDEN to discuss infrastructure yet
- Cover protocol-specific attack vectors

## STEP GOAL:

To assess DeFi-specific vulnerabilities including flash loans, composability risks, and protocol-type-specific attack vectors.

## DEFI VULNERABILITY SEQUENCE:

### 1. Flash Loan Attack Vectors

"Let's assess flash loan vulnerabilities:

**Flash Loan Exposure:**

| Vector | Applicable | Risk Level |
|--------|------------|------------|
| Price oracle manipulation | ? | ? |
| Governance attacks | ? | ? |
| Collateral manipulation | ? | ? |
| Reward manipulation | ? | ? |
| Arbitrage exploitation | ? | ? |

**Questions:**
- Does the protocol use spot prices anywhere?
- Can governance be influenced within one block?
- Are there time-weighted protections?

Has the protocol considered flash loan attacks?"

### 2. Composability Risks

"Let's analyze composability security:

**Protocol Dependencies:**

| Dependency | Type | Risk if Compromised |
|------------|------|---------------------|
| [Protocol] | [DEX/Lending/etc.] | ? |

**Composability Checks:**

| Check | Status | Risk |
|-------|--------|------|
| External contract trust | ? | ? |
| Callback handling | ? | ? |
| Reentrancy across protocols | ? | ? |
| Assumption validation | ? | ? |

What external protocols does this integrate with?"

### 3. Protocol-Specific Vulnerabilities

"Based on your protocol type, let's check specific vulnerabilities:

**For DEX/AMM:**
- Sandwich attack exposure
- Impermanent loss protection
- LP token security
- Swap slippage handling

**For Lending:**
- Liquidation manipulation
- Bad debt scenarios
- Collateral valuation
- Interest rate manipulation

**For Yield/Staking:**
- Reward distribution bugs
- Stake/unstake reentrancy
- Reward timing attacks
- Compounding vulnerabilities

**For Bridges:**
- Message verification
- Finality assumptions
- Multi-chain state consistency
- Replay protection

Which vulnerabilities are relevant to your protocol type?"

### 4. Liquidity & Slippage

"Let's assess liquidity-related risks:

**Liquidity Security:**

| Check | Status | Risk |
|-------|--------|------|
| Minimum liquidity | ? | ? |
| Slippage protection | ? | ? |
| Liquidity withdrawal limits | ? | ? |
| Pool draining protection | ? | ? |

**Price Impact Analysis:**
- What happens with large trades?
- Is there circuit breaker on price impact?
- How is slippage calculated?

How does the protocol handle low liquidity scenarios?"

### 5. Upgrade & Migration Risks

"Let's review upgrade security:

**Upgrade Mechanism:**

| Check | Status | Risk |
|-------|--------|------|
| Proxy pattern | [Type] | ? |
| Storage layout | ? | ? |
| Implementation validation | ? | ? |
| Migration procedures | ? | ? |

**Upgrade Security:**
- Who can upgrade?
- Is there a timelock?
- Can upgrades drain funds?
- Is there upgrade validation?

What upgrade mechanism is used?"

### 6. Cross-Chain Vulnerabilities (if applicable)

"Let's assess cross-chain security:

**Bridge Security:**

| Check | Status | Risk |
|-------|--------|------|
| Message authentication | ? | ? |
| Finality confirmation | ? | ? |
| Replay protection | ? | ? |
| Chain reorganization | ? | ? |

**Cross-Chain Risks:**
- How are cross-chain messages verified?
- What happens during chain reorgs?
- Are there trusted relayers?

Is this a cross-chain protocol?"

### 7. Document DeFi Vulnerabilities

Update Section 5 of {outputFile}:

```markdown
## 5. DeFi-Specific Vulnerabilities

### 5.1 Flash Loan Attack Assessment

| Attack Vector | Applicable | Current Mitigation | Risk Level |
|---------------|------------|-------------------|------------|
| [User data] | | | |

**Flash Loan Recommendations:**
[Specific recommendations]

### 5.2 Composability Risk Analysis

**External Dependencies:**
| Protocol | Dependency Type | Trust Level | Failure Impact |
|----------|-----------------|-------------|----------------|
| [User data] | | | |

**Composability Findings:**
[Specific findings]

### 5.3 Protocol-Specific Vulnerabilities

**Protocol Type:** [DEX/Lending/Bridge/etc.]

| Vulnerability Class | Applicable | Finding | Severity |
|---------------------|------------|---------|----------|
| [User data] | | | |

### 5.4 Liquidity & Slippage

| Check | Status | Finding | Risk |
|-------|--------|---------|------|
| [User data] | | | |

### 5.5 Upgrade Security

**Proxy Type:** [UUPS/Transparent/Beacon/None]

| Security Check | Status | Finding |
|----------------|--------|---------|
| [User data] | | |

### 5.6 Cross-Chain Security (if applicable)

| Security Check | Status | Finding | Risk |
|----------------|--------|---------|------|
| [User data] | | | |

### 5.7 DeFi Vulnerability Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top DeFi Recommendations:**
1. [Highest priority]
2. [Second priority]
3. [Third priority]
```

### 8. Confirmation and Next Step

"**DeFi Vulnerability Assessment Complete**

I've analyzed:
- Flash loan attack vectors
- Composability risks
- Protocol-specific vulnerabilities
- Liquidity and slippage handling
- Upgrade mechanism security
- Cross-chain vulnerabilities (if applicable)

Next, we'll assess infrastructure and frontend security.

Ready to proceed to infrastructure security?"

## MENU

Display: **DeFi Assessment Complete - Select an Option:** [C] Continue to Infrastructure Security [R] Review/Revise Assessment

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 5 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN DeFi assessment is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
