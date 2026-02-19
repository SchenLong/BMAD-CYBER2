# BMAD Web Server - UI Design System

**Project:** BMAD Web Server with Full UI
**Version:** 1.0.0
**Date:** 2025-02-15
**Design Team:** Sally 🎨 (UX Designer), Sun 🐉 (Master Strategist), Giuseppe 📢 (Communications Director), Bastion 🏰 (Security Architect), John 📋 (Product Manager), Barry 🚀 (Quick Flow Solo Dev)

---

## INDEX

| Section | Lines | Description |
|---------|-------|-------------|
| [1. Design Philosophy](#1-design-philosophy) | 25-61 | Core principles, positioning, anti-statement |
| [2. Color System](#2-color-system) | 64-129 | Palette, dark mode, accent colors, usage philosophy |
| [3. Typography](#3-typography) | 133-168 | Font families, type scale, guidelines |
| [4. Layout & Spacing](#4-layout--spacing) | 171-212 | Spacing scale, container widths, grid system |
| [5. Components](#5-components) | 215-303 | Button, Card, Agent Card, Input, Status Indicator |
| [6. Motion & Animation](#6-motion--animation) | 306-353 | Philosophy, tokens, common animations, pulse |
| [7. Key Screens](#7-key-screens) | 357-424 | Mission dashboard, role-based onboarding, agent suggestions |
| [8. Admin & Settings](#8-admin--settings) | 428-701 | Settings hierarchy, priority matrix, dashboard layout, security |
| [9. Install Wizard](#9-install-wizard) | 705-1128 | Installation flow, 5-step wizard, security requirements |
| [10. Anti-Patterns](#10-anti-patterns) | 1132-1156 | What to avoid, design review checklist |
| [Appendix A: CSS Variables](#appendix-a-css-variables-reference) | 1159-1209 | CSS variables reference |
| [Appendix B: Tailwind Config](#appendix-b-tailwind-config-extension) | 1213-1251 | Tailwind config extension |

---

## 1. Design Philosophy

### 1.1 Core Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Sophisticated Minimalism** | Every element serves a purpose. Nothing decorative without function. | "Classy" means restraint, not emptiness |
| **Progressive Disclosure** | Show only what serves the moment. Hide complexity until relevant. | Avoid overload, guide focus |
| **Data-Driven Elegance** | Information hierarchy is visual. Status communicates without words. | Professional users need efficiency |
| **Conversational-First** | Abdul orchestrates. Interface supports, never dominates. | Different from "typical AI chat UI" |

### 1.2 Strategic Positioning

> "BMAD is not a chatbot. It is a mission orchestration platform."

**Headline:** "Abdul Orchestrates. You Command."

**Key Differentiators:**
- No sidebar with 80+ agents (contextual suggestions instead)
- No workflow picker by default (role-based progressive disclosure)
- Command center aesthetic, not "toy-like" AI tool
- Dark mode optimized for long sessions

### 1.3 Design Anti-Statement

**We are NOT:**
- ❌ A chatbot with a settings panel
- ❌ A workflow gallery with search
- ❌ A grid of agent cards
- ❌ "Typical AI webui"

**We ARE:**
- ✅ Mission command center
- ✅ Guided expert orchestration
- ✅ Contextual intelligence
- ✅ Sophisticated professional tool

---

## 2. Color System

### 2.1 Color Palette

#### Dark Mode (Primary)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--background-base` | `#0a0a0a` | `rgb(10, 10, 10)` | Main background |
| `--background-elevated` | `#111111` | `rgb(17, 17, 17)` | Cards, panels |
| `--background-hover` | `#1a1a1a` | `rgb(26, 26, 26)` | Hover states |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | - | Card borders |
| `--border-default` | `rgba(255, 255, 255, 0.12)` | - | Dividers |
| `--border-strong` | `rgba(255, 255, 255, 0.20)` | - | Focus rings |

#### Accent Colors (Strategic Use)

| Token | Hex | RGB | Usage | Frequency |
|-------|-----|-----|-------|-----------|
| `--accent-primary` | `#8B5CF6` | `rgb(139, 92, 246)` | Active states, key insights, selection | **RARE** - use sparingly |
| `--accent-secondary` | `#00D9FF` | `rgb(0, 217, 255)` | Actions, progress, forward movement | Moderate |
| `--accent-success` | `#22c55e` | `rgb(34, 197, 94)` | Completion, success states | Status only |
| `--accent-warning` | `#f97316` | `rgb(249, 115, 22)` | Warnings, attention needed | Status only |
| `--accent-error` | `#ef4444` | `rgb(239, 68, 68)` | Errors, critical issues | Status only |

#### Text Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--text-primary` | `#ffffff` | `rgb(255, 255, 255)` | Main content, headings |
| `--text-secondary` | `rgba(255, 255, 255, 0.70)` | - | Supporting text, descriptions |
| `--text-tertiary` | `rgba(255, 255, 255, 0.50)` | - | Metadata, timestamps |
| `--text-muted` | `rgba(255, 255, 255, 0.30)` | - | Disabled, placeholder |

### 2.2 Color Usage Philosophy

> "Use color as strategy, not decoration." — Sun

**Primary Accent (Purple):**
- Represents wisdom, authority, royalty
- Use for: active agent indicators, selected states, key insights
- **Constraint:** Never more than 15% of visible UI at any time

**Secondary Accent (Cyan):**
- Represents energy, action, progress
- Use for: CTAs, progress indicators, active workflows
- **Constraint:** Guiding, not dominating

### 2.3 Color Combinations

```css
/* Example: Card with strategic accent use */
.card {
  background: linear-gradient(135deg, #0a0a0a 0%, #111111 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.card:hover {
  border-color: rgba(139, 92, 246, 0.3); /* Purple hint on hover */
}

.card.active {
  border-color: #8B5CF6;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
}
```

---

## 3. Typography

### 3.1 Font Families

| Usage | Font | Weights | Character |
|-------|------|---------|-----------|
| **Headings** | Orbitron | 500, 600, 700 | Tech, cyber, distinctive |
| **Body** | Inter | 400, 500, 600 | Readable, professional |
| **Mono** | JetBrains Mono | 400, 500 | Code, technical data |

```css
font-family-heading: 'Orbitron', ui-sans-serif, system-ui, sans-serif;
font-family-body: 'Inter', ui-sans-serif, system-ui, sans-serif;
font-family-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
```

### 3.2 Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-xs` | 0.75rem (12px) | 1.5 | 400 | Labels, metadata |
| `--text-sm` | 0.875rem (14px) | 1.5 | 400/500 | Supporting text |
| `--text-base` | 1rem (16px) | 1.6 | 400 | Body text |
| `--text-lg` | 1.125rem (18px) | 1.5 | 500 | Emphasized content |
| `--text-xl` | 1.25rem (20px) | 1.5 | 500 | Subheadings |
| `--text-2xl` | 1.5rem (24px) | 1.4 | 600 | Card titles |
| `--text-3xl` | 1.875rem (30px) | 1.3 | 600 | Page headings |
| `--text-4xl` | 2.25rem (36px) | 1.2 | 700 | Hero titles |

### 3.3 Typography Guidelines

- **Headings:** Orbitron, 600+, letter-spacing -0.02em
- **Body:** Inter, 400-500, relaxed line-height (1.5-1.6)
- **Data:** JetBrains Mono for numbers, IDs, technical values
- **Contrast:** All text must meet WCAG AA (4.5:1 minimum)

---

## 4. Layout & Spacing

### 4.1 Spacing Scale

Based on 4px base unit:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing, icon padding |
| `--space-2` | 8px | Small gaps, inner padding |
| `--space-3` | 12px | Compact spacing |
| `--space-4` | 16px | Default spacing |
| `--space-5` | 20px | Comfortable spacing |
| `--space-6` | 24px | Section separation |
| `--space-8` | 32px | Large sections |
| `--space-10` | 40px | Major divisions |
| `--space-12` | 48px | Page margins |

### 4.2 Container Widths

| Breakpoint | Max Width | Padding |
|------------|-----------|---------|
| Mobile (<640px) | 100% | 16px |
| Tablet (640-1024px) | 640px | 24px |
| Desktop (1024-1280px) | 1024px | 32px |
| Wide (>1280px) | 1280px | 40px |

### 4.3 Grid System

12-column grid, 24px gutters:

```
┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
│    │    │    │    │    │    │    │    │    │    │    │    │  12 cols
└────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

**Common Layouts:**
- Sidebar: 3 cols (280px fixed)
- Main content: 9 cols
- Card grid: 3, 4, or 6 cols depending on breakpoint

---

## 5. Components

### 5.1 Component Philosophy

All components follow **"Card-based, subtle borders, strategic accent"** pattern:

```tsx
// Base component structure
interface ComponentProps {
  variant?: 'default' | 'active' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}
```

### 5.2 Core Components

#### Button

| Variant | Background | Border | Text | Hover |
|---------|------------|--------|------|-------|
| Primary | `#8B5CF6` | none | white | Lighten 10% |
| Secondary | transparent | `rgba(255,255,255,0.12)` | white | Border to purple |
| Ghost | transparent | none | `#00D9FF` | Underline |
| Danger | `#ef4444` | none | white | Lighten 10% |

```tsx
<Button variant="primary">Start Mission</Button>
<Button variant="secondary">View Details</Button>
<Button variant="ghost">Cancel</Button>
```

#### Card

```tsx
<Card className="hover:border-purple/30 transition-all">
  <CardHeader>
    <CardTitle>Agent Name</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

**Card States:**
- Default: `border: rgba(255,255,255,0.08)`
- Hover: `border: rgba(139, 92, 246, 0.3)`
- Active: `border: #8B5CF6 + glow`

#### Agent Card (Special)

```tsx
<AgentCard
  agentId="echo"
  status="active"
  mission="analyzing social media footprint"
  progress={65}
/>
```

Visual treatment:
- Subtle gradient background
- Purple glow when active
- Cyan progress bar
- Status pulse animation

#### Input / Chat Area

```tsx
<ChatInput
  placeholder="Describe your mission..."
  onSend={handleSend}
  suggestedActions={["Investigate domain", "Security assessment"]}
/>
```

#### Status Indicator

```tsx
<StatusIndicator status="active" />  {/* Purple pulse */}
<StatusIndicator status="idle" />    {/* Gray dot */}
<StatusIndicator status="success" /> {/* Green check */}
```

### 5.3 Component Library Stack

- **Base:** shadcn/ui components (customized)
- **Styling:** Tailwind CSS with custom config
- **Icons:** Lucide React
- **Animations:** Framer Motion (subtle only)

---

## 6. Motion & Animation

### 6.1 Animation Philosophy

> "Animations should be felt, not seen." — Sally

**Principles:**
- Subtle: User should not consciously notice
- Functional: Always communicates state change
- Fast: 200-300ms duration
- Smooth: ease-out or ease-in-out

### 6.2 Animation Tokens

```css
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;

--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 6.3 Common Animations

| Interaction | Animation | Duration |
|-------------|-----------|----------|
| Hover | Subtle border glow | 200ms |
| Click | Scale 0.98 | 100ms |
| Page load | Fade in + slide up | 300ms |
| Modal open | Scale in + fade | 200ms |
| List item | Staggered fade in | 200ms + 50ms delay |
| Progress | Smooth transition | 300ms |

### 6.4 Pulse Animation (Status)

```css
@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.pulse {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

---

## 7. Key Screens

### 7.1 Mission Dashboard (Primary Screen)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BMAD  │  Mission: OSINT Investigation                  │  ●●● J  │  ⚙️   │
│        │  Target: example.com                            │          │       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  👤 Abdul  │  Status: Coordinating 3 agents                            │  │
│  │            │  "Echo has identified 12 social accounts. Building       │  │
│  │            │   threat actor profile..."                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                                │
│  │  Echo    │  │ Dossier  │  │ Vector   │  Active Agents                   │
│  │ SOCMINT  │  │ Threat   │  │ Intel    │  (3 engaged)                    │
│  │ ████████░│  │ ██████░░░│  │ ████████░│                                  │
│  │ 80%      │  │ 60%      │  │ 85%      │                                  │
│  └──────────┘  └──────────┘  └──────────┘                                │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  🔍 Key Finding                                                       │  │
│  │  Target operates under 3 verified aliases across 2 platforms          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Type your message or command...                                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Role-Based Onboarding

Based on user's selected role (Solo Operator, Team Lead, Executive, Developer):

**For Solo Operator:**
- Quick actions: Intel 🔍, Security ⚔️
- Suggested workflows based on common use cases
- Minimal setup, immediate action

**For Team Lead:**
- Team overview
- Collaboration features
- Template access

### 7.3 Agent Suggestion Card

Context-aware suggestion from Abdul:

```
┌───────────────────────────────────────────────────────────┐
│  💡 Abdul Recommends                                      │
│                                                           │
│  For this OSINT investigation, I suggest:                 │
│                                                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ Echo       │  │ Dossier    │  │ Resolver   │         │
│  │ Social     │  │ Threat     │  │ Domain     │         │
│  │ Media      │  │ Intel      │  │ Intel      │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│                                                           │
│  [Engage All Three]    [Customize Team]                   │
└───────────────────────────────────────────────────────────┘
```

---

## 8. Admin & Settings

**Design Team:** Sally 🎨 (UX Designer), Bastion 🏰 (Security Architect), John 📋 (Product Manager)

### 8.1 Settings Architecture Philosophy

> "The admin interface should feel like the cockpit, not the engine room."

**Core Principles:**
- **Contextual Settings** - Settings appear where they're relevant
- **Progressive Disclosure** - 80% of users only need 20% of settings
- **Role-Based Access** - Different views for different permission levels
- **Security-First Defaults** - Secure by default, configurable when needed

### 8.2 Settings Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  PUBLIC                                                     │
│  ├── Landing page, docs, community                          │
├─────────────────────────────────────────────────────────────┤
│  AUTHENTICATED (Basic Auth)                                 │
│  ├── User profile                                          │
│  ├── Personal API keys                                     │
│  ├── Notification preferences                              │
│  ├── LLM provider selection                                │
├─────────────────────────────────────────────────────────────┤
│  TEAM/ORG (Role-Based Access)                              │
│  ├── Team management                                       │
│  ├── Member invites/roles                                  │
│  ├── Team templates                                        │
├─────────────────────────────────────────────────────────────┤
│  ADMIN (Administrative Role)                               │
│  ├── SSO/MFA configuration                                 │
│  ├── Security policies                                     │
│  ├── Audit logs                                            │
│  ├── Compliance settings                                   │
├─────────────────────────────────────────────────────────────┤
│  SYSTEM (Infrastructure/DevOps Only)                        │
│  ├── Database migration/backup                             │
│  ├── System health monitoring                              │
│  ├── CLI bridge configuration                              │
│  └── Emergency controls                                    │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Settings Priority Matrix

| Priority | Settings | Who | Frequency | Access Pattern |
|----------|----------|-----|-----------|-----------------|
| **P0** | Profile, API keys, notifications | All | Setup + occasional | Modal/Drawer |
| **P0** | Team user management | Team/Enterprise | Weekly | Separate page |
| **P1** | SSO/MFA | Enterprise | Setup | Multi-step wizard |
| **P1** | Templates/workflows | Team/Enterprise | Monthly | Separate page |
| **P2** | Audit logs | Enterprise | Quarterly (compliance) | Separate page |
| **P2** | System config | Dev/ops only | Rarely | Separate interface |

### 8.4 Settings Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BMAD  │  Settings                                    │  ●●● J  │  ⚙️    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┬──────────────────┬──────────────────────────────┐     │
│  │  PROFILE         │  NOTIFICATIONS   │  API KEYS                    │     │
│  │                  │                  │                              │     │
│  │  [Avatar]        │  ☑ Missions      │  OpenAI:         ••••••••••  │     │
│  │  J               │  ☑ Team activity │  Anthropic:      Add key     │     │
│  │  j@example.com   │  ☐ Weekly digest │  Local Ollama:   Connected   │     │
│  │                  │  ☐ Security      │                              │     │
│  │  [Edit Profile]  │                  │  [+ Add Provider]            │     │
│  └──────────────────┴──────────────────┴──────────────────────────────┘     │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  🔒 SECURITY STATUS                          [View Details]           │  │
│  │                                                                       │  │
│  │  Overall: GOOD                                                       │  │
│  │  • MFA: Enabled (✓)                                                  │  │
│  │  • SSO: Not configured (⚠) - Recommended for teams                   │  │
│  │  • Audit log: Active (✓)                                             │  │
│  │  • Data: Local storage (✓)                                           │  │
│  │  • API keys: 2 configured (✓)                                        │  │
│  │                                                                       │  │
│  │  [Enable SSO]              [Run Security Checkup]                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  TEAM                                  [Role: Admin]     [View All]  │  │
│  │                                                                       │  │
│  │  Active Members (4)                    Pending Invites (1)            │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                        │  │
│  │  │ J      │ │ Alice  │ │ Bob    │ │ Carol  │   [+ Invite]            │  │
│  │  │ Admin  │ │ Editor │ │ Viewer │ │ Editor │                        │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  📊 USAGE (This Month)                                                │  │
│  │                                                                       │  │
│  │  Missions: 23    Workflows: 156    Agents used: 12/80                │  │
│  │  Active users: 4/10                                                   │  │
│  │                                                                       │  │
│  │                                    [View Analytics]                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  TEMPLATES & WORKFLOWS                                                │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐   │  │
│  │  │ OSINT Investigation         │  │ Security Assessment         │   │  │
│  │  │ Used 23 times • Last: 2d ago│  │ Used 12 times • Last: 5d ago│   │  │
│  │  └─────────────────────────────┘  └─────────────────────────────┘   │  │
│  │                                                                       │  │
│  │                                    [+ Create Template]              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  ADMIN CONSOLE                                                         │  │
│  │                                                                       │  │
│  │  [SSO Configuration]  [Security Policies]  [Audit Logs]  [Compliance]│  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.5 Security Requirements

**Non-Negotiable Security Controls:**

| Control | Requirement | Rationale |
|---------|-------------|-----------|
| **Audit Logging** | Every admin action logged (who/when/what) | Compliance, forensics |
| **Role Separation** | Strict boundaries between User/Team/Admin/System | Privilege escalation prevention |
| **MFA for Admin** | SSO config, user management, policy changes require re-auth | Sensitive operation protection |
| **Emergency Access** | Break-glass procedure for locked-out systems | Business continuity |
| **Settings Validation** | Prevent misconfigurations that create vulnerabilities | Configuration security |
| **Rate Limiting** | Sensitive operations have rate limits | Attack surface reduction |

### 8.6 Progressive Onboarding Flow

Settings appear when the user feels the pain of not having them:

| Step | Context | Setting Prompted |
|------|---------|------------------|
| **1** | Sign up | Just email/password (or SSO) |
| **2** | First mission | "Add your OpenAI API key for better results?" |
| **3** | Team invite | Quick team setup wizard |
| **4** | Enterprise upgrade | SSO/MFA configuration wizard |

### 8.7 Security Status Component

```tsx
<SecurityStatusCard>
  <StatusOverall level="good" />
  <StatusItem name="MFA" status="enabled" />
  <StatusItem name="SSO" status="warning" recommendation="Recommended for teams" />
  <StatusItem name="Audit log" status="active" />
  <StatusItem name="Data" status="local" />
  <StatusItem name="API keys" status="configured" count={2} />
  <Actions>
    <Button variant="secondary">Enable SSO</Button>
    <Button variant="primary">Run Security Checkup</Button>
  </Actions>
</SecurityStatusCard>
```

### 8.8 Team Management Component

```tsx
<TeamSection role="admin">
  <MemberList active={4} pending={1}>
    <Member name="J" role="Admin" avatar="..." />
    <Member name="Alice" role="Editor" avatar="..." />
    <Member name="Bob" role="Viewer" avatar="..." />
    <Member name="Carol" role="Editor" avatar="..." />
  </MemberList>
  <InviteButton />
  <ViewAllLink />
</TeamSection>
```

**Role Definitions:**

| Role | Permissions |
|------|-------------|
| **Viewer** | View missions, read-only access to team resources |
| **Editor** | Create/edit missions, use team templates |
| **Admin** | Manage members, create templates, view audit logs |
| **Owner** | Billing, SSO configuration, can transfer ownership |

### 8.9 API Keys Management

**Security Best Practices:**
- Keys displayed masked (`••••••••••`)
- Show full key only with explicit reveal + confirmation
- Connection status indicator (active/inactive)
- Last used timestamp
- Revoke capability with confirmation
- Scoping (read/write/admin) where applicable

```tsx
<ApiKeySection>
  <ProviderKeys>
    <ApiKeyProvider name="OpenAI" status="connected" lastUsed="2 hours ago" masked="••••••••••" />
    <ApiKeyProvider name="Anthropic" status="not configured" action="Add key" />
    <ApiKeyProvider name="Local Ollama" status="connected" />
  </ProviderKeys>
  <AddProviderButton />
</ApiKeySection>
```

### 8.10 System Config (DevOps Only)

Separate interface, authenticated separately:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  SYSTEM CONFIGURATION                                   │
│     Requires infrastructure authentication                   │
│                                                             │
│  [Authenticate with Infrastructure Credentials]             │
│                                                             │
│  Areas:                                                     │
│  • Database migration/backup                                │
│  • System health monitoring                                 │
│  • CLI bridge configuration                                 │
│  • Emergency controls                                       │
│  • Log retention policies                                   │
└─────────────────────────────────────────────────────────────┘
```

### 8.11 Settings Component Specifications

**Quick Settings (Drawer/Modal):**
```tsx
<QuickSettingsDrawer>
  <Section title="Profile">
    <AvatarUpload />
    <NameInput />
    <EmailInput readonly />
  </Section>
  <Section title="Notifications">
    <Checkbox label="Mission updates" />
    <Checkbox label="Team activity" />
    <Checkbox label="Weekly digest" />
    <Checkbox label="Security alerts" />
  </Section>
  <Section title="Appearance">
    <Select label="Theme" options={["Dark", "Light"]} />
    <Select label="Language" options={["English", "French", ...]} />
  </Section>
</QuickSettingsDrawer>
```

**Team Hub (Full Page):**
```tsx
<TeamHubPage>
  <TeamOverview />
  <MemberManagement />
  <TemplateLibrary />
  <TeamActivityLog />
</TeamHubPage>
```

**Admin Console (Full Page + Multi-Step):**
```tsx
<AdminConsole>
  <SSOConfiguration wizard />
  <SecurityPolicies />
  <AuditLogViewer />
  <ComplianceReports />
</AdminConsole>
```

---

## 9. Install Wizard

**Design Team:** Sally 🎨 (UX Designer), Bastion 🏰 (Security Architect), Barry 🚀 (Quick Flow Solo Dev)

### 9.1 Install Wizard Philosophy

> "The install wizard is the first impression - it sets expectations for everything that follows."

**Core Principles:**
- **Progressive Disclosure** - Start simple, reveal complexity only when needed
- **Smart Defaults** - Secure by default, configurable when needed
- **Transparent Progress** - Show what's happening, don't leave users wondering
- **Graceful Degradation** - If Web UI fails, CLI still works

### 9.2 Installation Flow Diagram

```
START
  │
  ├─→ System Detection (auto-run)
  │     ├─ Node.js installed? (for Web UI)
  │     ├─ Port availability check
  │     ├─ Disk space verification
  │     └─ Permission check
  │
  ├─→ Present Options (filtered by capabilities)
  │     ├─ CLI Only (always available)
  │     └─ CLI + Web UI (if deps met)
  │
  ├─→ User Selection
  │     │
  │     ├─ CLI Only → Skip to LLM setup
  │     └─ CLI + Web UI → Web UI configuration
  │
  ├─→ Configuration
  │     ├─ Port selection
  │     ├─ Access scope (localhost/network)
  │     └─ Auto-start preference
  │
  ├─→ LLM Provider Setup
  │     ├─ Provider selection
  │     ├─ API key input (optional for local)
  │     └─ Connection test
  │
  ├─→ Installation
  │     ├─ Download/verify dependencies
  │     ├─ Install CLI core
  │     ├─ Install Web UI (if selected)
  │     └─ Configure security
  │
  ├─→ First Run Setup
  │     ├─ Create admin account
  │     ├─ Role-based onboarding (optional)
  │     └─ Launch interface
  │
  └─→ COMPLETE
```

### 9.3 Step 1: Installation Type

```
┌─────────────────────────────────────────────────────────────────┐
│  Installation Type                                Step 1 of 5   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  How will you use BMAD?                                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ◉ CLI Only                                             │    │
│  │                                                         │    │
│  │  Command-line interface. Lightweight, powerful.         │    │
│  │  Best for: Developers, automation, servers              │    │
│  │                                                         │    │
│  │  Dependencies: None (uses system Python/Node)           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ○ CLI + Web UI                                        │    │
│  │                                                         │    │
│  │  Full web interface with browser-based access.          │    │
│  │  Best for: Visual workflow management, teams            │    │
│  │                                                         │    │
│  │  Requires: Node.js 18+, additional packages            │    │
│  │  ⚠️  Node.js not detected - will be installed          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [Help me decide]                                              │
│                                                                 │
│  [Back]                                        [Continue →]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.4 Step 2: Web UI Configuration (if selected)

```
┌─────────────────────────────────────────────────────────────────┐
│  Web UI Configuration                            Step 2 of 5   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Configure how you'll access the Web UI.                        │
│                                                                 │
│  Port                                                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ◉ Default (42001)                                      │    │
│  │  ○ Random port (recommended for security)               │    │
│  │  ○ Custom: [_____________]                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Network Access                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ◉ Localhost only (recommended)                         │    │
│  │     Accessible only from this machine                   │    │
│  │                                                         │    │
│  │  ○ Network accessible                                   │    │
│  │     Accessible from your local network                  │    │
│  │     ⚠️  Requires additional security setup               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Start on Boot                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ○ Yes  ◉ No                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [Back]                                        [Continue →]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.5 Step 3: LLM Provider Setup

```
┌─────────────────────────────────────────────────────────────────┐
│  LLM Provider Setup                                Step 3 of 5   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Choose your AI provider. You can change this later.            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Provider: [OpenAI ▼]                                   │    │
│  │                                                         │    │
│  │  Options:                                               │    │
│  │  • OpenAI (GPT-4, GPT-4o)                              │    │
│  │  • Anthropic (Claude Opus, Claude Sonnet)              │    │
│  │  • Ollama (local, free, runs on your machine)          │    │
│  │  • LM Studio (local, configurable)                     │    │
│  │  • Custom endpoint                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  API Key (optional for Ollama/LM Studio)                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [•••••••••••••••••••••••••]                            │    │
│  │                                                         │    │
│  │  🔑 Your key is stored locally and never sent to        │    │
│  │     Black Unicorn servers.                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [Test Connection]  ✓ Working                                    │
│                                                                 │
│  [Back]                                        [Continue →]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.6 Step 4: First Run Setup

```
┌─────────────────────────────────────────────────────────────────┐
│  Create Your Account                              Step 4 of 5   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Set up your admin account for the Web UI.                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Username                                               │    │
│  │  ┌─────────────────────────────────────────────────────┐│    │
│  │  │ [admin]                                            ││    │
│  │  └─────────────────────────────────────────────────────┘│    │
│  │                                                         │    │
│  │  Password                                               │    │
│  │  ┌─────────────────────────────────────────────────────┐│    │
│  │  │ [•••••••••••••••••]                                  ││    │
│  │  └─────────────────────────────────────────────────────┘│    │
│  │                                                         │    │
│  │  Confirm Password                                       │    │
│  │  ┌─────────────────────────────────────────────────────┐│    │
│  │  │ [•••••••••••••••••]                                  ││    │
│  │  └─────────────────────────────────────────────────────┘│    │
│  │                                                         │    │
│  │  Strength: ████████░░  Strong                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Optional: Tell us about your primary use case          │    │
│  │                                                         │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │    │
│  │  │ Personal │  │ Team     │  │ Enterprise│              │    │
│  │  │ Projects │  │ Collab   │  │ Operations│              │    │
│  │  └──────────┘  └──────────┘  └──────────┘              │    │
│  │  [Skip this step]                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [Back]                                        [Continue →]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.7 Step 5: Installation Progress

```
┌─────────────────────────────────────────────────────────────────┐
│  Installing BMAD                                   Step 5 of 5   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Please wait while BMAD is being installed...                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ✓ Verifying system dependencies                        │    │
│  │  ✓ Downloading BMAD core                                │    │
│  │  ✓ Installing CLI components                            │    │
│  │  → Installing Web UI packages... (45%)                  │    │
│  │  ⏳ Configuring security settings                       │    │
│  │  ⏳ Generating encryption keys                          │    │
│  │  ⏳ Starting services                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Installation Log:                                      │    │
│  │  + Downloaded package @bmad/cli@4.7.1                   │    │
│  │  + Extracted to /usr/local/lib/bmad                     │    │
│  │  + Installed bmad command to /usr/local/bin            │    │
│  │  + Downloading @bmad/web-ui@1.0.0...                   │    │
│  │  + Installing npm dependencies...                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [View Detailed Log]                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.8 Completion Screen

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ✓ BMAD installed successfully!                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  🔒 Security configured with safe defaults               │    │
│  │                                                         │    │
│  │  • Web UI bound to localhost only                       │    │
│  │  • Auto-generated encryption keys                       │    │
│  │  • Audit logging enabled                                │    │
│  │  • Admin account created                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  🔐 Connection Information                               │    │
│  │                                                         │    │
│  │  Web UI:     http://localhost:42001                      │    │
│  │  API:        http://localhost:42001/api                  │    │
│  │  Config:     ~/.bmad/config.yaml                        │    │
│  │                                                         │    │
│  │  [Copy to clipboard]                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Quick Start Commands                                   │    │
│  │                                                         │    │
│  │  $ bmad              # Start CLI                        │    │
│  │  $ bmad serve        # Start Web UI                     │    │
│  │  $ bmad configure    # Reconfigure settings             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [Launch Web UI 🚀]    [Open Documentation 📚]    [Exit]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.9 Security Requirements

**Pre-Install Security Checks:**

| Check | Purpose | Action |
|-------|---------|--------|
| **Signature Verification** | Verify installer integrity | Fail if signature invalid |
| **Checksum Validation** | Confirm download integrity | Warn, offer retry |
| **Privilege Detection** | Prevent running as root | Warn, require confirmation |
| **Disk Space** | Ensure room for installation | Require 500MB free |
| **Network Access** | Check for dependency downloads | Fail if offline + deps missing |

**First-Run Security Defaults:**

| Setting | Default | Rationale |
|---------|---------|-----------|
| **Web UI Bind** | 127.0.0.1 (localhost only) | No accidental exposure |
| **JWT Secret** | Auto-generated, 256-bit | Prevent default keys |
| **Session Timeout** | 24 hours | Balance security vs usability |
| **Audit Logging** | Enabled from day one | Compliance, forensics |
| **Password Requirements** | 12+ chars, mixed types | Strong admin credentials |
| **Rate Limiting** | 100 req/min per IP | Prevent abuse |

### 9.10 Network Access Warning

If user selects "Network accessible":

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  Security Warning                                       │
│                                                             │
│  You've chosen to make BMAD accessible from your network.   │
│                                                             │
│  This is recommended ONLY for:                              │
│  • Trusted private networks                                 │
│  • Behind a firewall                                        │
│  • With proper authentication enabled                       │
│                                                             │
│  For public internet access, we strongly recommend:         │
│  • Reverse proxy (nginx/caddy) with SSL/TLS                │
│  • SSO/MFA authentication                                   │
│  • Rate limiting and IP whitelisting                        │
│  • Regular security updates                                 │
│                                                             │
│  [I understand the risks]    [Change to Localhost only]     │
└─────────────────────────────────────────────────────────────┘
```

### 9.11 CLI Installation Options

**One-line install (smart defaults):**
```bash
curl -sSL https://install.bmad.security | sh
```

**With flags for specific options:**
```bash
# Web UI included
curl -sSL https://install.bmad.security | sh -s -- --with-webui

# Custom port
curl -sSL https://install.bmad.security | sh -s -- --with-webui --port 8080

# Local LLM only (no API keys needed)
curl -sSL https://install.bmad.security | sh -s -- --llm ollama

# Unattended mode (accept all defaults)
curl -sSL https://install.bmad.security | sh -s -- --yes --with-webui
```

**Post-install reconfiguration:**
```bash
bmad configure --wizard
# Launches the wizard for changing settings post-install

bmad configure --webui-port 42001
# Direct configuration without wizard
```

### 9.12 Install Wizard Component Specifications

```tsx
<InstallWizard>
  <WelcomeStep />
  <SystemCheckStep />
  <InstallationTypeStep
    options={["cli-only", "cli-webui"]}
    systemCapabilities={detectCapabilities()}
  />
  <WebUIConfigurationStep
    portOptions={["default", "random", "custom"]}
    accessOptions={["localhost", "network"]}
  />
  <LLMProviderStep
    providers={["openai", "anthropic", "ollama", "lm-studio", "custom"]}
    testConnection={true}
  />
  <FirstRunSetupStep
    createAdminAccount={true}
    roleOnboarding={true}
  />
  <InstallationProgressStep
    showLogs={true}
    onCancel={rollback}
  />
  <CompletionStep
    showConnectionInfo={true}
    showQuickStart={true}
  />
</InstallWizard>
```

### 9.13 Role-Based Quick Setup

During first run, offer optimized configurations:

```
┌─────────────────────────────────────────────────────────────┐
│  How do you plan to use BMAD?                                │
│                                                             │
│  ┌────────────┐                                             │
│  │ Personal   │                                             │
│  │ Projects   │    Quick Setup: CLI + Local Web UI         │
│  │            │    • Ollama (local, free)                  │
│  │            │    • Localhost only                        │
│  │            │    • Minimal dependencies                  │
│  └────────────┘                                             │
│                                                             │
│  ┌────────────┐                                             │
│  │ Team       │    Quick Setup: Web UI + Collaboration     │
│  │ Collab     │    • Team user management                  │
│  │            │    • Shared templates                      │
│  │            │    • Network accessible (optional)          │
│  └────────────┘                                             │
│                                                             │
│  ┌────────────┐                                             │
│  │ Enterprise │    Quick Setup: Full Enterprise            │
│  │ Operations │    • SSO/MFA ready                         │
│  │            │    • Audit logs enabled                    │
│  │            │    • Compliance features                   │
│  └────────────┘                                             │
│                                                             │
│  Or: [Custom Configuration]                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Anti-Patterns

### 10.1 What to Avoid

| Anti-Pattern | Why | Alternative |
|--------------|-----|-------------|
| Sidebar with 80+ agents | Overwhelming, decision paralysis | Contextual suggestions from Abdul |
| Workflow picker as entry | Feels like a tool catalog | Role-based progressive disclosure |
| Bright primary colors everywhere | Loses sophistication impact | Strategic accent use |
| Chat-only interface | "Typical AI" feeling | Mission dashboard with orchestration |
| Dense information displays | Cognitive overload | Layered disclosure |
| Excessive animations | Feels "game-y" or toy-like | Subtle, functional motion |

### 8.2 Design Review Checklist

Before implementing any screen:

- [ ] Does this feel like a "command center" or a "chat app"?
- [ ] Is purple used strategically (<15% of UI)?
- [ ] Is information hierarchy visually clear?
- [ ] Would this screen make sense without a tutorial?
- [ ] Is Abdul's role in orchestrating visible?
- [ ] Are animations subtle (felt, not seen)?
- [ ] Does it meet the "modern, classy, not overloaded" criteria?

---

## Appendix A: CSS Variables Reference

```css
:root {
  /* Backgrounds */
  --background-base: #0a0a0a;
  --background-elevated: #111111;
  --background-hover: #1a1a1a;

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-default: rgba(255, 255, 255, 0.12);
  --border-strong: rgba(255, 255, 255, 0.20);

  /* Accents */
  --accent-primary: #8B5CF6;
  --accent-secondary: #00D9FF;
  --accent-success: #22c55e;
  --accent-warning: #f97316;
  --accent-error: #ef4444;

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.70);
  --text-tertiary: rgba(255, 255, 255, 0.50);
  --text-muted: rgba(255, 255, 255, 0.30);

  /* Typography */
  --font-heading: 'Orbitron', ui-sans-serif, system-ui, sans-serif;
  --font-body: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;

  /* Spacing */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */

  /* Animation */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

---

## Appendix B: Tailwind Config Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: {
          base: '#0a0a0a',
          elevated: '#111111',
          hover: '#1a1a1a',
        },
        accent: {
          primary: '#8B5CF6',
          secondary: '#00D9FF',
          success: '#22c55e',
          warning: '#f97316',
          error: '#ef4444',
        },
      },
      fontFamily: {
        heading: ['Orbitron', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
}
```

---

**Document Status:** ✅ Complete
**Next Phase:** Component Implementation Planning

*Prepared by the BMAD Strategy & Design Team*
*Sun 🐉 | Sally 🎨 | Giuseppe 📢*
