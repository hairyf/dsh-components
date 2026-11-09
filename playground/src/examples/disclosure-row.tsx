import type * as React from 'react'
import type { ComponentExample } from './kit'
import { DisclosureRow, Tag } from '@dsh-components'
import { useState } from 'react'
import { Column, Glyph } from './kit'

function ExpandingRows(): React.JSX.Element {
  const [first, setFirst] = useState(true)
  const [second, setSecond] = useState(false)
  return (
    <Column>
      <DisclosureRow
        icon={<Glyph />}
        title="查看详细信息"
        open={first}
        expandable
        onToggle={() => setFirst(value => !value)}
        collapsedContent={<span className="pg-note">3 项</span>}
      >
        <div style={{ padding: '4px 0 0 24px' }}>展开后的内容可以放任意节点。</div>
      </DisclosureRow>
      <DisclosureRow
        icon={<Glyph />}
        title="查看附加说明"
        open={second}
        expandable
        expandOnRowClick
        previewChevron={false}
        onToggle={() => setSecond(value => !value)}
      >
        <div style={{ padding: '4px 0 0 24px' }}>打开后整行都可以点击收起。</div>
      </DisclosureRow>
    </Column>
  )
}

function RunningRow(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <DisclosureRow icon={<Glyph />} title="正在处理中" open={open} expandable running onToggle={() => setOpen(value => !value)}>
      <div style={{ padding: '4px 0 0 24px' }}>标题会持续显示流光动画。</div>
    </DisclosureRow>
  )
}

const example: ComponentExample = {
  name: 'disclosure-row',
  group: 'primitives',
  summary: '可展开的流程行：前导图标、标题、折叠摘要与展开内容。',
  states: [
    { title: '展开 / 收起（可交互）', element: <ExpandingRows /> },
    { title: '运行中（running）', element: <RunningRow /> },
    {
      title: '不可展开 + 尾部附加内容',
      element: (
        <DisclosureRow
          icon={<Glyph />}
          title="已完成"
          open={false}
          expandable={false}
          onToggle={() => {}}
          headerAccessory={<Tag tone="success">成功</Tag>}
        />
      ),
    },
  ],
}

export default example
