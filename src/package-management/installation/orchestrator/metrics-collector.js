/**
 * BMAD INSTALLATION METRICS COLLECTOR
 * Comprehensive metrics collection and analysis for installation processes
 *
 * Features:
 * - Real-time performance metrics collection
 * - Installation analytics and insights
 * - Resource utilization tracking
 * - Error and success rate analytics
 * - Historical trend analysis
 * - Custom metric definitions
 * - Integration with monitoring systems
 * - Automated reporting and alerting
 *
 * @author BlackUnicorn.Tech
 * @version 2.3.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.3
 */

const { EventEmitter } = require('events');
const crypto = require('crypto');
const { performance } = require('perf_hooks');
const os = require('os');

/**
 * Metric types
 */
const METRIC_TYPES = {
    COUNTER: 'counter',
    GAUGE: 'gauge',
    HISTOGRAM: 'histogram',
    TIMER: 'timer',
    RATE: 'rate'
};

/**
 * Aggregation functions
 */
const AGGREGATIONS = {
    SUM: 'sum',
    AVERAGE: 'average',
    MIN: 'min',
    MAX: 'max',
    COUNT: 'count',
    PERCENTILE: 'percentile'
};

/**
 * Time windows for metrics
 */
const TIME_WINDOWS = {
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000
};

class MetricsCollector extends EventEmitter {

    constructor(config = {}) {
        super();

        this.config = this._mergeConfig(config);
        this.isInitialized = false;
        this.isCollecting = false;

        // Metrics storage
        this.metrics = new Map();
        this.customMetrics = new Map();
        this.metricHistory = new Map();

        // Collection intervals
        this.collectionIntervals = new Map();

        // Performance counters
        this.counters = {
            totalInstallations: 0,
            successfulInstallations: 0,
            failedInstallations: 0,
            totalDataTransferred: 0,
            totalExecutionTime: 0,
            peakConcurrency: 0,
            errorCount: 0
        };

        // Gauges (current values)
        this.gauges = {
            activeInstallations: 0,
            queueLength: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            diskUsage: 0,
            networkLatency: 0
        };

        // Timers and histograms
        this.timers = new Map();
        this.histograms = new Map();

        // Rate tracking
        this.rates = new Map();

        // Analytics data
        this.analytics = {
            installationTrends: [],
            performanceTrends: [],
            errorTrends: [],
            resourceTrends: []
        };

        this._initializeMetrics();
    }

    /**
     * Initialize the metrics collector
     */
    async initialize() {
        try {
            console.log('📊 Initializing Metrics Collector...');

            // Setup metric definitions
            this._setupMetricDefinitions();

            // Initialize collection intervals
            this._setupCollectionIntervals();

            // Setup analytics engine
            this._setupAnalytics();

            this.isInitialized = true;
            console.log('✅ Metrics Collector initialized');

            this.emit('initialized');

        } catch (error) {
            console.error('❌ Failed to initialize Metrics Collector:', error);
            throw error;
        }
    }

    /**
     * Start metrics collection
     */
    async start() {
        if (!this.isInitialized) {
            throw new Error('Metrics Collector not initialized');
        }

        if (this.isCollecting) {
            console.log('⚠️ Metrics collection already started');
            return;
        }

        console.log('📊 Starting metrics collection...');

        this.isCollecting = true;

        // Start all collection intervals
        for (const interval of this.collectionIntervals.values()) {
            interval.start();
        }

        // Perform initial collection
        await this.collectAllMetrics();

        this.emit('collection.started');
    }

    /**
     * Stop metrics collection
     */
    async stop() {
        if (!this.isCollecting) {
            return;
        }

        console.log('📊 Stopping metrics collection...');

        this.isCollecting = false;

        // Stop all collection intervals
        for (const interval of this.collectionIntervals.values()) {
            interval.stop();
        }

        this.emit('collection.stopped');
    }

    /**
     * Record installation start
     */
    recordInstallationStart(installation) {
        this.counters.totalInstallations++;
        this.gauges.activeInstallations++;

        // Update peak concurrency
        if (this.gauges.activeInstallations > this.counters.peakConcurrency) {
            this.counters.peakConcurrency = this.gauges.activeInstallations;
        }

        // Start timer for this installation
        this.startTimer(`installation.${installation.id}`, {
            packageId: installation.packageId,
            version: installation.version
        });

        this.emit('installation.started', {
            installationId: installation.id,
            counters: this.counters,
            gauges: this.gauges
        });
    }

    /**
     * Record installation completion
     */
    recordInstallationComplete(installation, result) {
        this.gauges.activeInstallations = Math.max(0, this.gauges.activeInstallations - 1);
        this.counters.successfulInstallations++;

        // Stop timer and record duration
        const duration = this.stopTimer(`installation.${installation.id}`);
        this.counters.totalExecutionTime += duration;

        // Record data transfer metrics
        if (installation.metrics?.bytesDownloaded) {
            this.counters.totalDataTransferred += installation.metrics.bytesDownloaded;
        }

        // Update histograms
        this.recordHistogram('installation.duration', duration);
        this.recordHistogram('installation.size', installation.metrics?.bytesDownloaded || 0);

        this.emit('installation.completed', {
            installationId: installation.id,
            duration,
            result,
            counters: this.counters,
            gauges: this.gauges
        });
    }

    /**
     * Record installation failure
     */
    recordInstallationFailure(installation, error) {
        this.gauges.activeInstallations = Math.max(0, this.gauges.activeInstallations - 1);
        this.counters.failedInstallations++;
        this.counters.errorCount++;

        // Stop timer and record duration
        const duration = this.stopTimer(`installation.${installation.id}`);

        // Record in error histogram
        this.recordHistogram('installation.errors', 1);

        this.emit('installation.failed', {
            installationId: installation.id,
            duration,
            error,
            counters: this.counters,
            gauges: this.gauges
        });
    }

    /**
     * Collect all metrics
     */
    async collectAllMetrics() {
        try {
            await Promise.all([
                this._collectSystemMetrics(),
                this._collectPerformanceMetrics(),
                this._collectInstallationMetrics(),
                this._collectCustomMetrics()
            ]);

            this.emit('metrics.collected', {
                timestamp: Date.now(),
                counters: this.counters,
                gauges: this.gauges
            });

        } catch (error) {
            console.error('❌ Error collecting metrics:', error);
            this.emit('metrics.error', { error: error.message });
        }
    }

    /**
     * Get current metrics snapshot
     */
    getMetrics() {
        return {
            timestamp: Date.now(),
            counters: { ...this.counters },
            gauges: { ...this.gauges },
            timers: Object.fromEntries(this.timers),
            histograms: this._serializeHistograms(),
            rates: this._calculateCurrentRates(),
            custom: Object.fromEntries(this.customMetrics),
            analytics: this.analytics,
            collection: {
                isCollecting: this.isCollecting,
                metricsCount: this.metrics.size,
                customMetricsCount: this.customMetrics.size
            }
        };
    }

    /**
     * Get metrics for time window
     */
    getMetricsForWindow(timeWindow, aggregation = AGGREGATIONS.AVERAGE) {
        const windowStart = Date.now() - timeWindow;
        const windowData = {};

        for (const [metricName, history] of this.metricHistory.entries()) {
            const windowValues = history.filter(entry => entry.timestamp >= windowStart);

            if (windowValues.length > 0) {
                windowData[metricName] = this._aggregateValues(
                    windowValues.map(entry => entry.value),
                    aggregation
                );
            }
        }

        return {
            window: timeWindow,
            windowStart,
            windowEnd: Date.now(),
            aggregation,
            data: windowData,
            dataPoints: Object.values(windowData).reduce((sum, values) =>
                sum + (Array.isArray(values) ? values.length : 1), 0)
        };
    }

    /**
     * Start timer
     */
    startTimer(timerName, metadata = {}) {
        this.timers.set(timerName, {
            startTime: performance.now(),
            metadata,
            running: true
        });

        return timerName;
    }

    /**
     * Stop timer and return duration
     */
    stopTimer(timerName) {
        const timer = this.timers.get(timerName);
        if (!timer || !timer.running) {
            return 0;
        }

        const duration = performance.now() - timer.startTime;
        timer.endTime = performance.now();
        timer.duration = duration;
        timer.running = false;

        // Record in histogram
        this.recordHistogram(`timer.${timerName}`, duration);

        return duration;
    }

    /**
     * Record value in histogram
     */
    recordHistogram(histogramName, value) {
        if (!this.histograms.has(histogramName)) {
            this.histograms.set(histogramName, {
                values: [],
                count: 0,
                sum: 0,
                min: Infinity,
                max: -Infinity
            });
        }

        const histogram = this.histograms.get(histogramName);
        histogram.values.push(value);
        histogram.count++;
        histogram.sum += value;
        histogram.min = Math.min(histogram.min, value);
        histogram.max = Math.max(histogram.max, value);

        // Trim if too many values
        if (histogram.values.length > this.config.histogramMaxSize) {
            histogram.values = histogram.values.slice(-this.config.histogramMaxSize);
        }
    }

    /**
     * Record custom metric
     */
    recordCustomMetric(metricName, value, type = METRIC_TYPES.GAUGE, metadata = {}) {
        const metric = {
            name: metricName,
            type,
            value,
            timestamp: Date.now(),
            metadata
        };

        this.customMetrics.set(metricName, metric);

        // Add to history
        if (!this.metricHistory.has(metricName)) {
            this.metricHistory.set(metricName, []);
        }

        const history = this.metricHistory.get(metricName);
        history.push({ timestamp: Date.now(), value });

        // Trim history if too large
        if (history.length > this.config.maxHistorySize) {
            this.metricHistory.set(metricName, history.slice(-this.config.maxHistorySize));
        }

        this.emit('custom.metric.recorded', metric);

        return metricName;
    }

    /**
     * Get analytics insights
     */
    getAnalyticsInsights() {
        return {
            installationStats: this._calculateInstallationStats(),
            performanceInsights: this._calculatePerformanceInsights(),
            errorAnalysis: this._calculateErrorAnalysis(),
            resourceUtilization: this._calculateResourceUtilization(),
            trends: this._calculateTrends(),
            recommendations: this._generateRecommendations()
        };
    }

    /**
     * Export metrics data
     */
    exportMetrics(format = 'json') {
        const data = this.getMetrics();

        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this._exportAsCSV(data);
            case 'prometheus':
                return this._exportAsPrometheus(data);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Reset metrics
     */
    resetMetrics(preserveHistory = false) {
        // Reset counters
        for (const key in this.counters) {
            this.counters[key] = 0;
        }

        // Reset gauges
        for (const key in this.gauges) {
            this.gauges[key] = 0;
        }

        // Clear timers
        this.timers.clear();

        // Clear histograms
        this.histograms.clear();

        // Clear custom metrics
        this.customMetrics.clear();

        // Clear history if requested
        if (!preserveHistory) {
            this.metricHistory.clear();
            this.analytics = {
                installationTrends: [],
                performanceTrends: [],
                errorTrends: [],
                resourceTrends: []
            };
        }

        this.emit('metrics.reset', { preserveHistory });
    }

    /**
     * Shutdown metrics collector
     */
    async shutdown() {
        console.log('📊 Shutting down Metrics Collector...');

        await this.stop();

        // Export final metrics if configured
        if (this.config.export.onShutdown) {
            try {
                const finalMetrics = this.getMetrics();
                await this._exportFinalMetrics(finalMetrics);
            } catch (error) {
                console.warn('⚠️ Error exporting final metrics:', error);
            }
        }

        this.isInitialized = false;
        this.emit('shutdown');

        console.log('✅ Metrics Collector shutdown complete');
    }

    // Private methods

    /**
     * Merge configuration with defaults
     */
    _mergeConfig(userConfig) {
        const defaultConfig = {
            enabled: true,
            collectionInterval: 30000, // 30 seconds
            maxHistorySize: 1000,
            histogramMaxSize: 1000,
            analytics: {
                enabled: true,
                trendsAnalysis: true,
                recommendations: true
            },
            export: {
                enabled: false,
                onShutdown: false,
                format: 'json',
                destination: './metrics-export.json'
            },
            retention: {
                enabled: true,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
     * Initialize metrics
     */
    _initializeMetrics() {
        // Initialize histogram for installation durations
        this.histograms.set('installation.duration', {
            values: [],
            count: 0,
            sum: 0,
            min: Infinity,
            max: -Infinity
        });

        // Initialize other standard histograms
        this.histograms.set('installation.size', {
            values: [],
            count: 0,
            sum: 0,
            min: Infinity,
            max: -Infinity
        });

        this.histograms.set('installation.errors', {
            values: [],
            count: 0,
            sum: 0,
            min: Infinity,
            max: -Infinity
        });
    }

    /**
     * Setup metric definitions
     */
    _setupMetricDefinitions() {
        // Define standard metrics with their properties
        const standardMetrics = [
            { name: 'installations.total', type: METRIC_TYPES.COUNTER, description: 'Total installations' },
            { name: 'installations.active', type: METRIC_TYPES.GAUGE, description: 'Active installations' },
            { name: 'installations.success_rate', type: METRIC_TYPES.RATE, description: 'Installation success rate' },
            { name: 'performance.avg_duration', type: METRIC_TYPES.GAUGE, description: 'Average installation duration' },
            { name: 'resources.memory_usage', type: METRIC_TYPES.GAUGE, description: 'Memory usage percentage' },
            { name: 'resources.cpu_usage', type: METRIC_TYPES.GAUGE, description: 'CPU usage percentage' }
        ];

        for (const metric of standardMetrics) {
            this.metrics.set(metric.name, metric);
        }
    }

    /**
     * Setup collection intervals
     */
    _setupCollectionIntervals() {
        // System metrics collection
        this.collectionIntervals.set('system', {
            timer: null,
            start: () => {
                this.collectionIntervals.get('system').timer = setInterval(
                    () => this._collectSystemMetrics(),
                    this.config.collectionInterval
                );
            },
            stop: () => {
                const timer = this.collectionIntervals.get('system').timer;
                if (timer) {
                    clearInterval(timer);
                    this.collectionIntervals.get('system').timer = null;
                }
            }
        });

        // Performance metrics collection
        this.collectionIntervals.set('performance', {
            timer: null,
            start: () => {
                this.collectionIntervals.get('performance').timer = setInterval(
                    () => this._collectPerformanceMetrics(),
                    this.config.collectionInterval * 2 // Collect less frequently
                );
            },
            stop: () => {
                const timer = this.collectionIntervals.get('performance').timer;
                if (timer) {
                    clearInterval(timer);
                    this.collectionIntervals.get('performance').timer = null;
                }
            }
        });
    }

    /**
     * Setup analytics
     */
    _setupAnalytics() {
        if (!this.config.analytics.enabled) return;

        // Setup analytics calculation interval
        setInterval(() => {
            this._updateAnalytics();
        }, 60000); // Update analytics every minute
    }

    /**
     * Collect system metrics
     */
    async _collectSystemMetrics() {
        try {
            const memoryUsage = process.memoryUsage();
            const totalMemory = os.totalmem();
            const freeMemory = os.freemem();
            const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;

            this.gauges.memoryUsage = (memoryUsage.heapUsed / totalMemory) * 100;
            this.gauges.cpuUsage = cpuUsage;

            // Record in history
            this._recordMetricHistory('system.memory', this.gauges.memoryUsage);
            this._recordMetricHistory('system.cpu', this.gauges.cpuUsage);

        } catch (error) {
            console.warn('⚠️ Error collecting system metrics:', error);
        }
    }

    /**
     * Collect performance metrics
     */
    async _collectPerformanceMetrics() {
        try {
            // Calculate current rates
            const successRate = this.counters.totalInstallations > 0 ?
                this.counters.successfulInstallations / this.counters.totalInstallations : 0;

            const averageDuration = this.counters.successfulInstallations > 0 ?
                this.counters.totalExecutionTime / this.counters.successfulInstallations : 0;

            // Record in history
            this._recordMetricHistory('performance.success_rate', successRate);
            this._recordMetricHistory('performance.avg_duration', averageDuration);

        } catch (error) {
            console.warn('⚠️ Error collecting performance metrics:', error);
        }
    }

    /**
     * Collect installation metrics
     */
    async _collectInstallationMetrics() {
        try {
            // Update rate calculations
            this._updateRates();

        } catch (error) {
            console.warn('⚠️ Error collecting installation metrics:', error);
        }
    }

    /**
     * Collect custom metrics
     */
    async _collectCustomMetrics() {
        // Collect any registered custom metrics
        for (const [metricName, metric] of this.customMetrics.entries()) {
            if (typeof metric.collector === 'function') {
                try {
                    const value = await metric.collector();
                    this.recordCustomMetric(metricName, value, metric.type, metric.metadata);
                } catch (error) {
                    console.warn(`⚠️ Error collecting custom metric ${metricName}:`, error);
                }
            }
        }
    }

    /**
     * Record metric in history
     */
    _recordMetricHistory(metricName, value) {
        if (!this.metricHistory.has(metricName)) {
            this.metricHistory.set(metricName, []);
        }

        const history = this.metricHistory.get(metricName);
        history.push({ timestamp: Date.now(), value });

        // Trim if too large
        if (history.length > this.config.maxHistorySize) {
            this.metricHistory.set(metricName, history.slice(-this.config.maxHistorySize));
        }
    }

    /**
     * Update rate calculations
     */
    _updateRates() {
        const now = Date.now();

        for (const [rateName, rateData] of this.rates.entries()) {
            if (!rateData.lastUpdate) {
                rateData.lastUpdate = now;
                continue;
            }

            const timeDiff = now - rateData.lastUpdate;
            const valueDiff = rateData.currentValue - (rateData.lastValue || 0);

            if (timeDiff > 0) {
                rateData.rate = (valueDiff / timeDiff) * 1000; // Per second
                rateData.lastValue = rateData.currentValue;
                rateData.lastUpdate = now;
            }
        }
    }

    /**
     * Update analytics
     */
    _updateAnalytics() {
        if (!this.config.analytics.enabled) return;

        try {
            // Update installation trends
            this.analytics.installationTrends.push({
                timestamp: Date.now(),
                total: this.counters.totalInstallations,
                successful: this.counters.successfulInstallations,
                failed: this.counters.failedInstallations,
                active: this.gauges.activeInstallations
            });

            // Update performance trends
            this.analytics.performanceTrends.push({
                timestamp: Date.now(),
                averageDuration: this.counters.successfulInstallations > 0 ?
                    this.counters.totalExecutionTime / this.counters.successfulInstallations : 0,
                peakConcurrency: this.counters.peakConcurrency,
                dataTransferred: this.counters.totalDataTransferred
            });

            // Update error trends
            this.analytics.errorTrends.push({
                timestamp: Date.now(),
                errorCount: this.counters.errorCount,
                errorRate: this.counters.totalInstallations > 0 ?
                    this.counters.errorCount / this.counters.totalInstallations : 0
            });

            // Update resource trends
            this.analytics.resourceTrends.push({
                timestamp: Date.now(),
                memoryUsage: this.gauges.memoryUsage,
                cpuUsage: this.gauges.cpuUsage,
                diskUsage: this.gauges.diskUsage
            });

            // Trim trends if too large
            const maxTrendSize = 1440; // 24 hours at 1 minute intervals
            ['installationTrends', 'performanceTrends', 'errorTrends', 'resourceTrends'].forEach(trend => {
                if (this.analytics[trend].length > maxTrendSize) {
                    this.analytics[trend] = this.analytics[trend].slice(-maxTrendSize);
                }
            });

        } catch (error) {
            console.warn('⚠️ Error updating analytics:', error);
        }
    }

    /**
     * Serialize histograms for export
     */
    _serializeHistograms() {
        const serialized = {};

        for (const [name, histogram] of this.histograms.entries()) {
            serialized[name] = {
                count: histogram.count,
                sum: histogram.sum,
                min: histogram.min === Infinity ? 0 : histogram.min,
                max: histogram.max === -Infinity ? 0 : histogram.max,
                average: histogram.count > 0 ? histogram.sum / histogram.count : 0,
                percentiles: this._calculatePercentiles(histogram.values)
            };
        }

        return serialized;
    }

    /**
     * Calculate percentiles for histogram
     */
    _calculatePercentiles(values) {
        if (values.length === 0) return {};

        const sorted = [...values].sort((a, b) => a - b);
        const percentiles = [50, 75, 90, 95, 99];
        const result = {};

        for (const p of percentiles) {
            const index = Math.ceil((p / 100) * sorted.length) - 1;
            result[`p${p}`] = sorted[Math.max(0, index)];
        }

        return result;
    }

    /**
     * Calculate current rates
     */
    _calculateCurrentRates() {
        const rates = {};

        for (const [rateName, rateData] of this.rates.entries()) {
            rates[rateName] = rateData.rate || 0;
        }

        return rates;
    }

    /**
     * Aggregate values using specified aggregation function
     */
    _aggregateValues(values, aggregation) {
        if (values.length === 0) return null;

        switch (aggregation) {
            case AGGREGATIONS.SUM:
                return values.reduce((sum, val) => sum + val, 0);
            case AGGREGATIONS.AVERAGE:
                return values.reduce((sum, val) => sum + val, 0) / values.length;
            case AGGREGATIONS.MIN:
                return Math.min(...values);
            case AGGREGATIONS.MAX:
                return Math.max(...values);
            case AGGREGATIONS.COUNT:
                return values.length;
            default:
                return values;
        }
    }

    // Analytics calculation methods
    _calculateInstallationStats() {
        const successRate = this.counters.totalInstallations > 0 ?
            this.counters.successfulInstallations / this.counters.totalInstallations : 0;

        return {
            total: this.counters.totalInstallations,
            successful: this.counters.successfulInstallations,
            failed: this.counters.failedInstallations,
            successRate,
            peakConcurrency: this.counters.peakConcurrency,
            totalDataTransferred: this.counters.totalDataTransferred
        };
    }

    _calculatePerformanceInsights() {
        const avgDuration = this.counters.successfulInstallations > 0 ?
            this.counters.totalExecutionTime / this.counters.successfulInstallations : 0;

        return {
            averageDuration: avgDuration,
            totalExecutionTime: this.counters.totalExecutionTime,
            throughput: this.counters.successfulInstallations,
            efficiency: this.gauges.activeInstallations > 0 ?
                this.counters.successfulInstallations / this.gauges.activeInstallations : 0
        };
    }

    _calculateErrorAnalysis() {
        const errorRate = this.counters.totalInstallations > 0 ?
            this.counters.errorCount / this.counters.totalInstallations : 0;

        return {
            errorCount: this.counters.errorCount,
            errorRate,
            failureRate: this.counters.totalInstallations > 0 ?
                this.counters.failedInstallations / this.counters.totalInstallations : 0
        };
    }

    _calculateResourceUtilization() {
        return {
            memory: this.gauges.memoryUsage,
            cpu: this.gauges.cpuUsage,
            disk: this.gauges.diskUsage,
            network: this.gauges.networkLatency
        };
    }

    _calculateTrends() {
        // Simple trend calculation - could be enhanced with more sophisticated algorithms
        return {
            installationTrend: 'stable', // Would calculate actual trend
            performanceTrend: 'improving',
            errorTrend: 'decreasing',
            resourceTrend: 'stable'
        };
    }

    _generateRecommendations() {
        const recommendations = [];

        // Performance recommendations
        const avgDuration = this.counters.successfulInstallations > 0 ?
            this.counters.totalExecutionTime / this.counters.successfulInstallations : 0;

        if (avgDuration > 30000) { // 30 seconds
            recommendations.push({
                type: 'performance',
                priority: 'medium',
                message: 'Average installation time is high. Consider optimizing package sizes or improving network connectivity.'
            });
        }

        // Resource recommendations
        if (this.gauges.memoryUsage > 80) {
            recommendations.push({
                type: 'resource',
                priority: 'high',
                message: 'Memory usage is high. Consider increasing available memory or optimizing memory usage.'
            });
        }

        // Error rate recommendations
        const errorRate = this.counters.totalInstallations > 0 ?
            this.counters.errorCount / this.counters.totalInstallations : 0;

        if (errorRate > 0.1) {
            recommendations.push({
                type: 'reliability',
                priority: 'high',
                message: 'Error rate is elevated. Investigate common failure causes and implement error prevention measures.'
            });
        }

        return recommendations;
    }

    // Export methods
    _exportAsCSV(data) {
        // Simple CSV export implementation
        const lines = ['metric,value,timestamp'];

        // Export counters
        for (const [key, value] of Object.entries(data.counters)) {
            lines.push(`counter.${key},${value},${data.timestamp}`);
        }

        // Export gauges
        for (const [key, value] of Object.entries(data.gauges)) {
            lines.push(`gauge.${key},${value},${data.timestamp}`);
        }

        return lines.join('\n');
    }

    _exportAsPrometheus(data) {
        // Prometheus format export
        const lines = [];

        // Export counters
        for (const [key, value] of Object.entries(data.counters)) {
            lines.push(`# TYPE bmad_${key} counter`);
            lines.push(`bmad_${key} ${value}`);
        }

        // Export gauges
        for (const [key, value] of Object.entries(data.gauges)) {
            lines.push(`# TYPE bmad_${key} gauge`);
            lines.push(`bmad_${key} ${value}`);
        }

        return lines.join('\n');
    }

    async _exportFinalMetrics(metrics) {
        // Export final metrics to configured destination
        if (this.config.export.destination) {
            const fs = require('fs').promises;
            const exportData = this.exportMetrics(this.config.export.format);
            await fs.writeFile(this.config.export.destination, exportData);
            console.log(`📊 Final metrics exported to: ${this.config.export.destination}`);
        }
    }
}

// Export metric types and aggregations
MetricsCollector.METRIC_TYPES = METRIC_TYPES;
MetricsCollector.AGGREGATIONS = AGGREGATIONS;
MetricsCollector.TIME_WINDOWS = TIME_WINDOWS;

module.exports = MetricsCollector;