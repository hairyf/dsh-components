import type { ComponentExample } from './kit'
import { Button, Toolbar } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

/**
 * A bar with three actions on the left and one switch on the right.
 * @returns the bar and a caption naming the last action.
 */
function ActionsWithSwitch(): React.JSX.Element {
  const [autoSave, setAutoSave] = useState(true)
  const [last, setLast] = useState('尚未操作')
  return (
    <Column>
      <Toolbar
        actions={(
          <>
            <Button
              variant="toolbar"
              size="sm"
              onClick={() => {
                setLast('已保存')
              }}
            >
              保存
            </Button>
            <Button
              variant="toolbar"
              size="sm"
              onClick={() => {
                setLast('已撤销')
              }}
            >
              撤销
            </Button>
            <Button
              variant="toolbar"
              size="sm"
              onClick={() => {
                setLast('更多')
              }}
            >
              更多
            </Button>
          </>
        )}
        toggle={{ checked: autoSave, onChange: setAutoSave, label: '自动保存' }}
      />
      <span className="pg-note">
        {`最近操作：${last}；自动保存${autoSave ? '已开启' : '已关闭'}`}
      </span>
    </Column>
  )
}

/**
 * A bar that only carries actions.
 * @returns the bar without a right-edge switch.
 */
function ActionsOnly(): React.JSX.Element {
  return (
    <Column>
      <Toolbar
        actions={(
          <>
            <Button variant="toolbar" size="sm">刷新</Button>
            <Button variant="toolbar" size="sm">复制</Button>
            <Button variant="toolbar" size="sm" disabled>删除</Button>
          </>
        )}
      />
      <span className="pg-note">没有开关时，操作区保持在左侧，禁用项以弱化色调显示。</span>
    </Column>
  )
}

/**
 * A bar that puts its own content before the actions and does not stick.
 * @returns the bar and a caption about its placement.
 */
function ContentAndActions(): React.JSX.Element {
  const [count, setCount] = useState(3)
  return (
    <Column>
      <Toolbar
        sticky={false}
        actions={(
          <>
            <Button
              variant="toolbar"
              size="sm"
              onClick={() => {
                setCount(6)
              }}
            >
              全选
            </Button>
            <Button
              variant="toolbar"
              size="sm"
              onClick={() => {
                setCount(0)
              }}
            >
              清空
            </Button>
          </>
        )}
      >
        <span className="pg-note">
          {count === 0
            ? '没有选中项'
            : `已选中 ${String(count)} 项`}
        </span>
      </Toolbar>
      <span className="pg-note">sticky 设为 false 后，工具栏随页面滚动，不再吸附在顶部。</span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'toolbar',
  group: 'layout',
  summary: '滚动区域的顶部工具栏：左侧放操作按钮，右侧可挂一个开关。',
  states: [
    { title: '操作与右侧开关（可点击切换）', element: <ActionsWithSwitch /> },
    { title: '只有操作，没有开关', element: <ActionsOnly /> },
    { title: '前置内容与操作，并取消吸附', element: <ContentAndActions /> },
  ],
}

export default example
