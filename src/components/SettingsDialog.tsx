import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  getSettings,
  setCloseToTray,
  getAutostartEnabled,
  setAutostartEnabled,
  quitApp,
} from "@/api/settings"

const GLOBAL_SHORTCUT_LABEL = "Ctrl+Shift+L"

type SettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Radix unmounts DialogContent while closed, so SettingsForm remounts fresh
            (and refetches) every time the dialog opens — no manual reset needed. */}
        <SettingsForm />
      </DialogContent>
    </Dialog>
  )
}

function SettingsForm() {
  const [closeToTray, setCloseToTrayState] = useState(true)
  const [autostart, setAutostartState] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSettings(), getAutostartEnabled()])
      .then(([settings, autostartEnabled]) => {
        setCloseToTrayState(settings.closeToTray)
        setAutostartState(autostartEnabled)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function handleCloseToTrayChange(checked: boolean) {
    setCloseToTrayState(checked)
    await setCloseToTray(checked)
  }

  async function handleAutostartChange(checked: boolean) {
    setAutostartState(checked)
    await setAutostartEnabled(checked)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Paramètres</DialogTitle>
        <DialogDescription>Comportement de l'application.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col divide-y divide-border">
        <ToggleRow
          label="Lancer au démarrage de Windows"
          description="Ouvre The Launcher automatiquement à l'ouverture de session."
          checked={autostart}
          onChange={handleAutostartChange}
          disabled={isLoading}
        />
        <ToggleRow
          label="Réduire dans la zone de notification"
          description="En fermant la fenêtre, l'app continue de tourner en arrière-plan."
          checked={closeToTray}
          onChange={handleCloseToTrayChange}
          disabled={isLoading}
        />
        <div className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-sm font-medium">Raccourci global</p>
            <p className="text-xs text-muted-foreground">
              Affiche la fenêtre depuis n'importe où.
            </p>
          </div>
          <kbd className="shrink-0 rounded-md border border-border bg-secondary px-2 py-1 text-xs font-medium">
            {GLOBAL_SHORTCUT_LABEL}
          </kbd>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => quitApp()}>
          Quitter The Launcher
        </Button>
      </DialogFooter>
    </>
  )
}

type ToggleRowProps = {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

function ToggleRow({ label, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50",
          checked ? "bg-primary" : "bg-secondary",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background transition-transform",
            checked && "translate-x-5",
          )}
        />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  )
}
