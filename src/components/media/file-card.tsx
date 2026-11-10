import type * as React from 'react'
import { fileExtension, fileSizeText, FileTypeIcon, IconCloseFillRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* @deepseek-ai/dsh-client-ui-attachment / FileCard.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.card {
  border: .5px solid var(--dsw-alias-border-l2,#0000001f);
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-specific-input-major,transparent);
  box-sizing: border-box;
  text-align: left;
  align-items: center;
  gap: 10px;
  width: 240px;
  height: 64px;
  padding: 0 12px;
  display: inline-flex;
  position: relative;
}

.failed {
  border-color: var(--dsw-alias-state-error-primary,#d54941);
}

.icon {
  flex: none;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  display: inline-flex;
}

.spinner {
  corner-shape: round;
  border: 2px solid;
  border-top-color: #0000;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: .8s linear infinite file-card-spin;
}

@keyframes file-card-spin {
  to {
    transform: rotate(360deg);
  }
}

.body {
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding: 8px 0;
  display: flex;
}

.retry {
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  background: 0 0;
  border: 0;
  padding: 0;
}

.name {
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  overflow: hidden;
}

.meta {
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--dsw-alias-label-tertiary,#00000073);
  font-size: 12px;
  line-height: 15px;
  overflow: hidden;
}

.metaFailed {
  color: var(--dsw-alias-state-error-primary,#d54941);
}

.remove {
  corner-shape: round;
  background: var(--dsw-alias-button-contrast-fill,#000000b8);
  width: 18px;
  height: 18px;
  color: var(--dsw-alias-label-primary-inverted,#fff);
  opacity: 0;
  cursor: pointer;
  border: none;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  padding: 0;
  transition: opacity .2s ease-in-out;
  display: inline-flex;
  position: absolute;
  top: 6px;
  right: 6px;
}

.remove:focus-visible {
  opacity: 1;
}

@media (hover:hover) {
  .card:hover .remove {
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

.card:focus-within .name {
  padding-right: 18px;
}

@media (hover:hover) {
  .card:hover .name {
    padding-right: 18px;
  }
}

.removeFailed {
  background: var(--dsw-alias-state-error-primary,#d54941);
  color: #fff;
  opacity: 1;
}

.progressTrack {
  background: var(--dsw-alias-fill-tertiary,#00000014);
  border-radius: 1px;
  height: 2px;
  position: absolute;
  bottom: 5px;
  left: 12px;
  right: 12px;
  overflow: hidden;
}

.progressBar {
  border-radius: inherit;
  background: var(--dsw-alias-brand-primary,#4d6bfe);
  width: 35%;
  height: 100%;
  animation: 1.2s ease-in-out infinite alternate file-card-progress;
  display: block;
}

.progressBar[style] {
  animation: none;
}

@keyframes file-card-progress {
  0% {
    transform: translate(-70%);
  }
  to {
    transform: translate(220%);
  }
}

@media (hover:none),(pointer:coarse) {
  .remove {
    opacity: 1;
  }
}
`

/** Upload lifecycle of one file. */
export type FileCardState = 'ready' | 'uploading' | 'error'

/** Resolved strings for {@link FileCard}. */
export interface FileCardLabels {
  /** Meta line while the upload is in flight. */
  readonly uploading: string
  /** Meta line after the upload failed. */
  readonly failed: string
  /** Accessible name of the retry control on a failed card. */
  readonly retry: string
  /** Accessible name of the remove control. */
  readonly remove: string
  /** Accessible name of the card body. */
  readonly label: string
}

/** Props for {@link FileCard}: one pending file, its lifecycle, and its actions. */
export interface FileCardProps {
  /** File name, also used to classify the type glyph. */
  readonly name: string
  /** File size in bytes. */
  readonly bytes: number
  /** Upload lifecycle (default 'ready'). */
  readonly state?: FileCardState | undefined
  /** Upload progress in [0, 1]; omitted for the indeterminate bar. */
  readonly progress?: number | undefined
  /** Resolved strings. */
  readonly labels: FileCardLabels
  /** Remove the file. */
  readonly onRemove: () => void
  /** Retry a failed upload. */
  readonly onRetry?: (() => void) | undefined
}

/**
 * Render one pending file as the official 240x64 card.
 *
 * The card only displays the lifecycle handed to it: the owner drives the
 * upload and passes the resulting state and progress.
 * @returns the file card with its optional progress track.
 */
export function FileCard({
  name,
  bytes,
  state = 'ready',
  progress,
  labels,
  onRemove,
  onRetry,
}: FileCardProps): React.JSX.Element {
  const s = useStyle('file-card', CSS)
  const extension = fileExtension(name).toUpperCase().slice(0, 8)
  const meta = state === 'uploading'
    ? labels.uploading
    : state === 'error'
      ? labels.failed
      : [
          extension,
          fileSizeText(bytes),
        ].filter(part => part !== '').join(' ')
  const retryable = state === 'error'
  const barStyle: React.CSSProperties | undefined = progress === undefined
    ? undefined
    : { width: `${String(Math.min(1, Math.max(0, progress)) * 100)}%` }
  return (
    <div className={cx(s.card, retryable && s.failed)} title={name}>
      <span className={s.icon} aria-hidden="true">
        {state === 'uploading'
          ? <span className={s.spinner} />
          : <FileTypeIcon path={name} />}
      </span>
      {retryable
        ? (
            <button
              type="button"
              className={cx(s.body, s.retry)}
              aria-label={labels.retry}
              onClick={onRetry}
            >
              <span className={s.name}>{name}</span>
              <span className={cx(s.meta, s.metaFailed)}>{meta}</span>
            </button>
          )
        : (
            <span className={s.body} aria-label={labels.label}>
              <span className={s.name}>{name}</span>
              <span className={s.meta}>{meta}</span>
            </span>
          )}
      <button
        type="button"
        className={cx(s.remove, retryable && s.removeFailed)}
        aria-label={labels.remove}
        onClick={onRemove}
      >
        <IconCloseFillRegular size={12} />
      </button>
      {state === 'uploading' && (
        <span className={s.progressTrack} aria-hidden="true">
          <span className={s.progressBar} style={barStyle} />
        </span>
      )}
    </div>
  )
}
