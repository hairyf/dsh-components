import type { OptionGroupItem } from '@dsh-components'
import type { ComponentExample } from './kit'
import { OptionGroup } from '@dsh-components'
import { useState } from 'react'
import { Glyph } from './kit'

const OPTIONS: readonly OptionGroupItem[] = [
  {
    id: 'list',
    label: '列表',
    icon: <Glyph />,
    description: '逐行展示',
  },
  {
    id: 'grid',
    label: '网格',
    icon: <Glyph />,
    description: '按网格排布',
  },
  {
    id: 'compact',
    label: '紧凑',
    icon: <Glyph />,
    description: '减少留白',
  },
  {
    id: 'detail',
    label: '详情',
    icon: <Glyph />,
    description: '在旁边展示详情',
  },
]

/** The sheet-width cubes: each one takes its own 180px basis and wraps. */
function FloatingCubes(): React.JSX.Element {
  const [value, setValue] = useState('list')
  return <OptionGroup value={value} options={OPTIONS} onChange={setValue} label="展示方式" />
}

/** Four cubes sharing the row width. */
function FixedColumns(): React.JSX.Element {
  const [value, setValue] = useState('grid')
  return <OptionGroup value={value} options={OPTIONS} onChange={setValue} label="展示方式" columns={4} />
}

const example: ComponentExample = {
  name: 'option-group',
  group: 'settings',
  summary: '一排可选的方块，每块带图标与标题，任一时刻只有一块处于选中状态。',
  states: [
    { title: '默认宽度：点击切换选中项', element: <FloatingCubes /> },
    { title: '固定四列排布', element: <FixedColumns /> },
  ],
}

export default example
