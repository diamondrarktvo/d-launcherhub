import { useEffect, useState } from "react"
import type { LauncherEntry } from "@/types/launcher"
import { listLaunchers, addLauncher, removeLauncher, launchApp } from "@/api/launchers"
import { LauncherGrid } from "@/components/LauncherGrid"
import { AddLauncherForm } from "@/components/AddLauncherForm"

function App() {
  const [launchers, setLaunchers] = useState<LauncherEntry[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    listLaunchers().then(setLaunchers)
  }, [])

  async function handleAdd(name: string, exePath: string) {
    const created = await addLauncher(name, exePath)
    setLaunchers((current) => [...current, created])
  }

  async function handleRemove(launcher: LauncherEntry) {
    await removeLauncher(launcher.id)
    setLaunchers((current) => current.filter((entry) => entry.id !== launcher.id))
  }

  function handleLaunch(launcher: LauncherEntry) {
    launchApp(launcher.exePath)
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="mb-6 text-xl font-semibold">LaunchHub</h1>

      <LauncherGrid
        launchers={launchers}
        onLaunch={handleLaunch}
        onRemove={handleRemove}
        onAddClick={() => setIsFormOpen(true)}
      />

      <AddLauncherForm open={isFormOpen} onOpenChange={setIsFormOpen} onSubmit={handleAdd} />
    </main>
  )
}

export default App
