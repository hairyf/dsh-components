#!/usr/bin/env node
/**
 * List the official UI packages and how much of each was recovered.
 *
 * Use it to find where a piece of the interface lives before reading its source
 * or stylesheet.
 *
 * Run: node list_packages.mjs [filter]
 */
import process from 'node:process'
import { readIndex, SOURCE, suggestions } from './_shared.mjs'

console.log(`# source: ${SOURCE}`)

try {
  const index = await readIndex()
  const filter = process.argv[2]
  const packages = index.packages.filter(pkg =>
    filter === undefined || pkg.name.toLowerCase().includes(filter.toLowerCase()),
  )

  if (packages.length === 0) {
    const near = suggestions(filter, index.packages.map(pkg => pkg.name))
    console.error(`no package matches "${filter}"`)
    console.error(near.length
      ? `did you mean: ${near.join(', ')}`
      : 'list every package with: node list_packages.mjs')
    process.exit(1)
  }

  const width = Math.max(...packages.map(pkg => pkg.name.length), 'package'.length)
  console.log(`${'package'.padEnd(width)}   css  source`)
  console.log('-'.repeat(width + 12))
  for (const pkg of packages) {
    console.log([
      pkg.name.padEnd(width),
      String(pkg.css.length).padStart(3),
      String(pkg.src.length).padStart(6),
    ].join('  '))
  }
  console.log('')
  console.log(`${packages.length} packages. Read one with: node get_styles.mjs <package>`)
}
catch (error) {
  console.error(`error: ${error.message}`)
  process.exit(1)
}
