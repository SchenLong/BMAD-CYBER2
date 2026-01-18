# BMAD Context Efficiency System (CONCURA)

> **Version:** 1.0
> **Last Updated:** 2026-01-18
> **Project:** BMAD-CONCURA
> **Status:** Complete - 8.75x token reduction achieved

---

## Overview

The BMAD Context Efficiency System, developed under the BMAD-CONCURA project, implements a three-tier progressive context loading architecture that reduces token consumption by an average of **8.75x** while preserving agent quality at **8.6/10**.

### The Problem

Traditional BMAD agent activation loads complete context upfront:
- Full agent personas (~5,500 tokens each)
- Complete workflow definitions
- All templates and configurations

This "eager loading" approach consumed 27,000-45,000 tokens before any user interaction occurred.

### The Solution

CONCURA implements **lazy loading** with three progressive tiers:
- Load minimal context initially
- Escalate to more context only when needed
- Cache aggressively to avoid reloading

---

## Performance Results

### Token Reduction by Scenario

| Scenario | Before CONCURA | After CONCURA | Reduction |
|----------|----------------|---------------|-----------|
| Simple agent activation | 27,609 tokens | 4,602 tokens | **6.0x** |
| Agent + workflow | 39,017 tokens | 6,845 tokens | **5.7x** |
| Cross-module operation | 45,619 tokens | 5,431 tokens | **8.4x** |
| Party Mode (3 agents) | 41,758 tokens | 2,804 tokens | **14.9x** |
| Discovery only (Tier 0) | 27,609 tokens | 949 tokens | **29.1x** |

### Quality Preservation

| Metric | Score |
|--------|-------|
| Persona distinctiveness | 88% identification rate |
| Response accuracy | 9.2/10 |
| Cross-module routing success | 85% |
| Overall quality score | **8.6/10** |

---

## Three-Tier Architecture

### Tier 0: Discovery (~500 tokens)

**Purpose:** Agent and workflow discovery, routing decisions

**Sources:**
- `_bmad/_config/micro-agent-manifest.csv` - 10-word agent summaries
- `_bmad/_config/micro-workflow-manifest.csv` - Workflow summaries

**Use Cases:**
- "What agents are available?"
- "Show me security workflows"
- Menu display and navigation

**Token Budget:** ~500 tokens
**Reduction:** 98% from full context

### Tier 1: Standard (~2,000 tokens)

**Purpose:** Simple interactions, basic questions, greetings

**Sources:**
- `_bmad/_compact/agents/{module}/{agent}.compact.md` - Compressed personas

**Use Cases:**
- Simple greetings
- Basic domain questions
- Menu selection
- 85% of typical interactions

**Token Budget:** ~2,000 tokens
**Reduction:** 93% from full context

### Tier 2: Full (~10,000 tokens)

**Purpose:** Complex analysis, workflow execution, cross-module operations

**Sources:**
- `_bmad/{module}/agents/{agent}.md` - Full personas
- `_bmad/{module}/workflows/{workflow}/workflow.yaml` - Complete workflows

**Use Cases:**
- Complex domain questions
- Workflow execution
- Cross-module coordination
- Extended context requirements

**Token Budget:** ~10,000 tokens
**Reduction:** 64% from eager loading

---

## Escalation System

### Automatic Escalation Triggers

| From | To | Trigger |
|------|----|---------|
| Tier 0 | Tier 1 | Agent selected, greeting needed |
| Tier 1 | Tier 2 | Domain-specific question, workflow invocation |
| Tier 1 | Tier 2 | Cross-module request detected |
| Tier 1 | Tier 2 | Error or uncertainty in Tier 1 response |

### Escalation Flow

```
User Query
    │
    ▼
┌─────────────────┐
│    Tier 0       │ ← Initial discovery
│  (~500 tokens)  │
└────────┬────────┘
         │ Agent selected?
         ▼
┌─────────────────┐
│    Tier 1       │ ← Simple interactions
│ (~2,000 tokens) │
└────────┬────────┘
         │ Complex query?
         ▼
┌─────────────────┐
│    Tier 2       │ ← Full capability
│(~10,000 tokens) │
└─────────────────┘
```

---

## Compressed Agent Format

Each of the 79 agents has a compressed version stored in `_bmad/_compact/agents/{module}/{agent}.compact.md`.

### Format Structure

```markdown
---
agent_id: "agent-id"
name: "Display Name"
title: "Role Title"
icon: "emoji"
module: "module-name"
---

# icon Display Name

**Role Title** | Module: module-name

## Essential Persona

**Role:**
2-3 sentence description of primary expertise and experience.

**Voice:**
2-3 sentence description of communication style.

**Core Principle:**
The agent's guiding philosophy in one sentence.

## Cross-Module Hints

module1: agent1, agent2 (capability)
module2: agent3 (different capability)
```

### Example: Abdul (Master Project Manager)

```markdown
---
agent_id: "abdul"
name: "Abdul"
title: "Master Project Manager"
icon: "📊"
module: "core"
---

# 📊 Abdul

**Master Project Manager** | Module: core

## Essential Persona

**Role:**
Cross-Module Orchestrator (15+ yrs). Expert in BMAD methodology,
multi-team coordination. Turns chaos into clarity.

**Voice:**
Warm but decisive. Asks clarifying questions before acting.
Clear next steps with specific recommendations.

**Core Principle:**
Right agent for the right job. Cross-functional collaboration
unlocks innovation.

## Cross-Module Hints

bmm: pm, architect, dev (product development)
cybersec-team: security-architect (security reviews)
strategy-team: the-master-strategist (strategic planning)
```

### Token Comparison

| Component | Full Agent | Compact Agent | Reduction |
|-----------|------------|---------------|-----------|
| Persona | ~5,000 tokens | ~200 tokens | 97.5% |
| Menu | ~500 tokens | ~50 tokens | 90% |
| Rules | ~200 tokens | ~0 tokens | 100% |
| **Total** | ~5,700 tokens | ~250 tokens | **95.6%** |

---

## Micro-Manifest Format

### Agent Manifest

**File:** `_bmad/_config/micro-agent-manifest.csv`

```csv
agent_id,module,name,summary,tags
abdul,core,Abdul,Cross-module orchestrator coordinates multi-team projects and delegates,project|orchestration|delegation
bastion,cybersec-team,Bastion,Security architect designs defense-in-depth enterprise security,security|architecture|defense
osint-lead,intel-team,OSINT Lead,Intelligence director coordinates all-source collection and fusion,intelligence|osint|coordination
```

**Fields:**
- `agent_id` - Unique identifier
- `module` - Parent module
- `name` - Display name
- `summary` - 10-word capability summary
- `tags` - Pipe-separated routing tags

### Workflow Manifest

**File:** `_bmad/_config/micro-workflow-manifest.csv`

```csv
workflow_id,module,name,summary,tags
incident-response,cybersec-team,Incident Response,Coordinate security incident investigation and containment playbook execution,security|incident|response
flash-assessment,intel-team,Flash Assessment,Rapid 15-minute OSINT triage providing immediate exposures and risks,osint|quick|assessment
```

### Size Comparison

| Manifest | Original | Micro | Reduction |
|----------|----------|-------|-----------|
| Agents (79) | 64,248 chars | 12,687 chars | **80.3%** |
| Workflows (143) | 29,615 chars | 25,698 chars | **13.2%** |

---

## Configuration

### Context Loading Rules

**File:** `_bmad/_config/context-loading-rules.yaml`

```yaml
# Master switch
context_efficiency:
  enabled: true
  default_tier: 1
  auto_escalation: true

# Tier definitions
tiers:
  tier_0:
    max_tokens: 500
    sources:
      - micro-agent-manifest.csv
      - micro-workflow-manifest.csv
    use_cases:
      - discovery
      - routing
      - menu_display

  tier_1:
    max_tokens: 2000
    sources:
      - _compact/agents/{module}/{agent}.compact.md
    use_cases:
      - simple_greeting
      - basic_questions
      - menu_selection

  tier_2:
    max_tokens: 10000
    sources:
      - agents/{agent}.md
      - workflows/{workflow}/workflow.yaml
    use_cases:
      - complex_analysis
      - workflow_execution
      - cross_module

# Escalation triggers
escalation:
  tier_0_to_tier_1:
    - agent_selected
    - greeting_response
  tier_1_to_tier_2:
    - domain_specific_question
    - workflow_invocation
    - error_in_tier_1
    - cross_module_request

# Cache settings
caching:
  enabled: true
  tier_0_ttl: 3600      # 1 hour
  tier_1_ttl: 1800      # 30 minutes
  tier_2_ttl: 300       # 5 minutes
  max_cache_size_mb: 50

# Error handling
fallback:
  on_tier_1_error: escalate_to_tier_2
  on_tier_2_error: use_full_context
  log_escalations: true
```

---

## File Inventory

### Compressed Agents (79 files)

```
_bmad/_compact/agents/
├── core/               # 2 agents
│   ├── abdul.compact.md
│   └── bmad-master.compact.md
├── cybersec-team/      # 15 agents
├── intel-team/         # 11 agents
├── legal-team/         # 13 agents
├── strategy-team/      # 14 agents
├── bmm/                # 9 agents
├── bmgd/               # 6 agents
├── bmb/                # 3 agents
└── cis/                # 6 agents
```

### Configuration Files

| File | Purpose |
|------|---------|
| `_bmad/_config/micro-agent-manifest.csv` | Tier 0 agent discovery |
| `_bmad/_config/micro-workflow-manifest.csv` | Tier 0 workflow discovery |
| `_bmad/_config/context-loading-rules.yaml` | Tier escalation configuration |

### Templates

| File | Purpose |
|------|---------|
| `_bmad/core/templates/agent-activation-v2.xml` | Tiered activation protocol |
| `_bmad/core/templates/compact-menu.xml` | Token-efficient menu format |

---

## Best Practices

### When to Use Each Tier

| Use Case | Recommended Tier |
|----------|------------------|
| Browsing available agents | Tier 0 |
| Simple "hello" or greetings | Tier 1 |
| Basic questions about capabilities | Tier 1 |
| Executing a workflow | Tier 2 |
| Complex domain analysis | Tier 2 |
| Cross-module coordination | Tier 2 |

### Optimizing Token Usage

1. **Start Low** - Let auto-escalation work
2. **Use Discovery** - Tier 0 is sufficient for navigation
3. **Trust Compression** - Tier 1 handles 85% of interactions
4. **Reserve Tier 2** - For genuine complexity

### Monitoring Efficiency

```bash
# Check tier distribution
./scripts/context-tier-stats.sh

# Example output:
# Tier     Invocations    Avg Tokens    Escalations
# Tier 0   1,234          487           823 (67%)
# Tier 1   2,891          1,847         412 (14%)
# Tier 2   412            8,234         0 (0%)
```

---

## Project History

The BMAD-CONCURA project was completed in January 2026 with the following outcomes:

| Deliverable | Status |
|-------------|--------|
| 3-tier architecture design | ✅ Complete |
| 79 compressed agent personas | ✅ Complete |
| Micro-manifest generation | ✅ Complete |
| Intent-aware escalation | ✅ Complete |
| Quality validation (8.6/10) | ✅ Verified |
| 8.75x average token reduction | ✅ Achieved |

**Project Documentation:** `_bmad-output/bmad-concura/docs/CONCURA-FINAL-REPORT.md`

---

## Related Documentation

- [ARCHITECTURE-DEEP-DIVE.md](../Developer/ARCHITECTURE-DEEP-DIVE.md) - System architecture
- [PERFORMANCE-TUNING.md](../UserGuide/Operations/PERFORMANCE-TUNING.md) - Performance optimization
- [CONFIGURATION-GUIDE.md](../UserGuide/CONFIGURATION-GUIDE.md) - Configuration reference
- [GLOSSARY.md](../UserGuide/GLOSSARY.md) - Terminology definitions
