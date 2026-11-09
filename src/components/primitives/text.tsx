import type * as React from 'react'
import { Fragment } from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered verbatim from the official inline text sheet */
.root {
  display: contents;
}

.ellipsis {
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  max-width: 100%;
  display: block;
  overflow: hidden;
}
`

/** Label colour; each value names one official label token. */
export type TextTone = 'primary' | 'secondary' | 'tertiary' | 'error'

const TONE_COLOR: Record<TextTone, string> = {
  primary: 'var(--dsw-alias-label-primary)',
  secondary: 'var(--dsw-alias-label-secondary)',
  tertiary: 'var(--dsw-alias-label-tertiary)',
  error: 'var(--dsw-alias-state-error-primary)',
}

/** Props for {@link Text}. */
export interface TextProps {
  /** Body copy; a plain string keeps its line breaks. */
  readonly children?: React.ReactNode
  /** Collapse to a single ellipsized line instead of wrapping. */
  readonly ellipsis?: boolean
  /** Explicit label colour; omit to inherit the surrounding colour. */
  readonly tone?: TextTone
  /** Element to render (default p). */
  readonly as?: 'p' | 'div' | 'span'
  /** Extra class for placement. */
  readonly className?: string
}

/**
 * Turn a string's hard line breaks into br elements.
 * The official sheet leaves white-space policy to the consumer, so a break is
 * marked in the flow instead of restyling the element.
 * @param text - the string to split.
 * @returns the lines, separated by br elements.
 */
function withLineBreaks(text: string): React.ReactNode {
  return text.split('\n').map((line, index) => (
    <Fragment key={index}>
      {index > 0
        ? <br />
        : null}
      {line}
    </Fragment>
  ))
}

/**
 * Render body text.
 * @param props - content, truncation, colour and element.
 * @returns the text element.
 */
export function Text(props: TextProps): React.JSX.Element {
  const { children, ellipsis = false, tone, as: Element = 'p', className } = props
  const s = useStyle('text', CSS)
  const content = !ellipsis && typeof children === 'string'
    ? withLineBreaks(children)
    : children
  return (
    <Element
      className={cx(ellipsis ? s.ellipsis : s.root, className)}
      style={tone === undefined
        ? undefined
        : { color: TONE_COLOR[tone] }}
    >
      {content}
    </Element>
  )
}
