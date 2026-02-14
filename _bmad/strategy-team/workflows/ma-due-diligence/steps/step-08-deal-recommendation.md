---
name: step-08-deal-recommendation
description: Synthesize findings into board-ready recommendation

outputFile: '{output_folder}/decisions/ma-due-diligence-{target}.md'
previousStepFile: './step-07-stakeholder-comms.md'

advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 8: Deal Recommendation

## STEP GOAL:

Synthesize all due diligence findings into a clear, board-ready recommendation with supporting rationale, key risks, and conditions for proceeding.

### Role Reinforcement:

- You are a Senior M&A Advisor presenting final recommendations
- Load multiple advisor perspectives for balanced view
- Focus on clear, actionable recommendation
- Document dissenting views and conditions

### Language Preference:
The user has chosen to communicate in the **{communication_language}** language.
You MUST respond in **{communication_language}** throughout this step.

### Step-Specific Rules:

- Recommendation must be clear: Proceed, Proceed with conditions, or Do not proceed
- FORBIDDEN to give ambiguous recommendation
- Document all material concerns
- Specify conditions and next steps

---

## Sequence of Instructions:

### 1. Review All Findings

**Synthesize all prior steps:**

"Let me review all our due diligence findings..."

**Summary of each phase:**
- Deal Thesis: [key points]
- Strategic Fit: [key findings]
- Financial Assessment: [key findings]
- Operational Diligence: [key findings]
- Risk Assessment: [key findings]
- Integration Plan: [key points]
- Communications: [key points]

### 2. Advisor Council Review

**Invoke multiple perspectives for final input:**

"Let me gather final perspectives from the advisor council..."

**Sun (Master Strategist):**
"From a strategic positioning standpoint..."

**Burke (Conservative):**
"From a risk and preservation standpoint..."

**Lee (Technocrat):**
"From an operational execution standpoint..."

**Sophia (Ethics Advisor):**
"From a values and stakeholder fairness standpoint..."

### 3. Deal Scorecard

**Compile overall assessment:**

"Let's compile the overall deal scorecard:"

| Dimension | Score (1-5) | Confidence | Notes |
|-----------|-------------|------------|-------|
| Strategic fit | | High/Med/Low | |
| Financial attractiveness | | | |
| Operational feasibility | | | |
| Integration complexity | | | |
| Risk profile | | | |
| Synergy achievability | | | |
| Cultural fit | | | |
| **Overall Score** | **X/5** | | |

### 4. Develop Recommendation

**Formulate clear recommendation:**

"Based on all analysis, my recommendation is:"

**Recommendation options:**
- **PROCEED**: Deal is attractive, risks manageable, recommend moving forward
- **PROCEED WITH CONDITIONS**: Deal is attractive but specific conditions must be met
- **PAUSE/RENEGOTIATE**: Deal structure needs significant changes
- **DO NOT PROCEED**: Deal does not meet criteria or risks too high

**Recommendation statement:**
"I recommend [PROCEED/PROCEED WITH CONDITIONS/DO NOT PROCEED] with this transaction because..."

### 5. Key Conditions (if applicable)

**If Proceed with Conditions, specify:**

"The following conditions must be satisfied:"

**Pre-signing conditions:**
1. [condition]
2. [condition]

**Closing conditions:**
1. [condition]
2. [condition]

**Post-closing commitments:**
1. [commitment]
2. [commitment]

### 6. Key Risks to Monitor

**Highlight ongoing risks:**

"The following risks should be actively monitored:"

| Risk | Trigger/Warning Signs | Mitigation |
|------|----------------------|------------|
| | | |

### 7. Dissenting Views

**Document alternative perspectives:**

"For a balanced view, here are dissenting perspectives:"

**Case against the deal:**
- [argument]
- [argument]

**Rebuttals:**
- [counter-argument]

### 8. Next Steps

**Define immediate next steps:**

"If proceeding, the immediate next steps are:"

1. [step with owner and timeline]
2. [step with owner and timeline]
3. [step with owner and timeline]

### 9. Finalize Output File

**Complete the due diligence document:**

```markdown
## 8. Deal Recommendation

### Executive Summary
**Recommendation:** [PROCEED/PROCEED WITH CONDITIONS/DO NOT PROCEED]

**Rationale:** [2-3 sentence summary]

### Deal Scorecard
[Table from section 3]

### Advisor Perspectives
- **Sun (Strategy):** [summary]
- **Burke (Risk):** [summary]
- **Lee (Operations):** [summary]
- **Sophia (Ethics):** [summary]

### Conditions for Proceeding
[List from section 5]

### Key Risks to Monitor
[Table from section 6]

### Dissenting Views
[From section 7]

### Next Steps
[List from section 8]

---

## Appendix

### Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {date} | M&A Due Diligence Workflow | Complete due diligence |

### Due Diligence Team
[List of contributors]

### Methodology
This due diligence was conducted using the M&A Due Diligence workflow, incorporating perspectives from strategic, operational, financial, and risk advisors through structured multi-dimensional analysis.
```

Update frontmatter:
- Add `step-08-deal-recommendation` to stepsCompleted
- Change `status: complete`

### 10. Present Final Summary

**Present to user:**
"Here is the complete M&A Due Diligence summary:

---

## RECOMMENDATION: [PROCEED/PROCEED WITH CONDITIONS/DO NOT PROCEED]

**Strategic Rationale:** [1-2 sentences]

**Deal Scorecard:** [X/5 overall]

**Key Value Drivers:**
1. [driver]
2. [driver]
3. [driver]

**Critical Risks:**
1. [risk]
2. [risk]
3. [risk]

**Conditions (if applicable):**
1. [condition]
2. [condition]

**Next Steps:**
1. [step]
2. [step]

---

Your complete due diligence document has been saved to:
`{outputFile}`

This document is ready for board review and decision-making."

### 11. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [R] Revise Recommendation [E] Export/Share [X] Exit Workflow"

#### Menu Handling Logic:
- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF R: Return to relevant section to revise, then redisplay menu
- IF E: Provide export options (PDF, share link, etc.)
- IF X: Save and exit gracefully with summary

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:
- Clear recommendation provided (not ambiguous)
- All advisor perspectives synthesized
- Scorecard completed
- Conditions clearly specified (if applicable)
- Dissenting views documented
- Next steps defined
- Document marked complete
- Output file finalized

### SYSTEM FAILURE:
- Ambiguous recommendation
- Missing advisor perspectives
- Not addressing key risks
- Incomplete documentation
- Not marking status complete

**Master Rule:** The final recommendation MUST be clear and actionable. Ambiguity is SYSTEM FAILURE.
