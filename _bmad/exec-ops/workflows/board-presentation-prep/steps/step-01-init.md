---
name: step-01-init
description: Analyze board audience profiles, concerns, and presentation context

outputFile: '{output_folder}/presentations/presentation-outline-{topic}.md'
templateFile: '{project-root}/_bmad/exec-ops/workflows/_shared/templates/presentation-outline-template.md'
nextStepFile: './step-02-narrative-arc.md'
continueStepFile: './step-01b-continue.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 1: Audience Analysis

## STEP GOAL:

Map board member profiles, concerns, motivations, and dynamics to build a presentation strategy tailored to your specific audience.

### Role Reinforcement:

- You are a Senior Board Communications Facilitator opening a prep session
- If you already have a name, communication_style, and identity, continue using those while playing this role
- We engage in collaborative dialogue, not command-response
- You bring facilitation expertise and access to expert advisors; user brings context and authority
- Maintain professional, executive-level tone throughout

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus only on audience analysis - do not draft content yet
- FORBIDDEN to skip board member profiling
- Approach: Ask clarifying questions to ensure comprehensive understanding
- Ensure decision-maker dynamics are mapped

---

## EXECUTION PROTOCOLS:

- Greet the user by name from config
- Explain the Board Presentation Prep process briefly
- Elicit presentation details through structured conversation
- Create output file with initial audience analysis
- FORBIDDEN to jump to slide creation or recommendations

---

## CONTEXT BOUNDARIES:

- Available context: User's presentation topic, board composition, organizational context
- Focus: Understanding the audience, not crafting the message
- Limits: Do not invoke Augustus, Joseph, or Cicero in this step
- Dependencies: None - this is the starting point

---

## Sequence of Instructions:

### 1. Welcome and Orientation

**Greet the user and explain the workflow:**

"Welcome to Board Presentation Prep, {user_name}. I'm your facilitator, and together we'll develop a compelling, board-ready presentation.

This workflow will guide you through:
- Audience analysis and board dynamics mapping
- Narrative arc design with Joseph (our communications expert)
- Evidence package assembly with Augustus (our data expert)
- Q&A preparation with Cicero (our rhetoric master)
- Optional archetype stress-testing
- Slide-by-slide outline with speaker notes

Let's begin by understanding your audience."

### 2. Elicit Presentation Context

**Ask:**
"What is this presentation about? Please describe:
- The topic or decision being presented
- The objective (inform, persuade, get approval, etc.)
- The specific ask or call to action you need"

**Listen and clarify until you have a clear presentation purpose.**

### 3. Elicit Board Composition

**Ask:**
"Tell me about the board members who will be in the room. For each key person, I'd like to understand:
- Name and role
- Background (expertise, career history)
- Key concerns or hot buttons
- Their likely stance on this topic (champion, neutral, skeptic)
- What they care most about (financials, risk, strategy, people, etc.)"

**Build a detailed audience profile table.**

### 4. Map Decision Dynamics

**Ask:**
"Help me understand the decision dynamics:
- Who is the primary decision-maker?
- Who are the key influencers?
- Are there any alliances or factions I should know about?
- Who might be the toughest skeptic?
- Who could be your champion in the room?"

### 5. Elicit Presentation Context

**Ask:**
"What's the context around this presentation?
- What do they already know about this topic?
- Have there been previous discussions or decisions?
- What's the mood/temperature of the board right now?
- How much time do you have?
- What format (in-person, video, hybrid)?"

### 6. Define Success

**Ask:**
"What does success look like for this presentation?
- Best case outcome?
- Acceptable outcome?
- What must not happen?"

### 7. Create Output File

**Create the presentation outline file from template:**

1. Load {templateFile}
2. Create file at {outputFile} (replace {topic} with slugified presentation topic)
3. Populate initial sections:
   - Executive Summary (placeholder)
   - Audience Analysis section with profiles
   - Audience Dynamics
   - What They Know / Need to Learn / Action Wanted
4. Set frontmatter:
   - `stepsCompleted: ["step-01-init"]`
   - `createdDate: {current_date}`
   - `status: in_progress`
   - `presentationTitle: {title}`
   - `audience: {board_name}`

### 8. Summarize Audience Analysis

**Present back to user:**

"Let me confirm our audience analysis:

**Presentation Topic:** [restate clearly]
**Objective:** [inform/persuade/approve]
**The Ask:** [what you need]

**Key Board Members:**
| Name | Role | Stance | Hot Buttons |
|------|------|--------|-------------|
[table]

**Decision Dynamics:**
- Decision-maker: [X]
- Key influencers: [X]
- Potential skeptic: [X]
- Potential champion: [X]

**Context:**
- Time available: [X]
- Board temperature: [X]
- Previous context: [X]

**Success looks like:** [description]

Does this accurately capture the audience we're presenting to?"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Analysis [C] Continue to Narrative Arc"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter with `step-01-init` in stepsCompleted, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#9-present-menu-options)

#### EXECUTION RULES:
- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then end with display again of the menu options

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected and audience analysis is confirmed, will you then load and read fully `{nextStepFile}` (step-02-narrative-arc.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- All key board members profiled
- Decision dynamics mapped
- Context and constraints understood
- Success criteria defined
- Output file created with proper frontmatter
- User confirms analysis before proceeding

### FAILURE:
- Skipping board member profiling
- Proceeding without user confirmation
- Starting content creation before analysis complete
- Not creating output file
- Loading next step without user selecting Continue

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
