# BMAD Web Server - Architecture & Security Design

**Project:** BMAD Web Server with Full UI
**Version:** 1.0.0
**Date:** 2025-02-15
**Architects:** Winston (System Architect), Bastion (Security Architect)
**Security Level:** ENHANCED (Enterprise-ready, Zero-Trust)

---

## INDEX

| Section | Lines | Description |
|---------|-------|-------------|
| [1. Architecture Overview](#1-architecture-overview) | 17-99 | High-level architecture diagram, technology stack |
| [2. Zero-Trust Security](#2-enhanced-security-architecture-zero-trust) | 102-188 | Principles, trust boundaries, controls matrix |
| [3. Prompt Injection Defense](#3-prompt-injection-defense-layer) | 191-266 | Threat model, defense strategy, implementation |
| [4. Auth & Authorization](#4-authentication--authorization) | 270-340 | Auth flow, RBAC, authorization pattern |
| [5. Data Architecture](#5-data-architecture) | 344-422 | Database schema (Prisma), deployment models |
| [6. API Design](#6-api-design) | 426-468 | RESTful endpoints, SSE streaming |
| [7. Deployment Architecture](#7-deployment-architecture) | 472-523 | Container strategy, Docker Compose |
| [8. Security Monitoring](#8-security-monitoring--incident-response) | 527-545 | Monitoring metrics, incident response |
| [9. Future Considerations](#9-future-considerations-phase-2) | 550-557 | Multi-tenant, visual workflows, marketplace |
| [10. Security Checklist](#10-security-checklist) | 561-583 | Pre-deployment security verification |
| [Appendix: Key Decisions](#appendix-key-decisions-rationale) | 587-599 | Architectural decision rationale |

---

## Executive Summary

This document defines the technical architecture and enhanced security model for the BMAD Web Server. The system follows a **monolith-first architecture** designed for future microservice extraction, with **zero-trust security principles** applied at every layer.

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BMAD Web Server (Monolith)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        PRESENTATION LAYER                             │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Web UI (Next.js 14+ App Router + TypeScript)                   │  │  │
│  │  │  - shadcn/ui + Tailwind CSS                                    │  │  │
│  │  │  - Server-Side Rendering (SSR)                                  │  │  │
│  │  │  - Zustand (client state)                                       │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        API GATEWAY LAYER (Trusted Boundary)           │  │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────────────┐   │  │
│  │  │   Auth    │ │ Rate      │ │ Input     │ │  CORS + CSRF        │   │  │
│  │  │ (Auth.js) │ │ Limit     │ │ Validate  │ │  Helmet.js          │   │  │
│  │  │           │ │           │ │ (Zod)     │ │                     │   │  │
│  │  └───────────┘ └───────────┘ └───────────┘ └─────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        APPLICATION LAYER                             │  │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────┐   │  │
│  │  │  Workflow Engine │ │  Agent Orchestr. │ │  Template Engine   │   │  │
│  │  │  (BMAD Core)     │ │  (Abdul)         │ │  (Enterprise)      │   │  │
│  │  └──────────────────┘ └──────────────────┘ └────────────────────┘   │  │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────┐   │  │
│  │  │  Session Mgmt    │ │  Real-time       │ │  Audit Logger      │   │  │
│  │  │  (Project State) │ │  (SSE/WS)        │ │  (All actions)     │   │  │
│  │  └──────────────────┘ └──────────────────┘ └────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        DATA LAYER                                    │  │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────┐   │  │
│  │  │  Prisma ORM      │ │   SQLite         │ │   File System      │   │  │
│  │  │  (Abstraction)   │ │  (Local/Cloud)   │ │  (BMAD Outputs)    │   │  │
│  │  └──────────────────┘ └──────────────────┘ └────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        EXTERNAL INTEGRATIONS                         │  │
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────┐   │  │
│  │  │  Claude/LLM      │ │   n8n (Future)   │ │  SAML/SSO          │   │  │
│  │  │  Provider        │ │   Visual WF      │ │  (Enterprise)      │   │  │
│  │  └──────────────────┘ └──────────────────┘ └────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| **Frontend Framework** | Next.js | 14+ | SSR, API routes, TypeScript native, React 18 |
| **UI Components** | shadcn/ui | Latest | Beautiful, accessible, no vendor lock-in |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first, JIT, small bundle |
| **State Management** | Zustand | 4+ | Lightweight, TypeScript-first, minimal boilerplate |
| **Backend Runtime** | Node.js | 20 LTS | Current LTS, native ESM, performance |
| **API Framework** | Fastify | 4+ | Fast, TypeScript-first, plugin architecture |
| **Database ORM** | Prisma | 5+ | Type-safe, great migration story, multi-database |
| **Database (Local)** | SQLite | 3.40+ | Zero-config, single-file deployment |
| **Database (Cloud)** | PostgreSQL | 15+ | Enterprise features, proven reliability |
| **Authentication** | Auth.js (NextAuth) | 5+ | OAuth, SAML, credentials, extensive providers |
| **Real-time** | Server-Sent Events | Native | Simple, one-way stream (agent observability) |
| **Validation** | Zod | 3+ | TypeScript-first, runtime validation |
| **Security Headers** | Helmet | 7+ | OWASP recommendations, easy setup |
| **Containerization** | Docker | 24+ | Self-hosted deployment, consistency |
| **Process Manager** | PM2 | 5+ | Production-ready, monitoring, clustering |

---

## 2. Enhanced Security Architecture (Zero-Trust)

### 2.1 Zero-Trust Principles

> "Never trust, always verify" - applied at every layer

| Principle | Implementation |
|-----------|----------------|
| **Verify explicitly** | All requests authenticated and authorized |
| **Least privilege** | Role-based access, minimal required permissions |
| **Assume breach** | Defense in depth, audit everything, detect anomalies |
| **Secure by default** | All inputs validated, all outputs sanitized |

### 2.2 Trust Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ZONE 0: UNTRUSTED (Internet)                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  User Browser (Potentially Hostile)                                  │  │
│  │  - Validate all client-side input                                    │  │
│  │  - Never trust client assertions                                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼ JWT/Session Token (HttpOnly, Secure, SameSite)
┌─────────────────────────────────────────────────────────────────────────────┐
│  ZONE 1: PERIMETER (API Gateway)                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Security Controls:                                                  │  │
│  │  1. Rate Limiting (per IP, per user, per endpoint)                   │  │
│  │  2. Input Validation (Zod schemas, max length, type checking)        │  │
│  │  3. CORS Policy (strict origin whitelist)                            │  │
│  │  4. CSRF Protection (token validation)                               │  │
│  │  5. Security Headers (Helmet.js - HSTS, CSP, X-Frame-Options)        │  │
│  │  6. Request ID (traceability across layers)                          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼ Service-to-Service Token / Context Propagation
┌─────────────────────────────────────────────────────────────────────────────┐
│  ZONE 2: APPLICATION (Business Logic)                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Security Controls:                                                  │  │
│  │  1. Authorization Check (RBAC: Admin, User, ReadOnly)                │  │
│  │  2. Resource Access Control (user-scoped data)                       │  │
│  │  3. Prompt Injection Protection (LLM input/output filtering)         │  │
│  │  4. Audit Logging (all agent invocations, file operations)           │  │
│  │  5. Session Management (timeout, refresh, concurrent limits)         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼ Verified File Access (Path validation, permission check)
┌─────────────────────────────────────────────────────────────────────────────┐
│  ZONE 3: DATA (Persistent Storage)                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Security Controls:                                                  │  │
│  │  1. Encrypted at Rest (database encryption)                          │  │
│  │  2. Encrypted in Transit (TLS 1.3+)                                  │  │
│  │  3. Backup Security (encrypted, access controlled)                   │  │
│  │  4. Data Retention (auto-purge per policy)                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Security Controls Matrix

| Control | Implementation | Priority | Notes |
|---------|----------------|----------|-------|
| **Authentication** | Auth.js with SAML SSO | P0 | Enterprise: MFA required |
| **Authorization** | RBAC with role hierarchy | P0 | Admin, User, ReadOnly, API |
| **Session Management** | HttpOnly cookies, 15min TTL | P0 | Sliding expiration, secure flag |
| **Password Policy** | Min 12 chars, entropy check | P0 | Bcrypt with cost factor 12 |
| **MFA** | TOTP (Google Auth) | P0 | Enterprise mandatory, optional community |
| **API Security** | Bearer JWT, refresh token pattern | P0 | Short-lived access (15min), long-lived refresh (7d) |
| **Rate Limiting** | 100 req/min per user, 1000/hr | P0 | Redis-backed for distributed |
| **Input Validation** | Zod schemas on ALL inputs | P0 | Reject unknown properties |
| **Output Encoding** | DOMPurify for HTML, JSON escape | P0 | Prevent XSS |
| **CSRF Protection** | Synchronizer token pattern | P0 | Double-submit cookie |
| **CORS Policy** | Strict origin whitelist | P0 | No wildcards in production |
| **Security Headers** | Helmet.js with HSTS, CSP, XFO | P0 | Report-Only mode in dev |
| **Prompt Injection** | Input sanitization, output filtering | P0 | LLM response pattern matching |
| **Audit Logging** | All auth, agent, file operations | P0 | Immutable append-only log |
| **Encryption at Rest** | Database encryption, env vault | P1 | SQLite key derivation, Postgres transparent |
| **Secrets Management** | Environment variables, no code | P0 | .env files gitignored, .env.example |
| **Dependency Scanning** | npm audit, Snyk, Renovate | P1 | Automated PRs for updates |

---

## 3. Prompt Injection Defense Layer

### 3.1 Threat Model

LLM systems are vulnerable to prompt injection attacks where malicious input attempts to:
- Override system instructions
- Exfiltrate sensitive data
- Execute unauthorized operations
- Modify agent behavior

### 3.2 Defense Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PROMPT INJECTION DEFENSE LAYER                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STAGE 1: INPUT SANITIZATION                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  • Strip control sequences: <system>, <admin>, <instruction>, etc.    │  │
│  │  • Normalize whitespace (prevent unicode homoglyphs)                   │  │
│  │  • Maximum token limit enforcement                                    │  │
│  │  • Regex pattern matching for known attack signatures                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  STAGE 2: CONTEXT VALIDATION                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  • Verify user session has permission for requested agent/workflow   │  │
│  │  • Validate file paths are within allowed directories               │  │
│  │  • Check operation against user's role constraints                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  STAGE 3: OUTPUT FILTERING                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  • Pattern match for suspicious content in LLM responses             │  │
│  │  • Block embedded instructions, code execution attempts               │  │
│  │  • Flag responses containing file paths, system commands             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  STAGE 4: AUDIT & ALERTING                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  • Log all prompts that trigger heuristics                          │  │
│  │  • Alert on repeated pattern matches                                │  │
│  │  • Maintain hash chain for tamper evidence                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Implementation Pattern

```typescript
// Example: Prompt Injection Middleware
import { z } from 'zod';

const promptInjectionSchema = z.string()
  .max(10000) // Token limit
  .refine(input => !/<(system|admin|instruction|agent)>/i.test(input), {
    message: 'Invalid input pattern detected'
  })
  .refine(input => !/ignore (previous|all|above)/i.test(input), {
    message: 'Instruction override attempt detected'
  })
  .transform(input => input.normalize('NFKC')) // Unicode normalization
  .transform(input => input.replace(/\s+/g, ' ')); // Normalize whitespace

// Apply to all user-facing inputs
const userInputSchema = z.object({
  message: promptInjectionSchema,
  agent: z.enum(allowedAgents),
  workflow: z.string().optional(),
});
```

---

## 4. Authentication & Authorization

### 4.1 Auth Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AUTHENTICATION FLOW (Enhanced with MFA)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. User enters credentials                                                  │
│       │                                                                     │
│       ▼                                                                     │
│  2. Server validates:                                                       │
│     • Email format (Zod)                                                    │
│     • Password strength (entropy check)                                     │
│     • Rate limit check (max 5 attempts/min)                                 │
│     • User account status (active, not locked)                              │
│       │                                                                     │
│       ▼                                                                     │
│  3. If valid, generate MFA challenge                                        │
│       │                                                                     │
│       ▼                                                                     │
│  4. User provides TOTP code (Enterprise: MANDATORY)                         │
│       │                                                                     │
│       ▼                                                                     │
│  5. Server validates TOTP                                                   │
│       │                                                                     │
│       ▼                                                                     │
│  6. Generate session tokens:                                                │
│     • Access Token: JWT, 15min expiry, contains user ID, role, permissions  │
│     • Refresh Token: HttpOnly cookie, 7 day expiry, rotation enabled       │
│     • Session ID: Database record for revocation                            │
│       │                                                                     │
│       ▼                                                                     │
│  7. Return authenticated session                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Role-Based Access Control (RBAC)

| Role | Permissions | Use Case |
|------|-------------|----------|
| **SuperAdmin** | All operations, user management, system config | Platform owner |
| **Admin** | All operations within org, user management | Enterprise admin |
| **User** | Invoke agents, run workflows, manage own projects | Standard user |
| **ReadOnly** | View outputs, no write operations | Stakeholder, executive |
| **API** | Programmatic access, rate-limited, scoped tokens | Automation, integrations |

### 4.3 Authorization Pattern

```typescript
// Example: Authorization Middleware
import { auth } from '@/lib/auth';

const requireRole = (roles: Role[]) => {
  return async (req: Request) => {
    const session = await auth();
    if (!session?.user || !roles.includes(session.user.role)) {
      throw new AuthorizationError('Insufficient permissions');
    }
    return session;
  };
};

// Usage in API routes
app.post('/api/workflows/execute',
  requireRole(['Admin', 'User']),
  handleWorkflowExecution
);
```

---

## 5. Data Architecture

### 5.1 Database Schema (Prisma)

```prisma
// Core schema for BMAD Web Server
datasource db {
  provider = "postgresql" // or "sqlite" for local
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String
  role          Role      @default(USER)
  mfaEnabled    Boolean   @default(false)
  mfaSecret     String?   @unique
  sessions      Session[]
  projects      Project[]
  auditLogs     AuditLog[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  token        String   @unique
  expiresAt    DateTime
  lastActiveAt DateTime @updatedAt
  createdAt    DateTime @default(now())
}

model Project {
  id          String   @id @default(cuid())
  name        String
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  modules     String[] // cybersec, intel, legal, etc.
  phase       String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  action     String
  resource   String
  details    Json
  ipAddress  String?
  userAgent  String?
  timestamp  DateTime @default(now())
}

enum Role {
  SUPER_ADMIN
  ADMIN
  USER
  READ_ONLY
  API
}
```

### 5.2 Deployment Models

| Model | Database | Auth | Deployment |
|-------|----------|------|------------|
| **Local/Community** | SQLite file | Optional (localhost) | Single container, npm start |
| **Cloud/Enterprise** | PostgreSQL | SAML SSO + MFA | Kubernetes, managed DB |

---

## 6. API Design

### 6.1 RESTful Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/health | Health check | None |
| POST | /api/auth/login | Authenticate | None |
| POST | /api/auth/logout | Terminate session | User+ |
| GET | /api/auth/session | Get current session | User+ |
| GET | /api/agents | List available agents | User+ |
| GET | /api/agents/:id | Get agent details | User+ |
| POST | /api/agents/:id/invoke | Invoke agent | User+ |
| GET | /api/workflows | List workflows | User+ |
| POST | /api/workflows/:id/execute | Execute workflow | User+ |
| GET | /api/projects | List user projects | User+ |
| POST | /api/projects | Create project | User+ |
| GET | /api/projects/:id | Get project details | User+ |
| PUT | /api/projects/:id | Update project | User+ |
| GET | /api/templates | List output templates | User+ |
| POST | /api/admin/users | Create user (admin) | Admin+ |
| GET | /api/admin/audit | Audit logs | Admin+ |

### 6.2 Real-Time Communication (SSE)

Server-Sent Events for agent observability:

```typescript
// Agent progress streaming
app.get('/api/agents/:id/observe', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const agent = await loadAgent(req.params.id);
  agent.on('progress', (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  req.on('close', () => {
    agent.dispose();
  });
});
```

---

## 7. Deployment Architecture

### 7.1 Container Strategy

```dockerfile
# Multi-stage build for production
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 42001
CMD ["npm", "start"]
```

### 7.2 Docker Compose (Self-Hosted)

```yaml
version: '3.8'
services:
  bmad-web:
    build: .
    ports:
      - "42001:42001"
    environment:
      - DATABASE_URL=file:./dev.db
      - NODE_ENV=production
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    volumes:
      - ./data:/app/data
      - ./_bmad-output:/app/_bmad-output
    restart: unless-stopped

  # Optional: Postgres for enterprise
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=bmad
      - POSTGRES_USER=bmad
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
```

---

## 8. Security Monitoring & Incident Response

### 8.1 Monitoring

| Metric | Threshold | Action |
|--------|-----------|--------|
| Failed auth attempts/IP | 10/min | Block IP, alert |
| Failed auth attempts/user | 5/min | Lock account, notify |
| Rate limit violations | 100/min/hour | Throttle, log |
| Suspicious prompt patterns | Any | Flag for review, audit |
| API errors | 5% rate | Alert ops team |

### 8.2 Incident Response

1. **Detection** - Automated alerts from monitoring
2. **Containment** - Revoke sessions, block IPs, stop services
3. **Investigation** - Audit log analysis, pattern analysis
4. **Recovery** - Restore from backup, patch vulnerabilities
5. **Post-Mortem** - Document lessons learned, update controls

---

## 9. Future Considerations (Phase 2+)

| Feature | Architecture Impact |
|---------|---------------------|
| **Multi-tenant collaboration** | Add tenant_id to all models, row-level security |
| **Visual workflow builder** | n8n integration, OAuth proxy |
| **Agent marketplace** | Agent registry, signing/verification, sandboxing |
| **Workflow translation** | Enterprise workflow parser, mapping engine |
| **Advanced observability** | OpenTelemetry integration, distributed tracing |

---

## 10. Security Checklist

- [ ] All inputs validated with Zod schemas
- [ ] All outputs sanitized before rendering/storing
- [ ] Authentication required for all non-public endpoints
- [ ] Authorization checked on every protected operation
- [ ] Sessions have timeout and refresh mechanism
- [ ] MFA available (Enterprise: mandatory)
- [ ] Rate limiting enforced per user/IP
- [ ] CORS policy restricts origins
- [ ] CSRF protection enabled
- [ ] Security headers (Helmet.js) configured
- [ ] Passwords hashed with bcrypt (cost ≥ 12)
- [ ] Secrets never committed to code
- [ ] Audit logging enabled for all sensitive operations
- [ ] Prompt injection defenses implemented
- [ ] LLM outputs filtered before execution
- [ ] File access validated and scoped
- [ ] Dependencies scanned regularly
- [ ] TLS 1.3+ enforced in production
- [ ] Database encrypted at rest (Enterprise)
- [ ] Backup encryption enabled
- [ ] Incident response plan documented

---

## Appendix: Key Decisions Rationale

| Decision | Rationale |
|----------|-----------|
| **Monolith architecture** | Simpler deployment, easier for self-hosted users, aligns with current stack, microservices premature |
| **Next.js with App Router** | SSR for demo site, API routes for backend, TypeScript throughout, single codebase |
| **shadcn/ui + Tailwind** | Beautiful components, no vendor lock-in, small bundle size, great DX |
| **Prisma ORM** | Type-safe queries, multi-database support, great migration story |
| **Auth.js for authentication** | OAuth providers, SAML support for enterprise, local auth option, well-maintained |
| **SSE for real-time** | Simpler than WebSockets, one-way stream sufficient for observability, native browser support |
| **Enhanced security level** | Enterprise-ready requirements, zero-trust compliance, audit trail necessity |
| **n8n integration vs building** | Leverage existing tool for visual workflows, focus AI effort on guided conversation |
