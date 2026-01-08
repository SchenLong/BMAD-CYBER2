---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
buildStatus: 'COMPLETE'
buildCompletedDate: '2026-01-08'
---

# Workflow Creation Plan: security-architecture-review

## Initial Project Context

- **Module:** cyber-ops (Cybersecurity Operations)
- **Target Location:** _bmad-output/bmb-creations/workflows/security-architecture-review/
- **Final Installation:** _bmad/cyber-ops/workflows/security-architecture-review/
- **Created:** 2026-01-08

## Requirements

### 1. Workflow Purpose and Scope

**Problem Solved:**
Security architects need a structured, repeatable process to analyze system architectures, identify vulnerabilities through threat modeling, assess existing security controls, and provide actionable recommendations aligned with security best practices and zero-trust principles.

**Primary Users:**
- Security Architects (Bastion persona) - Lead role
- Security Consultants conducting architecture reviews
- Development teams seeking security validation
- Cloud architects implementing secure cloud designs

**Main Outcome:**
Comprehensive Security Architecture Review Report containing:
- Threat model with STRIDE analysis
- Security control assessment
- Risk-prioritized findings
- Actionable remediation roadmap

### 2. Workflow Type Classification

**Primary Type:** Document Workflow
- Generates structured security assessment reports
- Involves guided interactive sessions for threat modeling
- Produces markdown documentation with optional diagram generation

**Secondary Characteristics:**
- Interactive workflow elements for STRIDE threat modeling guidance
- Collaborative workflow capability for multi-agent consultation

### 3. Workflow Flow and Step Structure

**Pattern:** Linear with Optional Branches

**Primary Flow (7 steps):**
1. **Intake & Context Gathering** - Architecture details, boundaries, data flows
2. **Threat Modeling (STRIDE)** - Guided threat identification across 6 categories
3. **Control Assessment** - Evaluate existing security controls
4. **Attack Surface Analysis** - *OPTIONAL* - Collaborate with Ghost (penetration tester)
5. **Zero-Trust Validation** - Verify zero-trust principles compliance
6. **Recommendations & Remediation** - Prioritize findings and provide mitigations
7. **Report Generation** - Create comprehensive markdown report

**Branching Points:**
- Step 4: User chooses whether to invoke Ghost agent for offensive perspective
- Throughout: User can request collaboration with Sentinel for compliance validation

**Iteration Capability:**
- After initial threat model, user can refine/expand before proceeding
- Recommendations can be iteratively developed based on user feedback

### 4. User Interaction Style

**Highly Collaborative:**
- Extensive conversation during intake to understand architecture
- Guided interactive threat modeling (STRIDE methodology)
- User provides control details during assessment
- User validates findings and recommendations

**Flexible Collaboration:**
- Mid-workflow agent invocation (Ghost for attack surface, Sentinel for compliance)
- User decides collaboration depth

**Adaptive:**
- Workflow adjusts based on architecture complexity
- Question depth varies by technology stack (cloud vs on-prem, etc.)

### 5. Instruction Style

**Mix of Intent-Based and Prescriptive:**

**Intent-Based (Discovery phases):**
- Step 1 (Intake): "Guide user to provide architecture context through open-ended discussion"
- Step 3 (Control Assessment): "Collaboratively assess security controls against identified threats"

**Prescriptive (Structured analysis):**
- Step 2 (STRIDE): Specific prompts for each threat category with clear examples
- Step 7 (Report): Exact markdown structure and required sections

**Rationale:** Security requires both exploratory conversation (understanding unique architectures) and rigorous structure (ensuring complete STRIDE coverage, consistent report format).

### 6. Input Requirements

**Required Inputs:**
- Architecture description (verbal or document)
- System boundaries and trust zones
- Data classification (what data flows where)
- Technology stack overview

**Optional Inputs (enhance quality):**
- Architecture diagrams (C4, UML, custom)
- Existing threat models
- Previous security assessments
- Compliance requirements context

**File Support:**
- Workflow should support file upload/reference for diagrams
- Accept common formats (PNG, PDF, markdown, PlantUML)
- Can work without files through conversational description

**Prerequisites:**
- User should have basic understanding of their architecture
- Access to architecture documentation
- Ability to describe data flows and trust boundaries

### 7. Output Specifications

**Primary Output:**
Security Architecture Review Report (Markdown format)

**File Location:** `{output_folder}/planning/architecture/security-review-{project-name}-{timestamp}.md`

**Report Structure (Required Sections):**
1. **Executive Summary** - High-level findings and critical risks
2. **Architecture Overview** - System description and boundaries
3. **Threat Model**
   - STRIDE analysis (all 6 categories)
   - Threat-component mapping
   - Attack scenarios
4. **Security Control Assessment**
   - Existing controls inventory
   - Control effectiveness evaluation
   - Control gaps identified
5. **Risk Matrix**
   - Findings prioritized (Critical/High/Medium/Low)
   - Likelihood × Impact assessment
6. **Detailed Recommendations**
   - Specific, actionable mitigations
   - Implementation guidance
   - Control selection rationale
7. **Implementation Roadmap**
   - Phased remediation plan
   - Quick wins vs strategic initiatives

**Optional Outputs:**
- Threat model diagrams (if user provides architecture diagrams)
- Control mapping matrix (threats → controls → gaps)

**File Naming Convention:**
`security-review-{sanitized-project-name}-{YYYY-MM-DD}.md`

### 8. Success Criteria

**Completeness Criteria:**
- ✅ All 6 STRIDE threat categories analyzed (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
- ✅ At least 3 threats identified per major architecture component
- ✅ All identified threats have corresponding control assessment
- ✅ All findings include specific, actionable recommendations (not generic "improve security")
- ✅ Risk prioritization applied to all findings
- ✅ Implementation roadmap includes phasing guidance

**Quality Criteria:**
- Recommendations are specific (not "use encryption" but "implement TLS 1.3 for all API traffic with mutual TLS for service-to-service communication")
- Threat scenarios are realistic and tied to actual architecture
- Control assessments reference industry standards (NIST, CIS, OWASP)
- Report is actionable by development/operations teams

**User Satisfaction Indicators:**
- User understands all identified threats
- User has clear next steps for remediation
- Report can be shared with stakeholders/leadership
- User feels architecture security posture is thoroughly validated

## Tools Configuration

### Core BMAD Tools

- **Party-Mode**: ✅ INCLUDED
  - Integration points:
    - Step 4 (Attack Surface Analysis) - Optional collaboration with Ghost agent for offensive security perspective
    - Any step - User can request Sentinel for compliance validation
  - Use case: Multi-agent collaboration for comprehensive security analysis

- **Advanced Elicitation**: ✅ INCLUDED
  - Integration points:
    - After Step 2 (STRIDE Threat Modeling) - Enhance threat model quality through Socratic questioning
    - Before Step 7 (Report Generation) - Refine recommendations for clarity and actionability
  - Use case: Improve quality of threat identification and recommendations through critical evaluation

- **Brainstorming**: ⚠️ OPTIONAL
  - Integration points: During Step 2 (Threat Modeling) if user wants creative attack scenario exploration
  - Use case: Generate unconventional threat scenarios and attack vectors
  - Decision: Available but not required for standard workflow execution

### LLM Features

- **Web-Browsing**: ✅ INCLUDED
  - Use cases:
    - Fetch current CVE data for technologies identified in architecture
    - Retrieve latest security advisories for cloud platforms (AWS/Azure/GCP)
    - Research recent threat actor TTPs relevant to specific architecture patterns
    - Access current OWASP, NIST, CIS benchmark guidance

- **File I/O**: ✅ REQUIRED
  - Operations:
    - Read architecture diagrams (PNG, PDF, markdown, PlantUML)
    - Generate Security Architecture Review Report (markdown)
    - Create threat model documentation
    - Save outputs to `{output_folder}/planning/architecture/`
  - Essential: Cannot complete workflow without file generation capability

- **Sub-Agents**: ❌ EXCLUDED
  - Rationale: Security architecture review benefits from cohesive, continuous analysis by Bastion persona. Fragmented delegation would reduce quality and consistency of threat modeling and recommendations.

- **Sub-Processes**: ❌ EXCLUDED
  - Rationale: Linear workflow with collaborative elements better suits security review methodology. Parallel processing not beneficial for this use case.

### Memory Systems

- **Sidecar File**: ✅ INCLUDED
  - Purpose:
    - Maintain architecture context across multiple review sessions
    - Store partial threat models for resuming interrupted complex reviews
    - Track previous findings for follow-up reviews of same architecture
  - Use case: Large enterprise architectures requiring multi-session deep-dive reviews
  - File location: `{output_folder}/planning/architecture/.sidecar-{project-name}.yaml`

### External Integrations

**None required** - All core functionality achievable with built-in BMAD tools and features.

**Optional (future enhancement):**
- Security-Auditor workflow - Could complement architecture review with code-level security analysis
- Code-Review task - Review implementation code against architectural security requirements

### Installation Requirements

✅ **No installations required**
- All selected tools are built-in BMAD capabilities
- No external dependencies
- No MCP server installations needed
- Workflow ready to execute immediately after creation

## Output Format Design

**Format Type:** Structured

**Output Requirements:**

- **Document type:** Security Architecture Review Report
- **File format:** Markdown (.md)
- **File location:** `{output_folder}/planning/architecture/security-review-{project-name}-{YYYY-MM-DD}.md`
- **Frequency:** Single report per architecture review

**Structure Specifications:**

**Required Sections (7):**

1. **Executive Summary**
   - Purpose: High-level findings for leadership/stakeholders
   - Content: Critical risks, key findings, recommended actions
   - Length: 1-2 paragraphs maximum

2. **Architecture Overview**
   - Purpose: Document system under review
   - Content: System description, boundaries, components, data flows
   - Length: Variable based on architecture complexity

3. **Threat Model**
   - Purpose: STRIDE threat analysis
   - Content:
     - All 6 STRIDE categories with identified threats
     - Threat-to-component mapping
     - Attack scenarios
   - Structure: Organized by STRIDE category (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)

4. **Security Control Assessment**
   - Purpose: Evaluate existing defenses
   - Content:
     - Existing controls inventory
     - Control effectiveness evaluation
     - Control gaps identified
   - Format: Can be narrative or table-based

5. **Risk Matrix**
   - Purpose: Prioritize findings
   - Content: Findings organized by severity (Critical/High/Medium/Low)
   - Format: Table with Likelihood × Impact assessment

6. **Detailed Recommendations**
   - Purpose: Actionable mitigations
   - Content:
     - Specific recommendations (not generic)
     - Implementation guidance
     - Control selection rationale
     - References to standards (NIST, CIS, OWASP)

7. **Implementation Roadmap**
   - Purpose: Phased remediation plan
   - Content:
     - Quick wins vs strategic initiatives
     - Phasing guidance
     - Priority ordering

**Optional Sections:**
- Threat model diagrams (if architecture diagrams provided)
- Control mapping matrix (threats → controls → gaps)
- Appendices for detailed technical analysis

**Formatting Standards:**
- Use markdown headers (##, ###) for section hierarchy
- Tables for risk matrix and control assessments
- Bullet lists for findings and recommendations
- Code blocks for technical examples
- Bold for emphasis on critical/high-risk items

**Cross-document Consistency:**
- All reviews use same 7-section structure
- Risk severity levels always: Critical/High/Medium/Low
- STRIDE categories always in same order
- Recommendations always include specific guidance (not generic)

**Section Ordering:** Fixed order (1-7 as listed above) for consistency and readability

**Template Information:**
- Template source: Designed collaboratively during workflow creation
- Template file: Embedded in workflow step-07-report-generation
- Placeholders: Dynamic based on architecture analysis findings

**Special Considerations:**
- Report must be stakeholder-ready (shareable with executives, boards, auditors)
- Technical depth balanced with business context
- Compliance references where applicable (NIST, CIS, OWASP, industry standards)
- Recommendations must be actionable by development/operations teams

## Workflow Structure Design

### Step Structure

**Total Workflow Steps:** 7

1. **step-01-init.md** - Initialization & Context Gathering
   - Goal: Welcome user, gather architecture context, initialize review document
   - Type: Initialization with continuation support
   - Required: Yes

2. **step-02-threat-modeling.md** - STRIDE Threat Modeling
   - Goal: Guide user through systematic STRIDE threat identification
   - Type: Interactive, prescriptive guidance
   - Required: Yes

3. **step-03-control-assessment.md** - Security Control Assessment
   - Goal: Evaluate existing security controls against identified threats
   - Type: Collaborative analysis
   - Required: Yes

4. **step-04-attack-surface.md** - Attack Surface Analysis
   - Goal: Optional Ghost agent collaboration for offensive perspective
   - Type: Branching - user chooses whether to invoke
   - Required: Optional

5. **step-05-zero-trust.md** - Zero-Trust Validation
   - Goal: Verify architecture alignment with zero-trust principles
   - Type: Structured validation
   - Required: Yes

6. **step-06-recommendations.md** - Recommendations & Remediation
   - Goal: Prioritize findings and develop actionable recommendations
   - Type: Collaborative synthesis
   - Required: Yes

7. **step-07-report-generation.md** - Final Report Generation
   - Goal: Generate complete Security Architecture Review Report
   - Type: Document generation with template
   - Required: Yes

**Optional/Required:**
- Steps 1-3: Required
- Step 4: Optional (user choice to involve Ghost agent)
- Steps 5-7: Required

**Iteration Points:**
- After Step 2: Optional threat model refinement
- After Step 6: Optional recommendations quality enhancement

**Decision Points:**
- Step 4: Branch - invoke Ghost agent for attack surface analysis? (Yes/No)
- Steps 2, 6: Quality enhancement - use Advanced Elicitation? (Optional)

### Continuation Support

**Continuation Enabled:** YES

**Rationale:**
- Generates document output (Security Architecture Review Report)
- Users may need multiple sessions for complex enterprise architectures
- Extensive data collection across 7 steps
- Complex threat modeling may require breaks for research/consultation

**Implementation:**
- step-01b-continue.md for resuming workflows
- Every step updates `stepsCompleted` array in output file frontmatter
- Sidecar file stores session state for complex reviews
- Output file: `{output_folder}/planning/architecture/security-review-{project-name}-{YYYY-MM-DD}.md`

### Interaction Patterns

**Step 1 (Initialization):**
- Input: Architecture description, boundaries, tech stack
- Interaction: Structured questions, clarifying dialogue
- Menu: [C] Continue to threat modeling

**Step 2 (STRIDE Threat Modeling):**
- Input: Threat identification guided by STRIDE prompts
- Interaction: Examples, probing questions, threat validation
- Menu: [A] Advanced Elicitation [B] Brainstorming [C] Continue

**Step 3 (Control Assessment):**
- Input: Existing control descriptions
- Interaction: Control effectiveness analysis, gap identification
- Menu: [C] Continue

**Step 4 (Attack Surface - Optional):**
- Input: Choice to invoke Ghost agent
- Interaction: If yes, initiate Party Mode with Ghost
- Menu: [P] Party Mode (Ghost) [S] Skip [C] Continue

**Step 5 (Zero-Trust):**
- Input: Zero-trust principle responses
- Interaction: Validation against principles, gap analysis
- Menu: [C] Continue

**Step 6 (Recommendations):**
- Input: Validate/refine recommendations
- Interaction: Prioritized, specific mitigations
- Menu: [A] Advanced Elicitation [C] Continue

**Step 7 (Report Generation):**
- Input: Final review/approval
- Interaction: Complete formatted report
- Menu: [E] Export Report [Done]

### File Structure

```
security-architecture-review/
├── workflow.md                    # Main workflow configuration
├── steps/
│   ├── step-01-init.md           # Initialization with continuation detection
│   ├── step-01b-continue.md      # Continuation logic for resuming
│   ├── step-02-threat-modeling.md
│   ├── step-03-control-assessment.md
│   ├── step-04-attack-surface.md
│   ├── step-05-zero-trust.md
│   ├── step-06-recommendations.md
│   └── step-07-report-generation.md
├── templates/
│   └── report-template.md         # 7-section report structure
└── README.md                      # Workflow documentation
```

### AI Role & Persona

**Role:** Security Architect (Bastion Persona)

**Expertise:**
- STRIDE threat modeling methodology
- Zero-trust architecture principles
- Security control frameworks (NIST, CIS, OWASP)
- Cloud security (AWS/Azure/GCP)
- Risk assessment and prioritization

**Communication Style:**
- Professional, technically precise
- Collaborative in discovery phases (Steps 1, 3, 6)
- Prescriptive in structured phases (Steps 2, 7)
- Uses security domain language appropriately
- Balances technical depth with business context

**Tone by Step:**
- Steps 1-3: Exploratory, inquisitive
- Step 2: Structured, methodical (STRIDE rigor)
- Step 4: Collaborative (multi-agent)
- Steps 5-6: Analytical, decisive
- Step 7: Synthesis, clear

### Validation & Quality Control

**Output Validation:**
- Step 2: All 6 STRIDE categories covered
- Step 2: Minimum 3 threats per major component
- Step 6: Recommendations are specific (not generic)
- Step 7: All 7 required sections present

**Review Checkpoints:**
- After Step 2: Threat model review
- After Step 6: Recommendations quality check
- Step 7: Final report review before export

**Success Criteria:**
- ✅ Complete STRIDE coverage
- ✅ Control assessment complete
- ✅ Risk prioritization applied
- ✅ 7-section report generated
- ✅ Recommendations are specific and actionable

### Special Features

**Conditional Logic:**
- Step 4: IF user chooses Ghost THEN Party Mode ELSE skip to Step 5
- Steps 2, 6: IF Advanced Elicitation requested THEN quality enhancement

**Integration Points:**
- Party Mode: Step 4 for Ghost agent collaboration
- Advanced Elicitation: Steps 2, 6 for quality enhancement
- Web-Browsing: Throughout for CVE lookups, advisories
- Sidecar File: Auto-loaded on resume for context

**Multi-Scenario Handling:**
- Cloud architectures: AWS/Azure/GCP-specific prompts
- On-prem: Network segmentation focus
- Hybrid: Combined cloud + on-prem considerations
