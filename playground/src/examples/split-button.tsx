import type { SplitButtonItem } from '@dsh-components'
import type { ComponentExample } from './kit'
import { SplitButton } from '@dsh-components'
import { useState } from 'react'
import { Glyph, Row } from './kit'

const MENU_ITEMS: readonly SplitButtonItem[] = [
  { id: 'copy', label: '复制结果', icon: <Glyph /> },
  { id: 'export', label: '导出为文件', icon: <Glyph /> },
]

/** The main action and both menu rows report what they did. */
function InteractiveSplit(): React.JSX.Element {
  const [count, setCount] = useState(0)
  const [last, setLast] = useState('尚未执行')
  const items: readonly SplitButtonItem[] = [
    {
      id: 'copy',
      label: '复制结果',
      icon: <Glyph />,
      onSelect: () => {
        setLast('已复制结果')
      },
    },
    {
      id: 'export',
      label: '导出为文件',
      icon: <Glyph />,
      onSelect: () => {
        setLast('已导出为文件')
      },
    },
  ]
  const run = (): void => {
    setCount(value => value + 1)
    setLast('已执行主操作')
  }
  return (
    <Row>
      <SplitButton
        icon={<Glyph />}
        label={count === 0
          ? '执行'
          : `已执行 ${String(count)} 次`}
        onClick={run}
        items={items}
      />
      <span>{last}</span>
    </Row>
  )
}

/** The large frame the sheet provides for a prominent action. */
function ProminentSplit(): React.JSX.Element {
  const [count, setCount] = useState(0)
  const run = (): void => {
    setCount(value => value + 1)
  }
  return (
    <SplitButton
      prominent
      icon={<Glyph size={16} />}
      label={count === 0
        ? '开始'
        : `已开始 ${String(count)} 次`}
      onClick={run}
      items={MENU_ITEMS}
    />
  )
}

/** Loading swaps the glyph for a skeleton and takes both buttons out of service. */
function LoadingSplit(): React.JSX.Element {
  return (
    <SplitButton
      icon={<Glyph />}
      label="执行中"
      loading
      onClick={() => undefined}
      items={MENU_ITEMS}
    />
  )
}

/** A disabled split button keeps its menu closed. */
function DisabledSplit(): React.JSX.Element {
  return (
    <SplitButton
      icon={<Glyph />}
      label="不可用"
      disabled
      onClick={() => undefined}
      items={MENU_ITEMS}
    />
  )
}

/** With no secondary rows, the chevron disappears and only the main action remains. */
function SingleActionSplit(): React.JSX.Element {
  const [count, setCount] = useState(0)
  const run = (): void => {
    setCount(value => value + 1)
  }
  return (
    <SplitButton
      icon={<Glyph />}
      label={count === 0
        ? '执行'
        : `已执行 ${String(count)} 次`}
      onClick={run}
      items={[]}
    />
  )
}

const example: ComponentExample = {
  name: 'split-button',
  group: 'settings',
  summary: '一个主操作按钮加一个右侧箭头：箭头展开次级操作菜单，两个按钮可以一起禁用或进入加载。',
  states: [
    { title: '主操作与更多菜单：都真的可点', element: <InteractiveSplit /> },
    { title: '大号样式', element: <ProminentSplit /> },
    { title: '加载中：图标变为占位块', element: <LoadingSplit /> },
    { title: '禁用', element: <DisabledSplit /> },
    { title: '没有次级操作时不显示箭头', element: <SingleActionSplit /> },
  ],
}

export default example
