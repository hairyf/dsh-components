#!/usr/bin/env node
/**
 * Print the recovered official component source.
 *
 * The prebundles keep their original module regions, so this is the real
 * implementation the product runs, not a summary. Use it to see the DOM order,
 * the slot positions, and the state the component owns.
 *
 * Run: node get_source.mjs <package> [component]
 *   e.g. get_source.mjs sidebar SidebarRoot
 */
import process from 'node:process'
import { readIndex, readRepoFile, SOURCE, suggestions } from './_shared.mjs'

console.log(`# source: ${SOURCE}`)

/** Basename of a repo-relative path; index paths use forward slashes. */
function fileName(file) {
  return file.split('/').pop()
}

try {
  const index = await readIndex()
  const wanted = process.argv[2]
  const filter = process.argv[3]

  if (!wanted) {
    console.error('usage: node get_source.mjs <package> [component]')
    console.error('example: node get_source.mjs conversation Composer')
    console.error(`packages: ${index.packages.map(pkg => pkg.name).join(', ')}`)
    process.exit(1)
  }

  const pkg = index.packages.find(entry => entry.name.toLowerCase() === wanted.toLowerCase())
  if (!pkg) {
    const near = suggestions(wanted, index.packages.map(entry => entry.name))
    console.error(`unknown package "${wanted}"`)
    console.error(near.length
      ? `did you mean: ${near.join(', ')}`
      : 'list the packages with: node list_packages.mjs')
    process.exit(1)
  }

  if (pkg.src.length === 0) {
    console.error(`no source was recovered for ${pkg.name}`)
    console.error(`packages with source: ${index.packages.filter(entry => entry.src.length).map(entry => entry.name).join(', ')}`)
    process.exit(1)
  }

  const files = pkg.src.filter(file => filter === undefined || fileName(file).toLowerCase().includes(filter.toLowerCase()))
  if (files.length === 0) {
    console.error(`no source file in ${pkg.name} matches "${filter}"`)
    console.error(`files: ${pkg.src.map(fileName).join(', ')}`)
    process.exit(1)
  }

  const bodies = await Promise.all(files.map(file => readRepoFile(file)))
  for (let i = 0; i < files.length; i++) {
    console.log(`// ${files[i]}`)
    console.log(bodies[i].trim())
    console.log('')
  }
}
catch (error) {
  console.error(`error: ${error.message}`)
  process.exit(1)
}
