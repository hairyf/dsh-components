import type * as React from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { useStyle } from '../../lib/style'

/**
 * Recovered verbatim from @deepseek-ai/dsh-client-ui-approval / ApprovalPanel.module.css.
 */
const CSS = `/* @deepseek-ai/dsh-client-ui-approval / ApprovalPanel.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.root {
  padding: 8px calc(var(--dsh-composer-side-clearance) + 16px) 12px;
  flex-direction: column;
  align-items: center;
  display: flex;
}

.card {
  width: 100%;
  max-width: var(--dsh-chat-content-width);
  border: 1px solid var(--dsw-alias-state-warn-secondary);
  border-radius: var(--dsw-radius-xl);
  background: var(--dsw-specific-input-major);
  box-shadow: var(--dsw-shadow-lv2);
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2);
  overflow: hidden;
}

.strip {
  background: var(--dsw-alias-state-warn-tertiary);
  color: var(--dsw-alias-state-warn-primary);
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 13px;
  line-height: 18px;
  display: flex;
}

.body {
  box-sizing: border-box;
  max-height: var(--dsh-composer-text-max-height);
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px 0;
  display: flex;
  overflow-y: auto;
}

.headline {
  color: var(--dsw-alias-label-primary);
  font-size: 15px;
  font-weight: 500;
  line-height: 24px;
}

.command {
  color: var(--dsw-alias-label-tertiary);
  font-family: var(--ds-font-family-code);
  word-break: break-all;
  font-size: 13px;
  line-height: 20px;
}

.actionRow {
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 16px;
  display: flex;
}

@media (hover:hover) {
  .reject:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover-danger);
    color: var(--dsw-alias-state-error-primary);
    --dsh-button-outline-color: transparent;
  }
}

.subject {
  color: var(--dsw-alias-label-primary);
  align-items: center;
  gap: 12px;
  font-size: 16px;
  display: flex;
}

.subject img {
  object-fit: contain;
  flex-shrink: 0;
}

.description {
  color: var(--dsw-alias-label-secondary);
  margin: 0;
  font-size: 13px;
  line-height: 20px;
}

.withSubject .body {
  text-align: left;
}

.withSubject .actionRow {
  flex-wrap: wrap;
}
`

/** Emphasis of a decision card, published as `data-tone` for host styling. */
export type ConfirmPanelTone = 'default' | 'warning' | 'danger'

/** Props for {@link ConfirmPanel}: the decision copy and its two or three actions. */
export interface ConfirmPanelProps {
  /** The question or statement the reader decides on. */
  readonly title: string
  /** Optional supporting sentence under the title. */
  readonly description?: string | undefined
  /** Optional detail block, typically commands or a path, rendered monospaced. */
  readonly detail?: React.ReactNode
  /**
   * Semantic emphasis of the card (default 'default').
   *
   * The official decision card ships a single warning-toned frame, so the tone
   * is published as `data-tone` for host styling instead of overriding it.
   */
  readonly tone?: ConfirmPanelTone | undefined
  /** The confirming action's label. */
  readonly confirmLabel: string
  /** The rejecting action's label. */
  readonly cancelLabel: string
  /** Optional third action's label, usually a persistent choice. */
  readonly alternateLabel?: string | undefined
  /** Whether a decision is in flight; disables every action. */
  readonly busy?: boolean | undefined
  /** Whether every action is unavailable for a reason the owner knows. */
  readonly disabled?: boolean | undefined
  /** Confirm the decision. */
  readonly onConfirm: () => void
  /** Reject the decision. */
  readonly onCancel: () => void
  /** Take the optional third decision; the action needs both this and `alternateLabel`. */
  readonly onAlternate?: (() => void) | undefined
}

/**
 * Render a decision card: a heading, supporting copy, an optional detail block
 * and two or three actions. The owner decides and owns the pending state; this
 * frame only draws the choice.
 * @param props - decision copy, action labels and handlers.
 * @returns the decision card.
 */
export function ConfirmPanel(props: ConfirmPanelProps): React.JSX.Element {
  const {
    title,
    description,
    detail,
    tone = 'default',
    confirmLabel,
    cancelLabel,
    alternateLabel,
    busy = false,
    disabled = false,
    onConfirm,
    onCancel,
    onAlternate,
  } = props
  // Button.module.css precedes ApprovalPanel.module.css: `.reject`'s danger
  // hover and the action row's button sizing rely on that cascade order.
  const s = useStyle('confirm-panel', CSS)
  const inactive = busy || disabled
  return (
    <div className={s.root} aria-busy={busy}>
      <div className={s.card} data-tone={tone}>
        <div className={s.body} role="group" aria-label={title} tabIndex={0}>
          <div className={s.headline}>{title}</div>
          {description === undefined
            ? null
            : <p className={s.description}>{description}</p>}
          {detail === undefined
            ? null
            : <div className={s.command}>{detail}</div>}
        </div>
        <div className={s.actionRow}>
          <Button variant="outline" className={s.reject} disabled={inactive} onClick={onCancel}>
            {cancelLabel}
          </Button>
          {alternateLabel === undefined || onAlternate === undefined
            ? null
            : (
                <Button variant="outline" disabled={inactive} onClick={onAlternate}>
                  {alternateLabel}
                </Button>
              )}
          <Button variant="primary" disabled={inactive} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
