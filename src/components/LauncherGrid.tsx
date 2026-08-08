import { Plus } from "lucide-react"
import type { LauncherEntry } from "@/types/launcher"
import { LauncherTile } from "@/components/LauncherTile"

type LauncherGridProps = {
  launchers: LauncherEntry[]
  onLaunch: (launcher: LauncherEntry) => void
  onRemove: (launcher: LauncherEntry) => void
  onAddClick: () => void
}

export function LauncherGrid({ launchers, onLaunch, onRemove, onAddClick }: LauncherGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-4">
      {launchers.map((launcher) => (
        <LauncherTile
          key={launcher.id}
          launcher={launcher}
          onLaunch={onLaunch}
          onRemove={onRemove}
        />
      ))}

      <button
        onClick={onAddClick}
        className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-4 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-secondary">
          <Plus className="h-8 w-8" />
        </div>
        <span className="text-sm font-medium">Ajouter</span>
      </button>
    </div>
  )
}
