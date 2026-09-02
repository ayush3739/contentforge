"""
Schemas Package — Pydantic Validation & Serialization Models

This package defines request/response contracts for all endpoints:
- auth.py: LoginRequest, TokenResponse, UserResponse
- session.py: SessionCreate, SessionUpdate, SessionResponse
- document.py: DocumentUploadResponse, DocumentVersionResponse
- cco.py: CCOSchema, ClaimSchema, FactSchema, EntitySchema
- transformation.py: TransformationRequestSchema, TransformationResponseSchema
- artifact.py: ArtifactResponse, ArtifactVersionResponse
- verification.py: VerificationResultSchema, ClaimVerificationSchema
- audit.py: AuditLogResponse, SecurityEventResponse
"""
