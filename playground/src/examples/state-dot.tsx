import type { ComponentExample } from './kit'
import { StateDot } from '@dsh-components'
import { Column, Row } from './kit'

const STATES = [
  { state: 'done', label: '完成' },
  { state: 'warning', label: '注意' },
  { state: 'ongoing', label: '进行中' },
  { state: 'error', label: '失败' },
  { state: 'idle', label: '空闲' },
] as const

const example: ComponentExample = {
  name: 'state-dot',
  group: 'primitives',
  summary: '五种语义的状态点，支持 dot 与 step 两种外观和自定义尺寸。',
  states: [
    {
      title: '五种状态',
      element: (
        <Column>
          {STATES.map(({ state, label }) => (
            <Row key={state}>
              <StateDot state={state} />
              <span className="pg-note">{label}</span>
            </Row>
          ))}
        </Column>
      ),
    },
    {
      title: '自定义尺寸（20）',
      element: <Row>{STATES.map(({ state }) => <StateDot key={state} state={state} size={20} />)}</Row>,
    },
    {
      title: 'step 外观',
      element: <Row>{STATES.map(({ state }) => <StateDot key={state} state={state} appearance="step" />)}</Row>,
    },
  ],
}

export default example
