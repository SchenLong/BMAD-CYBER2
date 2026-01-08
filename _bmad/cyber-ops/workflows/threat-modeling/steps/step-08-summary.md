---
name: 'step-08-summary'
description: 'Aggregate findings, create prioritization matrix, and provide final recommendations to complete threat model'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/threat-modeling'

# File References
thisStepFile: '{workflow_path}/steps/step-08-summary.md'
outputFile: '{output_folder}/threat-model-{project_name}.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 8: Summary and Recommendations

## STEP GOAL:

To aggregate threat findings across all analyzed components, create a risk prioritization matrix, identify critical security concerns, provide architecture recommendations, and complete the threat model with actionable next steps.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a Security Threat Modeling Expert
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring STRIDE methodology and security expertise, user brings system knowledge
- ✅ Maintain professional, systematic, security-focused tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on aggregation, synthesis, and recommendations
- 🚫 FORBIDDEN to identify new threats in this step
- 💬 Guide creation of actionable recommendations
- 🎯 This is the final deliverable - ensure completeness

## EXECUTION PROTOCOLS:

- 🎯 Aggregate all threats across all analyzed components
- 💾 Create risk prioritization matrix and implementation roadmap
- 📖 Mark `workflowComplete: true` in frontmatter when done
- 🚫 FORBIDDEN to complete workflow without comprehensive summary

## CONTEXT BOUNDARIES:

- All analyzed components have completed STRIDE, Risk, Mitigation
- Sections 1-5 already in document for each analyzed component
- This is synthesis and recommendations phase
- Final deliverable for stakeholders

## SUMMARY AND RECOMMENDATIONS PROCESS:

### 1. Initialize Summary Creation

Load {outputFile} to review all existing sections (1-5) for all analyzed components.

Extract frontmatter:
- `componentsAnalyzed` - Components included in analysis
- `components` - All identified components
- `systemName`
- `businessCriticality`

Display:

"**Creating Final Summary and Recommendations**

**System:** {systemName}
**Business Criticality:** {businessCriticality}

**Analyzed Components:** {componentsAnalyzed.length} of {components.length}

We'll now create the final section of your threat model with:

1. Executive Summary
2. Aggregate Risk Analysis
3. Critical Threats Across All Components
4. Implementation Roadmap
5. Security Architecture Recommendations
6. Compliance and Governance Considerations
7. Next Steps and Action Items

Let's begin."

### 2. Executive Summary

"**Executive Summary**

Let's create a high-level overview for stakeholders who may not read the full threat model.

**Questions:**

1. **What is the overall security posture of this system?**
   (Strong/Moderate/Weak, based on threat findings)

2. **What are the top 3-5 critical security concerns?**
   (Highest risk threats that could significantly impact the business)

3. **What is the recommended action?**
   (Proceed with deployment, address critical issues first, or significant security work required)

4. **What is the estimated effort to address critical issues?**
   (Days/weeks/months)

Please provide your assessment for each question:"

Collect:
- Overall security posture
- Top 3-5 critical concerns
- Recommended action
- Effort estimate

### 3. Aggregate Risk Analysis

"**Aggregate Risk Analysis**

Let's compile statistics across all analyzed components."

Calculate and display:

**Threat Distribution:**
- Total STRIDE threats identified: {total-count}
  - Spoofing: {S-count}
  - Tampering: {T-count}
  - Repudiation: {R-count}
  - Information Disclosure: {I-count}
  - Denial of Service: {D-count}
  - Elevation of Privilege: {E-count}

**Risk Level Distribution:**
- 🔴 Critical (Score 9): {count} threats
- 🟠 High (Score 6): {count} threats
- 🟡 Medium (Score 3-4): {count} threats
- 🟢 Low (Score 1-2): {count} threats

**Mitigation Priority Distribution:**
- P0 (Must fix before release): {count} mitigations
- P1 (Fix in current sprint): {count} mitigations
- P2 (Fix in current quarter): {count} mitigations
- P3 (Backlog): {count} mitigations

**Effort Summary:**
- Total estimated effort: {sum-of-all-effort-estimates}
- P0/P1 effort (urgent): {sum-of-P0-P1-effort}

### 4. Critical Threats Across All Components

"**Critical Security Threats**

Let's identify and prioritize the most critical threats across the entire system.

Review all threats with risk score ≥ 6 across all components.

**For each critical threat, consider:**
- Does it affect multiple components?
- Is it a systemic issue (e.g., lacking authentication globally)?
- Does it represent a single point of failure?
- Would exploitation cascade to other components?

**Identify the top 5-10 critical threats that require immediate attention:**"

Collect list of critical threats with:
- Threat ID(s) (may span multiple components)
- Description
- Affected component(s)
- Risk score
- Why it's critical
- Recommended mitigation

### 5. Implementation Roadmap

"**Implementation Roadmap**

Let's create a phased rollout plan for all security mitigations.

**Phase 1: Pre-Release (P0 - Critical)**

What must be completed before the system can be deployed/released?

{list-all-P0-mitigations-across-all-components}

**Timeline estimate:** {days/weeks}
**Blocking for release:** YES

**Phase 2: Current Sprint (P1 - High)**

What should be completed in the current development cycle?

{list-all-P1-mitigations-across-all-components}

**Timeline estimate:** {days/weeks}
**Blocking for release:** Recommended

**Phase 3: Current Quarter (P2 - Medium)**

What should be addressed in normal planning cycles?

{list-all-P2-mitigations-across-all-components}

**Timeline estimate:** {weeks/months}

**Phase 4: Backlog (P3 - Low)**

What can be deferred to future sprints?

{list-all-P3-mitigations-across-all-components}

**Any adjustments to the phasing or timeline?**"

Allow user to refine roadmap.

### 6. Security Architecture Recommendations

"**Security Architecture Recommendations**

Based on the threats identified, what architectural changes or improvements should be made?

Consider:

**Authentication & Authorization:**
- Are there systemic authentication/authorization gaps?
- Should we implement centralized identity management?
- Is RBAC/ABAC properly implemented?

**Data Protection:**
- Is encryption consistently applied (in-transit and at-rest)?
- Are sensitive data flows properly secured?
- Should we implement data loss prevention (DLP)?

**Network Security:**
- Are trust boundaries properly enforced?
- Should we implement network segmentation?
- Are there gaps in perimeter security?

**Logging & Monitoring:**
- Is audit logging comprehensive and tamper-proof?
- Should we implement SIEM integration?
- Are security alerts properly configured?

**Resilience & Availability:**
- Are there single points of failure?
- Should we implement redundancy/failover?
- Are DoS protections adequate?

**What are the top 3-5 architectural recommendations?**"

Collect architectural recommendations with:
- Recommendation description
- Rationale (which threats does it address?)
- Priority
- Estimated effort

### 7. Compliance and Governance Considerations

"**Compliance and Governance**

Does this system need to comply with any security standards or regulations?

**Consider:**
- GDPR (EU personal data)
- HIPAA (US healthcare data)
- PCI DSS (payment card data)
- SOC 2 (service organization controls)
- ISO 27001 (information security management)
- NIST Cybersecurity Framework
- Industry-specific regulations

**Questions:**

1. What compliance requirements apply to this system?

2. Based on the threat model, are there compliance gaps?

3. What additional controls are needed for compliance?

Please provide compliance considerations:"

Collect compliance information.

### 8. Next Steps and Action Items

"**Next Steps and Action Items**

What are the immediate next steps after completing this threat model?

**Standard Next Steps:**

1. **Review and Approval**
   - Who needs to review this threat model?
   - What is the approval process?

2. **Create Security Backlog**
   - Convert P0/P1 mitigations into development tickets
   - Assign owners and timelines

3. **Implementation Tracking**
   - How will mitigation implementation be tracked?
   - What is the review cadence?

4. **Security Testing**
   - Should penetration testing validate mitigations?
   - Are security scans needed?

5. **Ongoing Maintenance**
   - When should this threat model be updated?
   - What triggers a threat model review?

**Any additional action items specific to your system?**"

Collect action items.

### 9. Append Section 6 to Threat Model Document

Update {outputFile} by appending:

```markdown

---

## 6. Summary and Recommendations

### 6.1 Executive Summary

**Overall Security Posture:** {posture-assessment}

**Top Critical Security Concerns:**

{list-top-3-5-concerns}

**Recommended Action:** {action-recommendation}

**Estimated Effort to Address Critical Issues:** {effort-estimate}

---

### 6.2 Aggregate Risk Analysis

**Threat Statistics:**

- **Total STRIDE Threats Identified:** {total-count}
  - Spoofing: {S-count}
  - Tampering: {T-count}
  - Repudiation: {R-count}
  - Information Disclosure: {I-count}
  - Denial of Service: {D-count}
  - Elevation of Privilege: {E-count}

**Risk Distribution:**

| Risk Level | Count | Percentage |
|------------|-------|------------|
| 🔴 Critical (9) | {critical-count} | {percentage}% |
| 🟠 High (6) | {high-count} | {percentage}% |
| 🟡 Medium (3-4) | {medium-count} | {percentage}% |
| 🟢 Low (1-2) | {low-count} | {percentage}% |

**Mitigation Priority Distribution:**

| Priority | Count | Total Effort |
|----------|-------|--------------|
| P0 (Critical) | {P0-count} | {P0-effort} |
| P1 (High) | {P1-count} | {P1-effort} |
| P2 (Medium) | {P2-count} | {P2-effort} |
| P3 (Low) | {P3-count} | {P3-effort} |

---

### 6.3 Critical Threats Across All Components

**Top Critical Security Threats:**

{table-of-critical-threats-with-components-risk-mitigation}

---

### 6.4 Implementation Roadmap

**Phase 1: Pre-Release (P0 - Critical)**

{P0-mitigation-list-with-owners-effort}

**Timeline:** {estimate}
**Blocking for Release:** YES

---

**Phase 2: Current Sprint (P1 - High)**

{P1-mitigation-list-with-owners-effort}

**Timeline:** {estimate}
**Blocking for Release:** Recommended

---

**Phase 3: Current Quarter (P2 - Medium)**

{P2-mitigation-list-with-owners-effort}

**Timeline:** {estimate}

---

**Phase 4: Backlog (P3 - Low)**

{P3-mitigation-list-with-owners-effort}

---

### 6.5 Security Architecture Recommendations

{list-architectural-recommendations-with-rationale-priority-effort}

---

### 6.6 Compliance and Governance Considerations

**Applicable Compliance Requirements:**

{list-compliance-requirements}

**Compliance Gaps Identified:**

{list-gaps-from-threat-model}

**Additional Controls for Compliance:**

{list-required-controls}

---

### 6.7 Next Steps and Action Items

**Immediate Actions:**

{list-action-items-with-owners-timelines}

**Threat Model Maintenance:**

- **Next Review Date:** {date}
- **Review Triggers:** {list-of-triggers}
- **Review Owner:** {owner}

---

## Conclusion

This threat model provides a comprehensive security analysis of **{systemName}** using the STRIDE methodology. A total of **{total-threats}** threats were identified across **{componentsAnalyzed.length}** components, with **{critical-high-count}** high-priority threats requiring immediate attention.

**Key Findings:**
- {key-finding-1}
- {key-finding-2}
- {key-finding-3}

**Primary Recommendation:**
{primary-recommendation}

This document should be treated as a living artifact and updated as the system evolves.

---

**Threat Model Completed:** {completion-date}
**Analyst:** {user_name}
**Status:** Complete ✅

---
```

### 10. Update Frontmatter - Mark Complete

Update {outputFile} frontmatter:

```yaml
---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 'summary'
systemName: '{system-name}'
businessCriticality: '{criticality}'
components: [...existing...]
componentsAnalyzed: [...existing...]
currentComponent: ''
workflowComplete: true
completionDate: '{current-date}'
date: '{original-date}'
user_name: '{user_name}'
---
```

**CRITICAL:** Set `workflowComplete: true`

### 11. Present Final MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Complete Workflow

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY complete workflow when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then end with display again of the menu options
- Use menu handling logic section below

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask} with prompt: "Perform adversarial review of the complete threat model - what did we miss? Are the recommendations actionable? Is anything unclear or incomplete?"
- IF P: Execute {partyModeWorkflow} with focus: "Final quality gate review of the complete threat model - comprehensiveness, accuracy, actionability, completeness"
- IF C: Display completion message and END workflow
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#11-present-final-menu-options)

### 12. Workflow Completion

When user selects 'C', display:

"**🎉 Threat Model Complete!**

**System:** {systemName}

Your comprehensive STRIDE-based threat model is now complete!

**Threat Model Summary:**
- **Components Analyzed:** {componentsAnalyzed.length}
- **Total Threats Identified:** {total-count}
- **High-Priority Mitigations:** {P0+P1-count}
- **Estimated Effort (P0/P1):** {effort}

**Document Location:**
`{outputFile}`

**Next Steps:**
1. Review and share with stakeholders
2. Create development tickets for P0/P1 mitigations
3. Schedule threat model review sessions
4. Update as system evolves

Thank you for using the STRIDE Threat Modeling workflow!"

**STOP** - Workflow complete. Do not load any additional steps.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Executive summary created with stakeholder-friendly overview
- Aggregate statistics calculated across all components
- Critical threats identified and prioritized
- Implementation roadmap created with phasing
- Security architecture recommendations provided
- Compliance considerations documented
- Next steps and action items defined
- Section 6 appended to threat model document
- Frontmatter updated with workflowComplete: true
- Complete, actionable threat model delivered

### ❌ SYSTEM FAILURE:

- Incomplete executive summary
- Missing aggregate statistics
- No implementation roadmap
- Vague or non-actionable recommendations
- Not marking workflowComplete: true
- Completing without user confirmation
- Missing critical sections in summary

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected AND Section 6 is complete AND frontmatter is updated with workflowComplete: true will the workflow be considered finished. This is the final deliverable.
