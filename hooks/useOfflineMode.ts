"use client"

import { useState, useEffect } from "react"
import { syncManager } from "@/lib/sync-manager"
import { offlineStorage } from "@/lib/offline-storage"

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingChanges, setPendingChanges] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check for pending changes
    const checkPendingChanges = async () => {
      try {
        const queue = await offlineStorage.getSyncQueue()
        setPendingChanges(queue.length)
      } catch (error) {
        console.error("Failed to check pending changes:", error)
      }
    }

    // Update sync status
    const updateSyncStatus = () => {
      setIsSyncing(syncManager.isSyncing())
    }

    // Check pending changes periodically
    const pendingInterval = setInterval(checkPendingChanges, 5000)
    const syncInterval = setInterval(updateSyncStatus, 1000)

    // Initial checks
    checkPendingChanges()
    updateSyncStatus()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(pendingInterval)
      clearInterval(syncInterval)
    }
  }, [])

  const forcSync = async () => {
    if (isOnline) {
      await syncManager.syncPendingChanges()
      setLastSyncTime(new Date())
    }
  }

  return {
    isOnline,
    isSyncing,
    pendingChanges,
    lastSyncTime,
    forcSync,
  }
}
