import { Plus } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import type { LauncherEntry } from "@/types/launcher"
import { LauncherTile } from "@/components/LauncherTile"

type LauncherGridProps = {
  launchers: LauncherEntry[]
  onLaunch: (launcher: LauncherEntry) => void
  onEdit: (launcher: LauncherEntry) => void
  onRemove: (launcher: LauncherEntry) => void
  onReorder: (ids: string[]) => void
  onAddClick: () => void
}

export function LauncherGrid({
  launchers,
  onLaunch,
  onEdit,
  onRemove,
  onReorder,
  onAddClick,
}: LauncherGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = launchers.findIndex((launcher) => launcher.id === active.id)
    const newIndex = launchers.findIndex((launcher) => launcher.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(launchers, oldIndex, newIndex)
    onReorder(reordered.map((launcher) => launcher.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-4">
        <SortableContext
          items={launchers.map((launcher) => launcher.id)}
          strategy={rectSortingStrategy}
        >
          {launchers.map((launcher) => (
            <LauncherTile
              key={launcher.id}
              launcher={launcher}
              onLaunch={onLaunch}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          ))}
        </SortableContext>

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
    </DndContext>
  )
}
