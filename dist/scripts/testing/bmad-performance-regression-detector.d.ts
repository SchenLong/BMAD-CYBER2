#!/usr/bin/env node
export class PerformanceRegressionDetector {
    projectRoot: string;
    benchmarkHistory: any[];
    thresholds: {
        loadTimeRegression: number;
        memoryRegression: number;
        throughputRegression: number;
        integrationLatencyRegression: number;
    };
    currentBenchmark: {
        timestamp: string;
        system: {
            platform: NodeJS.Platform;
            architecture: string;
            nodeVersion: string;
            cpuCores: number;
            totalMemory: number;
        };
        metrics: {};
    };
    getSystemInfo(): {
        platform: NodeJS.Platform;
        architecture: string;
        nodeVersion: string;
        cpuCores: number;
        totalMemory: number;
    };
    detectRegressions(): Promise<{
        regressions: {
            type: string;
            severity: string;
            previousValue: any;
            currentValue: any;
            changePercent: number;
            impact: string;
        }[];
        currentMetrics: {};
    }>;
    loadBenchmarkHistory(): Promise<void>;
    runCurrentBenchmarks(): Promise<void>;
    benchmarkAgentLoading(): Promise<{
        totalAgents: number;
        averageLoadTime: number;
        maxLoadTime: number;
        minLoadTime: number;
    }>;
    benchmarkMemoryUsage(): Promise<{
        initialHeapMB: number;
        peakHeapMB: number;
        memoryGrowthMB: number;
        agentsLoaded: number;
        memoryPerAgentKB: number;
    }>;
    benchmarkIntegrationLatency(): Promise<{
        averageLatency: number;
        maxLatency: number;
        minLatency: number;
        totalTests: number;
    }>;
    simulateIntegrationTest(teamA: any, teamB: any): Promise<void>;
    benchmarkThroughput(): Promise<{
        totalOperations: number;
        totalTimeMs: number;
        operationsPerSecond: number;
        averageOperationTime: number;
    }>;
    simulateAgentOperation(): Promise<void>;
    benchmarkFileSystem(): Promise<{
        totalFiles: number;
        totalTimeMs: number;
        filesPerSecond: number;
        averageReadTime: number;
    }>;
    analyzeRegressions(): Promise<{
        type: string;
        severity: string;
        previousValue: any;
        currentValue: any;
        changePercent: number;
        impact: string;
    }[]>;
    isRegression(previousValue: any, currentValue: any, thresholdPercent: any): boolean;
    isThroughputRegression(previousValue: any, currentValue: any, thresholdPercent: any): boolean;
    calculateChangePercent(previousValue: any, currentValue: any): number;
    generateRegressionReport(regressions: any): Promise<{
        timestamp: string;
        regressions: any;
        currentMetrics: {};
        system: {
            platform: NodeJS.Platform;
            architecture: string;
            nodeVersion: string;
            cpuCores: number;
            totalMemory: number;
        };
        thresholds: {
            loadTimeRegression: number;
            memoryRegression: number;
            throughputRegression: number;
            integrationLatencyRegression: number;
        };
        conclusion: string;
    }>;
}
//# sourceMappingURL=bmad-performance-regression-detector.d.ts.map