import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/Pill.module.css */
.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 8px;
  border: none;
  border-radius: 999px;
  corner-shape: round;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-layer-2);
}

.interactive {
  cursor: pointer;
}

@media (hover: hover) {
  .interactive:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.active {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-button-ghost-active-fill);
  box-shadow: inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border);
}
`

/** Props for {@link Pill}; native button attributes pass through on the interactive form. */
export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Selected/active visual state. */
  active?: boolean
}

/**
 * Render a pill chip. Interactive when onClick is supplied (renders a button);
 * otherwise a static span.
 */
export function Pill({ active = false, className, children, onClick, ...rest }: PillProps): React.JSX.Element {
  const s = usePillStyle()
  if (!onClick) {
    return <span className={cx(s.pill, active && s.active, className)}>{children}</span>
  }
  return (
    <button
      type="button"
      className={cx(s.pill, s.interactive, active && s.active, className)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  )
}

/**
 * Return the pill class map, mounting its sheet on first use.
 * SegmentedTabs calls this before its own `useStyle` so Pill.module.css keeps its
 * official position ahead of SegmentedTabs.module.css; the tab's height, padding
 * and type are equal-specificity overrides of the pill's and depend on that order.
 */
export function usePillStyle(): Record<string, string> {
  return useStyle('pill', CSS)
}
