import type * as React from 'react'
import type { ComponentExample } from './kit'
import { DatePicker } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

/** Monday-first weekday headings. */
const WEEKDAYS: readonly string[] = ['一', '二', '三', '四', '五', '六', '日']

/** Two-digit month or day. */
function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** The month the range state is pinned to. */
const NOW = new Date()
const MONTH_PREFIX = `${String(NOW.getFullYear())}-${pad(NOW.getMonth() + 1)}`
const RANGE_MIN = `${MONTH_PREFIX}-05`
const RANGE_MAX = `${MONTH_PREFIX}-25`

/** The panel on its own month, reporting the picked day. */
function BasicDatePicker(): React.JSX.Element {
  const [value, setValue] = useState<string | undefined>(undefined)
  return (
    <Column>
      <DatePicker
        value={value}
        onChange={setValue}
        weekdayLabels={WEEKDAYS}
        todayLabel="今天"
      />
      <span className="pg-note">
        已选日期：
        {value ?? '（未选择）'}
      </span>
    </Column>
  )
}

/** Only the middle of the shown month is selectable. */
function RangeDatePicker(): React.JSX.Element {
  const [value, setValue] = useState(RANGE_MIN)
  return (
    <Column>
      <DatePicker
        value={value}
        onChange={setValue}
        min={RANGE_MIN}
        max={RANGE_MAX}
        weekdayLabels={WEEKDAYS}
        todayLabel="今天"
      />
      <span className="pg-note">
        {RANGE_MIN}
        {' 至 '}
        {RANGE_MAX}
        {' 之外的日子不可选，当前：'}
        {value}
      </span>
    </Column>
  )
}

/** A controlled month: navigation reports the month it moved to. */
function ControlledMonthPicker(): React.JSX.Element {
  const [month, setMonth] = useState(() => new Date())
  const [value, setValue] = useState<string | undefined>(undefined)
  return (
    <Column>
      <DatePicker
        value={value}
        onChange={setValue}
        month={month}
        onMonthChange={setMonth}
        weekdayLabels={WEEKDAYS}
        todayLabel="今天"
      />
      <span className="pg-note">
        月份由外部控制，已选日期：
        {value ?? '（未选择）'}
      </span>
    </Column>
  )
}

/** A disabled panel keeps its month and its day, but nothing moves. */
function DisabledDatePicker(): React.JSX.Element {
  const [value, setValue] = useState(RANGE_MIN)
  return (
    <Column>
      <DatePicker
        value={value}
        onChange={setValue}
        disabled
        weekdayLabels={WEEKDAYS}
        todayLabel="今天"
      />
      <span className="pg-note">禁用后不能切换月份，也不能选择日期。</span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'date-picker',
  group: 'primitives',
  summary: '一个月历面板：可翻月、选日期，可限制可选范围，也可整块禁用。',
  states: [
    { title: '选择日期并回显', element: <BasicDatePicker /> },
    { title: '限制可选范围（本月 5 日至 25 日）', element: <RangeDatePicker /> },
    { title: '受控月份：翻月后由外部保存月份', element: <ControlledMonthPicker /> },
    { title: '禁用', element: <DisabledDatePicker /> },
  ],
}

export default example
