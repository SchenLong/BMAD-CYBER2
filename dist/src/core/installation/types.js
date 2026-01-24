/**
 * BMAD Installation Types
 * =======================
 *
 * TypeScript type definitions for the installation system.
 * Provides strong typing for all installation-related operations.
 */
// Type guards
export function isValidationStep(step) {
    return step.type === 'validation';
}
export function isDependencyResolutionStep(step) {
    return step.type === 'dependency_resolution';
}
export function isTemplateProcessingStep(step) {
    return step.type === 'template_processing';
}
export function isFileGenerationStep(step) {
    return step.type === 'file_generation';
}
export function isSuccessfulResult(result) {
    return result.success === true;
}
export function isFailedResult(result) {
    return result.success === false;
}
// Configuration validation helpers
export function validateOrchestratorConfig(config) {
    const errors = [];
    const warnings = [];
    if (config.maxConcurrentInstallations && config.maxConcurrentInstallations < 1) {
        errors.push('maxConcurrentInstallations must be at least 1');
    }
    if (config.timeoutMs && config.timeoutMs < 1000) {
        warnings.push('timeoutMs less than 1 second may cause premature timeouts');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
//# sourceMappingURL=types.js.map