# BMAD-CONCURA: Context Curation Efficiency Initiative

## Project Overview

**Goal:** Achieve 5-10x improvement in BMAD context/token efficiency
**Target:** Reduce token consumption while preserving full functionality
**Strike Team:** Winston (Architect), Bastion (Security), Amelia (Dev), Dr. Quinn (Problem Solver), Victor (Innovation)

---

## Epic 1: Context Audit & Discovery

**Epic ID:** CONCURA-E1
**Lead:** Winston (Architect) + Dr. Quinn (Problem Solver)
**Goal:** Map and measure all context sources to establish baseline and identify optimization opportunities

### Story 1.1: Context Source Inventory

**ID:** CONCURA-1.1
**As a** BMAD maintainer
**I want** a complete inventory of all context sources
**So that** I understand what contributes to token consumption

**Acceptance Criteria:**
- [ ] AC1: Catalog all manifest files (agent-manifest.csv, workflow-manifest.csv)
- [ ] AC2: Document all config files loaded during activation (_bmad/core/config.yaml, etc.)
- [ ] AC3: List all agent files with character counts and estimated tokens
- [ ] AC4: List all workflow files with character counts and estimated tokens
- [ ] AC5: Identify skill registration mechanism and measure skill list token cost
- [ ] AC6: Document CLAUDE.md and project context loading patterns
- [ ] AC7: Create context source map showing load order and dependencies

**Tasks:**
- [ ] T1: Write script to scan _bmad folder structure and categorize files
- [ ] T2: Calculate token estimates for each file category (chars / 4 approximation)
- [ ] T3: Create context-sources-inventory.md with findings
- [ ] T4: Generate visualization of context flow

**Story Points:** 5
**Priority:** P0 - Critical Path

---

### Story 1.2: Token Consumption Baseline Measurement

**ID:** CONCURA-1.2
**As a** BMAD maintainer
**I want** precise token measurements for common usage patterns
**So that** I can measure improvement after optimization

**Acceptance Criteria:**
- [ ] AC1: Measure tokens for "agent activation only" scenario
- [ ] AC2: Measure tokens for "agent + single workflow" scenario
- [ ] AC3: Measure tokens for "cross-module consultation" scenario
- [ ] AC4: Measure tokens for "party mode with 3 agents" scenario
- [ ] AC5: Document baseline in standardized format for comparison
- [ ] AC6: Identify top 5 token consumers by category

**Tasks:**
- [ ] T1: Create test scenarios for each measurement case
- [ ] T2: Use Claude token counter or tiktoken to measure actual consumption
- [ ] T3: Create baseline-measurements.md with all findings
- [ ] T4: Create token-consumption-breakdown.csv for analysis

**Story Points:** 3
**Priority:** P0 - Critical Path

---

### Story 1.3: Redundancy & Waste Pattern Analysis

**ID:** CONCURA-1.3
**As a** BMAD maintainer
**I want** to identify redundant and wasteful context loading patterns
**So that** I can target the highest-impact optimizations

**Acceptance Criteria:**
- [ ] AC1: Identify duplicate information across manifests and agent files
- [ ] AC2: Identify context loaded but never used in typical workflows
- [ ] AC3: Identify verbose descriptions that could be summarized
- [ ] AC4: Map eager-load vs lazy-load candidates
- [ ] AC5: Calculate potential token savings per optimization opportunity
- [ ] AC6: Rank opportunities by impact/effort ratio

**Tasks:**
- [ ] T1: Compare manifest entries to agent file contents for duplication
- [ ] T2: Analyze workflow execution traces to identify unused context
- [ ] T3: Create waste-analysis.md with categorized findings
- [ ] T4: Create optimization-opportunities.csv ranked by ROI

**Story Points:** 5
**Priority:** P0 - Critical Path

---

## Epic 2: Architecture Redesign

**Epic ID:** CONCURA-E2
**Lead:** Winston (Architect) + Bastion (Security) + Victor (Innovation)
**Goal:** Design new context management architecture achieving 5-10x efficiency

### Story 2.1: Tiered Context Loading Architecture

**ID:** CONCURA-2.1
**As a** BMAD system
**I want** a tiered context loading mechanism
**So that** only necessary context is loaded at each interaction level

**Acceptance Criteria:**
- [ ] AC1: Define "Minimal" tier - bare essentials for routing (~500 tokens)
- [ ] AC2: Define "Standard" tier - active agent + immediate context (~2000 tokens)
- [ ] AC3: Define "Full" tier - complete context when explicitly needed (~10000 tokens)
- [ ] AC4: Document tier transition triggers and rules
- [ ] AC5: Design fallback mechanism when higher tier needed mid-conversation
- [ ] AC6: Ensure no functionality loss at any tier

**Tasks:**
- [ ] T1: Define content requirements for each tier
- [ ] T2: Create tier-architecture.md specification
- [ ] T3: Design tier selection algorithm based on user intent
- [ ] T4: Review with Bastion for security implications of partial context

**Story Points:** 8
**Priority:** P0 - Critical Path

---

### Story 2.2: Compressed Manifest Format Design

**ID:** CONCURA-2.2
**As a** BMAD system
**I want** compressed manifest formats with on-demand expansion
**So that** initial context load is dramatically reduced

**Acceptance Criteria:**
- [ ] AC1: Design "micro-manifest" format with 10-word agent summaries
- [ ] AC2: Design "micro-manifest" format with 10-word workflow summaries
- [ ] AC3: Define on-demand expansion protocol for full details
- [ ] AC4: Achieve 80%+ reduction in manifest token consumption
- [ ] AC5: Maintain backward compatibility with existing references
- [ ] AC6: Document new manifest schema

**Tasks:**
- [ ] T1: Create micro-agent-manifest schema
- [ ] T2: Create micro-workflow-manifest schema
- [ ] T3: Design expansion API/protocol
- [ ] T4: Write migration guide from current to new format

**Story Points:** 5
**Priority:** P1 - High

---

### Story 2.3: Intent-Aware Context Selection

**ID:** CONCURA-2.3
**As a** BMAD system
**I want** to predict required context based on user intent
**So that** irrelevant context is never loaded

**Acceptance Criteria:**
- [ ] AC1: Define intent categories (agent work, workflow execution, research, chat)
- [ ] AC2: Map context requirements per intent category
- [ ] AC3: Design intent detection heuristics from user input
- [ ] AC4: Create context selection rules engine specification
- [ ] AC5: Handle intent ambiguity with minimal default context
- [ ] AC6: Support intent refinement mid-conversation

**Tasks:**
- [ ] T1: Catalog all intent types and their context needs
- [ ] T2: Design intent classifier logic
- [ ] T3: Create intent-context-mapping.yaml specification
- [ ] T4: Document edge cases and fallback behaviors

**Story Points:** 8
**Priority:** P1 - High

---

### Story 2.4: Agent Persona Compression Strategy

**ID:** CONCURA-2.4
**As a** BMAD system
**I want** compressed agent persona representations
**So that** agents can be activated with minimal token overhead

**Acceptance Criteria:**
- [ ] AC1: Define "essential persona" - minimum viable character traits (~200 tokens)
- [ ] AC2: Define "extended persona" - full character loaded on demand
- [ ] AC3: Create persona compression guidelines for new agents
- [ ] AC4: Identify which persona elements can be deferred vs required upfront
- [ ] AC5: Achieve 70%+ reduction in average agent activation cost
- [ ] AC6: Preserve agent distinctiveness and behavior quality

**Tasks:**
- [ ] T1: Analyze existing personas for essential vs optional elements
- [ ] T2: Create persona-compression-spec.md
- [ ] T3: Design persona expansion trigger rules
- [ ] T4: Create sample compressed personas for validation

**Story Points:** 5
**Priority:** P1 - High

---

## Epic 3: Implementation

**Epic ID:** CONCURA-E3
**Lead:** Amelia (Developer)
**Goal:** Implement the redesigned context management system

### Story 3.1: Implement Micro-Manifest Generator

**ID:** CONCURA-3.1
**As a** BMAD maintainer
**I want** tooling to generate micro-manifests from full manifests
**So that** the new format can be created and maintained automatically

**Acceptance Criteria:**
- [ ] AC1: Script reads current agent-manifest.csv and generates micro version
- [ ] AC2: Script reads current workflow-manifest.csv and generates micro version
- [ ] AC3: Micro-manifests are valid and parseable
- [ ] AC4: Script is idempotent and can be re-run safely
- [ ] AC5: Integration with BMAD installer for auto-generation
- [ ] AC6: Validation that all agents/workflows are represented

**Tasks:**
- [ ] T1: Write manifest-compressor.js/ts script
- [ ] T2: Create micro-manifest output files
- [ ] T3: Add to build/install process
- [ ] T4: Write tests for compression accuracy

**Story Points:** 5
**Priority:** P0 - Critical Path

---

### Story 3.2: Implement Lazy Context Loader

**ID:** CONCURA-3.2
**As a** BMAD system
**I want** a lazy loading mechanism for context expansion
**So that** full context is only loaded when actually needed

**Acceptance Criteria:**
- [ ] AC1: Agent details loaded only when agent is explicitly activated
- [ ] AC2: Workflow details loaded only when workflow is invoked
- [ ] AC3: Cross-module context loaded only on cross-module operations
- [ ] AC4: Loading is seamless to user experience
- [ ] AC5: Caching prevents redundant loads within session
- [ ] AC6: Error handling for failed loads with graceful degradation

**Tasks:**
- [ ] T1: Implement context loader module
- [ ] T2: Create loading hooks in agent activation flow
- [ ] T3: Create loading hooks in workflow execution flow
- [ ] T4: Implement session-level context cache
- [ ] T5: Write integration tests

**Story Points:** 8
**Priority:** P0 - Critical Path

---

### Story 3.3: Implement Compressed Agent Files

**ID:** CONCURA-3.3
**As a** BMAD maintainer
**I want** compressed versions of all agent files
**So that** activation uses minimal tokens

**Acceptance Criteria:**
- [ ] AC1: Create compressed version for each of 80 agents
- [ ] AC2: Compressed files follow persona-compression-spec
- [ ] AC3: Original files preserved for full expansion
- [ ] AC4: Naming convention clearly distinguishes compressed vs full
- [ ] AC5: Average compression achieves 70%+ token reduction
- [ ] AC6: Spot-check 10 agents for preserved behavior quality

**Tasks:**
- [ ] T1: Write agent-compressor script
- [ ] T2: Generate compressed agents for all 80 agents
- [ ] T3: Validate compression ratios
- [ ] T4: Test sample agents for behavior preservation

**Story Points:** 8
**Priority:** P1 - High

---

### Story 3.4: Implement Skill List Optimization

**ID:** CONCURA-3.4
**As a** BMAD system
**I want** optimized skill registration that shows only relevant skills
**So that** the 251-skill list doesn't consume excessive tokens

**Acceptance Criteria:**
- [ ] AC1: Skills grouped by relevance to current context
- [ ] AC2: Only top 20 most relevant skills shown by default
- [ ] AC3: Full skill list available on explicit request
- [ ] AC4: Skill descriptions truncated to 50 chars in default view
- [ ] AC5: Achieve 80%+ reduction in skill list token consumption
- [ ] AC6: No loss of skill discoverability for power users

**Tasks:**
- [ ] T1: Analyze skill usage patterns to determine relevance scoring
- [ ] T2: Implement skill filtering by context
- [ ] T3: Create compact skill display format
- [ ] T4: Add "show all skills" expansion command

**Story Points:** 5
**Priority:** P1 - High

---

### Story 3.5: Refactor Agent Activation Flow

**ID:** CONCURA-3.5
**As a** BMAD system
**I want** the agent activation flow to use tiered loading
**So that** activation is fast and token-efficient

**Acceptance Criteria:**
- [ ] AC1: Activation starts with micro-manifest lookup
- [ ] AC2: Compressed persona loaded for matched agent
- [ ] AC3: Full persona loaded only on explicit request or complex task
- [ ] AC4: Menu loaded in compact format initially
- [ ] AC5: Workflow list loaded only when menu item selected
- [ ] AC6: Total activation cost reduced by 5x minimum

**Tasks:**
- [ ] T1: Refactor activation steps in agent files
- [ ] T2: Update workflow.xml to support tiered loading
- [ ] T3: Test activation flow for all agent types
- [ ] T4: Measure and document new activation token cost

**Story Points:** 8
**Priority:** P0 - Critical Path

---

## Epic 4: Validation & Measurement

**Epic ID:** CONCURA-E4
**Lead:** Dr. Quinn (Problem Solver)
**Goal:** Validate efficiency gains and ensure no functionality regression

### Story 4.1: Post-Implementation Token Measurement

**ID:** CONCURA-4.1
**As a** BMAD maintainer
**I want** precise token measurements after optimization
**So that** I can verify the 5-10x improvement target

**Acceptance Criteria:**
- [ ] AC1: Re-run all baseline measurement scenarios
- [ ] AC2: Document new token consumption for each scenario
- [ ] AC3: Calculate improvement ratio per scenario
- [ ] AC4: Verify minimum 5x improvement achieved overall
- [ ] AC5: Identify any scenarios below target for further optimization
- [ ] AC6: Create comparison report with before/after metrics

**Tasks:**
- [ ] T1: Execute same test scenarios from Story 1.2
- [ ] T2: Record measurements in same format
- [ ] T3: Generate comparison-report.md
- [ ] T4: Create visualization of improvements

**Story Points:** 3
**Priority:** P0 - Critical Path

---

### Story 4.2: Functionality Regression Testing

**ID:** CONCURA-4.2
**As a** BMAD maintainer
**I want** comprehensive functionality testing after optimization
**So that** I can ensure no features were broken

**Acceptance Criteria:**
- [ ] AC1: Test all 80 agents can be activated successfully
- [ ] AC2: Test sample workflows from each module execute correctly
- [ ] AC3: Test cross-module operations (Party Mode, Cross-Module Consultation)
- [ ] AC4: Test menu navigation and command matching
- [ ] AC5: Verify agent personas maintain distinctive behavior
- [ ] AC6: Document any regressions found and remediation

**Tasks:**
- [ ] T1: Create regression test checklist
- [ ] T2: Execute agent activation tests
- [ ] T3: Execute workflow execution tests
- [ ] T4: Execute cross-module tests
- [ ] T5: Document results and any issues

**Story Points:** 5
**Priority:** P0 - Critical Path

---

### Story 4.3: User Experience Validation

**ID:** CONCURA-4.3
**As a** BMAD user
**I want** the optimized system to feel as responsive and capable
**So that** efficiency gains don't come at UX cost

**Acceptance Criteria:**
- [ ] AC1: Agent responses maintain quality and personality
- [ ] AC2: Workflow guidance is complete and accurate
- [ ] AC3: No noticeable delays from lazy loading
- [ ] AC4: Error messages are clear when context expansion needed
- [ ] AC5: Power user workflows (full context) still accessible
- [ ] AC6: New user onboarding not impacted

**Tasks:**
- [ ] T1: Conduct walkthrough of common user journeys
- [ ] T2: Test edge cases with complex multi-agent scenarios
- [ ] T3: Gather subjective quality assessment
- [ ] T4: Document UX findings and recommendations

**Story Points:** 3
**Priority:** P1 - High

---

### Story 4.4: Documentation Update

**ID:** CONCURA-4.4
**As a** BMAD maintainer
**I want** updated documentation reflecting the new context architecture
**So that** future development follows the efficient patterns

**Acceptance Criteria:**
- [ ] AC1: Update ARCHITECTURE-DEEP-DIVE.md with new context system
- [ ] AC2: Create CONTEXT-EFFICIENCY-GUIDE.md for developers
- [ ] AC3: Update agent creation docs with compression requirements
- [ ] AC4: Update workflow creation docs with lazy-load patterns
- [ ] AC5: Document the tier system and when each applies
- [ ] AC6: Add troubleshooting section for context issues

**Tasks:**
- [ ] T1: Write CONTEXT-EFFICIENCY-GUIDE.md
- [ ] T2: Update existing architecture docs
- [ ] T3: Update agent/workflow creation templates
- [ ] T4: Review all changes for completeness

**Story Points:** 5
**Priority:** P2 - Medium

---

## Summary

| Epic | Stories | Total Points | Priority |
|------|---------|--------------|----------|
| E1: Context Audit & Discovery | 3 | 13 | P0 |
| E2: Architecture Redesign | 4 | 26 | P0-P1 |
| E3: Implementation | 5 | 34 | P0-P1 |
| E4: Validation & Measurement | 4 | 16 | P0-P2 |
| **Total** | **16** | **89** | |

## Critical Path

1. CONCURA-1.1 (Inventory) + CONCURA-1.2 (Baseline) - Parallel
2. CONCURA-1.3 (Waste Analysis)
3. CONCURA-2.1 (Tiered Architecture)
4. CONCURA-3.1 (Micro-Manifest) + CONCURA-3.2 (Lazy Loader) - Parallel
5. CONCURA-3.5 (Activation Refactor)
6. CONCURA-4.1 (Measurement) + CONCURA-4.2 (Regression) - Parallel

## Success Metrics

| Metric | Current (Estimated) | Target | Stretch |
|--------|---------------------|--------|---------|
| Agent Activation Tokens | ~5000 | 1000 | 500 |
| Workflow Execution Tokens | ~8000 | 1600 | 800 |
| Manifest Load Tokens | ~50000 | 5000 | 2500 |
| Cross-Module Session | ~20000 | 4000 | 2000 |
| **Overall Efficiency Gain** | **1x** | **5x** | **10x** |

---

*Document created by Abdul - Master Project Manager*
*Project: BMAD-CONCURA*
*Date: 2026-01-17*
