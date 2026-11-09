// @vitest-environment happy-dom
import type { Root } from 'react-dom/client'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Menu } from '../../src/components/primitives/menu'

declare global {
  // eslint-disable-next-line vars-on-top
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const ITEMS = [
  { id: 'alpha', label: 'Alpha' },
  { id: 'beta', label: 'Beta' },
  { id: 'gamma', label: 'Gamma' },
]

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
})

interface Rendered {
  onClose: ReturnType<typeof vi.fn>
  onSelect: ReturnType<typeof vi.fn>
  trigger: HTMLButtonElement
  rows: () => HTMLButtonElement[]
  press: (key: string) => void
}

/**
 * Render an open menu with a focusable trigger and three data rows.
 * @param items - rows to render; defaults to the three-row fixture.
 */
function renderMenu(items: readonly { id: string, label: string, disabled?: boolean }[] = ITEMS): Rendered {
  const onClose = vi.fn()
  const onSelect = vi.fn()
  act(() => {
    root.render(createElement(Menu, {
      open: true,
      anchor: createElement('button', { type: 'button' }, 'Open'),
      items,
      onSelect,
      onClose,
    }))
  })
  const trigger = container.querySelector('button')
  if (trigger === null)
    throw new Error('menu trigger missing')
  return {
    onClose,
    onSelect,
    trigger,
    rows: () => Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')),
    press: (key: string) => {
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
      })
    },
  }
}

describe('menu keyboard navigation', () => {
  it('walks rows with the arrow keys once the trigger holds focus', () => {
    const menu = renderMenu()
    act(() => {
      menu.trigger.focus()
    })
    expect(document.activeElement).toBe(menu.trigger)

    menu.press('ArrowDown')
    expect(document.activeElement?.textContent).toBe('Alpha')

    menu.press('ArrowDown')
    expect(document.activeElement?.textContent).toBe('Beta')

    menu.press('ArrowUp')
    expect(document.activeElement?.textContent).toBe('Alpha')

    menu.press('End')
    expect(document.activeElement?.textContent).toBe('Gamma')

    menu.press('Home')
    expect(document.activeElement?.textContent).toBe('Alpha')
  })

  it('wraps around at both ends', () => {
    const menu = renderMenu()
    act(() => {
      menu.trigger.focus()
    })
    menu.press('ArrowUp')
    expect(document.activeElement?.textContent).toBe('Gamma')
    menu.press('ArrowDown')
    expect(document.activeElement?.textContent).toBe('Alpha')
  })

  it('skips disabled rows in the walk', () => {
    const menu = renderMenu([
      { id: 'alpha', label: 'Alpha' },
      { id: 'beta', label: 'Beta', disabled: true },
      { id: 'gamma', label: 'Gamma' },
    ])
    act(() => {
      menu.trigger.focus()
    })
    menu.press('ArrowDown')
    menu.press('ArrowDown')
    expect(document.activeElement?.textContent).toBe('Gamma')
    expect(menu.rows().filter(row => row.disabled)).toHaveLength(1)
  })

  it('closes on Escape', () => {
    const menu = renderMenu()
    act(() => {
      menu.trigger.focus()
    })
    expect(menu.onClose).not.toHaveBeenCalled()
    menu.press('Escape')
    expect(menu.onClose).toHaveBeenCalledTimes(1)
  })

  it('activates the row that is clicked', () => {
    const menu = renderMenu()
    const beta = menu.rows()[1]
    expect(beta).toBeDefined()
    act(() => {
      beta!.click()
    })
    expect(menu.onSelect).toHaveBeenCalledWith('beta')
  })

  it('renders nothing but the anchor while closed', () => {
    const onClose = vi.fn()
    act(() => {
      root.render(createElement(Menu, {
        open: false,
        anchor: createElement('button', { type: 'button' }, 'Open'),
        items: ITEMS,
        onClose,
      }))
    })
    expect(document.querySelector('[role="menu"]')).toBeNull()
    expect(container.querySelector('button')?.textContent).toBe('Open')
  })
})
