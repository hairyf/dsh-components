import type { DocumentState } from '@dsh-components'
import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Document } from '@dsh-components'
import { useEffect, useState } from 'react'
import { Column, detailLabels } from './kit'

const DOC_MARKDOWN = [
  '## 使用说明',
  '',
  '这是一段**示例文档**，用来展示标题、段落、列表与代码围栏。',
  '',
  '- 第一项：说明文字',
  '- 第二项：`inline code`',
  '- 第三项：带 [链接](https://example.com) 的条目',
  '',
  '```ts',
  'const answer = 42',
  '```',
].join('\n')

/**
 * Show the failure frame; pressing retry returns to loading, then to the document.
 * @returns the document section.
 */
function RetryDocumentDemo(): React.JSX.Element {
  const [state, setState] = useState<DocumentState>({
    status: 'error',
    message: '读取失败，请重试。',
  })
  useEffect(() => {
    if (state.status !== 'loading')
      return undefined
    const timer = setTimeout(() => {
      setState({
        status: 'found',
        markdown: DOC_MARKDOWN,
      })
    }, 900)
    return () => {
      clearTimeout(timer)
    }
  }, [state.status])
  return (
    <Document
      state={state}
      labels={detailLabels}
      onRetry={() => {
        setState({ status: 'loading' })
      }}
    />
  )
}

const example: ComponentExample = {
  name: 'document',
  group: 'content',
  summary: '滚动区域内渲染一段较长的 Markdown 正文，另有加载占位与失败重试。',
  states: [
    {
      title: '已加载的正文',
      element: (
        <Column>
          <Document state={{ status: 'found', markdown: DOC_MARKDOWN }} labels={detailLabels} onRetry={() => {}} />
        </Column>
      ),
    },
    {
      title: '加载中（骨架线）',
      element: (
        <Column>
          <Document state={{ status: 'loading' }} labels={detailLabels} onRetry={() => {}} />
        </Column>
      ),
    },
    { title: '读取失败（点击重试）', element: <RetryDocumentDemo /> },
  ],
}

export default example
