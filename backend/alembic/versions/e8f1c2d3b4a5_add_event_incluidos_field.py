"""add_event_incluidos_field

Revision ID: e8f1c2d3b4a5
Revises: d2f530fc2803
Create Date: 2026-09-06 22:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e8f1c2d3b4a5'
down_revision: Union[str, Sequence[str], None] = 'd2f530fc2803'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: agregar campo incluidos dinámicos a eventos."""
    op.add_column('eventos', sa.Column('incluidos', sa.TEXT(), nullable=True))


def downgrade() -> None:
    """Downgrade schema: remover campo incluidos."""
    op.drop_column('eventos', 'incluidos')
