import type * as React from 'react'
import { useMemo, useState } from 'react'
import { useStyle } from '../../lib/style'

/* The embedded sheet below is the official stylesheet, copied verbatim. */
const CSS = `.root {
  margin: 4px 0;
}

.toggle {
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-secondary);
  padding: 2px 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--dsw-radius-sm);
}

@media (hover: hover) {
  .toggle:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.body {
  margin: 4px 0 0;
  padding: 8px;
  max-height: 200px;
  overflow: auto;
  background: var(--dsw-alias-markdown-code-block);
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-lg);
  font-family: var(--ds-font-family-code);
  font-size: 11px;
  line-height: 16px;
  color: var(--dsw-alias-label-primary);
}
`

/** Characters a JSON payload renders before the body is truncated. */
export const JSON_BLOCK_MAX_CHARS = 20000

/** Props for the collapsible JSON payload block. */
export interface JsonBlockProps {
  /** Toggle text, supplied by the owning render site. */
  readonly label: string
  /** Any JSON-serializable payload. */
  readonly payload: unknown
  /** Whether the body starts open. */
  readonly defaultOpen?: boolean | undefined
  /** Footer appended when the body exceeds the character cap, given the full length. */
  readonly truncatedLabel: (total: number) => string
}

/**
 * Render a JSON payload behind a disclosure toggle.
 *
 * The body is stringified only while open and capped at
 * {@link JSON_BLOCK_MAX_CHARS} characters, so a huge payload cannot stall the
 * containing message.
 * @returns The JSON block element.
 */
export function JsonBlock({ label, payload, defaultOpen = false, truncatedLabel }: JsonBlockProps): React.JSX.Element {
  const s = useStyle('json-block', CSS)
  const [open, setOpen] = useState(defaultOpen)
  const body = useMemo(() => {
    if (!open)
      return ''
    let text: string
    try {
      text = JSON.stringify(payload, null, 2) ?? String(payload)
    }
    catch {
      text = String(payload)
    }
    return text.length > JSON_BLOCK_MAX_CHARS
      ? `${text.slice(0, JSON_BLOCK_MAX_CHARS)}\n${truncatedLabel(text.length)}`
      : text
  }, [open, payload, truncatedLabel])
  return (
    <div className={s.root}>
      <button
        type="button"
        className={s.toggle}
        onClick={() => {
          setOpen(value => !value)
        }}
      >
        {open ? '▾' : '▸'}
        {' '}
        {label}
      </button>
      {open && <pre className={s.body}>{body}</pre>}
    </div>
  )
}
