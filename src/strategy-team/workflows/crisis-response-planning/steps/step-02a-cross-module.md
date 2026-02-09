---
name: step-02a-cross-module-activation
description: Cross-module party mode activation for crisis response - activates when cybersecurity or legal dimensions identified

outputFile: '{output_folder}/crisis/crisis-response-{incident}.md'
nextStepFile: './step-02-immediate-actions.md'

# Cross-module integration
partyModePresetsFile: '{project-root}/_bmad/core/workflows/party-mode/presets/cross-module-groups.yaml'
recommendedPreset: 'crisis-response-party'
incidentResponseWorkflow: '{project-root}/_bmad/cybersec-team/workflows/incident-response-playbook/workflow.md'
---

# Step 2a: Cross-Module Activation (Optional)

## STEP GOAL:

Determine if this crisis requires cross-module expertise and activate the appropriate party mode preset for coordinated response.

### Activation Triggers:

This step should be invoked when Step 1 crisis assessment indicates ANY of:
- Cybersecurity incident (breach, ransomware, data leak)
- Legal/regulatory implications (GDPR notification, litigation risk)
- Public communications required within 24 hours
- Multi-stakeholder impact (investors, regulators, customers)

---

## EXECUTION PROTOCOLS:

### 1. Assess Cross-Module Need

**Evaluate the crisis dimensions:**

"Based on the crisis assessment, I'm checking for cross-module coordination needs:

**Cybersecurity Dimension:**
- [ ] Data breach or unauthorized access
- [ ] Ransomware or malware incident
- [ ] System compromise or outage
- [ ] Technical attribution needed

**Legal/Regulatory Dimension:**
- [ ] GDPR 72-hour notification potentially required
- [ ] Contractual breach notification required
- [ ] Litigation risk identified
- [ ] Regulatory reporting required

**Intelligence Dimension:**
- [ ] External threat actor involved
- [ ] Public narrative monitoring needed
- [ ] Counterparty intelligence required

**Communications Dimension:**
- [ ] Media attention expected/occurring
- [ ] Multiple stakeholder groups affected
- [ ] Public statement required within 24 hours"

### 2. Recommend Party Mode Preset

**Based on dimensions identified:**

**IF Cybersecurity + Legal + Communications:**
> **Recommended:** `crisis-response-party` preset
>
> This activates:
> - **Giuseppe** (Communications Director) - Crisis communications lead
> - **Niccolo** (Political Strategist) - Stakeholder dynamics
> - **Phoenix** (Incident Commander) - Security incident lead
> - **Covenant** (Counsel) - Legal obligations
> - **Vector** (OSINT Lead) - External narrative monitoring

**IF Cybersecurity incident requiring technical response:**
> **Recommended:** Handoff to `incident-response-playbook` (Mode B)
>
> Continue crisis communications here while parallel track handles technical response.
> The Incident Commander (Phoenix) will coordinate between tracks.

**IF Legal/Regulatory primary concern:**
> **Recommended:** `legal-intake-party` preset
>
> This activates:
> - **Covenant** (Counsel) - Legal assessment
> - **Geneva** (Stakeholder Mediator) - Dispute assessment
> - **Phoenix** (Incident Commander) - Technical triage
> - **Vector** (OSINT Lead) - Party due diligence

### 3. Cross-Module Coordination Protocol

**IF activating parallel incident response:**

"I'm establishing coordination between Crisis Response and Incident Response:

**Shared Information:**
- Incident timeline (single source of truth)
- Communication approval workflow
- Regulatory deadline tracking

**Handoff Points:**
1. Technical findings → Communications (before public statement)
2. Legal requirements → Both tracks (notification deadlines)
3. Attribution results → Communications (for external statements)

**War Room Protocol:**
- Regular sync cadence: Every [2/4/8] hours
- Escalation: Any team can trigger immediate sync
- Documentation: Shared crisis log at `{output_folder}/crisis/war-room-log.md`"

### 4. Activate Cross-Module Party

**User decision:**

"Based on the assessment, I recommend activating cross-module coordination.

**Select:**
[1] Activate `crisis-response-party` - Full cross-functional team
[2] Activate `incident-war-room` - Security incident focus
[3] Launch parallel Incident Response (Mode B) + continue here
[4] Skip - Continue with Strategy team only

Choice:"

#### Handling:
- IF 1: Load crisis-response-party preset, invoke party mode with all agents
- IF 2: Load incident-war-room preset, invoke party mode
- IF 3: Note parallel IR activation, establish sync protocol, continue to step-02
- IF 4: Continue to step-02 without cross-module activation

### 5. Document Cross-Module Decisions

**Append to {outputFile}:**

```markdown
## Cross-Module Coordination

**Activated:** [preset name or "None"]
**Parallel Tracks:** [Yes/No]

**Cross-Module Team:**
| Agent | Module | Role in Crisis |
|-------|--------|----------------|
| [name] | [module] | [role] |

**Coordination Protocol:**
- Sync Cadence: [X hours]
- Shared Documentation: [path]
- Escalation Contact: [name/role]

**Key Handoff Points:**
1. [handoff description]
2. [handoff description]
```

### 6. Continue to Immediate Actions

After cross-module coordination is established (or skipped), load and follow `{nextStepFile}` (step-02-immediate-actions.md).

---

## BIDIRECTIONAL LINK WITH INCIDENT RESPONSE

**If this crisis was triggered FROM Incident Response Mode B:**
- The Incident Commander has already established technical containment
- Focus here on communications, stakeholders, and recovery
- Do not duplicate technical response actions

**If this crisis triggers Incident Response Mode B:**
- Technical response runs in parallel
- Establish clear handoff for communication timing
- Phoenix coordinates between tracks

---

## SUCCESS METRICS:

- Cross-module need assessed within 5 minutes
- Appropriate preset selected based on crisis dimensions
- Parallel tracks established with clear coordination protocol
- All stakeholder communication flows through single approval point
- Regulatory deadlines tracked across all modules
