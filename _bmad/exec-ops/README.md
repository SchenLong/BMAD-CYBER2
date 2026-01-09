# Executive Leadership & Decision-Making Module (exec-ops)

Transform AI into a trusted executive advisory council that provides strategic counsel on high-stakes decisions, navigates organizational politics, and offers diverse leadership perspectives from realpolitik pragmatism to principled idealism.

## Version

**v1.0.0** - Initial Release (2026-01-09)

## Agents (14 Total)

### Modern Professional Advisors (6)

| Command | Agent | Name | Specialty |
|---------|-------|------|-----------|
| `/exec-ops:policy-analyst` | policy-analyst | Augustus | Evidence-Based Policy Expert |
| `/exec-ops:political-strategist` | political-strategist | Magnus | Campaign & Political Strategy |
| `/exec-ops:debate-coach` | debate-coach | Cicero | Argumentation & Rhetoric Master |
| `/exec-ops:stakeholder-mediator` | stakeholder-mediator | Geneva | Negotiation & Consensus Builder |
| `/exec-ops:ethics-advisor` | ethics-advisor | Sophia | Political Ethics & Values Counsel |
| `/exec-ops:communications-director` | communications-director | Joseph | Public Messaging & Media Strategy |

### Historical Archetype Advisors (8)

These agents channel historical figures to provide distinct ideological perspectives. They include documented **inherent biases** for self-awareness.

| Command | Agent | Name | Archetype |
|---------|-------|------|-----------|
| `/exec-ops:the-realist` | the-realist | Niccolo | Master of Realpolitik (Machiavelli/Bismarck) |
| `/exec-ops:the-liberator` | the-liberator | Charles | Moral Transformer (Lincoln/de Gaulle) |
| `/exec-ops:the-revolutionary` | the-revolutionary | Maximilien | Agent of Change (Robespierre) |
| `/exec-ops:the-conservative` | the-conservative | Burke | Guardian of Tradition (Burke/Metternich) |
| `/exec-ops:the-technocrat` | the-technocrat | Lee | Builder of Systems (Lee Kuan Yew/Deng) |
| `/exec-ops:the-strategist-warrior` | the-strategist-warrior | Musashi | Master of Timing (Miyamoto Musashi) |
| `/exec-ops:the-master-strategist` | the-master-strategist | Sun | Supreme Strategist (Sun Tzu) |
| `/exec-ops:the-principled-commander` | the-principled-commander | Jean-Luc | Diplomat Captain (Jean-Luc Picard) |

## Quick Start

Invoke any agent using their slash command:

```
/exec-ops:policy-analyst      # Augustus - Evidence-based policy analysis
/exec-ops:the-realist         # Niccolo - Realpolitik perspective
/exec-ops:the-master-strategist # Sun - Strategic wisdom
/exec-ops:the-principled-commander # Jean-Luc - Principled leadership
```

## Party Mode

For multi-advisor debates on complex decisions, use Party Mode to assemble your executive council:

```
/party-mode
```

Suggested advisory panels:
- **Strategic Council**: Sun + Niccolo + Magnus (grand strategy)
- **Ethics Board**: Sophia + Charles + Jean-Luc (moral guidance)
- **Crisis Team**: Joseph + Phoenix + Geneva (crisis management)
- **Debate Prep**: Cicero + Maximilien + Burke (argument testing)

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

## Module Structure

```
_bmad/exec-ops/
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
├── config.yaml             # Module configuration
└── README.md               # This file
```

## Configuration

The module uses `_bmad/exec-ops/config.yaml` for configuration including:
- User preferences (name, language)
- Output folder locations
- Agent registry

## Roadmap

### v1.1 (Planned)
- Guided workflows for strategic planning
- Stakeholder analysis workflow
- Decision documentation templates
- Cross-agent orchestration

## Credits

Created using the BMAD Framework Module Creator workflow.

**Author:** J
**Created:** 2026-01-09
**Framework:** BMAD + Claude Opus
