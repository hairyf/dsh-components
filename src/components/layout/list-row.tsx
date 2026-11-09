import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered verbatim from the official sheets:
 * - @deepseek-ai/dsh-client-ui-tool / ToolRow.module.css: .root, .summary,
 *   .summarySuffix, .bodyWrap, .errorSummary
 * - @deepseek-ai/dsh-client-ui-primitives / DisclosureRow.module.css: .header,
 *   .row, .leading, .title
 * - @deepseek-ai/dsh-client-ui-tool / ToolDetails.module.css: .badge, and the
 *   .previous/.unchanged muted tone
 */
const CSS = `.root {
  flex-direction: column;
  display: flex;
}

.header {
  display: flex;
  align-items: center;
  min-width: 0;
}

.header[data-has-accessory] {
  gap: 8px;
}

.header[data-has-accessory] .row {
  flex: 0 1 auto;
}

.row {
  flex: 1 1 auto;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  height: calc(24px + var(--dsh-content-font-delta, 0px));
  min-width: 0;
  color: var(--dsw-alias-label-tertiary);
  transition: color 100ms ease;
}

.row[data-expandable] {
  cursor: pointer;
}

@media (hover: hover) {
  .row:hover {
    color: var(--dsw-alias-label-secondary);
  }
}

.leading {
  position: relative;
  flex: none;
  width: calc(16px + var(--dsh-content-font-delta, 0px));
  height: calc(16px + var(--dsh-content-font-delta, 0px));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
}

.leading svg:not([data-state]) {
  width: calc(14px + var(--dsh-content-font-delta, 0px));
  height: calc(14px + var(--dsh-content-font-delta, 0px));
}

.title {
  flex: none;
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: calc(24px + var(--dsh-content-font-delta, 0px));
  color: inherit;
}

.summary {
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  font-size: var(--dsh-content-font-size-secondary,13px);
  line-height: calc(24px + var(--dsh-content-font-delta,0px));
  flex: auto;
  overflow: hidden;
}

.summarySuffix {
  white-space: nowrap;
  font-size: var(--dsh-content-font-size-secondary,13px);
  line-height: calc(24px + var(--dsh-content-font-delta,0px));
  flex: none;
  margin-left: 4px;
}

.bodyWrap {
  flex-direction: column;
  display: flex;
}

.errorSummary {
  color: var(--dsw-alias-state-error-primary);
}

.previous,
.unchanged {
  color: var(--dsw-alias-label-tertiary);
}

.badge {
  color: var(--dsw-alias-label-caption);
  flex: none;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  display: inline-flex;
}

.badge:before {
  content: "";
  corner-shape: round;
  background: currentColor;
  border-radius: 50%;
  width: 5px;
  height: 5px;
}
`

/** Props for {@link ListRow}. */
export interface ListRowProps {
  /** Leading glyph slot. */
  leading?: React.ReactNode
  /** Primary row title. */
  title: React.ReactNode
  /** Muted summary after the title; truncates first. */
  summary?: React.ReactNode
  /** Trailing slot outside the row's activation target. */
  trailing?: React.ReactNode
  /** Small status badge after the title. */
  badge?: React.ReactNode
  /** Tone applied to the summary: default, error, or muted. */
  tone?: 'default' | 'error' | 'muted'
  /** Whether the row reveals its children. */
  expandable?: boolean
  /** Open state, meaningful only with expandable. */
  expanded?: boolean
  /** Called when the reader toggles an expandable row. */
  onExpandedChange?: (expanded: boolean) => void
  /** Revealed body. */
  children?: React.ReactNode
}

/**
 * Render one list row with its leading, title, summary, badge and trailing slots.
 * @param props - row content, tone, and controlled expansion.
 * @returns The row, plus its body while expanded.
 */
export function ListRow(props: ListRowProps): React.JSX.Element {
  const { leading, title, summary, trailing, badge, tone = 'default', expandable = false, expanded = false, onExpandedChange, children } = props
  const s = useStyle('list-row', CSS)
  const toggle = (): void => {
    onExpandedChange?.(!expanded)
  }
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Enter' && event.key !== ' ')
      return
    event.preventDefault()
    toggle()
  }
  const toneClass = tone === 'error'
    ? s.errorSummary
    : tone === 'muted'
      ? s.unchanged
      : undefined
  return (
    <div className={s.root}>
      <div
        className={s.header}
        data-has-accessory={trailing === undefined
          ? undefined
          : true}
      >
        <div
          className={s.row}
          data-expandable={expandable || undefined}
          role={expandable ? 'button' : undefined}
          tabIndex={expandable ? 0 : undefined}
          aria-expanded={expandable ? expanded : undefined}
          onClick={expandable ? toggle : undefined}
          onKeyDown={expandable ? onKeyDown : undefined}
        >
          {leading === undefined
            ? null
            : <span className={s.leading}>{leading}</span>}
          <span className={s.title}>{title}</span>
          {badge === undefined
            ? null
            : <span className={s.badge}>{badge}</span>}
          {summary === undefined
            ? null
            : <span className={cx(s.summary, toneClass)}>{summary}</span>}
        </div>
        {trailing === undefined
          ? null
          : <span className={s.summarySuffix}>{trailing}</span>}
      </div>
      {expandable && expanded
        ? <div className={s.bodyWrap}>{children}</div>
        : null}
    </div>
  )
}
