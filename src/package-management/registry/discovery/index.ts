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

// Smart recommendation system
export { default as SmartRecommendationSystem } from './smart-recommendation-system';

// Re-export everything from discovery engine
export * from './package-discovery-engine';

// Re-export from recommendation system using 'export type' to avoid conflicts
// Note: Some types like ConstraintType, Evidence, FilterOperator, InsightType,
// MigrationPath, PackageRecommendation, RiskAssessment, RiskFactor exist in both files
export type {
  RecommendationRequest,
  RecommendationContext as RecommendationContextType,
  RecommendationResult,
  RecommendationAnalysis,
  RecommendationInsight,
  AlternativeRecommendation,
  ProjectType,
  TechnologyStack,
  Environment as RecommendationEnvironment,
  ProjectRequirement,
  SystemConstraint,
  BudgetConstraint,
  TimelineConstraint,
  RecommendationCriteria,
  RecommendationPurpose,
  RecommendationScope,
  FocusArea,
  CriteriaWeights,
  UserPreferences,
  SecurityStance,
  RiskTolerance,
  InnovationAppetite,
  MaintenanceApproach,
  LicensePreference,
  SuitabilityAssessment,
  Tradeoff,
  ImplementationGuidance
} from './smart-recommendation-system';
