/**
 * BMAD BUILD ORCHESTRATOR INTEGRATION SPECIFICATION
 * Epic 5.1 - Comprehensive Integration with Epic 1-4 Components
 * 
 * This file specifies how the Build Orchestrator integrates with
 * existing BMAD infrastructure to maintain security, performance,
 * and quality standards.
 */

// EPIC 1 SECURITY INTEGRATION
import { Epic1SecurityInfrastructure } from "../security/epic1-integration";
import { AuditLogger } from "../security/audit/audit-logger";
import { SecurityMonitor } from "../security/monitoring/security-monitor";

// EPIC 2-4 COMPONENT INTEGRATIONS  
import { PerformanceOptimizer } from "../performance/performance-optimizer";
import { QualityAssurance } from "../quality/quality-assurance";
import { ComplianceManager } from "../compliance/compliance-manager";

/**
 * Build Orchestrator with Epic 1-4 Integration
 */
export class IntegratedBuildOrchestrator extends BuildOrchestrator {
  private securityInfrastructure: Epic1SecurityInfrastructure;
  private auditLogger: AuditLogger;
  private securityMonitor: SecurityMonitor;
  private performanceOptimizer: PerformanceOptimizer;
  private qualityAssurance: QualityAssurance;
  private complianceManager: ComplianceManager;

  constructor(config: BuildConfig) {
    super(config);
    this.initializeEpicIntegrations();
  }

  /**
   * Initialize integrations with Epic 1-4 components
   */
  private async initializeEpicIntegrations(): Promise<void> {
    // Epic 1 Security Integration
    this.securityInfrastructure = new Epic1SecurityInfrastructure();
    await this.securityInfrastructure.initialize();
    
    this.auditLogger = this.securityInfrastructure.getComponent("auditLogger");
    this.securityMonitor = this.securityInfrastructure.getComponent("securityMonitor");

    // Epic 2-4 Performance, Quality, Compliance Integration
    this.performanceOptimizer = new PerformanceOptimizer();
    this.qualityAssurance = new QualityAssurance();
    this.complianceManager = new ComplianceManager();

    // Register build orchestrator with security monitoring
    this.securityMonitor.registerService("buildOrchestrator", this);

    this.logger.info("Epic 1-4 integrations initialized successfully");
  }

  /**
   * Execute secure build with comprehensive monitoring
   */
  public async secureBuild(targetIds?: string[]): Promise<Map<string, BuildResult>> {
    // Security validation before build
    await this.validateBuildSecurity(targetIds);

    // Audit log build initiation
    await this.auditLogger.logSecurityEvent({
      type: "BUILD_INITIATED",
      severity: "info", 
      message: "Build orchestration started",
      metadata: { targets: targetIds, timestamp: new Date() }
    });

    try {
      // Execute build with security monitoring
      const results = await this.executeSecureBuilds(targetIds);

      // Quality assurance validation
      await this.validateBuildQuality(results);

      // Compliance checking
      await this.validateBuildCompliance(results);

      // Performance optimization
      await this.optimizeBuildPerformance(results);

      // Success audit log
      await this.auditLogger.logSecurityEvent({
        type: "BUILD_COMPLETED",
        severity: "info",
        message: "Build orchestration completed successfully", 
        metadata: { 
          targetCount: results.size,
          successRate: this.calculateSuccessRate(results),
          duration: this.calculateTotalDuration(results)
        }
      });

      return results;

    } catch (error) {
      // Failure audit log
      await this.auditLogger.logSecurityEvent({
        type: "BUILD_FAILED",
        severity: "error",
        message: "Build orchestration failed",
        metadata: { error: error.message, stack: error.stack }
      });

      throw error;
    }
  }

  /**
   * Validate build security before execution
   */
  private async validateBuildSecurity(targetIds?: string[]): Promise<void> {
    for (const targetId of targetIds || []) {
      const target = this.targets.get(targetId);
      if (\!target) continue;

      // Security validation of build scripts
      await this.securityInfrastructure.validateBuildScript(target.buildScript);

      // Source directory security check
      await this.securityInfrastructure.validateSourceDirectory(target.sourceDir);

      // Environment variable security validation
      if (target.env) {
        await this.securityInfrastructure.validateEnvironmentVariables(target.env);
      }
    }

    this.logger.info("Build security validation completed");
  }

  /**
   * Execute builds with comprehensive security monitoring
   */
  private async executeSecureBuilds(targetIds?: string[]): Promise<Map<string, BuildResult>> {
    // Monitor resource usage during builds
    const resourceMonitor = this.securityMonitor.startResourceMonitoring();

    try {
      // Execute builds with security context
      const results = await super.build(targetIds);

      // Validate build outputs for security compliance
      await this.validateBuildOutputSecurity(results);

      return results;

    } finally {
      // Stop resource monitoring
      resourceMonitor.stop();
    }
  }

  /**
   * Validate build output security
   */
  private async validateBuildOutputSecurity(results: Map<string, BuildResult>): Promise<void> {
    for (const [targetId, result] of results) {
      if (\!result.success) continue;

      // Validate output artifacts for security issues
      for (const artifactPath of result.artifacts) {
        await this.securityInfrastructure.validateArtifactSecurity(artifactPath);
      }

      // Scan build output for potential vulnerabilities
      await this.securityInfrastructure.scanBuildOutput(targetId, result);
    }

    this.logger.info("Build output security validation completed");
  }

  /**
   * Validate build quality using QA framework
   */
  private async validateBuildQuality(results: Map<string, BuildResult>): Promise<void> {
    const qualityReport = await this.qualityAssurance.validateBuildResults(results);

    if (\!qualityReport.passed) {
      throw new Error(`Build quality validation failed: ${qualityReport.issues.join(", ")}`);
    }

    await this.auditLogger.logSecurityEvent({
      type: "QUALITY_VALIDATION_PASSED",
      severity: "info",
      message: "Build quality validation successful",
      metadata: qualityReport
    });
  }

  /**
   * Validate build compliance
   */
  private async validateBuildCompliance(results: Map<string, BuildResult>): Promise<void> {
    const complianceReport = await this.complianceManager.validateBuildCompliance(results);

    if (\!complianceReport.compliant) {
      throw new Error(`Build compliance validation failed: ${complianceReport.violations.join(", ")}`);
    }

    await this.auditLogger.logSecurityEvent({
      type: "COMPLIANCE_VALIDATION_PASSED", 
      severity: "info",
      message: "Build compliance validation successful",
      metadata: complianceReport
    });
  }

  /**
   * Optimize build performance using Epic 2-4 optimizers
   */
  private async optimizeBuildPerformance(results: Map<string, BuildResult>): Promise<void> {
    const optimizationReport = await this.performanceOptimizer.optimizeBuildResults(results);

    await this.auditLogger.logSecurityEvent({
      type: "PERFORMANCE_OPTIMIZATION_COMPLETED",
      severity: "info", 
      message: "Build performance optimization completed",
      metadata: optimizationReport
    });
  }

  /**
   * Calculate success rate for reporting
   */
  private calculateSuccessRate(results: Map<string, BuildResult>): number {
    const total = results.size;
    const successful = Array.from(results.values()).filter(r => r.success).length;
    return total > 0 ? (successful / total) * 100 : 0;
  }

  /**
   * Calculate total build duration
   */
  private calculateTotalDuration(results: Map<string, BuildResult>): number {
    return Array.from(results.values()).reduce((total, result) => total + result.duration, 0);
  }

  /**
   * Enhanced health check with Epic 1-4 monitoring
   */
  public async performComprehensiveHealthCheck(): Promise<BuildOrchestrationHealth> {
    const baseStatus = await this.performHealthCheck();
    
    const securityStatus = await this.securityInfrastructure.performHealthCheck();
    const performanceStatus = await this.performanceOptimizer.getHealthStatus();
    const qualityStatus = await this.qualityAssurance.getHealthStatus();
    const complianceStatus = await this.complianceManager.getHealthStatus();

    return {
      buildOrchestrator: baseStatus,
      security: securityStatus,
      performance: performanceStatus,
      quality: qualityStatus,
      compliance: complianceStatus,
      overall: this.calculateOverallHealth([
        baseStatus,
        securityStatus,
        performanceStatus, 
        qualityStatus,
        complianceStatus
      ])
    };
  }

  /**
   * Enhanced shutdown with Epic 1-4 cleanup
   */
  public async comprehensiveShutdown(): Promise<void> {
    this.logger.info("Initiating comprehensive shutdown with Epic 1-4 cleanup");

    await super.shutdown();

    await Promise.all([
      this.securityInfrastructure.shutdown(),
      this.performanceOptimizer.shutdown?.(),
      this.qualityAssurance.shutdown?.(),
      this.complianceManager.shutdown?.()
    ]);

    this.logger.info("Comprehensive shutdown completed");
  }
}

/**
 * Enhanced health status interface
 */
export interface BuildOrchestrationHealth {
  buildOrchestrator: BuildStatus;
  security: any; // From Epic 1 SecurityStatus
  performance: any; // From Epic 2-4 PerformanceStatus
  quality: any; // From Epic 2-4 QualityStatus  
  compliance: any; // From Epic 2-4 ComplianceStatus
  overall: "healthy" | "warning" | "critical" | "offline";
}

/**
 * BMAD Team Build Target Configurations
 */
export const bmadTeamTargets: BuildTarget[] = [
  {
    id: "cybersec-team",
    name: "BMAD Cybersecurity Team Module",
    language: "typescript",
    sourceDir: "./src/cybersec-team", 
    outputDir: "./dist/cybersec-team",
    dependencies: ["security-core"],
    buildScript: "npm run build && npm run test && npm run lint",
    testScript: "npm run test:security",
    priority: 9,
    timeout: 300000,
    retries: 3,
    env: {
      NODE_ENV: "production",
      SECURITY_LEVEL: "maximum"
    },
    metadata: {
      team: "cybersec",
      criticality: "high",
      securityRequirements: ["owasp-a+", "penetration-tested"]
    }
  },
  
  {
    id: "intel-team", 
    name: "BMAD Intelligence Team Module",
    language: "typescript",
    sourceDir: "./src/intel-team",
    outputDir: "./dist/intel-team", 
    dependencies: ["security-core", "data-processing"],
    buildScript: "npm run build && npm run test && npm run lint",
    testScript: "npm run test:intel",
    priority: 8,
    timeout: 300000,
    retries: 3,
    env: {
      NODE_ENV: "production",
      INTEL_LEVEL: "classified"
    },
    metadata: {
      team: "intel",
      criticality: "high", 
      securityRequirements: ["classified", "audit-trail"]
    }
  },

  {
    id: "legal-team",
    name: "BMAD Legal Team Module", 
    language: "typescript",
    sourceDir: "./src/legal-team",
    outputDir: "./dist/legal-team",
    dependencies: ["security-core", "compliance-framework"],
    buildScript: "npm run build && npm run test && npm run lint",
    testScript: "npm run test:legal",
    priority: 7,
    timeout: 300000,
    retries: 3,
    env: {
      NODE_ENV: "production",
      COMPLIANCE_MODE: "strict"
    },
    metadata: {
      team: "legal",
      criticality: "medium",
      securityRequirements: ["gdpr-compliant", "audit-ready"]
    }
  },

  {
    id: "strategy-team",
    name: "BMAD Strategy Team Module",
    language: "typescript", 
    sourceDir: "./src/strategy-team",
    outputDir: "./dist/strategy-team",
    dependencies: ["security-core", "analytics"],
    buildScript: "npm run build && npm run test && npm run lint",
    testScript: "npm run test:strategy",
    priority: 7,
    timeout: 300000,
    retries: 3,
    env: {
      NODE_ENV: "production",
      STRATEGY_MODE: "executive"
    },
    metadata: {
      team: "strategy", 
      criticality: "medium",
      securityRequirements: ["executive-level", "confidential"]
    }
  }
];

/**
 * Production deployment configuration for BMAD teams
 */
export const bmadProductionConfig: BuildConfig = {
  maxParallelBuilds: 4,
  buildTimeout: 600000, // 10 minutes for complex builds
  retryLimit: 3,
  cacheEnabled: true,
  artifactRetention: 90, // 90 days for production
  healthCheckInterval: 30000,
  monitoring: {
    enabled: true,
    metricsInterval: 5000,
    alertThresholds: {
      buildFailureRate: 95, // High bar for production
      avgBuildTime: 300000, // 5 minutes max average
      memoryUsage: 80
    }
  },
  optimization: {
    enabled: true,
    cacheStrategy: "aggressive", // Maximum caching for production
    parallelismStrategy: "adaptive" // Smart resource allocation
  }
};

// Export integrated orchestrator for BMAD use
export { IntegratedBuildOrchestrator as BMADBuildOrchestrator };
