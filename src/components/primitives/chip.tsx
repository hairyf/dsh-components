import type * as React from 'react'
import { IconCloseOutlineRegular, ReferenceIconRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { cx, useStyle } from '../../lib/style'

const CHIP_CSS = `/* recovered verbatim from the official inline chip sheet */
.chip {
  max-width: 240px;
  color: var(--dsw-alias-state-business-primary);
  user-select: none;
  align-items: baseline;
  gap: 3px;
  display: inline-flex;
}

.marker {
  flex: none;
  font-weight: 500;
}

.icon {
  flex: none;
  align-self: center;
}

.label {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.invalid {
  color: var(--dsw-alias-state-error-primary);
  opacity: .7;
  text-decoration: line-through;
}
`

const INLINE_CSS = `/* the inline editor rules the official chip composes with */
.reference {
  border-radius: var(--dsw-radius-sm);
  line-height: inherit;
  vertical-align: baseline;
  color: var(--dsw-alias-state-business-primary);
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  background: 0 0;
  padding: 0 4px;
}

@media (hover:hover) {
  .reference:hover {
    background: var(--dsw-alias-state-business-tertiary);
  }
}

.openable {
  cursor: pointer;
}
`

const REMOVE_CSS = `/* recovered verbatim from the official trailing control sheet */
.marker,
.remove {
  display: grid;
  place-items: center;
  align-self: center;
  flex: none;
  width: 16px;
  height: 16px;
  padding: 0;
  color: inherit;
  user-select: none;
}

.marker {
  pointer-events: none;
}

.remove {
  border: none;
  border-radius: 50%;
  corner-shape: round;
  background: transparent;
  cursor: pointer;
}
`

/** Leading glyph family; neutral draws no glyph and leaves the slot to leading. */
export type ChipTone = 'file' | 'folder' | 'session' | 'neutral'

/** Props for {@link Chip}. */
export interface ChipProps {
  /** Label content, usually text. */
  readonly children?: React.ReactNode
  /** Leading glyph, replacing the tone glyph when given. */
  readonly leading?: React.ReactNode
  /** Official glyph family (default neutral). */
  readonly tone?: ChipTone
  /** Whether the chip no longer resolves; strikes it through and stops activation. */
  readonly invalid?: boolean
  /** Whether a trailing remove control is shown. */
  readonly removable?: boolean
  /** Called by the remove control. */
  readonly onRemove?: () => void
  /** Accessible name of the remove control. */
  readonly removeLabel?: string
  /** Called when the chip itself is activated. */
  readonly onClick?: () => void
  /** Extra class for placement. */
  readonly className?: string
}

/** Run an activation from the keyboard, matching a button. */
function activateOnKey(event: React.KeyboardEvent<HTMLSpanElement>, run: () => void): void {
  if (event.key !== 'Enter' && event.key !== ' ')
    return
  event.preventDefault()
  run()
}

/**
 * Render an inline chip: optional glyph, truncating label and optional remove
 * control. The owner keeps the identity and decides what a removal means.
 * @param props - label, glyph, state and handlers.
 * @returns the chip.
 */
export function Chip(props: ChipProps): React.JSX.Element {
  const { children, leading, tone = 'neutral', invalid = false, removable = false, onRemove, removeLabel = '移除', onClick, className } = props
  const s = useStyle('chip', CHIP_CSS)
  const inline = useStyle('chip-inline', INLINE_CSS)
  const remove = useStyle('chip-remove', REMOVE_CSS)
  const activate = invalid ? undefined : onClick
  const glyph = leading ?? (tone === 'neutral'
    ? null
    : <ReferenceIconRegular kind={tone} size={14} className={s.icon} />)
  return (
    <span
      className={cx(inline.reference, s.chip, activate !== undefined && inline.openable, invalid && s.invalid, className)}
      role={activate === undefined
        ? undefined
        : 'button'}
      tabIndex={activate === undefined
        ? undefined
        : 0}
      onClick={activate}
      onKeyDown={activate === undefined
        ? undefined
        : (event) => { activateOnKey(event, activate) }}
    >
      {glyph}
      <span className={s.label}>{children}</span>
      {removable || onRemove !== undefined
        ? (
            <button
              type="button"
              className={remove.remove}
              aria-label={removeLabel}
              onClick={(event) => {
                event.stopPropagation()
                onRemove?.()
              }}
            >
              <IconCloseOutlineRegular />
            </button>
          )
        : null}
    </span>
  )
}
