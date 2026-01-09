---
name: 'step-03-container-security'
description: 'Container image and runtime security assessment'

workflow_path: '{project-root}/_bmad/cyber-ops/workflows/infrastructure-security-testing'
thisStepFile: '{workflow_path}/steps/step-03-container-security.md'
nextStepFile: '{workflow_path}/steps/step-04-kubernetes.md'
outputFile: '{output_folder}/security/infrastructure-security-testing-{project_name}.md'
---

# Step 3: Container Security Assessment

## MANDATORY EXECUTION RULES:

- NEVER generate content without user input
- YOU ARE A FACILITATOR, not a content generator
- Guide container security assessment

## SCOPE CHECK

"Are containers in scope for this assessment?

If NO: Select [S] to skip to Kubernetes or CI/CD.
If YES: Continue with container security testing below."

## CONTAINER SECURITY SEQUENCE:

### 1. Container Environment Overview

"Let's understand your container environment.

**Container Runtime:**
- Docker / containerd / CRI-O / Podman?
- Runtime version?
- Configuration location?

**Image Sources:**
- Public registries (Docker Hub, GHCR)?
- Private registry?
- Image signing in use?

**Deployment:**
- Standalone containers?
- Docker Compose?
- Kubernetes (covered in Step 4)?

What is your container setup?"

### 2. Image Security Scanning

"Let's scan container images for vulnerabilities.

**Scanning Tools:**
- Trivy
- Grype
- Clair
- Snyk Container
- Docker Scout

**What to Scan:**
- Base images
- Application images
- Third-party images

**Commands:**
```bash
# Trivy scan
trivy image <image-name>

# Grype scan
grype <image-name>

# Docker Scout
docker scout cves <image-name>
```

What image scanning results do you have?"

### 3. Image Build Security

"Reviewing Dockerfile and build practices.

**Dockerfile Best Practices:**
- Using official/trusted base images?
- Pinned versions (not :latest)?
- Multi-stage builds?
- Non-root user?
- Minimal final image?
- No secrets in image?

**Build Process:**
- Build arguments secure?
- Build cache considered?
- Image signing implemented?
- SBOM generated?

**Sample Dockerfile Review:**
```dockerfile
# Check for issues like:
# - Running as root
# - Installing unnecessary packages
# - Copying secrets
# - Using ADD instead of COPY
```

What Dockerfiles can we review?"

### 4. Container Runtime Security

"Testing container runtime configuration.

**Docker Daemon Security:**
- TLS enabled for remote API?
- User namespace remapping?
- Live restore enabled?
- Content trust enabled?

**Container Defaults:**
- Default capabilities dropped?
- Seccomp profile applied?
- AppArmor/SELinux enabled?
- Read-only root filesystem?

**Commands:**
```bash
# Check Docker info
docker info

# Inspect running container
docker inspect <container-id>

# Check capabilities
docker exec <container> capsh --print
```

What runtime configuration have you reviewed?"

### 5. Container Isolation

"Testing container isolation controls.

**Namespace Isolation:**
- PID namespace isolated?
- Network namespace isolated?
- User namespace enabled?
- IPC namespace isolated?

**Resource Controls:**
- Memory limits set?
- CPU limits set?
- PIDs limit configured?

**Filesystem Security:**
- Sensitive host paths mounted?
- Read-only mounts where possible?
- No Docker socket mounted?

**Commands:**
```bash
# Check container processes
docker top <container>

# Check mounts
docker inspect --format='{{.Mounts}}' <container>

# Check resource limits
docker inspect --format='{{.HostConfig.Memory}}' <container>
```

What isolation controls are in place?"

### 6. Docker Bench Security

"Let's run Docker Bench for Security.

**Docker Bench Checks:**
- Host configuration
- Docker daemon configuration
- Container images and build
- Container runtime
- Docker security operations

**Command:**
```bash
# Run Docker Bench
docker run --rm --net host --pid host --userns host \
  --cap-add audit_control \
  -v /var/lib:/var/lib:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /etc:/etc:ro \
  docker/docker-bench-security
```

What Docker Bench results do you have?"

### 7. Container Network Security

"Reviewing container networking.

**Network Configuration:**
- Bridge network isolated?
- Host networking in use?
- Inter-container communication controlled?
- Network policies defined?

**Exposed Ports:**
- Only required ports exposed?
- Ports bound to specific interfaces?
- No unnecessary host port mappings?

**Commands:**
```bash
# List networks
docker network ls

# Inspect network
docker network inspect bridge

# Check exposed ports
docker port <container>
```

What network security configuration is in place?"

### 8. Document Container Security

Append to {outputFile} Section 3:

```markdown
## 3. Container Security Assessment

### 3.1 Container Environment
| Component | Version | Configuration |
|-----------|---------|---------------|
| Runtime | | |
| Registry | | |
| Orchestration | | |

### 3.2 Image Vulnerabilities
| Image | Critical | High | Medium | Low |
|-------|----------|------|--------|-----|
| | | | | |

### 3.3 Dockerfile Review
| Image | Finding | Severity | Recommendation |
|-------|---------|----------|----------------|
| | | | |

### 3.4 Runtime Configuration
| Control | Status | Finding |
|---------|--------|---------|
| TLS enabled | | |
| User namespaces | | |
| Seccomp profile | | |
| AppArmor/SELinux | | |

### 3.5 Isolation Controls
| Control | Status | Finding |
|---------|--------|---------|
| Resource limits | | |
| Capabilities dropped | | |
| Read-only root | | |
| Docker socket | | |

### 3.6 Docker Bench Results
| Section | Score | Key Findings |
|---------|-------|--------------|
| Host config | | |
| Daemon config | | |
| Images | | |
| Runtime | | |

### 3.7 Container Findings
| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| CTR-001 | | | |
```

### 9. Confirmation

"**Container Security Assessment Complete**

**Summary:**
- Images scanned: [count]
- Critical vulnerabilities: [count]
- Configuration issues: [count]
- Docker Bench score: [X/Y]

Ready to proceed to Kubernetes security?"

## MENU

Display: [C] Continue to Kubernetes [R] Review/Add Findings [S] Skip to CI/CD

---

## CRITICAL STEP COMPLETION NOTE

Update frontmatter to `stepsCompleted: [1, 2, 3]`, then execute {nextStepFile}.
