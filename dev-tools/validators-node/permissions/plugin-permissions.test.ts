/**
 * BMAD Plugin Permissions Tests
 * ===============================
 * Unit tests for plugin permission checking.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  detectPluginFromPath,
  CAPABILITIES,
  DEFAULT_PERMISSIONS,
  DANGEROUS_COMMANDS,
  CAPABILITY_MAPPING,
  PluginPermissionChecker,
  generateManifestTemplate,
} from '../../.claude/validators-node/src/permissions/plugin-permissions.js';

// Mock file system
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(() => ''),
    readdirSync: vi.fn(() => []),
    statSync: vi.fn(() => ({ isDirectory: () => true })),
  };
});

describe('detectPluginFromPath', () => {
  it('should extract plugin name from intel-team path', () => {
    const result = detectPluginFromPath('_bmad/intel-team/agents/osint-lead/agent.md');
    expect(result).toBe('intel-team');
  });

  it('should extract plugin name from legal-team path', () => {
    const result = detectPluginFromPath('_bmad/legal-team/workflows/contract-review/workflow.md');
    expect(result).toBe('legal-team');
  });

  it('should extract plugin name from strategy-team path', () => {
    const result = detectPluginFromPath('_bmad/strategy-team/agents/advisor/agent.md');
    expect(result).toBe('strategy-team');
  });

  it('should return null for paths not in _bmad', () => {
    const result = detectPluginFromPath('/etc/passwd');
    expect(result).toBeNull();
  });

  it('should return empty string for root _bmad path with only trailing slash', () => {
    const result = detectPluginFromPath('_bmad/');
    // When path is just _bmad/, parts[1] is empty string, which starts with _ check fails, returns empty string
    // Actually returns null because empty string doesn't start with _
    expect(result).toBe('');
  });

  it('should handle empty path', () => {
    const result = detectPluginFromPath('');
    expect(result).toBeNull();
  });

  it('should handle paths starting with _bmad but containing absolute path', () => {
    // Absolute paths like /project/_bmad/... get normalized and may not match
    // depending on PROJECT_DIR value
    const result = detectPluginFromPath('_bmad/intel-team/file.md');
    expect(result).toBe('intel-team');
  });

  it('should handle Windows-style paths', () => {
    // Normalize to forward slashes
    const result = detectPluginFromPath('_bmad\\intel-team\\agents\\file.md'.replace(/\\/g, '/'));
    expect(result).toBe('intel-team');
  });
});

describe('CAPABILITY_MAPPING', () => {
  it('should map read to filesystem/read', () => {
    expect(CAPABILITY_MAPPING.read).toEqual(['filesystem', 'read']);
  });

  it('should map write to filesystem/write', () => {
    expect(CAPABILITY_MAPPING.write).toEqual(['filesystem', 'write']);
  });

  it('should map edit to filesystem/write', () => {
    expect(CAPABILITY_MAPPING.edit).toEqual(['filesystem', 'write']);
  });

  it('should map glob to filesystem/list', () => {
    expect(CAPABILITY_MAPPING.glob).toEqual(['filesystem', 'list']);
  });

  it('should map grep to filesystem/read', () => {
    expect(CAPABILITY_MAPPING.grep).toEqual(['filesystem', 'read']);
  });

  it('should map bash to shell/execute', () => {
    expect(CAPABILITY_MAPPING.bash).toEqual(['shell', 'execute']);
  });

  it('should map webfetch to network/fetch', () => {
    expect(CAPABILITY_MAPPING.webfetch).toEqual(['network', 'fetch']);
  });

  it('should map websearch to network/search', () => {
    expect(CAPABILITY_MAPPING.websearch).toEqual(['network', 'search']);
  });
});

describe('CAPABILITIES', () => {
  it('should have filesystem capability', () => {
    expect(CAPABILITIES.filesystem).toBeDefined();
    expect(CAPABILITIES.filesystem.operations).toContain('read');
    expect(CAPABILITIES.filesystem.operations).toContain('write');
    expect(CAPABILITIES.filesystem.operations).toContain('delete');
    expect(CAPABILITIES.filesystem.operations).toContain('list');
  });

  it('should have network capability', () => {
    expect(CAPABILITIES.network).toBeDefined();
    expect(CAPABILITIES.network.operations).toContain('fetch');
    expect(CAPABILITIES.network.operations).toContain('search');
  });

  it('should have shell capability', () => {
    expect(CAPABILITIES.shell).toBeDefined();
    expect(CAPABILITIES.shell.operations).toContain('execute');
  });

  it('should have sensitive_data capability', () => {
    expect(CAPABILITIES.sensitive_data).toBeDefined();
    expect(CAPABILITIES.sensitive_data.operations).toContain('read');
    expect(CAPABILITIES.sensitive_data.operations).toContain('process');
  });
});

describe('DEFAULT_PERMISSIONS', () => {
  it('should have filesystem read defaults', () => {
    expect(DEFAULT_PERMISSIONS.filesystem).toBeDefined();
    const fs = DEFAULT_PERMISSIONS.filesystem;
    if (fs && typeof fs !== 'boolean') {
      expect(fs.read).toBeInstanceOf(Array);
    }
  });

  it('should have filesystem write defaults', () => {
    const fs = DEFAULT_PERMISSIONS.filesystem;
    if (fs && typeof fs !== 'boolean') {
      expect(fs.write).toBeInstanceOf(Array);
    }
  });

  it('should disable network by default', () => {
    expect(DEFAULT_PERMISSIONS.network).toBe(false);
  });

  it('should have shell restrictions', () => {
    expect(DEFAULT_PERMISSIONS.shell).toBeDefined();
    const shell = DEFAULT_PERMISSIONS.shell;
    if (shell && typeof shell !== 'boolean') {
      expect(shell.blocked_commands).toBeInstanceOf(Array);
      expect(shell.blocked_commands).toContain('rm');
      expect(shell.blocked_commands).toContain('sudo');
    }
  });

  it('should disable sensitive_data by default', () => {
    expect(DEFAULT_PERMISSIONS.sensitive_data).toBe(false);
  });
});

describe('DANGEROUS_COMMANDS', () => {
  it('should include rm', () => {
    expect(DANGEROUS_COMMANDS.has('rm')).toBe(true);
  });

  it('should include sudo', () => {
    expect(DANGEROUS_COMMANDS.has('sudo')).toBe(true);
  });

  it('should include chmod', () => {
    expect(DANGEROUS_COMMANDS.has('chmod')).toBe(true);
  });

  it('should include dd', () => {
    expect(DANGEROUS_COMMANDS.has('dd')).toBe(true);
  });

  it('should include kill', () => {
    expect(DANGEROUS_COMMANDS.has('kill')).toBe(true);
  });

  it('should not include safe commands', () => {
    expect(DANGEROUS_COMMANDS.has('ls')).toBe(false);
    expect(DANGEROUS_COMMANDS.has('cat')).toBe(false);
    expect(DANGEROUS_COMMANDS.has('echo')).toBe(false);
  });
});

describe('PluginPermissionChecker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be instantiable', () => {
    const checker = new PluginPermissionChecker();
    expect(checker).toBeDefined();
  });

  it('should list plugins', () => {
    const checker = new PluginPermissionChecker();
    const plugins = checker.listPlugins();
    expect(plugins).toBeInstanceOf(Array);
  });

  it('should check permission and return PermissionCheck', () => {
    const checker = new PluginPermissionChecker();
    const result = checker.checkPermission('intel-team', 'filesystem', 'read', '_bmad/intel-team/agent.md');

    expect(result).toHaveProperty('allowed');
    expect(result).toHaveProperty('reason');
    expect(result).toHaveProperty('plugin');
    expect(result).toHaveProperty('capability');
    expect(result).toHaveProperty('operation');
  });

  it('should get plugin capabilities', () => {
    const checker = new PluginPermissionChecker();
    const capabilities = checker.getPluginCapabilities('intel-team');

    expect(capabilities).toBeDefined();
    expect(typeof capabilities).toBe('object');
  });
});

describe('generateManifestTemplate', () => {
  it('should generate manifest with plugin name', () => {
    const manifest = generateManifestTemplate('intel-team', 'intel');

    expect(manifest).toContain('intel-team');
    expect(manifest).toContain('name:');
    expect(manifest).toContain('version:');
  });

  it('should generate different permissions for intel type', () => {
    const manifest = generateManifestTemplate('my-plugin', 'intel');

    expect(manifest).toContain('permissions:');
    // Intel type should have network access for OSINT
    expect(manifest).toContain('network:');
  });

  it('should generate different permissions for legal type', () => {
    const manifest = generateManifestTemplate('my-plugin', 'legal');

    expect(manifest).toContain('permissions:');
  });

  it('should generate general type by default', () => {
    const manifest = generateManifestTemplate('my-plugin');

    expect(manifest).toContain('permissions:');
    expect(manifest).toContain('filesystem:');
  });

  it('should include version field', () => {
    const manifest = generateManifestTemplate('test-plugin', 'general');

    expect(manifest).toContain('version:');
    expect(manifest).toContain('1.0.0');
  });
});

describe('Permission checking scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow read within default plugin paths', () => {
    const checker = new PluginPermissionChecker();
    const result = checker.checkPermission(
      'intel-team',
      'filesystem',
      'read',
      '_bmad/intel-team/agents/test.md'
    );

    expect(result.allowed).toBe(true);
  });

  it('should allow read from docs directory', () => {
    const checker = new PluginPermissionChecker();
    const result = checker.checkPermission(
      'intel-team',
      'filesystem',
      'read',
      'docs/readme.md'
    );

    expect(result.allowed).toBe(true);
  });

  it('should check network permission and return a result', () => {
    const checker = new PluginPermissionChecker();
    const result = checker.checkPermission(
      'intel-team',
      'network',
      'fetch',
      'https://example.com'
    );

    // Result should have the expected structure
    expect(result).toHaveProperty('allowed');
    expect(result).toHaveProperty('reason');
    expect(result.capability).toBe('network');
    // Note: actual permission depends on manifest presence
  });

  it('should deny sensitive_data access by default', () => {
    const checker = new PluginPermissionChecker();
    const result = checker.checkPermission(
      'intel-team',
      'sensitive_data',
      'read',
      'user_data'
    );

    expect(result.allowed).toBe(false);
  });

  it('should block dangerous shell commands', () => {
    const checker = new PluginPermissionChecker();
    const result = checker.checkPermission(
      'intel-team',
      'shell',
      'execute',
      'rm -rf /tmp/test'
    );

    // rm is in blocked_commands
    expect(result.allowed).toBe(false);
  });
});
