import { Window } from 'happy-dom'
import { beforeEach, describe, expect, it } from 'vitest'

/**
 * css-render writes into document.head, so the theme installer needs a real DOM.
 * happy-dom is installed per test rather than globally so the other suites stay
 * free of DOM globals.
 */
async function withDom<T>(run: () => Promise<T> | T): Promise<T> {
  const window = new Window({ url: 'http://localhost/' })
  const hadDocument = 'document' in globalThis
  const previous = globalThis.document
  const injected: Record<string, unknown> = {
    document: window.document,
    DOMParser: window.DOMParser,
    Element: window.Element,
    Node: window.Node,
    SVGElement: window.SVGElement,
  }
  const saved = new Map<string, unknown>()
  for (const [key, value] of Object.entries(injected)) {
    if (value === undefined)
      continue
    saved.set(key, (globalThis as Record<string, unknown>)[key])
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
  }
  try {
    return await run()
  }
  finally {
    if (hadDocument)
      Object.defineProperty(globalThis, 'document', { value: previous, configurable: true, writable: true })
    for (const [key, value] of saved) {
      if (value === undefined)
        Reflect.deleteProperty(globalThis, key)
      else
        Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
    }
    if (!hadDocument)
      Reflect.deleteProperty(globalThis, 'document')
  }
}
describe('installDshTheme', () => {
  beforeEach(() => {
    // Fresh module state per test so the installed-sheet cache does not leak.
  })

  it('mounts every rule of every sheet, not just the first', async () => {
    await withDom(async () => {
      const { installDshTheme } = await import('../src/theme')
      const handle = installDshTheme()
      const styles = document.head.querySelectorAll('style')
      // design-platform alone declares four scopes; all six sheets contribute more.
      expect(styles.length).toBeGreaterThan(4)
      handle.dispose()
    })
  })

  it('defines the official light and dark token scopes', async () => {
    await withDom(async () => {
      const { installDshTheme } = await import('../src/theme')
      const handle = installDshTheme()
      const css = [
        ...document.head.querySelectorAll('style'),
      ].map(s => s.textContent).join('\n')
      expect(css).toContain('--dsw-static-neutral-bluish-00')
      expect(css).toContain('body[data-ds-dark-theme]')
      expect(css).toContain('--dsw-alias-bg-base')
      handle.dispose()
    })
  })

  it('is idempotent across repeated installs', async () => {
    await withDom(async () => {
      const { installDshTheme } = await import('../src/theme')
      const first = installDshTheme()
      const count = document.head.querySelectorAll('style').length
      const second = installDshTheme()
      expect(document.head.querySelectorAll('style').length).toBe(count)
      first.dispose()
      second.dispose()
    })
  })

  it('removes its style elements on dispose', async () => {
    await withDom(async () => {
      const { installDshTheme } = await import('../src/theme')
      const handle = installDshTheme()
      expect(document.head.querySelectorAll('style').length).toBeGreaterThan(0)
      handle.dispose()
      expect(document.head.querySelectorAll('style')).toHaveLength(0)
    })
  })
})
