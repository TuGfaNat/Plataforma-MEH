from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set
from sqlalchemy.orm import Session

from ...models import models
from ...core import auth as auth_core
from ...core.logging import registrar_log
from ...core.exceptions import (
    CredencialesInvalidasError,
    ValidacionNegocioError,
)
from ...schemas import cleanup as cleanup_schema
from .protection import (
    ensure_cleanup_admin,
    get_protected_user_reasons,
    is_record_protected,
)
from .catalog import (
    CLEANUP_CATALOG,
    DEPENDENCY_MATRIX,
    build_classification_context,
    classify_row_origin,
    get_ordered_table_keys,
    _resolve_title_and_subtitle,
)
from .backup import (
    compute_selection_hash,
    create_cleanup_backup,
    get_valid_backup,
    record_to_snapshot_dict,
)

SOFT_DELETE_PHRASE = "ELIMINAR DATOS"
HARD_DELETE_PHRASE = "BORRADO DEFINITIVO"


def preview_cleanup(
    db: Session,
    current_user: models.Usuario,
    request: cleanup_schema.CleanupPreviewRequest,
) -> cleanup_schema.CleanupPreviewResponse:
    """
    Calcula el impacto exacto de una limpieza (soft o hard), detecta registros protegidos,
    evalúa dependencias e hijos en cascada, clasifica orígenes y genera el selection_hash.
    """
    ensure_cleanup_admin(current_user)

    mode = request.mode
    include_deps = request.include_dependencies
    ctx = build_classification_context(db)
    protected_user_reasons, _ = get_protected_user_reasons(db, current_user)

    requested_counts: Dict[str, int] = {}
    working_selections: Dict[str, Set[int]] = {}
    protected_skipped: List[Dict[str, Any]] = []
    blockers: List[cleanup_schema.CleanupBlockerItem] = []
    warnings: List[str] = []
    dependencies: List[cleanup_schema.CleanupDependencyHit] = []

    # 1. Validar tablas e IDs solicitados inicialmente
    for tabla, raw_ids in request.selections.items():
        if not raw_ids:
            continue
        if tabla not in CLEANUP_CATALOG:
            raise ValidacionNegocioError(f"La tabla '{tabla}' no es válida en el catálogo de limpieza")

        unique_ids = sorted({int(i) for i in raw_ids})
        requested_counts[tabla] = len(unique_ids)

        info = CLEANUP_CATALOG[tabla]
        model = info["model"]
        pk_col = getattr(model, info["pk_field"])

        query = db.query(model).execution_options(include_deleted=True).filter(pk_col.in_(unique_ids))
        if mode == "soft":
            query = query.filter(model.id_estado != 0)
        rows = query.all()

        valid_set: Set[int] = set()
        for r in rows:
            rid = getattr(r, info["pk_field"])
            prot, motivo_prot = is_record_protected(db, current_user, tabla, r, protected_user_reasons)
            if prot:
                titulo, _ = _resolve_title_and_subtitle(tabla, r, ctx)
                protected_skipped.append(
                    {
                        "tabla": tabla,
                        "id": rid,
                        "titulo": titulo,
                        "motivo": motivo_prot,
                    }
                )
                blockers.append(
                    cleanup_schema.CleanupBlockerItem(
                        tabla=tabla,
                        id=rid,
                        tipo="PROTECTED_RECORD",
                        mensaje=f"El registro {tabla} #{rid} ({titulo}) está protegido por regla '{motivo_prot}' y no puede ser eliminado.",
                    )
                )
            else:
                valid_set.add(rid)

        if valid_set:
            working_selections[tabla] = valid_set

    # 2. Evaluar dependencias en orden de Padres -> Hijos (inverso a delete_order)
    parent_to_child_order = list(reversed(get_ordered_table_keys()))
    for parent_table in parent_to_child_order:
        parent_ids = working_selections.get(parent_table)
        if not parent_ids:
            continue

        dep_rules = DEPENDENCY_MATRIX.get(parent_table, [])
        if not dep_rules:
            continue

        parent_info = CLEANUP_CATALOG[parent_table]
        parent_model = parent_info["model"]
        parent_pk = getattr(parent_model, parent_info["pk_field"])
        parent_rows = (
            db.query(parent_model)
            .execution_options(include_deleted=True)
            .filter(parent_pk.in_(list(parent_ids)))
            .all()
        )
        parent_map = {getattr(pr, parent_info["pk_field"]): pr for pr in parent_rows}

        for dep in dep_rules:
            child_table = dep["child_table"]
            fk_col_name = dep["fk_column"]
            is_nullable = dep["nullable"]
            child_info = CLEANUP_CATALOG[child_table]
            child_model = child_info["model"]
            child_pk_name = child_info["pk_field"]
            fk_col = getattr(child_model, fk_col_name)

            c_query = db.query(child_model).execution_options(include_deleted=True).filter(
                fk_col.in_(list(parent_ids))
            )
            if mode == "soft":
                c_query = c_query.filter(child_model.id_estado != 0)
            child_rows = c_query.all()
            if not child_rows:
                continue

            # Agrupar hijos por ID del padre
            children_by_parent: Dict[int, List[int]] = {}
            for cr in child_rows:
                prot, _ = is_record_protected(db, current_user, child_table, cr, protected_user_reasons)
                if prot:
                    continue
                pid = getattr(cr, fk_col_name)
                cid = getattr(cr, child_pk_name)
                children_by_parent.setdefault(pid, []).append(cid)

            for pid, cids in children_by_parent.items():
                already_selected = working_selections.get(child_table, set())
                missing_cids = sorted(set(cids) - already_selected)
                if not missing_cids:
                    continue

                pr_obj = parent_map.get(pid)
                p_title, _ = _resolve_title_and_subtitle(parent_table, pr_obj, ctx) if pr_obj else (f"{parent_table} #{pid}", "")

                if include_deps:
                    working_selections.setdefault(child_table, set()).update(missing_cids)
                    dependencies.append(
                        cleanup_schema.CleanupDependencyHit(
                            parent_table=parent_table,
                            parent_id=pid,
                            parent_title=p_title,
                            child_table=child_table,
                            child_label=child_info["label"],
                            child_ids=missing_cids,
                            child_count=len(missing_cids),
                            action="AUTO_INCLUDED",
                            message=f"Incluidos automáticamente {len(missing_cids)} registros dependientes en '{child_info['label']}'.",
                        )
                    )
                else:
                    if mode == "hard":
                        if not is_nullable:
                            dependencies.append(
                                cleanup_schema.CleanupDependencyHit(
                                    parent_table=parent_table,
                                    parent_id=pid,
                                    parent_title=p_title,
                                    child_table=child_table,
                                    child_label=child_info["label"],
                                    child_ids=missing_cids,
                                    child_count=len(missing_cids),
                                    action="BLOCKED",
                                    message=f"Bloqueo FK: '{p_title}' tiene {len(missing_cids)} registros en '{child_info['label']}'. Selecciónalos o activa 'Incluir dependencias'.",
                                )
                            )
                            blockers.append(
                                cleanup_schema.CleanupBlockerItem(
                                    tabla=parent_table,
                                    id=pid,
                                    tipo="FK_DEPENDENCY",
                                    child_table=child_table,
                                    child_ids=missing_cids,
                                    mensaje=f"No se puede borrar físicamente {parent_table} #{pid} ({p_title}) porque tiene {len(missing_cids)} registros dependientes en '{child_table}'.",
                                )
                            )
                        else:
                            dependencies.append(
                                cleanup_schema.CleanupDependencyHit(
                                    parent_table=parent_table,
                                    parent_id=pid,
                                    parent_title=p_title,
                                    child_table=child_table,
                                    child_label=child_info["label"],
                                    child_ids=missing_cids,
                                    child_count=len(missing_cids),
                                    action="NULLIFIED",
                                    message=f"Se desvincularán (SET NULL) {len(missing_cids)} registros en '{child_info['label']}'.",
                                )
                            )
                    else:
                        dependencies.append(
                            cleanup_schema.CleanupDependencyHit(
                                parent_table=parent_table,
                                parent_id=pid,
                                parent_title=p_title,
                                child_table=child_table,
                                child_label=child_info["label"],
                                child_ids=missing_cids,
                                child_count=len(missing_cids),
                                action="SOFT_ORPHAN_WARNING",
                                message=f"'{p_title}' tiene {len(missing_cids)} registros activos en '{child_info['label']}' que no se desactivarán a menos que actives cascada.",
                            )
                        )
                        warnings.append(
                            f"{parent_table} #{pid} dejará {len(missing_cids)} registros relacionados activos en {child_table}."
                        )

    # 3. Construir effective_selections ordenadas y resumen de orígenes
    ordered_keys = get_ordered_table_keys()
    effective_selections: Dict[str, List[int]] = {}
    effective_counts: Dict[str, int] = {}
    execution_order: List[str] = []
    origin_summary: Dict[str, int] = {"SEED": 0, "REAL": 0, "OCR": 0}

    for tabla in ordered_keys:
        ids_set = working_selections.get(tabla)
        if not ids_set:
            continue
        sorted_ids = sorted(ids_set)
        effective_selections[tabla] = sorted_ids
        effective_counts[tabla] = len(sorted_ids)
        execution_order.append(tabla)

        info = CLEANUP_CATALOG[tabla]
        model = info["model"]
        pk_col = getattr(model, info["pk_field"])
        rows = (
            db.query(model)
            .execution_options(include_deleted=True)
            .filter(pk_col.in_(sorted_ids))
            .all()
        )
        for r in rows:
            origen, _ = classify_row_origin(tabla, r, ctx)
            origin_summary[origen] = origin_summary.get(origen, 0) + 1

    total_effective = sum(effective_counts.values())
    if total_effective == 0 and not blockers:
        blockers.append(
            cleanup_schema.CleanupBlockerItem(
                tabla="global",
                id=None,
                tipo="EMPTY_SELECTION",
                mensaje="No hay registros válidos seleccionados para ejecutar la limpieza.",
            )
        )

    selection_hash = compute_selection_hash(effective_selections, mode)
    required_phrase = HARD_DELETE_PHRASE if mode == "hard" else SOFT_DELETE_PHRASE

    return cleanup_schema.CleanupPreviewResponse(
        mode=mode,
        include_dependencies=include_deps,
        selection_hash=selection_hash,
        can_execute=(len(blockers) == 0 and total_effective > 0),
        required_phrase=required_phrase,
        requires_extra_hard_confirmation=(mode == "hard"),
        requested_counts=requested_counts,
        effective_selections=effective_selections,
        effective_counts=effective_counts,
        total_effective_records=total_effective,
        origin_summary=origin_summary,
        dependencies=dependencies,
        protected_skipped=protected_skipped,
        blockers=blockers,
        warnings=warnings,
        execution_order=execution_order,
    )


def generate_backup_for_selection(
    db: Session,
    current_user: models.Usuario,
    request: cleanup_schema.CleanupBackupRequest,
) -> cleanup_schema.CleanupBackupResponse:
    """Calcula el preview efectivo y genera el respaldo obligatorio previo a la ejecución."""
    preview = preview_cleanup(
        db,
        current_user,
        cleanup_schema.CleanupPreviewRequest(
            selections=request.selections,
            mode=request.mode,
            include_dependencies=request.include_dependencies,
        ),
    )
    if not preview.can_execute:
        first_blocker = preview.blockers[0].mensaje if preview.blockers else "Selección inválida"
        raise ValidacionNegocioError(f"No se puede generar respaldo porque la selección tiene bloqueos: {first_blocker}")

    return create_cleanup_backup(
        db=db,
        current_user=current_user,
        effective_selections=preview.effective_selections,
        mode=request.mode,
        selection_hash=preview.selection_hash,
    )


def _nullify_optional_references_for_hard_delete(
    db: Session, effective_selections: Dict[str, List[int]]
) -> None:
    """Limpia tablas puente M2M y FKs anulables antes del borrado físico para evitar violaciones de integridad."""
    del_eventos = effective_selections.get("eventos", [])
    del_speakers = effective_selections.get("speakers", [])
    del_ausp = effective_selections.get("auspiciadores", [])
    del_com = effective_selections.get("comunidades_aliadas", [])
    del_users = effective_selections.get("usuarios", [])
    del_pagos = effective_selections.get("pagos", [])
    del_cursos = effective_selections.get("cursos", [])

    # 1. Tablas intermedias M2M
    if del_eventos:
        db.execute(
            models.eventos_speakers.delete().where(models.eventos_speakers.c.id_evento.in_(del_eventos))
        )
        db.execute(
            models.eventos_auspiciadores.delete().where(models.eventos_auspiciadores.c.id_evento.in_(del_eventos))
        )
        db.execute(
            models.eventos_comunidades.delete().where(models.eventos_comunidades.c.id_evento.in_(del_eventos))
        )
    if del_speakers:
        db.execute(
            models.eventos_speakers.delete().where(models.eventos_speakers.c.id_speaker.in_(del_speakers))
        )
    if del_ausp:
        db.execute(
            models.eventos_auspiciadores.delete().where(models.eventos_auspiciadores.c.id_auspiciador.in_(del_ausp))
        )
    if del_com:
        db.execute(
            models.eventos_comunidades.delete().where(models.eventos_comunidades.c.id_comunidad.in_(del_com))
        )

    # 2. FKs opcionales hacia pagos
    if del_pagos:
        db.query(models.InscripcionEvento).execution_options(include_deleted=True).filter(
            models.InscripcionEvento.id_pago.in_(del_pagos)
        ).update({models.InscripcionEvento.id_pago: None}, synchronize_session=False)
        db.query(models.InscripcionCurso).execution_options(include_deleted=True).filter(
            models.InscripcionCurso.id_pago.in_(del_pagos)
        ).update({models.InscripcionCurso.id_pago: None}, synchronize_session=False)
        db.query(models.Pedido).execution_options(include_deleted=True).filter(
            models.Pedido.id_pago.in_(del_pagos)
        ).update({models.Pedido.id_pago: None}, synchronize_session=False)

    # 3. FKs opcionales hacia eventos
    if del_eventos:
        db.query(models.Anuncio).execution_options(include_deleted=True).filter(
            models.Anuncio.id_evento.in_(del_eventos)
        ).update({models.Anuncio.id_evento: None}, synchronize_session=False)
        db.query(models.Recurso).execution_options(include_deleted=True).filter(
            models.Recurso.id_evento.in_(del_eventos)
        ).update({models.Recurso.id_evento: None}, synchronize_session=False)
        db.query(models.Certificado).execution_options(include_deleted=True).filter(
            models.Certificado.id_evento.in_(del_eventos)
        ).update({models.Certificado.id_evento: None}, synchronize_session=False)
        db.query(models.Badge).execution_options(include_deleted=True).filter(
            models.Badge.id_evento_origen.in_(del_eventos)
        ).update({models.Badge.id_evento_origen: None}, synchronize_session=False)

    # 4. FKs opcionales hacia cursos
    if del_cursos:
        db.query(models.Recurso).execution_options(include_deleted=True).filter(
            models.Recurso.id_curso.in_(del_cursos)
        ).update({models.Recurso.id_curso: None}, synchronize_session=False)
        db.query(models.Certificado).execution_options(include_deleted=True).filter(
            models.Certificado.id_curso.in_(del_cursos)
        ).update({models.Certificado.id_curso: None}, synchronize_session=False)
        db.query(models.Badge).execution_options(include_deleted=True).filter(
            models.Badge.id_curso_origen.in_(del_cursos)
        ).update({models.Badge.id_curso_origen: None}, synchronize_session=False)

    # 5. FKs de auditoría y referencias opcionales hacia usuarios
    if del_users:
        for cat_info in CLEANUP_CATALOG.values():
            m = cat_info["model"]
            if hasattr(m, "creado_por"):
                db.query(m).execution_options(include_deleted=True).filter(
                    m.creado_por.in_(del_users)
                ).update({m.creado_por: None}, synchronize_session=False)
            if hasattr(m, "modificado_por"):
                db.query(m).execution_options(include_deleted=True).filter(
                    m.modificado_por.in_(del_users)
                ).update({m.modificado_por: None}, synchronize_session=False)

        db.query(models.Pago).execution_options(include_deleted=True).filter(
            models.Pago.validado_por.in_(del_users)
        ).update({models.Pago.validado_por: None}, synchronize_session=False)
        db.query(models.Pago).execution_options(include_deleted=True).filter(
            models.Pago.reembolsado_por.in_(del_users)
        ).update({models.Pago.reembolsado_por: None}, synchronize_session=False)
        db.query(models.CheckpointPermiso).execution_options(include_deleted=True).filter(
            models.CheckpointPermiso.asignado_por.in_(del_users)
        ).update({models.CheckpointPermiso.asignado_por: None}, synchronize_session=False)
        db.query(models.Curso).execution_options(include_deleted=True).filter(
            models.Curso.id_instructor.in_(del_users)
        ).update({models.Curso.id_instructor: None}, synchronize_session=False)
        db.query(models.Anuncio).execution_options(include_deleted=True).filter(
            models.Anuncio.id_autor.in_(del_users)
        ).update({models.Anuncio.id_autor: None}, synchronize_session=False)


def execute_cleanup(
    db: Session,
    current_user: models.Usuario,
    request: cleanup_schema.CleanupExecuteRequest,
    ip_address: Optional[str] = None,
) -> cleanup_schema.CleanupExecuteResponse:
    """
    Ejecuta la limpieza selectiva (soft o hard) verificando:
      1. Rol ADMIN y flag ENABLE_DATA_CLEANUP
      2. Motivo obligatorio
      3. Frase de confirmación (+ check extra en hard delete)
      4. Contraseña del administrador (verify_password)
      5. Ausencia de registros protegidos y bloqueos FK
      6. Coincidencia exacta de selection_hash
      7. Respaldo previo obligatorio vigente (TTL 30 min) con el mismo selection_hash
      8. Transacción atómica con rollback total ante cualquier fallo
      9. Registro en logs_sistema al final de la operación (sobrevive a limpiar logs_sistema)
    """
    ensure_cleanup_admin(current_user)

    # 1. Validar motivo
    motivo = (request.motivo or "").strip()
    if len(motivo) < 5:
        raise ValidacionNegocioError(
            "El motivo de la limpieza es obligatorio y debe tener al menos 5 caracteres"
        )

    # 2. Validar frase de confirmación y doble confirmación para hard delete
    phrase = (request.confirmation_phrase or "").strip().upper()
    if request.mode == "hard":
        if phrase != HARD_DELETE_PHRASE:
            raise ValidacionNegocioError(
                f"Frase de confirmación inválida para borrado definitivo. Debe escribir exactamente: '{HARD_DELETE_PHRASE}'"
            )
        if not request.hard_delete_confirmed:
            raise ValidacionNegocioError(
                "El borrado físico definitivo (Hard Delete) requiere marcar la casilla de confirmación extra de irreversibilidad"
            )
    else:
        if phrase not in (SOFT_DELETE_PHRASE, HARD_DELETE_PHRASE):
            raise ValidacionNegocioError(
                f"Frase de confirmación inválida. Debe escribir exactamente: '{SOFT_DELETE_PHRASE}'"
            )

    # 3. Validar contraseña del administrador actual
    if not request.admin_password or not auth_core.verify_password(
        request.admin_password, current_user.password_hash
    ):
        raise CredencialesInvalidasError(
            "La contraseña de administrador ingresada es incorrecta"
        )

    # 4. Calcular preview efectivo y verificar que no haya protegidos ni bloqueos
    preview = preview_cleanup(
        db,
        current_user,
        cleanup_schema.CleanupPreviewRequest(
            selections=request.selections,
            mode=request.mode,
            include_dependencies=request.include_dependencies,
        ),
    )

    if preview.protected_skipped:
        first_prot = preview.protected_skipped[0]
        raise ValidacionNegocioError(
            f"Operación rechazada: la selección incluye registros protegidos ({first_prot['tabla']} #{first_prot['id']} - {first_prot['motivo']})"
        )

    if not preview.can_execute or preview.blockers:
        first_blk = preview.blockers[0].mensaje if preview.blockers else "La selección no es ejecutable"
        raise ValidacionNegocioError(f"Operación bloqueada: {first_blk}", status_code=409)

    # 5. Verificar hash de selección
    if request.selection_hash != preview.selection_hash:
        raise ValidacionNegocioError(
            "El hash de la selección no coincide con el estado actual de los datos (selection_hash inválido). Vuelve a previsualizar.",
            status_code=409,
        )

    # 6. Verificar respaldo obligatorio y correspondencia de hash
    backup_data = get_valid_backup(request.backup_id)
    if backup_data.get("selection_hash") != preview.selection_hash:
        raise ValidacionNegocioError(
            "El respaldo proporcionado no corresponde a la selección actual (selection_hash distinto).",
            status_code=409,
        )
    if backup_data.get("mode") != request.mode:
        raise ValidacionNegocioError(
            "El modo del respaldo no coincide con el modo de ejecución solicitado.",
            status_code=409,
        )

    # 7. Capturar snapshots antes de ejecutar para la auditoría inmutable
    snapshots_resumen: Dict[str, List[Dict[str, Any]]] = {}
    for tabla in preview.execution_order:
        ids = preview.effective_selections.get(tabla, [])
        if not ids:
            continue
        info = CLEANUP_CATALOG[tabla]
        model = info["model"]
        pk_col = getattr(model, info["pk_field"])
        rows = (
            db.query(model)
            .execution_options(include_deleted=True)
            .filter(pk_col.in_(ids))
            .all()
        )
        # Guardar hasta 25 snapshots completos por tabla en el log de auditoría (el backup JSON tiene el 100%)
        snapshots_resumen[tabla] = [record_to_snapshot_dict(r) for r in rows[:25]]

    # 8. Ejecutar en una única transacción atómica con rollback total ante cualquier error
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    affected_by_table: Dict[str, int] = {}

    try:
        if request.mode == "soft":
            for tabla in preview.execution_order:
                ids = preview.effective_selections.get(tabla, [])
                if not ids:
                    continue
                info = CLEANUP_CATALOG[tabla]
                model = info["model"]
                pk_col = getattr(model, info["pk_field"])

                rows = (
                    db.query(model)
                    .execution_options(include_deleted=True)
                    .filter(pk_col.in_(ids))
                    .all()
                )
                count = 0
                for r in rows:
                    r.id_estado = 0
                    r.fecha_modificacion_estado = now
                    if hasattr(r, "modificado_por"):
                        r.modificado_por = current_user.id_usuario
                    if hasattr(r, "fecha_modificacion"):
                        r.fecha_modificacion = now
                    if tabla == "usuarios":
                        r.activo = False
                        r.motivo_suspension = f"Limpieza selectiva: {motivo}"
                    elif hasattr(r, "activo"):
                        r.activo = False
                    count += 1
                affected_by_table[tabla] = count
            db.flush()

        else:  # mode == "hard"
            _nullify_optional_references_for_hard_delete(db, preview.effective_selections)
            for tabla in preview.execution_order:
                ids = preview.effective_selections.get(tabla, [])
                if not ids:
                    continue
                info = CLEANUP_CATALOG[tabla]
                model = info["model"]
                pk_col = getattr(model, info["pk_field"])

                deleted_count = (
                    db.query(model)
                    .execution_options(include_deleted=True)
                    .filter(pk_col.in_(ids))
                    .delete(synchronize_session=False)
                )
                affected_by_table[tabla] = deleted_count
            db.flush()

        total_affected = sum(affected_by_table.values())
        accion_log = "LIMPIEZA_DATOS_HARD" if request.mode == "hard" else "LIMPIEZA_DATOS_SOFT"
        tabla_log = (
            preview.execution_order[0]
            if len(preview.execution_order) == 1
            else "multiple"
        )

        # 9. Registrar auditoría AL FINAL (después incluso de borrar logs_sistema si estaba seleccionado)
        audit_entry = registrar_log(
            db=db,
            id_admin=current_user.id_usuario,
            accion=accion_log,
            tabla_afectada=tabla_log,
            id_registro_afectado=total_affected,
            valor_anterior={
                "conteos_por_tabla": affected_by_table,
                "origenes": preview.origin_summary,
                "snapshots": snapshots_resumen,
            },
            valor_nuevo={
                "modo": request.mode,
                "motivo": motivo,
                "backup_id": request.backup_id,
                "selection_hash": preview.selection_hash,
                "include_dependencies": request.include_dependencies,
                "total_afectados": total_affected,
                "estado_resultante": "ELIMINADO_FISICO" if request.mode == "hard" else "ELIMINADO_LOGICO (id_estado=0)",
            },
            ip_direccion=ip_address,
            commit=False,
        )

        db.commit()
        db.refresh(audit_entry)

    except Exception as exc:
        db.rollback()
        if isinstance(exc, (ValidacionNegocioError, CredencialesInvalidasError)):
            raise
        raise ValidacionNegocioError(
            f"Error transaccional durante la ejecución de la limpieza. Se aplicó rollback total: {str(exc)}"
        )

    return cleanup_schema.CleanupExecuteResponse(
        status="success",
        mode=request.mode,
        selection_hash=preview.selection_hash,
        backup_id=request.backup_id,
        motivo=motivo,
        total_affected=total_affected,
        affected_by_table=affected_by_table,
        origin_summary=preview.origin_summary,
        audit_log_id=audit_entry.id_log,
        executed_at=now.isoformat(),
        restorable_in_trash=(request.mode == "soft"),
    )
