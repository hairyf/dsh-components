import type * as React from 'react'
import { useAnchoredPosition, useDismissOnOutsidePointer } from '@deepseek-ai/dsh-client-ui-primitives'
import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useStyle } from '../../lib/style'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-conversation / ContextMeter.module.css:
 * .root, .trigger, .track, .fill, .panel, .header, .percent, .headline, .bar,
 * .segment. The composition colors arrive per segment as a CSS color, so the
 * component stays independent of any particular usage breakdown.
 */
const CSS = `.root {
  flex: none;
  display: inline-flex;
}

.trigger {
  border-radius: var(--dsw-radius-sm);
  color: var(--dsw-alias-label-tertiary);
  font-family: inherit;
  font-size: var(--dsh-content-font-size-secondary,13px);
  font-variant-numeric: tabular-nums;
  line-height: calc(20px + var(--dsh-content-font-delta-secondary,0px));
  white-space: nowrap;
  cursor: pointer;
  background: 0 0;
  border: none;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 1px 8px;
  display: inline-flex;
}

.trigger[aria-expanded=true] {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-secondary);
}

@media (hover:hover) {
  .trigger:hover {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-secondary);
  }
}

.track {
  fill: none;
  stroke: var(--dsw-alias-border-l3);
  stroke-width: 2px;
}

.fill {
  fill: none;
  stroke: var(--dsw-alias-label-tertiary);
  stroke-width: 2px;
  stroke-linecap: round;
}

.panel {
  z-index: 1100;
  box-sizing: border-box;
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-specific-menu);
  width: min(264px,100vw - 24px);
  backdrop-filter: var(--dsw-menu-backdrop-filter);
  --dsw-elevation-stroke-color: var(--dsw-alias-border-l1);
  box-shadow: var(--dsw-elevation-prominent);
  color: var(--dsw-alias-label-secondary);
  cursor: default;
  max-width: var(--dsh-anchored-max-width,none);
  max-height: var(--dsh-anchored-max-height,none);
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2);
  border: 0;
  padding: 12px;
  font-size: 12px;
  line-height: 20px;
  position: fixed;
  overflow: hidden auto;
}

.header {
  align-items: center;
  gap: 6px;
  display: flex;
}

.percent {
  color: var(--dsw-alias-label-primary);
  font-weight: 500;
}

.headline {
  color: var(--dsw-alias-label-tertiary);
}

.headline:empty {
  display: none;
}

.bar {
  corner-shape: round;
  background: var(--dsw-alias-interactive-bg-hover);
  border-radius: 999px;
  gap: 1px;
  height: 4px;
  margin: 10px 0 12px;
  display: flex;
  overflow: hidden;
}

.segment {
  background: var(--meter-tint,var(--dsw-alias-label-tertiary));
  border-radius: 1px;
  flex: none;
  min-width: 2px;
  height: 100%;
}
`

/** Ring geometry: a 14px viewBox with a 2px stroke. */
const RADIUS = 5.5
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Unplaced panel: hidden but laid out, so the first placement measures it. */
const MEASURE_STYLE: React.CSSProperties = {
  visibility: 'hidden',
  left: 0,
  top: 0,
}

/** One segment of the optional composition bar. */
export interface MeterSegment {
  /** Stable key for the segment. */
  key: string
  /** Relative weight; segments are normalized against their sum. */
  value: number
  /** Any CSS color used as the segment tint. */
  tone: string
}

/** Props for {@link Meter}. */
export interface MeterProps {
  /** Share in use, 0 to 1. */
  value: number
  /** Optional composition breakdown for the panel bar. */
  segments?: readonly MeterSegment[]
  /** Short reading shown beside the ring. */
  label?: React.ReactNode
  /** Supporting line shown in the panel header. */
  detail?: React.ReactNode
  /** Whether the panel is showing. */
  open?: boolean
  /** Called with the next open state. */
  onOpenChange?: (open: boolean) => void
  /** Panel body composed by the caller. */
  children?: React.ReactNode
}

/**
 * Render a ring usage meter with an optional open panel.
 *
 * The ring fills to `value`; `segments` size the panel bar and supply their own
 * tint. The open panel body is the caller's children.
 * @param props - value, segments, reading, detail, and controlled panel state.
 * @returns The trigger and, while open, the portaled panel.
 */
export function Meter(props: MeterProps): React.JSX.Element {
  const { value, segments, label, detail, open = false, onOpenChange, children } = props
  const s = useStyle('meter', CSS)
  const rootRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const setOpen = useCallback((next: boolean): void => {
    onOpenChange?.(next)
  }, [onOpenChange])
  const position = useAnchoredPosition({
    open,
    anchorRef: rootRef,
    panelRef,
    side: 'top',
    gap: 8,
    margin: 12,
  })
  const close = useCallback((): void => {
    setOpen(false)
  }, [setOpen])
  useDismissOnOutsidePointer(rootRef, open, close, panelRef)
  useEffect(() => {
    if (!open)
      return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape')
        close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])
  const ratio = Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : 0
  const total = segments === undefined
    ? 0
    : segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0)
  const parts = segments === undefined || segments.length === 0 || total <= 0
    ? [
        { key: 'value', width: ratio * 100, tone: undefined },
      ]
    : segments.map(segment => ({
        key: segment.key,
        width: ratio * Math.max(0, segment.value) / total * 100,
        tone: segment.tone,
      }))
  return (
    <span ref={rootRef} className={s.root}>
      <button
        type="button"
        className={s.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open)
        }}
      >
        <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
          <circle className={s.track} cx="7" cy="7" r={RADIUS} />
          <circle
            className={s.fill}
            cx="7"
            cy="7"
            r={RADIUS}
            strokeDasharray={`${String(CIRCUMFERENCE * ratio)} ${String(CIRCUMFERENCE)}`}
            transform="rotate(-90 7 7)"
          />
        </svg>
        {label === undefined
          ? null
          : <span>{label}</span>}
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          className={s.panel}
          style={position ?? MEASURE_STYLE}
          role="dialog"
          aria-label={typeof label === 'string'
            ? label
            : undefined}
        >
          {detail === undefined && label === undefined
            ? null
            : (
                <div className={s.header}>
                  {detail === undefined
                    ? null
                    : <span className={s.headline}>{detail}</span>}
                  {label === undefined
                    ? null
                    : <span className={s.percent}>{label}</span>}
                </div>
              )}
          <div className={s.bar}>
            {parts.map((part) => {
              const style = {
                width: `${String(part.width)}%`,
                ...(part.tone === undefined
                  ? {}
                  : { '--meter-tint': part.tone }),
              } as React.CSSProperties
              return <div key={part.key} className={s.segment} style={style} />
            })}
          </div>
          {children}
        </div>,
        document.body,
      )}
    </span>
  )
}
