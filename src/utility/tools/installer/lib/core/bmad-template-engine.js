/**
 * BMAD Template Engine
 * Epic 3: Story 3.4 - Installation Templates & Configuration System
 *
 * A comprehensive template engine for generating BMAD module configurations
 * with smart variable substitution, environment handling, and merge strategies.
 *
 * Designed by Clara (Tech Writer) for integration with:
 * - Amelia's installation framework
 * - Winston's dependency management system
 * - Morgan's package registry system
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const crypto = require('crypto');

class BMADTemplateEngine {
    constructor(options = {}) {
        this.config = {
            bmadRoot: options.bmadRoot || './_bmad',
            templatesPath: options.templatesPath || './templates',
            outputPath: options.outputPath || './generated',
            enableBackup: options.enableBackup !== false,
            enableValidation: options.enableValidation !== false,
            mergeStrategy: options.mergeStrategy || 'smart',
            ...options
        };

        // Template registry
        this.templates = new Map();
        this.environments = new Map();
        this.substitutionRules = new Map();
        this.validators = new Map();

        // Generation context
        this.generationContext = {
            timestamp: new Date(),
            bmadVersion: '2.0.0',
            templateVersion: '1.0.0',
            environment: 'production',
            variables: new Map(),
            computedValues: new Map()
        };

        // Specialized teams configuration
        this.specializedTeams = {
            'cybersec-team': {
                displayName: 'Cybersecurity Operations Team',
                type: 'Security',
                agentCount: 8,
                workflowCount: 15,
                keywords: ['cybersecurity', 'defense', 'incident-response'],
                permissions: {
                    network: true,
                    shell: ['nmap', 'curl', 'dig', 'whois'],
                    sensitiveData: true
                },
                outputTypes: ['investigations', 'reports', 'alerts', 'forensics']
            },
            'intel-team': {
                displayName: 'Intelligence Operations Team',
                type: 'Intelligence',
                agentCount: 11,
                workflowCount: 19,
                keywords: ['intelligence', 'osint', 'investigation'],
                permissions: {
                    network: true,
                    shell: ['curl', 'wget', 'whois', 'dig', 'nslookup', 'host'],
                    sensitiveData: true
                },
                outputTypes: ['collection', 'analysis', 'reports', 'artifacts']
            },
            'legal-team': {
                displayName: 'Legal Operations Team',
                type: 'Legal',
                agentCount: 13,
                workflowCount: 7,
                keywords: ['legal', 'compliance', 'contracts'],
                permissions: {
                    network: false,
                    shell: ['echo', 'cat', 'grep'],
                    sensitiveData: true
                },
                outputTypes: ['documents', 'contracts', 'analysis', 'compliance']
            },
            'strategy-team': {
                displayName: 'Strategic Operations Team',
                type: 'Strategic',
                agentCount: 14,
                workflowCount: 17,
                keywords: ['strategy', 'planning', 'leadership'],
                permissions: {
                    network: false,
                    shell: ['echo', 'cat'],
                    sensitiveData: false
                },
                outputTypes: ['plans', 'analysis', 'recommendations', 'reports']
            }
        };
    }

    /**
     * Initialize the template engine
     */
    async initialize() {
        try {
            // Create required directories
            await this.ensureDirectories();

            // Load built-in templates
            await this.loadBuiltInTemplates();

            // Load environment configurations
            await this.loadEnvironmentConfigs();

            // Initialize substitution rules
            this.initializeSubstitutionRules();

            // Initialize validators
            this.initializeValidators();

            console.log('[BMAD Template Engine] Initialized successfully');
            return true;

        } catch (error) {
            console.error('[BMAD Template Engine] Initialization failed:', error.message);
            throw error;
        }
    }

    /**
     * Generate configuration for a specialized team module
     */
    async generateTeamConfiguration(teamCode, options = {}) {
        try {
            const startTime = Date.now();
            console.log(`[BMAD Template Engine] Generating configuration for ${teamCode}`);

            // Validate team code
            if (!this.specializedTeams[teamCode]) {
                throw new Error(`Unknown team code: ${teamCode}`);
            }

            // Prepare generation context
            const context = this.prepareGenerationContext(teamCode, options);

            // Load base template
            const baseTemplate = this.templates.get('team-module-base');
            if (!baseTemplate) {
                throw new Error('Base team module template not found');
            }

            // Apply team-specific customizations
            const customizedTemplate = this.applyTeamCustomizations(baseTemplate, teamCode, context);

            // Perform variable substitution
            const processedTemplate = this.performVariableSubstitution(customizedTemplate, context);

            // Apply environment-specific configurations
            const environmentConfig = this.applyEnvironmentConfig(processedTemplate, options.environment);

            // Handle configuration merging if existing config found
            const finalConfig = await this.handleConfigurationMerging(
                environmentConfig,
                teamCode,
                options.mergeStrategy
            );

            // Validate generated configuration
            if (this.config.enableValidation) {
                const validation = await this.validateConfiguration(finalConfig, teamCode);
                if (!validation.valid) {
                    throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
                }
            }

            // Generate output files
            const outputResult = await this.generateOutputFiles(finalConfig, teamCode, options);

            // Create backup if requested
            if (this.config.enableBackup && options.backup !== false) {
                await this.createConfigurationBackup(teamCode, finalConfig);
            }

            const generationTime = Date.now() - startTime;

            return {
                success: true,
                teamCode,
                configuration: finalConfig,
                outputFiles: outputResult.files,
                generationTime,
                context,
                validation: this.config.enableValidation ?
                    await this.validateConfiguration(finalConfig, teamCode) : null
            };

        } catch (error) {
            console.error(`[BMAD Template Engine] Failed to generate configuration for ${teamCode}:`, error.message);
            return {
                success: false,
                teamCode,
                error: error.message,
                generationTime: Date.now() - Date.now()
            };
        }
    }

    /**
     * Prepare generation context with team and environment variables
     */
    prepareGenerationContext(teamCode, options) {
        const teamConfig = this.specializedTeams[teamCode];
        const timestamp = new Date();

        const context = {
            ...this.generationContext,
            teamCode,
            teamConfig,
            options,
            timestamp,
            variables: new Map([
                // Team identification
                ['TEAM_MODULE_CODE', teamCode],
                ['TEAM_DISPLAY_NAME', teamConfig.displayName],
                ['TEAM_TYPE', teamConfig.type],
                ['TEAM_PREFIX', teamCode.replace('-team', '')],

                // Capabilities
                ['AGENT_COUNT', teamConfig.agentCount.toString()],
                ['WORKFLOW_COUNT', teamConfig.workflowCount.toString()],

                // Keywords
                ['TEAM_KEYWORD_1', teamConfig.keywords[0] || 'bmad'],
                ['TEAM_KEYWORD_2', teamConfig.keywords[1] || 'agent'],
                ['TEAM_KEYWORD_3', teamConfig.keywords[2] || 'workflow'],

                // Installation prompts
                ['INSTALLATION_HEADER', `🎯 Installing ${teamConfig.displayName} Module`],
                ['TEAM_DESCRIPTION', `This module provides ${teamConfig.agentCount} specialized ${teamConfig.type.toLowerCase()} agents.`],

                // Output types
                ['PRIMARY_OUTPUT_TYPE', teamConfig.outputTypes[0]],
                ['SECONDARY_OUTPUT_TYPE', teamConfig.outputTypes[1]],

                // Security
                ['NETWORK_ACCESS_REQUIRED', teamConfig.permissions.network.toString()],
                ['ALLOWED_SHELL_COMMANDS', JSON.stringify(teamConfig.permissions.shell)],
                ['SENSITIVE_DATA_ACCESS', teamConfig.permissions.sensitiveData.toString()],

                // System variables
                ['PROJECT_ROOT', options.projectRoot || process.cwd()],
                ['NPM_PACKAGE_ROOT', `node_modules/@bmad-cybercommand/${teamCode}`],
                ['BMAD_ROOT', this.config.bmadRoot],
                ['TIMESTAMP', timestamp.toISOString()],
                ['GENERATION_ID', this.generateId()],

                // Environment-specific
                ['ENVIRONMENT', options.environment || 'production'],
                ['DEBUG_MODE', options.debug ? 'true' : 'false'],

                // User provided variables
                ...(options.variables || new Map())
            ])
        };

        // Compute derived values
        context.computedValues = this.computeDerivedValues(context);

        return context;
    }

    /**
     * Apply team-specific customizations to base template
     */
    applyTeamCustomizations(baseTemplate, teamCode, context) {
        const teamConfig = this.specializedTeams[teamCode];
        let customizedTemplate = { ...baseTemplate };

        // Team-specific prompt customizations
        if (teamCode === 'cybersec-team') {
            customizedTemplate.team_specific_config = {
                prompt: "What is your security framework preference?",
                default: "nist_cybersecurity_framework",
                result: "{value}",
                'single-select': [
                    { value: "nist_cybersecurity_framework", label: "NIST Cybersecurity Framework" },
                    { value: "iso_27001", label: "ISO 27001 Standard" },
                    { value: "custom_framework", label: "Custom Security Framework" }
                ]
            };
        } else if (teamCode === 'intel-team') {
            customizedTemplate.team_specific_config = {
                prompt: "What is your operational authorization level?",
                default: "accredited_professional",
                result: "{value}",
                'single-select': [
                    { value: "academic_research", label: "Academic Research - Educational use only" },
                    { value: "accredited_professional", label: "Accredited Professional - Licensed investigator" },
                    { value: "law_enforcement", label: "Law Enforcement - Official capacity" }
                ]
            };
        } else if (teamCode === 'legal-team') {
            customizedTemplate.team_specific_config = {
                prompt: "What is your primary jurisdiction?",
                default: "united_states",
                result: "{value}",
                'single-select': [
                    { value: "united_states", label: "United States Federal and State Law" },
                    { value: "european_union", label: "European Union Law" },
                    { value: "spain", label: "Spanish Civil and Commercial Law" },
                    { value: "estonia", label: "Estonian Digital Business Law" },
                    { value: "multi_jurisdiction", label: "Multi-Jurisdictional Practice" }
                ]
            };
        } else if (teamCode === 'strategy-team') {
            customizedTemplate.team_specific_config = {
                prompt: "What is your primary strategic focus?",
                default: "corporate_strategy",
                result: "{value}",
                'single-select': [
                    { value: "corporate_strategy", label: "Corporate Strategy & Leadership" },
                    { value: "political_strategy", label: "Political Strategy & Policy" },
                    { value: "crisis_management", label: "Crisis Management & Response" },
                    { value: "competitive_intelligence", label: "Competitive Intelligence" }
                ]
            };
        }

        // Customize dependency requirements
        customizedTemplate.dependencies = this.generateTeamDependencies(teamCode);

        // Customize integration points
        customizedTemplate.integration = this.generateTeamIntegration(teamCode);

        // Customize agent lists for prompts
        customizedTemplate.prompt = this.generateInstallationPrompts(teamCode, teamConfig);

        return customizedTemplate;
    }

    /**
     * Generate team-specific dependencies
     */
    generateTeamDependencies(teamCode) {
        const baseDependencies = {
            core: [{
                module: "bmad:core",
                version: ">=2.0.0",
                required: true,
                agents: ["abdul", "bmad-master"],
                workflows: ["party-mode", "cross-module", "assign-task"]
            }],
            peer_dependencies: []
        };

        // Add cross-team dependencies based on common workflows
        const crossTeamDeps = {
            'cybersec-team': [
                { module: "@bmad-cybercommand/intel-team", condition: "threat_intel_integration_enabled" },
                { module: "@bmad-cybercommand/legal-team", condition: "compliance_workflows_enabled" }
            ],
            'intel-team': [
                { module: "@bmad-cybercommand/cybersec-team", condition: "threat_intel_integration_enabled" },
                { module: "@bmad-cybercommand/legal-team", condition: "legal_compliance_workflows_enabled" }
            ],
            'legal-team': [
                { module: "@bmad-cybercommand/strategy-team", condition: "strategic_legal_analysis_enabled" }
            ],
            'strategy-team': [
                { module: "@bmad-cybercommand/intel-team", condition: "strategic_intelligence_enabled" },
                { module: "@bmad-cybercommand/legal-team", condition: "legal_strategy_workflows_enabled" }
            ]
        };

        if (crossTeamDeps[teamCode]) {
            baseDependencies.peer_dependencies = crossTeamDeps[teamCode].map(dep => ({
                ...dep,
                version: ">=2.0.0",
                required: false
            }));
        }

        return baseDependencies;
    }

    /**
     * Generate team-specific integration points
     */
    generateTeamIntegration(teamCode) {
        const baseIntegration = {
            exposed_workflows: [],
            consumed_workflows: []
        };

        const teamIntegrations = {
            'cybersec-team': {
                exposed_workflows: [
                    {
                        workflow_id: "security-consultation",
                        trigger: "external",
                        description: "Provides security consultation to other teams",
                        access_level: "cross_team"
                    },
                    {
                        workflow_id: "incident-response",
                        trigger: "urgent",
                        description: "Emergency incident response coordination",
                        access_level: "cross_team"
                    }
                ],
                consumed_workflows: [
                    { source_team: "intel-team", workflow_id: "threat-assessment", condition: "threat_detected" },
                    { source_team: "legal-team", workflow_id: "legal-matter-intake", condition: "legal_review_required" }
                ]
            },
            'intel-team': {
                exposed_workflows: [
                    {
                        workflow_id: "intel-consultation",
                        trigger: "external",
                        description: "Provides intelligence consultation to other teams",
                        access_level: "cross_team"
                    },
                    {
                        workflow_id: "threat-assessment",
                        trigger: "urgent",
                        description: "Emergency threat assessment for security incidents",
                        access_level: "cross_team"
                    }
                ],
                consumed_workflows: [
                    { source_team: "legal-team", workflow_id: "legal-matter-intake", condition: "legal_review_required" },
                    { source_team: "cybersec-team", workflow_id: "incident-response", condition: "security_incident_detected" }
                ]
            },
            'legal-team': {
                exposed_workflows: [
                    {
                        workflow_id: "legal-consultation",
                        trigger: "external",
                        description: "Provides legal consultation to other teams",
                        access_level: "cross_team"
                    },
                    {
                        workflow_id: "legal-matter-intake",
                        trigger: "external",
                        description: "Initial legal matter assessment and routing",
                        access_level: "cross_team"
                    }
                ],
                consumed_workflows: [
                    { source_team: "strategy-team", workflow_id: "strategic-decision", condition: "strategic_input_required" }
                ]
            },
            'strategy-team': {
                exposed_workflows: [
                    {
                        workflow_id: "strategic-consultation",
                        trigger: "external",
                        description: "Provides strategic consultation to other teams",
                        access_level: "cross_team"
                    },
                    {
                        workflow_id: "strategic-decision",
                        trigger: "external",
                        description: "Multi-perspective strategic decision analysis",
                        access_level: "cross_team"
                    }
                ],
                consumed_workflows: [
                    { source_team: "intel-team", workflow_id: "intel-consultation", condition: "intelligence_required" },
                    { source_team: "legal-team", workflow_id: "legal-consultation", condition: "legal_analysis_required" }
                ]
            }
        };

        return teamIntegrations[teamCode] || baseIntegration;
    }

    /**
     * Generate installation prompts for team
     */
    generateInstallationPrompts(teamCode, teamConfig) {
        const agentLists = this.getTeamAgentLists(teamCode);

        return [
            `🎯 Installing ${teamConfig.displayName} Module`,
            "",
            `This module provides ${teamConfig.agentCount} specialized ${teamConfig.type.toLowerCase()} agents:`,
            "",
            `  Core ${teamConfig.type} Team:`,
            ...agentLists.core.map(agent => `  - ${agent}`),
            "",
            `  Extended ${teamConfig.type} Team:`,
            ...agentLists.extended.map(agent => `  - ${agent}`),
            "",
            `${teamConfig.workflowCount} comprehensive ${teamConfig.type.toLowerCase()} workflows included.`,
            this.getAdditionalTeamInfo(teamCode)
        ];
    }

    /**
     * Get team-specific agent lists
     */
    getTeamAgentLists(teamCode) {
        const agentLists = {
            'cybersec-team': {
                core: [
                    "Sentinel (Cybersecurity Operations Director)",
                    "Guardian (Threat Detection Specialist)",
                    "Fortress (Infrastructure Security Specialist)",
                    "Cipher (Cryptography and Data Protection Specialist)"
                ],
                extended: [
                    "Phoenix (Incident Response Coordinator)",
                    "Warden (Compliance and Audit Specialist)",
                    "Scout (Vulnerability Assessment Specialist)",
                    "Shield (Security Training and Awareness Coordinator)"
                ]
            },
            'intel-team': {
                core: [
                    "Vector (Intelligence Operations Director)",
                    "Resolver (Domain Intelligence Specialist)",
                    "Echo (Social Media Intelligence Analyst)",
                    "Shadow (Dark Web Intelligence Analyst)"
                ],
                extended: [
                    "Atlas (Geospatial Intelligence Analyst)",
                    "Probe (Technical Reconnaissance Specialist)",
                    "Dossier (Threat Actor Profiler)",
                    "Proxy (Corporate Intelligence Specialist)",
                    "Viper (Human Intelligence Specialist)",
                    "Sigil (Signals Intelligence Specialist)",
                    "Specter (Field Operations Specialist)"
                ]
            },
            'legal-team': {
                core: [
                    "Counsel (General Counsel and Legal Team Director)",
                    "Liberty (US Federal and State Law Specialist)",
                    "Europa (European Union Law Specialist)",
                    "Iberia (Spanish Civil Law Specialist)"
                ],
                extended: [
                    "Baltic (Estonian Digital Business Law Specialist)",
                    "Charter (Corporate Governance Specialist)",
                    "Covenant (Contract Law Specialist)",
                    "Advocate (Litigation Strategy Specialist)",
                    "Tribute (Tax Law Specialist)",
                    "Insignia (Intellectual Property Specialist)",
                    "Deed (Real Estate Law Specialist)",
                    "Gremio (Spanish Labor Law Specialist)",
                    "Castile (Spanish Corporate Law Specialist)"
                ]
            },
            'strategy-team': {
                core: [
                    "The Master Strategist (Strategic Leadership)",
                    "The Principled Commander (Ethical Leadership)",
                    "The Realist (Practical Strategy)",
                    "The Technocrat (Data-Driven Decisions)"
                ],
                extended: [
                    "The Conservative (Traditional Strategy)",
                    "The Revolutionary (Disruptive Innovation)",
                    "The Liberator (Change Management)",
                    "The Strategist Warrior (Competitive Strategy)",
                    "Communications Director (Strategic Communications)",
                    "Policy Analyst (Policy Development)",
                    "Political Strategist (Political Navigation)",
                    "Ethics Advisor (Ethical Decision Making)",
                    "Stakeholder Mediator (Stakeholder Management)",
                    "Debate Coach (Persuasion and Argumentation)"
                ]
            }
        };

        return agentLists[teamCode] || { core: [], extended: [] };
    }

    /**
     * Get additional team information
     */
    getAdditionalTeamInfo(teamCode) {
        const additionalInfo = {
            'cybersec-team': "Advanced threat detection and incident response for organizational security.",
            'intel-team': "Multi-discipline intelligence operations for accredited professionals.",
            'legal-team': "Cross-jurisdictional legal expertise for complex business matters.",
            'strategy-team': "Multi-perspective strategic analysis for executive decision making."
        };

        return additionalInfo[teamCode] || "Specialized professional workflows and analysis capabilities.";
    }

    /**
     * Perform variable substitution on template
     */
    performVariableSubstitution(template, context) {
        let processedTemplate = JSON.parse(JSON.stringify(template));
        const { variables, computedValues } = context;

        // Recursive substitution function
        const substitute = (obj) => {
            if (typeof obj === 'string') {
                return this.substituteString(obj, variables, computedValues);
            } else if (Array.isArray(obj)) {
                return obj.map(substitute);
            } else if (obj && typeof obj === 'object') {
                const result = {};
                for (const [key, value] of Object.entries(obj)) {
                    result[substitute(key)] = substitute(value);
                }
                return result;
            }
            return obj;
        };

        return substitute(processedTemplate);
    }

    /**
     * Substitute variables in a string
     */
    substituteString(str, variables, computedValues) {
        if (typeof str !== 'string') return str;

        // Handle template variable syntax: {VARIABLE_NAME}
        return str.replace(/\{([^}]+)\}/g, (match, varName) => {
            if (variables.has(varName)) {
                return variables.get(varName);
            } else if (computedValues.has(varName)) {
                return computedValues.get(varName);
            }

            // Special built-in variables
            switch (varName) {
                case 'project-root':
                    return process.cwd();
                case 'npm_package_root':
                    return variables.get('NPM_PACKAGE_ROOT') || '';
                case 'output_folder':
                    return variables.get('OUTPUT_FOLDER') || '_bmad-output/' + variables.get('TEAM_MODULE_CODE');
                case 'value':
                    return match; // Keep as-is for bmad-builder processing
                default:
                    console.warn(`[BMAD Template Engine] Unknown variable: ${varName}`);
                    return match; // Keep original if unknown
            }
        });
    }

    /**
     * Compute derived values from context
     */
    computeDerivedValues(context) {
        const { variables } = context;
        const computed = new Map();

        // Output folder derivations
        const teamCode = variables.get('TEAM_MODULE_CODE');
        const outputFolder = `_bmad-output/${teamCode}`;
        computed.set('OUTPUT_FOLDER', outputFolder);

        // Path derivations
        computed.set('CONFIG_PATH', `${outputFolder}/config`);
        computed.set('AGENTS_PATH', `node_modules/@bmad-cybercommand/${teamCode}/dist/agents`);
        computed.set('WORKFLOWS_PATH', `node_modules/@bmad-cybercommand/${teamCode}/dist/workflows`);
        computed.set('DATA_PATH', `node_modules/@bmad-cybercommand/${teamCode}/dist/data`);
        computed.set('TOOLS_PATH', `node_modules/@bmad-cybercommand/${teamCode}/dist/tools`);

        // Installation metadata
        computed.set('INSTALLATION_ID', this.generateId());
        computed.set('INSTALLATION_TIMESTAMP', context.timestamp.toISOString());

        return computed;
    }

    /**
     * Apply environment-specific configurations
     */
    applyEnvironmentConfig(template, environmentName = 'production') {
        const envConfig = this.environments.get(environmentName) || {};
        let environmentTemplate = { ...template };

        // Apply environment-specific overrides
        if (envConfig.overrides) {
            environmentTemplate = this.deepMerge(environmentTemplate, envConfig.overrides);
        }

        // Add environment metadata
        environmentTemplate.environment = {
            name: environmentName,
            appliedAt: new Date().toISOString(),
            configuration: envConfig
        };

        return environmentTemplate;
    }

    /**
     * Handle configuration merging with existing configs
     */
    async handleConfigurationMerging(newConfig, teamCode, mergeStrategy = 'smart') {
        try {
            const existingConfigPath = path.join(this.config.outputPath, teamCode, 'module.yaml');

            if (!fs.existsSync(existingConfigPath)) {
                // No existing config, return new config as-is
                return newConfig;
            }

            const existingConfig = yaml.parse(fs.readFileSync(existingConfigPath, 'utf8'));

            switch (mergeStrategy) {
                case 'replace':
                    return newConfig;

                case 'preserve':
                    return existingConfig;

                case 'merge-basic':
                    return this.deepMerge(existingConfig, newConfig);

                case 'smart':
                default:
                    return this.smartMerge(existingConfig, newConfig);
            }

        } catch (error) {
            console.warn(`[BMAD Template Engine] Config merge failed, using new config:`, error.message);
            return newConfig;
        }
    }

    /**
     * Smart merge strategy that preserves user customizations
     */
    smartMerge(existing, incoming) {
        const merged = { ...existing };

        // Always update version and metadata
        merged.version = incoming.version;
        merged.updated_at = incoming.updated_at || new Date().toISOString();

        // Merge capabilities (agents/workflows counts may change)
        if (incoming.agents) {
            merged.agents = { ...merged.agents, ...incoming.agents };
        }
        if (incoming.workflows) {
            merged.workflows = { ...merged.workflows, ...incoming.workflows };
        }

        // Preserve user configuration but add new fields
        if (incoming.configuration && merged.configuration) {
            // Preserve user output folder preference
            const userOutputFolder = merged.output_folder?.result || merged.configuration?.outputFolder;
            merged.configuration = { ...incoming.configuration, ...merged.configuration };
            if (userOutputFolder) {
                merged.configuration.outputFolder = userOutputFolder;
            }
        }

        // Update dependencies and integration points
        merged.dependencies = incoming.dependencies;
        merged.integration = incoming.integration;

        // Preserve permissions but warn if changed
        if (incoming.permissions &&
            JSON.stringify(merged.permissions) !== JSON.stringify(incoming.permissions)) {
            console.warn(`[BMAD Template Engine] Permissions have changed for ${existing.name}`);
            merged.permissions = incoming.permissions;
        }

        // Add merge metadata
        merged.merge_info = {
            strategy: 'smart',
            mergedAt: new Date().toISOString(),
            preservedUserConfig: true,
            changes: this.detectChanges(existing, incoming)
        };

        return merged;
    }

    /**
     * Detect changes between configurations
     */
    detectChanges(oldConfig, newConfig) {
        const changes = [];

        // Version changes
        if (oldConfig.version !== newConfig.version) {
            changes.push({
                type: 'version_update',
                field: 'version',
                oldValue: oldConfig.version,
                newValue: newConfig.version
            });
        }

        // Agent count changes
        if (oldConfig.agents?.count !== newConfig.agents?.count) {
            changes.push({
                type: 'capability_change',
                field: 'agents.count',
                oldValue: oldConfig.agents?.count,
                newValue: newConfig.agents?.count
            });
        }

        // Workflow count changes
        if (oldConfig.workflows?.count !== newConfig.workflows?.count) {
            changes.push({
                type: 'capability_change',
                field: 'workflows.count',
                oldValue: oldConfig.workflows?.count,
                newValue: newConfig.workflows?.count
            });
        }

        return changes;
    }

    /**
     * Deep merge two objects
     */
    deepMerge(target, source) {
        const result = { ...target };

        for (const [key, value] of Object.entries(source)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result[key] = this.deepMerge(result[key] || {}, value);
            } else {
                result[key] = value;
            }
        }

        return result;
    }

    /**
     * Generate output files for configuration
     */
    async generateOutputFiles(config, teamCode, options) {
        const outputDir = path.join(this.config.outputPath, teamCode);
        await fs.promises.mkdir(outputDir, { recursive: true });

        const files = [];

        // Main module configuration
        const moduleConfigPath = path.join(outputDir, 'module.yaml');
        await fs.promises.writeFile(moduleConfigPath, yaml.stringify(config, null, 2));
        files.push({ path: moduleConfigPath, type: 'configuration' });

        // Environment-specific config if requested
        if (options.environment && options.environment !== 'production') {
            const envConfigPath = path.join(outputDir, `module.${options.environment}.yaml`);
            await fs.promises.writeFile(envConfigPath, yaml.stringify(config, null, 2));
            files.push({ path: envConfigPath, type: 'environment-configuration' });
        }

        // Installation script if requested
        if (options.generateInstallScript) {
            const installScript = this.generateInstallationScript(config, teamCode);
            const scriptPath = path.join(outputDir, 'install.sh');
            await fs.promises.writeFile(scriptPath, installScript);
            files.push({ path: scriptPath, type: 'installation-script' });
        }

        // Validation report
        const validation = await this.validateConfiguration(config, teamCode);
        const validationPath = path.join(outputDir, 'validation-report.json');
        await fs.promises.writeFile(validationPath, JSON.stringify(validation, null, 2));
        files.push({ path: validationPath, type: 'validation-report' });

        // Generation metadata
        const metadata = {
            teamCode,
            generatedAt: new Date().toISOString(),
            templateEngine: 'BMAD Template Engine v1.0.0',
            options,
            files: files.map(f => ({ ...f, size: fs.statSync(f.path).size }))
        };
        const metadataPath = path.join(outputDir, 'generation-metadata.json');
        await fs.promises.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        files.push({ path: metadataPath, type: 'metadata' });

        return { files, outputDir };
    }

    /**
     * Validate generated configuration
     */
    async validateConfiguration(config, teamCode) {
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            checks: {
                required_fields: false,
                team_specific_config: false,
                dependencies_valid: false,
                permissions_secure: false,
                paths_valid: false
            },
            score: 0
        };

        try {
            // Check required fields
            const requiredFields = ['name', 'version', 'type', 'category', 'agents', 'workflows'];
            const missingFields = requiredFields.filter(field => !config[field]);

            if (missingFields.length === 0) {
                validation.checks.required_fields = true;
            } else {
                validation.errors.push(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Check team-specific configuration
            if (config.team_specific_config) {
                validation.checks.team_specific_config = true;
            } else {
                validation.warnings.push('No team-specific configuration found');
            }

            // Validate dependencies
            if (config.dependencies?.core?.[0]?.version) {
                validation.checks.dependencies_valid = true;
            } else {
                validation.errors.push('Invalid core dependencies configuration');
            }

            // Check permissions security
            if (config.permissions && this.validatePermissions(config.permissions, teamCode)) {
                validation.checks.permissions_secure = true;
            } else {
                validation.warnings.push('Permissions may be overly permissive');
            }

            // Validate paths
            if (this.validatePaths(config)) {
                validation.checks.paths_valid = true;
            } else {
                validation.warnings.push('Some paths may be invalid');
            }

            // Calculate score
            const totalChecks = Object.keys(validation.checks).length;
            const passedChecks = Object.values(validation.checks).filter(Boolean).length;
            validation.score = Math.round((passedChecks / totalChecks) * 100);

            validation.valid = validation.errors.length === 0 && validation.score >= 80;

        } catch (error) {
            validation.valid = false;
            validation.errors.push(`Validation failed: ${error.message}`);
        }

        return validation;
    }

    /**
     * Create backup of current configuration
     */
    async createConfigurationBackup(teamCode, config) {
        const backupDir = path.join(this.config.outputPath, teamCode, 'backups');
        await fs.promises.mkdir(backupDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `module.backup.${timestamp}.yaml`);

        await fs.promises.writeFile(backupFile, yaml.stringify(config, null, 2));

        console.log(`[BMAD Template Engine] Configuration backup created: ${backupFile}`);
        return backupFile;
    }

    /**
     * Load built-in templates
     */
    async loadBuiltInTemplates() {
        // Load the base team module template
        try {
            const templatePath = path.join(__dirname, 'module.yaml.template');
            if (fs.existsSync(templatePath)) {
                const content = fs.readFileSync(templatePath, 'utf8');
                const template = yaml.parse(content);
                this.templates.set('team-module-base', template);
            } else {
                // Create a minimal base template if file doesn't exist
                this.templates.set('team-module-base', this.createMinimalBaseTemplate());
            }
        } catch (error) {
            console.warn('[BMAD Template Engine] Failed to load base template, using minimal template');
            this.templates.set('team-module-base', this.createMinimalBaseTemplate());
        }
    }

    /**
     * Create minimal base template as fallback
     */
    createMinimalBaseTemplate() {
        return {
            code: "{TEAM_MODULE_CODE}",
            name: "{TEAM_DISPLAY_NAME}",
            version: "2.0.0",
            default_selected: false,
            type: "specialized-team",
            category: "BMAD-CYBERCOMMAND",
            npm: {
                scope: "@bmad-cybercommand",
                package_name: "{TEAM_MODULE_CODE}",
                full_name: "@bmad-cybercommand/{TEAM_MODULE_CODE}"
            },
            agents: {
                count: "{AGENT_COUNT}",
                conversion_format: "agent.yaml",
                source_path: "agents/",
                target_path: "dist/agents/"
            },
            workflows: {
                count: "{WORKFLOW_COUNT}",
                conversion_format: "workflow.yaml",
                source_path: "workflows/",
                target_path: "dist/workflows/"
            },
            output_folder: {
                prompt: "Where should {TEAM_MODULE_CODE} save outputs and artifacts?",
                default: "_bmad-output/{TEAM_MODULE_CODE}",
                result: "{project-root}/{value}"
            },
            module_code: {
                result: "{TEAM_MODULE_CODE}"
            }
        };
    }

    /**
     * Load environment configurations
     */
    async loadEnvironmentConfigs() {
        // Development environment
        this.environments.set('development', {
            debug: true,
            enableValidation: true,
            overrides: {
                testing: {
                    unit_tests: true,
                    integration_tests: true,
                    cross_team_tests: true
                }
            }
        });

        // Production environment
        this.environments.set('production', {
            debug: false,
            enableValidation: true,
            overrides: {
                security: {
                    signature_required: true,
                    integrity_check: true
                }
            }
        });

        // Testing environment
        this.environments.set('testing', {
            debug: true,
            enableValidation: false,
            overrides: {
                permissions: {
                    network: false,
                    shell: {
                        allowed_commands: ["echo", "cat"]
                    }
                }
            }
        });
    }

    /**
     * Initialize substitution rules
     */
    initializeSubstitutionRules() {
        // Rules for variable substitution patterns
        this.substitutionRules.set('template_variable', /\{([A-Z_]+)\}/g);
        this.substitutionRules.set('bmad_variable', /\{([a-z_-]+)\}/g);
        this.substitutionRules.set('path_variable', /\{([a-z_-]+(?:_path|_root|_folder))\}/g);
    }

    /**
     * Initialize validators
     */
    initializeValidators() {
        // Validator functions for different aspects
        this.validators.set('required_fields', (config) => {
            const required = ['name', 'version', 'type', 'category'];
            return required.every(field => config[field]);
        });

        this.validators.set('version_format', (config) => {
            return /^\d+\.\d+\.\d+$/.test(config.version);
        });

        this.validators.set('team_code_format', (config) => {
            return /^[a-z]+-team$/.test(config.code);
        });
    }

    /**
     * Validate permissions for security
     */
    validatePermissions(permissions, teamCode) {
        const teamConfig = this.specializedTeams[teamCode];
        if (!teamConfig) return false;

        // Check if permissions match expected team requirements
        const expectedPerms = teamConfig.permissions;

        // Network access validation
        if (permissions.network !== expectedPerms.network) {
            return false;
        }

        // Shell command validation
        if (permissions.shell && expectedPerms.shell) {
            const allowedCommands = new Set(expectedPerms.shell);
            const requestedCommands = new Set(permissions.shell.allowed_commands || []);

            for (const cmd of requestedCommands) {
                if (!allowedCommands.has(cmd)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Validate configuration paths
     */
    validatePaths(config) {
        // Basic path validation
        const pathFields = ['agents_path', 'workflows_path', 'data_path', 'tools_path'];

        for (const field of pathFields) {
            if (config[field] && config[field].result) {
                const pathValue = config[field].result;
                if (!pathValue.includes('/') && !pathValue.includes('\\')) {
                    return false; // Should be a valid path
                }
            }
        }

        return true;
    }

    /**
     * Generate installation script
     */
    generateInstallationScript(config, teamCode) {
        return `#!/bin/bash
# BMAD ${config.name} Installation Script
# Generated by BMAD Template Engine v1.0.0

set -e

echo "🎯 Installing ${config.name}..."

# Check prerequisites
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ NPM is required but not installed"
    exit 1
fi

# Install NPM package
echo "Installing NPM package..."
npm install ${config.npm.full_name}@${config.version}

# Create output directories
echo "Creating output directories..."
mkdir -p ${config.configuration?.outputFolder || '_bmad-output/' + teamCode}

# Run post-install verification
echo "Running post-install verification..."
echo "✅ ${config.name} installed successfully"

echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Configure your ${teamCode} settings"
echo "2. Review the generated configuration"
echo "3. Test the installation with: bmad test ${teamCode}"
`;
    }

    /**
     * Ensure required directories exist
     */
    async ensureDirectories() {
        const dirs = [
            this.config.templatesPath,
            this.config.outputPath,
            path.join(this.config.outputPath, 'backups')
        ];

        for (const dir of dirs) {
            await fs.promises.mkdir(dir, { recursive: true });
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return crypto.randomBytes(8).toString('hex');
    }

    /**
     * Get template engine status
     */
    getStatus() {
        return {
            initialized: this.templates.size > 0,
            templatesLoaded: this.templates.size,
            environmentsLoaded: this.environments.size,
            specializedTeams: Object.keys(this.specializedTeams),
            config: this.config
        };
    }
}

module.exports = BMADTemplateEngine;