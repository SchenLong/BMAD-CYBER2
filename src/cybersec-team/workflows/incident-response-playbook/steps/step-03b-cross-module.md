---
name: step-03b-cross-module-activation
description: Cross-module party mode activation during guided incident response - activates legal, communications, and intelligence support

outputFile: '{output_folder}/security/incident-{incident_id}/incident-report.md'
returnToFile: './step-03b-containment.md'

# Cross-module integration
partyModePresetsFile: '{project-root}/_bmad/core/workflows/party-mode/presets/cross-module-groups.yaml'
crisisResponseWorkflow: '{project-root}/_bmad/strategy-team/workflows/crisis-response-planning/workflow.md'
---

# Step 3b: Cross-Module Activation (Mode B - Guided Execution)

## STEP GOAL

During active incident response, evaluate when to bring in cross-module expertise for legal obligations, communications, and threat intelligence support.

### Activation Triggers

This step should be invoked from Mode B (Guided Execution) when:

- Severity is HIGH or CRITICAL
- Personal data may be affected (GDPR/HIPAA implications)
- External communications may be required
- Threat actor attribution would be valuable
- Business impact requires executive awareness

---

## EXECUTION PROTOCOLS

### 1. Real-Time Assessment

**Evaluate while containment is in progress:**

"Phoenix here. While containment proceeds, I'm assessing cross-module needs:

**Current Incident Status:**

- Severity: [CRITICAL/HIGH/MEDIUM/LOW]
- Containment: [In Progress/Achieved/Partial]
- Data Impact: [Confirmed/Suspected/None]

**Cross-Module Triggers Detected:**

| Trigger | Status | Module Needed |
|---------|--------|---------------|
| Personal data affected | [Y/N] | Legal (GDPR/HIPAA) |
| Customer data affected | [Y/N] | Legal + Strategy |
| Public disclosure likely | [Y/N] | Strategy (Comms) |
| Regulatory notification | [Y/N] | Legal |
| Media attention | [Y/N] | Strategy (Comms) |
| Threat actor attribution | [Y/N] | Intel |
| Executive notification | [Y/N] | Strategy |"

### 2. Time-Critical Decisions

**If GDPR-relevant breach detected:**

"**CRITICAL DEADLINE ALERT**

GDPR Article 33 requires notification to supervisory authority within **72 hours** of becoming aware of a personal data breach.

Current time: [timestamp]
72-hour deadline: [calculated deadline]
Hours remaining: [X]

**Immediate Action Required:**

- [ ] Confirm if personal data is affected
- [ ] Document breach discovery timestamp
- [ ] Engage Legal team (Covenant) for notification assessment
- [ ] Begin drafting notification (do not send until legal review)

Recommend activating `legal-intake-party` or engaging Covenant directly NOW."

### 3. Party Mode Activation Options

**Present options based on triggers:**

"Based on the assessment, recommend cross-module support:

**Option 1: `incident-war-room` preset (FULL)**
Activates: Phoenix, Vector, Giuseppe, Covenant
Use when: Major incident with multiple dimensions

**Option 2: Legal consultation only**
Engage: Covenant for regulatory assessment
Use when: Data breach but communications not yet needed

**Option 3: Intelligence support only**
Engage: Vector + Cipher for attribution
Use when: Need threat actor context for response decisions

**Option 4: Activate parallel Crisis Response workflow**
Launch: crisis-response-planning workflow
Use when: Business impact requires dedicated communications track

**Option 5: Continue technical response only**
No cross-module activation
Use when: Contained incident, no external implications

**Select [1-5]:**"

### 4. Establish Coordination Protocol

**If cross-module activated:**

"Establishing incident war room coordination:

**Communication Cadence:**

- Technical updates: Every [1/2/4] hours to all participants
- Status sync: [time] daily
- Ad-hoc: Any participant can call immediate sync

**Information Flow:**

```
Technical Response (Phoenix)
    │
    ├──► Legal (Covenant) - breach scope, notification requirements
    │
    ├──► Intelligence (Vector) - IOCs for attribution, external intelligence
    │
    └──► Communications (Giuseppe) - for external statement coordination

All ──► Shared War Room Log: {output_folder}/security/incident-{incident_id}/war-room-log.md
```

**Decision Authority:**

- Technical containment: Phoenix (IC) decides
- Legal notifications: Covenant recommends, Executive approves
- Public statements: Giuseppe drafts, Legal + Executive approve
- Escalation: Anyone can escalate to Executive"

### 5. Handoff Points Definition

**Critical handoff moments:**

"**Handoff 1: Scope Determination → Legal**
When: Data impact scope determined
Action: Legal assesses notification obligations
Owner: Phoenix → Covenant

**Handoff 2: Attribution → Communications**
When: Threat actor attributed (or confirmed unknown)
Action: Inform public statement content
Owner: Vector → Giuseppe (via Phoenix)

**Handoff 3: Containment → Recovery**
When: Threat neutralized
Action: Begin recovery phase, update stakeholders
Owner: Phoenix → Full war room

**Handoff 4: Incident Closure → Lessons Learned**
When: Recovery complete
Action: Post-incident review with all parties
Owner: Phoenix coordinates all"

### 6. Document Activation

**Append to {outputFile}:**

```markdown
## Cross-Module Coordination Activated

**Timestamp:** [timestamp]
**Activated By:** Phoenix (Incident Commander)
**Reason:** [trigger reasons]

### War Room Participants
| Role | Agent | Module | Contact Protocol |
|------|-------|--------|------------------|
| Incident Commander | Phoenix | Cybersec | Lead |
| Legal Advisor | Covenant | Legal | On-call |
| Communications | Giuseppe | Strategy | On-call |
| Intelligence | Vector | Intel | On-call |

### Regulatory Deadlines
| Regulation | Deadline | Status | Owner |
|------------|----------|--------|-------|
| GDPR Art.33 | [72h from discovery] | [status] | Covenant |
| [Other] | [deadline] | [status] | [owner] |

### Coordination Protocol
- Sync cadence: [X hours]
- War room log: [path]
- Escalation: [protocol]
```

### 7. Return to Containment

After cross-module coordination is established, return to `{returnToFile}` (step-03b-containment.md) to continue technical response.

---

## BIDIRECTIONAL LINK WITH CRISIS RESPONSE

**Link to Crisis Response Planning:**
If business impact warrants dedicated communications track:

1. Launch `crisis-response-planning` workflow in parallel
2. Giuseppe coordinates between tracks
3. Technical facts flow to Crisis Response for communications
4. Communication approvals return to IC for timing coordination

**Shared Timeline:**
Both workflows contribute to single incident timeline
Location: `{output_folder}/security/incident-{incident_id}/timeline.md`

---

## SUCCESS METRICS

- Cross-module need assessed within 10 minutes of severity determination
- GDPR/regulatory deadlines identified and tracked
- Appropriate specialists engaged based on incident dimensions
- Clear handoff points established
- All external communications coordinated through single approval workflow
- War room log captures cross-module decisions
