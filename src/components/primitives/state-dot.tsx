import type * as React from 'react'
import { IconCheckOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/StateDot.module.css */
/* Solid states keep the 10px layout slot but paint one 6px currentColor core. */
.dot {
  position: relative;
  display: inline-block;
  flex: none;
}

.dot::after {
  content: '';
  position: absolute;
  inset: 20%;
  border-radius: 50%;
  corner-shape: round;
  background: currentColor;
}

.dot[data-state='done'] {
  color: var(--dsw-alias-state-success-primary);
}

.dot[data-state='warning'] {
  color: var(--dsw-alias-state-warn-primary);
}

.dot[data-state='error'] {
  color: var(--dsw-alias-state-error-primary);
}

/* Idle is the absence of activity and uses the theme's neutral state step. */
.dot[data-state='idle'] {
  color: var(--dsw-alias-state-idle-primary);
}

/* Ongoing is the sole non-dot state: a quiet full ring sits behind a centered
 * breathing arc while the complete glyph rotates continuously. Both animations
 * share one 1.5s period so pinning their start times aligns them together. */
.spinner {
  flex: none;
  color: var(--dsw-alias-label-tertiary);
}

.spinnerMotion {
  transform-origin: center;
  animation: dsh-state-dot-spin 1.5s linear infinite;
}

.spinnerTrack,
.spinnerArc {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

.spinnerTrack {
  opacity: 0.25;
}

.spinnerArc {
  stroke-dasharray: 12 150;
  animation: dsh-state-dot-dash 1.5s ease-in-out infinite;
}

@keyframes dsh-state-dot-spin {
  to { transform: rotate(360deg); }
}

@keyframes dsh-state-dot-dash {
  0% {
    stroke-dasharray: 12 150;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 24 150;
    stroke-dashoffset: -6;
  }

  100% {
    stroke-dasharray: 12 150;
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinnerMotion,
  .spinnerArc {
    animation: none;
  }

  .spinnerArc {
    stroke-dasharray: 18 150;
    stroke-dashoffset: -3;
  }
}

.step { display: inline-flex; flex: none; align-items: center; justify-content: center; box-sizing: border-box; border-radius: 50%; corner-shape: round; border: 1.5px solid var(--dsw-alias-label-tertiary); color: var(--dsw-alias-label-primary-foreground); }
.step[data-state='done'] { border-color: var(--dsw-alias-state-success-primary); background: var(--dsw-alias-state-success-primary); }
.step[data-state='error'] { border-color: var(--dsw-alias-state-error-primary); background: var(--dsw-alias-state-error-primary); }
.step[data-state='warning'] { border-color: var(--dsw-alias-state-warn-primary); }
`

/**
 * State semantic: green done / amber user-attention / tertiary-grey loading /
 * red error / neutral-grey idle for a tracked subject with nothing in progress.
 */
export type StateDotState = 'done' | 'warning' | 'ongoing' | 'error' | 'idle'

/** Props for {@link StateDot}. */
export interface StateDotProps {
  /** Which of `done`, `warning`, `ongoing`, `error`, or `idle` to show. */
  state: StateDotState
  /** Outer diameter in px; defaults to 14 for ongoing and 10 for solid states. */
  size?: number
  /** Extra class for layout placement. */
  className?: string
  /** Compact dot by default; step uses a filled check or hollow pending circle. */
  appearance?: 'dot' | 'step'
}

/**
 * Set every CSS animation in the loader's subtree to start at document time zero,
 * so loaders inserted at different moments rotate in phase.
 * @param element - the mounted loader.
 */
function pinSpinner(element: SVGSVGElement): void {
  for (const animation of element.getAnimations?.({ subtree: true }) ?? [])
    animation.startTime = 0
}

/**
 * Pin the loader's CSS animations to document time zero on mount and on every
 * restart of its own animation.
 * @param element - the mounted loader, or null on unmount.
 */
function syncSpinner(element: SVGSVGElement | null): void {
  if (element === null)
    return
  pinSpinner(element)
  element.addEventListener('animationstart', () => {
    pinSpinner(element)
  })
}

/**
 * Render a state dot (aria-hidden; pair with text for accessibility).
 */
export function StateDot({ state, size, className, appearance = 'dot' }: StateDotProps): React.JSX.Element {
  const s = useStyle('state-dot', CSS)
  const edge = size ?? (state === 'ongoing'
    ? 14
    : 10)
  if (state === 'ongoing') {
    return (
      <svg
        ref={syncSpinner}
        className={cx(s.spinner, className)}
        data-state="ongoing"
        width={edge}
        height={edge}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <g className={s.spinnerMotion}>
          <circle className={s.spinnerTrack} cx="12" cy="12" r="9.5" />
          <circle className={s.spinnerArc} cx="12" cy="12" r="9.5" />
        </g>
      </svg>
    )
  }
  return (
    <span
      className={cx(appearance === 'step'
        ? s.step
        : s.dot, className)}
      data-state={state}
      style={{ width: edge, height: edge }}
      aria-hidden="true"
    >
      {appearance === 'step' && state === 'done' && <IconCheckOutlineRegular size={edge - 2} />}
    </span>
  )
}
