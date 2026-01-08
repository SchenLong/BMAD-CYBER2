---
stepsCompleted: [1, 2, 3, 4, 5, 6]
---

# Workflow Creation Plan: threat-modeling

## Initial Project Context

- **Module:** cyber-ops
- **Target Location:** /Users/paultinp/BMAD-CYBER2/_bmad-output/bmb-creations/workflows/threat-modeling
- **Created:** 2026-01-08

## Requirements

### 1. Workflow Purpose and Scope

- **Problem:** Security teams need a systematic way to identify threats during system design phase, before development begins
- **Primary Users:** Security architects, security engineers, developers, product teams
- **Main Outcome:** A comprehensive threat model document that identifies threats, vulnerabilities, attack vectors, and mitigation strategies

### 2. Workflow Type

**Hybrid Document + Interactive Workflow**
- Interactive guided session that produces a comprehensive threat model document
- Combines facilitation with structured documentation

### 3. Workflow Flow Pattern

**Iterative Linear with Component Loops**
- **Linear phases:** System Understanding → Decomposition → Threat Identification → Risk Assessment → Mitigation → Documentation
- **Iteration capability:** Users can analyze multiple system components in a loop
- **Methodology:** STRIDE-based (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)

### 4. User Interaction Style

- Highly collaborative with structured guidance
- User provides system details, AI facilitates threat identification using STRIDE framework
- Decision points for component selection and risk prioritization
- Menu-driven navigation with options to loop, continue, or use advanced tools

### 5. Instruction Style

**Hybrid Approach:**
- **Intent-based** for discovery and analysis (flexible, conversational exploration)
- **Prescriptive** for STRIDE application (consistent, structured framework)

### 6. Input Requirements

**Required Inputs:**
- System/application name and description
- High-level architecture overview
- Key components and their interactions
- Technology stack information
- Data types handled (especially sensitive data)

**Optional Inputs (enhance analysis):**
- Architecture diagrams
- Detailed data flow descriptions
- User roles and access levels
- Existing security controls
- Compliance requirements

### 7. Output Specifications

**Primary Output:** Comprehensive threat model document (Markdown format)

**Document Structure:**
1. **System Overview**
   - System description and purpose
   - Architecture summary
   - Technology stack
   - Trust boundaries

2. **Component Decomposition**
   - Component inventory with descriptions
   - Component relationships and data flows
   - Entry/exit points

3. **STRIDE Threat Analysis** (per component)
   - Spoofing threats
   - Tampering threats
   - Repudiation threats
   - Information Disclosure threats
   - Denial of Service threats
   - Elevation of Privilege threats

4. **Risk Assessment**
   - Likelihood ratings (Low/Medium/High)
   - Impact ratings (Low/Medium/High)
   - Overall risk scores
   - Risk prioritization matrix

5. **Mitigation Strategies**
   - Recommended controls per threat
   - Implementation priorities (P0/P1/P2/P3)
   - Responsible teams
   - Residual risk after mitigation

6. **Summary and Recommendations**
   - Key findings
   - Critical threats requiring immediate attention
   - Security architecture recommendations
   - Next steps

**Format Features:**
- Markdown with tables for structured data
- Progressive building with frontmatter state tracking
- Auto-save after each major step
- Export-ready for security reviews

### 8. Success Criteria

**Completeness:**
- All critical system components analyzed
- Threats identified across all STRIDE categories
- Each threat has risk rating (likelihood + impact)
- Each threat has mitigation strategy with priority

**Quality:**
- Risk ratings aligned with industry standards
- Mitigation strategies are specific and actionable
- Document suitable for security review and development team use
- Clear prioritization for implementation

**User Satisfaction:**
- User understands identified threats
- User feels confident in security approach
- Document provides clear next steps
- Mitigation recommendations are practical and achievable

**Actionability:**
- Development teams can implement recommendations
- Security controls mapped to threats
- Priorities clear for resource allocation
- Residual risks documented and accepted

## Tools Configuration

### Core BMAD Tools

- **Party-Mode**: INCLUDED
  - Integration points: STRIDE threat identification (multiple security perspectives), Risk assessment validation, Mitigation strategy brainstorming

- **Advanced Elicitation**: INCLUDED
  - Integration points: Quality gate before finalizing threat model, Challenging completeness of threat identification, Validating mitigation strategies

- **Brainstorming**: INCLUDED
  - Integration points: Creative threat identification (thinking like an attacker), Innovative mitigation strategies, Edge case scenario exploration

### LLM Features

- **Web-Browsing**: INCLUDED
  - Use cases: Research current CVEs for technology stack, Lookup latest STRIDE methodology updates, Find real-world attack examples for similar systems, Regulatory compliance requirements research

- **File I/O**: INCLUDED
  - Operations: Create/update threat model document, save progressive state

- **Sub-Agents**: EXCLUDED
  - Not needed for this workflow

- **Sub-Processes**: EXCLUDED
  - Not needed for this workflow

### Memory Systems

- **Sidecar File**: INCLUDED
  - Purpose: Store component analysis history for large system threat models spanning multiple sessions, enable workflow resumption for enterprise-scale assessments

### External Integrations

- None required for initial implementation

### Installation Requirements

- No external tools requiring installation
- All selected tools are built-in BMAD capabilities

## Output Format Design

**Format Type**: Structured

**Output Requirements**:

- **Document type:** Threat Model Report
- **File format:** Markdown (.md)
- **Frequency:** Single document per system/application
- **Progressive building:** Yes, with frontmatter state tracking

**Structure Specifications**:

**Required Sections (in order):**

1. **System Overview**
   - System name and description
   - Business purpose and criticality
   - Architecture summary
   - Technology stack
   - Trust boundaries and security zones
   - External dependencies

2. **Component Decomposition**
   - Component inventory with descriptions
   - Component relationships and interactions
   - Data flows between components
   - Entry/exit points
   - External interfaces

3. **STRIDE Threat Analysis** (per component)
   - Spoofing threats (identity verification)
   - Tampering threats (data/code integrity)
   - Repudiation threats (audit and logging)
   - Information Disclosure threats (confidentiality)
   - Denial of Service threats (availability)
   - Elevation of Privilege threats (authorization)

4. **Risk Assessment**
   - Likelihood ratings (Low/Medium/High)
   - Impact ratings (Low/Medium/High)
   - Overall risk scores (calculated from likelihood × impact)
   - Risk prioritization matrix
   - Critical vs non-critical threat classification

5. **Mitigation Strategies**
   - Recommended security controls per threat
   - Implementation priorities (P0/P1/P2/P3)
   - Responsible teams/owners
   - Implementation effort estimates
   - Residual risk after mitigation
   - Dependencies between mitigations

6. **Summary and Recommendations**
   - Executive summary of key findings
   - Critical threats requiring immediate attention
   - Security architecture recommendations
   - Compliance considerations
   - Next steps and action items

**Format Guidelines**:

- **Frontmatter:** YAML with `stepsCompleted` array for state tracking
- **Tables:** Used for structured data (threat lists, risk matrices, mitigation priorities)
- **Headers:** Markdown headers for clear section hierarchy
- **Consistency:** Standardized terminology and risk rating scales
- **Readability:** Clear descriptions, actionable recommendations
- **Portability:** Plain text Markdown for version control and easy sharing

**Flexible Within Sections**:

- Number of components varies by system complexity
- Number of threats per STRIDE category varies
- Risk matrix can adapt to organizational standards
- Mitigation strategies tailored to specific threats
- Level of detail adjusts to system criticality

**Template Information**:

- **Template source:** AI-generated based on STRIDE methodology and security best practices
- **Template approach:** Progressive building (append sections as workflow progresses)
- **Placeholders:** Dynamic based on user inputs and analysis
- **Validation:** Completeness checks ensure all STRIDE categories covered

**Special Considerations**:

- **Security classification:** Document may contain sensitive system information
- **Compliance requirements:** Output suitable for security audits and regulatory reviews
- **Version control:** Markdown format enables tracking changes over time
- **Collaboration:** Format supports review and feedback from multiple stakeholders
- **Actionability:** Prioritized mitigations with clear ownership and next steps

## Workflow Structure Design

### Continuation Support

**Continuation Enabled:** YES

**Rationale:**
- Generates comprehensive document output (threat model)
- Users may need to pause and resume (especially for complex systems)
- Involves extensive data collection and analysis across multiple components
- Contains complex decisions (STRIDE analysis per component, risk assessments)

**Implementation:**
- step-01-init.md includes continuation detection logic
- step-01b-continue.md handles resuming workflows
- Every step updates `stepsCompleted` in output frontmatter
- Workflow persists state between sessions

### Step Sequence (8 Steps + Continuation)

#### Step 01: Initialization (step-01-init.md)
- **Goal:** Initialize threat modeling session, gather system overview, create output document
- **Inputs:** System name, description, architecture overview, technology stack, trust boundaries
- **Outputs:** Initial threat model document with System Overview section (Section 1)
- **Features:** Continuation detection, creates frontmatter with `stepsCompleted: [1]`
- **Menu:** Auto-proceed to step 02

#### Step 01b: Continuation (step-01b-continue.md)
- **Goal:** Resume incomplete threat model from previous session
- **Logic:** Analyze `stepsCompleted` array from frontmatter, route to appropriate next step
- **Features:** State analysis, progress summary, seamless resumption
- **Routing:** Based on last completed step number

#### Step 02: Component Decomposition (step-02-decomposition.md)
- **Goal:** Identify and document all system components with relationships
- **Work:** Guide user through component identification, data flows, entry/exit points, external interfaces
- **Outputs:** Appends Component Decomposition section (Section 2), stores component list in frontmatter
- **Menu:** [B] Brainstorming (creative component discovery) | [C] Continue

#### Step 03: Component Selection (step-03-select-component.md)
- **Goal:** Allow user to select which component to analyze for threats
- **Work:** Present component list, allow selection or "Analyze Next" option
- **Outputs:** Updates frontmatter with `currentComponent`, tracks `componentsAnalyzed` array
- **Logic:** If all components analyzed, route to step 08 (summary)
- **Menu:** [C] Continue to STRIDE Analysis

#### Step 04: STRIDE Threat Identification (step-04-stride-analysis.md)
- **Goal:** Apply STRIDE framework to selected component, identify all threats
- **Work:** Systematically walk through S-T-R-I-D-E categories for current component
  - **S**poofing (identity verification threats)
  - **T**ampering (data/code integrity threats)
  - **R**epudiation (audit and logging threats)
  - **I**nformation Disclosure (confidentiality threats)
  - **D**enial of Service (availability threats)
  - **E**levation of Privilege (authorization threats)
- **Outputs:** Appends STRIDE Threat Analysis for component (Section 3)
- **Menu:** [P] Party Mode (multi-perspective threat discovery) | [B] Brainstorming (creative attack scenarios) | [W] Web-Browsing (research CVEs/attacks) | [C] Continue

#### Step 05: Risk Assessment (step-05-risk-assessment.md)
- **Goal:** Assess likelihood and impact for each identified threat from step 04
- **Work:** Guide user through risk ratings (Low/Medium/High), calculate risk scores (likelihood × impact)
- **Outputs:** Appends Risk Assessment section (Section 4) for current component threats
- **Menu:** [P] Party Mode (validate risk ratings) | [C] Continue

#### Step 06: Mitigation Strategies (step-06-mitigation.md)
- **Goal:** Define security controls and mitigation strategies for each threat
- **Work:** Recommend controls, prioritize (P0/P1/P2/P3), assign ownership, estimate effort, document residual risk
- **Outputs:** Appends Mitigation Strategies section (Section 5) for current component
- **Menu:** [P] Party Mode (brainstorm creative mitigations) | [B] Brainstorming | [W] Web-Browsing (research best practices) | [C] Continue

#### Step 07: Component Loop Decision (step-07-loop-decision.md)
- **Goal:** Decide if more components need analysis or proceed to summary
- **Logic:**
  - If more components remain → return to step 03 (select next component)
  - If all components analyzed → proceed to step 08 (summary)
- **Work:** Present progress (X of Y components analyzed), offer loop or continue
- **Menu:** [M] Analyze More Components (back to step 03) | [C] Continue to Summary

#### Step 08: Summary and Finalization (step-08-summary.md)
- **Goal:** Generate executive summary, prioritize critical threats, finalize document
- **Work:**
  - Aggregate all findings across components
  - Create risk prioritization matrix
  - Identify critical threats requiring immediate attention
  - Provide security architecture recommendations
  - Document compliance considerations
  - Define next steps and action items
- **Outputs:** Appends Summary and Recommendations section (Section 6), marks `workflowComplete: true`
- **Menu:** [A] Advanced Elicitation (challenge completeness and quality) | [C] Complete Workflow

### Interaction Patterns

**AI Role:** Security Threat Modeling Expert
- **Expertise:** STRIDE methodology, security architecture, risk assessment, attack patterns
- **Tone:** Professional, systematic, security-focused, Socratic
- **Communication Style:** Socratic questioning to elicit threats, structured guidance through framework
- **Collaboration Level:** High - partner user's system knowledge with AI's security expertise

**Menu Patterns:**
- **Analysis Steps (02, 04, 06):** Optional tools (P/B/W) + Continue
- **Loop Decision (07):** More Components vs Continue to Summary
- **Final Step (08):** Quality gate (Advanced Elicitation) + Complete

**User Input Points:**
- Step 01: System overview details
- Step 02: Component identification and relationships
- Step 03: Component selection
- Step 04: Threat confirmation per STRIDE category
- Step 05: Likelihood and impact ratings
- Step 06: Mitigation ownership and priorities
- Step 07: Loop decision
- Step 08: Review and approval

### Data Flow

**Frontmatter State Variables:**
```yaml
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 8]  # Shows loop pattern
systemName: "Application Name"
components: ["Component A", "Component B", "Component C"]
currentComponent: "Component B"
componentsAnalyzed: ["Component A"]
workflowComplete: false  # true when step 8 completes
```

**Progressive Building Flow:**
1. Step 01 → Creates document with Section 1 (System Overview)
2. Step 02 → Appends Section 2 (Component Decomposition)
3. Steps 03-07 → Loop for each component:
   - Step 03: Select component
   - Step 04: Append STRIDE analysis for component (Section 3)
   - Step 05: Append Risk assessment for component (Section 4)
   - Step 06: Append Mitigation strategies for component (Section 5)
   - Step 07: Decision point (loop or continue)
4. Step 08 → Appends Section 6 (Summary and Recommendations)

### File Structure

**Core Files:**
- `workflow.md` - Main workflow configuration
- `steps/step-01-init.md` - Initialization with system overview
- `steps/step-01b-continue.md` - Continuation handler
- `steps/step-02-decomposition.md` - Component identification
- `steps/step-03-select-component.md` - Component selection loop
- `steps/step-04-stride-analysis.md` - STRIDE threat identification
- `steps/step-05-risk-assessment.md` - Risk rating and scoring
- `steps/step-06-mitigation.md` - Mitigation strategy definition
- `steps/step-07-loop-decision.md` - Continue or finalize decision
- `steps/step-08-summary.md` - Summary and finalization

**Optional Supporting Files:**
- `templates/threat-model-template.md` - Document structure template (optional)
- `data/stride-examples.csv` - Example threats per STRIDE category for reference
- `data/mitigation-controls.csv` - Common security controls by threat type

### Validation and Quality

**Completeness Checks:**
- All 6 STRIDE categories addressed per component
- Each threat has likelihood and impact rating
- Each threat has mitigation strategy with priority (P0-P3)
- All components analyzed before proceeding to summary
- Summary includes risk prioritization matrix

**Quality Gates:**
- Advanced Elicitation available at step 08 (final quality review)
- Party Mode available at steps 04 (threat identification) and 06 (mitigation brainstorming)
- Brainstorming available at steps 02 (component discovery), 04 (attack scenarios), 06 (mitigation creativity)
- Web-Browsing available at steps 04 (CVE research) and 06 (best practice research)

**Error Handling:**
- Invalid risk ratings → Re-prompt with guidance
- Missing STRIDE categories → Prompt completion before proceeding
- Empty component list → Cannot proceed to step 03
- Incomplete analysis → Continuation support allows resumption

### Special Features

**Iterative Component Loop:**
- Steps 03-07 form a loop that repeats for each system component
- User can analyze components in any order
- Progress tracked in frontmatter (`componentsAnalyzed` array)
- Loop exits automatically when all components analyzed

**Multi-Session Support:**
- Sidecar file optional (can be added for enterprise-scale models)
- Frontmatter provides sufficient state for most threat models
- Continuation logic routes to correct step in loop

**Flexible Analysis Depth:**
- User controls detail level during STRIDE analysis
- Risk ratings adapt to organizational standards
- Mitigation priorities align with business priorities
