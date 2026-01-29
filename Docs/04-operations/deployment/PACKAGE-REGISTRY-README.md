# BMAD Package Registry System

**Epic 3: Story 3.3 - Package Registry System**
**Author:** BlackUnicorn.Tech
**Version:** 1.0.0

## Overview

The BMAD Package Registry System is a comprehensive solution for tracking, managing, and maintaining installed BMAD modules. It provides centralized package management with health monitoring, version tracking, backup/restore capabilities, and seamless integration with the existing installation framework and dependency management systems.

## Key Features

### 🗂️ **Comprehensive Package Tracking**
- **Installation Registry**: Complete record of all installed packages with metadata
- **Health Monitoring**: Real-time health checks with automated issue detection
- **Version Management**: Track current, available, and latest versions
- **Dependency Tracking**: Monitor dependencies and dependents across modules

### 🔄 **Update Management**
- **Update Detection**: Automatic checking for available updates
- **Version Compatibility**: Compatibility analysis before updates
- **Rollback Support**: Safe update process with automatic rollback on failure
- **Security Updates**: Identification and prioritization of security patches

### 🗑️ **Uninstall Capabilities**
- **Safe Uninstall**: Dependency-aware uninstallation process
- **Cleanup Operations**: Complete removal of files and configurations
- **Dependency Validation**: Prevents breaking uninstalls
- **Pre-uninstall Backups**: Automatic backup creation before removal

### 💾 **Backup & Restore**
- **Automatic Backups**: Scheduled and event-triggered backups
- **Manual Backups**: On-demand backup creation
- **Selective Restore**: Package-specific or full system restore
- **Backup Verification**: Integrity checking for all backups

### 🔗 **Integration Layer**
- **Installation Framework**: Seamless integration with Amelia's framework
- **Dependency Management**: Full integration with Winston's dependency resolver
- **Specialized Teams**: Native support for cybersec, intel, legal, and strategy teams
- **Logging Integration**: Comprehensive logging through Amelia's logger

## Architecture

### Core Components

```
📁 BMAD Package Registry System
├── 📄 package-registry-manager.ts      # Core registry management
├── 📄 package-registry-cli.js          # Command-line interface
├── 📄 package-registry-integration.js  # Integration adapter
└── 📄 package-registry-test-suite.js   # Comprehensive test suite
```

### Data Structure

```typescript
interface PackageRegistryEntry {
  // Core identification
  id: string;
  name: string;
  scope: string;
  version: string;
  fullName: string;
  type: 'specialized-team' | 'core-module' | 'extension' | 'workflow' | 'agent';

  // Installation metadata
  installationId: string;
  installedAt: Date;
  installedBy: string;
  installationPath: string;

  // Health and status
  status: 'installed' | 'installing' | 'failed' | 'corrupted' | 'outdated' | 'uninstalling';
  health: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  healthDetails?: HealthCheckResult;

  // Version tracking
  availableVersions: string[];
  latestVersion?: string;
  updateAvailable: boolean;

  // Dependencies
  dependencies: PackageDependency[];
  dependents: string[];

  // Configuration and files
  configuration: PackageConfiguration;
  installedFiles: string[];
  outputDirectories: string[];

  // Specialized teams specific
  agentsCount?: number;
  workflowsCount?: number;
  exposedWorkflows?: ExposedWorkflow[];
  permissions?: PackagePermissions;
}
```

## Installation

### Prerequisites

- Node.js >= 18.0.0
- NPM >= 8.0.0
- BMAD Core >= 2.0.0

### Setup

1. **Initialize the registry system:**
   ```bash
   node package-registry-cli.js init
   ```

2. **Start interactive mode:**
   ```bash
   node package-registry-cli.js interactive
   ```

## Usage

### Command Line Interface

#### Basic Operations

```bash
# Initialize registry
bmad-registry init

# List all packages
bmad-registry list

# Show package details
bmad-registry show <packageId>

# View registry statistics
bmad-registry stats
```

#### Health Management

```bash
# Run health check
bmad-registry health check

# Health check specific package
bmad-registry health check --package <packageId>

# Generate health report
bmad-registry health report --output health-report.json

# Auto-fix health issues
bmad-registry health fix --dry-run
```

#### Update Management

```bash
# Check for updates
bmad-registry update check

# Update specific package
bmad-registry update install <packageId> [version]

# Update all packages
bmad-registry update all
```

#### Backup Operations

```bash
# Create backup
bmad-registry backup create <packageId>

# List backups
bmad-registry backup list

# Restore from backup
bmad-registry backup restore <packageId> [backupId]

# Clean old backups
bmad-registry backup clean --days 30
```

#### Package Management

```bash
# Uninstall package
bmad-registry uninstall <packageId>

# Force uninstall (ignore dependencies)
bmad-registry uninstall <packageId> --force
```

### Programmatic API

#### Registry Manager

```javascript
const { PackageRegistryManager } = require('./package-registry-manager');

const registry = new PackageRegistryManager({
  bmadRoot: './_bmad',
  enableHealthChecks: true,
  enableAutoBackups: true
});

await registry.initialize();

// Register a package
const packageId = await registry.registerPackage(packageInfo);

// Perform health check
const healthResult = await registry.performHealthCheck(packageEntry);

// Check for updates
const updates = await registry.checkForUpdates();

// Create backup
const backupId = await registry.createPackageBackup(packageId, 'manual');
```

#### Integration Layer

```javascript
const PackageRegistryIntegration = require('./package-registry-integration');

const integration = new PackageRegistryIntegration({
  bmadRoot: './_bmad',
  autoRegisterInstalls: true
});

await integration.initialize();

// Install specialized team module
const result = await integration.installSpecializedTeamModule('cybersec-team');

// System health check
const healthStatus = await integration.performSystemHealthCheck();
```

## Integration Points

### With Amelia's Installation Framework

The registry system integrates seamlessly with Amelia's installation framework through hooks:

- **Pre-installation**: Validates dependencies and checks for conflicts
- **Post-installation**: Automatically registers installed packages
- **Installation monitoring**: Tracks installation progress and results

### With Winston's Dependency Management

Full integration with the dependency management system:

- **Dependency Resolution**: Validates dependencies before installation
- **Conflict Detection**: Identifies and resolves dependency conflicts
- **Installation Planning**: Creates optimized installation plans

### With Specialized Teams

Native support for BMAD specialized teams:

- **Cybersec Team**: Security-focused installation and monitoring
- **Intel Team**: Intelligence gathering and analysis capabilities
- **Legal Team**: Compliance and legal framework integration
- **Strategy Team**: Strategic planning and decision support

## Health Monitoring

The registry system provides comprehensive health monitoring:

### Health Check Categories

1. **Files Intact**: Verifies all package files are present and uncorrupted
2. **Dependencies Resolved**: Ensures all dependencies are satisfied
3. **Configuration Valid**: Validates package configuration integrity
4. **Permissions Correct**: Checks file and directory permissions
5. **Agents Accessible**: Validates agent accessibility (specialized teams)
6. **Workflows Accessible**: Validates workflow accessibility (specialized teams)
7. **Output Directories Writable**: Ensures output directories are writable

### Health Scoring

- **100-90**: Healthy (Green)
- **89-70**: Degraded (Yellow)
- **69-0**: Unhealthy (Red)

### Automated Issue Resolution

The system can automatically fix certain issues:

- File permission corrections
- Directory creation
- Configuration restoration
- Dependency satisfaction

## Backup System

### Backup Types

1. **Automatic**: Scheduled backups based on configuration
2. **Manual**: User-initiated backups
3. **Pre-update**: Created before package updates
4. **Pre-uninstall**: Created before package removal

### Backup Features

- **Incremental Backups**: Only backup changed files
- **Compression**: Efficient storage with compression
- **Verification**: Integrity checking for all backups
- **Retention Policies**: Automatic cleanup of old backups

## Security

### Data Protection

- **Encrypted Backups**: All backup data is encrypted at rest
- **Access Control**: Role-based access to registry operations
- **Audit Logging**: Complete audit trail of all operations
- **Signature Verification**: Package integrity verification

### Permissions

The registry system respects package-defined permissions:

- **Filesystem Access**: Controlled read/write access
- **Network Access**: Configurable network permissions
- **Shell Access**: Restricted command execution
- **Sensitive Data**: Protected handling of sensitive information

## Configuration

### Registry Configuration

```typescript
interface RegistryConfiguration {
  bmadRoot: string;                    // BMAD root directory
  registryPath: string;                // Registry storage path
  backupPath: string;                  // Backup storage path
  enableHealthChecks: boolean;         // Enable automated health checks
  healthCheckInterval: number;         // Health check frequency (ms)
  enableAutoBackups: boolean;          // Enable automatic backups
  maxBackups: number;                  // Maximum backups per package
  npmRegistry: string;                 // NPM registry URL
  enableVersionChecks: boolean;        // Enable version checking
  versionCheckInterval: number;        // Version check frequency (ms)
}
```

### Package Configuration

Each package maintains its own configuration:

```typescript
interface PackageConfiguration {
  outputFolder: string;                        // Package output directory
  securityFramework?: string;                  // Security framework (specialized teams)
  moduleCode: string;                          // Module identifier
  agentsPath: string;                          // Agents directory path
  workflowsPath: string;                       // Workflows directory path
  outputSubdirectories: Record<string, string>; // Subdirectory mappings
}
```

## Testing

### Test Suite

The system includes a comprehensive test suite:

```bash
# Run all tests
node package-registry-test-suite.js

# Run specific test categories
npm test -- --unit
npm test -- --integration
npm test -- --e2e
npm test -- --performance
```

### Test Categories

1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Cross-component integration testing
3. **End-to-End Tests**: Complete workflow testing
4. **Performance Tests**: Performance and scalability testing

## Monitoring & Observability

### Logging

All operations are logged through Amelia's logging framework:

- **Operation Tracking**: Unique operation IDs for tracing
- **Performance Metrics**: Timing and resource usage
- **Error Tracking**: Detailed error information with stack traces
- **Audit Trail**: Complete history of registry operations

### Metrics

The system provides detailed metrics:

- **Package Statistics**: Installation counts, health distribution
- **Performance Metrics**: Operation timing, resource usage
- **Health Metrics**: Health check results and trends
- **Backup Metrics**: Backup success rates and storage usage

## Troubleshooting

### Common Issues

#### Package Registration Fails
```bash
# Check dependencies
bmad-registry health check --package <packageId>

# Verify installation path
bmad-registry show <packageId>

# Check logs
tail -f ./_bmad/logs/bmad-install-*.log
```

#### Health Check Failures
```bash
# Run detailed health check
bmad-registry health check --package <packageId>

# Attempt auto-fix
bmad-registry health fix --package <packageId>

# Manual investigation
bmad-registry show <packageId>
```

#### Update Failures
```bash
# Check compatibility
bmad-registry update check

# Force update
bmad-registry update install <packageId> --force

# Restore from backup
bmad-registry backup restore <packageId>
```

### Log Locations

- **Registry Logs**: `./_bmad/logs/bmad-install-*.log`
- **Operation Logs**: `./_bmad/logs/bmad-registry-*.log`
- **Health Check Logs**: `./_bmad/logs/bmad-health-*.log`

## API Reference

### PackageRegistryManager

#### Methods

- `initialize()`: Initialize the registry system
- `registerPackage(packageInfo)`: Register a new package
- `uninstallPackage(packageId, options)`: Uninstall a package
- `performHealthCheck(packageEntry)`: Perform health check
- `checkForUpdates()`: Check for available updates
- `createPackageBackup(packageId, type)`: Create package backup
- `getRegistryStats()`: Get registry statistics
- `listPackages(filter)`: List packages with optional filtering

### PackageRegistryIntegration

#### Methods

- `initialize()`: Initialize integration layer
- `installSpecializedTeamModule(moduleName, options)`: Install specialized team module
- `updatePackage(packageId, targetVersion, options)`: Update package
- `uninstallPackage(packageId, options)`: Uninstall package
- `performSystemHealthCheck()`: System-wide health check

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Start development: `npm run dev`

### Code Style

- Use TypeScript for new components
- Follow existing naming conventions
- Include comprehensive tests
- Document all public APIs

## License

This project is part of the BMAD ecosystem and follows the same licensing terms.

## Support

For support and questions:

- **Issues**: Create an issue in the BMAD repository
- **Documentation**: Refer to this README and code comments
- **Integration**: Contact the BMAD development team

---

**Note**: This package registry system is designed specifically for BMAD modules and integrates tightly with the existing BMAD ecosystem. For general package management needs, consider using standard tools like NPM or Yarn.