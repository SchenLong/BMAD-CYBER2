#!/usr/bin/env node
export = BMadEnterpriseSecurityTester;
declare class BMadEnterpriseSecurityTester {
    testResults: {
        startTime: Date;
        attackVectors: {};
        modules: {};
        overallScore: number;
        criticalFindings: never[];
        recommendations: never[];
        complianceStatus: {};
    };
    modules: string[];
    attackVectors: string[];
    validationLessons: string[];
    runComprehensiveSecurityTest(): Promise<void>;
    performPreflightChecks(): Promise<void>;
    executeAttackVectorTests(): Promise<void>;
    testAttackVector(vector: any): Promise<any>;
    testDirectPromptInjection(): Promise<{
        testCases: number;
        vulnerabilitiesFound: number;
        findings: never[];
    }>;
    testRoleHijacking(): Promise<{
        testCases: number;
        vulnerabilitiesFound: number;
        findings: never[];
    }>;
    testAuthoritySpoofing(): Promise<{
        testCases: number;
        vulnerabilitiesFound: number;
        findings: never[];
    }>;
    testEncodedPayload(): Promise<{
        testCases: number;
        vulnerabilitiesFound: number;
        findings: never[];
    }>;
    testPrivilegeEscalation(): Promise<{
        testCases: number;
        vulnerabilitiesFound: number;
        findings: never[];
    }>;
    testIndirectInjection(): Promise<{
        testCases: number;
        vulnerabilitiesFound: number;
        findings: never[];
    }>;
    performModuleSecurityValidation(): Promise<void>;
    validateModuleSecurity(module: any): Promise<{
        securityScore: number;
        vulnerabilities: number;
        complianceLevel: string;
        testsConducted: number;
        testsPassed: number;
    }>;
    verifyZeroTrustArchitecture(): Promise<void>;
    validateZeroTrustComponent(component: any): Promise<{
        status: string;
        score: number;
        details: string;
    }>;
    validate21LessonCompliance(): Promise<void>;
    validateLesson(lesson: any): Promise<{
        status: string;
        score: number;
        details: string;
    }>;
    verifyDefenseInDepth(): Promise<void>;
    testDefenseLayer(layer: any): Promise<number>;
    generateSecurityReport(): Promise<{
        timestamp: Date;
        testDuration: number;
        summary: {
            totalVulnerabilities: number;
            criticalVulnerabilities: number;
            attackVectorsCovered: number;
            modulesTested: number;
            overallStatus: string;
        };
        attackVectorResults: {};
        moduleResults: {};
        zeroTrustCompliance: any;
        complianceStatus: {};
        criticalFindings: never[];
        recommendations: string[];
        overallSecurityScore: number;
    }>;
    generateSummary(): {
        totalVulnerabilities: number;
        criticalVulnerabilities: number;
        attackVectorsCovered: number;
        modulesTested: number;
        overallStatus: string;
    };
    generateRecommendations(): string[];
    calculateOverallScore(): number;
    assessSecurityPosture(): Promise<void>;
    determinePosureStatus(score: any): "CRITICAL" | "EXCELLENT" | "GOOD" | "ACCEPTABLE" | "NEEDS_IMPROVEMENT";
    checkMissionSuccess(): boolean;
    simulatePromptInjectionTest(testCase: any): Promise<boolean>;
    simulateRoleHijackingTest(test: any): Promise<boolean>;
    simulateAuthoritySpoofingTest(test: any): Promise<boolean>;
    simulateEncodedPayloadTest(payload: any): Promise<boolean>;
    simulatePrivilegeEscalationTest(test: any): Promise<boolean>;
    simulateIndirectInjectionTest(test: any): Promise<boolean>;
    checkOwaspCompliance(): Promise<{
        compliant: boolean;
        score: number;
    }>;
    validateAuthenticationSystem(): Promise<{
        operational: boolean;
        strength: string;
    }>;
    validateAuthorizationFramework(): Promise<{
        active: boolean;
        roles: number;
    }>;
    validateEncryptionImplementation(): Promise<{
        compliant: boolean;
        algorithm: string;
    }>;
    validateAuditingCapabilities(): Promise<{
        enabled: boolean;
        realTime: boolean;
    }>;
}
//# sourceMappingURL=bmad-enterprise-security-tester.d.ts.map