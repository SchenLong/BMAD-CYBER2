#!/usr/bin/env python3
"""
Unit tests for BMAD Audit Integrity (Hash Chain)
================================================
Tests cryptographic hash chain functionality for audit log tamper detection.
"""

import json
import os
import sys
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

# Add validators directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '.claude', 'validators'))

from audit_integrity import (
    HashChainManager,
    ChainEntry,
    VerificationResult,
    GENESIS_HASH,
    get_chain_manager,
    add_chain_fields,
    verify_security_log,
    get_integrity_status,
)


class TestHashChainManager(unittest.TestCase):
    """Test HashChainManager functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = tempfile.mkdtemp()
        self.log_file = os.path.join(self.temp_dir, 'test_security.log')
        self.state_file = os.path.join(self.temp_dir, 'chain_state.json')
        self.manager = HashChainManager(self.log_file, self.state_file)

    def tearDown(self):
        """Clean up test files."""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_genesis_hash(self):
        """Test that first entry uses genesis hash."""
        entry = {
            'timestamp': datetime.now().isoformat(),
            'validator': 'test',
            'action': 'ALLOWED'
        }

        result = self.manager.add_entry(entry)

        self.assertEqual(result['_chain_index'], 0)
        self.assertEqual(result['_previous_hash'], GENESIS_HASH)
        self.assertIn('_entry_hash', result)
        self.assertEqual(len(result['_entry_hash']), 64)  # SHA256 hex length

    def test_chain_linkage(self):
        """Test that entries are properly linked."""
        entry1 = {'timestamp': '2026-01-16T10:00:00', 'validator': 'test1', 'action': 'ALLOWED'}
        entry2 = {'timestamp': '2026-01-16T10:00:01', 'validator': 'test2', 'action': 'BLOCKED'}
        entry3 = {'timestamp': '2026-01-16T10:00:02', 'validator': 'test3', 'action': 'ALLOWED'}

        result1 = self.manager.add_entry(entry1)
        result2 = self.manager.add_entry(entry2)
        result3 = self.manager.add_entry(entry3)

        # Check chain indices
        self.assertEqual(result1['_chain_index'], 0)
        self.assertEqual(result2['_chain_index'], 1)
        self.assertEqual(result3['_chain_index'], 2)

        # Check linkage
        self.assertEqual(result1['_previous_hash'], GENESIS_HASH)
        self.assertEqual(result2['_previous_hash'], result1['_entry_hash'])
        self.assertEqual(result3['_previous_hash'], result2['_entry_hash'])

        # All hashes should be unique
        hashes = {result1['_entry_hash'], result2['_entry_hash'], result3['_entry_hash']}
        self.assertEqual(len(hashes), 3)

    def test_content_hash_determinism(self):
        """Test that same content produces same content hash."""
        entry1 = {'timestamp': '2026-01-16T10:00:00', 'validator': 'test', 'action': 'ALLOWED'}
        entry2 = {'timestamp': '2026-01-16T10:00:00', 'validator': 'test', 'action': 'ALLOWED'}

        hash1 = self.manager._compute_content_hash(entry1)
        hash2 = self.manager._compute_content_hash(entry2)

        self.assertEqual(hash1, hash2)

    def test_content_hash_sensitivity(self):
        """Test that different content produces different hashes."""
        entry1 = {'timestamp': '2026-01-16T10:00:00', 'validator': 'test', 'action': 'ALLOWED'}
        entry2 = {'timestamp': '2026-01-16T10:00:00', 'validator': 'test', 'action': 'BLOCKED'}

        hash1 = self.manager._compute_content_hash(entry1)
        hash2 = self.manager._compute_content_hash(entry2)

        self.assertNotEqual(hash1, hash2)

    def test_chain_fields_excluded_from_content_hash(self):
        """Test that chain fields are excluded from content hash."""
        entry1 = {'timestamp': '2026-01-16T10:00:00', 'validator': 'test', 'action': 'ALLOWED'}
        entry2 = {
            'timestamp': '2026-01-16T10:00:00',
            'validator': 'test',
            'action': 'ALLOWED',
            '_chain_index': 5,
            '_previous_hash': 'abc123',
            '_entry_hash': 'def456'
        }

        hash1 = self.manager._compute_content_hash(entry1)
        hash2 = self.manager._compute_content_hash(entry2)

        self.assertEqual(hash1, hash2)

    def test_state_persistence(self):
        """Test that chain state is persisted across instances."""
        entry1 = {'timestamp': '2026-01-16T10:00:00', 'validator': 'test', 'action': 'ALLOWED'}
        result1 = self.manager.add_entry(entry1)

        # Create new manager instance
        manager2 = HashChainManager(self.log_file, self.state_file)
        entry2 = {'timestamp': '2026-01-16T10:00:01', 'validator': 'test', 'action': 'ALLOWED'}
        result2 = manager2.add_entry(entry2)

        # Second entry should link to first
        self.assertEqual(result2['_chain_index'], 1)
        self.assertEqual(result2['_previous_hash'], result1['_entry_hash'])


class TestChainVerification(unittest.TestCase):
    """Test chain verification functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = tempfile.mkdtemp()
        self.log_file = os.path.join(self.temp_dir, 'test_security.log')
        self.state_file = os.path.join(self.temp_dir, 'chain_state.json')
        self.manager = HashChainManager(self.log_file, self.state_file)

    def tearDown(self):
        """Clean up test files."""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def _write_entries(self, count: int):
        """Helper to write chain entries to log file."""
        entries = []
        for i in range(count):
            entry = {
                'timestamp': f'2026-01-16T10:00:{i:02d}',
                'validator': f'test{i}',
                'action': 'ALLOWED'
            }
            result = self.manager.add_entry(entry)
            entries.append(result)

            with open(self.log_file, 'a') as f:
                f.write(json.dumps(result) + '\n')

        return entries

    def test_verify_empty_log(self):
        """Test verification of empty log file."""
        result = self.manager.verify_chain()

        self.assertTrue(result.valid)
        self.assertEqual(result.entries_checked, 0)
        self.assertFalse(result.tampering_detected)

    def test_verify_valid_chain(self):
        """Test verification of valid chain."""
        self._write_entries(5)

        result = self.manager.verify_chain()

        self.assertTrue(result.valid)
        self.assertEqual(result.entries_checked, 5)
        self.assertFalse(result.tampering_detected)
        self.assertIsNone(result.first_invalid_index)

    def test_detect_modified_content(self):
        """Test detection of modified entry content."""
        entries = self._write_entries(3)

        # Modify an entry in the log file
        with open(self.log_file, 'r') as f:
            lines = f.readlines()

        # Tamper with second entry
        tampered = json.loads(lines[1])
        tampered['action'] = 'TAMPERED'  # Change content
        lines[1] = json.dumps(tampered) + '\n'

        with open(self.log_file, 'w') as f:
            f.writelines(lines)

        result = self.manager.verify_chain()

        self.assertFalse(result.valid)
        self.assertTrue(result.tampering_detected)
        self.assertEqual(result.first_invalid_index, 1)
        self.assertIn('content hash mismatch', result.error_message)

    def test_detect_broken_chain(self):
        """Test detection of broken chain linkage."""
        entries = self._write_entries(3)

        # Modify previous_hash in an entry
        with open(self.log_file, 'r') as f:
            lines = f.readlines()

        # Tamper with chain linkage
        tampered = json.loads(lines[2])
        tampered['_previous_hash'] = 'fake_hash_12345'
        lines[2] = json.dumps(tampered) + '\n'

        with open(self.log_file, 'w') as f:
            f.writelines(lines)

        result = self.manager.verify_chain()

        self.assertFalse(result.valid)
        self.assertTrue(result.tampering_detected)
        self.assertEqual(result.first_invalid_index, 2)
        self.assertIn('previous hash mismatch', result.error_message)

    def test_detect_deleted_entry(self):
        """Test detection of deleted entry."""
        entries = self._write_entries(5)

        # Delete middle entry
        with open(self.log_file, 'r') as f:
            lines = f.readlines()

        del lines[2]  # Remove third entry

        with open(self.log_file, 'w') as f:
            f.writelines(lines)

        result = self.manager.verify_chain()

        self.assertFalse(result.valid)
        self.assertTrue(result.tampering_detected)

    def test_detect_inserted_entry(self):
        """Test detection of inserted entry."""
        entries = self._write_entries(3)

        # Insert fake entry
        with open(self.log_file, 'r') as f:
            lines = f.readlines()

        fake_entry = {
            'timestamp': '2026-01-16T10:00:99',
            'validator': 'fake',
            'action': 'FAKE',
            '_chain_index': 1,
            '_previous_hash': entries[0]['_entry_hash'],
            '_entry_hash': 'fake_hash_inserted'
        }
        lines.insert(1, json.dumps(fake_entry) + '\n')

        with open(self.log_file, 'w') as f:
            f.writelines(lines)

        result = self.manager.verify_chain()

        self.assertFalse(result.valid)
        self.assertTrue(result.tampering_detected)

    def test_verify_max_entries(self):
        """Test verification with max_entries limit."""
        self._write_entries(10)

        result = self.manager.verify_chain(max_entries=5)

        self.assertTrue(result.valid)
        self.assertEqual(result.entries_checked, 5)

    def test_detect_invalid_json(self):
        """Test detection of invalid JSON in log."""
        self._write_entries(2)

        with open(self.log_file, 'a') as f:
            f.write("not valid json\n")

        result = self.manager.verify_chain()

        self.assertFalse(result.valid)
        self.assertTrue(result.tampering_detected)
        self.assertIn('Invalid JSON', result.error_message)


class TestChainStatus(unittest.TestCase):
    """Test chain status functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = tempfile.mkdtemp()
        self.log_file = os.path.join(self.temp_dir, 'test_security.log')
        self.state_file = os.path.join(self.temp_dir, 'chain_state.json')
        self.manager = HashChainManager(self.log_file, self.state_file)

    def tearDown(self):
        """Clean up test files."""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_status_empty_chain(self):
        """Test status of empty chain."""
        status = self.manager.get_chain_status()

        self.assertEqual(status['entry_count'], 0)
        self.assertIsNone(status['last_timestamp'])
        self.assertTrue(status['chain_valid'])

    def test_status_with_entries(self):
        """Test status with entries."""
        for i in range(5):
            entry = {
                'timestamp': f'2026-01-16T10:00:{i:02d}',
                'validator': 'test',
                'action': 'ALLOWED'
            }
            result = self.manager.add_entry(entry)
            with open(self.log_file, 'a') as f:
                f.write(json.dumps(result) + '\n')

        status = self.manager.get_chain_status()

        self.assertEqual(status['entry_count'], 5)
        self.assertIsNotNone(status['last_timestamp'])
        self.assertTrue(status['signing_enabled'])
        self.assertTrue(status['chain_valid'])
        self.assertEqual(status['entries_verified'], 5)


class TestGlobalFunctions(unittest.TestCase):
    """Test module-level convenience functions."""

    def test_add_chain_fields(self):
        """Test add_chain_fields function."""
        entry = {
            'timestamp': datetime.now().isoformat(),
            'validator': 'test',
            'action': 'ALLOWED'
        }

        result = add_chain_fields(entry)

        # Should have chain fields added
        self.assertIn('_chain_index', result)
        self.assertIn('_previous_hash', result)
        self.assertIn('_entry_hash', result)


if __name__ == '__main__':
    unittest.main()
