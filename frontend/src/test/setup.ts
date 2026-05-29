import { vi } from 'vitest'
import { webcrypto } from 'node:crypto'

// Polyfill webcrypto if not present
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true
  })
}

// Polyfill localStorage if missing or incomplete
class LocalStorageMock implements Storage {
  private store: Record<string, string> = {}

  get length(): number {
    return Object.keys(this.store).length
  }

  clear(): void {
    Object.keys(this.store).forEach(key => {
      delete (this as any)[key]
    })
    this.store = {}
  }

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store)
    return keys[index] !== undefined ? keys[index] : null
  }

  removeItem(key: string): void {
    delete this.store[key]
    delete (this as any)[key]
  }

  setItem(key: string, value: string): void {
    const strValue = String(value)
    this.store[key] = strValue
    ;(this as any)[key] = strValue
  }

  [name: string]: any
}

// Assign to globalThis
const mockStorage = new LocalStorageMock()
Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
  configurable: true
})
