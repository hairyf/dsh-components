import type { CNode, CssRenderInstance } from 'css-render'

/**
 * A single CSS rule reduced to its selector and verbatim declaration block.
 * The declaration text stays verbatim (not parsed into a map) so custom
 * properties, var() fallbacks and vendor prefixes survive untouched.
 */
interface CssPlainRule {
  kind: 'rule'
  selector: string
  body: string
}

/** An @media / @supports / @container / @layer block holding nested rules. */
interface CssNestedRule {
  kind: 'nested'
  condition: string
  children: CssRule[]
}

/** A block whose body is not made of rules (@keyframes, @font-face, @page). */
interface CssRawRule {
  kind: 'raw'
  prelude: string
  body: string
}

export type CssRule = CssPlainRule | CssNestedRule | CssRawRule

/** At-rules whose body is a list of ordinary rules rather than declarations. */
const NESTED_AT_RULES = [
  '@media',
  '@supports',
  '@container',
  '@layer',
  '@scope',
]

/** Strip CSS comments; the official stylesheets carry no comment-sensitive syntax. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * Read one brace-balanced block starting at the first "{" at or after from.
 * @returns the inner text and the index just past the matching "}".
 */
/**
 * Advance past one quoted run, honouring backslash escapes.
 * @param source - the stylesheet text.
 * @param start - index of the opening quote.
 * @returns the index of the closing quote, or the last index when unterminated.
 */
function skipQuoted(source: string, start: number): number {
  const quote = source[start]
  let i = start + 1
  while (i < source.length) {
    if (source[i] === '\\')
      i += 2
    else if (source[i] === quote)
      return i
    else
      i += 1
  }
  return source.length - 1
}

/**
 * Find the brace that closes the block opened at `open`.
 * Quoted runs are skipped so braces inside strings do not count.
 * @param source - the stylesheet text.
 * @param open - index of the opening brace.
 * @returns the index of the matching closing brace.
 */
function findBlockEnd(source: string, open: number): number {
  let depth = 0
  let i = open
  while (i < source.length) {
    const ch = source[i]
    if (ch === '"' || ch === '\'') {
      i = skipQuoted(source, i) + 1
      continue
    }
    if (ch === '{')
      depth += 1
    else if (ch === '}')
      depth -= 1
    if (depth === 0)
      return i
    i += 1
  }
  return -1
}

/**
 * Read one brace-balanced block starting at the first `{` at or after `from`.
 * @param source - the stylesheet text.
 * @param from - index to start searching from.
 * @returns the inner text and the index just past the matching `}`.
 */
function readBlock(source: string, from: number): { body: string, end: number } {
  const open = source.indexOf('{', from)
  if (open === -1)
    throw new Error(`css: expected "{" at or after index ${from}`)
  const close = findBlockEnd(source, open)
  if (close === -1)
    throw new Error('css: unbalanced braces')
  return {
    body: source.slice(open + 1, close),
    end: close + 1,
  }
}

/**
 * Parse a flat stylesheet into top-level rules.
 * Declarations inside a plain rule are preserved verbatim.
 */
export function parseCss(source: string): CssRule[] {
  const cleaned = stripComments(source)
  const rules: CssRule[] = []
  let index = 0
  while (index < cleaned.length) {
    const brace = cleaned.indexOf('{', index)
    if (brace === -1)
      break
    const prelude = cleaned.slice(index, brace).trim()
    const { body, end } = readBlock(cleaned, index)
    index = end
    if (!prelude)
      continue
    if (prelude.startsWith('@')) {
      const keyword = prelude.split(/[\s(]/, 1)[0]
      if (NESTED_AT_RULES.includes(keyword)) {
        rules.push({
          kind: 'nested',
          condition: prelude,
          children: parseCss(body),
        })
      }
      else {
        rules.push({
          kind: 'raw',
          prelude,
          body: body.trim(),
        })
      }
      continue
    }
    rules.push({
      kind: 'rule',
      selector: prelude,
      body: body.trim(),
    })
  }
  return rules
}

/** Selectors that must stay document-global even inside a scoped component sheet. */
const GLOBAL_SELECTOR = /^(?:html|body|:root|from\s|to\s|\d+%)/

/**
 * Prefix every class selector of a rule with a scope class so a component's
 * generic class names cannot collide with another component's.
 * Document-level selectors (html, body, :root) and at-rule keywords are left
 * untouched, matching how CSS Modules treats a component's own sheet.
 * @param selector - the rule's comma-separated selector list.
 * @param scope - scope class without the leading dot.
 */
export function scopeSelector(selector: string, scope: string): string {
  return selector
    .split(',')
    .map((part) => {
      const trimmed = part.trim()
      if (!trimmed || trimmed.startsWith('@') || GLOBAL_SELECTOR.test(trimmed))
        return trimmed
      if (trimmed.startsWith('&'))
        return `.${scope}${trimmed.slice(1)}`
      return `.${scope} ${trimmed}`
    })
    .filter(Boolean)
    .join(', ')
}

/**
 * Build css-render nodes for a parsed stylesheet.
 * @param cssr - the css-render instance that owns the nodes.
 * @param rules - parsed rules.
 * @param options - optional settings.
 * @param options.scope - component scope class; omit for document-level sheets.
 */
export function rulesToCssNodes(
  cssr: CssRenderInstance,
  rules: CssRule[],
  options: { scope?: string } = {},
): CNode[] {
  const { scope } = options
  return rules.map((rule) => {
    if (rule.kind === 'nested')
      return cssr.c(rule.condition, rulesToCssNodes(cssr, rule.children, options))
    if (rule.kind === 'raw')
      return cssr.c(rule.prelude, { raw: rule.body })
    const selector = scope
      ? scopeSelector(rule.selector, scope)
      : rule.selector
    return cssr.c(selector, { raw: rule.body })
  })
}
