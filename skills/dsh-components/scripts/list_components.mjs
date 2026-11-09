#!/usr/bin/env node
/**
 * List every component this library exports.
 *
 * The table is the index an agent starts from: component name, group, the props
 * interface to read next, and the official sheet it was rebuilt from.
 *
 * Run: node list_components.mjs [group]
 */
import process from 'node:process'
import { readIndex, SOURCE } from './_shared.mjs'

console.log(`# source: ${SOURCE}`)

try {
  const index = await readIndex()
  const groups = [
    ...new Set(index.components.map(component => component.group)),
  ]
  const group = process.argv[2]?.toLowerCase()

  if (group !== undefined && !groups.includes(group)) {
    console.error('usage: node list_components.mjs [group]')
    console.error(`unknown group "${group}". groups: ${groups.join(', ')}`)
    console.error(`components: ${index.components.map(component => component.name).join(', ')}`)
    process.exit(1)
  }

  const rows = index.components.filter(component => group === undefined || component.group === group)
  const width = Math.max(...rows.map(row => row.name.length), 'component'.length)

  console.log(`${'component'.padEnd(width)}  group     props                     sheet`)
  console.log('-'.repeat(width + 51))
  for (const row of rows) {
    console.log([
      row.name.padEnd(width),
      row.group.padEnd(8),
      (row.props ?? '-').padEnd(24),
      row.sheet ?? '-',
    ].join('  '))
  }
  console.log('')
  console.log(`${rows.length} components. Read one with: node get_component.mjs <Name>`)
}
catch (error) {
  console.error(`error: ${error.message}`)
  process.exit(1)
}
