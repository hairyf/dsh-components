import type { ComponentExample } from './kit'
import { Tag } from '@dsh-components'
import { Row } from './kit'

const TONES = [
  'outline',
  'solid',
  'neutral',
  'quiet',
  'success',
  'info',
  'warning',
  'danger',
] as const

const example: ComponentExample = {
  name: 'tag',
  group: 'primitives',
  summary: '八种色调的只读标签。',
  states: [
    {
      title: '全部色调',
      element: <Row>{TONES.map(tone => <Tag key={tone} tone={tone}>{tone}</Tag>)}</Row>,
    },
    {
      title: '语义文案',
      element: (
        <Row>
          <Tag tone="success">已完成</Tag>
          <Tag tone="info">预览版</Tag>
          <Tag tone="warning">等待中</Tag>
          <Tag tone="danger">失败</Tag>
          <Tag tone="neutral">草稿</Tag>
          <Tag tone="quiet">已归档</Tag>
        </Row>
      ),
    },
  ],
}

export default example
