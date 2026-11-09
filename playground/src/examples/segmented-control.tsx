import type * as React from 'react'
import type { ComponentExample } from './kit'
import { SegmentedControl } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

const OPTIONS = [
  { value: 'list', label: '列表' },
  { value: 'grid', label: '网格' },
  { value: 'table', label: '表格' },
] as const

function ControlledSegments(): React.JSX.Element {
  const [value, setValue] = useState('grid')
  const current = OPTIONS.find(option => option.value === value)
  return (
    <Column>
      <SegmentedControl id="view" label="视图" options={OPTIONS} value={value} onChange={setValue} />
      <span className="pg-note">
        当前：
        {current?.label ?? value}
      </span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'segmented-control',
  group: 'primitives',
  summary: '滑动的分段控件，支持受控、非受控、整体禁用与单段禁用。',
  states: [
    { title: '受控（可交互）', element: <ControlledSegments /> },
    {
      title: '非受控（defaultValue）',
      element: <SegmentedControl id="default-view" label="默认视图" options={OPTIONS} defaultValue="list" />,
    },
    {
      title: '整体禁用 / 单段禁用',
      element: (
        <Column>
          <SegmentedControl id="locked" label="整体禁用" options={OPTIONS} defaultValue="list" disabled />
          <SegmentedControl
            id="partial"
            label="部分禁用"
            defaultValue="list"
            options={[
              { value: 'list', label: '列表' },
              {
                value: 'locked',
                label: '锁定',
                disabled: true,
                title: '当前不可用',
              },
            ]}
          />
        </Column>
      ),
    },
  ],
}

export default example
