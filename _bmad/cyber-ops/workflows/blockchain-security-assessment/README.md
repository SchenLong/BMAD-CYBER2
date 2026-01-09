# Blockchain Security Assessment Workflow

## Overview

A comprehensive 8-step workflow for auditing blockchain applications, smart contracts, DeFi protocols, and Web3 infrastructure. This workflow provides systematic security analysis following industry best practices.

## Workflow Structure

```
blockchain-security-assessment/
├── workflow.md                  # Main workflow definition
├── README.md                    # This file
├── steps/
│   ├── step-01-init.md             # Initialization & scope
│   ├── step-01b-continue.md        # Continuation handler
│   ├── step-02-smart-contract-review.md  # Code security
│   ├── step-03-access-control.md   # Privileges & centralization
│   ├── step-04-economic-security.md # Tokenomics & incentives
│   ├── step-05-defi-vulnerabilities.md # DeFi-specific risks
│   ├── step-06-infrastructure.md   # dApp & infrastructure
│   ├── step-07-findings-summary.md # Consolidated findings
│   └── step-08-remediation.md      # Fixes & roadmap
└── templates/
    └── audit-report-template.md    # Standard report format
```

## Supported Platforms

- Ethereum (EVM-compatible)
- Polygon, Arbitrum, Optimism, Base
- BSC, Avalanche
- Solana
- Cross-chain bridges

## Protocol Types Covered

- **DeFi:** DEX, Lending, Yield, Derivatives
- **NFT:** Marketplaces, Collections, Gaming
- **Infrastructure:** Bridges, Oracles, DAOs

## Assessment Coverage

### Smart Contract Security
- Reentrancy analysis
- Integer overflow/underflow
- Access control at code level
- Input validation
- External call safety
- State management

### Access Control & Centralization
- Role inventory
- Owner privileges
- Multisig configuration
- Timelock analysis
- Rug pull vectors

### Economic Security
- Tokenomics review
- Minting/burning mechanics
- Price manipulation vectors
- Oracle security
- Incentive alignment
- MEV exposure

### DeFi-Specific
- Flash loan attacks
- Composability risks
- Protocol-specific vulnerabilities
- Liquidity risks
- Upgrade security
- Cross-chain issues

### Infrastructure
- RPC/node security
- Frontend security
- Private key management
- API security
- Operational security

## Usage

```bash
# Invoke via agent menu
/blockchain-security-assessment

# Or via Ledger agent
bmad:cyber-ops:agents:blockchain-security-expert
# Select Blockchain Security Assessment from menu
```

## Related Agents

- **Ledger** (Blockchain Expert): Primary agent
- **Gateway** (API Security): Web3 API security
- **Weaver** (Web App): dApp frontend security
- **Cipher** (Threat Intel): On-chain threat analysis

## Output

Assessment report saved to:
```
{output_folder}/security/blockchain-security-assessment-{project_name}.md
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01 | Initial workflow |
