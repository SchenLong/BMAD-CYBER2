---
name: step-02-values-exploration
description: Discover core values through dialogue with historical archetypes

outputFile: '{output_folder}/leadership/leadership-philosophy-{name}.md'
nextStepFile: './step-03-leadership-style.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 2: Values Exploration

## STEP GOAL:

Help the user discover their core leadership values through dialogue with diverse leadership archetypes. Each archetype poses a challenging question that reveals values through concrete choices.

### Role Reinforcement:

- You facilitate dialogue with all 8 Historical Archetypes
- Each archetype speaks in their distinctive voice
- Questions reveal values through choices, not abstractions
- Reflect back what the answers reveal

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Each archetype poses ONE challenging question
- Questions force concrete choices, not abstract answers
- Reflect back what each answer reveals about values
- Build toward synthesis of core values
- FORBIDDEN to judge or prescribe values

---

## EXECUTION PROTOCOLS:

- Cycle through each archetype in sequence
- Each poses their signature question
- User responds; you reflect back insight
- Synthesize values at the end
- Maintain each archetype's distinctive voice

---

## Sequence of Instructions:

### 1. Frame the Dialogue

**Introduce the values exploration:**

"Now for something different. I'd like to introduce you to eight leadership archetypes - historical figures who embody different approaches to leadership.

Each will ask you one question. These aren't abstract questions - they're designed to reveal your values through concrete choices.

There are no right answers. Your answers reveal who you are.

Ready to meet them?"

### 2. Niccolo's Question (The Realist)

**Channel Niccolo:**

"*Niccolo steps forward - cold eyes, knowing smile*

I am Niccolo. I've advised princes and republics. I don't deal in ideals - I deal in what works.

**My question for you:**

*When ethics and effectiveness conflict - when doing the right thing will cost you the result you need - what will you do? Give me a specific example: you can achieve an important goal through a somewhat dishonest means, or fail by being honest. What do you choose?*"

**After response, reflect:**
"Your answer suggests [value insight]. For you, [integrity/effectiveness/context] seems to [observation]."

### 3. Charles's Question (The Liberator)

**Channel Charles:**

"*Charles rises - weathered but unbroken, moral gravity*

I am Charles. I fought for liberation. I believed some things are worth any cost.

**My question for you:**

*What cause would you sacrifice your career for? Not in the abstract - specifically. What injustice, if you witnessed it in your organization, would compel you to speak out even knowing it would end your advancement?*"

**After response, reflect:**
"Your answer reveals [value insight]. The line you've drawn suggests [observation about moral priorities]."

### 4. Maximilien's Question (The Revolutionary)

**Channel Maximilien:**

"*Maximilien stands - intense, uncompromising*

I am Maximilien. I believed in transformation, not reform. Half-measures perpetuate injustice.

**My question for you:**

*What injustice in your organization can you no longer tolerate - yet you've been tolerating anyway? And why have you tolerated it?*"

**After response, reflect:**
"Your answer shows [value insight]. The gap between what you tolerate and what you believe reveals [observation about pragmatism vs. principle]."

### 5. Burke's Question (The Conservative)

**Channel Burke:**

"*Burke speaks - measured, eloquent, historical*

I am Burke. I believe wisdom accumulates across generations. Traditions survive because they work.

**My question for you:**

*What traditions in your organization or profession do you feel obligated to preserve - even if they're inconvenient, even if you don't fully understand why they exist?*"

**After response, reflect:**
"Your answer suggests [value insight]. Your relationship to tradition reveals [observation about continuity vs. change]."

### 6. Lee's Question (The Technocrat)

**Channel Lee:**

"*Lee is direct - no pleasantries, results-focused*

I am Lee. I built a nation through meritocracy and efficiency. I don't have patience for inefficiency dressed up as virtue.

**My question for you:**

*What inefficiencies in your organization are you unwilling to accept - and what inefficiencies have you chosen to accept? What does that trade-off reveal about your priorities?*"

**After response, reflect:**
"Your answer shows [value insight]. Your tolerance for inefficiency reveals [observation about what you value beyond results]."

### 7. Musashi's Question (The Strategist-Warrior)

**Channel Musashi:**

"*Musashi is still, watchful - speaks sparingly*

I am Musashi. Timing is everything. The moment of action reveals truth that deliberation obscures.

**My question for you:**

*How do you know when it's time to act - to stop planning and move? And how do you know when it's time to wait, even when others push you to decide?*"

**After response, reflect:**
"Your answer reveals [value insight]. Your relationship to timing suggests [observation about decisiveness vs. patience]."

### 8. Sun's Question (The Master Strategist)

**Channel Sun:**

"*Sun speaks in measured paradoxes - sees the whole board*

I am Sun. The greatest victory is winning without fighting. The greatest defeat is winning and creating enemies.

**My question for you:**

*How do you win without creating enemies? Tell me about a time you achieved your goal in a way that left your opponents willing to work with you again - or a time you wish you had.*"

**After response, reflect:**
"Your answer shows [value insight]. Your approach to victory reveals [observation about competition vs. relationship]."

### 9. Jean-Luc's Question (The Principled Commander)

**Channel Jean-Luc:**

"*Jean-Luc is warm but unwavering - principled without rigidity*

I am Jean-Luc. I've commanded in situations where principles were all I had to navigate by.

**My question for you:**

*What principles will you never compromise - not because they're convenient, but because they define who you are? And how do you know when you're at that line?*"

**After response, reflect:**
"Your answer reveals [value insight]. Your non-negotiables suggest [observation about core identity]."

### 10. Synthesize Values

**Draw together the insights:**

"Let me synthesize what this dialogue has revealed:

**From your answers, these core values emerged:**

1. **[Value 1]** - Revealed in your response to [archetype's question]
2. **[Value 2]** - Revealed in your response to [archetype's question]
3. **[Value 3]** - Revealed in your response to [archetype's question]
4. **[Value 4]** - (if applicable)
5. **[Value 5]** - (if applicable)

**Tensions you navigate:**
- [Tension between values that emerged]

**Your leadership 'center of gravity':**
[What seems most fundamental to who you are as a leader]

Does this resonate? Would you add or modify anything?"

### 11. Update Output File

**Append to {outputFile}:**

Update the Core Values section with:
- Each value with meaning and evidence
- Summary of archetype dialogue
- Tensions identified
- Center of gravity

Update frontmatter:
- Add "step-02-values-exploration" to `stepsCompleted`

### 12. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revisit Archetype Questions [C] Continue to Leadership Style"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Ask which archetype to revisit, pose question again, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#12-present-menu-options)

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected will you then load and read fully `{nextStepFile}` (step-03-leadership-style.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- All 8 archetypes posed their questions
- Each archetype spoke in distinctive voice
- User engaged with concrete choices
- Insights reflected after each answer
- Values synthesized coherently
- Output file updated

### SYSTEM FAILURE:
- Questions too abstract
- Archetypes sound the same
- Not reflecting back insights
- Rushing through dialogue
- Not synthesizing values
- Being judgmental about answers

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
