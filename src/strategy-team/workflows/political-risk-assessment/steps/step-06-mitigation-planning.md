---
name: step-06-mitigation-planning
description: Develop mitigation strategies for priority political risks

outputFile: '{output_folder}/risk/political-risk-{initiative}.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 6: Mitigation Planning

## STEP GOAL

Develop practical mitigation strategies for priority political risks and create an actionable plan to reduce political exposure.

### Role Reinforcement

- You draw on all advisors for this final step
- Niccolo: Realistic about what's possible politically
- Magnus: Coalition and influence strategies
- Augustus: Evidence-based monitoring

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules

- Focus on Critical and High priority risks
- Strategies must be practical and actionable
- Consider political cost of mitigation itself
- Include monitoring and contingency planning

---

## EXECUTION PROTOCOLS

- Develop mitigation for priority risks
- Create actionable implementation plan
- Establish monitoring system
- Finalize assessment document
- Deliver clear recommendation

---

## Sequence of Instructions

### 1. Frame Mitigation Planning

**Introduce the task:**

"Now for the practical part - what do we do about these risks?

For each priority risk, we need:

1. **Prevention** - How do we reduce probability?
2. **Impact reduction** - How do we limit damage if it occurs?
3. **Contingency** - What's our response plan if it happens?
4. **Monitoring** - How do we detect it early?

Let's work through your critical and high-priority risks."

### 2. Mitigate Critical Risks

**For each Critical risk:**

"**Critical Risk: [Risk Name]**

**Prevention strategies:**

- What actions could reduce the probability of this risk?
- Who needs to be engaged differently?
- What relationships need strengthening?
- What early moves could defuse this?

**Impact reduction:**

- If this risk materializes, how do we limit the damage?
- What fallback positions do we have?
- How do we contain the blast radius?

**Contingency plan:**

- If prevention fails, what's our response?
- Who needs to be notified?
- What decisions need to be made quickly?
- What pre-positioned resources would help?

**Mitigation owner:**

- Who is responsible for executing this mitigation?
- What authority/resources do they need?

Let's develop a complete mitigation strategy for this risk."

### 3. Mitigate High Priority Risks

**For each High priority risk:**

Apply same framework but with lighter touch - focus on most impactful mitigations.

### 4. Assess Mitigation Costs

**For each mitigation strategy, ask:**

"Now let's be realistic about the cost of these mitigations:

| Mitigation | Effort | Political Cost | Opportunity Cost | Worth It? |
|------------|--------|----------------|------------------|-----------|
| [Strategy] | High/Med/Low | Does this spend political capital? | What else could we do instead? | Yes/No/Maybe |

Some mitigations aren't worth it:

- Too expensive for the risk reduced
- Create new risks
- Signal weakness
- Burn political capital needed elsewhere

Which mitigations should we prioritize? Which should we skip?"

### 5. Create Early Warning System

**Build monitoring plan:**

"Let's establish an early warning system:

| Risk | Indicator | Source | Frequency | Owner | Escalation Threshold |
|------|-----------|--------|-----------|-------|---------------------|
| [Risk] | [What to watch] | [Who/what provides signal] | Weekly/Monthly | [Who monitors] | [When to escalate] |

**Intelligence gathering:**

- Who should you be talking to regularly?
- What meetings should you attend/monitor?
- What informal channels provide early signal?

**Review cadence:**

- How often will you review this risk assessment?
- What would trigger an emergency review?"

### 6. Create Implementation Plan

**Build actionable plan:**

"Let's create an implementation plan:

**Immediate Actions (0-30 days):**

| Action | Owner | Due | Purpose |
|--------|-------|-----|---------|
| | | | |

**Medium-term Actions (30-90 days):**

| Action | Owner | Due | Purpose |
|--------|-------|-----|---------|
| | | | |

**Ongoing Activities:**

| Activity | Frequency | Owner |
|----------|-----------|-------|
| | | |

What's the single most important action to take this week?"

### 7. Final Recommendation

**Provide overall assessment:**

"Let me give you my final assessment:

**Overall Political Risk Level:** [Low / Moderate / Elevated / High / Critical]

**Key Risks Requiring Active Management:**

1. [Risk] - [One-line mitigation summary]
2. [Risk] - [One-line mitigation summary]
3. [Risk] - [One-line mitigation summary]

**Recommendation:**
[ ] **Proceed** - Political risks are manageable
[ ] **Proceed with Caution** - Significant risks require active management
[ ] **Delay** - Address specific risks before proceeding
[ ] **Reconsider** - Political risks may be prohibitive

**Key Conditions for Success:**

1. [Condition]
2. [Condition]
3. [Condition]

**Deal-Breakers (if these occur, reconsider the initiative):**

1. [Deal-breaker]
2. [Deal-breaker]

**Summary Statement:**
[One paragraph executive summary of political risk posture and recommendation]"

### 8. Finalize Output File

**Complete the {outputFile}:**

Update all remaining sections:

- Mitigation Plan
- Early Warning System
- Implementation Plan
- Recommendation
- Appendix with advisor assessments

Update frontmatter:

- Add "step-06-mitigation-planning" to `stepsCompleted`
- Update `status: complete`

### 9. Present MENU OPTIONS

Display: "**Select:** [R] Revise Sections [E] Export Summary [P] Party Mode [X] Complete and Exit"

#### Menu Handling Logic

- IF R: Ask which section to revise, navigate there, then redisplay menu
- IF E: Generate executive summary version (1-page)
- IF P: Execute {partyModeWorkflow}, then redisplay menu
- IF X: Confirm completion, summarize output file location, exit workflow

### 10. Completion Message

**When user selects [X]:**

"Your Political Risk Assessment is complete.

**Output file:** {outputFile}

**Summary:**

- [Number] political risks identified
- [Number] critical/high priority risks
- [Number] mitigation strategies developed
- Overall recommendation: [Proceed/Caution/Delay/Reconsider]

**Next steps:**

1. Review the assessment with your sponsor
2. Begin immediate mitigation actions
3. Establish monitoring cadence
4. Schedule reassessment in [timeframe]

This assessment should be treated as confidential - it contains frank political analysis that could be sensitive if shared broadly.

Good luck with your initiative."

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- Mitigation strategies for all priority risks
- Practical, actionable recommendations
- Clear monitoring system
- Honest overall recommendation
- Complete output document
- User has clear next steps

### SYSTEM FAILURE

- Vague or impractical mitigations
- No clear recommendation
- Missing implementation plan
- Incomplete output file
- Not delivering actionable guidance

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
