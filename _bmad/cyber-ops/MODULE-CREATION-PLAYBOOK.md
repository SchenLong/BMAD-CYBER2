# BMAD Module Creation Playbook

**Document Purpose:** Complete operational procedure for creating and deploying a new BMAD module with agents and workflows

**Created:** 2026-01-09
**Based On:** Cyber-Ops module deployment experience
**Status:** Production-ready playbook

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Module Planning](#phase-1-module-planning)
4. [Phase 2: Module Structure Creation](#phase-2-module-structure-creation)
5. [Phase 3: Agent Development](#phase-3-agent-development)
6. [Phase 4: Agent Registration](#phase-4-agent-registration)
7. [Phase 5: Command Structure Setup](#phase-5-command-structure-setup)
8. [Phase 6: Testing & Validation](#phase-6-testing--validation)
9. [Phase 7: Production Cleanup](#phase-7-production-cleanup)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Lessons Learned](#lessons-learned)

---

## Overview

### What is a BMAD Module?

A BMAD module is a self-contained package of:
- **Agents** (interactive personas with specialized expertise)
- **Workflows** (step-by-step guided processes)
- **Configuration** (module settings and metadata)
- **Documentation** (README, guides, examples)

### Module Architecture

```
_bmad/
└── {module-name}/
    ├── agents/               # Agent definition files
    ├── workflows/            # Workflow directories
    ├── config.yaml           # Module configuration
    ├── module.yaml           # Module metadata
    └── README.md             # Module documentation

_bmad/_config/
├── agent-manifest.csv        # Registry of all agents
└── agents/                   # Agent customization files
    └── {module}-{agent}.customize.yaml

.claude/commands/bmad/
└── {module-name}/
    ├── agents/               # Command wrappers for agents
    └── workflows/            # Command wrappers for workflows
```

---

## Prerequisites

### Required Tools
- Claude Code CLI (Sonnet 4.5 or newer)
- BMAD Framework installed
- Git repository initialized
- Text editor or IDE

### Required Knowledge
- Basic understanding of BMAD structure
- YAML configuration syntax
- Markdown formatting
- Agent persona design (optional, can learn during process)

### Project Setup
```bash
# Verify BMAD installation
ls -la _bmad/

# Verify config directory exists
ls -la _bmad/_config/

# Verify commands directory exists
ls -la .claude/commands/bmad/
```

---

## Phase 1: Module Planning

### 1.1 Define Module Scope

**Questions to answer:**
- What domain does this module serve? (e.g., cybersecurity, game development, marketing)
- What problems does it solve?
- Who is the target user?
- What frameworks/methodologies does it implement?

**Example (Cyber-Ops):**
```yaml
Domain: Cybersecurity Operations
Problems: Incident response, threat modeling, compliance audits
Users: Security professionals, consultants, CISOs
Frameworks: NIST, MITRE ATT&CK, STRIDE, ISO 27001
```

### 1.2 Plan Agents

**For each agent, define:**
- **Agent ID** (snake_case, e.g., `security-architect`)
- **Display Name** (human-friendly, e.g., "Bastion")
- **Icon** (emoji, e.g., 🏰)
- **Persona** (role, identity, communication style)
- **Capabilities** (what can they do?)
- **Menu Commands** (interactive options)

**Example Agent Definition:**
```yaml
- id: security-architect
  name: Bastion
  icon: 🏰
  role: Security Architect + Defense Strategist
  capabilities:
    - Zero-trust architecture design
    - STRIDE threat modeling
    - Cloud security architecture
    - Network segmentation
    - IAM architecture design
  menu:
    - Security Review
    - Zero-trust Design
    - Threat Modeling
    - Cloud Security
    - Network Segmentation
    - IAM Design
```

**Recommended agent count:** 4-6 agents per module

### 1.3 Plan Workflows

**For each workflow, define:**
- **Workflow ID** (kebab-case, e.g., `incident-response-playbook`)
- **Display Name** (full name, e.g., "Incident Response Playbook")
- **Type** (linear, dual-mode, iterative)
- **Steps** (number of steps, 8-15 typical)
- **Frameworks** (which standards it follows)
- **Output** (what deliverable it produces)

**Example Workflow Definition:**
```yaml
- id: incident-response-playbook
  name: Incident Response Playbook
  type: dual-mode
  modes:
    - playbook-creation
    - guided-execution
  steps: 19
  frameworks: [NIST, MITRE_ATTACK]
  output: Professional incident response playbook (50-150 pages)
```

**Recommended workflow count:** 3-8 workflows per module

### 1.4 Plan Configuration

**Module configuration fields:**
```yaml
# Module identity
module_name: {module-id}
full_name: {Full Module Name}
version: 1.0.0
status: production

# User configuration
user_name: {from user}
communication_language: English
output_folder: /path/to/output/{module-id}

# Module paths
module_root: /path/to/_bmad/{module-id}
workflows_path: /path/to/_bmad/{module-id}/workflows
agents_path: /path/to/_bmad/{module-id}/agents

# Frameworks supported
frameworks:
  FRAMEWORK_NAME: version

# Output configuration
output:
  base_path: /path/to/output
  formats: [markdown]
  include_metadata: true
```

---

## Phase 2: Module Structure Creation

### 2.1 Create Module Directory

```bash
# Replace {module-id} with your module's ID
MODULE_ID="your-module-name"
PROJECT_ROOT="/path/to/your/project"

# Create module structure
mkdir -p "${PROJECT_ROOT}/_bmad/${MODULE_ID}"
mkdir -p "${PROJECT_ROOT}/_bmad/${MODULE_ID}/agents"
mkdir -p "${PROJECT_ROOT}/_bmad/${MODULE_ID}/workflows"
mkdir -p "${PROJECT_ROOT}/_bmad/${MODULE_ID}/data"
mkdir -p "${PROJECT_ROOT}/_bmad/${MODULE_ID}/tasks"
mkdir -p "${PROJECT_ROOT}/_bmad/${MODULE_ID}/templates"
```

### 2.2 Create config.yaml

```bash
# Create config file
cat > "${PROJECT_ROOT}/_bmad/${MODULE_ID}/config.yaml" << 'EOF'
# {Module Name} Configuration

module_name: {module-id}
full_name: {Full Module Name}
version: 1.0.0
created_date: $(date +%Y-%m-%d)
status: development

# Project Configuration
project_name: {PROJECT_NAME}
output_folder: ${PROJECT_ROOT}/_output/{module-id}

# User Configuration (will be customized per user)
user_name: User
communication_language: English
document_output_language: English

# Module Paths
module_root: ${PROJECT_ROOT}/_bmad/{module-id}
workflows_path: ${PROJECT_ROOT}/_bmad/{module-id}/workflows
agents_path: ${PROJECT_ROOT}/_bmad/{module-id}/agents

# Add your module-specific configuration below
# ...
EOF
```

**Customize:**
- Replace `{module-id}` with your module ID
- Replace `{Full Module Name}` with display name
- Replace `{PROJECT_NAME}` with your project name
- Add module-specific fields

### 2.3 Create module.yaml

```bash
# Create module metadata
cat > "${PROJECT_ROOT}/_bmad/${MODULE_ID}/module.yaml" << 'EOF'
name: {module-id}
full_name: {Full Module Name}
version: 1.0.0
description: {Brief module description}

authors:
  - BMAD Framework
  - Claude Sonnet 4.5

capabilities:
  - {capability-1}
  - {capability-2}

agents:
  - {agent-1-id}
  - {agent-2-id}

workflows:
  - {workflow-1-id}
  - {workflow-2-id}

dependencies:
  bmad_core: ">=1.0.0"

tags:
  - {tag-1}
  - {tag-2}
EOF
```

### 2.4 Create README.md

```bash
# Create module README
cat > "${PROJECT_ROOT}/_bmad/${MODULE_ID}/README.md" << 'EOF'
# {Full Module Name}

{Brief description of what this module does}

## Overview

{Detailed overview}

## Agents

### {Agent 1 Name}
{Description}

### {Agent 2 Name}
{Description}

## Workflows

### {Workflow 1 Name}
{Description}

### {Workflow 2 Name}
{Description}

## Installation

{Installation instructions if any}

## Usage

{Basic usage examples}

## Documentation

{Links to additional docs}
EOF
```

### 2.5 Create Output Directories

```bash
# Create output folder structure
mkdir -p "${PROJECT_ROOT}/_output/${MODULE_ID}"

# Create subdirectories based on your module needs
# Example for cyber-ops:
mkdir -p "${PROJECT_ROOT}/_output/${MODULE_ID}/playbooks"
mkdir -p "${PROJECT_ROOT}/_output/${MODULE_ID}/reports"
```

---

## Phase 3: Agent Development

### 3.1 Agent File Structure

Each agent should be a markdown file following this structure:

```markdown
---
name: "{agent-id}"
description: "{Brief description}"
---

You must fully embody this agent's persona and follow all activation instructions exactly as specified. NEVER break character until given an exit command.

```xml
<agent id="{agent-id}.agent.yaml" name="{Display Name}" title="{Title}" icon="{emoji}">
<activation critical="MANDATORY">
      <step n="1">Load persona from this current agent file (already in context)</step>
      <step n="2">🚨 IMMEDIATE ACTION REQUIRED - BEFORE ANY OUTPUT:
          - Load and read {project-root}/_bmad/{module-id}/config.yaml NOW
          - Store ALL fields as session variables: {user_name}, {communication_language}, {output_folder}
          - VERIFY: If config not loaded, STOP and report error to user
          - DO NOT PROCEED to step 3 until config is successfully loaded and variables stored
      </step>
      <step n="3">Remember: user's name is {user_name}</step>

      <step n="4">Show greeting using {user_name} from config, communicate in {communication_language}, then display numbered list of ALL menu items from menu section</step>
      <step n="5">STOP and WAIT for user input - do NOT execute menu items automatically - accept number or cmd trigger or fuzzy command match</step>
      <step n="6">On user input: Number → execute menu item[n] | Text → case-insensitive substring match | Multiple matches → ask user to clarify | No match → show "Not recognized"</step>
      <step n="7">When executing a menu item: Check menu-handlers section below - extract any attributes from the selected menu item (workflow, exec, tmpl, data, action, validate-workflow) and follow the corresponding handler instructions</step>

      <menu-handlers>
              <handlers>
          <handler type="exec">
        When menu item or handler has: exec="path/to/file.md":
        1. Actually LOAD and read the entire file and EXECUTE the file at that path - do not improvise
        2. Read the complete file and follow all instructions within it
        3. If there is data="some/path/data-foo.md" with the same item, pass that data path to the executed file as context.
      </handler>
        </handlers>
      </menu-handlers>

    <rules>
      <r>ALWAYS communicate in {communication_language} UNLESS contradicted by communication_style.</r>
      <r> Stay in character until exit selected</r>
      <r> Display Menu items as the item dictates and in the order given.</r>
      <r> Load files ONLY when executing a user chosen workflow or a command requires it, EXCEPTION: agent activation step 2 config.yaml</r>
    </rules>
</activation>

<persona>
    <role>{Agent Role Title}</role>
    <identity>
      {Detailed persona description: background, experience, certifications, expertise areas}
    </identity>
    <communication_style>
      {How the agent speaks, thinks, interacts. Include signature phrases, mental models, quirks}
    </communication_style>
    <principles>
      {Core beliefs, professional philosophy, guiding principles}
    </principles>
  </persona>

  <menu>
    <item cmd="MH or fuzzy match on menu or help">[MH] Redisplay Menu Help</item>
    <item cmd="CH or fuzzy match on chat">[CH] Chat with the Agent about anything</item>
    <item cmd="{CMD1}" action="{what this does}">[{CMD1}] {Menu Item 1}</item>
    <item cmd="{CMD2}" exec="{path/to/workflow.md}">[{CMD2}] {Menu Item 2}</item>
    <!-- Add more menu items as needed -->
    <item cmd="PM or fuzzy match on party-mode" exec="{project-root}/_bmad/core/workflows/party-mode/workflow.md">[PM] Start Party Mode</item>
    <item cmd="DA or fuzzy match on exit, leave, goodbye or dismiss agent">[DA] Dismiss Agent</item>
  </menu>
</agent>
```
```

### 3.2 Agent Persona Design

**Key elements of a good persona:**

1. **Role & Title**
   - Clear professional role
   - Establishes expertise domain
   - Example: "Security Architect + Defense Strategist"

2. **Identity**
   - Years of experience (e.g., "18+ years")
   - Specific achievements or backgrounds
   - Certifications or credentials
   - Unique expertise areas
   - Example: "Former software architect who pivoted to security, bringing deep understanding of how systems actually get built"

3. **Communication Style**
   - How they think and speak
   - Signature phrases (2-4 phrases they use often)
   - Mental models they reference
   - Quirks or habits
   - Example: "Draws mental diagrams while speaking. Always considers the system holistically. 'Every layer tells a story...' 'Where's the trust boundary here?'"

4. **Principles**
   - Core professional beliefs (3-5)
   - Philosophy on their domain
   - What guides their decisions
   - Example: "Security is a property of the system, not a bolt-on feature. Assume breach and design accordingly."

**Anti-patterns to avoid:**
- Generic "helpful assistant" personality
- No distinctive voice or thinking style
- Missing domain expertise indicators
- Vague or shallow principles

### 3.3 Menu Command Design

**Menu structure:**
```xml
<menu>
  <item cmd="MH or fuzzy match on menu or help">[MH] Redisplay Menu Help</item>
  <item cmd="CH or fuzzy match on chat">[CH] Chat with the Agent about anything</item>

  <!-- Domain-specific commands (4-8 recommended) -->
  <item cmd="{SHORT}" action="{description}">[{SHORT}] {Display Name}</item>
  <item cmd="{SHORT}" exec="{workflow-path}">[{SHORT}] {Display Name}</item>

  <!-- Standard items (always include) -->
  <item cmd="PM" exec="{project-root}/_bmad/core/workflows/party-mode/workflow.md">[PM] Start Party Mode</item>
  <item cmd="DA or fuzzy match on exit">[DA] Dismiss Agent</item>
</menu>
```

**Command attributes:**

1. **`cmd`** (required)
   - Short code (2-3 letters, e.g., "SR", "ZT", "TM")
   - Fuzzy match keywords (e.g., "fuzzy match on security-review")
   - Both number selection and text matching supported

2. **`action`** (for inline actions)
   - Description of what the command does
   - Agent performs this action directly
   - Use for: analysis, reviews, conversations

3. **`exec`** (for workflow execution)
   - Path to workflow file to execute
   - Use `{project-root}` variable for portability
   - Use for: guided processes, document generation

**Examples:**
```xml
<!-- Inline action -->
<item cmd="SR or fuzzy match on security-review"
      action="Conduct comprehensive architecture security review. Analyze design docs, identify vulnerabilities, provide recommendations.">
  [SR] Conduct comprehensive architecture security review
</item>

<!-- Workflow execution -->
<item cmd="TM or fuzzy match on threat-model"
      exec="{project-root}/_bmad/cyber-ops/workflows/threat-modeling/workflow.md">
  [TM] Develop threat model
</item>
```

### 3.4 Create Agent Files

**For each agent:**

```bash
MODULE_ID="your-module-name"
AGENT_ID="your-agent-id"
AGENT_NAME="Agent Display Name"
AGENT_ICON="🎯"

# Create agent file
cat > "${PROJECT_ROOT}/_bmad/${MODULE_ID}/agents/${AGENT_ID}.md" << 'EOF'
---
name: "{AGENT_ID}"
description: "{Brief description}"
---

{Full agent implementation following template above}
EOF
```

**Best practices:**
- Start with template above
- Customize persona thoroughly
- Add 4-8 domain-specific menu items
- Include Party Mode integration
- Test config loading step
- Verify all paths use `{project-root}` variable

### 3.5 Agent Development Checklist

For each agent, verify:

- [ ] Agent file created at `_bmad/{module-id}/agents/{agent-id}.md`
- [ ] Frontmatter includes `name` and `description`
- [ ] Activation step 2 loads config from correct path
- [ ] Persona is detailed and distinctive
- [ ] Communication style includes signature phrases
- [ ] Menu has 6-12 items total (including MH, CH, PM, DA)
- [ ] All `exec` paths use `{project-root}` variable
- [ ] All workflow paths are correct
- [ ] Agent stays in character throughout
- [ ] Config variables used: `{user_name}`, `{communication_language}`, `{output_folder}`

---

## Phase 4: Agent Registration

### 4.1 Register in Agent Manifest

**File:** `_bmad/_config/agent-manifest.csv`

**Format:**
```csv
module,agent_id,display_name,icon,description
```

**Add each agent:**
```csv
{module-id},{agent-id-1},{Display Name 1},{icon},{description}
{module-id},{agent-id-2},{Display Name 2},{icon},{description}
```

**Example:**
```csv
cyber-ops,security-architect,Bastion,🏰,Security Architect specializing in defense-in-depth design
cyber-ops,threat-analyst,Cipher,🔍,Threat Intelligence Specialist
cyber-ops,penetration-tester,Ghost,💀,Offensive Security Expert
```

**How to add:**
```bash
# Open manifest file
nano _bmad/_config/agent-manifest.csv

# OR append programmatically:
echo "cyber-ops,security-architect,Bastion,🏰,Security Architect specializing in defense-in-depth design" >> _bmad/_config/agent-manifest.csv
```

### 4.2 Create Customization Files

**Purpose:** Per-agent customization settings (user preferences, overrides)

**Location:** `_bmad/_config/agents/`

**Naming:** `{module-id}-{agent-id}.customize.yaml`

**For each agent, create:**

```bash
MODULE_ID="your-module-name"
AGENT_ID="your-agent-id"

cat > "_bmad/_config/agents/${MODULE_ID}-${AGENT_ID}.customize.yaml" << 'EOF'
# {Agent Display Name} Customization

agent_id: {agent-id}
module: {module-id}
version: 1.0.0

# User can customize these
preferences:
  verbosity: medium          # low | medium | high
  output_format: markdown    # markdown | json | yaml
  auto_save: true            # Save output automatically

# Agent-specific settings
settings:
  # Add agent-specific customizable settings
  default_framework: {framework-name}
  include_examples: true

# Overrides (optional)
overrides:
  # communication_language: Spanish
  # output_folder: /custom/path
EOF
```

**Create for all agents:**
```bash
# Repeat for each agent
for agent in agent-1 agent-2 agent-3; do
  cat > "_bmad/_config/agents/${MODULE_ID}-${agent}.customize.yaml" << EOF
agent_id: ${agent}
module: ${MODULE_ID}
version: 1.0.0

preferences:
  verbosity: medium
  output_format: markdown
  auto_save: true

settings:
  include_examples: true
EOF
done
```

### 4.3 Agent Registration Verification

**Verify registration:**

```bash
# Check manifest entries
grep "{module-id}" _bmad/_config/agent-manifest.csv
# Should show all your agents

# Check customization files exist
ls -la _bmad/_config/agents/{module-id}-*.customize.yaml
# Should list all agent customize files

# Count agents
grep -c "{module-id}" _bmad/_config/agent-manifest.csv
# Should match your agent count
```

---

## Phase 5: Command Structure Setup

### 5.1 Understanding Command Structure

**Why command wrappers?**

Claude Code CLI discovers commands by scanning `.claude/commands/` directory. We create lightweight "wrapper" files that point to the actual agent files.

**Architecture:**
```
User types: /security-architect
    ↓
CLI finds: .claude/commands/bmad/cyber-ops/agents/security-architect.md
    ↓
Wrapper loads: _bmad/cyber-ops/agents/security-architect.md
    ↓
Agent activates with full persona
```

**Benefits:**
- Clean command discovery
- Centralized agent maintenance
- Easy to add/remove commands
- Consistent command structure

### 5.2 Create Command Directory

```bash
MODULE_ID="your-module-name"
PROJECT_ROOT="/path/to/project"

# Create command directories
mkdir -p "${PROJECT_ROOT}/.claude/commands/bmad/${MODULE_ID}/agents"
mkdir -p "${PROJECT_ROOT}/.claude/commands/bmad/${MODULE_ID}/workflows"  # Optional
```

### 5.3 Create Command Wrappers for Agents

**For each agent, create a wrapper file:**

```bash
MODULE_ID="your-module-name"
AGENT_ID="your-agent-id"

cat > ".claude/commands/bmad/${MODULE_ID}/agents/${AGENT_ID}.md" << 'EOF'
---
name: '{agent-id}'
description: '{agent-id} agent'
---

You must fully embody this agent's persona and follow all activation instructions exactly as specified. NEVER break character until given an exit command.

<agent-activation CRITICAL="TRUE">
1. LOAD the FULL agent file from @_bmad/{module-id}/agents/{agent-id}.md
2. READ its entire contents - this contains the complete agent persona, menu, and instructions
3. Execute ALL activation steps exactly as written in the agent file
4. Follow the agent's persona and menu system precisely
5. Stay in character throughout the session
</agent-activation>
EOF
```

**Create all agent wrappers:**

```bash
# Example: Create wrappers for all agents
MODULE_ID="cyber-ops"

for agent in security-architect threat-analyst penetration-tester incident-commander compliance-guardian forensic-investigator; do
  cat > ".claude/commands/bmad/${MODULE_ID}/agents/${agent}.md" << EOF
---
name: '${agent}'
description: '${agent} agent'
---

You must fully embody this agent's persona and follow all activation instructions exactly as specified. NEVER break character until given an exit command.

<agent-activation CRITICAL="TRUE">
1. LOAD the FULL agent file from @_bmad/${MODULE_ID}/agents/${agent}.md
2. READ its entire contents - this contains the complete agent persona, menu, and instructions
3. Execute ALL activation steps exactly as written in the agent file
4. Follow the agent's persona and menu system precisely
5. Stay in character throughout the session
</agent-activation>
EOF
done
```

### 5.4 Create Command Wrappers for Workflows (Optional)

If you want direct workflow commands (e.g., `/incident-response`):

```bash
MODULE_ID="your-module-name"
WORKFLOW_ID="your-workflow-id"

cat > ".claude/commands/bmad/${MODULE_ID}/workflows/${WORKFLOW_ID}.md" << 'EOF'
---
name: '{workflow-id}'
description: '{Workflow Display Name}'
---

Load and execute the following workflow:

@_bmad/{module-id}/workflows/{workflow-id}/workflow.md

Follow all steps in the workflow precisely.
EOF
```

### 5.5 Verify Command Structure

```bash
# List all command wrappers
ls -la .claude/commands/bmad/${MODULE_ID}/agents/

# Verify count matches agent count
ls .claude/commands/bmad/${MODULE_ID}/agents/ | wc -l

# Check a wrapper file
cat .claude/commands/bmad/${MODULE_ID}/agents/{first-agent}.md
```

**Expected structure:**
```
.claude/commands/bmad/
└── {module-id}/
    ├── agents/
    │   ├── {agent-1}.md
    │   ├── {agent-2}.md
    │   └── {agent-3}.md
    └── workflows/           # Optional
        ├── {workflow-1}.md
        └── {workflow-2}.md
```

---

## Phase 6: Testing & Validation

### 6.1 Test Agent Invocation

**Open Claude Code CLI and test each agent:**

```bash
# Test first agent
/{agent-1-id}

# Expected result:
# - Agent greeting with icon and name
# - Config loaded (shows user name from config)
# - Full menu displayed
# - Agent waits for input
```

**Test all agents:**
```bash
/{agent-1-id}    # Should load Agent 1
/{agent-2-id}    # Should load Agent 2
/{agent-3-id}    # Should load Agent 3
# ... etc
```

**Checklist for each agent:**
- [ ] Command recognized by CLI
- [ ] Agent file loads
- [ ] Config loads successfully (no errors)
- [ ] Greeting shows correct user name from config
- [ ] Menu displays all items
- [ ] Agent stays in character
- [ ] Communication language correct

### 6.2 Test Agent Functionality

**For each agent, test:**

1. **Menu Help (MH)**
   ```
   > MH
   Expected: Redisplay full menu
   ```

2. **Chat (CH)**
   ```
   > CH
   > Ask a domain question
   Expected: Agent responds in character with expertise
   ```

3. **Domain Command (inline action)**
   ```
   > {COMMAND_CODE}
   Expected: Agent performs action described
   ```

4. **Domain Command (workflow execution)**
   ```
   > {COMMAND_CODE}
   Expected: Workflow loads and begins execution
   ```

5. **Party Mode (PM)**
   ```
   > PM
   Expected: Party mode workflow loads
   ```

6. **Dismiss Agent (DA)**
   ```
   > DA
   Expected: Agent says goodbye and exits
   ```

### 6.3 Test Configuration Loading

**Verify config variables work:**

1. **User name personalization**
   - Change `user_name` in config.yaml
   - Reload agent
   - Verify greeting uses new name

2. **Output folder**
   - Check agent references `{output_folder}` correctly
   - Generate output (if agent has that capability)
   - Verify files go to correct location

3. **Communication language**
   - Change `communication_language` in config.yaml
   - Reload agent
   - Verify agent speaks in new language

### 6.4 Test Multi-Agent Collaboration (Party Mode)

**Test agents work together:**

```bash
# From any agent, start Party Mode
> PM

# In Party Mode:
1. Call your module's agents by name
2. Verify they respond in character
3. Test collaborative scenarios
4. Verify agents maintain personas
```

### 6.5 Validation Checklist

**Module validation:**
- [ ] All agents load successfully
- [ ] All agents display correct persona
- [ ] All menu items work
- [ ] Config loads without errors
- [ ] User name personalization works
- [ ] Output goes to correct folders
- [ ] Workflows execute (if applicable)
- [ ] Party Mode integration works
- [ ] No placeholder/stub content
- [ ] Documentation complete

**File validation:**
- [ ] All agent files exist in `_bmad/{module-id}/agents/`
- [ ] All command wrappers exist in `.claude/commands/bmad/{module-id}/agents/`
- [ ] All agents in manifest CSV
- [ ] All customize files exist
- [ ] config.yaml valid and complete
- [ ] module.yaml complete
- [ ] README.md comprehensive

---

## Phase 7: Production Cleanup

### 7.1 Identify Artifacts to Remove

**Temporary artifacts from development:**
- Build completion markers (`*-COMPLETE.md`, `*-SUMMARY.md`, `*-VALIDATION.md`)
- Staging/build output (`_bmad-output/bmb-creations/`)
- Temporary audio files (`.claude/audio/*.wav`)
- Git staging of deleted files

**Keep for production:**
- Module files (`_bmad/{module-id}/`)
- Agent files
- Workflow files
- Config files
- Documentation
- Command wrappers

### 7.2 Remove Build Artifacts

```bash
MODULE_ID="your-module-name"
PROJECT_ROOT="/path/to/project"

# Remove completion markers from module
rm -f "${PROJECT_ROOT}/_bmad/${MODULE_ID}"/*-COMPLETE.md
rm -f "${PROJECT_ROOT}/_bmad/${MODULE_ID}"/*-SUMMARY.md
rm -f "${PROJECT_ROOT}/_bmad/${MODULE_ID}"/*-VALIDATION.md
rm -f "${PROJECT_ROOT}/_bmad/${MODULE_ID}"/DEPLOYMENT-*.md

# Remove workflow build artifacts
find "${PROJECT_ROOT}/_bmad/${MODULE_ID}/workflows" -name "*-COMPLETE.md" -delete
find "${PROJECT_ROOT}/_bmad/${MODULE_ID}/workflows" -name "*-SUMMARY.md" -delete
find "${PROJECT_ROOT}/_bmad/${MODULE_ID}/workflows" -name "BUILD-*.md" -delete
```

### 7.3 Remove Staging Folder

```bash
# Remove BMB creations staging area
rm -rf "${PROJECT_ROOT}/_bmad-output/bmb-creations"

# Or if you want to keep other modules' staging:
rm -rf "${PROJECT_ROOT}/_bmad-output/bmb-creations/${MODULE_ID}"
```

### 7.4 Clean Audio Artifacts

```bash
# Remove Claude audio files if present
rm -rf "${PROJECT_ROOT}/.claude/audio"

# Or clean just WAV files:
find "${PROJECT_ROOT}/.claude/audio" -name "*.wav" -delete
```

### 7.5 Clean Git Staging

```bash
# Reset deleted files from staging
git reset HEAD

# Or add all changes except deletions:
git add _bmad/${MODULE_ID}
git add .claude/commands/bmad/${MODULE_ID}
git add _bmad/_config/agent-manifest.csv
git add _bmad/_config/agents/${MODULE_ID}-*.customize.yaml
```

### 7.6 Final Production State

**After cleanup, your repository should have:**

```
_bmad/
├── {module-id}/
│   ├── agents/              ✅ All agent files
│   ├── workflows/           ✅ All workflow files
│   ├── config.yaml          ✅ Module config
│   ├── module.yaml          ✅ Module metadata
│   └── README.md            ✅ Documentation
├── _config/
│   ├── agent-manifest.csv   ✅ Agents registered
│   └── agents/
│       └── {module-id}-*.customize.yaml  ✅ Customization files

.claude/
└── commands/
    └── bmad/
        └── {module-id}/
            └── agents/      ✅ Command wrappers

_output/
└── {module-id}/             ✅ Output directories

# NO artifacts:
# ❌ No *-COMPLETE.md files
# ❌ No *-SUMMARY.md files
# ❌ No _bmad-output/bmb-creations
# ❌ No .claude/audio/*.wav
```

### 7.7 Production Verification

```bash
# Verify clean state
find _bmad/${MODULE_ID} -name "*-COMPLETE.md" | wc -l
# Should output: 0

find _bmad/${MODULE_ID} -name "*-SUMMARY.md" | wc -l
# Should output: 0

# Verify essential files present
ls _bmad/${MODULE_ID}/agents/*.md | wc -l
# Should match your agent count

ls .claude/commands/bmad/${MODULE_ID}/agents/*.md | wc -l
# Should match your agent count

grep -c "^${MODULE_ID}," _bmad/_config/agent-manifest.csv
# Should match your agent count
```

### 7.8 Git Commit Production Version

```bash
# Stage production files
git add _bmad/${MODULE_ID}/
git add .claude/commands/bmad/${MODULE_ID}/
git add _bmad/_config/agent-manifest.csv
git add _bmad/_config/agents/${MODULE_ID}-*.customize.yaml

# Commit
git commit -m "Add ${MODULE_ID} module - Production ready

- ${AGENT_COUNT} agents deployed
- ${WORKFLOW_COUNT} workflows deployed
- Full documentation
- All tests passing
- Ready for production use"

# Tag release
git tag -a "${MODULE_ID}-v1.0.0" -m "${MODULE_ID} v1.0.0 production release"
```

---

## Troubleshooting Guide

### Issue: Agent Command Not Found

**Symptoms:**
```
User types: /security-architect
CLI responds: "No matching command found"
```

**Diagnosis:**
1. Check command wrapper exists:
   ```bash
   ls -la .claude/commands/bmad/${MODULE_ID}/agents/${AGENT_ID}.md
   ```

2. Verify agent registered in manifest:
   ```bash
   grep "${AGENT_ID}" _bmad/_config/agent-manifest.csv
   ```

3. Check file naming (must match exactly):
   ```bash
   # Agent file:    _bmad/{module}/agents/security-architect.md
   # Command file:  .claude/commands/bmad/{module}/agents/security-architect.md
   # Manifest entry: {module},security-architect,...
   ```

**Solutions:**
- Create missing command wrapper
- Add to manifest if missing
- Fix naming mismatches
- Restart Claude Code CLI

### Issue: Agent Loads But Config Fails

**Symptoms:**
```
Agent loads but shows error: "Cannot load config.yaml"
or
Agent greets with: "Hello, {user_name}" (literal text, not replaced)
```

**Diagnosis:**
1. Verify config file exists:
   ```bash
   ls -la _bmad/${MODULE_ID}/config.yaml
   ```

2. Check config path in agent file:
   ```bash
   grep "config.yaml" _bmad/${MODULE_ID}/agents/${AGENT_ID}.md
   ```

3. Verify `{project-root}` variable resolution:
   - In agent file, should use: `{project-root}/_bmad/{module-id}/config.yaml`
   - Should resolve to actual path when loaded

**Solutions:**
- Create config.yaml if missing
- Fix path in agent activation step 2
- Ensure `{project-root}` variable is used
- Verify YAML syntax is valid

### Issue: Agent Doesn't Stay in Character

**Symptoms:**
- Agent responds generically
- No persona evident
- Doesn't use signature phrases
- Breaks character easily

**Diagnosis:**
1. Check persona section is detailed:
   ```bash
   grep -A 20 "<persona>" _bmad/${MODULE_ID}/agents/${AGENT_ID}.md
   ```

2. Verify activation instructions emphasize staying in character

**Solutions:**
- Expand persona section with more detail
- Add distinctive communication style
- Include signature phrases
- Add more specific principles
- Reinforce "stay in character" in activation rules

### Issue: Menu Items Don't Work

**Symptoms:**
- User selects menu item
- Nothing happens or generic response
- Workflow doesn't load

**Diagnosis:**
1. Check menu item syntax:
   ```xml
   <item cmd="XX" action="...">
   <item cmd="YY" exec="path/to/workflow.md">
   ```

2. Verify workflow paths are correct:
   ```bash
   ls _bmad/${MODULE_ID}/workflows/workflow-name/workflow.md
   ```

3. Check `{project-root}` variable used in paths

**Solutions:**
- Fix menu item syntax
- Correct workflow paths
- Use `{project-root}` variable
- Test workflows exist at specified paths

### Issue: Workflows Not Found

**Symptoms:**
```
Agent tries to load workflow
Error: "Cannot find workflow file"
```

**Diagnosis:**
1. Check workflow path in menu item:
   ```bash
   grep "exec=" _bmad/${MODULE_ID}/agents/${AGENT_ID}.md
   ```

2. Verify workflow exists:
   ```bash
   ls -la _bmad/${MODULE_ID}/workflows/*/workflow.md
   ```

**Solutions:**
- Create missing workflows
- Fix paths in menu items
- Ensure workflow.md file exists (not just directory)

### Issue: Multiple Agents Have Same Name

**Symptoms:**
```
/analyst loads wrong agent
or
Command conflicts between modules
```

**Diagnosis:**
1. Check agent-manifest.csv for duplicates:
   ```bash
   cut -d',' -f2 _bmad/_config/agent-manifest.csv | sort | uniq -d
   ```

**Solutions:**
- Rename agents to be unique
- Use module-specific names (e.g., `cyber-analyst` vs `business-analyst`)
- Use fully qualified commands if needed: `/bmad:{module}:agents:{agent}`

### Issue: Config Variables Not Replacing

**Symptoms:**
- Agent shows `{user_name}` literally
- Output goes to `{output_folder}` path literally

**Diagnosis:**
1. Check activation step 2 loads config
2. Verify step 2 stores variables
3. Check variables used in right format: `{variable_name}`

**Solutions:**
- Ensure step 2 explicitly loads and stores variables
- Use correct variable syntax
- Verify config.yaml has the fields

### Issue: Party Mode Not Working

**Symptoms:**
- Party Mode command doesn't load
- Error loading party-mode workflow

**Diagnosis:**
1. Check Party Mode path in menu:
   ```bash
   grep "party-mode" _bmad/${MODULE_ID}/agents/${AGENT_ID}.md
   ```

2. Verify Party Mode workflow exists:
   ```bash
   ls -la _bmad/core/workflows/party-mode/workflow.md
   ```

**Solutions:**
- Ensure BMAD core is installed
- Fix path to party-mode workflow
- Check `{project-root}` resolves correctly

---

## Lessons Learned

### From Cyber-Ops Module Deployment

#### What Worked Well

1. **Two-File Command System**
   - Lightweight wrappers in `.claude/commands/`
   - Full implementations in `_bmad/{module}/agents/`
   - Clean separation of concerns
   - Easy maintenance

2. **Config Loading in Activation**
   - Step 2 loads config BEFORE any output
   - Stores variables for session
   - Enables personalization
   - Consistent user experience

3. **Detailed Personas**
   - Agents with rich backstories stay in character better
   - Signature phrases add personality
   - Specific expertise makes agents useful
   - Communication styles create distinct voices

4. **Comprehensive Menus**
   - Mix of inline actions and workflow execution
   - 6-12 items provides good coverage
   - Fuzzy matching makes commands accessible
   - Party Mode integration enables collaboration

5. **Documentation During Development**
   - Capture lessons while fresh
   - Document troubleshooting as you solve issues
   - Create deployment summaries
   - Build playbooks for next time

#### What Was Challenging

1. **Command Discovery**
   - Initially unclear why commands weren't found
   - Solution: Need both manifest entry AND command wrapper
   - Learning: Command structure must be complete

2. **Variable Resolution**
   - `{project-root}` needs careful usage
   - Must be consistent across all files
   - Learning: Test variable paths early

3. **Config Loading Timing**
   - Config must load BEFORE greeting
   - Step 2 must be IMMEDIATE
   - Learning: Make step 2 critical and blocking

4. **Agent Consistency**
   - Easy for agents to break character
   - Generic responses slip in
   - Learning: Detailed persona + reinforcement rules

5. **Artifact Cleanup**
   - Many temporary files created during build
   - Need organized cleanup strategy
   - Learning: Document what to keep vs delete

#### Best Practices Established

1. **Always use `{project-root}` variable** for portability
2. **Make config loading blocking** (step 2 critical)
3. **Create detailed personas** (not generic assistants)
4. **Test each agent independently** before integration
5. **Document as you build** (not after)
6. **Use consistent naming** (agent-id in all files)
7. **Verify command structure completely** (manifest + wrapper)
8. **Plan cleanup from the start** (know what's temporary)
9. **Test Party Mode integration** (multi-agent scenarios)
10. **Version everything** (tag releases)

#### Recommendations for Next Module

1. **Start with Planning Phase**
   - Define all agents upfront
   - Map out workflows
   - Plan configuration schema
   - Identify frameworks/standards

2. **Build One Agent Fully First**
   - Complete persona
   - Test config loading
   - Verify command works
   - Test all menu items
   - Use as template for others

3. **Register as You Build**
   - Add to manifest immediately
   - Create customize file immediately
   - Create command wrapper immediately
   - Don't wait until end

4. **Test Continuously**
   - Test agent after each change
   - Don't batch testing
   - Catch issues early

5. **Document Decisions**
   - Why certain persona choices
   - Why certain frameworks
   - Why certain menu items
   - Helps consistency across agents

6. **Plan Cleanup Strategy**
   - Know what's temporary vs permanent
   - Script cleanup if possible
   - Clean before final commit

---

## Appendix: Quick Reference

### Essential Paths

```bash
# Module structure
_bmad/{module-id}/
├── agents/{agent-id}.md
├── workflows/{workflow-id}/
├── config.yaml
├── module.yaml
└── README.md

# Registration
_bmad/_config/agent-manifest.csv
_bmad/_config/agents/{module-id}-{agent-id}.customize.yaml

# Commands
.claude/commands/bmad/{module-id}/agents/{agent-id}.md

# Output
_output/{module-id}/
```

### Essential Commands

```bash
# Create module structure
mkdir -p _bmad/{module-id}/{agents,workflows,data,tasks,templates}

# Create command structure
mkdir -p .claude/commands/bmad/{module-id}/agents

# Verify registration
grep "{module-id}" _bmad/_config/agent-manifest.csv

# Test agent
/{agent-id}

# Clean artifacts
rm -f _bmad/{module-id}/*-COMPLETE.md
rm -rf _bmad-output/bmb-creations/{module-id}
```

### Agent File Template (Minimal)

```markdown
---
name: "agent-id"
description: "Brief description"
---

You must fully embody this agent's persona...

```xml
<agent id="agent-id" name="Display Name" icon="🎯">
<activation critical="MANDATORY">
  <step n="1">Load persona</step>
  <step n="2">Load config from {project-root}/_bmad/{module}/config.yaml</step>
  <step n="3">Remember user name</step>
  <step n="4">Greet user and show menu</step>
  <step n="5">Wait for input</step>
  <step n="6">Process user input</step>
  <step n="7">Execute menu item</step>
</activation>

<persona>
  <role>Role Title</role>
  <identity>Detailed background...</identity>
  <communication_style>How they speak...</communication_style>
  <principles>Core beliefs...</principles>
</persona>

<menu>
  <item cmd="MH">[MH] Menu Help</item>
  <item cmd="CH">[CH] Chat</item>
  <!-- Domain items -->
  <item cmd="PM" exec="{project-root}/_bmad/core/workflows/party-mode/workflow.md">[PM] Party Mode</item>
  <item cmd="DA">[DA] Dismiss Agent</item>
</menu>
</agent>
```
```

### Command Wrapper Template

```markdown
---
name: 'agent-id'
description: 'agent-id agent'
---

You must fully embody this agent's persona...

<agent-activation CRITICAL="TRUE">
1. LOAD the FULL agent file from @_bmad/{module-id}/agents/{agent-id}.md
2. READ its entire contents
3. Execute ALL activation steps
4. Follow persona precisely
5. Stay in character
</agent-activation>
```

---

## Conclusion

This playbook captures the complete process of creating a BMAD module with agents, from planning through production deployment. It's based on real experience deploying the cyber-ops module and includes all the troubleshooting knowledge gained during that process.

**Key Takeaways:**
1. Plan thoroughly before building
2. Build one agent completely as template
3. Register as you go, don't batch
4. Test continuously
5. Document decisions and lessons
6. Clean artifacts before release

**Success Metrics:**
- All agents load via commands
- All agents stay in character
- All menu items work
- Config loads correctly
- Party Mode integration works
- No build artifacts in production
- Complete documentation

Follow this playbook for your next module and you'll have a smooth deployment.

---

**Document Version:** 1.0.0
**Created:** 2026-01-09
**Based On:** cyber-ops module deployment (2026-01-08 to 2026-01-09)
**Author:** BMAD Framework + Claude Sonnet 4.5
**Status:** Production-ready playbook
