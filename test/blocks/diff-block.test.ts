import { DEFAULT_DIFF_MAX_LINES, diffTotals } from '@deepseek-ai/dsh-client-ui-primitives'
import { describe, expect, it } from 'vitest'

const PATH = 'src/app.tsx'

describe('diffTotals', () => {
  it('counts one added and one removed line for a replacement', () => {
    const totals = diffTotals([
      { path: PATH, oldText: 'a\n', newText: 'b\n' },
    ])
    expect(totals).toEqual({ added: 1, removed: 1 })
  })

  it('excludes shared context lines', () => {
    const totals = diffTotals([
      {
        path: PATH,
        oldText: 'one\ntwo\nthree\nfour\n',
        newText: 'one\ntwo\nTHREE\nfour\n',
      },
    ])
    expect(totals).toEqual({ added: 1, removed: 1 })
  })

  it('treats a missing old side as a creation', () => {
    expect(diffTotals([
      { path: PATH, oldText: null, newText: 'a\nb\n' },
    ])).toEqual({ added: 2, removed: 0 })
  })

  it('treats empty new text as a full deletion', () => {
    expect(diffTotals([
      { path: PATH, oldText: 'a\nb\n', newText: '' },
    ])).toEqual({ added: 0, removed: 2 })
  })

  it('applies the terminator rule: a single trailing newline is not a line', () => {
    expect(diffTotals([
      { path: PATH, oldText: 'a', newText: 'a\n' },
    ])).toEqual({ added: 0, removed: 0 })
  })

  it('keeps an interior blank line as a real line', () => {
    // 'a\n\n' terminates one text line and then carries a genuine blank line.
    expect(diffTotals([
      { path: PATH, oldText: '', newText: 'a\n\n' },
    ])).toEqual({ added: 2, removed: 0 })
  })

  it('sums across several files', () => {
    const totals = diffTotals([
      { path: 'a.ts', oldText: 'x\n', newText: 'y\n' },
      { path: 'b.ts', oldText: null, newText: 'z\n' },
    ])
    expect(totals).toEqual({ added: 2, removed: 1 })
  })

  it('counts both complete fragments once the edit distance exceeds the limit', () => {
    const before = Array.from({ length: 300 }, (_, index) => `old-${String(index)}`).join('\n')
    const after = Array.from({ length: 300 }, (_, index) => `new-${String(index)}`).join('\n')
    expect(diffTotals([
      { path: PATH, oldText: before, newText: after },
    ])).toEqual({ added: 300, removed: 300 })
  })

  it('returns zero totals for unchanged text', () => {
    expect(diffTotals([
      { path: PATH, oldText: 'same\nlines\n', newText: 'same\nlines\n' },
    ])).toEqual({ added: 0, removed: 0 })
  })

  it('is empty for no hunks', () => {
    expect(diffTotals([])).toEqual({ added: 0, removed: 0 })
  })
})

describe('dEFAULT_DIFF_MAX_LINES', () => {
  it('matches the official height cap', () => {
    expect(DEFAULT_DIFF_MAX_LINES).toBe(16)
  })
})
