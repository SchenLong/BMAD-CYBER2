# BMAD Web Server - UX Design & Interface Patterns

**Project:** BMAD Web Server with Full UI
**Version:** 1.0.0
**Date:** 2025-02-15
**Designers:** Sally (UX Designer), Barry (Quick Flow Dev), John (Product Manager)

---

## INDEX

| Section | Lines | Description |
|---------|-------|-------------|
| [1. Design Principles](#1-design-principles) | 17-26 | Core UX principles |
| [2. Onboarding & Role Selection](#2-onboarding--role-selection) | 29-74 | First-time wizard, role-based configuration |
| [3. Abdul-Guided Conversation](#3-primary-interface---abdul-guided-conversation) | 77-145 | Welcome screen, quick actions by role |
| [4. Progressive Disclosure Layers](#4-progressive-disclosure-layers) | 148-202 | 4-layer model, layer triggers |
| [5. Team Selection Interface](#5-team-selection-interface) | 205-289 | Team cards, agent roster |
| [6. Real-Time Agent Observability](#6-real-time-agent-observability) | 293-357 | Progress streaming, technical implementation |
| [7. CLI Preservation](#7-cli-preservation-technical-users) | 361-405 | Terminal emulator, CLI mirror |
| [8. Enterprise Template System](#8-enterprise-template-system) | 409-481 | Template selection, custom builder |
| [9. Navigation Structure](#9-navigation-structure) | 485-531 | Primary & secondary navigation by role |
| [10. Responsive Design](#10-responsive-design) | 535-558 | Breakpoints, mobile strategy |
| [11. Accessibility](#11-accessibility) | 562-570 | WCAG, keyboard shortcuts |
| [12. Component Inventory](#12-component-inventory) | 574-646 | Core UI components, design specs |
| [13. Design Tokens](#13-design-tokens) | 650-711 | Colors, typography, spacing |
| [14. Animation & Microinteractions](#14-animation--microinteractions) | 715-725 | Animation timings |
| [15. UX Patterns Summary](#15-ux-patterns-summary) | 729-739 | Pattern benefits table |
| [16. Future Considerations](#16-future-considerations-phase-2) | 743-751 | Phase 2+ UX features |

---

## Executive Summary

This document defines the user experience design for the BMAD Web Server. The interface uses a **role-based progressive disclosure model** where the experience adapts to the user's selected role during onboarding, with Abdul (Master Project Manager) serving as the primary conversational interface.

---

## 1. Design Principles

| Principle | Application |
|-----------|-------------|
| **Role-Based Experience** | Interface adapts to user's selected role during onboarding wizard |
| **Progressive Disclosure** | Complexity revealed only when needed |
| **Conversational First** | Abdul-guided interaction, not menu hunting |
| **Team-Based Mental Model** | Users select by expertise domain, not agent names |
| **CLI Preservation** | Technical users can access and learn CLI commands |
| **Enterprise-Ready Output** | Stakeholder-friendly templates from day one |

---

## 2. Onboarding & Role Selection

### 2.1 First-Time Experience Wizard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Welcome to BMAD ─────────────────────────────────────────────────────────  │
│                                                                              │
│   Let's set up your experience. What best describes your role?              │
│                                                                              │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│   │                  │  │                  │  │                  │        │
│   │  👤              │  │  👥              │  │  🎯              │        │
│   │                  │  │                  │  │                  │        │
│   │  Solo Operator   │  │  Team Lead       │  │  Executive       │        │
│   │                  │  │                  │  │                  │        │
│   │  PI, Consultant  │  │  Agency Mgr,     │  │  C-Suite,        │        │
│   │  Researcher      │  │  Dept Head       │  │  Director        │        │
│   │                  │  │                  │  │                  │        │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘        │
│                                                                              │
│   ┌──────────────────┐                                                       │
│   │                  │                                                       │
│   │  💻              │                                                       │
│   │                  │                                                       │
│   │  Developer       │                                                       │
│   │                  │                                                       │
│   │  API access,     │                                                       │
│   │  Automation      │                                                       │
│   │                  │                                                       │
│   └──────────────────┘                                                       │
│                                                                              │
│   [ Skip ]  [ Continue ]                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Role-Based Interface Configuration

| Role | Default View | Quick Actions | Features Exposed |
|------|--------------|---------------|------------------|
| **Solo Operator** | Chat interface | Intel Team, Security Team, Strategic Team | Projects, Templates, CLI Access |
| **Team Lead** | Project Dashboard | Delegate to Team, View Status | Team management, Client reports, Templates |
| **Executive** | Executive Dashboard | Risk Summary, Active Projects | Custom dashboards, One-page briefs |
| **Developer** | API Documentation | Generate API Key, View Endpoints | CLI emulator, Web hooks, API explorer |

---

## 3. Primary Interface - Abdul-Guided Conversation

### 3.1 Welcome Screen (All Personas)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BMAD                                                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  📊 Abdul ────────────────────────────────────────────────────       │   │
│   │                                                                     │   │
│   │  Welcome back, {user_name}! 👋                                      │   │
│   │                                                                     │   │
│   │  I'm here to help you get things done. What are you                 │   │
│   │  working on today?                                                 │   │
│   │                                                                     │   │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐                    │   │
│   │  │ 🔍         │  │ ⚔️         │  │ ♟️         │                    │   │
│   │  │ Intel      │  │ Security   │  │ Strategy   │                    │   │
│   │  │ Team       │  │ Team       │  │ Team       │                    │   │
│   │  └────────────┘  └────────────┘  └────────────┘                    │   │
│   │                                                                     │   │
│   │  ┌─────────────────────────────────────────────────────────────┐    │   │
│   │  │ Or just tell me what you need...                            │    │   │
│   │  │ [ Type your message ]                                      │    │   │
│   │  └─────────────────────────────────────────────────────────────┘    │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   Recent Projects                                                            │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  📁 Project Alpha         Intel Team     Last edited 2h ago          │   │
│   │  📁 Security Assessment  Security Team Last edited 1d ago          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Quick Action Buttons (Role-Configured)

**Solo Operator:**
| Button | Action | Routes To |
|--------|--------|-----------|
| 🔍 Intel Team | "I need to investigate..." | Intel Team agent roster |
| ⚔️ Security Team | "I need to secure/assess..." | Security Team agent roster |
| ♟️ Strategic Team | "I need strategic guidance..." | Strategy Team agent roster |

**Team Lead:**
| Button | Action | Routes To |
|--------|--------|-----------|
| 📋 View Projects | Show active projects | Project Dashboard |
| 👥 Delegate Task | "What do you need help with?" | Team selection interface |
| 📄 Generate Report | Template selection | Report Builder |

**Executive:**
| Button | Action | Routes To |
|--------|--------|-----------|
| 📊 Executive Dashboard | High-level metrics | Custom dashboard |
| ⚠️ Risk Summary | Active risk items | Risk view |
| 📑 One-Page Briefs | Recent briefs | Brief library |

**Developer:**
| Button | Action | Routes To |
|--------|--------|-----------|
| 🔑 API Keys | Manage API tokens | API settings |
| 📚 Documentation | API reference | Docs view |
| 💻 CLI Reference | Command library | CLI emulator |

---

## 4. Progressive Disclosure Layers

### 4.1 Layer Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BMAD UX LAYER MODEL                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LAYER 1: WELCOME (All Personas)                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Simple question: "What can I help you with today?"                 │  │
│  │  + 3 Quick Action cards based on user's role                        │  │
│  │  + Recent projects (quick resume)                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │ Reveal more based on interaction      │
│                                    ▼                                        │
│  LAYER 2: GUIDANCE (Abdul Asks Clarifying Questions)                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  User: "I need to investigate..."                                    │  │
│  │  Abdul: "Are you investigating a person, company, or threat?"        │  │
│  │  Suggested responses as buttons (low friction)                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼ (Explicit selection)                  │
│  LAYER 3: EXPERT SELECTION (Power Users, Technical Users)                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  "I want to work with the Cybersec Team" → Shows agent roster       │  │
│  │  "I want to run the flash-assessment workflow" → Direct execution   │  │
│  │  Agent cards with expertise descriptions                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼ (Settings opt-in)                     │
│  LAYER 4: POWER USER (Technical users who want control)                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Direct workflow picker                                              │  │
│  │  Agent invocation by name/ID                                         │  │
│  │  CLI access (terminal emulator)                                      │  │
│  │  API key generation                                                  │  │
│  │  Advanced configuration                                               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Layer Triggers

| Trigger | Reveals | Target Persona |
|---------|---------|----------------|
| First login | Onboarding wizard | All |
| Role selection | Role-configured quick actions | All |
| Explicit team selection | Agent roster for that team | Solo Operator, Team Lead |
| "Advanced" mode toggle | Workflow picker, CLI emulator | Developer, technical users |
| Admin role | User management, system settings | Team Lead, Admin |

---

## 5. Team Selection Interface

### 5.1 Team Cards (Intel, Security, Strategic)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Select Your Expert Team ──────────────────────────────────────────────────  │
│                                                                              │
│   ┌────────────────────────────────┐  ┌────────────────────────────────┐   │
│   │                                │  │                                │   │
│   │  🔍 INTEL TEAM                 │  │  ⚔️ SECURITY TEAM              │   │
│   │  ─────────────────────────     │  │  ─────────────────────────     │   │
│   │                                │  │                                │   │
│   │  OSINT investigations,         │  │  Security assessments,        │   │
│   │  threat intelligence,         │  │  penetration testing,         │   │
│   │  corporate research,          │  │  vulnerability scans,         │   │
│   │  digital forensics             │  │  incident response             │   │
│   │                                │  │                                │   │
│   │  11 Specialized Agents         │  │  15 Security Experts           │   │
│   │                                │  │                                │   │
│   │        [ Select Team ]         │  │        [ Select Team ]         │   │
│   │                                │  │                                │   │
│   └────────────────────────────────┘  └────────────────────────────────┘   │
│                                                                              │
│   ┌────────────────────────────────┐                                         │
│   │                                │                                         │
│   │  ♟️ STRATEGIC TEAM             │                                         │
│   │  ─────────────────────────     │                                         │
│   │                                │                                         │
│   │  Strategic planning,           │                                         │
│   │  executive advisory,           │                                         │
│   │  crisis response,              │                                         │
│   │  board communications          │                                         │
│   │                                │                                         │
│   │  14 Strategic Advisors         │                                         │
│   │                                │                                         │
│   │        [ Select Team ]         │                                         │
│   │                                │                                         │
│   └────────────────────────────────┘                                         │
│                                                                              │
│   ⚖️ Legal Team available through workflows                                 │
│   [ View All Teams ]  [ I know what I need → ]                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Note:** Legal Team is primarily a workflow support resource and does not appear as a primary quick action. Users can access legal expertise through:
- Abdul routing ("I need legal advice...")
- Workflow selection (contract-review, compliance-check, etc.)
- Agent roster (full agent list view)

### 5.2 Agent Roster (After Team Selection)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Intel Team ──────────────────────────────────────────────────────────────  │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  🎯 Vector (OSINT Lead)                                            │   │
│   │  ──────────────────────────────────────────────────────────────     │   │
│   │  Intelligence Operations Director - All-source fusion specialist   │   │
│   │  [ View Profile ]  [ Start Conversation ]                          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  🌐 Resolver (Domain Intel)                                         │   │
│   │  ──────────────────────────────────────────────────────────────     │   │
│   │  Network & Domain Intelligence - Infrastructure reconnaissance      │   │
│   │  [ View Profile ]  [ Start Conversation ]                          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  📱 Echo (Social Media)                                             │   │
│   │  ──────────────────────────────────────────────────────────────     │   │
│   │  Social Media Intelligence - SOCMINT collection and analysis       │   │
│   │  [ View Profile ]  [ Start Conversation ]                          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ... [+ 8 more agents]                                                     │
│                                                                              │
│   [ Search Agents... ]  [ Filter by Expertise ]  [ View All ]              │
│                                                                              │
│   ← Back to Teams                                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Real-Time Agent Observability

### 6.1 Progress Streaming Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Agent Working ────────────────────────────────────────────────────────────  │
│                                                                              │
│  🕵️ Vector (Intel Operations Director) is working...                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✅ Loading agent persona...                                        │   │
│  │  ✅ Analyzing your request...                                       │   │
│  │  ✅ Routing to OSINT specialists...                                 │   │
│  │  ✅ Initiating flash-assessment workflow...                         │   │
│  │  ✅ Querying domain intelligence sources...                         │   │
│  │  ⏳ Correlating data across 3 sources...                           │   │
│  │  ⏳ Generating preliminary report...                               │   │
│  │  ⏸️ Pending: Social media analysis                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Current Status: Correlating OSINT data                                      │
│  Estimated: 2 minutes remaining                                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  💬 Live Output (expand for details)                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  [ View Raw Output ]  [ Pause ]  [ Cancel Operation ]                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Technical Implementation

```typescript
// SSE event types for agent progress
interface AgentProgressEvent {
  type: 'step_start' | 'step_complete' | 'step_error' | 'message';
  agentId: string;
  agentName: string;
  step: string;
  progress: number; // 0-100
  estimatedRemaining?: number; // seconds
  message?: string;
}

// UI component for streaming progress
function AgentProgressStream({ agentId }: { agentId: string }) {
  const [events, setEvents] = useState<AgentProgressEvent[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/agents/${agentId}/observe`);

    eventSource.onmessage = (e) => {
      const event = JSON.parse(e.data) as AgentProgressEvent;
      setEvents(prev => [...prev, event]);
    };

    return () => eventSource.close();
  }, [agentId]);

  return <ProgressTimeline events={events} />;
}
```

---

## 7. CLI Preservation (Technical Users)

### 7.1 Terminal Emulator Component

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CLI Access ─────────────────────────────────────────────────────── [□]    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🖥️ BMAD CLI Terminal                                            │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  $ bmad invoke intel-team flash-assessment \                       │   │
│  │         --target example.com --output json                         │   │
│  │                                                                     │   │
│  │  ⏳ Executing flash-assessment workflow...                         │   │
│  │  ✓ Loading osint-lead (Vector)...                                  │   │
│  │  ✓ Loading domain-intel-specialist (Resolver)...                   │   │
│  │  ✓ Loading social-media-analyst (Echo)...                          │   │
│  │                                                                     │   │
│  │  [✓] Domain: example.com                                           │   │
│  │  [✓] DNS: 93.184.216.34                                            │   │
│  │  [✓] NS: a.ns.cloudflare.com                                       │   │
│  │  [✓] MX: mail.example.com                                          │   │
│  │  [✓] SOA: ns.icann.org                                             │   │
│  │  [✓] Social: No verified accounts found                            │   │
│  │                                                                     │   │
│  │  ✅ Flash Assessment Complete                                       │   │
│  │  📄 Output: _bmad-output/flash-assessment-20250215.md              │   │
│  │                                                                     │   │
│  │  $ █                                                                │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  [Copy Command]  [Download as Script]  [Clear Terminal]                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Read-only mirror** of web operations (shows equivalent CLI command)
- **Interactive mode** for technical users (actual CLI execution in Phase 2)
- **Script export** for automation workflows
- **Copy to clipboard** for documentation purposes

---

## 8. Enterprise Template System

### 8.1 Template Selection

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Generate Report ─────────────────────────────────────────────────────────  │
│                                                                              │
│   Select output template:                                                    │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  📋 Executive Brief                                                │   │
│   │  One-page summary for stakeholders, key findings, recommendations  │   │
│   │  ──────────────────────────────────────────────────────────────     │   │
│   │  Preview: [Summary] [Findings] [Risks] [Recommendations]           │   │
│   │                            [ Use Template → ]                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  📑 Technical Report                                               │   │
│   │  Full technical details, methodology, raw data, appendices        │   │
│   │  ──────────────────────────────────────────────────────────────     │   │
│   │  Preview: [Methodology] [Data] [Analysis] [Appendices]            │   │
│   │                            [ Use Template → ]                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  🎨 Custom Template                                                │   │
│   │  Create or upload your organization's template format              │   │
│   │  ──────────────────────────────────────────────────────────────     │   │
│   │                            [ Create New → ]  [ Upload → ]          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   [ Manage Templates ]  [ ← Back ]                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Custom Template Builder (Enterprise)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Template Builder ─────────────────────────────────────────────────────────  │
│                                                                              │
│   Template Name: [My Company Security Assessment        ]                   │
│                                                                              │
│   Drag sections to reorder:                                                  │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│   │  1. Executive Summary                                                │   │
│   │     Fields: Risk Rating, Key Findings, Recommendation Summary         │   │
│   │     [Edit Fields]  [Remove]                                           │   │
│   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│   │  2. Methodology                                                      │   │
│   │     Fields: Assessment Type, Scope, Tools Used, Timeline             │   │
│   │     [Edit Fields]  [Remove]                                           │   │
│   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│   │  3. Findings                                                         │   │
│   │     Fields: Vulnerability List, Severity, CVSS Score, Evidence       │   │
│   │     [Edit Fields]  [Remove]                                           │   │
│   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│   │  [+ Add Section ]                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   Branding:                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Logo: [Upload]  Header Color: [#1a1a2e    ]  Font: [Inter ▼]     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   [ Preview ]  [ Save Template ]  [ Cancel ]                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Navigation Structure

### 9.1 Primary Navigation (Role-Configured)

**Solo Operator:**
| Nav Item | Icon | View |
|----------|------|------|
| Home | 🏠 | Abdul chat interface |
| Projects | 📁 | Project list & status |
| Templates | 📄 | Output templates |
| CLI | 💻 | Terminal emulator |
| Settings | ⚙️ | User settings |

**Team Lead:**
| Nav Item | Icon | View |
|----------|------|------|
| Dashboard | 📊 | Team overview, active projects |
| Projects | 📁 | Project management |
| Team | 👥 | Team member management |
| Reports | 📑 | Client report generator |
| Templates | 📄 | Output templates |
| Settings | ⚙️ | Organization settings |

**Executive:**
| Nav Item | Icon | View |
|----------|------|------|
| Executive Summary | 📊 | Custom KPI dashboard |
| Briefs | 📑 | One-page briefs library |
| Risks | ⚠️ | Risk register & summary |
| Settings | ⚙️ | Preferences |

**Developer:**
| Nav Item | Icon | View |
|----------|------|------|
| API Docs | 📚 | API documentation |
| API Keys | 🔑 | Token management |
| Explorer | 🔍 | Interactive API explorer |
| CLI | 💻 | Command reference & emulator |
| Web hooks | 🔗 | Web hook configuration |

### 9.2 Secondary Navigation (Contextual)

| Context | Secondary Nav |
|---------|---------------|
| Team Selection | Agents | Workflows | Projects |
| Agent Conversation | Profile | Related Agents | Documentation |
| Project View | Overview | Workflows | Output | History |

---

## 10. Responsive Design

### 10.1 Breakpoints

| Breakpoint | Width | Target Device |
|------------|-------|---------------|
| Mobile | < 768px | Phones (view only, limited interaction) |
| Tablet | 768px - 1024px | Tablets (simplified interface) |
| Desktop | > 1024px | Full experience (primary target) |

### 10.2 Mobile Strategy (Phase 1: Desktop-First)

**Mobile limitations (Phase 1):**
- View-only access to projects and outputs
- Read chat history
- No new project creation
- No complex workflows

**Mobile features:**
- Responsive layout for reading
- Push notifications for completed workflows
- Quick status view

**Full mobile support planned for Phase 2**

---

## 11. Accessibility

| Standard | Implementation |
|----------|----------------|
| WCAG 2.1 AA | Color contrast, keyboard navigation, screen reader support |
| Keyboard shortcuts | Cmd+K (quick actions), Cmd+N (new project), Esc (close) |
| Screen reader | ARIA labels on all interactive elements |
| Focus management | Logical tab order, visible focus indicators |
| High contrast mode | System preference detection |

---

## 12. Component Inventory

### 12.1 Core UI Components (shadcn/ui base)

```
bmad-ui/
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx          # Main Abdul chat
│   │   ├── MessageBubble.tsx          # User/agent messages
│   │   ├── QuickActions.tsx           # Action button grid
│   │   └── StreamingResponse.tsx      # SSE-powered streaming
│   ├── agents/
│   │   ├── TeamCard.tsx               # Team selection cards
│   │   ├── AgentCard.tsx              # Individual agent cards
│   │   ├── AgentRoster.tsx            # Team agent list
│   │   └── AgentProfile.tsx           # Agent detail view
│   ├── projects/
│   │   ├── ProjectCard.tsx            # Project summary card
│   │   ├── ProjectDashboard.tsx       # Project overview
│   │   └── ProjectTimeline.tsx        # Workflow status
│   ├── templates/
│   │   ├── TemplateSelector.tsx       # Template picker
│   │   ├── TemplateBuilder.tsx        # Custom template editor
│   │   └── TemplatePreview.tsx        # Template preview
│   ├── observability/
│   │   ├── AgentProgress.tsx          # Progress streaming
│   │   ├── StepIndicator.tsx          # Workflow step tracker
│   │   └── OutputViewer.tsx           # Raw output viewer
│   ├── cli/
│   │   ├── TerminalEmulator.tsx       # CLI component
│   │   └── CommandReference.tsx       # Command library
│   └── shared/
│       ├── Button.tsx                 # shadcn extension
│       ├── Input.tsx                  # shadcn extension
│       └── Modal.tsx                  # shadcn extension
```

### 12.2 Component Design Specifications

**Team Card:**
```typescript
interface TeamCardProps {
  teamId: 'intel' | 'security' | 'strategic' | 'legal';
  name: string;
  description: string[];
  agentCount: number;
  icon: string;
  onSelect: () => void;
}
```

**Agent Progress Stream:**
```typescript
interface AgentProgressProps {
  agentId: string;
  agentName: string;
  status: 'working' | 'complete' | 'error';
  steps: ProgressStep[];
  estimatedRemaining?: number;
  onCancel?: () => void;
}
```

**Terminal Emulator:**
```typescript
interface TerminalEmulatorProps {
  commands: TerminalCommand[];
  currentCommand?: string;
  onCommandChange?: (cmd: string) => void;
  readOnly?: boolean;
}
```

---

## 13. Design Tokens

### 13.1 Color Palette

```css
:root {
  /* Brand Colors */
  --color-primary: #6366f1;      /* Indigo 500 */
  --color-primary-dark: #4f46e5; /* Indigo 600 */
  --color-secondary: #8b5cf6;    /* Violet 500 */

  /* Team Colors */
  --color-intel: #0ea5e9;        /* Sky 500 */
  --color-security: #ef4444;     /* Red 500 */
  --color-strategic: #f59e0b;    /* Amber 500 */
  --color-legal: #10b981;        /* Emerald 500 */

  /* Neutral */
  --color-bg: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-text: #0f172a;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;

  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

### 13.2 Typography

```css
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --text-xs: 0.75rem;   /* 12px */
  --text-sm: 0.875rem;  /* 14px */
  --text-base: 1rem;    /* 16px */
  --text-lg: 1.125rem;  /* 18px */
  --text-xl: 1.25rem;   /* 20px */
  --text-2xl: 1.5rem;   /* 24px */
  --text-3xl: 1.875rem; /* 30px */
}
```

### 13.3 Spacing

```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */
}
```

---

## 14. Animation & Microinteractions

| Interaction | Animation | Duration |
|-------------|-----------|----------|
| Page transition | Fade in + slide up | 300ms |
| Modal open | Scale in + fade | 200ms |
| Button hover | Background shift | 150ms |
| Message sent | Slide in from right | 250ms |
| Progress update | Number count | 500ms |
| Agent thinking | Pulsing dots | Infinite |

---

## 15. UX Patterns Summary

| Pattern | Implementation | Benefit |
|---------|----------------|---------|
| **Role-based onboarding** | Wizard with role selection | Tailored experience from day one |
| **Progressive disclosure** | 4-layer model | Reduces cognitive load |
| **Conversational interface** | Abdul-first chat | Natural interaction model |
| **Team-based selection** | Cards for Intel/Security/Strategy | Domain-first mental model |
| **Real-time observability** | SSE streaming | Transparency, reduced perceived wait |
| **CLI emulator** | Terminal component | Bridge for technical users |
| **Enterprise templates** | Template system | Stakeholder-ready output |
| **Quick actions** | Role-configured buttons | Reduced friction for common tasks |

---

## 16. Project Management UI

### 16.1 Project Dashboard (Team Lead Persona)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Dashboard ─────────────────────────────────────────────────────────────────  │
│                                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │  3 Active Projects  │  │  12 This Month      │  │  94% On Time         │ │
│  │  ━━━━━━━━━━━━━━━━━  │  │  ━━━━━━━━━━━━━━━━━  │  │  ━━━━━━━━━━━━━━━━━  │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
│                                                                              │
│  Active Projects                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📁 Security Assessment - Acme Corp              Active ●         │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  Team: 4 members  │  Workflows: 3 completed  │  Due: Mar 15       │   │
│  │                              │                    │  75% complete   │   │
│  │  [View →]  [Assign Task]                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Quick Actions                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │  [+ New Project] │  │  [View All]      │  │  [Generate Report]│        │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 16.2 Project Creation Flow

**Step 1: Select Project Type**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Create New Project - Step 1 of 3                                    [×]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                              │
│  What type of project is this?                                             │
│                                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ 🛡️           │ │ 🚨           │ │ 🔍           │ │ ⚖️           │      │
│  │ Security     │ │ Incident     │ │ Investigation │ │ Advisory     │      │
│  │ Assessment   │ │ Response     │ │              │ │              │      │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                        │
│  │ 🔓 Forensics │ │ 📚 Compliance│ │ 🎓 Training  │                        │
│  └──────────────┘ └──────────────┘ └──────────────┘                        │
│                                                                              │
│                                   [← Back]  [Next →]                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Step 2: Project Details**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Create New Project - Step 2 of 3                                    [×]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                              │
│  Project name:                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Acme Corp Security Assessment Spring 2025                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Client name (optional):                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Acme Corporation                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Description:                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Comprehensive security assessment including architecture review,    │   │
│  │ threat modeling, and vulnerability assessment.                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Target completion:  [March 15, 2025                              📅]      │
│                                                                              │
│  Tags:                                                        [+ Add tag]   │
│  [enterprise] [external] [quarterly]                                     │
│                                                                              │
│                                   [← Back]  [Next →]                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Step 3: Add Team Members**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Create New Project - Step 3 of 3                                    [×]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                              │
│  Add team members (optional - can add later)                                │
│                                                                              │
│  Team:                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  👤 J (Owner)                                              [×]     │   │
│  │  [+ Add team member]                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Or select a template:                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │  Standard        │  │  Incident        │  │  Custom          │        │
│  │  Assessment      │  │  Response        │  │  Setup           │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                              │
│                                   [← Back]  [Create Project]                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 16.3 Project Detail View

**Tab Navigation:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📁 Acme Corp Security Assessment                                [Settings] │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                              │
│  Active ●  │  Execution  │  Due: March 15, 2025  │  75% Complete              │
│                                                                              │
│  ┌────────────┬────────────┬────────────┬────────────┬────────────┐        │
│  │ Overview   │ Workflows  │ Artifacts  │ Team       │ Deliverables│       │
│  └────────────┴────────────┴────────────┴────────────┴────────────┘        │
│                                                                              │
│  [Tab content below...]                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Overview Tab:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Project Overview                                                            │
│  ────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  WORKFLOWS (3/5 completed)                                          │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  ✅ Security Architecture Review                    2 days ago    │   │
│  │  ✅ Threat Modeling                                     1 day ago     │   │
│  │  🔄 Vulnerability Assessment                          In Progress   │   │
│  │  ⏸️ Compliance Review                                   Pending     │   │
│  │  ⏸️ Final Report Generation                            Pending     │   │
│  │                              [+ Add Workflow]                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TEAM (4)                                                   [+ Add] │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  👤 J (Owner)         👤 Alice (Lead)    👤 Bob      👤 Carol      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  DELIVERABLES (2/5 completed)                              [+ Add] │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  ✅ Initial Findings Report                                       │   │
│  │  ✅ Threat Model Document                                         │   │
│  │  🔄 Final Assessment Report (Due: Mar 15)                         │   │
│  │  ⏸️ Executive Briefing                                           │   │
│  │  ⏸️ Remediation Guide                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 16.4 Specialized Project Views

**Incident Response Project:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🚨 Incident Response - Ransomware XYZ-2025                   Active 🔴    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                              │
│  INC-2025-003  │  Severity: Critical  │  Phase: Containment  │  5 team     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📍 STATUS                     │  📊 TIMELINE                       │   │
│  │  Current: Containment           │  [Interactive Timeline Viz]        │   │
│  │  Affected: 3 systems            │  Last update: 5 min ago            │   │
│  │  Contained: 2 systems           │                                    │   │
│  │                                │                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  EVIDENCE LOCKER                                     [Upload 🔼]    │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  📄 memory_dump.raw        SHA-256 verified         2h ago       │   │
│  │  📄 network_traffic.pcap   SHA-256 verified         1h ago       │   │
│  │  📄 ransomware_note.txt    SHA-256 verified         3h ago       │   │
│  │                                                                    │   │
│  │  [View All Evidence]                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TEAM PRESENCE                                                      │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  🔵 Phoenix (Commander)  - Working on containment strategy         │   │
│  │  🔵 Trace (Forensics)     - Analyzing memory dump                   │   │
│  │  ⚪ Cipher (Intel)        - Last seen 30 min ago                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Penetration Test Project:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎯 Penetration Test - Acme External                            Active 🟡   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                              │
│  PENTEST-2025-007  │  Scope: External  │  Week 2  │  12 findings          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  FINDINGS TRACKER                                          [+ Add] │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │                                                                    │   │
│  │  Severity  │  Status        │  Finding                           │   │
│  │  ─────────────────────────────────────────────────────────────     │   │
│  │  🔴 Critical│  🔄 Fixing     │  SQL Injection on login endpoint   │   │
│  │  🟠 High   │  ✅ Verified    │  XSS on profile page               │   │
│  │  🟠 High   │  🔄 Testing     │  Broken access control - admin     │   │
│  │  🟡 Medium │  ⏸️ Pending     │  Information disclosure - headers  │   │
│  │  🟢 Low    │  ✅ Verified    │  Missing security headers          │   │
│  │                                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PHASE PROGRESS                                                      │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  ✅ Reconnaissance        ████████████████████  100%                │   │
│  │  ✅ Enumeration           ████████████████████  100%                │   │
│  │  🔄 Exploitation          ████████████░░░░░░░░   50%                 │   │
│  │  ⏸️ Post-Exploitation     ░░░░░░░░░░░░░░░░░░░░    0%                 │   │
│  │  ⏸️ Reporting             ░░░░░░░░░░░░░░░░░░░░    0%                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 16.5 Project Component Additions

**New components in `components/projects/`:**
```typescript
components/
├── projects/
│   ├── ProjectCard.tsx              // Summary card for lists
│   ├── ProjectList.tsx              // Filterable list view
│   ├── ProjectDetail.tsx            // Main project page with tabs
│   ├── ProjectCreateWizard.tsx      // Multi-step creation flow
│   ├── ProjectStatusBadge.tsx       // Status indicator
│   ├── ProjectProgressTracker.tsx   // Visual progress bar
│   │
│   ├── tabs/
│   │   ├── OverviewTab.tsx          // Project overview
│   │   ├── WorkflowsTab.tsx         // Workflow management
│   │   ├── ArtifactsTab.tsx         // File/evidence management
│   │   ├── TeamTab.tsx              // Team member management
│   │   └── DeliverablesTab.tsx      // Deliverable tracking
│   │
│   └── specialized/
│       ├── IncidentWorkspace.tsx    // IR-specific interface
│       ├── PentestTracker.tsx       // Pentest findings tracker
│       ├── TimelineVisualization.tsx // Timeline view
│       └── EvidenceLocker.tsx       // Evidence with hash verification
```

---

## 17. Updated Component Inventory

### 17.1 Complete Component Tree

```
bmad-ui/
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── QuickActions.tsx
│   │   └── StreamingResponse.tsx
│   ├── agents/
│   │   ├── TeamCard.tsx
│   │   ├── AgentCard.tsx
│   │   ├── AgentRoster.tsx
│   │   └── AgentProfile.tsx
│   ├── projects/                          // UPDATED
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectList.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── ProjectCreateWizard.tsx
│   │   ├── ProjectStatusBadge.tsx
│   │   ├── ProjectProgressTracker.tsx
│   │   ├── tabs/
│   │   │   ├── OverviewTab.tsx
│   │   │   ├── WorkflowsTab.tsx
│   │   │   ├── ArtifactsTab.tsx
│   │   │   ├── TeamTab.tsx
│   │   │   └── DeliverablesTab.tsx
│   │   └── specialized/
│   │       ├── IncidentWorkspace.tsx
│   │       ├── PentestTracker.tsx
│   │       ├── TimelineVisualization.tsx
│   │       └── EvidenceLocker.tsx
│   ├── templates/
│   │   ├── TemplateSelector.tsx
│   │   ├── TemplateBuilder.tsx
│   │   └── TemplatePreview.tsx
│   ├── observability/
│   │   ├── AgentProgress.tsx
│   │   ├── StepIndicator.tsx
│   │   └── OutputViewer.tsx
│   ├── cli/
│   │   ├── TerminalEmulator.tsx
│   │   └── CommandReference.tsx
│   └── shared/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
```

---

## 18. Future Considerations (Phase 2+)

| Feature | UX Impact |
|---------|-----------|
| **Multi-user collaboration** | Shared project views, presence indicators, real-time updates |
| **Visual workflow builder** | n8n integration, canvas-based editor |
| **Mobile app** | Native iOS/Android, push notifications |
| **Voice interface** | Speech-to-text for hands-free operation |
| **Advanced dashboards** | Customizable widgets, drag-drop layout |
| **Project templates** | Reusable project structures for common engagements |
