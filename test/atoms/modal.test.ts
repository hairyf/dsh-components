// @vitest-environment happy-dom
import type { Root } from 'react-dom/client'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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
 * Press a key on the document, the way a focused control would bubble it.
 * @param key - the KeyboardEvent key.
 * @param shiftKey - whether Shift is held.
 */
function press(key: string, shiftKey = false): void {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key,
      shiftKey,
      bubbles: true,
      cancelable: true,
    }))
  })
}

interface ModalFixture {
  onClose: ReturnType<typeof vi.fn>
  render: (open: boolean) => void
}

/**
 * Render a titled modal with one autofocus-able body button.
 * @param open - initial open state.
 */
function renderModal(open = true): ModalFixture {
  const onClose = vi.fn()
  const render = (next: boolean): void => {
    act(() => {
      root.render(createElement(Modal, {
        open: next,
        onClose,
        title: '删除工作区',
        closeLabel: '关闭',
        description: '该操作不可撤销。',
        footer: createElement('button', { type: 'button' }, '取消'),
      }, createElement('button', { 'type': 'button', 'data-modal-autofocus': true }, '确认')))
    })
  }
  render(open)
  return { onClose, render }
}

describe('modal', () => {
  it('renders a portaled dialog with the official semantics', () => {
    renderModal()
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.getAttribute('aria-label')).toBe('删除工作区')
    expect(container.contains(dialog)).toBe(false)
    expect(document.body.contains(dialog)).toBe(true)
    expect(document.querySelector('h2')?.textContent).toBe('删除工作区')
  })

  it('closes on Escape', () => {
    const modal = renderModal()
    expect(modal.onClose).not.toHaveBeenCalled()
    press('Escape')
    expect(modal.onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on a mask click but not on a click inside the card', () => {
    const modal = renderModal()
    const card = document.querySelector('[role="dialog"]')
    act(() => {
      card?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(modal.onClose).not.toHaveBeenCalled()

    const mask = document.querySelector('[role="presentation"] > [aria-hidden="true"]')
    expect(mask).not.toBeNull()
    act(() => {
      mask?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(modal.onClose).toHaveBeenCalledTimes(1)
  })

  it('moves initial focus into the dialog and restores it on close', () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    act(() => {
      opener.focus()
    })
    const modal = renderModal()
    expect(document.activeElement?.textContent).toBe('确认')

    modal.render(false)
    expect(document.activeElement).toBe(opener)
    opener.remove()
  })

  it('renders nothing while closed', () => {
    renderModal(false)
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })
})
