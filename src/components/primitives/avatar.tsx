import type * as React from 'react'
import { useState } from 'react'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-settings-account / AccountAvatar.module.css (verbatim).
 */
const CSS = `/* @deepseek-ai/dsh-client-ui-settings-account / AccountAvatar.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.image {
  corner-shape: round;
  object-fit: cover;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  display: block;
}
`

/** First visible character of a name, uppercased; empty when there is no name. */
function initialOf(name: string | undefined): string {
  const first: string | undefined = name === undefined
    ? undefined
    : Array.from(name.trim())[0]
  return first === undefined
    ? ''
    : first.toUpperCase()
}

/** Props for {@link Avatar}. */
export interface AvatarProps {
  /** Image URL; when absent or failed to load, the name's initial is shown. */
  src?: string
  /** Name used for the fallback initial and the default description. */
  name?: string
  /** Accessible image description; defaults to name, and an empty string marks it decorative. */
  alt?: string
  /** Width and height in pixels (default 32). */
  size?: number
  /** Extra class for layout placement. */
  className?: string
}

/**
 * Render a round avatar: the image while src loads, otherwise the name's
 * initial. The official sheet only describes the image's fill and radius, so
 * the box size is inline and no extra class is invented.
 */
export function Avatar({
  src,
  name,
  alt,
  size = 32,
  className,
}: AvatarProps): React.JSX.Element {
  const s = useStyle('avatar', CSS)
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined)
  const dimension = Number.isFinite(size)
    ? Math.max(0, Math.floor(size))
    : 32
  const box: React.CSSProperties = { width: dimension, height: dimension }
  if (src !== undefined && src !== failedSrc) {
    return (
      <img
        className={cx(s.image, className)}
        style={box}
        src={src}
        alt={alt ?? name ?? ''}
        referrerPolicy="no-referrer"
        onError={() => {
          setFailedSrc(src)
        }}
      />
    )
  }
  const label = alt ?? name
  const labelled = label !== undefined && label !== ''
  return (
    <span
      className={cx(s.image, className)}
      style={{
        ...box,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? label : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      <span aria-hidden="true">{initialOf(name)}</span>
    </span>
  )
}
