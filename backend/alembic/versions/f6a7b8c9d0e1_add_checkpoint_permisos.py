"""add_checkpoint_permisos
 
Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-10-19 09:30:00.000000
 
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
 
# revision identifiers, used by Alembic.
revision: str = 'f6a7b8c9d0e1'
down_revision: Union[str, Sequence[str], None] = 'e5f6a7b8c9d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
 
 
def upgrade() -> None:
    """Upgrade schema: agregar tabla checkpoint_permisos."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
 
    if 'checkpoint_permisos' not in tables:
        op.create_table(
            'checkpoint_permisos',
            sa.Column('id_permiso', sa.Integer(), nullable=False),
            sa.Column('id_checkpoint', sa.Integer(), nullable=False),
            sa.Column('id_usuario', sa.Integer(), nullable=False),
            sa.Column('puede_escanear', sa.Boolean(), nullable=False, server_default=sa.text('true')),
            sa.Column('fecha_asignacion', sa.DateTime(), nullable=True),
            sa.Column('asignado_por', sa.Integer(), nullable=True),
            sa.Column('creado_por', sa.Integer(), nullable=True),
            sa.Column('fecha_creacion', sa.DateTime(), nullable=True),
            sa.Column('modificado_por', sa.Integer(), nullable=True),
            sa.Column('fecha_modificacion', sa.DateTime(), nullable=True),
            sa.Column('id_estado', sa.Integer(), nullable=False, server_default=sa.text('2')),
            sa.Column('fecha_modificacion_estado', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['asignado_por'], ['usuarios.id_usuario'], ),
            sa.ForeignKeyConstraint(['creado_por'], ['usuarios.id_usuario'], ),
            sa.ForeignKeyConstraint(['id_checkpoint'], ['checkpoints.id_checkpoint'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['id_estado'], ['estados_registro.id_estado'], ),
            sa.ForeignKeyConstraint(['id_usuario'], ['usuarios.id_usuario'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['modificado_por'], ['usuarios.id_usuario'], ),
            sa.PrimaryKeyConstraint('id_permiso')
        )
        try:
            op.create_index(op.f('ix_checkpoint_permisos_id_permiso'), 'checkpoint_permisos', ['id_permiso'], unique=False)
            op.create_index(op.f('ix_checkpoint_permisos_id_checkpoint'), 'checkpoint_permisos', ['id_checkpoint'], unique=False)
            op.create_index(op.f('ix_checkpoint_permisos_id_usuario'), 'checkpoint_permisos', ['id_usuario'], unique=False)
        except Exception:
            pass
 
 
def downgrade() -> None:
    """Downgrade schema: remover tabla checkpoint_permisos."""
    try:
        op.drop_index(op.f('ix_checkpoint_permisos_id_usuario'), table_name='checkpoint_permisos')
        op.drop_index(op.f('ix_checkpoint_permisos_id_checkpoint'), table_name='checkpoint_permisos')
        op.drop_index(op.f('ix_checkpoint_permisos_id_permiso'), table_name='checkpoint_permisos')
    except Exception:
        pass
    op.drop_table('checkpoint_permisos')
