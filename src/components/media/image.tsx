import type * as React from 'react'
import { IconLoadingOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useState } from 'react'
import { useStyle } from '../../lib/style'

/* The embedded sheet below is the official stylesheet, copied verbatim. */
const CSS = `.frame {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: var(--dsw-radius-sm);
  background: var(--dsw-alias-bg-base);
}
.image { width: 100%; height: 100%; min-height: 0; object-fit: contain; opacity: 0; }
.image[data-ready] { opacity: 1; }
.status {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}
`

/** Source, accessible description, and status text for {@link Image}. */
export interface ImageProps {
  /** Displayable image URL. */
  readonly src: string
  /** Accessible description. */
  readonly alt: string
  /** Status text while the image loads. */
  readonly loadingLabel: string
  /** Status text after the image fails. */
  readonly failedLabel: string
}

type ImageState = 'loading' | 'ready' | 'failed'

/**
 * Render an image without introducing a second activation target.
 *
 * The frame holds its box while the image loads, so surrounding content does
 * not reflow when the bytes arrive. A new `src` remounts the frame, so its
 * status starts from loading instead of replaying a stale result.
 * @returns A contained image with loading or failure status.
 */
export function Image({ src, alt, loadingLabel, failedLabel }: ImageProps): React.JSX.Element {
  return <ImageFrame key={src} src={src} alt={alt} loadingLabel={loadingLabel} failedLabel={failedLabel} />
}

/**
 * Render one image frame; the exported component keys it by `src`.
 * @returns The frame with its image and status overlay.
 */
function ImageFrame({ src, alt, loadingLabel, failedLabel }: ImageProps): React.JSX.Element {
  const s = useStyle('image', CSS)
  const [state, setState] = useState<ImageState>('loading')
  return (
    <span className={s.frame}>
      {state !== 'failed' && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={s.image}
          data-ready={state === 'ready'
            ? 'true'
            : undefined}
          onLoad={() => {
            setState('ready')
          }}
          onError={() => {
            setState('failed')
          }}
        />
      )}
      {state !== 'ready' && (
        <span className={s.status} role="status">
          {state === 'loading' && <IconLoadingOutlineRegular size={16} />}
          <span>
            {state === 'loading'
              ? loadingLabel
              : failedLabel}
          </span>
        </span>
      )}
    </span>
  )
}
