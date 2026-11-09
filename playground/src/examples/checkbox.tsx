import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Checkbox } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

function ControlledCheckbox(): React.JSX.Element {
  const [checked, setChecked] = useState(true)
  return (
    <Column>
      <Checkbox checked={checked} onChange={setChecked} label={`自动折叠：${checked ? '开' : '关'}`} />
      <Checkbox label="未选中的非受控项" />
      <Checkbox label="带悬停提示" title="当前不可修改" defaultChecked />
    </Column>
  )
}

const example: ComponentExample = {
  name: 'checkbox',
  group: 'primitives',
  summary: '受控与非受控的勾选框，可带标题提示或禁用。',
  states: [
    { title: '可交互（受控）', element: <ControlledCheckbox /> },
    {
      title: '未选中 / 已选中',
      element: (
        <Column>
          <Checkbox label="未选中" />
          <Checkbox label="已选中" defaultChecked />
        </Column>
      ),
    },
    {
      title: '禁用',
      element: (
        <Column>
          <Checkbox label="禁用·未选中" disabled />
          <Checkbox label="禁用·已选中" disabled defaultChecked />
        </Column>
      ),
    },
  ],
}

export default example
