# BMAD Troubleshooting Guide

Common issues and solutions for BMAD-CYBER2.

---

## Quick Diagnostics

### Check System Status

```bash
# Verify file integrity
./_bmad/core/security/verify-integrity.sh

# Validate authentication token
node _bmad/core/security/validate-token.js

# Check authorization
node _bmad/core/security/check-authorization.js

# Check LLM provider
.claude/hooks/llm-provider-manager.sh health-all
```

---

## Authentication Issues

### "Token not found" or "Token expired"

**Symptoms:**
- Authentication errors on session start
- "No valid token" message

**Solution:**

```bash
# Generate new token
node _bmad/core/security/quick-token.js "YourName" "your_role" 168

# Or use interactive generation
node _bmad/core/security/generate-token.js
```

### "Invalid token"

**Symptoms:**
- Token exists but validation fails
- Encryption/decryption errors

**Solutions:**

1. **Regenerate token and key:**
   ```bash
   # Remove old files
   rm .bmad-token .bmad-key

   # Generate fresh
   node _bmad/core/security/generate-token.js
   ```

2. **Check file permissions:**
   ```bash
   ls -la .bmad-token .bmad-key
   # Should be readable by current user
   ```

### "Token will expire soon"

**Symptoms:**
- Warning about token expiration

**Solution:**

```bash
# Generate new token with longer validity
node _bmad/core/security/quick-token.js "YourName" "role" 720  # 30 days
```

---

## Authorization Issues

### "Access Denied" for Module/Agent/Workflow

**Symptoms:**
```
ACCESS DENIED

Workflow 'operation-mosaic' requires one of these roles:
intel_analyst, security_lead, admin
```

**Solutions:**

1. **Check current roles:**
   ```bash
   node _bmad/core/security/check-authorization.js
   ```

2. **Generate token with correct role:**
   ```bash
   node _bmad/core/security/quick-token.js "YourName" "security_lead" 168
   ```

3. **Check specific access:**
   ```bash
   # Check module access
   node _bmad/core/security/check-authorization.js module intel-team

   # Check workflow access
   node _bmad/core/security/check-authorization.js workflow operation-mosaic

   # Check agent access
   node _bmad/core/security/check-authorization.js agent intel-team/osint-lead
   ```

### "Requires verified credentials"

**Symptoms:**
- Access denied to intel-team resources
- Credential verification message

**Solution:**
- Credential verification must be set when generating the token
- Contact your administrator for credential-verified tokens

---

## Security Hook Issues

### Operation Blocked by Guardrail

**Symptoms:**
```
BMAD GUARDRAIL: STRICT BLOCK

Command blocked: rm -rf ./old-files
```

**Solutions:**

1. **For legitimate operations, use override:**
   ```bash
   export BMAD_ALLOW_DANGEROUS=true
   # Run operation (override consumed after one use)
   ```

2. **Override variables by type:**
   | Variable | Use For |
   |----------|---------|
   | `BMAD_ALLOW_DANGEROUS` | Dangerous bash commands |
   | `BMAD_ALLOW_SECRETS` | Files with secrets |
   | `BMAD_ALLOW_PII` | Files with PII |
   | `BMAD_ALLOW_PRODUCTION` | Production operations |
   | `BMAD_ALLOW_OUTSIDE_REPO` | Outside repository |
   | `BMAD_ALLOW_SENSITIVE_FILES` | .env and credentials |
   | `BMAD_ALLOW_INJECTION_CONTENT` | Content with injection patterns |

3. **Note:** Overrides are single-use and expire after 5 minutes

### "ABSOLUTE BLOCK" (Cannot Override)

**Symptoms:**
```
BMAD GUARDRAIL: ABSOLUTE BLOCK

This operation is BLOCKED and cannot be overridden.
```

**Explanation:**
- Absolute blocks protect against catastrophic operations
- Examples: `rm -rf /`, `rm -rf ~`, `rm -rf $HOME`
- These cannot be overridden for safety

**Solution:**
- Refine your command to be more specific
- Target specific directories within the repository

### "Rate Limit Exceeded" (OWASP LLM04)

**Symptoms:**
```
BMAD GUARDRAIL: RATE LIMIT EXCEEDED

Tool: Bash
Limit: 30 calls per minute
Current: 31
```

**Solutions:**

1. **Wait and retry:**
   - Rate limits reset automatically
   - Wait for the window to pass (1min, 5min, or 1hr)

2. **Increase limits (if needed):**
   ```bash
   export BMAD_RATE_LIMIT_BASH_PER_MIN=50
   ```

3. **Disable rate limiting (not recommended):**
   ```bash
   export BMAD_RATE_LIMIT_ENABLED=false
   ```

### "Resource Limit Exceeded" (OWASP LLM04)

**Symptoms:**
```
BMAD GUARDRAIL: RESOURCE LIMIT

Memory usage: 2560MB exceeds limit: 2048MB
```

**Solutions:**

1. **Increase memory limit:**
   ```bash
   export BMAD_MAX_MEMORY_MB=4096
   ```

2. **Check for memory leaks:**
   - Review recent operations
   - Check for large file processing

3. **File size limits:**
   ```bash
   export BMAD_MAX_FILE_SIZE_MB=200
   ```

### "Recursion Depth Exceeded" (OWASP LLM04)

**Symptoms:**
```
BMAD GUARDRAIL: RECURSION LIMIT

Recursion depth: 11 exceeds maximum: 10
```

**Solutions:**

1. **Break recursive pattern:**
   - Split the operation into smaller steps
   - Use explicit iteration instead of recursion

2. **Wait for cooldown:**
   - Recursion guard has 60-second cooldown
   - Wait and retry with simplified approach

### "Supply Chain Verification Failed" (OWASP LLM05)

**Symptoms:**
```
BMAD GUARDRAIL: SUPPLY CHAIN ALERT

Plugin hash mismatch detected
Expected: abc123...
Actual: def456...
```

**Solutions:**

1. **If plugin was legitimately updated:**
   ```bash
   # Re-sign the manifest
   ./_bmad/core/security/sign-manifest.sh
   ```

2. **If unexpected change:**
   - DO NOT proceed
   - Investigate the change
   - Restore from version control

3. **Disable verification (not recommended):**
   ```bash
   export BMAD_VERIFY_SUPPLY_CHAIN=false
   ```

### "Plugin Permission Denied" (OWASP LLM07)

**Symptoms:**
```
BMAD GUARDRAIL: PERMISSION DENIED

Plugin 'custom-plugin' lacks permission: file:write
Required permissions: [file:write, bash:execute]
```

**Solutions:**

1. **Add permission to manifest:**
   ```yaml
   # In plugin's manifest.yaml
   permissions:
     - file:read
     - file:write
     - bash:execute
   ```

2. **Use a different plugin:**
   - Choose one with required permissions
   - Or request permission elevation

### "Low Confidence Score" (OWASP LLM09)

**Symptoms:**
```
BMAD CONFIDENCE WARNING

Confidence: 45/100 (Very Low)
Recommendation: Human review required
```

**Solutions:**

1. **Review output manually:**
   - Low confidence = uncertainty
   - Verify before proceeding

2. **Provide more context:**
   - Add clarifying information
   - Narrow the scope of the request

3. **Hide confidence display:**
   ```bash
   export BMAD_SHOW_CONFIDENCE=false
   ```

### False Positive Detection

**Symptoms:**
- Legitimate content blocked as secrets/PII
- Test data flagged as sensitive

**Solutions:**

1. **For test data, use appropriate naming:**
   - `test_data.json`
   - `mock_users.yaml`
   - `sample_data.csv`
   - `fixtures/`
   - `.example` extension

2. **For secrets, use example indicators:**
   ```yaml
   # Good - won't be flagged
   api_key: "your_api_key_here"
   api_key: "EXAMPLE_KEY_REPLACE_ME"
   api_key: "xxxxxxxxxxxx"
   ```

3. **For PII, mark as test data:**
   ```json
   // In test files
   {
     "ssn": "000-00-0000",  // Fake SSN
     "name": "John Doe"     // Test user
   }
   ```

---

## LLM Provider Issues

### Provider Not Responding

**Symptoms:**
- Timeout errors
- Connection refused

**Solutions:**

1. **Check provider health:**
   ```bash
   .claude/hooks/llm-provider-manager.sh health ollama
   .claude/hooks/llm-provider-manager.sh health-all
   ```

2. **For local providers (Ollama, LM Studio):**
   ```bash
   # Check if service is running
   curl http://localhost:11434/api/tags  # Ollama
   curl http://localhost:1234/v1/models  # LM Studio
   ```

3. **Switch to different provider:**
   ```bash
   .claude/hooks/llm-provider-manager.sh set claude
   ```

### Wrong Provider Being Used

**Symptoms:**
- Module using unexpected provider
- Data sent to wrong LLM

**Solutions:**

1. **Check current provider:**
   ```bash
   .claude/hooks/llm-provider-manager.sh get
   ```

2. **Check provider priority:**
   - Agent-level override
   - Module-level override
   - Project override (`.claude/llm-provider.txt`)
   - Global override (`~/.claude/llm-provider.txt`)
   - Config default

3. **Clear overrides:**
   ```bash
   .claude/hooks/llm-provider-manager.sh clear
   ```

### "Model not found"

**Symptoms:**
- LLM returns model not found error

**Solutions:**

1. **For Ollama:**
   ```bash
   # List available models
   ollama list

   # Pull required model
   ollama pull nemotron-mini
   ```

2. **For LM Studio:**
   - Open LM Studio application
   - Download the required model
   - Ensure server is started

---

## File Integrity Issues

### "Signature verification failed"

**Symptoms:**
```
ERROR: Signature verification failed!
```

**Solutions:**

1. **Import the GPG key:**
   ```bash
   gpg --import _bmad/core/security/bmad-public-key.asc
   ```

2. **Check key is imported:**
   ```bash
   gpg --list-keys | grep BMAD
   ```

### "Hash mismatch detected"

**Symptoms:**
```
ERROR: Hash mismatch for file: _bmad/core/agents/security-architect.md
```

**Possible causes:**
- File was legitimately modified
- File was tampered with
- File encoding changed

**Solutions:**

1. **For legitimate modifications:**
   ```bash
   # Re-sign the manifest (requires private key)
   ./_bmad/core/security/sign-manifest.sh
   ```

2. **For suspected tampering:**
   - Review git diff
   - Restore from version control
   - Investigate the change

### "Missing files detected"

**Symptoms:**
```
ERROR: Missing file: _bmad/cybersec-team/agents/threat-analyst.md
```

**Solutions:**

1. **Restore missing file:**
   ```bash
   git checkout -- _bmad/cybersec-team/agents/threat-analyst.md
   ```

2. **If file should be removed, update manifest:**
   ```bash
   ./_bmad/core/security/sign-manifest.sh
   ```

---

## Workflow Issues

### Workflow Not Found

**Symptoms:**
- Workflow invocation fails
- "Workflow not found" error

**Solutions:**

1. **Check workflow exists:**
   ```bash
   ls _bmad/*/workflows/ | grep <workflow-name>
   ```

2. **Use correct invocation path:**
   ```
   /bmad:module:workflows:workflow-name
   ```

3. **Check RBAC access:**
   ```bash
   node _bmad/core/security/check-authorization.js workflow <workflow-name>
   ```

### Workflow Stuck or Failing

**Symptoms:**
- Workflow doesn't progress
- Error during execution

**Solutions:**

1. **Check prerequisites:**
   - Review workflow documentation
   - Ensure required artifacts exist
   - Verify dependencies

2. **Check audit log:**
   ```bash
   tail -50 _bmad-output/.audit/audit.log
   ```

3. **Run with explicit context:**
   - Provide more detailed inputs
   - Break into smaller steps

---

## Party Mode Issues

### Agents Not Responding

**Symptoms:**
- Party mode silent
- Only one agent responds

**Solutions:**

1. **Check agent access:**
   ```bash
   # For each agent in the preset
   node _bmad/core/security/check-authorization.js agent <module>/<agent>
   ```

2. **Verify preset configuration:**
   ```bash
   cat _bmad/core/workflows/party-mode/presets/cross-module-groups.yaml
   ```

3. **Try simpler preset:**
   - Use preset with fewer agents
   - Use agents from modules you have access to

### "Access denied to agent in preset"

**Symptoms:**
- Preset partially works
- Some agents blocked

**Solutions:**

1. **Check which agents you can access:**
   ```bash
   node _bmad/core/security/check-authorization.js
   ```

2. **Build custom team with accessible agents:**
   ```
   > PM
   > Custom team: Bastion, Winston, John
   ```

---

## Audit Log Issues

### Log Not Writing

**Symptoms:**
- Empty audit log
- Old entries only

**Solutions:**

1. **Check directory permissions:**
   ```bash
   ls -la _bmad-output/.audit/
   # Should be writable
   ```

2. **Create directory if missing:**
   ```bash
   mkdir -p _bmad-output/.audit
   ```

### Log Too Large

**Symptoms:**
- Slow log operations
- Disk space issues

**Solutions:**

1. **Logs auto-rotate at 10MB**
2. **Manual cleanup (preserve recent):**
   ```bash
   # Keep last 1000 lines
   tail -1000 _bmad-output/.audit/audit.log > _bmad-output/.audit/audit.log.tmp
   mv _bmad-output/.audit/audit.log.tmp _bmad-output/.audit/audit.log
   ```

---

## Performance Issues

### Slow Response Times

**Symptoms:**
- Long wait for responses
- Timeout errors

**Solutions:**

1. **Switch to faster provider:**
   ```bash
   .claude/hooks/llm-provider-manager.sh set groq  # Fastest
   .claude/hooks/llm-provider-manager.sh set claude  # High quality
   ```

2. **For local providers:**
   - Ensure adequate RAM
   - Check GPU availability
   - Use smaller models

### High Resource Usage

**Symptoms:**
- CPU/Memory spikes
- System slowdown

**Solutions:**

1. **Use appropriate model sizes:**
   - Smaller models for simple tasks
   - Larger models for complex reasoning

2. **Route by task type:**
   - Development: local LLM
   - Complex analysis: cloud provider

---

## Getting Help

### Collect Diagnostic Information

Before requesting help, gather:

```bash
# System status
./_bmad/core/security/verify-integrity.sh
node _bmad/core/security/validate-token.js
node _bmad/core/security/check-authorization.js

# Provider status
.claude/hooks/llm-provider-manager.sh health-all

# Recent audit entries
tail -100 _bmad-output/.audit/audit.log
```

### Support Resources

- **GitHub Issues:** Report bugs and feature requests
- **Documentation:** Check relevant guides first
- **Security Issues:** Contact maintainers directly

---

## Related Documentation

- [GETTING-STARTED.md](GETTING-STARTED.md) - Initial setup
- [SECURITY-OVERVIEW.md](SECURITY-OVERVIEW.md) - Security features
- [CONFIGURATION-GUIDE.md](CONFIGURATION-GUIDE.md) - Configuration options
- [RBAC-ROLES-GUIDE.md](RBAC-ROLES-GUIDE.md) - Role permissions
- [HOOKS-VALIDATORS-GUIDE.md](../06-reference/features/HOOKS-VALIDATORS-GUIDE.md) - Hook details
- [HOOKS-CONFIGURATION-REFERENCE.md](../06-reference/features/Security/HOOKS-CONFIGURATION-REFERENCE.md) - Complete hooks configuration
- [Security Audit Report](../05-project-management/planning/security-audits/BMAD-Security-Audit-Report.md) - Comprehensive audit findings
