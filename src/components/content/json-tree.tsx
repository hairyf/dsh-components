import type { CSSProperties, ReactNode } from 'react'
import type * as React from 'react'
import { IconCheckOutlineRegular, IconCopyOutlineRegular, IconWrapLinesOutlineRegular, writeClipboard } from '@deepseek-ai/dsh-client-ui-primitives'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { cx, useStyle } from '../../lib/style'

/* The embedded sheet below is the official stylesheet, copied verbatim. */
const CSS = `.root {
  --json-tree-property: #881391;
  --json-tree-string: #c41a16;
  --json-tree-number: #1c00cf;
  --json-tree-keyword: #1c00cf;
  --json-tree-punctuation: #202124;
  --json-tree-icon: #5f6368;
  --json-tree-hover: rgb(60 64 67 / 4%);

  min-width: 0;
  overflow: auto;
  position: relative;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-layer-1);
  font: 12px/16px var(--ds-font-family-code);
  overscroll-behavior-x: contain;
  overscroll-behavior-y: auto;
}

:global(body[data-ds-dark-theme]) .root {
  --json-tree-property: #5db0d7;
  --json-tree-string: #f28b82;
  --json-tree-number: #99c8ff;
  --json-tree-keyword: #99c8ff;
  --json-tree-punctuation: #e8eaed;
  --json-tree-icon: #9aa0a6;
  --json-tree-hover: rgb(232 234 237 / 5%);
}

.container {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 6px 8px 8px 8px;
  white-space: pre;
}

.expandedTopLevel {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 6px 8px 8px 14px;
}

.expandedTopLevel:has(> .topLevelBracket[data-json-root-row][data-json-copy-active]) {
  background: var(--json-tree-hover);
}

@media (hover: hover) {
  .expandedTopLevel:has(> .topLevelBracket[data-json-root-row]:hover) {
    background: var(--json-tree-hover);
  }
}

.expandedTopLevelContainer {
  padding: 0;
}

.row.topLevelBracket {
  margin-left: 0;
  padding-left: 0;
}

.children {
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  position: relative;
  box-sizing: border-box;
  min-width: 0;
  min-height: 16px;
  margin: 0;
  padding: 0 0 0 10px;
  list-style: none;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.row:not(.topLevelBracket)[data-json-copy-active]::after,
.row:has(> .expander:focus-visible)::after {
  position: absolute;
  z-index: 0;
  top: 0;
  right: 0;
  left: 0;
  height: var(--json-tree-row-height, 16px);
  background: var(--json-tree-hover);
  content: '';
  pointer-events: none;
}

@media (hover: hover) {
  .row:not(.topLevelBracket):hover:not(:has(.row:hover))::after {
    position: absolute;
    z-index: 0;
    top: 0;
    right: 0;
    left: 0;
    height: var(--json-tree-row-height, 16px);
    background: var(--json-tree-hover);
    content: '';
    pointer-events: none;
  }
}

.row > span:not(.expander, .copySlot) {
  position: relative;
  z-index: 1;
}

.label {
  margin-right: 3px;
  color: var(--json-tree-property);
  font-weight: 400;
}

.clickableLabel {
  cursor: pointer;
}

.stringValue {
  color: var(--json-tree-string);
}

.stringField {
  position: relative;
  z-index: 1;
  display: flow-root;
}

.stringText {
  display: block;
  max-height: calc(var(--json-tree-collapsed-lines) * 16px);
  padding-left: 12px;
  overflow: hidden;
  text-indent: -12px;
  word-break: break-all;
}

.stringRaw {
  margin: 4px 0 0 12px;
  overflow: auto;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  overflow-wrap: normal;
  white-space: pre;
  word-break: normal;
}

.stringActions {
  position: absolute;
  top: 1px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  width: fit-content;
  height: 16px;
}

.stringRaw[data-wrap='true'] {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  word-break: break-all;
}

.stringActions > .copySlot {
  opacity: 1;
  pointer-events: auto;
}

.stringToggleSlot {
  display: flex;
  float: right;
  align-items: flex-end;
  height: calc(var(--json-tree-collapsed-lines) * 16px);
  margin-left: 2px;
  shape-outside: inset(calc((var(--json-tree-collapsed-lines) - 1) * 16px) 0 0);
  pointer-events: none;
}

.stringToggle {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  margin: 0;
  padding: 0;
  border: 0;
  color: var(--dsw-alias-label-secondary);
  background: transparent;
  font: inherit;
  text-indent: 0;
  white-space: nowrap;
  cursor: pointer;
  pointer-events: auto;
}

@media (hover: hover) {
  .stringToggle:hover {
    color: var(--dsw-alias-label-primary);
  }
}

.stringToggle:focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: 1px;
}

.row:has(> .stringField) {
  --json-tree-row-height: 100%;
}

.summary {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.numberValue {
  color: var(--json-tree-number);
}

.keywordValue {
  color: var(--json-tree-keyword);
}

.otherValue {
  color: var(--dsw-alias-label-secondary);
}

.punctuation {
  color: var(--json-tree-punctuation);
}

.preview {
  color: var(--json-tree-punctuation);
}

.previewProperty {
  color: var(--json-tree-punctuation);
}

.previewEllipsis {
  color: var(--dsw-alias-label-tertiary);
}

.copySlot {
  display: inline-flex;
  width: 20px;
  height: 16px;
  opacity: 0;
  pointer-events: none;
}

.row > .copySlot {
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
}

.row:has(> .stringField) > .copySlot {
  top: auto;
  bottom: 0;
}

.row:has(> .copySlot) > .stringField .stringToggleSlot {
  padding-right: 24px;
}

.row[data-json-copy-active] > .copySlot,
.copySlot:focus-within {
  opacity: 1;
  pointer-events: auto;
}

@media (hover: hover) {
  .row:hover:not(:has(.row:hover)) > .copySlot {
    opacity: 1;
    pointer-events: auto;
  }
}

.actionButton {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 16px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--dsw-radius-xs);
  color: var(--dsw-alias-label-secondary);
  background: transparent;
  cursor: pointer;
}

@media (hover: hover) {
  .actionButton:hover {
    color: var(--dsw-alias-label-primary);
  }
}

.actionButton[aria-pressed='true'] {
  color: var(--dsw-alias-state-business-primary);
}

.actionButton:focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: -1px;
}

.actionButton[data-state='failed'] {
  color: var(--dsw-alias-state-error-primary);
}

.expander {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  width: 8px;
  height: 16px;
  margin: 0;
  color: var(--json-tree-icon);
  cursor: pointer;
  user-select: none;
}

.expander::before {
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 6px solid currentColor;
  content: '';
  transform: scale(0.75);
  transform-origin: 33.333% center;
}

.collapseIcon::before {
  transform: rotate(90deg) scale(0.75);
}

@media (hover: hover) {
  .expander:hover {
    color: var(--dsw-alias-label-primary);
  }
}

.expander:focus-visible {
  outline: none;
}

.collapsedContent {
  margin: 0 1px;
  color: var(--json-tree-punctuation);
  cursor: pointer;
}

.collapsedContent::after {
  content: '…';
}

@media (hover: none) {
  .copySlot { opacity: 1; pointer-events: auto; }

  .row:has(> .copySlot) { padding-right: 24px; }
}
`

/** Entries an object preview draws before it elides the rest. */
const OBJECT_PREVIEW_LIMIT = 4
/** Entries an array preview draws before it elides the rest. */
const ARRAY_PREVIEW_LIMIT = 5
/** Nested preview depth after which values collapse to an ellipsis. */
const PREVIEW_DEPTH_LIMIT = 2
/** Collapsed string lines shown before the expand affordance appears. */
const DEFAULT_COLLAPSED_STRING_LINES = 3

/** Display copy for the tree's copy affordances; the owner passes localized labels. */
export interface JsonTreeLabels {
  /** Menu item: copy the raw primitive value. */
  readonly copyValue: string
  /** Menu item: copy the value as compact JSON (primitive rows). */
  readonly copyJson: string
  /** Menu item: copy the property path. */
  readonly copyPath: string
  /** Menu item: copy the value as pretty-printed JSON. */
  readonly copyPrettyJson: string
  /** Menu item: copy the value as compact JSON (object rows). */
  readonly copyCompactJson: string
  /** Copy-button state label after a successful copy. */
  readonly copied: string
  /** Copy-button state label after a failed copy. */
  readonly copyFailed: string
  /** Expander aria label while expanded. */
  readonly collapseNode: string
  /** Expander aria label while collapsed. */
  readonly expandNode: string
  /** Copy-button tooltip, given the current action label. */
  readonly copyButtonTitle: (action: string) => string
}

/** Optional wrap toggle; each expansion reads the shared default without changing other open strings. */
export interface JsonTreeStringWrapping {
  /** Localized label for the wrapping toggle. */
  readonly label: string
  /** Read the wrapping preference when a string is expanded. */
  readonly getDefault: () => boolean
  /** Remember a user toggle for future expansions. */
  readonly setDefault: (wrapped: boolean) => void
}

/** Props for the read-only, token-themed JSON tree. */
export interface JsonTreeProps {
  /** Parsed JSON object or array. */
  readonly data: object | unknown[]
  /** Accessible label for the tree. */
  readonly label: string
  /** Optional positioning class owned by the caller. */
  readonly className?: string | undefined
  /** Maximum visible lines per collapsed string; defaults to 3. */
  readonly collapsedStringLines?: number | undefined
  /** Optional wrap toggle for expanded strings. */
  readonly stringWrapping?: JsonTreeStringWrapping | undefined
  /** Whether JSON rows expose copy actions. */
  readonly copyable?: boolean | undefined
  /** Whether the top-level object or array is always expanded. */
  readonly expandTopLevel?: boolean | undefined
  /** Localized display copy supplied by the owning render site. */
  readonly labels: JsonTreeLabels
}

type PathPart = string | number

interface CopyTarget {
  readonly path: readonly PathPart[]
  readonly value: unknown
}

type CopyState = 'idle' | 'copied' | 'failed'

function isExpandableValue(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !(value instanceof Date)
}

function entriesOf(value: object): [string, unknown][] {
  if (Array.isArray(value)) {
    return value.map((item, index) => [
      String(index),
      item,
    ])
  }
  return Object.keys(value).map(key => [key, (value as Record<string, unknown>)[key]])
}

function bracketOf(value: object): [string, string] {
  return Array.isArray(value)
    ? ['[', ']']
    : ['{', '}']
}

function fieldText(field: string): string {
  return field === ''
    ? '""'
    : field
}

function pathId(path: readonly PathPart[]): string {
  return path.map(part => typeof part === 'number'
    ? `n${String(part)}`
    : `s${String(part.length)}:${part}`).join('/')
}

function copyText(target: CopyTarget): string {
  const { value } = target
  if (typeof value === 'string')
    return value
  if (typeof value === 'undefined')
    return 'undefined'
  if (typeof value === 'bigint')
    return value.toString()
  if (typeof value === 'symbol')
    return value.description ?? 'Symbol'
  if (typeof value === 'function')
    return value.name || 'Function'
  return JSON.stringify(value, null, 2) ?? String(value)
}

function previewValue(value: unknown, depth: number, s: Record<string, string>): ReactNode {
  if (!isExpandableValue(value))
    return previewPrimitive(value, s)
  const array = Array.isArray(value)
  const entries = entriesOf(value)
  const limit = array ? ARRAY_PREVIEW_LIMIT : OBJECT_PREVIEW_LIMIT
  const visible = entries.slice(0, limit)
  const [open, close] = bracketOf(value)
  return (
    <>
      <span className={s.punctuation}>{open}</span>
      {depth >= PREVIEW_DEPTH_LIMIT
        ? <span className={s.previewEllipsis}>…</span>
        : visible.map(([key, item], index) => (
            <span key={key}>
              {index > 0 && <span className={s.punctuation}>, </span>}
              {!array && (
                <>
                  <span className={s.previewProperty}>{key}</span>
                  <span className={s.punctuation}>{': '}</span>
                </>
              )}
              {previewValue(item, depth + 1, s)}
            </span>
          ))}
      {depth < PREVIEW_DEPTH_LIMIT && entries.length > limit && <span className={s.previewEllipsis}>, …</span>}
      <span className={s.punctuation}>{close}</span>
    </>
  )
}

function primitiveValue(value: unknown, s: Record<string, string>): ReactNode {
  if (value === null)
    return <span className={s.keywordValue}>null</span>
  if (typeof value === 'string')
    return <span className={s.stringValue}>{JSON.stringify(value)}</span>
  if (typeof value === 'boolean')
    return <span className={s.keywordValue}>{String(value)}</span>
  if (typeof value === 'number')
    return <span className={s.numberValue}>{String(value)}</span>
  if (typeof value === 'bigint')
    return <span className={s.numberValue}>{`${value.toString()}n`}</span>
  if (value instanceof Date)
    return <span className={s.otherValue}>{value.toISOString()}</span>
  if (typeof value === 'function')
    return <span className={s.otherValue}>{'function() { }'}</span>
  if (typeof value === 'undefined')
    return <span className={s.otherValue}>undefined</span>
  return <span className={s.otherValue}>{String(value)}</span>
}

function previewPrimitive(value: unknown, s: Record<string, string>): ReactNode {
  if (value === null)
    return <span className={s.keywordValue}>null</span>
  if (typeof value === 'string')
    return <span className={s.stringValue}>{JSON.stringify(value)}</span>
  if (typeof value === 'number')
    return <span className={s.numberValue}>{String(value)}</span>
  if (typeof value === 'boolean')
    return <span className={s.keywordValue}>{String(value)}</span>
  if (typeof value === 'bigint')
    return <span className={s.otherValue}>{value.toString()}</span>
  if (typeof value === 'undefined')
    return <span className={s.otherValue}>undefined</span>
  if (typeof value === 'symbol')
    return <span className={s.otherValue}>{value.description ?? 'Symbol'}</span>
  if (typeof value === 'function')
    return <span className={s.otherValue}>{value.name || 'Function'}</span>
  return null
}

interface CopyActionProps {
  readonly target: CopyTarget
  readonly labels: JsonTreeLabels
  readonly s: Record<string, string>
}

function CopyAction({ target, labels, s }: CopyActionProps): React.JSX.Element {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => {
    if (timer.current !== undefined)
      clearTimeout(timer.current)
  }, [])
  const object = typeof target.value === 'object' && target.value !== null
  const action = state === 'copied'
    ? labels.copied
    : state === 'failed'
      ? labels.copyFailed
      : object ? labels.copyPrettyJson : labels.copyValue
  return (
    <span className={s.copySlot}>
      <button
        type="button"
        className={s.actionButton}
        data-json-copy-button="true"
        data-state={state}
        aria-label={action}
        title={labels.copyButtonTitle(action)}
        onClick={() => {
          void writeClipboard(copyText(target)).then((ok) => {
            setState(ok ? 'copied' : 'failed')
            if (timer.current !== undefined)
              clearTimeout(timer.current)
            timer.current = setTimeout(() => {
              setState('idle')
            }, 1500)
          })
        }}
      >
        {state === 'copied'
          ? <IconCheckOutlineRegular size={12} />
          : <IconCopyOutlineRegular size={12} />}
      </button>
    </span>
  )
}

function NodeField({ field, expandable, onToggle, s }: { readonly field: string | undefined, readonly expandable: boolean, readonly onToggle: () => void, readonly s: Record<string, string> }): React.JSX.Element | null {
  if (field === undefined)
    return null
  return (
    <span className={cx(s.label, expandable ? s.clickableLabel : undefined)} onClick={expandable ? onToggle : undefined}>
      {fieldText(field)}
      :
    </span>
  )
}

interface JsonStringProps {
  readonly collapsedStringLines: number
  readonly stringWrapping: JsonTreeStringWrapping | undefined
  readonly field: string | undefined
  readonly value: string
  readonly labels: JsonTreeLabels
  readonly lastElement: boolean
  readonly renderCopy: (() => ReactNode) | undefined
  readonly s: Record<string, string>
}

function JsonString({ collapsedStringLines, stringWrapping, field, value, labels, lastElement, renderCopy, s }: JsonStringProps): React.JSX.Element {
  const contentsId = useId()
  const contentRef = useRef<HTMLSpanElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [wrapped, setWrapped] = useState(false)
  const [truncated, setTruncated] = useState(false)
  useLayoutEffect(() => {
    if (expanded)
      return undefined
    const content = contentRef.current
    if (content === null)
      return undefined
    const measure = (): void => {
      const lineHeight = Number.parseFloat(getComputedStyle(content).lineHeight)
      setTruncated(content.scrollHeight > lineHeight * collapsedStringLines)
    }
    measure()
    if (typeof ResizeObserver === 'undefined')
      return undefined
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    return () => {
      observer.disconnect()
    }
  }, [
    collapsedStringLines,
    expanded,
    field,
    lastElement,
    value,
  ])
  if (expanded) {
    const fieldId = `${contentsId}-field`
    return (
      <div className={s.stringField} data-expanded="true">
        {field !== undefined && (
          <span id={fieldId} className={s.label}>
            {fieldText(field)}
            :
          </span>
        )}
        <pre
          id={contentsId}
          className={s.stringRaw}
          data-wrap={wrapped ? 'true' : 'false'}
          tabIndex={0}
          aria-labelledby={field === undefined
            ? undefined
            : fieldId}
        >
          {value}
        </pre>
        {!lastElement && <span className={s.punctuation}>,</span>}
        <div className={s.stringActions}>
          {stringWrapping !== undefined && (
            <button
              type="button"
              className={s.actionButton}
              aria-label={stringWrapping.label}
              title={stringWrapping.label}
              aria-pressed={wrapped}
              aria-controls={contentsId}
              onClick={() => {
                const next = !wrapped
                setWrapped(next)
                stringWrapping.setDefault(next)
              }}
            >
              <IconWrapLinesOutlineRegular size={12} />
            </button>
          )}
          <button
            type="button"
            className={s.actionButton}
            aria-label={labels.collapseNode}
            title={labels.collapseNode}
            aria-expanded
            aria-controls={contentsId}
            onClick={() => {
              setExpanded(false)
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M9.5 1.5V6.5H14.5M1.5 9.5H6.5V14.5" />
            </svg>
          </button>
          {renderCopy?.()}
        </div>
      </div>
    )
  }
  return (
    <>
      {renderCopy?.()}
      <span className={s.stringField} data-expanded="false">
        <span ref={contentRef} id={contentsId} className={s.stringText}>
          {truncated && (
            <span className={s.stringToggleSlot}>
              <button
                type="button"
                className={s.stringToggle}
                aria-label={labels.expandNode}
                aria-expanded={false}
                aria-controls={contentsId}
                onClick={() => {
                  setWrapped(stringWrapping?.getDefault() ?? false)
                  setExpanded(true)
                }}
              >
                <span aria-hidden="true">…</span>
                {labels.expandNode}
              </button>
            </span>
          )}
          {field !== undefined && (
            <span className={s.label}>
              {fieldText(field)}
              :
            </span>
          )}
          {primitiveValue(value, s)}
          {!lastElement && <span className={s.punctuation}>,</span>}
        </span>
      </span>
    </>
  )
}

/**
 * Move keyboard focus to the neighbouring expander in the enclosing tree.
 * @param from - the expander that received the arrow key.
 * @param direction - -1 for up, 1 for down.
 */
function moveExpanderFocus(from: HTMLElement, direction: number): void {
  const tree = from.closest('[role="tree"]')
  if (tree === null)
    return
  const expanders = Array.from(tree.querySelectorAll<HTMLElement>('[data-json-expander]'))
  const current = expanders.indexOf(from)
  if (current < 0 || expanders.length === 0)
    return
  expanders[(current + direction + expanders.length) % expanders.length]?.focus()
}

/** Props for one row's expander control. */
interface JsonExpanderProps {
  readonly expanderRef: React.RefObject<HTMLSpanElement | null>
  readonly expanded: boolean
  readonly contentsId: string
  readonly tabStop: boolean
  readonly labels: JsonTreeLabels
  readonly expanderClass: string
  readonly collapseClass: string
  readonly onToggle: () => void
  readonly onFocus: () => void
  readonly onKeyDown: (event: React.KeyboardEvent<HTMLSpanElement>) => void
}

/**
 * Render the triangle expander of one container row.
 * @returns The expander control.
 */
function JsonExpander({ expanderRef, expanded, contentsId, tabStop, labels, expanderClass, collapseClass, onToggle, onFocus, onKeyDown }: JsonExpanderProps): React.JSX.Element {
  return (
    <span
      ref={expanderRef}
      className={cx(expanderClass, expanded ? collapseClass : undefined)}
      data-json-expander="true"
      role="button"
      aria-label={expanded ? labels.collapseNode : labels.expandNode}
      aria-expanded={expanded}
      aria-controls={expanded ? contentsId : undefined}
      tabIndex={tabStop
        ? 0
        : -1}
      onFocus={onFocus}
      onClick={onToggle}
      onKeyDown={onKeyDown}
    />
  )
}

/** Shared state a container row passes down to its children. */
interface JsonChildListProps {
  readonly collapsedStringLines: number
  readonly stringWrapping: JsonTreeStringWrapping | undefined
  readonly labels: JsonTreeLabels
  readonly renderCopy: ((target: CopyTarget) => ReactNode) | undefined
  readonly tabStopId: string | null
  readonly onClaimTabStop: (id: string) => void
  readonly styles: Record<string, string>
  readonly contentsId: string
  readonly path: readonly PathPart[]
  readonly container: object
}

/**
 * Render a container row's expanded children.
 * @returns The group list.
 */
function JsonChildList({ collapsedStringLines, stringWrapping, labels, renderCopy, tabStopId, onClaimTabStop, styles, contentsId, path, container }: JsonChildListProps): React.JSX.Element {
  const array = Array.isArray(container)
  const entries = entriesOf(container)
  return (
    <ul id={contentsId} role="group" className={styles.children}>
      {entries.map(([key, item], index) => (
        <JsonTreeNode
          key={key}
          collapsedStringLines={collapsedStringLines}
          stringWrapping={stringWrapping}
          field={key}
          value={item}
          path={[
            ...path,
            array ? index : key,
          ]}
          labels={labels}
          lastElement={index === entries.length - 1}
          initialExpanded={false}
          tabStopId={tabStopId}
          onClaimTabStop={onClaimTabStop}
          renderCopy={renderCopy}
          s={styles}
        />
      ))}
    </ul>
  )
}

interface JsonTreeNodeProps {
  readonly collapsedStringLines: number
  readonly stringWrapping: JsonTreeStringWrapping | undefined
  readonly field: string | undefined
  readonly initialExpanded: boolean
  readonly labels: JsonTreeLabels
  readonly lastElement: boolean
  readonly onClaimTabStop: (id: string) => void
  readonly path: readonly PathPart[]
  readonly renderCopy: ((target: CopyTarget) => ReactNode) | undefined
  readonly tabStopId: string | null
  readonly value: unknown
  readonly s: Record<string, string>
}

function JsonTreeNode({ collapsedStringLines, stringWrapping, field, initialExpanded, labels, lastElement, onClaimTabStop, path, renderCopy, tabStopId, value, s }: JsonTreeNodeProps): React.JSX.Element {
  const contentsId = useId()
  const expanderRef = useRef<HTMLSpanElement>(null)
  const [expanded, setExpanded] = useState(initialExpanded)
  const nodeId = pathId(path)
  const container = isExpandableValue(value)
  const entries = container
    ? entriesOf(value)
    : []
  const expandable = entries.length > 0
  const target: CopyTarget = { path, value }
  const copy = renderCopy?.(target)
  const toggle = (): void => {
    setExpanded(current => !current)
    expanderRef.current?.focus()
  }
  const onExpanderKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>): void => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      moveExpanderFocus(event.currentTarget, event.key === 'ArrowUp'
        ? -1
        : 1)
      return
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      setExpanded(event.key === 'ArrowRight')
    }
  }
  const row = (children: ReactNode, ariaExpanded?: boolean): React.JSX.Element => (
    <div className={s.row} role="treeitem" aria-expanded={ariaExpanded}>
      {typeof value !== 'string' && copy}
      {children}
    </div>
  )
  if (typeof value === 'string') {
    return row(
      <JsonString
        collapsedStringLines={collapsedStringLines}
        stringWrapping={stringWrapping}
        field={field}
        value={value}
        labels={labels}
        lastElement={lastElement}
        renderCopy={renderCopy === undefined
          ? undefined
          : () => copy}
        s={s}
      />,
    )
  }
  if (!container) {
    return row(
      <>
        <NodeField field={field} expandable={false} onToggle={toggle} s={s} />
        {primitiveValue(value, s)}
        {!lastElement && <span className={s.punctuation}>,</span>}
      </>,
    )
  }
  const [open, close] = bracketOf(value)
  if (!expandable) {
    return row(
      <>
        <NodeField field={field} expandable={false} onToggle={toggle} s={s} />
        <span className={s.punctuation}>{open}</span>
        <span className={s.punctuation}>{close}</span>
        {!lastElement && <span className={s.punctuation}>,</span>}
      </>,
    )
  }
  return row(
    <>
      <JsonExpander
        expanderRef={expanderRef}
        expanded={expanded}
        contentsId={contentsId}
        tabStop={tabStopId === nodeId}
        labels={labels}
        expanderClass={s.expander}
        collapseClass={s.collapseIcon}
        onToggle={toggle}
        onFocus={() => {
          onClaimTabStop(nodeId)
        }}
        onKeyDown={onExpanderKeyDown}
      />
      <span className={s.summary}>
        <NodeField field={field} expandable onToggle={toggle} s={s} />
        <span className={s.preview}>{previewValue(value, 0, s)}</span>
        {!lastElement && <span className={s.punctuation}>,</span>}
      </span>
      {expanded && (
        <JsonChildList
          collapsedStringLines={collapsedStringLines}
          stringWrapping={stringWrapping}
          labels={labels}
          renderCopy={renderCopy}
          tabStopId={tabStopId}
          onClaimTabStop={onClaimTabStop}
          styles={s}
          contentsId={contentsId}
          path={path}
          container={value}
        />
      )}
    </>,
    expanded,
  )
}

/**
 * Render parsed JSON as a compact, keyboard-accessible inspector tree.
 *
 * Rows collapse/expand with the shared expander, strings reveal a raw view
 * once they exceed {@link DEFAULT_COLLAPSED_STRING_LINES} lines, and every row
 * can copy its value. The official context-menu modes are collapsed into one
 * copy action; the labels keep their official names.
 * @returns A read-only JSON tree with an optionally fixed-open top level.
 */
export function JsonTree({ data, label, className, collapsedStringLines = DEFAULT_COLLAPSED_STRING_LINES, stringWrapping, copyable = true, expandTopLevel = true, labels }: JsonTreeProps): React.JSX.Element {
  const s = useStyle('json-tree', CSS)
  const rootEntries = entriesOf(data)
  const firstExpandableIndex = rootEntries.findIndex(([, value]) => isExpandableValue(value) && entriesOf(value).length > 0)
  const firstExpandableEntry = rootEntries[firstExpandableIndex]
  const initialTabStopId = expandTopLevel
    ? firstExpandableEntry === undefined
      ? null
      : pathId([
          Array.isArray(data)
            ? firstExpandableIndex
            : firstExpandableEntry[0],
        ])
    : isExpandableValue(data) && rootEntries.length > 0
      ? pathId([])
      : null
  const [tabStopId, setTabStopId] = useState<string | null>(initialTabStopId)
  const renderCopy = copyable
    ? (target: CopyTarget): ReactNode => <CopyAction target={target} labels={labels} s={s} />
    : undefined
  useEffect(() => {
    setTabStopId(initialTabStopId)
  }, [data, expandTopLevel, initialTabStopId])
  const [rootOpen, rootClose] = bracketOf(data)
  return (
    <div
      className={cx(s.root, className)}
      style={{ '--json-tree-collapsed-lines': collapsedStringLines } as CSSProperties}
    >
      {expandTopLevel
        ? (
            <div className={s.expandedTopLevel}>
              <div className={cx(s.row, s.topLevelBracket)} data-json-root-row="true">
                {renderCopy?.({ path: [], value: data })}
                <span className={s.punctuation}>{rootOpen}</span>
              </div>
              <div aria-label={label} className={cx(s.container, s.expandedTopLevelContainer)} role="tree">
                {rootEntries.map(([key, value], index) => (
                  <JsonTreeNode
                    key={key}
                    collapsedStringLines={collapsedStringLines}
                    stringWrapping={stringWrapping}
                    field={key}
                    value={value}
                    path={[
                      Array.isArray(data)
                        ? index
                        : key,
                    ]}
                    labels={labels}
                    lastElement={index === rootEntries.length - 1}
                    initialExpanded={false}
                    tabStopId={tabStopId}
                    onClaimTabStop={setTabStopId}
                    renderCopy={renderCopy}
                    s={s}
                  />
                ))}
              </div>
              <div className={cx(s.row, s.topLevelBracket)}>
                <span className={s.punctuation}>{rootClose}</span>
              </div>
            </div>
          )
        : (
            <div aria-label={label} className={s.container} role="tree">
              <JsonTreeNode
                collapsedStringLines={collapsedStringLines}
                stringWrapping={stringWrapping}
                value={data}
                field={undefined}
                path={[]}
                labels={labels}
                lastElement
                initialExpanded
                tabStopId={tabStopId}
                onClaimTabStop={setTabStopId}
                renderCopy={renderCopy}
                s={s}
              />
            </div>
          )}
    </div>
  )
}
