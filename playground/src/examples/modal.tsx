import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Button, Modal } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

function StandardModal(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <Column>
      <Button variant="outline" onClick={() => setOpen(true)}>打开对话框</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="删除条目"
        description="该操作不可撤销。"
        closeLabel="关闭"
        footer={(
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>删除</Button>
          </>
        )}
      >
        <p>删除后，该条目的内容将无法恢复。</p>
      </Modal>
    </Column>
  )
}

function HeadlessModal(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <Column>
      <Button variant="outline" onClick={() => setOpen(true)}>打开无壳对话框</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="自定义内容" headless>
        <div style={{ padding: 24 }}>
          <p>无壳模式由调用方提供标题与关闭控件。</p>
          <Button variant="primary" onClick={() => setOpen(false)}>完成</Button>
        </div>
      </Modal>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'modal',
  group: 'primitives',
  summary: 'body 级对话框：标题、描述、页脚与无壳模式，Escape 或遮罩可关闭。',
  states: [
    { title: '标准对话框（可交互）', element: <StandardModal /> },
    { title: '无壳对话框（可交互）', element: <HeadlessModal /> },
  ],
}

export default example
