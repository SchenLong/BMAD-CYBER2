---
name: step-02-strategic-fit
description: Analyze strategic fit, market position, and competitive dynamics

outputFile: '{output_folder}/decisions/ma-due-diligence-{target}.md'
nextStepFile: './step-03-financial-assessment.md'
previousStepFile: './step-01-init.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 2: Strategic Fit Analysis

## STEP GOAL:

Assess the strategic alignment between acquirer and target, analyze market position, competitive dynamics, and evaluate strategic value creation potential.

### Role Reinforcement:

- You are a Senior M&A Advisor with Sun (Master Strategist) providing strategic perspective
- Focus on strategic fit and competitive implications
- Challenge assumptions about strategic value
- Maintain professional, executive-level tone throughout

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on strategic analysis, not financial details
- FORBIDDEN to skip competitive analysis
- Probe for hidden strategic risks
- Document both fit and misfit areas honestly

---

## Sequence of Instructions:

### 1. Review Deal Thesis

**Read the existing output file and summarize:**
"Let me review the deal thesis before we assess strategic fit..."

[Summarize key points from Step 1]

### 2. Market Position Analysis

**Invoke Sun (Master Strategist) perspective:**

"Let me bring in Sun's strategic perspective to analyze market positioning..."

**Assess with user:**
- Target's current market position (leader, challenger, niche)
- Market growth trajectory and dynamics
- Competitive landscape and key rivals
- Barriers to entry and defensibility
- Market share implications of the deal

### 3. Strategic Alignment Assessment

**Analyze fit across dimensions:**

"Let's assess how well the target aligns with your strategic priorities:"

| Dimension | Target Strength | Your Need | Fit Score |
|-----------|-----------------|-----------|-----------|
| Market access | | | 1-5 |
| Technology/IP | | | 1-5 |
| Talent/capabilities | | | 1-5 |
| Customer base | | | 1-5 |
| Product portfolio | | | 1-5 |
| Geographic reach | | | 1-5 |
| Brand/reputation | | | 1-5 |

### 4. Competitive Impact Analysis

**Ask:**
"How will this deal change the competitive landscape?
- Who are the main competitors affected?
- How might they respond?
- Will this trigger other M&A activity?
- Does this create regulatory concerns?"

### 5. Strategic Synergy Identification

**Identify synergy categories:**

"Let's identify where strategic value will be created:"

**Revenue synergies:**
- Cross-selling opportunities
- New market access
- Pricing power
- Accelerated growth

**Strategic synergies:**
- Technology/IP combination
- Capability enhancement
- Competitive moat strengthening
- Innovation acceleration

### 6. Strategic Risks & Concerns

**Invoke Burke (Conservative) perspective:**

"Let me bring in Burke's risk-aware perspective..."

**Identify strategic risks:**
- Market disruption risks
- Technology obsolescence
- Integration complexity
- Strategic overreach
- Culture clash potential

### 7. Update Output File

**Append to the Strategic Fit section:**

```markdown
## 2. Strategic Fit Analysis

### Market Position
[Analysis from section 2]

### Strategic Alignment Matrix
[Table from section 3]

### Competitive Impact
[Analysis from section 4]

### Strategic Synergies
[Findings from section 5]

### Strategic Risks
[Risks from section 6]

### Strategic Fit Summary
Overall fit score: X/5
Key strengths: [list]
Key concerns: [list]
```

Update frontmatter: Add `step-02-strategic-fit` to stepsCompleted

### 8. Present Summary

**Present to user:**
"Here's the strategic fit assessment:

**Overall Strategic Fit:** [Strong/Moderate/Weak]

**Key Strategic Value Drivers:**
- [top 3 drivers]

**Key Strategic Concerns:**
- [top 3 concerns]

**Sun's Strategic View:**
[Brief strategic perspective]

**Burke's Risk View:**
[Brief risk perspective]"

### 9. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Analysis [C] Continue to Financial Assessment"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then follow {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-03-financial-assessment.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Market position thoroughly analyzed
- Strategic alignment quantified
- Competitive implications assessed
- Synergies identified and categorized
- Strategic risks documented
- Output file updated with strategic fit section

### SYSTEM FAILURE:
- Skipping competitive analysis
- Not quantifying strategic fit
- Proceeding without identifying strategic risks
- Not updating output file
