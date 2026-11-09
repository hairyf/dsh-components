#!/usr/bin/env node
/**
 * Print the design tokens the components are styled with.
 *
 * Every declaration in this library resolves through these variables, so a
 * colour, radius, or duration that is not a token is a bug.
 *
 * Run: node get_tokens.mjs [query]
 *   e.g. get_tokens.mjs            (summary by family)
 *        get_tokens.mjs radius     (every radius token)
 *        get_tokens.mjs alias-bg   (search)
 */
import process from 'node:process'
import { readIndex, readRepoFile, SOURCE, suggestions } from './_shared.mjs'

console.log(`# source: ${SOURCE}`)

try {
  const index = await readIndex()
  const query = process.argv[2]

  if (query === undefined) {
    console.log(`${index.tokens.total} tokens`)
    for (const family of index.tokens.families)
      console.log(`  --${family.name.padEnd(24)}${String(family.count).padStart(4)}`)
    console.log('')
    console.log('Pass a query to see values: node get_tokens.mjs radius')
  }
  else {
    const styles = await readRepoFile('src/theme/styles.ts')
    const tokens = new Map()
    for (const match of styles.matchAll(/--((?:dsw|dsh|ds)-[a-z0-9-]+)\s*:\s*([^;\n]+)/g)) {
      if (!tokens.has(match[1]))
        tokens.set(match[1], match[2].trim())
    }

    const needle = query.toLowerCase()
    const entries = [
      ...tokens.entries(),
    ].filter(([name]) => name.toLowerCase().includes(needle))
    if (entries.length === 0) {
      const near = suggestions(query, [
        ...tokens.keys(),
      ])
      console.error(`no token matches "${query}"`)
      console.error(near.length
        ? `did you mean: --${near.join(', --')}`
        : 'try a family such as "radius", "alias-bg", or "font"')
      console.error(`families: ${index.tokens.families.map(family => family.name).join(', ')}`)
      process.exit(1)
    }

    for (const [name, value] of entries)
      console.log(`--${name.padEnd(44)}${value}`)
  }
}
catch (error) {
  console.error(`error: ${error.message}`)
  process.exit(1)
}
