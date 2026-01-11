---
stepsCompleted:
  - step-01-init
  - step-02-concept
  - step-03-components
  - step-04-structure
  - step-05-config
  - step-06-agents
  - step-07-workflows
  - step-08-installer
  - step-09-documentation
  - step-10-roadmap
  - step-11-validate
status: complete
completionDate: 2026-01-11
moduleName: legal-team
createdDate: 2026-01-11
userName: User
inputDocuments: []
---

# Module Plan: legal-team

## Module Concept

**Module Name:** Legal Team
**Module Code:** legal-team
**Category:** Domain-Specific (Legal)
**Type:** Complex Module (12 agents, 12-15+ workflows)

**Purpose Statement:**
Professional-grade legal advisory module providing comprehensive guidance on corporate and personal civil matters across USA, EU (with deep Spain and Estonia specialization). Empowers business owners and individuals to navigate legal complexities with jurisdiction-aware counsel.

**Target Audience:**

- Primary: Business owners/entrepreneurs needing legal guidance across US-EU jurisdictions
- Primary: In-house counsel requiring jurisdiction-specific research and analysis
- Primary: Individuals handling personal civil matters (property, family, disputes)
- Secondary: Startups leveraging Estonia e-Residency for EU market entry

**Scope Definition:**

**In Scope:**

- Legal document drafting and review assistance
- Jurisdiction-specific legal research and guidance
- Case and dispute strategy development
- Compliance analysis and audit preparation
- Cross-border matter coordination (US-EU, intra-EU)
- Corporate formation and governance across jurisdictions
- Contract lifecycle management
- Employment/labor law guidance
- Intellectual property protection
- Real estate/property transactions
- Tax law and planning (corporate and personal tax across jurisdictions)

**Out of Scope:**

- Criminal law (explicitly excluded - no criminal defense or prosecution matters)
- Immigration law (visa, residency permits, citizenship)
- Regulatory filings (actual submission to authorities)
- Formal legal representation (this is advisory, not practice)

**Success Criteria:**

- Users can identify correct jurisdiction and applicable law for their matter
- Contract documents drafted meet jurisdiction-specific requirements
- Cross-border matters properly coordinated between relevant specialists
- Users understand their legal position and options before engaging counsel
- Compliance gaps identified before they become violations

## Overview

Professional-grade legal advisory module covering USA, EU (with deep Spain and Estonia specialization), focused on corporate and personal civil matters. Criminal law is explicitly out of scope.

## Jurisdictional Coverage

- **United States**: Federal and state corporate + civil law
- **European Union**: EU directives, GDPR, cross-border matters
- **Spain (Deep)**: Corporate, civil, and labor law specialists
- **Estonia**: e-Residency, digital corporate, EU gateway

## Planned Agent Roster (12 Agents)

### Coordination
| Agent | Codename | Focus |
|-------|----------|-------|
| General Counsel (Director) | **Counsel** | Case intake, jurisdiction routing, team coordination |

### Jurisdictional Generalists
| Agent | Codename | Focus |
|-------|----------|-------|
| US Counsel | **Liberty** | US federal/state corporate + civil law |
| EU Counsel | **Europa** | EU directives, GDPR, cross-border, EU consumer law |

### Spain Specialists (Deep Coverage)
| Agent | Codename | Focus |
|-------|----------|-------|
| Spain Corporate | **Castile** | Spanish corporate law, Sociedad Limitada/Anónima, commercial |
| Spain Civil | **Iberia** | Spanish civil code, family law, property, inheritance |
| Spain Labor | **Gremio** | Spanish labor law, convenios colectivos, dismissals |

### Estonia Specialist
| Agent | Codename | Focus |
|-------|----------|-------|
| Estonia Corporate | **Baltic** | e-Residency, OÜ formation, digital corporate, EU gateway |

### Practice Area Specialists
| Agent | Codename | Focus |
|-------|----------|-------|
| Contract Specialist | **Covenant** | Contract drafting, review, negotiation |
| Corporate Governance | **Charter** | Board matters, compliance, structure |
| IP Counsel | **Insignia** | Intellectual property, trademarks, licensing |
| Real Estate/Property | **Deed** | Property transactions, leases |
| Litigation Strategist | **Advocate** | Civil litigation strategy, dispute resolution |

## Scope Boundaries

### In Scope
- Corporate law (formation, governance, M&A, compliance)
- Contract law (drafting, review, negotiation)
- Civil matters (property, family basics, torts, disputes)
- Employment/Labor law
- Intellectual property
- Real estate/Property transactions
- Cross-border matters (US-EU, intra-EU)

### Out of Scope
- Criminal law (explicitly excluded)
- Immigration law

## Workflow Categories (Planned)

1. **Contract Workflows** - Review, drafting, negotiation
2. **Corporate Workflows** - Formation, governance, compliance
3. **Dispute Resolution** - Pre-litigation analysis, strategy
4. **Cross-Border** - Multi-jurisdiction coordination
5. **Due Diligence** - M&A, investment, partner vetting
6. **Compliance** - Regulatory analysis, audit prep

---

## Component Architecture

### Agents (13 planned)

1. **Counsel** - General Counsel (Director)
   - Type: Primary
   - Role: Case intake, jurisdiction routing, team orchestration

2. **Liberty** - US Counsel
   - Type: Specialist
   - Role: US federal/state corporate + civil law

3. **Europa** - EU Counsel
   - Type: Specialist
   - Role: EU directives, GDPR, cross-border, consumer law

4. **Castile** - Spain Corporate
   - Type: Specialist
   - Role: Spanish corporate law, S.L./S.A., commercial code

5. **Iberia** - Spain Civil
   - Type: Specialist
   - Role: Spanish civil code, family, property, inheritance

6. **Gremio** - Spain Labor
   - Type: Specialist
   - Role: Spanish labor law, convenios colectivos, dismissals

7. **Baltic** - Estonia Corporate
   - Type: Specialist
   - Role: e-Residency, OÜ formation, digital corporate, EU gateway

8. **Covenant** - Contract Specialist
   - Type: Specialist
   - Role: Contract drafting, review, negotiation across jurisdictions

9. **Charter** - Corporate Governance
   - Type: Specialist
   - Role: Board matters, compliance, corporate structure

10. **Insignia** - IP Counsel
    - Type: Specialist
    - Role: Intellectual property, trademarks, licensing

11. **Deed** - Real Estate/Property
    - Type: Specialist
    - Role: Property transactions, leases, land use

12. **Advocate** - Litigation Strategist
    - Type: Specialist
    - Role: Civil litigation strategy, dispute resolution

13. **Tribute** - Tax Counsel
    - Type: Specialist
    - Role: Corporate + personal tax, cross-border tax planning

### Workflows (14 planned)

1. **Legal Matter Intake** - Initial case assessment and routing
   - Type: Interactive
   - Primary user: All users
   - Key output: Matter brief, agent assignment

2. **Contract Review** - Analyze contracts for risks/issues
   - Type: Document
   - Primary user: Business owners, individuals
   - Key output: Risk assessment report

3. **Contract Drafting** - Create jurisdiction-appropriate contracts
   - Type: Document
   - Primary user: Business owners
   - Key output: Draft contract

4. **Corporate Formation** - Guide through entity setup (US/EU/ES/EE)
   - Type: Interactive
   - Primary user: Entrepreneurs, startups
   - Key output: Formation checklist, draft documents

5. **Corporate Governance Audit** - Review board/compliance structure
   - Type: Document
   - Primary user: In-house counsel, business owners
   - Key output: Governance report

6. **Due Diligence** - M&A/investment target vetting
   - Type: Document
   - Primary user: Business owners, investors
   - Key output: Due diligence report

7. **Dispute Strategy** - Pre-litigation analysis and planning
   - Type: Interactive
   - Primary user: All users with disputes
   - Key output: Strategy memo

8. **Cross-Border Matter** - Multi-jurisdiction coordination
   - Type: Interactive
   - Primary user: International business owners
   - Key output: Jurisdiction analysis

9. **Employment Review** - Labor law compliance check
   - Type: Document
   - Primary user: Business owners, HR
   - Key output: Employment audit

10. **IP Protection Strategy** - Trademark/patent/copyright planning
    - Type: Interactive
    - Primary user: Business owners, creators
    - Key output: IP strategy memo

11. **Real Estate Transaction** - Property purchase/lease review
    - Type: Document
    - Primary user: Business owners, individuals
    - Key output: Transaction analysis

12. **Tax Planning** - Cross-jurisdiction tax optimization
    - Type: Interactive
    - Primary user: Business owners, individuals
    - Key output: Tax strategy memo

13. **Compliance Audit** - Regulatory compliance assessment
    - Type: Document
    - Primary user: Business owners, in-house counsel
    - Key output: Compliance report

14. **Legal Research** - Deep-dive jurisdiction research
    - Type: Document
    - Primary user: All users
    - Key output: Research memo

### Tasks (3 planned)

1. **Jurisdiction Checker** - Quick determination of applicable law
   - Used by: All workflows

2. **Document Template Selector** - Match matter to appropriate templates
   - Used by: Contract workflows

3. **Deadline Calculator** - Statute of limitations, filing deadlines
   - Used by: Litigation, Corporate workflows

### Component Integration

- **Agent Collaboration:** Counsel (director) routes to jurisdiction specialists, who may consult practice area specialists. Cross-border matters involve multiple jurisdiction agents coordinated by Europa.
- **Workflow Dependencies:** Legal Matter Intake feeds into all other workflows. Cross-Border Matter may invoke jurisdiction-specific workflows in sequence.
- **Task Usage:** Jurisdiction Checker used at intake and throughout. Deadline Calculator critical for litigation and corporate filings.

### Development Priority

**Phase 1 (MVP) - 7 agents, 6 workflows:**

Agents:
- Counsel (Director)
- Liberty (US)
- Europa (EU)
- Castile (Spain Corporate)
- Covenant (Contracts)
- Advocate (Litigation)
- Tribute (Tax)

Workflows:
- Legal Matter Intake
- Contract Review
- Contract Drafting
- Corporate Formation
- Dispute Strategy
- Tax Planning

**Phase 2 (Enhancement) - 6 agents, 8 workflows:**

Agents:
- Iberia (Spain Civil)
- Gremio (Spain Labor)
- Baltic (Estonia)
- Charter (Governance)
- Insignia (IP)
- Deed (Real Estate)

Workflows:
- Corporate Governance Audit
- Due Diligence
- Cross-Border Matter
- Employment Review
- IP Protection Strategy
- Real Estate Transaction
- Compliance Audit
- Legal Research

---

## Module Structure

**Module Type:** Complex
**Location:** _bmad-output/bmb-creations/legal-team

**Directory Structure Created:**
- agents/
- workflows/
- tasks/
- templates/
- data/
- _module-installer/assets/
- README.md (placeholder)

**Rationale for Type:**
Complex Module due to 13 agents with multi-jurisdiction interdependencies, 14 workflows covering full legal advisory lifecycle, and cross-border coordination requirements. The module requires sophisticated agent collaboration patterns and jurisdiction-aware routing.

---

## Configuration Planning

### Required Configuration Fields

1. **output_folder**
   - Type: INTERACTIVE text
   - Purpose: Where to save legal documents and reports
   - Default: `_output/legal-team`
   - Input Type: text
   - Prompt: "Where should Legal Team save documents and reports?"

2. **primary_jurisdiction**
   - Type: INTERACTIVE single-select
   - Purpose: User's main jurisdiction for default routing
   - Default: `es` (Spain)
   - Input Type: single-select
   - Prompt: "What is your primary jurisdiction?"
   - Options:
     - `es` - Spain (default)
     - `us` - United States
     - `eu` - European Union (General)
     - `ee` - Estonia

3. **detail_level**
   - Type: INTERACTIVE single-select
   - Purpose: Output verbosity level
   - Default: `standard`
   - Input Type: single-select
   - Prompt: "How detailed should legal analysis be?"
   - Options:
     - `brief` - Executive summary only
     - `standard` - Balanced analysis
     - `comprehensive` - Full legal memorandum style

4. **disclaimer_mode**
   - Type: STATIC
   - Purpose: Always include legal disclaimers (non-negotiable)
   - Default: `enabled`

### Installation Questions Flow

1. Output folder location
2. Primary jurisdiction selection (default: Spain)
3. Detail level preference

### Result Configuration Structure

The module.yaml will generate:
- Module configuration at: `_bmad/legal-team/config.yaml`
- User settings stored with jurisdiction routing preferences and output preferences

---

## Agents Created (Phase 1 MVP)

### Created Agent Files

1. **Counsel** - General Counsel (Director)
   - File: agents/counsel.yaml
   - Features: Embedded prompts for intake, jurisdiction analysis, coordination
   - Sidecar: No
   - Prompts: 3 (matter-intake, jurisdiction-analysis, team-coordination)
   - Workflows: legal-matter-intake, cross-border-matter

2. **Liberty** - US Counsel
   - File: agents/liberty.yaml
   - Features: Embedded prompts for US corporate, contract, civil law
   - Sidecar: No
   - Prompts: 3 (us-corporate-analysis, us-contract-review, us-civil-guidance)
   - Workflows: corporate-formation

3. **Europa** - EU Counsel
   - File: agents/europa.yaml
   - Features: Embedded prompts for EU compliance, cross-border, market entry
   - Sidecar: No
   - Prompts: 3 (eu-compliance-check, cross-border-eu, eu-market-entry)
   - Workflows: cross-border-matter

4. **Castile** - Spain Corporate
   - File: agents/castile.yaml
   - Features: Embedded prompts for Spanish corporate formation, governance, commercial
   - Sidecar: No
   - Prompts: 3 (spain-corporate-formation, spain-governance, spain-commercial)
   - Workflows: corporate-formation

5. **Covenant** - Contract Specialist
   - File: agents/covenant.yaml
   - Features: Embedded prompts for contract review, drafting, negotiation
   - Sidecar: No
   - Prompts: 3 (contract-review, contract-drafting, negotiation-strategy)
   - Workflows: contract-review, contract-drafting

6. **Advocate** - Litigation Strategist
   - File: agents/advocate.yaml
   - Features: Embedded prompts for dispute assessment, litigation strategy, settlement
   - Sidecar: No
   - Prompts: 3 (dispute-assessment, litigation-strategy, settlement-negotiation)
   - Workflows: dispute-strategy

7. **Tribute** - Tax Counsel
   - File: agents/tribute.yaml
   - Features: Embedded prompts for tax planning, cross-border tax, compliance
   - Sidecar: No
   - Prompts: 3 (tax-planning, cross-border-tax, tax-compliance)
   - Workflows: tax-planning

### Workflow Placeholders Created (Phase 1)

1. workflows/legal-matter-intake/README.md
2. workflows/contract-review/README.md
3. workflows/contract-drafting/README.md
4. workflows/corporate-formation/README.md
5. workflows/dispute-strategy/README.md
6. workflows/tax-planning/README.md

---

## Workflow Plans Reviewed

All Phase 1 workflow README files reviewed and verified:

| Workflow | Location | Status | Implementation |
|----------|----------|--------|----------------|
| Legal Matter Intake | workflows/legal-matter-intake/ | Ready | Use create-workflow |
| Contract Review | workflows/contract-review/ | Ready | Use create-workflow |
| Contract Drafting | workflows/contract-drafting/ | Ready | Use create-workflow |
| Corporate Formation | workflows/corporate-formation/ | Ready | Use create-workflow |
| Dispute Strategy | workflows/dispute-strategy/ | Ready | Use create-workflow |
| Tax Planning | workflows/tax-planning/ | Ready | Use create-workflow |

**Workflow-Agent Mappings Verified:**
- Counsel → legal-matter-intake, cross-border-matter
- Liberty → corporate-formation
- Europa → cross-border-matter
- Castile → corporate-formation
- Covenant → contract-review, contract-drafting
- Advocate → dispute-strategy
- Tribute → tax-planning

**Implementation Note:** To create full workflow.md and step files, use `/bmad:bmb:workflows:create-workflow` for each workflow folder.

---

## Installer Configuration

### Install Configuration

- File: module.yaml
- Module code: legal-team
- Module name: Legal Team - Multi-Jurisdictional Legal Advisory
- Default selected: false
- Configuration fields: 3 interactive + 4 static

### Configuration Fields

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| output_folder | INTERACTIVE | _bmad-output/legal-team | Document output location |
| primary_jurisdiction | INTERACTIVE | es (Spain) | Default jurisdiction routing |
| detail_level | INTERACTIVE | standard | Output verbosity |
| disclaimer_mode | STATIC | enabled | Legal disclaimer inclusion |

### Custom Logic

- installer.js: Not needed
- Custom setup: None required

### Installation Process

1. User runs: `bmad install legal-team`
2. Installer asks:
   - Output folder location
   - Primary jurisdiction (ES/US/EU/EE)
   - Detail level preference
3. Creates: `_bmad/legal-team/`
4. Generates: `config.yaml` with user settings

### Validation

- YAML syntax valid
- All fields defined with proper defaults
- Paths use proper templates
- Legal disclaimer always enabled (non-negotiable)

---

---

## Documentation Created

### README.md Comprehensive Documentation

- **Location:** README.md
- **Status:** Complete
- **Content Includes:**
  - Module overview and key features
  - Installation instructions
  - Agent roster (13 total, 7 Phase 1)
  - Workflow catalog (14 total, 6 Phase 1)
  - Jurisdictional coverage (US, EU, Spain, Estonia)
  - Quick start guide with example session
  - Module structure reference
  - Configuration options
  - Development status tracker
  - Legal disclaimer
  - License and author info

### Documentation Validation

- [x] All Phase 1 agents documented
- [x] All Phase 1 workflows listed
- [x] Installation process clear
- [x] Quick start commands accurate
- [x] Legal disclaimer included
- [x] Development phases outlined

---

## Development Roadmap

### TODO.md Created

- **Location:** TODO.md
- **Status:** Complete
- **Phases Defined:** 3
- **Immediate Tasks:** Prioritized

### Next Steps Priority Order

1. **Legal Matter Intake** - Entry point workflow, implement first
2. **Contract Review** - High-demand workflow
3. **Corporate Formation** - High-demand for Spain/Estonia users
4. **Tax Planning** - Critical for cross-border users
5. **Contract Drafting** - Complements Contract Review
6. **Dispute Strategy** - Complete Phase 1

### Quick Reference Commands

- `/bmad:bmb:workflows:create-workflow` - Create workflow step files
- `/bmad:bmb:workflows:agent` - Create/edit agents
- `bmad install legal-team` - Test installation

### Development Notes

- Legal disclaimer always enabled (non-negotiable)
- Spain (ES) set as default primary jurisdiction
- Criminal law explicitly out of scope
- All agents must verify jurisdiction before guidance

---

## Validation Results

### Date Validated

2026-01-11

### Validation Checklist

**1. Module Structure Check**

```
legal-team/
├── agents/                    [✅]
├── workflows/                 [✅]
├── tasks/                     [✅]
├── templates/                 [✅]
├── data/                      [✅]
├── _module-installer/         [✅]
│   └── assets/               [✅]
├── module.yaml                [✅]
├── README.md                  [✅]
├── TODO.md                    [✅]
└── module-plan-legal-team.md  [✅]
```

**2. Configuration Files Check**

- [x] YAML syntax valid (module.yaml)
- [x] Module code matches folder name (legal-team)
- [x] All required fields present
- [x] Path templates use correct format
- [x] Configuration fields properly defined (3 interactive, 4 static)
- [x] stepsCompleted array complete (11 steps)

**3. Components Check**

Agents (7 Phase 1):
- [x] counsel.yaml - General Counsel (Director)
- [x] liberty.yaml - US Counsel
- [x] europa.yaml - EU Counsel
- [x] castile.yaml - Spain Corporate
- [x] covenant.yaml - Contract Specialist
- [x] advocate.yaml - Litigation Strategist
- [x] tribute.yaml - Tax Counsel

Workflows (6 Phase 1 folders):
- [x] legal-matter-intake/README.md
- [x] contract-review/README.md
- [x] contract-drafting/README.md
- [x] corporate-formation/README.md
- [x] dispute-strategy/README.md
- [x] tax-planning/README.md

**4. Documentation Check**

- [x] README.md complete with all sections
- [x] TODO.md with 3 development phases
- [x] Quick commands included
- [x] Legal disclaimer included
- [x] Installation instructions clear

**5. Integration Points Check**

- [x] Agent workflow references documented
- [x] Configuration fields accessible
- [x] Module paths consistent
- [x] No circular dependencies

### Issues Found and Resolved

None - all validation checks passed.

### Final Status

**✅ Ready for testing**

### Next Steps

1. Test installation in a clean project: `bmad install legal-team`
2. Implement Legal Matter Intake workflow first (entry point)
3. Continue with remaining Phase 1 workflows per TODO.md priority

---

*Module creation initiated: 2026-01-11*
*Module creation completed: 2026-01-11*
