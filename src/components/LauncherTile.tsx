import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Gamepad2, Pencil, X } from "lucide-react"
import { convertFileSrc } from "@tauri-apps/api/core"
import { cn } from "@/lib/utils"
import type { LauncherEntry } from "@/types/launcher"

type LauncherTileProps = {
  launcher: LauncherEntry
  variant?: "grid" | "list"
  onLaunch: (launcher: LauncherEntry) => void
  onEdit: (launcher: LauncherEntry) => void
  onRemove: (launcher: LauncherEntry) => void
}

export function LauncherTile({
  launcher,
  variant = "grid",
  onLaunch,
  onEdit,
  onRemove,
}: LauncherTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: launcher.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isList = variant === "list"
  const iconBoxSize = isList ? "h-10 w-10" : "h-20 w-20"
  const iconSize = isList ? "h-6 w-6" : "h-12 w-12"
  const fallbackIconSize = isList ? "h-5 w-5" : "h-10 w-10"

  const icon = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md bg-secondary",
        iconBoxSize,
      )}
    >
      {launcher.iconPath ? (
        <img
          src={convertFileSrc(launcher.iconPath)}
          alt=""
          className={cn("object-contain", iconSize)}
        />
      ) : (
        <Gamepad2 className={cn("text-muted-foreground", fallbackIconSize)} />
      )}
    </div>
  )

  const actionButtons = (
    <>
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
    </>
  )

  if (isList) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="group flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:border-primary hover:shadow-[0_0_24px_-8px_hsl(var(--primary))]"
      >
        <button
          onClick={() => onLaunch(launcher)}
          className="flex flex-1 items-center gap-3 overflow-hidden text-left"
        >
          {icon}
          <span className="truncate text-sm font-medium">{launcher.name}</span>
        </button>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {actionButtons}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary hover:shadow-[0_0_24px_-8px_hsl(var(--primary))]"
    >
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {actionButtons}
      </div>

      <button onClick={() => onLaunch(launcher)} className="flex flex-col items-center gap-3">
        {icon}
        <span className="max-w-28 truncate text-sm font-medium">{launcher.name}</span>
      </button>
    </div>
  )
}
