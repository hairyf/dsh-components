import type * as React from 'react'
import type { ComponentExample } from './kit'
import {
  IconButton,
  IconCopyOutlineRegular,
  IconEllipsisOutlineRegular,
  IconPauseOutlineRegular,
  IconPlayOutlineRegular,
} from '@dsh-components'
import { useState } from 'react'
import { Column, Row } from './kit'

function ActiveToggle(): React.JSX.Element {
  const [active, setActive] = useState(false)
  return (
    <Row>
      <IconButton
        icon={active
          ? <IconPauseOutlineRegular />
          : <IconPlayOutlineRegular />}
        label={active ? '暂停' : '开始'}
        active={active}
        pressed={active}
        onClick={() => setActive(value => !value)}
      />
      <span className="pg-note">{active ? '已选中' : '未选中'}</span>
    </Row>
  )
}

const example: ComponentExample = {
  name: 'icon-button',
  group: 'primitives',
  summary: '只有一个图标的方形按钮，可切换选中态、切换尺寸或禁用。',
  states: [
    { title: '可切换选中态（可交互）', element: <ActiveToggle /> },
    {
      title: '常用图标',
      element: (
        <Row>
          <IconButton icon={<IconCopyOutlineRegular />} label="复制" />
          <IconButton icon={<IconEllipsisOutlineRegular />} label="更多" />
          <IconButton icon={<IconPlayOutlineRegular />} label="开始" size="sm" />
        </Row>
      ),
    },
    {
      title: '禁用',
      element: (
        <Column>
          <Row>
            <IconButton icon={<IconCopyOutlineRegular />} label="复制（禁用）" disabled />
            <IconButton icon={<IconEllipsisOutlineRegular />} label="更多（禁用）" disabled size="sm" />
          </Row>
        </Column>
      ),
    },
  ],
}

export default example
