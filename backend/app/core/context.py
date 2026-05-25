import contextvars
from typing import Optional

# Variable de contexto asíncrona para guardar el ID del usuario de la sesión actual
current_user_id: contextvars.ContextVar[Optional[int]] = contextvars.ContextVar("current_user_id", default=None)
