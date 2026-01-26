# Project Management

This section contains project management artifacts for tracking development progress, planning, and certifications.

## Directory Structure

### `/epics/`
Contains Epic-level documentation describing major feature sets or project phases. Each epic document outlines scope, objectives, success criteria, and related stories.

### `/stories/`
Contains individual Story documents that break down epics into actionable work items. Stories include acceptance criteria, technical requirements, and implementation notes.

### `/certifications/`
Contains completion certifications and sign-off documents for epics, milestones, and major deliverables. These serve as formal records of reviewed and approved work.

### `/planning/`
Contains planning documents including roadmaps, sprint plans, backlog prioritization, and capacity planning materials.

### `/milestones/`
Contains milestone tracking documents that group related epics and stories into release targets with defined timelines and deliverables.

## Document Naming Conventions

- **Epics**: `EPIC-{number}-{short-name}.md` (e.g., `EPIC-001-user-authentication.md`)
- **Stories**: `STORY-{epic}-{number}-{short-name}.md` (e.g., `STORY-001-01-login-flow.md`)
- **Certifications**: `CERT-{type}-{identifier}-{date}.md` (e.g., `CERT-EPIC-001-2026-01-15.md`)
- **Milestones**: `MILESTONE-{version}-{name}.md` (e.g., `MILESTONE-v1.0-initial-release.md`)

## Usage

1. Create new epics in `/epics/` when planning major features or phases
2. Break epics into stories in `/stories/` for sprint planning
3. Track progress against milestones in `/milestones/`
4. Document completion with certifications in `/certifications/`
5. Use `/planning/` for roadmaps and strategic planning documents
