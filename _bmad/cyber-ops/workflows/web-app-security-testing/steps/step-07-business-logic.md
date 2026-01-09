---
name: 'step-07-business-logic'
description: 'Business logic vulnerability testing'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/web-app-security-testing'
thisStepFile: '{workflow_path}/steps/step-07-business-logic.md'
nextStepFile: '{workflow_path}/steps/step-08-findings-remediation.md'
outputFile: '{output_folder}/security/web-app-security-testing-{project_name}.md'
---

# Step 7: Business Logic Testing

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Business logic flaws require understanding application context

## BUSINESS LOGIC TESTING SEQUENCE:

### 1. Workflow Analysis

"Let's understand the application's business workflows.

**Critical Workflows to Test:**
- User registration process
- Purchase/checkout flow
- Password reset process
- Account upgrade/downgrade
- Data export/import
- Approval workflows
- Multi-step transactions

**For Each Workflow:**
- What are the expected steps?
- What validations occur at each step?
- Can steps be skipped or reordered?

Which workflows should we focus on?"

### 2. Input Manipulation

"Testing input constraints and validation.

**Numeric Manipulation:**
- Negative values (quantity: -1)
- Zero values (price: 0)
- Extremely large values (overflow)
- Decimal precision attacks
- Currency rounding abuse

**Boundary Testing:**
- Minimum/maximum limits
- Rate limits and quotas
- Free tier limits
- Trial period manipulation

What input manipulation testing have you performed?"

### 3. Process Flow Bypass

"Testing for workflow bypass vulnerabilities.

**Skip Step Attacks:**
- Submit final step without prerequisites
- Direct URL access to later steps
- Manipulate step parameters
- Remove client-side step enforcement

**Race Conditions:**
- Multiple simultaneous requests
- Time-of-check to time-of-use (TOCTOU)
- Concurrent purchase/redemption
- Double-spending scenarios

**State Manipulation:**
- Modify hidden state parameters
- Replay requests from earlier states
- Rollback to previous state

What process flow testing have you done?"

### 4. Business Rule Violations

"Testing business rule enforcement.

**Common Violations:**
- Using expired promotions/coupons
- Applying multiple discounts
- Referral bonus abuse
- Free trial abuse
- Feature access without payment
- Quantity/limit bypass

**Abuse Scenarios:**
- Self-referral for bonuses
- Account churning for trials
- Gift card/credit manipulation
- Loyalty point exploitation

What business rule violations have you discovered?"

### 5. Multi-User Interaction Abuse

"Testing user interaction vulnerabilities.

**Social Features:**
- Profile impersonation
- Content manipulation
- Rating/review fraud
- Messaging abuse
- Sharing permission bypass

**Marketplace/Transaction:**
- Buyer/seller collusion
- Transaction cancellation abuse
- Escrow bypass
- Dispute system gaming

Have you tested multi-user interactions?"

### 6. API Business Logic

"Testing API-specific business logic.

**API Abuse Patterns:**
- Missing rate limits
- Bulk operation abuse
- Inconsistent validation (web vs API)
- GraphQL batching attacks
- API versioning bypass

**Data Validation:**
- Client-side only validation
- Inconsistent field validation
- Type juggling attacks
- Unicode/encoding bypasses

What API business logic issues have you found?"

### 7. Financial/Payment Logic

"For applications with payments:

**Payment Security:**
- Price manipulation in requests
- Currency confusion attacks
- Partial payment bypass
- Refund abuse
- Promo code stacking
- Cart manipulation

**Subscription Logic:**
- Plan downgrade retains features
- Trial to paid transition flaws
- Cancellation still grants access
- Billing cycle manipulation

What payment/financial testing have you performed?"

### 8. Document Business Logic Findings

Append to {outputFile} Section 7:

```markdown
## 7. Business Logic Testing

### 7.1 Workflow Analysis
| Workflow | Steps | Bypass Possible | Notes |
|----------|-------|-----------------|-------|
| | | | |

### 7.2 Input Manipulation
| Input | Original | Modified | Result | Impact |
|-------|----------|----------|--------|--------|
| | | | | |

### 7.3 Process Flow Issues
| Flow | Attack | Result | Severity |
|------|--------|--------|----------|
| | | | |

### 7.4 Business Rule Violations
| Rule | Bypass Method | Impact | Status |
|------|---------------|--------|--------|
| | | | |

### 7.5 Race Conditions
| Function | Attack | Result | Notes |
|----------|--------|--------|-------|
| | | | |

### 7.6 API Logic Issues
[API-specific business logic findings]

### 7.7 Financial/Payment Issues
[Payment processing vulnerabilities]

### 7.8 Business Logic Findings
| ID | Vulnerability | Impact | Severity | Status |
|----|---------------|--------|----------|--------|
| BL-001 | | | | |
```

### 9. Confirmation

"**Business Logic Testing Complete**

**Findings:**
- Workflow bypass: [Count]
- Input manipulation: [Count]
- Race conditions: [Count]
- Business rule violations: [Count]
- Financial issues: [Count]

Most impactful finding: [Description]

Ready to proceed to findings summary and remediation?"

## MENU

Display: [C] Continue to Findings & Remediation [R] Review/Add Logic Findings [E] Investigate Specific Issue

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3, 4, 5, 6, 7]`, then execute {nextStepFile}.
