---

name: 'step-07-report-generation'
description: 'Generate executive summary and finalize complete Security Architecture Review report'

# Path Definitions

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/security-architecture-review'

# File References

thisStepFile: '{workflow_path}/steps/step-07-report-generation.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{output_folder}/planning/architecture/security-review-{project_name}.md'

---

# Step 7: Final Report Generation

## STEP GOAL:

To generate an executive summary synthesizing key findings and complete the Security Architecture Review report, making it stakeholder-ready for distribution to executives, boards, auditors, and technical teams.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: This is the final step - mark workflow as complete
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Security Architect (Bastion persona) finalizing the security assessment
- ✅ If you already have been given a name, communication_style and identity, continue to use those while playing this role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring expertise in executive communication and security reporting
- ✅ User brings business context and stakeholder needs
- ✅ Together we create a report that serves both technical and executive audiences
- ✅ Maintain professional, clear, stakeholder-appropriate tone

### Step-Specific Rules:

- 🎯 Focus on executive summary and final report polish
- 🚫 FORBIDDEN to modify technical sections (already completed)
- 💬 Approach: Synthesize for executives, validate completeness, finalize
- 📋 Report must be ready to share with executives, boards, auditors

## EXECUTION PROTOCOLS:

- 🎯 Generate executive summary (Section 1)
- 💾 Finalize complete report with all 7 sections
- 📖 Mark workflow complete: `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`
- 🚫 FORBIDDEN to skip executive summary

## CONTEXT BOUNDARIES:

- Available context: All completed sections 2-7
- Focus: Executive summary and final report validation
- Limits: Don't modify technical analysis already completed
- Dependencies: All previous steps must be complete

## REPORT GENERATION SEQUENCE:

### 1. Initialize Final Report Phase

"**Final Report Generation**

We've completed all analysis phases:
- ✅ Architecture context gathered
- ✅ STRIDE threat modeling ([X] threats identified)
- ✅ Security control assessment ([Y] gaps found)
- ✅ Attack surface analysis (offensive perspective)
- ✅ Zero-trust validation (maturity assessed)
- ✅ Recommendations and roadmap ([Z] recommendations, phased plan)

Now let's create the executive summary and finalize your Security Architecture Review report for stakeholder distribution."

### 2. Review Complete Report

Read entire {outputFile} to understand:
- Section 2: Architecture scope and context
- Section 3: Threat model summary (total threats, categories)
- Section 4: Control assessment (gaps, effectiveness)
- Section 4b: Zero-trust maturity
- Section 5: Risk matrix (Critical/High/Medium/Low counts)
- Section 6: Recommendations (count, complexity)
- Section 7: Implementation roadmap (phases, timeline)

"Let me review the complete analysis to synthesize key findings for executives..."

### 3. Generate Executive Summary Content

"**Executive Summary Development**

The executive summary must:
- Communicate clearly to non-technical stakeholders
- Highlight critical risks requiring immediate attention
- Quantify findings (number of threats, gaps, recommendations)
- Provide confidence in recommended path forward
- Be concise (1-2 paragraphs maximum)

Based on our analysis, here's a draft executive summary:

---

**DRAFT EXECUTIVE SUMMARY:**

[Project Name] security architecture review identified [X] security threats across [Y] major components using STRIDE methodology. Assessment revealed [Z] critical and [W] high-priority risks requiring immediate attention, including [2-3 most critical findings in business terms].

Current security posture includes [positive aspects] but has significant gaps in [key gap areas]. Zero-trust maturity is at Level [X], indicating [maturity description]. Immediate priorities include [top 3 critical mitigations]. We recommend a phased remediation approach over [timeline], addressing critical findings within 30 days and achieving comprehensive security improvements within [total timeline]. This plan will reduce risk by [estimated %] and advance zero-trust maturity to Level [target], positioning [project name] for [business outcome: compliance certification, production readiness, customer trust, etc.].

---

Does this executive summary accurately capture the key findings and recommendations for your stakeholders? Any adjustments needed for your audience (executives, board, auditors)?"

[Collect user feedback and refine executive summary]

### 4. Document Executive Summary

Update {outputFile} Section 1:

```markdown
## 1. Executive Summary

[User-approved executive summary content]

**Key Findings:**
- **Total Threats Identified:** [X] (STRIDE methodology)
- **Critical Risks:** [Y] requiring immediate action
- **High Risks:** [Z] to address within 30 days
- **Control Gaps:** [W] identified across 8 control categories
- **Zero-Trust Maturity:** Level [X] of 4

**Immediate Priorities:**
1. [Critical priority 1]
2. [Critical priority 2]
3. [Critical priority 3]

**Recommended Approach:**
Phased remediation over [timeline] with estimated [%] risk reduction.

**Business Impact:**
[Business outcomes from implementing recommendations]

---
```

### 5. Final Report Validation

"**Report Validation Checklist**

Let me verify the report is complete and stakeholder-ready:

**✅ Structure Completeness:**
- [✓] Section 1: Executive Summary
- [✓] Section 2: Architecture Overview
- [✓] Section 3: Threat Model (STRIDE)
- [✓] Section 4: Security Control Assessment
- [✓] Section 4b: Zero-Trust Validation
- [✓] Section 5: Risk Matrix
- [✓] Section 6: Detailed Recommendations
- [✓] Section 7: Implementation Roadmap

**✅ Quality Checks:**
- All 6 STRIDE categories covered: [✓/✗]
- Minimum 3 threats per major component: [✓/✗]
- Recommendations are specific (not generic): [✓/✗]
- Risk prioritization applied: [✓/✗]
- Implementation guidance included: [✓/✗]
- Phased roadmap with timelines: [✓/✗]
- Standards references (NIST, CIS, OWASP): [✓/✗]

**✅ Stakeholder Readiness:**
- Executive summary clear for non-technical audience: [✓/✗]
- Technical depth appropriate for security/dev teams: [✓/✗]
- Actionable recommendations with owners: [✓/✗]
- Compliance framework alignment documented: [✓/✗]

[Identify any gaps or issues]"

### 6. Report Metadata and Finalization

"**Report Finalization**

Let's finalize metadata and document status..."

Update {outputFile} frontmatter to mark complete:

```yaml
---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
lastStep: 'report-generation'
workflowStatus: 'COMPLETE'
completedDate: [current date YYYY-MM-DD]
architectureDocs: [list if any]
date: [original start date]
user_name: {user_name}
project_name: {project_name}
reviewType: 'Security Architecture Review'

# Summary Statistics
threatCount: [total threats]
criticalFindings: [count]
highFindings: [count]
mediumFindings: [count]
lowFindings: [count]
controlsInventoried: [count]
criticalGaps: [count]
totalRecommendations: [count]
zeroTrustMaturity: [level]
ghostCollaboration: [true/false]

# Workflow Tracking
reviewStartDate: [original date]
reviewCompletedDate: [current date]
totalSessionTime: [if tracked]
---
```

Also update the status line at top of {outputFile}:

Change from:
```
**Status:** In Progress
```

To:
```
**Status:** ✅ COMPLETE
**Completed:** [Current date]
**Review Duration:** [Start date] - [End date]
```

### 7. Final Success Message

"**🎉 Security Architecture Review Complete!**

Your comprehensive Security Architecture Review for **{project_name}** is now complete and ready for stakeholder distribution.

**Report Summary:**
- **File:** {outputFile}
- **Sections:** 7 (Executive Summary, Architecture, Threats, Controls, Zero-Trust, Risk Matrix, Recommendations, Roadmap)
- **Threats Identified:** [X] across 6 STRIDE categories
- **Critical Risks:** [Y] requiring immediate action
- **Recommendations:** [Z] specific, actionable mitigations
- **Implementation Timeline:** [Estimated total duration]
- **Risk Reduction:** [Estimated %]

**Next Steps:**

1. **Review with stakeholders** - Share with executives, security leadership, development teams
2. **Prioritize implementation** - Begin Phase 1 quick wins (0-30 days)
3. **Track progress** - Use roadmap as implementation tracking document
4. **Re-assess periodically** - Conduct follow-up reviews as architecture evolves

**The report is located at:**
`{outputFile}`

Would you like me to:
- Generate a condensed one-page summary for executives?
- Create presentation slides from the findings?
- Discuss any specific section in more detail?
- Review next steps for implementation?"

### 8. Mark Workflow Complete

Update frontmatter final status:
- `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`
- `lastStep: 'report-generation'`
- `workflowStatus: 'COMPLETE'`
- `completedDate: [current date]`

**WORKFLOW COMPLETE - No further steps**

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Executive summary generated and user-approved
- Executive summary clear for non-technical stakeholders
- All 7 report sections present and complete
- Report validated against quality checklist
- Frontmatter marked as complete with all 7 steps
- workflowStatus set to 'COMPLETE'
- Final success message displayed with next steps
- Report is stakeholder-ready

### ❌ SYSTEM FAILURE:

- Missing or generic executive summary
- Incomplete report sections
- Technical jargon in executive summary
- Not marking workflow as complete in frontmatter
- Not validating report completeness
- Report not ready for stakeholder distribution

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

---

## WORKFLOW COMPLETION

**🎉 This is the final step. After completing this step, the Security Architecture Review workflow is finished.**

The user now has a comprehensive, stakeholder-ready security assessment report with:
- Executive summary for leadership
- Technical threat analysis (STRIDE)
- Control gap assessment
- Zero-trust maturity evaluation
- Prioritized risk matrix
- Specific, actionable recommendations
- Phased implementation roadmap

**No further steps to load.** Workflow complete.
