import type { LauncherEntry } from "@/types/launcher"
import type { SortMode } from "@/types/view"

export function filterAndSortLaunchers(
  launchers: LauncherEntry[],
  searchQuery: string,
  sortMode: SortMode,
): LauncherEntry[] {
  const query = searchQuery.trim().toLowerCase()
  const filtered = query
    ? launchers.filter((launcher) => launcher.name.toLowerCase().includes(query))
    : launchers

  if (sortMode !== "recent") return filtered

  return [...filtered].sort((a, b) => (b.lastLaunchedAt ?? 0) - (a.lastLaunchedAt ?? 0))
}
