#!/usr/bin/env node
export class ComprehensivePerformanceAnalyzer {
    projectRoot: string;
    testInstallPath: string;
    srcPath: string;
    analysisResults: {
        timestamp: string;
        analyst: string;
        mission: string;
        system: {
            platform: NodeJS.Platform;
            architecture: string;
            nodeVersion: string;
            totalMemory: number;
            availableMemory: number;
            cpuCores: number;
            cpuModel: string;
            loadAverage: number[];
            uptime: number;
        };
        architecture: {};
        modules: {};
        performance: {};
        integration: {};
        scalability: {};
        optimization: {};
        recommendations: never[];
    };
    getSystemInfo(): {
        platform: NodeJS.Platform;
        architecture: string;
        nodeVersion: string;
        totalMemory: number;
        availableMemory: number;
        cpuCores: number;
        cpuModel: string;
        loadAverage: number[];
        uptime: number;
    };
    executeComprehensiveAnalysis(): Promise<{
        timestamp: string;
        analyst: string;
        mission: string;
        system: {
            platform: NodeJS.Platform;
            architecture: string;
            nodeVersion: string;
            totalMemory: number;
            availableMemory: number;
            cpuCores: number;
            cpuModel: string;
            loadAverage: number[];
            uptime: number;
        };
        architecture: {};
        modules: {};
        performance: {};
        integration: {};
        scalability: {};
        optimization: {};
        recommendations: never[];
    }>;
    analyzeSystemArchitecture(): Promise<void>;
    analyzeTeamArchitecture(team: any): Promise<{
        agentCount: number;
        workflowCount: number;
        fileCount: number;
        totalSize: number;
        hasPackageJson: boolean;
        hasModuleYaml: boolean;
        directories: never[];
    } | {
        agentCount: number;
        workflowCount: number;
        fileCount: number;
        totalSize: number;
        hasPackageJson: boolean;
        hasModuleYaml: boolean;
        error: string;
    }>;
    countWorkflowsRecursive(dirPath: any): Promise<number>;
    analyzeModulePerformance(): Promise<void>;
    analyzeModulePerformanceCharacteristics(team: any): Promise<{
        agentLoadTimes: never[];
        averageLoadTime: number;
        maxLoadTime: number;
        minLoadTime: number;
        memoryPerAgent: number;
        processingThroughput: number;
        errors: string[];
        totalAgents?: never;
    } | {
        agentLoadTimes: number[];
        averageLoadTime: number;
        maxLoadTime: number;
        minLoadTime: number;
        memoryPerAgent: number;
        processingThroughput: number;
        totalAgents: number;
        errors?: never;
    }>;
    simulateAgentProcessing(agentConfig: any): Promise<any>;
    calculateAgentComplexity(agentConfig: any): number;
    analyzeCrossModuleIntegration(): Promise<void>;
    testModuleIntegration(teamA: any, teamB: any): Promise<{
        successful: boolean;
        latency: number;
        exchangeLatency: number;
        throughput: number;
        moduleAAgents: number;
        moduleBAgents: number;
        error?: never;
    } | {
        successful: boolean;
        latency: number;
        error: any;
        throughput: number;
        exchangeLatency?: never;
        moduleAAgents?: never;
        moduleBAgents?: never;
    }>;
    loadModuleAgents(team: any): Promise<any[]>;
    simulateDataExchange(agentsA: any, agentsB: any): Promise<number>;
    calculateAverageLatency(integrationResults: any): number;
    analyzeAPIPerformance(): Promise<void>;
    testAPIEndpoint(endpoint: any): Promise<{
        averageResponseTime: number;
        minResponseTime: number;
        maxResponseTime: number;
        requestsPerSecond: number;
        iterations: number;
        complexity: any;
    }>;
    getProcessingTimeForComplexity(complexity: any): number;
    calculateOverallAverageResponseTime(apiResults: any): number;
    calculateOverallThroughput(apiResults: any): number;
    analyzeResourceUtilization(): Promise<void>;
    simulateWorkload(intensity: any, operations: any): Promise<{
        intensity: any;
        operations: any;
        totalTime: number;
        averageOperationTime: number;
        throughput: number;
        memoryUsed: number;
    }>;
    simulateOperation(intensity: any): Promise<void>;
    analyzeScalability(): Promise<void>;
    testConcurrencyLevel(concurrency: any): Promise<{
        concurrency: any;
        totalTime: number;
        averageLatency: number;
        maxLatency: number;
        minLatency: number;
        throughput: number;
        successRate: number;
    }>;
    simulateConcurrentOperation(): Promise<{
        operationTime: number;
        successful: boolean;
    }>;
    findOptimalConcurrency(scalabilityResults: any): {
        level: number;
        throughput: number;
    };
    calculateScalabilityScore(scalabilityResults: any): number;
    identifyOptimizationOpportunities(): Promise<void>;
    calculateArchitecturalComplexity(architecture: any): number;
    getDirectoryStats(dirPath: any): Promise<{
        fileCount: number;
        totalSize: number;
    }>;
    generateTechnicalReport(): Promise<{
        timestamp: string;
        analyst: string;
        mission: string;
        system: {
            platform: NodeJS.Platform;
            architecture: string;
            nodeVersion: string;
            totalMemory: number;
            availableMemory: number;
            cpuCores: number;
            cpuModel: string;
            loadAverage: number[];
            uptime: number;
        };
        architecture: {};
        modules: {};
        performance: {};
        integration: {};
        scalability: {};
        optimization: {};
        recommendations: never[];
    }>;
}
//# sourceMappingURL=STORY-2.2-PERFORMANCE-ANALYSIS-COMPREHENSIVE.d.ts.map