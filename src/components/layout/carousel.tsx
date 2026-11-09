import type * as React from 'react'
import { IconChevronLeftOutlineRegular, IconChevronRightOutlineRegular, IconCloseFillRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-attachment / AttachmentRail.module.css
 * (verbatim, header comment included). The sheet is a scrollbar-less
 * horizontal rail with edge arrows, square tiles and a removal control on each
 * tile.
 */
const CSS = `/* @deepseek-ai/dsh-client-ui-attachment / AttachmentRail.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.root {
  min-width: 0;
  position: relative;
}

.rail {
  scrollbar-width: none;
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2);
  align-items: stretch;
  gap: 10px;
  display: flex;
  overflow: auto hidden;
}

.rail::-webkit-scrollbar {
  display: none;
}

.item {
  flex: none;
  height: 64px;
}

.thumbnail {
  border: .5px solid var(--dsw-alias-border-l2-darkmode-thin);
  border-radius: var(--dsw-radius-xl);
  background: var(--dsw-alias-interactive-bg-hover);
  cursor: zoom-in;
  width: 64px;
  height: 64px;
  padding: 0;
  overflow: hidden;
}

.thumbnail img {
  object-fit: cover;
  width: 100%;
  height: 100%;
  display: block;
}

.remove {
  z-index: 1;
  corner-shape: round;
  background: var(--dsw-alias-button-contrast-fill);
  width: 18px;
  height: 18px;
  color: var(--dsw-alias-label-primary-inverted);
  cursor: pointer;
  opacity: 0;
  border: none;
  border-radius: 50%;
  place-items: center;
  padding: 0;
  transition: opacity .2s ease-in-out;
  display: grid;
  position: absolute;
  top: 4px;
  right: 4px;
}

.remove:focus-visible {
  opacity: 1;
}

@media (hover:hover) {
  .item:hover .remove {
    opacity: 1;
  }
}

@media (hover:none),(pointer:coarse) {
  .remove {
    opacity: 1;
  }
}

@media (prefers-reduced-motion:reduce) {
  .remove {
    transition: none;
  }
}

.arrow {
  z-index: 2;
  --dsw-elevation-stroke-color: var(--dsw-alias-border-l2-darkmode-thin);
  corner-shape: round;
  background: var(--dsw-specific-input-major);
  width: 24px;
  height: 24px;
  color: var(--dsw-alias-label-secondary);
  box-shadow: var(--dsw-elevation-panel);
  cursor: pointer;
  border: 0;
  border-radius: 999px;
  place-items: center;
  padding: 0;
  display: grid;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

@media (hover:hover) {
  .arrow:hover {
    background: var(--dsw-alias-interactive-bg-hover-solid);
  }
}

.arrowLeft {
  left: 4px;
}

.arrowRight {
  right: 4px;
}
`

/** Pixels per wheel line, the unit a line-mode wheel reports. */
const WHEEL_LINE_PX = 16

/** One tile of a {@link Carousel}. */
export interface CarouselItem {
  /** Stable identity, used as the key and by the callbacks. */
  readonly id: string
  /** Image drawn in the tile. */
  readonly src?: string
  /** Alternative text of the image; empty when omitted. */
  readonly alt?: string
  /** Custom tile content, drawn inside the tile button. */
  readonly content?: React.ReactNode
}

/** Props of {@link Carousel}. */
export interface CarouselProps {
  /** Tiles in display order. */
  readonly items: readonly CarouselItem[]
  /** Adds a removal control to every tile and receives the removed id. */
  readonly onRemove?: (id: string) => void
  /** Accessible name of the removal control; defaults to `Remove`. */
  readonly removeLabel?: string
  /** Accessible name of the arrow that pages back. */
  readonly previousLabel: string
  /** Accessible name of the arrow that pages forward. */
  readonly nextLabel: string
  /** Edge of one tile in px; defaults to 64. */
  readonly itemSize?: number
  /** Receives the id of an activated tile. */
  readonly onItemClick?: (id: string) => void
  /** Extra class for layout placement. */
  readonly className?: string
}

/**
 * Smooth paging unless the reader asked for reduced motion.
 * @returns the scroll behavior for one paging move.
 */
function pageBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
}

/**
 * Render a horizontal strip of tiles with paging arrows at its edges.
 *
 * The rail hides its scrollbar and reports overflow through the arrows, which
 * follow the live scroll geometry on scroll, on item count changes and on rail
 * resize. A wheel with a vertical delta pans the rail sideways. A newly added
 * tile reveals the rail end, while a rail that mounts over existing tiles keeps
 * its start position. The item wrapper is positioned inline so the removal
 * control anchors to its own tile, which the sheet leaves unpositioned.
 * @param props - tiles, removal, paging copy and tile size.
 * @returns the rail with its conditional arrows.
 */
export function Carousel(props: CarouselProps): React.JSX.Element {
  const {
    items,
    onRemove,
    removeLabel = 'Remove',
    previousLabel,
    nextLabel,
    itemSize = 64,
    onItemClick,
    className,
  } = props
  const s = useStyle('carousel', CSS)
  const railRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<number | null>(null)
  const [edges, setEdges] = useState({ left: false, right: false })
  const updateEdges = useCallback((): void => {
    const rail = railRef.current
    if (rail === null)
      return
    const left = rail.scrollLeft > 1
    const right = rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 1
    setEdges(previous => previous.left === left && previous.right === right
      ? previous
      : { left, right })
  }, [])
  useLayoutEffect(() => {
    const grew = countRef.current !== null && items.length > countRef.current
    countRef.current = items.length
    const rail = railRef.current
    if (rail === null)
      return
    if (grew)
      rail.scrollLeft = rail.scrollWidth - rail.clientWidth
    updateEdges()
  }, [items.length, updateEdges])
  useEffect(() => {
    const rail = railRef.current
    if (rail === null)
      return
    let disconnect = (): void => {}
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateEdges)
      observer.observe(rail)
      disconnect = () => {
        observer.disconnect()
      }
    }
    const onWheel = (event: WheelEvent): void => {
      if (event.deltaY === 0)
        return
      const scale = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? WHEEL_LINE_PX
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? rail.clientWidth
          : 1
      event.preventDefault()
      rail.scrollBy({
        left: event.deltaX !== 0
          ? event.deltaX * scale
          : Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY) * scale, 60),
        behavior: 'auto',
      })
    }
    rail.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      disconnect()
      rail.removeEventListener('wheel', onWheel)
    }
  }, [updateEdges])
  const page = (direction: 1 | -1): void => {
    const rail = railRef.current
    if (rail === null)
      return
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth - 64, 200),
      behavior: pageBehavior(),
    })
  }
  return (
    <div className={cx(s.root, className)}>
      {edges.left && (
        <button
          type="button"
          className={cx(s.arrow, s.arrowLeft)}
          aria-label={previousLabel}
          onClick={() => {
            page(-1)
          }}
        >
          <IconChevronLeftOutlineRegular />
        </button>
      )}
      <div ref={railRef} className={s.rail} onScroll={updateEdges}>
        {items.map(item => (
          <div key={item.id} className={s.item} style={{ height: itemSize, position: 'relative' }}>
            <button
              type="button"
              className={s.thumbnail}
              style={{ width: itemSize, height: itemSize }}
              onClick={onItemClick === undefined
                ? undefined
                : () => {
                    onItemClick(item.id)
                  }}
            >
              {item.src === undefined
                ? item.content
                : <img src={item.src} alt={item.alt ?? ''} />}
            </button>
            {onRemove !== undefined && (
              <button
                type="button"
                className={s.remove}
                aria-label={removeLabel}
                onClick={() => {
                  onRemove(item.id)
                }}
              >
                <IconCloseFillRegular size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
      {edges.right && (
        <button
          type="button"
          className={cx(s.arrow, s.arrowRight)}
          aria-label={nextLabel}
          onClick={() => {
            page(1)
          }}
        >
          <IconChevronRightOutlineRegular />
        </button>
      )}
    </div>
  )
}
