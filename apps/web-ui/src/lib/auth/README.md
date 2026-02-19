# Session Management - Maintenance Notes

## Session Cleanup

Expired sessions are cleaned up in the following ways:

### Automatic Cleanup

1. **On Validation**: When a session is validated via `validateSession()` and found to be expired, it is immediately deleted from the database.

2. **On Login**: When a user logs in and exceeds `MAX_SESSIONS_PER_USER`, the oldest session is automatically revoked.

### Recommended: Scheduled Cleanup Job

For production deployments, it is recommended to implement a scheduled job to periodically clean up expired sessions:

```typescript
// Example: Run daily via cron or equivalent
async function cleanupExpiredSessions() {
  const prisma = require('./lib/prisma').prisma;

  const result = await prisma.session.deleteMany({
    where: {
      expires: { lt: new Date() }
    }
  });

  console.log(`Cleaned up ${result.count} expired sessions`);
}
```

### Cron Job Examples

**Linux Cron (daily at 2 AM):**
```bash
0 2 * * * cd /path/to/app && npx ts-node scripts/cleanup-sessions.ts
```

**Vercel Cron Jobs (vercel.json):**
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-sessions",
    "schedule": "0 2 * * *"
  }]
}
```

**GitHub Actions:**
```yaml
name: Cleanup Sessions
on:
  schedule:
    - cron: '0 2 * * *'
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - run: npm install
      - run: npm run cleanup-sessions
```

## Cookie Security Settings

### Development
```env
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
```

### Production
```env
COOKIE_SECURE=true
COOKIE_SAMESITE=strict
```

**Important:** Always use `secure: true` in production with HTTPS.

## Session Timeout Configuration

```env
SESSION_EXPIRY_MINUTES=15      # Access token duration
REFRESH_TOKEN_EXPIRY_DAYS=7    # Refresh token duration
MAX_SESSIONS_PER_USER=5        # Concurrent session limit
```

## Monitoring

Monitor these metrics for session health:

1. **Active Sessions Count**: `SELECT COUNT(*) FROM Session WHERE expires > datetime('now')`
2. **Expired Sessions Not Cleaned**: `SELECT COUNT(*) FROM Session WHERE expires < datetime('now')`
3. **Sessions Per User Distribution**: Useful for detecting anomalies

## Security Considerations

1. **Refresh Token Rotation**: Implemented - each use generates a new token
2. **Sliding Expiration**: Sessions extend on activity
3. **Concurrent Limits**: Enforced at session creation
4. **Device Fingerprinting**: Basic implementation (see login/route.ts for limitations)
