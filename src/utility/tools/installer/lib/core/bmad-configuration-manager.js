/**
 * BMAD Configuration Manager
 * Epic 3: Story 3.4 - Advanced Variable Substitution & Environment Handling
 *
 * Handles advanced variable substitution, environment-specific configurations,
 * and configuration merging strategies for BMAD module installations.
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const yaml = require("js-yaml");
const os = require('os');

class BMADConfigurationManager {
    constructor(options = {}) {
        this.config = {
            bmadRoot: options.bmadRoot || './_bmad',
            environmentsPath: options.environmentsPath || './_bmad/environments',
            configCachePath: options.configCachePath || './_bmad/config-cache',
            enableCache: options.enableCache !== false,
            cacheTimeout: options.cacheTimeout || 300000, // 5 minutes
            ...options
        };

        // Variable context hierarchy
        this.contextLayers = new Map([
            ['system', new Map()],
            ['environment', new Map()],
            ['project', new Map()],
            ['team', new Map()],
            ['user', new Map()]
        ]);

        // Environment configurations
        this.environments = new Map();

        // Configuration cache
        this.configCache = new Map();

        // Variable resolvers
        this.variableResolvers = new Map();

        // Merge strategies registry
        this.mergeStrategies = new Map();

        this.initializeBuiltinResolvers();
        this.initializeMergeStrategies();
    }

    /**
     * Initialize the configuration manager
     */
    async initialize() {
        try {
            await this.ensureDirectories();
            await this.loadSystemVariables();
            await this.loadEnvironmentConfigurations();
            await this.loadConfigurationCache();

            console.log('[BMAD Configuration Manager] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[BMAD Configuration Manager] Initialization failed:', error.message);
            throw error;
        }
    }

    /**
     * Process configuration with full variable substitution and environment handling
     */
    async processConfiguration(config, context = {}) {
        const startTime = Date.now();

        try {
            // Prepare processing context
            const processingContext = await this.prepareProcessingContext(context);

            // Stage 1: Load and merge environment configurations
            const environmentalConfig = await this.applyEnvironmentConfiguration(config, processingContext);

            // Stage 2: Resolve all variables in context hierarchy
            const resolvedContext = await this.resolveVariableContext(processingContext);

            // Stage 3: Perform recursive variable substitution
            const substitutedConfig = await this.performAdvancedSubstitution(
                environmentalConfig,
                resolvedContext
            );

            // Stage 4: Apply conditional configuration blocks
            const conditionalConfig = await this.applyConditionalConfigurations(
                substitutedConfig,
                resolvedContext
            );

            // Stage 5: Validate and finalize configuration
            const finalConfig = await this.finalizeConfiguration(
                conditionalConfig,
                resolvedContext
            );

            // Cache the processed configuration if enabled
            if (this.config.enableCache) {
                await this.cacheConfiguration(finalConfig, context);
            }

            return {
                success: true,
                configuration: finalConfig,
                processingContext: resolvedContext,
                processingTime: Date.now() - startTime,
                cacheUsed: false
            };

        } catch (error) {
            console.error('[BMAD Configuration Manager] Configuration processing failed:', error.message);
            return {
                success: false,
                error: error.message,
                processingTime: Date.now() - startTime
            };
        }
    }

    /**
     * Prepare comprehensive processing context
     */
    async prepareProcessingContext(inputContext) {
        const context = {
            timestamp: new Date(),
            environment: inputContext.environment || 'production',
            teamCode: inputContext.teamCode,
            projectRoot: inputContext.projectRoot || process.cwd(),
            user: inputContext.user || process.env.USER || os.userInfo().username,
            ...inputContext
        };

        // Load context variables into hierarchy
        await this.loadContextVariables(context);

        return context;
    }

    /**
     * Load variables into the context hierarchy
     */
    async loadContextVariables(context) {
        // System layer variables
        const systemVars = this.contextLayers.get('system');
        systemVars.set('OS', os.platform());
        systemVars.set('ARCH', os.arch());
        systemVars.set('NODE_VERSION', process.version);
        systemVars.set('HOME_DIR', os.homedir());
        systemVars.set('TEMP_DIR', os.tmpdir());
        systemVars.set('HOSTNAME', os.hostname());

        // Environment layer variables
        const envVars = this.contextLayers.get('environment');
        envVars.set('NODE_ENV', process.env.NODE_ENV || 'production');
        envVars.set('ENVIRONMENT', context.environment);
        envVars.set('DEBUG', process.env.DEBUG || 'false');

        // Load environment-specific variables
        const envConfig = this.environments.get(context.environment);
        if (envConfig && envConfig.variables) {
            for (const [key, value] of Object.entries(envConfig.variables)) {
                envVars.set(key, value);
            }
        }

        // Project layer variables
        const projectVars = this.contextLayers.get('project');
        projectVars.set('PROJECT_ROOT', context.projectRoot);
        projectVars.set('BMAD_ROOT', this.config.bmadRoot);
        projectVars.set('BMAD_VERSION', '2.0.0');
        projectVars.set('CONFIG_TIMESTAMP', context.timestamp.toISOString());

        // Load project-specific variables from package.json if available
        await this.loadProjectVariables(projectVars, context.projectRoot);

        // Team layer variables
        if (context.teamCode) {
            const teamVars = this.contextLayers.get('team');
            teamVars.set('TEAM_CODE', context.teamCode);
            teamVars.set('TEAM_OUTPUT_DIR', `_bmad-output/${context.teamCode}`);
            teamVars.set('TEAM_CONFIG_DIR', `_bmad/teams/${context.teamCode}`);
            teamVars.set('TEAM_AGENTS_PATH', `node_modules/@bmad-cybercommand/${context.teamCode}/dist/agents`);
            teamVars.set('TEAM_WORKFLOWS_PATH', `node_modules/@bmad-cybercommand/${context.teamCode}/dist/workflows`);
        }

        // User layer variables
        const userVars = this.contextLayers.get('user');
        userVars.set('USER', context.user);
        userVars.set('USER_CONFIG_DIR', path.join(os.homedir(), '.bmad'));
        userVars.set('USER_CACHE_DIR', path.join(os.homedir(), '.bmad', 'cache'));

        // Load user-specific variables from user config if available
        await this.loadUserVariables(userVars, context.user);
    }

    /**
     * Load project-specific variables from package.json
     */
    async loadProjectVariables(projectVars, projectRoot) {
        try {
            const packageJsonPath = path.join(projectRoot, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

                projectVars.set('PROJECT_NAME', packageJson.name || 'unknown');
                projectVars.set('PROJECT_VERSION', packageJson.version || '0.0.0');
                projectVars.set('PROJECT_DESCRIPTION', packageJson.description || '');

                // Load BMAD-specific configuration from package.json
                if (packageJson.bmad) {
                    for (const [key, value] of Object.entries(packageJson.bmad)) {
                        projectVars.set(`BMAD_${key.toUpperCase()}`, value);
                    }
                }
            }
        } catch (error) {
            console.warn('[BMAD Configuration Manager] Failed to load project variables:', error.message);
        }
    }

    /**
     * Load user-specific variables
     */
    async loadUserVariables(userVars, username) {
        try {
            const userConfigPath = path.join(os.homedir(), '.bmad', 'user-config.yaml');
            if (fs.existsSync(userConfigPath)) {
                const userConfig = yaml.parse(fs.readFileSync(userConfigPath, 'utf8'));

                if (userConfig.variables) {
                    for (const [key, value] of Object.entries(userConfig.variables)) {
                        userVars.set(`USER_${key.toUpperCase()}`, value);
                    }
                }
            }
        } catch (error) {
            console.warn('[BMAD Configuration Manager] Failed to load user variables:', error.message);
        }
    }

    /**
     * Resolve variable context by merging hierarchy layers
     */
    async resolveVariableContext(processingContext) {
        const resolvedContext = { ...processingContext };
        resolvedContext.variables = new Map();

        // Merge variables from all layers (system -> environment -> project -> team -> user)
        const layerOrder = ['system', 'environment', 'project', 'team', 'user'];

        for (const layerName of layerOrder) {
            const layer = this.contextLayers.get(layerName);
            for (const [key, value] of layer) {
                resolvedContext.variables.set(key, value);
            }
        }

        // Apply custom variable resolvers
        for (const [resolverName, resolver] of this.variableResolvers) {
            try {
                const resolverVars = await resolver(resolvedContext);
                for (const [key, value] of Object.entries(resolverVars)) {
                    resolvedContext.variables.set(key, value);
                }
            } catch (error) {
                console.warn(`[BMAD Configuration Manager] Variable resolver ${resolverName} failed:`, error.message);
            }
        }

        return resolvedContext;
    }

    /**
     * Apply environment-specific configuration
     */
    async applyEnvironmentConfiguration(config, context) {
        const envName = context.environment;
        const envConfig = this.environments.get(envName);

        if (!envConfig) {
            console.warn(`[BMAD Configuration Manager] Environment '${envName}' not found, using base configuration`);
            return config;
        }

        let environmentalConfig = { ...config };

        // Apply environment overrides
        if (envConfig.overrides) {
            environmentalConfig = this.deepMerge(environmentalConfig, envConfig.overrides);
        }

        // Apply conditional environment blocks
        if (envConfig.conditionals) {
            for (const conditional of envConfig.conditionals) {
                if (await this.evaluateCondition(conditional.condition, context)) {
                    environmentalConfig = this.deepMerge(environmentalConfig, conditional.configuration);
                }
            }
        }

        // Add environment metadata
        environmentalConfig._environment = {
            name: envName,
            appliedAt: new Date().toISOString(),
            configurationSource: envConfig.source || 'built-in'
        };

        return environmentalConfig;
    }

    /**
     * Perform advanced variable substitution with support for:
     * - Simple variables: {VAR}
     * - Nested variables: {PARENT.CHILD}
     * - Function calls: {function(args)}
     * - Conditional expressions: {VAR ? value1 : value2}
     * - Default values: {VAR || default}
     */
    async performAdvancedSubstitution(config, context) {
        const substitutionContext = {
            variables: context.variables,
            functions: this.getSubstitutionFunctions(context),
            depth: 0,
            maxDepth: 10
        };

        return this.recursiveSubstitution(config, substitutionContext);
    }

    /**
     * Recursive substitution with cycle detection
     */
    recursiveSubstitution(obj, context) {
        if (context.depth > context.maxDepth) {
            throw new Error('Maximum substitution depth exceeded - possible circular reference');
        }

        if (typeof obj === 'string') {
            return this.substituteString(obj, { ...context, depth: context.depth + 1 });
        } else if (Array.isArray(obj)) {
            return obj.map(item => this.recursiveSubstitution(item, context));
        } else if (obj && typeof obj === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                const substitutedKey = this.substituteString(key, context);
                result[substitutedKey] = this.recursiveSubstitution(value, context);
            }
            return result;
        }

        return obj;
    }

    /**
     * Advanced string substitution with multiple pattern support
     */
    substituteString(str, context) {
        if (typeof str !== 'string') return str;

        let result = str;

        // Pattern 1: Simple variables {VAR}
        result = result.replace(/\{([A-Z_][A-Z0-9_]*)\}/g, (match, varName) => {
            if (context.variables.has(varName)) {
                return context.variables.get(varName);
            }
            return match;
        });

        // Pattern 2: Nested variables {PARENT.CHILD}
        result = result.replace(/\{([A-Z_][A-Z0-9_]*\.[A-Z_][A-Z0-9_]*(?:\.[A-Z_][A-Z0-9_]*)*)\}/g, (match, path) => {
            const value = this.resolveNestedVariable(path, context);
            return value !== undefined ? value : match;
        });

        // Pattern 3: Function calls {function(args)}
        result = result.replace(/\{([a-z_][a-z0-9_]*)\(([^)]*)\)\}/g, (match, funcName, args) => {
            if (context.functions.has(funcName)) {
                try {
                    const func = context.functions.get(funcName);
                    const parsedArgs = this.parseArguments(args, context);
                    return func(...parsedArgs);
                } catch (error) {
                    console.warn(`[BMAD Configuration Manager] Function ${funcName} failed:`, error.message);
                    return match;
                }
            }
            return match;
        });

        // Pattern 4: Conditional expressions {VAR ? value1 : value2}
        result = result.replace(/\{([^}]+)\s*\?\s*([^:]+)\s*:\s*([^}]+)\}/g, (match, condition, trueValue, falseValue) => {
            try {
                const conditionResult = this.evaluateSimpleCondition(condition, context);
                return conditionResult ? trueValue.trim() : falseValue.trim();
            } catch (error) {
                return match;
            }
        });

        // Pattern 5: Default values {VAR || default}
        result = result.replace(/\{([A-Z_][A-Z0-9_]*)\s*\|\|\s*([^}]+)\}/g, (match, varName, defaultValue) => {
            if (context.variables.has(varName)) {
                const value = context.variables.get(varName);
                return value !== undefined && value !== null && value !== '' ? value : defaultValue.trim();
            }
            return defaultValue.trim();
        });

        return result;
    }

    /**
     * Resolve nested variable paths like PARENT.CHILD
     */
    resolveNestedVariable(path, context) {
        const parts = path.split('.');
        let current = null;

        // Try to find the root variable
        const rootVar = parts[0];
        if (context.variables.has(rootVar)) {
            current = context.variables.get(rootVar);
        } else {
            return undefined;
        }

        // Navigate through the path
        for (let i = 1; i < parts.length; i++) {
            if (current && typeof current === 'object' && parts[i] in current) {
                current = current[parts[i]];
            } else {
                return undefined;
            }
        }

        return current;
    }

    /**
     * Parse function arguments
     */
    parseArguments(argsString, context) {
        if (!argsString.trim()) return [];

        const args = [];
        const argParts = argsString.split(',');

        for (let part of argParts) {
            part = part.trim();

            // String literal
            if ((part.startsWith('"') && part.endsWith('"')) ||
                (part.startsWith("'") && part.endsWith("'"))) {
                args.push(part.slice(1, -1));
            }
            // Number
            else if (/^\d+(\.\d+)?$/.test(part)) {
                args.push(parseFloat(part));
            }
            // Boolean
            else if (part === 'true' || part === 'false') {
                args.push(part === 'true');
            }
            // Variable reference
            else if (context.variables.has(part)) {
                args.push(context.variables.get(part));
            }
            // Default to string
            else {
                args.push(part);
            }
        }

        return args;
    }

    /**
     * Get substitution functions
     */
    getSubstitutionFunctions(context) {
        const functions = new Map();

        // Date/time functions
        functions.set('now', () => new Date().toISOString());
        functions.set('date', (format = 'iso') => {
            const date = new Date();
            switch (format) {
                case 'iso': return date.toISOString();
                case 'short': return date.toLocaleDateString();
                case 'long': return date.toLocaleString();
                default: return date.toISOString();
            }
        });

        // Path functions
        functions.set('join', (...parts) => path.join(...parts));
        functions.set('resolve', (...parts) => path.resolve(...parts));
        functions.set('dirname', (filePath) => path.dirname(filePath));
        functions.set('basename', (filePath, ext) => path.basename(filePath, ext));

        // String functions
        functions.set('upper', (str) => String(str).toUpperCase());
        functions.set('lower', (str) => String(str).toLowerCase());
        functions.set('replace', (str, search, replacement) => String(str).replace(search, replacement));

        // Environment functions
        functions.set('env', (varName, defaultValue = '') => process.env[varName] || defaultValue);

        // UUID generation
        functions.set('uuid', () => require('crypto').randomBytes(16).toString('hex'));

        // Hash functions
        functions.set('hash', (input, algorithm = 'sha256') => {
            return require('crypto').createHash(algorithm).update(String(input)).digest('hex');
        });

        return functions;
    }

    /**
     * Evaluate simple conditions
     */
    evaluateSimpleCondition(condition, context) {
        const cleanCondition = condition.trim();

        // Variable existence check
        if (context.variables.has(cleanCondition)) {
            const value = context.variables.get(cleanCondition);
            return value !== undefined && value !== null && value !== '' && value !== false;
        }

        // Negation check
        if (cleanCondition.startsWith('!')) {
            const varName = cleanCondition.slice(1);
            if (context.variables.has(varName)) {
                const value = context.variables.get(varName);
                return !(value !== undefined && value !== null && value !== '' && value !== false);
            }
        }

        return false;
    }

    /**
     * Apply conditional configuration blocks
     */
    async applyConditionalConfigurations(config, context) {
        if (!config._conditionals) {
            return config;
        }

        let conditionalConfig = { ...config };
        delete conditionalConfig._conditionals;

        for (const conditional of config._conditionals) {
            if (await this.evaluateCondition(conditional.condition, context)) {
                conditionalConfig = this.deepMerge(conditionalConfig, conditional.configuration);
            }
        }

        return conditionalConfig;
    }

    /**
     * Evaluate complex conditions
     */
    async evaluateCondition(condition, context) {
        if (typeof condition === 'string') {
            return this.evaluateSimpleCondition(condition, context);
        }

        if (typeof condition === 'object') {
            // AND condition
            if (condition.and) {
                for (const subCondition of condition.and) {
                    if (!(await this.evaluateCondition(subCondition, context))) {
                        return false;
                    }
                }
                return true;
            }

            // OR condition
            if (condition.or) {
                for (const subCondition of condition.or) {
                    if (await this.evaluateCondition(subCondition, context)) {
                        return true;
                    }
                }
                return false;
            }

            // Equality check
            if (condition.equals) {
                const [varName, expectedValue] = condition.equals;
                const actualValue = context.variables.get(varName);
                return actualValue === expectedValue;
            }

            // Environment check
            if (condition.environment) {
                return context.environment === condition.environment;
            }

            // Team check
            if (condition.team) {
                return context.teamCode === condition.team;
            }
        }

        return false;
    }

    /**
     * Finalize configuration with validation and cleanup
     */
    async finalizeConfiguration(config, context) {
        let finalConfig = { ...config };

        // Remove internal metadata
        delete finalConfig._environment;
        delete finalConfig._conditionals;
        delete finalConfig._processing;

        // Add generation metadata
        finalConfig._metadata = {
            generatedAt: new Date().toISOString(),
            environment: context.environment,
            teamCode: context.teamCode,
            configurationVersion: '2.0.0',
            templateEngine: 'BMAD Configuration Manager v1.0.0'
        };

        // Validate final configuration
        const validation = await this.validateFinalConfiguration(finalConfig, context);
        if (!validation.valid) {
            console.warn('[BMAD Configuration Manager] Configuration validation warnings:', validation.warnings);
        }

        return finalConfig;
    }

    /**
     * Initialize built-in variable resolvers
     */
    initializeBuiltinResolvers() {
        // Git information resolver
        this.variableResolvers.set('git', async (context) => {
            const gitVars = {};
            try {
                const { exec } = require('child_process');
                const { promisify } = require('util');
                const execAsync = promisify(exec);

                const branch = await execAsync('git rev-parse --abbrev-ref HEAD');
                const commit = await execAsync('git rev-parse HEAD');
                const shortCommit = await execAsync('git rev-parse --short HEAD');

                gitVars.GIT_BRANCH = branch.stdout.trim();
                gitVars.GIT_COMMIT = commit.stdout.trim();
                gitVars.GIT_SHORT_COMMIT = shortCommit.stdout.trim();
            } catch (error) {
                // Git not available or not a git repository
                gitVars.GIT_BRANCH = 'unknown';
                gitVars.GIT_COMMIT = 'unknown';
                gitVars.GIT_SHORT_COMMIT = 'unknown';
            }
            return gitVars;
        });

        // Network information resolver
        this.variableResolvers.set('network', async (context) => {
            const networkVars = {};
            try {
                const networkInterfaces = os.networkInterfaces();
                const primaryInterface = Object.values(networkInterfaces)
                    .flat()
                    .find(interface => !interface.internal && interface.family === 'IPv4');

                if (primaryInterface) {
                    networkVars.LOCAL_IP = primaryInterface.address;
                    networkVars.MAC_ADDRESS = primaryInterface.mac;
                }
            } catch (error) {
                networkVars.LOCAL_IP = 'unknown';
                networkVars.MAC_ADDRESS = 'unknown';
            }
            return networkVars;
        });
    }

    /**
     * Initialize merge strategies
     */
    initializeMergeStrategies() {
        // Replace strategy - completely replace with new configuration
        this.mergeStrategies.set('replace', (existing, incoming) => {
            return { ...incoming };
        });

        // Preserve strategy - keep existing configuration
        this.mergeStrategies.set('preserve', (existing, incoming) => {
            return { ...existing };
        });

        // Shallow merge strategy
        this.mergeStrategies.set('shallow', (existing, incoming) => {
            return { ...existing, ...incoming };
        });

        // Deep merge strategy
        this.mergeStrategies.set('deep', (existing, incoming) => {
            return this.deepMerge(existing, incoming);
        });

        // Smart merge strategy - preserves user customizations
        this.mergeStrategies.set('smart', (existing, incoming) => {
            return this.smartMerge(existing, incoming);
        });

        // Additive strategy - only adds new fields, never overwrites
        this.mergeStrategies.set('additive', (existing, incoming) => {
            return this.additiveMerge(existing, incoming);
        });
    }

    /**
     * Smart merge that preserves user customizations
     */
    smartMerge(existing, incoming) {
        const merged = { ...existing };

        // Always update version and system metadata
        merged.version = incoming.version;
        merged._metadata = incoming._metadata;

        // Preserve user-modified fields
        const userModifiableFields = [
            'output_folder',
            'team_specific_config',
            'customizations',
            'user_preferences'
        ];

        // Merge other fields while preserving user modifications
        for (const [key, value] of Object.entries(incoming)) {
            if (!userModifiableFields.includes(key)) {
                merged[key] = value;
            } else if (!(key in existing)) {
                // Add new user-modifiable fields
                merged[key] = value;
            }
            // Keep existing user modifications for user-modifiable fields
        }

        return merged;
    }

    /**
     * Additive merge - only adds new fields
     */
    additiveMerge(existing, incoming) {
        const merged = { ...existing };

        for (const [key, value] of Object.entries(incoming)) {
            if (!(key in merged)) {
                merged[key] = value;
            }
        }

        return merged;
    }

    /**
     * Deep merge utility
     */
    deepMerge(target, source) {
        const result = { ...target };

        for (const [key, value] of Object.entries(source)) {
            if (value && typeof value === 'object' && !Array.isArray(value) &&
                result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
                result[key] = this.deepMerge(result[key], value);
            } else {
                result[key] = value;
            }
        }

        return result;
    }

    /**
     * Load system variables
     */
    async loadSystemVariables() {
        // Already loaded in loadContextVariables
    }

    /**
     * Load environment configurations
     */
    async loadEnvironmentConfigurations() {
        const envConfigs = {
            development: {
                variables: {
                    DEBUG: 'true',
                    LOG_LEVEL: 'debug',
                    CACHE_ENABLED: 'false'
                },
                overrides: {
                    testing: {
                        unit_tests: true,
                        integration_tests: true
                    },
                    security: {
                        signature_required: false
                    }
                }
            },
            production: {
                variables: {
                    DEBUG: 'false',
                    LOG_LEVEL: 'info',
                    CACHE_ENABLED: 'true'
                },
                overrides: {
                    security: {
                        signature_required: true,
                        integrity_check: true
                    }
                }
            },
            testing: {
                variables: {
                    DEBUG: 'true',
                    LOG_LEVEL: 'debug',
                    MOCK_EXTERNAL_SERVICES: 'true'
                },
                overrides: {
                    permissions: {
                        network: false,
                        sensitive_data: false
                    }
                }
            }
        };

        for (const [envName, envConfig] of Object.entries(envConfigs)) {
            this.environments.set(envName, envConfig);
        }
    }

    /**
     * Validate final configuration
     */
    async validateFinalConfiguration(config, context) {
        const validation = {
            valid: true,
            errors: [],
            warnings: []
        };

        // Check for unresolved variables
        const configStr = JSON.stringify(config);
        const unresolvedVars = configStr.match(/\{[^}]+\}/g);
        if (unresolvedVars && unresolvedVars.length > 0) {
            validation.warnings.push(`Unresolved variables found: ${unresolvedVars.join(', ')}`);
        }

        // Check required fields
        const requiredFields = ['name', 'version', 'type', 'category'];
        for (const field of requiredFields) {
            if (!config[field]) {
                validation.errors.push(`Missing required field: ${field}`);
                validation.valid = false;
            }
        }

        return validation;
    }

    /**
     * Cache processed configuration
     */
    async cacheConfiguration(config, context) {
        if (!this.config.enableCache) return;

        const cacheKey = this.generateCacheKey(context);
        const cacheEntry = {
            configuration: config,
            context,
            timestamp: new Date(),
            ttl: this.config.cacheTimeout
        };

        this.configCache.set(cacheKey, cacheEntry);

        // Persist to disk if cache directory exists
        try {
            await fs.promises.mkdir(this.config.configCachePath, { recursive: true });
            const cacheFile = path.join(this.config.configCachePath, `${cacheKey}.json`);
            await fs.promises.writeFile(cacheFile, JSON.stringify(cacheEntry, null, 2));
        } catch (error) {
            console.warn('[BMAD Configuration Manager] Failed to persist cache:', error.message);
        }
    }

    /**
     * Load configuration cache
     */
    async loadConfigurationCache() {
        if (!this.config.enableCache) return;

        try {
            if (fs.existsSync(this.config.configCachePath)) {
                const files = await fs.promises.readdir(this.config.configCachePath);
                const jsonFiles = files.filter(file => file.endsWith('.json'));

                for (const file of jsonFiles) {
                    try {
                        const filePath = path.join(this.config.configCachePath, file);
                        const content = await fs.promises.readFile(filePath, 'utf8');
                        const cacheEntry = JSON.parse(content);

                        // Check if cache entry is still valid
                        const age = Date.now() - new Date(cacheEntry.timestamp).getTime();
                        if (age < cacheEntry.ttl) {
                            const cacheKey = path.basename(file, '.json');
                            this.configCache.set(cacheKey, cacheEntry);
                        } else {
                            // Remove expired cache file
                            await fs.promises.unlink(filePath);
                        }
                    } catch (error) {
                        console.warn(`[BMAD Configuration Manager] Failed to load cache file ${file}:`, error.message);
                    }
                }
            }
        } catch (error) {
            console.warn('[BMAD Configuration Manager] Failed to load configuration cache:', error.message);
        }
    }

    /**
     * Generate cache key for context
     */
    generateCacheKey(context) {
        const keyData = {
            environment: context.environment,
            teamCode: context.teamCode,
            projectRoot: context.projectRoot,
            user: context.user
        };

        const keyString = JSON.stringify(keyData);
        return require('crypto').createHash('md5').update(keyString).digest('hex');
    }

    /**
     * Ensure required directories exist
     */
    async ensureDirectories() {
        const dirs = [
            this.config.environmentsPath,
            this.config.configCachePath
        ];

        for (const dir of dirs) {
            await fs.promises.mkdir(dir, { recursive: true });
        }
    }

    /**
     * Get configuration manager status
     */
    getStatus() {
        return {
            initialized: true,
            environments: Array.from(this.environments.keys()),
            variableResolvers: Array.from(this.variableResolvers.keys()),
            mergeStrategies: Array.from(this.mergeStrategies.keys()),
            cacheSize: this.configCache.size,
            config: this.config
        };
    }

    /**
     * Clear configuration cache
     */
    async clearCache() {
        this.configCache.clear();

        try {
            if (fs.existsSync(this.config.configCachePath)) {
                const files = await fs.promises.readdir(this.config.configCachePath);
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        await fs.promises.unlink(path.join(this.config.configCachePath, file));
                    }
                }
            }
        } catch (error) {
            console.warn('[BMAD Configuration Manager] Failed to clear cache directory:', error.message);
        }
    }
}

module.exports = BMADConfigurationManager;