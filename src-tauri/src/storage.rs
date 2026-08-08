use crate::models::LauncherEntry;
use std::fs;
use std::path::{Path, PathBuf};

pub fn load_launchers(file_path: &Path) -> Vec<LauncherEntry> {
    // Premier lancement : le fichier n'existe pas encore, on part d'une liste vide.
    let Ok(content) = fs::read_to_string(file_path) else {
        return Vec::new();
    };

    match serde_json::from_str(&content) {
        Ok(launchers) => launchers,
        Err(_) => {
            // Fichier corrompu : on le met de côté au lieu de le laisser être
            // écrasé silencieusement par la prochaine sauvegarde.
            let backup_path = PathBuf::from(format!("{}.bak", file_path.display()));
            let _ = fs::rename(file_path, backup_path);
            Vec::new()
        }
    }
}

pub fn save_launchers(file_path: &Path, launchers: &[LauncherEntry]) -> Result<(), String> {
    let content = serde_json::to_string_pretty(launchers).map_err(|e| e.to_string())?;
    fs::write(file_path, content).map_err(|e| e.to_string())
}
