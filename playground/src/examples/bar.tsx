import type { ComponentExample } from './kit'
import { Bar, Button, Stack } from '@dsh-components'
import { useState } from 'react'
import { Glyph } from './kit'

/**
 * A plain bar: heading, muted secondary line and a trailing action.
 *
 * It is not expandable, so it renders as a heading and shows no chevron.
 */
function ActionBar(): React.JSX.Element {
  const [count, setCount] = useState(0)
  const refresh = (): void => {
    setCount(value => value + 1)
  }
  return (
    <Bar
      glyph={<Glyph />}
      label="概览"
      objective={count === 0
        ? '尚未刷新'
        : `已刷新 ${String(count)} 次`}
      actions={(
        <Button size="sm" variant="ghost" onClick={refresh}>
          刷新
        </Button>
      )}
    />
  )
}

/** The error line replaces the secondary line and takes the error tone. */
function ErrorBar(): React.JSX.Element {
  return (
    <Bar
      glyph={<Glyph />}
      label="连接"
      error="连接中断，请稍后重试"
    />
  )
}

/** A bar that starts closed; pressing the header toggles the revealed content. */
function CollapsedBar(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const toggle = (): void => {
    setOpen(value => !value)
  }
  return (
    <Bar
      glyph={<Glyph />}
      label="明细"
      objective={open ? '共 3 项' : '展开查看明细'}
      expandable
      expanded={open}
      toggleLabel={open ? '收起明细' : '展开明细'}
      onToggle={toggle}
    >
      <Stack gap={6}>
        <span>第一项 · 已保存</span>
        <span>第二项 · 进行中</span>
        <span>第三项 · 尚未开始</span>
      </Stack>
    </Bar>
  )
}

/** A bar that starts open, with a trailing count inside the header. */
function OpenedBar(): React.JSX.Element {
  const [open, setOpen] = useState(true)
  const toggle = (): void => {
    setOpen(value => !value)
  }
  return (
    <Bar
      glyph={<Glyph />}
      label="明细"
      objective="共 3 项"
      actions={<span>2 / 3</span>}
      expandable
      expanded={open}
      toggleLabel={open ? '收起明细' : '展开明细'}
      onToggle={toggle}
    >
      <Stack gap={6}>
        <span>第一项 · 已保存</span>
        <span>第二项 · 进行中</span>
        <span>第三项 · 尚未开始</span>
      </Stack>
    </Bar>
  )
}

const example: ComponentExample = {
  name: 'bar',
  group: 'layout',
  summary: '一条可收起的横向栏，容纳图标、标题、次要说明、错误行、右侧操作与展开箭头。',
  states: [
    { title: '固定标题栏：图标、说明与右侧操作', element: <ActionBar /> },
    { title: '错误行替代次要说明', element: <ErrorBar /> },
    { title: '可展开：点击标题或箭头展开内容', element: <CollapsedBar /> },
    { title: '可展开：默认展开并带计数', element: <OpenedBar /> },
  ],
}

export default example
