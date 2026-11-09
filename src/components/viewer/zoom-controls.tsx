import type * as React from 'react'
import type { MenuEntry } from '../primitives/menu'
import { IconChevronDownOutlineRegular, IconPlusOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useState } from 'react'
import { cx, useStyle } from '../../lib/style'
import { Button, useButtonStyle } from '../primitives/button'
import { Menu } from '../primitives/menu'
import { Tooltip } from '../primitives/tooltip'

/** Accessible name of the toolbar. */
const TOOLBAR_LABEL = 'Zoom'

/** Menu identity of the row that returns the view to 100%. */
const RESET_ID = 'reset'

/** Scales the menu offers when the caller passes no presets. */
const DEFAULT_PRESETS: readonly number[] = [0.25, 0.5, 1, 1.5, 2]

/**
 * Recovered from @deepseek-ai/dsh-client-ui-primitives / ZoomControls.module.css (verbatim).
 */
const CSS = `/* Zero specificity lets an owner className move the toolbar regardless of stylesheet order. */
:where(.panel) {
  bottom: 14px;
}

.panel {
  position: absolute;
  z-index: 2;
  inset-inline-start: 50%;
  display: flex;
  align-items: center;
  gap: 2px;
  box-sizing: border-box;
  padding: 4px 6px;
  /* TODO: replace this border and the literal shadow with \`border: 0\` and \`--dsw-elevation-panel\`
   * (docs/web-styling.md#component-rules), with visual review of the document preview. */
  border: 0.5px solid var(--dsw-alias-border-l3);
  border-radius: var(--dsw-radius-lg);
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-layer-1);
  box-shadow: 0 8px 24px light-dark(#0000001a, #00000060), 0 2px 5px light-dark(#00000009, #00000035);
  font-size: 12px;
  line-height: 18px;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 16px) scale(0.98);
  transition: opacity 160ms ease-in, transform 160ms cubic-bezier(0.4, 0, 1, 1);
  will-change: opacity, transform;
}

.visible {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, 0) scale(1);
  transition: opacity 140ms ease-out, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.controlAnchor { display: flex; }
.zoomButton { width: 28px; padding: 0; flex: none; }
.percent { display: inline-flex; align-items: center; justify-content: center; gap: 2px; min-width: 58px; padding-inline: 6px; font-variant-numeric: tabular-nums; }
.zoomMenu { min-width: 112px; }

@media (hover: none), (pointer: coarse) {
  .panel {
    opacity: 1;
    pointer-events: auto;
    transform: translate(-50%, 0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .panel,
  .visible { transition-duration: 0.01ms; }
}
`

/** Props of {@link ZoomControls}. */
export interface ZoomControlsProps {
  /** Current scale, where 1 renders at actual size. */
  readonly value: number
  /** Receives the scale a control asks for, already clamped to the range. */
  readonly onChange: (value: number) => void
  /** Smallest reachable scale (default 0.25). */
  readonly min?: number
  /** Largest reachable scale (default 4). */
  readonly max?: number
  /** Amount one step button adds or removes; a positive number (default 0.25). */
  readonly step?: number
  /** Scales the menu offers, in display order. */
  readonly presets?: readonly number[]
  /** Whether the toolbar is showing; the sheet keeps it faded and inert until true. */
  readonly visible?: boolean
  /** Accessible name and tooltip of the button that increases the scale. */
  readonly zoomInLabel: string
  /** Accessible name and tooltip of the button that decreases the scale. */
  readonly zoomOutLabel: string
  /** Menu row that returns the scale to 100%; omit for a presets-only menu. */
  readonly resetLabel?: string
  /** Extra class for placement in a floating layer. */
  readonly className?: string
}

/**
 * Move one step along the scale grid toward a direction.
 *
 * The next value is snapped to a multiple of `step` and clamped, so a caller can
 * store it without further checks.
 * @param value - current scale.
 * @param direction - -1 shrinks, 1 grows.
 * @param min - smallest reachable scale.
 * @param max - largest reachable scale.
 * @param step - grid the result lands on.
 * @returns the next scale.
 */
function steppedZoom(value: number, direction: -1 | 1, min: number, max: number, step: number): number {
  const index = direction === -1
    ? Math.ceil(value / step) - 1
    : Math.floor(value / step) + 1
  return Math.min(max, Math.max(min, index * step))
}

/**
 * Floating zoom toolbar: shrink, percentage menu, then grow.
 *
 * The menu lists the presets and, when `resetLabel` is given, a first row that
 * returns the scale to 100%. The percentage trigger shows
 * `Math.round(value * 100)%`.
 * @param props - current scale, range, menu choices, labels and visibility.
 * @returns the toolbar element.
 */
export function ZoomControls(props: ZoomControlsProps): React.JSX.Element {
  const { value, onChange, min = 0.25, max = 4, step = 0.25, presets = DEFAULT_PRESETS, visible = false, zoomInLabel, zoomOutLabel, resetLabel, className } = props
  useButtonStyle()
  const s = useStyle('zoom-controls', CSS)
  const [open, setOpen] = useState(false)
  const percent = `${String(Math.round(value * 100))}%`
  const items: MenuEntry[] = [
    ...(resetLabel === undefined
      ? []
      : [
          { id: RESET_ID, label: resetLabel },
          { type: 'separator' as const, id: 'reset-separator' },
        ]),
    ...presets.map(preset => ({
      id: String(preset),
      label: `${String(Math.round(preset * 100))}%`,
    })),
  ]
  const resetSelected = resetLabel !== undefined && value === 1
  const presetSelected = presets.includes(value)
  const selectedId = resetSelected
    ? RESET_ID
    : presetSelected
      ? String(value)
      : undefined
  const apply = (next: number): void => {
    onChange(Math.min(max, Math.max(min, next)))
  }
  return (
    <div
      className={cx(s.panel, visible && s.visible, className)}
      role="toolbar"
      aria-label={TOOLBAR_LABEL}
      data-document-zoom-controls=""
      data-document-zoom-visible={visible || undefined}
    >
      <Tooltip label={zoomOutLabel} side="top">
        <span className={s.controlAnchor}>
          <Button
            size="sm"
            className={s.zoomButton}
            aria-label={zoomOutLabel}
            disabled={value <= min}
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            onClick={() => {
              apply(steppedZoom(value, -1, min, max, step))
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 8h12" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </Button>
        </span>
      </Tooltip>
      <Menu
        open={open}
        side="top"
        align="start"
        portal
        compact
        listClassName={s.zoomMenu}
        items={items}
        selectedId={selectedId}
        onClose={() => {
          setOpen(false)
        }}
        onSelect={(id) => {
          setOpen(false)
          if (id === RESET_ID)
            apply(1)
          else
            apply(Number(id))
        }}
        anchor={(
          <Button
            size="sm"
            className={s.percent}
            aria-haspopup="menu"
            aria-expanded={open}
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            onClick={() => {
              setOpen(!open)
            }}
          >
            <span>{percent}</span>
            <IconChevronDownOutlineRegular size={12} />
          </Button>
        )}
      />
      <Tooltip label={zoomInLabel} side="top">
        <span className={s.controlAnchor}>
          <Button
            size="sm"
            className={s.zoomButton}
            aria-label={zoomInLabel}
            disabled={value >= max}
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            onClick={() => {
              apply(steppedZoom(value, 1, min, max, step))
            }}
          >
            <IconPlusOutlineRegular size={14} />
          </Button>
        </span>
      </Tooltip>
    </div>
  )
}
