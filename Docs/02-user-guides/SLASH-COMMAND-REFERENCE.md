# BMAD-CYBERSEC Slash Command Reference

> Created as part of **v6 Hybrid Upgrade -- Story 01: Slash Command Alias Registry**
> Source: `_bmad/_config/workflow-aliases.yaml` (v1.0.0) and `_bmad/_config/workflow-alias-inventory.yaml` (v1.0.0)
> Date: 2026-02-09

---

## How Slash Commands Work

Every BMAD workflow can be invoked in three ways:

| Invocation Style | Example | When to Use |
|---|---|---|
| **Short alias** | `/create-prd` | Unique commands with no conflicts |
| **Module-prefixed alias** | `/bmm:code-review` | Conflicted commands that exist in multiple modules |
| **Full path** | `/bmad:bmm:workflows:create-prd` | Programmatic use or maximum precision |

The alias resolver looks up the short name first. If the name is unique across all modules, it resolves directly. If multiple modules share the same name, the resolver requires a module prefix (e.g., `game:` or `bmm:`) or prompts the user to choose.

### Naming Rules

- Aliases use lowercase alphanumeric characters, hyphens, and colons: `^[a-z0-9][a-z0-9:-]*[a-z0-9]$`
- Length: 2--100 characters
- Colons appear only in module-prefixed form (e.g., `bmm:dev-story`)

---

## Commands by Module

### Core (prefix: `core`) -- 15 commands

| Command | Full Path | Description |
|---|---|---|
| `assign-task` | `bmad:core:workflows:assign-task` | Delegate task to appropriate agent |
| `brainstorming` | `bmad:core:workflows:brainstorming` | Facilitate creative brainstorming sessions |
| `compliance-first` | `bmad:core:workflows:compliance-first` | Compliance-driven software development |
| `core:conflict-resolution` | `bmad:core:workflows:conflict-resolution` | Core team conflict resolution |
| `create-project` | `bmad:core:workflows:create-project` | Initialize new project with module selection |
| `cross-module` | `bmad:core:workflows:cross-module` | Invoke cross-module expertise |
| `incident-response` | `bmad:core:workflows:incident-response` | Multi-team coordinated incident response |
| `party-mode` | `bmad:core:workflows:party-mode` | Multi-agent group discussion |
| `phase-gate` | `bmad:core:workflows:phase-gate` | Validate phase gate requirements |
| `project-status` | `bmad:core:workflows:project-status` | Generate project status dashboard |
| `secure-software` | `bmad:core:workflows:secure-software` | Security-aware software development |
| `select-preset` | `bmad:core:workflows:select-preset` | Select cross-module agent group preset |
| `select-template` | `bmad:core:workflows:select-template` | Select team orchestration template |
| `strategic-decision` | `bmad:core:workflows:strategic-decision` | Multi-perspective strategic decision making |
| `whats-next` | `bmad:core:workflows:whats-next` | Analyze project state and recommend next |

### BMB -- BMAD Builder (prefix: `bmb`) -- 6 commands

| Command | Full Path | Description |
|---|---|---|
| `agent` | `bmad:bmb:workflows:agent` | Create, edit, validate BMAD agents |
| `create-module` | `bmad:bmb:workflows:create-module` | Build complete BMAD modules |
| `create-workflow` | `bmad:bmb:workflows:create-workflow` | Create structured standalone workflows |
| `edit-workflow` | `bmad:bmb:workflows:edit-workflow` | Modify existing workflows |
| `meal-prep-nutrition-plan` | `bmad:bmb:workflows:meal-prep-nutrition-plan` | Personalized meal planning workflow |
| `workflow-compliance-check` | `bmad:bmb:workflows:workflow-compliance-check` | Validate workflows against BMAD standards |

### BMGD -- Game Development (prefix: `game`) -- 26 commands

| Command | Full Path | Description |
|---|---|---|
| `brainstorm-game` | `bmad:bmgd:workflows:brainstorm-game` | Game brainstorming sessions |
| `create-game-brief` | `bmad:bmgd:workflows:create-game-brief` | Collaborative game brief creation |
| `create-gdd` | `bmad:bmgd:workflows:create-gdd` | Create game design document |
| `game-architecture` | `bmad:bmgd:workflows:game-architecture` | Collaborative game architecture design |
| `game-brief` | `bmad:bmgd:workflows:game-brief` | Interactive game brief creation |
| `gametest-automate` | `bmad:bmgd:workflows:gametest-automate` | Generate automated game tests |
| `gametest-framework` | `bmad:bmgd:workflows:gametest-framework` | Initialize game test framework |
| `gametest-performance` | `bmad:bmgd:workflows:gametest-performance` | Game performance testing strategy |
| `gametest-playtest-plan` | `bmad:bmgd:workflows:gametest-playtest-plan` | Structured playtesting session planning |
| `gametest-test-design` | `bmad:bmgd:workflows:gametest-test-design` | Comprehensive game test scenario design |
| `gametest-test-review` | `bmad:bmgd:workflows:gametest-test-review` | Review game test quality and coverage |
| `gdd` | `bmad:bmgd:workflows:gdd` | Game design document workflow |
| `narrative` | `bmad:bmgd:workflows:narrative` | Narrative design for story-driven games |
| `quick-prototype` | `bmad:bmgd:workflows:quick-prototype` | Rapid game prototyping |
| `game:code-review` | `bmad:bmgd:workflows:code-review` | Game dev adversarial code review |
| `game:correct-course` | `bmad:bmgd:workflows:correct-course` | Game dev sprint course correction |
| `game:create-story` | `bmad:bmgd:workflows:create-story` | Create game dev user story |
| `game:create-tech-spec` | `bmad:bmgd:workflows:create-tech-spec` | Game dev conversational spec engineering |
| `game:dev-story` | `bmad:bmgd:workflows:dev-story` | Execute game dev story implementation |
| `game:generate-project-context` | `bmad:bmgd:workflows:generate-project-context` | Generate game project context file |
| `game:quick-dev` | `bmad:bmgd:workflows:quick-dev` | Flexible game development workflow |
| `game:retrospective` | `bmad:bmgd:workflows:retrospective` | Game dev epic retrospective |
| `game:sprint-planning` | `bmad:bmgd:workflows:sprint-planning` | Game dev sprint planning and tracking |
| `game:sprint-status` | `bmad:bmgd:workflows:sprint-status` | Game dev sprint status summary |
| `game:workflow-init` | `bmad:bmgd:workflows:workflow-init` | Initialize new game dev project |
| `game:workflow-status` | `bmad:bmgd:workflows:workflow-status` | Game dev workflow status checker |

### BMM -- Software Development (prefix: `bmm`) -- 32 commands

| Command | Full Path | Description |
|---|---|---|
| `check-implementation-readiness` | `bmad:bmm:workflows:check-implementation-readiness` | Validate PRD/arch/stories before impl |
| `create-architecture` | `bmad:bmm:workflows:create-architecture` | Collaborative architecture facilitation |
| `create-epics-and-stories` | `bmad:bmm:workflows:create-epics-and-stories` | Transform PRD into epics and stories |
| `create-excalidraw-dataflow` | `bmad:bmm:workflows:create-excalidraw-dataflow` | Create data flow diagrams in Excalidraw |
| `create-excalidraw-diagram` | `bmad:bmm:workflows:create-excalidraw-diagram` | Create architecture diagrams in Excalidraw |
| `create-excalidraw-flowchart` | `bmad:bmm:workflows:create-excalidraw-flowchart` | Create flowcharts in Excalidraw format |
| `create-excalidraw-wireframe` | `bmad:bmm:workflows:create-excalidraw-wireframe` | Create wireframes in Excalidraw format |
| `create-prd` | `bmad:bmm:workflows:create-prd` | Collaborative PRD creation |
| `create-product-brief` | `bmad:bmm:workflows:create-product-brief` | Collaborative product brief discovery |
| `create-ux-design` | `bmad:bmm:workflows:create-ux-design` | Plan UX patterns and look and feel |
| `document-project` | `bmad:bmm:workflows:document-project` | Analyze and document brownfield projects |
| `research` | `bmad:bmm:workflows:research` | Comprehensive multi-domain research |
| `testarch-atdd` | `bmad:bmm:workflows:testarch-atdd` | Acceptance test driven development |
| `testarch-automate` | `bmad:bmm:workflows:testarch-automate` | Expand test automation coverage |
| `testarch-ci` | `bmad:bmm:workflows:testarch-ci` | Scaffold CI/CD quality pipeline |
| `testarch-framework` | `bmad:bmm:workflows:testarch-framework` | Initialize test framework architecture |
| `testarch-nfr` | `bmad:bmm:workflows:testarch-nfr` | Assess non-functional requirements |
| `testarch-test-design` | `bmad:bmm:workflows:testarch-test-design` | System or epic level test planning |
| `testarch-test-review` | `bmad:bmm:workflows:testarch-test-review` | Review test quality and best practices |
| `testarch-trace` | `bmad:bmm:workflows:testarch-trace` | Requirements-to-tests traceability matrix |
| `bmm:code-review` | `bmad:bmm:workflows:code-review` | Software dev adversarial code review |
| `bmm:correct-course` | `bmad:bmm:workflows:correct-course` | Software dev sprint course correction |
| `bmm:create-story` | `bmad:bmm:workflows:create-story` | Create software dev user story |
| `bmm:create-tech-spec` | `bmad:bmm:workflows:create-tech-spec` | Conversational spec engineering |
| `bmm:dev-story` | `bmad:bmm:workflows:dev-story` | Execute software dev story implementation |
| `bmm:generate-project-context` | `bmad:bmm:workflows:generate-project-context` | Generate project context file |
| `bmm:quick-dev` | `bmad:bmm:workflows:quick-dev` | Flexible dev with optional planning |
| `bmm:retrospective` | `bmad:bmm:workflows:retrospective` | Software dev epic retrospective |
| `bmm:sprint-planning` | `bmad:bmm:workflows:sprint-planning` | Software dev sprint planning and tracking |
| `bmm:sprint-status` | `bmad:bmm:workflows:sprint-status` | Software dev sprint status summary |
| `bmm:workflow-init` | `bmad:bmm:workflows:workflow-init` | Initialize new software dev project |
| `bmm:workflow-status` | `bmad:bmm:workflows:workflow-status` | Software dev workflow status checker |

### CIS -- Creative & Innovation (prefix: `cis`) -- 4 commands

| Command | Full Path | Description |
|---|---|---|
| `design-thinking` | `bmad:cis:workflows:design-thinking` | Human-centered design process guidance |
| `innovation-strategy` | `bmad:cis:workflows:innovation-strategy` | Disruption and business model innovation |
| `problem-solving` | `bmad:cis:workflows:problem-solving` | Systematic problem-solving methodologies |
| `storytelling` | `bmad:cis:workflows:storytelling` | Craft compelling narratives |

### Cybersec Team (prefix: `sec`) -- 13 commands

| Command | Full Path | Description |
|---|---|---|
| `blockchain-security-assessment` | `bmad:cybersec-team:workflows:blockchain-security-assessment` | Smart contract and blockchain security audit |
| `cloud-security-assessment` | `bmad:cybersec-team:workflows:cloud-security-assessment` | Cloud IAM, network, data security review |
| `compliance-audit-prep` | `bmad:cybersec-team:workflows:compliance-audit-prep` | Multi-framework compliance audit prep |
| `incident-response-playbook` | `bmad:cybersec-team:workflows:incident-response-playbook` | NIST-aligned incident response workflow |
| `infrastructure-security-testing` | `bmad:cybersec-team:workflows:infrastructure-security-testing` | Server, container, and CI/CD security |
| `mobile-security-testing` | `bmad:cybersec-team:workflows:mobile-security-testing` | iOS and Android app security testing |
| `network-assessment` | `bmad:cybersec-team:workflows:network-assessment` | Network penetration testing |
| `security-architecture-review` | `bmad:cybersec-team:workflows:security-architecture-review` | Zero-Trust security architecture review |
| `security-awareness-training` | `bmad:cybersec-team:workflows:security-awareness-training` | Security awareness program development |
| `threat-modeling` | `bmad:cybersec-team:workflows:threat-modeling` | STRIDE-based threat modeling |
| `virtual-ciso-consulting` | `bmad:cybersec-team:workflows:virtual-ciso-consulting` | vCISO strategic planning and governance |
| `vulnerability-management` | `bmad:cybersec-team:workflows:vulnerability-management` | End-to-end vulnerability management |
| `web-app-security-testing` | `bmad:cybersec-team:workflows:web-app-security-testing` | OWASP web app penetration testing |

### Intel Team (prefix: `intel`) -- 19 commands

| Command | Full Path | Description |
|---|---|---|
| `approach-vector` | `bmad:intel-team:workflows:approach-vector` | HUMINT operation planning |
| `attribution-chain` | `bmad:intel-team:workflows:attribution-chain` | Evidence-based attribution analysis |
| `breach-archaeology` | `bmad:intel-team:workflows:breach-archaeology` | Data exposure assessment across breaches |
| `campaign-ai` | `bmad:intel-team:workflows:campaign-ai` | OSINT campaign for AI systems/entities |
| `campaign-planner-org` | `bmad:intel-team:workflows:campaign-planner-org` | OSINT campaign for organizations |
| `campaign-planner-person` | `bmad:intel-team:workflows:campaign-planner-person` | OSINT campaign for individuals |
| `counter-intel-audit` | `bmad:intel-team:workflows:counter-intel-audit` | Internal exposure and OPSEC assessment |
| `digital-necromancy` | `bmad:intel-team:workflows:digital-necromancy` | Recover deleted digital presence |
| `doppelganger-hunt` | `bmad:intel-team:workflows:doppelganger-hunt` | Identify fake accounts and impersonators |
| `flash-assessment` | `bmad:intel-team:workflows:flash-assessment` | Rapid 15-minute OSINT triage |
| `ground-truth` | `bmad:intel-team:workflows:ground-truth` | Field operation preparation package |
| `infrastructure-genealogy` | `bmad:intel-team:workflows:infrastructure-genealogy` | Trace digital infrastructure history |
| `operation-mosaic` | `bmad:intel-team:workflows:operation-mosaic` | Full spectrum coordinated intel package |
| `pattern-of-life` | `bmad:intel-team:workflows:pattern-of-life` | Behavioral analysis and prediction |
| `signal-landscape` | `bmad:intel-team:workflows:signal-landscape` | SIGINT opportunity mapping |
| `spider-web` | `bmad:intel-team:workflows:spider-web` | Network mapping and expansion |
| `the-synthesis` | `bmad:intel-team:workflows:the-synthesis` | Multi-source intelligence fusion |
| `threat-constellation` | `bmad:intel-team:workflows:threat-constellation` | Map threat actor ecosystem |
| `tripwire` | `bmad:intel-team:workflows:tripwire` | Alerting and monitoring configuration |

### Legal Team (prefix: `legal`) -- 7 commands

| Command | Full Path | Description |
|---|---|---|
| `contract-drafting` | `bmad:legal-team:workflows:contract-drafting` | Jurisdiction-appropriate contract creation |
| `contract-review` | `bmad:legal-team:workflows:contract-review` | Contract risk and obligation analysis |
| `corporate-formation` | `bmad:legal-team:workflows:corporate-formation` | Multi-jurisdictional entity formation |
| `cross-border-matter` | `bmad:legal-team:workflows:cross-border-matter` | Multi-jurisdictional legal coordination |
| `dispute-strategy` | `bmad:legal-team:workflows:dispute-strategy` | Dispute analysis and resolution strategy |
| `legal-matter-intake` | `bmad:legal-team:workflows:legal-matter-intake` | Legal case intake and routing |
| `tax-planning` | `bmad:legal-team:workflows:tax-planning` | Tax optimization and compliance planning |

### Strategy Team (prefix: `strategy`) -- 16 commands

| Command | Full Path | Description |
|---|---|---|
| `board-presentation-prep` | `bmad:strategy-team:workflows:board-presentation-prep` | Prepare compelling board presentations |
| `board-relations-management` | `bmad:strategy-team:workflows:board-relations-management` | Board engagement and relationship mgmt |
| `competitive-warfare` | `bmad:strategy-team:workflows:competitive-warfare` | Maximum intensity competitive strategy |
| `corporate-political-game` | `bmad:strategy-team:workflows:corporate-political-game` | Navigate internal politics and power |
| `crisis-response-planning` | `bmad:strategy-team:workflows:crisis-response-planning` | Crisis communication and response |
| `ethical-dilemma-resolution` | `bmad:strategy-team:workflows:ethical-dilemma-resolution` | Multi-perspective ethical analysis |
| `leadership-philosophy` | `bmad:strategy-team:workflows:leadership-philosophy` | Develop personal leadership philosophy |
| `leadership-transition-planning` | `bmad:strategy-team:workflows:leadership-transition-planning` | Succession and leadership handover |
| `ma-due-diligence` | `bmad:strategy-team:workflows:ma-due-diligence` | M&A evaluation and integration strategy |
| `performance-review-preparation` | `bmad:strategy-team:workflows:performance-review-preparation` | Executive performance review prep |
| `policy-development` | `bmad:strategy-team:workflows:policy-development` | Internal policy with ethics review |
| `political-risk-assessment` | `bmad:strategy-team:workflows:political-risk-assessment` | Political risk evaluation for decisions |
| `stakeholder-negotiation-prep` | `bmad:strategy-team:workflows:stakeholder-negotiation-prep` | Critical negotiation preparation |
| `strategic-decision-workshop` | `bmad:strategy-team:workflows:strategic-decision-workshop` | Multi-advisor strategic decision analysis |
| `strategic-planning-session` | `bmad:strategy-team:workflows:strategic-planning-session` | Long-term strategic planning session |
| `strategy:conflict-resolution` | `bmad:strategy-team:workflows:conflict-resolution` | Strategic conflict resolution |

---

## Disambiguation: Conflicted Command Names

13 command names exist in more than one module. Using the bare name will trigger a disambiguation prompt. Always use the module-prefixed form for these commands.

| Bare Name | BMGD (game) | BMM (bmm) | Core | Strategy |
|---|---|---|---|---|
| `code-review` | `game:code-review` | `bmm:code-review` | -- | -- |
| `conflict-resolution` | -- | -- | `core:conflict-resolution` | `strategy:conflict-resolution` |
| `correct-course` | `game:correct-course` | `bmm:correct-course` | -- | -- |
| `create-story` | `game:create-story` | `bmm:create-story` | -- | -- |
| `create-tech-spec` | `game:create-tech-spec` | `bmm:create-tech-spec` | -- | -- |
| `dev-story` | `game:dev-story` | `bmm:dev-story` | -- | -- |
| `generate-project-context` | `game:generate-project-context` | `bmm:generate-project-context` | -- | -- |
| `quick-dev` | `game:quick-dev` | `bmm:quick-dev` | -- | -- |
| `retrospective` | `game:retrospective` | `bmm:retrospective` | -- | -- |
| `sprint-planning` | `game:sprint-planning` | `bmm:sprint-planning` | -- | -- |
| `sprint-status` | `game:sprint-status` | `bmm:sprint-status` | -- | -- |
| `workflow-init` | `game:workflow-init` | `bmm:workflow-init` | -- | -- |
| `workflow-status` | `game:workflow-status` | `bmm:workflow-status` | -- | -- |

12 of 13 conflicts are between BMGD and BMM (game dev vs. software dev variants of the same workflow). The remaining conflict is `conflict-resolution` between Core and Strategy.

---

## Reserved Names

The following names are blocked from use as aliases to prevent security vulnerabilities (VULN-008: Ghost Command Injection). Any attempt to register an alias matching a reserved name is rejected.

### Security Validator Names

These correspond to validator entry points in `.claude/validators-node/bin/`. An alias collision here could cause a workflow to execute instead of a security validator.

`anomaly-detector`, `archival-cli`, `audit-integrity`, `bash-safety`, `confidence-tracker`, `context-manager`, `env-protection`, `jailbreak`, `outside-repo`, `pii`, `plugin-permissions`, `production`, `prompt-injection`, `rate-limiter`, `recursion-guard`, `resource-limits`, `secret`, `session-init`, `supply-chain`, `telemetry`, `token-validator`

### System Commands

Built-in commands that must not be shadowed by workflow aliases.

`help`, `bmad-help`, `clear`, `exit`, `status`

### Agent Names

Core BMAD agent identifiers reserved to prevent agent/workflow confusion.

`abdul`, `bmad-master`

---

## Security: RBAC and Audit Logging

All slash command invocations pass through the BMAD-CYBERSEC security pipeline:

1. **Input Validation** -- Alias names are validated against the pattern `^[a-z0-9][a-z0-9:-]*[a-z0-9]$` (2--100 chars). Malformed input is rejected before resolution.

2. **Reserved Name Check** -- The alias is checked against the reserved names blocklist. Matches are rejected with a security event logged.

3. **RBAC Enforcement** -- The resolved workflow target is checked against the caller's role-based access control permissions. Unauthorized invocations are denied.

4. **Tamper-Evident Audit Logging** -- Every command invocation (successful or denied) is recorded in the `TamperEvidentAuditLogger` with SHA-256 hash chain integrity. Audit entries include timestamp, caller identity, resolved target, and outcome.

5. **Validator Pipeline** -- The 139+ validators in `settings.json` continue to run on all command execution, independent of the alias resolution layer. The alias system adds a resolution step but does not bypass any existing security hooks.

---

## Quick Stats

| Metric | Count |
|---|---|
| Total workflows | 138 |
| Unique (direct) aliases | 112 |
| Module-prefixed (conflict) aliases | 26 |
| Disambiguation entries | 13 |
| Modules | 9 |
| Reserved names | 28 |
