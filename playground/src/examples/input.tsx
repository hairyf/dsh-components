import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Input } from '@dsh-components'
import { useState } from 'react'
import { Column, Glyph, Row } from './kit'

function ControlledInput(): React.JSX.Element {
  const [value, setValue] = useState('可编辑的内容')
  return (
    <Column>
      <Input
        value={value}
        aria-label="名称"
        placeholder="请输入名称"
        onChange={event => setValue(event.target.value)}
      />
      <span className="pg-note">
        当前输入：
        {value === ''
          ? '（空）'
          : value}
      </span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'input',
  group: 'primitives',
  summary: '单行文本输入框，可带前置图标、默认值或禁用。',
  states: [
    { title: '可输入（受控）', element: <ControlledInput /> },
    {
      title: '前置图标 / 默认值',
      element: (
        <Column>
          <Input icon={<Glyph />} aria-label="搜索" placeholder="搜索内容" />
          <Input aria-label="已填" defaultValue="已填的内容" />
        </Column>
      ),
    },
    {
      title: '禁用',
      element: (
        <Row>
          <Input aria-label="禁用" placeholder="不可编辑" disabled />
          <Input icon={<Glyph />} aria-label="禁用并带图标" defaultValue="禁用但带图标" disabled />
        </Row>
      ),
    },
  ],
}

export default example
