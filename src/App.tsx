import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { LauncherEntry } from "@/types/launcher";
import type { SortMode, ViewMode } from "@/types/view";
import {
  listLaunchers,
  addLauncher,
  updateLauncher,
  removeLauncher,
  reorderLaunchers,
  launchApp,
} from "@/api/launchers";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";
import { LauncherGrid } from "@/components/LauncherGrid";
import { LauncherFormDialog } from "@/components/LauncherFormDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SplashScreen } from "@/components/SplashScreen";
import { useLocalStorageState } from "@/lib/use-local-storage-state";
import { filterAndSortLaunchers } from "@/lib/launchers";

const VIEW_MODE_STORAGE_KEY = "the-launcher:view-mode";
const SORT_MODE_STORAGE_KEY = "the-launcher:sort-mode";

function isViewMode(value: string): value is ViewMode {
  return value === "grid" || value === "list";
}

function isSortMode(value: string): value is SortMode {
  return value === "manual" || value === "recent";
}

function toErrorMessage(err: unknown, fallback: string) {
  return typeof err === "string" ? err : fallback;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [launchers, setLaunchers] = useState<LauncherEntry[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLauncher, setEditingLauncher] = useState<LauncherEntry | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<LauncherEntry | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useLocalStorageState<ViewMode>(
    VIEW_MODE_STORAGE_KEY,
    "grid",
    isViewMode,
  );
  const [sortMode, setSortMode] = useLocalStorageState<SortMode>(
    SORT_MODE_STORAGE_KEY,
    "manual",
    isSortMode,
  );

  useEffect(() => {
    listLaunchers().then(setLaunchers);
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  const visibleLaunchers = useMemo(
    () => filterAndSortLaunchers(launchers, searchQuery, sortMode),
    [launchers, searchQuery, sortMode],
  );

  function openAddForm() {
    setEditingLauncher(null);
    setIsFormOpen(true);
  }

  function openEditForm(launcher: LauncherEntry) {
    setEditingLauncher(launcher);
    setIsFormOpen(true);
  }

  async function handleFormSubmit(name: string, exePath: string) {
    if (editingLauncher) {
      const updated = await updateLauncher(editingLauncher.id, name, exePath);
      setLaunchers((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
    } else {
      const created = await addLauncher(name, exePath);
      setLaunchers((current) => [...current, created]);
    }
  }

  async function handleConfirmRemove() {
    if (!pendingRemoval) return;
    const launcher = pendingRemoval;

    try {
      await removeLauncher(launcher.id);
      setLaunchers((current) => current.filter((entry) => entry.id !== launcher.id));
    } catch (err) {
      setError(toErrorMessage(err, "Failed to remove launcher."));
    }
  }

  async function handleLaunch(launcher: LauncherEntry) {
    try {
      await launchApp(launcher.id);
      const launchedAt = Date.now();
      setLaunchers((current) =>
        current.map((entry) =>
          entry.id === launcher.id ? { ...entry, lastLaunchedAt: launchedAt } : entry,
        ),
      );
    } catch (err) {
      setError(toErrorMessage(err, "Failed to launch application."));
    }
  }

  async function handleReorder(ids: string[]) {
    const previous = launchers;
    const reordered = ids
      .map((id) => previous.find((launcher) => launcher.id === id))
      .filter((launcher): launcher is LauncherEntry => Boolean(launcher));

    setLaunchers(reordered);

    try {
      await reorderLaunchers(ids);
    } catch (err) {
      setLaunchers(previous);
      setError(toErrorMessage(err, "Failed to reorder launchers."));
    }
  }

  return (
    <main className="min-h-screen p-8">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <Header
        count={launchers.length}
        search={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

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

      {launchers.length === 0 ? (
        <EmptyState onAddClick={openAddForm} />
      ) : (
        <LauncherGrid
          launchers={visibleLaunchers}
          viewMode={viewMode}
          reorderEnabled={!isSearching && sortMode === "manual"}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
          onLaunch={handleLaunch}
          onEdit={openEditForm}
          onRemove={setPendingRemoval}
          onReorder={handleReorder}
          onAddClick={openAddForm}
        />
      )}

      <LauncherFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        launcher={editingLauncher}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => !open && setPendingRemoval(null)}
        title="Supprimer ce launcher ?"
        description={
          pendingRemoval
            ? `"${pendingRemoval.name}" sera retiré de la liste. Cette action est irréversible.`
            : ""
        }
        confirmLabel="Supprimer"
        onConfirm={handleConfirmRemove}
      />

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </main>
  );
}

export default App;
