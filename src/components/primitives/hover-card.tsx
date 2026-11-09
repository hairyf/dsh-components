import type * as React from 'react'
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cx, useStyle } from '../../lib/style'
import { overlayTopMargin, usePointerGrace } from './menu'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/HoverCard.module.css */
/* Block, not inline-flex: consumers wrap full-width list rows and an
 * inline wrapper would shrink them; the card still measures this rect. */
.root {
  position: relative;
  display: block;
}

/* The preview remains hit-testable so pointer entry cancels the grace close. */
.card {
  --dsw-hovercard-bg: #2C2C2E;
  position: fixed;
  z-index: 100;
  box-sizing: border-box;
  width: 244px;
  padding: 12px 16px;
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-hovercard-bg);
  box-shadow: var(--dsw-shadow-lv3);
}

.copyable {
  cursor: pointer;
}

.copyable:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 2px;
}

.feedback {
  display: flex;
  align-items: center;
  justify-content: center;
}

.copied {
  color: #FFFFFF;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
}

.status {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.preview {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  box-shadow: var(--dsw-elevation-panel);
  opacity: 1;
  transition: opacity var(--dsh-hover-preview-fade) linear;
}

@starting-style {
  .preview { opacity: 0; }
}

.preview[data-closing] {
  opacity: 0;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .preview { transition: none; }
}

.inline { display: inline; }
.media {
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2);
  overflow: auto;
  padding: 8px;
  border: 0;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-specific-menu);
  backdrop-filter: var(--dsw-menu-backdrop-filter);
  box-shadow: var(--dsw-elevation-panel);
}

.fitContent {
  width: max-content;
}

.portal {
  display: contents;
}

.bridge {
  position: fixed;
  z-index: 100;
}
`

/** Preview opacity transition and retained lifetime during dismissal. */
const PREVIEW_FADE_MS = 100
const PREVIEW_MAX_HEIGHT = 420
const PREVIEW_INSET = 24
const INLINE_PREVIEW_WIDTH = 300
const ANCHOR_GAP = 8
const VIEWPORT_MARGIN = 8

interface GroupState {
  isWarm: () => boolean
  enter: (overCard: boolean) => void
  leave: () => void
  containsCard: (target: EventTarget | null) => boolean
  shown: (owner: symbol, dismiss: () => void, element: HTMLElement | null) => void
  release: (owner: symbol) => void
}

/**
 * Private coordination shared only by opted-in HoverCards inside one mounted group.
 */
export const HoverCardGroupContext = createContext<GroupState | null>(null)

/** Props for {@link HoverCardGroup}. */
export interface HoverCardGroupProps {
  /** List contents, including opted-in HoverCards. */
  children: React.ReactNode
  /** Classes for the physical list container. */
  className?: string
  /** Physical container tag; use span to preserve inline text layout. */
  as?: 'div' | 'span'
}

/**
 * Share first-display dwell across a list and its active portal, including the
 * card's existing pointer grace.
 */
export function HoverCardGroup({ children, className, as: Container = 'div' }: HoverCardGroupProps): React.JSX.Element {
  const [group] = useState<GroupState>(() => {
    let pointer: 'outside' | 'list' | 'card' = 'outside'
    let warm = false
    let active: { owner: symbol, dismiss: () => void, element: HTMLElement | null } | null = null
    return {
      isWarm: () => warm,
      enter: (overCard) => {
        pointer = overCard ? 'card' : 'list'
        if (overCard)
          warm = true
      },
      leave: () => {
        pointer = 'outside'
        if (active === null)
          warm = false
      },
      containsCard: target => target instanceof Node && active !== null && active.element?.contains(target) === true,
      shown: (owner, dismiss, element) => {
        if (pointer === 'card') {
          pointer = 'outside'
          warm = false
        }
        if (pointer === 'list')
          warm = true
        const previous = active
        active = { owner, dismiss, element }
        if (previous !== null && previous.owner !== owner)
          previous.dismiss()
      },
      release: (owner) => {
        if (active?.owner !== owner)
          return
        active = null
        if (pointer !== 'list') {
          pointer = 'outside'
          warm = false
        }
      },
    }
  })
  return (
    <HoverCardGroupContext.Provider value={group}>
      <Container
        className={className}
        onPointerOverCapture={(event: React.PointerEvent<HTMLElement>) => {
          const overCard = group.containsCard(event.target)
          if ((event.target instanceof Node && event.currentTarget.contains(event.target)) || overCard)
            group.enter(overCard)
        }}
        onPointerOutCapture={(event: React.PointerEvent<HTMLElement>) => {
          const fromGroup = (event.target instanceof Node && event.currentTarget.contains(event.target)) || group.containsCard(event.target)
          const intoGroup = (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) || group.containsCard(event.relatedTarget)
          if (fromGroup && !intoGroup)
            group.leave()
        }}
      >
        {children}
      </Container>
    </HoverCardGroupContext.Provider>
  )
}

interface CardPosition {
  left: number
  top: number
  width?: number
  maxWidth?: number
  maxHeight?: number
  bridge?: { left: number, top: number, width: number, height: number }
}

interface HoverCardBaseProps {
  /** The hover target (rendered in place inside a wrapper span). */
  anchor: React.ReactNode
  /** Inline media preview using the shared menu material and keyboard focus. */
  inline?: boolean
  fitContent?: boolean
  /** Card content; the pointer may rest on it, so it is readable and selectable. */
  content: React.ReactNode
  /** Hover dwell before the card shows (default 500). */
  openDelayMs?: number
  /** Suppress opening; turning true dismisses an open card. */
  disabled?: boolean
  /** Share first-display dwell across the surrounding list and active portal. */
  grouped?: boolean
  /** Compact card beside the anchor, or a preview above/below it. */
  variant?: 'compact' | 'preview'
  /** Optional element whose width and horizontal position size the preview. */
  widthAnchorRef?: React.RefObject<HTMLElement | null>
}

/** Props for {@link HoverCard}. */
export type HoverCardProps = HoverCardBaseProps & (
  | { copyText?: string, copyLabel: string, copiedLabel: string }
  | { copyText?: undefined, copyLabel?: string, copiedLabel?: string }
)

/**
 * Write text to the host clipboard, preferring the async Clipboard API and
 * falling back to `execCommand('copy')` on hosts that omit it.
 * @param text - the exact text to place on the clipboard.
 * @returns true only when the host accepted the write.
 */
async function writeClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    }
    catch {
      return false
    }
  }
  const exec = typeof document.execCommand === 'function'
    ? document.execCommand.bind(document)
    : undefined
  if (exec === undefined)
    return false
  const element = document.createElement('textarea')
  element.value = text
  element.setAttribute('readonly', '')
  element.style.position = 'fixed'
  element.style.left = '-9999px'
  document.body.appendChild(element)
  element.select()
  try {
    return exec('copy')
  }
  catch {
    return false
  }
  finally {
    element.remove()
  }
}

/**
 * Render an anchor with a hover-triggered preview card independently of nested
 * tooltips. Touch entry does not open a preview or intercept the anchor's action.
 */
export function HoverCard({
  anchor,
  content,
  openDelayMs = 500,
  disabled = false,
  grouped = false,
  copyText,
  copyLabel,
  copiedLabel,
  variant = 'compact',
  widthAnchorRef,
  inline = false,
  fitContent = false,
}: HoverCardProps): React.JSX.Element {
  const s = useStyle('hover-card', CSS)
  const rootRef = useRef<HTMLSpanElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<number | null>(null)
  const copyTimerRef = useRef<number | null>(null)
  const copyHeightRef = useRef<number | null>(null)
  const copyEpochRef = useRef(0)
  const copyingRef = useRef(false)
  const mountedRef = useRef(true)
  const [phase, setPhase] = useState<'closed' | 'open' | 'closing'>('closed')
  const open = phase !== 'closed'
  const closing = phase === 'closing'
  const [pos, setPos] = useState<CardPosition | null>(null)
  const positioned = pos !== null
  const [copied, setCopied] = useState(false)
  const parentGroup = useContext(HoverCardGroupContext)
  const group = grouped ? parentGroup : null
  const [groupOwner] = useState(() => Symbol('hover-card'))
  const clearCopied = useCallback(() => {
    if (copyTimerRef.current !== null) {
      clearTimeout(copyTimerRef.current)
      copyTimerRef.current = null
    }
    copyHeightRef.current = null
    setCopied(false)
  }, [])
  const close = useCallback(() => {
    copyEpochRef.current += 1
    clearCopied()
    setPhase(current => variant === 'preview' && current !== 'closed'
      ? 'closing'
      : 'closed')
  }, [clearCopied, variant])
  const { arm: armClose, cancel: cancelClose } = usePointerGrace(close)
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])
  const dismissImmediately = useCallback(() => {
    clearTimer()
    cancelClose()
    copyEpochRef.current += 1
    clearCopied()
    setPhase('closed')
  }, [clearTimer, cancelClose, clearCopied])
  const groupVisible = open && positioned
  useLayoutEffect(() => {
    if (!groupVisible || group === null)
      return
    group.shown(groupOwner, dismissImmediately, portalRef.current)
    return () => {
      group.release(groupOwner)
    }
  }, [
    group,
    groupOwner,
    groupVisible,
    dismissImmediately,
  ])
  useEffect(() => {
    if (!closing)
      return
    const timer = window.setTimeout(() => {
      setPhase('closed')
    }, PREVIEW_FADE_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [closing])
  useEffect(() => {
    if (!disabled)
      return
    clearTimer()
    cancelClose()
    close()
  }, [
    disabled,
    cancelClose,
    clearTimer,
    close,
  ])
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      copyEpochRef.current += 1
      clearTimer()
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current)
        copyTimerRef.current = null
      }
    }
  }, [clearTimer])
  useEffect(() => {
    if (!open || (variant !== 'preview' && !inline) || typeof window === 'undefined')
      return
    const dismiss = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape')
        return
      if (inline)
        event.stopPropagation()
      clearTimer()
      cancelClose()
      close()
    }
    window.addEventListener('keydown', dismiss, inline)
    return () => {
      window.removeEventListener('keydown', dismiss, inline)
    }
  }, [
    open,
    variant,
    inline,
    cancelClose,
    close,
    clearTimer,
  ])

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      return
    }
    const place = (): void => {
      const wrapper = rootRef.current
      if (wrapper === null)
        return
      if (wrapper.closest('[inert], [hidden]') !== null) {
        dismissImmediately()
        return
      }
      setPos(measureCardPosition({
        wrapper,
        card: cardRef.current,
        variant,
        inline,
        fitContent,
        widthAnchor: widthAnchorRef?.current ?? null,
      }))
    }
    place()
    const visibility = new MutationObserver(place)
    for (let ancestor = rootRef.current?.parentElement; ancestor != null; ancestor = ancestor.parentElement) {
      visibility.observe(ancestor, {
        attributes: true,
        attributeFilter: ['inert', 'hidden'],
      })
    }
    const observer = (variant === 'preview' || inline) && typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(place)
      : null
    for (const element of [cardRef.current, rootRef.current, widthAnchorRef?.current]) {
      if (element !== null && element !== undefined)
        observer?.observe(element)
    }
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      observer?.disconnect()
      visibility.disconnect()
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [
    open,
    variant,
    widthAnchorRef,
    positioned,
    inline,
    fitContent,
    dismissImmediately,
  ])

  useLayoutEffect(() => {
    if (!open || pos === null || variant === 'preview' || inline)
      return
    const h = cardRef.current?.offsetHeight ?? 0
    if (pos.top + h > window.innerHeight - VIEWPORT_MARGIN)
      setPos({ left: pos.left, top: window.innerHeight - h - VIEWPORT_MARGIN })
  }, [open, pos, variant, inline])
  const copy = async (text: string): Promise<void> => {
    if (copied || copyingRef.current)
      return
    copyingRef.current = true
    const copyEpoch = copyEpochRef.current
    const accepted = await writeClipboard(text)
    copyingRef.current = false
    const card = cardRef.current
    if (!accepted || !mountedRef.current || copyEpoch !== copyEpochRef.current || card === null)
      return
    const height = card.offsetHeight
    copyHeightRef.current = height > 0
      ? height
      : null
    setCopied(true)
    copyTimerRef.current = window.setTimeout(clearCopied, 1000)
  }
  const copyable = copyText !== undefined
  const dismissFromAnchor = (event: React.SyntheticEvent): void => {
    if (portalRef.current?.contains(event.target as Node) === true)
      return
    clearTimer()
    cancelClose()
    close()
  }

  // Typed explicitly so the `false` guard below stays a comparison against
  // ReactNode rather than a narrowed element type.
  const card: React.ReactNode = open && pos !== null && (
    <HoverCardSurface
      styles={s}
      cardRef={cardRef}
      position={pos}
      closing={closing}
      variant={variant}
      inline={inline}
      fitContent={fitContent}
      copyable={copyable}
      copied={copied}
      copyHeight={copyHeightRef.current}
      copyLabel={copyLabel}
      copiedLabel={copiedLabel}
      content={content}
      onCopy={() => {
        void copy(copyText ?? '')
      }}
    />
  )

  return (
    <span
      ref={rootRef}
      className={cx(s.root, inline && s.inline)}
      onFocus={inline
        ? (event) => {
            if (!disabled && event.target.matches(':focus-visible')) {
              cancelClose()
              setPhase('open')
            }
          }
        : undefined}
      onBlur={inline
        ? (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              clearTimer()
              cancelClose()
              close()
            }
          }
        : undefined}
      onPointerEnter={(event) => {
        if (disabled || event.pointerType === 'touch')
          return
        if (event.pointerType === 'mouse' && !window.matchMedia('(any-hover: hover)').matches)
          return
        cancelClose()
        if (open) {
          setPhase('open')
          return
        }
        clearTimer()
        if (group?.isWarm() === true) {
          setPhase('open')
        }
        else {
          timerRef.current = window.setTimeout(() => {
            setPhase('open')
          }, openDelayMs)
        }
      }}
      onPointerLeave={() => {
        clearTimer()
        if (open)
          armClose()
      }}
      onPointerDownCapture={dismissFromAnchor}
      onClickCapture={dismissFromAnchor}
    >
      {anchor}
      {open && copyable && (
        <span className={s.status} role="status">
          {copied ? copiedLabel : ''}
        </span>
      )}
      {card !== false && typeof document !== 'undefined' && createPortal(
        <span ref={portalRef} className={s.portal}>
          {pos?.bridge !== undefined && (
            <span className={s.bridge} style={pos.bridge} data-hovercard-bridge="" aria-hidden />
          )}
          {card}
        </span>,
        document.body,
      )}
    </span>
  )
}

/** The card element, placed and optionally made copyable. */
interface HoverCardSurfaceProps {
  styles: Record<string, string>
  cardRef: React.RefObject<HTMLDivElement | null>
  position: CardPosition
  closing: boolean
  variant: 'compact' | 'preview'
  inline: boolean
  fitContent: boolean
  copyable: boolean
  copied: boolean
  copyHeight: number | null
  copyLabel?: string
  copiedLabel?: string
  content: React.ReactNode
  onCopy: () => void
}

/**
 * Render the portaled card itself.
 * `position` carries the fixed viewport coordinates and size caps, `closing` fades a
 * preview out, and the copy props drive the optional copy-on-activation behaviour.
 */
function HoverCardSurface({
  styles,
  cardRef,
  position,
  closing,
  variant,
  inline,
  fitContent,
  copyable,
  copied,
  copyHeight,
  copyLabel,
  copiedLabel,
  content,
  onCopy,
}: HoverCardSurfaceProps): React.JSX.Element {
  const label = copyable && copyLabel !== undefined
    ? copyLabel
    : ''
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Enter' && event.key !== ' ')
      return
    event.preventDefault()
    onCopy()
  }
  const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    const selection = window.getSelection()
    if (selection !== null && !selection.isCollapsed) {
      for (let index = 0; index < selection.rangeCount; index += 1) {
        if (selection.getRangeAt(index).intersectsNode(event.currentTarget))
          return
      }
    }
    onCopy()
  }
  return (
    <div
      ref={cardRef}
      className={cx(
        styles.card,
        variant === 'preview' && styles.preview,
        inline && styles.media,
        inline && fitContent && styles.fitContent,
        copyable && styles.copyable,
        copied && styles.feedback,
      )}
      data-closing={closing || undefined}
      style={{
        'left': position.left,
        'top': position.top,
        'width': position.width,
        'maxWidth': position.maxWidth,
        'maxHeight': position.maxHeight,
        'minHeight': copied
          ? copyHeight ?? undefined
          : undefined,
        '--dsh-hover-preview-fade': `${String(PREVIEW_FADE_MS)}ms`,
      } as React.CSSProperties}
      role={copyable ? 'button' : undefined}
      tabIndex={copyable ? 0 : undefined}
      aria-label={copyable
        ? `${label}: ${String(content)}`
        : undefined}
      onClick={copyable ? handleClick : undefined}
      onKeyDown={copyable ? handleKeyDown : undefined}
    >
      {copied
        ? <span className={styles.copied} aria-hidden="true">{copiedLabel}</span>
        : content}
    </div>
  )
}

/** Everything the placement pass needs to measure. */
interface CardGeometry {
  wrapper: HTMLElement
  card: HTMLDivElement | null
  variant: 'compact' | 'preview'
  inline: boolean
  fitContent: boolean
  widthAnchor: HTMLElement | null
}

/**
 * Place a compact card beside its anchor, clamped to the viewport.
 * @param r - the anchor wrapper's rect.
 * @param height - the card's current height.
 */
function compactCardPosition(r: DOMRect, height: number): CardPosition {
  const top = r.top + height > window.innerHeight - VIEWPORT_MARGIN
    ? window.innerHeight - height - VIEWPORT_MARGIN
    : r.top
  return { left: r.right + ANCHOR_GAP, top }
}

/**
 * Place a preview card above or below its anchor, with side insets and a height cap.
 * @param r - the anchor wrapper's rect.
 * @param height - the card's current height.
 * @param bounds - the element whose width and horizontal position size the card.
 */
function previewCardPosition(r: DOMRect, height: number, bounds: DOMRect): CardPosition {
  const width = Math.max(0, Math.min(bounds.width - PREVIEW_INSET * 2, window.innerWidth - VIEWPORT_MARGIN * 2))
  const topMargin = overlayTopMargin(VIEWPORT_MARGIN, r, ANCHOR_GAP)
  const belowTop = Math.max(topMargin, r.bottom + ANCHOR_GAP)
  const above = Math.max(0, r.top - ANCHOR_GAP - topMargin)
  const below = Math.max(0, window.innerHeight - belowTop - VIEWPORT_MARGIN)
  const onTop = above >= Math.min(PREVIEW_MAX_HEIGHT, below)
  const maxHeight = Math.min(PREVIEW_MAX_HEIGHT, onTop
    ? above
    : below)
  return {
    left: Math.max(VIEWPORT_MARGIN, Math.min(bounds.left + PREVIEW_INSET, window.innerWidth - width - VIEWPORT_MARGIN)),
    top: onTop
      ? Math.max(topMargin, r.top - Math.min(height, maxHeight) - ANCHOR_GAP)
      : belowTop,
    width,
    maxHeight,
  }
}

/**
 * Place an inline card above or below its anchor, with a bridge across the gap.
 * @param r - the anchor wrapper's rect.
 * @param height - the card's current height.
 * @param card - the mounted card, read for its scroll height and width.
 * @param fitContent - whether the card keeps its content width.
 */
function inlineCardPosition(r: DOMRect, height: number, card: HTMLDivElement | null, fitContent: boolean): CardPosition {
  const measured = Math.max(height, card?.scrollHeight ?? 0)
  const maxWidth = Math.max(0, Math.min(INLINE_PREVIEW_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2))
  const width = fitContent
    ? Math.min(card?.offsetWidth ?? maxWidth, maxWidth)
    : maxWidth
  const topMargin = overlayTopMargin(VIEWPORT_MARGIN, r, ANCHOR_GAP)
  const belowTop = Math.max(topMargin, r.bottom + ANCHOR_GAP)
  const above = Math.max(0, r.top - ANCHOR_GAP - topMargin)
  const below = Math.max(0, window.innerHeight - belowTop - VIEWPORT_MARGIN)
  const onTop = measured > below && above > below
  const maxHeight = onTop ? above : below
  const left = Math.max(VIEWPORT_MARGIN, Math.min(r.left, window.innerWidth - width - VIEWPORT_MARGIN))
  const top = onTop
    ? r.top - ANCHOR_GAP - Math.min(measured, maxHeight)
    : belowTop
  const bridgeTop = onTop
    ? top + Math.min(measured, maxHeight)
    : r.bottom
  const bridgeLeft = Math.min(r.left, left)
  return {
    left,
    top,
    ...(fitContent
      ? {}
      : { width }),
    maxWidth,
    maxHeight,
    bridge: {
      left: bridgeLeft,
      top: bridgeTop,
      width: Math.max(r.right, left + width) - bridgeLeft,
      height: Math.max(0, (onTop ? r.top : top) - bridgeTop),
    },
  }
}

/**
 * Measure the anchor and choose the placement the current variant asks for.
 * The geometry names the anchor wrapper, the mounted card (read for its height and
 * scroll size), the active variant, and the optional width anchor.
 * @returns the card position, or null when the wrapper cannot be measured.
 */
function measureCardPosition({ wrapper, card, variant, inline, fitContent, widthAnchor }: CardGeometry): CardPosition | null {
  const r = wrapper.getBoundingClientRect()
  const height = card?.offsetHeight ?? 0
  if (variant === 'preview')
    return previewCardPosition(r, height, widthAnchor?.getBoundingClientRect() ?? r)
  if (inline)
    return inlineCardPosition(r, height, card, fitContent)
  return compactCardPosition(r, height)
}
