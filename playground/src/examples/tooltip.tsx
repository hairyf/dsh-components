import type { ComponentExample } from './kit'
import { Button, Tooltip } from '@dsh-components'
import { Column, Row } from './kit'

const example: ComponentExample = {
  name: 'tooltip',
  group: 'primitives',
  summary: '克隆锚点元素的浮层提示：悬停或聚焦触发，也可点击固定。',
  states: [
    {
      title: '悬停 / 聚焦触发',
      element: (
        <Column>
          <Row>
            <Tooltip label="刷新内容" side="top"><Button variant="outline">上方提示</Button></Tooltip>
            <Tooltip label="打开设置" side="bottom"><Button variant="ghost">下方提示</Button></Tooltip>
          </Row>
        </Column>
      ),
    },
    {
      title: '点击固定（openOnClick）',
      element: (
        <Row>
          <Tooltip label="点击后保持显示，点击外部关闭" openOnClick side="top">
            <Button variant="outline">点击我</Button>
          </Tooltip>
        </Row>
      ),
    },
    {
      title: '带快捷键键帽',
      element: (
        <Row>
          <Tooltip label="复制" shortcutKeys={['Ctrl', '+', 'C']} side="right">
            <Button variant="ghost">快捷键提示</Button>
          </Tooltip>
        </Row>
      ),
    },
    {
      title: '禁用（不显示浮层）',
      element: (
        <Row>
          <Tooltip label="不会出现" disabled side="top"><Button variant="outline">禁用提示</Button></Tooltip>
        </Row>
      ),
    },
  ],
}

export default example
