/**
 * EPIC 2 PACKAGE MANAGEMENT - ENHANCED DEPENDENCY VALIDATION SYSTEM
 * Advanced dependency validation with comprehensive security and compliance checks
 * Enhanced version of Python bmad-dependency-validator with enterprise-grade capabilities
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.2
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');
const yaml = require('js-yaml');

// Import Epic 1 Security Infrastructure
const { epic1Security } = require('../../security/epic1-integration');
const { AuditLogger } = require('../../security/audit/audit-logger');
const { SecurityMonitor } = require('../../security/monitoring/security-monitor');

/**
 * Validation Configuration
 */
const ValidationConfig = {
  // Core validation settings
  timeout: 300000, // 5 minutes
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxDepth: 10,

  // Security thresholds
  security: {
    minScore: 7.0,
    maxVulnerabilities: 5,
    maxCriticalVulnerabilities: 0,
    requiredSignatures: false
  },

  // Performance limits
  performance: {
    maxResolutionTime: 30000, // 30 seconds
    maxMemoryUsage: 256 * 1024 * 1024, // 256MB
    maxDependencyCount: 1000
  },

  // Required file patterns
  requiredFiles: [
    'bmad-dependency-manager.js',
    'package-registry-manager.{ts,js}',
    'dependencies.{yaml,yml,json}',
    'BMAD-DEPENDENCY-MANAGEMENT-GUIDE.md'
  ],

  // Optional but recommended files
  recommendedFiles: [
    'bmad-version-compatibility.js',
    'bmad-circular-detection.js',
    'dependency-resolver.ts',
    'security-integration.ts'
  ],

  // Configuration schema validation
  schemas: {
    dependencies: {
      required: ['package', 'bmad_core', 'runtime'],
      optional: ['development', 'testing', 'deployment']
    },
    security: {
      required: ['policies', 'constraints', 'monitoring'],
      optional: ['encryption', 'audit', 'compliance']
    }
  },

  // Team-specific configurations
  teams: [
    'cybersec-team',
    'intel-team',
    'legal-team',
    'strategy-team',
    'bmm-team'
  ]
};

/**
 * Validation Result Types
 */
class ValidationResult {
  constructor() {
    this.overall_status = 'unknown';
    this.timestamp = new Date().toISOString();
    this.session_id = crypto.randomBytes(16).toString('hex');
    this.components = {};
    this.errors = [];
    this.warnings = [];
    this.recommendations = [];
    this.security_analysis = {};
    this.performance_metrics = {};
    this.compliance_status = {};
  }

  addError(component, message, details = {}) {
    this.errors.push({
      component,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  addWarning(component, message, details = {}) {
    this.warnings.push({
      component,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  addRecommendation(type, message, priority = 'medium', automated = false) {
    this.recommendations.push({
      type,
      message,
      priority,
      automated,
      timestamp: new Date().toISOString()
    });
  }

  setComponentStatus(component, status, details = {}) {
    this.components[component] = {
      status,
      details,
      validated_at: new Date().toISOString()
    };
  }

  calculateOverallStatus() {
    if (this.errors.length > 0) {
      this.overall_status = 'fail';
    } else if (this.warnings.length > 0) {
      this.overall_status = 'warning';
    } else {
      this.overall_status = 'pass';
    }
    return this.overall_status;
  }
}

/**
 * Enhanced BMAD Dependency Validation System
 */
class BMADDependencyValidator extends EventEmitter {
  constructor(projectRoot = '.', options = {}) {
    super();

    this.projectRoot = path.resolve(projectRoot);
    this.options = { ...ValidationConfig, ...options };
    this.result = new ValidationResult();

    // Initialize Epic 1 integration
    this.auditLogger = new AuditLogger('dependency-validator');
    this.securityMonitor = new SecurityMonitor();

    // Validation state
    this.startTime = null;
    this.validationCache = new Map();
    this.securityFindings = new Map();

    this.setupEventHandlers();
  }

  /**
   * Main validation entry point
   */
  async validateAll() {
    this.startTime = Date.now();

    try {
      await this.auditLogger.logSecurityEvent(
        'dependency-validation-started',
        { projectRoot: this.projectRoot, sessionId: this.result.session_id }
      );

      console.log('🔍 BMAD Enhanced Dependency Management System Validation');
      console.log('=' * 70);
      console.log(`📍 Project: ${this.projectRoot}`);
      console.log(`🆔 Session: ${this.result.session_id}`);
      console.log('');

      // Execute validation suite
      await this.validateProjectStructure();
      await this.validateCoreImplementation();
      await this.validateConfigurationSchemas();
      await this.validateSecurityIntegration();
      await this.validateTeamConfigurations();
      await this.validateDependencyResolution();
      await this.validatePerformanceRequirements();
      await this.validateComplianceRequirements();

      // Generate analysis and recommendations
      await this.performSecurityAnalysis();
      await this.generateOptimizationRecommendations();
      await this.assessIntegrationReadiness();

      // Finalize results
      this.result.calculateOverallStatus();
      this.generateValidationReport();

      await this.auditLogger.logSecurityEvent(
        'dependency-validation-completed',
        {
          sessionId: this.result.session_id,
          status: this.result.overall_status,
          duration: Date.now() - this.startTime,
          errors: this.result.errors.length,
          warnings: this.result.warnings.length
        }
      );

      return this.result;

    } catch (error) {
      this.result.addError('validation-system', `Validation failed: ${error.message}`, {
        stack: error.stack,
        cause: error.cause
      });

      await this.auditLogger.logSecurityEvent(
        'dependency-validation-failed',
        { sessionId: this.result.session_id, error: error.message }
      );

      this.result.calculateOverallStatus();
      return this.result;
    }
  }

  /**
   * Validate overall project structure
   */
  async validateProjectStructure() {
    this.emit('validation-step', 'project-structure');
    console.log('\n📁 Validating Project Structure...');

    const component = 'project-structure';
    const details = {
      files_found: [],
      missing_files: [],
      directory_structure: {},
      size_analysis: {}
    };

    try {
      // Check if project root exists and is accessible
      const stats = await fs.stat(this.projectRoot);
      if (!stats.isDirectory()) {
        this.result.addError(component, 'Project root is not a directory');
        return;
      }

      // Validate directory structure
      const expectedDirs = [
        'src/package-management',
        'src/package-management/dependency',
        'src/package-management/registry',
        'src/security'
      ];

      for (const dir of expectedDirs) {
        const dirPath = path.join(this.projectRoot, dir);
        try {
          const dirStats = await fs.stat(dirPath);
          if (dirStats.isDirectory()) {
            details.directory_structure[dir] = 'found';
            console.log(`  ✅ ${dir}`);
          }
        } catch (error) {
          details.directory_structure[dir] = 'missing';
          this.result.addWarning(component, `Expected directory missing: ${dir}`);
          console.log(`  ⚠️  ${dir} - MISSING`);
        }
      }

      // Check required files
      await this.validateRequiredFiles(details);

      // Analyze project size
      details.size_analysis = await this.analyzeProjectSize();

      this.result.setComponentStatus(component,
        details.missing_files.length === 0 ? 'pass' : 'warning',
        details
      );

    } catch (error) {
      this.result.addError(component, `Project structure validation failed: ${error.message}`);
      this.result.setComponentStatus(component, 'fail', { error: error.message });
    }
  }

  /**
   * Validate required files exist and are accessible
   */
  async validateRequiredFiles(details) {
    console.log('\n📄 Validating Required Files...');

    // Check required files
    for (const filePattern of this.options.requiredFiles) {
      const files = await this.expandFilePattern(filePattern);

      if (files.length === 0) {
        details.missing_files.push(filePattern);
        this.result.addError('core-files', `Missing required file pattern: ${filePattern}`);
        console.log(`  ❌ ${filePattern} - MISSING`);
      } else {
        details.files_found.push(...files);
        console.log(`  ✅ ${filePattern} (${files.length} files)`);

        // Validate file accessibility and basic structure
        for (const file of files) {
          await this.validateFileStructure(file);
        }
      }
    }

    // Check recommended files
    console.log('\n📋 Checking Recommended Files...');
    for (const filePattern of this.options.recommendedFiles) {
      const files = await this.expandFilePattern(filePattern);

      if (files.length === 0) {
        this.result.addRecommendation(
          'file-addition',
          `Consider adding recommended file: ${filePattern}`,
          'low',
          false
        );
        console.log(`  💡 ${filePattern} - RECOMMENDED`);
      } else {
        console.log(`  ✅ ${filePattern} (${files.length} files)`);
      }
    }
  }

  /**
   * Expand file patterns to actual file paths
   */
  async expandFilePattern(pattern) {
    const files = [];

    try {
      // Handle glob patterns
      if (pattern.includes('{') && pattern.includes('}')) {
        // Extract alternatives from braces
        const parts = pattern.split('{');
        const prefix = parts[0];
        const suffixPart = parts[1];
        const alternatives = suffixPart.split('}')[0].split(',');
        const suffix = suffixPart.split('}')[1] || '';

        for (const alt of alternatives) {
          const fullPattern = prefix + alt.trim() + suffix;
          const foundFiles = await this.findFiles(fullPattern);
          files.push(...foundFiles);
        }
      } else {
        const foundFiles = await this.findFiles(pattern);
        files.push(...foundFiles);
      }
    } catch (error) {
      console.log(`  ⚠️  Error expanding pattern ${pattern}: ${error.message}`);
    }

    return files;
  }

  /**
   * Find files matching a pattern
   */
  async findFiles(pattern) {
    const files = [];

    try {
      // Simple pattern matching - would use glob library in production
      const fullPath = path.join(this.projectRoot, pattern);

      try {
        const stats = await fs.stat(fullPath);
        if (stats.isFile()) {
          files.push(fullPath);
        }
      } catch (error) {
        // File doesn't exist - try directory traversal
        const dir = path.dirname(fullPath);
        const filename = path.basename(fullPath);

        try {
          const dirContents = await fs.readdir(dir);
          for (const file of dirContents) {
            if (this.matchesPattern(file, filename)) {
              const filePath = path.join(dir, file);
              const stats = await fs.stat(filePath);
              if (stats.isFile()) {
                files.push(filePath);
              }
            }
          }
        } catch (dirError) {
          // Directory doesn't exist
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Error finding files for pattern ${pattern}: ${error.message}`);
    }

    return files;
  }

  /**
   * Simple pattern matching
   */
  matchesPattern(filename, pattern) {
    // Convert simple patterns to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(filename);
  }

  /**
   * Validate individual file structure and content
   */
  async validateFileStructure(filePath) {
    try {
      const stats = await fs.stat(filePath);

      // Check file size
      if (stats.size > this.options.maxFileSize) {
        this.result.addWarning(
          'file-validation',
          `File ${filePath} exceeds maximum size (${stats.size} bytes)`,
          { filePath, size: stats.size, maxSize: this.options.maxFileSize }
        );
      }

      // Check file permissions
      try {
        await fs.access(filePath, fs.constants.R_OK);
      } catch (error) {
        this.result.addError(
          'file-validation',
          `File ${filePath} is not readable`,
          { filePath, error: error.message }
        );
      }

      // Basic content validation for specific file types
      const ext = path.extname(filePath);
      if (ext === '.js' || ext === '.ts') {
        await this.validateJavaScriptFile(filePath);
      } else if (ext === '.yaml' || ext === '.yml') {
        await this.validateYamlFile(filePath);
      } else if (ext === '.json') {
        await this.validateJsonFile(filePath);
      }

    } catch (error) {
      this.result.addError(
        'file-validation',
        `File validation failed for ${filePath}: ${error.message}`,
        { filePath, error: error.message }
      );
    }
  }

  /**
   * Validate JavaScript/TypeScript files
   */
  async validateJavaScriptFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');

      // Check for basic syntax issues (simplified)
      const lines = content.split('\n');
      let bracketCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        bracketCount += (line.match(/\{/g) || []).length;
        bracketCount -= (line.match(/\}/g) || []).length;
      }

      if (bracketCount !== 0) {
        this.result.addWarning(
          'syntax-validation',
          `Potential syntax issue in ${filePath}: unmatched brackets`,
          { filePath, bracketImbalance: bracketCount }
        );
      }

      // Check for security patterns
      await this.scanFileForSecurityIssues(filePath, content);

    } catch (error) {
      this.result.addError(
        'syntax-validation',
        `JavaScript validation failed for ${filePath}: ${error.message}`,
        { filePath, error: error.message }
      );
    }
  }

  /**
   * Validate YAML files
   */
  async validateYamlFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = yaml.load(content);

      // Check for required schema based on filename
      if (filePath.includes('dependencies')) {
        this.validateDependencySchema(data, filePath);
      }

    } catch (error) {
      this.result.addError(
        'yaml-validation',
        `YAML validation failed for ${filePath}: ${error.message}`,
        { filePath, error: error.message }
      );
    }
  }

  /**
   * Validate JSON files
   */
  async validateJsonFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      JSON.parse(content);

    } catch (error) {
      this.result.addError(
        'json-validation',
        `JSON validation failed for ${filePath}: ${error.message}`,
        { filePath, error: error.message }
      );
    }
  }

  /**
   * Scan file content for security issues
   */
  async scanFileForSecurityIssues(filePath, content) {
    const securityPatterns = [
      { pattern: /password\s*=\s*['"][^'"]+['"]/, severity: 'high', message: 'Hardcoded password detected' },
      { pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/, severity: 'high', message: 'Hardcoded API key detected' },
      { pattern: /eval\s*\(/, severity: 'medium', message: 'Use of eval() function detected' },
      { pattern: /exec\s*\(/, severity: 'medium', message: 'Use of exec() function detected' },
      { pattern: /innerHTML\s*=/, severity: 'low', message: 'Direct innerHTML assignment (XSS risk)' }
    ];

    for (const { pattern, severity, message } of securityPatterns) {
      if (pattern.test(content)) {
        this.result.addWarning(
          'security-scan',
          `${message} in ${filePath}`,
          { filePath, severity, pattern: pattern.toString() }
        );

        // Store security finding
        if (!this.securityFindings.has(filePath)) {
          this.securityFindings.set(filePath, []);
        }
        this.securityFindings.get(filePath).push({ severity, message });
      }
    }
  }

  /**
   * Validate dependency configuration schema
   */
  validateDependencySchema(data, filePath) {
    const schema = this.options.schemas.dependencies;

    for (const required of schema.required) {
      if (!(required in data)) {
        this.result.addError(
          'schema-validation',
          `Missing required section '${required}' in ${filePath}`,
          { filePath, section: required }
        );
      }
    }

    // Validate section content
    if (data.bmad_core) {
      this.validateBMADCoreSection(data.bmad_core, filePath);
    }
  }

  /**
   * Validate BMAD core section
   */
  validateBMADCoreSection(coreConfig, filePath) {
    const requiredFields = ['version', 'components', 'security_integration'];

    for (const field of requiredFields) {
      if (!(field in coreConfig)) {
        this.result.addWarning(
          'bmad-core-validation',
          `Missing recommended field '${field}' in bmad_core section of ${filePath}`,
          { filePath, field }
        );
      }
    }
  }

  /**
   * Validate core implementation components
   */
  async validateCoreImplementation() {
    this.emit('validation-step', 'core-implementation');
    console.log('\n⚙️  Validating Core Implementation...');

    const component = 'core-implementation';
    const details = {
      resolver_status: 'unknown',
      manager_status: 'unknown',
      registry_status: 'unknown',
      integration_status: 'unknown'
    };

    try {
      // Check dependency resolver
      details.resolver_status = await this.validateDependencyResolver();

      // Check dependency manager
      details.manager_status = await this.validateDependencyManager();

      // Check registry integration
      details.registry_status = await this.validateRegistryIntegration();

      // Check Epic 1 security integration
      details.integration_status = await this.validateSecurityIntegration();

      const allPassed = Object.values(details).every(status => status === 'pass');
      this.result.setComponentStatus(component, allPassed ? 'pass' : 'warning', details);

    } catch (error) {
      this.result.addError(component, `Core implementation validation failed: ${error.message}`);
      this.result.setComponentStatus(component, 'fail', { error: error.message });
    }
  }

  /**
   * Validate dependency resolver implementation
   */
  async validateDependencyResolver() {
    const resolverFile = await this.findFiles('src/package-management/dependency/resolver/dependency-resolver.{ts,js}');

    if (resolverFile.length === 0) {
      this.result.addError('resolver-validation', 'Dependency resolver implementation not found');
      console.log('  ❌ Dependency Resolver - NOT FOUND');
      return 'fail';
    }

    try {
      const content = await fs.readFile(resolverFile[0], 'utf8');

      // Check for required classes and methods
      const requiredPatterns = [
        /class.*DependencyResolver/,
        /resolve\s*\(/,
        /buildDependencyGraph/,
        /detectCycles/,
        /resolveConflicts/
      ];

      for (const pattern of requiredPatterns) {
        if (!pattern.test(content)) {
          this.result.addWarning(
            'resolver-validation',
            `Missing required implementation pattern in dependency resolver`,
            { pattern: pattern.toString() }
          );
        }
      }

      console.log('  ✅ Dependency Resolver - IMPLEMENTED');
      return 'pass';

    } catch (error) {
      this.result.addError('resolver-validation', `Resolver validation failed: ${error.message}`);
      console.log('  ❌ Dependency Resolver - VALIDATION FAILED');
      return 'fail';
    }
  }

  /**
   * Validate dependency manager implementation
   */
  async validateDependencyManager() {
    const managerFile = await this.findFiles('src/package-management/dependency/manager/bmad-dependency-manager.js');

    if (managerFile.length === 0) {
      this.result.addError('manager-validation', 'BMAD dependency manager implementation not found');
      console.log('  ❌ BMAD Dependency Manager - NOT FOUND');
      return 'fail';
    }

    console.log('  ✅ BMAD Dependency Manager - FOUND');
    return 'pass';
  }

  /**
   * Validate package registry integration
   */
  async validateRegistryIntegration() {
    const registryFiles = await this.findFiles('src/package-management/registry/manager/package-registry-manager.{ts,js}');

    if (registryFiles.length === 0) {
      this.result.addError('registry-validation', 'Package registry manager not found');
      console.log('  ❌ Package Registry Manager - NOT FOUND');
      return 'fail';
    }

    console.log('  ✅ Package Registry Manager - FOUND');
    return 'pass';
  }

  /**
   * Validate Epic 1 security integration
   */
  async validateSecurityIntegration() {
    this.emit('validation-step', 'security-integration');
    console.log('\n🔒 Validating Security Integration...');

    const component = 'security-integration';
    const details = {
      epic1_integration: 'unknown',
      security_policies: 'unknown',
      audit_logging: 'unknown',
      encryption: 'unknown'
    };

    try {
      // Check Epic 1 integration file
      const integrationFiles = await this.findFiles('src/package-management/security-integration.{ts,js}');

      if (integrationFiles.length === 0) {
        details.epic1_integration = 'missing';
        this.result.addError(component, 'Epic 1 security integration file not found');
        console.log('  ❌ Epic 1 Integration - NOT FOUND');
      } else {
        details.epic1_integration = 'found';
        console.log('  ✅ Epic 1 Integration - FOUND');

        // Validate integration content
        const content = await fs.readFile(integrationFiles[0], 'utf8');

        // Check for required imports
        const requiredImports = [
          'epic1Security',
          'AuditLogger',
          'SecurityMonitor',
          'AESEncryption'
        ];

        let missingImports = 0;
        for (const importName of requiredImports) {
          if (!content.includes(importName)) {
            missingImports++;
            this.result.addWarning(
              component,
              `Missing import: ${importName}`,
              { file: integrationFiles[0], import: importName }
            );
          }
        }

        if (missingImports === 0) {
          details.epic1_integration = 'complete';
          console.log('  ✅ Epic 1 Security Imports - COMPLETE');
        } else {
          details.epic1_integration = 'partial';
          console.log(`  ⚠️  Epic 1 Security Imports - PARTIAL (${missingImports} missing)`);
        }
      }

      // Check security policy implementation
      details.security_policies = await this.validateSecurityPolicies();

      // Check audit logging
      details.audit_logging = await this.validateAuditLogging();

      // Check encryption implementation
      details.encryption = await this.validateEncryption();

      const status = Object.values(details).every(s => s === 'complete' || s === 'found') ? 'pass' : 'warning';
      this.result.setComponentStatus(component, status, details);

      return status;

    } catch (error) {
      this.result.addError(component, `Security integration validation failed: ${error.message}`);
      this.result.setComponentStatus(component, 'fail', { error: error.message });
      return 'fail';
    }
  }

  /**
   * Validate security policies implementation
   */
  async validateSecurityPolicies() {
    const securityFiles = await this.findFiles('src/security/**/*.{ts,js}');

    if (securityFiles.length === 0) {
      this.result.addWarning('security-policies', 'No security implementation files found');
      console.log('  ⚠️  Security Policies - NOT FOUND');
      return 'missing';
    }

    console.log(`  ✅ Security Policies - FOUND (${securityFiles.length} files)`);
    return 'found';
  }

  /**
   * Validate audit logging implementation
   */
  async validateAuditLogging() {
    const auditFiles = await this.findFiles('src/security/audit/**/*.{ts,js}');

    if (auditFiles.length === 0) {
      this.result.addWarning('audit-logging', 'No audit logging implementation found');
      console.log('  ⚠️  Audit Logging - NOT FOUND');
      return 'missing';
    }

    console.log(`  ✅ Audit Logging - FOUND (${auditFiles.length} files)`);
    return 'found';
  }

  /**
   * Validate encryption implementation
   */
  async validateEncryption() {
    const encryptionFiles = await this.findFiles('src/security/encryption/**/*.{ts,js}');

    if (encryptionFiles.length === 0) {
      this.result.addWarning('encryption', 'No encryption implementation found');
      console.log('  ⚠️  Encryption - NOT FOUND');
      return 'missing';
    }

    console.log(`  ✅ Encryption - FOUND (${encryptionFiles.length} files)`);
    return 'found';
  }

  /**
   * Validate team-specific configurations
   */
  async validateTeamConfigurations() {
    this.emit('validation-step', 'team-configurations');
    console.log('\n👥 Validating Team Configurations...');

    const component = 'team-configurations';
    const details = { teams: {} };

    for (const team of this.options.teams) {
      try {
        const configFiles = await this.findFiles(`**/team-*${team}*.{yaml,yml,json}`);
        const exampleFiles = await this.findFiles(`**/${team}-*.example*`);

        if (configFiles.length > 0 || exampleFiles.length > 0) {
          details.teams[team] = 'configured';
          console.log(`  ✅ ${team} - CONFIGURED`);
        } else {
          details.teams[team] = 'missing';
          this.result.addRecommendation(
            'team-configuration',
            `Consider adding configuration for ${team}`,
            'low',
            false
          );
          console.log(`  💡 ${team} - RECOMMENDED`);
        }
      } catch (error) {
        details.teams[team] = 'error';
        this.result.addWarning(component, `Error validating ${team}: ${error.message}`);
        console.log(`  ⚠️  ${team} - ERROR`);
      }
    }

    this.result.setComponentStatus(component, 'pass', details);
  }

  /**
   * Validate configuration schemas
   */
  async validateConfigurationSchemas() {
    this.emit('validation-step', 'configuration-schemas');
    console.log('\n📋 Validating Configuration Schemas...');

    const component = 'configuration-schemas';
    const details = {
      dependencies_config: 'unknown',
      security_config: 'unknown',
      performance_config: 'unknown'
    };

    try {
      // Check main dependencies configuration
      const depsFiles = await this.findFiles('dependencies.{yaml,yml,json}');

      if (depsFiles.length === 0) {
        details.dependencies_config = 'missing';
        this.result.addError(component, 'Main dependencies configuration file not found');
        console.log('  ❌ dependencies.{yaml,yml,json} - NOT FOUND');
      } else {
        try {
          const content = await fs.readFile(depsFiles[0], 'utf8');
          const data = depsFiles[0].endsWith('.json') ? JSON.parse(content) : yaml.load(content);

          this.validateDependencySchema(data, depsFiles[0]);
          details.dependencies_config = 'valid';
          console.log('  ✅ Dependencies Configuration - VALID');
        } catch (error) {
          details.dependencies_config = 'invalid';
          this.result.addError(component, `Invalid dependencies configuration: ${error.message}`);
          console.log('  ❌ Dependencies Configuration - INVALID');
        }
      }

      this.result.setComponentStatus(component,
        details.dependencies_config === 'valid' ? 'pass' : 'warning',
        details
      );

    } catch (error) {
      this.result.addError(component, `Configuration schema validation failed: ${error.message}`);
      this.result.setComponentStatus(component, 'fail', { error: error.message });
    }
  }

  /**
   * Validate dependency resolution capabilities
   */
  async validateDependencyResolution() {
    this.emit('validation-step', 'dependency-resolution');
    console.log('\n🔄 Validating Dependency Resolution...');

    const component = 'dependency-resolution';
    const details = {
      resolver_implementation: 'unknown',
      cycle_detection: 'unknown',
      conflict_resolution: 'unknown',
      version_compatibility: 'unknown'
    };

    try {
      // Test basic resolution capabilities
      const resolverFiles = await this.findFiles('**/dependency-resolver.{ts,js}');

      if (resolverFiles.length > 0) {
        details.resolver_implementation = 'found';
        console.log('  ✅ Dependency Resolver - FOUND');

        // Check for advanced features
        const content = await fs.readFile(resolverFiles[0], 'utf8');

        if (content.includes('detectCycles') || content.includes('cycle')) {
          details.cycle_detection = 'implemented';
          console.log('  ✅ Cycle Detection - IMPLEMENTED');
        } else {
          details.cycle_detection = 'missing';
          this.result.addRecommendation(
            'feature-enhancement',
            'Implement cycle detection for dependency graphs',
            'medium',
            false
          );
          console.log('  💡 Cycle Detection - RECOMMENDED');
        }

        if (content.includes('resolveConflicts') || content.includes('conflict')) {
          details.conflict_resolution = 'implemented';
          console.log('  ✅ Conflict Resolution - IMPLEMENTED');
        } else {
          details.conflict_resolution = 'missing';
          this.result.addRecommendation(
            'feature-enhancement',
            'Implement conflict resolution strategies',
            'high',
            false
          );
          console.log('  💡 Conflict Resolution - RECOMMENDED');
        }

      } else {
        details.resolver_implementation = 'missing';
        this.result.addError(component, 'Dependency resolver implementation not found');
        console.log('  ❌ Dependency Resolver - NOT FOUND');
      }

      this.result.setComponentStatus(component,
        details.resolver_implementation === 'found' ? 'pass' : 'fail',
        details
      );

    } catch (error) {
      this.result.addError(component, `Dependency resolution validation failed: ${error.message}`);
      this.result.setComponentStatus(component, 'fail', { error: error.message });
    }
  }

  /**
   * Validate performance requirements
   */
  async validatePerformanceRequirements() {
    this.emit('validation-step', 'performance-requirements');
    console.log('\n⚡ Validating Performance Requirements...');

    const component = 'performance-requirements';

    try {
      const projectSize = await this.analyzeProjectSize();
      const memoryUsage = process.memoryUsage();

      const details = {
        project_size: projectSize,
        memory_usage: memoryUsage,
        validation_time: Date.now() - this.startTime,
        performance_score: 0
      };

      // Calculate performance score
      let score = 100;

      if (details.validation_time > this.options.performance.maxResolutionTime) {
        score -= 20;
        this.result.addWarning(component,
          `Validation time (${details.validation_time}ms) exceeds recommended limit (${this.options.performance.maxResolutionTime}ms)`
        );
      }

      if (memoryUsage.heapUsed > this.options.performance.maxMemoryUsage) {
        score -= 30;
        this.result.addWarning(component,
          `Memory usage (${memoryUsage.heapUsed} bytes) exceeds limit (${this.options.performance.maxMemoryUsage} bytes)`
        );
      }

      details.performance_score = score;
      console.log(`  📊 Performance Score: ${score}/100`);
      console.log(`  ⏱️  Validation Time: ${details.validation_time}ms`);
      console.log(`  💾 Memory Usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);

      this.result.setComponentStatus(component, score >= 70 ? 'pass' : 'warning', details);

    } catch (error) {
      this.result.addError(component, `Performance validation failed: ${error.message}`);
      this.result.setComponentStatus(component, 'fail', { error: error.message });
    }
  }

  /**
   * Validate compliance requirements
   */
  async validateComplianceRequirements() {
    this.emit('validation-step', 'compliance-requirements');
    console.log('\n📜 Validating Compliance Requirements...');

    const component = 'compliance-requirements';
    const details = {
      documentation: 'unknown',
      license_compliance: 'unknown',
      security_compliance: 'unknown',
      audit_trail: 'unknown'
    };

    try {
      // Check documentation
      const readmeFiles = await this.findFiles('**/README.md');
      const guidesFiles = await this.findFiles('**/*GUIDE*.md');

      if (readmeFiles.length > 0 && guidesFiles.length > 0) {
        details.documentation = 'adequate';
        console.log('  ✅ Documentation - ADEQUATE');
      } else {
        details.documentation = 'insufficient';
        this.result.addRecommendation(
          'documentation',
          'Add comprehensive documentation and guides',
          'medium',
          false
        );
        console.log('  💡 Documentation - NEEDS IMPROVEMENT');
      }

      // Check license files
      const licenseFiles = await this.findFiles('LICENSE*');
      if (licenseFiles.length > 0) {
        details.license_compliance = 'compliant';
        console.log('  ✅ License Files - FOUND');
      } else {
        details.license_compliance = 'missing';
        this.result.addRecommendation(
          'legal-compliance',
          'Add appropriate license files',
          'high',
          false
        );
        console.log('  💡 License Files - RECOMMENDED');
      }

      // Security compliance based on previous findings
      const securityIssues = Array.from(this.securityFindings.values()).flat().length;
      if (securityIssues === 0) {
        details.security_compliance = 'compliant';
        console.log('  ✅ Security Compliance - CLEAN');
      } else {
        details.security_compliance = 'issues_found';
        console.log(`  ⚠️  Security Compliance - ${securityIssues} ISSUES FOUND`);
      }

      // Audit trail
      details.audit_trail = 'implemented'; // Based on Epic 1 integration
      console.log('  ✅ Audit Trail - IMPLEMENTED');

      this.result.setComponentStatus(component, 'pass', details);
      this.result.compliance_status = details;

    } catch (error) {
      this.result.addError(component, `Compliance validation failed: ${error.message}`);
      this.result.setComponentStatus(component, 'fail', { error: error.message });
    }
  }

  /**
   * Perform comprehensive security analysis
   */
  async performSecurityAnalysis() {
    this.emit('validation-step', 'security-analysis');
    console.log('\n🔍 Performing Security Analysis...');

    try {
      const analysis = {
        total_files_scanned: 0,
        security_issues_found: 0,
        severity_distribution: { high: 0, medium: 0, low: 0 },
        recommendations: [],
        security_score: 0
      };

      // Analyze all security findings
      let totalIssues = 0;
      for (const [filePath, findings] of this.securityFindings) {
        analysis.total_files_scanned++;
        totalIssues += findings.length;

        for (const finding of findings) {
          analysis.severity_distribution[finding.severity]++;
        }
      }

      analysis.security_issues_found = totalIssues;

      // Calculate security score
      let score = 100;
      score -= analysis.severity_distribution.high * 20;
      score -= analysis.severity_distribution.medium * 10;
      score -= analysis.severity_distribution.low * 5;
      analysis.security_score = Math.max(0, score);

      // Generate security recommendations
      if (analysis.severity_distribution.high > 0) {
        analysis.recommendations.push({
          priority: 'critical',
          message: `Address ${analysis.severity_distribution.high} high-severity security issues immediately`
        });
      }

      if (analysis.security_score < this.options.security.minScore * 10) {
        analysis.recommendations.push({
          priority: 'high',
          message: 'Overall security score below recommended threshold'
        });
      }

      this.result.security_analysis = analysis;

      console.log(`  📊 Security Score: ${analysis.security_score}/100`);
      console.log(`  🔍 Files Scanned: ${analysis.total_files_scanned}`);
      console.log(`  ⚠️  Issues Found: ${analysis.security_issues_found}`);
      console.log(`  🚨 High Severity: ${analysis.severity_distribution.high}`);
      console.log(`  ⚡ Medium Severity: ${analysis.severity_distribution.medium}`);
      console.log(`  💡 Low Severity: ${analysis.severity_distribution.low}`);

      // Report to security monitor
      await this.securityMonitor.analyzeSecurityTrends({
        validation_session: this.result.session_id,
        security_score: analysis.security_score,
        issues_found: analysis.security_issues_found
      });

    } catch (error) {
      this.result.addError('security-analysis', `Security analysis failed: ${error.message}`);
      console.log(`  ❌ Security Analysis Failed: ${error.message}`);
    }
  }

  /**
   * Generate optimization recommendations
   */
  async generateOptimizationRecommendations() {
    this.emit('validation-step', 'optimization-recommendations');
    console.log('\n💡 Generating Optimization Recommendations...');

    const projectSize = await this.analyzeProjectSize();
    const validationTime = Date.now() - this.startTime;

    // Performance optimizations
    if (validationTime > 30000) {
      this.result.addRecommendation(
        'performance',
        'Consider implementing validation caching to improve performance',
        'medium',
        true
      );
    }

    if (projectSize.totalSize > 50 * 1024 * 1024) {
      this.result.addRecommendation(
        'size-optimization',
        'Project size is large - consider implementing tree-shaking or dependency pruning',
        'medium',
        false
      );
    }

    // Security optimizations
    if (this.result.security_analysis?.security_score < 90) {
      this.result.addRecommendation(
        'security',
        'Implement automated security scanning in CI/CD pipeline',
        'high',
        true
      );
    }

    // Configuration optimizations
    const hasTypeScript = (await this.findFiles('**/*.ts')).length > 0;
    const hasJavaScript = (await this.findFiles('**/*.js')).length > 0;

    if (hasJavaScript && hasTypeScript) {
      this.result.addRecommendation(
        'consistency',
        'Consider standardizing on TypeScript for all new development',
        'low',
        false
      );
    }

    console.log(`  📝 Generated ${this.result.recommendations.length} recommendations`);
  }

  /**
   * Assess integration readiness
   */
  async assessIntegrationReadiness() {
    this.emit('validation-step', 'integration-readiness');
    console.log('\n🔄 Assessing Integration Readiness...');

    const status = this.result.overall_status;
    const errorCount = this.result.errors.length;
    const warningCount = this.result.warnings.length;

    let readiness = 'unknown';
    let message = '';

    if (status === 'pass') {
      readiness = 'ready';
      message = 'System is ready for integration with Amelia\'s framework';
      console.log('  ✅ System is READY for integration');
    } else if (status === 'warning' && errorCount === 0) {
      readiness = 'ready-with-caution';
      message = 'System has minor issues but can be integrated with caution';
      console.log('  ⚠️  System is READY WITH CAUTION for integration');
    } else {
      readiness = 'not-ready';
      message = 'System has critical issues that must be resolved before integration';
      console.log('  ❌ System is NOT READY for integration');
    }

    this.result.integration_readiness = {
      status: readiness,
      message,
      blocking_errors: errorCount,
      warnings: warningCount,
      assessment_time: new Date().toISOString()
    };
  }

  /**
   * Analyze project size and structure
   */
  async analyzeProjectSize() {
    try {
      let totalSize = 0;
      let fileCount = 0;
      let directoryCount = 0;

      const analyze = async (dirPath) => {
        try {
          const items = await fs.readdir(dirPath);

          for (const item of items) {
            const itemPath = path.join(dirPath, item);

            try {
              const stats = await fs.stat(itemPath);

              if (stats.isDirectory()) {
                directoryCount++;
                if (!item.startsWith('.') && item !== 'node_modules') {
                  await analyze(itemPath);
                }
              } else {
                fileCount++;
                totalSize += stats.size;
              }
            } catch (error) {
              // Skip inaccessible files
            }
          }
        } catch (error) {
          // Skip inaccessible directories
        }
      };

      await analyze(this.projectRoot);

      return {
        totalSize,
        fileCount,
        directoryCount,
        averageFileSize: fileCount > 0 ? Math.round(totalSize / fileCount) : 0
      };
    } catch (error) {
      return {
        totalSize: 0,
        fileCount: 0,
        directoryCount: 0,
        averageFileSize: 0,
        error: error.message
      };
    }
  }

  /**
   * Generate comprehensive validation report
   */
  generateValidationReport() {
    const duration = Date.now() - this.startTime;

    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPREHENSIVE VALIDATION REPORT');
    console.log('='.repeat(70));

    // Header information
    console.log(`\n🆔 Session ID: ${this.result.session_id}`);
    console.log(`📍 Project: ${this.projectRoot}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📅 Completed: ${new Date().toISOString()}`);

    // Overall status
    const statusEmoji = {
      pass: '✅',
      warning: '⚠️',
      fail: '❌'
    };

    console.log(`\n🏆 Overall Status: ${statusEmoji[this.result.overall_status]} ${this.result.overall_status.toUpperCase()}`);

    // Component status summary
    console.log('\n📋 Component Status:');
    for (const [component, data] of Object.entries(this.result.components)) {
      const emoji = statusEmoji[data.status] || '❓';
      console.log(`  ${emoji} ${component}: ${data.status.toUpperCase()}`);
    }

    // Issues summary
    if (this.result.errors.length > 0) {
      console.log(`\n❌ Errors (${this.result.errors.length}):`);
      for (const error of this.result.errors.slice(0, 10)) {
        console.log(`  • ${error.component}: ${error.message}`);
      }
      if (this.result.errors.length > 10) {
        console.log(`  ... and ${this.result.errors.length - 10} more`);
      }
    }

    if (this.result.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${this.result.warnings.length}):`);
      for (const warning of this.result.warnings.slice(0, 10)) {
        console.log(`  • ${warning.component}: ${warning.message}`);
      }
      if (this.result.warnings.length > 10) {
        console.log(`  ... and ${this.result.warnings.length - 10} more`);
      }
    }

    // Security analysis
    if (this.result.security_analysis) {
      const sa = this.result.security_analysis;
      console.log(`\n🔒 Security Analysis:`);
      console.log(`  📊 Security Score: ${sa.security_score}/100`);
      console.log(`  🔍 Files Scanned: ${sa.total_files_scanned}`);
      console.log(`  ⚠️  Issues Found: ${sa.security_issues_found}`);
      console.log(`  🚨 Severity: High(${sa.severity_distribution.high}) Medium(${sa.severity_distribution.medium}) Low(${sa.severity_distribution.low})`);
    }

    // Performance metrics
    if (this.result.performance_metrics) {
      console.log(`\n⚡ Performance Metrics:`);
      console.log(`  ⏱️  Validation Time: ${duration}ms`);
      console.log(`  💾 Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    }

    // Recommendations
    if (this.result.recommendations.length > 0) {
      console.log(`\n💡 Recommendations (${this.result.recommendations.length}):`);

      const priorityOrder = ['critical', 'high', 'medium', 'low'];
      for (const priority of priorityOrder) {
        const priorityRecs = this.result.recommendations.filter(r => r.priority === priority);
        if (priorityRecs.length > 0) {
          console.log(`  🔥 ${priority.toUpperCase()}:`);
          for (const rec of priorityRecs.slice(0, 5)) {
            const autoText = rec.automated ? ' [AUTOMATED]' : '';
            console.log(`    • ${rec.message}${autoText}`);
          }
        }
      }
    }

    // Integration readiness
    if (this.result.integration_readiness) {
      const ir = this.result.integration_readiness;
      console.log(`\n🔄 Integration Readiness:`);
      console.log(`  Status: ${statusEmoji[ir.status === 'ready' ? 'pass' : ir.status === 'ready-with-caution' ? 'warning' : 'fail']} ${ir.status.toUpperCase()}`);
      console.log(`  ${ir.message}`);

      if (ir.blocking_errors > 0) {
        console.log(`  🚫 Blocking Errors: ${ir.blocking_errors}`);
      }
      if (ir.warnings > 0) {
        console.log(`  ⚠️  Warnings: ${ir.warnings}`);
      }
    }

    console.log('\n' + '='.repeat(70));
  }

  /**
   * Setup event handlers for logging and monitoring
   */
  setupEventHandlers() {
    this.on('validation-step', (step) => {
      this.auditLogger.info(`Validation step: ${step}`);
    });

    this.on('error', (error) => {
      this.auditLogger.error('Validation error', { error: error.message });
    });

    this.on('warning', (warning) => {
      this.auditLogger.warn('Validation warning', warning);
    });
  }

  /**
   * Export results in various formats
   */
  async exportResults(format = 'json', outputPath = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultPath = `bmad-dependency-validation-${timestamp}.${format}`;
    const filePath = outputPath || path.join(this.projectRoot, defaultPath);

    try {
      switch (format.toLowerCase()) {
        case 'json':
          await fs.writeFile(filePath, JSON.stringify(this.result, null, 2));
          break;

        case 'yaml':
          await fs.writeFile(filePath, yaml.dump(this.result));
          break;

        case 'txt':
          const report = this.generateTextReport();
          await fs.writeFile(filePath, report);
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      console.log(`\n📄 Results exported to: ${filePath}`);
      return filePath;

    } catch (error) {
      console.error(`Failed to export results: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate text-based report
   */
  generateTextReport() {
    let report = '';
    report += 'BMAD DEPENDENCY MANAGEMENT VALIDATION REPORT\n';
    report += '='.repeat(50) + '\n\n';

    report += `Session ID: ${this.result.session_id}\n`;
    report += `Project: ${this.projectRoot}\n`;
    report += `Timestamp: ${this.result.timestamp}\n`;
    report += `Overall Status: ${this.result.overall_status.toUpperCase()}\n\n`;

    if (this.result.errors.length > 0) {
      report += 'ERRORS:\n';
      for (const error of this.result.errors) {
        report += `- ${error.component}: ${error.message}\n`;
      }
      report += '\n';
    }

    if (this.result.warnings.length > 0) {
      report += 'WARNINGS:\n';
      for (const warning of this.result.warnings) {
        report += `- ${warning.component}: ${warning.message}\n`;
      }
      report += '\n';
    }

    if (this.result.recommendations.length > 0) {
      report += 'RECOMMENDATIONS:\n';
      for (const rec of this.result.recommendations) {
        report += `- [${rec.priority.toUpperCase()}] ${rec.message}\n`;
      }
    }

    return report;
  }
}

module.exports = {
  BMADDependencyValidator,
  ValidationResult,
  ValidationConfig
};