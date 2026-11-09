import type * as React from 'react'
import { createPortal } from 'react-dom'
import { useStyle } from '../../lib/style'

const CSS = `/* @deepseek-ai/dsh-client-ui-attachment / DropOverlay.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.mask {
  z-index: 1000;
  pointer-events: none;
  background-color: var(--dsw-alias-bg-mask-drop);
  backdrop-filter: blur(10px);
  justify-content: center;
  align-items: center;
  animation: .16s ease-out fade-in;
  display: flex;
  position: fixed;
  inset: 0;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion:reduce) {
  .mask {
    animation: none;
  }
}

.wrap {
  color: var(--dsw-alias-label-primary);
  text-align: center;
  flex-direction: column;
  align-items: center;
  margin-top: -3%;
  padding: 0 40px;
  display: flex;
}

.illustration {
  width: 115px;
  height: 84px;
}

.title {
  font: var(--dsw-font-l-20);
  margin-top: 16px;
}

.desc {
  font: var(--dsw-font-s-14);
  color: var(--dsw-alias-label-tertiary);
  white-space: pre-wrap;
  margin-top: 16px;
}
`

/** Resolved strings for {@link DropOverlay}. */
export interface DropOverlayLabels {
  /** Invitation heading. */
  readonly title: string
  /** Optional limits line; hidden while drops are disabled. */
  readonly desc?: string | undefined
}

/** Props for {@link DropOverlay}: whether drops are accepted and the copy to show. */
export interface DropOverlayProps {
  /** Drops are currently refused; renders the blocked illustration. */
  readonly disabled?: boolean | undefined
  /** Resolved strings. */
  readonly labels: DropOverlayLabels
}

/**
 * Render the full-viewport drag-and-drop invitation.
 *
 * Decoration only: `pointer-events: none` keeps drag targeting on the page
 * below, so the owner's document listeners keep the enter/leave count.
 * @returns the overlay layer, or null without a document.
 */
export function DropOverlay({ disabled = false, labels }: DropOverlayProps): React.ReactPortal | null {
  const s = useStyle('drop-overlay', CSS)
  if (typeof document === 'undefined')
    return null
  return createPortal(
    <div className={s.mask} role="status">
      <div className={s.wrap}>
        <div className={s.illustration} aria-hidden="true">
          {disabled
            ? <UploadDisabledIllustration />
            : <UploadIllustration />}
        </div>
        <div className={s.title}>{labels.title}</div>
        {!disabled && labels.desc !== undefined && <div className={s.desc}>{labels.desc}</div>}
      </div>
    </div>,
    document.body,
  )
}

/**
 * Tilted photo-and-note cards, the official upload illustration.
 * @returns the 115x84 artwork.
 */
function UploadIllustration(): React.JSX.Element {
  return (
    <svg width="115" height="84" viewBox="0 0 115 84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#dshDropOverlayClip)">
        <rect y="17.0742" width="44.1832" height="43.6431" rx="12" transform="rotate(-22.7338 0 17.0742)" fill="#9CE5ED" />
        <rect x="73.4043" y="8.54297" width="43.7267" height="50.5284" rx="8" transform="rotate(17.403 73.4043 8.54297)" fill="#679EFE" />
        <path d="M30.4917 28.1369L40.8865 33.4564L37.2232 34.9524L29.5302 31.0159L26.7919 39.2122L23.1285 40.7082L26.8287 29.6338L16.8967 24.5516L20.5601 23.0556L27.7902 26.7549L30.3639 19.052L34.0273 17.556L30.4917 28.1369Z" fill="white" />
        <path d="M77.5088 26.3047L101.057 33.7966" stroke="white" strokeWidth="3" />
        <path d="M72.2646 42.7871L86.3938 47.2823" stroke="white" strokeWidth="3" />
        <path d="M74.8867 34.5469L98.4353 42.0388" stroke="white" strokeWidth="3" />
        <rect x="31.583" y="38.6641" width="44.9157" height="44.3666" rx="12" transform="rotate(-0.134233 31.583 38.6641)" fill="#3964FE" />
        <path d="M38.9521 73.0337C39.6129 71.7086 41.7113 66.0937 43.5113 61.1663C44.1607 59.3885 46.7484 59.3923 47.4591 61.1465C48.9728 64.8828 50.7969 68.6922 51.9988 69.1925C54.2946 70.1482 57.9854 59.3573 68.0064 70.1801" stroke="white" strokeWidth="3" />
        <circle cx="60.6157" cy="52.247" r="4.38794" transform="rotate(22.5996 60.6157 52.247)" fill="white" />
      </g>
      <defs>
        <clipPath id="dshDropOverlayClip">
          <rect width="115" height="84" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

/**
 * Greyed cards with a blocked badge, the official disabled illustration.
 * @returns the 115x84 artwork.
 */
function UploadDisabledIllustration(): React.JSX.Element {
  return (
    <svg width="115" height="84" viewBox="0 0 115 84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M29.6829 4.63701L11.0677 12.4368C4.95519 14.998 2.07624 22.0294 4.6374 28.1419L12.2285 46.259C14.7896 52.3715 21.8211 55.2505 27.9336 52.6893L46.5488 44.8895C52.6613 42.3283 55.5403 35.2969 52.9791 29.1844L45.388 11.0673C42.8269 4.9548 35.7954 2.07585 29.6829 4.63701Z" fill="#979DA6" />
      <path d="M30.4915 28.1375L40.8863 33.4569L37.223 34.9529L29.53 31.0165L26.7917 39.2128L23.1283 40.7088L26.8285 29.6344L16.8965 24.5522L20.5599 23.0562L27.79 26.7555L30.3637 19.0526L34.0271 17.5566L30.4915 28.1375Z" fill="white" />
      <path d="M107.496 19.2285L81.0381 10.9357C76.8221 9.61423 72.333 11.9607 71.0116 16.1768L60.6844 49.1246C59.363 53.3406 61.7095 57.8297 65.9255 59.1511L92.383 67.4439C96.599 68.7654 101.088 66.4189 102.41 62.2029L112.737 29.255C114.058 25.039 111.712 20.55 107.496 19.2285Z" fill="#979DA6" />
      <path d="M77.5088 26.3047L101.057 33.7967" stroke="white" strokeWidth="3" />
      <path d="M72.2646 42.7871L86.3938 47.2823" stroke="white" strokeWidth="3" />
      <path d="M74.8867 34.5469L98.4353 42.0388" stroke="white" strokeWidth="3" />
      <path d="M66.5798 30.1418L41.481 30.2006C33.5281 30.2193 27.0962 36.6815 27.1148 44.6343L27.172 69.0742C27.1907 77.0271 33.6529 83.459 41.6057 83.4404L66.7045 83.3816C74.6574 83.363 81.0894 76.9008 81.0707 68.9479L81.0135 44.5081C80.9949 36.5552 74.5327 30.1232 66.5798 30.1418Z" fill="#F59E0B" />
      <path d="M54 70.7969C61.732 70.7969 68 64.5289 68 56.7969C68 49.0649 61.732 42.7969 54 42.7969C46.268 42.7969 40 49.0649 40 56.7969C40 64.5289 46.268 70.7969 54 70.7969Z" stroke="white" strokeWidth="3.5" />
      <path d="M44 46.7969L64 66.7969" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}
