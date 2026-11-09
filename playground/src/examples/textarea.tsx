import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Textarea } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

function ControlledTextarea(): React.JSX.Element {
  const [value, setValue] = useState('第一行\n第二行')
  return (
    <Column>
      <Textarea value={value} placeholder="请输入内容" onChange={setValue} />
      <span className="pg-note">
        当前字数：
        {value.length}
      </span>
    </Column>
  )
}

function InvalidTextarea(): React.JSX.Element {
  const [value, setValue] = useState('')
  return <Textarea value={value} placeholder="必填项，留空会标红" invalid onChange={setValue} />
}

const example: ComponentExample = {
  name: 'textarea',
  group: 'primitives',
  summary: '受控的多行文本框，支持占位、字数上限、校验态与禁用。',
  states: [
    { title: '可输入（受控）', element: <ControlledTextarea /> },
    { title: '校验失败（invalid）', element: <InvalidTextarea /> },
    {
      title: '禁用 / 字数上限',
      element: (
        <Column>
          <Textarea value="不可编辑的内容" onChange={() => {}} disabled />
          <Textarea value="限制输入长度" maxLength={8} onChange={() => {}} />
        </Column>
      ),
    },
  ],
}

export default example
