import type * as React from 'react'
import type { LightboxLabels } from './lightbox'
import { IconLoadingOutlineRegular, IconRefreshOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useStyle } from '../../lib/style'
import { Lightbox } from './lightbox'

const CSS = `/* @deepseek-ai/dsh-client-ui-attachment / MessageImage.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.gallery {
  flex-wrap: wrap;
  gap: 10px;
  max-width: 100%;
  display: flex;
}

.gallery[data-align=end] {
  justify-content: flex-end;
  align-self: flex-end;
}

.gallery[data-align=start] {
  justify-content: flex-start;
  align-self: flex-start;
}

.frame {
  border: .5px solid var(--dsw-alias-border-l2-darkmode-thin);
  border-radius: var(--dsw-radius-xl);
  background: var(--dsw-alias-interactive-bg-hover);
  cursor: zoom-in;
  flex: none;
  place-items: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  display: grid;
  overflow: hidden;
}

.frame[data-variant=tile] {
  width: 64px;
  min-width: 64px;
  height: 64px;
  min-height: 64px;
}

.frame img {
  object-fit: cover;
  width: 100%;
  height: 100%;
  display: block;
}

.loading,
.error {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}

.error {
  border: .5px solid var(--dsw-alias-border-l2-darkmode-thin);
  border-radius: var(--dsw-radius-md);
  background: var(--dsw-alias-interactive-bg-hover-danger);
  cursor: pointer;
  max-width: 240px;
  padding: 10px 12px;
}

.error[data-variant=tile] {
  border-radius: var(--dsw-radius-xl);
  width: 64px;
  height: 64px;
  padding: 4px;
  overflow: hidden;
}

.frame[data-variant=thumbnail],
.error[data-variant=thumbnail] {
  box-sizing: border-box;
  border-radius: var(--dsw-radius-lg);
  place-items: center;
  width: 48px;
  min-width: 48px;
  height: 48px;
  min-height: 48px;
  padding: 2px;
  display: grid;
  overflow: hidden;
}

.frame[data-variant=thumbnail] img {
  object-fit: contain;
}

.spinner {
  animation: .9s linear infinite spinner-rotate;
}

@keyframes spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion:reduce) {
  .spinner {
    animation: none;
  }
}

.frame:focus-visible,
.error:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));
  outline-offset: 2px;
}
`

/** Presentation of one image in a gallery. */
export type ImageTileVariant = 'single' | 'tile' | 'thumbnail'

/** Intrinsic pixel size of the image. */
export interface ImageTileDimensions {
  /** Natural width in px. */
  readonly width: number
  /** Natural height in px. */
  readonly height: number
}

/** Resolved strings for {@link ImageTile}. */
export interface ImageTileLabels {
  /** Tooltip of an opened image. */
  readonly open: string
  /** Accessible name of the opener, given the image name. */
  readonly openNamed: (name: string) => string
  /** Text shown while the image URL is unresolved. */
  readonly loading: string
  /** Text shown after the image URL failed. */
  readonly loadFailed: string
  /** Strings for the document-level original preview. */
  readonly lightbox: LightboxLabels
}

/** Props for {@link ImageTile}: a controlled thumbnail with its preview. */
export interface ImageTileProps {
  /** Displayable URL, or null while the owner resolves it. */
  readonly src: string | null
  /** Image name, used as the alt text and in the opener's accessible name. */
  readonly name: string
  /** Lone image, cropped tile, or contained list thumbnail (default 'single'). */
  readonly variant?: ImageTileVariant | undefined
  /** Whether the owner reported a load failure. */
  readonly failed?: boolean | undefined
  /** Natural size; sizes a lone image and picks the crop anchor. */
  readonly dimensions?: ImageTileDimensions | undefined
  /** Whether the full-screen viewer is showing. */
  readonly open: boolean
  /** Open or close the viewer. */
  readonly onOpenChange: (open: boolean) => void
  /** Retry a failed load. */
  readonly onRetry?: (() => void) | undefined
  /** Resolved strings. */
  readonly labels: ImageTileLabels
}

interface ImageFit {
  readonly width: number
  readonly height: number
  readonly objectPosition: string
}

/**
 * Size a lone image with the official 240px-long-edge rule.
 * The rendered aspect ratio is clamped to [0.25, 4] and the image is never
 * upscaled past its natural size; the crop anchor keeps the informative edge.
 * @param dimensions - natural image size.
 * @returns the frame box and the image crop anchor.
 */
function singleFit(dimensions: ImageTileDimensions): ImageFit {
  const natural = dimensions.width / dimensions.height
  const ratio = Math.min(4, Math.max(0.25, natural))
  const box = ratio >= 1
    ? { width: 240, height: 240 / ratio }
    : { width: 240 * ratio, height: 240 }
  const scale = Math.min(1, dimensions.width / box.width, dimensions.height / box.height)
  return {
    width: Math.max(1, Math.round(box.width * scale)),
    height: Math.max(1, Math.round(box.height * scale)),
    objectPosition: natural < 0.25
      ? 'center top'
      : natural > 4
        ? 'left center'
        : 'center',
  }
}

/**
 * Render one image tile: a bounded thumbnail button plus its original-image
 * preview. Loading and failure are reported by the owner through `src` and
 * `failed`; the component issues no requests.
 * @returns the frame and, while open, the document-level lightbox.
 */
export function ImageTile({
  src,
  name,
  variant = 'single',
  failed = false,
  dimensions,
  open,
  onOpenChange,
  onRetry,
  labels,
}: ImageTileProps): React.JSX.Element {
  const s = useStyle('image-tile', CSS)
  if (failed) {
    return (
      <ImageErrorFrame
        styles={s}
        variant={variant}
        labels={labels}
        onRetry={onRetry}
      />
    )
  }
  const loadingThumbnail = variant === 'thumbnail' && src === null
  const fit = fitOf(variant, dimensions)
  const frameStyle: React.CSSProperties | undefined = fit === undefined
    ? undefined
    : { width: fit.width, height: fit.height }
  const imageStyle: React.CSSProperties | undefined = fit === undefined
    ? undefined
    : { objectPosition: fit.objectPosition }
  return (
    <>
      <button
        type="button"
        className={s.frame}
        data-variant={variant}
        style={frameStyle}
        title={loadingThumbnail ? labels.loading : labels.open}
        aria-label={loadingThumbnail
          ? labels.loading
          : labels.openNamed(name)}
        aria-busy={loadingThumbnail || undefined}
        onClick={() => {
          if (src !== null)
            onOpenChange(true)
        }}
      >
        {src === null
          ? (
              <LoadingContent
                styles={s}
                loadingThumbnail={loadingThumbnail}
                labels={labels}
              />
            )
          : <img src={src} alt={name} style={imageStyle} />}
      </button>
      {open && src !== null && typeof document !== 'undefined' && (
        <Lightbox
          src={src}
          alt={name}
          labels={labels.lightbox}
          onClose={() => {
            onOpenChange(false)
          }}
        />
      )}
    </>
  )
}

/**
 * Resolve the frame size for the requested presentation.
 * @param variant - gallery presentation.
 * @param dimensions - natural size, when known.
 * @returns the single-image fit, or undefined for CSS-sized variants.
 */
function fitOf(variant: ImageTileVariant, dimensions: ImageTileDimensions | undefined): ImageFit | undefined {
  if (variant !== 'single')
    return undefined
  if (dimensions === undefined)
    return { width: 240, height: 240, objectPosition: 'center' }
  return singleFit(dimensions)
}

interface ImageErrorFrameProps {
  readonly styles: Record<string, string>
  readonly variant: ImageTileVariant
  readonly labels: ImageTileLabels
  readonly onRetry?: (() => void) | undefined
}

/**
 * Render the failed-load retry control.
 * @returns the error button.
 */
function ImageErrorFrame({ styles, variant, labels, onRetry }: ImageErrorFrameProps): React.JSX.Element {
  const thumbnail = variant === 'thumbnail'
  return (
    <button
      type="button"
      className={styles.error}
      data-variant={variant}
      title={thumbnail ? labels.loadFailed : undefined}
      aria-label={thumbnail ? labels.loadFailed : undefined}
      onClick={onRetry}
    >
      {thumbnail
        ? <span aria-hidden="true"><IconRefreshOutlineRegular /></span>
        : labels.loadFailed}
    </button>
  )
}

interface LoadingContentProps {
  readonly styles: Record<string, string>
  readonly loadingThumbnail: boolean
  readonly labels: ImageTileLabels
}

/**
 * Render the loading state inside the image frame.
 * @returns the loading content.
 */
function LoadingContent({ styles, loadingThumbnail, labels }: LoadingContentProps): React.JSX.Element {
  return (
    <span className={styles.loading} aria-hidden={loadingThumbnail || undefined}>
      {loadingThumbnail
        ? <IconLoadingOutlineRegular className={styles.spinner} />
        : labels.loading}
    </span>
  )
}
