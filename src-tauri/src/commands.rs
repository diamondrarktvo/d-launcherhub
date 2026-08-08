use crate::models::LauncherEntry;
use crate::storage;
use std::path::{Path, PathBuf};
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;
use uuid::Uuid;

fn launchers_file_path(app: &tauri::AppHandle) -> PathBuf {
    let dir = app
        .path()
        .app_data_dir()
        .expect("failed to resolve app data directory");

    std::fs::create_dir_all(&dir).expect("failed to create app data directory");
    dir.join("launchers.json")
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
    icon_path: Option<String>,
) -> Result<LauncherEntry, String> {
    if !Path::new(&exe_path).is_file() {
        return Err(format!("\"{}\" n'existe pas ou n'est pas un fichier.", exe_path));
    }

    let file_path = launchers_file_path(&app);
    let mut launchers = storage::load_launchers(&file_path);

    let new_launcher = LauncherEntry {
        id: Uuid::new_v4().to_string(),
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
pub fn remove_launcher(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let file_path = launchers_file_path(&app);
    let mut launchers = storage::load_launchers(&file_path);

    launchers.retain(|launcher| launcher.id != id);
    storage::save_launchers(&file_path, &launchers)
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
