---
name: 'step-04-authorization'
description: 'Authorization and access control testing'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/web-app-security-testing'
thisStepFile: '{workflow_path}/steps/step-04-authorization.md'
nextStepFile: '{workflow_path}/steps/step-05-input-validation.md'
outputFile: '{output_folder}/security/web-app-security-testing-{project_name}.md'
---

# Step 4: Authorization Testing

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide IDOR and privilege testing systematically

## AUTHORIZATION TESTING SEQUENCE:

### 1. Role Mapping

"Let's map the authorization model.

**User Roles:**
- What roles exist (admin, user, guest, moderator)?
- Role hierarchy and permissions?
- Test accounts for each role available?

**Permission Boundaries:**
- What can each role access?
- What actions are role-restricted?
- Are there resource-level permissions?

What roles and permissions have you documented?"

### 2. Horizontal Privilege Escalation (IDOR)

"Let's test for IDOR vulnerabilities.

**Object Reference Testing:**
- User IDs in URLs or requests?
- Predictable object IDs (sequential integers)?
- Can User A access User B's data by changing IDs?

**Common IDOR Locations:**
- `/api/users/{id}/profile`
- `/api/orders/{order_id}`
- `/api/documents/{doc_id}/download`
- `/account/settings?user_id=123`

**Testing Approach:**
1. Capture request with your user's ID
2. Substitute another user's ID
3. Check if unauthorized access occurs

What IDOR testing have you performed?"

### 3. Vertical Privilege Escalation

"Now let's test privilege escalation.

**Admin Function Access:**
- Can regular user access `/admin/*` endpoints?
- API endpoints for admin actions accessible?
- Role parameter manipulation possible?

**Privilege Escalation Vectors:**
- Modify role in JWT token?
- Change role parameter in request body?
- Access admin API with user token?
- Hidden admin parameters in requests?

**Testing Pattern:**
1. Login as low-privilege user
2. Attempt high-privilege operations
3. Manipulate role indicators

What privilege escalation attempts have you made?"

### 4. Function-Level Access Control

"Let's verify function-level controls.

**Sensitive Operations:**
- User deletion
- Role assignment
- Configuration changes
- Data export
- Billing/payment operations

**Testing Each Function:**
1. Identify the API endpoint
2. Test without authentication
3. Test with low-privilege user
4. Verify proper 401/403 responses

Which functions have you tested?"

### 5. Path Traversal and URL Manipulation

"Testing path-based access controls.

**URL Manipulation:**
- `/user/profile` → `/admin/profile`
- Add `../` sequences
- Bypass with URL encoding
- Case sensitivity (`/Admin` vs `/admin`)

**Parameter Pollution:**
- Duplicate parameters with different values
- Array injection `?role=user&role=admin`

What path manipulation results do you have?"

### 6. Document Authorization Findings

Append to {outputFile} Section 4:

```markdown
## 4. Authorization Testing

### 4.1 Role Model
| Role | Permissions | Test Account |
|------|-------------|--------------|
| Admin | | |
| User | | |
| Guest | | |

### 4.2 IDOR Testing (Horizontal)
| Endpoint | Object Type | Vulnerable | Notes |
|----------|-------------|------------|-------|
| | | | |

### 4.3 Privilege Escalation (Vertical)
| Function | User Role Tested | Result | Notes |
|----------|------------------|--------|-------|
| | | | |

### 4.4 Function-Level Access
| Endpoint | Unauth | Low Priv | Expected | Actual |
|----------|--------|----------|----------|--------|
| | | | 403 | |

### 4.5 Path Traversal
[Testing results and findings]

### 4.6 Authorization Findings
| ID | Vulnerability | Severity | Status |
|----|---------------|----------|--------|
| AUTHZ-001 | | | |
```

### 7. Confirmation

"**Authorization Testing Complete**

**Findings:**
- [Count] IDOR vulnerabilities
- [Count] privilege escalation issues
- [Count] broken access control findings
- Highest severity: [Critical/High/Medium/Low]

Ready to proceed to input validation testing?"

## MENU

Display: [C] Continue to Input Validation [R] Review/Add Authz Findings [E] Deep Dive on Finding

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3, 4]`, then execute {nextStepFile}.
