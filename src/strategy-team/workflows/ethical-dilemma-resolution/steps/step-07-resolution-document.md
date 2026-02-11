---
name: step-07-resolution-document
description: Complete the ethical resolution document

outputFile: '{output_folder}/ethics/ethical-resolution-{dilemma}.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 7: Resolution Document

## STEP GOAL

Complete the ethical resolution document, capturing the full reasoning process for future reference.

### Role Reinforcement

- You return to facilitator role
- Focus on documentation and completion
- Help user implement ethically
- Provide closure

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules

- Complete all document sections
- Capture dissenting considerations
- Provide implementation guidance
- Enable future reference

---

## EXECUTION PROTOCOLS

- Complete output document
- Add implementation guidance
- Capture lessons learned
- Provide closure and next steps

---

## Sequence of Instructions

### 1. Frame Document Completion

**Introduce final step:**

"We're now going to complete your ethical resolution document.

This document serves several purposes:

1. **Record** - Documents your reasoning for future reference
2. **Accountability** - Captures what you considered and why
3. **Guidance** - Helps with implementation
4. **Learning** - Enables reflection on the process

Let's complete the remaining sections."

### 2. Capture Dissenting Considerations

**Ensure dissent is recorded:**

"It's important to capture what you're giving up:

**What We're Sacrificing:**
[Values, interests, or outcomes being compromised]

**Ongoing Tensions:**
[Ethical tensions that remain even after the decision]

**What Could Make This Wrong:**
[Circumstances that would indicate this was the wrong choice]

**When to Revisit:**
[What would trigger reconsideration]

These aren't reasons to doubt your decision - they're honest acknowledgment of what genuine dilemmas require."

### 3. Implementation Guidelines

**Provide ethical implementation guidance:**

"How you implement matters as much as what you decide. Let's think through implementation:

**How to Execute Ethically:**

- How do you implement this decision in ways that honor the values you've chosen?
- What actions would undermine the ethical foundation of your choice?
- What safeguards should be in place?

**Communication Approach:**

- Who needs to know about this decision?
- How do you communicate it with integrity?
- What do affected parties deserve to hear?

**Monitoring:**

- What should you watch for that might indicate unintended consequences?
- When should you check whether this is working as intended?
- Who might give you early warning if things go wrong?"

### 4. Personal Reflection

**Capture learning:**

"Let's capture what this process revealed:

**What This Decision Says About Your Values:**
[What this choice reveals about what you prioritize]

**What You Learned:**
[Insights from this ethical reasoning process]

**How You'll Approach Similar Dilemmas:**
[Principles or approaches to carry forward]"

### 5. Complete Output Document

**Finalize the {outputFile}:**

Ensure all sections are complete:

- Executive Summary
- The Dilemma
- Values in Tension
- Stakeholder Impact Analysis
- Ethical Framework Analysis
- Traditional Wisdom (Burke)
- Justice Imperative (Charles)
- Principled Resolution (Jean-Luc)
- Dissenting Considerations
- Implementation Guidelines
- Personal Reflection

Update frontmatter:

- Add "step-07-resolution-document" to `stepsCompleted`
- Update `status: complete`

### 6. Final Summary

**Provide closure:**

"Your Ethical Resolution is complete.

**Executive Summary:**

**Dilemma:** [One sentence description]

**Core Tension:** [Value A] vs. [Value B]

**Resolution:** [Clear statement of decision]

**Key Rationale:** [Primary reasoning in 2-3 sentences]

**What's Sacrificed:** [What's being given up]

**Implementation Focus:** [Key implementation consideration]

---

**The process you followed:**

1. Framed the dilemma clearly
2. Mapped stakeholder impact
3. Applied five ethical frameworks
4. Considered traditional wisdom (Burke)
5. Confronted justice imperative (Charles)
6. Synthesized toward principled resolution (Jean-Luc)
7. Documented for future reference

This document represents careful ethical reasoning. It doesn't make you infallible, but it demonstrates good faith effort to do right in a difficult situation."

### 7. Present MENU OPTIONS

Display: "**Select:** [R] Revise Sections [E] Generate Executive Summary [P] Party Mode [X] Complete and Exit"

#### Menu Handling Logic

- IF R: Ask which section to revise, navigate there, then redisplay menu
- IF E: Generate 1-page executive summary version
- IF P: Execute {partyModeWorkflow}, then redisplay menu
- IF X: Confirm completion, provide final message, exit workflow

### 8. Completion Message

**When user selects [X]:**

"Your Ethical Resolution is complete.

**Output file:** {outputFile}

**Summary:**

- Dilemma: [Name]
- Resolution: [Option chosen]
- Key principle honored: [Primary value]

**Next steps:**

1. Implement the decision with integrity
2. Communicate to affected parties as planned
3. Monitor for unintended consequences
4. Revisit if circumstances change

**A final thought:**

Ethics isn't about always being right. It's about reasoning carefully, considering others, and having the courage to decide even when the answer isn't clear. You've done that work.

Whatever happens next, you can say you thought this through with care. That matters.

Go well."

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- Complete document with all sections
- Dissent captured honestly
- Implementation guidance provided
- Personal reflection included
- User has clear next steps
- Process honored throughout

### SYSTEM FAILURE

- Incomplete document
- Not capturing dissent
- No implementation guidance
- Rushing to closure
- Not honoring the difficulty

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
