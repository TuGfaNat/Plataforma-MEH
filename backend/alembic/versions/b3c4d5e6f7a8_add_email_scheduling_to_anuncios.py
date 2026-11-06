"""add_email_scheduling_to_anuncios

Revision ID: b3c4d5e6f7a8
Revises: a2b3c4d5e6f7
Create Date: 2026-11-06 01:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3c4d5e6f7a8'
down_revision: Union[str, Sequence[str], None] = 'a2b3c4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if inspector.has_table('anuncios'):
        columns = [col['name'] for col in inspector.get_columns('anuncios')]
        if 'notificar_email' not in columns:
            op.add_column('anuncios', sa.Column('notificar_email', sa.Boolean(), server_default=sa.text('false'), nullable=False))
        if 'email_enviado' not in columns:
            op.add_column('anuncios', sa.Column('email_enviado', sa.Boolean(), server_default=sa.text('false'), nullable=False))
        if 'fecha_envio_email' not in columns:
            op.add_column('anuncios', sa.Column('fecha_envio_email', sa.DateTime(), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if inspector.has_table('anuncios'):
        columns = [col['name'] for col in inspector.get_columns('anuncios')]
        if 'fecha_envio_email' in columns:
            op.drop_column('anuncios', 'fecha_envio_email')
        if 'email_enviado' in columns:
            op.drop_column('anuncios', 'email_enviado')
        if 'notificar_email' in columns:
            op.drop_column('anuncios', 'notificar_email')
