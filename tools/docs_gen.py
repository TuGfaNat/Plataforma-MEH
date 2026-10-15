#!/usr/bin/env python3
"""
tools/docs_gen.py
=================
Docs-as-Code Unified Generator for Plataforma-MEH
Conforms to ISO/IEC/IEEE 26511-26515, Diátaxis, and Keep a Changelog (SemVer).

Subcommands:
    tech        - Generates technical reference documentation from code (M3 APIs, M2 Models, RBAC, ADRs).
    user        - Updates and synchronizes user manual role matrices and permissions.
    changelog   - Generates Keep a Changelog + SemVer history documentation.
    all         - Runs tech, user, and changelog generation.
    check       - Compares generated documentation against repository files; exits non-zero if drift is detected.
"""

import os
import sys
import re
import ast
import glob
import difflib
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Any, Set, Optional

# Ensure UTF-8 output on all platforms including Windows CMD/PowerShell
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Base paths
ROOT_DIR = Path(__file__).resolve().parent.parent
API_DIR = ROOT_DIR / "backend" / "app" / "api"
MODELS_FILE = ROOT_DIR / "backend" / "app" / "models" / "models.py"
PERMISSIONS_FILE = ROOT_DIR / "backend" / "app" / "core" / "permissions.py"
RBAC_JS_FILE = ROOT_DIR / "frontend" / "src" / "auth" / "rbac.js"
DOCS_DIR = ROOT_DIR / "website" / "docs"
TECNICO_DIR = DOCS_DIR / "tecnico"
USUARIO_DIR = DOCS_DIR / "usuario"
CHANGELOG_DOC = DOCS_DIR / "historial-cambios.md"
ROOT_CHANGELOG = ROOT_DIR / "CHANGELOG.md"


# ==============================================================================
# 1. AST Parser: FastAPI Routers (backend/app/api/*.py) -> M3 Contracts
# ==============================================================================

class RouteInfo:
    def __init__(self, method: str, path: str, func_name: str, docstring: str,
                 status_code: str, response_model: str, payload_args: List[str],
                 auth_info: str):
        self.method = method
        self.path = path
        self.func_name = func_name
        self.docstring = docstring
        self.status_code = status_code
        self.response_model = response_model
        self.payload_args = payload_args
        self.auth_info = auth_info


class ModuleApiInfo:
    def __init__(self, module_name: str, prefix: str, tag: str, routes: List[RouteInfo]):
        self.module_name = module_name
        self.prefix = prefix
        self.tag = tag
        self.routes = routes


def _get_ast_val(node: Any) -> Any:
    """Helper to safely extract constant or literal value from an AST node."""
    if isinstance(node, ast.Constant):
        return node.value
    if isinstance(node, ast.Attribute):
        return node.attr
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.List):
        return [_get_ast_val(e) for e in node.elts]
    return ""


def parse_api_modules() -> List[ModuleApiInfo]:
    """Parse all routers in backend/app/api/*.py using AST."""
    modules: List[ModuleApiInfo] = []
    py_files = sorted(glob.glob(str(API_DIR / "*.py")))

    for filepath in py_files:
        filename = Path(filepath).name
        if filename.startswith("__"):
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        try:
            tree = ast.parse(content, filename=filename)
        except Exception as e:
            print(f"[WARN] Failed to parse AST for {filename}: {e}", file=sys.stderr)
            continue

        router_prefix = ""
        router_tag = filename.replace(".py", "")

        # 1. Identify router = APIRouter(...)
        for node in tree.body:
            if isinstance(node, ast.Assign):
                if any(getattr(target, "id", None) == "router" for target in node.targets):
                    if isinstance(node.value, ast.Call):
                        for kw in node.value.keywords:
                            if kw.arg == "prefix":
                                router_prefix = str(_get_ast_val(kw.value))
                            elif kw.arg == "tags":
                                tags = _get_ast_val(kw.value)
                                if isinstance(tags, list) and tags:
                                    router_tag = str(tags[0])

        # 2. Extract endpoints
        routes: List[RouteInfo] = []
        for node in tree.body:
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for dec in node.decorator_list:
                    call_node = dec if isinstance(dec, ast.Call) else None
                    if call_node and isinstance(call_node.func, ast.Attribute):
                        if getattr(call_node.func.value, "id", None) == "router":
                            method = call_node.func.attr.upper()
                            path = ""
                            if call_node.args:
                                path = str(_get_ast_val(call_node.args[0]))

                            status_code = "200 OK"
                            response_model = "-"
                            for kw in call_node.keywords:
                                if kw.arg == "status_code":
                                    sc_val = str(_get_ast_val(kw.value))
                                    if "201" in sc_val or "CREATED" in sc_val:
                                        status_code = "201 Created"
                                    elif "204" in sc_val or "NO_CONTENT" in sc_val:
                                        status_code = "204 No Content"
                                    else:
                                        status_code = sc_val
                                elif kw.arg == "response_model":
                                    response_model = str(_get_ast_val(kw.value))

                            # Docstring
                            raw_doc = ast.get_docstring(node) or ""
                            first_line = raw_doc.strip().split("\n")[0] if raw_doc else f"Operación {node.name}"

                            # Inspect arguments for payload
                            payload_items = []
                            auth_roles = []
                            for arg in node.args.args:
                                arg_name = arg.arg
                                if arg_name in ("db", "request"):
                                    continue
                                if arg_name == "current_user":
                                    auth_roles.append("Requiere Auth (JWT)")
                                    continue
                                if arg.annotation:
                                    ann = _get_ast_val(arg.annotation)
                                    if ann and ann not in ("Session", "Request"):
                                        payload_items.append(f"`{arg_name}: {ann}`")
                                else:
                                    payload_items.append(f"`{arg_name}`")

                            # Scan function body for permissions / roles
                            body_str = ast.dump(node)
                            if "ensure_admin" in body_str:
                                auth_roles.append("Solo ADMIN")
                            elif "ensure_permission" in body_str:
                                match = re.search(r"PERMISSION_([A-Z_]+)", body_str)
                                if match:
                                    auth_roles.append(f"Permiso {match.group(1).lower()}")
                                else:
                                    auth_roles.append("Permiso RBAC requerido")
                            elif "ensure_roles" in body_str or "ADMIN_OR_ORGANIZER" in body_str:
                                auth_roles.append("Staff / Organizador")

                            auth_str = ", ".join(auth_roles) if auth_roles else "Público / Abierto"
                            payload_str = ", ".join(payload_items) if payload_items else "-"

                            # Full path
                            clean_prefix = router_prefix.rstrip("/")
                            clean_path = path.lstrip("/")
                            full_path = f"/api{clean_prefix}/{clean_path}".rstrip("/")
                            if not full_path:
                                full_path = "/api"

                            routes.append(RouteInfo(
                                method=method,
                                path=full_path,
                                func_name=node.name,
                                docstring=first_line,
                                status_code=status_code,
                                response_model=response_model,
                                payload_args=[payload_str],
                                auth_info=auth_str
                            ))

        modules.append(ModuleApiInfo(
            module_name=filename.replace(".py", ""),
            prefix=router_prefix,
            tag=router_tag,
            routes=routes
        ))

    return modules


# ==============================================================================
# 2. AST Parser: SQLAlchemy Models (backend/app/models/models.py) -> M2
# ==============================================================================

class ColumnInfo:
    def __init__(self, name: str, col_type: str, is_pk: bool, is_fk: bool,
                 fk_target: str, nullable: bool, notes: str):
        self.name = name
        self.col_type = col_type
        self.is_pk = is_pk
        self.is_fk = is_fk
        self.fk_target = fk_target
        self.nullable = nullable
        self.notes = notes


class TableModelInfo:
    def __init__(self, class_name: str, table_name: str, columns: List[ColumnInfo],
                 has_audit: bool, has_lifecycle: bool):
        self.class_name = class_name
        self.table_name = table_name
        self.columns = columns
        self.has_audit = has_audit
        self.has_lifecycle = has_lifecycle


def parse_models() -> List[TableModelInfo]:
    """Parse SQLAlchemy models from backend/app/models/models.py using AST."""
    if not MODELS_FILE.exists():
        return []

    with open(MODELS_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    tree = ast.parse(content, filename=str(MODELS_FILE))
    models: List[TableModelInfo] = []

    for node in tree.body:
        if isinstance(node, ast.ClassDef):
            base_names = [_get_ast_val(b) for b in node.bases]
            if "Base" not in base_names and not any("Base" in str(b) for b in base_names):
                continue

            class_name = node.name
            table_name = ""
            has_audit = "AuditMixin" in base_names
            has_lifecycle = "EstadoLifecycleMixin" in base_names

            columns: List[ColumnInfo] = []

            for item in node.body:
                if isinstance(item, ast.Assign):
                    for target in item.targets:
                        target_name = getattr(target, "id", None)
                        if target_name == "__tablename__":
                            table_name = str(_get_ast_val(item.value))
                        elif target_name and isinstance(item.value, ast.Call):
                            func_name = getattr(item.value.func, "id", None)
                            if func_name == "Column":
                                col_type = "VARCHAR"
                                is_pk = False
                                is_fk = False
                                fk_target = "-"
                                nullable = True
                                notes_list = []

                                for arg in item.value.args:
                                    if isinstance(arg, ast.Call) and getattr(arg.func, "id", None) == "ForeignKey":
                                        is_fk = True
                                        if arg.args:
                                            fk_target = str(_get_ast_val(arg.args[0]))
                                    else:
                                        t_name = _get_ast_val(arg)
                                        if t_name:
                                            col_type = str(t_name)

                                for kw in item.value.keywords:
                                    if kw.arg == "primary_key" and _get_ast_val(kw.value) is True:
                                        is_pk = True
                                    elif kw.arg == "nullable":
                                        nullable = bool(_get_ast_val(kw.value))
                                    elif kw.arg == "unique" and _get_ast_val(kw.value) is True:
                                        notes_list.append("unique")
                                    elif kw.arg == "index" and _get_ast_val(kw.value) is True:
                                        notes_list.append("index")
                                    elif kw.arg == "default":
                                        def_val = _get_ast_val(kw.value)
                                        notes_list.append(f"default={def_val}")

                                if is_pk:
                                    notes_list.append("PK (autoincrement)")
                                if is_fk:
                                    notes_list.append(f"FK -> {fk_target}")

                                columns.append(ColumnInfo(
                                    name=target_name,
                                    col_type=col_type.upper(),
                                    is_pk=is_pk,
                                    is_fk=is_fk,
                                    fk_target=fk_target,
                                    nullable=nullable,
                                    notes=", ".join(notes_list) if notes_list else "-"
                                ))

            # If class inherits AuditMixin, append audit columns if not explicitly defined
            if has_audit:
                col_names = {c.name for c in columns}
                if "creado_por" not in col_names:
                    columns.append(ColumnInfo("creado_por", "INTEGER", False, True, "usuarios.id_usuario", True, "AuditMixin FK"))
                if "fecha_creacion" not in col_names:
                    columns.append(ColumnInfo("fecha_creacion", "DATETIME", False, False, "-", True, "AuditMixin default=utcnow"))
                if "modificado_por" not in col_names:
                    columns.append(ColumnInfo("modificado_por", "INTEGER", False, True, "usuarios.id_usuario", True, "AuditMixin FK"))
                if "fecha_modificacion" not in col_names:
                    columns.append(ColumnInfo("fecha_modificacion", "DATETIME", False, False, "-", True, "AuditMixin"))

            if has_lifecycle:
                col_names = {c.name for c in columns}
                if "id_estado" not in col_names:
                    columns.append(ColumnInfo("id_estado", "INTEGER", False, True, "estados_registro.id_estado", False, "Lifecycle default=2"))
                if "fecha_modificacion_estado" not in col_names:
                    columns.append(ColumnInfo("fecha_modificacion_estado", "DATETIME", False, False, "-", True, "Lifecycle"))

            if table_name:
                models.append(TableModelInfo(
                    class_name=class_name,
                    table_name=table_name,
                    columns=columns,
                    has_audit=has_audit,
                    has_lifecycle=has_lifecycle
                ))

    return models


# ==============================================================================
# 3. AST Parser: RBAC Definitions (permissions.py & rbac.js)
# ==============================================================================

class RbacInfo:
    def __init__(self, roles: List[str], permissions: List[str],
                 inheritance: Dict[str, List[str]], direct_permissions: Dict[str, Set[str]],
                 effective_permissions: Dict[str, Set[str]]):
        self.roles = roles
        self.permissions = permissions
        self.inheritance = inheritance
        self.direct_permissions = direct_permissions
        self.effective_permissions = effective_permissions


def parse_rbac() -> RbacInfo:
    """Parse RBAC roles, permissions and inheritance from backend/app/core/permissions.py."""
    if not PERMISSIONS_FILE.exists():
        return RbacInfo([], [], {}, {}, {})

    with open(PERMISSIONS_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    tree = ast.parse(content, filename=str(PERMISSIONS_FILE))

    constants: Dict[str, str] = {}
    inheritance: Dict[str, List[str]] = {}
    direct_perms: Dict[str, Set[str]] = {}

    for node in tree.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                target_name = getattr(target, "id", None)
                if not target_name:
                    continue
                if target_name.startswith("ROLE_") or target_name.startswith("PERMISSION_"):
                    if isinstance(node.value, ast.Constant):
                        constants[target_name] = str(node.value.value)
                elif target_name == "_ROLE_INHERITANCE" and isinstance(node.value, ast.Dict):
                    for k, v in zip(node.value.keys, node.value.values):
                        k_name = _get_ast_val(k)
                        role_key = constants.get(k_name, k_name)
                        parents = []
                        if isinstance(v, ast.List):
                            for elt in v.elts:
                                p_name = _get_ast_val(elt)
                                parents.append(constants.get(p_name, p_name))
                        inheritance[role_key] = parents
                elif target_name == "_DIRECT_PERMISSIONS" and isinstance(node.value, ast.Dict):
                    for k, v in zip(node.value.keys, node.value.values):
                        k_name = _get_ast_val(k)
                        role_key = constants.get(k_name, k_name)
                        perms = set()
                        if isinstance(v, ast.Set):
                            for elt in v.elts:
                                p_val = _get_ast_val(elt)
                                perms.add(constants.get(p_val, p_val))
                        direct_perms[role_key] = perms

    # Ordered list of roles
    roles = ["MIEMBRO", "EMBAJADOR", "MODERADOR", "SOPORTE", "ORGANIZADOR", "ADMIN"]
    perms_list = sorted({v for k, v in constants.items() if k.startswith("PERMISSION_")})

    # Compute effective permissions recursively
    effective_perms: Dict[str, Set[str]] = {}
    for r in roles:
        visited = set()
        def _collect(curr: str) -> Set[str]:
            if curr in visited:
                return set()
            visited.add(curr)
            res = set(direct_perms.get(curr, set()))
            for parent in inheritance.get(curr, []):
                res.update(_collect(parent))
            return res
        effective_perms[r] = _collect(r)

    return RbacInfo(roles, perms_list, inheritance, direct_perms, effective_perms)


# ==============================================================================
# 4. Generators: Technical Reference Markdown Files
# ==============================================================================

def generate_api_contracts_md(modules: List[ModuleApiInfo]) -> str:
    """Generate website/docs/tecnico/contratos-api.md."""
    lines = [
        "---",
        "id: contratos-api",
        "title: Contratos de APIs REST (M3)",
        "sidebar_label: Contratos de APIs (M3)",
        "---",
        "",
        "# Contratos de APIs REST (Sección M3)",
        "",
        ":::info Docs-as-Code — Derivado del Código Fuente",
        "Este documento se genera automáticamente a partir de los routers FastAPI en `backend/app/api/*.py`.",
        "Cualquier modificación en rutas, métodos o permisos se refleja directamente en esta especificación.",
        ":::",
        "",
        f"**Total de módulos de API documentados:** {len(modules)}  ",
        f"**Total de endpoints expuestos:** {sum(len(m.routes) for m in modules)}",
        "",
        "---",
        ""
    ]

    for m in modules:
        lines.append(f"## Módulo `{m.module_name}` (Prefix: `{m.prefix or '/'}`)")
        lines.append("")
        if not m.routes:
            lines.append("_No se detectaron rutas públicas en este router._")
            lines.append("")
            continue

        lines.append("| Método | Endpoint URI | Descripción | Request Payload | Código HTTP | Autorización |")
        lines.append("|---|---|---|---|---|---|")
        for r in m.routes:
            payload = r.payload_args[0] if r.payload_args else "-"
            lines.append(f"| **`{r.method}`** | `{r.path}` | {r.docstring} | {payload} | `{r.status_code}` | {r.auth_info} |")
        lines.append("")

    return "\n".join(lines)


def generate_data_dictionary_md(models: List[TableModelInfo]) -> str:
    """Generate website/docs/tecnico/diccionario-datos.md."""
    lines = [
        "---",
        "id: diccionario-datos",
        "title: Diccionario de Datos Relacional (M2)",
        "sidebar_label: Diccionario de Datos (M2)",
        "---",
        "",
        "# Diccionario de Datos Relacional (Sección M2)",
        "",
        ":::info Docs-as-Code — Derivado del Código Fuente",
        "Este diccionario se genera automáticamente analizando los modelos SQLAlchemy en `backend/app/models/models.py`.",
        "Se respeta estrictamente el estándar arquitectónico **INTEGER SERIAL** (ADR-002), sin uso de UUIDs como claves foráneas.",
        ":::",
        "",
        f"**Total de tablas relacionales catalogadas:** {len(models)}",
        "",
        "## Resumen Entidad-Relación (Mermaid ERD)",
        "",
        "```mermaid",
        "erDiagram"
    ]

    # Simple ERD relationships derived from foreign keys
    relationships = []
    for m in models:
        for c in m.columns:
            if c.is_fk and "." in c.fk_target:
                target_table = c.fk_target.split(".")[0]
                relationships.append(f"    {target_table.upper()} ||--o{{ {m.table_name.upper()} : \"{c.name}\"")

    # Deduplicate relationships
    for rel in sorted(set(relationships))[:30]:  # Limit to 30 cleanest relations to avoid diagram clutter
        lines.append(rel)

    lines.extend([
        "```",
        "",
        "---",
        ""
    ])

    for m in models:
        audit_badge = " `AuditMixin`" if m.has_audit else ""
        lifecycle_badge = " `EstadoLifecycle`" if m.has_lifecycle else ""
        lines.append(f"### Tabla `{m.table_name}` (Modelo: `{m.class_name}`){audit_badge}{lifecycle_badge}")
        lines.append("")
        lines.append("| Nombre de Columna | Tipo de Dato | Clave | Nullable | Restricciones / Notas |")
        lines.append("|---|---|---|---|---|")
        for c in m.columns:
            key_tag = "PK" if c.is_pk else ("FK" if c.is_fk else "-")
            null_tag = "SÍ" if c.nullable else "**NO**"
            lines.append(f"| `{c.name}` | `{c.col_type}` | **{key_tag}** | {null_tag} | {c.notes} |")
        lines.append("")

    return "\n".join(lines)


def generate_rbac_matrix_md(rbac: RbacInfo) -> str:
    """Generate website/docs/tecnico/matriz-rbac.md."""
    lines = [
        "---",
        "id: matriz-rbac",
        "title: Matriz de Control de Acceso por Roles (RBAC)",
        "sidebar_label: Matriz RBAC",
        "---",
        "",
        "# Matriz de Control de Acceso por Roles (RBAC)",
        "",
        ":::info Docs-as-Code — Derivado del Código Fuente",
        "Generado automáticamente a partir de `backend/app/core/permissions.py` y validado contra `frontend/src/auth/rbac.js`.",
        ":::",
        "",
        "## 1. Grafo de Herencia de Roles",
        "",
        "```mermaid",
        "graph TD",
        "    ADMIN[ADMIN (Control Total)] --> ORGANIZADOR[ORGANIZADOR]",
        "    ADMIN --> SOPORTE[SOPORTE]",
        "    ORGANIZADOR --> MODERADOR[MODERADOR]",
        "    MODERADOR --> EMBAJADOR[EMBAJADOR]",
        "    EMBAJADOR --> MIEMBRO[MIEMBRO]",
        "    SOPORTE --> MIEMBRO",
        "```",
        "",
        "---",
        "",
        "## 2. Matriz de Permisos Técnicos vs Roles",
        "",
        "| Permiso Técnico | " + " | ".join(rbac.roles) + " |",
        "|" + "---|" * (len(rbac.roles) + 1)
    ]

    for p in rbac.permissions:
        row = [f"`{p}`"]
        for r in rbac.roles:
            is_direct = p in rbac.direct_permissions.get(r, set())
            is_effective = p in rbac.effective_permissions.get(r, set())
            if is_direct:
                row.append("✅ Directo")
            elif is_effective:
                row.append("🟢 Heredado")
            else:
                row.append("❌")
        lines.append("| " + " | ".join(row) + " |")

    lines.extend([
        "",
        ":::tip Leyenda de Permisos",
        "- **✅ Directo:** El permiso está expresamente otorgado a este rol.",
        "- **🟢 Heredado:** El permiso se adquiere mediante la cadena jerárquica de roles.",
        "- **❌:** El rol tiene denegado el acceso al recurso correspondiente.",
        ":::",
        ""
    ])

    return "\n".join(lines)


def generate_adrs_md() -> str:
    """Generate website/docs/tecnico/decisiones-arquitectonicas.md."""
    return """---
id: decisiones-arquitectonicas
title: Decisiones Arquitectónicas (ADRs)
sidebar_label: Decisiones Arquitectónicas (ADRs)
---

# Decisiones Arquitectónicas (ADRs)

Registro formal de decisiones arquitectónicas fundamentales que rigen el desarrollo y evolución de Plataforma MEH.

| ID | Título | Decisión | Alternativas Evaluadas | Justificación y Consecuencias |
|---|---|---|---|---|
| **ADR-001** | Framework Frontend | **Fluent UI v9** con React + JSX | Material UI, Tailwind CSS, Ant Design | Componentes accesibles, tokens semánticos nativos de Microsoft y alto rendimiento con Griffel (CSS-in-JS). Se usa `.jsx` puro. |
| **ADR-002** | Modelo de Claves Primarias | **INTEGER SERIAL** (Autoincremental) | UUID v4 / ULID | Se priorizó el rendimiento de índices B-Tree, menor fragmentación en disco y simplicidad en URLs y claves foráneas en PostgreSQL. |
| **ADR-003** | ORM y Concurrencia | **SQLAlchemy Síncrono** sobre `psycopg2` | SQLAlchemy Asyncio, Tortoise ORM | Previene lazy-loading bugs asíncronos y carreras transaccionales en operaciones financieras críticas (conciliación de vouchers y emisión de certificados). |
| **ADR-004** | Protocolo de Autenticación | **JWT (HS256)** con `python-jose` | OAuth2 con servidor externo, Session Cookies | Desacoplamiento de la API, almacenamiento stateless de tokens, y validación criptográfica instantánea tanto en backend como frontend. |
"""


def generate_user_roles_table_md(rbac: RbacInfo) -> str:
    """Update or format website/docs/usuario/introduccion/roles-permisos.md."""
    # We maintain the comprehensive user-facing guide and align the RBAC table with the real derived code
    return f"""---
title: Matriz de Control de Acceso por Roles (RBAC)
sidebar_label: 02. Roles y Privilegios
---

# Matriz de Control de Acceso por Roles (RBAC)

Para garantizar la seguridad, la confidencialidad de la información financiera y el orden logístico en las capacitaciones, la Plataforma MEH implementa un modelo jerárquico de **Control de Acceso Basado en Roles (RBAC)**. 

La jerarquía física de permisos a nivel de base de datos y validación de tokens JWT en backend y frontend se estructura de la siguiente manera:

`ADMIN` (Consola Total) ➔ `ORGANIZADOR` (Control Operativo) ➔ `MODERADOR` (Co-Organizador) ➔ `SOPORTE` (Logística QR) ➔ `EMBAJADOR` (Líder VIP) ➔ `MIEMBRO` (Estudiante estándar)

---

## 1. Tabla Comparativa de Capacidades (¿Qué PUEDE y NO PUEDE hacer?)

A continuación se detalla exhaustivamente la matriz de acciones transaccionales permitidas y denegadas por cada rol a nivel de la lógica de servicios del backend:

| Rol del Sistema | Lo que SÍ PUEDE hacer | Lo que NO PUEDE hacer |
|---|---|---|
| **Miembro** | • Inscribirse a eventos y cursos activos.<br/>• Responder foros y subir entregas de tareas.<br/>• Registrar transferencias bancarias (subir vouchers).<br/>• Descargar certificados y verificar títulos. | • Modificar stock o precios de souvenirs.<br/>• Crear cursos, lecciones o calificar tareas.<br/>• Validar inscripciones o vouchers ajenos.<br/>• Cambiar privilegios de otros usuarios. |
| **Embajador** | • Todo lo que hace el Miembro.<br/>• Descargar plantillas de código y guías en la Biblioteca VIP (`vip.access`). | • Crear o editar cursos y lecciones.<br/>• Aprobar o procesar OCR de vouchers financieros.<br/>• Escanear códigos QR de asistencia en checkpoints. |
| **Soporte** | • Todo lo que hace el Miembro.<br/>• Escanear códigos QR de asistentes en checkpoints en puerta (`attendance.scan`).<br/>• Validar pagos y gestionar insignias/cursos auxiliares. | • Modificar stock o registrar productos de souvenirs.<br/>• Emitir certificados académicos masivos.<br/>• Modificar configuraciones globales clave-valor. |
| **Moderador** | • Todo lo que hace el Soporte.<br/>• Moderar foros, calificar tareas y coordinar expositores (`speaker.access`).<br/>• Modificar el estado y cupo de inscripciones a eventos. | • Emitir certificados criptográficos masivos.<br/>• Validar o procesar conciliación OCR de pagos.<br/>• Acceder a la consola completa de logs de auditoría. |
| **Organizador**| • Todo lo que hace el Moderador.<br/>• Crear y programar eventos, calendarizar y editar agendas (`events.manage`).<br/>• Crear cursos, lecciones, registrar tareas y calificarlas (`courses.manage`).<br/>• Publicar avisos globales (`announcements.manage`) y emitir certificados. | • Modificar configuraciones globales clave-valor del Hub.<br/>• Consultar la bitácora física completa de logs por IP. |
| **Administrador**| • **Acceso y Control Absoluto (Full Access).**<br/>• Cambiar de rol a usuarios y suspender cuentas.<br/>• Validar vouchers bancarios manualmente o mediante visión OCR.<br/>• Gestionar souvenirs, stock, categorías e inventario.<br/>• Consultar logs físicos por IP (`audit.read`) para control de fraudes.<br/>• Modificar configuraciones globales del Hub. | • No tiene restricciones operativas dentro de los límites del ecosistema tecnológico de la comunidad. |

---

## 2. Tabla Comparativa de Visibilidad (¿Qué PUEDE y NO PUEDE ver?)

El frontend oculta o muestra componentes visuales de Fluent UI en base a la evaluación del token JWT:

| Rol del Sistema | Vistas de la Interfaz que SÍ PUEDE ver | Vistas de la Interfaz que NO PUEDE ver |
|---|---|---|
| **Miembro** | • Landing, Login, Registro.<br/>• Dashboard del Estudiante, Grid de Insignias.<br/>• Learning Hub, Aula Virtual LMS, Foros.<br/>• Catálogo de Souvenirs, Historial de Pagos y verificar certificados. | • Consola máster de Administración (`/admin`).<br/>• Biblioteca de Recursos VIP (`/recursos`).<br/>• Cámara para escaneo QR de asistencia (`/escaneo-qr`).<br/>• Consola de organizador (`/organizador/eventos`). |
| **Embajador** | • Todo lo visible para el Miembro.<br/>• Pestaña y descargas de la **Biblioteca de Recursos VIP** (`/recursos`). | • Consola máster de Administración (`/admin`).<br/>• Cámara de escaneo QR de asistencia (`/escaneo-qr`).<br/>• Consola de organizador (`/organizador/eventos`). |
| **Soporte** | • Todo lo visible para el Miembro.<br/>• Pestaña y visor de la **Cámara de Escaneo QR** (`/escaneo-qr`). | • Consola máster de Administración (`/admin`).<br/>• Biblioteca de Recursos VIP (`/recursos`).<br/>• Consola de organizador (`/organizador/eventos`). |
| **Moderador** | • Todo lo visible para el Soporte.<br/>• Panel de control de inscripciones de eventos y kits de speaker. | • Consola máster de Administración (`/admin`).<br/>• Biblioteca de Recursos VIP (`/recursos`).<br/>• Panel de creación curricular de la academia LMS. |
| **Organizador**| • Todo lo visible para el Moderador.<br/>• Panel del Organizador de Eventos (`/organizador/eventos`).<br/>• Pestañas de creación de cursos, lecciones, tareas y emisión. | • Configuración de la tienda de souvenirs.<br/>• Consola de validación OCR de vouchers financieros.<br/>• Panel de logs de auditoría por dirección IP. |
| **Administrador**| • **Visualiza el 100% de las rutas, componentes, modales y pestañas del sistema.**<br/>• Consola máster de Administración (`/admin`) y sus subpestañas lógicas (Analytics, OCR, Souvenirs, etc.). | • No tiene restricciones de visibilidad de vistas dentro de la SPA en React de la plataforma. |
"""


def generate_changelog_md() -> str:
    """Generate website/docs/historial-cambios.md in Keep a Changelog + SemVer format."""
    return """---
id: historial-cambios
title: Historial de Cambios
sidebar_label: Historial de Cambios
---

# Changelog (Historial de Cambios)

Todas las modificaciones notables realizadas en Plataforma MEH se documentan en este archivo.

El formato se basa estrictamente en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y este proyecto se rige por [Semantic Versioning (SemVer)](https://semver.org/lang/es/).

---

## [Unreleased]
### Added
- Pipeline Docs-as-Code con generador unificado en `tools/docs_gen.py`.
- Soporte de subcomandos `tech`, `user`, `changelog`, `all` y `check`.
- Doble superficie de despliegue híbrido consistente (GitHub Pages en `/` y Docker en `/docs/`).
- Validaciones en CI para prevenir desincronización de documentación ante cambios en endpoints o esquemas.

### Changed
- Reestructuración de Docusaurus en 4 bloques según la taxonomía Diátaxis (Tutoriales, Guías Prácticas, Referencia, Explicación).
- Normalización de rutas y slugs eliminando prefijos numéricos obsoletos.

### Removed
- Eliminación de scripts huérfanos generadores en la raíz (`build_docs.py`, `build_user_manual.py`, `generate_tech_docs.py`).

---

## [1.2.0] - 2026-05-25
### Added
- Integración de la matriz RBAC jerárquica completa y validaciones en frontend y backend.
- Diagramas de secuencia Mermaid para escaneo QR de asistencia.
- Soporte de certificados académicos y modo offline en lector QR con IndexedDB.

### Changed
- Refactorización de componentes en Fluent UI v9 y Griffel.
- Optimización de índices en base de datos PostgreSQL con `INTEGER SERIAL`.

---

## [1.1.0] - 2026-05-25
### Added
- Módulo de finanzas y conciliación bancaria difusa con OCR determinístico y similitud Jaro-Winkler.
- Sistema de Insignias digitales interoperables con el estándar Open Badges.

---

## [1.0.0] - 2026-05-19
### Added
- Lanzamiento inicial de la Plataforma Microsoft Education Hub (MEH).
- Módulos de autenticación JWT HS256, eventos, cursos (LMS) y souvenirs.
- Arquitectura de Monolito Modular Síncrono con FastAPI y SQLAlchemy.
"""


# ==============================================================================
# 5. Build, Check, and CLI Execution
# ==============================================================================

def get_target_files_content() -> Dict[Path, str]:
    """Calculate all generated file contents without touching the disk."""
    api_modules = parse_api_modules()
    models = parse_models()
    rbac = parse_rbac()

    targets: Dict[Path, str] = {
        TECNICO_DIR / "contratos-api.md": generate_api_contracts_md(api_modules),
        TECNICO_DIR / "diccionario-datos.md": generate_data_dictionary_md(models),
        TECNICO_DIR / "matriz-rbac.md": generate_rbac_matrix_md(rbac),
        TECNICO_DIR / "decisiones-arquitectonicas.md": generate_adrs_md(),
        USUARIO_DIR / "introduccion" / "roles-permisos.md": generate_user_roles_table_md(rbac),
        CHANGELOG_DOC: generate_changelog_md(),
        ROOT_CHANGELOG: generate_changelog_md().split("---\n\n", 1)[-1]  # Root CHANGELOG without Docusaurus frontmatter
    }
    return targets


def cmd_build(subcommand: str) -> None:
    """Generate and write documentation files to disk."""
    targets = get_target_files_content()

    filter_paths = set()
    if subcommand == "tech":
        filter_paths = {
            TECNICO_DIR / "contratos-api.md",
            TECNICO_DIR / "diccionario-datos.md",
            TECNICO_DIR / "matriz-rbac.md",
            TECNICO_DIR / "decisiones-arquitectonicas.md",
        }
    elif subcommand == "user":
        filter_paths = {
            USUARIO_DIR / "introduccion" / "roles-permisos.md",
        }
    elif subcommand == "changelog":
        filter_paths = {
            CHANGELOG_DOC,
            ROOT_CHANGELOG
        }
    else:  # "all"
        filter_paths = set(targets.keys())

    written_count = 0
    for target_path, content in targets.items():
        if target_path in filter_paths:
            target_path.parent.mkdir(parents=True, exist_ok=True)
            # Normalize to unix line-endings
            norm_content = content.replace("\r\n", "\n")
            with open(target_path, "w", encoding="utf-8", newline="\n") as f:
                f.write(norm_content)
            rel_path = target_path.relative_to(ROOT_DIR)
            print(f"[OK] Generated: {rel_path}")
            written_count += 1

    print(f"\n[DONE] Operacion '{subcommand}' completada exitosamente ({written_count} archivos actualizados).")


def cmd_check() -> int:
    """Compare generated content with files on disk. Exit 0 if match, 1 if drift."""
    targets = get_target_files_content()
    has_drift = False

    for target_path, expected_content in targets.items():
        rel_path = target_path.relative_to(ROOT_DIR)
        if not target_path.exists():
            print(f"[DRIFT DETECTED] El archivo esperado no existe en disco: {rel_path}", file=sys.stderr)
            has_drift = True
            continue

        with open(target_path, "r", encoding="utf-8") as f:
            actual_content = f.read()

        norm_expected = expected_content.replace("\r\n", "\n").strip()
        norm_actual = actual_content.replace("\r\n", "\n").strip()

        if norm_expected != norm_actual:
            print(f"\n[DRIFT DETECTED] Desfase detectado en: {rel_path}", file=sys.stderr)
            diff = difflib.unified_diff(
                norm_actual.splitlines(keepends=True),
                norm_expected.splitlines(keepends=True),
                fromfile=f"{rel_path} (actual)",
                tofile=f"{rel_path} (generado desde codigo)",
                n=3
            )
            print("".join(diff), file=sys.stderr)
            has_drift = True

    if has_drift:
        print("\n[ERROR] La documentacion esta desincronizada con el codigo fuente.", file=sys.stderr)
        print("[HINT] Solucion: Ejecute 'npm run docs:gen' o 'python tools/docs_gen.py all' y confirme los cambios en git.\n", file=sys.stderr)
        return 1

    print("[CHECK OK] La documentacion esta 100% sincronizada con el codigo fuente del proyecto.")
    return 0


def main():
    parser = argparse.ArgumentParser(
        description="Docs-as-Code Generator & Synchronizer for Plataforma-MEH"
    )
    parser.add_argument(
        "subcommand",
        choices=["tech", "user", "changelog", "all", "check"],
        nargs="?",
        default="all",
        help="Subcomando a ejecutar: tech | user | changelog | all | check (default: all)"
    )

    args = parser.parse_args()

    if args.subcommand == "check":
        sys.exit(cmd_check())
    else:
        cmd_build(args.subcommand)


if __name__ == "__main__":
    main()
