import type { ComponentExample } from './kit'
import { Spinner } from '@dsh-components'
import { Column, Row } from './kit'

const example: ComponentExample = {
  name: 'spinner',
  group: 'primitives',
  summary: '不确定进度的加载指示器，提供行内小号与带文字的块级形式。',
  states: [
    {
      title: '行内小号（sm）',
      element: (
        <Row>
          <Spinner size="sm" label="加载中" />
          <span className="pg-note">仅显示转圈指示器。</span>
        </Row>
      ),
    },
    {
      title: '块级（md）',
      element: (
        <Column>
          <Spinner label="正在加载内容" />
        </Column>
      ),
    },
  ],
}

export default example
