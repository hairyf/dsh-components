/* eslint-disable slop/no-em-dash -- the stylesheet below is copied verbatim from the official CSS module, comments included. */
import type * as React from 'react'
import { IconCloseOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/Modal.module.css */
/* Full-viewport layer (figma Mask + Dialog 451:18655): mask + centered card.
   24px of air on every side; the top/bottom widen to the frame's published
   overlay inset so a tall card stays clear of it.
   Cards size against this padding box: consumers cap growth with
   \`max-height: 100%\`, never their own viewport calc. */
.root {
  pointer-events: auto;
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(24px, var(--dsh-frame-overlay-top, 24px)) 24px;
}

/* Only paint excludes the native caption; the root still blocks background clicks. */
.mask {
  position: absolute;
  inset: var(--dsh-frame-chrome-top, 0px) 0 0;
  backdrop-filter: var(--dsw-mask-blur);
}

.mask::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--dsw-alias-bg-mask-1);
  animation: modalEnter var(--ds-transition-duration) var(--ds-ease-in-out);
}

/* Dialogs use the prominent elevation on the secondary layer. */
.dialog {
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: min(380px, 100%);
  padding: 0 0 24px;
  overflow: hidden;
  border: 0;
  border-radius: var(--dsw-radius-panel);
  background: var(--dsw-alias-bg-layer-2);
  box-shadow: var(--dsw-elevation-prominent);
  animation: modalEnter var(--ds-transition-duration) var(--ds-ease-in-out);
}

@keyframes modalEnter {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .mask::after, .dialog { animation: none; }
}

.dialog:focus {
  outline: none;
}

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Header row (figma Title row): pad l24/t22/r14/b12, SPACE_BETWEEN —
 * title left, close button right. */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 22px 14px 12px 24px;
}

.title {
  margin: 0;
  font-size: 16px;
  line-height: 24px;
  font-weight: 500; /* figma wt510, rendered 500 */
  color: var(--dsw-alias-label-primary);
}

.close {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--dsw-radius-sm);
  background: transparent;
  cursor: pointer;
  color: var(--dsw-alias-label-secondary);
}

@media (hover: hover) {
  .close:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

/* Description and body share the 332px content column (24px side pads). */
.description {
  margin: 0;
  padding: 0 24px;
  font-size: 14px;
  line-height: 22px;
  font-weight: 400;
  color: var(--dsw-alias-label-primary);
}

.body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-top: 20px;
  padding: 0 24px;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 24px;
}
`

/** Dialog and menu elements whose document order determines foreground shortcut ownership. */
export const modalSelector = '[role="dialog"][aria-modal="true"], [role="menu"]'

interface ModalLayer {
  element: HTMLElement
  close: () => void
}

const layers = new WeakMap<Document, ModalLayer[]>()

const navigationKeys = new Set([
  'Tab',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
])
const focusReleases = new WeakMap<HTMLElement, () => void>()

/**
 * Focus an automatic destination without a focus outline until keyboard navigation or blur.
 * The theme suppresses outlines while data-dsh-automatic-focus is present; borders and
 * shadows remain intact. Tab and directional navigation restore normal focus styling.
 * @param element - control or container receiving automatic focus.
 * @param options - browser focus options, including scroll preservation.
 */
export function focusWithoutRing(element: HTMLElement, options?: FocusOptions): void {
  focusReleases.get(element)?.()
  function release(): void {
    element.removeAttribute('data-dsh-automatic-focus')
    element.removeEventListener('blur', release)
    element.removeEventListener('keydown', navigate, true)
    focusReleases.delete(element)
  }
  function navigate(event: KeyboardEvent): void {
    if (!event.isComposing && !event.ctrlKey && !event.altKey && !event.metaKey && navigationKeys.has(event.key))
      release()
  }
  focusReleases.set(element, release)
  element.setAttribute('data-dsh-automatic-focus', '')
  element.addEventListener('blur', release)
  element.addEventListener('keydown', navigate, true)
  element.focus(options)
  if (!element.matches(':focus'))
    release()
}

/**
 * Observe composition until its closing key is released or consumed.
 * @param doc - document whose input events belong to the caller.
 * @returns an event guard and a disposer for all listeners.
 */
export function observeComposition(doc: Document): { guards: (event: KeyboardEvent) => boolean, dispose: () => void } {
  let composing = false
  let ended = false
  const start = (): void => {
    composing = true
  }
  const end = (): void => {
    composing = false
    ended = true
  }
  const release = (): void => {
    ended = false
  }
  const blur = (): void => {
    composing = false
    ended = false
  }
  doc.addEventListener('compositionstart', start, true)
  doc.addEventListener('compositionend', end, true)
  doc.addEventListener('keyup', release, true)
  doc.defaultView?.addEventListener('blur', blur)
  return {
    guards: (event) => {
      const guarded = composing || ended || event.isComposing || event.keyCode === 229
      ended = false
      return guarded
    },
    dispose: () => {
      doc.removeEventListener('compositionstart', start, true)
      doc.removeEventListener('compositionend', end, true)
      doc.removeEventListener('keyup', release, true)
      doc.defaultView?.removeEventListener('blur', blur)
    },
  }
}

/**
 * Request closure of the foreground registered modal using its current onClose callback.
 * A newer menu or unregistered dialog blocks dismissal of the modal behind it.
 * @param doc - product document whose modal owns the close command.
 */
export function closeTopModal(doc: Document): void {
  const top = layers.get(doc)?.at(-1)
  if (top === undefined)
    return
  if ([
    ...doc.querySelectorAll(modalSelector),
  ].at(-1) === top.element) {
    top.close()
  }
}

/**
 * Whether an anchor belongs behind the current modal and must yield keyboard input.
 * @param anchor - local control owning the input handler.
 * @returns true when another modal owns the foreground.
 */
export function isBehindModal(anchor: Element | null): boolean {
  if (anchor === null)
    return false
  const top = layers.get(anchor.ownerDocument)?.at(-1)
  return top !== undefined && !top.element.contains(anchor)
}

const focusable = 'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]'

/**
 * Give only the top modal Escape and Tab ownership, then restore its previous focus.
 * Automatic entry and return focus omit outlines; keyboard traversal retains its
 * indicators. Controls mounted with the dialog use data-modal-autofocus for initial
 * focus, because React autoFocus runs before this layer can capture the invoking control.
 * Local menus handle their Escape during capture before this bubble listener.
 * @param dialog - mounted dialog element.
 * @param open - whether this layer is active.
 * @param onClose - top-layer Escape or application close action.
 */
export function useModalLayer(
  dialog: React.RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
): void {
  const close = useRef(onClose)
  const pendingRestore = useRef<HTMLElement | undefined>(undefined)
  close.current = onClose
  useLayoutEffect(() => {
    const target = pendingRestore.current
    pendingRestore.current = undefined
    const element = dialog.current
    if (typeof document === 'undefined')
      return
    if (!open && element?.contains(element.ownerDocument.activeElement) && target?.isConnected && !target.closest('[inert], [hidden]') && !isBehindModal(target))
      focusWithoutRing(target, { preventScroll: true })
    if (!open || element === null)
      return
    const doc = element.ownerDocument
    const composition = observeComposition(doc)
    const previous = doc.activeElement
    const stack = layers.get(doc) ?? []
    layers.set(doc, stack)
    const layer: ModalLayer = {
      element,
      close: () => {
        close.current()
      },
    }
    stack.push(layer)
    const initial = element.querySelector<HTMLElement>('[data-modal-autofocus]') ?? element.querySelector<HTMLElement>(focusable) ?? element
    if (!element.contains(doc.activeElement))
      focusWithoutRing(initial)
    const keydown = (event: KeyboardEvent): void => {
      const composing = composition.guards(event)
      if (stack.at(-1) !== layer || event.defaultPrevented || composing || event.ctrlKey || event.altKey || event.metaKey)
        return
      if (event.key === 'Escape' && !event.shiftKey) {
        event.preventDefault()
        if (!event.repeat)
          close.current()
      }
      if (event.key !== 'Tab')
        return
      if (doc.activeElement?.closest('[role="menu"]'))
        return
      const items = [
        ...element.querySelectorAll<HTMLElement>(focusable),
      ].filter(item => !item.closest('[inert], [hidden]'))
      const first = items[0] ?? element
      const last = items.at(-1) ?? element
      const atEdge = event.shiftKey
        ? doc.activeElement === first
        : doc.activeElement === last
      if (doc.activeElement === element || !element.contains(doc.activeElement) || atEdge) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      }
    }
    doc.addEventListener('keydown', keydown)
    return () => {
      composition.dispose()
      const wasTop = stack.at(-1) === layer
      stack.splice(stack.indexOf(layer), 1)
      doc.removeEventListener('keydown', keydown)
      if (stack.length === 0)
        layers.delete(doc)
      if (wasTop) {
        const restore = previous instanceof HTMLElement && previous.isConnected
          ? previous
          : stack.at(-1)?.element
        if (restore !== undefined) {
          pendingRestore.current = restore
          focusWithoutRing(restore)
        }
      }
    }
  }, [dialog, open])
}

/**
 * Return the modal class map, mounting its sheet on first use.
 * RiskConfirmation calls this before its own `useStyle` so Modal.module.css keeps
 * its official position ahead of RiskConfirmation.module.css, whose
 * `.confirmation` width is an equal-specificity override of `.dialog`'s.
 */
export function useModalStyle(): Record<string, string> {
  return useStyle('modal', CSS)
}

interface ModalBaseProps {
  /** Whether the dialog is showing. */
  open: boolean
  /** Application close command, Escape, or mask click. */
  onClose: () => void
  /** Dialog heading (aria-label in every mode). */
  title: string
  /** Optional supporting sentence under the title. */
  description?: string
  /** Dialog body; mark its initial-focus control with data-modal-autofocus. */
  children?: React.ReactNode
  /** Action row (Cancel / Create). */
  footer?: React.ReactNode
  /** Extra class on the dialog card. */
  className?: string
  /** Optional class for a scrollable content region. */
  contentClassName?: string
  /** Command scope allowed by shortcut owners. */
  shortcutModal?: string
  /** Handle a nested dialog's keys before the document Escape listeners. */
  onKeyDownCapture?: React.KeyboardEventHandler<HTMLDivElement>
  /** Disable when the caller already blurs the page; defaults to true. */
  backdropBlur?: boolean
}

/** Props for {@link Modal}; a headless dialog owns its own close affordance. */
export type ModalProps = ModalBaseProps & (
  | { headless: true, closeLabel?: never }
  | { headless?: false, closeLabel: string }
)

/**
 * Render a centered, body-portaled modal over a blurred page mask.
 * While a menu is open inside the dialog, Escape belongs to that menu first.
 */
export function Modal({
  open,
  onClose,
  title,
  closeLabel,
  description,
  children,
  footer,
  className,
  contentClassName,
  onKeyDownCapture,
  headless = false,
  backdropBlur = true,
  shortcutModal,
}: ModalProps): React.ReactPortal | null {
  const s = useModalStyle()
  const dialog = useRef<HTMLDivElement>(null)
  useModalLayer(dialog, open, onClose)
  if (!open || typeof document === 'undefined')
    return null
  return createPortal(
    <div className={s.root} role="presentation" onKeyDownCapture={onKeyDownCapture}>
      <div
        className={s.mask}
        style={backdropBlur
          ? undefined
          : { backdropFilter: 'none' }}
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialog}
        tabIndex={-1}
        data-shortcut-modal={shortcutModal}
        className={cx(s.dialog, className)}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {headless
          ? children
          : (
              <>
                <div className={cx(s.content, contentClassName)}>
                  <div className={s.header}>
                    <h2 className={s.title}>{title}</h2>
                    <button type="button" className={s.close} aria-label={closeLabel} onClick={onClose}>
                      <IconCloseOutlineRegular size={14} />
                    </button>
                  </div>
                  {description !== undefined && description !== '' && <p className={s.description}>{description}</p>}
                  {children !== undefined && <div className={s.body}>{children}</div>}
                </div>
                {footer !== undefined && <div className={s.footer}>{footer}</div>}
              </>
            )}
      </div>
    </div>,
    document.body,
  )
}
