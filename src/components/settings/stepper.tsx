import type * as React from 'react'
import { IconChevronDownOutlineRegular, IconChevronUpOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useStyle } from '../../lib/style'

/**
 * Recovered verbatim from @deepseek-ai/dsh-client-ui-theme /
 * FontSizeRow.module.css: the pill, its value, the unit after it, and the arrow
 * column that only a hover or a focused arrow reveals.
 */
const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-theme/lib/FontSizeRow.module.css */
.stepper {
  border-radius: var(--dsw-radius-md);
  background: var(--dsw-alias-bg-module-platform);
  justify-content: center;
  align-items: center;
  min-width: 72px;
  height: 36px;
  display: inline-flex;
  position: relative;
}

.value {
  text-align: center;
  font-variant-numeric: tabular-nums;
  min-width: 18px;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  line-height: 22px;
}

.unit {
  color: var(--dsw-alias-label-secondary);
  font-size: 14px;
  line-height: 22px;
}

.arrows {
  opacity: 0;
  flex-direction: column;
  gap: 2px;
  display: flex;
  position: absolute;
  right: 8px;
}

@media (hover:hover) {
  .stepper:hover .arrows {
    opacity: 1;
  }
}

.stepper:focus-within .arrows {
  opacity: 1;
}

@media (hover:none) {
  .arrows {
    opacity: 1;
  }
}

.arrow {
  border-radius: var(--dsw-radius-xs);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 75%, transparent);
  width: 17px;
  height: 12px;
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
  border: none;
  justify-content: center;
  align-items: center;
  padding: 0;
  display: inline-flex;
}

@media (hover:hover) {
  .arrow:hover:not(:disabled) {
    background: var(--dsw-alias-bg-layer-1);
  }
}

.arrow:disabled {
  color: var(--dsw-alias-label-caption);
  cursor: default;
}
`

/** Props of {@link Stepper}. */
export interface StepperProps {
  /** Current number, owned by the caller. */
  readonly value: number
  /** Lowest reachable number; the down arrow stops here. */
  readonly min: number
  /** Highest reachable number; the up arrow stops here. */
  readonly max: number
  /** Amount one arrow press adds or removes; a positive number. */
  readonly step?: number
  /** Suffix shown after the pill, such as a unit label. */
  readonly unit?: React.ReactNode
  /** Accessible name of the up arrow. */
  readonly increaseLabel: string
  /** Accessible name of the down arrow. */
  readonly decreaseLabel: string
  /** Receives the clamped next value; never the current value. */
  readonly onChange: (next: number) => void
  /** Make both arrows unavailable. */
  readonly disabled?: boolean
}

/**
 * A numeric pill with hover-revealed up and down arrows.
 *
 * The value is clamped to the range before it leaves the component, and an
 * arrow is disabled at the end it cannot pass, so a caller can wire the result
 * straight into its own state.
 * @param props - current value, range and the change callback.
 * @returns the pill and, when given, its unit.
 */
export function Stepper(props: StepperProps): React.JSX.Element {
  const { value, min, max, step = 1, unit, increaseLabel, decreaseLabel, onChange, disabled = false } = props
  const s = useStyle('stepper', CSS)
  const climb = (): void => {
    const next = Math.min(max, value + step)
    if (next !== value)
      onChange(next)
  }
  const descend = (): void => {
    const next = Math.max(min, value - step)
    if (next !== value)
      onChange(next)
  }
  return (
    <>
      <div className={s.stepper}>
        <span className={s.value}>{value}</span>
        <span className={s.arrows}>
          <button
            type="button"
            className={s.arrow}
            aria-label={increaseLabel}
            disabled={disabled || value >= max}
            onClick={climb}
          >
            <IconChevronUpOutlineRegular size={9} />
          </button>
          <button
            type="button"
            className={s.arrow}
            aria-label={decreaseLabel}
            disabled={disabled || value <= min}
            onClick={descend}
          >
            <IconChevronDownOutlineRegular size={9} />
          </button>
        </span>
      </div>
      {unit !== undefined && <span className={s.unit}>{unit}</span>}
    </>
  )
}
