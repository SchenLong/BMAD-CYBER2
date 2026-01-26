/**
 * EPIC 2 PACKAGE MANAGEMENT - DEPENDENCY VALIDATOR EXPORTS
 * Central export point for dependency validation components
 *
 * @author Dependency Management Team
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.2
 */

const {
  BMADDependencyValidator,
  ValidationResult,
  ValidationConfig
} = require('./dependency-validator');

module.exports = {
  BMADDependencyValidator,
  ValidationResult,
  ValidationConfig,

  // Convenience factory functions
  createValidator: (projectRoot, options) => {
    return new BMADDependencyValidator(projectRoot, options);
  },

  createValidationResult: () => {
    return new ValidationResult();
  },

  // Default configurations
  getDefaultConfig: () => {
    return { ...ValidationConfig };
  },

  // Utility functions
  validateProject: async (projectRoot, options = {}) => {
    const validator = new BMADDependencyValidator(projectRoot, options);
    return await validator.validateAll();
  }
};