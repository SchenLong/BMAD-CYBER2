# CRITICAL INFRASTRUCTURE FIXES

## Issue #1 & #4: S3 Client Initialization + AWS SDK Mocking

**Problem:** Tests fail with `Could not load credentials from any providers` when trying to initialize S3 client.

**Fix:** Add AWS SDK mocking to test setup in `tests/integration/end-to-end-pipeline.test.ts`:

```typescript
// Add after line 68 (after path-utils mock):
// Mock AWS SDK to prevent credential errors
vi.doMock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({ Body: null }),
  })),
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
  GetObjectLockConfigurationCommand: vi.fn(),
}));
```

## Issue #2: S3 Error Handling Contract Violation

**Problem:** Test expects `archiveLogs()` to throw S3 errors but it returns `{success: false}`.

**Fix:** Modify error handling in `src/observability/log-archiver.ts` line 305-313:

**Current:**
```typescript
    } catch (error) {
      return {
        success: false,
        archiveId,
        metadata: this.createEmptyArchiveMetadata(archiveId, startDate, endDate),
        s3Location: '',
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
```

**Fixed:**
```typescript
    } catch (error) {
      // Re-throw S3 archival errors to caller for proper error handling
      if (error instanceof S3ArchivalError) {
        throw error;
      }

      // For other errors, return error result for non-critical failures
      return {
        success: false,
        archiveId,
        metadata: this.createEmptyArchiveMetadata(archiveId, startDate, endDate),
        s3Location: '',
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
```

## Issue #3: Environment Variable Bug

**Problem:** Test expects `isEncryptionEnabled()` to return `false` when `BMAD_AUDIT_ENCRYPTION_KEY` is deleted, but `BMAD_AUDIT_ENCRYPTION_ENABLED=true` persists from beforeEach.

**Fix:** Modify test in `tests/integration/p2-validation.test.ts` line 227:

**Current:**
```typescript
      // Test with encryption disabled
      delete process.env.BMAD_AUDIT_ENCRYPTION_KEY;
      vi.resetModules();
```

**Fixed:**
```typescript
      // Test with encryption disabled
      delete process.env.BMAD_AUDIT_ENCRYPTION_KEY;
      delete process.env.BMAD_AUDIT_ENCRYPTION_ENABLED;
      vi.resetModules();
```

## Validation

After applying these fixes:

1. AWS SDK mocking will prevent credential loading errors
2. S3 errors will properly throw instead of returning error objects
3. Encryption detection will work correctly when both variables are cleared

Run tests to verify all 3 critical issues are resolved:
```bash
cd .claude/validators-node
npm test
```