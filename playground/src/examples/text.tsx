import type { ComponentExample } from './kit'
import { Text } from '@dsh-components'
import { Column } from './kit'

const LONG = '这是一段用于展示单行省略效果的长文本，它会在容器宽度不足时截断，并在末尾显示省略号，而不会换到下一行。'

const example: ComponentExample = {
  name: 'text',
  group: 'primitives',
  summary: '正文文本，保留字符串中的换行，可切换颜色、元素与单行省略。',
  states: [
    {
      title: '保留换行',
      element: (
        <Column>
          <Text>{'第一行\n第二行\n第三行'}</Text>
        </Column>
      ),
    },
    {
      title: '颜色与元素',
      element: (
        <Column>
          <Text>主要文字。</Text>
          <Text tone="secondary">次要说明文字。</Text>
          <Text tone="tertiary">三级辅助文字。</Text>
          <Text tone="error">出错提示文字。</Text>
          <Text tone="secondary" as="span">行内渲染的次要文字。</Text>
        </Column>
      ),
    },
    {
      title: '单行省略（ellipsis）',
      element: (
        <Column>
          <Text ellipsis>{LONG}</Text>
        </Column>
      ),
    },
  ],
}

export default example
