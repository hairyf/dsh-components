import type * as React from 'react'
import { useRef } from 'react'
import { cx, useStyle } from '../../lib/style'

/** Height of the bottom strip the sheet reserves for a floating control bar. */
const REVEAL_ZONE_HEIGHT = 72

/**
 * Recovered from @deepseek-ai/dsh-client-ui-sidebar-documentpreview / ZoomViewport.module.css (verbatim).
 */
const CSS = `/* @deepseek-ai/dsh-client-ui-sidebar-documentpreview / ZoomViewport.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.frame {
  height: 100%;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.scrollport {
  height: 100%;
  overflow: auto;
}

.surface {
  max-width: none;
}

.revealZone {
  height: var(--document-zoom-reveal-height);
  pointer-events: none;
  position: absolute;
  inset: auto 0 0;
}

.frame[data-document-zoom-mode=fit-width] .surface {
  width: min(var(--document-zoom-width), 100%);
}

.frame[data-document-zoom-mode=fixed] .surface {
  width: calc(var(--document-zoom-width) * var(--document-zoom));
}
`

/** Props of {@link ZoomViewport}. */
export interface ZoomViewportProps {
  /** The scaled document; it sizes itself from the published CSS variables. */
  readonly children?: React.ReactNode
  /** Current scale, where 1 renders at actual size. */
  readonly zoom: number
  /** How the surface width follows the scale (default 'fit-width'). */
  readonly mode?: 'fit-width' | 'fixed'
  /** Intrinsic content width in px, published as `--document-zoom-width`. */
  readonly width?: number
  /** Explicit frame width in px; omit to fill the containing column. */
  readonly frameWidth?: number
  /** Called once each time scrolling reaches the bottom of the content. */
  readonly onReveal?: () => void
  /** Extra class for layout placement. */
  readonly className?: string
}

/**
 * A vertically scrolling viewport that publishes the scale as a CSS variable.
 *
 * `--document-zoom` is the scale, `--document-zoom-width` the intrinsic content
 * width, and `--document-zoom-reveal-height` the height of the floating strip.
 * In 'fixed' mode the surface is `width * zoom` wide, so a full-width child
 * shrinks or grows horizontally with the scale; in 'fit-width' mode the surface
 * stops at the frame width and never magnifies a narrow document.
 * @param props - scale, fit mode, widths, reveal callback and children.
 * @returns the frame, its scrollport and the reveal strip.
 */
export function ZoomViewport(props: ZoomViewportProps): React.JSX.Element {
  const { children, zoom, mode = 'fit-width', width, frameWidth, onReveal, className } = props
  const s = useStyle('zoom-viewport', CSS)
  const atBottom = useRef(false)
  const widthVariable = width === undefined
    ? {}
    : { '--document-zoom-width': `${String(width)}px` }
  const sizeVariable = frameWidth === undefined
    ? {}
    : { width: `${String(frameWidth)}px` }
  const frameStyle: React.CSSProperties & {
    '--document-zoom': string
    '--document-zoom-width'?: string
    '--document-zoom-reveal-height': string
  } = {
    '--document-zoom': String(zoom),
    '--document-zoom-reveal-height': `${String(REVEAL_ZONE_HEIGHT)}px`,
    ...widthVariable,
    ...sizeVariable,
  }
  return (
    <section
      className={cx(s.frame, className)}
      style={frameStyle}
      data-document-zoom-frame=""
      data-document-zoom-mode={mode}
    >
      <div
        className={s.scrollport}
        data-document-zoom-scrollport=""
        onScroll={(event) => {
          const node = event.currentTarget
          const bottom = node.scrollHeight - node.clientHeight - node.scrollTop <= 1
          if (bottom && !atBottom.current)
            onReveal?.()
          atBottom.current = bottom
        }}
      >
        <div className={s.surface} data-document-zoom-surface="">
          {children}
        </div>
      </div>
      <div className={s.revealZone} data-document-zoom-reveal-zone="" aria-hidden="true" />
    </section>
  )
}
