---
name: 'step-08-advisory'
description: 'Define ongoing advisory schedule, QBR structure, and finalize engagement document'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/virtual-ciso-consulting'
thisStepFile: '{workflow_path}/steps/step-08-advisory.md'
outputFile: '{output_folder}/vciso/{client_name}/vciso-engagement-{client_name}.md'
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
---

# Step 8: Ongoing Advisory & Review

## STEP GOAL:

To define the ongoing vCISO advisory structure, quarterly business review format, continuous improvement process, success metrics, and finalize the complete engagement document.

## ADVISORY PLANNING PROCESS:

### 1. vCISO Service Delivery Model

Define ongoing engagement model:

**Service Hours per Month:**
- Strategic advisory hours: ___ hours/month
- Tactical support hours: ___ hours/month (if hybrid model)
- On-call availability: Yes/No

**Primary Activities:**
- Weekly/bi-weekly check-ins
- Monthly security operations review
- Quarterly business reviews
- Ad-hoc advisory on demand
- Incident response support

### 2. Meeting Cadence

Define regular meeting schedule:

**Weekly Touch-Base (30 min):**
- Format: Virtual meeting
- Attendees: vCISO + primary stakeholder
- Topics: Current issues, quick decisions, blockers
- No formal agenda

**Monthly Operations Review (1-2 hours):**
- Format: Virtual or in-person
- Attendees: vCISO + security team + IT leadership
- Agenda:
  * KPI review
  * Initiative progress updates
  * Risk register review
  * Upcoming priorities
  * Issues and decisions

**Quarterly Business Review (2-3 hours):**
- Format: In-person preferred
- Attendees: vCISO + executive leadership
- Agenda:
  * Strategic progress review
  * Maturity assessment update
  * Risk posture review
  * Budget vs actual review
  * Board report preparation
  * Next quarter priorities

**Board Presentation (Quarterly, 15-20 min):**
- Format: Board meeting presentation
- Attendees: vCISO presenting to board
- Topics: Per board report template (Step 6)

### 3. Quarterly Business Review Structure

Design detailed QBR format:

**QBR Agenda Template:**

1. **Executive Summary** (5 min)
   - Quarter highlights
   - Key wins
   - Major issues resolved

2. **Security Posture Review** (15 min)
   - Maturity scores (trend)
   - KPI dashboard review
   - Comparison to targets

3. **Strategic Initiative Progress** (20 min)
   - Roadmap progress against plan
   - Completed initiatives
   - In-flight initiatives
   - Blocked or delayed initiatives
   - Next quarter priorities

4. **Risk & Compliance Update** (15 min)
   - Current risk register
   - New risks identified
   - Risk mitigation progress
   - Compliance status
   - Audit/assessment results

5. **Operational Metrics** (10 min)
   - Incident trends
   - Vulnerability metrics
   - Security operations performance

6. **Budget Review** (10 min)
   - Spend vs budget
   - ROI progress
   - Budget adjustments needed

7. **Decisions & Actions** (15 min)
   - Decisions needed from leadership
   - Action items and owners
   - Next quarter focus areas

**QBR Deliverable:**
- Pre-read deck sent 3 days prior
- Live presentation with discussion
- Action item tracker post-meeting

### 4. Continuous Improvement Process

Define improvement cycle:

**Quarterly Retrospective:**
- What worked well?
- What could be improved?
- Lessons learned
- Process adjustments

**Annual Program Assessment:**
- Full maturity reassessment
- Roadmap review and adjustment
- Budget planning for next year
- Strategic alignment check

**Metrics-Driven Improvement:**
- Review KPI trends monthly
- Identify underperforming areas
- Root cause analysis
- Improvement initiatives

### 5. Success Metrics & Engagement Evaluation

Define engagement success criteria:

**Quantitative Metrics:**
- Security maturity improvement: Target +X points per year
- Risk reduction: Target Y% reduction in critical/high risks
- Compliance achievement: Target certifications achieved
- Incident metrics: Target reduction in MTTD/MTTR
- Budget efficiency: Target ROI achieved

**Qualitative Metrics:**
- Executive confidence in security posture
- Board satisfaction with reporting quality
- Security team capability growth
- Cultural shift toward security awareness
- Business enablement (deals enabled by security posture)

**Engagement Satisfaction:**
- Quarterly stakeholder satisfaction survey
- Annual comprehensive engagement review
- Net Promoter Score (NPS) for vCISO services

### 6. Escalation & Support Model

Define escalation for urgent matters:

**Incident Response Support:**
- vCISO availability during incidents
- Escalation to vCISO: Severity High or above
- Response time SLA: X hours for critical

**Ad-hoc Advisory Requests:**
- How to request urgent guidance
- Response time expectations
- Meeting scheduling process

**Emergency Contact:**
- vCISO emergency contact methods
- Backup contact if vCISO unavailable

### 7. Engagement Evolution

Plan for program maturity:

**Year 1 (Foundation):**
- Heavy vCISO involvement (high touch)
- Building fundamentals
- Frequent guidance needed

**Year 2 (Transition):**
- Reduced vCISO hours (medium touch)
- Team gaining independence
- More strategic focus

**Year 3 (Optimization):**
- Light vCISO involvement (strategic only)
- Team self-sufficient
- Innovation and optimization focus

### 8. Generate Executive Summary

Create comprehensive executive summary for document start:

**Executive Summary Content:**
- Client overview (1 paragraph)
- Engagement scope and duration (1 paragraph)
- Current security posture assessment (1-2 paragraphs)
- Strategic recommendations summary (1-2 paragraphs)
- Budget and ROI summary (1 paragraph)
- Key priorities and next steps (bullet list)
- Expected outcomes (1 paragraph)

### 9. Append Section 8 & Executive Summary

Update {outputFile} with:

1. Prepend Executive Summary (after title, before Section 1)
2. Append Section 8 with:
   - Complete advisory schedule
   - QBR structure and template
   - Meeting cadence calendar
   - Continuous improvement process
   - Success metrics framework
   - Escalation model
   - Engagement evolution plan

### 10. Finalize Document

**Mark workflow complete:**

Update frontmatter:
```yaml
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 'advisory'
workflowComplete: true
completedDate: '{current-date}'
```

**Add document footer:**
```markdown

---

## Document Control

**Version:** 1.0
**Status:** Final
**Created:** {engagement-start-date}
**Completed:** {current-date}
**vCISO Consultant:** {user_name}
**Next Review:** {next-review-date}

**Approval Signatures:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| vCISO | {user_name} | ________________ | ___/___/_____ |
| Client Executive | ________________ | ________________ | ___/___/_____ |
| Board Representative | ________________ | ________________ | ___/___/_____ |

---

**End of vCISO Engagement Document**

*This document contains confidential security information. Handle and distribute according to your organization's data classification policies.*
```

### 11. Present MENU OPTIONS

Display: **[A] Advanced Elicitation [E] Export Options [D] Done**

- IF A: "Review engagement success metrics" → {advancedElicitationTask}, then return to menu
- IF E: Display export instructions (PDF, DOCX, presentation slides)
- IF D: Display completion message and exit

**Completion Message:**

"**🎉 vCISO Engagement Document Complete!**

**Client:** {clientName}
**Total Sections:** 8 (all complete)
**Document Location:** `{output-file-path}`

**Engagement Summary:**
✅ Strategic security roadmap defined (3-year plan)
✅ Budget allocated and justified (${budget} with {roi}% ROI)
✅ {maturity-improvement} point maturity improvement planned
✅ {initiative-count} strategic initiatives prioritized
✅ Governance framework designed ({policy-count} policies)
✅ Board reporting and KPI dashboard established
✅ Vendor risk program implemented ({vendor-count} vendors classified)
✅ Ongoing advisory schedule defined

**Next Steps:**
1. Review and approve the engagement document
2. Present to executive leadership and board
3. Begin executing strategic roadmap (Q1 initiatives)
4. Schedule first monthly operations review
5. Prepare for first quarterly business review

**Document Export Options:**
- Markdown: Already saved at {output-file-path}
- PDF: Use markdown-to-PDF converter (Pandoc, Marked 2, etc.)
- DOCX: Use Pandoc or copy to Word with formatting
- Presentation: Extract Section 6 board report template

Thank you for using the vCISO Consulting workflow. Your comprehensive engagement plan is ready for execution!"

**STOP - Workflow Complete**

---

## ✅ SUCCESS:

- Ongoing advisory model defined
- Meeting cadence established
- QBR structure complete
- Continuous improvement process designed
- Success metrics and evaluation criteria set
- Executive summary generated
- Section 8 appended
- Document finalized with all 8 sections
- workflowComplete: true marked
- Professional completion achieved
