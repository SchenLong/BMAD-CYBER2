# BMAD Specialized Teams - Multi-Module Distribution Template

## Overview

This repository contains the standardized templates and specifications for converting the BMAD Specialized Teams (cybersec-team, intel-team, legal-team, strategy-team) from the integrated BMAD system into a multi-module NPM distribution package.

## Story 1.1 Deliverables

### ✅ Completed Components

1. **Standardized module.yaml Template** (`module.yaml.template`)
   - Universal template for all 4 specialized team modules
   - Follows bmad-builder format exactly
   - NPM packaging and distribution metadata
   - Cross-team dependency declarations

2. **Agent Conversion Specifications** (`agent-conversion-spec.md`)
   - Complete conversion from .md to .agent.yaml format
   - Field mapping rules and validation requirements
   - Team-specific conversion notes

3. **NPM Package Configuration**
   - Root package.json template for multi-module workspace
   - Individual team package.json templates
   - Workspace and dependency management

4. **Example Module Configurations**
   - Intel Team module.yaml example
   - Cybersec Team module.yaml example
   - Legal Team module.yaml example
   - Strategy Team module.yaml example

## Repository Structure

The target repository structure for `bmad-specialized-teams` will be:

```
BMAD-CYBERCOMMAND/
├── package.json                    # Root workspace configuration
├── README.md
├── CHANGELOG.md
├── LICENSE
├── rollup.config.js               # Build configuration
├── tsconfig.json                  # TypeScript configuration
├── .gitignore
├── .npmignore
├── docs/
│   ├── api/                       # API documentation
│   ├── guides/                    # User guides
│   └── examples/                  # Usage examples
├── tests/
│   ├── integration/               # Cross-team integration tests
│   └── fixtures/                  # Test data
├── tools/                         # Build and development tools
└── src/                           # Source modules
    ├── cybersec-team/
    │   ├── package.json           # Team-specific package.json
    │   ├── module.yaml            # Team module configuration
    │   ├── README.md
    │   ├── agents/                # Source agent files (.md)
    │   ├── workflows/             # Source workflow files (.md)
    │   ├── tools/                 # Team-specific utilities
    │   ├── data/                  # Team data files
    │   ├── tests/                 # Team-specific tests
    │   └── dist/                  # Compiled output (.agent.yaml, .workflow.yaml)
    ├── intel-team/
    │   └── [same structure as cybersec-team]
    ├── legal-team/
    │   └── [same structure as cybersec-team]
    └── strategy-team/
        └── [same structure as cybersec-team]
```

## Template Usage Instructions

### 1. Creating Module Configuration Files

For each team module, copy `module.yaml.template` and replace the placeholders:

```bash
# Example for intel-team
cp module.yaml.template src/intel-team/module.yaml

# Replace placeholders in the file:
# {TEAM_MODULE_CODE} → "intel-team"
# {TEAM_DISPLAY_NAME} → "Intelligence Operations Team"
# {AGENT_COUNT} → 11
# {WORKFLOW_COUNT} → 19
# etc.
```

### 2. Package.json Configuration

#### Root Package.json
- Copy `package.json.template` to root directory
- Configure workspace paths for all 4 teams
- Set up build and test scripts

#### Team Package.json Files
- Copy `team-package.json.template` for each team
- Replace team-specific placeholders
- Configure team-specific dependencies and scripts

### 3. Agent Conversion

Use the specifications in `agent-conversion-spec.md` to convert agents:

```bash
# Convert all agents in a module
bmad convert agents --module intel-team --format yaml

# Convert specific agent
bmad convert agent --input agents/osint-lead.md --output dist/agents/osint-lead.agent.yaml

# Validate converted agents
bmad validate agents --module intel-team --format yaml
```

## Placeholder Substitution Guide

### Common Placeholders (All Teams)

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{TEAM_MODULE_CODE}` | Team identifier | `intel-team` |
| `{TEAM_DISPLAY_NAME}` | Full team name | `Intelligence Operations Team` |
| `{TEAM_TYPE}` | Team category | `Intelligence` |
| `{AGENT_COUNT}` | Number of agents | `11` |
| `{WORKFLOW_COUNT}` | Number of workflows | `19` |

### Team-Specific Values

#### Intel Team
- **TEAM_MODULE_CODE**: `intel-team`
- **TEAM_DISPLAY_NAME**: `Intelligence Operations Team`
- **TEAM_TYPE**: `Intelligence`
- **AGENT_COUNT**: `11`
- **WORKFLOW_COUNT**: `19`
- **TEAM_KEYWORD_1**: `intelligence`
- **TEAM_KEYWORD_2**: `osint`
- **TEAM_KEYWORD_3**: `investigation`
- **NETWORK_ACCESS_REQUIRED**: `true`
- **SENSITIVE_DATA_ACCESS**: `true`
- **ALLOWED_SHELL_COMMANDS**: `["curl", "wget", "whois", "dig", "nslookup", "host"]`

#### Cybersec Team
- **TEAM_MODULE_CODE**: `cybersec-team`
- **TEAM_DISPLAY_NAME**: `Cybersecurity Operations Team`
- **TEAM_TYPE**: `Security`
- **AGENT_COUNT**: `15`
- **WORKFLOW_COUNT**: `13`
- **TEAM_KEYWORD_1**: `cybersecurity`
- **TEAM_KEYWORD_2**: `security`
- **TEAM_KEYWORD_3**: `pentesting`
- **NETWORK_ACCESS_REQUIRED**: `true`
- **SENSITIVE_DATA_ACCESS**: `true`
- **ALLOWED_SHELL_COMMANDS**: `["nmap", "curl", "wget", "netstat", "ss", "dig"]`

#### Legal Team
- **TEAM_MODULE_CODE**: `legal-team`
- **TEAM_DISPLAY_NAME**: `Legal Advisory Team`
- **TEAM_TYPE**: `Legal`
- **AGENT_COUNT**: `13`
- **WORKFLOW_COUNT**: `8`
- **TEAM_KEYWORD_1**: `legal`
- **TEAM_KEYWORD_2**: `compliance`
- **TEAM_KEYWORD_3**: `contracts`
- **NETWORK_ACCESS_REQUIRED**: `false`
- **SENSITIVE_DATA_ACCESS**: `true`
- **ALLOWED_SHELL_COMMANDS**: `[]`

#### Strategy Team
- **TEAM_MODULE_CODE**: `strategy-team`
- **TEAM_DISPLAY_NAME**: `Strategic Advisory Team`
- **TEAM_TYPE**: `Strategic`
- **AGENT_COUNT**: `14`
- **WORKFLOW_COUNT**: `16`
- **TEAM_KEYWORD_1**: `strategy`
- **TEAM_KEYWORD_2**: `leadership`
- **TEAM_KEYWORD_3**: `decision-making`
- **NETWORK_ACCESS_REQUIRED**: `false`
- **SENSITIVE_DATA_ACCESS**: `false`
- **ALLOWED_SHELL_COMMANDS**: `[]`

## Build and Distribution Process

### 1. Development Setup

```bash
# Clone repository
git clone https://github.com/bmad-code-org/bmad-specialized-teams.git
cd bmad-specialized-teams

# Install dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

### 2. Build Process

```bash
# Clean build
npm run clean

# Validate source files
npm run validate

# Convert agents and workflows
npm run convert

# Build all modules
npm run build

# Test everything
npm run test
```

### 3. Publishing

```bash
# Publish all modules to NPM
npm run publish:modules

# Or publish individually
cd src/intel-team
npm publish
```

## Cross-Team Integration

### Dependency Matrix

| Team | Dependencies | Provides |
|------|-------------|----------|
| Intel Team | Core BMAD | Intelligence consultation, Threat assessment |
| Cybersec Team | Core BMAD, Intel (optional) | Security consultation, Incident response |
| Legal Team | Core BMAD, Strategy (optional) | Legal consultation, Compliance review |
| Strategy Team | Core BMAD, Legal (optional) | Strategic consultation, Decision analysis |

### Integration Workflows

Each team exposes standard integration workflows:
- `{team}-consultation` - External consultation requests
- `{team}-emergency-response` - Urgent response capabilities
- Cross-team workflows can be triggered via the core BMAD orchestration system

## Testing Strategy

### Unit Tests
- Agent configuration validation
- Workflow step validation
- Conversion process testing

### Integration Tests
- Cross-team workflow execution
- Dependency resolution
- Configuration compatibility

### End-to-End Tests
- Full module installation
- Agent activation and execution
- Workflow completion

## Security Considerations

### Permissions Model
- Each team has specific filesystem, network, and shell permissions
- Sensitive data access controlled per team requirements
- Cross-team access through controlled interfaces only

### Signature Verification
- All modules require GPG signature verification
- Integrity checks on installation
- Dependency scanning for vulnerabilities

## Migration Path

### Phase 1: Template Creation ✅
- Standardized templates complete
- Conversion specifications defined
- Example configurations created

### Phase 2: Source Extraction (Next)
- Extract current team modules from integrated BMAD
- Apply conversion templates
- Validate converted modules

### Phase 3: Build System
- Implement bmad-builder integration
- Set up CI/CD pipeline
- Create automated testing

### Phase 4: Distribution
- Publish to NPM registry
- Update BMAD core to use NPM modules
- Migration documentation

## File Templates Reference

| Template File | Purpose | Usage |
|---------------|---------|--------|
| `module.yaml.template` | Universal module configuration | Copy and customize for each team |
| `package.json.template` | Root workspace package.json | Use as main package.json |
| `team-package.json.template` | Individual team package.json | Copy for each team module |
| `agent-conversion-spec.md` | Conversion documentation | Reference for conversion process |
| `*-module.yaml.example` | Team-specific examples | Reference implementations |

## Support and Contributions

- **Issues**: Report issues in the main repository
- **Documentation**: Comprehensive API and usage docs
- **Community**: Discussion forums for team coordination
- **Maintenance**: BMAD development team primary responsibility

## Next Steps for Winston (Dependency Matrix)

The dependency matrix creation (Story 1.2) should build upon these templates:

1. **Use the cross-team integration specifications** defined in each module.yaml
2. **Reference the exposed_workflows and consumed_workflows** sections
3. **Build the dependency graph** from the peer_dependencies declarations
4. **Map workflow trigger chains** between teams
5. **Document security boundaries** for cross-team access

The templates provide the foundation structure that the dependency matrix will formalize and expand upon.