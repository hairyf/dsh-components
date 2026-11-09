import type * as React from 'react'
import type { ComponentExample } from './kit'
import { ActionCard } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

/** Longer than the fold budget (about 130 CJK characters), so the toggle always appears. */
const LONG_BRIEF = '这份示例卡片用来展示较长的正文折叠。正文超过两行时会保留一段预览，其余部分在点开之前不显示；展开后仍保持原文，不会改写任何标点或换行。你可以先看预览，再决定是否展开全部内容。折叠宽度按字符估算，中文按两个字宽计算，因此中英文混排时预览长度大致相同。最后一句用来把总长度推过折叠阈值，确保展开开关出现。'

/** A short brief that fits without a fold toggle. */
const SHORT_BRIEF = '将删除三份过期缓存文件，删除后无法恢复。'

/**
 * Fold, expand and dismiss the card through its owner-controlled state.
 * @returns the card inside the gallery column.
 */
function FoldableCardDemo(): React.JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  return (
    <Column>
      <ActionCard
        title="清理临时文件"
        brief={LONG_BRIEF}
        expanded={expanded}
        expandLabel="展开全文"
        collapseLabel="收起全文"
        dismissLabel="暂不需要"
        phase={dismissed
          ? 'dismissed'
          : undefined}
        decided={dismissed}
        onExpandedChange={setExpanded}
        onDismiss={() => {
          setDismissed(true)
        }}
      />
    </Column>
  )
}

/**
 * Start fully expanded and let the reader fold the text back.
 * @returns the card inside the gallery column.
 */
function ExpandedCardDemo(): React.JSX.Element {
  const [expanded, setExpanded] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  return (
    <Column>
      <ActionCard
        title="清理临时文件"
        brief={LONG_BRIEF}
        expanded={expanded}
        expandLabel="展开全文"
        collapseLabel="收起全文"
        dismissLabel="暂不需要"
        phase={dismissed
          ? 'dismissed'
          : undefined}
        decided={dismissed}
        onExpandedChange={setExpanded}
        onDismiss={() => {
          setDismissed(true)
        }}
      />
    </Column>
  )
}

/**
 * Show the failure line; the next dismiss press clears it.
 * @returns the card inside the gallery column.
 */
function ErrorCardDemo(): React.JSX.Element {
  const [error, setError] = useState<string | undefined>('忽略时发生错误，请稍后重试。')
  return (
    <Column>
      <ActionCard
        title="清理临时文件"
        brief={SHORT_BRIEF}
        error={error}
        dismissLabel="暂不需要"
        onDismiss={() => {
          setError(undefined)
        }}
      />
    </Column>
  )
}

const example: ComponentExample = {
  name: 'action-card',
  group: 'feedback',
  summary: '带折叠正文、阶段状态与忽略操作的建议卡片。',
  states: [
    { title: '折叠正文（可展开、可忽略）', element: <FoldableCardDemo /> },
    { title: '已展开全文（可收起）', element: <ExpandedCardDemo /> },
    {
      title: '已忽略',
      element: (
        <Column>
          <ActionCard title="清理临时文件" brief={SHORT_BRIEF} phase="dismissed" decided />
        </Column>
      ),
    },
    { title: '操作失败（再次忽略可清除）', element: <ErrorCardDemo /> },
  ],
}

export default example
