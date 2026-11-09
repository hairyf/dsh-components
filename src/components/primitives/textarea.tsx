import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered verbatim from the official multiline field sheet */
.detail {
  box-sizing: border-box;
  border: .5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-alias-bg-layer-1);
  width: 100%;
  min-height: 116px;
  max-height: 280px;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  field-sizing: content;
  resize: none;
  margin-top: 18px;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 22px;
  transition: border-color .12s,box-shadow .12s;
  display: block;
}

.detail::placeholder {
  color: var(--dsw-alias-label-caption);
}

.detail:focus {
  border-color: var(--dsw-alias-border-l3);
  box-shadow: 0 0 0 1px var(--dsw-alias-state-business-primary);
  outline: none;
}
`

/**
 * Error border for an invalid value.
 * The official sheet has no invalid state; this uses the colour the official
 * settings field applies to the same state.
 */
const INVALID_BORDER: React.CSSProperties = { borderColor: 'var(--dsw-alias-state-error-primary)' }

/** Props for {@link Textarea}. */
export interface TextareaProps {
  /** Current text. */
  readonly value: string
  /** Receives the next text. */
  readonly onChange: (value: string) => void
  /** Placeholder shown while empty. */
  readonly placeholder?: string
  /** Row count; omit it to let the official content sizing decide the height. */
  readonly rows?: number
  /** Whether the field cannot be edited. */
  readonly disabled?: boolean
  /** Whether the value failed validation. */
  readonly invalid?: boolean
  /** Maximum accepted length. */
  readonly maxLength?: number
  /** Extra class for placement. */
  readonly className?: string
}

/**
 * Render a controlled multiline field.
 * @param props - value, validation state and edit handler.
 * @returns the textarea.
 */
export function Textarea(props: TextareaProps): React.JSX.Element {
  const { value, onChange, placeholder, rows, disabled = false, invalid = false, maxLength, className } = props
  const s = useStyle('textarea', CSS)
  return (
    <textarea
      className={cx(s.detail, className)}
      value={value}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      maxLength={maxLength}
      aria-invalid={invalid || undefined}
      style={invalid ? INVALID_BORDER : undefined}
      onChange={(event) => { onChange(event.target.value) }}
    />
  )
}
