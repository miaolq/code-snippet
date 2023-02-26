type ConstructParams = { storage: Storage; namespace?: string }

class Store {
  storage: Storage
  namespace: string

  constructor({ storage, namespace }: ConstructParams) {
    this.storage = storage
    this.namespace = namespace || ''
  }

  _namespaceKey = (key: string): string => {
    return key + this.namespace
  }

  _expiredKey = (key: string): string => {
    return key + this.namespace + '__expiration'
  }

  get = (key: string): unknown => {
    if (this._hasExpired(key)) {
      return null
    }

    let val = this.storage.getItem(this._namespaceKey(key))
    if (val === null) {
      return val
    }

    try {
      val = JSON.parse(val)
    } catch (e) {
      // val is string instead of a JSON serialized string
    }
    return val
  }

  set = (key: string, val: Parameters<typeof JSON.stringify>[0], expiration?: number): void => {
    this.storage.setItem(this._namespaceKey(key), JSON.stringify(val))
    expiration && this.storage.setItem(this._expiredKey(key), JSON.stringify(expiration))
  }

  remove = (key: string): void => {
    this.storage.removeItem(this._namespaceKey(key))
    this.storage.removeItem(this._expiredKey(key))
  }

  clearAll = (): void => {
    this.storage.clear()
  }

  _hasExpired = (key: string): boolean => {
    const expiredKey = this._expiredKey(key)
    const val = this.storage.getItem(expiredKey)
    const expired = val ? Date.now() > JSON.parse(val) : false
    if (expired) {
      this.remove(key)
    }
    return expired
  }
}

export default Store
