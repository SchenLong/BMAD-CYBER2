# BMAD Installation Templates & Configuration System

**Epic 3: Story 3.4 - Complete Installation & Configuration Framework**
**Author**: Clara (Tech Writer)
**Version**: 1.0.0
**Status**: ✅ Complete

## Overview

This comprehensive system provides intelligent template generation, advanced variable substitution, environment-specific configuration handling, merge strategies, configuration validation, and post-install verification for BMAD specialized team modules.

### Integration with Existing Framework

This system integrates seamlessly with:
- **Amelia's Installation Framework** (Epic 3: Story 3.1) - YAML-to-MD conversion and core installation logic
- **Winston's Dependency Management** (Epic 3: Story 3.2) - Cross-module dependency resolution and version compatibility
- **Morgan's Package Registry** (Epic 3: Story 3.3) - Health monitoring and package tracking

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 BMAD Installation Orchestrator             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Template       │  │  Configuration  │  │ Configuration│ │
│  │  Engine         │  │  Manager        │  │ Validator    │ │
│  │                 │  │                 │  │              │ │
│  │ • Team configs  │  │ • Variable      │  │ • Structure  │ │
│  │ • Substitution  │  │   substitution  │  │ • Security   │ │
│  │ • Customization │  │ • Environment   │  │ • Performance│ │
│  └─────────────────┘  │   handling      │  │ • Compliance │ │
│                       │ • Merge         │  └──────────────┘ │
│  ┌─────────────────┐  │   strategies    │  ┌──────────────┐ │
│  │ Post-Install    │  └─────────────────┘  │ Dependencies │ │
│  │ Verifier        │                       │ Manager      │ │
│  │                 │  ┌─────────────────┐  │ (Winston)    │ │
│  │ • File checks   │  │ Package Registry│  │              │ │
│  │ • Integration   │  │ (Morgan)        │  │ • Resolution │ │
│  │ • Performance   │  │                 │  │ • Conflicts  │ │
│  │ • Security      │  │ • Health checks │  │ • Install    │ │
│  └─────────────────┘  │ • Tracking      │  │   ordering   │ │
│                       └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Core Components

### 1. BMAD Template Engine (`bmad-template-engine.js`)

Smart configuration template system with team-specific customizations:

**Features:**
- ✅ Team-specific configuration generation
- ✅ Intelligent variable substitution
- ✅ Dynamic prompt generation
- ✅ Cross-module integration points
- ✅ Configuration backup and versioning

**Supported Teams:**
- `cybersec-team` - 8 agents, 15 workflows, security-focused
- `intel-team` - 11 agents, 19 workflows, intelligence operations
- `legal-team` - 13 agents, 7 workflows, multi-jurisdictional law
- `strategy-team` - 14 agents, 17 workflows, strategic decision-making

### 2. BMAD Configuration Manager (`bmad-configuration-manager.js`)

Advanced variable substitution and environment handling:

**Variable Substitution Patterns:**
- `{VAR}` - Simple variables
- `{PARENT.CHILD}` - Nested variables
- `{function(args)}` - Function calls
- `{VAR ? value1 : value2}` - Conditional expressions
- `{VAR || default}` - Default values

**Context Hierarchy:**
1. **System** - OS, Node.js version, hardware info
2. **Environment** - Development, production, testing configs
3. **Project** - Project-specific variables from package.json
4. **Team** - Team-specific paths and settings
5. **User** - User preferences and customizations

**Built-in Functions:**
- `{now()}` - Current timestamp
- `{join(path1, path2)}` - Path joining
- `{env(VAR, default)}` - Environment variables
- `{hash(input)}` - Hash generation
- `{uuid()}` - UUID generation

### 3. BMAD Configuration Validator (`bmad-configuration-validator.js`)

Comprehensive validation with multiple check categories:

**Validation Categories:**
- **Structure** - Required fields, type checking, format validation
- **Content** - Version format, team codes, value ranges
- **Security** - Permission validation, dangerous commands, unsafe paths
- **Performance** - Resource limits, optimization recommendations
- **Compliance** - License requirements, documentation standards
- **Team-Specific** - Team requirements and constraints

**Validation Scoring:**
- 0-100 point scoring system
- Penalties for errors (-10 points) and warnings (-3 points)
- Pass threshold: 70+ points with no critical errors

### 4. BMAD Post-Install Verifier (`bmad-post-install-verifier.js`)

End-to-end verification system ensuring successful deployment:

**Verification Phases:**
1. **Installation** - Package presence, NPM registration, version consistency
2. **Configuration** - File existence, format validation, required fields
3. **Dependencies** - Core BMAD, NPM packages, cross-module dependencies
4. **Filesystem** - Directory structure, file integrity, permissions
5. **Agents** - Agent files, configurations, accessibility
6. **Workflows** - Workflow files, integration points
7. **Integration** - BMAD core connection, cross-module communication
8. **Performance** - Load times, memory usage, initialization speed
9. **Security** - File signatures, permission security, data protection

### 5. BMAD Installation Orchestrator (`bmad-installation-orchestrator.js`)

Main controller that coordinates all components:

**Installation Steps:**
1. **Configuration Generation** - Template processing and customization
2. **Configuration Processing** - Variable substitution and environment application
3. **Configuration Validation** - Comprehensive validation checks
4. **Dependency Resolution** - Using Winston's dependency manager
5. **Installation Execution** - Using Amelia's installation framework
6. **Post-Install Verification** - Complete system verification

## 🚀 Quick Start

### Basic Installation

```javascript
const BMADInstallationOrchestrator = require('./bmad-installation-orchestrator');

async function installTeam() {
    const orchestrator = new BMADInstallationOrchestrator({
        bmadRoot: './_bmad',
        enableValidation: true,
        enableVerification: true
    });

    await orchestrator.initialize();

    const result = await orchestrator.installTeamModule('cybersec-team', {
        environment: 'production',
        variables: new Map([
            ['SECURITY_FRAMEWORK', 'nist_cybersecurity_framework']
        ])
    });

    console.log(result.success ? 'Success!' : `Failed: ${result.error}`);
}
```

### Configuration Generation Only

```javascript
const BMADTemplateEngine = require('./bmad-template-engine');

async function generateConfig() {
    const engine = new BMADTemplateEngine();
    await engine.initialize();

    const result = await engine.generateTeamConfiguration('intel-team', {
        environment: 'development',
        variables: new Map([
            ['AUTHORIZATION_LEVEL', 'accredited_professional'],
            ['OUTPUT_FOLDER', '/custom/intel/output']
        ])
    });

    console.log('Configuration generated:', result.configuration);
}
```

## 🔧 Configuration Examples

### Team-Specific Variables

#### Cybersec Team
```yaml
team_specific_config:
  prompt: "What is your security framework preference?"
  default: "nist_cybersecurity_framework"
  single-select:
    - value: "nist_cybersecurity_framework"
      label: "NIST Cybersecurity Framework"
    - value: "iso_27001"
      label: "ISO 27001 Standard"
    - value: "custom_framework"
      label: "Custom Security Framework"
```

#### Intel Team
```yaml
team_specific_config:
  prompt: "What is your operational authorization level?"
  default: "accredited_professional"
  single-select:
    - value: "academic_research"
      label: "Academic Research - Educational use only"
    - value: "accredited_professional"
      label: "Accredited Professional - Licensed investigator"
    - value: "law_enforcement"
      label: "Law Enforcement - Official capacity"
```

#### Legal Team
```yaml
team_specific_config:
  prompt: "What is your primary jurisdiction?"
  default: "united_states"
  single-select:
    - value: "united_states"
      label: "United States Federal and State Law"
    - value: "european_union"
      label: "European Union Law"
    - value: "spain"
      label: "Spanish Civil and Commercial Law"
    - value: "estonia"
      label: "Estonian Digital Business Law"
    - value: "multi_jurisdiction"
      label: "Multi-Jurisdictional Practice"
```

#### Strategy Team
```yaml
team_specific_config:
  prompt: "What is your primary strategic focus?"
  default: "corporate_strategy"
  single-select:
    - value: "corporate_strategy"
      label: "Corporate Strategy & Leadership"
    - value: "political_strategy"
      label: "Political Strategy & Policy"
    - value: "crisis_management"
      label: "Crisis Management & Response"
    - value: "competitive_intelligence"
      label: "Competitive Intelligence"
```

### Environment Configurations

#### Development Environment
```yaml
environment:
  name: development
  variables:
    DEBUG: "true"
    LOG_LEVEL: "debug"
    CACHE_ENABLED: "false"
  overrides:
    testing:
      unit_tests: true
      integration_tests: true
    security:
      signature_required: false
```

#### Production Environment
```yaml
environment:
  name: production
  variables:
    DEBUG: "false"
    LOG_LEVEL: "info"
    CACHE_ENABLED: "true"
  overrides:
    security:
      signature_required: true
      integrity_check: true
```

### Variable Substitution Examples

```yaml
# Simple variables
code: "{TEAM_MODULE_CODE}"
name: "{TEAM_DISPLAY_NAME}"

# Function calls
timestamp: "{now()}"
unique_id: "{uuid()}"
config_hash: "{hash(TEAM_MODULE_CODE)}"

# Conditional expressions
debug_mode: "{DEBUG ? true : false}"
log_level: "{ENVIRONMENT == 'production' ? 'info' : 'debug'}"

# Default values
output_folder: "{CUSTOM_OUTPUT_FOLDER || '_bmad-output/{TEAM_MODULE_CODE}'}"

# Path operations
agents_path: "{join(NPM_PACKAGE_ROOT, 'dist', 'agents')}"
full_path: "{resolve(PROJECT_ROOT, OUTPUT_FOLDER)}"
```

## 🔍 Validation & Verification

### Configuration Validation

The system performs comprehensive validation across multiple dimensions:

**Example Validation Report:**
```json
{
  "valid": true,
  "score": 92,
  "errors": [],
  "warnings": [
    {
      "severity": "warning",
      "field": "permissions.network",
      "message": "Network access enabled for team that may not require it",
      "code": "UNNECESSARY_NETWORK_PERMISSION"
    }
  ],
  "checks": {
    "structure": { "passed": 15, "total": 15, "issues": [] },
    "content": { "passed": 12, "total": 13, "issues": [...] },
    "security": { "passed": 8, "total": 9, "issues": [...] },
    "performance": { "passed": 5, "total": 5, "issues": [] },
    "compliance": { "passed": 7, "total": 8, "issues": [...] }
  }
}
```

### Post-Install Verification

**Example Verification Report:**
```json
{
  "success": true,
  "moduleInfo": {
    "name": "cybersec-team",
    "version": "2.0.0"
  },
  "summary": {
    "totalChecks": 28,
    "passedChecks": 26,
    "failedChecks": 0,
    "warningChecks": 2
  },
  "checks": {
    "installation": { "status": "passed" },
    "configuration": { "status": "passed" },
    "dependencies": { "status": "passed" },
    "filesystem": { "status": "passed" },
    "permissions": { "status": "warning" },
    "agents": { "status": "passed" },
    "workflows": { "status": "passed" },
    "integration": { "status": "passed" },
    "performance": { "status": "passed" },
    "security": { "status": "warning" }
  },
  "recommendations": [
    {
      "priority": "medium",
      "category": "permissions",
      "message": "Review file permissions for security",
      "actions": ["Check write access permissions", "Verify agent access controls"]
    }
  ]
}
```

## 📁 File Structure

```
bmad-installation-system/
├── bmad-template-engine.js           # Template generation system
├── bmad-configuration-manager.js     # Variable substitution & environments
├── bmad-configuration-validator.js   # Comprehensive validation
├── bmad-post-install-verifier.js     # Post-install verification
├── bmad-installation-orchestrator.js # Main coordination system
├── example-usage.js                  # Usage examples
├── module.yaml.template               # Base team module template
├── *-team-module.yaml.example        # Team-specific examples
└── generated/                        # Output directory
    ├── cybersec-team/
    │   ├── module.yaml
    │   ├── module.production.yaml
    │   ├── install.sh
    │   ├── validation-report.json
    │   └── generation-metadata.json
    ├── intel-team/
    ├── legal-team/
    ├── strategy-team/
    └── verification-reports/
        ├── verification-{id}.json
        └── verification-{id}.txt
```

## 🎯 Advanced Usage

### Custom Merge Strategies

```javascript
// Smart merge preserves user customizations
const result = await orchestrator.installTeamModule('legal-team', {
    mergeStrategy: 'smart', // smart | replace | preserve | merge-basic | additive
    preserveUserConfig: true
});
```

### Environment-Specific Installation

```javascript
// Development environment with debugging
const devResult = await orchestrator.installTeamModule('intel-team', {
    environment: 'development',
    variables: new Map([
        ['DEBUG', 'true'],
        ['MOCK_EXTERNAL_SERVICES', 'true'],
        ['LOG_LEVEL', 'debug']
    ])
});

// Production environment with security
const prodResult = await orchestrator.installTeamModule('intel-team', {
    environment: 'production',
    variables: new Map([
        ['SECURITY_LEVEL', 'high'],
        ['AUDIT_LOGGING', 'comprehensive'],
        ['ENCRYPTION_REQUIRED', 'true']
    ])
});
```

### Bulk Operations

```javascript
// Generate all team configurations
const configurations = await orchestrator.generateAllTeamConfigurations({
    environment: 'production'
});

// Export to files
await orchestrator.exportConfigurations('./configs', 'yaml');

// Install all teams
const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
for (const team of teams) {
    const result = await orchestrator.installTeamModule(team, {
        continueOnFailure: true
    });
    console.log(`${team}: ${result.success ? 'Success' : 'Failed'}`);
}
```

## 🔄 Integration with Existing Systems

### With Amelia's Installation Framework

The orchestrator seamlessly integrates with Amelia's YAML-to-MD conversion and installation logic:

```javascript
// The orchestrator calls into Amelia's framework during installation execution
const executionResult = await this.dependencyManager.executeInstallationPlan(
    installationPlan,
    executionOptions
);
```

### With Winston's Dependency Management

Dependency resolution is handled by Winston's comprehensive system:

```javascript
// Resolve dependencies using Winston's manager
const dependencyResult = await this.dependencyManager.resolveDependencies(config, {
    environment: options.environment,
    allowCircular: false
});
```

### With Morgan's Package Registry

Post-installation, modules are registered with Morgan's health monitoring system:

```javascript
// Register installed package for health monitoring
await packageRegistry.registerPackage({
    name: moduleConfig.name,
    version: moduleConfig.version,
    configuration: processedConfig,
    installedFiles: installedFiles
});
```

## 🛠️ Testing & Examples

### Run All Examples

```bash
node example-usage.js
```

### Individual Examples

```javascript
const examples = require('./example-usage');

// Install single team
await examples.installSingleTeam();

// Generate configurations only
await examples.generateConfigurationsOnly();

// Validate existing installation
await examples.validateExistingInstallation();

// Monitor installation progress
await examples.monitorInstallationProgress();
```

## 📊 Performance & Statistics

### Installation Statistics

```javascript
const status = orchestrator.getStatus();

console.log('Installation Statistics:', {
    totalInstallations: status.statistics.totalInstallations,
    successfulInstallations: status.statistics.successfulInstallations,
    failedInstallations: status.statistics.failedInstallations,
    averageInstallationTime: status.statistics.averageInstallationTime
});
```

### Component Status

```javascript
const status = orchestrator.getStatus();

console.log('Component Status:', {
    templateEngine: status.components.templateEngine.templatesLoaded,
    configurationManager: status.components.configurationManager.environments,
    configurationValidator: status.components.configurationValidator.validationRules,
    postInstallVerifier: status.components.postInstallVerifier.verificationChecks
});
```

## 🔒 Security Features

### Permission Validation
- ✅ Network access validation per team requirements
- ✅ Shell command safety checking
- ✅ Sensitive data access controls
- ✅ File system permission verification

### Configuration Security
- ✅ Digital signature verification
- ✅ File integrity checking
- ✅ Path security validation
- ✅ Dangerous command detection

### Audit & Compliance
- ✅ License compliance checking
- ✅ Documentation requirements
- ✅ Maintainer information validation
- ✅ Audit trail generation

## 🚨 Error Handling & Recovery

### Validation Failures

```javascript
if (!result.validation.valid && strictMode) {
    console.log('Validation failed:');
    for (const error of result.validation.errors) {
        console.log(`- ${error.field}: ${error.message}`);
    }
    // Automatic configuration repair suggestions
}
```

### Installation Failures

```javascript
if (!result.success) {
    console.log(`Installation failed: ${result.error}`);
    console.log(`Completed steps: ${result.completedSteps.join(', ')}`);
    // Automatic rollback and recovery
}
```

### Verification Issues

```javascript
if (!result.verification.success) {
    console.log('Post-install verification issues:');
    for (const issue of result.verification.issues) {
        console.log(`[${issue.severity}] ${issue.message}`);
    }
    // Automatic fix recommendations
}
```

## 🎉 Success Metrics

### Epic 3: Story 3.4 - Completion Status

- ✅ **Template System**: Smart configuration generation with team customizations
- ✅ **Variable Substitution**: Advanced patterns with function calls and conditionals
- ✅ **Environment Handling**: Multi-environment support with intelligent overrides
- ✅ **Merge Strategies**: Smart preservation of user customizations
- ✅ **Configuration Validation**: Comprehensive multi-category validation
- ✅ **Post-Install Verification**: End-to-end deployment verification
- ✅ **Integration**: Seamless integration with Amelia, Winston, and Morgan's systems
- ✅ **Documentation**: Complete usage examples and API documentation

### Integration Achievements

- ✅ **Amelia Integration**: Uses YAML-to-MD conversion and installation framework
- ✅ **Winston Integration**: Leverages dependency resolution and conflict management
- ✅ **Morgan Integration**: Connects with package registry and health monitoring
- ✅ **Complete Pipeline**: Full end-to-end installation and verification workflow

## 📞 Support & Troubleshooting

### Common Issues

1. **Template Generation Fails**
   - Check team code spelling (`cybersec-team`, `intel-team`, `legal-team`, `strategy-team`)
   - Verify base template exists
   - Check variable substitution syntax

2. **Validation Failures**
   - Review validation report for specific issues
   - Use `strictMode: false` for warnings-only validation
   - Check team-specific requirements

3. **Installation Timeouts**
   - Increase timeout settings
   - Use sequential installation for complex dependencies
   - Check network connectivity for external dependencies

4. **Verification Issues**
   - Check file permissions
   - Verify installation paths
   - Review dependency resolution results

### Debug Mode

```javascript
const orchestrator = new BMADInstallationOrchestrator({
    verboseOutput: true,
    debug: true
});
```

### Log Analysis

```bash
# Check generated logs
tail -f _bmad/logs/installation.log
tail -f _bmad/logs/validation.log
tail -f _bmad/logs/verification.log
```

---

**Ready to power the BMAD ecosystem with intelligent installation and configuration management!** 🚀