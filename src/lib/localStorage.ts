import { Migrations, LocalStorage } from './types'

export function hasLocalStorage(): boolean {
  try {
    // https://gist.github.com/paulirish/5558557
    const localStorage = window.localStorage
    const val = 'val'
    localStorage.setItem(val, val)
    localStorage.removeItem(val)
    return true
  } catch (e) {
    return false
  }
}

export function getLocalStorage(): LocalStorage {
  return hasLocalStorage()
    ? window.localStorage
    : {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null
      }
}

export function migrateStorage<T>(key: string, migrations: Migrations<T>) {
  let version = 1
  const localStorage = getLocalStorage()
  const dataString = localStorage.getItem(key)

  if (dataString) {
    const data = JSON.parse(dataString as string)

    if (data.storage && data.storage.version) {
      version = parseInt(data.storage.version, 10)
    }
    let nextVersion = version + 1

    while (migrations[nextVersion]) {
      const newData = migrations[nextVersion](data)
      localStorage.setItem(
        key,
        JSON.stringify({
          ...(newData as Object),
          storage: { version: nextVersion }
        })
      )
      nextVersion++
    }
  }
}
