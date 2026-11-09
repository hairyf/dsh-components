import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered verbatim from @deepseek-ai/dsh-client-ui-theme /
 * FontSizeRow.module.css: the row, its text column, the title and description
 * lines, and the control slot.
 */
const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-theme/lib/FontSizeRow.module.css */
.row {
  border-bottom: .5px solid var(--dsw-alias-border-l2);
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  display: flex;
}

.rowText {
  flex-direction: column;
  flex: 1;
  gap: 4px;
  min-width: 0;
  padding-right: 48px;
  display: flex;
}

@media (width<=767px) {
  html:not([data-windows-titlebar]):not([data-platform=darwin]) .row:not(.stacked) .rowText {
    padding-right: 16px;
  }
  .stacked {
    flex-direction: column;
    align-items: stretch;
  }
  .stacked .rowText {
    flex: none;
    padding-right: 0;
  }
}

.title {
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
}

.desc {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
}

.control {
  align-items: center;
  gap: 8px;
  display: inline-flex;
}
`

/** Props of {@link SettingsRow}. */
export interface SettingsRowProps {
  /** Primary line of the row. */
  readonly title: React.ReactNode
  /** Secondary muted line under the title. */
  readonly description?: React.ReactNode
  /** The control on the right; it owns its own value and events. */
  readonly children?: React.ReactNode
  /** Put the control under the text and stretch both to the full row width. */
  readonly stacked?: boolean
  /** Announce the row as unavailable and make its control inoperable. */
  readonly disabled?: boolean
  /** Extra class for layout placement. */
  readonly className?: string
}

/**
 * One settings row: title and description on the left, a control on the right.
 *
 * The row is a layout, never a value owner: the control arrives as children and
 * keeps its own controlled props. Disabling the row makes the control inert, so
 * nothing inside it can be focused or operated.
 * @param props - row copy, control slot and its availability.
 * @returns the row element.
 */
export function SettingsRow(props: SettingsRowProps): React.JSX.Element {
  const { title, description, children, stacked = false, disabled = false, className } = props
  const s = useStyle('settings-row', CSS)
  return (
    <div
      className={cx(s.row, stacked && s.stacked, className)}
      aria-disabled={disabled || undefined}
    >
      <div className={s.rowText}>
        <div className={s.title}>{title}</div>
        {description !== undefined && <div className={s.desc}>{description}</div>}
      </div>
      {children !== undefined && (
        <div className={s.control} inert={disabled}>
          {children}
        </div>
      )}
    </div>
  )
}
