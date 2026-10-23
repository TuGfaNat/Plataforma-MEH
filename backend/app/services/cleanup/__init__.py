from .protection import (
    is_cleanup_enabled,
    ensure_cleanup_enabled,
    ensure_cleanup_admin,
    get_superadmin_email,
    get_whitelist_emails,
    update_whitelist_emails,
    get_protected_user_reasons,
    get_protected_config_response,
    is_record_protected,
)
from .catalog import (
    CLEANUP_CATALOG,
    DEPENDENCY_MATRIX,
    get_catalog_summary,
    list_table_rows,
    list_presets,
    save_custom_preset,
    delete_custom_preset,
    resolve_preset_selections,
)
from .backup import (
    get_backup_dir,
    get_backup_ttl_minutes,
    compute_selection_hash,
    create_cleanup_backup,
    get_valid_backup,
    purge_expired_backups,
)
from .executor import (
    SOFT_DELETE_PHRASE,
    HARD_DELETE_PHRASE,
    preview_cleanup,
    generate_backup_for_selection,
    execute_cleanup,
)
