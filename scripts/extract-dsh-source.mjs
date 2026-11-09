#!/usr/bin/env node
/**
 * Extract the DSH web client UI sources back out of the shipped ESM bundles.
 *
 * Every @deepseek-ai/dsh-client-ui-* bundle keeps rolldown region markers:
 *   - //#region \0dsh-css:<absolute .module.css.mjs path> ... //#endregion
 *     holds the minified CSS string and the CSS-module class map.
 *   - //#region lib/types/<path>.js ... //#endregion
 *     holds the compiled component implementation.
 *
 * Output:
 *   docs/reference/extracted/<short-name>/css/<Name>.css
 *   docs/reference/extracted/<short-name>/src/<Name>.js
 *   docs/reference/extracted/manifest.json
 *
 * Plain Node ESM, no dependencies. Run: node scripts/extract-dsh-source.mjs
 */
import { Buffer } from 'node:buffer'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const INDEX_PATH = join(repoRoot, 'docs', 'reference', 'ui-packages.json')
const OUT_ROOT = join(repoRoot, 'docs', 'reference', 'extracted')
const PACKAGE_PREFIX = '@deepseek-ai/dsh-client-ui-'
const PRIMITIVES_DIR = join(repoRoot, 'node_modules', '@deepseek-ai', 'dsh-client-ui-primitives')
// Two region shapes carry CSS: module sheets (\\0dsh-css:) and the
// document-level stylesheets a package ships as strings (\\0dsh-inline-css:).
const CSS_REGION_PREFIXES = ['\\0dsh-inline-css:', '\\0dsh-css:']
const SRC_REGION_PREFIX = 'lib/types/'
const GENERATED_NOTE = 'class hashes removed and reflowed by scripts/extract-dsh-source.mjs'

function fail(message) {
  throw new Error(message)
}

function posixPath(path) {
  return path.split(sep).join('/')
}

function relFromRoot(path) {
  return posixPath(relative(repoRoot, path))
}

function walkFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name)
    if (entry.isDirectory())
      files.push(...walkFiles(file))
    else if (entry.isFile())
      files.push(file)
  }
  return files.sort()
}

function countBy(items, keyOf) {
  const counts = new Map()
  for (const item of items) {
    const key = keyOf(item)
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return counts
}

function extensionOf(name) {
  const dot = name.lastIndexOf('.')
  return dot === -1
    ? ''
    : name.slice(dot)
}

/** Reserve a flat output name; fall back to a qualified name on collision. */
function claimName(used, preferred, fallback) {
  const name = used.has(preferred)
    ? fallback
    : preferred
  if (!used.has(name)) {
    used.add(name)
    return name
  }
  const ext = extensionOf(name)
  const stem = ext
    ? name.slice(0, -ext.length)
    : name
  let index = 2
  let candidate = `${stem}.${index}${ext}`
  while (used.has(candidate)) {
    index++
    candidate = `${stem}.${index}${ext}`
  }
  used.add(candidate)
  return candidate
}

const SIMPLE_ESCAPES = {
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
  v: '\v',
  0: '\0',
}

function decodeHexEscape(raw, index) {
  return {
    text: String.fromCharCode(Number.parseInt(raw.slice(index + 1, index + 3), 16)),
    next: index + 2,
  }
}

function decodeUnicodeEscape(raw, index) {
  if (raw[index + 1] !== '{') {
    return {
      text: String.fromCharCode(Number.parseInt(raw.slice(index + 1, index + 5), 16)),
      next: index + 4,
    }
  }
  const end = raw.indexOf('}', index + 2)
  if (end === -1)
    fail('unterminated unicode escape')
  return {
    text: String.fromCodePoint(Number.parseInt(raw.slice(index + 2, end), 16)),
    next: end,
  }
}

function decodeJsString(raw) {
  let out = ''
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (ch !== '\\') {
      out += ch
      continue
    }
    const next = raw[++i]
    if (next === 'x' || next === 'u') {
      const escape = next === 'x'
        ? decodeHexEscape(raw, i)
        : decodeUnicodeEscape(raw, i)
      out += escape.text
      i = escape.next
      continue
    }
    // A backslash-newline is a line continuation and contributes nothing; a
    // CRLF continuation consumes its LF.
    if (next === '\r' && raw[i + 1] === '\n')
      i++
    else if (next !== '\r' && next !== '\n')
      out += SIMPLE_ESCAPES[next] ?? next
  }
  return out
}

function readStringLiteral(text, start) {
  const quote = text[start]
  if (quote !== '"' && quote !== '\'')
    fail(`expected a string literal at ${start}`)
  let raw = ''
  let i = start + 1
  while (i < text.length) {
    const ch = text[i]
    if (ch === '\\') {
      raw += ch + (text[i + 1] || '')
      i += 2
      continue
    }
    if (ch === quote) {
      return {
        value: decodeJsString(raw),
        end: i + 1,
      }
    }
    raw += ch
    i++
  }
  fail('unterminated string literal')
}

/**
 * Evaluate the right-hand side of a CSS assignment. 155 files are a single
 * string literal; chat/ChatView.module.css concatenates require.asset(...)
 * for a runtime image URL.
 */
function readCssExpression(text, start) {
  let i = start
  let value = ''
  const assets = []
  while (i < text.length) {
    const ch = text[i]
    if (/\s/.test(ch)) {
      i++
      continue
    }
    if (ch === ';')
      break
    if (ch === '+') {
      i++
      continue
    }
    if (ch === '"' || ch === '\'') {
      const literal = readStringLiteral(text, i)
      value += literal.value
      i = literal.end
      continue
    }
    const asset = text.slice(i).match(/^require\.asset\s*\(\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s*\)/)
    if (asset) {
      const literal = readStringLiteral(asset[1], 0)
      value += literal.value
      assets.push(literal.value)
      i += asset[0].length
      continue
    }
    fail(`unsupported CSS expression near ${JSON.stringify(text.slice(i, i + 60))}`)
  }
  return { value, assets, end: i }
}

function isBundlePrologueLine(line) {
  const text = line.trim()
  if (!text)
    return true
  if (text.startsWith('window.__ModuleLoader__.load('))
    return true
  if (/^id: "@deepseek-ai\/[^"]+",?$/.test(text))
    return true
  if (text === 'factory: (require) => {')
    return true
  if (text === 'var module = { exports: {} };')
    return true
  if (text === 'var exports = module.exports;')
    return true
  if (text.startsWith('Object.defineProperty(exports, Symbol.toStringTag'))
    return true
  if (/^(?:let|var|const) [\w$]+ = require\("[^"]+"\);?$/.test(text))
    return true
  if (/^[\w$]+ = __toESM\(.*\);?$/.test(text))
    return true
  if (/^import .+ from ["'].+["'];?$/.test(text))
    return true
  if (text.startsWith('//# sourceMappingURL='))
    return true
  return false
}

function stripBundlePrologue(lines) {
  return lines.filter(line => !isBundlePrologueLine(line)).join('\n').trim()
}

// Single-pass character scanner: the branch count mirrors the CSS/JS grammar it
// walks, so cognitive-complexity scoring does not apply here.
// eslint-disable-next-line sonarjs/cognitive-complexity
function parseRegions(text) {
  const lines = text.split(/\r?\n/)
  const regions = []
  const orphanBlocks = []
  let current = null
  let outside = []
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    const start = line.match(/^\s*\/\/#region (.*)$/)
    if (start) {
      if (current)
        fail(`nested region at line ${index + 1}`)
      current = {
        name: start[1].trim(),
        startLine: index + 1,
        body: [],
      }
      outside = []
      continue
    }
    if (/^\s*\/\/#endregion\s*$/.test(line)) {
      if (current) {
        regions.push(current)
        current = null
      }
      else {
        const code = stripBundlePrologue(outside)
        if (code)
          orphanBlocks.push({ endLine: index + 1, code })
      }
      outside = []
      continue
    }
    if (current)
      current.body.push(line)
    else
      outside.push(line)
  }
  if (current)
    fail('unterminated region')
  return { regions, orphanBlocks }
}

function collectImports(text) {
  const firstRegion = text.search(/^\s*\/\/#region /m)
  const prefix = firstRegion === -1
    ? text
    : text.slice(0, firstRegion)
  const lines = prefix.split(/\r?\n/).map(line => line.trim())
  return [
    ...new Set(lines.filter(line => /^(?:import .+|(?:let|var|const) [\w$]+ = require\(".+"\);?|[\w$]+ = __toESM\(.+\);)$/.test(line))),
  ]
}

function parseCssRegionBody(body) {
  const text = body.join('\n')
  // Module sheets assign to css$N; document-level sheets assign to a named
  // default such as design_platform_css_default. Both are string payloads.
  const declaration = /(?:const|var|let)\s+[\w$]+\s*=\s*/.exec(text)
  if (!declaration)
    fail('no css assignment in region')
  const expression = readCssExpression(text, declaration.index + declaration[0].length)
  const mapMatch = /(?:var|const|let)\s+([\w$]+_module_css_default)\s*=\s*\{([^{}]*)\}/.exec(text)
  if (!mapMatch) {
    return {
      css: expression.value,
      assets: expression.assets,
      classMap: {},
      mapVar: null,
    }
  }
  return {
    css: expression.value,
    assets: expression.assets,
    classMap: JSON.parse(`{${mapMatch[2]}}`),
    mapVar: mapMatch[1],
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&')
}

/** CSS.escape-compatible identifier serialization (CSSOM "serialize an identifier"). */
function escapeCssIdent(value) {
  let out = ''
  for (let i = 0; i < value.length; i++) {
    const ch = value[i]
    const code = ch.charCodeAt(0)
    if (code === 0)
      out += '\uFFFD'
    else if ((code >= 1 && code <= 31) || code === 127)
      out += `\\${code.toString(16)} `
    else if (i === 0 && code >= 48 && code <= 57)
      out += `\\${code.toString(16)} `
    else if (i === 1 && code >= 48 && code <= 57 && value[0] === '-')
      out += `\\${code.toString(16)} `
    else if (code >= 128 || code === 45 || code === 95 || (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122))
      out += ch
    else
      out += `\\${ch}`
  }
  return out
}

function dehashCss(css, classMap) {
  let dehashed = 0
  let fallback = 0
  const prefixes = new Set()
  for (const [key, value] of Object.entries(classMap)) {
    if (typeof value !== 'string' || !value.endsWith(`_${key}`))
      fail(`class map entry ${key} -> ${value} does not end with _${key}`)
    prefixes.add(value.slice(0, -(key.length + 1)))
  }
  for (const prefix of prefixes) {
    const forms = new Set([
      prefix,
      escapeCssIdent(prefix),
    ])
    for (const form of forms) {
      const pattern = new RegExp(`(?<![A-Za-z0-9_-])${escapeRegExp(form)}_([A-Za-z0-9_-]+)`, 'g')
      dehashed += (css.match(pattern) || []).length
      css = css.replace(pattern, '$1')
    }
  }
  if (prefixes.size === 0) {
    const pattern = /\.(?:_?[A-Z0-9]{6,8}|-?[A-Z0-9]{6})_([\w-]+)/gi
    fallback = (css.match(pattern) || []).length
    css = css.replace(pattern, '.$1')
  }
  const leftovers = [
    ...css.matchAll(/(?<![\w-])[\w-]{5,7}_[\w-]+/g),
  ].map(match => match[0])
  return {
    css,
    dehashed: dehashed + fallback,
    fallback,
    leftovers,
  }
}

const CSS_ESCAPE_RE = /\\(?:[0-9a-f]{1,6}\s?|[^\n\r\f])/gi

function unescapeCssIdent(value) {
  return value.replace(CSS_ESCAPE_RE, (match) => {
    const body = match.slice(1)
    if (/^[0-9a-f]/i.test(body)) {
      const code = Number.parseInt(body.trim(), 16)
      return code === 0 || code > 0x10FFFF
        ? '\uFFFD'
        : String.fromCodePoint(code)
    }
    return body
  })
}

// Single-pass character scanner: the branch count mirrors the CSS/JS grammar it
// walks, so cognitive-complexity scoring does not apply here.
// eslint-disable-next-line sonarjs/cognitive-complexity
function parseStylesheet(css) {
  const root = { type: 'root', children: [] }
  const stack = [root]
  let buffer = ''
  let i = 0
  let parenDepth = 0
  const top = () => stack[stack.length - 1]
  const flushStatement = () => {
    const text = buffer.trim()
    buffer = ''
    if (!text)
      return
    top().children.push({
      type: top() === root
        ? 'statement'
        : 'decl',
      text,
    })
  }
  while (i < css.length) {
    const ch = css[i]
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      const stop = end === -1
        ? css.length
        : end + 2
      buffer += css.slice(i, stop)
      i = stop
      continue
    }
    if (ch === '"' || ch === '\'') {
      const quote = ch
      const start = i
      i++
      while (i < css.length) {
        if (css[i] === '\\') {
          i += 2
          continue
        }
        if (css[i] === quote) {
          i++
          break
        }
        i++
      }
      buffer += css.slice(start, i)
      continue
    }
    if (ch === '\\') {
      buffer += css.slice(i, i + 2)
      i += 2
      continue
    }
    if (ch === '(') {
      parenDepth++
      buffer += ch
      i++
      continue
    }
    if (ch === ')') {
      parenDepth = Math.max(0, parenDepth - 1)
      buffer += ch
      i++
      continue
    }
    if (ch === '{') {
      const node = {
        type: 'block',
        prelude: buffer.trim(),
        children: [],
      }
      buffer = ''
      parenDepth = 0
      top().children.push(node)
      stack.push(node)
      i++
      continue
    }
    if (ch === '}') {
      flushStatement()
      if (stack.length === 1)
        fail('unbalanced close brace')
      stack.pop()
      parenDepth = 0
      i++
      continue
    }
    if (ch === ';' && parenDepth === 0) {
      flushStatement()
      i++
      continue
    }
    buffer += ch
    i++
  }
  flushStatement()
  if (stack.length !== 1)
    fail('unbalanced open brace')
  return root
}

// Single-pass character scanner: the branch count mirrors the CSS/JS grammar it
// walks, so cognitive-complexity scoring does not apply here.
// eslint-disable-next-line sonarjs/cognitive-complexity
function splitTopLevel(text, separator) {
  const parts = []
  let start = 0
  let paren = 0
  let bracket = 0
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === '\\') {
      i += 2
      continue
    }
    if (ch === '"' || ch === '\'') {
      const quote = ch
      i++
      while (i < text.length) {
        if (text[i] === '\\') {
          i += 2
          continue
        }
        if (text[i] === quote) {
          i++
          break
        }
        i++
      }
      continue
    }
    if (ch === '(') {
      paren++
      i++
      continue
    }
    if (ch === ')') {
      paren = Math.max(0, paren - 1)
      i++
      continue
    }
    if (ch === '[') {
      bracket++
      i++
      continue
    }
    if (ch === ']') {
      bracket = Math.max(0, bracket - 1)
      i++
      continue
    }
    if (ch === separator && paren === 0 && bracket === 0) {
      parts.push(text.slice(start, i))
      start = i + 1
    }
    i++
  }
  parts.push(text.slice(start))
  return parts.map(part => part.trim()).filter(Boolean)
}

// Single-pass character scanner: the branch count mirrors the CSS/JS grammar it
// walks, so cognitive-complexity scoring does not apply here.
// eslint-disable-next-line sonarjs/cognitive-complexity
function formatDeclaration(text) {
  let i = 0
  let paren = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === '\\') {
      i += 2
      continue
    }
    if (ch === '"' || ch === '\'') {
      const quote = ch
      i++
      while (i < text.length) {
        if (text[i] === '\\') {
          i += 2
          continue
        }
        if (text[i] === quote) {
          i++
          break
        }
        i++
      }
      continue
    }
    if (ch === '(') {
      paren++
      i++
      continue
    }
    if (ch === ')') {
      paren = Math.max(0, paren - 1)
      i++
      continue
    }
    if (ch === ':' && paren === 0) {
      const next = text[i + 1]
      return next && next !== ' '
        ? `${text.slice(0, i + 1)} ${text.slice(i + 1)}`
        : text
    }
    i++
  }
  return text
}

function printNode(node, indent, out) {
  const pad = ' '.repeat(indent)
  if (node.type === 'decl') {
    out.push(`${pad + formatDeclaration(node.text)};`)
    return
  }
  if (node.type === 'statement') {
    out.push(`${pad + node.text};`)
    return
  }
  if (!node.prelude)
    fail('block with empty prelude')
  const preludeParts = node.prelude.startsWith('@')
    ? [node.prelude]
    : splitTopLevel(node.prelude, ',')
  out.push(`${pad + preludeParts.join(`,\n${pad}`)} {`)
  for (const child of node.children)
    printNode(child, indent + 2, out)
  out.push(`${pad}}`)
}

function beautify(css) {
  const root = parseStylesheet(css)
  const out = []
  root.children.forEach((node, index) => {
    if (index > 0)
      out.push('')
    printNode(node, 0, out)
  })
  return `${out.join('\n')}\n`
}

// Single-pass character scanner: the branch count mirrors the CSS/JS grammar it
// walks, so cognitive-complexity scoring does not apply here.
// eslint-disable-next-line sonarjs/cognitive-complexity
function checkBalanced(css) {
  let depth = 0
  let i = 0
  while (i < css.length) {
    const ch = css[i]
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1
        ? css.length
        : end + 2
      continue
    }
    if (ch === '"' || ch === '\'') {
      const quote = ch
      i++
      while (i < css.length) {
        if (css[i] === '\\') {
          i += 2
          continue
        }
        if (css[i] === quote) {
          i++
          break
        }
        i++
      }
      continue
    }
    if (ch === '\\') {
      i += 2
      continue
    }
    if (ch === '{') {
      depth++
    }
    else if (ch === '}') {
      depth--
      if (depth < 0)
        return false
    }
    i++
  }
  return depth === 0
}

function cssStats(css) {
  const root = parseStylesheet(css)
  const stats = { rules: 0, atRules: 0, declarations: 0 }
  const visit = (nodes) => {
    for (const node of nodes) {
      if (node.type === 'decl') {
        stats.declarations++
        continue
      }
      if (node.type === 'statement') {
        stats.atRules++
        continue
      }
      if (node.prelude.replace(/\/\*[\s\S]*?\*\//g, '').trim().startsWith('@'))
        stats.atRules++
      else
        stats.rules++
      visit(node.children)
    }
  }
  visit(root.children)
  return stats
}

function cssClassNames(css) {
  const names = new Set()
  for (const match of css.matchAll(/\.(-?[_a-z][\w-]*)/gi))
    names.add(unescapeCssIdent(match[1]))
  return names
}

function validateCss(css) {
  if (!checkBalanced(css))
    return 'unbalanced braces'
  try {
    parseStylesheet(css)
  }
  catch (error) {
    return error.message
  }
  return null
}

/**
 * Strip the bundler's indentation from a region body.
 *
 * Only the indentation of the first line is removed, and only from lines that
 * start with it, so nothing else moves. Bodies that contain a template literal
 * or a backslash line continuation are returned verbatim: their continuation
 * lines are string content, and shifting those would rewrite program data.
 */
function dedent(code) {
  const lines = code.replace(/\r\n/g, '\n').split('\n')
  while (lines.length && !lines[0].trim())
    lines.shift()
  while (lines.length && !lines[lines.length - 1].trim())
    lines.pop()
  const body = lines.join('\n')
  const first = lines.find(line => line.trim())
  if (!first)
    return { code: '', indentation: 'verbatim' }
  const prefix = first.match(/^[ \t]*/)[0]
  if (body.includes('`') || /\\\r?\n/.test(body))
    return { code: `${body}\n`, indentation: 'verbatim' }
  const stripped = lines.map(line => line.startsWith(prefix)
    ? line.slice(prefix.length)
    : line)
  return { code: `${stripped.join('\n')}\n`, indentation: 'stripped' }
}

function writeText(path, content) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content, 'utf8')
  return Buffer.byteLength(content, 'utf8')
}

/**
 * Read every bundle of one package and collect its CSS, code, and metadata regions.
 * @param context - the package being extracted.
 * @returns region instances grouped by bundle.
 */
function scanBundles(context) {
  const { packageDir, recordFailure } = context
  const sourceFiles = walkFiles(join(packageDir, 'lib'))
  const bundleFiles = sourceFiles.filter(file => file.endsWith('.js'))
  const physicalCssFiles = sourceFiles.filter(file => file.endsWith('.css'))
  const cssInstances = []
  const srcInstances = []
  const bundles = []

  for (const bundleFile of bundleFiles) {
    const bundlePath = posixPath(relative(packageDir, bundleFile))
    const text = readFileSync(bundleFile, 'utf8')
    let parsed
    try {
      parsed = parseRegions(text)
    }
    catch (error) {
      recordFailure('bundle-parse', `${bundlePath}: ${error.message}`)
      continue
    }
    let cssRegionCount = 0
    for (const region of parsed.regions) {
      const cssPrefix = CSS_REGION_PREFIXES.find(prefix => region.name.startsWith(prefix))
      if (cssPrefix !== undefined) {
        cssRegionCount++
        cssInstances.push({
          bundle: bundlePath,
          startLine: region.startLine,
          body: region.body,
          sourcePath: region.name.slice(cssPrefix.length).replace(/\.mjs$/, ''),
        })
      }
      else if (region.name.startsWith(SRC_REGION_PREFIX) && region.name.endsWith('.js')) {
        srcInstances.push({
          bundle: bundlePath,
          regionPath: region.name,
          startLine: region.startLine,
          body: region.body,
        })
      }
    }
    bundles.push({
      path: bundlePath,
      imports: collectImports(text),
      regionCount: parsed.regions.length,
      cssRegionCount,
      orphanBlocks: parsed.orphanBlocks,
    })
  }

  return {
    bundles,
    cssInstances,
    srcInstances,
    physicalCssFiles,
  }
}

/**
 * Turn one bundle CSS region into de-hashed, validated, reflowed CSS text.
 * @param context - the package being extracted.
 * @param instance - the CSS region instance.
 * @returns the transformed CSS, or null when the region failed validation.
 */
function transformBundleCss(context, instance) {
  const { recordFailure } = context
  const sourceBase = basename(instance.sourcePath)
  let parsedCss
  try {
    parsedCss = parseCssRegionBody(instance.body)
  }
  catch (error) {
    recordFailure('css-parse', `${instance.sourcePath}: ${error.message}`)
    return null
  }

  let dehash
  try {
    dehash = dehashCss(parsedCss.css, parsedCss.classMap)
  }
  catch (error) {
    recordFailure('css-dehash', `${instance.sourcePath}: ${error.message}`)
    return null
  }
  if (dehash.leftovers.length) {
    recordFailure('css-hash-leftover', `${sourceBase}: ${dehash.leftovers.slice(0, 5).join(', ')}`)
    return null
  }

  let pretty
  try {
    pretty = beautify(dehash.css)
  }
  catch (error) {
    recordFailure('css-beautify', `${sourceBase}: ${error.message}`)
    return null
  }

  const problem = validateCss(dehash.css) || validateCss(pretty)
  if (problem) {
    recordFailure('css-invalid', `${sourceBase}: ${problem}`)
    return null
  }

  const rawStats = cssStats(dehash.css)
  const stats = cssStats(pretty)
  if (rawStats.rules !== stats.rules || rawStats.atRules !== stats.atRules || rawStats.declarations !== stats.declarations) {
    recordFailure('css-reflow-mismatch', `${sourceBase}: ${JSON.stringify(rawStats)} -> ${JSON.stringify(stats)}`)
    return null
  }

  return { pretty, parsedCss, dehash, stats }
}

/**
 * Write one bundle CSS region and return its manifest entry.
 * @param context - the package being extracted.
 * @param instance - the CSS region instance.
 * @param used - output names already claimed in this package.
 * @returns the manifest entry, or null when the region failed.
 */
function writeBundleCss(context, instance, used) {
  const { packageName, cssOutDir, totals } = context
  const transformed = transformBundleCss(context, instance)
  if (!transformed)
    return null

  const { parsedCss, dehash, pretty, stats } = transformed
  const sourceBase = basename(instance.sourcePath)
  const outName = claimName(used, sourceBase, `${basename(dirname(instance.sourcePath))}.${sourceBase}`)
  const outPath = join(cssOutDir, outName)
  const content = `/* ${packageName} / ${sourceBase} - ${GENERATED_NOTE}. */\n${pretty}`
  const bytes = writeText(outPath, content)

  const exportedClasses = Object.keys(parsedCss.classMap)
  const classNames = cssClassNames(pretty)
  const hashPrefixes = new Set()
  for (const key of exportedClasses) {
    const value = parsedCss.classMap[key]
    if (value.endsWith(`_${key}`))
      hashPrefixes.add(value.slice(0, -(key.length + 1)))
  }

  totals.bundleCssFiles++
  totals.cssFiles++
  totals.cssBytes += bytes
  totals.cssRules += stats.rules
  totals.cssAtRules += stats.atRules
  totals.cssDeclarations += stats.declarations
  totals.dehashedTokens += dehash.dehashed
  totals.assets += parsedCss.assets.length

  return {
    sourcePath: posixPath(instance.sourcePath),
    outPath: relFromRoot(outPath),
    bytes,
    cssBytes: Buffer.byteLength(pretty, 'utf8'),
    origin: 'bundle',
    kind: 'css',
    bundle: instance.bundle,
    bundleLine: instance.startLine,
    classNameCount: classNames.size,
    exportedClassCount: exportedClasses.length,
    unusedExports: exportedClasses.filter(name => !classNames.has(name)),
    hashPrefixes: [...hashPrefixes],
    dehashedTokens: dehash.dehashed,
    regexFallback: dehash.fallback,
    assets: parsedCss.assets,
    ...stats,
  }
}

/**
 * Copy one physical lib CSS file verbatim (the primitives path).
 * @param context - the package being extracted.
 * @param file - absolute path of the CSS file.
 * @param used - output names already claimed in this package.
 * @returns the manifest entry.
 */
function writeFileCss(context, file, used) {
  const { shortName, cssOutDir, totals, recordFailure } = context
  const sourceBase = basename(file)
  const outName = claimName(used, sourceBase, `${basename(dirname(file))}.${sourceBase}`)
  const outPath = join(cssOutDir, outName)
  mkdirSync(dirname(outPath), { recursive: true })
  const buffer = readFileSync(file)
  writeFileSync(outPath, buffer)

  const raw = buffer.toString('utf8')
  const stats = checkBalanced(raw)
    ? cssStats(raw)
    : null
  if (!stats)
    recordFailure('physical-css-invalid', `${sourceBase}: unbalanced braces`)

  totals.physicalCssFiles++
  totals.cssFiles++
  totals.cssBytes += buffer.byteLength
  if (stats) {
    totals.cssRules += stats.rules
    totals.cssAtRules += stats.atRules
    totals.cssDeclarations += stats.declarations
  }

  return {
    sourcePath: posixPath(file),
    outPath: relFromRoot(outPath),
    bytes: buffer.byteLength,
    origin: 'file',
    kind: 'css',
    ...(stats || {}),
    valid: Boolean(stats),
    note: shortName === 'primitives'
      ? 'copied verbatim from the real lib module.css files (no bundle parsing)'
      : 'copied verbatim from lib css files',
  }
}

/**
 * Write every CSS file of one package.
 * @param context - the package being extracted.
 * @param cssInstances - bundle CSS regions.
 * @param physicalCssFiles - real CSS files shipped next to the bundles.
 * @returns manifest entries in output order.
 */
function writeCssEntries(context, cssInstances, physicalCssFiles) {
  const used = new Set()
  const entries = []
  const sorted = cssInstances.slice().sort((a, b) => a.sourcePath.localeCompare(b.sourcePath))
  for (const instance of sorted) {
    const entry = writeBundleCss(context, instance, used)
    if (entry)
      entries.push(entry)
  }
  for (const file of physicalCssFiles)
    entries.push(writeFileCss(context, file, used))
  return entries
}

/**
 * Group code regions by their original source path.
 * @param srcInstances - code region instances.
 * @param totals - running totals.
 * @returns groups keyed by region path.
 */
function groupSrcInstances(srcInstances, totals) {
  const groups = new Map()
  for (const instance of srcInstances) {
    const extracted = dedent(instance.body.join('\n'))
    const group = groups.get(instance.regionPath) || []
    group.push({ ...instance, code: extracted.code, indentation: extracted.indentation })
    groups.set(instance.regionPath, group)
    totals.srcRegionInstances++
  }
  return [
    ...groups.entries(),
  ].map(([regionPath, instances]) => ({ regionPath, instances }))
}

/**
 * Order the bundles of one region so lib/client.js comes first.
 * @param a - an instance.
 * @param b - another instance.
 * @returns comparison result.
 */
function compareBundles(a, b) {
  if (a.bundle === 'lib/client.js')
    return -1
  if (b.bundle === 'lib/client.js')
    return 1
  return a.bundle.localeCompare(b.bundle)
}

/**
 * Write one source region together with its cross-bundle variants.
 * @param context - the package being extracted.
 * @param group - the region group.
 * @param used - output names already claimed in this package.
 * @param baseCounts - how many groups share each basename.
 * @returns manifest entries for the region.
 */
function writeSrcGroup(context, group, used, baseCounts) {
  const { packageName, srcOutDir, totals } = context
  const ordered = group.instances.slice().sort(compareBundles)
  const primary = ordered[0]
  const base = basename(group.regionPath)
  const relativePath = group.regionPath.slice(SRC_REGION_PREFIX.length)
  const preferred = baseCounts.get(base) > 1
    ? relativePath.split('/').join('.')
    : base
  const outName = claimName(used, preferred, relativePath.split('/').join('.'))
  const outPath = join(srcOutDir, outName)
  const header = `// Extracted from ${packageName} (${primary.bundle}); region ${group.regionPath}\n`
    + '// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.\n\n'
  const bytes = writeText(outPath, header + primary.code)

  totals.srcRegionPaths++
  totals.srcRegionFiles++
  totals.srcBytes += bytes

  const entries = [
    {
      kind: 'region',
      regionPath: group.regionPath,
      bundle: primary.bundle,
      bundleLine: primary.startLine,
      outPath: relFromRoot(outPath),
      bytes,
      lines: primary.code.split('\n').length,
      indentation: primary.indentation,
      alsoIn: ordered.slice(1).filter(instance => instance.code === primary.code).map(instance => instance.bundle),
      variantOf: null,
    },
  ]

  for (const variant of ordered.slice(1).filter(instance => instance.code !== primary.code)) {
    const stem = outName.slice(0, -extensionOf(outName).length)
    const bundleStem = basename(variant.bundle).replace(/\.js$/, '')
    const variantName = claimName(used, `${stem}.${bundleStem}-bundle.js`, `${stem}.${bundleStem}-bundle.js`)
    const variantPath = join(srcOutDir, variantName)
    const variantHeader = `// Extracted from ${packageName} (${variant.bundle}); region ${group.regionPath}\n`
      + '// Cross-bundle variant: the bundler tree-shook this source file differently per entry. The lib/client.js variant is the primary file.\n'
      + '// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.\n\n'
    const variantBytes = writeText(variantPath, variantHeader + variant.code)
    totals.srcVariantFiles++
    totals.srcRegionFiles++
    totals.srcBytes += variantBytes
    entries.push({
      kind: 'region-variant',
      regionPath: group.regionPath,
      bundle: variant.bundle,
      bundleLine: variant.startLine,
      outPath: relFromRoot(variantPath),
      bytes: variantBytes,
      lines: variant.code.split('\n').length,
      indentation: variant.indentation,
      alsoIn: [],
      variantOf: relFromRoot(outPath),
    })
  }

  return entries
}

/**
 * Write every code region of one package.
 * @param context - the package being extracted.
 * @param srcInstances - code region instances.
 * @returns manifest entries plus the used-name set shared with module-level code.
 */
function writeSrcEntries(context, srcInstances) {
  const used = new Set()
  const groups = groupSrcInstances(srcInstances, context.totals)
  const baseCounts = countBy(groups, group => basename(group.regionPath))
  const entries = []
  for (const group of groups.sort((a, b) => a.regionPath.localeCompare(b.regionPath)))
    entries.push(...writeSrcGroup(context, group, used, baseCounts))
  return { entries, used }
}

/**
 * Write module-level code that sits outside every region marker.
 * @param context - the package being extracted.
 * @param bundles - scanned bundles.
 * @param used - output names already claimed in this package.
 * @returns manifest entries.
 */
function writeTopLevelEntries(context, bundles, used) {
  const { packageName, srcOutDir, totals } = context
  const entries = []
  for (const bundle of bundles) {
    for (const orphan of bundle.orphanBlocks) {
      const bundleStem = basename(bundle.path).replace(/\.js$/, '')
      const preferred = bundleStem === 'client'
        ? '_module-top.js'
        : `_module-top.${bundleStem}.js`
      const outName = claimName(used, preferred, `_module-top.${bundleStem}.js`)
      const outPath = join(srcOutDir, outName)
      const header = `// Extracted from ${packageName} (${bundle.path}); module-level code outside any region.\n`
        + '// Compiled bundle code copied verbatim from the bundle; imports are hoisted in the original bundle, so this file is not standalone.\n\n'
      const bytes = writeText(outPath, header + dedent(orphan.code).code)
      totals.topLevelFiles++
      totals.topLevelBytes += bytes
      entries.push({
        kind: 'top-level',
        bundle: bundle.path,
        bundleLine: orphan.endLine,
        outPath: relFromRoot(outPath),
        bytes,
      })
    }
  }
  return entries
}

/**
 * Describe why a package produced no bundle CSS.
 * @param shortName - package short name.
 * @param physicalCssCount - number of shipped CSS files.
 * @returns human-readable reason.
 */
function noBundleCssReason(shortName, physicalCssCount) {
  if (shortName === 'primitives')
    return `primitives: no bundle CSS regions; ${physicalCssCount} real lib module.css file(s) copied verbatim`
  if (physicalCssCount > 0)
    return `no dsh-css region in lib js bundles; ${physicalCssCount} real lib css file(s) copied verbatim`
  return 'no dsh-css region in lib js bundles and no lib css file'
}

/**
 * Build the per-package extraction context.
 * @param packageName - full package name.
 * @param packageDir - package root on disk.
 * @param totals - running totals.
 * @param failures - global failure list.
 * @returns the context object.
 */
function createContext(packageName, packageDir, totals, failures) {
  const shortName = packageName.slice(PACKAGE_PREFIX.length)
  const packageOut = join(OUT_ROOT, shortName)
  const packageFailures = []
  const recordFailure = (kind, detail) => {
    const failure = {
      package: packageName,
      shortName,
      kind,
      detail,
    }
    failures.push(failure)
    packageFailures.push(failure)
  }
  return {
    packageName,
    shortName,
    packageDir,
    packageOut,
    cssOutDir: join(packageOut, 'css'),
    srcOutDir: join(packageOut, 'src'),
    totals,
    packageFailures,
    recordFailure,
  }
}

/**
 * Name the CSS source of a package for the manifest.
 * @param hasBundleCss - whether bundle CSS regions were written.
 * @param hasFileCss - whether physical CSS files were copied.
 * @returns 'bundle', 'files', 'mixed' or 'none'.
 */
function cssSourceLabel(hasBundleCss, hasFileCss) {
  if (hasBundleCss && hasFileCss)
    return 'mixed'
  if (hasBundleCss)
    return 'bundle'
  return hasFileCss ? 'files' : 'none'
}

/**
 * Extract one package into docs/reference/extracted/<short-name>.
 * @param context - the package being extracted.
 * @returns the manifest record for the package.
 */
function extractPackage(context) {
  const { packageName, shortName, packageDir, totals, recordFailure, packageFailures } = context

  rmSync(context.packageOut, { recursive: true, force: true })

  if (!existsSync(join(packageDir, 'lib'))) {
    recordFailure('package', `missing lib directory: ${join(packageDir, 'lib')}`)
    return {
      package: packageName,
      shortName,
      packageDir: relFromRoot(packageDir),
      bundles: [],
      cssSource: 'none',
      cssFiles: [],
      srcRegions: [],
      topLevel: [],
      failures: packageFailures,
    }
  }

  const { bundles, cssInstances, srcInstances, physicalCssFiles } = scanBundles(context)
  const cssEntries = writeCssEntries(context, cssInstances, physicalCssFiles)
  const hasBundleCss = cssEntries.some(entry => entry.origin === 'bundle')
  const hasFileCss = cssEntries.some(entry => entry.origin === 'file')
  if (hasBundleCss)
    totals.packagesWithBundleCss++
  if (cssEntries.length)
    totals.packagesWithAnyCss++

  const { entries: srcEntries, used } = writeSrcEntries(context, srcInstances)
  const topLevel = writeTopLevelEntries(context, bundles, used)

  return {
    package: packageName,
    shortName,
    packageDir: relFromRoot(packageDir),
    bundles: bundles.map(bundle => ({
      path: bundle.path,
      imports: bundle.imports,
      regionCount: bundle.regionCount,
      cssRegionCount: bundle.cssRegionCount,
      topLevelBlocks: bundle.orphanBlocks.length,
    })),
    cssSource: cssSourceLabel(hasBundleCss, hasFileCss),
    cssFiles: cssEntries,
    srcRegions: srcEntries,
    topLevel,
    failures: packageFailures,
  }
}

/**
 * Resolve the package directory, preferring the unpacked primitives copy.
 * @param packageName - full package name.
 * @param index - the ui-packages.json map.
 * @returns absolute package directory.
 */
function resolvePackageDir(packageName, index) {
  if (packageName.slice(PACKAGE_PREFIX.length) === 'primitives' && existsSync(PRIMITIVES_DIR))
    return PRIMITIVES_DIR
  return index[packageName]
}

function createTotals(packageCount) {
  return {
    packageCount,
    packagesWithBundleCss: 0,
    packagesWithAnyCss: 0,
    bundleCssFiles: 0,
    physicalCssFiles: 0,
    cssFiles: 0,
    cssBytes: 0,
    cssRules: 0,
    cssAtRules: 0,
    cssDeclarations: 0,
    dehashedTokens: 0,
    srcRegionInstances: 0,
    srcRegionPaths: 0,
    srcRegionFiles: 0,
    srcVariantFiles: 0,
    srcBytes: 0,
    topLevelFiles: 0,
    topLevelBytes: 0,
    assets: 0,
  }
}

function report(totals, noBundleCssPackages, failures) {
  console.log(JSON.stringify(totals, null, 2))
  console.log('')
  console.log(`no bundle CSS (${noBundleCssPackages.length}):`)
  for (const entry of noBundleCssPackages)
    console.log(`  ${entry.shortName}: ${entry.reason}`)
  console.log('')
  if (!failures.length) {
    console.log('no failures')
    console.log('')
    console.log(`wrote ${relFromRoot(OUT_ROOT)}`)
    return
  }
  console.log(`failures (${failures.length}):`)
  for (const failure of failures)
    console.log(`  [${failure.kind}] ${failure.shortName}: ${failure.detail}`)
  process.exitCode = 1
}

function main() {
  if (!existsSync(INDEX_PATH))
    fail(`missing index: ${INDEX_PATH}`)
  if (!OUT_ROOT.startsWith(repoRoot + sep))
    fail(`refusing to clear output outside the repo: ${OUT_ROOT}`)

  const index = JSON.parse(readFileSync(INDEX_PATH, 'utf8'))
  const packageNames = Object.keys(index).filter(name => name.startsWith(PACKAGE_PREFIX)).sort()
  const failures = []
  const packages = []
  const noBundleCssPackages = []
  const totals = createTotals(packageNames.length)

  // Only the files this script owns are replaced; sibling outputs in
  // docs/reference/extracted (for example locale dumps) are left untouched.
  rmSync(join(OUT_ROOT, 'manifest.json'), { force: true })
  mkdirSync(OUT_ROOT, { recursive: true })

  for (const packageName of packageNames) {
    const context = createContext(packageName, resolvePackageDir(packageName, index), totals, failures)
    const record = extractPackage(context)
    packages.push(record)
    if (record.cssFiles.some(entry => entry.origin === 'bundle'))
      continue
    noBundleCssPackages.push({
      package: packageName,
      shortName: context.shortName,
      hasPhysicalCssFiles: record.cssFiles.some(entry => entry.origin === 'file'),
      reason: noBundleCssReason(context.shortName, record.cssFiles.filter(entry => entry.origin === 'file').length),
    })
  }

  const manifest = {
    generatedBy: 'scripts/extract-dsh-source.mjs',
    generatedAt: new Date().toISOString(),
    stats: totals,
    packages,
    noBundleCssPackages,
    failures,
  }
  writeText(join(OUT_ROOT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  report(totals, noBundleCssPackages, failures)
}

main()
