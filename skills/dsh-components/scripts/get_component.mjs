#!/usr/bin/env node
/**
 * Print one component's full source.
 *
 * The source is the documentation: it carries the recovered official stylesheet
 * verbatim, the props interface, and the DOM structure. Read it before writing
 * anything that has to match the real interface.
 *
 * Run: node get_component.mjs <Name>
 */
import process from 'node:process'
import { readIndex, readRepoFile, SOURCE, suggestions } from './_shared.mjs'

console.log(`# source: ${SOURCE}`)

/** Compare names without case, hyphens, underscores, or spaces. */
function normalize(name) {
  return name.toLowerCase().replaceAll('-', '').replaceAll('_', '').replaceAll(' ', '')
}

try {
  const index = await readIndex()
  const wanted = process.argv[2]

  if (!wanted) {
    console.error('usage: node get_component.mjs <Name>')
    console.error('example: node get_component.mjs Button')
    console.error(`components: ${index.components.map(component => component.name).join(', ')}`)
    process.exit(1)
  }

  const key = normalize(wanted)
  const match = index.components.find((component) => {
    const file = component.file.split('/').pop().replace('.tsx', '')
    return normalize(component.name) === key || normalize(file) === key
  })

  if (!match) {
    const near = suggestions(wanted, index.components.map(component => component.name))
    console.error(`unknown component "${wanted}"`)
    console.error('usage: node get_component.mjs <Name>')
    console.error(near.length
      ? `did you mean: ${near.join(', ')}`
      : 'list the names with: node list_components.mjs')
    process.exit(1)
  }

  const source = await readRepoFile(match.file)
  console.log(`// ${match.file}`)
  if (match.sheet)
    console.log(`// sheet: ${match.sheet}`)
  console.log(source.replace(/\n$/, ''))
}
catch (error) {
  console.error(`error: ${error.message}`)
  process.exit(1)
}
