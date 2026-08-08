use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LauncherEntry {
    pub id: String,
    pub name: String,
    pub exe_path: String,
    pub icon_path: Option<String>,
    pub last_launched_at: Option<String>,
}
