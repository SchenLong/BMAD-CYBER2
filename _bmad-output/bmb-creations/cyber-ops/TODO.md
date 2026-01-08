# Cybersecurity Operations (Cyber-Ops) Development Roadmap

## Current Status Summary

- ✅ Module structure created
- ✅ Installer configured (module.yaml)
- ✅ 6 Agents migrated and validated
- ✅ 10 Workflow READMEs created (implementation blueprints)
- ✅ Comprehensive documentation complete (README.md)

**Foundation Phase Complete** - Ready for workflow implementation.

---

## Phase 1: Core Workflows (MVP)

### High Priority Workflows (Core Operations)

**Priority: Implement these 5 workflows first for minimum viable module**

- [ ] **Security Architecture Review**
  - Use: `/bmad:bmb:workflows:create-workflow`
  - Reference: `workflows/security-architecture-review/README.md`
  - Lead Agent: Bastion (security-architect)
  - Output: Security assessment reports in `{output_folder}/planning/architecture/`
  - Integration: Update Bastion menu item AR from `exec="todo"` to `exec="workflow.md"`
  - Priority: **CRITICAL** - Primary use case

- [ ] **Incident Response Playbook**
  - Use: `/bmad:bmb:workflows:create-workflow`
  - Reference: `workflows/incident-response-playbook/README.md`
  - Lead Agent: Phoenix (incident-commander)
  - Multi-agent: Coordinates with Trace (forensics) and Cipher (threat intel)
  - Output: Incident response plans in `{output_folder}/operations/incidents/`
  - Integration: Update Phoenix menu item IRP from `exec="todo"` to `exec="workflow.md"`
  - Priority: **CRITICAL** - Emergency response capability

- [ ] **Threat Assessment**
  - Use: `/bmad:bmb:workflows:create-workflow`
  - Reference: `workflows/threat-assessment/README.md`
  - Lead Agent: Cipher (threat-analyst)
  - Output: Threat intelligence briefings in `{output_folder}/planning/threat-intelligence/`
  - Integration: Update Cipher menu item TA from `exec="todo"` to `exec="workflow.md"`
  - Priority: **HIGH** - Intelligence foundation

- [ ] **Penetration Test Planning**
  - Use: `/bmad:bmb:workflows:create-workflow`
  - Reference: `workflows/pentest-planning/README.md`
  - Lead Agent: Ghost (penetration-tester)
  - Output: Pentest plans and scopes in `{output_folder}/planning/pentests/`
  - Integration: Update Ghost menu item PTP from `exec="todo"` to `exec="workflow.md"`
  - Priority: **HIGH** - Offensive security core

- [ ] **Compliance Audit Preparation**
  - Use: `/bmad:bmb:workflows:create-workflow`
  - Reference: `workflows/compliance-audit-prep/README.md`
  - Lead Agent: Sentinel (compliance-guardian)
  - Output: Compliance reports in `{output_folder}/planning/compliance/`
  - Integration: Update Sentinel menu item CAP from `exec="todo"` to `exec="workflow.md"`
  - Priority: **HIGH** - Regulatory requirement

### Phase 1 Integration Tasks

- [ ] Test all 5 core workflows end-to-end
- [ ] Validate agent-workflow integration (menu invocations work)
- [ ] Verify configuration fields resolve correctly in workflows
- [ ] Test multi-agent coordination (Phoenix→Trace→Cipher)
- [ ] Validate output artifact creation in correct folders

---

## Phase 2: Specialized Workflows

### Medium Priority Workflows

**Priority: Implement after Phase 1 is stable**

- [ ] **Forensic Investigation**
  - Use: `/bmad:bmb:workflows:create-workflow`
  - Reference: `workflows/forensic-investigation/README.md`
  - Lead Agent: Trace (forensic-investigator)
  - Output: Forensic reports in `{output_folder}/operations/forensics/`
  - Integration: Update Trace menu item FI from `exec="todo"` to `exec="workflow.md"`
  - Priority: **MEDIUM** - Specialized investigation capability

- [ ] **Risk Analysis**
  - Use: `/bmad:bmb:workflows:create-workflow`
  - Reference: `workflows/risk-analysis/README.md`
  - Lead Agent: Sentinel (compliance-guardian)
  - Multi-agent: Coordinates with Cipher (threats) and Bastion (controls)
  - Output: Risk assessments in `{output_folder}/planning/risk-assessments/`
  - Integration: Update Sentinel menu item RA from `exec="todo"` to `exec="workflow.md"`
  - Priority: **MEDIUM** - Risk management capability

### Phase 2 Integration Tasks

- [ ] Test forensic evidence chain integrity
- [ ] Validate risk quantification calculations
- [ ] Test multi-agent risk analysis coordination

---

## Phase 3: Party Mode Workflows

### Optional Multi-Agent Collaboration Workflows

**Priority: Implement for advanced multi-agent scenarios**

**Note:** These workflows are invoked via Party Mode (`/bmad:core:workflows:party-mode`), not agent menu items.

- [ ] **Security Requirements Definition**
  - Reference: `workflows/security-requirements/README.md`
  - Agents: Bastion + Sentinel (collaborative requirements gathering)
  - Output: Security requirements docs in `{output_folder}/planning/security-requirements/`
  - Priority: **LOW** - Advanced collaboration scenario

- [ ] **Post-Incident Review**
  - Reference: `workflows/post-incident-review/README.md`
  - Agents: Phoenix + Trace + Cipher (retrospective analysis)
  - Output: Post-mortem reports in `{output_folder}/operations/incidents/post-mortems/`
  - Priority: **LOW** - Continuous improvement workflow

- [ ] **Zero Trust Architecture Design**
  - Reference: `workflows/zero-trust-design/README.md`
  - Agents: Bastion + Ghost (design-challenge-refine cycle)
  - Output: Zero-trust architecture docs in `{output_folder}/planning/architecture/zero-trust/`
  - Priority: **LOW** - Specialized architecture workflow

### Phase 3 Integration Tasks

- [ ] Test Party Mode agent selection and coordination
- [ ] Validate multi-agent conversation flow
- [ ] Test workflow invocation from Party Mode context

---

## Phase 4: Polish and Launch

### Testing

- [ ] **Unit Testing**
  - Test each workflow independently with sample inputs
  - Verify all menu options function correctly
  - Test error handling for invalid inputs

- [ ] **Integration Testing**
  - Test agent→workflow invocation chain
  - Test multi-agent coordination workflows
  - Verify configuration field resolution
  - Test artifact creation in all output folders

- [ ] **Installation Testing**
  - Test installer in clean BMAD project
  - Verify configuration prompts work correctly
  - Test config.yaml generation
  - Validate agent activation after installation

- [ ] **Real-World Testing**
  - Conduct actual security architecture review
  - Run simulated incident response exercise
  - Execute compliance audit preparation
  - Perform penetration test planning

### Documentation Enhancements

- [ ] **Workflow Documentation**
  - Add detailed workflow execution examples to README
  - Document expected inputs and outputs for each workflow
  - Add troubleshooting section for common issues

- [ ] **Agent Reference**
  - Create quick reference card for agent capabilities
  - Document menu command reference
  - Add Party Mode usage examples

- [ ] **Advanced Guides**
  - Create video walkthrough for primary workflows
  - Write integration guide for BMM module coordination
  - Add FAQ section based on testing feedback

### Release Preparation

- [ ] **Version Management**
  - Verify module.yaml version is 1.0.0
  - Update README.md "Last Updated" date
  - Create CHANGELOG.md documenting all features

- [ ] **Release Artifacts**
  - Create release notes highlighting key features
  - Prepare announcement with agent and workflow highlights
  - Tag release in Git (if applicable)

- [ ] **Publication**
  - Submit to BMAD module registry (if applicable)
  - Share with BMAD community
  - Gather initial user feedback

---

## Quick Commands

### Create New Workflow

```bash
/bmad:bmb:workflows:create-workflow
```

**Workflow Creation Process:**
1. Select workflow README from `workflows/[workflow-name]/README.md`
2. Follow create-workflow prompts to convert README to executable workflow.md
3. Test workflow execution
4. Update agent menu item to reference new workflow

### Update Agent Menu

**Example: After creating security-architecture-review workflow**

Edit `agents/security-architect.md`:

```xml
<!-- Before -->
<item cmd="AR or fuzzy match on architecture-review" exec="todo">[AR] Conduct security architecture review</item>

<!-- After -->
<item cmd="AR or fuzzy match on architecture-review" exec="{project-root}/_bmad/cyber-ops/workflows/security-architecture-review/workflow.md">[AR] Conduct security architecture review</item>
```

### Test Module Installation

```bash
# Install from local path
bmad install /Users/paultinp/BMAD-CYBER2/_bmad-output/bmb-creations/cyber-ops

# Or after publishing to registry
bmad install cyber-ops
```

### Run Agent

```bash
# Security Architect
/bmad:cyber-ops:agents:security-architect

# Threat Analyst
/bmad:cyber-ops:agents:threat-analyst

# Penetration Tester
/bmad:cyber-ops:agents:penetration-tester

# Incident Commander
/bmad:cyber-ops:agents:incident-commander

# Compliance Guardian
/bmad:cyber-ops:agents:compliance-guardian

# Forensic Investigator
/bmad:cyber-ops:agents:forensic-investigator
```

### Run Workflow (via Agent Menu)

```bash
# After loading agent
AR    # Security Architecture Review (Bastion)
IRP   # Incident Response Playbook (Phoenix)
TA    # Threat Assessment (Cipher)
PTP   # Penetration Test Planning (Ghost)
CAP   # Compliance Audit Preparation (Sentinel)
```

### Party Mode (Multi-Agent Workflows)

```bash
/bmad:core:workflows:party-mode

# Select agents for collaboration:
# - security-architect + compliance-guardian = Security Requirements Definition
# - incident-commander + forensic-investigator + threat-analyst = Post-Incident Review
# - security-architect + penetration-tester = Zero Trust Architecture Design
```

---

## Development Notes

### Important Implementation Considerations

**Agent Coordination:**
- Incident Response Playbook automatically coordinates Phoenix → Trace → Cipher
- Risk Analysis coordinates Sentinel → Cipher → Bastion
- Test multi-agent handoffs thoroughly

**Output Artifact Organization:**
- Planning artifacts: Architecture reviews, threat models, compliance reports
- Operational artifacts: Incident reports, forensic findings, pentest results
- Documentation: Security guidelines, policies, standards

**Configuration Field Usage:**
- `{output_folder}` - Base directory for all security artifacts
- `{planning_artifacts}` - `{output_folder}/planning` - Design-phase outputs
- `{operational_artifacts}` - `{output_folder}/operations` - Runtime outputs
- `{documentation}` - `{output_folder}/docs` - Security documentation

**Workflow README to workflow.md Conversion:**
- README files are implementation blueprints (human-readable planning)
- workflow.md files are executable workflows (agent-invocable)
- Use `/bmad:bmb:workflows:create-workflow` to convert README → workflow.md
- Test each workflow after creation before updating agent menu

### Dependencies

**Required:**
- BMAD Method version 6.0.0 or higher

**Optional Integrations:**
- AgentVibes module - Enhanced TTS experience
- BMM Module - Development workflow integration for security-by-design
- Core Party Mode - Multi-agent collaboration workflows

**No External Dependencies:**
- Module is self-contained
- No third-party tools or APIs required
- Agents provide guidance, users implement with their own tools

### Module Structure Reference

```
cyber-ops/
├── agents/                       # ✅ Complete (6 agents migrated)
│   ├── security-architect.md     # Bastion
│   ├── threat-analyst.md         # Cipher
│   ├── penetration-tester.md     # Ghost
│   ├── incident-commander.md     # Phoenix
│   ├── compliance-guardian.md    # Sentinel
│   └── forensic-investigator.md  # Trace
├── workflows/                    # ⏳ README blueprints created, workflow.md pending
│   ├── security-architecture-review/    # ⏳ Phase 1
│   ├── incident-response-playbook/      # ⏳ Phase 1
│   ├── threat-assessment/               # ⏳ Phase 1
│   ├── pentest-planning/                # ⏳ Phase 1
│   ├── compliance-audit-prep/           # ⏳ Phase 1
│   ├── forensic-investigation/          # ⏳ Phase 2
│   ├── risk-analysis/                   # ⏳ Phase 2
│   ├── security-requirements/           # ⏳ Phase 3 (Party Mode)
│   ├── post-incident-review/            # ⏳ Phase 3 (Party Mode)
│   └── zero-trust-design/               # ⏳ Phase 3 (Party Mode)
├── tasks/                        # ✅ Created (workflow-specific, Phase 2+)
├── templates/                    # ✅ Created (security doc templates, Phase 4)
├── data/                         # ✅ Created (frameworks/checklists, Phase 4)
├── _module-installer/            # ✅ Complete
│   └── module.yaml              # ✅ Installation config
├── README.md                     # ✅ Complete (comprehensive documentation)
└── module-plan-cyber-ops.md     # ✅ Complete (planning artifact)
```

---

## Completion Criteria

**Phase 1 Complete When:**
- [ ] All 5 core workflows implemented and tested
- [ ] Agent menu items updated with workflow paths
- [ ] Integration testing passes (agent→workflow→output)
- [ ] Sample usage produces expected artifacts

**Phase 2 Complete When:**
- [ ] 2 specialized workflows implemented (Forensic + Risk)
- [ ] Multi-agent coordination validated
- [ ] All 7 workflows stable and documented

**Phase 3 Complete When:**
- [ ] 3 Party Mode workflows operational
- [ ] Multi-agent collaboration tested
- [ ] Advanced scenarios documented

**Module 1.0 Launch Ready When:**
- [ ] All Phase 1-3 workflows complete
- [ ] Full integration testing passed
- [ ] Documentation comprehensive
- [ ] Installation tested in clean project
- [ ] Real-world validation completed

---

## Immediate Next Steps (Start Here)

**Recommended Implementation Order:**

1. **Security Architecture Review** (Bastion)
   - Most fundamental workflow
   - Tests core agent capability
   - Foundation for other workflows

2. **Incident Response Playbook** (Phoenix)
   - Tests multi-agent coordination
   - Critical operational capability
   - Real-world validation opportunity

3. **Threat Assessment** (Cipher)
   - Provides intelligence context for other workflows
   - Tests artifact generation
   - Demonstrates MITRE ATT&CK integration

**Start with:** `/bmad:bmb:workflows:create-workflow` → Select `security-architecture-review`

---

**Created:** 2026-01-08
**Last Updated:** 2026-01-08
**Module Version:** 1.0.0-dev
