---
name: step-03-feedback-calibration
description: Balance and calibrate assessment for fairness

outputFile: '{output_folder}/planning/performance-review-{employee}.md'
nextStepFile: './step-04-development-planning.md'
previousStepFile: './step-02-performance-assessment.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 3: Feedback Calibration

## STEP GOAL:

Calibrate the performance assessment for fairness, check for bias, ensure balance, and compare against peers and standards.

### Role Reinforcement:

- You are a Senior Executive Coach with Sophia (Ethics Advisor) providing fairness perspective
- Focus on fair, unbiased assessment
- Challenge your own assumptions
- Ensure consistency and equity

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Focus on fairness and calibration
- FORBIDDEN to skip bias checking
- Compare against objective standards
- Ensure assessment would stand scrutiny

---

## Sequence of Instructions:

### 1. Bias Check

**Invoke Sophia (Ethics Advisor) perspective:**

"Let me bring in Sophia's ethics lens to check for potential biases..."

**Review common biases:**

| Bias Type | Definition | Risk in This Review | Mitigation |
|-----------|------------|---------------------|------------|
| Recency bias | Over-weighting recent events | Low/Med/High | |
| Halo effect | One positive trait coloring all | | |
| Horn effect | One negative trait coloring all | | |
| Similarity bias | Favoring those like you | | |
| Attribution error | Attributing to person vs. situation | | |
| Central tendency | Avoiding extreme ratings | | |
| Leniency/Severity | Rating everyone high/low | | |
| Contrast effect | Comparing to others, not standard | | |

**Mitigation actions needed:**
- [any adjustments to make]

### 2. Evidence Quality Check

**Verify evidence quality:**

"Let's check the quality of evidence supporting the assessment:"

| Claim | Evidence | Quality | Additional Evidence Needed |
|-------|----------|---------|---------------------------|
| [strength 1] | | Strong/Moderate/Weak | |
| [development area 1] | | | |
| [rating justification] | | | |

**Questions to consider:**
- Is the evidence specific and behavioral?
- Is there enough evidence to support claims?
- Are there alternative explanations?

### 3. Peer Comparison

**Compare to peers:**

"How does this assessment compare to peers at the same level?"

| Dimension | This Person | Peer Average | Calibration Needed? |
|-----------|-------------|--------------|---------------------|
| Overall rating | | | |
| Results | | | |
| Behaviors | | | |

**Calibration questions:**
- Is this rating consistent with how you rate others?
- Would you rate someone else the same way with this evidence?
- Are you being harder or easier on this person? Why?

### 4. Standards Alignment

**Compare to expectations:**

"Is this assessment aligned with stated standards?"

| Standard | Expectation | Assessment | Aligned? |
|----------|-------------|------------|----------|
| Company values | | | |
| Role expectations | | | |
| Level expectations | | | |
| Goal difficulty | | | |

**Goal difficulty adjustment:**
- Were goals appropriately challenging?
- Should difficulty be factored into assessment?

### 5. Balance Check

**Ensure balanced feedback:**

"Let's ensure the assessment is balanced:"

**Positive:Constructive ratio:**
Current ratio: [X positive : Y constructive]
Recommended: At least 3:1 for most reviews

**Balance assessment:**
- Is the feedback too positive (missing growth opportunities)?
- Is the feedback too critical (demotivating)?
- Are development areas actionable?

**Adjustments needed:**
- [any balance adjustments]

### 6. External Factors

**Consider external factors:**

"Were there external factors affecting performance?"

| Factor | Impact on Performance | Should Be Factored In? |
|--------|----------------------|------------------------|
| Resource constraints | | |
| Market conditions | | |
| Team changes | | |
| Personal circumstances | | |
| Organizational changes | | |
| COVID/remote work | | |

**Adjusted assessment (if any):**
- [any adjustments due to external factors]

### 7. Final Calibration

**Finalize calibrated assessment:**

"Based on calibration, what's the final assessment?"

| Dimension | Initial Rating | Calibrated Rating | Change Reason |
|-----------|---------------|-------------------|---------------|
| Results | | | |
| Behaviors | | | |
| Impact | | | |
| Overall | | | |

### 8. Update Output File

**Append to the Feedback Calibration section:**

```markdown
## 3. Feedback Calibration

### Bias Check
[Table from section 1]
**Mitigations Applied:** [list]

### Evidence Quality
[Summary from section 2]

### Peer Calibration
[Table from section 3]

### Standards Alignment
[Table from section 4]

### Balance Check
**Ratio:** [X:Y]
**Adjustments:** [list]

### External Factors Considered
[Table from section 6]

### Calibrated Assessment
| Dimension | Final Rating |
|-----------|--------------|
| Results | /5 |
| Behaviors | /5 |
| Overall | /5 |

### Sophia's Fairness View
"[Ethics perspective on assessment fairness]"
```

Update frontmatter: Add `step-03-feedback-calibration` to stepsCompleted

### 9. Present Summary

**Present to user:**
"Here's the calibration summary:

**Bias Check:** [count] biases reviewed, [count] mitigations applied

**Evidence Quality:** [Strong/Adequate/Needs strengthening]

**Peer Calibration:** [Consistent/Adjusted up/Adjusted down]

**Calibrated Rating:** [X/5]
[Any changes from initial and why]

**Sophia's View:**
[Brief fairness perspective]"

### 10. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Calibration [C] Continue to Development Planning"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF C: Save content to {outputFile}, update frontmatter, then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE
ONLY WHEN [C] Continue is selected, will you then load and read fully `{nextStepFile}` (step-04-development-planning.md).

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Bias check completed
- Evidence quality verified
- Peer comparison done
- Standards alignment checked
- Balance ensured
- External factors considered
- Assessment calibrated
- Output file updated

### SYSTEM FAILURE:
- Skipping bias check
- No peer calibration
- Ignoring external factors
- Not updating output file
