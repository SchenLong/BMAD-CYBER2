# BMAD Framework Workflows Reference

## Overview

Workflows in the BMAD framework are structured, multi-step processes that guide AI agents through complex tasks. Each workflow follows a step-file architecture where:

- **Micro-file Design**: Each step is a self-contained instruction file
- **Sequential Execution**: Steps are completed in order without skipping
- **State Tracking**: Progress is tracked in output file frontmatter
- **Just-In-Time Loading**: Only the current step file is loaded at any time

Workflows can be invoked using slash commands (e.g., `/create-prd`) or through the Skill tool.

### Slash Command Routing (v6 Upgrade)

Workflows support both **short commands** and **full paths**:

- **Short command**: `/threat-modeling` (resolves via alias registry)
- **Full path**: `/bmad:cybersec-team:workflows:threat-modeling` (direct invocation)
- **Module-prefixed**: `/game:code-review` or `/bmm:code-review` (for disambiguating conflicts)

Short commands are resolved through the slash command router (`_bmad/core/routing/slash-command-router.js`) which provides:
- Input validation (prevents command injection)
- RBAC enforcement (role-based access control)
- Audit logging (every invocation logged)
- Fuzzy matching (typo suggestions)

The alias registry is defined in `_bmad/_config/workflow-aliases.yaml`. See `Docs/02-user-guides/SLASH-COMMAND-REFERENCE.md` for the complete command reference.

---

## Workflow Reference by Module

### Core Module

Core workflows provide fundamental project management and orchestration capabilities.

| Workflow | Description |
|----------|-------------|
| `brainstorming` | Facilitate interactive brainstorming sessions using diverse creative techniques and ideation methods |
| `party-mode` | Orchestrates group discussions between all installed BMAD agents, enabling natural multi-agent conversations |
| `select-preset` | Select a pre-configured cross-module agent group for Party Mode |
| `create-project` | Initialize a new project under Abdul's management with module selection and folder structure |
| `whats-next` | Analyze project state and recommend next action with appropriate agent |
| `cross-module` | Identify and invoke cross-module expertise for current context |
| `project-status` | Generate comprehensive project status dashboard |
| `assign-task` | Delegate task to appropriate agent with context |
| `select-template` | Select and invoke a team orchestration template for multi-module projects |
| `secure-software` | Security-aware software development with integrated threat modeling, compliance checks, and security gates |
| `incident-response` | Coordinated multi-team incident response with attribution, legal compliance, and communications |
| `strategic-decision` | Multi-perspective strategic decision making with legal risk assessment |
| `compliance-first` | Regulated industry software development with compliance-driven architecture |
| `phase-gate` | Validate phase gate requirements before project phase transitions |
| `conflict-resolution` | Resolve conflicts between modules or teams during orchestration |

### BMB (BMAD Module Builder)

Workflows for creating and managing BMAD modules, agents, and workflows.

| Workflow | Description |
|----------|-------------|
| `agent` | Tri-modal workflow for creating, editing, and validating BMAD Core compliant agents |
| `create-module` | Interactive workflow to build complete BMAD modules with agents, workflows, and installation infrastructure |
| `create-workflow` | Create structured standalone workflows using markdown-based step architecture |
| `edit-workflow` | Intelligent workflow editor that helps modify existing workflows while following best practices |
| `workflow-compliance-check` | Systematic validation of workflows against BMAD standards with adversarial analysis and detailed reporting |

### BMM (BMAD Method for Software Development)

Software development lifecycle workflows from analysis through implementation.

| Workflow | Description |
|----------|-------------|
| **Analysis Phase** | |
| `create-product-brief` | Create comprehensive product briefs through collaborative step-by-step discovery |
| `research` | Conduct comprehensive research across multiple domains using current web data and verified sources |
| **Planning Phase** | |
| `create-ux-design` | Work with a peer UX Design expert to plan your applications UX patterns, look and feel |
| `create-prd` | Creates a comprehensive PRD through collaborative step-by-step discovery |
| **Solutioning Phase** | |
| `check-implementation-readiness` | Critical validation workflow that assesses PRD, Architecture, and Epics & Stories for completeness |
| `create-architecture` | Collaborative architectural decision facilitation for AI-agent consistency |
| `create-epics-and-stories` | Transform PRD requirements and Architecture decisions into implementation-ready epics and user stories |
| **Implementation Phase** | |
| `code-review` | ADVERSARIAL Senior Developer code review that finds 3-10 specific problems in every story |
| `correct-course` | Navigate significant changes during sprint execution by analyzing impact and proposing solutions |
| `create-story` | Create the next user story from epics+stories with enhanced context analysis |
| `dev-story` | Execute a story by implementing tasks/subtasks, writing tests, and validating |
| `retrospective` | Run after epic completion to review success and extract lessons learned |
| `sprint-planning` | Generate and manage the sprint status tracking file for implementation |
| `sprint-status` | Summarize sprint-status.yaml, surface risks, and route to the right workflow |
| **Quick Flow** | |
| `create-tech-spec` | Conversational spec engineering - ask questions, investigate code, produce implementation-ready tech-spec |
| `quick-dev` | Flexible development - execute tech-specs OR direct instructions with optional planning |
| **Documentation** | |
| `document-project` | Analyzes and documents brownfield projects by scanning codebase and patterns |
| `generate-project-context` | Creates a concise project-context.md file with critical rules for AI agents |
| **Diagrams (Excalidraw)** | |
| `create-excalidraw-dataflow` | Create data flow diagrams (DFD) in Excalidraw format |
| `create-excalidraw-diagram` | Create system architecture diagrams, ERDs, UML diagrams in Excalidraw format |
| `create-excalidraw-flowchart` | Create flowchart visualizations in Excalidraw format |
| `create-excalidraw-wireframe` | Create website or app wireframes in Excalidraw format |
| **Test Architecture** | |
| `testarch-atdd` | Generate failing acceptance tests before implementation using TDD red-green-refactor cycle |
| `testarch-automate` | Expand test automation coverage after implementation |
| `testarch-ci` | Scaffold CI/CD quality pipeline with test execution and artifact collection |
| `testarch-framework` | Initialize production-ready test framework architecture (Playwright or Cypress) |
| `testarch-nfr` | Assess non-functional requirements before release with evidence-based validation |
| `testarch-test-design` | System-level testability review or epic-level test planning |
| `testarch-test-review` | Review test quality using comprehensive knowledge base and best practices |
| `testarch-trace` | Generate requirements-to-tests traceability matrix and analyze coverage |
| **Status** | |
| `workflow-init` | Initialize a new BMM project by determining level, type, and creating workflow path |
| `workflow-status` | Lightweight status checker - answers "what should I do now?" for any agent |

### BMGD (BMAD Game Development)

Game development workflows from preproduction through production.

| Workflow | Description |
|----------|-------------|
| **Preproduction** | |
| `brainstorm-game` | Facilitate game brainstorming sessions with game-specific context and techniques |
| `create-game-brief` / `game-brief` | Creates a comprehensive Game Brief through collaborative discovery |
| **Design** | |
| `create-gdd` / `gdd` | Creates a comprehensive Game Design Document with mechanics, systems, progression |
| `narrative` | Narrative design workflow for story-driven games |
| **Technical** | |
| `game-architecture` | Collaborative game architecture workflow covering engine, systems, networking |
| `generate-project-context` | Creates project-context.md with critical rules for game code implementation |
| **Production** | |
| `code-review` | ADVERSARIAL code review with game-specific focus on 60fps, feel, and platform considerations |
| `correct-course` | Navigate significant changes during sprint execution |
| `create-story` | Create the next user story from epics/PRD and architecture |
| `dev-story` | Execute a story by implementing tasks/subtasks and writing tests |
| `retrospective` | Review overall success and extract lessons learned |
| `sprint-planning` | Generate and manage the sprint status tracking file |
| `sprint-status` | Summarize sprint-status.yaml and surface risks |
| **Quick Flow** | |
| `create-tech-spec` | Conversational spec engineering for games |
| `quick-dev` | Flexible game development with game-specific considerations |
| `quick-prototype` | Rapid game prototyping to quickly test gameplay ideas and mechanics |
| **Game Testing** | |
| `gametest-automate` | Generate automated game tests for Unity, Unreal, or Godot |
| `gametest-performance` | Design performance testing strategy for frame rate, memory, and loading times |
| `gametest-playtest-plan` | Create structured playtesting sessions for gameplay validation |
| `gametest-test-design` | Create comprehensive game test scenarios covering gameplay and progression |
| `gametest-framework` | Initialize game test framework architecture for Unity, Unreal, or Godot |
| `gametest-test-review` | Review test quality, coverage, and identify gaps in game testing |
| **Status** | |
| `workflow-init` | Initialize a new BMGD game project |
| `workflow-status` | Lightweight status checker for game dev agents |

### CIS (Creative & Innovation Skills)

Creative thinking and innovation methodologies.

| Workflow | Description |
|----------|-------------|
| `design-thinking` | Guide human-centered design processes using empathy-driven methodologies |
| `innovation-strategy` | Identify disruption opportunities and architect business model innovation |
| `problem-solving` | Apply systematic problem-solving methodologies to crack complex challenges |
| `storytelling` | Craft compelling narratives using proven story frameworks and techniques |

### Legal Team

Legal services and compliance workflows.

| Workflow | Description |
|----------|-------------|
| `legal-matter-intake` | Entry point for all legal matters - case intake, jurisdiction analysis, and routing |
| `contract-review` | Comprehensive contract analysis covering risks, obligations, and recommendations |
| `contract-drafting` | Create jurisdiction-appropriate contracts from requirements through final draft |
| `corporate-formation` | Multi-jurisdictional corporate entity formation and structuring |
| `dispute-strategy` | Dispute analysis and resolution strategy development |
| `tax-planning` | Tax optimization and compliance planning across jurisdictions |
| `cross-border-matter` | Multi-jurisdictional legal matter coordination and strategy |

### Cybersec Team

Cybersecurity assessment and compliance workflows.

| Workflow | Description |
|----------|-------------|
| `incident-response-playbook` | Comprehensive NIST-aligned incident response with investigation, containment, eradication, and recovery |
| `security-architecture-review` | Zero-Trust focused security architecture review with defense-in-depth recommendations |
| `threat-modeling` | Systematic STRIDE-based threat modeling with risk assessment and mitigation strategies |
| `compliance-audit-prep` | Comprehensive compliance audit preparation (NIST, ISO 27001, SOC 2, PCI-DSS, HIPAA, GDPR) |
| `virtual-ciso-consulting` | Comprehensive vCISO engagement covering strategic planning, budget, and governance |
| `vulnerability-management` | End-to-end vulnerability management from asset inventory through program maturity |
| `security-awareness-training` | Comprehensive security awareness program from risk assessment through continuous improvement |
| `cloud-security-assessment` | Cloud security assessment covering IAM, network, data protection across AWS/Azure/GCP |
| `blockchain-security-assessment` | Smart contract and blockchain protocol security auditing for DeFi and access control |
| `mobile-security-testing` | Mobile application security testing for iOS and Android (OWASP Mobile Top 10) |
| `web-app-security-testing` | Web application penetration testing following OWASP Testing Guide and Top 10 |
| `network-assessment` | Network penetration testing covering reconnaissance, vulnerability assessment, and segmentation |
| `infrastructure-security-testing` | Infrastructure security assessment for servers, containers, Kubernetes, CI/CD, and cloud |

### Strategy Team

Executive strategy and decision-making workflows.

| Workflow | Description |
|----------|-------------|
| `board-presentation-prep` | Prepare compelling board presentations with evidence, narrative, and Q&A preparation |
| `competitive-warfare` | Maximum competitive intensity strategy for existential threats or winner-take-all situations |
| `conflict-resolution` | Navigate interpersonal or organizational conflicts toward constructive resolution |
| `corporate-political-game` | Navigate complex internal politics, power dynamics, and organizational maneuvering |
| `crisis-response-planning` | Develop crisis communication and response strategies for high-stakes situations |
| `ethical-dilemma-resolution` | Navigate complex ethical dilemmas with structured multi-perspective analysis |
| `leadership-philosophy` | Develop personal leadership philosophy through dialogue with historical archetypes |
| `policy-development` | Develop internal policies with evidence, ethics review, and implementation planning |
| `political-risk-assessment` | Evaluate political risks in strategic decisions with systematic analysis |
| `stakeholder-negotiation-prep` | Prepare for critical negotiations with stakeholder analysis and strategy development |
| `strategic-decision-workshop` | Multi-perspective strategic decision analysis using all 14 executive advisors |
| `strategic-planning-session` | Long-term strategic planning with diverse strategic philosophies |
| `board-relations-management` | Comprehensive board engagement strategy and relationship management |
| `leadership-transition-planning` | Comprehensive succession and leadership handover planning |
| `ma-due-diligence` | Comprehensive merger and acquisition evaluation using strategic advisors |
| `performance-review-preparation` | Executive performance review preparation with balanced assessments |

### Intel Team

Intelligence collection and analysis workflows.

| Workflow | Description |
|----------|-------------|
| `approach-vector` | HUMINT Operation Planning - Identify vulnerabilities, social entry points, physical access |
| `attribution-chain` | Build evidence-based attribution from indicators to actor identity |
| `breach-archaeology` | Comprehensive data exposure assessment across all breach sources with timeline and risk scoring |
| `campaign-ai` | OSINT Campaign Planning for AI Systems, Models, Companies & Entities |
| `campaign-planner-org` | Comprehensive OSINT campaign planning for corporate, government, or organizational entities |
| `campaign-planner-person` | Systematic OSINT campaign planning for investigating an individual |
| `counter-intel-audit` | Turn intelligence capabilities inward to assess own exposure and vulnerabilities |
| `digital-necromancy` | Recover and reconstruct deleted, hidden, or historical digital presence |
| `doppelganger-hunt` | Identify fake accounts, sock puppets, bots, and impersonators |
| `flash-assessment` | Rapid 15-minute OSINT triage providing immediate hits and risk assessment |
| `ground-truth` | Field Operation Preparation - Complete preparation package for physical/field operations |
| `infrastructure-genealogy` | Trace complete history of digital infrastructure and ownership chains |
| `operation-mosaic` | Full spectrum target package using all 11 agents in coordinated intelligence collection |
| `pattern-of-life` | Behavioral Analysis & Prediction through Multi-Source Pattern Analysis |
| `signal-landscape` | SIGINT Opportunity Mapping - Map target electronic footprint and collection opportunities |
| `spider-web` | Network mapping and expansion - start with single node, systematically expand connections |
| `the-synthesis` | Multi-Source Intelligence Fusion - Correlate, resolve conflicts, assess confidence |
| `threat-constellation` | Map complete threat actor ecosystem - relationships, shared infrastructure, evolution |
| `tripwire` | Alerting & Monitoring Configuration - Configure comprehensive monitoring for target changes |

---

## How to Invoke Workflows

### Method 1: Slash Commands

The simplest way to invoke a workflow is using a slash command:

```
/create-prd
/flash-assessment
/threat-modeling
```

### Method 2: Skill Tool

Workflows can also be invoked programmatically using the Skill tool:

```
skill: "create-prd"
skill: "flash-assessment"
skill: "bmm:workflows:create-architecture"
```

### Method 3: Fully Qualified Names

For explicit module targeting, use the fully qualified name:

```
/bmad:bmm:workflows:create-prd
/bmad:intel-team:workflows:flash-assessment
/bmad:cybersec-team:workflows:threat-modeling
```

---

## Workflow Execution Tips

1. **Follow the prompts**: Workflows guide you through each step - answer questions and provide input when requested
2. **Don't skip steps**: Workflows enforce sequential execution for a reason
3. **Save your work**: Workflows track progress in output file frontmatter, allowing you to resume if interrupted
4. **Use context files**: Many workflows accept optional context files for project-specific guidance
5. **Check prerequisites**: Some workflows require other artifacts (e.g., `create-epics-and-stories` requires a completed PRD and Architecture)

---

## Related Documentation

- [CLI Command Reference](./02-user-guides/CLI-COMMAND-REFERENCE.md) - Complete command reference
- [Getting Started](./02-user-guides/GETTING-STARTED.md) - Initial setup guide
- Module Setup Guides in `./02-user-guides/ModuleSetup/` - Module-specific configuration
