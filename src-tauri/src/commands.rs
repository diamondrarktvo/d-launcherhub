use crate::models::{AppSettings, LauncherEntry};
use crate::storage;
use std::path::{Path, PathBuf};
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;
use uuid::Uuid;

fn app_data_file_path(app: &tauri::AppHandle, file_name: &str) -> PathBuf {
    let dir = app
        .path()
        .app_data_dir()
        .expect("failed to resolve app data directory");

    std::fs::create_dir_all(&dir).expect("failed to create app data directory");
    dir.join(file_name)
}

fn launchers_file_path(app: &tauri::AppHandle) -> PathBuf {
    app_data_file_path(app, "launchers.json")
}

fn settings_file_path(app: &tauri::AppHandle) -> PathBuf {
    app_data_file_path(app, "settings.json")
}

#[cfg(target_os = "windows")]
fn icons_dir_path(app: &tauri::AppHandle) -> PathBuf {
    let dir = app
        .path()
        .app_data_dir()
        .expect("failed to resolve app data directory")
        .join("icons");

    std::fs::create_dir_all(&dir).expect("failed to create icons directory");
    dir
}

// Extrait l'icône embarquée dans l'exécutable et la sauvegarde en PNG.
// Best-effort : une icône manquante ne doit jamais empêcher d'ajouter/modifier un launcher.
// windows-icons lit les ressources PE d'un .exe : uniquement disponible sous Windows.
#[cfg(target_os = "windows")]
fn save_icon(app: &tauri::AppHandle, id: &str, exe_path: &str) -> Option<String> {
    let icon = windows_icons::get_icon_by_path(exe_path).ok()?;
    let file_path = icons_dir_path(app).join(format!("{id}.png"));
    icon.save(&file_path).ok()?;
    Some(file_path.to_string_lossy().into_owned())
}

#[cfg(not(target_os = "windows"))]
fn save_icon(_app: &tauri::AppHandle, _id: &str, _exe_path: &str) -> Option<String> {
    None
}

fn validate_exe_path(exe_path: &str) -> Result<(), String> {
    if Path::new(exe_path).is_file() {
        Ok(())
    } else {
        Err(format!(
            "\"{}\" n'existe pas ou n'est pas un fichier.",
            exe_path
        ))
    }
}

/// Lit les préférences persistées. Utilisé aussi bien par la commande `get_settings`
/// que par le handler de fermeture de fenêtre dans `lib.rs` (pas d'IPC là-bas).
pub fn current_settings(app: &tauri::AppHandle) -> AppSettings {
    storage::load_settings(&settings_file_path(app))
}

#[tauri::command]
pub fn list_launchers(app: tauri::AppHandle) -> Vec<LauncherEntry> {
    storage::load_launchers(&launchers_file_path(&app))
}

#[tauri::command]
pub fn add_launcher(
    app: tauri::AppHandle,
    name: String,
    exe_path: String,
) -> Result<LauncherEntry, String> {
    validate_exe_path(&exe_path)?;

    let file_path = launchers_file_path(&app);
    let mut launchers = storage::load_launchers(&file_path);

    let id = Uuid::new_v4().to_string();
    let icon_path = save_icon(&app, &id, &exe_path);

    let new_launcher = LauncherEntry {
        id,
        name,
        exe_path,
        icon_path,
        last_launched_at: None,
    };

    launchers.push(new_launcher.clone());
    storage::save_launchers(&file_path, &launchers)?;

    Ok(new_launcher)
}

#[tauri::command]
pub fn update_launcher(
    app: tauri::AppHandle,
    id: String,
    name: String,
    exe_path: String,
) -> Result<LauncherEntry, String> {
    validate_exe_path(&exe_path)?;

    let file_path = launchers_file_path(&app);
    let mut launchers = storage::load_launchers(&file_path);

    let launcher = launchers
        .iter_mut()
        .find(|launcher| launcher.id == id)
        .ok_or_else(|| "Launcher introuvable.".to_string())?;

    if launcher.exe_path != exe_path {
        if let Some(old_icon) = &launcher.icon_path {
            let _ = std::fs::remove_file(old_icon);
        }
        launcher.icon_path = save_icon(&app, &id, &exe_path);
    }

    launcher.name = name;
    launcher.exe_path = exe_path;

    let updated = launcher.clone();
    storage::save_launchers(&file_path, &launchers)?;

    Ok(updated)
}

#[tauri::command]
pub fn remove_launcher(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let file_path = launchers_file_path(&app);
    let mut launchers = storage::load_launchers(&file_path);

    if let Some(launcher) = launchers.iter().find(|launcher| launcher.id == id) {
        if let Some(icon) = &launcher.icon_path {
            let _ = std::fs::remove_file(icon);
        }
    }

    launchers.retain(|launcher| launcher.id != id);
    storage::save_launchers(&file_path, &launchers)
}

#[tauri::command]
pub fn reorder_launchers(app: tauri::AppHandle, ids: Vec<String>) -> Result<(), String> {
    let file_path = launchers_file_path(&app);
    let launchers = storage::load_launchers(&file_path);

    let reordered: Vec<LauncherEntry> = ids
        .into_iter()
        .filter_map(|id| launchers.iter().find(|launcher| launcher.id == id).cloned())
        .collect();

    storage::save_launchers(&file_path, &reordered)
}

#[tauri::command]
pub async fn pick_executable_file(app: tauri::AppHandle) -> Option<String> {
    let (tx, rx) = tokio::sync::oneshot::channel();

    app.dialog()
        .file()
        .add_filter("Executable", &["exe"])
        .pick_file(move |file_path| {
            let _ = tx.send(file_path);
        });

    rx.await.ok().flatten().map(|path| path.to_string())
}

#[tauri::command]
pub fn launch_app(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let file_path = launchers_file_path(&app);
    let mut launchers = storage::load_launchers(&file_path);

    // On résout exe_path depuis le storage plutôt que de faire confiance à une valeur
    // envoyée par le frontend : seuls les chemins déjà enregistrés via add/update_launcher
    // (et validés par validate_exe_path) peuvent être exécutés.
    let launcher = launchers
        .iter_mut()
        .find(|launcher| launcher.id == id)
        .ok_or_else(|| "Launcher introuvable.".to_string())?;

    // spawn() démarre le programme sans attendre qu'il se termine,
    // sinon notre appli resterait bloquée tant que le launcher est ouvert.
    std::process::Command::new(&launcher.exe_path)
        .spawn()
        .map_err(|e| e.to_string())?;

    let now_ms = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|duration| duration.as_millis() as i64)
        .unwrap_or(0);
    launcher.last_launched_at = Some(now_ms);

    // Best-effort : ne jamais faire échouer le lancement pour un problème d'horodatage.
    let _ = storage::save_launchers(&file_path, &launchers);

    Ok(())
}

#[tauri::command]
pub fn get_settings(app: tauri::AppHandle) -> AppSettings {
    current_settings(&app)
}

#[tauri::command]
pub fn set_close_to_tray(app: tauri::AppHandle, enabled: bool) -> Result<(), String> {
    let file_path = settings_file_path(&app);
    let mut settings = storage::load_settings(&file_path);
    settings.close_to_tray = enabled;
    storage::save_settings(&file_path, &settings)
}

#[tauri::command]
pub fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}
