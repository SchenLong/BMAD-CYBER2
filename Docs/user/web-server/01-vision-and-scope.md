# BMAD Web Server - Vision & Scope Document

**Project:** BMAD Web Server with Full UI
**Version:** 1.0.0
**Date:** 2025-02-15
**Product Owner:** J
**Document Status:** Draft

---

## INDEX

| Section | Lines | Description |
|---------|-------|-------------|
| [1. Product Vision](#1-product-vision) | 19-42 | Vision statement, deployment models, guiding philosophy |
| [2. Target Users & Personas](#2-target-users--personas) | 45-61 | Primary users, use case priority |
| [3. Core Problems](#3-core-problems-being-solved) | 64-73 | Problem/solution mapping |
| [4. Business Model](#4-business-model) | 76-93 | Revenue strategy, success metrics |
| [5. Scope - Phase 1 (MVP)](#5-scope---phase-1-mvp) | 96-128 | In scope, out of scope, architecture |
| [6. Non-Functional Requirements](#6-non-functional-requirements) | 131-146 | Accessibility, compatibility, extensibility |
| [7. Design Principles](#7-design-principles) | 149-156 | Core design guidelines |
| [8. Open Questions](#8-open-questions) | 159-167 | Unresolved items |
| [Appendix: Stakeholder Quotes](#appendix-key-requirements-quotes-from-stakeholder) | 170-197 | Direct requirements from stakeholders |

---

## Executive Summary

BMAD is a mature CLI-based framework with 80+ specialized AI agents across 5 modules (Core, Intel, Legal, Strategy, Cybersec, Product Management). The primary objective is to build a web-based UI that makes this powerful framework accessible to business users while maintaining the CLI for technical users.

**Key Insight:** The backend is mature. The problem is lack of UI.

---

## 1. Product Vision

### 1.1 Vision Statement

> "BMAD Web Server democratizes AI-powered multi-agent orchestration by providing an intuitive web interface that guides users through intelligent workflows while maintaining the power and flexibility of the CLI for technical users."

### 1.2 What This Web Platform Will Be

| Deployment Model | Description | Target Audience |
|------------------|-------------|-----------------|
| **Integrated** | Embedded in company website as demo/sales tool | Potential enterprise customers |
| **Open Source** | Self-hosted local install (current v4.7.2) | Community, individuals, privacy-conscious orgs |
| **Enterprise** | Licensed, hosted solution with premium features | Enterprise customers, internal security teams |

### 1.3 Guiding Philosophy

The UI should **guide the user** by leveraging:
- **Abdul** (Master Project Manager) as the primary orchestrator
- **Team-based selection** (Cybersec Team, Intel Team, Legal Team, etc.)
- **Agent-based selection** (when user knows exactly who they need)
- **Workflow selection** (optional, for power users and configuration)

**NOT** a workflow picker by default. A **guided conversation experience**.

---

## 2. Target Users & Personas

### 2.1 Primary Users

| Persona | Role | Technical Level | Goals | Pain Points |
|---------|------|-----------------|-------|-------------|
| **Solo Operator** | PI, consultant, researcher | Medium-High | Get results fast, document findings | CLI is powerful but slow, no easy reporting |
| **Team Lead** | Agency manager, dept head | Low-Medium | Oversee team work, generate reports | Can't access CLI, needs visibility |
| **Executive** | C-suite, director | Low | Dashboards, insights, stakeholder reports | Too technical, no business-facing output |
| **Developer** | Technical implementer | High | API access, automation, scripting | Needs programmatic access, not just UI |

### 2.2 Use Case Priority

1. **Individual professional use** - Professional services delivery, internal security teams
2. **Small team collaboration** - Agencies, small consultancies (Phase 2)
3. **Enterprise departmental deployment** - Internal security teams, legal departments (Phase 2)

---

## 3. Core Problems Being Solved

| Problem | Impact | Solution |
|---------|--------|----------|
| **No UI** | Business users can't use BMAD | Web-based guided interface |
| **Poor discoverability** | 140+ workflows, unclear where to start | Abdul-driven guidance, not workflow picker |
| **No stakeholder reporting** | Outputs are technical markdown | Enterprise template configuration |
| **CLI-only access** | Must install locally, technical barrier | Web access, demo on company site |
| **Process gap** | Customers have their own workflows | Enterprise workflow → BMAD translation feature |

---

## 4. Business Model

### 4.1 Revenue Strategy

| Tier | Model | Features |
|------|-------|----------|
| **Community** | Open Source (MIT) | CLI + Basic Web UI, local install only |
| **Enterprise** | Licensed | Full Web UI, cloud/self-hosted, premium features, templates |

### 4.2 Success Metrics

| Metric | Definition | Target (6 months) |
|--------|------------|-------------------|
| **Deployment** | Framework deployable online and locally | 100% |
| **Enterprise Templates** | Configurable output templates | 10+ industries |
| **Workflow Translation** | Customer process → BMAD mapping | Beta ready |
| **Community Adoption** | Self-hosted installs | Track via analytics |

---

## 5. Scope - Phase 1 (MVP)

### 5.1 In Scope

| Feature | Priority | Notes |
|---------|----------|-------|
| **Web-based UI** | P0 | Access all BMAD capabilities via browser |
| **Abdul-guided experience** | P0 | Conversational entry point, not menu picker |
| **Team/Agent selection** | P0 | Choose by expertise domain |
| **CLI preservation** | P0 | Existing CLI users unaffected |
| **Enterprise templates** | P1 | Configurable output formats |
| **API access** | P1 | For developers and automation |
| **Real-time agent observability** | P1 | Watch agents "think" |
| **Security layer** | P0 | Auth, API security (Bastion's domain) |

### 5.2 Out of Scope (Planned for Later)

| Feature | Phase | Notes |
|---------|-------|-------|
| **Team collaboration** | 2 | Multi-user workflows, shared projects |
| **Visual workflow builder** | 2 | Integrate with n8n instead of building |
| **Agent marketplace** | 3 | Community-contributed agents |
| **Workflow translation** | 2 | Customer process → BMAD conversion |

### 5.3 Architecture Considerations

| Decision | Rationale |
|----------|-----------|
| **Monolith** | Simpler deployment, aligns with current Node/TS stack |
| **TypeScript + Node** | Consistent with existing BMAD codebase |
| **MIT License** | Current BMAD license, community-friendly |
| **n8n integration** | Leverage existing tool for visual workflows vs building from scratch |

---

## 6. Non-Functional Requirements

### 6.1 Accessibility
- Web interface must support the same capabilities as CLI
- Demo version on company website for sales/marketing

### 6.2 Compatibility
- Must support local self-hosted installation
- Must support enterprise cloud deployment
- CLI must remain fully functional

### 6.3 Extensibility
- Architecture must support future multi-tenant features
- Architecture must support future agent marketplace
- Enterprise workflow translation framework

---

## 7. Design Principles

1. **Guided over searchable** - Abdul leads, user follows
2. **Conversational over configurational** - Chat-like experience preferred
3. **Team-first mental model** - Organize by expertise domain
4. **Executive-friendly outputs** - Templates for stakeholders
5. **Developer-friendly APIs** - First-class citizen, not afterthought

---

## 8. Open Questions

| Question | Owner | Due Date |
|----------|-------|----------|
| Specific enterprise template requirements | Product | TBD |
| n8n integration approach vs native solution | Architecture | TBD |
| Authentication provider selection | Security | TBD |
| Multi-tenant data model for Phase 2 | Backend | TBD |

---

## Appendix: Key Requirements Quotes from Stakeholder

### User Selection Approach
> "Let the user select the workflow they desire based on a select team or agent"
> "We need a UI that guide the user leveraging Abdul, the teams, the agents"
> "Workflow selection should be an option but not necessarily a default if not configured as such"

### Deployment Models
> "It will be integrated in the website of the company and offer as opensource for local install"
> "Success is the entire framework can be deployed online on a webserver and locally by the user"

### Architecture
> "We want to keep inline with the current tech specs, ts, node etc.."

### Licensing
> "BMAD is MIT license"
> "Opensource for local install, proprietary for cloud/enterprise"

### Security
> "Nothing more than what we have" - leverage existing security model

### Future Features (Architecture Must Support)
- Team collaboration (multi-tenant)
- Visual workflow building (n8n integration)
- Agent marketplace
- Real-time observability
- Enterprise workflow translation
