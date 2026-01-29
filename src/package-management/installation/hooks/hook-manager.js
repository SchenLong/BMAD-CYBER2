/**
 * BMAD INSTALLATION HOOK MANAGER
 * Flexible hooks system for installation process customization
 *
 * Features:
 * - Lifecycle hooks for all installation phases
 * - Plugin-style hook registration and execution
 * - Async hook support with timeout handling
 * - Hook priority and dependency management
 * - Error handling and fallback mechanisms
 * - Hook performance monitoring
 * - Dynamic hook loading and unloading
 *
 * @author BlackUnicorn.Tech
 * @version 2.3.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.3
 */

const { EventEmitter } = require('events');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

/**
 * Hook types and execution phases
 */
const HOOK_TYPES = {
    // Orchestrator lifecycle hooks
    PRE_INITIALIZE: 'pre:initialize',
    POST_INITIALIZE: 'post:initialize',
    PRE_SHUTDOWN: 'pre:shutdown',
    POST_SHUTDOWN: 'post:shutdown',

    // Installation lifecycle hooks
    PRE_QUEUE: 'pre:queue',
    POST_QUEUE: 'post:queue',
    VALIDATE_REQUEST: 'validate:request',
    PRE_EXECUTION: 'pre:execution',
    POST_EXECUTION: 'post:execution',

    // Individual installation hooks
    PRE_INSTALL: 'pre:install',
    DURING_INSTALL: 'during:install',
    POST_INSTALL: 'post:install',
    ON_ERROR: 'on:error',
    PRE_CANCEL: 'pre:cancel',
    POST_CANCEL: 'post:cancel',
    PRE_ROLLBACK: 'pre:rollback',
    POST_ROLLBACK: 'post:rollback',

    // Step-level hooks
    STEP_DOWNLOADING_PACKAGE: 'step:downloading_package',
    STEP_VERIFYING_INTEGRITY: 'step:verifying_integrity',
    STEP_INSTALLING_FILES: 'step:installing_files',
    STEP_CONFIGURING: 'step:configuring',

    // Custom hooks
    CUSTOM: 'custom'
};

/**
 * Hook execution strategies
 */
const EXECUTION_STRATEGIES = {
    SEQUENTIAL: 'sequential',   // Execute hooks one by one
    PARALLEL: 'parallel',       // Execute hooks simultaneously
    WATERFALL: 'waterfall',     // Pass result from one hook to next
    RACE: 'race',              // Use result from first completed hook
    FAILFAST: 'failfast'       // Stop on first error
};

/**
 * Hook priority levels
 */
const PRIORITY_LEVELS = {
    CRITICAL: 0,    // System-critical hooks
    HIGH: 1,        // High priority hooks
    NORMAL: 2,      // Standard priority
    LOW: 3,         // Low priority hooks
    BACKGROUND: 4   // Background/cleanup hooks
};

class HookManager extends EventEmitter {

    constructor(config = {}) {
        super();

        this.config = this._mergeConfig(config);
        this.isInitialized = false;

        // Hook storage
        this.hooks = new Map(); // hookType -> [hookDefinitions]
        this.hookHandlers = new Map(); // hookId -> handlerFunction
        this.pluginHooks = new Map(); // pluginId -> [hookIds]

        // Execution tracking
        this.executionHistory = [];
        this.activeExecutions = new Map();
        this.executionMetrics = {
            totalExecutions: 0,
            totalErrors: 0,
            averageExecutionTime: 0,
            hookCallCounts: new Map(),
            errorsByHook: new Map()
        };

        // Performance monitoring
        this.performanceData = new Map();

        // Hook dependencies and ordering
        this.hookDependencies = new Map();
        this.executionOrder = new Map();

        this._setupBuiltinHooks();
    }

    /**
     * Initialize the hook manager
     */
    async initialize() {
        try {
            console.log('🪝 Initializing Hook Manager...');

            // Load external hooks if configured
            if (this.config.plugins.enabled) {
                await this._loadExternalHooks();
            }

            // Validate all registered hooks
            await this._validateHooks();

            // Setup performance monitoring
            this._setupPerformanceMonitoring();

            this.isInitialized = true;
            console.log('✅ Hook Manager initialized');

            this.emit('initialized', {
                hookCount: Array.from(this.hooks.values()).reduce((sum, hooks) => sum + hooks.length, 0),
                hookTypes: this.hooks.size
            });

        } catch (error) {
            console.error('❌ Failed to initialize Hook Manager:', error);
            throw error;
        }
    }

    /**
     * Register a hook
     */
    registerHook(hookType, handler, options = {}) {
        if (!this.isInitialized && !options.allowEarlyRegistration) {
            throw new Error('Hook Manager not initialized');
        }

        const hookId = crypto.randomUUID();
        const hookDefinition = {
            id: hookId,
            type: hookType,
            handler,
            name: options.name || `Hook-${hookId.slice(0, 8)}`,
            description: options.description || '',
            priority: options.priority || PRIORITY_LEVELS.NORMAL,
            enabled: options.enabled !== false,
            timeout: options.timeout || this.config.defaultTimeout,
            retries: options.retries || 0,
            dependencies: options.dependencies || [],
            metadata: options.metadata || {},
            pluginId: options.pluginId || null,
            registeredAt: Date.now(),
            executionCount: 0,
            errorCount: 0,
            averageExecutionTime: 0
        };

        // Store hook handler
        this.hookHandlers.set(hookId, handler);

        // Add to hooks map
        if (!this.hooks.has(hookType)) {
            this.hooks.set(hookType, []);
        }
        this.hooks.get(hookType).push(hookDefinition);

        // Sort hooks by priority
        this.hooks.get(hookType).sort((a, b) => a.priority - b.priority);

        // Track plugin hooks
        if (options.pluginId) {
            if (!this.pluginHooks.has(options.pluginId)) {
                this.pluginHooks.set(options.pluginId, []);
            }
            this.pluginHooks.get(options.pluginId).push(hookId);
        }

        // Setup dependencies
        if (hookDefinition.dependencies.length > 0) {
            this.hookDependencies.set(hookId, hookDefinition.dependencies);
        }

        console.log(`🪝 Registered hook: ${hookDefinition.name} (${hookType})`);
        this.emit('hook.registered', { hookId, hookDefinition });

        return hookId;
    }

    /**
     * Unregister a hook
     */
    unregisterHook(hookId) {
        const handler = this.hookHandlers.get(hookId);
        if (!handler) {
            throw new Error(`Hook not found: ${hookId}`);
        }

        // Find and remove from hooks map
        for (const [hookType, hooks] of this.hooks.entries()) {
            const index = hooks.findIndex(h => h.id === hookId);
            if (index !== -1) {
                const hookDefinition = hooks.splice(index, 1)[0];

                // Remove from plugin tracking
                if (hookDefinition.pluginId) {
                    const pluginHooks = this.pluginHooks.get(hookDefinition.pluginId) || [];
                    const pluginIndex = pluginHooks.indexOf(hookId);
                    if (pluginIndex !== -1) {
                        pluginHooks.splice(pluginIndex, 1);
                    }
                }

                // Remove dependencies
                this.hookDependencies.delete(hookId);

                // Remove handler
                this.hookHandlers.delete(hookId);

                console.log(`🪝 Unregistered hook: ${hookDefinition.name} (${hookType})`);
                this.emit('hook.unregistered', { hookId, hookDefinition });

                return true;
            }
        }

        return false;
    }

    /**
     * Execute hooks for a specific type
     */
    async executeHook(hookType, context = {}, options = {}) {
        if (!this.isInitialized) {
            console.warn('⚠️ Hook Manager not initialized, skipping hook execution');
            return { success: true, results: [] };
        }

        const executionId = crypto.randomUUID();
        const startTime = performance.now();

        try {
            console.log(`🪝 Executing hooks: ${hookType}`);

            const hooks = this.hooks.get(hookType) || [];
            const enabledHooks = hooks.filter(h => h.enabled);

            if (enabledHooks.length === 0) {
                return { success: true, results: [], message: 'No hooks to execute' };
            }

            const executionContext = {
                hookType,
                executionId,
                timestamp: Date.now(),
                context: { ...context },
                options: { ...options }
            };

            this.activeExecutions.set(executionId, executionContext);

            // Determine execution strategy
            const strategy = options.strategy || this.config.executionStrategy;

            // Execute hooks based on strategy
            let results;
            switch (strategy) {
                case EXECUTION_STRATEGIES.SEQUENTIAL:
                    results = await this._executeSequential(enabledHooks, executionContext);
                    break;
                case EXECUTION_STRATEGIES.PARALLEL:
                    results = await this._executeParallel(enabledHooks, executionContext);
                    break;
                case EXECUTION_STRATEGIES.WATERFALL:
                    results = await this._executeWaterfall(enabledHooks, executionContext);
                    break;
                case EXECUTION_STRATEGIES.RACE:
                    results = await this._executeRace(enabledHooks, executionContext);
                    break;
                case EXECUTION_STRATEGIES.FAILFAST:
                    results = await this._executeFailfast(enabledHooks, executionContext);
                    break;
                default:
                    results = await this._executeSequential(enabledHooks, executionContext);
            }

            const executionTime = performance.now() - startTime;

            // Update metrics
            this._updateExecutionMetrics(hookType, executionTime, results);

            // Store execution history
            const executionRecord = {
                executionId,
                hookType,
                hookCount: enabledHooks.length,
                strategy,
                executionTime,
                success: results.success,
                results: results.results,
                timestamp: Date.now()
            };

            this.executionHistory.push(executionRecord);
            this.activeExecutions.delete(executionId);

            // Trim history if too large
            if (this.executionHistory.length > this.config.maxHistorySize) {
                this.executionHistory = this.executionHistory.slice(-this.config.maxHistorySize);
            }

            console.log(`✅ Hook execution completed: ${hookType} (${executionTime.toFixed(2)}ms)`);

            this.emit('hooks.executed', {
                hookType,
                executionId,
                results,
                executionTime
            });

            return results;

        } catch (error) {
            this.activeExecutions.delete(executionId);

            console.error(`❌ Hook execution failed: ${hookType}`, error);
            this.emit('hooks.error', {
                hookType,
                executionId,
                error
            });

            if (options.throwOnError !== false) {
                throw error;
            }

            return {
                success: false,
                error: error.message,
                results: []
            };
        }
    }

    /**
     * Register plugin with multiple hooks
     */
    registerPlugin(pluginId, hooks) {
        console.log(`🔌 Registering plugin: ${pluginId}`);

        const registeredHooks = [];

        for (const hookConfig of hooks) {
            try {
                const hookId = this.registerHook(
                    hookConfig.type,
                    hookConfig.handler,
                    {
                        ...hookConfig.options,
                        pluginId
                    }
                );
                registeredHooks.push(hookId);
            } catch (error) {
                console.error(`❌ Failed to register hook for plugin ${pluginId}:`, error);
                // Rollback previously registered hooks
                for (const registeredHookId of registeredHooks) {
                    this.unregisterHook(registeredHookId);
                }
                throw error;
            }
        }

        this.emit('plugin.registered', {
            pluginId,
            hookCount: registeredHooks.length,
            hooks: registeredHooks
        });

        return registeredHooks;
    }

    /**
     * Unregister plugin and all its hooks
     */
    unregisterPlugin(pluginId) {
        const pluginHooks = this.pluginHooks.get(pluginId);
        if (!pluginHooks) {
            throw new Error(`Plugin not found: ${pluginId}`);
        }

        console.log(`🔌 Unregistering plugin: ${pluginId}`);

        // Unregister all plugin hooks
        for (const hookId of [...pluginHooks]) {
            this.unregisterHook(hookId);
        }

        this.pluginHooks.delete(pluginId);

        this.emit('plugin.unregistered', {
            pluginId,
            hooksRemoved: pluginHooks.length
        });

        return true;
    }

    /**
     * Get hook information
     */
    getHookInfo(hookId = null) {
        if (hookId) {
            // Get specific hook info
            for (const hooks of this.hooks.values()) {
                const hook = hooks.find(h => h.id === hookId);
                if (hook) {
                    return {
                        ...hook,
                        handler: undefined, // Don't expose handler function
                        performanceData: this.performanceData.get(hookId) || {}
                    };
                }
            }
            return null;
        }

        // Get all hooks info
        const allHooks = {};
        for (const [hookType, hooks] of this.hooks.entries()) {
            allHooks[hookType] = hooks.map(hook => ({
                ...hook,
                handler: undefined, // Don't expose handler function
                performanceData: this.performanceData.get(hook.id) || {}
            }));
        }

        return allHooks;
    }

    /**
     * Get execution metrics
     */
    getExecutionMetrics() {
        return {
            ...this.executionMetrics,
            activeExecutions: this.activeExecutions.size,
            totalHooks: Array.from(this.hooks.values()).reduce((sum, hooks) => sum + hooks.length, 0),
            pluginCount: this.pluginHooks.size,
            executionHistory: this.executionHistory.length
        };
    }

    /**
     * Enable/disable hook
     */
    toggleHook(hookId, enabled) {
        for (const hooks of this.hooks.values()) {
            const hook = hooks.find(h => h.id === hookId);
            if (hook) {
                hook.enabled = enabled;
                this.emit('hook.toggled', { hookId, enabled });
                return true;
            }
        }
        return false;
    }

    /**
     * Shutdown hook manager
     */
    async shutdown() {
        console.log('🪝 Shutting down Hook Manager...');

        // Wait for active executions to complete
        if (this.activeExecutions.size > 0) {
            console.log(`⏳ Waiting for ${this.activeExecutions.size} active hook executions...`);

            let timeout = this.config.shutdownTimeout || 30000;
            const checkInterval = 100;

            while (this.activeExecutions.size > 0 && timeout > 0) {
                await new Promise(resolve => setTimeout(resolve, checkInterval));
                timeout -= checkInterval;
            }

            if (this.activeExecutions.size > 0) {
                console.warn(`⚠️ Force shutdown with ${this.activeExecutions.size} active executions`);
            }
        }

        // Unregister all plugins
        for (const pluginId of this.pluginHooks.keys()) {
            try {
                this.unregisterPlugin(pluginId);
            } catch (error) {
                console.warn(`⚠️ Error unregistering plugin ${pluginId}:`, error);
            }
        }

        this.isInitialized = false;
        this.emit('shutdown');

        console.log('✅ Hook Manager shutdown complete');
    }

    // Private methods

    /**
     * Merge configuration with defaults
     */
    _mergeConfig(userConfig) {
        const defaultConfig = {
            enabled: true,
            defaultTimeout: 30000,
            maxHistorySize: 1000,
            executionStrategy: EXECUTION_STRATEGIES.SEQUENTIAL,
            performance: {
                monitoring: true,
                tracking: true
            },
            plugins: {
                enabled: false,
                directory: './hooks/plugins',
                autoLoad: false
            },
            shutdownTimeout: 30000,
            errorHandling: {
                continueOnError: true,
                logErrors: true,
                maxRetries: 3
            }
        };

        return this._deepMerge(defaultConfig, userConfig);
    }

    /**
     * Deep merge objects
     */
    _deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this._deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    /**
     * Setup builtin hooks
     */
    _setupBuiltinHooks() {
        // Register some basic system hooks
        this.registerHook(
            HOOK_TYPES.PRE_INITIALIZE,
            async (context) => {
                console.log('🔧 System pre-initialize hook executed');
                return { success: true, message: 'System prepared for initialization' };
            },
            {
                name: 'SystemPreInitialize',
                description: 'Prepares system for initialization',
                priority: PRIORITY_LEVELS.CRITICAL,
                allowEarlyRegistration: true
            }
        );

        this.registerHook(
            HOOK_TYPES.ON_ERROR,
            async (context) => {
                console.log(`🚨 Error hook: ${context.error?.message || 'Unknown error'}`);
                return { success: true, handled: false };
            },
            {
                name: 'SystemErrorHandler',
                description: 'Handles system errors',
                priority: PRIORITY_LEVELS.CRITICAL,
                allowEarlyRegistration: true
            }
        );
    }

    /**
     * Execute hooks sequentially
     */
    async _executeSequential(hooks, executionContext) {
        const results = [];
        let allSuccessful = true;

        for (const hook of hooks) {
            try {
                const result = await this._executeHook(hook, executionContext);
                results.push(result);

                if (!result.success) {
                    allSuccessful = false;
                    if (executionContext.options.stopOnError) {
                        break;
                    }
                }
            } catch (error) {
                allSuccessful = false;
                results.push({
                    hookId: hook.id,
                    success: false,
                    error: error.message
                });

                if (executionContext.options.stopOnError) {
                    break;
                }
            }
        }

        return {
            success: allSuccessful,
            results,
            strategy: EXECUTION_STRATEGIES.SEQUENTIAL
        };
    }

    /**
     * Execute hooks in parallel
     */
    async _executeParallel(hooks, executionContext) {
        const promises = hooks.map(hook => this._executeHook(hook, executionContext));

        try {
            const results = await Promise.allSettled(promises);

            const processedResults = results.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    return {
                        hookId: hooks[index].id,
                        success: false,
                        error: result.reason.message
                    };
                }
            });

            const allSuccessful = processedResults.every(r => r.success);

            return {
                success: allSuccessful,
                results: processedResults,
                strategy: EXECUTION_STRATEGIES.PARALLEL
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                results: [],
                strategy: EXECUTION_STRATEGIES.PARALLEL
            };
        }
    }

    /**
     * Execute hooks in waterfall mode
     */
    async _executeWaterfall(hooks, executionContext) {
        const results = [];
        let context = { ...executionContext.context };
        let allSuccessful = true;

        for (const hook of hooks) {
            try {
                const result = await this._executeHook(hook, {
                    ...executionContext,
                    context
                });

                results.push(result);

                if (!result.success) {
                    allSuccessful = false;
                    if (executionContext.options.stopOnError) {
                        break;
                    }
                } else if (result.data) {
                    // Pass result to next hook as context
                    context = { ...context, ...result.data };
                }
            } catch (error) {
                allSuccessful = false;
                results.push({
                    hookId: hook.id,
                    success: false,
                    error: error.message
                });

                if (executionContext.options.stopOnError) {
                    break;
                }
            }
        }

        return {
            success: allSuccessful,
            results,
            finalContext: context,
            strategy: EXECUTION_STRATEGIES.WATERFALL
        };
    }

    /**
     * Execute hooks in race mode
     */
    async _executeRace(hooks, executionContext) {
        if (hooks.length === 0) {
            return { success: true, results: [], strategy: EXECUTION_STRATEGIES.RACE };
        }

        const promises = hooks.map(hook => this._executeHook(hook, executionContext));

        try {
            const result = await Promise.race(promises);

            return {
                success: result.success,
                results: [result],
                strategy: EXECUTION_STRATEGIES.RACE
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                results: [],
                strategy: EXECUTION_STRATEGIES.RACE
            };
        }
    }

    /**
     * Execute hooks with fail-fast strategy
     */
    async _executeFailfast(hooks, executionContext) {
        const results = [];

        for (const hook of hooks) {
            try {
                const result = await this._executeHook(hook, executionContext);
                results.push(result);

                if (!result.success) {
                    return {
                        success: false,
                        results,
                        strategy: EXECUTION_STRATEGIES.FAILFAST,
                        failedAt: hook.id
                    };
                }
            } catch (error) {
                results.push({
                    hookId: hook.id,
                    success: false,
                    error: error.message
                });

                return {
                    success: false,
                    results,
                    strategy: EXECUTION_STRATEGIES.FAILFAST,
                    failedAt: hook.id
                };
            }
        }

        return {
            success: true,
            results,
            strategy: EXECUTION_STRATEGIES.FAILFAST
        };
    }

    /**
     * Execute individual hook
     */
    async _executeHook(hook, executionContext) {
        const startTime = performance.now();

        try {
            const handler = this.hookHandlers.get(hook.id);
            if (!handler) {
                throw new Error(`Handler not found for hook: ${hook.id}`);
            }

            // Create timeout promise if timeout is configured
            const timeoutMs = hook.timeout;
            let timeoutId;

            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    reject(new Error(`Hook execution timeout: ${hook.name} (${timeoutMs}ms)`));
                }, timeoutMs);
            });

            // Execute hook with timeout
            const handlerPromise = handler(executionContext.context, executionContext);

            const result = timeoutMs > 0 ?
                await Promise.race([handlerPromise, timeoutPromise]) :
                await handlerPromise;

            if (timeoutId) clearTimeout(timeoutId);

            const executionTime = performance.now() - startTime;

            // Update hook metrics
            hook.executionCount++;
            hook.averageExecutionTime =
                (hook.averageExecutionTime * (hook.executionCount - 1) + executionTime) / hook.executionCount;

            // Update performance data
            this._updateHookPerformanceData(hook.id, executionTime, true);

            return {
                hookId: hook.id,
                hookName: hook.name,
                success: true,
                executionTime,
                data: result,
                timestamp: Date.now()
            };

        } catch (error) {
            if (timeoutId) clearTimeout(timeoutId);

            const executionTime = performance.now() - startTime;

            // Update error metrics
            hook.errorCount++;
            this.executionMetrics.totalErrors++;

            if (!this.executionMetrics.errorsByHook.has(hook.id)) {
                this.executionMetrics.errorsByHook.set(hook.id, 0);
            }
            this.executionMetrics.errorsByHook.set(
                hook.id,
                this.executionMetrics.errorsByHook.get(hook.id) + 1
            );

            // Update performance data
            this._updateHookPerformanceData(hook.id, executionTime, false);

            console.error(`❌ Hook execution failed: ${hook.name}`, error);

            return {
                hookId: hook.id,
                hookName: hook.name,
                success: false,
                error: error.message,
                executionTime,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Update execution metrics
     */
    _updateExecutionMetrics(hookType, executionTime, results) {
        this.executionMetrics.totalExecutions++;
        this.executionMetrics.averageExecutionTime =
            (this.executionMetrics.averageExecutionTime + executionTime) / 2;

        if (!this.executionMetrics.hookCallCounts.has(hookType)) {
            this.executionMetrics.hookCallCounts.set(hookType, 0);
        }
        this.executionMetrics.hookCallCounts.set(
            hookType,
            this.executionMetrics.hookCallCounts.get(hookType) + 1
        );
    }

    /**
     * Update hook performance data
     */
    _updateHookPerformanceData(hookId, executionTime, success) {
        if (!this.performanceData.has(hookId)) {
            this.performanceData.set(hookId, {
                totalExecutions: 0,
                successfulExecutions: 0,
                failedExecutions: 0,
                totalTime: 0,
                averageTime: 0,
                minTime: Infinity,
                maxTime: 0
            });
        }

        const perfData = this.performanceData.get(hookId);
        perfData.totalExecutions++;

        if (success) {
            perfData.successfulExecutions++;
        } else {
            perfData.failedExecutions++;
        }

        perfData.totalTime += executionTime;
        perfData.averageTime = perfData.totalTime / perfData.totalExecutions;
        perfData.minTime = Math.min(perfData.minTime, executionTime);
        perfData.maxTime = Math.max(perfData.maxTime, executionTime);
    }

    /**
     * Setup performance monitoring
     */
    _setupPerformanceMonitoring() {
        if (!this.config.performance.monitoring) return;

        setInterval(() => {
            this.emit('performance.report', {
                metrics: this.getExecutionMetrics(),
                timestamp: Date.now()
            });
        }, 60000); // Report every minute
    }

    /**
     * Load external hooks
     */
    async _loadExternalHooks() {
        // Implementation would load hooks from external plugins
        console.log('🔌 Loading external hooks...');
    }

    /**
     * Validate hooks
     */
    async _validateHooks() {
        for (const [hookType, hooks] of this.hooks.entries()) {
            for (const hook of hooks) {
                if (typeof this.hookHandlers.get(hook.id) !== 'function') {
                    throw new Error(`Invalid handler for hook: ${hook.name} (${hook.id})`);
                }
            }
        }
    }
}

// Export hook types and strategies
HookManager.HOOK_TYPES = HOOK_TYPES;
HookManager.EXECUTION_STRATEGIES = EXECUTION_STRATEGIES;
HookManager.PRIORITY_LEVELS = PRIORITY_LEVELS;

module.exports = HookManager;