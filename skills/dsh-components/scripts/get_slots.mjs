#!/usr/bin/env node
/**
 * Print the official slot catalog, or the seats that match a query.
 *
 * A slot is a named DOM seat another plugin contributes to. The fields matter:
 * contract says whether a seat takes one occupant (single), one per key
 * (keyed), many ordered rows (list), or many registrants with one elected to
 * render (chain). readers is the host package that renders the seat.
 *
 * Run: node get_slots.mjs [query]
 *   e.g. get_slots.mjs                     (all 109)
 *        get_slots.mjs sidebar.            (one region)
 *        get_slots.mjs session.row.leading (search)
 */
import process from 'node:process'
import { readIndex, SOURCE, suggestions } from './_shared.mjs'

console.log(`# source: ${SOURCE}`)

try {
  const index = await readIndex()
  const query = process.argv[2]
  const needle = query?.toLowerCase()
  const slots = needle === undefined
    ? index.slots
    : index.slots.filter(slot =>
        slot.key.toLowerCase().includes(needle)
        || slot.readers.some(reader => reader.toLowerCase().includes(needle)),
      )

  if (slots.length === 0) {
    const near = suggestions(query, index.slots.map(slot => slot.key))
    console.error(`no slot matches "${query}"`)
    console.error(near.length
      ? `did you mean: ${near.join(', ')}`
      : 'try a shorter fragment, for example "session" or "sidebar."')
    console.error(`list all ${index.slots.length} slots with: node get_slots.mjs`)
    process.exit(1)
  }

  const width = Math.max(...slots.map(slot => slot.key.length), 'slot'.length)
  console.log(`${'slot'.padEnd(width)}  kind     contract  readers`)
  console.log('-'.repeat(width + 30))
  for (const slot of slots) {
    console.log([
      slot.key.padEnd(width),
      slot.kind.padEnd(8),
      slot.contract.padEnd(9),
      slot.readers.join(', '),
    ].join('  '))
  }
  console.log('')
  console.log(`${slots.length} of ${index.slots.length} slots. Matches the key or a reader package.`)
  console.log('Icon seats take a glyph component; content seats take arbitrary content.')
}
catch (error) {
  console.error(`error: ${error.message}`)
  process.exit(1)
}
