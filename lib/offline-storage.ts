// IndexedDB wrapper for offline storage
class OfflineStorage {
  private dbName = "RetailPOS"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Products store
        if (!db.objectStoreNames.contains("products")) {
          const productStore = db.createObjectStore("products", { keyPath: "id" })
          productStore.createIndex("barcode", "barcode", { unique: false })
          productStore.createIndex("category", "category", { unique: false })
        }

        // Categories store
        if (!db.objectStoreNames.contains("categories")) {
          db.createObjectStore("categories", { keyPath: "id" })
        }

        // Orders store
        if (!db.objectStoreNames.contains("orders")) {
          const orderStore = db.createObjectStore("orders", { keyPath: "id" })
          orderStore.createIndex("timestamp", "timestamp", { unique: false })
          orderStore.createIndex("synced", "synced", { unique: false })
        }

        // Sync queue store
        if (!db.objectStoreNames.contains("syncQueue")) {
          const syncStore = db.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true })
          syncStore.createIndex("timestamp", "timestamp", { unique: false })
          syncStore.createIndex("type", "type", { unique: false })
        }
      }
    })
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async addToSyncQueue(operation: {
    type: "CREATE" | "UPDATE" | "DELETE"
    entity: string
    data: any
    timestamp: number
  }): Promise<void> {
    await this.put("syncQueue", operation)
  }

  async getSyncQueue(): Promise<any[]> {
    return this.getAll("syncQueue")
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["syncQueue"], "readwrite")
      const store = transaction.objectStore("syncQueue")
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

export const offlineStorage = new OfflineStorage()
