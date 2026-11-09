import type { ComponentExample } from './kit'
import { ListRow } from '@dsh-components'
import { useState } from 'react'
import { Glyph } from './kit'

/** A row that expands on press and shows two lines of detail. */
function ExpandableRow(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <ListRow
      leading={<Glyph />}
      title="构建记录"
      summary={open ? '已展开' : '点击查看明细'}
      expandable
      expanded={open}
      onExpandedChange={setOpen}
    >
      <span>用时 12 秒</span>
      <span>产物 3 个</span>
    </ListRow>
  )
}

const example: ComponentExample = {
  name: 'list-row',
  group: 'layout',
  summary: '一行列表项：前置图标、标题、状态徽标、可截断的摘要、尾部槽位与可展开的明细。',
  states: [
    {
      title: '标题、摘要与尾部信息',
      element: (
        <ListRow
          leading={<Glyph />}
          title="构建记录"
          summary="用时 12 秒"
          trailing="刚刚"
        />
      ),
    },
    {
      title: '徽标、错误色调与次要色调',
      element: (
        <>
          <ListRow leading={<Glyph />} title="部署" summary="连接中断" tone="error" badge="失败" />
          <ListRow leading={<Glyph />} title="缓存" summary="沿用上次结果" tone="muted" badge="跳过" />
        </>
      ),
    },
    { title: '可展开：点击行展开明细', element: <ExpandableRow /> },
  ],
}

export default example
