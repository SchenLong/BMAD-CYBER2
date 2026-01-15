# BMAD Decision Frameworks

Standardized frameworks for cross-module decision making, escalation, and conflict resolution in BMAD-CYBER2.

---

## Overview

When multiple modules collaborate on complex decisions, standardized frameworks ensure:

- **Consistency**: Same criteria applied across decisions
- **Transparency**: Clear rationale documented
- **Accountability**: Decision ownership tracked
- **Traceability**: Audit trail maintained

---

## Risk Prioritization Framework

Unified approach to prioritizing risks identified by different modules.

### Risk Dimensions

| Dimension | Owner | Description |
|-----------|-------|-------------|
| Business Impact | Strategy Team | Financial and operational impact |
| Legal/Regulatory Exposure | Legal Team | Compliance and liability risk |
| Security Risk | Cybersec Team | Technical security impact |
| Intelligence Assessment | Intel Team | External threat indicators |

### Scoring Scale (1-5)

#### Business Impact

| Score | Level | Description |
|-------|-------|-------------|
| 1 | Negligible | No measurable business impact |
| 2 | Minor | Temporary inconvenience, <$10K impact |
| 3 | Moderate | Short-term business disruption, $10K-$100K |
| 4 | Significant | Major business impact, $100K-$1M |
| 5 | Severe | Existential threat, >$1M or reputation damage |

#### Legal/Regulatory Exposure

| Score | Level | Description |
|-------|-------|-------------|
| 1 | None | No legal implications |
| 2 | Low | Minor compliance gap, easily remediated |
| 3 | Moderate | Regulatory attention possible, fines <$100K |
| 4 | High | Regulatory action likely, fines $100K-$1M |
| 5 | Critical | Criminal liability, major litigation, fines >$1M |

#### Security Risk

| Score | Level | Description |
|-------|-------|-------------|
| 1 | Minimal | No security impact |
| 2 | Low | Minor vulnerability, limited exploitability |
| 3 | Medium | Exploitable vulnerability, moderate impact |
| 4 | High | Active threat, significant data at risk |
| 5 | Critical | Active exploitation, major breach potential |

#### Intelligence Assessment

| Score | Level | Description |
|-------|-------|-------------|
| 1 | None | No external threat indicators |
| 2 | Low | Theoretical threat, no active indicators |
| 3 | Medium | Credible threat, some indicators |
| 4 | High | Active threat campaign, strong indicators |
| 5 | Critical | Confirmed targeting, imminent threat |

### Priority Calculation

**Calculation:** Average of all applicable dimensions

| Average Score | Priority Level |
|---------------|----------------|
| >= 4.5 | Critical |
| >= 3.5 | High |
| >= 2.5 | Medium |
| < 2.5 | Low |

### Assessment Template

```markdown
## Risk Prioritization Assessment

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Business Impact | [1-5] | [explanation] |
| Legal Exposure | [1-5] | [explanation] |
| Security Risk | [1-5] | [explanation] |
| Intel Assessment | [1-5] | [explanation] |

**Average Score:** [X.X]
**Priority:** [Critical/High/Medium/Low]

**Cross-Module Consensus:** [Yes/No - if No, explain dissent]
```

---

## Escalation Protocol

Standardized escalation across module boundaries.

### Escalation Levels

| Level | Name | Criteria | Notification | Response Time |
|-------|------|----------|--------------|---------------|
| L1 | Informational | FYI for awareness | Async update to module lead | Within 24 hours |
| L2 | Advisory | Input requested | Direct message to agent | Within 8 hours |
| L3 | Urgent | Action required | Party mode session | Within 2 hours |
| L4 | Crisis | Immediate action | War room activation | Immediate |

### Escalation Triggers

#### From Cybersec Team

| Trigger | Escalate To | Level | Recommended Preset |
|---------|-------------|-------|-------------------|
| Personal data potentially exposed | Legal (Covenant), Strategy (Giuseppe) | L3 - Urgent | `incident-war-room` |
| Critical vulnerability in production | BMM (Architect) | L2 - Advisory | - |
| Active attack detected | Legal, Strategy, Intel | L4 - Crisis | `crisis-response-party` |

#### From Legal Team

| Trigger | Escalate To | Level | Recommended Preset |
|---------|-------------|-------|-------------------|
| Litigation threat received | Strategy (Giuseppe) | L3 - Urgent | `litigation-war-room` |
| Regulatory inquiry received | Cybersec (Sentinel), Strategy | L3 - Urgent | - |
| Contract with security implications | Cybersec (Sentinel) | L2 - Advisory | `contract-review-party` |

#### From Strategy Team

| Trigger | Escalate To | Level | Recommended Preset |
|---------|-------------|-------|-------------------|
| Major strategic decision with security implications | Cybersec (Bastion), Legal (Covenant) | L2 - Advisory | `strategic-decision-validated` |
| Crisis with multiple dimensions | Cybersec, Legal, Intel | L4 - Crisis | `crisis-response-party` |

#### From Intel Team

| Trigger | Escalate To | Level | Recommended Preset |
|---------|-------------|-------|-------------------|
| Credible threat targeting organization | Cybersec (Phoenix) | L3 - Urgent | `threat-ecosystem-party` |
| Attribution with legal implications | Legal (Covenant) | L2 - Advisory | - |

### Escalation Notice Template

```markdown
## Escalation Notice

**From:** [Module/Agent]
**To:** [Module/Agent(s)]
**Level:** [L1-L4]
**Timestamp:** [datetime]

**Trigger:** [what triggered escalation]
**Context:** [brief background]
**Action Requested:** [what is needed]
**Response Deadline:** [when]

**Recommended Party Mode Preset:** [if applicable]
```

---

## Evidence Standards Framework

Standards for documentation that may be needed in legal proceedings.

### Core Principles

1. **Contemporaneous documentation** - Recorded at time of occurrence
2. **Immutability** - Tamper-evident, timestamped
3. **Chain of custody** - Who handled, when, where
4. **Completeness** - Full context, not cherry-picked
5. **Authenticity** - Verifiable source

### Evidence Types

#### Incident Evidence

| Required Element | Description |
|-----------------|-------------|
| Timestamps | UTC with timezone noted |
| Actor identification | User, system, external |
| Action taken | What was done |
| Evidence hash | SHA-256 |
| Collector identification | Who collected |
| Collection method | How collected |
| Storage location | Where stored |

**Chain of custody required:** Yes

#### Communications Evidence

| Required Element | Description |
|-----------------|-------------|
| Complete thread | Not excerpts |
| Sender/recipient | Full identification |
| Timestamps | When sent/received |
| Delivery confirmation | If available |
| Attachment inventory | List of attachments |

**Preservation requirements:**
- Original format preservation
- Metadata preservation
- Legal hold notification

#### Decision Evidence

| Required Element | Description |
|-----------------|-------------|
| Decision description | What was decided |
| Participants | Decision makers |
| Information considered | What was reviewed |
| Alternatives evaluated | What was rejected |
| Rationale | Why this decision |
| Approval chain | Who approved |

**Formats:** Decision brief, meeting minutes, approval records

#### Compliance Evidence

| Required Element | Description |
|-----------------|-------------|
| Control description | What control |
| Testing methodology | How tested |
| Test results | With timestamps |
| Tester identification | Who tested |
| Exception documentation | Any exceptions |
| Remediation tracking | If needed |

**Retention:** Per compliance framework requirements

### Evidence Documentation Template

```markdown
## Evidence Documentation

**Evidence ID:** [unique identifier]
**Type:** [incident/communications/decision/compliance]
**Created:** [timestamp UTC]
**Created By:** [collector name/role]

### Description
[What this evidence contains]

### Collection Method
[How this was collected]

### Chain of Custody
| Timestamp | Custodian | Action | Location |
|-----------|-----------|--------|----------|
| [time] | [name] | [action] | [location] |

### Integrity
**Hash (SHA-256):** [hash]
**Storage Location:** [path]
**Access Controls:** [who can access]

### Legal Considerations
**Privilege:** [Y/N - type if Y]
**Legal Hold:** [Y/N - if Y, reference hold]
**Disclosure Restrictions:** [any restrictions]
```

---

## Cross-Module Approval Framework

Approval workflows requiring sign-off from multiple modules.

### Approval Types

#### Security Release Approval

**Description:** Approval for releasing product/feature with security implications

| Module | Agent | Criteria | Conditional |
|--------|-------|----------|-------------|
| cybersec-team | security-architect | Security review complete, no critical findings | No |
| legal-team | counsel | Compliance requirements met | If personal data involved |
| bmm | tea | Testing complete, acceptance criteria met | No |

**Escalation:** If any approver objects, escalate to executive sponsor

#### Public Statement Approval

**Description:** Approval for external communications during incident/crisis

| Module | Agent | Criteria | Conditional |
|--------|-------|----------|-------------|
| legal-team | counsel | Legal review complete, no liability issues | No |
| strategy-team | communications-director | Messaging aligned with strategy | No |
| cybersec-team | incident-commander | Technical accuracy verified | If security incident |

**Timing:** All approvals before any external release

#### Vendor Security Approval

**Description:** Approval for vendors with access to sensitive data/systems

| Module | Agent | Criteria | Conditional |
|--------|-------|----------|-------------|
| cybersec-team | compliance-guardian | Security assessment complete | No |
| legal-team | counsel | Contract includes required security terms | No |
| strategy-team | policy-analyst | Aligned with vendor management policy | If policy requires |

#### Attribution Publication Approval

**Description:** Approval for publishing threat actor attribution

| Module | Agent | Criteria |
|--------|-------|----------|
| intel-team | osint-lead | Attribution confidence meets threshold |
| strategy-team | debate-coach | Attribution logic validated |
| legal-team | counsel | Legal implications assessed |
| strategy-team | political-strategist | Geopolitical implications considered |

### Approval Request Template

```markdown
## Cross-Module Approval Request

**Request ID:** [unique identifier]
**Approval Type:** [type]
**Requested By:** [name/module]
**Request Date:** [date]
**Decision Deadline:** [date]

### Request Description
[What is being requested for approval]

### Supporting Documentation
- [Document 1]
- [Document 2]

### Required Approvals

| Module | Agent | Status | Date | Comments |
|--------|-------|--------|------|----------|
| [module] | [agent] | [Pending/Approved/Rejected] | [date] | [comments] |

### Approval Status
**Overall Status:** [Pending/Approved/Rejected/Escalated]
**Escalation Required:** [Y/N - reason if Y]
```

---

## Conflict Resolution Framework

Framework for resolving disagreements between modules.

### Conflict Types

| Type | Description | Mediator |
|------|-------------|----------|
| Timeline | Competing timeline requirements | Abdul (Project Manager) |
| Priority | Competing priorities | Strategy Team (Sun Tzu) |
| Resource | Same resource needed | Abdul (Project Manager) |
| Technical | Disagreement on approach | Party Mode experts |
| Compliance | Compliance vs business need | Legal Team (Covenant) |

### Resolution Approaches

#### Timeline Conflict

**Approach:** Risk-based prioritization

1. Document each module's timeline requirement and rationale
2. Identify dependencies and critical path
3. Assess risk of each timeline option
4. Propose parallel execution if possible
5. Escalate to executive if unresolvable

#### Priority Conflict

**Approach:** Strategic alignment

1. Map priorities to strategic objectives
2. Assess trade-offs of each priority
3. Identify win-win options
4. If zero-sum, escalate for executive decision

#### Resource Conflict

**Approach:** Time-slicing and delegation

1. Quantify resource requirements from each module
2. Explore delegation or alternative resources
3. Propose time-slicing if single resource required
4. Prioritize based on urgency and impact

#### Technical Conflict

**Approach:** Evidence-based evaluation

1. Each party presents their approach with evidence
2. Identify evaluation criteria
3. Proof of concept if feasible
4. Expert panel recommendation

#### Compliance Conflict

**Approach:** Risk acceptance or compensating control

1. Document compliance requirement and rationale
2. Document business need and impact
3. Explore compensating controls
4. If no alternative, formal risk acceptance process
5. Document decision and accountability

### Conflict Resolution Record Template

```markdown
## Conflict Resolution Record

**Conflict ID:** [identifier]
**Type:** [timeline/priority/resource/technical/compliance]
**Parties:** [modules involved]
**Mediator:** [agent/module]

### Conflict Description
[What is the disagreement]

### Position A ([Module])
[Their position and rationale]

### Position B ([Module])
[Their position and rationale]

### Resolution Process
[Steps taken to resolve]

### Resolution Outcome
**Decision:** [what was decided]
**Trade-offs Accepted:** [what each party gave up]
**Risks Acknowledged:** [risks of this decision]

### Accountability
**Decision Made By:** [who]
**Accountability For Outcome:** [who]
**Review Date:** [when to revisit]
```

---

## Using Decision Frameworks

### In Party Mode

When using Party Mode presets, decision frameworks are automatically applied:

- `strategic-decision-validated` - Uses Risk Prioritization Framework
- `incident-war-room` - Uses Escalation Protocol and Evidence Standards
- `litigation-war-room` - Uses Evidence Standards and Approval Framework
- `conflict-resolution` - Uses Conflict Resolution Framework

### Direct Invocation

Invoke the frameworks workflow directly:

```
/bmad:core:workflows:strategic-decision
```

### In Team Orchestration

Templates automatically include relevant frameworks:

- `secure-software` - Includes security approval workflow
- `incident-response` - Includes escalation protocol
- `compliance-first` - Includes compliance evidence standards

---

## Related Documentation

- [PARTY-MODE-GUIDE.md](../UserGuide/PARTY-MODE-GUIDE.md) - Multi-agent collaboration
- [SCHEMAS-DATA-STRUCTURES.md](SCHEMAS-DATA-STRUCTURES.md) - Schema definitions
- [MODULES-OVERVIEW.md](../UserGuide/MODULES-OVERVIEW.md) - Module descriptions
- [SECURITY-OVERVIEW.md](../UserGuide/SECURITY-OVERVIEW.md) - Security architecture
