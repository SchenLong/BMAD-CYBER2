---
name: step-06-deck-outline
description: Compile slide-by-slide presentation outline with visuals and speaker notes

outputFile: '{output_folder}/presentations/presentation-outline-{topic}.md'
nextStepFile: null
agentRosterFile: '{project-root}/_bmad/exec-ops/workflows/_shared/agent-roster.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 6: Deck Outline

## STEP GOAL:

Compile all previous work into a complete slide-by-slide presentation outline with recommended visuals, key messages, and speaker notes.

### Role Reinforcement:

- You return to Facilitator role, synthesizing all advisor input
- Draw on Joseph's narrative, Augustus's evidence, Cicero's Q&A prep
- Focus on practical, actionable slide guidance
- Create a document the presenter can use to build the actual deck

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on translating previous work into slides
- FORBIDDEN to add new content - synthesize what we have
- Approach: Practical, visual, presenter-friendly
- Ensure timing and flow are realistic

---

## EXECUTION PROTOCOLS:

- Return to Facilitator role
- Synthesize all previous steps into slide structure
- Recommend visuals for each slide
- Provide speaker notes with talking points
- Include timing guidance
- FORBIDDEN to create generic slides - each must reflect the specific content developed

---

## CONTEXT BOUNDARIES:

- Available context: All content from Steps 1-5
- Focus: Slide structure, visuals, speaker notes
- Limits: We create the outline, not the actual slides
- Dependencies: Steps 1-4 complete (Step 5 optional)

---

## Sequence of Instructions:

### 1. Synthesis Introduction

**Return to facilitator role:**

"{user_name}, we've done the hard work: audience analysis, narrative design, evidence assembly, Q&A preparation, and stress testing.

Now let's translate all of this into a practical slide-by-slide outline. For each slide, I'll provide:
- The key message (one idea per slide)
- Recommended visual
- Speaker notes with talking points
- Timing guidance

Let's build your deck."

### 2. Determine Slide Count and Timing

**Establish parameters:**

"Based on your time allocation of [X minutes], I recommend:

| Section | Slides | Time | Cumulative |
|---------|--------|------|------------|
| Opening (Hook + Agenda) | 2 | [X] min | [X] min |
| Problem/Context | 2-3 | [X] min | [X] min |
| Key Findings/Journey | 3-4 | [X] min | [X] min |
| Recommendation | 2 | [X] min | [X] min |
| Ask/Next Steps | 1-2 | [X] min | [X] min |
| Buffer for Q&A | - | [X] min | [X] min |
| **Total** | **~12** | **[X] min** | |

Does this structure work? Want to adjust any section?"

### 3. Build Title Slide

**Slide 1:**

"### Slide 1: Title

**Visual:** Clean title slide with:
- Presentation title: [from narrative]
- Subtitle: [one-line hook or date]
- Presenter name(s)
- Date
- [Optional: Company/division logo]

**Key Message:** Set the tone - professional, confident, prepared

**Speaker Notes:**
- Arrive at slide already displayed
- 'Good [morning/afternoon]. Thank you for your time today.'
- 'In the next [X] minutes, I'll share [one-sentence summary]'

**Timing:** ~30 seconds"

### 4. Build Agenda Slide

**Slide 2:**

"### Slide 2: Agenda / Roadmap

**Visual:** Simple 3-4 item agenda or visual roadmap
- [Section 1]
- [Section 2]
- [Section 3]
- [Q&A]

**Key Message:** We're organized and won't waste your time

**Speaker Notes:**
- 'Here's what we'll cover today'
- 'I'll aim to leave [X] minutes for questions'
- 'Feel free to interrupt if anything needs clarification'

**Timing:** ~30 seconds"

### 5. Build Hook/Problem Slides

**Slides 3-4:**

"### Slide 3: The Hook

**Visual:** [Based on narrative - could be]:
- A surprising statistic (big number, full screen)
- A provocative question
- A brief story image
- A competitive comparison

**Key Message:** [Hook from narrative arc]

**Speaker Notes:**
[Talking points from Joseph's narrative]
- Opening line: '[exact hook phrasing]'
- Pause for effect
- Transition: '[bridge to problem]'

**Timing:** ~1-2 minutes

---

### Slide 4: The Problem/Context

**Visual:**
- Problem visualization (trend line, gap analysis, risk matrix)
- Or: Key contextual data from Augustus

**Key Message:** Why this matters now

**Speaker Notes:**
- 'Here's the situation we're facing...'
- [Key data point from Augustus]
- 'This is why we need to act...'
- Transition: 'So what did we learn?'

**Timing:** ~2 minutes"

### 6. Build Key Findings Slides

**Slides 5-7:**

"### Slide 5: Key Finding 1

**Visual:** [From Augustus's evidence package]
- Chart/graph showing [data]
- Or: Benchmark comparison

**Key Message:** [Key message 1 from narrative]

**Speaker Notes:**
- 'Our analysis revealed three key findings. First...'
- [Supporting evidence and source]
- [Soundbite version]

**Timing:** ~2 minutes

---

### Slide 6: Key Finding 2

**Visual:** [From Augustus's evidence package]

**Key Message:** [Key message 2 from narrative]

**Speaker Notes:**
- 'Second, we found that...'
- [Supporting evidence]
- [Bridge to next point]

**Timing:** ~2 minutes

---

### Slide 7: Key Finding 3

**Visual:** [From Augustus's evidence package]

**Key Message:** [Key message 3 from narrative]

**Speaker Notes:**
- 'And third, perhaps most importantly...'
- [Supporting evidence]
- Transition: 'So what do we recommend?'

**Timing:** ~2 minutes"

### 7. Build Recommendation Slides

**Slides 8-9:**

"### Slide 8: The Recommendation

**Visual:**
- Clear statement of recommendation
- Could include: Summary table, decision matrix, or simple text

**Key Message:** [The solution from narrative arc]

**Speaker Notes:**
- 'Based on this analysis, we recommend...'
- [The one-sentence story]
- 'Here's what this would look like...'

**Timing:** ~2 minutes

---

### Slide 9: Implementation / What It Takes

**Visual:**
- Timeline or roadmap
- Resource requirements
- Key milestones

**Key Message:** This is achievable and we know how

**Speaker Notes:**
- 'Here's how we would execute...'
- 'The key milestones are...'
- 'The investment required is...'
- Transition: 'Which brings me to what we need from you'

**Timing:** ~2 minutes"

### 8. Build Ask/Close Slides

**Slides 10-11:**

"### Slide 10: The Ask

**Visual:**
- Clear, specific request
- Timeline for decision
- Immediate next step

**Key Message:** Here's exactly what we need

**Speaker Notes:**
- 'What we're asking for today is...'
- 'The timeline is...'
- 'The immediate next step would be...'
- [One-sentence story repeated]

**Timing:** ~1 minute

---

### Slide 11: Q&A / Discussion

**Visual:**
- Simple 'Questions?' or 'Discussion'
- Optional: Summary of key points
- Contact information

**Key Message:** We're prepared and confident

**Speaker Notes:**
- 'I'd welcome your questions and input'
- [Remember bridge-backs from Cicero]
- [Reference Q&A prep for anticipated questions]

**Timing:** [Remaining time]"

### 9. Appendix Planning

**Additional slides as needed:**

"### Appendix Slides (Have Ready, Don't Present)

Based on Q&A prep, have these backup slides ready:

**Appendix A: Detailed Financials**
- For: Financial deep-dive questions
- Contains: [specific data from Augustus]

**Appendix B: Risk Analysis**
- For: Risk-related challenges
- Contains: [risk mitigation details]

**Appendix C: Competitive Analysis**
- For: Competitive questions
- Contains: [benchmark data]

**Appendix D: Implementation Details**
- For: Execution questions
- Contains: [timeline, resources, milestones]

Label slides clearly (A1, A2, B1, etc.) for quick navigation."

### 10. Final Review and Logistics

**Wrap up with practical guidance:**

"### Pre-Presentation Checklist

- [ ] Audience analysis reviewed
- [ ] Narrative arc memorized
- [ ] Key evidence points committed to memory
- [ ] Q&A responses rehearsed
- [ ] Slides finalized
- [ ] Technology tested
- [ ] Backup copies prepared
- [ ] Timing rehearsed
- [ ] Opening/closing memorized
- [ ] Handouts ready (if applicable)

### Presenter Roles (if multiple presenters)

| Section | Presenter | Notes |
|---------|-----------|-------|
| [section] | [name] | [transition cue] |

### Day-Of Reminders

- Arrive early to test technology
- Have backup on USB and email
- Know your first and last lines cold
- Breathe before you begin"

### 11. Update Output File

**Finalize {outputFile} with:**

- Complete slide-by-slide outline
- Timing table
- Appendix slide list
- Pre-presentation checklist
- Update frontmatter:
  - Add `step-06-deck-outline` to stepsCompleted
  - Set `status: complete`

### 12. Final Summary

**Deliver the completed outline:**

"{user_name}, your board presentation prep is complete.

**What you now have:**
- Audience analysis with board member profiles
- Narrative arc with emotional journey
- Evidence package with data and benchmarks
- Q&A preparation with hostile question responses
- [Archetype stress test results - if completed]
- Slide-by-slide outline with speaker notes

**Your presentation outline has been saved to:**
`{outputFile}`

**Final advice from the advisors:**

**Joseph:** 'Remember - one idea per slide. If you're explaining, you're losing.'

**Augustus:** 'Lead with evidence, but don't drown them in data. Less is more.'

**Cicero:** 'The Q&A is where you win or lose. Stay calm, bridge back, be honest when you don't know.'

Go make it happen."

### 13. Present FINAL MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Any Section [E] Export Summary [D] Done"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Specify section to revise, make edits, then redisplay menu
- IF E: Generate a condensed executive summary of the presentation prep
- IF D: Confirm completion and close workflow

#### EXECUTION RULES:
- ALWAYS halt and wait for user input after presenting menu
- This is the final step - no next step file
- User can continue refining or exit

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- All slides outlined with key messages
- Visuals recommended for each slide
- Speaker notes provided with talking points
- Timing is realistic and documented
- Appendix slides identified
- Checklist provided
- Output file complete with status: complete

### FAILURE:
- Generic slides not reflecting prior work
- Missing speaker notes
- Unrealistic timing
- No appendix planning
- Not integrating content from all prior steps
- Incomplete output file

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
