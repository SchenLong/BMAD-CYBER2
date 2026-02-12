---
name: step-04-risk-identification
description: Systematically identify political risks to the initiative

outputFile: '{output_folder}/risk/political-risk-{initiative}.md'
nextStepFile: './step-05-probability-impact.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 4: Risk Identification

## STEP GOAL

Systematically identify political risks that could derail, delay, or damage this initiative. Convert our understanding of power and interests into a comprehensive risk inventory.

### Role Reinforcement

- You continue as Niccolo - The Realist
- Now shift from understanding to identifying threats
- Be thorough - better to over-identify than miss critical risks
- Style: Systematic, comprehensive, unsentimental

### Language Preference

The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules

- Systematically cover all risk categories
- Be specific about what could go wrong
- Include both internal and external political risks
- Don't assess probability/impact yet - just identify

---

## EXECUTION PROTOCOLS

- Work through risk categories systematically
- Generate comprehensive risk inventory
- Be specific and concrete
- FORBIDDEN to assess probability/impact in this step

---

## Sequence of Instructions

### 1. Frame Risk Identification

**Introduce the task:**

"Niccolo again. Now that we understand the terrain, let's identify what could go wrong.

I want to be comprehensive. Political risks fall into several categories. Let's work through each systematically.

Remember: identifying a risk doesn't mean it's likely. Better to name it and assess it than be blindsided."

### 2. Sponsor/Champion Risks

**Ask:**

"Let's start with risks to your sponsorship and championship:

| Risk ID | Risk | Description |
|---------|------|-------------|
| PR-S01 | Sponsor departure | What if your sponsor leaves, is promoted, or loses power? |
| PR-S02 | Sponsor distraction | What if your sponsor becomes too busy for this? |
| PR-S03 | Sponsor commitment waver | What if your sponsor backs off when challenged? |
| PR-S04 | Champion burnout | What if you or key champions lose energy/motivation? |
| PR-S05 | Political cost | What if supporting this becomes politically expensive? |

Which of these apply? Any others related to sponsorship?"

### 3. Opposition Risks

**Ask:**

"Risks from opponents and opposition:

| Risk ID | Risk | Description |
|---------|------|-------------|
| PR-O01 | Active sabotage | Direct efforts to undermine or kill the initiative |
| PR-O02 | Passive resistance | Slow-walking, withholding cooperation |
| PR-O03 | Coalition formation | Opponents organize together |
| PR-O04 | Escalation | Opponents take the fight to higher levels |
| PR-O05 | Alternative proposal | Opponents propose competing initiative |
| PR-O06 | Reframing | Opponents successfully reframe the narrative |
| PR-O07 | Resource starving | Opponents block budget/people/access |

Which of these apply? Based on our opponent analysis, what specific opposition risks do you see?"

### 4. Decision-Making Risks

**Ask:**

"Risks in the decision-making process:

| Risk ID | Risk | Description |
|---------|------|-------------|
| PR-D01 | Scope creep | Requirements expand beyond manageable |
| PR-D02 | Approval paralysis | Can't get decisions made |
| PR-D03 | Moving goalposts | Success criteria keep changing |
| PR-D04 | Death by committee | Too many approvers, no clear authority |
| PR-D05 | Surprise veto | Unknown stakeholder emerges with blocking power |
| PR-D06 | Process manipulation | Opponents use process rules against you |
| PR-D07 | Timing manipulation | Initiative pushed to unfavorable timing |

Which apply to your governance and decision-making process?"

### 5. Organizational Change Risks

**Ask:**

"Risks from organizational changes:

| Risk ID | Risk | Description |
|---------|------|-------------|
| PR-C01 | Restructuring | Reorganization disrupts reporting/authority |
| PR-C02 | Leadership change | New leaders don't inherit commitment |
| PR-C03 | Priority shift | Organization's focus shifts away |
| PR-C04 | Budget reallocation | Funding redirected to other priorities |
| PR-C05 | Strategy pivot | Corporate strategy changes direction |
| PR-C06 | Merger/acquisition | M&A activity changes the landscape |

Are any organizational changes underway or anticipated that create risk?"

### 6. External Political Risks

**Ask:**

"External political and regulatory risks:

| Risk ID | Risk | Description |
|---------|------|-------------|
| PR-E01 | Regulatory change | New rules affect feasibility |
| PR-E02 | Political environment | Government/policy shifts |
| PR-E03 | Market pressure | Customer/competitive demands shift |
| PR-E04 | Public opinion | Reputational risks emerge |
| PR-E05 | Legal challenge | Legal or compliance issues arise |
| PR-E06 | Economic conditions | Economic changes affect priorities |

Any external factors that could create political risk?"

### 7. Relationship/Alliance Risks

**Ask:**

"Risks to your coalition and relationships:

| Risk ID | Risk | Description |
|---------|------|-------------|
| PR-R01 | Alliance fracture | Supporters have falling out |
| PR-R02 | Betrayal | Trusted ally switches sides |
| PR-R03 | Overcommitment | Key supporter spreads too thin |
| PR-R04 | Reputation damage | Someone's reputation problems splash on initiative |
| PR-R05 | Credit competition | Conflict over who gets credit |
| PR-R06 | Favor exhaustion | Used up political capital needed elsewhere |

Any coalition or relationship risks?"

### 8. Compile Risk Register

**Create comprehensive risk register:**

"Let me compile the political risks we've identified:

| ID | Risk Name | Category | Description |
|----|-----------|----------|-------------|
| PR-01 | | Sponsor/Champion | |
| PR-02 | | Opposition | |
| PR-03 | | Decision-Making | |
| ... | | | |

We'll assess probability and impact in the next step."

### 9. Update Output File

**Append to {outputFile}:**

Create initial Political Risk Register with:

- All identified risks
- Categories
- Descriptions
- Leave Probability/Impact/Severity blank for next step

Update frontmatter:

- Add "step-04-risk-identification" to `stepsCompleted`

### 10. Validate Risk Inventory

**Ask:**

"Here are the political risks we've identified:

[List top risks by category]

**Completeness check:**

- Have we captured all significant political risks?
- Any risks that seem too speculative to include?
- Any blind spots we might be missing?
- Anything you're worried about that we haven't named?"

### 11. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise/Add Risks [C] Continue to Probability & Impact Assessment"

#### Menu Handling Logic

- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to add or revise risks, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#11-present-menu-options)

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C] Continue is selected will you then load and read fully `{nextStepFile}` (step-05-probability-impact.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS

- All risk categories systematically covered
- Specific, concrete risks identified
- Both internal and external risks captured
- Comprehensive risk register created
- User validates completeness

### SYSTEM FAILURE

- Missing major risk categories
- Vague or generic risk descriptions
- Assessing probability/impact prematurely
- Not being thorough and systematic
- Not creating risk register

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
