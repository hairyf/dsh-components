/* eslint-disable slop/no-em-dash -- the stylesheet below is copied verbatim from the official CSS module, comments included. */
import type * as React from 'react'
import { focusWithoutRing, IconCheckOutlineRegular, isBehindModal, observeComposition, ShortcutKeys, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cx, useStyle } from '../../lib/style'
import { MenuSurface } from './menu-surface'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/Menu.module.css */
.root {
  position: relative;
  display: inline-flex;
}

/* Compact translucent dropdown card shared by feature menus. */
.list,
.submenu {
  /* min-widths below are the design's outer card widths — include the pad. */
  box-sizing: border-box;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 0;
  --dsw-elevation-stroke-color: var(--dsw-alias-border-l1);
  box-shadow: var(--dsw-elevation-prominent);
  /* Elevated surface: the scrollbar thumb takes the l2 elevation tokens. The
     declaration sits on the card rather than on \`.scrollable .viewport\`
     because the elevation is a property of this surface, and the custom
     properties inherit down to whichever descendant actually scrolls (see
     ui-theme styles/scrollbar.css for the rebinding contract). */
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2);
}

/* Primary cards grow with their content between compact and readable bounds. */
.list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  min-width: min(144px, var(--dsh-anchored-max-width, 100vw));
  max-width: min(360px, var(--dsh-anchored-max-width, 100vw));
}

/* Legacy slots can render no rows; keep empty context popups out of layout. */
.list[data-context-menu]:not(:has([role='menuitem'])) {
  display: none;
}

/* Portal mode: fixed in the viewport, coordinates supplied inline from the
 * anchor rect (side/align resolved in JS, the in-place offset rules above
 * don't apply). Portaled lists must layer above modal overlays (z 1000) —
 * an anchor inside a dialog still expects its menu on top. */
.portal {
  position: fixed;
  top: auto;
  left: auto;
  z-index: 1100;
}

/* Open above the anchor (empty-state workspace chip: figma 122:9481). */
.sideTop {
  top: auto;
  bottom: calc(100% + 4px);
}

.alignEnd {
  left: auto;
  right: 0;
}

/* Viewport fit: the card stops 12px short of the viewport's top/bottom edges
 * (the portal MARGIN in Menu.tsx; the top side widens to the frame's published
 * overlay inset) and taller content scrolls inside .viewport, so a pinned
 * .footer stays visible. The dynamic unit, not \`vh\`: mobile browser chrome
 * shrinks the visible height while \`vh\` keeps the taller bars-hidden height, so
 * a \`vh\` cap exceeds the viewport the placement clamps into and the card ends
 * up taller than the screen showing it. Menus with submenu rows skip this
 * class — the overflow clip would crop the side card, so they rely on staying
 * short. */
.scrollable {
  max-height: min(calc(100vh - 12px - max(12px, var(--dsh-frame-overlay-top, 12px))), var(--dsh-anchored-max-height, 100vh));
  max-height: min(calc(100dvh - 12px - max(12px, var(--dsh-frame-overlay-top, 12px))), var(--dsh-anchored-max-height, 100vh));
}

.viewport {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.scrollable .viewport {
  overflow-y: auto;
}

/* Pinned rows below the scroll region; l2 hairline (l1 is near-invisible on
 * the menu surface) mirrors the .separator spacing. */
.footer {
  flex: none;
  display: flex;
  flex-direction: column;
  margin-top: 3px;
  padding-top: 3px;
  border-top: 0.5px solid var(--dsw-alias-border-l2);
}

.list[data-context-menu] .footer:has(> .separator:first-child) {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.itemWrap {
  position: relative;
}

/* Menu cell: compact text, icon, and selection spacing. */
.item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 34px;
  padding: 6px 8px;
  border: none;
  border-radius: var(--dsw-radius-md);
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-primary);
  text-align: left;
}

@media (hover: hover) {
  .item:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

/* Arrow navigation moves real focus, so the row the keyboard is on carries the
   same fill the pointer gets: the fill is the row's focus indication, and the
   browser's default ring would double it. */
.item:focus-visible:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
  outline: none;
}

.denseList .item {
  min-height: 30px;
  padding-block: 4px;
}

.denseList .label {
  padding-block: 3px;
}

.list.compactList,
.submenu.compactList {
  min-width: min(156px, var(--dsh-anchored-max-width, 100vw));
  padding: 4px;
}

.compactList .item {
  min-height: 24px;
  gap: 5px;
  padding: 2px 6px;
  border-radius: var(--dsw-radius-sm);
  font-size: 11px;
  line-height: 17px;
}

.compactList .itemIcon {
  width: 12px;
  height: 12px;
}

.compactList .separator {
  margin: 2px 6px;
}

.compactList .label {
  padding: 3px 6px;
  font-size: 10px;
  line-height: 15px;
}

.item:disabled,
.item[aria-disabled='true'] {
  opacity: 0.4;
  cursor: not-allowed;
}

.itemIcon {
  display: inline-flex;
  flex: none;
  width: 14px;
  height: 14px;
  align-items: center;
  justify-content: center;
  color: var(--dsw-alias-menu-icon);
}

.itemIcon svg,
.check {
  width: 14px;
  height: 14px;
}

.compactList .itemIcon svg,
.compactList .check {
  width: 12px;
  height: 12px;
}

.itemLabel {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shortcut {
  flex: none;
  margin-inline-start: auto;
}

.shortcut .shortcutKeys {
  color: var(--dsw-alias-label-caption);
  font-size: 11px;
  line-height: 16px;
}

@media (pointer: coarse) {
  :global(html:not([data-input-modality='keyboard'])) .shortcut {
    display: none;
  }
}

.check {
  flex: none;
  color: var(--dsw-alias-label-primary);
}

/* Selected cell keeps the plain fill (marker is the trailing check); the
 * class remains as a hook for owner-side emphasis. */
.selected {
  background: transparent;
}

/* Fill-mode selection: the row holds the hover fill instead of a check. */
.selectedFill {
  background: var(--dsw-alias-interactive-bg-hover);
}

/* Destructive row: error text/icon, danger hover fill. */
.danger {
  color: var(--dsw-alias-state-error-primary);
}

.danger .itemIcon {
  color: var(--dsw-alias-state-error-primary);
}

@media (hover: hover) {
  .danger:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--dsw-alias-interactive-bg-hover-danger);
  }
}

.danger:focus-visible:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover-danger);
  outline: none;
}

/* Heading row: non-interactive small grey text, padding aligned with items. */
.label {
  padding: 6px 8px;
  font-size: 11px;
  line-height: 15px;
  color: var(--dsw-alias-label-tertiary);
}

/* Separator endpoints align with the row content. The l2 stroke stays visible
 * on the menu surface. */
.separator {
  height: 0.5px;
  margin: 3px 8px;
  background: var(--dsw-alias-border-l2);
}

/* A data separator directly followed by a row that starts a group draws one
 * line, not two; a group start on the list's first row draws none. */
.separator + .separator,
.separator + .itemWrap > .separator:first-child,
.itemWrap:first-child > .separator:first-child {
  display: none;
}

/* A legacy outlet following structured rows is not the beginning of the menu. */
.list[data-context-menu] .viewport > .itemWrap ~ [data-slot] .itemWrap:first-child > .separator:first-child {
  display: block;
}

/* The submenu aligns with the parent's bottom edge. Its hit bridge covers
 * the menu inset and the 6px gap so pointer movement keeps it open. */
.submenu {
  position: absolute;
  top: auto;
  bottom: -4px;
  left: calc(100% + 10px);
  z-index: 101;
  min-width: 163px;
}

.submenu::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -10px;
  width: 10px;
}

.list[data-menu-phase='dismiss'],
.list[data-menu-phase='replace'] { pointer-events: none; }
.list[data-context-menu].scrollable {
  max-height: min(calc(100vh - 24px), var(--dsh-anchored-max-height, 100vh));
  max-height: min(calc(100dvh - 24px), var(--dsh-anchored-max-height, 100vh));
}
`/** Effective key labels and their accessible combination for one row. */
export interface MenuShortcut {
  readonly keys: readonly string[]
  readonly aria?: string
}

/** Selectable row, optionally with a nested submenu. */
export interface MenuItem {
  id: string
  label: React.ReactNode
  disabled?: boolean
  /** Effective binding supplied by the command owner; omitted for unbound actions. */
  shortcut?: MenuShortcut
  /** Leading icon (figma .Menu_cell gap 8). */
  icon?: React.ReactNode
  /** Destructive row: error-colored text/icon and danger hover fill. */
  danger?: boolean
  /** Nested card opened to the right on hover/focus. */
  submenu?: readonly MenuEntry[]
}

/** Hairline between item groups (not selectable). */
export interface MenuSeparator {
  type: 'separator'
  id: string
}

/** Non-interactive heading row above a group of items. */
export interface MenuLabel {
  type: 'label'
  id: string
  text: string
}

/** One primary-menu entry: a row, a separator, or a heading label. */
export type MenuEntry = MenuItem | MenuSeparator | MenuLabel

/** Props for one component-rendered menu row. */
export interface MenuItemButtonProps {
  /** Visible row label. */
  children: React.ReactNode
  /** Effective binding supplied by the command owner; omitted for unbound actions. */
  shortcut?: MenuShortcut
  /** Leading icon (figma .Menu_cell gap 8). */
  icon?: React.ReactNode
  /** Whether this row identifies the currently displayed page or view. */
  current?: boolean
  /** Whether the row cannot be activated. */
  disabled?: boolean
  /** Why the disabled row cannot be activated; shown in a tooltip and read as its description. */
  disabledReason?: string
  /** Destructive row: error-colored text/icon and danger hover fill. */
  danger?: boolean
  /** Start a new group: a hairline above this row. */
  separatorBefore?: boolean
  /** Row activation (click, Enter, or Tab on the focused row). */
  onSelect: () => void
}

/** Position of an anchored panel in viewport coordinates. */
export interface AnchoredPosition {
  left: number
  top: number
}

/** Options for {@link useAnchoredPosition}. */
export interface AnchoredPositionOptions {
  open: boolean
  anchorRef: React.RefObject<HTMLElement | null>
  panelRef: React.RefObject<HTMLElement | null>
  side?: 'bottom' | 'top' | 'right'
  align?: 'start' | 'end'
  gap: number
  margin: number
  getAnchorRect?: () => DOMRect | null
  layoutKey?: string
  minWidthFromAnchor?: boolean
  frameClearance?: boolean
}

/** A pointer-grace handle: arm a pending close, or cancel it on re-entry. */
export interface PointerGrace {
  arm: () => void
  cancel: () => void
}

/**
 * Resolve the top margin an overlay keeps from the viewport edge.
 * `min` is the overlay's own viewport margin in px and acts as the floor; `anchor`
 * is its anchor rect in viewport coordinates; `gap` is the distance the overlay
 * keeps below the anchor. Returns the frame clearance plus 20px, capped by a
 * visible anchor, but never below `min`.
 */

export function overlayTopMargin(min: number, anchor?: { top: number, bottom: number }, gap = 0): number {
  if (typeof document === 'undefined')
    return min
  const root = document.documentElement
  const clearance = Number.parseFloat(getComputedStyle(root).getPropertyValue('--dsh-frame-top-clearance'))
  if (Number.isNaN(clearance))
    return min
  const visible = anchor !== undefined && anchor.top >= 0
  const cap = visible && anchor !== undefined
    ? anchor.bottom + gap
    : Number.POSITIVE_INFINITY
  return Math.max(min, Math.min((root.hasAttribute('data-fullscreen')
    ? 0
    : clearance) + 20, cap))
}

/**
 * Delay a pointer-dismissed popup's close so the pointer can cross the gap
 * between anchor and popup. A pending close is dropped on unmount.
 * @param close - runs when the grace elapses with no re-entry; read at fire time.
 * @returns the grace handle.
 */
export function usePointerGrace(close: () => void): PointerGrace {
  const timerRef = useRef<number | null>(null)
  const closeRef = useRef(close)
  closeRef.current = close
  const cancel = useCallback(() => {
    if (timerRef.current === null)
      return
    clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])
  const arm = useCallback(() => {
    cancel()
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      closeRef.current()
    }, 200)
  }, [cancel])
  useEffect(() => cancel, [cancel])
  return { arm, cancel }
}

/** Viewport measurements the placement math needs, captured once per pass. */
interface AnchoredFrame {
  x: number
  y: number
  width: number
  height: number
  topMargin: number
}

/**
 * Read the visual viewport and the overlay's top clearance.
 * @param viewport - the window's visual viewport, when the host exposes one.
 * @param rect - the anchor rect the overlay is placed against.
 * @param options - placement options that bound the overlay.
 */
function anchoredFrame(
  viewport: VisualViewport | null,
  rect: DOMRect,
  options: AnchoredPositionOptions & { resolvedFrameClearance: boolean },
): AnchoredFrame {
  const x = viewport?.offsetLeft ?? 0
  const y = viewport?.offsetTop ?? 0
  const width = viewport?.width ?? (document.documentElement.clientWidth || window.innerWidth)
  const height = viewport?.height ?? (document.documentElement.clientHeight || window.innerHeight)
  const { margin, gap } = options
  const topMargin = options.resolvedFrameClearance
    ? overlayTopMargin(margin, rect, gap)
    : margin
  return { x, y, width, height, topMargin }
}

/**
 * Clamp a desired panel origin inside the viewport and publish the size caps the
 * panel's own CSS consumes.
 * @param panel - the mounted panel, measured after the caps are applied.
 * @param frame - viewport measurements for this pass.
 * @param rect - the anchor rect, or null while no anchor is measurable.
 * @param options - placement options.
 * @returns the clamped position, or null when there is nothing to place.
 */
function anchoredCoordinates(
  panel: HTMLElement,
  frame: AnchoredFrame | null,
  rect: DOMRect | null,
  options: AnchoredPositionOptions & { visualOrigin: boolean },
): AnchoredPosition | null {
  if (rect === null || frame === null)
    return null
  const { margin, gap, side = 'bottom', align = 'start' } = options
  const { x, y, width, height, topMargin } = frame
  const maxWidth = Math.max(0, width - margin * 2)
  panel.style.setProperty('--dsh-anchored-max-width', `${String(maxWidth)}px`)
  panel.style.setProperty('--dsh-anchored-max-height', `${String(Math.max(0, height - topMargin - margin))}px`)
  if (options.minWidthFromAnchor)
    panel.style.minWidth = `${String(Math.min(rect.width, maxWidth))}px`
  const panelWidth = panel.offsetWidth
  const panelHeight = panel.offsetHeight
  const offsetX = options.visualOrigin ? x : 0
  const offsetY = options.visualOrigin ? y : 0
  const left = offsetX + (side === 'right'
    ? rect.right + gap
    : align === 'end'
      ? rect.right - panelWidth
      : rect.left)
  const top = offsetY + (side === 'right'
    ? rect.top
    : side === 'top'
      ? rect.top - gap - panelHeight
      : rect.bottom + gap)
  return {
    left: Math.max(x + margin, Math.min(left, x + width - margin - panelWidth)),
    top: Math.max(y + topMargin, Math.min(top, y + height - margin - panelHeight)),
  }
}

/**
 * Keep a fixed panel aligned and constrained to the visible viewport.
 * Panel CSS consumes `--dsh-anchored-max-width` and `--dsh-anchored-max-height`.
 * @param options - Open state, element refs, placement, and optional host rect.
 * @returns Fixed left/top coordinates, or null while closed or awaiting an anchor.
 */
export function useAnchoredPosition(options: AnchoredPositionOptions): AnchoredPosition | null {
  const { open, anchorRef, panelRef, side, align, gap, margin, getAnchorRect, layoutKey, minWidthFromAnchor, frameClearance = true } = options
  const [position, setPosition] = useState<AnchoredPosition | null>(null)
  const placement = {
    ...options,
    side,
    align,
    gap,
    margin,
    minWidthFromAnchor,
    resolvedFrameClearance: frameClearance,
  }
  useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return
    }
    const anchor = anchorRef.current
    const panel = panelRef.current
    if (anchor === null || panel === null)
      return
    const win = anchor.ownerDocument.defaultView
    if (win === null)
      return
    const viewport = win.visualViewport
    const visualOrigin = typeof win.CSS !== 'undefined' && win.CSS.supports('-webkit-backdrop-filter', 'none')
    const managed = [
      '--dsh-anchored-max-width',
      '--dsh-anchored-max-height',
      ...(minWidthFromAnchor
        ? ['min-width']
        : []),
    ]
    const previous = managed.map(name => [
      name,
      panel.style.getPropertyValue(name),
      panel.style.getPropertyPriority(name),
    ] as const)
    let active = true
    let lastRect: { x: number, y: number, width: number, height: number } | null = null
    const readRect = (): DOMRect | null => getAnchorRect === undefined
      ? anchor.getBoundingClientRect()
      : getAnchorRect()
    const place = (rect: DOMRect | null): void => {
      lastRect = rect === null
        ? null
        : {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          }
      const frame = rect === null
        ? null
        : anchoredFrame(viewport, rect, placement)
      const next = anchoredCoordinates(panel, frame, rect, { ...placement, visualOrigin })
      setPosition(current => current?.left === next?.left && current?.top === next?.top
        ? current
        : next)
    }
    const update = (): void => {
      if (!active)
        return
      place(readRect())
    }
    update()
    win.addEventListener('scroll', update, true)
    win.addEventListener('resize', update)
    viewport?.addEventListener('scroll', update)
    viewport?.addEventListener('resize', update)
    const observer = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(update)
    observer?.observe(anchor)
    observer?.observe(panel)
    let frame = 0
    const track = (): void => {
      if (!active)
        return
      const rect = readRect()
      if (rect?.x !== lastRect?.x || rect?.y !== lastRect?.y || rect?.width !== lastRect?.width || rect?.height !== lastRect?.height)
        place(rect)
      frame = win.requestAnimationFrame(track)
    }
    frame = win.requestAnimationFrame(track)
    return () => {
      active = false
      win.cancelAnimationFrame(frame)
      observer?.disconnect()
      win.removeEventListener('scroll', update, true)
      win.removeEventListener('resize', update)
      viewport?.removeEventListener('scroll', update)
      viewport?.removeEventListener('resize', update)
      for (const [name, value, priority] of previous)
        panel.style.setProperty(name, value, priority)
    }
  }, [
    open,
    anchorRef,
    panelRef,
    side,
    align,
    gap,
    margin,
    getAnchorRect,
    layoutKey,
    minWidthFromAnchor,
    frameClearance,
  ])
  return position
}

/** Whether an entry is a hairline. */
function isSeparator(entry: MenuEntry): entry is MenuSeparator {
  return 'type' in entry && entry.type === 'separator'
}

/** Whether an entry is a heading row. */
function isLabel(entry: MenuEntry): entry is MenuLabel {
  return 'type' in entry && entry.type === 'label'
}

/** Mark icon columns within each separator-delimited data group. */
function iconColumns(entries: readonly MenuEntry[], contextual: boolean): Set<MenuEntry> {
  const aligned = new Set<MenuEntry>()
  if (!contextual)
    return aligned
  let group: MenuEntry[] = []
  const finish = (): void => {
    if (group.some(entry => !isLabel(entry) && !isSeparator(entry) && entry.icon !== undefined)) {
      for (const entry of group)
        aligned.add(entry)
    }
    group = []
  }
  for (const entry of entries) {
    if (isSeparator(entry))
      finish()
    else
      group.push(entry)
  }
  finish()
  return aligned
}

/** Unplaced portal list: hidden but laid out at a fixed origin so offsetWidth/offsetHeight are real. */
const MEASURE_STYLE: React.CSSProperties = {
  visibility: 'hidden',
  left: 0,
  top: 0,
}

/** Refs and callbacks the document keyboard handlers need. */
interface MenuKeyContext {
  rootRef: React.RefObject<HTMLSpanElement | null>
  listRef: React.RefObject<HTMLDivElement | null>
  returnFocus?: () => HTMLElement | null
  autoFocus: boolean
  onClose: () => void
  refocusAnchor: (navigation?: boolean) => void
  walkIndex: React.RefObject<number | null>
  selectingWithTab: React.RefObject<boolean>
}

/**
 * Whether the keyboard is on the trigger or inside the open list, the two places
 * this menu claims keys from.
 * @param context - the menu's refs and callbacks.
 * @param focused - the currently focused element.
 */
function menuAnchored(context: MenuKeyContext, focused: Element | null): boolean {
  return focused === context.returnFocus?.()
    || context.rootRef.current?.contains(focused) === true
    || context.listRef.current?.contains(focused) === true
}

/**
 * Handle Escape: close, then hand the keyboard back when this menu owned it.
 * @param context - the menu's refs and callbacks.
 * @param event - the keydown event.
 * @param anchored - whether the keyboard was on the trigger or the list.
 */
function handleMenuEscape(context: MenuKeyContext, event: KeyboardEvent, anchored: boolean): void {
  event.preventDefault()
  if (event.repeat)
    return
  context.onClose()
  if (anchored || context.autoFocus)
    context.refocusAnchor()
}

/**
 * Handle Tab: entering the list from the trigger, or settling the focused row.
 * @param context - the menu's refs and callbacks.
 * @param event - the keydown event.
 * @param anchored - whether the keyboard was on the trigger or the list.
 */
function handleMenuTab(context: MenuKeyContext, event: KeyboardEvent, anchored: boolean): void {
  const list = context.listRef.current
  if (list === null || !anchored)
    return
  if (event.shiftKey) {
    event.preventDefault()
    context.onClose()
    context.refocusAnchor(true)
    return
  }
  const focused = document.activeElement
  if (!list.contains(focused)) {
    const row = list.querySelector<HTMLElement>('button:not(:disabled)')
    if (row === null)
      return
    event.preventDefault()
    row.focus()
    context.walkIndex.current = 0
    return
  }
  if (!(focused instanceof HTMLElement) || focused.getAttribute('role') !== 'menuitem')
    return
  event.preventDefault()
  if (focused.getAttribute('aria-disabled') === 'true') {
    context.onClose()
    context.refocusAnchor(true)
    return
  }
  context.selectingWithTab.current = true
  try {
    focused.click()
  }
  finally {
    context.selectingWithTab.current = false
  }
}

/**
 * Resolve the row an arrow, Home, or End key lands on.
 * @param count - number of walkable rows.
 * @param key - the pressed key.
 * @param from - the index the walk resumes from, when one was recorded.
 */
function nextRowIndex(count: number, key: string, from: number | null): number {
  if (key === 'Home')
    return 0
  if (key === 'End')
    return count - 1
  if (from === null) {
    return key === 'ArrowDown'
      ? 0
      : count - 1
  }
  return (from + (key === 'ArrowDown'
    ? 1
    : -1) + count) % count
}

/**
 * Handle Arrow, Home, and End: move real focus along the walkable rows.
 * @param context - the menu's refs and callbacks.
 * @param event - the keydown event.
 * @param anchored - whether the keyboard was on the trigger or the list.
 */
function handleMenuArrow(context: MenuKeyContext, event: KeyboardEvent, anchored: boolean): void {
  const list = context.listRef.current
  if (list === null || !anchored)
    return
  const rows = Array.from(list.querySelectorAll<HTMLElement>('button:not(:disabled)'))
  if (rows.length === 0)
    return
  const focused = document.activeElement
  const index = focused === null
    ? -1
    : rows.indexOf(focused as HTMLElement)
  const next = nextRowIndex(rows.length, event.key, index >= 0
    ? index
    : context.walkIndex.current)
  event.preventDefault()
  context.walkIndex.current = next
  rows[next]?.focus()
}

/**
 * Route one key to the handler that owns it.
 * @param context - the menu's refs and callbacks.
 * @param event - the keydown event.
 */
function handleMenuKeyDown(context: MenuKeyContext, event: KeyboardEvent): void {
  const anchored = menuAnchored(context, document.activeElement)
  if (event.key === 'Escape' && !event.shiftKey) {
    handleMenuEscape(context, event, anchored)
    return
  }
  if (event.key === 'Tab') {
    handleMenuTab(context, event, anchored)
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End')
    handleMenuArrow(context, event, anchored)
}

/**
 * Render one `role="menuitem"` row for a {@link Menu} whose rows are
 * components rather than `items` data.
 */
export function MenuItemButton({
  children,
  shortcut,
  icon,
  current,
  disabled = false,
  disabledReason,
  danger = false,
  separatorBefore = false,
  onSelect,
}: MenuItemButtonProps): React.JSX.Element {
  const s = useStyle('menu', CSS)
  const reasonId = useId()
  const explained = disabled && disabledReason !== undefined
  return (
    <div className={s.itemWrap}>
      {separatorBefore && <div className={s.separator} role="separator" />}
      <Tooltip label={disabledReason ?? ''} disabled={!explained} side="bottom" delayMs={500} maxWidth={300} portal>
        <button
          type="button"
          role="menuitem"
          className={cx(s.item, danger && s.danger)}
          disabled={disabled && !explained}
          aria-disabled={explained || undefined}
          aria-describedby={explained ? reasonId : undefined}
          aria-keyshortcuts={shortcut?.aria}
          aria-current={current === true
            ? 'page'
            : undefined}
          onClick={explained ? undefined : onSelect}
        >
          {icon !== undefined && <span className={s.itemIcon}>{icon}</span>}
          <span className={s.itemLabel}>{children}</span>
          {shortcut !== undefined && (
            <span aria-hidden="true" className={s.shortcut}>
              <ShortcutKeys keys={shortcut.keys} className={s.shortcutKeys} />
            </span>
          )}
        </button>
      </Tooltip>
      {explained && (
        <span id={reasonId} hidden>
          {disabledReason}
        </span>
      )}
    </div>
  )
}

/** Rows of a nested card, rendered without selection marks. */
interface MenuSubmenuProps {
  entries: readonly MenuEntry[]
  compact: boolean
  columns: Set<MenuEntry>
  onSelect?: (id: string) => void
  refocusAfterSelection: () => void
}

/**
 * Render a nested card's rows.
 * Entries arrive in display order; `columns` names the rows whose icon column is
 * reserved, `onSelect` handles activation, and `refocusAfterSelection` returns the
 * keyboard to the trigger after a selection.
 */
function MenuSubmenu({ entries, compact, columns, onSelect, refocusAfterSelection }: MenuSubmenuProps): React.JSX.Element {
  const s = useStyle('menu', CSS)
  return (
    <MenuSurface compact={compact} className={cx(s.submenu, compact && s.compactList)} role="menu">
      {entries.map(sub => isSeparator(sub)
        ? <div key={sub.id} className={s.separator} role="separator" />
        : isLabel(sub)
          ? (
              <div key={sub.id} className={s.label}>
                {sub.text}
              </div>
            )
          : (
              <button
                key={sub.id}
                type="button"
                role="menuitem"
                className={s.item}
                disabled={sub.disabled}
                aria-keyshortcuts={sub.shortcut?.aria}
                onClick={() => {
                  onSelect?.(sub.id)
                  refocusAfterSelection()
                }}
              >
                {(sub.icon !== undefined || columns.has(sub)) && (
                  <span aria-hidden="true" className={s.itemIcon}>
                    {sub.icon}
                  </span>
                )}
                <span className={s.itemLabel}>{sub.label}</span>
                {sub.shortcut !== undefined && (
                  <span aria-hidden="true" className={s.shortcut}>
                    <ShortcutKeys keys={sub.shortcut.keys} className={s.shortcutKeys} />
                  </span>
                )}
              </button>
            ))}
    </MenuSurface>
  )
}

/** Props shared by the primary-row renderer. */
interface MenuRowProps {
  entry: MenuEntry
  columns: Set<MenuEntry>
  selected: boolean
  selection: 'check' | 'fill'
  contextual: boolean
  compact: boolean
  submenuOpen: boolean
  onHoverSubmenu: (id: string | null) => void
  onSelect?: (id: string) => void
  refocusAfterSelection: () => void
}

/**
 * Render one primary-menu entry, including its nested card.
 * `selected` and `selection` decide the marker, `submenuOpen` and `onHoverSubmenu`
 * own the nested card, and `columns` names the rows whose icon column is reserved.
 */
function MenuRow({
  entry,
  columns,
  selected,
  selection,
  contextual,
  compact,
  submenuOpen,
  onHoverSubmenu,
  onSelect,
  refocusAfterSelection,
}: MenuRowProps): React.JSX.Element {
  const s = useStyle('menu', CSS)
  if (isSeparator(entry))
    return <div className={s.separator} role="separator" />
  if (isLabel(entry)) {
    return (
      <div className={s.label} role="presentation">
        {entry.text}
      </div>
    )
  }
  const hasSub = entry.submenu !== undefined && entry.submenu.length > 0
  const subColumns = iconColumns(entry.submenu ?? [], contextual)
  return (
    <div
      className={s.itemWrap}
      onMouseEnter={hasSub
        ? () => onHoverSubmenu(entry.id)
        : undefined}
      onMouseLeave={() => onHoverSubmenu(null)}
    >
      <button
        type="button"
        role="menuitem"
        className={cx(s.item, selected && (selection === 'fill'
          ? s.selectedFill
          : s.selected), entry.danger === true && s.danger)}
        disabled={entry.disabled}
        aria-keyshortcuts={entry.shortcut?.aria}
        aria-haspopup={hasSub ? 'menu' : undefined}
        aria-expanded={hasSub ? submenuOpen : undefined}
        onFocus={hasSub
          ? () => onHoverSubmenu(entry.id)
          : undefined}
        onClick={() => {
          if (hasSub) {
            onHoverSubmenu(entry.id)
            return
          }
          onSelect?.(entry.id)
        }}
      >
        {(entry.icon !== undefined || columns.has(entry)) && (
          <span aria-hidden="true" className={s.itemIcon}>
            {entry.icon}
          </span>
        )}
        <span className={s.itemLabel}>{entry.label}</span>
        {entry.shortcut !== undefined && (
          <span aria-hidden="true" className={s.shortcut}>
            <ShortcutKeys keys={entry.shortcut.keys} className={s.shortcutKeys} />
          </span>
        )}
        {selected && selection === 'check' && <IconCheckOutlineRegular className={s.check} />}
      </button>
      {submenuOpen && entry.submenu !== undefined && (
        <MenuSubmenu
          entries={entry.submenu}
          compact={compact}
          columns={subColumns}
          onSelect={onSelect}
          refocusAfterSelection={refocusAfterSelection}
        />
      )}
    </div>
  )
}

/** Props of the open dropdown card. */
interface MenuListProps {
  open: boolean
  listRef: React.RefObject<HTMLDivElement | null>
  items: readonly MenuEntry[]
  footer?: readonly MenuEntry[]
  children?: React.ReactNode
  selectedId?: string
  selectedIds?: readonly string[]
  selection: 'check' | 'fill'
  contextual: boolean
  compact: boolean
  dense: boolean
  portal: boolean
  side: 'bottom' | 'top' | 'right'
  align: 'start' | 'end'
  exiting?: 'dismiss' | 'replace'
  position: AnchoredPosition | null
  listClassName?: string
  menuId: string
  openSubmenuId: string | null
  onHoverSubmenu: (id: string | null) => void
  onSelect?: (id: string) => void
  onClose: () => void
  refocusAfterSelection: () => void
}

/**
 * Render the open card: scroll region, data rows, component rows, and footer.
 * `listRef` is the keyboard scope, `items` and `footer` are data rows, `children`
 * are component rows rendered after them, and `position` carries the fixed
 * viewport coordinates in portal mode.
 * @returns the card, or false while closed.
 */
function MenuList({
  open,
  listRef,
  items,
  footer,
  children,
  selectedId,
  selectedIds,
  selection,
  contextual,
  compact,
  dense,
  portal,
  side,
  align,
  exiting,
  position,
  listClassName,
  menuId,
  openSubmenuId,
  onHoverSubmenu,
  onSelect,
  onClose,
  refocusAfterSelection,
}: MenuListProps): React.JSX.Element | false {
  const s = useStyle('menu', CSS)
  if (!open)
    return false
  const scrollable = !items.some(entry => !isSeparator(entry) && !isLabel(entry) && entry.submenu !== undefined && entry.submenu.length > 0)
  const itemColumns = iconColumns(items, contextual)
  const footerColumns = iconColumns(footer ?? [], contextual)
  const isSelected = (entry: MenuEntry): boolean => !isSeparator(entry) && !isLabel(entry)
    && (entry.id === selectedId || selectedIds?.includes(entry.id) === true)
  const collapseSubmenuFrom = (event: React.SyntheticEvent<HTMLDivElement>): void => {
    const row = event.target instanceof Element
      ? event.target.closest('button[role="menuitem"]')
      : null
    if (row === null || row.getAttribute('aria-haspopup') === 'menu')
      return
    if (row.closest('[role="menu"]') !== event.currentTarget)
      return
    onHoverSubmenu(null)
  }
  return (
    <MenuSurface
      compact={compact}
      id={contextual ? menuId : undefined}
      ref={listRef}
      className={cx(
        s.list,
        listClassName,
        dense && s.denseList,
        compact && s.compactList,
        scrollable && s.scrollable,
        portal && s.portal,
        side === 'top' && !portal && s.sideTop,
        align === 'end' && !portal && s.alignEnd,
      )}
      style={portal
        ? position ?? MEASURE_STYLE
        : undefined}
      role={exiting === undefined
        ? 'menu'
        : undefined}
      aria-hidden={exiting === undefined
        ? undefined
        : true}
      data-context-menu={contextual ? '' : undefined}
      phase={contextual
        ? exiting ?? 'enter'
        : undefined}
      onClick={(event) => {
        event.stopPropagation()
        const row = event.target instanceof Element
          ? event.target.closest('button[role="menuitem"]')
          : null
        if (row !== null && row.getAttribute('aria-haspopup') !== 'menu')
          refocusAfterSelection()
      }}
      onContextMenu={contextual
        ? (event) => {
            event.preventDefault()
            event.stopPropagation()
            onClose()
          }
        : undefined}
      onMouseOver={collapseSubmenuFrom}
      onFocus={collapseSubmenuFrom}
    >
      <div className={s.viewport} role="presentation">
        {items.map(entry => (
          <MenuRow
            key={entry.id}
            entry={entry}
            columns={itemColumns}
            selected={isSelected(entry)}
            selection={selection}
            contextual={contextual}
            compact={compact}
            submenuOpen={!isSeparator(entry) && !isLabel(entry) && openSubmenuId === entry.id}
            onHoverSubmenu={onHoverSubmenu}
            onSelect={onSelect}
            refocusAfterSelection={refocusAfterSelection}
          />
        ))}
        {children}
      </div>
      {footer !== undefined && footer.length > 0 && (
        <div className={s.footer} role="presentation">
          {footer.map(entry => (
            <MenuRow
              key={entry.id}
              entry={entry}
              columns={footerColumns}
              selected={false}
              selection={selection}
              contextual={contextual}
              compact={compact}
              submenuOpen={false}
              onHoverSubmenu={onHoverSubmenu}
              onSelect={onSelect}
              refocusAfterSelection={refocusAfterSelection}
            />
          ))}
        </div>
      )}
    </MenuSurface>
  )
}

/** Props for {@link Menu}. */
export interface MenuProps {
  /** Whether the list is showing (owner-controlled). */
  open: boolean
  /** The trigger element (rendered in place). */
  anchor: React.ReactNode
  /** Selectable data rows and optional separators. */
  items?: readonly MenuEntry[]
  /** Component rows rendered after `items` in the same list. */
  children?: React.ReactNode
  /** Pinned rows below the scrolling items area, separated by a hairline. */
  footer?: readonly MenuEntry[]
  /** Row shown as selected. */
  selectedId?: string
  /** Rows shown as selected when a menu contains independent option groups. */
  selectedIds?: readonly string[]
  /** Data-row activation callback. */
  onSelect?: (id: string) => void
  /** Invoked on outside click, Escape, or a window blur that moved focus into an iframe. */
  onClose: () => void
  align?: 'start' | 'end'
  side?: 'bottom' | 'top' | 'right'
  /** Render the list into document.body, fixed-positioned and clamped inside the visual viewport. */
  portal?: boolean
  /** Close the list once the pointer has left both trigger and list for the pointer grace. */
  closeOnPointerLeave?: boolean
  /** Reduce vertical row spacing without changing the standard typography or card width. */
  dense?: boolean
  /** Use reduced menu typography and spacing. */
  compact?: boolean
  autoFocus?: boolean
  /** How a selected row is marked: a trailing check or the hover fill held on the row. */
  selection?: 'check' | 'fill'
  /** Portal mode only: supply the anchor rect directly instead of measuring the wrapper span. */
  getAnchorRect?: () => DOMRect | null
  /** Portal mode: keep the menu at least as wide as its anchor. */
  minWidthFromAnchor?: boolean
  /** Extra class on the anchor wrapper span. */
  className?: string
  /** Extra class on the dropdown card itself. */
  listClassName?: string
  /** Pointer-positioned popup: cursor clearance, grouped icons, and context gestures. */
  contextual?: boolean
  /** Retain a dismissed context popup during its short fade. */
  exiting?: 'dismiss' | 'replace'
  /** Resolve the original control for focus restoration and inert/hidden dismissal. */
  returnFocus?: () => HTMLElement | null
}

/**
 * Render an anchored dropdown menu. While the list is open its keys mirror the
 * composer's: Tab settles the focused row (from the trigger, Tab enters the list
 * instead), and Escape or Shift+Tab close it and return focus to the anchor's
 * first button. Only a keyboard on the trigger or inside the list is intercepted;
 * Tab presses elsewhere on the page stay the browser's.
 */
export function Menu({
  open,
  anchor,
  items = [],
  children,
  selectedId,
  selectedIds,
  onSelect,
  onClose,
  align = 'start',
  side = 'bottom',
  portal = false,
  closeOnPointerLeave = false,
  dense = false,
  compact = false,
  autoFocus = false,
  selection = 'check',
  getAnchorRect,
  minWidthFromAnchor = false,
  footer,
  className,
  listClassName,
  contextual = false,
  exiting,
  returnFocus,
}: MenuProps): React.JSX.Element {
  const s = useStyle('menu', CSS)
  const rootRef = useRef<HTMLSpanElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const exitingRef = useRef(exiting)
  exitingRef.current = exiting
  const openRef = useRef(open)
  openRef.current = open
  /** Index the arrow walk last focused, the resume point when focus left the rows. */
  const walkIndex = useRef<number | null>(null)
  /** The control that had the keyboard when this menu opened. */
  const triggerRef = useRef<HTMLElement | null>(null)
  const selectingWithTab = useRef(false)
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null)
  const close = useRef(onClose)
  close.current = onClose
  const lastAnchorRect = useRef<DOMRect | null>(null)
  /**
   * Hand the keyboard back to the trigger that opened the menu, or, when the
   * anchor never held it, to the anchor's first button.
   * @param navigation - whether explicit keyboard traversal should retain its focus indicator.
   */
  const refocusAnchor = useCallback((navigation = false): void => {
    const trigger = returnFocus?.() ?? triggerRef.current
    const usable = trigger !== null
      && typeof document !== 'undefined'
      && document.contains(trigger)
      && !(trigger instanceof HTMLButtonElement && trigger.disabled)
    const target = usable
      ? trigger
      : rootRef.current?.querySelector<HTMLElement>('button:not(:disabled)')
    if (target == null)
      return
    if (navigation)
      target.focus()
    else
      focusWithoutRing(target)
  }, [returnFocus])
  /** Post-selection focus, for the paths where the rows unmount with the list. */
  const refocusAfterSelection = useCallback((): void => {
    const navigation = selectingWithTab.current
    queueMicrotask(() => {
      if (openRef.current && exitingRef.current === undefined)
        return
      const active = document.activeElement
      if (active === null || active === document.body || listRef.current?.contains(active) === true)
        refocusAnchor(navigation)
    })
  }, [refocusAnchor])
  const readAnchor = useCallback((): DOMRect | null => {
    if ((returnFocus?.() ?? rootRef.current)?.closest('[inert], [hidden]') != null) {
      if (exitingRef.current === undefined)
        close.current()
      return lastAnchorRect.current
    }
    lastAnchorRect.current = getAnchorRect === undefined
      ? rootRef.current?.getBoundingClientRect() ?? null
      : getAnchorRect()
    return lastAnchorRect.current
  }, [getAnchorRect, returnFocus])
  const fixedPos = useAnchoredPosition({
    open: open && portal,
    anchorRef: rootRef,
    panelRef: listRef,
    side,
    align,
    gap: 4,
    margin: 12,
    frameClearance: !contextual,
    minWidthFromAnchor,
    getAnchorRect: readAnchor,
  })
  const positioned = !portal || fixedPos !== null
  const { arm: armClose, cancel: cancelClose } = usePointerGrace(onClose)
  useLayoutEffect(() => {
    const trigger = returnFocus?.()
    if (!open || !contextual || trigger == null)
      return
    const previous = trigger.getAttribute('aria-controls')
    trigger.setAttribute('aria-controls', [previous, menuId].filter(Boolean).join(' '))
    return () => {
      if (previous === null)
        trigger.removeAttribute('aria-controls')
      else
        trigger.setAttribute('aria-controls', previous)
    }
  }, [open, contextual, returnFocus, menuId])
  useEffect(() => {
    if (!open || typeof document === 'undefined')
      return
    const active = document.activeElement
    const inside = active instanceof HTMLElement && (getAnchorRect !== undefined || rootRef.current?.contains(active) === true)
    triggerRef.current = inside ? active : null
  }, [open, getAnchorRect])
  useEffect(() => {
    if (!open || exiting !== undefined || !autoFocus || !positioned || listRef.current?.contains(document.activeElement))
      return
    const first = listRef.current?.querySelector<HTMLElement>('button:not(:disabled)')
    walkIndex.current = first == null
      ? null
      : 0
    if (first != null)
      focusWithoutRing(first)
  }, [
    open,
    autoFocus,
    items.length,
    footer?.length,
    positioned,
    exiting,
  ])
  useEffect(() => {
    if (!open || exiting !== undefined) {
      setOpenSubmenuId(null)
      walkIndex.current = null
      return
    }
    if (typeof document === 'undefined')
      return
    const composition = observeComposition(document)
    const keyContext: MenuKeyContext = {
      rootRef,
      listRef,
      returnFocus,
      autoFocus,
      onClose,
      refocusAnchor,
      walkIndex,
      selectingWithTab,
    }
    const onPointerDown = (event: PointerEvent): void => {
      if (!(event.target instanceof Node) || (contextual && event.button === 2))
        return
      if (rootRef.current?.contains(event.target) === true)
        return
      if (listRef.current?.contains(event.target) === true)
        return
      onClose()
    }
    const blocked = (event: KeyboardEvent): boolean =>
      composition.guards(event)
      || isBehindModal(triggerRef.current ?? rootRef.current)
      || event.defaultPrevented
      || event.ctrlKey
      || event.altKey
      || event.metaKey
    const onEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !blocked(event))
        handleMenuKeyDown(keyContext, event)
    }
    const onOtherKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' && !blocked(event))
        handleMenuKeyDown(keyContext, event)
    }
    const onWindowBlur = (): void => {
      if (document.activeElement instanceof HTMLIFrameElement)
        onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onOtherKey)
    document.addEventListener('keydown', onEscape, true)
    window.addEventListener('blur', onWindowBlur)
    return () => {
      composition.dispose()
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onOtherKey)
      document.removeEventListener('keydown', onEscape, true)
      window.removeEventListener('blur', onWindowBlur)
    }
  }, [
    open,
    onClose,
    autoFocus,
    contextual,
    exiting,
    returnFocus,
    refocusAnchor,
  ])
  useLayoutEffect(() => {
    if (exiting === 'dismiss' && listRef.current?.contains(document.activeElement))
      refocusAnchor()
  }, [exiting, refocusAnchor])
  useEffect(() => {
    if (!open)
      cancelClose()
  }, [open, cancelClose])
  const list = (
    <MenuList
      open={open}
      listRef={listRef}
      items={items}
      footer={footer}
      selectedId={selectedId}
      selectedIds={selectedIds}
      selection={selection}
      contextual={contextual}
      compact={compact}
      dense={dense}
      portal={portal}
      side={side}
      align={align}
      exiting={exiting}
      position={fixedPos}
      listClassName={listClassName}
      menuId={menuId}
      openSubmenuId={openSubmenuId}
      onHoverSubmenu={setOpenSubmenuId}
      onSelect={onSelect}
      onClose={onClose}
      refocusAfterSelection={refocusAfterSelection}
    >
      {children}
    </MenuList>
  )
  return (
    <span
      ref={rootRef}
      className={cx(s.root, className)}
      onPointerEnter={closeOnPointerLeave ? cancelClose : undefined}
      onPointerLeave={closeOnPointerLeave
        ? () => {
            if (open)
              armClose()
          }
        : undefined}
    >
      {anchor}
      {portal && typeof document !== 'undefined'
        ? createPortal(list, document.body)
        : list}
    </span>
  )
}
