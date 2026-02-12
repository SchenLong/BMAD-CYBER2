# BMM (Business Management Module) Workflow Examples

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Module:** bmm
> **Agents:** 9 product development professionals

---

## Overview

The BMM module provides comprehensive product development workflows from initial concept through implementation. This guide walks through the complete product development lifecycle with practical examples.

### Development Phases

| Phase | Focus | Key Workflows |
|-------|-------|---------------|
| **Phase 1** | Analysis | `create-product-brief`, `research` |
| **Phase 2** | Planning | `create-prd`, `create-ux-design` |
| **Phase 3** | Solutioning | `create-architecture`, `create-epics-and-stories` |
| **Phase 4** | Implementation | `dev-story`, `code-review`, `sprint-planning` |

### The BMM Team

| Agent | Role | Specialization |
|-------|------|----------------|
| John | Product Manager | Requirements, user interviews |
| Winston | System Architect | Technical design, patterns |
| Amelia | Developer | Implementation, TDD |
| Mary | Business Analyst | Market research, requirements |
| Bob | Scrum Master | Agile ceremonies, facilitation |
| Murat | Test Architect | Test automation, quality |
| Paige | Technical Writer | Documentation, API specs |
| Sally | UX Designer | User research, interaction design |
| Barry | Quick Flow Solo Dev | Rapid development |

---

## Example 1: Create Product Brief

### Scenario

Starting a new project to build a customer feedback widget for SaaS products.

### Invocation

```
/bmad:bmm:workflows:create-product-brief
```

### Workflow Steps

**Step 1: Discovery**

```
Mary (Business Analyst) facilitates:

"Let's start with the basics. What problem are we solving?"

User Input: "SaaS companies struggle to collect in-context feedback
from users. Current solutions are intrusive (popups) or disconnected
(email surveys). We want a lightweight, embedded widget."

Mary: "Who is the target user?"

User Input: "Product managers at B2B SaaS companies, 50-500 employees.
They want quick feedback without engineering heavy-lifting."
```

**Step 2: Market Context**

```
Mary researches:

Competitive Landscape:
├── Hotjar: Feature-rich but expensive, complex setup
├── Intercom: Focused on chat, feedback is secondary
├── Typeform: Great UX but not embedded
├── UserVoice: Enterprise-focused, heavyweight
│
Market Gap Identified:
├── Lightweight embeddable widget
├── Developer-friendly (1 line of code)
├── Product-manager controlled (no-code config)
└── Affordable for SMB ($50-200/month)
```

**Step 3: Value Proposition**

```
Mary synthesizes:

Problem Statement:
"Product teams at SMB SaaS companies need a way to collect
contextual user feedback without complex integration or
high costs, so they can make data-driven product decisions
faster."

Proposed Solution:
"An embeddable feedback widget that installs in one line
of code, configurable by non-technical users, with smart
targeting and analytics."

Success Metrics:
├── Installation: <5 minutes to first feedback
├── Response rate: >5% (vs industry 1-2%)
├── NPS impact: Measurable improvement in 90 days
```

### Sample Output: Product Brief

```markdown
# PRODUCT BRIEF

## Project: FeedbackFlow Widget
## Date: 2026-01-16
## Status: Draft

---

## PROBLEM STATEMENT

Product teams at SMB SaaS companies (50-500 employees) need a way
to collect contextual user feedback without complex integration
or enterprise pricing, so they can make data-driven product
decisions faster than competitors.

---

## TARGET USERS

### Primary: Product Managers
- **Demographics**: 28-45, B2B SaaS, tech-savvy but not engineers
- **Goals**: Understand user needs, prioritize roadmap, reduce churn
- **Pain Points**: Low survey response rates, disconnected feedback,
  requires engineering help for changes

### Secondary: Developers
- **Goals**: Minimal integration effort, clean SDK
- **Pain Points**: Complex integrations, maintenance burden

---

## COMPETITIVE ANALYSIS

| Competitor | Strength | Weakness | Price |
|------------|----------|----------|-------|
| Hotjar | Full suite | Complex, expensive | $300+/mo |
| Intercom | Chat + feedback | Overkill for feedback only | $500+/mo |
| Typeform | Beautiful UX | Not embedded | $100/mo |
| UserVoice | Enterprise features | Too complex for SMB | $500+/mo |

**Our Differentiation**: Simple, embedded, affordable, PM-controlled

---

## PROPOSED SOLUTION

### Core Features (MVP)
1. **One-line embed**: Single script tag installation
2. **No-code configurator**: PM can customize without engineering
3. **Smart targeting**: Show to right users at right time
4. **Feedback dashboard**: Aggregate, analyze, export

### Future Features (V2+)
- AI-powered sentiment analysis
- Slack/Jira integrations
- Multi-language support
- Custom branding

---

## SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to install | <5 minutes | Onboarding analytics |
| Response rate | >5% | Compared to email surveys |
| Customer NPS | >50 | Quarterly survey |
| MRR | $50K by M6 | Revenue tracking |

---

## RISKS & ASSUMPTIONS

### Assumptions
- PMs have authority to add scripts to product
- One-line install is technically feasible for most frameworks
- $99/month price point is acceptable for SMB

### Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Complex frameworks block easy install | Medium | High | Provide framework-specific guides |
| Enterprise buyers need more features | Medium | Medium | Enterprise tier roadmap |
| Crowded market | High | Medium | Focus on simplicity differentiation |

---

## NEXT STEPS

1. [ ] Validate with 5 potential customers (PM interviews)
2. [ ] Technical feasibility assessment (Winston)
3. [ ] Create PRD (if validated)

---

*Prepared by: Mary (Business Analyst)*
*Reviewed by: John (Product Manager)*
```

---

## Example 2: Create PRD (Product Requirements Document)

### Scenario

Following a validated product brief, create detailed requirements for the feedback widget.

### Invocation

```
/bmad:bmm:workflows:create-prd
```

### Workflow Steps (11 Steps)

**Step 1: Initialization**

```
John (Product Manager) begins:

"Let's transform the product brief into detailed requirements.
I'll guide you through each section."
```

**Step 2: Discovery Recap**

```
John confirms:

Problem: Collect in-context feedback easily
Users: Product managers, developers
Validation: 5 customer interviews completed
Green light: Proceed with MVP definition
```

**Step 3: Success Criteria**

```
John defines measurable outcomes:

Business Outcomes:
├── 100 paying customers in 6 months
├── <5% monthly churn
├── $50K MRR by month 6
│
User Outcomes:
├── Installation: <5 minutes
├── First feedback collected: <24 hours
├── Dashboard time: <2 minutes to key insight
│
Technical Outcomes:
├── Widget load time: <100ms
├── Bundle size: <20KB gzipped
├── Uptime: 99.9%
```

**Step 4: User Journeys**

```
John maps critical journeys:

Journey 1: First Install
1. PM signs up → onboarding wizard
2. Copy script tag → paste in app
3. Configure first widget → no-code editor
4. Preview in sandbox → verify appearance
5. Publish → widget live

Journey 2: Viewing Feedback
1. PM logs in → dashboard
2. Views recent feedback → timeline
3. Filters by page/segment → analysis
4. Exports data → CSV/API

Journey 3: User Gives Feedback
1. User sees widget → triggered by rule
2. Clicks to open → minimal friction
3. Types feedback → text area
4. Submits → confirmation
5. Optional: rates experience → emoji scale
```

**Step 5-10: Detailed Requirements**

```
John documents functional requirements:

┌─────────────────────────────────────────────────────────────────────┐
│ FUNCTIONAL REQUIREMENTS                                             │
├─────────────────────────────────────────────────────────────────────┤
│ FR-001: Widget Embed                                                │
│ ├── One-line script tag installation                               │
│ ├── Async loading (non-blocking)                                   │
│ ├── Framework-agnostic (React, Vue, Angular, vanilla)             │
│ └── Shadow DOM isolation (no style conflicts)                      │
├─────────────────────────────────────────────────────────────────────┤
│ FR-002: No-Code Configurator                                        │
│ ├── Widget appearance (colors, position, size)                     │
│ ├── Trigger rules (page URL, time on page, scroll depth)          │
│ ├── Question customization (text, type)                            │
│ └── Preview before publish                                          │
├─────────────────────────────────────────────────────────────────────┤
│ FR-003: Feedback Collection                                         │
│ ├── Text feedback (required)                                        │
│ ├── Emoji rating (optional)                                         │
│ ├── Screenshot capture (optional)                                   │
│ └── User metadata capture (configurable)                           │
├─────────────────────────────────────────────────────────────────────┤
│ FR-004: Dashboard                                                   │
│ ├── Feedback timeline (newest first)                               │
│ ├── Filtering (date, page, rating, search)                         │
│ ├── Aggregations (feedback by page, by rating)                     │
│ └── Export (CSV, JSON, webhook)                                     │
├─────────────────────────────────────────────────────────────────────┤
│ FR-005: Authentication                                              │
│ ├── Email/password signup                                           │
│ ├── Google OAuth                                                    │
│ ├── Team invitations                                                │
│ └── Role-based access (admin, viewer)                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ NON-FUNCTIONAL REQUIREMENTS                                         │
├─────────────────────────────────────────────────────────────────────┤
│ NFR-001: Performance                                                │
│ ├── Widget load: <100ms                                             │
│ ├── Bundle size: <20KB gzipped                                      │
│ ├── Dashboard load: <2s                                             │
│ └── API response: <200ms p95                                        │
├─────────────────────────────────────────────────────────────────────┤
│ NFR-002: Scalability                                                │
│ ├── Support 1M widget loads/day                                     │
│ ├── Support 100K feedback submissions/day                          │
│ └── Support 1000 concurrent dashboard users                        │
├─────────────────────────────────────────────────────────────────────┤
│ NFR-003: Security                                                   │
│ ├── HTTPS only                                                      │
│ ├── GDPR compliant                                                  │
│ ├── Data encryption at rest                                         │
│ └── SOC 2 Type II (future)                                         │
├─────────────────────────────────────────────────────────────────────┤
│ NFR-004: Availability                                               │
│ ├── 99.9% uptime SLA                                                │
│ ├── Multi-region deployment                                         │
│ └── Graceful degradation if service unavailable                    │
└─────────────────────────────────────────────────────────────────────┘
```

**Step 11: Completion**

```
John finalizes:

PRD Status: Complete
Ready for: Architecture review
Next step: create-architecture workflow
```

### Sample Output: PRD Excerpt

```markdown
# PRODUCT REQUIREMENTS DOCUMENT

## Product: FeedbackFlow Widget
## Version: 1.0 (MVP)
## Date: 2026-01-16

---

## DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-01-10 | John | Initial draft |
| 1.0 | 2026-01-16 | John | MVP complete |

---

## EXECUTIVE SUMMARY

FeedbackFlow is an embeddable feedback widget for B2B SaaS products.
MVP enables product managers to collect contextual user feedback
with one-line installation and no-code configuration.

---

## GOALS & SUCCESS METRICS

### Business Goals
| Goal | Metric | Target |
|------|--------|--------|
| Market validation | Paying customers | 100 in 6 months |
| Revenue | MRR | $50K by month 6 |
| Retention | Monthly churn | <5% |

### User Goals
| Goal | Metric | Target |
|------|--------|--------|
| Easy setup | Time to install | <5 minutes |
| Quick value | First feedback | <24 hours |
| Actionable insights | Dashboard efficiency | <2 min to insight |

---

## USER STORIES

### Epic 1: Widget Installation
| ID | Story | Priority | Points |
|----|-------|----------|--------|
| US-001 | As a developer, I can install the widget with one script tag | Must | 5 |
| US-002 | As a developer, I can verify the widget loads correctly | Must | 3 |
| US-003 | As a PM, I can see installation instructions in onboarding | Must | 2 |

### Epic 2: Widget Configuration
| ID | Story | Priority | Points |
|----|-------|----------|--------|
| US-010 | As a PM, I can customize widget colors | Must | 3 |
| US-011 | As a PM, I can set trigger rules | Must | 5 |
| US-012 | As a PM, I can preview changes before publish | Should | 3 |

[Continue with all epics and stories...]

---

## WIREFRAMES

[Reference to Sally's UX designs]

---

## API SPECIFICATIONS

[Reference to Paige's API documentation]

---

## APPENDICES

- A: User Interview Summaries
- B: Competitive Analysis Details
- C: Technical Feasibility Notes

---

*Owner: John (Product Manager)*
*Status: Approved*
```

---

## Example 3: Create Architecture

### Scenario

Design the technical architecture for the feedback widget MVP.

### Invocation

```
/bmad:bmm:workflows:create-architecture
```

### Workflow Steps

**Step 1: Requirements Review**

```
Winston (Architect) reviews PRD:

Key Technical Challenges:
├── Widget must be tiny (<20KB) and fast (<100ms load)
├── Must work across all frameworks without conflicts
├── Must scale to 1M loads/day
├── Must be GDPR compliant
```

**Step 2: Architecture Decisions**

```
Winston proposes:

Decision 1: Widget Technology
├── Option A: Vanilla JS + Shadow DOM
│   ├── Pro: Smallest bundle, no dependencies
│   ├── Pro: Framework agnostic
│   └── Con: More manual work
├── Option B: Preact + Shadow DOM
│   ├── Pro: React-like DX for team
│   ├── Pro: Still very small (~3KB)
│   └── Con: Slight overhead
├── DECISION: Option A (Vanilla JS)
│   └── Rationale: Bundle size is critical differentiator

Decision 2: Backend Stack
├── Option A: Node.js + PostgreSQL
├── Option B: Go + PostgreSQL
├── Option C: Serverless (Lambda + DynamoDB)
├── DECISION: Option A (Node.js)
│   └── Rationale: Team expertise, faster iteration

Decision 3: Infrastructure
├── Vercel for frontend/dashboard
├── AWS for API (ECS Fargate)
├── CloudFront CDN for widget delivery
├── PostgreSQL on RDS
├── Redis for rate limiting/caching
```

**Step 3: System Design**

```
Winston documents:

┌─────────────────────────────────────────────────────────────────────┐
│                         SYSTEM ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│    ┌─────────────┐        ┌─────────────┐                          │
│    │  Customer   │        │   PM User   │                          │
│    │    App      │        │  Dashboard  │                          │
│    └──────┬──────┘        └──────┬──────┘                          │
│           │                      │                                  │
│           ▼                      ▼                                  │
│    ┌─────────────┐        ┌─────────────┐                          │
│    │  CloudFront │        │   Vercel    │                          │
│    │    (CDN)    │        │  (Frontend) │                          │
│    └──────┬──────┘        └──────┬──────┘                          │
│           │                      │                                  │
│           │         ┌────────────┘                                  │
│           │         │                                               │
│           ▼         ▼                                               │
│    ┌─────────────────────┐                                         │
│    │    API Gateway      │                                         │
│    │   (Rate Limiting)   │                                         │
│    └──────────┬──────────┘                                         │
│               │                                                     │
│               ▼                                                     │
│    ┌─────────────────────┐      ┌─────────────┐                    │
│    │   API Service       │◄────►│    Redis    │                    │
│    │   (Node.js/ECS)     │      │   (Cache)   │                    │
│    └──────────┬──────────┘      └─────────────┘                    │
│               │                                                     │
│               ▼                                                     │
│    ┌─────────────────────┐                                         │
│    │    PostgreSQL       │                                         │
│    │      (RDS)          │                                         │
│    └─────────────────────┘                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Sample Output: Architecture Decision Record

```markdown
# ARCHITECTURE DECISION RECORD

## Project: FeedbackFlow
## Date: 2026-01-16

---

## ADR-001: Widget Technology

### Status: Accepted

### Context
We need to build an embeddable widget that:
- Loads in <100ms
- Is <20KB gzipped
- Works in all JS frameworks
- Doesn't conflict with host app styles

### Decision
Use vanilla JavaScript with Shadow DOM encapsulation.

### Consequences
- **Positive**: Smallest possible bundle size
- **Positive**: No framework lock-in
- **Negative**: More boilerplate code
- **Negative**: Team needs to adjust from React patterns

---

## ADR-002: API Stack

### Status: Accepted

### Context
Backend needs to handle 1M+ widget loads/day and 100K submissions.

### Decision
Node.js (Express) on AWS ECS Fargate with PostgreSQL.

### Consequences
- **Positive**: Team has Node.js expertise
- **Positive**: Easy horizontal scaling with Fargate
- **Negative**: Not as performant as Go (acceptable for our scale)

---

## COMPONENT SPECIFICATIONS

### Widget (Client-Side)
```

Technology: Vanilla JS + Shadow DOM
Build: Rollup + Terser
Size Budget: <20KB gzipped
Hosting: CloudFront CDN
Caching: Aggressive (1 year, versioned URLs)

```

### Dashboard (Frontend)
```

Technology: Next.js 14 (App Router)
Hosting: Vercel
Authentication: NextAuth.js
State: React Query

```

### API (Backend)
```

Technology: Node.js 20 + Express
Hosting: AWS ECS Fargate
Database: PostgreSQL 15 (RDS)
Cache: Redis (ElastiCache)
Queue: SQS (for async processing)

```

---

## DATA MODEL

```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects (widgets)
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  config JSONB NOT NULL,
  api_key VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feedback submissions
CREATE TABLE feedback (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  content TEXT NOT NULL,
  rating INTEGER,
  page_url TEXT,
  user_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feedback_project_created ON feedback(project_id, created_at DESC);
CREATE INDEX idx_feedback_project_rating ON feedback(project_id, rating);
```

---

## API ENDPOINTS

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/feedback | Submit feedback (widget) |
| GET | /api/v1/projects/:id/feedback | List feedback (dashboard) |
| GET | /api/v1/projects/:id/config | Get widget config |
| PUT | /api/v1/projects/:id/config | Update widget config |

---

## SECURITY CONSIDERATIONS

- All API calls over HTTPS
- Widget authenticated via project API key
- Dashboard authenticated via JWT
- Rate limiting: 100 submissions/minute per project
- GDPR: Data deletion endpoint, export endpoint

---

*Architect: Winston*
*Reviewed by: John (Product), Murat (Testing)*

```

---

## Example 4: Sprint Planning & Development

### Scenario
Execute a sprint to implement the feedback widget MVP.

### Invocation
```

/bmad:bmm:workflows:sprint-planning

```

### Workflow Steps

**Step 1: Sprint Setup**
```

Bob (Scrum Master) facilitates:

Sprint Goal: "Deliver working widget installation flow"
Duration: 2 weeks
Team Capacity: 40 story points

Selected Stories:
├── US-001: Widget script tag (5 pts) - Amelia
├── US-002: Widget verification (3 pts) - Amelia
├── US-010: Widget customization UI (5 pts) - Sally + Amelia
├── US-020: API: Submit feedback (5 pts) - Amelia
├── US-030: Dashboard: View feedback (5 pts) - Amelia
└── US-100: Test automation setup (3 pts) - Murat

Total: 26 points (65% capacity buffer for unknowns)

```

**Step 2: Story Development (dev-story workflow)**

```

/bmad:bmm:workflows:dev-story

```

```

Amelia (Developer) implements US-001:

TDD Approach:

1. RED: Write failing test
   └── "widget script loads without error"
   └── "widget renders in shadow DOM"
   └── "widget does not affect host page styles"

2. GREEN: Implement minimum code
   └── Create widget.js entry point
   └── Implement Shadow DOM mounting
   └── Add basic styling

3. REFACTOR: Clean up
   └── Extract configuration module
   └── Add error handling
   └── Optimize bundle size

```

**Step 3: Code Review**
```

/bmad:bmm:workflows:code-review

```

```

Winston reviews:

┌─────────────────────────────────────────────────────────────────────┐
│ CODE REVIEW: Widget Installation (PR #42)                           │
├─────────────────────────────────────────────────────────────────────┤
│ CRITICAL ISSUES (Must Fix)                                          │
├─────────────────────────────────────────────────────────────────────┤
│ 1. widget.js:47 - Missing error boundary                           │
│    If config fetch fails, widget throws uncaught exception.        │
│    Impact: Could break customer's site.                            │
│    Fix: Wrap in try/catch, fail silently with console warning.     │
├─────────────────────────────────────────────────────────────────────┤
│ 2. styles.css:12 - Using !important                                │
│    Shadow DOM should isolate styles, !important unnecessary.       │
│    Impact: Code smell, harder to maintain.                         │
│    Fix: Remove !important declarations.                            │
├─────────────────────────────────────────────────────────────────────┤
│ SUGGESTIONS (Consider)                                              │
├─────────────────────────────────────────────────────────────────────┤
│ 3. Consider lazy-loading icons to reduce initial bundle.           │
│ 4. Add performance marks for debugging.                            │
├─────────────────────────────────────────────────────────────────────┤
│ APPROVED: After critical issues addressed                          │
└─────────────────────────────────────────────────────────────────────┘

```

### Sample Output: Sprint Status

```markdown
# SPRINT STATUS: Sprint 1

## Sprint Goal: Widget Installation Flow
## Dates: 2026-01-06 to 2026-01-17
## Status: In Progress (Day 8 of 10)

---

## BURNDOWN

```

Points │
  30   │▓
  25   │▓▓
  20   │▓▓▓▓
  15   │▓▓▓▓▓▓
  10   │▓▓▓▓▓▓░░ ← Ideal
   5   │▓▓▓▓▓▓░░░░
   0   │▓▓▓▓▓▓░░░░
       └──────────────
        D1 D2 D3 D4 D5 D6 D7 D8 D9 D10

```

Current: 8 points remaining (on track)

---

## STORY STATUS

| ID | Story | Points | Status | Owner |
|----|-------|--------|--------|-------|
| US-001 | Widget script tag | 5 | ✅ Done | Amelia |
| US-002 | Widget verification | 3 | ✅ Done | Amelia |
| US-010 | Widget customization | 5 | 🔄 In Review | Amelia |
| US-020 | API: Submit feedback | 5 | 🔄 In Progress | Amelia |
| US-030 | Dashboard: View feedback | 5 | ⏳ Not Started | Amelia |
| US-100 | Test automation | 3 | ✅ Done | Murat |

---

## BLOCKERS

| Issue | Impact | Owner | Resolution |
|-------|--------|-------|------------|
| None currently | - | - | - |

---

## RISKS

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| US-030 may slip | Medium | Low | Can ship without, add next sprint |

---

## DEMO SCHEDULED

- **Date**: 2026-01-17 3:00 PM
- **Attendees**: Stakeholders, team
- **Demo Scope**: Widget install + feedback submission

---

*Scrum Master: Bob*
*Last Updated: 2026-01-14*
```

---

## Example 5: Quick Development Flow

### Scenario

Rapidly implement a small feature without full ceremony.

### Invocation

```
/bmad:bmm:workflows:quick-dev
```

### Workflow Steps

**Step 1: Direct Instructions**

```
User Input: "Add emoji reaction buttons to the feedback widget.
Five emoji options: 😠 😕 😐 🙂 😍
Store selection with feedback. Display in dashboard."

Barry (Quick Flow Solo Dev) responds:

"Got it. I'll implement this across widget and dashboard.
Let me break it down:

1. Widget changes:
   - Add emoji picker component
   - Style within shadow DOM
   - Include in feedback payload

2. API changes:
   - Add 'rating' field to feedback endpoint
   - Validate emoji value (1-5)

3. Dashboard changes:
   - Display emoji in feedback list
   - Add emoji filter

Let's start with the widget..."
```

**Step 2: Implementation**

```
Barry implements incrementally:

Widget Component:
```javascript
// EmojiPicker.js
const EMOJIS = ['😠', '😕', '😐', '🙂', '😍'];

class EmojiPicker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.selectedRating = null;
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .emoji-picker { display: flex; gap: 8px; }
        .emoji {
          font-size: 24px;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .emoji:hover, .emoji.selected { opacity: 1; }
      </style>
      <div class="emoji-picker">
        ${EMOJIS.map((e, i) =>
          `<span class="emoji" data-rating="${i+1}">${e}</span>`
        ).join('')}
      </div>
    `;
  }
}
```

"Widget done. Moving to API..."

```

**Step 3: Testing & Verification**
```

Barry verifies:

✅ Emoji picker renders in widget
✅ Selection persists visually
✅ API accepts rating field
✅ Dashboard displays emoji
✅ Filter by rating works

Ready for review.

```

---

## Workflow Combinations

### Full Product Lifecycle
```

1. create-product-brief (validate idea)
2. create-prd (detailed requirements)
3. create-architecture (technical design)
4. create-epics-and-stories (break down work)
5. sprint-planning (organize sprints)
6. dev-story (implement each story)
7. code-review (quality gate)
8. retrospective (learn and improve)

```

### Quick Iteration
```

1. quick-dev (implement feature)
2. code-review (quality check)
3. sprint-status (track progress)

```

### Architecture + Security
```

1. create-architecture (BMM)
2. security-architecture-review (Cybersec)
3. threat-modeling (Cybersec)

```

---

## Best Practices

1. **Start with the brief** - validate before building
2. **Architecture before code** - make decisions explicit
3. **TDD approach** - tests drive design
4. **Incremental delivery** - ship early and often
5. **Continuous review** - catch issues early

---

## See Also

- [Cybersec Workflow Examples](CYBERSEC-WORKFLOW-EXAMPLES.md) - Security integration
- [Party Mode Examples](PARTY-MODE-EXAMPLES.md) - For `product-security-launch` preset
- [Workflow Selection Guide](../WORKFLOW-SELECTION-GUIDE.md) - Decision trees
- [Workflow Chaining Guide](../WORKFLOW-CHAINING-GUIDE.md) - Combining workflows
