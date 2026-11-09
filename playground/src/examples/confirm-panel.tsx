import type * as React from 'react'
import type { ComponentExample } from './kit'
import { ConfirmPanel } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

/**
 * Record which of the three actions the reader picked.
 * @returns the decision card and the recorded choice.
 */
function ThreeWayDecisionDemo(): React.JSX.Element {
  const [choice, setChoice] = useState('尚未选择。')
  return (
    <Column>
      <ConfirmPanel
        title="确定删除这条记录吗？"
        description="删除后无法恢复。"
        detail="records/2024-06-01.json"
        confirmLabel="删除"
        cancelLabel="取消"
        alternateLabel="先备份"
        onConfirm={() => {
          setChoice('已确认删除。')
        }}
        onCancel={() => {
          setChoice('已取消。')
        }}
        onAlternate={() => {
          setChoice('已选择先备份。')
        }}
      />
      <span>{choice}</span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'confirm-panel',
  group: 'feedback',
  summary: '给出两个或三个动作的确认卡片，等待读者做决定。',
  states: [
    { title: '三个动作（点击后记录选择）', element: <ThreeWayDecisionDemo /> },
    {
      title: '警告语气 + 处理中',
      element: (
        <Column>
          <ConfirmPanel
            tone="warning"
            title="覆盖同名文件吗？"
            description="原有内容会被替换。"
            detail="output/report.pdf"
            confirmLabel="覆盖"
            cancelLabel="取消"
            busy
            onConfirm={() => {}}
            onCancel={() => {}}
          />
        </Column>
      ),
    },
    {
      title: '全部动作不可用',
      element: (
        <Column>
          <ConfirmPanel
            title="确认后继续吗？"
            description="当前无法执行该操作。"
            confirmLabel="继续"
            cancelLabel="返回"
            disabled
            onConfirm={() => {}}
            onCancel={() => {}}
          />
        </Column>
      ),
    },
  ],
}

export default example
