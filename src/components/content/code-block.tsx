import type { CodeToolbarLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CSSProperties, Ref } from 'react'
import type * as React from 'react'
import { IconCheckOutlineRegular, IconCopyOutlineRegular, IconNowrapFillRegular, IconWrapFillRegular, useClipboardCopy } from '@deepseek-ai/dsh-client-ui-primitives'
import { Fragment, useState } from 'react'
import { cx, useStyle } from '../../lib/style'

/* The embedded sheets are the official stylesheets, copied verbatim:
   - lib/markdown/CodeBlock.module.css: the fenced block and its banner
   - lib/CodeCard.module.css: the toolbar surface the diff block shares */

const CSS = `/* Visual baseline: deepsuite \`@deepseek/md\` code-block.css. Highlight colors
   stay on the existing shiki \`--shiki-*\` sheet (not Prism highlight.css). */

.block {
  --dsl-code-block-banner-background-color: var(--dsw-alias-markdown-code-block-banner);
  --dsl-code-block-border-radius: var(--dsw-radius-lg);
  /* Local 11/18 instead of the shared --dsw-font-xs-13: the banner scales
     with the markdown 0.875 ladder without shrinking every other xs-13 use. */
  --dsl-code-block-banner-font: 11px/18px var(--dsw-font-family);
  --dsl-code-block-content-font: var(--dsw-font-markdown-code-block);
  --dsl-code-block-background: var(--dsw-alias-markdown-code-block);

  position: relative;
  margin: 16px 0;
  color: var(--dsw-alias-label-primary);
  background: var(--dsl-code-block-background);
  border-radius: var(--dsl-code-block-border-radius);
}

.block:not(:last-child) {
  margin-bottom: 11px;
}

.bannerWrap {
  position: sticky;
  top: 0;
  z-index: 6;
  background-color: var(--dsw-alias-bg-base);
  border-top-left-radius: var(--dsl-code-block-border-radius);
  border-top-right-radius: var(--dsl-code-block-border-radius);
}

.banner {
  background: var(--dsl-code-block-banner-background-color);
  padding: 9px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font: var(--dsl-code-block-banner-font);
  border-top-left-radius: var(--dsl-code-block-border-radius);
  border-top-right-radius: var(--dsl-code-block-border-radius);
}

.infostring {
  color: var(--dsw-alias-label-primary);
  font-family: var(--ds-font-family-code);
  font-size: 11px;
  line-height: 18px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.copyButton {
  background-color: rgb(255 255 255 / 0);
  border: none;
  padding: 0;
  margin: 0;
  color: inherit;
  cursor: pointer;
  font: inherit;
}

/* Consumers may turn the stable content node into a viewport without changing
   the default CodeBlock layout. */
.content {
  display: contents;
}

.block :where(pre) {
  font: var(--dsl-code-block-content-font);
  padding: 16px;
  margin: 0 !important;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  background: var(--dsl-code-block-background);
  /* Bottom radii live on <pre>: overflow:hidden on .block would kill the
     sticky banner, and this opaque fill otherwise squares off the wrapper. */
  border-bottom-left-radius: var(--dsl-code-block-border-radius);
  border-bottom-right-radius: var(--dsl-code-block-border-radius);
}

/* Shiki inlines its theme background var; route it to the repo token. */
.block :where(pre.shiki) {
  background: var(--dsl-code-block-background) !important;
}

.block :where(pre) code {
  font: inherit;
  background: none;
  padding: 0;
}

.plain {
  color: var(--dsw-alias-label-primary);
}

.card :where(pre) {
  padding: 6px 22px 20px;
  word-break: normal;
  overflow-wrap: anywhere;
}

.card[data-code-wrap='false'] {
  --dsl-code-block-line-white-space: pre;
}

.card[data-code-wrap='false'] :where(pre) {
  white-space: pre;
  overflow-wrap: normal;
}

.numbered :where(pre) code {
  display: block;
  counter-reset: source-line;
  white-space: normal;
}

.numbered :where(pre) code > :global(.line) {
  position: relative;
  display: block;
  min-height: 1lh;
  padding-inline-start: calc(var(--dsl-code-block-line-number-width) + 12px);
  counter-increment: source-line;
  white-space: var(--dsl-code-block-line-white-space, pre-wrap);
}

.numbered :where(pre) code > :global(.line)::before {
  position: absolute;
  inset-inline-start: 0;
  width: var(--dsl-code-block-line-number-width);
  color: var(--dsw-alias-label-tertiary);
  text-align: end;
  content: counter(source-line);
  user-select: none;
}
`

/*
 * The code-card sheet the toolbar is built from. It is a second official sheet
 * in the same module because a block that owns a header (the diff block) draws
 * the same toolbar without owning a second copy of it.
 */
const CARD_CSS = `.card {
  position: relative;
  margin: 16px 0;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-markdown-code-block);
  border-radius: var(--dsw-radius-lg);
  font: var(--dsw-font-markdown-code-block);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 18px 8px 22px;
  background: var(--dsl-code-block-background, var(--dsw-alias-markdown-code-block));
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  color: var(--dsw-alias-label-secondary);
  font: 11px/18px var(--dsw-font-family);
}

.heading {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}

.language {
  color: var(--dsw-alias-label-tertiary);
  flex: none;
  font-family: var(--ds-font-family-code);
}

.title {
  color: var(--dsw-alias-label-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
}

.status {
  margin-right: 8px;
  color: var(--dsw-alias-label-tertiary);
  white-space: nowrap;
}

.action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: var(--dsw-radius-sm);
  color: var(--dsw-alias-label-secondary);
  background: transparent;
  cursor: pointer;
}

@media (hover: hover) {
  .action:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.action:focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 2px;
}

.body {
  padding: 6px 22px 20px;
  font: var(--dsw-font-markdown-code-block);
  overflow-x: auto;
}
`

/**
 * Return the code-card class map, mounting its sheet on first use.
 *
 * Exposed so a block that composes the shared toolbar draws the official card
 * surface from one sheet, exactly as the official blocks share it.
 * @returns the card class map.
 */
export function useCodeCardStyle(): Record<string, string> {
  return useStyle('code-card', CARD_CSS)
}

/** Display state and callbacks for a code card's toolbar. */
export interface CodeToolbarProps {
  /** Language hint; drawn verbatim when present, with the caller label as the fallback. */
  readonly lang?: string | undefined
  /** Caller title, e.g. a path. */
  readonly title?: string | undefined
  /** Caller status note, e.g. a line-window summary. */
  readonly status?: string | undefined
  /** Localized fallback and wrapping labels. */
  readonly labels: CodeToolbarLabels
  /** Copy-button idle label. */
  readonly copyLabel: string
  /** Copy-button label during the post-copy confirmation window. */
  readonly copiedLabel: string
  /** Whether the copy confirmation window is active. */
  readonly copied: boolean
  /** Whether source columns are wrapped. */
  readonly wrapped: boolean
  /** Copy action; omit to draw no copy control. */
  readonly onCopy?: (() => void) | undefined
  /** Wrap toggle; omit to draw no wrap control. */
  readonly onWrap?: (() => void) | undefined
}

/**
 * Render a language label with the shared wrapping and copy actions.
 *
 * The official component wraps each action in a tooltip; this refork keeps the
 * same buttons with native titles so the toolbar draws without a portal.
 * @param props - localized labels, current state, and card-owned actions.
 * @returns The shared card header.
 */
export function CodeToolbar(props: CodeToolbarProps): React.JSX.Element {
  const { lang, title, status, labels, copyLabel, copiedLabel, copied, wrapped, onCopy, onWrap } = props
  const c = useCodeCardStyle()
  const wrapLabel = wrapped
    ? labels.unwrapLabel
    : labels.wrapLabel
  const clipboardLabel = copied
    ? copiedLabel
    : copyLabel
  return (
    <div className={c.header} data-code-block-banner="">
      <div className={c.heading}>
        <span className={c.language}>{lang ?? labels.codeLabel}</span>
        {title !== undefined && <span className={c.title} title={title}>{title}</span>}
      </div>
      <div className={c.actions}>
        {status !== undefined && <span className={c.status}>{status}</span>}
        {onWrap !== undefined && (
          <button
            type="button"
            className={c.action}
            aria-label={labels.wrapLabel}
            aria-pressed={wrapped}
            title={wrapLabel}
            onClick={onWrap}
          >
            {wrapped
              ? <IconNowrapFillRegular size={14} />
              : <IconWrapFillRegular size={14} />}
          </button>
        )}
        {onCopy !== undefined && (
          <button
            type="button"
            className={c.action}
            aria-label={clipboardLabel}
            title={clipboardLabel}
            onClick={onCopy}
          >
            {copied
              ? <IconCheckOutlineRegular size={14} />
              : <IconCopyOutlineRegular size={14} />}
          </button>
        )}
      </div>
    </div>
  )
}

/** Props for a fenced or plain code block. */
export interface CodeBlockProps {
  /** The source text, rendered verbatim (trailing newline trimmed for display). */
  readonly code: string
  /** Grammar hint (markdown fence info string or a fixed caller id); unknown renders plain. */
  readonly lang?: string | undefined
  /**
   * The code is still growing. Accepted for official prop compatibility; this
   * dependency-free refork has no syntax highlighter, so the same plain body
   * renders in both modes.
   */
  readonly streaming?: boolean | undefined
  /** Extra class merged onto the wrapper. */
  readonly className?: string | undefined
  /** Ref for the stable source-content wrapper, for owners that use it as a scrollport. */
  readonly contentRef?: Ref<HTMLDivElement> | undefined
  /** Show a numbered gutter without adding numbers to copied source. Defaults to false. */
  readonly lineNumbers?: boolean | undefined
  /** Show the language and copy header; false when the caller supplies a toolbar. Defaults to true. */
  readonly showHeader?: boolean | undefined
  /** Copy-button idle label. */
  readonly copyLabel: string
  /** Copy-button label during the post-copy confirmation window. */
  readonly copiedLabel: string
  /** Enable the shared card toolbar and spacing; omit for custom toolbar layouts. */
  readonly toolbarLabels?: CodeToolbarLabels | undefined
  /** With toolbarLabels, use the owner's wrapping preference and omit the toolbar's local wrap action. */
  readonly wrap?: boolean | undefined
}

/**
 * Render a code fence on the official card surface.
 *
 * The official component paints shiki tokens and streams them incrementally;
 * this refork intentionally keeps a plain monospace body (one dependency-free
 * arm of the official fallback) and preserves every other structural detail:
 * banner, numbered gutter, wrap toggle, copy, and trailing-newline trimming.
 * @returns The code block element.
 */
export function CodeBlock(props: CodeBlockProps): React.JSX.Element {
  const { code, lang, className, contentRef, lineNumbers = false, showHeader = true, copyLabel, copiedLabel, toolbarLabels, wrap } = props
  const s = useStyle('code-block', CSS)
  const trimmed = code.endsWith('\n')
    ? code.slice(0, -1)
    : code
  const sourceLines = lineNumbers
    ? trimmed.split('\n')
    : undefined
  const [localWrapped, setWrapped] = useState(true)
  const wrapped = wrap ?? localWrapped
  const { copied, onCopy } = useClipboardCopy(trimmed)
  const body = (
    <pre className={s.plain}>
      <code>
        {sourceLines === undefined
          ? trimmed
          : sourceLines.map((line, index) => (
              <Fragment key={index}>
                {index > 0 && '\n'}
                <span className="line">{line}</span>
              </Fragment>
            ))}
      </code>
    </pre>
  )
  return (
    <div
      className={cx(s.block, 'md-code-block', lineNumbers ? s.numbered : undefined, toolbarLabels !== undefined
        ? s.card
        : undefined, className)}
      data-line-numbers={lineNumbers || undefined}
      data-code-wrap={toolbarLabels === undefined
        ? undefined
        : wrapped}
      style={sourceLines === undefined
        ? undefined
        : { '--dsl-code-block-line-number-width': `${String(Math.max(2, String(sourceLines.length).length))}ch` } as CSSProperties}
    >
      {showHeader && (
        <div className={s.bannerWrap}>
          {toolbarLabels !== undefined
            ? (
                <CodeToolbar
                  lang={lang}
                  labels={toolbarLabels}
                  copyLabel={copyLabel}
                  copiedLabel={copiedLabel}
                  copied={copied}
                  wrapped={wrapped}
                  onCopy={onCopy}
                  onWrap={wrap === undefined
                    ? () => setWrapped(value => !value)
                    : undefined}
                />
              )
            : (
                <div className={s.banner} data-code-block-banner="">
                  <div className={s.infostring} data-text-interaction-exclude="">{lang ?? ''}</div>
                  <div className={s.action}>
                    <button type="button" className={s.copyButton} onClick={onCopy}>
                      {copied ? copiedLabel : copyLabel}
                    </button>
                  </div>
                </div>
              )}
        </div>
      )}
      <div ref={contentRef} className={s.content} data-code-block-content="">
        {body}
      </div>
    </div>
  )
}
