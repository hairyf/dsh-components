import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Button, Toast } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

let nextToastId = 0

function SuccessToasts(): React.JSX.Element {
  const [ids, setIds] = useState<number[]>([])
  const push = (): void => {
    nextToastId += 1
    setIds(list => [...list, nextToastId])
  }
  const remove = (id: number): void => {
    setIds(list => list.filter(item => item !== id))
  }
  return (
    <Column>
      <Button variant="outline" onClick={push}>显示成功提示</Button>
      <span className="pg-note">提示会滑入、停留 3 秒、淡出后自动移除。</span>
      {ids.map(id => <Toast key={id} text="已保存" tone="success" onDone={() => remove(id)} />)}
    </Column>
  )
}

function ActionToast(): React.JSX.Element {
  const [visible, setVisible] = useState(false)
  return (
    <Column>
      <Button variant="outline" onClick={() => setVisible(true)}>显示带操作的提示</Button>
      {visible && (
        <Toast
          text="已删除一条内容"
          holdMs={5000}
          actions={[
            {
              prefix: '，',
              label: '撤销',
              onClick: () => setVisible(false),
            },
          ]}
          onDone={() => setVisible(false)}
        />
      )}
    </Column>
  )
}

const example: ComponentExample = {
  name: 'toast',
  group: 'primitives',
  summary: 'body 级 portal 的顶部提示条，可带成功图标与行内操作。',
  states: [
    { title: '成功提示（可交互）', element: <SuccessToasts /> },
    { title: '带行内操作（可交互）', element: <ActionToast /> },
  ],
}

export default example
