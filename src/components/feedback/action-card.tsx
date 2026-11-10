import type * as React from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { useId } from 'react'
import { cx, useStyle } from '../../lib/style'

/** Recovered from @deepseek-ai/dsh-client-ui-action-cards / Card.module.css. */
const CSS = `/* @deepseek-ai/dsh-client-ui-action-cards / Card.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.card {
  border: .5px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-alias-bg-layer-1);
  font-family: var(--dsw-font-family);
  color: var(--dsw-alias-label-primary);
  margin: 16px 0;
  overflow: hidden;
}

.body {
  padding: 12px 20px 20px;
}

.title {
  overflow-wrap: anywhere;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  display: block;
}

.text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: var(--dsw-alias-label-secondary);
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.7;
}

.toggle {
  height: auto;
  min-height: 24px;
  margin: 8px 0 0;
  padding-inline: 0;
  font-size: 12px;
}

.status {
  color: var(--dsw-alias-label-secondary);
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.6;
}

.footer {
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  display: flex;
}
`

/** Graphemes drawn about twice as wide as a Latin letter: CJK scripts, CJK punctuation and fullwidth forms. */
const WIDE_GRAPHEME = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u3000-\u303F\uFF00-\uFF60\uFFE0-\uFFE6]/u
/** Preview budget in Latin-letter widths, about two card lines at desktop width. */
const FOLD_WIDTH = 260

/** Phases the fallback body can name. */
export type ActionCardPhase = 'dismissed' | 'replaced'

/** Default status copy for a named phase. */
const PHASE_LABELS: Record<ActionCardPhase, string> = {
  dismissed: '已忽略',
  replaced: '已替换',
}

/** Props for {@link ActionCard}. */
export interface ActionCardProps {
  /** Card heading. */
  readonly title: string
  /** Folded brief; the full text is always rendered after expanding. */
  readonly brief: string
  /** Stable proposal identity published as `data-action-card`. */
  readonly cardId?: string | undefined
  /** Registered action kind published as `data-action`. */
  readonly action?: string | undefined
  /** Named decision phase rendered as a status line. */
  readonly phase?: ActionCardPhase | undefined
  /** Overrides the phase status copy. */
  readonly phaseLabel?: string | undefined
  /** Localized failure copy rendered as an alert. */
  readonly error?: string | undefined
  /** Whether a decision is already recorded; hides the dismiss footer while true. */
  readonly decided?: boolean | undefined
  /** Whether a dismiss request is in flight. */
  readonly dismissing?: boolean | undefined
  /** Whether the brief is fully expanded (owner-controlled). */
  readonly expanded?: boolean | undefined
  /** Toggle copy while folded (official zh: 展开). */
  readonly expandLabel?: string | undefined
  /** Toggle copy while expanded (official zh: 收起). */
  readonly collapseLabel?: string | undefined
  /** Dismiss action copy (official zh: 暂不需要). */
  readonly dismissLabel?: string | undefined
  /** Dismiss the proposal. */
  readonly onDismiss?: (() => void) | undefined
  /** Receives the requested expanded state. */
  readonly onExpandedChange?: ((expanded: boolean) => void) | undefined
  /** Extra class on the card. */
  readonly className?: string | undefined
}

/**
 * Fold omitted text without measuring layout; a wide grapheme counts twice so
 * Chinese and English fold near the same line. The full text is never altered.
 * @param text - brief text.
 * @returns the folded preview, or undefined when the text fits.
 */
function foldedPreview(text: string): string | undefined {
  const compact = text.replace(/\s+/g, ' ').trim()
  const characters = Array.from(
    new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(compact),
    part => part.segment,
  )
  let width = 0
  for (const [index, character] of characters.entries()) {
    width += WIDE_GRAPHEME.test(character)
      ? 2
      : 1
    if (width > FOLD_WIDTH)
      return `${characters.slice(0, index).join('').trimEnd()}…`
  }
  return undefined
}

/**
 * Render the action card frame: heading, folded brief and the dismiss footer.
 * The owner supplies the registered body behavior; this fallback frame only draws it.
 */
export function ActionCard({
  title,
  brief,
  cardId,
  action,
  phase,
  phaseLabel,
  error,
  decided = false,
  dismissing = false,
  expanded = false,
  expandLabel = '展开',
  collapseLabel = '收起',
  dismissLabel = '暂不需要',
  onDismiss,
  onExpandedChange,
  className,
}: ActionCardProps): React.JSX.Element {
  // Button.module.css precedes Card.module.css: `.toggle`'s sizing overrides Button's.
  const s = useStyle('action-card', CSS)
  const id = useId()
  const preview = foldedPreview(brief)
  const visible = expanded || preview === undefined
    ? brief
    : preview
  return (
    <section className={cx(s.card, className)} aria-label={title} data-action-card={cardId} data-action={action}>
      <div className={s.body}>
        <strong className={s.title}>{title}</strong>
        <p id={id} className={s.text}>{visible}</p>
        {preview !== undefined && (
          <Button
            variant="ghost"
            size="sm"
            className={s.toggle}
            aria-expanded={expanded}
            aria-controls={id}
            onClick={() => {
              onExpandedChange?.(!expanded)
            }}
          >
            {expanded ? collapseLabel : expandLabel}
          </Button>
        )}
        {phase !== undefined && (
          <p role="status" className={s.status}>{phaseLabel ?? PHASE_LABELS[phase]}</p>
        )}
        {error !== undefined && (
          <p role="alert" className={s.status}>{error}</p>
        )}
        {!decided && (
          <footer className={s.footer}>
            <Button variant="ghost" size="sm" disabled={dismissing} onClick={onDismiss}>
              {dismissLabel}
            </Button>
          </footer>
        )}
      </div>
    </section>
  )
}
