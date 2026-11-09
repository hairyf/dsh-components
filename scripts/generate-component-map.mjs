#!/usr/bin/env node
/**
 * Build the component relation table (docs/reference/component-map.json).
 *
 * Every component here is a refork of one or more official stylesheets. When DSH
 * is upgraded, those sheets change, and the only safe way to resync is to know,
 * per file, exactly which official sheet it embeds and which package that sheet
 * came from. Reading the mapping back out of the code by hand is error-prone, so
 * it is generated from the same "Recovered from" headers the fidelity audit uses.
 *
 * The table is the contract an upgrade agent works from. Keep it in sync by
 * running this script after any change; `pnpm gen:check` fails when it is stale.
 *
 * Run: node scripts/generate-component-map.mjs [--check]
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const COMPONENTS = join(ROOT, 'src', 'components')
const EXTRACTED = join(ROOT, 'docs', 'reference', 'extracted')
const OUTPUT = join(ROOT, 'docs', 'reference', 'component-map.json')
const CHECK = process.argv.includes('--check')

/** Directories that hold helpers, not components. */
const INTERNAL = new Set(['internal'])

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

/** The CSS template literals a file embeds, with the variable each is bound to. */
function embeddedLiterals(source) {
  const out = []
  for (const match of source.matchAll(/(?:const|export const)\s+(\w+)\s*=\s*`/g)) {
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
    // A template literal is a stylesheet only if it declares something. Icon
    // paths and id fragments are also backtick strings.
    const isCss = /[a-z-]+\s*:[^;{]+;/.test(text) || /\{[^:{}]*:[^{}]*\}/.test(text)
    if (isCss)
      out.push({ name: match[1], css: text })
  }
  return out
}

/**
 * The official sheets a file declares, read from its leading comment.
 * The header is the only place that names the source, because the component's own
 * name is generic by design.
 */
function declaredSources(source) {
  const head = source.slice(0, Math.max(0, source.search(/const \w+\s*=\s*`/)))
  const out = []
  for (const match of head.matchAll(/@deepseek-ai\/([\w-]+)\s*\/\s*(\w+)\.module\.css/g))
    out.push({ package: match[1], sheet: `${match[2]}.module.css` })
  return out
}

const sheetCss = new Map()
for (const file of walk(EXTRACTED, name => name.endsWith('.module.css'))) {
  const pkg = relative(EXTRACTED, file).split(/[\\/]/)[0]
  sheetCss.set(`${pkg}/${basename(file)}`, readFileSync(file, 'utf8'))
}

const components = []
for (const file of walk(COMPONENTS, name => name.endsWith('.tsx'))) {
  const group = relative(COMPONENTS, file).split(/[\\/]/)[0]
  if (INTERNAL.has(group))
    continue
  const source = readFileSync(file, 'utf8')
  const literals = embeddedLiterals(source)
  if (literals.length === 0)
    continue
  const declared = declaredSources(source)
  const headerSheets = [
    ...source.slice(0, Math.max(0, source.search(/const \w+\s*=\s*`/))).matchAll(/(\w+)\.module\.css/g),
  ]
    .map(match => `${match[1]}.module.css`)
  const name = /export function ([A-Z]\w+)/.exec(source)?.[1]
    ?? /export const ([A-Z]\w+)\s*=/.exec(source)?.[1]
    ?? basename(file, '.tsx')

  // Match each embedded literal to the sheet it was copied from.
  // Many components embed the rules only, without the extraction header, so the
  // comparison is done on the rule body.
  // Strip comments and collapse whitespace: the difference is always the
  // provenance header, never a declaration.
  const body = text => text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim()

  /**
   * Selectors a stylesheet declares, so a subset counts as a match.
   * Walked linearly: a global regex over nested rules backtracks badly.
   */
  const selectorsOf = (text) => {
    const out = new Set()
    const cleaned = text.replace(/\/\*[\s\S]*?\*\//g, '')
    let start = 0
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] !== '{')
        continue
      const prelude = cleaned.slice(start, i).replace(/^[\s\S]*[};]/, '').trim()
      start = i + 1
      if (prelude === '' || prelude.startsWith('@'))
        continue
      for (const part of prelude.split(',')) {
        const selector = part.trim()
        if (selector !== '')
          out.add(selector)
      }
    }
    return out
  }
  const sheets = []
  const claimed = new Set()
  for (const literal of literals) {
    const ownSelectors = selectorsOf(literal.css)

    /** Share of this literal's selectors the sheet declares. */
    const overlap = (css) => {
      const sheetSelectors = selectorsOf(css)
      if (ownSelectors.size === 0)
        return 0
      let covered = 0
      for (const selector of ownSelectors) {
        if (sheetSelectors.has(selector))
          covered++
      }
      return covered / ownSelectors.size
    }

    // 1. A sheet the header names and no earlier literal already claimed.
    let hit = declared.length > 0
      ? [
          ...sheetCss.entries(),
        ].find(([key]) => declared.some(d => key.endsWith(`/${d.sheet}`)) && !claimed.has(key))
      : undefined
    // 2. The rules are the sheet, with or without its provenance header.
    hit ??= [
      ...sheetCss.entries(),
    ].find(([, css]) => body(css) === body(literal.css))
    // 3. A subset of the sheet, and the best overlap wins rather than the first.
    if (hit === undefined) {
      let best = 0
      for (const entry of sheetCss.entries()) {
        const score = overlap(entry[1])
        if (score >= 0.5 && score > best) {
          best = score
          hit = entry
        }
      }
    }
    if (hit !== undefined)
      claimed.add(hit[0])
    const declaredName = headerSheets.find(name => hit !== undefined && hit[0].endsWith(`/${name}`))
    sheets.push({
      binding: literal.name,
      bytes: literal.css.length,
      package: hit
        ? hit[0].split('/')[0]
        : null,
      sheet: hit
        ? hit[0].split('/')[1]
        : null,
      declared: declaredName ?? null,
      identical: hit !== undefined,
    })
  }

  components.push({
    name,
    group,
    file: relative(ROOT, file).split(/[\\/]/).join('/'),
    scope: /useStyle\('([^']+)'/.exec(source)?.[1] ?? null,
    declared,
    sheets,
  })
}

components.sort((a, b) => a.file.localeCompare(b.file))

// Which official sheets are still not reproduced by any component.
const usedSheets = new Set()
for (const component of components) {
  for (const sheet of component.sheets) {
    if (sheet.package !== null && sheet.sheet !== null)
      usedSheets.add(`${sheet.package}/${sheet.sheet}`)
  }
}
const unreproduced = [
  ...sheetCss.keys(),
].filter(key => !usedSheets.has(key)).sort()

const packages = {}
for (const component of components) {
  for (const sheet of component.sheets) {
    if (sheet.package === null)
      continue
    packages[sheet.package] ??= []
    if (!packages[sheet.package].includes(sheet.sheet))
      packages[sheet.package].push(sheet.sheet)
  }
}
for (const list of Object.values(packages)) list.sort()

const table = {
  generatedBy: 'scripts/generate-component-map.mjs',
  purpose: 'Which official stylesheet each component reproduces. An upgrade agent reads this to resync one component at a time.',
  counts: {
    components: components.length,
    officialSheets: sheetCss.size,
    reproduced: usedSheets.size,
    unreproduced: unreproduced.length,
  },
  components,
  packages,
  unreproduced,
}

const text = `${JSON.stringify(table, null, 2)}\n`
if (CHECK) {
  const current = existsSync(OUTPUT)
    ? readFileSync(OUTPUT, 'utf8')
    : ''
  if (current !== text) {
    console.error('component-map.json is stale; run: node scripts/generate-component-map.mjs')
    process.exit(1)
  }
  console.log(`component map is current: ${components.length} components, ${usedSheets.size}/${sheetCss.size} official sheets reproduced`)
}
else {
  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, text)
  const drift = components.filter(component => component.sheets.some(sheet => !sheet.identical))
  console.log(`wrote docs/reference/component-map.json`)
  console.log(`components: ${components.length} | official sheets: ${sheetCss.size} | reproduced: ${usedSheets.size} | not reproduced: ${unreproduced.length}`)
  if (drift.length > 0) {
    console.log(`WARNING: ${drift.length} component(s) embed CSS that no official sheet matches byte for byte:`)
    for (const component of drift)
      console.log(`  ${component.file}`)
  }
}
