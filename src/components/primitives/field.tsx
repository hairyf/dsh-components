import type * as React from 'react'
import { IconInfoOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useId, useState } from 'react'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-primitives / fields.module.css (verbatim).
 */
const CSS = `/* Settings form fields: label, control, override badge, and hint. */

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
}

.field + .field {
  border-top: 0.5px solid var(--dsw-alias-border-l2);
}

.head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary);
}

.labelGroup {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.labelGroup > .label {
  flex: 0 1 auto;
}

.helpButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: var(--dsw-radius-sm);
  background: none;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
}

.helpButton[aria-expanded='true'] {
  background: var(--dsw-alias-bg-layer-4);
  color: var(--dsw-alias-label-secondary);
}

@media (hover: hover) {
  .helpButton:hover {
    background: var(--dsw-alias-bg-layer-4);
    color: var(--dsw-alias-label-secondary);
  }
}

.helpButton:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 1px;
}

.help {
  padding: 10px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--dsw-alias-label-secondary);
}

.help > p {
  margin: 0;
}

.help > p + p {
  margin-top: 8px;
}

.badges {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.reset {
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}

@media (hover: hover) {
  .reset:hover:not(:disabled) {
    color: var(--dsw-alias-label-primary);
  }
}

.reset:disabled {
  cursor: default;
}

.input {
  height: 34px;
  padding: 0 12px;
  border: 0.5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-md);
  background: var(--dsw-alias-bg-layer-3);
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary);
}

.input:focus-visible {
  outline: none;
  border-color: var(--dsw-alias-state-business-primary);
}

.input:disabled {
  color: var(--dsw-alias-label-tertiary);
  cursor: default;
}

.input[aria-invalid='true'] {
  border-color: var(--dsw-alias-state-error-primary);
}

.invalid {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-state-error-primary);
}

.hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary);
}
`

/** Props for {@link Field}. */
export interface FieldProps {
  /** Visible field label. */
  label: React.ReactNode
  /** The control the label describes; it owns its own value and events. */
  children?: React.ReactNode
  /** Id of that control, so the label activates it. */
  htmlFor?: string
  /** Help text revealed by the help button. */
  help?: React.ReactNode
  /** Accessible name of the help button and region. */
  helpLabel?: string
  /** Badges shown at the end of the label row. */
  badges?: React.ReactNode
  /** Clear action for the field's value; renders the reset button when present. */
  onReset?: () => void
  /** Visible label of the reset action. */
  resetLabel?: string
  /** Mark the field unavailable and disable its clear action. */
  disabled?: boolean
  /** Extra class for layout placement. */
  className?: string
}

/**
 * Render one form field: its label, the control it describes, optional help,
 * badges and reset.
 *
 * The field never owns the control's value: the control arrives as children and
 * keeps its own controlled props. The help text toggles in place and the reset
 * action sits at the end of the label row.
 */
export function Field({
  label,
  children,
  htmlFor,
  help,
  helpLabel,
  badges,
  onReset,
  resetLabel,
  disabled = false,
  className,
}: FieldProps): React.JSX.Element {
  const s = useStyle('field', CSS)
  const helpId = useId()
  const [helpOpen, setHelpOpen] = useState(false)
  const resolvedHelpLabel = helpLabel ?? 'Help'
  const hasBadges = badges !== undefined || onReset !== undefined
  return (
    <div className={cx(s.field, className)} aria-disabled={disabled || undefined}>
      <div className={s.head}>
        <div className={s.labelGroup}>
          <label className={s.label} htmlFor={htmlFor}>
            {label}
          </label>
          {help !== undefined && (
            <button
              type="button"
              className={s.helpButton}
              aria-label={resolvedHelpLabel}
              aria-expanded={helpOpen}
              aria-controls={helpId}
              onClick={() => {
                setHelpOpen(current => !current)
              }}
            >
              <IconInfoOutlineRegular size={12} />
            </button>
          )}
        </div>
        {hasBadges && (
          <span className={s.badges}>
            {badges}
            {onReset !== undefined && (
              <button type="button" className={s.reset} disabled={disabled} onClick={onReset}>
                {resetLabel ?? 'Reset'}
              </button>
            )}
          </span>
        )}
      </div>
      {children}
      {help !== undefined && helpOpen && (
        <div id={helpId} className={s.help} role="region" aria-label={resolvedHelpLabel}>
          {help}
        </div>
      )}
    </div>
  )
}
