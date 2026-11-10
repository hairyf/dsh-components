import type * as React from 'react'
import { FileTypeIcon, IconFolderCloseRegular, IconFolderOpenRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-sidebar-files / FileTree.module.css:
 * .level, .item, .row, .action, .current, .icon, .fileIcon, .name, .hidden,
 * .note.
 */
const CSS = `.level {
  margin: 0;
  padding: 0;
  list-style: none;
}

.level .level {
  padding-left: 18px;
}

.item {
  margin: 0;
  padding: 0;
}

.row {
  border-radius: var(--dsw-radius-md);
  align-items: center;
  width: 100%;
  min-width: 0;
  display: flex;
}

.action {
  min-width: 0;
  color: inherit;
  font: inherit;
  text-align: left;
  border-radius: var(--dsw-radius-md);
  cursor: pointer;
  background: 0 0;
  border: 0;
  flex: 1;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  display: flex;
}

@media (hover:hover) {
  .row:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
  .current:hover {
    background: var(--dsw-alias-interactive-bg-active);
  }
}

.current {
  background: var(--dsw-alias-interactive-bg-active);
}

.icon {
  color: var(--dsw-alias-label-tertiary);
  flex: none;
}

.fileIcon {
  flex: none;
}

.name {
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;
  overflow: hidden;
}

.hidden {
  color: var(--dsw-alias-label-secondary);
}

.note {
  color: var(--dsw-alias-label-tertiary);
  margin: 0;
  padding: 3px 10px;
  font-size: 12px;
}
`

/** One node in a {@link Tree}. */
export interface TreeNode {
  /** Stable identity used by expansion and selection. */
  id: string
  /** Displayed name. */
  name: string
  /** Leaf or container. */
  kind: 'file' | 'directory'
  /** Nested nodes; only directories read them. */
  children?: readonly TreeNode[]
  /** Draw the row in the muted hidden tone. */
  hidden?: boolean
}

/** Props for {@link Tree}. */
export interface TreeProps {
  /** Root nodes. */
  nodes: readonly TreeNode[]
  /** Ids of the expanded directories. */
  expandedIds: readonly string[]
  /** Called with the complete next expanded set. */
  onExpandedChange: (ids: readonly string[]) => void
  /** Id of the selected file. */
  selectedId?: string
  /** Called when a file row is activated. */
  onSelect?: (id: string) => void
  /** Copy shown for an empty level. */
  emptyLabel?: React.ReactNode
}

/** Natural, case-insensitive name order, so `file2` precedes `file10`. */
const byName = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

/**
 * Order one level: directories first, then everything else, each by name.
 * @param left - first node.
 * @param right - second node.
 * @returns the official display order.
 */
function compareNodes(left: TreeNode, right: TreeNode): number {
  const group = Number(right.kind === 'directory') - Number(left.kind === 'directory')
  return group !== 0
    ? group
    : byName.compare(left.name, right.name)
}

/**
 * Render a controlled tree of files and directories.
 *
 * The caller owns the nodes and the expanded set; the tree sorts every level and
 * reports the complete next set on toggle.
 * @param props - nodes, expansion, selection, and empty copy.
 * @returns The root level.
 */
export function Tree(props: TreeProps): React.JSX.Element {
  const { nodes, expandedIds, onExpandedChange, selectedId, onSelect, emptyLabel } = props
  const s = useStyle('tree', CSS)

  const renderLevel = (items: readonly TreeNode[]): React.ReactNode => {
    if (items.length === 0) {
      return emptyLabel === undefined
        ? null
        : <li className={s.note}>{emptyLabel}</li>
    }
    return [...items].sort(compareNodes).map((node) => {
      const open = expandedIds.includes(node.id)
      const selected = node.kind === 'file' && node.id === selectedId
      const activate = (): void => {
        if (node.kind === 'directory') {
          onExpandedChange(open
            ? expandedIds.filter(id => id !== node.id)
            : [...expandedIds, node.id])
          return
        }
        onSelect?.(node.id)
      }
      return (
        <li key={node.id} className={s.item}>
          <div className={cx(s.row, selected && s.current)}>
            <button
              type="button"
              className={cx(s.action, node.hidden === true && s.hidden)}
              aria-expanded={node.kind === 'directory'
                ? open
                : undefined}
              aria-current={selected || undefined}
              onClick={activate}
            >
              {node.kind === 'directory'
                ? (open
                    ? <IconFolderOpenRegular className={s.icon} />
                    : <IconFolderCloseRegular className={s.icon} />)
                : <FileTypeIcon path={node.name} size={16} className={s.fileIcon} />}
              <span className={s.name}>{node.name}</span>
            </button>
          </div>
          {node.kind === 'directory' && open
            ? <ul className={s.level}>{renderLevel(node.children ?? [])}</ul>
            : null}
        </li>
      )
    })
  }

  return <ul className={s.level}>{renderLevel(nodes)}</ul>
}
