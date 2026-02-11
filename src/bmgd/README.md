# BMGD - BMAD Game Development

Specialized game development module supporting Unity, Unreal Engine, and Godot. From game concept to launch certification.

## Version

**v1.0.0** - Initial Release (2026-01-11)

- 6 specialized game development agents
- 7 production workflows (53 step files)
- Multi-engine support: Unity, Unreal, Godot
- Game-specific testing and QA workflows

## Agents (6 Total)

### Design & Production

| Command | Agent | Name | Role |
|---------|-------|------|------|
| `/bmgd:game-designer` | game-designer | Samus Shepard | Game Designer - GDD & Mechanics |
| `/bmgd:game-sm` | game-sm | Max | Game Scrum Master - Sprint Management |

### Technical

| Command | Agent | Name | Role |
|---------|-------|------|------|
| `/bmgd:game-architect` | game-architect | Winston | Game Architect - Engine & Systems |
| `/bmgd:game-dev` | game-dev | Devon | Game Developer - Implementation |
| `/bmgd:game-qa` | game-qa | GLaDOS | Game QA - Testing & Certification |

### Solo Development

| Command | Agent | Name | Role |
|---------|-------|------|------|
| `/bmgd:solo-dev` | solo-dev | Solo Dev | Game Solo Developer - Fast Prototyping |

## Workflows (7 Total)

| Workflow | Description | Steps |
|----------|-------------|-------|
| `game-brief` | Create comprehensive game briefs | Multi-step |
| `gdd` | Create Game Design Document | Multi-step |
| `game-architecture` | Game architecture decisions | Multi-step |
| `sprint-planning` | Game sprint status tracking | Multi-step |
| `dev-story` | Execute game story implementation | Multi-step |
| `code-review` | Game-specific code review (60fps focus) | Multi-step |
| `quick-prototype` | Rapid game prototyping | Multi-step |

## Supported Engines

| Engine | Languages | Notes |
|--------|-----------|-------|
| Unity | C# | Full workflow support |
| Unreal Engine | C++, Blueprints | Full workflow support |
| Godot | GDScript, C# | Full workflow support |
| Custom | Various | Adaptable workflows |

## Game Development Lifecycle

```
Game Brief → GDD → Architecture → Sprint Planning → Development → QA → Launch
     │        │         │              │              │          │
   Samus    Samus    Winston          Max           Devon     GLaDOS
```

## Module Structure

```
src/bmgd/
├── agents/                 # 6 agent definitions
├── workflows/              # 7 workflows (53 step files)
├── module.yaml             # Installation template
├── config.yaml             # Runtime configuration
└── README.md               # This file
```

## Quick Start

```bash
# Game concept
/bmgd:game-designer    # GDD creation with Samus Shepard

# Architecture
/bmgd:game-architect   # Engine & systems with Winston

# Development
/bmgd:game-sm          # Sprint planning with Max
/bmgd:game-dev         # Implementation with Devon

# Testing
/bmgd:game-qa          # QA with GLaDOS

# Quick prototyping
/bmgd:solo-dev         # Fast iteration
```

## Game-Specific Focus

BMGD workflows emphasize:

- **60 FPS**: Performance-focused code review
- **Game Feel**: Responsive controls and feedback
- **Platform Considerations**: Console, PC, mobile optimization
- **Certification**: Platform-specific requirements

## Credits

**Framework:** BMAD Method v6.0
