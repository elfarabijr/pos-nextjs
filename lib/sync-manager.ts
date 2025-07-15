import { offlineStorage } from "./offline-storage"

interface SyncOperation {
  id?: number
  type: "CREATE" | "UPDATE" | "DELETE"
  entity: string
  data: any
  timestamp: number
}

class SyncManager {
  private isOnline = navigator.onLine
  private syncInProgress = false
  private retryAttempts = 3
  private retryDelay = 1000

  constructor() {
    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true
      this.syncPendingChanges()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
    })

    // Periodic sync when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingChanges()
      }
    }, 30000) // Sync every 30 seconds
  }

  async syncPendingChanges(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return

    this.syncInProgress = true

    try {
      const pendingOperations = await offlineStorage.getSyncQueue()

      for (const operation of pendingOperations) {
        await this.processSyncOperation(operation)
      }

      // Clear sync queue after successful sync
      await offlineStorage.clearSyncQueue()

      // Pull latest data from server
      await this.pullDataFromServer()
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      this.syncInProgress = false
    }
  }

  private async processSyncOperation(operation: SyncOperation): Promise<void> {
    const { type, entity, data } = operation
    const endpoint = `/api/${entity}`

    let response: Response

    try {
      switch (type) {
        case "CREATE":
          response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify(data),
          })
          break

        case "UPDATE":
          response = await fetch(`${endpoint}/${data.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify(data),
          })
          break

        case "DELETE":
          response = await fetch(`${endpoint}/${data.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          })
          break

        default:
          throw new Error(`Unknown operation type: ${type}`)
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Update local storage with server response if needed
      if (type !== "DELETE" && response.headers.get("content-type")?.includes("application/json")) {
        const updatedData = await response.json()
        await offlineStorage.put(entity, updatedData)
      }
    } catch (error) {
      console.error(`Failed to sync ${type} operation for ${entity}:`, error)
      throw error
    }
  }

  private async pullDataFromServer(): Promise<void> {
    try {
      // Pull products
      const productsResponse = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
      if (productsResponse.ok) {
        const products = await productsResponse.json()
        for (const product of products) {
          await offlineStorage.put("products", product)
        }
      }

      // Pull categories
      const categoriesResponse = await fetch("/api/categories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
      if (categoriesResponse.ok) {
        const categories = await categoriesResponse.json()
        for (const category of categories) {
          await offlineStorage.put("categories", category)
        }
      }
    } catch (error) {
      console.error("Failed to pull data from server:", error)
    }
  }

  async queueOperation(operation: Omit<SyncOperation, "timestamp">): Promise<void> {
    await offlineStorage.addToSyncQueue({
      ...operation,
      timestamp: Date.now(),
    })

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingChanges()
    }
  }

  getOnlineStatus(): boolean {
    return this.isOnline
  }

  isSyncing(): boolean {
    return this.syncInProgress
  }
}

export const syncManager = new SyncManager()
