/**
 * EPIC 2 PACKAGE MANAGEMENT - DISCOVERY SYSTEMS INDEX
 * Central export point for all package discovery and recommendation systems
 * Provides intelligent package discovery, ML-powered recommendations, and advanced analytics
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.1
 */

// Core discovery engine
export { default as PackageDiscoveryEngine } from './package-discovery-engine';
export * from './package-discovery-engine';

// Smart recommendation system
export { default as SmartRecommendationSystem } from './smart-recommendation-system';
export * from './smart-recommendation-system';

// Re-export commonly used types for convenience
export type {
  // Discovery interfaces
  DiscoveryQuery,
  DiscoveryContext,
  DiscoveryResult,
  EnrichedPackageInfo,
  DiscoveryInsight,
  PackageRecommendation,
  AlternativePackage,
  SearchMetrics,
  SecurityAnalysis,

  // Discovery configuration
  DiscoveryConfiguration,
  AlgorithmConfiguration,
  EnrichmentConfiguration,
  SecurityConfiguration,
  MLConfiguration,

  // Recommendation interfaces
  RecommendationRequest,
  RecommendationContext,
  RecommendationResult,
  RecommendationAnalysis,
  RecommendationInsight,
  PackageRecommendation as SmartPackageRecommendation,
  AlternativeRecommendation,
  MigrationPath,
  RiskAssessment,
  CostAnalysis,
  TimelineEstimate,

  // Search and filtering
  SearchIntent,
  DiscoveryFilter,
  DiscoveryPreferences,
  DiscoveryConstraint,
  FilterOperator,
  SortCriteria,

  // Scoring and ranking
  ScoringReason,
  PackageWarning,
  PackageEnrichment,
  TrendInfo,
  EcosystemInfo,
  CommunityInfo,

  // Project and context types
  ProjectType,
  TechnologyStack,
  Environment,
  ProjectRequirement,
  SystemConstraint,
  BudgetConstraint,
  TimelineConstraint,

  // Recommendation criteria
  RecommendationCriteria,
  RecommendationPurpose,
  RecommendationScope,
  FocusArea,
  CriteriaWeights,

  // User preferences
  UserPreferences,
  SecurityStance,
  RiskTolerance,
  InnovationAppetite,
  MaintenanceApproach,
  LicensePreference,

  // Analysis types
  SuitabilityAssessment,
  Tradeoff,
  ImplementationGuidance,
  Evidence,
  RecommendationRationale
} from './package-discovery-engine';

export type {
  // Additional recommendation types
  RecommendationScore,
  ScoreBreakdown,
  ScoringFactor,
  SuitabilityLevel,
  ImplementationApproach,
  MigrationComplexity,
  RiskLevel,
  CostEstimate,
  TimeEstimate,

  // Analysis and insights
  AnalysisPattern,
  AnalysisTrend,
  AnalysisComparison,
  AnalysisScenario,
  InsightType,
  WarningCategory,

  // Migration and implementation
  MigrationStrategy,
  MigrationPhase,
  MigrationRisk,
  ImplementationStep,
  RequiredResource,
  ResourceType,

  // Cost and timeline analysis
  CostSummary,
  CostBreakdown,
  CostComparison,
  BenefitEstimate,
  TimelineSummary,
  TimelinePhase,
  TimelineDependency
} from './smart-recommendation-system';

// Discovery utilities and helpers
export const DiscoveryUtils = {
  /**
   * Create a basic discovery query
   */
  createQuery: (intent: SearchIntent, context: Partial<DiscoveryContext>): DiscoveryQuery => {
    return {
      intent,
      context: {
        sessionId: crypto.randomUUID(),
        projectType: 'web_application',
        technology: {
          language: [],
          runtime: [],
          framework: [],
          database: [],
          cloud: [],
          tooling: [],
          standards: []
        },
        environment: {
          target: 'production',
          platform: 'web',
          deployment: 'cloud',
          scale: 'medium',
          compliance: []
        },
        existingDependencies: [],
        requirements: [],
        constraints: [],
        ...context
      },
      filters: [],
      preferences: {
        securityLevel: 'moderate',
        popularityWeight: 0.2,
        qualityWeight: 0.3,
        securityWeight: 0.3,
        freshnessWeight: 0.1,
        compatibilityWeight: 0.1,
        includePrerelease: false,
        maxResults: 20,
        sortBy: [{ field: 'score', direction: 'desc', weight: 1.0 }]
      },
      constraints: []
    };
  },

  /**
   * Create a recommendation request
   */
  createRecommendationRequest: (
    context: Partial<RecommendationContext>,
    criteria?: Partial<RecommendationCriteria>
  ): RecommendationRequest => {
    return {
      context: {
        projectType: 'web_application',
        technology: {
          language: [],
          runtime: [],
          framework: [],
          database: [],
          cloud: [],
          tooling: [],
          standards: []
        },
        environment: {
          target: 'production',
          platform: 'web',
          deployment: 'cloud',
          scale: 'medium',
          compliance: []
        },
        existingDependencies: [],
        requirements: [],
        constraints: [],
        ...context
      },
      criteria: {
        purpose: 'new_project',
        scope: 'full_stack',
        focus: ['security', 'performance', 'reliability'],
        weights: {
          security: 0.25,
          performance: 0.2,
          reliability: 0.15,
          maintainability: 0.15,
          cost: 0.1,
          popularity: 0.05,
          innovation: 0.05,
          stability: 0.05,
          ecosystem: 0.0,
          documentation: 0.0,
          community: 0.0,
          vendorSupport: 0.0
        },
        filters: [],
        ...criteria
      },
      constraints: [],
      preferences: {
        securityStance: 'strict',
        riskTolerance: 'low',
        innovationAppetite: 'mainstream',
        maintenanceApproach: 'proactive',
        vendorPreference: 'no_preference',
        licensePreference: [
          { license: 'MIT', preference: 'preferred' },
          { license: 'Apache-2.0', preference: 'acceptable' },
          { license: 'GPL-3.0', preference: 'avoid' }
        ],
        communicationStyle: 'detailed',
        automationLevel: 'semi_automated'
      },
      options: {
        maxRecommendations: 10,
        includeAlternatives: true,
        includeMigrationPaths: true,
        includeRiskAnalysis: true,
        includeCostAnalysis: true,
        includeTimelineEstimate: true,
        detailLevel: 'detailed',
        outputFormat: 'structured'
      }
    };
  },

  /**
   * Validate discovery query
   */
  validateQuery: (query: DiscoveryQuery): boolean => {
    return !!(
      query.intent &&
      query.context &&
      query.context.sessionId &&
      query.preferences &&
      query.preferences.maxResults > 0
    );
  },

  /**
   * Calculate similarity between packages
   */
  calculateSimilarity: (pkg1: PackageMetadata, pkg2: PackageMetadata): number => {
    let similarity = 0;
    let factors = 0;

    // Name similarity (using Levenshtein distance)
    const nameDistance = levenshteinDistance(pkg1.name, pkg2.name);
    const maxNameLength = Math.max(pkg1.name.length, pkg2.name.length);
    const nameSimilarity = 1 - (nameDistance / maxNameLength);
    similarity += nameSimilarity * 0.2;
    factors += 0.2;

    // Description similarity (simplified)
    if (pkg1.description && pkg2.description) {
      const descWords1 = new Set(pkg1.description.toLowerCase().split(/\W+/));
      const descWords2 = new Set(pkg2.description.toLowerCase().split(/\W+/));
      const intersection = new Set([...descWords1].filter(x => descWords2.has(x)));
      const union = new Set([...descWords1, ...descWords2]);
      const descSimilarity = intersection.size / union.size;
      similarity += descSimilarity * 0.3;
      factors += 0.3;
    }

    // Keywords similarity
    const keywords1 = new Set(pkg1.keywords);
    const keywords2 = new Set(pkg2.keywords);
    const keywordIntersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    const keywordUnion = new Set([...keywords1, ...keywords2]);
    if (keywordUnion.size > 0) {
      const keywordSimilarity = keywordIntersection.size / keywordUnion.size;
      similarity += keywordSimilarity * 0.3;
      factors += 0.3;
    }

    // Author similarity
    if (pkg1.author === pkg2.author) {
      similarity += 0.2;
    }
    factors += 0.2;

    return factors > 0 ? similarity / factors : 0;
  },

  /**
   * Format discovery results for display
   */
  formatResults: (result: DiscoveryResult): FormattedDiscoveryResult => {
    return {
      summary: {
        totalPackages: result.packages.length,
        searchTime: `${result.searchMetrics.searchTime.toFixed(2)}ms`,
        confidence: `${(result.searchMetrics.confidence * 100).toFixed(1)}%`,
        securityLevel: result.securityAnalysis.overallRisk
      },
      topRecommendations: result.packages.slice(0, 5).map(pkg => ({
        name: pkg.name,
        version: pkg.version,
        score: pkg.score.toFixed(3),
        description: pkg.description,
        securityScore: pkg.securityScore.toFixed(3),
        popularityScore: pkg.popularityScore.toFixed(3),
        warnings: pkg.warnings.filter(w => w.severity === 'high' || w.severity === 'critical')
      })),
      insights: result.insights.map(insight => ({
        type: insight.type,
        title: insight.title,
        description: insight.description,
        impact: insight.impact,
        actionable: insight.actionable
      })),
      warnings: result.packages.reduce((allWarnings, pkg) => {
        return allWarnings.concat(pkg.warnings.filter(w => w.severity === 'high' || w.severity === 'critical'));
      }, [] as PackageWarning[])
    };
  }
};

// Helper functions
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

// Formatted result types
interface FormattedDiscoveryResult {
  summary: {
    totalPackages: number;
    searchTime: string;
    confidence: string;
    securityLevel: string;
  };
  topRecommendations: Array<{
    name: string;
    version: string;
    score: string;
    description: string;
    securityScore: string;
    popularityScore: string;
    warnings: PackageWarning[];
  }>;
  insights: Array<{
    type: string;
    title: string;
    description: string;
    impact: string;
    actionable: boolean;
  }>;
  warnings: PackageWarning[];
}

// Discovery factory for creating configured instances
export class DiscoveryFactory {
  /**
   * Create a discovery engine with default configuration
   */
  static createDiscoveryEngine(
    packageIndex: IPackageIndex,
    securityScanner: ISecurityScanner,
    cacheManager: ICacheManager,
    config?: Partial<DiscoveryConfiguration>
  ): PackageDiscoveryEngine {
    return new PackageDiscoveryEngine(
      config || {},
      packageIndex,
      securityScanner,
      cacheManager
    );
  }

  /**
   * Create a recommendation system
   */
  static createRecommendationSystem(): SmartRecommendationSystem {
    return new SmartRecommendationSystem();
  }

  /**
   * Create a complete discovery suite
   */
  static async createDiscoverySuite(
    packageIndex: IPackageIndex,
    securityScanner: ISecurityScanner,
    cacheManager: ICacheManager,
    discoveryConfig?: Partial<DiscoveryConfiguration>
  ): Promise<DiscoverySuite> {
    const discoveryEngine = this.createDiscoveryEngine(
      packageIndex,
      securityScanner,
      cacheManager,
      discoveryConfig
    );
    const recommendationSystem = this.createRecommendationSystem();

    await discoveryEngine.initialize();
    await recommendationSystem.initialize();

    return new DiscoverySuite(discoveryEngine, recommendationSystem);
  }
}

/**
 * Complete discovery suite combining all discovery capabilities
 */
export class DiscoverySuite extends EventEmitter {
  private discoveryEngine: PackageDiscoveryEngine;
  private recommendationSystem: SmartRecommendationSystem;

  constructor(
    discoveryEngine: PackageDiscoveryEngine,
    recommendationSystem: SmartRecommendationSystem
  ) {
    super();
    this.discoveryEngine = discoveryEngine;
    this.recommendationSystem = recommendationSystem;

    // Forward events
    this.discoveryEngine.on('discovery.completed', (event) => this.emit('discovery.completed', event));
    this.recommendationSystem.on('recommendations.generated', (event) => this.emit('recommendations.generated', event));
  }

  /**
   * Discover packages with basic query
   */
  async discover(query: DiscoveryQuery): Promise<DiscoveryResult> {
    return await this.discoveryEngine.discover(query);
  }

  /**
   * Find similar packages
   */
  async findSimilar(packageId: string, maxResults?: number): Promise<EnrichedPackageInfo[]> {
    return await this.discoveryEngine.findSimilar(packageId, maxResults);
  }

  /**
   * Find alternative packages
   */
  async findAlternatives(packageId: string, reason?: string): Promise<AlternativePackage[]> {
    return await this.discoveryEngine.findAlternatives(packageId, reason);
  }

  /**
   * Generate smart recommendations
   */
  async recommend(request: RecommendationRequest): Promise<RecommendationResult> {
    return await this.recommendationSystem.recommend(request);
  }

  /**
   * Get discovery metrics
   */
  getDiscoveryMetrics() {
    return this.discoveryEngine.getMetrics();
  }

  /**
   * Shutdown the discovery suite
   */
  async shutdown(): Promise<void> {
    await this.discoveryEngine.shutdown();
    await this.recommendationSystem.shutdown();
    this.emit('shutdown');
  }
}

// Import required types for exports
import { PackageMetadata, IPackageIndex, ISecurityScanner, ICacheManager } from '../interfaces';
import {
  DiscoveryQuery,
  DiscoveryContext,
  DiscoveryResult,
  EnrichedPackageInfo,
  DiscoveryConfiguration,
  SearchIntent,
  PackageWarning,
  AlternativePackage,
  RecommendationRequest,
  RecommendationContext,
  RecommendationResult,
  RecommendationCriteria
} from './package-discovery-engine';

// Export version information
export const DISCOVERY_VERSION = '1.0.0';
export const DISCOVERY_EPIC = 'Epic 2 - Package Management System';
export const DISCOVERY_STORY = 'Story 2.1 - Core Package Registry Export';

// Export default discovery suite factory
export default DiscoveryFactory;