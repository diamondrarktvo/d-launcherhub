import { Plus } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import type { LauncherEntry } from "@/types/launcher"
import { LauncherTile } from "@/components/LauncherTile"
import { Button } from "@/components/ui/button"

type ViewMode = "grid" | "list"

type LauncherGridProps = {
  launchers: LauncherEntry[]
  viewMode: ViewMode
  reorderEnabled: boolean
  searchQuery: string
  onClearSearch: () => void
  onLaunch: (launcher: LauncherEntry) => void
  onEdit: (launcher: LauncherEntry) => void
  onRemove: (launcher: LauncherEntry) => void
  onReorder: (ids: string[]) => void
  onAddClick: () => void
}

export function LauncherGrid({
  launchers,
  viewMode,
  reorderEnabled,
  searchQuery,
  onClearSearch,
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

  if (launchers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Aucun résultat pour « {searchQuery} »
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onClearSearch}>
          Réinitialiser la recherche
        </Button>
      </div>
    )
  }

  const containerClassName =
    viewMode === "grid"
      ? "grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-4"
      : "flex flex-col gap-2"

  const tiles = launchers.map((launcher) => (
    <LauncherTile
      key={launcher.id}
      launcher={launcher}
      variant={viewMode}
      onLaunch={onLaunch}
      onEdit={onEdit}
      onRemove={onRemove}
    />
  ))

  const addButton =
    viewMode === "grid" ? (
      <button
        onClick={onAddClick}
        className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-md bg-secondary">
          <Plus className="h-9 w-9" />
        </div>
        <span className="text-sm font-medium">Ajouter</span>
      </button>
    ) : (
      <button
        onClick={onAddClick}
        className="flex items-center gap-3 rounded-lg border border-dashed border-border px-3 py-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
          <Plus className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium">Ajouter un launcher</span>
      </button>
    )

  if (!reorderEnabled) {
    return (
      <div className={containerClassName}>
        {tiles}
        {addButton}
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className={containerClassName}>
        <SortableContext
          items={launchers.map((launcher) => launcher.id)}
          strategy={viewMode === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
        >
          {tiles}
        </SortableContext>
        {addButton}
      </div>
    </DndContext>
  )
}
