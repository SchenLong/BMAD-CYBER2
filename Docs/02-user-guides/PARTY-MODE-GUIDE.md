# Party Mode Guide

Complete guide to multi-agent collaboration in BMAD-CYBER2.

---

## What is Party Mode?

**Party Mode** enables multiple AI agents from different modules to collaborate on complex tasks. Instead of working with a single agent, you assemble a team of specialists who bring diverse expertise to the discussion.

### Key Benefits

- **Multi-perspective analysis**: Get insights from security, legal, strategy, and technical viewpoints
- **Cross-module expertise**: Combine agents from cybersec, intel, strategy, legal, and development modules
- **Pre-configured teams**: 27 presets for common scenarios
- **Custom assembly**: Build your own agent combinations

---

## Quick Start

### Invoking Party Mode

From any agent, type:

```
> PM
```

Or use the direct command:

```
/bmad:core:workflows:party-mode
```

### Using a Preset

```
> PM
> Use strategic-council preset
```

### Custom Team Assembly

```
> PM
> Assemble: Bastion, Counsel, Vector, Sun
```

---

## Party Mode Presets (27)

Pre-configured agent teams for common scenarios.

### Security Operations

| Preset | Agents | Use Case |
|--------|--------|----------|
| `security-review-team` | Winston (Architect), Bastion (Security), Cipher (Threat Intel) | Architecture security review |
| `incident-war-room` | Phoenix (IR), Vector (Intel), Giuseppe (Comms), Counsel (Legal) | Active security incident response |
| `compliance-audit-team` | Europa (EU Law), Sentinel (Compliance), Murat (Testing) | Compliance audit preparation |
| `threat-intel-fusion` | Vector (Director), Dossier (Profiler), Cipher (Analyst), Trace (Forensics) | Threat actor investigation |
| `product-security-launch` | John (PM), Bastion (Security), Ghost (Pentest), Murat (QA) | Pre-release security validation |
| `vciso-advisory-party` | Bastion (Security), Sentinel (Compliance), Augustus (Policy), Counsel (Legal) | Virtual CISO engagements |

---

### Intelligence Operations

| Preset | Agents | Use Case |
|--------|--------|----------|
| `threat-ecosystem-party` | Dossier (Profiler), Cipher (TTPs), Phoenix (Defense), Niccolo (Geopolitics) | Threat actor ecosystem mapping |
| `attribution-validation-party` | Dossier (Attribution), Cipher (Technical), Cicero (Challenge), Niccolo (Geopolitics) | Attribution review board |
| `intel-validation-party` | Vector (Synthesis), Cicero (Challenge), Niccolo (Geopolitics), Cipher (Technical) | Intelligence product validation |
| `strategic-intelligence-council` | Vector (Intel), Dossier (Profiling), Proxy (Corporate), Echo (SOCMINT), Sun (Strategy) | Competitive intelligence synthesis |

---

### Strategic Decision Making

| Preset | Agents | Use Case |
|--------|--------|----------|
| `strategic-advisors` | Sun (Strategy), Magnus (Politics), Counsel (Legal), John (Product) | Major strategic decisions |
| `strategic-decision-validated` | Sun (Strategy), Cicero (Challenge), Bastion (Security), Covenant (Legal), Vector (Intel) | Board-level decisions with validation |
| `crisis-response-party` | Giuseppe (Comms), Niccolo (Politics), Phoenix (Incident), Counsel (Legal), Vector (Intel) | Crisis response coordination |
| `negotiation-intelligence-party` | Geneva (Negotiation), Niccolo (Power), Vector (Intel), Dossier (Profiling), Counsel (Legal) | High-stakes negotiations |
| `decision-retrospective-board` | Sun (Strategy), Cicero (Challenge), Sophia (Ethics), Augustus (Policy) | Learning from past decisions |

---

### Legal Matters

| Preset | Agents | Use Case |
|--------|--------|----------|
| `legal-risk-team` | Counsel (General), Europa (EU), Advocate (Litigation), Augustus (Policy) | Legal risk assessment |
| `legal-intake-party` | Counsel (Legal), Geneva (Dispute), Phoenix (Cyber), Vector (Due Diligence) | Complex legal matter intake |
| `contract-review-party` | Counsel (Legal), Augustus (Policy), Niccolo (Negotiation), Sentinel (Compliance) | Critical contract review |
| `litigation-war-room` | Counsel (Lead), Sun (Strategy), Cicero (Argument), Vector (Intel), Dossier (Profiling) | High-stakes litigation |

---

### Development & Launch

| Preset | Agents | Use Case |
|--------|--------|----------|
| `game-launch-team` | Samus (Game Design), Counsel (Legal), Giuseppe (Comms) | Game launch preparation |
| `game-launch-review` | GLaDOS (QA), Counsel (Legal), Giuseppe (Comms), Max (Scrum) | Game regulatory compliance |
| `production-readiness-review` | Counsel (Legal), Giuseppe (Comms), Sentinel (Compliance), Murat (QA) | Product launch readiness |
| `secure-architecture-workshop` | Winston (Architect), Bastion (Security), Cipher (Threats), Cicero (Challenge) | Security-aware architecture design |
| `tech-stack-evaluation-board` | Winston (Architect), Bastion (Security), Covenant (Licensing), Cicero (Challenge) | Technology selection |

---

### Due Diligence & M&A

| Preset | Agents | Use Case |
|--------|--------|----------|
| `m-and-a-diligence-board` | Bastion (Security DD), Sentinel (Compliance DD), Counsel (Legal DD), Sun (Strategic) | M&A due diligence |
| `board-presentation-validation` | Bastion (Security), Counsel (Legal), Augustus (Evidence), Vector (Intel) | Board presentation review |
| `policy-validation-board` | Bastion (Security), Sentinel (Compliance), Counsel (Legal), Sophia (Ethics) | Policy enforceability review |

---

## Preset Details

### Security Review Team

**Purpose:** Review system architecture for security vulnerabilities and design flaws.

**Agents:**

| Agent | Module | Role |
|-------|--------|------|
| Winston | bmm | Technical architecture owner - presents the design |
| Bastion | cybersec-team | Security design review - identifies vulnerabilities |
| Cipher | cybersec-team | Threat intelligence context - maps to real-world threats |

**Use When:**

- Architecture review before implementation
- Security assessment of existing systems
- Threat modeling sessions

**Artifacts Needed:**

- `architecture.md`
- `prd.md` (optional)

**Expected Outputs:**

- `security-review-findings.md`
- `threat-model.yaml`

---

### Incident War Room

**Purpose:** Coordinated incident response team for security incidents requiring multi-domain expertise.

**Agents:**

| Agent | Module | Role |
|-------|--------|------|
| Phoenix | cybersec-team | Lead incident response - coordinates technical containment |
| Vector | intel-team | Attribution and intelligence - identifies threat actors |
| Giuseppe | strategy-team | External communications - manages stakeholder messaging |
| Counsel | legal-team | Legal obligations - ensures regulatory compliance |

**Use When:**

- Data breaches
- Ransomware attacks
- Significant security incidents
- Any incident with regulatory implications

**Timeline Constraints:**

- GDPR: 72-hour notification deadline
- HIPAA: 60-day notification deadline
- PCI-DSS: Immediate card brand notification

**Expected Outputs:**

- `incident-response-plan.md`
- `attribution-report.md`
- `notification-timeline.md`
- `communications-plan.md`

---

### Strategic Council

**Purpose:** All 8 historical archetype advisors for major strategic decisions.

**Agents:**

| Agent | Archetype | Perspective |
|-------|-----------|-------------|
| Sun | Master Strategist | Strategic positioning |
| Niccolo | Realist | Power dynamics |
| Charles | Liberator | Moral transformation |
| Maximilien | Revolutionary | Radical change |
| Burke | Conservative | Stability and tradition |
| Lee | Technocrat | Systems and efficiency |
| Musashi | Warrior-Strategist | Timing and execution |
| Jean-Luc | Principled Commander | Ethical leadership |

**Use When:**

- Major strategic decisions requiring multi-perspective analysis
- Build vs Buy decisions
- Market entry decisions
- Organizational restructuring

---

## Preset Quick Reference

### By Scenario

| Scenario | Recommended Preset |
|----------|-------------------|
| Security review | `security-review-team` |
| Active incident | `incident-war-room` |
| Compliance audit | `compliance-audit-team` |
| Strategic decision | `strategic-advisors` |
| Game launch | `game-launch-team` |
| Threat investigation | `threat-intel-fusion` |
| Product launch | `product-security-launch` |
| Legal risk | `legal-risk-team` |
| M&A evaluation | `m-and-a-diligence-board` |
| Crisis response | `crisis-response-party` |
| Negotiations | `negotiation-intelligence-party` |
| Architecture design | `secure-architecture-workshop` |
| Technology selection | `tech-stack-evaluation-board` |

### By Urgency

| Urgency | Presets |
|---------|---------|
| **Immediate** | `incident-war-room`, `crisis-response-party` |
| **High** | `litigation-war-room`, `attribution-validation-party`, `production-readiness-review` |
| **Normal** | `strategic-decision-validated`, `contract-review-party`, `compliance-audit-team` |
| **Planned** | `vciso-advisory-party`, `security-review-team`, `decision-retrospective-board` |

### By Module Combination

| Modules | Presets |
|---------|---------|
| BMM + Cybersec | `security-review-team`, `product-security-launch`, `secure-architecture-workshop` |
| Cybersec + Intel | `threat-intel-fusion`, `incident-war-room`, `attribution-validation-party` |
| Cybersec + Legal | `compliance-audit-team`, `incident-war-room`, `contract-review-party` |
| Strategy + Legal | `strategic-advisors`, `legal-risk-team`, `litigation-war-room` |
| Strategy + Intel | `negotiation-intelligence-party`, `intel-validation-party` |
| BMGD + Legal | `game-launch-team`, `game-launch-review` |

---

## Custom Team Assembly

### Building Custom Teams

You can assemble any combination of agents:

```
> PM
> Custom team: Bastion, Ghost, Trace, Cipher
```

### Guidelines for Custom Teams

1. **Define the problem clearly** before assembling the team
2. **Include diverse perspectives** - don't just pick similar agents
3. **Consider module access** - you need access to each agent's module
4. **Limit team size** - 3-6 agents is usually optimal

### Recommended Combinations

| Scenario | Recommended Agents |
|----------|-------------------|
| Pre-audit security review | Bastion + Sentinel + Trace |
| API security assessment | Gateway + Weaver + Ghost |
| Cloud migration security | Nimbus + Bastion + Winston |
| Blockchain audit | Ledger + Weaver + Ghost |
| Purple team exercise | Shield + Ghost + Watchman + Cipher |
| Mobile app security | Phantom + Weaver + Gateway |

---

## Party Mode Scenarios

### Example 1: Architecture Security Review

```
> /security-architect
> PM
> Use security-review-team preset

# The team collaborates:
# - Winston presents the architecture
# - Bastion identifies security concerns
# - Cipher provides threat context

# Output: security-review-findings.md
```

### Example 2: Incident Response

```
> /incident-commander
> PM
> Use incident-war-room preset

# During an active breach:
# - Phoenix coordinates technical response
# - Vector provides threat intelligence
# - Giuseppe manages communications
# - Counsel ensures compliance

# Output: incident-response-plan.md
```

### Example 3: Strategic Decision Workshop

```
> /strategy-team:the-master-strategist
> PM
> Use strategic-council preset

# For a major strategic decision:
# - All 8 archetypes debate the options
# - Sun provides strategic framework
# - Burke provides risk perspective
# - Charles provides ethical dimension

# Output: decision-brief.md
```

### Example 4: M&A Due Diligence

```
> PM
> Use m-and-a-diligence-board preset

# For acquisition evaluation:
# - Bastion: Security due diligence
# - Sentinel: Compliance due diligence
# - Counsel: Legal due diligence
# - Sun: Strategic integration

# Output: due-diligence-report.md
```

---

## Party Mode Best Practices

### Before Starting

1. **Define the objective** - What decision or output do you need?
2. **Gather artifacts** - Most presets list required input documents
3. **Check access** - Ensure you have access to all required modules
4. **Choose the right preset** - Or build a custom team

### During the Session

1. **Let agents contribute naturally** - Each will bring their expertise
2. **Ask for specific perspectives** - "What does Bastion think about this?"
3. **Encourage debate** - Different viewpoints lead to better outcomes
4. **Document decisions** - Capture reasoning, not just conclusions

### After the Session

1. **Review outputs** - Each preset defines expected deliverables
2. **Validate recommendations** - Cross-check against requirements
3. **Follow up** - Some outputs may need refinement

---

## Access Control

Party Mode respects RBAC permissions:

- You can only include agents you have access to
- Some presets require specific roles (e.g., `incident-war-room` requires security roles)
- Intel-team agents require credential verification
- Legal-team agents require legal_counsel role

See [RBAC-ROLES-GUIDE.md](RBAC-ROLES-GUIDE.md) for complete access control details.

---

## Related Documentation

- [MODULES-OVERVIEW.md](MODULES-OVERVIEW.md) - Module descriptions
- [AGENTS-REFERENCE.md](AGENTS-REFERENCE.md) - Complete agent catalog
- [WORKFLOWS-REFERENCE.md](WORKFLOWS-REFERENCE.md) - Complete workflow reference
- [RBAC-ROLES-GUIDE.md](RBAC-ROLES-GUIDE.md) - Access control by role
- [GETTING-STARTED.md](GETTING-STARTED.md) - Quick start guide
