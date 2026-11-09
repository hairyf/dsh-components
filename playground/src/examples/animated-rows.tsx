import type * as React from 'react'
import type { ComponentExample } from './kit'
import { AnimatedRows, Button } from '@dsh-components'
import { useState } from 'react'
import { Column, Row } from './kit'

const ROWS = ['第一行', '第二行', '第三行', '第四行', '第五行']

function InteractiveRows(): React.JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(ROWS)
  const toggle = (): void => {
    setVisible(current => (current.length === ROWS.length
      ? ROWS.slice(0, 2)
      : ROWS))
  }
  return (
    <Column>
      <div style={{ position: 'relative' }}>
        <AnimatedRows
          className="pg-column"
          rowKeys={visible}
          ready
          resetKey="rows"
        >
          <Row>
            <Button size="sm" variant="outline" onClick={toggle}>
              {visible.length === ROWS.length
                ? '隐藏后三行'
                : '显示全部行'}
            </Button>
          </Row>
          {visible.map(label => (
            <div key={label} data-row-key={label} className="pg-note">
              {label}
            </div>
          ))}
        </AnimatedRows>
      </div>
      <span className="pg-note">
        点击按钮增删行；在列表内点击或按键之后，行会淡入淡出并滑动到新位置。
      </span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'animated-rows',
  group: 'primitives',
  summary: '带 data-row-key 的列表在增删或换序时做位置与透明度过渡。',
  states: [
    { title: '可交互（增删行）', element: <InteractiveRows /> },
    {
      title: '未就绪（ready=false）',
      element: (
        <Column>
          <AnimatedRows className="pg-column" rowKeys={['甲', '乙']} ready={false} resetKey="static">
            <div data-row-key="甲" className="pg-note">甲</div>
            <div data-row-key="乙" className="pg-note">乙</div>
          </AnimatedRows>
          <span className="pg-note">ready 为 false 时只渲染内容，不启动过渡。</span>
        </Column>
      ),
    },
  ],
}

export default example
