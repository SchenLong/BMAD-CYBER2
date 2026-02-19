# Story 9.4: Comprehensive Audit Logging

**Status:** done
**Epic:** Epic 9 - Security Hardening
**Story ID:** 9.4
**Story Key:** 9-4-comprehensive-audit-logging
**Dependencies:** Story 1.6 (Session Management), Story 1.1 (Project Scaffold)

---

## Story

**As a** Compliance Officer,
**I want** all sensitive operations logged with tamper evidence,
**So that** we have a complete audit trail for compliance.

---

## Acceptance Criteria

**Given** the audit logging system
**When** auditable events occur (auth, agent invocation, file ops, config changes)
**Then** log entry with: timestamp (ISO-8601), event_type, user, workflow/session, details, IP, user-agent
**And** maintain hash chain with previous entry hash for tamper evidence
**And** store logs in append-only format (no modifications)
**And** provide audit log retrieval API for admins
**And** support log export for compliance reporting
**And** retain logs per retention policy

---

## Tasks / Subtasks

- [ ] **Task 1: Create Database Schema** (AC: Given - audit logging system)
  - [ ] Create AuditLog Prisma model
  - [ ] Define AuditAction enum with all event types
  - [ ] Add indexes for query performance (userId, action, createdAt)
  - [ ] Create AuditLogArchive model for old logs
  - [ ] Run database migration

- [ ] **Task 2: Implement Audit Logger Core** (AC: When - auditable events occur, Then - log entry details)
  - [ ] Create `src/lib/security/audit-logger.ts`
  - [ ] Create AuditLogger class with singleton pattern
  - [ ] Implement `log(entry: AuditLogEntry): Promise<void>` method
  - [ ] Add timestamp in ISO-8601 format
  - [ ] Extract user from context/session
  - [ ] Extract IP and user-agent from request
  - [ ] Implement hash chain (previous entry hash)
  - [ ] Write to append-only log file and database

- [ ] **Task 3: Define Audit Event Types** (AC: When - auth, agent invocation, file ops, config changes)
  - [ ] Define Authentication events: LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, MFA_ENABLED, PASSWORD_CHANGED
  - [ ] Define Authorization events: PERMISSION_GRANTED, PERMISSION_REVOKED, ROLE_CHANGED
  - [ ] Define Data Access events: PROJECT_ACCESSED, WORKFLOW_EXECUTED, AGENT_INVOKED, ARTIFACT_DOWNLOADED, FILE_UPLOADED
  - [ ] Define Security events: SUSPICIOUS_ACTIVITY_DETECTED, INJECTION_ATTEMPT_BLOCKED, RATE_LIMIT_EXCEEDED
  - [ ] Define Configuration events: SYSTEM_CONFIG_CHANGED, AGENT_CONFIG_UPDATED

- [ ] **Task 4: Implement Hash Chain for Tamper Evidence** (AC: And - maintain hash chain)
  - [ ] Generate SHA-256 hash for each log entry
  - [ ] Store previousEntryHash on each entry
  - [ ] Implement hash chain verification function
  - [ ] Detect and report chain breaks
  - [ ] Create integrity report endpoint

- [ ] **Task 5: Implement Append-Only Storage** (AC: And - store in append-only format)
  - [ ] Create append-only log file writer
  - [ ] Log entries to structured JSON file
  - [ ] Implement file rotation (daily)
  - [ ] Store in secure directory with restricted permissions
  - [ ] Never allow UPDATE or DELETE on audit logs

- [ ] **Task 6: Create Audit Log API** (AC: And - provide retrieval API for admins)
  - [ ] Create `src/app/api/admin/audit/logs/route.ts`
  - [ ] Implement GET endpoint with filters (userId, action, date range)
  - [ ] Require ADMIN or SUPER_ADMIN role
  - [ ] Implement pagination (limit/offset)
  - [ ] Add export endpoint (CSV, JSON)
  - [ ] Add hash verification endpoint

- [ ] **Task 7: Implement Log Export** (AC: And - support log export for compliance)
  - [ ] Create export service
  - [ ] Support JSON format export
  - [ ] Support CSV format export
  - [ ] Support date range filtering
  - [ ] Generate export filename with timestamp
  - [ ] Sign exports with digital signature

- [ ] **Task 8: Implement Retention Policy** (AC: And - retain logs per retention policy)
  - [ ] Create `src/lib/security/retention.ts`
  - [ ] Define retention periods (SOC2: 7 years, ISO27001: 3 years)
  - [ ] Implement archive job (move old logs to cold storage)
  - [ ] Implement cleanup job (delete expired archives)
  - [ ] Schedule jobs with cron/background worker
  - [ ] Log retention actions

- [ ] **Task 9: Create Audit Helper Functions** (AC: All)
  - [ ] Create `logAuth()` helper
  - [ ] Create `logAuthz()` helper
  - [ ] Create `logDataAccess()` helper
  - [ ] Create `logSecurity()` helper
  - [ ] Create `logConfig()` helper
  - [ ] Export all helpers from barrel file

- [ ] **Task 10: Write Unit Tests** (AC: All)
  - [ ] Test log entry creation
  - [ ] Test hash chain generation
  - [ ] Test hash chain verification
  - [ ] Test append-only storage
  - [ ] Test query functionality
  - [ ] Test export functionality

- [ ] **Task 11: Write Integration Tests** (AC: All)
  - [ ] Test end-to-end logging flow
  - [ ] Test audit API endpoints
  - [ ] Test export functionality
  - [ ] Test retention policy enforcement
  - [ ] Test tamper detection

- [ ] **Task 12: Documentation & Verification** (AC: All)
  - [ ] Document all event types
  - [ ] Create API documentation
  - [ ] Create compliance framework mapping (SOC2, ISO27001, HIPAA, GDPR)
  - [ ] Document retention periods
  - [ ] Create audit log review procedures
  - [ ] Verify 100% pass rate on tests

---

## Dev Notes

### Architecture Patterns & Constraints

**Audit Logging Architecture:**
```
Event -> Audit Logger -> Database + Append-Only File -> Hash Chain -> Verification
```

**Database Schema:**
```prisma
model AuditLog {
  id          String      @id @default(cuid())
  userId      String?
  action      AuditAction
  resource    String?
  resourceId  String?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  success     Boolean
  reason      String?
  previousHash String?    // For hash chain
  entryHash   String?     // This entry's hash
  createdAt   DateTime    @default(now())

  user        User?       @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

enum AuditAction {
  // Authentication
  LOGIN_SUCCESS
  LOGIN_FAILURE
  LOGOUT
  MFA_ENABLED
  MFA_DISABLED
  MFA_VERIFIED
  PASSWORD_CHANGED
  PASSWORD_RESET_REQUESTED
  PASSWORD_RESET_COMPLETED
  ACCOUNT_CREATED
  ACCOUNT_DELETED

  // Authorization
  PERMISSION_GRANTED
  PERMISSION_REVOKED
  ROLE_CHANGED

  // Data Access
  PROJECT_ACCESSED
  WORKFLOW_EXECUTED
  AGENT_INVOKED
  ARTIFACT_DOWNLOADED
  FILE_UPLOADED

  // Security
  SUSPICIOUS_ACTIVITY_DETECTED
  INJECTION_ATTEMPT_BLOCKED
  RATE_LIMIT_EXCEEDED

  // Configuration
  SYSTEM_CONFIG_CHANGED
  AGENT_CONFIG_UPDATED
}
```

**Hash Chain Structure:**
```typescript
entryHash = SHA256(previousEntryHash + entryData + timestamp)
```

### File Structure Requirements

**Must-Create Files:**
1. `src/lib/security/audit-logger.ts` - Core audit logger
2. `src/lib/security/retention.ts` - Retention management
3. `src/lib/security/compliance.ts` - Compliance framework support
4. `src/app/api/admin/audit/logs/route.ts` - Audit API
5. `src/app/api/admin/audit/export/route.ts` - Export API
6. `src/app/api/admin/audit/verify/route.ts` - Verification API
7. `tests/security/audit-logger.test.ts` - Unit tests
8. `tests/integration/audit-api.test.ts` - Integration tests

**Log Storage:**
```
data/
├── audit/
│   ├── audit-2024-01-01.log
│   ├── audit-2024-01-02.log
│   └── .gitkeep
```

### Testing Requirements

**Test Cases:**
```typescript
// Test log entry creation
await auditLogger.log({
  userId: 'user-123',
  action: 'LOGIN_SUCCESS',
  ipAddress: '192.168.1.1',
  success: true,
})
// => Verify database entry created
// => Verify file log entry created
// => Verify hash chain intact

// Test hash chain verification
const verified = await verifyAuditLogs(startDate, endDate)
// => Should return true for unmodified logs

// Test tamper detection
// Modify a log entry
// => Verification should fail
```

**API Test Scenarios:**
- GET /api/admin/audit/logs with filters
- GET /api/admin/audit/logs with pagination
- GET /api/admin/audit/export (JSON, CSV)
- GET /api/admin/audit/verify

### Security Considerations

**Tamper Evidence:**
- Hash chain ensures any modification is detectable
- Verification endpoint for integrity checks
- Alerts on chain breaks

**Access Control:**
- Only admins can access audit logs
- Audit access to audit logs (meta-logging)
- IP restrictions for audit endpoints

**Retention Compliance:**
- SOC2: 7 years retention
- ISO27001: 3 years retention
- HIPAA: 6 years retention
- GDPR: 1 year minimum

**Data Privacy:**
- Sanitize sensitive data in logs
- Don't log passwords, tokens, or full request bodies
- Mask IP addresses if required by policy

---

## Dev Agent Guardrails

### Technical Requirements

**AuditLogEntry Interface:**
```typescript
interface AuditLogEntry {
  userId?: string
  action: AuditAction
  resource?: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success: boolean
  reason?: string
}
```

**Helper Function Signatures:**
```typescript
async logAuth(data: {
  userId?: string
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'MFA_ENABLED' | 'PASSWORD_CHANGED'
  ipAddress?: string
  userAgent?: string
  success: boolean
  reason?: string
}): Promise<void>

async logAuthz(data: {
  userId: string
  action: 'PERMISSION_GRANTED' | 'PERMISSION_REVOKED' | 'ROLE_CHANGED'
  resource: string
  resourceId: string
  metadata?: Record<string, any>
  ipAddress?: string
}): Promise<void>

async logDataAccess(data: {
  userId: string
  action: 'PROJECT_ACCESSED' | 'WORKFLOW_EXECUTED' | 'ARTIFACT_DOWNLOADED' | 'FILE_UPLOADED'
  resource: string
  resourceId: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}): Promise<void>

async logSecurity(data: {
  userId?: string
  action: 'SUSPICIOUS_ACTIVITY_DETECTED' | 'INJECTION_ATTEMPT_BLOCKED' | 'RATE_LIMIT_EXCEEDED'
  resource?: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}): Promise<void>
```

### Architecture Compliance

**Integration Points:**
```typescript
// Authentication flow
export async function POST(req: NextRequest) {
  const result = await authenticateUser(credentials)
  await logAuth({
    userId: result.user?.id,
    action: result.success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
    ipAddress: getClientIp(req),
    userAgent: req.headers.get('user-agent'),
    success: result.success,
    reason: result.error,
  })
  return result
}

// Prompt injection detection
if (injectionDetected) {
  await logSecurity({
    action: 'INJECTION_ATTEMPT_BLOCKED',
    ipAddress: getClientIp(req),
    severity: result.severity,
    metadata: { score: result.score },
  })
}
```

**Query Interface:**
```typescript
async query(filters: {
  userId?: string
  action?: AuditAction
  resource?: string
  resourceId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}): Promise<AuditLog[]>
```

### Library/Framework Requirements

**Dependencies:**
```json
{
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "crypto": "native"
  }
}
```

**Hash Implementation:**
```typescript
import crypto from 'crypto'

function generateEntryHash(
  previousHash: string | null,
  data: any,
  timestamp: Date
): string {
  const content = JSON.stringify({
    previous: previousHash || '',
    data,
    timestamp: timestamp.toISOString(),
  })
  return crypto.createHash('sha256').update(content).digest('hex')
}
```

### File Structure Requirements

**Export Structure:**
```typescript
// src/lib/security/audit-logger.ts
export class AuditLogger {...}
export const auditLogger = new AuditLogger()
export const logAuth = (data) => auditLogger.logAuth(data)
export const logAuthz = (data) => auditLogger.logAuthz(data)
export const logDataAccess = (data) => auditLogger.logDataAccess(data)
export const logSecurity = (data) => auditLogger.logSecurity(data)

// src/lib/security/compliance.ts
export const COMPLIANCE_FRAMEWORKS = {...}
export function getComplianceRequirements(frameworks): ComplianceConfig
export async function generateComplianceReport(framework, start, end): Promise<ComplianceReport>

// src/lib/security/retention.ts
export class RetentionManager {...}
export const retentionManager = new RetentionManager()
```

### Testing Requirements

**Test Structure:**
```typescript
describe('Audit Logger', () => {
  describe('Log Entry Creation', () => {
    it('should create log entry with all fields')
    it('should generate hash chain')
    it('should write to database')
    it('should write to file')
  })

  describe('Hash Chain', () => {
    it('should verify unmodified chain')
    it('should detect tampering')
    it('should maintain chain integrity')
  })

  describe('Query', () => {
    it('should filter by userId')
    it('should filter by action')
    it('should filter by date range')
    it('should paginate results')
  })

  describe('Retention', () => {
    it('should archive old logs')
    it('should delete expired logs')
    it('should enforce compliance requirements')
  })
})
```

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic:** Security Hardening (Epic 9)

**Compliance Frameworks:**
- SOC 2 Type II - 7 year retention
- ISO 27001 - 3 year retention
- HIPAA - 6 year retention (if handling PHI)
- GDPR - 1 year minimum retention
- PCI DSS - 1 year retention

**Audit Events by Category:**
1. **Authentication** - Logins, logouts, MFA, password changes
2. **Authorization** - Permission grants, role changes
3. **Data Access** - Project access, workflow execution, file operations
4. **Security** - Injection attempts, rate limits, suspicious activity
5. **Configuration** - System changes, agent configuration

**Integration Points:**
- Story 9.2: Logs prompt injection attempts
- Story 9.3: Logs flagged outputs
- Story 9.7: Logs rate limit violations

---

## Story Completion Status

**Status:** done
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Next Step:** Run `dev-story` workflow for implementation

---

## References

**Source Documents:**
- [Security Deep Dive](../11-security-deep-dive.md#4-audit-logging--compliance) - Audit logging implementation
- [Architecture & Security](../02-architecture-security.md) - Security architecture overview
- [Epic 9 Details](../epics.md#story-94-comprehensive-audit-logging) - Story requirements

**Story Breakdown Reference:**
- Epic 9: Security Hardening - [epics.md#epic-9](../epics.md#epic-9-security-hardening)
- Story 9.4 Details - [epics.md#story-94-comprehensive-audit-logging](../epics.md#story-94-comprehensive-audit-logging)

**Depends On:**
- Story 1.6: Session Management
- Story 1.1: Project Scaffold & Base Configuration

**Enables:**
- Story 9.5: Security Headers & CORS
- Story 9.6: Input Validation Layer
- Story 9.7: Rate Limiting

---

## Dev Agent Record

### Agent Model Used
*To be filled by Dev agent during implementation*

### Debug Log References
*To be filled by Dev agent during implementation*

### Completion Notes List
*To be filled by Dev agent during implementation*

### File List
*To be filled by Dev agent during implementation*
