/* eslint-disable slop/no-em-dash -- the stylesheet below is copied verbatim from the official CSS module, comments included. */
import type * as React from 'react'
import { IconChevronDownOutlineRegular, IconChevronUpOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { memo } from 'react'
import { cx, useStyle } from '../../lib/style'
import { TextShimmer } from './text-shimmer'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/DisclosureRow.module.css */
/* Shared disclosure header: [16px leading] gap 6 [title 13/24] at the default
   size. The Settings font-size preference moves the row through the
   body-published axis: title size follows the secondary tier
   (--dsh-content-font-size-secondary: one step under the body — setting −1 at
   ≤14, setting −2 above), and the row height, leading box, and glyph edge
   shift by the body px delta so the icon keeps its optical share of the
   line. */

.root {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
}

.header {
  display: flex;
  align-items: center;
  min-width: 0;
}

.header[data-has-accessory] {
  gap: 8px;
}

.header[data-has-accessory] .row {
  flex: 0 1 auto;
}

.row {
  flex: 1 1 auto;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  height: calc(24px + var(--dsh-content-font-delta, 0px));
  min-width: 0;
  color: var(--dsw-alias-label-tertiary);
  transition: color 100ms ease;
}

.row[data-expandable] {
  cursor: pointer;
}

@media (hover: hover) {
  .row:hover {
    color: var(--dsw-alias-label-secondary);
  }
}

.leading {
  position: relative;
  flex: none;
  width: calc(16px + var(--dsh-content-font-delta, 0px));
  height: calc(16px + var(--dsh-content-font-delta, 0px));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
}

/* Flow-row glyphs render at 14px inside the 16px box; the CSS edge overrides
   each svg's own width/height attributes so every registered icon scales
   without a per-callsite size prop. StateDot (its svg carries data-state)
   stays at its fixed figma size — it is a status mark, not text furniture. */
.leading svg:not([data-state]) {
  width: calc(14px + var(--dsh-content-font-delta, 0px));
  height: calc(14px + var(--dsh-content-font-delta, 0px));
}

button.leading {
  cursor: pointer;
}

.iconIdle {
  display: inline-flex;
  opacity: 1;
  transition: opacity 100ms ease;
}

.chevronHover {
  position: absolute;
  inset: 0;
  margin: auto;
  opacity: 0;
  transition: opacity 100ms ease;
}

@media (hover: hover) {
  .row:hover .iconIdle {
    opacity: 0;
  }

  .row:hover .chevronHover {
    opacity: 1;
  }
}

.title {
  flex: none;
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: calc(24px + var(--dsh-content-font-delta, 0px));
  color: inherit;
}

@media (prefers-reduced-motion: reduce) {
  .row {
    transition: none;
  }
}
`

/** Shared 24px process row: tertiary text and icons, secondary on hover. */
export interface DisclosureRowProps {
  icon: React.ReactNode
  title: string
  open: boolean
  expandable: boolean
  onToggle: () => void
  /** Animate the complete header while its owning operation is running. */
  running?: boolean
  /** Makes the title row the disclosure target; with an accessory, it shrinks to its content width. */
  expandOnRowClick?: boolean
  /** Replaces the collapsed icon with a chevron while the row is hovered. */
  previewChevron?: boolean
  /** Keeps `collapsedContent` inline while open. */
  keepContentWhenOpen?: boolean
  collapsedContent?: React.ReactNode
  /** Independent action beside the title, outside the disclosure target and shimmer. */
  headerAccessory?: React.ReactNode
  children?: React.ReactNode
  className?: string
  rowClassName?: string
  /** Sizing class for the header text area, beside the leading icon. */
  contentClassName?: string
  /** Layout class shared by the header text and its decorative copy. */
  contentLayoutClassName?: string
  leadingClassName?: string
  chevronClassName?: string
  titleClassName?: string
}

/**
 * Render one disclosure header and its controlled expanded content.
 * Shallow prop comparison requires stable callbacks and React nodes to skip unchanged renders.
 */
export const DisclosureRow = memo(({
  icon,
  title,
  open,
  expandable,
  onToggle,
  running = false,
  expandOnRowClick = false,
  previewChevron = expandable,
  keepContentWhenOpen = false,
  collapsedContent,
  headerAccessory,
  children,
  className,
  rowClassName,
  contentClassName,
  contentLayoutClassName,
  leadingClassName,
  chevronClassName,
  titleClassName,
}: DisclosureRowProps): React.JSX.Element => {
  const s = useStyle('disclosure-row', CSS)
  const rowExpands = expandable && expandOnRowClick
  const toggleFromLeading = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    onToggle()
  }
  const toggleFromKeyboard = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (!rowExpands || (event.key !== 'Enter' && event.key !== ' '))
      return
    event.preventDefault()
    onToggle()
  }
  const collapsedLeading = previewChevron
    ? (
        <>
          <span className={s.iconIdle}>{icon}</span>
          <IconChevronDownOutlineRegular className={cx(chevronClassName, s.chevronHover)} />
        </>
      )
    : icon
  const leading = open
    ? <IconChevronUpOutlineRegular className={chevronClassName} />
    : collapsedLeading
  return (
    <div className={cx(s.root, className)} data-open={open || undefined}>
      <div className={s.header} data-disclosure-header data-has-accessory={!!headerAccessory || undefined}>
        <div
          className={cx(s.row, rowClassName)}
          data-disclosure-row
          data-expandable={rowExpands || undefined}
          role={rowExpands ? 'button' : undefined}
          tabIndex={rowExpands ? 0 : undefined}
          aria-expanded={rowExpands ? open : undefined}
          onClick={rowExpands ? onToggle : undefined}
          onKeyDown={rowExpands ? toggleFromKeyboard : undefined}
        >
          {expandable && !rowExpands
            ? (
                <button
                  type="button"
                  className={cx(s.leading, leadingClassName)}
                  aria-label={title}
                  aria-expanded={open}
                  onClick={toggleFromLeading}
                >
                  {leading}
                </button>
              )
            : <span className={cx(s.leading, leadingClassName)}>{leading}</span>}
          <TextShimmer active={running} className={contentClassName} contentClassName={contentLayoutClassName}>
            <TextShimmer className={cx(s.title, titleClassName)}>{title}</TextShimmer>
            {(keepContentWhenOpen || !open) && collapsedContent}
          </TextShimmer>
        </div>
        {headerAccessory}
      </div>
      {open && children}
    </div>
  )
})
