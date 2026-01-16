# Strategy Workflow Examples

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Module:** strategy-team
> **Agents:** 14 strategic advisors (philosophical archetypes)

---

## Overview

The Strategy Team provides multi-perspective strategic analysis through 14 philosophical archetypes, each bringing distinct worldviews to decision-making. This guide demonstrates how to leverage diverse strategic perspectives for complex organizational challenges.

### The Strategic Archetypes

| Agent | Archetype | Philosophy | Best For |
|-------|-----------|------------|----------|
| Sun | Master Strategist | Sun Tzu - winning without fighting | Competitive strategy, positioning |
| Niccolo | Realist | Machiavelli - power dynamics | Political navigation, hard choices |
| Charles | Liberator | Lincoln/De Gaulle - moral authority | Vision, transformation, unity |
| Maximilien | Revolutionary | Robespierre - systemic change | Disruption, bold moves |
| Burke | Conservative | Edmund Burke - tradition/prudence | Risk management, stability |
| Lee | Technocrat | Lee Kuan Yew - systems/efficiency | Operations, meritocracy |
| Musashi | Strategist-Warrior | Miyamoto Musashi - timing/mastery | Execution, competitive timing |
| Jean-Luc | Principled Commander | Picard - principle-centered leadership | Ethics, diplomacy, values |
| Augustus | Policy Analyst | Evidence-based analysis | Data, regulatory impact |
| Magnus | Political Strategist | Coalition building | Stakeholders, political dynamics |
| Cicero | Debate Coach | Rhetoric, argumentation | Persuasion, communication |
| Geneva | Stakeholder Mediator | Interest-based negotiation | Consensus, conflict resolution |
| Sophia | Ethics Advisor | Values and ethics | Moral dilemmas, integrity |
| Giuseppe | Communications Director | Narrative, media strategy | Messaging, crisis comms |

---

## Example 1: Strategic Decision Workshop

### Scenario
Your company must decide whether to pursue an aggressive acquisition or organic growth strategy given market conditions.

### Invocation
```
/bmad:strategy-team:workflows:strategic-decision-workshop
```

### Workflow Steps

**Step 1: Decision Framing**
```
User Input: "Market leader competitor is struggling financially.
We have $50M cash reserves. Options:
A) Acquire competitor ($40M estimated)
B) Aggressive organic growth (invest $30M in R&D/marketing)
C) Conservative approach (maintain reserves, incremental growth)

Context: 200 employees, B2B SaaS, 3-year runway at current burn."
```

**Step 2: Multi-Perspective Analysis**

Each archetype provides their view:

```
┌─────────────────────────────────────────────────────────────────────┐
│ SUN (Master Strategist):                                            │
├─────────────────────────────────────────────────────────────────────┤
│ "The supreme art of war is to subdue the enemy without fighting.   │
│ Acquiring a struggling competitor gives you their customers,        │
│ talent, and IP without the battle. However, ensure their weakness   │
│ is temporary (market conditions) not structural (bad product).      │
│                                                                     │
│ Key question: Can you integrate without destroying what you buy?    │
│                                                                     │
│ Recommendation: OPTION A (Acquisition) - but at lower valuation    │
│ given their distress. Negotiate hard; they need you more than      │
│ you need them."                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ NICCOLO (Realist):                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ "In evaluating this decision, consider not what is ideal but what  │
│ is possible. An acquisition puts you in control of the outcome.    │
│ Organic growth leaves you vulnerable to them being acquired by     │
│ someone else - potentially a larger, better-funded rival.          │
│                                                                     │
│ The real question: If you don't act, who will?                     │
│                                                                     │
│ Recommendation: OPTION A - Move decisively before others do.       │
│ Control your destiny. A distressed asset today becomes a           │
│ competitor's weapon tomorrow."                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ BURKE (Conservative):                                               │
├─────────────────────────────────────────────────────────────────────┤
│ "I counsel caution. Acquisitions destroy more value than they      │
│ create in the majority of cases. Integration is brutally hard.     │
│ You would be betting 80% of your reserves on execution risk.       │
│                                                                     │
│ What happens if integration fails? You've weakened yourself and    │
│ distracted your team for 12-18 months.                             │
│                                                                     │
│ Recommendation: OPTION C - Preserve optionality. Let the          │
│ competitor fail naturally, then hire their best people and         │
│ pursue their orphaned customers. Same outcome, less risk."         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ LEE (Technocrat):                                                   │
├─────────────────────────────────────────────────────────────────────┤
│ "The decision requires rigorous analysis, not philosophy.          │
│                                                                     │
│ Acquisition Math:                                                   │
│ - Customer LTV from acquired base: $X                              │
│ - Integration costs (typically 30% of purchase): $12M              │
│ - Talent retention (typically lose 40% in Y1): Factor in          │
│ - Synergy realization timeline: 18-24 months                       │
│                                                                     │
│ Organic Growth Math:                                                │
│ - CAC at $30M spend level: $X per customer                         │
│ - Time to market leadership: 24-36 months                          │
│ - Compound growth rate achievable: X%                              │
│                                                                     │
│ Recommendation: Run the numbers. This is a DCF problem, not a     │
│ strategy problem. I suspect OPTION B yields better risk-adjusted   │
│ returns, but I need data."                                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ MAXIMILIEN (Revolutionary):                                         │
├─────────────────────────────────────────────────────────────────────┤
│ "Both options A and B are thinking too small. The real question:   │
│ Can you use this moment to fundamentally transform the market?     │
│                                                                     │
│ Consider OPTION D: Acquire AND invest aggressively. Raise          │
│ additional capital while you can. Be the consolidator that         │
│ reshapes the industry.                                              │
│                                                                     │
│ Half-measures lead to half-results. If the market is disrupted,   │
│ be the disruptor, not the disrupted."                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ JEAN-LUC (Principled Commander):                                    │
├─────────────────────────────────────────────────────────────────────┤
│ "Before we discuss tactics, let's discuss principles.             │
│                                                                     │
│ What happens to their employees if we acquire? Do we have a        │
│ responsibility to them? What about their customers who chose       │
│ them specifically?                                                  │
│                                                                     │
│ An acquisition can be done honorably or not. If we proceed, we    │
│ must commit to fair treatment - not just extracting value.         │
│                                                                     │
│ Recommendation: Any option can be correct if executed with         │
│ integrity. The question is who we want to be as a company."        │
└─────────────────────────────────────────────────────────────────────┘
```

**Step 3: Synthesis and Debate**
```
Moderator synthesizes:

Points of Agreement:
- Doing nothing (strict Option C) is rejected by most advisors
- The opportunity is time-limited
- Integration risk is the key variable

Key Tensions:
- Sun/Niccolo (Act now) vs Burke (Preserve optionality)
- Lee (Need more data) vs Maximilien (Bold action regardless)
- Jean-Luc (Values first) vs Niccolo (Results first)

Critical Questions Surfaced:
1. Why is competitor struggling? (Market vs structural)
2. What is true integration cost and timeline?
3. Who else might acquire them if we don't?
4. What do our employees/board think?
```

**Step 4: Decision Framework**

```
Recommended Decision Framework:

IF competitor weakness is structural (bad product) → OPTION C
IF competitor weakness is temporary (market/funding) → Evaluate A vs B

For Option A (Acquisition):
├── Due diligence on integration cost (get to <25% of purchase)
├── Retention agreements for key talent (top 10 people)
├── Customer commitment assessment (will they stay?)
├── Regulatory review (antitrust considerations)
└── Board approval at $40M+ commitment

For Option B (Organic):
├── Market opportunity sizing ($30M = X customers?)
├── Competitive response modeling (what if rival acquires?)
├── Talent availability (can we hire their best regardless?)
└── Speed to results (can we win before they recover?)

Decision Criteria:
- NPV comparison with realistic assumptions
- Risk-adjusted returns (Monte Carlo if possible)
- Strategic optionality value
- Cultural/values alignment
```

### Sample Output: Strategic Decision Brief

```markdown
# STRATEGIC DECISION BRIEF

## Decision: Acquisition vs Organic Growth Strategy
## Date: 2026-01-16
## Classification: Board Confidential

---

## EXECUTIVE SUMMARY

Following multi-perspective strategic analysis, we recommend
**conditional pursuit of Option A (Acquisition)** subject to
due diligence validation. This recommendation is MODERATE
confidence pending financial analysis.

---

## PERSPECTIVES SUMMARY

| Advisor | Position | Confidence |
|---------|----------|------------|
| Sun | Acquire (at discount) | High |
| Niccolo | Acquire (speed critical) | High |
| Burke | Wait/Conservative | High |
| Lee | Needs data | Medium |
| Maximilien | Acquire + Raise | High |
| Jean-Luc | Values-dependent | Medium |

**Consensus**: 4 favor acquisition, 1 conservative, 1 data-dependent

---

## KEY RISKS

| Risk | Mitigation | Owner |
|------|------------|-------|
| Integration failure | Detailed integration plan pre-close | COO |
| Talent exodus | Retention packages for top 20 | CHRO |
| Customer churn | Customer success transition plan | CRO |
| Overpayment | Independent valuation, walk-away price | CFO |

---

## RECOMMENDED PATH

### Phase 1: Diligence (2 weeks)
- [ ] Financial due diligence
- [ ] Technical/product assessment
- [ ] Talent mapping
- [ ] Customer sentiment

### Phase 2: Decision Gate
- Present findings to board
- Go/No-Go with clear criteria
- If No-Go: Execute Option B immediately

### Phase 3: Execution
- Negotiation and close
- Integration planning
- Day 1 readiness

---

## DECISION NEEDED

Board approval to proceed with Phase 1 diligence at estimated
cost of $150K (legal, financial, technical advisors).

---

*Prepared by: Strategic Advisory Council*
*Facilitator: Vector (Synthesis)*
```

---

## Example 2: Crisis Response Planning

### Scenario
A data breach has been discovered affecting customer data. Need coordinated response strategy.

### Invocation
```
/bmad:strategy-team:workflows:crisis-response-planning
```

### Workflow Steps

**Step 1: Situation Assessment**
```
User Input: "Discovered unauthorized access to customer database.
~50,000 customer records potentially exposed (names, emails,
hashed passwords). No payment data. Discovered internally,
not yet public. B2B SaaS company, EU and US customers."
```

**Step 2: Multi-Team Coordination**
```
Giuseppe (Communications) leads with support:

Immediate Actions (First 4 Hours):
├── Technical: Contain breach, preserve evidence
├── Legal: Notification timeline assessment (GDPR 72 hrs)
├── Communications: Draft holding statements
└── Executive: Crisis team assembly

Stakeholder Map:
├── Customers (50,000 affected)
├── Regulators (GDPR authorities, state AGs)
├── Employees (internal communication)
├── Board (briefing required)
├── Media (prepare for potential coverage)
└── Partners (contractual notification?)
```

**Step 3: Strategic Perspectives**

```
GIUSEPPE (Communications):
"Control the narrative before it controls you. We should
self-disclose to customers before any leak. Be the source
of truth. Template:
- What happened (facts only)
- What we're doing
- What customers should do
- How to contact us

Avoid: Speculation, blame, minimization."

NICCOLO (Realist):
"Consider the political dynamics. Who benefits from this
becoming public? Competitors? Disgruntled employees?
Understand your adversaries. Prepare for hostile questions.
Have answers for the hardest questions."

SOPHIA (Ethics):
"Our obligation is to affected customers, not our reputation.
Notify quickly, completely, honestly. Accept responsibility.
Offer meaningful remediation (credit monitoring, etc.).
This is a test of our values."

JEAN-LUC (Principled):
"How we handle this defines who we are. Every employee
should be able to be proud of our response. Transparency
and customer-first thinking. No cover-up, no spin."

MAGNUS (Political):
"Map the stakeholders and their interests:
- Regulators want compliance and cooperation
- Customers want honesty and protection
- Media wants a story (give them the story you want)
- Competitors want to exploit (monitor their response)

Sequence communications strategically."
```

**Step 4: Response Plan**

### Sample Output: Crisis Response Plan

```markdown
# CRISIS RESPONSE PLAN: Data Breach

## CLASSIFICATION: INTERNAL ONLY
## Date: 2026-01-16

---

## SITUATION SUMMARY

| Attribute | Detail |
|-----------|--------|
| Records Affected | ~50,000 |
| Data Types | Names, emails, hashed passwords |
| Discovery | Internal (not public) |
| Jurisdiction | EU + US customers |
| Payment Data | NOT affected |

---

## TIMELINE (GDPR 72-HOUR CLOCK)

### Hour 0-4: Containment
- [ ] Technical containment confirmed
- [ ] Evidence preservation initiated
- [ ] Crisis team assembled
- [ ] Legal assessment of notification requirements

### Hour 4-24: Preparation
- [ ] Root cause analysis (preliminary)
- [ ] Customer notification drafted and approved
- [ ] Regulator notification prepared (EU DPAs)
- [ ] Employee talking points distributed
- [ ] Customer service scripts prepared

### Hour 24-48: Notification
- [ ] EU regulator notification submitted
- [ ] Customer email notification sent
- [ ] Blog post/public statement published
- [ ] Customer service team on standby

### Hour 48-72: Response
- [ ] Monitor customer inquiries
- [ ] Media response (if coverage)
- [ ] State AG notifications (US)
- [ ] Partner notifications (if required)

---

## COMMUNICATION TEMPLATES

### Customer Email
```
Subject: Important Security Notice from [Company]

Dear [Customer Name],

We are writing to inform you of a security incident that may
have affected your account information...

[Full template with all required elements]
```

### Regulatory Notification (GDPR Article 33)
```
[Structured notification per DPA requirements]
```

### Press Statement (Hold)
```
"[Company] recently identified unauthorized access to our
systems. We immediately contained the incident and are
working with cybersecurity experts to investigate..."
```

---

## STAKEHOLDER-SPECIFIC STRATEGIES

### Customers
- **Message**: Transparency, protection, action
- **Channel**: Email, in-app, support
- **Remediation**: Credit monitoring offer

### Regulators
- **Message**: Cooperation, compliance, remediation
- **Channel**: Formal notification
- **Posture**: Proactive, thorough

### Media
- **Message**: Facts, responsibility, action
- **Channel**: Press release, spokesperson
- **Posture**: Responsive but not defensive

### Employees
- **Message**: What happened, how to respond to questions
- **Channel**: All-hands, written guide
- **Key Point**: Refer inquiries to designated contacts

---

## DECISION AUTHORITIES

| Decision | Authority | Escalation |
|----------|-----------|------------|
| Technical containment | CISO | CEO |
| Customer notification | General Counsel + CEO | Board |
| Regulator notification | General Counsel | CEO |
| Press statements | CEO + Comms | Board |
| Remediation spending | CFO (up to $X) | Board |

---

*Prepared by: Crisis Response Team*
*Lead: Giuseppe (Communications)*
*Contributing: Sophia, Jean-Luc, Magnus, Niccolo*
```

---

## Example 3: Stakeholder Negotiation Prep

### Scenario
Preparing for a critical contract renegotiation with your largest customer (40% of revenue).

### Invocation
```
/bmad:strategy-team:workflows:stakeholder-negotiation-prep
```

### Workflow Steps

**Step 1: Stakeholder Analysis**
```
Geneva (Mediator) leads analysis:

Counterparty Profile:
├── Company: MegaCorp Inc.
├── Relationship: 5 years, 40% of our revenue
├── Contract Status: Renewal in 60 days
├── Their Position: Demanding 30% price reduction
├── Our Position: Maximum 10% reduction sustainable
│
Key Stakeholders (Their Side):
├── CFO: Cost reduction mandate from board
├── CTO: Loves our product, internal champion
├── Procurement: KPIs on cost savings
├── End Users: Dependent on our platform
│
Power Dynamics:
├── They have: Revenue concentration leverage
├── We have: Switching costs, product dependency
└── BATNA: They could build in-house (18-month timeline)
```

**Step 2: Strategic Perspectives**

```
GENEVA (Negotiation):
"Focus on interests, not positions. Their interest is cost
control. Our interest is revenue stability. Creative solutions:
- Multi-year commitment at moderate discount
- Volume-based pricing (they grow, we grow)
- Scope reduction option (reduce cost by reducing scope)
- Payment terms (early payment for discount)"

SUN (Strategy):
"Know yourself and know your enemy. They need us more than
they admit. Their 18-month build timeline is optimistic.
Their CTO is our ally. Use information asymmetry wisely."

NICCOLO (Power):
"Understand their internal politics. CFO needs a win.
Give them something they can claim as victory internally.
30% is their opening; 15% is probably their target.
Find 15% in ways that don't hurt us as much."

CICERO (Persuasion):
"Prepare your arguments:
1. TCO comparison (we're cheaper than alternatives)
2. Risk of transition (hidden costs, timeline risk)
3. Value delivered (ROI metrics from their use)
4. Partnership future (roadmap aligned to their needs)

Avoid: Desperation, threats, ultimatums."
```

**Step 3: Negotiation Strategy**

### Sample Output: Negotiation Playbook

```markdown
# NEGOTIATION PLAYBOOK: MegaCorp Renewal

## CLASSIFICATION: CONFIDENTIAL
## Date: 2026-01-16

---

## OBJECTIVE

Secure 3-year renewal at no more than 15% effective discount
while strengthening strategic relationship.

---

## ZONE OF POSSIBLE AGREEMENT (ZOPA)

| Dimension | Their Position | Our Position | ZOPA |
|-----------|---------------|--------------|------|
| Price | -30% | -10% max | -15% to -20% |
| Term | 1 year | 3 years | 2-3 years |
| Scope | Full | Flexible | Maintain/expand |
| Payment | Net 60 | Net 30 | Net 45 |

---

## INTERESTS ANALYSIS

### Their Interests (Prioritized)
1. Cost reduction (CFO mandate)
2. Budget predictability
3. Operational continuity
4. Procurement KPI achievement

### Our Interests (Prioritized)
1. Revenue preservation
2. Multi-year commitment
3. Reference customer status
4. Expansion opportunity

---

## CREATIVE OPTIONS

### Option A: Volume Commitment
- 15% discount at current volume
- Additional 5% if volume grows 20%
- Multi-year commitment (3 years)
- **Net Impact**: -15% Y1, potentially -20% Y2+

### Option B: Scope Optimization
- Audit current usage
- Right-size license count
- Potentially 20% reduction in scope
- Same per-unit pricing
- **Net Impact**: -20% total spend, same margin %

### Option C: Strategic Partnership
- 12% discount
- Joint case study / reference rights
- Roadmap input (advisory board seat)
- Early access to new features
- **Net Impact**: -12% + marketing value

---

## ARGUMENTS PREPARED

### Value Arguments
1. "Your team's productivity has increased X% since implementation"
2. "Total cost of ownership is 40% lower than alternative Y"
3. "Switching costs estimated at $X + 18 months timeline risk"

### Reciprocity Arguments
1. "We're prepared to offer X if you can commit to Y"
2. "Multi-year commitment allows us to invest in your success"

### Anchoring
- Start at 5% discount, multi-year required
- Have room to move to 15%
- Never reach 20% without significant return

---

## TACTICAL APPROACH

### Meeting 1: Discovery
- Understand their true constraints
- Identify CTO as internal champion
- Probe on BATNA reality
- Don't negotiate yet—gather information

### Meeting 2: Options
- Present Options A, B, C
- Let them react
- Identify which direction they prefer
- Schedule follow-up

### Meeting 3: Close
- Come with refined proposal
- Be prepared to close or walk
- Have escalation path defined

---

## RED LINES

| Issue | Our Limit | Escalation Required |
|-------|-----------|---------------------|
| Discount | >20% | CEO approval |
| Term | <2 years | CFO approval |
| Payment | >Net 60 | CFO approval |
| SLA | Penalties >10% | Legal review |

---

## IF THEY WALK

Contingency plan:
1. Revenue replacement timeline: 12 months to diversify
2. Alternative customers in pipeline: 3 at similar scale
3. Maximum short-term discount to prevent loss: 25% (CEO call)

---

*Prepared by: Geneva (Negotiation Lead)*
*Contributing: Sun, Niccolo, Cicero, Magnus*
```

---

## Example 4: Competitive Warfare

### Scenario
A well-funded competitor is aggressively pursuing your customers with below-cost pricing.

### Invocation
```
/bmad:strategy-team:workflows:competitive-warfare
```

### Workflow Overview

**Strategic Council Preset**: `all-out-war`
- Niccolo (Ruthless realism)
- Sun (Strategic positioning)
- Musashi (Timing and execution)
- Magnus (Coalition building)
- Giuseppe (Information warfare)

```
SUN:
"The competitor who burns cash to acquire customers is
fighting a war of attrition. You must avoid this war.
Instead: differentiate so completely that price becomes
irrelevant. Attack where they are not: segments they
ignore, features they lack, relationships they can't build."

NICCOLO:
"Understand their funding and burn rate. They will run out
of money or investor patience. Your job is to survive until
then—and to accelerate their demise if possible. Seed doubt
with their investors. Publicize their unsustainable economics."

MUSASHI:
"In combat, timing is everything. They are on offense—you
must not fight on their terms. Make them chase you into
terrain that favors you. Lengthen the sales cycle. Increase
evaluation complexity. They want quick wins; deny them."

GIUSEPPE:
"Control the narrative. They're 'buying market share' (negative).
You're 'focused on customer success' (positive). Arm your
sales team with competitive intelligence. Every deal lost
is a story to tell about their tactics."
```

---

## Example 5: Leadership Philosophy Development

### Scenario
A new executive wants to develop their personal leadership philosophy.

### Invocation
```
/bmad:strategy-team:workflows:leadership-philosophy
```

### Workflow Steps

**Step 1: Self-Assessment**
```
Dialogue with archetypes:

JEAN-LUC: "What principles would you never compromise?"
CHARLES: "What change do you want to see in the world?"
BURKE: "What traditions and wisdom do you want to preserve?"
SUN: "How do you define victory? What does success look like?"
```

**Step 2: Philosophy Synthesis**

### Sample Output: Leadership Philosophy Document

```markdown
# PERSONAL LEADERSHIP PHILOSOPHY

## [Leader Name]
## Date: 2026-01-16

---

## CORE PRINCIPLES

### 1. Integrity Above Expedience
*Inspired by: Jean-Luc*

I will not sacrifice long-term trust for short-term gains.
Every decision should be one I can defend publicly and
be proud of in hindsight.

### 2. Results Through People
*Inspired by: Lee*

Excellence comes from systems and people, not heroics.
My job is to build the team and environment where
great work happens naturally.

### 3. Thoughtful Speed
*Inspired by: Musashi*

Move decisively but not recklessly. Preparation enables
speed. Master the fundamentals, then act with confidence.

### 4. Honest Confrontation
*Inspired by: Niccolo*

Address difficult truths directly. Avoiding conflict
creates larger conflicts later. Respectful directness
is kindness.

---

## DECISION-MAKING FRAMEWORK

When facing difficult decisions, I will:
1. Gather perspectives (especially dissenting ones)
2. Consider second-order effects
3. Check against my principles
4. Decide and commit fully
5. Reflect and learn

---

## RELATIONSHIPS

- **With directs**: Coach, challenge, support
- **With peers**: Collaborate, compete fairly, share credit
- **With leaders**: Inform, advise, execute
- **With customers**: Listen, deliver, exceed

---

## GROWTH COMMITMENTS

1. Read one leadership book per month
2. Seek feedback quarterly from team
3. Mentor one emerging leader
4. Reflect weekly on decisions made

---

*Developed through dialogue with Strategic Archetypes*
```

---

## Workflow Combinations

### Major Strategic Decisions
```
1. strategic-decision-workshop (full council)
2. stakeholder-negotiation-prep (if negotiation needed)
3. crisis-response-planning (if risks identified)
```

### M&A Strategy
```
1. ma-due-diligence (strategy team)
2. campaign-planner-org (intel team)
3. corporate-formation (legal team)
```

### Board Preparation
```
1. board-presentation-prep (narrative and evidence)
2. strategic-decision-workshop (anticipate questions)
3. Party Mode: board-prep preset
```

---

## Best Practices

1. **Embrace productive tension** - disagreement is valuable
2. **Consider all perspectives** - even uncomfortable ones
3. **Document reasoning** - for future learning
4. **Revisit decisions** - circumstances change
5. **Act on conclusions** - analysis without action is waste

---

## See Also

- [Legal Workflow Examples](LEGAL-WORKFLOW-EXAMPLES.md) - For legal strategy support
- [Intel Workflow Examples](INTEL-WORKFLOW-EXAMPLES.md) - For competitive intelligence
- [Party Mode Examples](PARTY-MODE-EXAMPLES.md) - For `strategic-council` preset
- [Workflow Chaining Guide](../WORKFLOW-CHAINING-GUIDE.md) - Combining workflows
