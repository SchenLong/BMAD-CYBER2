/**
 * BMAD Dependency Manager
 * Main orchestrator for dependency resolution in distributed BMAD modules
 * Designed by Winston (Architect) for Epic 3: Story 3.2
 *
 * This is the core dependency resolution engine that handles:
 * - Cross-module dependency resolution
 * - Installation order optimization
 * - Conflict detection and resolution
 * - Integration with Amelia's installation framework
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const semver = require('semver');
const { normalizeLineEndings } = require('../../../../normalize-line-endings.cjs');
const BMADVersionChecker = require('./bmad-version-compatibility.js');
const BMADCircularDetector = require('./bmad-circular-detection.js');
const { NetworkResilience } = require('./network-resilience.js');

class BMADDependencyManager {
    constructor(options = {}) {
        this.versionChecker = new BMADVersionChecker();
        this.circularDetector = new BMADCircularDetector();

        // Configuration
        this.config = {
            bmadRoot: options.bmadRoot || './_bmad',
            npmRegistry: options.npmRegistry || 'https://registry.npmjs.org',
            maxRetries: options.maxRetries || 3,
            timeout: options.timeout || 30000,
            retryDelay: options.retryDelay || 1000,
            offlineMode: options.offlineMode || false,
            ...options
        };

        // Network resilience for retry logic, proxy, and offline support (VAL-03-016, VAL-03-018, VAL-03-008)
        this.networkResilience = new NetworkResilience({
            retryAttempts: this.config.maxRetries,
            retryDelay: this.config.retryDelay,
            timeout: this.config.timeout,
            offlineMode: this.config.offlineMode
        });

        // Dependency graph and state
        this.dependencyGraph = new Map();
        this.installationQueue = [];
        this.resolvedDependencies = new Map();
        this.conflicts = [];
        this.specializedTeams = new Set(['cybersec-team', 'intel-team', 'legal-team', 'strategy-team']);

        // Cache for performance
        this.packageInfoCache = new Map();
        this.resolutionCache = new Map();
    }

    /**
     * Initialize the dependency manager
     */
    async initialize() {
        await this.versionChecker.initialize(this.config.bmadRoot);
        this.circularDetector.initialize();

        console.log('[BMAD Dependency Manager] Initialized successfully');
        return true;
    }

    /**
     * Resolve dependencies for a module installation
     * @param {Object} moduleConfig - Module configuration with dependencies
     * @param {Object} installOptions - Installation options
     * @returns {Object} - Resolution result with installation plan
     */
    async resolveDependencies(moduleConfig, installOptions = {}) {
        const startTime = Date.now();

        try {
            console.log(`[BMAD Dependency Manager] Resolving dependencies for ${moduleConfig.name || moduleConfig.code}`);

            // Step 1: Parse and validate module configuration
            const parsedConfig = this.parseModuleConfig(moduleConfig);

            // Step 2: Build dependency graph
            const dependencyGraph = await this.buildDependencyGraph(parsedConfig, installOptions);

            // Step 3: Detect circular dependencies
            const circularCheck = this.circularDetector.detectCircularDependencies(dependencyGraph);
            if (circularCheck.hasCircularDependencies && !installOptions.allowCircular) {
                return {
                    success: false,
                    error: 'Circular dependencies detected',
                    circularDependencies: circularCheck.cycles,
                    resolutionTime: Date.now() - startTime
                };
            }

            // Step 4: Resolve version conflicts
            const resolvedGraph = await this.resolveVersionConflicts(dependencyGraph);

            // Step 5: Create installation order
            const installationPlan = this.createInstallationPlan(resolvedGraph);

            // Step 6: Validate the complete plan
            const validationResult = await this.validateInstallationPlan(installationPlan);

            return {
                success: validationResult.valid,
                installationPlan: installationPlan,
                dependencyGraph: resolvedGraph,
                conflicts: this.conflicts,
                circularDependencies: circularCheck.cycles,
                validation: validationResult,
                resolutionTime: Date.now() - startTime,
                statistics: this.generateResolutionStatistics(resolvedGraph)
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                resolutionTime: Date.now() - startTime
            };
        }
    }

    /**
     * Parse module configuration from various formats
     * @param {Object} moduleConfig - Raw module configuration
     * @returns {Object} - Standardized module configuration
     */
    parseModuleConfig(moduleConfig) {
        // Support multiple configuration formats
        let config = moduleConfig;

        // If it's a file path, load the configuration
        if (typeof moduleConfig === 'string' && fs.existsSync(moduleConfig)) {
            const content = normalizeLineEndings(fs.readFileSync(moduleConfig, 'utf8'));
            if (moduleConfig.endsWith('.yaml') || moduleConfig.endsWith('.yml')) {
                config = yaml.parse(content);
            } else if (moduleConfig.endsWith('.json')) {
                config = JSON.parse(content);
            }
        }

        // Standardize the configuration structure
        return {
            name: config.name || config.code,
            version: config.version || '0.0.0',
            type: config.type || 'specialized-team',
            scope: config.npm?.scope || '@bmad-cybercommand',

            // Dependencies
            bmadCore: this.extractBMADCoreDependency(config),
            runtime: this.extractRuntimeDependencies(config),
            npm: this.extractNPMDependencies(config),
            crossModule: this.extractCrossModuleDependencies(config),
            external: this.extractExternalDependencies(config),

            // Installation configuration
            installation: this.extractInstallationConfig(config),

            // Raw config for reference
            raw: config
        };
    }

    /**
     * Extract BMAD core dependency requirements
     */
    extractBMADCoreDependency(config) {
        const core = config.bmad_core || config.dependencies?.core?.[0];

        return {
            version: core?.version || '>=2.0.0',
            agents: core?.critical_agents || core?.agents || ['abdul', 'bmad-master'],
            workflows: core?.essential_workflows || core?.workflows || ['party-mode', 'cross-module']
        };
    }

    /**
     * Extract runtime dependencies (Node.js, NPM, etc.)
     */
    extractRuntimeDependencies(config) {
        const runtime = config.runtime || {};

        return {
            node: {
                version: runtime.node?.version || '>=18.0.0',
                recommended: runtime.node?.recommended || '20.x'
            },
            npm: {
                version: runtime.npm?.version || '>=8.0.0',
                recommended: runtime.npm?.recommended || '10.x'
            }
        };
    }

    /**
     * Extract NPM package dependencies
     */
    extractNPMDependencies(config) {
        const npmDeps = config.npm_dependencies || {};

        return {
            production: npmDeps.production || [],
            development: npmDeps.development || [],
            optional: npmDeps.optional || []
        };
    }

    /**
     * Extract cross-module dependencies
     */
    extractCrossModuleDependencies(config) {
        const crossModule = config.cross_module || config.dependencies?.peer_dependencies || [];

        return {
            required: crossModule.required || [],
            optional: crossModule.optional || crossModule
        };
    }

    /**
     * Extract external system dependencies
     */
    extractExternalDependencies(config) {
        const external = config.external_systems || {};

        return {
            required: external.required || [],
            optional: external.optional || []
        };
    }

    /**
     * Extract installation configuration
     */
    extractInstallationConfig(config) {
        const installation = config.installation_order || {};

        return {
            phases: installation.phases || [],
            parallel: installation.parallel || false,
            timeout: installation.timeout || 300000 // 5 minutes
        };
    }

    /**
     * Build the complete dependency graph
     * @param {Object} parsedConfig - Parsed module configuration
     * @param {Object} options - Resolution options
     * @returns {Map} - Dependency graph
     */
    async buildDependencyGraph(parsedConfig, options = {}) {
        const graph = new Map();
        const visited = new Set();
        const processing = new Set();

        await this.buildDependencyGraphRecursive(parsedConfig, graph, visited, processing, options);

        this.dependencyGraph = graph;
        return graph;
    }

    /**
     * Recursively build dependency graph
     */
    async buildDependencyGraphRecursive(moduleConfig, graph, visited, processing, options) {
        const moduleId = `${moduleConfig.scope}/${moduleConfig.name}@${moduleConfig.version}`;

        if (processing.has(moduleId)) {
            // Circular dependency detected - will be handled later
            return;
        }

        if (visited.has(moduleId)) {
            return;
        }

        processing.add(moduleId);

        // Add module to graph
        const node = {
            id: moduleId,
            name: moduleConfig.name,
            version: moduleConfig.version,
            type: moduleConfig.type,
            config: moduleConfig,
            dependencies: new Set(),
            dependents: new Set()
        };

        graph.set(moduleId, node);

        // Process cross-module dependencies
        for (const dep of [...moduleConfig.crossModule.required, ...moduleConfig.crossModule.optional]) {
            const depModuleId = this.createModuleId(dep.module, dep.version);

            node.dependencies.add(depModuleId);

            // Load dependency configuration if not already processed
            if (!graph.has(depModuleId) && !processing.has(depModuleId)) {
                try {
                    const depConfig = await this.loadModuleConfig(dep.module, dep.version);
                    if (depConfig) {
                        await this.buildDependencyGraphRecursive(depConfig, graph, visited, processing, options);
                    }
                } catch (error) {
                    if (dep.required !== false) {
                        console.warn(`[BMAD Dependency Manager] Could not load required dependency: ${dep.module}`);
                    }
                }
            }

            // Add reverse dependency
            if (graph.has(depModuleId)) {
                graph.get(depModuleId).dependents.add(moduleId);
            }
        }

        processing.delete(moduleId);
        visited.add(moduleId);
    }

    /**
     * Create a standardized module ID
     */
    createModuleId(moduleName, version) {
        // Handle different module name formats
        if (moduleName.startsWith('@')) {
            return `${moduleName}@${version}`;
        } else if (this.specializedTeams.has(moduleName)) {
            return `@bmad-cybercommand/${moduleName}@${version}`;
        } else {
            return `${moduleName}@${version}`;
        }
    }

    /**
     * Load module configuration by name and version
     */
    async loadModuleConfig(moduleName, version) {
        const cacheKey = `${moduleName}@${version}`;

        if (this.packageInfoCache.has(cacheKey)) {
            return this.packageInfoCache.get(cacheKey);
        }

        try {
            // Try multiple sources for module configuration
            const sources = [
                () => this.loadFromNPMRegistry(moduleName, version),
                () => this.loadFromLocalCache(moduleName, version),
                () => this.loadFromBMADRegistry(moduleName, version)
            ];

            for (const source of sources) {
                try {
                    const config = await source();
                    if (config) {
                        this.packageInfoCache.set(cacheKey, config);
                        return config;
                    }
                } catch (error) {
                    continue;
                }
            }

            return null;
        } catch (error) {
            console.warn(`[BMAD Dependency Manager] Failed to load module config for ${moduleName}: ${error.message}`);
            return null;
        }
    }

    /**
     * Load module configuration from NPM registry
     * Uses network resilience for retry logic and proxy support (VAL-03-016, VAL-03-018)
     */
    async loadFromNPMRegistry(moduleName, version) {
        // Check offline mode (VAL-03-008)
        if (this.networkResilience.isOfflineMode()) {
            console.log(`[BMAD Dependency Manager] Offline mode - skipping NPM registry lookup for ${moduleName}`);
            return null;
        }

        // For specialized teams, return mock configuration (existing behavior)
        if (this.specializedTeams.has(moduleName) || moduleName.includes('@bmad-cybercommand')) {
            return this.createMockSpecializedTeamConfig(moduleName, version);
        }

        // For real NPM packages, fetch with retry logic
        try {
            const packageUrl = `${this.config.npmRegistry}/${encodeURIComponent(moduleName)}`;

            const response = await this.networkResilience.withRetry(
                () => this.networkResilience.makeRequest(packageUrl),
                {
                    operationName: `npm-registry-lookup:${moduleName}`,
                    onRetry: ({ attempt, totalAttempts, error }) => {
                        console.log(
                            `[BMAD Dependency Manager] Retry ${attempt}/${totalAttempts} for ${moduleName}: ${error.message}`
                        );
                    }
                }
            );

            const packageInfo = JSON.parse(response.data);
            const targetVersion = version === 'latest' ? packageInfo['dist-tags']?.latest : version;

            if (packageInfo.versions && packageInfo.versions[targetVersion]) {
                return this.parseModuleConfig(packageInfo.versions[targetVersion]);
            }

            return null;
        } catch (error) {
            console.warn(`[BMAD Dependency Manager] Failed to load ${moduleName} from NPM registry: ${error.message}`);
            return null;
        }
    }

    /**
     * Load module configuration from local cache
     */
    async loadFromLocalCache(moduleName, version) {
        const localPaths = [
            path.join('./node_modules', moduleName, 'dependencies.yaml'),
            path.join('./node_modules', moduleName, 'package.json'),
            path.join(this.config.bmadRoot, 'modules', moduleName, 'module.yaml')
        ];

        for (const configPath of localPaths) {
            try {
                if (fs.existsSync(configPath)) {
                    const content = normalizeLineEndings(fs.readFileSync(configPath, 'utf8'));
                    let config;

                    if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
                        config = yaml.parse(content);
                    } else {
                        config = JSON.parse(content);
                    }

                    return this.parseModuleConfig(config);
                }
            } catch (error) {
                continue;
            }
        }

        return null;
    }

    /**
     * Load module configuration from BMAD registry
     */
    async loadFromBMADRegistry(moduleName, version) {
        // Placeholder for BMAD module registry
        return null;
    }

    /**
     * Create mock configuration for specialized teams
     */
    createMockSpecializedTeamConfig(moduleName, version) {
        const cleanName = moduleName.replace('@bmad-cybercommand/', '');

        return {
            name: cleanName,
            version: version,
            type: 'specialized-team',
            scope: '@bmad-cybercommand',
            bmadCore: { version: '>=2.0.0', agents: ['abdul', 'bmad-master'], workflows: ['party-mode', 'cross-module'] },
            runtime: { node: { version: '>=18.0.0' }, npm: { version: '>=8.0.0' } },
            npm: { production: [], development: [], optional: [] },
            crossModule: { required: [], optional: [] },
            external: { required: [], optional: [] },
            installation: { phases: [], parallel: false },
            raw: { name: cleanName, version: version }
        };
    }

    /**
     * Resolve version conflicts in the dependency graph
     */
    async resolveVersionConflicts(dependencyGraph) {
        const resolvedGraph = new Map();
        const versionRanges = new Map();

        // Collect all version requirements for each module
        for (const [nodeId, node] of dependencyGraph) {
            const moduleName = node.name;

            if (!versionRanges.has(moduleName)) {
                versionRanges.set(moduleName, []);
            }

            versionRanges.get(moduleName).push({
                version: node.version,
                nodeId: nodeId,
                node: node
            });
        }

        // Resolve conflicts for each module
        for (const [moduleName, versions] of versionRanges) {
            if (versions.length === 1) {
                // No conflict - single version
                resolvedGraph.set(versions[0].nodeId, versions[0].node);
            } else {
                // Multiple versions - resolve conflict
                const resolution = this.resolveVersionConflict(moduleName, versions);

                if (resolution.success) {
                    resolvedGraph.set(resolution.selectedNode.nodeId, resolution.selectedNode.node);
                } else {
                    this.conflicts.push({
                        module: moduleName,
                        versions: versions.map(v => v.version),
                        error: resolution.error
                    });
                }
            }
        }

        return resolvedGraph;
    }

    /**
     * Resolve a specific version conflict
     */
    resolveVersionConflict(moduleName, versions) {
        try {
            // Strategy 1: Try to find a version that satisfies all requirements
            const sortedVersions = versions.sort((a, b) => semver.rcompare(a.version, b.version));

            for (const candidate of sortedVersions) {
                const satisfiesAll = versions.every(v =>
                    semver.satisfies(candidate.version, `>=${v.version}`) ||
                    semver.eq(candidate.version, v.version)
                );

                if (satisfiesAll) {
                    return {
                        success: true,
                        selectedNode: candidate,
                        strategy: 'highest_compatible'
                    };
                }
            }

            // Strategy 2: Select the highest version and warn about potential incompatibility
            const highest = sortedVersions[0];
            return {
                success: true,
                selectedNode: highest,
                strategy: 'highest_version',
                warning: `Selected highest version ${highest.version} but compatibility not guaranteed`
            };

        } catch (error) {
            return {
                success: false,
                error: `Failed to resolve version conflict for ${moduleName}: ${error.message}`
            };
        }
    }

    /**
     * Create installation plan with proper ordering
     */
    createInstallationPlan(dependencyGraph) {
        const plan = {
            phases: [],
            parallelGroups: [],
            totalModules: dependencyGraph.size,
            estimatedTime: 0
        };

        // Topological sort for installation order
        const visited = new Set();
        const visiting = new Set();
        const sorted = [];

        const topologicalSort = (nodeId) => {
            if (visiting.has(nodeId)) {
                // Circular dependency - skip
                return;
            }
            if (visited.has(nodeId)) {
                return;
            }

            visiting.add(nodeId);
            const node = dependencyGraph.get(nodeId);

            if (node) {
                for (const depId of node.dependencies) {
                    if (dependencyGraph.has(depId)) {
                        topologicalSort(depId);
                    }
                }
            }

            visiting.delete(nodeId);
            visited.add(nodeId);
            sorted.push(nodeId);
        };

        // Sort all nodes
        for (const nodeId of dependencyGraph.keys()) {
            topologicalSort(nodeId);
        }

        // Create installation phases
        const phases = this.createInstallationPhases(sorted, dependencyGraph);

        plan.phases = phases.map((phase, index) => ({
            phase: index + 1,
            name: this.getPhaseLabel(index),
            modules: phase,
            canRunInParallel: this.canPhaseRunInParallel(phase, dependencyGraph),
            estimatedTime: this.estimatePhaseTime(phase)
        }));

        plan.estimatedTime = plan.phases.reduce((total, phase) => total + phase.estimatedTime, 0);

        return plan;
    }

    /**
     * Create installation phases from sorted modules
     */
    createInstallationPhases(sortedModules, dependencyGraph) {
        const phases = [];
        const moduleToPhase = new Map();

        for (const moduleId of sortedModules) {
            const node = dependencyGraph.get(moduleId);
            if (!node) continue;

            // Find the minimum phase based on dependencies
            let minPhase = 0;

            for (const depId of node.dependencies) {
                if (moduleToPhase.has(depId)) {
                    minPhase = Math.max(minPhase, moduleToPhase.get(depId) + 1);
                }
            }

            // Ensure we have enough phases
            while (phases.length <= minPhase) {
                phases.push([]);
            }

            phases[minPhase].push(moduleId);
            moduleToPhase.set(moduleId, minPhase);
        }

        return phases;
    }

    /**
     * Get human-readable phase label
     */
    getPhaseLabel(phaseIndex) {
        const labels = [
            'Core Dependencies',
            'Foundation Modules',
            'Specialized Teams',
            'Integration Modules',
            'Extension Modules'
        ];

        return labels[phaseIndex] || `Phase ${phaseIndex + 1}`;
    }

    /**
     * Check if a phase can run modules in parallel
     */
    canPhaseRunInParallel(phaseModules, dependencyGraph) {
        // Check if any modules in this phase depend on each other
        for (let i = 0; i < phaseModules.length; i++) {
            for (let j = i + 1; j < phaseModules.length; j++) {
                const nodeA = dependencyGraph.get(phaseModules[i]);
                const nodeB = dependencyGraph.get(phaseModules[j]);

                if (nodeA && nodeB &&
                    (nodeA.dependencies.has(phaseModules[j]) || nodeB.dependencies.has(phaseModules[i]))) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Estimate installation time for a phase
     */
    estimatePhaseTime(phaseModules) {
        // Base time per module: 30 seconds
        // Additional time for specialized teams: +60 seconds
        const baseTime = 30000; // 30 seconds
        const specializedTeamTime = 60000; // 1 minute

        let totalTime = 0;

        for (const moduleId of phaseModules) {
            totalTime += baseTime;

            if (moduleId.includes('@bmad-cybercommand')) {
                totalTime += specializedTeamTime;
            }
        }

        return totalTime;
    }

    /**
     * Validate the complete installation plan
     */
    async validateInstallationPlan(installationPlan) {
        const validationResult = {
            valid: true,
            errors: [],
            warnings: [],
            checks: {
                dependencyOrder: false,
                versionCompatibility: false,
                circularDependencies: false,
                resourceRequirements: false
            }
        };

        try {
            // Check 1: Dependency ordering
            const orderCheck = this.validateDependencyOrder(installationPlan);
            validationResult.checks.dependencyOrder = orderCheck.valid;
            if (!orderCheck.valid) {
                validationResult.errors.push(...orderCheck.errors);
            }

            // Check 2: Version compatibility
            const versionCheck = await this.validateVersionCompatibility(installationPlan);
            validationResult.checks.versionCompatibility = versionCheck.valid;
            if (!versionCheck.valid) {
                validationResult.errors.push(...versionCheck.errors);
            }

            // Check 3: Circular dependencies
            const circularCheck = this.circularDetector.validateInstallationPlan(installationPlan);
            validationResult.checks.circularDependencies = !circularCheck.hasCircularDependencies;
            if (circularCheck.hasCircularDependencies) {
                validationResult.warnings.push(`Circular dependencies detected: ${circularCheck.cycles.length} cycles`);
            }

            // Check 4: Resource requirements
            const resourceCheck = this.validateResourceRequirements(installationPlan);
            validationResult.checks.resourceRequirements = resourceCheck.valid;
            if (!resourceCheck.valid) {
                validationResult.warnings.push(...resourceCheck.warnings);
            }

            validationResult.valid = validationResult.errors.length === 0;

        } catch (error) {
            validationResult.valid = false;
            validationResult.errors.push(`Validation failed: ${error.message}`);
        }

        return validationResult;
    }

    /**
     * Validate dependency ordering in installation plan
     */
    validateDependencyOrder(installationPlan) {
        const result = { valid: true, errors: [] };
        const installedModules = new Set();

        for (const phase of installationPlan.phases) {
            for (const moduleId of phase.modules) {
                const node = this.dependencyGraph.get(moduleId);
                if (node) {
                    // Check if all dependencies are already installed
                    for (const depId of node.dependencies) {
                        if (!installedModules.has(depId)) {
                            result.valid = false;
                            result.errors.push(`Module ${moduleId} depends on ${depId} which is not yet installed`);
                        }
                    }
                }
                installedModules.add(moduleId);
            }
        }

        return result;
    }

    /**
     * Validate version compatibility across all modules
     */
    async validateVersionCompatibility(installationPlan) {
        const result = { valid: true, errors: [], warnings: [] };

        for (const phase of installationPlan.phases) {
            for (const moduleId of phase.modules) {
                const node = this.dependencyGraph.get(moduleId);
                if (node) {
                    const validation = this.versionChecker.validateModuleCompatibility(
                        node.name,
                        node.version,
                        node.config
                    );

                    if (!validation.compatible) {
                        result.valid = false;
                        result.errors.push(...validation.errors);
                    }

                    if (validation.warnings.length > 0) {
                        result.warnings.push(...validation.warnings);
                    }
                }
            }
        }

        return result;
    }

    /**
     * Validate resource requirements
     */
    validateResourceRequirements(installationPlan) {
        const result = { valid: true, warnings: [] };

        // Check total estimated time
        if (installationPlan.estimatedTime > 600000) { // 10 minutes
            result.warnings.push(`Installation may take longer than expected: ${Math.round(installationPlan.estimatedTime / 60000)} minutes`);
        }

        // Check number of modules
        if (installationPlan.totalModules > 10) {
            result.warnings.push(`Installing ${installationPlan.totalModules} modules - ensure sufficient disk space`);
        }

        return result;
    }

    /**
     * Generate resolution statistics
     */
    generateResolutionStatistics(dependencyGraph) {
        const stats = {
            totalModules: dependencyGraph.size,
            specializedTeams: 0,
            coreModules: 0,
            totalDependencies: 0,
            averageDependenciesPerModule: 0,
            conflictsResolved: this.conflicts.length,
            circularDependencies: 0
        };

        for (const [nodeId, node] of dependencyGraph) {
            stats.totalDependencies += node.dependencies.size;

            if (nodeId.includes('@bmad-cybercommand')) {
                stats.specializedTeams++;
            } else {
                stats.coreModules++;
            }
        }

        stats.averageDependenciesPerModule = stats.totalModules > 0
            ? Math.round((stats.totalDependencies / stats.totalModules) * 100) / 100
            : 0;

        return stats;
    }

    /**
     * Execute the installation plan (integration with Amelia's framework)
     * @param {Object} installationPlan - The validated installation plan
     * @param {Object} options - Execution options
     * @returns {Object} - Execution result
     */
    async executeInstallationPlan(installationPlan, options = {}) {
        const executionResult = {
            success: true,
            completedPhases: 0,
            installedModules: [],
            failedModules: [],
            warnings: [],
            executionTime: 0
        };

        const startTime = Date.now();

        try {
            console.log('[BMAD Dependency Manager] Starting installation execution...');

            for (let i = 0; i < installationPlan.phases.length; i++) {
                const phase = installationPlan.phases[i];
                console.log(`[BMAD Dependency Manager] Executing ${phase.name} (${phase.modules.length} modules)`);

                const phaseResult = await this.executePhase(phase, options);

                if (phaseResult.success) {
                    executionResult.completedPhases++;
                    executionResult.installedModules.push(...phaseResult.installedModules);
                } else {
                    executionResult.success = false;
                    executionResult.failedModules.push(...phaseResult.failedModules);

                    if (!options.continueOnFailure) {
                        break;
                    }
                }

                executionResult.warnings.push(...phaseResult.warnings);
            }

        } catch (error) {
            executionResult.success = false;
            executionResult.error = error.message;
        } finally {
            executionResult.executionTime = Date.now() - startTime;
        }

        return executionResult;
    }

    /**
     * Execute a single installation phase
     */
    async executePhase(phase, options = {}) {
        const phaseResult = {
            success: true,
            installedModules: [],
            failedModules: [],
            warnings: []
        };

        if (phase.canRunInParallel && !options.sequential) {
            // Execute modules in parallel
            const modulePromises = phase.modules.map(moduleId => this.installModule(moduleId, options));
            const results = await Promise.allSettled(modulePromises);

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const moduleId = phase.modules[i];

                if (result.status === 'fulfilled' && result.value.success) {
                    phaseResult.installedModules.push(moduleId);
                } else {
                    phaseResult.success = false;
                    phaseResult.failedModules.push(moduleId);
                    phaseResult.warnings.push(`Failed to install ${moduleId}: ${result.reason || result.value?.error}`);
                }
            }
        } else {
            // Execute modules sequentially
            for (const moduleId of phase.modules) {
                try {
                    const result = await this.installModule(moduleId, options);

                    if (result.success) {
                        phaseResult.installedModules.push(moduleId);
                    } else {
                        phaseResult.success = false;
                        phaseResult.failedModules.push(moduleId);
                        phaseResult.warnings.push(`Failed to install ${moduleId}: ${result.error}`);

                        if (!options.continueOnFailure) {
                            break;
                        }
                    }
                } catch (error) {
                    phaseResult.success = false;
                    phaseResult.failedModules.push(moduleId);
                    phaseResult.warnings.push(`Exception installing ${moduleId}: ${error.message}`);

                    if (!options.continueOnFailure) {
                        break;
                    }
                }
            }
        }

        return phaseResult;
    }

    /**
     * Install a single module (integration point with Amelia's installation framework)
     * Uses network resilience for retry logic (VAL-03-016)
     */
    async installModule(moduleId, options = {}) {
        try {
            const node = this.dependencyGraph.get(moduleId);
            if (!node) {
                return { success: false, error: 'Module not found in dependency graph' };
            }

            console.log(`[BMAD Dependency Manager] Installing module: ${moduleId}`);

            // Use retry logic for installation (VAL-03-016)
            const installResult = await this.networkResilience.withRetry(
                async () => {
                    // This is where we would integrate with Amelia's installation framework
                    // For now, we'll simulate the installation process
                    const result = await this.simulateModuleInstallation(node, options);

                    if (!result.success) {
                        const error = new Error(result.error || 'Installation failed');
                        // Mark certain errors as retryable
                        if (result.error?.includes('network') || result.error?.includes('timeout')) {
                            error.code = 'ECONNRESET';
                        }
                        throw error;
                    }

                    return result;
                },
                {
                    operationName: `install-module:${moduleId}`,
                    retryAttempts: options.retryAttempts || this.config.maxRetries,
                    onRetry: ({ attempt, totalAttempts, error }) => {
                        console.log(
                            `[BMAD Dependency Manager] Installation retry ${attempt}/${totalAttempts} for ${moduleId}: ${error.message}`
                        );
                    }
                }
            );

            if (installResult.success) {
                console.log(`[BMAD Dependency Manager] Successfully installed: ${moduleId}`);
            }

            return installResult;

        } catch (error) {
            console.error(`[BMAD Dependency Manager] Failed to install: ${moduleId} - ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Simulate module installation (placeholder for Amelia's integration)
     */
    async simulateModuleInstallation(node, options = {}) {
        // Simulate installation time
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

        // Simulate occasional failures for testing
        if (Math.random() < 0.05 && !options.mockSuccess) {
            return {
                success: false,
                error: 'Simulated installation failure'
            };
        }

        return {
            success: true,
            installedPath: `./node_modules/${node.name}`,
            executionTime: Math.random() * 1000 + 500
        };
    }

    /**
     * Get dependency resolution summary
     */
    getResolutionSummary() {
        return {
            dependencyGraph: this.dependencyGraph,
            conflicts: this.conflicts,
            resolvedDependencies: this.resolvedDependencies,
            installationQueue: this.installationQueue,
            cacheStats: {
                packageInfoCache: this.packageInfoCache.size,
                resolutionCache: this.resolutionCache.size
            }
        };
    }

    /**
     * Clean up manager resources
     */
    cleanup() {
        this.packageInfoCache.clear();
        this.resolutionCache.clear();
        this.dependencyGraph.clear();
        this.resolvedDependencies.clear();
        this.conflicts = [];
        this.installationQueue = [];
    }

    /**
     * Check network connectivity and return status
     * @returns {Promise<Object>} - Connectivity status
     */
    async checkNetworkConnectivity() {
        return this.networkResilience.checkConnectivity(this.config.npmRegistry + '/-/ping');
    }

    /**
     * Enable offline mode for installations
     */
    enableOfflineMode() {
        this.networkResilience.enableOfflineMode();
    }

    /**
     * Disable offline mode
     */
    disableOfflineMode() {
        this.networkResilience.disableOfflineMode();
    }

    /**
     * Get network configuration summary for diagnostics
     * @returns {Object} - Network configuration summary
     */
    getNetworkConfig() {
        return this.networkResilience.getConfigSummary();
    }
}

module.exports = BMADDependencyManager;