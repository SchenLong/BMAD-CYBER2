---
stepsCompleted: [1, 2, 3, 4, 5]
---

# Workflow Creation Plan: virtual-ciso-consulting

## Initial Project Context

- **Module:** cyber-ops
- **Target Location:** /Users/paultinp/BMAD-CYBER2/_bmad/cyber-ops/workflows/virtual-ciso-consulting/
- **Created:** 2026-01-08

## Workflow Scope

**Purpose:** Comprehensive virtual CISO (vCISO) consulting engagement workflow covering all strategic security advisory activities.

**Key Activities:**
- Strategic security planning & roadmap development
- Board reporting & executive communication
- Security program maturity assessment
- Risk management & governance oversight
- Vendor/third-party risk assessment

**Target Users:**
- Security consultants providing vCISO services
- Internal teams structuring security leadership
- MSPs/MSSPs offering vCISO packages

## Design Approach

This workflow will guide consultants through a complete vCISO engagement lifecycle, from initial assessment through ongoing strategic advisory services.

---

## Requirements Gathered

### 1. Workflow Purpose and Scope

**Primary Problem Solved:**
Organizations need strategic security guidance but can't afford/don't need a full-time CISO. Consultants need a structured approach to deliver consistent, professional vCISO engagements that cover the full lifecycle from assessment through ongoing advisory.

**Primary Outcome/Deliverable:**
A comprehensive vCISO engagement document containing all strategic deliverables across the engagement lifecycle: assessment, budget planning, strategic roadmap, governance framework, board reporting, vendor risk program, and ongoing advisory plan.

### 2. Workflow Type Classification

**Type:** Hybrid Document Workflow
- Guides consultants through vCISO engagement phases with interactive collaboration
- Produces strategic security documents and deliverables at each stage
- Combines consultant expertise with structured methodology

### 3. Workflow Flow and Step Structure

**Pattern:** Linear Engagement Lifecycle (8 phases)

**Step Sequence:**
1. **Init & Engagement Setup** - Scope, stakeholders, engagement model definition
2. **Budget & Resource Planning** - Security budget definition, resource allocation, ROI framework
3. **Current State Assessment** - Security maturity scoring, gap analysis, risk identification
4. **Strategic Planning & Roadmap** - Multi-year security strategy with quarterly milestones
5. **Governance Framework Design** - Policies, standards, committees, decision frameworks
6. **Board/Executive Reporting** - Executive briefings, board reports, KPI dashboards
7. **Vendor/Third-Party Risk** - Vendor assessment program, supply chain security
8. **Ongoing Advisory & Review** - Continuous improvement, quarterly reviews, incident advisory

**Key Feature:** Budget definition is integrated early (step 2) to ensure all recommendations are budget-aligned and realistic.

### 4. User Interaction Style

**Collaboration Level:** Mixed approach based on phase
- **Highly collaborative** during assessment phases (gathering current state, understanding business context, stakeholder interviews)
- **Moderately collaborative** during strategy/planning (consultant expertise with stakeholder input on priorities)
- **Consultant-driven** for document generation (board reports, policies, frameworks) with review checkpoints

**Decision Points:**
- Engagement scope and service level
- Budget allocation priorities
- Strategic initiative prioritization
- Governance model selection
- Vendor risk tier classification

### 5. Instruction Style

**Hybrid Approach:**
- **Intent-Based** for assessment/discovery phases (flexible, adaptive, context-aware)
  - Allows natural conversation flow
  - Adapts to organization size, industry, maturity level
- **Prescriptive** for frameworks/templates (structured, consistent, reusable)
  - Budget templates with standard categories
  - Board report formats
  - Maturity scoring rubrics
  - Policy templates

This mix ensures flexibility where needed while maintaining consistency in deliverables.

### 6. Input Requirements

**Organization Context (gathered in init):**
- Company size, industry, regulatory requirements
- Current security team structure and capabilities
- Recent security incidents, audits, or compliance findings
- Existing security documentation and controls
- Technology stack and architecture overview

**Engagement Parameters (gathered in init):**
- Engagement duration (3 months, 6 months, ongoing retainer)
- Service level (strategic advisory only, hands-on tactical support, hybrid)
- Specific focus areas or pain points (compliance, incident response, cloud security, etc.)
- Key stakeholders and decision makers

**Progressive Discovery:**
- Budget constraints and approval processes (step 2)
- Detailed control inventory (step 3)
- Business priorities and risk tolerance (step 4)
- Existing governance structures (step 5)
- Current vendor landscape (step 7)

### 7. Output Specifications

**Primary Output:** Comprehensive vCISO Engagement Document (Markdown with frontmatter state tracking)

**Document Structure (8 Sections):**

**Section 1: Engagement Overview**
- Scope, objectives, success criteria
- Stakeholder map and RACI
- Timeline and milestones
- Engagement model and service levels

**Section 2: Budget & Resource Plan**
- Security budget breakdown by category
- Resource allocation (people, tools, services)
- ROI framework and cost-benefit analysis
- Multi-year budget projection

**Section 3: Current State Assessment**
- Security maturity scores (by domain)
- Gap analysis matrix
- Risk register with prioritization
- Control effectiveness assessment

**Section 4: Strategic Security Roadmap**
- 3-year strategic vision
- Quarterly milestone plan
- Initiative prioritization (P0-P3)
- Dependencies and sequencing

**Section 5: Governance Framework**
- Security policies and standards catalog
- Security committee structure (charter, membership, cadence)
- Decision frameworks and escalation paths
- Roles and responsibilities matrix

**Section 6: Executive Communications**
- Board report template with key metrics
- Executive dashboard (KPIs and risk indicators)
- Communication cadence and formats
- Incident escalation communication plan

**Section 7: Vendor Risk Program**
- Vendor risk assessment framework
- Vendor tier classification (critical, high, medium, low)
- Assessment templates and questionnaires
- Ongoing monitoring and review process

**Section 8: Advisory Schedule**
- Ongoing advisory meeting cadence
- Quarterly business review structure
- Continuous improvement process
- Engagement success metrics

**Additional Exportable Artifacts:**
- Board presentation template (can be extracted from Section 6)
- Policy templates (from Section 5)
- Vendor assessment questionnaire (from Section 7)
- Budget template (from Section 2)

**Format Features:**
- Frontmatter with `stepsCompleted` array for multi-session support
- Professional markdown formatting suitable for export to PDF/presentations
- Tables, matrices, and structured data throughout
- Executive summary section at document start

### 8. Success Criteria

**Quality Criteria:**
- ✅ Strategic recommendations aligned with business objectives and budget constraints
- ✅ Actionable roadmap with clear priorities, owners, and resource requirements
- ✅ Board-ready communications that resonate with executives (business language, not just technical)
- ✅ Comprehensive yet practical governance framework (not shelf-ware)
- ✅ All deliverables production-ready (customized for client, not generic templates)
- ✅ Budget-realistic recommendations (no "boil the ocean" proposals)

**Measurable Outcomes:**
- ✅ Complete engagement document with all 8 sections fully populated
- ✅ Budget plan with specific allocations and ROI justifications
- ✅ Risk-prioritized roadmap with quarterly milestones
- ✅ Clear accountability (RACI) for each strategic initiative
- ✅ Defined quarterly review checkpoints and success metrics

**User Satisfaction:**
- ✅ Consultant feels equipped to deliver high-value, professional advisory services
- ✅ Client receives strategic, actionable guidance (not just compliance checkbox)
- ✅ Engagement artifacts can be reused/adapted for future clients
- ✅ Workflow scales across client sizes (startup to enterprise)
- ✅ Deliverables demonstrate consultant expertise and strategic thinking

**Engagement Success Indicators:**
- Client understands their security posture and strategic path forward
- Budget is allocated to highest-impact initiatives
- Governance structures enable effective decision-making
- Board and executives are informed and engaged
- vCISO becomes trusted strategic advisor (not just vendor)

---

## Tools Configuration

### Core BMAD Tools

**Party-Mode:** ✅ Included
- **Integration Points:**
  - Step 3 (Current State Assessment): Collaborate on maturity scoring and gap analysis
  - Step 4 (Strategic Planning): Collaborative prioritization and roadmap design
  - Step 5 (Governance Framework): Policy framework design and committee structure

**Advanced Elicitation:** ✅ Included
- **Integration Points:**
  - Step 4 (Strategic Planning): Critical review of strategic recommendations
  - Step 6 (Board Reporting): Quality assurance for executive communications
  - Step 8 (Advisory Schedule): Review engagement success metrics and improvement areas

**Brainstorming:** ✅ Included
- **Integration Points:**
  - Step 2 (Budget Planning): Creative approaches to budget optimization and ROI
  - Step 5 (Governance Framework): Innovative governance models and decision frameworks
  - Step 6 (Board Reporting): KPI and metrics ideation

### LLM Features

**Web-Browsing:** ✅ Included
- **Use Cases:**
  - Research current security benchmarks and industry best practices
  - Vendor/technology research for recommendations
  - Compliance framework updates and regulatory changes
  - Industry-specific threat intelligence and security trends

**File I/O:** ✅ Included
- **Operations:**
  - Create and manage vCISO engagement document
  - Generate exportable artifacts (templates, questionnaires, presentations)
  - Read existing security documentation when provided
  - Save interim work and allow multi-session continuation

**Sub-Agents:** ❌ Not Included
- **Rationale:** vCISO workflow is consultant-led and sequential; no need for parallel specialized agents

**Sub-Processes:** ❌ Not Included
- **Rationale:** Linear workflow without parallel processing requirements

### Memory Systems

**Sidecar File:** ❌ Not Included
- **Rationale:**
  - Frontmatter state tracking (`stepsCompleted` array) sufficient for session continuity
  - Each engagement is client-specific (not learning across engagements)
  - Continuation handled via step-01b-continue.md pattern

### External Integrations

**No external integrations required**
- **Rationale:**
  - Workflow is document-focused and consultative
  - No database, API, or automation tool dependencies
  - Web-browsing provides sufficient external data access
  - File I/O handles all document operations

### Installation Requirements

**No installation required** ✅
- All selected tools are built-in BMAD capabilities
- No MCP servers or external dependencies
- Workflow is immediately deployable after generation

---

## Output Format Design

**Format Type**: Structured

**Output Requirements**:
- **Document type**: Professional vCISO engagement report/document
- **File format**: Markdown (.md) with frontmatter for state tracking
- **Frequency**: Single document per engagement, built progressively across workflow steps
- **File naming**: `vciso-engagement-{client-name}.md`
- **Location**: `{output_folder}/vciso/{client-name}/`

**Structure Specifications**:

**Frontmatter (Required for all outputs)**:
```yaml
---
stepsCompleted: [array of completed step numbers]
lastStep: 'step-name'
clientName: 'organization-name'
engagementStart: 'YYYY-MM-DD'
engagementDuration: 'duration'
serviceLevel: 'strategic|tactical|hybrid'
workflowComplete: false
---
```

**Document Structure (8 Required Sections)**:

**Section 1: Engagement Overview**
- Subsections: Scope, Objectives, Success Criteria, Stakeholder Map (RACI), Timeline & Milestones, Engagement Model
- Format: Headings (##), tables for RACI, lists for objectives
- Content: Consultant-led with client input during init

**Section 2: Budget & Resource Plan**
- Subsections: Budget Breakdown by Category, Resource Allocation, ROI Framework, Multi-Year Projection
- Format: Tables for budget breakdown, charts/diagrams for projections
- Content: Collaborative budget planning with realistic allocations

**Section 3: Current State Assessment**
- Subsections: Security Maturity Scores, Gap Analysis Matrix, Risk Register, Control Effectiveness
- Format: Scoring rubrics (tables), gap matrix, prioritized risk list
- Content: Consultant assessment with client validation

**Section 4: Strategic Security Roadmap**
- Subsections: 3-Year Vision, Quarterly Milestones, Initiative Prioritization, Dependencies
- Format: Timeline visualization, priority matrix (P0-P3), Gantt-style tables
- Content: Strategic recommendations with business alignment

**Section 5: Governance Framework**
- Subsections: Policies & Standards Catalog, Committee Structure, Decision Frameworks, RACI Matrix
- Format: Tables for policies, org charts for committees, flowcharts for decisions
- Content: Framework design with organizational fit

**Section 6: Executive Communications**
- Subsections: Board Report Template, KPI Dashboard, Communication Cadence, Escalation Plan
- Format: Executive-ready templates, metrics tables, communication matrix
- Content: Board-ready artifacts with business language

**Section 7: Vendor Risk Program**
- Subsections: Risk Framework, Tier Classification, Assessment Templates, Monitoring Process
- Format: Risk matrix, vendor tier table, questionnaire templates
- Content: Vendor risk methodology with templates

**Section 8: Advisory Schedule**
- Subsections: Meeting Cadence, QBR Structure, Continuous Improvement, Success Metrics
- Format: Calendar tables, meeting agendas, metrics dashboard
- Content: Ongoing engagement plan with accountability

**Formatting Standards**:
- Professional markdown formatting (suitable for PDF export)
- Clear section hierarchy (# for title, ## for sections, ### for subsections)
- Tables for structured data (RACI, budgets, matrices, scores)
- Bullet lists for action items and recommendations
- Numbered lists for prioritized initiatives
- Code blocks for policy templates or technical specifications
- Blockquotes for executive summaries or key findings

**Progressive Building Pattern**:
- Each workflow step appends its designated section(s)
- Frontmatter updated after each step completion
- Section completed markers ensure no duplicate content
- Multi-session support via frontmatter state tracking

**Special Considerations**:
- **Professional Quality**: All content must be client-ready, not draft/template quality
- **Executive Readability**: Use business language, minimize jargon, include executive summaries
- **Exportability**: Format must render cleanly in PDF/DOCX conversion
- **Customization**: No generic placeholders - all content tailored to specific client
- **Confidentiality**: Document contains sensitive organizational security information
- **Versioning**: Include document version and last updated date in frontmatter

**Template Information**:
- **Template source**: Created (standard vCISO engagement structure)
- **Template file**: Not applicable (progressive building, not single template)
- **Placeholders**: Dynamic variables from init step (client name, dates, scope, etc.)
- **Section Ownership**: Each step owns specific sections, appends when complete


---

## Workflow Structure Design

### Step Sequence (10 files total)

**Core Workflow Steps (9 steps + 1 continuation)**:

1. **step-01-init.md** - Initialization & Engagement Setup
   - Goal: Capture client context, engagement parameters, create initial document
   - Inputs: Organization info, engagement scope, stakeholders
   - Outputs: Section 1 (Engagement Overview) in output document
   - Continuation detection: Check for existing document, route to step-01b if needed
   - Menu: [C] Continue to Budget Planning

2. **step-01b-continue.md** - Continuation Handler
   - Goal: Resume existing vCISO engagement workflow
   - Logic: Read stepsCompleted from frontmatter, route to appropriate next step
   - No menu: Automatic routing based on state

3. **step-02-budget.md** - Budget & Resource Planning
   - Goal: Define security budget with ROI framework
   - Inputs: Budget constraints, approval processes, current spend
   - Outputs: Section 2 (Budget & Resource Plan)
   - Tools: Brainstorming for budget optimization ideas
   - Menu: [B] Brainstorming [C] Continue to Assessment

4. **step-03-assessment.md** - Current State Assessment
   - Goal: Assess security maturity, identify gaps and risks
   - Inputs: Existing controls, documentation, recent incidents
   - Outputs: Section 3 (Current State Assessment)
   - Tools: Party Mode for collaborative maturity scoring
   - Menu: [P] Party Mode [C] Continue to Strategic Planning

5. **step-04-strategy.md** - Strategic Planning & Roadmap
   - Goal: Create 3-year security strategy with quarterly milestones
   - Inputs: Assessment results, budget, business priorities
   - Outputs: Section 4 (Strategic Security Roadmap)
   - Tools: Party Mode for collaborative prioritization, Advanced Elicitation for critical review
   - Menu: [P] Party Mode [A] Advanced Elicitation [C] Continue to Governance

6. **step-05-governance.md** - Governance Framework Design
   - Goal: Design policies, committees, and decision frameworks
   - Inputs: Organizational structure, existing governance
   - Outputs: Section 5 (Governance Framework)
   - Tools: Party Mode for framework design, Brainstorming for governance models
   - Menu: [P] Party Mode [B] Brainstorming [C] Continue to Executive Reporting

7. **step-06-reporting.md** - Board/Executive Reporting
   - Goal: Create board reports, KPI dashboards, communication plans
   - Inputs: Strategy, governance, stakeholder requirements
   - Outputs: Section 6 (Executive Communications)
   - Tools: Brainstorming for KPI ideation, Advanced Elicitation for quality review
   - Menu: [B] Brainstorming [A] Advanced Elicitation [C] Continue to Vendor Risk

8. **step-07-vendor-risk.md** - Vendor/Third-Party Risk Program
   - Goal: Design vendor risk assessment framework
   - Inputs: Current vendor landscape, criticality
   - Outputs: Section 7 (Vendor Risk Program)
   - Menu: [C] Continue to Advisory Schedule

9. **step-08-advisory.md** - Ongoing Advisory & Review
   - Goal: Define ongoing engagement structure and success metrics
   - Inputs: Complete engagement plan
   - Outputs: Section 8 (Advisory Schedule)
   - Tools: Advanced Elicitation for engagement metrics review
   - Menu: [A] Advanced Elicitation [C] Finalize Engagement Document
   - Final: Mark workflowComplete: true, generate executive summary

### Continuation Support

**Enabled:** Yes
- **Reason**: Large comprehensive document, likely multi-session, complex assessments
- **Pattern**: step-01-init detects existing document, routes to step-01b-continue
- **State Tracking**: stepsCompleted array in frontmatter updated after each step
- **Routing Logic in step-01b**:
  ```
  if stepsCompleted includes 8 → "Workflow complete, option to review/modify"
  if stepsCompleted includes 7 → route to step-08-advisory
  if stepsCompleted includes 6 → route to step-07-vendor-risk
  if stepsCompleted includes 5 → route to step-06-reporting
  if stepsCompleted includes 4 → route to step-05-governance
  if stepsCompleted includes 3 → route to step-04-strategy
  if stepsCompleted includes 2 → route to step-03-assessment
  if stepsCompleted includes 1 → route to step-02-budget
  ```

### Interaction Patterns

**Collaboration Levels by Step**:
- **Steps 1-3** (Init, Budget, Assessment): Highly collaborative - extensive user input
- **Steps 4-6** (Strategy, Governance, Reporting): Moderately collaborative - consultant-led with validation
- **Steps 7-8** (Vendor Risk, Advisory): Consultant-driven - structured templates with minimal input

**Menu Options Strategy**:
- Core tools (Party Mode, Advanced Elicitation, Brainstorming) offered at relevant steps
- [C] Continue always present after step completion
- No [M] Modify - users can restart from any step via continuation
- Menu always halts execution until user selection

**Progress Indicators**:
- stepsCompleted array shows progress (e.g., [1, 2, 3] = 3 of 8 complete)
- Each step displays "Step X of 8" in welcome message
- Document sections visible as they're appended

### Data Flow

**Input → Processing → Output Pattern**:

```
Init (Step 1):
  Input: Client context, engagement scope
  Processing: Stakeholder mapping, timeline design
  Output: Section 1 + frontmatter initialization

Budget (Step 2):
  Input: Budget constraints, current spend
  Processing: Budget optimization, ROI calculation
  Output: Section 2 appended

Assessment (Step 3):
  Input: Existing controls, documentation
  Processing: Maturity scoring, gap analysis, risk prioritization
  Output: Section 3 appended

Strategy (Step 4):
  Input: Assessment results + budget
  Processing: Prioritization, roadmap design, milestone planning
  Output: Section 4 appended

Governance (Step 5):
  Input: Organizational structure
  Processing: Policy framework, committee design
  Output: Section 5 appended

Reporting (Step 6):
  Input: Strategy + governance
  Processing: Board report generation, KPI definition
  Output: Section 6 appended

Vendor Risk (Step 7):
  Input: Vendor landscape
  Processing: Risk framework, tier classification
  Output: Section 7 appended

Advisory (Step 8):
  Input: Complete engagement plan
  Processing: QBR structure, success metrics
  Output: Section 8 appended + executive summary + workflowComplete: true
```

**State Persistence**:
- After each step: Update frontmatter with stepsCompleted
- All data persists in single output document
- Continuation reads document to restore state

**Error Handling**:
- Missing required fields: Prompt for input, don't proceed
- Document not found: Step-01-init creates new
- Corrupted frontmatter: Error message, restart from init
- Incomplete step: Continuation detects via stepsCompleted, resumes correctly

### File Structure

```
/virtual-ciso-consulting/
├── workflow.md                    # Main workflow configuration
├── README.md                      # User-facing documentation
├── steps/
│   ├── step-01-init.md           # Initialization & engagement setup
│   ├── step-01b-continue.md      # Continuation handler
│   ├── step-02-budget.md         # Budget & resource planning
│   ├── step-03-assessment.md     # Current state assessment
│   ├── step-04-strategy.md       # Strategic planning & roadmap
│   ├── step-05-governance.md     # Governance framework design
│   ├── step-06-reporting.md      # Board/executive reporting
│   ├── step-07-vendor-risk.md    # Vendor/third-party risk
│   └── step-08-advisory.md       # Ongoing advisory & review
```

**Output File Location**:
- Path: `{output_folder}/vciso/{client-name}/vciso-engagement-{client-name}.md`
- Created by: step-01-init
- Modified by: All subsequent steps (append sections)
- Format: Markdown with YAML frontmatter

### Quality Assurance Integration Points

**Party Mode Integration** (Collaborative Review):
- Step 3 (Assessment): Maturity scoring validation
- Step 4 (Strategy): Roadmap prioritization
- Step 5 (Governance): Framework design review

**Advanced Elicitation Integration** (Critical Review):
- Step 4 (Strategy): Strategic recommendations adversarial review
- Step 6 (Reporting): Executive communications quality check
- Step 8 (Advisory): Engagement metrics validation

**Brainstorming Integration** (Creative Ideation):
- Step 2 (Budget): Budget optimization approaches
- Step 5 (Governance): Innovative governance models
- Step 6 (Reporting): KPI and metrics ideation

### Success Criteria per Step

**Step 1 (Init)**: Engagement scope clearly defined, stakeholders mapped, timeline set
**Step 2 (Budget)**: Realistic budget allocated across categories with ROI justification
**Step 3 (Assessment)**: Complete maturity scoring, prioritized gap analysis, risk register
**Step 4 (Strategy)**: 3-year roadmap with quarterly milestones and P0-P3 prioritization
**Step 5 (Governance)**: Practical policies, effective committee structure, clear decision frameworks
**Step 6 (Reporting)**: Board-ready reports with business language and executive-level KPIs
**Step 7 (Vendor Risk)**: Comprehensive vendor risk framework with tier classification
**Step 8 (Advisory)**: Ongoing engagement plan with defined success metrics and QBR structure

### Design Validation

✅ **Requirements Alignment**: All 8 phases from requirements captured as steps
✅ **Budget Integration**: Step 2 ensures budget-aligned recommendations
✅ **Collaboration Model**: Steps match highly→moderately→consultant-driven pattern
✅ **Tools Integration**: Party Mode, Brainstorming, Advanced Elicitation at appropriate steps
✅ **Output Structure**: Each step maps to specific document section
✅ **Continuation Support**: Full multi-session capability with state tracking
✅ **Linear Flow**: No branching, sequential 1→2→3→4→5→6→7→8
✅ **Professional Quality**: All outputs client-ready, not templates

