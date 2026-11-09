import { describe, expect, it } from 'vitest'
import { cx, useStyle } from '../src/lib/style'

const CSS = '.iconButton{color:red}\n@media (hover:hover){.iconButton:hover{color:blue}}'

describe('useStyle', () => {
  it('returns a class map keyed by the official class name', () => {
    const styles = useStyle('probe-a', CSS)
    expect(styles.iconButton).toBe('dshc-probe-a_iconButton')
  })

  it('keeps the map stable across calls', () => {
    const first = useStyle('probe-b', CSS)
    const second = useStyle('probe-b', CSS)
    expect(first).toBe(second)
  })

  it('namespaces different components apart', () => {
    const a = useStyle('probe-c', CSS)
    const b = useStyle('probe-d', CSS)
    expect(a.iconButton).not.toBe(b.iconButton)
  })

  it('does not rewrite at-rule keywords as classes', () => {
    const styles = useStyle('probe-e', CSS)
    expect(Object.keys(styles)).toEqual(['iconButton'])
  })
})

describe('cx', () => {
  it('joins truthy names', () => {
    expect(cx('a', false, undefined, 'b', null)).toBe('a b')
  })
})
