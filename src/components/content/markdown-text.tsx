import type { CodeToolbarLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import type * as React from 'react'
import { classifyLinkPath, LinkIconMedium } from '@deepseek-ai/dsh-client-ui-primitives'
import { createElement, Fragment, isValidElement, useMemo } from 'react'
import { cx, useStyle } from '../../lib/style'
import { Image } from '../media/image'
import { CodeBlock } from './code-block'

/* The embedded sheet is the official stylesheet, copied verbatim; its prose is not ours to edit. */
/* eslint-disable slop/no-em-dash -- verbatim official CSS. */
const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives lib/markdown/MarkdownText.module.css; official CSS, verbatim. */
/* Visual baseline: deepsuite \`@deepseek/md\` markdown.css, adapted to CSS
   Modules. Cite pills and header anchors are absent (no matching DOM).
   Token names match that sheet. */

.markdown {
  min-width: 0;
  overflow-wrap: anywhere;
  font: var(--dsw-font-markdown-base);
  color: var(--dsw-alias-label-primary);
}

.markdown strong {
  font-weight: 600;
}

.markdown h1 {
  font: var(--dsw-font-markdown-h1);
  margin: 32px 0 16px;
}

.markdown h2 {
  font: var(--dsw-font-markdown-h2);
  margin: 32px 0 16px;
}

.markdown h3 {
  font: var(--dsw-font-markdown-h3);
  margin: 32px 0 16px;
}

.markdown h4 {
  font: var(--dsw-font-markdown-h4);
  margin: 16px 0;
}

.markdown :where(h5, h6) {
  font: var(--dsw-font-markdown-base-strong);
  margin: 16px 0;
}

.markdown :where(h1, h2, h3, h4, h5, h6) strong {
  font-weight: inherit;
}

.markdown p {
  margin: 16px 0;
}

/* Tighten h4–h6 against a following list (design: 8px gap). */
.markdown :where(h4, h5, h6) + :where(ul, ol) {
  margin-top: 8px;
}

.markdown :where(h4, h5, h6):has(+ :where(ul, ol)) {
  margin-bottom: 8px;
}

.markdown a,
.markdown .fileLink {
  /* deepsuite markdown.css uses brand-text (blue in newDesign); this sheet
     keeps design-platform brand-text as near-black, so links use the
     dedicated link alias instead. */
  color: var(--dsw-alias-link);
  font-weight: 500;
  transition: box-shadow var(--ds-transition-duration) var(--ds-ease-in-out);
  position: relative;
  text-decoration: none;
  /* Transparent hit-area padding; literal zero-alpha only (no painted color). */
  border-left: 3px solid rgb(255 255 255 / 0);
  border-right: 3px solid rgb(255 255 255 / 0);
  border-top: 2px solid rgb(255 255 255 / 0);
  border-bottom: 2px solid rgb(255 255 255 / 0);
  margin-left: -3px;
  margin-right: -3px;
}

.markdown a:focus {
  outline: none;
  text-decoration: underline dotted var(--dsw-alias-link);
  text-underline-offset: 3px;
}

@media (hover: hover) {
  .markdown a:hover {
    outline: none;
    text-decoration: underline dotted var(--dsw-alias-link);
    text-underline-offset: 3px;
  }
}

.markdown a:focus-visible,
.fileMention:focus-visible {
  box-shadow: 0 0 0 2px var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
}

/* Leading link-category glyph inside anchors, file mentions, and
   URL-promoted inline code: outline glyphs ride the link's currentColor.
   1.1em keeps the glyph proportional to the surrounding text's size (it
   shrinks with the code chip's 0.875em); the small negative offset seats
   its optical center on the cap height. */
.linkIcon {
  flex: none;
  width: 1.1em;
  height: 1.1em;
  vertical-align: -0.25em;
  margin-right: 5px;
}

.markdown :where(ul, ol) {
  margin: 16px 0;
  padding-left: 18px;
}

.markdown li:not(:first-child) {
  margin-top: 6px;
}

.markdown li > :where(ul, ol) {
  margin-top: 4px;
}

.markdown li::marker {
  line-height: 24px;
  color: var(--dsw-alias-label-secondary);
}

/* Nested ol under ul/ol: markers inside (models sometimes emit this shape). */
.markdown :where(ul, ol) ol {
  list-style-position: inside;
  padding-left: 0;
}

.markdown :where(ul, ol) ol li p {
  display: inline;
}

.markdown li > p {
  margin: 8px 0;
}

.markdown li > *:first-child {
  margin-top: 0;
}

/* Keep list-nested code-block vertical margins (design: +4px vs other last children). */
.markdown li > *:last-child:not(:global(.md-code-block)) {
  margin-bottom: 0;
}

.markdown hr {
  display: block;
  border: none;
  height: 0.5px;
  margin: 32px 0;
  background: var(--dsw-alias-border-l2);
}

.markdown blockquote {
  border-left: 2px solid var(--dsw-alias-label-caption);
  margin: 16px 0 0;
  padding-left: 14px;
}

.markdown pre {
  margin: 16px 0;
  font-family: var(--ds-font-family-code);
  overflow: auto;
}

.markdown :not(pre) > code {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  font: var(--dsw-font-markdown-code);
  font-family: var(--ds-font-family-code);
  font-size: 0.875em !important;
  background-color: var(--dsw-alias-markdown-inline-code);
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-sm);
  padding: 0 5px;
}

.markdown :where(h1, h2, h3, h4, h5, h6) code {
  font: inherit;
  font-family: var(--ds-font-family-code);
}

.markdown :global(.katex-display) {
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.markdown input[type='checkbox'] {
  margin: 0 8px 0 0;
  accent-color: var(--dsw-alias-label-secondary);
}

.tableScroll {
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-x: contain;
}

/* Hover-capable inputs reveal a wide table's bar on hover or keyboard focus.
   Other inputs keep native horizontal scrolling. Chromium never repaints state-conditioned
   scrollbar STYLES (neither hover-conditioned \`::-webkit-scrollbar*\` rules
   nor a :hover \`scrollbar-color\` change reaches the painted bar), so the
   toggle is \`overflow-x\` itself — a layout change repaints reliably. The
   resting padding matches the themed bar's height on the WebKit scrollbar
   path. There, \`scroll\` reserves that height even when the table fits.
   Other engines and overlay scrollbars may reserve a different height.
   Wheel and trackpad scrolling need the pointer over the table, which is
   already the hover that re-enables scrolling. */
.tableScroll:global(.md-table-wide):focus-visible {
  overflow-x: scroll;
  padding-bottom: 0;
}

@media (hover: hover) {
  .tableScroll:global(.md-table-wide) {
    overflow-x: hidden;
    padding-bottom: var(--dsh-scrollbar-width, 5px);
  }

  .tableScroll:global(.md-table-wide):hover {
    overflow-x: scroll;
    padding-bottom: 0;
  }
}

/* Chromium keyboard-focuses scrollable containers by default; the ring uses
   the sheet's link focus color. */
.tableScroll:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
}

/* Many-column tables (the renderer's \`md-table-wide\` hook) keep their
   natural width and scroll inside the wrapper; a hosting layout may widen
   the wrapper through the hook (deepsuite chat TableWrapper parity). */
.tableScroll table {
  border-collapse: collapse;
  width: max-content;
  max-width: max-content;
}

/* Tables under four columns, and any table inside a blockquote, fill the
   column instead: cells wrap down to their minimum readable width, and the
   wrapper's scroll only remains for the below-floor case (deepsuite chat
   parity: \`.wrapper:not(:has(th:nth-child(4), td:nth-child(4)))\`). */
.tableFill table {
  width: 100%;
  max-width: none;
}

.tableScroll th {
  text-align: start;
  padding: 10px 16px;
  border-bottom: 0.5px solid var(--dsw-alias-border-l3);
  border-top: none;
  font: var(--dsw-font-markdown-table-head);
  max-width: 320px;
  max-width: min(30vw, 320px);
  min-width: 100px;
}

.tableScroll td {
  padding: 10px 16px;
  border-bottom: 0.5px solid var(--dsw-alias-border-l2);
  font: var(--dsw-font-markdown-table);
  max-width: 320px;
  max-width: min(30vw, 320px);
  min-width: 100px;
}

.tableScroll th:first-child,
.tableScroll td:first-child {
  padding-left: 0;
}

.tableScroll td:last-child {
  padding-right: 0;
}

.tableScroll table code {
  font-size: 11px;
}

.markdown > *:first-child,
.markdown p:first-child {
  margin-top: 0 !important;
}

.markdown > *:last-child,
.markdown p:last-child {
  margin-bottom: 0 !important;
}

.imageAlt {
  color: var(--dsw-alias-label-tertiary);
  font-style: italic;
}

.image {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  margin: 0;
  border-radius: var(--dsw-radius-md);
  background: var(--dsw-alias-bg-base);
  object-fit: contain;
}

/* Inline file mention: the same link language this sheet gives anchors (and
   thereby URL-promoted inline code) — link-blue at rest, dotted underline only
   on hover/focus. An underline at rest reads badly inside the code chip, where
   it collides with monospace descenders and the pill background. */
.fileMention {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: 500;
  color: var(--dsw-alias-link);
  text-decoration: none;
  cursor: pointer;
}

.fileLink {
  max-width: 100%;
  text-align: inherit;
}

.fileMention:focus {
  outline: none;
  text-decoration: underline dotted var(--dsw-alias-link);
  text-underline-offset: 3px;
}

@media (hover: hover) {
  .fileMention:hover {
    outline: none;
    text-decoration: underline dotted var(--dsw-alias-link);
    text-underline-offset: 3px;
  }
}

.compact {
  max-width: 100%;
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
  color: var(--dsw-alias-label-tertiary);
}

.compact :is(h1, h2, h3, h4, h5, h6) {
  margin: 8px 0 4px;
  font: inherit;
  font-weight: 600;
  color: inherit;
}

.compact :is(p, ul, ol, blockquote) {
  margin: 4px 0;
}

.compact li:not(:first-child) {
  margin-top: 2px;
}

.compact li > p {
  margin: 4px 0;
}

.compact li::marker {
  line-height: inherit;
  color: inherit;
}

.compact blockquote {
  padding-left: 8px;
}

.compact hr {
  margin: 8px 0;
}

.compact a,
.compact .fileMention {
  font-weight: inherit;
  color: inherit;
  text-decoration: underline dotted;
}

.compact a:focus,
.compact .fileMention:focus {
  text-decoration-color: currentColor;
}

@media (hover: hover) {
  .compact a:hover,
  .compact .fileMention:hover {
    text-decoration-color: currentColor;
  }
}

.compact :not(pre) > code {
  display: inline;
  font: inherit;
  font-family: var(--ds-font-family-code);
  font-size: 1em !important;
  border-radius: var(--dsw-radius-xs);
  padding: 0 3px;
  box-decoration-break: clone;
}

.markdown.compact :global(.md-code-block) {
  margin: 4px 0;
  color: inherit;
}

.compact :global(.md-code-block) > :has(> [data-code-block-banner]) {
  position: static;
  z-index: auto;
}

/* Shiki writes token colors inline; compact code uses the surrounding text color. */
.compact pre,
.compact pre :is(code, span) {
  color: inherit !important;
}

.markdown.compact .tableScroll {
  width: 100%;
  max-width: 100%;
  margin: 4px 0;
  padding-left: 0;
}

.markdown.compact .tableScroll > table {
  z-index: auto;
}

.compact :is(th, td) {
  padding: 4px 8px;
  font: inherit;
}

.compact th {
  font-weight: 600;
}

.compact :global(.katex) {
  font-size: 1em;
}

/* Keep KaTeX's inline baseline and scroll the containing block only when needed. */
.compact :is(p, h1, h2, h3, h4, h5, h6, ul, ol):has(:global(.katex)) {
  overflow-x: auto;
  overflow-y: hidden;
  /* KaTeX descenders can paint one pixel below a fractional line-box edge. */
  padding-bottom: 1px;
}

.compact :global(.katex-display) {
  margin: 4px 0;
}

.imageButton {
  display: inline-block;
  max-width: 100%;
  padding: 0;
  border: 0;
  border-radius: var(--dsw-radius-sm);
  background: transparent;
  vertical-align: middle;
  cursor: zoom-in;
}
.imageButton .image { max-width: min(100%, 640px); max-height: 360px; }
.imageButton:focus-visible { outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: 3px; }
.previewName {
  display: block;
  margin-top: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}
`
/* eslint-enable slop/no-em-dash */

/**
 * Lightweight, dependency-free Markdown renderer for the shared content blocks.
 *
 * This is deliberately NOT the official micromark/mdast pipeline. It covers the
 * common GFM subset callers actually draw: paragraphs, h1-h6,
 * bold/italic/strikethrough, inline code, links, ordered and unordered lists
 * (nested), blockquotes, thematic breaks, tables, fenced code blocks (rendered
 * by ./code-block) and images (rendered by ../media/image).
 *
 * Known omissions versus the official renderer: reference-style links and
 * definitions, footnotes, inline and fenced math (KaTeX), task-list checkboxes,
 * autolinks, setext headings and raw HTML blocks. Raw inline HTML renders as
 * text unless omitHtml is set, in which case simple tags are dropped.
 *
 * Pass incremental (or the official streaming alias) while text is still
 * arriving: an unclosed fence keeps rendering as a code block and forwards the
 * streaming flag to CodeBlock.
 */

/** Copy-button labels forwarded to fence CodeBlocks. */
export interface MarkdownCodeLabels {
  /** Copy-button idle label. */
  readonly copyLabel: string
  /** Copy-button label during the post-copy confirmation window. */
  readonly copiedLabel: string
  /** Shared card controls; omitted for custom toolbar layouts. */
  readonly toolbarLabels?: CodeToolbarLabels | undefined
}

/** Localized chrome for a Markdown document. */
export interface MarkdownLabels {
  /** Fence chrome. */
  readonly code: MarkdownCodeLabels
  /** Footnote section heading (kept for official prop compatibility). */
  readonly footnotes: string
}

/** File-mention affordance for inline code. */
export interface MarkdownFileMentions {
  /**
   * Resolve one inline-code token.
   * @param value - The authored token, exactly as written.
   * @returns The opener with its accessible label and title, or undefined to leave inert code.
   */
  readonly resolve: (value: string) => {
    readonly open: () => void
    readonly contextMenuProps?: Pick<HTMLAttributes<HTMLElement>, 'onContextMenu' | 'onKeyDown' | 'tabIndex'>
    readonly label: string
    readonly title: string
  } | undefined
}

/** Local-path image vocabulary for image destinations. */
export interface MarkdownPathImages {
  /**
   * Resolve one authored image destination.
   * @param value - The destination exactly as the markdown author wrote it.
   * @returns A displayable absolute URL, or undefined when the destination names no displayable image.
   */
  readonly resolve: (value: string) => string | undefined
}

/** Localized status copy for an image the lightweight renderer draws. */
export interface MarkdownImageStatusLabels {
  /** Status text while the image loads. */
  readonly loading: string
  /** Status text after the image fails. */
  readonly failed: string
}

/** Props for the dependency-free Markdown renderer. */
export interface MarkdownTextProps {
  /** Markdown source text. */
  readonly text: string
  /** Official streaming alias: parse incrementally while text arrives. */
  readonly streaming?: boolean | undefined
  /** Incremental rendering flag (equivalent to streaming). */
  readonly incremental?: boolean | undefined
  /** Localized fence chrome. */
  readonly labels: MarkdownLabels
  /** Optional inline-code file opener. */
  readonly fileMentions?: MarkdownFileMentions | undefined
  /** Optional local-path image vocabulary. */
  readonly pathImages?: MarkdownPathImages | undefined
  /** Document typography variant. */
  readonly variant?: 'body' | 'compact' | undefined
  /** Drop simple raw HTML tags instead of rendering them literally. */
  readonly omitHtml?: boolean | undefined
  /** Mark the root as a source for text-selection interactions. */
  readonly textInteractionSource?: boolean | undefined
  /** Localized loading/failure status for images; defaults to the zh strings. */
  readonly imageLabels?: MarkdownImageStatusLabels | undefined
}

/** Default image status copy, matching the library's zh default locale. */
export const DEFAULT_MARKDOWN_IMAGE_LABELS: MarkdownImageStatusLabels = {
  loading: '图片加载中',
  failed: '图片加载失败',
}

/** Fence markers this renderer accepts. */
const FENCE_CHARS = ['`', '~']
/** Characters an inline escape can quote. */
const ESCAPABLE = /[\\`*_{}[\]#+\-.!~|>]/
/** Leading tags dropped by omitHtml. */
const SIMPLE_HTML_TAG = /^<\/?[a-z][^>]*>/i
/** Horizontal-rule line: three or more of the same marker, spaces allowed between. */
const THEMATIC_BREAK = /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})$/

interface BlockContext {
  readonly styles: Record<string, string>
  readonly labels: MarkdownLabels
  readonly fileMentions: MarkdownFileMentions | undefined
  readonly pathImages: MarkdownPathImages | undefined
  readonly imageLabels: MarkdownImageStatusLabels
  readonly omitHtml: boolean
  readonly streaming: boolean
  readonly inLink: boolean
  readonly inBlockquote: boolean
}

/** A block handler's result: one rendered node and the next source line. */
interface BlockHit {
  readonly node: ReactNode
  readonly next: number
}

/** One recognized construct at an offset, with the offset just past it. */
interface InlineHit {
  readonly node: ReactNode
  readonly next: number
}

/**
 * Whether a line holds nothing but spaces or tabs.
 * @param line - one source line.
 * @returns whether the line is blank.
 */
function isBlank(line: string): boolean {
  return line.trim() === ''
}

/**
 * Count a line's leading spaces, stopping at the first non-space.
 * @param line - one source line.
 * @returns the leading space count.
 */
function indentOf(line: string): number {
  let count = 0
  while (line[count] === ' ')
    count += 1
  return count
}

/**
 * Read a fence opener from a line.
 * @param line - one source line.
 * @returns the fence marker and info string, or undefined when the line opens no fence.
 */
function fenceStart(line: string): { readonly marker: string, readonly info: string } | undefined {
  const indent = indentOf(line)
  if (indent > 3)
    return undefined
  const char = line[indent]
  if (char === undefined || !FENCE_CHARS.includes(char))
    return undefined
  let run = 0
  while (line[indent + run] === char)
    run += 1
  if (run < 3)
    return undefined
  return {
    marker: char.repeat(run),
    info: line.slice(indent + run),
  }
}

/**
 * Whether a line closes the fence opened with marker.
 * @param line - one source line.
 * @param marker - the opener's marker run.
 * @returns whether the line closes that fence.
 */
function isFenceClose(line: string, marker: string): boolean {
  if (indentOf(line) > 3)
    return false
  const char = marker[0]
  let run = 0
  while (line[indentOf(line) + run] === char)
    run += 1
  if (run < marker.length)
    return false
  return line.slice(indentOf(line) + run).trim() === ''
}

/**
 * Read a list marker from a line.
 * @param line - one source line.
 * @returns the marker shape and its content, or undefined when the line starts no item.
 */
function listStart(line: string): { readonly ordered: boolean, readonly start: number, readonly contentIndent: number, readonly rest: string } | undefined {
  const indent = indentOf(line)
  if (indent > 3)
    return undefined
  const bullet = line[indent]
  let cursor = indent
  let ordered = false
  let start = 1
  if (bullet === '-' || bullet === '+' || bullet === '*') {
    cursor += 1
  }
  else {
    let digits = 0
    while (digits < 9 && line[indent + digits] !== undefined && line[indent + digits] >= '0' && line[indent + digits] <= '9')
      digits += 1
    const delimiter = line[indent + digits]
    if (digits === 0 || (delimiter !== '.' && delimiter !== ')'))
      return undefined
    ordered = true
    start = Number.parseInt(line.slice(indent, indent + digits), 10)
    cursor = indent + digits + 1
  }
  if (line[cursor] !== ' ' && line[cursor] !== '\t')
    return undefined
  let spaces = 0
  while (spaces < 4 && (line[cursor + spaces] === ' ' || line[cursor + spaces] === '\t'))
    spaces += 1
  const contentIndent = cursor + spaces
  return {
    ordered,
    start,
    contentIndent,
    rest: line.slice(contentIndent),
  }
}

/**
 * Read an ATX heading from a line.
 * @param line - one source line.
 * @returns the depth and inline source, or undefined when the line is no heading.
 */
function headingStart(line: string): { readonly depth: number, readonly text: string } | undefined {
  const indent = indentOf(line)
  if (indent > 3 || line[indent] !== '#')
    return undefined
  let depth = 0
  while (depth < 7 && line[indent + depth] === '#')
    depth += 1
  if (depth > 6 || depth === 0)
    return undefined
  const after = line[indent + depth]
  if (after !== undefined && after !== ' ' && after !== '\t')
    return undefined
  return {
    depth,
    text: line.slice(indent + depth).trim().replace(/[ \t]+#+[ \t]*$/, ''),
  }
}

/**
 * Whether a line opens a block the paragraph scanner must stop at.
 * @param line - one source line.
 * @returns whether the line starts a block.
 */
function startsBlock(line: string): boolean {
  if (fenceStart(line) !== undefined || headingStart(line) !== undefined || THEMATIC_BREAK.test(line))
    return true
  if (indentOf(line) <= 3 && line[indentOf(line)] === '>')
    return true
  return listStart(line) !== undefined
}

/**
 * Split one table row into its trimmed cells, honoring escaped pipes.
 * @param row - the raw row source.
 * @returns the cell sources.
 */
function tableCells(row: string): string[] {
  let value = row.trim()
  if (value.startsWith('|'))
    value = value.slice(1)
  if (value.endsWith('|'))
    value = value.slice(0, -1)
  const cells: string[] = []
  let current = ''
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    if (char === '\\' && value[index + 1] === '|') {
      current += '|'
      index += 1
      continue
    }
    if (char === '|') {
      cells.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  cells.push(current.trim())
  return cells
}

/**
 * Read one delimiter cell's alignment.
 * @param cell - the delimiter cell source.
 * @returns the alignment, or undefined when the cell is no delimiter.
 */
function delimiterAlign(cell: string): 'left' | 'right' | 'center' | undefined {
  const trimmed = cell.trim()
  if (trimmed === '')
    return undefined
  const left = trimmed.startsWith(':')
  const right = trimmed.endsWith(':')
  const middle = trimmed.slice(left ? 1 : 0, right
    ? -1
    : undefined)
  if (middle === '' || !/^-+$/.test(middle))
    return undefined
  if (left && right)
    return 'center'
  if (left)
    return 'left'
  if (right)
    return 'right'
  return 'left'
}

/**
 * Whether the line at index opens a table.
 * @param lines - the enclosing block's source lines.
 * @param index - the candidate header row.
 * @returns whether the header and delimiter rows agree on a table.
 */
function isTableStart(lines: readonly string[], index: number): boolean {
  const header = lines[index]
  const delimiter = lines[index + 1]
  if (header === undefined || delimiter === undefined)
    return false
  if (!header.includes('|') || !delimiter.includes('|'))
    return false
  return tableCells(delimiter).every(cell => delimiterAlign(cell) !== undefined)
}

/**
 * Whether a destination names a local file path rather than a URL.
 * @param value - the authored destination.
 * @returns whether the value is an explicit drive or UNC path.
 */
function isExplicitFilePath(value: string): boolean {
  return /^[A-Z]:[\\/]/i.test(value) || /^\\\\/.test(value)
}

/**
 * Reject scriptable URL protocols.
 * @param value - the authored destination.
 * @returns the usable href, or the empty string when the destination is unsafe.
 */
function safeHref(value: string): string {
  if (isExplicitFilePath(value))
    return ''
  try {
    const { protocol } = new URL(value)
    if (protocol === 'javascript:' || protocol === 'vbscript:' || protocol === 'data:' || protocol === 'blob:')
      return ''
    return value
  }
  catch {
    return ''
  }
}

/**
 * Resolve the displayable source for one image destination.
 * @param destination - the authored destination.
 * @param pathImages - the owner's local-path vocabulary, when one exists.
 * @returns the displayable URL, or undefined to fall back to alt text.
 */
function imageSource(destination: string, pathImages: MarkdownPathImages | undefined): string | undefined {
  const remote = safeHref(destination)
  if (remote.startsWith('http:') || remote.startsWith('https:'))
    return remote
  const rewritten = pathImages?.resolve(destination)
  if (rewritten === undefined)
    return undefined
  try {
    const { protocol } = new URL(rewritten)
    // Only a displayable web URL survives; a host-specific scheme is the
    // resolver's business, not the renderer's.
    return protocol === 'http:' || protocol === 'https:' || protocol === 'blob:' || protocol === 'data:'
      ? rewritten
      : undefined
  }
  catch {
    return undefined
  }
}

/**
 * Find the bracket that closes the label opened at start.
 * @param text - the inline source.
 * @param start - the offset of the opening bracket.
 * @returns the closing bracket offset, or -1 when the label never closes.
 */
function findLabelEnd(text: string, start: number): number {
  let depth = 0
  for (let index = start; index < text.length; index += 1) {
    const char = text[index]
    if (char === '\\') {
      index += 1
      continue
    }
    if (char === '[') {
      depth += 1
      continue
    }
    if (char !== ']')
      continue
    depth -= 1
    if (depth === 0)
      return index
  }
  return -1
}

/**
 * Read a parenthesized destination, honoring nested parentheses and escapes.
 * @param text - the inline source.
 * @param open - the offset of the opening parenthesis.
 * @returns the destination, its end offset, or undefined when it never closes.
 */
function parseDestination(text: string, open: number): { readonly destination: string, readonly end: number } | undefined {
  let end = open + 1
  if (text[end] === '<') {
    const angleClose = text.indexOf('>', end + 1)
    if (angleClose < 0 || text[angleClose + 1] !== ')')
      return undefined
    return {
      destination: text.slice(end + 1, angleClose),
      end: angleClose + 2,
    }
  }
  const start = end
  let nested = 0
  while (end < text.length) {
    const char = text[end]
    if (char === '\\') {
      end += 2
      continue
    }
    if (char === '(') {
      nested += 1
    }
    else if (char === ')') {
      if (nested === 0)
        break
      nested -= 1
    }
    end += 1
  }
  if (end >= text.length)
    return undefined
  const raw = text.slice(start, end).trim()
  return { destination: raw.split(/\s+/)[0] ?? '', end: end + 1 }
}

/**
 * Read the bracketed label and parenthesized destination of an inline link.
 * @param text - the inline source.
 * @param start - the offset of the opening bracket.
 * @returns the parsed link and its end offset, or undefined when no link starts here.
 */
function parseLink(text: string, start: number): { readonly label: string, readonly destination: string, readonly end: number } | undefined {
  if (text[start] !== '[')
    return undefined
  const close = findLabelEnd(text, start)
  if (close < 0 || text[close + 1] !== '(')
    return undefined
  const destination = parseDestination(text, close + 1)
  if (destination === undefined)
    return undefined
  return {
    label: text.slice(start + 1, close),
    destination: destination.destination,
    end: destination.end,
  }
}

/**
 * Read an emphasis-style run whose body starts at start + marker.length.
 * @param text - the inline source.
 * @param start - the offset of the opening marker.
 * @param marker - the opening marker run.
 * @returns the body source and end offset, or undefined when the run never closes.
 */
function delimit(text: string, start: number, marker: string): { readonly body: string, readonly end: number } | undefined {
  const close = text.indexOf(marker, start + marker.length)
  if (close <= start + marker.length)
    return undefined
  return {
    body: text.slice(start + marker.length, close),
    end: close + marker.length,
  }
}

/**
 * Render a backtick code span.
 * @param text - the inline source.
 * @param start - the offset of the opening run.
 * @param ctx - the render context.
 * @returns the code node and end offset, or undefined when the run never closes.
 */
function tryCode(text: string, start: number, ctx: BlockContext): InlineHit | undefined {
  if (text[start] !== '`')
    return undefined
  let runLength = 1
  while (text[start + runLength] === '`')
    runLength += 1
  const run = '`'.repeat(runLength)
  const close = text.indexOf(run, start + runLength)
  if (close < 0)
    return undefined
  const value = text.slice(start + runLength, close).replace(/\r?\n|\r/g, ' ')
  const mention = ctx.inLink
    ? undefined
    : ctx.fileMentions?.resolve(value)
  const node = mention === undefined
    ? <code key={`code-${String(start)}`}>{value}</code>
    : (
        <code key={`code-${String(start)}`}>
          <button
            type="button"
            className={ctx.styles.fileMention}
            title={mention.title}
            aria-label={mention.label}
            onClick={mention.open}
            {...mention.contextMenuProps}
          >
            <LinkIconMedium kind={classifyLinkPath(value)} className={ctx.styles.linkIcon} />
            {value}
          </button>
        </code>
      )
  return { node, next: close + runLength }
}

/**
 * Render an inline image or link.
 * @param text - the inline source.
 * @param start - the offset of the opening bracket (or bang).
 * @param ctx - the render context.
 * @returns the node and end offset, or undefined when no image or link starts here.
 */
function tryLink(text: string, start: number, ctx: BlockContext): InlineHit | undefined {
  const image = text[start] === '!' && text[start + 1] === '['
  const link = parseLink(text, image
    ? start + 1
    : start)
  if (link === undefined)
    return undefined
  if (image) {
    const src = imageSource(link.destination, ctx.pathImages)
    const node = src === undefined
      ? <span key={`image-${String(start)}`} className={ctx.styles.imageAlt}>{link.label}</span>
      : (
          <Image
            key={`image-${String(start)}`}
            src={src}
            alt={link.label}
            loadingLabel={ctx.imageLabels.loading}
            failedLabel={ctx.imageLabels.failed}
          />
        )
    return { node, next: link.end }
  }
  const href = safeHref(link.destination)
  if (href === '')
    return { node: <Fragment key={`link-${String(start)}`}>{inline(link.label, { ...ctx, inLink: true })}</Fragment>, next: link.end }
  const external = href.startsWith('http:') || href.startsWith('https:')
  return {
    node: (
      <a
        key={`link-${String(start)}`}
        href={href}
        {...external
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {}}
      >
        <LinkIconMedium kind="url" href={href} className={ctx.styles.linkIcon} />
        {inline(link.label, { ...ctx, inLink: true })}
      </a>
    ),
    next: link.end,
  }
}

/**
 * Render a strong, emphasis or strikethrough run.
 * @param text - the inline source.
 * @param start - the offset of the opening marker.
 * @param ctx - the render context.
 * @returns the node and end offset, or undefined when no run starts here.
 */
function tryEmphasis(text: string, start: number, ctx: BlockContext): InlineHit | undefined {
  const char = text[start]
  if (char !== '*' && char !== '_' && char !== '~')
    return undefined
  const doubled = text[start + 1] === char
  // A single tilde is ordinary text; only the GFM double tilde marks a deletion.
  if (char === '~' && !doubled)
    return undefined
  const marker = doubled
    ? char + char
    : char
  if (!doubled && (text[start + 1] === undefined || text[start + 1] === ' '))
    return undefined
  const hit = delimit(text, start, marker)
  if (hit === undefined || hit.body.endsWith(' ') || (doubled && hit.body.trim() === ''))
    return undefined
  const children = inline(hit.body, ctx)
  const key = (doubled ? 'double-' : 'single-') + char + String(start)
  if (doubled && char === '~')
    return { node: <del key={key}>{children}</del>, next: hit.end }
  if (doubled)
    return { node: <strong key={key}>{children}</strong>, next: hit.end }
  return { node: <em key={key}>{children}</em>, next: hit.end }
}

/**
 * Render one inline construct starting at an offset.
 * @param text - the inline source.
 * @param start - the current offset.
 * @param ctx - the render context.
 * @returns the node and end offset, or undefined for ordinary text.
 */
function scanInline(text: string, start: number, ctx: BlockContext): InlineHit | undefined {
  const char = text[start]
  if (char === '\\' && text[start + 1] !== undefined && ESCAPABLE.test(text[start + 1]))
    return { node: text[start + 1], next: start + 2 }
  if (char === '`')
    return tryCode(text, start, ctx)
  if (char === '!' || char === '[')
    return tryLink(text, start, ctx)
  if (char === '*' || char === '_' || char === '~')
    return tryEmphasis(text, start, ctx)
  if (char === '\n' && / {2,}$/.test(text.slice(Math.max(0, start - 2), start)))
    return { node: <br key={`br-${String(start)}`} />, next: start + 1 }
  if (char === '<' && ctx.omitHtml) {
    const tag = SIMPLE_HTML_TAG.exec(text.slice(start))
    if (tag !== null)
      return { node: null, next: start + tag[0].length }
  }
  return undefined
}

/**
 * Render inline Markdown source into React children.
 * @param text - the inline source.
 * @param ctx - the render context.
 * @returns the rendered children.
 */
function inline(text: string, ctx: BlockContext): ReactNode[] {
  const nodes: ReactNode[] = []
  let buffer = ''
  let index = 0
  while (index < text.length) {
    const hit = scanInline(text, index, ctx)
    if (hit !== undefined) {
      if (buffer !== '') {
        nodes.push(buffer)
        buffer = ''
      }
      nodes.push(hit.node)
      index = hit.next
      continue
    }
    buffer += text[index]
    index += 1
  }
  if (buffer !== '')
    nodes.push(buffer)
  return nodes
}

/**
 * Drop the paragraph wrappers of a tight list item.
 * @param nodes - the item's parsed blocks.
 * @param tight - whether the item renders tight.
 * @returns the item's children.
 */
function unwrapTightParagraphs(nodes: ReactNode[], tight: boolean): ReactNode[] {
  if (!tight)
    return nodes
  return nodes.map((node) => {
    if (isValidElement<{ children?: ReactNode }>(node) && node.type === 'p')
      return <Fragment key={node.key ?? undefined}>{node.props.children}</Fragment>
    return node
  })
}

/**
 * Render a fenced code block.
 * @param lines - the enclosing block's source lines.
 * @param index - the opening fence line.
 * @param ctx - the render context.
 * @returns the code block and the next line, or undefined when the line opens no fence.
 */
function parseFence(lines: readonly string[], index: number, ctx: BlockContext): BlockHit | undefined {
  const start = fenceStart(lines[index])
  if (start === undefined)
    return undefined
  const code: string[] = []
  let cursor = index + 1
  while (cursor < lines.length && !isFenceClose(lines[cursor], start.marker)) {
    code.push(lines[cursor])
    cursor += 1
  }
  const info = start.info.trim()
  const lang = /^[\w-]+/.exec(info)?.[0]
  return {
    node: (
      <CodeBlock
        key={`fence-${String(index)}`}
        code={`${code.join('\n')}\n`}
        lang={lang}
        streaming={ctx.streaming}
        copyLabel={ctx.labels.code.copyLabel}
        copiedLabel={ctx.labels.code.copiedLabel}
        toolbarLabels={ctx.labels.code.toolbarLabels}
      />
    ),
    next: Math.min(cursor + 1, lines.length),
  }
}

/**
 * Render an ATX heading.
 * @param lines - the enclosing block's source lines.
 * @param index - the candidate heading line.
 * @param ctx - the render context.
 * @returns the heading and the next line, or undefined when the line is no heading.
 */
function parseHeading(lines: readonly string[], index: number, ctx: BlockContext): BlockHit | undefined {
  const heading = headingStart(lines[index])
  if (heading === undefined)
    return undefined
  return {
    node: createElement(`h${String(heading.depth)}`, { key: `h-${String(index)}` }, ...inline(heading.text, ctx)),
    next: index + 1,
  }
}

/**
 * Render a thematic break.
 * @param lines - the enclosing block's source lines.
 * @param index - the candidate rule line.
 * @returns the rule and the next line, or undefined when the line is no rule.
 */
function parseThematicBreak(lines: readonly string[], index: number): BlockHit | undefined {
  if (!THEMATIC_BREAK.test(lines[index]))
    return undefined
  return {
    node: createElement('hr', { key: `hr-${String(index)}` }),
    next: index + 1,
  }
}

/**
 * Render a blockquote and its nested blocks.
 * @param lines - the enclosing block's source lines.
 * @param index - the opening quote line.
 * @param ctx - the render context.
 * @returns the blockquote and the next line, or undefined when the line opens no quote.
 */
function parseBlockquote(lines: readonly string[], index: number, ctx: BlockContext): BlockHit | undefined {
  if (indentOf(lines[index]) > 3 || lines[index][indentOf(lines[index])] !== '>')
    return undefined
  const quoted: string[] = []
  let cursor = index
  while (cursor < lines.length && indentOf(lines[cursor]) <= 3 && lines[cursor][indentOf(lines[cursor])] === '>') {
    quoted.push(lines[cursor].slice(indentOf(lines[cursor]) + 1).replace(/^ /, ''))
    cursor += 1
  }
  return {
    node: createElement(
      'blockquote',
      { key: `quote-${String(index)}` },
      ...parseBlocks(quoted, { ...ctx, inBlockquote: true }),
    ),
    next: cursor,
  }
}

/**
 * Render a table with its header, body and per-column alignment.
 * @param lines - the enclosing block's source lines.
 * @param index - the header row.
 * @param ctx - the render context.
 * @returns the table and the next line, or undefined when the lines are no table.
 */
function parseTable(lines: readonly string[], index: number, ctx: BlockContext): BlockHit | undefined {
  if (!isTableStart(lines, index))
    return undefined
  const header = tableCells(lines[index])
  const alignments = tableCells(lines[index + 1]).map(cell => delimiterAlign(cell) ?? 'left')
  const body: string[][] = []
  let cursor = index + 2
  while (cursor < lines.length && !isBlank(lines[cursor]) && lines[cursor].includes('|')) {
    body.push(tableCells(lines[cursor]))
    cursor += 1
  }
  const columns = Math.max(header.length, alignments.length)
  const wide = columns >= 4 && !ctx.inBlockquote
  const renderRow = (cells: readonly string[], tag: 'th' | 'td', key: string): ReactNode => (
    <tr key={key}>
      {Array.from({ length: columns }, (_, cellIndex) => createElement(tag, {
        key: cellIndex,
        style: { textAlign: alignments[cellIndex] ?? 'left' } as CSSProperties,
      }, ...inline(cells[cellIndex] ?? '', ctx)))}
    </tr>
  )
  return {
    node: (
      <div
        key={`table-${String(index)}`}
        className={cx(ctx.styles.tableScroll, wide ? 'md-table-wide' : ctx.styles.tableFill)}
        tabIndex={wide ? 0 : undefined}
      >
        <table>
          <thead>{renderRow(header, 'th', 'head')}</thead>
          {body.length > 0 && <tbody>{body.map((row, rowIndex) => renderRow(row, 'td', `row-${String(rowIndex)}`))}</tbody>}
        </table>
      </div>
    ),
    next: cursor,
  }
}

/**
 * Collect one list item's dedented source lines, up to the next sibling item.
 * @param lines - the enclosing block's source lines.
 * @param start - the item's marker line.
 * @param contentIndent - the column where the item's content starts.
 * @param firstLine - the item's first line after the marker.
 * @returns the item's source lines and the next unconsumed line.
 */
function collectItemLines(lines: readonly string[], start: number, contentIndent: number, firstLine: string): { readonly lines: string[], readonly next: number } {
  const itemLines = [firstLine]
  let cursor = start + 1
  while (cursor < lines.length) {
    const next = lines[cursor]
    if (!isBlank(next) && indentOf(next) >= contentIndent) {
      itemLines.push(next.slice(contentIndent))
      cursor += 1
      continue
    }
    if (!isBlank(next))
      break
    let lookahead = cursor + 1
    while (lookahead < lines.length && isBlank(lines[lookahead]))
      lookahead += 1
    if (lookahead >= lines.length || indentOf(lines[lookahead]) < contentIndent) {
      cursor = lookahead
      break
    }
    itemLines.push('')
    cursor += 1
  }
  return { lines: itemLines, next: cursor }
}

/**
 * Render a list and its items, keeping nested blocks inside each item.
 * @param lines - the enclosing block's source lines.
 * @param index - the first item's line.
 * @param ctx - the render context.
 * @returns the list and the next line, or undefined when the line starts no list.
 */
function parseList(lines: readonly string[], index: number, ctx: BlockContext): BlockHit | undefined {
  const first = listStart(lines[index])
  if (first === undefined)
    return undefined
  const items: string[][] = []
  let cursor = index
  while (cursor < lines.length) {
    const marker = listStart(lines[cursor])
    if (marker === undefined || marker.ordered !== first.ordered)
      break
    const item = collectItemLines(lines, cursor, marker.contentIndent, marker.rest)
    items.push(item.lines)
    cursor = item.next
  }
  const children = items.map((itemLines, itemIndex) => createElement(
    'li',
    { key: `li-${String(itemIndex)}` },
    ...unwrapTightParagraphs(parseBlocks(itemLines, ctx), !itemLines.some(isBlank)),
  ))
  const listProps: Record<string, unknown> = { key: `list-${String(index)}` }
  if (first.ordered && first.start !== 1)
    listProps.start = first.start
  return {
    node: createElement(first.ordered ? 'ol' : 'ul', listProps, ...children),
    next: cursor,
  }
}

/**
 * Render a paragraph and its inline content.
 * @param lines - the enclosing block's source lines.
 * @param index - the paragraph's first line.
 * @param ctx - the render context.
 * @returns the paragraph and the next line.
 */
function parseParagraph(lines: readonly string[], index: number, ctx: BlockContext): BlockHit {
  const paragraph: string[] = [lines[index]]
  let cursor = index + 1
  while (cursor < lines.length && !isBlank(lines[cursor]) && !startsBlock(lines[cursor])) {
    paragraph.push(lines[cursor])
    cursor += 1
  }
  return {
    node: createElement('p', { key: `p-${String(index)}` }, ...inline(paragraph.join('\n').trimEnd(), ctx)),
    next: cursor,
  }
}

/**
 * Render a run of source lines into block-level React children.
 * @param lines - the enclosing block's source lines.
 * @param ctx - the render context.
 * @returns one node per parsed block.
 */
function parseBlocks(lines: readonly string[], ctx: BlockContext): ReactNode[] {
  const nodes: ReactNode[] = []
  let index = 0
  while (index < lines.length) {
    if (isBlank(lines[index])) {
      index += 1
      continue
    }
    const hit = parseFence(lines, index, ctx)
      ?? parseHeading(lines, index, ctx)
      ?? parseThematicBreak(lines, index)
      ?? parseBlockquote(lines, index, ctx)
      ?? parseTable(lines, index, ctx)
      ?? parseList(lines, index, ctx)
      ?? parseParagraph(lines, index, ctx)
    nodes.push(hit.node)
    index = hit.next
  }
  return nodes
}

/**
 * Render untrusted assistant-authored Markdown as semantic React elements.
 * the optional file/image vocabularies.
 * @returns A GFM-subset document rendered as React elements.
 */
export function MarkdownText(props: MarkdownTextProps): React.JSX.Element {
  const styles = useStyle('markdown-text', CSS)
  const {
    text,
    streaming = false,
    incremental = false,
    labels,
    fileMentions,
    pathImages,
    variant = 'body',
    omitHtml = false,
    textInteractionSource = false,
    imageLabels = DEFAULT_MARKDOWN_IMAGE_LABELS,
  } = props
  const blocks = useMemo(() => {
    const ctx: BlockContext = {
      styles,
      labels,
      fileMentions,
      pathImages,
      imageLabels,
      omitHtml,
      streaming: streaming || incremental,
      inLink: false,
      inBlockquote: false,
    }
    return parseBlocks(text.replace(/\r\n?/g, '\n').split('\n'), ctx)
  }, [
    text,
    streaming,
    incremental,
    labels,
    fileMentions,
    pathImages,
    omitHtml,
    imageLabels,
    styles,
  ])
  return (
    <div
      className={cx(styles.markdown, variant === 'compact'
        ? styles.compact
        : undefined)}
      data-text-interaction-source={textInteractionSource ? '' : undefined}
      data-markdown-variant={variant === 'compact'
        ? variant
        : undefined}
    >
      {blocks}
    </div>
  )
}
