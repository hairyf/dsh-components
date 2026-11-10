import type * as React from 'react'
import { StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import { useStyle } from '../../lib/style'

/**
 * Recovered verbatim from the official sheets:
 * - @deepseek-ai/dsh-client-ui-conversation / TodoPanel.module.css: .list,
 *   .item, .glyph, .content
 * - @deepseek-ai/dsh-client-ui-sidebar-files / FileTree.module.css: the .note
 *   tone used for the empty label
 */
const CSS = `.list {
  flex-direction: column;
  gap: 8px;
  max-height: 180px;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  overflow-y: auto;
}

.item {
  min-width: 0;
  color: var(--dsw-alias-label-secondary);
  align-items: center;
  gap: 10px;
  font-size: 13px;
  line-height: 20px;
  display: flex;
}

.glyph {
  flex: none;
  place-items: center;
  width: 16px;
  height: 16px;
  display: grid;
}

.content {
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
}

.note {
  color: var(--dsw-alias-label-tertiary);
  margin: 0;
  padding: 3px 10px;
  font-size: 12px;
}
`

/** One entry in a {@link Checklist}. */
export interface ChecklistItem {
  /** Stable key for the entry. */
  id: string
  /** Visible text. */
  label: React.ReactNode
  /** Lifecycle state drawn by the marker. */
  status: 'done' | 'active' | 'pending'
}

/** Props for {@link Checklist}. */
export interface ChecklistProps {
  /** Entries in reading order. */
  items: readonly ChecklistItem[]
  /** Copy shown when there are no entries. */
  emptyLabel?: React.ReactNode
}

/**
 * Map a checklist status to the shared state marker.
 * @param status - done, active, or pending.
 * @returns the marker state.
 */
function markerState(status: ChecklistItem['status']): 'done' | 'ongoing' | 'idle' {
  switch (status) {
    case 'done': return 'done'
    case 'active': return 'ongoing'
    case 'pending': return 'idle'
  }
}

/**
 * Render a list of entries with a status marker.
 * @param props - entries and empty copy.
 * @returns The checklist.
 */
export function Checklist(props: ChecklistProps): React.JSX.Element {
  const { items, emptyLabel } = props
  const s = useStyle('checklist', CSS)
  if (items.length === 0) {
    return emptyLabel === undefined
      ? <ul className={s.list} />
      : <p className={s.note}>{emptyLabel}</p>
  }
  return (
    <ul className={s.list}>
      {items.map(item => (
        <li key={item.id} className={s.item}>
          <span className={s.glyph}>
            <StateDot state={markerState(item.status)} />
          </span>
          <span className={s.content}>{item.label}</span>
        </li>
      ))}
    </ul>
  )
}
