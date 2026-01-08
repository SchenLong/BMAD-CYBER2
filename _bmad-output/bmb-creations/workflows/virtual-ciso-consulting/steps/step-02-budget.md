---
name: 'step-02-budget'
description: 'Define security budget with resource allocation and ROI framework'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/virtual-ciso-consulting'
thisStepFile: '{workflow_path}/steps/step-02-budget.md'
nextStepFile: '{workflow_path}/steps/step-03-assessment.md'
outputFile: '{output_folder}/vciso/{client_name}/vciso-engagement-{client_name}.md'
brainstormingTask: '{project-root}/_bmad/core/tasks/brainstorming.xml'
---

# Step 2: Budget & Resource Planning

## STEP GOAL:

To collaboratively define a realistic security budget with resource allocation, ROI framework, and multi-year projections that align with organizational constraints and strategic priorities.

## MANDATORY EXECUTION RULES:

- 🛑 NEVER generate content without user input
- 📖 Read complete step before acting
- 📋 YOU ARE A FACILITATOR for budget planning
- ✅ Speak in {communication_language}

## BUDGET PLANNING PROCESS:

### 1. Initialize Budget Planning

Load {outputFile} to review client context from Section 1.

Display:

"**Budget & Resource Planning**

**Step 2 of 8** in the vCISO engagement lifecycle.

**Client:** {clientName}
**Focus Areas:** {focusAreas}

Based on your engagement scope, let's develop a realistic security budget that aligns with business priorities and demonstrates clear ROI.

Security budgets typically fall into these categories:
- **People**: Security staff, training, awareness programs
- **Technology**: Tools, platforms, cloud security services
- **Services**: Consulting, audits, penetration testing, managed services
- **Compliance**: Certifications, audit costs, legal/regulatory
- **Operations**: Incident response, monitoring, maintenance

Let's start by understanding your current security spend and budget constraints."

### 2. Current Budget Assessment

"**Current Security Spend:**

**Existing Budget:**
- What is the current annual security budget? ($ amount or 'none/unknown')
- What percentage of IT budget goes to security? (% or 'unknown')
- Current security spending breakdown (if known):
  - People: $___
  - Technology/Tools: $___
  - Services: $___
  - Compliance: $___

Provide current spend information:"

Collect: **Current Spend**

"**Budget Constraints:**

- Total proposed security budget for next year: $___
- Budget approval authority: (e.g., CFO, Board, CEO)
- Budget flexibility: (rigid / some flexibility / flexible)
- Multi-year budget planning horizon: (1 year / 3 years / 5 years)

Define budget constraints:"

Collect: **Budget Constraints**

### 3. Budget Category Planning

For each category, guide budget allocation:

"**People & Staffing:**

Based on your current team ({team-structure}), what staffing investments are needed?

Options:
- Hire full-time security engineer(s): $___/year each
- Contract/part-time security staff: $___/year
- Security awareness training program: $___/year
- Professional certifications/training: $___/year
- No additional people costs: $0

Define people budget:"

Collect: **People Budget**

"**Security Technology & Tools:**

What security tools and platforms are needed?

Common categories:
- SIEM/Log management: $___ /year
- Endpoint protection (EDR): $___ /year
- Cloud security (CSPM/CWPP): $___ /year
- Vulnerability management: $___ /year
- Identity/Access management: $___ /year
- Email/web security: $___ /year
- Backup/disaster recovery: $___ /year
- Other tools: $___ /year

Define technology budget:"

Collect: **Technology Budget**

"**Professional Services:**

What external services are required?

- vCISO services (this engagement): $___
- Penetration testing: $___ /year
- Security assessments/audits: $___ /year
- Compliance consulting: $___ /year
- Incident response retainer: $___ /year
- Managed security services (SOC): $___ /year
- Other professional services: $___ /year

Define services budget:"

Collect: **Services Budget**

"**Compliance & Certification:**

What compliance costs should be budgeted?

- SOC 2 / ISO 27001 certification: $___
- Annual audits/recertification: $___ /year
- Compliance tools/software: $___ /year
- Legal/regulatory consulting: $___ /year
- Cyber insurance: $___ /year

Define compliance budget:"

Collect: **Compliance Budget**

"**Operations & Maintenance:**

What ongoing operational costs are needed?

- 24/7 monitoring/alerting: $___ /year
- Incident response readiness: $___ /year
- Patch management: $___ /year
- Security tool maintenance: $___ /year
- Contingency/emergency response: $___ /year

Define operations budget:"

Collect: **Operations Budget**

### 4. Budget Summary & Validation

Calculate total proposed budget:

Display:

"**Proposed Annual Security Budget:**

| Category | Year 1 | Notes |
|----------|---------|-------|
| People & Staffing | ${people-total} | {people-breakdown} |
| Technology & Tools | ${tech-total} | {tech-breakdown} |
| Professional Services | ${services-total} | {services-breakdown} |
| Compliance & Certification | ${compliance-total} | {compliance-breakdown} |
| Operations & Maintenance | ${ops-total} | {ops-breakdown} |
| **TOTAL** | **${grand-total}** | |

**Budget vs Constraints:**
- Proposed: ${proposed-total}
- Available: ${budget-constraint}
- Variance: ${variance} ({over/under/on-target})

Is this budget allocation realistic for your organization?"

If over budget, collaborate on adjustments.

### 5. ROI Framework

"**Return on Investment Framework:**

Let's quantify the business value of this security investment.

**Risk Reduction:**
- Estimated annual loss expectancy without security program: $___
- Estimated risk reduction with proposed program: ___% (e.g., 50%, 70%)
- Potential annual loss avoidance: $___

**Business Enablement:**
- Revenue opportunities enabled by security compliance: $___
  (e.g., enterprise customers requiring SOC 2, FedRAMP opportunities)
- Cost avoidance from preventing breaches: $___
  (industry average breach cost × likelihood reduction)

**Productivity Gains:**
- Time saved from automated security: ___ hours/year
- Reduced downtime from better resilience: ___ hours/year

Define ROI factors:"

Collect: **ROI Data**

Calculate ROI:
- Total Investment (Year 1): ${total-budget}
- Estimated Annual Value: ${risk-reduction + business-value + productivity}
- ROI: {(value - investment) / investment × 100}%
- Payback Period: {investment / annual-value} years

### 6. Multi-Year Budget Projection

"**3-Year Budget Forecast:**

Project budget needs for Years 2 and 3:

**Year 1** (Current): ${year1-total}
**Year 2** (Projected):
- Assume ___% inflation adjustment
- Additional tool costs: $___
- Staff growth: $___
- Total Year 2: ${year2-total}

**Year 3** (Projected):
- Assume ___% inflation adjustment
- Maturity improvements: $___
- Additional compliance costs: $___
- Total Year 3: ${year3-total}

**3-Year Total Investment:** ${3-year-total}"

### 7. Append Section 2

Update {outputFile} with:

```markdown

---

## 2. Budget & Resource Plan

### 2.1 Current State Budget Analysis

**Current Annual Security Spend:** ${current-spend}
**Percentage of IT Budget:** {percentage}%

**Current Spending Breakdown:**
- People & Staffing: ${current-people}
- Technology & Tools: ${current-tech}
- Services: ${current-services}
- Compliance: ${current-compliance}
- Operations: ${current-ops}

**Budget Authority:** {approval-authority}
**Budget Flexibility:** {flexibility-level}

### 2.2 Proposed Security Budget (Year 1)

| Category | Annual Cost | % of Total | Key Investments |
|----------|-------------|------------|-----------------|
| **People & Staffing** | ${people-total} | {people-%} | {people-summary} |
| **Technology & Tools** | ${tech-total} | {tech-%} | {tech-summary} |
| **Professional Services** | ${services-total} | {services-%} | {services-summary} |
| **Compliance & Certification** | ${compliance-total} | {compliance-%} | {compliance-summary} |
| **Operations & Maintenance** | ${ops-total} | {ops-%} | {ops-summary} |
| **TOTAL** | **${year1-total}** | **100%** | |

### 2.3 Resource Allocation Details

**People & Staffing** (${people-total}/year):
{detailed-people-breakdown}

**Technology & Tools** (${tech-total}/year):
{detailed-tech-breakdown}

**Professional Services** (${services-total}/year):
{detailed-services-breakdown}

**Compliance & Certification** (${compliance-total}/year):
{detailed-compliance-breakdown}

**Operations & Maintenance** (${ops-total}/year):
{detailed-ops-breakdown}

### 2.4 Return on Investment (ROI) Framework

**Investment Summary:**
- Year 1 Security Investment: ${year1-total}
- 3-Year Total Investment: ${3-year-total}

**Expected Value Delivery:**

**Risk Reduction:**
- Estimated Annual Loss Expectancy (without program): ${ale}
- Risk Reduction Target: {risk-reduction-%}%
- Annual Loss Avoidance: ${loss-avoidance}

**Business Enablement:**
- Revenue Opportunities Enabled: ${revenue-enabled}
- Compliance-Driven Business Growth: ${compliance-growth}
- Brand/Reputation Protection: ${brand-value}

**Productivity & Efficiency:**
- Automated Security Savings: ${automation-value}/year
- Reduced Incident Response Costs: ${ir-savings}/year
- Downtime Avoidance: ${downtime-value}/year

**ROI Calculation:**
- Total Annual Value: ${total-annual-value}
- Year 1 ROI: {roi-percentage}%
- Payback Period: {payback-period} months
- 3-Year Net Value: ${3-year-net-value}

### 2.5 Multi-Year Budget Projection

| Category | Year 1 | Year 2 | Year 3 | 3-Year Total |
|----------|---------|---------|---------|--------------|
| People & Staffing | ${y1-people} | ${y2-people} | ${y3-people} | ${3y-people} |
| Technology & Tools | ${y1-tech} | ${y2-tech} | ${y3-tech} | ${3y-tech} |
| Professional Services | ${y1-services} | ${y2-services} | ${y3-services} | ${3y-services} |
| Compliance & Cert | ${y1-compliance} | ${y2-compliance} | ${y3-compliance} | ${3y-compliance} |
| Operations & Maint | ${y1-ops} | ${y2-ops} | ${y3-ops} | ${3y-ops} |
| **TOTAL** | **${y1-total}** | **${y2-total}** | **${y3-total}** | **${3y-grand-total}** |

**Assumptions:**
- Year 2-3 inflation adjustment: {inflation-%}%
- Staff growth assumptions: {staff-growth-notes}
- Tool maturity & optimization: {optimization-notes}

### 2.6 Budget Approval Strategy

**Presentation to Stakeholders:**

**Executive Summary for Budget Approval:**
> The proposed ${year1-total} security investment delivers {roi-%}% ROI through risk reduction (${risk-value}), business enablement (${business-value}), and operational efficiency (${efficiency-value}). This program reduces organizational risk by {risk-reduction-%}%, enables ${revenue-enabled} in new business opportunities, and establishes compliance readiness for {compliance-frameworks}.

**Key Talking Points:**
1. **Risk Mitigation:** Reduces likelihood of ${ale} potential breach impact by {risk-reduction-%}%
2. **Business Growth:** Enables enterprise sales requiring SOC 2/ISO 27001 compliance
3. **Regulatory Compliance:** Meets {regulatory-requirements} obligations
4. **Operational Efficiency:** Automates security operations, reducing manual effort by {automation-%}%
5. **Competitive Advantage:** Security posture as market differentiator

**Budget Approval Timeline:**
- Budget presentation: {presentation-date}
- Q&A / stakeholder review: {review-period}
- Final approval target: {approval-date}
- Budget effective date: {effective-date}

---
```

### 8. Update Frontmatter

Update frontmatter with:
```yaml
stepsCompleted: [1, 2]
lastStep: 'budget'
```

### 9. Present MENU

Display: **Select an Option:** [B] Brainstorming [C] Continue to Assessment

- IF B: "Brainstorm creative budget optimization approaches" → Execute {brainstormingTask}
- IF C: Load {nextStepFile}

---

## ✅ SUCCESS:

- Comprehensive budget defined across all categories
- ROI framework established with quantified value
- Multi-year projection provided
- Section 2 appended to document
- Ready for current state assessment

