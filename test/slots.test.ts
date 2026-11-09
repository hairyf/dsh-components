import { describe, expect, it } from 'vitest'
import {
  DSH_ICON_SLOTS,
  DSH_SLOT_KEYS,
  DSH_SLOTS,
  DSH_SLOTS_BY_SCOPE,
  getDshSlot,
  isIconSlot,
} from '../src/slots'

describe('slot catalog', () => {
  it('carries the full official catalog', () => {
    // 103 slots read through a literal renderSlot call, plus 6 more recovered
    // from renderSlotChain and the dynamic right-dock seat keys.
    expect(DSH_SLOT_KEYS).toHaveLength(109)
    expect(new Set(DSH_SLOT_KEYS).size).toBe(109)
  })

  it('every scope group only lists keys that exist', () => {
    for (const keys of Object.values(DSH_SLOTS_BY_SCOPE)) {
      for (const key of keys)
        expect(DSH_SLOT_KEYS).toContain(key)
    }
  })

  it('classifies icon slots by key shape', () => {
    expect(DSH_ICON_SLOTS).toHaveLength(13)
    expect(isIconSlot('sidebar.session.row.leading')).toBe(true)
    expect(isIconSlot('sidebar.brand.mark')).toBe(true)
    expect(isIconSlot('conversation.chat.flow')).toBe(false)
    // A tab title is a text label seat, not a glyph seat.
    expect(isIconSlot('sidebar.right.pane.tab.title')).toBe(false)
  })

  it('records which package reads a slot', () => {
    expect(getDshSlot('root').readers).toEqual(['renderer'])
    expect(getDshSlot('sidebar.session.row.leading').readers).toEqual(['workspace'])
  })

  it('records the runtime registration form', () => {
    expect(getDshSlot('root').contract).toBe('single')
    expect(getDshSlot('conversation.composer').contract).toBe('chain')
    expect(getDshSlot('shell.quota-notice').contract).toBe('chain')
    expect(getDshSlot('sidebar.right.pane.tab').contract).toBe('keyed')
  })

  it('gives every slot a scope that matches a known group', () => {
    for (const key of DSH_SLOT_KEYS) {
      const slot = DSH_SLOTS[key]
      expect(Object.keys(DSH_SLOTS_BY_SCOPE)).toContain(slot.scope)
      expect(slot.readers.length).toBeGreaterThan(0)
    }
  })
})
