import type { CodeToolbarLabels } from '@deepseek-ai/dsh-client-ui-primitives'
/* Recovered from @deepseek-ai/dsh-client-ui-primitives lib/DiffBlock.module.css; the CSS below is the official sheet, verbatim. */
import type * as React from 'react'
import { useClipboardCopy } from '@deepseek-ai/dsh-client-ui-primitives'
import { useCallback, useMemo, useState } from 'react'
import { cx, useStyle } from '../../lib/style'
import { FoldToggle } from '../internal/fold-toggle'
import { headTailCap } from '../internal/head-tail-cap'
import { CodeToolbar, useCodeCardStyle } from './code-block'

const CSS = `.block {
  overflow: hidden;
}

.body {
  display: grid;
  grid-template-columns: minmax(max-content, 1fr);
  padding: 6px 0 20px;
  font: var(--dsw-font-markdown-code-block);
  overflow-x: auto;
}

.line {
  box-sizing: border-box;
  min-height: 1lh;
  padding: 0 22px;
  white-space: pre;
}

.block[data-code-wrap='true'] .body {
  grid-template-columns: minmax(0, 1fr);
}

.block[data-code-wrap='true'] .line {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.path {
  color: var(--dsw-alias-label-secondary);
  font-weight: 500;
}

.gap {
  color: var(--dsw-alias-label-tertiary);
}

.del::before {
  content: '- ';
}

.del {
  color: var(--dsw-alias-state-error-primary);
  background: var(--dsw-alias-code-diff-deleted);
  box-shadow: inset 3px 0 0 var(--dsw-alias-state-error-primary);
}

.add::before {
  content: '+ ';
}

.add {
  color: var(--dsw-alias-state-success-primary);
  background: var(--dsw-alias-code-diff-added);
  box-shadow: inset 3px 0 0 var(--dsw-alias-state-success-primary);
}

.context {
  color: var(--dsw-alias-label-secondary);
}

.context::before {
  content: '  ';
}

.expand {
  display: block;
  width: 100%;
  padding: 0 22px;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

@media (hover: hover) {
  .expand:hover {
    color: var(--dsw-alias-label-secondary);
  }
}
`

/** Output lines shown before the height cap collapses the middle. */
export const DEFAULT_DIFF_MAX_LINES = 16
/** Bound the synchronous edit-graph search; one replacement consumes two edits. */
export const MAX_DIFF_EDIT_LENGTH = 256
/** Context lines structuredPatch keeps around each changed region. */
const DIFF_CONTEXT_LINES = 3

/** One file change in the form {@link DiffBlock} renders. */
export interface DiffHunk {
  /** The changed file's path, drawn verbatim as the hunk's header. */
  readonly path: string
  /** Prior content including context, or null when no prior content is available. */
  readonly oldText: string | null
  /** Content after the change, including any shared context. */
  readonly newText: string
}

/** Localized chrome for {@link DiffBlock}. */
export interface DiffBlockLabels extends CodeToolbarLabels {
  /** Copy-button idle label. */
  readonly copy: string
  /** Copy-button label during the post-copy confirmation window. */
  readonly copied: string
  /** Collapse-toggle aria label while expanded. */
  readonly collapseAria: string
  /** Expand-toggle aria label while capped, given the hidden line count. */
  readonly expandAria: (hidden: number) => string
  /** Collapse-toggle text while expanded. */
  readonly collapse: string
  /** Expand-toggle text while capped, given the hidden line count. */
  readonly expand: (hidden: number) => string
}

/** Props for {@link DiffBlock}. */
export interface DiffBlockProps {
  /** One entry per applied hunk, in file order; empty renders nothing. */
  readonly diffs: readonly DiffHunk[]
  /** Localized chrome supplied by the owning render site. */
  readonly labels: DiffBlockLabels
  /** Height cap in body lines before the middle collapses (default {@link DEFAULT_DIFF_MAX_LINES}). */
  readonly maxLines?: number | undefined
  /** Extra class merged onto the wrapper. */
  readonly className?: string | undefined
}

type DiffOpKind = 'equal' | 'del' | 'add'

interface DiffOp {
  readonly kind: DiffOpKind
  readonly text: string
}

interface RenderHunk {
  readonly lines: readonly string[]
}

type DiffRowKind = 'path' | 'gap' | 'del' | 'add' | 'context'

interface DiffRow {
  readonly kind: DiffRowKind
  readonly text: string
}

/**
 * Split a side's text into its content lines. Empty text is zero lines, and a
 * single trailing newline is a line terminator rather than an extra empty
 * line; an interior blank line survives.
 * @param text - the removed or added side's text.
 * @returns the content lines, without the terminating newline.
 */
function contentLines(text: string): string[] {
  if (text === '')
    return []
  return (text.endsWith('\n')
    ? text.slice(0, -1)
    : text).split('\n')
}

/**
 * Pick the furthest-reaching x for one diagonal of the edit graph.
 * @param v - the frontier array, indexed by diagonal plus offset.
 * @param offset - the array offset of diagonal zero.
 * @param depth - the current edit distance.
 * @param k - the diagonal under test.
 * @returns the furthest x reachable on that diagonal.
 */
function furthestX(v: Int32Array, offset: number, depth: number, k: number): number {
  if (k === -depth || (k !== depth && v[offset + k - 1] < v[offset + k + 1]))
    return v[offset + k + 1]
  return v[offset + k - 1] + 1
}

/**
 * Count the identical lines shared from one position on both sides.
 * @param a - prior lines.
 * @param b - next lines.
 * @param x - the start offset in a.
 * @param y - the start offset in b.
 * @returns the run length.
 */
function snakeLength(a: readonly string[], b: readonly string[], x: number, y: number): number {
  let run = 0
  while (x + run < a.length && y + run < b.length && a[x + run] === b[y + run])
    run += 1
  return run
}

/**
 * Bound synchronous Myers diff; returns undefined once the minimal edit
 * distance exceeds the cap.
 * @param a - prior lines.
 * @param b - next lines.
 * @param maxEdits - maximum edit distance to explore.
 * @returns the edit script, or undefined when the cap is exceeded.
 */
function myersDiff(a: readonly string[], b: readonly string[], maxEdits: number): DiffOp[] | undefined {
  const n = a.length
  const m = b.length
  const offset = n + m
  const v = new Int32Array(2 * offset + 3)
  const trace: Int32Array[] = []
  const limit = Math.min(offset, maxEdits)
  for (let depth = 0; depth <= limit; depth += 1) {
    trace.push(v.slice())
    for (let k = -depth; k <= depth; k += 2) {
      const startX = furthestX(v, offset, depth, k)
      const x = startX + snakeLength(a, b, startX, startX - k)
      const y = x - k
      v[offset + k] = x
      if (x >= n && y >= m)
        return backtrack(trace, a, b, depth)
    }
  }
  return undefined
}

/**
 * Walk the saved furthest-reaching paths back into an edit script.
 * @param trace - per-depth snapshots of the frontier array.
 * @param a - prior lines.
 * @param b - next lines.
 * @param depth - final edit distance.
 * @returns the edit script in forward order.
 */
function backtrack(trace: readonly Int32Array[], a: readonly string[], b: readonly string[], depth: number): DiffOp[] {
  const ops: DiffOp[] = []
  const offset = a.length + b.length
  let x = a.length
  let y = b.length
  for (let current = depth; current > 0; current -= 1) {
    const v = trace[current]
    const k = x - y
    const prevK = k === -current || (k !== current && v[offset + k - 1] < v[offset + k + 1])
      ? k + 1
      : k - 1
    const prevX = v[offset + prevK]
    const prevY = prevX - prevK
    while (x > prevX && y > prevY) {
      ops.push({ kind: 'equal', text: a[x - 1] })
      x -= 1
      y -= 1
    }
    if (x === prevX) {
      ops.push({ kind: 'add', text: b[y - 1] })
      y -= 1
    }
    else {
      ops.push({ kind: 'del', text: a[x - 1] })
      x -= 1
    }
  }
  while (x > 0 && y > 0) {
    ops.push({ kind: 'equal', text: a[x - 1] })
    x -= 1
    y -= 1
  }
  while (x > 0) {
    ops.push({ kind: 'del', text: a[x - 1] })
    x -= 1
  }
  while (y > 0) {
    ops.push({ kind: 'add', text: b[y - 1] })
    y -= 1
  }
  ops.reverse()
  return ops
}

/**
 * Index the offsets of every non-context operation.
 * @param ops - the edit script.
 * @returns ascending offsets of the changed operations.
 */
function changedOffsets(ops: readonly DiffOp[]): number[] {
  const changed: number[] = []
  for (const [index, op] of ops.entries()) {
    if (op.kind !== 'equal')
      changed.push(index)
  }
  return changed
}

/**
 * Group changed offsets into hunk ranges separated by more than the context window.
 * @param changed - ascending changed offsets.
 * @returns each hunk's inclusive offset range.
 */
function hunkRanges(changed: readonly number[]): { readonly first: number, readonly last: number }[] {
  const ranges: { first: number, last: number }[] = []
  for (const offset of changed) {
    const current = ranges[ranges.length - 1]
    if (current !== undefined && offset - current.last <= 2 * DIFF_CONTEXT_LINES + 1) {
      ranges[ranges.length - 1] = { first: current.first, last: offset }
      continue
    }
    ranges.push({ first: offset, last: offset })
  }
  return ranges
}

/**
 * Render one operation as a patch line with its +/-, or two spaces as context.
 * @param op - the operation to draw.
 * @returns the patch line.
 */
function patchLine(op: DiffOp): string {
  if (op.kind === 'equal')
    return ` ${op.text}`
  return `${op.kind === 'del'
    ? '-'
    : '+'}${op.text}`
}

/**
 * Derive exact local patches, or one whole-fragment replacement when the edit
 * search exceeds {@link MAX_DIFF_EDIT_LENGTH}.
 * @param diff - the hunks to split.
 * @returns the render hunks.
 */
function localHunks(diff: DiffHunk): RenderHunk[] {
  const oldLines = contentLines(diff.oldText ?? '')
  const newLines = contentLines(diff.newText)
  const ops = myersDiff(oldLines, newLines, MAX_DIFF_EDIT_LENGTH)
  if (ops === undefined) {
    return [
      {
        lines: [
          ...oldLines.map(line => `-${line}`),
          ...newLines.map(line => `+${line}`),
        ],
      },
    ]
  }
  const changed = changedOffsets(ops)
  if (changed.length === 0)
    return []
  return hunkRanges(changed).map(range => ({
    lines: ops
      .slice(Math.max(0, range.first - DIFF_CONTEXT_LINES), Math.min(ops.length, range.last + DIFF_CONTEXT_LINES + 1))
      .map(patchLine),
  }))
}

/**
 * Count displayed additions and deletions. Exact patches exclude shared
 * context; comparisons exceeding the edit limit count both complete fragments
 * as replaced. Text follows {@link contentLines}'s terminator rule.
 * @param diffs - the hunks to count.
 * @returns the added and removed line totals.
 */
export function diffTotals(diffs: readonly DiffHunk[]): { added: number, removed: number } {
  let added = 0
  let removed = 0
  for (const diff of diffs) {
    for (const hunk of localHunks(diff)) {
      for (const line of hunk.lines) {
        if (line.startsWith('+'))
          added += 1
        if (line.startsWith('-'))
          removed += 1
      }
    }
  }
  return { added, removed }
}

/**
 * Draw one patch line as a diff row.
 * @param line - the patch line, prefixed with its marker.
 * @returns the rendered row.
 */
function lineRow(line: string): DiffRow {
  if (line.startsWith('-')) {
    return {
      kind: 'del',
      text: line.slice(1),
    }
  }
  if (line.startsWith('+')) {
    return {
      kind: 'add',
      text: line.slice(1),
    }
  }
  return {
    kind: 'context',
    text: line.slice(1),
  }
}

/**
 * Flatten one file's patches into rows, opening a gap before later fragments.
 * @param diff - the file's hunks.
 * @param prevPath - the path drawn immediately before these rows.
 * @returns the rows for this file.
 */
function rowsForDiff(diff: DiffHunk, prevPath: string | undefined): DiffRow[] {
  const rows: DiffRow[] = [
    diff.path === prevPath
      ? { kind: 'gap', text: '⋯' }
      : { kind: 'path', text: diff.path },
  ]
  for (const [index, hunk] of localHunks(diff).entries()) {
    if (index > 0)
      rows.push({ kind: 'gap', text: '⋯' })
    for (const line of hunk.lines)
      rows.push(lineRow(line))
  }
  return rows
}

/**
 * Flatten local patches into rows. A path header opens each new file; a
 * gap marker separates consecutive same-file fragments and distant patches.
 * @param diffs - the hunks to render.
 * @returns the body rows.
 */
function buildRows(diffs: readonly DiffHunk[]): DiffRow[] {
  const rows: DiffRow[] = []
  let prevPath: string | undefined
  for (const diff of diffs) {
    rows.push(...rowsForDiff(diff, prevPath))
    prevPath = diff.path
  }
  return rows
}

/**
 * Render one row as its copyable patch line.
 * @param row - the flattened row.
 * @returns the plain-text line, prefixed for removed, added and context rows.
 */
function copyLine(row: DiffRow): string {
  switch (row.kind) {
    case 'del': return `- ${row.text}`
    case 'add': return `+ ${row.text}`
    case 'context': return `  ${row.text}`
    case 'path':
    case 'gap': return row.text
  }
}

/**
 * Copy the full diff, including folded rows.
 * @param rows - the flattened body rows.
 * @returns the diff as plain text.
 */
function copyText(rows: readonly DiffRow[]): string {
  return rows.map(copyLine).join('\n')
}

const ROW_CLASS: Record<DiffRowKind, string> = {
  path: 'path',
  del: 'del',
  add: 'add',
  context: 'context',
  gap: 'gap',
}

/**
 * Render a file mutation as an inline diff surface.
 * @returns the diff block element, or null when there is nothing to draw.
 */
export function DiffBlock({ diffs, labels, maxLines = DEFAULT_DIFF_MAX_LINES, className }: DiffBlockProps): React.JSX.Element | null {
  const s = useStyle('diff-block', CSS)
  const card = useCodeCardStyle()
  const rows = useMemo(() => buildRows(diffs), [diffs])
  const [expanded, setExpanded] = useState(false)
  const [wrapped, setWrapped] = useState(false)
  const { copied, onCopy } = useClipboardCopy(copyText(rows))
  const onToggle = useCallback(() => {
    setExpanded(value => !value)
  }, [])
  if (rows.length === 0)
    return null
  const { hidden, capped, headLines, tailLines } = headTailCap(rows.length, maxLines, expanded)
  const head = capped
    ? rows.slice(0, headLines)
    : rows
  const tail = capped
    ? rows.slice(rows.length - tailLines)
    : []
  const renderRow = (row: DiffRow, rowKey: string): React.JSX.Element => (
    <div key={rowKey} className={cx(s.line, s[ROW_CLASS[row.kind]])}>{row.text}</div>
  )
  return (
    <div className={cx(card.card, s.block, className)} data-diff="" data-code-wrap={wrapped}>
      <CodeToolbar
        labels={labels}
        copyLabel={labels.copy}
        copiedLabel={labels.copied}
        copied={copied}
        wrapped={wrapped}
        onCopy={onCopy}
        onWrap={() => {
          setWrapped(value => !value)
        }}
      />
      <div className={s.body}>
        {head.map((row, index) => renderRow(row, `head-${String(index)}`))}
        {hidden > 0 && (
          <FoldToggle
            className={s.expand}
            expanded={expanded}
            hidden={hidden}
            labels={labels}
            onToggle={onToggle}
          />
        )}
        {tail.map((row, index) => renderRow(row, `tail-${String(index)}`))}
      </div>
    </div>
  )
}
