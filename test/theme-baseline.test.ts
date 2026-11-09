import { Window } from 'happy-dom'
import { beforeAll, describe, expect, it } from 'vitest'

/** The gallery renders outside DSH, so the theme must supply what the host supplies. */
describe('theme document baseline', () => {
  beforeAll(() => {
    const window = new Window({ url: 'http://localhost/' })
    const globals: Record<string, unknown> = {
      window,
      document: window.document,
      navigator: window.navigator,
      DOMParser: window.DOMParser,
      Element: window.Element,
      Node: window.Node,
      HTMLElement: window.HTMLElement,
    }
    for (const [key, value] of Object.entries(globals))
      Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
  })

  it('publishes the icon sprite the components reference', async () => {
    const { installDshTheme } = await import('../src/theme')
    installDshTheme()
    const sprite = document.querySelector('[data-dsh-icon-sprite]')
    expect(sprite).not.toBeNull()
    expect(sprite!.querySelectorAll('symbol').length).toBeGreaterThan(100)
    expect(sprite!.querySelector('#dsw-icon-chevron-down-outline-regular')).not.toBeNull()
  })

  it('keeps a :global() dark override as a real selector', async () => {
    const { useStyle } = await import('../src/lib/style')
    useStyle('probe', '.root{color:red} :global(body[data-ds-dark-theme]) .root{color:blue}')
    const sheet = [
      ...document.querySelectorAll('style'),
    ].map(style => style.textContent ?? '').join('')
    expect(sheet).toContain('body[data-ds-dark-theme] .dshc-probe_root')
    expect(sheet).not.toContain(':global(')
  })
})
