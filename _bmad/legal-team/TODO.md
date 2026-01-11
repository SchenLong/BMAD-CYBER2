# Legal Team Development Roadmap

## Phase 1: Core Components (MVP)

### Workflows - Implementation Required

All Phase 1 workflow folders have README.md plans. Use `/bmad:bmb:workflows:create-workflow` to implement each:

- [ ] **Legal Matter Intake** - Primary entry workflow
  - Use: `/bmad:bmb:workflows:create-workflow`
  - Location: `workflows/legal-matter-intake/`
  - Priority: Critical (entry point for module)

- [ ] **Contract Review** - Risk analysis workflow
  - Use: `/bmad:bmb:workflows:create-workflow`
  - Location: `workflows/contract-review/`
  - Priority: High

- [ ] **Contract Drafting** - Document generation workflow
  - Use: `/bmad:bmb:workflows:create-workflow`
  - Location: `workflows/contract-drafting/`
  - Priority: High

- [ ] **Corporate Formation** - Entity setup workflow
  - Use: `/bmad:bmb:workflows:create-workflow`
  - Location: `workflows/corporate-formation/`
  - Priority: High

- [ ] **Dispute Strategy** - Litigation planning workflow
  - Use: `/bmad:bmb:workflows:create-workflow`
  - Location: `workflows/dispute-strategy/`
  - Priority: High

- [ ] **Tax Planning** - Cross-jurisdiction tax workflow
  - Use: `/bmad:bmb:workflows:create-workflow`
  - Location: `workflows/tax-planning/`
  - Priority: High

### Agents - Refinement (Optional)

Phase 1 agents are created. Review and enhance as needed:

- [x] Counsel (Director) - `agents/counsel.yaml`
- [x] Liberty (US Counsel) - `agents/liberty.yaml`
- [x] Europa (EU Counsel) - `agents/europa.yaml`
- [x] Castile (Spain Corporate) - `agents/castile.yaml`
- [x] Covenant (Contracts) - `agents/covenant.yaml`
- [x] Advocate (Litigation) - `agents/advocate.yaml`
- [x] Tribute (Tax) - `agents/tribute.yaml`

### Integration Tasks

- [ ] Test agent-workflow integration
- [ ] Verify Counsel routing logic works with all specialists
- [ ] Test jurisdiction detection in matter intake
- [ ] Validate configuration fields work correctly

## Phase 2: Enhanced Features

### Additional Agents (6 remaining)

- [ ] **Iberia** - Spain Civil
  - Use: `/bmad:bmb:workflows:agent` (create mode)
  - Focus: Spanish civil code, family, property, inheritance
  - Priority: Medium

- [ ] **Gremio** - Spain Labor
  - Use: `/bmad:bmb:workflows:agent` (create mode)
  - Focus: Estatuto de los Trabajadores, convenios colectivos
  - Priority: Medium

- [ ] **Baltic** - Estonia Corporate
  - Use: `/bmad:bmb:workflows:agent` (create mode)
  - Focus: e-Residency, OU formation, digital corporate
  - Priority: Medium

- [ ] **Charter** - Corporate Governance
  - Use: `/bmad:bmb:workflows:agent` (create mode)
  - Focus: Board matters, compliance, structure
  - Priority: Medium

- [ ] **Insignia** - IP Counsel
  - Use: `/bmad:bmb:workflows:agent` (create mode)
  - Focus: Trademarks, patents, licensing
  - Priority: Low

- [ ] **Deed** - Real Estate/Property
  - Use: `/bmad:bmb:workflows:agent` (create mode)
  - Focus: Property transactions, leases
  - Priority: Low

### Additional Workflows (8 remaining)

- [ ] Corporate Governance Audit
- [ ] Due Diligence
- [ ] Cross-Border Matter
- [ ] Employment Review
- [ ] IP Protection Strategy
- [ ] Real Estate Transaction
- [ ] Compliance Audit
- [ ] Legal Research

### Task Utilities (3 planned)

- [ ] **Jurisdiction Checker** - Quick determination of applicable law
- [ ] **Document Template Selector** - Match matter to templates
- [ ] **Deadline Calculator** - Statutes of limitations, filing deadlines

## Phase 3: Polish and Launch

### Testing

- [ ] Unit test all agents (persona, prompts, menus)
- [ ] Integration test workflows (step transitions)
- [ ] Test installer in clean project
- [ ] Test with sample legal scenarios
- [ ] Verify jurisdiction routing accuracy

### Documentation

- [ ] Add jurisdiction-specific legal references
- [ ] Create example sessions for each workflow
- [ ] Write troubleshooting guide
- [ ] Add FAQ section

### Data Population

- [ ] Populate `data/` with legal reference materials
- [ ] Add jurisdiction-specific templates to `templates/`
- [ ] Create statute of limitations reference data

### Release

- [ ] Version bump to 1.0.0
- [ ] Create release notes
- [ ] Tag release in Git
- [ ] Submit to module registry (if applicable)

---

## Quick Commands

### Create/Edit Agent

```
/bmad:bmb:workflows:agent
```

### Create Workflow

```
/bmad:bmb:workflows:create-workflow
```

### Test Module Installation

```bash
bmad install legal-team
```

### Run Agent

```
/legal-team:counsel
/legal-team:liberty
/legal-team:covenant
```

### Run Workflow

```
/legal-team:legal-matter-intake
/legal-team:contract-review
```

---

## Development Notes

### Important Considerations

- **Legal Disclaimer:** Always enabled - non-negotiable. Every output must include appropriate disclaimers.
- **Jurisdiction Awareness:** All agents must verify applicable jurisdiction before providing guidance.
- **Cross-Border Coordination:** Europa agent coordinates when matters span multiple jurisdictions.
- **Spain as Default:** Primary jurisdiction set to Spain (ES) in configuration.

### Scope Boundaries

**In Scope:**
- Corporate law (all jurisdictions)
- Contract law
- Civil matters
- Employment/Labor law
- Intellectual property
- Real estate transactions
- Tax (corporate and personal)

**Out of Scope (NEVER implement):**
- Criminal law
- Immigration law
- Regulatory filings (actual submissions)
- Formal legal representation

### Dependencies

- BMAD Method version 6.0.0+
- No external API dependencies (Phase 1)

---

## Module Structure Reference

```
legal-team/
├── agents/                    # [x] Created, Phase 1 implemented
│   ├── counsel.yaml           # [x] General Counsel (Director)
│   ├── liberty.yaml           # [x] US Counsel
│   ├── europa.yaml            # [x] EU Counsel
│   ├── castile.yaml           # [x] Spain Corporate
│   ├── covenant.yaml          # [x] Contract Specialist
│   ├── advocate.yaml          # [x] Litigation Strategist
│   └── tribute.yaml           # [x] Tax Counsel
├── workflows/                 # [x] Structure created, plans written
│   ├── legal-matter-intake/   # [ ] Implementation pending
│   ├── contract-review/       # [ ] Implementation pending
│   ├── contract-drafting/     # [ ] Implementation pending
│   ├── corporate-formation/   # [ ] Implementation pending
│   ├── dispute-strategy/      # [ ] Implementation pending
│   └── tax-planning/          # [ ] Implementation pending
├── tasks/                     # [x] Folder created
├── templates/                 # [x] Folder created
├── data/                      # [x] Folder created
├── _module-installer/         # [x] Configured
│   └── assets/
├── module.yaml                # [x] Complete
├── README.md                  # [x] Complete
├── TODO.md                    # [x] This file
└── module-plan-legal-team.md  # [x] Complete
```

---

## Completion Criteria

The module is complete when:

- [ ] All Phase 1 workflows implemented (6 workflows)
- [ ] All Phase 1 agents tested (7 agents)
- [ ] Installation works smoothly
- [ ] Documentation covers all features
- [ ] Sample legal scenarios produce expected guidance
- [ ] Legal disclaimer appears on all outputs

---

## Immediate Next Steps

**Recommended order:**

1. **Legal Matter Intake** - This is the entry point; implement first
2. **Contract Review** - High-demand workflow
3. **Corporate Formation** - High-demand for Spain/Estonia e-Residency users
4. **Tax Planning** - Critical for cross-border users
5. **Contract Drafting** - Complements Contract Review
6. **Dispute Strategy** - Complete Phase 1

---

Created: 2026-01-11
Last Updated: 2026-01-11
