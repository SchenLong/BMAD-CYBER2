# Virtual CISO Consulting Workflow

Comprehensive vCISO engagement workflow for security consultants providing strategic security advisory services.

## Overview

This workflow guides security consultants through a complete vCISO engagement lifecycle, producing a comprehensive strategic security document covering all aspects of security leadership from assessment through ongoing advisory.

## Workflow Structure

**Type:** Linear Document Workflow (8 steps + 2 supporting files)
**Duration:** Multi-session (typically 4-8 hours of consultant time across multiple sessions)
**Output:** Professional vCISO Engagement Document (Markdown, ~50-100 pages)

## What This Workflow Produces

A comprehensive vCISO engagement document containing:

1. **Engagement Overview** - Scope, stakeholders, timeline, RACI, service model
2. **Budget & Resource Plan** - Security budget breakdown, ROI framework, 3-year projection
3. **Current State Assessment** - Security maturity scores, gap analysis, risk register
4. **Strategic Security Roadmap** - 3-year strategic plan with quarterly milestones
5. **Governance Framework** - Policies, committees, decision frameworks, RACI matrix
6. **Executive Communications** - Board reports, KPI dashboards, communication plans
7. **Vendor Risk Program** - Vendor risk framework, tier classification, assessment templates
8. **Advisory Schedule** - Ongoing engagement model, QBR structure, success metrics

## Who Should Use This

- **Security Consultants** providing vCISO services to clients
- **MSPs/MSSPs** offering virtual CISO packages
- **Internal Security Leaders** structuring a new security program
- **Interim CISOs** establishing security strategy for organizations

## Key Features

✅ **Budget-First Approach** - Budget planning integrated early (Step 2) ensures realistic recommendations
✅ **Strategic Focus** - Business-aligned security strategy, not just technical controls
✅ **Board-Ready Deliverables** - Executive communications in business language
✅ **Multi-Session Support** - Resume from any step via automatic state tracking
✅ **Collaborative Tools** - Party Mode, Brainstorming, Advanced Elicitation integrated at key steps
✅ **Comprehensive Scope** - Covers entire vCISO engagement lifecycle end-to-end
✅ **Professional Quality** - Client-ready deliverables, not draft templates

## Workflow Steps

### Step 1: Initialization & Engagement Setup
- Gather client context (company size, industry, regulatory requirements)
- Define engagement parameters (duration, service level, focus areas)
- Map stakeholders and establish RACI
- Create engagement document with Section 1

### Step 2: Budget & Resource Planning
- Assess current security spend
- Plan budget across 5 categories (People, Technology, Services, Compliance, Operations)
- Build ROI framework with quantified business value
- Create 3-year budget projection
- **Tools:** Brainstorming for budget optimization

### Step 3: Current State Assessment
- Assess security maturity across 10 domains (0-5 scale)
- Conduct gap analysis against best practices
- Build prioritized risk register
- Evaluate existing control effectiveness
- **Tools:** Party Mode for collaborative assessment validation

### Step 4: Strategic Planning & Roadmap
- Define 3-year security vision and strategic objectives
- Identify and prioritize strategic initiatives
- Create quarterly roadmap with milestones
- Align initiatives to budget and resources
- Establish success metrics and KPIs
- **Tools:** Party Mode for prioritization, Advanced Elicitation for critical review

### Step 5: Governance Framework Design
- Design policy hierarchy (strategic, operational, technical)
- Establish security committees with charters
- Create decision frameworks and escalation paths
- Define roles and responsibilities (RACI)
- Build compliance management framework
- **Tools:** Party Mode for framework design, Brainstorming for governance models

### Step 6: Board/Executive Reporting
- Create board report template (quarterly)
- Design KPI dashboard with executive metrics
- Establish communication cadence (board, executives, all-hands)
- Define incident escalation communication plan
- **Tools:** Brainstorming for KPI ideation, Advanced Elicitation for quality review

### Step 7: Vendor/Third-Party Risk Program
- Inventory current vendors
- Design 4-tier vendor classification system
- Create risk assessment framework
- Build assessment templates for each tier
- Define contract security requirements
- Establish ongoing monitoring process

### Step 8: Ongoing Advisory & Review
- Define vCISO service delivery model
- Establish meeting cadence (weekly, monthly, quarterly)
- Design Quarterly Business Review (QBR) structure
- Create continuous improvement process
- Set engagement success metrics
- Generate executive summary
- Finalize complete engagement document
- **Tools:** Advanced Elicitation for metrics validation

## Integration Points

### Core BMAD Tools
- **Party Mode:** Steps 3, 4, 5 - Collaborative assessment, strategy, governance design
- **Advanced Elicitation:** Steps 4, 6, 8 - Critical review of recommendations and metrics
- **Brainstorming:** Steps 2, 5, 6 - Budget optimization, governance models, KPI ideation

### LLM Capabilities
- **Web-Browsing:** Research security benchmarks, vendor information, compliance updates
- **File I/O:** Create/manage engagement document, generate exportable templates

## Prerequisites

### Consultant Skills
- Strategic security leadership experience
- Understanding of security frameworks (NIST, ISO 27001, CIS Controls)
- Budget planning and ROI articulation
- Executive communication and board presentations
- Risk management and governance expertise

### Client Information Needed
- Company profile (size, industry, regulatory requirements)
- Current security posture and team structure
- Budget constraints and approval processes
- Strategic business objectives and priorities
- Stakeholder availability for collaboration

## Output Document

**File:** `{output_folder}/vciso/{client-name}/vciso-engagement-{client-name}.md`

**Format:** Markdown with YAML frontmatter for state tracking

**Size:** Typically 50-100 pages (10,000-20,000 words)

**Sections:** 8 major sections + executive summary

**State Tracking:** Frontmatter tracks completion progress for multi-session support

**Export Options:**
- **PDF:** Use Pandoc or Marked 2 for professional PDF export
- **DOCX:** Use Pandoc for Microsoft Word format
- **Presentation:** Extract board report section for slides

## Multi-Session Support

This workflow supports pausing and resuming:

- **State Tracking:** Frontmatter maintains `stepsCompleted` array
- **Automatic Resume:** Step-01-init detects existing documents and routes to step-01b-continue
- **Flexible Scheduling:** Complete steps across multiple days/weeks as needed
- **No Data Loss:** All progress saved after each step completion

## Usage Example

```bash
# Start new vCISO engagement
claude code

> /virtual-ciso-consulting

# Follow prompts through all 8 steps
# Save and resume anytime by running the same command
```

## Success Criteria

A successful vCISO engagement document includes:

✅ **Strategic Alignment:** Recommendations aligned with business objectives and constraints
✅ **Budget Realism:** All initiatives budget-aligned (no "boil the ocean" proposals)
✅ **Executive Quality:** Board-ready communications in business language
✅ **Actionable Roadmap:** Clear priorities, owners, timelines, and success criteria
✅ **Professional Delivery:** Client-ready quality, customized for specific organization
✅ **Measurable Outcomes:** Quantified ROI and success metrics

## Typical Engagement Timeline

**Session 1** (1-2 hours): Steps 1-2 (Setup & Budget)
**Session 2** (2-3 hours): Steps 3-4 (Assessment & Strategy)
**Session 3** (1-2 hours): Steps 5-6 (Governance & Reporting)
**Session 4** (1-2 hours): Steps 7-8 (Vendor Risk & Advisory)

**Total Consultant Time:** 5-9 hours across 2-4 sessions

## Support & Feedback

For issues, enhancements, or questions about this workflow:
- **Module:** cyber-ops
- **Workflow:** virtual-ciso-consulting
- **Version:** 1.0.0

## License

Part of the BMAD Cyber-Ops Module.
