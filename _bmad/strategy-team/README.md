# Executive Leadership & Decision-Making Module (strategy-team)

Transform AI into a trusted executive advisory council that provides strategic counsel on high-stakes decisions, navigates organizational politics, and offers diverse leadership perspectives from realpolitik pragmatism to principled idealism.

## Version

**v1.2.0** - Additional Workflows Release (2026-01-09)
- Added 3 new workflows: Political Risk Assessment, Ethical Dilemma Resolution, Leadership Philosophy
- Total: 12 executive workflows with 95+ step files
- New output templates for risk, ethics, and leadership documents
- Enhanced personal development capabilities

**v1.1.0** - Workflows Release (2026-01-09)
- Added 9 executive workflows with 73 step files
- Created shared agent roster and output templates
- Full step-file architecture for disciplined execution
- Added 13 Party Mode presets for common executive scenarios

## Agents (14 Total)

### Modern Professional Advisors (6)

| Command | Agent | Name | Specialty |
|---------|-------|------|-----------|
| `/strategy-team:policy-analyst` | policy-analyst | Augustus | Evidence-Based Policy Expert |
| `/strategy-team:political-strategist` | political-strategist | Magnus | Campaign & Political Strategy |
| `/strategy-team:debate-coach` | debate-coach | Cicero | Argumentation & Rhetoric Master |
| `/strategy-team:stakeholder-mediator` | stakeholder-mediator | Geneva | Negotiation & Consensus Builder |
| `/strategy-team:ethics-advisor` | ethics-advisor | Sophia | Political Ethics & Values Counsel |
| `/strategy-team:communications-director` | communications-director | Giuseppe | Public Messaging & Media Strategy |

### Historical Archetype Advisors (8)

These agents channel historical figures to provide distinct ideological perspectives. They include documented **inherent biases** for self-awareness.

| Command | Agent | Name | Archetype |
|---------|-------|------|-----------|
| `/strategy-team:the-realist` | the-realist | Niccolo | Master of Realpolitik (Machiavelli/Bismarck) |
| `/strategy-team:the-liberator` | the-liberator | Charles | Moral Transformer (Lincoln/de Gaulle) |
| `/strategy-team:the-revolutionary` | the-revolutionary | Maximilien | Agent of Change (Robespierre) |
| `/strategy-team:the-conservative` | the-conservative | Burke | Guardian of Tradition (Burke/Metternich) |
| `/strategy-team:the-technocrat` | the-technocrat | Lee | Builder of Systems (Lee Kuan Yew/Deng) |
| `/strategy-team:the-strategist-warrior` | the-strategist-warrior | Musashi | Master of Timing (Miyamoto Musashi) |
| `/strategy-team:the-master-strategist` | the-master-strategist | Sun | Supreme Strategist (Sun Tzu) |
| `/strategy-team:the-principled-commander` | the-principled-commander | Jean-Luc | Diplomat Captain (Jean-Luc Picard) |

## Quick Start

Invoke any agent using their slash command:

```
/strategy-team:policy-analyst      # Augustus - Evidence-based policy analysis
/strategy-team:the-realist         # Niccolo - Realpolitik perspective
/strategy-team:the-master-strategist # Sun - Strategic wisdom
/strategy-team:the-principled-commander # Jean-Luc - Principled leadership
```

## Party Mode & Presets

For multi-advisor debates on complex decisions, use Party Mode with pre-configured presets:

```
/party-mode
```

### Available Presets (13)

| Preset ID | Agents | Use Case |
|-----------|--------|----------|
| `strategic-council` | All 8 Archetypes | Major strategic decisions |
| `ethics-review` | Sophia, Jean-Luc, Charles | Moral dimensions |
| `power-analysis` | Magnus, Niccolo, Sun | Political landscape |
| `comms-strategy` | Giuseppe, Cicero, Geneva | Messaging, announcements |
| `risk-assessment` | Burke, Lee, Augustus | Risk identification |
| `change-management` | Charles, Burke, Lee | Transformation balance |
| `negotiation-prep` | Geneva, Magnus, Cicero | Negotiation readiness |
| `crisis-response` | Giuseppe, Magnus, Jean-Luc, Musashi | Crisis situations |
| `board-prep` | Augustus, Giuseppe, Cicero | Board presentations |
| `strategic-planning` | Sun, Lee, Burke, Maximilien | Long-term strategy |
| `conflict-resolution` | Geneva, Jean-Luc, Charles, Sophia | Internal conflicts |
| `all-out-war` | Niccolo, Sun, Musashi, Magnus, Giuseppe | Competitive warfare |
| `corporate-politics` | Magnus, Niccolo, Cicero, Geneva, Giuseppe | Internal politics |

### Invoke a Preset

During any workflow or Party Mode session:
```
"Use the strategic-council preset"
"Let's run the ethics-review preset for this decision"
"Invoke power-analysis for stakeholder mapping"
```

Full preset documentation: `_bmad/strategy-team/workflows/_shared/party-mode-presets.md`

## Use Cases

### Strategic Decision-Making
- Major organizational pivots
- M&A analysis and integration
- Market entry strategies
- Competitive positioning

### Political Navigation
- Stakeholder management
- Coalition building
- Internal politics
- Board relations

### Crisis Management
- Communications strategy
- Narrative control
- Rapid response
- Damage limitation

### Argumentation & Persuasion
- Debate preparation
- Pitch refinement
- Counter-argument anticipation
- Rhetorical strengthening

## Workflows (12 Total)

Execute guided multi-step processes that orchestrate multiple agents for comprehensive executive deliverables.

### Core Workflows (9)

| Command | Workflow | Steps | Output |
|---------|----------|-------|--------|
| `/strategic-decision-workshop` | Strategic Decision Workshop | 9 | Decision Brief |
| `/stakeholder-negotiation-prep` | Stakeholder Negotiation Prep | 8 | Negotiation Playbook |
| `/board-presentation-prep` | Board Presentation Prep | 7 | Presentation Outline |
| `/crisis-response-planning` | Crisis Response Planning | 7 | Crisis Response Plan |
| `/strategic-planning-session` | Strategic Planning Session | 8 | Strategic Plan |
| `/policy-development` | Policy Development | 8 | Policy Document |
| `/conflict-resolution` | Conflict Resolution | 7 | Resolution Plan |
| `/competitive-warfare` | Competitive Warfare | 8 | Warfare Plan |
| `/corporate-political-game` | Corporate Political Game | 8 | Political Playbook |

### v1.2 Workflows (3) - NEW

| Command | Workflow | Steps | Output |
|---------|----------|-------|--------|
| `/political-risk-assessment` | Political Risk Assessment | 6 | Risk Assessment |
| `/ethical-dilemma-resolution` | Ethical Dilemma Resolution | 7 | Ethical Resolution |
| `/leadership-philosophy` | Leadership Philosophy Development | 6 | Leadership Philosophy |

### Workflow Quick Start

```
# Core Workflows
/strategic-decision-workshop     # Multi-perspective decision analysis
/stakeholder-negotiation-prep    # Prepare for high-stakes negotiations
/board-presentation-prep         # Craft compelling board presentations
/crisis-response-planning        # Develop crisis communication strategy
/strategic-planning-session      # Long-term strategic planning
/policy-development              # Evidence-based policy creation
/conflict-resolution             # Navigate workplace conflicts
/competitive-warfare             # Plan competitive business battles
/corporate-political-game        # Navigate internal corporate politics

# v1.2 Workflows (NEW)
/political-risk-assessment       # Evaluate political risks in initiatives
/ethical-dilemma-resolution      # Navigate complex ethical dilemmas
/leadership-philosophy           # Develop personal leadership philosophy
```

### Workflow Architecture

All workflows use **step-file architecture** for disciplined execution:
- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only current step in memory
- **Sequential Enforcement**: Complete steps in order
- **State Tracking**: Progress tracked in frontmatter
- **Append-Only Building**: Build outputs progressively

## Module Structure

```
_bmad/strategy-team/
├── agents/                 # 14 agent definition files
│   ├── policy-analyst.md
│   ├── political-strategist.md
│   ├── debate-coach.md
│   ├── stakeholder-mediator.md
│   ├── ethics-advisor.md
│   ├── communications-director.md
│   ├── the-realist.md
│   ├── the-liberator.md
│   ├── the-revolutionary.md
│   ├── the-conservative.md
│   ├── the-technocrat.md
│   ├── the-strategist-warrior.md
│   ├── the-master-strategist.md
│   └── the-principled-commander.md
├── workflows/              # 12 executive workflows
│   ├── _shared/
│   │   ├── agent-roster.md
│   │   ├── party-mode-presets.md  # 13 preset configurations
│   │   └── templates/      # 12 output templates
│   ├── board-presentation-prep/
│   │   ├── workflow.md
│   │   └── steps/          # 7 step files
│   ├── competitive-warfare/
│   │   ├── workflow.md
│   │   └── steps/          # 9 step files
│   ├── conflict-resolution/
│   │   ├── workflow.md
│   │   └── steps/          # 8 step files
│   ├── corporate-political-game/
│   │   ├── workflow.md
│   │   └── steps/          # 9 step files
│   ├── crisis-response-planning/
│   │   ├── workflow.md
│   │   └── steps/          # 7 step files
│   ├── ethical-dilemma-resolution/
│   │   ├── workflow.md
│   │   └── steps/          # 8 step files
│   ├── leadership-philosophy/
│   │   ├── workflow.md
│   │   └── steps/          # 7 step files
│   ├── policy-development/
│   │   ├── workflow.md
│   │   └── steps/          # 8 step files
│   ├── political-risk-assessment/
│   │   ├── workflow.md
│   │   └── steps/          # 7 step files
│   ├── stakeholder-negotiation-prep/
│   │   ├── workflow.md
│   │   └── steps/          # 8 step files
│   ├── strategic-decision-workshop/
│   │   ├── workflow.md
│   │   └── steps/          # 9 step files
│   └── strategic-planning-session/
│       ├── workflow.md
│       └── steps/          # 8 step files
├── config.yaml             # Module configuration
└── README.md               # This file
```

## Configuration

The module uses `_bmad/strategy-team/config.yaml` for configuration including:
- User preferences (name, language)
- Output folder locations
- Agent registry

## Roadmap

### v1.3 (Planned)
- M&A due diligence workflow
- Leadership transition planning
- Board relations management workflow
- Performance review preparation workflow
- Workflow chaining (one workflow leading into another)
- Continue/Resume enhancements for all workflows

## Credits

Created using the BMAD Framework Module Creator workflow.

**Author:** J
**Created:** 2026-01-09
**Framework:** BMAD + Claude Opus
