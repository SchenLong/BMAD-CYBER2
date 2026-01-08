---
name: 'step-06-reporting'
description: 'Create board reports, KPI dashboards, and executive communication plans'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/virtual-ciso-consulting'
thisStepFile: '{workflow_path}/steps/step-06-reporting.md'
nextStepFile: '{workflow_path}/steps/step-07-vendor-risk.md'
outputFile: '{output_folder}/vciso/{client_name}/vciso-engagement-{client_name}.md'
brainstormingTask: '{project-root}/_bmad/core/tasks/brainstorming.xml'
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
---

# Step 6: Board/Executive Reporting

## STEP GOAL:

To design board-ready security reports, executive dashboards, KPI frameworks, and communication cadence that translate technical security into business language.

## EXECUTIVE REPORTING PROCESS:

### 1. Board Report Template

Design quarterly board security report:

**Report Structure:**
1. Executive Summary (1-page, business language)
2. Security Posture Overview (maturity trends)
3. Key Risks & Mitigation Status
4. Compliance & Audit Status
5. Strategic Initiative Progress
6. Budget vs Actual
7. Incidents & Response
8. Recommendations & Decisions Needed

For each section, define:
- Key metrics/content
- Visualization approach
- Business context
- Actionable insights

### 2. KPI Dashboard

Define security KPIs for executive monitoring:

**Strategic KPIs:**
- Security maturity score (trend)
- Risk exposure (critical/high risks open)
- Compliance status (% compliant)
- Strategic initiative completion rate

**Operational KPIs:**
- Mean time to detect (MTTD)
- Mean time to respond (MTTR)
- Vulnerability remediation rate
- Security training completion rate
- Policy compliance rate

**Risk KPIs:**
- Critical vulnerabilities open
- High-risk vendors count
- Security incidents (trend)
- Days since last breach

For each KPI:
- Metric definition
- Target/threshold
- Data source
- Update frequency
- Owner

### 3. Executive Dashboard Design

Design visual dashboard:
- Risk heat map
- Maturity radar chart
- Incident trend graph
- Compliance status indicators
- Budget utilization
- Top risks/priorities

### 4. Communication Cadence

Define reporting schedule:

**Board of Directors:**
- Frequency: Quarterly
- Format: Formal report + presentation
- Duration: 15-20 minutes
- Focus: Strategic risks, compliance, major initiatives

**Executive Leadership:**
- Frequency: Monthly
- Format: Security scorecard + brief
- Duration: 30 minutes
- Focus: Operational metrics, risks, decisions needed

**Audit Committee:**
- Frequency: Quarterly
- Format: Compliance report
- Duration: 30 minutes
- Focus: Audit findings, compliance status, remediation

**All-Hands:**
- Frequency: Quarterly
- Format: Security awareness brief
- Duration: 10 minutes
- Focus: Security wins, awareness topics, reporting channels

### 5. Incident Escalation Communication

Define incident communication plan:

**Severity Levels:**
- Critical: Board notification within 2 hours
- High: Executive notification within 4 hours
- Medium: Weekly summary to leadership
- Low: Monthly reporting

**Communication Templates:**
- Initial notification template
- Status update template
- Post-incident summary template

### 6. Append Section 6

Update {outputFile} with:
- Board report template (complete structure)
- KPI framework with targets
- Executive dashboard design
- Communication calendar
- Incident escalation matrix
- Report templates

### 7. Update Frontmatter

```yaml
stepsCompleted: [1, 2, 3, 4, 5, 6]
lastStep: 'reporting'
```

### 8. Present MENU

Display: **[B] Brainstorming [A] Advanced Elicitation [C] Continue to Vendor Risk**

- IF B: "Brainstorm KPI and metrics ideation" → {brainstormingTask}
- IF A: "Quality review of executive communications" → {advancedElicitationTask}
- IF C: Load {nextStepFile}

---

## ✅ SUCCESS:

- Board report template complete
- KPI framework established
- Executive dashboard designed
- Communication cadence defined
- Incident escalation plan created
- Section 6 appended
