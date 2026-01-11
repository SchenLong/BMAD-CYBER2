---
name: step-03-leadership-style
description: Assess natural leadership style and growth edges

outputFile: '{output_folder}/leadership/leadership-philosophy-{name}.md'
nextStepFile: './step-04-principles.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 3: Leadership Style

## STEP GOAL:

Help the user understand their natural leadership style - their default approach, their strengths, and their growth edges.

### Role Reinforcement:

- You return to facilitator role
- Curious, reflective, helping user see themselves clearly
- Balance affirmation with honest observation
- Focus on self-awareness, not prescription

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Explore natural style without judgment
- Identify both strengths and growth edges
- Consider situational flexibility
- Ground observations in concrete examples
- FORBIDDEN to prescribe a "right" style

---

## EXECUTION PROTOCOLS:

- Explore default leadership approach
- Identify signature strengths
- Acknowledge growth edges honestly
- Consider situational adaptation
- Build self-awareness

---

## Sequence of Instructions:

### 1. Frame Style Exploration

**Introduce the topic:**

"Now let's look at your leadership style - how you naturally lead when you're not consciously thinking about it.

Style isn't about right or wrong. Every effective leader has their own approach. The goal is self-awareness - knowing your defaults so you can leverage your strengths and stretch when needed.

Let's explore."

### 2. Explore Default Approach

**Ask:**

"Think about how you lead when you're not thinking about it:

**When you walk into a meeting you're leading, what's your natural first move?**
- Set the agenda and drive toward decisions?
- Open the floor and listen first?
- Check in on people before getting to business?
- Get right to the problem to be solved?

**When someone brings you a problem, what's your instinct?**
- Jump to solving it?
- Ask questions to understand?
- Coach them through their own solution?
- Empathize first, solve second?

**When there's conflict on your team, what's your default?**
- Address it directly?
- Let people work it out?
- Mediate between parties?
- Avoid it and hope it resolves?

What do these defaults tell you about your style?"

### 3. Identify Signature Strengths

**Explore:**

"Every leader has signature strengths - things you do better than most:

**What do people consistently come to you for?**
- What kind of help do they seek?
- What role do they expect you to play?

**What feedback have you received repeatedly?**
- What do people praise about your leadership?
- What's the consistent theme?

**When are you 'in the zone' as a leader?**
- What situations bring out your best?
- What kind of challenges energize you?

**What's your superpower?**
- If you had to name one thing you do better than most leaders, what is it?"

### 4. Acknowledge Growth Edges

**Probe honestly:**

"Now the harder question - where are your growth edges?

**What feedback have you received (or avoided receiving) about your blind spots?**

**When do you struggle as a leader?**
- What situations drain you?
- What kind of people are difficult for you to lead?
- What leadership tasks do you avoid or delegate away?

**What would your team say you should do more of? Less of?**

**What's the shadow side of your strengths?**
- Every strength has a shadow - what's yours?
- (e.g., Decisiveness → Steamrolling; Empathy → Avoiding hard conversations)

Be honest here. Self-awareness requires acknowledging the full picture."

### 5. Explore Situational Flexibility

**Ask:**

"Effective leaders adapt their style to the situation. Let's explore your flexibility:

**When do you consciously shift your style?**
- What triggers you to lead differently than your default?
- How do you adapt for different people?

**What styles do you struggle to adopt?**
- What approaches feel unnatural or uncomfortable?
- What leadership behaviors do you admire in others but struggle to emulate?

**How do you stretch?**
- When have you successfully led outside your comfort zone?
- What helped you do that?"

### 6. Leadership Style Summary

**Synthesize:**

"Let me summarize your leadership style:

**Natural Approach:**
[Summary of default style]

**Signature Strengths:**
1. [Strength 1]
2. [Strength 2]
3. [Strength 3]

**Growth Edges:**
1. [Edge 1]
2. [Edge 2]
3. [Edge 3]

**Shadow Side:**
[The shadow of their strengths]

**Situational Flexibility:**
[Where they adapt well; where they struggle]

**Development Focus:**
[One or two areas that seem most important for growth]

Does this capture your leadership style accurately?"

### 7. Update Output File

**Append to {outputFile}:**

Update the Leadership Style section with:
- Natural approach
- Signature strengths
- Growth edges
- Shadow sides
- Situational flexibility
- Development focus

Update frontmatter:
- Add "step-03-leadership-style" to `stepsCompleted`

### 8. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Style Assessment [C] Continue to Principles"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#8-present-menu-options)

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected will you then load and read fully `{nextStepFile}` (step-04-principles.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Default style explored concretely
- Strengths identified with evidence
- Growth edges acknowledged honestly
- Shadow side recognized
- Situational flexibility assessed
- Self-awareness deepened

### SYSTEM FAILURE:
- Superficial or flattering assessment
- Not exploring growth edges honestly
- Abstract discussion without examples
- Prescribing a "right" style
- Not recognizing shadow sides

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
