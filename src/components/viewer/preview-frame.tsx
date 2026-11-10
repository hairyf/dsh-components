import type * as React from 'react'
import { PathLabel } from '@deepseek-ai/dsh-client-ui-primitives'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-sidebar-documentpreview / TextPreview.module.css (verbatim).
 */
const CSS = `/* @deepseek-ai/dsh-client-ui-sidebar-documentpreview / TextPreview.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.preview {
  flex-direction: column;
  flex: auto;
  min-width: 0;
  height: 100%;
  min-height: 0;
  display: flex;
}

.content {
  isolation: isolate;
  flex: auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  position: relative;
}

.content>:first-child {
  isolation: isolate;
  flex: auto;
  min-width: 0;
}

.header {
  box-sizing: border-box;
  border-bottom: .5px solid var(--dsw-alias-border-l3);
  flex: none;
  align-items: center;
  gap: 4px;
  height: 38px;
  padding: 0 6px 0 16px;
  display: flex;
}

.path {
  margin-right: 12px;
}

.changed {
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-layer-2);
  border-bottom: .5px solid var(--dsw-alias-border-l1);
  flex: none;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 6px 10px;
  font-size: 12px;
  display: flex;
}

.body {
  overflow-anchor: none;
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2);
  min-height: 0;
  color: var(--dsw-alias-label-primary);
  font-size: var(--dsh-content-font-size-secondary,13px);
  font-family: var(--dsw-font-mono,ui-monospace, monospace);
  white-space: pre;
  flex: auto;
  margin: 0;
  padding: 0;
  line-height: 1.6;
  position: relative;
  overflow: auto;
}

.body::-webkit-scrollbar-track {
  margin: 2px;
}

.body:has([data-code-preview]) {
  flex-direction: column;
  display: flex;
  overflow: hidden;
}

.body:has([data-pdf-preview]) {
  background: var(--dsw-alias-bg-document-preview);
}

.wrap {
  white-space: pre-wrap;
  word-break: break-word;
}

.textDocument {
  box-sizing: border-box;
  min-width: 100%;
  min-height: 100%;
  padding: 8px;
}

.page {
  font: var(--dsw-font-markdown-code-block);
  white-space: inherit;
  margin: 0;
}

.line {
  padding: 0 10px;
}

.lineMark {
  background: var(--dsw-alias-interactive-bg-hover-accent);
  pointer-events: none;
  animation: 2s ease-in forwards line-mark-fade;
  position: absolute;
  left: 0;
}

@keyframes line-mark-fade {
  0%,
  30% {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.empty {
  box-sizing: border-box;
  height: 100%;
  color: var(--dsw-alias-label-secondary);
  font-size: var(--dsh-content-font-size-secondary,13px);
  font-family: var(--dsw-font-family);
  text-align: center;
  white-space: normal;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  line-height: 1.6;
  display: flex;
}

.empty:after {
  content: "";
  flex: 0 12%;
}

.emptyIcon {
  opacity: .6;
  filter: grayscale();
  flex: none;
}

.emptyLine {
  margin: 0;
}

.retry {
  height: 32px;
  color: var(--dsw-alias-label-primary);
  font-size: var(--dsh-content-font-size-secondary,13px);
  border: .5px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-md);
  cursor: pointer;
  background: 0 0;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 0 14px 0 12px;
  font-family: inherit;
  display: inline-flex;
}

@media (hover:hover) {
  .retry:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.titleIcon {
  flex: none;
}

.statusLine {
  color: var(--dsw-alias-label-secondary);
  font-size: var(--dsh-content-font-size-secondary,13px);
  white-space: normal;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 6px 10px;
  line-height: 1.6;
  display: flex;
}

.status {
  box-sizing: border-box;
  flex-direction: column;
  flex: auto;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 100%;
  min-height: 0;
  padding: 12px 10px;
  display: flex;
}

.action {
  color: var(--dsw-alias-label-primary);
  font-size: var(--dsh-content-font-size-secondary,13px);
  font-family: var(--dsw-font,inherit);
  white-space: normal;
  background: var(--dsw-alias-bg-layer-2);
  border: .5px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-sm);
  cursor: pointer;
  padding: 4px 10px;
}

@media (hover:hover) {
  .action:hover {
    background: var(--dsw-alias-bg-layer-3);
  }
}

.more {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-family: var(--dsw-font,inherit);
  white-space: normal;
  background: var(--dsw-alias-bg-layer-2);
  border: .5px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-sm);
  cursor: pointer;
  margin: 8px 10px;
  padding: 4px 10px;
  display: block;
}

@media (hover:hover) {
  .more:hover:not(:disabled) {
    color: var(--dsw-alias-label-primary);
    background: var(--dsw-alias-bg-layer-3);
  }
}

.more:disabled {
  color: var(--dsw-alias-label-tertiary);
  cursor: default;
}

.tool {
  width: 28px;
  height: 28px;
  color: var(--dsw-alias-label-secondary);
  border-radius: var(--dsw-radius-sm);
  cursor: pointer;
  background: 0 0;
  border: none;
  flex: none;
  justify-content: center;
  align-items: center;
  padding: 6px;
  line-height: 1;
  display: inline-flex;
}

.tool svg {
  width: 15px;
  height: 15px;
}

@media (hover:hover) {
  .tool:hover {
    color: var(--dsw-alias-label-primary);
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.tool[data-textpreview-tool=auto-refresh][aria-pressed=true] {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}

.viewerTool {
  width: auto;
  max-width: 160px;
  color: var(--dsw-alias-label-secondary);
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: none;
  padding: 0 6px;
  font-size: 12px;
  overflow: hidden;
}
`

/** Props of {@link PreviewFrame}. */
export interface PreviewFrameProps {
  /** Path line shown in the header; the whole string stays readable on hover. */
  readonly title?: string
  /** Controls at the end of the header, after the path. */
  readonly headerActions?: React.ReactNode
  /** The preview body. */
  readonly children?: React.ReactNode
  /** Extra class for layout placement. */
  readonly className?: string
}

/**
 * The shell every preview body renders inside: a path header and a content row.
 *
 * The header keeps its height whether or not a path or actions are supplied, so
 * moving between empty and loaded states does not shift the body. The content
 * row isolates its first child, which is where a scrolling preview goes.
 * @param props - header path, trailing actions and body content.
 * @returns the preview frame.
 */
export function PreviewFrame(props: PreviewFrameProps): React.JSX.Element {
  const { title, headerActions, children, className } = props
  const s = useStyle('preview-frame', CSS)
  return (
    <div className={cx(s.preview, className)}>
      <div className={s.header}>
        {title !== undefined && <PathLabel path={title} className={s.path} />}
        {headerActions}
      </div>
      <div className={s.content}>
        {children}
      </div>
    </div>
  )
}
