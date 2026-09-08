"""add_anuncio_targeting_and_category_fields

Revision ID: f7a1b9c8d3e2
Revises: e8f1c2d3b4a5
Create Date: 2026-09-07 22:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f7a1b9c8d3e2'
down_revision: Union[str, Sequence[str], None] = 'e8f1c2d3b4a5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: agregar campos de segmentación, categorías y eventos a la tabla anuncios."""
    op.add_column('anuncios', sa.Column('roles_destino', sa.String(255), server_default='TODOS', nullable=True))
    op.add_column('anuncios', sa.Column('categoria', sa.String(50), server_default='GENERAL', nullable=True))
    op.add_column('anuncios', sa.Column('id_evento', sa.Integer(), sa.ForeignKey('eventos.id_evento', ondelete='SET NULL'), nullable=True))
    op.add_column('anuncios', sa.Column('solo_inscritos_evento', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    """Downgrade schema: remover campos de segmentación en anuncios."""
    op.drop_column('anuncios', 'solo_inscritos_evento')
    op.drop_column('anuncios', 'id_evento')
    op.drop_column('anuncios', 'categoria')
    op.drop_column('anuncios', 'roles_destino')
