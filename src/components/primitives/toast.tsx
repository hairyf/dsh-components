import type * as React from 'react'
import { IconCheckCircleOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/Toast.module.css */
/* The fade delay comes from the component as \`--dsh-toast-hold\`, so one value
   drives both the unmount timer and this animation; the fallback matches the
   component's own default. The fade DURATION still has to agree with FADE_MS
   in Toast.tsx, which no owner varies. */

.toast {
  position: fixed;
  top: 40px;
  left: 50%;
  /* Above the 1000 the image lightbox backdrop uses: a failure reported while
     a preview is open must stay readable. */
  z-index: 1100;
  /* Announcements never intercept clicks. */
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 10px;
  /* Fixed boxes with \`left\` set shrink-to-fit against the space RIGHT of
     \`left\` (the -50% translate happens after sizing), so an anchored banner
     near the window edge would wrap early. max-content sizes the box from
     its text alone, capped by the max-width below. */
  width: max-content;
  max-width: min(640px, calc(100vw - 48px));
  padding: 12px 16px;
  border-radius: var(--dsw-radius-lg);
  /* The design platform's toast surface is dark in BOTH themes (bluish-800
     light / bluish-750 dark), so the label and the action text below stay
     fixed instead of flipping with the theme. */
  background: var(--dsw-alias-toast-bg);
  color: var(--dsw-alias-toast-label);
  font-size: 14px;
  line-height: 22px;
  box-shadow: var(--dsw-shadow-lv3);
  transform: translateX(-50%);
  animation:
    dsh-toast-in 160ms ease-out,
    dsh-toast-fade 1000ms ease var(--dsh-toast-hold, 3000ms) forwards;
}

.icon {
  display: grid;
  place-items: center;
  flex: none;
  color: var(--dsw-alias-state-warn-label);
}

.icon.success {
  color: var(--dsw-alias-state-success-primary);
}

.text {
  min-width: 0;
}

.action {
  display: inline;
  padding: 0;
  border: 0;
  background: none;
  /* deepseek-400, brightened at the designer's request, reads as the action
     against the always-dark toast surface without an underline. */
  color: var(--dsw-static-deepseek-400);
  font: inherit;
  cursor: pointer;
  /* Breathing room where the action text meets the surrounding copy. */
  margin-inline: 3px;
  /* The banner surface stays click-through (\`pointer-events: none\` above);
     only its action text takes the pointer. */
  pointer-events: auto;
}

@media (hover: hover) {
  .action:hover {
    opacity: 0.8;
  }
}

@keyframes dsh-toast-in {
  from {
    opacity: 0;
    transform: translate(-50%, -6px);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes dsh-toast-fade {
  to {
    opacity: 0;
    visibility: hidden;
  }
}

/* Reduced motion drops the slide-in; the delayed fade (an opacity change,
   not movement) still ends the banner before the timed unmount. */
@media (prefers-reduced-motion: reduce) {
  .toast {
    animation: dsh-toast-fade 1000ms ease var(--dsh-toast-hold, 3000ms) forwards;
  }
}
`

/** Full-opacity hold before the fade starts, when the owner names none. */
const HOLD_MS = 3000
/** Fade duration. Must agree with the stylesheet's toast-fade duration. */
const FADE_MS = 1000

/** One inline action continuing the toast sentence. */
export interface ToastAction {
  label: string
  prefix?: string
  onClick: () => void
}

/** Props for {@link Toast}. */
export interface ToastProps {
  /** Resolved banner copy; the owner passes localized text. */
  text: string
  /** Optional leading glyph; ignored under `tone="success"`, which brings its own glyph. */
  icon?: React.ReactNode
  /** `success` renders the design's circled green check as the leading glyph. */
  tone?: 'success'
  /** Optional element whose horizontal center the banner follows. */
  anchor?: HTMLElement | null
  /** Full-opacity hold before the fade; defaults to 3000. */
  holdMs?: number
  /** Optional inline actions continuing the sentence. */
  actions?: readonly ToastAction[]
  /** Called once the fade completes; unmount the toast here. */
  onDone: () => void
}

/**
 * Transient top-center banner: slides in, holds at full opacity, fades out,
 * then reports done so the owner can unmount it. Rendered through a body portal
 * so an owner inside a transformed or filtered ancestor cannot trap the fixed
 * banner in that ancestor's box.
 */
export function Toast({ text, icon, tone, anchor, holdMs = HOLD_MS, actions, onDone }: ToastProps): React.ReactPortal | null {
  const s = useStyle('toast', CSS)
  const latestOnDone = useRef(onDone)
  useLayoutEffect(() => {
    latestOnDone.current = onDone
  }, [onDone])
  useEffect(() => {
    const timer = setTimeout(() => {
      latestOnDone.current()
    }, holdMs + FADE_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [holdMs])
  const [left, setLeft] = useState<number | null>(null)
  useLayoutEffect(() => {
    if (anchor == null)
      return
    const measure = (): void => {
      const rect = anchor.getBoundingClientRect()
      setLeft(rect.left + rect.width / 2)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
    }
  }, [anchor])
  if (typeof document === 'undefined')
    return null
  return createPortal(
    <div
      className={s.toast}
      role="alert"
      style={{
        ...(left === null
          ? {}
          : { left }),
        '--dsh-toast-hold': `${String(holdMs)}ms`,
      } as React.CSSProperties}
    >
      {tone === 'success'
        ? (
            <span className={`${s.icon} ${s.success ?? ''}`} aria-hidden>
              <IconCheckCircleOutlineRegular />
            </span>
          )
        : icon !== undefined && <span className={s.icon} aria-hidden>{icon}</span>}
      <span className={s.text}>
        {text}
        {actions?.map(action => (
          <Fragment key={action.label}>
            {action.prefix}
            <button type="button" className={s.action} onClick={action.onClick}>
              {action.label}
            </button>
          </Fragment>
        ))}
      </span>
    </div>,
    document.body,
  )
}
