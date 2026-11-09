import type { OptionGroupItem, SelectOption } from '@dsh-components'
import type { ComponentExample } from './kit'
import { OptionGroup, Select, SettingsGroup, SettingsRow, Stepper, Switch } from '@dsh-components'
import { useState } from 'react'
import { Column, Glyph } from './kit'

const DENSITY_OPTIONS: readonly OptionGroupItem[] = [
  { id: 'cozy', label: '宽松', icon: <Glyph /> },
  { id: 'normal', label: '标准', icon: <Glyph /> },
  { id: 'compact', label: '紧凑', icon: <Glyph /> },
]

const ORDER_OPTIONS: readonly SelectOption[] = [
  { id: 'name', label: '按名称', icon: <Glyph /> },
  { id: 'time', label: '按时间', icon: <Glyph /> },
  { id: 'size', label: '按大小', icon: <Glyph /> },
]

/** A group with a heading and two rows, one of them without a control. */
function BasicGroup(): React.JSX.Element {
  const [tips, setTips] = useState(true)
  return (
    <SettingsGroup title="基本设置" description="作用于当前视图">
      <SettingsRow title="显示提示" description="在操作后给出简短反馈">
        <Switch checked={tips} onChange={setTips} label="显示提示" />
      </SettingsRow>
      <SettingsRow title="只读信息" description="这一行没有右侧控件" />
    </SettingsGroup>
  )
}

/** A collapsible group: it starts closed and reveals its rows from the header arrow. */
function CollapsibleGroup(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState(20)
  return (
    <SettingsGroup
      title="更多设置"
      description="默认收起，点击右侧箭头展开"
      collapsible
      open={open}
      onOpenChange={setOpen}
      expandLabel="展开更多设置"
      collapseLabel="收起更多设置"
    >
      <SettingsRow title="每页条目" description="一次展示的条目数量">
        <Stepper
          value={rows}
          min={5}
          max={50}
          step={5}
          unit="项"
          increaseLabel="增加条目"
          decreaseLabel="减少条目"
          onChange={setRows}
        />
      </SettingsRow>
    </SettingsGroup>
  )
}

/** One settings panel assembled from the settings components. */
function SettingsPanel(): React.JSX.Element {
  const [tips, setTips] = useState(true)
  const [rows, setRows] = useState(20)
  const [density, setDensity] = useState('cozy')
  const [order, setOrder] = useState('name')
  const [advanced, setAdvanced] = useState(false)
  const [gap, setGap] = useState(8)
  return (
    <Column>
      <SettingsGroup title="显示设置" description="更改会立即生效">
        <SettingsRow title="显示提示" description="在操作后给出简短反馈">
          <Switch checked={tips} onChange={setTips} label="显示提示" />
        </SettingsRow>
        <SettingsRow title="每页条目" description="一次展示的条目数量">
          <Stepper
            value={rows}
            min={5}
            max={50}
            step={5}
            unit="项"
            increaseLabel="增加条目"
            decreaseLabel="减少条目"
            onChange={setRows}
          />
        </SettingsRow>
        <SettingsRow title="排列密度" description="条目之间的远近" stacked>
          <OptionGroup
            value={density}
            options={DENSITY_OPTIONS}
            onChange={setDensity}
            label="排列密度"
            columns={3}
          />
        </SettingsRow>
        <SettingsRow title="排序方式" description="列表的默认顺序">
          <Select value={order} options={ORDER_OPTIONS} onChange={setOrder} />
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup
        title="高级选项"
        description="不常用的调整"
        collapsible
        open={advanced}
        onOpenChange={setAdvanced}
        expandLabel="展开高级选项"
        collapseLabel="收起高级选项"
      >
        <SettingsRow title="行间距" description="条目之间的留白">
          <Stepper
            value={gap}
            min={0}
            max={24}
            unit="px"
            increaseLabel="增加行间距"
            decreaseLabel="减少行间距"
            onChange={setGap}
          />
        </SettingsRow>
      </SettingsGroup>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'settings-group',
  group: 'settings',
  summary: '一组带标题与说明的设置行，可选择折叠，也可以把多组设置拼装成一整块设置面板。',
  states: [
    { title: '带标题与说明的分组', element: <BasicGroup /> },
    { title: '可折叠分组：点击箭头展开或收起', element: <CollapsibleGroup /> },
    { title: '组合成一个设置面板', element: <SettingsPanel /> },
  ],
}

export default example
