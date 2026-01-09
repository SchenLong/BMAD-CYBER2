---

name: 'step-09-report-generation'
description: 'Generate executive and technical assessment reports'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/cloud-security-assessment'

# File References

thisStepFile: '{workflow_path}/steps/step-09-report-generation.md'
outputFile: '{output_folder}/security/cloud-security-assessment-{project_name}.md'

---

# Step 9: Report Generation

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Step-Specific Rules:

- Focus on finalizing the assessment report
- This is the FINAL step - ensure comprehensive summary
- Generate executive summary from all findings

## STEP GOAL:

To generate the final assessment report including executive summary, risk overview, and appendices.

## REPORT GENERATION SEQUENCE:

### 1. Executive Summary Generation

"Let me generate your Executive Summary based on all our assessment findings:

**Executive Summary Components:**

1. **Assessment Overview**
   - Scope and objectives
   - Cloud environment assessed
   - Methodology used

2. **Key Findings Summary**
   - Total findings by severity
   - Most critical risks identified
   - Compliance posture

3. **Risk Assessment**
   - Overall risk rating
   - Top risk areas
   - Immediate action items

4. **Recommendations**
   - Priority remediation actions
   - Quick wins
   - Strategic improvements

Shall I draft the executive summary now?"

### 2. Risk Scoring

"Let's calculate overall risk scores:

**Risk Score by Domain:**

| Domain | Critical | High | Medium | Low | Risk Score |
|--------|----------|------|--------|-----|------------|
| IAM | x | x | x | x | [Calculated] |
| Network | x | x | x | x | [Calculated] |
| Data Protection | x | x | x | x | [Calculated] |
| Logging | x | x | x | x | [Calculated] |
| Compute | x | x | x | x | [Calculated] |
| **Overall** | | | | | **[Overall]** |

**Risk Scoring Formula:**
- Critical = 10 points each
- High = 5 points each
- Medium = 2 points each
- Low = 1 point each

**Risk Rating:**
- 0-10: Low Risk
- 11-30: Moderate Risk
- 31-50: High Risk
- 50+: Critical Risk

What's your organization's risk tolerance?"

### 3. Document Executive Summary

Update Section 1 of {outputFile}:

```markdown
## 1. Executive Summary

### Assessment Overview

This Cloud Security Assessment was conducted for {project_name} to evaluate the security posture of cloud infrastructure across [AWS/Azure/GCP].

**Assessment Scope:**
- [X] cloud accounts/subscriptions
- [X] services evaluated
- [X] compliance frameworks mapped

**Assessment Period:** [Dates]
**Assessment Team:** {user_name}, Claude (Nimbus)

### Key Findings

**Findings Distribution:**
| Severity | Count |
|----------|-------|
| Critical | [X] |
| High | [X] |
| Medium | [X] |
| Low | [X] |
| **Total** | [X] |

**Top 5 Critical Findings:**
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]
4. [Finding 4]
5. [Finding 5]

### Risk Assessment

**Overall Risk Score:** [Score] / 100
**Risk Rating:** [Low/Moderate/High/Critical]

**Risk by Domain:**
| Domain | Risk Score | Rating |
|--------|------------|--------|
| IAM | | |
| Network | | |
| Data Protection | | |
| Logging | | |
| Compute | | |

### Compliance Posture

| Framework | Compliance % | Status |
|-----------|--------------|--------|
| [Framework 1] | % | [Pass/Partial/Fail] |
| [Framework 2] | % | [Pass/Partial/Fail] |

### Recommendations Summary

**Immediate Actions (Week 1):**
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Short-term (Month 1):**
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Strategic Improvements:**
1. [Improvement 1]
2. [Improvement 2]
```

### 4. Appendices

"Let's complete the appendices:

**Appendix A: Assessment Methodology**
- Tools used
- Testing approach
- Limitations

**Appendix B: Detailed Findings**
- Full finding descriptions
- Evidence screenshots (references)
- Technical details

**Appendix C: References**
- CIS Benchmark version
- Compliance framework versions
- Cloud provider documentation

Would you like to add any specific appendix content?"

### 5. Document Appendices

Update Section 10 of {outputFile}:

```markdown
## 10. Appendices

### Appendix A: Assessment Methodology

**Assessment Approach:**
- Configuration review against CIS Benchmarks
- Architecture analysis for security design
- Compliance mapping to [frameworks]

**Tools Used:**
- [Cloud-native security tools]
- [Third-party CSPM tools]
- Manual review

**Limitations:**
- [Any scope limitations]
- [Access limitations]
- [Time constraints]

### Appendix B: Detailed Findings

[Reference to detailed finding sections in Sections 3-7]

### Appendix C: References

**Benchmarks and Frameworks:**
- CIS Benchmark [Provider] v[X]
- SOC 2 Type II
- [Other frameworks]

**Cloud Provider Documentation:**
- [Provider] Security Best Practices
- [Provider] Well-Architected Framework

### Appendix D: Glossary

| Term | Definition |
|------|------------|
| IAM | Identity and Access Management |
| VPC | Virtual Private Cloud |
| CMK | Customer Managed Key |
| CSPM | Cloud Security Posture Management |
```

### 6. Report Validation

"Let's validate the report is complete:

**Report Checklist:**
- [ ] Executive Summary complete
- [ ] All assessment sections documented
- [ ] Compliance mapping complete
- [ ] Remediation roadmap detailed
- [ ] Appendices included
- [ ] Risk scores calculated
- [ ] Recommendations prioritized

Is there any section you'd like to review or expand?"

### 7. Workflow Complete

"**Cloud Security Assessment Workflow Complete!**

I've finalized your comprehensive Cloud Security Assessment including:

**Report Sections:**
1. Executive Summary with risk scores
2. Assessment Overview and scope
3. IAM Security Assessment
4. Network Security Assessment
5. Data Protection Assessment
6. Logging & Monitoring Assessment
7. Compute Security Assessment
8. Compliance Mapping
9. Remediation Roadmap
10. Appendices

**Summary Statistics:**
- Total findings: [X]
- Critical/High requiring immediate action: [X]
- Overall risk score: [X]
- Compliance posture: [Summary]

**Next Steps:**
1. Review report with stakeholders
2. Begin P1 critical remediation immediately
3. Schedule remediation tracking meetings
4. Plan reassessment date

Your complete assessment is saved at:
`{outputFile}`

Would you like help with any specific area, or shall we conclude?"

## FINAL MENU

Display: **Assessment Complete - Select an Option:** [E] Export/Review Final Report [Q] Ask Questions [D] Done - Conclude Workflow

#### Menu Handling Logic:

- IF E: Display complete document sections or export guidance
- IF Q: Answer questions about any finding or recommendation
- IF D: Mark workflow complete, update frontmatter with `workflowComplete: true` and `stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]`

---

## CRITICAL STEP COMPLETION NOTE

This is the FINAL step. When user selects 'D' (Done):
1. Update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]`
2. Add `workflowComplete: true` to frontmatter
3. Add `completedDate: [current date]` to frontmatter
4. Congratulate user on completing the cloud security assessment

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
