"""add_plantilla_badge_url_to_eventos

Revision ID: d4e5f6a7b8c9
Revises: a1b2c3d4e5f6, c3d4e5f6a7b8
Create Date: 2026-10-18 15:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = ('a1b2c3d4e5f6', 'c3d4e5f6a7b8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: agregar plantilla_badge_url a eventos."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('eventos')]
    if 'plantilla_badge_url' not in columns:
        op.add_column('eventos', sa.Column('plantilla_badge_url', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema: remover campo plantilla_badge_url."""
    op.drop_column('eventos', 'plantilla_badge_url')
