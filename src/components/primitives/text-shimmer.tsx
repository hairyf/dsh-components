import type * as React from 'react'
import { createContext, memo, useContext } from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/TextShimmer.module.css */
.root {
  position: relative;
  display: inline-grid;
  width: max-content;
  max-width: 100%;
  min-width: 0;
  vertical-align: top;
  color: inherit;
}

.content {
  display: flex;
  align-items: center;
  min-width: 0;
}

.text {
  color: inherit;
}

.text[data-shimmer-text]::after {
  content: attr(data-shimmer-text);
}

.decoration {
  position: absolute;
  inset: 0;
  /* The moving mask must not enlarge any ancestor's scrollable area. */
  overflow: clip;
  pointer-events: none;
  user-select: none;
}

.sweep {
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-shimmer);
  mask-image: linear-gradient(105deg, transparent 0%, black 40% 60%, transparent 100%);
  transform: translateX(-100%);
  animation-name: dsh-row-shimmer-sweep;
}

/* Semantic base colors stay on the real content; the overlay supplies one tint. */
.sweep * {
  color: inherit !important;
}

.sweep [data-shimmer-decoration] {
  background: currentColor;
}

/* Opposite transforms keep every glyph aligned while their shared mask moves. */
.highlight {
  width: 100%;
  height: 100%;
  transform: translateX(100%);
  animation-name: dsh-row-shimmer-highlight;
}

.sweep,
.highlight {
  animation-duration: 1.5s;
  animation-delay: 0.3s;
  animation-timing-function: steps(48, end);
  animation-iteration-count: infinite;
}

@keyframes dsh-row-shimmer-sweep {
  0% { transform: translateX(-100%); }
  66.6667%, 100% { transform: translateX(100%); }
}

@keyframes dsh-row-shimmer-highlight {
  0% { transform: translateX(100%); }
  66.6667%, 100% { transform: translateX(-100%); }
}

@media (prefers-reduced-motion: reduce) {
  .decoration {
    display: none;
  }

  .sweep,
  .highlight {
    animation: none;
  }
}
`

/** Text activity animation shared by a row and its nested text fragments. */
const DecorativeCopy = createContext<boolean | undefined>(undefined)

/** Text and activity supplied by the owning row. */
export interface TextShimmerProps {
  /** Text or presentational children with text in nested TextShimmer instances. No effects or element ids. */
  children: React.ReactNode
  /** Whether to animate; nested instances share the containing row's activity. */
  active?: boolean
  className?: string
  /** Layout class applied equally to the base and decorative content. */
  contentClassName?: string
}

interface TextContentProps {
  children?: React.ReactNode
  className?: string
}

function TextContent({ children, className }: TextContentProps): React.JSX.Element {
  const s = useStyle('text-shimmer', CSS)
  const generated = useContext(DecorativeCopy) === true && typeof children === 'string'
  return (
    <span className={cx(s.text, className)} data-shimmer-text={generated ? children : undefined}>
      {generated ? null : children}
    </span>
  )
}

/**
 * Render text with one shared highlight while retaining selectable, accessible content.
 * Nested instances inherit the outer animation. Keep icons outside; mark decorative
 * separators with data-shimmer-decoration so their background follows the highlight.
 * Active children also render in an inert, clipped decoration; supply only presentation.
 */
export const TextShimmer = memo(({
  children,
  active = false,
  className,
  contentClassName,
}: TextShimmerProps): React.JSX.Element => {
  const s = useStyle('text-shimmer', CSS)
  if (useContext(DecorativeCopy) !== undefined) {
    return <TextContent className={className}>{children}</TextContent>
  }
  const content = typeof children === 'string'
    ? <TextContent>{children}</TextContent>
    : children
  return (
    <span className={cx(s.root, className)} data-shimmer={active || undefined}>
      <DecorativeCopy.Provider value={false}>
        <span className={cx(s.content, contentClassName)}>{content}</span>
      </DecorativeCopy.Provider>
      {active && (
        <span className={s.decoration} aria-hidden="true" inert>
          <span className={s.sweep}>
            <DecorativeCopy.Provider value={true}>
              <span className={cx(s.content, s.highlight, contentClassName)}>{content}</span>
            </DecorativeCopy.Provider>
          </span>
        </span>
      )}
    </span>
  )
})
