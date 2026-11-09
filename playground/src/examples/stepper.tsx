import type { ComponentExample } from './kit'
import { Stepper } from '@dsh-components'
import { useState } from 'react'
import { Row } from './kit'

/** A stepper inside its range, stepping by one. */
function StandardStepper(): React.JSX.Element {
  const [value, setValue] = useState(3)
  return (
    <Row>
      <Stepper
        value={value}
        min={1}
        max={10}
        unit="项"
        increaseLabel="增加"
        decreaseLabel="减少"
        onChange={setValue}
      />
    </Row>
  )
}

/** A stepper that starts at its maximum, so the up arrow is disabled. */
function MaxedStepper(): React.JSX.Element {
  const [value, setValue] = useState(10)
  return (
    <Row>
      <Stepper
        value={value}
        min={0}
        max={10}
        unit="项"
        increaseLabel="增加"
        decreaseLabel="减少"
        onChange={setValue}
      />
    </Row>
  )
}

/** A stepper with a wider step. */
function WideStepStepper(): React.JSX.Element {
  const [value, setValue] = useState(40)
  return (
    <Row>
      <Stepper
        value={value}
        min={0}
        max={100}
        step={5}
        unit="%"
        increaseLabel="增加 5%"
        decreaseLabel="减少 5%"
        onChange={setValue}
      />
    </Row>
  )
}

/** A disabled stepper: both arrows refuse input. */
function DisabledStepper(): React.JSX.Element {
  const [value, setValue] = useState(5)
  return (
    <Row>
      <Stepper
        value={value}
        min={1}
        max={10}
        unit="项"
        increaseLabel="增加"
        decreaseLabel="减少"
        onChange={setValue}
        disabled
      />
    </Row>
  )
}

const example: ComponentExample = {
  name: 'stepper',
  group: 'settings',
  summary: '一个数值胶囊，悬停或聚焦时露出上下箭头，按范围夹取后把新值交给调用方。',
  states: [
    { title: '步长 1：悬停后露出上下箭头', element: <StandardStepper /> },
    { title: '到达上限：向上箭头禁用', element: <MaxedStepper /> },
    { title: '步长 5：大跨度调整', element: <WideStepStepper /> },
    { title: '禁用', element: <DisabledStepper /> },
  ],
}

export default example
