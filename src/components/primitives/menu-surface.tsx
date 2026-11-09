import type * as React from 'react'
import { forwardRef, useId, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/MenuSurface.module.css */
.surface,
.backing {
  border-radius: var(--dsw-radius-lg);
}

.compact {
  border-radius: var(--dsw-radius-md);
}

:where(.surface) {
  position: relative;
}

.surface {
  anchor-name: var(--dsh-menu-anchor);
  isolation: isolate;
}

/* Filtering only the background keeps nested menus and fixed overlays free of
 * an ancestor backdrop root or a new fixed-position containing block. */
.material {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: var(--dsw-menu-surface-fill);
  backdrop-filter: var(--dsw-menu-backdrop-filter);
  pointer-events: none;
}

.backing {
  display: none;
}

/* Chromium needs opaque pixels behind the page content to blur it over native
 * vibrancy. Body isolation keeps this backing above the native window and below
 * the page; CSS anchors limit it to this menu without a layout observer. */
:global(html[data-platform='darwin']) .backing {
  display: block;
  position: fixed;
  position-anchor: var(--dsh-menu-anchor);
  top: anchor(top);
  left: anchor(left);
  width: anchor-size(width, 0px);
  height: anchor-size(height, 0px);
  z-index: -1;
  background: var(--dsw-alias-bg-base);
  pointer-events: none;
}

/* Opacity on the container would prevent its material from blurring the page.
 * Enter animations release their compositing layers so nested menus can blur too. */
.surface[data-menu-phase='enter'] > *,
.backing[data-menu-phase='enter'] { animation: dsh-context-menu-in var(--dsh-menu-enter) ease-out; }
.surface[data-menu-phase='dismiss'] > *,
.backing[data-menu-phase='dismiss'],
.surface[data-menu-phase='replace'] > *,
.backing[data-menu-phase='replace'] { animation: dsh-context-menu-out var(--dsh-menu-dismiss) ease-in both; }
.surface[data-menu-phase='replace'] > *,
.backing[data-menu-phase='replace'] { animation-duration: var(--dsh-menu-replace); }
@keyframes dsh-context-menu-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes dsh-context-menu-out { from { opacity: 1; } to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .surface[data-menu-phase] > *, .backing[data-menu-phase] { animation-duration: 0ms; }
}
`

/** Context-menu transition durations in milliseconds, shared with its lifecycle owner. */
export const MENU_TRANSITION_MS = Object.freeze({
  enter: 40,
  dismiss: 80,
  replace: 10,
  prepare: 20,
} as const)

/** Menu containers preserve native div props and refs. */
export interface MenuSurfaceProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Match the shared compact menu's smaller outer radius. */
  compact?: boolean
  /** Fade direct content, material, and native backing without isolating the material's backdrop. */
  phase?: 'enter' | 'dismiss' | 'replace'
}

/**
 * Paint a menu and, on macOS, an opaque backing behind the page content within its bounds.
 * CSS anchors keep each backing aligned during placement, resizing, and nested-menu movement.
 */
export const MenuSurface = forwardRef<HTMLDivElement, MenuSurfaceProps>((
  { compact = false, phase, className, style, children, ...props },
  ref,
) => {
  const s = useStyle('menu-surface', CSS)
  const id = useId()
  const backingRef = useRef<HTMLDivElement | null>(null)
  useLayoutEffect(() => {
    const backing = backingRef.current
    if (backing === null || typeof document === 'undefined')
      return
    document.body.appendChild(backing)
  }, [])
  const anchorStyle = {
    '--dsh-menu-anchor': `--dsh-menu-${id.replaceAll(':', '')}`,
    '--dsh-menu-enter': `${String(MENU_TRANSITION_MS.enter)}ms`,
    '--dsh-menu-dismiss': `${String(MENU_TRANSITION_MS.dismiss)}ms`,
    '--dsh-menu-replace': `${String(MENU_TRANSITION_MS.replace)}ms`,
  } as React.CSSProperties
  return (
    <>
      <div
        {...props}
        ref={ref}
        data-menu-material="translucent"
        data-menu-phase={phase}
        className={cx(s.surface, compact && s.compact, className)}
        style={{
          ...style,
          ...anchorStyle,
        }}
      >
        <div aria-hidden="true" className={s.material} />
        {children}
      </div>
      {typeof document === 'undefined'
        ? null
        : createPortal(
            <div
              ref={backingRef}
              aria-hidden="true"
              data-menu-backing=""
              data-menu-phase={phase}
              className={cx(s.backing, compact && s.compact)}
              style={{ ...anchorStyle, visibility: style?.visibility }}
            />,
            document.body,
          )}
    </>
  )
})
