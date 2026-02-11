---
name: step-04-principles
description: Crystallize guiding principles that guide decisions and actions

outputFile: '{output_folder}/leadership/leadership-philosophy-{name}.md'
nextStepFile: './step-05-legacy-vision.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 4: Principles Crystallization

## STEP GOAL

Help the user crystallize guiding principles - the rules and commitments that guide their decisions and actions as a leader.

### Role Reinforcement

- You facilitate crystallization of principles
- Draw from values and experiences already explored
- Principles should be concrete and actionable
- Help user distinguish principles from aspirations

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules

- Principles should be specific enough to guide action
- Draw on what's been explored in prior steps
- Test principles against real scenarios
- Limit to 5-7 principles (more is less memorable)
- FORBIDDEN to prescribe principles

---

## EXECUTION PROTOCOLS

- Extract principles from values and experiences
- Help user articulate principles clearly
- Test principles against real scenarios
- Refine until actionable and memorable
- Include "I will always" and "I will never" commitments

---

## Sequence of Instructions

### 1. Frame Principles Development

**Introduce the task:**

"Values tell you what matters. Principles tell you what to do.

A guiding principle is specific enough that when you face a difficult decision, it helps you choose. 'Integrity matters' is a value. 'I tell people bad news directly rather than letting them discover it' is a principle.

Let's crystallize your guiding principles - the rules you lead by."

### 2. Extract from Journey and Values

**Mine prior exploration:**

"Looking at what you've shared about your journey and values, I see some principles emerging:

**From your journey:**
[Draw specific principles from their stories and experiences]

**From your values exploration:**
[Draw principles from how they answered archetype questions]

**From your style:**
[Draw principles that leverage strengths or address growth edges]

Do any of these feel like core principles for you? What would you add?"

### 3. Develop "I Will Always" Commitments

**Explore positive commitments:**

"Let's articulate what you commit to always doing:

**'I will always...'**

Think about:

- How you treat people
- How you make decisions
- How you communicate
- How you respond to challenges
- What you protect or prioritize

Complete these sentences:

1. 'I will always...' [first commitment]
2. 'I will always...' [second commitment]
3. 'I will always...' [third commitment]

What do you commit to doing, regardless of circumstances?"

### 4. Develop "I Will Never" Commitments

**Explore boundaries:**

"Now let's articulate your red lines - what you refuse to do:

**'I will never...'**

Think about:

- Behaviors you reject regardless of pressure
- Lines you won't cross even for results
- How you refuse to treat people

Complete these sentences:

1. 'I will never...' [first red line]
2. 'I will never...' [second red line]
3. 'I will never...' [third red line]

What do you refuse to do, regardless of circumstances?"

### 5. Develop Core Beliefs

**Articulate beliefs:**

"What do you believe about leadership, people, and organizations?

**'I believe...'**

Statements that ground your approach:

- About people (their nature, potential, motivation)
- About teams (how they work, what they need)
- About organizations (how they succeed, what matters)
- About leadership itself (what it's for, how it works)

What are 2-3 core beliefs that anchor your leadership?"

### 6. Test Principles

**Stress test against reality:**

"Let's test these principles against real situations:

**Scenario 1:** You're under pressure from above to deliver results quickly. One of your principles says [X]. How would that principle guide you?

**Scenario 2:** You need to give someone difficult feedback that might demoralize them. Your principles say [Y]. How does that play out?

**Scenario 3:** Two of your principles seem to conflict in this situation: [describe scenario]. Which takes precedence?

Do your principles hold up? Do they give clear guidance?"

### 7. Refine and Prioritize

**Finalize principles:**

"Let's refine your guiding principles into a clear, memorable set:

**My Guiding Principles:**

| # | Principle | Application | When Tested |
|---|-----------|-------------|-------------|
| 1 | | How it guides action | When this gets hard |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

Are these principles:

- Specific enough to guide action?
- Memorable enough to recall under pressure?
- Authentic to who you are?
- Ones you're willing to be held to?"

### 8. Update Output File

**Append to {outputFile}:**

Update the Guiding Principles section with:

- Principles table
- "I will always" commitments
- "I will never" commitments
- Core beliefs

Update frontmatter:

- Add "step-04-principles" to `stepsCompleted`

### 9. Summarize Principles

**Present summary:**

"Here are your guiding principles:

**I Will Always:**

1. [Commitment 1]
2. [Commitment 2]
3. [Commitment 3]

**I Will Never:**

1. [Red line 1]
2. [Red line 2]
3. [Red line 3]

**I Believe:**
[Core beliefs]

**Guiding Principles Summary:**
[List 5-7 principles]

These principles should guide your decisions when things get difficult. Do they feel right?"

### 10. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Principles [C] Continue to Legacy Vision"

#### Menu Handling Logic

- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to revise principles, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#10-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C] Continue is selected will you then load and read fully `{nextStepFile}` (step-05-legacy-vision.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- Principles extracted from prior exploration
- "I will always" and "I will never" articulated
- Core beliefs stated
- Principles tested against scenarios
- Principles refined to 5-7 memorable statements
- User owns their principles

### SYSTEM FAILURE

- Principles too vague to guide action
- Too many principles (overwhelming)
- Not testing against real scenarios
- Prescribing principles
- Not connecting to prior exploration

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
