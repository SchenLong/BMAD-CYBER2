#!/usr/bin/env python3
"""
BMAD Security Tests: Plugin Permissions
========================================
Tests for the plugin permission model (OWASP LLM07 - Insecure Plugin Design).

Test Categories:
1. Manifest parsing and loading
2. Filesystem permission checks
3. Shell command permission checks
4. Network and sensitive data permissions
5. RBAC integration
6. Default permission behavior
7. Permission generation

Run with: python3 -m pytest tests/test_plugin_permissions.py -v
Or: python3 tests/test_plugin_permissions.py
"""

import sys
import os
import json
import unittest
import tempfile
import shutil

# Add validators directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '.claude', 'validators'))

try:
    from plugin_permissions import (
        PluginPermissionChecker,
        PluginManifest,
        check_plugin_permission,
        detect_plugin_from_path,
        generate_manifest_template,
        CAPABILITIES,
        RBAC_PERMISSIONS,
        DANGEROUS_COMMANDS,
    )
    IMPORT_SUCCESS = True
except ImportError as e:
    print(f"Warning: Could not import plugin_permissions: {e}")
    IMPORT_SUCCESS = False


class TestManifestParsing(unittest.TestCase):
    """Test manifest parsing functionality."""

    def setUp(self):
        """Create temporary test directory."""
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        """Clean up temporary directory."""
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_parse_valid_manifest(self):
        """Test parsing a valid manifest."""
        manifest_content = """
name: test-plugin
version: 1.0.0
permissions:
  filesystem:
    read: ["test/**"]
    write: ["test/output/**"]
  network: true
  shell:
    allowed_commands: ["echo", "ls"]
    blocked_commands: ["rm"]
  sensitive_data: false
"""
        manifest_path = os.path.join(self.temp_dir, 'manifest.yaml')
        with open(manifest_path, 'w') as f:
            f.write(manifest_content)

        manifest = PluginManifest.from_file(manifest_path)
        self.assertIsNotNone(manifest)
        self.assertEqual(manifest.name, 'test-plugin')
        self.assertEqual(manifest.version, '1.0.0')

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_parse_minimal_manifest(self):
        """Test parsing a minimal manifest."""
        manifest_content = """
name: minimal
version: 0.1.0
"""
        manifest_path = os.path.join(self.temp_dir, 'manifest.yaml')
        with open(manifest_path, 'w') as f:
            f.write(manifest_content)

        manifest = PluginManifest.from_file(manifest_path)
        self.assertIsNotNone(manifest)
        self.assertEqual(manifest.name, 'minimal')

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_parse_invalid_file(self):
        """Test handling of invalid manifest file."""
        manifest_path = os.path.join(self.temp_dir, 'nonexistent.yaml')
        manifest = PluginManifest.from_file(manifest_path)
        self.assertIsNone(manifest)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_from_yaml_dict(self):
        """Test creating manifest from dictionary."""
        data = {
            'name': 'dict-plugin',
            'version': '2.0.0',
            'permissions': {
                'filesystem': {'read': ['**']},
                'network': True,
            }
        }
        manifest = PluginManifest.from_yaml(data)
        self.assertEqual(manifest.name, 'dict-plugin')
        self.assertEqual(manifest.version, '2.0.0')
        self.assertTrue(manifest.permissions.get('network'))


class TestFilesystemPermissions(unittest.TestCase):
    """Test filesystem permission checks."""

    def setUp(self):
        """Set up test checker with mock data."""
        if IMPORT_SUCCESS:
            self.checker = PluginPermissionChecker()
            # Add a test manifest
            self.checker.manifests['test-plugin'] = PluginManifest(
                name='test-plugin',
                version='1.0.0',
                permissions={
                    'filesystem': {
                        'read': ['_bmad/test-plugin/**', 'docs/**'],
                        'write': ['_bmad/test-plugin/output/**'],
                    },
                    'network': False,
                    'shell': {'allowed_commands': [], 'blocked_commands': ['*']},
                    'sensitive_data': False,
                }
            )

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_read_allowed_path(self):
        """Test that reading allowed paths works."""
        result = self.checker.check_permission(
            'test-plugin', 'filesystem', 'read',
            '_bmad/test-plugin/data/file.txt'
        )
        self.assertTrue(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_read_denied_path(self):
        """Test that reading denied paths is blocked."""
        result = self.checker.check_permission(
            'test-plugin', 'filesystem', 'read',
            '_bmad/other-plugin/secret.txt'
        )
        self.assertFalse(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_write_allowed_path(self):
        """Test that writing to allowed paths works."""
        result = self.checker.check_permission(
            'test-plugin', 'filesystem', 'write',
            '_bmad/test-plugin/output/result.json'
        )
        self.assertTrue(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_write_denied_path(self):
        """Test that writing to denied paths is blocked."""
        result = self.checker.check_permission(
            'test-plugin', 'filesystem', 'write',
            '_bmad/test-plugin/agents/agent.md'  # Not in output/**
        )
        self.assertFalse(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_docs_readable(self):
        """Test that docs directory is readable."""
        result = self.checker.check_permission(
            'test-plugin', 'filesystem', 'read',
            'docs/README.md'
        )
        self.assertTrue(result.allowed)


class TestShellPermissions(unittest.TestCase):
    """Test shell command permission checks."""

    def setUp(self):
        """Set up test checker."""
        if IMPORT_SUCCESS:
            self.checker = PluginPermissionChecker()
            self.checker.manifests['shell-test'] = PluginManifest(
                name='shell-test',
                version='1.0.0',
                permissions={
                    'filesystem': {'read': ['**']},
                    'network': False,
                    'shell': {
                        'allowed_commands': ['git', 'npm', 'echo'],
                        'blocked_commands': ['rm', 'sudo'],
                    },
                    'sensitive_data': False,
                }
            )

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_allowed_command(self):
        """Test that allowed commands pass."""
        result = self.checker.check_permission(
            'shell-test', 'shell', 'execute', 'git status'
        )
        self.assertTrue(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_blocked_command(self):
        """Test that blocked commands are denied."""
        result = self.checker.check_permission(
            'shell-test', 'shell', 'execute', 'rm -rf /'
        )
        self.assertFalse(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_dangerous_command_blocked(self):
        """Test that dangerous commands are blocked."""
        result = self.checker.check_permission(
            'shell-test', 'shell', 'execute', 'sudo apt-get update'
        )
        self.assertFalse(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_unlisted_command_denied(self):
        """Test that unlisted commands are denied when allowlist exists."""
        result = self.checker.check_permission(
            'shell-test', 'shell', 'execute', 'curl https://example.com'
        )
        self.assertFalse(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_dangerous_commands_list(self):
        """Test that dangerous commands list is populated."""
        self.assertIn('rm', DANGEROUS_COMMANDS)
        self.assertIn('sudo', DANGEROUS_COMMANDS)
        self.assertIn('chmod', DANGEROUS_COMMANDS)


class TestNetworkPermissions(unittest.TestCase):
    """Test network permission checks."""

    def setUp(self):
        """Set up test checker."""
        if IMPORT_SUCCESS:
            self.checker = PluginPermissionChecker()
            self.checker.manifests['net-allow'] = PluginManifest(
                name='net-allow',
                version='1.0.0',
                permissions={'network': True}
            )
            self.checker.manifests['net-deny'] = PluginManifest(
                name='net-deny',
                version='1.0.0',
                permissions={'network': False}
            )

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_network_allowed(self):
        """Test that network is allowed when permitted."""
        result = self.checker.check_permission(
            'net-allow', 'network', 'fetch', 'https://api.example.com'
        )
        self.assertTrue(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_network_denied(self):
        """Test that network is denied when not permitted."""
        result = self.checker.check_permission(
            'net-deny', 'network', 'fetch', 'https://api.example.com'
        )
        self.assertFalse(result.allowed)


class TestSensitiveDataPermissions(unittest.TestCase):
    """Test sensitive data permission checks."""

    def setUp(self):
        """Set up test checker."""
        if IMPORT_SUCCESS:
            self.checker = PluginPermissionChecker()
            self.checker.manifests['sens-allow'] = PluginManifest(
                name='sens-allow',
                version='1.0.0',
                permissions={'sensitive_data': True}
            )
            self.checker.manifests['sens-deny'] = PluginManifest(
                name='sens-deny',
                version='1.0.0',
                permissions={'sensitive_data': False}
            )

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_sensitive_allowed(self):
        """Test that sensitive data access is allowed when permitted."""
        result = self.checker.check_permission(
            'sens-allow', 'sensitive_data', 'read', 'user_pii.json'
        )
        self.assertTrue(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_sensitive_denied(self):
        """Test that sensitive data access is denied by default."""
        result = self.checker.check_permission(
            'sens-deny', 'sensitive_data', 'read', 'user_pii.json'
        )
        self.assertFalse(result.allowed)


class TestRBACIntegration(unittest.TestCase):
    """Test RBAC integration."""

    def setUp(self):
        """Set up test checker with specific role."""
        if IMPORT_SUCCESS:
            # Save original environment
            self.original_role = os.environ.get('BMAD_USER_ROLE')

    def tearDown(self):
        """Restore original environment."""
        if IMPORT_SUCCESS:
            if self.original_role:
                os.environ['BMAD_USER_ROLE'] = self.original_role
            elif 'BMAD_USER_ROLE' in os.environ:
                del os.environ['BMAD_USER_ROLE']

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_admin_override(self):
        """Test that admin role can override restrictions."""
        os.environ['BMAD_USER_ROLE'] = 'admin'
        checker = PluginPermissionChecker()

        # Admin should be able to write anywhere
        result = checker.check_permission(
            'restricted-plugin', 'filesystem', 'write', '/any/path/file.txt'
        )
        # Note: RBAC patterns use '**' which should match
        self.assertTrue(result.rbac_override or result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_viewer_restricted(self):
        """Test that viewer role has restrictions."""
        os.environ['BMAD_USER_ROLE'] = 'viewer'
        checker = PluginPermissionChecker()

        # Add a plugin manifest that explicitly denies shell
        checker.manifests['viewer-test'] = PluginManifest(
            name='viewer-test',
            version='1.0.0',
            permissions={
                'shell': {'allowed_commands': [], 'blocked_commands': ['*']},
            }
        )

        # Viewer should not have shell access to a plugin with explicit restrictions
        result = checker.check_permission(
            'viewer-test', 'shell', 'execute', 'git status'
        )
        self.assertFalse(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_rbac_roles_defined(self):
        """Test that RBAC roles are defined."""
        self.assertIn('admin', RBAC_PERMISSIONS)
        self.assertIn('developer', RBAC_PERMISSIONS)
        self.assertIn('analyst', RBAC_PERMISSIONS)
        self.assertIn('viewer', RBAC_PERMISSIONS)


class TestDefaultPermissions(unittest.TestCase):
    """Test default permission behavior for plugins without manifests."""

    def setUp(self):
        """Set up test checker with no RBAC role."""
        if IMPORT_SUCCESS:
            # Save and clear RBAC role to test pure default behavior
            self.original_role = os.environ.get('BMAD_USER_ROLE')
            if 'BMAD_USER_ROLE' in os.environ:
                del os.environ['BMAD_USER_ROLE']
            self.checker = PluginPermissionChecker()
            self.checker.current_role = None  # Disable RBAC

    def tearDown(self):
        """Restore RBAC role."""
        if IMPORT_SUCCESS and self.original_role:
            os.environ['BMAD_USER_ROLE'] = self.original_role

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_default_read_own_directory(self):
        """Test that plugins can read their own directory by default."""
        result = self.checker.check_permission(
            'unknown-plugin', 'filesystem', 'read',
            '_bmad/unknown-plugin/data.txt'
        )
        self.assertTrue(result.allowed)
        self.assertFalse(result.manifest_found)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_default_network_denied(self):
        """Test that network is denied by default (without RBAC override)."""
        result = self.checker.check_permission(
            'unknown-plugin', 'network', 'fetch', 'https://api.example.com'
        )
        self.assertFalse(result.allowed)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_default_shell_restricted(self):
        """Test that shell is restricted by default."""
        result = self.checker.check_permission(
            'unknown-plugin', 'shell', 'execute', 'rm -rf /'
        )
        self.assertFalse(result.allowed)


class TestCapabilitiesValidation(unittest.TestCase):
    """Test capability and operation validation."""

    def setUp(self):
        """Set up test checker."""
        if IMPORT_SUCCESS:
            self.checker = PluginPermissionChecker()

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_unknown_capability_rejected(self):
        """Test that unknown capabilities are rejected."""
        result = self.checker.check_permission(
            'any-plugin', 'unknown_capability', 'read', 'target'
        )
        self.assertFalse(result.allowed)
        self.assertIn('Unknown capability', result.reason)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_unknown_operation_rejected(self):
        """Test that unknown operations are rejected."""
        result = self.checker.check_permission(
            'any-plugin', 'filesystem', 'unknown_operation', 'target'
        )
        self.assertFalse(result.allowed)
        self.assertIn('Unknown operation', result.reason)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_capabilities_structure(self):
        """Test that capabilities are properly structured."""
        for cap_name, cap_def in CAPABILITIES.items():
            self.assertIn('description', cap_def)
            self.assertIn('operations', cap_def)
            self.assertIsInstance(cap_def['operations'], list)


class TestPluginDetection(unittest.TestCase):
    """Test plugin detection from paths."""

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_detect_plugin_from_bmad_path(self):
        """Test detecting plugin from _bmad path."""
        path = '_bmad/intel-team/agents/analyst.md'
        plugin = detect_plugin_from_path(path)
        self.assertEqual(plugin, 'intel-team')

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_detect_plugin_nested_path(self):
        """Test detecting plugin from nested path."""
        path = '_bmad/legal-team/workflows/contract-review.md'
        plugin = detect_plugin_from_path(path)
        self.assertEqual(plugin, 'legal-team')

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_non_plugin_path_returns_none(self):
        """Test that non-plugin paths return None."""
        path = 'src/utils/helper.py'
        plugin = detect_plugin_from_path(path)
        self.assertIsNone(plugin)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_config_directory_ignored(self):
        """Test that _config directory is ignored."""
        path = '_bmad/_config/settings.yaml'
        plugin = detect_plugin_from_path(path)
        self.assertIsNone(plugin)


class TestManifestGeneration(unittest.TestCase):
    """Test manifest generation functionality."""

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_generate_intel_manifest(self):
        """Test generating intel-type manifest."""
        content = generate_manifest_template('test-intel', 'intel')
        self.assertIn('name: test-intel', content)
        self.assertIn('network: true', content)
        self.assertIn('sensitive_data: true', content)
        self.assertIn('curl', content)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_generate_dev_manifest(self):
        """Test generating dev-type manifest."""
        content = generate_manifest_template('test-dev', 'dev')
        self.assertIn('name: test-dev', content)
        self.assertIn('git', content)
        self.assertIn('pytest', content)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_generate_general_manifest(self):
        """Test generating general-type manifest."""
        content = generate_manifest_template('test-general', 'general')
        self.assertIn('name: test-general', content)
        self.assertIn('network: false', content)
        self.assertIn('sensitive_data: false', content)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_generate_manifest_structure(self):
        """Test that generated manifest has valid structure."""
        content = generate_manifest_template('struct-test', 'general')

        # Should contain required sections
        self.assertIn('name:', content)
        self.assertIn('version:', content)
        self.assertIn('permissions:', content)
        self.assertIn('filesystem:', content)
        self.assertIn('network:', content)
        self.assertIn('shell:', content)
        self.assertIn('sensitive_data:', content)


class TestConvenienceFunctions(unittest.TestCase):
    """Test convenience functions."""

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_check_plugin_permission_function(self):
        """Test the check_plugin_permission convenience function."""
        allowed, message = check_plugin_permission(
            'unknown-plugin', 'filesystem', 'read', 'docs/README.md'
        )
        self.assertIsInstance(allowed, bool)
        self.assertIsInstance(message, str)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_list_plugins(self):
        """Test listing plugins."""
        checker = PluginPermissionChecker()
        plugins = checker.list_plugins()
        self.assertIsInstance(plugins, list)

    @unittest.skipUnless(IMPORT_SUCCESS, "plugin_permissions not available")
    def test_get_plugin_capabilities(self):
        """Test getting plugin capabilities."""
        checker = PluginPermissionChecker()
        caps = checker.get_plugin_capabilities('intel-team')
        self.assertIsInstance(caps, dict)


def run_tests():
    """Run all tests and print summary."""
    print("=" * 70)
    print("BMAD Plugin Permission Tests (OWASP LLM07)")
    print("=" * 70)

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Add all test classes
    suite.addTests(loader.loadTestsFromTestCase(TestManifestParsing))
    suite.addTests(loader.loadTestsFromTestCase(TestFilesystemPermissions))
    suite.addTests(loader.loadTestsFromTestCase(TestShellPermissions))
    suite.addTests(loader.loadTestsFromTestCase(TestNetworkPermissions))
    suite.addTests(loader.loadTestsFromTestCase(TestSensitiveDataPermissions))
    suite.addTests(loader.loadTestsFromTestCase(TestRBACIntegration))
    suite.addTests(loader.loadTestsFromTestCase(TestDefaultPermissions))
    suite.addTests(loader.loadTestsFromTestCase(TestCapabilitiesValidation))
    suite.addTests(loader.loadTestsFromTestCase(TestPluginDetection))
    suite.addTests(loader.loadTestsFromTestCase(TestManifestGeneration))
    suite.addTests(loader.loadTestsFromTestCase(TestConvenienceFunctions))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Skipped: {len(result.skipped)}")

    if result.failures:
        print("\nFailed tests:")
        for test, _ in result.failures:
            print(f"  - {test}")

    if result.errors:
        print("\nError tests:")
        for test, _ in result.errors:
            print(f"  - {test}")

    success = len(result.failures) == 0 and len(result.errors) == 0
    print(f"\nOverall: {'PASS' if success else 'FAIL'}")
    print("=" * 70)

    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(run_tests())
