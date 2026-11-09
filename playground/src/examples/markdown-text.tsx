import type { ComponentExample } from './kit'
import { MarkdownText } from '@dsh-components'
import { Column, markdownLabels } from './kit'

const BODY_DOC = [
  '## 示例文档',
  '',
  '这是一段**加粗**、*斜体*与~~删除线~~混排的文字，行内代码写作 `const value = 1`。',
  '',
  '- 列表项一',
  '- 列表项二',
  '  - 嵌套项',
  '',
  '> 引用文字用于展示左侧边框与缩进。',
  '',
  '| 章节 | 页数 | 状态 |',
  '| --- | --- | --- |',
  '| 第一章 | 24 | 已读 |',
  '| 第二章 | 31 | 在读 |',
  '',
  '更多说明见 [示例链接](https://example.com)。',
].join('\n')

const FENCE_DOC = [
  '### 围栏代码',
  '',
  '围栏代码块在正文里同样带有语言标签与复制按钮：',
  '',
  '```ts',
  'export function twice(value: number): number {',
  '  return value * 2',
  '}',
  '```',
].join('\n')

const COMPACT_DOC = [
  '**紧凑排版**：标题、段落与列表的字号都会收小，适合放在信息较密的区域。',
  '',
  '- 第一项',
  '- 第二项',
].join('\n')

const example: ComponentExample = {
  name: 'markdown-text',
  group: 'content',
  summary: '把 Markdown 源文本渲染为标题、列表、表格与代码块。',
  states: [
    {
      title: '正文排版（标题、列表、引用、表格）',
      element: (
        <Column>
          <MarkdownText text={BODY_DOC} labels={markdownLabels} />
        </Column>
      ),
    },
    {
      title: '围栏代码块',
      element: (
        <Column>
          <MarkdownText text={FENCE_DOC} labels={markdownLabels} />
        </Column>
      ),
    },
    {
      title: '紧凑变体',
      element: (
        <Column>
          <MarkdownText text={COMPACT_DOC} labels={markdownLabels} variant="compact" />
        </Column>
      ),
    },
  ],
}

export default example
