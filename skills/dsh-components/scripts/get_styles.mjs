#!/usr/bin/env node
/**
 * Print the recovered official stylesheet for a package.
 *
 * This is the ground truth for any visual work: the class names and declarations
 * are exactly what the product ships, with the build hashes removed. Copy from
 * here, never retype from memory.
 *
 * Run: node get_styles.mjs <package> [component]
 *   e.g. get_styles.mjs sidebar            (every sheet of ui-sidebar)
 *        get_styles.mjs sidebar SidebarRoot (one sheet)
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
    console.error('usage: node get_styles.mjs <package> [component]')
    console.error('example: node get_styles.mjs sidebar SidebarRoot')
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

  if (pkg.css.length === 0) {
    console.error(`no stylesheets were recovered for ${pkg.name}`)
    console.error(`packages with styles: ${index.packages.filter(entry => entry.css.length).map(entry => entry.name).join(', ')}`)
    process.exit(1)
  }

  const sheets = pkg.css.filter(file => filter === undefined || fileName(file).toLowerCase().includes(filter.toLowerCase()))
  if (sheets.length === 0) {
    console.error(`no stylesheet in ${pkg.name} matches "${filter}"`)
    console.error(`sheets: ${pkg.css.map(fileName).join(', ')}`)
    process.exit(1)
  }

  const bodies = await Promise.all(sheets.map(file => readRepoFile(file)))
  for (let i = 0; i < sheets.length; i++) {
    console.log(`/* ${sheets[i]} */`)
    console.log(bodies[i].trim())
    console.log('')
  }
}
catch (error) {
  console.error(`error: ${error.message}`)
  process.exit(1)
}
