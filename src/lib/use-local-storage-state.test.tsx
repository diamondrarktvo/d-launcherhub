import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { useLocalStorageState } from "@/lib/use-local-storage-state"

type Mode = "a" | "b"
const isMode = (value: string): value is Mode => value === "a" || value === "b"

describe("useLocalStorageState", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("falls back to the default value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorageState("key", "a" as Mode, isMode))
    expect(result.current[0]).toBe("a")
  })

  it("reads a previously stored valid value", () => {
    localStorage.setItem("key", "b")
    const { result } = renderHook(() => useLocalStorageState("key", "a" as Mode, isMode))
    expect(result.current[0]).toBe("b")
  })

  it("falls back to the default when the stored value is invalid", () => {
    localStorage.setItem("key", "not-a-mode")
    const { result } = renderHook(() => useLocalStorageState("key", "a" as Mode, isMode))
    expect(result.current[0]).toBe("a")
  })

  it("persists updates to localStorage", () => {
    const { result } = renderHook(() => useLocalStorageState("key", "a" as Mode, isMode))

    act(() => {
      result.current[1]("b")
    })

    expect(result.current[0]).toBe("b")
    expect(localStorage.getItem("key")).toBe("b")
  })
})
