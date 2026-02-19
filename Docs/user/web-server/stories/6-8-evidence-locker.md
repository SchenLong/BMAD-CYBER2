# Story 6.8: Evidence Locker

**Status:** ready-for-dev
**Epic:** Epic 6 - Project Management System
**Story ID:** 6.8
**Story Key:** 6-8-evidence-locker
**Dependencies:** Story 6.1 (Project Core), Story 6.2 (Project CRUD)

---

## Story

**As an** Incident Responder,
**I want** to upload and verify evidence files,
**So that** evidence chain of custody is maintained.

---

## Acceptance Criteria

**Given** a project with evidence locker enabled
**When** uploading a file
**Then** calculate SHA-256 hash of uploaded file
**And** store file with metadata: filename, size, upload timestamp, uploader
**And** display evidence list with hash verification status
**And** provide download link with authentication
**And** show "verified" checkmark when hash matches
**And** support file types: memory dumps, network captures, logs, notes

---

## Tasks / Subtasks

- [ ] **Task 1: Evidence Storage Infrastructure** (AC: Given - project with evidence locker)
  - [ ] Create evidence storage directory structure
  - [ ] Set up secure file storage path (separate from public assets)
  - [ ] Configure file upload size limits (max 500MB per file)
  - [ ] Implement virus scanning integration (optional but recommended)
  - [ ] Create database schema for evidence metadata
  - [ ] Set up evidence locker flag on project model

- [ ] **Task 2: File Upload Handler** (AC: When - uploading a file)
  - [ ] Create file upload API endpoint with authentication
  - [ ] Calculate SHA-256 hash during upload
  - [ ] Store file in secure location with project isolation
  - [ ] Extract and store file metadata (name, size, type, timestamp)
  - [ ] Record uploader user ID and timestamp
  - [ ] Generate unique evidence ID (EVI-NNNNNN)
  - [ ] Implement upload progress tracking
  - [ ] Handle duplicate files (hash-based deduplication or versioning)

- [ ] **Task 3: Hash Calculation & Verification** (AC: Then - calculate SHA-256, And - verified checkmark)
  - [ ] Implement SHA-256 calculation using Node.js crypto
  - [ ] Store calculated hash with evidence record
  - [ ] Create hash verification endpoint
  - [ ] Implement "verified" checkmark display
  - [ ] Support hash comparison for integrity checks
  - [ ] Display hash in UI for manual verification
  - [ ] Add hash copy-to-clipboard functionality

- [ ] **Task 4: Evidence List Display** (AC: And - display evidence list)
  - [ ] Create EvidenceLocker component
  - [ ] Display evidence in table or grid view
  - [ ] Show columns: ID, Filename, Type, Size, Uploader, Timestamp, Hash, Status
  - [ ] Add file type icons for visual scanning
  - [ ] Implement sorting by date, size, type, uploader
  - [ ] Add filtering by file type and uploader
  - [ ] Support pagination for large evidence sets
  - [ ] Add search by filename or hash

- [ ] **Task 5: Secure Download** (AC: And - provide download link)
  - [ ] Create secure download endpoint with authentication
  - [ ] Generate time-limited download URLs (optional)
  - [ ] Log all download attempts with user attribution
  - [ ] Implement download with original filename
  - [ ] Add download confirmation dialog for large files
  - [ ] Track download count per evidence file

- [ ] **Task 6: File Type Support** (AC: And - support file types)
  - [ ] Define supported file types: memory dumps (.dmp, .raw), network captures (.pcap, .pcapng), logs (.log, .txt), notes (.md), images (.png, .jpg)
  - [ ] Implement file type validation on upload
  - [ ] Create file type icons for each category
  - [ ] Add file type-specific preview (images, text files)
  - [ ] Support custom file type extensions via project settings
  - [ ] Reject unsupported file types with clear error message

- [ ] **Task 7: Evidence Management** (AC: Then - chain of custody)
  - [ ] Implement evidence deletion with confirmation
  - [ ] Add evidence edit (rename, add notes)
  - [ ] Create evidence audit log (uploads, downloads, deletions, renames)
  - [ ] Support evidence tagging for organization
  - [ ] Add evidence linking to incidents/timeline events
  - [ ] Implement bulk actions (download, delete)

- [ ] **Task 8: UI Components** (AC: All - display and interaction)
  - [ ] Create EvidenceLocker main component
  - [ ] Build UploadButton with drag-and-drop support
  - [ ] Create EvidenceList table/grid component
  - [ ] Build EvidenceDetail modal for file info
  - [ ] Add EvidencePreview for supported file types
  - [ ] Create HashVerification display component
  - [ ] Build AuditLog viewer for chain of custody

- [ ] **Task 9: Testing & Verification** (AC: All)
  - [ ] Test file upload with various file types
  - [ ] Verify SHA-256 hash calculation accuracy
  - [ ] Test hash verification shows correct status
  - [ ] Verify secure download requires authentication
  - [ ] Test evidence list sorting and filtering
  - [ ] Verify file upload size limits
  - [ ] Test evidence deletion and audit logging
  - [ ] Verify chain of custody records are complete
  - [ ] Test unauthorized access is blocked

---

## Dev Notes

### Architecture Patterns & Constraints

**Evidence Data Model:**
```typescript
interface Evidence {
  id: string;                    // EVI-NNNNNN
  projectId: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;              // bytes
  sha256Hash: string;
  filePath: string;              // internal storage path
  uploader: {
    userId: string;
    username: string;
  };
  uploadedAt: Date;
  verified: boolean;             // hash verified status
  tags: string[];
  notes?: string;
  auditLog: EvidenceAuditEntry[];
}

interface EvidenceAuditEntry {
  action: 'upload' | 'download' | 'delete' | 'rename' | 'verify';
  userId: string;
  timestamp: Date;
  details?: string;
}

interface ProjectWithEvidence extends Project {
  evidenceLockerEnabled: boolean;
  evidenceCount: number;
  totalEvidenceSize: number;
}
```

**Storage Architecture:**
```
storage/
└── evidence/
    └── projects/
        └── {projectId}/
            ├── {evidenceId}.{ext}
            └── metadata.json
```

**Security Requirements:**
- Files stored outside web root (no direct access)
- All access requires authentication and project membership
- SHA-256 stored separately from file (for integrity verification)
- Upload requires project write permission
- Download requires project read permission
- All actions logged for chain of custody

### UI/UX Requirements

**Visual Design:**
- Clean table/grid layout for evidence list
- Color-coded file type badges
- Green checkmark for verified hashes
- Upload button should be prominent
- Drag-and-drop zone with visual feedback

**Upload Flow:**
1. Click upload button or drag file to drop zone
2. Show upload progress with percentage
3. Calculate hash during upload
4. Display success with evidence ID and hash
5. Add to evidence list automatically

**Download Flow:**
1. Click download icon/link
2. Verify authentication and permissions
3. Log download action
4. Stream file to client
5. Increment download counter

### File Structure Requirements

**New Components:**
```
src/components/features/evidence/
├── EvidenceLocker.tsx
├── EvidenceList.tsx
├── EvidenceUpload.tsx
├── EvidenceDetail.tsx
├── EvidencePreview.tsx
├── HashVerification.tsx
├── AuditLog.tsx
└── types.ts
```

**API Endpoints:**
```
POST   /api/projects/:id/evidence                    # Upload
GET    /api/projects/:id/evidence                    # List all
GET    /api/projects/:id/evidence/:evidenceId        # Get details
GET    /api/projects/:id/evidence/:evidenceId/download # Download
DELETE /api/projects/:id/evidence/:evidenceId        # Delete
PUT    /api/projects/:id/evidence/:evidenceId        # Update (rename, notes)
GET    /api/projects/:id/evidence/:evidenceId/verify # Verify hash
GET    /api/projects/:id/evidence/:evidenceId/audit  # Audit log
```

### Testing Requirements

**Manual Testing Checklist:**
1. Enable evidence locker on a project
2. Upload files of each supported type
3. Verify SHA-256 hash is calculated correctly
4. Test hash verification shows "verified"
5. Verify evidence list displays all metadata
6. Test download with authenticated user
7. Verify unauthorized users cannot download
8. Test file type validation rejects unsupported types
9. Verify audit log records all actions
10. Test large file uploads (near size limit)

---

## Dev Agent Guardrails

### Technical Requirements

**File Upload:**
- Use Next.js API routes with formidable or uploadthing
- Calculate SHA-256 during upload using Node.js crypto.createHash()
- Stream files to disk (don't load entirely in memory)
- Implement chunked upload for large files (>50MB)

**Security:**
- Validate file type by magic bytes, not just extension
- Sanitize filenames to prevent path traversal
- Rate limit upload attempts
- Scan for malware if possible (ClamAV integration)
- Store files with random names, map via database

**Performance:**
- Store large files in object storage (S3, MinIO) for production
- Implement CDN for downloads in production
- Cache evidence list responses
- Use pagination for large evidence sets

### Architecture Compliance

**Server Component Strategy:**
- Evidence locker page is Server Component
- Upload functionality requires Client Component for drag-drop
- Use Server Actions for file operations

**Error Handling:**
- Show clear error messages for upload failures
- Handle hash calculation errors gracefully
- Display storage quota warnings
- Show retry option for failed uploads

### Library/Framework Requirements

**Recommended Dependencies:**
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "react-dropzone": "^14.0.0"
  }
}
```

**Alternative: Uploadthing**
- Consider using uploadthing.com for simplified file handling
- Provides built-in security, type safety, and progress tracking

### File Structure Requirements

**Must-Create Files:**
1. `src/components/features/evidence/EvidenceLocker.tsx`
2. `src/components/features/evidence/EvidenceList.tsx`
3. `src/components/features/evidence/EvidenceUpload.tsx`
4. `src/components/features/evidence/types.ts`
5. `src/app/api/projects/[id]/evidence/route.ts`
6. `src/app/api/projects/[id]/evidence/[evidenceId]/route.ts`
7. `src/app/api/projects/[id]/evidence/[evidenceId]/download/route.ts`

**Database Schema Changes:**
```sql
CREATE TABLE evidence (
  id VARCHAR(20) PRIMARY KEY,
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  sha256_hash VARCHAR(64) NOT NULL UNIQUE,
  file_path VARCHAR(500) NOT NULL,
  uploader_id VARCHAR(20) NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  verified BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[],
  notes TEXT
);

CREATE TABLE evidence_audit (
  id SERIAL PRIMARY KEY,
  evidence_id VARCHAR(20) REFERENCES evidence(id),
  action VARCHAR(20) NOT NULL,
  user_id VARCHAR(20) REFERENCES users(id),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  details TEXT
);

ALTER TABLE projects ADD COLUMN evidence_locker_enabled BOOLEAN NOT NULL DEFAULT false;
```

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Epic 6 Focus:** Project Management System - Evidence Management

**Related Stories:**
- Story 6.1 - Project Core Data Model
- Story 6.2 - Project CRUD Operations
- Story 6.6 - Incident Response Workspace (uses evidence locker)
- Story 6.7 - Penetration Test Tracker (uses evidence for findings)

---

## References

**Source Documents:**
- [Vision & Scope](../01-vision-and-scope.md)
- [Architecture & Security](../02-architecture-security.md)
- [UX Design](../03-ux-design.md)
- [Technical Implementation](../06-technical-implementation.md)
- [UI Design System](../05-ui-design-system.md)
- [Story Implementation Steps](../story-implementation-steps.md)

**Story Breakdown Reference:**
- Epic 6: Project Management System - [epics.md#epic-6](../epics.md#epic-6-project-management-system)
- Story 6.8 Details - [epics.md#story-68-evidence-locker](../epics.md#story-68-evidence-locker)

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
