#!/usr/bin/env python3
"""
BMAD Security Tests: Supply Chain Verifier
===========================================
Tests for the supply chain verification implementation (OWASP LLM05 - Supply Chain Vulnerabilities).

Test Categories:
1. SHA256 checksum calculation
2. Manifest loading and parsing
3. File verification
4. Skill verification
5. Plugin verification
6. GPG signature verification
7. Verification modes (strict, warn, disabled)
8. Cache behavior

Run with: python3 -m pytest tests/test_supply_chain_verifier.py -v
Or: python3 tests/test_supply_chain_verifier.py
"""

import sys
import os
import time
import json
import unittest
import tempfile
import shutil
import hashlib

# Add validators directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '.claude', 'validators'))

try:
    from supply_chain_verifier import (
        SupplyChainVerifier,
        verify_skill_integrity,
        verify_file_integrity,
        generate_manifest,
        ManifestEntry,
        VerificationResult,
        VERIFY_MODE,
        _verification_cache,
    )
    IMPORT_SUCCESS = True
except ImportError as e:
    print(f"Warning: Could not import supply_chain_verifier: {e}")
    IMPORT_SUCCESS = False


class TestSupplyChainVerifierSetup(unittest.TestCase):
    """Test setup and initialization."""

    def setUp(self):
        """Create a temporary directory for test files."""
        self.temp_dir = tempfile.mkdtemp()
        self.original_project_dir = None
        self.original_manifest_file = None
        self.original_bmad_dir = None

        if IMPORT_SUCCESS:
            import supply_chain_verifier
            self.original_project_dir = supply_chain_verifier.PROJECT_DIR
            self.original_manifest_file = supply_chain_verifier.MANIFEST_FILE
            self.original_bmad_dir = supply_chain_verifier.BMAD_DIR

            # Set up test directories
            supply_chain_verifier.PROJECT_DIR = self.temp_dir
            supply_chain_verifier.BMAD_DIR = os.path.join(self.temp_dir, '_bmad')
            supply_chain_verifier.SECURITY_DIR = os.path.join(self.temp_dir, '_bmad', 'core', 'security')
            supply_chain_verifier.MANIFEST_FILE = os.path.join(
                supply_chain_verifier.SECURITY_DIR, 'MANIFEST.sha256'
            )

            # Create directories
            os.makedirs(supply_chain_verifier.SECURITY_DIR, exist_ok=True)

            # Reset global instance and cache
            supply_chain_verifier._verifier = None
            supply_chain_verifier._verification_cache.clear()

    def tearDown(self):
        """Clean up temporary directory."""
        if IMPORT_SUCCESS and self.original_project_dir:
            import supply_chain_verifier
            supply_chain_verifier.PROJECT_DIR = self.original_project_dir
            supply_chain_verifier.MANIFEST_FILE = self.original_manifest_file
            supply_chain_verifier.BMAD_DIR = self.original_bmad_dir
            supply_chain_verifier._verifier = None
            supply_chain_verifier._verification_cache.clear()
        shutil.rmtree(self.temp_dir, ignore_errors=True)


class TestSHA256Calculation(TestSupplyChainVerifierSetup):
    """Test SHA256 hash calculation."""

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_calculate_hash_for_file(self):
        """Test calculating SHA256 hash for a file."""
        # Create a test file
        test_content = b"Hello, World!"
        expected_hash = hashlib.sha256(test_content).hexdigest().lower()

        test_file = os.path.join(self.temp_dir, 'test_file.txt')
        with open(test_file, 'wb') as f:
            f.write(test_content)

        verifier = SupplyChainVerifier()
        actual_hash = verifier._calculate_sha256('test_file.txt')

        self.assertEqual(actual_hash, expected_hash)

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_hash_nonexistent_file(self):
        """Test hash calculation for non-existent file."""
        verifier = SupplyChainVerifier()
        result = verifier._calculate_sha256('nonexistent_file.txt')

        self.assertIsNone(result)

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_hash_empty_file(self):
        """Test hash calculation for empty file."""
        test_file = os.path.join(self.temp_dir, 'empty.txt')
        with open(test_file, 'wb') as f:
            pass

        expected_hash = hashlib.sha256(b"").hexdigest().lower()

        verifier = SupplyChainVerifier()
        actual_hash = verifier._calculate_sha256('empty.txt')

        self.assertEqual(actual_hash, expected_hash)


class TestManifestLoading(TestSupplyChainVerifierSetup):
    """Test manifest file loading and parsing."""

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_load_valid_manifest(self):
        """Test loading a valid manifest file."""
        import supply_chain_verifier

        # Create test manifest
        manifest_content = """# Test manifest
# Generated: 2026-01-16
abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234  _bmad/test/file1.md
1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd  _bmad/test/file2.md
"""
        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write(manifest_content)

        verifier = SupplyChainVerifier()

        self.assertTrue(verifier.manifest_loaded)
        self.assertEqual(len(verifier.manifest_entries), 2)
        self.assertIn('_bmad/test/file1.md', verifier.manifest_entries)

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_skip_comments_and_empty_lines(self):
        """Test that comments and empty lines are skipped."""
        import supply_chain_verifier

        manifest_content = """# Comment line
# Another comment

abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234  _bmad/test/file.md

# More comments
"""
        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write(manifest_content)

        verifier = SupplyChainVerifier()

        self.assertEqual(len(verifier.manifest_entries), 1)

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_invalid_hash_format_ignored(self):
        """Test that entries with invalid hash format are ignored."""
        import supply_chain_verifier

        manifest_content = """invalid_hash  _bmad/test/file1.md
abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234  _bmad/test/file2.md
tooshort  _bmad/test/file3.md
"""
        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write(manifest_content)

        verifier = SupplyChainVerifier()

        self.assertEqual(len(verifier.manifest_entries), 1)
        self.assertIn('_bmad/test/file2.md', verifier.manifest_entries)

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_missing_manifest(self):
        """Test behavior when manifest file is missing."""
        verifier = SupplyChainVerifier()

        self.assertFalse(verifier.manifest_loaded)
        self.assertEqual(len(verifier.manifest_entries), 0)


class TestFileVerification(TestSupplyChainVerifierSetup):
    """Test individual file verification."""

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_verify_file_matches(self):
        """Test verification of file with matching checksum."""
        import supply_chain_verifier

        # Create test file
        test_content = b"Test content for verification"
        test_path = '_bmad/test/verified.txt'
        full_path = os.path.join(self.temp_dir, test_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'wb') as f:
            f.write(test_content)

        # Create manifest with correct hash
        expected_hash = hashlib.sha256(test_content).hexdigest()
        manifest_content = f"{expected_hash}  {test_path}\n"
        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write(manifest_content)

        verifier = SupplyChainVerifier()
        result = verifier.verify_file(test_path)

        self.assertTrue(result.verified)
        self.assertEqual(result.expected_hash, expected_hash.lower())
        self.assertEqual(result.actual_hash, expected_hash.lower())

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_verify_file_mismatch(self):
        """Test verification of file with mismatched checksum."""
        import supply_chain_verifier

        # Create test file
        test_content = b"Modified content"
        test_path = '_bmad/test/modified.txt'
        full_path = os.path.join(self.temp_dir, test_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'wb') as f:
            f.write(test_content)

        # Create manifest with different hash
        wrong_hash = 'a' * 64
        manifest_content = f"{wrong_hash}  {test_path}\n"
        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write(manifest_content)

        verifier = SupplyChainVerifier()
        result = verifier.verify_file(test_path)

        self.assertFalse(result.verified)
        self.assertIn('mismatch', result.reason.lower())

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_verify_file_not_in_manifest(self):
        """Test verification of file not in manifest."""
        import supply_chain_verifier

        # Create empty manifest
        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write("# Empty manifest\n")

        verifier = SupplyChainVerifier(verify_mode='strict')
        result = verifier.verify_file('_bmad/unknown/file.txt')

        self.assertFalse(result.verified)
        self.assertIn('not in manifest', result.reason.lower())

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_verify_file_not_in_manifest_warn_mode(self):
        """Test that untracked files are allowed in warn mode."""
        import supply_chain_verifier

        # Create empty manifest
        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write("# Empty manifest\n")

        verifier = SupplyChainVerifier(verify_mode='warn')
        result = verifier.verify_file('_bmad/unknown/file.txt')

        self.assertTrue(result.verified)


class TestSkillVerification(TestSupplyChainVerifierSetup):
    """Test skill verification."""

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_verify_skill_all_files_valid(self):
        """Test verification of skill with all valid files."""
        import supply_chain_verifier

        # Create test skill files
        skill_files = [
            ('_bmad/intel-team/agents/osint-lead.md', b"Agent content"),
            ('_bmad/intel-team/workflows/test.xml', b"Workflow content"),
        ]

        manifest_lines = []
        for path, content in skill_files:
            full_path = os.path.join(self.temp_dir, path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'wb') as f:
                f.write(content)
            hash_value = hashlib.sha256(content).hexdigest()
            manifest_lines.append(f"{hash_value}  {path}")

        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write('\n'.join(manifest_lines))

        verifier = SupplyChainVerifier()
        result = verifier.verify_skill('bmad:intel-team:agents:osint-lead')

        self.assertTrue(result.verified)

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_verify_skill_with_modified_file(self):
        """Test verification fails when skill file is modified."""
        import supply_chain_verifier

        # Create test file with one hash
        test_path = '_bmad/intel-team/agents/osint-lead.md'
        full_path = os.path.join(self.temp_dir, test_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        # Write original content
        original_content = b"Original content"
        with open(full_path, 'wb') as f:
            f.write(original_content)

        # Create manifest with original hash
        original_hash = hashlib.sha256(original_content).hexdigest()
        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write(f"{original_hash}  {test_path}\n")

        # Modify the file
        with open(full_path, 'wb') as f:
            f.write(b"Modified content")

        verifier = SupplyChainVerifier()
        result = verifier.verify_skill('bmad:intel-team:agents:osint-lead')

        self.assertFalse(result.verified)


class TestPluginVerification(TestSupplyChainVerifierSetup):
    """Test plugin verification."""

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_verify_plugin_all_files_valid(self):
        """Test verification of plugin with all valid files."""
        import supply_chain_verifier

        # Create test plugin files
        plugin_files = [
            ('_bmad/intel-team/agents/agent1.md', b"Agent 1"),
            ('_bmad/intel-team/agents/agent2.md', b"Agent 2"),
            ('_bmad/intel-team/workflows/workflow.xml', b"Workflow"),
        ]

        manifest_lines = []
        for path, content in plugin_files:
            full_path = os.path.join(self.temp_dir, path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'wb') as f:
                f.write(content)
            hash_value = hashlib.sha256(content).hexdigest()
            manifest_lines.append(f"{hash_value}  {path}")

        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write('\n'.join(manifest_lines))

        verifier = SupplyChainVerifier()
        result = verifier.verify_plugin('intel-team')

        self.assertTrue(result.verified)
        self.assertIn('3', result.reason)  # Should mention 3 files

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_verify_plugin_no_files(self):
        """Test verification of plugin with no manifest entries."""
        import supply_chain_verifier

        # Create empty manifest
        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write("# Empty\n")

        verifier = SupplyChainVerifier(verify_mode='strict')
        result = verifier.verify_plugin('unknown-plugin')

        self.assertFalse(result.verified)


class TestVerificationModes(TestSupplyChainVerifierSetup):
    """Test different verification modes."""

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_strict_mode_blocks_untracked(self):
        """Test that strict mode blocks untracked files."""
        import supply_chain_verifier

        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write("# Empty\n")

        verifier = SupplyChainVerifier(verify_mode='strict')
        result = verifier.verify_file('_bmad/unknown/file.txt')

        self.assertFalse(result.verified)

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_warn_mode_allows_untracked(self):
        """Test that warn mode allows untracked files."""
        import supply_chain_verifier

        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write("# Empty\n")

        verifier = SupplyChainVerifier(verify_mode='warn')
        result = verifier.verify_file('_bmad/unknown/file.txt')

        self.assertTrue(result.verified)


class TestVerificationCache(TestSupplyChainVerifierSetup):
    """Test verification result caching."""

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_cache_hit(self):
        """Test that cached results are returned."""
        import supply_chain_verifier

        # Create test file and manifest
        test_content = b"Cache test"
        test_path = '_bmad/test/cached.txt'
        full_path = os.path.join(self.temp_dir, test_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'wb') as f:
            f.write(test_content)

        hash_value = hashlib.sha256(test_content).hexdigest()
        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write(f"{hash_value}  {test_path}\n")

        verifier = SupplyChainVerifier()

        # First verification - should calculate
        result1 = verifier.verify_file(test_path)

        # Second verification - should be cached
        result2 = verifier.verify_file(test_path)

        self.assertTrue(result1.verified)
        self.assertTrue(result2.verified)
        self.assertIn('cached', result2.reason.lower())


class TestManifestGeneration(TestSupplyChainVerifierSetup):
    """Test manifest generation."""

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_generate_manifest(self):
        """Test generating a manifest file."""
        import supply_chain_verifier

        # Create test files
        os.makedirs(os.path.join(self.temp_dir, '_bmad', 'test', 'agents'), exist_ok=True)
        test_file = os.path.join(self.temp_dir, '_bmad', 'test', 'agents', 'test.md')
        with open(test_file, 'w') as f:
            f.write("Test agent")

        output_path = os.path.join(self.temp_dir, 'generated_manifest.sha256')
        content = generate_manifest(output_path)

        self.assertTrue(os.path.exists(output_path))
        self.assertIn('_bmad/test/agents/test.md', content)


class TestConvenienceFunctions(TestSupplyChainVerifierSetup):
    """Test convenience functions."""

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_verify_skill_integrity(self):
        """Test verify_skill_integrity function."""
        import supply_chain_verifier

        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write("# Empty\n")

        # In warn mode, should return True for missing skills
        supply_chain_verifier._verifier = None
        os.environ['BMAD_VERIFY_MODE'] = 'warn'

        verified, message = verify_skill_integrity('bmad:test:skill')

        self.assertIsInstance(verified, bool)
        self.assertIsInstance(message, str)

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_verify_file_integrity(self):
        """Test verify_file_integrity function."""
        import supply_chain_verifier

        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write("# Empty\n")

        verified, message = verify_file_integrity('_bmad/nonexistent.txt')

        self.assertIsInstance(verified, bool)
        self.assertIsInstance(message, str)


class TestVerificationStatus(TestSupplyChainVerifierSetup):
    """Test verification status reporting."""

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_get_verification_status(self):
        """Test getting verification status."""
        import supply_chain_verifier

        # Create manifest with entries
        manifest_content = """abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234  _bmad/test/file.md"""
        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write(manifest_content)

        verifier = SupplyChainVerifier()
        status = verifier.get_verification_status()

        self.assertIn('manifest_loaded', status)
        self.assertIn('manifest_entries', status)
        self.assertIn('verify_mode', status)
        self.assertTrue(status['manifest_loaded'])
        self.assertEqual(status['manifest_entries'], 1)


# ============================================================================
# Performance Tests
# ============================================================================

class TestPerformance(TestSupplyChainVerifierSetup):
    """Performance benchmark tests."""

    @unittest.skipUnless(IMPORT_SUCCESS, "supply_chain_verifier not available")
    def test_verification_performance(self):
        """Test that file verification completes within acceptable time."""
        import supply_chain_verifier

        # Create test file and manifest
        test_content = b"Performance test" * 1000  # ~16KB
        test_path = '_bmad/test/perf.txt'
        full_path = os.path.join(self.temp_dir, test_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'wb') as f:
            f.write(test_content)

        hash_value = hashlib.sha256(test_content).hexdigest()
        with open(supply_chain_verifier.MANIFEST_FILE, 'w') as f:
            f.write(f"{hash_value}  {test_path}\n")

        verifier = SupplyChainVerifier()

        # Time the verification
        start_time = time.time()
        for _ in range(100):
            supply_chain_verifier._verification_cache.clear()  # Clear cache each time
            verifier.verify_file(test_path)
        elapsed = time.time() - start_time

        avg_time_ms = (elapsed / 100) * 1000
        print(f"\nAverage verification time: {avg_time_ms:.2f}ms")

        # Should complete in under 50ms per verification
        self.assertLess(avg_time_ms, 50)


if __name__ == '__main__':
    # Run tests with verbosity
    unittest.main(verbosity=2)
