// @vitest-environment node
import type * as React from 'react'
import { HoverCard, MenuGroup, Modal, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Menu } from '../../src/components/primitives/menu'
import { MenuSurface } from '../../src/components/primitives/menu-surface'
import { Toast } from '../../src/components/primitives/toast'

/**
 * Server-render one element, the way a plugin's SSR pass would.
 * @param element - the element to render.
 * @returns the emitted markup.
 */
function render(element: ReturnType<typeof createElement>): string {
  return renderToString(element)
}

describe('server rendering', () => {
  it('renders a tooltip anchor without its bubble', () => {
    // Tooltip clones its anchor, so it requires an element whose props overlap its
    // injected ones; createElement infers a bare props object, hence the cast.
    const anchor = createElement('button', { type: 'button' }, '刷新') as React.ReactElement<Record<string, unknown>>
    const html = render(createElement(Tooltip, { label: '刷新', children: anchor }))
    expect(html).toContain('<button')
    expect(html).not.toContain('role="tooltip"')
  })

  it('renders nothing for a closed modal and a toast without a document', () => {
    expect(render(createElement(Modal, {
      open: false,
      onClose: () => {},
      title: '标题',
      closeLabel: '关闭',
    }))).toBe('')
    expect(render(createElement(Toast, {
      text: '已保存',
      onDone: () => {},
    }))).toBe('')
  })

  it('renders a menu anchor and its open list without portaling', () => {
    const html = render(createElement(Menu, {
      open: true,
      anchor: createElement('button', { type: 'button' }, '打开'),
      items: [
        { id: 'a', label: '甲' },
      ],
      onClose: () => {},
    }))
    expect(html).toContain('打开')
    expect(html).toContain('role="menu"')
    expect(html).toContain('甲')
  })

  it('renders a menu surface and a group without a document', () => {
    const html = render(createElement(MenuSurface, null, createElement(MenuGroup, { label: '分组' })))
    expect(html).toContain('data-menu-material="translucent"')
    expect(html).toContain('role="group"')
    expect(html).toContain('分组')
  })

  it('renders a hover card anchor without its card', () => {
    const html = render(createElement(HoverCard, {
      anchor: createElement('span', null, '锚点'),
      content: createElement('span', null, '卡片'),
    }))
    expect(html).toContain('锚点')
    expect(html).not.toContain('卡片')
  })
})
