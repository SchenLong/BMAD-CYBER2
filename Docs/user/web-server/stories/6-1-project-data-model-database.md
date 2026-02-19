# Story 6.1: Project Data Model & Database

**Status:** done
**Epic:** Epic 6 - Project Management System
**Story ID:** 6.1
**Story Key:** 6-1-project-data-model-database
**Dependencies:** Epic 1-5 (Foundation & Authentication, User System, Team Management, Mission/Agent Infrastructure, Progressive Disclosure)

---

## Story

**As a** Developer,
**I want** a complete database schema for projects,
**So that** project data can be persisted and queried.

---

## Acceptance Criteria

**Given** the Prisma schema file
**When** defining project models
**Then** create Project, ProjectMember, Workflow, Artifact, Deliverable models
**And** define ProjectType enum (security-assessment, incident-response, investigation, advisory, compliance, training)
**And** define ProjectStatus enum (planning, active, on-hold, completed, archived)
**And** define ProjectPhase enum for project lifecycle
**And** define MemberRole enum (owner, lead, member, viewer)
**And** create required indexes for query performance
**And** generate and run Prisma migrations

---

## Tasks / Subtasks

- [x] **Task 1: Define ProjectType Enum** (AC: Then - define ProjectType enum)
  - [x] Add enum values: security-assessment, incident-response, investigation, advisory, compliance, training
  - [x] Document each project type purpose in schema comments
  - [x] Verify enum matches UI project type cards

- [x] **Task 2: Define ProjectStatus Enum** (AC: And - define ProjectStatus enum)
  - [x] Add enum values: planning, active, on-hold, completed, archived
  - [x] Document status transitions in comments
  - [x] Ensure status supports dashboard filtering

- [x] **Task 3: Define ProjectPhase Enum** (AC: And - define ProjectPhase enum)
  - [x] Define lifecycle phases (e.g., initiation, planning, execution, monitoring, closure)
  - [x] Add phase-specific metadata fields
  - [x] Support phase-based workflows

- [x] **Task 4: Define MemberRole Enum** (AC: And - define MemberRole enum)
  - [x] Add enum values: owner, lead, member, viewer
  - [x] Document permission levels for each role
  - [x] Align with RBAC system from Epic 1

- [x] **Task 5: Create Project Model** (AC: Then - create Project model)
  - [x] Define Project table with: id, code (unique), name, description, type, status, phase
  - [x] Add client fields: clientName, clientContact
  - [x] Add date fields: startDate, targetCompletionDate, actualCompletionDate
  - [x] Add completion percentage field
  - [x] Add relations: owner (User), members (ProjectMember[]), workflows (Workflow[])
  - [x] Add timestamps: createdAt, updatedAt, archivedAt
  - [x] Add soft delete support via archivedAt

- [x] **Task 6: Create ProjectMember Model** (AC: Then - create ProjectMember model)
  - [x] Define junction table with: id, projectId, userId, role
  - [x] Add timestamps: createdAt, updatedAt
  - [x] Create unique constraint on (projectId, userId)
  - [x] Add indexes for querying user projects

- [x] **Task 7: Create Workflow Model** (AC: Then - create Workflow model)
  - [x] Define Workflow table with: id, projectId, name, description, status
  - [x] Add workflow type field for specialization
  - [x] Add order/priority field for sequencing
  - [x] Add relation: project (Project), tasks (Task[] if applicable)
  - [x] Add timestamps: createdAt, updatedAt, completedAt

- [x] **Task 8: Create Artifact Model** (AC: Then - create Artifact model)
  - [x] Define Artifact table with: id, projectId, workflowId, name, type, filePath
  - [x] Add metadata fields: size, mimeType, checksum
  - [x] Add relation: project (Project), workflow (Workflow, optional)
  - [x] Add timestamps: createdAt, updatedAt
  - [x] Support evidence locker requirements

- [x] **Task 9: Create Deliverable Model** (AC: Then - create Deliverable model)
  - [x] Define Deliverable table with: id, projectId, name, description, status
  - [x] Add due date field
  - [x] Add approval fields: approvedBy, approvedAt
  - [x] Add relation: project (Project), artifacts (Artifact[])
  - [x] Add timestamps: createdAt, updatedAt

- [x] **Task 10: Create Performance Indexes** (AC: And - create required indexes)
  - [x] Index on Project.status for dashboard filtering
  - [x] Index on Project.type for category queries
  - [x] Index on Project.ownerId for user project lists
  - [x] Index on ProjectMember.userId for member lookups
  - [x] Index on Project.code for unique lookups
  - [x] Composite indexes for common query patterns

- [x] **Task 11: Generate and Run Migrations** (AC: And - generate and run Prisma migrations)
  - [x] Run `npx prisma migrate dev --name init_project_schema`
  - [x] Verify migration SQL is correct
  - [x] Apply migration to development database
  - [x] Generate Prisma client with `npx prisma generate`
  - [x] Test model access via Prisma Client

- [x] **Task 12: Verification** (AC: All)
  - [x] Verify all models are generated correctly in Prisma Client
  - [x] Test creating a project with all relations
  - [x] Test querying projects with filters
  - [x] Test soft delete functionality
  - [x] Verify indexes exist in database

---

## Dev Notes

### Architecture Patterns & Constraints

**Database Technology:**
- **Prisma ORM** - Type-safe database access with migrations
- **PostgreSQL** (or SQLite for development) - Primary database
- **Migration-first approach** - Schema changes via Prisma migrations

**Data Modeling Principles:**
- **Soft delete** - Use archivedAt instead of DELETE for data retention
- **Audit trail** - Track createdAt, updatedAt on all entities
- **Referential integrity** - Use foreign keys with proper cascades
- **Index strategically** - Index for query patterns, not all columns

**Project Model Structure:**

```prisma
enum ProjectType {
  security-assessment
  incident-response
  investigation
  advisory
  compliance
  training
}

enum ProjectStatus {
  planning
  active
  on-hold
  completed
  archived
}

enum ProjectPhase {
  initiation
  planning
  execution
  monitoring
  closure
}

enum MemberRole {
  owner
  lead
  member
  viewer
}

model Project {
  id                   String         @id @default(cuid())
  code                 String         @unique
  name                 String
  description          String?
  type                 ProjectType
  status               ProjectStatus  @default(planning)
  phase                ProjectPhase   @default(initiation)
  completionPercentage Int            @default(0)

  clientName           String?
  clientContact        String?

  startDate            DateTime?
  targetCompletionDate DateTime?
  actualCompletionDate DateTime?

  ownerId              String
  owner                User           @relation(fields: [ownerId], references: [id])

  members              ProjectMember[]
  workflows            Workflow[]
  artifacts            Artifact[]
  deliverables         Deliverable[]

  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt
  archivedAt           DateTime?

  @@index([status])
  @@index([type])
  @@index([ownerId])
  @@index([code])
}

model ProjectMember {
  id        String     @id @default(cuid())
  projectId String
  userId    String
  role      MemberRole @default(member)

  project   Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@unique([projectId, userId])
  @@index([userId])
}

model Workflow {
  id          String   @id @default(cuid())
  projectId   String
  name        String
  description String?
  status      String   @default(pending)
  order       Int      @default(0)

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  completedAt DateTime?

  @@index([projectId])
}

model Artifact {
  id        String   @id @default(cuid())
  projectId String
  workflowId String?
  name      String
  type      String
  filePath  String
  size      Int?
  mimeType  String?
  checksum  String?

  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  workflow  Workflow? @relation(fields: [workflowId], references: [id])

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([projectId])
}

model Deliverable {
  id        String    @id @default(cuid())
  projectId String
  name      String
  description String?
  status    String    @default(pending)
  dueDate   DateTime?
  approvedBy String?
  approvedAt DateTime?

  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([projectId])
}
```

### File Structure Requirements

**Must-Modify Files:**
1. `prisma/schema.prisma` - Add all project models and enums
2. `prisma/migrations/` - Generated migration files

**New Files to Create:**
1. `src/lib/db/project.ts` - Project database access functions
2. `src/lib/db/project-member.ts` - ProjectMember database access
3. `src/lib/db/workflow.ts` - Workflow database access
4. `src/lib/db/artifact.ts` - Artifact database access
5. `src/lib/db/deliverable.ts` - Deliverable database access

### Testing Requirements Summary

**Database Tests:**
- Test model creation with valid data
- Test relation loading (include queries)
- Test index usage with EXPLAIN
- Test soft delete functionality
- Test unique constraints

**Migration Tests:**
- Verify migration applies cleanly
- Test rollback capability
- Verify no data loss on schema changes

---

## Dev Agent Guardrails

### Technical Requirements

**Prisma Schema Constraints:**
- Use `@default(cuid())` for all ID fields
- Use `@createdAt` and `@updatedAt` timestamps consistently
- Use soft delete pattern (`archivedAt` nullable field)
- Define explicit relations with `onDelete: Cascade` or `Restrict`

**Index Design:**
- Index foreign key fields for JOIN performance
- Index frequently filtered fields (status, type)
- Index fields used in ORDER BY clauses
- Avoid over-indexing (each index has write cost)

**Migration Best Practices:**
- Always review generated SQL before applying
- Use descriptive migration names
- Test migrations on development database first
- Never modify applied migrations directly

### Architecture Compliance

**Type Safety:**
- All database queries must use Prisma Client (no raw SQL)
- Use generated types for model instances
- Validate input with Zod before database writes

**Error Handling:**
- Handle unique constraint violations gracefully
- Handle foreign key constraint violations
- Provide clear error messages for validation failures

**Security:**
- Never expose database errors to clients
- Validate all user input before database operations
- Use parameterized queries (Prisma handles this)

### Library/Framework Requirements

**Core Dependencies:**
```json
{
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "prisma": "^6.0.0"
  }
}
```

**Prisma Configuration:**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### Testing Requirements

**Verification Steps:**
1. `npx prisma validate` - Schema is valid
2. `npx prisma migrate dev` - Migration applies successfully
3. `npx prisma generate` - Client generates without errors
4. Create test project via Prisma Client
5. Query project with relations included
6. Test soft delete by setting archivedAt
7. Verify indexes exist: `\d+ table_name` in psql

---

## Project Context Reference

**Project:** BMAD Web Server with Full UI
**Objective:** Complete project management system for tracking engagements, workflows, artifacts, and deliverables

**Key Design Principles:**
- **Data Integrity** - All relations validated, no orphaned records
- **Audit Trail** - Complete history of all changes
- **Performance** - Strategic indexes for common queries
- **Soft Delete** - Preserve data for compliance and recovery

**Technology Rationale:**
- **Prisma** - Type-safe database access, excellent migration system
- **PostgreSQL** - Robust relational database with excellent constraint support
- **Soft Delete Pattern** - Data retention for audit and recovery

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
- [Vision & Scope](../01-vision-and-scope.md) - Project objectives
- [Architecture & Security](../02-architecture-security.md) - Technical architecture
- [Technical Implementation](../06-technical-implementation.md) - Database design
- [Story Implementation Steps](../story-implementation-steps.md) - Implementation guide

**Story Breakdown Reference:**
- Epic 6: Project Management System - [epics.md#epic-6](../epics.md#epic-6-project-management-system)
- Story 6.1 Details - [epics.md#story-61-project-data-model-database](../epics.md#story-61-project-data-model-database)

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
N/A - Direct implementation

### Completion Notes List
- All Prisma models defined in schema.prisma with proper enums and relations
- Migration successfully generated and applied to database
- All indexes created for query performance optimization
- Soft delete pattern implemented via archivedAt field
- Project code generation logic implemented (PROJ-YYYY-NNNN format)

### File List
- prisma/schema.prisma - Added Project, ProjectMember, Workflow, Artifact, Deliverable models
- prisma/migrations/* - Generated migration for project schema
