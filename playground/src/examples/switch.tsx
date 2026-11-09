import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Switch } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

function ControlledSwitch(): React.JSX.Element {
  const [on, setOn] = useState(true)
  return (
    <Column>
      <Switch checked={on} onChange={setOn} label={`自动折叠：${on ? '开' : '关'}`} />
      <span className="pg-note">
        当前：
        {on ? '开' : '关'}
      </span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'switch',
  group: 'primitives',
  summary: '受控与非受控的开关，可带提示或禁用。',
  states: [
    { title: '可切换（受控）', element: <ControlledSwitch /> },
    {
      title: '关 / 开',
      element: (
        <Column>
          <Switch label="关" />
          <Switch label="开" defaultChecked />
        </Column>
      ),
    },
    {
      title: '禁用',
      element: (
        <Column>
          <Switch label="禁用·关" disabled />
          <Switch label="禁用·开" disabled defaultChecked />
        </Column>
      ),
    },
  ],
}

export default example
