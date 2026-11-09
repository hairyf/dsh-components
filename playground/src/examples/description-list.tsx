import type { DescriptionItem } from '@dsh-components'
import type { ComponentExample } from './kit'
import { DescriptionList } from '@dsh-components'

const BASIC: readonly DescriptionItem[] = [
  { key: 'name', label: '名称', value: '示例条目' },
  { key: 'size', label: '大小', value: '128 KB' },
  { key: 'created', label: '创建时间', value: '今天 09:30' },
  { key: 'updated', label: '更新时间', value: '今天 11:05' },
]

const TONES: readonly DescriptionItem[] = [
  {
    key: 'done',
    label: '已完成',
    value: '共 12 项',
    badge: '成功',
    tone: 'success',
  },
  {
    key: 'queue',
    label: '排队中',
    value: '共 3 项',
    badge: '等待',
    tone: 'info',
  },
  {
    key: 'confirm',
    label: '需确认',
    value: '共 1 项',
    badge: '提醒',
    tone: 'warning',
  },
  {
    key: 'failed',
    label: '已失败',
    value: '共 2 项',
    badge: '错误',
    tone: 'error',
  },
]

const example: ComponentExample = {
  name: 'description-list',
  group: 'layout',
  summary: '把标签与取值的成对信息排进带边框的列表，并可为取值附上带色调的徽标。',
  states: [
    { title: '基础字段对', element: <DescriptionList items={BASIC} /> },
    { title: '取值后的徽标与色调', element: <DescriptionList items={TONES} /> },
    { title: '两列排布', element: <DescriptionList items={BASIC} columns={2} /> },
    { title: '空列表：自定义提示文案', element: <DescriptionList items={[]} empty="暂无内容" /> },
  ],
}

export default example
