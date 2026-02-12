---
name: step-04-agent-assignment
description: Route to jurisdiction specialist agent
workflow_path: '{project-root}/_bmad/legal-team/workflows/corporate-formation'
nextStepFile: '{workflow_path}/steps/step-05-tax-review.md'
---

# Step 4: Agent Assignment

## STEP GOAL

Route the formation matter to the appropriate jurisdiction specialist agent.

## EXECUTION SEQUENCE

### 1. Agent Selection Logic

Based on selectedJurisdiction, assign specialist:

**USA Jurisdictions:**

- Delaware, Wyoming, Nevada, any US state → **Liberty** (US Corporate Specialist)

**Spain:**

- SL, SA, SLNE, Branch → **Castile** (Spain Legal Specialist)

**EU/Estonia:**

- OÜ, AS, e-Residency, other EU → **Europa** (EU Legal Specialist)

### 2. Handoff Notification

Present transition message:

```markdown
### Specialist Assignment

Based on your selection of [Jurisdiction] for [Entity Type], I'm connecting you with:

**[Agent Name]** - [Agent Title]

[Agent] specializes in [jurisdiction] corporate matters and will guide you through the specific formation requirements, documentation, and compliance obligations.

Additionally, **Tribute** (Tax Specialist) will provide tax analysis in Step 5.
```

### 3. Context Transfer

Compile context for specialist:

```markdown
## Formation Context (for Specialist)

### Client Profile
[From Step 1]

### Selected Structure
- **Jurisdiction:** [Selected]
- **Entity Type:** [Selected]
- **Primary Goals:** [Key objectives]

### Special Considerations
[Any flags or priorities]

### Timeline
[Target formation date]
```

### 4. Specialist Introduction

Specialist agent introduces themselves:

**Liberty (USA):**
"I'm Liberty, specializing in US corporate structures. I'll guide you through [State] [Entity] formation, ensuring compliance with state requirements and federal considerations."

**Castile (Spain):**
"Soy Castile, especialista en derecho mercantil español. Le guiaré en la constitución de su [Entity Type], cumpliendo con todos los requisitos del Registro Mercantil y la legislación societaria española."

**Europa (EU/Estonia):**
"I'm Europa, specializing in EU corporate law. For your [Entity Type] in [Country], I'll ensure compliance with both local requirements and EU directives."

### 5. Update Output

```markdown
## 4. Specialist Assignment

### Assigned Agent
**Agent:** [Name] ([Jurisdiction] Specialist)

### Context Transferred
- Business profile
- Selected jurisdiction and entity
- Key objectives
- Timeline requirements

### Next Steps
Proceeding with tax implications review with Tribute, then returning to [Agent] for detailed formation guidance.
```

Update: `stepsCompleted: [1, 2, 3, 4]`

### 6. Menu

**[C]** Continue to tax review | **[Q]** Questions about specialist
