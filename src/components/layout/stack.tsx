import type * as React from 'react'
import { useStyle } from '../../lib/style'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-conversation / TodoPanel.module.css:
 * the .body column rhythm, minus its dock padding.
 */
const CSS = `.body {
  flex-direction: column;
  gap: 8px;
  display: flex;
}
`

/** Props for {@link Stack}. */
export interface StackProps {
  /** Items placed on the stack. */
  children?: React.ReactNode
  /** Main axis; defaults to column. */
  direction?: 'row' | 'column'
  /** Gap between items; a number is read as px, defaults to 8. */
  gap?: number | string
  /** Cross-axis alignment. */
  align?: React.CSSProperties['alignItems']
  /** Main-axis distribution. */
  justify?: React.CSSProperties['justifyContent']
  /** Allow items to wrap. */
  wrap?: boolean
}

/**
 * Render a controlled flex stack.
 * @param props - direction, gap, alignment, justification, and wrapping.
 * @returns The stack container.
 */
export function Stack(props: StackProps): React.JSX.Element {
  const { children, direction = 'column', gap = 8, align, justify, wrap = false } = props
  const s = useStyle('stack', CSS)
  const style: React.CSSProperties = {
    flexDirection: direction,
    gap: typeof gap === 'number'
      ? `${String(gap)}px`
      : gap,
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : undefined,
  }
  return <div className={s.body} style={style}>{children}</div>
}
