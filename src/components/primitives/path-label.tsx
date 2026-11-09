import type * as React from 'react'
import { useLayoutEffect, useRef } from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/PathLabel.module.css */
/* Auto margin keeps fitting text at the left. On overflow it becomes zero,
   so flex-end preserves the filename suffix at the right edge. */
.path {
  display: flex;
  flex: 1 1 auto;
  justify-content: flex-end;
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  white-space: nowrap;
}

.path[data-path-clipped] {
  mask-image: linear-gradient(to right, transparent, black 28px);
}

.text {
  flex: none;
  margin-right: auto;
}

.directory {
  color: var(--dsw-alias-label-tertiary);
}

.name {
  color: var(--dsw-alias-label-primary);
}
`

/** Props for {@link PathLabel}: a path plus the outer span's attributes. */
export type PathLabelProps = {
  path: string
} & Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'title'>

/**
 * Split a path for display: the directories through their last separator, and
 * the final segment after it. Both `/` and `\\` separate, trailing separators
 * are dropped first, and a path with no separator is all name.
 * @param path - file or directory path using POSIX or Windows separators.
 */
function pathPartsOf(path: string): { directory: string, name: string } {
  const trimmed = path.replace(/[/\\]+$/, '')
  if (trimmed === '')
    return { directory: '', name: path }
  const cut = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\')) + 1
  return {
    directory: trimmed.slice(0, cut),
    name: trimmed.slice(cut),
  }
}

/**
 * Render subdued directories and a primary filename, with the complete path on hover.
 * Fitting text is left-aligned; overflow clips and fades at the left edge.
 */
export function PathLabel({ path, className, ...attributes }: PathLabelProps): React.JSX.Element {
  const s = useStyle('path-label', CSS)
  const boxRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const { directory, name } = pathPartsOf(path)
  useLayoutEffect(() => {
    const outer = boxRef.current
    const inner = textRef.current
    if (outer === null || inner === null)
      return
    const apply = (): void => {
      outer.toggleAttribute('data-path-clipped', inner.offsetWidth > outer.clientWidth)
    }
    apply()
    const observer = typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(apply)
    observer?.observe(outer)
    observer?.observe(inner)
    return () => {
      observer?.disconnect()
    }
  }, [path])
  return (
    <span
      {...attributes}
      ref={boxRef}
      className={cx(s.path, className)}
      title={path}
      data-path-label=""
    >
      <span ref={textRef} className={s.text}>
        {directory !== '' && <span className={s.directory}>{directory}</span>}
        <span className={s.name}>{name}</span>
      </span>
    </span>
  )
}
