use crate::models::LauncherEntry;
use crate::storage;
use std::path::{Path, PathBuf};
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;
use uuid::Uuid;
use windows_icons::get_icon_by_path;

fn launchers_file_path(app: &tauri::AppHandle) -> PathBuf {
    let dir = app
        .path()
        .app_data_dir()
        .expect("failed to resolve app data directory");

    std::fs::create_dir_all(&dir).expect("failed to create app data directory");
    dir.join("launchers.json")
}

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
fn save_icon(app: &tauri::AppHandle, id: &str, exe_path: &str) -> Option<String> {
    let icon = get_icon_by_path(exe_path).ok()?;
    let file_path = icons_dir_path(app).join(format!("{id}.png"));
    icon.save(&file_path).ok()?;
    Some(file_path.to_string_lossy().into_owned())
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
pub fn launch_app(exe_path: String) -> Result<(), String> {
    // spawn() démarre le programme sans attendre qu'il se termine,
    // sinon notre appli resterait bloquée tant que le launcher est ouvert.
    std::process::Command::new(exe_path)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}
