/**
 * Recover the official locale dictionaries from the DSH prebundles.
 *
 * Each UI package inlines its zh / en dictionaries as plain object literals
 * inside a locales.js region. Those strings are the exact UI copy the product
 * renders, so a 1:1 rebuild has to read them rather than retranslate.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PACKAGE_MAP = join(ROOT, 'docs/reference/ui-packages.json')
const OUT = join(ROOT, 'docs/reference/extracted')

const SQ = String.fromCharCode(39)
const DQ = String.fromCharCode(34)
const BS = String.fromCharCode(92)

/** Walk a directory tree, yielding every .js file. */
function* walkJs(dir) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  }
  catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      yield* walkJs(full)
    else if (entry.name.endsWith('.js'))
      yield full
  }
}

const isQuote = ch => ch === DQ || ch === SQ

/**
 * Collect every flat dictionary literal assigned to a known locale name.
 * @returns a map of locale name to its key/value pairs.
 */
function readDictionaries(source) {
  const result = {}
  const decl = /const (zh|en|ja|es|fr|pt|de|ru|ko) = \{/g
  for (const match of source.matchAll(decl)) {
    const name = match[1]
    const { entries, end } = readEntries(source, match.index + match[0].length)
    void end
    if (!result[name])
      result[name] = {}
    Object.assign(result[name], entries)
  }
  return result
}

/**
 * Read one flat "key": "value" object body.
 * @param source - the bundle text.
 * @param start - index just past the opening brace.
 * @returns the entries found, and the index just past the closing brace.
 */
function readEntries(source, start) {
  const entries = {}
  let i = start
  while (i < source.length) {
    i = skipSpace(source, i)
    if (source[i] === '}' || !isQuote(source[i]))
      break
    const entry = readEntry(source, i)
    if (!entry)
      break
    entries[entry.key] = entry.value
    i = entry.next
  }
  return { entries, end: i }
}

/**
 * Read one "key": "value" pair.
 * @param source - the bundle text.
 * @param start - index of the key's opening quote.
 * @returns the pair and the index just past the value, or null when malformed.
 */
function readEntry(source, start) {
  const quote = source[start]
  const keyEnd = source.indexOf(quote, start + 1)
  if (keyEnd === -1)
    return null
  const key = source.slice(start + 1, keyEnd)
  const i = skipSpace(source, keyEnd + 1, '[\s:]')
  if (!isQuote(source[i]))
    return null
  const valueQuote = source[i]
  let j = i + 1
  let value = ''
  while (j < source.length && source[j] !== valueQuote) {
    if (source[j] === BS) {
      value += source[j + 1]
      j += 2
      continue
    }
    value += source[j]
    j += 1
  }
  return { key, value, next: j + 1 }
}

/**
 * Advance past a run of separator characters.
 * @param source - the bundle text.
 * @param start - index to start from.
 * @param includeColon - also treat a colon as a separator.
 * @returns the first index that is not a separator.
 */
function skipSpace(source, start, includeColon = false) {
  let i = start
  while (i < source.length) {
    const ch = source[i]
    const separator = ch === ','
      || ch === ' '
      || ch === '\t'
      || ch === '\r'
      || ch === '\n'
      || (includeColon && ch === ':')
    if (!separator)
      break
    i += 1
  }
  return i
}

const packages = JSON.parse(readFileSync(PACKAGE_MAP, 'utf8'))
const merged = {}
const perPackage = {}

for (const [name, dir] of Object.entries(packages)) {
  if (!name.startsWith('@deepseek-ai/dsh-client-ui-'))
    continue
  const shortName = name.replace('@deepseek-ai/dsh-client-ui-', '')
  for (const file of walkJs(join(dir, 'lib'))) {
    const source = readFileSync(file, 'utf8')
    if (!source.includes('locales.js'))
      continue
    const dicts = readDictionaries(source)
    const names = Object.keys(dicts)
    if (names.length === 0)
      continue
    perPackage[shortName] = dicts
    for (const locale of names) {
      merged[locale] ??= {}
      Object.assign(merged[locale], dicts[locale])
    }
  }
}

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'locales.json'), `${JSON.stringify(perPackage, null, 2)}\n`)
writeFileSync(join(OUT, 'locales-merged.json'), `${JSON.stringify(merged, null, 2)}\n`)
console.log('packages with dictionaries:', Object.keys(perPackage).length)
for (const locale of Object.keys(merged))
  console.log(`  ${locale}: ${Object.keys(merged[locale]).length} keys`)
