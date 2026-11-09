import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-tool / ToolDetails.module.css:
 * .root, .fields, .field, .item, .empty and the .badge tones.
 */
const CSS = `.root {
  border: .5px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-alias-markdown-code-block);
  color: var(--dsw-alias-label-secondary);
  font: var(--dsw-font-xs-13);
  overflow: hidden;
}

.fields {
  margin: 0;
}

.field {
  grid-template-columns: 5.5em minmax(0,1fr);
  gap: 12px;
  display: grid;
}

.field dt {
  color: var(--dsw-alias-label-caption);
}

.field dd {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin: 0;
}

.item,
.empty {
  margin: 0;
  padding: 10px 14px;
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

.badge[data-tone=info] {
  color: var(--dsw-alias-state-business-primary);
}

.badge[data-tone=success] {
  color: var(--dsw-alias-state-success-primary);
}

.badge[data-tone=warning] {
  color: var(--dsw-alias-state-warn-primary);
}

.badge[data-tone=error] {
  color: var(--dsw-alias-state-error-primary);
}
`

/** One label/value pair in a {@link DescriptionList}. */
export interface DescriptionItem {
  /** Stable key for the pair. */
  key: string
  /** Definition term. */
  label: React.ReactNode
  /** Definition body. */
  value?: React.ReactNode
  /** Optional badge shown after the value. */
  badge?: React.ReactNode
  /** Badge tone; default uses the caption color. */
  tone?: 'default' | 'info' | 'success' | 'warning' | 'error'
}

/** Props for {@link DescriptionList}. */
export interface DescriptionListProps {
  /** Pairs in reading order. */
  items: readonly DescriptionItem[]
  /** Arrange the pairs into this many grid columns. */
  columns?: number
  /** Copy shown when there are no items. */
  empty?: React.ReactNode
}

/**
 * Render label/value pairs in a framed list.
 * @param props - pairs, optional column count, and empty copy.
 * @returns The list, or null when it is empty and has no empty copy.
 */
export function DescriptionList(props: DescriptionListProps): React.JSX.Element | null {
  const { items, columns, empty } = props
  const s = useStyle('description-list', CSS)
  if (items.length === 0 && empty === undefined)
    return null
  const fieldsStyle: React.CSSProperties | undefined = columns === undefined
    ? undefined
    : {
        display: 'grid',
        gridTemplateColumns: `repeat(${String(columns)}, minmax(0, 1fr))`,
      }
  return (
    <div className={s.root}>
      {items.length === 0
        ? <p className={s.empty}>{empty}</p>
        : (
            <dl className={s.fields} style={fieldsStyle}>
              {items.map(item => (
                <div key={item.key} className={cx(s.item, s.field)}>
                  <dt>{item.label}</dt>
                  <dd>
                    {item.value}
                    {item.badge === undefined
                      ? null
                      : (
                          <>
                            {' '}
                            <span
                              className={s.badge}
                              data-tone={item.tone === undefined || item.tone === 'default'
                                ? undefined
                                : item.tone}
                            >
                              {item.badge}
                            </span>
                          </>
                        )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
    </div>
  )
}
