# BMAD-CYBERSEC Security Architecture Documentation

**Version**: 1.0.0
**Date**: 2026-02-13
**Framework**: BMAD-CYBER2 Multi-Agent Security Framework v2.4.0
**Status**: Active
**ASVS V1 Reference**: V1-001

---

## Executive Summary

This document defines the security architecture for the BMAD-CYBERSEC Multi-Agent Framework, a comprehensive security orchestration platform built on the Claude Agent SDK. The architecture follows defense-in-depth principles with multiple validation layers, centralized access control, and comprehensive audit capabilities.

**Key Security Principles:**

- **Defense in Depth**: Multiple independent validation layers
- **Fail Secure**: Validation failures block operations by default
- **Least Privilege**: RBAC with deny-by-default policy
- **Zero Trust**: All inputs treated as untrusted
- **Audit Everything**: Tamper-evident logging for all security events

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Component Architecture](#2-component-architecture)
3. [Trust Boundaries](#3-trust-boundaries)
4. [Data Flow](#4-data-flow)
5. [Security Controls](#5-security-controls)
6. [Threat Model Summary](#6-threat-model-summary)
7. [Secure Design Patterns](#7-secure-design-patterns)

---

## 1. System Overview

### 1.1 System Purpose

BMAD-CYBERSEC is a multi-agent security framework that orchestrates specialized AI agents through workflows. The system provides:

- **80+ specialized agents** across 9 functional modules
- **139+ workflows** for coordinated security operations
- **21 validators** with 55 hook commands for security enforcement
- **RBAC system** with 4 roles and deny-by-default policy
- **Tamper-evident audit pipeline** with HMAC-SHA256 signing

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL UNTRUSTED                          │
│                    (User Input, Files, Network)                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          TRUST BOUNDARY 1                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Hook Validation Pipeline                   │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────────┐   │  │
│  │  │PreTool  │ │PreTool  │ │PreTool  │ │  UserPrompt      │   │  │
│  │  │Use      │ │Use      │ │Use      │ │  Submit          │   │  │
│  │  │Bash     │ │Write    │ │Read     │ │  (AI Safety)     │   │  │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └──────────────────┘   │  │
│  │       │           │           │                              │  │
│  │  ┌────▼──────────▼──────────▼──────┐                         │  │
│  │  │    21 Node.js Validators        │                         │  │
│  │  │ - AI Safety (prompt injection)  │                         │  │
│  │  │ - Guards (bash-safety, SSRF)    │                         │  │
│  │  │ - Permissions (RBAC)            │                         │  │
│  │  │ - Resource Management           │                         │  │
│  │  └─────────────────────────────────┘                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          TRUST BOUNDARY 2                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    RBAC Authorization                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │  │
│  │  │ Role         │  │ Agent        │  │ Workflow         │   │  │
│  │  │ Validation   │  │ Access       │  │ Access           │   │  │
│  │  │              │  │ Control      │  │ Control          │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘   │  │
│  │                                                               │  │
│  │  Deny-by-Default: All access DENIED unless explicitly allowed│  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        TRUSTED INTERNAL                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ Agents   │  │Workflows │  │ Security │  │ Audit Pipeline   │    │
│  │ (80+)    │  │ (139+)   │  │ Layer    │  │ (Tamper-Evident) │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES (UNTRUSTED)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐         │
│  │ Claude API   │  │ GitHub       │  │ NPM Registry     │         │
│  │ (Anthropic)  │  │ (WebFetch)   │  │ (Dependencies)   │         │
│  └──────────────┘  └──────────────┘  └──────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Hook Validation Pipeline

**Location**: `.claude/validators-node/`

**Purpose**: First line of defense - validates all operations before execution.

**Validator Categories**:

| Category | Validators | Purpose |
|----------|-------------|---------|
| **AI Safety** | 5 | Detect prompt injection, jailbreaks |
| **Guards** | 8 | Block dangerous commands, SSRF, secrets |
| **Observability** | 3 | Session tracking, rate limiting, logging |
| **Permissions** | 3 | RBAC, token validation, plugin permissions |
| **Resource Management** | 4 | Rate limits, context management, recursion guard |

**Hook Commands (55 total)**:

- 12 PreToolUse matchers for real-time validation
- 43 UserCommand validators for command execution

### 2.2 RBAC System

**Location**: `src/core/security/`

**Roles**:

1. **admin**: Full access to all agents, workflows, and shell commands
2. **developer**: Access to development agents and workflows
3. **analyst**: Read-only access to security assessment tools
4. **viewer**: Minimal access, restricted to safe operations

**Key Files**:

- `rbac-config.yaml`: Role definitions and permissions
- `authorization.js`: Authorization checks with pattern matching
- `session-manager.js`: Session token lifecycle

**Access Control Matrix** (excerpt):

| Agent Module | admin | developer | analyst | viewer |
|--------------|-------|-----------|---------|--------|
| bmad (core) | ✅ | ✅ | ✅ | ❌ |
| bmm (build) | ✅ | ✅ | ❌ | ❌ |
| cybersec-team | ✅ | ❌ | ✅ | ❌ |
| intel-team | ✅ | ❌ | ✅ | ❌ |

### 2.3 Audit Pipeline

**Location**: `src/core/audit/`

**Purpose**: Tamper-evident logging for all security events.

**Key Features**:

- HMAC-SHA256 signatures on each log entry
- Hash chain linking entries (genesis → current)
- Category-based retention (7yr, 3yr, 1yr, 90d)
- SIEM integration (Splunk, ELK)
- PII sanitization

**Retention Policy**:

- **7 years**: Critical security events (CRITICAL)
- **3 years**: High-severity events (HIGH)
- **1 year**: Medium-severity events (MEDIUM)
- **90 days**: Low-severity events (LOW, INFO)

### 2.4 Agent System

**Total Agents**: 80+ across 9 modules

| Module | Agents | Purpose |
|--------|--------|---------|
| **bmad (core)** | 4 | Project management, workflow orchestration |
| **bmm (build)** | 6 | Software development lifecycle |
| **bmb (module builder)** | 4 | Agent/workflow creation |
| **bmgd (game dev)** | 6 | Game development workflows |
| **cis (innovation)** | 6 | Creative problem solving |
| **intel-team** | 13 | Intelligence gathering |
| **legal-team** | 13 | Legal operations |
| **strategy-team** | 11 | Strategic planning |
| **cybersec-team** | 17 | Security operations |

**Agent Security**:

- All agent IDs pure ASCII (homoglyph protection)
- Manifest-based permission declarations
- Path traversal protection in agent resolution
- Forced browsing prevention

---

## 3. Trust Boundaries

### 3.1 Boundary 1: External → Hook Pipeline

**Entry Points**:

- User prompts (`UserPromptSubmit`)
- File operations (`Read`, `Write`, `Edit`)
- Command execution (`Bash`)
- Web requests (`WebFetch`)
- Task spawning (`Task`)

**Validations Applied**:

- AI Safety: Prompt injection, jailbreak detection
- Guards: Command injection, SSRF prevention, secret detection
- Resource Management: Rate limiting, context window checks

### 3.2 Boundary 2: Hook Pipeline → RBAC

**Authorization Check Points**:

- Agent access (80 agents × 4 roles)
- Workflow access (139 workflows × 4 roles)
- Module access (9 modules × 4 roles)
- Shell command access

**Default Policy**: DENY (deny-by-default)

### 3.3 Boundary 3: RBAC → Trusted Components

**Trusted Components** (assume pre-authorized):

- Agent execution logic
- Workflow orchestration
- Audit logging (internal)
- Security assessment tools

---

## 4. Data Flow

### 4.1 User Request Flow

```
User Input
    │
    ▼
┌─────────────────┐
│ UserPromptSubmit │ ──► AI Safety Validators (prompt injection check)
└────────┬────────┘
         │
         ▼ (if safe)
┌─────────────────┐
│   Task/Create   │ ──► Resource Management (rate limit, context)
└────────┬────────┘
         │
         ▼ (if within limits)
┌─────────────────┐
│ Agent Execution │ ──► RBAC Authorization Check
└────────┬────────┘
         │
         ▼ (if authorized)
┌─────────────────┐
│   Agent Runs    │ ──► Uses Tools (Read, Write, Bash, WebFetch, Task)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         Each Tool Use                    │
│  ──► PreToolUse Validators (per-tool)   │
│  ──► RBAC Check (per-tool)              │
│  ──► Audit Log Entry (signed)           │
└─────────────────────────────────────────┘
```

### 4.2 Audit Data Flow

```
Security Event
      │
      ▼
┌─────────────────┐
│ Event Capture   │ (timestamp, session, severity, details)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PII Sanitization│ (remove secrets, PII)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ HMAC-SHA256 Sign│ (link to previous entry)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Hash Chain Link │ (tamper-evident)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ File Write      │ (atomic operation)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SIEM Forwarding │ (if configured)
└─────────────────┘
```

---

## 5. Security Controls

### 5.1 AI Safety Controls

| Control | Implementation | OWASP Ref |
|---------|----------------|-----------|
| Prompt Injection Detection | `prompt-injection.ts` (35+ patterns) | LLM01 |
| Jailbreak Detection | `jailbreak.ts` (30+ patterns) | LLM01 |
| Encoded Payload Detection | `encoded-payload-detection-patch.js` | LLM01 |
| Nested Encoding Detection | Base64 → hex → unicode | LLM01 |

### 5.2 Input Validation Controls

| Control | Implementation | OWASP Ref |
|---------|----------------|-----------|
| Command Injection Prevention | `bash-safety.js` | A03, LLM02 |
| SSRF Prevention | IP allowlist, hostname validation | A10, API7 |
| Path Traversal Prevention | Normalization, boundary checks | A03, V12 |
| YAML Safety | Safe loader only | A03 |
| Secret Detection | `secret.ts` (65+ patterns) | LLM06 |
| PII Detection | `pii.ts` (SSN, IBAN, credit cards) | LLM06 |

### 5.3 Access Control Controls

| Control | Implementation | OWASP Ref |
|---------|----------------|-----------|
| Deny-by-Default | `rbac-config.yaml` | A01, V4 |
| Role-Based Access | 4 roles, pattern matching | A01, API1 |
| Token Authentication | HMAC-SHA256 signed tokens | A07, V2 |
| Session Management | 1-hour timeout, replay prevention | V3 |

### 5.4 Resource Management Controls

| Control | Implementation | OWASP Ref |
|---------|----------------|-----------|
| Rate Limiting | Per-operation sliding window (60s) | API4, LLM04 |
| Context Window Management | Warning at 75%, block at 95% | LLM04 |
| Recursion Guard | Depth limits, circular detection | LLM04 |
| Memory Limits | 4GB default, graceful shutdown | LLM04 |

### 5.5 Audit & Monitoring Controls

| Control | Implementation | OWASP Ref |
|---------|----------------|-----------|
| Tamper-Evident Logging | HMAC-SHA256 hash chains | A08, A09 |
| PII Sanitization | Regex-based redaction | LLM06 |
| SIEM Integration | Splunk/ELK JSON format | A09 |
| Log Rotation | 10MB threshold with chaining | A09 |
| Category-Based Retention | 7yr/3yr/1yr/90d | A09 |

### 5.6 Supply Chain Controls

| Control | Implementation | OWASP Ref |
|---------|----------------|-----------|
| Validator Checksums | SHA-256 for 68 files | A08, LLM05 |
| Ed25519 Signing | Artifact signing/verification | A08 |
| Atomic File Operations | Temp + rename pattern | A08 |
| SHA-Pinned Actions | All GitHub Actions | SCS02 |
| npm Audit | Zero critical/high (tar exception) | A06 |

---

## 6. Threat Model Summary

### 6.1 STRIDE Analysis Summary

| Component | Spoofing | Tampering | Repudiation | Info Disclosure | DoS | Elevation |
|-----------|----------|-----------|-------------|-----------------|-----|-----------|
| CLI Install | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ⚠️ PARTIAL | ✅ MITIGATED |
| RBAC Auth | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED |
| Hook Pipeline | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED |
| Agent Activation | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED |
| Audit Logging | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | N/A |
| Package Distribution | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ⚠️ PARTIAL | N/A |
| Workflow Execution | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED | ✅ MITIGATED |

**Legend**: ✅ MITIGATED | ⚠️ PARTIAL | ❌ OPEN | N/A Not Applicable

### 6.2 Current Risk Posture

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL (9.0-10.0) | 0 | ✅ None |
| HIGH (7.0-8.9) | 0 | ✅ None |
| MEDIUM (4.0-6.9) | 2 | ⚠️ Monitored |
| LOW (0.1-3.9) | 5 | ✅ Accepted |

**Overall Mitigation Rate**: 90%

### 6.3 Known Residual Risks

1. **R-008**: DoS via unlimited agent spawning (MEDIUM)
   - Mitigation: Rate limiting per agent type
   - Status: ACCEPTED (operational trade-off)

2. **R-009**: DoS via large context window exhaustion (MEDIUM)
   - Mitigation: 95% block threshold
   - Status: ACCEPTED (usability trade-off)

---

## 7. Secure Design Patterns

### 7.1 Defense in Depth

**Implementation**: Multiple independent validation layers

```
User Input → AI Safety → Guards → RBAC → Audit → Execution
           (Layer 1)  (Layer 2) (Layer 3) (Layer 4)
```

**Benefits**:

- Single layer failure doesn't compromise security
- Different layers catch different threat types
- Compensating controls exist

### 7.2 Fail Secure

**Implementation**: Default-deny policy

```javascript
// RBAC default-deny example
if (!permissions.has(agentId)) {
  return { status: 'DENIED', reason: 'Default deny' };
}
```

**Benefits**:

- Explicit allow list prevents accidental authorization
- New agents require explicit permission assignment
- Failures result in blocked operations

### 7.3 Least Privilege

**Implementation**: Role hierarchy with scoped permissions

```yaml
roles:
  viewer:
    agents: ["bmad:project-status"]
    workflows: ["bmad:whats-next"]
  analyst:
    agents: ["bmad:**", "cybersec-team:threat-analyst"]
    workflows: ["bmad:**", "cybersec-team:**"]
```

**Benefits**:

- Users have minimum required access
- Compromised credentials have limited blast radius
- Clear permission boundaries

### 7.4 Zero Trust

**Implementation**: All inputs validated at trust boundary

**Principles**:

- Never trust external input
- Validate at entry point
- Re-validate before sensitive operations
- Audit all validation failures

### 7.5 Audit Everything

**Implementation**: Tamper-evident hash chain

```javascript
// Each entry links to previous
entry.previousHash = lastEntry.hash;
entry.signature = hmacSha256(entry);
```

**Benefits**:

- Tamper detection (hash chain breaks)
- Non-repudiation (signed entries)
- Forensic trail
- Compliance evidence

### 7.6 Separation of Concerns

**Implementation**: Independent validator categories

| Category | Responsibility | Independent? |
|----------|----------------|--------------|
| AI Safety | Prompt threats | ✅ Yes |
| Guards | Injection, SSRF | ✅ Yes |
| Permissions | RBAC | ✅ Yes |
| Resources | Rate limits | ✅ Yes |

**Benefits**:

- Single responsibility per validator
- Independent testing
- Easier maintenance
- Clear ownership

---

## References

### Related Documents

- **Threat Model**: `THREAT-MODEL-TEMPLATE.md`
- **STRIDE Analysis**: `_bmad-output/planning-artifacts/SA-07-STRIDE-THREAT-MODEL.md`
- **Risk Register**: `_bmad-output/planning-artifacts/RISK-REGISTER.yaml`
- **OWASP Testing Plan**: `OWASP-TESTING-PLAN.md`
- **OWASP Controls**: `owasp-controls.yaml`

### Standards Compliance

- **OWASP ASVS v4.0**: V1 Architecture, Design, and Threat Modeling
- **OWASP Top 10 2021**: A01-A10
- **OWASP API Security Top 10 2023**: API1-API10
- **OWASP LLM Top 10 2024**: LLM01-LLM10

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-13 | Initial architecture documentation (V1-001) |

---

**ASVS V1-001 Compliance**: ✅ This document satisfies V1-001 (Security architecture documentation exists)
