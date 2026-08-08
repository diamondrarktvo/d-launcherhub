import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Gamepad2, Pencil, X } from "lucide-react"
import { convertFileSrc } from "@tauri-apps/api/core"
import type { LauncherEntry } from "@/types/launcher"

type LauncherTileProps = {
  launcher: LauncherEntry
  onLaunch: (launcher: LauncherEntry) => void
  onEdit: (launcher: LauncherEntry) => void
  onRemove: (launcher: LauncherEntry) => void
}

export function LauncherTile({ launcher, onLaunch, onEdit, onRemove }: LauncherTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: launcher.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
    >
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(launcher)}
          className="rounded-sm p-1 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="sr-only">Edit</span>
        </button>
        <button
          onClick={() => onRemove(launcher)}
          className="rounded-sm p-1 text-muted-foreground hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Remove</span>
        </button>
      </div>

      <button onClick={() => onLaunch(launcher)} className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-secondary">
          {launcher.iconPath ? (
            <img
              src={convertFileSrc(launcher.iconPath)}
              alt=""
              className="h-10 w-10 object-contain"
            />
          ) : (
            <Gamepad2 className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <span className="max-w-24 truncate text-sm font-medium">{launcher.name}</span>
      </button>
    </div>
  )
}
