/**
 * Generate the typed slot catalog from docs/reference/slots.json.
 *
 * The JSON is itself recovered from the official prebundles by
 * scripts/extract-slots.mjs; this turns it into a module the library and the
 * playground can import with full typing.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(readFileSync(join(ROOT, 'docs/reference/slots.json'), 'utf8'))

const quote = value => JSON.stringify(value)

const entries = catalog.slots
  .map(slot => `  ${quote(slot.key)}: { scope: ${quote(slot.scope)}, kind: ${quote(slot.kind)}, contract: ${quote(slot.contract)}, readers: [${slot.readers.map(quote).join(', ')}] },`)
  .join('\n')

const iconKeys = catalog.slots
  .filter(slot => slot.kind === 'icon')
  .map(slot => `  ${quote(slot.key)},`)
  .join('\n')

const byScope = {}
for (const slot of catalog.slots) {
  byScope[slot.scope] ??= []
  byScope[slot.scope].push(slot.key)
}
const scopeEntries = Object.entries(byScope)
  .map(([scope, keys]) => `  ${quote(scope)}: [${keys.map(quote).join(', ')}],`)
  .join('\n')

const out = [
  '/**',
  ' * The official DSH slot catalog.',
  ' *',
  ' * Recovered from the UI prebundles by scripts/extract-slots.mjs and generated',
  ' * by scripts/generate-slots.mjs. Do not edit by hand.',
  ' */',
  '',
  '/** Top-level region a slot belongs to. */',
  'export type SlotScope = \'conversation\' | \'sidebar\' | \'rightbar\' | \'settings\' | \'plugins\' | \'frame\' | \'tool\' | \'contextMenu\' | \'other\'',
  '',
  '/**',
  ' * What a slot accepts.',
  ' * - icon: a leaf glyph (an Icon* component), rendered inside an existing control.',
  ' * - content: arbitrary content, rendered in a layout seat.',
  ' */',
  'export type SlotKind = \'icon\' | \'content\'',
  '',
  '/**',
  ' * Runtime registration form of a slot.',
  ' * - single: one occupant renders, a second registration shadows the first.',
  ' * - keyed: occupants are separated per key.',
  ' * - list: any number of occupants render, ordered.',
  ' * - chain: several register but exactly one is elected to render.',
  ' */',
  'export type SlotContract = \'single\' | \'keyed\' | \'list\' | \'chain\'',
  '',
  '/** One official slot and the packages that read it. */',
  'export interface DshSlot {',
  '  /** Region the slot belongs to. */',
  '  readonly scope: SlotScope',
  '  /** Leaf glyph or arbitrary content. */',
  '  readonly kind: SlotKind',
  '  /** Runtime registration form. */',
  '  readonly contract: SlotContract',
  '  /**',
  '   * Packages that call renderSlot with this key, i.e. the host components.',
  '   * Not the plugins that register content: those are a separate set.',
  '   */',
  '  readonly readers: readonly string[]',
  '}',
  '',
  '/** Every official slot key, with its metadata. */',
  'export const DSH_SLOTS = {',
  entries,
  '} as const',
  '',
  '/** Official slot key. */',
  'export type DshSlotKey = keyof typeof DSH_SLOTS',
  '',
  '/** Keys that expect a leaf glyph; the seats an Icon* component drops into. */',
  'export const DSH_ICON_SLOTS = [',
  iconKeys,
  '] as const',
  '',
  '/** A slot that accepts a leaf glyph. */',
  'export type DshIconSlotKey = (typeof DSH_ICON_SLOTS)[number]',
  '',
  '/** Slot keys grouped by region. */',
  'export const DSH_SLOTS_BY_SCOPE = {',
  scopeEntries,
  '} as const',
  '',
  '/**',
  ' * Look up a slot.',
  ' * @param key - official slot key.',
  ' */',
  'export function getDshSlot(key: DshSlotKey): DshSlot {',
  '  return DSH_SLOTS[key]',
  '}',
  '',
  '/**',
  ' * Whether a slot key expects a leaf glyph.',
  ' * @param key - slot key to test.',
  ' */',
  'export function isIconSlot(key: string): key is DshIconSlotKey {',
  '  return (DSH_ICON_SLOTS as readonly string[]).includes(key)',
  '}',
  '',
  '/** All slot keys, in catalog order. */',
  'export const DSH_SLOT_KEYS: readonly DshSlotKey[] = Object.keys(DSH_SLOTS) as DshSlotKey[]',
  '',
].join('\n')

writeFileSync(join(ROOT, 'src/slots.ts'), out)
console.log('slots:', catalog.slots.length, 'icon:', catalog.slots.filter(s => s.kind === 'icon').length)
