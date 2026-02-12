# Strategic Decision - Team Orchestration Instructions

<critical>The workflow execution engine is governed by: {project-root}/src/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: strategic-decision/workflow.yaml</critical>
<critical>Communicate in {communication_language} with {user_name}</critical>

<workflow>

<step n="1" goal="Initialize strategic decision process">
<output>
# Strategic Decision Orchestration

This orchestration facilitates major strategic decisions through multi-perspective analysis.

**Teams Involved:**

- **BMM**: Market research, product perspective
- **Strategy-Team**: Strategic analysis, stakeholder dynamics
- **Legal-Team**: Risk assessment, compliance implications

**Process Flow:**

```
Research → Strategic Analysis → Legal Review → Decision Workshop → Implementation Plan
```

---
</output>

<ask>What type of strategic decision?

1. **Build vs Buy** - Make or acquire capability
2. **Market Entry** - New market/geography expansion
3. **M&A Evaluation** - Merger or acquisition assessment
4. **Product Pivot** - Major product direction change
5. **Organizational** - Structure/process changes
6. **Other** - Describe the decision

Choice [1-6]:</ask>
<action>Store as decision_type</action>

<ask>Describe the decision context:

- What decision needs to be made?
- What are the key constraints?
- What is the timeline for decision?

Context:</ask>
<action>Store as decision_context</action>
</step>

<step n="2" goal="Phase 1 - Research and Intelligence">
<output>
## Phase 1: Research & Intelligence (BMM)

**Lead Agent:** Mary (Analyst)
**Objective:** Gather market and competitive intelligence

**Research Areas:**

- Market size and growth
- Competitive landscape
- Customer/user insights
- Technology trends
- Regulatory environment

---
</output>

<ask>How would you like to proceed with research?

1. **Load research workflow** - Comprehensive market research
2. **Provide existing research** - I have research ready
3. **Skip research** - Proceed with available knowledge

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <output>Invoking BMM research workflow...

**Lead:** Mary (Analyst)
**Focus:** {decision_type} context

Starting research...</output>

  <action>Load and follow{bmm_workflows.research} with decision context</action>
  <action>Store market_analysis_path</action>
</check>

<check if="choice == 2">
  <ask>Path to research document:</ask>
  <action>Store market_analysis_path</action>
</check>

<action>Goto step 3</action>
</step>

<step n="3" goal="Phase 2 - Strategic Analysis">
<output>
## Phase 2: Strategic Analysis (Strategy-Team)

**Lead Agent:** Sun Tzu (Master Strategist)
**Supporting:** Magnus (Political Strategist), Geneva (Stakeholder Mediator)

**Analysis Frameworks:**

- SWOT analysis
- Porter's Five Forces
- Stakeholder mapping
- Strategic options generation

**Inputs:**

- Research: {market_analysis_path}
- Decision context: {decision_context}

---
</output>

<ask>Strategic analysis approach?

1. **Decision Workshop** - Full multi-advisor analysis (14 perspectives)
2. **Focused Analysis** - Key strategists only
3. **Advisory Board** - Party mode with strategic advisors preset

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <output>Invoking Strategy-Team decision workshop...

**Full Analysis:** All 14 strategic advisors will provide perspectives

Starting comprehensive strategic analysis...</output>

  <action>Load and follow{strategy_workflows.decision_workshop} with research and context</action>
  <action>Store strategic_options_path</action>
</check>

<check if="choice == 2">
  <output>Focused strategic analysis...

**Advisors:**

- Sun Tzu - Strategic positioning
- Magnus - Political landscape
- Augustus - Policy implications

Starting focused analysis...</output>

  <action>Load and followlimited strategy workflow</action>
  <action>Store strategic_options_path</action>
</check>

<check if="choice == 3">
  <output>Assembling Strategic Advisory Board...

**Preset:** strategic-advisors
**Agents:**

- Sun Tzu (Strategy)
- Magnus (Politics)
- Counsel (Legal)
- John (Product)

Starting party mode discussion...</output>

  <action>Load and followparty-mode with preset=strategic-advisors</action>
  <action>Capture strategic_options from discussion</action>
</check>

<action>Goto step 4</action>
</step>

<step n="4" goal="Phase 3 - Legal Risk Assessment">
<output>
## Phase 3: Legal Risk Assessment (Legal-Team)

**Lead Agent:** Counsel
**Supporting:** Advocate (dispute risk), Europa (if EU implications)

**Risk Assessment Areas:**

- Contractual implications
- Regulatory requirements
- Liability exposure
- IP considerations
- Antitrust/competition issues

**Strategic Options to Assess:**
{{#each strategic_options}}

- {option_name}: {brief_description}
{{/each}}

---
</output>

<ask>Proceed with legal risk assessment?

1. **Yes, full assessment** - Comprehensive legal review of all options
2. **Targeted review** - Focus on highest-risk option only
3. **Skip** - Proceed without legal review (NOT RECOMMENDED for M&A, market entry)

Choice [1/2/3]:</ask>

<check if="choice == 1 or choice == 2">
  <output>Invoking Legal-Team risk assessment...

**Lead:** Counsel
**Scope:** {assessment_scope}

Starting legal review...</output>

  <action>Load and follow{legal_workflows.risk_assessment} with strategic options</action>
  <action>Store legal_risk_assessment_path</action>
</check>

<action>Goto step 5</action>
</step>

<step n="5" goal="Phase 4 - Decision Synthesis">
<output>
## Phase 4: Decision Synthesis

**Inputs Collected:**

- Market Research: {market_analysis_path}
- Strategic Options: {strategic_options_path}
- Legal Assessment: {legal_risk_assessment_path}

**Decision Matrix:**

| Option | Strategic Score | Legal Risk | Resource Need | Recommendation |
|--------|-----------------|------------|---------------|----------------|
{{#each options}}
| {name} | {strategic_score}/10 | {legal_risk_level} | {resource_estimate} | {recommendation} |
{{/each}}

---

**Key Findings:**

**Opportunities:**
{{#each opportunities}}

- {opportunity}
{{/each}}

**Risks:**
{{#each risks}}

- {risk}
{{/each}}

**Constraints:**
{{#each constraints}}

- {constraint}
{{/each}}

---
</output>

<ask>How would you like to finalize the decision?

1. **Generate decision brief** - Create executive summary for approval
2. **Additional discussion** - Party mode with advisors to debate options
3. **Request more analysis** - Specific area needs deeper investigation

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <action>Generate decision brief with recommended option</action>
  <action>Include dissenting views</action>
  <action>Store decision_brief_path</action>
</check>

<check if="choice == 2">
  <output>Reconvening strategic advisors for decision debate...

Focus: Final recommendation with pros/cons of each option

Starting advisory discussion...</output>

  <action>Load and followparty-mode for decision debate</action>
</check>

<action>Goto step 6</action>
</step>

<step n="6" goal="Phase 5 - Implementation Roadmap">
<output>
## Phase 5: Implementation Roadmap

**Recommended Decision:** {recommended_option}
**Rationale:** {rationale}

**Implementation Requirements:**

**From BMM (Product):**

- Feature/capability requirements
- Resource needs
- Timeline estimate

**From Legal:**

- Contracts to execute
- Compliance requirements
- Risk mitigations

**From Strategy:**

- Stakeholder communication plan
- Change management approach
- Success metrics

---
</output>

<ask>Generate implementation roadmap?

1. **Yes, full roadmap** - Detailed implementation plan
2. **High-level only** - Key milestones and dependencies
3. **Skip** - Decision brief is sufficient

Choice [1/2/3]:</ask>

<check if="choice == 1 or choice == 2">
  <action>Generate implementation roadmap based on scope</action>
  <action>Store implementation_roadmap_path</action>
</check>

<action>Goto step 7</action>
</step>

<step n="7" goal="Complete strategic decision orchestration">
<output>
# Strategic Decision Orchestration Complete

## Decision Summary

| Attribute | Value |
|-----------|-------|
| Decision Type | {decision_type} |
| Recommended Option | {recommended_option} |
| Strategic Score | {strategic_score}/10 |
| Legal Risk | {legal_risk_level} |
| Resource Estimate | {resource_estimate} |

## Artifacts Generated

| Artifact | Location |
|----------|----------|
| Market Research | {market_analysis_path} |
| Strategic Options | {strategic_options_path} |
| Legal Assessment | {legal_risk_assessment_path} |
| Decision Brief | {decision_brief_path} |
| Implementation Roadmap | {implementation_roadmap_path} |

## Next Steps

1. **Executive Approval** - Present decision brief for approval
2. **Detailed Planning** - Use BMM workflows for implementation
3. **Legal Execution** - Initiate required legal actions

---

**Return to Abdul:** Use [PS] Project Status to track implementation.
</output>

<action>Save orchestration summary to {output_folder}/strategic-decision-{date}.md</action>
</step>

</workflow>
