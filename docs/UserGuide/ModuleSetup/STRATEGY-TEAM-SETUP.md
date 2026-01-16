# Strategy-Team Module Setup

Complete setup guide for the BMAD-CYBER2 Strategy Team module.

---

## Overview

The Strategy-Team module provides 14 specialized strategic advisors combining modern consultants and historical leadership archetypes. Designed for multi-perspective strategic analysis, decision-making, and executive advisory.

| Attribute | Value |
|-----------|-------|
| **Version** | 1.3.0 |
| **Agents** | 14 |
| **Workflows** | 16 |
| **Archetypes** | 8 historical leaders + 6 modern advisors |

---

## Prerequisites

- BMAD-CYBER2 framework installed
- Claude Code CLI (Sonnet 4.5+ or Opus 4.5)
- **Optional:** Local LLM for highly sensitive strategic decisions

---

## Installation

### 1. Verify Module Files

```bash
# Check module directory exists
ls _bmad/strategy-team/

# Expected structure:
# agents/       - 14 agent definitions
# workflows/    - 16 workflow directories
# config.yaml   - Module configuration
# manifest.yaml - Permissions
# README.md     - Module documentation
```

### 2. Configure Module Settings

Edit `_bmad/strategy-team/config.yaml`:

```yaml
# User settings
user_name: "Your Name"
communication_language: "English"
output_folder: "_bmad/strategy-team/output"

# Decision framework preference
default_framework: "multi_perspective"

# YOLO mode (skip confirmations)
yolo_mode: false
```

### 3. Set Up Authentication

```bash
# Generate token with executive or strategy role
node _bmad/core/security/quick-token.js "YourName" "executive" 168

# Set token
export BMAD_AUTH_TOKEN="<generated-token>"
```

### 4. Configure LLM Provider (Optional)

Strategy work can use cloud LLM unless dealing with M&A or highly sensitive matters:

```yaml
# _bmad/_config/llm-config.yaml
# Default to cloud is acceptable for most strategy work
# Override for sensitive operations:
agent_overrides:
  strategy-team/the-realist: ollama   # M&A, competitive intelligence
```

---

## Agents

### Modern Strategic Advisors (6 Agents)

| Agent | Persona | Expertise | Command |
|-------|---------|-----------|---------|
| **Augustus** | Policy Analyst | Evidence-based policy, research synthesis | `/strategy-team:policy-analyst` |
| **Magnus** | Political Strategist | Political navigation, stakeholder mapping | `/strategy-team:political-strategist` |
| **Cicero** | Debate Coach | Rhetoric, argumentation, persuasion | `/strategy-team:debate-coach` |
| **Geneva** | Stakeholder Mediator | Negotiation, mediation, diplomacy | `/strategy-team:stakeholder-mediator` |
| **Sophia** | Ethics Advisor | Ethical frameworks, moral reasoning | `/strategy-team:ethics-advisor` |
| **Giuseppe** | Communications Director | Strategic messaging, crisis communications | `/strategy-team:communications-director` |

### Historical Leadership Archetypes (8 Agents)

| Agent | Archetype | Philosophy | Command |
|-------|-----------|------------|---------|
| **Niccolo** | The Realist | Machiavellian realpolitik, power dynamics | `/strategy-team:the-realist` |
| **Charles** | The Liberator | Lincoln - principled idealism, unity | `/strategy-team:the-liberator` |
| **Maximilien** | The Revolutionary | Robespierre - radical transformation | `/strategy-team:the-revolutionary` |
| **Burke** | The Conservative | Burke - tradition, gradual change | `/strategy-team:the-conservative` |
| **Lee Kuan Yew** | The Technocrat | Systems thinking, pragmatic governance | `/strategy-team:the-technocrat` |
| **Musashi** | The Strategist-Warrior | Timing, adaptability, tactical excellence | `/strategy-team:the-strategist-warrior` |
| **Sun Tzu** | The Master Strategist | Strategic wisdom, winning without fighting | `/strategy-team:the-master-strategist` |
| **Jean-Luc** | The Principled Commander | Picard - principled leadership, diplomacy | `/strategy-team:the-principled-commander` |

---

## Workflows

### Available Workflows (16)

#### Core Strategy

| Workflow | Steps | Purpose |
|----------|-------|---------|
| Strategic Decision Workshop | 12 | Multi-perspective decision analysis |
| Stakeholder Negotiation Prep | 9 | Negotiation strategy development |
| Board Presentation Prep | 8 | Executive presentation preparation |
| Crisis Response Planning | 10 | Crisis communication and response |
| Strategic Planning Session | 11 | Long-term strategic planning |

#### Governance

| Workflow | Steps | Purpose |
|----------|-------|---------|
| Policy Development | 9 | Internal policy creation |
| Conflict Resolution | 7 | Workplace conflict mediation |
| Competitive Warfare | 10 | Competitive strategy planning |
| Corporate Political Game | 8 | Internal politics navigation |

#### Advanced

| Workflow | Steps | Purpose |
|----------|-------|---------|
| Political Risk Assessment | 8 | Political risk evaluation |
| Ethical Dilemma Resolution | 9 | Ethical decision framework |
| Leadership Philosophy | 7 | Personal leadership development |

#### Executive Operations

| Workflow | Steps | Purpose |
|----------|-------|---------|
| M&A Due Diligence | 12 | Merger/acquisition evaluation |
| Leadership Transition Planning | 10 | Succession planning |
| Board Relations Management | 8 | Board engagement strategy |
| Performance Review Preparation | 7 | Executive performance assessment |

---

## First Workflow: Strategic Decision Workshop

The flagship multi-perspective decision analysis.

### Step 1: Launch Agent

```bash
/strategy-team:the-master-strategist
```

Sun Tzu greets you with strategic wisdom.

### Step 2: Invoke Party Mode

```bash
> PM
```

### Step 3: Select Strategic Council Preset

```bash
> strategic-council
```

All 8 archetypes join the session.

### Step 4: Present the Decision

```
Sun: What decision requires the council's wisdom?
> [Describe your strategic decision]
```

### Step 5: Observe Multi-Perspective Debate

Each archetype offers their perspective:
- **Sun Tzu:** Strategic positioning
- **Niccolo:** Power dynamics and realpolitik
- **Burke:** Conservative risk assessment
- **Charles:** Principled considerations
- **Lee Kuan Yew:** Systems analysis
- **Maximilien:** Transformative options
- **Musashi:** Timing and execution
- **Jean-Luc:** Diplomatic solutions

### Step 6: Receive Synthesis

Sun Tzu synthesizes perspectives into actionable recommendations with documented trade-offs.

---

## First Workflow: Crisis Response Planning

For urgent crisis situations.

### Step 1: Launch Agent

```bash
/strategy-team:communications-director
```

Giuseppe (Communications Director) takes the lead.

### Step 2: Select Workflow

```bash
> Crisis Response Planning
# Or: > CR
```

### Step 3: Define the Crisis

```
Giuseppe: Describe the crisis situation.
> [Describe the crisis]
```

### Step 4: Follow Crisis Framework

1. **Situation Assessment** - Understand scope and impact
2. **Stakeholder Mapping** - Identify affected parties
3. **Message Development** - Core messaging framework
4. **Channel Strategy** - Communication channels
5. **Timeline Planning** - Response schedule
6. **Spokesperson Preparation** - Key messages and Q&A
7. **Monitoring Setup** - Track response and sentiment
8. **Recovery Planning** - Post-crisis normalization
9. **Lessons Learned** - Documentation for future
10. **Implementation** - Execute the plan

---

## Module Permissions

From `manifest.yaml`:

```yaml
permissions:
  filesystem:
    read: ["_bmad/strategy-team/**", "docs/**", "_bmad/core/**"]
    write: ["_bmad/strategy-team/output/**"]
  network: true
  shell:
    allowed_commands: []
    blocked_commands: ["*"]
  sensitive_data: false
```

**Key Points:**
- No shell commands allowed
- Network access for research
- Sensitive data flag is FALSE (cloud LLM acceptable by default)
- Limited write permissions

---

## Party Mode Scenarios

### Strategic Council (All 8 Archetypes)

```bash
/strategy-team:the-master-strategist
> PM
> strategic-council
```

**Purpose:** Maximum perspective diversity for major decisions.

### Conservative vs. Revolutionary Debate

```bash
/strategy-team:the-conservative
> PM
> Select: the-revolutionary, policy-analyst
```

**Purpose:** Explore change vs. stability tension.

### Political Navigation

```bash
/strategy-team:political-strategist
> PM
> Select: the-realist, stakeholder-mediator
```

**Purpose:** Navigate complex political dynamics.

### Ethical Decision Making

```bash
/strategy-team:ethics-advisor
> PM
> Select: the-principled-commander, the-liberator
```

**Purpose:** Principled decision framework.

### Cross-Module: Strategy + Security

```bash
/strategy-team:the-master-strategist
> PM
> Select: cybersec-team:security-architect, legal-team:counsel
```

**Purpose:** Strategic planning with security and legal input.

### Cross-Module: M&A with Legal

```bash
/strategy-team:the-realist
> PM
> Select: legal-team:counsel, legal-team:covenant
```

**Purpose:** M&A strategy with legal review.

---

## Data Sensitivity

### When to Use Local LLM

| Content Type | Provider | Rationale |
|--------------|----------|-----------|
| General strategy | Cloud OK | Non-sensitive |
| Board presentations | Either | Depends on content |
| M&A planning | Local | Highly sensitive |
| Competitive intelligence | Local | Competitive advantage |
| Crisis communications | Either | Depends on nature |
| Personnel decisions | Local | HR sensitivity |

### Configure for Sensitive Operations

```yaml
# _bmad/_config/llm-config.yaml
agent_overrides:
  strategy-team/the-realist: ollama      # M&A, competitive
```

---

## Archetype Philosophy Guide

Understanding each archetype helps select the right perspective:

| Archetype | Core Philosophy | Best For |
|-----------|-----------------|----------|
| **Sun Tzu** | Win without fighting | Long-term strategy, positioning |
| **Niccolo** | Power is paramount | Political navigation, tough decisions |
| **Burke** | Preserve what works | Risk assessment, stability |
| **Charles** | Principle over pragmatism | Ethical decisions, unity |
| **Lee Kuan Yew** | Systems and efficiency | Operational excellence |
| **Maximilien** | Transform radically | Disruption, major change |
| **Musashi** | Timing is everything | Execution, tactical decisions |
| **Jean-Luc** | Lead with principle | Diplomacy, stakeholder management |

---

## Troubleshooting

### Agent Not Loading

```bash
# Verify agent file exists
ls _bmad/strategy-team/agents/

# Check command registration
ls .claude/commands/bmad/strategy-team/agents/
```

### Workflow Not Starting

```bash
# Check workflow exists
ls _bmad/strategy-team/workflows/

# Load directly
Load workflow: _bmad/strategy-team/workflows/strategic-decision-workshop/workflow.md
```

### Party Mode Not Engaging All Archetypes

```bash
# Use the preset explicitly
> PM
> strategic-council
```

### Perspectives Too Homogeneous

Ensure you're using diverse archetypes:
```bash
# Good: Mix of philosophies
> Select: the-conservative, the-revolutionary, the-realist

# Less diverse: Similar philosophies
> Select: the-conservative, policy-analyst  # Both cautious
```

---

## Best Practices

1. **Use full council** for major decisions
2. **Mix archetypes** for perspective diversity
3. **Start with Sun Tzu** as coordinator
4. **Document trade-offs** from each perspective
5. **Local LLM for M&A** and competitive intelligence
6. **Cross-module collaboration** for comprehensive analysis
7. **Follow up** with specific workflows after council input

---

## Related Documentation

- [CLI-COMMAND-REFERENCE.md](../CLI-COMMAND-REFERENCE.md) - Command syntax
- [PARTY-MODE-GUIDE.md](../PARTY-MODE-GUIDE.md) - Multi-agent collaboration
- [DATA-SENSITIVITY-GUIDE.md](../DATA-SENSITIVITY-GUIDE.md) - LLM routing decisions
- [LLM-PROVIDER-SYSTEM.md](../LLM-PROVIDER-SYSTEM.md) - Provider configuration
- [Module README](_bmad/strategy-team/README.md) - Detailed module documentation
