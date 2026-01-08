---
name: 'step-02-decomposition'
description: 'Identify and document all major system components, their relationships, data flows, and trust boundaries'

# Path Definitions
workflow_path: '{project-root}/_bmad/cyber-ops/workflows/threat-modeling'

# File References
thisStepFile: '{workflow_path}/steps/step-02-decomposition.md'
nextStepFile: '{workflow_path}/steps/step-03-select-component.md'
outputFile: '{output_folder}/threat-model-{project_name}.md'

# Task References
brainstormingTask: '{project-root}/_bmad/core/tasks/brainstorming.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 2: System Decomposition

## STEP GOAL:

To systematically identify and document all major system components, their relationships, data flows, entry/exit points, and trust boundaries in preparation for threat analysis.

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

- 🎯 Focus ONLY on component identification and decomposition
- 🚫 FORBIDDEN to identify threats in this step
- 💬 Guide systematic component discovery
- 🚫 DO NOT proceed without identifying all major components

## EXECUTION PROTOCOLS:

- 🎯 Guide user through component identification
- 💾 Document all components with descriptions and relationships
- 📖 Update frontmatter `stepsCompleted: [1, 2]` before loading next step
- 🚫 FORBIDDEN to load next step until user selects 'C'

## CONTEXT BOUNDARIES:

- System Overview (Section 1) already captured in document
- Focus ONLY on decomposing system into analyzable components
- Components will be analyzed individually in subsequent steps
- This is discovery phase, not analysis phase

## COMPONENT DECOMPOSITION PROCESS:

### 1. Initialize Component Discovery

Load existing {outputFile} to review System Overview.

Display:

"**System Decomposition**

Now that we understand your system at a high level, let's break it down into components for threat analysis.

**System:** {systemName}

We'll identify:
- Major architectural components
- External systems and dependencies
- Data stores
- Communication channels
- Entry and exit points

This decomposition will guide our threat analysis in subsequent steps."

### 2. Guide Component Identification

**Explain Component Scope:**

"**What is a Component?**

For threat modeling purposes, a component is any distinct element of your system that:
- Processes data
- Stores data
- Communicates with other components
- Represents a trust boundary
- Has distinct security characteristics

**Examples:**
- Web Application Frontend
- REST API Backend
- User Authentication Service
- PostgreSQL Database
- Payment Gateway (3rd party)
- Message Queue (Redis/RabbitMQ)
- Mobile App
- Admin Dashboard

**Granularity Guidance:**
- Too broad: 'The Backend' (should be API Server, Auth Service, Database, etc.)
- Too narrow: Individual API endpoints
- Just right: Logical services or architectural layers"

### 3. Collect Components

**Primary Components:**

"Let's identify the primary components of your system. For each component, provide:

1. **Component Name** (e.g., 'User Authentication Service')
2. **Type** (e.g., Web Service, Database, External API, Mobile App, etc.)
3. **Description** (brief - what does it do?)
4. **Technology** (e.g., Node.js/Express, PostgreSQL, React, etc.)

Start with the first major component:"

For each component user provides, collect:
- Name
- Type
- Description
- Technology

**Guide Discovery:**

After collecting 2-3 components, ask:
"What other major components are part of the system? Think about:
- Where is data stored?
- What external services do you integrate with?
- Are there different client applications?
- Any background jobs or workers?
- Monitoring or logging systems?"

Continue until user has identified all major components.

### 4. Map Component Relationships

"**Component Relationships**

Now let's understand how these components interact. For each pair of components that communicate, describe:

- Which component initiates the connection?
- What protocol/method? (HTTP/REST, gRPC, Database queries, Message queue, etc.)
- What data is exchanged?
- Is communication encrypted?

Example:
'Web Frontend → API Backend: HTTPS/REST API calls with user credentials and data'
'API Backend → PostgreSQL Database: TCP/SQL queries over TLS with user data and session info'"

Collect relationship mappings for all component pairs that communicate.

### 5. Identify Data Flows

"**Critical Data Flows**

Let's trace how sensitive data moves through your system:

1. **User Credentials** (passwords, tokens, API keys)
   - Where does it enter?
   - Where is it stored?
   - Where is it transmitted?

2. **Personal Identifiable Information (PII)**
   - Where does it enter?
   - Where is it stored?
   - Where is it transmitted?

3. **Business-Critical Data**
   - Where does it enter?
   - Where is it stored?
   - Where is it transmitted?

For each data flow, identify:
- Source component
- Destination component(s)
- Data classification (Public, Internal, Confidential, Restricted)
- Protection mechanisms (encryption, hashing, access controls)"

Collect data flow mappings with classifications.

### 6. Identify Entry and Exit Points

"**System Entry and Exit Points**

Where does data enter and leave your system?

**Entry Points** (potential attack surface):
- Public web interface
- API endpoints
- Mobile app
- Admin interface
- File upload functionality
- Webhook receivers
- etc.

**Exit Points** (potential data leakage):
- Third-party API calls
- Email sending
- Log aggregation services
- Analytics services
- Backup systems
- etc.

List all entry and exit points:"

Collect all entry/exit points with descriptions.

### 7. Document Trust Boundaries

"**Trust Boundaries**

Trust boundaries separate zones with different security levels. Common boundaries:

- **Internet ↔ DMZ** (Firewall, WAF)
- **DMZ ↔ Internal Network** (Firewall, API Gateway)
- **Application ↔ Database** (Database firewall, Network segmentation)
- **User ↔ System** (Authentication, Authorization)
- **Admin ↔ System** (MFA, Privileged access)

Where are the trust boundaries in your system?
What enforces each boundary?"

Collect trust boundary definitions.

### 8. Create Component List

Compile complete component list with:
- Component name
- Type
- Description
- Technology
- Relationships
- Data flows
- Entry/exit points
- Trust boundaries

### 9. Append Section 2 to Threat Model Document

Update {outputFile} by appending:

```markdown

---

## 2. System Decomposition

### 2.1 Component Inventory

| Component Name | Type | Technology | Description |
|---------------|------|------------|-------------|
{component-table-rows}

### 2.2 Component Relationships

**Component Communication Map:**

{list-all-component-relationships-with-protocols}

**Data Flow Diagram Description:**

{describe-how-data-flows-through-components}

### 2.3 Entry and Exit Points

**Entry Points (Attack Surface):**

{list-all-entry-points-with-descriptions}

**Exit Points (Data Egress):**

{list-all-exit-points-with-descriptions}

### 2.4 Trust Boundaries

{list-all-trust-boundaries-with-enforcement-mechanisms}

**Security Zones:**

{describe-security-zones-separated-by-trust-boundaries}

---
```

### 10. Update Frontmatter

Update frontmatter in {outputFile}:

```yaml
---
stepsCompleted: [1, 2]
lastStep: 'decomposition'
systemName: '{system-name}'
businessCriticality: '{criticality}'
components: [
  {
    name: '{component-name}',
    type: '{component-type}',
    technology: '{tech}',
    description: '{desc}'
  },
  ...
]
componentsAnalyzed: []
currentComponent: ''
workflowComplete: false
date: '{date}'
user_name: '{user_name}'
---
```

### 11. Present MENU OPTIONS

Display: **Select an Option:** [B] Brainstorming [P] Party Mode [C] Continue to Component Selection

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then end with display again of the menu options
- Use menu handling logic section below

#### Menu Handling Logic:

- IF B: Execute {brainstormingTask} with prompt: "Help me brainstorm additional system components, edge cases, or hidden dependencies I might have missed in my system decomposition"
- IF P: Execute {partyModeWorkflow} with focus: "Review system decomposition for completeness - are there components, data flows, or trust boundaries we've overlooked?"
- IF C: Verify components array is not empty, update frontmatter with stepsCompleted: [1, 2], then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#11-present-menu-options)

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All major components identified with descriptions
- Component relationships mapped
- Data flows documented with classifications
- Entry/exit points identified
- Trust boundaries defined
- Section 2 appended to threat model document
- Frontmatter updated with components array
- Ready to proceed to component selection (step 3)

### ❌ SYSTEM FAILURE:

- Skipping component identification
- Not documenting relationships
- Missing data flow classifications
- Not identifying trust boundaries
- Proceeding without user confirmation
- Not updating frontmatter with components

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected AND all components are documented in the threat model will you load, read entire file, then execute {nextStepFile} to begin component selection for threat analysis.
