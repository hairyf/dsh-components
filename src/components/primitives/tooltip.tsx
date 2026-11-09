import type * as React from 'react'
import { cloneElement, createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStyle } from '../../lib/style'
import { ShortcutKeys } from './shortcut-keys'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/Tooltip.module.css */
.bubble {
  display: inline-flex;
  align-items: safe center;
  gap: 8px;
  position: fixed;
  z-index: 100;
  /* Fixed-position shrink-to-fit measures only the space from \`left\` to the
     viewport edge, so anchors near the right edge would wrap early;
     max-content sizes by the label alone, capped at half the viewport. */
  width: max-content;
  box-sizing: border-box;
  max-width: min(50vw, calc(100vw - 24px));
  max-height: calc(100vh - 24px);
  overflow: auto;
  padding: 3px 7px;
  border-radius: var(--dsw-radius-sm);
  background: var(--dsw-alias-tooltip-bg);
  color: var(--dsw-static-neutral-bluish-00);
  font-size: 13px;
  line-height: 20px;
  white-space: pre-line;
  /* Unbreakable tokens (URLs, paths) must not push past max-width. */
  overflow-wrap: break-word;
  pointer-events: none;
  animation: tooltip-in 150ms var(--ds-ease-in-out);
}

.bubble[data-portal] { z-index: 1100; }
.bubble[data-pinned] { pointer-events: auto; }
.label { min-width: 0; }

/* A 16px keycap centered beside a 20px label has 5px of vertical clearance. */
.bubble[data-has-shortcut] { padding-inline-end: 5px; }
.bubble[data-has-shortcut]:not(:has(.label)) { padding: 3px; }

.bubble[data-side='right'],
.bubble[data-side='left'] {
  transform: translateY(-50%);
}

.bubble[data-side='bottom'] {
  transform: translateX(-50%);
}

.bubble[data-side='top'] {
  transform: translate(-50%, -100%);
}

/* End alignment: \`left\` carries the anchor's right edge, so the bubble sits
   fully left of it instead of centering. */
.bubble[data-side='bottom'][data-align='end'] {
  transform: translateX(-100%);
}

.bubble[data-side='top'][data-align='end'] {
  transform: translate(-100%, -100%);
}

@keyframes tooltip-in {
  from { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .bubble {
    animation: none;
  }
}
`

/** Side a tooltip bubble was placed on. */
export type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

interface AnchorRect {
  top: number
  left: number
  right: number
  bottom: number
}

interface TooltipPlacementInput {
  anchor: AnchorRect
  width: number
  height: number
  viewportWidth: number
  viewportHeight: number
  side: TooltipSide
  align: 'center' | 'end'
  gap: number
}

interface TooltipPlacement {
  left: number
  top: number
  side: TooltipSide
  width: number
  height: number
  overflow: boolean
}

const opposite: Record<TooltipSide, TooltipSide> = {
  right: 'left',
  left: 'right',
  top: 'bottom',
  bottom: 'top',
}

/**
 * Prefer the requested side, its opposite, then perpendicular sides without covering the anchor.
 * @param input - Observed dimensions, anchor edges, viewport and requested placement; horizontal gaps remain 10px.
 * @returns Border-box coordinates and the selected side; if no side fits, a viewport-bounded fallback.
 */
function placeTooltip(input: TooltipPlacementInput): TooltipPlacement {
  const { anchor, viewportWidth, viewportHeight, side, align, gap } = input
  const margin = 12
  const maxWidth = Math.max(0, viewportWidth - margin * 2)
  const maxHeight = Math.max(0, viewportHeight - margin * 2)
  const width = Math.min(input.width, maxWidth)
  const height = Math.min(input.height, maxHeight)
  const clampX = (x: number): number => Math.max(margin, Math.min(x, viewportWidth - margin - width))
  const clampY = (y: number): number => Math.max(margin, Math.min(y, viewportHeight - margin - height))
  const horizontal = side === 'right' || side === 'left'
  const candidates: TooltipSide[] = [
    side,
    opposite[side],
    ...(horizontal
      ? ['bottom', 'top'] as const
      : ['right', 'left'] as const),
  ]
  const positions: Record<TooltipSide, { left: number, top: number }> = {
    right: {
      left: anchor.right + 10,
      top: clampY((anchor.top + anchor.bottom - height) / 2),
    },
    left: {
      left: anchor.left - 10 - width,
      top: clampY((anchor.top + anchor.bottom - height) / 2),
    },
    bottom: {
      left: clampX(align === 'end'
        ? anchor.right - width
        : (anchor.left + anchor.right - width) / 2),
      top: anchor.bottom + gap,
    },
    top: {
      left: clampX(align === 'end'
        ? anchor.right - width
        : (anchor.left + anchor.right - width) / 2),
      top: anchor.top - gap - height,
    },
  }
  for (const candidate of candidates) {
    const position = positions[candidate]
    if (
      position.left >= margin
      && position.top >= margin
      && position.left + width <= viewportWidth - margin
      && position.top + height <= viewportHeight - margin
    ) {
      return {
        ...position,
        side: candidate,
        width,
        height,
        overflow: false,
      }
    }
  }
  const position = positions[side]
  return {
    left: clampX(position.left),
    top: clampY(position.top),
    side,
    width,
    height,
    overflow: true,
  }
}

/** Modality values published on the document element. */
const INPUT_MODALITY_ATTRIBUTE = 'data-input-modality'
const FOCUS_NAVIGATION = new Set([
  'Tab',
  'Home',
  'End',
  'PageUp',
  'PageDown',
])

let pointer = false
let pointerOwnsFocus = false
let keyFocusOrigin: EventTarget | undefined

function publishModality(): void {
  document.documentElement.setAttribute(INPUT_MODALITY_ATTRIBUTE, pointerOwnsFocus ? 'pointer' : 'keyboard')
}

/**
 * Whether the last input came from a pointer, independently of ring visibility.
 * The document-wide listeners mirror the official input-modality tracker; they
 * live for the document lifetime and are inert during server render.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', () => {
    pointer = true
    pointerOwnsFocus = true
    keyFocusOrigin = undefined
    publishModality()
  }, true)
  window.addEventListener('keydown', (event) => {
    pointer = false
    if (event.isComposing) {
      keyFocusOrigin = undefined
      return
    }
    keyFocusOrigin = event.composedPath()[0]
    if (!FOCUS_NAVIGATION.has(event.key) && !event.key.startsWith('Arrow'))
      return
    pointerOwnsFocus = false
    publishModality()
  }, true)
  window.addEventListener('focusin', (event) => {
    if (keyFocusOrigin === undefined || event.composedPath()[0] === keyFocusOrigin)
      return
    keyFocusOrigin = undefined
    if (!pointerOwnsFocus)
      return
    pointerOwnsFocus = false
    publishModality()
  }, true)
  window.addEventListener('blur', () => {
    keyFocusOrigin = undefined
  })
}

/**
 * Whether the last input came from a pointer, independently of ring visibility.
 * @returns True after pointer input; false after any key.
 */
function pointerModality(): boolean {
  return pointer
}

/**
 * Close an open popover when a pointerdown lands outside its root element.
 * @param root - element containing both the trigger and the open surface.
 * @param open - whether the surface is showing; false detaches the listener.
 * @param dismiss - invoked on an outside pointerdown.
 * @param portal - surface portaled outside the root that also counts as inside.
 */
function useDismissOnOutsidePointer(
  root: React.RefObject<HTMLElement | null>,
  open: boolean,
  dismiss: () => void,
  portal?: React.RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!open || typeof document === 'undefined')
      return
    const closeOutside = (event: PointerEvent): void => {
      if (event.target instanceof Node && root.current?.contains(event.target) !== true && portal?.current?.contains(event.target) !== true)
        dismiss()
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
    }
  }, [root, open, dismiss, portal])
}

/**
 * Suppression channel for nested tooltips: a visible descendant tooltip
 * withdraws the enclosing tooltip while its bubble is shown.
 */
export const TooltipSuppression = createContext<((suppressed: boolean) => void) | null>(null)

/** Props Tooltip injects into its anchor child; the child's own handlers are chained ahead of the tooltip's. */
export interface TooltipAnchorProps {
  'aria-describedby'?: string
  'ref'?: React.Ref<HTMLElement>
  'onPointerEnter'?: React.PointerEventHandler<HTMLElement>
  'onPointerLeave'?: React.PointerEventHandler<HTMLElement>
  'onPointerDown'?: React.PointerEventHandler<HTMLElement>
  'onClick'?: React.MouseEventHandler<HTMLElement>
  'onFocus'?: React.FocusEventHandler<HTMLElement>
  'onBlur'?: React.FocusEventHandler<HTMLElement>
}

/** Label text, or a resolver evaluated only while the bubble is visible. */
export type TooltipLabel = string | (() => string)

/**
 * Props for {@link Tooltip}; the anchor element is cloned, never wrapped.
 */
export interface TooltipProps {
  /** Bubble text, or a resolver evaluated only while visible; an empty string shows only shortcut keys. */
  label: TooltipLabel
  /** Effective key labels rendered as platform-formatted keycaps after optional text. */
  shortcutKeys?: readonly string[]
  /** Preferred placement (default 'right'); fitting tries the opposite then perpendicular sides. */
  side?: TooltipSide
  /** Horizontal anchor-edge alignment for 'bottom'/'top' bubbles; horizontal placements ignore it. */
  align?: 'center' | 'end'
  /** Hover delay in milliseconds (default 0). */
  delayMs?: number
  /** Keyboard focus delay in milliseconds (default 0). */
  focusDelayMs?: number
  /** Anchor-to-bubble distance in pixels for 'bottom'/'top' bubbles (default 8). */
  gap?: number
  /** Suppress the bubble while true; the anchor renders identically. */
  disabled?: boolean
  /** Render the bubble under document.body, so an ancestor's clipping cannot hide it. */
  portal?: boolean
  /** Bubble width cap in pixels, always bounded by viewport margins. */
  maxWidth?: number
  /** Clicking or tapping also pins the bubble for reading. */
  openOnClick?: boolean
  /** Show the bubble only when the anchor or an HTML element inside it overflows horizontally. */
  onlyWhenClipped?: boolean
  /** A single anchor element; its own ref is forwarded alongside the tooltip's. */
  children: React.ReactElement<TooltipAnchorProps>
}

function clipped(anchor: HTMLElement): boolean {
  return [
    anchor,
    ...anchor.querySelectorAll<HTMLElement>('*'),
  ].some(element => element.scrollWidth > element.clientWidth)
}

/**
 * Attach a hover/focus tooltip to an anchor element. The bubble is fixed-position,
 * measured through ResizeObserver, and portaled only on request.
 */
export function Tooltip({
  label,
  shortcutKeys,
  side = 'right',
  align = 'center',
  delayMs = 0,
  focusDelayMs = 0,
  gap = 8,
  disabled = false,
  portal = false,
  maxWidth,
  openOnClick = false,
  onlyWhenClipped = false,
  children,
}: TooltipProps): React.JSX.Element {
  const s = useStyle('tooltip', CSS)
  const id = useId()
  const [pinned, setPinned] = useState(false)
  const anchor = useRef<HTMLElement | null>(null)
  const childRef = children.props.ref
  const mergedRef = useCallback((element: HTMLElement | null) => {
    anchor.current = element
    if (typeof childRef === 'function')
      childRef(element)
    else if (childRef != null)
      childRef.current = element
  }, [childRef])
  const [pos, setPos] = useState<AnchorRect | null>(null)
  const bubble = useRef<HTMLSpanElement | null>(null)
  const resolvedLabel = pos === null
    ? null
    : typeof label === 'function'
      ? label()
      : label
  const showTimer = useRef<number | null>(null)
  const triggers = useRef({ hover: false, focus: false })
  const suppressAncestors = useContext(TooltipSuppression)
  const [suppressed, setSuppressed] = useState(false)
  const announce = useCallback((active: boolean) => {
    suppressAncestors?.(active)
  }, [suppressAncestors])
  const visible = pos !== null && !disabled
  useEffect(() => {
    const element = bubble.current
    if (pos === null || !visible || suppressed || element === null)
      return
    let size: ResizeObserverSize | undefined
    let anchorRect = pos
    const fit = (): void => {
      if (size === undefined)
        return
      const placement = placeTooltip({
        anchor: anchorRect,
        width: size.inlineSize,
        height: size.blockSize,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        side,
        align,
        gap,
      })
      const horizontal = placement.side === 'right' || placement.side === 'left'
      const offsetX = horizontal
        ? 0
        : align === 'end'
          ? placement.width
          : placement.width / 2
      const offsetY = horizontal
        ? placement.height / 2
        : placement.side === 'top'
          ? placement.height
          : 0
      element.style.left = `${String(placement.left + offsetX)}px`
      element.style.top = `${String(placement.top + offsetY)}px`
      element.dataset.side = placement.side
      element.style.visibility = 'visible'
    }
    const onResize = (): void => {
      if (anchor.current !== null)
        anchorRect = anchor.current.getBoundingClientRect()
      fit()
    }
    const observer = new ResizeObserver((entries) => {
      size = entries[0]?.borderBoxSize[0]
      fit()
    })
    observer.observe(element, { box: 'border-box' })
    window.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [
    align,
    gap,
    pos,
    side,
    suppressed,
    visible,
  ])
  useEffect(() => {
    announce(visible)
    return () => {
      announce(false)
    }
  }, [announce, visible])
  const cancelShow = useCallback(() => {
    if (showTimer.current === null)
      return
    clearTimeout(showTimer.current)
    showTimer.current = null
  }, [])
  useEffect(() => {
    if (pinned && (disabled || !openOnClick))
      setPinned(false)
    if (disabled) {
      cancelShow()
      triggers.current = { hover: false, focus: false }
      setPos(null)
    }
    return cancelShow
  }, [
    cancelShow,
    disabled,
    openOnClick,
    pinned,
  ])
  const show = (): void => {
    if (disabled)
      return
    const element = anchor.current
    if (element === null)
      return
    if (onlyWhenClipped && !clipped(element))
      return
    setPos(element.getBoundingClientRect())
    announce(true)
  }
  const showAfterDelay = (delay: number): void => {
    cancelShow()
    if (delay <= 0) {
      show()
      return
    }
    showTimer.current = window.setTimeout(() => {
      showTimer.current = null
      show()
    }, delay)
  }
  const withdraw = useCallback(() => {
    setPinned(false)
    setPos(null)
    announce(false)
  }, [announce])
  const hide = (): void => {
    cancelShow()
    if (!triggers.current.hover && !triggers.current.focus && !pinned)
      withdraw()
  }
  const dismiss = useCallback(() => {
    cancelShow()
    triggers.current = { hover: false, focus: false }
    withdraw()
  }, [cancelShow, withdraw])
  useDismissOnOutsidePointer(anchor, openOnClick && visible, dismiss, bubble)
  useEffect(() => {
    if (!openOnClick || !visible || typeof document === 'undefined')
      return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' && event.key !== 'Tab')
        return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
      }
      dismiss()
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [dismiss, openOnClick, visible])
  // Typed explicitly so the `false` guard below stays a comparison against
  // ReactNode rather than a narrowed element type.
  const content: React.ReactNode = visible && !suppressed && (
    <span
      ref={bubble}
      id={openOnClick ? id : undefined}
      className={s.bubble}
      data-side={side}
      data-portal={portal || undefined}
      data-pinned={pinned || undefined}
      data-align={align}
      data-has-shortcut={shortcutKeys?.length ? true : undefined}
      style={{
        left: pos.left,
        top: pos.top,
        visibility: 'hidden',
        ...(maxWidth === undefined
          ? {}
          : { maxWidth: `min(${String(maxWidth)}px, calc(100vw - 24px))` }),
      }}
      role="tooltip"
      aria-label={shortcutKeys?.length
        ? [
            resolvedLabel,
            shortcutKeys.join(' '),
          ].filter(Boolean).join(' ')
        : undefined}
    >
      {resolvedLabel && <span className={s.label}>{resolvedLabel}</span>}
      {shortcutKeys !== undefined && shortcutKeys.length > 0 && <ShortcutKeys keys={shortcutKeys} variant="tooltip" />}
    </span>
  )
  return (
    <TooltipSuppression.Provider value={setSuppressed}>
      {cloneElement(children, {
        'ref': mergedRef,
        'aria-describedby': openOnClick && visible
          ? [children.props['aria-describedby'], id].filter(Boolean).join(' ')
          : children.props['aria-describedby'],
        'onPointerEnter': (event: React.PointerEvent<HTMLElement>) => {
          children.props.onPointerEnter?.(event)
          if (event.pointerType === 'touch')
            return
          if (event.pointerType === 'mouse' && !window.matchMedia('(any-hover: hover)').matches)
            return
          triggers.current.hover = true
          showAfterDelay(delayMs)
        },
        'onPointerLeave': (event: React.PointerEvent<HTMLElement>) => {
          children.props.onPointerLeave?.(event)
          triggers.current.hover = false
          cancelShow()
          if (!pinned)
            withdraw()
        },
        'onPointerDown': (event: React.PointerEvent<HTMLElement>) => {
          children.props.onPointerDown?.(event)
          if (event.pointerType === 'touch' && !pinned)
            dismiss()
        },
        'onClick': (event: React.MouseEvent<HTMLElement>) => {
          children.props.onClick?.(event)
          triggers.current.focus = false
          cancelShow()
          if (openOnClick && !disabled && !pinned) {
            setPinned(true)
            show()
          }
          else { withdraw() }
        },
        'onFocus': (event: React.FocusEvent<HTMLElement>) => {
          children.props.onFocus?.(event)
          if (pointerModality())
            return
          triggers.current.focus = true
          showAfterDelay(focusDelayMs)
        },
        'onBlur': (event: React.FocusEvent<HTMLElement>) => {
          children.props.onBlur?.(event)
          triggers.current.focus = false
          hide()
        },
      })}
      {portal
        ? content !== false && typeof document !== 'undefined' && createPortal(content, document.body)
        : content}
    </TooltipSuppression.Provider>
  )
}
