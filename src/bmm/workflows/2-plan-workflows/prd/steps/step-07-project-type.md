---
name: 'step-07-project-type'
description: 'Conduct project-type specific discovery using CSV-driven guidance'

# Path Definitions
workflow_path: '{project-root}/src/bmm/workflows/2-plan-workflows/prd'

# File References
thisStepFile: '{workflow_path}/steps/step-07-project-type.md'
nextStepFile: '{workflow_path}/steps/step-08-scoping.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{planning_artifacts}/prd.md'

# Data Files
projectTypesCSV: '{workflow_path}/project-types.csv'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 7: Project-Type Deep Dive

**Progress: Step 7 of 11** - Next: Scoping

## MANDATORY EXECUTION RULES (READ FIRST)

- 🛑 NEVER generate content without user input

- 📖 CRITICAL: ALWAYS read the complete step file before taking any action - partial understanding leads to incomplete decisions
- 🔄 CRITICAL: When loading next step with 'C', ensure the entire file is read and understood before proceeding
- ✅ ALWAYS treat this as collaborative discovery between PM peers
- 📋 YOU ARE A FACILITATOR, not a content generator
- 💬 FOCUS on project-type specific requirements and technical considerations
- 🎯 DATA-DRIVEN: Use CSV configuration to guide discovery
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

## EXECUTION PROTOCOLS

- 🎯 Show your analysis before taking any action
- ⚠️ Present A/P/C menu after generating project-type content
- 💾 ONLY save when user chooses C (Continue)
- 📖 Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]` before loading next step
- 🚫 FORBIDDEN to load next step until C is selected

## COLLABORATION MENUS (A/P/C)

This step will generate content and present choices:

- **A (Advanced Elicitation)**: Use discovery protocols to develop deeper project-type insights
- **P (Party Mode)**: Bring technical perspectives to explore project-specific requirements
- **C (Continue)**: Save the content to the document and proceed to next step

## PROTOCOL INTEGRATION

- When 'A' selected: Execute {project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml
- When 'P' selected: Execute {project-root}/_bmad/core/workflows/party-mode/workflow.md
- PROTOCOLS always return to this step's A/P/C menu
- User accepts/rejects protocol changes before proceeding

## CONTEXT BOUNDARIES

- Current document and frontmatter from previous steps are available
- Project type from step-02 is available for configuration loading
- Project-type CSV data will be loaded in this step
- Focus on technical and functional requirements specific to this project type

## YOUR TASK

Conduct project-type specific discovery using CSV-driven guidance to define technical requirements.

## PROJECT-TYPE DISCOVERY SEQUENCE

### 1. Load Project-Type Configuration Data

Load project-type specific configuration:

- Load `{project-root}/src/bmm/workflows/2-plan-workflows/prd/project-types.csv` completely
- Find the row where `project_type` matches detected type from step-02
- Extract these columns:
  - `key_questions` (semicolon-separated list of discovery questions)
  - `required_sections` (semicolon-separated list of sections to document)
  - `skip_sections` (semicolon-separated list of sections to skip)
  - `innovation_signals` (already explored in step-6)

### 2. Conduct Guided Discovery Using Key Questions

Parse `key_questions` from CSV and explore each:

#### Question-Based Discovery

For each question in `key_questions` from CSV:

- Ask the user naturally in conversational style
- Listen for their response and ask clarifying follow-ups
- Connect answers to product value proposition

**Example Flow:**
If key_questions = "Endpoints needed?;Authentication method?;Data formats?;Rate limits?;Versioning?;SDK needed?"

Ask naturally:

- "What are the main endpoints your API needs to expose?"
- "How will you handle authentication and authorization?"
- "What data formats will you support for requests and responses?"

### 3. Document Project-Type Specific Requirements

Based on user answers to key_questions, synthesize comprehensive requirements:

#### Requirement Categories

Cover the areas indicated by `required_sections` from CSV:

- Synthesize what was discovered for each required section
- Document specific requirements, constraints, and decisions
- Connect to product differentiator when relevant

#### Skip Irrelevant Sections

Skip areas indicated by `skip_sections` from CSV to avoid wasting time on irrelevant aspects.

### 4. Generate Dynamic Content Sections

Parse `required_sections` list from the matched CSV row. For each section name, generate corresponding content:

#### Common CSV Section Mappings

- "endpoint_specs" or "endpoint_specification" → API endpoints documentation
- "auth_model" or "authentication_model" → Authentication approach
- "platform_reqs" or "platform_requirements" → Platform support needs
- "device_permissions" or "device_features" → Device capabilities
- "tenant_model" → Multi-tenancy approach
- "rbac_matrix" or "permission_matrix" → Permission structure

#### Template Variable Strategy

- For sections matching common template variables: generate specific content
- For sections without template matches: include in main project_type_requirements
- Hybrid approach balances template structure with CSV-driven flexibility

### 5. Generate Project-Type Content

Prepare the content to append to the document:

#### Content Structure

When saving to document, append these Level 2 and Level 3 sections:

```markdown
## [Project Type] Specific Requirements

### Project-Type Overview

[Project type summary based on conversation]

### Technical Architecture Considerations

[Technical architecture requirements based on conversation]

[Dynamic sections based on CSV and conversation]

### Implementation Considerations

[Implementation specific requirements based on conversation]
```

### 6. Present Content and Menu

Show the generated project-type content and present choices:
"I've documented the {project_type}-specific requirements for {{project_name}} based on our conversation and best practices for this type of product.

**Here's what I'll add to the document:**

[Show the complete markdown content from step 5]

**What would you like to do?**
[A] Advanced Elicitation - Let's dive deeper into these technical requirements
[P] Party Mode - Bring technical expertise perspectives to validate requirements
[C] Continue - Save this and move to Scoping (Step 8 of 11)"

### 7. Handle Menu Selection

#### If 'A' (Advanced Elicitation)

- Execute {project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml with the current project-type content
- Process the enhanced technical insights that come back
- Ask user: "Accept these improvements to the technical requirements? (y/n)"
- If yes: Update content with improvements, then return to A/P/C menu
- If no: Keep original content, then return to A/P/C menu

#### If 'P' (Party Mode)

- Execute {project-root}/_bmad/core/workflows/party-mode/workflow.md with the current project-type requirements
- Process the collaborative technical expertise and validation
- Ask user: "Accept these changes to the technical requirements? (y/n)"
- If yes: Update content with improvements, then return to A/P/C menu
- If no: Keep original content, then return to A/P/C menu

#### If 'C' (Continue)

- Append the final content to `{outputFile}`
- Update frontmatter: add this step name to the end of the steps completed array
- Load `{project-root}/src/bmm/workflows/2-plan-workflows/prd/steps/step-08-scoping.md`

## APPEND TO DOCUMENT

When user selects 'C', append the content directly to the document using the structure from step 5.

## SUCCESS METRICS

✅ Project-type configuration loaded and used effectively
✅ All key questions from CSV explored with user input
✅ Required sections generated per CSV configuration
✅ Skip sections properly avoided to save time
✅ Technical requirements connected to product value
✅ A/P/C menu presented and handled correctly
✅ Content properly appended to document when C selected

## FAILURE MODES

❌ Not loading or using project-type CSV configuration
❌ Missing key questions from CSV in discovery process
❌ Not generating required sections per CSV configuration
❌ Documenting sections that should be skipped per CSV
❌ Creating generic content without project-type specificity
❌ Not presenting A/P/C menu after content generation
❌ Appending content without user selecting 'C'

❌ **CRITICAL**: Reading only partial step file - leads to incomplete understanding and poor decisions
❌ **CRITICAL**: Proceeding with 'C' without fully reading and understanding the next step file
❌ **CRITICAL**: Making decisions without complete understanding of step requirements and protocols

## PROJECT-TYPE EXAMPLES

**For api_backend:**

- Focus on endpoints, authentication, data schemas, rate limiting
- Skip visual design and user journey sections
- Generate API specification documentation

**For mobile_app:**

- Focus on platform requirements, device permissions, offline mode
- Skip API endpoint documentation unless needed
- Generate mobile-specific technical requirements

**For saas_b2b:**

- Focus on multi-tenancy, permissions, integrations
- Skip mobile-first considerations unless relevant
- Generate enterprise-specific requirements

## NEXT STEP

After user selects 'C' and content is saved to document, load `{project-root}/src/bmm/workflows/2-plan-workflows/prd/steps/step-08-scoping.md` to define project scope.

Remember: Do NOT proceed to step-08 (Scoping) until user explicitly selects 'C' from the A/P/C menu and content is saved!
