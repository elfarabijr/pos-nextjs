"use client"

import { useState, useEffect, useCallback } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface UseSupabaseRealtimeOptions<T> {
  initialData?: T[]
  enabled?: boolean
}

export function useSupabaseRealtime<T>(
  fetchFunction: () => Promise<T[]>,
  subscribeFunction: (callback: (payload: any) => void) => RealtimeChannel,
  options: UseSupabaseRealtimeOptions<T> = {},
) {
  const { initialData = [], enabled = true } = options

  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    if (!enabled) return

    try {
      setLoading(true)
      setError(null)
      const result = await fetchFunction()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, enabled])

  useEffect(() => {
    if (!enabled) return

    // Initial fetch
    refetch()

    // Set up real-time subscription
    const channel = subscribeFunction((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      setData((currentData) => {
        switch (eventType) {
          case "INSERT":
            return [...currentData, newRecord]
          case "UPDATE":
            return currentData.map((item) => ((item as any).id === newRecord.id ? newRecord : item))
          case "DELETE":
            return currentData.filter((item) => (item as any).id !== oldRecord.id)
          default:
            return currentData
        }
      })
    })

    return () => {
      channel.unsubscribe()
    }
  }, [subscribeFunction, refetch, enabled])

  return {
    data,
    loading,
    error,
    refetch,
  }
}
