#!/usr/bin/env node
/**
 * List the official sheets this library does not reproduce.
 *
 * The component list answers "what can I use". This answers the other question:
 * "the product shows something, and I need that exact look". Every official
 * module stylesheet is accounted for in docs/reference/component-map.json, either
 * as a sheet behind a component or as one with no generic equivalent yet. The
 * second list is not a bug, it is the boundary, and an agent should know where it
 * is before inventing a style.
 *
 * Run: node list_unreproduced.mjs [package]
 *   node list_unreproduced.mjs            all packages with a gap
 *   node list_unreproduced.mjs chat       the gap inside one package
 */
import process from 'node:process'
import { readIndex, readJson, SOURCE } from './_shared.mjs'

console.log(`# source: ${SOURCE}`)

try {
  const [index, map] = await Promise.all([
    readIndex(),
    readJson('docs/reference/component-map.json'),
  ])

  const byPackage = new Map()
  for (const key of map.unreproduced) {
    const [pkg, file] = key.split('/')
    const sheet = file.replace(/\.module\.css$/, '')
    if (!byPackage.has(pkg))
      byPackage.set(pkg, [])
    byPackage.get(pkg).push(sheet)
  }

  const wanted = process.argv[2]?.toLowerCase()
  const packages = [
    ...byPackage.keys(),
  ].sort()

  if (wanted !== undefined && !packages.includes(wanted)) {
    console.error(`no gap in package "${wanted}"`)
    console.error(`packages with a gap: ${packages.join(', ')}`)
    process.exit(1)
  }

  const selected = wanted === undefined
    ? packages
    : [wanted]
  for (const pkg of selected) {
    const sheets = byPackage.get(pkg).sort()
    console.log('')
    console.log(`${pkg} (${sheets.length} unreproduced)`)
    for (const sheet of sheets)
      console.log(`  ${sheet}`)
  }

  if (wanted === undefined) {
    console.log('')
    console.log(`${map.counts.reproduced} of ${map.counts.officialSheets} official sheets are behind a component; `
      + `${map.counts.unreproduced} are not.`)
    console.log('For a sheet in this list, read its CSS with: node get_styles.mjs <package> <Component>')
    console.log('The styles are still the official ones; only the component wrapper is missing.')
    console.log(`Components available: ${index.components.length} (node list_components.mjs)`)
  }
}
catch (error) {
  console.error(`error: ${error.message}`)
  process.exit(1)
}
