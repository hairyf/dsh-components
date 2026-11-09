import type * as React from 'react'
import { useState } from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/Checkbox.module.css */
.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  line-height: 20px;
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
}

.checkbox input {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--dsw-alias-brand-primary);
  cursor: inherit;
}

.checkbox input:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 2px;
}

.checkbox:has(input:disabled) {
  cursor: default;
  opacity: 0.5;
}
`

/**
 * Props for {@link Checkbox}. Passing `checked` makes the control fully
 * controlled; otherwise it keeps its own state starting at `defaultChecked`.
 */
export interface CheckboxProps {
  /** Current checked state; omit for an uncontrolled checkbox. */
  checked?: boolean
  /** Initial state of an uncontrolled checkbox. */
  defaultChecked?: boolean
  /** Receives the requested checked state. */
  onChange?: (next: boolean) => void
  /** Localized visible and accessible label. */
  label: string
  /** Whether the control refuses changes. */
  disabled?: boolean
  /** Optional localized hover text. */
  title?: string
  /** Extra class for the label's placement. */
  className?: string
}

/**
 * Render a labeled checkbox with native keyboard and form semantics.
 */
export function Checkbox({
  checked,
  defaultChecked = false,
  onChange,
  label,
  disabled = false,
  title,
  className,
}: CheckboxProps): React.JSX.Element {
  const s = useStyle('checkbox', CSS)
  const [uncontrolled, setUncontrolled] = useState(defaultChecked)
  const current = checked ?? uncontrolled
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const next = event.target.checked
    if (checked === undefined)
      setUncontrolled(next)
    onChange?.(next)
  }
  return (
    <label className={cx(s.checkbox, className)} title={title}>
      <input type="checkbox" checked={current} disabled={disabled} onChange={handleChange} />
      <span>{label}</span>
    </label>
  )
}
