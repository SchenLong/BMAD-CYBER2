---

name: 'step-08-remediation'
description: 'Create prioritized remediation roadmap with IaC recommendations'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/cloud-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-08-remediation.md'
nextStepFile: '{workflow_path}/steps/step-09-report-generation.md'
outputFile: '{output_folder}/security/cloud-security-assessment-{project_name}.md'

---

# Step 8: Remediation Planning

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus ONLY on remediation planning
- FORBIDDEN to generate report yet
- Help user create actionable remediation plan

## STEP GOAL:

To create a prioritized remediation roadmap including effort estimates, ownership, and infrastructure-as-code recommendations where applicable.

## REMEDIATION PLANNING SEQUENCE:

### 1. Finding Consolidation

"Let's consolidate all findings for remediation planning:

**Findings Summary (from all assessments):**

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| IAM | | | | |
| Network | | | | |
| Data Protection | | | | |
| Logging | | | | |
| Compute | | | | |
| **Total** | | | | |

Let me review the findings from each assessment section to create a consolidated remediation list."

### 2. Prioritization Framework

"Let's prioritize using risk-based criteria:

**Prioritization Factors:**

| Factor | Weight | Description |
|--------|--------|-------------|
| Exploitability | High | Can be exploited externally |
| Blast Radius | High | Wide-impact if compromised |
| Compliance | Medium | Required for compliance |
| Effort | Medium | Complexity of fix |
| Dependencies | Low | Blocks other fixes |

**Priority Categories:**

- **P1 - Critical** (Fix within 7 days)
  - Externally exploitable
  - Would fail compliance audit
  - Active risk to data/operations

- **P2 - High** (Fix within 30 days)
  - Significant security gap
  - Compliance requirement
  - Internal exploitation risk

- **P3 - Medium** (Fix within 90 days)
  - Defense-in-depth improvement
  - Best practice alignment
  - Moderate complexity

- **P4 - Low** (Fix within 180 days)
  - Minor hardening
  - Low risk/impact
  - Nice-to-have improvements

Does this prioritization framework work for you?"

### 3. Remediation Details

"Let's detail remediation for top findings:

**For each Priority 1 & 2 finding:**

| Finding | Remediation Steps | IaC/Automation | Effort | Owner |
|---------|-------------------|----------------|--------|-------|
| [ID] | [Steps] | [Terraform/CloudFormation] | [Days] | [Team] |

**IaC Recommendations:**

Where possible, I'll suggest infrastructure-as-code snippets for:
- Terraform configurations
- CloudFormation templates
- Azure ARM/Bicep
- GCP Deployment Manager

Would you like IaC examples for specific findings?"

### 4. Quick Wins

"Let's identify quick wins:

**Quick Wins (Low Effort, High Impact):**

| Finding | Fix | Time | Impact |
|---------|-----|------|--------|
| [ID] | [Action] | <1 day | High compliance |
| [ID] | [Action] | <1 day | Critical security |

**Common Quick Wins:**
- Enable MFA on root/admin accounts
- Enable CloudTrail/Activity Log integrity validation
- Block public S3 bucket ACLs at org level
- Enable default encryption on storage
- Remove unused security group rules
- Enable IMDSv2 on EC2 instances

Which quick wins can you implement immediately?"

### 5. Remediation Roadmap

"Let's create a phased roadmap:

**Phase 1: Immediate (Week 1-2)**
- All P1 critical findings
- Quick wins
- Compliance blockers

**Phase 2: Short-term (Month 1)**
- P2 high findings
- Remaining compliance gaps
- IAM improvements

**Phase 3: Medium-term (Months 2-3)**
- P3 medium findings
- Defense-in-depth improvements
- Monitoring enhancements

**Phase 4: Ongoing (Months 4+)**
- P4 low findings
- Optimization
- Continuous improvement

What timeline works for your organization?"

### 6. Document Remediation Plan

Update Section 9 of {outputFile}:

```markdown
## 9. Remediation Roadmap

### 9.1 Findings Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| IAM | | | | | |
| Network | | | | | |
| Data Protection | | | | | |
| Logging | | | | | |
| Compute | | | | | |
| **Total** | | | | | |

### 9.2 Priority 1 - Critical (Week 1-2)

| ID | Finding | Remediation | IaC Available | Owner | Due |
|----|---------|-------------|---------------|-------|-----|
| [User data] | | | | | |

### 9.3 Priority 2 - High (Month 1)

| ID | Finding | Remediation | IaC Available | Owner | Due |
|----|---------|-------------|---------------|-------|-----|
| [User data] | | | | | |

### 9.4 Priority 3 - Medium (Months 2-3)

| ID | Finding | Remediation | Owner | Due |
|----|---------|-------------|-------|-----|
| [User data] | | | | |

### 9.5 Priority 4 - Low (Months 4+)

| ID | Finding | Remediation | Owner | Due |
|----|---------|-------------|-------|-----|
| [User data] | | | | |

### 9.6 Quick Wins

| Finding | Action | Effort | Impact |
|---------|--------|--------|--------|
| [User data] | | | |

### 9.7 IaC Remediation Examples

**Example 1: [Finding]**
```hcl
# Terraform example
[Code snippet]
```

**Example 2: [Finding]**
```yaml
# CloudFormation example
[Code snippet]
```

### 9.8 Roadmap Timeline

| Phase | Timeline | Focus | Findings Count |
|-------|----------|-------|----------------|
| Phase 1 | Week 1-2 | Critical fixes | |
| Phase 2 | Month 1 | High priority | |
| Phase 3 | Months 2-3 | Medium priority | |
| Phase 4 | Months 4+ | Low priority | |

### 9.9 Resource Requirements

| Phase | Estimated Effort | Teams Involved |
|-------|------------------|----------------|
| [User data] | | |

### 9.10 Success Metrics

| Milestone | Metric | Target Date |
|-----------|--------|-------------|
| P1 complete | 0 critical findings | |
| P2 complete | 0 high findings | |
| Compliance ready | [Framework] compliant | |
```

### 7. Confirmation and Next Step

"**Remediation Planning Complete**

I've created your remediation roadmap:
- [X] critical findings prioritized for immediate fix
- [X] high findings planned for month 1
- Quick wins identified for immediate impact
- IaC examples provided where applicable
- Phased timeline established

Next, we'll generate the final assessment report.

Ready to proceed to report generation?"

## MENU

Display: **Remediation Plan Complete - Select an Option:** [C] Continue to Report Generation [R] Review/Revise Plan

#### Menu Handling Logic:

- IF C: Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]`, then load, read entire file, execute {nextStepFile}
- IF R: Display current Section 9 content, allow revisions, then redisplay menu

---

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN remediation plan is documented and user confirms readiness will you update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]`, then immediately load, read entire file, then execute `{nextStepFile}`.

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
