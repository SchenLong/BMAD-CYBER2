/**
 * BMAD Quality Gate Enforcer
 * Epic 5: Story 5.6 - Validation Automation
 *
 * Provides automated quality gate enforcement with multi-dimensional scoring,
 * regression detection, and comprehensive validation for BMAD build processes.
 *
 * @author BlackUnicorn.Tech
 * @version 2.0.0
 * @module quality-gate-enforcer
 */

import { EventEmitter } from "events";

/**
 * Quality dimension categories
 */
export enum QualityDimension {
    SECURITY = "security",
    PERFORMANCE = "performance",
    RELIABILITY = "reliability",
    MAINTAINABILITY = "maintainability",
    COVERAGE = "coverage",
    COMPLEXITY = "complexity",
    DOCUMENTATION = "documentation",
    ACCESSIBILITY = "accessibility"
}

/**
 * Gate result status
 */
export enum GateStatus {
    PASSED = "passed",
    FAILED = "failed",
    WARNING = "warning",
    SKIPPED = "skipped",
    ERROR = "error"
}

/**
 * Severity levels for violations
 */
export enum ViolationSeverity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    INFO = "info"
}

/**
 * Quality metric interface
 */
export interface QualityMetric {
    name: string;
    dimension: QualityDimension;
    value: number;
    threshold: number;
    operator: "gte" | "lte" | "eq" | "gt" | "lt";
    weight: number;
    description?: string;
}

/**
 * Violation interface
 */
export interface QualityViolation {
    id: string;
    metric: string;
    dimension: QualityDimension;
    severity: ViolationSeverity;
    message: string;
    expected: number;
    actual: number;
    file?: string;
    line?: number;
    suggestion?: string;
}

/**
 * Gate result interface
 */
export interface GateResult {
    gateId: string;
    name: string;
    status: GateStatus;
    score: number;
    threshold: number;
    violations: QualityViolation[];
    metrics: QualityMetric[];
    duration: number;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

/**
 * Quality gate configuration
 */
export interface QualityGateConfig {
    id: string;
    name: string;
    description?: string;
    enabled: boolean;
    blocking: boolean;
    thresholds: {
        minimum: number;
        warning: number;
    };
    dimensions: {
        [key in QualityDimension]?: {
            weight: number;
            metrics: QualityMetric[];
        };
    };
    rules?: QualityRule[];
}

/**
 * Quality rule interface
 */
export interface QualityRule {
    id: string;
    name: string;
    dimension: QualityDimension;
    severity: ViolationSeverity;
    condition: (context: ValidationContext) => boolean;
    message: string;
    suggestion?: string;
}

/**
 * Validation context
 */
export interface ValidationContext {
    metrics: Map<string, number>;
    files: string[];
    metadata: Record<string, unknown>;
    previousResults?: GateResult[];
}

/**
 * Historical data point
 */
interface HistoricalDataPoint {
    timestamp: Date;
    score: number;
    metrics: Map<string, number>;
    gateId: string;
}

/**
 * Quality Gate Enforcer Class
 */
export class QualityGateEnforcer extends EventEmitter {
    private gates: Map<string, QualityGateConfig>;
    private history: HistoricalDataPoint[];
    private regressionThreshold: number;
    private maxHistorySize: number;

    constructor(config: { regressionThreshold?: number; maxHistorySize?: number } = {}) {
        super();
        this.gates = new Map();
        this.history = [];
        this.regressionThreshold = config.regressionThreshold ?? 5;
        this.maxHistorySize = config.maxHistorySize ?? 100;
        this._initializeDefaultGates();
    }

    /**
     * Register a quality gate
     */
    public registerGate(gate: QualityGateConfig): void {
        this.gates.set(gate.id, gate);
        this.emit("gateRegistered", gate);
    }

    /**
     * Remove a quality gate
     */
    public removeGate(gateId: string): boolean {
        const removed = this.gates.delete(gateId);
        if (removed) {
            this.emit("gateRemoved", gateId);
        }
        return removed;
    }

    /**
     * Get all registered gates
     */
    public getGates(): QualityGateConfig[] {
        return Array.from(this.gates.values());
    }

    /**
     * Enforce all quality gates
     */
    public async enforceAll(context: ValidationContext): Promise<GateResult[]> {
        const results: GateResult[] = [];
        const startTime = Date.now();

        for (const gate of this.gates.values()) {
            if (!gate.enabled) {
                results.push(this._createSkippedResult(gate));
                continue;
            }

            try {
                const result = await this.enforceGate(gate.id, context);
                results.push(result);

                if (result.status === GateStatus.FAILED && gate.blocking) {
                    this.emit("blockingFailure", result);
                    break;
                }
            } catch (error) {
                results.push(this._createErrorResult(gate, error as Error));
            }
        }

        const totalDuration = Date.now() - startTime;
        const summary = this._createSummary(results, totalDuration);
        this.emit("enforcementComplete", summary);

        return results;
    }

    /**
     * Enforce a specific quality gate
     */
    public async enforceGate(gateId: string, context: ValidationContext): Promise<GateResult> {
        const gate = this.gates.get(gateId);
        if (!gate) {
            throw new Error(`Quality gate not found: ${gateId}`);
        }

        const startTime = Date.now();
        const violations: QualityViolation[] = [];
        const evaluatedMetrics: QualityMetric[] = [];
        let totalScore = 0;
        let totalWeight = 0;

        // Evaluate each dimension
        for (const [dimension, config] of Object.entries(gate.dimensions)) {
            if (!config) continue;

            const dimensionScore = this._evaluateDimension(
                dimension as QualityDimension,
                config.metrics,
                config.weight,
                context,
                violations,
                evaluatedMetrics
            );

            totalScore += dimensionScore * config.weight;
            totalWeight += config.weight;
        }

        // Evaluate custom rules
        if (gate.rules) {
            this._evaluateRules(gate.rules, context, violations);
        }

        // Calculate final score
        const finalScore = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) / 100 : 0;

        // Determine status
        const status = this._determineStatus(finalScore, violations, gate.thresholds);

        // Check for regression
        const regressionInfo = this._checkRegression(gateId, finalScore);
        if (regressionInfo.isRegression) {
            violations.push({
                id: `regression-${gateId}`,
                metric: "quality_score",
                dimension: QualityDimension.RELIABILITY,
                severity: ViolationSeverity.HIGH,
                message: `Quality regression detected: score dropped from ${regressionInfo.previousScore} to ${finalScore}`,
                expected: regressionInfo.previousScore!,
                actual: finalScore,
                suggestion: "Review recent changes that may have impacted quality metrics"
            });
        }

        const result: GateResult = {
            gateId,
            name: gate.name,
            status,
            score: finalScore,
            threshold: gate.thresholds.minimum,
            violations,
            metrics: evaluatedMetrics,
            duration: Date.now() - startTime,
            timestamp: new Date(),
            metadata: {
                regressionDetected: regressionInfo.isRegression,
                previousScore: regressionInfo.previousScore
            }
        };

        // Store in history
        this._recordHistory(gateId, finalScore, context.metrics);

        this.emit("gateEvaluated", result);
        return result;
    }

    /**
     * Get quality trend analysis
     */
    public getTrendAnalysis(gateId: string, days: number = 30): {
        trend: "improving" | "declining" | "stable";
        averageScore: number;
        minScore: number;
        maxScore: number;
        dataPoints: number;
    } {
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const relevantHistory = this.history.filter(
            h => h.gateId === gateId && h.timestamp >= cutoffDate
        );

        if (relevantHistory.length < 2) {
            return {
                trend: "stable",
                averageScore: relevantHistory[0]?.score ?? 0,
                minScore: relevantHistory[0]?.score ?? 0,
                maxScore: relevantHistory[0]?.score ?? 0,
                dataPoints: relevantHistory.length
            };
        }

        const scores = relevantHistory.map(h => h.score);
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);

        // Calculate trend using linear regression
        const n = scores.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (let i = 0; i < n; i++) {
            const score = scores[i] ?? 0;
            sumX += i;
            sumY += score;
            sumXY += i * score;
            sumX2 += i * i;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

        let trend: "improving" | "declining" | "stable" = "stable";
        if (slope > 0.1) trend = "improving";
        else if (slope < -0.1) trend = "declining";

        return {
            trend,
            averageScore: Math.round(averageScore * 100) / 100,
            minScore,
            maxScore,
            dataPoints: relevantHistory.length
        };
    }

    /**
     * Generate quality report
     */
    public generateReport(results: GateResult[]): string {
        const lines: string[] = [];
        lines.push("=".repeat(60));
        lines.push("QUALITY GATE ENFORCEMENT REPORT");
        lines.push("=".repeat(60));
        lines.push("");

        const passed = results.filter(r => r.status === GateStatus.PASSED).length;
        const failed = results.filter(r => r.status === GateStatus.FAILED).length;
        const warnings = results.filter(r => r.status === GateStatus.WARNING).length;

        lines.push(`Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
        lines.push("");

        for (const result of results) {
            const statusIcon = this._getStatusIcon(result.status);
            lines.push(`${statusIcon} ${result.name}: ${result.score}/${result.threshold} [${result.status.toUpperCase()}]`);

            if (result.violations.length > 0) {
                lines.push("  Violations:");
                for (const violation of result.violations) {
                    lines.push(`    - [${violation.severity.toUpperCase()}] ${violation.message}`);
                    if (violation.suggestion) {
                        lines.push(`      Suggestion: ${violation.suggestion}`);
                    }
                }
            }
            lines.push("");
        }

        lines.push("=".repeat(60));
        lines.push(`Report generated at: ${new Date().toISOString()}`);

        return lines.join("\n");
    }

    /**
     * Export results as JSON
     */
    public exportResults(results: GateResult[]): string {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                total: results.length,
                passed: results.filter(r => r.status === GateStatus.PASSED).length,
                failed: results.filter(r => r.status === GateStatus.FAILED).length,
                warnings: results.filter(r => r.status === GateStatus.WARNING).length,
                skipped: results.filter(r => r.status === GateStatus.SKIPPED).length
            },
            results
        }, null, 2);
    }

    // ==================== PRIVATE METHODS ====================

    /**
     * Initialize default quality gates
     */
    private _initializeDefaultGates(): void {
        // Security Gate
        this.registerGate({
            id: "security",
            name: "Security Quality Gate",
            description: "Validates security standards and vulnerability thresholds",
            enabled: true,
            blocking: true,
            thresholds: { minimum: 80, warning: 90 },
            dimensions: {
                [QualityDimension.SECURITY]: {
                    weight: 1,
                    metrics: [
                        { name: "vulnerabilities_critical", dimension: QualityDimension.SECURITY, value: 0, threshold: 0, operator: "lte", weight: 5, description: "Critical vulnerabilities" },
                        { name: "vulnerabilities_high", dimension: QualityDimension.SECURITY, value: 0, threshold: 3, operator: "lte", weight: 3, description: "High vulnerabilities" },
                        { name: "security_score", dimension: QualityDimension.SECURITY, value: 0, threshold: 80, operator: "gte", weight: 2, description: "Overall security score" }
                    ]
                }
            }
        });

        // Code Quality Gate
        this.registerGate({
            id: "code_quality",
            name: "Code Quality Gate",
            description: "Validates code quality metrics and maintainability",
            enabled: true,
            blocking: false,
            thresholds: { minimum: 70, warning: 85 },
            dimensions: {
                [QualityDimension.MAINTAINABILITY]: {
                    weight: 0.4,
                    metrics: [
                        { name: "maintainability_index", dimension: QualityDimension.MAINTAINABILITY, value: 0, threshold: 20, operator: "gte", weight: 2, description: "Maintainability index" },
                        { name: "technical_debt_ratio", dimension: QualityDimension.MAINTAINABILITY, value: 0, threshold: 5, operator: "lte", weight: 1, description: "Technical debt ratio (%)" }
                    ]
                },
                [QualityDimension.COMPLEXITY]: {
                    weight: 0.3,
                    metrics: [
                        { name: "cyclomatic_complexity", dimension: QualityDimension.COMPLEXITY, value: 0, threshold: 10, operator: "lte", weight: 2, description: "Average cyclomatic complexity" },
                        { name: "cognitive_complexity", dimension: QualityDimension.COMPLEXITY, value: 0, threshold: 15, operator: "lte", weight: 1, description: "Cognitive complexity" }
                    ]
                },
                [QualityDimension.COVERAGE]: {
                    weight: 0.3,
                    metrics: [
                        { name: "line_coverage", dimension: QualityDimension.COVERAGE, value: 0, threshold: 80, operator: "gte", weight: 2, description: "Line coverage (%)" },
                        { name: "branch_coverage", dimension: QualityDimension.COVERAGE, value: 0, threshold: 70, operator: "gte", weight: 1, description: "Branch coverage (%)" }
                    ]
                }
            }
        });

        // Performance Gate
        this.registerGate({
            id: "performance",
            name: "Performance Quality Gate",
            description: "Validates performance benchmarks and thresholds",
            enabled: true,
            blocking: false,
            thresholds: { minimum: 75, warning: 90 },
            dimensions: {
                [QualityDimension.PERFORMANCE]: {
                    weight: 1,
                    metrics: [
                        { name: "build_time_seconds", dimension: QualityDimension.PERFORMANCE, value: 0, threshold: 300, operator: "lte", weight: 2, description: "Build time (seconds)" },
                        { name: "bundle_size_mb", dimension: QualityDimension.PERFORMANCE, value: 0, threshold: 10, operator: "lte", weight: 1, description: "Bundle size (MB)" },
                        { name: "memory_usage_mb", dimension: QualityDimension.PERFORMANCE, value: 0, threshold: 512, operator: "lte", weight: 1, description: "Memory usage (MB)" }
                    ]
                }
            }
        });
    }

    /**
     * Evaluate a quality dimension
     */
    private _evaluateDimension(
        dimension: QualityDimension,
        metrics: QualityMetric[],
        _weight: number,
        context: ValidationContext,
        violations: QualityViolation[],
        evaluatedMetrics: QualityMetric[]
    ): number {
        let dimensionScore = 0;
        let totalWeight = 0;

        for (const metric of metrics) {
            const actualValue = context.metrics.get(metric.name) ?? 0;
            const evaluatedMetric = { ...metric, value: actualValue };
            evaluatedMetrics.push(evaluatedMetric);

            const passed = this._evaluateMetric(metric, actualValue);

            if (passed) {
                dimensionScore += metric.weight;
            } else {
                violations.push({
                    id: `${dimension}-${metric.name}`,
                    metric: metric.name,
                    dimension,
                    severity: this._getSeverityFromMetric(metric, actualValue),
                    message: `${metric.description || metric.name} failed: expected ${metric.operator} ${metric.threshold}, got ${actualValue}`,
                    expected: metric.threshold,
                    actual: actualValue,
                    suggestion: this._getSuggestionForMetric(metric)
                });
            }

            totalWeight += metric.weight;
        }

        return totalWeight > 0 ? (dimensionScore / totalWeight) * 100 : 0;
    }

    /**
     * Evaluate a single metric
     */
    private _evaluateMetric(metric: QualityMetric, actualValue: number): boolean {
        switch (metric.operator) {
            case "gte": return actualValue >= metric.threshold;
            case "lte": return actualValue <= metric.threshold;
            case "gt": return actualValue > metric.threshold;
            case "lt": return actualValue < metric.threshold;
            case "eq": return actualValue === metric.threshold;
            default: return false;
        }
    }

    /**
     * Evaluate custom rules
     */
    private _evaluateRules(
        rules: QualityRule[],
        context: ValidationContext,
        violations: QualityViolation[]
    ): void {
        for (const rule of rules) {
            try {
                const passed = rule.condition(context);
                if (!passed) {
                    const violation: QualityViolation = {
                        id: rule.id,
                        metric: rule.id,
                        dimension: rule.dimension,
                        severity: rule.severity,
                        message: rule.message,
                        expected: 1,
                        actual: 0
                    };
                    if (rule.suggestion !== undefined) {
                        violation.suggestion = rule.suggestion;
                    }
                    violations.push(violation);
                }
            } catch (error) {
                violations.push({
                    id: `${rule.id}-error`,
                    metric: rule.id,
                    dimension: rule.dimension,
                    severity: ViolationSeverity.HIGH,
                    message: `Rule evaluation failed: ${(error as Error).message}`,
                    expected: 1,
                    actual: 0
                });
            }
        }
    }

    /**
     * Determine gate status based on score and violations
     */
    private _determineStatus(
        score: number,
        violations: QualityViolation[],
        thresholds: { minimum: number; warning: number }
    ): GateStatus {
        const hasCritical = violations.some(v => v.severity === ViolationSeverity.CRITICAL);

        if (hasCritical) return GateStatus.FAILED;
        if (score < thresholds.minimum) return GateStatus.FAILED;
        if (score < thresholds.warning) return GateStatus.WARNING;
        return GateStatus.PASSED;
    }

    /**
     * Check for quality regression
     */
    private _checkRegression(gateId: string, currentScore: number): {
        isRegression: boolean;
        previousScore: number | null;
    } {
        const previousResults = this.history
            .filter(h => h.gateId === gateId)
            .slice(-5);

        if (previousResults.length === 0) {
            return { isRegression: false, previousScore: null };
        }

        const avgPrevious = previousResults.reduce((sum, h) => sum + h.score, 0) / previousResults.length;
        const isRegression = avgPrevious - currentScore > this.regressionThreshold;

        return {
            isRegression,
            previousScore: Math.round(avgPrevious * 100) / 100
        };
    }

    /**
     * Record history data point
     */
    private _recordHistory(gateId: string, score: number, metrics: Map<string, number>): void {
        this.history.push({
            timestamp: new Date(),
            score,
            metrics: new Map(metrics),
            gateId
        });

        // Trim history if needed
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
        }
    }

    /**
     * Create skipped result
     */
    private _createSkippedResult(gate: QualityGateConfig): GateResult {
        return {
            gateId: gate.id,
            name: gate.name,
            status: GateStatus.SKIPPED,
            score: 0,
            threshold: gate.thresholds.minimum,
            violations: [],
            metrics: [],
            duration: 0,
            timestamp: new Date(),
            metadata: { reason: "Gate is disabled" }
        };
    }

    /**
     * Create error result
     */
    private _createErrorResult(gate: QualityGateConfig, error: Error): GateResult {
        return {
            gateId: gate.id,
            name: gate.name,
            status: GateStatus.ERROR,
            score: 0,
            threshold: gate.thresholds.minimum,
            violations: [{
                id: `error-${gate.id}`,
                metric: "gate_execution",
                dimension: QualityDimension.RELIABILITY,
                severity: ViolationSeverity.CRITICAL,
                message: `Gate execution failed: ${error.message}`,
                expected: 1,
                actual: 0
            }],
            metrics: [],
            duration: 0,
            timestamp: new Date(),
            metadata: { error: error.message }
        };
    }

    /**
     * Create summary from results
     */
    private _createSummary(results: GateResult[], duration: number): {
        totalDuration: number;
        passed: number;
        failed: number;
        warnings: number;
        overallStatus: GateStatus;
    } {
        const passed = results.filter(r => r.status === GateStatus.PASSED).length;
        const failed = results.filter(r => r.status === GateStatus.FAILED).length;
        const warnings = results.filter(r => r.status === GateStatus.WARNING).length;

        let overallStatus = GateStatus.PASSED;
        if (failed > 0) overallStatus = GateStatus.FAILED;
        else if (warnings > 0) overallStatus = GateStatus.WARNING;

        return { totalDuration: duration, passed, failed, warnings, overallStatus };
    }

    /**
     * Get severity based on metric deviation
     */
    private _getSeverityFromMetric(metric: QualityMetric, actualValue: number): ViolationSeverity {
        const deviation = Math.abs(actualValue - metric.threshold);
        const percentDeviation = (deviation / metric.threshold) * 100;

        if (percentDeviation > 50) return ViolationSeverity.CRITICAL;
        if (percentDeviation > 25) return ViolationSeverity.HIGH;
        if (percentDeviation > 10) return ViolationSeverity.MEDIUM;
        return ViolationSeverity.LOW;
    }

    /**
     * Get suggestion for metric
     */
    private _getSuggestionForMetric(metric: QualityMetric): string {
        const suggestions: Record<string, string> = {
            vulnerabilities_critical: "Address all critical vulnerabilities immediately",
            vulnerabilities_high: "Review and fix high severity vulnerabilities",
            security_score: "Run security scan and address findings",
            line_coverage: "Add unit tests to improve code coverage",
            branch_coverage: "Add tests for uncovered branches",
            cyclomatic_complexity: "Refactor complex functions into smaller units",
            cognitive_complexity: "Simplify code logic and reduce nesting",
            maintainability_index: "Improve code documentation and structure",
            technical_debt_ratio: "Address technical debt items",
            build_time_seconds: "Optimize build configuration and dependencies",
            bundle_size_mb: "Implement code splitting and tree shaking",
            memory_usage_mb: "Profile and optimize memory usage"
        };

        return suggestions[metric.name] || "Review metric and address issues";
    }

    /**
     * Get status icon for display
     */
    private _getStatusIcon(status: GateStatus): string {
        const icons: Record<GateStatus, string> = {
            [GateStatus.PASSED]: "[PASS]",
            [GateStatus.FAILED]: "[FAIL]",
            [GateStatus.WARNING]: "[WARN]",
            [GateStatus.SKIPPED]: "[SKIP]",
            [GateStatus.ERROR]: "[ERR!]"
        };
        return icons[status] || "[????]";
    }
}

export default QualityGateEnforcer;
