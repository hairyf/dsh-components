import type * as React from 'react'
import { forwardRef } from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/Input.module.css */
.wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 8px;
  border: 0.5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-md);
  background: var(--dsw-alias-bg-layer-1);
}

.wrap:focus-within {
  border-color: var(--dsw-alias-state-business-primary);
}

.icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  color: var(--dsw-alias-label-tertiary);
}

.input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  line-height: 22px;
  color: var(--dsw-alias-label-primary);
}

.input::placeholder {
  color: var(--dsw-alias-label-dimmed);
}
`

/** Props for {@link Input}: every native input attribute plus the leading-icon slot. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional 16px leading icon node. */
  icon?: React.ReactNode
}

/**
 * Render a text input with an optional leading icon.
 * Controlled and uncontrolled use are both native: pass `value` or `defaultValue`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>((
  { icon, className, ...rest },
  ref,
) => {
  const s = useStyle('input', CSS)
  return (
    <span className={cx(s.wrap, className)}>
      {icon != null && <span className={s.icon}>{icon}</span>}
      <input ref={ref} className={s.input} {...rest} />
    </span>
  )
})
