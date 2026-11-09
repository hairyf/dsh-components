import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered verbatim from the official sheets:
 * - @deepseek-ai/dsh-client-ui-conversation / TodoPanel.module.css: .root, and
 *   the .body and .item/.empty paddings (the dock width and margins are left
 *   out so the frame follows its container)
 * - @deepseek-ai/dsh-client-ui-conversation / ContextMeter.module.css: the
 *   stronger .panel elevation
 */
const CSS = `.root {
  box-sizing: border-box;
  --dsw-elevation-stroke-color: var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-specific-menu);
  backdrop-filter: var(--dsw-menu-backdrop-filter);
  box-shadow: var(--dsw-elevation-panel);
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2);
  border: 0;
  overflow: hidden;
}

/* Only the official spacing is reused here; the flex layout lives in Stack. */
.body {
  padding: 6px 12px;
}

.item,
.empty {
  padding: 10px 14px;
}

/* The stronger official elevation step. */
.panel {
  box-shadow: var(--dsw-elevation-prominent);
}
`

/** Props for {@link Surface}. */
export interface SurfaceProps {
  /** Content laid out inside the frame. */
  children?: React.ReactNode
  /** Spacing step: none, 6px 12px, or 10px 14px. */
  padding?: 'none' | 'sm' | 'md'
  /** Promote the frame to the stronger official shadow. */
  elevated?: boolean
  /** Extra class for placement. */
  className?: string
}

/**
 * Render a framed panel that accepts its content from the caller.
 * @param props - content, padding step, elevation, and placement class.
 * @returns The framed panel.
 */
export function Surface(props: SurfaceProps): React.JSX.Element {
  const { children, padding = 'none', elevated = false, className } = props
  const s = useStyle('surface', CSS)
  const inset = padding === 'sm'
    ? s.body
    : padding === 'md'
      ? s.item
      : undefined
  return (
    <div className={cx(s.root, elevated && s.panel, className)}>
      {inset === undefined
        ? children
        : <div className={inset}>{children}</div>}
    </div>
  )
}
