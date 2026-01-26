# BMAD Dependency Management System - Integration Guide

**Version**: 2.0.0
**Designed by**: Winston (Architect)
**Epic**: 3 - Story 3.2
**Date**: January 23, 2026

## Overview

The BMAD Dependency Management System provides comprehensive dependency resolution, version compatibility checking, and installation orchestration for distributed BMAD modules. This system integrates with Amelia's installation framework to provide a seamless experience for managing specialized team modules.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Core Components](#core-components)
3. [Installation and Setup](#installation-and-setup)
4. [Configuration](#configuration)
5. [Usage Examples](#usage-examples)
6. [Integration with Amelia's Framework](#integration-with-amelias-framework)
7. [Specialized Teams Configuration](#specialized-teams-configuration)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)
10. [API Reference](#api-reference)

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  BMAD Dependency Management System              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │   Dependencies  │  │  Version Compat  │  │   Circular      │ │
│  │   Manager       │  │  Checker         │  │   Detection     │ │
│  │                 │  │                  │  │                 │ │
│  └─────────────────┘  └──────────────────┘  └─────────────────┘ │
│           │                     │                     │         │
│           └─────────────────────┼─────────────────────┘         │
│                                 │                               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │            Package Registry Manager                         │ │
│  │        (Node.js Compatibility & NPM Integration)          │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    Amelia's Installation Framework              │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. BMADDependencyManager
Main orchestrator for dependency resolution and installation planning.

**Key Features:**
- Cross-module dependency resolution
- Installation order optimization
- Conflict detection and resolution
- Integration with Amelia's installation framework

### 2. BMADVersionChecker
Validates BMAD core and cross-module version requirements.

**Key Features:**
- BMAD core compatibility checking
- Semantic version validation
- Agent and workflow availability verification
- Peer dependency resolution

### 3. BMADCircularDetector
Advanced circular dependency detection and resolution strategies.

**Key Features:**
- Depth-First Search (DFS) cycle detection
- Tarjan's algorithm for strongly connected components
- Resolution strategy suggestions
- Installation plan validation

### 4. BMADPackageRegistryManager
Node.js compatibility verification and NPM package management.

**Key Features:**
- Runtime environment detection
- Node.js feature compatibility checking
- Security audit integration
- NPM package installation management

## Installation and Setup

### Prerequisites

```bash
# Required Node.js and NPM versions
Node.js: >=18.0.0 (Recommended: 20.x)
NPM: >=8.0.0 (Recommended: 10.x)
```

### Installation

1. **Install Core Dependencies**

```bash
npm install --save semver yaml joi lodash
npm install --save-dev jest eslint
```

2. **Initialize the Dependency System**

```javascript
const BMADDependencyManager = require('./bmad-dependency-manager.js');
const BMADVersionChecker = require('./bmad-version-compatibility.js');
const BMADPackageRegistryManager = require('./package-registry-manager.js');

// Initialize the dependency management system
const dependencyManager = new BMADDependencyManager({
    bmadRoot: './_bmad',
    npmRegistry: 'https://registry.npmjs.org',
    maxRetries: 3,
    timeout: 30000
});

await dependencyManager.initialize();
```

3. **Verify Installation**

```javascript
// Check system compatibility
const packageManager = new BMADPackageRegistryManager();
await packageManager.initialize();

const runtimeEnv = packageManager.getRuntimeEnvironment();
console.log('Runtime Environment:', runtimeEnv);
```

## Configuration

### dependencies.yaml Format

The system uses a comprehensive `dependencies.yaml` format for module configuration:

```yaml
# Package Identification
package:
  name: "@bmad-cybercommand/cybersec-team"
  version: "2.0.0"
  type: "specialized-team"

# BMAD Core Dependencies
bmad_core:
  version: ">=2.0.0"
  critical_agents: ["abdul", "bmad-master"]
  essential_workflows: ["party-mode", "cross-module"]

# Runtime Requirements
runtime:
  node:
    version: ">=18.0.0"
    recommended: "20.x"
  npm:
    version: ">=8.0.0"

# Cross-Module Dependencies
cross_module:
  optional:
    - module: "@bmad-cybercommand/intel-team"
      version: ">=2.0.0"
      condition: "threat_intelligence_integration"

# Installation Configuration
installation_order:
  phases:
    - name: "pre_install"
      steps:
        - action: "validate_node_version"
          requirement: ">=18.0.0"
          critical: true
```

### Environment Variables

```bash
# Optional: Custom NPM registry
BMAD_NPM_REGISTRY=https://registry.npmjs.org

# Optional: Enable debug logging
BMAD_DEBUG=true

# Optional: Dependency cache timeout (milliseconds)
BMAD_CACHE_TIMEOUT=300000
```

## Usage Examples

### Basic Dependency Resolution

```javascript
const dependencyManager = new BMADDependencyManager();
await dependencyManager.initialize();

// Load module configuration
const moduleConfig = {
    name: "cybersec-team",
    version: "2.0.0",
    type: "specialized-team",
    // ... full configuration
};

// Resolve dependencies
const result = await dependencyManager.resolveDependencies(moduleConfig);

if (result.success) {
    console.log('Dependencies resolved successfully');
    console.log('Installation plan:', result.installationPlan);
} else {
    console.error('Dependency resolution failed:', result.error);
}
```

### Version Compatibility Checking

```javascript
const versionChecker = new BMADVersionChecker();
await versionChecker.initialize('./_bmad');

const packageInfo = {
    name: "cybersec-team",
    version: "2.0.0",
    engines: { node: ">=18.0.0", npm: ">=8.0.0" }
};

const compatibility = versionChecker.validateModuleCompatibility(
    packageInfo.name,
    packageInfo.version,
    packageInfo
);

console.log('Compatible:', compatibility.compatible);
console.log('Errors:', compatibility.errors);
console.log('Warnings:', compatibility.warnings);
```

### Circular Dependency Detection

```javascript
const circularDetector = new BMADCircularDetector();
circularDetector.initialize();

// Detect cycles in dependency graph
const cycleDetection = circularDetector.detectCircularDependencies(dependencyGraph);

if (cycleDetection.hasCircularDependencies) {
    console.log('Circular dependencies detected:');
    cycleDetection.cycles.forEach((cycle, index) => {
        console.log(`${index + 1}. [${cycle.severity}] ${cycle.modules.join(' → ')}`);
    });

    // Get resolution strategies
    const strategies = cycleDetection.resolutionStrategies;
    console.log('Suggested resolution strategies:', strategies);
}
```

### Package Installation with Compatibility Check

```javascript
const packageManager = new BMADPackageRegistryManager({
    securityAuditEnabled: true,
    strictCompatibility: false
});

await packageManager.initialize();

// Install with compatibility verification
const result = await packageManager.installPackage(
    "@bmad-cybercommand/cybersec-team",
    "2.0.0",
    { save: true }
);

if (result.success) {
    console.log('Package installed successfully');
} else {
    console.error('Installation failed:', result.error);
}
```

## Integration with Amelia's Framework

The dependency management system is designed to integrate seamlessly with Amelia's installation framework:

### Integration Points

1. **Pre-Installation Validation**
```javascript
// Called by Amelia before starting installation
const validationResult = await dependencyManager.validateInstallationPlan(plan);

if (!validationResult.valid) {
    throw new Error(`Installation validation failed: ${validationResult.errors.join(', ')}`);
}
```

2. **Installation Execution**
```javascript
// Amelia calls this to execute the installation plan
const executionResult = await dependencyManager.executeInstallationPlan(
    installationPlan,
    {
        continueOnFailure: false,
        sequential: false
    }
);
```

3. **Progress Monitoring**
```javascript
// Amelia can monitor installation progress
dependencyManager.on('phase_started', (phase) => {
    console.log(`Starting phase: ${phase.name}`);
});

dependencyManager.on('module_installed', (moduleId) => {
    console.log(`Installed: ${moduleId}`);
});
```

### Amelia Integration Example

```javascript
// Integration wrapper for Amelia
class AmeliaDependencyIntegration {
    constructor(ameliaFramework) {
        this.amelia = ameliaFramework;
        this.dependencyManager = new BMADDependencyManager();
    }

    async installModule(moduleConfig, options = {}) {
        // Step 1: Resolve dependencies
        const resolution = await this.dependencyManager.resolveDependencies(moduleConfig);

        if (!resolution.success) {
            throw new Error(`Dependency resolution failed: ${resolution.error}`);
        }

        // Step 2: Validate with Amelia's requirements
        const ameliaValidation = await this.amelia.validateInstallation(resolution.installationPlan);

        if (!ameliaValidation.valid) {
            throw new Error(`Amelia validation failed: ${ameliaValidation.errors.join(', ')}`);
        }

        // Step 3: Execute installation through Amelia
        return await this.amelia.executeInstallation(resolution.installationPlan, options);
    }
}
```

## Specialized Teams Configuration

### Cybersecurity Team
```yaml
# cybersec-team-module.yaml
code: "cybersec-team"
name: "Cybersecurity Operations Team"
version: "2.0.0"

agents:
  count: 15
  core_team: ["cipher", "bastion", "sentinel", "trace", "phoenix"]
  extended_team: ["watchman", "nimbus", "ledger", "weaver", "gateway"]

dependencies:
  core:
    - module: "bmad:core"
      version: ">=2.0.0"
      agents: ["abdul", "bmad-master"]
      workflows: ["party-mode", "incident-response"]

  peer_dependencies:
    - module: "@bmad-cybercommand/intel-team"
      version: ">=2.0.0"
      condition: "threat_intel_integration_enabled"
```

### Intelligence Team
```yaml
# intel-team-module.yaml
code: "intel-team"
name: "Intelligence Operations Team"
version: "2.0.0"

agents:
  count: 11
  core_team: ["osint-lead", "domain-intel-specialist", "threat-actor-profiler"]
  extended_team: ["social-media-analyst", "dark-web-analyst", "field-operative"]

dependencies:
  core:
    - module: "bmad:core"
      version: ">=2.0.0"

  peer_dependencies:
    - module: "@bmad-cybercommand/cybersec-team"
      version: ">=2.0.0"
      condition: "cybersec_workflows_enabled"
```

### Legal Team
```yaml
# legal-team-module.yaml
code: "legal-team"
name: "Legal Operations Team"
version: "2.0.0"

agents:
  count: 13
  core_team: ["counsel", "liberty", "europa", "charter", "covenant"]
  extended_team: ["tribute", "iberia", "deed", "gremio", "advocate"]

dependencies:
  core:
    - module: "bmad:core"
      version: ">=2.0.0"

  peer_dependencies:
    - module: "@bmad-cybercommand/strategy-team"
      version: ">=2.0.0"
      condition: "strategic_legal_analysis"
```

### Strategy Team
```yaml
# strategy-team-module.yaml
code: "strategy-team"
name: "Strategic Operations Team"
version: "2.0.0"

agents:
  count: 14
  core_team: ["the-master-strategist", "the-realist", "communications-director"]
  extended_team: ["policy-analyst", "political-strategist", "ethics-advisor"]

dependencies:
  core:
    - module: "bmad:core"
      version: ">=2.0.0"

  peer_dependencies:
    - module: "@bmad-cybercommand/legal-team"
      version: ">=2.0.0"
      condition: "legal_strategy_integration"
```

## Troubleshooting

### Common Issues

#### 1. Version Compatibility Errors

**Problem**: Module requires newer BMAD core version than installed.

**Solution**:
```javascript
// Check current BMAD core version
const versionChecker = new BMADVersionChecker();
await versionChecker.initialize();
const coreVersion = versionChecker.coreVersion;

console.log(`Current BMAD core: ${coreVersion}`);
console.log('Required version: >=2.0.0');

// Upgrade if necessary
if (semver.lt(coreVersion, '2.0.0')) {
    console.log('Please upgrade BMAD core to version 2.0.0 or higher');
}
```

#### 2. Circular Dependency Issues

**Problem**: Circular dependencies detected between specialized teams.

**Solution**:
```javascript
const circularDetector = new BMADCircularDetector();
const detection = circularDetector.detectCircularDependencies(graph);

if (detection.hasCircularDependencies) {
    // Apply suggested resolution strategies
    const strategies = detection.resolutionStrategies;
    const bestStrategy = strategies[0]; // Highest scored strategy

    console.log(`Recommended resolution: ${bestStrategy.title}`);
    console.log(`Implementation: ${bestStrategy.implementation.approach}`);
}
```

#### 3. Node.js Compatibility Issues

**Problem**: Package requires newer Node.js features not available in current version.

**Solution**:
```javascript
const packageManager = new BMADPackageRegistryManager();
await packageManager.initialize();

const runtimeEnv = packageManager.getRuntimeEnvironment();
console.log(`Current Node.js: ${runtimeEnv.node.version}`);
console.log(`Available features: ${runtimeEnv.node.features.join(', ')}`);

// Check specific package compatibility
const compatibility = await packageManager.verifyNodeCompatibility(packageInfo);
if (!compatibility.compatible) {
    console.log('Compatibility issues:');
    compatibility.errors.forEach(error => console.log(`  - ${error}`));
}
```

#### 4. NPM Installation Failures

**Problem**: NPM package installation fails due to network or permission issues.

**Solution**:
```bash
# Check NPM configuration
npm config list

# Verify registry access
npm ping

# Check permissions
npm whoami

# Alternative: Use different registry
npm config set registry https://registry.npmjs.org

# Retry with increased timeout
npm install --timeout 60000
```

### Debug Mode

Enable debug logging for detailed troubleshooting:

```javascript
const dependencyManager = new BMADDependencyManager({
    debug: true,
    logLevel: 'debug'
});

// This will provide detailed logging of:
// - Dependency resolution steps
// - Version compatibility checks
// - Installation progress
// - Error details
```

## Best Practices

### 1. Version Management

- **Use Semantic Versioning**: Follow semver strictly for all modules
- **Pin Critical Dependencies**: Use exact versions for BMAD core dependencies
- **Regular Updates**: Keep dependencies updated with security patches

```yaml
dependencies:
  core:
    - module: "bmad:core"
      version: "2.0.0"  # Exact version for stability
      required: true
```

### 2. Dependency Design

- **Minimize Cross-Dependencies**: Keep inter-team dependencies minimal
- **Use Optional Dependencies**: Make peer dependencies optional when possible
- **Interface Segregation**: Design clean interfaces to reduce coupling

```yaml
peer_dependencies:
  - module: "@bmad-cybercommand/intel-team"
    version: ">=2.0.0"
    required: false  # Make optional
    condition: "threat_intel_enabled"
```

### 3. Installation Strategy

- **Validate Before Install**: Always run dependency validation first
- **Use Installation Phases**: Leverage phased installation for complex setups
- **Monitor Installation**: Implement progress monitoring for large installations

```javascript
// Best practice installation flow
async function installModule(moduleConfig) {
    // 1. Validate dependencies
    const validation = await dependencyManager.resolveDependencies(moduleConfig);
    if (!validation.success) {
        throw new Error('Dependency validation failed');
    }

    // 2. Check for conflicts
    const conflicts = validation.conflicts;
    if (conflicts.length > 0) {
        console.warn('Dependency conflicts detected:', conflicts);
    }

    // 3. Execute installation
    const result = await dependencyManager.executeInstallationPlan(
        validation.installationPlan,
        { continueOnFailure: false }
    );

    return result;
}
```

### 4. Error Handling

- **Graceful Degradation**: Handle missing optional dependencies gracefully
- **Detailed Error Messages**: Provide actionable error information
- **Rollback Capability**: Implement rollback for failed installations

### 5. Security Considerations

- **Audit Dependencies**: Enable security auditing for all packages
- **Validate Sources**: Only install from trusted package registries
- **Monitor Vulnerabilities**: Regularly check for security updates

```javascript
const packageManager = new BMADPackageRegistryManager({
    securityAuditEnabled: true,
    trustedPublishers: ['bmad-code-org', 'bmad-specialized-teams']
});
```

## API Reference

### BMADDependencyManager

#### Constructor
```javascript
new BMADDependencyManager(options)
```

**Options:**
- `bmadRoot` (string): Path to BMAD installation root
- `npmRegistry` (string): NPM registry URL
- `maxRetries` (number): Maximum retry attempts
- `timeout` (number): Operation timeout in milliseconds

#### Methods

##### `initialize()`
Initialize the dependency manager.

```javascript
await dependencyManager.initialize();
```

##### `resolveDependencies(moduleConfig, options)`
Resolve dependencies for a module.

**Parameters:**
- `moduleConfig` (Object): Module configuration
- `options` (Object): Resolution options

**Returns:** Promise resolving to resolution result

##### `executeInstallationPlan(plan, options)`
Execute an installation plan.

**Parameters:**
- `plan` (Object): Installation plan from dependency resolution
- `options` (Object): Execution options

**Returns:** Promise resolving to execution result

### BMADVersionChecker

#### Constructor
```javascript
new BMADVersionChecker()
```

#### Methods

##### `initialize(bmadRootPath)`
Initialize version checker with BMAD installation path.

```javascript
await versionChecker.initialize('./_bmad');
```

##### `validateModuleCompatibility(moduleName, moduleVersion, dependencies)`
Validate module compatibility.

**Parameters:**
- `moduleName` (string): Module name
- `moduleVersion` (string): Module version
- `dependencies` (Object): Module dependencies

**Returns:** Compatibility validation result

##### `generateCompatibilityReport()`
Generate comprehensive compatibility report.

**Returns:** Detailed compatibility report object

### BMADCircularDetector

#### Constructor
```javascript
new BMADCircularDetector()
```

#### Methods

##### `detectCircularDependencies(dependencyGraph)`
Detect circular dependencies in dependency graph.

**Parameters:**
- `dependencyGraph` (Map): Dependency graph to analyze

**Returns:** Detection result with cycles and resolution strategies

##### `validateInstallationPlan(installationPlan)`
Validate installation plan for circular dependencies.

**Parameters:**
- `installationPlan` (Object): Installation plan to validate

**Returns:** Validation result

### BMADPackageRegistryManager

#### Constructor
```javascript
new BMADPackageRegistryManager(options)
```

**Options:**
- `npmRegistry` (string): NPM registry URL
- `securityAuditEnabled` (boolean): Enable security auditing
- `strictCompatibility` (boolean): Enable strict compatibility checking

#### Methods

##### `initialize()`
Initialize package registry manager.

```javascript
await packageManager.initialize();
```

##### `verifyNodeCompatibility(packageInfo)`
Verify Node.js compatibility for a package.

**Parameters:**
- `packageInfo` (Object): Package information

**Returns:** Compatibility verification result

##### `installPackage(packageName, version, options)`
Install NPM package with compatibility verification.

**Parameters:**
- `packageName` (string): Package name to install
- `version` (string): Package version (optional)
- `options` (Object): Installation options

**Returns:** Installation result

##### `auditPackageSecurity(packageName, version)`
Perform security audit on a package.

**Parameters:**
- `packageName` (string): Package name
- `version` (string): Package version (optional)

**Returns:** Security audit result

---

## Support and Contributing

For support, issues, or contributions to the BMAD Dependency Management System:

- **Issues**: Report bugs or request features through the project issue tracker
- **Documentation**: Contribute to documentation improvements
- **Code**: Submit pull requests for bug fixes or enhancements

**Created by Winston (Architect) for Epic 3: Story 3.2**
**Integration-ready for Amelia's Installation Framework**