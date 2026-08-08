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

type AddLauncherFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string, exePath: string) => void
}

export function AddLauncherForm({ open, onOpenChange, onSubmit }: AddLauncherFormProps) {
  const [name, setName] = useState("")
  const [exePath, setExePath] = useState("")

  function reset() {
    setName("")
    setExePath("")
  }

  async function handleBrowse() {
    const picked = await pickExecutableFile()
    if (picked) setExePath(picked)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || !exePath.trim()) return

    onSubmit(name.trim(), exePath.trim())
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un launcher</DialogTitle>
          <DialogDescription>
            Donne-lui un nom et indique son exécutable.
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

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Ajouter</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
