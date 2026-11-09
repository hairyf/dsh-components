import type * as React from 'react'
import { Component, createRef } from 'react'
import { useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/AnimatedRows.module.css */
.exits {
  position: absolute;
  inset: 0;
  contain: strict;
  overflow: clip;
  pointer-events: none;
}
`

/** Row fade length in ms; entry fades and exit fades share it. */
const ROW_FADE_MS = 100
/** Row glide length in ms for rows that changed position. */
const ROW_GLIDE_MS = 200

/** Keyed row content, list semantics, and animation readiness. */
export interface AnimatedRowsProps {
  children: React.ReactNode
  className: string
  role?: React.AriaRole
  label?: string
  /** Unique DOM-order keys matching the rendered data-row-key attributes. */
  rowKeys: readonly string[]
  ready: boolean
  /** Changes that replace the view or reveal hidden rows settle immediately. */
  resetKey: string
}

interface RowPosition {
  element: HTMLElement
  rect: DOMRect
  opacity: number
}

interface RowSnapshot {
  positions: Map<string, RowPosition>
  removed: Map<string, RowPosition>
}

interface RowExit {
  element: HTMLElement
  animation: Animation
}

interface AnimatedRowsListProps extends AnimatedRowsProps {
  /** Class of the inert overlay that holds fading exit clones. */
  exitsClassName: string
}

function sameRows(previous: AnimatedRowsProps, next: AnimatedRowsProps): boolean {
  return previous.rowKeys.length === next.rowKeys.length
    && previous.rowKeys.every((key, index) => key === next.rowKeys[index])
}

function intersects(row: DOMRect, viewport: DOMRect): boolean {
  return row.bottom > viewport.top && row.top < viewport.bottom && row.right > viewport.left && row.left < viewport.right
}

/**
 * Animate keyed rows on membership or order changes; the class keeps the
 * commit-time measurements that the official component performs.
 */
class AnimatedRowsList extends Component<AnimatedRowsListProps> {
  private armed = false
  private readonly list = createRef<HTMLDivElement>()
  private readonly overlay = createRef<HTMLDivElement>()
  private readonly movements = new Map<HTMLElement, Animation>()
  private readonly exits = new Map<string, RowExit>()

  getSnapshotBeforeUpdate(previous: AnimatedRowsListProps): RowSnapshot | null {
    const list = this.list.current
    if (
      !this.armed
      || sameRows(previous, this.props)
      || previous.resetKey !== this.props.resetKey
      || !previous.ready
      || !this.props.ready
      || list === null
      || typeof list.animate !== 'function'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return null
    }
    const viewport = list.getBoundingClientRect()
    const positions = this.readPositions()
    const nextKeys = new Set(this.props.rowKeys)
    const removed = new Map<string, RowPosition>()
    for (const [key, row] of positions) {
      if (nextKeys.has(key) || !intersects(row.rect, viewport))
        continue
      const clone = row.element.cloneNode(true) as HTMLElement
      clone.removeAttribute('data-row-key')
      clone.inert = true
      clone.style.paddingInlineStart = getComputedStyle(row.element).paddingInlineStart
      removed.set(key, { ...row, element: clone })
    }
    return { positions, removed }
  }

  componentDidUpdate(previous: AnimatedRowsListProps, _state: unknown, snapshot: RowSnapshot | null): void {
    if (snapshot === null) {
      if (sameRows(previous, this.props) && previous.resetKey === this.props.resetKey && previous.ready === this.props.ready)
        return
      this.clear()
      return
    }
    this.cancelMovements()
    const list = this.list.current
    const overlay = this.overlay.current
    if (list === null || overlay === null)
      return
    const viewport = list.getBoundingClientRect()
    const origin = overlay.getBoundingClientRect()
    const positions = this.readPositions()
    for (const [key, row] of positions) {
      this.removeExit(key)
      const previousRow = snapshot.positions.get(key)
      if (!intersects(row.rect, viewport) && (previousRow === undefined || !intersects(previousRow.rect, viewport)))
        continue
      if (previousRow === undefined) {
        this.move(row.element, [
          { opacity: 0 },
          { opacity: 1 },
        ], ROW_FADE_MS)
        continue
      }
      const dx = previousRow.rect.left - row.rect.left
      const dy = previousRow.rect.top - row.rect.top
      if (dx === 0 && dy === 0 && previousRow.opacity === 1)
        continue
      this.move(
        row.element,
        [
          { transform: `translate(${String(dx)}px, ${String(dy)}px)`, opacity: previousRow.opacity },
          { transform: 'translate(0, 0)', opacity: 1 },
        ],
        ROW_GLIDE_MS,
      )
    }
    for (const [key, row] of snapshot.removed) {
      const { element } = row
      this.removeExit(key)
      Object.assign(element.style, {
        position: 'absolute',
        margin: '0',
        transform: 'none',
        boxSizing: 'border-box',
        left: `${String(row.rect.left - origin.left)}px`,
        top: `${String(row.rect.top - origin.top)}px`,
        width: `${String(row.rect.width)}px`,
        height: `${String(row.rect.height)}px`,
      })
      overlay.append(element)
      const animation = element.animate([
        { opacity: row.opacity },
        { opacity: 0 },
      ], {
        duration: ROW_FADE_MS,
        easing: 'ease-out',
        fill: 'forwards',
      })
      this.exits.set(key, { element, animation })
      animation.onfinish = () => {
        this.removeExit(key)
      }
    }
  }

  componentWillUnmount(): void {
    this.clear()
  }

  private readPositions(): Map<string, RowPosition> {
    const list = this.list.current
    const rows = list === null
      ? []
      : Array.from(list.querySelectorAll<HTMLElement>('[data-row-key]'))
    return new Map(rows.map(element => [
      String(element.dataset.rowKey),
      {
        element,
        rect: element.getBoundingClientRect(),
        opacity: this.movements.has(element)
          ? Number(getComputedStyle(element).opacity)
          : 1,
      },
    ]))
  }

  private move(element: HTMLElement, keyframes: Keyframe[], duration: number): void {
    const animation = element.animate(keyframes, { duration, easing: 'ease-out' })
    this.movements.set(element, animation)
    animation.onfinish = () => {
      this.movements.delete(element)
      animation.cancel()
    }
  }

  private cancelMovements(): void {
    for (const animation of this.movements.values()) {
      animation.onfinish = null
      animation.cancel()
    }
    this.movements.clear()
  }

  private removeExit(key: string): void {
    const exit = this.exits.get(key)
    if (exit === undefined)
      return
    exit.animation.onfinish = null
    exit.animation.cancel()
    exit.element.remove()
    this.exits.delete(key)
  }

  private clear(): void {
    this.cancelMovements()
    for (const key of this.exits.keys())
      this.removeExit(key)
  }

  render(): React.ReactNode {
    return (
      <>
        <div
          ref={this.list}
          className={this.props.className}
          role={this.props.role}
          aria-label={this.props.label}
          onPointerDownCapture={() => {
            this.armed = true
          }}
          onKeyDownCapture={() => {
            this.armed = true
          }}
        >
          {this.props.children}
        </div>
        <div ref={this.overlay} className={this.props.exitsClassName} aria-hidden="true" />
      </>
    )
  }
}

/**
 * Animates keyed rows only when their rendered membership or order changes.
 * Motion starts after the first pointer or keyboard input inside the mounted list.
 * The parent supplies a positioned container for the inert exit overlay.
 */
export function AnimatedRows(props: AnimatedRowsProps): React.JSX.Element {
  const s = useStyle('animated-rows', CSS)
  return <AnimatedRowsList {...props} exitsClassName={s.exits ?? ''} />
}
