import type { ComponentExample } from './kit'
import { JsonBlock } from '@dsh-components'
import { Column } from './kit'

const PAYLOAD = {
  id: 'a1',
  name: '示例条目',
  enabled: true,
  tags: [
    'alpha',
    'beta',
  ],
  limits: {
    retries: 3,
    timeoutMs: 1500,
  },
}

/** Comfortably past the 20000-character cap, so the body truncates. */
const LONG_PAYLOAD = {
  items: Array.from({ length: 600 }, (_, index) => ({
    index,
    note: '示例条目',
  })),
}

const truncatedLabel = (total: number): string => `内容过长，完整数据共 ${String(total)} 个字符`

const example: ComponentExample = {
  name: 'json-block',
  group: 'content',
  summary: '把一段数据折叠在开关后面，展开时才序列化并渲染。',
  states: [
    {
      title: '默认收起（点击展开）',
      element: (
        <Column>
          <JsonBlock label="查看原始内容" payload={PAYLOAD} truncatedLabel={truncatedLabel} />
        </Column>
      ),
    },
    {
      title: '默认展开',
      element: (
        <Column>
          <JsonBlock label="查看原始内容" payload={PAYLOAD} defaultOpen truncatedLabel={truncatedLabel} />
        </Column>
      ),
    },
    {
      title: '超长内容（展开后截断）',
      element: (
        <Column>
          <JsonBlock label="查看全部条目" payload={LONG_PAYLOAD} defaultOpen truncatedLabel={truncatedLabel} />
        </Column>
      ),
    },
  ],
}

export default example
