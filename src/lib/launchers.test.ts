import { describe, expect, it } from "vitest"
import { filterAndSortLaunchers } from "@/lib/launchers"
import type { LauncherEntry } from "@/types/launcher"

function launcher(overrides: Partial<LauncherEntry>): LauncherEntry {
  return {
    id: "id",
    name: "name",
    exePath: "C:\\app.exe",
    ...overrides,
  }
}

describe("filterAndSortLaunchers", () => {
  const launchers = [
    launcher({ id: "1", name: "Steam", lastLaunchedAt: 100 }),
    launcher({ id: "2", name: "Epic Games", lastLaunchedAt: 300 }),
    launcher({ id: "3", name: "Discord", lastLaunchedAt: undefined }),
  ]

  it("returns launchers unchanged in manual mode with no search", () => {
    expect(filterAndSortLaunchers(launchers, "", "manual")).toEqual(launchers)
  })

  it("filters by name, case-insensitively, trimming whitespace", () => {
    const result = filterAndSortLaunchers(launchers, "  steam  ", "manual")
    expect(result.map((l) => l.id)).toEqual(["1"])
  })

  it("sorts by most recently launched first when in recent mode", () => {
    const result = filterAndSortLaunchers(launchers, "", "recent")
    expect(result.map((l) => l.id)).toEqual(["2", "1", "3"])
  })

  it("treats launchers never launched as least recent", () => {
    const result = filterAndSortLaunchers(launchers, "", "recent")
    expect(result[result.length - 1]?.id).toBe("3")
  })

  it("combines search and recent sort", () => {
    const result = filterAndSortLaunchers(launchers, "e", "recent")
    expect(result.map((l) => l.id)).toEqual(["2", "1"])
  })
})
