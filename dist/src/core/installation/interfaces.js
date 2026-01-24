/**
 * BMAD Installation Interfaces
 * ============================
 *
 * Interface definitions for dependency injection and clean architecture.
 * These interfaces define contracts for all installation system components.
 */
// Service tokens for dependency injection
export const ServiceTokens = {
    TEMPLATE_ENGINE: 'ITemplateEngine',
    CONFIGURATION_MANAGER: 'IConfigurationManager',
    CONFIGURATION_VALIDATOR: 'IConfigurationValidator',
    DEPENDENCY_MANAGER: 'IDependencyManager',
    POST_INSTALL_VERIFIER: 'IPostInstallVerifier',
    FILE_SYSTEM: 'IFileSystem',
    LOGGER: 'ILogger',
    CACHE: 'ICache',
    MODULE_REGISTRY: 'IModuleRegistry',
    BACKUP_MANAGER: 'IBackupManager',
    SECURITY_VALIDATOR: 'ISecurityValidator'
};
//# sourceMappingURL=interfaces.js.map