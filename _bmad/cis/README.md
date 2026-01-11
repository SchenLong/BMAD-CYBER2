# CIS - Creative Innovation Studio

Creative problem-solving and innovation facilitation module. Brainstorming, design thinking, and innovation methodology for teams and individuals.

## Version

**v1.0.0** - Initial Release (2026-01-11)
- 5 specialized creative agents
- 4 innovation workflows
- Diverse creative techniques and ideation methods
- Integration with Party Mode for collaborative sessions

## Agents (5 Total)

### Innovation & Creativity

| Command | Agent | Name | Role |
|---------|-------|------|------|
| `/cis:innovation-strategist` | innovation-strategist | Victor | Innovation Strategist - Strategic Innovation |
| `/cis:creative-problem-solver` | creative-problem-solver | Dr. Quinn | Creative Problem Solver - Lateral Thinking |
| `/cis:design-thinking-coach` | design-thinking-coach | Maya | Design Thinking Coach - Human-Centered Design |

### Communication & Presentation

| Command | Agent | Name | Role |
|---------|-------|------|------|
| `/cis:storyteller` | storyteller | Marcus | Storyteller - Narrative Craft |
| `/cis:presentation-master` | presentation-master | Aria | Presentation Master - Visual Communication |

## Workflows (4 Total)

| Workflow | Description |
|----------|-------------|
| `brainstorming` | Facilitate interactive brainstorming sessions |
| `innovation-session` | Strategic innovation methodology |
| `design-thinking` | Human-centered design process |
| `presentation-prep` | Prepare compelling presentations |

## Creative Techniques

CIS agents employ diverse creative methodologies:

- **SCAMPER**: Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse
- **Six Thinking Hats**: Parallel thinking framework
- **Mind Mapping**: Visual idea organization
- **Design Thinking**: Empathize, Define, Ideate, Prototype, Test
- **Lateral Thinking**: Breaking conventional thought patterns
- **Storytelling Frameworks**: Hero's journey, narrative arcs

## Module Structure

```
_bmad/cis/
├── agents/                 # 5 agent definitions
│   ├── innovation-strategist.md      # Victor
│   ├── creative-problem-solver.md    # Dr. Quinn
│   ├── design-thinking-coach.md      # Maya
│   ├── storyteller.md                # Marcus
│   └── presentation-master.md        # Aria
├── workflows/              # 4 workflows
│   ├── brainstorming/
│   ├── innovation-session/
│   ├── design-thinking/
│   └── presentation-prep/
├── module.yaml             # Installation template
├── config.yaml             # Runtime configuration
└── README.md               # This file
```

## Quick Start

```bash
# Creative sessions
/cis:creative-problem-solver   # Lateral thinking with Dr. Quinn
/cis:design-thinking-coach     # Human-centered design with Maya

# Innovation
/cis:innovation-strategist     # Strategic innovation with Victor

# Communication
/cis:storyteller               # Narrative craft with Marcus
/cis:presentation-master       # Visual communication with Aria
```

## Use Cases

- **Product Innovation**: Generate new product ideas
- **Problem Solving**: Find creative solutions to complex challenges
- **Design Sprints**: Rapid prototyping and validation
- **Pitch Preparation**: Craft compelling presentations
- **Team Workshops**: Facilitate creative collaboration

## Integration

CIS integrates with other modules:
- **bmm**: Product ideation and design thinking for new features
- **strategy-team**: Creative approaches to strategic challenges
- **Party Mode**: Multi-agent creative sessions

## Credits

**Framework:** BMAD Method v6.0
