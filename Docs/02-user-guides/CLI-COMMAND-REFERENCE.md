# CLI Command Reference

Complete reference for BMAD-CYBER2 command-line interface.

---

## Command Syntax

### Agent Invocation

```bash
# Module-prefixed format (recommended for disambiguation)
/<module>:<agent-name>

# Direct nickname format (for agents with unique shortcuts)
/<agent-nickname>
```

**Examples:**

```bash
# Module-prefixed
/cybersec-team:security-architect
/intel-team:osint-lead
/strategy-team:the-master-strategist
/legal-team:counsel

# Nickname shortcuts (cybersec-team agents only)
/security-architect
/threat-analyst
/penetration-tester
/incident-commander
```

---

## Module Commands

### Core Module

| Command | Agent | Description |
|---------|-------|-------------|
| `/bmad:core:agents:abdul` | Abdul | Master Project Manager, cross-module orchestrator |
| `/bmad:core:agents:bmad-master` | BMAD Master | System orchestrator |

### Cybersec-Team Module

| Command | Nickname | Agent | Description |
|---------|----------|-------|-------------|
| `/cybersec-team:security-architect` | `/security-architect` | Bastion | Security architecture and defense |
| `/cybersec-team:threat-analyst` | `/threat-analyst` | Cipher | Threat intelligence |
| `/cybersec-team:penetration-tester` | `/penetration-tester` | Ghost | Offensive security |
| `/cybersec-team:incident-commander` | `/incident-commander` | Phoenix | Incident response |
| `/cybersec-team:compliance-guardian` | `/compliance-guardian` | Sentinel | Compliance and risk |
| `/cybersec-team:forensic-investigator` | `/forensic-investigator` | Trace | Digital forensics |
| `/cybersec-team:soc-analyst` | `/soc-analyst` | Watchman | SOC operations |
| `/cybersec-team:cloud-security` | `/cloud-security` | Nimbus | Cloud security |
| `/cybersec-team:blockchain-security` | `/blockchain-security` | Ledger | Web3 security |
| `/cybersec-team:webapp-security` | `/webapp-security` | Weaver | Web application security |
| `/cybersec-team:api-security` | `/api-security` | Gateway | API security |
| `/cybersec-team:llm-security` | `/llm-security` | Oracle | AI/LLM security |
| `/cybersec-team:blue-team-lead` | `/blue-team-lead` | Shield | Blue team operations |
| `/cybersec-team:mobile-security` | `/mobile-security` | Phantom | Mobile security |
| `/cybersec-team:social-engineer` | `/social-engineer` | Specter | Social engineering |

### Intel-Team Module

| Command | Agent | Description |
|---------|-------|-------------|
| `/intel-team:osint-lead` | Vector | Intelligence Director |
| `/intel-team:domain-intel-specialist` | Resolver | Domain and infrastructure intelligence |
| `/intel-team:social-media-analyst` | Echo | SOCMINT specialist |
| `/intel-team:dark-web-analyst` | Shadow | Dark web intelligence |
| `/intel-team:geospatial-analyst` | Atlas | GEOINT specialist |
| `/intel-team:technical-researcher` | Probe | Technical intelligence |
| `/intel-team:threat-actor-profiler` | Dossier | Threat actor profiling |
| `/intel-team:corporate-intel-specialist` | Proxy | Corporate intelligence |
| `/intel-team:humint-specialist` | Viper | Human intelligence |
| `/intel-team:sigint-specialist` | Sigil | Signals intelligence |
| `/intel-team:field-operative` | Specter | Field operations |

### Strategy-Team Module

| Command | Agent | Description |
|---------|-------|-------------|
| `/strategy-team:policy-analyst` | Augustus | Evidence-based policy |
| `/strategy-team:political-strategist` | Magnus | Political strategy |
| `/strategy-team:debate-coach` | Cicero | Debate and rhetoric |
| `/strategy-team:stakeholder-mediator` | Geneva | Mediation and diplomacy |
| `/strategy-team:ethics-advisor` | Sophia | Ethics and philosophy |
| `/strategy-team:communications-director` | Giuseppe | Strategic communications |
| `/strategy-team:the-realist` | Niccolo | Realpolitik perspective |
| `/strategy-team:the-liberator` | Charles | Idealistic leadership |
| `/strategy-team:the-revolutionary` | Maximilien | Revolutionary change |
| `/strategy-team:the-conservative` | Burke | Conservative wisdom |
| `/strategy-team:the-technocrat` | Lee Kuan Yew | Systems-driven approach |
| `/strategy-team:the-strategist-warrior` | Musashi | Strategic timing |
| `/strategy-team:the-master-strategist` | Sun Tzu | Strategic wisdom |
| `/strategy-team:the-principled-commander` | Jean-Luc | Principled leadership |

### Legal-Team Module

> **Note:** Legal-Team agents are designed for Party Mode support. See [Legal-Team disclaimer](ModuleSetup/LEGAL-TEAM-SETUP.md).

| Command | Agent | Description |
|---------|-------|-------------|
| `/legal-team:counsel` | Counsel | General Counsel, team director |
| `/legal-team:liberty` | Liberty | US law specialist |
| `/legal-team:europa` | Europa | EU law specialist |
| `/legal-team:castile` | Castile | Spanish law specialist |
| `/legal-team:covenant` | Covenant | Contract specialist |
| `/legal-team:tribute` | Tribute | Tax counsel |
| `/legal-team:advocate` | Advocate | Litigation strategist |
| `/legal-team:iberia` | Iberia | Spain civil law |
| `/legal-team:gremio` | Gremio | Spain labor law |
| `/legal-team:baltic` | Baltic | Estonia corporate law |
| `/legal-team:charter` | Charter | Corporate governance |
| `/legal-team:insignia` | Insignia | IP counsel |
| `/legal-team:deed` | Deed | Real estate counsel |

### BMM Module (Development)

| Command | Agent | Description |
|---------|-------|-------------|
| `/bmad:bmm:agents:pm` | John | Product Manager |
| `/bmad:bmm:agents:analyst` | Sarah | Business Analyst |
| `/bmad:bmm:agents:ux-designer` | Emma | UX Designer |
| `/bmad:bmm:agents:architect` | Winston | Architect |
| `/bmad:bmm:agents:developer` | Devon | Developer |
| `/bmad:bmm:agents:test-engineer` | Murat | Test Engineer |
| `/bmad:bmm:agents:scrum-master` | Alex | Scrum Master |
| `/bmad:bmm:agents:tech-writer` | Clara | Tech Writer |
| `/bmad:bmm:agents:solo-dev` | Solo Dev | Quick development flow |

---

## Workflow Commands

Workflows are accessed through agent menus. After invoking an agent:

### Menu Navigation

```bash
# Enter menu item number
> 1

# Enter menu item code
> SR      # Security Review
> IR      # Incident Response
> PM      # Party Mode

# Enter menu item text (fuzzy matching)
> security review
> incident
```

### Direct Workflow Loading

```bash
# Load workflow file directly
Load workflow: _bmad/cybersec-team/workflows/security-architecture-review/workflow.md
```

### Common Workflow Codes

| Module | Code | Workflow |
|--------|------|----------|
| Cybersec | `SR` | Security Architecture Review |
| Cybersec | `IR` | Incident Response Playbook |
| Cybersec | `TM` | STRIDE Threat Modeling |
| Cybersec | `CA` | Compliance Audit Prep |
| Intel | `OM` | Operation Mosaic |
| Intel | `FA` | Flash Assessment |
| Intel | `CP` | Campaign Planner |
| Strategy | `SD` | Strategic Decision Workshop |
| Strategy | `CR` | Crisis Response Planning |
| Legal | `LI` | Legal Matter Intake |
| Legal | `CR` | Contract Review |
| BMM | `PRD` | Create PRD |
| BMM | `SP` | Sprint Planning |

---

## Party Mode Commands

Party Mode enables multi-agent collaboration.

### Invoking Party Mode

```bash
# From any agent
> PM

# Or use workflow
/bmad:core:workflows:party-mode
```

### Party Mode Options

| Command | Description |
|---------|-------------|
| `PM` | Open Party Mode selection |
| `select-preset` | Choose pre-configured team |
| `cross-module` | Identify cross-module expertise |

### Available Presets

| Preset | Agents | Purpose |
|--------|--------|---------|
| `security-review` | Bastion + Ghost + Nimbus | Architecture security review |
| `incident-response` | Phoenix + Trace + Cipher + Watchman | Incident handling |
| `compliance-audit` | Sentinel + Bastion + Nimbus | Compliance assessment |
| `purple-team` | Shield + Ghost + Watchman + Cipher | Adversarial testing |
| `strategic-council` | All 8 strategy archetypes | Multi-perspective decision |
| `intel-fusion` | Vector + Resolver + Echo + Shadow + Atlas + Probe | All-source intelligence |

---

## System Commands

### LLM Provider Management

```bash
# Check current provider
.claude/hooks/llm-provider-manager.sh get

# Switch provider
.claude/hooks/llm-provider-manager.sh set ollama
.claude/hooks/llm-provider-manager.sh set claude

# Check provider health
.claude/hooks/llm-provider-manager.sh health-all
```

### Security Commands

```bash
# Generate authentication token
node _bmad/core/security/quick-token.cjs "<name>" "<role>" <hours>

# Validate token
node _bmad/core/security/validate-token.js

# Check authorization
node _bmad/core/security/check-authorization.js

# Verify file integrity
./_bmad/core/security/verify-integrity.sh
```

### Token Environment Variable

```bash
# Set token for session
export BMAD_AUTH_TOKEN="<your-token>"

# Or save to file
echo "<token>" > .bmad-token
```

---

## Agent Interaction

### In-Agent Commands

| Command | Description |
|---------|-------------|
| `H` or `help` | Display help and menu |
| `PM` | Open Party Mode |
| `exit` | Exit current agent |
| Number (1-9) | Select menu item |
| Text | Fuzzy match menu item |

### Session Variables

Agents automatically load from `_bmad/[module]/config.yaml`:

| Variable | Description |
|----------|-------------|
| `user_name` | Your name for personalized interaction |
| `communication_language` | Preferred language |
| `output_folder` | Default output location |

---

## File Paths

### Module Locations

| Module | Path |
|--------|------|
| Core | `_bmad/core/` |
| Cybersec | `_bmad/cybersec-team/` |
| Intel | `_bmad/intel-team/` |
| Strategy | `_bmad/strategy-team/` |
| Legal | `_bmad/legal-team/` |
| BMM | `_bmad/bmm/` |

### Configuration Files

| File | Description |
|------|-------------|
| `_bmad/core/config.yaml` | Framework settings |
| `_bmad/_config/llm-config.yaml` | LLM provider routing |
| `_bmad/core/security/rbac-config.yaml` | Role-based access control |
| `_bmad/[module]/config.yaml` | Module-specific settings |
| `_bmad/[module]/manifest.yaml` | Module permissions |

### Output Locations

| Module | Default Output |
|--------|---------------|
| Core | `_bmad/core/output/` |
| Cybersec | `_bmad/cybersec-team/output/` |
| Intel | `_bmad/intel-team/output/` |
| Strategy | `_bmad/strategy-team/output/` |
| Legal | `_bmad/legal-team/output/` |
| BMM | `src/`, `tests/`, `docs/` |

---

## Common Patterns

### Starting a Security Assessment

```bash
# 1. Invoke security architect
/security-architect

# 2. Select Security Review workflow
> SR

# 3. Follow guided workflow steps
```

### Running an Intelligence Campaign

```bash
# 1. Invoke intelligence director
/intel-team:osint-lead

# 2. Select campaign type
> Operation Mosaic

# 3. Vector coordinates multi-INT collection
```

### Strategic Decision with Multiple Perspectives

```bash
# 1. Invoke master strategist
/strategy-team:the-master-strategist

# 2. Open Party Mode
> PM

# 3. Select strategic-council preset
> strategic-council

# 4. All 8 archetypes debate the decision
```

### Cross-Module Collaboration

```bash
# 1. Invoke primary agent
/security-architect

# 2. Open Party Mode
> PM

# 3. Add agents from other modules
> Select: legal-team:counsel, strategy-team:policy-analyst

# 4. Collaborate on security policy with legal and strategic input
```

---

## Troubleshooting

### Agent Not Found

```bash
# List available agents
ls _bmad/[module]/agents/

# Check Claude commands directory
ls .claude/commands/bmad/[module]/agents/
```

### Workflow Not Found

```bash
# List available workflows
ls _bmad/[module]/workflows/

# Load workflow directly
Load workflow: _bmad/[module]/workflows/[name]/workflow.md
```

### Permission Denied

```bash
# Check RBAC role
node _bmad/core/security/check-authorization.js

# Verify token is set
echo $BMAD_AUTH_TOKEN
```

### Provider Connection Failed

```bash
# Check provider status
.claude/hooks/llm-provider-manager.sh health-all

# Switch to working provider
.claude/hooks/llm-provider-manager.sh set claude
```

---

## Related Documentation

- [GETTING-STARTED.md](GETTING-STARTED.md) - Installation and quick start
- [MODULES-OVERVIEW.md](MODULES-OVERVIEW.md) - Module descriptions
- [CONFIGURATION-GUIDE.md](CONFIGURATION-GUIDE.md) - Configuration options
- [PARTY-MODE-GUIDE.md](PARTY-MODE-GUIDE.md) - Multi-agent collaboration
- [LLM-PROVIDER-SYSTEM.md](LLM-PROVIDER-SYSTEM.md) - Provider configuration
