# BMAD Security Checklist

## Pre-Deployment Security Verification

### Critical Requirements:
- [ ] No `.bmad-key` file in production deployment
- [ ] No `.bmad-token` file in production deployment
- [ ] All credentials stored in environment variables
- [ ] Security validation passes with 0 critical issues
- [ ] All sensitive files have appropriate permissions (600)

### Code Security:
- [ ] No hardcoded credentials in source code
- [ ] Input validation implemented for all user inputs
- [ ] Command injection vulnerabilities addressed
- [ ] Secure error handling (no information leakage)

### Infrastructure Security:
- [ ] HTTPS/TLS enabled for all external communications
- [ ] Access controls implemented and tested
- [ ] Logging and monitoring configured
- [ ] Incident response procedures documented

### Development Security:
- [ ] Security pre-commit hooks active
- [ ] Dependency vulnerability scanning enabled
- [ ] Regular security training completed
- [ ] Secure coding standards followed

## Security Validation Commands:

```bash
# Run security validation
node security-validation.js

# Check file permissions
ls -la .bmad-key .bmad-token 2>/dev/null || echo "Files not present (good)"

# Verify git status
git status --porcelain | grep -E "\\.(bmad-key|bmad-token)$" || echo "No sensitive files staged (good)"
```

## Emergency Contacts:
- Security Team: security@bmad.ai
- Incident Response: incident@bmad.ai
- On-call Security: [Configure based on team structure]
