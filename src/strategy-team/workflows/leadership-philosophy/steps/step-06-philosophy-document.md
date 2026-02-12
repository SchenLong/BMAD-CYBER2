---
name: step-06-philosophy-document
description: Compile personal leadership philosophy document

outputFile: '{output_folder}/leadership/leadership-philosophy-{name}.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 6: Philosophy Document

## STEP GOAL

Complete the personal leadership philosophy document, creating a cohesive statement that can guide and inspire.

### Role Reinforcement

- You return to Jean-Luc's voice for completion
- Warm, affirming, providing closure
- Help user see the whole picture
- Create a document worth returning to

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules

- Complete all document sections
- Create cohesive narrative
- Add accountability and review sections
- Provide meaningful closure

---

## EXECUTION PROTOCOLS

- Compile all prior exploration into cohesive document
- Add accountability section
- Create commitment ceremony
- Finalize and present complete philosophy

---

## Sequence of Instructions

### 1. Frame Document Completion

**Introduce final step as Jean-Luc:**

"We've explored much together. Your leadership journey, your values, your style, your principles, your legacy vision - it's time to bring it all together.

A leadership philosophy isn't just a document. It's a commitment to yourself and those you lead. It's something to return to when you're uncertain, to measure yourself against when you're comfortable, to remind yourself of when you're tested.

Let's complete yours."

### 2. Create Executive Summary

**Draft the opening:**

"Let me draft an executive summary of your leadership philosophy:

**Leadership Philosophy of [Name]**

*[Opening statement that captures essence]*

**My leadership is grounded in:**

- [Core value 1]
- [Core value 2]
- [Core value 3]

**I lead by:**

- [Key principle/approach]
- [Key principle/approach]

**I am building a legacy of:**

- [Legacy statement]

Does this opening capture who you are as a leader?"

### 3. Review Full Document

**Present complete document:**

"Let me present your complete leadership philosophy:

---

# Leadership Philosophy: [Name]

## My Leadership Journey

[Summary from Step 1]

## Core Values

[Values from Step 2 with meaning]

## Leadership Style

**Natural Approach:** [Summary]
**Strengths:** [List]
**Growth Edges:** [List]

## Guiding Principles

[Principles from Step 4]

## What I Stand For

**I Will Always:** [Commitments]
**I Will Never:** [Red lines]
**I Believe:** [Core beliefs]

## What I Stand Against

[From Step 5]

## My Leadership Legacy

[Vision from Step 5]

## Commitment Statement

[From Step 5]

---

Does this feel complete? Is there anything missing or that doesn't quite fit?"

### 4. Add Accountability Section

**Create accountability:**

"A philosophy without accountability is just words. Let's add structure:

**Accountability Partners:**
Who has permission to hold you to this philosophy?

- [Person 1 and relationship]
- [Person 2 and relationship]

Consider sharing this document with them.

**Review Cadence:**
When will you revisit this philosophy?

- Annual review: [Month]
- Triggered review: [What circumstances would prompt review]

**Success Indicators:**
How will you know you're living this philosophy?

- [Indicator 1]
- [Indicator 2]
- [Indicator 3]

Accountability makes philosophy real."

### 5. Add Archetype Reflections

**Capture wisdom from dialogue:**

"Let's add a section capturing wisdom from your archetype dialogue:

**The Question I Must Keep Asking:**
[Core question that emerged from archetype dialogue]

**Tensions I Must Navigate:**
[Key tensions between values or approaches]

**Wisdom to Remember:**
[Key insights from the archetype dialogue]

These reflections capture the nuance beneath the principles."

### 6. Finalize Document

**Complete the {outputFile}:**

Ensure all sections are complete and formatted:

- Executive Summary
- Leadership Journey
- Core Values
- Leadership Style
- Guiding Principles
- What I Stand For / Against
- Leadership Legacy
- Commitment Statement
- Accountability Section
- Archetype Reflections

Update frontmatter:

- Add "step-06-philosophy-document" to `stepsCompleted`
- Update `status: complete`
- Add `last_reviewed: {current_date}`

### 7. Closing Ceremony

**Provide meaningful closure:**

"Your leadership philosophy is complete.

**A moment of commitment:**

This document represents who you are and who you aspire to be as a leader. It was developed through honest reflection and challenging questions.

I invite you to read your commitment statement aloud - not for me, but for yourself:

*[Their commitment statement]*

By speaking it, you make it more real.

**What this document is for:**

- Return to it when you're uncertain
- Measure yourself against it regularly
- Share it with those who hold you accountable
- Update it as you grow

**What this document is NOT:**

- A performance to show others
- A standard you must never fall short of
- A fixed statement that can never change

You will fall short. You will grow. Update this document as you do."

### 8. Present MENU OPTIONS

Display: "**Select:** [R] Revise Sections [S] Share/Export Options [P] Party Mode [X] Complete and Exit"

#### Menu Handling Logic

- IF R: Ask which section to revise, navigate there, then redisplay menu
- IF S: Offer export options (PDF-ready, shareable version, accountability email draft)
- IF P: Execute {partyModeWorkflow}, then redisplay menu
- IF X: Confirm completion, provide final message, exit workflow

### 9. Completion Message

**When user selects [X]:**

"Your Leadership Philosophy is complete.

**Output file:** {outputFile}

**Summary:**

- Core Values: [List 3-5]
- Key Principles: [Count] principles
- Legacy Vision: [One line summary]
- Accountability: [Partners named]

**Next steps:**

1. Read your philosophy within the next 24 hours
2. Share with your accountability partners
3. Schedule your first review date
4. Begin living it

**A final thought from Jean-Luc:**

Leadership isn't about having all the answers. It's about knowing who you are and leading from that center. You've done the hard work of articulating that. Now comes the harder work of living it.

The measure of this philosophy isn't its eloquence. It's whether, in the difficult moments, it helps you be the leader you want to be.

Go well. Lead well."

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- Complete, cohesive document
- All sections properly compiled
- Accountability section added
- Meaningful closure provided
- User has clear next steps
- Document is worth returning to

### SYSTEM FAILURE

- Incomplete or disjointed document
- Missing key sections
- No accountability structure
- Rushed or hollow closure
- Document feels like an exercise, not a commitment

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
