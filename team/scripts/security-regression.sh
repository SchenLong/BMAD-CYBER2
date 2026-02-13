#!/bin/bash
# Security Regression Quick Check (Tier 1)
# Target: <10 seconds, for pre-commit validation
# Complements: tests/regression/security/phase2-security-regression.test.js
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SETTINGS="$PROJECT_ROOT/.claude/settings.json"
ERRORS=0

echo "=== Security Regression Quick Check ==="

# Check 1: settings.json exists and is valid JSON
if [ ! -f "$SETTINGS" ]; then
  echo "FAIL: settings.json not found"
  ERRORS=$((ERRORS + 1))
else
  if ! python3 -c "import json; json.load(open('$SETTINGS'))" 2>/dev/null; then
    echo "FAIL: settings.json is not valid JSON"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: settings.json exists and is valid JSON"
  fi
fi

# Check 2: Hook count >= 54
if [ -f "$SETTINGS" ]; then
  HOOK_COUNT=$(python3 -c "
import json
settings = json.load(open('$SETTINGS'))
count = 0
for event, handlers in settings.get('hooks', {}).items():
    if isinstance(handlers, list):
        for h in handlers:
            count += len(h.get('hooks', []))
    else:
        count += len(handlers.get('hooks', []))
print(count)
" 2>/dev/null || echo "0")
  if [ "$HOOK_COUNT" -lt 54 ]; then
    echo "FAIL: Hook count $HOOK_COUNT < 54"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: Hook count $HOOK_COUNT >= 54"
  fi
fi

# Check 3: Matcher count >= 12
if [ -f "$SETTINGS" ]; then
  MATCHER_COUNT=$(python3 -c "
import json
settings = json.load(open('$SETTINGS'))
matchers = set()
for handler in settings.get('hooks', {}).get('PreToolUse', []):
    if 'matcher' in handler:
        matchers.add(handler['matcher'])
print(len(matchers))
" 2>/dev/null || echo "0")
  if [ "$MATCHER_COUNT" -lt 12 ]; then
    echo "FAIL: Matcher count $MATCHER_COUNT < 12"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: Matcher count $MATCHER_COUNT >= 12"
  fi
fi

# Check 4: Spot-check 10 critical validator files exist
CRITICAL_FILES=(
  ".claude/validators-node/bin/bash-safety.js"
  ".claude/validators-node/bin/env-protection.js"
  ".claude/validators-node/bin/jailbreak.js"
  ".claude/validators-node/bin/pii.js"
  ".claude/validators-node/bin/prompt-injection.js"
  ".claude/validators-node/bin/secret.js"
  ".claude/validators-node/bin/supply-chain.js"
  ".claude/validators-node/bin/settings-integrity.js"
  "src/core/security/authorization.js"
  ".claude/validators-node/bin/outside-repo.js"
)

FILE_ERRORS=0
for FILE in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$PROJECT_ROOT/$FILE" ]; then
    echo "FAIL: Critical file missing: $FILE"
    FILE_ERRORS=$((FILE_ERRORS + 1))
  fi
done
if [ $FILE_ERRORS -eq 0 ]; then
  echo "PASS: All 10 critical validator files exist"
else
  ERRORS=$((ERRORS + FILE_ERRORS))
fi

# Check 5: settings-integrity.js passes
if node "$PROJECT_ROOT/.claude/validators-node/bin/settings-integrity.js" > /dev/null 2>&1; then
  echo "PASS: settings-integrity.js validation passed"
else
  echo "FAIL: settings-integrity.js validation failed"
  ERRORS=$((ERRORS + 1))
fi

# Check 6: authorization.js exists and is non-empty
AUTH_FILE="$PROJECT_ROOT/src/core/security/authorization.js"
if [ ! -s "$AUTH_FILE" ]; then
  echo "FAIL: authorization.js missing or empty"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS: authorization.js exists and is non-empty"
fi

# Summary
echo ""
if [ $ERRORS -eq 0 ]; then
  echo "=== ALL CHECKS PASSED ==="
  exit 0
else
  echo "=== $ERRORS CHECK(S) FAILED ==="
  exit 1
fi
