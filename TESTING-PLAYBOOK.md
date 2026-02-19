# BMAD-CYBER2 Testing Playbook

**Document Version:** 1.0
**Last Updated:** February 19, 2026
**Environment:** Kali Linux 2025.4 on ThinkPad X1 (192.168.70.105)
**Local Machine:** Mac with project at `/Users/paultinp/BMAD-CYBER2/`

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Initial Environment Setup](#phase-1-initial-environment-setup)
4. [Phase 2: Project Deployment](#phase-2-project-deployment)
5. [Phase 3: Dependency Installation](#phase-3-dependency-installation)
6. [Phase 4: Database Configuration](#phase-4-database-configuration)
7. [Phase 5: Server Startup](#phase-5-server-startup)
8. [Phase 6: Comprehensive QA Testing](#phase-6-comprehensive-qa-testing)
9. [Phase 7: Bug Fixes During Testing](#phase-7-bug-fixes-during-testing)
10. [Test Artifacts](#test-artifacts)
11. [Troubleshooting](#troubleshooting)

---

## Overview

This playbook documents the complete process of setting up a BMAD-CYBER2 testing environment on a remote Kali Linux machine and performing comprehensive QA testing. It can be used to reproduce the entire testing process.

### Environment Summary

| Component | Value |
|-----------|-------|
| **Remote Server** | Kali Linux 2025.4 |
| **Server IP** | 192.168.70.105 |
| **SSH User** | paultinp |
| **Sudo Password** | Lediscet2020 |
| **Project Path** | `/home/paultinp/BMAD-CYBER2/` |
| **Web UI Path** | `/home/paultinp/BMAD-CYBER2/apps/web-ui/` |
| **Server Port** | 42001 |
| **Local Project** | `/Users/paultinp/BMAD-CYBER2/` |

---

## Prerequisites

### On Local Machine (Mac)
- Bash shell
- SSH access to remote server
- `sshpass` installed (for automated SSH)
- `tar` for file packaging

### On Remote Server (Kali Linux)
- SSH access configured
- At least 10GB free disk space
- Internet connection for package downloads

---

## Phase 1: Initial Environment Setup

### Step 1.1: Create Setup Scripts

Create these scripts on your local machine at `~/`:

**File: `~/dev-env-setup.sh`**

This script installs all development tools on Kali Linux.

**File: `~/init-project.sh`**

This script initializes new projects with proper structure.

**File: `~/bmad-ssh.sh`**

This is an SSH connection helper.

### Step 1.2: Run Initial Setup

```bash
# From local machine
sshpass -p 'Lediscet2020' ssh -o StrictHostKeyChecking=no paultinp@192.168.70.105 'bash -s' < ~/dev-env-setup.sh
```

### Step 1.3: Configure Power Management (Disable Sleep)

```bash
sshpass -p 'Lediscet2020' ssh paultinp@192.168.70.105 << 'EOF'
# Mask sleep targets
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target

# Configure logind to ignore lid close
sudo sed -i 's/^#HandleLidSwitch=.*/HandleLidSwitch=ignore/' /etc/systemd/logind.conf
sudo sed -i 's/^HandleLidSwitch=.*/HandleLidSwitch=ignore/' /etc/systemd/logind.conf

# Restart logind
sudo systemctl restart systemd-logind

echo "Power management configured - sleep and lid close disabled"
EOF
```

**Verification:**
```bash
ssh paultinp@192.168.70.105 'systemctl status sleep.target'
```

---

## Phase 2: Project Deployment

### Step 2.1: Package Project from Local Mac

```bash
# From local Mac
cd /Users/paultinp
tar --exclude='node_modules' --exclude='.next' --exclude='*.pyc' --exclude='__pycache__' -czf BMAD-CYBER2.tar.gz BMAD-CYBER2/
```

### Step 2.2: Transfer to Remote Server

```bash
# Using tar+ssh (more reliable than rsync for large projects)
cat BMAD-CYBER2.tar.gz | sshpass -p 'Lediscet2020' ssh paultinp@192.168.70.105 'cd ~ && tar -xzf -'
```

**Expected:** ~96,694 files transferred

**Alternative (if tar+ssh fails):**
```bash
rsync -avz --exclude='node_modules' --exclude='.next' /Users/paultinp/BMAD-CYBER2/ paultinp@192.168.70.105:~/BMAD-CYBER2/
```

### Step 2.3: Verify Transfer

```bash
ssh paultinp@192.168.70.105 'ls -la ~/BMAD-CYBER2/'
```

---

## Phase 3: Dependency Installation

### Step 3.1: Install Web UI Dependencies

```bash
sshpass -p 'Lediscet2020' ssh -o StrictHostKeyChecking=no paultinp@192.168.70.105 << 'EOF'
. ~/.nvm/nvm.sh
cd ~/BMAD-CYBER2/apps/web-ui
npm install --legacy-peer-deps
EOF
```

**Note:** The `--legacy-peer-deps` flag is required due to ESLint version conflicts between packages.

**Expected Output:**
```
added 1494 packages, and audited 1494 packages in 12s
found 0 vulnerabilities
```

### Step 3.2: Handle Python Dependencies (if needed)

For Python packages, use:
```bash
pip install --break-system-packages <package>
```

Or use pipx for isolated installations:
```bash
pipx install <package>
```

---

## Phase 4: Database Configuration

### Step 4.1: Fix Prisma Binary Targets (CRITICAL)

**Issue:** Prisma was built for Mac (darwin-arm64) but server runs Linux (debian-openssl-3.0.x)

**Fix:**

```bash
sshpass -p 'Lediscet2020' ssh paultinp@192.168.70.105 << 'EOF'
. ~/.nvm/nvm.sh
cd ~/BMAD-CYBER2/apps/web-ui

# Update schema.prisma
sed -i '/provider = "prisma-client-js"/a\  binaryTargets = ["native", "debian-openssl-3.0.x"]' prisma/schema.prisma

# Verify the change
head -10 prisma/schema.prisma
EOF
```

**Expected schema.prisma output:**
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

### Step 4.2: Regenerate Prisma Client

```bash
sshpass -p 'Lediscet2020' ssh paultinp@192.168.70.105 << 'EOF'
. ~/.nvm/nvm.sh
cd ~/BMAD-CYBER2/apps/web-ui
npx prisma generate
npx prisma db push
EOF
```

**Expected Output:**
```
✔ Generated Prisma Client (v6.19.2)
The database is already in sync with the Prisma schema.
```

---

## Phase 5: Server Startup

### Step 5.1: Start the Web UI Server

```bash
sshpass -p 'Lediscet2020' ssh -o StrictHostKeyChecking=no paultinp@192.168.70.105 << 'EOF'
. ~/.nvm/nvm.sh
cd ~/BMAD-CYBER2/apps/web-ui

# Kill any existing server
pkill -f "next dev" 2>/dev/null

# Start server in background
nohup npm run dev > /tmp/webui.log 2>&1 &
echo $! > /tmp/webui.pid

# Wait for startup
sleep 8

# Check logs
tail -30 /tmp/webui.log
EOF
```

**Expected Output:**
```
▲ Next.js 16.1.6 (Turbopack)
- Local:         http://localhost:42001
- Network:       http://192.168.70.105:42001
✓ Ready in ~1300ms
```

### Step 5.2: Verify Server is Running

```bash
# Check if port 42001 is listening
ssh paultinp@192.168.70.105 'netstat -tlnp | grep 42001'

# Check server is responding
curl -s http://192.168.70.105:42001 | grep -o '<title>[^<]*</title>'
```

**Expected:** Server listening on port 42001, title shows "BMAD - Mission Orchestration Platform"

### Step 5.3: Server Management Commands

```bash
# Check server status
ssh paultinp@192.168.70.105 'tail -50 /tmp/webui.log'

# Stop server
ssh paultinp@192.168.70.105 'pkill -f "next dev"'

# Restart server
ssh paultinp@192.168.70.105 << 'EOF'
. ~/.nvm/nvm.sh
cd ~/BMAD-CYBER2/apps/web-ui
pkill -f "next dev"
nohup npm run dev > /tmp/webui.log 2>&1 &
EOF
```

---

## Phase 6: Comprehensive QA Testing

### Step 6.1: Create Test Users

```bash
# Create primary test user
curl -s -X POST "http://192.168.70.105:42001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"qatest@example.com","name":"QA Tester","password":"QATestPassword","confirmPassword":"QATestPassword"}'

# Expected output: {"user":{"id":"...","email":"qatest@example.com","name":"QA Tester","role":"USER"}}
```

**Additional test users:**
```bash
# Quinn QA
curl -s -X POST "http://192.168.70.105:42001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"quinn.test@example.com","name":"Quinn QA","password":"TestPassword123!","confirmPassword":"TestPassword123!"}'

# Test User
curl -s -X POST "http://192.168.70.105:42001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test.valid@example.com","name":"Test User","password":"TestPassword123!","confirmPassword":"TestPassword123!"}'
```

### Step 6.2: Browser-Based Testing Setup

Use Chrome/Chromium with MCP browser automation tools.

**Tab management:**
```javascript
// Create new tab group
mcp__Claude_in_Chrome__tabs_context_mcp({createIfEmpty: true})

// Navigate to pages
mcp__Claude_in_Chrome__navigate({tabId: <id>, url: "http://192.168.70.105:42001/"})

// Take screenshots
mcp__Claude_in_Chrome__computer({action: "screenshot", tabId: <id>})

// Read page elements
mcp__Claude_in_Chrome__read_page({tabId: <id>, filter: "all"})

// Click elements
mcp__Claude_in_Chrome__computer({action: "left_click", ref: "<ref_id>", tabId: <id>})

// Fill forms
mcp__Claude_in_Chrome__form_input({ref: "<ref_id>", value: "<value>", tabId: <id>})
```

### Step 6.3: Test All Public Pages

**Homepage (http://192.168.70.105:42001/)**
- Screenshot: `ss_<id>`
- Read all elements
- Click "Sign In" link
- Click "Create Account" link
- Test responsive (375x667)

**Login Page (http://192.168.70.105:42001/login)**
- Screenshot: `ss_<id>`
- Read all form fields
- Test OAuth buttons (Google, GitHub)
- Click "Sign up" link
- Test form submission with valid/invalid credentials

**Register Page (http://192.168.70.105:42001/register)**
- Screenshot: `ss_<id>`
- Read all form fields
- Test all validation scenarios
- Test form submission

**404 Pages**
- Test: `/nonexistent`
- Test: `/abc123`
- Test: `/test/invalid/path`
- Verify 404 message displays

**Forbidden Page**
- Test: `/forbidden`
- Click "Go to Dashboard" link
- Click "Go Home" link

### Step 6.4: Test All Dashboard Pages (Authenticated)

**Login and save session:**
```bash
# Login via API to get cookies
curl -s -X POST "http://192.168.70.105:42001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"qatest@example.com","password":"QATestPassword"}' \
  -c /tmp/qa-auth-cookies.txt
```

**Test dashboard routes:**
```bash
# Test all dashboard pages
for page in "/dashboard" "/agents" "/projects" "/teams" "/workflows" "/templates" \
           "/missions" "/settings" "/settings/api-keys" "/settings/sessions" \
           "/settings/security" "/api-explorer" "/docs/api"; do
  echo "Testing: $page"
  curl -s -b /tmp/qa-auth-cookies.txt "http://192.168.70.105:42001$page" \
    | grep -o '<title>[^<]*</title>'
done
```

### Step 6.5: Test All API Endpoints

**Public APIs:**
```bash
echo "Testing public APIs..."

# Health endpoints
curl -s "http://192.168.70.105:42001/api/health"
curl -s "http://192.168.70.105:42001/api/v1/health"

# Data endpoints
curl -s "http://192.168.70.105:42001/api/teams"
curl -s "http://192.168.70.105:42001/api/workflows"
curl -s "http://192.168.70.105:42001/api/v1/agents"
curl -s "http://192.168.70.105:42001/api/v1/templates"
```

**Authenticated APIs:**
```bash
# Test with cookies saved from login
curl -s -b /tmp/qa-auth-cookies.txt "http://192.168.70.105:42001/api/auth/me"
curl -s -b /tmp/qa-auth-cookies.txt "http://192.168.70.105:42001/api/user/profile"
curl -s -b /tmp/qa-auth-cookies.txt "http://192.168.70.105:42001/api/user/preferences"
curl -s -b /tmp/qa-auth-cookies.txt "http://192.168.70.105:42001/api/projects"
```

### Step 6.6: Test Form Validations

**Registration validations:**
```bash
# Test empty email
curl -s -X POST "http://192.168.70.105:42001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"","password":"test123456789"}'

# Expected: {"error":"Validation failed","message":"Email is required"}

# Test invalid email
curl -s -X POST "http://192.168.70.105:42001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"test123456789"}'

# Expected: {"error":"Validation failed","message":"Invalid email address"}

# Test short password
curl -s -X POST "http://192.168.70.105:42001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"short"}'

# Expected: {"error":"Validation failed","message":"Password must be at least 12 characters"}

# Test password mismatch
curl -s -X POST "http://192.168.70.105:42001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!","confirmPassword":"Different456!"}'

# Expected: {"error":"Validation failed","message":"Passwords don't match"}

# Test duplicate email
curl -s -X POST "http://192.168.70.105:42001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"qatest@example.com","password":"TestPassword123!","confirmPassword":"TestPassword123!"}'

# Expected: {"error":"User already exists","message":"An account with this email already exists"}
```

**Login validations:**
```bash
# Test empty credentials
curl -s -X POST "http://192.168.70.105:42001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"","password":""}'

# Expected: {"error":"Validation failed","message":"Email is required"}

# Test invalid credentials
curl -s -X POST "http://192.168.70.105:42001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@test.com","password":"wrongpassword"}'

# Expected: {"error":"Invalid credentials","message":"Email or password is incorrect"}
```

### Step 6.7: Test Responsive Design

**Mobile viewport testing:**
```javascript
// Resize browser to mobile
mcp__Claude_in_Chrome__resize_window({
  tabId: <id>,
  width: 375,
  height: 667
})

// Test all pages on mobile
// - Homepage
// - Login
// - Register
// - Dashboard (if accessible)
```

### Step 6.8: Test All Navigation Links

**From each page, test:**
1. All clickable elements
2. All navigation links
3. All buttons
4. All form inputs
5. All external links

---

## Phase 7: Bug Fixes During Testing

### Bug #1: Prisma Binary Mismatch

**Symptom:**
```
Prisma Client could not locate the Query Engine for runtime "debian-openssl-3.0.x"
```

**Fix:**
```bash
sshpass -p 'Lediscet2020' ssh paultinp@192.168.70.105 << 'EOF'
. ~/.nvm/nvm.sh
cd ~/BMAD-CYBER2/apps/web-ui

# Add binary targets to schema
sed -i '/provider = "prisma-client-js"/a\  binaryTargets = ["native", "debian-openssl-3.0.x"]' prisma/schema.prisma

# Regenerate
npx prisma generate
npx prisma db push

# Restart server
pkill -f "next dev"
nohup npm run dev > /tmp/webui.log 2>&1 &
EOF
```

### Bug #2: bcrypt Module Corruption

**Symptom:**
```
Error: /home/paultinp/BMAD-CYBER2/node_modules/bcrypt/prebuilds/linux-x64/._bcrypt.glibc.node: invalid ELF header
```

**Fix:**
```bash
sshpass -p 'Lediscet2020' ssh paultinp@192.168.70.105 << 'EOF'
. ~/.nvm/nvm.sh
cd ~/BMAD-CYBER2/apps/web-ui
npm rebuild bcrypt
EOF
```

---

## Test Artifacts

### Files Created During Testing

| File | Location | Purpose |
|------|----------|---------|
| `QA-REPORT-2026-02-19.md` | `/Users/paultinp/BMAD-CYBER2/` | Complete QA report |
| `TESTING-PLAYBOOK.md` | `/Users/paultinp/BMAD-CYBER2/` | This document |
| `/tmp/qa-auth-cookies.txt` | Local machine | Session cookies for API testing |
| `/tmp/webui.log` | Remote server | Server logs |
| `/tmp/webui.pid` | Remote server | Server process ID |

### Screenshots Captured

All screenshots are stored in the browser automation system with IDs:

- `ss_4974bms42` - Homepage (Desktop)
- `ss_2260nye51` - Login Page (Desktop)
- `ss_741128lk8` - Register Page (Desktop)
- `ss_8430bk6v4` - Homepage (Mobile 375x667)

### Test Users Created

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| qatest@example.com | QATestPassword | USER | Primary testing |
| quinn.test@example.com | TestPassword123! | USER | QA testing |
| test.valid@example.com | TestPassword123! | USER | Validation testing |
| weak@example.com | aaaaaaaaaaaa | USER | Password complexity test |

---

## Troubleshooting

### Issue: SSH Permission Denied

**Symptom:**
```
Permission denied, please try again.
Permission denied (publickey,password).
```

**Solution:**
```bash
# Use sshpass for automated login
sshpass -p 'Lediscet2020' ssh -o StrictHostKeyChecking=no paultinp@192.168.70.105 '<command>'
```

### Issue: Server Not Responding

**Diagnosis:**
```bash
# Check if server is running
ssh paultinp@192.168.70.105 'ps aux | grep next-server'

# Check if port is listening
ssh paultinp@192.168.70.105 'netstat -tlnp | grep 42001'

# Check server logs
ssh paultinp@192.168.70.105 'tail -100 /tmp/webui.log'
```

**Solution:**
```bash
# Restart server
sshpass -p 'Lediscet2020' ssh paultinp@192.168.70.105 << 'EOF'
. ~/.nvm/nvm.sh
cd ~/BMAD-CYBER2/apps/web-ui
pkill -f "next dev"
rm -f /tmp/webui.pid /tmp/webui.log
nohup npm run dev > /tmp/webui.log 2>&1 &
echo $! > /tmp/webui.pid
sleep 8
tail -30 /tmp/webui.log
EOF
```

### Issue: npm install Fails

**Symptom:**
```
npm error code ERESOLVE
could not resolve dependency
```

**Solution:**
```bash
# Use --legacy-peer-deps flag
npm install --legacy-peer-deps
```

### Issue: Prisma Client Errors

**Symptom:**
```
PrismaClientInitializationError: Invalid prisma.user.findUnique() invocation
```

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate
npx prisma db push
```

### Issue: Chrome Extension Disconnects

**Symptom:**
```
Error capturing screenshot: Cannot access a chrome-extension:// URL of different extension
Error clicking: Cannot access a chrome-extension:// URL of different extension
```

**Solution:**
- Create a new tab: `mcp__Claude_in_Chrome__tabs_create_mcp()`
- Navigate to page again
- Wait for page to load fully before taking screenshots

### Issue: Registration Fails with Special Characters

**Symptom:**
```
Registration error: SyntaxError: Bad escaped character in JSON
```

**Solution:**
- Use passwords without special characters during testing
- Or use different escape method in registration

---

## Quick Reference Commands

### SSH Connection
```bash
# Interactive
ssh paultinp@192.168.70.105

# Automated with password
sshpass -p 'Lediscet2020' ssh -o StrictHostKeyChecking=no paultinp@192.168.70.105 '<command>'
```

### Server Management
```bash
# Start server
sshpass -p 'Lediscet2020' ssh paultinp@192.168.70.105 '. ~/.nvm/nvm.sh && cd ~/BMAD-CYBER2/apps/web-ui && nohup npm run dev > /tmp/webui.log 2>&1 &'

# Stop server
ssh paultinp@192.168.70.105 'pkill -f "next dev"'

# Check logs
ssh paultinp@192.168.70.105 'tail -50 /tmp/webui.log'
```

### Testing Commands
```bash
# Health check
curl -s http://192.168.70.105:42001/api/v1/health | jq

# Login
curl -s -X POST "http://192.168.70.105:42001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"qatest@example.com","password":"QATestPassword"}' \
  -c /tmp/qa-cookies.txt

# Get current user
curl -s -b /tmp/qa-cookies.txt http://192.168.70.105:42001/api/auth/me

# Get teams
curl -s http://192.168.70.105:42001/api/teams | jq '.teams[] | {id, name}'

# Get workflows
curl -s http://192.168.70.105:42001/api/workflows | jq '.workflows[] | {id, name, category}'
```

---

## Reproducing the Full Test Run

To reproduce the entire testing process from scratch:

```bash
# 1. Setup environment (run once)
./dev-env-setup.sh  # via SSH to Kali machine

# 2. Deploy project
cd /Users/paultinp
tar --exclude='node_modules' --exclude='.next' -czf BMAD-CYBER2.tar.gz BMAD-CYBER2/
cat BMAD-CYBER2.tar.gz | sshpass -p 'Lediscet2020' ssh paultinp@192.168.70.105 'cd ~ && tar -xzf -'

# 3. Fix Prisma for Linux
sshpass -p 'Lediscet2020' ssh paultinp@192.168.70.105 << 'EOF'
. ~/.nvm/nvm.sh
cd ~/BMAD-CYBER2/apps/web-ui
sed -i '/provider = "prisma-client-js"/a\  binaryTargets = ["native", "debian-openssl-3.0.x"]' prisma/schema.prisma
npx prisma generate
npx prisma db push
EOF

# 4. Install dependencies
sshpass -p 'Lediscet2020' ssh paultinp@192.168.70.105 '. ~/.nvm/nvm.sh && cd ~/BMAD-CYBER2/apps/web-ui && npm install --legacy-peer-deps'

# 5. Start server
sshpass -p 'Lediscet2020' ssh paultinp@192.168.70.105 '. ~/.nvm/nvm.sh && cd ~/BMAD-CYBER2/apps/web-ui && nohup npm run dev > /tmp/webui.log 2>&1 &'

# 6. Verify
curl -s http://192.168.70.105:42001 | grep -o '<title>[^<]*</title>'

# 7. Run tests (use browser automation or API tests)
# ... See Phase 6 for detailed testing steps
```

---

## Continuous Testing

To set up recurring testing:

### Daily Server Health Check
```bash
# Add to crontab: 0 9 * * * /path/to/health-check.sh
#!/bin/bash
HEALTH=$(curl -s http://192.168.70.105:42001/api/v1/health | jq -r '.data.status')
if [ "$HEALTH" != "healthy" ]; then
  echo "Server unhealthy: $HEALTH" | mail -s "BMAD Server Alert" admin@example.com
fi
```

### Weekly Dependency Update Check
```bash
#!/bin/bash
sshpass -p 'Lediscet2020' ssh paultinp@192.168.70.105 << 'EOF'
. ~/.nvm/nvm.sh
cd ~/BMAD-CYBER2/apps/web-ui
npm outdated
EOF
```

---

**Document maintained by:** QA Team
**Last reviewed:** February 19, 2026
**Next review:** After each major version update
