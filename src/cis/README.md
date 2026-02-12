# CIS - Creative Innovation Studio

Creative problem-solving and innovation facilitation module. Brainstorming, design thinking, and innovation methodology for teams and individuals.

## Version

**v1.0.1** - Storyteller Restored (2026-01-12)

- 6 specialized creative agents
- 4 innovation workflows
- Diverse creative techniques and ideation methods
- Integration with Party Mode for collaborative sessions

## Agents (6 Total)

### Innovation & Creativity

| Command | Agent | Name | Role |
|---------|-------|------|------|
| `/cis:innovation-strategist` | innovation-strategist | Victor | Innovation Strategist - Strategic Innovation |
| `/cis:creative-problem-solver` | creative-problem-solver | Dr. Quinn | Creative Problem Solver - Lateral Thinking |
| `/cis:design-thinking-coach` | design-thinking-coach | Maya | Design Thinking Coach - Human-Centered Design |
| `/cis:brainstorming-coach` | brainstorming-coach | Carson | Brainstorming Coach - Innovation Catalyst |

### Communication & Presentation

| Command | Agent | Name | Role |
|---------|-------|------|------|
| `/cis:storyteller` | storyteller | Sophia | Master Storyteller - Narrative Strategy |
| `/cis:presentation-master` | presentation-master | Caravaggio | Presentation Master - Visual Communication |

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
src/cis/
├── agents/                 # 6 agent definitions
│   ├── brainstorming-coach.md        # Carson
│   ├── creative-problem-solver.md    # Dr. Quinn
│   ├── design-thinking-coach.md      # Maya
│   ├── innovation-strategist.md      # Victor
│   ├── presentation-master.md        # Caravaggio
│   └── storyteller/                  # Nested structure
│       └── storyteller.md            # Sophia
├── workflows/              # 4 workflows
│   ├── design-thinking/
│   ├── innovation-strategy/
│   ├── problem-solving/
│   └── storytelling/
├── module.yaml             # Installation template
├── config.yaml             # Runtime configuration
└── README.md               # This file
```

## Quick Start

```bash
# Creative sessions
/cis:brainstorming-coach       # Innovation facilitation with Carson
/cis:creative-problem-solver   # Lateral thinking with Dr. Quinn
/cis:design-thinking-coach     # Human-centered design with Maya

# Innovation
/cis:innovation-strategist     # Strategic innovation with Victor

# Communication
/cis:storyteller               # Narrative strategy with Sophia
/cis:presentation-master       # Visual communication with Caravaggio
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
