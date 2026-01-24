#!/usr/bin/env node
export class EncodedPayloadDetection {
    encodingPatterns: {
        base64: RegExp;
        hex: RegExp;
        url: RegExp;
        unicode: RegExp;
        html: RegExp;
    };
    suspiciousPatterns: RegExp[];
    steganographicMarkers: string[];
    detectionLog: any[];
    /**
     * Enhanced payload detection with multi-layer analysis
     */
    detectEncodedPayload(input: any): {
        timestamp: string;
        input: string;
        encodingDetected: never[];
        suspiciousContent: never[];
        riskScore: number;
        action: string;
        reason: never[];
    };
    detectEncodings(input: any, detection: any): void;
    analyzeDecodedContent(input: any, detection: any): void;
    detectSteganographicContent(input: any, detection: any): void;
    analyzeBehavioralPatterns(input: any, detection: any): void;
    calculateEntropy(str: any): number;
    detectRepeatingPatterns(input: any): {
        pattern: any;
        count: any;
    }[];
    analyzeSuspiciousStructure(input: any): boolean;
    categorizePattern(index: any): "command-injection" | "script-injection" | "command-execution" | "data-exfiltration";
    getPatternRiskScore(index: any): number;
    calculateRiskScore(detection: any): void;
    makeSecurityDecision(detection: any): void;
    isReadableText(text: any): boolean;
    getDetectionLog(): any[];
    generateSecurityReport(): {
        timestamp: string;
        totalDetections: number;
        blockedPayloads: number;
        quarantinedPayloads: number;
        warnedPayloads: number;
        blockRate: string;
        detectionEffectiveness: string;
    };
}
/**
 * Deployment function for encoded payload detection
 */
export function deployEncodedPayloadDetection(): EncodedPayloadDetection;
//# sourceMappingURL=encoded-payload-detection-patch.d.ts.map