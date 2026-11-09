import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

/**
 * Where the skill reads its data from.
 *
 * Resolution order:
 *   1. DSH_COMPONENTS_ROOT, an explicit checkout;
 *   2. DSH_COMPONENTS_REMOTE=1, which forces the remote mode;
 *   3. a checkout found by walking up from this script;
 *   4. the GitHub repository, fetched over HTTPS.
 *
 * The skill is installed outside the repository, so a relative path from the
 * script to the repository root would be wrong. That is why the remote mode
 * exists: only files named by index.json are fetched, never a directory.
 */
export const REPO = 'hairyf/dsh-components'
export const BRANCH = 'main'

const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`
const INDEX_PATH = 'skills/dsh-components/index.json'
const FETCH_TIMEOUT_MS = 30_000
const CACHE_TTL_MS = 60 * 60 * 1000
const CACHE_DIR = join(tmpdir(), 'dsh-components-cache')
const CHECKOUT_MARKERS = ['src/components', 'docs/reference/extracted/manifest.json']
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))

/** A checkout is a directory that has both the component tree and the extracted data. */
function isCheckout(dir) {
  return CHECKOUT_MARKERS.every(marker => existsSync(join(dir, marker)))
}

/** Walk up from the script looking for the repository root. */
function findCheckout(start) {
  let dir = resolve(start)
  while (true) {
    if (isCheckout(dir))
      return dir
    const parent = dirname(dir)
    if (parent === dir)
      return null
    dir = parent
  }
}

/** Pick the data source once per process. */
function resolveMode() {
  const configuredRoot = process.env.DSH_COMPONENTS_ROOT?.trim()
  if (configuredRoot) {
    const root = resolve(configuredRoot)
    if (!isCheckout(root)) {
      throw new Error(
        `DSH_COMPONENTS_ROOT=${configuredRoot} is not a checkout: expected ${CHECKOUT_MARKERS.join(' and ')}`,
      )
    }
    return { mode: 'local', root }
  }
  if (process.env.DSH_COMPONENTS_REMOTE === '1')
    return { mode: 'remote', root: null }
  const checkout = findCheckout(SCRIPT_DIR)
  return checkout
    ? { mode: 'local', root: checkout }
    : { mode: 'remote', root: null }
}

/**
 * Resolve the mode at import time and exit cleanly on a bad configuration.
 *
 * Scripts import this module before their own try/catch runs, so a mistyped
 * DSH_COMPONENTS_ROOT would otherwise surface as an unhandled stack trace.
 */
function loadMode() {
  try {
    return resolveMode()
  }
  catch (error) {
    console.error(`error: ${error.message}`)
    console.error('hint: unset DSH_COMPONENTS_ROOT to use the checkout or the GitHub repository')
    process.exit(1)
  }
}

const CURRENT = loadMode()

/** Human-readable source for the header every script prints. */
export const SOURCE = CURRENT.mode === 'local'
  ? 'local checkout'
  : `github/${REPO}@${BRANCH}`

/** Whether this process reads the checkout on disk. */
export function isLocal() {
  return CURRENT.mode === 'local'
}

/** One cache file per repo-relative path. */
function cachePath(relPath) {
  const digest = createHash('sha256').update(relPath).digest('hex').slice(0, 16)
  return join(CACHE_DIR, `${digest}.txt`)
}

/** Return a fresh cached body, or null when it is missing or stale. */
function readCache(relPath) {
  try {
    const file = cachePath(relPath)
    if (Date.now() - statSync(file).mtimeMs > CACHE_TTL_MS)
      return null
    return readFileSync(file, 'utf8')
  }
  catch {
    // A missing or unreadable entry is a cache miss, not an error.
    return null
  }
}

/** Cache a body. A read-only temp directory must not fail the request. */
function writeCache(relPath, text) {
  try {
    mkdirSync(CACHE_DIR, { recursive: true })
    writeFileSync(cachePath(relPath), text)
  }
  catch {
    // Caching is an optimisation; the body is still usable.
  }
}

/** Fetch one file from the GitHub repository, with timeout and cache. */
async function download(relPath) {
  const url = `${RAW_BASE}/${relPath}`
  let response
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
  }
  catch (error) {
    throw new Error(`failed to fetch ${relPath}\n  url: ${url}\n  cause: ${error.message}`)
  }
  if (!response.ok) {
    throw new Error(
      `failed to fetch ${relPath}: HTTP ${response.status} ${response.statusText}\n  url: ${url}`,
    )
  }
  const text = await response.text()
  writeCache(relPath, text)
  return text
}

/**
 * Read a repo-relative text file.
 *
 * Local mode reads the checkout directly. Remote mode reads
 * raw.githubusercontent.com, with a 30s timeout, and caches the body for an
 * hour under the OS temporary directory. Failures name the URL that was tried.
 */
export async function readRepoFile(relPath) {
  if (isLocal()) {
    const full = join(CURRENT.root, relPath)
    try {
      return readFileSync(full, 'utf8')
    }
    catch (error) {
      throw new Error(`cannot read ${relPath} from local checkout ${CURRENT.root}: ${error.message}`)
    }
  }
  const cached = readCache(relPath)
  if (cached !== null)
    return cached
  return download(relPath)
}

/** Read a repo-relative JSON file. */
export async function readJson(relPath) {
  const text = await readRepoFile(relPath)
  try {
    return JSON.parse(text)
  }
  catch (error) {
    throw new Error(`invalid JSON in ${relPath} (source: ${SOURCE}): ${error.message}`)
  }
}

/** Read the generated skill index, with a hint when it is absent or unpublished. */
export async function readIndex() {
  try {
    return await readJson(INDEX_PATH)
  }
  catch (error) {
    throw new Error(
      `${error.message}\n  hint: ${INDEX_PATH} ships with the skill; regenerate it with scripts/generate-skill-index.mjs in a checkout`,
    )
  }
}

/** Levenshtein distance, used only to make "unknown name" errors useful. */
function editDistance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const above = row[j]
      const substitution = a[i - 1] === b[j - 1]
        ? 0
        : 1
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        diagonal + substitution,
      )
      diagonal = above
    }
  }
  return row[b.length]
}

/** Near names for a misspelled or partial query, best first. */
export function suggestions(query, candidates, limit = 5) {
  const needle = query.toLowerCase()
  const limitDistance = Math.max(3, Math.ceil(needle.length / 2))
  const ranked = candidates.map((value) => {
    const candidate = value.toLowerCase()
    let score = editDistance(needle, candidate)
    if (candidate === needle)
      score = -1
    else if (candidate.startsWith(needle) || needle.startsWith(candidate))
      score = Math.min(score, 1)
    else if (candidate.includes(needle))
      score = Math.min(score, 2)
    return { value, score }
  })
  ranked.sort((a, b) => a.score - b.score || a.value.localeCompare(b.value))
  return ranked
    .filter(entry => entry.score <= limitDistance)
    .slice(0, limit)
    .map(entry => entry.value)
}
