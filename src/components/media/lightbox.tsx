import type { HTMLAttributes } from 'react'
import type * as React from 'react'
import { IconCloseOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useStyle } from '../../lib/style'

/* The embedded sheet below is the official stylesheet, copied verbatim. */
const CSS = `/* Full-viewport layer that blocks background clicks, including on the Windows caption. */
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

/* Painted area below the Windows caption; like Modal, the caption stays unpainted. */
.stage {
  position: absolute;
  inset: var(--dsh-frame-chrome-top, 0px) 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

/* Shared dimming mask below the preview and its controls. */
.mask {
  position: absolute;
  inset: 0;
  background: var(--dsw-alias-bg-mask-1);
  backdrop-filter: var(--dsw-mask-blur);
}

.image {
  position: relative;
  max-width: min(100%, 1600px);
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-specific-input-major);
  border: 0;
  box-shadow: var(--dsw-elevation-prominent);
}

.close {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0.5px solid var(--dsw-alias-border-l2-darkmode-thin);
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsw-specific-input-major);
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
}

.close:focus-visible { outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: 3px; }
`

/** Viewer strings the owner resolves. */
export interface LightboxLabels {
  /** Accessible name of the viewer dialog. */
  readonly dialog: string
  /** Accessible label of the close control. */
  readonly close: string
}

/** Props for the document-level image viewer. */
export interface LightboxProps {
  /** The original image URL. */
  readonly src: string
  /** The image's alt text. */
  readonly alt: string
  /** Dialog and close-control strings. */
  readonly labels: LightboxLabels
  /** Dismiss callback owned by the opener. */
  readonly onClose: () => void
  /** Optional original-image gesture bindings. */
  readonly contextMenuProps?: Pick<HTMLAttributes<HTMLElement>, 'onContextMenu' | 'onKeyDown' | 'tabIndex'> | undefined
}

/**
 * Document-level image viewer opened by clicking a thumbnail.
 *
 * Closes on Escape, backdrop press, or the close control, and restores focus to
 * the opener on unmount. Rendered through a body portal so a transformed or
 * filtered ancestor cannot trap the fixed backdrop.
 * @returns The modal viewer dialog.
 */
export function Lightbox({ src, alt, labels, onClose, contextMenuProps }: LightboxProps): React.ReactPortal {
  const s = useStyle('lightbox', CSS)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    restoreRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || document.activeElement?.closest('[role="menu"]') !== null)
        return
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
      if (event.key === 'Tab') {
        event.preventDefault()
        closeRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      restoreRef.current?.focus()
    }
  }, [onClose])
  return createPortal(
    <div className={s.backdrop} role="dialog" aria-modal="true" aria-label={labels.dialog}>
      <div className={s.stage}>
        <div className={s.mask} aria-hidden="true" onMouseDown={onClose} />
        <img className={s.image} src={src} alt={alt} {...contextMenuProps} />
        <button ref={closeRef} type="button" className={s.close} aria-label={labels.close} onClick={onClose}>
          <IconCloseOutlineRegular size={16} />
        </button>
      </div>
    </div>,
    document.body,
  )
}
