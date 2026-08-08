use crate::models::{AppSettings, LauncherEntry};
use serde::{de::DeserializeOwned, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

fn load_json<T: DeserializeOwned + Default>(file_path: &Path) -> T {
    // Premier lancement : le fichier n'existe pas encore, on part de la valeur par défaut.
    let Ok(content) = fs::read_to_string(file_path) else {
        return T::default();
    };

    match serde_json::from_str(&content) {
        Ok(value) => value,
        Err(_) => {
            // Fichier corrompu : on le met de côté au lieu de le laisser être
            // écrasé silencieusement par la prochaine sauvegarde.
            let backup_path = PathBuf::from(format!("{}.bak", file_path.display()));
            let _ = fs::rename(file_path, backup_path);
            T::default()
        }
    }
}

fn save_json<T: Serialize + ?Sized>(file_path: &Path, value: &T) -> Result<(), String> {
    let content = serde_json::to_string_pretty(value).map_err(|e| e.to_string())?;
    fs::write(file_path, content).map_err(|e| e.to_string())
}

pub fn load_launchers(file_path: &Path) -> Vec<LauncherEntry> {
    load_json(file_path)
}

pub fn save_launchers(file_path: &Path, launchers: &[LauncherEntry]) -> Result<(), String> {
    save_json(file_path, launchers)
}

pub fn load_settings(file_path: &Path) -> AppSettings {
    load_json(file_path)
}

pub fn save_settings(file_path: &Path, settings: &AppSettings) -> Result<(), String> {
    save_json(file_path, settings)
}
