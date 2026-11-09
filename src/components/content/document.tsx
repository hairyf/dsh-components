import type * as React from 'react'
import type { MarkdownLabels, MarkdownPathImages } from './markdown-text'
import { Button, StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import { useMemo } from 'react'
import { useStyle } from '../../lib/style'
import { MarkdownText } from './markdown-text'

/* The embedded sheet below is the official stylesheet, copied verbatim. */
const CSS = `.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.document {
  min-width: 0;
  /* A long README scrolls inside the section instead of pushing the page's later sections out of reach. */
  max-height: min(560px, 60vh);
  overflow-y: auto;
  /* Horizontal rules separate the document from its neighbors; a full frame would clash with the images' own corners. */
  border-block: 0.5px solid var(--dsw-alias-border-l1);
  /* Keep the scrollbar off the text and the text width independent of overflow. */
  scrollbar-gutter: stable;
  padding: 12px 0;
  overflow-wrap: anywhere;
}

.document:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 3px;
}

.failure {
  display: flex;
  align-items: center;
  gap: 10px;
}

.error {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-state-error-primary);
}

.skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bar {
  display: block;
  height: 12px;
  border-radius: var(--dsw-radius-xs);
  background: var(--dsw-alias-bg-skeleton);
  animation: dsh-plugin-detail-skeleton 2s cubic-bezier(0.36, 0, 0.64, 1) infinite;
}

.long { width: min(480px, 90%); }
.short { width: min(240px, 50%); }

@keyframes dsh-plugin-detail-skeleton {
  0% { opacity: 1; }
  40% { opacity: 0.6; }
  80%, 100% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .bar { animation: none; }
}
`

/** The state {@link Document} shows for a caller's read. */
export type DocumentState
  = | { readonly status: 'loading' }
    | { readonly status: 'found', readonly markdown: string }
    | { readonly status: 'none' }
    | { readonly status: 'error', readonly message: string }

/** A read as a caller tracks it: in flight, settled with a document or none, or failed. */
export type DocumentRead
  = | undefined
    | { readonly status: 'loading' }
    | { readonly status: 'ready', readonly markdown: string | undefined }
    | { readonly status: 'error', readonly message: string }

/**
 * The state {@link Document} shows for a caller's read.
 * @param read - the caller's read; undefined before it starts.
 * @returns the state to show.
 */
export function documentState(read: DocumentRead): DocumentState {
  if (read?.status === 'ready') {
    return read.markdown === undefined
      ? { status: 'none' }
      : { status: 'found', markdown: read.markdown }
  }
  return read?.status === 'error'
    ? read
    : { status: 'loading' }
}

/** Translated strings of a document's chrome, as a dictionary supplies them. */
export interface DocumentCopy {
  readonly title: string
  readonly loading: string
  readonly retry: string
  readonly copy: string
  readonly copied: string
  readonly codeBlock: string
  readonly wrap: string
  readonly unwrap: string
  readonly footnotes: string
}

/** Localized chrome of a document. */
export interface DocumentLabels {
  /** Accessible name of the scrollable document region. */
  readonly title: string
  /** Accessible name of the loading placeholder. */
  readonly loading: string
  /** Retry button text. */
  readonly retry: string
  /** Markdown chrome for the document body. */
  readonly markdown: MarkdownLabels
}

/**
 * Assemble reference-stable labels for {@link Document} from translated strings.
 * @param copy - the translated strings.
 * @returns labels that keep their identity while the strings stay equal.
 */
export function useDocumentLabels(copy: DocumentCopy): DocumentLabels {
  const { title, loading, retry, footnotes, copy: copyLabel, copied: copiedLabel, codeBlock: codeLabel, wrap: wrapLabel, unwrap: unwrapLabel } = copy
  const markdown = useMemo<MarkdownLabels>(() => ({
    code: {
      copyLabel,
      copiedLabel,
      toolbarLabels: {
        codeLabel,
        wrapLabel,
        unwrapLabel,
      },
    },
    footnotes,
  }), [
    copyLabel,
    copiedLabel,
    codeLabel,
    wrapLabel,
    unwrapLabel,
    footnotes,
  ])
  return useMemo<DocumentLabels>(() => ({
    title,
    loading,
    retry,
    markdown,
  }), [title, loading, retry, markdown])
}

/** Props for {@link Document}. */
export interface DocumentProps {
  /** The read to show. */
  readonly state: DocumentState
  /** Localized region name, placeholder name, retry text, and Markdown chrome. */
  readonly labels: DocumentLabels
  /** Resolves the document's relative image destinations to displayable URLs. */
  readonly images?: MarkdownPathImages | undefined
  /** Called to read the document again after a failure. */
  readonly onRetry: () => void
}

/**
 * A section showing a long Markdown description: skeleton lines while it
 * loads, the document once found, or the caller's failure message with a retry.
 * Nothing renders for none.
 * @returns the section, or null.
 */
export function Document({ state, labels, images, onRetry }: DocumentProps): React.JSX.Element | null {
  const s = useStyle('document', CSS)
  if (state.status === 'none')
    return null
  let body: React.ReactNode
  switch (state.status) {
    case 'found':
      body = (
        <div className={s.document} role="region" aria-label={labels.title} tabIndex={0}>
          <MarkdownText text={state.markdown} labels={labels.markdown} pathImages={images} omitHtml />
        </div>
      )
      break
    case 'error':
      body = (
        <div className={s.failure}>
          <p className={s.error} role="alert">
            <StateDot state="error" />
            {state.message}
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>{labels.retry}</Button>
        </div>
      )
      break
    case 'loading':
      body = (
        <div className={s.skeleton} role="status" aria-label={labels.loading} aria-busy="true">
          <span className={`${s.bar} ${s.long}`} />
          <span className={`${s.bar} ${s.long}`} />
          <span className={`${s.bar} ${s.short}`} />
        </div>
      )
      break
  }
  return (
    <section className={s.section} data-document="">
      {body}
    </section>
  )
}
