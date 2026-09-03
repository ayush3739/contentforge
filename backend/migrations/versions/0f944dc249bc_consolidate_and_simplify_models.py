"""consolidate_and_simplify_models

Revision ID: 0f944dc249bc
Revises: fd0001723855
Create Date: 2026-09-03 14:57:03.814921

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0f944dc249bc'
down_revision: Union[str, Sequence[str], None] = 'fd0001723855'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to simplified, consolidated models."""
    # 1. Drop foreign keys pointing to tables we want to eliminate
    op.execute("ALTER TABLE IF EXISTS cco_versions DROP CONSTRAINT IF EXISTS cco_versions_document_version_id_fkey CASCADE;")
    op.execute("ALTER TABLE IF EXISTS chunks DROP CONSTRAINT IF EXISTS chunks_document_version_id_fkey CASCADE;")
    op.execute("ALTER TABLE IF EXISTS source_blocks DROP CONSTRAINT IF EXISTS source_blocks_document_version_id_fkey CASCADE;")
    op.execute("ALTER TABLE IF EXISTS artifact_versions DROP CONSTRAINT IF EXISTS artifact_versions_artifact_id_fkey CASCADE;")
    op.execute("ALTER TABLE IF EXISTS user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey CASCADE;")
    op.execute("ALTER TABLE IF EXISTS user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey CASCADE;")

    # 2. Drop obsolete tables
    op.execute("DROP TABLE IF EXISTS artifact_versions CASCADE;")
    op.execute("DROP TABLE IF EXISTS user_roles CASCADE;")
    op.execute("DROP TABLE IF EXISTS roles CASCADE;")
    op.execute("DROP TABLE IF EXISTS document_versions CASCADE;")

    # 3. Add role directly to users
    op.add_column('users', sa.Column('role', sa.String(length=50), nullable=False, server_default='analyst'))

    # 4. Enhance documents table with version, checksum, storage_key, status
    op.add_column('documents', sa.Column('version', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('documents', sa.Column('checksum', sa.String(length=64), nullable=True))
    op.add_column('documents', sa.Column('storage_key', sa.String(length=512), nullable=True))
    op.add_column('documents', sa.Column('status', sa.String(length=50), nullable=False, server_default='ready'))
    op.alter_column('documents', 'session_id', existing_type=sa.VARCHAR(length=36), nullable=True)

    # 5. Enhance artifacts with version and revision_history
    op.add_column('artifacts', sa.Column('version', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('artifacts', sa.Column('revision_history', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='[]'))

    # 6. Repoint cco_versions, chunks, source_blocks directly to documents.id
    # CCO Versions
    op.execute("ALTER TABLE IF EXISTS cco_versions DROP COLUMN IF EXISTS document_version_id CASCADE;")
    op.add_column('cco_versions', sa.Column('document_id', sa.String(length=36), nullable=False))
    op.create_index(op.f('ix_cco_versions_document_id'), 'cco_versions', ['document_id'], unique=False)
    op.create_foreign_key('cco_versions_document_id_fkey', 'cco_versions', 'documents', ['document_id'], ['id'], ondelete='CASCADE')

    # Chunks
    op.execute("ALTER TABLE IF EXISTS chunks DROP COLUMN IF EXISTS document_version_id CASCADE;")
    op.add_column('chunks', sa.Column('document_id', sa.String(length=36), nullable=False))
    op.create_index(op.f('ix_chunks_document_id'), 'chunks', ['document_id'], unique=False)
    op.create_foreign_key('chunks_document_id_fkey', 'chunks', 'documents', ['document_id'], ['id'], ondelete='CASCADE')

    # Source Blocks
    op.execute("ALTER TABLE IF EXISTS source_blocks DROP COLUMN IF EXISTS document_version_id CASCADE;")
    op.add_column('source_blocks', sa.Column('document_id', sa.String(length=36), nullable=False))
    op.create_index(op.f('ix_source_blocks_document_id'), 'source_blocks', ['document_id'], unique=False)
    op.create_foreign_key('source_blocks_document_id_fkey', 'source_blocks', 'documents', ['document_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    """Downgrade schema."""
    pass
