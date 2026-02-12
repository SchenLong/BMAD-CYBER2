#!/bin/bash
# test-backup-restore.sh
# GAP-NIST-03 remediation: Backup restore verification script
#
# Tests the backup/restore procedure by:
# 1. Creating a test backup tag
# 2. Making a verifiable change
# 3. Restoring from the backup tag
# 4. Verifying the change is reverted
# 5. Cleaning up
#
# Usage: bash scripts/test-backup-restore.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEST_TAG="backup-restore-test-$(date +%s)"
TEST_FILE="${REPO_DIR}/_bmad-output/backup-restore-test-marker.txt"
RESULTS=()
PASS_COUNT=0
FAIL_COUNT=0

log_result() {
  local test_name="$1"
  local status="$2"
  if [ "$status" = "PASS" ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
    echo "  [PASS] ${test_name}"
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "  [FAIL] ${test_name}"
  fi
  RESULTS+=("${status}: ${test_name}")
}

echo "========================================="
echo " Backup Restore Verification Test"
echo " Tag: ${TEST_TAG}"
echo "========================================="
echo ""

cd "${REPO_DIR}"

# Step 1: Record initial state
echo "Step 1: Recording initial state..."
INITIAL_HASH=$(git rev-parse HEAD)
echo "  Current HEAD: ${INITIAL_HASH}"

# Step 2: Create backup tag at current state
echo "Step 2: Creating backup tag..."
git tag "${TEST_TAG}"
if git tag -l "${TEST_TAG}" | grep -q "${TEST_TAG}"; then
  log_result "Backup tag created" "PASS"
else
  log_result "Backup tag created" "FAIL"
  echo "FATAL: Could not create tag. Aborting."
  exit 1
fi

# Step 3: Make a verifiable change
echo "Step 3: Making test change..."
echo "BACKUP_RESTORE_TEST_MARKER=$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "${TEST_FILE}"
git add "${TEST_FILE}"
git commit -m "test: backup-restore verification marker [auto-cleanup]" --no-verify 2>/dev/null

if [ -f "${TEST_FILE}" ]; then
  log_result "Test file created and committed" "PASS"
else
  log_result "Test file created and committed" "FAIL"
fi

NEW_HASH=$(git rev-parse HEAD)
if [ "${NEW_HASH}" != "${INITIAL_HASH}" ]; then
  log_result "HEAD advanced after commit" "PASS"
else
  log_result "HEAD advanced after commit" "FAIL"
fi

# Step 4: Restore from backup tag
echo "Step 4: Restoring from backup tag..."
git reset --hard "${TEST_TAG}"

RESTORED_HASH=$(git rev-parse HEAD)
if [ "${RESTORED_HASH}" = "${INITIAL_HASH}" ]; then
  log_result "HEAD restored to backup tag" "PASS"
else
  log_result "HEAD restored to backup tag" "FAIL"
fi

# Step 5: Verify test file is gone
echo "Step 5: Verifying restore..."
if [ ! -f "${TEST_FILE}" ]; then
  log_result "Test file removed after restore" "PASS"
else
  log_result "Test file removed after restore" "FAIL"
  rm -f "${TEST_FILE}"
fi

# Step 6: Verify integrity
echo "Step 6: Checking integrity..."
FINAL_HASH=$(git rev-parse HEAD)
if [ "${FINAL_HASH}" = "${INITIAL_HASH}" ]; then
  log_result "Repository integrity preserved" "PASS"
else
  log_result "Repository integrity preserved" "FAIL"
fi

# Verify git status is clean
if git diff --quiet && git diff --cached --quiet; then
  log_result "Working tree clean after restore" "PASS"
else
  log_result "Working tree clean after restore" "FAIL"
fi

# Step 7: Cleanup
echo "Step 7: Cleaning up..."
git tag -d "${TEST_TAG}" 2>/dev/null || true
if ! git tag -l "${TEST_TAG}" | grep -q "${TEST_TAG}"; then
  log_result "Test tag cleaned up" "PASS"
else
  log_result "Test tag cleaned up" "FAIL"
fi

# Summary
echo ""
echo "========================================="
echo " Results: ${PASS_COUNT} PASS, ${FAIL_COUNT} FAIL"
echo "========================================="

if [ "${FAIL_COUNT}" -gt 0 ]; then
  echo ""
  echo "FAILURES:"
  for result in "${RESULTS[@]}"; do
    if [[ "${result}" == FAIL:* ]]; then
      echo "  - ${result#FAIL: }"
    fi
  done
  exit 1
fi

echo ""
echo "All backup restore tests PASSED."
exit 0
