/**
 * BMAD Version Compatibility Checker
 * Validates BMAD core and cross-module version requirements
 * Designed by Winston (Architect) for Epic 3: Story 3.2
 *
 * This module provides comprehensive version validation for the BMAD ecosystem,
 * ensuring that all modules are compatible before installation and runtime.
 */

const semver = require('semver');
const fs = require('fs');
const path = require('path');
const yaml = require("js-yaml");
const { normalizeLineEndings } = require('../../../../normalize-line-endings.cjs');

class BMADVersionChecker {
    constructor() {
        this.compatibilityMatrix = new Map();
        this.loadedModules = new Map();
        this.coreVersion = null;
        this.validationCache = new Map();
    }

    /**
     * Initialize the version checker with current BMAD installation
     * @param {string} bmadRootPath - Path to BMAD installation root
     */
    async initialize(bmadRootPath = './_bmad') {
        try {
            this.coreVersion = await this.detectBMADCoreVersion(bmadRootPath);
            await this.loadCompatibilityMatrix();
            await this.scanInstalledModules(bmadRootPath);

            console.log(`[BMAD Version Checker] Initialized with core version: ${this.coreVersion}`);
            return true;
        } catch (error) {
            throw new Error(`Failed to initialize BMAD Version Checker: ${error.message}`);
        }
    }

    /**
     * Detect the current BMAD core version
     * @param {string} bmadRootPath - Path to BMAD installation
     * @returns {string} - BMAD core version
     */
    async detectBMADCoreVersion(bmadRootPath) {
        const possiblePaths = [
            path.join(bmadRootPath, 'package.json'),
            path.join(bmadRootPath, 'core', 'package.json'),
            path.join(bmadRootPath, 'core', 'version.txt'),
            path.join(bmadRootPath, 'VERSION'),
            'package.json' // Fallback to project root
        ];

        for (const versionPath of possiblePaths) {
            try {
                if (fs.existsSync(versionPath)) {
                    if (versionPath.endsWith('.json')) {
                        const packageData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));

                        // Look for BMAD core version in various package.json locations
                        if (packageData.name === 'bmad-core' && packageData.version) {
                            return packageData.version;
                        }
                        if (packageData.dependencies && packageData.dependencies['bmad-core']) {
                            return semver.clean(packageData.dependencies['bmad-core']);
                        }
                        if (packageData.bmadCore && packageData.bmadCore.version) {
                            return packageData.bmadCore.version;
                        }
                    } else {
                        // Plain text version file
                        const version = fs.readFileSync(versionPath, 'utf8').trim();
                        if (semver.valid(version)) {
                            return version;
                        }
                    }
                }
            } catch (error) {
                // Continue to next path
                continue;
            }
        }

        // Default to minimum supported version if not found
        console.warn('[BMAD Version Checker] Could not detect core version, assuming 2.0.0');
        return '2.0.0';
    }

    /**
     * Load compatibility matrix from various sources
     */
    async loadCompatibilityMatrix() {
        // Default compatibility matrix
        const defaultMatrix = {
            '2.0.0': {
                supportedModules: ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'],
                minModuleVersion: '2.0.0',
                maxModuleVersion: '2.9.999',
                criticalAgents: ['abdul', 'bmad-master'],
                essentialWorkflows: ['party-mode', 'cross-module', 'assign-task']
            },
            '2.1.0': {
                supportedModules: ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'],
                minModuleVersion: '2.0.0',
                maxModuleVersion: '2.9.999',
                criticalAgents: ['abdul', 'bmad-master'],
                essentialWorkflows: ['party-mode', 'cross-module', 'assign-task', 'incident-response'],
                newFeatures: ['enhanced-orchestration', 'cross-team-workflows']
            },
            '2.2.0': {
                supportedModules: ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team', 'bmm', 'bmgd'],
                minModuleVersion: '2.1.0',
                maxModuleVersion: '2.9.999',
                criticalAgents: ['abdul', 'bmad-master'],
                essentialWorkflows: ['party-mode', 'cross-module', 'assign-task', 'incident-response'],
                newFeatures: ['module-federation', 'dynamic-loading']
            }
        };

        // Load from file if available
        try {
            const matrixPath = './bmad-compatibility-matrix.yaml';
            if (fs.existsSync(matrixPath)) {
                const matrixData = yaml.parse(normalizeLineEndings(fs.readFileSync(matrixPath, 'utf8')));
                Object.assign(defaultMatrix, matrixData);
            }
        } catch (error) {
            console.warn('[BMAD Version Checker] Using default compatibility matrix');
        }

        this.compatibilityMatrix = new Map(Object.entries(defaultMatrix));
    }

    /**
     * Scan for installed modules and their versions
     * @param {string} bmadRootPath - Path to BMAD installation
     */
    async scanInstalledModules(bmadRootPath) {
        const modulePaths = [
            path.join(bmadRootPath, 'modules'),
            path.join(bmadRootPath, 'specialized-teams'),
            './node_modules/@bmad-cybercommand'
        ];

        for (const modulePath of modulePaths) {
            if (fs.existsSync(modulePath)) {
                const modules = fs.readdirSync(modulePath, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);

                for (const moduleName of modules) {
                    try {
                        const moduleInfo = await this.getModuleInfo(path.join(modulePath, moduleName));
                        if (moduleInfo) {
                            this.loadedModules.set(moduleName, moduleInfo);
                        }
                    } catch (error) {
                        console.warn(`[BMAD Version Checker] Could not load module info for ${moduleName}: ${error.message}`);
                    }
                }
            }
        }

        console.log(`[BMAD Version Checker] Detected ${this.loadedModules.size} installed modules`);
    }

    /**
     * Get module information from its configuration
     * @param {string} modulePath - Path to module directory
     * @returns {Object} - Module information
     */
    async getModuleInfo(modulePath) {
        const configPaths = [
            path.join(modulePath, 'package.json'),
            path.join(modulePath, 'module.yaml'),
            path.join(modulePath, 'dependencies.yaml')
        ];

        for (const configPath of configPaths) {
            try {
                if (fs.existsSync(configPath)) {
                    const content = normalizeLineEndings(fs.readFileSync(configPath, 'utf8'));
                    let config;

                    if (configPath.endsWith('.json')) {
                        config = JSON.parse(content);
                    } else {
                        config = yaml.parse(content);
                    }

                    return {
                        name: config.name || config.code || path.basename(modulePath),
                        version: config.version || '0.0.0',
                        type: config.type || 'unknown',
                        dependencies: config.dependencies || config.bmad_core || {},
                        path: modulePath,
                        config: config
                    };
                }
            } catch (error) {
                continue;
            }
        }

        return null;
    }

    /**
     * Validate if a module version is compatible with current BMAD core
     * @param {string} moduleName - Name of the module
     * @param {string} moduleVersion - Version of the module
     * @param {Object} moduleDependencies - Module dependency requirements
     * @returns {Object} - Validation result
     */
    validateModuleCompatibility(moduleName, moduleVersion, moduleDependencies = {}) {
        const cacheKey = `${moduleName}@${moduleVersion}`;

        if (this.validationCache.has(cacheKey)) {
            return this.validationCache.get(cacheKey);
        }

        const result = {
            compatible: false,
            errors: [],
            warnings: [],
            coreVersion: this.coreVersion,
            moduleVersion: moduleVersion,
            checks: {
                coreVersionMatch: false,
                agentsAvailable: false,
                workflowsAvailable: false,
                dependenciesResolved: false
            }
        };

        try {
            // Check core version compatibility
            const coreCompatibility = this.checkCoreVersionCompatibility(moduleDependencies);
            result.checks.coreVersionMatch = coreCompatibility.compatible;
            if (!coreCompatibility.compatible) {
                result.errors.push(`Core version mismatch: Required ${coreCompatibility.required}, Found ${this.coreVersion}`);
            }

            // Check if required agents are available
            const agentCheck = this.checkRequiredAgents(moduleDependencies);
            result.checks.agentsAvailable = agentCheck.available;
            if (!agentCheck.available) {
                result.errors.push(`Missing required agents: ${agentCheck.missing.join(', ')}`);
            }

            // Check if required workflows are available
            const workflowCheck = this.checkRequiredWorkflows(moduleDependencies);
            result.checks.workflowsAvailable = workflowCheck.available;
            if (!workflowCheck.available) {
                result.warnings.push(`Missing optional workflows: ${workflowCheck.missing.join(', ')}`);
            }

            // Check peer dependencies
            const peerCheck = this.checkPeerDependencies(moduleDependencies);
            result.checks.dependenciesResolved = peerCheck.resolved;
            if (!peerCheck.resolved) {
                result.warnings.push(`Unresolved peer dependencies: ${peerCheck.unresolved.join(', ')}`);
            }

            // Overall compatibility
            result.compatible = result.errors.length === 0;

            // Cache the result
            this.validationCache.set(cacheKey, result);

            return result;

        } catch (error) {
            result.errors.push(`Validation failed: ${error.message}`);
            this.validationCache.set(cacheKey, result);
            return result;
        }
    }

    /**
     * Check if the current BMAD core version is compatible
     * @param {Object} moduleDependencies - Module dependencies
     * @returns {Object} - Compatibility result
     */
    checkCoreVersionCompatibility(moduleDependencies) {
        const requiredVersion = moduleDependencies.bmad_core?.version ||
                               moduleDependencies.core?.[0]?.version ||
                               '>=2.0.0';

        const compatible = semver.satisfies(this.coreVersion, requiredVersion);

        return {
            compatible,
            required: requiredVersion,
            current: this.coreVersion,
            satisfies: compatible
        };
    }

    /**
     * Check if required agents are available
     * @param {Object} moduleDependencies - Module dependencies
     * @returns {Object} - Agent availability result
     */
    checkRequiredAgents(moduleDependencies) {
        const requiredAgents = moduleDependencies.bmad_core?.critical_agents ||
                              moduleDependencies.core?.[0]?.agents ||
                              ['abdul', 'bmad-master'];

        // In a real implementation, this would check the actual BMAD installation
        // For now, we'll assume core agents are always available
        const availableAgents = ['abdul', 'bmad-master'];
        const missing = requiredAgents.filter(agent => !availableAgents.includes(agent));

        return {
            available: missing.length === 0,
            required: requiredAgents,
            missing: missing
        };
    }

    /**
     * Check if required workflows are available
     * @param {Object} moduleDependencies - Module dependencies
     * @returns {Object} - Workflow availability result
     */
    checkRequiredWorkflows(moduleDependencies) {
        const requiredWorkflows = moduleDependencies.bmad_core?.essential_workflows ||
                                 moduleDependencies.core?.[0]?.workflows ||
                                 ['party-mode', 'cross-module'];

        // In a real implementation, this would check the actual BMAD installation
        const availableWorkflows = ['party-mode', 'cross-module', 'assign-task'];
        const missing = requiredWorkflows.filter(workflow => !availableWorkflows.includes(workflow));

        return {
            available: missing.length === 0,
            required: requiredWorkflows,
            missing: missing
        };
    }

    /**
     * Check peer dependencies resolution
     * @param {Object} moduleDependencies - Module dependencies
     * @returns {Object} - Peer dependencies result
     */
    checkPeerDependencies(moduleDependencies) {
        const peerDeps = moduleDependencies.cross_module?.optional ||
                        moduleDependencies.peer_dependencies ||
                        [];

        const unresolved = [];

        for (const peerDep of peerDeps) {
            const moduleName = this.extractModuleName(peerDep.module);
            const installedModule = this.loadedModules.get(moduleName);

            if (peerDep.required && !installedModule) {
                unresolved.push(`${peerDep.module} (required)`);
            } else if (installedModule && !semver.satisfies(installedModule.version, peerDep.version)) {
                unresolved.push(`${peerDep.module} version mismatch`);
            }
        }

        return {
            resolved: unresolved.length === 0,
            unresolved: unresolved
        };
    }

    /**
     * Extract module name from full module identifier
     * @param {string} moduleIdentifier - Full module name (e.g., @bmad-cybercommand/cybersec-team)
     * @returns {string} - Clean module name
     */
    extractModuleName(moduleIdentifier) {
        return moduleIdentifier.split('/').pop();
    }

    /**
     * Validate an entire dependency tree
     * @param {Object} dependencyTree - Dependency configuration
     * @returns {Object} - Comprehensive validation result
     */
    validateDependencyTree(dependencyTree) {
        const result = {
            valid: true,
            modules: new Map(),
            conflicts: [],
            warnings: [],
            summary: {}
        };

        // Validate each module in the dependency tree
        for (const [moduleName, moduleConfig] of Object.entries(dependencyTree)) {
            const validation = this.validateModuleCompatibility(
                moduleName,
                moduleConfig.version,
                moduleConfig
            );

            result.modules.set(moduleName, validation);

            if (!validation.compatible) {
                result.valid = false;
                result.conflicts.push({
                    module: moduleName,
                    errors: validation.errors
                });
            }

            if (validation.warnings.length > 0) {
                result.warnings.push({
                    module: moduleName,
                    warnings: validation.warnings
                });
            }
        }

        // Generate summary
        result.summary = {
            totalModules: result.modules.size,
            compatibleModules: Array.from(result.modules.values()).filter(v => v.compatible).length,
            conflictCount: result.conflicts.length,
            warningCount: result.warnings.length
        };

        return result;
    }

    /**
     * Generate a detailed compatibility report
     * @returns {Object} - Comprehensive compatibility report
     */
    generateCompatibilityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            bmadCore: {
                version: this.coreVersion,
                compatible: true
            },
            installedModules: {},
            compatibilityMatrix: {},
            recommendations: []
        };

        // Analyze each installed module
        for (const [moduleName, moduleInfo] of this.loadedModules) {
            const validation = this.validateModuleCompatibility(
                moduleName,
                moduleInfo.version,
                moduleInfo.dependencies
            );

            report.installedModules[moduleName] = {
                version: moduleInfo.version,
                compatible: validation.compatible,
                checks: validation.checks,
                errors: validation.errors,
                warnings: validation.warnings
            };

            // Generate recommendations
            if (!validation.compatible) {
                report.recommendations.push({
                    type: 'error',
                    module: moduleName,
                    action: 'upgrade_or_remove',
                    details: validation.errors.join('; ')
                });
            } else if (validation.warnings.length > 0) {
                report.recommendations.push({
                    type: 'warning',
                    module: moduleName,
                    action: 'consider_upgrade',
                    details: validation.warnings.join('; ')
                });
            }
        }

        // Add compatibility matrix information
        for (const [version, matrix] of this.compatibilityMatrix) {
            report.compatibilityMatrix[version] = matrix;
        }

        return report;
    }

    /**
     * Check if a module can be safely upgraded
     * @param {string} moduleName - Name of the module
     * @param {string} targetVersion - Target version
     * @returns {Object} - Upgrade safety check result
     */
    checkUpgradeSafety(moduleName, targetVersion) {
        const currentModule = this.loadedModules.get(moduleName);

        if (!currentModule) {
            return {
                safe: false,
                reason: 'Module not currently installed'
            };
        }

        const currentVersion = currentModule.version;

        // Check if it's a safe semantic version upgrade
        const isBreaking = semver.major(targetVersion) > semver.major(currentVersion);
        const isMinor = semver.minor(targetVersion) > semver.minor(currentVersion);
        const isPatch = semver.patch(targetVersion) > semver.patch(currentVersion);

        let safety = 'unknown';
        let reason = '';

        if (isPatch) {
            safety = 'safe';
            reason = 'Patch version upgrade - bug fixes only';
        } else if (isMinor) {
            safety = 'probably_safe';
            reason = 'Minor version upgrade - new features, backward compatible';
        } else if (isBreaking) {
            safety = 'requires_testing';
            reason = 'Major version upgrade - potential breaking changes';
        }

        return {
            safe: safety === 'safe' || safety === 'probably_safe',
            safety: safety,
            reason: reason,
            currentVersion: currentVersion,
            targetVersion: targetVersion,
            recommendedAction: safety === 'requires_testing' ? 'test_before_upgrade' : 'proceed'
        };
    }
}

module.exports = BMADVersionChecker;