"""add artifact template lifecycle metadata

Revision ID: 7f8e9d0a1b2c
Revises: 301c7821d862
Create Date: 2026-09-05
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "7f8e9d0a1b2c"
down_revision: Union[str, Sequence[str], None] = "301c7821d862"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("artifacts", sa.Column("template_config", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("artifacts", sa.Column("parent_artifact_id", sa.String(length=36), nullable=True))
    op.add_column("artifacts", sa.Column("render_error", sa.String(length=2000), nullable=True))
    op.create_foreign_key(
        "fk_artifacts_parent_artifact_id", "artifacts", "artifacts", ["parent_artifact_id"], ["id"], ondelete="SET NULL"
    )
    op.create_index("ix_artifacts_parent_artifact_id", "artifacts", ["parent_artifact_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_artifacts_parent_artifact_id", table_name="artifacts")
    op.drop_constraint("fk_artifacts_parent_artifact_id", "artifacts", type_="foreignkey")
    op.drop_column("artifacts", "render_error")
    op.drop_column("artifacts", "parent_artifact_id")
    op.drop_column("artifacts", "template_config")
