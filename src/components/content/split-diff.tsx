import type * as React from 'react'
import { useMemo, useRef } from 'react'
import { cx, useStyle } from '../../lib/style'
import { headTailCap } from '../internal/head-tail-cap'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-deliverables / FileDiff.module.css (verbatim).
 */
const CSS = `/* @deepseek-ai/dsh-client-ui-deliverables / FileDiff.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.root {
  --diff-empty-fill: color-mix(in srgb, var(--dsw-alias-interactive-bg-hover) 50%, transparent);
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
  color: var(--dsw-alias-label-primary);
  flex-direction: column;
  display: flex;
}

.header {
  box-sizing: border-box;
  border-bottom: .5px solid var(--dsw-alias-border-l3);
  flex: none;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 6px 0 8px;
  display: flex;
}

.status {
  color: var(--dsw-alias-label-secondary);
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 16px;
  font-size: 13px;
  display: flex;
}

.body {
  min-height: 0;
  font: var(--dsw-font-markdown-code-block);
  flex-direction: column;
  flex: auto;
  padding: 8px 0 16px;
  display: flex;
  overflow: auto;
}

.columns {
  flex: auto;
  grid-template-columns: minmax(0,1fr) minmax(0,1fr);
  min-height: 0;
  display: grid;
}

.column,
.body[data-review-view=unified]:not([data-review-wrap]) {
  grid-template-columns: minmax(max-content,100%);
  align-content: start;
  display: grid;
}

.column {
  overscroll-behavior: none;
  min-width: 0;
  overflow-x: scroll;
}

.column+.column {
  border-left: .5px solid var(--dsw-alias-border-l3);
}

.sideLine {
  box-sizing: border-box;
  white-space: pre;
  grid-template-columns: 3.5em max-content;
  width: max-content;
  min-width: 100%;
  min-height: 22px;
  line-height: 22px;
  display: grid;
}

.note {
  font: var(--dsw-font-xs-13);
  color: var(--dsw-alias-label-tertiary);
  margin: 0;
  padding: 4px 16px 8px;
}

.hunk {
  margin-bottom: 8px;
}

.hunkHeader {
  color: var(--dsw-alias-label-tertiary);
  white-space: pre;
  padding: 4px 16px;
}

.line {
  box-sizing: border-box;
  white-space: pre;
  grid-template-columns: 3.5em 3.5em 1.2em minmax(0,1fr);
  min-height: 22px;
  line-height: 22px;
  display: grid;
}

.splitLine {
  white-space: pre;
  grid-template-columns: minmax(0,1fr) minmax(0,1fr);
  min-height: 22px;
  line-height: 22px;
  display: grid;
}

.cell {
  box-sizing: border-box;
  grid-template-columns: 3.5em minmax(0,1fr);
  min-width: 0;
  display: grid;
}

.cell+.cell {
  border-left: .5px solid var(--dsw-alias-border-l3);
}

.number {
  color: var(--dsw-alias-label-tertiary);
  text-align: right;
  user-select: none;
  padding-right: 8px;
}

.sign {
  text-align: center;
  user-select: none;
}

.text {
  padding-right: 16px;
}

.body[data-review-wrap] .line,
.body[data-review-wrap] .splitLine {
  white-space: pre-wrap;
}

.body[data-review-wrap] .text {
  overflow-wrap: anywhere;
}

.add {
  --diff-gutter-fill: var(--dsw-alias-file-diff-added-gutter);
  --diff-marker: var(--dsw-alias-file-diff-added-marker);
  background: var(--dsw-alias-file-diff-added-bg);
}

.del {
  --diff-gutter-fill: var(--dsw-alias-file-diff-deleted-gutter);
  --diff-marker: var(--dsw-alias-file-diff-deleted-marker);
  background: var(--dsw-alias-file-diff-deleted-bg);
}

.add .number,
.del .number {
  background: var(--diff-gutter-fill);
  color: var(--diff-marker);
}

.add .number:first-child,
.del .number:first-child {
  box-shadow: inset 3px 0 0 var(--diff-marker);
}

.add .sign,
.del .sign {
  color: var(--diff-marker);
}

.context .text {
  color: var(--dsw-alias-label-secondary);
}

.empty {
  background: var(--diff-empty-fill);
}`

/** The paired view's column sides, before side first. */
const COLUMN_SIDES = ['left', 'right'] as const

/** One column side of the paired view. */
type ColumnSide = typeof COLUMN_SIDES[number]

/** Scroll axes the two columns keep in step. */
const SCROLL_AXES = ['scrollLeft', 'scrollTop'] as const

/** One column's last scroll position on each axis. */
interface ColumnOffset {
  scrollLeft: number
  scrollTop: number
}

/** How one line differs from its predecessor. */
export type SplitDiffLineKind = 'add' | 'del' | 'context'

/** One side of a paired diff row. */
export interface SplitDiffSide {
  /** One-based line number on this side. */
  readonly number: number
  /** The line's text, without its patch marker. */
  readonly text: string
  /** Whether the line was added, removed, or shared by both sides. */
  readonly kind: SplitDiffLineKind
}

/** One row of a hunk and the side or sides it fills. */
export interface SplitDiffLine {
  /** The before side; absent when the row only exists after the change. */
  readonly left?: SplitDiffSide
  /** The after side; absent when the row only existed before the change. */
  readonly right?: SplitDiffSide
}

/** One contiguous changed region. */
export interface SplitDiffHunk {
  /** Header drawn above the rows, e.g. `@@ -1,3 +1,4 @@`. */
  readonly header: string
  /** The rows, in file order. */
  readonly lines: readonly SplitDiffLine[]
}

/** Props for {@link SplitDiff}. */
export interface SplitDiffProps {
  /** File name drawn at the start of the header row. */
  readonly filename?: string
  /** Status drawn at the end of the header row. */
  readonly status?: React.ReactNode
  /** The changed regions, in file order. */
  readonly hunks: readonly SplitDiffHunk[]
  /** Draw the paired columns instead of the default unified view. */
  readonly split?: boolean
  /** Placeholder drawn when there are no rows. */
  readonly empty?: React.ReactNode
  /** Row count before the middle folds; uncapped by default. */
  readonly maxLines?: number
  /** Extra class merged onto the wrapper. */
  readonly className?: string
}

/** One paired row tagged with the hunk it belongs to. */
interface PairedRow {
  readonly hunk: number
  readonly header: string
  readonly left: SplitDiffSide | undefined
  readonly right: SplitDiffSide | undefined
}

/** One unified row tagged with the hunk it belongs to. */
interface UnifiedRow {
  readonly hunk: number
  readonly header: string
  readonly kind: SplitDiffLineKind
  readonly oldNumber: number | undefined
  readonly newNumber: number | undefined
  readonly text: string
}

/**
 * The change a paired row reports: a removal on the left, an addition on the
 * right, otherwise a row both sides share.
 * @param row - the paired row.
 * @returns the row's change.
 */
function splitKind(row: PairedRow): SplitDiffLineKind {
  if (row.left?.kind === 'del')
    return 'del'
  return row.right?.kind === 'add'
    ? 'add'
    : 'context'
}

/**
 * Pair every hunk line with the row it fills on both sides.
 * @param hunks - the changed regions, in file order.
 * @returns one row per hunk line, tagged with its hunk.
 */
function pairedRows(hunks: readonly SplitDiffHunk[]): PairedRow[] {
  const rows: PairedRow[] = []
  for (const [hunk, entry] of hunks.entries()) {
    for (const line of entry.lines) {
      rows.push({
        hunk,
        header: entry.header,
        left: line.left,
        right: line.right,
      })
    }
  }
  return rows
}

/**
 * Flatten the paired rows into the unified view's one-line-per-change rows.
 * A pair that is context on both sides keeps both numbers on one row; any
 * other pair draws one row per side that it fills.
 * @param hunks - the changed regions, in file order.
 * @returns the unified rows, tagged with their hunk.
 */
function unifiedRows(hunks: readonly SplitDiffHunk[]): UnifiedRow[] {
  const rows: UnifiedRow[] = []
  for (const [hunk, entry] of hunks.entries()) {
    for (const line of entry.lines) {
      const { left, right } = line
      if (left?.kind === 'context' && right?.kind === 'context') {
        rows.push({
          hunk,
          header: entry.header,
          kind: 'context',
          oldNumber: left.number,
          newNumber: right.number,
          text: left.text,
        })
        continue
      }
      if (left !== undefined) {
        rows.push({
          hunk,
          header: entry.header,
          kind: left.kind,
          oldNumber: left.number,
          newNumber: undefined,
          text: left.text,
        })
      }
      if (right !== undefined) {
        rows.push({
          hunk,
          header: entry.header,
          kind: right.kind,
          oldNumber: undefined,
          newNumber: right.number,
          text: right.text,
        })
      }
    }
  }
  return rows
}

/**
 * Group consecutive rows that belong to one hunk, so each group draws one
 * header above its rows.
 * @param rows - rows tagged with their hunk ordinal.
 * @returns the rows in hunk runs, in input order.
 */
function hunkRuns<T extends { readonly hunk: number }>(rows: readonly T[]): T[][] {
  const runs: T[][] = []
  let current: T[] | undefined
  for (const row of rows) {
    if (current === undefined || current[0].hunk !== row.hunk) {
      current = []
      runs.push(current)
    }
    current.push(row)
  }
  return runs
}

/**
 * Render a file comparison as paired columns or as one unified line per change.
 *
 * Numbering and the sign column follow the official renderer: the unified view
 * prints both line numbers and the added or removed glyph, while the paired
 * view prints each side's number in its own column. The sheet declares no
 * button reset, so a capped body keeps its head and tail and marks the fold
 * with the muted note line instead of a control the caller would have to label.
 * @param props - the hunks, the layout, the header slots, and the row cap.
 * @returns The comparison, or null when there is nothing to draw.
 */
export function SplitDiff(props: SplitDiffProps): React.JSX.Element | null {
  const { filename, status, hunks, split = false, empty, maxLines = Infinity, className } = props
  const s = useStyle('split-diff', CSS)
  const paired = useMemo(() => pairedRows(hunks), [hunks])
  const unified = useMemo(() => (split
    ? []
    : unifiedRows(hunks)), [hunks, split])
  const columns = useRef<Record<ColumnSide, HTMLDivElement | null>>({ left: null, right: null })
  const offsets = useRef<Record<ColumnSide, ColumnOffset>>({
    left: { scrollLeft: 0, scrollTop: 0 },
    right: { scrollLeft: 0, scrollTop: 0 },
  })
  const showHeader = filename !== undefined || status !== undefined
  if (paired.length === 0 && !showHeader && empty === undefined)
    return null
  const total = split ? paired.length : unified.length
  const { capped, headLines, tailLines } = headTailCap(total, maxLines, false)
  const pairHead = capped
    ? paired.slice(0, headLines)
    : paired
  const pairTail = capped
    ? paired.slice(paired.length - tailLines)
    : []
  const lineHead = capped
    ? unified.slice(0, headLines)
    : unified
  const lineTail = capped
    ? unified.slice(unified.length - tailLines)
    : []
  const follow = (side: ColumnSide): React.UIEventHandler<HTMLDivElement> => (event) => {
    const peer = side === 'left'
      ? 'right'
      : 'left'
    const other = columns.current[peer]
    if (other === null)
      return
    const from = event.currentTarget
    for (const axis of SCROLL_AXES) {
      const value = from[axis]
      if (offsets.current[side][axis] === value)
        continue
      offsets.current[side][axis] = value
      other[axis] = value
      offsets.current[peer][axis] = other[axis]
    }
  }
  const unifiedSections = (rows: readonly UnifiedRow[], prefix: string): React.JSX.Element[] =>
    hunkRuns(rows).map((run, index) => (
      <section className={s.hunk} key={`${prefix}-${String(index)}`}>
        <div className={s.hunkHeader} data-diff-hunk-header="">{run[0].header}</div>
        {run.map((row, at) => (
          <div key={at} className={cx(s.line, s[row.kind])} data-diff-line={row.kind}>
            <span className={s.number}>{row.oldNumber ?? ''}</span>
            <span className={s.number}>{row.newNumber ?? ''}</span>
            <span className={s.sign}>
              {row.kind === 'add'
                ? '+'
                : row.kind === 'del'
                  ? '-'
                  : ' '}
            </span>
            <span className={s.text}>{row.text}</span>
          </div>
        ))}
      </section>
    ))
  const splitSections = (rows: readonly PairedRow[], side: ColumnSide, prefix: string): React.JSX.Element[] =>
    hunkRuns(rows).map((run, index) => (
      <section className={s.hunk} key={`${prefix}-${String(index)}`}>
        <div className={s.hunkHeader} data-diff-hunk-header="">{run[0].header}</div>
        {run.map((row, at) => {
          const cell = row[side]
          return (
            <div
              key={at}
              className={cx(s.sideLine, cell === undefined
                ? s.empty
                : s[cell.kind])}
              data-diff-line={splitKind(row)}
            >
              <span className={s.number}>{cell?.number ?? ''}</span>
              <span className={s.text}>{cell?.text ?? ''}</span>
            </div>
          )
        })}
      </section>
    ))
  return (
    <div className={cx(s.root, className)}>
      {showHeader && (
        <div className={s.header}>
          {filename === undefined
            ? null
            : <span>{filename}</span>}
          {status !== undefined && <span style={{ marginInlineStart: 'auto' }}>{status}</span>}
        </div>
      )}
      {paired.length === 0
        ? empty !== undefined && <p className={s.status}>{empty}</p>
        : (
            <div className={s.body} data-review-view={split ? 'split' : 'unified'}>
              {split
                ? (
                    <div className={s.columns}>
                      {COLUMN_SIDES.map(side => (
                        <div
                          key={side}
                          className={s.column}
                          data-diff-side={side}
                          ref={(element) => {
                            columns.current[side] = element
                          }}
                          onScroll={follow(side)}
                        >
                          {splitSections(pairHead, side, `${side}-head`)}
                          {capped && <p className={s.note} data-diff-truncated="">⋯</p>}
                          {splitSections(pairTail, side, `${side}-tail`)}
                        </div>
                      ))}
                    </div>
                  )
                : (
                    <>
                      {unifiedSections(lineHead, 'head')}
                      {capped && <p className={s.note} data-diff-truncated="">⋯</p>}
                      {unifiedSections(lineTail, 'tail')}
                    </>
                  )}
            </div>
          )}
    </div>
  )
}
