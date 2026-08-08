import { invoke } from "@tauri-apps/api/core"
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart"

export type AppSettings = {
  closeToTray: boolean
}

export function getSettings() {
  return invoke<AppSettings>("get_settings")
}

export function setCloseToTray(enabled: boolean) {
  return invoke<void>("set_close_to_tray", { enabled })
}

export function quitApp() {
  return invoke<void>("quit_app")
}

export function getAutostartEnabled() {
  return isEnabled()
}

export function setAutostartEnabled(enabled: boolean) {
  return enabled ? enable() : disable()
}
