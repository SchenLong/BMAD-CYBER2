# Legal Team Workflows

Legal analysis workflows for contract review, corporate formation, dispute strategy, and cross-border matters.

---

## Important Disclaimer

> **Legal-Team workflows are designed for supporting other modules in Party Mode and team orchestration scenarios.** Standalone use is not recommended as the module creator is not a legal professional. **Always consult qualified legal counsel for actual legal matters.**

---

## Quick Start

```bash
# Start with legal intake
/legal-team:workflows:legal-matter-intake

# Contract analysis
/legal-team:workflows:contract-review

# Corporate formation guidance
/legal-team:workflows:corporate-formation
```

---

## Workflow Categories

### Legal Intake

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Legal Matter Intake** | `/legal-matter-intake` | 8 | Matter brief with routing |

**Legal Matter Intake** serves as the entry point for all legal matters:
- Initial case assessment
- Jurisdiction analysis
- Complexity evaluation
- Routing to appropriate specialist agents
- Matter brief generation

**When to use**: Starting any new legal inquiry to properly classify and route the matter.

---

### Contract Workflows

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Contract Review** | `/contract-review` | 9 | Comprehensive review report |
| **Contract Drafting** | `/contract-drafting` | 9 | Draft contract |

**Contract Review**
Comprehensive contract analysis across jurisdictions:
- Structure and organization review
- Substantive terms analysis
- Risk allocation assessment (warranties, indemnities, liability)
- Jurisdiction-specific compliance check
- Gap analysis for missing provisions
- Prioritized modification recommendations

**Workflow Steps**:
1. Contract upload and classification
2. Governing law identification
3. Structure review (organization, definitions)
4. Substantive terms analysis
5. Risk allocation assessment
6. Jurisdiction compliance check
7. Gap analysis
8. Recommendations compilation
9. Executive summary generation

**Contract Drafting**
Create jurisdiction-appropriate contracts from requirements:
- Requirements gathering
- Template selection or custom drafting
- Clause-by-clause development
- Jurisdiction compliance validation
- Final review and polish

---

### Corporate Matters

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Corporate Formation** | `/corporate-formation` | 10 | Formation package |
| **Tax Planning** | `/tax-planning` | 10 | Tax planning analysis |

**Corporate Formation**
Multi-jurisdictional entity formation guidance:
- Entity type selection
- Jurisdiction comparison
- Formation requirements checklist
- Compliance requirements
- Ongoing obligations summary

**Supported Jurisdictions**:
- USA (Federal and State)
- EU (Member state specific)
- Spain (National and autonomous communities)
- Estonia (e-Residency focus)

**Tax Planning**
Tax optimization and compliance planning:
- Cross-jurisdictional tax analysis
- Structure optimization
- Compliance calendar
- Risk assessment
- Implementation roadmap

---

### Dispute & Litigation

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Dispute Strategy** | `/dispute-strategy` | 10 | Dispute resolution plan |

**Dispute Strategy**
Analysis and resolution strategy development:
- Dispute assessment
- Strength/weakness analysis
- Resolution options evaluation
- Litigation risk assessment
- Settlement strategy
- Negotiation preparation

---

### Cross-Border Matters

| Workflow | Command | Steps | Output |
|----------|---------|-------|--------|
| **Cross-Border Matter** | `/cross-border-matter` | 10 | Multi-jurisdiction coordination plan |

**Cross-Border Matter**
Multi-jurisdictional legal matter coordination:
- Jurisdiction identification
- Conflict of laws analysis
- Regulatory coordination
- Timing and sequencing
- Risk allocation across jurisdictions

---

## Available Agents

The legal-team module includes 13 specialized agents covering multiple jurisdictions:

### General Practice

| Agent | Specialty |
|-------|-----------|
| **counsel** | General Counsel - matter intake, routing, coordination |
| **covenant** | Contract Specialist - drafting, review, negotiation |
| **advocate** | Litigation Strategist - dispute resolution, settlement |
| **charter** | Corporate Governance - board matters, fiduciary duties |
| **insignia** | IP Counsel - trademarks, patents, copyrights, licensing |
| **deed** | Real Estate Counsel - property, leases, transactions |
| **tribute** | Tax Counsel - cross-jurisdictional tax planning |

### Jurisdiction Specialists

| Agent | Jurisdiction | Focus |
|-------|--------------|-------|
| **liberty** | USA | Federal and state corporate/civil law |
| **europa** | EU | EU regulations, GDPR, cross-border |
| **castile** | Spain | Corporate, commercial, M&A |
| **iberia** | Spain | Civil Code (family, property, inheritance) |
| **gremio** | Spain | Employment and labor law |
| **baltic** | Estonia | e-Residency, digital business |

---

## Jurisdictions Covered

### United States
- Federal corporate law
- State-specific requirements (Delaware, California, etc.)
- Contract law
- Civil litigation

### European Union
- EU-wide regulations and directives
- GDPR compliance
- Cross-border transactions
- Digital services regulations

### Spain
- National corporate law
- Autonomous community variations
- Civil Code matters
- Employment law

### Estonia
- e-Residency program
- Digital business formation
- EU digital regulations
- Corporate compliance

---

## Primary Use Case: Party Mode Integration

Legal-Team workflows are designed to provide legal perspective when other modules require legal input:

### With Cybersec-Team
- Compliance considerations during security assessments
- Data breach notification requirements
- Regulatory implications of security findings

### With Intel-Team
- Contractual implications in corporate intelligence
- Due diligence legal considerations
- Evidence handling requirements

### With Strategy-Team
- Regulatory concerns in executive strategy sessions
- M&A legal considerations
- Contract negotiation support
- Risk assessment legal dimensions

---

## Workflow Execution

### Starting a Workflow

1. **Via Counsel Agent**:
   ```bash
   /legal-team:counsel
   # Select from menu for proper routing
   ```

2. **Direct Workflow**:
   ```bash
   /legal-team:workflows:contract-review
   ```

### Standard Disclaimers

All legal workflows include:
- Professional legal advice disclaimer
- Jurisdiction limitations notice
- Currency of law warnings
- Recommendation to verify with local counsel

### Output Artifacts

Legal workflows generate:
- Matter briefs with jurisdiction analysis
- Contract review reports with risk ratings
- Compliance checklists
- Recommendation summaries with citations

---

## Common Use Cases

### Contract Review Process
1. Submit contract via **Contract Review** workflow
2. System identifies governing law and routes to appropriate specialist
3. Nine-step analysis covering structure, terms, risk, and compliance
4. Receive prioritized recommendations report

### New Business Formation
1. Start with **Legal Matter Intake** for assessment
2. Use **Corporate Formation** for entity setup guidance
3. Follow up with **Tax Planning** for structure optimization

### Cross-Border Transaction
1. Begin with **Cross-Border Matter** for coordination
2. Engage jurisdiction-specific agents as needed
3. Compile compliance requirements across jurisdictions

### Dispute Resolution
1. Start with **Dispute Strategy** for assessment
2. Evaluate resolution options
3. Develop negotiation or litigation approach
