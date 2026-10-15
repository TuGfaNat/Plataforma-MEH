"""add motivo_cancelacion to eventos

Revision ID: c3d4e5f6a7b8
Revises: f7a1b9c8d3e2
Create Date: 2026-10-15 09:35:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c3d4e5f6a7b8'
down_revision = 'f7a1b9c8d3e2'
branch_labels = None
depends_on = None


def upgrade():
    # Añadir columna motivo_cancelacion a la tabla eventos
    op.add_column('eventos', sa.Column('motivo_cancelacion', sa.TEXT(), nullable=True))


def downgrade():
    op.drop_column('eventos', 'motivo_cancelacion')
