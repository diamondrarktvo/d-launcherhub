import { Gamepad2, X } from "lucide-react"
import type { LauncherEntry } from "@/types/launcher"

type LauncherTileProps = {
  launcher: LauncherEntry
  onLaunch: (launcher: LauncherEntry) => void
  onRemove: (launcher: LauncherEntry) => void
}

export function LauncherTile({ launcher, onLaunch, onRemove }: LauncherTileProps) {
  return (
    <div className="group relative flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary">
      <button
        onClick={() => onRemove(launcher)}
        className="absolute right-2 top-2 rounded-sm p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
        <span className="sr-only">Remove</span>
      </button>

      <button
        onClick={() => onLaunch(launcher)}
        className="flex flex-col items-center gap-3"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-secondary">
          {launcher.iconPath ? (
            <img src={launcher.iconPath} alt="" className="h-10 w-10 object-contain" />
          ) : (
            <Gamepad2 className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <span className="max-w-24 truncate text-sm font-medium">{launcher.name}</span>
      </button>
    </div>
  )
}
