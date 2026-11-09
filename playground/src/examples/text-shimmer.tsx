import type { ComponentExample } from './kit'
import { TextShimmer } from '@dsh-components'
import { Column } from './kit'

const example: ComponentExample = {
  name: 'text-shimmer',
  group: 'primitives',
  summary: '带流光动画的文本，关闭 active 后保持静态。',
  states: [
    {
      title: '流水中',
      element: (
        <Column>
          <TextShimmer active>正在处理内容</TextShimmer>
        </Column>
      ),
    },
    {
      title: '静态',
      element: (
        <Column>
          <TextShimmer>处理已完成</TextShimmer>
        </Column>
      ),
    },
    {
      title: '嵌套文本',
      element: (
        <Column>
          <TextShimmer active>
            正在读取
            <TextShimmer>3 个条目</TextShimmer>
          </TextShimmer>
        </Column>
      ),
    },
  ],
}

export default example
