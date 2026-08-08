use crate::models::LauncherEntry;
use std::fs;
use std::path::Path;

pub fn load_launchers(file_path: &Path) -> Vec<LauncherEntry> {
    // Premier lancement : le fichier n'existe pas encore, on part d'une liste vide.
    let Ok(content) = fs::read_to_string(file_path) else {
        return Vec::new();
    };

    serde_json::from_str(&content).unwrap_or_default()
}

pub fn save_launchers(file_path: &Path, launchers: &[LauncherEntry]) -> Result<(), String> {
    let content = serde_json::to_string_pretty(launchers).map_err(|e| e.to_string())?;
    fs::write(file_path, content).map_err(|e| e.to_string())
}
