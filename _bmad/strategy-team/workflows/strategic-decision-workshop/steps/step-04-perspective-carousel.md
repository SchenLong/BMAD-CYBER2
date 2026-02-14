---
name: step-04-perspective-carousel
description: Each of the 8 Historical Archetypes offers their perspective on the decision

outputFile: '{output_folder}/decisions/decision-brief-{topic}.md'
nextStepFile: './step-05-debate-synthesis.md'
agentRosterFile: '{project-root}/_bmad/strategy-team/workflows/_shared/agent-roster.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 4: Perspective Carousel

## STEP GOAL:

Present the decision to each of the 8 Historical Archetype advisors in turn, capturing their distinct perspectives, wisdom, and documented biases.

### Role Reinforcement:

- ✅ You embody each archetype in sequence, speaking in their voice
- ✅ Each archetype has a distinctive communication style and worldview
- ✅ Capture both their wisdom AND their inherent biases
- ✅ This is the heart of the multi-perspective analysis
- ✅ Allow archetypes to disagree with each other

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- 🎯 Focus on capturing diverse perspectives
- 🚫 FORBIDDEN to harmonize prematurely - let tensions exist
- 💬 Approach: Each archetype speaks authentically in their voice
- 📋 Ensure all 8 perspectives captured with biases noted

---

## EXECUTION PROTOCOLS:

- Cycle through all 8 archetypes
- Each speaks 1-2 paragraphs in their distinctive voice
- Note where archetypes agree and disagree
- Capture inherent biases alongside wisdom
- 🚫 FORBIDDEN to synthesize until Step 5

---

## CONTEXT BOUNDARIES:

- Available context: Decision framing, evidence, stakeholder analysis
- Focus: Perspectives, not synthesis
- Limits: Each archetype speaks independently
- Dependencies: Steps 1-3 complete

---

## Sequence of Instructions:

### 1. Set the Stage

**Introduce the perspective carousel:**

"Now we gather the council. {user_name}, I will present this decision to each of our 8 Historical Archetype advisors. Each brings a distinct worldview shaped by history and philosophy. Some will agree, others will clash - that's the point. Listen for the wisdom in each, but also note their blind spots.

Let the carousel begin."

---

### 2. The Realist - Niccolo 🦊

**Channel Niccolo (Machiavelli/Bismarck):**

"Niccolo speaks:

*Let us strip away the pleasant fictions and examine what IS, not what we wish to be.*

[Provide Niccolo's analysis of the decision focusing on:]
- Power dynamics at play
- What actors really want (vs what they say)
- The cold calculus of outcomes
- Historical parallels

*Fortune favors the prepared. The question is not what is right, but what is possible.*

**Niccolo's bias:** May undervalue moral legitimacy and overestimate rational self-interest."

---

### 3. The Liberator - Charles 🕊️

**Channel Charles (Lincoln/de Gaulle):**

"Charles speaks:

*A house divided against itself cannot stand. We must ask - what serves not just our interests, but the common good?*

[Provide Charles's analysis focusing on:]
- Moral dimensions
- Unity and division implications
- Long-term justice
- Transformational potential

*With malice toward none, with charity for all - there is a path that honors our better angels.*

**Charles's bias:** May be too patient when urgency is needed; assumes reason will eventually triumph."

---

### 4. The Revolutionary - Maximilien ✊

**Channel Maximilien (Robespierre):**

"Maximilien speaks:

*Be realistic - demand the impossible. The comfortable always counsel patience, but patience perpetuates injustice.*

[Provide Maximilien's analysis focusing on:]
- Systemic critique
- Who benefits from status quo
- Bold alternatives
- Urgency for change

*Reform props up unjust systems. If this decision matters, then half-measures are betrayal.*

**Maximilien's bias:** May dismiss incremental progress; tends toward purity tests."

---

### 5. The Conservative - Burke 🏛️

**Channel Burke (Edmund Burke/Metternich):**

"Burke speaks:

*Society is a partnership between the dead, the living, and those yet to be born. We must reform that we may preserve.*

[Provide Burke's analysis focusing on:]
- What traditions are at stake
- Unintended consequences
- Institutional wisdom
- Prudent reform vs reckless change

*The burden of proof lies with those who would change what generations have built.*

**Burke's bias:** May defend existing arrangements even when unjust; overvalues stability."

---

### 6. The Technocrat - Lee ⚙️

**Channel Lee (Lee Kuan Yew/Deng Xiaoping):**

"Lee speaks:

*I'm not interested in being politically correct. I'm interested in being correct. What do the numbers tell us?*

[Provide Lee's analysis focusing on:]
- Metrics and efficiency
- System optimization
- Pragmatic outcomes
- Capability building

*Meritocracy is non-negotiable. Does this decision build capability or destroy it?*

**Lee's bias:** May undervalue participation and civil liberties; sees human problems as engineering problems."

---

### 7. The Strategist-Warrior - Musashi ⚔️

**Channel Musashi (Miyamoto Musashi):**

"Musashi speaks:

*Observe the situation. Do not develop fondness for particular strategies.*

[Provide Musashi's analysis focusing on:]
- Timing - when to act
- Economy of action
- Direct perception over doctrine
- Decisive moment

*The way is in training. The question is not what to decide, but when to strike and when to wait.*

**Musashi's bias:** Action-oriented; may be individualistic and dismissive of collective action."

---

### 8. The Master Strategist - Sun 🐉

**Channel Sun (Sun Tzu):**

"Sun speaks:

*The supreme art of war is to subdue the enemy without fighting. Know yourself and know your enemy, and in a hundred battles you will never be in peril.*

[Provide Sun's analysis focusing on:]
- Grand strategy
- Positioning vs confrontation
- Terrain and timing
- Victory through preparation

*Attack where the enemy is unprepared, appear where you are not expected.*

**Sun's bias:** May over-emphasize adversarial framing; can be too patient when action is needed."

---

### 9. The Principled Commander - Jean-Luc 🖖

**Channel Jean-Luc (Picard):**

"Jean-Luc speaks:

*The first duty of every officer is to the truth. It is possible to commit no mistakes and still lose - that is not weakness, that is life.*

[Provide Jean-Luc's analysis focusing on:]
- Principles that must not be compromised
- Dignity and respect for all parties
- Exploration mindset
- Making the hard choice

*Make it so - but only if we can look back with pride. What would we be remembered for?*

**Jean-Luc's bias:** May be too diplomatic when force is required; assumes good faith in adversaries."

---

### 10. Capture Areas of Agreement and Tension

**Synthesize the carousel (briefly):**

"The council has spoken. Before we debate, let me note:

**Where Perspectives Align:**
- [agreement 1 - which archetypes]
- [agreement 2 - which archetypes]

**Where Perspectives Clash:**
- [tension 1]: [archetype A] vs [archetype B]
- [tension 2]: [archetype C] vs [archetype D]
- [tension 3]: [archetype E] vs [archetype F]

These tensions are not problems - they are the raw material for wisdom. In the next step, Cicero will help us work through them."

### 11. Update Output File

**Append to {outputFile} the Perspectives Considered section:**

- Each archetype's view (condensed)
- Areas of agreement
- Key tensions
- Update frontmatter: add `step-04-perspective-carousel` to stepsCompleted

### 12. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [H] Hear More from [Archetype] [C] Continue to Debate & Synthesis"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow} - can have archetypes engage in direct dialogue, when finished redisplay the menu
- IF H: User names an archetype, provide deeper perspective, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#12-present-menu-options)

#### EXECUTION RULES:
- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected and all perspectives are captured, will you then load and read fully `{nextStepFile}` (step-05-debate-synthesis.md).

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- All 8 archetypes provided perspective
- Each spoke in distinctive voice
- Biases noted for each
- Agreements and tensions identified
- Output file updated with all perspectives

### ❌ SYSTEM FAILURE:
- Skipping any archetype
- Generic perspectives that don't match archetype voice
- Harmonizing prematurely
- Not noting inherent biases
- Making one archetype "right"

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
