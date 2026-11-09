/**
 * Gallery stand-in for `@deepseek-ai/dsh-client-store`.
 *
 * The DSH client injects that module at runtime, so it cannot be resolved from
 * this repository. The primitives barrel imports `createSnapshotStore` at module
 * scope and uses three members: `get`, `set` and `subscribe(id, listener)`.
 * This is a single-slot store with those members, which is enough for the
 * gallery: nothing in it writes through the real settings store.
 */

/** A subscriber notified after the stored snapshot changes. */
export type SnapshotListener = () => void

/** The store the primitives read through `useSyncExternalStore`. */
export interface SnapshotStore<T> {
  /** Current snapshot. */
  get: () => T
  /** Replace the snapshot and notify subscribers. */
  set: (next: T) => void
  /** Subscribe a listener to changes of one entry id. */
  subscribe: (id: string, listener: SnapshotListener) => () => void
}

/**
 * Create a single-slot snapshot store.
 * @param initial - the first snapshot.
 * @returns the store.
 */
export function createSnapshotStore<T>(initial: T): SnapshotStore<T> {
  let current = initial
  const listeners = new Set<SnapshotListener>()
  return {
    get: () => current,
    set: (next) => {
      current = next
      for (const listener of [...listeners])
        listener()
    },
    subscribe: (_id, listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
