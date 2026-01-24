#!/usr/bin/env node
export class SecurityFixValidation {
    privilegeProtection: any;
    payloadDetection: any;
    promptProtection: any;
    originalAttacks: {
        privilegeEscalation: {
            from: string;
            to: string;
            originalSuccess: boolean;
        }[];
        encodedPayloads: string[];
        promptInjections: string[];
    };
    validationResults: {};
    runComprehensiveValidation(): Promise<{
        timestamp: string;
        vulnerabilityFixes: {
            privilegeEscalation: any;
            encodedPayload: any;
            promptInjection: any;
        };
        overallMetrics: {
            originalRiskLevel: string;
            newRiskLevel: string;
            riskReduction: string;
            originalSecurityScore: string;
            newSecurityScore: string;
            securityImprovement: string;
        };
        recommendations: string[];
        nextSteps: string[];
    }>;
    validatePrivilegeEscalationFix(): Promise<void>;
    validateEncodedPayloadFix(): Promise<void>;
    validatePromptInjectionFix(): Promise<void>;
    generateComparisonReport(): {
        timestamp: string;
        vulnerabilityFixes: {
            privilegeEscalation: any;
            encodedPayload: any;
            promptInjection: any;
        };
        overallMetrics: {
            originalRiskLevel: string;
            newRiskLevel: string;
            riskReduction: string;
            originalSecurityScore: string;
            newSecurityScore: string;
            securityImprovement: string;
        };
        recommendations: string[];
        nextSteps: string[];
    };
    generateSecurityRecommendations(riskLevel: any): string[];
    generateNextSteps(): string[];
    displayValidationResults(report: any): void;
}
export function executeSecurityValidation(): Promise<{
    timestamp: string;
    vulnerabilityFixes: {
        privilegeEscalation: any;
        encodedPayload: any;
        promptInjection: any;
    };
    overallMetrics: {
        originalRiskLevel: string;
        newRiskLevel: string;
        riskReduction: string;
        originalSecurityScore: string;
        newSecurityScore: string;
        securityImprovement: string;
    };
    recommendations: string[];
    nextSteps: string[];
}>;
//# sourceMappingURL=security-fix-validation.d.ts.map