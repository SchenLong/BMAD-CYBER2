# BMAD Web Server - Project Management System Design

**Project:** BMAD Web Server with Full UI
**Version:** 1.0.0
**Date:** 2025-02-15
**Team:** Winston (Architect), John (PM), Bastion (Security), Barry (Dev)

---

## INDEX

| Section | Lines | Description |
|---------|-------|-------------|
| [1. Project Data Model](#1-project-data-model) | 30-282 | Core interfaces: Project, Workflow, Artifact, Deliverable |
| [2. Project Types & Workflows](#2-project-types--workflows) | 285-322 | Type mappings, security-specific features |
| [3. Database Schema](#3-database-schema) | 325-576 | Prisma schema with all models and enums |
| [4. API Specification](#4-api-specification) | 580-822 | REST API endpoints for projects, workflows, artifacts, team |
| [5. UI Components](#5-ui-components) | 826-1059 | Component inventory and UI mockups |
| [6. Security Considerations](#6-security-considerations) | 1063-1183 | Access control, evidence locker, audit trail |
| [7. Implementation Phases](#7-implementation-phases) | 1187-1253 | 3-phase implementation plan |
| [8. Integration Points](#8-integration-points) | 1256-1304 | CLI bridge, workflow state persistence |

---

## Executive Summary

This document defines the comprehensive **Project Management System** for BMAD Web Server. A "Project" is the primary container for organizing multi-workflow engagements, team collaboration, and deliverable tracking.

**Key Insight:** A BMAD "mission" is a single workflow execution. A BMAD "project" is a container for multiple missions/workflows that form a complete engagement (e.g., a full security assessment, an incident response, a consulting engagement).

---

## Table of Contents

1. [Project Data Model](#1-project-data-model)
2. [Project Types & Workflows](#2-project-types--workflows)
3. [Database Schema](#3-database-schema)
4. [API Specification](#4-api-specification)
5. [UI Components](#5-ui-components)
6. [Security Considerations](#6-security-considerations)
7. [Implementation Phases](#7-implementation-phases)

---

## 1. Project Data Model

### 1.1 Core Project Interface

```typescript
/**
 * A BMAD Project represents a complete engagement or initiative
 * that may span multiple workflows, team members, and deliverables.
 */
interface BMADProject {
  // ===== Core Identity =====
  id: string                      // UUID
  projectCode: string             // PROJ-YYYY-NNN format
  name: string                    // Human-readable name
  description: string             // Detailed description
  tags: string[]                  // Search/filter tags

  // ===== Classification =====
  type: ProjectType               // security-assessment, incident-response, etc.
  sensitivity: 'public' | 'confidential' | 'restricted'

  // ===== Client/Organization Context =====
  clientId?: string               // Foreign key to clients table (Phase 2)
  clientName?: string             // Free-form for Phase 1

  // ===== Team & Ownership =====
  ownerId: string                 // Primary owner/creator
  teamMembers: ProjectMember[]

  // ===== Lifecycle =====
  status: ProjectStatus
  phase: ProjectPhase
  startDate: Date
  targetDate?: Date               // Expected completion
  completedDate?: Date

  // ===== Content =====
  workflows: ProjectWorkflow[]    // Workflow executions within project
  artifacts: ProjectArtifact[]    // All files, documents, evidence
  deliverables: Deliverable[]     // What we promised vs delivered

  // ===== Metadata =====
  createdBy: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date                // Soft delete
}

/**
 * Project Types map to BMAD module capabilities
 */
type ProjectType =
  | 'security-assessment'    // Architecture review, pentest, vuln scan
  | 'incident-response'      // Active incident handling
  | 'investigation'          // OSINT, forensics, corporate intel
  | 'advisory'               // Strategy, legal counsel, vCISO
  | 'compliance'             // Audit prep, assessment
  | 'training'               // Security awareness, tabletop exercises

/**
 * Project Status represents overall project state
 */
type ProjectStatus =
  | 'draft'        // Planning, not started
  | 'active'       // Work in progress
  | 'on-hold'      // Paused
  | 'review'       // Internal review before delivery
  | 'delivered'    // Completed, delivered to client
  | 'archived'     // Closed, read-only

/**
 * Project Phase represents current stage
 */
type ProjectPhase =
  | 'planning'     // Scope definition, team assembly
  | 'execution'    // Active workflow execution
  | 'review'       // Internal quality review
  | 'delivery'     // Final deliverable preparation
  | 'closed'       // Project complete

/**
 * Project Member with role-based permissions
 */
interface ProjectMember {
  id: string
  projectId: string
  userId: string
  userName: string
  role: ProjectRole
  addedAt: Date
  addedBy: string
}

/**
 * Role-based access within a project
 */
type ProjectRole =
  | 'owner'        // Full control, can delete project
  | 'lead'         // Can manage workflows, team, deliverables
  | 'contributor'  // Can execute workflows, add artifacts
  | 'viewer'       // Read-only access
```

### 1.2 Workflow Execution Within Projects

```typescript
/**
 * A ProjectWorkflow represents a single workflow execution
 * within the context of a project.
 */
interface ProjectWorkflow {
  id: string
  projectId: string

  // Which workflow was executed
  workflowId: string              // BMAD workflow identifier
  workflowName: string            // Human-readable name
  module: string                  // cybersec-team, intel-team, etc.

  // Execution tracking
  status: WorkflowStatus
  assignedTo?: string             // Team member responsible
  startedAt?: Date
  completedAt?: Date

  // Outputs
  outputFiles: string[]           // Paths to generated documents
  outputArtifacts: string[]       // Artifact IDs

  // Error tracking
  error?: {
    message: string
    code: string
    timestamp: Date
  }

  // Metadata
  createdBy: string
  createdAt: Date
}

type WorkflowStatus =
  | 'pending'      // Queued, not started
  | 'running'      // Currently executing
  | 'completed'    // Finished successfully
  | 'failed'       // Execution failed
  | 'cancelled'    // Cancelled by user
```

### 1.3 Artifacts & Evidence

```typescript
/**
 * ProjectArtifact represents any file uploaded to or generated
 * within a project. Critical for security workflows that
 * require chain-of-custody tracking.
 */
interface ProjectArtifact {
  id: string
  projectId: string

  // File information
  type: ArtifactType
  title: string
  description?: string
  filePath: string

  // Security & Integrity
  fileHash: string                // SHA-256 for chain of custody
  mimeType: string
  fileSize: number
  classification: 'public' | 'confidential' | 'restricted'

  // Evidence Chain (for security workflows)
  evidenceMetadata?: {
    source: string                // Where evidence came from
    collector: string             // Who collected it
    collectedAt: Date
    custodyChain: CustodyTransfer[]
    preserved: boolean            // True if hash verified
  }

  // Provenance
  uploadedBy: string
  uploadedAt: Date

  // Flexible metadata for different artifact types
  metadata: Record<string, any>
}

type ArtifactType =
  | 'document'     // Generated reports
  | 'evidence'     // Log files, PCAPs, disk images
  | 'report'       // Final deliverable
  | 'timeline'     // Incident timeline data
  | 'diagram'      // Architecture/threat model diagrams
  | 'finding'      // Individual finding (pentest/assessment)
  | 'other'

interface CustodyTransfer {
  from: string
  to: string
  timestamp: Date
  reason: string
  hash: string                    // Hash at time of transfer
}
```

### 1.4 Deliverables Tracking

```typescript
/**
 * Deliverable represents a promised output to the client.
 */
interface Deliverable {
  id: string
  projectId: string

  // What was promised
  title: string
  description: string
  type: DeliverableType

  // Timeline
  dueDate?: Date
  status: DeliverableStatus

  // Link to actual output
  artifactId?: string             // When completed, links to artifact

  // Metadata
  createdAt: Date
  completedAt?: Date
}

type DeliverableType =
  | 'report'           // Security assessment report
  | 'briefing'         // Executive briefing
  | 'evidence-package'  // Collected evidence files
  | 'timeline'         // Incident timeline
  | 'playbook'         // Response playbook
  | 'recommendations'  // Remediation recommendations
  | 'presentation'     // Slide deck
  | 'other'

type DeliverableStatus =
  | 'pending'          // Not started
  | 'in-progress'      // Work in progress
  | 'review'           // Internal review
  | 'completed'        // Delivered to client
  | 'cancelled'        // Cancelled
```

---

## 2. Project Types & Workflows

### 2.1 Project Type Mappings

| Project Type | Module | Typical Workflows | Key Artifacts | Key Deliverables |
|--------------|--------|------------------|---------------|------------------|
| **security-assessment** | Cybersec | security-architecture-review, threat-modeling, vulnerability-management | Diagrams, findings, STRIDE models | Assessment report, recommendations |
| **incident-response** | Cybersec | incident-response-playbook (Mode B) | Timeline, evidence logs, IOCs | Incident report, lessons learned |
| **investigation** | Intel | flash-assessment, attribution-chain, infrastructure-genealogy | OSINT data, network graphs | Investigation report, dossiers |
| **forensics** | Cybersec | incident-response (evidence collection) | Disk images, memory dumps, hashes | Forensic report, chain of custody |
| **pentest** | Cybersec | web-app-security-testing, network-assessment | Screenshots, exploit PoCs | Pentest report, findings tracker |
| **compliance** | Cybersec | compliance-audit-prep | Control evidence, gap analysis | Compliance report, certification artifacts |
| **advisory** | Strategy | strategic-planning-session, board-presentation-prep | Slide decks, briefings | Advisory recommendations |
| **legal** | Legal | contract-review, corporate-formation | Legal memos, contracts | Legal opinion, filed documents |

### 2.2 Security-Specific Project Features

**Incident Response Projects:**
- Real-time status dashboard
- Timeline visualization with multi-contributor support
- Evidence locker with hash verification
- Team presence indicators (who's working on what)
- Stakeholder communication templates

**Penetration Test Projects:**
- Findings tracker with severity scoring
- Evidence capture (screenshots, PoC code)
- Retesting workflow (findings → fixes → verification)
- Client approval gates
- Executive summary + technical detail separation

**Forensics Investigation Projects:**
- Chain-of-custody logging for all artifacts
- Hash verification on upload/access
- Case file integrity checks
- Legal hold notifications
- Export packages for litigation

---

## 3. Database Schema

### 3.1 Prisma Schema

```prisma
// Prisma schema for BMAD Web Server Project Management

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "sqlite" for local dev
  url      = env("DATABASE_URL")
}

// ============================================================================
// PROJECTS
// ============================================================================

model Project {
  id          String   @id @default(uuid())
  projectCode String   @unique // PROJ-2025-001
  name        String
  description String?
  tags        String[] @default([])

  // Classification
  type        ProjectType
  sensitivity Sensitivity @default(CONFIDENTIAL)

  // Client (Phase 2: foreign key, Phase 1: free-form)
  clientId    String?
  clientName  String?  @default("Internal")

  // Ownership
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])

  // Lifecycle
  status      ProjectStatus @default(DRAFT)
  phase       ProjectPhase  @default(PLANNING)
  startDate   DateTime  @default(now())
  targetDate  DateTime?
  completedDate DateTime?

  // Metadata
  createdBy   String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime? // Soft delete

  // Relations
  teamMembers     ProjectMember[]
  workflows       ProjectWorkflow[]
  artifacts        ProjectArtifact[]
  deliverables     Deliverable[]

  @@index([type, status])
  @@index([ownerId])
  @@index([status])
  @@map("projects")
}

model ProjectMember {
  id        String   @id @default(uuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId    String
  userName  String   // Denormalized for queries
  role      ProjectRole
  addedAt   DateTime @default(now())
  addedBy   String

  @@unique([projectId, userId])
  @@index([projectId])
  @@map("project_members")
}

model ProjectWorkflow {
  id              String   @id @default(uuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  // Workflow identity
  workflowId      String   // BMAD workflow identifier
  workflowName    String   // Human-readable
  module          String   // cybersec-team, intel-team, etc.

  // Execution
  status          WorkflowStatus @default(PENDING)
  assignedTo      String?
  startedAt       DateTime?
  completedAt     DateTime?

  // Outputs
  outputFiles     String[] @default([])
  outputArtifacts String[] @default([])

  // Error tracking
  errorMessage    String?
  errorCode       String?

  // Metadata
  createdBy       String
  createdAt       DateTime @default(now())

  @@index([projectId])
  @@index([status])
  @@map("project_workflows")
}

model ProjectArtifact {
  id              String   @id @default(uuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  // File info
  type            ArtifactType
  title           String
  description     String?
  filePath        String   // Storage path

  // Security & Integrity
  fileHash        String   // SHA-256
  mimeType        String
  fileSize        BigInt
  classification   Sensitivity @default(CONFIDENTIAL)

  // Evidence metadata (JSON for flexibility)
  evidenceMetadata Json?

  // Provenance
  uploadedBy      String
  uploadedAt      DateTime @default(now())

  // Flexible metadata
  metadata        Json?

  @@index([projectId])
  @@index([type])
  @@map("project_artifacts")
}

model Deliverable {
  id          String            @id @default(uuid())
  projectId   String
  project     Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)

  // What was promised
  title       String
  description String
  type        DeliverableType

  // Timeline
  dueDate     DateTime?
  status      DeliverableStatus @default(PENDING)

  // Link to actual output
  artifactId  String?

  // Timestamps
  createdAt   DateTime          @default(now())
  completedAt DateTime?

  @@index([projectId])
  @@index([status])
  @@map("deliverables")
}

// ============================================================================
// ENUMS
// ============================================================================

enum ProjectType {
  SECURITY_ASSESSMENT
  INCIDENT_RESPONSE
  INVESTIGATION
  FORENSICS
  PENTEST
  COMPLIANCE
  ADVISORY
  TRAINING
}

enum ProjectStatus {
  DRAFT
  ACTIVE
  ON_HOLD
  REVIEW
  DELIVERED
  ARCHIVED
}

enum ProjectPhase {
  PLANNING
  EXECUTION
  REVIEW
  DELIVERY
  CLOSED
}

enum ProjectRole {
  OWNER
  LEAD
  CONTRIBUTOR
  VIEWER
}

enum WorkflowStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

enum ArtifactType {
  DOCUMENT
  EVIDENCE
  REPORT
  TIMELINE
  DIAGRAM
  FINDING
  OTHER
}

enum DeliverableType {
  REPORT
  BRIEFING
  EVIDENCE_PACKAGE
  TIMELINE
  PLAYBOOK
  RECOMMENDATIONS
  PRESENTATION
  OTHER
}

enum DeliverableStatus {
  PENDING
  IN_PROGRESS
  REVIEW
  COMPLETED
  CANCELLED
}

enum Sensitivity {
  PUBLIC
  CONFIDENTIAL
  RESTRICTED
}
```

---

## 4. API Specification

### 4.1 Project CRUD Endpoints

```typescript
/**
 * PROJECT MANAGEMENT API
 * All endpoints require authentication via Bearer token
 */

// ============================================================================
// PROJECTS
// ============================================================================

/**
 * GET /api/projects
 * List all projects with filtering and pagination
 */
interface GetProjectsQuery {
  status?: ProjectStatus[]
  type?: ProjectType[]
  ownerId?: string
  search?: string               // Search in name, description
  page?: number                 // Default: 1
  limit?: number                // Default: 20
  sort?: 'createdAt' | 'updatedAt' | 'name'
  order?: 'asc' | 'desc'
}

interface GetProjectsResponse {
  projects: ProjectSummary[]
  total: number
  page: number
  totalPages: number
}

/**
 * GET /api/projects/:id
 * Get full project details
 */
interface GetProjectResponse {
  project: BMADProject
  permissions: {
    canEdit: boolean
    canDelete: boolean
    canAddWorkflows: boolean
    canAddArtifacts: boolean
    canManageTeam: boolean
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
interface CreateProjectRequest {
  name: string
  description?: string
  type: ProjectType
  sensitivity?: 'public' | 'confidential' | 'restricted'
  clientName?: string
  tags?: string[]
  targetDate?: string            // ISO 8601
}

/**
 * PATCH /api/projects/:id
 * Update project (requires owner or lead role)
 */
interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: ProjectStatus
  phase?: ProjectPhase
  targetDate?: string
  tags?: string[]
}

/**
 * DELETE /api/projects/:id
 * Soft delete project (owner only)
 */

// ============================================================================
// PROJECT WORKFLOWS
// ============================================================================

/**
 * GET /api/projects/:projectId/workflows
 * List all workflows in a project
 */
interface GetProjectWorkflowsResponse {
  workflows: ProjectWorkflow[]
}

/**
 * POST /api/projects/:projectId/workflows
 * Add a workflow execution to a project
 */
interface AddWorkflowRequest {
  workflowId: string              // BMAD workflow identifier
  workflowName: string
  module: string
  assignedTo?: string
}

/**
 * POST /api/projects/:projectId/workflows/:workflowId/execute
 * Execute a workflow via CLI bridge
 */
interface ExecuteWorkflowRequest {
  parameters?: Record<string, any>  // Workflow-specific parameters
}

// Returns Server-Sent Events stream
// Event types: 'started', 'progress', 'completed', 'failed', 'cancelled'

// ============================================================================
// PROJECT ARTIFACTS
// ============================================================================

/**
 * GET /api/projects/:projectId/artifacts
 * List all artifacts in a project
 */
interface GetArtifactsQuery {
  type?: ArtifactType
  classification?: Sensitivity
}

/**
 * POST /api/projects/:projectId/artifacts
 * Upload an artifact to the project
 *
 * Content-Type: multipart/form-data
 * Body: FormData with 'file' and metadata
 */
interface UploadArtifactRequest {
  file: File
  title: string
  description?: string
  type: ArtifactType
  classification?: 'public' | 'confidential' | 'restricted'
  metadata?: Record<string, any>
}

/**
 * GET /api/projects/:projectId/artifacts/:artifactId/download
 * Download an artifact (verifies permissions)

/**
 * GET /api/projects/:projectId/artifacts/:artifactId/verify
 * Verify artifact hash for chain of custody
 */
interface VerifyArtifactResponse {
  artifactId: string
  currentHash: string
  storedHash: string
  valid: boolean
  verifiedAt: Date
  custodyChain: CustodyTransfer[]
}

// ============================================================================
// PROJECT TEAM
// ============================================================================

/**
 * GET /api/projects/:projectId/team
 * List project team members
 */

/**
 * POST /api/projects/:projectId/team
 * Add team member (requires owner or lead role)
 */
interface AddTeamMemberRequest {
  userId: string
  role: ProjectRole
}

/**
 * PATCH /api/projects/:projectId/team/:memberId
 * Update team member role
 */
interface UpdateTeamMemberRequest {
  role: ProjectRole
}

/**
 * DELETE /api/projects/:projectId/team/:memberId
 * Remove team member

// ============================================================================
// DELIVERABLES
// ============================================================================

/**
 * GET /api/projects/:projectId/deliverables
 * List all deliverables for a project
 */

/**
 * POST /api/projects/:projectId/deliverables
 * Create a deliverable commitment
 */
interface CreateDeliverableRequest {
  title: string
  description: string
  type: DeliverableType
  dueDate?: string
}

/**
 * PATCH /api/projects/:projectId/deliverables/:deliverableId
 * Update deliverable status
 */
interface UpdateDeliverableRequest {
  status?: DeliverableStatus
  artifactId?: string            // Link to completed artifact
  completedAt?: string
}

// ============================================================================
// PROJECT TEMPLATES (Phase 2)
// ============================================================================

/**
 * GET /api/project-templates
 * List available project templates
 */

/**
 * POST /api/projects/from-template
 * Create a project from a template
 */
interface CreateFromTemplateRequest {
  templateId: string
  name: string
  clientName?: string
  targetDate?: string
}
```

---

## 5. UI Components

### 5.1 Project List View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Projects ───────────────────────────────────────────────────────────── [+] │
│                                                                              │
│  🔍 [Search projects...]                                      [Filter ▼]      │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📁 Security Assessment - Acme Corp              Active ●         │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  Type: Security Assessment  │  Team: 4 members  │  Due: Mar 15    │   │
│  │  Workflows: 3 completed    │  Artifacts: 12     │  75% complete  │   │
│  │                              │                    │                 │   │
│  │  [View →]                                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🚨 Incident Response - Ransomware XYZ-2025     Active 🔴         │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  Type: Incident Response   │  Team: 6 members  │  Started 2h ago │   │
│  │  Phase: Containment        │  Artifacts: 8      │  Critical       │   │
│  │                              │                    │                 │   │
│  │  [View →]                                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🔍 OSINT Investigation - Target Alpha          Review ▲          │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  Type: Investigation        │  Team: 2 members  │  Due: Tomorrow  │   │
│  │  Workflows: 5 completed    │  Artifacts: 23     │  Review phase   │   │
│  │                              │                    │                 │   │
│  │  [View →]                                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Project Detail View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📁 Security Assessment - Acme Corp                            [Settings] │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                              │
│  Status: Active ●  │  Phase: Execution  │  Due: March 15, 2025              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📊 Overview  │  🔄 Workflows  │  📎 Artifacts  │  📦 Deliverables │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  WORKFLOWS (3)                                               [+ Add] │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │                                                                    │   │
│  │  ✅ Security Architecture Review                    2 days ago    │   │
│  │     Generated 8 findings, 12 recommendations                          │   │
│  │     [View Output]  [View Findings]                                 │   │
│  │                                                                    │   │
│  │  ✅ Threat Modeling                                     1 day ago     │   │
│  │     6 components analyzed, 24 threats identified                    │   │
│  │     [View Output]  [View Threat Model]                            │   │
│  │                                                                    │   │
│  │  🔄 Vulnerability Assessment                          In Progress   │   │
│  │     Scanning in progress... 67% complete                             │   │
│  │     [View Progress]                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TEAM (4)                                                    [+ Add] │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  👤 J (Owner)           👤 Alice (Lead)    👤 Bob          👤 Carol│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ACTIVITY TIMELINE                                                  │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  Mar 10  ● Project created                                          │   │
│  │  Mar 11  ● Architecture review started                              │   │
│  │  Mar 12  ● Architecture review completed                            │   │
│  │  Mar 13  ● Threat modeling started                                  │   │
│  │  Mar 13  ● Threat modeling completed                                │   │
│  │  Mar 14  ● Vulnerability assessment started                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Project Creation Modal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Create New Project                                          [×]            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                              │
│  What type of project is this?                                             │
│                                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ 🛡️           │ │ 🚨           │ │ 🔍           │ │ ⚖️           │      │
│  │ Security     │ │ Incident     │ │ Investigation │ │ Advisory     │      │
│  │ Assessment   │ │ Response     │ │              │ │              │      │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ 🔓           │ │ 📚           │ │ 🎓           │ │              │      │
│  │ Forensics    │ │ Compliance   │ │ Training     │ │ More...      │      │
│  │              │ │              │ │              │ │              │      │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                                              │
│  Project name:                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Acme Corp Security Assessment Spring 2025                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Description (optional):                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Comprehensive security assessment including architecture review...    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Client name (optional):                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Acme Corporation                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Target completion (optional):                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ March 15, 2025                                          [📅]          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Sensitivity:                                                    ⚠️ Default  │
│  ○ Public  ● Confidential  ○ Restricted                                   │
│                                                                              │
│  Tags:                                                        [+ Add tag]   │
│  [enterprise] [external] [quarterly]                                     │
│                                                                              │
│  [ Cancel ]                                    [ Create Project → ]         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Incident Response Project UI (Specialized)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🚨 Incident Response - Ransomware XYZ-2025                   Active 🔴    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                              │
│  INCIDENT ID: INC-2025-003  │  SEVERITY: Critical  │  PHASE: Containment  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📍 STATUS          │  📊 TIMELINE      │  👥 TEAM (6)           │   │
│  │                     │                   │                        │   │
│  │  Current Phase:      │  [Timeline Viz]   │  Phoenix (Commander) │   │
│  │  Containment        │                    │  Trace (Forensics)    │   │
│  │                     │  Last update:     │  Cipher (Intel)       │   │
│  │  Blast Radius:      │  5 minutes ago    │  Spectre (Red Team)    │   │
│  │  3 systems affected │                   │  +3 more              │   │
│  │                     │                   │                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  EVIDENCE LOCKER                                     [Upload Evidence]│   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  📄 memory_dump.raw                     SHA-256: abc123...   2h ago │   │
│  │  📄 network_traffic.pcap                SHA-256: def456...   1h ago │   │
│  │  📄 ransomware_note.txt               SHA-256: 789ghi...   3h ago │   │
│  │  📄 screenshot_initial.png             SHA-256: jkl012...   4h ago │   │
│  │                                                                    │   │
│  │  [View All Evidence]                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TIMELINE                                                [+ Entry]    │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  Feb 15 08:30  🚨 Initial detection - SOC alert                        │   │
│  │  Feb 15 08:45  🔍 Investigation started - Trace assigned            │   │
│  │  Feb 15 09:00  📸 Evidence collected - memory dump captured         │   │
│  │  Feb 15 09:30  🔬 Analysis - Ransomware identified as XYZ-variant   │   │
│  │  Feb 15 10:00  🛡️ Containment - Isolated affected systems             │   │
│  │  Feb 15 10:30  📊 Status update - Blast radius contained             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  COMMUNICATIONS                                                        │   │
│  │  ──────────────────────────────────────────────────────────────     │   │
│  │  👔 Stakeholder notifications: 2 sent, 0 pending                    │   │
│  │  📧 Executive briefing scheduled: Today 2:00 PM                    │   │
│  │  [Send Update]  [Schedule Briefing]                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.5 Component Inventory

```
components/
├── projects/
│   ├── ProjectCard.tsx              # Summary card for project list
│   ├── ProjectList.tsx              # Filterable list view
│   ├── ProjectDetail.tsx            # Full project detail page
│   ├── ProjectCreateModal.tsx       # Project creation wizard
│   ├── ProjectStatusBadge.tsx       # Status indicator component
│   ├── ProjectPhaseIndicator.tsx    # Phase progress indicator
│   ├── ProjectTeamList.tsx          # Team members display
│   ├── ProjectTimeline.tsx         # Activity timeline
│   ├── ProjectSettings.tsx          # Project settings panel
│   │
│   ├── workflows/
│   │   ├── WorkflowList.tsx         # List of project workflows
│   │   ├── WorkflowCard.tsx         # Single workflow status
│   │   ├── WorkflowExecutor.tsx     # Workflow execution interface
│   │   └── WorkflowProgress.tsx     # Real-time progress tracker
│   │
│   ├── artifacts/
│   │   ├── ArtifactList.tsx          # List of project artifacts
│   │   ├── ArtifactCard.tsx          # Single artifact display
│   │   ├── ArtifactUpload.tsx        # File upload component
│   │   ├── EvidenceLocker.tsx        # Security-focused artifact viewer
│   │   └── HashVerification.tsx      # Chain-of-custody verification
│   │
│   ├── deliverables/
│   │   ├── DeliverableList.tsx      # Deliverables tracker
│   │   ├── DeliverableCard.tsx      # Single deliverable status
│   │   └── DeliverableCreate.tsx     # New deliverable form
│   │
│   └── specialized/
│       ├── IncidentWorkspace.tsx    # Incident response specialized UI
│       ├── PentestTracker.tsx       # Penetration test findings tracker
│       ├── TimelineVisualization.tsx # Visual timeline component
│       └── FindingsTracker.tsx      # Security findings management
```

---

## 6. Security Considerations

### 6.1 Project-Level Access Control

```typescript
/**
 * Project permission matrix
 */
const PROJECT_PERMISSIONS = {
  owner: [
    'project.view',
    'project.edit',
    'project.delete',
    'project.archive',
    'workflow.add',
    'workflow.execute',
    'artifact.add',
    'artifact.delete',
    'team.manage',
    'deliverable.manage',
  ],
  lead: [
    'project.view',
    'project.edit',
    'workflow.add',
    'workflow.execute',
    'artifact.add',
    'team.manage',  // Can add/remove contributors
    'deliverable.manage',
  ],
  contributor: [
    'project.view',
    'workflow.execute',
    'artifact.add',
    'deliverable.view',
  ],
  viewer: [
    'project.view',
    'artifact.view',
    'deliverable.view',
  ],
}

/**
 * Authorization check middleware
 */
function authorizeProjectAccess(
  user: User,
  project: BMADProject,
  requiredPermission: string
): boolean {
  const membership = project.teamMembers.find(m => m.userId === user.id)
  if (!membership) return false

  const rolePermissions = PROJECT_PERMISSIONS[membership.role] || []
  return rolePermissions.includes(requiredPermission)
}
```

### 6.2 Evidence Locker Security

```typescript
/**
 * Evidence handling requirements for security projects
 */
interface EvidenceSecurityRequirements {
  // Hash verification on upload
  hashAlgorithm: 'sha256'  // NIST-approved

  // Chain of custody logging
  custodyLogging: {
    upload: true      // Log who uploaded
    access: true      // Log every access
    download: true    // Log every download
    transfer: true    // Log custody transfers
  }

  // Access control
  accessControl: {
    incidentProjects: 'incident_responder' // Only IR team
    forensicsProjects: 'forensic_analyst'    // Only forensics
    pentestProjects: 'pentester'             // Only pentesters
  }

  // Integrity verification
  integrity: {
    verifyOnUpload: true
    verifyOnAccess: true
    verifyInterval: '24h'  // Re-verify stored hashes
  }

  // Retention
  retention: {
    incidentProjects: '7 years'    // Legal requirement
    forensicsProjects: 'permanent'   // Case files
    pentestProjects: '3 years'      // Contractual
  }
}
```

### 6.3 Audit Trail for Projects

```typescript
/**
 * Project audit events
 */
type ProjectAuditEvent =
  | { type: 'project.created', projectId: string, userId: string }
  | { type: 'project.updated', projectId: string, userId: string, changes: string[] }
  | { type: 'project.deleted', projectId: string, userId: string }
  | { type: 'project.status_changed', projectId: string, from: string, to: string, userId: string }
  | { type: 'workflow.added', projectId: string, workflowId: string, userId: string }
  | { type: 'workflow.started', projectId: string, workflowId: string, userId: string }
  | { type: 'workflow.completed', projectId: string, workflowId: string, outputFiles: string[] }
  | { type: 'artifact.uploaded', projectId: string, artifactId: string, userId: string, fileName: string, hash: string }
  | { type: 'artifact.accessed', projectId: string, artifactId: string, userId: string }
  | { type: 'team.member_added', projectId: string, userId: string, addedBy: string, role: string }
  | { type: 'team.member_removed', projectId: string, userId: string, removedBy: string }
  | { type: 'deliverable.created', projectId: string, deliverableId: string, userId: string }
  | { type: 'deliverable.completed', projectId: string, deliverableId: string, userId: string }
```

---

## 7. Implementation Phases

### 7.1 Phase 1: Basic Project Container (Sprint 1)

**Features:**
- CRUD operations for projects
- Basic project types
- Single user (owner)
- Add workflows to projects
- List project workflows
- Basic project list with filters

**Data Model (Simplified):**
```typescript
interface SimpleProject {
  id: string
  name: string
  type: ProjectType
  status: 'draft' | 'active' | 'completed'
  ownerId: string
  workflows: {
    id: string
    workflowId: string
    status: string
    outputUrl?: string
  }[]
  createdAt: Date
  updatedAt: Date
}
```

**UI Components:**
- ProjectCard
- ProjectList
- ProjectCreateModal
- ProjectDetail (basic view)

### 7.2 Phase 2: Team & Artifacts (Sprint 2)

**New Features:**
- Project team management
- File upload to projects
- Evidence locker with hash verification
- Deliverables tracking
- Project templates (cloning)

**New UI Components:**
- TeamMemberList, AddTeamMemberModal
- ArtifactUpload, ArtifactList
- DeliverableTracker
- ProjectTemplates

### 7.3 Phase 3: Advanced Features (Sprint 3+)

**New Features:**
- Timeline visualization (incident response)
- Findings tracker (pentests)
- Multi-user collaboration
- Real-time updates (WebSocket)
- Client association (multi-tenant prep)

**New UI Components:**
- TimelineVisualization
- FindingsTracker
- IncidentWorkspace (specialized UI)
- PentestTracker (specialized UI)

---

## 8. Integration Points

### 8.1 CLI Bridge Integration

```typescript
// Extended CLI bridge commands for projects
const PROJECT_CLI_COMMANDS = {
  // Create project from CLI
  'project.create': {
    command: 'bmad',
    args: ['project', 'create'],
    timeout: 30000,
  },

  // Add workflow to project
  'project.workflow.add': {
    command: 'bmad',
    args: ['project', 'workflow', 'add'],
    timeout: 30000,
  },

  // Generate project report
  'project.report': {
    command: 'bmad',
    args: ['project', 'report'],
    timeout: 60000,
  },
}
```

### 8.2 Workflow State Persistence

```typescript
// Long-running workflow state must be persisted
interface WorkflowExecutionState {
  id: string
  projectId: string
  workflowId: string
  status: 'running' | 'paused' | 'completed' | 'failed'
  currentStep: string
  completedSteps: string[]
  context: Record<string, any>  // Workflow-specific state
  startedAt: Date
  lastHeartbeat: Date
}

// Enable workflow resumption after server restart
// Critical for long-running security workflows
```

---

## 9. Implementation Log

### 9.1 Story 6.6: Incident Response Workspace ✅ (Completed 2026-02-17)

**Status:** DONE
**Story:** 6.6-incident-response-workspace
**Epic:** Epic 6 - Project Management System

#### Implemented Components

| Component | File | Description |
|-----------|------|-------------|
| Incident Types | `src/lib/types/incidents.ts` | Core type definitions, phase state machine, utilities |
| Incident Header | `src/components/incidents/IncidentHeader.tsx` | Displays incident ID, severity, phase, team count |
| Status Panel | `src/components/incidents/StatusPanel.tsx` | Phase stepper, systems status, phase transition |
| Incident Timeline | `src/components/incidents/IncidentTimeline.tsx` | Event log with filtering, search, multi-contributor |
| Evidence Locker | `src/components/incidents/EvidenceLocker.tsx` | File list, SHA-256 verification, upload |
| Team Presence | `src/components/incidents/TeamPresence.tsx` | Active members, online status, current tasks |
| Phase Progression | `src/components/incidents/PhaseProgression.tsx` | Phase transition dialog, history, checklists |
| Incident Navigation | `src/components/incidents/IncidentNavigation.tsx` | Tabs, breadcrumbs, quick actions, notifications |

#### API Routes Created

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/projects/[id]/incident` | GET/PATCH | Incident CRUD |
| `/api/projects/[id]/incident/phase` | POST | Phase transitions |
| `/api/projects/[id]/incident/timeline` | GET/POST | Timeline events |

#### Test Results

- **22/22 tests passing** (100% pass rate)
- Coverage: Type validation, phase transitions, utility functions

#### Key Features Delivered

1. **Phase State Machine**: Identification → Containment → Eradication → Recovery → Closed
2. **SHA-256 Evidence Verification**: Chain of custody for all uploaded files
3. **Multi-Contributor Timeline**: Full attribution with user avatars
4. **Real-Time Team Presence**: Online/away/offline status with activity tracking
5. **Severity Color Coding**: Critical (red), High (orange), Medium (yellow), Low (blue)

#### Files Created

```
team/bmad-web-ui/src/
├── lib/types/incidents.ts                          (294 lines)
├── components/incidents/
│   ├── IncidentHeader.tsx                           (249 lines)
│   ├── StatusPanel.tsx                              (407 lines)
│   ├── IncidentTimeline.tsx                         (539 lines)
│   ├── EvidenceLocker.tsx                           (578 lines)
│   ├── TeamPresence.tsx                             (359 lines)
│   ├── PhaseProgression.tsx                         (477 lines)
│   ├── IncidentNavigation.tsx                       (461 lines)
│   └── index.ts                                     (47 lines)
├── lib/__tests__/incidents.test.ts                  (22 tests)
├── components/ui/textarea.tsx                       (NEW - missing UI component)
└── app/api/projects/[id]/incident/
    ├── route.ts                                     (105 lines)
    ├── phase/route.ts                                (64 lines)
    └── timeline/route.ts                             (126 lines)
```

#### Code Review Fixes Applied

1. ✅ Created missing `textarea.tsx` UI component
2. ✅ Consolidated duplicate `formatLastActivity` → uses shared `formatIncidentTime`
3. ✅ Added project type validation to IncidentHeader component
4. ✅ Verified Tabs component exists

---

**Document Status:** ✅ Complete

**Related Documents:**
- [01-vision-and-scope.md](01-vision-and-scope.md) - Product vision and scope
- [03-ux-design.md](03-ux-design.md) - UX design patterns
- [06-technical-implementation.md](06-technical-implementation.md) - Technical architecture
