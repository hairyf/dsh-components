import type { ComponentExample } from './kit'
import { Button, Stack } from '@dsh-components'
import { useState } from 'react'

const LABELS = ['确定', '取消', '重置', '继续', '返回', '关闭']

/** A vertical stack of controls, one of which is current. */
function VerticalStack(): React.JSX.Element {
  const [current, setCurrent] = useState(LABELS[0])
  return (
    <Stack gap={8} align="flex-start">
      {LABELS.slice(0, 3).map(label => (
        <Button
          key={label}
          size="sm"
          variant={label === current
            ? 'primary'
            : 'outline'}
          onClick={() => {
            setCurrent(label)
          }}
        >
          {label}
        </Button>
      ))}
    </Stack>
  )
}

/** A horizontal stack spread across the full width. */
function HorizontalStack(): React.JSX.Element {
  const [current, setCurrent] = useState(LABELS[0])
  return (
    <Stack direction="row" gap={12} align="center" justify="space-between">
      {LABELS.slice(0, 3).map(label => (
        <Button
          key={label}
          size="sm"
          variant={label === current
            ? 'primary'
            : 'outline'}
          onClick={() => {
            setCurrent(label)
          }}
        >
          {label}
        </Button>
      ))}
    </Stack>
  )
}

/** A horizontal stack that wraps onto more lines. */
function WrappedStack(): React.JSX.Element {
  const [current, setCurrent] = useState(LABELS[0])
  return (
    <Stack direction="row" gap={8} wrap>
      {LABELS.map(label => (
        <Button
          key={label}
          size="sm"
          variant={label === current
            ? 'primary'
            : 'outline'}
          onClick={() => {
            setCurrent(label)
          }}
        >
          {label}
        </Button>
      ))}
    </Stack>
  )
}

const example: ComponentExample = {
  name: 'stack',
  group: 'layout',
  summary: '受控的弹性排列容器：可选纵向或横向、间距、对齐方式、主轴分布与换行。',
  states: [
    { title: '纵向排列，间距 8px', element: <VerticalStack /> },
    { title: '横向排列，两端分布', element: <HorizontalStack /> },
    { title: '允许换行的横向排列', element: <WrappedStack /> },
  ],
}

export default example
