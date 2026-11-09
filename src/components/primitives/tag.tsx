/* eslint-disable slop/no-em-dash -- the stylesheet below is copied verbatim from the official CSS module, comments included. */
import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/Tag.module.css */
/* Capsule geometry is fixed: a tag reads as one size everywhere, and only its
 * palette varies. Tone colors ride background/border/color so a render site can
 * still position the tag with its own class without touching the palette. */
.tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  corner-shape: round;
  padding: 1px 8px;
  font-size: 11px;
  line-height: 17px;
  font-weight: 500;
  white-space: nowrap;
}

.tag[data-tone='outline'] {
  border: 0.5px solid var(--dsw-alias-border-l4);
  color: var(--dsw-alias-label-tertiary);
}

.tag[data-tone='solid'] {
  background: var(--dsw-alias-label-primary);
  color: var(--dsw-alias-bg-layer-3);
}

.tag[data-tone='neutral'] {
  background: var(--dsw-alias-bg-module-platform);
  color: var(--dsw-alias-label-secondary);
}

.tag[data-tone='quiet'] {
  color: var(--dsw-alias-label-tertiary);
}

/* Status tones tint their own color for the fill, so a palette change moves
 * fill and text together and neither needs a second token. The tint is 10%,
 * except \`warning\`, which keeps the 12% the plugin inventory's conditional
 * tag shipped with — matching it is what makes this a pure consolidation. */
.tag[data-tone='success'] {
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent);
  color: var(--dsw-alias-state-success-primary);
}

.tag[data-tone='info'] {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent);
  color: var(--dsw-alias-state-business-primary);
}

.tag[data-tone='warning'] {
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent);
  color: var(--dsw-alias-state-warn-primary);
}

.tag[data-tone='danger'] {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent);
  color: var(--dsw-alias-state-error-primary);
}
`

/** Palette selector; each tone names one shipped appearance. */
export type TagTone
  = | 'outline'
    | 'solid'
    | 'neutral'
    | 'quiet'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'

/** Props for {@link Tag}. */
export interface TagProps {
  /** Which palette to use (default `outline`). */
  tone?: TagTone
  /** Extra class for layout placement. */
  className?: string
  /** The localized label, owned by the render site. */
  children?: React.ReactNode
}

/**
 * Render a read-only tag.
 */
export function Tag({ tone = 'outline', className, children }: TagProps): React.JSX.Element {
  const s = useStyle('tag', CSS)
  return (
    <span className={cx(s.tag, className)} data-tone={tone}>
      {children}
    </span>
  )
}
