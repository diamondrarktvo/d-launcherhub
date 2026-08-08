import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { LauncherEntry } from "@/types/launcher";
import {
  listLaunchers,
  addLauncher,
  removeLauncher,
  launchApp,
} from "@/api/launchers";
import { LauncherGrid } from "@/components/LauncherGrid";
import { AddLauncherForm } from "@/components/AddLauncherForm";

function toErrorMessage(err: unknown, fallback: string) {
  return typeof err === "string" ? err : fallback;
}

function App() {
  const [launchers, setLaunchers] = useState<LauncherEntry[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listLaunchers().then(setLaunchers);
  }, []);

  async function handleAdd(name: string, exePath: string) {
    const created = await addLauncher(name, exePath);
    setLaunchers((current) => [...current, created]);
  }

  async function handleRemove(launcher: LauncherEntry) {
    try {
      await removeLauncher(launcher.id);
      setLaunchers((current) =>
        current.filter((entry) => entry.id !== launcher.id),
      );
    } catch (err) {
      setError(toErrorMessage(err, "Failed to remove launcher."));
    }
  }

  async function handleLaunch(launcher: LauncherEntry) {
    try {
      await launchApp(launcher.exePath);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to launch application."));
    }
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="mb-6 text-xl font-semibold">The Launcher</h1>

      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="shrink-0 rounded-sm p-0.5 hover:opacity-70"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </button>
        </div>
      )}

      <LauncherGrid
        launchers={launchers}
        onLaunch={handleLaunch}
        onRemove={handleRemove}
        onAddClick={() => setIsFormOpen(true)}
      />

      <AddLauncherForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAdd}
      />
    </main>
  );
}

export default App;
