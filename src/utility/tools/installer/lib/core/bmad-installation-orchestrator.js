/**
 * BMAD Installation Orchestrator
 * Epic 3: Story 3.4 - Integration Hub for Installation Templates & Configuration
 *
 * Main orchestrator that integrates all components:
 * - Template Engine (Clara)
 * - Configuration Manager (Clara)
 * - Configuration Validator (Clara)
 * - Post-Install Verifier (Clara)
 * - Dependency Manager (Winston)
 * - Package Registry (Morgan)
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

const BMADTemplateEngine = require('./bmad-template-engine');
const BMADConfigurationManager = require('./bmad-configuration-manager');
const BMADConfigurationValidator = require('../validators/bmad-configuration-validator');
const BMADPostInstallVerifier = require('./bmad-post-install-verifier');
const { normalizeLineEndings } = require('../../../../normalize-line-endings.cjs');
const BMADDependencyManager = require('./bmad-dependency-manager');

class BMADInstallationOrchestrator {
    constructor(options = {}) {
        this.config = {
            bmadRoot: options.bmadRoot || './_bmad',
            outputPath: options.outputPath || './generated',
            enableValidation: options.enableValidation !== false,
            enableVerification: options.enableVerification !== false,
            enableBackup: options.enableBackup !== false,
            strictMode: options.strictMode || false,
            ...options
        };

        // Component instances
        this.templateEngine = null;
        this.configurationManager = null;
        this.configurationValidator = null;
        this.postInstallVerifier = null;
        this.dependencyManager = null;

        // Installation tracking
        this.installationSessions = new Map();
        this.installationStats = {
            totalInstallations: 0,
            successfulInstallations: 0,
            failedInstallations: 0,
            averageInstallationTime: 0
        };
    }

    /**
     * Initialize all components
     */
    async initialize() {
        try {
            console.log('[BMAD Installation Orchestrator] Initializing all components...');

            // Initialize Template Engine
            this.templateEngine = new BMADTemplateEngine({
                bmadRoot: this.config.bmadRoot,
                outputPath: this.config.outputPath,
                enableBackup: this.config.enableBackup
            });
            await this.templateEngine.initialize();

            // Initialize Configuration Manager
            this.configurationManager = new BMADConfigurationManager({
                bmadRoot: this.config.bmadRoot,
                enableCache: true
            });
            await this.configurationManager.initialize();

            // Initialize Configuration Validator
            this.configurationValidator = new BMADConfigurationValidator({
                bmadRoot: this.config.bmadRoot,
                strictMode: this.config.strictMode
            });
            await this.configurationValidator.initialize();

            // Initialize Post-Install Verifier
            this.postInstallVerifier = new BMADPostInstallVerifier({
                bmadRoot: this.config.bmadRoot,
                enableFileSystemChecks: true,
                enableIntegrationChecks: true
            });
            await this.postInstallVerifier.initialize();

            // Initialize Dependency Manager
            this.dependencyManager = new BMADDependencyManager({
                bmadRoot: this.config.bmadRoot
            });
            await this.dependencyManager.initialize();

            console.log('[BMAD Installation Orchestrator] All components initialized successfully');
            return true;

        } catch (error) {
            console.error('[BMAD Installation Orchestrator] Initialization failed:', error.message);
            throw error;
        }
    }

    /**
     * Orchestrate complete installation process for a team module
     */
    async installTeamModule(teamCode, options = {}) {
        const sessionId = this.generateSessionId();
        const startTime = Date.now();

        const session = {
            sessionId,
            teamCode,
            startTime,
            options,
            steps: [],
            currentStep: null,
            status: 'running',
            result: null
        };

        this.installationSessions.set(sessionId, session);

        try {
            console.log(`[BMAD Installation Orchestrator] Starting installation for ${teamCode} (Session: ${sessionId})`);

            // Step 1: Generate Configuration
            await this.executeStep(session, 'configuration_generation', async () => {
                const generationResult = await this.templateEngine.generateTeamConfiguration(teamCode, {
                    environment: options.environment || 'production',
                    projectRoot: process.cwd(),
                    backup: this.config.enableBackup,
                    variables: options.variables || new Map(),
                    ...options
                });

                if (!generationResult.success) {
                    throw new Error(`Configuration generation failed: ${generationResult.error}`);
                }

                return generationResult;
            });

            // Step 2: Process Advanced Configuration
            await this.executeStep(session, 'configuration_processing', async () => {
                const config = session.steps[0].result.configuration;
                const context = {
                    teamCode,
                    environment: options.environment || 'production',
                    projectRoot: process.cwd(),
                    ...options
                };

                const processingResult = await this.configurationManager.processConfiguration(config, context);

                if (!processingResult.success) {
                    throw new Error(`Configuration processing failed: ${processingResult.error}`);
                }

                return processingResult;
            });

            // Step 3: Validate Configuration
            if (this.config.enableValidation) {
                await this.executeStep(session, 'configuration_validation', async () => {
                    const config = session.steps[1].result.configuration;
                    const context = { teamCode, ...options };

                    const validationResult = await this.configurationValidator.validateConfiguration(config, context);

                    if (!validationResult.valid && this.config.strictMode) {
                        throw new Error(`Configuration validation failed with ${validationResult.errors.length} errors`);
                    }

                    return validationResult;
                });
            }

            // Step 4: Resolve Dependencies
            await this.executeStep(session, 'dependency_resolution', async () => {
                const config = session.steps[1].result.configuration;
                const installOptions = {
                    environment: options.environment,
                    allowCircular: options.allowCircular || false,
                    ...options
                };

                const dependencyResult = await this.dependencyManager.resolveDependencies(config, installOptions);

                if (!dependencyResult.success) {
                    throw new Error(`Dependency resolution failed: ${dependencyResult.error}`);
                }

                return dependencyResult;
            });

            // Step 5: Execute Installation (Integration with Amelia's framework)
            await this.executeStep(session, 'installation_execution', async () => {
                const installationPlan = session.steps[3].result.installationPlan;
                const executionOptions = {
                    sequential: options.sequential || false,
                    continueOnFailure: options.continueOnFailure || false,
                    ...options
                };

                const executionResult = await this.dependencyManager.executeInstallationPlan(
                    installationPlan,
                    executionOptions
                );

                if (!executionResult.success) {
                    throw new Error(`Installation execution failed: ${executionResult.error || 'Unknown error'}`);
                }

                return executionResult;
            });

            // Step 6: Post-Install Verification
            if (this.config.enableVerification) {
                await this.executeStep(session, 'post_install_verification', async () => {
                    const config = session.steps[1].result.configuration;
                    const context = {
                        teamCode,
                        installationPath: session.steps[4].result.installedModules?.[0] || `./node_modules/@bmad-cybercommand/${teamCode}`,
                        environment: options.environment || 'production',
                        outputPath: this.config.outputPath,
                        ...options
                    };

                    const verificationResult = await this.postInstallVerifier.runVerification(config, context);

                    // Don't fail installation on verification warnings
                    if (!verificationResult.success) {
                        console.warn(`[BMAD Installation Orchestrator] Post-install verification completed with issues`);
                    }

                    return verificationResult;
                });
            }

            // Installation successful
            session.status = 'completed';
            session.endTime = Date.now();
            session.duration = session.endTime - session.startTime;

            session.result = {
                success: true,
                sessionId,
                teamCode,
                configuration: session.steps[1].result.configuration,
                validation: session.steps[2]?.result,
                dependencies: session.steps[3].result,
                installation: session.steps[4].result,
                verification: session.steps[5]?.result,
                duration: session.duration,
                outputFiles: session.steps[0].result.outputFiles
            };

            this.updateStats(session, true);

            console.log(`[BMAD Installation Orchestrator] Installation completed successfully in ${session.duration}ms`);
            return session.result;

        } catch (error) {
            session.status = 'failed';
            session.endTime = Date.now();
            session.duration = session.endTime - session.startTime;
            session.error = error.message;

            session.result = {
                success: false,
                sessionId,
                teamCode,
                error: error.message,
                duration: session.duration,
                completedSteps: session.steps.filter(step => step.status === 'completed').map(step => step.name)
            };

            this.updateStats(session, false);

            console.error(`[BMAD Installation Orchestrator] Installation failed after ${session.duration}ms: ${error.message}`);
            return session.result;
        }
    }

    /**
     * Execute a single installation step
     */
    async executeStep(session, stepName, stepFunction) {
        const step = {
            name: stepName,
            startTime: Date.now(),
            status: 'running',
            result: null,
            error: null,
            duration: 0
        };

        session.currentStep = stepName;
        session.steps.push(step);

        try {
            console.log(`[BMAD Installation Orchestrator] Executing step: ${stepName}`);

            step.result = await stepFunction();
            step.status = 'completed';
            step.endTime = Date.now();
            step.duration = step.endTime - step.startTime;

            console.log(`[BMAD Installation Orchestrator] Step ${stepName} completed in ${step.duration}ms`);

        } catch (error) {
            step.status = 'failed';
            step.error = error.message;
            step.endTime = Date.now();
            step.duration = step.endTime - step.startTime;

            console.error(`[BMAD Installation Orchestrator] Step ${stepName} failed after ${step.duration}ms: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate available team configurations
     */
    async generateAllTeamConfigurations(options = {}) {
        const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
        const results = {};

        console.log('[BMAD Installation Orchestrator] Generating configurations for all teams...');

        for (const teamCode of teams) {
            try {
                console.log(`[BMAD Installation Orchestrator] Generating configuration for ${teamCode}...`);

                const result = await this.templateEngine.generateTeamConfiguration(teamCode, {
                    environment: options.environment || 'production',
                    generateInstallScript: true,
                    backup: false, // Don't backup during bulk generation
                    ...options
                });

                if (result.success) {
                    // Process the configuration
                    const processedResult = await this.configurationManager.processConfiguration(
                        result.configuration,
                        { teamCode, environment: options.environment || 'production' }
                    );

                    if (processedResult.success) {
                        result.configuration = processedResult.configuration;
                    }

                    // Validate the configuration
                    if (this.config.enableValidation) {
                        const validationResult = await this.configurationValidator.validateConfiguration(
                            result.configuration,
                            { teamCode }
                        );
                        result.validation = validationResult;
                    }
                }

                results[teamCode] = result;

            } catch (error) {
                console.error(`[BMAD Installation Orchestrator] Failed to generate configuration for ${teamCode}:`, error.message);
                results[teamCode] = {
                    success: false,
                    error: error.message
                };
            }
        }

        console.log('[BMAD Installation Orchestrator] Bulk configuration generation completed');
        return results;
    }

    /**
     * Validate existing installation
     */
    async validateInstallation(teamCode, options = {}) {
        try {
            console.log(`[BMAD Installation Orchestrator] Validating existing installation for ${teamCode}...`);

            // Try to load existing configuration
            const configPath = `./generated/${teamCode}/module.yaml`;
            if (!require('fs').existsSync(configPath)) {
                throw new Error(`Configuration file not found: ${configPath}`);
            }

            const yaml = require('yaml');
            const config = yaml.parse(normalizeLineEndings(require('fs').readFileSync(configPath, 'utf8')));

            // Validate configuration
            const validationResult = await this.configurationValidator.validateConfiguration(config, { teamCode });

            // Run post-install verification
            const verificationResult = await this.postInstallVerifier.runVerification(config, {
                teamCode,
                installationPath: `./node_modules/@bmad-cybercommand/${teamCode}`,
                ...options
            });

            return {
                success: true,
                teamCode,
                validation: validationResult,
                verification: verificationResult,
                overall: validationResult.valid && verificationResult.success
            };

        } catch (error) {
            console.error(`[BMAD Installation Orchestrator] Validation failed for ${teamCode}:`, error.message);
            return {
                success: false,
                teamCode,
                error: error.message
            };
        }
    }

    /**
     * Get installation session status
     */
    getSessionStatus(sessionId) {
        return this.installationSessions.get(sessionId);
    }

    /**
     * List all active sessions
     */
    getActiveSessions() {
        const activeSessions = [];
        for (const [sessionId, session] of this.installationSessions.entries()) {
            if (session.status === 'running') {
                activeSessions.push({
                    sessionId,
                    teamCode: session.teamCode,
                    currentStep: session.currentStep,
                    startTime: session.startTime,
                    duration: Date.now() - session.startTime
                });
            }
        }
        return activeSessions;
    }

    /**
     * Get orchestrator status and statistics
     */
    getStatus() {
        return {
            initialized: true,
            components: {
                templateEngine: this.templateEngine?.getStatus() || null,
                configurationManager: this.configurationManager?.getStatus() || null,
                configurationValidator: this.configurationValidator?.getStatus() || null,
                postInstallVerifier: this.postInstallVerifier?.getStatus() || null,
                dependencyManager: this.dependencyManager ? 'initialized' : null
            },
            statistics: this.installationStats,
            activeSessions: this.getActiveSessions().length,
            totalSessions: this.installationSessions.size,
            config: this.config
        };
    }

    /**
     * Generate example configurations for documentation
     */
    async generateExampleConfigurations() {
        const examples = {};

        // Development environment example
        examples.development = await this.generateAllTeamConfigurations({
            environment: 'development',
            debug: true,
            generateInstallScript: true
        });

        // Production environment example
        examples.production = await this.generateAllTeamConfigurations({
            environment: 'production',
            generateInstallScript: true
        });

        // Testing environment example
        examples.testing = await this.generateAllTeamConfigurations({
            environment: 'testing',
            generateInstallScript: false
        });

        return examples;
    }

    /**
     * Clean up old sessions and temporary files
     */
    async cleanup(options = {}) {
        const maxAge = options.maxAge || 86400000; // 24 hours
        const now = Date.now();
        let cleanedSessions = 0;

        // Clean old sessions
        for (const [sessionId, session] of this.installationSessions.entries()) {
            if (session.endTime && (now - session.endTime) > maxAge) {
                this.installationSessions.delete(sessionId);
                cleanedSessions++;
            }
        }

        // Clean configuration cache
        if (this.configurationManager) {
            await this.configurationManager.clearCache();
        }

        console.log(`[BMAD Installation Orchestrator] Cleanup completed: ${cleanedSessions} sessions removed`);
        return { cleanedSessions };
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `install_${timestamp}_${random}`;
    }

    /**
     * Update installation statistics
     */
    updateStats(session, success) {
        this.installationStats.totalInstallations++;

        if (success) {
            this.installationStats.successfulInstallations++;
        } else {
            this.installationStats.failedInstallations++;
        }

        // Update average installation time
        this.installationStats.averageInstallationTime =
            (this.installationStats.averageInstallationTime * (this.installationStats.totalInstallations - 1) + session.duration) /
            this.installationStats.totalInstallations;
    }

    /**
     * Export configurations for external use
     */
    async exportConfigurations(outputPath, format = 'yaml') {
        const configurations = await this.generateAllTeamConfigurations();
        const fs = require('fs');
        const path = require('path');

        await fs.promises.mkdir(outputPath, { recursive: true });

        for (const [teamCode, result] of Object.entries(configurations)) {
            if (result.success) {
                let content;
                let extension;

                switch (format) {
                    case 'json':
                        content = JSON.stringify(result.configuration, null, 2);
                        extension = 'json';
                        break;
                    case 'yaml':
                    default:
                        const yaml = require('yaml');
                        content = yaml.stringify(result.configuration, null, 2);
                        extension = 'yaml';
                        break;
                }

                const filePath = path.join(outputPath, `${teamCode}.${extension}`);
                await fs.promises.writeFile(filePath, content);
            }
        }

        console.log(`[BMAD Installation Orchestrator] Configurations exported to ${outputPath}`);
    }
}

module.exports = BMADInstallationOrchestrator;