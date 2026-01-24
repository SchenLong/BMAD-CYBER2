---
name: step-07-coordination
description: Assign jurisdiction specialists and coordinate analysis
workflow_path: '{project-root}/_bmad/legal-team/workflows/cross-border-matter'
nextStepFile: '{workflow_path}/steps/step-08-strategy.md'
---

# Step 7: Agent Coordination

## STEP GOAL

Assign jurisdiction specialists and coordinate multi-agent analysis.

## EXECUTION SEQUENCE

### 1. Specialist Assignment

Assign agents to jurisdictions:

**Available Agents:**
| Agent | Specialization | Jurisdictions |
|-------|----------------|---------------|
| Liberty | US Law | Federal, State |
| Castile | Spanish Law | Spain (deep) |
| Europa | EU Law | EU directives, Estonia, General EU |
| Tribute | Tax Law | Multi-jurisdictional tax |
| Counsel | General Coordination | Intake, routing |

**Assignment Matrix:**
| Jurisdiction | Primary Agent | Support Agent | External Needed? |
|--------------|---------------|---------------|------------------|
| USA | Liberty | Tribute (tax) | [If specialized area] |
| Spain | Castile | Tribute (tax) | [If specialized area] |
| EU/Estonia | Europa | Tribute (tax) | [If specialized area] |
| Other | [N/A] | Europa (general) | Yes - local counsel |

### 2. Agent Briefings

Prepare jurisdiction-specific briefs:

**For Each Assigned Agent:**

```markdown
## Agent Brief: [Agent Name]
### [Jurisdiction] Analysis

**Matter Summary:**
[Relevant facts for this jurisdiction]

**Specific Questions:**
1. [Question specific to this jurisdiction]
2. [Question specific to this jurisdiction]

**Focus Areas:**
- [Area 1]
- [Area 2]

**Coordination Points:**
- Link to [Other Agent] on [Issue]
- Potential conflict with [Jurisdiction] on [Issue]
```

### 3. Coordination Protocol

Establish communication:

**Issue Escalation:**
- When to escalate to Europa (coordinator)
- How to flag conflicts between jurisdictions
- Decision-making hierarchy

**Information Sharing:**
- Shared document repository
- Cross-reference requirements
- Update protocols

### 4. External Counsel Identification

For jurisdictions outside module scope:

**External Counsel Needs:**
| Jurisdiction | Expertise Needed | Engagement Status |
|--------------|------------------|-------------------|
| [Country] | [Area] | [To be engaged/In progress] |

**Coordination Requirements:**
- Engagement letter considerations
- Conflict checks
- Information sharing protocols
- Privilege considerations

### 5. Update Output

```markdown
## 7. Agent Coordination

### Team Assignment
| Role | Agent | Jurisdiction Focus | Deliverables |
|------|-------|-------------------|--------------|
| Coordinator | Europa | Overall, EU | Strategy synthesis |
| US Specialist | Liberty | USA | US law analysis |
| Spain Specialist | Castile | Spain | Spanish law analysis |
| Tax Specialist | Tribute | All | Tax implications |
...

### Agent Briefs Issued
- [ ] Liberty: USA brief
- [ ] Castile: Spain brief
- [ ] Tribute: Tax brief
- [Other as needed]

### External Counsel
**Required For:**
- [Jurisdiction]: [Specialty]

**Engagement Status:**
[Description]

### Coordination Protocol
**Lead Coordinator:** Europa
**Escalation Path:** [Description]
**Sync Schedule:** [Frequency]

### Cross-Jurisdictional Issues Flagged
| Issue | Jurisdictions | Assigned To | Status |
|-------|---------------|-------------|--------|
| [Issue] | [Countries] | [Agent] | [Open/Resolved] |
...
```

Update: `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`

### 6. Menu

**[C]** Continue to unified strategy | **[B]** Review agent briefs | **[Q]** Questions
