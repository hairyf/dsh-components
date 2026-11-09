import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'
import { StateDot } from './state-dot'

const CSS = `/* recovered verbatim from the official loading sheet */
.loading {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  color: var(--dsw-alias-label-secondary);
  font-family: var(--dsw-font,sans-serif);
  font-size: var(--dsh-content-font-size,14px);
  text-align: center;
  white-space: normal;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 24px;
  line-height: 1.5;
  display: flex;
}

.inline {
  vertical-align: middle;
  flex-direction: row;
  gap: 8px;
  width: auto;
  height: auto;
  padding: 0;
  display: inline-flex;
}
`

/** Props for {@link Spinner}. */
export interface SpinnerProps {
  /** 'sm' is the inline 14px form, 'md' the 28px block form with its label. */
  readonly size?: 'sm' | 'md'
  /** Accessible status copy; the block form also shows it under the indicator. */
  readonly label?: string
  /** Extra class for placement. */
  readonly className?: string
}

/**
 * Render an indeterminate loading indicator.
 * @param props - form and status copy.
 * @returns the status element.
 */
export function Spinner(props: SpinnerProps): React.JSX.Element {
  const { size = 'md', label = '加载中', className } = props
  const s = useStyle('spinner', CSS)
  const inline = size === 'sm'
  return (
    <span className={cx(s.loading, inline && s.inline, className)} role="status" aria-label={label}>
      <StateDot state="ongoing" size={inline ? 14 : 28} />
      {inline
        ? null
        : <span>{label}</span>}
    </span>
  )
}
