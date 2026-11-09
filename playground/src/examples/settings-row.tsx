import type { ComponentExample } from './kit'
import { SettingsRow, Stepper, Switch } from '@dsh-components'
import { useState } from 'react'

/** Title and description on the left, a switch on the right. */
function SwitchRow(): React.JSX.Element {
  const [checked, setChecked] = useState(true)
  return (
    <SettingsRow title="显示提示" description="在操作后给出简短反馈">
      <Switch checked={checked} onChange={setChecked} label="显示提示" />
    </SettingsRow>
  )
}

/** The control moves under the text and takes the full row width. */
function StackedRow(): React.JSX.Element {
  const [value, setValue] = useState(20)
  return (
    <SettingsRow title="每页条目" description="控件放在说明下方" stacked>
      <Stepper
        value={value}
        min={5}
        max={50}
        step={5}
        unit="项"
        increaseLabel="增加条目"
        decreaseLabel="减少条目"
        onChange={setValue}
      />
    </SettingsRow>
  )
}

/** An unavailable row: the control is inert, so it cannot be focused or operated. */
function DisabledRow(): React.JSX.Element {
  const [checked, setChecked] = useState(true)
  return (
    <SettingsRow title="自动保存" description="当前条件下不可用" disabled>
      <Switch checked={checked} onChange={setChecked} label="自动保存" />
    </SettingsRow>
  )
}

const example: ComponentExample = {
  name: 'settings-row',
  group: 'settings',
  summary: '一条设置行：左侧是标题与说明，右侧放调用方自己的控件，可把控件换到下方或整行停用。',
  states: [
    { title: '标题、说明与右侧开关', element: <SwitchRow /> },
    { title: '控件置于下方', element: <StackedRow /> },
    { title: '不可用的整行', element: <DisabledRow /> },
  ],
}

export default example
