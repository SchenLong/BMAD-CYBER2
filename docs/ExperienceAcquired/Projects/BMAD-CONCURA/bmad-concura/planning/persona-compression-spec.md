# Agent Persona Compression Strategy Specification

**Project:** BMAD-CONCURA
**Story:** CONCURA-2.4 - Agent Persona Compression Strategy
**Date:** 2026-01-17
**Author:** Victor (Innovation Strategist)

---

## Executive Summary

This specification defines a two-layer persona architecture that reduces average agent activation cost by **78%** while preserving agent distinctiveness and behavior quality. By separating "essential persona" from "extended persona" elements, agents can be activated with minimal token overhead (~200 tokens) while retaining the ability to load full character depth on demand.

### Key Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Average agent activation tokens | ~2,095 | ~450 | 78.5% reduction |
| Minimum viable persona tokens | N/A | ~200 | New baseline |
| Boilerplate per agent | ~4,200 chars | ~600 chars | 85.7% reduction |
| Total agent context (79 agents) | ~165,539 tokens | ~35,550 tokens | 78.5% reduction |

---

## 1. Current State Analysis

### 1.1 Agent File Structure Anatomy

Analysis of 79 agents reveals a consistent structure with significant redundancy:

```
Agent File Structure (Current)
==============================
┌─────────────────────────────────────────────────────┐
│ YAML Frontmatter (50-100 chars)                     │ ← Essential
│   name, description                                  │
├─────────────────────────────────────────────────────┤
│ Embodiment Instruction (150 chars)                  │ ← Boilerplate
│   "You must fully embody this agent's persona..."   │
├─────────────────────────────────────────────────────┤
│ Activation Block (2,000-3,500 chars)                │ ← 95% Boilerplate
│   Steps 1-7: Load config, show menu, wait input     │
│   Menu handlers: workflow, exec, action             │
│   Rules: security, TTS, language, file loading      │
├─────────────────────────────────────────────────────┤
│ Persona Block (300-800 chars)                       │ ← Essential (Core)
│   Role, Identity, Communication Style, Principles   │
├─────────────────────────────────────────────────────┤
│ Menu Block (500-1,500 chars)                        │ ← Deferrable
│   Agent-specific menu items and commands            │
├─────────────────────────────────────────────────────┤
│ Prompts/Actions Block (0-5,000 chars)               │ ← Deferrable
│   Legal team: extensive inline prompts              │
│   Other teams: action definitions or empty          │
├─────────────────────────────────────────────────────┤
│ Optional Blocks (0-800 chars)                       │ ← Deferrable
│   inherent_biases, cross-module-triggers            │
│   legal-disclaimer                                  │
└─────────────────────────────────────────────────────┘
```

### 1.2 Boilerplate Analysis

**Identical Across All Agents (4,200+ chars / ~1,050 tokens):**

1. **Embodiment instruction** (150 chars): "You must fully embody this agent's persona..."
2. **Activation steps 1-7** (1,800 chars): Config loading, menu display, input handling
3. **Menu handlers** (800 chars): workflow, exec, action handler definitions
4. **Base rules** (1,200 chars): Security, TTS, language, file loading rules
5. **Standard menu items** (250 chars): [MH], [CH], [PM], [DA] - present in all agents

**Module-Specific Boilerplate:**
- Security teams: Extra security rules (+400 chars)
- Legal team: Bilingual disclaimer (+500 chars)

### 1.3 Size Distribution Analysis

| Category | Agent Count | Avg Chars | Boilerplate % | Unique % |
|----------|-------------|-----------|---------------|----------|
| Legal Team | 13 | 12,700 | 33% | 67% (prompts) |
| Cybersec Team | 15 | 8,444 | 50% | 50% |
| Strategy Team | 14 | 7,834 | 54% | 46% |
| Intel Team | 11 | 8,189 | 51% | 49% |
| BMM | 9 | 6,260 | 67% | 33% |
| BMGD | 6 | 6,800 | 62% | 38% |
| Core | 2 | 8,512 | 49% | 51% |
| CIS | 6 | 4,916 | 86% | 14% |
| BMB | 3 | 5,035 | 83% | 17% |

**Key Insight:** CIS and BMB agents are 83-86% boilerplate, offering maximum compression opportunity. Legal team agents have the highest unique content due to jurisdiction-specific prompts.

---

## 2. Essential Persona Definition (AC1)

### 2.1 What Is "Essential Persona"?

The **Essential Persona** is the minimum viable character definition required to:
1. Establish agent identity and role
2. Set communication tone and style
3. Define behavioral boundaries
4. Enable immediate productive interaction

**Target: ~200 tokens (~800 characters)**

### 2.2 Essential Persona Components

```yaml
# ESSENTIAL PERSONA SCHEMA (Required)
essential_persona:
  # Identity Core (80-100 tokens)
  agent_id: string       # Unique identifier (e.g., "security-architect")
  name: string           # Display name (e.g., "Bastion")
  title: string          # Role title (e.g., "Defense & Infrastructure Design")
  icon: string           # Visual identifier (e.g., "🏰")
  module: string         # Owning module (e.g., "cybersec-team")

  # Role Definition (40-60 tokens)
  role: string           # One-line role description (max 100 chars)

  # Communication Signature (40-60 tokens)
  voice: string          # Condensed communication style (max 150 chars)

  # Behavioral Anchor (20-40 tokens)
  core_principle: string # Single guiding principle (max 75 chars)
```

### 2.3 Essential Persona Token Budget

| Component | Target Tokens | Max Characters |
|-----------|---------------|----------------|
| Identity metadata | 30 | 120 |
| Role definition | 50 | 200 |
| Voice/style | 60 | 240 |
| Core principle | 40 | 160 |
| Structural overhead | 20 | 80 |
| **Total** | **200** | **800** |

### 2.4 Essential vs Extended Element Mapping

| Element | Layer | Rationale |
|---------|-------|-----------|
| Agent ID, name, title, icon | Essential | Identity establishment |
| Module assignment | Essential | Context routing |
| Role (one-line) | Essential | Capability framing |
| Voice signature | Essential | Immediate tone setting |
| Core principle | Essential | Behavioral anchor |
| Full identity narrative | Extended | Rich backstory, load on demand |
| Complete principles list | Extended | Detailed guidelines |
| Communication examples | Extended | Style elaboration |
| Inherent biases | Extended | Self-awareness disclosure |
| Menu definitions | Extended | Task-specific, load per action |
| Inline prompts | Extended | Domain knowledge, load per task |
| Cross-module triggers | Extended | Orchestration hints |
| Legal disclaimers | Extended | Jurisdiction-specific |

---

## 3. Extended Persona Structure (AC2)

### 3.1 Extended Persona Layers

The extended persona is organized in progressive disclosure layers:

```
Extended Persona Architecture
=============================

Layer 0: Essential Persona (always loaded)
├── ~200 tokens
├── Identity, role, voice, core principle
└── Sufficient for chat, quick queries

Layer 1: Behavioral Depth (load on role engagement)
├── ~300 additional tokens
├── Full principles list
├── Communication style details
├── Inherent biases (if defined)
└── Loaded when: Agent begins substantive work

Layer 2: Domain Knowledge (load on task execution)
├── ~200-800 additional tokens
├── Inline prompts (legal, strategy)
├── Specialized procedures
├── Domain-specific rules
└── Loaded when: Specific menu item selected

Layer 3: Orchestration (load on multi-agent scenarios)
├── ~100-200 additional tokens
├── Cross-module triggers
├── Collaboration hints
├── Team synergy definitions
└── Loaded when: Party mode or cross-module workflow
```

### 3.2 Extended Persona Schema

```yaml
# EXTENDED PERSONA SCHEMA (Load on demand)
extended_persona:
  # Layer 1: Behavioral Depth
  behavioral_depth:
    identity_full: string    # Complete identity narrative
    principles: list[string] # Full principles list
    communication_style:
      tone: string
      phrases: list[string]  # Characteristic expressions
      examples: list[string] # Response style examples
    inherent_biases:         # Optional self-awareness
      biases: list[object]
      disclosure: string

  # Layer 2: Domain Knowledge
  domain_knowledge:
    prompts: list[object]    # Inline action prompts
    procedures: list[object] # Step-by-step procedures
    rules: list[string]      # Domain-specific rules
    references: list[string] # External resources

  # Layer 3: Orchestration
  orchestration:
    cross_module_triggers: list[object]
    collaboration_hints: list[string]
    synergies: list[object]
```

### 3.3 Loading Strategy

```
Loading Decision Tree
=====================

User activates agent
        │
        ▼
┌───────────────────┐
│ Load Layer 0      │ ◄── Always (200 tokens)
│ (Essential)       │
└───────────────────┘
        │
        ▼
   User request?
        │
        ├─── Chat/Quick query ───► Stay at Layer 0
        │
        ├─── Substantive work ───► Load Layer 1 (+300 tokens)
        │
        ├─── Specific task ───────► Load Layer 1 + relevant Layer 2 (+300-800)
        │
        └─── Multi-agent mode ────► Load Layers 1 + 3 (+400-500)
```

---

## 4. Compression Guidelines (AC3)

### 4.1 Voice Compression Algorithm

Transform verbose communication styles into condensed voice signatures:

**Before (typical ~350 chars):**
```
Methodical, defense-in-depth thinking. Draws mental diagrams while speaking.
Always considers the system holistically. "Every layer tells a story..."
"Where's the trust boundary here?" "Let me sketch this out..."
"What happens when this component fails?" Balances ideal security with
practical implementation realities.
```

**After (~120 chars):**
```
Methodical, diagram-thinking. "Every layer tells a story..."
Balances ideal security with practical realities.
```

**Compression Rules:**
1. Keep 1-2 characteristic phrases in quotes
2. Preserve core behavioral descriptor (methodical, passionate, etc.)
3. Remove action descriptions ("Draws mental diagrams while speaking")
4. Condense to single sentence plus one quote
5. Maximum 150 characters

### 4.2 Identity Compression Algorithm

Transform narrative identities into compressed role definitions:

**Before (typical ~600 chars):**
```
Principal security architect with 18+ years designing secure systems at scale.
Has architected zero-trust implementations for global enterprises and government
agencies. CISSP, SABSA, TOGAF certified. Expert in cloud security, identity
systems, network segmentation, and cryptographic implementations. Former software
architect who pivoted to security, bringing deep understanding of how systems
actually get built.
```

**After (~180 chars):**
```
Principal security architect (18+ yrs). Zero-trust, cloud security, IAM expert.
CISSP/SABSA certified. Former software architect - understands how systems get built.
```

**Compression Rules:**
1. Keep years of experience (establishes authority)
2. Keep certifications (credibility markers)
3. List max 3 expertise areas
4. Preserve pivotal career detail if it explains perspective
5. Maximum 200 characters

### 4.3 Principles Compression Algorithm

Transform principles lists into single guiding principle:

**Before (typical 5-7 principles, ~400 chars):**
```
- Security is a property of the system, not a bolt-on feature
- Assume breach and design accordingly - zero trust isn't just a buzzword
- Complexity is the enemy of security - every additional component is attack surface
- Make the secure path the easy path for developers
- Defense in depth means no single point of failure
- Document your threat model before your architecture
```

**After (single principle, ~75 chars):**
```
Assume breach. Complexity is the enemy. Defense in depth.
```

**Compression Rules:**
1. Identify the ONE principle that best captures the agent's worldview
2. Combine up to 3 related concepts if they form natural unity
3. Remove explanatory clauses
4. Maximum 75 characters

### 4.4 New Agent Compression Checklist

When creating new agents, follow this checklist:

```markdown
## New Agent Compression Checklist

### Essential Persona (Required - ~200 tokens)
- [ ] agent_id: unique lowercase identifier
- [ ] name: character name (1-2 words)
- [ ] title: role title (max 50 chars)
- [ ] icon: single emoji
- [ ] module: owning module name
- [ ] role: one-line capability (max 100 chars)
- [ ] voice: condensed style signature (max 150 chars)
- [ ] core_principle: guiding principle (max 75 chars)

### Extended Persona (Optional - load on demand)
- [ ] identity_full: complete backstory (if rich narrative needed)
- [ ] principles: full principles list (if multiple guidelines)
- [ ] communication_examples: characteristic phrases
- [ ] inherent_biases: self-awareness disclosures
- [ ] prompts: inline domain knowledge
- [ ] procedures: step-by-step task guides
- [ ] cross_module_triggers: collaboration hints

### Compression Validation
- [ ] Essential persona < 200 tokens (verify with tokenizer)
- [ ] Voice contains 1-2 characteristic phrases
- [ ] Core principle is actionable, not aspirational
- [ ] No boilerplate in persona (handled by runtime)
```

---

## 5. Deferred vs Required Elements (AC4)

### 5.1 Element Classification Matrix

| Element | Required | Deferred | Load Trigger |
|---------|----------|----------|--------------|
| Agent ID | YES | - | Activation |
| Name/Title/Icon | YES | - | Activation |
| Module | YES | - | Activation |
| Role (condensed) | YES | - | Activation |
| Voice (condensed) | YES | - | Activation |
| Core principle | YES | - | Activation |
| Activation steps | - | YES | Runtime handles |
| Menu handlers | - | YES | Runtime handles |
| Security rules | - | YES | Runtime handles |
| TTS rules | - | YES | Runtime handles |
| Full identity | - | YES | Substantive work |
| Full principles | - | YES | Substantive work |
| Communication examples | - | YES | Substantive work |
| Inherent biases | - | YES | Multi-perspective work |
| Menu definitions | - | YES | Menu display |
| Inline prompts | - | YES | Specific action |
| Domain procedures | - | YES | Task execution |
| Cross-module triggers | - | YES | Orchestration |
| Legal disclaimers | - | YES | Legal outputs |

### 5.2 Runtime Injection Strategy

Instead of each agent containing boilerplate, the **BMAD Runtime** injects:

```yaml
# RUNTIME-INJECTED CONTEXT (not in agent files)
runtime_context:
  # Universal Activation Protocol (injected by orchestrator)
  activation_protocol:
    config_loading: "Load {module}/config.yaml"
    session_vars: ["user_name", "communication_language", "output_folder"]
    greeting_template: "Use {user_name}, communicate in {communication_language}"

  # Universal Rules (injected once per session)
  universal_rules:
    security: "Prompt injection protection active"
    language: "Communicate in {communication_language}"
    file_loading: "Load files only when needed"

  # TTS Integration (injected if TTS enabled)
  tts_protocol: "Call bmad-speak.sh after responses"

  # Menu Handler Definitions (injected once per session)
  menu_handlers:
    workflow: "Load workflow.xml, pass yaml path"
    exec: "Load and execute file"
    action: "Execute inline or reference prompt"
```

**Token Savings from Runtime Injection:**
- Activation steps: ~450 tokens saved per agent
- Menu handlers: ~200 tokens saved per agent
- Security rules: ~100 tokens saved per agent
- TTS rules: ~50 tokens saved per agent
- **Total: ~800 tokens saved per agent x 79 agents = 63,200 tokens**

---

## 6. Token Savings Analysis (AC5)

### 6.1 Per-Agent Savings Calculation

| Component | Before (tokens) | After (tokens) | Savings |
|-----------|-----------------|----------------|---------|
| YAML frontmatter | 25 | 25 | 0 |
| Embodiment instruction | 40 | 0 | 40 |
| Activation block | 550 | 0 | 550 |
| Menu handlers | 200 | 0 | 200 |
| Rules block | 300 | 0 | 300 |
| Persona block | 300 | 180 | 120 |
| Standard menu items | 80 | 0 | 80 |
| **Per-agent subtotal** | **1,495** | **205** | **1,290** |

**Additional savings for specific agent types:**
- Legal team (prompts): ~500 additional tokens deferred
- Strategy team (biases): ~100 additional tokens deferred
- Core (cross-module triggers): ~150 additional tokens deferred

### 6.2 Total Framework Savings

| Module | Agents | Before (tokens) | After (tokens) | Savings |
|--------|--------|-----------------|----------------|---------|
| Legal Team | 13 | 42,464 | 5,850 | 36,614 (86%) |
| Cybersec Team | 15 | 31,664 | 6,750 | 24,914 (79%) |
| Strategy Team | 14 | 27,420 | 6,300 | 21,120 (77%) |
| Intel Team | 11 | 22,520 | 4,950 | 17,570 (78%) |
| BMM | 9 | 14,085 | 4,050 | 10,035 (71%) |
| BMGD | 6 | 10,200 | 2,700 | 7,500 (74%) |
| Core | 2 | 4,257 | 900 | 3,357 (79%) |
| CIS | 6 | 7,373 | 2,700 | 4,673 (63%) |
| BMB | 3 | 3,777 | 1,350 | 2,427 (64%) |
| **TOTAL** | **79** | **165,539** | **35,550** | **129,989 (78.5%)** |

### 6.3 Activation Cost Comparison

**Before:**
- Minimum agent activation: ~1,200 tokens (smallest agent)
- Maximum agent activation: ~3,500 tokens (legal team)
- Average agent activation: ~2,095 tokens

**After:**
- Minimum agent activation: ~200 tokens (essential only)
- Maximum agent activation: ~450 tokens (essential + some context)
- Average agent activation: ~450 tokens

**Improvement: 78.5% reduction in average activation cost**

---

## 7. Quality Preservation Criteria (AC6)

### 7.1 Distinctiveness Metrics

Each compressed persona must pass these distinctiveness tests:

**1. Identity Test**
- Can a user identify the agent from a single response?
- Does the name, role, and voice create unique impression?
- Score: Pass if 8/10 test users correctly identify agent

**2. Behavioral Consistency Test**
- Does the compressed persona produce consistent outputs?
- Are responses aligned with the core principle?
- Score: Pass if 90% of responses align with principle

**3. Voice Authenticity Test**
- Does the condensed voice capture the original tone?
- Are characteristic phrases preserved?
- Score: Pass if voice feels "in character"

**4. Capability Retention Test**
- Can the agent still perform all expected functions?
- Is domain expertise maintained through extended loading?
- Score: Pass if 100% capability retention

### 7.2 Quality Assurance Process

```
Quality Assurance Flow
======================

Step 1: Compression
───────────────────
Full persona → Apply compression rules → Essential persona

Step 2: Validation
──────────────────
Essential persona → Token count check → Must be ≤200 tokens

Step 3: Distinctiveness Testing
───────────────────────────────
Essential persona → Generate 5 test responses → Human evaluation
                                                    │
                    Pass (≥4/5 distinguishable) ◄───┤
                                                    │
                    Fail → Revise voice/principle ──┘

Step 4: Behavioral Testing
──────────────────────────
Essential persona → Generate 10 domain responses → Principle alignment check
                                                    │
                    Pass (≥9/10 aligned) ◄──────────┤
                                                    │
                    Fail → Revise core principle ───┘

Step 5: Extended Loading Test
─────────────────────────────
Essential → Load Layer 1 → Verify capability retention
         → Load Layer 2 → Verify domain knowledge
         → Load Layer 3 → Verify orchestration
```

### 7.3 Distinctiveness Preservation Rules

1. **Characteristic Phrases Are Sacred**: Always preserve 1-2 quoted phrases that define the agent's voice
2. **Core Principle Must Be Unique**: No two agents should share identical core principles
3. **Role Must Be Specific**: Generic roles like "Expert" are insufficient
4. **Voice Must Be Actionable**: Style descriptions should guide response generation
5. **Extended Content Must Enhance, Not Repeat**: Layer 1+ content adds depth, not redundancy

---

## 8. Implementation Recommendations

### 8.1 Migration Path

**Phase 1: Infrastructure (Week 1-2)**
1. Create runtime injection system for boilerplate
2. Build progressive persona loading system
3. Develop token counting validation tools

**Phase 2: Agent Migration (Week 3-4)**
1. Generate compressed personas for all 79 agents
2. Validate distinctiveness for each
3. Map extended content to loading layers

**Phase 3: Testing (Week 5)**
1. Run quality assurance on all compressed personas
2. Verify capability retention across all agents
3. Performance test progressive loading

**Phase 4: Deployment (Week 6)**
1. Deploy new persona architecture
2. Monitor activation costs
3. Gather user feedback on agent quality

### 8.2 File Structure Changes

**Current:**
```
_bmad/{module}/agents/{agent}.md
└── Full agent file with all content
```

**Proposed:**
```
_bmad/{module}/agents/
├── {agent}.yaml              # Essential persona (200 tokens)
├── {agent}.extended.yaml     # Extended layers (optional)
└── {agent}.prompts.md        # Domain prompts (optional)

_bmad/core/runtime/
├── activation-protocol.yaml  # Universal activation
├── menu-handlers.yaml        # Handler definitions
└── universal-rules.yaml      # Security, TTS, language
```

### 8.3 Backward Compatibility

During transition, support both formats:
- New compressed format: `.yaml` essential + `.extended.yaml`
- Legacy format: `.md` with full content

The runtime detects format and handles appropriately.

---

## 9. Appendix: Compression Reference

### 9.1 Voice Compression Examples

| Agent | Original Voice | Compressed Voice |
|-------|----------------|------------------|
| Bastion | Methodical, defense-in-depth thinking. Draws mental diagrams while speaking. Always considers the system holistically. "Every layer tells a story..." | Methodical, holistic. "Every layer tells a story..." Balances ideal with practical. |
| Vector | Measured, authoritative, economical with words. States conclusions first. "Confidence level on that assessment?" | Measured, authoritative, terse. "Confidence level on that?" Conclusions first. |
| Sun | Speaks in aphorisms and paradoxes. "The supreme art of war is to subdue the enemy without fighting." Calm, patient, nature metaphors. | Aphoristic, patient. "Win without fighting." Nature metaphors, sees what others miss. |

### 9.2 Principle Compression Examples

| Agent | Original Principles | Compressed Principle |
|-------|--------------------|-----------------------|
| Bastion | Security is a property, not bolt-on. Assume breach. Complexity is enemy. Make secure path easy. Defense in depth. Document threat models. | Assume breach. Complexity is the enemy. Defense in depth. |
| Vector | Analytic rigor. Source diversity. Collection discipline. Operational security. Intellectual honesty. Time sensitivity. | Single-source intelligence is hypothesis, not fact. |
| Gremio | Pro operario. Convenio matters. Procedural formality. Caducidad plazos. Conciliacion previa. Works councils have rights. | Procedural formality is crucial - missing plazos loses cases. |

---

## 10. Conclusion

This persona compression strategy achieves **78.5% reduction** in agent activation costs while preserving agent distinctiveness through:

1. **Essential persona definition** at ~200 tokens capturing identity, voice, and core principle
2. **Extended persona layers** loaded progressively as needed
3. **Runtime injection** of universal boilerplate
4. **Quality preservation criteria** ensuring behavioral consistency

The approach enables BMAD to scale to larger agent populations without proportional context cost increases, while maintaining the rich character depth that makes agents memorable and effective.

---

*Document generated by Victor, Innovation Strategist*
*BMAD-CONCURA Project - Context Optimization Initiative*
