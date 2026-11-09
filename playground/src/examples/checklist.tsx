import type { ChecklistItem } from '@dsh-components'
import type { ComponentExample } from './kit'
import { Checklist } from '@dsh-components'

const MIXED: readonly ChecklistItem[] = [
  { id: 'first', label: '确认提交信息', status: 'done' },
  { id: 'second', label: '正在核对内容', status: 'active' },
  { id: 'third', label: '补充备注', status: 'pending' },
  { id: 'fourth', label: '通知相关成员', status: 'pending' },
]

const FINISHED: readonly ChecklistItem[] = [
  { id: 'a', label: '整理条目', status: 'done' },
  { id: 'b', label: '检查格式', status: 'done' },
  { id: 'c', label: '提交结果', status: 'done' },
]

const example: ComponentExample = {
  name: 'checklist',
  group: 'layout',
  summary: '带状态圆点的条目标列表，一次展示已完成、进行中与尚未开始的条目。',
  states: [
    { title: '三种状态混合', element: <Checklist items={MIXED} /> },
    { title: '全部完成', element: <Checklist items={FINISHED} /> },
    { title: '空列表：自定义提示文案', element: <Checklist items={[]} emptyLabel="暂无内容" /> },
  ],
}

export default example
