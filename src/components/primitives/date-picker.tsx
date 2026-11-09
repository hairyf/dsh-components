import type * as React from 'react'
import { IconChevronLeftOutlineRegular, IconChevronRightOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-schedule / DatePicker.module.css (verbatim).
 * + PickerPopover.module.css
 */
const CSS = `/* @deepseek-ai/dsh-client-ui-schedule / DatePicker.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.calendar {
  flex-direction: column;
  gap: 4px;
  width: 232px;
  padding: 8px;
}

.head {
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  display: flex;
}

.title {
  color: var(--dsw-alias-label-primary);
  text-align: center;
  flex: auto;
  font-size: 13px;
  line-height: 1.6;
}

.nav {
  width: 26px;
  height: 26px;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  background: 0 0;
  border: 0;
  border-radius: 8px;
  flex: none;
  justify-content: center;
  align-items: center;
  padding: 0;
  display: inline-flex;
}

@media (hover:hover) {
  .nav:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.nav:focus-visible {
  outline: 2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));
  outline-offset: -2px;
}

.grid {
  flex-direction: column;
  gap: 2px;
  display: flex;
}

.week {
  grid-template-columns: repeat(7,1fr);
  gap: 2px;
  display: grid;
}

.weekday {
  height: 22px;
  color: var(--dsw-alias-label-tertiary);
  justify-content: center;
  align-items: center;
  font-size: 11px;
  line-height: 1.6;
  display: flex;
}

.cell {
  height: 28px;
  color: var(--dsw-alias-label-primary);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  border-radius: 8px;
  outline: none;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  line-height: 1.6;
  display: flex;
}

@media (hover:hover) {
  .cell:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.cell:focus-visible {
  outline: 2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));
  outline-offset: -2px;
}

.cell[aria-current=date] {
  box-shadow: inset 0 0 0 .5px var(--dsw-alias-border-l3);
}

.selected {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-button-ghost-active-fill);
  box-shadow: inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border);
}

.blank {
  height: 28px;
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

/** ISO calendar date, the only text this control reads and writes. */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
/** Arrow key to the number of days it moves the focused cell. */
const STEP_BY_KEY: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
}
/** Accessible names of the month navigation buttons. */
const PREVIOUS_MONTH_LABEL = 'Previous month'
const NEXT_MONTH_LABEL = 'Next month'

interface MonthView {
  year: number
  month: number
}

interface CalendarView extends MonthView {
  day: number
}

/** Zero-padded two-digit field. */
function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Last day of one month. */
function daysIn(view: MonthView): number {
  return new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate()
}

/** The month and day one stored date opens on, or today for absent or invalid text. */
function viewOf(date: string | undefined): CalendarView {
  const match = date === undefined
    ? null
    : ISO_DATE.exec(date)
  if (match === null) {
    const today = new Date()
    return {
      year: today.getFullYear(),
      month: today.getMonth(),
      day: today.getDate(),
    }
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  }
}

/** The same day in another month, clamped to that month's length. */
function shiftMonth(view: CalendarView, step: number): CalendarView {
  const months = view.year * 12 + view.month + step
  const moved = {
    year: Math.floor(months / 12),
    month: months % 12,
  }
  return {
    ...moved,
    day: Math.min(view.day, daysIn(moved)),
  }
}

/** ISO text of one day in a shown month. */
function isoOf(view: MonthView, day: number): string {
  return `${String(view.year)}-${pad(view.month + 1)}-${pad(day)}`
}

/** The month a controlled date points at, or the fallback when the date is invalid. */
function monthView(month: Date, fallback: MonthView): MonthView {
  const year = month.getFullYear()
  const value = month.getMonth()
  return Number.isFinite(year) && Number.isFinite(value)
    ? { year, month: value }
    : fallback
}

/** Props for {@link DatePicker}. */
export interface DatePickerProps {
  /** Selected ISO date (YYYY-MM-DD); absent when nothing is selected. */
  value?: string
  /** Receives the ISO date of the picked day. */
  onChange: (value: string) => void
  /** Month to show; passing it makes month navigation controlled. */
  month?: Date
  /** Receives the first day of a month reached with the navigation buttons. */
  onMonthChange?: (month: Date) => void
  /** Earliest ISO date that can be picked, inclusive. */
  min?: string
  /** Latest ISO date that can be picked, inclusive. */
  max?: string
  /** Prevent navigation and picking. */
  disabled?: boolean
  /** Seven weekday headings, Monday first. */
  weekdayLabels: readonly string[]
  /** Accessible name for the cell of the current day. */
  todayLabel?: string
  /** Extra class for the panel's placement. */
  className?: string
}

/**
 * Render a month calendar with a heading, month navigation, weekday row and day cells.
 *
 * The panel is always visible rather than living in an anchored popover, so a
 * caller composes it with its own trigger. The shown month is uncontrolled
 * unless month is passed; the selected day is always reported through onChange.
 */
export function DatePicker({
  value,
  onChange,
  month,
  onMonthChange,
  min,
  max,
  disabled = false,
  weekdayLabels,
  todayLabel,
  className,
}: DatePickerProps): React.JSX.Element {
  const s = useStyle('date-picker', CSS)
  const p = useStyle('date-picker-popover', POPOVER_CSS)
  const [view, setView] = useState<CalendarView>(() => viewOf(value))
  const [cursorDay, setCursorDay] = useState(view.day)
  const cellRefs = useRef(new Map<number, HTMLDivElement>())
  const focusPending = useRef(false)
  const lastValue = useRef(value)
  useEffect(() => {
    if (value === lastValue.current)
      return
    lastValue.current = value
    if (month !== undefined)
      return
    const next = viewOf(value)
    setView(next)
    setCursorDay(next.day)
  }, [month, value])
  const shown = month === undefined
    ? view
    : monthView(month, view)
  const total = daysIn(shown)
  const activeDay = Math.min(Math.max(cursorDay, 1), total)
  const today = new Date()
  const todayIso = isoOf({
    year: today.getFullYear(),
    month: today.getMonth(),
  }, today.getDate())
  const offset = (new Date(Date.UTC(shown.year, shown.month, 1)).getUTCDay() + 6) % 7
  const cellCount = Math.ceil((offset + total) / 7) * 7
  const weeks = Array.from({ length: cellCount / 7 }, (_value, week) => week)
  const monthTitle = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(Date.UTC(shown.year, shown.month, 1))
  useLayoutEffect(() => {
    if (!focusPending.current)
      return
    focusPending.current = false
    cellRefs.current.get(activeDay)?.focus()
  }, [activeDay, shown.month, shown.year])
  const inRange = (iso: string): boolean => (min === undefined || iso >= min) && (max === undefined || iso <= max)
  const pick = (day: number): void => {
    const iso = isoOf(shown, day)
    if (disabled || !inRange(iso))
      return
    setCursorDay(day)
    setView(current => ({ ...current, day }))
    onChange(iso)
  }
  const goMonth = (step: number): void => {
    if (disabled)
      return
    const next = shiftMonth({ ...shown, day: activeDay }, step)
    if (month === undefined) {
      setView(next)
      setCursorDay(next.day)
    }
    onMonthChange?.(new Date(next.year, next.month, 1))
  }
  const onCellKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, day: number): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      pick(day)
      return
    }
    const step = STEP_BY_KEY[event.key]
    if (step === undefined)
      return
    event.preventDefault()
    const nextDay = Math.min(Math.max(day + step, 1), total)
    focusPending.current = true
    setCursorDay(nextDay)
    setView(current => ({ ...current, day: nextDay }))
  }
  // The official panel is fixed because it is portaled; inline, the same
  // surface stays at its own position.
  const panelStyle: React.CSSProperties = { position: 'relative' }
  return (
    <div
      className={cx(p.panel, s.calendar, className)}
      style={panelStyle}
      aria-disabled={disabled || undefined}
    >
      <div className={s.head}>
        <button
          type="button"
          className={s.nav}
          aria-label={PREVIOUS_MONTH_LABEL}
          disabled={disabled}
          onClick={() => {
            goMonth(-1)
          }}
        >
          <IconChevronLeftOutlineRegular />
        </button>
        <span className={s.title} aria-live="polite">
          {monthTitle}
        </span>
        <button
          type="button"
          className={s.nav}
          aria-label={NEXT_MONTH_LABEL}
          disabled={disabled}
          onClick={() => {
            goMonth(1)
          }}
        >
          <IconChevronRightOutlineRegular />
        </button>
      </div>
      <div className={s.grid} role="grid" aria-label={monthTitle}>
        <div role="row" className={s.week}>
          {Array.from({ length: 7 }, (_value, column) => (
            <div role="columnheader" className={s.weekday} key={column}>
              {weekdayLabels[column] ?? ''}
            </div>
          ))}
        </div>
        {weeks.map(week => (
          <div role="row" className={s.week} key={week}>
            {Array.from({ length: 7 }, (_value, column) => week * 7 + column - offset + 1).map((day) => {
              if (day < 1 || day > total) {
                return <div role="gridcell" aria-hidden="true" className={s.blank} key={day} />
              }
              const iso = isoOf(shown, day)
              const selectable = !disabled && inRange(iso)
              const selected = iso === value
              const current = iso === todayIso
              return (
                <div
                  key={day}
                  ref={(element) => {
                    if (element === null)
                      cellRefs.current.delete(day)
                    else
                      cellRefs.current.set(day, element)
                  }}
                  role="gridcell"
                  aria-selected={selected}
                  aria-current={current ? 'date' : undefined}
                  aria-label={current ? todayLabel : undefined}
                  aria-disabled={selectable ? undefined : true}
                  tabIndex={!disabled && day === activeDay
                    ? 0
                    : -1}
                  className={cx(s.cell, selected && s.selected)}
                  onClick={selectable
                    ? () => {
                        pick(day)
                      }
                    : undefined}
                  onKeyDown={disabled
                    ? undefined
                    : (event) => {
                        onCellKeyDown(event, day)
                      }}
                >
                  {day}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
