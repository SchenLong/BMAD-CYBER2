#!/usr/bin/env node
export class PerformanceBenchmark {
    distributionPath: string;
    testInstallPath: string;
    benchmarkResults: {
        timestamp: string;
        system: {
            platform: NodeJS.Platform;
            architecture: string;
            nodeVersion: string;
            totalMemory: number;
            availableMemory: number;
            cpuCores: number;
        };
        installation: {};
        agentLoading: {};
        memoryUsage: {};
        fileSystem: {};
        concurrency: {};
        recommendations: never[];
    };
    getSystemInfo(): {
        platform: NodeJS.Platform;
        architecture: string;
        nodeVersion: string;
        totalMemory: number;
        availableMemory: number;
        cpuCores: number;
    };
    runBenchmarks(): Promise<{
        timestamp: string;
        system: {
            platform: NodeJS.Platform;
            architecture: string;
            nodeVersion: string;
            totalMemory: number;
            availableMemory: number;
            cpuCores: number;
        };
        installation: {};
        agentLoading: {};
        memoryUsage: {};
        fileSystem: {};
        concurrency: {};
        recommendations: never[];
    }>;
    benchmarkInstallation(): Promise<void>;
    benchmarkAgentLoading(): Promise<void>;
    benchmarkTeamAgentLoading(team: any): Promise<{
        agentCount: number;
        successfulLoads: number;
        failedLoads: number;
        avgLoadTime: number;
        maxLoadTime: number;
        minLoadTime: number;
        error?: never;
    } | {
        agentCount: number;
        successfulLoads: number;
        failedLoads: number;
        error: any;
        avgLoadTime?: never;
        maxLoadTime?: never;
        minLoadTime?: never;
    }>;
    benchmarkMemoryUsage(): Promise<void>;
    benchmarkFileSystemPerformance(): Promise<void>;
    benchmarkConcurrentAccess(): Promise<void>;
    simulateConcurrentAgentLoad(): Promise<void>;
    getDirectoryStats(dirPath: any): Promise<{
        fileCount: number;
        totalSize: number;
    }>;
    validateTeamModule(team: any): Promise<boolean>;
    generatePerformanceReport(): Promise<{
        timestamp: string;
        system: {
            platform: NodeJS.Platform;
            architecture: string;
            nodeVersion: string;
            totalMemory: number;
            availableMemory: number;
            cpuCores: number;
        };
        installation: {};
        agentLoading: {};
        memoryUsage: {};
        fileSystem: {};
        concurrency: {};
        recommendations: never[];
    }>;
}
//# sourceMappingURL=bmad-performance-benchmark.d.ts.map