# BMM Module (BMAD Method)

Full software development lifecycle management. 9 agents and 32 workflows
covering product planning, architecture, development sprints, testing,
and project documentation.

## Key Workflows

| Command | Description | When to Use |
|---------|-------------|-------------|
| `/create-prd` | Collaborative PRD creation | Starting a new product or feature |
| `/create-architecture` | Collaborative architecture facilitation | Designing system architecture |
| `/create-epics-and-stories` | Transform PRD into epics and stories | Breaking down requirements into work items |
| `/create-product-brief` | Collaborative product brief discovery | Early-stage product ideation |
| `/create-ux-design` | Plan UX patterns and look and feel | Designing user experience |
| `/check-implementation-readiness` | Validate PRD/arch/stories before impl | Gate check before development starts |
| `/document-project` | Analyze and document brownfield projects | Documenting existing codebases |
| `/research` | Comprehensive multi-domain research | Deep research on any technical topic |

## Sprint and Dev Workflows

These workflows are shared with the bmgd (game dev) module.
Use the `bmm:` prefix to target the software dev version.

| Command | Description |
|---------|-------------|
| `/bmm:dev-story` | Execute a development story |
| `/bmm:code-review` | Adversarial code review |
| `/bmm:sprint-planning` | Sprint planning and tracking |
| `/bmm:sprint-status` | Sprint status summary |
| `/bmm:correct-course` | Sprint course correction |
| `/bmm:create-story` | Create a user story |
| `/bmm:create-tech-spec` | Conversational spec engineering |
| `/bmm:quick-dev` | Flexible dev with optional planning |
| `/bmm:retrospective` | Epic retrospective |
| `/bmm:workflow-init` | Initialize a new project |
| `/bmm:workflow-status` | Workflow status checker |
| `/bmm:generate-project-context` | Generate project context file |

## Testing Workflows

| Command | Description |
|---------|-------------|
| `/testarch-framework` | Initialize test framework architecture |
| `/testarch-automate` | Expand test automation coverage |
| `/testarch-test-design` | System or epic level test planning |
| `/testarch-test-review` | Review test quality and best practices |
| `/testarch-ci` | Scaffold CI/CD quality pipeline |
| `/testarch-atdd` | Acceptance test driven development |
| `/testarch-nfr` | Non-functional requirements assessment |
| `/testarch-trace` | Requirements-to-tests traceability matrix |

## Diagram Workflows

| Command | Description |
|---------|-------------|
| `/create-excalidraw-diagram` | Architecture diagrams in Excalidraw |
| `/create-excalidraw-flowchart` | Flowcharts in Excalidraw |
| `/create-excalidraw-dataflow` | Data flow diagrams in Excalidraw |
| `/create-excalidraw-wireframe` | Wireframes in Excalidraw |

## Key Agents

- **pm** -- Product manager and requirements
- **architect** -- System architecture and design
- **dev** -- Software development
- **sm** -- Scrum master and agile process
- **tea** -- Test engineering and automation
- **analyst** -- Business and data analysis
- **ux-designer** -- User experience design
- **tech-writer** -- Technical documentation

## Quick Start

Start a new product from scratch:

    /create-product-brief

Design the architecture:

    /create-architecture

Begin development:

    /bmm:dev-story

For more details: `/bmad-help search bmm`
