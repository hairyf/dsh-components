import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Button, DropOverlay } from '@dsh-components'
import { useEffect, useState } from 'react'
import { Row } from './kit'

/**
 * Mount the full-viewport invitation on demand, then dismiss it with the next
 * press anywhere or Escape (the layer itself ignores pointer events).
 * @returns the trigger and, while active, the overlay.
 */
function DropOverlayPreview({ disabled }: { readonly disabled: boolean }): React.JSX.Element {
  const [active, setActive] = useState(false)
  useEffect(() => {
    if (!active)
      return undefined
    const close = (): void => {
      setActive(false)
    }
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape')
        setActive(false)
    }
    globalThis.addEventListener('pointerdown', close)
    globalThis.addEventListener('keydown', closeOnEscape)
    return () => {
      globalThis.removeEventListener('pointerdown', close)
      globalThis.removeEventListener('keydown', closeOnEscape)
    }
  }, [active])
  return (
    <Row>
      <Button
        variant="outline"
        onClick={() => {
          setActive(true)
        }}
      >
        {disabled
          ? '预览拒绝拖入'
          : '预览拖入提示'}
      </Button>
      <span>
        {active
          ? '点击任意位置或按 Esc 关闭预览。'
          : '按下按钮后显示整页提示。'}
      </span>
      {active
        ? (
            <DropOverlay
              disabled={disabled}
              labels={disabled
                ? { title: '暂时无法放入文件' }
                : { title: '松手即可放入文件', desc: '支持图片、文本与压缩包' }}
            />
          )
        : null}
    </Row>
  )
}

const example: ComponentExample = {
  name: 'drop-overlay',
  group: 'feedback',
  summary: '整页的拖放提示，区分可以放入与拒绝放入两种状态。',
  states: [
    { title: '可以放入（带限制说明）', element: <DropOverlayPreview disabled={false} /> },
    { title: '拒绝放入（灰色插图）', element: <DropOverlayPreview disabled /> },
  ],
}

export default example
