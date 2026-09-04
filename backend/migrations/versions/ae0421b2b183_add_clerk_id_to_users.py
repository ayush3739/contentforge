"""add_clerk_id_to_users

Revision ID: ae0421b2b183
Revises: 0f944dc249bc
Create Date: 2026-09-04 17:39:18.667096

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ae0421b2b183'
down_revision: Union[str, Sequence[str], None] = '0f944dc249bc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to add clerk_id to users table."""
    op.add_column('users', sa.Column('clerk_id', sa.String(length=255), nullable=True))
    op.create_index(op.f('ix_users_clerk_id'), 'users', ['clerk_id'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_users_clerk_id'), table_name='users')
    op.drop_column('users', 'clerk_id')
