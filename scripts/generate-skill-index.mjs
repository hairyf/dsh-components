#!/usr/bin/env node
/**
 * Generate skills/dsh-components/index.json from the repository's real data.
 *
 * The skill is installed outside this repository, and raw.githubusercontent.com
 * cannot list a directory. The small index is therefore the only catalogue the
 * remote scripts get: component names and source paths, package sheet/source
 * paths, the slot catalog, and a token summary. Every path in it is a real file
 * in this repository, so the scripts can fetch exactly what a question needs.
 *
 * The index ships with the skill. Regenerate and commit it whenever components,
 * extracted sheets, slots, or tokens change.
 *
 * Run: node scripts/generate-skill-index.mjs
 */
import { Buffer } from 'node:buffer'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const COMPONENTS_DIR = join(ROOT, 'src/components')
const INDEX_FILE = join(ROOT, 'skills/dsh-components/index.json')
const MANIFEST_FILE = 'docs/reference/extracted/manifest.json'
const SLOTS_FILE = 'docs/reference/slots.json'
const STYLES_FILE = 'src/theme/styles.ts'

/** Stop with a message. */
function fail(message) {
  console.error(`error: ${message}`)
  process.exit(1)
}

/** Read a repo-relative text file, or stop with a useful message. */
function readText(rel) {
  const file = join(ROOT, rel)
  if (!existsSync(file))
    fail(`missing ${rel}; run this from a dsh-components checkout`)
  return readFileSync(file, 'utf8')
}

/** Read a repo-relative JSON file. */
function readJson(rel) {
  return JSON.parse(readText(rel))
}

/** Fail on duplicate names, which would make a lookup ambiguous. */
function assertUnique(values, label) {
  const seen = new Set()
  for (const value of values) {
    if (seen.has(value))
      fail(`duplicate ${label}: ${value}`)
    seen.add(value)
  }
}

/** Turn a kebab-case filename into its PascalCase component name. */
function pascalCase(name) {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * Pick the component a file is named for.
 *
 * Prefer the export that matches the filename. Otherwise take the first
 * PascalCase export (uppercase constants are ignored), and fall back to the
 * filename for files that export only helpers.
 */
function componentName(fileBase, source) {
  const fromFile = pascalCase(fileBase)
  const exported = [
    ...source.matchAll(/^export function ([A-Z]\w*)/gm),
    ...source.matchAll(/^export const ([A-Z]\w*)\s*=/gm),
  ]
    .map(match => match[1])
    .filter(name => /[a-z]/.test(name))
  return exported.includes(fromFile)
    ? fromFile
    : exported[0] ?? fromFile
}

/** Find the props type that belongs to the component, else the first one declared. */
function propsType(name, source) {
  const declared = [
    ...source.matchAll(/^export (?:interface|type) (\w+Props)\b/gm),
  ].map(match => match[1])
  return declared.includes(`${name}Props`)
    ? `${name}Props`
    : declared[0] ?? null
}

/**
 * Resolve the "Recovered from <package> <sheet>" note to a package-relative
 * sheet name, e.g. `primitives/Button.module.css`. Files without the note have
 * no recorded sheet and stay null rather than guessing one.
 */
function sheetName(source, packagesByFullName) {
  const note = /\bRecovered from\s+([^\n]+)/i.exec(source)
  if (!note)
    return null
  const reference = note[1].replace(/\*\/\s*$/, '').trim()
  const packageName = /@[\w.-]+\/[\w.-]+/.exec(reference)?.[0]
  const fileName = /([\w.-]+\.module\.css)/.exec(reference)?.[1]
  const pkg = packageName
    ? packagesByFullName.get(packageName)
    : null
  if (!pkg || !fileName)
    return reference
  const matches = pkg.cssFiles.filter(file => basename(file.outPath) === fileName)
  return matches.length === 1
    ? `${pkg.shortName}/${fileName}`
    : reference
}

/** Read the component tree, one entry per .tsx file. */
function readComponents(packagesByFullName) {
  if (!existsSync(COMPONENTS_DIR))
    fail('missing src/components; run this from a dsh-components checkout')
  const groups = readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    // `internal` holds helpers behind a public component, not a component.
    .filter(entry => entry.name !== 'internal')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(entry => entry.name)
    .sort()
  const components = []
  for (const group of groups) {
    const dir = join(COMPONENTS_DIR, group)
    const files = readdirSync(dir)
      .filter(file => file.endsWith('.tsx'))
      .sort()
    for (const file of files) {
      const rel = `src/components/${group}/${file}`
      const source = readText(rel)
      const base = basename(file, '.tsx')
      const name = componentName(base, source)
      components.push({
        name,
        group,
        file: rel,
        props: propsType(name, source),
        sheet: sheetName(source, packagesByFullName),
      })
    }
  }
  assertUnique(components.map(component => component.name), 'component name')
  return components
}

/** List the recovered sheets and sources for every official package. */
function readPackages(manifest) {
  const packages = manifest.packages.map(pkg => ({
    name: pkg.shortName,
    css: pkg.cssFiles.map(file => file.outPath).sort(),
    src: [
      ...new Set([
        ...pkg.srcRegions.map(file => file.outPath),
        ...(pkg.topLevel ?? []).map(file => file.outPath),
      ]),
    ].sort(),
  }))
  packages.sort((a, b) => a.name.localeCompare(b.name))
  assertUnique(packages.map(pkg => pkg.name), 'package name')
  for (const pkg of packages) {
    for (const rel of [
      ...pkg.css,
      ...pkg.src,
    ]) {
      if (!existsSync(join(ROOT, rel)))
        fail(`${pkg.name} lists a missing file: ${rel}`)
    }
  }
  return packages
}

/** Read the slot catalog, keeping only the fields an agent needs. */
function readSlots() {
  const catalog = readJson(SLOTS_FILE)
  if (catalog.slots.length !== catalog.total)
    fail(`slots.json says ${catalog.total} slots but lists ${catalog.slots.length}`)
  return catalog.slots.map(slot => ({
    key: slot.key,
    kind: slot.kind,
    contract: slot.contract,
    readers: slot.readers,
  }))
}

/** Summarise the design tokens by family; values are read on demand. */
function readTokens() {
  const styles = readText(STYLES_FILE)
  const tokens = new Map()
  for (const match of styles.matchAll(/--((?:dsw|dsh|ds)-[a-z0-9-]+)\s*:\s*([^;\n]+)/g)) {
    if (!tokens.has(match[1]))
      tokens.set(match[1], match[2].trim())
  }
  const families = new Map()
  for (const name of tokens.keys()) {
    const family = name.split('-').slice(0, 2).join('-')
    families.set(family, (families.get(family) ?? 0) + 1)
  }
  return {
    total: tokens.size,
    families: [
      ...families.entries(),
    ]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  }
}

const manifest = readJson(MANIFEST_FILE)
const packagesByFullName = new Map(manifest.packages.map(pkg => [pkg.package, pkg]))
const index = {
  generatedAt: new Date().toISOString(),
  components: readComponents(packagesByFullName),
  packages: readPackages(manifest),
  slots: readSlots(),
  tokens: readTokens(),
}

const text = `${JSON.stringify(index, null, 2)}\n`
writeFileSync(INDEX_FILE, text)
console.log(
  `wrote skills/dsh-components/index.json: ${index.components.length} components, `
  + `${index.packages.length} packages, ${index.slots.length} slots, ${index.tokens.total} tokens, `
  + `${(Buffer.byteLength(text) / 1024).toFixed(1)} KiB`,
)
