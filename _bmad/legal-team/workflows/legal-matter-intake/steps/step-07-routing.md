---
name: step-07-routing
description: Recommend appropriate specialist agent and workflow
workflow_path: '{project-root}/_bmad/legal-team/workflows/legal-matter-intake'
nextStepFile: '{workflow_path}/steps/step-08-brief.md'
---

# Step 7: Specialist Routing Recommendation

## STEP GOAL

Based on all gathered information, recommend the appropriate specialist agent(s) and workflow(s) for this matter.

## EXECUTION RULES

- Consider all factors gathered in previous steps
- Recommend primary specialist AND supporting specialists
- Suggest appropriate workflow(s)
- Explain reasoning for recommendations
- ALWAYS communicate in `{communication_language}`

## ROUTING MATRIX

### By Matter Type

| Matter Type | Primary Agent | Supporting Agents | Workflow |
|-------------|--------------|-------------------|----------|
| Contract Review | Covenant | Jurisdiction specialist | contract-review |
| Contract Drafting | Covenant | Jurisdiction specialist | contract-drafting |
| Corporate Formation | Jurisdiction specialist | Tribute | corporate-formation |
| Dispute/Litigation | Advocate | Jurisdiction specialist | dispute-strategy |
| Tax Planning | Tribute | Jurisdiction specialist | tax-planning |
| Cross-Border | Europa | Multiple specialists | cross-border-matter |

### By Jurisdiction

| Jurisdiction | Specialist Agent |
|--------------|-----------------|
| United States | Liberty |
| European Union (general) | Europa |
| Spain | Castile |
| Estonia | Baltic (Phase 2) |
| Multi-jurisdiction | Europa (coordination) |

## EXECUTION SEQUENCE

### 1. Analyze Routing Factors

Review all information gathered:
- Matter type → determines workflow
- Jurisdiction → determines specialist
- Complexity → may require multiple specialists
- Urgency → affects prioritization

### 2. Formulate Recommendation

Determine:
- **Primary Specialist:** Who should lead this matter?
- **Supporting Specialists:** Who else should be consulted?
- **Recommended Workflow:** Which workflow to execute?
- **Alternative Options:** Any other approaches to consider?

### 3. Present Recommendation

"Based on everything we've discussed, here's my recommendation for how to proceed..."

Present:
- Primary specialist and why
- Supporting specialists and their roles
- Recommended workflow
- Expected next steps
- Any special considerations

### 4. Discuss Options

If user has questions or preferences:
- Explain trade-offs
- Discuss alternatives
- Confirm approach

### 5. Update Matter Brief

Append to output file:

```markdown
## 7. Routing Recommendation

### Primary Specialist
- **Agent:** [name]
- **Rationale:** [why this specialist]

### Supporting Specialists
- [Agent]: [role in this matter]

### Recommended Workflow
- **Workflow:** [workflow name]
- **Purpose:** [what it will accomplish]

### Alternative Options
[Any alternative approaches considered]

### Special Considerations
[Any factors affecting routing]
```

Update frontmatter: `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`

### 6. Present Menu

**Select an Option:**
- **[C]** Continue to generate matter brief
- **[D]** Discuss routing options
- **[A]** Request different specialist

#### Menu Handling:
- IF C: Update frontmatter, load and follow `{nextStepFile}`
- IF D: Discuss alternatives, then redisplay menu
- IF A: Adjust routing, then redisplay menu
