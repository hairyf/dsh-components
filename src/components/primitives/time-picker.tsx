import type * as React from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-schedule / ClockPicker.module.css (verbatim).
 * + PickerPopover.module.css
 */
const CSS = `/* @deepseek-ai/dsh-client-ui-schedule / ClockPicker.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.clock {
  flex-direction: row;
  gap: 2px;
  padding: 3px;
}

.column {
  width: 52px;
  min-width: 0;
  max-height: min(216px, calc(var(--dsh-anchored-max-height,222px) - 6px));
  overscroll-behavior: contain;
  flex-direction: column;
  display: flex;
  overflow: hidden auto;
}

.option {
  min-height: 32px;
  color: var(--dsw-alias-label-primary);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  border-radius: 10px;
  outline: none;
  flex: none;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  line-height: 1.6;
  display: flex;
}

@media (hover:hover) {
  .option:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.option:focus-visible {
  outline: 2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));
  outline-offset: -2px;
}

.optionLabel {
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
}

.selected {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-button-ghost-active-fill);
  box-shadow: inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border);
}
`
const POPOVER_CSS = `/* @deepseek-ai/dsh-client-ui-schedule / PickerPopover.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.panel {
  box-sizing: border-box;
  z-index: 1100;
  background: var(--dsw-specific-menu);
  backdrop-filter: var(--dsw-menu-backdrop-filter);
  --dsw-elevation-stroke-color: var(--dsw-alias-border-l1);
  box-shadow: var(--dsw-elevation-prominent);
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2);
  max-width: var(--dsh-anchored-max-width,none);
  max-height: var(--dsh-anchored-max-height,none);
  border: 0;
  border-radius: 16px;
  display: flex;
  position: fixed;
  top: auto;
  left: auto;
  overflow: hidden auto;
}
`

/** Leading hour and minute of a clock. */
const CLOCK = /^(\d{2}):(\d{2})/
/** Accessible names of the two columns. */
const HOUR_LABEL = 'Hours'
const MINUTE_LABEL = 'Minutes'

/** Padded two-digit values from zero through count - 1. */
function padded(count: number): string[] {
  return Array.from({ length: count }, (_value, index) => String(index).padStart(2, '0'))
}

/** Minute options at one step, always including zero. */
function minuteOptions(step: number): string[] {
  return Array.from({
    length: Math.ceil(60 / step),
  }, (_value, index) => String(index * step).padStart(2, '0'))
}

/** The hour and minute a clock text composes onto, or midnight for absent or invalid text. */
function clockBase(value: string | undefined): string {
  const match = value === undefined
    ? null
    : CLOCK.exec(value)
  return match === null
    ? '00:00'
    : `${match[1]}:${match[2]}`
}

interface ClockColumn {
  label: string
  options: string[]
}

interface Cursor {
  column: number
  index: number
}

/** Props for {@link TimePicker}. */
export interface TimePickerProps {
  /** Selected clock text (HH:mm); absent composes onto midnight. */
  value?: string
  /** Receives the hour and minute text of the pick. */
  onChange: (value: string) => void
  /** Prevent picking. */
  disabled?: boolean
  /** Minute interval listed in the minute column (default 1). */
  minuteStep?: number
  /** Extra class for the panel's placement. */
  className?: string
}

/**
 * Render a two-column clock: one scrolling list of hours and one of minutes.
 *
 * The panel is always visible rather than living in an anchored popover. The
 * selected minute is kept even when it is not one of the listed steps, so a
 * pick always reports one complete HH:mm value.
 */
export function TimePicker({
  value,
  onChange,
  disabled = false,
  minuteStep = 1,
  className,
}: TimePickerProps): React.JSX.Element {
  const s = useStyle('time-picker', CSS)
  const p = useStyle('time-picker-popover', POPOVER_CSS)
  const step = Number.isFinite(minuteStep)
    ? Math.max(1, Math.floor(minuteStep))
    : 1
  const base = clockBase(value)
  const picked = [
    base.slice(0, 2),
    base.slice(3, 5),
  ]
  const columns: ClockColumn[] = [
    {
      label: HOUR_LABEL,
      options: padded(24),
    },
    {
      label: MINUTE_LABEL,
      options: minuteOptions(step),
    },
  ]
  const columnIndices = columns.map((column, at) => Math.max(0, column.options.indexOf(picked[at])))
  const [cursor, setCursor] = useState<Cursor>(() => ({ column: 0, index: columnIndices[0] }))
  const refs = useRef(new Map<string, HTMLDivElement>())
  const focusPending = useRef(false)
  useEffect(() => {
    const lists = [
      padded(24),
      minuteOptions(step),
    ]
    const chosen = [
      base.slice(0, 2),
      base.slice(3, 5),
    ]
    for (let at = 0; at < lists.length; at += 1) {
      const index = Math.max(0, lists[at].indexOf(chosen[at]))
      refs.current.get(`${String(at)}:${String(index)}`)?.scrollIntoView({ block: 'nearest' })
    }
  }, [base, step])
  useLayoutEffect(() => {
    if (!focusPending.current)
      return
    focusPending.current = false
    refs.current.get(`${String(cursor.column)}:${String(cursor.index)}`)?.focus()
  }, [cursor])
  const pick = (column: number, option: string, index: number): void => {
    const next = [...picked]
    next[column] = option
    setCursor({ column, index })
    onChange(`${next[0]}:${next[1]}`)
  }
  const onOptionKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    column: number,
    index: number,
    option: string,
    count: number,
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      pick(column, option, index)
      return
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const next: ClockColumn | undefined = columns[column + (event.key === 'ArrowRight'
        ? 1
        : -1)]
      if (next === undefined)
        return
      focusPending.current = true
      setCursor({
        column: columns.indexOf(next),
        index: Math.min(index, next.options.length - 1),
      })
      return
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      focusPending.current = true
      setCursor({
        column,
        index: event.key === 'Home'
          ? 0
          : count - 1,
      })
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')
      return
    event.preventDefault()
    focusPending.current = true
    const delta = event.key === 'ArrowDown'
      ? 1
      : -1
    setCursor({
      column,
      index: Math.min(Math.max(index + delta, 0), count - 1),
    })
  }
  const tabIndexOf = (column: number, index: number): number => {
    if (disabled)
      return -1
    const active = cursor.column === column
      ? cursor.index
      : columnIndices[column]
    return active === index
      ? 0
      : -1
  }
  // The official panel is fixed because it is portaled; inline, the same
  // surface stays at its own position.
  const panelStyle: React.CSSProperties = { position: 'relative' }
  return (
    <div
      className={cx(p.panel, s.clock, className)}
      style={panelStyle}
      aria-disabled={disabled || undefined}
    >
      {columns.map((column, at) => (
        <div role="listbox" aria-label={column.label} className={s.column} key={column.label}>
          {column.options.map((option, index) => {
            const selected = option === picked[at]
            return (
              <div
                key={option}
                ref={(element) => {
                  const key = `${String(at)}:${String(index)}`
                  if (element === null)
                    refs.current.delete(key)
                  else
                    refs.current.set(key, element)
                }}
                role="option"
                aria-selected={selected}
                aria-disabled={disabled || undefined}
                tabIndex={tabIndexOf(at, index)}
                className={cx(s.option, selected && s.selected)}
                onClick={disabled
                  ? undefined
                  : () => {
                      pick(at, option, index)
                    }}
                onKeyDown={disabled
                  ? undefined
                  : (event) => {
                      onOptionKeyDown(event, at, index, option, column.options.length)
                    }}
              >
                <span className={s.optionLabel}>{option}</span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
