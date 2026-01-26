# Lazy Context Loader Implementation Specification

**Story:** CONCURA-3.2 - Implement Lazy Context Loader
**Author:** Winston (System Architect)
**Date:** 2026-01-17
**Version:** 1.0
**Status:** Design Complete

---

## 1. Executive Summary

This specification defines the Lazy Context Loader module - a core component of the BMAD-CONCURA context optimization initiative. The loader implements a "load what you need, when you need it" philosophy that dramatically reduces token consumption while maintaining full functionality.

### Key Design Principles

1. **On-Demand Loading**: Context is loaded only when explicitly required by user action or workflow progression
2. **Session Caching**: Loaded context is cached within the session to prevent redundant loads
3. **Graceful Degradation**: Failed loads do not crash operations; fallbacks ensure continuity
4. **Seamless Experience**: Loading operations are invisible to users; no perceived latency or disruption
5. **Tier-Aligned**: Loader respects the three-tier architecture (Minimal, Standard, Full)

### Token Savings Summary

| Loading Strategy | Baseline Tokens | Optimized Tokens | Reduction |
|------------------|-----------------|------------------|-----------|
| Eager (Current)  | 40,000-80,000   | -                | 0%        |
| Lazy (Proposed)  | -               | 15,000-35,000    | 50-65%    |

---

## 2. Architecture Overview

### 2.1 Component Diagram

```
                                    +-------------------------+
                                    |     User Request        |
                                    +------------+------------+
                                                 |
                                                 v
                                    +------------+------------+
                                    |    Intent Detector      |
                                    |  (from CONCURA-2.3)     |
                                    +------------+------------+
                                                 |
                                                 v
                                    +------------+------------+
                                    |   Context Rules Engine  |
                                    |  (context-loading-rules |
                                    |          .yaml)         |
                                    +------------+------------+
                                                 |
              +----------------------------------+----------------------------------+
              |                                  |                                  |
              v                                  v                                  v
+-------------+-------------+    +--------------+--------------+    +--------------+--------------+
|      Eager Loader         |    |       Lazy Loader           |    |    Progressive Loader       |
|  (Session Initialization) |    |   (On-Demand Loading)       |    |    (Workflow Steps)         |
+-------------+-------------+    +--------------+--------------+    +--------------+--------------+
              |                                  |                                  |
              +----------------------------------+----------------------------------+
                                                 |
                                                 v
                                    +------------+------------+
                                    |     Session Cache       |
                                    |  (In-Memory Context)    |
                                    +------------+------------+
                                                 |
                                                 v
                                    +------------+------------+
                                    |    Context Assembler    |
                                    | (Builds Final Context)  |
                                    +------------+------------+
                                                 |
                                                 v
                                    +------------+------------+
                                    |      BMAD Runtime       |
                                    +-------------------------+
```

### 2.2 Core Components

| Component | Responsibility | Location |
|-----------|----------------|----------|
| Intent Detector | Classify user request intent | Story CONCURA-2.3 |
| Context Rules Engine | Determine what to load based on intent | `context-loading-rules.yaml` |
| Eager Loader | Load mandatory components at session start | `context-loader.xml` |
| Lazy Loader | Load components on first reference | `context-loader.xml` |
| Progressive Loader | Load workflow steps incrementally | `context-loader.xml` |
| Session Cache | Store loaded context for reuse | Runtime component |
| Context Assembler | Combine cached components into context | Runtime component |

---

## 3. Loading Strategies

### 3.1 Eager Loading (Session Initialization)

**When:** At session start, before any user interaction
**What:** Minimal tier components only

```yaml
eager_load_components:
  always:
    - SYS_BASE          # ~15,000 tokens - Claude Code base
    - TOOL_DEFS         # ~12,000 tokens - Tool definitions
    - SEC_RULES         # ~500 tokens - Security rules reference

  conditional:
    - AGENT_INDEX       # ~500 tokens - If likely to need agent lookup
    - WF_INDEX          # ~300 tokens - If likely to need workflow lookup
    - PROJ_CTX          # ~3,000 tokens - If project-context.md exists
```

**Trigger Conditions:**
- Session initialization
- Explicit session reset
- Framework reload

### 3.2 Lazy Loading (On-Demand)

**When:** First reference or explicit activation
**What:** Agents, workflows, knowledge bases

#### 3.2.1 Agent Lazy Loading

**Trigger:** User activates agent explicitly OR agent is required for workflow

```python
# Pseudocode for agent lazy loading
def load_agent_on_demand(agent_id: str, session: Session) -> AgentContext:
    """
    Load agent context only when needed.

    AC1: Agent details loaded only when agent is explicitly activated
    """
    # Check cache first (AC5: Caching prevents redundant loads)
    if session.cache.has_agent(agent_id):
        return session.cache.get_agent(agent_id)

    # Resolve agent path
    agent_path = resolve_agent_path(agent_id)

    # Load agent file (AC6: Error handling with graceful degradation)
    try:
        agent_content = read_file(agent_path)
        agent_context = parse_agent_file(agent_content)

        # Cache for session reuse
        session.cache.store_agent(agent_id, agent_context)

        return agent_context

    except FileNotFoundError:
        # Graceful degradation: Return minimal agent stub
        return create_minimal_agent_stub(agent_id)

    except ParseError as e:
        # Log error but don't fail
        log_warning(f"Agent parse error for {agent_id}: {e}")
        return create_minimal_agent_stub(agent_id)
```

#### 3.2.2 Workflow Lazy Loading

**Trigger:** User invokes workflow OR workflow is assigned by project manager

```python
# Pseudocode for workflow lazy loading
def load_workflow_on_demand(workflow_id: str, session: Session) -> WorkflowContext:
    """
    Load workflow context only when invoked.

    AC2: Workflow details loaded only when workflow is invoked
    """
    # Check cache first
    if session.cache.has_workflow(workflow_id):
        return session.cache.get_workflow(workflow_id)

    # Resolve workflow path
    workflow_path = resolve_workflow_path(workflow_id)

    try:
        # Load only the entry file, not all steps
        workflow_content = read_file(f"{workflow_path}/workflow.md")
        workflow_context = parse_workflow_entry(workflow_content)

        # Also load first step if exists
        first_step_path = f"{workflow_path}/steps/step-01.md"
        if file_exists(first_step_path):
            workflow_context.current_step = read_file(first_step_path)

        # Cache workflow entry
        session.cache.store_workflow(workflow_id, workflow_context)

        return workflow_context

    except FileNotFoundError:
        # Graceful degradation: Suggest similar workflows
        suggestions = find_similar_workflows(workflow_id)
        return WorkflowNotFoundResult(workflow_id, suggestions)
```

#### 3.2.3 Knowledge Base Lazy Loading

**Trigger:** Explicit reference in conversation OR workflow step requires knowledge

```python
def load_knowledge_on_reference(kb_id: str, session: Session) -> KnowledgeContext:
    """
    Load knowledge base slice only when referenced.

    Uses INDEX_GUIDED strategy to load only relevant sections.
    """
    # Check cache
    if session.cache.has_knowledge(kb_id):
        return session.cache.get_knowledge(kb_id)

    kb_path = resolve_knowledge_path(kb_id)

    try:
        # Try INDEX_GUIDED loading first
        index_path = f"{kb_path}/index.md"
        if file_exists(index_path):
            return load_knowledge_index_guided(kb_path, session)

        # Fall back to full load if no index
        return load_knowledge_full(kb_path, session)

    except Exception as e:
        log_warning(f"Knowledge load failed for {kb_id}: {e}")
        return KnowledgeNotAvailable(kb_id)
```

### 3.3 Progressive Loading (Workflow Steps)

**When:** Workflow step completion triggers next step load
**What:** Individual workflow step files

```python
def load_next_workflow_step(workflow: WorkflowContext, session: Session) -> StepContext:
    """
    Load next workflow step when current step completes.

    Progressive strategy: Only current + next step ever in context.
    """
    current_step_num = workflow.current_step_number
    next_step_num = current_step_num + 1

    # Check if next step exists
    next_step_path = f"{workflow.path}/steps/step-{next_step_num:02d}.md"

    if not file_exists(next_step_path):
        # Workflow complete
        return StepComplete(workflow_id=workflow.id)

    try:
        next_step_content = read_file(next_step_path)
        step_context = parse_step_file(next_step_content)

        # Replace current step in cache (don't accumulate)
        session.cache.replace_current_step(workflow.id, step_context)

        return step_context

    except Exception as e:
        log_error(f"Step load failed: {e}")
        # Graceful degradation: Allow manual step execution
        return StepLoadError(step_num=next_step_num, error=str(e))
```

---

## 4. Cross-Module Loading Rules

### 4.1 Cross-Module Detection

**AC3:** Cross-module context loaded only on cross-module operations

Cross-module operations occur when:
1. User explicitly requests agents from different modules
2. Workflow invokes agents from different modules
3. Party Mode with cross-module presets
4. Intelligence operations requiring security consultation (or vice versa)

```python
def detect_cross_module_operation(request: Request, session: Session) -> bool:
    """
    Detect if operation spans multiple BMAD modules.
    """
    # Extract module references
    referenced_modules = set()

    # Check mentioned agents
    for agent in extract_agent_references(request):
        agent_module = get_agent_module(agent)
        referenced_modules.add(agent_module)

    # Check workflow module
    if request.workflow:
        workflow_module = get_workflow_module(request.workflow)
        referenced_modules.add(workflow_module)

    # Check active session modules
    for active_agent in session.active_agents:
        referenced_modules.add(get_agent_module(active_agent))

    # Cross-module if more than one module involved
    return len(referenced_modules) > 1

def load_cross_module_context(modules: set[str], session: Session) -> CrossModuleContext:
    """
    Load cross-module coordination context when multiple modules involved.
    """
    # Only load if not already in session
    if session.has_cross_module_context():
        return session.cross_module_context

    cross_module = CrossModuleContext()

    # Load module boundaries
    cross_module.boundaries = load_module_boundaries(modules)

    # Load handoff protocols
    cross_module.handoffs = load_handoff_protocols(modules)

    # Load conflict resolution rules
    cross_module.conflict_resolution = load_conflict_rules()

    # Cache for session
    session.cache.store_cross_module(cross_module)

    return cross_module
```

### 4.2 Module Boundary Definitions

```yaml
module_boundaries:
  core:
    description: "Core orchestration and project management"
    primary_agents: [abdul, bmad-master]
    can_invoke:
      - all modules  # Core can orchestrate any module

  bmm:
    description: "Software development lifecycle"
    primary_agents: [dev, architect, pm, analyst, qa, designer]
    can_invoke:
      - core
      - cybersec-team  # For security reviews

  cybersec-team:
    description: "Security operations and assessments"
    primary_agents: [security-architect, incident-commander, penetration-tester]
    can_invoke:
      - core
      - intel-team  # For threat intelligence
      - legal-team  # For compliance

  intel-team:
    description: "Intelligence and OSINT operations"
    primary_agents: [osint-lead, threat-actor-profiler, dark-web-analyst]
    can_invoke:
      - core
      - cybersec-team  # For security correlation

  legal-team:
    description: "Legal and compliance operations"
    primary_agents: [counsel, compliance-officer]
    can_invoke:
      - core
      - cybersec-team  # For incident legal review

  strategy-team:
    description: "Strategic advisory and decision support"
    primary_agents: [the-master-strategist, political-strategist]
    can_invoke:
      - core
      - legal-team  # For legal strategy
```

---

## 5. Session Caching Strategy

### 5.1 Cache Architecture

**AC5:** Caching prevents redundant loads within session

```python
class SessionCache:
    """
    In-memory cache for loaded context within a single session.

    Design principles:
    - Cache is session-scoped (cleared on session end)
    - LRU eviction when memory pressure (configurable limit)
    - Time-based expiry for dynamic content (e.g., git status)
    """

    def __init__(self, config: CacheConfig):
        self.max_tokens = config.max_cached_tokens  # Default: 100,000
        self.current_tokens = 0

        # Separate caches by component type
        self.agents: dict[str, CachedAgent] = {}
        self.workflows: dict[str, CachedWorkflow] = {}
        self.knowledge: dict[str, CachedKnowledge] = {}
        self.steps: dict[str, CachedStep] = {}  # Current step only
        self.cross_module: CrossModuleContext | None = None

        # Access tracking for LRU
        self.access_times: dict[str, datetime] = {}

        # Token estimates
        self.token_estimates: dict[str, int] = {}

    def store_agent(self, agent_id: str, context: AgentContext) -> None:
        """Store agent with LRU management."""
        tokens = estimate_tokens(context)

        # Evict if necessary
        while self.current_tokens + tokens > self.max_tokens:
            self._evict_lru()

        self.agents[agent_id] = CachedAgent(
            context=context,
            loaded_at=datetime.now(),
            tokens=tokens
        )
        self.current_tokens += tokens
        self.access_times[f"agent:{agent_id}"] = datetime.now()

    def get_agent(self, agent_id: str) -> AgentContext | None:
        """Get agent and update access time."""
        if agent_id in self.agents:
            self.access_times[f"agent:{agent_id}"] = datetime.now()
            return self.agents[agent_id].context
        return None

    def has_agent(self, agent_id: str) -> bool:
        """Check if agent is cached."""
        return agent_id in self.agents

    def _evict_lru(self) -> None:
        """Evict least recently used item."""
        if not self.access_times:
            return

        # Find LRU item
        lru_key = min(self.access_times, key=self.access_times.get)

        # Evict based on type
        if lru_key.startswith("agent:"):
            agent_id = lru_key.split(":")[1]
            if agent_id in self.agents:
                self.current_tokens -= self.agents[agent_id].tokens
                del self.agents[agent_id]

        elif lru_key.startswith("workflow:"):
            workflow_id = lru_key.split(":")[1]
            if workflow_id in self.workflows:
                self.current_tokens -= self.workflows[workflow_id].tokens
                del self.workflows[workflow_id]

        elif lru_key.startswith("knowledge:"):
            kb_id = lru_key.split(":")[1]
            if kb_id in self.knowledge:
                self.current_tokens -= self.knowledge[kb_id].tokens
                del self.knowledge[kb_id]

        del self.access_times[lru_key]
```

### 5.2 Cache Policies

| Component Type | Cache Duration | Eviction Priority | Refresh Trigger |
|----------------|----------------|-------------------|-----------------|
| Agents | Session lifetime | Low (keep active agent) | Never |
| Workflows | Session lifetime | Low (keep active) | Never |
| Current Step | Until step completes | N/A (replaced) | Step completion |
| Knowledge | Session lifetime | High (evict first) | Never |
| Cross-Module | Session lifetime | Low | Module change |
| Git Status | 5 minutes | High | File changes |
| Project Context | 30 minutes | Medium | Manual refresh |

### 5.3 Cache Warming

For predictable operations, pre-warm cache during idle time:

```python
def warm_cache_for_intent(intent: Intent, session: Session) -> None:
    """
    Pre-load likely-needed context based on detected intent.

    Runs in background, doesn't block user interaction.
    """
    if intent.primary == "WORKFLOW_EXECUTE":
        # Pre-load primary agent for workflow
        workflow = resolve_workflow(intent.workflow_id)
        if workflow.primary_agent:
            background_load_agent(workflow.primary_agent, session)

    elif intent.primary == "PARTY_MODE":
        # Pre-load agent summaries (not full files)
        for agent in intent.participating_agents:
            background_load_agent_summary(agent, session)

    elif intent.primary == "SECURITY_OPS":
        # Pre-load security lead agent
        background_load_agent("security-architect", session)
```

---

## 6. Error Handling and Graceful Degradation

### 6.1 Error Categories

**AC6:** Error handling for failed loads with graceful degradation

| Error Type | Cause | Degradation Strategy |
|------------|-------|----------------------|
| `FileNotFound` | Agent/workflow file missing | Suggest alternatives |
| `ParseError` | Malformed YAML/MD | Use minimal stub |
| `TokenOverflow` | Context exceeds budget | Trim or escalate tier |
| `NetworkError` | External resource unavailable | Use cached or skip |
| `TimeoutError` | Load took too long | Return partial content |

### 6.2 Degradation Handlers

```python
class DegradationHandlers:
    """
    Handlers for graceful degradation when loads fail.
    """

    @staticmethod
    def agent_not_found(agent_id: str) -> AgentDegradedContext:
        """
        When agent file cannot be found.

        Strategy: Return minimal stub and suggest similar agents.
        """
        similar = find_similar_agents(agent_id)

        return AgentDegradedContext(
            agent_id=agent_id,
            status="not_found",
            message=f"Agent '{agent_id}' not found.",
            suggestions=similar,
            stub=MinimalAgentStub(
                id=agent_id,
                identity=f"I am {agent_id}, but my full configuration is unavailable.",
                capabilities=["General conversation", "Routing to other agents"]
            )
        )

    @staticmethod
    def workflow_not_found(workflow_id: str) -> WorkflowDegradedContext:
        """
        When workflow cannot be found.

        Strategy: List available workflows and suggest matches.
        """
        suggestions = find_similar_workflows(workflow_id)

        return WorkflowDegradedContext(
            workflow_id=workflow_id,
            status="not_found",
            message=f"Workflow '{workflow_id}' not found.",
            suggestions=suggestions,
            available_workflows=list_available_workflows()
        )

    @staticmethod
    def step_load_failed(workflow_id: str, step_num: int, error: str) -> StepDegradedContext:
        """
        When workflow step cannot be loaded.

        Strategy: Allow manual step execution or skip to next.
        """
        return StepDegradedContext(
            workflow_id=workflow_id,
            step_num=step_num,
            status="load_failed",
            error=error,
            options=[
                "manual: Describe what this step should do",
                "skip: Skip to next step",
                "abort: Exit workflow"
            ]
        )

    @staticmethod
    def knowledge_unavailable(kb_id: str) -> KnowledgeDegradedContext:
        """
        When knowledge base cannot be loaded.

        Strategy: Continue without knowledge, note limitation.
        """
        return KnowledgeDegradedContext(
            kb_id=kb_id,
            status="unavailable",
            message=f"Knowledge base '{kb_id}' is unavailable. "
                    f"Responses may be less detailed in this domain.",
            fallback="general_knowledge"
        )

    @staticmethod
    def token_overflow(
        current_tokens: int,
        budget: int,
        components: list[str]
    ) -> OverflowDegradedContext:
        """
        When context exceeds token budget.

        Strategy: Trim least important or escalate tier.
        """
        excess = current_tokens - budget

        # Calculate what to trim
        trimmable = identify_trimmable_components(components)
        trim_plan = create_trim_plan(trimmable, excess)

        return OverflowDegradedContext(
            status="overflow",
            current_tokens=current_tokens,
            budget=budget,
            excess=excess,
            options=[
                f"trim: Remove {trim_plan.components} (-{trim_plan.tokens} tokens)",
                "escalate: Escalate to higher tier (more budget)",
                "summarize: Summarize loaded content to reduce size"
            ]
        )
```

### 6.3 Error Recovery Flow

```
                        +-------------------+
                        |   Load Requested  |
                        +--------+----------+
                                 |
                                 v
                        +--------+----------+
                        |   Attempt Load    |
                        +--------+----------+
                                 |
              +------------------+------------------+
              | SUCCESS                             | FAILURE
              v                                     v
    +---------+----------+               +---------+----------+
    |  Store in Cache    |               |  Classify Error    |
    +---------+----------+               +---------+----------+
              |                                     |
              v                           +---------+---------+
    +---------+----------+               |                   |
    |  Return Context    |         RECOVERABLE        NON-RECOVERABLE
    +--------------------+               |                   |
                                         v                   v
                              +----------+-------+  +--------+--------+
                              | Apply Fallback   |  | Return Degraded |
                              | Strategy         |  | Context + Error |
                              +----------+-------+  +-----------------+
                                         |
                                         v
                              +----------+-------+
                              | Retry with       |
                              | Fallback         |
                              +----------+-------+
                                         |
              +--------------------------|-------------------------+
              | SUCCESS                  | FAILURE                 |
              v                          v                         |
    +---------+----------+    +----------+-------+                |
    |  Store in Cache    |    | Log Warning      |                |
    |  (mark degraded)   |    | Return Degraded  |                |
    +--------------------+    +------------------+                |
```

---

## 7. Seamless User Experience

### 7.1 Transparency Requirements

**AC4:** Loading is seamless to user experience

Users should never:
- See loading spinners for BMAD context
- Experience delays during agent activation
- Notice context switching during workflows
- Be asked to wait for context loading

### 7.2 Implementation Techniques

```python
class SeamlessLoader:
    """
    Loader that maintains seamless user experience.
    """

    async def load_with_streaming(
        self,
        component: str,
        session: Session,
        user_response_generator: AsyncGenerator
    ) -> AsyncGenerator:
        """
        Load context while streaming user response.

        The user sees the response starting immediately while
        context loads in parallel.
        """
        # Start response generation (doesn't need full context yet)
        response_task = asyncio.create_task(
            self._start_response(user_response_generator)
        )

        # Load context in parallel
        context_task = asyncio.create_task(
            self._load_context(component, session)
        )

        # Stream response tokens as they're ready
        async for token in response_task:
            yield token

        # Ensure context is loaded by response end
        await context_task

    def load_anticipatory(
        self,
        predicted_components: list[str],
        session: Session
    ) -> None:
        """
        Load components that are likely to be needed soon.

        Called during natural pauses (user typing, thinking).
        Non-blocking, doesn't affect current operation.
        """
        for component in predicted_components:
            if not session.cache.has(component):
                # Background load with low priority
                asyncio.create_task(
                    self._background_load(component, session),
                    name=f"anticipatory_{component}"
                )

    def precompute_context_manifest(
        self,
        intent: Intent,
        session: Session
    ) -> ContextManifest:
        """
        Determine full context needs upfront.

        Called immediately on intent detection, before user
        sees any response. Enables parallel loading.
        """
        manifest = ContextManifest()

        # Base components (already loaded)
        manifest.add_if_missing("SYS_BASE", session)
        manifest.add_if_missing("TOOL_DEFS", session)
        manifest.add_if_missing("SEC_RULES", session)

        # Intent-specific components
        rules = load_context_rules()
        intent_config = rules.get_intent_config(intent.primary)

        for component in intent_config.load:
            manifest.add_if_missing(component, session)

        return manifest
```

### 7.3 Response Latency Targets

| Operation | Target Latency | Strategy |
|-----------|----------------|----------|
| Agent activation | < 100ms | Pre-warm on intent detection |
| Workflow invocation | < 200ms | Pre-load entry + step 1 |
| Step transition | < 50ms | Pre-load next step |
| Party mode start | < 300ms | Load summaries first |
| Knowledge lookup | < 500ms | Background load |

---

## 8. Integration with BMAD Activation

### 8.1 Activation Flow Integration

The lazy loader integrates with the existing BMAD activation flow:

```
Session Start
    |
    v
Load Minimal Tier (Eager)
    |
    v
Wait for User Input
    |
    v
Detect Intent (CONCURA-2.3)
    |
    v
Generate Context Manifest
    |
    v
+---+---+---+---+---+
|   |   |   |   |   |
v   v   v   v   v   v
Parallel Context Loading
(only missing components)
    |
    v
Assemble Context
    |
    v
Execute Operation
    |
    v
Cache Results
```

### 8.2 BMAD Task Hook

The context loader should be invoked before workflow execution:

```xml
<!-- Integration point in workflow.xml -->
<pre-execution-hook name="context-loader">
  <description>
    Load required context before workflow execution.
    Integrates with lazy loading system.
  </description>

  <invocation>
    <check>Intent detected and context manifest generated</check>
    <action>Invoke context-loader.xml with manifest</action>
    <action>Wait for all required context to load</action>
    <action>Verify context completeness</action>
    <fallback>If context incomplete, apply degradation strategy</fallback>
  </invocation>
</pre-execution-hook>
```

### 8.3 Agent Activation Hook

```python
def on_agent_activation(agent_id: str, session: Session) -> None:
    """
    Hook called when user activates an agent.

    Implements lazy loading for agent context.
    """
    # 1. Load agent file (lazy)
    agent_context = load_agent_on_demand(agent_id, session)

    # 2. Load agent's menu handler (reference only)
    # Full handler loaded on menu item selection

    # 3. Transition tier if needed
    if session.current_tier == TIER_MINIMAL:
        session.transition_to(TIER_STANDARD)

    # 4. Set active agent
    session.set_active_agent(agent_id, agent_context)

    # 5. Pre-warm agent's common workflows (background)
    warm_agent_workflows(agent_id, session)
```

---

## 9. Configuration Schema

### 9.1 Context Loading Configuration

See `context-loading-rules.yaml` for full schema. Key sections:

```yaml
# Context loader configuration
context_loader:
  version: "1.0"

  # Global settings
  settings:
    max_cache_tokens: 100000
    cache_ttl_minutes: 60
    enable_anticipatory_loading: true
    enable_background_loading: true

  # Loading strategies
  strategies:
    eager:
      components: [SYS_BASE, TOOL_DEFS, SEC_RULES]

    lazy:
      agents: true
      workflows: true
      knowledge: true

    progressive:
      workflow_steps: true
      load_ahead: 1  # Load N steps ahead

  # Error handling
  error_handling:
    max_retries: 2
    retry_delay_ms: 100
    fallback_enabled: true

  # Monitoring
  monitoring:
    log_load_times: true
    log_cache_hits: true
    alert_on_slow_loads: true
    slow_load_threshold_ms: 500
```

---

## 10. Testing Requirements

### 10.1 Unit Tests

```python
class TestLazyLoader:
    """Unit tests for lazy loading functionality."""

    def test_agent_loaded_only_on_activation(self):
        """AC1: Agent details loaded only when explicitly activated."""
        session = create_test_session()

        # Agent not loaded initially
        assert not session.cache.has_agent("winston")

        # Activate agent
        load_agent_on_demand("winston", session)

        # Now agent is loaded
        assert session.cache.has_agent("winston")

    def test_workflow_loaded_only_on_invocation(self):
        """AC2: Workflow details loaded only when invoked."""
        session = create_test_session()

        # Workflow not loaded initially
        assert not session.cache.has_workflow("create-prd")

        # Invoke workflow
        load_workflow_on_demand("create-prd", session)

        # Now workflow is loaded
        assert session.cache.has_workflow("create-prd")

    def test_cross_module_loaded_only_on_cross_module_ops(self):
        """AC3: Cross-module context loaded only on cross-module operations."""
        session = create_test_session()

        # Single module operation
        load_agent_on_demand("winston", session)  # bmm module
        assert not session.has_cross_module_context()

        # Cross-module operation
        load_agent_on_demand("bastion", session)  # cybersec module

        # Now cross-module context should be loaded
        assert session.has_cross_module_context()

    def test_loading_seamless_no_user_delay(self):
        """AC4: Loading is seamless to user experience."""
        session = create_test_session()

        start_time = time.time()

        # Activate agent
        load_agent_on_demand("winston", session)

        elapsed = time.time() - start_time

        # Should be under 100ms
        assert elapsed < 0.1

    def test_cache_prevents_redundant_loads(self):
        """AC5: Caching prevents redundant loads within session."""
        session = create_test_session()
        load_counter = MockLoadCounter()

        # First load
        load_agent_on_demand("winston", session)
        assert load_counter.count == 1

        # Second "load" should hit cache
        load_agent_on_demand("winston", session)
        assert load_counter.count == 1  # Still 1, no new load

    def test_graceful_degradation_on_error(self):
        """AC6: Error handling for failed loads with graceful degradation."""
        session = create_test_session()

        # Try to load non-existent agent
        result = load_agent_on_demand("nonexistent-agent", session)

        # Should return degraded context, not throw
        assert result.status == "not_found"
        assert len(result.suggestions) > 0
        assert result.stub is not None
```

### 10.2 Integration Tests

```python
class TestLazyLoaderIntegration:
    """Integration tests for lazy loader with BMAD runtime."""

    def test_full_agent_activation_flow(self):
        """Test complete agent activation with lazy loading."""
        session = start_bmad_session()

        # Simulate user request
        response = session.handle("Talk to Winston about architecture")

        # Winston should be loaded
        assert session.cache.has_agent("winston")

        # Response should include Winston's persona
        assert "architect" in response.lower()

    def test_workflow_execution_with_lazy_steps(self):
        """Test workflow with progressive step loading."""
        session = start_bmad_session()

        # Start workflow
        session.handle("/create-prd")

        # Only step 1 should be loaded
        assert session.cache.has_workflow_step("create-prd", 1)
        assert not session.cache.has_workflow_step("create-prd", 2)

        # Complete step 1
        session.handle("continue")

        # Now step 2 should be loaded
        assert session.cache.has_workflow_step("create-prd", 2)
```

---

## 11. Success Metrics

### 11.1 Key Performance Indicators

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Avg session tokens | 40,000 | 20,000 | Context size tracking |
| Agent activation latency | 500ms | 100ms | Timing instrumentation |
| Cache hit rate | N/A | > 80% | Cache analytics |
| Load failure rate | N/A | < 1% | Error logging |
| User-perceived delay | Noticeable | Imperceptible | User testing |

### 11.2 Monitoring Dashboard

Track:
- Context loads per session
- Cache hits vs misses
- Load latencies by component type
- Degradation events
- Token consumption over time

---

## 12. Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
- Implement SessionCache class
- Implement basic lazy loaders
- Create context-loading-rules.yaml
- Unit tests

### Phase 2: Integration (Week 2)
- Integrate with BMAD activation flow
- Implement progressive workflow loading
- Add error handling and degradation
- Integration tests

### Phase 3: Optimization (Week 3)
- Implement anticipatory loading
- Add cache warming
- Optimize latencies
- Performance testing

### Phase 4: Polish (Week 4)
- Documentation
- Monitoring setup
- Edge case handling
- Production deployment

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Eager Loading** | Loading components at session start |
| **Lazy Loading** | Loading components on first use |
| **Progressive Loading** | Loading workflow steps incrementally |
| **Cache Warming** | Pre-loading likely-needed components |
| **Graceful Degradation** | Continuing with reduced functionality on error |
| **Context Manifest** | List of components to load for an operation |
| **Session Cache** | In-memory store of loaded context |

---

## Appendix B: Related Documents

| Document | Path | Description |
|----------|------|-------------|
| Tier Architecture | `planning/tier-architecture.md` | Three-tier context loading design |
| Intent Context Spec | `planning/intent-context-spec.md` | Intent detection and mapping |
| Context Mapping | `planning/intent-context-mapping.yaml` | Intent to component mapping |
| Context Loading Rules | `_bmad/_config/context-loading-rules.yaml` | Runtime configuration |
| Context Loader Task | `_bmad/core/tasks/context-loader.xml` | Task implementation |

---

*Document generated by Winston, System Architect*
*BMAD-CONCURA Project - Lazy Context Loader Specification*
*Story: CONCURA-3.2*
