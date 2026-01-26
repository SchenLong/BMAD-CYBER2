/**
 * EPIC 2 PACKAGE MANAGEMENT - DEPENDENCY MANAGER EXPORTS
 * Central export point for dependency management components
 *
 * @author Dependency Management Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.2
 */

const {
  BMADDependencyManager,
  OperationContext,
  OperationType,
  OperationState,
  DependencyManagerConfig
} = require('./bmad-dependency-manager');

module.exports = {
  BMADDependencyManager,
  OperationContext,
  OperationType,
  OperationState,
  DependencyManagerConfig,

  // Convenience factory functions
  createManager: (projectRoot, config) => {
    return new BMADDependencyManager(projectRoot, config);
  },

  createOperationContext: (type, target, options) => {
    return new OperationContext(type, target, options);
  },

  // Default configurations
  getDefaultConfig: () => {
    return { ...DependencyManagerConfig };
  },

  // Utility functions
  initializeManager: async (projectRoot, config = {}) => {
    const manager = new BMADDependencyManager(projectRoot, config);
    await manager.initializeSystem();
    return manager;
  }
};