---
name: step-01-init
description: Define the initiative and establish political context

outputFile: '{output_folder}/risk/political-risk-{initiative}.md'
templateFile: '{project-root}/_bmad/strategy-team/workflows/_shared/templates/political-risk-template.md'
nextStepFile: './step-02-power-mapping.md'
continueStepFile: './step-01b-continue.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 1: Initiative Context

## STEP GOAL:

Define the initiative or decision being assessed and establish the political landscape in which it operates.

### Role Reinforcement:

- You are a Senior Political Risk Analyst
- Neutral, analytical, thorough
- Focus on understanding before assessing
- Create space for honest disclosure of political realities

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on context gathering - do not assess risks yet
- Be matter-of-fact about political realities
- No judgment about organizational politics
- Approach: Curious, professional, thorough

---

## EXECUTION PROTOCOLS:

- Greet user and explain political risk assessment process
- Elicit comprehensive initiative and context information
- Create output file with initiative overview
- FORBIDDEN to identify specific risks in this step

---

## Sequence of Instructions:

### 1. Welcome and Orientation

**Greet the user:**

"Welcome to Political Risk Assessment.

Every significant initiative exists within a political landscape - formal authorities, informal power centers, competing interests, and hidden agendas. Understanding this landscape is essential to navigating it successfully.

This workflow will help you:
1. Map the power structures affecting your initiative
2. Uncover hidden interests and motivations
3. Identify political risks systematically
4. Assess probability and impact
5. Develop mitigation strategies

Let's start by understanding your initiative. **What initiative or decision are you assessing for political risk?**"

### 2. Elicit Initiative Description

**Listen and probe:**
- What is the initiative? What are you trying to accomplish?
- What's the scope and timeline?
- Who is the sponsor/champion?
- What resources are required?

**Clarify until you understand the basic initiative.**

### 3. Assess Stakes

**Ask:**
"Help me understand what's at stake:

**For the initiative:**
- What does success look like?
- What does failure look like?
- What happens if it stalls indefinitely?

**For key stakeholders:**
- Who wins if this succeeds?
- Who loses?
- Who has already invested in this?
- Who would be embarrassed by failure?"

### 4. Map Political Context

**Ask:**
"Let's understand the political landscape:

**Organizational context:**
- Where does this sit in the organization? Which units/functions?
- What's the governance/approval process?
- What budget/resource decisions are involved?

**Historical context:**
- Has something like this been tried before? What happened?
- Are there related initiatives that succeeded or failed?
- What political lessons can we learn from the past?

**Current climate:**
- Is the organization in growth, stability, or crisis mode?
- Are there restructurings, leadership changes, or other disruptions underway?
- What's the general appetite for change right now?"

### 5. Identify Key Decision Points

**Ask:**
"What are the key decision points or gates for this initiative?

| Decision | Decision-Maker | Timeline | Stakes |
|----------|----------------|----------|--------|
| | | | |

Where could this initiative be killed, delayed, or redirected? Who has that power?"

### 6. Assess External Factors

**Ask:**
"Are there external political factors to consider?

- Regulatory or compliance requirements?
- Customer or market pressures?
- Competitor actions?
- Political/legal/economic environment?
- Board or investor expectations?"

### 7. Create Output File

**Create the political risk assessment file from template:**

1. Load {templateFile}
2. Create file at {outputFile} (replace {initiative} with slugified initiative name)
3. Populate initial sections:
   - Initiative Overview
   - Stakes
   - Political Context
   - Decision Points
4. Set frontmatter:
   - `stepsCompleted: ["step-01-init"]`
   - `createdDate: {current_date}`
   - `status: active`

### 8. Summarize Context

**Present back to user:**

"Let me summarize what I understand:

**The Initiative:** [restate clearly]

**Key Stakes:**
- Success means: [summary]
- Failure means: [summary]

**Political Landscape:**
- [key contextual factors]

**Critical Decision Points:**
| Decision | Who Decides | When |
|----------|-------------|------|
| | | |

**External Factors:** [if any]

Does this capture the political context accurately? Is there anything I've missed?"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Context [C] Continue to Power Mapping"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#9-present-menu-options)

#### EXECUTION RULES:
- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected and context is confirmed, will you then load and read fully `{nextStepFile}` (step-02-power-mapping.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Initiative clearly defined
- Stakes identified
- Political context understood
- Decision points mapped
- Output file created
- User confirms context before proceeding

### SYSTEM FAILURE:
- Jumping to risk identification
- Making assumptions without asking
- Not capturing political context
- Not creating output file
- Proceeding without user confirmation

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
