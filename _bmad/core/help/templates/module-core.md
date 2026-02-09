# Core Module

System-level orchestration, team coordination, brainstorming, and project
management. 2 agents and 16 workflows that provide cross-module capabilities.

## Workflows

| Command | Description | When to Use |
|---------|-------------|-------------|
| `/brainstorming` | Facilitated creative brainstorming sessions | Generating ideas using structured techniques |
| `/party-mode` | Multi-agent group discussion | Bringing multiple agents into one conversation |
| `/select-preset` | Select cross-module agent group preset | Choosing a pre-built agent team configuration |
| `/create-project` | Initialize new project with module selection | Starting a new project from scratch |
| `/whats-next` | Analyze project state and recommend next step | Deciding what to work on next |
| `/project-status` | Generate project status dashboard | Getting an overview of project progress |
| `/assign-task` | Delegate task to appropriate agent | Routing work to the right specialist |
| `/cross-module` | Invoke cross-module expertise | Pulling in agents from different modules |

## Team Orchestration Workflows

| Command | Description |
|---------|-------------|
| `/select-template` | Select team orchestration template |
| `/strategic-decision` | Multi-perspective strategic decision making |
| `/incident-response` | Multi-team coordinated incident response |
| `/compliance-first` | Compliance-driven software development |
| `/phase-gate` | Validate phase gate requirements |
| `/secure-software` | Security-aware software development |

Note: `/conflict-resolution` is shared with strategy-team. Use
`/core:conflict-resolution` to specifically invoke the core version.

## Agents

- **bmad-master** -- Primary orchestrator and system coordinator
- **abdul** -- Advanced brainstorming and elicitation specialist

## Quick Start

Start a brainstorming session:

    /brainstorming

Find out what to do next on your project:

    /whats-next

Launch a multi-agent discussion:

    /party-mode

For more details: `/bmad-help search core`
