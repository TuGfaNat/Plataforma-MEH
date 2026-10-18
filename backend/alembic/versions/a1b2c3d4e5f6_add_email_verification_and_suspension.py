"""add_email_verification_and_suspension

Revision ID: a1b2c3d4e5f6
Revises: f7a1b9c8d3e2
Create Date: 2026-10-15 08:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'f7a1b9c8d3e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: agregar email_verificado, codigo_verificacion, codigo_verificacion_exp y motivo_suspension."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('usuarios')]
    if 'email_verificado' not in columns:
        op.add_column('usuarios', sa.Column('email_verificado', sa.Boolean(), server_default='true', nullable=False))
        op.alter_column('usuarios', 'email_verificado', server_default=None)
    if 'codigo_verificacion' not in columns:
        op.add_column('usuarios', sa.Column('codigo_verificacion', sa.String(), nullable=True))
    if 'codigo_verificacion_exp' not in columns:
        op.add_column('usuarios', sa.Column('codigo_verificacion_exp', sa.DateTime(), nullable=True))
    if 'motivo_suspension' not in columns:
        op.add_column('usuarios', sa.Column('motivo_suspension', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema: remover campos de verificacion de email y suspension."""
    op.drop_column('usuarios', 'motivo_suspension')
    op.drop_column('usuarios', 'codigo_verificacion_exp')
    op.drop_column('usuarios', 'codigo_verificacion')
    op.drop_column('usuarios', 'email_verificado')
