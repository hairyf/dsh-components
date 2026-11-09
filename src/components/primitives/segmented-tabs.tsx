import type * as React from 'react'
import { useState } from 'react'
import { cx, useStyle } from '../../lib/style'
import { Pill, usePillStyle } from './pill'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/SegmentedTabs.module.css */
.tabs {
  --segmented-tabs-inset: 4px;

  position: relative;
  display: grid;
  padding: var(--segmented-tabs-inset);
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-alias-bg-module-platform);
}

.indicator {
  position: absolute;
  inset: var(--segmented-tabs-inset) auto var(--segmented-tabs-inset) var(--segmented-tabs-inset);
  box-sizing: border-box;
  border: 0.5px solid var(--dsw-alias-border-l3);
  border-radius: var(--dsw-radius-md);
  background: var(--dsw-alias-bg-layer-3);
  transition: transform 180ms ease;
  pointer-events: none;
}

.tab {
  position: relative;
  justify-content: center;
  height: 34px;
  padding: 0 12px;
  border-radius: var(--dsw-radius-md);
  font-size: 14px;
  line-height: 20px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  transition: color 180ms ease;
}

.tab[aria-selected='true'] {
  background: transparent;
  color: var(--dsw-alias-label-primary);
}

@media (hover: hover) {
  .tab:hover {
    background: transparent;
    color: var(--dsw-alias-label-primary);
  }
}

.tab[aria-selected='true'] {
  font-weight: 600;
}

.tabs[data-size='sm'] {
  --segmented-tabs-inset: 2px;

  border-radius: calc(var(--dsw-radius-md) + var(--segmented-tabs-inset));
}

.tabs[data-size='sm'] .tab {
  height: 30px;
}

.tabs[data-size='sm'] .tab[aria-selected='true'] {
  font-weight: 500;
}

.tab:focus-visible {
  outline: none;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .indicator,
  .tab {
    transition: none;
  }
}
`

/** A tab links its localized label to a caller-owned panel. */
export interface SegmentedTab<Value extends string = string> {
  value: Value
  label: React.ReactNode
  id: string
  panelId: string
}

/**
 * Props for {@link SegmentedTabs}. Passing `value` makes the selection fully
 * controlled; otherwise it keeps its own selection starting at `defaultValue`.
 */
export interface SegmentedTabsProps<Value extends string = string> {
  /** Non-empty ordered tabs with unique values and DOM ids. */
  items: readonly [SegmentedTab<Value>, ...SegmentedTab<Value>[]]
  /** Selected value of a controlled tab list. */
  value?: Value
  /** Initial selection of an uncontrolled tab list. */
  defaultValue?: Value
  /** Selection requested by click, Left/Right, or Home/End. */
  onChange?: (value: Value) => void
  /** Localized accessible name for the tab list. */
  label: string
  /** Layout placement; panels remain caller-owned. */
  className?: string
  /** `sm` draws 30px tabs with a 2px inset; the default `md` draws 34px tabs with a 4px inset. */
  size?: 'sm' | 'md'
}

/**
 * Render equal-width tabs with a sliding selection indicator.
 * Keyboard selection also moves focus; only the selected tab is a tab stop.
 */
export function SegmentedTabs<Value extends string>({
  items,
  value,
  defaultValue,
  onChange,
  label,
  className,
  size = 'md',
}: SegmentedTabsProps<Value>): React.JSX.Element {
  // Pill.module.css precedes SegmentedTabs.module.css in the official cascade;
  // the tab's height, padding and type rely on that order.
  usePillStyle()
  const s = useStyle('segmented-tabs', CSS)
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const current = value ?? uncontrolled
  const selectedIndex = items.findIndex(item => item.value === current)
  const requestChange = (next: Value): void => {
    if (value === undefined)
      setUncontrolled(next)
    onChange?.(next)
  }
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number): void => {
    let next: number
    switch (event.key) {
      case 'ArrowLeft':
        next = (index + items.length - 1) % items.length
        break
      case 'ArrowRight':
        next = (index + 1) % items.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = items.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    event.stopPropagation()
    const tablist = event.currentTarget.parentElement
    const nextItem = items[next]
    if (tablist === null || nextItem === undefined)
      return
    tablist.querySelectorAll<HTMLElement>('[role="tab"]').item(next).focus()
    requestChange(nextItem.value)
  }
  return (
    <div
      role="tablist"
      data-size={size}
      aria-label={label}
      className={cx(s.tabs, className)}
      style={{ gridTemplateColumns: `repeat(${String(items.length)}, minmax(0, 1fr))` }}
    >
      <span
        className={s.indicator}
        aria-hidden="true"
        style={{
          width: `calc((100% - 2 * var(--segmented-tabs-inset)) / ${String(items.length)})`,
          transform: `translateX(${String(selectedIndex * 100)}%)`,
        }}
      />
      {items.map((item, index) => (
        <Pill
          key={item.value}
          id={item.id}
          role="tab"
          className={s.tab}
          aria-selected={current === item.value}
          aria-controls={item.panelId}
          tabIndex={current === item.value
            ? 0
            : -1}
          onClick={() => {
            requestChange(item.value)
          }}
          onKeyDown={(event) => {
            onKeyDown(event, index)
          }}
        >
          {item.label}
        </Pill>
      ))}
    </div>
  )
}
