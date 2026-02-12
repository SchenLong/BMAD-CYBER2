# BMAD Log Archival System (SEC-003-3)

## Overview

The BMAD Log Archival System implements enterprise-grade log archival to Amazon S3 with immutable storage, meeting NIST DE.CM-1 and ISO 27001 A.12.4.1 compliance requirements.

## Features

### Core Capabilities

- **Daily Automated S3 Export**: Scheduled log archival with configurable frequency
- **Immutable Storage**: S3 Object Lock prevents modification/deletion during retention period
- **GPG Signing**: Cryptographic integrity verification and non-repudiation
- **Hash Chain Verification**: Tamper detection through SHA-256 hash chains
- **Configurable Retention**: Default 7-year retention for regulatory compliance
- **Compression**: Gzip compression for storage efficiency
- **Audit Trail**: Complete logging of all archival operations

### Security Features

- **WORM Compliance**: Write-Once-Read-Many storage with S3 Object Lock
- **Encrypted Storage**: Server-side encryption (SSE-S3 or SSE-KMS)
- **Hash Verification**: Archive integrity verification
- **Access Controls**: IAM-based least-privilege access
- **Tamper Evidence**: GPG signatures and hash chains

## Architecture

### Components

1. **LogArchiver** (`src/observability/log-archiver.ts`)
   - Core archival engine
   - S3 upload with object lock
   - Compression and hash generation
   - GPG signing integration

2. **ArchivalConfigManager** (`src/observability/archival-config.ts`)
   - Configuration validation and management
   - S3 bucket verification
   - GPG key validation
   - Setup instructions generation

3. **ArchivalScheduler** (`src/observability/archival-scheduler.ts`)
   - Automated scheduling and job management
   - Health monitoring and alerting
   - Progress tracking and error handling
   - Integration with audit logger

4. **CLI Utility** (`bin/archival-cli.ts`)
   - Command-line interface for management
   - Manual archival triggers
   - Configuration checking
   - Archive verification

## Configuration

### Environment Variables

```bash
# Required
export BMAD_S3_ARCHIVE_BUCKET="my-company-audit-logs"

# Optional (with defaults)
export BMAD_S3_ARCHIVE_PREFIX="bmad-audit-logs/"
export BMAD_S3_ARCHIVE_REGION="us-east-1"
export BMAD_LOG_RETENTION_DAYS="2557"  # ~7 years
export BMAD_ARCHIVE_SCHEDULE_CRON="0 2 * * *"  # Daily at 2 AM

# GPG Signing (optional)
export BMAD_GPG_SIGNING_KEY="ABCD1234"

# S3 Configuration (optional)
export BMAD_ENABLE_OBJECT_LOCK="true"
export BMAD_S3_ENCRYPTION_TYPE="SSE-S3"  # or "SSE-KMS"
export BMAD_S3_KMS_KEY_ID="arn:aws:kms:..."  # Required if SSE-KMS
```

### S3 Bucket Setup

1. **Create bucket with Object Lock**:

```bash
aws s3api create-bucket \
  --bucket my-company-audit-logs \
  --create-bucket-configuration LocationConstraint=us-east-1 \
  --object-lock-enabled-for-bucket
```

1. **Enable encryption**:

```bash
aws s3api put-bucket-encryption \
  --bucket my-company-audit-logs \
  --server-side-encryption-configuration '{
    "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
  }'
```

1. **Enable versioning**:

```bash
aws s3api put-bucket-versioning \
  --bucket my-company-audit-logs \
  --versioning-configuration Status=Enabled
```

1. **Configure Object Lock**:

```bash
aws s3api put-object-lock-configuration \
  --bucket my-company-audit-logs \
  --object-lock-configuration '{
    "ObjectLockEnabled": "Enabled",
    "Rule": {"DefaultRetention": {"Mode": "COMPLIANCE", "Years": 7}}
  }'
```

### IAM Permissions

Required S3 permissions for the archival system:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectLegalHold",
        "s3:PutObjectRetention",
        "s3:GetObject",
        "s3:GetObjectLockConfiguration",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::my-company-audit-logs",
        "arn:aws:s3:::my-company-audit-logs/*"
      ]
    }
  ]
}
```

## Usage

### CLI Commands

```bash
# Check configuration
npm run archival config

# View current status
npm run archival status

# Manual archival
npm run archival archive

# List archives
npm run archival list

# Verify archive integrity
npm run archival verify [archive-id]

# Health check
npm run archival health

# Interactive setup
npm run archival setup
```

### Programmatic Usage

```typescript
import {
  createLogArchiver,
  runDailyArchival,
  getArchivalScheduler
} from '@bmad/validators/observability';

// Initialize archival scheduling
await initializeArchivalScheduling();

// Manual archival
const result = await runDailyArchival();

// Get status
const status = await getArchivalStatus();
```

## Integration with Audit Logger

The archival system integrates automatically with the audit logger:

```typescript
import { AuditLogger } from '@bmad/validators/common';

// Initialize archival on startup
await AuditLogger.initializeArchival();

// Manual trigger
await AuditLogger.triggerArchival();

// Get status
const status = await AuditLogger.getArchivalStatus();
```

## Archive Format

### Archive Structure

```
archive.gz (compressed)
├── security.log (JSON Lines)
│   ├── Entry 1 (decrypted if encrypted)
│   ├── Entry 2
│   └── ...
├── metadata.json
│   ├── Archive ID
│   ├── Timestamp
│   ├── File count
│   ├── Hash chain
│   └── Compression info
└── signature.asc (if GPG enabled)
```

### Archive Metadata

```json
{
  "archiveId": "bmad-audit-2024-01-01-to-2024-01-02-abc123",
  "timestamp": "2024-01-02T02:00:00.000Z",
  "logFileCount": 5,
  "totalSize": 1048576,
  "compressedSize": 524288,
  "sha256Hash": "a1b2c3d4...",
  "previousArchiveHash": "e5f6g7h8...",
  "gpgSignature": "-----BEGIN PGP SIGNATURE-----...",
  "s3ObjectKey": "bmad-audit-logs/2024/01/02/archive.gz",
  "retentionUntil": "2031-01-02T02:00:00.000Z",
  "encryptionEnabled": true,
  "compressionRatio": 0.5
}
```

## Compliance

### NIST DE.CM-1 (Data-at-rest Protection)

- ✅ AES-256 encryption for audit logs at rest
- ✅ S3 server-side encryption with managed keys
- ✅ Object Lock preventing unauthorized modification

### ISO 27001 A.12.4.1 (Event Logging)

- ✅ Comprehensive audit event logging
- ✅ Tamper-evident log storage
- ✅ Regular archival to external storage
- ✅ Long-term retention (7+ years)

### SOX 404 (Records Retention)

- ✅ Immutable storage with legal hold capability
- ✅ Audit trail of all archival operations
- ✅ Hash-based integrity verification

### GDPR Article 32 (Security of Processing)

- ✅ Encryption of personal data in logs
- ✅ Integrity and confidentiality measures
- ✅ Regular testing of security measures

## Monitoring and Alerting

### Health Checks

- Configuration validation
- S3 connectivity and permissions
- Archive integrity verification
- Retention policy compliance
- GPG key validity

### Alerts

- Failed archival jobs (after 3 consecutive failures)
- Archive integrity failures
- Configuration errors
- Retention policy violations

### Metrics

- Archive success/failure rates
- Archive sizes and compression ratios
- S3 costs and storage utilization
- Processing times and performance

## Troubleshooting

### Common Issues

1. **"S3 bucket not found"**
   - Verify bucket name and region
   - Check AWS credentials and permissions
   - Ensure bucket exists in correct region

2. **"Object Lock not enabled"**
   - Enable Object Lock on S3 bucket
   - Set default retention policy
   - Update bucket configuration

3. **"GPG key not found"**
   - Import GPG key to keyring
   - Verify key ID matches configuration
   - Check GPG installation

4. **"Archive integrity failed"**
   - Check S3 object corruption
   - Verify hash calculation
   - Review upload process logs

### Debug Commands

```bash
# Verbose configuration check
npm run archival config --verbose

# Health check with fix attempts
npm run archival health --fix

# Force archival (bypass running check)
npm run archival archive --force

# Verify all recent archives
npm run archival verify --all
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Security Considerations

### Access Control

- Use IAM roles with minimal required permissions
- Rotate AWS access keys regularly
- Monitor S3 bucket access logs

### Key Management

- Store GPG private keys securely
- Use dedicated signing keys for archival
- Implement key rotation procedures

### Network Security

- Use VPC endpoints for S3 access when possible
- Enable CloudTrail for API monitoring
- Configure S3 bucket policies for additional restrictions

## License

MIT License - see LICENSE file for details.
