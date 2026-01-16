# Party Mode Examples

> **Version:** 1.0
> **Last Updated:** 2026-01-16
> **Workflow:** `bmad:core:workflows:party-mode`
> **Presets:** 27+ pre-configured agent teams

---

## Overview

Party Mode enables multi-agent collaboration where 2-16 specialized agents engage in dynamic discussions to solve complex problems. This guide demonstrates how to leverage Party Mode effectively across different scenarios.

### How Party Mode Works

1. **Agent Selection**: System selects 2-3 most relevant agents per topic
2. **Dynamic Discussion**: Agents respond in character, referencing each other
3. **Cross-Talk**: Natural back-and-forth between perspectives
4. **Synthesis**: Insights emerge from productive tension
5. **Graceful Exit**: Personalized farewells when complete

### Invocation Methods

```
# Quick activation from any context
> PM

# Direct workflow
/bmad:core:workflows:party-mode

# With preset selection
/bmad:core:workflows:select-preset
```

---

## Available Presets

### Security Operations

| Preset | Agents | Use Case |
|--------|--------|----------|
| `security-review-team` | Winston, Bastion, Cipher | Architecture security review |
| `incident-war-room` | Phoenix, Vector, Giuseppe, Counsel | Active incident response |
| `threat-intel-fusion` | Vector, Dossier, Cipher, Trace | Threat investigation |
| `vciso-advisory-party` | Bastion, Sentinel, Augustus, Counsel | vCISO engagement |

### Intelligence Operations

| Preset | Agents | Use Case |
|--------|--------|----------|
| `threat-ecosystem-party` | Dossier, Cipher, Phoenix, Niccolo | Threat actor mapping |
| `attribution-validation-party` | Dossier, Cipher, Cicero, Niccolo | Attribution review |
| `intel-validation-party` | Vector, Cicero, Niccolo, Cipher | Intelligence QA |
| `strategic-intelligence-council` | Vector, Dossier, Proxy, Echo, Sun | Competitive intel |

### Strategic Decision Making

| Preset | Agents | Use Case |
|--------|--------|----------|
| `strategic-council` | All 8 archetypes | Major decisions |
| `strategic-advisors` | Sun, Magnus, Counsel, John | Strategic planning |
| `crisis-response-party` | Giuseppe, Niccolo, Phoenix, Counsel, Vector | Crisis management |
| `negotiation-intelligence-party` | Geneva, Niccolo, Vector, Dossier, Counsel | High-stakes negotiation |

### Legal & Compliance

| Preset | Agents | Use Case |
|--------|--------|----------|
| `legal-risk-team` | Counsel, Europa, Advocate, Augustus | Legal risk assessment |
| `contract-review-party` | Counsel, Augustus, Niccolo, Sentinel | Contract analysis |
| `compliance-audit-team` | Europa, Sentinel, Murat | Compliance prep |
| `litigation-war-room` | Counsel, Sun, Cicero, Vector, Dossier | Litigation strategy |

### Development & Launch

| Preset | Agents | Use Case |
|--------|--------|----------|
| `product-security-launch` | John, Bastion, Ghost, Murat | Pre-launch security |
| `secure-architecture-workshop` | Winston, Bastion, Cipher, Cicero | Secure design |
| `tech-stack-evaluation-board` | Winston, Bastion, Covenant, Cicero | Tech selection |

---

## Example 1: Incident War Room

### Scenario
Active security incident requiring coordinated multi-team response.

### Invocation
```
> PM

Select preset: incident-war-room

Context: "We've detected potential data exfiltration.
500GB transferred to unknown external IP over 48 hours.
Production database server affected. Need coordinated response."
```

### Multi-Agent Discussion

```
┌─────────────────────────────────────────────────────────────────────┐
│ PHOENIX (Incident Commander) - 🚨                                   │
├─────────────────────────────────────────────────────────────────────┤
│ "This is a Priority 1 incident. Let me establish command.          │
│                                                                     │
│ IMMEDIATE ACTIONS (first 30 minutes):                              │
│ 1. Isolate prod-db-01 from network                                 │
│ 2. Block egress to external IP at firewall                         │
│ 3. Capture volatile memory before any changes                      │
│ 4. Preserve all logs (don't rotate!)                               │
│                                                                     │
│ Vector, I need you to start attribution work while we contain.     │
│ Giuseppe, prepare holding statements. Counsel, what's our          │
│ notification timeline?"                                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ COUNSEL (Legal) - ⚖️                                                │
├─────────────────────────────────────────────────────────────────────┤
│ "Phoenix, the clock is ticking on multiple fronts:                 │
│                                                                     │
│ REGULATORY DEADLINES:                                               │
│ • GDPR: 72 hours from discovery (if EU data involved)             │
│ • State breach laws: Varies, some as short as 24 hours            │
│ • Contractual: Check customer MSAs for notification terms          │
│                                                                     │
│ LEGAL HOLDS:                                                        │
│ • Preserve all evidence - we may need it for litigation           │
│ • Document all actions and timestamps                              │
│ • Consider engaging external forensics for independence            │
│                                                                     │
│ I'll start drafting regulator notifications while you assess       │
│ scope. Giuseppe, don't release anything external until we          │
│ understand what data was actually accessed."                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ VECTOR (Intelligence Director) - 🎯                                 │
├─────────────────────────────────────────────────────────────────────┤
│ "Understood. I'm running the external IP through our databases.    │
│                                                                     │
│ INITIAL FINDINGS:                                                   │
│ • IP 203.0.113.45 - Moldova, M247 hosting                          │
│ • Previously flagged in threat feeds (financially motivated)       │
│ • Associated with BazarLoader C2 infrastructure                    │
│ • Possible FIN7 or related eCrime group                            │
│                                                                     │
│ Phoenix, this looks like a financially-motivated actor, not        │
│ nation-state. That's somewhat good news - less sophisticated,      │
│ more predictable. But they likely have ransomware as endgame.      │
│                                                                     │
│ I recommend we check for lateral movement indicators and           │
│ ransomware staging. Dossier is pulling historical campaign data."  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ GIUSEPPE (Communications) - 📢                                      │
├─────────────────────────────────────────────────────────────────────┤
│ "I'm preparing tiered communications:                              │
│                                                                     │
│ INTERNAL (immediate):                                               │
│ • Executive team briefing: What we know, what we're doing          │
│ • IT/Security team: Specific technical guidance                    │
│ • All-hands: If/when it becomes necessary                          │
│                                                                     │
│ EXTERNAL (on standby):                                              │
│ • Customer notification: Template ready, needs scope details       │
│ • Press statement: Holding statement drafted                       │
│ • Regulatory: Counsel to lead, I'll support                        │
│                                                                     │
│ Phoenix, I agree with Counsel - we control the narrative best      │
│ when we self-disclose before any leak. But we need clarity on      │
│ what was actually taken before we say anything.                    │
│                                                                     │
│ Vector, how confident are you on the actor attribution?            │
│ That affects how we message the sophistication of the attack."     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ VECTOR (Intelligence Director) - 🎯                                 │
├─────────────────────────────────────────────────────────────────────┤
│ "Giuseppe, I'm at MODERATE confidence on FIN7 attribution.         │
│ About 65% - enough to inform our response, not enough to           │
│ publicly state. For external comms, I'd recommend saying           │
│ 'sophisticated criminal actors' without naming specific groups.    │
│                                                                     │
│ Phoenix, based on the FIN7 playbook, here's what to expect:        │
│ 1. They've likely been inside 2-4 weeks (typical dwell time)       │
│ 2. They're staging for ransomware deployment                       │
│ 3. They may have additional persistence mechanisms                 │
│                                                                     │
│ We should hunt for Cobalt Strike beacons and BazarLoader           │
│ indicators across the entire environment, not just the DB server." │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PHOENIX (Incident Commander) - 🚨                                   │
├─────────────────────────────────────────────────────────────────────┤
│ "Good work, team. Let me synthesize and assign:                    │
│                                                                     │
│ IMMEDIATE PRIORITIES:                                               │
│ 1. Containment: I'm coordinating with IT to isolate               │
│ 2. Evidence: Forensics team capturing memory and images            │
│ 3. Hunting: Expanding search based on Vector's intel               │
│                                                                     │
│ PARALLEL WORKSTREAMS:                                               │
│ • Counsel: Regulatory timeline tracking, notification drafts       │
│ • Giuseppe: Comms templates, executive briefing prep               │
│ • Vector: Continue attribution, look for additional IOCs           │
│                                                                     │
│ NEXT CHECK-IN: 2 hours                                              │
│                                                                     │
│ Any questions or concerns before we break?"                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Session Output

```markdown
# INCIDENT WAR ROOM SESSION SUMMARY

## Session: 2026-01-16 15:30-16:15 UTC
## Preset: incident-war-room
## Participants: Phoenix, Vector, Giuseppe, Counsel

---

## KEY DECISIONS

1. **Containment Strategy**: Isolate affected server, block egress
2. **Attribution Assessment**: FIN7-like actor (65% confidence)
3. **Notification Timeline**: GDPR 72-hour clock started
4. **Communication Approach**: Self-disclose before leak

---

## ACTION ITEMS

| Action | Owner | Deadline |
|--------|-------|----------|
| Server isolation | Phoenix | Immediate |
| Memory capture | Forensics | 1 hour |
| Environment-wide hunt | Security | 4 hours |
| Regulatory notification draft | Counsel | 24 hours |
| Customer notification template | Giuseppe | 12 hours |
| Executive briefing | Giuseppe | 2 hours |
| Attribution deep dive | Vector | 6 hours |

---

## NEXT STEPS

- Reconvene in 2 hours for status update
- Escalate to board if data scope exceeds 10K records
- External forensics firm on standby

---

*Session facilitated by Party Mode*
*Full transcript available in session logs*
```

---

## Example 2: Strategic Council (Major Decision)

### Scenario
Board-level decision on whether to accept acquisition offer or remain independent.

### Invocation
```
> PM

Select preset: strategic-council

Context: "We've received $100M acquisition offer from larger competitor.
We're profitable, $10M ARR, growing 50% YoY. Offer is 10x revenue.
Founders are 60% owners, team is 40%. Need multi-perspective analysis."
```

### Multi-Agent Discussion

```
┌─────────────────────────────────────────────────────────────────────┐
│ SUN (Master Strategist) - 🐉                                        │
├─────────────────────────────────────────────────────────────────────┤
│ "The supreme excellence is to win without fighting. But this       │
│ offer is not a surrender - it is a choice of battles.              │
│                                                                     │
│ Consider: What war are you actually in?                            │
│ • If your war is wealth creation → $100M is significant victory    │
│ • If your war is market leadership → This ends your campaign       │
│ • If your war is innovation impact → Depends on acquirer culture   │
│                                                                     │
│ Know yourself: What do the founders truly want? What about the     │
│ team who owns 40%? Aligned interests make for clear decisions.     │
│                                                                     │
│ Know the enemy: Why does the competitor want you? Your product?    │
│ Your team? To eliminate competition? Their motive reveals much."   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ NICCOLO (Realist) - 🦊                                              │
├─────────────────────────────────────────────────────────────────────┤
│ "Let us speak plainly about power and risk.                        │
│                                                                     │
│ ACCEPTING THE OFFER:                                                │
│ • Founders: $60M (life-changing, certain)                          │
│ • Team: $40M (significant for each person)                         │
│ • Risk: Near zero (deal closes, money arrives)                     │
│                                                                     │
│ REJECTING THE OFFER:                                                │
│ • Potential: 10x more in 5 years (maybe)                           │
│ • Risk: Competitor may crush you instead of buying                 │
│ • Risk: Market may shift, growth may stall                         │
│ • Risk: Team may leave for certain money elsewhere                 │
│                                                                     │
│ I would ask: If you reject and fail in 3 years, will you           │
│ regret turning down $100M? That regret is the price of ambition.   │
│                                                                     │
│ Also consider: Can you negotiate better terms? 10x is reasonable   │
│ but not exceptional for 50% growth. Push for 12-15x."              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ CHARLES (Liberator) - 🕊️                                            │
├─────────────────────────────────────────────────────────────────────┤
│ "Money is not the only measure of value.                           │
│                                                                     │
│ What is your mission? Why did you start this company? If the       │
│ mission lives on under new ownership, perhaps the sale serves      │
│ that mission better than independence. More resources, more reach. │
│                                                                     │
│ But if the acquirer will hollow out your vision, extract value,    │
│ and discard what made you special - then no amount justifies       │
│ that betrayal of purpose.                                          │
│                                                                     │
│ Consider also your people. The team that owns 40% - what do        │
│ they want? Do they have a voice in this decision? A leader         │
│ must consider not just their own interests but those they serve.   │
│                                                                     │
│ My counsel: Let your values guide you, not fear or greed."         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ BURKE (Conservative) - 🏛️                                           │
├─────────────────────────────────────────────────────────────────────┤
│ "I urge caution against dramatic action in either direction.       │
│                                                                     │
│ The offer exists today. It may increase if rejected prudently.     │
│ But revolutionary rejection - burning bridges, public defiance -   │
│ that closes doors permanently.                                     │
│                                                                     │
│ What has your company achieved through steady, careful progress?   │
│ $10M ARR, profitability, 50% growth - these are not accidents.     │
│ They result from disciplined execution over time.                  │
│                                                                     │
│ My recommendation: Explore thoroughly before deciding.             │
│ • What are their integration plans?                                │
│ • What happens to the team?                                        │
│ • What happens to the product?                                     │
│ • What are the earnout conditions?                                 │
│                                                                     │
│ Take 60-90 days to understand fully. Rushed decisions serve        │
│ neither buyers nor sellers well."                                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ LEE (Technocrat) - ⚙️                                               │
├─────────────────────────────────────────────────────────────────────┤
│ "Let me provide analytical framework, not philosophy.              │
│                                                                     │
│ VALUATION ANALYSIS:                                                 │
│ • 10x ARR = $100M current value                                    │
│ • At 50% growth: $15M ARR Y2, $22M Y3, $34M Y4, $50M Y5           │
│ • At 10x multiple in Y5: $500M potential                           │
│ • Risk-adjusted (50% probability): $250M expected value            │
│                                                                     │
│ NPV COMPARISON (10% discount rate):                                 │
│ • Accept now: $100M (certain)                                      │
│ • Reject, exit Y5: $155M NPV (uncertain)                          │
│                                                                     │
│ The expected value favors rejection, but:                          │
│ • Growth may not sustain 50% for 5 years                          │
│ • Multiples may compress in 5 years                                │
│ • Execution risk is real                                           │
│                                                                     │
│ Purely analytically: The decision depends on your risk tolerance   │
│ and growth confidence. If you believe in >60% probability of       │
│ $200M+ exit in 5 years, reject. Otherwise, accept or negotiate."  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ MAXIMILIEN (Revolutionary) - ✊                                      │
├─────────────────────────────────────────────────────────────────────┤
│ "Colleagues speak of prudence and analysis. But what of ambition?  │
│                                                                     │
│ You built something from nothing. You disrupted an industry.       │
│ Now you would hand it to the very incumbents you challenged?       │
│                                                                     │
│ $100M is meaningful, yes. But is it transformative? Will it        │
│ change the world? Will it complete your vision?                    │
│                                                                     │
│ Consider: Every great company was once offered an exit that        │
│ seemed generous. Facebook rejected Yahoo's $1B. Now worth 100x.    │
│ Of course, many rejected and failed. But they tried.               │
│                                                                     │
│ My view: If you believe in your vision, fight for it. Raise        │
│ more capital. Expand faster. Win the market before they can        │
│ buy it. Use this offer as leverage for better financing terms.     │
│                                                                     │
│ But if you're tired, if the fight is gone from you, then sell.    │
│ There's no shame in that. Just be honest about which it is."       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ SOPHIA (Ethics Advisor) - ⚖️                                        │
├─────────────────────────────────────────────────────────────────────┤
│ "I want to center something often forgotten in these discussions.  │
│                                                                     │
│ STAKEHOLDER DUTIES:                                                 │
│ • Employees (40% owners): Have you consulted them? What do they    │
│   want? Their votes and their wishes may differ.                   │
│ • Customers: What happens to them post-acquisition?                │
│ • Founders' families: What does financial security mean for them?  │
│                                                                     │
│ There is no objectively right answer here. Both paths can be       │
│ ethically sound if chosen thoughtfully.                            │
│                                                                     │
│ What matters is:                                                    │
│ 1. Transparency with all stakeholders                              │
│ 2. Fair consideration of competing interests                       │
│ 3. Honesty with yourself about motivations                         │
│                                                                     │
│ Whatever you decide, be able to look everyone in the eye and       │
│ explain why. That's the ethical standard."                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Session Synthesis

```markdown
# STRATEGIC COUNCIL SESSION SUMMARY

## Topic: Acquisition Offer Analysis
## Participants: Sun, Niccolo, Charles, Burke, Lee, Maximilien, Sophia

---

## PERSPECTIVES SUMMARY

| Advisor | Position | Key Argument |
|---------|----------|--------------|
| Sun | Depends on goals | Know yourself, know the enemy |
| Niccolo | Lean accept, negotiate up | Certain money vs uncertain future |
| Charles | Values-dependent | Mission must guide decision |
| Burke | Explore first | 60-90 days due diligence |
| Lee | Quantitative analysis | NPV slightly favors rejection |
| Maximilien | Lean reject | Fight for the vision |
| Sophia | Process matters | Consult all stakeholders |

---

## CONSENSUS POINTS

1. **Negotiate regardless**: 10x is acceptable, not generous
2. **Consult team**: 40% owners deserve voice
3. **Understand acquirer intent**: Why do they want you?
4. **Take time**: No immediate deadline pressure

---

## KEY QUESTIONS TO RESOLVE

1. What do founders actually want? (Security vs ambition)
2. What do employees want? (Cash out vs upside)
3. What is acquirer's integration plan?
4. Can you negotiate to 12-15x?
5. What's your confidence in sustained 50% growth?

---

## RECOMMENDED NEXT STEPS

1. [ ] Engage M&A advisor to negotiate terms
2. [ ] Hold team meeting to gather input
3. [ ] Request acquirer integration plan
4. [ ] Model exit scenarios at different timeframes
5. [ ] Set decision deadline (60 days)

---

*Session facilitated by Party Mode*
*Archetype deliberation complete*
```

---

## Example 3: Contract Review Party

### Scenario
Critical enterprise contract requiring multi-perspective review.

### Invocation
```
> PM

Select preset: contract-review-party

Context: "Reviewing enterprise license agreement with Fortune 500.
$2M annual value, 3-year term. They're pushing unusual terms:
unlimited liability for IP infringement, right to audit our
source code, and termination for convenience with 30 days notice."
```

### Multi-Agent Discussion

```
COUNSEL (Legal):
"These terms are highly unusual and concerning. Let me break down:

1. Unlimited IP indemnification: Standard is capped at 1-2x fees
2. Source code audit: Rarely granted, IP risk is significant
3. 30-day termination: Creates business continuity risk

Niccolo, from a power dynamics perspective, are they testing us
or is this their standard enterprise template?"

NICCOLO (Realist):
"They're testing. Fortune 500s have more lawyers than engineers.
Their first draft is never their real position. They expect
pushback. The question is: how much leverage do we have?

What alternatives do they have? If we're the only viable option,
push back hard. If there are 3 competitors in final round,
be more flexible on non-critical terms."

AUGUSTUS (Policy Analyst):
"Let me provide market data. In enterprise SaaS:
- 87% of contracts cap indemnification at 2x annual fees
- 12% allow source code audit (usually in escrow form)
- Average termination notice is 90 days, not 30

These terms are 2+ standard deviations from market norms.
Either they're testing, or their legal team is out of touch."

SENTINEL (Compliance):
"From a risk perspective:
- Unlimited liability: Uninsurable, existential risk
- Source code audit: IP theft risk, even with NDAs
- 30-day termination: Revenue cliff risk

I would classify unlimited liability as a deal-breaker.
The others are negotiable with proper protections."
```

### Session Output

```markdown
# CONTRACT REVIEW PARTY SUMMARY

## Contract: Enterprise License - [Fortune 500 Co]
## Value: $2M/year, 3-year term
## Risk Level: HIGH (unusual terms identified)

---

## TERM ANALYSIS

| Issue | Risk | Market Norm | Our Position |
|-------|------|-------------|--------------|
| Unlimited IP indemnity | CRITICAL | 2x fees cap | Max 2x, non-negotiable |
| Source code audit | HIGH | Escrow only | Escrow acceptable, direct audit not |
| 30-day termination | MEDIUM | 90 days | Minimum 90 days mutual |

---

## NEGOTIATION STRATEGY

**Tier 1 (Must Have)**:
- Cap indemnification at 2x annual fees
- Remove direct source code access

**Tier 2 (Strong Preference)**:
- 90-day termination notice
- Mutual termination rights

**Tier 3 (Flexible)**:
- Escrow arrangement for source code
- Audit frequency (once per year)

---

## RECOMMENDED RESPONSE

Draft counter-proposal focusing on industry-standard terms.
Position as "bringing terms in line with market norms" rather
than as rejection. Prepare to lose deal if they insist on
unlimited liability.

---

*Review by: Counsel, Niccolo, Augustus, Sentinel*
```

---

## Example 4: Custom Agent Assembly

### Scenario
Building a custom team for a unique challenge.

### Invocation
```
> PM

I want to assemble a custom team:
- Vector (Intel) - for competitive analysis
- Winston (Architect) - for technical assessment
- Covenant (Legal) - for licensing review
- John (PM) - for product fit evaluation

Context: "Evaluating whether to adopt an open-source framework
as the foundation for our new product. Need to assess technical
fit, licensing implications, community health, and competitive
positioning."
```

### Custom Team Discussion

```
JOHN (Product Manager):
"Let me frame this from product perspective. Key questions:
1. Does this framework solve our core technical needs?
2. Will it limit our differentiation ability?
3. What's the community support and longevity outlook?

Winston, can you assess the technical fit?"

WINSTON (Architect):
"Looking at the framework technically:
- Architecture aligns with our patterns (good)
- Active development (2000+ commits last year)
- Clean API design, good documentation
- Concern: Single major corporate sponsor

The technical fit is strong. My concern is governance.
If the sponsor loses interest or pivots, we're exposed.

Vector, what's the competitive intelligence on this?"

VECTOR (Intel):
"I've researched the ecosystem:
- Framework used by 3 of our top 5 competitors
- Corporate sponsor is stable (profitable, growing)
- Core maintainer team is 8 people, 6 employed by sponsor
- Two notable forks exist (indicates some governance friction)

The competitor adoption is double-edged. It validates the choice
but means we won't differentiate on infrastructure.

Covenant, what about the licensing?"

COVENANT (Legal):
"License is Apache 2.0. Analysis:
- Commercial use: Permitted ✓
- Modification: Permitted ✓
- Distribution: Permitted with attribution ✓
- Patent grant: Included ✓
- No copyleft restrictions ✓

This is one of the most permissive licenses. No legal concerns.

However, check contributor license agreements (CLAs).
If they require CLA, you're depending on the sponsor's
continued good faith for the patent grant."
```

---

## Best Practices for Party Mode

### 1. Choose the Right Preset
- Match preset to problem domain
- Don't over-staff (3-5 agents optimal)
- Include devil's advocate perspectives

### 2. Provide Rich Context
- Share relevant documents
- Explain constraints and deadlines
- Identify key stakeholders

### 3. Guide the Discussion
- Ask follow-up questions
- Request synthesis when needed
- Challenge weak arguments

### 4. Capture Outcomes
- Document key decisions
- Assign action items
- Note unresolved questions

### 5. Know When to Exit
- Natural conclusion reached
- Key questions answered
- Action items clear

---

## Exit Commands

```
# Standard exit
*exit

# Alternative exits
goodbye
end party
quit
```

---

## See Also

- [Workflow Selection Guide](../WORKFLOW-SELECTION-GUIDE.md) - Choosing workflows
- [Cybersec Workflow Examples](CYBERSEC-WORKFLOW-EXAMPLES.md) - Security-focused examples
- [Strategy Workflow Examples](STRATEGY-WORKFLOW-EXAMPLES.md) - Strategic council examples
- [Workflow Chaining Guide](../WORKFLOW-CHAINING-GUIDE.md) - Combining workflows
