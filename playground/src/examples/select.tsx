import type { SelectOption } from '@dsh-components'
import type { ComponentExample } from './kit'
import { Select } from '@dsh-components'
import { useState } from 'react'
import { Glyph } from './kit'

const OPTIONS: readonly SelectOption[] = [
  {
    id: 'name',
    label: '按名称',
    icon: <Glyph />,
    description: '按名称排序',
  },
  {
    id: 'updated',
    label: '按更新时间',
    icon: <Glyph />,
    badge: '默认',
    description: '最近更新的排在前面',
  },
  {
    id: 'size',
    label: '按大小',
    icon: <Glyph />,
    description: '较大的排在前面',
  },
]

/** A select with a value: the trigger shows the glyph, caption and chevron. */
function ChosenSelect(): React.JSX.Element {
  const [value, setValue] = useState('name')
  return <Select value={value} options={OPTIONS} onChange={setValue} />
}

/** A select whose value matches no option, so the placeholder shows. */
function PlaceholderSelect(): React.JSX.Element {
  const [value, setValue] = useState('none')
  return <Select value={value} options={OPTIONS} onChange={setValue} placeholder="请选择排序方式" />
}

/** The compact dropdown density. */
function CompactSelect(): React.JSX.Element {
  const [value, setValue] = useState('updated')
  return <Select value={value} options={OPTIONS} onChange={setValue} size="sm" />
}

/** A locked select: the menu still opens, but no choice can be made. */
function LockedSelect(): React.JSX.Element {
  const [value, setValue] = useState('updated')
  return <Select value={value} options={OPTIONS} onChange={setValue} locked />
}

/** A disabled select: the trigger refuses input and the menu never opens. */
function DisabledSelect(): React.JSX.Element {
  const [value, setValue] = useState('name')
  return <Select value={value} options={OPTIONS} onChange={setValue} disabled />
}

const example: ComponentExample = {
  name: 'select',
  group: 'settings',
  summary: '一个带图标的取值触发器，右侧的箭头在展开时翻转，按下后弹出可选的菜单。',
  states: [
    { title: '已选择：点击展开菜单', element: <ChosenSelect /> },
    { title: '未选择：显示占位文案', element: <PlaceholderSelect /> },
    { title: '紧凑密度', element: <CompactSelect /> },
    { title: '锁定值：菜单可浏览但不可改', element: <LockedSelect /> },
    { title: '禁用', element: <DisabledSelect /> },
  ],
}

export default example
