import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered verbatim from the official masked value sheet */
.secret {
  box-sizing: border-box;
  max-width: 100%;
  font-family: var(--ds-font-family-code);
  align-items: center;
  margin: 0 2px;
  font-size: .875em;
  display: inline-flex;
}

.value {
  overflow-wrap: anywhere;
  min-width: 0;
}

.mask {
  -webkit-text-fill-color: transparent;
  background-color: currentColor;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 20'%3E%3Cpath d='M6 5.6v8.8M2.19 7.8l7.62 4.4M2.19 12.2l7.62-4.4' stroke='%23000' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") 0/1ch 100% repeat-x;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 20'%3E%3Cpath d='M6 5.6v8.8M2.19 7.8l7.62 4.4M2.19 12.2l7.62-4.4' stroke='%23000' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") 0/1ch 100% repeat-x;
}

.mask,
.toggle {
  position: relative;
  top: -.125em;
}

.toggle {
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  background: 0 0;
  border: none;
  flex: none;
  align-items: center;
  padding: 0;
  display: inline-flex;
}

@media (hover:hover) {
  .toggle:hover {
    color: var(--dsw-alias-label-primary);
  }
}

.toggle:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));
  outline-offset: 1px;
  border-radius: var(--dsw-radius-xs);
}

.icon {
  width: 1em;
  height: 1em;
}
`

/** Eye contour shared by the reveal and hide glyphs. */
const EYE_CONTOUR = 'M1.5 8C2.9 5.25 5.25 3.5 8 3.5C10.75 3.5 13.1 5.25 14.5 8C13.1 10.75 10.75 12.5 8 12.5C5.25 12.5 2.9 10.75 1.5 8Z'
/** Open eye with its pupil. */
const EYE_PATH = `${EYE_CONTOUR}M10 8C10 9.1 9.1 10 8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6C9.1 6 10 6.9 10 8Z`
/** The struck-through glyph drops the pupil so it stays distinct at text size. */
const EYE_OFF_PATH = `${EYE_CONTOUR}M2.5 2.5L13.5 13.5`
/** A run of mask characters. */
const MASK_RUNS = /(\*+)/u

/** Props for {@link MaskedText}. */
export interface MaskedTextProps {
  /** The value in full, shown while revealed. */
  readonly value: string
  /** Masked spelling with asterisk runs; defaults to one asterisk per character. */
  readonly masked?: string
  /** Asterisk count when masked is not given; defaults to the value length. */
  readonly count?: number
  /** Whether the full value is showing (owner-controlled). */
  readonly revealed?: boolean
  /** Accessible name of the reveal control. */
  readonly revealLabel?: string
  /** Accessible name of the hide control. */
  readonly hideLabel?: string
  /** Renders the reveal control; omit it for a read-only mask. */
  readonly onRevealedChange?: (revealed: boolean) => void
  /** Extra class for placement. */
  readonly className?: string
}

/** Draw one eye glyph at text size. */
function EyeGlyph(props: { readonly path: string, readonly className: string }): React.JSX.Element {
  return (
    <svg
      className={props.className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d={props.path} />
    </svg>
  )
}

/**
 * Split the masked form into kept text and mask runs.
 * Runs keep their characters for copying and assistive technology but draw
 * centered marks, because an asterisk in running text sits near the cap height.
 * @param props - masked spelling and the class that draws a run.
 * @param props.masked - the masked spelling to split.
 * @param props.className - the class that draws a mask run.
 * @returns the inline parts.
 */
function MaskedValue(props: { readonly masked: string, readonly className: string }): React.JSX.Element {
  let offset = 0
  return (
    <>
      {props.masked.split(MASK_RUNS).map((part) => {
        const key = offset
        offset += part.length
        if (part === '')
          return null
        return part.startsWith('*')
          ? <span className={props.className} key={key}>{part}</span>
          : <span key={key}>{part}</span>
      })}
    </>
  )
}

/**
 * Render a masked value with an optional reveal control.
 * @param props - full value, masked spelling and reveal state.
 * @returns the inline masked run.
 */
export function MaskedText(props: MaskedTextProps): React.JSX.Element {
  const { value, masked, count, revealed = false, revealLabel = '显示', hideLabel = '隐藏', onRevealedChange, className } = props
  const s = useStyle('masked-text', CSS)
  return (
    <span className={cx(s.secret, className)} data-secret="">
      <span className={s.value}>
        {revealed
          ? value
          : <MaskedValue masked={masked ?? '*'.repeat(count ?? value.length)} className={s.mask} />}
      </span>
      {onRevealedChange === undefined
        ? null
        : (
            <button
              type="button"
              className={s.toggle}
              aria-pressed={revealed}
              aria-label={revealed ? hideLabel : revealLabel}
              onClick={() => { onRevealedChange(!revealed) }}
            >
              <EyeGlyph path={revealed ? EYE_OFF_PATH : EYE_PATH} className={s.icon} />
            </button>
          )}
    </span>
  )
}
