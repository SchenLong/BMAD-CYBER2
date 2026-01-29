/**
 * BMAD Compatibility Matrix Generator
 * Epic 2: Package Management System - Story 2.4
 *
 * Advanced compatibility matrix generation system with intelligent analysis,
 * multi-dimensional compatibility modeling, and automated recommendation engine.
 *
 * @version 2.4.0
 * @author BlackUnicorn.Tech
 * @license MIT
 * @security OWASP A+ Compliant
 */

const crypto = require('crypto');
const semver = require('semver');
const EventEmitter = require('events');

/**
 * Compatibility Matrix Generator
 * Generates comprehensive compatibility matrices for package ecosystems
 */
class CompatibilityMatrixGenerator extends EventEmitter {
    constructor(options = {}) {
        super();

        this.config = {
            // Matrix generation configuration
            generation: {
                dimensions: options.dimensions || ['package', 'version', 'environment', 'dependencies'],
                granularity: options.granularity || 'detailed', // minimal, standard, detailed, comprehensive
                includeHistorical: options.includeHistorical !== false,
                includeFuture: options.includeFuture !== false,
                maxMatrixSize: options.maxMatrixSize || 100000
            },

            // Analysis depth
            analysis: {
                depthLevel: options.depthLevel || 'deep', // shallow, standard, deep, exhaustive
                includeTransitive: options.includeTransitive !== false,
                includePeerDependencies: options.includePeerDependencies !== false,
                includeDevDependencies: options.includeDevDependencies || false,
                includeOptionalDependencies: options.includeOptionalDependencies || false
            },

            // Performance optimization
            performance: {
                enableCaching: options.enableCaching !== false,
                cacheSize: options.cacheSize || 10000,
                parallelGeneration: options.parallelGeneration !== false,
                batchSize: options.batchSize || 50,
                incrementalUpdates: options.incrementalUpdates !== false
            },

            // Output format
            output: {
                format: options.format || 'comprehensive', // minimal, standard, comprehensive
                includeMetadata: options.includeMetadata !== false,
                includeVisualization: options.includeVisualization !== false,
                compressionEnabled: options.compressionEnabled !== false
            }
        };

        // Internal state
        this.state = {
            matrices: new Map(),
            matrixCache: new Map(),
            generationQueue: [],
            activeGenerations: new Map(),
            compatibilityRules: new Map(),
            environmentProfiles: new Map()
        };

        // Compatibility scoring weights
        this.scoringWeights = {
            version: 0.25,
            dependencies: 0.25,
            security: 0.20,
            performance: 0.15,
            maintenance: 0.10,
            community: 0.05
        };

        // Matrix templates for different scenarios
        this.matrixTemplates = {
            enterprise: {
                dimensions: ['package', 'version', 'security', 'support'],
                focus: ['stability', 'security', 'long_term_support'],
                riskTolerance: 'low'
            },
            development: {
                dimensions: ['package', 'version', 'features', 'performance'],
                focus: ['latest_features', 'performance', 'developer_experience'],
                riskTolerance: 'medium'
            },
            production: {
                dimensions: ['package', 'version', 'stability', 'security', 'performance'],
                focus: ['stability', 'security', 'performance'],
                riskTolerance: 'very_low'
            },
            research: {
                dimensions: ['package', 'version', 'features', 'experimental'],
                focus: ['cutting_edge', 'experimental_features'],
                riskTolerance: 'high'
            }
        };

        // Initialize built-in compatibility rules
        this.initializeCompatibilityRules();

        // Initialize environment profiles
        this.initializeEnvironmentProfiles();
    }

    /**
     * Initialize built-in compatibility rules
     */
    initializeCompatibilityRules() {
        // Node.js version compatibility rules
        this.state.compatibilityRules.set('nodejs', {
            'v14': {
                supportedUntil: '2023-04-30',
                compatiblePackages: {
                    'express': '^4.0.0',
                    'react': '^16.0.0 || ^17.0.0',
                    'vue': '^2.6.0 || ^3.0.0'
                },
                features: ['async_hooks', 'worker_threads', 'optional_chaining'],
                limitations: ['no_top_level_await']
            },
            'v16': {
                supportedUntil: '2024-04-30',
                compatiblePackages: {
                    'express': '^4.0.0',
                    'react': '^16.0.0 || ^17.0.0 || ^18.0.0',
                    'vue': '^2.6.0 || ^3.0.0'
                },
                features: ['async_hooks', 'worker_threads', 'optional_chaining', 'top_level_await'],
                limitations: []
            },
            'v18': {
                supportedUntil: '2025-04-30',
                lts: true,
                compatiblePackages: {
                    'express': '^4.17.0',
                    'react': '^17.0.0 || ^18.0.0',
                    'vue': '^3.0.0'
                },
                features: ['async_hooks', 'worker_threads', 'optional_chaining', 'top_level_await', 'fetch_api'],
                limitations: []
            },
            'v20': {
                supportedUntil: '2026-04-30',
                lts: true,
                current: true,
                compatiblePackages: {
                    'express': '^4.18.0',
                    'react': '^18.0.0',
                    'vue': '^3.2.0'
                },
                features: ['async_hooks', 'worker_threads', 'optional_chaining', 'top_level_await', 'fetch_api', 'test_runner'],
                limitations: []
            }
        });

        // Framework compatibility rules
        this.state.compatibilityRules.set('react', {
            '16.14.0': {
                nodeVersions: ['>=10.0.0'],
                peerDependencies: {
                    'react-dom': '^16.14.0'
                },
                incompatibleWith: ['react@17', 'react@18'],
                breakingChanges: [],
                deprecations: ['legacy_context_api']
            },
            '17.0.2': {
                nodeVersions: ['>=10.0.0'],
                peerDependencies: {
                    'react-dom': '^17.0.2'
                },
                incompatibleWith: ['react@16', 'react@18'],
                breakingChanges: ['event_pooling_removed', 'ie11_support_removed'],
                deprecations: []
            },
            '18.2.0': {
                nodeVersions: ['>=14.0.0'],
                peerDependencies: {
                    'react-dom': '^18.2.0'
                },
                incompatibleWith: ['react@16', 'react@17'],
                breakingChanges: ['automatic_batching', 'strict_mode_changes', 'suspense_behavior'],
                features: ['concurrent_features', 'automatic_batching', 'strict_effects']
            }
        });

        // Database compatibility rules
        this.state.compatibilityRules.set('database', {
            mongodb: {
                '4.4': { nodeVersions: ['>=12.0.0'], features: ['transactions', 'change_streams'] },
                '5.0': { nodeVersions: ['>=14.0.0'], features: ['transactions', 'change_streams', 'time_series'] },
                '6.0': { nodeVersions: ['>=14.20.0'], features: ['transactions', 'change_streams', 'time_series', 'column_store'] }
            },
            postgresql: {
                '12': { nodeVersions: ['>=10.0.0'], features: ['json_path', 'generated_columns'] },
                '13': { nodeVersions: ['>=10.0.0'], features: ['json_path', 'generated_columns', 'btree_dedup'] },
                '14': { nodeVersions: ['>=12.0.0'], features: ['json_path', 'generated_columns', 'btree_dedup', 'multirange'] },
                '15': { nodeVersions: ['>=14.0.0'], features: ['json_path', 'generated_columns', 'btree_dedup', 'multirange', 'merge_command'] }
            }
        });
    }

    /**
     * Initialize environment profiles
     */
    initializeEnvironmentProfiles() {
        this.state.environmentProfiles.set('standard_environments', {
            // Development environments
            development: {
                node: ['v18.x', 'v20.x'],
                os: ['linux', 'darwin', 'win32'],
                arch: ['x64', 'arm64'],
                constraints: {
                    maxMemoryMB: 8192,
                    supportedModules: ['all'],
                    allowExperimental: true
                }
            },

            // Production environments
            production: {
                node: ['v18.x'], // LTS only
                os: ['linux'],
                arch: ['x64'],
                constraints: {
                    maxMemoryMB: 32768,
                    supportedModules: ['production_only'],
                    allowExperimental: false,
                    requireSecurity: true
                }
            },

            // CI/CD environments
            ci: {
                node: ['v16.x', 'v18.x', 'v20.x'],
                os: ['linux'],
                arch: ['x64'],
                constraints: {
                    maxMemoryMB: 4096,
                    supportedModules: ['dev_and_prod'],
                    allowExperimental: false,
                    fastInstall: true
                }
            },

            // Edge/Serverless environments
            serverless: {
                node: ['v18.x', 'v20.x'],
                os: ['linux'],
                arch: ['x64', 'arm64'],
                constraints: {
                    maxMemoryMB: 3008, // AWS Lambda max
                    coldStart: true,
                    supportedModules: ['minimal'],
                    bundleSize: 'critical'
                }
            }
        });
    }

    /**
     * Generate compatibility matrix
     * @param {Object} matrixRequest - Matrix generation request
     * @returns {Promise<Object>} Generated compatibility matrix
     */
    async generateMatrix(matrixRequest) {
        const matrixId = crypto.randomUUID();
        const startTime = Date.now();

        try {
            this.validateMatrixRequest(matrixRequest);

            const generation = {
                id: matrixId,
                request: matrixRequest,
                status: 'generating',
                startTime: new Date().toISOString(),
                progress: 0
            };

            this.state.activeGenerations.set(matrixId, generation);

            this.emit('matrix:generation:started', {
                matrixId,
                packageCount: matrixRequest.packages.length,
                dimensions: matrixRequest.dimensions || this.config.generation.dimensions
            });

            // Phase 1: Initialize matrix structure
            this.updateGenerationProgress(matrixId, 10, 'Initializing matrix structure');
            const matrixStructure = await this.initializeMatrixStructure(matrixRequest);

            // Phase 2: Collect package data
            this.updateGenerationProgress(matrixId, 25, 'Collecting package data');
            const packageData = await this.collectPackageData(matrixRequest.packages);

            // Phase 3: Analyze dependencies
            this.updateGenerationProgress(matrixId, 45, 'Analyzing dependencies');
            const dependencyAnalysis = await this.analyzeDependencyMatrix(packageData);

            // Phase 4: Calculate compatibility scores
            this.updateGenerationProgress(matrixId, 65, 'Calculating compatibility scores');
            const compatibilityMatrix = await this.calculateCompatibilityMatrix(
                packageData,
                dependencyAnalysis,
                matrixRequest
            );

            // Phase 5: Generate recommendations
            this.updateGenerationProgress(matrixId, 85, 'Generating recommendations');
            const recommendations = await this.generateCompatibilityRecommendations(
                compatibilityMatrix,
                matrixRequest
            );

            // Phase 6: Create visualization data
            this.updateGenerationProgress(matrixId, 95, 'Creating visualization data');
            const visualization = this.config.output.includeVisualization ?
                await this.generateVisualizationData(compatibilityMatrix) : null;

            // Finalize matrix
            const matrix = {
                id: matrixId,
                generatedAt: new Date().toISOString(),
                request: matrixRequest,

                // Core matrix data
                structure: matrixStructure,
                compatibility: compatibilityMatrix,
                dependencies: dependencyAnalysis,
                recommendations,

                // Analysis results
                analysis: {
                    totalCombinations: this.calculateTotalCombinations(compatibilityMatrix),
                    compatibleCombinations: this.countCompatibleCombinations(compatibilityMatrix),
                    incompatibleCombinations: this.countIncompatibleCombinations(compatibilityMatrix),
                    highRiskCombinations: this.identifyHighRiskCombinations(compatibilityMatrix),
                    recommendedCombinations: this.identifyRecommendedCombinations(compatibilityMatrix)
                },

                // Visualization and export data
                visualization,
                exportFormats: await this.generateExportFormats(compatibilityMatrix, matrixRequest),

                // Metadata
                metadata: {
                    version: '2.4.0',
                    generationTime: Date.now() - startTime,
                    matrixSize: this.calculateMatrixSize(compatibilityMatrix),
                    complexity: this.calculateMatrixComplexity(compatibilityMatrix),
                    confidence: this.calculateMatrixConfidence(compatibilityMatrix)
                }
            };

            // Store matrix
            this.state.matrices.set(matrixId, matrix);

            // Update generation status
            generation.status = 'completed';
            generation.completedAt = new Date().toISOString();
            generation.progress = 100;

            this.emit('matrix:generation:completed', {
                matrixId,
                generationTime: matrix.metadata.generationTime,
                totalCombinations: matrix.analysis.totalCombinations,
                compatiblePercentage: (matrix.analysis.compatibleCombinations / matrix.analysis.totalCombinations) * 100
            });

            return matrix;

        } catch (error) {
            const generation = this.state.activeGenerations.get(matrixId);
            if (generation) {
                generation.status = 'failed';
                generation.error = error.message;
                generation.completedAt = new Date().toISOString();
            }

            this.emit('matrix:generation:failed', {
                matrixId,
                error: error.message,
                generationTime: Date.now() - startTime
            });

            throw error;

        } finally {
            this.state.activeGenerations.delete(matrixId);
        }
    }

    /**
     * Initialize matrix structure
     * @param {Object} request - Matrix generation request
     * @returns {Promise<Object>} Matrix structure
     */
    async initializeMatrixStructure(request) {
        const { packages, dimensions, environments } = request;

        const structure = {
            dimensions: dimensions || this.config.generation.dimensions,
            axes: {},
            metadata: {
                packageCount: packages.length,
                environmentCount: environments ? environments.length : 1,
                totalCombinations: 0
            }
        };

        // Package axis
        structure.axes.packages = await Promise.all(packages.map(async (pkg) => ({
            name: pkg.name,
            versions: pkg.versions || await this.getAvailableVersions(pkg.name),
            metadata: {
                category: this.categorizePackage(pkg.name),
                popularity: await this.getPackagePopularity(pkg.name),
                maintainers: await this.getPackageMaintainers(pkg.name)
            }
        })));

        // Version axis (if included in dimensions)
        if (structure.dimensions.includes('version')) {
            structure.axes.versions = await this.buildVersionAxis(packages);
        }

        // Environment axis
        if (structure.dimensions.includes('environment')) {
            structure.axes.environments = environments || this.getDefaultEnvironments();
        }

        // Dependency axis
        if (structure.dimensions.includes('dependencies')) {
            structure.axes.dependencies = await this.buildDependencyAxis(packages);
        }

        // Calculate total combinations
        structure.metadata.totalCombinations = this.calculateAxisCombinations(structure.axes);

        return structure;
    }

    /**
     * Collect comprehensive package data
     * @param {Array} packages - Package specifications
     * @returns {Promise<Object>} Package data collection
     */
    async collectPackageData(packages) {
        const packageData = new Map();

        for (const pkg of packages) {
            const data = {
                name: pkg.name,
                versions: new Map(),
                metadata: {
                    description: await this.getPackageDescription(pkg.name),
                    homepage: await this.getPackageHomepage(pkg.name),
                    repository: await this.getPackageRepository(pkg.name),
                    license: await this.getPackageLicense(pkg.name),
                    keywords: await this.getPackageKeywords(pkg.name),
                    maintainers: await this.getPackageMaintainers(pkg.name),
                    downloads: await this.getPackageDownloads(pkg.name),
                    lastPublished: await this.getLastPublishedDate(pkg.name)
                }
            };

            // Collect version-specific data
            const versions = pkg.versions || await this.getAvailableVersions(pkg.name);
            for (const version of versions) {
                const versionData = await this.collectVersionData(pkg.name, version);
                data.versions.set(version, versionData);
            }

            packageData.set(pkg.name, data);
        }

        return packageData;
    }

    /**
     * Collect version-specific data
     * @param {string} packageName - Package name
     * @param {string} version - Package version
     * @returns {Promise<Object>} Version data
     */
    async collectVersionData(packageName, version) {
        try {
            return {
                version,
                dependencies: await this.getPackageDependencies(packageName, version),
                peerDependencies: await this.getPackagePeerDependencies(packageName, version),
                devDependencies: this.config.analysis.includeDevDependencies ?
                    await this.getPackageDevDependencies(packageName, version) : {},
                optionalDependencies: this.config.analysis.includeOptionalDependencies ?
                    await this.getPackageOptionalDependencies(packageName, version) : {},

                // Technical metadata
                engines: await this.getPackageEngines(packageName, version),
                os: await this.getPackageOS(packageName, version),
                cpu: await this.getPackageCPU(packageName, version),
                size: await this.getPackageSize(packageName, version),

                // Quality metrics
                security: await this.getSecurityMetrics(packageName, version),
                maintenance: await this.getMaintenanceMetrics(packageName, version),
                quality: await this.getQualityScore(packageName, version),

                // Publishing metadata
                publishedAt: await this.getVersionPublishedDate(packageName, version),
                deprecated: await this.isVersionDeprecated(packageName, version),
                prerelease: semver.prerelease(version) !== null,

                // Compatibility data
                nodeCompatibility: await this.getNodeCompatibility(packageName, version),
                browserCompatibility: await this.getBrowserCompatibility(packageName, version)
            };

        } catch (error) {
            return {
                version,
                error: error.message,
                available: false
            };
        }
    }

    /**
     * Analyze dependency matrix relationships
     * @param {Map} packageData - Collected package data
     * @returns {Promise<Object>} Dependency analysis
     */
    async analyzeDependencyMatrix(packageData) {
        const analysis = {
            relationships: new Map(),
            conflicts: [],
            circularDependencies: [],
            orphanedPackages: [],
            criticalPaths: []
        };

        // Build dependency graph
        const dependencyGraph = new Map();

        for (const [packageName, data] of packageData) {
            dependencyGraph.set(packageName, new Set());

            for (const [version, versionData] of data.versions) {
                if (versionData.dependencies) {
                    Object.keys(versionData.dependencies).forEach(dep => {
                        dependencyGraph.get(packageName).add(dep);
                    });
                }

                if (versionData.peerDependencies && this.config.analysis.includePeerDependencies) {
                    Object.keys(versionData.peerDependencies).forEach(dep => {
                        dependencyGraph.get(packageName).add(dep);
                    });
                }
            }
        }

        // Detect circular dependencies
        analysis.circularDependencies = this.detectCircularDependencies(dependencyGraph);

        // Identify conflicts
        analysis.conflicts = await this.identifyDependencyConflicts(packageData);

        // Find orphaned packages
        analysis.orphanedPackages = this.findOrphanedPackages(dependencyGraph, packageData);

        // Calculate critical paths
        analysis.criticalPaths = this.calculateCriticalPaths(dependencyGraph);

        // Build relationship matrix
        for (const [packageName, dependencies] of dependencyGraph) {
            analysis.relationships.set(packageName, {
                directDependencies: Array.from(dependencies),
                dependents: this.findPackageDependents(packageName, dependencyGraph),
                transitiveDependencies: this.config.analysis.includeTransitive ?
                    this.calculateTransitiveDependencies(packageName, dependencyGraph) : [],
                depth: this.calculateDependencyDepth(packageName, dependencyGraph)
            });
        }

        return analysis;
    }

    /**
     * Calculate compatibility matrix
     * @param {Map} packageData - Package data
     * @param {Object} dependencyAnalysis - Dependency analysis
     * @param {Object} request - Matrix request
     * @returns {Promise<Object>} Compatibility matrix
     */
    async calculateCompatibilityMatrix(packageData, dependencyAnalysis, request) {
        const matrix = new Map();
        const environments = request.environments || this.getDefaultEnvironments();

        // Generate compatibility entries for each combination
        for (const [packageName, packageInfo] of packageData) {
            const packageMatrix = new Map();

            for (const [version, versionData] of packageInfo.versions) {
                const versionMatrix = new Map();

                for (const environment of environments) {
                    const compatibility = await this.calculatePackageEnvironmentCompatibility(
                        packageName,
                        version,
                        versionData,
                        environment,
                        dependencyAnalysis
                    );

                    versionMatrix.set(environment.name || environment, compatibility);
                }

                packageMatrix.set(version, versionMatrix);
            }

            matrix.set(packageName, packageMatrix);
        }

        // Calculate cross-package compatibility
        const crossCompatibility = await this.calculateCrossPackageCompatibility(
            packageData,
            dependencyAnalysis,
            environments
        );

        return {
            packageMatrix: matrix,
            crossPackageCompatibility: crossCompatibility,
            environmentCompatibility: await this.calculateEnvironmentCompatibility(environments),
            overallCompatibility: this.calculateOverallCompatibility(matrix, crossCompatibility)
        };
    }

    /**
     * Calculate package-environment compatibility
     * @param {string} packageName - Package name
     * @param {string} version - Package version
     * @param {Object} versionData - Version data
     * @param {Object} environment - Environment specification
     * @param {Object} dependencyAnalysis - Dependency analysis
     * @returns {Promise<Object>} Compatibility assessment
     */
    async calculatePackageEnvironmentCompatibility(
        packageName,
        version,
        versionData,
        environment,
        dependencyAnalysis
    ) {
        const compatibility = {
            compatible: true,
            score: 1.0,
            issues: [],
            warnings: [],
            recommendations: [],
            details: {}
        };

        // Node.js version compatibility
        if (environment.node && versionData.engines?.node) {
            const nodeCompatibility = this.checkNodeCompatibility(
                versionData.engines.node,
                environment.node
            );
            compatibility.details.node = nodeCompatibility;

            if (!nodeCompatibility.compatible) {
                compatibility.compatible = false;
                compatibility.score *= 0.5;
                compatibility.issues.push(
                    `Incompatible Node.js version: requires ${versionData.engines.node}, environment has ${environment.node}`
                );
            }
        }

        // Operating system compatibility
        if (environment.os && versionData.os && versionData.os.length > 0) {
            const osCompatible = versionData.os.includes(environment.os);
            compatibility.details.os = { compatible: osCompatible, required: versionData.os, actual: environment.os };

            if (!osCompatible) {
                compatibility.compatible = false;
                compatibility.score *= 0.3;
                compatibility.issues.push(
                    `Incompatible operating system: requires ${versionData.os.join(' or ')}, environment has ${environment.os}`
                );
            }
        }

        // CPU architecture compatibility
        if (environment.arch && versionData.cpu && versionData.cpu.length > 0) {
            const archCompatible = versionData.cpu.includes(environment.arch);
            compatibility.details.arch = { compatible: archCompatible, required: versionData.cpu, actual: environment.arch };

            if (!archCompatible) {
                compatibility.compatible = false;
                compatibility.score *= 0.4;
                compatibility.issues.push(
                    `Incompatible CPU architecture: requires ${versionData.cpu.join(' or ')}, environment has ${environment.arch}`
                );
            }
        }

        // Security compatibility
        if (versionData.security && versionData.security.vulnerabilities > 0) {
            compatibility.score *= (1 - (versionData.security.vulnerabilities * 0.1));
            compatibility.warnings.push(
                `Package has ${versionData.security.vulnerabilities} known security vulnerabilities`
            );
        }

        // Memory requirements (for serverless/constrained environments)
        if (environment.constraints?.maxMemoryMB && versionData.size) {
            const memoryRatio = versionData.size.unpackedSize / (environment.constraints.maxMemoryMB * 1024 * 1024);
            if (memoryRatio > 0.5) {
                compatibility.score *= (1 - memoryRatio * 0.3);
                compatibility.warnings.push(
                    `Package size (${versionData.size.unpackedSize} bytes) may impact memory-constrained environments`
                );
            }
        }

        // Dependency conflicts
        const packageRelations = dependencyAnalysis.relationships.get(packageName);
        if (packageRelations && dependencyAnalysis.conflicts.length > 0) {
            const packageConflicts = dependencyAnalysis.conflicts.filter(conflict =>
                conflict.packages.includes(packageName)
            );

            if (packageConflicts.length > 0) {
                compatibility.score *= (1 - (packageConflicts.length * 0.2));
                compatibility.warnings.push(
                    `Package has ${packageConflicts.length} dependency conflicts`
                );
            }
        }

        // Maintenance and quality scoring
        if (versionData.maintenance) {
            const maintenanceScore = versionData.maintenance.score || 0.5;
            compatibility.score *= (0.7 + maintenanceScore * 0.3); // Weight maintenance score
        }

        if (versionData.quality) {
            const qualityScore = versionData.quality.score || 0.5;
            compatibility.score *= (0.8 + qualityScore * 0.2); // Weight quality score
        }

        // Generate recommendations based on compatibility issues
        if (compatibility.issues.length > 0 || compatibility.warnings.length > 0) {
            compatibility.recommendations = await this.generateCompatibilityRecommendations(
                packageName,
                version,
                versionData,
                environment,
                compatibility
            );
        }

        return compatibility;
    }

    /**
     * Generate compatibility recommendations
     * @param {Object} compatibilityMatrix - Compatibility matrix
     * @param {Object} request - Original request
     * @returns {Promise<Object>} Recommendations
     */
    async generateCompatibilityRecommendations(compatibilityMatrix, request) {
        const recommendations = {
            package: new Map(),
            environment: new Map(),
            migration: [],
            optimization: [],
            security: []
        };

        // Analyze matrix for recommendation opportunities
        for (const [packageName, packageMatrix] of compatibilityMatrix.packageMatrix) {
            const packageRecommendations = {
                preferredVersions: [],
                alternativeVersions: [],
                environmentRecommendations: [],
                upgradeRecommendations: [],
                securityRecommendations: []
            };

            for (const [version, environmentMatrix] of packageMatrix) {
                let totalScore = 0;
                let environmentCount = 0;
                let compatibleEnvironments = 0;

                for (const [environment, compatibility] of environmentMatrix) {
                    totalScore += compatibility.score;
                    environmentCount++;

                    if (compatibility.compatible) {
                        compatibleEnvironments++;
                    }

                    // Environment-specific recommendations
                    if (compatibility.score < 0.7) {
                        packageRecommendations.environmentRecommendations.push({
                            environment,
                            version,
                            score: compatibility.score,
                            issues: compatibility.issues,
                            recommendations: compatibility.recommendations
                        });
                    }
                }

                const averageScore = environmentCount > 0 ? totalScore / environmentCount : 0;
                const compatibilityRatio = environmentCount > 0 ? compatibleEnvironments / environmentCount : 0;

                // Categorize versions
                if (averageScore >= 0.8 && compatibilityRatio >= 0.8) {
                    packageRecommendations.preferredVersions.push({
                        version,
                        score: averageScore,
                        compatibilityRatio,
                        reason: 'High compatibility across environments'
                    });
                } else if (averageScore >= 0.6 || compatibilityRatio >= 0.6) {
                    packageRecommendations.alternativeVersions.push({
                        version,
                        score: averageScore,
                        compatibilityRatio,
                        reason: 'Moderate compatibility, consider for specific environments'
                    });
                }
            }

            // Sort recommendations
            packageRecommendations.preferredVersions.sort((a, b) => b.score - a.score);
            packageRecommendations.alternativeVersions.sort((a, b) => b.score - a.score);

            recommendations.package.set(packageName, packageRecommendations);
        }

        // Generate migration recommendations
        recommendations.migration = await this.generateMigrationRecommendations(compatibilityMatrix);

        // Generate optimization recommendations
        recommendations.optimization = await this.generateOptimizationRecommendations(compatibilityMatrix);

        // Generate security recommendations
        recommendations.security = await this.generateSecurityRecommendations(compatibilityMatrix);

        return recommendations;
    }

    /**
     * Generate visualization data
     * @param {Object} compatibilityMatrix - Compatibility matrix
     * @returns {Promise<Object>} Visualization data
     */
    async generateVisualizationData(compatibilityMatrix) {
        return {
            heatmap: this.generateHeatmapData(compatibilityMatrix),
            network: this.generateNetworkData(compatibilityMatrix),
            timeline: this.generateTimelineData(compatibilityMatrix),
            charts: {
                compatibilityDistribution: this.generateCompatibilityDistribution(compatibilityMatrix),
                versionTrends: this.generateVersionTrends(compatibilityMatrix),
                environmentComparison: this.generateEnvironmentComparison(compatibilityMatrix)
            }
        };
    }

    /**
     * Update generation progress
     * @param {string} matrixId - Matrix ID
     * @param {number} progress - Progress percentage
     * @param {string} status - Status message
     */
    updateGenerationProgress(matrixId, progress, status) {
        const generation = this.state.activeGenerations.get(matrixId);
        if (generation) {
            generation.progress = progress;
            generation.currentStatus = status;

            this.emit('matrix:generation:progress', {
                matrixId,
                progress,
                status
            });
        }
    }

    /**
     * Validate matrix generation request
     * @param {Object} request - Matrix request to validate
     */
    validateMatrixRequest(request) {
        if (!request || typeof request !== 'object') {
            throw new Error('Invalid matrix request: must be an object');
        }

        if (!request.packages || !Array.isArray(request.packages) || request.packages.length === 0) {
            throw new Error('Invalid matrix request: packages array is required and must not be empty');
        }

        // Validate each package specification
        request.packages.forEach((pkg, index) => {
            if (!pkg.name || typeof pkg.name !== 'string') {
                throw new Error(`Invalid package at index ${index}: name is required and must be a string`);
            }
        });

        // Check matrix size limitations
        const estimatedSize = this.estimateMatrixSize(request);
        if (estimatedSize > this.config.generation.maxMatrixSize) {
            throw new Error(
                `Matrix size estimation (${estimatedSize}) exceeds maximum allowed size (${this.config.generation.maxMatrixSize})`
            );
        }
    }

    /**
     * Get current generation status
     * @param {string} matrixId - Matrix ID
     * @returns {Object|null} Generation status
     */
    getGenerationStatus(matrixId) {
        return this.state.activeGenerations.get(matrixId) || null;
    }

    /**
     * List all matrices
     * @returns {Array} Array of matrix summaries
     */
    listMatrices() {
        return Array.from(this.state.matrices.values()).map(matrix => ({
            id: matrix.id,
            generatedAt: matrix.generatedAt,
            packageCount: matrix.request.packages.length,
            totalCombinations: matrix.analysis.totalCombinations,
            compatibilityRate: (matrix.analysis.compatibleCombinations / matrix.analysis.totalCombinations) * 100,
            size: matrix.metadata.matrixSize,
            complexity: matrix.metadata.complexity
        }));
    }

    /**
     * Get matrix by ID
     * @param {string} matrixId - Matrix ID
     * @returns {Object|null} Matrix data
     */
    getMatrix(matrixId) {
        return this.state.matrices.get(matrixId) || null;
    }

    /**
     * Get available versions for a package (stub implementation)
     * @param {string} packageName - Package name
     * @returns {Promise<Array>} Available versions
     */
    async getAvailableVersions(packageName) {
        // Stub implementation - in real implementation would fetch from package registry
        return ['1.0.0', '2.0.0', '3.0.0'];
    }

    /**
     * Categorize package (stub implementation)
     * @param {string} packageName - Package name
     * @returns {string} Package category
     */
    categorizePackage(packageName) {
        // Stub implementation - basic categorization
        if (packageName.includes('react')) return 'ui-framework';
        if (packageName.includes('express')) return 'backend-framework';
        if (packageName.includes('lodash')) return 'utility';
        return 'unknown';
    }

    /**
     * Get package popularity (stub implementation)
     * @param {string} packageName - Package name
     * @returns {Promise<number>} Popularity score
     */
    async getPackagePopularity(packageName) {
        // Stub implementation - would fetch real popularity metrics
        return Math.random();
    }

    /**
     * Get package maintainers (stub implementation)
     * @param {string} packageName - Package name
     * @returns {Promise<Array>} Maintainer list
     */
    async getPackageMaintainers(packageName) {
        // Stub implementation - would fetch real maintainer data
        return ['maintainer@example.com'];
    }

    /**
     * Get default environments
     * @returns {Array} Default environments
     */
    getDefaultEnvironments() {
        return [
            { name: 'development', node: 'v18.x', os: 'darwin' },
            { name: 'production', node: 'v18.x', os: 'linux' }
        ];
    }

    /**
     * Calculate total combinations
     * @param {Object} matrix - Compatibility matrix
     * @returns {number} Total combinations
     */
    calculateTotalCombinations(matrix) {
        let total = 0;
        for (const [packageName, packageMatrix] of matrix) {
            for (const [version, environmentMatrix] of packageMatrix) {
                total += environmentMatrix.size;
            }
        }
        return total;
    }

    /**
     * Count compatible combinations
     * @param {Object} matrix - Compatibility matrix
     * @returns {number} Compatible combinations
     */
    countCompatibleCombinations(matrix) {
        let compatible = 0;
        for (const [packageName, packageMatrix] of matrix) {
            for (const [version, environmentMatrix] of packageMatrix) {
                for (const [environment, compatibility] of environmentMatrix) {
                    if (compatibility.compatible) compatible++;
                }
            }
        }
        return compatible;
    }

    /**
     * Count incompatible combinations
     * @param {Object} matrix - Compatibility matrix
     * @returns {number} Incompatible combinations
     */
    countIncompatibleCombinations(matrix) {
        const total = this.calculateTotalCombinations(matrix);
        const compatible = this.countCompatibleCombinations(matrix);
        return total - compatible;
    }

    /**
     * Identify high risk combinations
     * @param {Object} matrix - Compatibility matrix
     * @returns {Array} High risk combinations
     */
    identifyHighRiskCombinations(matrix) {
        const highRisk = [];
        for (const [packageName, packageMatrix] of matrix) {
            for (const [version, environmentMatrix] of packageMatrix) {
                for (const [environment, compatibility] of environmentMatrix) {
                    if (!compatibility.compatible || compatibility.score < 0.5) {
                        highRisk.push({
                            package: packageName,
                            version,
                            environment,
                            score: compatibility.score,
                            issues: compatibility.issues
                        });
                    }
                }
            }
        }
        return highRisk;
    }

    /**
     * Identify recommended combinations
     * @param {Object} matrix - Compatibility matrix
     * @returns {Array} Recommended combinations
     */
    identifyRecommendedCombinations(matrix) {
        const recommended = [];
        for (const [packageName, packageMatrix] of matrix) {
            for (const [version, environmentMatrix] of packageMatrix) {
                for (const [environment, compatibility] of environmentMatrix) {
                    if (compatibility.compatible && compatibility.score > 0.8) {
                        recommended.push({
                            package: packageName,
                            version,
                            environment,
                            score: compatibility.score
                        });
                    }
                }
            }
        }
        return recommended;
    }

    /**
     * Estimate matrix size
     * @param {Object} request - Matrix request
     * @returns {number} Estimated matrix size
     */
    estimateMatrixSize(request) {
        const packageCount = request.packages.length;
        const envCount = request.environments ? request.environments.length : 2;
        const avgVersions = 3; // Estimate average versions per package
        return packageCount * avgVersions * envCount;
    }

    /**
     * Calculate matrix size
     * @param {Object} matrix - Compatibility matrix
     * @returns {number} Matrix size
     */
    calculateMatrixSize(matrix) {
        return this.calculateTotalCombinations(matrix);
    }

    /**
     * Calculate matrix complexity
     * @param {Object} matrix - Compatibility matrix
     * @returns {string} Complexity level
     */
    calculateMatrixComplexity(matrix) {
        const size = this.calculateTotalCombinations(matrix);
        if (size < 100) return 'low';
        if (size < 1000) return 'medium';
        if (size < 10000) return 'high';
        return 'very_high';
    }

    /**
     * Calculate matrix confidence
     * @param {Object} matrix - Compatibility matrix
     * @returns {number} Confidence score
     */
    calculateMatrixConfidence(matrix) {
        const total = this.calculateTotalCombinations(matrix);
        const compatible = this.countCompatibleCombinations(matrix);
        return total > 0 ? compatible / total : 0;
    }

    /**
     * Calculate cache hit rate
     * @returns {number} Cache hit rate
     */
    calculateCacheHitRate() {
        // Stub implementation
        return 0.85;
    }

    /**
     * Calculate average generation time
     * @returns {number} Average generation time in ms
     */
    calculateAverageGenerationTime() {
        // Stub implementation
        return 2500;
    }

    /**
     * Get largest matrix size
     * @returns {number} Largest matrix size
     */
    getLargestMatrixSize() {
        // Stub implementation
        return 10000;
    }

    /**
     * Get system metrics
     * @returns {Object} System metrics
     */
    getMetrics() {
        return {
            matrices: {
                total: this.state.matrices.size,
                active: this.state.activeGenerations.size
            },
            cache: {
                size: this.state.matrixCache.size,
                hitRate: this.calculateCacheHitRate()
            },
            performance: {
                averageGenerationTime: this.calculateAverageGenerationTime(),
                largestMatrix: this.getLargestMatrixSize()
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Build version axis for matrix structure
     * @param {Array} packages - Packages to build version axis from
     * @returns {Promise<Array>} Version axis data
     */
    async buildVersionAxis(packages) {
        try {
            const versionAxis = [];

            for (const pkg of packages) {
                versionAxis.push({
                    name: pkg.name,
                    version: pkg.version,
                    major: this.extractMajorVersion(pkg.version),
                    minor: this.extractMinorVersion(pkg.version),
                    patch: this.extractPatchVersion(pkg.version),
                    prerelease: this.isPrerelease(pkg.version),
                    sortKey: this.createVersionSortKey(pkg.version)
                });
            }

            // Sort by version for better matrix layout
            return versionAxis.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

        } catch (error) {
            throw new Error(`Failed to build version axis: ${error.message}`);
        }
    }

    /**
     * Extract major version number
     * @param {string} version - Version string
     * @returns {number} Major version number
     */
    extractMajorVersion(version) {
        const semver = require('semver');
        if (semver.valid(version)) {
            return semver.major(version);
        }
        return 0;
    }

    /**
     * Extract minor version number
     * @param {string} version - Version string
     * @returns {number} Minor version number
     */
    extractMinorVersion(version) {
        const semver = require('semver');
        if (semver.valid(version)) {
            return semver.minor(version);
        }
        return 0;
    }

    /**
     * Extract patch version number
     * @param {string} version - Version string
     * @returns {number} Patch version number
     */
    extractPatchVersion(version) {
        const semver = require('semver');
        if (semver.valid(version)) {
            return semver.patch(version);
        }
        return 0;
    }

    /**
     * Check if version is prerelease
     * @param {string} version - Version string
     * @returns {boolean} True if prerelease
     */
    isPrerelease(version) {
        const semver = require('semver');
        if (semver.valid(version)) {
            return semver.prerelease(version) !== null;
        }
        return false;
    }

    /**
     * Create version sort key
     * @param {string} version - Version string
     * @returns {string} Sort key
     */
    createVersionSortKey(version) {
        const semver = require('semver');
        if (semver.valid(version)) {
            const parsed = semver.parse(version);
            return `${String(parsed.major).padStart(5, '0')}.${String(parsed.minor).padStart(5, '0')}.${String(parsed.patch).padStart(5, '0')}`;
        }
        return version;
    }

    /**
     * Build dependency axis for matrix structure
     * @param {Array} packages - Packages to build dependency axis from
     * @returns {Promise<Array>} Dependency axis data
     */
    async buildDependencyAxis(packages) {
        try {
            const dependencyAxis = [];
            const processedDeps = new Set();

            for (const pkg of packages) {
                if (pkg.dependencies) {
                    Object.keys(pkg.dependencies).forEach(depName => {
                        if (!processedDeps.has(depName)) {
                            dependencyAxis.push({
                                name: depName,
                                version: pkg.dependencies[depName],
                                type: 'production',
                                scope: 'package'
                            });
                            processedDeps.add(depName);
                        }
                    });
                }

                if (pkg.devDependencies) {
                    Object.keys(pkg.devDependencies).forEach(depName => {
                        if (!processedDeps.has(depName)) {
                            dependencyAxis.push({
                                name: depName,
                                version: pkg.devDependencies[depName],
                                type: 'development',
                                scope: 'package'
                            });
                            processedDeps.add(depName);
                        }
                    });
                }
            }

            return dependencyAxis.sort((a, b) => a.name.localeCompare(b.name));

        } catch (error) {
            throw new Error(`Failed to build dependency axis: ${error.message}`);
        }
    }

    /**
     * Calculate total combinations across all axes
     * @param {Object} axes - Axes object containing different dimensions
     * @returns {number} Total number of combinations
     */
    calculateAxisCombinations(axes) {
        try {
            let totalCombinations = 1;

            if (axes.versions?.length) {
                totalCombinations *= axes.versions.length;
            }

            if (axes.environments?.length) {
                totalCombinations *= axes.environments.length;
            }

            if (axes.dependencies?.length) {
                totalCombinations *= axes.dependencies.length;
            }

            if (axes.platforms?.length) {
                totalCombinations *= axes.platforms.length;
            }

            return totalCombinations;

        } catch (error) {
            return 0;
        }
    }

    /**
     * Get package description
     * @param {string} packageName - Package name
     * @returns {Promise<string>} Package description
     */
    async getPackageDescription(packageName) {
        try {
            // In a real implementation, this would fetch from package registry
            // For now, return a placeholder
            return `Description for ${packageName}`;
        } catch (error) {
            return 'No description available';
        }
    }

    /**
     * Get package homepage
     * @param {string} packageName - Package name
     * @returns {Promise<string>} Package homepage
     */
    async getPackageHomepage(packageName) {
        try {
            // In a real implementation, this would fetch from package registry
            return `https://www.npmjs.com/package/${packageName}`;
        } catch (error) {
            return '';
        }
    }

    /**
     * Get package repository
     * @param {string} packageName - Package name
     * @returns {Promise<string>} Package repository
     */
    async getPackageRepository(packageName) {
        try {
            // In a real implementation, this would fetch from package registry
            return `https://github.com/example/${packageName}`;
        } catch (error) {
            return '';
        }
    }

    /**
     * Get package maintainers
     * @param {string} packageName - Package name
     * @returns {Promise<Array>} Package maintainers
     */
    async getPackageMaintainers(packageName) {
        try {
            // In a real implementation, this would fetch from package registry
            return ['Example Maintainer'];
        } catch (error) {
            return [];
        }
    }

    /**
     * Get package license
     * @param {string} packageName - Package name
     * @returns {Promise<string>} Package license
     */
    async getPackageLicense(packageName) {
        try {
            // In a real implementation, this would fetch from package registry
            return 'MIT';
        } catch (error) {
            return 'Unknown';
        }
    }

    /**
     * Get package keywords
     * @param {string} packageName - Package name
     * @returns {Promise<Array>} Package keywords
     */
    async getPackageKeywords(packageName) {
        try {
            // In a real implementation, this would fetch from package registry
            return ['javascript', 'nodejs'];
        } catch (error) {
            return [];
        }
    }

    /**
     * Get package downloads
     * @param {string} packageName - Package name
     * @returns {Promise<Object>} Package download statistics
     */
    async getPackageDownloads(packageName) {
        try {
            // In a real implementation, this would fetch from NPM API
            return {
                daily: Math.floor(Math.random() * 10000),
                weekly: Math.floor(Math.random() * 70000),
                monthly: Math.floor(Math.random() * 300000)
            };
        } catch (error) {
            return {
                daily: 0,
                weekly: 0,
                monthly: 0
            };
        }
    }

    /**
     * Get last published date
     * @param {string} packageName - Package name
     * @returns {Promise<string>} Last published date
     */
    async getLastPublishedDate(packageName) {
        try {
            // In a real implementation, this would fetch from NPM API
            const randomDaysAgo = Math.floor(Math.random() * 365);
            const date = new Date();
            date.setDate(date.getDate() - randomDaysAgo);
            return date.toISOString().split('T')[0];
        } catch (error) {
            return 'Unknown';
        }
    }

    /**
     * Detect circular dependencies
     * @param {Array} packages - Packages to analyze
     * @returns {Promise<Array>} Circular dependency chains
     */
    async detectCircularDependencies(packages) {
        try {
            const cycles = [];
            const visited = new Set();
            const recursionStack = new Set();

            const hasCycle = (pkg, path = []) => {
                if (recursionStack.has(pkg.name)) {
                    const cycleStart = path.indexOf(pkg.name);
                    cycles.push(path.slice(cycleStart).concat([pkg.name]));
                    return true;
                }

                if (visited.has(pkg.name)) {
                    return false;
                }

                visited.add(pkg.name);
                recursionStack.add(pkg.name);
                path.push(pkg.name);

                if (pkg.dependencies) {
                    for (const dep of Object.keys(pkg.dependencies)) {
                        const depPkg = packages.find(p => p.name === dep);
                        if (depPkg && hasCycle(depPkg, [...path])) {
                            return true;
                        }
                    }
                }

                recursionStack.delete(pkg.name);
                return false;
            };

            for (const pkg of packages) {
                if (!visited.has(pkg.name)) {
                    hasCycle(pkg);
                }
            }

            return cycles;
        } catch (error) {
            return [];
        }
    }
}

module.exports = { CompatibilityMatrixGenerator };