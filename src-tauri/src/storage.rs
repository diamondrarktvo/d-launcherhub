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

#[cfg(test)]
mod tests {
    use super::*;

    struct TempFile(PathBuf);

    impl TempFile {
        fn new(name: &str) -> Self {
            let path = std::env::temp_dir().join(format!(
                "the-launcher-test-{name}-{}-{}.json",
                std::process::id(),
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_nanos()
            ));
            Self(path)
        }
    }

    impl Drop for TempFile {
        fn drop(&mut self) {
            let _ = fs::remove_file(&self.0);
            let _ = fs::remove_file(format!("{}.bak", self.0.display()));
        }
    }

    #[test]
    fn load_launchers_defaults_to_empty_when_file_missing() {
        let file = TempFile::new("missing");
        assert_eq!(load_launchers(&file.0), Vec::new());
    }

    #[test]
    fn save_then_load_launchers_round_trips() {
        let file = TempFile::new("roundtrip");
        let launchers = vec![LauncherEntry {
            id: "1".to_string(),
            name: "Steam".to_string(),
            exe_path: "C:\\steam.exe".to_string(),
            icon_path: None,
            last_launched_at: Some(42),
        }];

        save_launchers(&file.0, &launchers).unwrap();
        assert_eq!(load_launchers(&file.0), launchers);
    }

    #[test]
    fn load_launchers_backs_up_and_resets_corrupted_file() {
        let file = TempFile::new("corrupt");
        fs::write(&file.0, "not valid json").unwrap();

        let loaded = load_launchers(&file.0);

        assert_eq!(loaded, Vec::new());
        assert!(!file.0.exists());
        let backup_path = PathBuf::from(format!("{}.bak", file.0.display()));
        assert_eq!(fs::read_to_string(backup_path).unwrap(), "not valid json");
    }

    #[test]
    fn load_settings_defaults_when_file_missing() {
        let file = TempFile::new("settings-missing");
        assert!(load_settings(&file.0).close_to_tray);
    }

    #[test]
    fn save_then_load_settings_round_trips() {
        let file = TempFile::new("settings-roundtrip");
        let settings = AppSettings {
            close_to_tray: false,
        };

        save_settings(&file.0, &settings).unwrap();
        assert!(!load_settings(&file.0).close_to_tray);
    }
}
