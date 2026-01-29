# Stdin Hang Fix - Working Document

## Issue
Task tool hanging during execution due to async stdin reading in validators.

## Root Cause
Four validators use `for await (const chunk of process.stdin)` which blocks indefinitely waiting for EOF if stdin doesn't close properly during Claude Code hook execution.

## Affected Files
- [x] rate-limiter.ts - lines 555-612 - FIXED
- [x] recursion-guard.ts - lines 532-607 - FIXED
- [x] resource-limits.ts - lines 576-end - FIXED
- [x] context-manager.ts - lines 490-end - FIXED

## Fix Pattern
Convert from async stdin to sync using `getToolInputFromStdinSync()` - same pattern used by 10+ other validators.

## Changes Log

### 2026-01-28: rate-limiter.ts
- Changed `validateRateLimit` from async to sync
- Replaced manual stdin reading with `getToolInputFromStdinSync()`
- Updated `main()` to call directly instead of `.then()`
- Added import for `getToolInputFromStdinSync`

### 2026-01-28: recursion-guard.ts
- Changed `validateRecursion` from async to sync
- Replaced manual stdin reading with `getToolInputFromStdinSync()`
- Updated `main()` to call directly instead of `.then()`
- Added import for `getToolInputFromStdinSync`

### 2026-01-28: resource-limits.ts
- Changed `validateResourceLimits` from async to sync
- Replaced manual stdin reading with `getToolInputFromStdinSync()`
- Updated `main()` to call directly instead of `.then()`
- Added import for `getToolInputFromStdinSync`

### 2026-01-28: context-manager.ts
- Changed `validateContextCapacity` from async to sync
- Replaced manual stdin reading with `getToolInputFromStdinSync()`
- Updated `main()` to call directly instead of `.then()`
- Added import for `getToolInputFromStdinSync`

## Testing
```bash
npm test -- --grep "rate-limiter"
npm test -- --grep "recursion-guard"
npm test -- --grep "resource-limits"
npm test -- --grep "context-manager"
```

## Rollback
If issues occur, revert to async pattern with added timeout wrapper as fallback.

## Status: COMPLETE
All four validators have been converted from async to sync stdin reading.

## Test Results
All 109 tests pass:
- rate-limiter.test.ts: 23 tests passed
- recursion-guard.test.ts: 28 tests passed
- resource-limits.test.ts: 25 tests passed
- context-manager.test.ts: 33 tests passed
