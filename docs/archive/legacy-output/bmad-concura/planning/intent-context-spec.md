# Intent-Aware Context Selection Specification

**Story:** CONCURA-2.3 - Intent-Aware Context Selection
**Author:** Dr. Quinn (Master Problem Solver)
**Date:** 2026-01-17
**Version:** 1.0

---

## Executive Summary

This specification defines a system for predicting required context based on user intent, ensuring irrelevant context is never loaded. By detecting intent early and loading only necessary context, we can achieve significant token savings while maintaining full functionality.

**Key Innovation:** Instead of loading everything "just in case," we detect what the user wants to do and load only what's needed for that specific intent.

**Target Savings:** 60-90% reduction in context loading for most interactions.

---

## 1. Intent Taxonomy

### 1.1 Primary Intent Categories

| Intent ID | Name | Description | Typical Token Budget |
|-----------|------|-------------|----------------------|
| `AGENT_ACTIVATE` | Agent Activation | User wants to work with a specific BMAD agent | 3,000-5,000 |
| `WORKFLOW_EXECUTE` | Workflow Execution | User wants to run a structured workflow | 5,000-15,000 |
| `PARTY_MODE` | Multi-Agent Discussion | User wants multiple agents in conversation | 8,000-15,000 |
| `QUICK_CHAT` | Quick Chat/Question | User has a quick question, no formal process | 1,000-2,000 |
| `RESEARCH` | Research/Investigation | User wants deep research on a topic | 10,000-30,000 |
| `PROJECT_MGMT` | Project Management | User wants to manage projects/tasks | 3,000-6,000 |
| `CODE_DEV` | Code Development | User wants to write/review code | 5,000-20,000 |
| `DOCUMENTATION` | Documentation | User wants to create/update docs | 3,000-8,000 |
| `SECURITY_OPS` | Security Operations | User needs security assessment/response | 8,000-25,000 |
| `INTEL_OPS` | Intelligence Operations | User needs OSINT/intelligence work | 10,000-30,000 |

### 1.2 Intent Category Definitions

#### AGENT_ACTIVATE
**Definition:** User explicitly or implicitly requests interaction with a specific BMAD agent persona.

**Triggers:**
- Direct agent name mention: "Talk to Winston", "Get Abdul"
- Skill invocation that maps to an agent
- Menu selection that activates an agent
- Role-based request: "I need an architect"

**Context Requirements:**
- Agent file for the specific agent
- Agent's menu structure
- Project context (if exists)
- NO manifests needed (agent already identified)

---

#### WORKFLOW_EXECUTE
**Definition:** User wants to execute a structured, multi-step workflow.

**Triggers:**
- Skill/workflow invocation: `/create-prd`, `/flash-assessment`
- Explicit workflow request: "Run the incident response workflow"
- Phase-specific request: "Start the architecture phase"

**Context Requirements:**
- Workflow entry file (workflow.md/yaml)
- Current step file ONLY (not all steps)
- Relevant agent persona
- Workflow-specific data/templates
- NO other workflows, NO full manifests

---

#### PARTY_MODE
**Definition:** User wants multiple agents engaged in collaborative discussion.

**Triggers:**
- Explicit: "Start party mode", "Get the team together"
- Multi-agent request: "I want Winston, Bastion, and Cipher to discuss this"
- Team invocation: "Bring in the security review team"

**Context Requirements:**
- Persona summaries for participating agents (NOT full files)
- Party mode orchestration rules
- Topic/domain context
- NO full agent files unless actively speaking

---

#### QUICK_CHAT
**Definition:** Simple question or casual conversation, no formal workflow needed.

**Triggers:**
- Short questions without workflow keywords
- Clarification requests
- General knowledge queries
- Casual conversation

**Context Requirements:**
- MINIMAL: Only base system context
- Project context if question relates to it
- NO agents, NO workflows, NO manifests

---

#### RESEARCH
**Definition:** User wants deep investigation or research on a topic.

**Triggers:**
- "Research X", "Investigate Y", "Find out about Z"
- Competitive analysis requests
- Technical deep-dives
- Market research requests

**Context Requirements:**
- Research workflow if structured
- Web search capabilities
- Domain-specific knowledge (lazy-load)
- Project context if relevant

---

#### PROJECT_MGMT
**Definition:** User wants to manage projects, track status, or organize work.

**Triggers:**
- "What's next?", "Project status", "Create project"
- Sprint/epic/story references
- Phase gate checks
- Task assignment

**Context Requirements:**
- Project registry
- Project manager agent (Abdul)
- Status files if exist
- Workflow index (minimal)

---

#### CODE_DEV
**Definition:** User wants to write, review, or modify code.

**Triggers:**
- "Implement X", "Fix bug in Y", "Write tests for Z"
- Story execution requests
- Code review requests
- Refactoring requests

**Context Requirements:**
- Developer agent persona
- Story file if executing story
- project-context.md
- Architecture decisions
- Relevant codebase files

---

#### DOCUMENTATION
**Definition:** User wants to create, update, or review documentation.

**Triggers:**
- "Document X", "Write README", "Update the API docs"
- Technical writing requests

**Context Requirements:**
- Tech writer agent persona
- Existing documentation
- Project context
- Documentation standards

---

#### SECURITY_OPS
**Definition:** User needs security assessment, incident response, or compliance work.

**Triggers:**
- Security keywords: "vulnerability", "threat", "incident", "breach"
- Compliance keywords: "audit", "SOC 2", "GDPR", "PCI"
- Security workflow invocations

**Context Requirements:**
- Security team agents (as needed)
- Security workflows
- Compliance frameworks (lazy-load)
- OWASP/security knowledge (lazy-load)

---

#### INTEL_OPS
**Definition:** User needs intelligence gathering, OSINT, or attribution work.

**Triggers:**
- Intel keywords: "OSINT", "investigate target", "attribution"
- Campaign planning requests
- Threat actor research

**Context Requirements:**
- Intel team agents (as needed)
- OSINT knowledge base
- Intelligence workflows
- Target data

---

## 2. Context Requirements Matrix

### 2.1 Context Components

| Component | ID | Avg Tokens | Description |
|-----------|-------|------------|-------------|
| System Base | `SYS_BASE` | 15,000 | Claude Code base instructions |
| Tool Definitions | `TOOL_DEFS` | 12,000 | All available tools |
| Skill List | `SKILL_LIST` | 9,400 | Available skills (251 skills) |
| Git Status | `GIT_STATUS` | 800 | Current branch/changes |
| Project Context | `PROJ_CTX` | 3,000 | project-context.md if exists |
| Agent File | `AGENT_FILE` | 2,500 avg | Individual agent persona |
| Agent Summary | `AGENT_SUM` | 200 | Compressed agent identity |
| Agent Manifest | `AGENT_MANIFEST` | 16,000 | Full agent listing |
| Agent Index | `AGENT_INDEX` | 500 | Minimal ID->path map |
| Workflow File | `WF_FILE` | 4,000 avg | Workflow entry point |
| Workflow Step | `WF_STEP` | 3,500 avg | Individual step file |
| Workflow Manifest | `WF_MANIFEST` | 7,400 | Full workflow listing |
| Workflow Index | `WF_INDEX` | 300 | Minimal ID->path map |
| Party Presets | `PARTY_PRESETS` | 11,000 | Cross-module groups |
| Knowledge Base | `KNOWLEDGE` | 6,000 avg | Domain-specific knowledge |
| Files Manifest | `FILES_MANIFEST` | 25,600 | File integrity index |
| Security Rules | `SEC_RULES` | 500 | Shared security rules |

### 2.2 Context by Intent Matrix

| Context Component | AGENT_ACTIVATE | WORKFLOW_EXECUTE | PARTY_MODE | QUICK_CHAT | RESEARCH | PROJECT_MGMT | CODE_DEV | DOCUMENTATION | SECURITY_OPS | INTEL_OPS |
|-------------------|----------------|------------------|------------|------------|----------|--------------|----------|---------------|--------------|-----------|
| SYS_BASE | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES |
| TOOL_DEFS | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES |
| SKILL_LIST | MINIMAL | YES | YES | MINIMAL | YES | YES | YES | YES | YES | YES |
| GIT_STATUS | IF_DEV | IF_DEV | NO | IF_DEV | NO | NO | YES | IF_DEV | NO | NO |
| PROJ_CTX | IF_EXISTS | IF_EXISTS | IF_EXISTS | IF_RELEVANT | IF_EXISTS | YES | YES | IF_EXISTS | IF_EXISTS | IF_EXISTS |
| AGENT_FILE | SELECTED | PRIMARY | NONE | NONE | IF_AGENT | ABDUL | DEV | WRITER | SELECTED | SELECTED |
| AGENT_SUM | NONE | NONE | SELECTED | NONE | NONE | NONE | NONE | NONE | SELECTED | SELECTED |
| AGENT_MANIFEST | NONE | NONE | NONE | NONE | NONE | NONE | NONE | NONE | NONE | NONE |
| AGENT_INDEX | FALLBACK | FALLBACK | YES | NONE | FALLBACK | YES | NONE | NONE | FALLBACK | FALLBACK |
| WF_FILE | NONE | YES | ORCHESTRATOR | NONE | IF_NEEDED | YES | IF_STORY | NONE | YES | YES |
| WF_STEP | NONE | CURRENT | NONE | NONE | AS_NEEDED | AS_NEEDED | AS_NEEDED | AS_NEEDED | AS_NEEDED | AS_NEEDED |
| WF_MANIFEST | NONE | NONE | NONE | NONE | NONE | NONE | NONE | NONE | NONE | NONE |
| WF_INDEX | NONE | FALLBACK | NONE | NONE | FALLBACK | YES | NONE | NONE | FALLBACK | FALLBACK |
| PARTY_PRESETS | NONE | NONE | IF_PRESET | NONE | NONE | NONE | NONE | NONE | IF_TEAM | IF_TEAM |
| KNOWLEDGE | NONE | AS_NEEDED | NONE | NONE | YES | NONE | NONE | NONE | AS_NEEDED | AS_NEEDED |
| FILES_MANIFEST | NONE | NONE | NONE | NONE | NONE | NONE | NONE | NONE | SECURITY_CHECK | NONE |
| SEC_RULES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES |

**Legend:**
- `YES` - Always load
- `NONE` - Never load
- `IF_*` - Conditional load based on context
- `SELECTED` - Load only for selected items
- `MINIMAL` - Load compressed/minimal version
- `FALLBACK` - Load only if direct lookup fails
- `AS_NEEDED` - Progressive loading during execution
- `CURRENT` - Load only current step, not all

### 2.3 Token Budget by Intent

| Intent | Minimum Budget | Typical Budget | Maximum Budget |
|--------|----------------|----------------|----------------|
| QUICK_CHAT | 27,000 | 28,000 | 30,000 |
| AGENT_ACTIVATE | 29,500 | 32,000 | 38,000 |
| PROJECT_MGMT | 32,000 | 36,000 | 45,000 |
| WORKFLOW_EXECUTE | 32,000 | 42,000 | 60,000 |
| CODE_DEV | 35,000 | 45,000 | 80,000 |
| DOCUMENTATION | 33,000 | 38,000 | 50,000 |
| PARTY_MODE | 35,000 | 45,000 | 55,000 |
| SECURITY_OPS | 40,000 | 55,000 | 85,000 |
| INTEL_OPS | 45,000 | 65,000 | 100,000 |
| RESEARCH | 40,000 | 60,000 | 100,000 |

---

## 3. Intent Detection Algorithm

### 3.1 Detection Pipeline

```
USER INPUT
    |
    v
+------------------+
| 1. PREPROCESSING |  Normalize, tokenize, extract entities
+------------------+
    |
    v
+------------------+
| 2. SIGNAL        |  Detect explicit signals (commands,
|    EXTRACTION    |  keywords, patterns)
+------------------+
    |
    v
+------------------+
| 3. CONTEXT       |  Consider conversation history,
|    ANALYSIS      |  active project, current state
+------------------+
    |
    v
+------------------+
| 4. INTENT        |  Score each intent category
|    SCORING       |
+------------------+
    |
    v
+------------------+
| 5. CONFIDENCE    |  Calculate confidence,
|    ASSESSMENT    |  identify ambiguity
+------------------+
    |
    v
+------------------+
| 6. RESOLUTION    |  Apply tiebreakers,
|                  |  handle ambiguity
+------------------+
    |
    v
DETECTED INTENT + CONFIDENCE
```

### 3.2 Pseudocode Implementation

```python
class IntentDetector:
    """Detects user intent to enable context-aware loading."""

    # Signal weights for intent scoring
    SIGNAL_WEIGHTS = {
        'explicit_command': 1.0,      # /command or direct invocation
        'keyword_match': 0.7,         # Keywords from intent vocabulary
        'pattern_match': 0.5,         # Regex patterns
        'context_continuation': 0.8,  # Continuing previous intent
        'project_state': 0.3,         # Project phase suggests intent
        'history_inference': 0.4,     # Based on conversation history
    }

    # Intent keyword vocabularies
    INTENT_KEYWORDS = {
        'AGENT_ACTIVATE': [
            'talk to', 'get', 'bring in', 'activate', 'start',
            'speak with', 'need', 'want', 'call'
        ],
        'WORKFLOW_EXECUTE': [
            'run', 'execute', 'start workflow', 'begin', 'do',
            'create', 'generate', 'build', 'make'
        ],
        'PARTY_MODE': [
            'party mode', 'team discussion', 'group', 'together',
            'collaborate', 'all agents', 'multiple agents'
        ],
        'QUICK_CHAT': [
            'what is', 'how do', 'can you', 'explain', 'help',
            'question', 'quick', 'just', 'simply'
        ],
        'RESEARCH': [
            'research', 'investigate', 'find out', 'analyze',
            'study', 'explore', 'deep dive', 'look into'
        ],
        'PROJECT_MGMT': [
            'project', 'status', 'sprint', 'epic', 'story',
            'what\'s next', 'assign', 'track', 'manage'
        ],
        'CODE_DEV': [
            'implement', 'code', 'fix', 'bug', 'test', 'refactor',
            'write', 'develop', 'build feature'
        ],
        'DOCUMENTATION': [
            'document', 'readme', 'docs', 'write up', 'explain',
            'api docs', 'technical writing'
        ],
        'SECURITY_OPS': [
            'security', 'vulnerability', 'threat', 'incident',
            'breach', 'audit', 'compliance', 'penetration'
        ],
        'INTEL_OPS': [
            'osint', 'intelligence', 'target', 'attribution',
            'reconnaissance', 'campaign', 'investigate person'
        ],
    }

    # Command patterns (regex)
    COMMAND_PATTERNS = {
        'WORKFLOW_EXECUTE': r'^/[\w-]+',  # Starts with /command
        'AGENT_ACTIVATE': r'(?:@|talk\s+to\s+)\w+',
        'PARTY_MODE': r'(?:party|team)\s+mode',
        'PROJECT_MGMT': r'(?:project|sprint|epic)\s+\w+',
    }

    # Agent name patterns
    AGENT_NAMES = set()  # Populated from agent index

    def detect_intent(self, user_input: str, context: ConversationContext) -> IntentResult:
        """
        Main entry point for intent detection.

        Args:
            user_input: The raw user message
            context: Current conversation context including history

        Returns:
            IntentResult with detected intent, confidence, and extracted entities
        """
        # Step 1: Preprocess
        normalized = self._preprocess(user_input)
        entities = self._extract_entities(normalized)

        # Step 2: Extract signals
        signals = self._extract_signals(normalized, entities, context)

        # Step 3: Score intents
        scores = self._score_intents(signals, context)

        # Step 4: Assess confidence and resolve
        result = self._resolve_intent(scores, context)

        return result

    def _preprocess(self, text: str) -> str:
        """Normalize and clean input."""
        text = text.lower().strip()
        text = re.sub(r'\s+', ' ', text)  # Collapse whitespace
        return text

    def _extract_entities(self, text: str) -> dict:
        """Extract named entities: agents, workflows, files, etc."""
        entities = {
            'agents': [],
            'workflows': [],
            'files': [],
            'projects': [],
        }

        # Check for agent names
        for agent in self.AGENT_NAMES:
            if agent.lower() in text:
                entities['agents'].append(agent)

        # Check for slash commands
        slash_match = re.search(r'/(\w[\w-]*)', text)
        if slash_match:
            entities['workflows'].append(slash_match.group(1))

        # Check for file paths
        file_match = re.findall(r'[\w/.-]+\.(md|yaml|py|ts|js)', text)
        entities['files'].extend(file_match)

        return entities

    def _extract_signals(self, text: str, entities: dict,
                         context: ConversationContext) -> list[Signal]:
        """Extract all signals from input."""
        signals = []

        # Signal 1: Explicit command (slash command)
        if entities['workflows']:
            signals.append(Signal(
                type='explicit_command',
                intent='WORKFLOW_EXECUTE',
                strength=1.0,
                evidence=f"Slash command: /{entities['workflows'][0]}"
            ))

        # Signal 2: Agent mention
        if entities['agents']:
            signals.append(Signal(
                type='explicit_command',
                intent='AGENT_ACTIVATE',
                strength=1.0,
                evidence=f"Agent mentioned: {entities['agents'][0]}"
            ))

        # Signal 3: Keyword matching
        for intent, keywords in self.INTENT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    signals.append(Signal(
                        type='keyword_match',
                        intent=intent,
                        strength=0.7,
                        evidence=f"Keyword: '{keyword}'"
                    ))
                    break  # One keyword per intent is enough

        # Signal 4: Pattern matching
        for intent, pattern in self.COMMAND_PATTERNS.items():
            if re.search(pattern, text):
                signals.append(Signal(
                    type='pattern_match',
                    intent=intent,
                    strength=0.5,
                    evidence=f"Pattern: {pattern}"
                ))

        # Signal 5: Context continuation
        if context.active_intent and self._is_continuation(text, context):
            signals.append(Signal(
                type='context_continuation',
                intent=context.active_intent,
                strength=0.8,
                evidence="Continuing previous interaction"
            ))

        # Signal 6: Project state inference
        if context.project_phase:
            phase_intents = self._infer_from_phase(context.project_phase)
            for intent in phase_intents:
                signals.append(Signal(
                    type='project_state',
                    intent=intent,
                    strength=0.3,
                    evidence=f"Project in {context.project_phase} phase"
                ))

        return signals

    def _score_intents(self, signals: list[Signal],
                       context: ConversationContext) -> dict[str, float]:
        """Calculate weighted score for each intent."""
        scores = {intent: 0.0 for intent in self.INTENT_KEYWORDS.keys()}

        for signal in signals:
            weight = self.SIGNAL_WEIGHTS.get(signal.type, 0.5)
            scores[signal.intent] += signal.strength * weight

        # Normalize scores to 0-1 range
        max_score = max(scores.values()) if max(scores.values()) > 0 else 1
        scores = {k: v / max_score for k, v in scores.items()}

        return scores

    def _resolve_intent(self, scores: dict[str, float],
                        context: ConversationContext) -> IntentResult:
        """Resolve final intent with confidence assessment."""
        sorted_intents = sorted(scores.items(), key=lambda x: x[1], reverse=True)

        top_intent, top_score = sorted_intents[0]
        second_intent, second_score = sorted_intents[1] if len(sorted_intents) > 1 else (None, 0)

        # Confidence assessment
        if top_score < 0.3:
            # Very low confidence - default to QUICK_CHAT
            return IntentResult(
                primary_intent='QUICK_CHAT',
                confidence=0.5,
                is_ambiguous=True,
                alternatives=[(top_intent, top_score)],
                reason="Low signal strength - defaulting to minimal context"
            )

        # Check for ambiguity (two intents close in score)
        score_gap = top_score - second_score
        if score_gap < 0.2 and second_score > 0.4:
            return IntentResult(
                primary_intent=top_intent,
                confidence=top_score,
                is_ambiguous=True,
                alternatives=[(second_intent, second_score)],
                reason=f"Ambiguous between {top_intent} and {second_intent}"
            )

        # Clear winner
        return IntentResult(
            primary_intent=top_intent,
            confidence=top_score,
            is_ambiguous=False,
            alternatives=[],
            reason=f"Clear intent: {top_intent}"
        )

    def _is_continuation(self, text: str, context: ConversationContext) -> bool:
        """Check if this is a continuation of previous interaction."""
        # Short messages are often continuations
        if len(text.split()) <= 3:
            return True

        # Pronouns suggest continuation
        continuation_words = ['it', 'this', 'that', 'yes', 'no', 'ok', 'continue']
        if any(word in text.lower() for word in continuation_words):
            return True

        return False

    def _infer_from_phase(self, phase: str) -> list[str]:
        """Infer likely intents from project phase."""
        phase_intents = {
            'analysis': ['RESEARCH', 'WORKFLOW_EXECUTE'],
            'planning': ['WORKFLOW_EXECUTE', 'DOCUMENTATION'],
            'solutioning': ['WORKFLOW_EXECUTE', 'CODE_DEV'],
            'implementation': ['CODE_DEV', 'WORKFLOW_EXECUTE'],
            'testing': ['CODE_DEV', 'WORKFLOW_EXECUTE'],
        }
        return phase_intents.get(phase.lower(), [])


@dataclass
class Signal:
    """A signal indicating intent."""
    type: str
    intent: str
    strength: float
    evidence: str


@dataclass
class IntentResult:
    """Result of intent detection."""
    primary_intent: str
    confidence: float
    is_ambiguous: bool
    alternatives: list[tuple[str, float]]
    reason: str
```

### 3.3 Detection Flow Examples

#### Example 1: Clear Workflow Invocation
```
Input: "/create-prd"
Signals:
  - explicit_command: WORKFLOW_EXECUTE (1.0)
Result:
  intent=WORKFLOW_EXECUTE, confidence=1.0, ambiguous=False
```

#### Example 2: Agent Activation
```
Input: "I need to talk to Winston about the architecture"
Signals:
  - keyword_match: AGENT_ACTIVATE (0.7) - "talk to"
  - keyword_match: CODE_DEV (0.7) - "architecture" (weak)
  - entity_extraction: agent="Winston"
Result:
  intent=AGENT_ACTIVATE, confidence=0.85, ambiguous=False
  entities: {agent: "Winston"}
```

#### Example 3: Ambiguous Input
```
Input: "Let's work on the security review"
Signals:
  - keyword_match: SECURITY_OPS (0.7) - "security"
  - keyword_match: CODE_DEV (0.7) - "review" (could be code review)
  - pattern_match: none
Result:
  intent=SECURITY_OPS, confidence=0.7, ambiguous=True
  alternatives: [(CODE_DEV, 0.6)]
  Action: Clarify with user
```

#### Example 4: Quick Question
```
Input: "What's the difference between PRD and architecture?"
Signals:
  - keyword_match: QUICK_CHAT (0.7) - "what's"
  - no explicit commands or agents
Result:
  intent=QUICK_CHAT, confidence=0.8, ambiguous=False
  Action: Minimal context load
```

---

## 4. Context Selection Rules Engine

### 4.1 Rules Engine Architecture

```
INTENT RESULT
    |
    v
+-------------------+
| RULES ENGINE      |
|                   |
| 1. Load base      |
|    context rules  |
|                   |
| 2. Apply intent-  |
|    specific rules |
|                   |
| 3. Apply entity-  |
|    specific rules |
|                   |
| 4. Apply budget   |
|    constraints    |
|                   |
| 5. Output context |
|    manifest       |
+-------------------+
    |
    v
CONTEXT MANIFEST
(List of files/components to load)
```

### 4.2 Rule Categories

#### Base Rules (Always Apply)
```yaml
base_rules:
  always_load:
    - component: SYS_BASE
      reason: "Required for Claude Code operation"
    - component: TOOL_DEFS
      reason: "Required for tool usage"
    - component: SEC_RULES
      reason: "Security is always required"

  conditional_load:
    - component: GIT_STATUS
      condition: "project_has_git"
      reason: "Git context for development"

    - component: PROJ_CTX
      condition: "project_context_exists"
      reason: "Project rules and patterns"
```

#### Intent-Specific Rules
```yaml
intent_rules:
  AGENT_ACTIVATE:
    load:
      - component: AGENT_FILE
        selector: "detected_agent"
        fallback: AGENT_INDEX

    skip:
      - AGENT_MANIFEST
      - WF_MANIFEST
      - PARTY_PRESETS
      - KNOWLEDGE

    conditional:
      - component: SKILL_LIST
        version: "minimal"
        reason: "Agent may invoke skills"

  WORKFLOW_EXECUTE:
    load:
      - component: WF_FILE
        selector: "detected_workflow"
      - component: WF_STEP
        selector: "current_step_only"
      - component: AGENT_FILE
        selector: "workflow_primary_agent"

    skip:
      - AGENT_MANIFEST
      - WF_MANIFEST
      - FILES_MANIFEST
      - PARTY_PRESETS

    progressive:
      - component: WF_STEP
        strategy: "load_next_on_completion"
      - component: KNOWLEDGE
        strategy: "load_on_reference"

  PARTY_MODE:
    load:
      - component: AGENT_SUM
        selector: "participating_agents"
      - component: PARTY_ORCHESTRATOR

    skip:
      - AGENT_MANIFEST
      - WF_MANIFEST
      - FILES_MANIFEST
      - Full AGENT_FILEs (use summaries)

    conditional:
      - component: PARTY_PRESETS
        condition: "using_preset"
      - component: AGENT_FILE
        condition: "agent_is_speaking"
        strategy: "load_and_cache"

  QUICK_CHAT:
    load:
      - component: SKILL_LIST
        version: "minimal"

    skip:
      - AGENT_MANIFEST
      - WF_MANIFEST
      - FILES_MANIFEST
      - PARTY_PRESETS
      - KNOWLEDGE
      - All AGENT_FILEs
      - All WF_FILEs
```

### 4.3 Rules Engine Pseudocode

```python
class ContextRulesEngine:
    """Determines what context to load based on detected intent."""

    def __init__(self, config: RulesConfig):
        self.config = config
        self.base_rules = config.base_rules
        self.intent_rules = config.intent_rules
        self.budget_limits = config.budget_limits

    def generate_context_manifest(self,
                                   intent_result: IntentResult,
                                   entities: dict,
                                   session_state: SessionState) -> ContextManifest:
        """
        Generate the list of context components to load.

        Returns a ContextManifest specifying exactly what to load.
        """
        manifest = ContextManifest()

        # Step 1: Apply base rules (always load)
        for rule in self.base_rules.always_load:
            manifest.add(rule.component, priority='high', reason=rule.reason)

        # Step 2: Apply base conditional rules
        for rule in self.base_rules.conditional_load:
            if self._evaluate_condition(rule.condition, session_state):
                manifest.add(rule.component, priority='medium', reason=rule.reason)

        # Step 3: Apply intent-specific rules
        intent_config = self.intent_rules.get(intent_result.primary_intent)
        if intent_config:
            # Load required components
            for rule in intent_config.load:
                component = self._resolve_component(rule, entities, session_state)
                manifest.add(component, priority='high', reason=f"Required for {intent_result.primary_intent}")

            # Mark components to skip
            for component in intent_config.skip:
                manifest.skip(component)

            # Handle conditional loads
            for rule in intent_config.conditional:
                if self._evaluate_condition(rule.condition, session_state):
                    manifest.add(rule.component, priority='low', reason=rule.reason)

            # Set up progressive loading
            for rule in intent_config.get('progressive', []):
                manifest.add_progressive(rule.component, rule.strategy)

        # Step 4: Apply ambiguity handling
        if intent_result.is_ambiguous:
            # Add minimal context for alternative intents
            for alt_intent, alt_score in intent_result.alternatives:
                if alt_score > 0.5:
                    alt_config = self.intent_rules.get(alt_intent)
                    if alt_config and alt_config.get('ambiguity_additions'):
                        for component in alt_config.ambiguity_additions:
                            manifest.add(component, priority='low',
                                        reason=f"Ambiguity support: {alt_intent}")

        # Step 5: Apply budget constraints
        budget = self.budget_limits.get(intent_result.primary_intent, 50000)
        manifest = self._apply_budget(manifest, budget)

        return manifest

    def _resolve_component(self, rule: LoadRule,
                           entities: dict,
                           session_state: SessionState) -> ComponentSpec:
        """Resolve component reference to specific file/content."""
        component = rule.component
        selector = rule.selector

        if selector == 'detected_agent':
            agent_name = entities.get('agents', [None])[0]
            if agent_name:
                return ComponentSpec(
                    type='AGENT_FILE',
                    path=self._lookup_agent_path(agent_name),
                    name=agent_name
                )
            elif rule.fallback:
                return ComponentSpec(type=rule.fallback)

        elif selector == 'detected_workflow':
            wf_name = entities.get('workflows', [None])[0]
            return ComponentSpec(
                type='WF_FILE',
                path=self._lookup_workflow_path(wf_name),
                name=wf_name
            )

        elif selector == 'current_step_only':
            return ComponentSpec(
                type='WF_STEP',
                path=session_state.current_step_path,
                strategy='single'
            )

        elif selector == 'participating_agents':
            agents = entities.get('agents', [])
            return ComponentSpec(
                type='AGENT_SUM',
                items=[self._get_agent_summary(a) for a in agents]
            )

        return ComponentSpec(type=component)

    def _apply_budget(self, manifest: ContextManifest,
                      budget: int) -> ContextManifest:
        """Trim manifest to fit within token budget."""
        estimated_tokens = manifest.estimate_tokens()

        if estimated_tokens <= budget:
            return manifest

        # Remove low-priority items until under budget
        while estimated_tokens > budget and manifest.has_low_priority():
            removed = manifest.remove_lowest_priority()
            estimated_tokens -= removed.estimated_tokens

        # If still over, truncate remaining items
        if estimated_tokens > budget:
            manifest.truncate_to_budget(budget)

        return manifest


@dataclass
class ContextManifest:
    """Specification of what context to load."""
    items: list[ComponentSpec] = field(default_factory=list)
    skipped: set[str] = field(default_factory=set)
    progressive: dict[str, str] = field(default_factory=dict)

    def add(self, component: ComponentSpec, priority: str, reason: str):
        """Add component to manifest."""
        if component.type not in self.skipped:
            self.items.append(ManifestItem(
                component=component,
                priority=priority,
                reason=reason
            ))

    def skip(self, component_type: str):
        """Mark component type as skipped."""
        self.skipped.add(component_type)
        self.items = [i for i in self.items if i.component.type != component_type]

    def to_load_list(self) -> list[str]:
        """Convert to ordered list of paths to load."""
        sorted_items = sorted(self.items,
                             key=lambda x: {'high': 0, 'medium': 1, 'low': 2}[x.priority])
        return [item.component.path for item in sorted_items if item.component.path]
```

### 4.4 Context Loading Strategies

#### Eager Loading (At Intent Detection)
```
Load immediately when intent is detected:
- Base system context
- Primary agent/workflow file
- Project context
```

#### Lazy Loading (On First Reference)
```
Load when first referenced during execution:
- Knowledge bases
- Secondary agent files in party mode
- Workflow data files
```

#### Progressive Loading (Step by Step)
```
Load as workflow progresses:
- Workflow step files (only current + next)
- Checklist items
- Templates when needed
```

#### Cached Loading (Reuse from Session)
```
Cache and reuse within session:
- Agent files once loaded
- Workflow definitions
- Project context
```

---

## 5. Ambiguity Handling Strategy

### 5.1 Ambiguity Types

| Type | Description | Resolution Strategy |
|------|-------------|---------------------|
| Multi-Intent | Input matches multiple intents equally | Ask clarifying question |
| Vague Intent | Low confidence on all intents | Default to QUICK_CHAT |
| Incomplete | Missing required entity (which agent?) | Request missing info |
| Contradictory | Signals point to incompatible intents | Ask for clarification |

### 5.2 Resolution Strategies

#### Strategy 1: Minimal Default Context
When ambiguity is high, load minimal context and let conversation clarify.

```python
def handle_vague_intent(intent_result: IntentResult) -> ContextManifest:
    """Handle vague/unclear intent with minimal context."""
    manifest = ContextManifest()

    # Load only base essentials
    manifest.add('SYS_BASE')
    manifest.add('SKILL_LIST', version='minimal')
    manifest.add('PROJ_CTX', if_exists=True)

    # Set flag to prompt for clarification
    manifest.needs_clarification = True
    manifest.clarification_prompt = "I'd like to help, but I want to make sure I load the right context. Are you looking to:"
    manifest.clarification_options = [
        ("Work with a specific agent", "AGENT_ACTIVATE"),
        ("Run a workflow", "WORKFLOW_EXECUTE"),
        ("Just chat or ask a question", "QUICK_CHAT"),
    ]

    return manifest
```

#### Strategy 2: Clarifying Question
When two intents are close, ask the user.

```python
CLARIFICATION_TEMPLATES = {
    ('AGENT_ACTIVATE', 'WORKFLOW_EXECUTE'):
        "Would you like to chat with {agent} directly, or run a specific workflow?",

    ('CODE_DEV', 'SECURITY_OPS'):
        "Are you looking to write/review code, or perform a security assessment?",

    ('PARTY_MODE', 'AGENT_ACTIVATE'):
        "Would you like a group discussion (party mode) or to work with just one agent?",
}
```

#### Strategy 3: Progressive Refinement
Start with minimal context, refine as conversation progresses.

```python
class ProgressiveRefinement:
    """Refine intent as more information becomes available."""

    def __init__(self, initial_intent: IntentResult):
        self.current_intent = initial_intent
        self.confidence_history = [initial_intent.confidence]
        self.context_loaded = set()

    def update(self, new_input: str, detector: IntentDetector) -> ContextDelta:
        """Process new input and return context changes."""
        new_result = detector.detect_intent(new_input, self.get_context())

        if new_result.primary_intent != self.current_intent.primary_intent:
            if new_result.confidence > self.current_intent.confidence:
                # Intent changed with higher confidence
                return self._switch_intent(new_result)

        self.confidence_history.append(new_result.confidence)
        return ContextDelta.no_change()

    def _switch_intent(self, new_intent: IntentResult) -> ContextDelta:
        """Switch to new intent, loading required context."""
        old_intent = self.current_intent.primary_intent
        self.current_intent = new_intent

        # Calculate what new context is needed
        new_context = get_required_context(new_intent.primary_intent)
        already_loaded = self.context_loaded

        to_load = new_context - already_loaded
        to_unload = []  # Generally don't unload, just don't use

        return ContextDelta(load=to_load, unload=to_unload)
```

### 5.3 Ambiguity Decision Tree

```
                    Intent Detected
                          |
                          v
              +---------------------+
              | Confidence >= 0.7?  |
              +---------------------+
                   |           |
                  YES          NO
                   |           |
                   v           v
            +----------+  +------------------+
            | PROCEED  |  | Confidence > 0.4?|
            +----------+  +------------------+
                              |         |
                             YES        NO
                              |         |
                              v         v
                    +------------+  +------------------+
                    | CLARIFY:   |  | DEFAULT:         |
                    | Ask user   |  | QUICK_CHAT       |
                    | top 2      |  | with clarify     |
                    | options    |  | prompt           |
                    +------------+  +------------------+
```

---

## 6. Intent Refinement Protocol

### 6.1 Mid-Conversation Intent Changes

Users may shift intent during a conversation. The system must detect and adapt.

#### Refinement Triggers

| Trigger | Example | Action |
|---------|---------|--------|
| Explicit pivot | "Actually, let's switch to..." | Re-detect intent |
| New entity | Agent name mentioned | Check for AGENT_ACTIVATE |
| Command invocation | "/new-workflow" | Switch to WORKFLOW_EXECUTE |
| Topic shift | Security terms in dev context | Evaluate for SECURITY_OPS |
| Completion signal | "Done with that, now..." | Re-detect fresh |

### 6.2 Refinement Protocol

```python
class IntentRefinementProtocol:
    """Protocol for refining intent mid-conversation."""

    PIVOT_PHRASES = [
        "actually", "let's switch", "instead", "wait",
        "never mind", "forget that", "change of plans"
    ]

    def should_refine(self,
                      current_intent: IntentResult,
                      new_input: str,
                      turn_count: int) -> bool:
        """Determine if intent refinement is needed."""

        # Always refine on explicit pivot
        if any(phrase in new_input.lower() for phrase in self.PIVOT_PHRASES):
            return True

        # Check for new command invocation
        if re.match(r'^/', new_input):
            return True

        # Check for new agent mention when not in agent mode
        if current_intent.primary_intent != 'AGENT_ACTIVATE':
            if self._contains_agent_name(new_input):
                return True

        # Re-evaluate every N turns to catch drift
        if turn_count % 5 == 0:
            return True

        return False

    def refine(self,
               current_intent: IntentResult,
               new_input: str,
               context: ConversationContext) -> IntentResult:
        """Perform intent refinement."""

        # Full re-detection
        detector = IntentDetector()
        new_intent = detector.detect_intent(new_input, context)

        # Compare with current
        if new_intent.primary_intent == current_intent.primary_intent:
            # Same intent, potentially update confidence
            return IntentResult(
                primary_intent=new_intent.primary_intent,
                confidence=max(new_intent.confidence, current_intent.confidence),
                is_ambiguous=new_intent.is_ambiguous,
                alternatives=new_intent.alternatives,
                reason="Refined: same intent"
            )

        # Intent changed
        if new_intent.confidence > 0.6:
            # Strong new signal, switch
            return new_intent

        # Weak signal, might be noise
        if current_intent.confidence > new_intent.confidence + 0.2:
            # Current intent still stronger
            return current_intent

        # Unclear - ask user
        return IntentResult(
            primary_intent=current_intent.primary_intent,
            confidence=0.5,
            is_ambiguous=True,
            alternatives=[(new_intent.primary_intent, new_intent.confidence)],
            reason="Potential intent change detected"
        )
```

### 6.3 Context Adjustment on Refinement

When intent changes, context may need adjustment:

```python
def adjust_context_on_refinement(
    old_intent: str,
    new_intent: str,
    current_context: ContextManifest,
    entities: dict
) -> ContextAdjustment:
    """Calculate context changes when intent shifts."""

    old_required = get_required_context(old_intent)
    new_required = get_required_context(new_intent)

    # Components to add
    to_add = new_required - old_required

    # Components that were required but no longer
    # (Don't actively remove, just don't reload if evicted)
    now_optional = old_required - new_required

    # Components that overlap - keep as-is
    keep = old_required & new_required

    return ContextAdjustment(
        add=to_add,
        keep=keep,
        deprioritize=now_optional
    )
```

---

## 7. Examples by Intent Category

### 7.1 AGENT_ACTIVATE Example

**User Input:** "I need Winston to review the architecture"

**Detection:**
```yaml
signals:
  - type: keyword_match
    intent: AGENT_ACTIVATE
    strength: 0.7
    evidence: "talk to / need"
  - type: entity_extraction
    entity: agent
    value: "Winston"

result:
  primary_intent: AGENT_ACTIVATE
  confidence: 0.85
  entities:
    agent: Winston
```

**Context Loaded:**
```yaml
loaded:
  - SYS_BASE (15,000 tokens)
  - TOOL_DEFS (12,000 tokens)
  - SEC_RULES (500 tokens)
  - AGENT_FILE: winston.md (2,100 tokens)
  - PROJ_CTX (3,000 tokens)

skipped:
  - AGENT_MANIFEST (16,000 tokens saved)
  - WF_MANIFEST (7,400 tokens saved)
  - SKILL_LIST full (using minimal)
  - All other agents
  - All workflows
  - All knowledge bases

total: ~33,000 tokens (vs ~75,000 typical)
savings: 56%
```

### 7.2 WORKFLOW_EXECUTE Example

**User Input:** "/flash-assessment on target company X"

**Detection:**
```yaml
signals:
  - type: explicit_command
    intent: WORKFLOW_EXECUTE
    strength: 1.0
    evidence: "Slash command: /flash-assessment"

result:
  primary_intent: WORKFLOW_EXECUTE
  confidence: 1.0
  entities:
    workflow: flash-assessment
    target: "company X"
```

**Context Loaded:**
```yaml
initial_load:
  - SYS_BASE (15,000 tokens)
  - TOOL_DEFS (12,000 tokens)
  - SEC_RULES (500 tokens)
  - WF_FILE: flash-assessment/workflow.md (2,000 tokens)
  - WF_STEP: step-01-triage.md (2,500 tokens)
  - AGENT_FILE: osint-lead.md (2,200 tokens)
  - PROJ_CTX (3,000 tokens)

progressive_load:
  - step-02 when step-01 completes
  - osint-knowledgebase.md if referenced
  - additional agents if parallel collection

skipped:
  - All other workflows
  - All agent manifest
  - Workflow manifest
  - Party presets
  - Unrelated knowledge bases

initial_total: ~37,000 tokens
vs_eager_load: ~65,000 tokens
savings: 43%
```

### 7.3 PARTY_MODE Example

**User Input:** "Let's have Winston, Bastion, and Cipher discuss the threat model"

**Detection:**
```yaml
signals:
  - type: keyword_match
    intent: PARTY_MODE
    strength: 0.7
    evidence: "discuss"
  - type: entity_extraction
    entities:
      agents: [Winston, Bastion, Cipher]

result:
  primary_intent: PARTY_MODE
  confidence: 0.8
  entities:
    agents: [Winston, Bastion, Cipher]
    topic: "threat model"
```

**Context Loaded:**
```yaml
loaded:
  - SYS_BASE (15,000 tokens)
  - TOOL_DEFS (12,000 tokens)
  - SEC_RULES (500 tokens)
  - PARTY_ORCHESTRATOR (1,000 tokens)
  - AGENT_SUM: Winston (200 tokens)
  - AGENT_SUM: Bastion (200 tokens)
  - AGENT_SUM: Cipher (200 tokens)
  - PROJ_CTX (3,000 tokens)

on_agent_speak:
  - Full AGENT_FILE loaded and cached

skipped:
  - Full manifests
  - All workflows
  - Party presets (explicit agents provided)
  - Agents not in conversation

initial_total: ~32,000 tokens
when_all_speak: ~39,000 tokens (cached)
vs_full_load: ~60,000 tokens
savings: 35-47%
```

### 7.4 QUICK_CHAT Example

**User Input:** "What's the difference between a PRD and architecture doc?"

**Detection:**
```yaml
signals:
  - type: keyword_match
    intent: QUICK_CHAT
    strength: 0.7
    evidence: "what's"
  - type: pattern_match
    intent: none (question pattern)

result:
  primary_intent: QUICK_CHAT
  confidence: 0.8
```

**Context Loaded:**
```yaml
loaded:
  - SYS_BASE (15,000 tokens)
  - TOOL_DEFS (12,000 tokens)
  - SEC_RULES (500 tokens)
  - SKILL_LIST_MINIMAL (2,000 tokens)

skipped:
  - All agents
  - All workflows
  - All manifests
  - All knowledge bases
  - Project context (question is general)

total: ~30,000 tokens
vs_typical: ~50,000 tokens
savings: 40%
```

### 7.5 SECURITY_OPS Example

**User Input:** "We detected suspicious activity, need incident response help"

**Detection:**
```yaml
signals:
  - type: keyword_match
    intent: SECURITY_OPS
    strength: 0.7
    evidence: "incident", "suspicious"
  - type: pattern_match
    intent: SECURITY_OPS
    evidence: incident response pattern

result:
  primary_intent: SECURITY_OPS
  confidence: 0.9
  sub_intent: incident_response
```

**Context Loaded:**
```yaml
loaded:
  - SYS_BASE (15,000 tokens)
  - TOOL_DEFS (12,000 tokens)
  - SEC_RULES (500 tokens)
  - AGENT_FILE: incident-commander.md (2,500 tokens)
  - WF_FILE: incident-response-playbook/workflow.md (3,000 tokens)
  - WF_STEP: step-01 (2,500 tokens)
  - PROJ_CTX (3,000 tokens)

progressive:
  - Additional cybersec agents as needed
  - intel-team agents for attribution
  - Compliance knowledge for notifications

skipped:
  - All manifests
  - Unrelated workflows
  - Non-security agents
  - Game dev, legal, strategy knowledge

initial_total: ~38,500 tokens
vs_full_security: ~85,000 tokens
savings: 55%
```

---

## 8. Implementation Recommendations

### 8.1 Phase 1: Core Detection (Week 1)

1. **Implement IntentDetector class**
   - Keyword vocabularies for all 10 intents
   - Entity extraction for agents, workflows, files
   - Basic scoring algorithm

2. **Create minimal indexes**
   - agent-index.yaml (500 tokens vs 16,000)
   - workflow-index.yaml (300 tokens vs 7,400)

3. **Implement context manifest generation**
   - Base rules always applied
   - Intent-specific rules for top 5 intents

### 8.2 Phase 2: Rules Engine (Week 2)

1. **Complete rules engine**
   - All 10 intent categories
   - Conditional loading logic
   - Budget enforcement

2. **Progressive loading infrastructure**
   - Step-by-step workflow loading
   - On-demand knowledge bases
   - Cached agent files

### 8.3 Phase 3: Refinement (Week 3)

1. **Ambiguity handling**
   - Clarification prompts
   - Minimal default strategy
   - Progressive refinement

2. **Intent refinement protocol**
   - Mid-conversation detection
   - Context adjustment
   - Smooth transitions

### 8.4 Phase 4: Optimization (Week 4)

1. **Performance tuning**
   - Measure actual savings
   - Tune detection thresholds
   - Optimize loading strategies

2. **Feedback loop**
   - Track intent accuracy
   - Identify false positives/negatives
   - Improve keyword vocabularies

---

## 9. Success Metrics

| Metric | Baseline | Target | Method |
|--------|----------|--------|--------|
| Avg tokens per session | 40,000 | 15,000 | Measure context manifest size |
| Intent detection accuracy | N/A | 85%+ | Manual labeling of sample |
| Context load time | N/A | <100ms | Measure file loading |
| Unnecessary context loaded | 82% | <20% | Track used vs loaded |
| User clarification rate | N/A | <15% | Track ambiguity prompts |

---

## 10. Appendix: Intent Keyword Reference

### Complete Keyword Lists

```yaml
AGENT_ACTIVATE:
  primary:
    - "talk to"
    - "speak with"
    - "get"
    - "bring in"
    - "activate"
    - "start"
    - "need"
    - "want"
    - "call"
    - "summon"
  role_based:
    - "architect"
    - "developer"
    - "analyst"
    - "designer"
    - "manager"
    - "expert"

WORKFLOW_EXECUTE:
  primary:
    - "run"
    - "execute"
    - "start"
    - "begin"
    - "do"
    - "perform"
  creation:
    - "create"
    - "generate"
    - "build"
    - "make"
    - "produce"
  workflow_names:
    - "prd"
    - "architecture"
    - "epic"
    - "story"
    - "sprint"
    - "assessment"

PARTY_MODE:
  primary:
    - "party mode"
    - "team discussion"
    - "group"
    - "together"
    - "collaborate"
    - "all agents"
    - "multiple agents"
    - "team meeting"

QUICK_CHAT:
  questions:
    - "what is"
    - "what's"
    - "how do"
    - "how does"
    - "can you"
    - "could you"
    - "explain"
    - "help"
    - "tell me"
  modifiers:
    - "question"
    - "quick"
    - "just"
    - "simply"
    - "briefly"

RESEARCH:
  primary:
    - "research"
    - "investigate"
    - "find out"
    - "analyze"
    - "study"
    - "explore"
    - "deep dive"
    - "look into"
  domains:
    - "market"
    - "competitor"
    - "technical"
    - "domain"

PROJECT_MGMT:
  project:
    - "project"
    - "status"
    - "progress"
    - "track"
    - "manage"
  agile:
    - "sprint"
    - "epic"
    - "story"
    - "backlog"
  routing:
    - "what's next"
    - "next step"
    - "what should"
    - "assign"

CODE_DEV:
  development:
    - "implement"
    - "code"
    - "develop"
    - "build"
    - "write"
    - "create"
  maintenance:
    - "fix"
    - "bug"
    - "refactor"
    - "update"
    - "modify"
  quality:
    - "test"
    - "review"
    - "check"
    - "verify"

DOCUMENTATION:
  primary:
    - "document"
    - "docs"
    - "readme"
    - "write up"
    - "technical writing"
  types:
    - "api docs"
    - "user guide"
    - "reference"
    - "tutorial"

SECURITY_OPS:
  threats:
    - "security"
    - "vulnerability"
    - "threat"
    - "exploit"
    - "attack"
    - "breach"
    - "incident"
  processes:
    - "audit"
    - "assessment"
    - "penetration"
    - "pentest"
  compliance:
    - "compliance"
    - "gdpr"
    - "hipaa"
    - "pci"
    - "soc"

INTEL_OPS:
  intelligence:
    - "osint"
    - "intelligence"
    - "recon"
    - "reconnaissance"
  investigation:
    - "target"
    - "investigate"
    - "attribution"
    - "campaign"
    - "actor"
  analysis:
    - "threat actor"
    - "indicator"
    - "ioc"
```

---

*Document created by Dr. Quinn, Master Problem Solver*
*BMAD-CONCURA Project - Context Optimization Initiative*
