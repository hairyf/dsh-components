import type { ComponentExample } from './kit'
import { JsonTree } from '@dsh-components'
import { Column, jsonTreeLabels } from './kit'

const TREE_DATA = {
  name: '示例配置',
  version: 2,
  enabled: true,
  tags: [
    'alpha',
    'beta',
    'gamma',
  ],
  limits: {
    retries: 3,
    timeoutMs: 1500,
  },
  notes: '这是一段较长的说明文字，用来展示字符串收起时提供的展开入口。它需要超过设定的行数上限，这样展开按钮才会出现；展开后可以看到完整内容，也可以再收起。',
}

const example: ComponentExample = {
  name: 'json-tree',
  group: 'content',
  summary: '带展开箭头的 JSON 树，可逐层收起节点，也可复制某一项。',
  states: [
    {
      title: '顶层常开（子节点可逐个收起）',
      element: (
        <Column>
          <JsonTree data={TREE_DATA} label="示例配置" labels={jsonTreeLabels} />
        </Column>
      ),
    },
    {
      title: '根节点可收起（点击箭头折叠整棵树）',
      element: (
        <Column>
          <JsonTree data={TREE_DATA} label="示例配置" labels={jsonTreeLabels} expandTopLevel={false} />
        </Column>
      ),
    },
    {
      title: '长字符串折叠（每段只显示 1 行，可展开）',
      element: (
        <Column>
          <JsonTree data={TREE_DATA} label="示例配置" labels={jsonTreeLabels} collapsedStringLines={1} />
        </Column>
      ),
    },
  ],
}

export default example
