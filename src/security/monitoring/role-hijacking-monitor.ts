/**
 * BMAD-CYBER2 Role Hijacking Detection System
 * EPIC 2 Story 2.1 - Attack Vector 2
 * Agent: Watchman (SOC-Analyst)
 *
 * Migrated from Python to TypeScript
 * Detects role hijacking and privilege escalation attempts
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface RoleAttempt {
  userId: string;
  attemptedRole: string;
  currentRole: string;
  timestamp: string;
  evidence: Record<string, unknown>;
  riskScore: number;
}

export interface AccessPattern {
  userId: string;
  accessTimes: Date[];
  resourcesAccessed: Set<string>;
  privilegeChanges: PrivilegeChange[];
  anomalyScore: number;
}

export interface PrivilegeChange {
  userId: string;
  oldRole: string;
  newRole: string;
  authorizedBy: string | null;
  timestamp: Date;
  legitimate: boolean;
  riskAssessment: RiskAssessment;
}

export interface RiskAssessment {
  transitionRisk: number;
  authorizationRisk: number;
  totalRisk: number;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface DetectionResult {
  userId: string;
  threatDetected: boolean;
  riskScore: number;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedAction: 'LOG_ONLY' | 'LOG_AND_MONITOR' | 'ENHANCED_MONITORING' | 'BLOCK_AND_ALERT';
  evidence: {
    hijackingIndicators: HijackingIndicator[];
    transitionRisk: number;
    behavioralRisk: number;
    currentRole: string;
    requestedRole: string | null;
    messageHash: string;
  };
  timestamp: string;
}

export interface HijackingIndicator {
  pattern: string;
  matches: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RoleDefinition {
  level: number;
  permissions: string[];
  canElevateTo: string[];
}

export interface RoleHierarchy {
  roles: Record<string, RoleDefinition>;
  restrictedTransitions: [string, string][];
}

// =============================================================================
// HIJACKING PATTERNS
// =============================================================================

const HIJACKING_PATTERNS: RegExp[] = [
  // Direct role claims
  /i\s+am\s+(admin|administrator|root|system)/i,
  /my\s+role\s+is\s+(security|admin|system)/i,
  /i\s+have\s+(admin|root|system)\s+(access|privileges)/i,
  /i\s+am\s+authorized\s+(by|as)\s+\w+/i,

  // Permission requests
  /give\s+me\s+(admin|root|system)\s+(access|rights)/i,
  /grant\s+me\s+(permission|access)\s+to/i,
  /i\s+need\s+(admin|elevated|system)\s+(access|privileges)/i,
  /promote\s+me\s+to\s+\w+/i,

  // Authority spoofing
  /on\s+behalf\s+of\s+(admin|system|security)/i,
  /authorized\s+by\s+(ceo|cto|admin)/i,
  /emergency\s+(access|override|privileges)/i,
  /temporarily\s+(elevate|promote|upgrade)\s+my/i,

  // Social engineering
  /my\s+manager\s+said\s+to\s+give\s+me/i,
  /i\s+was\s+told\s+to\s+get\s+(access|permissions)/i,
  /for\s+urgent\s+(business|security)\s+needs/i,
  /compliance\s+requires\s+me\s+to\s+have/i,

  // System exploitation
  /sudo\s+(su|bash|sh)/i,
  /runas\s+administrator/i,
  /elevate\s+to\s+(system|admin)/i,
  /bypass\s+(security|authentication)/i,

  // Time-based urgency
  /(urgent|emergency|critical|immediate)\s+access\s+needed/i,
  /deadline\s+(requires|needs)\s+elevated/i,
  /temporary\s+admin\s+for\s+(project|deadline)/i,
];

// =============================================================================
// ROLE HIERARCHY DEFINITION
// =============================================================================

const DEFAULT_ROLE_HIERARCHY: RoleHierarchy = {
  roles: {
    system_admin: {
      level: 10,
      permissions: ['*'],
      canElevateTo: [],
    },
    security_architect: {
      // Bastion
      level: 9,
      permissions: [
        'security_policy_write',
        'audit_access',
        'system_monitor',
        'incident_response',
        'compliance_manage',
      ],
      canElevateTo: [],
    },
    soc_analyst: {
      // Watchman
      level: 8,
      permissions: [
        'security_monitor',
        'incident_investigate',
        'threat_analyze',
        'alert_manage',
        'log_access',
      ],
      canElevateTo: ['security_architect'],
    },
    penetration_tester: {
      // Ghost
      level: 7,
      permissions: [
        'security_test',
        'vulnerability_scan',
        'exploit_simulate',
        'report_generate',
      ],
      canElevateTo: ['soc_analyst'],
    },
    intel_analyst: {
      level: 6,
      permissions: ['intel_gather', 'osint_access', 'threat_research', 'report_read'],
      canElevateTo: ['soc_analyst'],
    },
    legal_counsel: {
      level: 5,
      permissions: [
        'compliance_review',
        'policy_review',
        'legal_advice',
        'audit_participate',
      ],
      canElevateTo: [],
    },
    strategy_analyst: {
      level: 4,
      permissions: ['strategy_develop', 'risk_assess', 'policy_suggest', 'report_read'],
      canElevateTo: ['legal_counsel'],
    },
    user: {
      level: 1,
      permissions: ['basic_access', 'profile_manage'],
      canElevateTo: ['strategy_analyst'],
    },
    guest: {
      level: 0,
      permissions: ['read_only'],
      canElevateTo: ['user'],
    },
  },
  restrictedTransitions: [
    ['guest', 'security_architect'],
    ['user', 'penetration_tester'],
    ['user', 'soc_analyst'],
    ['strategy_analyst', 'security_architect'],
  ],
};

// =============================================================================
// ROLE HIJACKING MONITOR CLASS
// =============================================================================

export class RoleHijackingMonitor {
  private roleHierarchy: RoleHierarchy;
  private accessPatterns: Map<string, AccessPattern>;
  private alertThreshold: number;
  private logPath: string;

  constructor(options: {
    roleHierarchy?: RoleHierarchy;
    alertThreshold?: number;
    logPath?: string;
  } = {}) {
    this.roleHierarchy = options.roleHierarchy || DEFAULT_ROLE_HIERARCHY;
    this.accessPatterns = new Map();
    this.alertThreshold = options.alertThreshold || 0.8;
    this.logPath = options.logPath || './.claude/logs/security.log';

    // Ensure log directory exists
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Detect role hijacking attempts in user communications
   */
  detectRoleHijackingAttempt(
    userId: string,
    message: string,
    currentRole: string,
    requestedRole: string | null = null
  ): DetectionResult {
    // Pattern-based detection
    const hijackingIndicators: HijackingIndicator[] = [];
    const messageLower = message.toLowerCase();

    for (const pattern of HIJACKING_PATTERNS) {
      const matches = messageLower.match(pattern);
      if (matches) {
        hijackingIndicators.push({
          pattern: pattern.source,
          matches: Array.isArray(matches) ? matches : [matches[0]],
          severity: 'HIGH',
        });
      }
    }

    // Role transition validation
    const transitionRisk = this.validateRoleTransition(currentRole, requestedRole);

    // Behavioral analysis
    const behavioralRisk = this.analyzeUserBehavior(userId, message);

    // Calculate risk score
    const patternScore = hijackingIndicators.length * 0.3;
    const transitionScore = transitionRisk * 0.4;
    const behaviorScore = behavioralRisk * 0.3;

    const totalRisk = Math.min(patternScore + transitionScore + behaviorScore, 1.0);

    // Determine threat level and action
    let threatLevel: DetectionResult['threatLevel'];
    let action: DetectionResult['recommendedAction'];

    if (totalRisk >= 0.9) {
      threatLevel = 'CRITICAL';
      action = 'BLOCK_AND_ALERT';
    } else if (totalRisk >= 0.7) {
      threatLevel = 'HIGH';
      action = 'ENHANCED_MONITORING';
    } else if (totalRisk >= 0.5) {
      threatLevel = 'MEDIUM';
      action = 'LOG_AND_MONITOR';
    } else {
      threatLevel = 'LOW';
      action = 'LOG_ONLY';
    }

    const result: DetectionResult = {
      userId,
      threatDetected: totalRisk >= this.alertThreshold,
      riskScore: totalRisk,
      threatLevel,
      recommendedAction: action,
      evidence: {
        hijackingIndicators,
        transitionRisk,
        behavioralRisk,
        currentRole,
        requestedRole,
        messageHash: crypto.createHash('sha256').update(message).digest('hex'),
      },
      timestamp: new Date().toISOString(),
    };

    // Log and alert if necessary
    this.processDetectionResult(result, message);

    return result;
  }

  /**
   * Validate if role transition is legitimate
   */
  private validateRoleTransition(currentRole: string, requestedRole: string | null): number {
    if (!requestedRole) {
      return 0.0;
    }

    const roles = this.roleHierarchy.roles;
    const restricted = this.roleHierarchy.restrictedTransitions;

    // Check if roles exist
    if (!(currentRole in roles) || !(requestedRole in roles)) {
      return 0.9; // High risk for unknown roles
    }

    // Check for restricted transitions
    const isRestricted = restricted.some(
      ([from, to]) => from === currentRole && to === requestedRole
    );
    if (isRestricted) {
      return 1.0; // Maximum risk for forbidden transitions
    }

    // Calculate level jump risk
    const currentRoleDef = roles[currentRole];
    const requestedRoleDef = roles[requestedRole];
    if (!currentRoleDef || !requestedRoleDef) {
      return 0.9; // High risk if role definitions not found
    }
    const currentLevel = currentRoleDef.level;
    const requestedLevel = requestedRoleDef.level;
    const levelJump = requestedLevel - currentLevel;

    // Risk based on level jump
    if (levelJump > 3) {
      return 0.9; // High risk for large jumps
    } else if (levelJump > 1) {
      return 0.6; // Medium risk for moderate jumps
    } else if (levelJump === 1) {
      // Check if transition is allowed
      const allowedElevations = currentRoleDef.canElevateTo;
      if (allowedElevations.includes(requestedRole)) {
        return 0.2; // Low risk for allowed transitions
      } else {
        return 0.8; // High risk for unauthorized single-level jump
      }
    } else {
      return 0.1; // Low risk for lateral/downward moves
    }
  }

  /**
   * Analyze user behavioral patterns for anomalies
   */
  private analyzeUserBehavior(userId: string, message: string): number {
    const currentTime = new Date();

    // Get or create access pattern
    let pattern = this.accessPatterns.get(userId);
    if (!pattern) {
      pattern = {
        userId,
        accessTimes: [],
        resourcesAccessed: new Set(),
        privilegeChanges: [],
        anomalyScore: 0.0,
      };
      this.accessPatterns.set(userId, pattern);
    }

    // Update access times
    pattern.accessTimes.push(currentTime);

    // Keep only recent access times (last 24 hours)
    const cutoffTime = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
    pattern.accessTimes = pattern.accessTimes.filter((t) => t > cutoffTime);

    // Behavioral risk factors
    const messageLower = message.toLowerCase();
    const riskFactors = {
      highFrequencyAccess: pattern.accessTimes.length > 50,
      offHoursAccess: this.isOffHours(currentTime),
      urgentLanguage: /\b(urgent|emergency|asap|immediately)\b/.test(messageLower),
      socialEngineering: /\b(manager|boss|ceo|told|instructed)\b/.test(messageLower),
      technicalEscalation: /\b(sudo|admin|root|system|elevated)\b/.test(messageLower),
    };

    // Calculate behavioral risk
    const behavioralRisk =
      (riskFactors.highFrequencyAccess ? 0.3 : 0) +
      (riskFactors.offHoursAccess ? 0.2 : 0) +
      (riskFactors.urgentLanguage ? 0.2 : 0) +
      (riskFactors.socialEngineering ? 0.2 : 0) +
      (riskFactors.technicalEscalation ? 0.1 : 0);

    pattern.anomalyScore = Math.min(behavioralRisk, 1.0);
    return pattern.anomalyScore;
  }

  /**
   * Check if access is during off-hours
   */
  private isOffHours(timestamp: Date): boolean {
    // Weekend access
    const day = timestamp.getDay();
    if (day === 0 || day === 6) {
      return true;
    }

    // Outside business hours (9 AM - 5 PM)
    const hour = timestamp.getHours();
    return hour < 9 || hour > 17;
  }

  /**
   * Monitor actual privilege changes for anomalies
   */
  monitorPrivilegeChange(
    userId: string,
    oldRole: string,
    newRole: string,
    authorizedBy: string | null = null
  ): PrivilegeChange {
    // Validate the privilege change
    const transitionRisk = this.validateRoleTransition(oldRole, newRole);

    // Check authorization legitimacy
    const authRisk = this.validateAuthorization(authorizedBy, oldRole, newRole);

    // Overall risk assessment
    const totalRisk = transitionRisk * 0.6 + authRisk * 0.4;

    let threatLevel: RiskAssessment['threatLevel'];
    if (totalRisk >= 0.7) {
      threatLevel = 'HIGH';
    } else if (totalRisk >= 0.4) {
      threatLevel = 'MEDIUM';
    } else {
      threatLevel = 'LOW';
    }

    const changeRecord: PrivilegeChange = {
      userId,
      oldRole,
      newRole,
      authorizedBy,
      timestamp: new Date(),
      legitimate: totalRisk < 0.5,
      riskAssessment: {
        transitionRisk,
        authorizationRisk: authRisk,
        totalRisk,
        threatLevel,
      },
    };

    // Update user access pattern
    const pattern = this.accessPatterns.get(userId);
    if (pattern) {
      pattern.privilegeChanges.push(changeRecord);
    }

    // Log privilege change
    this.log('PRIVILEGE_CHANGE', JSON.stringify(changeRecord));

    return changeRecord;
  }

  /**
   * Validate if the authorizer has permission to make this role change
   */
  private validateAuthorization(
    authorizer: string | null,
    _oldRole: string,
    newRole: string
  ): number {
    if (!authorizer) {
      return 1.0; // No authorizer specified - maximum risk
    }

    const roles = this.roleHierarchy.roles;

    // Check if authorizer role exists
    if (!(authorizer in roles)) {
      return 0.9; // Unknown authorizer role
    }

    // Check if authorizer has sufficient privilege level
    const authorizerDef = roles[authorizer];
    const authorizerLevel = authorizerDef?.level ?? 0;
    const newRoleLevel = roles[newRole]?.level ?? 10;

    if (authorizerLevel <= newRoleLevel) {
      return 0.9; // Cannot promote to equal or higher level
    }

    // Additional validation for critical roles
    const criticalRoles = ['system_admin', 'security_architect'];
    if (criticalRoles.includes(newRole) && !criticalRoles.includes(authorizer)) {
      return 0.8; // Only critical roles can promote to critical roles
    }

    return 0.1; // Low risk for legitimate authorization
  }

  /**
   * Process and log detection results
   */
  private processDetectionResult(result: DetectionResult, _message: string): void {
    if (result.threatDetected) {
      this.log('ROLE_HIJACKING_ATTEMPT', JSON.stringify(result));
      console.log(
        `🚨 ROLE HIJACKING DETECTED: ${result.threatLevel} risk for user ${result.userId}`
      );

      // Send to SIEM
      this.sendSiemAlert(result);
    } else {
      this.log('ROLE_MONITORING', JSON.stringify(result));
    }
  }

  /**
   * Send alert to SIEM/EDR systems
   */
  private sendSiemAlert(result: DetectionResult): void {
    const siemAlert = {
      eventType: 'ROLE_HIJACKING_ATTEMPT',
      severity: result.threatLevel,
      userId: result.userId,
      riskScore: result.riskScore,
      recommendedAction: result.recommendedAction,
      evidence: result.evidence,
      timestamp: result.timestamp,
    };

    // Write to security event log for SIEM ingestion
    const eventsPath = path.join(
      process.cwd(),
      'docs/TestingLogs/security/AuditLogs/telemetry/security_events.jsonl'
    );
    const eventsDir = path.dirname(eventsPath);

    if (!fs.existsSync(eventsDir)) {
      fs.mkdirSync(eventsDir, { recursive: true });
    }

    fs.appendFileSync(eventsPath, `${JSON.stringify(siemAlert)  }\n`);
  }

  /**
   * Log to security log file
   */
  private log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    const logLine = `${timestamp} - ROLE_HIJACKING - ${level} - ${message}\n`;

    try {
      fs.appendFileSync(this.logPath, logLine);
    } catch (error) {
      console.error('Failed to write to log:', error);
    }
  }

  /**
   * Get access pattern for a user
   */
  getAccessPattern(userId: string): AccessPattern | undefined {
    return this.accessPatterns.get(userId);
  }

  /**
   * Clear access patterns (for testing)
   */
  clearAccessPatterns(): void {
    this.accessPatterns.clear();
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export { DEFAULT_ROLE_HIERARCHY, HIJACKING_PATTERNS };

// Default export for convenience
export default RoleHijackingMonitor;
