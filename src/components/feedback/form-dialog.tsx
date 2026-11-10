import type * as React from 'react'
import { Button, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered verbatim from @deepseek-ai/dsh-client-ui-message-feedback / FeedbackDialog.module.css.
 */
const CSS = `/* @deepseek-ai/dsh-client-ui-message-feedback / FeedbackDialog.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.dialog.dialog {
  border-radius: var(--dsw-radius-panel);
  gap: 38px;
  width: min(488px,100%);
}

.categories {
  flex-wrap: wrap;
  gap: 8px;
  margin-top: -14px;
  display: flex;
}

.chip {
  border: .5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-sm);
  height: 28px;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  cursor: pointer;
  background: 0 0;
  padding: 0 12px;
  font-size: 13px;
  line-height: 18px;
  transition: background-color .12s,border-color .12s,color .12s;
}

@media (hover:hover) {
  .chip:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
  }
}

.chip:disabled {
  cursor: default;
  opacity: .4;
}

.chip:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));
  outline-offset: 2px;
}

.chipActive {
  border-color: var(--dsw-alias-button-primary-fill);
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground);
}

@media (hover:hover) {
  .chipActive:hover:not(:disabled) {
    border-color: var(--dsw-alias-button-primary-fill);
    background: var(--dsw-alias-button-primary-fill);
    color: var(--dsw-alias-label-primary-foreground);
  }
}

.detail {
  box-sizing: border-box;
  border: .5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-alias-bg-layer-1);
  width: 100%;
  min-height: 116px;
  max-height: 280px;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  field-sizing: content;
  resize: none;
  margin-top: 18px;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 22px;
  transition: border-color .12s,box-shadow .12s;
  display: block;
}

.detail::placeholder {
  color: var(--dsw-alias-label-caption);
}

.detail:focus {
  border-color: var(--dsw-alias-border-l3);
  box-shadow: 0 0 0 1px var(--dsw-alias-state-business-primary);
  outline: none;
}

.submit {
  border-radius: var(--dsw-radius-lg);
  width: 100%;
  height: 44px;
  font-size: 14px;
  font-weight: 500;
}

@media (prefers-reduced-motion:reduce) {
  .chip,
  .detail {
    transition: none;
  }
}
`

/** One option in the dialog's chip row. */
export interface FormDialogOption {
  /** Stable option key. */
  readonly id: string
  /** Localized option label. */
  readonly label: string
}

/** Props for {@link FormDialog}: a controlled modal with fields and a submit. */
export interface FormDialogProps {
  /** Whether the dialog is showing. */
  readonly open: boolean
  /** Application close command; the dialog only ever requests `false`. */
  readonly onOpenChange: (open: boolean) => void
  /** Dialog heading. */
  readonly title: string
  /** Form area rendered under the option row. */
  readonly children?: React.ReactNode
  /** Optional single-choice chips shown above the form area. */
  readonly options?: readonly FormDialogOption[] | undefined
  /** Selected option id, or null while none is picked. */
  readonly optionValue?: string | null | undefined
  /** Receives the requested option; null clears the selection. */
  readonly onOptionChange?: ((value: string | null) => void) | undefined
  /** Accessible label of the option group; defaults to the title. */
  readonly optionsLabel?: string | undefined
  /** Submit action label. */
  readonly submitLabel: string
  /** Optional cancel action label; also labels the dialog close control. */
  readonly cancelLabel?: string | undefined
  /** Whether a submission is in flight; disables the whole footer. */
  readonly submitting?: boolean | undefined
  /** Whether the submit action is unavailable for a reason the owner knows. */
  readonly submitDisabled?: boolean | undefined
  /** Submit the form. */
  readonly onSubmit: () => void
}

/**
 * Render a controlled form dialog over the shared modal shell: an optional chip
 * row, a caller-supplied form area and a cancel/submit footer. The owner keeps
 * the draft, the validation and the request.
 * @param props - open state, form content and submit handlers.
 * @returns the modal dialog.
 */
export function FormDialog(props: FormDialogProps): React.JSX.Element {
  const {
    open,
    onOpenChange,
    title,
    children,
    options,
    optionValue,
    onOptionChange,
    optionsLabel,
    submitLabel,
    cancelLabel,
    submitting = false,
    submitDisabled = false,
    onSubmit,
  } = props
  // Button.module.css and Modal.module.css precede FeedbackDialog.module.css:
  // the doubled `.dialog.dialog` selector and `.submit` sizing rely on that order.
  const s = useStyle('form-dialog', CSS)
  const close = (): void => {
    onOpenChange(false)
  }
  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      closeLabel={cancelLabel ?? '关闭'}
      className={s.dialog}
      footer={(
        <>
          {cancelLabel === undefined
            ? null
            : (
                <Button disabled={submitting} onClick={close}>
                  {cancelLabel}
                </Button>
              )}
          <Button
            variant="primary"
            className={s.submit}
            aria-busy={submitting}
            disabled={submitting || submitDisabled}
            onClick={onSubmit}
          >
            {submitLabel}
          </Button>
        </>
      )}
    >
      {options === undefined || options.length === 0
        ? null
        : (
            <div className={s.categories} role="group" aria-label={optionsLabel ?? title}>
              {options.map((option) => {
                const active = option.id === optionValue
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={cx(s.chip, active && s.chipActive)}
                    aria-pressed={active}
                    disabled={submitting}
                    onClick={() => {
                      onOptionChange?.(active
                        ? null
                        : option.id)
                    }}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          )}
      {children}
    </Modal>
  )
}
