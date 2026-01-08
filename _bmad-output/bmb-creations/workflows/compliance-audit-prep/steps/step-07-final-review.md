---
name: 'step-07-final-review'
description: 'Final quality review and audit preparation completion'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/compliance-audit-prep'
thisStepFile: '{workflow_path}/steps/step-07-final-review.md'
outputFile: '{output_folder}/compliance/audit-prep-{framework}-{project_name}.md'
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 7: Final Review and Completion

## STEP GOAL:

To conduct final quality review of audit preparation package and complete the workflow with recommendations and next steps.

## FINAL REVIEW PROCESS:

### 1. Completeness Check

Display:

"**Final Review - Completeness Check**

Reviewing all sections of audit preparation package..."

**Verify:**
- ✅ Section 1: Audit Overview complete
- ✅ Section 2: Control Inventory complete ({coverage}% coverage)
- ✅ Section 3: Gap Assessment complete ({gaps-count} gaps identified)
- ✅ Section 4: Evidence Planning complete ({evidence-items} items)
- ✅ Section 5: Remediation Roadmap complete ({remediations} planned)
- ✅ Section 6: Audit Artifacts complete

### 2. Quality Assessment

"**Quality Assessment:**

**Control Coverage:**
- Total Controls: {total}
- Implemented: {implemented} ({percentage}%)
- Target for audit: 100% or justified exceptions

**Gap Remediation:**
- Critical Gaps (P0): {remediated}/{total} remediated ({percentage}%)
- High Priority (P1): {remediated}/{total} remediated ({percentage}%)

**Evidence Readiness:**
- Evidence Collected: {percentage}%
- Evidence Gaps: {count}

**Overall Readiness Score:** {score}/100

**Assessment:** {Strong|Moderate|Needs Improvement}"

### 3. Risk Summary

"**Audit Risk Summary:**

**Strengths:**
{list-3-5-key-strengths}

**Areas of Concern:**
{list-3-5-areas-of-concern}

**Likelihood of Audit Success:**
{High|Medium|Low} - {justification}"

### 4. Final Recommendations

"**Final Recommendations:**

**Before Audit (Action Items):**
1. {critical-action-1}
2. {critical-action-2}
...

**During Audit (Best Practices):**
1. Designate single point of contact for auditor
2. Provide workspace for auditor team
3. Log all auditor requests and responses
4. Conduct daily debriefs with audit team
5. Escalate issues promptly

**After Audit (Follow-up):**
1. Address all findings within agreed timeline
2. Document lessons learned
3. Update policies/procedures based on findings
4. Plan for next audit cycle

Provide any additional recommendations:"

### 5. Next Steps Checklist

```markdown
## Post-Workflow Next Steps

**Immediate (This Week):**
- [ ] Distribute audit artifacts to stakeholders
- [ ] Brief control owners on audit process
- [ ] Complete final P0 remediations
- [ ] Organize evidence files
- [ ] Confirm auditor logistics

**Before Audit:**
- [ ] Complete all P1 remediations
- [ ] Conduct internal audit dry-run
- [ ] Brief management on expected outcomes
- [ ] Finalize evidence packages
- [ ] Prepare interview talking points

**During Audit:**
- [ ] Daily team sync with auditor
- [ ] Track all requests in log
- [ ] Document verbal discussions
- [ ] Escalate blockers immediately
- [ ] Maintain professional demeanor

**After Audit:**
- [ ] Debrief with team
- [ ] Address findings
- [ ] Update documentation
- [ ] Plan continuous compliance program
```

### 6. Generate Final Summary

Append to document:

```markdown

---

## 7. Final Summary and Next Steps

### 7.1 Audit Readiness Assessment

**Overall Score:** {score}/100

**Rating:** {Strong|Moderate|Needs Improvement}

**Strengths:**
{list-strengths}

**Areas of Concern:**
{list-concerns}

**Likelihood of Success:** {High|Medium|Low}

### 7.2 Critical Actions Before Audit

{prioritized-action-list-with-owners-and-dates}

### 7.3 Audit Day Preparation

**Logistics:**
- Audit Date: {date}
- Auditor: {auditor-name}
- Point of Contact: {poc-name}
- Workspace: {location}

**Team Roles:**
{audit-team-roster-with-responsibilities}

### 7.4 Post-Audit Plan

{plan-for-addressing-findings-and-continuous-compliance}

### 7.5 Recommendations

{final-recommendations-for-successful-audit}

---

## Conclusion

This audit preparation package provides comprehensive documentation of {project_name}'s compliance posture for {framework}.

**Key Metrics:**
- Control Coverage: {percentage}%
- Gaps Identified: {count}
- Critical Gaps Remediated: {count}/{total}
- Evidence Readiness: {percentage}%
- Readiness Score: {score}/100

**Primary Recommendation:**
{primary-recommendation}

**Prepared By:** {user_name}
**Completion Date:** {current-date}
**Status:** Audit Ready ✅

---
```

### 7. Update Frontmatter - Mark Complete

```yaml
---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
lastStep: 'final-review'
workflowComplete: true
completionDate: '{current-date}'
readinessScore: {score}
readinessStatus: '{status}'
auditReady: {true|false}
frameworks: ['{frameworks}']
primaryFramework: '{primary}'
---
```

### 8. Present MENU

Display: **[A] Advanced Elicitation [P] Party Mode [C] Complete Workflow**

- IF A: "Adversarial review of audit preparation package - find gaps we missed"
- IF P: "Final quality gate review with compliance experts"
- IF C: Display completion message and END

### 9. Workflow Completion

When user selects 'C':

Display:

"**🎉 Compliance Audit Preparation Complete!**

**Framework:** {framework}
**Organization:** {project_name}

**Audit Preparation Package Summary:**
- Control Coverage: {percentage}%
- Gaps Identified: {count}
- Remediations Planned: {count}
- Evidence Items: {count}
- Readiness Score: {score}/100

**Document Location:**
`{outputFile}`

**Artifacts Generated:**
1. Control Mapping Matrix
2. Audit Readiness Checklist
3. Executive Summary
4. Evidence Package Index
5. Gap Exception Report
6. Remediation Roadmap

**Next Steps:**
1. Review and distribute artifacts to stakeholders
2. Complete critical remediations before audit
3. Conduct internal dry-run
4. Brief audit team

**Readiness Status:** {Strong|Moderate|Needs Improvement}

Good luck with your audit!"

**STOP** - Workflow complete.

---

## 🚨 SUCCESS METRICS

### ✅ SUCCESS:
- Complete audit preparation package
- All 7 sections documented
- Readiness score calculated
- Artifacts generated
- Next steps clear
- workflowComplete: true

### ❌ FAILURE:
- Incomplete sections
- Missing artifacts
- No readiness assessment
- Unclear next steps
