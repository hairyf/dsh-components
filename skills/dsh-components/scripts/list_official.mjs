#!/usr/bin/env node
/**
 * List the official DSH primitives this package re-exports.
 *
 * The component tree is only half the surface. The other half is the official
 * bundle: 194 `Icon*` glyphs plus the utilities and types the library passes
 * through unchanged, because it does not refork them. An agent that needs an
 * icon, `writeClipboard`, or a settings-form helper looks here, not in the
 * component list.
 *
 * Run: node list_official.mjs [query]
 *   node list_official.mjs                 everything, grouped
 *   node list_official.mjs icon            every icon glyph
 *   node list_official.mjs chevron         icon names containing "chevron"
 *   node list_official.mjs form            any official name containing "form"
 */
import process from 'node:process'
import { readIndex, SOURCE, suggestions } from './_shared.mjs'

console.log(`# source: ${SOURCE}`)

try {
  const index = await readIndex()
  const official = index.official
  if (official === undefined) {
    console.error('the index predates official-surface support; regenerate it with pnpm gen')
    process.exit(1)
  }

  const query = process.argv[2]?.toLowerCase()
  const all = [
    ...official.values,
    ...official.types,
  ]
  const matched = query === undefined
    ? all
    : all.filter(entry => entry.name.toLowerCase().includes(query))

  if (matched.length === 0) {
    console.error(`no official export matches "${process.argv[2]}"`)
    const near = suggestions(process.argv[2], all.map(entry => entry.name))
    if (near.length > 0)
      console.error(`did you mean: ${near.join(', ')}`)
    process.exit(1)
  }

  const values = matched.filter(entry => entry.kind !== 'type' && !official.types.some(type => type.name === entry.name))
  const types = matched.filter(entry => official.types.some(type => type.name === entry.name))
  const icons = values.filter(entry => entry.kind === 'icon')
  const utilities = values.filter(entry => entry.kind === 'utility')

  /** Print one alphabetical column list. */
  const block = (title, entries) => {
    if (entries.length === 0)
      return
    console.log('')
    console.log(`${title} (${entries.length})`)
    const names = entries.map(entry => entry.name).sort()
    const width = Math.max(...names.map(name => name.length)) + 2
    const perRow = Math.max(1, Math.floor(96 / width))
    for (let i = 0; i < names.length; i += perRow)
      console.log(`  ${names.slice(i, i + perRow).map(name => name.padEnd(width)).join('').trimEnd()}`)
  }

  block('icons', icons)
  block('utilities and components', utilities)
  block('types', types)

  console.log('')
  console.log(`${matched.length} of ${all.length} official exports `
    + `(${official.counts.icons} icons, ${official.counts.forked} names reforked here).`)
  console.log('These come from @deepseek-ai/dsh-client-ui-primitives and are re-exported unchanged.')
  console.log('A name this library reforks is imported from dsh-components as usual; it is not listed twice.')
}
catch (error) {
  console.error(`error: ${error.message}`)
  process.exit(1)
}
