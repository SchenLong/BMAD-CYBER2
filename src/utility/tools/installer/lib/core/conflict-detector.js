/**
 * Conflict Detector
 * Epic 3, Story 3.1 - Core Installation System
 *
 * Detects naming conflicts, resource overlaps, and other potential issues
 * during module installation.
 *
 * Author: BlackUnicorn.Tech
 * Version: 1.0.0
 */

const path = require('path');
const fs = require('fs').promises;

/**
 * Conflict Detection Engine
 * Identifies and categorizes conflicts across multiple domains
 */
class ConflictDetector {
  constructor(options = {}) {
    this.options = {
      strictMode: options.strictMode !== false,
      caseSensitive: options.caseSensitive || false,
      checkAgentNames: options.checkAgentNames !== false,
      checkWorkflowIds: options.checkWorkflowIds !== false,
      checkFilePaths: options.checkFilePaths !== false,
      checkPartyModePresets: options.checkPartyModePresets !== false,
      ...options
    };

    // Cached registries
    this.globalAgentRegistry = null;
    this.globalWorkflowRegistry = null;
    this.existingFilePaths = null;
    this.partyModePresets = null;
  }

  /**
   * Check for agent name conflicts
   * @param {Map} moduleGraph - Dependency graph with module information
   * @returns {Promise<Array>} Array of agent name conflicts
   */
  async checkAgentConflicts(moduleGraph) {
    const conflicts = [];

    if (!this.options.checkAgentNames) {
      return conflicts;
    }

    try {
      // Load global agent registry
      await this.loadGlobalRegistries();

      // Build map of all agents being installed
      const newAgents = new Map(); // agentName -> moduleInfo
      const duplicateAgents = new Map(); // agentName -> [moduleInfo, ...]

      for (const [moduleName, moduleInfo] of moduleGraph) {
        if (moduleInfo.agents) {
          for (const agent of moduleInfo.agents) {
            const agentName = this.normalizeAgentName(agent.metadata?.name);

            if (newAgents.has(agentName)) {
              // Conflict between modules being installed
              if (!duplicateAgents.has(agentName)) {
                duplicateAgents.set(agentName, [newAgents.get(agentName)]);
              }
              duplicateAgents.get(agentName).push({
                moduleName,
                agent,
                moduleInfo
              });
            } else {
              newAgents.set(agentName, {
                moduleName,
                agent,
                moduleInfo
              });
            }
          }
        }
      }

      // Check for conflicts with existing agents
      for (const [agentName, agentInfo] of newAgents) {
        const existingAgent = this.globalAgentRegistry?.get(agentName);

        if (existingAgent) {
          conflicts.push({
            type: 'AGENT_NAME_CONFLICT',
            severity: 'critical',
            agentName: agentName,
            newModule: agentInfo.moduleName,
            existingModule: existingAgent.module,
            message: `Agent name '${agentName}' already exists in ${existingAgent.module}`,
            resolutionOptions: [
              'rename_agent',
              'uninstall_existing_module',
              'skip_agent_installation'
            ]
          });
        }
      }

      // Check for conflicts between new modules
      for (const [agentName, conflictingAgents] of duplicateAgents) {
        conflicts.push({
          type: 'AGENT_NAME_DUPLICATE',
          severity: 'critical',
          agentName: agentName,
          conflictingModules: conflictingAgents.map(a => a.moduleName),
          message: `Agent name '${agentName}' is defined in multiple modules being installed`,
          resolutionOptions: [
            'rename_one_agent',
            'install_only_one_module',
            'merge_agent_functionality'
          ]
        });
      }

    } catch (error) {
      conflicts.push({
        type: 'AGENT_CONFLICT_CHECK_FAILED',
        severity: 'warning',
        message: `Failed to check agent conflicts: ${error.message}`,
        error: error.message
      });
    }

    return conflicts;
  }

  /**
   * Check for workflow ID conflicts
   * @param {Map} moduleGraph - Dependency graph with module information
   * @returns {Promise<Array>} Array of workflow conflicts
   */
  async checkWorkflowConflicts(moduleGraph) {
    const conflicts = [];

    if (!this.options.checkWorkflowIds) {
      return conflicts;
    }

    try {
      // Load global workflow registry
      await this.loadGlobalRegistries();

      // Build map of all workflows being installed
      const newWorkflows = new Map(); // workflowId -> moduleInfo
      const duplicateWorkflows = new Map(); // workflowId -> [moduleInfo, ...]

      for (const [moduleName, moduleInfo] of moduleGraph) {
        if (moduleInfo.workflows) {
          for (const workflow of moduleInfo.workflows) {
            const workflowId = workflow.workflow_id;

            // Validate workflow ID namespace
            const namespaceValidation = this.validateWorkflowNamespace(workflowId, moduleName);
            if (!namespaceValidation.valid) {
              conflicts.push({
                type: 'WORKFLOW_NAMESPACE_VIOLATION',
                severity: 'critical',
                workflowId: workflowId,
                module: moduleName,
                message: namespaceValidation.message,
                requiredPrefix: `${moduleInfo.code}:`,
                resolutionOptions: ['rename_workflow_with_namespace']
              });
            }

            if (newWorkflows.has(workflowId)) {
              // Conflict between modules being installed
              if (!duplicateWorkflows.has(workflowId)) {
                duplicateWorkflows.set(workflowId, [newWorkflows.get(workflowId)]);
              }
              duplicateWorkflows.get(workflowId).push({
                moduleName,
                workflow,
                moduleInfo
              });
            } else {
              newWorkflows.set(workflowId, {
                moduleName,
                workflow,
                moduleInfo
              });
            }
          }
        }
      }

      // Check for conflicts with existing workflows
      for (const [workflowId, workflowInfo] of newWorkflows) {
        const existingWorkflow = this.globalWorkflowRegistry?.get(workflowId);

        if (existingWorkflow) {
          conflicts.push({
            type: 'WORKFLOW_ID_CONFLICT',
            severity: 'critical',
            workflowId: workflowId,
            newModule: workflowInfo.moduleName,
            existingModule: existingWorkflow.module,
            message: `Workflow ID '${workflowId}' already exists in ${existingWorkflow.module}`,
            resolutionOptions: [
              'rename_workflow',
              'uninstall_existing_module',
              'skip_workflow_installation'
            ]
          });
        }
      }

      // Check for conflicts between new modules
      for (const [workflowId, conflictingWorkflows] of duplicateWorkflows) {
        conflicts.push({
          type: 'WORKFLOW_ID_DUPLICATE',
          severity: 'critical',
          workflowId: workflowId,
          conflictingModules: conflictingWorkflows.map(w => w.moduleName),
          message: `Workflow ID '${workflowId}' is defined in multiple modules being installed`,
          resolutionOptions: [
            'rename_one_workflow',
            'install_only_one_module',
            'merge_workflow_functionality'
          ]
        });
      }

    } catch (error) {
      conflicts.push({
        type: 'WORKFLOW_CONFLICT_CHECK_FAILED',
        severity: 'warning',
        message: `Failed to check workflow conflicts: ${error.message}`,
        error: error.message
      });
    }

    return conflicts;
  }

  /**
   * Check for file path conflicts
   * @param {Map} moduleGraph - Dependency graph with module information
   * @returns {Promise<Array>} Array of path conflicts
   */
  async checkPathConflicts(moduleGraph) {
    const conflicts = [];

    if (!this.options.checkFilePaths) {
      return conflicts;
    }

    try {
      // Load existing file paths
      await this.loadFilePaths();

      // Build map of all paths being created
      const newPaths = new Map(); // normalizedPath -> moduleInfo
      const duplicatePaths = new Map(); // normalizedPath -> [moduleInfo, ...]

      for (const [moduleName, moduleInfo] of moduleGraph) {
        const modulePaths = await this.extractModulePaths(moduleInfo);

        for (const pathInfo of modulePaths) {
          const normalizedPath = this.normalizePath(pathInfo.path);

          if (newPaths.has(normalizedPath)) {
            // Conflict between modules being installed
            if (!duplicatePaths.has(normalizedPath)) {
              duplicatePaths.set(normalizedPath, [newPaths.get(normalizedPath)]);
            }
            duplicatePaths.get(normalizedPath).push({
              moduleName,
              pathInfo,
              moduleInfo
            });
          } else {
            newPaths.set(normalizedPath, {
              moduleName,
              pathInfo,
              moduleInfo
            });
          }
        }
      }

      // Check for conflicts with existing paths
      for (const [normalizedPath, pathInfo] of newPaths) {
        const existingPath = this.existingFilePaths?.find(p =>
          this.normalizePath(p.path) === normalizedPath
        );

        if (existingPath) {
          const conflictType = this.determinePathConflictType(
            pathInfo.pathInfo.path,
            existingPath.path
          );

          conflicts.push({
            type: 'FILE_PATH_CONFLICT',
            severity: this.getPathConflictSeverity(conflictType),
            conflictType: conflictType,
            newPath: pathInfo.pathInfo.path,
            existingPath: existingPath.path,
            newModule: pathInfo.moduleName,
            existingModule: existingPath.module,
            message: `Path conflict: ${pathInfo.pathInfo.path} conflicts with existing ${existingPath.path}`,
            resolutionOptions: this.getPathResolutionOptions(conflictType)
          });
        }
      }

      // Check for conflicts between new modules
      for (const [normalizedPath, conflictingPaths] of duplicatePaths) {
        conflicts.push({
          type: 'PATH_DUPLICATE',
          severity: 'critical',
          path: conflictingPaths[0].pathInfo.path,
          conflictingModules: conflictingPaths.map(p => p.moduleName),
          message: `Path '${conflictingPaths[0].pathInfo.path}' is used by multiple modules being installed`,
          resolutionOptions: [
            'use_module_specific_paths',
            'install_only_one_module',
            'merge_path_usage'
          ]
        });
      }

    } catch (error) {
      conflicts.push({
        type: 'PATH_CONFLICT_CHECK_FAILED',
        severity: 'warning',
        message: `Failed to check path conflicts: ${error.message}`,
        error: error.message
      });
    }

    return conflicts;
  }

  /**
   * Check party mode preset conflicts
   * @param {Map} moduleGraph - Dependency graph with module information
   * @returns {Promise<Array>} Array of preset conflicts
   */
  async checkPartyModeConflicts(moduleGraph) {
    const conflicts = [];

    if (!this.options.checkPartyModePresets) {
      return conflicts;
    }

    try {
      // Load party mode presets
      await this.loadPartyModePresets();

      if (!this.partyModePresets) {
        return conflicts;
      }

      // Get all agents that will be available after installation
      const availableAgents = new Set();

      // Add existing agents
      if (this.globalAgentRegistry) {
        for (const agentName of this.globalAgentRegistry.keys()) {
          availableAgents.add(agentName);
        }
      }

      // Add new agents
      for (const [moduleName, moduleInfo] of moduleGraph) {
        if (moduleInfo.agents) {
          for (const agent of moduleInfo.agents) {
            const agentName = this.normalizeAgentName(agent.metadata?.name);
            availableAgents.add(agentName);
          }
        }
      }

      // Check each preset
      for (const preset of this.partyModePresets) {
        const requiredAgents = this.extractRequiredAgents(preset);
        const missingAgents = [];

        for (const requiredAgent of requiredAgents) {
          if (!availableAgents.has(this.normalizeAgentName(requiredAgent))) {
            missingAgents.push(requiredAgent);
          }
        }

        if (missingAgents.length > 0) {
          // Determine if this affects any modules being installed
          const affectedModules = [];
          for (const [moduleName, moduleInfo] of moduleGraph) {
            if (this.moduleAffectsPreset(moduleInfo, preset)) {
              affectedModules.push(moduleName);
            }
          }

          if (affectedModules.length > 0) {
            conflicts.push({
              type: 'PARTY_MODE_PRESET_CONFLICT',
              severity: 'warning',
              presetName: preset.name,
              missingAgents: missingAgents,
              affectedModules: affectedModules,
              message: `Party mode preset '${preset.name}' will be incomplete due to missing agents: ${missingAgents.join(', ')}`,
              impact: 'Reduced cross-module functionality',
              resolutionOptions: [
                'install_missing_modules',
                'disable_affected_presets',
                'create_alternative_presets'
              ]
            });
          }
        }
      }

    } catch (error) {
      conflicts.push({
        type: 'PARTY_MODE_CHECK_FAILED',
        severity: 'warning',
        message: `Failed to check party mode conflicts: ${error.message}`,
        error: error.message
      });
    }

    return conflicts;
  }

  /**
   * Normalize agent name for comparison
   */
  normalizeAgentName(name) {
    if (!name) return '';
    return this.options.caseSensitive ? name : name.toLowerCase();
  }

  /**
   * Validate workflow namespace
   */
  validateWorkflowNamespace(workflowId, moduleName) {
    if (!workflowId || !moduleName) {
      return {
        valid: false,
        message: 'Missing workflow ID or module name'
      };
    }

    // Check if workflow ID follows namespace convention
    const expectedPrefix = `${moduleName}:`;
    if (!workflowId.startsWith(expectedPrefix)) {
      return {
        valid: false,
        message: `Workflow ID '${workflowId}' must start with '${expectedPrefix}'`
      };
    }

    // Check for valid characters after namespace
    const workflowName = workflowId.substring(expectedPrefix.length);
    if (!/^[a-z0-9-_]+$/.test(workflowName)) {
      return {
        valid: false,
        message: `Workflow name part '${workflowName}' contains invalid characters. Use only lowercase letters, numbers, hyphens, and underscores.`
      };
    }

    return { valid: true };
  }

  /**
   * Normalize file path for comparison
   */
  normalizePath(filePath) {
    if (!filePath) return '';

    let normalized = path.normalize(filePath);

    if (!this.options.caseSensitive) {
      normalized = normalized.toLowerCase();
    }

    return normalized.replace(/\\/g, '/'); // Normalize path separators
  }

  /**
   * Determine path conflict type
   */
  determinePathConflictType(newPath, existingPath) {
    const newNormalized = this.normalizePath(newPath);
    const existingNormalized = this.normalizePath(existingPath);

    if (newNormalized === existingNormalized) {
      return 'exact_match';
    }

    if (newNormalized.startsWith(`${existingNormalized  }/`)) {
      return 'parent_child';
    }

    if (existingNormalized.startsWith(`${newNormalized  }/`)) {
      return 'child_parent';
    }

    const newDir = path.dirname(newNormalized);
    const existingDir = path.dirname(existingNormalized);

    if (newDir === existingDir) {
      return 'same_directory';
    }

    return 'no_conflict';
  }

  /**
   * Get path conflict severity
   */
  getPathConflictSeverity(conflictType) {
    switch (conflictType) {
      case 'exact_match':
        return 'critical';
      case 'parent_child':
      case 'child_parent':
        return 'error';
      case 'same_directory':
        return 'warning';
      default:
        return 'info';
    }
  }

  /**
   * Get path resolution options
   */
  getPathResolutionOptions(conflictType) {
    switch (conflictType) {
      case 'exact_match':
        return [
          'use_different_filename',
          'backup_existing_file',
          'skip_file_creation'
        ];
      case 'parent_child':
      case 'child_parent':
        return [
          'use_different_directory',
          'restructure_file_hierarchy',
          'merge_directory_contents'
        ];
      case 'same_directory':
        return [
          'use_module_prefix',
          'create_subdirectory',
          'accept_shared_directory'
        ];
      default:
        return ['no_action_needed'];
    }
  }

  // Data loading methods (to be implemented with actual data sources)
  async loadGlobalRegistries() {
    if (!this.globalAgentRegistry) {
      this.globalAgentRegistry = await this.loadGlobalAgentRegistry();
    }
    if (!this.globalWorkflowRegistry) {
      this.globalWorkflowRegistry = await this.loadGlobalWorkflowRegistry();
    }
  }

  async loadFilePaths() {
    if (!this.existingFilePaths) {
      this.existingFilePaths = await this.loadExistingFilePaths();
    }
  }

  async loadPartyModePresets() {
    if (!this.partyModePresets) {
      this.partyModePresets = await this.loadPartyModePresetData();
    }
  }

  // Placeholder methods for external data loading
  async loadGlobalAgentRegistry() {
    // TODO: Load from actual agent registry
    return new Map();
  }

  async loadGlobalWorkflowRegistry() {
    // TODO: Load from actual workflow registry
    return new Map();
  }

  async loadExistingFilePaths() {
    // TODO: Load from filesystem or registry
    return [];
  }

  async loadPartyModePresetData() {
    // TODO: Load party mode preset configurations
    return [];
  }

  async extractModulePaths(moduleInfo) {
    // TODO: Extract all file paths that will be created by module
    return [
      { path: moduleInfo.output_folder || '_bmad-output', type: 'output_directory' },
      { path: moduleInfo.config_path || '_bmad/config', type: 'config_directory' }
    ];
  }

  extractRequiredAgents(preset) {
    // TODO: Extract agent names required by party mode preset
    return preset.required_agents || [];
  }

  moduleAffectsPreset(moduleInfo, preset) {
    // TODO: Determine if module affects a specific preset
    return false;
  }
}

module.exports = ConflictDetector;