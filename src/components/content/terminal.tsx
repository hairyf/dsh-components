import type { CSSProperties, ReactNode } from 'react'
import type * as React from 'react'
import { Pill, StateDot, useClipboardCopy } from '@deepseek-ai/dsh-client-ui-primitives'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cx, useStyle } from '../../lib/style'
import { FoldToggle } from '../internal/fold-toggle'
import { headTailCap } from '../internal/head-tail-cap'

/* The embedded sheets are the official stylesheets, copied verbatim; their prose is not ours to edit:
   - lib/Terminal.module.css: the command card
   - lib/CommandText.module.css: one authored command line */
/* eslint-disable slop/no-em-dash -- verbatim official CSS. */
const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives lib/Terminal.module.css; official CSS, verbatim. */
.block {
  --dsl-terminal-radius: var(--dsw-radius-lg);
  --dsl-terminal-line-height: 22px;
  /* Rebindable by consumers (CodeBlock's --dsl-code-block-content-font
     pattern): a surface wanting the smaller code size rebinds this together
     with --dsl-terminal-line-height on its own container. */
  --dsl-terminal-font: var(--dsw-font-markdown-code-block);
  /* The card's own left inset, holding the run-state dot in a column of its own
     so it never competes with the commands for horizontal space. */
  --dsl-terminal-gutter: 30px;

  position: relative;
  margin: 16px 0;
  /* The gutter is the card's OWN padding, not a margin: every consumer rewrites
     \`margin\` wholesale (each render site sets its own indent), which silently
     cancelled the reservation and let the dot fall outside the card into a
     container that clips it. Owning the reservation here keeps the invariant
     with the component that depends on it. */
  padding-left: var(--dsl-terminal-gutter);
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-markdown-code-block);
  border-radius: var(--dsl-terminal-radius);
  /* Clip the banner to the card's own radius: when a consumer adds a border,
     the banner's equal corner radius no longer nests inside it and leaves a
     notch at the corner. Nothing inside renders out of the box. */
  overflow: hidden;
}

/* The status pill and copy control top-align to the FIRST prompt row (their
   heights are capped to the prompt line, so on a multi-line command they sit
   with the first command instead of floating mid-banner). */
.header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  /* Pulled back across the card's gutter padding so the banner spans the FULL
     surface, then re-inset by the same amount so the prompt text and the dot
     keep their positions. The banner shares the card's own surface (no banner
     token): the l2 divider below is the section boundary. */
  margin-left: calc(-1 * var(--dsl-terminal-gutter));
  padding: 9px 14px 9px var(--dsl-terminal-gutter);
  border-top-left-radius: var(--dsl-terminal-radius);
  border-top-right-radius: var(--dsl-terminal-radius);
  /* A long multi-line command scrolls inside the banner (same cap as the
     IN/OUT card's sections) instead of pushing the output off screen. */
  max-height: 150px;
  overflow-y: auto;
}

/* Banner scrollbar floats off the card edge like the output's. */
.header::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  background-clip: padding-box;
  border-radius: var(--dsw-radius-sm);
}

.header::-webkit-scrollbar-track {
  margin: 6px;
}

/* Full-width l2 hairline between the command banner and the body — the same
   divider the IN/OUT card draws between its sections. A banner-only card (a
   running command that has printed nothing yet) draws none. */
.block[data-body] .header {
  border-bottom: 0.5px solid var(--dsw-alias-border-l2);
}

/* One row per command line. The prompt column is the only element allowed to
   shrink; the status pill and the copy control keep their intrinsic width. */
.prompt {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  font: var(--dsl-terminal-font);
}

.promptLine {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  line-height: var(--dsl-terminal-line-height);
}

/* Out of flow inside the card's own gutter padding, so the reservation and the
   dot move together and no consumer margin can pull them apart; the dot neither
   indents its command nor depends on the command's text metrics to line up.
   Centered against the first visual line box, not the code font's baseline. */
.runState {
  position: absolute;
  left: calc(-1 * var(--dsl-terminal-gutter) + 8px);
  top: calc(var(--dsl-terminal-line-height) / 2);
  transform: translateY(-50%);
}

/* The dot is aria-hidden; this is its text label for assistive technology. */
.runStateLabel {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.cwd {
  flex: none;
  color: var(--dsw-alias-label-tertiary);
}

/* Each authored command line scrolls independently of its prompt and status.
   \`pre\` preserves whitespace; hosts can opt into wrapping with \`pre-wrap\`. */
.command {
  --dsl-command-whitespace: var(--dsl-terminal-command-whitespace, pre);
  color: var(--dsw-alias-label-primary);
}

/* Capped to the prompt's line height (Pill's own 24px height would exceed a
   smaller-font prompt row and stretch the banner). Sticky against the
   banner's own scroll so the pill and the copy control stay in reach while a
   long command scrolls underneath. */
.status {
  flex: none;
  position: sticky;
  top: 0;
  height: var(--dsl-terminal-line-height);
  color: var(--dsw-alias-state-error-primary);
}

.copyButton {
  flex: none;
  position: sticky;
  top: 0;
  /* Card surface, not transparent: the control is sticky over the banner's
     own scroll, so scrolled command text must not bleed through it. */
  background-color: var(--dsw-alias-markdown-code-block);
  border: none;
  padding: 0;
  margin: 0;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  font: var(--dsw-font-xs-13);
  line-height: var(--dsl-terminal-line-height);
}

/* Vertical scrolling lives on the OUTPUT, not the card root: a root scroller
   would run its scrollbar over the banner (and the copy control), while here
   the banner stays pinned and the bar sits inside the output's right padding.
   Unset, the max-height is none and the auto overflow never engages. */
.output {
  max-height: var(--dsl-terminal-output-max-height, none);
  padding: 12px 14px 12px 0;
  font: var(--dsl-terminal-font);
  overflow-x: auto;
  overflow-y: auto;
}

/* Both output scrollbars (vertical cap, horizontal pre overflow) float 2px
   off the card edge: a transparent border clips the thumb inward so it never
   hugs the rounded corner. */
.output::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  background-clip: padding-box;
  border-radius: var(--dsw-radius-sm);
}

/* Track end-margins keep the thumb's travel out of the card's rounded
   corners in both directions. */
.output::-webkit-scrollbar-track {
  margin: 6px;
}

/* Default \`pre\`: alignment is the payload of terminal output. Hosts opt
   into wrapping long lines by rebinding the variable to \`pre-wrap\`, which
   also keeps the output region from ever scrolling sideways; overflow-wrap
   is inert while white-space stays \`pre\`. */
.line {
  min-height: var(--dsl-terminal-line-height);
  white-space: var(--dsl-terminal-line-whitespace, pre);
  overflow-wrap: anywhere;
}

.expand {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background-color: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

@media (hover: hover) {
  .expand:hover {
    color: var(--dsw-alias-label-secondary);
  }
}

.empty {
  padding: 12px 14px 12px 0;
  font: var(--dsl-terminal-font);
  color: var(--dsw-alias-label-tertiary);
}
`
/* eslint-enable slop/no-em-dash */

/* The command-line scrollport, kept beside the card that draws it: the terminal is
   its only host, and the official sheet for it is two rules long. */
const COMMAND_TEXT_CSS = `.text {
  display: block;
  min-width: 0;
  overflow-x: auto;
  white-space: var(--dsl-command-whitespace, pre);
  overflow-wrap: anywhere;
}

.text:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: -2px;
}
`

/** Text and caller-localized identification for one command line. */
interface CommandTextProps {
  /** The authored command line, drawn verbatim. */
  readonly text: string
  /** Accessible name while the line can scroll horizontally. */
  readonly label: string
  /** Owner typography and positioning. */
  readonly className?: string | undefined
}

/**
 * Render one authored command line without adding a Tab stop for content that fits.
 *
 * The scrollport becomes named and keyboard-focusable only once the text
 * actually overflows, so a short command adds no stop to the tab order.
 * @param props - text, localized scrollport name, and owner styling.
 * @returns A horizontal text scrollport, named and focusable only when overflowing.
 */
function CommandText(props: CommandTextProps): React.JSX.Element {
  const { text, label, className } = props
  const s = useStyle('command-text', COMMAND_TEXT_CSS)
  const ref = useRef<HTMLSpanElement>(null)
  const [overflow, setOverflow] = useState(false)
  useLayoutEffect(() => {
    const element = ref.current
    if (element === null)
      return undefined
    const measure = (): void => {
      setOverflow(element.scrollWidth > element.clientWidth)
    }
    measure()
    const observer = typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(measure)
    observer?.observe(element)
    // A late webfont widens the text without resizing the box on some hosts.
    const fonts: FontFaceSet | undefined = element.ownerDocument.fonts
    fonts?.addEventListener('loadingdone', measure)
    return () => {
      observer?.disconnect()
      fonts?.removeEventListener('loadingdone', measure)
    }
  }, [text])
  return (
    <span
      ref={ref}
      className={cx(s.text, className)}
      data-command-text=""
      tabIndex={overflow
        ? 0
        : undefined}
      role={overflow
        ? 'group'
        : undefined}
      aria-label={overflow
        ? label
        : undefined}
    >
      {text}
    </span>
  )
}

/** Output lines shown before the height cap collapses the middle. */
export const DEFAULT_TERMINAL_MAX_LINES = 16

/** Display copy for the terminal surface; the owner passes localized labels. */
export interface TerminalLabels {
  /** Accessible name for an overflowing authored command line, numbered from one. */
  readonly commandLine: (line: number) => string
  /** Status pill text for a signal-terminated command. */
  readonly signal: (signal: string) => string
  /** Status pill text for a non-zero exit code. */
  readonly exitCode: (exitCode: number) => string
  /** Status pill text for a command that ended without an exit code. */
  readonly noExitCode: string
  /** Run-state text while the command is still running. */
  readonly running: string
  /** Run-state text for a signal or non-zero-exit settle. */
  readonly failed: string
  /** Run-state text for a clean settle. */
  readonly done: string
  /** Copy-button idle label. */
  readonly copy: string
  /** Copy-button label during the post-copy confirmation window. */
  readonly copied: string
  /** Placeholder when a settled command produced no visible output. */
  readonly noOutput: string
  /** Collapse-toggle aria label while expanded. */
  readonly collapseAria: string
  /** Collapse-toggle text while expanded. */
  readonly collapse: string
  /** Expand-toggle aria label while capped, given the hidden line count. */
  readonly expandAria: (hidden: number) => string
  /** Expand-toggle text while capped, given the hidden line count. */
  readonly expand: (hidden: number) => string
}

/** Props for the terminal surface. */
export interface TerminalProps {
  /** The command, rendered verbatim after the prompt label. */
  readonly command: string
  /** Working directory for the prompt label; absent renders a plain $. */
  readonly cwd?: string | undefined
  /** Absolute home directory, so a cwd equal to it collapses to ~. */
  readonly home?: string | undefined
  /** The command's output text; may contain ANSI escape sequences. */
  readonly output?: string | undefined
  /** Settled exit code; a non-zero value renders the status pill. */
  readonly exitCode?: number | null | undefined
  /** Settled terminating signal name; takes precedence over the exit code. */
  readonly signal?: string | undefined
  /** The command is still running. */
  readonly running?: boolean | undefined
  /** The call launches background work; retains the command without job status or output. */
  readonly background?: boolean | undefined
  /** Height cap in output lines before the middle collapses (default 16); Infinity disables the cap. */
  readonly maxLines?: number | undefined
  /** Copy-control payload override; the control copies the raw output when absent. */
  readonly copyText?: string | undefined
  /** Draw the run-state dot and its assistive label in the card gutter (default true). */
  readonly runStateDot?: boolean | undefined
  /** Extra class merged onto the wrapper. */
  readonly className?: string | undefined
  /** Localized display copy supplied by the owning render site. */
  readonly labels: TerminalLabels
}

interface StyledSpan {
  readonly text: string
  readonly style: CSSProperties | undefined
}

interface SgrState {
  readonly fg: string
  readonly bg: string
  readonly bold: boolean
  readonly dim: boolean
  readonly italic: boolean
  readonly underline: boolean
  readonly strike: boolean
  readonly hidden: boolean
  readonly inverse: boolean
}

const SGR_NONE: SgrState = {
  fg: '',
  bg: '',
  bold: false,
  dim: false,
  italic: false,
  underline: false,
  strike: false,
  hidden: false,
  inverse: false,
}

/** The official token mapping for the 16 basic ANSI colors, keyed by rgb triple. */
const TOKEN_BY_BASIC_RGB: Record<string, string> = {
  '0,0,0': 'var(--dsw-alias-label-primary)',
  '255,255,255': 'var(--dsw-alias-label-primary)',
  '85,85,85': 'var(--dsw-alias-label-tertiary)',
  '187,0,0': 'var(--dsw-alias-state-error-primary)',
  '255,85,85': 'var(--dsw-alias-state-error-secondary)',
  '0,187,0': 'var(--dsw-alias-state-success-primary)',
  '0,255,0': 'var(--dsw-alias-state-success-secondary)',
  '187,187,0': 'var(--dsw-alias-state-warn-primary)',
  '255,255,85': 'var(--dsw-alias-state-warn-secondary)',
  '0,0,187': 'var(--dsw-alias-state-business-primary)',
  '85,85,255': 'var(--dsw-static-blue-400)',
  '0,187,187': 'var(--dsw-static-blue-600)',
  '85,255,255': 'var(--dsw-static-blue-500)',
}

const BASIC_COLORS = [
  '0,0,0',
  '187,0,0',
  '0,187,0',
  '187,187,0',
  '0,0,187',
  '187,0,187',
  '0,187,187',
  '187,187,187',
]

const BRIGHT_COLORS = [
  '85,85,85',
  '255,85,85',
  '0,255,0',
  '255,255,85',
  '85,85,255',
  '255,85,255',
  '85,255,255',
  '255,255,255',
]

/* ANSI escapes are control characters by definition; the card exists to read them. */
/* eslint-disable no-control-regex -- ANSI SGR/OSC sequences are control characters. */
const OSC_SEQUENCE = /\x1B\][^\x07\x1B]*(?:\x07|\x1B\\)?/g
const NON_CSI_ESCAPE = /\x1B(?!\[)[\x20-\x2F]*[\x30-\x7E]?/g
const INERT_CONTROL = /[\x00-\x07\x0B-\x1A\x1C-\x1F\x7F]/g
const CSI_SEQUENCE = /\x1B\[([0-9;]*)[\x20-\x2F]*([\x40-\x7E])/g
/* eslint-enable no-control-regex */

/**
 * Map a 256-color palette index to its rgb triple.
 * @param code - the palette index.
 * @returns the comma-joined rgb triple.
 */
function colorBy256(code: number): string {
  if (code < 16) {
    return (code < 8
      ? BASIC_COLORS[code]
      : BRIGHT_COLORS[code - 8]) ?? '255,255,255'
  }
  if (code >= 232) {
    const gray = 8 + (code - 232) * 10
    return `${String(gray)},${String(gray)},${String(gray)}`
  }
  const value = code - 16
  const channel = (part: number): number => part === 0
    ? 0
    : 55 + part * 40
  return `${String(channel(Math.floor(value / 36)))},${String(channel(Math.floor((value % 36) / 6)))},${String(channel(value % 6))}`
}

/** Attribute codes that switch one decoration on. */
const SGR_ON: Record<string, Partial<SgrState>> = {
  1: { bold: true },
  2: { dim: true },
  3: { italic: true },
  4: { underline: true },
  7: { inverse: true },
  8: { hidden: true },
  9: { strike: true },
}

/** Attribute codes that switch their decorations off. */
const SGR_OFF: Record<string, Partial<SgrState>> = {
  22: { bold: false, dim: false },
  23: { italic: false },
  24: { underline: false },
  27: { inverse: false },
  28: { hidden: false },
  29: { strike: false },
  39: { fg: '' },
  49: { bg: '' },
}

/**
 * Fold the 38/48 extended-color sequence.
 * @param state - state before the sequence.
 * @param codes - the sequence's parameters.
 * @param index - the offset of the 38/48 code.
 * @returns the next state and how many extra parameters it consumed.
 */
function foldExtendedColor(state: SgrState, codes: readonly string[], index: number): { readonly state: SgrState, readonly consumed: number } {
  const kind = codes[index + 1]
  const fg = codes[index] === '38'
  if (kind === '5') {
    const rgb = colorBy256(Number(codes[index + 2] ?? '0'))
    return {
      state: fg
        ? { ...state, fg: rgb }
        : { ...state, bg: rgb },
      consumed: 2,
    }
  }
  if (kind === '2') {
    const rgb = `${codes[index + 2] ?? '0'},${codes[index + 3] ?? '0'},${codes[index + 4] ?? '0'}`
    return {
      state: fg
        ? { ...state, fg: rgb }
        : { ...state, bg: rgb },
      consumed: 4,
    }
  }
  return { state, consumed: 0 }
}

/**
 * Fold one basic or bright color code.
 * @param state - state before the code.
 * @param numeric - the numeric code.
 * @returns the next state, or undefined when the code is no color.
 */
function foldBasicColor(state: SgrState, numeric: number): SgrState | undefined {
  if (numeric >= 30 && numeric <= 37)
    return { ...state, fg: BASIC_COLORS[numeric - 30] ?? '' }
  if (numeric >= 90 && numeric <= 97)
    return { ...state, fg: BRIGHT_COLORS[numeric - 90] ?? '' }
  if (numeric >= 40 && numeric <= 47)
    return { ...state, bg: BASIC_COLORS[numeric - 40] ?? '' }
  if (numeric >= 100 && numeric <= 107)
    return { ...state, bg: BRIGHT_COLORS[numeric - 100] ?? '' }
  return undefined
}

/**
 * Fold one SGR parameter string into the state it leaves in force.
 * @param state - state in force before the sequence.
 * @param params - the sequence's raw parameter string.
 * @returns the state the sequence leaves in force.
 */
function foldSgr(state: SgrState, params: string): SgrState {
  const codes = params === ''
    ? ['0']
    : params.split(';')
  let next = state
  for (let index = 0; index < codes.length; index += 1) {
    const code = codes[index]
    if (code === '' || code === '0') {
      next = SGR_NONE
      continue
    }
    if (code === '38' || code === '48') {
      const folded = foldExtendedColor(next, codes, index)
      next = folded.state
      index += folded.consumed
      continue
    }
    const on = SGR_ON[code]
    const off = SGR_OFF[code]
    if (on !== undefined) {
      next = {
        ...next,
        ...on,
      }
      continue
    }
    if (off !== undefined) {
      next = {
        ...next,
        ...off,
      }
      continue
    }
    next = foldBasicColor(next, Number(code)) ?? next
  }
  return next
}

function resolveStyle(state: SgrState): CSSProperties | undefined {
  const fg = state.inverse ? state.bg : state.fg
  const bg = state.inverse ? state.fg : state.bg
  const style: CSSProperties = {}
  if (bg !== '')
    style.backgroundColor = `rgb(${bg})`
  if (fg !== '') {
    const literal = `rgb(${fg})`
    style.color = bg === ''
      ? TOKEN_BY_BASIC_RGB[fg.replace(/\s+/g, '')] ?? literal
      : literal
  }
  if (state.bold)
    style.fontWeight = 700
  if (state.dim)
    style.opacity = 0.7
  if (state.italic)
    style.fontStyle = 'italic'
  if (state.underline)
    style.textDecoration = 'underline'
  if (state.strike)
    style.textDecoration = 'line-through'
  if (state.hidden)
    style.visibility = 'hidden'
  return Object.keys(style).length === 0
    ? undefined
    : style
}

/**
 * Parse ANSI SGR output into styled runs grouped by line.
 *
 * The official parser replays carriage-return and backspace cursor movements
 * before styling; this refork keeps the SGR colors/decorations and drops
 * non-SGR control sequences instead (see the component report for the known
 * deviation).
 * @param text - raw command output.
 * @returns one entry per output line (always at least one, possibly empty).
 */
export function parseAnsiLines(text: string): StyledSpan[][] {
  const clean = text.replace(OSC_SEQUENCE, '').replace(NON_CSI_ESCAPE, '').replace(INERT_CONTROL, '')
  const lines: StyledSpan[][] = []
  let state = SGR_NONE
  for (const rawLine of clean.split('\n')) {
    const spans: StyledSpan[] = []
    let cursor = 0
    for (const match of rawLine.matchAll(CSI_SEQUENCE)) {
      const index = match.index ?? 0
      const chunk = rawLine.slice(cursor, index)
      if (chunk !== '') {
        spans.push({
          text: chunk,
          style: resolveStyle(state),
        })
      }
      cursor = index + match[0].length
      if (match[2] === 'm')
        state = foldSgr(state, match[1])
    }
    const rest = rawLine.slice(cursor)
    if (rest !== '') {
      spans.push({
        text: rest,
        style: resolveStyle(state),
      })
    }
    lines.push(spans)
  }
  return lines
}

/**
 * Prompt label for a working directory: ~ for the home directory itself,
 * otherwise the path's last segment (both separators accepted).
 * @param cwd - the working directory path.
 * @param home - absolute home directory, when the caller knows it.
 * @returns the prompt label.
 */
function promptLabel(cwd: string, home: string | undefined): string {
  const trimmed = cwd.replace(/[/\\]+$/, '')
  if (home !== undefined && trimmed === home.replace(/[/\\]+$/, ''))
    return '~'
  const segment = trimmed.split(/[/\\]/).pop()
  return segment === undefined || segment === ''
    ? cwd
    : segment
}

/**
 * Status pill text for a settled command, or undefined when it settled cleanly.
 * @param exitCode - settled exit code, when known; null when it settled without one.
 * @param signal - settled terminating signal name, when known.
 * @param labels - display copy for the pill text.
 * @returns the pill text, or undefined for a clean exit.
 */
function statusText(exitCode: number | null | undefined, signal: string | undefined, labels: TerminalLabels): string | undefined {
  if (signal !== undefined)
    return labels.signal(signal)
  if (exitCode === null)
    return labels.noExitCode
  if (exitCode !== undefined && exitCode !== 0)
    return labels.exitCode(exitCode)
  return undefined
}

/**
 * Run-state indicator for the command.
 * @param running - the command has not settled.
 * @param exitCode - settled exit code, when known.
 * @param signal - settled terminating signal name, when known.
 * @param labels - display copy for the text label.
 * @returns the dot's state and its text label.
 */
function runState(running: boolean, exitCode: number | null | undefined, signal: string | undefined, labels: TerminalLabels): { state: 'ongoing' | 'error' | 'done', label: string } {
  if (running)
    return { state: 'ongoing', label: labels.running }
  if (statusText(exitCode, signal, labels) !== undefined)
    return { state: 'error', label: labels.failed }
  return { state: 'done', label: labels.done }
}

/**
 * Render a shell command as a terminal surface.
 * @returns the terminal block element.
 */
export function Terminal({
  command,
  cwd,
  home,
  output,
  exitCode,
  signal,
  running = false,
  background = false,
  maxLines = DEFAULT_TERMINAL_MAX_LINES,
  copyText,
  runStateDot = true,
  className,
  labels,
}: TerminalProps): React.JSX.Element {
  const s = useStyle('terminal', CSS)
  const text = output ?? ''
  const lines = useMemo(() => {
    const parsed = parseAnsiLines(text)
    const last = parsed[parsed.length - 1]
    return parsed.length > 1 && last !== undefined && last.every(span => span.text === '')
      ? parsed.slice(0, -1)
      : parsed
  }, [text])
  const [expanded, setExpanded] = useState(false)
  const { copied, onCopy } = useClipboardCopy(copyText ?? text)
  const onToggle = useCallback(() => {
    setExpanded(value => !value)
  }, [])
  const status = background
    ? undefined
    : statusText(exitCode, signal, labels)
  const state = runState(running, exitCode, signal, labels)
  const showState = runStateDot && (!background || running)
  const commandLines = (command.endsWith('\n')
    ? command.slice(0, -1)
    : command).split('\n')
  const empty = lines.every(line => line.every(span => span.text.trim() === ''))
  const { hidden, capped, headLines, tailLines } = headTailCap(lines.length, maxLines, expanded)
  const body = !background && (!running || !empty)
  const renderLine = (line: StyledSpan[], lineKey: number): ReactNode => (
    <div className={s.line} key={lineKey}>
      {line.map((span, spanIndex) => span.style === undefined
        ? span.text
        : <span key={spanIndex} style={span.style}>{span.text}</span>)}
    </div>
  )
  return (
    <div
      className={cx(s.block, className)}
      data-terminal=""
      data-running={running ? '' : undefined}
      data-body={body ? '' : undefined}
    >
      <div className={s.header}>
        <div className={s.prompt}>
          {showState && <span className={s.runStateLabel}>{state.label}</span>}
          {commandLines.map((line, index) => (
            <div className={s.promptLine} key={index}>
              {index === 0 && showState && <StateDot state={state.state} className={s.runState} />}
              <span className={s.cwd}>
                {index > 0 || cwd === undefined
                  ? '$'
                  : promptLabel(cwd, home)}
              </span>
              <CommandText className={s.command} text={line} label={labels.commandLine(index + 1)} />
            </div>
          ))}
        </div>
        {status !== undefined && <Pill className={s.status}>{status}</Pill>}
        {(copyText !== undefined || (!background && !running && !empty)) && (
          <button type="button" className={s.copyButton} onClick={onCopy}>
            {copied ? labels.copied : labels.copy}
          </button>
        )}
      </div>
      {body && (empty
        ? <div className={s.empty}>{labels.noOutput}</div>
        : (
            <div className={s.output}>
              {(capped
                ? lines.slice(0, headLines)
                : lines).map((line, index) => renderLine(line, index))}
              {hidden > 0 && (
                <FoldToggle
                  className={s.expand}
                  expanded={expanded}
                  hidden={hidden}
                  labels={labels}
                  onToggle={onToggle}
                />
              )}
              {capped && lines.slice(lines.length - tailLines).map((line, index) => renderLine(line, lines.length - tailLines + index))}
            </div>
          ))}
    </div>
  )
}
