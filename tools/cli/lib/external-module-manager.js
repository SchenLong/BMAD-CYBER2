import { readFile } from 'fs/promises';
import { parse } from 'yaml';

/**
 * Read-only module registry manager.
 * Loads and queries the external-official-modules.yaml registry.
 * Resolution order: built-in → external (future).
 *
 * @example
 * const manager = new ExternalModuleManager('/path/to/external-official-modules.yaml');
 * await manager.loadRegistry();
 * const allModules = manager.getAllModules();
 */
export class ExternalModuleManager {
  /**
   * @param {string} registryPath - Absolute path to external-official-modules.yaml
   */
  constructor(registryPath) {
    if (!registryPath || typeof registryPath !== 'string') {
      throw new Error('registryPath is required and must be a string');
    }
    this.registryPath = registryPath;
    this.modules = null;
  }

  /**
   * Load and parse the registry YAML file.
   * Must be called before any query methods.
   * @returns {Promise<void>}
   * @throws {Error} If the file cannot be read or parsed
   */
  async loadRegistry() {
    let content;
    try {
      content = await readFile(this.registryPath, 'utf-8');
    } catch (err) {
      throw new Error(`Failed to read registry file: ${this.registryPath} — ${err.message}`);
    }

    let parsed;
    try {
      parsed = parse(content);
    } catch (err) {
      throw new Error(`Failed to parse registry YAML: ${err.message}`);
    }

    if (!parsed || !parsed.modules || typeof parsed.modules !== 'object') {
      throw new Error('Registry file must contain a "modules" object');
    }

    this.modules = new Map();
    for (const [key, entry] of Object.entries(parsed.modules)) {
      this.modules.set(key, {
        code: entry.code,
        name: entry.name,
        description: entry.description || '',
        type: entry.type || 'built-in',
        defaultSelected: entry.defaultSelected ?? false,
        required: entry.required ?? false,
      });
    }
  }

  /**
   * Get a single module by its code.
   * @param {string} code - Module code (e.g. 'bmm', 'cybersec-team')
   * @returns {object|undefined} Module entry or undefined if not found
   */
  getModuleByCode(code) {
    this._ensureLoaded();
    return this.modules.get(code);
  }

  /**
   * Get all registered modules.
   * @returns {object[]} Array of module entries
   */
  getAllModules() {
    this._ensureLoaded();
    return Array.from(this.modules.values());
  }

  /**
   * Get only built-in modules.
   * @returns {object[]} Array of built-in module entries
   */
  getBuiltInModules() {
    this._ensureLoaded();
    return this.getAllModules().filter(m => m.type === 'built-in');
  }

  /**
   * Get only external modules (future — currently returns empty).
   * @returns {object[]} Array of external module entries
   */
  getExternalModules() {
    this._ensureLoaded();
    return this.getAllModules().filter(m => m.type === 'external');
  }

  /**
   * Get modules selected by default during installation.
   * @returns {object[]} Array of default-selected module entries
   */
  getDefaultSelectedModules() {
    this._ensureLoaded();
    return this.getAllModules().filter(m => m.defaultSelected);
  }

  /**
   * Get required modules (always installed).
   * @returns {object[]} Array of required module entries
   */
  getRequiredModules() {
    this._ensureLoaded();
    return this.getAllModules().filter(m => m.required);
  }

  /**
   * Check whether the registry has been loaded.
   * @returns {boolean}
   */
  isLoaded() {
    return this.modules !== null;
  }

  /**
   * @private
   */
  _ensureLoaded() {
    if (!this.modules) {
      throw new Error('Registry not loaded. Call loadRegistry() first.');
    }
  }
}
