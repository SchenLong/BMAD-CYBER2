---
name: 'iam-review-template'
description: 'Detailed template for IAM security review findings'
version: '1.0'
---

# IAM Security Review Worksheet

## Document Information

| Field | Value |
|-------|-------|
| **Project Name** | {project_name} |
| **Cloud Provider** | [AWS / Azure / GCP] |
| **Review Date** | {assessment_date} |
| **Reviewer** | {user_name}, Claude (Nimbus) |

---

## 1. Account Inventory

### 1.1 Root/Owner Accounts

| Account ID | Account Name | Environment | Root MFA | Root Usage (90 days) | Status |
|------------|--------------|-------------|----------|----------------------|--------|
| | | | [Yes/No] | [None/Date] | [Compliant/Non-compliant] |

### 1.2 Admin/Privileged Accounts

| Account/User | Type | MFA Enabled | Last Login | Privileges | Justification |
|--------------|------|-------------|------------|------------|---------------|
| | [User/Service] | [Yes/No] | [Date] | [Admin/Power User] | |

### 1.3 Service Accounts

| Service Account | Purpose | Key Age (days) | Permissions | Owner | Status |
|-----------------|---------|----------------|-------------|-------|--------|
| | | | [Least Priv/Over-priv] | | |

---

## 2. Access Control Review

### 2.1 User Access Summary

| Metric | Count | Status |
|--------|-------|--------|
| Total Users | | |
| Users with MFA | | [X%] |
| Users without MFA | | |
| Inactive Users (90+ days) | | |
| Users with Console Access | | |
| Users with Programmatic Access | | |
| Users with Both | | |

### 2.2 Access Key Analysis

| Key Age Category | Count | Percentage | Action Required |
|------------------|-------|------------|-----------------|
| 0-90 days | | % | None |
| 90-180 days | | % | Review |
| 180-365 days | | % | Rotate |
| 365+ days | | % | Immediate rotation |

### 2.3 Password Policy Review

| Policy Setting | Current Value | Best Practice | Status |
|----------------|---------------|---------------|--------|
| Minimum Length | | 14+ | [Pass/Fail] |
| Require Uppercase | [Yes/No] | Yes | [Pass/Fail] |
| Require Lowercase | [Yes/No] | Yes | [Pass/Fail] |
| Require Numbers | [Yes/No] | Yes | [Pass/Fail] |
| Require Symbols | [Yes/No] | Yes | [Pass/Fail] |
| Max Age (days) | | 90 | [Pass/Fail] |
| Password Reuse Prevention | | 24 | [Pass/Fail] |

---

## 3. Policy Analysis

### 3.1 Attached Policies Overview

| Policy Type | Count | Overly Permissive | Action Required |
|-------------|-------|-------------------|-----------------|
| AWS Managed Policies | | | |
| Customer Managed Policies | | | |
| Inline Policies | | | |

### 3.2 High-Risk Policy Patterns

| Pattern | Count | Examples | Risk Level |
|---------|-------|----------|------------|
| `*:*` (Full Admin) | | | Critical |
| `iam:*` | | | High |
| `sts:AssumeRole` without conditions | | | High |
| `s3:*` on `*` | | | High |
| `ec2:*` | | | Medium |
| `lambda:*` | | | Medium |

### 3.3 Policies with Wildcards

| Policy Name | Attached To | Wildcard Actions | Wildcard Resources | Recommendation |
|-------------|-------------|------------------|-------------------|----------------|
| | | | | |

### 3.4 Unused Permissions Analysis

| User/Role | Unused Service Permissions | Last Used | Recommendation |
|-----------|---------------------------|-----------|----------------|
| | | | |

---

## 4. Role Analysis

### 4.1 Role Inventory

| Role Name | Type | Trust Policy | Attached Policies | Last Used |
|-----------|------|--------------|-------------------|-----------|
| | [Service/Cross-account/Federation] | [Principal] | | |

### 4.2 Cross-Account Access

| Role Name | Trusted Account(s) | External ID Required | Condition Keys | Risk |
|-----------|-------------------|---------------------|----------------|------|
| | | [Yes/No] | | [H/M/L] |

### 4.3 Service-Linked Roles

| Role Name | Service | Review Status |
|-----------|---------|---------------|
| | | [Reviewed/Pending] |

---

## 5. Federation & SSO

### 5.1 Identity Provider Configuration

| IdP Name | Type | Protocol | Status |
|----------|------|----------|--------|
| | [SAML/OIDC/Custom] | [SAML 2.0/OAuth/etc.] | [Active/Inactive] |

### 5.2 Federated User Access

| Federation Path | User Count | Role(s) Assumed | Session Duration |
|-----------------|------------|-----------------|------------------|
| | | | |

### 5.3 SSO Configuration (AWS SSO / Azure AD / GCP)

| Setting | Current Value | Best Practice | Status |
|---------|---------------|---------------|--------|
| MFA Enforcement | | Required | [Pass/Fail] |
| Session Duration | | Max 12 hours | [Pass/Fail] |
| Permission Sets Review | | Quarterly | [Pass/Fail] |

---

## 6. Service Account Security

### 6.1 Service Account Inventory

| Account/Role | Application | Key/Credential Type | Rotation Period | Owner |
|--------------|-------------|---------------------|-----------------|-------|
| | | [Access Key/Token/Certificate] | [Days] | |

### 6.2 Service Account Permissions

| Account | Current Permissions | Required Permissions | Gap | Action |
|---------|---------------------|---------------------|-----|--------|
| | | | [Over/Under] | |

### 6.3 Workload Identity (Modern Patterns)

| Workload | Identity Type | Status | Notes |
|----------|---------------|--------|-------|
| EC2/VMs | [Instance Profile/Managed Identity] | | |
| Lambda/Functions | [Execution Role/Service Identity] | | |
| Containers/K8s | [IRSA/Workload Identity] | | |

---

## 7. Findings Summary

### 7.1 Critical Findings

| ID | Finding | Affected Resources | Impact | Remediation |
|----|---------|-------------------|--------|-------------|
| IAM-C01 | | | | |

### 7.2 High Findings

| ID | Finding | Affected Resources | Impact | Remediation |
|----|---------|-------------------|--------|-------------|
| IAM-H01 | | | | |

### 7.3 Medium Findings

| ID | Finding | Affected Resources | Impact | Remediation |
|----|---------|-------------------|--------|-------------|
| IAM-M01 | | | | |

### 7.4 Low Findings

| ID | Finding | Affected Resources | Impact | Remediation |
|----|---------|-------------------|--------|-------------|
| IAM-L01 | | | | |

---

## 8. CIS Benchmark Mapping (IAM Section)

### AWS CIS Benchmark v1.5 - Section 1

| Control | Description | Status | Evidence |
|---------|-------------|--------|----------|
| 1.1 | Maintain current contact details | | |
| 1.2 | Ensure security contact information is registered | | |
| 1.3 | Ensure security questions are registered | | |
| 1.4 | Ensure no root user access key exists | | |
| 1.5 | Ensure MFA is enabled for root user | | |
| 1.6 | Ensure hardware MFA is enabled for root user | | |
| 1.7 | Eliminate use of root user for tasks | | |
| 1.8 | Ensure IAM password policy requires minimum length 14 | | |
| 1.9 | Ensure IAM password policy prevents password reuse | | |
| 1.10 | Ensure MFA is enabled for all IAM users with console password | | |
| 1.11 | Do not setup access keys during initial user setup | | |
| 1.12 | Ensure credentials unused for 45 days are disabled | | |
| 1.13 | Ensure only one active access key per user | | |
| 1.14 | Ensure access keys are rotated every 90 days | | |
| 1.15 | Ensure IAM users receive permissions only through groups | | |
| 1.16 | Ensure IAM policies with admin privileges not attached | | |
| 1.17 | Ensure a support role has been created | | |
| 1.18 | Ensure IAM instance roles are used for resource access | | |
| 1.19 | Ensure expired SSL/TLS certificates are removed | | |
| 1.20 | Ensure Access Analyzer is enabled | | |
| 1.21 | Ensure IAM users are managed centrally via identity federation | | |

### Azure CIS Benchmark - IAM Controls

| Control | Description | Status | Evidence |
|---------|-------------|--------|----------|
| 1.1 | Ensure Security Defaults is enabled | | |
| 1.2 | Ensure MFA is enabled for all users | | |
| 1.3 | Ensure guest users are reviewed monthly | | |
| 1.4 | Ensure no subscription owner can manage security | | |
| 1.5 | Ensure Conditional Access policies exist | | |

### GCP CIS Benchmark - IAM Controls

| Control | Description | Status | Evidence |
|---------|-------------|--------|----------|
| 1.1 | Ensure corporate login credentials are used | | |
| 1.2 | Ensure multi-factor authentication is enabled | | |
| 1.3 | Ensure Security Key Enforcement is enabled | | |
| 1.4 | Ensure service account has no admin privileges | | |
| 1.5 | Ensure service account keys are rotated | | |

---

## 9. Recommendations

### Immediate Actions (Week 1)

| Priority | Action | Owner | Due Date |
|----------|--------|-------|----------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

### Short-term Actions (Month 1)

| Priority | Action | Owner | Due Date |
|----------|--------|-------|----------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

### Long-term Improvements

| Initiative | Description | Timeline | Resources |
|------------|-------------|----------|-----------|
| | | | |

---

## 10. IaC Remediation Examples

### Enable MFA Enforcement (Terraform)

```hcl
# AWS IAM Account Password Policy
resource "aws_iam_account_password_policy" "strict" {
  minimum_password_length        = 14
  require_lowercase_characters   = true
  require_numbers                = true
  require_uppercase_characters   = true
  require_symbols                = true
  allow_users_to_change_password = true
  max_password_age               = 90
  password_reuse_prevention      = 24
}
```

### Least Privilege Role (Terraform)

```hcl
# Example least privilege role for S3 access
resource "aws_iam_role" "s3_readonly" {
  name = "s3-readonly-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "s3_readonly_policy" {
  name = "s3-readonly-policy"
  role = aws_iam_role.s3_readonly.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:ListBucket"
      ]
      Resource = [
        "arn:aws:s3:::specific-bucket",
        "arn:aws:s3:::specific-bucket/*"
      ]
    }]
  })
}
```

### Access Key Rotation (AWS CLI)

```bash
#!/bin/bash
# Rotate access keys older than 90 days

# List users with old keys
aws iam list-users --query 'Users[*].UserName' --output text | while read user; do
  aws iam list-access-keys --user-name "$user" \
    --query 'AccessKeyMetadata[?CreateDate<=`'$(date -d '90 days ago' +%Y-%m-%d)'`]' \
    --output table
done
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {assessment_date} | {user_name} | Initial review |
