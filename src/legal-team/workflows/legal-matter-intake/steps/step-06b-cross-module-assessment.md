---
name: step-06b-cross-module-assessment
description: Cross-module assessment for complex legal matters - brings in Strategy, Cybersec, and Intel perspectives for comprehensive routing

outputFile: '{output_folder}/legal/matter-intake-{matter_id}.md'
nextStepFile: './step-07-routing.md'
previousStepFile: './step-06-documents.md'

# Cross-module integration
partyModePresetsFile: '{project-root}/_bmad/core/workflows/party-mode/presets/cross-module-groups.yaml'
recommendedPreset: 'legal-intake-party'
---

# Step 6b: Cross-Module Assessment (Multi-Domain Routing)

## STEP GOAL:

For complex legal matters, assess whether cross-module expertise is needed for proper handling. This ensures matters with technical, strategic, or intelligence dimensions are routed appropriately from the start.

### When to Invoke:

This step should be invoked when ANY of:
- Matter involves cybersecurity incident or data breach
- Matter has significant business/strategic implications
- Due diligence on counterparty is critical
- Dispute involves technical subject matter
- Regulatory investigation with technical dimensions
- M&A or transaction with security/compliance aspects

---

## EXECUTION PROTOCOLS:

### 1. Introduction

**Counsel introduction:**

"Before we finalize routing, I want to assess whether this matter requires cross-module coordination from the start.

Some legal matters have dimensions that benefit from early involvement of:
- **Strategy team** - for stakeholder and relationship implications
- **Cybersecurity team** - for technical security dimensions
- **Intelligence team** - for counterparty research and due diligence

Let me evaluate the cross-module dimensions of this matter."

### 2. Cross-Module Dimension Assessment

**Evaluate each dimension:**

"**Matter Cross-Module Assessment:**

**Strategic Dimension:**
| Indicator | Present | Implication |
|-----------|---------|-------------|
| Significant business relationship at stake | [Y/N] | Stakeholder mediation may help |
| Potential for dispute escalation | [Y/N] | Early intervention valuable |
| Reputational risk | [Y/N] | Communications coordination |
| Executive/board visibility | [Y/N] | Strategic framing needed |

**Cybersecurity Dimension:**
| Indicator | Present | Implication |
|-----------|---------|-------------|
| Data breach or incident involved | [Y/N] | Technical assessment + timeline pressure |
| Technical evidence needed | [Y/N] | Forensic expertise |
| Security liability questions | [Y/N] | Security posture assessment |
| Compliance framework implications | [Y/N] | Compliance validation |

**Intelligence Dimension:**
| Indicator | Present | Implication |
|-----------|---------|-------------|
| Unknown counterparty | [Y/N] | Background research valuable |
| Potential fraud concerns | [Y/N] | Due diligence critical |
| Complex corporate structure | [Y/N] | Entity research needed |
| Litigation opponent | [Y/N] | Opposing counsel/party profiling |"

### 3. Cross-Module Routing Recommendation

**Based on assessment:**

"**Cross-Module Assessment Summary:**

**Strategic Involvement:** [Recommended/Optional/Not Needed]
- Rationale: [explanation]
- Suggested agent: Geneva (Stakeholder Mediator) or Niccolo (Political Strategist)

**Cybersecurity Involvement:** [Recommended/Optional/Not Needed]
- Rationale: [explanation]
- Suggested agent: Phoenix (Incident Commander) or Sentinel (Compliance Guardian)

**Intelligence Involvement:** [Recommended/Optional/Not Needed]
- Rationale: [explanation]
- Suggested agent: Vector (OSINT Lead)

**Overall Cross-Module Assessment:**
- [ ] Single-domain (Legal only)
- [ ] Multi-domain recommended
- [ ] Multi-domain critical"

### 4. Activate Cross-Module Party (If Recommended)

**If multi-domain recommended or critical:**

"Based on my assessment, I recommend activating cross-module support using the `legal-intake-party` preset:

**Participants:**
| Agent | Module | Role in This Matter |
|-------|--------|---------------------|
| Counsel (me) | Legal | Legal assessment and classification |
| Geneva | Strategy | Dispute likelihood and relationship impact |
| Phoenix | Cybersec | Technical triage (if cyber incident) |
| Vector | Intel | Party due diligence and background |

**Activation Options:**
[1] Activate full `legal-intake-party` - all cross-module experts
[2] Activate selected experts only - [specify which]
[3] Request intelligence gathering first - Vector does due diligence before routing
[4] Skip - Continue with legal-only routing

**Select [1-4]:**"

### 5. Cross-Module Input Collection

**If cross-module activated:**

**Geneva's Input (Strategy):**
"**Geneva here.** Assessing strategic dimensions:

- **Relationship Assessment:** [current relationship status]
- **Dispute Trajectory:** [likely escalation path]
- **Stakeholder Concerns:** [who cares about this outcome]
- **Recommendation:** [how strategic considerations affect handling]"

**Phoenix's Input (Cybersec):** (if applicable)
"**Phoenix here.** Assessing technical dimensions:

- **Technical Assessment:** [nature of technical issues]
- **Timeline Pressures:** [any regulatory deadlines]
- **Evidence Needs:** [what technical evidence may be needed]
- **Recommendation:** [how technical factors affect handling]"

**Vector's Input (Intel):**
"**Vector here.** Providing due diligence assessment:

- **Counterparty Profile:** [what we know about other party]
- **Risk Indicators:** [any red flags identified]
- **Intelligence Gaps:** [what we don't know but should]
- **Recommendation:** [how intelligence affects handling approach]"

### 6. Integrated Routing Recommendation

**Synthesize inputs:**

"**Integrated Matter Assessment:**

**Complexity Level:** [High/Medium/Low]
- Legal complexity: [assessment]
- Strategic complexity: [assessment]
- Technical complexity: [assessment]

**Recommended Handling Approach:**
- **Primary Lead:** [Legal agent] with [workflow]
- **Cross-Module Coordination:** [Yes/No] - [with whom]
- **Due Diligence Status:** [Complete/In Progress/Not Started]
- **Timeline:** [any deadline pressures]

**Risk-Adjusted Priority:** [Critical/High/Medium/Low]

**Special Handling Notes:**
1. [Any special considerations from cross-module input]
2. [Any early actions recommended]"

### 7. Update Output File

**Append to matter brief:**

```markdown
## 6b. Cross-Module Assessment

### Dimension Analysis
| Dimension | Assessment | Agents Consulted |
|-----------|------------|------------------|
| Strategic | [rating] | [agents] |
| Cybersecurity | [rating] | [agents] |
| Intelligence | [rating] | [agents] |

### Cross-Module Inputs

**Strategic Assessment (Geneva):**
[Geneva's input if provided]

**Technical Assessment (Phoenix):**
[Phoenix's input if provided]

**Intelligence Assessment (Vector):**
[Vector's input if provided]

### Integrated Recommendation
- **Handling Approach:** [recommendation]
- **Cross-Module Coordination:** [Yes/No - with whom]
- **Risk-Adjusted Priority:** [priority]

### Due Diligence Status
[Status and any findings]
```

Update frontmatter: add `step-06b-cross-module-assessment` to stepsCompleted

### 8. Continue to Routing

Load and follow {nextStepFile} (step-07-routing.md) with cross-module assessment context.

---

## BIDIRECTIONAL LINKS:

**To Cybersecurity (if incident involved):**
- Can trigger `incident-response-playbook` (Mode B) if active incident
- Coordinates legal timeline with technical response

**To Strategy (if relationship at stake):**
- Can invoke stakeholder-negotiation-prep for complex disputes
- Can invoke crisis-response-planning if reputational risk

**To Intelligence (for due diligence):**
- Can request targeted intelligence gathering
- Feeds into litigation preparation if dispute proceeds

---

## SUCCESS METRICS:

- Cross-module dimensions properly assessed
- Appropriate expertise engaged early
- Due diligence initiated when needed
- Integrated routing recommendation
- Timeline pressures identified and tracked
- Matter brief updated with cross-module context

## FAILURE INDICATORS:

- Missing obvious cross-module dimensions
- Not engaging needed expertise
- Proceeding without due diligence when indicated
- Not identifying timeline pressures
