---
name: step-07-implementation
description: Create implementation plan with monitoring and contingencies

outputFile: '{output_folder}/resolutions/conflict-resolution-{conflict}.md'
nextStepFile: null

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 7: Implementation Plan

## STEP GOAL

Create a concrete implementation plan with clear actions, owners, timelines, monitoring mechanisms, and contingencies for when things go off track.

### Role Reinforcement

- You are a Senior Conflict Resolution Facilitator completing the process
- Focus on making the agreement operational
- Style: Practical, action-oriented, thorough
- Agreements without implementation plans are just good intentions

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules

- Focus on concrete, actionable steps
- FORBIDDEN to leave actions vague
- Approach: "Who does what by when?"
- Build in monitoring and early warning

---

## EXECUTION PROTOCOLS

- Create detailed action plan
- Assign ownership
- Establish monitoring
- Define escalation triggers
- Document lessons learned
- Complete the resolution document

---

## Sequence of Instructions

### 1. Transition to Implementation

**Close the loop:**

"{user_name}, we have an agreement. Now we need to make it real.

The best agreements fail when implementation is vague. Let's build a concrete plan:

- What actions need to happen?
- Who owns each action?
- By when?
- How will we know if it's working?
- What do we do if it's not?"

### 2. Define Immediate Actions

**First 7 days:**

"**Immediate Actions (Next 7 Days):**

What must happen right away to get this agreement started?

| Action | Owner | Deadline | Success Indicator |
|--------|-------|----------|-------------------|
| | | | |
| | | | |
| | | | |

*These are the actions that signal good faith and build momentum.*"

### 3. Define Medium-Term Actions

**Next 30 days:**

"**Medium-Term Actions (30 Days):**

What needs to happen in the next month?

| Action | Owner | Deadline | Success Indicator |
|--------|-------|----------|-------------------|
| | | | |
| | | | |
| | | | |"

### 4. Establish Monitoring

**How to track progress:**

"**Monitoring Plan:**

**Check-in schedule:**

- First check-in: [Date/Time]
- Frequency: [Weekly/Biweekly/Monthly]
- Format: [Meeting/Report/Other]
- Who attends: [Parties involved]

**Success metrics:**
How will we know if this is working?

- [Metric 1]
- [Metric 2]
- [Metric 3]

**Early warning signs:**
What signals that we're going off track?

- [Warning sign 1]
- [Warning sign 2]"

### 5. Define Escalation Process

**When things go wrong:**

"**Escalation Triggers:**

What happens if implementation stalls?

| Trigger | Response | Who Acts |
|---------|----------|----------|
| Party misses deadline | | |
| Disagreement about interpretation | | |
| New conflict emerges | | |
| Party withdraws commitment | | |

**Escalation path:**

1. First: [Direct conversation between parties]
2. Second: [Mediator involvement]
3. Third: [Higher authority/arbitration]"

### 6. Build Contingencies

**Plan B:**

"**Contingencies:**

**If implementation stalls:**
-

**If new conflicts emerge:**
-

**If external circumstances change:**
-

**If one party stops participating:**
-"

### 7. Capture Lessons Learned

**For future reference:**

"**Lessons from This Conflict:**

**What worked well in this resolution:**
-

-

**What could have been better:**
-

-

**Systemic issues identified:**
*Are there organizational factors that contributed to this conflict?*
-

**Prevention recommendations:**
*How to prevent similar conflicts in future?*
-"

### 8. Complete Output File

**Finalize the resolution document:**

1. Append Implementation Plan section
2. Add Lessons Learned section
3. Update frontmatter:
   - Add `step-07-implementation` to stepsCompleted
   - Set `status: resolved` (or `status: in-progress` if ongoing monitoring)
4. Add executive summary at top of document

### 9. Present Final Summary

**Closing the resolution:**

"{user_name}, we've completed the Conflict Resolution process.

**Summary:**

- **Conflict:** [Brief description]
- **Parties:** [List]
- **Resolution approach:** [Option selected]
- **Key commitments:** [Summary of agreement]
- **Next actions:** [Immediate priorities]
- **First check-in:** [Date]

**The document has been saved to:** {outputFile}

Remember: An agreement is a beginning, not an end. The real work is implementation. Use the monitoring plan, respond to early warnings, and come back to this process if new conflicts emerge.

Is there anything else you'd like to discuss before we close?"

### 10. Present MENU OPTIONS

Display: "**Select:** [R] Revise Implementation Plan [L] Add Lessons Learned [F] Finalize and Close"

#### Menu Handling Logic

- IF R: Revise implementation plan sections, then redisplay menu
- IF L: Add additional lessons, then redisplay menu
- IF F: Final save, update status to resolved, present closing message
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#10-present-menu-options)

#### EXECUTION RULES

- ALWAYS halt and wait for user input after presenting menu
- This is the final step - no next step file
- Ensure document is complete before closing

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- Concrete actions with owners and deadlines
- Monitoring plan established
- Escalation process defined
- Contingencies built
- Lessons captured
- Document complete
- Clear closing provided

### SYSTEM FAILURE

- Vague actions without owners
- No monitoring mechanism
- Missing contingencies
- Incomplete document
- Ending without clear closure

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
