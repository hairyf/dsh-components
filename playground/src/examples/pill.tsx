import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Pill } from '@dsh-components'
import { useState } from 'react'
import { Column, Row } from './kit'

function FilterPills(): React.JSX.Element {
  const [active, setActive] = useState('全部')
  return (
    <Row>
      {['全部', '进行中', '已完成'].map(label => (
        <Pill key={label} active={active === label} onClick={() => setActive(label)}>{label}</Pill>
      ))}
      <span className="pg-note">
        当前：
        {active}
      </span>
    </Row>
  )
}

const example: ComponentExample = {
  name: 'pill',
  group: 'primitives',
  summary: '胶囊形状的筛选标签，可静态展示、点选切换或禁用。',
  states: [
    { title: '可点选（可交互）', element: <FilterPills /> },
    {
      title: '静态 / 选中',
      element: (
        <Row>
          <Pill>静态</Pill>
          <Pill active>选中</Pill>
        </Row>
      ),
    },
    {
      title: '禁用',
      element: (
        <Column>
          <Row>
            <Pill onClick={() => {}} disabled>禁用</Pill>
            <Pill active onClick={() => {}} disabled>禁用·选中</Pill>
          </Row>
        </Column>
      ),
    },
  ],
}

export default example
