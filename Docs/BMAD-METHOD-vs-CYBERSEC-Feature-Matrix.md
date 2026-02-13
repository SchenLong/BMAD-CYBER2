# BMAD-METHOD vs BMAD-CYBERSEC Feature Matrix

**Purpose:** Feature comparison for potential BMAD-METHOD PR integration
**Date:** 2026-02-13
**Status:** Updated for v2.2.0

---

## Executive Summary

BMAD-CYBERSEC extends the BMAD-METHOD foundation with **47 specialized agents** (4 operational teams), **55+ domain-specific workflows**, enterprise-grade security infrastructure, and production-ready compliance frameworks. The additions fall into three categories:

1. **High-Value PR Candidates** - Universal applicability, low integration risk
2. **Specialized Extensions** - Domain-specific, modular installation
3. **Infrastructure Enhancements** - Production hardening, optional adoption

### Quick Stats Comparison

| Metric | BMAD-METHOD | BMAD-CYBERSEC v2.2.0 | Delta |
|--------|---------------|-------------------------|-------|
| **Total Agents** | ~21 | 68 | +47 |
| **Total Workflows** | ~50 | 105+ | +55+ |
| **Modules** | 5 | 9+ | +4+ |
| **Compliance Frameworks** | - | 20+ | +20 |
| **Security Validators** | - | 139+ | +139 |
| **OWASP AI Score** | N/A | 95/100 | - |

---

## Section 1: New Specialized Teams (High-Value PR Candidates)

### 1.1 Cybersec-Team Module

**Recommendation:** **STRONG PR CANDIDATE** - Universal value for any development team

| Component | Description | Agents | Workflows |
|-----------|-------------|--------|-----------|
| **Core Security** | Enterprise security operations | 11 | 13 |

#### Core Security Agents (11)

| Agent | Role | Key Capabilities |
|-------|------|------------------|
| **Security Architect** | Security Architecture | Zero-trust design, STRIDE threat modeling, cloud security (AWS/Azure/GCP), IAM architecture |
| **Threat Analyst** | Threat Intel Analyst | MITRE ATT&CK mapping, APT tracking, TTP analysis, threat hunting |
| **Penetration Tester** | Penetration Tester | Attack surface analysis, exploit chain mapping, red team ops |
| **Incident Commander** | Incident Commander | PICERL methodology, crisis management, containment strategy |
| **Compliance Guardian** | Compliance Guardian | Multi-framework compliance (NIST/SOC2/PCI/HIPAA/GDPR), gap assessments |
| **Forensic Investigator** | Forensic Investigator | Disk/memory/network forensics, timeline reconstruction, evidence preservation |
| **SOC Analyst** | SOC Analyst | SIEM management, EDR/XDR, detection engineering |
| **Cloud Security Specialist** | Cloud Security | Multi-cloud posture, CSPM, container/serverless security |
| **Blockchain Security Expert** | Blockchain Security | Smart contract auditing (Solidity/Vyper/Rust), DeFi security |
| **Web App Security Expert** | Web App Security | OWASP Top 10, secure SDLC integration |
| **API Security Expert** | API Security | REST/GraphQL/gRPC security, OAuth/OIDC review |
| **LLM AI Security Expert** | LLM/AI Security | Prompt injection defense, AI governance, adversarial ML |
| **Mobile Security Expert** | Mobile Security | iOS/Android testing, OWASP MSTG methodology |
| **Blue Team Lead** | Blue Team Lead | Detection engineering, purple team ops, security automation |
| **Social Engineer** | Social Engineer | Phishing campaigns, vishing, security awareness design |

#### Cybersec Workflows (13)

| Workflow | Type | Steps | Output |
|----------|------|-------|--------|
| **Incident Response Playbook** | Dual-Mode | 19 | IR playbook (50-150 pages) |
| **Security Architecture Review** | Linear | 8 | Architecture security assessment |
| **STRIDE Threat Modeling** | Iterative | 11 | Threat model with mitigations |
| **Compliance Audit Preparation** | Linear | 10 | Audit-ready compliance package |
| **Virtual CISO Consulting** | Linear | 11 | vCISO engagement doc (50-100 pages) |
| **Blockchain Security Assessment** | Linear | 9 | Smart contract audit report |
| **Mobile Security Testing** | Linear | 9 | Mobile app security assessment |
| **Web Application Security Testing** | Linear | 8 | Web app pentest report |
| **Network Assessment** | Linear | 8 | Network pentest report |
| **Infrastructure Security Testing** | Linear | 9 | Infrastructure security assessment |
| **Cloud Security Assessment** | Linear | 9 | Cloud posture assessment |
| **Vulnerability Management** | Linear | 8 | VM program documentation |
| **Security Awareness Training** | Linear | 7 | Security awareness program design |

**Integration Effort:** Medium
**Dependencies:** None (standalone module)
**PR Priority:** HIGH

---

### 1.2 Intel-Team Module

**Recommendation:** **PR CANDIDATE** - Valuable for threat intelligence, competitive analysis

| Component | Description | Agents | Workflows |
|-----------|-------------|--------|-----------|
| **Core Intelligence** | OSINT & analysis | 9 | 19 |

#### Intelligence Agents (9)

| Codename | Title | Specialty |
|----------|-------|-----------|
| **OSINT Lead** | Intel Operations Director | All-source coordination, collection management |
| **Domain Intel Specialist** | Domain Intel Specialist | DNS analysis, infrastructure mapping |
| **Social Media Analyst** | Social Media Analyst | Platform analysis, influence ops detection |
| **Dark Web Analyst** | Dark Web Analyst | Tor/I2P navigation, crypto tracing |
| **Geospatial Analyst** | Geospatial Analyst | Imagery analysis, geolocation |
| **Technical Researcher** | Technical Researcher | Technology fingerprinting, TECHINT |
| **Threat Actor Profiler** | Threat Actor Profiler | APT attribution, MITRE ATT&CK |
| **Corporate Intel Specialist** | Corporate Intel Specialist | Business registries, beneficial ownership |
| **HUMINT Specialist** | HUMINT Specialist | Elicitation, source assessment |
| **SIGINT Specialist** | SIGINT Specialist | RF reconnaissance, TSCM |
| **Field Operative** | Field Operative | Surveillance, site reconnaissance |

#### Intel Workflows (19)

| Category | Workflows | Purpose |
|----------|-----------|---------|
| **Rapid Response** | flash-assessment | 15-min quick OSINT assessment |
| **Individual Investigation** | campaign-planner-person, doppelganger-hunt, digital-necromancy, pattern-of-life | Target investigation |
| **Organization Investigation** | campaign-planner-org, operation-mosaic, spider-web | Org intelligence |
| **Technical Intelligence** | infrastructure-genealogy, signal-landscape, breach-archaeology | Technical recon |
| **Threat Intelligence** | attribution-chain, threat-constellation | Threat actor mapping |
| **Field Operations** | ground-truth, counter-intel-audit, approach-vector | Physical ops prep |
| **Intelligence Fusion** | the-synthesis, campaign-ai | Multi-INT fusion |
| **Monitoring** | tripwire | Continuous monitoring setup |

**Integration Effort:** Medium
**Dependencies:** None (standalone module)
**PR Priority:** MEDIUM

---

### 1.3 Strategy-Team Module

**Recommendation:** **PR CANDIDATE** - Executive leadership, board relations, strategic planning

| Component | Description | Agents | Workflows |
|-----------|-------------|--------|-----------|
| **Modern Advisors** | Professional experts | 6 | 16 |
| **Historical Archetypes** | Strategic perspectives | 8 | 16 presets |

#### Modern Professional Advisors (6)

| Agent | Name | Specialty |
|-------|------|-----------|
| policy-analyst | Policy Analyst | Evidence-based policy |
| political-strategist | Political Strategist | Campaign & political strategy |
| debate-coach | Debate Coach | Argumentation & rhetoric |
| stakeholder-mediator | Stakeholder Mediator | Negotiation & consensus |
| ethics-advisor | Ethics Advisor | Political ethics & values |
| communications-director | Communications Director | Public messaging & media |

#### Historical Archetype Advisors (8)

| Agent | Name | Archetype |
|-------|------|-----------|
| the-realist | The Realist | Niccolo Machiavelli/Bismarck - Realpolitik |
| the-liberator | The Liberator | Lincoln/de Gaulle - Moral Transformer |
| the-revolutionary | The Revolutionary | Maximilien Robespierre - Agent of Change |
| the-conservative | The Conservative | Burke/Metternich - Tradition Guardian |
| the-technocrat | The Technocrat | Lee Kuan Yew/Deng - System Builder |
| the-strategist-warrior | The Strategist Warrior | Miyamoto Musashi - Master of Timing |
| the-master-strategist | The Master Strategist | Sun Tzu - Supreme Strategist |
| the-principled-commander | The Principled Commander | Jean-Luc Picard - Diplomat Captain |

#### Strategy Workflows (16)

| Workflow | Output |
|----------|--------|
| strategic-decision-workshop | Multi-perspective decision brief |
| stakeholder-negotiation-prep | Negotiation playbook |
| board-presentation-prep | Presentation outline |
| crisis-response-planning | Crisis response plan |
| strategic-planning-session | Strategic plan |
| policy-development | Policy document |
| conflict-resolution | Resolution plan |
| competitive-warfare | Warfare plan |
| corporate-political-game | Political playbook |
| political-risk-assessment | Risk assessment |
| ethical-dilemma-resolution | Ethical resolution |
| leadership-philosophy | Leadership philosophy |
| ma-due-diligence | Due diligence report |
| leadership-transition-planning | Transition plan |
| board-relations-management | Board relations plan |
| performance-review-preparation | Performance review |

**Party Mode Presets (16):** Pre-configured multi-agent combinations for strategic scenarios

**Integration Effort:** Low-Medium
**Dependencies:** None (standalone module)
**PR Priority:** MEDIUM

---

### 1.4 Legal-Team Module

**Recommendation:** **OPTIONAL PR** - Specialized, use case dependent

| Component | Description | Agents | Workflows |
|-----------|-------------|--------|-----------|
| **Core Legal** | General counsel | 7 | 7 |

#### Legal Agents (13)

| Codename | Title | Jurisdiction |
|----------|-------|--------------|
| **Counsel** | General Counsel | All - case intake, routing |
| **Liberty** | US Law Specialist | Federal & state |
| **Europa** | EU Law Specialist | GDPR, EU regulations |
| **Castile** | Spanish Law Specialist | National & autonomous |
| **Covenant** | Contract Specialist | Cross-jurisdictional |
| **Tribute** | Tax Counsel | Cross-border taxation |
| **Advocate** | Litigation Strategist | Dispute resolution |
| **Iberia** | Spain Civil Law | Family, property, inheritance |
| **Gremio** | Spain Labor Law | Employment, collective labor |
| **Baltic** | Estonia Corporate | e-Residency, OÜ formation |
| **Charter** | Corporate Governance | Board matters, fiduciary |
| **Insignia** | IP Counsel | Trademarks, patents, copyrights |
| **Deed** | Real Estate Counsel | Property transactions |

**Disclaimer:** Designed for Party Mode support, not standalone legal advice

**Integration Effort:** Low
**Dependencies:** None (standalone module)
**PR Priority:** LOW

---

## Section 2: Security Infrastructure (High-Value PR Candidates)

### 2.1 OWASP AI Security Framework

**Recommendation:** **STRONG PR CANDIDATE** - Critical for any AI/LLM framework

**Score:** 95/100 (Excellent)

#### OWASP Top 10 LLM Coverage

| # | Vulnerability | Status | Key Controls |
|---|---------------|--------|--------------|
| LLM01 | Prompt Injection | PROTECTED | 35+ injection patterns, multi-stage detection, Base64 decoding |
| LLM02 | Insecure Output Handling | PROTECTED | Shell sanitization, path validation, null byte protection |
| LLM03 | Training Data Poisoning | N/A | No model training |
| LLM04 | Model Denial of Service | PROTECTED | Rate limiting (sliding window), memory limits (4GB), recursion limits |
| LLM05 | Supply Chain Vulnerabilities | PROTECTED | SHA256+GPG verification, plugin validation |
| LLM06 | Sensitive Info Disclosure | PROTECTED | PII detection, Luhn/IBAN validation, GDPR compliance |
| LLM07 | Insecure Plugin Design | PROTECTED | Capability-based security, plugin permission model |
| LLM08 | Excessive Agency | PROTECTED | Single-use override tokens, TOCTOU-safe operations |
| LLM09 | Overreliance | PROTECTED | Confidence indicators, uncertainty detection |
| LLM10 | Model Theft | N/A | No proprietary models |

#### Key Security Controls

| Control | Description | Location |
|---------|-------------|----------|
| **Prompt Injection Guard** | Multi-pattern detection with severity levels | `src/security/validators/` |
| **Jailbreak Detector** | Bypass attempt detection | `src/security/validators/` |
| **PII Protector** | GDPR-compliant data protection | `src/security/validators/` |
| **Rate Limiter** | Sliding window algorithm | `src/security/validators/rate-limiter.js` |
| **Supply Chain Verifier** | SHA256+GPG signing | `src/security/validators/` |
| **Plugin Permission Model** | Capability-based isolation | `src/security/validators/` |
| **Audit Logger** | Tamper-evident logging with SHA256 chains | `_bmad/framework/audit/` |

**Integration Effort:** Medium-High
**Dependencies:** TypeScript/JavaScript framework
**PR Priority:** HIGH

---

### 2.2 Security Validator Suite

**Recommendation:** **STRONG PR CANDIDATE** - 139+ production-ready validators

#### Validator Categories

| Category | Count | Key Validators |
|----------|-------|----------------|
| **Input Validation** | 25+ | Path traversal, shell injection, SQL injection, XSS |
| **Authentication** | 15+ | Token validation, session management, RBAC |
| **Authorization** | 12+ | Permission inheritance, capability checks |
| **Rate Limiting** | 8+ | Per-tool limits, sliding window, burst protection |
| **PII Protection** | 10+ | Pattern detection, Luhn validation, IBAN validation |
| **Audit & Logging** | 15+ | Hash chains, encryption, integrity verification |
| **Anomaly Detection** | 8+ | Behavioral analysis, threshold alerts |
| **Supply Chain** | 10+ | Package verification, signature validation |
| **Observability** | 12+ | Telemetry, metrics, alerting |

#### Rate Limits (Default)

| Tool | Limit | Window |
|------|-------|--------|
| Bash | 60/min | Sliding |
| Write | 100/min | Sliding |
| Read | 400/min | Sliding |
| Task | 40/min | Sliding |

**Integration Effort:** Medium
**Dependencies:** Node.js runtime
**PR Priority:** HIGH

---

### 2.3 Compliance Framework Support

**Recommendation:** **PR CANDIDATE** - Valuable for enterprise deployments

#### Supported Frameworks (20+)

| Region | Frameworks |
|--------|------------|
| **US** | NIST 800-53, SOC 2, PCI-DSS, HIPAA, FedRAMP, CMMC |
| **EU** | GDPR, NIS2, Cyber Resilience Act (CRA), DORA, AI Act |
| **Global** | ISO 27001/27017/27018, CIS Controls, CSA STAR |
| **Industry** | SWIFT CSP, NERC CIP, TISAX |

#### Compliance Audit Workflow

- 10-step process
- Multi-framework gap assessment
- Evidence collection planning
- Control mapping automation
- Audit-ready documentation generation

**Integration Effort:** Low
**Dependencies:** Cybersec-Team module
**PR Priority:** MEDIUM

---

## Section 3: Core Enhancements (Moderate PR Candidates)

### 3.1 Abdul - Master Project Manager

**Recommendation:** **PR CANDIDATE** - Enhanced cross-module orchestration

#### Capabilities

| Feature | Description |
|---------|-------------|
| **Cross-Module Coordination** | Orchestrate agents across all installed modules |
| **Intelligent Routing** | Automatically route tasks to appropriate specialists |
| **Phase Gate Validation** | Validate requirements before phase transitions |
| **Conflict Resolution** | Handle conflicts between modules/teams |
| **Project Status Dashboard** | Generate comprehensive status reports |
| **What's Next Recommendations** | Analyze project state, recommend next actions |

**Integration Effort:** Medium
**Dependencies:** Core module updates
**PR Priority:** MEDIUM

---

### 3.2 Enhanced Party Mode

**Recommendation:** **PR CANDIDATE** - 27+ presets for team assembly

#### New Presets Categories

| Category | Preset Count | Examples |
|----------|--------------|----------|
| **Strategic Council** | 5 | All archetypes, ethics review, power analysis |
| **Crisis Management** | 4 | Crisis response, incident command |
| **Executive** | 6 | Board prep, MA due diligence, performance review |
| **Security** | 4 | Security architecture, threat modeling |
| **Intelligence** | 5 | Attribution chain, operation mosaic |

#### Cross-Module Orchestration

- Automatic module expertise identification
- Multi-team incident response
- Compliance-driven development
- Security-aware software lifecycle

**Integration Effort:** Low-Medium
**Dependencies:** Party Mode base
**PR Priority:** MEDIUM

---

## Section 4: Infrastructure Improvements

### 4.1 TypeScript Framework

**Recommendation:** **OPTIONAL PR** - Production hardening

| Component | Description |
|-----------|-------------|
| **Audit System** | Tamper-evident logging with SHA256 hash chains |
| **Auth System** | Token-based authentication with RBAC |
| **Validator Framework** | Extensible validation pipeline |
| **Hook System** | Strategic extension points |

**Integration Effort:** High
**Dependencies:** Major architecture change
**PR Priority:** LOW (unless security focus)

---

### 4.2 CI/CD Pipeline

**Recommendation:** **OPTIONAL PR** - Quality assurance

#### GitHub Actions Workflows

| Workflow | Purpose |
|----------|---------|
| **bmad-continuous-testing** | Unit, integration, performance tests |
| **bmad-extraction-qa** | Module extraction validation |
| **quality-gate** | Production readiness checks |
| **Scheduled daily tests** | Automated regression (2 AM UTC) |

#### Test Infrastructure

| Type | Count | Coverage |
|------|-------|----------|
| Unit Tests | 150+ | 90% threshold |
| Integration Tests | 50+ | Cross-module |
| Performance Tests | 32+ | Benchmarking |
| Security Tests | 25+ | Penetration testing |

**Integration Effort:** Medium
**Dependencies:** Test infrastructure
**PR Priority:** MEDIUM

---

### 4.3 Documentation Enhancements

**Recommendation:** **PR CANDIDATE** - Improved docs structure

| Enhancement | Description |
|-------------|-------------|
| **Structured Docs** | 7-section hierarchy (getting-started → archive) |
| **AGENTS.md** | Complete agent reference (387 lines) |
| **WORKFLOWS.md** | Complete workflow reference (300+ lines) |
| **Documentation Index** | Searchable documentation index |
| **Access Guidelines** | Role-based documentation access |

**Integration Effort:** Low
**Dependencies:** None
**PR Priority:** MEDIUM

---

## Section 5: PR Recommendation Summary

### Tier 1: High Priority (Recommended for Immediate PR)

| Feature | Value Proposition | Integration Effort | Risk |
|---------|-------------------|-------------------|------|
| **Cybersec-Team Module** | Universal security value | Medium | Low |
| **OWASP AI Security Framework** | Critical AI safety | Medium-High | Low |
| **Security Validator Suite** | Production hardening | Medium | Low |

### Tier 2: Medium Priority (Good Candidates)

| Feature | Value Proposition | Integration Effort | Risk |
|---------|-------------------|-------------------|------|
| **Intel-Team Module** | Threat intelligence | Medium | Low |
| **Strategy-Team Module** | Executive tooling | Low-Medium | Low |
| **Compliance Frameworks** | Enterprise readiness | Low | Low |
| **Enhanced Party Mode** | Collaboration | Low-Medium | Low |
| **Abdul Orchestrator** | Coordination | Medium | Medium |
| **CI/CD Pipeline** | Quality assurance | Medium | Low |

### Tier 3: Optional (Specialized Use Cases)

| Feature | Value Proposition | Integration Effort | Risk |
|---------|-------------------|-------------------|------|
| **Legal-Team Module** | Legal perspective | Low | Medium |
| **CIS Enhancements** | Creative tools | Low | Low |
| **TypeScript Framework** | Production infra | High | Medium |

---

## Section 6: Suggested PR Sequence

### Phase 1: Security Foundation

1. **Security Validator Suite** (standalone, high value)
2. **OWASP AI Security Framework** (builds on validators)

### Phase 2: Operational Teams

1. **Cybersec-Team Module** (standalone, universal value)
2. **Intel-Team Module** (standalone, threat intel)
3. **Strategy-Team Module** (standalone, executive tools)

### Phase 3: Enhancements

1. **Enhanced Party Mode** (builds on teams)
2. **Abdul Orchestrator** (coordination layer)
3. **Compliance Frameworks** (builds on cybersec)

### Phase 4: Infrastructure

1. **CI/CD Pipeline** (quality gates)
2. **Documentation Structure** (user experience)

---

## Appendix A: File Structure Additions

```
src/
├── intel-team/
│   ├── agents/           # 9 intelligence agents
│   ├── workflows/        # 19 intel workflows
│   └── module.yaml
├── security/
│   └── validators/       # Security validators (JS)
├── utility/
│   └── tools/            # Build and installer tools
└── config/
    └── dependencies.yaml

_bmad/
├── core/
│   ├── agents/           # Core agents (Abdul, bmad-master)
│   └── workflows/        # Core orchestration workflows
├── cybersec-team/
│   ├── agents/           # 11 security agents
│   └── workflows/        # 13 security workflows
├── strategy-team/
│   ├── agents/           # 14 strategy agents
│   └── workflows/        # 16 strategy workflows
├── legal-team/
│   ├── agents/           # 13 legal agents
│   └── workflows/        # 7 legal workflows
├── bmm/
│   └── workflows/        # BMM development workflows
└── framework/
    ├── audit/            # Tamper-evident logging (TS)
    ├── auth/             # Token-based auth (TS)
    ├── validators/       # Validation pipeline (TS)
    └── hooks/            # Extension hooks (TS)
```

---

## Appendix B: Compatibility Notes

| BMAD-METHOD Version | Compatibility | Notes |
|---------------------|---------------|-------|
| 1.x | Full | All modules compatible |
| 2.x | Expected | Architecture aligned |

### Breaking Changes

- None anticipated for modular PR approach
- Security validators require Node.js 20+ (Node.js 20+ required)
- Framework components use TypeScript (compiled to JavaScript)

### Migration Path

- Modules are additive (no existing functionality modified)
- Optional adoption (users choose which modules to install)
- Graceful degradation (features work independently)

---

*Document updated for BMAD-CYBERSEC v2.2.0*
*Last Updated: February 2026*
