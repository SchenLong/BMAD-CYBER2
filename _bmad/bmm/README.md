# BMM - BMAD Method (Business & Product Development)

The core product development module for the BMAD ecosystem, covering the complete software development lifecycle from discovery through deployment.

## Version

**v6.0.0** - Core Release (2026-01-11)
- 9 specialized development agents
- 10 production workflows (85 step files)
- Full lifecycle coverage: discovery, planning, architecture, implementation
- Integration with team orchestration for cross-module collaboration

## Agents (9 Total)

### Product & Business

| Command | Agent | Name | Role |
|---------|-------|------|------|
| `/bmm:pm` | pm | John | Product Manager - PRD & Vision |
| `/bmm:analyst` | analyst | Sarah | Business Analyst - Discovery & Requirements |
| `/bmm:ux-designer` | ux-designer | Emma | UX Designer - User Experience |

### Technical

| Command | Agent | Name | Role |
|---------|-------|------|------|
| `/bmm:architect` | architect | Winston | Architect - System Design |
| `/bmm:dev` | dev | Devon | Developer - Implementation |
| `/bmm:tea` | tea | Murat | Test Engineer - Quality Assurance |

### Delivery

| Command | Agent | Name | Role |
|---------|-------|------|------|
| `/bmm:sm` | sm | Alex | Scrum Master - Sprint Management |
| `/bmm:tech-writer` | tech-writer | Clara | Tech Writer - Documentation |
| `/bmm:quick-flow-solo-dev` | quick-flow-solo-dev | Solo Dev | Quick Flow - Fast Prototyping |

## Workflows (10 Total)

| Workflow | Description | Steps |
|----------|-------------|-------|
| `create-product-brief` | Create comprehensive product briefs | Multi-step |
| `create-prd` | Create PRD through collaborative discovery | Multi-step |
| `create-architecture` | Collaborative architectural decision facilitation | Multi-step |
| `create-epics-and-stories` | Transform PRD into implementation stories | Multi-step |
| `sprint-planning` | Generate and manage sprint status | Multi-step |
| `dev-story` | Execute story implementation | Multi-step |
| `code-review` | Adversarial code review | Multi-step |
| `create-tech-spec` | Conversational spec engineering | Multi-step |
| `research` | Comprehensive multi-domain research | Multi-step |
| `quick-dev` | Flexible development for tech-specs or instructions | Multi-step |

## Development Lifecycle

```
Discovery → Planning → Architecture → Implementation → Testing → Deployment
   │          │           │              │              │          │
 Sarah      John       Winston        Devon          Murat      Alex
(Analyst)   (PM)     (Architect)     (Dev)          (TEA)      (SM)
```

## Module Structure

```
_bmad/bmm/
├── agents/                 # 9 agent definitions
├── workflows/              # 10 workflows (85 step files)
├── module.yaml             # Installation template
├── config.yaml             # Runtime configuration
└── README.md               # This file
```

## Quick Start

```bash
# Start a new product
/bmm:analyst        # Discovery with Sarah
/bmm:pm            # PRD creation with John

# Architecture & Planning
/bmm:architect     # System design with Winston
/bmm:sm            # Sprint planning with Alex

# Implementation
/bmm:dev           # Development with Devon
/bmm:tea           # Testing with Murat

# Quick prototyping
/bmm:quick-flow-solo-dev  # Fast iteration
```

## Integration

BMM integrates with other modules through team orchestration:
- **cybersec-team**: Security architecture review, threat modeling
- **legal-team**: Compliance considerations, contract review
- **strategy-team**: Product strategy, stakeholder management

## Credits

**Framework:** BMAD Method v6.0
