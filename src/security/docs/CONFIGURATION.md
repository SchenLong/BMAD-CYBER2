# Security Configuration Guide

## 🔧 Epic 1 Security Infrastructure Configuration

This comprehensive guide covers all configuration aspects of the Epic 1 Security Infrastructure, from development setup to production deployment.

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [Security Parameters](#security-parameters)
3. [Subsystem Configuration](#subsystem-configuration)
4. [Production Deployment](#production-deployment)
5. [Performance Tuning](#performance-tuning)
6. [Troubleshooting](#troubleshooting)
7. [Security Hardening](#security-hardening)

## 🚀 Environment Setup

### Prerequisites

```bash
# System Requirements
Node.js >= 16.0.0
TypeScript >= 4.5.0
Redis >= 6.0 (for caching and rate limiting)
PostgreSQL >= 13.0 (for audit logs)

# Development Tools
Docker >= 20.0
Kubernetes >= 1.20 (for production)
Helm >= 3.0 (optional)
```

### Installation

```bash
# Clone repository
git clone [repository-url]
cd bmad-cyber2/src/security

# Install dependencies
npm install

# Install TypeScript globally (if not already installed)
npm install -g typescript

# Build the project
npm run build
```

### Environment Files

Create environment configuration files for different deployment environments:

```bash
# Development environment
cp .env.example .env.development

# Testing environment
cp .env.example .env.test

# Production environment
cp .env.example .env.production
```

## 🔐 Security Parameters

### Core Environment Variables

```bash
# .env configuration template

#==========================================
# CORE SECURITY CONFIGURATION
#==========================================

# Application Environment
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Security Mode
SECURITY_STRICT_MODE=true
SECURITY_DEBUG=false

#==========================================
# ENCRYPTION CONFIGURATION
#==========================================

# Encryption Algorithm Settings
ENCRYPTION_ALGORITHM=aes-256-gcm
ENCRYPTION_KEY_LENGTH=32
ENCRYPTION_IV_LENGTH=16

# Key Derivation
KEY_DERIVATION_ALGORITHM=argon2id
KEY_DERIVATION_SALT_ROUNDS=12
KEY_DERIVATION_MEMORY=65536
KEY_DERIVATION_TIME=3
KEY_DERIVATION_PARALLELISM=1

# Master Keys (generate with: openssl rand -base64 32)
ENCRYPTION_MASTER_KEY=your-base64-encoded-master-key
ENCRYPTION_BACKUP_KEY=your-base64-encoded-backup-key

# Key Rotation
KEY_ROTATION_ENABLED=true
KEY_ROTATION_INTERVAL=86400000  # 24 hours
KEY_VERSION=1

# Token Configuration
TOKEN_SECRET=your-jwt-secret-key
TOKEN_EXPIRY=3600000           # 1 hour
TOKEN_REFRESH_EXPIRY=604800000 # 7 days
TOKEN_ALGORITHM=HS256

#==========================================
# RBAC CONFIGURATION
#==========================================

# Role-Based Access Control
RBAC_ENABLED=true
RBAC_DEFAULT_ROLE=user
RBAC_SUPER_ADMIN_ROLE=super_admin

# Session Management
SESSION_TIMEOUT=1800000        # 30 minutes
SESSION_MAX_CONCURRENT=5
SESSION_SECURE_COOKIES=true
SESSION_SAME_SITE=strict

# Permission Caching
PERMISSION_CACHE_ENABLED=true
PERMISSION_CACHE_TTL=300000    # 5 minutes
PERMISSION_CACHE_MAX_SIZE=10000

# Role Hierarchy
RBAC_INHERITANCE_ENABLED=true
RBAC_MAX_ROLE_DEPTH=5
RBAC_MAX_PERMISSIONS_PER_ROLE=100

#==========================================
# AUDIT CONFIGURATION
#==========================================

# Audit Logging
AUDIT_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_STRUCTURED_LOGS=true

# Log Retention
AUDIT_RETENTION_DAYS=90
AUDIT_COMPRESS_LOGS=true
AUDIT_ARCHIVE_ENABLED=true

# SIEM Integration
SIEM_ENABLED=true
SIEM_ENDPOINT=https://your-siem-server.com/api/events
SIEM_API_KEY=your-siem-api-key
SIEM_BATCH_SIZE=100
SIEM_FLUSH_INTERVAL=30000      # 30 seconds

# Compliance Reporting
COMPLIANCE_ENABLED=true
COMPLIANCE_STANDARDS=SOC2,GDPR,HIPAA
COMPLIANCE_REPORT_INTERVAL=86400000  # Daily

# Event Storage
AUDIT_DATABASE_URL=postgresql://user:pass@localhost:5432/audit_db
AUDIT_TABLE_PREFIX=epic1_audit

#==========================================
# MONITORING CONFIGURATION
#==========================================

# Health Checks
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_INTERVAL=30000    # 30 seconds
HEALTH_CHECK_TIMEOUT=5000      # 5 seconds

# Performance Monitoring
MONITORING_ENABLED=true
MONITORING_METRICS_ENABLED=true
MONITORING_TRACING_ENABLED=true

# Alert Thresholds
ALERT_CPU_THRESHOLD=80
ALERT_MEMORY_THRESHOLD=85
ALERT_ERROR_THRESHOLD=10
ALERT_LATENCY_THRESHOLD=1000   # 1 second

# Notification Channels
ALERT_EMAIL_ENABLED=true
ALERT_EMAIL_RECIPIENTS=security@company.com,ops@company.com
ALERT_SLACK_ENABLED=true
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/your-webhook

# Metrics Export
METRICS_PROMETHEUS_ENABLED=true
METRICS_PROMETHEUS_PORT=9090
METRICS_COLLECTION_INTERVAL=15000  # 15 seconds

#==========================================
# VALIDATION CONFIGURATION
#==========================================

# Input Validation
VALIDATION_STRICT_MODE=true
VALIDATION_MAX_PAYLOAD_SIZE=10485760  # 10MB
VALIDATION_SANITIZE_HTML=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=3600000      # 1 hour
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_SKIP_SUCCESSFUL=true

# IP Filtering
IP_WHITELIST_ENABLED=false
IP_BLACKLIST_ENABLED=true
TRUSTED_PROXIES=10.0.0.0/8,172.16.0.0/12,192.168.0.0/16

# DDoS Protection
DDOS_PROTECTION_ENABLED=true
DDOS_BURST_SIZE=100
DDOS_RATE_LIMIT=1000

# Command Injection Protection
BASH_SAFETY_ENABLED=true
COMMAND_WHITELIST_ENABLED=true
SHELL_COMMANDS_BLOCKED=true

#==========================================
# TESTING CONFIGURATION
#==========================================

# Security Testing
SECURITY_TESTS_ENABLED=true
AUTOMATED_TESTING_ENABLED=true

# OWASP Testing
OWASP_TESTS_ENABLED=true
OWASP_SCAN_INTERVAL=86400000   # Daily

# Penetration Testing
PENTEST_ENABLED=false          # Enable only in test environments
PENTEST_SCHEDULE=weekly

# Vulnerability Scanning
VULN_SCAN_ENABLED=true
VULN_SCAN_SEVERITY_THRESHOLD=medium

#==========================================
# DATABASE CONFIGURATION
#==========================================

# Primary Database
DATABASE_URL=postgresql://user:pass@localhost:5432/app_db
DATABASE_SSL=true
DATABASE_POOL_SIZE=10
DATABASE_CONNECTION_TIMEOUT=30000

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
REDIS_MAX_CONNECTIONS=10

# Database Encryption
DB_ENCRYPTION_ENABLED=true
DB_ENCRYPTION_ALGORITHM=aes-256-gcm

#==========================================
# NETWORK CONFIGURATION
#==========================================

# TLS Configuration
TLS_ENABLED=true
TLS_MIN_VERSION=TLSv1.2
TLS_CERT_PATH=/path/to/certificate.crt
TLS_KEY_PATH=/path/to/private.key
TLS_CA_PATH=/path/to/ca-bundle.crt

# CORS Configuration
CORS_ENABLED=true
CORS_ORIGIN=https://your-frontend-domain.com
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOW_CREDENTIALS=true

# HTTP Security Headers
HSTS_ENABLED=true
HSTS_MAX_AGE=31536000         # 1 year
CSP_ENABLED=true
X_FRAME_OPTIONS=DENY

#==========================================
# INTEGRATION CONFIGURATION
#==========================================

# External Services
HSM_ENABLED=false
HSM_ENDPOINT=https://your-hsm-service.com
HSM_API_KEY=your-hsm-api-key

# Key Management Service
KMS_PROVIDER=aws                # aws, azure, gcp, vault
KMS_KEY_ID=your-kms-key-id
KMS_REGION=us-west-2

# Identity Provider Integration
IDP_ENABLED=false
IDP_TYPE=saml                   # saml, oauth2, oidc
IDP_ENDPOINT=https://your-idp.com
IDP_CLIENT_ID=your-client-id
IDP_CLIENT_SECRET=your-client-secret

#==========================================
# PERFORMANCE CONFIGURATION
#==========================================

# Caching
CACHE_ENABLED=true
CACHE_TTL=300000               # 5 minutes
CACHE_MAX_SIZE=100000000       # 100MB

# Connection Pools
HTTP_POOL_SIZE=100
HTTP_POOL_TIMEOUT=30000

# Memory Management
MEMORY_LIMIT=1073741824        # 1GB
GC_INTERVAL=60000              # 1 minute

#==========================================
# DEVELOPMENT CONFIGURATION
#==========================================

# Development Only (set to false in production)
DEBUG_MODE=false
VERBOSE_LOGGING=false
SECURITY_BYPASS=false          # NEVER set to true in production
MOCK_EXTERNAL_SERVICES=false

#==========================================
# BACKUP AND RECOVERY
#==========================================

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_INTERVAL=86400000       # Daily
BACKUP_RETENTION=30            # 30 days
BACKUP_ENCRYPTION=true

# Disaster Recovery
DR_ENABLED=true
DR_REPLICATION_ENABLED=true
DR_FAILOVER_ENABLED=true
```

## ⚙️ Subsystem Configuration

### 1. Encryption Subsystem Configuration

```typescript
// encryption-config.ts
export const encryptionConfig = {
  // Algorithm Configuration
  algorithms: {
    symmetric: {
      primary: 'aes-256-gcm',
      fallback: 'aes-256-cbc',
      keyLength: 32,
      ivLength: 16,
      tagLength: 16
    },
    asymmetric: {
      primary: 'rsa-4096',
      fallback: 'rsa-2048',
      paddingScheme: 'oaep'
    },
    hashing: {
      primary: 'sha256',
      fallback: 'sha1',
      iterations: 10000
    }
  },

  // Key Management
  keyManagement: {
    rotation: {
      enabled: true,
      interval: 24 * 60 * 60 * 1000, // 24 hours
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    derivation: {
      algorithm: 'argon2id',
      saltLength: 32,
      iterations: 3,
      memory: 65536,
      parallelism: 1
    },
    storage: {
      provider: 'aws-kms', // aws-kms, azure-kv, gcp-kms, vault
      region: 'us-west-2',
      keyId: process.env.KMS_KEY_ID
    }
  },

  // Token Configuration
  tokens: {
    jwt: {
      algorithm: 'HS256',
      expiresIn: '1h',
      refreshExpiresIn: '7d',
      issuer: 'epic1-security',
      audience: 'epic1-app'
    },
    session: {
      length: 32,
      expiry: 30 * 60 * 1000, // 30 minutes
      secure: true,
      httpOnly: true,
      sameSite: 'strict'
    }
  }
};
```

### 2. RBAC Subsystem Configuration

```typescript
// rbac-config.ts
export const rbacConfig = {
  // Role Hierarchy
  roles: {
    super_admin: {
      level: 0,
      permissions: ['*'],
      inherits: []
    },
    admin: {
      level: 1,
      permissions: ['users.*', 'system.read', 'audit.read'],
      inherits: ['manager']
    },
    manager: {
      level: 2,
      permissions: ['users.read', 'reports.*'],
      inherits: ['user']
    },
    user: {
      level: 3,
      permissions: ['profile.*', 'data.read'],
      inherits: []
    },
    guest: {
      level: 4,
      permissions: ['public.read'],
      inherits: []
    }
  },

  // Permission Configuration
  permissions: {
    syntax: 'resource.action',
    wildcards: true,
    contextual: true,
    temporal: true
  },

  // Session Configuration
  sessions: {
    timeout: 30 * 60 * 1000, // 30 minutes
    maxConcurrent: 5,
    extendOnActivity: true,
    secureTransport: true
  },

  // Caching Configuration
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 10000,
    invalidateOnChange: true
  }
};
```

### 3. Audit Subsystem Configuration

```typescript
// audit-config.ts
export const auditConfig = {
  // Event Categories
  eventTypes: {
    authentication: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED'],
    authorization: ['ACCESS_GRANTED', 'ACCESS_DENIED'],
    dataAccess: ['READ', 'CREATE', 'UPDATE', 'DELETE'],
    system: ['STARTUP', 'SHUTDOWN', 'CONFIG_CHANGE'],
    security: ['THREAT_DETECTED', 'ANOMALY', 'INCIDENT']
  },

  // Log Configuration
  logging: {
    level: 'info',
    format: 'json',
    structured: true,
    includeStackTrace: false,
    sanitization: {
      enabled: true,
      piiFields: ['email', 'phone', 'ssn', 'creditCard']
    }
  },

  // Storage Configuration
  storage: {
    primary: {
      type: 'postgresql',
      connectionString: process.env.AUDIT_DATABASE_URL,
      table: 'audit_events',
      partitioning: 'monthly'
    },
    archive: {
      enabled: true,
      type: 's3',
      bucket: 'audit-logs-archive',
      compression: 'gzip',
      encryption: true
    }
  },

  // SIEM Integration
  siem: {
    enabled: true,
    endpoint: process.env.SIEM_ENDPOINT,
    apiKey: process.env.SIEM_API_KEY,
    batchSize: 100,
    flushInterval: 30000,
    format: 'cef', // cef, json, syslog
    retry: {
      enabled: true,
      maxAttempts: 3,
      backoff: 'exponential'
    }
  },

  // Compliance Configuration
  compliance: {
    standards: ['SOC2', 'GDPR', 'HIPAA'],
    reporting: {
      enabled: true,
      schedule: '0 0 * * *', // Daily at midnight
      format: 'pdf',
      recipients: ['compliance@company.com']
    },
    retention: {
      period: 90 * 24 * 60 * 60 * 1000, // 90 days
      archival: true,
      deletion: 'secure'
    }
  }
};
```

### 4. Monitoring Subsystem Configuration

```typescript
// monitoring-config.ts
export const monitoringConfig = {
  // Health Check Configuration
  healthCheck: {
    enabled: true,
    interval: 30000, // 30 seconds
    timeout: 5000,   // 5 seconds
    endpoints: [
      '/health',
      '/ready',
      '/metrics'
    ]
  },

  // Metrics Configuration
  metrics: {
    enabled: true,
    collection: {
      interval: 15000, // 15 seconds
      retention: 7 * 24 * 60 * 60 * 1000 // 7 days
    },
    prometheus: {
      enabled: true,
      port: 9090,
      path: '/metrics'
    }
  },

  // Alert Configuration
  alerting: {
    enabled: true,
    thresholds: {
      cpu: 80,           // CPU usage %
      memory: 85,        // Memory usage %
      errorRate: 5,      // Error rate %
      latency: 1000,     // Response time ms
      diskSpace: 90      // Disk usage %
    },
    channels: {
      email: {
        enabled: true,
        recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
        smtp: {
          host: process.env.SMTP_HOST,
          port: 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        }
      },
      slack: {
        enabled: true,
        webhook: process.env.ALERT_SLACK_WEBHOOK,
        channel: '#security-alerts'
      },
      pagerDuty: {
        enabled: false,
        apiKey: process.env.PAGERDUTY_API_KEY,
        serviceId: process.env.PAGERDUTY_SERVICE_ID
      }
    }
  },

  // Tracing Configuration
  tracing: {
    enabled: true,
    sampling: 0.1, // 10% sampling rate
    jaeger: {
      enabled: false,
      endpoint: 'http://jaeger:14268/api/traces'
    }
  }
};
```

### 5. Validation Subsystem Configuration

```typescript
// validation-config.ts
export const validationConfig = {
  // Rate Limiting Configuration
  rateLimiting: {
    enabled: true,
    global: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 1000,
      skipSuccessfulRequests: true
    },
    perUser: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100
    },
    perIP: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 200
    },
    storage: {
      type: 'redis',
      connectionString: process.env.REDIS_URL
    }
  },

  // Input Validation Configuration
  inputValidation: {
    enabled: true,
    maxPayloadSize: 10 * 1024 * 1024, // 10MB
    sanitization: {
      html: true,
      sql: true,
      xss: true
    },
    schemaValidation: {
      enabled: true,
      strict: true,
      additionalProperties: false
    }
  },

  // Command Injection Protection
  bashSafety: {
    enabled: true,
    whitelistCommands: ['git', 'npm', 'node'],
    blockShellCommands: true,
    logViolations: true
  },

  // DDoS Protection
  ddosProtection: {
    enabled: true,
    burstSize: 100,
    rateLimit: 1000, // requests per second
    whitelistIPs: ['127.0.0.1', '::1'],
    blacklistIPs: []
  }
};
```

### 6. Testing Subsystem Configuration

```typescript
// testing-config.ts
export const testingConfig = {
  // Security Testing Configuration
  securityTesting: {
    enabled: true,
    automated: true,
    schedule: '0 2 * * *', // Daily at 2 AM
    parallel: true,
    timeout: 30 * 60 * 1000 // 30 minutes
  },

  // OWASP Testing Configuration
  owaspTesting: {
    enabled: true,
    testSuites: [
      'injection',
      'broken_authentication',
      'sensitive_data_exposure',
      'xml_external_entities',
      'broken_access_control',
      'security_misconfiguration',
      'xss',
      'insecure_deserialization',
      'vulnerable_components',
      'insufficient_logging'
    ],
    severityThreshold: 'medium'
  },

  // Penetration Testing Configuration
  penetrationTesting: {
    enabled: false, // Enable only in test environments
    schedule: 'weekly',
    scope: ['web', 'api', 'infrastructure'],
    reporting: {
      format: 'json',
      destination: '/var/log/security/pentest'
    }
  },

  // Vulnerability Scanning
  vulnerabilityScanning: {
    enabled: true,
    scanners: ['snyk', 'owasp-dependency-check'],
    schedule: '0 0 * * 0', // Weekly on Sunday
    severityThreshold: 'medium',
    autoRemediation: false
  }
};
```

## 🏭 Production Deployment Configuration

### Docker Configuration

```dockerfile
# Dockerfile.production
FROM node:16-alpine AS builder

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY src/ ./src/
COPY tsconfig.json ./

# Build application
RUN npm run build

# Production stage
FROM node:16-alpine AS production

# Install security updates and create non-root user
RUN apk update && apk upgrade && apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S epic1 -u 1001

# Set working directory
WORKDIR /app

# Copy application from builder stage
COPY --from=builder --chown=epic1:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=epic1:nodejs /app/dist ./dist
COPY --from=builder --chown=epic1:nodejs /app/package*.json ./

# Switch to non-root user
USER epic1

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# Start application with init system
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### Kubernetes Configuration

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: epic1-security
  namespace: security
  labels:
    app: epic1-security
    version: "1.0.0"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: epic1-security
  template:
    metadata:
      labels:
        app: epic1-security
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: epic1-security-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
      containers:
      - name: epic1-security
        image: epic1-security:1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3000
          name: http
          protocol: TCP
        - containerPort: 9090
          name: metrics
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: LOG_LEVEL
          value: "info"
        envFrom:
        - secretRef:
            name: epic1-security-secrets
        - configMapRef:
            name: epic1-security-config
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /startup
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 30
        volumeMounts:
        - name: logs
          mountPath: /var/log/security
        - name: config
          mountPath: /app/config
          readOnly: true
      volumes:
      - name: logs
        persistentVolumeClaim:
          claimName: epic1-security-logs
      - name: config
        configMap:
          name: epic1-security-config
      nodeSelector:
        security: "true"
      tolerations:
      - key: "security"
        operator: "Equal"
        value: "true"
        effect: "NoSchedule"

---
apiVersion: v1
kind: Service
metadata:
  name: epic1-security-service
  namespace: security
  labels:
    app: epic1-security
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  - port: 9090
    targetPort: 9090
    protocol: TCP
    name: metrics
  selector:
    app: epic1-security

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: epic1-security-config
  namespace: security
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  HEALTH_CHECK_ENABLED: "true"
  METRICS_ENABLED: "true"
  AUDIT_ENABLED: "true"
  RBAC_ENABLED: "true"
  ENCRYPTION_ENABLED: "true"
  MONITORING_ENABLED: "true"
  VALIDATION_ENABLED: "true"
  TESTING_ENABLED: "true"

---
apiVersion: v1
kind: Secret
metadata:
  name: epic1-security-secrets
  namespace: security
type: Opaque
stringData:
  ENCRYPTION_MASTER_KEY: "base64-encoded-master-key"
  TOKEN_SECRET: "jwt-secret-key"
  DATABASE_URL: "postgresql://user:pass@postgres:5432/security_db"
  REDIS_URL: "redis://redis:6379"
  SIEM_API_KEY: "siem-api-key"
  ALERT_EMAIL_RECIPIENTS: "security@company.com"
  ALERT_SLACK_WEBHOOK: "slack-webhook-url"
```

### Helm Chart Configuration

```yaml
# charts/epic1-security/values.yaml
replicaCount: 3

image:
  repository: epic1-security
  tag: "1.0.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: 3000
  metricsPort: 9090

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
  hosts:
    - host: security-api.company.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: security-api-tls
      hosts:
        - security-api.company.com

resources:
  requests:
    memory: 512Mi
    cpu: 250m
  limits:
    memory: 1Gi
    cpu: 500m

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

nodeSelector:
  security: "true"

tolerations:
  - key: "security"
    operator: "Equal"
    value: "true"
    effect: "NoSchedule"

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - epic1-security
        topologyKey: kubernetes.io/hostname

security:
  encryption:
    masterKey: "base64-encoded-master-key"
    algorithm: "aes-256-gcm"

  database:
    url: "postgresql://user:pass@postgres:5432/security_db"
    ssl: true

  redis:
    url: "redis://redis:6379"
    password: "redis-password"

  monitoring:
    enabled: true
    siem:
      endpoint: "https://siem.company.com/api/events"
      apiKey: "siem-api-key"

  alerts:
    email:
      enabled: true
      recipients: "security@company.com"
    slack:
      enabled: true
      webhook: "slack-webhook-url"

persistence:
  enabled: true
  storageClass: "fast-ssd"
  size: 50Gi

monitoring:
  serviceMonitor:
    enabled: true
    interval: 30s
    path: /metrics
    port: metrics

networkPolicy:
  enabled: true
  ingress:
    - from:
      - namespaceSelector:
          matchLabels:
            name: frontend
      ports:
      - protocol: TCP
        port: 3000
  egress:
    - to:
      - namespaceSelector:
          matchLabels:
            name: database
      ports:
      - protocol: TCP
        port: 5432
    - to:
      - namespaceSelector:
          matchLabels:
            name: redis
      ports:
      - protocol: TCP
        port: 6379
```

## ⚡ Performance Tuning

### Memory Optimization

```bash
# Node.js Memory Configuration
export NODE_OPTIONS="--max-old-space-size=1024 --gc-interval=100"

# V8 Garbage Collection Tuning
export V8_OPTIONS="--optimize-for-size --gc-interval=100"

# Enable CPU profiling for performance analysis
export NODE_ENV=production
export NODE_OPTIONS="--prof --prof-dir=/var/log/profiling"
```

### Database Optimization

```sql
-- PostgreSQL Audit Table Optimization
CREATE INDEX CONCURRENTLY idx_audit_timestamp ON audit_events(timestamp);
CREATE INDEX CONCURRENTLY idx_audit_user_id ON audit_events(user_id);
CREATE INDEX CONCURRENTLY idx_audit_event_type ON audit_events(event_type);

-- Partitioning for large audit tables
CREATE TABLE audit_events_y2024m01 PARTITION OF audit_events
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Auto-vacuum configuration
ALTER TABLE audit_events SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_analyze_scale_factor = 0.01
);
```

### Redis Optimization

```bash
# Redis Configuration for Caching
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG SET save ""  # Disable RDB snapshots
redis-cli CONFIG SET appendonly yes  # Enable AOF
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Failures

```bash
# Check authentication configuration
curl -H "Authorization: Bearer <token>" http://localhost:3000/health

# Verify token validity
npm run security:verify-token -- --token=<token>

# Check audit logs for auth failures
tail -f /var/log/security/audit.log | grep "AUTH_FAILED"
```

#### 2. Performance Issues

```bash
# Monitor system resources
htop
iostat -x 1
netstat -tuln

# Check application metrics
curl http://localhost:9090/metrics | grep security_

# Analyze slow queries
tail -f /var/log/postgresql/postgresql.log | grep "duration:"
```

#### 3. Memory Leaks

```bash
# Generate heap dump
kill -USR2 <node_pid>

# Analyze with clinic.js
npm install -g clinic
clinic doctor -- node dist/index.js

# Monitor garbage collection
node --trace-gc dist/index.js
```

#### 4. High Error Rates

```bash
# Check application logs
tail -f /var/log/security/application.log | grep ERROR

# Verify security components status
curl http://localhost:3000/health | jq '.components'

# Check SIEM integration
curl -X POST "${SIEM_ENDPOINT}/test" -H "Authorization: Bearer ${SIEM_API_KEY}"
```

### Debugging Commands

```bash
# Enable debug mode (development only)
export DEBUG=epic1:*
export LOG_LEVEL=debug

# Test individual components
npm run test:encryption
npm run test:rbac
npm run test:audit

# Validate configuration
npm run config:validate

# Run health checks
npm run health:check

# Generate diagnostic report
npm run diagnostics:generate
```

## 🛡️ Security Hardening

### Production Security Checklist

```bash
# [ ] Remove debug configurations
sed -i 's/DEBUG_MODE=true/DEBUG_MODE=false/' .env

# [ ] Enable all security features
grep -E "ENABLED=true" .env | wc -l  # Should be > 10

# [ ] Verify encryption keys are strong
openssl rand -base64 32 | wc -c  # Should be 45 (including newline)

# [ ] Check for default passwords
grep -i "password" .env | grep -v "$(openssl rand -base64 12)"

# [ ] Validate TLS configuration
openssl s_client -connect localhost:3000 -servername localhost

# [ ] Test security headers
curl -I https://your-domain.com | grep -E "Strict-Transport-Security|Content-Security-Policy"

# [ ] Verify firewall rules
iptables -L | grep -E "3000|9090"

# [ ] Check file permissions
find /app -type f -perm /o+w  # Should return no results

# [ ] Validate secret rotation
grep "ROTATION_ENABLED=true" .env

# [ ] Test backup procedures
npm run backup:test

# [ ] Verify monitoring alerts
npm run alerts:test
```

### Security Hardening Script

```bash
#!/bin/bash
# security-hardening.sh

set -euo pipefail

echo "🔒 Starting Epic 1 Security Hardening..."

# 1. Update system packages
echo "📦 Updating system packages..."
apt-get update && apt-get upgrade -y

# 2. Configure firewall
echo "🔥 Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw --force enable

# 3. Set secure file permissions
echo "📁 Setting secure file permissions..."
chmod 600 /app/.env*
chmod 600 /app/config/*.json
chmod -R 755 /app/dist
chown -R epic1:epic1 /app

# 4. Configure system limits
echo "⚙️ Configuring system limits..."
cat >> /etc/security/limits.conf << EOF
epic1 soft nofile 65536
epic1 hard nofile 65536
epic1 soft nproc 4096
epic1 hard nproc 4096
EOF

# 5. Enable audit logging
echo "📊 Enabling audit logging..."
systemctl enable auditd
systemctl start auditd

# 6. Configure log rotation
echo "🔄 Configuring log rotation..."
cat > /etc/logrotate.d/epic1-security << EOF
/var/log/security/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF

# 7. Set up automatic security updates
echo "🔄 Setting up automatic security updates..."
apt-get install -y unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "false";' >> /etc/apt/apt.conf.d/50unattended-upgrades

# 8. Configure fail2ban
echo "🚫 Configuring fail2ban..."
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

echo "✅ Security hardening completed!"
```

## 📞 Support and Maintenance

### Monitoring Commands

```bash
# Check system status
systemctl status epic1-security

# Monitor logs in real-time
journalctl -u epic1-security -f

# Check resource usage
docker stats epic1-security

# Validate configuration
npm run config:validate

# Test all security components
npm run security:test-all
```

### Backup Procedures

```bash
# Backup configuration
tar -czf epic1-config-$(date +%Y%m%d).tar.gz /app/config /app/.env*

# Backup audit logs
pg_dump -h localhost -U postgres audit_db > audit_backup_$(date +%Y%m%d).sql

# Backup encryption keys (secure location only)
openssl enc -aes-256-cbc -salt -in /app/keys -out keys_backup_$(date +%Y%m%d).enc
```

### Recovery Procedures

```bash
# Restore from backup
tar -xzf epic1-config-YYYYMMDD.tar.gz -C /

# Restore database
psql -h localhost -U postgres audit_db < audit_backup_YYYYMMDD.sql

# Restart services
systemctl restart epic1-security
```

---

**Document Version**: 1.0.0
**Last Updated**: 2024-01-25
**Next Review**: 2024-04-25
**Classification**: INTERNAL USE