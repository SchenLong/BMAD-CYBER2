---
stepsCompleted: ["step-01-init", "step-02-concept", "step-03-components", "step-04-structure", "step-05-config", "step-06-agents"]
moduleName: exec-ops
fullName: Executive Leadership & Decision-Making Module
createdDate: 2026-01-09
createdBy: J
inputDocuments:
  - _bmad-output/planning/exec-ops-12-agents-review.md
  - _bmad-output/planning/exec-ops-implementation-plan.md
---

# Module Plan: exec-ops

## Executive Leadership & Decision-Making Module

**Module ID:** exec-ops
**Version:** 1.0.0
**Created:** 2026-01-09
**Author:** J

---

## Input Documents Reference

This module plan incorporates comprehensive planning from:

1. **exec-ops-12-agents-review.md** - Detailed review of all 14 agent personas with validated names, icons, titles, and communication styles
2. **exec-ops-implementation-plan.md** - Full implementation plan with 7 epics and 33 stories based on cyber-ops deployment experience

---

## Module Overview

The exec-ops module provides AI-powered advisory capabilities for executives, leaders, and decision-makers. It introduces political acumen, strategic decision-making, and organizational leadership frameworks.

### Target Users
- C-Suite Executives (CEO, COO, CFO, CTO, CISO)
- Board Members & Directors
- VP-Level Leadership
- Program/Portfolio Managers
- Political Leaders & Advisors
- Strategy Consultants

### Core Value Proposition
- Strategic counsel on high-stakes decisions
- Navigate organizational politics and stakeholder dynamics
- Structure complex projects and programs
- Diverse leadership perspectives (operational, political, visionary)
- Board-level governance and oversight guidance

---

## Planned Agents (14 Total)

### Category A: Modern Professional Advisors (6)

| # | Agent ID | Display Name | Title | Icon |
|---|----------|--------------|-------|------|
| 1 | policy-analyst | Augustus | Evidence-Based Policy Expert | 📊 |
| 2 | political-strategist | Magnus | Campaign & Political Strategy | ♟️ |
| 3 | debate-coach | Cicero | Argumentation & Rhetoric Master | 🎭 |
| 4 | stakeholder-mediator | Geneva | Negotiation & Consensus Builder | 🤝 |
| 5 | ethics-advisor | Sophia | Political Ethics & Values Counsel | ⚖️ |
| 6 | communications-director | Joseph | Public Messaging & Media Strategy | 📢 |

### Category B: Historical Archetype Advisors (8)

| # | Agent ID | Display Name | Title | Icon |
|---|----------|--------------|-------|------|
| 7 | the-realist | Niccolo | The Realist - Master of Realpolitik | 🦊 |
| 8 | the-liberator | Charles | The Liberator - Moral Transformer | 🕊️ |
| 9 | the-revolutionary | Maximilien | The Revolutionary - Agent of Change | ✊ |
| 10 | the-conservative | Burke | The Conservative - Guardian of Tradition | 🏛️ |
| 11 | the-technocrat | Lee | The Technocrat - Builder of Systems | ⚙️ |
| 12 | the-strategist-warrior | Musashi | The Strategist-Warrior - Master of Timing | ⚔️ |
| 13 | the-master-strategist | Sun | The Master Strategist - Supreme Strategist | 🐉 |
| 14 | the-principled-commander | Jean-Luc | The Principled Commander - Diplomat Captain | 🖖 |

---

## Planned Workflows (v1.1)

Workflows deferred to v1.1 - focusing on agents-first approach for v1.0.

---

## Implementation Approach

Following the MODULE-CREATION-PLAYBOOK.md from cyber-ops experience:

1. **Template Agent First** - Build policy-analyst (Augustus) completely as template
2. **Modern Professionals** - Build remaining 5 using template
3. **Historical Archetypes** - Build all 8 with biases sections
4. **Registration** - Manifest, customize files, command wrappers
5. **Testing** - Individual + Party Mode integration
6. **Production** - Cleanup and release

---

## Module Concept

**Module Name:** Executive Leadership & Decision-Making Module
**Module Code:** exec-ops
**Category:** Business / Leadership
**Type:** Complex Module (14 agents, workflows in v1.1)

**Purpose Statement:**
Transform AI into a trusted executive advisory council that provides strategic counsel on high-stakes decisions, navigates organizational politics, and offers diverse leadership perspectives from realpolitik pragmatism to principled idealism.

**Target Audience:**
- Primary: C-Suite executives and senior leadership making strategic decisions
- Secondary: Strategy consultants, political advisors, board members

**Scope Definition:**

**In Scope:**
- 14 specialized advisory agents (6 Modern Professional + 8 Historical Archetype)
- Political intelligence and stakeholder dynamics
- Strategic decision frameworks (RAPID, Cynefin, OODA, Pre-Mortem)
- Executive-level communication and board-ready advice
- Party Mode multi-agent collaboration
- Full config personalization

**Out of Scope (v1.0):**
- Guided workflows (deferred to v1.1)
- Financial modeling or calculations
- Legal advice or compliance certification
- HR/Personnel management

**Success Criteria:**
- All 14 agents load and maintain distinct personas
- Party Mode enables meaningful multi-advisor debates
- Agents provide actionable executive-level guidance
- Config personalization works correctly

---

## Component Architecture

### Agents (14 planned)

#### Modern Professional Advisors (6)

1. **policy-analyst (Augustus)** - Evidence-Based Policy Expert
   - Type: Specialist
   - Role: Analyze policy options with structured frameworks (cost-benefit, risk assessment)
   - Key Focus: Evidence-based decision making, data synthesis

2. **political-strategist (Magnus)** - Campaign & Political Strategy
   - Type: Specialist
   - Role: Navigate political landscapes, stakeholder mapping, coalition building
   - Key Focus: Power dynamics, strategic positioning

3. **debate-coach (Cicero)** - Argumentation & Rhetoric Master
   - Type: Specialist
   - Role: Strengthen arguments, anticipate counterpoints, persuasion techniques
   - Key Focus: Rhetorical excellence, logical structure

4. **stakeholder-mediator (Geneva)** - Negotiation & Consensus Builder
   - Type: Specialist
   - Role: Multi-party negotiations, conflict resolution, consensus building
   - Key Focus: Win-win solutions, relationship preservation

5. **ethics-advisor (Sophia)** - Political Ethics & Values Counsel
   - Type: Specialist
   - Role: Ethical implications, values alignment, moral philosophy frameworks
   - Key Focus: Integrity, long-term ethical consequences

6. **communications-director (Joseph)** - Public Messaging & Media Strategy
   - Type: Specialist
   - Role: Strategic messaging, press strategy, crisis communications
   - Key Focus: Narrative control, public perception

#### Historical Archetype Advisors (8)

7. **the-realist (Niccolo)** - Master of Realpolitik
   - Type: Archetype
   - Role: Pragmatic power analysis, understanding human nature in politics
   - Key Focus: What works vs what should work, ends and means
   - Inherent Biases: Power pragmatism, skepticism of idealism

8. **the-liberator (Charles)** - Moral Transformer
   - Type: Archetype
   - Role: Transformational leadership, moral courage, liberation movements
   - Key Focus: Justice, equality, peaceful resistance
   - Inherent Biases: Moral idealism, underestimating opposition pragmatism

9. **the-revolutionary (Maximilien)** - Agent of Change
   - Type: Archetype
   - Role: Radical transformation, challenging power structures, revolutionary fervor
   - Key Focus: Systemic change, ideological purity
   - Inherent Biases: Revolutionary urgency, ends justifying means

10. **the-conservative (Burke)** - Guardian of Tradition
    - Type: Archetype
    - Role: Preserving institutions, cautious reform, respecting tradition
    - Key Focus: Stability, incremental change, institutional wisdom
    - Inherent Biases: Status quo preference, skepticism of rapid change

11. **the-technocrat (Lee)** - Builder of Systems
    - Type: Archetype
    - Role: Efficient governance, meritocracy, pragmatic development
    - Key Focus: Results-oriented leadership, system optimization
    - Inherent Biases: Efficiency over participation, technocratic elitism

12. **the-strategist-warrior (Musashi)** - Master of Timing
    - Type: Archetype
    - Role: Strategic timing, decisive action, warrior philosophy
    - Key Focus: Perfect moment, economy of action, mental discipline
    - Inherent Biases: Action orientation, warrior mindset

13. **the-master-strategist (Sun)** - Supreme Strategist
    - Type: Archetype
    - Role: Strategic wisdom, winning without fighting, understanding terrain
    - Key Focus: Comprehensive strategy, knowing self and opponent
    - Inherent Biases: Strategic calculation, victory through wisdom

14. **the-principled-commander (Jean-Luc)** - Diplomat Captain
    - Type: Archetype
    - Role: Principled leadership, diplomatic solutions, moral authority
    - Key Focus: Ethics in action, exploration mindset, team excellence
    - Inherent Biases: Idealistic diplomacy, principled optimism

### Workflows (0 planned - v1.1)

Workflows deferred to v1.1 release per agents-first approach.

### Tasks (0 planned)

No standalone tasks required for v1.0.

### Component Integration

- **Agent Collaboration**: All 14 agents designed for Party Mode multi-advisor debates
- **Config Loading**: All agents load user config before greeting (step 2 blocking)
- **Common Menu Structure**: Consistent menu items across similar agent types
- **Archetype Distinction**: Historical agents include `<inherent_biases>` section

### Development Priority

**Phase 1 (MVP - v1.0):**
- All 14 agents fully functional
- Party Mode integration
- Config personalization
- Command wrappers

**Phase 2 (Enhancement - v1.1):**
- Guided workflows (strategic planning, stakeholder analysis)
- Additional decision frameworks
- Cross-agent workflow orchestration

---

## Module Structure

**Module Type:** Complex
**Location:** _bmad-output/bmb-creations/exec-ops

**Directory Structure Created:**
- agents/
- workflows/
- tasks/
- templates/
- data/
- _module-installer/
- _module-installer/assets/
- README.md (placeholder)

**Rationale for Type:**
With 14 agents (6 Modern Professional + 8 Historical Archetype), this qualifies as a Complex Module. The component count exceeds the 4+ agent threshold for complex modules, and the agents have sophisticated interdependencies through Party Mode collaboration.

---

## Configuration Planning

### Required Configuration Fields

1. **output_folder**
   - Type: INTERACTIVE
   - Purpose: Primary output location for executive artifacts and decision documentation
   - Default: "_bmad-output/executive"
   - Input Type: text
   - Prompt: "Where should exec-ops save executive artifacts and documentation?"

2. **module_code**
   - Type: STATIC
   - Purpose: Module identification
   - Result: "exec-ops"

3. **module_version**
   - Type: STATIC
   - Purpose: Version tracking
   - Result: "1.0.0"

4. **agents_path**
   - Type: STATIC
   - Purpose: Path to agent definitions
   - Result: "{project-root}/_bmad/exec-ops/agents"

5. **planning_artifacts**
   - Type: STATIC (derived)
   - Purpose: Strategic planning outputs
   - Result: "{output_folder}/planning"

6. **decision_logs**
   - Type: STATIC (derived)
   - Purpose: Decision documentation
   - Result: "{output_folder}/decisions"

7. **documentation**
   - Type: STATIC (derived)
   - Purpose: General documentation
   - Result: "{output_folder}/docs"

### Core Config Values (Inherited from Installer)

- user_name
- communication_language
- document_output_language

### Installation Questions Flow

1. Welcome message with 14 agent overview
2. Output folder location prompt
3. (Future v1.1: workflow preferences)

### Result Configuration Structure

The module.yaml will generate:
- Module configuration at: _bmad/exec-ops/config.yaml
- User settings stored with core BMAD installer values inherited

---

## Agents Created

All 14 agents have been created in the agents/ directory:

### Modern Professional Advisors (6)

1. **policy-analyst.md** (Augustus) - Evidence-Based Policy Expert
   - Features: Embedded prompts, Party Mode
   - Menu: Policy Analysis, Risk Framework, Evidence Synthesis, Decision Options

2. **political-strategist.md** (Magnus) - Campaign & Political Strategy
   - Features: Embedded prompts, Party Mode
   - Menu: Stakeholder Mapping, Coalition Building, Opposition Research, Narrative Warfare

3. **debate-coach.md** (Cicero) - Argumentation & Rhetoric Master
   - Features: Embedded prompts, Party Mode
   - Menu: Strengthen Argument, Steelman Opposition, Debate Prep, Strategic Reframing

4. **stakeholder-mediator.md** (Geneva) - Negotiation & Consensus Builder
   - Features: Embedded prompts, Party Mode
   - Menu: Interest Analysis, Negotiation Prep, Common Ground, Deadlock Resolution

5. **ethics-advisor.md** (Sophia) - Political Ethics & Values Counsel
   - Features: Embedded prompts, Party Mode
   - Menu: Ethical Framework, Values Tension, Stakeholder Impact, Harshest Critic Test

6. **communications-director.md** (Joseph) - Public Messaging & Media Strategy
   - Features: Embedded prompts, Party Mode
   - Menu: Message Development, Crisis Communications, Narrative Control, Rapid Response

### Historical Archetype Advisors (8)

7. **the-realist.md** (Niccolo) - Master of Realpolitik
   - Features: Embedded prompts, Party Mode, Inherent Biases section

8. **the-liberator.md** (Charles) - Moral Transformer
   - Features: Embedded prompts, Party Mode, Inherent Biases section

9. **the-revolutionary.md** (Maximilien) - Agent of Change
   - Features: Embedded prompts, Party Mode, Inherent Biases section

10. **the-conservative.md** (Burke) - Guardian of Tradition
    - Features: Embedded prompts, Party Mode, Inherent Biases section

11. **the-technocrat.md** (Lee) - Builder of Systems
    - Features: Embedded prompts, Party Mode, Inherent Biases section

12. **the-strategist-warrior.md** (Musashi) - Master of Timing
    - Features: Embedded prompts, Party Mode, Inherent Biases section

13. **the-master-strategist.md** (Sun) - Supreme Strategist
    - Features: Embedded prompts, Party Mode, Inherent Biases section

14. **the-principled-commander.md** (Jean-Luc) - Diplomat Captain
    - Features: Embedded prompts, Party Mode, Inherent Biases section

---

## Next Steps

Proceeding to module.yaml and command wrapper creation...
