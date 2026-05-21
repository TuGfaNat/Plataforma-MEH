"""add_link_mapas_and_agenda_to_eventos

Revision ID: e4c9a71b3d2d
Revises: 8fdf69b6f875
Create Date: 2026-05-20 20:38:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e4c9a71b3d2d'
down_revision: Union[str, Sequence[str], None] = '8fdf69b6f875'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('eventos', sa.Column('link_mapas', sa.String(), nullable=True))
    op.add_column('eventos', sa.Column('agenda', sa.TEXT(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('eventos', 'agenda')
    op.drop_column('eventos', 'link_mapas')