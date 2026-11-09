/**
 * Stand-in for @deepseek-ai/dsh-client-store, which the DSH runtime injects into
 * every client plugin instead of resolving it from disk. Only the surface the
 * primitives package uses is provided.
 */

/** A store whose snapshot keeps its reference until the value changes. */
export interface SnapshotStore<T> {
  getSnapshot: () => T
  set: (next: T) => void
  subscribe: (listener: () => void) => () => void
}

/**
 * Create a value store with a stable snapshot reference.
 * @param initial - the first value.
 */
export function createSnapshotStore<T>(initial: T): SnapshotStore<T> {
  let current = initial
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => current,
    set: (next) => {
      if (Object.is(next, current))
        return
      current = next
      for (const listener of listeners) listener()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
