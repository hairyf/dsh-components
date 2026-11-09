import type { MeterSegment } from '@dsh-components'
import type { ComponentExample } from './kit'
import { Meter, Stack } from '@dsh-components'
import { useState } from 'react'

const SEGMENTS: readonly MeterSegment[] = [
  { key: 'main', value: 46, tone: 'var(--dsw-alias-state-business-primary)' },
  { key: 'media', value: 32, tone: 'var(--dsw-alias-state-success-primary)' },
  { key: 'rest', value: 22, tone: 'var(--dsw-alias-state-warn-primary)' },
]

/** The panel body the meter reveals while it is open. */
function MeterDetails(): React.JSX.Element {
  return (
    <Stack gap={4}>
      <span>主要部分 46%</span>
      <span>媒体部分 32%</span>
      <span>其他部分 22%</span>
    </Stack>
  )
}

/** A closed ring meter that opens its panel on press. */
function RingMeter(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <Meter value={0.35} label="35%" detail="已使用" segments={SEGMENTS} open={open} onOpenChange={setOpen}>
      <MeterDetails />
    </Meter>
  )
}

/** A meter whose panel starts open, so the composition bar is visible at once. */
function OpenMeter(): React.JSX.Element {
  const [open, setOpen] = useState(true)
  return (
    <Meter value={0.35} label="35%" detail="已使用" segments={SEGMENTS} open={open} onOpenChange={setOpen}>
      <MeterDetails />
    </Meter>
  )
}

/** A ring near its limit, still openable. */
function NearLimitMeter(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <Meter value={0.94} label="94%" detail="接近上限" segments={SEGMENTS} open={open} onOpenChange={setOpen}>
      <MeterDetails />
    </Meter>
  )
}

const example: ComponentExample = {
  name: 'meter',
  group: 'layout',
  summary: '一个环形占用读数，按下后展开面板，显示由多段色条组成的构成比例。',
  states: [
    { title: '闭合读数：点击圆环打开面板', element: <RingMeter /> },
    { title: '默认打开面板：多段构成条', element: <OpenMeter /> },
    { title: '接近上限的读数', element: <NearLimitMeter /> },
  ],
}

export default example
