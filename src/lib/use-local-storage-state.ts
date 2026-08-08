import { useEffect, useState } from "react"

export function useLocalStorageState<T extends string>(
  key: string,
  defaultValue: T,
  isValid: (value: string) => value is T,
) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored !== null && isValid(stored) ? stored : defaultValue
  })

  useEffect(() => {
    localStorage.setItem(key, value)
  }, [key, value])

  return [value, setValue] as const
}
