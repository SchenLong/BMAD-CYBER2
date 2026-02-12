---
name: step-07-playbook
description: Compile the complete negotiation playbook with team roles and pre-negotiation checklist
outputFile: '{output_folder}/negotiations/negotiation-playbook-{party}.md'
nextStepFile: null
agentRosterFile: '{project-root}/_bmad/strategy-team/workflows/_shared/agent-roster.md'
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 7: Playbook Compilation

## STEP GOAL

Compile the complete negotiation playbook, assign team roles, create the pre-negotiation checklist, and deliver a ready-to-use document for the upcoming negotiation.

### Role Reinforcement

- You return to the Senior Negotiation Facilitator role
- Synthesize all advisor input into actionable guidance
- Focus on practical readiness
- The playbook must be usable at the table

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules

- Focus on compilation and practical preparation
- FORBIDDEN to introduce new analysis - synthesize what exists
- Approach: Make the playbook actionable and accessible
- Ensure nothing is left vague or theoretical

---

## EXECUTION PROTOCOLS

- Review all previous sections
- Assign team roles
- Create pre-negotiation checklist
- Add scenario planning
- Finalize the playbook
- FORBIDDEN to leave any section incomplete

---

## CONTEXT BOUNDARIES

- Available context: All analysis from Steps 1-6
- Focus: Synthesis and practical preparation
- Limits: Do not add new analysis, only compile and organize
- Dependencies: All previous steps complete

---

## Sequence of Instructions

### 1. Facilitator Returns

**Resume facilitator role:**

"We've completed our preparation journey, {user_name}. You've received insights from:

- Geneva on interests and finding common ground
- Magnus on power dynamics and leverage
- Cicero on arguments and rebuttals
- Sun and Musashi on timing and tactics
- Giuseppe on messaging and communication

Now let's compile everything into a single, actionable playbook you can take to the table."

### 2. Executive Summary

**Create the summary:**

"Let me draft the executive summary for your playbook:

**Negotiation:** [title/topic]
**Counterparty:** [who]
**Our objective:** [clear goal in one sentence]
**Recommended strategy:** [overall approach in 2-3 sentences]
**Key success factors:** [3-5 critical elements]
**Primary risk:** [biggest concern and mitigation]

This summary should fit on one page and orient anyone who needs a quick brief."

### 3. Assign Team Roles

**Define negotiation team:**

"Who will be in the room? Let's assign roles:

| Role | Person | Responsibilities |
|------|--------|------------------|
| Lead Negotiator | [name] | Primary speaker, relationship management, final decisions at table |
| Technical Expert | [name] | Data, details, evidence when needed, correct errors |
| Observer | [name] | Watch body language, take notes, track signals |
| Decision Maker | [name] | Final authority if escalation needed (may be Lead) |

**Signals system:**
How will the team communicate during negotiation?

- Need a break: [signal - e.g., 'Let me think about that']
- Agree to this: [signal]
- Don't agree: [signal]
- Need to caucus: [signal - e.g., 'Can we take 5 minutes?']

**Pre-negotiation huddle:**

- Time: [when to meet before]
- Review: [key points to cover]"

### 4. Pre-Negotiation Checklist

**Create the readiness checklist:**

"Complete this checklist before entering the negotiation:

**Preparation:**

- [ ] BATNA clearly defined and validated
- [ ] Walk-away point agreed by decision makers
- [ ] Key interests identified (ours and theirs)
- [ ] Power analysis reviewed
- [ ] Arguments prepared with evidence ready
- [ ] Anticipated counterarguments and rebuttals prepared
- [ ] Concession strategy agreed
- [ ] Opening statement practiced
- [ ] Key messages memorized (rule of three)

**Team:**

- [ ] Team roles assigned and understood
- [ ] Signals system confirmed
- [ ] Pre-negotiation huddle scheduled

**Logistics:**

- [ ] Venue confirmed and appropriate
- [ ] Materials prepared (documents, data, presentations)
- [ ] Timing confirmed (start time, expected duration, hard stops)
- [ ] Technology tested (if virtual)

**Mindset:**

- [ ] Reviewed their perspective and interests
- [ ] Prepared for hardball tactics
- [ ] De-escalation phrases reviewed
- [ ] Remember: relationship matters beyond this deal"

### 5. Quick Reference Card

**Create a one-page reference:**

"For use during the negotiation - fit on one page:

**Our Three Key Messages:**

1. [message 1]
2. [message 2]
3. [message 3]

**Their Likely Concerns:**

- [concern 1] → [our response]
- [concern 2] → [our response]

**Walk-Away Point:** [clear trigger]

**Concessions We Can Offer:**

- [item 1] - in exchange for [item]
- [item 2] - in exchange for [item]

**If Deadlocked:**

- [deadlock breaker option]

**Emergency Phrases:**

- To buy time: [phrase]
- To de-escalate: [phrase]
- To call break: [phrase]"

### 6. Post-Negotiation Planning

**Prepare for after:**

"Plan for what happens after the negotiation:

**If we reach agreement:**

- Documentation: [what to capture immediately]
- Follow-up: [next steps within 24-48 hours]
- Implementation: [how to ensure agreement sticks]
- Relationship: [how to maintain positive relationship]

**If no agreement:**

- Debrief: [what to discuss internally]
- Communication: [what to say to them]
- BATNA execution: [next steps on alternative]
- Door open?: [whether and how to leave room for future]

**Either way:**

- Lessons learned: [schedule debrief]
- Relationship maintenance: [follow-up regardless of outcome]"

### 7. Final Review and Validation

**Validate completeness:**

"Let me confirm the playbook is complete:

**Section Checklist:**

- [ ] Executive Summary
- [ ] Negotiation Context (parties, stakes, history, timeline)
- [ ] BATNA Analysis (ours and theirs)
- [ ] Interest Mapping (positions, interests, shared ground)
- [ ] Power Analysis (leverage, coalitions)
- [ ] Argument Arsenal (our arguments, their arguments, rebuttals)
- [ ] Tactical Options (timing, opening, concessions, deadlock breakers)
- [ ] Message Framework (opening, key messages, de-escalation)
- [ ] Scenario Planning (best/realistic/worst)
- [ ] Team Roles and Signals
- [ ] Pre-Negotiation Checklist
- [ ] Quick Reference Card
- [ ] Post-Negotiation Planning

**Missing anything?**"

### 8. Finalize Output File

**Complete the playbook:**

1. Review all sections in {outputFile}
2. Add Executive Summary at top
3. Add Team Roles section
4. Add Pre-Negotiation Checklist
5. Add Quick Reference Card
6. Add Post-Negotiation Planning
7. Update frontmatter:
   - `stepsCompleted: ["step-01-init", "step-02-interest-mapping", "step-03-power-analysis", "step-04-argument-arsenal", "step-05-tactical-options", "step-06-message-prep", "step-07-playbook"]`
   - `status: complete`
   - `completedDate: {current_date}`
8. Add Methodology note in appendix

### 9. Closing and Delivery

**Deliver the playbook:**

"Your negotiation playbook is complete, {user_name}.

**File location:** {outputFile}

**You are now prepared with:**

- Clear understanding of interests (yours and theirs)
- Honest assessment of power dynamics
- Strong arguments with rebuttals ready
- Tactical plan with timing and concessions
- Messaging framework you can deliver naturally
- Team roles and signals
- Checklist to ensure readiness

**Final advice from the advisory council:**

- Geneva: 'Seek to understand before seeking to be understood'
- Magnus: 'Know your leverage but use it wisely'
- Cicero: 'Let your evidence speak louder than your emotion'
- Sun: 'The supreme art is to subdue without conflict'
- Musashi: 'Observe the situation. Then act decisively.'
- Giuseppe: 'If you're explaining, you're losing'

Good luck in your negotiation. Preparation is the foundation of success."

### 10. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Section [E] Export/Print View [X] Complete Session"

#### Menu Handling Logic

- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow} for any final advisor input, when finished redisplay the menu
- IF R: Revise a specific section of the playbook, then redisplay menu
- IF E: Generate a clean export/print version of the playbook
- IF X: Confirm completion, save final file, and close session gracefully
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#10-present-menu-options)

#### EXECUTION RULES

- ALWAYS halt and wait for user input after presenting menu
- This is the final step - no next step to load
- User may iterate on revisions as needed
- Session ends when user selects 'X'

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- All playbook sections complete and populated
- Executive summary captures the essence
- Team roles assigned
- Pre-negotiation checklist actionable
- Quick reference card fits one page
- Post-negotiation planning included
- Playbook is practically usable

### SYSTEM FAILURE

- Sections left incomplete or vague
- No team roles assigned
- Checklist missing
- Quick reference too long
- Playbook theoretical rather than practical
- Final file not saved properly

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
