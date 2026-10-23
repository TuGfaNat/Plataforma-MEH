from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Literal, Any
from datetime import datetime


class CleanupParentRef(BaseModel):
    tabla: str
    id: Optional[int] = None
    etiqueta: str


class CleanupRowItem(BaseModel):
    id: int
    tabla: str
    titulo: str
    subtitulo: Optional[str] = ""
    id_estado: int = 2
    creado_por_id: Optional[int] = None
    creado_por_nombre: Optional[str] = None
    fecha_creacion: Optional[str] = None
    fecha_modificacion: Optional[str] = None
    padre: Optional[CleanupParentRef] = None
    origen: Literal["SEED", "REAL", "OCR"] = "REAL"
    origen_detalle: Optional[str] = None
    protegido: bool = False
    motivo_proteccion: Optional[str] = None


class CleanupTableDependencyInfo(BaseModel):
    child_table: str
    child_label: str
    fk_column: str
    nullable: bool = False
    description: str


class CleanupTableCatalogItem(BaseModel):
    key: str
    label: str
    group: str
    description: str
    pk_field: str
    delete_order: int
    supports_soft_delete: bool = True
    supports_hard_delete: bool = True
    active_count: int = 0
    deleted_count: int = 0
    seed_count: int = 0
    real_count: int = 0
    ocr_count: int = 0
    protected_count: int = 0
    dependencies: List[CleanupTableDependencyInfo] = Field(default_factory=list)


class ProtectedUserInfo(BaseModel):
    id_usuario: Optional[int] = None
    correo: str
    nombres: Optional[str] = None
    rol: Optional[str] = None
    motivo: Literal["SUPERADMIN", "USUARIO_ACTUAL", "LISTA_BLANCA"]


class ProtectedConfigResponse(BaseModel):
    superadmin_email: str
    current_user_email: str
    current_user_id: int
    whitelist_emails: List[str] = Field(default_factory=list)
    protected_users: List[ProtectedUserInfo] = Field(default_factory=list)


class WhitelistUpdateRequest(BaseModel):
    emails: List[str] = Field(default_factory=list)


class CleanupPresetItem(BaseModel):
    id: str
    nombre: str
    descripcion: str
    built_in: bool = False
    mode: Literal["soft", "hard"] = "soft"
    include_dependencies: bool = True
    origen_filter: Literal["ALL", "SEED", "REAL", "OCR"] = "ALL"
    tablas: List[str] = Field(default_factory=list)
    selections: Dict[str, List[int]] = Field(default_factory=dict)


class CleanupPresetCreateRequest(BaseModel):
    id: Optional[str] = None
    nombre: str = Field(..., min_length=2, max_length=100)
    descripcion: Optional[str] = ""
    mode: Literal["soft", "hard"] = "soft"
    include_dependencies: bool = True
    origen_filter: Literal["ALL", "SEED", "REAL", "OCR"] = "ALL"
    tablas: List[str] = Field(default_factory=list)
    selections: Dict[str, List[int]] = Field(default_factory=dict)


class CleanupPreviewRequest(BaseModel):
    selections: Dict[str, List[int]] = Field(default_factory=dict)
    mode: Literal["soft", "hard"] = "soft"
    include_dependencies: bool = False


class CleanupDependencyHit(BaseModel):
    parent_table: str
    parent_id: int
    parent_title: str
    child_table: str
    child_label: str
    child_ids: List[int]
    child_count: int
    action: Literal["AUTO_INCLUDED", "BLOCKED", "NULLIFIED", "SOFT_ORPHAN_WARNING"]
    message: str


class CleanupBlockerItem(BaseModel):
    tabla: str
    id: Optional[int] = None
    tipo: Literal["PROTECTED_RECORD", "FK_DEPENDENCY", "EMPTY_SELECTION"]
    mensaje: str
    child_table: Optional[str] = None
    child_ids: List[int] = Field(default_factory=list)


class CleanupPreviewResponse(BaseModel):
    mode: Literal["soft", "hard"]
    include_dependencies: bool
    selection_hash: str
    can_execute: bool
    required_phrase: str
    requires_extra_hard_confirmation: bool
    requested_counts: Dict[str, int]
    effective_selections: Dict[str, List[int]]
    effective_counts: Dict[str, int]
    total_effective_records: int
    origin_summary: Dict[str, int]
    dependencies: List[CleanupDependencyHit] = Field(default_factory=list)
    protected_skipped: List[Dict[str, Any]] = Field(default_factory=list)
    blockers: List[CleanupBlockerItem] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    execution_order: List[str] = Field(default_factory=list)


class CleanupBackupRequest(BaseModel):
    selections: Dict[str, List[int]] = Field(default_factory=dict)
    mode: Literal["soft", "hard"] = "soft"
    include_dependencies: bool = False


class CleanupBackupResponse(BaseModel):
    backup_id: str
    selection_hash: str
    mode: Literal["soft", "hard"]
    created_at: str
    expires_at: str
    ttl_minutes: int
    total_records: int
    counts_by_table: Dict[str, int]
    download_url: str


class CleanupExecuteRequest(BaseModel):
    selections: Dict[str, List[int]] = Field(default_factory=dict)
    mode: Literal["soft", "hard"] = "soft"
    include_dependencies: bool = False
    selection_hash: str
    backup_id: str
    confirmation_phrase: str
    admin_password: str
    motivo: str
    hard_delete_confirmed: bool = False


class CleanupExecuteResponse(BaseModel):
    status: str = "success"
    mode: Literal["soft", "hard"]
    selection_hash: str
    backup_id: str
    motivo: str
    total_affected: int
    affected_by_table: Dict[str, int]
    origin_summary: Dict[str, int]
    audit_log_id: int
    executed_at: str
    restorable_in_trash: bool
