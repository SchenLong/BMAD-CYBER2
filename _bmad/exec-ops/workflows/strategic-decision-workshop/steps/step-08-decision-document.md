---
name: step-08-decision-document
description: Compile the final board-ready decision brief from all previous steps

outputFile: '{output_folder}/decisions/decision-brief-{topic}.md'
templateFile: '{project-root}/_bmad/exec-ops/workflows/_shared/templates/decision-brief-template.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 8: Decision Document

## STEP GOAL:

Compile all the work from previous steps into a comprehensive, board-ready decision brief with executive summary, full analysis, and clear recommendation.

### Role Reinforcement:

- ✅ You are the Senior Strategic Facilitator concluding the workshop
- ✅ This is the culmination - make it polished and actionable
- ✅ The document should stand alone for any reader
- ✅ Preserve dissenting views - don't whitewash disagreement
- ✅ Make the recommendation clear while respecting user's final authority

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- 🎯 Focus on synthesis and polish, not new analysis
- 🚫 FORBIDDEN to hide dissenting views or unresolved tensions
- 💬 Approach: Board-ready, executive summary first
- 📋 Ensure document is complete and actionable

---

## EXECUTION PROTOCOLS:

- Review all sections from steps 1-7
- Synthesize executive summary
- Formulate clear recommendation
- Preserve dissenting views
- Create risk register
- Define next steps
- Polish for board readiness

---

## Sequence of Instructions:

### 1. Workshop Conclusion

**The facilitator summarizes:**

"We've completed the Strategic Decision Workshop, {user_name}. We've:
- Framed the decision and mapped stakeholders ✓
- Gathered and assessed evidence ✓
- Analyzed stakeholder interests and power ✓
- Heard from all 8 archetype advisors ✓
- Debated and synthesized perspectives ✓
- Assessed ethical dimensions ✓
- Developed a communications plan ✓

Now let's compile this into a board-ready decision brief."

### 2. Draft Executive Summary

**Synthesize the executive summary:**

"Let me draft the executive summary - the most important section:

## Executive Summary

**Decision:** [Clear statement of what needs to be decided]

**Context:** [1-2 sentences on why this matters now]

**Analysis Summary:** [2-3 sentences on key findings from evidence and perspectives]

**Recommendation:** [Clear, actionable recommendation]

**Key Considerations:**
- [Consideration 1]
- [Consideration 2]
- [Consideration 3]

**Risk Level:** [Low/Medium/High] - [brief justification]

**Requested Action:** [What you want the reader to do]

---

Does this executive summary capture the essence? It should work as a standalone for busy executives."

### 3. Formulate Recommendation

**Crystallize the recommendation:**

"Based on the full analysis, here is the recommendation:

## Recommendation

**Primary Recommendation:**
[Clear statement of recommended course of action]

**Rationale:**
1. [Key reason 1 - evidence-based]
2. [Key reason 2 - stakeholder consideration]
3. [Key reason 3 - ethical alignment]

**Key Assumptions:**
This recommendation assumes:
- [Assumption 1]
- [Assumption 2]

**Contingency:**
If [assumption] proves wrong, we should [alternative approach].

**Confidence Level:** [High/Medium/Low] based on [evidence quality assessment]

---

{user_name}, does this recommendation reflect your thinking after our analysis? This is your decision - I'm synthesizing what we've learned."

### 4. Compile Risk Register

**Create risk register:**

"## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| [Risk from analysis] | H/M/L | H/M/L | [Mitigation from planning] | [TBD] |
| [Stakeholder risk] | H/M/L | H/M/L | [Mitigation] | [TBD] |
| [Implementation risk] | H/M/L | H/M/L | [Mitigation] | [TBD] |
| [Political risk] | H/M/L | H/M/L | [Mitigation] | [TBD] |
| [Reputational risk] | H/M/L | H/M/L | [Mitigation] | [TBD] |

**Overall Risk Assessment:** [Summary of risk posture]"

### 5. Document Dissenting Views

**Preserve disagreement:**

"## Dissenting Views

It's important to document where perspectives diverged:

**Areas of Agreement:**
All advisors agreed that:
- [Agreement 1]
- [Agreement 2]

**Unresolved Tensions:**
Despite synthesis efforts, genuine disagreement remains on:
- [Tension 1]: [Archetype A] argued [position] while [Archetype B] maintained [position]
- [Tension 2]: [Description]

**Minority Position:**
[Archetype] would dissent from the recommendation because [reason]. This view should be considered if [condition].

**What Could Change the Calculus:**
The recommendation should be revisited if:
- [Trigger 1]
- [Trigger 2]

---

These dissents are recorded not as weakness but as intellectual honesty. A decision that suppresses disagreement is brittle."

### 6. Define Next Steps

**Create action plan:**

"## Next Steps

### Immediate Actions (Next 48 hours)
| Action | Owner | Deadline |
|--------|-------|----------|
| [Action 1] | [TBD] | [Date] |
| [Action 2] | [TBD] | [Date] |

### Short-term Actions (Next 2 weeks)
| Action | Owner | Deadline |
|--------|-------|----------|
| [Action 1] | [TBD] | [Date] |
| [Action 2] | [TBD] | [Date] |

### Communication Milestones
| Milestone | Date | Owner |
|-----------|------|-------|
| [Announcement] | [Date] | [TBD] |
| [Follow-up] | [Date] | [TBD] |

### Decision Points
| Decision | Needed By | Escalation Path |
|----------|-----------|-----------------|
| [Decision 1] | [Date] | [Path] |"

### 7. Final Document Review

**Review and polish:**

"Let me now compile the full document. I'll ensure:

**Completeness Check:**
- [ ] Executive Summary - clear and standalone
- [ ] Decision Context - background and framing
- [ ] Evidence & Analysis - data and findings
- [ ] Stakeholder Analysis - interests and power
- [ ] Perspectives Considered - all 8 archetypes
- [ ] Options Analysis - with trade-offs
- [ ] Recommendation - clear with rationale
- [ ] Ethical Considerations - values and impacts
- [ ] Risk Register - comprehensive
- [ ] Dissenting Views - preserved
- [ ] Communications Plan - stakeholder messaging
- [ ] Next Steps - actionable

**Quality Check:**
- [ ] Can stand alone (no context needed)
- [ ] Board-ready formatting
- [ ] Clear, actionable language
- [ ] Honest about uncertainties

The full document is available at: `{outputFile}`"

### 8. Final Update to Output File

**Complete the document:**

- Ensure all sections are populated from steps 1-7
- Add executive summary at the top
- Add recommendation section
- Add risk register
- Add dissenting views
- Add next steps
- Update frontmatter:
  - Add `step-08-decision-document` to stepsCompleted
  - Set `status: complete`
- Add document history with completion date

### 9. Workshop Closing

**Close the workshop:**

"The Strategic Decision Workshop is complete, {user_name}.

**Your decision brief is ready at:**
`{outputFile}`

**What we accomplished:**
- Comprehensive decision framing
- Evidence-based analysis
- 14-advisor perspective review
- Ethical assessment
- Communications planning
- Board-ready documentation

**The decision remains yours.** The council has advised; the choice is yours to make.

**Final wisdom from the council:**
- *Niccolo:* 'Fortune favors the prepared - and you are now prepared.'
- *Jean-Luc:* 'Make it so - but make it something you'll be proud of.'

Good luck, {user_name}."

### 10. Present FINAL MENU OPTIONS

Display: "**Select:** [R] Revise a Section [E] Export/Share Options [N] Start New Workshop [X] Exit Workshop"

#### Menu Handling Logic:
- IF R: Ask which section to revise, make revisions, save to file
- IF E: Offer export options (the file is already saved; could discuss sharing)
- IF N: Clear context, return to step-01-init.md
- IF X: Confirm exit, save final state

#### EXECUTION RULES:
- Workshop is complete - these are wrap-up options
- Document is already saved to {outputFile}
- Celebrate the completion!

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- All sections compiled into coherent document
- Executive summary is standalone and clear
- Recommendation is explicit
- Dissenting views preserved
- Risk register complete
- Next steps defined
- Document is board-ready
- Status set to complete

### ❌ SYSTEM FAILURE:
- Missing sections
- Whitewashing disagreement
- Vague recommendation
- No next steps
- Not setting status to complete
- Document not saved

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
