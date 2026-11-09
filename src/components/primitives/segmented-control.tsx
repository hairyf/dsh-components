import type * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/SegmentedControl.module.css */
/* The track is the same translucent fill the hover state uses, so it reads as
 * a place rather than a second button; the one raised part is the indicator,
 * a white pill that slides under the selected segment. Its stroke rides inside
 * the soft elevation shadow (border: 0), the way every elevated surface draws
 * its edge, so the elevation gate keeps it off the alias-border set.
 *
 * Segments are equal-width grid tracks sized to the widest label, which is
 * what lets one indicator be placed arithmetically: the tablist carries the
 * segment count and the selected index as custom properties, and the indicator
 * derives its width and offset from them instead of measuring the DOM. */
.control {
  position: relative;
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 2px;
  padding: 4px;
  border-radius: var(--dsw-radius-md);
  background: var(--dsw-alias-interactive-bg-hover);
}

.indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc((100% - 8px - 2px * (var(--dsh-segment-count) - 1)) / var(--dsh-segment-count));
  height: calc(100% - 8px);
  border: 0;
  border-radius: var(--dsw-radius-sm);
  background: var(--dsw-alias-bg-layer-1);
  box-shadow: var(--dsw-elevation-soft);
  transform: translateX(calc(var(--dsh-segment-index) * (100% + 2px)));
  transition: transform 160ms ease;
  pointer-events: none;
}

.tab {
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  height: 28px;
  padding: 0 16px;
  border: 0;
  border-radius: var(--dsw-radius-sm);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: color 120ms ease;
}

.tab[aria-selected='true'] {
  color: var(--dsw-alias-label-primary);
}

@media (hover: hover) {
  .tab:hover:not(:disabled) {
    color: var(--dsw-alias-label-primary);
  }
}

.tab:disabled {
  cursor: default;
  opacity: 0.4;
}

.tab:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
  .indicator,
  .tab {
    transition: none;
  }
}
`

/** One segment of a {@link SegmentedControl}. */
export interface SegmentedControlOption<Value extends string> {
  /** The value the owner receives when this segment is chosen. */
  value: Value
  /** Localized segment text. */
  label: string
  /** Whether the segment refuses selection. */
  disabled?: boolean
  /** Localized hover text, typically why the segment is locked. */
  title?: string
}

/**
 * Props for {@link SegmentedControl}. Passing `value` makes the control fully
 * controlled; otherwise it keeps its own selection starting at `defaultValue`.
 */
export interface SegmentedControlProps<Value extends string = string> {
  /** The owner's base id: each tab is `<id>-<value>` and names `<id>-<value>-panel` as the panel it controls. */
  id: string
  /** The selected option's value of a controlled control. */
  value?: Value
  /** Initial selection of an uncontrolled control. */
  defaultValue?: Value
  /** The segments in display order; at least two. */
  options: readonly SegmentedControlOption<Value>[]
  /** Called with the value a click or a walk key asks for, never with the value already selected. */
  onChange?: (next: Value) => void
  /** Localized accessible name of the tablist. */
  label: string
  /** Lock every segment, typically while the shown panel has a write or a fetch in flight. */
  disabled?: boolean
  /** Extra class for layout placement. */
  className?: string
}

type WalkKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'Home' | 'End'

function isWalkKey(key: string): key is WalkKey {
  return key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown' || key === 'Home' || key === 'End'
}

/**
 * The enabled option a walk key lands on from the selected one: arrows step to
 * the nearest enabled neighbour and wrap, Home and End jump to the first and
 * last enabled option.
 */
function walk<Value extends string>(
  options: readonly SegmentedControlOption<Value>[],
  from: number,
  key: WalkKey,
): SegmentedControlOption<Value> | undefined {
  const enabled = options.filter(option => option.disabled !== true)
  if (key === 'Home')
    return enabled[0]
  if (key === 'End')
    return enabled[enabled.length - 1]
  const step = key === 'ArrowRight' || key === 'ArrowDown'
    ? 1
    : -1
  const count = options.length
  for (let offset = 1; offset < count; offset += 1) {
    const candidate = options[((from + step * offset) % count + count) % count]
    if (candidate !== undefined && candidate.disabled !== true)
      return candidate
  }
  return undefined
}

/**
 * Render a segmented control as a keyboard-walkable tablist.
 */
export function SegmentedControl<Value extends string>({
  id,
  value,
  defaultValue,
  options,
  onChange,
  label,
  disabled = false,
  className,
}: SegmentedControlProps<Value>): React.JSX.Element {
  const s = useStyle('segmented-control', CSS)
  const list = useRef<HTMLDivElement>(null)
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const current = value ?? uncontrolled
  const selected = options.findIndex(option => option.value === current)
  const requestChange = (next: Value): void => {
    if (value === undefined)
      setUncontrolled(next)
    onChange?.(next)
  }
  useEffect(() => {
    const root = list.current
    if (root === null || typeof document === 'undefined')
      return
    if (!root.contains(document.activeElement))
      return
    root.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus()
  }, [current])
  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>): void => {
    if (!isWalkKey(event.key))
      return
    event.preventDefault()
    const target = walk(options, selected, event.key)
    if (target !== undefined && target.value !== current)
      requestChange(target.value)
  }
  const indicator = {
    '--dsh-segment-count': String(options.length),
    '--dsh-segment-index': String(selected),
  } as React.CSSProperties
  return (
    <div
      ref={list}
      role="tablist"
      aria-label={label}
      className={cx(s.control, className)}
      style={indicator}
    >
      <span aria-hidden="true" className={s.indicator} />
      {options.map((option) => {
        const active = option.value === current
        return (
          <button
            key={option.value}
            id={`${id}-${option.value}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`${id}-${option.value}-panel`}
            tabIndex={active
              ? 0
              : -1}
            disabled={disabled || option.disabled === true}
            title={option.title}
            className={s.tab}
            onClick={() => {
              if (!active)
                requestChange(option.value)
            }}
            onKeyDown={onKeyDown}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
