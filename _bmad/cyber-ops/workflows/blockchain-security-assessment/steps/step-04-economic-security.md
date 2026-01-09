---

name: 'step-04-economic-security'
description: 'Economic security, tokenomics, and game theory analysis'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/blockchain-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-04-economic-security.md'
nextStepFile: '{workflow_path}/steps/step-05-defi-vulnerabilities.md'
outputFile: '{output_folder}/security/blockchain-security-assessment-{project_name}.md'

---

# Step 4: Economic Security Assessment

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on economic security and tokenomics
- FORBIDDEN to discuss DeFi-specific vulnerabilities yet
- Analyze incentive structures thoroughly

## STEP GOAL:

To analyze economic security including tokenomics, incentive mechanisms, game theory, and economic attack vectors.

## ECONOMIC SECURITY SEQUENCE:

### 1. Tokenomics Overview

"Let's understand the tokenomics:

**Token Information:**

| Attribute | Value |
|-----------|-------|
| Token Name | ? |
| Token Symbol | ? |
| Total Supply | ? |
| Max Supply | [Capped/Uncapped] |
| Initial Distribution | ? |
| Vesting Schedules | ? |

**Supply Mechanics:**
- [ ] Fixed supply
- [ ] Inflationary (minting)
- [ ] Deflationary (burning)
- [ ] Rebasing
- [ ] Elastic supply

What are the token supply mechanics?"

### 2. Minting & Burning Analysis

"Let's analyze mint/burn mechanics:

**Minting Security:**

| Check | Status | Risk |
|-------|--------|------|
| Minting capped | ? | ? |
| Minting restricted | ? | ? |
| Mint rate limited | ? | ? |
| Emergency mint | ? | ? |

**Burning Security:**

| Check | Status | Risk |
|-------|--------|------|
| Burn mechanism | ? | ? |
| Burn restrictions | ? | ? |
| Burn manipulation | ? | ? |

Who can mint tokens and under what conditions?"

### 3. Price Manipulation Vectors

"Let's assess price manipulation risks:

**Manipulation Vectors:**

| Vector | Applicable | Risk Level |
|--------|------------|------------|
| Flash loan attacks | ? | ? |
| Sandwich attacks | ? | ? |
| Front-running | ? | ? |
| Oracle manipulation | ? | ? |
| Liquidity attacks | ? | ? |

**Price Dependencies:**
- Does the protocol rely on token prices?
- How are prices determined (oracle, TWAP, spot)?
- Is there manipulation protection?

What price feeds does the protocol use?"

### 4. Oracle Security

"Let's evaluate oracle security:

**Oracle Configuration:**

| Oracle | Type | Update Frequency | Manipulation Protection |
|--------|------|------------------|------------------------|
| [Name] | [Chainlink/TWAP/Custom] | ? | ? |

**Oracle Security Checks:**

| Check | Best Practice | Status |
|-------|---------------|--------|
| Multiple sources | Use aggregation | ? |
| Staleness check | Validate freshness | ? |
| Circuit breaker | Price deviation limits | ? |
| Fallback oracle | Backup source | ? |

How does the protocol handle oracle failures?"

### 5. Incentive Alignment

"Let's analyze incentive structures:

**Protocol Incentives:**

| Actor | Incentive | Potential Exploit |
|-------|-----------|-------------------|
| Stakers | [Reward] | ? |
| LPs | [Fees/Rewards] | ? |
| Governors | [Power/Rewards] | ? |
| Arbitrageurs | [Price differences] | ? |

**Game Theory Considerations:**
- Are incentives aligned for honest behavior?
- What happens if largest stakeholder acts maliciously?
- Are there griefing opportunities?

What incentives exist for protocol participants?"

### 6. Value Extraction Risks

"Let's identify value extraction vectors:

**MEV Considerations:**

| Attack | Protocol Exposure | Mitigation |
|--------|-------------------|------------|
| Frontrunning | ? | ? |
| Backrunning | ? | ? |
| Sandwich | ? | ? |
| JIT liquidity | ? | ? |
| Liquidation | ? | ? |

**Protocol-Level Value Leakage:**
- Fee extraction opportunities
- Governance attacks
- Flash loan exploits

Are there known MEV concerns?"

### 7. Document Economic Security

Update Section 4 of {outputFile}:

```markdown
## 4. Economic Security Assessment

### 4.1 Tokenomics Overview

**Token:** [Name] ([Symbol])
**Supply Type:** [Fixed/Inflationary/Deflationary]
**Total Supply:** [Amount]
**Max Supply:** [Amount or Uncapped]

| Distribution Category | Percentage | Vesting |
|----------------------|------------|---------|
| [User data] | | |

### 4.2 Minting & Burning Analysis

**Minting:**
| Condition | Authorized | Risk |
|-----------|------------|------|
| [User data] | | |

**Burning:**
| Mechanism | Condition | Impact |
|-----------|-----------|--------|
| [User data] | | |

### 4.3 Price Manipulation Assessment

| Vector | Applicable | Mitigation | Residual Risk |
|--------|------------|------------|---------------|
| [User data] | | | |

### 4.4 Oracle Security

**Primary Oracle:** [Name]
**Oracle Type:** [Chainlink/TWAP/Custom]

| Security Check | Status | Finding |
|----------------|--------|---------|
| [User data] | | |

**Oracle Recommendations:**
[Specific recommendations]

### 4.5 Incentive Analysis

| Participant | Incentive | Alignment | Exploit Risk |
|-------------|-----------|-----------|--------------|
| [User data] | | | |

**Incentive Misalignments Identified:**
[List of issues]

### 4.6 MEV & Value Extraction

| MEV Type | Exposure | Current Mitigation | Recommendation |
|----------|----------|-------------------|----------------|
| [User data] | | | |

### 4.7 Economic Security Findings Summary

**Critical:** [Count]
**High:** [Count]
**Medium:** [Count]
**Low:** [Count]

**Top Economic Recommendations:**
1. [Highest priority]
2. [Second priority]
3. [Third priority]
```

### 8. Confirmation and Next Step

"**Economic Security Assessment Complete**

I've analyzed:
- Tokenomics and supply mechanics
- Minting and burning security
- Price manipulation vectors
- Oracle security
- Incentive alignment
- MEV exposure

Next, we'll assess DeFi-specific vulnerabilities.

Ready to proceed to DeFi vulnerability assessment?"

## MENU

Display: **Economic Security Complete - Select an Option:** [C] Continue to DeFi Vulnerabilities [R] Review/Revise Assessment

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3, 4]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 4 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN economic assessment is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
