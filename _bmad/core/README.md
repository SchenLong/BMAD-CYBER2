# BMAD Core Infrastructure Module

The Core Infrastructure module provides essential orchestration and project management capabilities for the BMAD ecosystem. This module is **required** and automatically installed with all BMAD projects.

## Version

**v6.0.0** - Team Orchestration Release (2026-01-11)
- Abdul: Project Manager agent for cross-module orchestration
- BMAD Master: System orchestrator for workflow execution
- Party Mode: Multi-agent collaboration with 27 presets
- Team Orchestration: Cross-module workflow patterns
- Expertise mapping for intelligent task routing
- Phase gates for controlled workflow progression

## Agents (2 Total)

| Command | Agent | Name | Role |
|---------|-------|------|------|
| `/core:project-manager` | project-manager | Abdul | Cross-module project coordination |
| `/core:bmad-master` | bmad-master | BMAD Master | System orchestration and workflow execution |

### Abdul (Project Manager)

Abdul is the central coordinator for multi-module projects. Key capabilities:

- **Project Creation**: Initialize and configure new projects
- **Task Assignment**: Route tasks to appropriate module agents
- **Cross-Module Consultation**: Leverage expertise from any installed module
- **What's Next**: Intelligent routing to the next best action
- **Status Tracking**: Monitor project and sprint progress

### BMAD Master

The system orchestrator that manages workflow execution and agent coordination.

## Workflows (5 Total)

| Workflow | Description |
|----------|-------------|
| Party Mode | Multi-agent collaboration for complex scenarios |
| Project Manager | Task assignment and project status tracking |
| Team Orchestration | Cross-module workflow patterns |
| Brainstorming | Creative ideation sessions |
| Index Docs | Document indexing and organization |

## Party Mode Presets (27 Total)

Pre-configured agent combinations for common scenarios across all modules:

### Security Presets
- `incident-war-room` - Phoenix + Trace + Cipher + Watchman
- `security-review-team` - Bastion + Architect + Threat Analyst
- `compliance-audit-team` - Sentinel + Europa + Murat

### Intelligence Presets
- `full-spectrum-intel` - All 11 intel agents
- `osint-focus` - Resolver + Echo + Shadow + Atlas

### Strategic Presets
- `strategic-council` - All 8 archetype advisors
- `ethics-review` - Sophia + Jean-Luc + Charles
- `crisis-response-party` - Giuseppe + Magnus + Jean-Luc + Musashi

### Cross-Module Presets
- `strategic-intelligence-council` - Strategy + Intel + Legal
- `secure-software-team` - BMM + Cybersec + Legal
- `ma-due-diligence-team` - Strategy + Intel + Legal + Cybersec
- `executive-security-council` - Strategy + Cybersec + Legal

See `workflows/party-mode/presets/` for complete preset definitions.

## Team Orchestration

The Team Orchestration system enables structured multi-module collaboration:

### Orchestration Patterns
- **Secure Software Development**: BMM + Cybersec + Legal coordination
- **Incident Response**: Cybersec + Intel + Strategy + Legal coordination
- **Strategic Decisions**: Strategy + Intel + Legal coordination

### Features
- **Phase Gates**: Controlled progression between workflow phases
- **Expertise Mapping**: Automatic routing based on module capabilities
- **Artifact Handoffs**: Structured data exchange between modules

## Module Structure

```
_bmad/core/
├── agents/
│   ├── project-manager.md      # Abdul
│   └── bmad-master.md          # BMAD Master
├── workflows/
│   ├── party-mode/
│   │   ├── workflow.md
│   │   └── presets/            # 27 preset configurations
│   │       ├── strategy-team-presets.yaml
│   │       ├── intel-team-presets.yaml
│   │       ├── cybersec-team-presets.yaml
│   │       └── cross-module-groups.yaml
│   ├── project-manager/
│   │   ├── workflow.yaml
│   │   └── instructions.md
│   ├── team-orchestration/
│   │   └── data/
│   │       └── module-expertise-map.yaml
│   ├── brainstorming/
│   │   └── workflow.md
│   └── index-docs/
│       └── workflow.md
├── schemas/                    # Cross-module data schemas
│   ├── threat-model.schema.yaml
│   ├── iocs.schema.yaml
│   └── compliance-requirements.schema.yaml
├── resources/                  # Shared resources
├── tasks/                      # Task definitions
├── module.yaml                 # Installation template
└── config.yaml                 # Runtime configuration
```

## Configuration

Core configuration is stored in `config.yaml` and includes:
- User preferences (name, language)
- Module paths
- Party mode preset locations
- Orchestration data paths

## Integration

The Core module automatically integrates with all installed modules:
- Reads agent definitions from each module's `agents/` folder
- Discovers workflows from each module's `workflows/` folder
- Uses module.yaml for installation configuration
- Routes tasks based on expertise mapping

## Credits

**Author:** BMAD Team
**Framework:** BMAD Method v6.0
