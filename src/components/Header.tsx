import { ArrowUpDown, Clock, LayoutGrid, List, Search, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RocketLogo } from "@/components/RocketLogo"
import { cn } from "@/lib/utils"
import type { SortMode, ViewMode } from "@/types/view"

type HeaderProps = {
  count: number
  search: string
  onSearchChange: (value: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortMode: SortMode
  onSortModeChange: (mode: SortMode) => void
  onSettingsClick: () => void
}

export function Header({
  count,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortMode,
  onSortModeChange,
  onSettingsClick,
}: HeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <RocketLogo idPrefix="header-logo" className="h-8 w-8 shrink-0" />
        <div>
          <h1 className="text-xl font-semibold leading-tight">The Launcher</h1>
          {count > 0 && (
            <p className="text-xs text-muted-foreground">
              {count} launcher{count > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {count > 0 && (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher..."
                className="w-56 pl-8"
              />
            </div>

            <div className="flex items-center gap-1 rounded-md border border-border bg-secondary p-1">
              <button
                onClick={() => onSortModeChange("manual")}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors",
                  sortMode === "manual" && "bg-background text-foreground",
                )}
              >
                <ArrowUpDown className="h-4 w-4" />
                <span className="sr-only">Ordre manuel</span>
              </button>
              <button
                onClick={() => onSortModeChange("recent")}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors",
                  sortMode === "recent" && "bg-background text-foreground",
                )}
              >
                <Clock className="h-4 w-4" />
                <span className="sr-only">Récents</span>
              </button>
            </div>

            <div className="flex items-center gap-1 rounded-md border border-border bg-secondary p-1">
              <button
                onClick={() => onViewModeChange("grid")}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors",
                  viewMode === "grid" && "bg-background text-foreground",
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only">Vue grille</span>
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors",
                  viewMode === "list" && "bg-background text-foreground",
                )}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">Vue liste</span>
              </button>
            </div>
          </>
        )}

        <button
          onClick={onSettingsClick}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Paramètres</span>
        </button>
      </div>
    </header>
  )
}
