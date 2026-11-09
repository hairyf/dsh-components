// @vitest-environment happy-dom
import type { Root } from 'react-dom/client'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Switch } from '../../src/components/primitives/switch'

declare global {
  // eslint-disable-next-line vars-on-top
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

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

/**
 * Read the single rendered switch.
 * @returns the switch button.
 */
function switchElement(): HTMLButtonElement {
  const element = container.querySelector<HTMLButtonElement>('[role="switch"]')
  if (element === null)
    throw new Error('switch missing')
  return element
}

describe('switch', () => {
  it('stays on the controlled value and reports the requested one', () => {
    const onChange = vi.fn()
    act(() => {
      root.render(createElement(Switch, { checked: false, onChange, label: 'Enabled' }))
    })
    expect(switchElement().getAttribute('aria-checked')).toBe('false')

    act(() => {
      switchElement().click()
    })
    expect(onChange).toHaveBeenCalledWith(true)
    // Controlled: the rendered state only moves when the owner moves it.
    expect(switchElement().getAttribute('aria-checked')).toBe('false')

    act(() => {
      root.render(createElement(Switch, { checked: true, onChange, label: 'Enabled' }))
    })
    expect(switchElement().getAttribute('aria-checked')).toBe('true')

    act(() => {
      switchElement().click()
    })
    expect(onChange).toHaveBeenLastCalledWith(false)
    expect(switchElement().getAttribute('aria-checked')).toBe('true')
  })

  it('keeps its own state when uncontrolled', () => {
    const onChange = vi.fn()
    act(() => {
      root.render(createElement(Switch, { defaultChecked: false, onChange, label: 'Enabled' }))
    })
    expect(switchElement().getAttribute('aria-checked')).toBe('false')

    act(() => {
      switchElement().click()
    })
    expect(switchElement().getAttribute('aria-checked')).toBe('true')
    expect(onChange).toHaveBeenCalledWith(true)

    act(() => {
      switchElement().click()
    })
    expect(switchElement().getAttribute('aria-checked')).toBe('false')
    expect(onChange).toHaveBeenLastCalledWith(false)
  })

  it('refuses input while disabled', () => {
    const onChange = vi.fn()
    act(() => {
      root.render(createElement(Switch, {
        checked: false,
        onChange,
        label: 'Enabled',
        disabled: true,
      }))
    })
    expect(switchElement().disabled).toBe(true)
    act(() => {
      switchElement().click()
    })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('exposes the label as its accessible name and the title as hover text', () => {
    act(() => {
      root.render(createElement(Switch, {
        checked: false,
        label: '自动保存',
        title: '写入进行中',
      }))
    })
    expect(switchElement().getAttribute('aria-label')).toBe('自动保存')
    expect(switchElement().title).toBe('写入进行中')
  })
})
