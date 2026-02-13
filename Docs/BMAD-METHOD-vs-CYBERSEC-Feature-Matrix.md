# BMAD-METHOD vs BMAD-CYBERSEC Feature Matrix

**Purpose:** Feature comparison for potential BMAD-METHOD PR integration
**Date:** 2026-02-13
**Status:** Updated for v2.3.0 (TPI-CrowdStrike Compliance Release)

---

## Executive Summary

BMAD-CYBERSEC extends the BMAD-METHOD foundation with **81+ specialized agents** (4 operational teams), **200+ domain-specific workflows**, enterprise-grade security infrastructure, and production-ready compliance frameworks. The additions fall into three categories:

1. **High-Value PR Candidates** - Universal applicability, low integration risk
2. **Specialized Extensions** - Domain-specific, modular installation
3. **Infrastructure Enhancements** - Production hardening, optional adoption

### Quick Stats Comparison

| Metric | BMAD-METHOD | BMAD-CYBERSEC v2.3.0 | Delta |
|--------|---------------|-------------------------|-------|
| **Total Agents** | ~21 | 81+ | +60 |
| **Total Workflows** | ~50 | 200+ | +150 |
| **Modules** | 5 | 9+ | +4+ |
| **Compliance Frameworks** | - | 20+ | +20 |
| **Security Validators** | - | 139+ | +139 |
| **OWASP AI Score** | N/A | 95/100 | - |
| **Test Coverage** | N/A | 7,117+ tests | - |
| **TPI-CrowdStrike** | N/A | ✅ Compliant | - |

---

## Section 1: New Specialized Teams (High-Value PR Candidates)

### 1.1 Cybersec-Team Module

**Recommendation:** **STRONG PR CANDIDATE** - Universal value for any development team

| Component | Description | Agents | Workflows |
|-----------|-------------|--------|-----------|
| **Core Security** | Enterprise security operations | 15 | 13 |

#### Core Security Agents (15)

| Codename | Agent Name | Role | Key Capabilities |
|----------|-------------|------|------------------|
| **Bastion** | Security Architect | Security Architecture | Zero-trust design, STRIDE threat modeling, cloud security (AWS/Azure/GCP), IAM architecture |
| **Cipher** | Threat Analyst | Threat Intel Analyst | MITRE ATT&CK mapping, APT tracking, TTP analysis, threat hunting |
| **Spectre** | Penetration Tester | Penetration Tester | Attack surface analysis, exploit chain mapping, red team ops |
| **Phoenix** | Incident Commander | Incident Commander | PICERL methodology, crisis management, containment strategy |
| **Sentinel** | Compliance Guardian | Compliance Guardian | Multi-framework compliance (NIST/SOC2/PCI/HIPAA/GDPR), gap assessments |
| **Trace** | Forensic Investigator | Forensic Investigator | Disk/memory/network forensics, timeline reconstruction, evidence preservation |
| **Watchman** | SOC Analyst | SOC Analyst | SIEM management, EDR/XDR, detection engineering |
| **Nimbus** | Cloud Security Specialist | Cloud Security | Multi-cloud posture, CSPM, container/serverless security |
| **Ledger** | Blockchain Security Expert | Blockchain Security | Smart contract auditing (Solidity/Vyper/Rust), DeFi security |
| **Weaver** | Web App Security Expert | Web App Security | OWASP Top 10, secure SDLC integration |
| **Gateway** | API Security Expert | API Security | REST/GraphQL/gRPC security, OAuth/OIDC review |
| **Oracle** | LLM AI Security Expert | LLM/AI Security | Prompt injection defense, AI governance, adversarial ML |
| **Phantom** | Mobile Security Expert | Mobile Security | iOS/Android testing, OWASP MSTG methodology |
| **Shield** | Blue Team Lead | Blue Team Lead | Detection engineering, purple team ops, security automation |
| **Ghost** | Social Engineer | Social Engineer | Phishing campaigns, vishing, security awareness design |

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
| **Core Intelligence** | OSINT & analysis | 11 | 19 |

#### Intelligence Agents (11)

| Codename | Title | Specialty |
|----------|-------|-----------|
| **Vector** | OSINT Lead | Intel Operations Director - All-source coordination, collection management |
| **Analyst** | Corporate Intel Specialist | Business intelligence, corporate registries, beneficial ownership |
| **Shadow** | Dark Web Analyst | Tor/I2P navigation, crypto tracing |
| **Resolver** | Domain Intel Specialist | DNS analysis, infrastructure mapping |
| **Atlas** | Geospatial Analyst | Imagery analysis, geolocation |
| **Tech** | Technical Researcher | Technology fingerprinting, TECHINT |
| **Cipher** | Threat Actor Profiler | APT attribution, MITRE ATT&CK |
| **Recruit** | HUMINT Specialist | Elicitation, source assessment |
| **Signal** | SIGINT Specialist | RF reconnaissance, TSCM |
| **Echo** | Social Media Analyst | Platform analysis, influence ops detection |
| **Operative** | Field Operative | Surveillance, site reconnaissance |

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
| **Core Legal** | General counsel | 13 | 7 |

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

#### TPI-CrowdStrike Prompt Injection Taxonomy (NEW v2.3.0)

**Status:** ✅ Fully Compliant (100% coverage)

- **6 Epics** covering all prompt injection vectors
- **540+ automated tests** across all categories
- **35+ detection patterns** for multi-stage attacks
- **14 identified gaps (G1-G14)** all closed
- **Real-time protection** with severity-based response

| Epic | Attack Vectors | Tests | Coverage |
|-------|---------------|-------|----------|
| **Epic 1** | Direct Prompt Injection | 67 | 100% |
| **Epic 2** | Indirect Prompt Injection | 89 | 100% |
| **Epic 3** | Multi-Stage Attacks | 94 | 100% |
| **Epic 4** | Encoded Payloads | 103 | 100% |
| **Epic 5** | Role Hijacking | 98 | 100% |
| **Epic 6** | Authority Spoofing | 89 | 100% |

#### Key Security Controls

| Control | Description | Location |
|---------|-------------|----------|
| **Prompt Injection Guard** | Multi-pattern detection with severity levels | `src/security/validators/` |
| **Jailbreak Detector** | Bypass attempt detection (28 patterns) | `src/security/validators/` |
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
| Unit Tests | 7,117+ | 95% threshold |
| Integration Tests | 50+ | Cross-module |
| Performance Tests | 32+ | Benchmarking |
| Security Tests | 25+ | Penetration testing |
| OWASP Tests | 405+ | Full compliance |

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
| **TPI-CrowdStrike Compliance** | Enterprise-grade prompt injection protection | Medium | Low |
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
3. **TPI-CrowdStrike Compliance** (builds on validator suite)

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
│   ├── agents/           # 11 intelligence agents
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
│   ├── agents/           # 15 security agents
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
| 6.x | In Progress | V6 alignment complete |

### Breaking Changes

- None anticipated for modular PR approach
- Security validators require Node.js 20+ (Node.js 20+ required)
- Framework components use TypeScript (compiled to JavaScript)

### Migration Path

- Modules are additive (no existing functionality modified)
- Optional adoption (users choose which modules to install)
- Graceful degradation (features work independently)

---

## Appendix C: Version History

### v2.3.0 (2026-02-13) - TPI-CrowdStrike Compliance Release

**New Features:**
- ✅ Complete TPI-CrowdStrike prompt injection taxonomy (6 epics, 540+ tests)
- ✅ 100% OWASP AI Security compliance (95/100 score)
- ✅ All 14 identified gaps (G1-G14) closed
- ✅ Enhanced security validator suite (139+ validators)

**Test Coverage:**
- 7,117+ automated tests
- 208 test files
- Zero regressions
- Full OWASP coverage (Top 10, API Top 10, LLM Top 10, ASVS v4.0)

**Quality Metrics:**
- 95% OWASP LLM score
- SOC 2 audit ready
- ISO 27001 compliant
- FedRAMP ready

### v2.2.0 (2025-02-09)

- Hybrid V6 upgrade
- AI-powered help (`/bmad-help`)
- Slash command invocation (112 aliases)
- Path sanitization hardening

### v2.0.0 (2025-01-31)

- Multi-agent architecture (4 teams, 53 agents)
- Abdul orchestration
- CI/CD pipeline (4 GitHub Actions workflows)
- Enterprise security testing framework

---

*Document updated for BMAD-CYBERSEC v2.3.0*
*Last Updated: February 13, 2026*
