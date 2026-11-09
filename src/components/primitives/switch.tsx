import type * as React from 'react'
import { useState } from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/Switch.module.css */
/* The on/off appearance keys off aria-checked rather than a parallel class, so
 * the visual state cannot disagree with the state assistive technology reads.
 *
 * The capsule track and circular thumb opt out of the global superellipse. */
.switch {
  box-sizing: border-box;
  position: relative;
  flex: 0 0 auto;
  width: 36px;
  height: 20px;
  padding: 2px;
  border: 0;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsw-alias-border-l3);
  cursor: pointer;
}

.switch[aria-checked='true'] {
  background: var(--dsw-alias-brand-primary);
}

.switch:disabled {
  cursor: default;
  opacity: 0.5;
}

.switch:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 2px;
}

.thumb {
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  corner-shape: round;
  background: var(--dsw-alias-label-primary-foreground);
  transition: transform 120ms ease;
}

.switch[aria-checked='false'] .thumb {
  background: var(--dsw-alias-switch-thumb);
}

.switch[aria-checked='true'] .thumb {
  transform: translateX(16px);
}
`

/**
 * Props for {@link Switch}. Passing `checked` makes the control fully
 * controlled, matching the official render sites; omit it for an uncontrolled
 * toggle that keeps its own state starting at `defaultChecked`.
 */
export interface SwitchProps {
  /** The current state of a controlled switch. */
  checked?: boolean
  /** Initial state of an uncontrolled switch. */
  defaultChecked?: boolean
  /** Called with the state the click asks for. */
  onChange?: (next: boolean) => void
  /** Localized accessible name, owned by the render site. */
  label: string
  /** Whether the control refuses input; owners also set it while a write is in flight. */
  disabled?: boolean
  /** Localized hover text, typically why the toggle is locked. */
  title?: string
  /** Extra class for layout placement. */
  className?: string
}

/**
 * Render a toggle switch.
 * The visual state keys off aria-checked, so it cannot disagree with the state
 * assistive technology reads.
 */
export function Switch({
  checked,
  defaultChecked = false,
  onChange,
  label,
  disabled = false,
  title,
  className,
}: SwitchProps): React.JSX.Element {
  const s = useStyle('switch', CSS)
  const [uncontrolled, setUncontrolled] = useState(defaultChecked)
  const current = checked ?? uncontrolled
  return (
    <button
      type="button"
      role="switch"
      aria-checked={current}
      aria-label={label}
      title={title}
      disabled={disabled}
      className={cx(s.switch, className)}
      onClick={() => {
        const next = !current
        if (checked === undefined)
          setUncontrolled(next)
        onChange?.(next)
      }}
    >
      <span className={s.thumb} />
    </button>
  )
}
