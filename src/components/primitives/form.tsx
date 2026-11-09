import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-primitives / SettingsForm.module.css (verbatim).
 */
const CSS = `/* Settings form: the controls a page shows under a plugin's title, and the save that writes them. */

.form {
  display: flex;
  flex-direction: column;
}

.readOnly,
.unavailable {
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary);
}

.footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
}

.failed {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-error);
}

.save {
  appearance: none;
  border: 1px solid transparent;
  border-radius: var(--dsw-radius-md);
  padding: 5px 14px;
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  cursor: pointer;
  background: var(--dsw-alias-label-primary);
  color: var(--dsw-alias-bg-layer-3);
}

.save:disabled {
  opacity: 0.4;
  cursor: default;
}

.save:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 1px;
}
`

/** Props for {@link Form}. */
export interface FormProps {
  /** Controls the form saves. */
  children?: React.ReactNode
  /** Runs after the native submit event is prevented. */
  onSubmit: () => void
  /** Visible label of the save button. */
  submitLabel: string
  /** Block the save while a submission is being applied. */
  submitting?: boolean
  /** Block the save independently of submitting. */
  disabled?: boolean
  /** Failure message shown next to the save action. */
  failed?: React.ReactNode
  /** Notice shown above the controls when they cannot be written. */
  readOnlyNote?: React.ReactNode
  /** Replaces the form when its controls cannot be shown at all. */
  unavailableNote?: React.ReactNode
  /** Extra content in the save row, rendered before the save button. */
  footerExtra?: React.ReactNode
  /** Extra class for layout placement. */
  className?: string
}

/**
 * Render a form whose single save action submits its controls.
 *
 * Saving stays disabled while submitting or disabled is set, and the native
 * submit is always prevented so the caller decides what saving does.
 */
export function Form({
  children,
  onSubmit,
  submitLabel,
  submitting = false,
  disabled = false,
  failed,
  readOnlyNote,
  unavailableNote,
  footerExtra,
  className,
}: FormProps): React.JSX.Element {
  const s = useStyle('form', CSS)
  if (unavailableNote !== undefined) {
    return (
      <p className={cx(s.unavailable, className)} role="status">
        {unavailableNote}
      </p>
    )
  }
  const blocked = disabled || submitting
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (blocked)
      return
    onSubmit()
  }
  return (
    <form className={cx(s.form, className)} onSubmit={handleSubmit}>
      {readOnlyNote !== undefined && (
        <p className={s.readOnly} role="status">
          {readOnlyNote}
        </p>
      )}
      {children}
      <div className={s.footer}>
        {failed !== undefined && (
          <p className={s.failed} role="status">
            {failed}
          </p>
        )}
        {footerExtra}
        <button type="submit" className={s.save} disabled={blocked} aria-busy={submitting || undefined}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
