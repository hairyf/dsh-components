import type * as React from 'react'
import { useState } from 'react'
import { cx, useStyle } from '../../lib/style'
import { FileTypeIcon } from '../primitives/file-type-icon'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-deliverables / ChangedFiles.module.css (verbatim).
 */
const CSS = `/* @deepseek-ai/dsh-client-ui-deliverables / ChangedFiles.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.card {
  --changes-fill: var(--dsw-static-neutral-50);
  --changes-hover: var(--dsw-static-neutral-100);
  border: .5px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-alias-bg-layer-1);
  min-width: 0;
  color: var(--dsw-alias-label-primary);
  flex-direction: column;
  margin-top: 4px;
  display: flex;
  overflow: hidden;
}

.card[data-single=true] {
  border-color: var(--dsw-alias-border-l1);
}

body[data-ds-dark-theme] .card {
  --changes-fill: var(--dsw-static-neutral-850);
  --changes-hover: var(--dsw-static-neutral-800);
}

.header {
  box-sizing: border-box;
  background: var(--changes-fill);
  width: 100%;
  min-width: 0;
  height: 60px;
  color: inherit;
  font: inherit;
  text-align: left;
  border: 0;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 8px 10px;
  display: flex;
}

button.header {
  cursor: pointer;
  transition: background-color .12s;
}

button.header:focus-visible {
  background: var(--changes-hover);
}

@media (hover:hover) {
  button.header:hover:not(:disabled) {
    background: var(--changes-hover);
  }
}

button.header:focus-visible {
  box-shadow: inset 0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));
  outline: none;
}

button.header:disabled {
  cursor: progress;
}

.tile {
  box-sizing: border-box;
  border: .5px solid var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-static-neutral-00) 50%, transparent);
  border-radius: 10px;
  flex: none;
  place-items: center;
  width: 40px;
  height: 40px;
  display: grid;
}

body[data-ds-dark-theme] .tile {
  background: color-mix(in srgb, var(--dsw-static-neutral-00) 5%, transparent);
}

.titles {
  flex-direction: column;
  flex: 1;
  min-width: 0;
  display: flex;
}

.title {
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  overflow: hidden;
}

.stat {
  color: var(--dsw-alias-label-tertiary);
  font-size: 10px;
  line-height: 16px;
  display: inline-flex;
}

.statCounts {
  font-family: var(--ds-font-family-code);
  gap: 6px;
  display: inline-flex;
}

.previewHint,
.header:focus-visible .statCounts {
  display: none;
}

@media (hover:hover) {
  .header:hover .statCounts {
    display: none;
  }
}

.header:focus-visible .previewHint {
  display: inline;
}

@media (hover:hover) {
  .header:hover .previewHint {
    display: inline;
  }
}

.stat[data-error=true],
.counts[data-error=true] {
  color: var(--dsw-alias-state-error-primary);
}

.added {
  color: var(--dsw-alias-state-success-primary);
}

.deleted {
  color: var(--dsw-alias-state-error-primary);
}

.list {
  border-top: .5px solid var(--dsw-alias-border-l2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 24px;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  font-family: var(--ds-font-family-code);
  text-align: left;
  background: 0 0;
  border: 0;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 7px 18px 7px 14px;
  font-size: 11px;
  line-height: 18px;
  display: flex;
}

.row:focus-visible {
  background: var(--dsw-alias-interactive-bg-hover);
}

@media (hover:hover) {
  .row:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.row:focus-visible {
  box-shadow: inset 0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));
  outline: none;
}

.row:disabled {
  cursor: progress;
}

.path {
  min-width: 0;
  font-family: var(--dsw-font-family);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  overflow: hidden;
}

.counts {
  white-space: nowrap;
  color: var(--dsw-alias-label-tertiary);
  flex: none;
  gap: 6px;
  display: inline-flex;
}

.toggle {
  box-sizing: border-box;
  width: 100%;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  font: inherit;
  text-align: left;
  background: 0 0;
  border: 0;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 10px 18px 10px 14px;
  font-size: 12px;
  line-height: 18px;
  display: inline-flex;
}

@media (hover:hover) {
  .toggle:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.toggle svg {
  flex: none;
  width: 14px;
  height: 14px;
}

@media (pointer:coarse) {
  .row,
  .toggle {
    min-height: 44px;
  }
}

.preview {
  max-height: 100%;
  overflow: hidden;
}

.previewPath {
  min-width: 0;
  color: var(--dsw-alias-label-tertiary);
  font-family: var(--ds-font-family-code);
  white-space: nowrap;
  flex: auto;
  font-size: 12px;
  line-height: 20px;
  overflow: auto hidden;
}

.preview [data-diff-note=metadata],
.preview [data-diff-hunk-header] {
  display: none;
}`

/** Line totals grouped the way the official card prints them. */
const GROUPED = new Intl.NumberFormat('en-US')

/** One file in a {@link FileChangeCard}. */
export interface FileChange {
  /** Path drawn in the row. */
  readonly path: string
  /** Lines added in this file. */
  readonly added?: number
  /** Lines removed in this file. */
  readonly deleted?: number
}

/** Props for {@link FileChangeCard}. */
export interface FileChangeCardProps {
  /** Card title, supplied by the caller with its own wording. */
  readonly title: React.ReactNode
  /** The changed files, in display order. */
  readonly files: readonly FileChange[]
  /** Whether the file list is open (default false). */
  readonly open?: boolean
  /** Called with the next open state when the header is activated. */
  readonly onOpenChange?: (open: boolean) => void
  /** Prefix before an added count (default `+`). */
  readonly addedLabel?: string
  /** Prefix before a deleted count (default `-`). */
  readonly deletedLabel?: string
  /** Placeholder drawn in the header's stat slot when there are no files. */
  readonly empty?: React.ReactNode
  /** Content revealed under a file row when that row is activated. */
  readonly renderPreview?: (file: FileChange) => React.ReactNode
  /** Extra class merged onto the wrapper. */
  readonly className?: string
}

/**
 * Sum the line counts the files report.
 * @param files - the changed files.
 * @returns the added and deleted totals, or undefined when no file reports one.
 */
function totalsOf(files: readonly FileChange[]): { readonly added: number, readonly deleted: number } | undefined {
  let added = 0
  let deleted = 0
  let counted = false
  for (const file of files) {
    if (file.added === undefined && file.deleted === undefined)
      continue
    counted = true
    added += file.added ?? 0
    deleted += file.deleted ?? 0
  }
  return counted
    ? { added, deleted }
    : undefined
}

/**
 * Render a changed-file summary that opens its file list and each file's preview.
 *
 * The header is the only open control: it is a button when the caller handles
 * `onOpenChange` and a static row otherwise. Rows reveal their preview when the
 * caller supplies `renderPreview`, and one preview is open at a time.
 * @param props - title, files, open state, and the preview renderer.
 * @returns The card.
 */
export function FileChangeCard(props: FileChangeCardProps): React.JSX.Element {
  const {
    title,
    files,
    open = false,
    onOpenChange,
    addedLabel = '+',
    deletedLabel = '-',
    empty,
    renderPreview,
    className,
  } = props
  const s = useStyle('file-change-card', CSS)
  const [previewPath, setPreviewPath] = useState<string | null>(null)
  const totals = totalsOf(files)
  const single = files.length === 1
    ? files[0]
    : undefined
  const counts = (added: number, deleted: number): React.JSX.Element => (
    <>
      <span className={s.added}>
        {addedLabel}
        {GROUPED.format(added)}
      </span>
      <span className={s.deleted}>
        {deletedLabel}
        {GROUPED.format(deleted)}
      </span>
    </>
  )
  const stat = files.length === 0
    ? empty
    : totals === undefined
      ? undefined
      : <span className={s.statCounts}>{counts(totals.added, totals.deleted)}</span>
  const header = (
    <>
      <span className={s.tile}>
        {single === undefined
          ? <FileTypeIcon kind="code" size={20} />
          : <FileTypeIcon path={single.path} size={20} />}
      </span>
      <span className={s.titles}>
        <span className={s.title}>{title}</span>
        <span className={s.stat}>{stat}</span>
      </span>
    </>
  )
  return (
    <div className={cx(s.card, className)} data-single={files.length === 1 || undefined}>
      {onOpenChange === undefined
        ? <div className={s.header}>{header}</div>
        : (
            <button
              type="button"
              className={s.header}
              aria-expanded={open && files.length > 0}
              onClick={() => {
                onOpenChange(!open)
              }}
            >
              {header}
            </button>
          )}
      {open && files.length > 0 && (
        <ul className={s.list}>
          {files.map((file) => {
            const rowCounts = file.added === undefined && file.deleted === undefined
              ? undefined
              : counts(file.added ?? 0, file.deleted ?? 0)
            const revealed = renderPreview !== undefined && previewPath === file.path
            const row = (
              <>
                <span className={s.path}>{file.path}</span>
                <span className={s.counts}>{rowCounts}</span>
              </>
            )
            return (
              <li key={file.path}>
                {renderPreview === undefined
                  ? <div className={s.row}>{row}</div>
                  : (
                      <button
                        type="button"
                        className={s.row}
                        aria-expanded={revealed}
                        onClick={() => {
                          setPreviewPath(current => (current === file.path
                            ? null
                            : file.path))
                        }}
                      >
                        {row}
                      </button>
                    )}
                {revealed && (
                  <div className={s.preview}>
                    <div className={s.previewPath}>{file.path}</div>
                    {renderPreview(file)}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
