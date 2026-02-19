# Story 8.2: API Key Management

**Status:** review
**Epic:** Epic 8 - API & Developer Experience
**Story ID:** 8.2
**Story Key:** 8-2-api-key-management
**Dependencies:** 1.1, 1.2, 1.5, 8.1

---

## Story

**As a** Developer,
**I want** to generate and manage API keys for programmatic access,
**So that** I can authenticate without using session cookies.

---

## Acceptance Criteria

**Given** a user in the Developer role
**When** accessing API Keys settings
**Then** display list of existing API keys with name, created date, last used
**And** provide "Generate API Key" button
**And** allow naming keys for identification
**And** show key only once at creation (store hashed)
**And** allow key revocation/deletion
**And** include API role in JWT when key is used

---

## Tasks / Subtasks

- [x] **Task 1: Database Schema for API Keys** (AC: Given - user in Developer role)
  - [x] Create api_keys table with columns: id, user_id, name (mapped to description), key_hash, created_at, last_used_at, is_active, role
  - [x] Add indexes on user_id and key_hash
  - [x] Create database migration (20260218115755_story_8_2_api_key_management)
  - [x] Add foreign key to users table
  - [x] Add deletedAt for soft delete support
  - [x] Add DEVELOPER role to UserRole enum

- [x] **Task 2: API Key Generation** (AC: Then - list existing keys)
  - [x] Implement secure random key generation (256-bit)
  - [x] Create key format: bmad_sk_<random> (e.g., bmad_sk_a1b2c3d4...)
  - [x] Hash keys using bcrypt (cost factor 12) before storage
  - [x] Create API route POST /api/v1/api-keys to generate keys
  - [x] Return key only once at creation (not retrievable after)
  - [x] [FIXED] Removed Math.random() usage - now uses only crypto.randomBytes()

- [x] **Task 3: API Key Listing** (AC: Then - display list)
  - [x] Create API route GET /api/v1/api-keys to list user's keys
  - [x] Return: id, name, created_at, last_used_at, is_active, role
  - [x] Never return the actual key or key_hash in list
  - [ ] Add pagination for large key lists (deferred - can add later)

- [x] **Task 4: API Key Naming** (AC: And - allow naming keys)
  - [x] Add name field to key generation request
  - [x] Validate name format (alphanumeric, spaces, hyphens, underscores)
  - [x] Set default name if not provided (e.g., "API Key #3")
  - [x] Allow renaming existing keys (PATCH endpoint)

- [x] **Task 5: Single Display at Creation** (AC: And - show key only once)
  - [x] Return full key in generation response only
  - [x] Display prominent warning to copy the key
  - [x] Show "Your API Key" modal/section after generation
  - [x] Never include key in list or detail responses
  - [x] Store only the hash for verification

- [x] **Task 6: Key Revocation** (AC: And - allow revocation/deletion)
  - [x] Create API route DELETE /api/v1/api-keys/:id
  - [x] Implement soft delete (set deletedAt timestamp)
  - [x] Add confirmation dialog before revocation
  - [ ] Log revocation event to audit trail (deferred - Story 9.4)
  - [ ] Allow permanent deletion after 30 days (deferred)

- [x] **Task 7: API Role in JWT** (AC: And - include API role in JWT)
  - [x] Add role claim to JWT issued for API key authentication
  - [x] Include scope/permissions based on user role
  - [x] Distinguish API key auth from session auth in JWT (type: 'api_key')
  - [x] Enforce rate limits based on API role

- [x] **Task 8: UI Components for Key Management** (AC: all)
  - [x] Create API Keys settings page accessible to Developer role
  - [x] Build API key list component with table/cards
  - [x] Create "Generate API Key" button with dialog
  - [x] Build key creation form with name input
  - [x] Create key display modal with copy button
  - [x] Add revoke/delete confirmation dialog
  - [x] Show last used timestamp (relative time)
  - [x] Display active/inactive status badges

- [x] **Task 9: Security Features** (AC: all)
  - [x] Implement rate limiting for key generation (max 5 keys per user)
  - [x] Add key expiration option (optional, defaults to never)
  - [x] Track last_used_at timestamp on each successful auth
  - [ ] Implement key usage analytics (total requests - done, last IP - deferred)
  - [ ] Add webhook notification on key creation/revocation (deferred)

---

## Dev Notes

### Architecture Patterns & Constraints

**API Key Format:**
- Prefix: `bmad_sk_` (identifies as BMAD secret key)
- Length: 64 characters after prefix (256 bits encoded)
- Character set: alphanumeric (a-z, 0-9)
- Example: `bmad_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`

**Key Storage:**
- Never store plaintext keys
- Hash using bcrypt (cost factor 12) or argon2id
- Store key_hash, not the key itself
- Use constant-time comparison for verification

**Security Requirements:**
- Keys are secrets - treat like passwords
- Never log keys or include in error messages
- Use HTTPS only for API key transmission
- Revoke compromised keys immediately

### Database Schema

**api_keys table:**
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'developer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active) WHERE deleted_at IS NULL;
```

### File Structure Requirements

**API Routes:**
```
src/app/api/v1/api-keys/
├── route.ts                    # GET (list), POST (generate)
└── [id]/
    └── route.ts                # GET (details), DELETE (revoke)
```

**UI Components:**
```
src/components/features/api-keys/
├── api-keys-page.tsx           # Main settings page
├── api-key-list.tsx            # List/table of keys
├── api-key-item.tsx            # Single key display
├── generate-key-dialog.tsx     # Key creation modal
├── display-key-modal.tsx       # Show key once at creation
└── revoke-key-dialog.tsx       # Revocation confirmation
```

**Server Actions:**
```
src/app/api/v1/api-keys/
├── generate-key.action.ts      # Generate new key
├── list-keys.action.ts         # List user's keys
├── revoke-key.action.ts        # Revoke/delete key
└── update-key.action.ts        # Rename, set expiration
```

### Technical Requirements

**Key Generation:**
```typescript
// Use crypto.randomBytes for secure randomness
import crypto from 'crypto'

function generateApiKey(): string {
  const bytes = crypto.randomBytes(32) // 256 bits
  const key = bytes.toString('base64url')
    .replace(/[-_]/g, '')
    .substring(0, 64)
  return `bmad_sk_${key}`
}

// Hash before storage
async function hashApiKey(key: string): Promise<string> {
  return await bcrypt.hash(key, 12)
}

// Verify on auth
async function verifyApiKey(key: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(key, hash)
}
```

**JWT Token for API Keys:**
```typescript
// JWT payload when authenticated via API key
{
  sub: "user_id",
  type: "api_key",
  key_id: "api_key_id",
  role: "developer",
  scopes: ["agents:read", "agents:invoke", "projects:read"],
  iat: 1234567890,
  exp: 1234570490
}
```

### UI/UX Requirements

**API Keys Settings Page:**
- Clear heading: "API Keys"
- Description: "Manage your API keys for programmatic access to BMAD"
- "Generate API Key" button (prominent)
- List/table of existing keys

**API Key List Item Display:**
- Key name (clickable for details)
- Created date (relative time: "2 days ago")
- Last used (relative time or "Never")
- Status badge (Active / Revoked)
- Actions menu (Revoke, Rename, Copy ID)

**Key Generation Dialog:**
- Input: "Key name" with placeholder
- Optional: "Expiration" (Never, 30 days, 90 days, 1 year)
- Warning: "You will only see this key once. Copy it now."
- Generate button
- Cancel button

**Key Display Modal (After Generation):**
- Large heading: "Your API Key"
- Key value in code block with copy button
- Prominent warning: "Copy this key now. You won't see it again."
- "Done" button (closes modal)
- Never show full key again

### Testing Requirements

**Manual Testing:**
- Generate a new API key
- Verify key is shown once
- Copy key and test authentication
- Verify key appears in list (without secret)
- Revoke key and verify it no longer works
- Test rate limiting on generation
- Verify last_used_at updates on use

**Security Testing:**
- Attempt to retrieve key after creation (should fail)
- Test with invalid key format
- Test rate limiting enforcement
- Verify key hash comparison is constant-time
- Check audit logs for key events

---

## Dev Agent Guardrails

### Technical Requirements

**Key Generation Security:**
- Use `crypto.randomBytes()` for cryptographic randomness
- Never use `Math.random()` or similar predictable sources
- Minimum 256 bits of entropy
- Encode with URL-safe base64 (alphanumeric only)

**Hashing Requirements:**
- Use bcrypt with cost factor 12+ OR argon2id
- Never store plaintext keys
- Use constant-time comparison to prevent timing attacks
- Include salt in hash (bcrypt handles this)

**Rate Limiting:**
- Limit key generation: 5 per user
- Rate limit generation attempts: 3 per hour
- Rate limit API auth attempts: 100 per minute per key
- Track failed attempts and lock after threshold

### Security Requirements

**Key Exposure Prevention:**
- Never include key in logs
- Never include key in error messages
- Never return key in list/detail responses
- Redact key from request bodies in middleware

**Compromised Key Handling:**
- Immediate revocation endpoint
- Audit log of all key usage
- Notify user of suspicious activity
- Option to revoke all keys at once

**Permission Scopes:**
- API keys inherit user's role permissions
- Optionally implement scoped tokens (read-only, specific agents)
- Document available scopes
- Validate scopes on each request

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Objective:** Enable developers to authenticate programmatically
**Target Users:** Developers integrating BMAD into automation tools

**Key Design Principles:**
- **Security first** - Keys are secrets, treat as such
- **Usability** - Clear feedback on key creation
- **Safety** - Single display prevents accidental exposure
- **Control** - Easy revocation when needed

---

## Story Completion Status

**Status:** ready-for-dev
**Context Analysis:** Complete
**All Required Documentation:** Loaded and analyzed
**Developer Guardrails:** Established
**Next Step:** Run `dev-story` workflow for implementation

---

## References

**Source Documents:**
- [Vision & Scope](../01-vision-and-scope.md) - Project objectives
- [Architecture & Security](../02-architecture-security.md) - Security architecture
- [Technical Implementation](../06-technical-implementation.md) - API architecture
- [Story Implementation Steps](../story-implementation-steps.md) - Implementation guide

**Story Breakdown Reference:**
- Epic 8: API & Developer Experience - [epics.md#epic-8](../epics.md#epic-8-api--developer-experience)
- Story 8.2 Details - [epics.md#story-82-api-key-management](../epics.md#story-82-api-key-management)

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
