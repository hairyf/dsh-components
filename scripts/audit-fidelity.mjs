/**
 * Prove no component ships CSS the official product does not.
 *
 * Two questions matter. Coverage asks how much of a component's official sheet
 * we reproduce, and a subset is legitimate. Provenance asks whether every
 * declaration we ship exists officially, and it is the only test that catches
 * an invented style. Run: node scripts/audit-fidelity.mjs [--strict]
 */
import { readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const COMPONENTS = join(ROOT, 'src', 'components')
const EXTRACTED = join(ROOT, 'docs', 'reference', 'extracted')
const PRIMITIVES = join(ROOT, 'node_modules', '@deepseek-ai', 'dsh-client-ui-primitives', 'lib')
const STRICT = process.argv.includes('--strict')

/**
 * Declarations that cannot come from an official sheet because the official DOM
 * uses a different element. Each entry states what it adapts.
 */
const ADAPTATIONS = {
  // The official composer input is a Lexical contenteditable; the library uses a
  // textarea so the value stays controlled, and these are the UA resets Lexical
  // performed in script, which no stylesheet ever declared.
  'input-field-reset': [
    'display: block',
    'width: 100%',
    'margin: 0',
    'border: none',
    'outline: none',
    'background: 0 0',
    'resize: none',
    'overflow: hidden',
    'font: inherit',
    'color: inherit',
    'caret-color: inherit',
  ],
  // The right panel draws its chrome through the dockkit package, which is a
  // separate plugin; the shell renders a minimal equivalent row instead.
  'rightbar-chrome': [
    'flex-direction: column',
    'z-index: 5',
    'align-items: center',
    'gap: 4px',
    'padding: 6px 8px',
    'justify-content: flex-end',
    'flex: none',
    'display: flex',
    'position: absolute',
    'top: 6px',
    'right: 8px',
  ],
}

/** Walk a directory, yielding every file whose name matches. */
function* walk(dir, predicate) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  }
  catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      yield* walk(full, predicate)
    else if (predicate(entry.name))
      yield full
  }
}

/** Strip comments so prose and example braces never reach the parser. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * Normalise a selector for comparison.
 * A backslash escape in an attribute value is written once in a stylesheet but
 * twice in a template literal, so both sides drop the escape.
 * @param selector - the raw selector text.
 */
function normaliseSelector(selector) {
  return selector.replace(/\\([.:#[\]])/g, '$1')
}

/**
 * Read the declarations of one rule body.
 * @param body - the text between the rule's braces.
 */
function declarationsOf(body) {
  const out = new Set()
  for (const raw of body.split(';')) {
    const declaration = raw.replace(/\s+/g, ' ').trim()
    if (declaration)
      out.add(declaration)
  }
  return out
}

/**
 * Parse a stylesheet into flat selector/declaration pairs.
 * At-rules are flattened: a rule inside @media is keyed by its own selector,
 * because the declaration is the fact being proven.
 * @param css - the stylesheet text.
 */
function parseRules(css) {
  const rules = new Map()
  const stack = []
  let buffer = ''
  for (const ch of stripComments(css)) {
    if (ch === '{') {
      stack.push(buffer.trim())
      buffer = ''
      continue
    }
    if (ch !== '}') {
      buffer += ch
      continue
    }
    const rawSelector = [...stack].reverse().find(item => item && !item.startsWith('@'))
    if (rawSelector) {
      const selector = normaliseSelector(rawSelector)
      if (!rules.has(selector))
        rules.set(selector, new Set())
      for (const declaration of declarationsOf(buffer))
        rules.get(selector).add(declaration)
    }
    stack.pop()
    buffer = ''
  }
  return rules
}

/** Every official stylesheet on disk. */
function officialSheets() {
  return [
    ...walk(EXTRACTED, name => name.endsWith('.css')),
    ...walk(PRIMITIVES, name => name.endsWith('.module.css')),
  ].map(file => ({
    file,
    name: basename(file),
    rules: parseRules(readFileSync(file, 'utf8')),
  }))
}

/**
 * The official sheets a component says it reproduces.
 * A generic component copies a sheet under a different name, so the leading
 * `Recovered from <pkg> / <Name>.module.css` comment is the only link back.
 * @param source - the component's source text.
 * @returns module file names, e.g. `TodoPanel.module.css`.
 */
function declaredSources(source) {
  const head = source.slice(0, Math.max(0, source.search(/const \w*CSS\w* = /)))
  const names = new Set()
  for (const match of head.matchAll(/(\w+)\.module\.css/g))
    names.add(`${match[1]}.module.css`)
  return [...names]
}

/**
 * Every CSS template literal in a component module.
 * A module may embed more than one official sheet, so reading only the first
 * would attribute the rest to the wrong scope.
 * @param source - the component's source text.
 */
function embeddedSheets(source) {
  const out = []
  for (const match of source.matchAll(/(?:const|export const)\s+\w*CSS\w*\s*=\s*`/g)) {
    let index = match.index + match[0].length
    let text = ''
    while (index < source.length) {
      const ch = source[index]
      if (ch === '\\') {
        text += source[index + 1]
        index += 2
        continue
      }
      if (ch === '`')
        break
      text += ch
      index += 1
    }
    out.push(text)
  }
  return out
}

/** param-case file stem to PascalCase, for matching the official sheet name. */
function pascal(stem) {
  return stem.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')
}

/** The rightmost compound selector, used for context-dependent proof. */
function leafSelector(selector) {
  const parts = selector.split(/\s*[>+~]\s*|\s+/)
  return parts[parts.length - 1].trim()
}

const sheets = officialSheets()
const officialExact = new Map()
const officialLeaf = new Map()
for (const sheet of sheets) {
  for (const [selector, declarations] of sheet.rules) {
    if (!officialExact.has(selector))
      officialExact.set(selector, new Set())
    for (const declaration of declarations)
      officialExact.get(selector).add(declaration)
    const leaf = leafSelector(selector)
    if (leaf !== selector) {
      if (!officialLeaf.has(leaf))
        officialLeaf.set(leaf, new Set())
      for (const declaration of declarations)
        officialLeaf.get(leaf).add(declaration)
    }
  }
}

const adapted = new Set(Object.values(ADAPTATIONS).flat())
const rows = []
const invented = []
const weakened = []

for (const file of walk(COMPONENTS, name => name.endsWith('.tsx'))) {
  const source = readFileSync(file, 'utf8')
  const embedded = embeddedSheets(source)
  if (embedded.length === 0)
    continue
  const component = relative(ROOT, file).split('\\').join('/')
  const stem = basename(file, '.tsx')

  const rules = new Map()
  for (const sheetCss of embedded) {
    for (const [selector, declarations] of parseRules(sheetCss)) {
      if (!rules.has(selector))
        rules.set(selector, new Set())
      for (const declaration of declarations)
        rules.get(selector).add(declaration)
    }
  }

  let declarations = 0
  let exact = 0
  let adaptation = 0
  for (const [selector, own] of rules) {
    for (const declaration of own) {
      declarations++
      const knownExact = officialExact.get(selector)
      if (knownExact && knownExact.has(declaration)) {
        exact++
        continue
      }
      if (adapted.has(declaration)) {
        adaptation++
        continue
      }
      const knownLeaf = officialLeaf.get(selector)
      if (knownLeaf && knownLeaf.has(declaration)) {
        weakened.push({ component, selector, declaration })
        continue
      }
      invented.push({ component, selector, declaration })
    }
  }

  const declared = declaredSources(source)
  const expectedList = declared.length > 0
    ? sheets.filter(sheet => declared.includes(sheet.name))
    : sheets.filter(sheet => sheet.name === `${pascal(stem)}.module.css`)
  let coverage = null
  if (expectedList.length > 0) {
    const selectors = new Set()
    for (const sheet of expectedList) {
      for (const selector of sheet.rules.keys()) selectors.add(selector)
    }
    let covered = 0
    for (const selector of selectors) {
      if (rules.has(selector))
        covered++
    }
    coverage = Number(((covered / Math.max(selectors.size, 1)) * 100).toFixed(1))
  }

  rows.push({
    component,
    declarations,
    exact,
    adaptation,
    coverage,
  })
}

const total = rows.reduce((sum, row) => sum + row.declarations, 0)
const exactTotal = rows.reduce((sum, row) => sum + row.exact, 0)
const adaptationTotal = rows.reduce((sum, row) => sum + row.adaptation, 0)
const clean = rows.filter(row => row.exact + row.adaptation === row.declarations)

console.log(`components embedding CSS:     ${rows.length}`)
console.log(`declarations shipped:         ${total}`)
console.log(`exact official match:         ${exactTotal} (${((exactTotal / Math.max(total, 1)) * 100).toFixed(2)}%)`)
console.log(`declared element adaptations: ${adaptationTotal} (${((adaptationTotal / Math.max(total, 1)) * 100).toFixed(2)}%)`)
console.log(`components fully accounted:   ${clean.length}/${rows.length}`)

if (invented.length === 0) {
  console.log('')
  console.log('No invented declarations: every one is official or a declared adaptation.')
}
else {
  console.log('')
  console.log(`INVENTED DECLARATIONS: ${invented.length}`)
  for (const item of invented)
    console.log(`  ${item.component} | ${item.selector} | ${item.declaration}`)
}

if (weakened.length > 0) {
  console.log('')
  console.log(`Official declaration under a wider selector: ${weakened.length}`)
  for (const item of weakened.slice(0, 20))
    console.log(`  ${item.component} | ${item.selector} | ${item.declaration}`)
}

const partial = rows.filter(row => row.coverage !== null && row.coverage < 100)
console.log('')
console.log(`components embedding less than their full official sheet: ${partial.length}`)
for (const row of partial)
  console.log(`  ${row.component.padEnd(46)}${String(row.coverage).padStart(6)}%`)

if (STRICT && invented.length > 0)
  process.exitCode = 1
