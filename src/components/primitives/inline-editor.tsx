import type * as React from 'react'
import { useLayoutEffect, useRef, useState } from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/InlineEditor.module.css */
.editor {
  box-sizing: border-box;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 28px;
  /* Six 20px text lines plus padding and border, then the editor scrolls. */
  max-height: 127px;
  margin: 0;
  padding: 3px 8px;
  border: 0.5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-sm);
  outline: none;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: var(--dsw-font-xs-13);
  font-family: Inter, var(--dsw-font-family);
  overflow-y: auto;
  resize: none;
}

.editor:focus {
  border-color: var(--dsw-alias-state-business-primary);
}
`

/**
 * Props for {@link InlineEditor}. Passing `value` makes the draft fully
 * controlled; otherwise the editor keeps its own copy starting at `defaultValue`.
 */
export interface InlineEditorProps {
  /** Current draft text of a controlled editor. */
  value?: string
  /** Initial draft text of an uncontrolled editor. */
  defaultValue?: string
  /** Localized accessible name. */
  label: string
  /** Receives the edited text. */
  onChange?: (value: string) => void
  /** Called for a plain Enter. */
  onSave: () => void
  /** Called for Escape. */
  onCancel: () => void
  /** Extra class for the editor's placement. */
  className?: string
}

/**
 * Render an autofocused textarea that grows with its text up to six lines, then scrolls.
 * A textarea rather than an input: HTML strips newlines from single-line input values.
 * Enter saves, Shift+Enter breaks the line, Enter during IME composition does nothing,
 * and Escape cancels.
 */
export function InlineEditor({
  value,
  defaultValue = '',
  label,
  onChange,
  onSave,
  onCancel,
  className,
}: InlineEditorProps): React.JSX.Element {
  const s = useStyle('inline-editor', CSS)
  const ref = useRef<HTMLTextAreaElement>(null)
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const current = value ?? uncontrolled
  useLayoutEffect(() => {
    const node = ref.current
    if (node === null)
      return
    const fit = (): void => {
      node.style.height = 'auto'
      node.style.height = `${String(node.scrollHeight + node.offsetHeight - node.clientHeight)}px`
    }
    fit()
    if (typeof ResizeObserver === 'undefined')
      return
    const observer = new ResizeObserver(fit)
    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [current])
  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Escape') {
      onCancel()
      return
    }
    const legacy = event.nativeEvent as KeyboardEvent & { keyCode?: number }
    const composing = event.nativeEvent.isComposing || legacy.keyCode === 229
    if (event.key !== 'Enter' || event.shiftKey || composing)
      return
    event.preventDefault()
    onSave()
  }
  return (
    <textarea
      ref={ref}
      autoFocus
      rows={1}
      className={cx(s.editor, className)}
      aria-label={label}
      value={current}
      onChange={(event) => {
        const next = event.currentTarget.value
        if (value === undefined)
          setUncontrolled(next)
        onChange?.(next)
      }}
      onKeyDown={onKeyDown}
    />
  )
}
