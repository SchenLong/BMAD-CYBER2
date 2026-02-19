# Story 1.4: Authentication - Multi-Factor Auth

**Status:** ready-for-dev
**Epic:** Epic 1 - Foundation & Authentication
**Story ID:** 1.4
**Story Key:** 1-4-authentication-multi-factor-auth
**Dependencies:** Story 1.1 (Project Scaffold & Base Configuration), Story 1.2 (Authentication System - Core)

---

## Story

**As an** Enterprise User,
**I want** to enable TOTP-based MFA for my account,
**So that** my account has an additional layer of security.

---

## Acceptance Criteria

**Given** an authenticated user account
**When** navigating to security settings and enabling MFA
**Then** generate TOTP secret with QR code for Google Authenticator
**And** verify user can successfully enter valid TOTP code
**And** require MFA on subsequent logins when enabled
**And** provide recovery codes for account recovery
**And** make MFA mandatory for Enterprise deployment, optional for Community

---

## Tasks / Subtasks

- [ ] **Task 1: MFA Database Schema** (AC: Then - generate TOTP secret, And - provide recovery codes)
  - [ ] Add MfaCredential model to Prisma schema
  - [ ] Define MfaFactor enum (TOTP, SMS, EMAIL, WEBAUTHN, BACKUP_CODE)
  - [ ] Add mfaEnabled field to User model
  - [ ] Add mfaFactors array field to User model
  - [ ] Create database migration for MFA tables
  - [ ] Generate Prisma client

- [ ] **Task 2: TOTP Secret Generation** (AC: Then - generate TOTP secret with QR code)
  - [ ] Install otplib package for TOTP generation
  - [ ] Create TOTP secret generation utility
  - [ ] Implement QR code URL generation
  - [ ] Install QR code generation library (qrcode)
  - [ ] Create QR code image generation endpoint
  - [ ] Encrypt TOTP secret before storage

- [ ] **Task 3: Backup Code Generation** (AC: And - provide recovery codes)
  - [ ] Create secure backup code generation utility
  - [ ] Generate 10 random backup codes per user
  - [ ] Encrypt backup codes before storage
  - [ ] Implement backup code verification logic
  - [ ] Implement one-time use backup code consumption

- [ ] **Task 4: MFA Setup API** (AC: Given - security settings, When - enabling MFA)
  - [ ] Create POST /api/auth/mfa/setup endpoint
  - [ ] Generate TOTP secret and return QR code
  - [ ] Store unverified MFA credential temporarily
  - [ ] Create POST /api/auth/mfa/verify endpoint
  - [ ] Verify TOTP code and mark MFA as enabled
  - [ ] Generate and return backup codes on successful setup

- [ ] **Task 5: MFA Login Flow** (AC: And - require MFA on subsequent logins)
  - [ ] Add MFA check to login flow
  - [ ] Create /api/auth/mfa/challenge endpoint
  - [ ] Create POST /api/auth/mfa/verify-login endpoint
  - [ ] Implement MFA verification page
  - [ ] Redirect to MFA verification after password auth
  - [ ] Store MFA verified state in session

- [ ] **Task 6: MFA UI Components** (AC: Given - security settings)
  - [ ] Create security settings page at `/app/(dashboard)/settings/security/page.tsx`
  - [ ] Create MFA setup component with QR code display
  - [ ] Create MFA verification form for setup
  - [ ] Create MFA login verification component
  - [ ] Create backup codes display and download component
  - [ ] Add MFA disable confirmation dialog

- [ ] **Task 7: MFA Management** (AC: When - navigating to security settings)
  - [ ] Create GET /api/auth/mfa/status endpoint
  - [ ] Create POST /api/auth/mfa/disable endpoint
  - [ ] Create POST /api/auth/mfa/regenerate-codes endpoint
  - [ ] Implement MFA status display in security settings
  - [ ] Show backup codes remaining count

- [ ] **Task 8: Enterprise vs Community Mode** (AC: And - mandatory for Enterprise)
  - [ ] Add DEPLOYMENT_MODE environment variable (enterprise/community)
  - [ ] Implement MFA requirement check for enterprise mode
  - [ ] Prevent login without MFA in enterprise mode
  - [ ] Allow optional MFA in community mode
  - [ ] Add deployment mode indicator to admin panel

- [ ] **Task 9: Testing & Verification** (All AC)
  - [ ] Test MFA setup flow with valid TOTP code
  - [ ] Test MFA setup with invalid TOTP code
  - [ ] Test login with MFA enabled (valid code)
  - [ ] Test login with MFA enabled (invalid code)
  - [ ] Test backup code generation and display
  - [ ] Test login with backup code
  - [ ] Test backup code one-time use
  - [ ] Test MFA disable functionality
  - [ ] Test enterprise mode requires MFA
  - [ ] Test community mode allows optional MFA
  - [ ] Verify TOTP secret is encrypted in database
  - [ ] Verify backup codes are encrypted in database

---

## Dev Notes

### Architecture Patterns & Constraints

**MFA Flow (from [Security Deep Dive](../11-security-deep-dive.md#25-mfa-implementation)):**

```
Setup Flow:
1. User navigates to Security Settings
2. User clicks "Enable MFA"
3. Server generates TOTP secret
4. Server returns QR code URL and secret
5. Client displays QR code
6. User scans with authenticator app
7. User enters TOTP code to verify
8. Server verifies code, enables MFA, generates backup codes
9. User saves backup codes

Login Flow with MFA:
1. User enters email/password
2. Server validates credentials
3. Server checks if MFA is enabled
4. If MFA enabled: redirect to MFA verification page
5. User enters TOTP code or backup code
6. Server verifies code
7. Server creates session with mfaVerified=true
8. User redirected to dashboard
```

**Database Schema (from [Security Deep Dive](../11-security-deep-dive.md#22-database-schema-for-authentication)):**

```prisma
enum MfaFactor {
  TOTP           // Time-based one-time password
  SMS            // SMS verification code
  EMAIL          // Email verification code
  WEBAUTHN       // Hardware security key / Passkey
  BACKUP_CODE    // Recovery codes
}

model User {
  // ... existing fields
  mfaEnabled    Boolean   @default(false)
  mfaFactors    MfaFactor[]
  mfaCredentials MfaCredential[]
}

model MfaCredential {
  id          String    @id @default(cuid())
  userId      String
  type        MfaFactor
  secret      String?   // Encrypted TOTP secret
  phoneNumber String?   // For SMS factors
  verified    Boolean   @default(false)
  backupCodes String[]  // Encrypted backup codes
  counter     Int?      // For HOTP
  credentialId String?  // For WebAuthn
  publicKey   String?   // For WebAuthn

  createdAt   DateTime  @default(now())
  lastUsedAt  DateTime?

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**TOTP Implementation (from [Security Deep Dive](../11-security-deep-dive.md#25-mfa-implementation)):**

```typescript
import { authenticator } from 'otplib'

export function generateTotpSecret(): string {
  return authenticator.generateSecret()
}

export function setupTotp(userId: string, email: string): TotpSetupResult {
  const secret = generateTotpSecret()
  const backupCodes = generateBackupCodes()
  const serviceName = process.env.APP_NAME || 'BMAD'
  const qrCodeUrl = authenticator.keyuri(email, serviceName, secret)

  return { secret, qrCodeUrl, backupCodes }
}

export function verifyTotp(token: string, secret: string): boolean {
  return authenticator.verify({
    token,
    secret,
    window: 2, // Allow 2 time steps before and after
  })
}
```

### Security Requirements

**TOTP Configuration:**
- **Algorithm**: SHA-1 (TOTP standard)
- **Digits**: 6
- **Period**: 30 seconds
- **Window**: 2 steps (allows ±60 seconds clock skew)

**Backup Code Requirements:**
- **Length**: 8 characters
- **Format**: Random hexadecimal (4 bytes = 8 hex chars)
- **Quantity**: 10 codes per user
- **Usage**: One-time use, consumed after use
- **Storage**: Encrypted at rest

**Encryption Requirements:**
- Encrypt TOTP secret with AES-256-GCM
- Encrypt backup codes individually
- Use environment-specific encryption keys
- Never display unencrypted secrets in logs

### Project Structure Notes

**MFA Files:**
```
src/
├── lib/
│   └── auth/
│       ├── mfa.ts                # TOTP utilities, backup codes
│       ├── encryption.ts         # Encryption utilities for secrets
│       └── validation.ts         # MFA input validation
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── mfa/
│   │           ├── setup/
│   │           │   └── route.ts      # POST - Initiate MFA setup
│   │           ├── verify/
│   │           │   └── route.ts      # POST - Verify TOTP during setup
│   │           ├── challenge/
│   │           │   └── route.ts      # GET - Get MFA challenge
│   │           ├── verify-login/
│   │           │   └── route.ts      # POST - Verify TOTP during login
│   │           ├── disable/
│   │           │   └── route.ts      # POST - Disable MFA
│   │           ├── regenerate-codes/
│   │           │   └── route.ts      # POST - Regenerate backup codes
│   │           └── status/
│   │               └── route.ts      # GET - Get MFA status
│   ├── (auth)/
│   │   └── mfa/
│   │       └── verify/
│   │           └── page.tsx          # MFA verification page during login
│   └── (dashboard)/
│       └── settings/
│           └── security/
│               └── page.tsx          # Security settings page
└── components/
    ├── auth/
    │   ├── mfa-setup.tsx             # MFA setup component
    │   ├── mfa-verify.tsx            # MFA login verification
    │   └── totp-input.tsx            # TOTP code input (6 digits)
    └── settings/
        ├── mfa-status.tsx            # MFA status display
        └── backup-codes.tsx          # Backup codes display
```

### Environment Variables

**Required Environment Variables:**
```env
# MFA Configuration
MFA_ENCRYPTION_KEY="your-32-byte-encryption-key-hex"
MFA_REQUIRED_FOR_ENTERPRISE="true"

# App name for TOTP QR code
APP_NAME="BMAD"

# Deployment mode
DEPLOYMENT_MODE="community"  # or "enterprise"
```

### Deployment Mode Behavior

**Enterprise Mode:**
- MFA is mandatory for all users
- New users must enable MFA before accessing dashboard
- Existing users prompted to enable MFA on next login
- Cannot disable MFA once enabled

**Community Mode:**
- MFA is optional
- Users can enable/disable MFA at will
- Users can access dashboard without MFA

---

## Dev Agent Guardrails

### Technical Requirements

**Dependencies to Install:**
```bash
npm install otplib           # TOTP generation/verification
npm install qrcode           # QR code generation
npm install @types/qrcode    # TypeScript types for qrcode
```

**Prisma Migration Commands:**
```bash
npx prisma migrate dev --name add_mfa_support
npx prisma generate
```

### Architecture Compliance

**Server Components vs Client Components:**
- MFA setup/verification forms: **Client Components** ("use client")
- Security settings page: **Server Component** with client components
- API routes: Server-side only
- QR code generation: Server-side (API endpoint)

**MFA Setup Flow:**
1. User visits security settings
2. User clicks "Enable MFA"
3. Client calls POST /api/auth/mfa/setup
4. Server generates secret, returns QR code URL
5. Client displays QR code (calls QR image API)
6. User scans with authenticator app
7. User enters 6-digit code
8. Client calls POST /api/auth/mfa/verify with code
9. Server verifies code, enables MFA, returns backup codes
10. Client displays backup codes (one-time)

**MFA Login Flow:**
1. User submits credentials
2. Server validates credentials
3. Server checks mfaEnabled flag
4. If enabled: return redirect to /mfa/verify with temp token
5. User visits /mfa/verify
6. User enters TOTP code or backup code
7. Client calls POST /api/auth/mfa/verify-login
8. Server verifies code, creates session with mfaVerified=true
9. Client redirects to dashboard

### File Structure Requirements

**Must-Create Files:**
1. `prisma/schema.prisma` - Add MfaCredential model, MfaFactor enum
2. `src/lib/auth/mfa.ts` - TOTP utilities
3. `src/lib/auth/encryption.ts` - Encryption utilities
4. `src/app/api/auth/mfa/setup/route.ts` - MFA setup endpoint
5. `src/app/api/auth/mfa/verify/route.ts` - MFA verification endpoint
6. `src/app/api/auth/mfa/challenge/route.ts` - Challenge endpoint
7. `src/app/api/auth/mfa/verify-login/route.ts` - Login verification endpoint
8. `src/app/api/auth/mfa/disable/route.ts` - Disable MFA endpoint
9. `src/app/api/auth/mfa/status/route.ts` - MFA status endpoint
10. `src/app/(auth)/mfa/verify/page.tsx` - MFA verification page
11. `src/app/(dashboard)/settings/security/page.tsx` - Security settings
12. `src/components/auth/mfa-setup.tsx` - MFA setup component
13. `src/components/auth/mfa-verify.tsx` - MFA verification component
14. `src/components/auth/totp-input.tsx` - TOTP input component

**Modified Files:**
1. `src/app/api/auth/login/route.ts` - Add MFA check
2. `src/middleware.ts` - Handle MFA verification redirect
3. `prisma/schema.prisma` - Add MFA-related models

### Testing Requirements

**Manual Testing Checklist:**
- [ ] Navigate to security settings
- [ ] Click "Enable MFA" → QR code displayed
- [ ] Scan QR code with Google Authenticator
- [ ] Enter valid 6-digit code → MFA enabled, backup codes shown
- [ ] Enter invalid code → Error message
- [ ] Save backup codes → Can download or copy
- [ ] Log out
- [ ] Log in with credentials → Redirected to MFA verification
- [ ] Enter valid TOTP code → Logged in
- [ ] Enter invalid TOTP code → Error message
- [ ] Log out
- [ ] Log in with credentials, use backup code → Logged in
- [ ] Log in again, try same backup code → Error (already used)
- [ ] Navigate to security settings
- [ ] Disable MFA → MFA disabled
- [ ] Log in → No MFA prompt
- [ ] Enable MFA again → Works

**Security Verification:**
- [ ] TOTP secret is encrypted in database
- [ ] Backup codes are encrypted in database
- [ ] QR code URL uses HTTPS
- [ ] TOTP window allows ±60 seconds
- [ ] Backup codes are one-time use
- [ ] MFA cannot be bypassed when enabled
- [ ] Enterprise mode requires MFA for login

---

## Previous Story Intelligence

**From Story 1.1 (Project Scaffold):**
- Next.js 15+ project with TypeScript configured
- shadcn/ui components available
- Enterprise folder structure exists

**From Story 1.2 (Authentication Core):**
- User authentication with email/password
- Session management with HttpOnly cookies
- JWT tokens with user data
- Middleware for route protection

**Dependencies on Stories 1.1 and 1.2:**
- User model exists for adding MFA fields
- Authentication flow exists for MFA integration
- Session system exists for storing mfaVerified state

---

## Project Context Reference

**From [Security Deep Dive](../11-security-deep-dive.md#25-mfa-implementation):**
- **TOTP library**: otplib for generation/verification
- **QR code**: qrcode library for image generation
- **Backup codes**: 10 random 8-character hexadecimal codes
- **Window**: 2 time steps (±60 seconds)

**From [Architecture & Security](../02-architecture-security.md#4-authentication--authorization):**
- MFA mandatory for enterprise deployments
- MFA optional for community deployments
- Zero-trust: verify every factor

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
- [Security Deep Dive - MFA Implementation](../11-security-deep-dive.md#25-mfa-implementation) - TOTP setup, backup codes, database schema
- [Architecture & Security - Auth & Authorization](../02-architecture-security.md#4-authentication--authorization) - MFA requirements
- [Epic 1 - Foundation & Authentication](../epics.md#epic-1-foundation--authentication) - Epic context

**External References:**
- [otplib Documentation](https://github.com/guyplusplus/notp#readme)
- [QRCode.js Documentation](https://github.com/soldair/node-qrcode)
- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- [Google Authenticator Spec](https://github.com/google/google-authenticator/wiki/Key-Uri-Format)

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
