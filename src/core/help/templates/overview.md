# BMAD-CYBERSEC Help

Welcome to BMAD-CYBERSEC. This installation includes 9 modules providing
139 workflows and 89 specialized agents.

## Installed Modules

| # | Module | Agents | Workflows | Domain |
|---|--------|--------|-----------|--------|
| 1 | core | 2 | 16 | System orchestration, brainstorming, project mgmt |
| 2 | cybersec-team | 15 | 13 | Security testing, compliance, incident response |
| 3 | intel-team | 11 | 19 | OSINT, HUMINT, SIGINT, threat intelligence |
| 4 | legal-team | 13 | 7 | Contracts, corporate formation, tax, disputes |
| 5 | strategy-team | 14 | 16 | Executive strategy, crisis, M&A, leadership |
| 6 | bmm | 10 | 33 | Software development lifecycle |
| 7 | bmgd | 6 | 26 | Game development lifecycle |
| 8 | cis | 6 | 4 | Creative innovation and storytelling |
| 9 | bmb | 3 | 5 | BMAD framework builder tools |

## Quick Start

Run a workflow by name:

    /threat-modeling
    /flash-assessment
    /create-prd
    /brainstorming

For workflows shared across modules, use the module prefix:

    /bmm:code-review       (software dev)
    /game:code-review      (game dev)

## Drill Down

Get detailed help for a module:

    /bmad-help cybersec-team
    /bmad-help intel-team
    /bmad-help legal-team
    /bmad-help strategy-team
    /bmad-help bmm
    /bmad-help core

Search by keyword:

    /bmad-help search <keyword>

List all commands:

    /bmad-help commands

## Categories

1. **Security Operations** -- cybersec-team, intel-team
2. **Business and Legal** -- legal-team, strategy-team
3. **Software Development** -- bmm, bmgd, bmb
4. **Creative and Planning** -- cis, core

## Tips

- Workflows are interactive and guide you step by step.
- `/whats-next` recommends the next action based on project state.
- `/party-mode` starts a multi-agent group discussion.
- Fuzzy matching corrects close misspellings automatically.
