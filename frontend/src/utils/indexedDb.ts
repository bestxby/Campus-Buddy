export class IndexedDBHelper {
  private dbName: string
  private dbVersion: number
  private storeName: string
  private db: IDBDatabase | null = null
  private fallbackStore = new Map<string, any>()
  private useFallback = false

  constructor(dbName = 'CampusBuddyDB', dbVersion = 1, storeName = 'keyValueStore') {
    this.dbName = dbName
    this.dbVersion = dbVersion
    this.storeName = storeName
    if (typeof indexedDB === 'undefined') {
      this.useFallback = true
    }
  }

  private init(): Promise<IDBDatabase> {
    if (this.useFallback) return Promise.reject(new Error('IndexedDB not supported (using in-memory fallback)'))
    if (this.db) return Promise.resolve(this.db)
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.dbVersion)
        request.onerror = () => {
          this.useFallback = true
          reject(request.error)
        }
        request.onsuccess = () => {
          this.db = request.result
          resolve(request.result)
        }
        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName)
          }
        }
      } catch (err) {
        this.useFallback = true
        reject(err)
      }
    })
  }

  public async get<T>(key: string): Promise<T | null> {
    if (this.useFallback) {
      return (this.fallbackStore.get(key) as T) ?? null
    }
    try {
      const db = await this.init()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.get(key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result !== undefined ? request.result : null)
      })
    } catch {
      return (this.fallbackStore.get(key) as T) ?? null
    }
  }

  public async set<T>(key: string, value: T): Promise<void> {
    if (this.useFallback) {
      this.fallbackStore.set(key, value)
      return
    }
    try {
      const db = await this.init()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.put(value, key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch {
      this.fallbackStore.set(key, value)
    }
  }

  public async remove(key: string): Promise<void> {
    if (this.useFallback) {
      this.fallbackStore.delete(key)
      return
    }
    try {
      const db = await this.init()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.delete(key)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    } catch {
      this.fallbackStore.delete(key)
    }
  }

  // Helper method for testing to reset/clear the in-memory fallback
  public clearFallback(): void {
    this.fallbackStore.clear()
  }
}

export const graphDb = new IndexedDBHelper('CampusBuddyGraphDB', 1, 'graphStore')
