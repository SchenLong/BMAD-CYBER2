import { beforeEach, describe, expect, it } from 'vitest';
import { join, resolve } from 'path';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { ExternalModuleManager } from '../../tools/cli/lib/external-module-manager.js';

const REGISTRY_PATH = resolve(import.meta.dirname, '../../tools/cli/external-official-modules.yaml');

describe('ExternalModuleManager', () => {
  let manager;

  beforeEach(() => {
    manager = new ExternalModuleManager(REGISTRY_PATH);
  });

  // ── Constructor ──────────────────────────────────────────────

  describe('constructor', () => {
    it('should accept a valid registry path', () => {
      expect(manager.registryPath).toBe(REGISTRY_PATH);
      expect(manager.isLoaded()).toBe(false);
    });

    it('should throw if registryPath is missing', () => {
      expect(() => new ExternalModuleManager()).toThrow('registryPath is required');
    });

    it('should throw if registryPath is not a string', () => {
      expect(() => new ExternalModuleManager(123)).toThrow('must be a string');
    });
  });

  // ── loadRegistry ─────────────────────────────────────────────

  describe('loadRegistry()', () => {
    it('should parse the official registry YAML', async () => {
      await manager.loadRegistry();
      expect(manager.isLoaded()).toBe(true);
    });

    it('should throw for a non-existent file', async () => {
      const bad = new ExternalModuleManager('/tmp/does-not-exist.yaml');
      await expect(bad.loadRegistry()).rejects.toThrow('Failed to read registry file');
    });

    it('should throw for invalid YAML', async () => {
      const tmp = await mkdtemp(join(tmpdir(), 'emm-'));
      const badFile = join(tmp, 'bad.yaml');
      await writeFile(badFile, '{{{{not yaml');
      const bad = new ExternalModuleManager(badFile);
      await expect(bad.loadRegistry()).rejects.toThrow('Failed to parse registry YAML');
      await rm(tmp, { recursive: true });
    });

    it('should throw if modules key is missing', async () => {
      const tmp = await mkdtemp(join(tmpdir(), 'emm-'));
      const noModules = join(tmp, 'empty.yaml');
      await writeFile(noModules, 'other_key: true\n');
      const bad = new ExternalModuleManager(noModules);
      await expect(bad.loadRegistry()).rejects.toThrow('must contain a "modules" object');
      await rm(tmp, { recursive: true });
    });
  });

  // ── Query methods (before load) ──────────────────────────────

  describe('query methods before loadRegistry()', () => {
    it('should throw if getAllModules() called before load', () => {
      expect(() => manager.getAllModules()).toThrow('Registry not loaded');
    });

    it('should throw if getModuleByCode() called before load', () => {
      expect(() => manager.getModuleByCode('bmm')).toThrow('Registry not loaded');
    });

    it('should throw if getBuiltInModules() called before load', () => {
      expect(() => manager.getBuiltInModules()).toThrow('Registry not loaded');
    });

    it('should throw if getExternalModules() called before load', () => {
      expect(() => manager.getExternalModules()).toThrow('Registry not loaded');
    });
  });

  // ── getAllModules ────────────────────────────────────────────

  describe('getAllModules()', () => {
    it('should return all 9 modules', async () => {
      await manager.loadRegistry();
      const all = manager.getAllModules();
      expect(all).toHaveLength(9);
    });

    it('should return modules with required properties', async () => {
      await manager.loadRegistry();
      for (const mod of manager.getAllModules()) {
        expect(mod).toHaveProperty('code');
        expect(mod).toHaveProperty('name');
        expect(mod).toHaveProperty('description');
        expect(mod).toHaveProperty('type');
        expect(mod).toHaveProperty('defaultSelected');
        expect(mod).toHaveProperty('required');
      }
    });

    it('should include all expected module codes', async () => {
      await manager.loadRegistry();
      const codes = manager.getAllModules().map(m => m.code);
      expect(codes).toContain('core');
      expect(codes).toContain('bmm');
      expect(codes).toContain('bmb');
      expect(codes).toContain('bmgd');
      expect(codes).toContain('cis');
      expect(codes).toContain('cybersec-team');
      expect(codes).toContain('intel-team');
      expect(codes).toContain('legal-team');
      expect(codes).toContain('strategy-team');
    });
  });

  // ── getModuleByCode ──────────────────────────────────────────

  describe('getModuleByCode()', () => {
    it('should return the BMM module', async () => {
      await manager.loadRegistry();
      const bmm = manager.getModuleByCode('bmm');
      expect(bmm).toBeDefined();
      expect(bmm.code).toBe('bmm');
      expect(bmm.name).toContain('BMAD Method');
      expect(bmm.type).toBe('built-in');
      expect(bmm.defaultSelected).toBe(true);
    });

    it('should return the core module with required flag', async () => {
      await manager.loadRegistry();
      const core = manager.getModuleByCode('core');
      expect(core).toBeDefined();
      expect(core.code).toBe('core');
      expect(core.required).toBe(true);
      expect(core.defaultSelected).toBe(true);
    });

    it('should return undefined for unknown codes', async () => {
      await manager.loadRegistry();
      expect(manager.getModuleByCode('nonexistent')).toBeUndefined();
    });

    it('should return cybersec-team module', async () => {
      await manager.loadRegistry();
      const cs = manager.getModuleByCode('cybersec-team');
      expect(cs).toBeDefined();
      expect(cs.code).toBe('cybersec-team');
      expect(cs.type).toBe('built-in');
    });
  });

  // ── getBuiltInModules ────────────────────────────────────────

  describe('getBuiltInModules()', () => {
    it('should return all 9 modules (all built-in)', async () => {
      await manager.loadRegistry();
      const builtIn = manager.getBuiltInModules();
      expect(builtIn).toHaveLength(9);
      for (const mod of builtIn) {
        expect(mod.type).toBe('built-in');
      }
    });
  });

  // ── getExternalModules ───────────────────────────────────────

  describe('getExternalModules()', () => {
    it('should return empty array (no external modules yet)', async () => {
      await manager.loadRegistry();
      const external = manager.getExternalModules();
      expect(external).toEqual([]);
    });
  });

  // ── getDefaultSelectedModules ────────────────────────────────

  describe('getDefaultSelectedModules()', () => {
    it('should return modules where defaultSelected is true', async () => {
      await manager.loadRegistry();
      const defaults = manager.getDefaultSelectedModules();
      expect(defaults.length).toBeGreaterThan(0);
      for (const mod of defaults) {
        expect(mod.defaultSelected).toBe(true);
      }
    });

    it('should include core and bmm', async () => {
      await manager.loadRegistry();
      const codes = manager.getDefaultSelectedModules().map(m => m.code);
      expect(codes).toContain('core');
      expect(codes).toContain('bmm');
    });
  });

  // ── getRequiredModules ───────────────────────────────────────

  describe('getRequiredModules()', () => {
    it('should return only core as required', async () => {
      await manager.loadRegistry();
      const required = manager.getRequiredModules();
      expect(required).toHaveLength(1);
      expect(required[0].code).toBe('core');
    });
  });

  // ── Module resolution order ──────────────────────────────────

  describe('module resolution order', () => {
    it('built-in modules should resolve before external (all current are built-in)', async () => {
      await manager.loadRegistry();
      const builtIn = manager.getBuiltInModules();
      const external = manager.getExternalModules();
      expect(builtIn.length).toBe(9);
      expect(external.length).toBe(0);
      // Resolution: built-in modules are always available
      for (const mod of builtIn) {
        expect(manager.getModuleByCode(mod.code)).toBeDefined();
      }
    });
  });

  // ── Registry with custom content ─────────────────────────────

  describe('custom registry content', () => {
    it('should handle a registry with an external module', async () => {
      const tmp = await mkdtemp(join(tmpdir(), 'emm-'));
      const customFile = join(tmp, 'custom.yaml');
      await writeFile(customFile, `
modules:
  test-external:
    code: test-external
    name: "Test External Module"
    description: "A hypothetical external module"
    type: external
    defaultSelected: false
  test-builtin:
    code: test-builtin
    name: "Test Built-in Module"
    description: "A test built-in module"
    type: built-in
    defaultSelected: true
`);
      const custom = new ExternalModuleManager(customFile);
      await custom.loadRegistry();

      expect(custom.getAllModules()).toHaveLength(2);
      expect(custom.getBuiltInModules()).toHaveLength(1);
      expect(custom.getExternalModules()).toHaveLength(1);
      expect(custom.getExternalModules()[0].code).toBe('test-external');
      expect(custom.getBuiltInModules()[0].code).toBe('test-builtin');

      await rm(tmp, { recursive: true });
    });
  });
});
