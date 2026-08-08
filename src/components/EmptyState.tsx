import { LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

type EmptyStateProps = {
  onAddClick: () => void
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <LayoutGrid className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Aucun launcher pour l'instant</h2>
        <p className="text-sm text-muted-foreground">
          Ajoute ton premier exécutable pour commencer à construire ta liste.
        </p>
      </div>
      <Button onClick={onAddClick}>Ajouter un launcher</Button>
    </div>
  )
}
