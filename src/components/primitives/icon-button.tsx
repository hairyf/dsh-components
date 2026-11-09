import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered verbatim from the official square action-button sheet */
.action {
  width: calc(28px + var(--dsh-content-font-delta,0px));
  height: calc(28px + var(--dsh-content-font-delta,0px));
  border-radius: var(--dsw-radius-sm);
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  background: 0 0;
  border: none;
  justify-content: center;
  align-items: center;
  padding: 6px;
  display: inline-flex;
}

.action svg {
  width: calc(15px + var(--dsh-content-font-delta,0px));
  height: calc(15px + var(--dsh-content-font-delta,0px));
}

@media (hover:hover) {
  .action:hover {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-secondary);
  }
}

.action:disabled {
  cursor: default;
  opacity: .4;
}

.action[data-active] {
  color: var(--dsw-alias-label-tertiary);
}
`

/** Compact geometry: the sheet sizes the box and its glyph on one calc() axis. */
const COMPACT_SIZE = { '--dsh-content-font-delta': '-4px' } as React.CSSProperties

/** Props for {@link IconButton}: one glyph and one accessible name. */
export interface IconButtonProps {
  /** Glyph content, drawn at the size the sheet gives it. */
  readonly icon: React.ReactNode
  /** Accessible name; required because the control has no text. */
  readonly label: string
  /** Whether the control is on, exposed as the official data-active hook. */
  readonly active?: boolean
  /** Toggle state announced to assistive technology (aria-pressed). */
  readonly pressed?: boolean
  /** Whether the control cannot be used. */
  readonly disabled?: boolean
  /** 'md' keeps the official 28px box, 'sm' is a compact 24px box. */
  readonly size?: 'sm' | 'md'
  /** Called on activation. */
  readonly onClick?: () => void
  /** Extra class for placement. */
  readonly className?: string
}

/**
 * Render a square icon-only button with an optional pressed state.
 * @param props - glyph, accessible name and control state.
 * @returns the button.
 */
export function IconButton(props: IconButtonProps): React.JSX.Element {
  const { icon, label, active = false, pressed, disabled = false, size = 'md', onClick, className } = props
  const s = useStyle('icon-button', CSS)
  return (
    <button
      type="button"
      className={cx(s.action, className)}
      aria-label={label}
      aria-pressed={pressed}
      data-active={active ? '' : undefined}
      disabled={disabled}
      style={size === 'sm'
        ? COMPACT_SIZE
        : undefined}
      onClick={onClick}
    >
      {icon}
    </button>
  )
}
