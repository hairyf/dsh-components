import type { ComponentExample } from './kit'
import { IconButton, MarkdownText, PreviewFrame } from '@dsh-components'
import { useState } from 'react'
import { Column, Glyph, markdownLabels } from './kit'

const DOC = [
  '## 预览正文',
  '',
  '外壳只负责顶部的路径行与内容区，正文由调用方提供。',
  '',
  '- 路径可以省略',
  '- 头部操作可以省略',
].join('\n')

/**
 * A frame whose header carries the path and two icon actions.
 * @returns the frame and a caption naming the last action.
 */
function FrameWithActions(): React.JSX.Element {
  const [copied, setCopied] = useState(false)
  const [last, setLast] = useState('尚未操作')
  return (
    <Column>
      <PreviewFrame
        title="/示例目录/说明文档.md"
        headerActions={(
          <>
            <IconButton
              icon={<Glyph />}
              label="刷新内容"
              onClick={() => {
                setLast('已刷新')
              }}
            />
            <IconButton
              icon={<Glyph />}
              label="复制路径"
              pressed={copied}
              onClick={() => {
                setCopied(value => !value)
                setLast(copied ? '已取消复制' : '已复制路径')
              }}
            />
          </>
        )}
      >
        <MarkdownText text={DOC} labels={markdownLabels} />
      </PreviewFrame>
      <span className="pg-note">{`最近操作：${last}`}</span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'preview-frame',
  group: 'viewer',
  summary: '预览外壳：一行路径、可选的操作按钮和一块内容区，头部高度始终一致。',
  states: [
    { title: '路径加两个头部操作（可切换按下态）', element: <FrameWithActions /> },
    {
      title: '只有路径，没有头部操作',
      element: (
        <Column>
          <PreviewFrame title="/示例目录/说明文档.md">
            <MarkdownText text={DOC} labels={markdownLabels} />
          </PreviewFrame>
        </Column>
      ),
    },
    {
      title: '不传路径与操作：头部仍保留高度，只有内容',
      element: (
        <Column>
          <PreviewFrame>
            <MarkdownText text={DOC} labels={markdownLabels} />
          </PreviewFrame>
        </Column>
      ),
    },
  ],
}

export default example
