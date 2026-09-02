# ContentForge AI — Frontend PRD & Implementation Specification

**Project:** ContentForge AI  
**SIH:** 2026 — SIH26154  
**Team:** Elite Coders  
**Frontend:** Next.js / React + TypeScript  
**Backend:** FastAPI  
**Primary frontend user:** Internal operator / analyst  
**Additional roles:** Reviewer, Administrator

---

# 1. Purpose of This Document

This document is the complete frontend handoff for the frontend engineer.

It defines:

- What pages the frontend must contain
- What each page should look like
- What components are required
- What APIs the frontend consumes
- Authentication and RBAC behavior
- Upload and processing UX
- CCO/source/evidence visualization
- Transformation configuration
- Generation progress
- Verification and human review
- Artifact preview/download
- PPTX, DOCX/PDF, infographic and video-package handling
- Admin screens
- Error/loading/empty states
- Frontend/backend integration contracts
- Suggested project structure
- MVP priorities

The frontend engineer should be able to build the frontend without guessing what the backend or AI team is expected to return.

---

# 2. Product Mental Model

ContentForge is **not a normal chatbot UI**.

The main user journey is:

```text
LOGIN
  ↓
DASHBOARD
  ↓
CREATE TRANSFORMATION SESSION
  ↓
UPLOAD SOURCE
  ↓
INGESTION / UNDERSTANDING
  ↓
SOURCE + CCO + EVIDENCE VIEW
  ↓
SELECT OUTPUTS + PARAMETERS
  ↓
GENERATE
  ↓
GENERATION PROGRESS
  ↓
VERIFICATION
  ↓
REVIEW / APPROVE
  ↓
ARTIFACT WORKSPACE
  ↓
PREVIEW / DOWNLOAD / FINALIZE
  ↓
PROVENANCE
```

The interface should make this pipeline visually obvious.

---

# 3. Frontend Technology

## Required

- Next.js
- React
- TypeScript
- Tailwind CSS or equivalent design system
- React Query / TanStack Query for server state
- Zod or equivalent client-side schema validation
- A component library may be used if it speeds up development

## Recommended

```text
Next.js App Router
React + TypeScript
TanStack Query
Zod
Tailwind
React Hook Form
```

Do not put AI/business logic in the frontend.

The frontend is responsible for:

- User interaction
- Form validation
- API calls
- State presentation
- Progress/status presentation
- Artifact preview
- Role-based UI
- Error handling

The backend remains the source of truth for authorization and business state.

---

# 4. Global Application Layout

After login:

```text
┌──────────────────────────────────────────────────────────────┐
│ CONTENTFORGE AI                         User ▾   Notifications│
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│ Dashboard     │                                              │
│ Sessions      │              PAGE CONTENT                    │
│               │                                              │
│ + New Session │                                              │
│               │                                              │
│ Review Queue  │                                              │
│ Artifacts     │                                              │
│               │                                              │
│ ───────────── │                                              │
│ Admin         │  ← only Admin                                │
│               │                                              │
│ Settings      │                                              │
│               │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

### Sidebar

Common navigation:

- Dashboard
- Sessions
- New Session
- Review Queue
- Artifacts
- Admin — Admin only
- Profile / Settings

The sidebar must be generated from the authenticated user's role.

Do not rely on frontend hiding for security.

---

# 5. Authentication

## Page: `/login`

### UI

```text
┌───────────────────────────────────┐
│          CONTENTFORGE AI          │
│                                   │
│  Internal Content Transformation  │
│                                   │
│  Email / Username                 │
│  [________________________]       │
│                                   │
│  Password                         │
│  [________________________]       │
│                                   │
│          [ SIGN IN ]              │
│                                   │
│  Authentication error             │
└───────────────────────────────────┘
```

The frontend calls:

```http
POST /auth/login
```

Then:

```http
GET /auth/me
```

The `/auth/me` response should provide:

```json
{
  "id": "USR-001",
  "name": "Example User",
  "role": "analyst"
}
```

Supported roles:

```text
analyst
reviewer
admin
```

---

# 6. RBAC Frontend Requirements

The frontend must know the current role so it can present the appropriate UI.

## Analyst

Can see:

- Dashboard
- Sessions
- New Session
- Own/permitted sessions
- Transformation
- Artifacts
- Verification
- Submit for review

Cannot see:

- User management
- Role management
- System-wide audit logs
- Security events
- Administrative configuration

## Reviewer

Everything an Analyst can do, plus:

- Review Queue
- Verification details
- Approve
- Reject
- Request revision
- Compare artifact versions
- Review flagged claims

## Admin

Everything a Reviewer can do, plus:

- Admin dashboard
- User management
- Role assignment
- Audit logs
- Security events
- System configuration

### Important

Frontend RBAC is only a UX layer.

The backend must enforce:

```text
request
 ↓
authentication
 ↓
authorization
 ↓
allow / deny
```

A user must not gain access merely by manually entering an API URL.

---

# 7. Page Map

Required pages:

```text
/auth/login

/dashboard

/sessions
/sessions/new
/sessions/[sessionId]

/sessions/[sessionId]/source
/sessions/[sessionId]/cco
/sessions/[sessionId]/evidence

/sessions/[sessionId]/transform
/transformations/[transformationId]

/artifacts
/artifacts/[artifactId]

/review
/review/[artifactId]

/admin
/admin/users
/admin/audit-logs
/admin/security-events
/admin/settings
```

Some source/CCO/evidence screens can be tabs inside the session page instead of separate routes.

---

# 8. Dashboard

## Page: `/dashboard`

Purpose: give the operator a quick overview.

### Suggested layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Dashboard                              [+ New Session]        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Sessions       Processing       Review       Artifacts      │
│     12               2              3             31         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Recent Sessions                                               │
│                                                              │
│ Incident Report A      3 outputs      Verified     2h ago    │
│ Threat Report B        2 outputs      Review       4h ago    │
│ Advisory C             4 outputs      Processing   5h ago    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Recent Review Items                                           │
│                                                              │
│ Advisory #21        3 flagged claims       [Review]          │
│ PPT #18             Pending approval        [Review]          │
└──────────────────────────────────────────────────────────────┘
```

Cards should be functional, not decorative.

---

# 9. Sessions Page

## Page: `/sessions`

Show persistent transformation sessions.

Each row/card:

```text
Session ID
Source name
Created by
Created time
CCO version
Status
Number of artifacts
Last activity
```

Example:

```text
┌─────────────────────────────────────────────────────────────┐
│ SESSION-001                                                 │
│ Incident_Report_March.pdf                                   │
│ CCO v2 • 4 artifacts • Last updated 10:42                  │
│ Status: Ready                                               │
│                                           [Open Session]    │
└─────────────────────────────────────────────────────────────┘
```

Filters:

- Status
- Date
- Creator
- Session ID
- Source name

---

# 10. Create Session / Upload Page

## Page: `/sessions/new`

This is one of the most important pages.

### Stepper

```text
1 Source
→
2 Understanding
→
3 Configure
→
4 Generate
→
5 Verify
→
6 Artifacts
```

### Upload area

```text
┌────────────────────────────────────────────────────────────┐
│                    Upload Source                            │
│                                                            │
│       Drag & Drop files here                               │
│                                                            │
│              or [ Browse Files ]                           │
│                                                            │
│ PDF • DOCX • TXT • Image • Video                           │
└────────────────────────────────────────────────────────────┘
```

Also allow:

```text
[ Paste Text ]
[ Enter Prompt / Context ]
```

### Upload list

For each uploaded file:

```text
✓ incident-report.pdf
  12.4 MB
  Validating...
```

Possible statuses:

```text
Uploading
Validating
Queued
Processing
Completed
Failed
```

### Upload requirements

Frontend should:

- Show file size
- Show MIME/type
- Show upload progress
- Show validation status
- Allow removal before processing
- Display backend validation errors
- Prevent obviously unsupported file types before API call
- Never assume a successful upload means successful ingestion

---

# 11. Upload APIs

Frontend consumes:

```http
POST /sessions
POST /sessions/{sessionId}/documents
GET  /documents/{documentId}
GET  /documents/{documentId}/versions
```

The backend should return document status.

Example:

```json
{
  "document_id": "DOC-001",
  "filename": "incident.pdf",
  "status": "processing",
  "mime_type": "application/pdf"
}
```

Frontend polls or subscribes to processing status.

---

# 12. Source Processing / Understanding Page

After upload:

```text
Source uploaded
      ↓
Validating
      ↓
Extracting
      ↓
Building evidence index
      ↓
Building CCO
      ↓
Ready
```

UI:

```text
┌──────────────────────────────────────────────┐
│ Processing Source                            │
│                                              │
│ ✓ File validation                            │
│ ✓ PDF extraction                             │
│ ✓ Layout analysis                            │
│ ✓ Semantic chunking                          │
│ ● Building CCO                               │
│ ○ Evidence indexing                          │
│                                              │
│ [ View source when ready ]                   │
└──────────────────────────────────────────────┘
```

Do not expose fake progress percentages unless the backend actually provides meaningful progress.

---

# 13. Session Workspace

## Page: `/sessions/[sessionId]`

This should be the central application workspace.

Recommended tabs:

```text
Overview | Source | CCO | Evidence | Transform | Artifacts | Provenance
```

### Overview

Show:

- Session ID
- Source files
- CCO version
- Current status
- Number of artifacts
- Verification status
- Last activity
- Created by
- Audit/provenance summary

---

# 14. Source Viewer

## Tab: Source

Show the source document or extracted content.

For PDF/DOCX:

```text
┌──────────────────────┬───────────────────────────────┐
│ Pages / Sections     │ Extracted Source              │
│                      │                               │
│ Page 1               │ Incident Overview             │
│ Page 2               │ ...                           │
│ Page 3               │ ...                           │
│                      │                               │
└──────────────────────┴───────────────────────────────┘
```

If evidence is selected elsewhere, highlight:

- Page
- Section
- Block
- Bounding box when available

The frontend should not implement OCR itself.

It displays backend-provided extraction metadata.

---

# 15. CCO Viewer

## Tab: CCO

This is a major differentiating UI.

Do not simply show raw JSON.

Use structured sections:

```text
CCO v2

Metadata
Entities
Claims
Facts
Dates
Numbers
Identifiers
Tables
Conflicts
Evidence Links
```

Example:

```text
CLAIMS

37 systems were affected
Confidence: 0.97
Status: VERIFIED

Evidence:
Page 8 → Chunk 021
[View Evidence]
```

### CCO version selector

```text
CCO v1
CCO v2 ← current
```

If the source changes, the UI should clearly show that v2 is newer while old artifacts remain linked to v1.

---

# 16. Evidence Viewer

## Tab: Evidence

Show:

```text
Search evidence...
```

Each result:

```text
Chunk 021
Page 8
Section: Impact Assessment

"...37 systems were affected..."

[Open Source Location]
```

Useful filters:

- Page
- Section
- Evidence type
- Claim
- Entity

The frontend receives evidence from:

```http
GET /documents/{id}/evidence
```

---

# 17. Transformation Planner

## Tab/Page: Transform

This is where the operator chooses what to generate.

### Output selection

Use cards:

```text
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Executive   │ │ Advisory    │ │ Presentation│
│ Summary     │ │             │ │             │
│ [✓ Select]  │ │ [✓ Select]  │ │ [ Select ]  │
└─────────────┘ └─────────────┘ └─────────────┘

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Infographic │ │ Video       │ │ Social      │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Parameters

Required controls:

```text
Audience
Tone
Language
Detail Level
Communication Objective
Content Style
```

Example:

```text
Audience:
[ Senior Government Officials ▼ ]

Tone:
[ Formal ▼ ]

Language:
[ English ▼ ]

Detail:
[ Concise ▼ ]

Objective:
[ Inform ▼ ]

Style:
[ Executive Briefing ▼ ]
```

### Advanced options

Potentially expose:

- Template version
- Model profile
- Verification strictness

These should be backend-controlled and only exposed if required.

---

# 18. Transformation API

Frontend sends:

```http
POST /transformations
```

Example request:

```json
{
  "session_id": "SESSION-001",
  "cco_version": 2,
  "output_types": [
    "executive_summary",
    "advisory",
    "presentation"
  ],
  "audience": "senior_officials",
  "tone": "formal",
  "language": "en",
  "detail_level": "concise",
  "objective": "inform",
  "style": "executive"
}
```

Backend returns:

```json
{
  "transformation_id": "TR-001",
  "status": "queued"
}
```

Frontend then navigates to:

```text
/transformations/TR-001
```

---

# 19. Generation Progress Page

## Page: `/transformations/[transformationId]`

Show output-by-output progress.

```text
Transformation TR-001

Executive Summary     ✓ Complete
Advisory              ● Generating
Presentation          ○ Queued

Overall status:
GENERATING
```

Possible backend states:

```text
queued
processing
generated
verifying
review_required
completed
failed
```

Do not hard-code assumptions about processing duration.

---

# 20. Verification UI

This is one of the most important pages for demonstrating that ContentForge is more than an LLM wrapper.

## Verification screen

```text
┌──────────────────────────────────────────────────────────────┐
│ Verification Result                                         │
│                                                              │
│ Status: REVIEW REQUIRED                                     │
│ Grounding Score: 94%                                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Claim Checks                                                 │
│                                                              │
│ ✓ 37 systems affected       Supported — Page 8              │
│ ✓ Incident date             Supported — Page 2              │
│ ⚠ Impact estimate           Evidence insufficient            │
│ ✕ Unsupported statement     No supporting evidence           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Each flagged claim should support:

```text
Generated claim
↓
Reason
↓
Evidence
↓
Action
```

Actions:

```text
[Accept]
[Request Revision]
[Reject Artifact]
```

The frontend should not calculate grounding scores. It displays backend verification results.

---

# 21. Reviewer Queue

## Page: `/review`

Only Reviewer/Admin.

Example:

```text
┌────────────────────────────────────────────────────────────┐
│ Review Queue                                                │
├────────────────────────────────────────────────────────────┤
│ Artifact       Issue              Severity      Age         │
│ Advisory #12   Unsupported claim  High          12m         │
│ PPT #09        Number mismatch    Medium        25m         │
│ Summary #31    Conflict detected  Medium        1h          │
└────────────────────────────────────────────────────────────┘
```

Filters:

- Severity
- Artifact type
- Status
- Date
- Reviewer

---

# 22. Artifact Workspace

## Page: `/artifacts/[artifactId]`

Every generated artifact should have a common workspace.

```text
┌──────────────────────────────────────────────────────────────┐
│ Advisory #12                         VERIFIED ✓              │
│ CCO v2 • Recipe v1.2 • TR-001                                │
├───────────────────────────────┬──────────────────────────────┤
│ Preview                       │ Metadata                     │
│                               │                              │
│ Generated artifact            │ Status: Verified             │
│                               │ CCO: v2                     │
│                               │ Template: Advisory v1.2     │
│                               │ Verification: Passed         │
│                               │                              │
│                               │ [Download]                   │
│                               │ [Submit for Review]           │
│                               │ [Finalize]                    │
└───────────────────────────────┴──────────────────────────────┘
```

---

# 23. Artifact Types and Frontend Rendering

The AI backend returns **structured content**.

The artifact/output engineer owns actual renderers.

The frontend integrates with those rendered artifacts.

## 23.1 Executive Summary

Possible outputs:

```text
DOCX
PDF
HTML preview
```

Frontend should provide:

- Structured preview where possible
- PDF/document preview
- Download
- Version history

---

## 23.2 Advisory

Possible outputs:

```text
DOCX
PDF
HTML preview
```

UI should emphasize:

- Severity
- Affected entities
- Indicators
- Impact
- Actions
- References
- Verification status

---

## 23.3 Presentation

Backend/P4 produces:

```text
PPTX
HTML slide preview
```

Frontend should show:

```text
┌──────────────┬─────────────────────────────────────┐
│ Slide 1      │                                     │
│ Slide 2      │       Current Slide Preview        │
│ Slide 3      │                                     │
│ Slide 4      │                                     │
│ ...          │                                     │
└──────────────┴─────────────────────────────────────┘

[Download PPTX]
```

Important:

The frontend does **not** generate the PPTX.

P4 owns the PPTX renderer.

Frontend consumes:

```text
artifact.preview_url
artifact.download_url
```

or equivalent API endpoints.

---

# 24. Infographic Integration

The AI layer produces structured infographic content.

P4 renders it into:

```text
HTML
SVG
PDF
```

Frontend should show:

```text
┌──────────────────────────────────────────────┐
│              INFOGRAPHIC PREVIEW             │
│                                              │
│          Headline                            │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Fact 1   │ │ Fact 2   │ │ Fact 3   │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                              │
└──────────────────────────────────────────────┘

[Open Full Preview] [Download PDF]
```

Do not duplicate the infographic-generation logic in React.

---

# 25. Video Package Integration

The SIH requirement does not require an MP4.

The AI output is a video content package:

```text
Scene
Duration
Visual recommendation
Narration
Subtitles
```

Frontend can present it as a storyboard:

```text
Scene 01
────────────────────────
Duration: 00:00–00:08

Visual:
Incident map

Narration:
"..."

Subtitle:
"..."

Scene 02
────────────────────────
...
```

Optional future renderer:

```text
Generate MP4
```

but this is not MVP-critical.

---

# 26. Social Media Output

For LinkedIn/X:

```text
┌────────────────────────────────────────────┐
│ LinkedIn Post                              │
│                                            │
│ [generated content]                        │
│                                            │
│ 1,240 characters                           │
│                                            │
│ [Copy] [Edit] [Approve]                    │
└────────────────────────────────────────────┘
```

For X:

Show platform-specific structure:

```text
Post 1/4
Post 2/4
Post 3/4
Post 4/4
```

---

# 27. Artifact Versioning

Artifact page should expose:

```text
Version 1 — Generated
Version 2 — Revised
Version 3 — Approved
```

Each version should show:

```text
Created at
Created by/system
CCO version
Transformation request
Verification result
Content hash
Status
```

Never silently replace the previous finalized version.

---

# 28. Review Actions

Reviewer sees:

```text
[ APPROVE ]

[ REJECT ]

[ REQUEST REVISION ]
```

Request revision should allow:

```text
Reason:
[________________________________________]

[Submit Revision Request]
```

API:

```http
POST /artifacts/{id}/finalize
POST /artifacts/{id}/revise
```

For approval/rejection, backend should record the actor and action in audit logs.

---

# 29. Provenance UI

## Tab: Provenance

Show:

```text
Source
  ↓
CCO v2
  ↓
Transformation TR-001
  ↓
Artifact v3
  ↓
Verification
  ↓
Hash
  ↓
Permissioned Ledger
```

Example:

```text
Artifact Hash
sha256: 8a91...

Ledger Status:
ANCHORED ✓

CCO:
v2

Transformation:
TR-001

Verification:
PASSED

[Verify Integrity]
```

Frontend calls:

```http
GET /provenance/{artifact_id}
POST /provenance/{artifact_id}/anchor
```

The frontend should not implement blockchain logic.

---

# 30. Admin Dashboard

Admin-only.

## Page: `/admin`

Show:

```text
Users: 18
Active Sessions: 9
Artifacts: 231
Review Queue: 7
Security Events: 3
```

System status can include:

```text
API             Healthy
AI Service      Healthy
Database        Healthy
Object Storage  Healthy
Vector Store    Healthy
Ledger          Healthy
```

These should come from backend health/status APIs where available.

---

# 31. User Management

## Page: `/admin/users`

Table:

```text
Name       Username      Role       Status       Actions
----------------------------------------------------------
A. Kumar   akumar        Analyst    Active       Edit
R. Singh   rsingh        Reviewer   Active       Edit
Admin      admin         Admin      Active       Edit
```

Actions:

- Create user
- Disable user
- Change role
- Reset access where supported

API examples:

```http
GET   /admin/users
POST  /admin/users
PATCH /admin/users/{id}
```

---

# 32. Audit Logs

## Page: `/admin/audit-logs`

Display:

```text
Timestamp
Actor
Role
Event
Resource
Result
Request ID
```

Example:

```text
10:42:11
USR-001
Analyst
ARTIFACT_CREATED
ART-021
SUCCESS
REQ-9281
```

Filters:

- Actor
- Role
- Event
- Resource
- Date
- Result

---

# 33. Security Events

## Page: `/admin/security-events`

Show:

```text
Time
Event
Severity
Actor
Resource
Status
```

Examples:

```text
Prompt Injection Detected
Malicious File Rejected
Unauthorized Access Attempt
Hash Mismatch
Invalid Token
Rate Limit Exceeded
```

This is especially important for the SIH cybersecurity theme.

---

# 34. Required API Integration Map

The frontend engineer should integrate approximately these APIs.

## Authentication

```http
POST /auth/login
GET  /auth/me
```

## Sessions

```http
POST  /sessions
GET   /sessions
GET   /sessions/{id}
PATCH /sessions/{id}
```

## Documents

```http
POST /sessions/{id}/documents
GET  /documents/{id}
GET  /documents/{id}/versions
GET  /documents/{id}/cco
GET  /documents/{id}/evidence
```

## Transformations

```http
POST /transformations
GET  /transformations/{id}
GET  /transformations/{id}/status
```

## Artifacts

```http
GET  /artifacts/{id}
GET  /artifacts/{id}/versions
GET  /artifacts/{id}/download
GET  /artifacts/{id}/verification
POST /artifacts/{id}/verify
POST /artifacts/{id}/revise
POST /artifacts/{id}/finalize
```

## Review

```http
GET /review
```

This can be implemented as a backend query over artifacts requiring review.

## Admin

```http
GET   /admin/users
POST  /admin/users
PATCH /admin/users/{id}

GET /admin/audit-logs
GET /admin/security-events
```

## Provenance

```http
GET  /provenance/{artifact_id}
POST /provenance/{artifact_id}/anchor
```

---

# 35. Important API Response Contracts

The frontend engineer should request stable response schemas from P3/P1.

### Session

```json
{
  "session_id": "SESSION-001",
  "name": "Incident Report",
  "status": "ready",
  "cco_version": 2,
  "document_count": 1,
  "artifact_count": 3
}
```

### Artifact

```json
{
  "artifact_id": "ART-001",
  "type": "presentation",
  "status": "verified",
  "cco_version": 2,
  "template_version": "presentation-v1",
  "structured_content": {},
  "preview_url": "/...",
  "download_url": "/...",
  "verification_id": "VER-001"
}
```

### Verification

```json
{
  "status": "review_required",
  "grounding_score": 0.94,
  "unsupported_claims": [
    {
      "claim": "Example claim",
      "reason": "No supporting evidence",
      "severity": "high"
    }
  ]
}
```

---

# 36. Frontend State Model

Do not keep the entire application state in React Context.

Recommended split:

### Server state

Use TanStack Query for:

- Sessions
- Documents
- CCO
- Evidence
- Transformations
- Artifacts
- Verification
- Admin data

### Local UI state

React state for:

- Open modal
- Selected tab
- Selected slide
- Upload drag state
- Form inputs
- Preview zoom
- Filters

### Authentication

Use the chosen secure auth/session mechanism and fetch `/auth/me` as the source of current identity/role.

---

# 37. Loading, Empty and Error States

Every API-backed screen must support:

### Loading

```text
Loading sessions...
```

### Empty

```text
No transformation sessions yet.

[Create New Session]
```

### Error

```text
Unable to load this session.

[Retry]
```

### Permission denied

```text
You do not have permission to access this resource.
```

### Not found

```text
Session not found.
```

### Processing

```text
This source is still being processed.
```

Do not leave blank screens.

---

# 38. Notifications

Use a global notification/toast system for:

- Upload successful
- Upload failed
- Transformation started
- Transformation failed
- Artifact ready
- Verification requires review
- Artifact approved
- Artifact rejected
- Security event affecting the current operation

For long-running transformations, the frontend should use polling or WebSocket/SSE if the backend provides it.

Do not create a second independent progress engine in the frontend.

---

# 39. Responsive Design

Primary target:

```text
Desktop / laptop
```

This is an internal operator dashboard.

Still ensure:

- Tablet-friendly layout
- No horizontal overflow on normal laptop sizes
- Tables can scroll horizontally when unavoidable
- Source viewer and artifact preview adapt to available width

Mobile is not the primary target.

---

# 40. Design Language

The UI should feel like an **internal intelligence/cybersecurity operations platform**, not a consumer AI chatbot.

Recommended visual principles:

- Clean dashboard
- Dense but readable information
- Clear status badges
- Strong hierarchy
- Minimal decorative graphics
- Evidence-first presentation
- Clear verification states
- Consistent cards/tables
- Professional typography

Important statuses should have both:

- Text
- Visual indicator

Example:

```text
✓ VERIFIED
⚠ REVIEW REQUIRED
✕ FAILED
● PROCESSING
```

Do not rely on color alone.

---

# 41. Component Inventory

Reusable components should include:

```text
AppShell
Sidebar
Topbar
RoleGuard
PermissionGate

SessionCard
SessionTable
StatusBadge

FileUploader
UploadItem
ProcessingStepper

SourceViewer
EvidenceCard
EvidenceDrawer

CCOViewer
CCOSection
ClaimCard
EntityCard
ConflictCard

TransformationPlanner
OutputTypeCard
ParameterForm
TemplateSelector

GenerationProgress
TransformationStatus

VerificationPanel
ClaimVerificationRow
EvidenceLink

ArtifactCard
ArtifactViewer
ArtifactVersionList
DownloadButton

PresentationViewer
SlideNavigator

InfographicPreview
VideoStoryboard
SocialPostPreview

ReviewQueue
ReviewPanel
ApprovalControls

ProvenanceTimeline
HashCard

AdminDashboard
UserTable
AuditLogTable
SecurityEventTable

ConfirmDialog
ErrorState
EmptyState
LoadingState
Toast
```

---

# 42. Suggested Frontend Project Structure

```text
frontend/
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── sessions/
│   │   ├── new/
│   │   └── [sessionId]/
│   ├── transformations/
│   │   └── [transformationId]/
│   ├── artifacts/
│   │   └── [artifactId]/
│   ├── review/
│   └── admin/
│       ├── users/
│       ├── audit-logs/
│       ├── security-events/
│       └── settings/
│
├── components/
│   ├── layout/
│   ├── auth/
│   ├── sessions/
│   ├── upload/
│   ├── source/
│   ├── cco/
│   ├── evidence/
│   ├── transformations/
│   ├── artifacts/
│   ├── verification/
│   ├── review/
│   ├── provenance/
│   └── admin/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── permissions/
│   ├── validation/
│   └── utils/
│
├── types/
│   ├── auth.ts
│   ├── session.ts
│   ├── document.ts
│   ├── cco.ts
│   ├── transformation.ts
│   ├── artifact.ts
│   ├── verification.ts
│   └── admin.ts
│
└── hooks/
    ├── useSession.ts
    ├── useDocument.ts
    ├── useTransformation.ts
    ├── useArtifact.ts
    └── useCurrentUser.ts
```

---

# 43. Frontend ↔ Backend Ownership Boundary

The frontend engineer owns:

```text
UI
Forms
Routing
Presentation
Client-side validation
API integration
Status visualization
Artifact preview
Role-based UI
```

P3 backend owns:

```text
FastAPI
Database
Business rules
Authentication
Authorization
Session state
API contracts
Audit persistence
```

P1 AI owns:

```text
Understanding
CCO
RAG
Transformation planning
Generation
Verification
Structured AI output
```

P4 owns:

```text
Transformation Recipes
PPTX renderer
DOCX/PDF renderer
Infographic renderer
HTML/SVG
Artifact generation
```

P5 owns:

```text
Deployment
Security infrastructure
Secrets
Object storage infrastructure
Blockchain
Monitoring
```

---

# 44. Critical Integration Rule

The AI engineer should return **structured, renderer-neutral JSON**.

For example:

```json
{
  "artifact_type": "presentation",
  "title": "Incident Briefing",
  "slides": [
    {
      "title": "Incident Overview",
      "body": ["..."],
      "evidence_refs": ["chunk_021"],
      "speaker_notes": "..."
    }
  ]
}
```

P4 converts this into PPTX.

The frontend displays the resulting artifact/preview.

Therefore:

```text
AI
 ↓
Structured JSON
 ↓
P4 Renderer
 ↓
PPTX / PDF / HTML / SVG
 ↓
Frontend Preview + Download
```

The frontend should **not** duplicate renderer logic.

---

# 45. MVP Frontend Priority

## P0 — Must work for demo

1. Login
2. Dashboard
3. Create session
4. Upload PDF/DOCX/TXT
5. Processing status
6. Session workspace
7. CCO viewer
8. Evidence viewer
9. Transformation Planner
10. Generate multiple outputs
11. Generation status
12. Verification UI
13. Artifact workspace
14. PPTX preview/download
15. Executive Summary preview/download
16. Advisory preview/download
17. RBAC UI
18. Reviewer approval/rejection
19. Provenance view

## P1 — Strong additions

- Infographic preview
- Video storyboard
- Social preview
- Artifact version comparison
- Better evidence highlighting
- Admin dashboard
- Audit log viewer
- Security events viewer

## P2 — Optional

- Real-time WebSocket progress
- Advanced analytics
- Voice controls
- MP4 generation
- Advanced document editing

---

# 46. Suggested Demo Flow for Frontend

The frontend should be designed around this exact judge-facing flow:

```text
LOGIN
 ↓
Dashboard
 ↓
Create Session
 ↓
Upload Mock Incident Report
 ↓
Show processing
 ↓
Open CCO
 ↓
Show structured facts/claims
 ↓
Show evidence
 ↓
Select:
  ✓ Executive Summary
  ✓ Advisory
  ✓ Presentation
 ↓
Set audience/tone/detail
 ↓
Generate
 ↓
Show three outputs being created
 ↓
Verification
 ↓
Show:
  ✓ supported claim
  ⚠ flagged claim
 ↓
Reviewer approves
 ↓
Open artifact workspace
 ↓
Show PPT slide preview
 ↓
Download PPTX
 ↓
Open Provenance
 ↓
Show CCO → Transformation → Verification → Hash → Ledger
```

This is the primary frontend story.

---

# 47. Frontend Definition of Done

The frontend is complete when:

- [ ] Login works
- [ ] Current user/role is loaded
- [ ] Role-specific navigation works
- [ ] Unauthorized UI actions are hidden/disabled appropriately
- [ ] Backend authorization is respected
- [ ] Session creation works
- [ ] File upload works
- [ ] Upload/processing states are visible
- [ ] Source viewer works
- [ ] CCO viewer works
- [ ] Evidence viewer works
- [ ] Transformation Planner works
- [ ] All six generation parameters can be submitted
- [ ] Multiple output types can be selected
- [ ] Transformation status is displayed
- [ ] Verification results are displayed
- [ ] Flagged claims are understandable
- [ ] Reviewer actions work
- [ ] Artifact preview works
- [ ] PPTX integration works
- [ ] Advisory/document integration works
- [ ] Infographic integration has a defined preview/download path
- [ ] Video package has a storyboard view
- [ ] Social output has a platform-specific preview
- [ ] Artifact versions are visible
- [ ] Provenance is visible
- [ ] Admin pages are role-restricted
- [ ] Audit logs are visible to Admin
- [ ] Security events are visible to Admin
- [ ] Loading states exist
- [ ] Empty states exist
- [ ] Error states exist
- [ ] API failures do not produce blank screens
- [ ] No AI/business logic is duplicated in the frontend

---

# 48. Final Frontend Principle

The frontend should make the ContentForge architecture visible to the user:

```text
SOURCE
  ↓
UNDERSTAND
  ↓
CCO + EVIDENCE
  ↓
TRANSFORM
  ↓
VERIFY
  ↓
REVIEW
  ↓
ARTIFACT
  ↓
PROVENANCE
```

The key UX differentiator is not a chat box.

It is the ability to show:

> **One source → one persistent source representation → multiple outputs → evidence-backed verification → controlled approval → traceable artifact provenance.**

That is the frontend experience the SIH judges should see.
