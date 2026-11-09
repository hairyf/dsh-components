import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

/**
 * Coverage check for the gallery.
 *
 * Two counts must agree:
 * 1. every `src/components/{atoms,blocks,shell}/*.tsx` file has one
 *    `playground/src/examples/<stem>.tsx` module;
 * 2. every PascalCase component the source files export is actually rendered by
 *    some example (as JSX), not merely imported.
 *
 * Run with `node playground/scripts/coverage.mjs`.
 */

const here = dirname(fileURLToPath(import.meta.url))
const repo = join(here, '..', '..')
const componentsRoot = join(repo, 'src', 'components')
const examplesRoot = join(here, '..', 'src', 'examples')

/**
 * Every group under src/components, discovered rather than listed, so a new
 * group is held to the same coverage rule as the original three.
 */
const GROUPS = readdirSync(componentsRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort()

/** Component-ish exports: function, const arrow, forwardRef, or class with a capital name. */
function exportedComponents(source) {
  const names = []
  const pattern = /^export\s+(?:const|function|class)\s+([A-Z]\w*)/gm
  for (const match of source.matchAll(pattern)) {
    // Constants such as DEFAULT_DIFF_MAX_LINES are upper case throughout.
    if (/^[A-Z0-9_]+$/.test(match[1]))
      continue
    names.push(match[1])
  }
  return [
    ...new Set(names),
  ]
}

/**
 * Exports that are React contexts rather than components.
 * They render nothing, so the gallery exercises them through the components
 * that read them (HoverCard's group, Tooltip's nested-suppression channel).
 */
function exportedContexts(source) {
  const names = []
  const pattern = /^export\s+const\s+([A-Z]\w*)\s*=\s*createContext/gm
  for (const match of source.matchAll(pattern))
    names.push(match[1])
  return [
    ...new Set(names),
  ]
}

const exampleSources = readdirSync(examplesRoot)
  .filter(file => file.endsWith('.tsx') && file !== 'kit.tsx')
  .map(file => ({
    file,
    source: readFileSync(join(examplesRoot, file), 'utf8'),
  }))
const allExampleSource = exampleSources.map(entry => entry.source).join('\n')
const exampleStems = new Set(exampleSources.map(entry => entry.file.replace(/\.tsx$/, '')))

const rows = []
const missing = []
const unrendered = []

for (const group of GROUPS) {
  const dir = join(componentsRoot, group)
  for (const file of readdirSync(dir).filter(name => name.endsWith('.tsx')).sort()) {
    const stem = file.replace(/\.tsx$/, '')
    const source = readFileSync(join(dir, file), 'utf8')
    const contexts = exportedContexts(source)
    const names = exportedComponents(source).filter(name => !contexts.includes(name))
    const hasExample = exampleStems.has(stem)
    if (!hasExample)
      missing.push(`${group}/${file}`)
    const rendered = names.filter((name) => {
      const jsx = new RegExp(`<${name}[\\s/>]`)
      return jsx.test(allExampleSource)
    })
    for (const name of names) {
      if (!rendered.includes(name))
        unrendered.push(`${group}/${file}#${name}`)
    }
    rows.push({
      file: `${group}/${file}`,
      example: hasExample
        ? `examples/${stem}.tsx`
        : '(missing)',
      exported: names,
      rendered,
      contexts,
    })
  }
}

const componentFiles = rows.length
const coveredFiles = rows.filter(row => row.example !== '(missing)').length
const exportedTotal = rows.reduce((total, row) => total + row.exported.length, 0)
const renderedTotal = rows.reduce((total, row) => total + row.rendered.length, 0)

for (const row of rows) {
  const status = row.example === '(missing)'
    ? 'MISSING'
    : (row.rendered.length === row.exported.length
        ? 'ok'
        : 'partial')
  const skipped = row.contexts.length > 0
    ? ` [context: ${row.contexts.join(', ')}]`
    : ''
  const detail = row.exported.length === 0
    ? '(helper only, exercised by its example)'
    : `${row.rendered.length}/${row.exported.length} ${row.rendered.join(', ') || '-'}`
  console.log(`${status.padEnd(7)} ${relative(repo, join(componentsRoot, row.file)).padEnd(46)} ${detail}${skipped}`)
}

console.log('')
console.log(`component files          ${String(componentFiles)}`)
console.log(`example modules           ${String(coveredFiles)}`)
console.log(`exported components       ${String(exportedTotal)}`)
console.log(`rendered by an example    ${String(renderedTotal)}`)
if (missing.length > 0)
  console.log(`missing examples: ${missing.join(', ')}`)
if (unrendered.length > 0)
  console.log(`not rendered: ${unrendered.join(', ')}`)

process.exitCode = missing.length === 0 && unrendered.length === 0
  ? 0
  : 1
