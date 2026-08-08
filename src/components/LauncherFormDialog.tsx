import { useState } from "react"
import { FolderOpen } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { pickExecutableFile } from "@/api/launchers"
import type { LauncherEntry } from "@/types/launcher"

type LauncherFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  launcher?: LauncherEntry | null
  onSubmit: (name: string, exePath: string) => Promise<void>
}

export function LauncherFormDialog({
  open,
  onOpenChange,
  launcher,
  onSubmit,
}: LauncherFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Radix unmounts DialogContent while closed, so LauncherForm remounts fresh
            every time the dialog opens and always starts from the current `launcher` —
            no reset effect needed. */}
        <LauncherForm launcher={launcher} onOpenChange={onOpenChange} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  )
}

type LauncherFormProps = {
  launcher?: LauncherEntry | null
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string, exePath: string) => Promise<void>
}

function LauncherForm({ launcher, onOpenChange, onSubmit }: LauncherFormProps) {
  const isEditing = Boolean(launcher)
  const [name, setName] = useState(launcher?.name ?? "")
  const [exePath, setExePath] = useState(launcher?.exePath ?? "")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleBrowse() {
    const picked = await pickExecutableFile()
    if (picked) setExePath(picked)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || !exePath.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit(name.trim(), exePath.trim())
      onOpenChange(false)
    } catch (err) {
      setError(typeof err === "string" ? err : "Une erreur est survenue.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Modifier le launcher" : "Ajouter un launcher"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Mets à jour son nom ou son exécutable."
            : "Donne-lui un nom et indique son exécutable."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="launcher-name">Nom</Label>
          <Input
            id="launcher-name"
            placeholder="Steam"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="launcher-exe">Exécutable</Label>
          <div className="flex gap-2">
            <Input
              id="launcher-exe"
              placeholder="C:\...\steam.exe"
              value={exePath}
              onChange={(e) => setExePath(e.target.value)}
            />
            <Button type="button" variant="outline" size="icon" onClick={handleBrowse}>
              <FolderOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : isEditing ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
