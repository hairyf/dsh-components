import type * as React from 'react'
import type { ComponentExample } from './kit'
import { SegmentedTabs } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

const ITEMS = [
  {
    value: 'preview',
    label: '预览',
    id: 'tabs-preview',
    panelId: 'panel-preview',
  },
  {
    value: 'detail',
    label: '详情',
    id: 'tabs-detail',
    panelId: 'panel-detail',
  },
  {
    value: 'source',
    label: '原文',
    id: 'tabs-source',
    panelId: 'panel-source',
  },
] as const

function ControlledTabs(): React.JSX.Element {
  const [value, setValue] = useState('preview')
  const current = ITEMS.find(item => item.value === value)
  return (
    <Column>
      <SegmentedTabs items={ITEMS} label="视图" value={value} onChange={setValue} />
      <span className="pg-note">
        当前：
        {current?.label ?? value}
      </span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'segmented-tabs',
  group: 'primitives',
  summary: '等宽标签页，选中指示条随选择滑动，支持标准与紧凑两种尺寸。',
  states: [
    { title: '标准尺寸（可交互）', element: <ControlledTabs /> },
    {
      title: '紧凑尺寸（sm）',
      element: <SegmentedTabs items={ITEMS} label="视图（紧凑）" defaultValue="detail" size="sm" />,
    },
  ],
}

export default example
