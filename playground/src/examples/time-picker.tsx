import type * as React from 'react'
import type { ComponentExample } from './kit'
import { TimePicker } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

/** The default clock, reporting the picked hour and minute. */
function BasicTimePicker(): React.JSX.Element {
  const [value, setValue] = useState('09:30')
  return (
    <Column>
      <TimePicker value={value} onChange={setValue} />
      <span className="pg-note">
        已选时间：
        {value}
      </span>
    </Column>
  )
}

/** Minute options every fifteen minutes. */
function SteppedTimePicker(): React.JSX.Element {
  const [value, setValue] = useState('14:45')
  return (
    <Column>
      <TimePicker value={value} onChange={setValue} minuteStep={15} />
      <span className="pg-note">
        分钟按 15 分钟步进，已选：
        {value}
      </span>
    </Column>
  )
}

/** No value yet: the clock starts at midnight and reports the first pick. */
function UnsetTimePicker(): React.JSX.Element {
  const [value, setValue] = useState<string | undefined>(undefined)
  return (
    <Column>
      <TimePicker value={value} onChange={setValue} minuteStep={5} />
      <span className="pg-note">
        未设置时从 00:00 开始，当前：
        {value ?? '（未选择）'}
      </span>
    </Column>
  )
}

/** A disabled clock keeps its selection and ignores clicks. */
function DisabledTimePicker(): React.JSX.Element {
  const [value, setValue] = useState('08:00')
  return (
    <Column>
      <TimePicker value={value} onChange={setValue} disabled />
      <span className="pg-note">禁用后小时与分钟都不能选择。</span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'time-picker',
  group: 'primitives',
  summary: '两列时钟面板：左列小时、右列分钟，选择后回传完整的时:分文本。',
  states: [
    { title: '选择时间并回显', element: <BasicTimePicker /> },
    { title: '分钟按 15 分钟步进', element: <SteppedTimePicker /> },
    { title: '未设置值：从 00:00 开始', element: <UnsetTimePicker /> },
    { title: '禁用', element: <DisabledTimePicker /> },
  ],
}

export default example
