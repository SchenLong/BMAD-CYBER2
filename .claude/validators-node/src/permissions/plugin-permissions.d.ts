/**
 * BMAD Guardrails: Plugin Permission Model
 * =========================================
 * Implements capability-based security for BMAD plugins/modules.
 *
 * Features:
 * - Plugin manifest schema with declared permissions
 * - Runtime permission checking
 * - Capability sets (filesystem, network, shell, sensitive_data)
 * - Integration with RBAC for permission inheritance
 * - Full audit logging
 *
 * OWASP Reference: LLM07 - Insecure Plugin Design
 * Requirements: REQ-1.2.1 through REQ-1.2.6
 *
 * Exit Codes:
 * - 0: Allow the operation
 * - 1: Block the operation (permission denied)
 */
/** Core manifest directory - reserved for future manifest generation */
export declare const MANIFESTS_DIR: string;
/**
 * Capability definition with description and valid operations.
 */
interface CapabilityDefinition {
    description: string;
    operations: string[];
}
/**
 * Filesystem permissions structure.
 */
interface FilesystemPermissions {
    read?: string[] | boolean;
    write?: string[] | boolean;
    delete?: string[] | boolean;
    list?: string[] | boolean;
}
/**
 * Shell permissions structure.
 */
interface ShellPermissions {
    allowed_commands?: string[];
    blocked_commands?: string[];
}
/**
 * Plugin permissions structure.
 */
interface PluginPermissions {
    filesystem?: FilesystemPermissions | boolean;
    network?: boolean | Record<string, unknown>;
    shell?: ShellPermissions | boolean;
    sensitive_data?: boolean;
}
/**
 * Plugin manifest with declared permissions.
 */
interface PluginManifest {
    name: string;
    version: string;
    permissions: PluginPermissions;
    signature?: string | undefined;
    checksum?: string | undefined;
}
/**
 * Result of a permission check.
 */
interface PermissionCheck {
    allowed: boolean;
    reason: string;
    plugin: string;
    capability: string;
    operation: string;
    target: string;
    manifest_found: boolean;
    rbac_override: boolean;
}
/**
 * Plugin info for listing.
 */
interface PluginInfo {
    name: string;
    has_manifest: boolean;
    version: string | null;
}
/**
 * RBAC permission structure.
 */
interface RBACPermissions {
    filesystem?: {
        read?: string[];
        write?: string[];
    };
    network?: boolean;
    shell?: {
        allowed_commands?: string[];
    };
    sensitive_data?: boolean;
}
/**
 * Permission capabilities definition.
 */
declare const CAPABILITIES: Record<string, CapabilityDefinition>;
/**
 * Default permissions for plugins without manifest.
 */
declare const DEFAULT_PERMISSIONS: PluginPermissions;
/**
 * RBAC role to permission mapping.
 */
declare const RBAC_PERMISSIONS: Record<string, RBACPermissions>;
/**
 * Dangerous commands that require explicit allowlisting.
 */
declare const DANGEROUS_COMMANDS: Set<string>;
/**
 * Tool to capability/operation mapping.
 */
declare const CAPABILITY_MAPPING: Record<string, [string, string]>;
/**
 * Checks plugin permissions against declared capabilities.
 *
 * Loads plugin manifests and validates operations against
 * declared permissions. Integrates with RBAC for user-based
 * permission inheritance.
 */
declare class PluginPermissionChecker {
    private manifests;
    private currentRole;
    constructor();
    /**
     * Load all plugin manifests from BMAD directories.
     */
    private loadManifests;
    /**
     * Get permissions for a plugin (from manifest or defaults).
     */
    private getPluginPermissions;
    /**
     * Get RBAC permissions for current role.
     */
    private getRBACPermissions;
    /**
     * Check if path matches any of the patterns.
     */
    private matchPathPattern;
    /**
     * Simple fnmatch-style glob matching.
     */
    private fnmatch;
    /**
     * Check filesystem permission for an operation.
     */
    private checkFilesystemPermission;
    /**
     * Check shell permission for a command.
     */
    private checkShellPermission;
    /**
     * Check network permission.
     */
    private checkNetworkPermission;
    /**
     * Check sensitive data permission.
     */
    private checkSensitiveDataPermission;
    /**
     * Apply RBAC override if applicable.
     *
     * Note: RBAC only grants additional permissions, it does NOT override
     * plugin manifest restrictions. Plugin manifests take precedence for
     * security reasons.
     */
    private applyRBACOverride;
    /**
     * Check if an operation is permitted for a plugin.
     *
     * @param plugin - Plugin name (e.g., 'intel-team')
     * @param capability - Capability type (filesystem, network, shell, sensitive_data)
     * @param operation - Specific operation (read, write, execute, etc.)
     * @param target - Target of operation (path, command, URL, etc.)
     * @returns PermissionCheck with result details
     */
    checkPermission(plugin: string, capability: string, operation: string, target?: string): PermissionCheck;
    /**
     * Get all capabilities for a plugin.
     */
    getPluginCapabilities(plugin: string): PluginPermissions;
    /**
     * List all known plugins with their manifest status.
     */
    listPlugins(): PluginInfo[];
}
/**
 * Generate a manifest template for a plugin.
 *
 * @param pluginName - Name of the plugin
 * @param pluginType - Type of plugin (intel, legal, strategy, dev, general)
 * @returns YAML manifest template as string
 */
export declare function generateManifestTemplate(pluginName: string, pluginType?: string): string;
/**
 * Generate manifests for all BMAD plugins.
 *
 * @param outputDir - Optional directory to write manifests (if null, returns dict)
 * @returns Dictionary of plugin_name -> manifest content
 */
export declare function generateAllManifests(outputDir?: string | null): Record<string, string>;
/**
 * Get or create the global permission checker instance.
 */
export declare function getPermissionChecker(): PluginPermissionChecker;
/**
 * Check if a plugin operation is permitted.
 *
 * @param plugin - Plugin name
 * @param capability - Capability type
 * @param operation - Operation type
 * @param target - Target of operation
 * @returns Tuple of [allowed, message]
 */
export declare function checkPluginPermission(plugin: string, capability: string, operation: string, target?: string): [boolean, string];
/**
 * Detect which plugin a path belongs to.
 *
 * @param filePath - File path
 * @returns Plugin name or null if not in a plugin directory
 */
export declare function detectPluginFromPath(filePath: string): string | null;
/**
 * Validate plugin permission as a pre-tool hook.
 *
 * @returns Exit code: 0 for allowed, 1 for blocked
 */
export declare function validatePluginPermission(): number;
/**
 * CLI entry point with subcommands.
 */
export declare function main(): void;
export { PluginPermissionChecker, CAPABILITIES, DEFAULT_PERMISSIONS, RBAC_PERMISSIONS, DANGEROUS_COMMANDS, CAPABILITY_MAPPING, };
export type { PluginManifest, PermissionCheck, PluginInfo, PluginPermissions, FilesystemPermissions, ShellPermissions, RBACPermissions, CapabilityDefinition, };
