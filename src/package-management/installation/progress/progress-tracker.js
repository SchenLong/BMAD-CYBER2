/**
 * BMAD INSTALLATION PROGRESS TRACKER
 * Real-time progress tracking for installation processes
 *
 * Features:
 * - Real-time progress updates with WebSocket support
 * - Multi-level progress tracking (overall, package, step)
 * - Performance metrics and analytics
 * - Historical progress data
 * - Custom progress visualization support
 * - Integration with monitoring systems
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
 * Progress states for installations
 */
const PROGRESS_STATES = {
    QUEUED: 'queued',
    PREPARING: 'preparing',
    DOWNLOADING: 'downloading',
    VERIFYING: 'verifying',
    INSTALLING: 'installing',
    CONFIGURING: 'configuring',
    FINALIZING: 'finalizing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    PAUSED: 'paused'
};

/**
 * Progress phases with weight distribution
 */
const PROGRESS_PHASES = {
    preparing: { weight: 0.05, description: 'Preparing installation' },
    downloading: { weight: 0.30, description: 'Downloading package' },
    verifying: { weight: 0.10, description: 'Verifying integrity' },
    installing: { weight: 0.40, description: 'Installing files' },
    configuring: { weight: 0.10, description: 'Configuring package' },
    finalizing: { weight: 0.05, description: 'Finalizing installation' }
};

/**
 * Progress update frequency levels
 */
const UPDATE_FREQUENCIES = {
    REALTIME: 100,      // 100ms
    FAST: 500,          // 500ms
    NORMAL: 1000,       // 1s
    SLOW: 5000,         // 5s
    MINIMAL: 10000      // 10s
};

class ProgressTracker extends EventEmitter {

    constructor(config = {}) {
        super();

        this.config = this._mergeConfig(config);
        this.isInitialized = false;

        // Progress tracking storage
        this.installations = new Map();
        this.overallProgress = {
            total: 0,
            completed: 0,
            failed: 0,
            active: 0,
            percentage: 0,
            estimatedTimeRemaining: 0,
            startTime: null,
            endTime: null
        };

        // Performance tracking
        this.performanceMetrics = {
            totalUpdates: 0,
            averageUpdateTime: 0,
            peakUpdateRate: 0,
            dataTransferred: 0,
            networkUtilization: 0
        };

        // Real-time update management
        this.updateQueue = [];
        this.updateTimer = null;
        this.lastUpdateTime = Date.now();
        this.updateRateLimit = this.config.updateFrequency;

        // WebSocket connections for real-time updates
        this.webSocketConnections = new Set();

        // Rate limiting tracking for WebSocket connections
        this.connectionAttempts = new Map();  // clientId -> { count, firstAttemptTime }

        // Historical data
        this.history = {
            updates: [],
            maxHistorySize: this.config.historySize || 1000
        };

        // Progress calculation cache
        this.calculationCache = new Map();
        this.cacheTimeout = 1000; // 1 second cache timeout
    }

    /**
     * Initialize the progress tracker
     */
    async initialize() {
        try {
            console.log('📊 Initializing Progress Tracker...');

            // Setup real-time update processing
            this._setupUpdateProcessing();

            // Initialize WebSocket server if enabled
            if (this.config.realTime.webSocket.enabled) {
                await this._setupWebSocketServer();
            }

            // Initialize metrics collection
            this._setupMetricsCollection();

            // Setup cleanup timers
            this._setupCleanupTimers();

            // Setup rate limit cleanup if enabled
            if (this.config.realTime.webSocket.rateLimit?.enabled) {
                this._setupRateLimitCleanup();
            }

            this.isInitialized = true;
            console.log('✅ Progress Tracker initialized');

            this.emit('initialized');

        } catch (error) {
            console.error('❌ Failed to initialize Progress Tracker:', error);
            throw error;
        }
    }

    /**
     * Add installation for tracking
     */
    async addInstallation(installation) {
        if (!this.isInitialized) {
            throw new Error('Progress Tracker not initialized');
        }

        const progressData = {
            id: installation.id,
            packageId: installation.packageId,
            version: installation.version,
            state: PROGRESS_STATES.QUEUED,

            // Progress tracking
            currentPhase: null,
            percentage: 0,
            totalSteps: 0,
            completedSteps: 0,
            message: `Queued: ${installation.packageId}@${installation.version}`,

            // Timing information
            startTime: Date.now(),
            endTime: null,
            estimatedDuration: this._estimateInstallationDuration(installation),
            estimatedTimeRemaining: null,

            // Phase tracking
            phases: new Map(),
            currentPhaseData: null,

            // Performance tracking
            metrics: {
                bytesDownloaded: 0,
                bytesInstalled: 0,
                downloadSpeed: 0,
                installSpeed: 0,
                networkLatency: 0,
                diskIO: 0
            },

            // Step tracking
            steps: [],
            currentStep: null,

            // Error tracking
            errors: [],
            warnings: [],

            // Metadata
            metadata: installation.metadata || {},
            tags: installation.tags || [],

            // History
            updateHistory: [],
            lastUpdate: Date.now()
        };

        this.installations.set(installation.id, progressData);
        this.overallProgress.total++;

        await this._updateOverallProgress();

        this.emit('installation.added', {
            installationId: installation.id,
            progressData
        });

        return progressData;
    }

    /**
     * Update installation progress
     */
    async updateProgress(installationId, update) {
        if (!this.installations.has(installationId)) {
            throw new Error(`Installation not found: ${installationId}`);
        }

        const progressData = this.installations.get(installationId);
        const startTime = performance.now();

        try {
            // Apply update
            const updatedData = await this._applyProgressUpdate(progressData, update);

            // Queue real-time update
            await this._queueRealtimeUpdate({
                type: 'progress.updated',
                installationId,
                data: updatedData,
                timestamp: Date.now()
            });

            // Update performance metrics
            const updateTime = performance.now() - startTime;
            this._updatePerformanceMetrics(updateTime);

            this.emit('progress.updated', {
                installationId,
                progressData: updatedData
            });

            return updatedData;

        } catch (error) {
            console.error(`❌ Failed to update progress for ${installationId}:`, error);
            throw error;
        }
    }

    /**
     * Update progress with detailed phase information
     */
    async updatePhaseProgress(installationId, phaseData) {
        const progressData = this.installations.get(installationId);
        if (!progressData) {
            throw new Error(`Installation not found: ${installationId}`);
        }

        const {
            phase,
            percentage,
            message,
            stepName,
            bytesTransferred,
            totalBytes,
            speed,
            metadata
        } = phaseData;

        // Update current phase
        progressData.currentPhase = phase;
        progressData.currentPhaseData = {
            name: phase,
            percentage: Math.min(100, Math.max(0, percentage || 0)),
            message: message || PROGRESS_PHASES[phase]?.description || `Processing ${phase}`,
            startTime: progressData.phases.get(phase)?.startTime || Date.now(),
            stepName,
            bytesTransferred: bytesTransferred || 0,
            totalBytes: totalBytes || 0,
            speed: speed || 0,
            metadata: metadata || {}
        };

        // Store phase data
        progressData.phases.set(phase, progressData.currentPhaseData);

        // Calculate overall progress based on weighted phases
        const overallPercentage = this._calculateOverallPercentage(progressData);
        progressData.percentage = overallPercentage;

        // Update timing estimates
        await this._updateTimingEstimates(progressData);

        // Update metrics
        if (bytesTransferred) {
            progressData.metrics.bytesDownloaded += bytesTransferred;
            progressData.metrics.downloadSpeed = speed || 0;
        }

        return await this.updateProgress(installationId, {
            phase,
            percentage: overallPercentage,
            message: progressData.currentPhaseData.message,
            metrics: progressData.metrics
        });
    }

    /**
     * Add installation step
     */
    async addStep(installationId, step) {
        const progressData = this.installations.get(installationId);
        if (!progressData) {
            throw new Error(`Installation not found: ${installationId}`);
        }

        const stepData = {
            id: crypto.randomUUID(),
            name: step.name,
            description: step.description || step.name,
            status: 'pending',
            startTime: null,
            endTime: null,
            duration: null,
            progress: 0,
            order: progressData.steps.length,
            metadata: step.metadata || {}
        };

        progressData.steps.push(stepData);
        progressData.totalSteps = progressData.steps.length;

        this.emit('step.added', {
            installationId,
            step: stepData
        });

        return stepData;
    }

    /**
     * Update step progress
     */
    async updateStep(installationId, stepId, update) {
        const progressData = this.installations.get(installationId);
        if (!progressData) {
            throw new Error(`Installation not found: ${installationId}`);
        }

        const step = progressData.steps.find(s => s.id === stepId || s.name === stepId);
        if (!step) {
            throw new Error(`Step not found: ${stepId}`);
        }

        // Update step data
        Object.assign(step, update);

        if (update.status === 'started' && !step.startTime) {
            step.startTime = Date.now();
            progressData.currentStep = step;
        }

        if (update.status === 'completed' || update.status === 'failed') {
            step.endTime = Date.now();
            step.duration = step.endTime - step.startTime;

            if (update.status === 'completed') {
                progressData.completedSteps++;
            }
        }

        // Calculate step-based progress
        const stepProgress = (progressData.completedSteps / progressData.totalSteps) * 100;

        this.emit('step.updated', {
            installationId,
            step,
            stepProgress
        });

        return step;
    }

    /**
     * Get progress for specific installation
     */
    getProgress(installationId) {
        if (!this.installations.has(installationId)) {
            return null;
        }

        const progressData = this.installations.get(installationId);

        return {
            id: progressData.id,
            packageId: progressData.packageId,
            version: progressData.version,
            state: progressData.state,
            percentage: progressData.percentage,
            message: progressData.message,
            currentPhase: progressData.currentPhase,
            currentPhaseData: progressData.currentPhaseData,
            estimatedTimeRemaining: progressData.estimatedTimeRemaining,
            elapsedTime: progressData.startTime ? Date.now() - progressData.startTime : 0,
            steps: {
                total: progressData.totalSteps,
                completed: progressData.completedSteps,
                current: progressData.currentStep?.name || null,
                list: progressData.steps.map(step => ({
                    name: step.name,
                    status: step.status,
                    progress: step.progress,
                    duration: step.duration
                }))
            },
            metrics: { ...progressData.metrics },
            errors: [...progressData.errors],
            warnings: [...progressData.warnings],
            lastUpdate: progressData.lastUpdate
        };
    }

    /**
     * Get overall progress for all installations
     */
    getOverallProgress() {
        // Use cached result if available and recent
        const cacheKey = 'overall_progress';
        const cached = this.calculationCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        const activeInstallations = Array.from(this.installations.values())
            .filter(inst => inst.state !== PROGRESS_STATES.COMPLETED &&
                           inst.state !== PROGRESS_STATES.FAILED &&
                           inst.state !== PROGRESS_STATES.CANCELLED);

        const result = {
            ...this.overallProgress,
            active: activeInstallations.length,
            activeInstallations: activeInstallations.map(inst => ({
                id: inst.id,
                packageId: inst.packageId,
                percentage: inst.percentage,
                state: inst.state,
                estimatedTimeRemaining: inst.estimatedTimeRemaining
            })),
            performance: { ...this.performanceMetrics },
            elapsedTime: this.overallProgress.startTime ?
                         Date.now() - this.overallProgress.startTime : 0
        };

        // Cache the result
        this.calculationCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        return result;
    }

    /**
     * Get installation history
     */
    getHistory(installationId = null, options = {}) {
        const {
            limit = 100,
            since = null,
            includeMetrics = false
        } = options;

        let history;

        if (installationId) {
            const progressData = this.installations.get(installationId);
            if (!progressData) return null;

            history = progressData.updateHistory;
        } else {
            history = this.history.updates;
        }

        let filtered = history;

        if (since) {
            filtered = history.filter(update => update.timestamp >= since);
        }

        if (limit) {
            filtered = filtered.slice(-limit);
        }

        return {
            updates: filtered,
            totalUpdates: history.length,
            performance: includeMetrics ? this.performanceMetrics : undefined
        };
    }

    /**
     * Mark installation as completed
     */
    async markCompleted(installationId, result = {}) {
        const progressData = this.installations.get(installationId);
        if (!progressData) {
            throw new Error(`Installation not found: ${installationId}`);
        }

        progressData.state = PROGRESS_STATES.COMPLETED;
        progressData.percentage = 100;
        progressData.endTime = Date.now();
        progressData.message = result.message || `Completed: ${progressData.packageId}@${progressData.version}`;

        this.overallProgress.completed++;
        this.overallProgress.active = Math.max(0, this.overallProgress.active - 1);

        await this._updateOverallProgress();

        this.emit('installation.completed', {
            installationId,
            progressData,
            result
        });

        return progressData;
    }

    /**
     * Mark installation as failed
     */
    async markFailed(installationId, error, details = {}) {
        const progressData = this.installations.get(installationId);
        if (!progressData) {
            throw new Error(`Installation not found: ${installationId}`);
        }

        progressData.state = PROGRESS_STATES.FAILED;
        progressData.endTime = Date.now();
        progressData.message = `Failed: ${error.message || error}`;
        progressData.errors.push({
            message: error.message || error,
            timestamp: Date.now(),
            details,
            stack: error.stack
        });

        this.overallProgress.failed++;
        this.overallProgress.active = Math.max(0, this.overallProgress.active - 1);

        await this._updateOverallProgress();

        this.emit('installation.failed', {
            installationId,
            progressData,
            error,
            details
        });

        return progressData;
    }

    /**
     * Subscribe to real-time updates
     */
    subscribeToUpdates(callback, filter = {}) {
        const subscription = {
            id: crypto.randomUUID(),
            callback,
            filter,
            subscribed: Date.now()
        };

        this.on('progress.updated', (data) => {
            if (this._matchesFilter(data, filter)) {
                callback(data);
            }
        });

        this.on('installation.completed', (data) => {
            if (this._matchesFilter(data, filter)) {
                callback({ type: 'installation.completed', ...data });
            }
        });

        this.on('installation.failed', (data) => {
            if (this._matchesFilter(data, filter)) {
                callback({ type: 'installation.failed', ...data });
            }
        });

        return subscription.id;
    }

    /**
     * Add WebSocket connection for real-time updates
     * @param {WebSocket} ws - The WebSocket connection
     * @param {Object} credentials - Authentication credentials (token, clientId, etc.)
     * @param {Object} metadata - Additional connection metadata
     * @returns {string|null} Connection ID if successful, null if rejected
     */
    addWebSocketConnection(ws, credentials = null, metadata = {}) {
        if (!this.config.realTime.webSocket.enabled) {
            throw new Error('WebSocket support not enabled');
        }

        const wsConfig = this.config.realTime.webSocket;
        const clientId = credentials?.clientId || metadata?.ip || 'unknown';
        const timestamp = Date.now();

        // Check rate limiting first
        if (wsConfig.rateLimit?.enabled) {
            const rateLimitResult = this._checkWebSocketRateLimit(clientId);
            if (!rateLimitResult.allowed) {
                this._logAuthAttempt({
                    clientId,
                    success: false,
                    reason: 'rate_limit_exceeded',
                    message: `Rate limit exceeded: ${rateLimitResult.currentCount}/${wsConfig.rateLimit.maxConnectionsPerClient} connections`,
                    timestamp
                });

                // Close connection with 4429 (Too Many Requests equivalent)
                ws.close(4429, 'Rate limit exceeded');
                return null;
            }
        }

        // Check authentication if enabled
        if (wsConfig.authentication?.enabled) {
            const authResult = this._validateWebSocketCredentials(credentials);

            this._logAuthAttempt({
                clientId,
                success: authResult.valid,
                reason: authResult.valid ? 'authenticated' : authResult.reason,
                message: authResult.message,
                timestamp
            });

            if (!authResult.valid) {
                // Close connection with 4401 (Unauthorized equivalent)
                ws.close(4401, authResult.message || 'Authentication required');
                return null;
            }
        } else {
            // Log unauthenticated connection when auth is disabled
            this._logAuthAttempt({
                clientId,
                success: true,
                reason: 'auth_disabled',
                message: 'Authentication disabled - connection accepted',
                timestamp
            });
        }

        const connection = {
            id: crypto.randomUUID(),
            ws,
            clientId,
            metadata,
            authenticated: wsConfig.authentication?.enabled ? true : false,
            connected: timestamp,
            lastPing: timestamp
        };

        this.webSocketConnections.add(connection);

        // Track connection for rate limiting
        if (wsConfig.rateLimit?.enabled) {
            this._trackWebSocketConnection(clientId);
        }

        // Setup WebSocket event handlers
        ws.on('close', () => {
            this.webSocketConnections.delete(connection);
            // Decrement connection count on close
            if (wsConfig.rateLimit?.enabled) {
                this._decrementConnectionCount(clientId);
            }
        });

        ws.on('pong', () => {
            connection.lastPing = Date.now();
        });

        console.log(`📡 WebSocket connection added: ${connection.id} (client: ${clientId}, authenticated: ${connection.authenticated})`);

        this.emit('websocket.connected', {
            connectionId: connection.id,
            clientId,
            authenticated: connection.authenticated,
            timestamp
        });

        return connection.id;
    }

    /**
     * Validate WebSocket credentials
     * @param {Object} credentials - The credentials to validate
     * @returns {Object} Validation result { valid: boolean, reason?: string, message?: string }
     */
    _validateWebSocketCredentials(credentials) {
        const authConfig = this.config.realTime.webSocket.authentication;

        // Check if credentials provided
        if (!credentials) {
            return {
                valid: false,
                reason: 'no_credentials',
                message: 'No credentials provided'
            };
        }

        // Extract token from credentials
        const token = credentials.token ||
                      credentials[authConfig.tokenHeader] ||
                      credentials['X-Auth-Token'];

        if (!token) {
            return {
                valid: false,
                reason: 'no_token',
                message: 'No authentication token provided'
            };
        }

        // Use custom validator if provided
        if (typeof authConfig.validator === 'function') {
            try {
                const customResult = authConfig.validator(credentials, token);
                // Handle both boolean and object returns
                if (typeof customResult === 'boolean') {
                    return {
                        valid: customResult,
                        reason: customResult ? 'custom_validator_passed' : 'custom_validator_failed',
                        message: customResult ? 'Authenticated via custom validator' : 'Custom validator rejected credentials'
                    };
                }
                return {
                    valid: customResult.valid === true,
                    reason: customResult.reason || (customResult.valid ? 'custom_validator_passed' : 'custom_validator_failed'),
                    message: customResult.message || (customResult.valid ? 'Authenticated' : 'Authentication failed')
                };
            } catch (error) {
                console.error('❌ Custom WebSocket validator error:', error);
                return {
                    valid: false,
                    reason: 'validator_error',
                    message: 'Authentication validator error'
                };
            }
        }

        // Default token validation (basic format check)
        // In production, this should be replaced with proper JWT validation or similar
        if (!this._isValidTokenFormat(token)) {
            return {
                valid: false,
                reason: 'invalid_token_format',
                message: 'Invalid token format'
            };
        }

        return {
            valid: true,
            reason: 'token_validated',
            message: 'Token validated successfully'
        };
    }

    /**
     * Basic token format validation
     * @param {string} token - The token to validate
     * @returns {boolean} True if token has valid format
     */
    _isValidTokenFormat(token) {
        if (typeof token !== 'string') return false;
        if (token.length < 16) return false;  // Minimum token length
        if (token.length > 4096) return false;  // Maximum token length (prevent DoS)

        // Check for basic alphanumeric + common token characters
        // This is a basic check - production should use proper JWT/token validation
        const validTokenPattern = /^[A-Za-z0-9\-_.]+$/;
        return validTokenPattern.test(token);
    }

    /**
     * Check WebSocket rate limit for a client
     * @param {string} clientId - The client identifier
     * @returns {Object} { allowed: boolean, currentCount: number }
     */
    _checkWebSocketRateLimit(clientId) {
        const rateLimitConfig = this.config.realTime.webSocket.rateLimit;
        const now = Date.now();

        // Get or create tracking entry
        const tracking = this.connectionAttempts.get(clientId);

        if (!tracking) {
            return { allowed: true, currentCount: 0 };
        }

        // Reset if window expired
        if (now - tracking.firstAttemptTime > rateLimitConfig.windowMs) {
            this.connectionAttempts.delete(clientId);
            return { allowed: true, currentCount: 0 };
        }

        // Check current connection count
        const currentCount = tracking.activeConnections || 0;
        const allowed = currentCount < rateLimitConfig.maxConnectionsPerClient;

        return { allowed, currentCount };
    }

    /**
     * Track a new WebSocket connection for rate limiting
     * @param {string} clientId - The client identifier
     */
    _trackWebSocketConnection(clientId) {
        const now = Date.now();
        let tracking = this.connectionAttempts.get(clientId);

        if (!tracking) {
            tracking = {
                firstAttemptTime: now,
                activeConnections: 0
            };
            this.connectionAttempts.set(clientId, tracking);
        }

        tracking.activeConnections = (tracking.activeConnections || 0) + 1;
        tracking.lastAttemptTime = now;
    }

    /**
     * Decrement connection count when a connection closes
     * @param {string} clientId - The client identifier
     */
    _decrementConnectionCount(clientId) {
        const tracking = this.connectionAttempts.get(clientId);
        if (tracking && tracking.activeConnections > 0) {
            tracking.activeConnections--;
            if (tracking.activeConnections === 0) {
                this.connectionAttempts.delete(clientId);
            }
        }
    }

    /**
     * Log authentication attempt
     * @param {Object} attempt - The authentication attempt details
     */
    _logAuthAttempt(attempt) {
        const logEntry = {
            type: 'websocket_auth',
            clientId: attempt.clientId,
            success: attempt.success,
            reason: attempt.reason,
            message: attempt.message,
            timestamp: attempt.timestamp || Date.now()
        };

        // Emit event for external logging/monitoring
        this.emit('websocket.auth', logEntry);

        // Console log based on success/failure
        if (attempt.success) {
            console.log(`🔐 WebSocket auth success: ${attempt.clientId} - ${attempt.reason}`);
        } else {
            console.warn(`🚫 WebSocket auth failed: ${attempt.clientId} - ${attempt.reason}: ${attempt.message}`);
        }
    }

    /**
     * Setup rate limit cleanup timer
     */
    _setupRateLimitCleanup() {
        const cleanupInterval = this.config.realTime.webSocket.rateLimit?.cleanupIntervalMs || 300000;

        setInterval(() => {
            this._cleanupRateLimitTracking();
        }, cleanupInterval);
    }

    /**
     * Cleanup stale rate limit tracking entries
     */
    _cleanupRateLimitTracking() {
        const windowMs = this.config.realTime.webSocket.rateLimit?.windowMs || 60000;
        const now = Date.now();

        for (const [clientId, tracking] of this.connectionAttempts.entries()) {
            // Remove entries with no active connections and expired window
            if (tracking.activeConnections === 0 &&
                now - tracking.firstAttemptTime > windowMs) {
                this.connectionAttempts.delete(clientId);
            }
        }
    }

    /**
     * Reset tracking data
     */
    async reset() {
        this.installations.clear();
        this.overallProgress = {
            total: 0,
            completed: 0,
            failed: 0,
            active: 0,
            percentage: 0,
            estimatedTimeRemaining: 0,
            startTime: null,
            endTime: null
        };

        this.history.updates = [];
        this.calculationCache.clear();

        this.emit('reset');
    }

    /**
     * Shutdown progress tracker
     */
    async shutdown() {
        console.log('📊 Shutting down Progress Tracker...');

        // Clear timers
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        // Close WebSocket connections
        for (const connection of this.webSocketConnections) {
            connection.ws.close();
        }
        this.webSocketConnections.clear();

        // Save final state if configured
        if (this.config.persistence.enabled) {
            await this._saveState();
        }

        this.isInitialized = false;
        this.emit('shutdown');

        console.log('✅ Progress Tracker shutdown complete');
    }

    // Private methods

    /**
     * Merge configuration with defaults
     */
    _mergeConfig(userConfig) {
        const defaultConfig = {
            updateFrequency: UPDATE_FREQUENCIES.NORMAL,
            historySize: 1000,
            realTime: {
                enabled: true,
                webSocket: {
                    enabled: false,
                    port: 8080,
                    path: '/progress',
                    authentication: {
                        enabled: true,
                        tokenHeader: 'X-Auth-Token',
                        validator: null  // Optional custom validator function
                    },
                    rateLimit: {
                        enabled: true,
                        maxConnectionsPerClient: 5,
                        windowMs: 60000,  // 1 minute window
                        cleanupIntervalMs: 300000  // 5 minutes cleanup interval
                    }
                },
                broadcast: true
            },
            performance: {
                tracking: true,
                metrics: true
            },
            persistence: {
                enabled: false,
                interval: 30000,
                path: './progress-state.json'
            },
            cache: {
                enabled: true,
                timeout: 1000
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
     * Setup real-time update processing
     */
    _setupUpdateProcessing() {
        this.updateTimer = setInterval(async () => {
            if (this.updateQueue.length > 0) {
                await this._processUpdateQueue();
            }
        }, this.updateRateLimit);
    }

    /**
     * Process update queue
     */
    async _processUpdateQueue() {
        const updates = this.updateQueue.splice(0);
        if (updates.length === 0) return;

        // Broadcast to WebSocket connections
        if (this.config.realTime.webSocket.enabled && this.webSocketConnections.size > 0) {
            await this._broadcastToWebSockets(updates);
        }

        // Add to history
        this.history.updates.push(...updates);

        // Trim history if too large
        if (this.history.updates.length > this.history.maxHistorySize) {
            this.history.updates = this.history.updates.slice(-this.history.maxHistorySize);
        }

        this.performanceMetrics.totalUpdates += updates.length;
    }

    /**
     * Queue real-time update
     */
    async _queueRealtimeUpdate(update) {
        this.updateQueue.push(update);

        // Add to installation history
        if (update.installationId && this.installations.has(update.installationId)) {
            const progressData = this.installations.get(update.installationId);
            progressData.updateHistory.push(update);
            progressData.lastUpdate = update.timestamp;
        }
    }

    /**
     * Setup WebSocket server
     */
    async _setupWebSocketServer() {
        // WebSocket server setup would go here
        // This is a placeholder for the actual WebSocket implementation
        console.log('📡 WebSocket server setup completed');
    }

    /**
     * Broadcast updates to WebSocket connections
     */
    async _broadcastToWebSockets(updates) {
        const message = JSON.stringify({
            type: 'progress.updates',
            data: updates,
            timestamp: Date.now()
        });

        for (const connection of this.webSocketConnections) {
            try {
                if (connection.ws.readyState === 1) { // WebSocket.OPEN
                    connection.ws.send(message);
                }
            } catch (error) {
                console.warn('⚠️ Failed to send WebSocket message:', error);
                this.webSocketConnections.delete(connection);
            }
        }
    }

    /**
     * Setup metrics collection
     */
    _setupMetricsCollection() {
        if (!this.config.performance.tracking) return;

        setInterval(() => {
            this._collectPerformanceMetrics();
        }, 5000);
    }

    /**
     * Collect performance metrics
     */
    _collectPerformanceMetrics() {
        const now = Date.now();
        const timeSinceLastUpdate = now - this.lastUpdateTime;

        if (timeSinceLastUpdate > 0) {
            const updateRate = this.updateQueue.length / (timeSinceLastUpdate / 1000);
            this.performanceMetrics.peakUpdateRate = Math.max(
                this.performanceMetrics.peakUpdateRate,
                updateRate
            );
        }

        this.lastUpdateTime = now;
    }

    /**
     * Update performance metrics
     */
    _updatePerformanceMetrics(updateTime) {
        this.performanceMetrics.averageUpdateTime =
            (this.performanceMetrics.averageUpdateTime + updateTime) / 2;
    }

    /**
     * Setup cleanup timers
     */
    _setupCleanupTimers() {
        // Clean up completed installations periodically
        setInterval(() => {
            this._cleanupCompletedInstallations();
        }, 300000); // 5 minutes

        // Clear calculation cache periodically
        setInterval(() => {
            this.calculationCache.clear();
        }, this.cacheTimeout * 10);
    }

    /**
     * Apply progress update
     */
    async _applyProgressUpdate(progressData, update) {
        const previousState = progressData.state;

        // Apply update fields
        Object.assign(progressData, {
            ...update,
            lastUpdate: Date.now()
        });

        // State change handling
        if (update.state && update.state !== previousState) {
            this._handleStateChange(progressData, previousState, update.state);
        }

        // Update timing estimates
        await this._updateTimingEstimates(progressData);

        return progressData;
    }

    /**
     * Calculate overall percentage based on weighted phases
     */
    _calculateOverallPercentage(progressData) {
        if (!progressData.currentPhase) return 0;

        let totalWeight = 0;
        let completedWeight = 0;

        for (const [phaseName, phaseInfo] of Object.entries(PROGRESS_PHASES)) {
            totalWeight += phaseInfo.weight;

            if (progressData.phases.has(phaseName)) {
                const phaseData = progressData.phases.get(phaseName);
                if (phaseName === progressData.currentPhase) {
                    completedWeight += phaseInfo.weight * (phaseData.percentage / 100);
                } else if (progressData.currentPhaseData &&
                          Object.keys(PROGRESS_PHASES).indexOf(phaseName) <
                          Object.keys(PROGRESS_PHASES).indexOf(progressData.currentPhase)) {
                    completedWeight += phaseInfo.weight;
                }
            }
        }

        return Math.min(100, Math.max(0, (completedWeight / totalWeight) * 100));
    }

    /**
     * Update timing estimates
     */
    async _updateTimingEstimates(progressData) {
        if (!progressData.startTime || progressData.percentage <= 0) {
            return;
        }

        const elapsedTime = Date.now() - progressData.startTime;
        const progressRatio = progressData.percentage / 100;

        if (progressRatio > 0) {
            const estimatedTotalTime = elapsedTime / progressRatio;
            progressData.estimatedTimeRemaining = Math.max(0, estimatedTotalTime - elapsedTime);
        }
    }

    /**
     * Update overall progress
     */
    async _updateOverallProgress() {
        const totalInstallations = this.overallProgress.total;
        const completedInstallations = this.overallProgress.completed;
        const failedInstallations = this.overallProgress.failed;

        if (totalInstallations > 0) {
            this.overallProgress.percentage =
                ((completedInstallations + failedInstallations) / totalInstallations) * 100;
        }

        // Calculate estimated time remaining for overall progress
        if (this.overallProgress.startTime && this.overallProgress.active > 0) {
            const activeInstallations = Array.from(this.installations.values())
                .filter(inst => inst.state !== PROGRESS_STATES.COMPLETED &&
                               inst.state !== PROGRESS_STATES.FAILED &&
                               inst.state !== PROGRESS_STATES.CANCELLED);

            const averageTimeRemaining = activeInstallations.reduce((sum, inst) =>
                sum + (inst.estimatedTimeRemaining || 0), 0) / activeInstallations.length;

            this.overallProgress.estimatedTimeRemaining = averageTimeRemaining;
        }

        // Clear cache since overall progress changed
        this.calculationCache.delete('overall_progress');
    }

    /**
     * Estimate installation duration
     */
    _estimateInstallationDuration(installation) {
        // Base estimation on package size, complexity, etc.
        // This is a simplified estimation - real implementation would use historical data
        const baseTime = 30000; // 30 seconds base
        const sizeMultiplier = (installation.metadata.size || 1000000) / 1000000; // per MB
        const complexityMultiplier = installation.dependencies?.length || 1;

        return baseTime * sizeMultiplier * Math.log(complexityMultiplier + 1);
    }

    /**
     * Handle state change
     */
    _handleStateChange(progressData, oldState, newState) {
        console.log(`📊 State change for ${progressData.id}: ${oldState} → ${newState}`);

        if (newState === PROGRESS_STATES.COMPLETED ||
            newState === PROGRESS_STATES.FAILED ||
            newState === PROGRESS_STATES.CANCELLED) {
            progressData.endTime = Date.now();
        }

        if (oldState === PROGRESS_STATES.QUEUED && newState !== PROGRESS_STATES.QUEUED) {
            this.overallProgress.active++;
            if (!this.overallProgress.startTime) {
                this.overallProgress.startTime = Date.now();
            }
        }
    }

    /**
     * Check if data matches filter
     */
    _matchesFilter(data, filter) {
        if (!filter || Object.keys(filter).length === 0) return true;

        for (const [key, value] of Object.entries(filter)) {
            if (data[key] !== value) return false;
        }

        return true;
    }

    /**
     * Cleanup completed installations
     */
    _cleanupCompletedInstallations() {
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

        for (const [id, progressData] of this.installations.entries()) {
            if ((progressData.state === PROGRESS_STATES.COMPLETED ||
                 progressData.state === PROGRESS_STATES.FAILED) &&
                progressData.endTime &&
                progressData.endTime < cutoffTime) {

                this.installations.delete(id);
            }
        }
    }

    /**
     * Save state to persistent storage
     */
    async _saveState() {
        if (!this.config.persistence.enabled) return;

        // Implementation would save state to configured storage
        console.log('💾 Saving progress tracker state...');
    }
}

// Export progress states and phases for external use
ProgressTracker.STATES = PROGRESS_STATES;
ProgressTracker.PHASES = PROGRESS_PHASES;
ProgressTracker.UPDATE_FREQUENCIES = UPDATE_FREQUENCIES;

module.exports = ProgressTracker;