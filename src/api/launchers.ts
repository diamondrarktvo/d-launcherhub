import { invoke } from '@tauri-apps/api/core'
import type { LauncherEntry } from '../types/launcher'

export function listLaunchers() {
  return invoke<LauncherEntry[]>('list_launchers')
}

export function addLauncher(name: string, exePath: string, iconPath?: string) {
  return invoke<LauncherEntry>('add_launcher', { name, exePath, iconPath })
}

export function removeLauncher(id: string) {
  return invoke<void>('remove_launcher', { id })
}

export function launchApp(exePath: string) {
  return invoke<void>('launch_app', { exePath })
}

export function pickExecutableFile() {
  return invoke<string | null>('pick_executable_file')
}
