"use strict";
/**
 * BMAD Configuration Validator
 * Epic 3: Story 3.4 - Configuration Validation System
 *
 * Comprehensive validation system for BMAD module configurations,
 * ensuring compliance, security, and structural integrity.
 *
 * @author Clara (Tech Writer)
 * @version 1.0.0
 */
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const crypto = require('crypto');
class BMADConfigurationValidator {
    constructor(options = {}) {
        this.config = {
            bmadRoot: options.bmadRoot || './_bmad',
            validationRulesPath: options.validationRulesPath || './src/config/bmad-validation-rules.yaml',
            strictMode: options.strictMode !== false,
            enableSecurityChecks: options.enableSecurityChecks !== false,
            enablePerformanceChecks: options.enablePerformanceChecks !== false,
            maxValidationTime: options.maxValidationTime || 30000, // 30 seconds
            ...options
        };
        // Validation rules registry
        this.validationRules = new Map();
        this.customValidators = new Map();
        this.securityRules = new Map();
        this.performanceRules = new Map();
        // Team-specific validation rules
        this.teamValidationRules = new Map();
        // Validation context
        this.validationContext = {
            startTime: null,
            currentRule: null,
            depth: 0,
            maxDepth: 50
        };
        // Validation statistics
        this.validationStats = {
            totalValidations: 0,
            passedValidations: 0,
            failedValidations: 0,
            averageValidationTime: 0,
            commonErrors: new Map()
        };
    }
    /**
     * Initialize the validator
     */
    async initialize() {
        try {
            await this.loadValidationRules();
            await this.initializeBuiltinValidators();
            await this.initializeSecurityValidators();
            await this.initializePerformanceValidators();
            await this.initializeTeamSpecificValidators();
            console.log('[BMAD Configuration Validator] Initialized successfully');
            return true;
        }
        catch (error) {
            console.error('[BMAD Configuration Validator] Initialization failed:', error.message);
            throw error;
        }
    }
    /**
     * Validate configuration comprehensively
     */
    async validateConfiguration(config, context = {}) {
        const startTime = Date.now();
        this.validationContext.startTime = startTime;
        const validationResult = {
            valid: true,
            score: 0,
            errors: [],
            warnings: [],
            info: [],
            checks: {
                structure: { passed: 0, total: 0, issues: [] },
                content: { passed: 0, total: 0, issues: [] },
                security: { passed: 0, total: 0, issues: [] },
                performance: { passed: 0, total: 0, issues: [] },
                compliance: { passed: 0, total: 0, issues: [] },
                teamSpecific: { passed: 0, total: 0, issues: [] }
            },
            metadata: {
                validatedAt: new Date().toISOString(),
                validationTime: 0,
                validator: 'BMAD Configuration Validator v1.0.0',
                context
            }
        };
        try {
            console.log('[BMAD Configuration Validator] Starting comprehensive validation...');
            // Phase 1: Structural validation
            await this.validateStructure(config, validationResult, context);
            // Phase 2: Content validation
            await this.validateContent(config, validationResult, context);
            // Phase 3: Security validation
            if (this.config.enableSecurityChecks) {
                await this.validateSecurity(config, validationResult, context);
            }
            // Phase 4: Performance validation
            if (this.config.enablePerformanceChecks) {
                await this.validatePerformance(config, validationResult, context);
            }
            // Phase 5: Compliance validation
            await this.validateCompliance(config, validationResult, context);
            // Phase 6: Team-specific validation
            if (context.teamCode) {
                await this.validateTeamSpecific(config, validationResult, context);
            }
            // Calculate overall score and final validation status
            this.calculateValidationScore(validationResult);
            this.finalizeValidationResult(validationResult);
            // Update statistics
            this.updateValidationStatistics(validationResult, startTime);
            validationResult.metadata.validationTime = Date.now() - startTime;
            console.log(`[BMAD Configuration Validator] Validation completed in ${validationResult.metadata.validationTime}ms`);
            console.log(`[BMAD Configuration Validator] Overall score: ${validationResult.score}/100`);
            return validationResult;
        }
        catch (error) {
            validationResult.valid = false;
            validationResult.errors.push({
                severity: 'critical',
                category: 'validation_system',
                message: `Validation system error: ${error.message}`,
                code: 'VALIDATION_SYSTEM_ERROR'
            });
            validationResult.metadata.validationTime = Date.now() - startTime;
            return validationResult;
        }
    }
    /**
     * Validate configuration structure
     */
    async validateStructure(config, result, context) {
        const structureChecks = result.checks.structure;
        try {
            // Check 1: Required top-level fields
            const requiredFields = [
                'code', 'name', 'version', 'type', 'category',
                'npm', 'agents', 'workflows'
            ];
            for (const field of requiredFields) {
                structureChecks.total++;
                if (config[field] !== undefined && config[field] !== null) {
                    structureChecks.passed++;
                }
                else {
                    const issue = {
                        severity: 'error',
                        field,
                        message: `Missing required field: ${field}`,
                        code: 'MISSING_REQUIRED_FIELD'
                    };
                    structureChecks.issues.push(issue);
                    result.errors.push(issue);
                }
            }
            // Check 2: Field type validation
            const fieldTypes = {
                'code': 'string',
                'name': 'string',
                'version': 'string',
                'type': 'string',
                'category': 'string',
                'default_selected': 'boolean',
                'npm': 'object',
                'agents': 'object',
                'workflows': 'object'
            };
            for (const [field, expectedType] of Object.entries(fieldTypes)) {
                if (config[field] !== undefined) {
                    structureChecks.total++;
                    const actualType = Array.isArray(config[field]) ? 'array' : typeof config[field];
                    if (actualType === expectedType) {
                        structureChecks.passed++;
                    }
                    else {
                        const issue = {
                            severity: 'error',
                            field,
                            message: `Field type mismatch: expected ${expectedType}, got ${actualType}`,
                            code: 'FIELD_TYPE_MISMATCH'
                        };
                        structureChecks.issues.push(issue);
                        result.errors.push(issue);
                    }
                }
            }
            // Check 3: NPM configuration structure
            if (config.npm) {
                const npmRequiredFields = ['scope', 'package_name', 'full_name'];
                for (const field of npmRequiredFields) {
                    structureChecks.total++;
                    if (config.npm[field]) {
                        structureChecks.passed++;
                    }
                    else {
                        const issue = {
                            severity: 'error',
                            field: `npm.${field}`,
                            message: `Missing required NPM field: ${field}`,
                            code: 'MISSING_NPM_FIELD'
                        };
                        structureChecks.issues.push(issue);
                        result.errors.push(issue);
                    }
                }
            }
            // Check 4: Agent configuration structure
            if (config.agents) {
                const agentRequiredFields = ['count', 'conversion_format', 'source_path', 'target_path'];
                for (const field of agentRequiredFields) {
                    structureChecks.total++;
                    if (config.agents[field] !== undefined) {
                        structureChecks.passed++;
                    }
                    else {
                        const issue = {
                            severity: 'warning',
                            field: `agents.${field}`,
                            message: `Missing agent configuration field: ${field}`,
                            code: 'MISSING_AGENT_FIELD'
                        };
                        structureChecks.issues.push(issue);
                        result.warnings.push(issue);
                    }
                }
            }
            // Check 5: Workflow configuration structure
            if (config.workflows) {
                const workflowRequiredFields = ['count', 'conversion_format', 'source_path', 'target_path'];
                for (const field of workflowRequiredFields) {
                    structureChecks.total++;
                    if (config.workflows[field] !== undefined) {
                        structureChecks.passed++;
                    }
                    else {
                        const issue = {
                            severity: 'warning',
                            field: `workflows.${field}`,
                            message: `Missing workflow configuration field: ${field}`,
                            code: 'MISSING_WORKFLOW_FIELD'
                        };
                        structureChecks.issues.push(issue);
                        result.warnings.push(issue);
                    }
                }
            }
        }
        catch (error) {
            const issue = {
                severity: 'critical',
                category: 'structure',
                message: `Structure validation failed: ${error.message}`,
                code: 'STRUCTURE_VALIDATION_ERROR'
            };
            structureChecks.issues.push(issue);
            result.errors.push(issue);
        }
    }
    /**
     * Validate configuration content
     */
    async validateContent(config, result, context) {
        const contentChecks = result.checks.content;
        try {
            // Check 1: Version format validation
            contentChecks.total++;
            if (config.version && /^\d+\.\d+\.\d+$/.test(config.version)) {
                contentChecks.passed++;
            }
            else {
                const issue = {
                    severity: 'error',
                    field: 'version',
                    message: `Invalid version format: ${config.version}. Expected semantic version (e.g., 2.0.0)`,
                    code: 'INVALID_VERSION_FORMAT'
                };
                contentChecks.issues.push(issue);
                result.errors.push(issue);
            }
            // Check 2: Team code format validation
            contentChecks.total++;
            if (config.code && /^[a-z]+-team$/.test(config.code)) {
                contentChecks.passed++;
            }
            else {
                const issue = {
                    severity: 'error',
                    field: 'code',
                    message: `Invalid team code format: ${config.code}. Expected format: {name}-team`,
                    code: 'INVALID_TEAM_CODE_FORMAT'
                };
                contentChecks.issues.push(issue);
                result.errors.push(issue);
            }
            // Check 3: Type validation
            contentChecks.total++;
            const validTypes = ['specialized-team', 'core-module', 'extension'];
            if (config.type && validTypes.includes(config.type)) {
                contentChecks.passed++;
            }
            else {
                const issue = {
                    severity: 'error',
                    field: 'type',
                    message: `Invalid type: ${config.type}. Valid types: ${validTypes.join(', ')}`,
                    code: 'INVALID_TYPE'
                };
                contentChecks.issues.push(issue);
                result.errors.push(issue);
            }
            // Check 4: NPM scope validation
            if (config.npm && config.npm.scope) {
                contentChecks.total++;
                if (config.npm.scope.startsWith('@') && config.npm.scope.length > 1) {
                    contentChecks.passed++;
                }
                else {
                    const issue = {
                        severity: 'error',
                        field: 'npm.scope',
                        message: `Invalid NPM scope format: ${config.npm.scope}. Must start with @ and have content`,
                        code: 'INVALID_NPM_SCOPE'
                    };
                    contentChecks.issues.push(issue);
                    result.errors.push(issue);
                }
            }
            // Check 5: Agent and workflow count validation
            if (config.agents && config.agents.count !== undefined) {
                contentChecks.total++;
                const count = parseInt(config.agents.count);
                if (!isNaN(count) && count > 0 && count <= 100) {
                    contentChecks.passed++;
                }
                else {
                    const issue = {
                        severity: 'warning',
                        field: 'agents.count',
                        message: `Agent count out of reasonable range: ${config.agents.count}. Expected: 1-100`,
                        code: 'AGENT_COUNT_OUT_OF_RANGE'
                    };
                    contentChecks.issues.push(issue);
                    result.warnings.push(issue);
                }
            }
            if (config.workflows && config.workflows.count !== undefined) {
                contentChecks.total++;
                const count = parseInt(config.workflows.count);
                if (!isNaN(count) && count > 0 && count <= 200) {
                    contentChecks.passed++;
                }
                else {
                    const issue = {
                        severity: 'warning',
                        field: 'workflows.count',
                        message: `Workflow count out of reasonable range: ${config.workflows.count}. Expected: 1-200`,
                        code: 'WORKFLOW_COUNT_OUT_OF_RANGE'
                    };
                    contentChecks.issues.push(issue);
                    result.warnings.push(issue);
                }
            }
            // Check 6: Path validation
            const pathFields = [
                'agents.source_path', 'agents.target_path',
                'workflows.source_path', 'workflows.target_path',
                'tools.source_path', 'tools.target_path',
                'data.source_path', 'data.target_path'
            ];
            for (const pathField of pathFields) {
                const pathValue = this.getNestedValue(config, pathField);
                if (pathValue !== undefined) {
                    contentChecks.total++;
                    if (this.isValidPath(pathValue)) {
                        contentChecks.passed++;
                    }
                    else {
                        const issue = {
                            severity: 'warning',
                            field: pathField,
                            message: `Potentially invalid path: ${pathValue}`,
                            code: 'INVALID_PATH_FORMAT'
                        };
                        contentChecks.issues.push(issue);
                        result.warnings.push(issue);
                    }
                }
            }
        }
        catch (error) {
            const issue = {
                severity: 'critical',
                category: 'content',
                message: `Content validation failed: ${error.message}`,
                code: 'CONTENT_VALIDATION_ERROR'
            };
            contentChecks.issues.push(issue);
            result.errors.push(issue);
        }
    }
    /**
     * Validate security aspects
     */
    async validateSecurity(config, result, context) {
        const securityChecks = result.checks.security;
        try {
            // Check 1: Permission validation
            if (config.permissions) {
                securityChecks.total++;
                // Check network permissions
                if (config.permissions.network === true) {
                    // Validate that team actually needs network access
                    const networkRequiringTeams = ['cybersec-team', 'intel-team'];
                    if (networkRequiringTeams.includes(context.teamCode)) {
                        securityChecks.passed++;
                    }
                    else {
                        const issue = {
                            severity: 'warning',
                            field: 'permissions.network',
                            message: `Network access enabled for team that may not require it: ${context.teamCode}`,
                            code: 'UNNECESSARY_NETWORK_PERMISSION'
                        };
                        securityChecks.issues.push(issue);
                        result.warnings.push(issue);
                    }
                }
                else {
                    securityChecks.passed++;
                }
                // Check shell command permissions
                if (config.permissions.shell && config.permissions.shell.allowed_commands) {
                    securityChecks.total++;
                    const allowedCommands = config.permissions.shell.allowed_commands;
                    const dangerousCommands = ['rm', 'mv', 'chmod', 'sudo', 'su', 'passwd', 'chown'];
                    const foundDangerous = allowedCommands.filter(cmd => dangerousCommands.includes(cmd));
                    if (foundDangerous.length === 0) {
                        securityChecks.passed++;
                    }
                    else {
                        const issue = {
                            severity: 'error',
                            field: 'permissions.shell.allowed_commands',
                            message: `Dangerous shell commands detected: ${foundDangerous.join(', ')}`,
                            code: 'DANGEROUS_SHELL_COMMANDS'
                        };
                        securityChecks.issues.push(issue);
                        result.errors.push(issue);
                    }
                }
                // Check sensitive data access
                if (config.permissions.sensitive_data === true) {
                    securityChecks.total++;
                    const sensitiveDataTeams = ['cybersec-team', 'intel-team', 'legal-team'];
                    if (sensitiveDataTeams.includes(context.teamCode)) {
                        securityChecks.passed++;
                    }
                    else {
                        const issue = {
                            severity: 'warning',
                            field: 'permissions.sensitive_data',
                            message: `Sensitive data access enabled for team that may not require it: ${context.teamCode}`,
                            code: 'UNNECESSARY_SENSITIVE_DATA_ACCESS'
                        };
                        securityChecks.issues.push(issue);
                        result.warnings.push(issue);
                    }
                }
            }
            // Check 2: Security configuration validation
            if (config.security) {
                securityChecks.total++;
                if (config.security.signature_required === true) {
                    securityChecks.passed++;
                }
                else {
                    const issue = {
                        severity: 'warning',
                        field: 'security.signature_required',
                        message: 'Digital signature verification should be enabled for security',
                        code: 'SIGNATURE_NOT_REQUIRED'
                    };
                    securityChecks.issues.push(issue);
                    result.warnings.push(issue);
                }
                securityChecks.total++;
                if (config.security.integrity_check === true) {
                    securityChecks.passed++;
                }
                else {
                    const issue = {
                        severity: 'warning',
                        field: 'security.integrity_check',
                        message: 'Integrity checking should be enabled for security',
                        code: 'INTEGRITY_CHECK_DISABLED'
                    };
                    securityChecks.issues.push(issue);
                    result.warnings.push(issue);
                }
            }
            // Check 3: File path security
            const writeablePaths = config.permissions?.filesystem?.write || [];
            for (const writePath of writeablePaths) {
                securityChecks.total++;
                if (this.isSecurePath(writePath)) {
                    securityChecks.passed++;
                }
                else {
                    const issue = {
                        severity: 'error',
                        field: 'permissions.filesystem.write',
                        message: `Potentially unsafe write path: ${writePath}`,
                        code: 'UNSAFE_WRITE_PATH'
                    };
                    securityChecks.issues.push(issue);
                    result.errors.push(issue);
                }
            }
        }
        catch (error) {
            const issue = {
                severity: 'critical',
                category: 'security',
                message: `Security validation failed: ${error.message}`,
                code: 'SECURITY_VALIDATION_ERROR'
            };
            securityChecks.issues.push(issue);
            result.errors.push(issue);
        }
    }
    /**
     * Validate performance aspects
     */
    async validatePerformance(config, result, context) {
        const performanceChecks = result.checks.performance;
        try {
            // Check 1: Agent count performance impact
            if (config.agents && config.agents.count) {
                performanceChecks.total++;
                const agentCount = parseInt(config.agents.count);
                if (agentCount <= 20) {
                    performanceChecks.passed++;
                }
                else {
                    const issue = {
                        severity: 'info',
                        field: 'agents.count',
                        message: `High agent count may impact performance: ${agentCount}`,
                        code: 'HIGH_AGENT_COUNT'
                    };
                    performanceChecks.issues.push(issue);
                    result.info.push(issue);
                }
            }
            // Check 2: Workflow count performance impact
            if (config.workflows && config.workflows.count) {
                performanceChecks.total++;
                const workflowCount = parseInt(config.workflows.count);
                if (workflowCount <= 50) {
                    performanceChecks.passed++;
                }
                else {
                    const issue = {
                        severity: 'info',
                        field: 'workflows.count',
                        message: `High workflow count may impact startup time: ${workflowCount}`,
                        code: 'HIGH_WORKFLOW_COUNT'
                    };
                    performanceChecks.issues.push(issue);
                    result.info.push(issue);
                }
            }
            // Check 3: Output directory configuration
            if (config.output_folder || config.configuration?.outputFolder) {
                performanceChecks.total++;
                const outputPath = config.output_folder?.result || config.configuration?.outputFolder;
                if (outputPath && !outputPath.includes('/tmp/') && !outputPath.includes('/temp/')) {
                    performanceChecks.passed++;
                }
                else {
                    const issue = {
                        severity: 'warning',
                        field: 'output_folder',
                        message: 'Output folder in temporary directory may cause data loss',
                        code: 'TEMPORARY_OUTPUT_DIRECTORY'
                    };
                    performanceChecks.issues.push(issue);
                    result.warnings.push(issue);
                }
            }
        }
        catch (error) {
            const issue = {
                severity: 'critical',
                category: 'performance',
                message: `Performance validation failed: ${error.message}`,
                code: 'PERFORMANCE_VALIDATION_ERROR'
            };
            performanceChecks.issues.push(issue);
            result.errors.push(issue);
        }
    }
    /**
     * Validate compliance aspects
     */
    async validateCompliance(config, result, context) {
        const complianceChecks = result.checks.compliance;
        try {
            // Check 1: License validation
            complianceChecks.total++;
            if (config.license && ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause'].includes(config.license)) {
                complianceChecks.passed++;
            }
            else {
                const issue = {
                    severity: 'warning',
                    field: 'license',
                    message: `License should be specified: ${config.license || 'undefined'}`,
                    code: 'MISSING_OR_INVALID_LICENSE'
                };
                complianceChecks.issues.push(issue);
                result.warnings.push(issue);
            }
            // Check 2: Documentation requirements
            complianceChecks.total++;
            if (config.documentation || config.support) {
                complianceChecks.passed++;
            }
            else {
                const issue = {
                    severity: 'info',
                    field: 'documentation',
                    message: 'Documentation configuration should be specified',
                    code: 'MISSING_DOCUMENTATION_CONFIG'
                };
                complianceChecks.issues.push(issue);
                result.info.push(issue);
            }
            // Check 3: Maintainer information
            complianceChecks.total++;
            if (config.maintainers && Array.isArray(config.maintainers) && config.maintainers.length > 0) {
                complianceChecks.passed++;
            }
            else {
                const issue = {
                    severity: 'warning',
                    field: 'maintainers',
                    message: 'Maintainer information should be specified',
                    code: 'MISSING_MAINTAINER_INFO'
                };
                complianceChecks.issues.push(issue);
                result.warnings.push(issue);
            }
            // Check 4: Keywords validation
            complianceChecks.total++;
            if (config.keywords && Array.isArray(config.keywords) && config.keywords.length >= 3) {
                complianceChecks.passed++;
            }
            else {
                const issue = {
                    severity: 'info',
                    field: 'keywords',
                    message: 'At least 3 keywords recommended for discoverability',
                    code: 'INSUFFICIENT_KEYWORDS'
                };
                complianceChecks.issues.push(issue);
                result.info.push(issue);
            }
        }
        catch (error) {
            const issue = {
                severity: 'critical',
                category: 'compliance',
                message: `Compliance validation failed: ${error.message}`,
                code: 'COMPLIANCE_VALIDATION_ERROR'
            };
            complianceChecks.issues.push(issue);
            result.errors.push(issue);
        }
    }
    /**
     * Validate team-specific requirements
     */
    async validateTeamSpecific(config, result, context) {
        const teamChecks = result.checks.teamSpecific;
        const teamCode = context.teamCode;
        try {
            // Get team-specific validation rules
            const teamRules = this.teamValidationRules.get(teamCode);
            if (!teamRules) {
                teamChecks.total++;
                teamChecks.passed++; // No specific rules, consider passed
                return;
            }
            // Validate team-specific configuration
            if (teamRules.requiredConfig) {
                for (const [field, requirement] of Object.entries(teamRules.requiredConfig)) {
                    teamChecks.total++;
                    const value = this.getNestedValue(config, field);
                    if (this.validateRequirement(value, requirement)) {
                        teamChecks.passed++;
                    }
                    else {
                        const issue = {
                            severity: requirement.severity || 'warning',
                            field,
                            message: requirement.message || `Team-specific requirement not met for field: ${field}`,
                            code: requirement.code || 'TEAM_REQUIREMENT_NOT_MET'
                        };
                        teamChecks.issues.push(issue);
                        if (requirement.severity === 'error') {
                            result.errors.push(issue);
                        }
                        else {
                            result.warnings.push(issue);
                        }
                    }
                }
            }
            // Validate team-specific permissions
            if (teamRules.permissions && config.permissions) {
                teamChecks.total++;
                if (this.validateTeamPermissions(config.permissions, teamRules.permissions)) {
                    teamChecks.passed++;
                }
                else {
                    const issue = {
                        severity: 'warning',
                        field: 'permissions',
                        message: `Permissions do not match team requirements for ${teamCode}`,
                        code: 'TEAM_PERMISSIONS_MISMATCH'
                    };
                    teamChecks.issues.push(issue);
                    result.warnings.push(issue);
                }
            }
        }
        catch (error) {
            const issue = {
                severity: 'critical',
                category: 'team_specific',
                message: `Team-specific validation failed: ${error.message}`,
                code: 'TEAM_VALIDATION_ERROR'
            };
            teamChecks.issues.push(issue);
            result.errors.push(issue);
        }
    }
    /**
     * Calculate overall validation score
     */
    calculateValidationScore(result) {
        let totalChecks = 0;
        let passedChecks = 0;
        for (const [checkType, checkResult] of Object.entries(result.checks)) {
            totalChecks += checkResult.total;
            passedChecks += checkResult.passed;
        }
        // Calculate base score
        const baseScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
        // Apply penalties for errors and warnings
        let penalties = 0;
        penalties += result.errors.length * 10; // -10 points per error
        penalties += result.warnings.length * 3; // -3 points per warning
        // Calculate final score
        result.score = Math.max(0, baseScore - penalties);
    }
    /**
     * Finalize validation result
     */
    finalizeValidationResult(result) {
        // Determine overall validity
        result.valid = result.errors.length === 0 && result.score >= 70;
        // Sort issues by severity
        const severityOrder = { 'critical': 0, 'error': 1, 'warning': 2, 'info': 3 };
        result.errors.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        result.warnings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        result.info.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        // Add validation summary
        result.summary = {
            totalIssues: result.errors.length + result.warnings.length + result.info.length,
            criticalIssues: result.errors.filter(e => e.severity === 'critical').length,
            errorIssues: result.errors.filter(e => e.severity === 'error').length,
            warningIssues: result.warnings.length,
            infoIssues: result.info.length
        };
    }
    /**
     * Update validation statistics
     */
    updateValidationStatistics(result, startTime) {
        this.validationStats.totalValidations++;
        if (result.valid) {
            this.validationStats.passedValidations++;
        }
        else {
            this.validationStats.failedValidations++;
        }
        // Update average validation time
        const validationTime = Date.now() - startTime;
        this.validationStats.averageValidationTime =
            (this.validationStats.averageValidationTime * (this.validationStats.totalValidations - 1) + validationTime) /
                this.validationStats.totalValidations;
        // Track common errors
        for (const error of result.errors) {
            const errorCode = error.code;
            const currentCount = this.validationStats.commonErrors.get(errorCode) || 0;
            this.validationStats.commonErrors.set(errorCode, currentCount + 1);
        }
    }
    /**
     * Load validation rules from file
     */
    async loadValidationRules() {
        try {
            if (fs.existsSync(this.config.validationRulesPath)) {
                const content = fs.readFileSync(this.config.validationRulesPath, 'utf8');
                const rules = yaml.parse(content);
                if (rules.validation_rules) {
                    for (const [ruleName, rule] of Object.entries(rules.validation_rules)) {
                        this.validationRules.set(ruleName, rule);
                    }
                }
            }
        }
        catch (error) {
            console.warn('[BMAD Configuration Validator] Failed to load validation rules:', error.message);
        }
    }
    /**
     * Initialize built-in validators
     */
    async initializeBuiltinValidators() {
        // Version validator
        this.customValidators.set('version_format', (value) => {
            return /^\d+\.\d+\.\d+$/.test(value);
        });
        // Email validator
        this.customValidators.set('email_format', (value) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        });
        // URL validator
        this.customValidators.set('url_format', (value) => {
            try {
                new URL(value);
                return true;
            }
            catch {
                return false;
            }
        });
        // Path validator
        this.customValidators.set('path_format', (value) => {
            return this.isValidPath(value);
        });
    }
    /**
     * Initialize security validators
     */
    async initializeSecurityValidators() {
        // Dangerous command detector
        this.securityRules.set('dangerous_commands', {
            patterns: ['rm', 'mv', 'chmod', 'sudo', 'su', 'passwd', 'chown', 'dd'],
            severity: 'error'
        });
        // Unsafe path detector
        this.securityRules.set('unsafe_paths', {
            patterns: ['/etc/', '/usr/', '/bin/', '/sbin/', '/root/', '../'],
            severity: 'error'
        });
    }
    /**
     * Initialize performance validators
     */
    async initializePerformanceValidators() {
        // Resource limits
        this.performanceRules.set('agent_limit', { max: 20, severity: 'warning' });
        this.performanceRules.set('workflow_limit', { max: 50, severity: 'warning' });
        this.performanceRules.set('file_size_limit', { max: 10485760, severity: 'warning' }); // 10MB
    }
    /**
     * Initialize team-specific validators
     */
    async initializeTeamSpecificValidators() {
        // Cybersec team requirements
        this.teamValidationRules.set('cybersec-team', {
            requiredConfig: {
                'team_specific_config.result': {
                    type: 'string',
                    severity: 'warning',
                    message: 'Security framework should be specified'
                }
            },
            permissions: {
                network: true,
                sensitive_data: true
            }
        });
        // Intel team requirements
        this.teamValidationRules.set('intel-team', {
            requiredConfig: {
                'team_specific_config.result': {
                    type: 'string',
                    severity: 'warning',
                    message: 'Authorization level should be specified'
                }
            },
            permissions: {
                network: true,
                sensitive_data: true
            }
        });
        // Legal team requirements
        this.teamValidationRules.set('legal-team', {
            requiredConfig: {
                'team_specific_config.result': {
                    type: 'string',
                    severity: 'warning',
                    message: 'Primary jurisdiction should be specified'
                }
            },
            permissions: {
                network: false,
                sensitive_data: true
            }
        });
        // Strategy team requirements
        this.teamValidationRules.set('strategy-team', {
            requiredConfig: {
                'team_specific_config.result': {
                    type: 'string',
                    severity: 'warning',
                    message: 'Strategic focus should be specified'
                }
            },
            permissions: {
                network: false,
                sensitive_data: false
            }
        });
    }
    /**
     * Validate team permissions against requirements
     */
    validateTeamPermissions(actualPermissions, requiredPermissions) {
        for (const [permission, required] of Object.entries(requiredPermissions)) {
            if (required && !actualPermissions[permission]) {
                return false;
            }
            if (!required && actualPermissions[permission]) {
                return false; // More permissive than required
            }
        }
        return true;
    }
    /**
     * Validate a requirement against a value
     */
    validateRequirement(value, requirement) {
        if (requirement.required && (value === undefined || value === null)) {
            return false;
        }
        if (requirement.type && typeof value !== requirement.type) {
            return false;
        }
        if (requirement.pattern && !requirement.pattern.test(value)) {
            return false;
        }
        return true;
    }
    /**
     * Check if a path is valid
     */
    isValidPath(pathValue) {
        if (typeof pathValue !== 'string')
            return false;
        // Check for basic path structure
        return pathValue.length > 0 &&
            !pathValue.includes('..') &&
            !pathValue.includes('//') &&
            !/[<>:"|?*]/.test(pathValue);
    }
    /**
     * Check if a path is secure (not in system directories)
     */
    isSecurePath(pathValue) {
        if (!this.isValidPath(pathValue))
            return false;
        const unsafePaths = ['/etc/', '/usr/', '/bin/', '/sbin/', '/root/', '/sys/', '/proc/'];
        const normalizedPath = path.normalize(pathValue);
        return !unsafePaths.some(unsafePath => normalizedPath.startsWith(unsafePath));
    }
    /**
     * Get nested value from object using dot notation
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }
    /**
     * Get validation statistics
     */
    getValidationStatistics() {
        return {
            ...this.validationStats,
            commonErrors: Array.from(this.validationStats.commonErrors.entries())
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10) // Top 10 most common errors
        };
    }
    /**
     * Get validator status
     */
    getStatus() {
        return {
            initialized: true,
            validationRules: this.validationRules.size,
            customValidators: this.customValidators.size,
            securityRules: this.securityRules.size,
            performanceRules: this.performanceRules.size,
            teamValidationRules: this.teamValidationRules.size,
            statistics: this.getValidationStatistics(),
            config: this.config
        };
    }
}
module.exports = BMADConfigurationValidator;
//# sourceMappingURL=bmad-configuration-validator.js.map