#!/usr/bin/env node
export class LoadTestingFramework {
    projectRoot: string;
    maxConcurrency: number;
    testScenarios: {
        name: string;
        concurrency: number;
        duration: number;
        operations: number;
    }[];
    results: {
        timestamp: string;
        system: {
            platform: NodeJS.Platform;
            architecture: string;
            nodeVersion: string;
            cpuCores: number;
            totalMemory: number;
            availableMemory: number;
            loadAverage: number[];
        };
        scenarios: {};
        summary: {};
        bottlenecks: never[];
        recommendations: never[];
    };
    getSystemInfo(): {
        platform: NodeJS.Platform;
        architecture: string;
        nodeVersion: string;
        cpuCores: number;
        totalMemory: number;
        availableMemory: number;
        loadAverage: number[];
    };
    executeLoadTests(): Promise<{
        timestamp: string;
        system: {
            platform: NodeJS.Platform;
            architecture: string;
            nodeVersion: string;
            cpuCores: number;
            totalMemory: number;
            availableMemory: number;
            loadAverage: number[];
        };
        scenarios: {};
        summary: {};
        bottlenecks: never[];
        recommendations: never[];
    }>;
    warmupSystem(): Promise<void>;
    executeScenario(scenario: any): Promise<{
        scenario: any;
        concurrency: any;
        duration: any;
        targetOperations: any;
        completedOperations: number;
        errorCount: number;
        responseTimes: never[];
        startTime: number;
        endTime: null;
        peakMemoryMB: number;
        avgCpuUsage: number;
    }>;
    executeControlledLoad(scenario: any, results: any): Promise<void>;
    executeOperation(results: any): Promise<void>;
    simulateOperation(): Promise<void>;
    simulateAgentLoading(): Promise<void>;
    simulateIntegrationOperation(): Promise<void>;
    simulateDataProcessing(): Promise<void>;
    analyzeBottlenecks(): Promise<void>;
    generateLoadTestReport(): Promise<{
        timestamp: string;
        system: {
            platform: NodeJS.Platform;
            architecture: string;
            nodeVersion: string;
            cpuCores: number;
            totalMemory: number;
            availableMemory: number;
            loadAverage: number[];
        };
        scenarios: {};
        summary: {};
        bottlenecks: never[];
        recommendations: never[];
    }>;
    generateRecommendations(): void;
    calculateOverallScore(scenarios: any): number;
    getPerformanceAssessment(score: any): "🎉 EXCELLENT - System handles load exceptionally well" | "✅ GOOD - System performance is acceptable under load" | "⚠️ ACCEPTABLE - System shows some stress under high load" | "❌ POOR - System struggles significantly under load" | "🚨 CRITICAL - System fails under load - immediate optimization required";
}
//# sourceMappingURL=bmad-load-testing-framework.d.ts.map