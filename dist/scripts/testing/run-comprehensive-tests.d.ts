#!/usr/bin/env node
export = ComprehensiveTestRunner;
declare class ComprehensiveTestRunner {
    results: {
        timestamp: string;
        epic: string;
        story: string;
        lead: string;
        methodology: string;
        testSuites: {};
        overallStatus: string;
        coverageAchieved: number;
        targetCoverage: number;
    };
    runAllTests(): Promise<void>;
    runTestSuite(suiteName: any, command: any): Promise<void>;
    executeCommand(command: any): Promise<any>;
    runCoverageValidation(): Promise<void>;
    generateFinalReport(): Promise<void>;
    generateRecommendations(): string[];
}
//# sourceMappingURL=run-comprehensive-tests.d.ts.map