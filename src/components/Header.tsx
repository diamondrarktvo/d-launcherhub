import { LayoutGrid, List, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list"

type HeaderProps = {
  count: number
  search: string
  onSearchChange: (value: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function Header({
  count,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: HeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <LayoutGrid className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold leading-tight">The Launcher</h1>
          {count > 0 && (
            <p className="text-xs text-muted-foreground">
              {count} launcher{count > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {count > 0 && (
        <div className="flex items-center gap-3">
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
        </div>
      )}
    </header>
  )
}
