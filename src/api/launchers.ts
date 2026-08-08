import { invoke } from '@tauri-apps/api/core'
import type { LauncherEntry } from '../types/launcher'

export function listLaunchers() {
  return invoke<LauncherEntry[]>('list_launchers')
}

export function addLauncher(name: string, exePath: string) {
  return invoke<LauncherEntry>('add_launcher', { name, exePath })
}

export function updateLauncher(id: string, name: string, exePath: string) {
  return invoke<LauncherEntry>('update_launcher', { id, name, exePath })
}

export function removeLauncher(id: string) {
  return invoke<void>('remove_launcher', { id })
}

export function reorderLaunchers(ids: string[]) {
  return invoke<void>('reorder_launchers', { ids })
}

export function launchApp(id: string, exePath: string) {
  return invoke<void>('launch_app', { id, exePath })
}

export function pickExecutableFile() {
  return invoke<string | null>('pick_executable_file')
}
