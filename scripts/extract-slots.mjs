/**
 * Recover the official DSH slot catalog from the UI prebundles.
 *
 * Registrant packages read slots with renderSlot(key, props, options); the
 * first argument is the slot key other plugins contribute to. Two further
 * forms exist and are recovered too:
 *   - renderSlotChain(key, ...) for election-style slots (one winner renders);
 *   - a dynamic seat key, where the key is a variable holding one of a small
 *     known set (the right-dock tab seats).
 * The resulting catalog is what the Puck config maps one-for-one onto zones.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PACKAGE_MAP = join(ROOT, 'docs/reference/ui-packages.json')
const OUT = join(ROOT, 'docs/reference')

/**
 * Seat keys passed through a variable rather than a literal.
 * Documented in the recovered sidebar-right TabSlot source, which renders
 * renderSlot(seat, ...) for whichever tab is active.
 */
const DYNAMIC_SEAT_KEYS = ['sidebar.right.pane.tab', 'sidebar.right.pane.tab.title']

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

const packages = JSON.parse(readFileSync(PACKAGE_MAP, 'utf8'))
/**
 * Slot key to the set of packages that READ it.
 *
 * A reader is the host component that calls renderSlot, not the plugin that
 * registers content into the slot. The two are different sets: for
 * contextMenu.icon the reader is the context-menu package, while the
 * registrants are whatever plugins contribute menu icons.
 */
const readers = new Map()
/** Slot key to its contract form. */
const contractKind = new Map()

/**
 * Note one reader of a slot.
 * @param key - the slot key.
 * @param pkg - the package short name.
 * @param form - how the slot is read.
 */
function note(key, pkg, form) {
  if (!readers.has(key))
    readers.set(key, new Set())
  readers.get(key).add(pkg)
  const current = contractKind.get(key)
  // A plain renderSlot wins over the chain form when both appear.
  if (!current || current === 'chain')
    contractKind.set(key, form)
}

for (const [name, dir] of Object.entries(packages)) {
  if (!name.startsWith('@deepseek-ai/dsh-client-ui-'))
    continue
  const shortName = name.replace('@deepseek-ai/dsh-client-ui-', '')
  for (const file of walkJs(join(dir, 'lib'))) {
    const source = readFileSync(file, 'utf8')
    for (const match of source.matchAll(/renderSlot\(\s*"([^"]+)"/g))
      note(match[1], shortName, 'single')
    for (const match of source.matchAll(/renderSlotChain\(\s*"([^"]+)"/g))
      note(match[1], shortName, 'chain')
    const usesDynamicSeat = /renderSlot\(\s*seat\b/.test(source)
    if (usesDynamicSeat) {
      for (const seatKey of DYNAMIC_SEAT_KEYS)
        note(seatKey, shortName, 'keyed')
    }
  }
}

/** Top-level region a slot key belongs to; drives the Puck zone grouping. */
function scopeOf(key) {
  if (key.startsWith('sidebar.right.'))
    return 'rightbar'
  if (key.startsWith('sidebar.'))
    return 'sidebar'
  if (key.startsWith('conversation.'))
    return 'conversation'
  if (key.startsWith('settings.'))
    return 'settings'
  if (key.startsWith('plugins.'))
    return 'plugins'
  if (key.startsWith('tool.'))
    return 'tool'
  if (key.startsWith('contextMenu.'))
    return 'contextMenu'
  if (key === 'root' || key.startsWith('shell.'))
    return 'frame'
  return 'other'
}

/**
 * Slots that accept a leaf glyph rather than arbitrary content.
 * These are the seats an Icon* component drops into. A tab title is a text
 * label rather than a glyph, so it is excluded.
 */
const ICON_SLOT = /(?:\.|^)(?:icon|mark|glyph|leading|trailing|corner|badge|launcher|trigger)$/

const catalog = [
  ...readers.entries(),
]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([key, pkgs]) => ({
    key,
    scope: scopeOf(key),
    kind: ICON_SLOT.test(key)
      ? 'icon'
      : 'content',
    contract: contractKind.get(key) ?? 'single',
    readers: [...pkgs].sort(),
  }))

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'slots.json'), `${JSON.stringify({ total: catalog.length, slots: catalog }, null, 2)}\n`)

const byScope = {}
for (const slot of catalog)
  byScope[slot.scope] = (byScope[slot.scope] ?? 0) + 1
console.log('total slots:', catalog.length)
console.log('icon slots:', catalog.filter(s => s.kind === 'icon').length)
console.log('chain slots:', catalog.filter(s => s.contract === 'chain').length)
for (const [scope, count] of Object.entries(byScope).sort((a, b) => b[1] - a[1]))
  console.log(`  ${scope}: ${count}`)
