import { offlineStorage } from "./offline-storage"
import { syncManager } from "./sync-manager"

// Offline-first API wrapper
class OfflineAPI {
  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    const isOnline = navigator.onLine

    if (isOnline) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            ...options.headers,
          },
        })

        if (response.ok) {
          const data = await response.json()

          // Cache successful responses
          if (options.method === "GET" || !options.method) {
            const entity = this.extractEntityFromUrl(url)
            if (Array.isArray(data)) {
              for (const item of data) {
                await offlineStorage.put(entity, item)
              }
            } else if (data.id) {
              await offlineStorage.put(entity, data)
            }
          }

          return data
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.warn("Online request failed, falling back to offline:", error)
        // Fall through to offline handling
      }
    }

    // Handle offline or failed online requests
    return this.handleOfflineRequest(url, options)
  }

  private async handleOfflineRequest(url: string, options: RequestInit): Promise<any> {
    const method = options.method || "GET"
    const entity = this.extractEntityFromUrl(url)
    const entityId = this.extractIdFromUrl(url)

    switch (method) {
      case "GET":
        if (entityId) {
          return await offlineStorage.get(entity, entityId)
        } else {
          return await offlineStorage.getAll(entity)
        }

      case "POST":
        const newData = {
          ...JSON.parse(options.body as string),
          id: this.generateId(),
          createdAt: new Date().toISOString(),
          synced: false,
        }

        await offlineStorage.put(entity, newData)
        await syncManager.queueOperation({
          type: "CREATE",
          entity,
          data: newData,
        })

        return newData

      case "PUT":
        const updateData = {
          ...JSON.parse(options.body as string),
          updatedAt: new Date().toISOString(),
          synced: false,
        }

        await offlineStorage.put(entity, updateData)
        await syncManager.queueOperation({
          type: "UPDATE",
          entity,
          data: updateData,
        })

        return updateData

      case "DELETE":
        await offlineStorage.delete(entity, entityId!)
        await syncManager.queueOperation({
          type: "DELETE",
          entity,
          data: { id: entityId },
        })

        return { success: true }

      default:
        throw new Error(`Unsupported method for offline operation: ${method}`)
    }
  }

  private extractEntityFromUrl(url: string): string {
    const match = url.match(/\/api\/([^/]+)/)
    return match ? match[1] : "unknown"
  }

  private extractIdFromUrl(url: string): string | null {
    const match = url.match(/\/api\/[^/]+\/([^/]+)/)
    return match ? match[1] : null
  }

  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Public API methods
  async getProducts() {
    return this.makeRequest("/api/products")
  }

  async getProduct(id: string) {
    return this.makeRequest(`/api/products/${id}`)
  }

  async createProduct(product: any) {
    return this.makeRequest("/api/products", {
      method: "POST",
      body: JSON.stringify(product),
    })
  }

  async updateProduct(id: string, product: any) {
    return this.makeRequest(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    })
  }

  async deleteProduct(id: string) {
    return this.makeRequest(`/api/products/${id}`, {
      method: "DELETE",
    })
  }

  async getCategories() {
    return this.makeRequest("/api/categories")
  }

  async createCategory(category: any) {
    return this.makeRequest("/api/categories", {
      method: "POST",
      body: JSON.stringify(category),
    })
  }

  async updateCategory(id: string, category: any) {
    return this.makeRequest(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(category),
    })
  }

  async deleteCategory(id: string) {
    return this.makeRequest(`/api/categories/${id}`, {
      method: "DELETE",
    })
  }
}

export const offlineAPI = new OfflineAPI()
