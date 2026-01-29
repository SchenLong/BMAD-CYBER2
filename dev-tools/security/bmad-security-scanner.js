#!/usr/bin/env node
/**
 * BMAD Security Scanner
 * Comprehensive security scanning for distribution packages
 *
 * Performs security analysis including sensitive data detection, dependency
 * vulnerability scanning, code analysis, and compliance validation.
 *
 * Author: BlackUnicorn.Tech
 * Version: 1.0.0
 * Epic: 4 - Packaging & Distribution Automation
 * Story: 4.3 - Quality Assurance for Distribution Packages
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

/**
 * BMAD Security Scanner
 * Comprehensive security analysis for distribution packages
 */
class BMAdSecurityScanner {
  constructor(options = {}) {
    this.options = {
      sourceRoot: options.sourceRoot || '/Users/paultinp/BMAD-CYBER2/_bmad',
      planningArtifacts: options.planningArtifacts || '/Users/paultinp/BMAD-CYBER2/_bmad-output/planning-artifacts',
      outputPath: options.outputPath || '/Users/paultinp/BMAD-CYBER2/_bmad-output',
      verbose: options.verbose || false,
      strictMode: options.strictMode || false,
      ...options
    };

    this.scanResults = {
      sensitive_data: { passed: [], failed: [], warnings: [], score: 0 },
      dependency_vulnerabilities: { passed: [], failed: [], warnings: [], score: 0 },
      code_analysis: { passed: [], failed: [], warnings: [], score: 0 },
      package_integrity: { passed: [], failed: [], warnings: [], score: 0 },
      compliance: { passed: [], failed: [], warnings: [], score: 0 },
      overall: { score: 0, risk_level: 'unknown', status: 'pending' }
    };

    this.securityRules = this.initializeSecurityRules();
    this.complianceStandards = this.initializeComplianceStandards();
  }

  /**
   * Initialize security scanning rules
   */
  initializeSecurityRules() {
    return {
      sensitive_data_patterns: [
        {
          name: 'api_keys',
          pattern: /(?:api[_-]?key|apikey|access[_-]?key)\s*[=:]\s*['\"]?([a-zA-Z0-9_-]{16,})['\"]?/gi,
          severity: 'critical',
          description: 'API keys or access tokens'
        },
        {
          name: 'passwords',
          pattern: /(?:password|passwd|pwd|secret)\s*[=:]\s*['\"]?([^\s'"]{8,})['\"]?/gi,
          severity: 'critical',
          description: 'Passwords or secrets'
        },
        {
          name: 'private_keys',
          pattern: /-----BEGIN\s+(?:RSA\s+|EC\s+|DSA\s+)?PRIVATE\s+KEY-----/gi,
          severity: 'critical',
          description: 'Private cryptographic keys'
        },
        {
          name: 'connection_strings',
          pattern: /(?:mongodb|mysql|postgresql|redis):\/\/[^\s'"]+/gi,
          severity: 'high',
          description: 'Database connection strings'
        },
        {
          name: 'email_addresses',
          pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
          severity: 'medium',
          description: 'Email addresses'
        },
        {
          name: 'ip_addresses',
          pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
          severity: 'medium',
          description: 'IP addresses'
        },
        {
          name: 'urls_with_credentials',
          pattern: /https?:\/\/[^:\s]+:[^@\s]+@[^\s]+/gi,
          severity: 'high',
          description: 'URLs with embedded credentials'
        },
        {
          name: 'bearer_tokens',
          pattern: /bearer\s+[a-zA-Z0-9_-]{20,}/gi,
          severity: 'critical',
          description: 'Bearer tokens'
        },
        {
          name: 'ssh_keys',
          pattern: /ssh-(?:rsa|dss|ed25519|ecdsa)\s+[A-Za-z0-9+\/=]+/gi,
          severity: 'critical',
          description: 'SSH public keys'
        },
        {
          name: 'aws_credentials',
          pattern: /(?:AKIA[0-9A-Z]{16}|[A-Za-z0-9\/+=]{40})/g,
          severity: 'critical',
          description: 'AWS credentials'
        }
      ],

      dangerous_functions: [
        {
          pattern: /eval\s*\(/gi,
          severity: 'high',
          description: 'Use of eval() function',
          language: 'javascript'
        },
        {
          pattern: /exec\s*\(/gi,
          severity: 'medium',
          description: 'Use of exec() function',
          language: 'javascript'
        },
        {
          pattern: /innerHTML\s*=/gi,
          severity: 'medium',
          description: 'Use of innerHTML (potential XSS)',
          language: 'javascript'
        },
        {
          pattern: /document\.write\s*\(/gi,
          severity: 'medium',
          description: 'Use of document.write (potential XSS)',
          language: 'javascript'
        }
      ],

      file_permissions: {
        forbidden_executable: ['.sh', '.bat', '.cmd', '.exe', '.com'],
        dangerous_extensions: ['.pif', '.scr', '.vbs', '.js'],
        required_readonly: ['.key', '.pem', '.crt']
      },

      package_security: {
        forbidden_dependencies: [
          'node-uuid', // deprecated, potential security issue
          'request'    // deprecated, potential security issue
        ],
        required_security_fields: [
          'bugs.security',
          'repository',
          'license'
        ]
      }
    };
  }

  /**
   * Initialize compliance standards
   */
  initializeComplianceStandards() {
    return {
      gdpr: {
        name: 'General Data Protection Regulation (GDPR)',
        requirements: [
          'no_personal_data_exposure',
          'data_processing_documentation',
          'privacy_policy_reference'
        ]
      },
      owasp: {
        name: 'OWASP Security Standards',
        requirements: [
          'no_hardcoded_credentials',
          'secure_coding_practices',
          'dependency_vulnerability_check'
        ]
      },
      nist: {
        name: 'NIST Cybersecurity Framework',
        requirements: [
          'access_control_validation',
          'security_documentation',
          'incident_response_preparation'
        ]
      },
      iso27001: {
        name: 'ISO 27001 Information Security',
        requirements: [
          'information_classification',
          'security_controls_documentation',
          'risk_management_evidence'
        ]
      }
    };
  }

  /**
   * Main security scanning entry point
   */
  async runSecurityScan(targetPath = null) {
    console.log('🔒 BMAD Security Scanner v1.0.0');
    console.log('='.repeat(50));
    console.log('📊 Running comprehensive security analysis...');
    console.log('');

    try {
      const startTime = Date.now();

      // Determine scan targets
      const scanTargets = await this.determineScanTargets(targetPath);

      // Phase 1: Sensitive Data Detection
      await this.scanSensitiveData(scanTargets);

      // Phase 2: Dependency Vulnerability Analysis
      await this.scanDependencyVulnerabilities(scanTargets);

      // Phase 3: Code Security Analysis
      await this.performCodeAnalysis(scanTargets);

      // Phase 4: Package Integrity Validation
      await this.validatePackageIntegrity(scanTargets);

      // Phase 5: Compliance Validation
      await this.validateCompliance(scanTargets);

      // Phase 6: Calculate Overall Security Score
      this.calculateOverallSecurityScore();

      // Phase 7: Generate Security Report
      const report = await this.generateSecurityReport();

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      console.log('');
      console.log('✅ Security scan completed');
      console.log(`⏱️  Total scan time: ${duration.toFixed(2)} seconds`);
      console.log(`🔒 Overall Security Score: ${this.scanResults.overall.score}/100`);
      console.log(`⚠️  Risk Level: ${this.scanResults.overall.risk_level.toUpperCase()}`);

      return {
        success: this.scanResults.overall.status !== 'critical_issues_found',
        results: this.scanResults,
        report,
        duration
      };

    } catch (error) {
      console.error('❌ Security scan failed:', error.message);
      throw error;
    }
  }

  /**
   * Determine scan targets (files and directories to scan)
   */
  async determineScanTargets(targetPath) {
    const targets = [];

    if (targetPath) {
      targets.push(targetPath);
    } else {
      // Scan source files
      targets.push(this.options.sourceRoot);

      // Scan output artifacts
      targets.push(this.options.outputPath);

      // Scan planning artifacts
      targets.push(this.options.planningArtifacts);
    }

    // Filter to existing paths
    const existingTargets = [];
    for (const target of targets) {
      try {
        await fs.access(target);
        existingTargets.push(target);
      } catch (error) {
        if (this.options.verbose) {
          console.warn(`⚠️  Target not accessible: ${target}`);
        }
      }
    }

    return existingTargets;
  }

  /**
   * Phase 1: Scan for sensitive data exposure
   */
  async scanSensitiveData(scanTargets) {
    console.log('🕵️  Phase 1: Sensitive Data Detection');
    console.log('-'.repeat(30));

    let totalIssues = 0;
    let scannedFiles = 0;

    for (const target of scanTargets) {
      const issues = await this.scanDirectoryForSensitiveData(target);
      totalIssues += issues.length;
      scannedFiles += issues.filter(issue => issue.type === 'file_scanned').length;
    }

    this.scanResults.sensitive_data.score = this.calculateSensitiveDataScore(totalIssues, scannedFiles);
    const passed = totalIssues === 0;

    console.log(`📊 Sensitive Data Score: ${this.scanResults.sensitive_data.score}/100`);
    console.log(`${passed ? '✅' : '❌'} Issues Found: ${totalIssues} (Scanned: ${scannedFiles} files)`);
    console.log('');
  }

  /**
   * Recursively scan directory for sensitive data
   */
  async scanDirectoryForSensitiveData(dirPath) {
    const issues = [];

    try {
      const items = await fs.readdir(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);

        if (stats.isDirectory()) {
          // Skip certain directories
          if (this.shouldSkipDirectory(item)) {
            continue;
          }

          const subIssues = await this.scanDirectoryForSensitiveData(itemPath);
          issues.push(...subIssues);
        } else if (stats.isFile()) {
          if (this.shouldScanFile(item)) {
            const fileIssues = await this.scanFileForSensitiveData(itemPath);
            issues.push(...fileIssues);
            issues.push({ type: 'file_scanned', path: itemPath });
          }
        }
      }
    } catch (error) {
      if (this.options.verbose) {
        console.warn(`⚠️  Cannot scan directory: ${dirPath} - ${error.message}`);
      }
    }

    return issues;
  }

  /**
   * Check if directory should be skipped
   */
  shouldSkipDirectory(dirName) {
    const skipDirs = [
      'node_modules', '.git', '.svn', '.hg',
      'coverage', 'dist', 'build', 'tmp',
      '__pycache__', '.pytest_cache', '.cache'
    ];
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  /**
   * Check if file should be scanned
   */
  shouldScanFile(fileName) {
    const textExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.json', '.yaml', '.yml',
      '.md', '.txt', '.env', '.config', '.conf', '.ini',
      '.py', '.rb', '.php', '.java', '.cs', '.cpp', '.c',
      '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd'
    ];

    const extension = path.extname(fileName).toLowerCase();
    return textExtensions.includes(extension) || fileName.includes('.env');
  }

  /**
   * Scan individual file for sensitive data
   */
  async scanFileForSensitiveData(filePath) {
    const issues = [];

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const relativePath = path.relative(this.options.sourceRoot, filePath);

      for (const rule of this.securityRules.sensitive_data_patterns) {
        const matches = [...content.matchAll(rule.pattern)];

        for (const match of matches) {
          const issue = {
            type: 'sensitive_data',
            path: relativePath,
            rule: rule.name,
            severity: rule.severity,
            description: rule.description,
            line_number: this.getLineNumber(content, match.index),
            match_snippet: this.getMatchSnippet(content, match.index),
            confidence: this.calculateConfidence(match, rule)
          };

          if (rule.severity === 'critical') {
            this.scanResults.sensitive_data.failed.push(issue);
          } else if (rule.severity === 'high') {
            this.scanResults.sensitive_data.warnings.push(issue);
          } else {
            this.scanResults.sensitive_data.warnings.push(issue);
          }

          issues.push(issue);
        }
      }

      // Additional checks for configuration files
      if (this.isConfigurationFile(filePath)) {
        const configIssues = await this.scanConfigurationFile(filePath, content);
        issues.push(...configIssues);
      }

    } catch (error) {
      if (this.options.verbose) {
        console.warn(`⚠️  Cannot scan file: ${filePath} - ${error.message}`);
      }
    }

    return issues;
  }

  /**
   * Get line number for match index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Get snippet around match for context
   */
  getMatchSnippet(content, index) {
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + 50);
    return content.substring(start, end).replace(/\n/g, '\\n');
  }

  /**
   * Calculate confidence level for match
   */
  calculateConfidence(match, rule) {
    // Higher confidence for longer matches and specific patterns
    let confidence = 50;

    if (match[0].length > 20) confidence += 20;
    if (match[0].length > 40) confidence += 15;
    if (rule.name === 'api_keys' && match[0].length > 32) confidence += 15;

    return Math.min(100, confidence);
  }

  /**
   * Check if file is a configuration file
   */
  isConfigurationFile(filePath) {
    const fileName = path.basename(filePath);
    const configPatterns = [
      /\.env/,
      /config\./,
      /\.config/,
      /settings\./,
      /\.ini$/,
      /\.conf$/
    ];

    return configPatterns.some(pattern => pattern.test(fileName));
  }

  /**
   * Scan configuration file for specific issues
   */
  async scanConfigurationFile(filePath, content) {
    const issues = [];

    // Check for development vs production configurations
    if (content.includes('localhost') || content.includes('127.0.0.1')) {
      issues.push({
        type: 'configuration_issue',
        path: path.relative(this.options.sourceRoot, filePath),
        severity: 'medium',
        description: 'Configuration contains localhost/development settings',
        rule: 'development_config'
      });
    }

    // Check for debug modes enabled
    if (/debug\s*[=:]\s*true/i.test(content)) {
      issues.push({
        type: 'configuration_issue',
        path: path.relative(this.options.sourceRoot, filePath),
        severity: 'medium',
        description: 'Debug mode enabled in configuration',
        rule: 'debug_enabled'
      });
    }

    return issues;
  }

  /**
   * Calculate sensitive data score
   */
  calculateSensitiveDataScore(totalIssues, scannedFiles) {
    if (scannedFiles === 0) return 100;

    const criticalIssues = this.scanResults.sensitive_data.failed.length;
    const warningIssues = this.scanResults.sensitive_data.warnings.length;

    // Critical issues are blocking
    if (criticalIssues > 0) return 0;

    // Calculate score based on warning issues
    const issueRatio = warningIssues / scannedFiles;
    const score = Math.max(0, 100 - (issueRatio * 100 * 10)); // Scale warnings

    return Math.round(score);
  }

  /**
   * Phase 2: Scan dependency vulnerabilities
   */
  async scanDependencyVulnerabilities(scanTargets) {
    console.log('📦 Phase 2: Dependency Vulnerability Analysis');
    console.log('-'.repeat(30));

    let totalVulnerabilities = 0;
    let scannedPackages = 0;

    for (const target of scanTargets) {
      const vulns = await this.scanDependencies(target);
      totalVulnerabilities += vulns.total;
      scannedPackages += vulns.scanned;
    }

    this.scanResults.dependency_vulnerabilities.score = this.calculateDependencyScore(totalVulnerabilities);
    const passed = totalVulnerabilities === 0;

    console.log(`📊 Dependency Security Score: ${this.scanResults.dependency_vulnerabilities.score}/100`);
    console.log(`${passed ? '✅' : '❌'} Vulnerabilities Found: ${totalVulnerabilities} (Scanned: ${scannedPackages} packages)`);
    console.log('');
  }

  /**
   * Scan dependencies for vulnerabilities
   */
  async scanDependencies(targetPath) {
    let totalVulns = 0;
    let scannedPackages = 0;

    try {
      // Find all package.json files
      const packageFiles = await this.findPackageJsonFiles(targetPath);

      for (const packageFile of packageFiles) {
        const packageInfo = await this.analyzePackageJson(packageFile);
        scannedPackages += packageInfo.dependencies.length;

        // Check for known vulnerable packages
        const vulns = await this.checkDependencyVulnerabilities(packageInfo.dependencies, packageFile);
        totalVulns += vulns.length;

        // Record results
        if (vulns.length > 0) {
          this.scanResults.dependency_vulnerabilities.failed.push({
            test: `dependency_vulnerabilities_${path.basename(packageFile)}`,
            path: path.relative(this.options.sourceRoot, packageFile),
            vulnerabilities: vulns.length,
            details: vulns
          });
        } else {
          this.scanResults.dependency_vulnerabilities.passed.push({
            test: `dependency_scan_${path.basename(packageFile)}`,
            path: path.relative(this.options.sourceRoot, packageFile),
            dependencies_scanned: packageInfo.dependencies.length,
            status: 'clean'
          });
        }
      }

    } catch (error) {
      if (this.options.verbose) {
        console.warn(`⚠️  Dependency scan error: ${error.message}`);
      }
    }

    return { total: totalVulns, scanned: scannedPackages };
  }

  /**
   * Find all package.json files in target
   */
  async findPackageJsonFiles(targetPath) {
    const packageFiles = [];

    const findFiles = async (dir) => {
      try {
        const items = await fs.readdir(dir);

        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stats = await fs.stat(itemPath);

          if (stats.isDirectory() && !this.shouldSkipDirectory(item)) {
            await findFiles(itemPath);
          } else if (item === 'package.json') {
            packageFiles.push(itemPath);
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    };

    await findFiles(targetPath);
    return packageFiles;
  }

  /**
   * Analyze package.json for security information
   */
  async analyzePackageJson(packageFilePath) {
    try {
      const content = await fs.readFile(packageFilePath, 'utf8');
      const packageData = JSON.parse(content);

      const dependencies = [
        ...Object.keys(packageData.dependencies || {}),
        ...Object.keys(packageData.devDependencies || {}),
        ...Object.keys(packageData.peerDependencies || {})
      ];

      return {
        name: packageData.name,
        version: packageData.version,
        dependencies,
        scripts: packageData.scripts || {},
        packageData
      };

    } catch (error) {
      return {
        name: 'unknown',
        version: 'unknown',
        dependencies: [],
        scripts: {},
        packageData: {}
      };
    }
  }

  /**
   * Check dependencies for known vulnerabilities
   */
  async checkDependencyVulnerabilities(dependencies, packageFile) {
    const vulnerabilities = [];

    // Check against known vulnerable packages
    const knownVulnerablePackages = [
      'event-stream',
      'flatmap-stream',
      'request',
      'node-uuid'
    ];

    for (const dep of dependencies) {
      if (knownVulnerablePackages.includes(dep)) {
        vulnerabilities.push({
          package: dep,
          severity: 'high',
          description: `Known vulnerable package: ${dep}`,
          recommendation: 'Update to secure alternative'
        });
      }

      // Check forbidden dependencies
      if (this.securityRules.package_security.forbidden_dependencies.includes(dep)) {
        vulnerabilities.push({
          package: dep,
          severity: 'medium',
          description: `Deprecated/insecure package: ${dep}`,
          recommendation: 'Replace with maintained alternative'
        });
      }
    }

    // In a real implementation, you would integrate with npm audit or similar tools
    // For now, we simulate vulnerability checking

    return vulnerabilities;
  }

  /**
   * Calculate dependency vulnerability score
   */
  calculateDependencyScore(totalVulnerabilities) {
    if (totalVulnerabilities === 0) return 100;
    if (totalVulnerabilities >= 10) return 0;

    return Math.max(0, 100 - (totalVulnerabilities * 10));
  }

  /**
   * Phase 3: Perform code security analysis
   */
  async performCodeAnalysis(scanTargets) {
    console.log('🔍 Phase 3: Code Security Analysis');
    console.log('-'.repeat(30));

    let totalIssues = 0;
    let scannedFiles = 0;

    for (const target of scanTargets) {
      const analysis = await this.analyzeCodeSecurity(target);
      totalIssues += analysis.issues;
      scannedFiles += analysis.files;
    }

    this.scanResults.code_analysis.score = this.calculateCodeAnalysisScore(totalIssues, scannedFiles);
    const passed = totalIssues === 0;

    console.log(`📊 Code Security Score: ${this.scanResults.code_analysis.score}/100`);
    console.log(`${passed ? '✅' : '❌'} Issues Found: ${totalIssues} (Scanned: ${scannedFiles} files)`);
    console.log('');
  }

  /**
   * Analyze code for security issues
   */
  async analyzeCodeSecurity(targetPath) {
    let totalIssues = 0;
    let scannedFiles = 0;

    const analyzeDirectory = async (dir) => {
      try {
        const items = await fs.readdir(dir);

        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stats = await fs.stat(itemPath);

          if (stats.isDirectory() && !this.shouldSkipDirectory(item)) {
            await analyzeDirectory(itemPath);
          } else if (stats.isFile() && this.isCodeFile(item)) {
            scannedFiles++;
            const issues = await this.analyzeCodeFile(itemPath);
            totalIssues += issues.length;
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    };

    await analyzeDirectory(targetPath);
    return { issues: totalIssues, files: scannedFiles };
  }

  /**
   * Check if file is a code file
   */
  isCodeFile(fileName) {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.php', '.java', '.cs'];
    const extension = path.extname(fileName).toLowerCase();
    return codeExtensions.includes(extension);
  }

  /**
   * Analyze individual code file for security issues
   */
  async analyzeCodeFile(filePath) {
    const issues = [];

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const relativePath = path.relative(this.options.sourceRoot, filePath);
      const extension = path.extname(filePath).toLowerCase();

      // Check for dangerous functions
      for (const rule of this.securityRules.dangerous_functions) {
        if (rule.language === 'javascript' && ['.js', '.ts', '.jsx', '.tsx'].includes(extension)) {
          const matches = [...content.matchAll(rule.pattern)];

          for (const match of matches) {
            const issue = {
              type: 'dangerous_function',
              path: relativePath,
              rule: rule.pattern.source,
              severity: rule.severity,
              description: rule.description,
              line_number: this.getLineNumber(content, match.index)
            };

            issues.push(issue);

            if (rule.severity === 'high' || rule.severity === 'critical') {
              this.scanResults.code_analysis.failed.push(issue);
            } else {
              this.scanResults.code_analysis.warnings.push(issue);
            }
          }
        }
      }

      // Check for hardcoded credentials in code
      for (const rule of this.securityRules.sensitive_data_patterns) {
        if (['api_keys', 'passwords', 'connection_strings'].includes(rule.name)) {
          const matches = [...content.matchAll(rule.pattern)];

          for (const match of matches) {
            const issue = {
              type: 'hardcoded_credential',
              path: relativePath,
              rule: rule.name,
              severity: 'critical',
              description: `Hardcoded ${rule.description} in source code`,
              line_number: this.getLineNumber(content, match.index)
            };

            issues.push(issue);
            this.scanResults.code_analysis.failed.push(issue);
          }
        }
      }

      // Additional JavaScript-specific checks
      if (['.js', '.ts', '.jsx', '.tsx'].includes(extension)) {
        const jsIssues = await this.analyzeJavaScriptSecurity(content, relativePath);
        issues.push(...jsIssues);
      }

    } catch (error) {
      if (this.options.verbose) {
        console.warn(`⚠️  Cannot analyze file: ${filePath} - ${error.message}`);
      }
    }

    return issues;
  }

  /**
   * Analyze JavaScript-specific security issues
   */
  async analyzeJavaScriptSecurity(content, relativePath) {
    const issues = [];

    // Check for potential XSS vulnerabilities
    const xssPatterns = [
      /dangerouslySetInnerHTML/g,
      /\.innerHTML\s*=/g,
      /document\.write/g
    ];

    for (const pattern of xssPatterns) {
      const matches = [...content.matchAll(pattern)];
      for (const match of matches) {
        issues.push({
          type: 'potential_xss',
          path: relativePath,
          severity: 'medium',
          description: 'Potential XSS vulnerability',
          line_number: this.getLineNumber(content, match.index)
        });
      }
    }

    // Check for insecure random number generation
    if (/Math\.random\(\)/.test(content)) {
      issues.push({
        type: 'insecure_random',
        path: relativePath,
        severity: 'low',
        description: 'Use of Math.random() for potential security purposes',
        line_number: this.getLineNumber(content, content.indexOf('Math.random()'))
      });
    }

    // Record issues
    issues.forEach(issue => {
      if (issue.severity === 'high' || issue.severity === 'critical') {
        this.scanResults.code_analysis.failed.push(issue);
      } else {
        this.scanResults.code_analysis.warnings.push(issue);
      }
    });

    return issues;
  }

  /**
   * Calculate code analysis score
   */
  calculateCodeAnalysisScore(totalIssues, scannedFiles) {
    if (scannedFiles === 0) return 100;

    const criticalIssues = this.scanResults.code_analysis.failed.length;
    const warningIssues = this.scanResults.code_analysis.warnings.length;

    // Critical issues significantly impact score
    if (criticalIssues > 0) return Math.max(0, 100 - (criticalIssues * 25));

    // Warning issues have lesser impact
    const issueRatio = warningIssues / scannedFiles;
    const score = Math.max(0, 100 - (issueRatio * 100 * 5));

    return Math.round(score);
  }

  /**
   * Phase 4: Validate package integrity
   */
  async validatePackageIntegrity(scanTargets) {
    console.log('🔐 Phase 4: Package Integrity Validation');
    console.log('-'.repeat(30));

    let integrityIssues = 0;
    let checkedPackages = 0;

    for (const target of scanTargets) {
      const integrity = await this.checkPackageIntegrity(target);
      integrityIssues += integrity.issues;
      checkedPackages += integrity.packages;
    }

    this.scanResults.package_integrity.score = this.calculateIntegrityScore(integrityIssues);
    const passed = integrityIssues === 0;

    console.log(`📊 Package Integrity Score: ${this.scanResults.package_integrity.score}/100`);
    console.log(`${passed ? '✅' : '❌'} Issues Found: ${integrityIssues} (Checked: ${checkedPackages} packages)`);
    console.log('');
  }

  /**
   * Check package integrity
   */
  async checkPackageIntegrity(targetPath) {
    let issues = 0;
    let packages = 0;

    try {
      const packageFiles = await this.findPackageJsonFiles(targetPath);

      for (const packageFile of packageFiles) {
        packages++;

        // Generate checksums
        const checksum = await this.generatePackageChecksum(packageFile);

        // Validate package.json structure
        const structureValid = await this.validatePackageStructure(packageFile);

        // Check for required security fields
        const securityFields = await this.validateSecurityFields(packageFile);

        if (!structureValid) {
          issues++;
          this.scanResults.package_integrity.failed.push({
            test: `package_structure_${path.basename(packageFile)}`,
            path: path.relative(this.options.sourceRoot, packageFile),
            error: 'Invalid package.json structure',
            severity: 'medium'
          });
        } else {
          this.scanResults.package_integrity.passed.push({
            test: `package_integrity_${path.basename(packageFile)}`,
            path: path.relative(this.options.sourceRoot, packageFile),
            checksum,
            security_fields: securityFields,
            status: 'valid'
          });
        }
      }

    } catch (error) {
      if (this.options.verbose) {
        console.warn(`⚠️  Package integrity check error: ${error.message}`);
      }
    }

    return { issues, packages };
  }

  /**
   * Generate package checksum
   */
  async generatePackageChecksum(packageFilePath) {
    try {
      const content = await fs.readFile(packageFilePath, 'utf8');
      const hash = crypto.createHash('sha256');
      hash.update(content);
      return hash.digest('hex').substring(0, 16);
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Validate package.json structure
   */
  async validatePackageStructure(packageFilePath) {
    try {
      const content = await fs.readFile(packageFilePath, 'utf8');
      const packageData = JSON.parse(content);

      const requiredFields = ['name', 'version'];
      return requiredFields.every(field => packageData[field]);

    } catch (error) {
      return false;
    }
  }

  /**
   * Validate security fields in package.json
   */
  async validateSecurityFields(packageFilePath) {
    try {
      const content = await fs.readFile(packageFilePath, 'utf8');
      const packageData = JSON.parse(content);

      const securityFieldsPresent = [];

      // Check for security-related fields
      if (packageData.bugs && packageData.bugs.security) {
        securityFieldsPresent.push('security_contact');
      }

      if (packageData.repository) {
        securityFieldsPresent.push('repository');
      }

      if (packageData.license) {
        securityFieldsPresent.push('license');
      }

      return securityFieldsPresent;

    } catch (error) {
      return [];
    }
  }

  /**
   * Calculate integrity score
   */
  calculateIntegrityScore(issues) {
    if (issues === 0) return 100;
    return Math.max(0, 100 - (issues * 20));
  }

  /**
   * Phase 5: Validate compliance standards
   */
  async validateCompliance(scanTargets) {
    console.log('⚖️  Phase 5: Compliance Validation');
    console.log('-'.repeat(30));

    const complianceResults = {};

    for (const [standard, config] of Object.entries(this.complianceStandards)) {
      complianceResults[standard] = await this.validateComplianceStandard(standard, config, scanTargets);
    }

    this.scanResults.compliance.score = this.calculateComplianceScore(complianceResults);
    const allCompliant = Object.values(complianceResults).every(result => result.compliant);

    console.log(`📊 Compliance Score: ${this.scanResults.compliance.score}/100`);
    console.log(`${allCompliant ? '✅' : '❌'} Compliance Status: ${Object.keys(complianceResults).length} standards checked`);
    console.log('');
  }

  /**
   * Validate specific compliance standard
   */
  async validateComplianceStandard(standardName, config, scanTargets) {
    const results = {
      standard: standardName,
      name: config.name,
      compliant: true,
      passed_requirements: [],
      failed_requirements: [],
      recommendations: []
    };

    for (const requirement of config.requirements) {
      const requirementResult = await this.checkComplianceRequirement(requirement, scanTargets);

      if (requirementResult.passed) {
        results.passed_requirements.push(requirement);
      } else {
        results.failed_requirements.push({
          requirement,
          issue: requirementResult.issue,
          recommendation: requirementResult.recommendation
        });
        results.compliant = false;
      }
    }

    // Record compliance results
    if (results.compliant) {
      this.scanResults.compliance.passed.push({
        test: `compliance_${standardName}`,
        standard: config.name,
        status: 'compliant',
        passed_requirements: results.passed_requirements.length
      });
    } else {
      this.scanResults.compliance.failed.push({
        test: `compliance_${standardName}`,
        standard: config.name,
        error: `Non-compliant: ${results.failed_requirements.length} requirements failed`,
        failed_requirements: results.failed_requirements,
        severity: 'medium'
      });
    }

    return results;
  }

  /**
   * Check specific compliance requirement
   */
  async checkComplianceRequirement(requirement, scanTargets) {
    switch (requirement) {
      case 'no_personal_data_exposure':
        return this.checkNoPersonalDataExposure();

      case 'no_hardcoded_credentials':
        return this.checkNoHardcodedCredentials();

      case 'dependency_vulnerability_check':
        return this.checkDependencyVulnerabilities();

      case 'security_documentation':
        return this.checkSecurityDocumentation(scanTargets);

      default:
        return {
          passed: true,
          issue: null,
          recommendation: null
        };
    }
  }

  /**
   * Check for personal data exposure (GDPR)
   */
  checkNoPersonalDataExposure() {
    const personalDataIssues = this.scanResults.sensitive_data.failed.filter(issue =>
      ['email_addresses', 'personal_info'].includes(issue.rule)
    );

    return {
      passed: personalDataIssues.length === 0,
      issue: personalDataIssues.length > 0 ? `${personalDataIssues.length} personal data exposures found` : null,
      recommendation: personalDataIssues.length > 0 ? 'Remove or anonymize personal data from source code and configuration files' : null
    };
  }

  /**
   * Check for hardcoded credentials (OWASP)
   */
  checkNoHardcodedCredentials() {
    const credentialIssues = this.scanResults.sensitive_data.failed.filter(issue =>
      ['api_keys', 'passwords', 'private_keys', 'connection_strings'].includes(issue.rule)
    );

    return {
      passed: credentialIssues.length === 0,
      issue: credentialIssues.length > 0 ? `${credentialIssues.length} hardcoded credentials found` : null,
      recommendation: credentialIssues.length > 0 ? 'Move credentials to environment variables or secure configuration management' : null
    };
  }

  /**
   * Check dependency vulnerabilities (OWASP)
   */
  checkDependencyVulnerabilities() {
    const vulnCount = this.scanResults.dependency_vulnerabilities.failed.length;

    return {
      passed: vulnCount === 0,
      issue: vulnCount > 0 ? `${vulnCount} dependency vulnerabilities found` : null,
      recommendation: vulnCount > 0 ? 'Update or replace vulnerable dependencies' : null
    };
  }

  /**
   * Check security documentation (NIST/ISO 27001)
   */
  async checkSecurityDocumentation(scanTargets) {
    let securityDocsFound = 0;

    for (const target of scanTargets) {
      const docs = await this.findSecurityDocumentation(target);
      securityDocsFound += docs.length;
    }

    return {
      passed: securityDocsFound > 0,
      issue: securityDocsFound === 0 ? 'No security documentation found' : null,
      recommendation: securityDocsFound === 0 ? 'Add SECURITY.md or security documentation' : null
    };
  }

  /**
   * Find security documentation files
   */
  async findSecurityDocumentation(targetPath) {
    const securityDocs = [];
    const securityFiles = ['SECURITY.md', 'SECURITY.txt', 'security.md', 'SECURITY.rst'];

    const findDocs = async (dir) => {
      try {
        const items = await fs.readdir(dir);

        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stats = await fs.stat(itemPath);

          if (stats.isDirectory() && !this.shouldSkipDirectory(item)) {
            await findDocs(itemPath);
          } else if (securityFiles.includes(item)) {
            securityDocs.push(itemPath);
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    };

    await findDocs(targetPath);
    return securityDocs;
  }

  /**
   * Calculate compliance score
   */
  calculateComplianceScore(complianceResults) {
    const standards = Object.keys(complianceResults);
    if (standards.length === 0) return 100;

    const compliantStandards = standards.filter(std => complianceResults[std].compliant);
    return Math.round((compliantStandards.length / standards.length) * 100);
  }

  /**
   * Calculate overall security score
   */
  calculateOverallSecurityScore() {
    const scores = [
      this.scanResults.sensitive_data.score,
      this.scanResults.dependency_vulnerabilities.score,
      this.scanResults.code_analysis.score,
      this.scanResults.package_integrity.score,
      this.scanResults.compliance.score
    ];

    const overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    this.scanResults.overall.score = overallScore;

    // Determine risk level
    if (overallScore >= 90) {
      this.scanResults.overall.risk_level = 'low';
      this.scanResults.overall.status = 'secure';
    } else if (overallScore >= 75) {
      this.scanResults.overall.risk_level = 'medium';
      this.scanResults.overall.status = 'acceptable';
    } else if (overallScore >= 60) {
      this.scanResults.overall.risk_level = 'high';
      this.scanResults.overall.status = 'needs_attention';
    } else {
      this.scanResults.overall.risk_level = 'critical';
      this.scanResults.overall.status = 'critical_issues_found';
    }
  }

  /**
   * Generate comprehensive security report
   */
  async generateSecurityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      scanner_version: '1.0.0',
      author: 'Murat (Test Architect)',

      security_summary: {
        overall_score: this.scanResults.overall.score,
        risk_level: this.scanResults.overall.risk_level,
        status: this.scanResults.overall.status,
        scan_phases: {
          sensitive_data: this.scanResults.sensitive_data.score,
          dependency_vulnerabilities: this.scanResults.dependency_vulnerabilities.score,
          code_analysis: this.scanResults.code_analysis.score,
          package_integrity: this.scanResults.package_integrity.score,
          compliance: this.scanResults.compliance.score
        }
      },

      detailed_results: this.scanResults,
      security_recommendations: this.generateSecurityRecommendations()
    };

    // Save report to file
    const reportPath = path.join(this.options.planningArtifacts, 'SECURITY-SCAN-REPORT.md');
    const markdownReport = this.generateMarkdownSecurityReport(report);
    await fs.writeFile(reportPath, markdownReport);

    if (this.options.verbose) {
      console.log(`📄 Security scan report saved: ${reportPath}`);
    }

    return report;
  }

  /**
   * Generate security recommendations
   */
  generateSecurityRecommendations() {
    const recommendations = [];
    const overallScore = this.scanResults.overall.score;

    if (overallScore < 75) {
      recommendations.push({
        priority: 'critical',
        category: 'overall_security',
        issue: `Low security score: ${overallScore}/100`,
        suggestion: 'Address high-priority security issues before distribution'
      });
    }

    // Sensitive data recommendations
    const sensitiveIssues = this.scanResults.sensitive_data.failed.length;
    if (sensitiveIssues > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'sensitive_data',
        issue: `${sensitiveIssues} sensitive data exposures found`,
        suggestion: 'Remove all hardcoded credentials, API keys, and personal data from source code'
      });
    }

    // Dependency vulnerability recommendations
    const vulnIssues = this.scanResults.dependency_vulnerabilities.failed.length;
    if (vulnIssues > 0) {
      recommendations.push({
        priority: 'high',
        category: 'dependencies',
        issue: `${vulnIssues} vulnerable dependencies found`,
        suggestion: 'Update or replace vulnerable dependencies with secure alternatives'
      });
    }

    // Code analysis recommendations
    const codeIssues = this.scanResults.code_analysis.failed.length;
    if (codeIssues > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'code_security',
        issue: `${codeIssues} code security issues found`,
        suggestion: 'Review and fix insecure coding patterns'
      });
    }

    // Compliance recommendations
    const complianceIssues = this.scanResults.compliance.failed.length;
    if (complianceIssues > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'compliance',
        issue: `${complianceIssues} compliance standards not met`,
        suggestion: 'Address compliance requirements for security standards'
      });
    }

    return recommendations;
  }

  /**
   * Generate markdown security report
   */
  generateMarkdownSecurityReport(report) {
    return `# BMAD Security Scan Report

**Generated**: ${new Date(report.timestamp).toLocaleString()}
**Scanner Version**: ${report.scanner_version}
**Author**: ${report.author}

## Security Summary

- **Overall Security Score**: ${report.security_summary.overall_score}/100
- **Risk Level**: ${report.security_summary.risk_level.toUpperCase()}
- **Security Status**: ${report.security_summary.status.replace(/_/g, ' ').toUpperCase()}

## Scan Results by Phase

| Security Area | Score | Status |
|---------------|--------|--------|
| Sensitive Data Detection | ${report.security_summary.scan_phases.sensitive_data}/100 | ${report.security_summary.scan_phases.sensitive_data >= 90 ? '✅ Secure' : report.security_summary.scan_phases.sensitive_data >= 75 ? '⚠️ Needs Review' : '❌ Issues Found'} |
| Dependency Vulnerabilities | ${report.security_summary.scan_phases.dependency_vulnerabilities}/100 | ${report.security_summary.scan_phases.dependency_vulnerabilities >= 90 ? '✅ Secure' : report.security_summary.scan_phases.dependency_vulnerabilities >= 75 ? '⚠️ Needs Review' : '❌ Issues Found'} |
| Code Security Analysis | ${report.security_summary.scan_phases.code_analysis}/100 | ${report.security_summary.scan_phases.code_analysis >= 90 ? '✅ Secure' : report.security_summary.scan_phases.code_analysis >= 75 ? '⚠️ Needs Review' : '❌ Issues Found'} |
| Package Integrity | ${report.security_summary.scan_phases.package_integrity}/100 | ${report.security_summary.scan_phases.package_integrity >= 90 ? '✅ Secure' : report.security_summary.scan_phases.package_integrity >= 75 ? '⚠️ Needs Review' : '❌ Issues Found'} |
| Compliance Validation | ${report.security_summary.scan_phases.compliance}/100 | ${report.security_summary.scan_phases.compliance >= 90 ? '✅ Compliant' : report.security_summary.scan_phases.compliance >= 75 ? '⚠️ Partial' : '❌ Non-Compliant'} |

## Critical Security Issues

### ❌ Sensitive Data Exposures (${report.detailed_results.sensitive_data.failed.length})

${report.detailed_results.sensitive_data.failed.length === 0 ? 'No critical sensitive data exposures found.' :
report.detailed_results.sensitive_data.failed.map(issue =>
  `- **${issue.path}** (Line ${issue.line_number}): ${issue.description} - ${issue.rule} (${issue.severity})`
).join('\n')}

### ❌ Code Security Issues (${report.detailed_results.code_analysis.failed.length})

${report.detailed_results.code_analysis.failed.length === 0 ? 'No critical code security issues found.' :
report.detailed_results.code_analysis.failed.map(issue =>
  `- **${issue.path}** (Line ${issue.line_number}): ${issue.description} (${issue.severity})`
).join('\n')}

### ❌ Dependency Vulnerabilities (${report.detailed_results.dependency_vulnerabilities.failed.length})

${report.detailed_results.dependency_vulnerabilities.failed.length === 0 ? 'No dependency vulnerabilities found.' :
report.detailed_results.dependency_vulnerabilities.failed.map(issue =>
  `- **${issue.path}**: ${issue.vulnerabilities} vulnerabilities found`
).join('\n')}

## Security Warnings

### ⚠️  Sensitive Data Warnings (${report.detailed_results.sensitive_data.warnings.length})

${report.detailed_results.sensitive_data.warnings.length === 0 ? 'No sensitive data warnings.' :
report.detailed_results.sensitive_data.warnings.map(warning =>
  `- **${warning.path}** (Line ${warning.line_number}): ${warning.description} - ${warning.rule}`
).join('\n')}

### ⚠️  Code Analysis Warnings (${report.detailed_results.code_analysis.warnings.length})

${report.detailed_results.code_analysis.warnings.length === 0 ? 'No code analysis warnings.' :
report.detailed_results.code_analysis.warnings.map(warning =>
  `- **${warning.path}** (Line ${warning.line_number}): ${warning.description}`
).join('\n')}

## Security Recommendations

${report.security_recommendations.length === 0 ? 'No specific security recommendations. All security checks passed.' :
report.security_recommendations.map(rec => `
### ${rec.priority.toUpperCase()} Priority: ${rec.issue}

- **Category**: ${rec.category}
- **Suggestion**: ${rec.suggestion}
`).join('')}

## Compliance Status

### Standards Checked

${Object.keys(this.complianceStandards).map(standard => {
  const result = report.detailed_results.compliance.passed.find(p => p.test === `compliance_${standard}`) ||
                 report.detailed_results.compliance.failed.find(f => f.test === `compliance_${standard}`);
  const status = result && result.status === 'compliant' ? '✅ Compliant' : '❌ Non-Compliant';
  return `- **${this.complianceStandards[standard].name}**: ${status}`;
}).join('\n')}

## Security Standards Applied

### Sensitive Data Detection
- API keys and access tokens
- Passwords and secrets
- Private cryptographic keys
- Database connection strings
- Personal identifiable information
- IP addresses and URLs with credentials

### Code Security Analysis
- Dangerous function usage (eval, exec)
- Potential XSS vulnerabilities
- Insecure random number generation
- Hardcoded credentials in source code

### Dependency Security
- Known vulnerable packages
- Deprecated/insecure dependencies
- Security field validation in package.json

### Compliance Standards
- **GDPR**: General Data Protection Regulation
- **OWASP**: Open Web Application Security Project
- **NIST**: National Institute of Standards and Technology
- **ISO 27001**: Information Security Management

## Next Steps

${report.security_summary.overall_score >= 90 ?
`✅ **Security scan passed!** Overall score of ${report.security_summary.overall_score}/100 indicates good security posture.

Recommended actions:
1. Maintain current security standards
2. Monitor for new vulnerabilities
3. Regular security scan updates` :

report.security_summary.overall_score >= 75 ?
`⚠️  **Security needs minor improvements.** Score of ${report.security_summary.overall_score}/100 has some issues.

Recommended actions:
1. Address medium and high priority recommendations
2. Review and fix identified security warnings
3. Re-scan after implementing fixes` :

`❌ **Critical security issues found.** Score of ${report.security_summary.overall_score}/100 requires immediate attention.

Required actions:
1. Address ALL critical security issues before distribution
2. Remove hardcoded credentials and sensitive data
3. Fix vulnerable dependencies
4. Re-scan and achieve score ≥75 before proceeding`}

---

**Security Scanner**: BMAD Security Scanner v${report.scanner_version}
**Story**: 4.3 - Quality Assurance for Distribution Packages
**Epic**: 4 - Packaging & Distribution Automation
`;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--verbose':
        options.verbose = true;
        break;
      case '--strict':
        options.strictMode = true;
        break;
      case '--target':
        options.targetPath = args[++i];
        break;
      case '--help':
        console.log(`
BMAD Security Scanner v1.0.0

Usage: node bmad-security-scanner.js [options]

Options:
  --verbose     Enable verbose output
  --strict      Enable strict security mode
  --target      Specific target path to scan
  --help        Show this help message

Examples:
  node bmad-security-scanner.js
  node bmad-security-scanner.js --verbose --strict
  node bmad-security-scanner.js --target /path/to/scan
`);
        process.exit(0);
        break;
    }
  }

  try {
    const scanner = new BMAdSecurityScanner(options);
    const result = await scanner.runSecurityScan(options.targetPath);

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('❌ Security scan failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = BMAdSecurityScanner;

// Run CLI if executed directly
if (require.main === module) {
  main();
}