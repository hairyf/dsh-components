import type * as React from 'react'
import type { ComponentExample } from './kit'
import { InlineEditor } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

function ControlledEditor(): React.JSX.Element {
  const [draft, setDraft] = useState('初始文本')
  const [saved, setSaved] = useState('初始文本')
  return (
    <Column>
      <InlineEditor
        value={draft}
        label="编辑文本"
        onChange={setDraft}
        onSave={() => setSaved(draft)}
        onCancel={() => setDraft(saved)}
      />
      <span className="pg-note">
        Enter 保存，Shift+Enter 换行，Escape 取消。已保存：
        {saved}
      </span>
    </Column>
  )
}

function UncontrolledEditor(): React.JSX.Element {
  const [saved, setSaved] = useState(false)
  return (
    <Column>
      <InlineEditor
        defaultValue="非受控的初始文本"
        label="非受控编辑"
        onSave={() => setSaved(true)}
        onCancel={() => setSaved(false)}
      />
      <span className="pg-note">{saved ? '已保存' : '未保存'}</span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'inline-editor',
  group: 'primitives',
  summary: '随内容自增高的行内文本编辑器，Enter 保存、Escape 取消。',
  states: [
    { title: '受控（可交互）', element: <ControlledEditor /> },
    { title: '非受控（defaultValue）', element: <UncontrolledEditor /> },
  ],
}

export default example
