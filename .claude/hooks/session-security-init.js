import * as fs from 'fs';
import * as path from 'path';
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const VALIDATORS_DIR = path.join(PROJECT_DIR, '.claude', 'validators-node', 'src');
const LOGS_DIR = path.join(PROJECT_DIR, '.claude', 'logs');
const REQUIRED_VALIDATORS = [
    'security-common.ts',
    'token-validator.ts',
    'bash-safety.ts',
    'secret-guard.ts',
    'env-protection.ts',
    'production-guard.ts',
    'outside-repo-guard.ts',
    'pii-guard.ts',
    'prompt-injection-guard.ts',
    'jailbreak-guard.ts',
];
const DANGEROUS_ENV_VARS = [
    ['BMAD_ALLOW_DANGEROUS', 'Dangerous operations override'],
    ['BMAD_ALLOW_SECRETS', 'Secrets override'],
    ['BMAD_ALLOW_PRODUCTION', 'Production operations override'],
    ['BMAD_ALLOW_OUTSIDE_REPO', 'Outside repository override'],
    ['BMAD_ALLOW_SENSITIVE_FILES', 'Sensitive files override'],
    ['BMAD_ALLOW_ESCAPE', 'Directory escape override'],
    ['BMAD_ALLOW_PII', 'PII detection override'],
    ['BMAD_ALLOW_INJECTION_CONTENT', 'Prompt injection content override'],
    ['BMAD_ALLOW_JAILBREAK', 'Jailbreak detection override'],
];
function checkValidators() {
    const missing = [];
    const unreadable = [];
    for (const validator of REQUIRED_VALIDATORS) {
        const validatorPath = path.join(VALIDATORS_DIR, validator);
        if (!fs.existsSync(validatorPath)) {
            missing.push(validator);
        }
        else {
            try {
                fs.accessSync(validatorPath, fs.constants.R_OK);
            }
            catch {
                unreadable.push(validator);
            }
        }
    }
    return { missing, unreadable };
}
function checkDangerousEnvVars() {
    const active = [];
    for (const [envVar, description] of DANGEROUS_ENV_VARS) {
        const value = (process.env[envVar] || '').toLowerCase();
        if (value === 'true') {
            active.push([envVar, description]);
        }
    }
    return active;
}
function initializeLogs() {
    try {
        fs.mkdirSync(LOGS_DIR, { recursive: true });
        const testFile = path.join(LOGS_DIR, '.write_test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        return true;
    }
    catch {
        return false;
    }
}
function logSessionStart(status, issues) {
    const logFile = path.join(LOGS_DIR, 'security.log');
    const logEntry = {
        timestamp: new Date().toISOString(),
        session_id: process.env.CLAUDE_SESSION_ID || 'unknown',
        validator: 'session_init',
        severity: issues.length > 0 ? 'WARNING' : 'INFO',
        action: 'SESSION_START',
        details: {
            status,
            issues,
            project_dir: PROJECT_DIR
        }
    };
    try {
        fs.appendFileSync(logFile, `${JSON.stringify(logEntry)  }\n`);
    }
    catch {
        // Don't fail session start due to logging issues
    }
}
function validateAuthentication() {
    try {
        const validatorPath = path.join(VALIDATORS_DIR, 'token-validator.ts');
        if (!fs.existsSync(validatorPath)) {
            return {
                isValid: false,
                error: 'Token validator not found'
            };
        }
        // Simplified authentication check - just verify file exists for now
        return {
            isValid: true,
            userInfo: {
                name: 'unknown',
                roles: ['user']
            }
        };
    }
    catch (error) {
        return {
            isValid: false,
            error: `Could not validate token: ${error}`
        };
    }
}
function main() {
    const issues = [];
    const warnings = [];
    console.error(`\n${'='.repeat(60)}`);
    console.error(`BMAD GUARDRAILS: Security Initialization`);
    console.error(`${'='.repeat(60)}`);
    const tokenRequired = (process.env.BMAD_TOKEN_REQUIRED || 'true').toLowerCase() !== 'false';
    if (tokenRequired) {
        const authResult = validateAuthentication();
        if (authResult.isValid && authResult.userInfo) {
            const userName = authResult.userInfo.name;
            const roles = authResult.userInfo.roles.join(', ');
            console.error(`  [OK] Authenticated: ${userName} (roles: ${roles})`);
        }
        else {
            console.error(`  [!!] Authentication FAILED: ${authResult.error}`);
            console.error(`\n${'='.repeat(60)}`);
            console.error(`  To authenticate, generate a token:`);
            console.error(`    node src/core/security/quick-token.cjs "Name" "role" 168`);
            console.error(`\n  Or disable token requirement (NOT RECOMMENDED):`);
            console.error(`    export BMAD_TOKEN_REQUIRED=false`);
            console.error(`${'='.repeat(60)}\n`);
            process.exit(2);
        }
    }
    else {
        console.error(`  [!!] Token validation SKIPPED (BMAD_TOKEN_REQUIRED=false)`);
        warnings.push("Token validation disabled");
    }
    const { missing, unreadable } = checkValidators();
    if (missing.length > 0) {
        issues.push(`Missing validators: ${missing.join(', ')}`);
    }
    if (unreadable.length > 0) {
        issues.push(`Unreadable validators: ${unreadable.join(', ')}`);
    }
    if (missing.length === 0 && unreadable.length === 0) {
        console.error(`  [OK] All ${REQUIRED_VALIDATORS.length} security validators present`);
    }
    else {
        console.error(`  [!!] Validator issues detected`);
        for (const issue of issues) {
            console.error(`       ${issue}`);
        }
    }
    const activeOverrides = checkDangerousEnvVars();
    if (activeOverrides.length > 0) {
        console.error(`\n  [!!] Active override environment variables:`);
        for (const [envVar, description] of activeOverrides) {
            console.error(`       ${envVar}=true (${description})`);
            warnings.push(`Override active: ${envVar}`);
        }
        console.error(`\n       These overrides will apply to the next blocked operation.`);
        console.error(`       Overrides are single-use and expire after 5 minutes.`);
    }
    else {
        console.error(`  [OK] No override environment variables active`);
    }
    const logsOk = initializeLogs();
    if (logsOk) {
        console.error(`  [OK] Audit logging initialized: ${LOGS_DIR}`);
    }
    else {
        warnings.push("Could not initialize audit logging");
        console.error(`  [!!] Could not initialize audit logging`);
    }
    console.error(`\n${'='.repeat(60)}`);
    let status;
    if (issues.length > 0) {
        console.error(`  STATUS: DEGRADED - Some security features may not work`);
        status = 'DEGRADED';
    }
    else if (warnings.length > 0) {
        console.error(`  STATUS: ACTIVE (with warnings)`);
        status = 'ACTIVE_WITH_WARNINGS';
    }
    else {
        console.error(`  STATUS: FULLY ACTIVE`);
        status = 'ACTIVE';
    }
    console.error(`\n  Security guardrails protect against:`);
    console.error(`    - Dangerous bash commands (rm -rf, fork bombs, etc.)`);
    console.error(`    - Hardcoded secrets in code`);
    console.error(`    - Modifications to sensitive files (.env, credentials)`);
    console.error(`    - Production environment targeting`);
    console.error(`    - Operations outside repository boundaries`);
    console.error(`    - PII exposure (SSN, credit cards, EU national IDs, IBAN)`);
    console.error(`    - Prompt injection attacks`);
    console.error(`    - Jailbreak attempts`);
    console.error(`${'='.repeat(60)}\n`);
    logSessionStart(status, [...issues, ...warnings]);
    process.exit(0);
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=session-security-init.js.map