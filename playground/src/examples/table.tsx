import type { TableColumn, TableRow, TagTone } from '@dsh-components'
import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Button, Table, Tag } from '@dsh-components'
import { useEffect, useState } from 'react'
import { Column, Row } from './kit'

/** Palette of the status tag, by status text. */
const STATUS_TONES: Record<string, TagTone> = {
  已保存: 'success',
  处理中: 'info',
  待确认: 'neutral',
  失败: 'danger',
}

const COLUMNS: readonly TableColumn[] = [
  { key: 'name', header: '名称', width: 200 },
  {
    key: 'status',
    header: '状态',
    width: 96,
    render: row => (
      <Tag tone={STATUS_TONES[String(row.status)] ?? 'neutral'}>{String(row.status)}</Tag>
    ),
  },
  {
    key: 'size',
    header: '大小',
    width: 96,
    align: 'end',
  },
  {
    key: 'updated',
    header: '更新时间',
    width: 128,
    align: 'end',
  },
]

const ROWS: readonly TableRow[] = [
  {
    id: 'row-1',
    name: '示例条目甲',
    status: '已保存',
    size: '12.4 KB',
    updated: '03-02 09:12',
  },
  {
    id: 'row-2',
    name: '示例条目乙',
    status: '处理中',
    size: '8.1 KB',
    updated: '03-02 09:20',
  },
  {
    id: 'row-3',
    name: '示例条目丙',
    status: '已保存',
    size: '24.0 KB',
    updated: '03-01 18:45',
  },
  {
    id: 'row-4',
    name: '示例条目丁',
    status: '失败',
    size: '3.2 KB',
    updated: '03-01 16:02',
  },
  {
    id: 'row-5',
    name: '示例条目戊',
    status: '待确认',
    size: '41.7 KB',
    updated: '02-28 11:33',
  },
  {
    id: 'row-6',
    name: '示例条目己',
    status: '已保存',
    size: '6.6 KB',
    updated: '02-28 10:05',
  },
]

/** Rows appended by the load control, two at a time. */
const MORE_ROWS: readonly TableRow[] = [
  {
    id: 'row-7',
    name: '示例条目庚',
    status: '已保存',
    size: '15.9 KB',
    updated: '02-27 15:20',
  },
  {
    id: 'row-8',
    name: '示例条目辛',
    status: '处理中',
    size: '2.4 KB',
    updated: '02-27 14:08',
  },
  {
    id: 'row-9',
    name: '示例条目壬',
    status: '待确认',
    size: '33.1 KB',
    updated: '02-26 17:41',
  },
  {
    id: 'row-10',
    name: '示例条目癸',
    status: '失败',
    size: '0.8 KB',
    updated: '02-26 09:57',
  },
]

/**
 * A grid whose selected row is held here.
 * @returns the grid with a caption naming the selected record.
 */
function SelectableTable(): React.JSX.Element {
  const [selected, setSelected] = useState('row-2')
  const current = ROWS.find(row => row.id === selected)
  return (
    <Column>
      <span className="pg-note">
        {current === undefined
          ? '尚未选中'
          : `已选中：${String(current.name)}`}
      </span>
      <Table
        columns={COLUMNS}
        rows={ROWS}
        getRowKey={row => String(row.id)}
        selectedKey={selected}
        onRowSelect={(row) => {
          setSelected(String(row.id))
        }}
      />
    </Column>
  )
}

/**
 * A grid whose initial load runs until the button ends it.
 * @returns the grid with a button that starts and ends the load.
 */
function LoadingTable(): React.JSX.Element {
  const [loading, setLoading] = useState(true)
  return (
    <Column>
      <Row>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setLoading(value => !value)
          }}
        >
          {loading ? '结束加载' : '开始加载'}
        </Button>
        <span className="pg-note">{loading ? '正在加载，顶部显示加载条' : '加载已完成'}</span>
      </Row>
      <Table columns={COLUMNS} rows={ROWS.slice(0, 3)} loading={loading} />
    </Column>
  )
}

/**
 * A grid that appends two rows per load and reports the pending request.
 * @returns the grid with its load row.
 */
function LoadMoreTable(): React.JSX.Element {
  const [added, setAdded] = useState(0)
  const [pending, setPending] = useState(false)
  useEffect(() => {
    if (!pending)
      return undefined
    const timer = setTimeout(() => {
      setAdded(value => Math.min(value + 2, MORE_ROWS.length))
      setPending(false)
    }, 700)
    return () => {
      clearTimeout(timer)
    }
  }, [pending])
  const rows = [
    ...ROWS,
    ...MORE_ROWS.slice(0, added),
  ]
  return (
    <Column>
      <span className="pg-note">
        {pending
          ? '正在追加，按钮显示进行中'
          : `共 ${String(rows.length)} 条，可继续追加`}
      </span>
      <Table
        columns={COLUMNS}
        rows={rows}
        getRowKey={row => String(row.id)}
        loadingMore={pending}
        onLoadMore={() => {
          setPending(true)
        }}
      />
    </Column>
  )
}

const example: ComponentExample = {
  name: 'table',
  group: 'layout',
  summary: '带吸附表头的数据表格，行可点击选中，并提供空态、加载条与追加行。',
  states: [
    { title: '四列数据与行选中', element: <SelectableTable /> },
    {
      title: '空态：没有记录时显示提示文案',
      element: (
        <Column>
          <Table columns={COLUMNS} rows={[]} empty="暂无内容" />
        </Column>
      ),
    },
    { title: '加载中：顶部显示加载条', element: <LoadingTable /> },
    { title: '追加更多记录', element: <LoadMoreTable /> },
  ],
}

export default example
