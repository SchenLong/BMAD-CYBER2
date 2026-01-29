# BMAD Full Validation Test Plan

**Project:** BMAD Full Validation
**Date:** 2026-01-13
**Requested By:** J
**Lead Orchestrator:** Abdul (Master Project Manager)
**Validation Type:** Exhaustive Full-Platform Validation

---

## Executive Summary

This document outlines a comprehensive validation plan for the entire BMAD platform, covering all 10 modules, 80 agents, 139 workflows, security systems, local LLM integrations, and documentation. The validation incorporates lessons learned from previous tests and addresses known compliance gaps.

---

## Validation Team Assembly

### Core Team

| Role | Agent | Module | Primary Responsibilities |
|------|-------|--------|-------------------------|
| **QA Lead** | Murat (tea) | bmm | Test architecture, validation framework, quality gates |
| **Security Lead** | Bastion (security-architect) | cybersec-team | Security architecture review, threat modeling |
| **Threat Analyst** | Cipher (threat-analyst) | cybersec-team | Prompt injection testing, attack surface analysis |
| **Compliance Guardian** | Sentinel (compliance-guardian) | cybersec-team | Audit log verification, policy compliance |
| **Forensic Investigator** | Trace (forensic-investigator) | cybersec-team | Evidence integrity, tamper detection validation |
| **Workflow Validator** | Wendy (workflow-builder) | bmb | Workflow compliance checking |
| **Agent Validator** | Bond (agent-builder) | bmb | Agent compliance validation |
| **Doc Reviewer** | Paige (tech-writer) | bmm | Documentation completeness |
| **Developer Review** | Amelia (dev) | bmm | Code quality, hook validation |

### Support Team (As Needed)

| Role | Agent | Module | Consultation Area |
|------|-------|--------|-------------------|
| **Intel Operations** | Vector (osint-lead) | intel-team | Intel module workflow validation |
| **Legal Review** | Counsel | legal-team | Legal module workflow validation |
| **Strategic Oversight** | Sun (master-strategist) | strategy-team | Strategy module validation |

---

## Validation Scope

### 1. Module Inventory (10 Modules)

| # | Module | Agents | Workflows | Previous Compliance | Priority |
|---|--------|--------|-----------|---------------------|----------|
| 1 | **core** | 2 | 2 | 48% | P0 (Critical) |
| 2 | **bmb** | 3 | 5 | 95% | P2 |
| 3 | **bmm** | 9 | 30+ | 82% | P1 |
| 4 | **bmgd** | 6 | 25+ | 42% | P0 (Critical) |
| 5 | **cis** | 6 | 4 | 62% | P1 |
| 6 | **cybersec-team** | 14 | 13 | 93% | P2 |
| 7 | **intel-team** | 11 | 19 | 35% | P0 (Critical) |
| 8 | **legal-team** | 13 | 7 | 43% | P0 (Critical) |
| 9 | **strategy-team** | 14 | 16 | 62% | P1 |
| 10 | **_memory** | - | - | N/A | P3 |

### 2. Security Systems

| Component | Test Type | Previous Status |
|-----------|-----------|-----------------|
| Prompt Injection Guard | Active testing | PASS (6/6) |
| Jailbreak Guard | Active testing | PASS |
| Audit Log System | Integrity verification | PASS |
| Hash Chain | Tamper detection | PASS |
| YOLO Mode | Blocked when disabled | PASS |
| LLM Provider Isolation | Data isolation | PASS |

### 3. Local LLM Integrations

| Provider | Model | Port | Test Type |
|----------|-------|------|-----------|
| Ollama | nemotron-mini | 11434 | Connectivity, response, isolation |
| LM Studio | Qwen-vl-30b | 1234 | Connectivity, response, isolation |

### 4. Documentation

| Category | Count | Validation |
|----------|-------|------------|
| Project Docs | 15+ | Completeness, accuracy |
| Module READMEs | 10 | Presence, accuracy |
| Agent Files | 80 | Compliance structure |
| Workflow Files | 139 | Compliance structure |
| Security Docs | 5 | Current, accurate |
| Roadmaps | 5 | Up-to-date |

---

## Test Categories

### Category A: Structural Compliance Tests

**Purpose:** Validate all files follow BMAD standards

#### A1: Agent Compliance
- [ ] All 80 agents have required frontmatter
- [ ] All agents have valid XML structure
- [ ] All agents reference valid paths
- [ ] All agents have persona, menu, and activation sections
- [ ] Cross-reference with agent-manifest.csv

#### A2: Workflow Compliance
- [ ] All 139 workflows have required sections
- [ ] Goal statement present
- [ ] Your Role section with partnership language
- [ ] WORKFLOW ARCHITECTURE with Core Principles
- [ ] Critical Rules (NO EXCEPTIONS) section
- [ ] INITIALIZATION SEQUENCE
- [ ] Cross-reference with workflow-manifest.csv

#### A3: Step File Compliance
- [ ] All step files have frontmatter
- [ ] MANDATORY EXECUTION RULES present
- [ ] EXECUTION PROTOCOLS present
- [ ] CONTEXT BOUNDARIES present
- [ ] CRITICAL STEP COMPLETION NOTE present
- [ ] SUCCESS/FAILURE METRICS present

### Category B: Security Tests

**Purpose:** Validate all security measures are functioning

#### B1: Prompt Injection Guard Tests
- [ ] Direct injection blocked
- [ ] Role hijacking blocked
- [ ] Authority spoofing blocked
- [ ] Encoded payloads detected
- [ ] Multi-step escalation blocked
- [ ] Indirect injection via comments blocked

#### B2: Jailbreak Guard Tests
- [ ] DAN variants blocked
- [ ] Character exploitation blocked
- [ ] Hypothetical framing blocked
- [ ] Authority impersonation blocked
- [ ] Session risk tracking functional

#### B3: Audit System Tests
- [ ] JSON format valid
- [ ] Hash chain integrity verified
- [ ] Security events logged (mandatory)
- [ ] Tamper detection functional
- [ ] YOLO blocking logged

#### B4: Hook System Tests
- [ ] UserPromptSubmit hooks execute
- [ ] PreToolUse hooks execute
- [ ] Exit code 2 blocks operation
- [ ] Override mechanism works (with timeout)

### Category C: Integration Tests

**Purpose:** Validate system integrations work correctly

#### C1: Local LLM Tests (Ollama)
- [ ] Server connectivity (localhost:11434)
- [ ] Model availability (nemotron-mini)
- [ ] Request/response cycle
- [ ] Data isolation verification
- [ ] Provider switch functionality

#### C2: Local LLM Tests (LM Studio)
- [ ] Server connectivity (localhost:1234)
- [ ] Model availability (Qwen-vl-30b)
- [ ] Request/response cycle
- [ ] Data isolation verification
- [ ] Provider switch functionality

#### C3: LLM Provider Manager Tests
- [ ] get command works
- [ ] set command works
- [ ] list command works
- [ ] health command works
- [ ] config command works
- [ ] clear command works

### Category D: Functional Tests

**Purpose:** Validate core functionality works

#### D1: Agent Activation Tests
- [ ] Abdul activates correctly
- [ ] BMad Master activates correctly
- [ ] Sample agent from each module activates
- [ ] TTS hooks execute (if configured)
- [ ] Menu systems work

#### D2: Workflow Execution Tests
- [ ] Party mode workflow loads
- [ ] Brainstorming workflow loads
- [ ] Sample workflow from each module loads
- [ ] State tracking works
- [ ] Step progression works

### Category E: Documentation Tests

**Purpose:** Validate all documentation is complete and accurate

#### E1: Core Documentation
- [ ] README.md exists and accurate
- [ ] GETTING-STARTED.md complete
- [ ] AGENTS.md lists all agents
- [ ] WORKFLOWS.md lists all workflows
- [ ] LLM-PROVIDER-SYSTEM.md accurate

#### E2: Security Documentation
- [ ] AgenticSecurity.md current
- [ ] HooksGuardrails.md current
- [ ] DATA-SENSITIVITY-GUIDE.md complete

#### E3: Module Documentation
- [ ] Each module has README or equivalent
- [ ] Module installer assets present
- [ ] Roadmaps up-to-date

### Category F: Configuration Tests

**Purpose:** Validate all configurations are valid

#### F1: Core Configuration
- [ ] config.yaml valid YAML
- [ ] Security settings correct
- [ ] YOLO mode disabled by default
- [ ] Audit logging enabled

#### F2: Manifest Files
- [ ] agent-manifest.csv accurate
- [ ] workflow-manifest.csv accurate
- [ ] No orphan entries

#### F3: Claude Code Integration
- [ ] .claude/commands structure valid
- [ ] All command stubs point to valid files
- [ ] settings.json valid

---

## Known Issues from Previous Validations

### From Compliance Report (2026-01-12)

| Priority | Issue | Affected | Status |
|----------|-------|----------|--------|
| P0 | Missing Critical Rules section | 30+ workflows | TO VALIDATE |
| P0 | Missing WORKFLOW ARCHITECTURE | 25+ workflows | TO VALIDATE |
| P0 | Missing Your Role section | 25+ workflows | TO VALIDATE |
| P1 | Missing web_bundle frontmatter | 25+ workflows | TO VALIDATE |
| P1 | Step files missing sections | 100+ files | TO VALIDATE |
| P1 | Inconsistent path references | bmb module | TO VALIDATE |

### From Security Tests (2026-01-11)

| Test | Previous Result | Re-Test |
|------|-----------------|---------|
| Direct Prompt Injection | PASS | YES |
| Role Hijacking | PASS | YES |
| Authority Spoofing | PASS | YES |
| Encoded Payloads | PASS | YES |
| Multi-step Escalation | PASS | YES |
| Indirect Injection | PASS | YES |

---

## Exclusions (Per User Request)

1. **NO dangerous rm commands** - All file deletion tests excluded
2. **NO live external API calls** - Only local LLM testing
3. **NO destructive operations** - Nothing that could damage system
4. **NO credential exposure tests** - No real secrets tested

---

## Test Execution Strategy

### Phase 1: Discovery & Inventory (Automated)
- Scan all files and directories
- Build complete inventory
- Identify discrepancies from manifests

### Phase 2: Structural Validation (Automated)
- Parse all agent files for compliance
- Parse all workflow files for compliance
- Parse all step files for compliance
- Generate compliance scores

### Phase 3: Security Validation (Automated + Manual)
- Run prompt injection test suite
- Run jailbreak guard test suite
- Verify audit log integrity
- Test hook execution

### Phase 4: Integration Testing (Manual)
- Test Ollama connectivity and isolation
- Test LM Studio connectivity and isolation
- Test provider switching

### Phase 5: Functional Sampling (Manual)
- Activate sample agents
- Execute sample workflows
- Verify TTS and hooks

### Phase 6: Documentation Audit (Automated + Manual)
- Verify all docs exist
- Spot-check accuracy
- Cross-reference agent/workflow lists

### Phase 7: Report Generation
- Compile all findings
- Calculate overall scores
- Document discrepancies
- Provide remediation guidance

---

## Success Criteria

| Category | Minimum | Target | Stretch |
|----------|---------|--------|---------|
| Agent Compliance | 70% | 85% | 95% |
| Workflow Compliance | 60% | 80% | 95% |
| Security Tests | 100% | 100% | 100% |
| LLM Integration | 100% | 100% | 100% |
| Documentation | 80% | 90% | 100% |
| **Overall** | **75%** | **85%** | **95%** |

---

## Deliverables

1. **Full Validation Report** - Comprehensive findings document
2. **Compliance Scorecard** - Module-by-module scores
3. **Security Validation Certificate** - Security test results
4. **Discrepancy List** - All issues found with severity
5. **Remediation Roadmap** - Prioritized fix recommendations

---

## Approval

**Plan Created By:** Abdul (Master Project Manager)
**Date:** 2026-01-13
**Status:** READY FOR EXECUTION

---

*This validation plan will be executed exhaustively with auto-approval where safe. All findings will be documented in the final validation report.*
