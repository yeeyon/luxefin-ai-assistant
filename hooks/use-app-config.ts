"use client"

import { useCallback, useEffect, useState } from "react"
import type { PublicAppConfig } from "@/lib/settings/types"

export function useAppConfig() {
  const [config, setConfig] = useState<PublicAppConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/config", { cache: "no-store" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load configuration")
      }

      setConfig(data.config ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load configuration")
      setConfig(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { config, loading, error, refetch: load }
}
