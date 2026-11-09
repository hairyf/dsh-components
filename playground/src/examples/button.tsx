import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Button } from '@dsh-components'
import { useState } from 'react'
import { Glyph, Row } from './kit'

function Counter(): React.JSX.Element {
  const [count, setCount] = useState(0)
  return (
    <Row>
      <Button variant="primary" onClick={() => setCount(value => value + 1)}>增加一次</Button>
      <Button variant="ghost" onClick={() => setCount(0)}>重置</Button>
      <span className="pg-note">
        已点击
        {' '}
        {count}
        {' '}
        次
      </span>
    </Row>
  )
}

const example: ComponentExample = {
  name: 'button',
  group: 'primitives',
  summary: '四种外观与两种尺寸的文本按钮，可带前置图标或禁用。',
  states: [
    {
      title: '四种外观',
      element: (
        <Row>
          <Button variant="primary">确定</Button>
          <Button variant="ghost">取消</Button>
          <Button variant="outline">稍后</Button>
          <Button variant="toolbar">更多</Button>
        </Row>
      ),
    },
    {
      title: '两种尺寸',
      element: (
        <Row>
          <Button variant="primary">标准尺寸</Button>
          <Button variant="primary" size="sm">紧凑尺寸</Button>
        </Row>
      ),
    },
    {
      title: '前置图标',
      element: (
        <Row>
          <Button icon={<Glyph />}>添加</Button>
          <Button variant="primary" size="sm" icon={<Glyph size={12} />}>添加</Button>
        </Row>
      ),
    },
    { title: '可点击', element: <Counter /> },
    {
      title: '禁用',
      element: (
        <Row>
          <Button variant="primary" disabled>确定</Button>
          <Button variant="ghost" disabled>取消</Button>
          <Button variant="outline" size="sm" disabled>稍后</Button>
        </Row>
      ),
    },
  ],
}

export default example
