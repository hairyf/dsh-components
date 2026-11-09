import type { ComponentExample } from './kit'
import { CodeBlock } from '@dsh-components'
import { Column, toolbarLabels } from './kit'

const SUM_CODE = `export function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

export function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : sum(values) / values.length
}`

const LONG_LINE_CODE = 'const summary = \'这里是一段很长的文字，用来观察自动换行开关在单行超长内容上的效果；打开换行时整段会折成多行，关闭换行时则保留水平滚动，内容一个字符都不会丢失。\''

const CSS_SNIPPET = `.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
}`

const example: ComponentExample = {
  name: 'code-block',
  group: 'content',
  summary: '等宽代码块，带语言标签、行号、换行开关与复制按钮。',
  states: [
    {
      title: '带顶部标签与行号',
      element: (
        <Column>
          <CodeBlock
            code={SUM_CODE}
            lang="ts"
            lineNumbers
            toolbarLabels={toolbarLabels}
            copyLabel="复制"
            copiedLabel="已复制"
          />
        </Column>
      ),
    },
    {
      title: '超长单行（切换自动换行）',
      element: (
        <Column>
          <CodeBlock
            code={LONG_LINE_CODE}
            lang="ts"
            toolbarLabels={toolbarLabels}
            copyLabel="复制"
            copiedLabel="已复制"
          />
        </Column>
      ),
    },
    {
      title: '朴素横幅（只有语言与复制）',
      element: (
        <Column>
          <CodeBlock code={CSS_SNIPPET} lang="css" copyLabel="复制" copiedLabel="已复制" />
        </Column>
      ),
    },
  ],
}

export default example
