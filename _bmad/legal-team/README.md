# Legal Team

**Professional-grade legal advisory module for multi-jurisdictional corporate and civil matters**

[![BMAD Compatible](https://img.shields.io/badge/BMAD-compatible-green.svg)](https://github.com/bmad-code-org/BMAD-METHOD)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/status-Phase%201%20MVP-blue.svg)]()

---

## Overview

Legal Team provides comprehensive legal advisory capabilities across USA, EU (with deep Spain and Estonia specialization). Empowers business owners and individuals to navigate legal complexities with jurisdiction-aware counsel.

**Key Features:**
- Multi-jurisdictional expertise (US, EU, Spain, Estonia)
- Corporate and personal civil matters
- Contract lifecycle management
- Dispute strategy and litigation planning
- Tax planning across jurisdictions
- Cross-border matter coordination

**Scope:** Corporate + Civil Law only. Criminal law is explicitly out of scope.

---

## Installation

```bash
bmad install legal-team
```

During installation, you'll configure:
1. **Output folder** - Where to save legal documents
2. **Primary jurisdiction** - Your default jurisdiction (Spain, US, EU, Estonia)
3. **Detail level** - Brief, standard, or comprehensive analysis

---

## Components

### Agents (13 Total)

| | |
|---|---|
| **Director** | Counsel (General Counsel - case intake, routing, coordination) |
| **Jurisdictional** | Liberty (US), Europa (EU), Castile (Spain Corp), Baltic (Estonia) |
| **Spain Deep** | Castile (Corporate), Iberia (Civil), Gremio (Labor) |
| **Practice Areas** | Covenant (Contracts), Charter (Governance), Insignia (IP), Deed (Real Estate), Advocate (Litigation), Tribute (Tax) |

**Phase 1 MVP (7 agents implemented):** Counsel, Liberty, Europa, Castile, Covenant, Advocate, Tribute

**Phase 2 (6 agents planned):** Iberia, Gremio, Baltic, Charter, Insignia, Deed

### Workflows (14 Total)

| Category | Workflows |
|----------|-----------|
| **Contracts** | Contract Review, Contract Drafting |
| **Corporate** | Corporate Formation, Corporate Governance Audit |
| **Disputes** | Dispute Strategy, Legal Matter Intake |
| **Cross-Border** | Cross-Border Matter |
| **Due Diligence** | Due Diligence |
| **Employment** | Employment Review |
| **IP** | IP Protection Strategy |
| **Property** | Real Estate Transaction |
| **Tax** | Tax Planning |
| **Compliance** | Compliance Audit |
| **Research** | Legal Research |

**Phase 1 MVP (6 workflows):** Legal Matter Intake, Contract Review, Contract Drafting, Corporate Formation, Dispute Strategy, Tax Planning

---

## Jurisdictional Coverage

### United States
- Federal and state corporate law
- LLC, C-Corp, S-Corp formation
- Contract and commercial law
- Civil litigation strategy

### European Union
- EU directives and regulations
- GDPR compliance
- Cross-border coordination
- Consumer protection

### Spain (Deep Coverage)
- **Corporate:** Sociedad Limitada (S.L.), Sociedad Anonima (S.A.), Registro Mercantil
- **Civil:** Civil code, family law, property, inheritance
- **Labor:** Estatuto de los Trabajadores, convenios colectivos, dismissals

### Estonia
- e-Residency program
- Osahing (OU) formation
- Digital corporate administration
- EU gateway structure

---

## Quick Start

### 1. Start with Counsel (Director)

```
/legal-team:counsel
```

Counsel will assess your legal matter and route you to the appropriate specialist.

### 2. Common Entry Points

| Need | Agent | Command |
|------|-------|---------|
| New legal matter | Counsel | `/legal-team:counsel` then select [MI] |
| Contract review | Covenant | `/legal-team:covenant` |
| US corporate question | Liberty | `/legal-team:liberty` |
| Spanish company matter | Castile | `/legal-team:castile` |
| Tax planning | Tribute | `/legal-team:tribute` |
| Dispute/litigation | Advocate | `/legal-team:advocate` |

### 3. Example Session

```
User: I need to review a contract for my Spanish subsidiary
Counsel: Let me route you appropriately. Is this a Spain-specific contract?
User: Yes, it's a service agreement under Spanish law
Counsel: I'll engage Covenant (contracts) with Castile (Spanish law) support.
[Routes to Covenant with Spanish law context]
```

---

## Module Structure

```
legal-team/
├── agents/                    # Agent definitions (YAML)
│   ├── counsel.yaml           # General Counsel (Director)
│   ├── liberty.yaml           # US Counsel
│   ├── europa.yaml            # EU Counsel
│   ├── castile.yaml           # Spain Corporate
│   ├── covenant.yaml          # Contract Specialist
│   ├── advocate.yaml          # Litigation Strategist
│   └── tribute.yaml           # Tax Counsel
├── workflows/                 # Workflow folders
│   ├── legal-matter-intake/
│   ├── contract-review/
│   ├── contract-drafting/
│   ├── corporate-formation/
│   ├── dispute-strategy/
│   └── tax-planning/
├── tasks/                     # Task utilities (planned)
├── templates/                 # Document templates
├── data/                      # Legal reference data
├── _module-installer/         # Installation assets
├── module.yaml                # Module configuration
└── README.md                  # This file
```

---

## Configuration

After installation, configuration is stored in `_bmad/legal-team/config.yaml`:

| Setting | Description | Options |
|---------|-------------|---------|
| `output_folder` | Document output location | Path |
| `primary_jurisdiction` | Default jurisdiction | es, us, eu, ee |
| `detail_level` | Analysis verbosity | brief, standard, comprehensive |
| `disclaimer_mode` | Legal disclaimer | always enabled |

---

## Development Status

### Phase 1 MVP (Current)

- [x] Module structure created
- [x] Installer configured
- [x] 7 core agents implemented (Counsel, Liberty, Europa, Castile, Covenant, Advocate, Tribute)
- [x] 6 workflow plans documented
- [ ] Workflow step files implementation
- [ ] Full integration testing

### Phase 2 (Planned)

- [ ] 6 additional agents (Iberia, Gremio, Baltic, Charter, Insignia, Deed)
- [ ] 8 additional workflows
- [ ] Task utilities (Jurisdiction Checker, Deadline Calculator, Template Selector)
- [ ] Legal reference data population

---

## Important Disclaimer

> **This module provides legal information and guidance for educational and informational purposes only. It does not constitute legal advice and does not create an attorney-client relationship. For specific legal matters, always consult with a qualified attorney licensed in the relevant jurisdiction.**

---

## Requirements

- BMAD Method version 6.0.0 or higher
- No external API dependencies (Phase 1)

---

## Author

Created by J on 2026-01-11

---

## License

MIT License

---

**Module Code:** legal-team
**Category:** Domain-Specific (Legal)
**Type:** Complex Module
**Version:** 1.0.0

*Built with the BMAD Method*
